const _ACTIONS = {
  LIST: 'LIST',
  LIST_SUCCESS: 'LIST_SUCCESS',
  LIST_FAIL: 'LIST_FAIL',
  DELETE: 'DELETE',
  DELETE_SUCCESS: 'DELETE_SUCCESS',
  DELETE_FAIL: 'DELETE_FAIL',
  LOAD: 'LOAD',
  LOAD_SUCCESS: 'LOAD_SUCCESS',
  LOAD_FAIL: 'LOAD_FAIL',
  ADD: 'ADD',
  ADD_SUCCESS: 'ADD_SUCCESS',
  ADD_FAIL: 'ADD_FAIL',
  GET_COMPOSE: 'GET_COMPOSE',
  GET_COMPOSE_SUCCESS: 'GET_COMPOSE_SUCCESS',
  GET_COMPOSE_FAIL: 'GET_COMPOSE_FAIL',
  UPLOAD_STREAM: 'UPLOAD_STREAM',
  UPLOAD_STREAM_SUCCESS: 'UPLOAD_STREAM_SUCCESS',
  UPLOAD_STREAM_FAIL: 'UPLOAD_STREAM_FAIL',
  UPLOAD_FILE: 'UPLOAD_FILE',
  UPLOAD_FILE_SUCCESS: 'UPLOAD_FILE_SUCCESS',
  UPLOAD_FILE_FAIL: 'UPLOAD_FILE_FAIL',
  GET_INIT_FILE: 'GET_INIT_FILE',
  GET_INIT_FILE_SUCCESS: 'GET_INIT_FILE_SUCCESS',
  GET_INIT_FILE_FAIL: 'GET_INIT_FILE_FAIL',
  START: 'START',
  START_SUCCESS: 'START_SUCCESS',
  START_FAIL: 'START_FAIL',
  STOP: 'STOP',
  STOP_SUCCESS: 'STOP_SUCCESS',
  STOP_FAIL: 'STOP_FAIL'
};

Object.keys(_ACTIONS).forEach((key) => {
  _ACTIONS[key] = 'application/' + _ACTIONS[key];
});
export const ACTIONS = _ACTIONS;
