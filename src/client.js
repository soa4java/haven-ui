/**
 * THIS IS THE ENTRY POINT FOR THE CLIENT, JUST LIKE server.js IS THE ENTRY POINT FOR THE SERVER.
 */
import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import createStore from './redux/create';
import ApiClient from './helpers/ApiClient';
import io from 'socket.io-client';
import {Provider} from 'react-redux';
import { Router, browserHistory } from 'react-router';
import { ReduxAsyncConnect } from 'redux-async-connect';
import useScroll from 'scroll-behavior/lib/useStandardScroll';
import {loadFromLS as loadAuth} from 'redux/modules/auth/auth';
import {loadFromLS as loadMenuLeft} from 'redux/modules/menuLeft/menuLeft';
import {ConfirmDialog, SimpleModal} from './components/index';

import getRoutes from './routes';

const client = new ApiClient();
const history = useScroll(() => browserHistory)();
const dest = document.getElementById('content');
const store = createStore(history, client, window.__data);
client.setStore(store);

const component = (
  <Router render={(props) =>
        <ReduxAsyncConnect {...props} helpers={{client}} filter={item => !item.deferred} />
      } history={history}>
    {getRoutes(store)}
  </Router>
);

ReactDOM.render(
  <Provider store={store} key="provider">
    {component}
  </Provider>,
  dest
);

if (process.env.NODE_ENV !== 'production') {
  window.React = React; // enable debugger

  if (!dest || !dest.firstChild || !dest.firstChild.attributes || !dest.firstChild.attributes['data-react-checksum']) {
    console.error('Server-side React render was discarded. Make sure that your initial render does not contain any client-side code.');
  }
}

if (__DEVTOOLS__ && !window.devToolsExtension) {
  const DevTools = require('./containers/DevTools/DevTools');
  ReactDOM.render(
    <Provider store={store} key="provider">
      <div>
        {component}
        <DevTools />
      </div>
    </Provider>,
    dest
  );
}

store.dispatch(loadAuth());
store.dispatch(loadMenuLeft());

(() => {
  window.confirm = (message, options = {}) => {
    if (document.getElementById('confirm')) {
      return Promise.reject();
    }

    let props = $.extend({message: message}, options);
    let wrapper = document.body.appendChild(document.createElement('div'));
    let component = ReactDOM.render(React.createElement(ConfirmDialog, props), wrapper);

    function cleanup() {
      ReactDOM.unmountComponentAtNode(wrapper);
      setTimeout(() => wrapper.remove());
    }

    component.promise.then(cleanup, cleanup);
    return component.promise;
  };

  SimpleModal.initJs(store);
})();

