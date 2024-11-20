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
  SAVE_CHARGE_REQUEST,
  SAVE_CHARGE_SUCCESS,
  SAVE_CLAIM_FAILURE,
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
import type {
  AddToastNotification,
  AllInsuranceData,
  AppSpinnerType,
  ArManagerOpenAtGlanceData,
  AssignClaimToData,
  AssignClaimToRequestPayload,
  BatchDocumentCriteria,
  BatchDocumentFailure,
  BatchDocumentOutput,
  BatchDocumentPageCriteria,
  BatchDocumentPageFailure,
  BatchDocumentPageOutput,
  BatchDocumentPageRequest,
  BatchDocumentPageSuccess,
  BatchDocumentRequest,
  BatchDocumentSuccess,
  BatchNumberCriteria,
  BatchNumberFailure,
  BatchNumberOutput,
  BatchNumberRequest,
  BatchNumberSuccess,
  ClaimPatientInsuranceData,
  ClaimPatientInsuranceRequestPayload,
  CPTNDCCriteria,
  CPTNDCFailure,
  CPTNDCOutput,
  CPTNDCRequest,
  CPTNDCSuccess,
  CPTSearchCriteria,
  CPTSearchFailure,
  CPTSearchOutput,
  CPTSearchRequest,
  CPTSearchSuccess,
  EditClaimFailure,
  EditClaimFailurePayload,
  EditClaimRequest,
  EditClaimSuccess,
  EditClaimSuccessPayload,
  ExpandSideMenuBar,
  FacilityData,
  FacilityDataRequestPayload,
  FailurePayload,
  GetAllInsuranceData,
  GetArManagerOpenAtGlanceData,
  GetAssignClaimToDataFailure,
  GetAssignClaimToDataRequest,
  GetAssignClaimToDataSuccess,
  GetClaimPatientInsuranceDataFailure,
  GetClaimPatientInsuranceDataRequest,
  GetClaimPatientInsuranceDataSuccess,
  GetFacilityDataFailure,
  GetFacilityDataRequest,
  GetFacilityDataSuccess,
  GetGlobleSearchRecentsDataFailure,
  GetGlobleSearchRecentsDataRequest,
  GetGlobleSearchRecentsDataSuccess,
  GetGroupDataFailure,
  GetGroupDataRequest,
  GetGroupDataSuccess,
  GetLookupDropdownsDataFailure,
  GetLookupDropdownsDataRequest,
  GetLookupDropdownsDataSuccess,
  GetPatientInsuranceDataFailure,
  GetPatientInsuranceDataRequest,
  GetPatientInsuranceDataSuccess,
  GetPracticeDataFailure,
  GetPracticeDataRequest,
  GetPracticeDataSuccess,
  GetProviderDataFailure,
  GetProviderDataRequest,
  GetProviderDataSuccess,
  GetReferringProviderDataFailure,
  GetReferringProviderDataRequest,
  GetReferringProviderDataSuccess,
  GetReferringProviderRequestPayload,
  GlobalModalData,
  GlobleSearchRecentsData,
  GlobleSearchRecentsDataRequestPayload,
  GroupData,
  ICDSearchCriteria,
  ICDSearchFailure,
  ICDSearchOutput,
  ICDSearchRequest,
  ICDSearchSuccess,
  LookupDropdownsData,
  PatientInsuranceData,
  PatientInsuranceRequestPayload,
  PatientSearchCriteria,
  PatientSearchFailure,
  PatientSearchOutput,
  PatientSearchRequest,
  PatientSearchSuccess,
  PracticeData,
  PracticeDataRequestPayload,
  ProviderData,
  ProviderDataRequestPayload,
  ReferringProviderData,
  RemoveToastNotification,
  RemoveToastNotificationPayload,
  RouteHistoryData,
  SaveChargeRequest,
  SaveChargeRequestPayload,
  SaveChargeSuccess,
  SaveChargeSuccessPayload,
  SaveClaimChargePaymentFailure,
  SaveClaimRequestPayload,
  SaveCptNdcFailure,
  SaveCptNdcRequest,
  SaveCptNdcRequestPayload,
  SaveCptNdcSuccess,
  SaveCptNdcSuccessPayload,
  ScreenInactivityStatus,
  ScrubClaimData,
  ScrubClaimFailure,
  ScrubClaimRequest,
  ScrubClaimSuccess,
  ScrubClaimSuccessPayload,
  SearchProviderFailure,
  SearchProviderRequest,
  SearchProviderRequestPayload,
  SearchProviderSuccess,
  SearchProviderSuccessPayload,
  SetGlobalModal,
  SetRouteHistory,
  SetSelectedPaymentBatchID,
  SetSidebarContent,
  SetSidebarContentPayload,
  Toast,
  ToggleContentSidebar,
  ToggleMenu,
  UpdateChargeFailure,
  UpdateChargeRequest,
  UpdateChargeSuccess,
  UpdateChargeSuccessPayload,
  UploadedDocumentCriteria,
  UploadedDocumentFailure,
  UploadedDocumentOutput,
  UploadedDocumentRequest,
  UploadedDocumentSuccess,
} from './types';

