import { all } from 'redux-saga/effects';
import { watchSagas as base } from './base';

export default function* rootSaga() {
  yield all([...base]);
}
