import type { Notification } from '@/types/components/Notification';

import type { GroupData } from '../shared/types';
import type {
  ADD_FAVORITES_FAILURE,
  CREATE_NEW_WORKGROUP_FAILURE,
  CREATE_NEW_WORKGROUP_REQUEST,
  CREATE_NEW_WORKGROUP_SUCCESS,
  DELETE_WORKGROUP_FAILURE,
  DELETE_WORKGROUP_SUCCESS,
  EDIT_WORKGROUP_FAILURE,
  EDIT_WORKGROUP_REQUEST,
  EDIT_WORKGROUP_SUCCESS,
  FETCH_NOTIFICATION_FAILURE,
  FETCH_NOTIFICATION_REQUEST,
  FETCH_NOTIFICATION_SUCCESS,
  GET_FAVORITIES_SUCCESS,
  GET_ORGANIZATION_SELECTOR_DATA_FAILURE,
  GET_ORGANIZATION_SELECTOR_DATA_REQUEST,
  GET_ORGANIZATION_SELECTOR_DATA_SUCCESS,
  GET_RECENT_TAB_ALL_DATA,
  GET_SEARCH_ORGANIZATION_DATA,
  GET_WORKGROUPS_DATA_FAILURE,
  GET_WORKGROUPS_DATA_REQUEST,
  GET_WORKGROUPS_DATA_SUCCESS,
  GET_WORKGROUPS_SELECTED_DATA_FAILURE,
  GET_WORKGROUPS_SELECTED_DATA_REQUEST,
  GET_WORKGROUPS_SELECTED_DATA_SUCCESS,
  GLOBLE_SEARCH_DROPDOWN_VALUE,
  RENAME_WORKGROUP_FAILURE,
  RENAME_WORKGROUP_REQUEST,
  RENAME_WORKGROUP_SUCCESS,
  SET_CREATE_EDIT_WORKGROUP_IS_SUCCESSED,
  SET_SEARCH_SELECTED_ITEMS,
  SET_USER_WORKGROUPS_SELECTED,
  SET_WORKGROUP_SELECT_RESPONSE_DATA,
  TOGGLE_NEW_WORKGROUP_MODAL,
  UN_FAVORITE_FAILURE,
} from './actionTypes';

export interface OrganizationSelectorData {
  groups: Group[];
  practices: Practice[];
  providers: Provider[];
  workGroups: WorkGroup[];
  facilities: Facility[];
  favorites: Favorites;
}

export interface Group {
  value: string;
  einNumber: number;
  id: number;
  practices: number[];
  providers: number[];
  workGroups: number[];
}

export interface Practice {
  address: string;
  value: string;
  einNumber: number;
  id: number;
  facilities: number[];
  workGroups: number[];
}

export interface Provider {
  value: string;
  providerNPI: number;
  id: number;
  workGroups: number[];
}

export interface WorkGroup {
  value: string;
  id: number;
}

export interface Facility {
  address: string;
  value: string;
  placeOfServiceDescription: string;
  id: number;
  placeOfServiceCode: number;
  workGroups: number[];
}

export interface Favorites {
  groups?: number[];
  practices?: number[];
  facilities?: number[];
  providers?: number[];
}

export interface ChromeState {
  pending: boolean;
  notifications: Notification[];
  // Todo: add proper typing
  workgroups: any[];
  error: string | null;
  isNewWorkgroupModalOpen: boolean;
  organizationSelectorData: OrganizationSelectorData;
  workGroupData: WorkGroupsData[];
  workGroupsResponseData: WorkGroupsResponseData | null;
  workGroupsSelected: WorkGroupsSelected | null;
  createEditWorkgroupIsSucceeded: boolean | null;
  allFavoritesData: AllFavoritesData | null;
  organizationSearchDropdownData: OrganizationSearchDropdownData | null;
  searchSelectedItemType: SearchSelectedItemType | null;
  allRecentTabData: AllRecentTabData[];
  globleSearchDropdownVal: GlobleSearchDropdownValue | null;
}

