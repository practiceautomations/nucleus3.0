import {
  ADD_TOAST_NOTIFICATION,
  ASSIGN_CLAIM_TO_DATA_FAILURE,
  ASSIGN_CLAIM_TO_DATA_REQUEST,
  ASSIGN_CLAIM_TO_DATA_SUCCESS,
  BATCH_DOCUMENT_FAILURE,
  BATCH_DOCUMENT_PAGE_FAILURE,
  BATCH_DOCUMENT_PAGE_REQUEST,
  BATCH_DOCUMENT_PAGE_SUCCESS,
  BATCH_DOCUMENT_REQUEST,
  BATCH_DOCUMENT_SUCCESS,
  BATCH_NUMBER_FAILURE,
  BATCH_NUMBER_REQUEST,
  BATCH_NUMBER_SUCCESS,
  CPT_NDC_FAILURE,
  CPT_NDC_REQUEST,
  CPT_NDC_SUCCESS,
  CPT_SEARCH_FAILURE,
  CPT_SEARCH_REQUEST,
  CPT_SEARCH_SUCCESS,
  EDIT_CLAIM_FAILURE,
  EDIT_CLAIM_REQUEST,
  EDIT_CLAIM_SUCCESS,
  EXPAND_SIDEBAR_MENU,
  FACILITY_DATA_FAILURE,
  FACILITY_DATA_REQUEST,
  FACILITY_DATA_SUCCESS,
  FETCH_ALL_INSURANCE_DATA,
  FETCH_AR_MANAGER_OPEN_AT_GLANCE_DATA,
  GET_ALL_GLOBLE_SEARCH_RECENTS_DATA_FAILURE,
  GET_ALL_GLOBLE_SEARCH_RECENTS_DATA_REQUEST,
  GET_ALL_GLOBLE_SEARCH_RECENTS_DATA_SUCCESS,
  GET_CLAIM_PATIENT_INSURANCE_DATA_FAILURE,
  GET_CLAIM_PATIENT_INSURANCE_DATA_REQUEST,
  GET_CLAIM_PATIENT_INSURANCE_DATA_SUCCESS,
  GET_LOOKUP_DROPDOWNS_DATA_FAILURE,
  GET_LOOKUP_DROPDOWNS_DATA_REQUEST,
  GET_LOOKUP_DROPDOWNS_DATA_SUCCESS,
  GET_PATIENT_INSURANCE_DATA_FAILURE,
  GET_PATIENT_INSURANCE_DATA_REQUEST,
  GET_PATIENT_INSURANCE_DATA_SUCCESS,
  GROUP_DATA_FAILURE,
  GROUP_DATA_REQUEST,
  GROUP_DATA_SUCCESS,
  ICD_SEARCH_FAILURE,
  ICD_SEARCH_REQUEST,
  ICD_SEARCH_SUCCESS,
  PATIENT_SEARCH_FAILURE,
  PATIENT_SEARCH_REQUEST,
  PATIENT_SEARCH_SUCCESS,
  PRACTICE_DATA_FAILURE,
  PRACTICE_DATA_REQUEST,
  PRACTICE_DATA_SUCCESS,
  PROVIDER_DATA_FAILURE,
  PROVIDER_DATA_REQUEST,
  PROVIDER_DATA_SUCCESS,
  REFERRING_PROVIDER_DATA_FAILURE,
  REFERRING_PROVIDER_DATA_REQUEST,
  REFERRING_PROVIDER_DATA_SUCCESS,
  REMOVE_TOAST_NOTIFICATION,
  SAVE_CHARGE_FAILURE,
  SAVE_CHARGE_REQUEST,
  SAVE_CHARGE_SUCCESS,
  SAVE_CLAIM_FAILURE,
  SAVE_CLAIM_REQUEST,
  SAVE_CLAIM_SUCCESS,
  SAVE_CPT_NDC_FAILURE,
  SAVE_CPT_NDC_REQUEST,
  SAVE_CPT_NDC_SUCCESS,
  SCREEN_INACTIVITY_STATUS,
  SCRUB_CLAIM_FAILURE,
  SCRUB_CLAIM_REQUEST,
  SCRUB_CLAIM_SUCCESS,
  SEARCH_PROVIDER_FAILURE,
  SEARCH_PROVIDER_REQUEST,
  SEARCH_PROVIDER_SUCCESS,
  SET_APP_SPINNER,
  SET_GLOBAL_MODAL,
  SET_ROUTE_HISTORY,
  SET_SELECTED_PAYMENT_BATCHID,
  SET_SIDEBAR_CONTENT,
  TOGGLE_CONTENT_SIDEBAR,
  TOGGLE_MENU,
  UPDATE_CHARGE_FAILURE,
  UPDATE_CHARGE_REQUEST,
  UPDATE_CHARGE_SUCCESS,
  UPLOAD_DOCUMENT_FAILURE,
  UPLOAD_DOCUMENT_REQUEST,
  UPLOAD_DOCUMENT_SUCCESS,
} from './actionTypes';
import type { AppConfigurationType, SharedActions, SharedState } from './types';