export const toggleContentSidebar = (): ToggleContentSidebar => ({
  type: TOGGLE_CONTENT_SIDEBAR,
});

export const toggleMenu = (): ToggleMenu => ({
  type: TOGGLE_MENU,
});

export const setSidebarContent = (
  payload: SetSidebarContentPayload
): SetSidebarContent => ({
  type: SET_SIDEBAR_CONTENT,
  payload,
});

export const addToastNotification = (payload: Toast): AddToastNotification => ({
  type: ADD_TOAST_NOTIFICATION,
  payload,
});

export const removeToastNotification = (
  payload: RemoveToastNotificationPayload
): RemoveToastNotification => ({
  type: REMOVE_TOAST_NOTIFICATION,
  payload,
});

// Patient Search

export const fetchPatientSearchDataRequest = (
  patientSearch: PatientSearchCriteria
): PatientSearchRequest => ({
  type: PATIENT_SEARCH_REQUEST,
  payload: { patientSearch },
});
export const fetchPatientSearchSuccess = (
  payload: PatientSearchOutput[] | []
): PatientSearchSuccess => ({
  type: PATIENT_SEARCH_SUCCESS,
  payload,
});

export const fetchPatientSearchFailure = (
  payload: FailurePayload
): PatientSearchFailure => ({
  type: PATIENT_SEARCH_FAILURE,
  payload,
});

// Lookup Dropdowns

export const getLookupDropdownsRequest = (): GetLookupDropdownsDataRequest => ({
  type: GET_LOOKUP_DROPDOWNS_DATA_REQUEST,
});
export const getLookupDropdownsSuccess = (
  payload: LookupDropdownsData
): GetLookupDropdownsDataSuccess => ({
  type: GET_LOOKUP_DROPDOWNS_DATA_SUCCESS,
  payload,
});

export const getLookupDropdownsFailure = (
  payload: FailurePayload
): GetLookupDropdownsDataFailure => ({
  type: GET_LOOKUP_DROPDOWNS_DATA_FAILURE,
  payload,
});
// Patient Insurance
export const fetchPatientInsranceDataRequest = (
  patientID: PatientInsuranceRequestPayload
): GetPatientInsuranceDataRequest => ({
  type: GET_PATIENT_INSURANCE_DATA_REQUEST,
  payload: patientID,
});
export const fetchPatientInsranceDataSuccess = (
  payload: PatientInsuranceData[] | []
): GetPatientInsuranceDataSuccess => ({
  type: GET_PATIENT_INSURANCE_DATA_SUCCESS,
  payload,
});

export const fetchPatientInsranceDataFailure = (
  payload: FailurePayload
): GetPatientInsuranceDataFailure => ({
  type: GET_PATIENT_INSURANCE_DATA_FAILURE,
  payload,
});
// Claim Patient Insurance
export const fetchClaimPatientInsranceDataRequest = (
  claimID: ClaimPatientInsuranceRequestPayload
): GetClaimPatientInsuranceDataRequest => ({
  type: GET_CLAIM_PATIENT_INSURANCE_DATA_REQUEST,
  payload: claimID,
});
export const fetchClaimPatientInsranceDataSuccess = (
  payload: ClaimPatientInsuranceData[] | []
): GetClaimPatientInsuranceDataSuccess => ({
  type: GET_CLAIM_PATIENT_INSURANCE_DATA_SUCCESS,
  payload,
});

export const fetchClaimPatientInsranceDataFailure = (
  payload: FailurePayload
): GetClaimPatientInsuranceDataFailure => ({
  type: GET_CLAIM_PATIENT_INSURANCE_DATA_FAILURE,
  payload,
});
// Assign Claim To
export const fetchAssignClaimToDataRequest = (
  clientID: AssignClaimToRequestPayload
): GetAssignClaimToDataRequest => ({
  type: ASSIGN_CLAIM_TO_DATA_REQUEST,
  payload: clientID,
});
export const fetchAssignClaimToDataSuccess = (
  payload: AssignClaimToData[]
): GetAssignClaimToDataSuccess => ({
  type: ASSIGN_CLAIM_TO_DATA_SUCCESS,
  payload,
});

