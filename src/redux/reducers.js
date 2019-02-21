import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import base from './base';

export default history =>
  combineReducers({
    router: connectRouter(history),
    base
  });