const appConfiguration: AppConfigurationType = {
  toastAutoCloseAfterSec: {
    error: undefined,
    success: 3,
    warning: 6,
    info: 6,
  },
};

const initialState: SharedState = {
  isContentSidebarOpen: false,
  isMenuOpen: false,
  loading: false,
  sidebarContent: null,
  toastNotifications: [],
  patientSearchOutput: [],
  lookupDropdownsData: null,
  patientInsuranceData: [],
  claimPatientInsuranceData: [],
  assignClaimToData: [],
  referringProviderData: [],
  globleSearchRecentsData: [],
  groupData: [],
  practiceData: [],
  facilityData: [],
  providerData: [],
  saveClaimSuccessPayload: null,
  cptSearchOutput: [],
  searchProviderSuccessPayload: [],
  icdSearchOutput: [],
  chargeFeeOutput: null,
  batchNumberOutput: [],
  batchDocumentOutput: [],
  batchDocumentPageOutput: [],
  saveChargeSuccessPayload: null,
  editClaimSuccessPayload: null,
  editClaimFailurePayload: null,
  cptNdcOutput: [],
  saveCptNdcSuccessPayload: null,
  updateChargeSuccessPayload: null,
  routeHistory: [],
  openGlobalModal: undefined,
  scrubClaimSuccessPayload: null,
  uploadedDocumentOutput: [],
  showAppSpinner: false,
  allInsuranceData: [],
  showAppSpinnerRequest: [],
  appConfiguration,
  sideBarMenuOpened: true,
  selectedPaymentBatchID: null,
  isScreenInactive: false,
  arManagerOpenAtGlanceData: null,
};

