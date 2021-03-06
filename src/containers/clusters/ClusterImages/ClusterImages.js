import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {DockTable, Chain, StatisticsPanel, NavContainer} from '../../../components/index';
import {Link, RouteHandler} from 'react-router';
import {getDeployedImages} from 'redux/modules/images/images';
import {updateContainers} from 'redux/modules/containers/containers';
import {FormGroup, InputGroup, FormControl, ControlLabel, Button, ProgressBar, Popover, Modal, OverlayTrigger} from 'react-bootstrap';
import _ from 'lodash';
import Select from 'react-select';

let clusterImagesMounted = null;

@connect(
  state => ({
    clusters: state.clusters,
    containers: state.containers,
    events: state.events,
    images: state.images
  }), {getDeployedImages, updateContainers})
export default class ClusterImages extends Component {
  static propTypes = {
    clusters: PropTypes.object,
    containers: PropTypes.object,
    events: PropTypes.object,
    images: PropTypes.object,
    params: PropTypes.object,
    getDeployedImages: PropTypes.func.isRequired,
    updateContainers: PropTypes.func.isRequired
  };

  COLUMNS = [
    {
      name: 'select',
      width: '1%',
      render: this.checkRender.bind(this)
    },

    {
      name: 'name',
      width: '24%'
    },

    {
      name: 'Current Tag',
      width: '15%',
      render: this.currentTagRender
    },

    {
      name: 'containers',
      render: this.containersRender,
      width: '45%'
    },

    {
      name: 'tags',
      render: this.tagsRender.bind(this),
      width: '15%'
    },

  ];

  UPDATE_STRATEGIES = [
    {
      value: "ui.updateContainers.stopThenStartEach",
      label: "Stop then start each"
    },
    {
      value: "ui.updateContainers.startThenStopEach",
      label: "Start then stop each"
    },
    {
      value: "ui.updateContainers.stopThenStartAll",
      label: "Stop then start all"
    }
  ];

  statisticsMetrics = [
    {
      type: 'number',
      title: 'Image Running',
      titles: 'Images Running'
    }
  ];

  componentWillMount() {
    require('./ClusterImages.scss');
    this.state = {
      tagsSelected: {},
      imagesToUpdate: {},
      showModal: false,
      updateStrategy: this.UPDATE_STRATEGIES[0].value,
      updatePercents: 100,
      updateResponse: {message: "", status: ""},
      schedule: '',
      jobTitle: '',
      wildCard: false,
      wildCardImages: '',
      wildCardVersion: ''
    };
  }

  componentDidMount() {
    const {getDeployedImages, params: {name}} = this.props;
    clusterImagesMounted = true;
    getDeployedImages(name).then(() => {
      const {deployedImages} = this.props.images;
      const clustersImages = _.get(deployedImages, name, []);
      clustersImages.map(el => {
        if (el.name) {
          let key = el.registry.trim().length > 0 ? el.registry + '/' + el.name : el.name;
          let tags = _.get(el, 'tags', []);
          let lastTag = tags[tags.length - 1];
          if (clusterImagesMounted) {
            this.setState({
              tagsSelected: {
                ...this.state.tagsSelected,
                [key]: lastTag
              }
            });
          }
        }
      });
    });
  }

  componentWillUnmount() {
    clusterImagesMounted = false;
  }

  containersRender(row) {
    let chainContainers = row.containers;
    let popoverRender = (el) => (
      <Popover id={el.id}>
        <span>Node: {shortenName(el.node) || ''}</span>
        <br></br>
        <span>Id: {shortenName(el.id) || ''}</span>
      </Popover>
    );

    return (
      <td key="containers">
        <Chain data={chainContainers}
               popoverPlacement="top"
               popoverRender={popoverRender}
               render={(container) => (<span title={String(container.name) || ""}>{String(container.name) || ""}</span>)}
        />
      </td>
    );
  }

  currentTagRender(row) {
    let currentTag = _.get(row, 'currentTag', '');
    return (
      <td key="currentTag">
        <span>{currentTag}</span>
      </td>
    );
  }

  tagsRender(row) {
    let tagsOptions;
    const key = row.registry.trim().length > 0 ? row.registry + '/' + row.name : row.name;
    tagsOptions = row.tags && row.tags.map(tag => {
      return {value: tag, label: tag};
    });
    let disabled = !tagsOptions || tagsOptions.length === 0;
    return (
      <td key="tags" className="react-select-td" title={disabled ? "No tags available" : ""}>
        <Select value={this.state.tagsSelected[key]}
                options={tagsOptions}
                placeholder = ""
                disabled={disabled}
                clearable={false}
                searchable
                onChange={handleChange.bind(this, key)}
        />
      </td>
    );
    function handleChange(id, event) {
      let value = event.target ? event.target.value : event.value;
      this.setState({
        tagsSelected: {
          ...this.state.tagsSelected,
          [id]: value
        }
      });
    }
  }

  closeModal() {
    this.setState({ showModal: false });
  }

  openModal() {
    this.setState({ showModal: true });
  }

