import type { User, UserWithToken } from '@/types/store/Login';

import type {
  LOGIN_ATTEMPTS,
  LOGIN_FAILURE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGOUT_FAILURE,
  LOGOUT_REQUEST,
  LOGOUT_SUCCESS,
} from './actionTypes';

export interface LoginState {
  loading: boolean;
  user: User | null;
  error: string | null;
  email: string;
  loginAttempts: number;
  menuItems: MenuItemType[];
  // selectedMenuItem: MenuItemType | null;
}

export type MenuItemType = {
  title: string;
  icon?: string;
  link?: string;
  order?: number;
  children?: MenuItemType[];
};

export interface LoginSuccessPayload {
  user: UserWithToken;
}

export interface LogoutSuccessPayload {
  message: string;
}

export interface LogoutRequestPayload {
  loginAuditID: number;
}

export interface LoginRequestPayload {
  email: string;
  password: string;
}

export interface LoginFailurePayload {
  error: string | null;
}

export interface LogoutFailurePayload {
  error: string;
}

export interface LoginRequest {
  type: typeof LOGIN_REQUEST;
  payload: LoginRequestPayload;
}

export interface LogoutRequest {
  type: typeof LOGOUT_REQUEST;
  payload: LogoutRequestPayload;
}

export type LoginSuccess = {
  type: typeof LOGIN_SUCCESS;
  payload: LoginSuccessPayload;
};

export type LoginFailure = {
  type: typeof LOGIN_FAILURE;
  payload: LoginFailurePayload;
};

export type LoginAttempt = {
  type: typeof LOGIN_ATTEMPTS;
  payload: number;
};

export type LogoutFailure = {
  type: typeof LOGOUT_FAILURE;
  payload: LogoutFailurePayload;
};

export type LogoutSuccess = {
  type: typeof LOGOUT_SUCCESS;
};
// export type SelectedMenuItemData = {
//   type: typeof SELECTED_SIDEBAR_MENU_ITEM;
//   payload: MenuItemType | null;
// };
export type LoginActions =
  | LoginRequest
  | LoginSuccess
  | LoginFailure
  | LogoutRequest
  | LoginAttempt
  | LogoutSuccess;
// | SelectedMenuItemData;
