import {
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
  GET_WORKGROUPS_SELECTED_DATA_REQUEST,
  GLOBLE_SEARCH_DROPDOWN_VALUE,
  RENAME_WORKGROUP_FAILURE,
  RENAME_WORKGROUP_REQUEST,
  RENAME_WORKGROUP_SUCCESS,
  SET_SEARCH_SELECTED_ITEMS,
  TOGGLE_NEW_WORKGROUP_MODAL,
  UN_FAVORITE_FAILURE,
} from './actionTypes';
import type {
  AddFavoritesFailure,
  AllFavoritesData,
  AllRecentTabData,
  CreateNewWorkGroupFailure,
  CreateNewWorkGroupRequest,
  CreateNewWorkGroupSuccess,
  DeleteWorkGroupFailure,
  DeleteWorkGroupSuccess,
  EditWorkgroupData,
  EditWorkGroupFailure,
  EditWorkGroupRequest,
  EditWorkGroupSuccess,
  FailurePayload,
  FetchAllFavoritiesDataSuccess,
  FetchNotificationFailure,
  FetchNotificationRequest,
  FetchNotificationSuccess,
  FetchNotificationSuccessPayload,
  GetOrganizationSelectorDataFailure,
  GetOrganizationSelectorDataRequest,
  GetOrganizationSelectorDataSuccess,
  GetRecentTabAllData,
  GetSearchOrganizationSelectorData,
  GetWorkGroupsDataFailure,
  GetWorkGroupsDataRequest,
  GetWorkGroupsDataSuccess,
  GetWorkGroupsSelectedDataRequest,
  GetWorkGroupsSelectedDataSuccess,
  GlobleSearchDropdown,
  GlobleSearchDropdownValue,
  NewWorkgroupData,
  NewWorkGroupSuccessPayload,
  OrganizationSearchDropdownData,
  OrganizationSelectorData,
  RenameWorkGroup,
  RenameWorkGroupFailure,
  RenameWorkGroupRequest,
  RenameWorkGroupSuccess,
  SearchSelectedItemType,
  SetCreateEditWorkGroupIsSuccessed,
  SetSearchSelectedValueAction,
  SetWorkGroupsDataSelected,
  SetWorkgroupSelectResponceData,
  SuccessPayload,
  ToggleNewWorkgroupModal,
  UnFavoritesFailure,
  WorkGroupsData,
  WorkGroupsResponseData,
  WorkGroupsSelected,
  WorkGroupsSelectedDataRequest,
} from './types';

// NOTIFICATIONS
export const fetchNotificationRequest = (): FetchNotificationRequest => ({
  type: FETCH_NOTIFICATION_REQUEST,
});

export const fetchNotificationSuccess = (
  payload: FetchNotificationSuccessPayload
): FetchNotificationSuccess => ({
  type: FETCH_NOTIFICATION_SUCCESS,
  payload,
});

export const fetchNotificationFailure = (
  payload: FailurePayload
): FetchNotificationFailure => ({
  type: FETCH_NOTIFICATION_FAILURE,
  payload,
});

// NEW WORKGROUP
export const toggleNewWorkgroupModal = (): ToggleNewWorkgroupModal => ({
  type: TOGGLE_NEW_WORKGROUP_MODAL,
});

export const createNewWorkGroupRequest = (
  workgroup: NewWorkgroupData
): CreateNewWorkGroupRequest => ({
  type: CREATE_NEW_WORKGROUP_REQUEST,
  payload: { workgroup },
});

export const createNewWorkGroupSuccess = (
  payload: NewWorkGroupSuccessPayload
): CreateNewWorkGroupSuccess => ({
  type: CREATE_NEW_WORKGROUP_SUCCESS,
  payload,
});

export const createNewWorkGroupFailure = (
  payload: FailurePayload
): CreateNewWorkGroupFailure => ({
  type: CREATE_NEW_WORKGROUP_FAILURE,
  payload,
});

// ORGANIZATION SELECTOR
export const fetchOrganizationSelectorDataRequest =
  (): GetOrganizationSelectorDataRequest => ({
    type: GET_ORGANIZATION_SELECTOR_DATA_REQUEST,
  });

export const fetchOrganizationSelectorDataSuccess = (
  payload: OrganizationSelectorData
): GetOrganizationSelectorDataSuccess => ({
  type: GET_ORGANIZATION_SELECTOR_DATA_SUCCESS,
  payload,
});

export const fetchOrganizationSelectorDataFailure = (
  payload: FailurePayload
): GetOrganizationSelectorDataFailure => ({
  type: GET_ORGANIZATION_SELECTOR_DATA_FAILURE,
  payload,
});

export const getWorkGroupDataSuccess = (
  payload: WorkGroupsData[]
): GetWorkGroupsDataSuccess => ({
  type: 'GET_WORKGROUPS_DATA_SUCCESS',
  payload,
});

