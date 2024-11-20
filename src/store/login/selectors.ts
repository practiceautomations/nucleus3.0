import type { Selector } from 'reselect';
import { createSelector } from 'reselect';

import type { User } from '@/types/store/Login';

import type { AppState } from '../rootReducer';
import type { MenuItemType } from './types';

const getLoading = (state: AppState) => state.login.loading;

const getUser = (state: AppState) => state.login?.user;

const getUserError = (state: AppState) => state.login.error;

const getUserloginAttempts = (state: AppState) => state.login.loginAttempts;

const getMenuItems = (state: AppState) => state.login.menuItems;

const getUserEmail = (state: AppState) => state.login.email;

// const getSelectedMenuItem = (state: AppState) => state.login.selectedMenuItem;
export const getUserSelector: Selector<AppState, User | null> = createSelector(
  getUser,
  (user) => user
);

export const getLoadingSelector: Selector<AppState, boolean> = createSelector(
  getLoading,
  (pending) => pending
);

export const getEmailSelector: Selector<AppState, string> = createSelector(
  getUserEmail,
  (email) => email
);

export const getUserErrorSelector: Selector<AppState, string | null> =
  createSelector(getUserError, (error) => error);

export const getUserloginAttemptsSelector: Selector<AppState, number> =
  createSelector(getUserloginAttempts, (error) => error);

export const getMenuItemsSelector: Selector<AppState, MenuItemType[]> =
  createSelector(getMenuItems, (error) => error);
// export const getSelectedMenuItemSelector: Selector<
//   AppState,
//   MenuItemType | null
// > = createSelector(getSelectedMenuItem, (data) => data);
