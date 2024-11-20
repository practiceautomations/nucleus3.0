import type { AxiosResponse } from 'axios';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { v4 as uuidv4 } from 'uuid';

// eslint-disable-next-line import/no-cycle
import { httpClient } from '@/api/http-client';
import type { User } from '@/types/store/Login';
/* eslint-disable-next-line */
import { handleApiError, validateResponse } from '@/utils/apiHelpers';

/* eslint-disable-next-line */
import store from '..';
import { setWorkGroupSelected } from '../chrome/actions';
import {
  addToastNotification,
  expandSideMenuBar,
  removeToastNotification,
} from '../shared/actions';
import { ToastType } from '../shared/types';
import {
  loginAttempt,
  loginFailure,
  loginSuccess,
  logoutFailure,
  logoutSuccess,
} from './actions';
import { LOGIN_REQUEST, LOGOUT_REQUEST } from './actionTypes';
import type {
  LoginRequest,
  LoginRequestPayload,
  LogoutRequest,
  LogoutRequestPayload,
  LogoutSuccessPayload,
} from './types';

const login = (userData: LoginRequestPayload) =>
  httpClient.post<User>(`/Users/signIn`, { ...userData });

const logout = (data: LogoutRequestPayload) =>
  httpClient.post<any>(`/Users/userLogout/`, { ...data });
/*
  Worker Saga: Fired on LOGIN_REQUEST action
*/
function* loginRequestSaga({ payload }: LoginRequest) {
  yield put(
    loginFailure({
      error: null,
    })
  );
  try {
    const response: AxiosResponse<User> = yield call(login, payload);
    validateResponse(response);
    store.dispatch(expandSideMenuBar(true));
    yield put(
      loginSuccess({
        user: response.data,
      })
    );
  } catch (e: any) {
    const removeNotification = () => {
      const { toastNotifications } = store.getState().shared;
      toastNotifications.forEach((d) => {
        store.dispatch(removeToastNotification({ id: d.id }));
      });
    };
    // handle login attempts
    const loginAttempts = store.getState().login.loginAttempts + 1;
    yield put(loginAttempt(loginAttempts));
    if (loginAttempts === 3) {
      removeNotification();
      return;
    }
    // handle errors
    const message = !e.code ? e.message : handleApiError(e);
    yield put(
      loginFailure({
        error: message,
      })
    );
    // handle with error type and prevent toast notification
    if (
      typeof message === 'string' &&
      [
        'Maximum limits reached.',
        'This user is deactivate.',
        'Password has been expired.',
      ].includes(message)
    ) {
      removeNotification();
      return;
    }
    // handle toast notification
    yield put(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error on login',
        toastType: ToastType.ERROR,
      })
    );
  }
}

function* logoutRequestSaga({ payload }: LogoutRequest) {
  yield put(logoutSuccess());
  try {
    const response: AxiosResponse<LogoutSuccessPayload> = yield call(
      logout,
      payload
    );
    validateResponse(response);
    yield put(setWorkGroupSelected(null));
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    yield put(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error while logging out',
        toastType: ToastType.ERROR,
      })
    );
    yield put(
      logoutFailure({
        error: e.message,
      })
    );
  }
}
/*
  Starts worker saga on latest dispatched `LOGIN_REQUEST` action.
  Allows concurrent increments.
*/
function* loginSaga() {
  yield all([takeLatest(LOGIN_REQUEST, loginRequestSaga)]);
  yield all([takeLatest(LOGOUT_REQUEST, logoutRequestSaga)]);
}

export default loginSaga;