export const fetchAssignClaimToDataFailure = (
  payload: FailurePayload
): GetAssignClaimToDataFailure => ({
  type: ASSIGN_CLAIM_TO_DATA_FAILURE,
  payload,
});
// Referring Provider
export const fetchReferringProviderDataRequest = (
  clientID: GetReferringProviderRequestPayload
): GetReferringProviderDataRequest => ({
  type: REFERRING_PROVIDER_DATA_REQUEST,
  payload: clientID,
});
export const fetchReferringProviderDataSuccess = (
  payload: ReferringProviderData[] | []
): GetReferringProviderDataSuccess => ({
  type: REFERRING_PROVIDER_DATA_SUCCESS,
  payload,
});

export const fetchReferringProviderDataFailure = (
  payload: FailurePayload
): GetReferringProviderDataFailure => ({
  type: REFERRING_PROVIDER_DATA_FAILURE,
  payload,
});
// Globle Search Recents
export const fetchGlobleSearchRecentsDataRequest = (
  payload: GlobleSearchRecentsDataRequestPayload
): GetGlobleSearchRecentsDataRequest => ({
  type: GET_ALL_GLOBLE_SEARCH_RECENTS_DATA_REQUEST,
  payload,
});
export const fetchGlobleSearchRecentsDataSuccess = (
  payload: GlobleSearchRecentsData[]
): GetGlobleSearchRecentsDataSuccess => ({
  type: GET_ALL_GLOBLE_SEARCH_RECENTS_DATA_SUCCESS,
  payload,
});

export const fetchGlobleSearchRecentsDataFailure = (
  payload: FailurePayload
): GetGlobleSearchRecentsDataFailure => ({
  type: GET_ALL_GLOBLE_SEARCH_RECENTS_DATA_FAILURE,
  payload,
});
// Group
export const fetchGroupDataRequest = (): GetGroupDataRequest => ({
  type: GROUP_DATA_REQUEST,
});
export const fetchGroupDataSuccess = (
  payload: GroupData[]
): GetGroupDataSuccess => ({
  type: GROUP_DATA_SUCCESS,
  payload,
});

export const fetchGroupDataFailure = (
  payload: FailurePayload
): GetGroupDataFailure => ({
  type: GROUP_DATA_FAILURE,
  payload,
});
// Practice
export const fetchPracticeDataRequest = (
  groupID: PracticeDataRequestPayload
): GetPracticeDataRequest => ({
  type: PRACTICE_DATA_REQUEST,
  payload: groupID,
});
export const fetchPracticeDataSuccess = (
  payload: PracticeData[]
): GetPracticeDataSuccess => ({
  type: PRACTICE_DATA_SUCCESS,
  payload,
});

export const fetchPracticeDataFailure = (
  payload: FailurePayload
): GetPracticeDataFailure => ({
  type: PRACTICE_DATA_FAILURE,
  payload,
});
// Facility
export const fetchFacilityDataRequest = (
  groupID: FacilityDataRequestPayload
): GetFacilityDataRequest => ({
  type: FACILITY_DATA_REQUEST,
  payload: groupID,
});
export const fetchFacilityDataSuccess = (
  payload: FacilityData[]
): GetFacilityDataSuccess => ({
  type: FACILITY_DATA_SUCCESS,
  payload,
});
export const fetchFacilityDataFailure = (
  payload: FailurePayload
): GetFacilityDataFailure => ({
  type: FACILITY_DATA_FAILURE,
  payload,
});
// Provider
export const fetchProviderDataRequest = (
  groupID: ProviderDataRequestPayload
): GetProviderDataRequest => ({
  type: PROVIDER_DATA_REQUEST,
  payload: groupID,
});
export const fetchProviderDataSuccess = (
  payload: ProviderData[] | []
): GetProviderDataSuccess => ({
  type: PROVIDER_DATA_SUCCESS,
  payload,
});
export const fetchProviderDataFailure = (
  payload: FailurePayload
): GetProviderDataFailure => ({
  type: PROVIDER_DATA_FAILURE,
  payload,
});
// Save Claim
export const saveClaimFailure = (
  payload: FailurePayload
): SaveClaimChargePaymentFailure => ({
  type: SAVE_CLAIM_FAILURE,
  payload,
});
// Save Charge
export const saveChargesRequest = (
  chargeData: SaveChargeRequestPayload
): SaveChargeRequest => ({
  type: SAVE_CHARGE_REQUEST,
  payload: chargeData,
});
export const saveChargeSuccess = (
  payload: SaveChargeSuccessPayload
): SaveChargeSuccess => ({
  type: SAVE_CHARGE_SUCCESS,
  payload,
});
// Scrub Claim
export const scrubClaimRequest = (
  scrubClaim: ScrubClaimData[]
): ScrubClaimRequest => ({
  type: SCRUB_CLAIM_REQUEST,
  payload: scrubClaim,
});