export type NewWorkgroupData = {
  name: string;
  providers: number[];
  practices: number[];
  groups: number[];
  facilities: number[];
};

export type NewWorkgroupSuccessData = NewWorkgroupData & {
  id: string;
};

export interface FetchNotificationSuccessPayload {
  notifications: Notification[];
}

export interface FailurePayload {
  error: string;
}

export interface FetchNotificationRequest {
  type: typeof FETCH_NOTIFICATION_REQUEST;
}

export interface FetchNotificationSuccess {
  type: typeof FETCH_NOTIFICATION_SUCCESS;
  payload: FetchNotificationSuccessPayload;
}

export interface FetchNotificationFailure {
  type: typeof FETCH_NOTIFICATION_FAILURE;
  payload: FailurePayload;
}

export interface ToggleNewWorkgroupModal {
  type: typeof TOGGLE_NEW_WORKGROUP_MODAL;
}

export interface GetOrganizationSelectorDataRequest {
  type: typeof GET_ORGANIZATION_SELECTOR_DATA_REQUEST;
}

export interface GetOrganizationSelectorDataSuccess {
  type: typeof GET_ORGANIZATION_SELECTOR_DATA_SUCCESS;
  payload: OrganizationSelectorData;
}

export interface GetOrganizationSelectorDataFailure {
  type: typeof GET_ORGANIZATION_SELECTOR_DATA_FAILURE;
  payload: FailurePayload;
}

export interface NewWorkGroupRequestPayload {
  workgroup: NewWorkgroupData;
}

export interface NewWorkGroupSuccessPayload {
  workgroup: NewWorkgroupSuccessData;
}

export interface CreateNewWorkGroupRequest {
  type: typeof CREATE_NEW_WORKGROUP_REQUEST;
  payload: NewWorkGroupRequestPayload;
}

export interface CreateNewWorkGroupSuccess {
  type: typeof CREATE_NEW_WORKGROUP_SUCCESS;
  payload: NewWorkGroupSuccessPayload;
}

export interface CreateNewWorkGroupFailure {
  type: typeof CREATE_NEW_WORKGROUP_FAILURE;
  payload: FailurePayload;
}

export interface WorkGroupsData {
  id: number | null;
  value: string | null;
  type?: string;
}

export interface WorkGroupsResponseData {
  groupsData: GroupsData[];
  practicesData: PracticesData[];
  facilitiesData: FacilitiesData[];
  providersData: ProvidersData[];
}

export type GetWorkGroupsDataRequest = {
  type: typeof GET_WORKGROUPS_DATA_REQUEST;
};

export interface GetWorkGroupsDataSuccess {
  type: typeof GET_WORKGROUPS_DATA_SUCCESS;
  payload: WorkGroupsData[];
}

export interface GetWorkGroupsDataFailure {
  type: typeof GET_WORKGROUPS_DATA_FAILURE;
  payload: FailurePayload;
}

export interface SetWorkGroupsDataSelected {
  type: typeof SET_USER_WORKGROUPS_SELECTED;
  payload: WorkGroupsSelected | null;
}

export interface GroupsData {
  id: number;
  value: string;
  einNumber: string;
  isFavorite: boolean;
  workGroups: number[];
}

export interface PracticesData {
  id: number;
  value: string;
  einNumber: string;
  address: string;
  isFavorite: boolean;
  workGroups: number[];
}

export interface FacilitiesData {
  id: number;
  value: string;
  address: string;
  placeOfServiceID: number;
  placeOfServiceCode: string;
  placeOfServiceDescription: string;
  isFavorite: boolean;
  workGroups: number[];
}

export interface ProvidersData {
  id: number;
  value: string;
  providerNPI: string;
  isFavorite: boolean;
  workGroups: number[];
}

export interface WorkGroupsSelectedDataRequest {
  workGroupId: number;
}

export type GetWorkGroupsSelectedDataRequest = {
  type: typeof GET_WORKGROUPS_SELECTED_DATA_REQUEST;
  payload: WorkGroupsSelectedDataRequest;
};

