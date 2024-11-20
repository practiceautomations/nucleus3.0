import type { Selector } from 'reselect';
import { createSelector } from 'reselect';

import type { Notification } from '@/types/components/Notification';

import type { AppState } from '../rootReducer';
import type {
  AllFavoritesData,
  AllRecentTabData,
  GlobleSearchDropdownValue,
  OrganizationSearchDropdownData,
  OrganizationSelectorData,
  SearchSelectedItemType,
  WorkGroupsData,
  WorkGroupsResponseData,
  WorkGroupsSelected,
} from './types';

const getPending = (state: AppState) => state.chrome.pending;
const getNotifications = (state: AppState) => state.chrome.notifications;
const getError = (state: AppState) => state.chrome.error;
const getIsNewWorkgroupModalOpen = (state: AppState) =>
  state.chrome.isNewWorkgroupModalOpen;
const getOrganizationSelectorData = (state: AppState) =>
  state.chrome.organizationSelectorData;
const getWorkGroupData = (state: AppState) => state.chrome.workGroupData;
const getWorkGroupsSelectedData = (state: AppState) =>
  state.chrome.workGroupsResponseData;
const getSelectedWorkGroupIDsData = (state: AppState) =>
  state.chrome.workGroupsSelected;
const getCreateEditWorkGroupIsSuccessed = (state: AppState) =>
  state.chrome.createEditWorkgroupIsSucceeded;
const getAllFavortitesData = (state: AppState) => state.chrome.allFavoritesData;
const getAllTabSearchData = (state: AppState) =>
  state.chrome.organizationSearchDropdownData;
const getSearchSelectedItem = (state: AppState) =>
  state.chrome.searchSelectedItemType;
const getAllRecentTabData = (state: AppState) => state.chrome.allRecentTabData;
const getGlobleSearchDropdownValue = (state: AppState) =>
  state.chrome.globleSearchDropdownVal;

export const getNotificationsSelector: Selector<AppState, Notification[]> =
  createSelector(getNotifications, (notifications) => notifications);

export const getPendingSelector: Selector = createSelector(
  getPending,
  (pending) => pending
);

export const getErrorSelector: Selector = createSelector(
  getError,
  (error) => error
);

export const getIsNewWorkgroupModalOpenSelector: Selector<AppState, boolean> =
  createSelector(getIsNewWorkgroupModalOpen, (error) => error);

export const getOrganizationSelectorDataSelector: Selector<
  AppState,
  OrganizationSelectorData | null
> = createSelector(getOrganizationSelectorData, (data) => data);

export const getWorkGroupDataSelector: Selector<
  AppState,
  WorkGroupsData[] | null
> = createSelector(getWorkGroupData, (data) => data);

export const getWorkGroupSelectedDataSelector: Selector<
  AppState,
  WorkGroupsResponseData | null
> = createSelector(getWorkGroupsSelectedData, (data) => data);

export const getselectdWorkGroupsIDsSelector: Selector<
  AppState,
  WorkGroupsSelected | null
> = createSelector(getSelectedWorkGroupIDsData, (data) => data);

export const getCreateEditWorkGroupIsSuccessedselector: Selector =
  createSelector(getCreateEditWorkGroupIsSuccessed, (value) => value);

export const getAllFavortitesDataSelector: Selector<
  AppState,
  AllFavoritesData | null
> = createSelector(getAllFavortitesData, (data) => data);

export const getAllTabSaerchDataSelector: Selector<
  AppState,
  OrganizationSearchDropdownData | null
> = createSelector(getAllTabSearchData, (data) => data);

export const getSearchSelectedItemSelector: Selector<
  AppState,
  SearchSelectedItemType | null
> = createSelector(getSearchSelectedItem, (data) => data);

export const getAllRecentTabDataSelector: Selector<
  AppState,
  AllRecentTabData[] | null
> = createSelector(getAllRecentTabData, (data) => data);

export const getGlobleSearchDropdownValueSelector: Selector<
  AppState,
  GlobleSearchDropdownValue | null
> = createSelector(getGlobleSearchDropdownValue, (data) => data);