  checkRender(row) {
    const popoverTop = (
      <Popover id={"pop" + row.name}>
        <strong>Update available!</strong>
      </Popover>
    );
    let checkBoxName = row.registry.trim().length > 0 ? row.registry + '/' + row.name : row.name;
    return (
      <td key="select" className="checkbox-td">
        <OverlayTrigger trigger={checkUpdateAvailability(row) ? ['hover', 'focus'] : []} placement="right" overlay={popoverTop}>
          <div className="select-update-block">
            <input type="checkbox"
                   key={checkBoxName}
                   className="checkbox-control"
                   defaultChecked={false}
                   disabled={!row.name}
                   checked={this.state.imagesToUpdate[checkBoxName]}
                   name={checkBoxName}
                   onChange={this.toggleCheckbox.bind(this)}
            />
          </div>
        </OverlayTrigger>
      </td>

    );
  }

  toggleCheckbox(e) {
    let checked = e.target.checked;
    let name = e.target.name;
    this.setState({
      imagesToUpdate: {...this.state.imagesToUpdate, [name]: checked}
    });
  }

  handleWildcardChange() {
    let $updateBlock = $("#clusterImages");
    $updateBlock.toggleClass('no-header-panel');
    this.setState({
      wildCard: !this.state.wildCard
    });
  }

  handleSelectChange(id, event) {
    let value = event.target ? event.target.value : event.value;
    if (id === 'updatePercents') {
      if (value > 100) {
        value = 100;
      }
      if (value < 0) {
        value = 10;
      }
    }
    this.setState({
      [id]: value
    });
  }

  handlePercentsChange(id, event) {
    this.setState({
      updatePercents: id
    });
  }

  generateJobTitle(title, wildCard, imagesToUpdate = []) {
    let resultTitle = title;
    if (title === '') {
      resultTitle = 'Update_';
      switch (wildCard) {
        case true:
          resultTitle += this.state.wildCardImages + '_' + this.state.wildCardVersion + '_';
          break;
        case false:
          _.map(imagesToUpdate, (el, key) => {
            if (imagesToUpdate[key]) {
              resultTitle += imagesToUpdate[key].name + '_';
            }
          });
          break;
        default:
          break;
      }
      resultTitle += Math.floor(Date.now() / 1000);
    }
    return resultTitle;
  }

  onSubmit() {
    let images = [];
    let imagesToUpdate = this.state.imagesToUpdate;
    let tags = this.state.tagsSelected;
    let strategy = this.state.updateStrategy;
    let wildCard = this.state.wildCard;
    let title = '';

    if (wildCard) {
      images.push({name: this.state.wildCardImages, to: this.state.wildCardVersion});
      title = this.generateJobTitle(title, true);
      this.safeUpdateContainers(strategy, this.state.updatePercents, this.state.schedule, title, images);
    } else {
      _.map(imagesToUpdate, (el, key) => {
        let updateTo = tags[key];
        if (key && el && updateTo) {
          images.push({name: key, to: updateTo});
        }
      });
      title = this.generateJobTitle(this.state.jobTitle, false, images);
      if (images.length > 0) {
        this.safeUpdateContainers(strategy, this.state.updatePercents, this.state.schedule, title, images);
      } else {
        this.setState({updateResponse: {message: 'Select tags for chosen images to create update job.'}});
        this.openModal();
      }
    }
  }

  safeUpdateContainers(strategy, updatePercents, schedule, jobTitle, images) {
    const {params: {name}, updateContainers} = this.props;
    updateContainers(name, strategy, updatePercents, schedule, jobTitle, images).then((response)=> {
      this.showResponse(response);
      this.setState({imagesToUpdate: {}});
    }).catch((response) => {
      this.showResponse(response);
    });
  }

  showResponse(response) {
    let message = 'Error';
    let status = '';
    status = response.code || response._res.status || response._res.code;
    if (status) {
      switch (status) {
        case 200:
          //full message for status "200" filled in modal's body
          message = response.id;
          break;
        default:
          message = 'Failed to create the Update job. Error message is: ' + response.message || response._res.message;
      }
    }
    this.setState({updateResponse: {message: message, status: status}});
    this.openModal();
  }