export const scrubClaimSuccess = (
  payload: ScrubClaimSuccessPayload | null
): ScrubClaimSuccess => ({
  type: SCRUB_CLAIM_SUCCESS,
  payload,
});

export const scrubClaimFailure = (
  payload: FailurePayload
): ScrubClaimFailure => ({
  type: SCRUB_CLAIM_FAILURE,
  payload,
});
// Update Charge
export const updateChargesRequest = (
  chargeData: SaveChargeRequestPayload
): UpdateChargeRequest => ({
  type: UPDATE_CHARGE_REQUEST,
  payload: chargeData,
});
export const updateChargeSuccess = (
  payload: UpdateChargeSuccessPayload | null
): UpdateChargeSuccess => ({
  type: UPDATE_CHARGE_SUCCESS,
  payload,
});
export const updateChargeFailure = (
  payload: FailurePayload
): UpdateChargeFailure => ({
  type: UPDATE_CHARGE_FAILURE,
  payload,
});
// Create NDC Rule
export const saveCptNdcRequest = (
  ndcData: SaveCptNdcRequestPayload
): SaveCptNdcRequest => ({
  type: SAVE_CPT_NDC_REQUEST,
  payload: ndcData,
});
export const saveCptNdcSuccess = (
  payload: SaveCptNdcSuccessPayload
): SaveCptNdcSuccess => ({
  type: SAVE_CPT_NDC_SUCCESS,
  payload,
});
export const saveCptNdcFailure = (
  payload: FailurePayload
): SaveCptNdcFailure => ({
  type: SAVE_CPT_NDC_FAILURE,
  payload,
});
// CPT Code
export const fetchCPTSearchDataRequest = (
  cptSearch: CPTSearchCriteria
): CPTSearchRequest => ({
  type: CPT_SEARCH_REQUEST,
  payload: { cptSearch },
});
export const fetchCPTSearchSuccess = (
  payload: CPTSearchOutput[]
): CPTSearchSuccess => ({
  type: CPT_SEARCH_SUCCESS,
  payload,
});
export const fetchCPTSearchFailure = (
  payload: FailurePayload
): CPTSearchFailure => ({
  type: CPT_SEARCH_FAILURE,
  payload,
});
// CPT NDC Code
export const fetchCPTNdcDataRequest = (
  cptNdc: CPTNDCCriteria
): CPTNDCRequest => ({
  type: CPT_NDC_REQUEST,
  payload: { cptNdc },
});
export const fetchCPTNdcSuccess = (
  payload: CPTNDCOutput[] | []
): CPTNDCSuccess => ({
  type: CPT_NDC_SUCCESS,
  payload,
});
export const fetchCPTNdcFailure = (payload: FailurePayload): CPTNDCFailure => ({
  type: CPT_NDC_FAILURE,
  payload,
});
// Batch Number
export const fetchBatchNumberDataRequest = (
  batchSearch: BatchNumberCriteria
): BatchNumberRequest => ({
  type: BATCH_NUMBER_REQUEST,
  payload: { batchSearch },
});
export const fetchBatchNumberSuccess = (
  payload: BatchNumberOutput[] | []
): BatchNumberSuccess => ({
  type: BATCH_NUMBER_SUCCESS,
  payload,
});
export const fetchBatchNumberFailure = (
  payload: FailurePayload
): BatchNumberFailure => ({
  type: BATCH_NUMBER_FAILURE,
  payload,
});
// Batch Document
export const fetchBatchDocumentDataRequest = (
  batchDocument: BatchDocumentCriteria
): BatchDocumentRequest => ({
  type: BATCH_DOCUMENT_REQUEST,
  payload: { batchDocument },
});
export const fetchBatchDocumentSuccess = (
  payload: BatchDocumentOutput[] | []
): BatchDocumentSuccess => ({
  type: BATCH_DOCUMENT_SUCCESS,
  payload,
});
export const fetchBatchDocumentFailure = (
  payload: FailurePayload
): BatchDocumentFailure => ({
  type: BATCH_DOCUMENT_FAILURE,
  payload,
});
// Batch Document Page
export const fetchBatchDocumentPageDataRequest = (
  batchDocumentPage: BatchDocumentPageCriteria
): BatchDocumentPageRequest => ({
  type: BATCH_DOCUMENT_PAGE_REQUEST,
  payload: { batchDocumentPage },
});
export const fetchBatchDocumentPageSuccess = (
  payload: BatchDocumentPageOutput[] | []
): BatchDocumentPageSuccess => ({
  type: BATCH_DOCUMENT_PAGE_SUCCESS,
  payload,
});
export const fetchBatchDocumentPageFailure = (
  payload: FailurePayload
): BatchDocumentPageFailure => ({
  type: BATCH_DOCUMENT_PAGE_FAILURE,
  payload,
});
// Search Provider
export const fetchSearchProviderDataRequest = (
  searchProvider: SearchProviderRequestPayload
): SearchProviderRequest => ({
  type: SEARCH_PROVIDER_REQUEST,
  payload: searchProvider,
});
export const fetchSearchProviderSuccess = (
  payload: SearchProviderSuccessPayload[]
): SearchProviderSuccess => ({
  type: SEARCH_PROVIDER_SUCCESS,
  payload,
});
export const fetchSearchProviderFailure = (
  payload: FailurePayload
): SearchProviderFailure => ({
  type: SEARCH_PROVIDER_FAILURE,
  payload,
});
// ICD-10 Code
export const fetchICDSearchDataRequest = (
  icdSearch: ICDSearchCriteria
): ICDSearchRequest => ({
  type: ICD_SEARCH_REQUEST,
  payload: { icdSearch },
});
export const fetchICDSearchSuccess = (
  payload: ICDSearchOutput[]
): ICDSearchSuccess => ({
  type: ICD_SEARCH_SUCCESS,
  payload,
});
export const fetchICDSearchFailure = (
  payload: FailurePayload
): ICDSearchFailure => ({
  type: ICD_SEARCH_FAILURE,
  payload,
});
// Get Uploaded claim document
export const fetchUploadedClaimDocumentDataRequest = (
  uploadedDocument: UploadedDocumentCriteria
): UploadedDocumentRequest => ({
  type: UPLOAD_DOCUMENT_REQUEST,
  payload: { uploadedDocument },
});
export const fetchUploadedClaimDocumentSuccess = (
  payload: UploadedDocumentOutput[]
): UploadedDocumentSuccess => ({
  type: UPLOAD_DOCUMENT_SUCCESS,
  payload,
});
export const fetchUploadedClaimDocumentFailure = (
  payload: FailurePayload
): UploadedDocumentFailure => ({
  type: UPLOAD_DOCUMENT_FAILURE,
  payload,
});

