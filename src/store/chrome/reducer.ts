import {
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
} from './actionTypes';
import type { ChromeState, NotificationActions } from './types';

const initialState: ChromeState = {
  pending: false,
  notifications: [],
  workgroups: [],
  error: null,
  isNewWorkgroupModalOpen: false,
  organizationSelectorData: {
    groups: [],
    practices: [],
    providers: [],
    workGroups: [],
    facilities: [],
    favorites: {
      groups: [],
      practices: [],
      providers: [],
      facilities: [],
    },
  },
  workGroupData: [],
  workGroupsResponseData: null,
  workGroupsSelected: null,
  createEditWorkgroupIsSucceeded: null,
  allFavoritesData: null,
  organizationSearchDropdownData: null,
  searchSelectedItemType: null,
  allRecentTabData: [],
  globleSearchDropdownVal: null,
};

// eslint-disable-next-line @typescript-eslint/default-param-last
const chromeReducer = (state = initialState, action: NotificationActions) => {
  switch (action.type) {
    case CREATE_NEW_WORKGROUP_REQUEST:
    case FETCH_NOTIFICATION_REQUEST:
    case GET_ORGANIZATION_SELECTOR_DATA_REQUEST:
      return {
        ...state,
        error: null,
        pending: true,
      };
    case FETCH_NOTIFICATION_SUCCESS:
      return {
        ...state,
        pending: false,
        notifications: action.payload.notifications,
        error: null,
      };
    case FETCH_NOTIFICATION_FAILURE:
      return {
        ...state,
        pending: false,
        notifications: [],
        error: action.payload.error,
      };
    case TOGGLE_NEW_WORKGROUP_MODAL:
      return {
        ...state,
        isNewWorkgroupModalOpen: !state.isNewWorkgroupModalOpen,
      };
    case CREATE_NEW_WORKGROUP_SUCCESS:
      return {
        ...state,
        pending: false,
        workgroups: [...state.workgroups, action.payload.workgroup],
        error: null,
        createEditWorkgroupIsSucceeded: true,
      };
    case CREATE_NEW_WORKGROUP_FAILURE:
      return {
        ...state,
        error: action.payload.error,
        createEditWorkgroupIsSucceeded: false,
      };
    case GET_ORGANIZATION_SELECTOR_DATA_SUCCESS:
      return {
        ...state,
        pending: false,
        organizationSelectorData: action.payload,
        error: null,
      };
    case GET_ORGANIZATION_SELECTOR_DATA_FAILURE:
      return {
        ...state,
        error: action.payload.error,
      };
    case GET_WORKGROUPS_DATA_REQUEST:
      return {
        ...state,
      };
    case GET_WORKGROUPS_DATA_SUCCESS:
      return {
        ...state,
        pending: false,
        workGroupData: action.payload,
        error: null,
      };
    case GET_WORKGROUPS_DATA_FAILURE:
      return {
        ...state,
        error: action.payload.error,
        workGroupsResponseData: null,
      };
    case GET_WORKGROUPS_SELECTED_DATA_REQUEST:
      return {
        ...state,
      };
    case GET_WORKGROUPS_SELECTED_DATA_SUCCESS:
      return {
        ...state,
        pending: false,
        workGroupsResponseData: action.payload,
      };
    case GET_WORKGROUPS_SELECTED_DATA_FAILURE:
      return {
        ...state,
        pending: false,
        error: action.payload.error,
      };
    case SET_USER_WORKGROUPS_SELECTED:
      return {
        ...state,
        workGroupsSelected: action.payload,
      };
    case SET_CREATE_EDIT_WORKGROUP_IS_SUCCESSED:
      return {
        ...state,
        createEditWorkgroupIsSucceeded: action.payload,
      };
    case EDIT_WORKGROUP_SUCCESS:
      return {
        ...state,
        pending: false,
        workgroups: [...state.workgroups, action.payload.workgroup],
        error: null,
        createEditWorkgroupIsSucceeded: true,
      };
    case EDIT_WORKGROUP_FAILURE:
      return {
        ...state,
        error: action.payload.error,
        createEditWorkgroupIsSucceeded: false,
      };
    case EDIT_WORKGROUP_REQUEST:
      return {
        ...state,
      };
    case SET_WORKGROUP_SELECT_RESPONSE_DATA:
      return {
        ...state,
        workGroupsResponseData: null,
      };
    case DELETE_WORKGROUP_SUCCESS:
      return {
        ...state,
        pending: false,
        error: null,
        workGroupsSelected: null,
      };
    case DELETE_WORKGROUP_FAILURE:
      return {
        ...state,
        error: action.payload.error,
      };
    case RENAME_WORKGROUP_SUCCESS:
      return {
        ...state,
        pending: false,
        error: null,
        message: action.payload.message,
      };
    case RENAME_WORKGROUP_FAILURE:
      return {
        ...state,
        error: action.payload.error,
      };
    case RENAME_WORKGROUP_REQUEST:
      return {
        ...state,
      };
    case GET_FAVORITIES_SUCCESS:
      return {
        ...state,
        allFavoritesData: action.payload,
      };
    case GET_SEARCH_ORGANIZATION_DATA:
      return {
        ...state,
        organizationSearchDropdownData: action.payload,
      };
    case SET_SEARCH_SELECTED_ITEMS:
      return {
        ...state,
        searchSelectedItemType: action.payload,
      };
    case GET_RECENT_TAB_ALL_DATA:
      return {
        ...state,
        allRecentTabData: action.payload,
      };
    case GLOBLE_SEARCH_DROPDOWN_VALUE:
      return {
        ...state,
        globleSearchDropdownVal: action.payload,
      };
    default:
      return {
        ...state,
      };
  }
};

export default chromeReducer;
