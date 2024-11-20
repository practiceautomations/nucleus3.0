import { all, fork } from 'redux-saga/effects';

import chromeSaga from './chrome/sagas';
import loginSaga from './login/sagas';
import sharedSaga from './shared/sagas';

export function* rootSaga() {
  yield all([fork(chromeSaga), fork(loginSaga), fork(sharedSaga)]);
}