// Edit Claim
export const editClaimRequest = (
  claimData: SaveClaimRequestPayload
): EditClaimRequest => ({
  type: EDIT_CLAIM_REQUEST,
  payload: claimData,
});
export const editClaimSuccess = (
  payload: EditClaimSuccessPayload
): EditClaimSuccess => ({
  type: EDIT_CLAIM_SUCCESS,
  payload,
});
export const editClaimFailure = (
  payload: EditClaimFailurePayload
): EditClaimFailure => ({
  type: EDIT_CLAIM_FAILURE,
  payload,
});

export const setRouteHistory = (
  payload: RouteHistoryData[]
): SetRouteHistory => ({
  type: 'SET_ROUTE_HISTORY',
  payload,
});
export const setGlobalModal = (
  payload: GlobalModalData | undefined
): SetGlobalModal => ({
  type: 'SET_GLOBAL_MODAL',
  payload,
});
export const setSelectedPaymentBatchID = (
  payload: number
): SetSelectedPaymentBatchID => ({
  type: 'SET_SELECTED_PAYMENT_BATCHID',
  payload,
});

export const setAppSpinner = (payload: boolean): AppSpinnerType => ({
  type: SET_APP_SPINNER,
  payload,
});

export const getAllInsuranceData = (
  data: AllInsuranceData[]
): GetAllInsuranceData => ({
  type: FETCH_ALL_INSURANCE_DATA,
  payload: data,
});

export const expandSideMenuBar = (payload: boolean): ExpandSideMenuBar => ({
  type: EXPAND_SIDEBAR_MENU,
  payload,
});
export const isScreenInActive = (payload: boolean): ScreenInactivityStatus => ({
  type: SCREEN_INACTIVITY_STATUS,
  payload,
});

export const getArManagerOpenAtGlanceData = (
  data: ArManagerOpenAtGlanceData | null
): GetArManagerOpenAtGlanceData => ({
  type: FETCH_AR_MANAGER_OPEN_AT_GLANCE_DATA,
  payload: data,
});