  render() {
    let $searchInput = $('.input-search')[0];
    $($searchInput).addClass('pseudo-label');
    require('react-select/dist/react-select.css');
    const {params: {name}, images} = this.props;
    const wildCard = this.state.wildCard;
    let rows = _.get(this.props.images, `deployedImages.${name}`, []).map((row)=> {
      if (checkUpdateAvailability(row)) {
        row.trColor = 'availableToUpdate';
      }
      return row;
    });
    const imagesToUpdate = this.state.imagesToUpdate;
    let disabledUpdateButton = true;
    if (wildCard) {
      disabledUpdateButton = !(this.state.wildCardImages && this.state.wildCardVersion);
    } else {
      _.map(imagesToUpdate, (el, key) => {
        if (imagesToUpdate[key]) {
          disabledUpdateButton = false;
          return false;
        }
      });
    }

    return (
      <div key={name}>
        {rows && (
          <StatisticsPanel metrics={this.statisticsMetrics}
                           values={[rows.length]}
          />
        )}
        <div className="panel panel-default">
          {(images.loadingDeployed && rows.length === 0) && (
            <ProgressBar active now={100}/>
          ) || (
            <div>
              <NavContainer clusterName={name}/>
              <div id="clusterImages">
                <form>
                  <div className="col-md-6">
                    <FormGroup>
                      <ControlLabel>Update Strategy</ControlLabel>
                      <FormControl componentClass="select" id="updateStrategy" value={this.state.updateStrategy}
                                   onChange={this.handleSelectChange.bind(this, 'updateStrategy')}>
                        {
                          this.UPDATE_STRATEGIES.map((el, i) => {
                            return <option key={i} value={el.value}>{el.label}</option>;
                          })
                        }
                      </FormControl>
                    </FormGroup>
                    <FormGroup>
                      <ControlLabel>Schedule</ControlLabel>
                      <FormControl type="text" onChange={this.handleSelectChange.bind(this, 'schedule')}
                                   placeholder="'0 0 * * * *' = the top of every hour of every day"/>
                    </FormGroup>
                  </div>
                  <div className="col-md-6">
                    <div className="row">
                      <div className="col-md-6">
                        <FormGroup>
                          <ControlLabel>Job Title</ControlLabel>
                          <FormControl type="text" onChange={this.handleSelectChange.bind(this, 'jobTitle')}/>
                        </FormGroup>
                      </div>
                      <div className="col-md-6">
                        <FormGroup>
                          <Button active={wildCard} bsStyle={wildCard ? "primary" : "default"}
                                  className="pulled-down-button"
                                  onClick={this.handleWildcardChange.bind(this)}>
                            Wildcard
                          </Button>
                          <Button bsStyle="primary" onClick={this.onSubmit.bind(this)}
                                  disabled={disabledUpdateButton}
                                  className="pulled-down-button pulled-right"
                                  title={disabledUpdateButton ? "Choose containers to update" : ""}>
                            <i className="fa fa-arrow-up"/>&nbsp;Update Containers
                          </Button>
                        </FormGroup>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <FormGroup>
                          <label>Percentage of Containers to Update:</label>
                          <InputGroup>
                            <FormControl type="number" step="10" max="100" min="10" id="updatePercents"
                                         value={this.state.updatePercents}
                                         onChange={this.handleSelectChange.bind(this, 'updatePercents')}/>
                            <InputGroup.Addon>%</InputGroup.Addon>
                          </InputGroup>
                        </FormGroup>
                      </div>
                      <div className="col-ms-6">
                        <FormGroup>
                          <Button className="pulled-down-button pseudo-label"
                                  onClick={this.handlePercentsChange.bind(this, '30')}>
                            30%
                          </Button>&nbsp;
                          <Button className="pulled-down-button"
                                  onClick={this.handlePercentsChange.bind(this, '40')}>
                            40%
                          </Button>&nbsp;
                          <Button className="pulled-down-button"
                                  onClick={this.handlePercentsChange.bind(this, '50')}>
                            50%
                          </Button>
                        </FormGroup>
                      </div>
                    </div>
                  </div>
                </form>
                {!wildCard && (
                  <DockTable columns={this.COLUMNS}
                             rows={rows}
                             key={name}
                  />
                ) || (
                  <div>
                    <div className="col-md-6">
                      <FormGroup required>
                        <ControlLabel>Wildcard Images</ControlLabel>
                        <FormControl type="text" onChange={this.handleSelectChange.bind(this, 'wildCardImages')}
                                     value={this.state.wildCardImages}
                                     placeholder="ni1.codeabolab.com/*"/>
                      </FormGroup>
                    </div>
                    <div className="col-md-6">
                      <FormGroup required>
                        <ControlLabel>Wildcard Target Version</ControlLabel>
                        <FormControl type="text" onChange={this.handleSelectChange.bind(this, 'wildCardVersion')}
                                     placeholder="*latest"
                                     value={this.state.wildCardVersion}/>
                      </FormGroup>
                    </div>
                    &nbsp;
                  </div>
                )}
              </div>
            </div>
          )}

          {(rows.length === 0 && !images.loadingDeployed) && (
            <div className="alert alert-info">
              No images yet
            </div>
          )}
        </div>
        <Modal show={this.state.showModal} onHide={this.closeModal.bind(this)}>
          <Modal.Header closeButton>
            <Modal.Title>Update Info</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.state.updateResponse.status === 200 && (
              <p>The Update job is successfully created. Please check the&nbsp;
                <Link to={"/jobs/" + this.state.updateResponse.message}>Jobs page</Link> for its status.
              </p>
            ) || (
              <p>{this.state.updateResponse.message}</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.closeModal.bind(this)}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

function shortenName(name) {
  let result = String(name);
  const MAX_LENGTH = 25;
  if (name.length > MAX_LENGTH) {
    result = name.substr(0, MAX_LENGTH) + '...';
  }
  return result;
}

function checkUpdateAvailability(row) {
  let tags = _.get(row, 'tags', []);
  let lastTag = tags[tags.length - 1];
  return lastTag && lastTag !== row.currentTag ? true : false;
}