export interface GetWorkGroupsSelectedDataSuccess {
  type: typeof GET_WORKGROUPS_SELECTED_DATA_SUCCESS;
  payload: WorkGroupsResponseData;
}

export interface GetWorkGroupsSelectedDataFailure {
  type: typeof GET_WORKGROUPS_SELECTED_DATA_FAILURE;
  payload: FailurePayload;
}

export interface WorkGroupsSelected {
  workGroupId: number | null | undefined;
  workGroupName: string | null | undefined;
  groupsData: GroupData[];
  practicesData: PracticesData[];
  facilitiesData: FacilitiesData[];
  providersData: ProvidersData[];
}

export interface SetCreateEditWorkGroupIsSuccessed {
  type: typeof SET_CREATE_EDIT_WORKGROUP_IS_SUCCESSED;
  payload: boolean | null;
}

export type EditWorkgroupData = {
  name: string;
  providers: number[];
  practices: number[];
  groups: number[];
  facilities: number[];
};

export interface EditWorkGroupRequest {
  type: typeof EDIT_WORKGROUP_REQUEST;
  payload: EditWorkgroupData;
  workGroupId: number;
}

export interface EditWorkGroupSuccess {
  type: typeof EDIT_WORKGROUP_SUCCESS;
  payload: NewWorkGroupSuccessPayload;
}

export interface EditWorkGroupFailure {
  type: typeof EDIT_WORKGROUP_FAILURE;
  payload: FailurePayload;
}

export interface SetWorkgroupSelectResponceData {
  type: typeof SET_WORKGROUP_SELECT_RESPONSE_DATA;
  payload: null;
}

export interface SuccessPayload {
  message: string;
}

export interface FavoritesHelperPayload {
  id: number;
  dataType: string;
  isFavorite: boolean;
}

export interface FavoriteGroup {
  id: number;
  value: string;
  einNumber: string;
  isFavorite: boolean;
}

export interface DeleteWorkGroupSuccess {
  type: typeof DELETE_WORKGROUP_SUCCESS;
  payload: SuccessPayload;
}

export interface DeleteWorkGroupFailure {
  type: typeof DELETE_WORKGROUP_FAILURE;
  payload: FailurePayload;
}

export type RenameWorkGroup = {
  id: number;
  name: string;
};

export interface RenameWorkGroupRequest {
  type: typeof RENAME_WORKGROUP_REQUEST;
  payload: RenameWorkGroup;
}

export interface RenameWorkGroupSuccess {
  type: typeof RENAME_WORKGROUP_SUCCESS;
  payload: SuccessPayload;
}

export interface RenameWorkGroupFailure {
  type: typeof RENAME_WORKGROUP_FAILURE;
  payload: FailurePayload;
}

export interface AddFavoritesFailure {
  type: typeof ADD_FAVORITES_FAILURE;
  payload: FailurePayload;
}

export interface UnFavoritesFailure {
  type: typeof UN_FAVORITE_FAILURE;
  payload: FailurePayload;
}

export interface RemoveFromWorkGroupType {
  removeEntityName: string;
  removeFromEntitiName: string;
  workGroupID: number;
  groups?: number[];
  practices?: number[];
  facilities?: number[];
  providers?: number[];
}

export type FavoritesPractices = {
  id: number;
  value: string;
  einNumber: number;
  address: string;
  groupID: number;
  group: string;
  isFavorite: boolean;
};

export type FavoritesFacilities = {
  id: number;
  value: string;
  address: string;
  placeOfServiceID: number;
  placeOfServiceCode: string;
  placeOfServiceDescription: string;
  practiceID: number;
  practice: string;
  groupID: number;
  group: string;
  isFavorite: boolean;
};

export type FavoritesProviders = {
  id: number;
  value: string;
  providerNPI: string;
  groupID: number;
  group: string;
  isFavorite: boolean;
};

export interface AllFavoritesData {
  groups?: GroupData[];
  practices?: FavoritesPractices[];
  facilities?: FavoritesFacilities[];
  providers?: FavoritesProviders[];
}

export interface SearchGroupData {
  id: number;
  value: string;
  einNumber: string;
  type: string;
}

