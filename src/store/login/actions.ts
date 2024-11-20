import {
  LOGIN_ATTEMPTS,
  LOGIN_FAILURE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGOUT_FAILURE,
  LOGOUT_REQUEST,
  LOGOUT_SUCCESS,
} from './actionTypes';
import type {
  LoginAttempt,
  LoginFailure,
  LoginFailurePayload,
  LoginRequest,
  LoginRequestPayload,
  LoginSuccess,
  LoginSuccessPayload,
  LogoutFailure,
  LogoutFailurePayload,
  LogoutRequest,
  LogoutRequestPayload,
  LogoutSuccess,
} from './types';

export const loginRequest = (payload: LoginRequestPayload): LoginRequest => ({
  type: LOGIN_REQUEST,
  payload,
});

export const logoutRequest = (
  payload: LogoutRequestPayload
): LogoutRequest => ({
  type: LOGOUT_REQUEST,
  payload,
});

export const logoutSuccess = (): LogoutSuccess => ({
  type: LOGOUT_SUCCESS,
});

export const logoutFailure = (
  payload: LogoutFailurePayload
): LogoutFailure => ({
  type: LOGOUT_FAILURE,
  payload,
});

export const loginSuccess = (payload: LoginSuccessPayload): LoginSuccess => ({
  type: LOGIN_SUCCESS,
  payload,
});

export const loginFailure = (payload: LoginFailurePayload): LoginFailure => ({
  type: LOGIN_FAILURE,
  payload,
});

export const loginAttempt = (payload: number): LoginAttempt => ({
  type: LOGIN_ATTEMPTS,
  payload,
});
// export const selectedMenuItemData = (
//   payload: MenuItemType
// ): SelectedMenuItemData => ({
//   type: SELECTED_SIDEBAR_MENU_ITEM,
//   payload,
// });