// eslint-disable-next-line @typescript-eslint/default-param-last
const sharedReducer = (state = initialState, action: SharedActions) => {
  switch (action.type) {
    case TOGGLE_CONTENT_SIDEBAR:
      return {
        ...state,
        isContentSidebarOpen: !state.isContentSidebarOpen,
      };
    case TOGGLE_MENU:
      return {
        ...state,
        isMenuOpen: !state.isMenuOpen,
      };
    case SET_SIDEBAR_CONTENT:
      return {
        ...state,
        sidebarContent: action.payload.content,
      };
    case ADD_TOAST_NOTIFICATION:
      return {
        ...state,
        toastNotifications: [...state.toastNotifications, action.payload],
      };
    case REMOVE_TOAST_NOTIFICATION:
      return {
        ...state,
        toastNotifications: state.toastNotifications.filter(
          (notification) => notification.id !== action.payload.id
        ),
      };
    case PATIENT_SEARCH_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case PATIENT_SEARCH_SUCCESS:
      return {
        ...state,
        patientSearchOutput: action.payload,
        loading: false,
      };
    case PATIENT_SEARCH_FAILURE:
      return {
        ...state,
        loading: false,
      };
    case GET_LOOKUP_DROPDOWNS_DATA_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case GET_LOOKUP_DROPDOWNS_DATA_FAILURE:
      return {
        ...state,
        loading: false,
      };
    case GET_LOOKUP_DROPDOWNS_DATA_SUCCESS:
      return {
        ...state,
        lookupDropdownsData: action.payload,
        loading: false,
      };
    case SET_SELECTED_PAYMENT_BATCHID:
      return {
        ...state,
        selectedPaymentBatchID: action.payload,
      };
    case GET_PATIENT_INSURANCE_DATA_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case GET_PATIENT_INSURANCE_DATA_FAILURE:
      return {
        ...state,
        loading: false,
      };
    case GET_PATIENT_INSURANCE_DATA_SUCCESS:
      return {
        ...state,
        patientInsuranceData: action.payload,
        loading: false,
      };
    case GET_CLAIM_PATIENT_INSURANCE_DATA_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case GET_CLAIM_PATIENT_INSURANCE_DATA_FAILURE:
      return {
        ...state,
        loading: false,
      };
    case GET_CLAIM_PATIENT_INSURANCE_DATA_SUCCESS:
      return {
        ...state,
        claimPatientInsuranceData: action.payload,
        loading: false,
      };
    case ASSIGN_CLAIM_TO_DATA_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case ASSIGN_CLAIM_TO_DATA_SUCCESS:
      return {
        ...state,
        assignClaimToData: action.payload,
        loading: false,
      };
    case ASSIGN_CLAIM_TO_DATA_FAILURE:
      return {
        ...state,
        assignClaimToData: [],
        loading: false,
      };
    case REFERRING_PROVIDER_DATA_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case REFERRING_PROVIDER_DATA_SUCCESS:
      return {
        ...state,
        referringProviderData: action.payload,
        loading: false,
      };
    case REFERRING_PROVIDER_DATA_FAILURE:
      return {
        ...state,
        loading: false,
      };
    case GET_ALL_GLOBLE_SEARCH_RECENTS_DATA_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case GET_ALL_GLOBLE_SEARCH_RECENTS_DATA_SUCCESS:
      return {
        ...state,
        globleSearchRecentsData: action.payload,
        loading: false,
      };
    case GET_ALL_GLOBLE_SEARCH_RECENTS_DATA_FAILURE:
      return {
        ...state,
        loading: false,
      };
    case GROUP_DATA_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case GROUP_DATA_SUCCESS:
      return {
        ...state,
        groupData: action.payload,
        loading: false,
      };
    case GROUP_DATA_FAILURE:
      return {
        ...state,
        loading: false,
      };
    case PRACTICE_DATA_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case PRACTICE_DATA_SUCCESS:
      return {
        ...state,
        practiceData: action.payload,
        loading: false,
      };
    case PRACTICE_DATA_FAILURE:
      return {
        ...state,
        loading: false,
      };
    case FACILITY_DATA_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case FACILITY_DATA_SUCCESS:
      return {
        ...state,
        facilityData: action.payload,
        loading: false,
      };
    case FACILITY_DATA_FAILURE:
      return {
        ...state,
        loading: false,
      };
    case PROVIDER_DATA_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case PROVIDER_DATA_SUCCESS:
      return {
        ...state,
        providerData: action.payload,
        loading: false,
      };
    case PROVIDER_DATA_FAILURE:
      return {
        ...state,
        loading: false,
      };
    case SAVE_CHARGE_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case SAVE_CHARGE_SUCCESS:
      return {
        ...state,
        saveChargeSuccessPayload: action.payload,
        loading: false,
      };
    case SAVE_CHARGE_FAILURE:
      return {
        ...state,
        loading: false,
      };
    case SAVE_CLAIM_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case SAVE_CLAIM_SUCCESS:
      return {
        ...state,
        saveClaimSuccessPayload: action.payload,
        loading: false,
      };
    case SAVE_CLAIM_FAILURE:
      return {
        ...state,
        loading: false,
      };
    case CPT_SEARCH_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case CPT_SEARCH_SUCCESS:
      return {
        ...state,
        cptSearchOutput: action.payload,
        loading: false,
      };
    case CPT_SEARCH_FAILURE:
      return {
        ...state,
        loading: false,
      };
    case SEARCH_PROVIDER_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case ICD_SEARCH_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case SEARCH_PROVIDER_SUCCESS:
      return {
        ...state,
        searchProviderSuccessPayload: action.payload,
        loading: false,
      };
    case SEARCH_PROVIDER_FAILURE:
      return {
        ...state,
        loading: false,
      };
    case ICD_SEARCH_SUCCESS:
      return {
        ...state,
        icdSearchOutput: action.payload,
        loading: false,
      };
    case ICD_SEARCH_FAILURE:
      return {
        ...state,
        loading: false,
      };
    case BATCH_NUMBER_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case BATCH_NUMBER_SUCCESS:
      return {
        ...state,
        batchNumberOutput: action.payload,
        loading: false,
      };
    case BATCH_NUMBER_FAILURE:
      return {
        ...state,
        loading: false,
      };
    case EDIT_CLAIM_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case EDIT_CLAIM_SUCCESS:
      return {
        ...state,
        editClaimSuccessPayload: action.payload,
        loading: false,
      };
    case EDIT_CLAIM_FAILURE:
      return {
        ...state,
        editClaimFailurePayload: action.payload,
        loading: false,
      };
    case CPT_NDC_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case CPT_NDC_SUCCESS:
      return {
        ...state,
        cptNdcOutput: action.payload,
        loading: false,
      };
    case CPT_NDC_FAILURE:
      return {
        ...state,
        loading: false,
      };
    case SAVE_CPT_NDC_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case SAVE_CPT_NDC_SUCCESS:
      return {
        ...state,
        saveCptNdcSuccessPayload: action.payload,
        loading: false,
      };
    case SAVE_CPT_NDC_FAILURE:
      return {
        ...state,
        loading: false,
      };
    case BATCH_DOCUMENT_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case BATCH_DOCUMENT_SUCCESS:
      return {
        ...state,
        batchDocumentOutput: action.payload,
        loading: false,
      };
    case BATCH_DOCUMENT_FAILURE:
      return {
        ...state,
        loading: false,
      };
    case BATCH_DOCUMENT_PAGE_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case BATCH_DOCUMENT_PAGE_SUCCESS:
      return {
        ...state,
        batchDocumentPageOutput: action.payload,
        loading: false,
      };
    case BATCH_DOCUMENT_PAGE_FAILURE:
      return {
        ...state,
        loading: false,
      };
    case UPDATE_CHARGE_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case UPDATE_CHARGE_SUCCESS:
      return {
        ...state,
        updateChargeSuccessPayload: action.payload,
        loading: false,
      };
    case UPDATE_CHARGE_FAILURE:
      return {
        ...state,
        loading: false,
      };
    case SET_ROUTE_HISTORY:
      return {
        ...state,
        routeHistory: action.payload,
      };
    case SET_GLOBAL_MODAL:
      return {
        ...state,
        openGlobalModal: action.payload,
      };
    case SET_APP_SPINNER: {
      const arr = [...state.showAppSpinnerRequest];
      const last = arr[arr.length - 1] || 0;
      return {
        ...state,
        showAppSpinnerRequest: action.payload
          ? [...arr, last + 1]
          : arr.slice(0, -1),
      };
    }
    case SCRUB_CLAIM_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case SCRUB_CLAIM_SUCCESS:
      return {
        ...state,
        scrubClaimSuccessPayload: action.payload,
        loading: false,
      };
    case SCRUB_CLAIM_FAILURE:
      return {
        ...state,
        loading: false,
      };
    case UPLOAD_DOCUMENT_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case UPLOAD_DOCUMENT_SUCCESS:
      return {
        ...state,
        uploadedDocumentOutput: action.payload,
        loading: false,
      };
    case UPLOAD_DOCUMENT_FAILURE:
      return {
        ...state,
        loading: false,
      };

    case FETCH_ALL_INSURANCE_DATA:
      return {
        ...state,
        allInsuranceData: action.payload,
      };
    case EXPAND_SIDEBAR_MENU:
      return {
        ...state,
        sideBarMenuOpened: action.payload,
      };
    case SCREEN_INACTIVITY_STATUS:
      return {
        ...state,
        isScreenInactive: action.payload,
      };
    case FETCH_AR_MANAGER_OPEN_AT_GLANCE_DATA:
      return {
        ...state,
        arManagerOpenAtGlanceData: action.payload,
      };
    default:
      return {
        ...state,
      };
  }
};

export default sharedReducer;