export interface SearchPracticeData {
  id: number;
  value: string;
  einNumber: string;
  address: string;
  groupId: number;
  type: string;
}

export interface SearchFacilityData {
  id: number;
  value: string;
  placeOfServiceCode: string;
  placeOfServiceID: number;
  address: string;
  placeOfServiceDescription: string;
  groupId: number;
  practiceId: number;
  type: string;
}

export interface SearchProviderData {
  id: number;
  value: string;
  providerNPI: string;
  groupId: number;
  type: string;
}

export interface OrganizationSearchDropdownData {
  workGroups: WorkGroupsData[];
  groups: SearchGroupData[];
  practices: SearchPracticeData[];
  facilities: SearchFacilityData[];
  providers: SearchProviderData[];
}

export interface FetchAllFavoritiesDataSuccess {
  type: typeof GET_FAVORITIES_SUCCESS;
  payload: AllFavoritesData;
}

export interface GetSearchOrganizationSelectorData {
  type: typeof GET_SEARCH_ORGANIZATION_DATA;
  payload: OrganizationSearchDropdownData;
}

export interface SearchSelectedItemType {
  value: string;
  workgroupId?: number | null;
  groupId?: number | null;
  facilityId?: number | null;
  providerId?: number | null;
  practiceId?: number | null;
  type: string;
}

export interface SetSearchSelectedValueAction {
  type: typeof SET_SEARCH_SELECTED_ITEMS;
  payload: SearchSelectedItemType | null;
}

export type AddRecentsData = {
  workGroups: number[];
  providers: number[];
  practices: number[];
  groups: number[];
  facilities: number[];
};

export type AllRecentTabData = {
  rid: number;
  id: number;
  type: string;
  isFavorite: boolean;
  group: string;
  groupEINNumber: number;
  practice: string;
  practiceEINNumber: number;
  practiceAddress: string;
  practiceGroup: string;
  facility: string;
  facilityAddress: string;
  facilityPOSCode: number;
  facilityPractice: string;
  facilityGroup: string;
  provider: string;
  providerNPI: number;
  providerGroup: string;
  workGroup: string;
  facilityPOSDescription: string;
  facilityPracticeID: number | null;
  groupID: number | null;
};

export interface GetRecentTabAllData {
  type: typeof GET_RECENT_TAB_ALL_DATA;
  payload: AllRecentTabData[];
}

export type GlobleSearchDropdownValue = {
  id: number;
  value: string;
};
export interface GlobleSearchDropdown {
  type: typeof GLOBLE_SEARCH_DROPDOWN_VALUE;
  payload: GlobleSearchDropdownValue | null;
}

export type NotificationActions =
  | FetchNotificationRequest
  | FetchNotificationSuccess
  | FetchNotificationFailure
  | ToggleNewWorkgroupModal
  | CreateNewWorkGroupRequest
  | CreateNewWorkGroupSuccess
  | CreateNewWorkGroupFailure
  | GetOrganizationSelectorDataRequest
  | GetOrganizationSelectorDataSuccess
  | GetOrganizationSelectorDataFailure
  | GetWorkGroupsDataRequest
  | GetWorkGroupsDataSuccess
  | GetWorkGroupsDataFailure
  | GetWorkGroupsSelectedDataRequest
  | GetWorkGroupsSelectedDataSuccess
  | GetWorkGroupsSelectedDataFailure
  | SetWorkGroupsDataSelected
  | SetCreateEditWorkGroupIsSuccessed
  | EditWorkGroupRequest
  | EditWorkGroupSuccess
  | EditWorkGroupFailure
  | SetWorkgroupSelectResponceData
  | DeleteWorkGroupFailure
  | DeleteWorkGroupSuccess
  | RenameWorkGroupRequest
  | RenameWorkGroupSuccess
  | RenameWorkGroupFailure
  | AddFavoritesFailure
  | UnFavoritesFailure
  | FetchAllFavoritiesDataSuccess
  | GetSearchOrganizationSelectorData
  | SetSearchSelectedValueAction
  | GetRecentTabAllData
  | GlobleSearchDropdown;
