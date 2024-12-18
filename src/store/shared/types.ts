import type {
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

export interface IdValuePair {
  id: number;
  value: string;
}
export interface SharedState {
  isContentSidebarOpen: boolean;
  isMenuOpen: boolean;
  sidebarContent: any;
  toastNotifications: Toast[];
  patientSearchOutput: PatientSearchOutput[] | [];
  loading: boolean;
  lookupDropdownsData: LookupDropdownsData | null;
  patientInsuranceData: PatientInsuranceData[];
  claimPatientInsuranceData: ClaimPatientInsuranceData[];
  assignClaimToData: AssignClaimToData[];
  referringProviderData: ReferringProviderData[];
  globleSearchRecentsData: GlobleSearchRecentsData[];
  groupData: GroupData[];
  practiceData: PracticeData[];
  facilityData: FacilityData[];
  providerData: ProviderData[];
  saveClaimSuccessPayload: SaveClaimSuccessPayload | null;
  cptSearchOutput: CPTSearchOutput[];
  batchNumberOutput: BatchNumberOutput[];
  batchDocumentOutput: BatchDocumentOutput[];
  batchDocumentPageOutput: BatchDocumentPageOutput[];
  searchProviderSuccessPayload: SearchProviderSuccessPayload[];
  icdSearchOutput: ICDSearchOutput[];
  chargeFeeOutput: ChargeFeeOutput | null;
  saveChargeSuccessPayload: SaveChargeSuccessPayload | null;
  editClaimSuccessPayload: EditClaimSuccessPayload | null;
  editClaimFailurePayload: EditClaimFailurePayload | null;
  cptNdcOutput: CPTNDCOutput[];
  saveCptNdcSuccessPayload: SaveCptNdcSuccessPayload | null;
  updateChargeSuccessPayload: UpdateChargeSuccessPayload | null;
  routeHistory: RouteHistoryData[];
  openGlobalModal: GlobalModalData | undefined;
  scrubClaimSuccessPayload: ScrubClaimSuccessPayload | null;
  uploadedDocumentOutput: UploadedDocumentOutput[];
  showAppSpinner: boolean;
  allInsuranceData: AllInsuranceData[];
  showAppSpinnerRequest: number[];
  appConfiguration: AppConfigurationType;
  sideBarMenuOpened: boolean;
  selectedPaymentBatchID: number | null;
  isScreenInactive: boolean;
  arManagerOpenAtGlanceData: ArManagerOpenAtGlanceData | null;
}

export interface GlobalModalData {
  type: string;
  id: number;
  isPopup?: boolean;
  fromTab?: string;
}

export interface RouteHistoryData {
  url: string;
  displayName?: string;
  isModal?: boolean;
}

export interface AppConfigurationType {
  toastAutoCloseAfterSec: {
    error: undefined;
    success: number | undefined;
    warning: number | undefined;
    info: number | undefined;
  };
}

export interface SetSidebarContentPayload {
  content: any;
}

export type SetSidebarContent = {
  type: typeof SET_SIDEBAR_CONTENT;
  payload: SetSidebarContentPayload;
};

export type AddToastNotification = {
  type: typeof ADD_TOAST_NOTIFICATION;
  payload: Toast;
};

export interface RemoveToastNotificationPayload {
  id: string;
}
export interface AssignClaimToRequestPayload {
  clientID: number;
}
export interface AssignClaimToData {
  id: number;
  value: string;
  appendText: string;
}
export interface TaskTypesData {
  id: number;
  value: string;
  code: string;
  followupDays: number;
  defaultRVT: string;
}
export interface PatientInsuranceRequestPayload {
  patientID: number;
}
export interface PatientInsuranceData {
  id: number;
  value: string;
  appendText: string;
  subcriberID: string;
  insuranceID: number;
  insuranceResponsibility: string;
  assignmentBelongsToID: number;
  subscriberRelation: string;
  accidentDate: number;
  accidentTypeID: number;
  accidentStateID: number;
}
export interface ClaimPatientInsuranceRequestPayload {
  claimID: number;
}
export interface ClaimPatientInsuranceData {
  id: number;
  value: string;
  appendText: string;
  subcriberID: string;
  insuranceID: number;
  insuranceResponsibility: string;
  assignmentBelongsToID: number;
  subscriberRelation: string;
  accidentDate: number;
  accidentTypeID: number;
  accidentStateID: number;
  active: boolean;
}
export interface CPTSearchRequestPayload {
  cptSearch: CPTSearchCriteria;
}
export interface CPTNDCRequestPayload {
  cptNdc: CPTNDCCriteria;
}
export interface BatchNumberRequestPayload {
  batchSearch: BatchNumberCriteria;
}
export interface BatchDocumentRequestPayload {
  batchDocument: BatchDocumentCriteria;
}
export interface BatchDocumentPageRequestPayload {
  batchDocumentPage: BatchDocumentPageCriteria;
}
export interface PatientSearchRequestPayload {
  patientSearch: PatientSearchCriteria;
}
export interface CPTSearchCriteria {
  searchValue: string | undefined;
  clientID: number | null;
}
export interface CPTSearchOutput {
  id: number;
  value: string;
  no_print: boolean;
  appendText: string;
}
export interface CPTNDCCriteria {
  cptCode: string | undefined;
  practiceID: number | null;
}
export interface CPTNDCOutput {
  id: number | null;
  ndcCode: string | null | undefined;
  cptCode: string;
  units: number | null | undefined;
  ndcUnitQualifierID: number | undefined;
  serviceDescription: string | null | undefined;
}
export interface BatchNumberCriteria {
  searchValue: string | undefined;
  clientID: number | null;
}
export interface BatchNumberOutput {
  id: number;
  value: string;
  postingDate: string | null | undefined;
}
export interface BatchDocumentCriteria {
  chargeBatchID: number | null | undefined;
  getInactive: boolean | null;
}
export interface BatchDocumentOutput {
  id: number;
  value: string;
  systemDocumentType: string | null | undefined;
  active: boolean | undefined;
}
export interface BatchDocumentPageCriteria {
  documentID: number | undefined;
}
export interface BatchDocumentPageOutput {
  id: number;
  value: string;
}
export interface CptNdcCrosswalkCriteria {
  practiceID?: number;
  cpt: string;
  ndc: string;
  pageNumber: number;
  pageSize: number;
  sortColumn: string;
  sortOrder: string;
  getAllData: boolean | null;
  getCptNdcCrosswalkIDS: boolean | null;
}
export interface CptNdcCrosswalkResult {
  crossWalkID: number;
  practiceID: number;
  practice: string;
  practiceEIN: string;
  ndc: string;
  cpt: string;
  qualifier: string;
  units?: number;
  icd1: string;
  icd2: string;
  createdOn: string;
  createdBy: string;
  updatedOn: string;
  updatedByID: string;
  updatedBy: string;
  updateByRole: string;
  total: number;
}
export interface AddUpdateCptNdcCrosswalk {
  cptNdcCrossWalkID?: number | null;
  practiceID?: number | null;
  cpt?: string | null;
  ndcCode: string;
  qualifierID: string;
  units?: number | null;
  icd1?: string | null;
  icd2?: string | null;
  serviceDescription: string;
}
export interface CptNdcCrosswalkEditResult {
  cptNdcCrossWalkID: number;
  practiceID: number;
  cpt: string;
  ndcCode: string;
  qualifierID: string;
  units?: number;
  icd1: string;
  icd2: string;
  serviceDescription: string;
}
export interface FeeScheduleCriteria {
  groupID: number;
  practiceID?: number;
  insuranceID?: number;
  cpt?: string;
  modifier?: string;
  fromFee?: number;
  toFee?: number;
  active: boolean | null;
  sortByColumn: string;
  sortOrder: string;
  pageNumber: number;
  pageSize: number;
  getAllData?: boolean;
  feeTypeID?: number;
}
export interface FeeScheduleResult {
  id: number;
  groupID: number;
  group: string;
  groupEIN: string;
  practiceID: number;
  practice: string;
  practiceEIN: string;
  insuranceID: number;
  insurance: string;
  cpt: string;
  modifier: string;
  fee: number;
  active: string;
  selfPay: string;
  createdOn: string;
  createdBy: string;
  updatedOn: string;
  updatedByID: string;
  updatedBy: string;
  updatedByRole: string;
  total: number;
  feeTypeID: number;
  feeType: string;
}
export interface AddUpdateFeeSchedule {
  feeScheduleID: number | null;
  groupID: number | null;
  practiceID: number | null;
  insuranceID: number | null;
  cpt: string;
  modifier: string;
  fee: number | null;
  active: boolean;
  selfPay: boolean;
  feeTypeID: number | null;
}
export interface PatientSearchCriteria {
  searchValue: string | undefined;
  groups: number[];
  practices: number[];
  facilities: number[];
  providers: number[];
}
export interface PatientSearchOutput {
  // [x: string]: any;
  id: number;
  value: string;
  patientName: string;
  patientDOB: string;
  dateOfBirth: string;
  groupID: number;
  groupName: string;
  practiceID: number;
  practiceName: string;
  facilityID: number;
  facilityName: string;
  providerID: number;
  providerName: string;
  placeOfServiceID: number;
  placeOfServiceName: string;
  icd1: string | null;
  icd2: string | null;
  icd3: string | null;
  icd4: string | null;
  icd5: string | null;
  icd6: string | null;
  icd7: string | null;
  icd8: string | null;
  icd9: string | null;
  icd10: string | null;
  icd11: string | null;
  icd12: string | null;
  active: boolean;
}
export interface ICDSearchCriteria {
  searchValue: string | undefined;
}
export interface UploadedDocumentCriteria {
  claimID: number | null | undefined;
  groupID: number | undefined | null;
  categoryID: number | undefined;
}
export interface PatientUploadedDocumentCriteria {
  patientID: number | null | undefined;
  groupID: number | undefined;
  categoryID: number | undefined;
  practiceID: number | undefined;
  file: File | null;
}
export interface PatientUploadDocsResponse {
  message: string;
  documentID: number;
  errors: string[];
}
export interface ICDSearchRequestPayload {
  icdSearch: ICDSearchCriteria;
}
export interface UploadedDocumentRequestPayload {
  uploadedDocument: UploadedDocumentCriteria;
}
export interface ICDSearchOutput {
  id: number;
  value: string;
  validity: string;
  appendText: string;
}
export interface UploadedDocumentOutput {
  id: number;
  title: string;
  documentType: string;
  appendText: string;
  claimID: number;
  category: string;
  eAttachment: boolean;
  createdOn: string;
  createdBy: string;
}

export interface TDownloadClaimDocumentType {
  message: string;
  documentName: string;
  documentExtension: string;
  documentBase64: string;
}
export interface ChargeFeeCriteria {
  cptCode: string | undefined;
  modifierCode: string | null;
  patientInsuranceID: number | null;
  facilityID: number | null;
  medicalCaseID: number | null;
}
export interface ChargeFeeOutput {
  fee: number;
}

export interface ReasonCodeType {
  id: number;
  value: string;
  code: string;
}
export interface PaymentBatchData {
  id: number;
  value: string;
  checkDate: string;
  postingDate: string;
  checkNumber: string;
  depositDate: string;
  paymentTypeID: number;
  batchBalance: number;
}
export interface ClaimAdvancePayment {
  totalAmount: number;
  withDOSAmount: number;
  withoutDOSAmount: number;
}
export interface PatientRefunds {
  id: number;
  patientRefund: number;
  patientRefundComments: string;
  refundGroupCode: string;
  refundReasonCode: string;
  refundRemarkCode: string;
}
export interface SavePatientPaymentCriteria {
  claimID: number;
  chargeID: number;
  patientID: number;
  paymentTypeID: number;
  batchID: number;
  advancePayDOS: string | null;
  checkDate: string | null;
  postingDate: string | null;
  depositDate: string | null;
  checkNumber: string;
  patientPaid: number | null;
  patientAdvanceCopayment: number | null;
  patientPaidComments?: string;
  patientAdvanceCopaymentComments?: string;
  discountComment?: string;
  responsibilityComments?: string;
  patientDiscount: number | null;
  insuranceResponsibility: number | null;
  paymentCode?: string;
  insCode?: string;
  discountCode?: string;
  refunds?: PatientRefunds[];
  patientBadDebt: number | null;
  badDebtCode?: string;
  badDebtComment?: string;
}
export interface InsurancePatientAdjustments {
  writeOff: number;
  writeOffComments: string;
  writeOffReason: string;
  writeOffGroupCode: string;
  writeOffReasonCode: string;
  writeOffRemarkCode: string;
}
export interface InsurancePatientResponsibilities {
  patientResponsibility: number;
  responsibilityComments: string;
  patientResponsibilityReason: string;
  responsibilityGroupCode: string;
  responsibilityReasonCode: string;
  responsibilityRemarkCode: string;
}
export interface InsurancePatientRefunds {
  insuranceRefund: number;
  insuranceRefundComments: string;
  refundGroupCode: string;
  refundReasonCode: string;
  refundRemarkCode: string;
}
export interface SaveInsurancePaymentCriteria {
  claimID: number;
  chargeID: number;
  patientID: number;
  paymentTypeID: number;
  batchID: number;
  checkDate: string | null;
  postingDate: string | null;
  depositDate: string | null;
  checkNumber: string;
  allowed: number | null | undefined;
  insurancePaid: number | null | undefined;
  insuranceComments: string;
  previousInsuranceAmount: boolean;
  secondaryInsuranceAmount: number | null;
  secondaryInsuranceID: number | null;
  crossover: boolean;
  adjustments: InsurancePatientAdjustments[];
  responsibility: InsurancePatientResponsibilities[];
  refunds: InsurancePatientRefunds[];
}
export interface LookupDropdownsData {
  claimStatus: LookupClaimStatusDataType[];
  scrubStatus: LookupDropdownsDataType[];
  claimType: LookupDropdownsDataType[];
  submitStatus: LookupDropdownsDataType[];
  assignmentBelongsTo: LookupDropdownsDataType[];
  placeOfService: LookupDropdownsDataType[];
  reasonOfPayment: LookupDropdownsDataType[];
  method: LookupDropdownsDataType[];
  modifiers: LookupDropdownsDataType[];
  ndcCodes: LookupDropdownsDataType[];
  documentAttachmentType: LookupDropdownsDataType[];
  accidentType: LookupDropdownsDataType[];
  accidentState: LookupDropdownsDataType[];
  delayReason: LookupDropdownsDataType[];
  epsdtCondition: LookupDropdownsDataType[];
  serviceAuthExcep: LookupDropdownsDataType[];
  specialProgramIndicator: LookupDropdownsDataType[];
  claimFrequency: LookupDropdownsDataType[];
  conditionCode: LookupDropdownsDataType[];
  transmissionCode: LookupDropdownsDataType[];
  attachmentType: LookupDropdownsDataType[];
  tag: LookupDropdownsDataType[];
  groupCode: ReasonCodeType[];
  comments: LookupDropdownsDataType[];
}
export interface LookupDropdownsDataType {
  id: number;
  value: string;
}
export interface FailurePayload {
  error: string;
}
export type RemoveToastNotification = {
  type: typeof REMOVE_TOAST_NOTIFICATION;
  payload: RemoveToastNotificationPayload;
};

export type ToggleContentSidebar = {
  type: typeof TOGGLE_CONTENT_SIDEBAR;
};

export type ToggleMenu = {
  type: typeof TOGGLE_MENU;
};
export type PatientSearchRequest = {
  type: typeof PATIENT_SEARCH_REQUEST;
  payload: PatientSearchRequestPayload;
};
export type PatientSearchSuccess = {
  type: typeof PATIENT_SEARCH_SUCCESS;
  payload: PatientSearchOutput[] | [];
};
export type PatientSearchFailure = {
  type: typeof PATIENT_SEARCH_FAILURE;
  payload: FailurePayload;
};
export type CPTSearchRequest = {
  type: typeof CPT_SEARCH_REQUEST;
  payload: CPTSearchRequestPayload;
};
export type CPTSearchSuccess = {
  type: typeof CPT_SEARCH_SUCCESS;
  payload: CPTSearchOutput[];
};
export type CPTSearchFailure = {
  type: typeof CPT_SEARCH_FAILURE;
  payload: FailurePayload;
};
export type CPTNDCRequest = {
  type: typeof CPT_NDC_REQUEST;
  payload: CPTNDCRequestPayload;
};
export type CPTNDCSuccess = {
  type: typeof CPT_NDC_SUCCESS;
  payload: CPTNDCOutput[] | [];
};
export type CPTNDCFailure = {
  type: typeof CPT_NDC_FAILURE;
  payload: FailurePayload;
};
export type BatchNumberRequest = {
  type: typeof BATCH_NUMBER_REQUEST;
  payload: BatchNumberRequestPayload;
};
export type BatchNumberSuccess = {
  type: typeof BATCH_NUMBER_SUCCESS;
  payload: BatchNumberOutput[] | [];
};
export type BatchNumberFailure = {
  type: typeof BATCH_NUMBER_FAILURE;
  payload: FailurePayload;
};
export type BatchDocumentRequest = {
  type: typeof BATCH_DOCUMENT_REQUEST;
  payload: BatchDocumentRequestPayload;
};
export type BatchDocumentSuccess = {
  type: typeof BATCH_DOCUMENT_SUCCESS;
  payload: BatchDocumentOutput[] | [];
};
export type BatchDocumentFailure = {
  type: typeof BATCH_DOCUMENT_FAILURE;
  payload: FailurePayload;
};
export type BatchDocumentPageRequest = {
  type: typeof BATCH_DOCUMENT_PAGE_REQUEST;
  payload: BatchDocumentPageRequestPayload;
};
export type BatchDocumentPageSuccess = {
  type: typeof BATCH_DOCUMENT_PAGE_SUCCESS;
  payload: BatchDocumentPageOutput[] | [];
};
export type BatchDocumentPageFailure = {
  type: typeof BATCH_DOCUMENT_PAGE_FAILURE;
  payload: FailurePayload;
};
export type ICDSearchRequest = {
  type: typeof ICD_SEARCH_REQUEST;
  payload: ICDSearchRequestPayload;
};
export type ICDSearchSuccess = {
  type: typeof ICD_SEARCH_SUCCESS;
  payload: ICDSearchOutput[];
};
export type ICDSearchFailure = {
  type: typeof ICD_SEARCH_FAILURE;
  payload: FailurePayload;
};
export type UploadedDocumentRequest = {
  type: typeof UPLOAD_DOCUMENT_REQUEST;
  payload: UploadedDocumentRequestPayload;
};
export type UploadedDocumentSuccess = {
  type: typeof UPLOAD_DOCUMENT_SUCCESS;
  payload: UploadedDocumentOutput[];
};
export type UploadedDocumentFailure = {
  type: typeof UPLOAD_DOCUMENT_FAILURE;
  payload: FailurePayload;
};
export type GetLookupDropdownsDataRequest = {
  type: typeof GET_LOOKUP_DROPDOWNS_DATA_REQUEST;
};
export type GetLookupDropdownsDataSuccess = {
  type: typeof GET_LOOKUP_DROPDOWNS_DATA_SUCCESS;
  payload: LookupDropdownsData;
};
export type GetLookupDropdownsDataFailure = {
  type: typeof GET_LOOKUP_DROPDOWNS_DATA_FAILURE;
  payload: FailurePayload;
};
export type GetPatientInsuranceDataRequest = {
  type: typeof GET_PATIENT_INSURANCE_DATA_REQUEST;
  payload: PatientInsuranceRequestPayload;
};
export type GetPatientInsuranceDataSuccess = {
  type: typeof GET_PATIENT_INSURANCE_DATA_SUCCESS;
  payload: PatientInsuranceData[] | [];
};
export type GetPatientInsuranceDataFailure = {
  type: typeof GET_PATIENT_INSURANCE_DATA_FAILURE;
  payload: FailurePayload;
};
export type GetClaimPatientInsuranceDataRequest = {
  type: typeof GET_CLAIM_PATIENT_INSURANCE_DATA_REQUEST;
  payload: ClaimPatientInsuranceRequestPayload;
};
export type GetClaimPatientInsuranceDataSuccess = {
  type: typeof GET_CLAIM_PATIENT_INSURANCE_DATA_SUCCESS;
  payload: ClaimPatientInsuranceData[] | [];
};
export type GetClaimPatientInsuranceDataFailure = {
  type: typeof GET_CLAIM_PATIENT_INSURANCE_DATA_FAILURE;
  payload: FailurePayload;
};
export type GetAssignClaimToDataRequest = {
  type: typeof ASSIGN_CLAIM_TO_DATA_REQUEST;
  payload: AssignClaimToRequestPayload;
};
export type GetAssignClaimToDataSuccess = {
  type: typeof ASSIGN_CLAIM_TO_DATA_SUCCESS;
  payload: AssignClaimToData[];
};
export type GetAssignClaimToDataFailure = {
  type: typeof ASSIGN_CLAIM_TO_DATA_FAILURE;
  payload: FailurePayload;
};
export enum ToastType {
  ERROR = 'error',
  SUCCESS = 'success',
  WARNING = 'warning',
  INFO = 'info',
}
export interface Toast {
  id: string;
  text: string;
  detail?: string;
  onClose?: () => void;
  toastType?: ToastType;
}
export interface ClaimNotesData {
  length: number;
  id: number;
  noteType: string;
  noteColor: string;
  comment: string;
  active: string;
  alert: string;
  createdBy: string;
  createdOn: string;
  noteTypeID: number;
  createdByIDS: string;
  category: string;
  subject: string;
}
export interface CreateNotesCriteria {
  noteID: number | null;
  lineItemID: number | undefined;
  noteTypeID: number;
  subject: string;
  comment: string;
  alert: string;
}
export interface GetReferringProviderRequestPayload {
  groupID: number;
}
export interface ReferringProviderData {
  id: number;
  value: string;
  firstName: string;
  lastName: string;
  appendText: string;
}
export type GetReferringProviderDataRequest = {
  type: typeof REFERRING_PROVIDER_DATA_REQUEST;
  payload: GetReferringProviderRequestPayload;
};
export type GetReferringProviderDataSuccess = {
  type: typeof REFERRING_PROVIDER_DATA_SUCCESS;
  payload: ReferringProviderData[] | [];
};
export type GetReferringProviderDataFailure = {
  type: typeof REFERRING_PROVIDER_DATA_FAILURE;
  payload: FailurePayload;
};
// Group
export interface GroupData {
  id: number;
  value: string;
  einNumber: string;
  workGroups: number[];
  isFavorite: boolean;
}
export interface WorkGroup {
  value: string;
  id: number;
}
export type GetGroupDataRequest = {
  type: typeof GROUP_DATA_REQUEST;
};
export type GetGroupDataSuccess = {
  type: typeof GROUP_DATA_SUCCESS;
  payload: GroupData[];
};
export type GetGroupDataFailure = {
  type: typeof GROUP_DATA_FAILURE;
  payload: FailurePayload;
};
// GLOBLE SEARCH RECENTS
export type GlobleSearchRecentsDataRequestPayload = {
  groupID?: number;
  category?: string;
};
export type GlobleSearchRecentsData = {
  id: number;
  type: string;
  value: string;
  referenceNumber: string;
};

export type GetGlobleSearchRecentsDataRequest = {
  type: typeof GET_ALL_GLOBLE_SEARCH_RECENTS_DATA_REQUEST;
  payload: GlobleSearchRecentsDataRequestPayload;
};
export type GetGlobleSearchRecentsDataSuccess = {
  type: typeof GET_ALL_GLOBLE_SEARCH_RECENTS_DATA_SUCCESS;
  payload: GlobleSearchRecentsData[];
};
export type GetGlobleSearchRecentsDataFailure = {
  type: typeof GET_ALL_GLOBLE_SEARCH_RECENTS_DATA_FAILURE;
  payload: FailurePayload;
};

// Payload
export interface FacilityDataRequestPayload {
  groupID: number;
}
// PRACTICE
export interface PracticeData {
  id: number;
  value: string;
  einNumber: string;
  address: string;
  isFavorite: boolean;
  workGroups: number[];
}
export interface PracticeDataRequestPayload {
  groupID: number;
}
export type GetPracticeDataRequest = {
  type: typeof PRACTICE_DATA_REQUEST;
  payload: PracticeDataRequestPayload;
};
export type GetPracticeDataSuccess = {
  type: typeof PRACTICE_DATA_SUCCESS;
  payload: PracticeData[];
};
export type GetPracticeDataFailure = {
  type: typeof PRACTICE_DATA_FAILURE;
  payload: FailurePayload;
};
// FACILITY
export interface FacilityData {
  id: number;
  value: string;
  address: string;
  placeOfServiceID: number;
  placeOfServiceCode: string;
  placeOfServiceDescription: string;
  practiceID: number;
  isFavorite: boolean;
  workGroups: number[];
}
export type GetFacilityDataRequest = {
  type: typeof FACILITY_DATA_REQUEST;
  payload: FacilityDataRequestPayload;
};
export type GetFacilityDataSuccess = {
  type: typeof FACILITY_DATA_SUCCESS;
  payload: FacilityData[];
};
export type GetFacilityDataFailure = {
  type: typeof FACILITY_DATA_FAILURE;
  payload: FailurePayload;
};
// provider
export interface ProviderDataRequestPayload {
  groupID: number;
}
export interface ProviderData {
  id: number;
  value: string;
  providerNPI: string;
  isFavorite: boolean;
  workGroups: number[];
}
export interface SavedSearchs {
  id: number;
  label: string;
  module_id: number;
  value: string;
}
export interface AllClaimsAsigneeData {
  id: number;
  value: string;
  appendText: string;
}
export interface LookupClaimStatusDataType {
  id: number;
  value: string;
  categoryID: number;
  categoryName: string;
  color: string;
}
export type GetProviderDataRequest = {
  type: typeof PROVIDER_DATA_REQUEST;
  payload: ProviderDataRequestPayload;
};
export type GetProviderDataSuccess = {
  type: typeof PROVIDER_DATA_SUCCESS;
  payload: ProviderData[] | [];
};
export type GetProviderDataFailure = {
  type: typeof PROVIDER_DATA_FAILURE;
  payload: FailurePayload;
};
export type ScrubStatusData = {
  scrubStatusID: number | null;
  claimID: number | null;
};
export type ScrubResultData = {
  claimID: number | null;
  chargeID: number | null;
  claim_number: number | null;
  practice_id: number | null;
  practice_name: string | null;
  batchID: number | null;
  errormessage: string | null;
};
// Scrub Claim

export interface ScrubClaimSuccessPayload {
  response: string;
  adnareResponse: string;
  result: ScrubResultData[];
  scrubStatus: ScrubStatusData[];
}
export type ScrubClaimData = {
  claimID: number | null | undefined;
  clientID: number | null | undefined;
  practiceID: number | null | undefined;
  insuranceID: number | null | undefined;
};
export interface ScrubClaimRequest {
  type: typeof SCRUB_CLAIM_REQUEST;
  payload: ScrubClaimData[];
}
export interface ScrubClaimSuccess {
  type: typeof SCRUB_CLAIM_SUCCESS;
  payload: ScrubClaimSuccessPayload | null;
}
export interface ScrubClaimFailure {
  type: typeof SCRUB_CLAIM_FAILURE;
  payload: FailurePayload;
}

export type ExpandSideMenuBar = {
  type: typeof EXPAND_SIDEBAR_MENU;
  payload: boolean;
};
export type ScreenInactivityStatus = {
  type: typeof SCREEN_INACTIVITY_STATUS;
  payload: boolean;
};
// SAVE CLAIM

export interface SaveClaimRequestPayload {
  claimID: number | null;
  appointmentID: number | null;
  claimStatusID: number | null;
  scrubStatusID: number | null;
  submitStatusID: number | null;
  patientID: number | null;
  patientInsuranceID: number | null;
  insuranceID: number | null;
  subscriberID: string | null;
  dosFrom: string | null | undefined;
  dosTo: string | null | undefined;
  groupID: number | null;
  practiceID: number | null;
  facilityID: number | null;
  posID: number | null;
  providerID: number | null;
  referringProviderNPI: string | null;
  referringProviderFirstName: string | null | undefined;
  referringProviderLastName: string | null | undefined;
  referralNumber: string | null;
  supervisingProviderID: number | null;
  panNumber: string | null;
  icd1: string | null | undefined;
  icd2: string | null | undefined;
  icd3: string | null | undefined;
  icd4: string | null | undefined;
  icd5: string | null | undefined;
  icd6: string | null | undefined;
  icd7: string | null | undefined;
  icd8: string | null | undefined;
  icd9: string | null | undefined;
  icd10: string | null | undefined;
  icd11: string | null | undefined;
  icd12: string | null | undefined;
  dischargeDate: string | null | undefined;
  currentIllnessDate: string | null | undefined;
  disabilityBeginDate: string | null | undefined;
  disabilityEndDate: string | null | undefined;
  firstSymptomDate: string | null | undefined;
  initialTreatmentDate: string | null | undefined;
  lmpDate: string | null | undefined;
  lastSeenDate: string | null | undefined;
  lastXrayDate: string | null | undefined;
  simillarIllnesDate: string | null | undefined;
  responsibilityDate: string | null | undefined;
  accidentDate: string | null | undefined;
  accidentTypeID: number | null;
  accidentStateID: number | null;
  labCharges: number | null;
  delayReason: number | null;
  epsdtConditionID: number | null;
  serviceAuthExcepID: number | null;
  specialProgramIndicatorID: number | null;
  orderingProviderID: number | null;
  box19: string | null;
  emg: string | null;
  comments: string | null;
  originalRefenceNumber: string | null;
  claimFrequencyID: number | null;
  conditionCodeID: number | null;
  pwkControlNumber: string | null;
  transmissionCodeID: number | null;
  attachmentTypeID: number | null;
  assignClaimTo: string | null;
  assignUserNote: string | null;
  admissionDate: string | null;
  medicalCaseID: number | null;
}
export interface AdditionalFiedlsPayload {
  dischargeDate: string | null | undefined;
  currentIllnessDate: string | null | undefined;
  disabilityBeginDate: string | null | undefined;
  disabilityEndDate: string | null | undefined;
  firstSymptomDate: string | null | undefined;
  initialTreatmentDate: string | null | undefined;
  lmpDate: string | null | undefined;
  lastSeenDate: string | null | undefined;
  lastXrayDate: string | null | undefined;
  simillarIllnesDate: string | null | undefined;
  responsibilityDate: string | null | undefined;
  accidentDate: string | null | undefined;
  admissionDate: string | null;
  emg: string | null;
  accidentTypeID: number | null;
  accidentStateID: number | null;
  labCharges: number | null;
  delayReason: number | null;
  epsdtConditionID: number | null;
  serviceAuthExcepID: number | null;
  specialProgramIndicatorID: number | null;
  orderingProviderID: number | null;
  box19: string | null;
  comments: string | null;
  originalRefenceNumber: string | null;
  claimFrequencyID: number | null;
  conditionCodeID: number | null;
  pwkControlNumber: string | null;
  transmissionCodeID: number | null;
  attachmentTypeID: number | null;
}
export interface SaveClaimSuccessPayload {
  message: string;
  claimID: number;
  chargeID: number;
}
export interface SaveChargeSuccessPayload {
  chargeID: number;
  errors: [];
}
export interface UpdateChargeSuccessPayload {
  message: string;
}
// SAVE CLAIM/CHARGE/PAYMENT
export interface SaveChargeRequestPayload {
  chargeID: number | null | undefined;
  claimID: number | null | undefined;
  groupID: number | undefined;
  fromDOS: string | null | undefined;
  toDOS: string | null | undefined;
  cptCode: string | null | undefined;
  units: number | null | undefined;
  mod1: string | null | undefined;
  mod2: string | null | undefined;
  mod3: string | null | undefined;
  mod4: string | null | undefined;
  placeOfServiceID: number | null | undefined;
  icd1: string | null | undefined;
  icd2: string | null | undefined;
  icd3: string | null | undefined;
  icd4: string | null | undefined;
  ndcNumber: string | null | undefined;
  ndcUnit: number | null | undefined;
  ndcUnitQualifierID: number | null | undefined;
  serviceDescription: string | null | undefined;
  fee: number | null | undefined;
  insuranceAmount: number | null | undefined;
  patientAmount: number | null | undefined;
  chargeBatchID: number | null | undefined;
  chargePostingDate: string | null | undefined;
  systemDocumentID: number | null | undefined;
  pageNumber: number | null;
  pointers: string | null;
  sortOrder: number | null;
  revenueCode: string;
}
export interface SaveCptNdcRequestPayload {
  cptNdcCrosswalkID: number | null;
  practiceID: number | null;
  cptCode: string | null;
  ndcNumber: string | null | undefined;
  ndcUnitQualifierID: number | null | undefined;
  ndcUnit: number | null | undefined;
  icd1: string | null;
  icd2: string | null;
  serviceDescription: string | null | undefined;
}
export interface SaveCptNdcSuccessPayload {
  cptNDCCrossWalkID: number;
  message: string;
}
export interface SavePaymentRequestPayload {
  appointmentID: number | null;
  patientID: number | null;
  dos: string | null | undefined;
  ledgerAccounID: number | null;
  amount: number | null;
  paymentTypeID: number | null;
  paymentDate: string | null | undefined;
  paymentNumber: string | null;
  comments: string | null;
}
export interface SaveClaimChargePaymentRequestPayload {
  claimJson: SaveClaimRequestPayload;
  chargeJson: SaveChargeRequestPayload | null;
  paymentList: SavePaymentRequestPayload[];
}
export type SaveClaimChargePaymentRequest = {
  type: typeof SAVE_CLAIM_REQUEST;
  payload: SaveClaimChargePaymentRequestPayload;
};
export type SaveClaimChargePaymentSuccess = {
  type: typeof SAVE_CLAIM_SUCCESS;
  payload: SaveClaimSuccessPayload | null;
};
export type SaveClaimChargePaymentFailure = {
  type: typeof SAVE_CLAIM_FAILURE;
  payload: FailurePayload;
};
export type SaveChargeRequest = {
  type: typeof SAVE_CHARGE_REQUEST;
  payload: SaveChargeRequestPayload;
};
export type SaveChargeSuccess = {
  type: typeof SAVE_CHARGE_SUCCESS;
  payload: SaveChargeSuccessPayload;
};
export type SaveChargeFailure = {
  type: typeof SAVE_CHARGE_FAILURE;
  payload: FailurePayload;
};
// Update Charge Request
export type UpdateChargeRequest = {
  type: typeof UPDATE_CHARGE_REQUEST;
  payload: SaveChargeRequestPayload;
};
export type UpdateChargeSuccess = {
  type: typeof UPDATE_CHARGE_SUCCESS;
  payload: UpdateChargeSuccessPayload | null;
};
export type UpdateChargeFailure = {
  type: typeof UPDATE_CHARGE_FAILURE;
  payload: FailurePayload;
};
// Create NDC Rule
export type SaveCptNdcRequest = {
  type: typeof SAVE_CPT_NDC_REQUEST;
  payload: SaveCptNdcRequestPayload;
};
export type SaveCptNdcSuccess = {
  type: typeof SAVE_CPT_NDC_SUCCESS;
  payload: SaveCptNdcSuccessPayload;
};
export type SaveCptNdcFailure = {
  type: typeof SAVE_CPT_NDC_FAILURE;
  payload: FailurePayload;
};
// Search Provider
export interface SearchProviderRequestPayload {
  firstName: string;
  lastName: string;
  taxonomyDescription: string;
  npi: string | null;
  type: string;
  exactMatch: boolean;
  state: string | null;
  zip: string | null;
  limit: string | null;
}
export interface SearchProviderSuccessPayload {
  npi: string;
  providerFirstName: string;
  providerLastName: string;
  providerGenderCode: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  fax: string;
  phone: string;
  zip: string;
  providerTaxonomyCode: string;
  providerLicenseNumber: string;
}
export type SearchProviderRequest = {
  type: typeof SEARCH_PROVIDER_REQUEST;
  payload: SearchProviderRequestPayload;
};
export type SearchProviderSuccess = {
  type: typeof SEARCH_PROVIDER_SUCCESS;
  payload: SearchProviderSuccessPayload[];
};
export type SearchProviderFailure = {
  type: typeof SEARCH_PROVIDER_FAILURE;
  payload: FailurePayload;
};

// EDIT CLAIM

export interface EditClaimSuccessPayload {
  message: string;
  refresh: string;
}
export interface EditClaimFailurePayload {
  message: string;
  errors: string[];
}
export type EditClaimRequest = {
  type: typeof EDIT_CLAIM_REQUEST;
  payload: SaveClaimRequestPayload;
};
export type EditClaimSuccess = {
  type: typeof EDIT_CLAIM_SUCCESS;
  payload: EditClaimSuccessPayload;
};
export type EditClaimFailure = {
  type: typeof EDIT_CLAIM_FAILURE;
  payload: EditClaimFailurePayload;
};

export type SetRouteHistory = {
  type: typeof SET_ROUTE_HISTORY;
  payload: RouteHistoryData[];
};

export type SetGlobalModal = {
  type: typeof SET_GLOBAL_MODAL;
  payload: GlobalModalData | undefined;
};

export type AppSpinnerType = {
  type: typeof SET_APP_SPINNER;
  payload: boolean;
};

export interface BreadcrumData {
  text: string | undefined;
  url: string | undefined;
  isModal?: boolean;
}
// All Claim
export interface GetAllClaimsSearchDataCriteria {
  selector: string;
  claimStatusID?: number;
  scrubStatusID?: string | null;
  submitStatusID?: string | null;
  timelyFiling?: boolean | null;
  fromAgingDays?: number | null;
  toAgingDays?: number | null;
  posID?: string | null;
  assignedTo?: string | null;
  fromDOS?: Date;
  toDOS?: Date;
  fromCreatedOn?: Date;
  toCreatedOn?: Date;
  fromSubmissionDate?: Date;
  toSubmissionDate?: Date;
  categoryID?: number;
  stateCategoryID?: number;
  actionCategoryID?: number;
  getAllData: boolean;
  sortColumn: string;
  sortOrder: string;
  pageNumber: number | undefined;
  pageSize: number | undefined;
  claimIDSearch?: string;
  patientSearch?: string;
  dosSearch?: string;
  insuranceSearch?: string;
  claimStatusIDS?: string | null;
  fromFee?: number | null;
  toFee?: number | null;
  medicalCaseID?: number;
  claimCaseTypeID?: number;
}

export interface GetAllClaimsSearchDataResult {
  id: number;
  claimID: number;
  fromDOS: string;
  toDOS: string;
  dos: string;
  patientID?: number;
  patient: string;
  insuranceID?: number;
  insurance: string;
  aging: string;
  followupDays?: number;
  followupDate: string;
  timelyFiling: boolean;
  scrubStatusID?: number;
  scrubStatus: string;
  scrubStatusColor: string;
  claimStatusID?: number;
  claimStatus: string;
  submitStatusID?: number;
  submitStatus: string;
  fee: number;
  allowable: number;
  adjustments: number;
  insuranceAmount: number;
  insuranceBalance: number;
  patientAmount: number;
  patientBalance: number;
  totalBalance: number;
  groupID?: number;
  group: string;
  groupEIN: string;
  practiceID?: number;
  practice: string;
  practiceAddress: string;
  facilityID?: number;
  facility: string;
  facilityAddress: string;
  posID?: number;
  pos: string;
  providerID?: number;
  provider: string;
  providerNPI: string;
  assigneeID: string;
  assignee: string;
  createdOn: string;
  createdBy: string;
  submittedDate: string;
  categoryID?: number;
  stateCategoryID?: number;
  actionCategoryID?: number;
  total: number;
  assigneeRole?: string;
  claimScreen?: string;
}
export interface GetAllClaimsSearchChargesData {
  id: number;
  claimID: number;
  fromDOS: string;
  toDOS: string;
  dos: string;
  patientID?: number;
  patient: string;
  insuranceID?: number;
  insurance: string;
  aging: string;
  followupDays?: number;
  followupDate: string;
  timelyFiling: boolean;
  scrubStatusID?: number;
  scrubStatus: string;
  scrubStatusColor: string;
  claimStatusID?: number;
  claimStatus: string;
  submitStatusID?: number;
  submitStatus: string;
  fee: number;
  allowable: number;
  adjustments: number;
  insuranceAmount: number;
  insuranceBalance: number;
  patientAmount: number;
  patientBalance: number;
  totalBalance: number;
  groupID?: number;
  group: string;
  groupEIN: string;
  practiceID?: number;
  practice: string;
  practiceAddress: string;
  facilityID?: number;
  facility: string;
  facilityAddress: string;
  posID?: number;
  pos: string;
  providerID?: number;
  provider: string;
  providerNPI: string;
  assigneeID: string;
  assignee: string;
  createdOn: string;
  createdBy: string;
  submittedDate: string;
  categoryID?: number;
  stateCategoryID?: number;
  actionCategoryID?: number;
  total: number;
  assigneeRole?: string;
  claimScreen?: string;
  chargeID: number;
  cpt: string;
}
export interface GetARClaimsSearchChargesData {
  rid: number;
  claimID: number;
  chargeID: number;
  cpt: string;
  fromDOS: string;
  toDOS: string;
  dos: string;
  patientID?: number;
  patient: string;
  insuranceID?: number;
  insurance: string;
  aging: string;
  followupDays?: number;
  followupDate: string;
  lastWorkDate: string;
  unresolvedTasks: number;
  timelyFiling: boolean;
  scrubStatusID?: number;
  scrubStatus: string;
  scrubStatusColor: string;
  claimStatusID?: number;
  claimStatus: string;
  claimStatusColor: string;
  submitStatusID?: number;
  submitStatus: string;
  fee: number;
  allowable: number;
  adjustments: number;
  insuranceAmount: number;
  insuranceBalance: number;
  patientAmount: number;
  patientBalance: number;
  totalBalance: number;
  groupID?: number;
  group: string;
  groupEIN: string;
  practiceID?: number;
  practice: string;
  practiceAddress: string;
  facilityID?: number;
  facility: string;
  facilityAddress: string;
  posID?: number;
  pos: string;
  providerID?: number;
  provider: string;
  providerNPI: string;
  assigneeID: string;
  assignee: string;
  total: number;
  assigneeRole?: string;
}

export interface LinkPaymentPostingCriterea {
  id: number;
  claimID: number;
  chargeID: number;
  patientID?: number;
}
export interface DeleteICDResult {
  id: number;
  message: string;
}

export interface GetChargesDataCriterea {
  userID: string;
  groupID?: number;
  claimID: string;
  chargeID: string;
  patientID: string;
  patientFirstName: string;
  patientLastName: string;
  insuranceID?: number;
  practiceID?: number;
  facilityID?: number;
  providerID?: number;
  referringProvider: string;
  procedureCode: string;
  responsibility: number | null;
  fromDOS?: Date | null;
  toDOS?: Date | null;
  fromEntryDate?: Date | null;
  toEntryDate?: Date | null;
  paymentTypeID?: number;
  secondary?: boolean;
  pageNumber: number;
  pageSize: number;
  sortByColom: string;
  sortOrder: string;
  getAllData?: boolean;
  getOnlyIDS: boolean;
}

export interface GetChargesDataResult {
  id: number;
  claimID: number;
  chargeID: number;
  cpt: string;
  patientID?: number;
  patient: string;
  dos: string;
  dosTo: string;
  fee?: number;
  insuranceAmount?: number;
  insurancePaid?: number;
  insuranceAdjustment?: number;
  insuranceBalance?: number;
  patientAmount?: number;
  patientPaid?: number;
  patientDiscount?: number;
  patientBalance?: number;
  totalBalance?: number;
  groupID?: number;
  group: string;
  groupEIN: string;
  posID?: number;
  pos: string;
  practiceID?: number;
  practice: string;
  practiceAddress: string;
  providerID?: number;
  provider: string;
  providerNPI: string;
  total?: number;
}

export interface GetChargeBatchCriteria {
  batchID: number | undefined;
  statusID: number | undefined;
  fromPostingDate: Date | null;
  toPostingDate: Date | null;
  description: string;
  groupID: number | undefined;
  followUpAssignee: string;
  sortByColumn: string;
  sortOrder: string;
  pageNumber: number;
  pageSize: number;
  getAllData: boolean;
}
export interface GetChargeBatchResult {
  id: number;
  batchID: number;
  batchName: string | null;
  groupID: number;
  group: string;
  groupAddress: string | null;
  description: string;
  statusID: number;
  status: string;
  statusColor: string | null;
  assignee: string;
  postingDate: string | null;
  amount?: number;
  postedAmount?: number | null;
  batchBalance?: number | null;
  chargeCount?: number | null;
  postedChargeCount?: number | null;
  claimsCount?: number | null;
  postedClaimCount?: number | null;
  createdOn: string;
  createdBy: string;
  total: number;
}
export interface TChargeBatchType {
  chargeBatchID?: number | null;
  groupID: number | undefined;
  description: string;
  statusID: number | null;
  postingDate: string;
  chargeCount: number | undefined;
  claimsCount?: number | undefined;
  amount?: number | undefined;
  postedAmount?: number | null;
  batchBalance?: number | null;
  postedChargeCount?: number | null;
  postedClaimCount?: number | null;
  followupAssignee?: string;
  comments?: string;
}

export interface PaymentsStatusCount {
  statusID: number;
  status: string;
  total: number;
}

export interface PaymentsBatchesDataResult {
  id: number;
  batchID: number;
  insuranceID: number | null;
  insurance: string;
  statusID: number | null;
  status: string;
  statusColor: string | null;
  paymentNumber: string;
  paymentDate: string;
  batchAmount: number | null;
  batchBalance: number | null;
  groupID: number;
  group: string;
  groupEIN: string;
  total: number | null;
  deleteDisable: boolean;
}
export interface PaymentsERADataResult {
  id: number;
  eraID: number;
  insurance: string;
  eraStatusID?: number | null;
  eraStatus: string;
  eraStatusColor: string;
  paymentNumber: string;
  paymentDate: string;
  eraAmount?: number | null;
  eraBalance?: number | null;
  payeeName: string;
  payeeNPI: string;
  ediLogID?: number | null;
  batchID?: number | null;
  total?: number | null;
  deleteDisable: boolean;
}
export interface GetPaymentsBatchesResult {
  paymentBatchStats: PaymentsStatusCount[];
  paymentBatchData: PaymentsBatchesDataResult[];
}
export interface GetPaymentsERAResult {
  eraPaymentStats: PaymentsStatusCount[];
  eraPaymentData: PaymentsERADataResult[];
}

export interface GetPaymentBatchCriteria {
  userID: string;
  groupID?: number;
  insuranceID?: number;
  batchID?: number;
  statusID?: number;
  fromBalance?: number;
  toBalance?: number;
  paymentNumber?: string;
  paymentTypeID?: number;
  fromPaymentDate: Date | null;
  toPaymentDate: Date | null;
  fromDepositDate: Date | null;
  toDepositDate: Date | null;
  fromPostingDate: Date | null;
  toPostingDate: Date | null;
  pageNumber: number;
  pageSize: number;
  sortByColumn: string;
  sortOrder: string;
  getAllData?: boolean;
}

export interface GetPatientStatemntCriteria {
  patientID?: number;
  patientLastName: string;
  patientFirstName: string;
  patientDOB: string;
  showRecent: string;
  groupID?: number;
  practiceID?: number;
  providerID?: number;
  facilityID?: number;
  insuranceTypeID?: number;
  patientBalanceFrom?: number;
  patientBalanceTo?: number;
  pageNumber?: number;
  pageSize?: number;
  sortByColumn: string;
  sortOrder: string;
  getOnlyIDS?: boolean;
  getAllData?: boolean;
}
export interface GetPaymentERACriteria {
  eraCheckID?: number;
  paymentNumber?: string;
  fromPaymentDate: Date | null;
  toPaymentDate: Date | null;
  fromDepositDate: Date | null;
  toDepositDate: Date | null;
  fromPostingDate: Date | null;
  toPostingDate: Date | null;
  paymentTypeID?: number;
  groupID?: number;
  insuranceID?: number;
  insurance?: string;
  statusID?: number;
  pageNumber: number;
  pageSize: number;
  sortColumn: string;
  sortOrder: string;
  getAllData?: boolean;
  getOnlyIDS?: boolean;
}

export interface GetPaymentBatchResult {
  id: number;
  batchID: number;
  groupID: number;
  group: string;
  groupAddress: string;
  description: string;
  insuranceID: number | null;
  insurance: string | null;
  statusID: number | null;
  status: string | null;
  paymentType: string;
  paymentNumber: string;
  paymentDate: string;
  postingDate: string;
  depositDate: string;
  insuranceAmount: number | null;
  insurancePaid: number | null;
  insuranceWriteOff: number | null;
  insuranceBalance: number | null;
  patientAmount: number | null;
  patientPaid: number | null;
  patientDiscount: number | null;
  patientBalance: number | null;
  batchBalance: number | null;
  total: number | null;
}

export interface TPaymentBatchType {
  paymentBatchID?: number;
  groupID: number | undefined;
  insuranceID?: number;
  followupAssignee?: string;
  description: string;
  batchStatusID?: number;
  paymentTypeID?: number;
  paymentNumber: string;
  paymentDate: string;
  postingDate: string;
  depositDate: string;
  insuranceAmount?: number;
  insuranceBalance?: number;
  insurancePaid?: number;
  insuranceWriteOff?: number;
  patientAmount?: number;
  patientBalance?: number;
  patientDiscount?: number;
  patientPaid?: number;
  batchBalance?: number;
}
export interface TDocumentBatchType {
  id?: number;
  description: string;
  groupID?: number;
  practiceID?: number;
  group: string;
  groupEIN: string;
  postDate: string;
  followupAssigneeID: string;
  followupAssignee?: string;
  followupAssigneeRole: string;
  batchStatusID?: number;
  batchStatus: string;
  batchStatusColor: string;
  batchTypeID?: number;
  batchType: string;
  batchStatusTime: string;
  lockboxTypeID?: number;
  lockboxType?: string;
}
export interface TPaymentBatchDetailType {
  paymentBatchID: number;
  description: string;
  groupID: number;
  group: string;
  groupEIN: string;
  paymentNumber: string;
  paymentDate: string;
  postingDate: string;
  depositDate: string;
  assigneeID: string;
  assignee: string;
  assigneeRole: string;
  batchStatusID?: number;
  batchStatus: string;
  batchStatusColor?: string;
  batchStatusTime?: string | null;
  insuranceAmount?: number;
  insurancePaid?: number;
  insuranceWriteOff?: number;
  insuranceBalance?: number;
  patientAmount?: number;
  patientPaid?: number;
  patientDiscount?: number;
  patientBalance?: number;
  batchBalance?: number;
}
export interface TChargeBatchDetailType {
  id: number;
  description: string;
  groupID: number;
  group: string;
  groupEIN: string;
  postingDate: string;
  batchAssignedToID: string;
  batchAssignedTo: string;
  batchAssignedToRole: string;
  batchStatusID: number;
  batchStatus: string;
  batchStatusColor: string;
  batchStatusTime: Date;
  chargesCount: number;
  postedChargesCount: number;
  claimsCount: number;
  postedClaimsCount: number;
  totalAmount: number;
  totalPostedAmount: number;
  batchBalance: number;
}
export interface ChargeBatchChargesResult {
  rid: number;
  claimID: number;
  chargeID: number;
  cptCode: string;
  fromDOS: string;
  toDOS: string;
  fee: number;
  claimCreatedOn: string;
  claimCreatedByID: string;
  claimCreatedBy: string;
  chargeBatchID: number;
  chargeBatch: string;
  systemDocumentID: number;
  systemDocument: string;
  pageNumber: number;
  batchPostingDate: string;
  total: number;
}

export interface TPaymentERADetailType {
  eraID: number;
  insurance: string;
  payeeName: string;
  payeeNPI: string;
  paymentNumber: string;
  paymentDate: string;
  paymentTypeID: number | null;
  paymentType: string;
  depositDate: string;
  eraStatusID: number | null;
  eraStatus: string;
  eraStatusColor: string;
  eraStatusTime: string | null;
  claimsTotalCount: number | null;
  claimsLinkedCount: number | null;
  claimsPostedCount: number | null;
  chargesTotalCount: number | null;
  chargesLinkedCount: number | null;
  chargesPostedCount: number | null;
  totalPaid: number | null;
  totalPosted: number | null;
  eraBalance: number | null;
}

export interface GetERADetailSummary {
  eraID: number;
  provider: string;
  providerNPI: string;
  eraDate: string;
  checkNumber: string;
  claimsCount: number;
  billedAmount: number;
  adjustmentAmount: number;
  allowedAmount: number;
  coInsuranceAmount: number;
  deductibleAmount: number;
  patientResponsibilityAmount: number;
  paidAmount: number;
  checkAmount: number;
  eraClaimsData: GetERAClaimList[];
}

export interface GetPaymentPostingErrorsResult {
  validationErrorID: number;
  postingID: number;
  claimID: number;
  fromDos: string;
  toDos: string;
  reason: string;
  severity: string;
  color: string;
  disablePayment: boolean;
}

export interface GetDocumentsProcessingErrorsResult {
  documentErrorID: number;
  documentID: number;
  errorMessage: string;
  documentTitle: string;
}

export interface ApplyPaymentPostingRsult {
  message: string;
  errors: GetPaymentPostingErrorsResult[];
}

export interface GetERADetailCharges {
  id: number;
  claimID: number | null;
  chargeID: number | null;
  patientID: number | null;
  patientFirstName: string;
  patientLastName: string;
  dos: string;
  dosTo: string;
  insurance: string;
  cpt: string;
  adjustmentCodes: string;
  remarkCodes: string;
  fee: number | null;
  allowed: number | null;
  adjustment: number | null;
  coInsurance: number | null;
  deductible: number | null;
  copay: number | null;
  patientResponsibility: number | null;
  linked: boolean | null;
  posted: boolean | null;
}

interface GetERAClaimList {
  id: number;
  patient: string;
  patientID: string;
  billedAmount: number;
  paidAmount: number;
  createdOn: string;
}

export interface ProcedureTransactionHistoryReportCriteria {
  groupID: number | undefined;
  practiceID: number | undefined;
  facilityID: number | undefined;
  posID: number | undefined;
  fromDOS: string | null;
  toDOS: string | null;
  claimID: string;
  cptCode: string;
  chargeID: string;
  patientFirstName: string;
  patientLastName: string;
  patientID: string;
  insuranceID: number | undefined;
  providerID: number | undefined;
  fromPostingDate: string | null;
  toPostingDate: string | null;
  pageNumber: number | undefined;
  pageSize: number | undefined;
  sortColumn: string;
  sortOrder: string;
  getAllData: boolean;
  getOnlyIDS: boolean;
}
export interface ProcedureTransactionHistoryReportResult {
  rid: number;
  cpt: string;
  practiceID: number;
  practice: string;
  practiceAddress: string;
  facilityID?: number;
  facility: string;
  facilityAddress: string;
  pos: string;
  providerID: number;
  provider: string;
  providerNPI: string;
  insuranceID?: number;
  insurance: string;
  patientID: number;
  patient: string;
  fromDOS: string;
  toDOS: string;
  chargeID: number;
  claimID: number;
  adjCodes: string;
  ledgerID: number;
  ledgerName: string;
  ledgerType: string;
  paymentType: string;
  paymentNumber: string;
  amount: number;
  paymentDate: string;
  postingDate: string;
  depositDate: string;
  fee: number;
  allowed: number;
  adjustments: number;
  deductible: number;
  coinsurance: number;
  createdByID: string;
  createdBy: string;
  total: number;
}

export interface GetChargeDetailReportCriteria {
  groupID?: number;
  practiceID?: number;
  facilityID?: number;
  providerID?: number;
  claimID: string;
  cpt: string;
  chargeID: string;
  referringProvider?: string;
  fromDOS: string;
  toDOS: string;
  patientFirstName: string;
  patientLastName: string;
  patientID?: number;
  insuranceID?: number;
  responsibility?: number;
  pageNumber?: number;
  pageSize?: number;
  sortByColumn: string;
  sortOrder: string;
  getAllData?: boolean;
  getOnlyIDS?: boolean;
}
export interface GetChargeDetailReportResult {
  rid: number;
  chargeID: number;
  claimID: number;
  cpt: string;
  patientID: number;
  patient: string;
  patientInsuranceID: number;
  insuranceID: number;
  insurance: string;
  fromDOS: string;
  toDOS: string;
  practiceID: number;
  practice: string;
  practiceAddress: string;
  providerID: number;
  providerNPI: string;
  provider: string;
  units: number;
  fee: number;
  icd1: string;
  icd2: string;
  icd3: string;
  icd4: string;
  modifier1: string;
  modifier2: string;
  claimStatusID: number;
  claimStatus: string;
  claimStatusColor: string;
  authorizationNumber: string;
  wcNumber: string;
  referringProvider: string;
  referringProviderNPI: string;
  insuranceAmount: number;
  insurancePaid: number;
  insuranceAdjustment: number;
  insuranceBalance: number;
  patientAmount: number;
  patientPaid: number;
  patientAdjustment: number;
  patientBalance: number;
  totalBalance: number;
  totalCount: number;
}

export interface GetDenialReportCriteria {
  groupID?: number;
  practiceID?: number;
  facilityID?: number;
  providerID?: number;
  eraCheckID?: number;
  paymentNumber: string;
  groupCode?: string;
  reasonCode?: string;
  remarkCode?: string;
  claimID: string;
  cpt: string;
  chargeID: string;
  fromCreateDate: string;
  toCreateDate: string;
  claimType: string;
  patientFirstName: string;
  patientLastName: string;
  insuranceID?: number;
  pageNumber?: number;
  pageSize?: number;
  sortByColumn: string;
  sortOrder: string;
  getAllData?: boolean;
  getOnlyIDS?: boolean;
}

export interface GetDenialReportResult {
  rid: number;
  groupID: number;
  group: string;
  groupEIN: string;
  claimID: number;
  chargeID: number;
  patientID: number;
  patient: string;
  cpt: string;
  modifier: string;
  adjustementCodes: string;
  remarkCode: string;
  dos: string;
  payerClaimNumber: string;
  eraID: number;
  paymentBatchID: number;
  paymentNumber: string;
  paymentDate: string;
  eraInsurance: string;
  insurance: string;
  crossoverCarrierID: string;
  crossoverCarrierName: string;
  billStatusCodeID: number;
  createdOn: string;
  totalCount: number;
}

export interface GetPaymentReportCriteria {
  groupID: number | undefined;
  practiceID: number | undefined;
  facilityID: number | undefined;
  providerID: number | undefined;
  ledgerAccount: number | undefined;
  paymentType: number | undefined;
  createdBy: string | undefined;
  fromCreatedDate: Date | null;
  toCreatedDate: Date | null;
  fromPostingDate: Date | null;
  toPostingDate: Date | null;
  fromDepositDate: Date | null;
  toDepositDate: Date | null;
  claimCreatedFrom: Date | null;
  claimCreatedTo: Date | null;
  claimCreatedBy: string | undefined;
  claimID: number | undefined;
  cpts: string[];
  chargeID: number | undefined;
  firstName: string | undefined;
  lastName: string | undefined;
  patientID: number | undefined;
  insuranceID: number | undefined;
  responsibility: number | null;
  sortByColumn: string;
  sortOrder: string;
  pageNumber: number | undefined;
  pageSize: number | undefined;
  getAllData: boolean | undefined;
  getOnlyIDS: boolean | undefined;
  zipCode: string | undefined;
  reasonCode: string | undefined;
  groupCode: string | undefined;
  totalPaymentsBy: string | undefined;
}

export interface DocumentSearchCriteria {
  groupIDS: number;
  batchTypeID?: number;
  batchID?: number;
  batchStatusID?: number;
  documentText?: string;
  documentTags?: string;
  sortColumn?: string;
  sortOrder?: string;
  pageNumber: number;
  pageSize: number;
  getAllData: boolean;
}

export interface BatchSearchCriteria {
  groupIDS?: number;
  practiceIDS?: number;
  batchID?: number;
  batchTypeID: string[];
  statusID?: number;
  assigneeUser: string;
  description: string;
  pageNumber: number;
  pageSize: number;
  followUpAssignee?: string;
  followupAssigneeID?: number;
  sortByColumn?: string;
  sortOrder: string;
  getAllData: boolean;
  getOnlyIDs: boolean;
}

export interface BatchDetailCriteria {
  attachedID?: number;
  typeID?: string;
  pageNumber: number;
  pageSize: number;
  sortByColumn?: string;
  sortOrder: string;
  getAllData: boolean;
  getOnlyIDs: boolean;
}

export interface GetDocumentSearchAPIResult {
  documentID: number;
  documentName: string;
  documentType: string;
  documentTags: string;
  createdOn: string;
  createdBy: string;
  batchID: number;
  batchTypeID: number;
  batchType: string;
  pageNumber: string;
  tags: string;
  total: number;
}

export interface GetBatchSearchAPIResult {
  rid?: number;
  documentBatchID?: number;
  description: string;
  status: string;
  batchTypeID: string;
  batchType: string;
  followupAssigneeID: string;
  followUpAssignee: string;
  createdBy: string;
  createdOn: string;
  total: number;
}
export interface GetPaymentReportResult {
  id: number;
  practiceID: number | null;
  practice: string;
  practiceAddress: string;
  facilityID?: number;
  facility: string;
  facilityAddress: string;
  patient: string;
  patientID: number | null;
  batchID: number | null;
  claimID: number | null;
  chargeID: number | null;
  cpt: string;
  ledgerID: number | null;
  ledgerName: string;
  ledgerTypeID: number | null;
  ledgerType: string;
  paymentType: string;
  providerID: number | null;
  provider: string;
  providerNPI: string;
  paymentNumber: string;
  amount: number | null;
  fromDOS: string;
  toDOS: string;
  paymentDate: string;
  postingDate: string;
  depositDate: string;
  createdOn: string;
  createdBy: string;
  claimCreatedOn: string;
  claimCreatedBy: string;
  comments: string;
  total: number | null;
  zipCode: string | null;
  reasonCode: string | null;
  groupCode: string | null;
}
export interface GetPaymentReportsSummaryResult {
  ledgerAccount: string;
  totalAmount: number | null;
}
export interface GetPaymentReportsAPIResult {
  summary: GetPaymentReportsSummaryResult[];
  paymentReportsData: GetPaymentReportResult[];
}

export interface GetClaimStatusHistoryDetailResult {
  statusID: number;
  logID: number;
  source: string;
  status: string;
  receiveData: string;
  reportDate: string;
  createdOn: Date;
}
export interface GetClaimStatusHistoryViewDetailResult {
  id: number;
  statusID: number;
  categoryCode: string;
  statusCode: string;
  entityIdentifierCode: string;
  freeFormText: string;
}
export interface GetRealTimeClaimStatusResult {
  statusID: number;
  status: string;
  statusTime: string;
  lastValidation: string;
  createdOn: Date;
  createdBy: string;
}
export interface GetRealTimeClaimStatusViewDetailResult {
  id: number;
  eventType: string;
  color: string;
  description: string;
  timeStamp: string;
  user: string;
}
export interface PaymentBatchPaidChargesResult {
  paymentBatchID: number;
  totalClaimCount: number;
  totalChargeCount: number;
  fee: number;
  insurancePaid: number;
  insuranceAdjustment: number;
  patientResponsibility: number;
  patientPaid: number;
  patientDiscount: number;
  paidCharges: GetPaymentBatchPaidChargesDataResult[];
}

export interface GetPaymentBatchPaidChargesDataResult {
  id: number;
  claimID: number;
  cpt: string;
  patientID: number | null;
  patient: string;
  dos: string;
  dosTo: string;
  fee: number | null;
  insuranceAmount: number | null;
  insurancePaid: number | null;
  insuranceAdjustment: number | null;
  insuranceBalance: number | null;
  patientAmount: number | null;
  patientPaid: number | null;
  patientDiscount: number | null;
  patientBalance: number | null;
  claimBalance: number | null;
  groupID: number | null;
  group: string;
  groupEIN: string | null;
  practiceID: number | null;
  practice: string;
  practiceAddress: string;
  posID: number | null;
  pos: string;
  providerID: number | null;
  provider: string;
  providerNPI: string;
  total: number | null;
}

export interface TPaymentLedgerByBatchIDResult {
  id: number;
  ledgerID: number;
  ledgerAccountID: number | null;
  ledgerAccount: string;
  claimID: number | null;
  chargeID: number | null;
  insuranceID: number | null;
  insurance: string;
  paymentType: string;
  paymentNumber: string;
  paymentDate: string;
  depositDate: string;
  amount: number | null;
  comments: string | null;
  createdOn: string;
  createdBy: string;
  total: number;
}

export interface TPaymentPostingResult {
  id: number;
  userID: string;
  user: string;
  insurancePayment?: number;
  insuranceAdjustment?: number;
  patientPayment?: number;
  patientAdjustment?: number;
  totalPayment?: number;
  totalAdjustment?: number;
}

export interface TBatchUploadedDocument {
  id: number | undefined;
  title: string;
  documentType: string;
  createdOn: string;
  createdBy: string;
  file: File | undefined;
  documentPath: string;
  active: boolean | null;
  documentStatus: string;
  category: string;
  additionalComment1: string;
  additionalComment2: string;
  total: number;
}
export interface GetAllClaimsSearchDataClaimIDSResult {
  claimID: number;
}
export interface GetAllPatientsSearchDataPatientIDSResult {
  patientID: number;
}

interface StatsType {
  id: number;
  value: string;
  count: number;
}

interface ActionCategories {
  id: number;
  value: string;
  count: number;
  statuses: StatsType[];
}

export interface GetAllClaimsSearchStatusCategories {
  count: number;
  stateCategories: StatsType[];
  actionCategories: ActionCategories[];
  categories: StatsType[];
}

export interface AllClaimsSearchResultType {
  id: number;
  claimID: number;
  dos: string;
  patient: string;
  insurance: string;
  aging: string;
  followUp: string;
  timelyFilling: boolean;
  scrubStatusID?: number;
  scrubStatus: string;
  claimStatusID?: number;
  claimStatus: string;
  fee: number;
  allowable: number;
  adjustments?: number;
  insuranceBalance?: number;
  patientBalance?: number;
  insuranceResponsibility: number;
  patientResponsibility: number;
  totalBalance: number;
  group: string;
  practice: string;
  facility: string;
  placeOfServide: string;
  provider: string;
  assignee: string;
  location: string;
  assigneeRole: string;
  followUpDate: string;
}
export interface DocumentsExpandRowResult {
  documentID: number;
  pageNumber: string;
  documentType: string;
}
export interface AllClaimsExpandRowResult {
  chargeID: number;
  claimID: number;
  claimStatus: string;
  claimStatusColor: string;
  chargeStatus: string;
  chargeStatusColor: string;
  cpt: string;
  units: number;
  mod: string;
  icds: string;
  fee: number;
  allowable: number;
  insuranceAmount: number;
  insuranceBalance: number;
  patientAmount: number;
  patientBalance: number;
}

interface ARClaimsByFollowUPDay {
  id: number;
  value: string;
  count: number;
}
interface ARClaimsByWorkDate {
  id: number;
  value: string;
  count: number;
}
interface UnResolvedARClaimTasks {
  taskID: number;
  claimID: number;
  dueDate: string;
  taskColor: string;
}
export interface GetARClaimsSectionCategories {
  totalCount: number;
  totalUnResolvedTasksCount: number;
  arClaimsByFollowUPDays: ARClaimsByFollowUPDay[];
  arClaimsByWorkDates: ARClaimsByWorkDate[];
  unResolvedTasksData: UnResolvedARClaimTasks[];
}
// AR Claims
export interface GetARClaimsSearchDataCriteria {
  groupID?: number;
  fromCreatedOn?: Date;
  toCreatedOn?: Date;
  fromDOS?: Date;
  toDOS?: Date;
  fromSubmissionDate?: Date;
  toSubmissionDate?: Date;
  claimStatusIDS: string;
  scrubStatusIDS: string;
  submitStatusIDS: string;
  timelyFiling?: boolean;
  fromAgingDays?: number;
  toAgingDays?: number;
  fromFee?: number;
  toFee?: number;
  posIDS: string;
  assignedTo: string;
  claimIDSearch: string;
  patientSearch: string;
  dosSearch: string;
  insuranceSearch: string;
  arByFollowUP: string;
  arByWorkDate: string;
  pageNumber?: number;
  pageSize?: number;
  sortColumn: string;
  sortOrder: string;
  getAllData?: boolean;
  getOnlyIDS?: boolean;
  claimCaseTypeID?: number;
}
export interface GetARClaimsSearchDataResult {
  rid: number;
  claimID: number;
  fromDOS: string;
  toDOS: string;
  patientID: number;
  patient: string;
  insuranceID: number;
  insurance: string;
  aging: number;
  followupDays: number;
  followupDate: string;
  lastWorkDate: string;
  unresolvedTasks: number;
  timelyFiling: boolean;
  scrubStatusID: number;
  scrubStatus: string;
  scrubStatusColor: string;
  claimStatusID: number;
  claimStatus: string;
  claimStatusColor: string;
  submitStatusID: number;
  submitStatus: string;
  fee: number;
  allowable: number;
  adjustments: number;
  insuranceAmount: number;
  insuranceBalance: number;
  patientAmount: number;
  patientBalance: number;
  totalBalance: number;
  groupID: number;
  group: string;
  groupEIN: string;
  practiceID: number;
  practice: string;
  practiceAddress: string;
  facilityID: number;
  facility: string;
  facilityAddress: string;
  posID: number;
  pos: string;
  providerID: number;
  provider: string;
  providerNPI: string;
  assigneeID: string;
  assignee: string;
  assigneeRole: string;
  total: number;
}

export interface CreateCrossoverCriteria {
  claimID: number;
  chargeID: number;
  patientID: number;
  paymentTypeID?: number;
  batchID?: number;
  checkDate?: Date;
  postingDate?: Date;
  depositDate?: Date;
  checkNumber?: string;
  secondaryInsuranceID: number | null;
  secondaryInsuranceAmount: number;
  crossoverAssigneeID: string;
  crossoverClaimNote: string;
  crossover?: boolean;
}
export interface ClaimICDsResultPayload {
  order: number;
  id: number;
  code: string;
  description: string;
  validity: string;
}
export interface GetAllPatientsSearchDataCriteria {
  groupID?: number;
  practiceID?: number;
  facilityID?: number;
  providerID?: number;
  patientID?: number;
  insuranceID?: number;
  firstName: string;
  lastName: string;
  dob?: Date;
  active?: boolean | null;
  pageNumber: number;
  pageSize: number;
  sortColumn: string;
  sortOrder: string;
  getAllData: boolean;
  exportData?: boolean;
}
export interface GetAllPatientsSearchDataResult {
  id: number;
  firstName: string;
  lastName: string;
  gender: string;
  dob: string;
  primaryInsurance: string;
  address: string;
  groupID?: number;
  groupName: string;
  groupEIN: string;
  practiceName: string;
  practiceAddress: string;
  active: string;
  createdOn: string;
  createdBy: string;
  totalCount: number;
  createdByRole: string;
}
export interface ClaimChargesResultPayload {
  fromDOS: string | null;
  toDOS: string | null;
  cptCode: string | null;
  units: number | null;
  mod1: string | null;
  mod2: string | null;
  mod3: string | null;
  mod4: string | null;
  placeOfServiceID: number | null;
  chargeID: number | null;
  icd1: string | null;
  icd2: string | null;
  icd3: string | null;
  icd4: string | null;
  ndcNumber: string | null;
  ndcUnit: number | null;
  ndcUnitQualifierID: number | null;
  serviceDescription: string | null;
  fee: number | null;
  insuranceAmount: number | null;
  patientAmount: number | null;
  chargeBatchID: number | null;
  chargePostingDate: string | null;
  systemDocumentID: number | null;
  pageNumber: number | null;
  pointers: string | null;
  sortOrder: number | null;
  revenueCode: string;
}
export interface SummaryCodeLookup {
  code: string;
  description: string;
}
export interface SummaryBillingCharges {
  claimID?: number;
  chargeID: number;
  cpt: string;
  cptDescription: string;
  icd1: string;
  icd2: string;
  icd3: string;
  icd4: string;
  chargeStatusID: number;
  chargeStatus: string;
  groupCodes: SummaryCodeLookup[];
  reasonCodes: SummaryCodeLookup[];
  remarkCodes: SummaryCodeLookup[];
  fee: number;
  adjustments: number;
  writeOFF: number;
  expected: number;
  insuranceAmount: number;
  insuranceAdjustment: number;
  insurancePaid: number;
  insuranceBalance: number;
  patientAmount: number;
  patientAdjustment: number;
  patientPaid: number;
  patientBalance: number;
  totalBalance: number;
  sortOrder: number;
  fromDOS?: string;
  toDOS?: string;
  units: number;
}
export interface ClaimAdvancePaymentPayload {
  ledgerAccounID: number | null;
  paymentDate: string | null;
  amount: number | null;
  paymentTypeID: number | null;
}
export interface InsuranceInfoData {
  id: number;
  name: string;
  phoneNumber: string;
  address: string;
  email?: string;
}
export interface ChargeStatus {
  id: number;
  cpt: string;
  chargeStatusID: number;
  chargeStatus: string;
}

export interface ValidateAddressDataType {
  id?: number;
  firmName: string;
  contact?: number;
  contactEmail: string;
  address1: string;
  address2: string;
  city: string;
  state?: string | null;
  zip: string;
  zipPlus4: string;
  error: string;
  validateID?: number;
  validateOn: string | null;
}

export interface ValidateDemographicResponseDate {
  response: string;
  data: ValidateDemographicDataType | null;
}

export interface AdvancePayemntData {
  withDOSAmount: number;
  withoutDOSAmount: number;
  totalBalance: number;
  patientAdvancePayments: AdvancePayemntType[] | [];
}

export interface AdvancePayemntType {
  paymentLedgerID: number;
  appointmentID: number | null;
  checkDate: string;
  postingDate: string | null;
  dos: string | null;
  amount: number;
  ledgerAccountID: number;
  ledgerName: string;
  checkNumber: string;
  paymentTypeID: number;
  paymentType: string;
  comments: string;
  claimID: number | null;
  chargeID: number | null;
  createdOn: string;
  createdBy: string;
  appliedAmount: number;
  ledgerCategoryID: number;
  ledgerTypeID: number;
  parentID: number | null;
  dosDisable: boolean;
  reverseDisable: boolean;
}

export interface InsurancerFinderData {
  message: string;
  data: InsurancerFinderDataType[] | [];
}
export interface SearchWriteOffResult {
  claimID: number;
  groupID: number;
  group?: string;
  groupEIN?: string;
  practiceID?: number;
  practice?: string;
  practiceAddress?: string;
  patientID?: number;
  patient?: string;
  fromDOS?: string;
  toDOS?: string;
  claimStatusID?: number;
  claimStatus?: string;
  claimStatusColor?: string;
  fee?: number;
  insuranceAmount?: number;
  insurancePaid?: number;
  insuranceAdjustment?: number;
  insuranceBalance?: number;
  patientAmount?: number;
  patientPaid?: number;
  patientDiscount?: number;
  patientBalance?: number;
  claimBalance?: number;
  createdOn?: string;
  total?: number;
}
export interface SaveWriteOffCriteria {
  claimIDS: string;
  writeOffComments: string;
  postingDate: string;
  depositDate: string;
  writeOffType: string;
}
export interface SearchWriteOffCriteria {
  groupID: number | null;
  practiceID?: number;
  facilityID?: number;
  posID?: number;
  claimID?: number;
  claimStatus?: number;
  fromDOS?: Date | null;
  toDOS?: Date | null;
  claimType?: string;
  fromBalanceAmount?: number;
  toBalanceAmount?: number;
  firstName?: string;
  lastName?: string;
  patientID?: number;
  insuranceID?: number;
  writeOffType?: string;
  providerID?: number;
  sortByColumn?: string;
  sortOrder?: string;
  pageNumber?: number;
  pageSize?: number;
  getAllData?: boolean;
  getOnlyClaimsIDS?: boolean;
}
export interface InsurancerFinderDataType {
  eligibilityResponseID: number | null;
  payerName: string;
  payerID: number | null;
  subscriberName: string;
  subscriberID: string;
  subscriberDOB: string;
  subscriberGender: string;
  subscriberAddress: string;
  confidenceScore: string;
  confidenceScoreReason: string;
  policyStartDate: string;
  policyEndDate: string;
  insuranceID: number | null;
  subscriberRelationID: number | null;
  subscriberFirstName: string;
  subscriberMiddleName: string;
  subscriberLastName: string;
  subscriberGenderID: number | null;
  subscriberAddress1: string;
  subscriberCity: string;
  subscriberState: string;
  subscriberZipCode: string;
}

export interface SaveAdvancePayment {
  appointmentID: number | null;
  patientID: number | null;
  paymentDate: string;
  postingDate: string;
  dos: string;
  amount: number;
  paymentTypeID: number | null;
  ledgerAccounID: number | null;
  paymentNumber: string;
  comments: string;
  insuranceID: number | null;
  subscriberRelationID: number | null;
  subscriberFirstName: string;
  subscriberMiddleName: string;
  subscriberLastName: string;
  subscriberGenderID: number;
  subscriberAddress1: string;
  subscriberCity: string;
  subscriberState: string;
  subscriberZipCode: string;
}
export interface ValidateDemographicDataType {
  status: string;
  confidenceScore: string;
  addressDateReported: string;
  correctedFirstname: string;
  correctedLastname: string;
  correctedMiddlename: string;
  correctedSuffix: string | null;
  correctedAddress: string;
  correctedCity: string;
  correctedState: string;
  correctedZip: string;
  correctedSSN: string;
  correctedDOB: string;
  noHit: boolean | undefined;
  accuracy: string;
  warnings: string | null;
  redFlags: string | null;
  phoneNumber: string;
  phoneType: string;
  gender: string;
  deceased: boolean | undefined;
  demographicVerifiedOn: string;
}

export interface PatientFinicalTabData {
  patientID: number | null;
  lastPatientPayment: number;
  lastPatientPaymentDate: string;
  lastPatientStatement: number;
  lastPatientStatementDate: string;
  lastPatientStatementDays: number;
  lastPatientStatementType: null;
  financials: FinancialsType[];
}

export interface FinancialsType {
  id: number;
  patientID: number;
  responsibility: string;
  current: number;
  plus30: number;
  plus60: number;
  plus90: number;
  plus180: number;
  balance: number;
}

export interface TimeFrameData {
  claimID: number;
  patientID: number;
  patient: string;
  dos: string;
  toDOS: string;
  agingType: string;
  agingDays: number;
  aging: string;
  insuranceID: number | null;
  insurance: string | null;
  groupID: number;
  group: string;
  groupEIN: string;
  racticeID: number;
  practice: string;
  practiceAddress: string;
  facilityID: number;
  facility: string;
  facilityAddress: string;
  providerID: number;
  provider: string;
  providerNPI: string;
  claimStatusID: number;
  claimStatus: string;
  claimStatusColor: string;
  posID: number;
  pos: string;
  insuranceAmount: number;
  insurancePaid: number;
  insuranceBalance: number;
  patientAmount: number;
  patientPaid: null;
  patientBalance: number;
  totalBalance: number;
  total: number;
}

export interface UpdateDosData {
  dos: string;
  advancePaymentID: number | null;
}

export interface RefundPaymentData {
  advancePaymentID?: Date;
  postingDate?: Date | null;
  amount?: number;
}

export interface AddPatientCopaymentResponce {
  advancePaymentID: number | null;
  message: string;
  errors: [];
}

export interface SaveGauranterData {
  patientID: number | null;
  guarantorRelationID: number | null;
  relation: string;
  active: boolean;
  groupID: number | null;
  firstName: string;
  middleName: string | null;
  lastName: string;
  genderID: number | null;
  dob: string;
  address1: string;
  address2: string | null;
  zipCodeExtension: string;
  city: string;
  state: string;
  zipCode: string;
  homePhone: string;
  officePhone: string;
  cell: string;
  fax: string;
  email: string;
  ssn: string;
}

export interface UpdateGauranterData {
  patientGuarantorID?: number;
  patientID: number | null;
  guarantorRelationID?: number;
  relation: string;
  active: boolean;
  groupID: number | null;
  firstName: string;
  middleName: string | null;
  lastName: string;
  genderID: number | null;
  dob: string;
  address1: string;
  address2: string | null;
  zipCodeExtension: number;
  city: string;
  state: string;
  zipCode: number;
  homePhone: string;
  officePhone: string;
  cell: string;
  fax: string;
  email: string;
  ssn: string;
}

export interface RelatedClaims {
  id: number;
  value: string;
}
export interface ClaimDetailResultById {
  id: number;
  patientID: number;
  patient: string;
  dosFrom: string;
  dosTo: string;
  icn: string;
  groupID: number;
  group: string;
  groupEIN: number;
  providerID: number;
  provider: string;
  providerNPI: string;
  assigneeID: number;
  assignee: string;
  assigneeRole: string;
  claimStatusID: number;
  claimStatus: string;
  claimStatusTime: string;
  claimTypeID: number;
  claimType: string;
  insuranceID: number;
  insurance: string;
  insuranceType: string;
  submissionCount: string;
  lastAction: string;
  lastActionType: string;
  lastActionTime: string;
  lastActionStatusFrom: string;
  lastActionStatus: string;
  totalFee: string;
  totalBalance: string;
  charges: ChargeStatus[];
  relatedClaims: RelatedClaims[];
  scrubStatusID: number;
  scrubStatus: string;
}
export interface ClaimDataByClaimIDResult {
  claimID: number;
  claimStatusID: number;
  scrubStatusID: number;
  submitStatusID: number;
  patientID: number;
  patientName: string;
  patientInsuranceID: number;
  patientInsurance: string;
  subscriberID: string;
  insuranceID: number;
  subscriberRelation: string;
  dosFrom: string;
  dosTo: string | null;
  groupID: number;
  practiceID: number;
  facilityID: number;
  posID: number;
  providerID: number;
  referringProviderID: number | null;
  referralNumber: number | string | null;
  supervisingProviderID: number | null;
  panNumber: number | string | null;
  assignClaimTo: string | null;
  assignUserNote: string | null;
  assignmentBelongsToID: number;
  advancePayments: ClaimAdvancePaymentPayload[];
  icds: ClaimICDsResultPayload[];
  charges: ClaimChargesResultPayload[];
  additionalFieldsData: AdditionalFiedlsPayload;
  claimTypeID: number;
  referringProviderLastName: string;
  referringProviderFirstName: string;
  medicalCaseID?: number;
}

export interface ClaimLogItem {
  id: number;
  tagID?: number;
  tag: string;
  section: string | null;
  linkID?: number | null;
  type: string | null;
  title: string | null;
  fromValue: string | null;
  fromLabel: string | null;
  fromLabelColor?: string | null;
  toValue: string | null;
  toLabel: string | null;
  toLabelColor?: string | null;
  logTime?: string;
  logUserID: string;
  logUserName: string;
}
export interface ClaimStatusDays {
  statusID: number;
  status: string;
  days: number;
}
export interface ClaimFinancials {
  claimID: number;
  chargesFee: number;
  adjustments: number;
  writeOFF: number;
  expected: number;
  insuranceAmount: number;
  insuranceAdjustment: number;
  insurancePaid: number;
  insuranceBalance: number;
  patientAmount: number;
  patientAdjustment: number;
  patientPaid: number;
  patientBalance: number;
  totalClaimBalance: number;
  paymentLedgers: PaymentLedgerType[];
}
export interface ReversePaymetLedgerFields {
  ledgerID: number | undefined;
  postingDate: string;
}
export interface PostingDateCriteria {
  id: number | null | undefined;
  type: string;
  postingDate: string;
}
export interface PostingDateResult {
  message: string;
  postingCheck: boolean;
}
export interface EDIImportDropdown {
  id: number;
  value: string;
}
export interface ViewReportLog {
  message: string;
  data: string;
}
export interface GetPaymentBatchStatusResult {
  id: number;
  statusID: number;
  submissionBatchID: number;
  functionalIdentifier?: string;
  resultStatus?: string;
  noOfTransactionSets?: string;
  noOfReceivedTransactionSets?: string;
  noOfAcceptedTransactionSets?: string;
}
export interface EDIImportLogCriteria {
  groupID?: number;
  ediLogID?: number;
  status: string | undefined;
  reportType: string | undefined;
  fromCreatedOn: Date | null;
  toCreatedOn: Date | null;
  pageNumber: number;
  pageSize: number;
  sortByColumn: string;
  sortOrder: string;
  getAllData: boolean;
  getOnlyIDS: boolean;
}
export interface GetEDIImportLogAPIResult {
  rid?: number;
  ediLogID?: number;
  errorMessage: string;
  groupID: number;
  group: string;
  groupEIN: string;
  reportType: string;
  fileName: string;
  ediStatus: string;
  createdOn?: Date;
  total?: number;
}

export interface ERACheckReportCriteria {
  groupID?: number;
  eraCheckID?: string;
  fromCheckDate?: Date;
  toCheckDate?: Date;
  fromCreatedDate?: Date;
  toCreatedDate?: Date;
  insuranceID?: number;
  insurance?: string;
  checkNumber?: string;
  pageNumber: number;
  pageSize?: number;
  sortByColumn: string;
  sortOrder: string;
  getAllData: boolean;
  getOnlyIDS: boolean;
  ediLogID?: string;
}

export interface ERACheckReportAPIResult {
  eraCheckID: number;
  fileName: string;
  cplCount: number;
  serviceLineCount: number;
  insurance: string;
  checkNumber: number;
  checkDate: Date | null;
  checkAmount: number;
  payeeName: string;
  payeeNpi: string;
  ediLogID: number;
  timeStamp: Date | null;
  total?: number;
  totalPayment?: number;
  totalCPLCount?: number;
  totalServiceLineCount?: number;
}

export interface ReconciliationCriteria {
  groupID?: number;
  practiceID?: number;
  batchID?: number;
  fromCreatedDate?: Date | null;
  toCreatedDate?: Date | null;
  paymentNumber: string;
  fromPaymentDate?: Date | null;
  toPaymentDate?: Date | null;
  fromPostingDate?: Date | null;
  toPostingDate?: Date | null;
  fromDepositDate?: Date | null;
  toDepositDate?: Date | null;
  postingType: string | null;
  isReconsiled?: boolean | null;
  sortByColumn: string;
  sortOrder: string;
  pageNumber: number;
  pageSize: number;
  getAllData: boolean;
  getOnlyIDS: boolean;
}

export interface GetReconciledSearchAPIResult {
  id: number;
  groupID?: number;
  group: string;
  groupEIN: string;
  practiceID?: number;
  practice: string;
  practiceAddress: string;
  payerType: string;
  batchID?: number;
  paymentNumber: string;
  paymentAmount?: number;
  paymentDate: string;
  postingDate: string;
  depositDate: string;
  reconsiled: string;
  reconsileDate?: Date;
  reconsileBy: string;
  total?: number;
}
export interface GetPaymentReconcilationLedgerCriteria {
  groupID?: number;
  practiceID?: number;
  postingType: string;
  paymentNumber: string;
  batchID?: number;
  fromPaymentDate?: Date;
  toPaymentDate?: Date;
  fromDepositDate?: Date;
  toDepositDate?: Date;
  fromCreatedDate?: Date;
  toCreatedDate?: Date;
  isReconsiled: boolean;
}
export interface GetPaymentReconcilationLedgerResult {
  ledgerID: number;
  paymentBatch: string;
  parentLedgerID?: number;
  ledgerAccount: string;
  patient: string;
  claimID?: number;
  chargeID?: number;
  paymentType: string;
  paymentNumber: string;
  paymentDate?: Date;
  amount?: number;
  comments: string;
  createdOn?: Date;
  createdBy?: number;
  checkDate?: Date;
  depositDate?: Date;
  externalLedgerID: string;
  isAdjusted?: boolean;
  accountID?: number;
  reconsiledOn?: Date;
  reconsiled?: string;
  reconsiledBy?: string;
  postingType?: string;
}

export interface ReconcilePayment {
  ledgerID: string;
  paymentNumber: string;
  reconsile: string;
  depositDate: string;
  postingDate: string;
}
export interface ReconcilePaymentResult {
  response: string;
}
export interface ClaimStatsData {
  claimID: number;
  daysInAR: number;
  timelyFiling: string;
  firstSubmissionDays: number;
  scrubStatusID: number;
  scrubStatus: string;
  appeal: string;
  resubmission: string;
  insuranceBalance: number;
  patientBalance: number;
  totalBalance: number;
  statusDays: ClaimStatusDays[];
}
export interface ClaimLogsData {
  primaryClaimID: number | null;
  secondaryClaimID: number | null;
  tertiaryClaimID: number | null;
  primaryClaimLogsData: ClaimLogItem[];
  secondaryClaimLogsData: ClaimLogItem[];
  tertiaryClaimLogsData: ClaimLogItem[];
  primaryClaimInsuranceID?: number;
  primaryClaimInsurance?: string;
  secondaryClaimInsuranceID?: number;
  secondaryClaimInsurance?: string;
  tertiarClaimInsuranceID?: number;
  tertiaryClaimInsurance?: string;
}

export type AllInsuranceData = {
  id: number;
  value: string;
  groupID: number;
};

export interface GetAllInsuranceData {
  type: typeof FETCH_ALL_INSURANCE_DATA;
  payload: AllInsuranceData[];
}

export interface RejectedClaimsByTimeResult {
  rid: number;
  rejectionDate: string;
  counts: number;
  average: number;
}

export interface ClaimsScrubingDataType {
  id: number;
  title: string;
  type: string;
  issues?: {
    issue: string;
  }[];
}
export interface AllClaimsScrubResponseResult {
  scrubValidations: ClaimsScrubingDataType[];
  scrubResponse: ClaimsScrubingDataType[];
  adnareScrubResponse: ClaimsScrubingDataType[];
}
export interface ClaimsSubmitDataType {
  response: ClaimsScrubingDataType[];
  submitStatus: {
    claimID: number;
    submitStatusID: number;
  }[];
}
export interface ClaimsSubmitRequest {
  claimID: number | null | undefined;
  submitAs: boolean;
}
export type AllClaimsTableSearchResultType = {
  id: number;
  value: string;
  type: string;
};
export interface ReassignClaimData {
  claimID: number;
  assignClaimTo: string;
  note: string;
}

export interface ReassignBatchData {
  paymentBatchID: number;
  assignPaymentBatchTo: string;
}
export interface ReassignMultipleClaimData {
  claimIDs: string | undefined;
  assignToUserID: string;
  note: string;
}

export interface PatietLookupType {
  id: number;
  value: string;
  code?: string;
}

export interface ClaimDetailSummaryResult {
  claimID: number;
  dos: string;
  icds: ClaimICDsResultPayload[];
  charges: SummaryBillingCharges[];
  totalClaimBalance: number;
}

export interface CrossoverChargesByPatientIDResult {
  charges: SummaryBillingCharges[];
}

export interface PatientLookupDropdown {
  states: PatietLookupType[];
  gender: PatietLookupType[];
  maritals: PatietLookupType[];
  ethnicity: PatietLookupType[];
  smokingStatus: PatietLookupType[];
  race: PatietLookupType[];
  language: PatietLookupType[];
  insuranceResponsibility: PatietLookupType[];
  mspType: PatietLookupType[];
  insuranceRelation: PatietLookupType[];
  guarantorRelation: PatietLookupType[];
  paymentTypes: PatietLookupType[];
  accountTypes: PatietLookupType[];
  serviceType: PatietLookupType[];
}
export interface PatientBasedInsuranceDropdown {
  id: number;
  value: string;
}

export interface DeletePatientResponseDate {
  id: number;
  message: string;
}

export interface DeleteGuarantorResponse {
  id: number;
  message: string;
}
export interface SavePatientRequestData {
  patientID?: number;
  groupID?: number;
  practiceID?: number;
  facilityID?: number;
  posID?: number;
  providerID?: number;
  firstName?: string;
  middleName: string;
  lastName?: string;
  dob: string | null;
  genderID?: number;
  maritalStatusID?: number;
  accountNo: string;
  active: boolean;
  eStatement: boolean;
  address1?: string;
  address2: string;
  city?: string;
  state: string | undefined;
  zipCode?: string;
  zipCodeExtension: string;
  homePhone: string;
  workPhone: string;
  cellPhone: string;
  fax: string;
  email: string;
  raceID?: number;
  ethnicityID?: number;
  languageID?: number;
  primaryCarePhysician: string;
  category: string;
  chartNo: string;
  licenseNo: string;
  employerName: string;
  smokingStatusID?: number;
  deceaseDate: Date | string | null;
  deceaseReason: string;
  emergencyRelation: string;
  emergencyFirstName: string;
  emergencyLastName: string;
  emergencyAddress1: string;
  emergencyAddress2: string;
  emergencyZipCodeExtension: string;
  emergencyCity: string;
  emergencyState: string | null | undefined;
  emergencyZipCode: string;
  emergencyTelephone: string;
  emergencyEmail: string;
  socialSecurityNumber: string;
  validateIDS: number[];
  icd1: string | null;
  icd2: string | null;
  icd3: string | null;
  icd4: string | null;
  icd5: string | null;
  icd6: string | null;
  icd7: string | null;
  icd8: string | null;
  icd9: string | null;
  icd10: string | null;
  icd11: string | null;
  icd12: string | null;
}

export interface GetPatientRequestData {
  relationID?: number;
  patientID?: number;
  groupID?: number;
  practiceID?: number;
  facilityID?: number;
  posID?: number;
  providerID?: number;
  firstName: string;
  middleName: string;
  lastName: string;
  dob: string;
  genderID: number;
  maritalStatusID?: number;
  accountNo: string;
  active: boolean;
  eStatement: boolean;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zipCode: string;
  zipCodeExtension: string;
  homePhone: string;
  workPhone: string;
  cellPhone: string;
  fax: string;
  email: string;
  raceID?: number;
  ethnicityID?: number;
  languageID?: number;
  primaryCarePhysician: string;
  category: string;
  chartNo: string;
  licenseNo: string;
  employerName: string;
  smokingStatusID?: number;
  deceaseDate: string;
  deceaseReason: string;
  emergencyRelation: string;
  emergencyFirstName: string;
  emergencyLastName: string;
  emergencyAddress1: string;
  emergencyAddress2: string;
  emergencyzipCodeExtension: string;
  emergencyCity: string;
  emergencyState: string;
  emergencyZipCode: string;
  emergencyTelephone: string;
  emergencyEmail: string;
  socialSecurityNumber: string;
  addressValidateOn: string;
  emgAddressValidateOn: string;
  demographicVerifiedOn: string;
  icd1: string | null;
  icd2: string | null;
  icd3: string | null;
  icd4: string | null;
  icd5: string | null;
  icd6: string | null;
  icd7: string | null;
  icd8: string | null;
  icd9: string | null;
  icd10: string | null;
  icd11: string | null;
  icd12: string | null;
}

export interface ChargeDetailData {
  chargeID: number;
  claimID: number;
  groupID: number;
  fromDOS: Date;
  toDOS: Date;
  cptCode: string;
  units: number | null | undefined;
  mod1: string;
  mod2: string;
  mod3: string | null;
  mod4: string | null;
  placeOfServiceID: number;
  cliaNumber: string | null;
  icd1: string | null;
  icd2: string | null;
  icd3: string | null;
  icd4: string | null;
  ndcNumber: string | null;
  ndcUnit: string | null;
  ndcUnitQualifierID: number | null;
  serviceDescription: string | null;
  chargeBatchID: number | null;
  chargePostingDate: string | null;
  systemDocumentID: string | null;
  pageNumber: string | null;
  pointers: string | null;
  chargeStatusID: number;
  chargeStatus: String | null;
  reasonCodes: ChargeDetailsCodeType[];
  remarkCodes: ChargeDetailsCodeType[];
  groupCodes: ChargeDetailsCodeType[];
  fee: number;
  adjustments: number;
  writeOFF: number;
  expected: number;
  insuranceAmount: number;
  insuranceAdjustment: number;
  insurancePaid: number;
  insuranceBalance: number;
  patientAmount: number;
  patientAdjustment: number;
  patientPaid: number;
  patientBalance: number;
  totalBalance: number;
  paymentLedgers: PaymentLedgerType[];
  practiceID: number;
  chargeBatchDescription: string;
  patientInsuranceID: number;
  facilityID: number;
  medicalCaseID: number | null;
  chargeRevenueCode: string;
}

export interface PaymentLedgerType {
  ledgerID: number;
  paymentBatchID: string | null;
  paymentBatch: string;
  claimID: number | null;
  chargeID: number | null;
  cptCode: string;
  payor: string;
  name: string;
  paymentReason: string;
  adjustmentReason: string;
  paymentType: string;
  amount: number | null;
  postingDate: string;
  depositDate: string;
  checkDate: string | null;
  payorID?: number;
  checkNumber: string | null;
  createdOn: Date | null;
  createdBy: string;
  disableReverse: boolean;
  eraCheckID: number | null;
  comments: string;
}

export interface ChargeDetailsCodeType {
  code: string;
  description: string;
}

export interface ChargeHistoryResult {
  id: number;
  chargeID: number;
  chargeStatusID: number;
  chargeStatus: string;
  statusFrom: number;
  groupCodes: ChargeDetailsCodeType[];
  reasonCodes: ChargeDetailsCodeType[];
  remarkCodes: ChargeDetailsCodeType[];
  chargeStatusColor: string;
}
export interface ChargeHistoryData {
  chargeStatuses: ChargeHistoryResult[];
}

export interface SavePatientResponseDate {
  message: string;
  patientID: number;
  errors: string[];
}

export interface SaveGaurantorResponseData {
  message: string;
  patientID: number;
  errors: string[];
}

export interface VoidClaimResult {
  id: number;
  message: string;
}
export interface CreateAndEditTaskRequestData {
  taskID: number | null;
  claimID: number | null;
  patientID: number | null;
  taskTypeID: number | undefined;
  assignTo: string | null | undefined;
  startDate: string | null | undefined;
  dueDate: string | null | undefined;
  title: string;
  description: string;
  alert: boolean | null;
  endAlertResolve: boolean | null;
  endAlertDate: string | null | undefined;
  autoTime: number | undefined;
  actualRVT: number | undefined;
}
export interface CreateTasksRequestData {
  claimIDS: string | undefined;
  taskTypeID: number | undefined;
  assignTo: string | null | undefined;
  startDate: string | null | undefined;
  dueDate: string | null | undefined;
  title: string;
  description: string;
  alert: boolean | null;
  endAlertResolve: boolean | null;
  endAlertDate: string | null | undefined;
  autoTime: number | undefined;
  actualRVT: number | undefined;
}
export interface CreateMultipleTasksResult {
  message: string;
  errors: string[];
}
export interface CreateAndEditTaskResponseData {
  message: string;
  taskID?: number;
}
export interface TaskGridData {
  taskID: number;
  assignTo: string;
  taskTypeID: number;
  startDate: string;
  dueDate: string;
  title: string;
  description: string;
  alertPopUp: boolean;
  alert: boolean;
  endAlertResolve: boolean;
  endAlertDate: string;
  resolve: boolean;
  createdOn: string;
  createdBy: string;
  resolvedOn: string;
  resolvedBy: string;
  createdByName: string;
  resolvedByName: string;
  assignToName: string;
  claimID: number;
  patientID: number;
  groupID?: number;
  autoTime: number;
  actualRVT: number;
}
export interface ClaimDNALogResult {
  id: number;
  section: string;
  actionType: string;
  field: string;
  before: string;
  after: string;
  userID: string;
  user: string;
  updatedOn: string;
}
export interface PatientProfileInsuranceData {
  patientID: number | null;
  insuranceID: number | null;
  payerResponsibilityID: number | null;
  insuranceNumber: string;
  wcClaimNumber: string;
  groupName: string;
  groupNumber: string;
  policyStartDate: string | null;
  policyEndDate: string | null;
  mspTypeID: number | null;
  copay: number | null;
  comment: string;
  active: string;
  assignment: string;
  insuredRelationID: number | null;
  firstName: string;
  middleName: string;
  lastName: string;
  genderID: number | null;
  dob: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zipCodeExtension: string;
  zipCode: string;
  homePhone: string;
  officePhone: string;
  cell: string;
  fax: string;
  email: string;
  officePhoneExtension: string;
  accidentDate: string | null;
  accidentTypeID: number | null;
  accidentStateID: number | null;
}
export interface PatientProfileInsuranceResponse {
  patientInsuranceID: number;
  message: string;
  errors: string[];
}
export interface PatientInsuranceTabData {
  id: number;
  patientID: number;
  clientID: number;
  insuranceID: number;
  insuranceName: string;
  payerResponsibility: string;
  insuranceNumber: string;
  groupNumber: string;
  groupName: string;
  wcClaimNumber: string;
  policyStartDate: string;
  policyEndDate: string;
  firstName: string;
  middleName: string;
  copay: number;
  assignment: boolean;
  genderID: number;
  homePhone: string;
  officePhone: string;
  officePhoneExtension: string;
  email: string;
  cell: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zipCode: string;
  zipCodeExtension: string;
  phone: string;
  dob: string;
  relation: string;
  payerResponsibilityID: number;
  relationID: number;
  active: boolean;
  eligibilityRequestID: number;
  checkEligibilityDate: string;
  comment: string;
  mspTypeID: number;
  accidentDate: string;
  accidentTypeID: number;
  accidentStateID: number;
  fax: string;
}

export interface PatientGuarantorTabData {
  id?: number;
  patientID?: number;
  relation: string;
  relationID: number | null;
  active: string;
  firstName: string;
  middleName: string;
  lastName: string;
  genderID: number | null;
  dob: string;
  address1: string;
  address2: string;
  zipCodeExtension: string;
  city: string;
  state: string;
  zipCode: string;
  homePhone: string;
  officePhone: string;
  cell: string;
  fax: string;
  email: string;
  socialSecurityNumber: string;
  patientGuarantorID?: number;
}

export interface PatientStatementType {
  patientID: number;
  lastName: string;
  firstName: string;
  groupID?: number;
  group: string;
  groupEIN?: number;
  practiceID?: number;
  practice: string;
  practiceAddress: string;
  providerID?: number;
  provider: string;
  providerNPI: string;
  primaryInsuranceID?: number;
  primaryInsurance: string;
  secondaryInsuranceID?: number;
  secondaryInsurance: string;
  lastPaymentDate: string;
  lastPaymentAmount?: number;
  patientBalance?: number;
  lastStatementDate: string;
  lastStatementAmount?: number;
  statementType: string;
  statementDays: number;
  total: number;
}

export interface StatemntExportType {
  patientIDs: string;
  practiceID?: number;
  isProceeding: string;
}

export interface StatementResponse {
  response: string;
  filePath: string;
}
export interface PatientInsuranceActiveData {
  patientInsuranceID: number;
  active: boolean;
}
export interface PatientInsuranceActieResult {
  message: string;
  errors: string[];
}
export interface UpdatePatientInsuranceData {
  patientInsuranceID: number;
  patientID: number;
  insuranceID: number;
  payerResponsibilityID: number;
  insuranceNumber: string;
  wcClaimNumber: string;
  groupName: string;
  groupNumber: string;
  policyStartDate: string | null;
  policyEndDate: string | null;
  mspTypeID: Number | null;
  copay: string | null;
  comment: string;
  active: boolean;
  assignment: boolean;
  insuredRelationID: number;
  firstName: string;
  middleName: string;
  lastName: string;
  genderID: number | null;
  dob: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zipCodeExtension: string;
  zipCode: number;
  homePhone: string;
  officePhone: string;
  cell: string;
  fax: string;
  email: string;
  officePhoneExtension: string;
  accidentDate: string | null;
  accidentTypeID: number | null;
  accidentStateID: number | null;
}
export interface EligibilityRequestData {
  patientInsuranceID: number | null;
  insuranceID: number | null;
  serviceTypeCodeID: number | null;
  dos: string;
}
export type SetSelectedPaymentBatchID = {
  type: typeof SET_SELECTED_PAYMENT_BATCHID;
  payload: number;
};
export interface PatientDocumnetData {
  id: number;
  title: string;
  documentType: string;
  patientID: number;
  categoryID: number;
  category: string;
  active: string;
  createdOn: string;
  createdBy: string;
}
export interface ProcedureHistoryReport {
  summary: ProcedureReportsSummary[];
  procedureReportsData: ProcedureReportsResults[];
}
export interface ProcedureReportsResults {
  id: number;
  providerID: number;
  provider: string;
  providerNPI: string;
  groupID: number;
  group: string;
  groupEIN: string;
  code: string;
  description: string;
  count: number;
  amount: number;
  payment: number;
  writeoff: number;
  total: number;
}
export interface ProcedureReportsSummary {
  totalCount: number;
  totalAmount: number;
  totalPayment: number;
  totalWriteOff: number;
}
export interface PlanProcedureHistoryCriteria {
  groupID: number | null;
  providerID: string | null;
  fromDos: string | null;
  toDos: string | null;
  sortByColumn: string;
  sortOrder: string;
  pageNumber: number | undefined;
  pageSize: number | undefined;
  getAllData: boolean | null;
  getOnlyIDS: boolean | null;
}
export interface PlanProcedureCountDetailsCriteria {
  groupID: number | null;
  providerID: number | null;
  procedureCode: string;
  responsibility: number | null;
  pageNumber: number | undefined;
  pageSize: number | undefined;
  sortByColumn: string | null;
  getAllData: boolean | null;
  exportData: string | null;
}
export interface PlanProcedureCountDetails {
  chargeID: number;
  cpt: string;
  claimID: number;
  patientID: number;
  patient: string;
  insuranceID: number;
  insurance: string;
  dos: string;
  dosTo: string;
  practiceID: number;
  practice: string;
  practiceAddress: string;
  providerID: number;
  provider: string;
  providerNPI: string;
  fee: number;
  allowable: number;
  adjustments: number;
  insuranceAmount: number;
  insuranceBalance: number;
  patientAmount: number;
  patientBalance: number;
  totalBalance: number;
  summary: string;
  total: number;
}
export interface PlanProcedurePayerHistoryReport {
  summary: PlanProcedurePayerReportsSummary[];
  procedureReportByPayerData: PlanProcedurePayerReportsResults[];
}
export interface PlanProcedurePayerReportsResults {
  rid: number;
  insuranceID: number;
  insurance: string;
  groupID: number;
  group: string;
  groupEIN: string;
  cptCode: string;
  cptDescription: string;
  cptCount: number;
  totalAmount: number;
  paid: number;
  adjustments: number;
  modifier: string;
  posCode: string;
  patientCount: number;
  claimCount: number;
  totalAllowed: number;
  total: number;
}
export interface PlanProcedurePayerReportsSummary {
  totalCount: number;
  totalPatientCount: number;
  totalClaimCount: number;
  totalAllowed: number;
  totalAmount: number;
  totalPayment: number;
  totalWriteOff: number;
}
export interface PlanProcedurePayerHistoryCriteria {
  groupID: number | null;
  insuranceID: number | null;
  cpt: string | null;
  fromDate: string | null;
  toDate: string | null;
  dateType: string;
  sortByColumn: string;
  sortOrder: string;
  pageNumber: number | undefined;
  pageSize: number | undefined;
  getAllData: boolean | null;
  getOnlyIDS: boolean | null;
}
export interface AgedTrialBalanceReportCriteria {
  groupID: number | null;
  fromPostingDate: string;
  toPostingDate: string;
  pageNumber: number | undefined;
  pageSize: number | undefined;
  sortColumn: string;
  sortOrder: string;
  getAllData: boolean | null;
  getOnlyIDS: boolean | null;
}
export interface AgedTrialBalanceReportResult {
  rid: number;
  patientID: number;
  patient: string;
  patientDOB: string;
  claimID: number;
  dos: string;
  providerID: number;
  provider: string;
  providerNPI: string;
  posID: number;
  posCode: string;
  chargeID: number;
  cptCode: string;
  diagnosisCodes: string;
  claimResponsibility: string;
  currentPayerID: number;
  currentPayer: string;
  primaryPayerID: number;
  primaryPayer: string;
  submitDate: string;
  agingByDOS: string;
  claimStatusID: number;
  claimStatus: string;
  chargeStatusID: number;
  chargeStatus: string;
  charges: number;
  adjustments: number;
  insurancePayment: number;
  patientPayment: number;
  totalBalance: number;
  totalCount: number;
}
export interface ClaimActivityReportCriteria {
  groupID: number | null;
  providerID: number | null;
  fromPostingDate: string;
  toPostingDate: string;
  pageNumber: number | undefined;
  pageSize: number | undefined;
  sortColumn: string;
  sortOrder: string;
  getAllData: boolean | null;
  getOnlyIDS: boolean | null;
}
export interface ClaimActivityReportResult {
  rid: number;
  providerID: number;
  provider: string;
  patientID: number;
  providerNPI: string;
  patient: string;
  patientInsuranceID: number;
  insuranceID: number;
  insurance: string;
  payerTypeID: number;
  payer: string;
  avgTimeFiled: number;
  claimsPaid: number;
  avgPaymentTimeDays: number;
  claimsUnpaid: number;
  unpaidAmount: number;
  totalCount: number;
}
export interface ClaimSubmissionReportCriteria {
  groupID: number | null;
  batchID: number | null;
  fromSubmittedDate: string;
  toSubmittedDate: string;
  batchSubmittedBy: string;
  claimID: number | null;
  pageNumber: number | undefined;
  paginationSize: number | undefined;
  sortByColumn: string;
  sortOrder: string;
  getAllData: boolean | null;
  getOnlyIDS: boolean | null;
}

export interface ClaimSubmissionReportResult {
  rid: number;
  submissionBatchID: number;
  groupID: number;
  group: string;
  groupEIN: string;
  submissionType: string;
  clearingHouse: string;
  submittedOn: string;
  submittedBy: string;
  submittedClaimsCount: number;
  total: number;
}

export interface EndOfMonthReportCriteria {
  groupID?: number;
  fromDate: Date | string;
  toDate: Date | string;
  monthEnd: string;
  pageNumber: number;
  pageSize: number;
  sortColumn: string;
  sortOrder: string;
  getAllData?: boolean;
}
export interface EOMReportViewDetailSearchCriteria {
  groupID?: number;
  month: string;
  monthEnd: string;
  monthStartDate: string;
  practiceIDS: string;
  facilityIDS: string;
  providerIDS: string;
  pageNumber: number;
  pageSize: number;
  sortColumn: string;
  sortOrder: string;
}
export interface EndOfMonthReportResult {
  rid: number;
  monthStartDate: string;
  monthName: string;
  endOfMonthID: number;
  monthEndDate: string;
  monthEndByID: string;
  monthEndBy: string;
  monthEnd: string;
  total: number;
}
export interface EndOfMonthViewDetailResult {
  summary: EndOfMonthSummaryResult[];
  monthEndReportViewData: EndOfMonthDetailsResult[];
}
export interface EndOfMonthSummaryResult {
  rid: number;
  monthID: string;
  monthName: string;
  practiceID: number;
  practice: string;
  practiceAddress: string;
  facilityID: number;
  facility: string;
  facilityAddress: string;
  providerID: number;
  provider: string;
  providerNPI: string;
  chargesCount: number;
  visitsCount: number;
  patientsCount: number;
  charges: number;
  payments: number;
  adjustments: number;
  refunds: number;
  badDebts: number;
  collectedAdvancePayments: number;
  appliedAdvancePayments: number;
  netBalance: number;
  begining: number;
  ending: number;
  total: number;
}
export interface EndOfMonthDetailsResult {
  rid: number;
  monthID: string;
  monthName: string;
  practiceID: number;
  practice: string;
  practiceAddress: string;
  facilityID: number;
  facility: string;
  facilityAddress: string;
  providerID: number;
  provider: string;
  providerNPI: string;
  postingDate: string;
  chargesCount: number;
  visitsCount: number;
  patientsCount: number;
  charges: number;
  payments: number;
  adjustments: number;
  refunds: number;
  badDebts: number;
  collectedAdvancePayments: number;
  appliedAdvancePayments: number;
  begining: number;
  ending: number;
  netBalance: number;
  total: number;
}

export interface EOMViewDetailGridCriteria {
  groupID?: number;
  practiceID?: number;
  facilityID?: number;
  providerID?: number;
  monthStartDate: string;
  postingDate: string;
  endOfMonthType: string;
  dataType: string;
  ledgerType: string;
}
export interface EOMViewDetailGridResult {
  chargesData: EOMViewDetailGridChargesResult[];
  ledgersData: EOMViewDetailGridLedgerResult[];
}
export interface EOMViewDetailGridChargesResult {
  chargeID: number;
  claimID: number;
  cpt: string;
  fee: number;
  postingDate: string;
  insuranceResponsibility: number;
  insuranceAdjustment: number;
  patientResponsibility: number;
  patientDiscount: number;
  insuranceBalance: number;
  patientBalance: number;
  totalBalance: number;
}
export interface EOMViewDetailGridLedgerResult {
  ledgerID: number;
  patientID: number;
  chargeID: number;
  claimID: number;
  batchID: number;
  ledgerName: string;
  ledgerType: string;
  paymentType: string;
  paymentNumber: string;
  amount: number;
  paymentDate: string;
  postingDate: string;
  depositDate: string;
}

export interface ChargesPaymentsSummaryByProviderCriteria {
  groupID: number | undefined;
  practiceID: number | undefined;
  providerIDS?: string[];
  fromDate: string | null;
  toDate: string | null;
  chargesBy: string;
  paymentsBy: string;
  runBy: string;
  sortColumn: string;
  sortOrder: string;
  pageNumber: number | undefined;
  pageSize: number | undefined;
  getAllData: boolean | null;
}
export interface ChargesPaymentsSummaryByProviderReport {
  summary: ChargesPaymentsSummaryByProviderReportSummary[];
  summaryTotal: ChargesPaymentsSummaryByProviderReportSummaryTotal[];
  chargesPaymentsSummaryByProviderReportData: ChargesPaymentsSummaryByProviderReportResults[];
  chargesPaymentsSummaryByProviderReportDataTotal: ChargesPaymentsSummaryByProviderReportResultsTotal[];
}
export interface ChargesPaymentsSummaryByProviderReportSummary {
  providerID: number;
  provider: string;
  providerNPI: string;
  chargesAmount: number;
  insurancePayment: number;
  insuranceAdjustment: number;
  insuranceRefund: number;
  patientPayment: number;
  patientAdjustment: number;
  patientRefund: number;
}
export interface ChargesPaymentsSummaryByProviderReportSummaryTotal {
  provider: string;
  chargesAmount: number;
  insurancePayment: number;
  insuranceAdjustment: number;
  insuranceRefund: number;
  patientPayment: number;
  patientAdjustment: number;
  patientRefund: number;
}
export interface ChargesPaymentsSummaryByProviderReportResults {
  id: number;
  practiceID: number;
  practice: string;
  practiceAddress: string;
  providerID: number;
  provider: string;
  providerNPI: string;
  date: string;
  chargesAmount: number;
  insurancePayment: number;
  insuranceAdjustment: number;
  patientPayment: number;
  patientAdjustment: number;
  insuranceRefund: number;
  patientRefund: number;
  total: number;
}
export interface ChargesPaymentsSummaryByProviderReportResultsTotal {
  practice: string;
  provider: string;
  date: string;
  chargesAmount: number;
  insurancePayment: number;
  insuranceAdjustment: number;
  patientPayment: number;
  patientAdjustment: number;
  insuranceRefund: number;
  patientRefund: number;
}
export interface GlobleSearchCriteria {
  groupID: number | null;
  category: string;
  searchValue: string;
}
export interface GlobleSearchResult {
  id: number;
  type: string;
  value: string;
  referenceNumber: string;
}
export interface GlobleSearchViewCriteria {
  groupID?: number;
  lineItemID: number;
  viewType: string;
  category: string;
}
export interface GlobleSearchViewResult {
  recentViewedID: number;
  message: string;
  error: string[];
}
export interface InsuranceProfileReportCriteria {
  groupID: number | null;
  providerID: number | null;
  insuranceID: number | undefined;
  fromDos: string | null;
  toDos: string | null;
  sortByColumn: string;
  sortOrder: string;
  pageNumber: number | undefined;
  pageSize: number | undefined;
  getAllData: boolean;
  getOnlyIDS: boolean;
}
export interface InsuranceProfileReportSummary {
  totalCharges: number;
  totalPayment: number;
  totalWriteoff: number;
}
export interface InsuranceProfileReportDetails {
  id: number;
  providerID: number;
  provider: string;
  providerNPI: string;
  groupID: number;
  group: string;
  groupEIN: string;
  insuranceID: number;
  insurance: string;
  charges: number;
  payment: number;
  writeoff: number;
  total: number;
}
export interface InsuranceProfileReportData {
  summary: InsuranceProfileReportSummary[];
  insuranceReportsData: InsuranceProfileReportDetails[];
}

export interface AgingByInsuranceReportCriteria {
  userID: string;
  groupID: number | null;
  insuranceName: string;
  fromBalance: number | undefined;
  toBalance: number | undefined;
  fromDate: string | null;
  toDate: string | null;
  agingType: string;
  sortByColumn: string;
  sortOrder: string;
  pageNumber: number | undefined;
  pageSize: number | undefined;
  getAllData: boolean;
  getOnlyIDS: boolean;
}
export interface AgingInsuranceReportSummary {
  totalCurrent: number;
  totalThirtyPlus: number;
  totalSixtyPlus: number;
  totalNintyPlus: number;
  totalOneTwentyPlus: number;
  totalOneEightyPlus: number;
  totalBalance: number;
}
export interface AgingInsuranceReportDetails {
  id: number;
  insurance: string;
  current: number;
  thirtyPlus: number;
  sixtyPlus: number;
  nintyPlus: number;
  oneTwentyPlus: number;
  oneEightyPlus: number;
  balance: number;
  total: number;
}
export interface AgingInsuranceReportData {
  summary: AgingInsuranceReportSummary[];
  agingByInsuranceReportData: AgingInsuranceReportDetails[];
}
export interface AgingByProviderReportCriteria {
  userID: string;
  groupID: number | null;
  providerID: number | null;
  fromBalance: number | undefined;
  toBalance: number | undefined;
  fromDate: string | null;
  toDate: string | null;
  agingType: string;
  sortColumn: string;
  sortOrder: string;
  pageNumber: number | undefined;
  pageSize: number | undefined;
  getAllData: boolean;
  getOnlyIDS: boolean;
}
export interface AgingProviderReportSummary {
  totalCurrent: number;
  totalThirtyPlus: number;
  totalSixtyPlus: number;
  totalNintyPlus: number;
  totalOneTwentyPlus: number;
  totalOneEightyPlus: number;
  totalBalance: number;
}
export interface AgingProviderReportDetails {
  id: number;
  provider: string;
  providerNPI: string;
  groupID: number;
  group: string;
  groupEIN: string;
  practiceID: number;
  practice: string;
  practiceAddress: string;
  current: number;
  thirtyPlus: number;
  sixtyPlus: number;
  nintyPlus: number;
  oneTwentyPlus: number;
  oneEightyPlus: number;
  balance: number;
  totalCount: number;
}
export interface AgingProviderReportData {
  summary: AgingProviderReportSummary[];
  agingByProviderReportData: AgingProviderReportDetails[];
}

export interface AgingByInsuranceReportDetailsCriteria {
  groupID: number | null;
  agingType: string;
  insuranceID: number | null;
  currentIndex: string;
  getAllData: boolean | null;
  insuranceName: string;
  fromDate?: Date | string;
  toDate?: Date | string;
  fromBalance?: number | null;
  toBalance?: number | null;
}
export interface AgingByInsuranceReportDetailsResult {
  claimID: number;
  fromDOS: string;
  toDOS: string;
  patientID: number;
  patient: string;
  aging: string;
  insuranceID: number;
  insurance: string;
  groupID: number;
  group: string;
  groupEIN: string;
  practiceID: number;
  practice: string;
  practiceAddress: string;
  providerID: number;
  provider: string;
  providerNPI: string;
  claimStatus: string;
  claimStatusColor: string;
  insurancePaid: number;
  insuranceBalance: number;
  patientPaid: number;
  patientBalance: number;
  totalBalance: number;
  total: number;
}
export interface PatientAdvancePaymentReportCriteria {
  groupID: number | null;
  patientFirstName: string;
  patientLastName: string;
  patientID: string;
  fromAdvanceBalance: number | undefined;
  toAdvanceBalance: number | undefined;
  fromPostingDate: string;
  toPostingDate: string;
  pageNumber: number | undefined;
  pageSize: number | undefined;
  sortByColumn: string;
  sortOrder: string;
  getAllData: boolean;
  getOnlyIDS: boolean;
}
export interface PatientAdvancePaymentReportResult {
  rid: number;
  groupID: number;
  group: string;
  groupEIN: string;
  patientID: number;
  patient: string;
  postingDate: string;
  advancePayment: number;
  appliedPayment: number;
  advanceBalance: number;
  patientBalance: number;
  total: number;
}
export interface AgingByPatientReportCriteria {
  groupID: number | null;
  patientFirstName: string;
  patientLastName: string;
  patientID: number | null;
  fromBalance: number | undefined;
  toBalance: number | undefined;
  fromDate: string | null;
  toDate: string | null;
  agingType: string;
  sortByColumn: string;
  sortOrder: string;
  pageNumber: number | undefined;
  pageSize: number | undefined;
  getAllData: boolean;
  getOnlyIDS: boolean;
}
export interface AgingPatientReportSummary {
  totalCurrent: number;
  totalThirtyPlus: number;
  totalSixtyPlus: number;
  totalNintyPlus: number;
  totalOneTwentyPlus: number;
  totalOneEightyPlus: number;
  totalBalance: number;
}
export interface AgingPatientReportDetails {
  id: number;
  patientName: string;
  current: number;
  thirtyPlus: number;
  sixtyPlus: number;
  nintyPlus: number;
  oneTwentyPlus: number;
  oneEightyPlus: number;
  balance: number;
  advanceBalance: number;
  total: number;
}
export interface AgingPatientReportData {
  summary: AgingPatientReportSummary[];
  agingByPatientReportData: AgingPatientReportDetails[];
}
export interface AgingByPatientReportDetailsCriteria {
  groupID: number | null;
  patientID: number | null;
  agingType: string;
  currentIndex: string;
  getAllData: boolean | null;
}
export interface AgingByPatientReportDetailsResult {
  claimID: number;
  fromDOS: string;
  toDOS: string;
  patient: string;
  aging: string;
  insuranceID: number;
  insurance: string;
  groupID: number;
  group: string;
  groupEIN: string;
  practiceID: number;
  practice: string;
  practiceAddress: string;
  providerID: number;
  provider: string;
  providerNPI: string;
  claimStatus: string;
  claimStatusColor: string;
  insurancePaid: number;
  insuranceBalance: number;
  patientPaid: number;
  patientBalance: number;
  totalBalance: number;
  total: number;
}
export interface PatientAccountingReportCriteria {
  groupID: number | null;
  ledgerAccountID: string;
  patientFirstName: string;
  patientLastName: string;
  patientID: string | null;
  patientDOB?: string;
  pageNumber: number | undefined;
  pageSize: number | undefined;
  sortByColumn: string;
  sortOrder: string;
  getAllData: boolean;
  getOnlyIDS: boolean;
}
export interface PatientAccountingReportResult {
  rid: number;
  patientID: number;
  patient: string;
  patientDOB: string;
  claimID: number;
  dos: string;
  cpt: string;
  cptDescription: string;
  cptCount: number;
  providerID: number;
  provider: string;
  providerNPI: string;
  paidChargesBy: string;
  paymentDate: string;
  paymentID: number;
  charges: number;
  insurancePayment: number;
  insuranceAdjustment: number;
  patientPayment: number;
  patientAdjustment: number;
  total: number;
  totalCount: number;
}
export interface EOMMonthlySummaryReportCriteria {
  practiceIDs?: string[];
  fromDate?: string;
  toDate?: string;
  groupID: number | null;
  providerIDs?: string[];
  facilityIDs: string[];
}
export interface EOMMonthlySummaryReportData {
  rid: number;
  month: string;
  visitsCount: number;
  chargesCount: number;
  patientsCount: number;
  charges: number;
  payments: number;
  adjustments: number;
  refunds: number;
  patientDiscounts: number;
  badDebt: number;
  collectedAdvancePayments: number;
  appliedAdvancePayments: number;
  beginning: number;
  ending: number;
  net: number;
  days: number;
  averageCharges: number;
  receipts: number;
  gross: number;
  netPercentage: number;
  visitsCountProjection: number;
  chargesCountProjection: number;
  patientsCountProjection: number;
  chargesProjection: number;
  paymentProjection: number;
  adjustmentsProjection: number;
  refundsProjection: number;
  badDebtProjection: number;
  collectedAdvancePaymentsProjection: number;
  appliedAdvancePaymentsProjection: number;
  beginningProjection: number;
  endingProjection: number;
  netProjection: number;
  daysProjection: number;
  averageChargesProjection: number;
  receiptsProjection: number;
  grossProjection: number;
  netPercentageProjection: number;
  trailingSixMonthNet: number;
  trailingTwelveMonthNet: number;
  trailingSixMonthGross: number;
  trailingTwelveMonthGross: number;
  trailingSixMonthNetProjection: number;
  trailingTwelveMonthNetProjection: number;
  trailingSixMonthGrossProjection: number;
  trailingTwelveMonthGrossProjection: number;
}
export interface MonthlySummaryReportCriteria {
  practiceIDs?: string[];
  fromDate?: string;
  toDate?: string;
  groupID: number | null;
  providerIDs?: string[];
  facilityIDs: string[];
}
export interface DeniedClaimsByTimeResult {
  rid: number;
  postingDate: string;
  counts: number;
  average: number;
}
export interface DenialReasonAndRemarkCodesResult {
  rid: number;
  denialCodes: string;
  counts: number;
  type: string;
}
export interface DenialsByInsuranceTypeResult {
  rid: number;
  insuranceTypeID: number;
  insuranceType: string;
  counts: number;
  amounts: number;
}
export interface MonthlySummaryReportData {
  id?: number;
  providersCount?: number;
  month?: string;
  charges?: number;
  adjustments?: number;
  payments?: number;
  refunds?: number;
  patientDiscount?: number;
  badDebt?: number;
  visits?: number;
  averageCharges?: number;
  receipts?: number;
  beginning?: number;
  ending?: number;
  net?: number;
  days?: number;
  gross?: number;
  netPercentage?: number;
  chargesProjection?: number;
  adjustmentsProjection?: number;
  paymentsProjection?: number;
  refundsProjection?: number;
  badDebtProjection?: number;
  visitsProjection?: number;
  averageChargesProjection?: number;
  receiptsProjection?: number;
  beginningProjection?: number;
  endingProjection?: number;
  netProjection?: number;
  daysProjection?: number;
  grossProjection?: number;
  netPercentageProjection?: number;
  trailingSixMonthNet?: number;
  trailingTwelveMonthNet?: number;
  trailingSixMonthGross?: number;
  trailingTwelveMonthGross?: number;
  trailingSixMonthNetProjection?: number;
  trailingTwelveMonthNetProjection?: number;
  trailingSixMonthGrossProjection?: number;
  trailingTwelveMonthGrossProjection?: number;
}
export interface RefreshDateTimeResult {
  reportID: number;
  lastReportCreatedOn: Date;
}

export interface FacilitiesResultData {
  id: number;
  name: string;
  posID: number;
  pos: string;
  posCode: string;
  active: boolean;
  groupID: number;
  group: string;
  practiceID: number;
  practice: string;
  npi: string | null;
  cliaNumber: string | null;
  addressValidateOn: string | null;
  address1: string | null;
  address2: string | null;
  city: string;
  state: string;
  zipcode: string;
  zipcodeExtension: string | null;
  contact: string | null;
  officePhone: string | null;
  fax: string | null;
  email: string | null;
  comments: string | null;
  taxonomy: string | null;
  createdOn: string;
  createdByID: string;
  createdBy: string;
  updatedOn: string;
  updatedByID: string;
  updatedBy: string;
  billTypeID: number;
}

export interface RoleResultData {
  id: string;
  name: string;
  code: string;
  description: string;
  homePageID: number | null;
  active: boolean;
  createdOn: Date | null;
  createdByID: string | null;
  createdBy: string;
  updatedOn: Date | null;
  updatedByID: string | null;
  updatedBy: string;
}

export interface ModulesByRoleIdResultData {
  moduleID: number;
  moduleName: string;
  moduleTypeName: string;
  createAllowed: boolean;
  updateAllowed: boolean;
  deleteAllowed: boolean;
}

export interface TAddEditRole {
  id: string;
  name: string;
  code: string;
  description: string;
  homePageID: number | null;
  active: boolean;
  modules: ModulesByRoleIdResultData[];
}

export interface TGetModuleTypes {
  id: string;
  value: string;
}
export interface TGetModuleForAssignPrivilege {
  id: number;
  value: string;
  typeCode: string;
}

export interface UserResultData {
  id: string;
  name: string;
  email: string;
  active: boolean;
  roles: string;
  dataRoles: string;
  imgURL: string | null;
}

export interface ProviderResultData {
  id?: number;
  name: string;
  npi: string;
  imgName: string | null;
  imgURL: string | null;
  active: boolean;
}
export interface DataRoleSearchCriteria {
  title: string;
  description: string;
  active: boolean | null;
}
export interface DataRoleResult {
  id: number;
  name: string;
  description: string;
  imgName: string;
  imgURL: string;
  active: boolean;
  comments: string;
  createdOn: string;
  createdBy: string;
  createdByID: string;
  updatedOn: string;
  updatedBy: string;
  updatedByID: string;
  groupIDS: string;
  practiceIDS: string;
}
export interface TDataRoleGroups {
  id: number;
  value: string;
  select: boolean;
}
export interface TDataRolePractices {
  id: number;
  value: string;
  select: boolean;
  show: boolean;
  groupID: number;
}
export interface GroupSearchCriteria {
  name: string | null;
  pmSystem: string | null;
  active: boolean | null;
}
export interface GroupResultData {
  id: number;
  name: string;
  ein: string;
  pmSystem: string;
  piUserName: string | null;
  piPassword: string | null;
  statementDays: number;
  active: boolean;
  generalNote: boolean;
  sequenceNote: boolean;
  timer: boolean;
  logoName: string;
  logoURL: string;
  createdOn: string;
  createdBy: string;
  createdByID: string;
  updatedOn: string;
  updatedBy: string;
  updatedByID: string;
}
export interface UpdateGroupData {
  groupId?: number;
  name: string;
  ein: string;
  pmSystem: string;
  piUserName: string | null;
  piPassword: string | null;
  statementDays: number;
  active: boolean;
  generalNote: boolean;
  sequenceNote: boolean;
  timer: boolean;
}
export interface UserFields {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  imgName: string | null;
  imgURL: string | null;
  phoneNumber: string;
  email: string;
  dob: string;
  address: string;
  roles: string;
  dataRoles: number[];
  reportingManager: string;
  espiaUserName: string;
  allowedIPS: string[];
  timeZoneID: number | null;
  dateFormatID: number | null;
  dateTimeFormatID: number | null;
  warningMessage: boolean | null;
  isIPAuth: boolean | null;
  tfaEnable: boolean | null;
  active: boolean;
  comments: string | null;
  clientID: number;
  auditPercentage: string;
  auditor: string;
  createdOn: string;
  createdByID: string;
  createdBy: string;
  updatedOn: string;
  updatedByID: string;
  updatedBy: string;
}

export interface UserProfileModalFields {
  id: string;
  name: string;
  roles: string;
  email: string;
  imgURL: string;
  active: boolean;
  showFullDetail: boolean;
}
export interface ProviderProfileModalFields {
  id: number;
  imgURL: string;
  name: string;
  npi: string;
  taxonomy: string;
  address: string;
  active: boolean;
  phoneNumber: string;
  email: string;
  showFullDetail: boolean;
}
export interface PatientProfileModalFields {
  id: number;
  dob: string;
  imgURL: string;
  name: string;
  address: string;
  active: boolean;
  phoneNumber: string;
  email: string;
  showFullDetail: boolean;
}
export interface GroupProfileModalFields {
  id: number;
  imgURL: string;
  name: string;
  einNumber: string;
  active: boolean;
  showFullDetail: boolean;
}
export interface InsuranceProfileModalFields {
  id: number;
  imgURL: string;
  name: string;
  address: string;
  active: boolean;
  phoneNumber: string;
  email: string;
  showFullDetail: boolean;
}
export interface ModalFieldsResult {
  patientData: PatientProfileModalFields;
  groupData: GroupProfileModalFields;
  providerData: ProviderProfileModalFields;
  insuranceData: InsuranceProfileModalFields;
  userData: UserProfileModalFields;
}

export interface ModuleFields {
  id?: number;
  name: string;
  code: string;
  imgName: string | null;
  description: string;
  moduleUrl: string;
  moduleParameter: string;
  moduleDisplayOrder?: string;
  moduleTypeCode: string;
  displayIcon: string;
  createAllowed?: boolean;
  updateAllowed?: boolean;
  deleteAllowed?: boolean;
  createdBy: string;
  updatedBy: string;
  createdOn: string;
  updatedOn: string;
  createdByID: string;
  updatedByID: string;
  groupID: number;
  active: boolean;
}

export interface ModuleResultData {
  id?: number;
  name: string;
  code: string;
  imgName: string | null;
  imgURL: string | null;
  description: string;
}

export interface ProviderFields {
  id?: number;
  firstName: string;
  lastName: string;
  middleName: string;
  name: string;
  imgName: string;
  groupID?: number;
  npi: string;
  taxonomy: string;
  addressValidateOn: string;
  address1: string;
  address2: string;
  city: string;
  state: string | null;
  zipcode: string;
  zipcodeExtension: string;
  homePhone: string;
  officePhone: string;
  fax: string;
  email: string;
  workingDays: string;
  overrideBlockSlots: boolean;
  overbookingAllowed: boolean;
  overbookingLimit: number | string;
  active: boolean;
  comments: string;
  createdOn: string;
  createdByID: string;
  createdBy: string;
  updatedOn: string;
  updatedByID: string;
  updatedBy: string;
  timeZoneID: number;
  startTime: string | number;
  endTime: string | number;
  validateIDS: number[];
  group: string;
}

export interface UserLookup {
  roles: UserLookupRoles[];
  reportingManagers: ReportingManagers[];
  dataRoles: UserLookupDataRoles[];
  timeZones: UserTimeZone[];
  dateFormatsData: UserDateFormats[];
  dateTimeFormatsData: UserDateTimeFormats[];
}

interface UserLookupRoles {
  id: string;
  value: string;
}

interface ReportingManagers {
  id: string;
  value: string;
}

interface UserLookupDataRoles {
  id: number;
  value: string;
}

interface UserTimeZone {
  id: number;
  value: string;
}

interface UserDateFormats {
  id: number;
  value: string;
}

interface UserDateTimeFormats {
  id: number;
  value: string;
}

export interface TResetPasswordJson {
  userID: string;
  password: string;
  confirmPassword: string;
}

export interface InsuranceResultData {
  id: number;
  name: string;
  insuranceTypeID: number | null;
  insuranceType: string | null;
  imgName: string | null;
  imgURL: string | null;
  groupID: number | null;
  group: string;
  insurancePortalURL: string | null;
  insurancePortalUser: string;
  insurancePortalPassword: string;
  addressValidateOn: string | null;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zipcode: string;
  zipcodeExtension: string;
  contactName: string;
  officePhone: string;
  fax: string | undefined;
  email: string | null;
  timelyFilingDays: number | null;
  followUpDays: number | null;
  underContract: boolean;
  underContractDate: string | null;
  eattachments: boolean;
  clearingHouseID: number | null;
  clearingHouseValue: string;
  submitPayerValue: string;
  eligibilityPayerValue: string;
  submitPayerID: string | null;
  submitPayerListID: number | null;
  eligibilityPayerID: string | null;
  eligibilityPayerListID: number | null;
  comments: string;
  createdOn: string | null;
  createdBy: string;
  createdByID: string;
  updatedOn: string;
  updatedBy: string;
  updatedByID: string;
  active: boolean;
  institutionalClearingHouseID: number | null;
  institutionalSubmitPayerID: string;
  institutionalSubmitPayerListID: number | null;
  institutionalEligibilityPayerID: string;
  institutionalEligibilityPayerListID: number | null;
  institutionalClearingHouseValue: string;
  institutionalSubmitPayerValue: string;
  institutionalEligibilityPayerValue: string;
}

export interface AddEditInsuranceData {
  insuranceID: number | null;
  insuranceName: string;
  insuranceTypeID: number | null;
  groupID: number | null;
  imgName: string | null;
  imgURL: string | null;
  insurancePortalURL: string | null;
  insurancePortalUser: string | null;
  insurancePortalPassword: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  zipCodeExtention: string | null;
  contactPerson: string | null;
  officePhone: string | undefined;
  fax: string | undefined;
  email: string | null;
  timelyFilingDays: number | null;
  followUpDays: number | null;
  underContract: boolean | null;
  underContractDate: string | null;
  eAttachment: boolean | null;
  clearingHouseID: number | null;
  submitPayerID: string | null;
  submitPayerListID: number | null;
  eligibilityPayerID: string | null;
  eligibilityPayerListID: number | null;
  comments: string | null;
  validateIDS: number[];
  active: boolean;
  institutionalClearingHouseID: number | null;
  institutionalSubmitPayerID: string | null;
  institutionalSubmitPayerListID: number | null;
  institutionalEligibilityPayerID: string | null;
  institutionalEligibilityPayerListID: number | null;
}

export interface AddEditFacilitiesData {
  facilityID: number | null;
  name: string | null;
  groupID: number | null;
  practiceID: number | null;
  placeOfServiceID: number | null;
  npi: string | null;
  cliaNo: string | null;
  address1: string | null;
  address2: string | null;
  city?: string;
  state?: string;
  zipCode?: string;
  zipCodeExtention: string | null;
  contact: string | null;
  officePhone: string | null;
  fax: string | null;
  email: string | null;
  active: boolean;
  comments: string | null;
  validateIDS: number[];
  billTypeID: number | null;
}
export interface PrintPatientStatementData {
  statementLogID: number;
  jsonResult: string;
}
export interface PracticeProfileData {
  id: number | undefined;
  name: string;
  groupID: number | null;
  npi: string;
  taxonomy: string;
  taxid: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zipcode: string;
  zipcodeExtension: string;
  contactPerson: string;
  officePhone: string;
  fax: string;
  email: string;
  payToAddress1: string;
  payToAddress2: string;
  payToCity: string;
  payToState: string;
  payToZip: string;
  payToZipExtension: string;
  statementDays: number | null;
  statementAmount: number | null;
  statementMessage: string;
  currentMessage: string;
  thirtyPlusMessage: string;
  sixtyPlusMessage: string;
  nintyPlusMessage: string;
  oneTwentyPlusMessage: string;
  active: boolean;
  comments: string;
  logoURL: string;
  logoName: string;
  createdOn: string;
  createdByID: string;
  createdBy: string;
  updatedOn: string;
  updatedByID: string;
  updatedBy: string;
  addressValidateOn: string;
  payToAddressValidateOn: string;
  validateIDS: number[];
  excludeStatementBalance: number | null;
}
export interface UpdateUserPasswordData {
  email: string;
  password: string;
  confirmPassword: string;
  passCode: string;
}
export interface EligibilityCheckListSearchCriteria {
  patientFirstName: string;
  patientLastName: string;
  patientDateOfBirth: string | null;
  patientID: string;
  groupID: number | null;
  practiceID: number | null;
  facilityID: number | null;
  insuranceID: number | null;
  serviceTypeID: number | null;
  fromRequestDate: string | null;
  toRequestDate: string | null;
  fromDOS: string | null;
  toDOS: string | null;
  pageNumber: number | undefined;
  pageSize: number | undefined;
  sortColumn: string;
  sortOrder: string;
  getAllData: Boolean | null;
  userID: string;
}
export interface EligibilityCheckListSearchResult {
  id: number;
  patientID: number;
  patientLastName: string;
  patientFirstName: string;
  insurance: string;
  dos: string;
  dosTo: string;
  eligibilityRequestDate: string;
  serviceType: string;
  total: number;
  message270: string;
}
export interface ERAFullDetailClaimsPaymentsAdjustmentsResult {
  eraChargeAdjustmentID: number;
  eraPaymentID: number;
  eraClaimID: number;
  adjustmentGroupCode: string;
  claimAdjustmentReasonCode: string;
  adjustmentAmount: number;
}
export interface ERAFullDetailClaimsPaymentsResult {
  eraPaymentID: number;
  eraClaimID: number;
  eraChargeID?: number;
  rendProv: string;
  servDate: string;
  mods: string;
  pdNOS: number;
  billedSubProc: number;
  allowed: number;
  deduct: number;
  coins: number;
  provPD: number;
  remarks: string;
  eraAdjustmentsData: ERAFullDetailClaimsPaymentsAdjustmentsResult[];
}
export interface ERAFullDetailClaimsTotalResult {
  eraClaimID: number;
  charges: number;
  allowedAmount: number;
  patientResponsibilityAmount: number;
  adjustmentAmount: number;
  deductAmount: number;
  cOInsAmount: number;
  paidAmount: number;
  eRAInterest: number;
  eRALateFillingCharges: number;
  netTotal: number;
}
export interface ERADetailERAClaimsList {
  eraClaimID: number;
  rendProv: string;
  servDate: string;
  mods: string;
  pdNOS: string;
  billedSubProc: string;
  allowed: string;
  deduct: string;
  coins: string;
  provPD: string;
  eraPaymentsData: ERAFullDetailClaimsPaymentsResult[];
  eraClaimsTotal: ERAFullDetailClaimsTotalResult;
}
export interface GetGroupReasonRemarkCodesByCheckIDResult {
  id: number;
  code: string;
  codeDescription: string;
}
export interface ERAFullDetailResult {
  eraID: number;
  insuranceName: string;
  insuranceAddress: string;
  insuranceCity: string;
  insuranceState: string;
  insuranceZipCode: string;
  insuranceBusinessContactName: string;
  insuranceBusinessContactPhone: string;
  insuranceTechnicalContact: string;
  insuranceTechnicalPhone: string;
  payeeName: string;
  payeeAddress: string;
  payeeCity: string;
  payeeState: string;
  payeeZipCode: string;
  payeeNPI: string;
  checkDate: string;
  checkNumber: string;
  checkAmount: number;
  claimsCount: number;
  billedAmount: number;
  adjustmentAmount: number;
  allowedAmount: number;
  coInsuranceAmount: number;
  deductibleAmount: number;
  patientResponsibilityAmount: number;
  paidAmount: number;
  eraClaimsData: ERADetailERAClaimsList[];
  eraGlossary: GetGroupReasonRemarkCodesByCheckIDResult[];
}
export interface DeleteNotesResult {
  message: string;
  errors: any[];
}
export interface ActionNeededClaimsResult {
  rid: number;
  value: string;
  viewBy: string;
  totalCount: number;
  color?: string;
}
export interface RecentlyAccessedData {
  id: number;
  type: string;
  value: string;
}
export interface UnresolvedTasksAssignedResult {
  id: number;
  claimID: number;
  dueDate: string;
  taskColor: string;
  total: number;
}
export interface OpenItemsResult {
  rid: number;
  value: string;
  viewBy: string;
  total: number;
}
export interface ArManagerOpenAtGlanceData {
  actionType: string;
  viewBy: string;
  tabValue: string;
}
export interface GetArManagerOpenAtGlanceData {
  type: typeof FETCH_AR_MANAGER_OPEN_AT_GLANCE_DATA;
  payload: ArManagerOpenAtGlanceData | null;
}
export interface ClaimValidationErrorsResult {
  id: number;
  claimID: number;
  chargeID: number;
  errorMessage: string;
  errorType: string;
}
export interface ClaimScrubbingErrorsResult {
  id: number;
  token: string;
  description: string;
  color: string;
  type: string;
}
export interface CollectedAmountsWidgetCriteria {
  userID?: string;
  groupID?: number;
  fromPostingDate?: string;
  toPostingDate?: string;
}
export interface CollectedAmountsWidgetResult {
  rid: number;
  value: string;
  viewBy: string;
  totalAmount: number;
}
export interface ExpectedPaymentsByDayResult {
  rid: number;
  postingDate: string;
  monthName: string;
  payments: number;
}
export interface AverageClaimsRevenueResult {
  rid: number;
  monthName: string;
  payments: number;
}
export interface AverageChargeAmountResult {
  rid: number;
  monthName: string;
  amounts: number;
}
export interface ARSByDataResult {
  rid: number;
  id: number;
  value: string;
  type: string;
  counts: number;
  totalAmount: number;
}
export interface InsurancesWithTypesDropdownResult {
  id: number;
  value: string;
  type: string;
}
export interface MedicalCaseModalData {
  medicalCaseID: number | null;
  patientID: number | null;
  facilityID?: number;
  patientInsuranceID?: number;
  title: string;
  hospitalCaseNumber: string;
  referringProviderFirstName: string;
  referringProviderLastName: string;
  referringProviderNPI: string;
  attendingProviderID?: number;
  operatingProviderID?: number;
  admissionDate: string | null;
  dischargeDate: string | null;
  admissionHourCode: string;
  dischargeHourCode: string;
  frequencyCode: string;
  admissionPriorityCode: string;
  admissionSourceCode: string;
  patDischargeStatusCode: string;
  conditCodeBox18: string;
  conditCodeBox19: string;
  conditCodeBox20: string;
  conditCodeBox21: string;
  conditCodeBox22: string;
  conditCodeBox23: string;
  conditCodeBox24: string;
  conditCodeBox25: string;
  conditCodeBox26: string;
  conditCodeBox27: string;
  conditCodeBox28: string;
  accidentStateBox29: string;
  occurrCodeBox31: string;
  occurrDateBox31: string | null;
  occurrCodeBox32: string;
  occurrDateBox32: string | null;
  occurrCodeBox33: string;
  occurrDateBox33: string | null;
  occurrCodeBox34: string;
  occurrDateBox34: string | null;
  occurrSpanCodeBox35: string;
  occurrSpanFromDateBox35: string | null;
  occurrSpanToDateBox35: string | null;
  occurrSpanCodeBox36: string;
  occurrSpanFromDateBox36: string | null;
  occurrSpanToDateBox36: string | null;
  valCodeBox39a: string;
  valCodeAmtBox39a?: number;
  valCodeBox39b: string;
  valCodeAmtBox39b?: number;
  valCodeBox39c: string;
  valCodeAmtBox39c?: number;
  valCodeBox39d: string;
  valCodeAmtBox39d?: number;
  valCodeBox40a: string;
  valCodeAmtBox40a?: number;
  valCodeBox40b: string;
  valCodeAmtBox40b?: number;
  valCodeBox40c: string;
  valCodeAmtBox40c?: number;
  valCodeBox40d: string;
  valCodeAmtBox40d?: number;
  valCodeBox41a: string;
  valCodeAmtBox41a?: number;
  valCodeBox41b: string;
  valCodeAmtBox41b?: number;
  valCodeBox41c: string;
  valCodeAmtBox41c?: number;
  valCodeBox41d: string;
  valCodeAmtBox41d?: number;
  admitDxBox69: string;
  diagnosis1: string;
  diagnosis2: string;
  diagnosis3: string;
  diagnosis4: string;
  diagnosis5: string;
  diagnosis6: string;
  diagnosis7: string;
  diagnosis8: string;
  diagnosis9: string;
  diagnosis10: string;
  diagnosis11: string;
  diagnosis12: string;
  patReasonDxBox70a: string;
  patReasonDxBox70b: string;
  patReasonDxBox70c: string;
  ppsCodeBox71: string;
  eciBox72a: string;
  eciBox72b: string;
  eciBox72c: string;
  princProcedureCodeBox74: string;
  princProcedureDateBox74: string | null;
  othProcedureCodeBox74a: string;
  othProcedureDateBox74a: string | null;
  othProcedureCodeBox74b: string;
  othProcedureDateBox74b: string | null;
  othProcedureCodeBox74c: string;
  othProcedureDateBox74c: string | null;
  othProcedureCodeBox74d: string;
  othProcedureDateBox74d: string | null;
  othProcedureCodeBox74e: string;
  othProcedureDateBox74e: string | null;
  caseTypeID?: number;
  caseStatusCode: string;
  caseNoteType?: number;
  caseNote: string;
}
export interface DropdownLookup {
  id: number;
  code: string;
  value: string;
}
export interface MedicalCaseLookup {
  frequencyData: DropdownLookup[];
  admissionPriorityData: DropdownLookup[];
  admissionSourceData: DropdownLookup[];
  hoursData: DropdownLookup[];
  patientDischargeStatusData: DropdownLookup[];
  accidentStateData: DropdownLookup[];
  caseStatusData: DropdownLookup[];
  conditionCodeData: DropdownLookup[];
  occurrenceCodeData: DropdownLookup[];
  occurrenceSpanCodeData: DropdownLookup[];
  valueCodeData: DropdownLookup[];
}
export interface PatientMedicalCaseSummary {
  caseStatusCode: string;
  caseStatus: string;
  counts: number;
}
export interface PatientMedicalCaseResults {
  medicalCaseID: number;
  title: string;
  facilityID: number;
  facility: string;
  facilityAddress: string;
  insuranceID: number;
  insurance: string;
  attendingProviderID?: number;
  attendingProvider: string;
  operatingProviderID?: number;
  operatingProvider: string;
  admissionDate: string;
  dischargeDate: string;
  dischargeStatus: string;
  caseStatusCode: string;
  caseStatus: string;
  createdOn: string;
  createdByID: string;
  createdBy: string;
  updatedOn: string;
  updatedByID: string;
  updatedBy: string;
  total: number;
  patientInsuranceID: number;
}
export interface PatientMedicalCaseGridData {
  summary: PatientMedicalCaseSummary[];
  patientMedicalCases: PatientMedicalCaseResults[];
}
export interface GetLinkableClaimsForMedicalCaseCriteria {
  patientID?: number;
  facilityID?: number;
  patientInsuranceID?: number;
  medicalCaseID?: number;
}
export interface GetLinkableClaimsForMedicalCaseResult {
  claimID: number;
  dos: string;
  patientID: number;
  patient: string;
  insuranceID: number;
  insurance: string;
  facilityID: number;
  facility: string;
  facilityAddress: string;
  claimStatus: string;
  parentClaimID?: number;
  claimCreatedOn: string;
  claimCreatedBy: string;
}
export interface RevenueCodeDropdownType {
  id: number;
  value: string;
  insuranceID: number;
}
export interface RevenueCrossWalkSearchCriteria {
  practiceID?: number;
  insuranceID?: number;
  cptCode: string;
  revenueCode: string;
  pageNumber?: number;
  pageSize?: number;
  sortColumn: string;
  sortOrder: string;
  getAllData?: Boolean;
}
export interface RevenueCrossWalkSearchResult {
  revenueCrossWalkID: number;
  groupID: number;
  group: string;
  groupEIN: string;
  practiceID: number;
  practice: string;
  practiceAddress: string;
  insuranceID: number;
  insurance: string;
  cptCode: string;
  revenueCode: string;
  active: string;
  updatedOn: string;
  updatedByID: string;
  updatedBy: string;
}
export interface AddUpdateCptRevenueCrosswalkData {
  cptRevenueCrossWalkID: number | null;
  groupID: number | null;
  practiceID: number | null;
  insuranceID: number | null;
  revenueCode: string;
  cptCode: string;
  active: boolean;
}
export interface RevenueCodesData {
  id: number;
  value: string;
  code: string;
}
export interface ClaimDnaPaymentDetails {
  paymentLedgerID: number | null;
  patientID?: number;
  patient: string;
  claimID?: number;
  chargeID?: number;
  ledgerAccount: string;
  paymentType: string;
  paymentBatchID?: number;
  checkNumber: string;
  postingDate: string;
  checkDate: string;
  depositDate: string;
  advancePayDOS: string | null;
  amount?: number | null;
  comments: string;
  denialReason: string;
  adjustmentCodes: string;
  remarkCodes: string;
  parentPaymentLedgerID?: number | null;
  externalLedgerID?: number | null;
  isReconsiled: boolean;
  reconsileOn?: string | null;
  reconsileBy: string;
  createdOn: string;
  createdBy: string;
  updatedOn?: string | null;
  updatedBy?: string;
  paymentBatchDescription: string;
}
export interface AutoPopulateClaimsForPatientsDataResult {
  claimID: number;
  fromDOS: string;
  toDOS: string;
  providerID: number;
  provider: string;
  referringProvider: string;
  referringProviderFirstName: string;
  referringProviderLastName: string;
  referringProviderNPI: string;
  icds: string;
  cpts: string;
  icd1: string;
  icd2: string;
  icd3: string;
  icd4: string;
  icd5: string;
  icd6: string;
  icd7: string;
  icd8: string;
  icd9: string;
  icd10: string;
  icd11: string;
  icd12: string;
}
export interface ChargeDetailReportsSummary {
  label: string;
  value: number;
}
export interface ChargeDetailReportData {
  summary: ChargeDetailReportsSummary[];
  chargeDetailReportsData: GetChargeDetailReportResult[];
}
export interface PatientUnappliedAdvancePaymentResult {
  patientID: number;
  unappliedAdvancePayment: number;
  patientBalance: number;
}
export interface ChargeDiagnosisFieldsUpdate {
  chargeID: number;
  icd1: string;
  icd2: string | null;
  icd3: string | null;
  icd4: string | null;
  pointers: string;
}
export interface GetDuplicateWarningCriteria {
  practiceID: number | null;
  patientFirstName: string;
  patientLastName: string;
  patientDateOfBirth: string;
  patientID: number | null;
  dos: string;
  chargeDOS: string;
  cpt: string;
  checkDuplicateType: string | null;
}
export interface ActiveProviderData {
  id: number;
  value: string;
  providerNPI: string;
}
export interface PatientAccountStatementsDetailCriteria {
  patientIDs: string;
  userID: string;
  paymentsBy: string;
  chargesBy: string;
  paymentsDateFrom: string;
  paymentsDateTo: string;
  chargesDateFrom: string;
  chargesDateTo: string;
}
export interface PatientInsuranceDataById {
  patientInsuranceID: number;
  patientID: number;
  insuranceID: number;
  insuranceAddressID: number;
  payerResponsibilityID: number;
  insuredRelationID: number;
  mspTypeID: number;
  policyStartDate: string;
  policyEndDate: string;
  insuranceNumber: number;
  groupName: string;
  groupNumber: number;
  wcClaimNumber: number;
  genderID: number;
  firstName: string;
  lastName: string;
  middleName: string;
  dob: string;
  ssn: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zipCode: string;
  zipCodeExtension: string;
  homePhone: string;
  officePhone: string;
  officePhoneExtension: string;
  cell: string;
  email: string;
  assignment: boolean;
  copay: number;
  active: boolean;
  createdOn: string;
  createdBy: string;
  updatedOn: string;
  updatedBy: string;
  comment: string;
  accidentDate: string;
  accidentTypeID: number;
  accidentStateID: number;
  fax: string;
}
export interface PatientAccountStatementsDetailResult {
  patientID: number;
  firstName: string;
  lastName: string;
  dob: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zipCode: string;
  zipExt: string;
  practiceName: string;
  practiceAddress1: string;
  practiceAddress2: string;
  practiceCity: string;
  practiceState: string;
  practiceZipCode: string;
  practiceZipExt: string;
  chargeDataJSON: string;
  // cptDescription: string;
  lastPaymentAmount?: number;
  lastPaymentDate: string;
  totalPatientBalance?: number;
}
export type SharedActions =
  | SetSidebarContent
  | ToggleContentSidebar
  | ToggleMenu
  | AddToastNotification
  | RemoveToastNotification
  | PatientSearchRequest
  | PatientSearchSuccess
  | PatientSearchFailure
  | GetLookupDropdownsDataRequest
  | GetLookupDropdownsDataSuccess
  | GetLookupDropdownsDataFailure
  | GetPatientInsuranceDataRequest
  | GetPatientInsuranceDataSuccess
  | GetPatientInsuranceDataFailure
  | GetClaimPatientInsuranceDataRequest
  | GetClaimPatientInsuranceDataSuccess
  | GetClaimPatientInsuranceDataFailure
  | GetAssignClaimToDataRequest
  | GetAssignClaimToDataFailure
  | GetAssignClaimToDataSuccess
  | GetReferringProviderDataRequest
  | GetReferringProviderDataSuccess
  | GetReferringProviderDataFailure
  | GetGlobleSearchRecentsDataRequest
  | GetGlobleSearchRecentsDataSuccess
  | GetGlobleSearchRecentsDataFailure
  | GetGroupDataRequest
  | GetGroupDataSuccess
  | GetGroupDataFailure
  | GetPracticeDataRequest
  | GetPracticeDataSuccess
  | GetPracticeDataFailure
  | GetFacilityDataRequest
  | GetFacilityDataSuccess
  | GetFacilityDataFailure
  | GetProviderDataRequest
  | GetProviderDataSuccess
  | GetProviderDataFailure
  | CPTSearchRequest
  | CPTSearchSuccess
  | CPTSearchFailure
  | SearchProviderRequest
  | SearchProviderSuccess
  | SearchProviderFailure
  | ICDSearchRequest
  | ICDSearchSuccess
  | ICDSearchFailure
  | SaveClaimChargePaymentRequest
  | SaveClaimChargePaymentSuccess
  | SaveClaimChargePaymentFailure
  | BatchNumberRequest
  | BatchNumberSuccess
  | BatchNumberFailure
  | SaveChargeRequest
  | SaveChargeSuccess
  | SaveChargeFailure
  | EditClaimRequest
  | EditClaimSuccess
  | EditClaimFailure
  | CPTNDCRequest
  | CPTNDCSuccess
  | CPTNDCFailure
  | SaveCptNdcRequest
  | SaveCptNdcSuccess
  | SaveCptNdcFailure
  | BatchDocumentRequest
  | BatchDocumentSuccess
  | BatchDocumentFailure
  | BatchDocumentPageRequest
  | BatchDocumentPageSuccess
  | BatchDocumentPageFailure
  | UpdateChargeRequest
  | UpdateChargeSuccess
  | UpdateChargeFailure
  | SetRouteHistory
  | SetGlobalModal
  | ScrubClaimRequest
  | ScrubClaimSuccess
  | ScrubClaimFailure
  | UploadedDocumentRequest
  | UploadedDocumentSuccess
  | UploadedDocumentFailure
  | AppSpinnerType
  | GetAllInsuranceData
  | ExpandSideMenuBar
  | SetSelectedPaymentBatchID
  | ScreenInactivityStatus
  | GetArManagerOpenAtGlanceData;
