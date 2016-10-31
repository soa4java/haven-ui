const _ACTIONS = {
  CREATE: 'CREATE',
  CREATE_SUCCESS: 'CREATE_SUCCESS',
  CREATE_FAIL: 'CREATE_FAIL',
  LOAD_DETAILS: 'LOAD_DETAILS',
  LOAD_DETAILS_SUCCESS: 'LOAD_DETAILS_SUCCESS',
  LOAD_DETAILS_FAIL: 'LOAD_DETAILS_FAIL',
  LOAD_LOGS: 'LOAD_LOGS',
  LOAD_LOGS_SUCCESS: 'LOAD_LOGS_SUCCESS',
  LOAD_LOGS_FAIL: 'LOAD_LOGS_FAIL',
  LOAD_STATISTICS: 'LOAD_STATISTICS',
  LOAD_STATISTICS_SUCCESS: 'LOAD_STATISTICS_SUCCESS',
  LOAD_STATISTICS_FAIL: 'LOAD_STATISTICS_FAIL',
  REMOVE: 'REMOVE',
  REMOVE_SUCCESS: 'REMOVE_SUCCESS',
  REMOVE_FAIL: 'REMOVE_FAIL',
  RESTART: 'RESTART',
  RESTART_SUCCESS: 'RESTART_SUCCESS',
  RESTART_FAIL: 'RESTART_FAIL',
  SCALE: 'SCALE',
  SCALE_SUCCESS: 'SCALE_SUCCESS',
  SCALE_FAIL: 'SCALE_FAIL',
  START: 'START',
  START_SUCCESS: 'START_SUCCESS',
  START_FAIL: 'START_FAIL',
  STOP: 'STOP',
  STOP_SUCCESS: 'STOP_SUCCESS',
  STOP_FAIL: 'STOP_FAIL',
  UPDATE_CONTAINER: 'UPDATE_CONTAINER',
  UPDATE_CONTAINER_SUCCESS: 'UPDATE_CONTAINER_SUCCESS',
  UPDATE_CONTAINER_FAIL: 'UPDATE_CONTAINER_FAIL',
  LOAD_DETAILS_BY_NAME: 'LOAD_DETAILS_BY_NAME',
  LOAD_DETAILS_BY_NAME_SUCCESS: 'LOAD_DETAILS_BY_NAME_SUCCESS',
  LOAD_DETAILS_BY_NAME_FAIL: 'LOAD_DETAILS_BY_NAME_FAIL'
};

Object.keys(_ACTIONS).forEach((key) => {
  _ACTIONS[key] = 'containers/' + _ACTIONS[key];
});
export const ACTIONS = _ACTIONS;