export const getWorkGroupDataFailure = (
  payload: FailurePayload
): GetWorkGroupsDataFailure => ({
  type: GET_WORKGROUPS_DATA_FAILURE,
  payload,
});

export const getWorkGroupsDataRequest = (): GetWorkGroupsDataRequest => ({
  type: 'GET_WORKGROUPS_DATA_REQUEST',
});

export const getWorkGroupsSelectedDataRequest = (
  workGorupSelectedData: WorkGroupsSelectedDataRequest
): GetWorkGroupsSelectedDataRequest => ({
  type: GET_WORKGROUPS_SELECTED_DATA_REQUEST,
  payload: workGorupSelectedData,
});

export const getWorkGroupSelectedDataSuccess = (
  payload: WorkGroupsResponseData
): GetWorkGroupsSelectedDataSuccess => ({
  type: 'GET_WORKGROUPS_SELECTED_DATA_SUCCESS',
  payload,
});

export const getWorkGroupSelectedDataFailure = (
  payload: FailurePayload
): GetWorkGroupsDataFailure => ({
  type: GET_WORKGROUPS_DATA_FAILURE,
  payload,
});

export const setWorkGroupSelected = (
  payload: WorkGroupsSelected | null
): SetWorkGroupsDataSelected => ({
  type: 'SET_USER_WORKGROUPS_SELECTED',
  payload,
});

export const setCreateEditWorkGroupIsSuccessed = (
  val: boolean | null
): SetCreateEditWorkGroupIsSuccessed => ({
  type: 'SET_CREATE_EDIT_WORKGROUP_IS_SUCCESSED',
  payload: val,
});

export const editWorkGroupRequest = (
  payload: EditWorkgroupData,
  workGroupId: number
): EditWorkGroupRequest => ({
  type: EDIT_WORKGROUP_REQUEST,
  payload,
  workGroupId,
});

export const editWorkGroupSuccess = (
  payload: NewWorkGroupSuccessPayload
): EditWorkGroupSuccess => ({
  type: EDIT_WORKGROUP_SUCCESS,
  payload,
});

export const editWorkGroupFailure = (
  payload: FailurePayload
): EditWorkGroupFailure => ({
  type: EDIT_WORKGROUP_FAILURE,
  payload,
});

export const setWorkgroupSelectResponceData = (
  val: null
): SetWorkgroupSelectResponceData => ({
  type: 'SET_WORKGROUP_SELECT_RESPONSE_DATA',
  payload: val,
});

export const deleteWorkGroupSuccess = (
  payload: SuccessPayload
): DeleteWorkGroupSuccess => ({
  type: DELETE_WORKGROUP_SUCCESS,
  payload,
});

export const deleteWorkGroupFailure = (
  payload: FailurePayload
): DeleteWorkGroupFailure => ({
  type: DELETE_WORKGROUP_FAILURE,
  payload,
});

export const renameWorkGroupRequest = (
  payload: RenameWorkGroup
): RenameWorkGroupRequest => ({
  type: RENAME_WORKGROUP_REQUEST,
  payload,
});

export const renameWorkGroupSuccess = (
  payload: SuccessPayload
): RenameWorkGroupSuccess => ({
  type: RENAME_WORKGROUP_SUCCESS,
  payload,
});

export const renameWorkGroupFailure = (
  payload: FailurePayload
): RenameWorkGroupFailure => ({
  type: RENAME_WORKGROUP_FAILURE,
  payload,
});

export const addFavoritesFailure = (
  payload: FailurePayload
): AddFavoritesFailure => ({
  type: ADD_FAVORITES_FAILURE,
  payload,
});

export const unFavoritesFailure = (
  payload: FailurePayload
): UnFavoritesFailure => ({
  type: UN_FAVORITE_FAILURE,
  payload,
});

export const fetchAllFavoritiesDataSuccess = (
  data: AllFavoritesData
): FetchAllFavoritiesDataSuccess => ({
  type: GET_FAVORITIES_SUCCESS,
  payload: data,
});

export const getSearchOrganizationData = (
  data: OrganizationSearchDropdownData
): GetSearchOrganizationSelectorData => ({
  type: GET_SEARCH_ORGANIZATION_DATA,
  payload: data,
});

export const setSearchSelectedDataAction = (
  data: SearchSelectedItemType | null
): SetSearchSelectedValueAction => ({
  type: SET_SEARCH_SELECTED_ITEMS,
  payload: data,
});

export const getRecentTabAllData = (
  data: AllRecentTabData[]
): GetRecentTabAllData => ({
  type: GET_RECENT_TAB_ALL_DATA,
  payload: data,
});
export const setGlobleSearchDropdownValue = (
  data: GlobleSearchDropdownValue | null
): GlobleSearchDropdown => ({
  type: GLOBLE_SEARCH_DROPDOWN_VALUE,
  payload: data,
});
