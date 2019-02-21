import camelCase from 'lodash/camelCase';
import { createAction, handleActions } from 'redux-actions';
import { call, put, takeEvery } from 'redux-saga/effects';
import axios from 'axios';
import isFunction from 'lodash/isFunction';
import isArray from 'lodash/isArray';
import pathToRegexp from 'path-to-regexp';
import omit from 'object.omit';

function* request(data, opts) {
  const { type, payload } = data;
  const { method, config } = opts;
  let { url } = opts;
  const actionResult = createAction(`${type}_RES`);
  try {
    if (config.beforeAction) yield put(config.beforeAction);
    if (config.request && isFunction(config.request)) {
      const res = yield call(config.request, data);
      yield put(actionResult(res));
    } else {
      const keys = [];
      const omitKeys = [];
      try {
        pathToRegexp(url, keys);
        keys.forEach(key => omitKeys.push(key.name));
        const toPath = pathToRegexp.compile(url);
        url = toPath(payload);
      } catch (error) {
        console.error('url path-to-regexp throw');
      }
      const axiosConfig = { method };
      if (method === 'get') {
        axiosConfig.params = omit(payload, omitKeys);
      } else {
        axiosConfig.data = omit(payload, omitKeys);
      }
      const res = yield call(axios, url, axiosConfig);
      if (config.processResult && isFunction(config.processResult)) {
        yield put(actionResult(config.processResult(res)));
      } else {
        yield put(actionResult(res));
      }
    }
  } catch (error) {
    yield put(actionResult(error));
  } finally {
    if (config.afterAction) yield put(config.afterAction);
  }
}

class ReduxReqs {
  constructor(opts = {}) {
    this.opts = opts;
    this.actions = [];
    this.resultSufix = '_RES';
  }

  getReducers() {
    const reducers = {};
    const { namespace } = this.opts;
    this.actions.forEach(item => {
      const { type } = item;
      reducers[`${namespace}/${item.type}`] = state => ({
        ...state,
        [`${item.type}_FETCHING`]: true
      });
      if (item.config.useNamespace) {
        reducers[`${namespace}/${item.type}${this.resultSufix}`] = (
          state,
          action
        ) => {
          const { data } = action.payload;
          const key = `${namespace}${isArray(data) ? 's' : ''}`;
          return {
            ...state,
            [`${item.type}_FETCHING`]: false,
            [key]: data
          };
        };
      } else {
        reducers[`${namespace}/${item.type}${this.resultSufix}`] = (
          state,
          action
        ) => ({
          ...state,
          [`${item.type}_FETCHING`]: false,
          [camelCase(`${type}${this.resultSufix}`)]: action.payload
        });
      }
    });
    // const { namespace } = this.opts;
    // return handleActions(reducers, useNamespace ? { [`${namespace}s`]: [] } : this.opts.defaultState || {});
    return handleActions(reducers, this.opts.defaultState || {});
  }

  getWatchSaga(action) {
    const { namespace } = this.opts;
    return takeEvery(`${namespace}/${action.type}`, function* watch(data) {
      if (action.method === 'direct') {
        const actionResult = createAction(`${data.type}_RES`);
        yield put(actionResult(data.payload));
      } else {
        yield request(data, { ...ReduxReqs.defaults, ...action });
      }
    });
  }

  getWatchSagas = () => this.actions.map(action => this.getWatchSaga(action));

  getUrl = url => {
    const { prefixUrl, defaultUrl } = this.opts;
    if (
      url &&
      (url.indexOf('http://') !== -1 || url.indexOf('https://') !== -1)
    )
      return url;
    if (url) return `${prefixUrl || ''}${url}`;
    if (defaultUrl) return defaultUrl;
    return prefixUrl;
  };
}

// direct 不走axios请求
['get', 'put', 'post', 'patch', 'delete', 'direct'].forEach(method => {
  ReduxReqs.prototype[method] = function actionMethod(
    type,
    url = '',
    config = { useNamespace: false }
  ) {
    const action = { method, type, url: this.getUrl(url), config };

    this.actions.push(action);

    return this;
  };
});

// Alias for `router.delete()` because delete is a reserved word
ReduxReqs.prototype.del = ReduxReqs.prototype.delete;

ReduxReqs.defaults = {
  // handleActions: (self) => {
  //   return (state, action) => {
  //     console.log(state, action, self);
  //     return {
  //       ...state,
  //       isfetching: false,
  //       [camelCase(`${this.resultSufix}`)]: action.payload
  //     };
  //   }
  // }
};

export default ReduxReqs;
