import ReduxReqs from '../utils/ReduxReqs';

const reduxReqs = new ReduxReqs({
  namespace: 'base'
  // prefixUrl: '/project/:project/crawler/:id?',
});

reduxReqs.post('CHECK_SMS_CODE').post('SEND_SMS_CODE');

export default reduxReqs.getReducers();

export const watchSagas = reduxReqs.getWatchSagas();
