import type { GridRowId } from '@mui/x-data-grid-pro';
import type { AxiosResponse } from 'axios';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { v4 as uuidv4 } from 'uuid';

// eslint-disable-next-line import/no-cycle
import { httpClient } from '@/api/http-client';
import type { SingleSelectDropDownDataType } from '@/components/UI/SingleSelectDropDown';
/* eslint-disable-next-line */
import { handleApiError } from "@/utils/apiHelpers";

/* eslint-disable-next-line */
import store from "..";
import {
  addToastNotification,
  editClaimFailure,
  editClaimSuccess,
  fetchAssignClaimToDataFailure,
  fetchAssignClaimToDataSuccess,
  fetchBatchDocumentFailure,
  fetchBatchDocumentPageFailure,
  fetchBatchDocumentPageSuccess,
  fetchBatchDocumentSuccess,
  fetchBatchNumberFailure,
  fetchBatchNumberSuccess,
  fetchClaimPatientInsranceDataFailure,
  fetchClaimPatientInsranceDataSuccess,
  fetchCPTNdcFailure,
  fetchCPTNdcSuccess,
  fetchCPTSearchFailure,
  fetchCPTSearchSuccess,
  fetchFacilityDataFailure,
  fetchFacilityDataSuccess,
  fetchGlobleSearchRecentsDataFailure,
  fetchGlobleSearchRecentsDataSuccess,
  fetchGroupDataFailure,
  fetchGroupDataSuccess,
  fetchICDSearchFailure,
  fetchICDSearchSuccess,
  fetchPatientInsranceDataFailure,
  fetchPatientInsranceDataSuccess,
  fetchPatientSearchFailure,
  fetchPatientSearchSuccess,
  fetchPracticeDataFailure,
  fetchPracticeDataSuccess,
  fetchProviderDataFailure,
  fetchProviderDataSuccess,
  fetchReferringProviderDataFailure,
  fetchReferringProviderDataSuccess,
  fetchSearchProviderFailure,
  fetchSearchProviderSuccess,
  fetchUploadedClaimDocumentFailure,
  fetchUploadedClaimDocumentSuccess,
  getAllInsuranceData,
  getLookupDropdownsFailure,
  getLookupDropdownsSuccess,
  saveChargeSuccess,
  saveClaimFailure,
  saveCptNdcFailure,
  saveCptNdcSuccess,
  scrubClaimFailure,
  scrubClaimSuccess,
  setAppSpinner,
  updateChargeFailure,
  updateChargeSuccess,
} from './actions';
import {
  ASSIGN_CLAIM_TO_DATA_REQUEST,
  BATCH_DOCUMENT_PAGE_REQUEST,
  BATCH_DOCUMENT_REQUEST,
  BATCH_NUMBER_REQUEST,
  CPT_NDC_REQUEST,
  CPT_SEARCH_REQUEST,
  EDIT_CLAIM_REQUEST,
  FACILITY_DATA_REQUEST,
  GET_ALL_GLOBLE_SEARCH_RECENTS_DATA_REQUEST,
  GET_CLAIM_PATIENT_INSURANCE_DATA_REQUEST,
  GET_LOOKUP_DROPDOWNS_DATA_REQUEST,
  GET_PATIENT_INSURANCE_DATA_REQUEST,
  GROUP_DATA_REQUEST,
  ICD_SEARCH_REQUEST,
  PATIENT_SEARCH_REQUEST,
  PRACTICE_DATA_REQUEST,
  PROVIDER_DATA_REQUEST,
  REFERRING_PROVIDER_DATA_REQUEST,
  SAVE_CHARGE_REQUEST,
  SAVE_CPT_NDC_REQUEST,
  SCRUB_CLAIM_REQUEST,
  SEARCH_PROVIDER_REQUEST,
  UPDATE_CHARGE_REQUEST,
  UPLOAD_DOCUMENT_REQUEST,
} from './actionTypes';
import type {
  ActionNeededClaimsResult,
  ActiveProviderData,
  AddEditFacilitiesData,
  AddPatientCopaymentResponce,
  AddUpdateCptNdcCrosswalk,
  AddUpdateCptRevenueCrosswalkData,
  AddUpdateFeeSchedule,
  AdvancePayemntData,
  AgedTrialBalanceReportCriteria,
  AgedTrialBalanceReportResult,
  AgingByInsuranceReportCriteria,
  AgingByInsuranceReportDetailsCriteria,
  AgingByInsuranceReportDetailsResult,
  AgingByPatientReportCriteria,
  AgingByPatientReportDetailsCriteria,
  AgingByPatientReportDetailsResult,
  AgingByProviderReportCriteria,
  AgingInsuranceReportData,
  AgingPatientReportData,
  AgingProviderReportData,
  AllClaimsAsigneeData,
  AllClaimsExpandRowResult,
  AllClaimsScrubResponseResult,
  AllClaimsTableSearchResultType,
  AllInsuranceData,
  ApplyPaymentPostingRsult,
  ARSByDataResult,
  AssignClaimToData,
  AssignClaimToRequestPayload,
  AutoPopulateClaimsForPatientsDataResult,
  BatchDocumentCriteria,
  BatchDocumentOutput,
  BatchDocumentPageCriteria,
  BatchDocumentPageOutput,
  BatchDocumentPageRequest,
  BatchDocumentRequest,
  BatchNumberCriteria,
  BatchNumberOutput,
  BatchNumberRequest,
  BatchSearchCriteria,
  ChargeBatchChargesResult,
  ChargeDetailData,
  ChargeDetailReportData,
  ChargeDiagnosisFieldsUpdate,
  ChargeFeeCriteria,
  ChargeFeeOutput,
  ChargeHistoryData,
  ChargesPaymentsSummaryByProviderCriteria,
  ChargesPaymentsSummaryByProviderReport,
  ClaimActivityReportCriteria,
  ClaimActivityReportResult,
  ClaimAdvancePayment,
  ClaimDataByClaimIDResult,
  ClaimDetailResultById,
  ClaimDetailSummaryResult,
  ClaimDNALogResult,
  ClaimDnaPaymentDetails,
  ClaimFinancials,
  ClaimLogsData,
  ClaimNotesData,
  ClaimPatientInsuranceData,
  ClaimPatientInsuranceRequestPayload,
  ClaimScrubbingErrorsResult,
  ClaimsSubmitDataType,
  ClaimsSubmitRequest,
  ClaimStatsData,
  ClaimSubmissionReportCriteria,
  ClaimSubmissionReportResult,
  ClaimValidationErrorsResult,
  CollectedAmountsWidgetCriteria,
  CollectedAmountsWidgetResult,
  CPTNDCCriteria,
  CptNdcCrosswalkCriteria,
  CptNdcCrosswalkEditResult,
  CptNdcCrosswalkResult,
  CPTNDCOutput,
  CPTNDCRequest,
  CPTSearchCriteria,
  CPTSearchOutput,
  CPTSearchRequest,
  CreateAndEditTaskRequestData,
  CreateAndEditTaskResponseData,
  CreateCrossoverCriteria,
  CreateMultipleTasksResult,
  CreateTasksRequestData,
  DataRoleResult,
  DataRoleSearchCriteria,
  DeleteGuarantorResponse,
  DeleteICDResult,
  DeleteNotesResult,
  DeletePatientResponseDate,
  DocumentSearchCriteria,
  EDIImportDropdown,
  EDIImportLogCriteria,
  EditClaimRequest,
  EditClaimSuccessPayload,
  EligibilityCheckListSearchCriteria,
  EligibilityCheckListSearchResult,
  EligibilityRequestData,
  EndOfMonthReportCriteria,
  EndOfMonthReportResult,
  EndOfMonthViewDetailResult,
  EOMMonthlySummaryReportCriteria,
  EOMMonthlySummaryReportData,
  EOMReportViewDetailSearchCriteria,
  EOMViewDetailGridCriteria,
  EOMViewDetailGridResult,
  ERAFullDetailResult,
  ExpectedPaymentsByDayResult,
  FacilitiesResultData,
  FacilityData,
  FacilityDataRequestPayload,
  FeeScheduleCriteria,
  FeeScheduleResult,
  GetAllClaimsSearchChargesData,
  GetAllClaimsSearchDataClaimIDSResult,
  GetAllClaimsSearchDataCriteria,
  GetAllClaimsSearchDataResult,
  GetAllClaimsSearchStatusCategories,
  GetAllPatientsSearchDataCriteria,
  GetAllPatientsSearchDataPatientIDSResult,
  GetAllPatientsSearchDataResult,
  GetARClaimsSearchChargesData,
  GetARClaimsSearchDataCriteria,
  GetARClaimsSearchDataResult,
  GetARClaimsSectionCategories,
  GetAssignClaimToDataRequest,
  GetBatchSearchAPIResult,
  GetChargeBatchCriteria,
  GetChargeBatchResult,
  GetChargeDetailReportCriteria,
  GetChargesDataCriterea,
  GetChargesDataResult,
  GetClaimPatientInsuranceDataRequest,
  GetClaimStatusHistoryDetailResult,
  GetClaimStatusHistoryViewDetailResult,
  GetDenialReportCriteria,
  GetDenialReportResult,
  GetDocumentSearchAPIResult,
  GetDuplicateWarningCriteria,
  GetEDIImportLogAPIResult,
  GetERADetailCharges,
  GetERADetailSummary,
  GetFacilityDataRequest,
  GetGlobleSearchRecentsDataRequest,
  GetLinkableClaimsForMedicalCaseCriteria,
  GetLinkableClaimsForMedicalCaseResult,
  GetPatientInsuranceDataRequest,
  GetPatientRequestData,
  GetPatientStatemntCriteria,
  GetPaymentBatchCriteria,
  GetPaymentBatchResult,
  GetPaymentBatchStatusResult,
  GetPaymentERACriteria,
  GetPaymentPostingErrorsResult,
  GetPaymentReconcilationLedgerCriteria,
  GetPaymentReconcilationLedgerResult,
  GetPaymentReportCriteria,
  GetPaymentReportsAPIResult,
  GetPaymentsBatchesResult,
  GetPaymentsERAResult,
  GetPracticeDataRequest,
  GetProviderDataRequest,
  GetRealTimeClaimStatusResult,
  GetRealTimeClaimStatusViewDetailResult,
  GetReconciledSearchAPIResult,
  GetReferringProviderDataRequest,
  GetReferringProviderRequestPayload,
  GlobleSearchCriteria,
  GlobleSearchRecentsData,
  GlobleSearchRecentsDataRequestPayload,
  GlobleSearchResult,
  GlobleSearchViewCriteria,
  GlobleSearchViewResult,
  GroupData,
  GroupResultData,
  GroupSearchCriteria,
  ICDSearchCriteria,
  ICDSearchOutput,
  ICDSearchRequest,
  IdValuePair,
  InsuranceInfoData,
  InsuranceProfileReportCriteria,
  InsuranceProfileReportData,
  InsuranceResultData,
  InsurancerFinderData,
  InsurancesWithTypesDropdownResult,
  LinkPaymentPostingCriterea,
  LookupDropdownsData,
  LookupDropdownsDataType,
  MedicalCaseLookup,
  MedicalCaseModalData,
  ModalFieldsResult,
  ModuleFields,
  ModuleResultData,
  ModulesByRoleIdResultData,
  MonthlySummaryReportCriteria,
  MonthlySummaryReportData,
  OpenItemsResult,
  PatientAccountingReportCriteria,
  PatientAccountingReportResult,
  PatientAccountStatementsDetailCriteria,
  PatientAccountStatementsDetailResult,
  PatientAdvancePaymentReportCriteria,
  PatientAdvancePaymentReportResult,
  PatientBasedInsuranceDropdown,
  PatientDocumnetData,
  PatientFinicalTabData,
  PatientGuarantorTabData,
  PatientInsuranceActieResult,
  PatientInsuranceActiveData,
  PatientInsuranceData,
  PatientInsuranceRequestPayload,
  PatientInsuranceTabData,
  PatientLookupDropdown,
  PatientMedicalCaseGridData,
  PatientProfileInsuranceData,
  PatientProfileInsuranceResponse,
  PatientSearchCriteria,
  PatientSearchOutput,
  PatientSearchRequest,
  PatientStatementType,
  PatientUnappliedAdvancePaymentResult,
  PatientUploadDocsResponse,
  PaymentBatchData,
  PaymentBatchPaidChargesResult,
  PlanProcedureCountDetails,
  PlanProcedureCountDetailsCriteria,
  PlanProcedureHistoryCriteria,
  PlanProcedurePayerHistoryCriteria,
  PlanProcedurePayerHistoryReport,
  PostingDateCriteria,
  PostingDateResult,
  PracticeData,
  PracticeDataRequestPayload,
  PrintPatientStatementData,
  ProcedureHistoryReport,
  ProcedureTransactionHistoryReportCriteria,
  ProcedureTransactionHistoryReportResult,
  ProviderData,
  ProviderDataRequestPayload,
  ProviderFields,
  ProviderResultData,
  ReasonCodeType,
  ReassignBatchData,
  ReassignClaimData,
  ReassignMultipleClaimData,
  RecentlyAccessedData,
  ReconcilePayment,
  ReconcilePaymentResult,
  ReconciliationCriteria,
  ReferringProviderData,
  RefreshDateTimeResult,
  RefundPaymentData,
  RevenueCodeDropdownType,
  RevenueCodesData,
  RevenueCrossWalkSearchCriteria,
  RevenueCrossWalkSearchResult,
  ReversePaymetLedgerFields,
  RoleResultData,
  SaveAdvancePayment,
  SaveChargeRequest,
  SaveChargeRequestPayload,
  SaveChargeSuccessPayload,
  SaveClaimChargePaymentRequestPayload,
  SaveClaimRequestPayload,
  SaveClaimSuccessPayload,
  SaveCptNdcRequest,
  SaveCptNdcRequestPayload,
  SaveCptNdcSuccessPayload,
  SavedSearchs,
  SaveGauranterData,
  SaveGaurantorResponseData,
  SaveInsurancePaymentCriteria,
  SavePatientPaymentCriteria,
  SavePatientRequestData,
  SavePatientResponseDate,
  SavePaymentRequestPayload,
  SaveWriteOffCriteria,
  ScrubClaimData,
  ScrubClaimRequest,
  ScrubClaimSuccessPayload,
  SearchProviderRequest,
  SearchProviderRequestPayload,
  SearchProviderSuccessPayload,
  SearchWriteOffCriteria,
  SearchWriteOffResult,
  StatementResponse,
  StatemntExportType,
  TAddEditRole,
  TaskGridData,
  TaskTypesData,
  TBatchUploadedDocument,
  TChargeBatchDetailType,
  TChargeBatchType,
  TDataRoleGroups,
  TDataRolePractices,
  TDocumentBatchType,
  TDownloadClaimDocumentType,
  TGetModuleForAssignPrivilege,
  TGetModuleTypes,
  TimeFrameData,
  TPaymentBatchDetailType,
  TPaymentBatchType,
  TPaymentERADetailType,
  TPaymentLedgerByBatchIDResult,
  TPaymentPostingResult,
  TResetPasswordJson,
  UnresolvedTasksAssignedResult,
  UpdateChargeRequest,
  UpdateChargeSuccessPayload,
  UpdateDosData,
  UpdateGauranterData,
  UpdatePatientInsuranceData,
  UpdateUserPasswordData,
  UploadedDocumentCriteria,
  UploadedDocumentOutput,
  UploadedDocumentRequest,
  UserFields,
  UserLookup,
  UserResultData,
  ValidateAddressDataType,
  ValidateDemographicResponseDate,
  ViewReportLog,
  VoidClaimResult,
} from './types';
import { ToastType } from './types';

const getPatientSearchData = (searchCriteria: PatientSearchCriteria) =>
  httpClient.get<any>(
    `/Repository/getPatientSearch?patientSearch=${JSON.stringify(
      searchCriteria
    )}`
  );
const getPatientInsuranceData = (
  patientInsuranceRequestPayload: PatientInsuranceRequestPayload
) =>
  httpClient.get<any>(
    `/Repository/getPatientInsurance?patientID=${patientInsuranceRequestPayload.patientID}`
  );
const getClaimPatientInsuranceData = (
  patientInsuranceRequestPayload: ClaimPatientInsuranceRequestPayload
) =>
  httpClient.get<any>(
    `/AddEditClaim/getClaimPatientInsurances?claimID=${patientInsuranceRequestPayload.claimID}`
  );
const getLookupDropdownsData = () =>
  httpClient.get<any>(`/Repository/getLookupDropowns/`);
const getAssignClaimToData = (
  assignClaimToRequestPayload: AssignClaimToRequestPayload
) =>
  httpClient.get<any>(
    `/Repository/getAssignClaimTo?clientID=${assignClaimToRequestPayload.clientID}`
  );
const getReferringProviderData = (
  requestPayload: GetReferringProviderRequestPayload
) =>
  httpClient.get<any>(
    `/Repository/getReferringProvider?groupID=${requestPayload.groupID}`
  );
const getGlobleSearchRecentsData = (
  globleSearchRecentsRequest: GlobleSearchRecentsDataRequestPayload
) =>
  httpClient.get<any>(
    `/Repository/getGlobalSearchRecents?groupID=${globleSearchRecentsRequest.groupID}&category=${globleSearchRecentsRequest.category}`
  );
const getGroupsData = () => httpClient.get<any>(`/Repository/getGroups/`);
const getPracticesData = (practiceRequest: PracticeDataRequestPayload) =>
  httpClient.get<any>(
    `/Repository/getPractices?groupID=${practiceRequest.groupID}`
  );
const getFacilitiesData = (dataRequestPayload: FacilityDataRequestPayload) =>
  httpClient.get<any>(
    `/Repository/getFacilities?groupID=${dataRequestPayload.groupID}`
  );
const getProvidersData = (dataRequestPayload: ProviderDataRequestPayload) =>
  httpClient.get<any>(
    `/Repository/getProviders?groupID=${dataRequestPayload.groupID}`
  );
// const getSaveClaimData = (claimData: SaveClaimChargePaymentRequestPayload) =>
//   httpClient.post<any>(`/AddEditClaim/saveClaimChargeAndPayment`, claimData);
const getCPTSearchData = (searchCriteria: CPTSearchCriteria) =>
  httpClient.get<any>(
    `/Repository/getCPTCodes?searchValue=${searchCriteria.searchValue}` +
      `&clientID=${searchCriteria.clientID}`
  );
const getCPTNdcData = (searchCriteria: CPTNDCCriteria) =>
  httpClient.get<any>(
    `/Claims/getCptNdcData?practiceID=${searchCriteria.practiceID}` +
      `&cptCode=${searchCriteria.cptCode}`
  );
const getBatchNumberData = (searchCriteria: BatchNumberCriteria) =>
  httpClient.get<any>(
    `/Repository/getChargeBatches?searchValue=${searchCriteria.searchValue}` +
      `&clientID=${searchCriteria.clientID}`
  );
const getBatchDocumentData = (searchCriteria: BatchDocumentCriteria) =>
  httpClient.get<any>(
    `/Repository/getChargeBatchDocument?chargeBatchID=${searchCriteria.chargeBatchID}` +
      `&getInactive=${searchCriteria.getInactive}`
  );
const getBatchDocumentPageData = (searchCriteria: BatchDocumentPageCriteria) =>
  httpClient.get<any>(
    `/Repository/getDocumentPage?documentID=${searchCriteria.documentID}`
  );
const getSaveChargeData = (chargeData: SaveChargeRequestPayload) =>
  httpClient.post<any>(`/AddEditClaim/saveCharge`, chargeData);
const getUpdateChargeData = (chargeData: SaveChargeRequestPayload) =>
  httpClient.post<any>(`/AddEditClaim/editCharge`, chargeData);
const getSaveCptNdcData = (ndcData: SaveCptNdcRequestPayload) =>
  httpClient.post<any>(`/AddEditClaim/addUpdateCptNdcData`, ndcData);
const getSearchProviderData = (searchCriteria: SearchProviderRequestPayload) =>
  httpClient.get<any>(
    `/Reports/getProviderInforFromNPPES?firstName=${searchCriteria.firstName}` +
      `&lastName=${searchCriteria.lastName}` +
      `&taxonomyDescription=${searchCriteria.taxonomyDescription}` +
      `&npi=${searchCriteria.npi}` +
      `&type=${searchCriteria.type}` +
      `&exactMatch=${searchCriteria.exactMatch}` +
      `&state=${searchCriteria.state}` +
      `&zip=${searchCriteria.zip}` +
      `&limit=${searchCriteria.limit}`
  );
const getICDSearchData = (searchCriteria: ICDSearchCriteria) =>
  httpClient.get<any>(
    `/Repository/getICDCodes?searchValue=${searchCriteria.searchValue}`
  );

const getClaimDocumentData = (uploadedDocCriteria: UploadedDocumentCriteria) =>
  httpClient.get<any>(
    `Patient/getClaimDocuments?claimID=${uploadedDocCriteria.claimID}` +
      `&groupID=${uploadedDocCriteria.groupID}` +
      `&categoryID=${uploadedDocCriteria.categoryID}`
  );
const getScrubClaimData = (scrubClaim: ScrubClaimData[]) =>
  httpClient.post<any>(`/Claims/claimScrubing/`, scrubClaim);
const getEditClaimData = (claimData: SaveClaimRequestPayload) =>
  httpClient.post<any>(`/AddEditClaim/editClaim`, claimData);
function* patientSearchRequestSaga({ payload }: PatientSearchRequest) {
  try {
    const response: AxiosResponse<PatientSearchOutput[]> = yield call(
      getPatientSearchData,
      payload.patientSearch
    );
    yield put(fetchPatientSearchSuccess(response.data));
  } catch (e: any) {
    yield put(
      addToastNotification({
        id: uuidv4(),
        text: 'Error in Fetching Patient Search Data',
        toastType: ToastType.ERROR,
      })
    );
    yield put(
      fetchPatientSearchFailure({
        error: e.message,
      })
    );
  }
}
export async function voidClaims(claimID: number, postingDate: string) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<VoidClaimResult> =
      await httpClient.get<VoidClaimResult>(
        `/AddEditClaim/voidEncounterClaim?claimID=${claimID}&postingDate=${postingDate}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data || [];
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function voidClaim(voidClaimRequest: number[]) {
  const payload = { claimIDS: voidClaimRequest };
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/Claims/voidClaim/`,
      payload
    );
    store.dispatch(setAppSpinner(false));
    return response.data || [];
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
function* patientInsuranceRequestSaga({
  payload,
}: GetPatientInsuranceDataRequest) {
  try {
    const response: AxiosResponse<PatientInsuranceData[]> = yield call(
      getPatientInsuranceData,
      payload
    );
    yield put(fetchPatientInsranceDataSuccess(response.data));
  } catch (e: any) {
    yield put(
      addToastNotification({
        id: uuidv4(),
        text: 'Error in Fetching Patient Insurance Data',
        toastType: ToastType.ERROR,
      })
    );
    yield put(
      fetchPatientInsranceDataFailure({
        error: e.message,
      })
    );
  }
}
function* claimPatientInsuranceRequestSaga({
  payload,
}: GetClaimPatientInsuranceDataRequest) {
  try {
    const response: AxiosResponse<ClaimPatientInsuranceData[]> = yield call(
      getClaimPatientInsuranceData,
      payload
    );
    yield put(fetchClaimPatientInsranceDataSuccess(response.data));
  } catch (e: any) {
    yield put(
      addToastNotification({
        id: uuidv4(),
        text: 'Error in Fetching Patient Insurance Data',
        toastType: ToastType.ERROR,
      })
    );
    yield put(
      fetchClaimPatientInsranceDataFailure({
        error: e.message,
      })
    );
  }
}
function* lookupDropdownsSaga() {
  try {
    const response: AxiosResponse<LookupDropdownsData> = yield call(
      getLookupDropdownsData
    );
    yield put(getLookupDropdownsSuccess(response.data));
  } catch (e: any) {
    yield put(
      addToastNotification({
        id: uuidv4(),
        text: 'Error in Fetching Lookups Data',
        toastType: ToastType.ERROR,
      })
    );
    yield put(
      getLookupDropdownsFailure({
        error: e.message,
      })
    );
  }
}
function* assignClaimToSaga({ payload }: GetAssignClaimToDataRequest) {
  try {
    const response: AxiosResponse<AssignClaimToData[]> = yield call(
      getAssignClaimToData,
      payload
    );
    yield put(fetchAssignClaimToDataSuccess(response.data));
  } catch (e: any) {
    yield put(
      addToastNotification({
        id: uuidv4(),
        text: 'Error in Fetching Assign Claim To Dropdowns Data',
        toastType: ToastType.ERROR,
      })
    );
    yield put(
      fetchAssignClaimToDataFailure({
        error: e.message,
      })
    );
  }
}
function* referringProviderSaga({ payload }: GetReferringProviderDataRequest) {
  try {
    const response: AxiosResponse<ReferringProviderData[]> = yield call(
      getReferringProviderData,
      payload
    );
    yield put(fetchReferringProviderDataSuccess(response.data));
  } catch (e: any) {
    yield put(
      addToastNotification({
        id: uuidv4(),
        text: 'Error in Fetching Referring Provider Data',
        toastType: ToastType.ERROR,
      })
    );
    yield put(
      fetchReferringProviderDataFailure({
        error: e.message,
      })
    );
  }
}
function* getGroupSaga() {
  try {
    const response: AxiosResponse<GroupData[]> = yield call(getGroupsData);
    yield put(fetchGroupDataSuccess(response.data));
  } catch (e: any) {
    yield put(
      addToastNotification({
        id: uuidv4(),
        text: 'Error in Fetching Group Data',
        toastType: ToastType.ERROR,
      })
    );
    yield put(
      fetchGroupDataFailure({
        error: e.message,
      })
    );
  }
}
export async function fetchAllPatientsSearchData(
  data: GetAllPatientsSearchDataCriteria
) {
  const obj = JSON.parse(JSON.stringify(data));
  const str = Object.keys(obj)
    .map(function (key) {
      return `${key}=${obj[key]}`;
    })
    .join('&');
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<GetAllPatientsSearchDataResult[]> =
      await httpClient.get<GetAllPatientsSearchDataResult[]>(
        `/Patient/getPatientData?${str}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
function* getGlobleSearchRecentsSaga({
  payload,
}: GetGlobleSearchRecentsDataRequest) {
  try {
    const response: AxiosResponse<GlobleSearchRecentsData[]> = yield call(
      getGlobleSearchRecentsData,
      payload
    );
    yield put(fetchGlobleSearchRecentsDataSuccess(response.data));
  } catch (e: any) {
    yield put(
      addToastNotification({
        id: uuidv4(),
        text: 'Error in fetching recents data',
        toastType: ToastType.ERROR,
      })
    );
    yield put(
      fetchGlobleSearchRecentsDataFailure({
        error: e.message,
      })
    );
  }
}
function* getPracticeSaga({ payload }: GetPracticeDataRequest) {
  try {
    const response: AxiosResponse<PracticeData[]> = yield call(
      getPracticesData,
      payload
    );
    yield put(fetchPracticeDataSuccess(response.data));
  } catch (e: any) {
    yield put(
      addToastNotification({
        id: uuidv4(),
        text: 'Error in Fetching Practice Data',
        toastType: ToastType.ERROR,
      })
    );
    yield put(
      fetchPracticeDataFailure({
        error: e.message,
      })
    );
  }
}
function* getFacilitySaga({ payload }: GetFacilityDataRequest) {
  try {
    const response: AxiosResponse<FacilityData[]> = yield call(
      getFacilitiesData,
      payload
    );
    yield put(fetchFacilityDataSuccess(response.data));
  } catch (e: any) {
    yield put(
      addToastNotification({
        id: uuidv4(),
        text: 'Error in Fetching Facility Data',
        toastType: ToastType.ERROR,
      })
    );
    yield put(
      fetchFacilityDataFailure({
        error: e.message,
      })
    );
  }
}
function* getProviderSaga({ payload }: GetProviderDataRequest) {
  try {
    const response: AxiosResponse<ProviderData[]> = yield call(
      getProvidersData,
      payload
    );
    yield put(fetchProviderDataSuccess(response.data));
  } catch (e: any) {
    yield put(
      addToastNotification({
        id: uuidv4(),
        text: 'Error in Fetching Provider Data',
        toastType: ToastType.ERROR,
      })
    );
    yield put(
      fetchProviderDataFailure({
        error: e.message,
      })
    );
  }
}

// function* saveClaimSaga({ payload }: SaveClaimChargePaymentRequest) {
//   try {
//     const response: AxiosResponse<SaveClaimSuccessPayload> = yield call(
//       getSaveClaimData,
//       payload
//     );
//     yield put(saveClaimSuccess(response.data));
//   } catch (e: any) {
//     yield put(
//       addToastNotification({
//         id: uuidv4(),
//         text: 'Error in Saving Claim',
//         toastType: ToastType.ERROR,
//       })
//     );
//     yield put(
//       saveClaimFailure({
//         error: e.message,
//       })
//     );
//   }
// }
function* saveChargeSaga({ payload }: SaveChargeRequest) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<SaveChargeSuccessPayload> = yield call(
      getSaveChargeData,
      payload
    );
    yield put(saveChargeSuccess(response.data));
    store.dispatch(setAppSpinner(false));
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    yield put(
      addToastNotification({
        id: uuidv4(),
        text: 'Error in Saving Charge',
        toastType: ToastType.ERROR,
      })
    );
    yield put(
      saveClaimFailure({
        error: e.message,
      })
    );
  }
}

function* updateChargeSaga({ payload }: UpdateChargeRequest) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<UpdateChargeSuccessPayload> = yield call(
      getUpdateChargeData,
      payload
    );
    yield put(updateChargeSuccess(response.data));
    store.dispatch(setAppSpinner(false));
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    yield put(
      addToastNotification({
        id: uuidv4(),
        text: 'Error in Updating Charge',
        toastType: ToastType.ERROR,
      })
    );
    yield put(
      updateChargeFailure({
        error: e.message,
      })
    );
  }
}
function* claimScrubSaga({ payload }: ScrubClaimRequest) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<ScrubClaimSuccessPayload> = yield call(
      getScrubClaimData,
      payload
    );
    yield put(scrubClaimSuccess(response.data));
    store.dispatch(setAppSpinner(false));
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    yield put(
      addToastNotification({
        id: uuidv4(),
        text: 'Error in Scrubbing Claim.',
        toastType: ToastType.ERROR,
      })
    );
    yield put(
      scrubClaimFailure({
        error: e.message,
      })
    );
  }
}

export async function addEditFeeSchedule(data: AddUpdateFeeSchedule) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/AddEditClaim/addUpdateFeeSchedule`,
      data
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `${response.data.message}`,
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return true;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function fetchFeeScheduleSearchData(data: FeeScheduleCriteria) {
  const obj = JSON.parse(JSON.stringify(data));
  const str = Object.keys(obj)
    .map(function (key) {
      return `${key}=${obj[key]}`;
    })
    .join('&');
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<FeeScheduleResult[]> = await httpClient.get<
      FeeScheduleResult[]
    >(`/Claims/getFeeScheduleData?${str}`);
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function deleteChargeSaga(id: number | null | undefined) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.delete<any>(
      `/AddEditClaim/deleteChargeByID?id=${id}`
    );
    store.dispatch(setAppSpinner(false));
    if (!response.data.message.includes('Successfully')) {
      store.dispatch(
        addToastNotification({
          id: uuidv4(),
          text: `${response.data.message} ( ${id} )`,
          toastType: ToastType.SUCCESS,
        })
      );
      return false;
    }
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `Successfully Deleted Charge ( ${id} )`,
        toastType: ToastType.SUCCESS,
      })
    );
    return true;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error: unable to delete charge',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function deleteFeeScheduleData(id: number | undefined) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.delete<any>(
      `/AddEditClaim/deleteFeeSchedule?feeScheduleID=${id}`
    );
    store.dispatch(setAppSpinner(false));
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `${response.data.message} ( ${id} )`,
        toastType: ToastType.SUCCESS,
      })
    );
    return true;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function fetchCptNdcCrosswalkSearchData(
  data: CptNdcCrosswalkCriteria
) {
  const obj = JSON.parse(JSON.stringify(data));
  const str = Object.keys(obj)
    .map(function (key) {
      return `${key}=${obj[key]}`;
    })
    .join('&');
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<CptNdcCrosswalkResult[]> =
      await httpClient.get<CptNdcCrosswalkResult[]>(
        `/Claims/getCptNdcCrosswalkData?${str}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function addEditCptNdcCrosswalk(data: AddUpdateCptNdcCrosswalk) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/AddEditClaim/addUpdateCptNdcCrosswalk`,
      data
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `${response.data.message}`,
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return true;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function fetchCptNdcCrosswalkSearchEditData(
  id: number | undefined
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<CptNdcCrosswalkEditResult> =
      await httpClient.get<CptNdcCrosswalkEditResult>(
        `/AddEditClaim/getCptNdcCrosswalkByID?cptNdcCrosswalkID=${id}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function icdSearchRequest(text: string) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<ICDSearchOutput[]> = await httpClient.get<
      ICDSearchOutput[]
    >(`/Repository/getICDCodes?searchValue=${text}`);
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Error in fetching ICD search data',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function deleteCptNdcCrosswalkData(id: number | undefined) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.delete<any>(
      `/AddEditClaim/deleteCptNdcCrosswalk?cptNdcCrosswalkID=${id}`
    );
    store.dispatch(setAppSpinner(false));
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `${response.data.message} ( ${id} )`,
        toastType: ToastType.SUCCESS,
      })
    );
    return true;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function getDataRoles(data: DataRoleSearchCriteria) {
  const obj = JSON.parse(JSON.stringify(data));
  const str = Object.keys(obj)
    .map(function (key) {
      return `${key}=${obj[key]}`;
    })
    .join('&');
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<DataRoleResult[]> = await httpClient.get<
      DataRoleResult[]
    >(`/Repository/GetDataRoles?${str}`);
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function addDataRole(payload: FormData) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/Repository/saveDataRole`,
      payload
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Data Role Successfully Created',
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));

    return null;
  }
}
export async function updateDataRole(payload: FormData) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/Repository/updateDataRoleData`,
      payload
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Data Role Successfully Saved',
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function getDataRoleGroups() {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<TDataRoleGroups[]> = await httpClient.get<
      TDataRoleGroups[]
    >(`/Repository/getDataRoleGroups`);
    store.dispatch(setAppSpinner(false));
    return response.data.map((d) => {
      return { ...d, select: false };
    });
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function getDataRolePractices() {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<TDataRolePractices[]> = await httpClient.get<
      TDataRolePractices[]
    >(`/Repository/getDataRolePractices`);
    store.dispatch(setAppSpinner(false));
    return response.data.map((d) => {
      return { ...d, select: false, show: false };
    });
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function updateDataRoleActive(
  dataRoleID: number,
  active: boolean
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/Repository/updateDataRoleActive`,
      { dataRoleID, active }
    );
    store.dispatch(setAppSpinner(false));
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `Data Role Successfully ${active ? 'Activated' : 'Inactivated'}`,
        toastType: ToastType.SUCCESS,
      })
    );
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function editClaim(claimData: SaveClaimRequestPayload) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/AddEditClaim/editClaim`,
      claimData
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `${response.data.message}`,
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return true;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function deleteSelectedICD(
  claimID: number | undefined,
  icd: string | undefined
) {
  try {
    const response: AxiosResponse<DeleteICDResult> =
      await httpClient.get<DeleteICDResult>(
        `/AddEditClaim/removeDiagnosisFromClaimAndCharge?claimID=${claimID}&icd=${icd}`
      );
    if (response.data.id === 1) {
      store.dispatch(
        addToastNotification({
          id: uuidv4(),
          text: `${response.data.message}`,
          toastType: ToastType.SUCCESS,
        })
      );
    } else if (response.data.id === 2) {
      store.dispatch(
        addToastNotification({
          id: uuidv4(),
          text: `${response.data.message}`,
          toastType: ToastType.ERROR,
        })
      );
    }
    return response.data.id;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error: unable to delete document',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function createNDCRule(ndcData: SaveCptNdcRequestPayload) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/AddEditClaim/addUpdateCptNdcData`,
      ndcData
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `${response.data.message}`,
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return true;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error in Saving NDC Rule.',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function uploadFile(formData: FormData) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/Patient/saveClaimDocument/`,
      formData
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `${response.data.message}`,
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return true;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error: unable to upload document.',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function downloadDocumentBase64(documentID: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<TDownloadClaimDocumentType> =
      await httpClient.get<TDownloadClaimDocumentType>(
        `/Claims/downloadFilesBase64?documentID=${documentID}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error: unable to download document.',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function getClaimRoute(claimID: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.get<any>(
      `/Repository/getClaimScreen?ClaimID=${claimID}`
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error: unable to get claim route.',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function getNDCDataByCPT(searchCriteria: CPTNDCCriteria) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<CPTNDCOutput[]> = await httpClient.get<any>(
      `/Claims/getCptNdcData?practiceID=${searchCriteria.practiceID}` +
        `&cptCode=${searchCriteria.cptCode}`
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error: unable to get ndc data.',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function addCharges(chargeData: SaveChargeRequestPayload) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/AddEditClaim/saveCharge`,
      chargeData
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: response.data ? `Charge Successfully added` : '',
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return true;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function addPatientInsurance(data: PatientProfileInsuranceData) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<PatientProfileInsuranceResponse> =
      await httpClient.post<PatientProfileInsuranceResponse>(
        `/Patient/AddPatientInsurance`,
        data
      );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: response.data ? `Insurance Successfully Added` : '',
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function updateCharge(chargeData: SaveChargeRequestPayload) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/AddEditClaim/editCharge`,
      chargeData
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: response.data ? `Charge updated successfully` : '',
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return true;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function deleteDocument(id: number | null | undefined) {
  try {
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/Claims/deleteDocument?documentID=${id}`
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `${response.data.message} ( ${id} )`,
        toastType: ToastType.SUCCESS,
      })
    );
    return true;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error: unable to delete document',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function updateClaimDocumentEAttachment(data: any) {
  try {
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/Claims/changeDocumentEAttachment`,
      data
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `${response.data.message}`,
        toastType: ToastType.SUCCESS,
      })
    );
    return true;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error: unable to delete document',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function reassignClaim(claimData: ReassignClaimData) {
  try {
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/Claims/reassignClaim/`,
      claimData
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `The claim was reassigned successfully`,
        toastType: ToastType.SUCCESS,
      })
    );
    return response;
  } catch (e: any) {
    return false;
  }
}
export async function reassignBatch(batchData: ReassignBatchData) {
  try {
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/Batch/reassignPaymentBatch`,
      batchData
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `The batch was assigned successfully`,
        toastType: ToastType.SUCCESS,
      })
    );
    return response;
  } catch (e: any) {
    return false;
  }
}
export async function reassignMultipleClaim(
  claimData: ReassignMultipleClaimData
) {
  try {
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/Claims/addAssignees`,
      claimData
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `${response.data.message}`,
        toastType: ToastType.SUCCESS,
      })
    );
    return response;
  } catch (e: any) {
    return false;
  }
}
export async function getTaskGridData(claimID: number) {
  try {
    const response: AxiosResponse<TaskGridData[]> = await httpClient.get<
      TaskGridData[]
    >(`/Claims/getTasksData?claimID=${claimID}`);
    return response.data;
  } catch (e: any) {
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `Failed to fetch Task Grid Data.`,
        toastType: ToastType.ERROR,
      })
    );
    return [];
  }
}
export async function createEditTask(taskDara: CreateAndEditTaskRequestData) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<CreateAndEditTaskResponseData> =
      await httpClient.post<CreateAndEditTaskResponseData>(
        `/Claims/saveClaimTasks/`,
        taskDara
      );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: response.data.message,
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return response;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function createMultipleTasks(taskData: CreateTasksRequestData) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<CreateMultipleTasksResult> =
      await httpClient.post<CreateMultipleTasksResult>(
        `/Claims/saveBulkClaimTasks`,
        taskData
      );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: response.data.message,
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function markAsResolvedTask(taskID: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/Claims/resolveClaimTask?taskID=${taskID}`
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: response.data.message,
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return response;
  } catch (e: any) {
    return false;
  }
}
export async function deleteClaimTask(taskID: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/Claims/deleteClaimTask?taskID=${taskID}`
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: response.data.message,
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return response;
  } catch (e: any) {
    return false;
  }
}
export async function createClaim(
  claimData: SaveClaimChargePaymentRequestPayload
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<SaveClaimSuccessPayload> =
      await httpClient.post<SaveClaimSuccessPayload>(
        `/AddEditClaim/saveClaimChargeAndPayment`,
        claimData
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    return false;
  }
}
export async function createClaimNote(data: any) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/AddEditClaim/saveSystemNotes`,
      data
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `${response.data.message}`,
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return true;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error: unable to create note',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function createClaimsNote(data: any) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/Claims/saveBulkNotes`,
      data
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `${response.data.message}`,
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return true;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error: unable to create note',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function changeClaimSrubStatus(data: any) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/Claims/changeClaimScrubStatus`,
      data
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `Scrub Status Update successfully`,
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return response.data.message;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function changeClaimStatus(data: any) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/Claims/changeClaimStatus`,
      data
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `Claim Status Update successfully`,
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return response.data.message;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function changeClaimsStatuses(data: any) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/Claims/updateClaimsStatus`,
      data
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `${response.data.message}`,
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return response.data.message;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function updateChargeSortOrder(data: any) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/Claims/updateChargesSortOrder`,
      data
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: response.data.message,
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return response.data.message;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error: error in updating charge sort order.',
        toastType: ToastType.SUCCESS,
      })
    );
    return false;
  }
}
export async function changeChargeStatus(data: any) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/Claims/changeChargeStatus`,
      data
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `Charge Status Updated successfully`,
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return response.data.message;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(setAppSpinner(false));
    if (
      message &&
      message.includes(
        `Charge status is void so we can't change the charge status.`
      )
    ) {
      return {
        errors: [`Charge status is void so we can't change the charge status.`],
      };
    }
    return null;
  }
}

export async function getInsuranceFinder(
  patientID: number | undefined,
  groupID: number | undefined
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<InsurancerFinderData> =
      await httpClient.get<InsurancerFinderData>(
        `/Insurance/discoverInsurance?patientID=${patientID}&groupID=${groupID}`
      );
    // store.dispatch(
    //   addToastNotification({
    //     id: uuidv4(),
    //     text: `${response.data.message}`,
    //     toastType: ToastType.SUCCESS,
    //   })
    // );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}

export async function getAdvancePayament(patientID: number | null) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<AdvancePayemntData> =
      await httpClient.get<AdvancePayemntData>(
        `/Patient/getPatientAdvancePayments?patientID=${patientID}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}

export async function reversePayament(
  paymentID: number | undefined,
  postingDate: string
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.get<any>(
      `/Patient/reverseAdvancePayment?advancePaymentID=${paymentID}&postingDate=${postingDate}`
    );
    store.dispatch(setAppSpinner(false));
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `${response.data.message}`,
        toastType: ToastType.SUCCESS,
      })
    );
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}

export async function reversePaymentLedger(data: ReversePaymetLedgerFields) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/AddEditClaim/reversePaymentLedger`,
      data
    );
    store.dispatch(setAppSpinner(false));
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `${response.data.message}`,
        toastType: ToastType.SUCCESS,
      })
    );
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}

export async function setAdvancePayament(paymentData: SaveAdvancePayment) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<SaveAdvancePayment> =
      await httpClient.post<SaveAdvancePayment>(
        `/Patient/savePatientAdvancePayments`,
        paymentData
      );
    store.dispatch(setAppSpinner(false));
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `Advance Payment added successfully`,
        toastType: ToastType.SUCCESS,
      })
    );
    return response.data;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    store.dispatch(setAppSpinner(false));
    return null;
  }
}

export async function addSavedReport(data: any) {
  try {
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/SavedReports/AddSavedReport`,
      data
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `${response.data.message}`,
        toastType: ToastType.SUCCESS,
      })
    );
    return true;
  } catch (e: any) {
    return false;
  }
}
export async function getClaimNoteType(clientID: number | null, type: string) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.get<any>(
      `/Repository/getNoteType?clientID=${clientID}&type=${type}`
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error: error in fetching notes type data.',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function getChargeStatusHistory(chargeID: number) {
  try {
    const response: AxiosResponse<ChargeHistoryData> =
      await httpClient.get<ChargeHistoryData>(
        `/Claims/getChargeStatusHistory?chargeID=${chargeID}`
      );
    return response.data;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error: error in fetching charge status history.',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function getNoteDataById(noteID: number | null) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<ClaimNotesData> =
      await httpClient.get<ClaimNotesData>(
        `/Claims/getNoteByID?noteID=${noteID}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error: error in fetching note data.',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function getClaimDNALogData(linkID: number | null) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<ClaimDNALogResult[]> = await httpClient.get<
      ClaimDNALogResult[]
    >(`/Claims/getEditClaimDNAData?linkID=${linkID}`);
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error: error in fetching claim dna log data.',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function getClaimAssignToData(groupID: number | undefined) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<AssignClaimToData[]> = await httpClient.get<
      AssignClaimToData[]
    >(`/Repository/getAssignClaimTo?clientID=${groupID}`);
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error: error in fetching claim assignee data.',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function getTaskTypesData(groupID: number | undefined) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<TaskTypesData[]> = await httpClient.get<
      TaskTypesData[]
    >(`/Repository/getTaskTypes?groupID=${groupID}`);
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error: error in fetching claim task data.',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function getTaskDataById(taskID: number | null) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<TaskGridData> =
      await httpClient.get<TaskGridData>(
        `/Claims/getTaskByID?taskID=${taskID}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error: error in fetching note data.',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function getAllClaimsExpandRowDataById(
  claimID: GridRowId | undefined
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<AllClaimsExpandRowResult[]> =
      await httpClient.get<AllClaimsExpandRowResult[]>(
        `/Repository/getClaimHoverInfo?claimID=${claimID}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function getAllEOMViewDetailGridResult(
  data: EOMViewDetailGridCriteria
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<EOMViewDetailGridResult> =
      await httpClient.get<EOMViewDetailGridResult>(
        `Reports/getMonthEndReportViewGridData?groupID=${data.groupID}` +
          `&practiceID=${data.practiceID}` +
          `&facilityID=${data.facilityID}` +
          `&providerID=${data.providerID}` +
          `&monthStartDate=${data.monthStartDate}` +
          `&postingDate=${data.postingDate}` +
          `&endOfMonthType=${data.endOfMonthType}` +
          `&dataType=${data.dataType}` +
          `&ledgerType=${data.ledgerType}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function getSavedSearchList(moduleUrl: string) {
  try {
    const response: AxiosResponse<SavedSearchs[]> = await httpClient.get<
      SavedSearchs[]
    >(`/SavedReports/GetSavedReports?moduleUrl=${moduleUrl}`);
    return response.data;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error: error in fetching saved search list.',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function getAllClaimsAssigneeData(clientIDs: string) {
  try {
    const response: AxiosResponse<AllClaimsAsigneeData[]> =
      await httpClient.get<AllClaimsAsigneeData[]>(
        `/Claims/getAssigneeData?clientIDS=${clientIDs}`
      );
    return response.data;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error: Error in Assignee Data.',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function getChargeStatusData() {
  try {
    const response: AxiosResponse<SingleSelectDropDownDataType[]> =
      await httpClient.get<SingleSelectDropDownDataType[]>(
        `/Repository/getChargeStatus`
      );
    return response.data;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error: Error in Charge Status Data.',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}

function* saveCptNdcSaga({ payload }: SaveCptNdcRequest) {
  try {
    const response: AxiosResponse<SaveCptNdcSuccessPayload> = yield call(
      getSaveCptNdcData,
      payload
    );
    yield put(saveCptNdcSuccess(response.data));
  } catch (e: any) {
    yield put(
      addToastNotification({
        id: uuidv4(),
        text: 'Error in Saving NDC Rule',
        toastType: ToastType.ERROR,
      })
    );
    yield put(
      saveCptNdcFailure({
        error: e.message,
      })
    );
  }
}
function* cptSearchRequestSaga({ payload }: CPTSearchRequest) {
  try {
    const response: AxiosResponse<CPTSearchOutput[]> = yield call(
      getCPTSearchData,
      payload.cptSearch
    );
    yield put(fetchCPTSearchSuccess(response.data));
  } catch (e: any) {
    yield put(
      addToastNotification({
        id: uuidv4(),
        text: 'Error in Fetching CPT Search Data',
        toastType: ToastType.ERROR,
      })
    );
    yield put(
      fetchCPTSearchFailure({
        error: e.message,
      })
    );
  }
}
function* batchNumberRequestSaga({ payload }: BatchNumberRequest) {
  try {
    const response: AxiosResponse<BatchNumberOutput[]> = yield call(
      getBatchNumberData,
      payload.batchSearch
    );
    yield put(fetchBatchNumberSuccess(response.data));
  } catch (e: any) {
    yield put(
      addToastNotification({
        id: uuidv4(),
        text: 'Error in Fetching CPT Search Data',
        toastType: ToastType.ERROR,
      })
    );
    yield put(
      fetchBatchNumberFailure({
        error: e.message,
      })
    );
  }
}
function* batchDocumentRequestSaga({ payload }: BatchDocumentRequest) {
  try {
    const response: AxiosResponse<BatchDocumentOutput[]> = yield call(
      getBatchDocumentData,
      payload.batchDocument
    );
    yield put(fetchBatchDocumentSuccess(response.data));
  } catch (e: any) {
    yield put(
      addToastNotification({
        id: uuidv4(),
        text: 'Error in Fetching Document Data',
        toastType: ToastType.ERROR,
      })
    );
    yield put(
      fetchBatchDocumentFailure({
        error: e.message,
      })
    );
  }
}
export async function deleteSavedReport(id: any) {
  try {
    const response: AxiosResponse<any> = await httpClient.delete<any>(
      `/SavedReports/DeleteSavedReport?id=${id}`
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `${response.data.message}`,
        toastType: ToastType.SUCCESS,
      })
    );
    return true;
  } catch (e: any) {
    return false;
  }
}
export async function renameSavedReport(data: any) {
  try {
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/SavedReports/EditSavedReport`,
      data
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `${response.data.message}`,
        toastType: ToastType.SUCCESS,
      })
    );
    return true;
  } catch (e: any) {
    return false;
  }
}
function* batchDocumentPageRequestSaga({ payload }: BatchDocumentPageRequest) {
  try {
    const response: AxiosResponse<BatchDocumentPageOutput[]> = yield call(
      getBatchDocumentPageData,
      payload.batchDocumentPage
    );
    yield put(fetchBatchDocumentPageSuccess(response.data));
  } catch (e: any) {
    yield put(
      addToastNotification({
        id: uuidv4(),
        text: 'Error in Fetching Document Page Data',
        toastType: ToastType.ERROR,
      })
    );
    yield put(
      fetchBatchDocumentPageFailure({
        error: e.message,
      })
    );
  }
}
function* cptNdcRequestSaga({ payload }: CPTNDCRequest) {
  try {
    const response: AxiosResponse<CPTNDCOutput[]> = yield call(
      getCPTNdcData,
      payload.cptNdc
    );
    yield put(fetchCPTNdcSuccess(response.data));
  } catch (e: any) {
    yield put(
      addToastNotification({
        id: uuidv4(),
        text: 'Error in Fetching NDC Rule Data',
        toastType: ToastType.ERROR,
      })
    );
    yield put(
      fetchCPTNdcFailure({
        error: e.message,
      })
    );
  }
}
function* searchProviderRequestSaga({ payload }: SearchProviderRequest) {
  try {
    const response: AxiosResponse<SearchProviderSuccessPayload[]> = yield call(
      getSearchProviderData,
      payload
    );
    yield put(fetchSearchProviderSuccess(response.data));
  } catch (e: any) {
    yield put(
      addToastNotification({
        id: uuidv4(),
        text: 'Error in Searching Provider',
        toastType: ToastType.ERROR,
      })
    );
    yield put(
      fetchSearchProviderFailure({
        error: e.message,
      })
    );
  }
}
function* icdSearchRequestSaga({ payload }: ICDSearchRequest) {
  try {
    const response: AxiosResponse<ICDSearchOutput[]> = yield call(
      getICDSearchData,
      payload.icdSearch
    );
    yield put(fetchICDSearchSuccess(response.data));
  } catch (e: any) {
    yield put(
      addToastNotification({
        id: uuidv4(),
        text: 'Error in fetching ICD search data',
        toastType: ToastType.ERROR,
      })
    );
    yield put(
      fetchICDSearchFailure({
        error: e.message,
      })
    );
  }
}
function* claimDocumentRequestSaga({ payload }: UploadedDocumentRequest) {
  try {
    const response: AxiosResponse<UploadedDocumentOutput[]> = yield call(
      getClaimDocumentData,
      payload.uploadedDocument
    );
    yield put(fetchUploadedClaimDocumentSuccess(response.data));
  } catch (e: any) {
    yield put(
      addToastNotification({
        id: uuidv4(),
        text: 'Error in Fetching Claim Document Data.',
        toastType: ToastType.ERROR,
      })
    );
    yield put(
      fetchUploadedClaimDocumentFailure({
        error: e.message,
      })
    );
  }
}
export async function fetchAllClaimsSearchData(
  data: GetAllClaimsSearchDataCriteria
) {
  const obj = JSON.parse(JSON.stringify(data));
  const str = Object.keys(obj)
    .map(function (key) {
      return `${key}=${obj[key]}`;
    })
    .join('&');
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<GetAllClaimsSearchDataResult[]> =
      await httpClient.get<GetAllClaimsSearchDataResult[]>(
        `/Claims/getAllClaimsSearchData?${str}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function fetchARClaimsSearchData(
  data: GetARClaimsSearchDataCriteria
) {
  const obj = JSON.parse(JSON.stringify(data));
  const str = Object.keys(obj)
    .map(function (key) {
      return `${key}=${obj[key]}`;
    })
    .join('&');
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<GetARClaimsSearchDataResult[]> =
      await httpClient.get<GetARClaimsSearchDataResult[]>(
        `/Claims/getARClaimsSearchData?${str}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function fetchAllClaimsSearchChargesData(
  data: GetAllClaimsSearchDataCriteria
) {
  const obj = JSON.parse(JSON.stringify(data));
  const str = Object.keys(obj)
    .map(function (key) {
      return `${key}=${obj[key]}`;
    })
    .join('&');
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<GetAllClaimsSearchChargesData[]> =
      await httpClient.get<GetAllClaimsSearchChargesData[]>(
        `/Claims/getAllClaimsSearchChargesData?${str}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function fetchARClaimsSearchChargesData(
  data: GetARClaimsSearchDataCriteria
) {
  const obj = JSON.parse(JSON.stringify(data));
  const str = Object.keys(obj)
    .map(function (key) {
      return `${key}=${obj[key]}`;
    })
    .join('&');
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<GetARClaimsSearchChargesData[]> =
      await httpClient.get<GetARClaimsSearchChargesData[]>(
        `/Claims/getARClaimsSearchChargesData?${str}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function fetchAllClaimsSearchDataClaimIDS(
  data: GetAllClaimsSearchDataCriteria
) {
  const obj = JSON.parse(JSON.stringify(data));
  const str = Object.keys(obj)
    .map(function (key) {
      return `${key}=${obj[key]}`;
    })
    .join('&');
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<GetAllClaimsSearchDataClaimIDSResult[]> =
      await httpClient.get<GetAllClaimsSearchDataClaimIDSResult[]>(
        `/Claims/getAllClaimsSearchDataClaimIDS?${str}`
      );
    store.dispatch(setAppSpinner(false));
    const arr = response.data.map((m) => {
      return m.claimID;
    });
    return arr;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function fetchARClaimsSearchDataClaimIDS(
  data: GetARClaimsSearchDataCriteria
) {
  const obj = JSON.parse(JSON.stringify(data));
  const str = Object.keys(obj)
    .map(function (key) {
      return `${key}=${obj[key]}`;
    })
    .join('&');
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<GetAllClaimsSearchDataClaimIDSResult[]> =
      await httpClient.get<GetAllClaimsSearchDataClaimIDSResult[]>(
        `/Claims/getARClaimsSearchDataClaimIDS?${str}`
      );
    store.dispatch(setAppSpinner(false));
    const arr = response.data.map((m) => {
      return m.claimID;
    });
    return arr;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function fetchAllPatientsSearchDataPatientIDS(
  data: GetPatientStatemntCriteria
) {
  const obj = JSON.parse(JSON.stringify(data));
  const str = Object.keys(obj)
    .map(function (key) {
      return `${key}=${obj[key]}`;
    })
    .join('&');
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<GetAllPatientsSearchDataPatientIDSResult[]> =
      await httpClient.get<GetAllPatientsSearchDataPatientIDSResult[]>(
        `/Patient/getPatientStatementsIDS?${str}`
      );
    store.dispatch(setAppSpinner(false));
    const arr = response.data.map((m) => {
      return m.patientID;
    });
    return arr;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function reSaveRegisterPatientDate(data: any) {
  try {
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/Patient/updatePatient`,
      data
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `${response.data.message}`,
        toastType: ToastType.SUCCESS,
      })
    );
    return true;
  } catch (e: any) {
    return false;
  }
}

export async function fetchPatientDataByID(patientID: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<GetPatientRequestData> =
      await httpClient.get<GetPatientRequestData>(
        `/Patient/getPatientInfoByID?id=${patientID}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function fetchEDIStatus() {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<EDIImportDropdown[]> = await httpClient.get<
      EDIImportDropdown[]
    >(`/Claims/getEdiImportLogStatus`);
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function fetchEDIReport() {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<EDIImportDropdown[]> = await httpClient.get<
      EDIImportDropdown[]
    >(`/Claims/getEdiImportLogReportType`);
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function fetchEDIImportLogSearchData(data: EDIImportLogCriteria) {
  const obj = JSON.parse(JSON.stringify(data));
  const str = Object.keys(obj)
    .map(function (key) {
      return `${key}=${obj[key]}`;
    })
    .join('&');
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<GetEDIImportLogAPIResult[]> =
      await httpClient.get<GetEDIImportLogAPIResult[]>(
        `/Claims/getEdiImportLogProfileData?${str}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function fetchViewReportLogData(id: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<ViewReportLog> =
      await httpClient.get<ViewReportLog>(`/Claims/downloadFile?id=${id}`);
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function getSubmissionBatchReportStatus(id: number, type: string) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<GetPaymentBatchStatusResult[]> =
      await httpClient.get<GetPaymentBatchStatusResult[]>(
        `/Batch/getSubmissionBatchReportStatus?${
          type === 'SubmissionBatchID' ? 'batchID' : 'ediImportLogID'
        }=${id}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data.map((row, index) => {
      return { ...row, id: index };
    });
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function getSubmissionBatchStatusDetailByID(id: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.get<any>(
      `/Batch/getSubmissionBatchStatusDetailByID?statusID=${id}`
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function getClaimStatusByID(id: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.get<any>(
      `/AddEditClaim/getClaimStatusByID?id=${id}`
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function uploadEDI(groupID: any, payload: FormData) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/AddEditClaim/uploadERA?groupID=${groupID}`,
      payload
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}

export async function getPatientStatementData(
  data: GetPatientStatemntCriteria
) {
  const obj = JSON.parse(JSON.stringify(data));
  const str = Object.keys(obj)
    .map(function (key) {
      return `${key}=${obj[key]}`;
    })
    .join('&');
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<PatientStatementType[]> =
      await httpClient.get<PatientStatementType[]>(
        `/Patient/getPatientStatementsData?${str}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}

export async function getExcludeInsuranceDropdown() {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<IdValuePair[]> = await httpClient.get<
      IdValuePair[]
    >(`/Insurance/getExcludeInsuranceTypes`);
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}

export async function onPatientStatementsFileDownload(
  data: StatemntExportType
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<StatementResponse> =
      await httpClient.post<StatementResponse>(
        `/Patient/patientStatementsFileDownload`,
        data,
        {
          timeout: 0, // Set the timeout to 0 for this specific request (unlimited timeout)
        }
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}

export async function getClaimDocuments(
  uploadedDocCriteria: UploadedDocumentCriteria
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<UploadedDocumentOutput[]> =
      await httpClient.get<UploadedDocumentOutput[]>(
        `Patient/getClaimDocuments?claimID=${uploadedDocCriteria.claimID}` +
          `&groupID=${uploadedDocCriteria.groupID}` +
          `&categoryID=${uploadedDocCriteria.categoryID}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}

export async function validatePatientAddress(
  Address1: string | undefined | null,
  zip: string | null | undefined,
  categories: string | null,
  lineItemID: number | null
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<ValidateAddressDataType> =
      await httpClient.get<ValidateAddressDataType>(
        `/Reports/validateAddress?Address1=${Address1}&Zip=${zip}&category=${categories}&lineItemID=${lineItemID}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}

export async function validateDemographicAddress(
  patientID: number,
  groupID: number | undefined
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<ValidateDemographicResponseDate> =
      await httpClient.get<ValidateDemographicResponseDate>(
        `/Patient/demographicVerifier?patientID=${patientID}&groupID=${groupID}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message,
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}

export async function saveGaurantorData(gaurantorData: SaveGauranterData) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<SaveGaurantorResponseData> =
      await httpClient.post<SaveGaurantorResponseData>(
        `/Patient/savePatientGuarantor`,
        gaurantorData
      );
    store.dispatch(setAppSpinner(false));
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `Guarantor saved successfully`,
        toastType: ToastType.SUCCESS,
      })
    );
    return response.data;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    store.dispatch(setAppSpinner(false));
    return null;
  }
}

export async function getPatientFinicalDate(patientID: number) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<PatientFinicalTabData> =
      await httpClient.get<PatientFinicalTabData>(
        `/Patient/getPatientFinancialsByID?patientID=${patientID}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    store.dispatch(setAppSpinner(false));
    return null;
  }
}

export async function patientInsuranceActive(data: PatientInsuranceActiveData) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<PatientInsuranceActieResult> =
      await httpClient.post<PatientInsuranceActieResult>(
        `/Patient/updatePatientInsuranceActive`,
        data
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    store.dispatch(setAppSpinner(false));
    return null;
  }
}

export async function TimeframeDetailPatientFinanical(
  responsibility: string | null,
  currentIndex: string | null,
  patientID: number,
  getAllData?: boolean
) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<TimeFrameData[]> = await httpClient.get<
      TimeFrameData[]
    >(
      `/Patient/getPatientFinancialDetailsByID?responsibility=${responsibility}&patientID=${patientID}&currentIndex=${currentIndex}&getAllData=${
        getAllData || false
      }`
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    store.dispatch(setAppSpinner(false));
    return null;
  }
}

export async function getAllClaimsTableSearch(data: any) {
  const obj = JSON.parse(JSON.stringify(data));
  const str = Object.keys(obj)
    .map(function (key) {
      return `${key}=${obj[key]}`;
    })
    .join('&');
  try {
    const response: AxiosResponse<AllClaimsTableSearchResultType[]> =
      await httpClient.get<AllClaimsTableSearchResultType[]>(
        `/Claims/getAllClaimsTableSearch?${str}`
      );
    return response.data;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function getARClaimsTableSearch(data: any) {
  const obj = JSON.parse(JSON.stringify(data));
  const str = Object.keys(obj)
    .map(function (key) {
      return `${key}=${obj[key]}`;
    })
    .join('&');
  try {
    const response: AxiosResponse<AllClaimsTableSearchResultType[]> =
      await httpClient.get<AllClaimsTableSearchResultType[]>(
        `/Claims/getARClaimsTableSearch?${str}`
      );
    return response.data;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function forceFullyScrub(data: number[]) {
  const payload = { claimIDS: data };
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/Claims/forcefullyPassClaim`,
      payload
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function claimsScrubing(data: number[]) {
  const payload = { claimIDS: data };
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<AllClaimsScrubResponseResult> =
      await httpClient.post<AllClaimsScrubResponseResult>(
        `/Claims/allClaimsScrubing`,
        payload,
        {
          timeout: 1800000, // Set the timeout to 0 for this specific request (unlimited timeout)
        }
      );
    store.dispatch(setAppSpinner(false));
    return response.data || [];
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function saveWriteOffClaims(data: SaveWriteOffCriteria) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/AddEditClaim/saveWriteOffByID`,
      data
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `${response.data.message}`,
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return response.data || [];
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function submitClaim(claimSubmitRequest: ClaimsSubmitRequest[]) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<ClaimsSubmitDataType> =
      await httpClient.post<ClaimsSubmitDataType>(
        `/Claims/submitClaim/`,
        claimSubmitRequest
      );
    store.dispatch(setAppSpinner(false));
    return response.data || [];
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function getScrubingAPIResponce(id: number) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<any> = await httpClient.get<any>(
      `/Claims/getScrubingResponce?claimID=${id}`
    );
    store.dispatch(setAppSpinner(false));
    return response.data || '';
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function fetchAllClaimsSearchStatusCategories(criteria: any) {
  const str = Object.keys(criteria)
    .map(function (key) {
      return `${key}=${criteria[key]}`;
    })
    .join('&');
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<GetAllClaimsSearchStatusCategories> =
      await httpClient.get<GetAllClaimsSearchStatusCategories>(
        `/Claims/getAllClaimsSearchStatusCategories?${str}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function fetchARClaimsSearchStatusCategories(criteria: any) {
  const str = Object.keys(criteria)
    .map(function (key) {
      return `${key}=${criteria[key]}`;
    })
    .join('&');
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<GetARClaimsSectionCategories> =
      await httpClient.get<GetARClaimsSectionCategories>(
        `/Claims/getARClaimsSectionData?${str}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
function* editClaimRequestSaga({ payload }: EditClaimRequest) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<EditClaimSuccessPayload> = yield call(
      getEditClaimData,
      payload
    );
    store.dispatch(setAppSpinner(false));
    yield put(editClaimSuccess(response.data));
    yield put(
      addToastNotification({
        id: uuidv4(),
        text: response.data.message,
        toastType: ToastType.SUCCESS,
      })
    );
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    yield put(
      addToastNotification({
        id: uuidv4(),
        text: 'Error in Updating Claim',
        toastType: ToastType.ERROR,
      })
    );
    yield put(editClaimFailure(e.response));
  }
}
export async function fetchClaimDataByID(claimID: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<ClaimDataByClaimIDResult> =
      await httpClient.get<ClaimDataByClaimIDResult>(
        `/Claims/getClaimInfoData?claimID=${claimID}`
      );
    const arr: ClaimDataByClaimIDResult = {
      claimID: response.data.claimID,
      claimStatusID: response.data.claimStatusID,
      scrubStatusID: response.data.scrubStatusID,
      submitStatusID: response.data.submitStatusID,
      patientID: response.data.patientID,
      patientName: response.data.patientName,
      patientInsuranceID: response.data.patientInsuranceID,
      patientInsurance: response.data.patientInsurance,
      subscriberID: response.data.subscriberID,
      insuranceID: response.data.insuranceID,
      subscriberRelation: response.data.subscriberRelation,
      dosFrom: response.data.dosFrom,
      dosTo: response.data.dosTo,
      groupID: response.data.groupID,
      practiceID: response.data.practiceID,
      facilityID: response.data.facilityID,
      posID: response.data.posID,
      providerID: response.data.providerID,
      referringProviderID: response.data.referringProviderID,
      referralNumber: response.data.referralNumber,
      supervisingProviderID: response.data.supervisingProviderID,
      panNumber: response.data.panNumber,
      assignClaimTo: response.data.assignClaimTo,
      assignUserNote: response.data.assignUserNote,
      advancePayments: response.data.advancePayments,
      icds: response.data.icds,
      charges: response.data.charges,
      additionalFieldsData: response.data.additionalFieldsData,
      assignmentBelongsToID: response.data.assignmentBelongsToID,
      claimTypeID: response.data.claimTypeID,
      referringProviderFirstName: response.data.referringProviderFirstName,
      referringProviderLastName: response.data.referringProviderLastName,
      medicalCaseID: response.data.medicalCaseID,
    };
    store.dispatch(setAppSpinner(false));
    return arr;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}

export async function getClaimStatData(claimID: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<ClaimStatsData> =
      await httpClient.get<ClaimStatsData>(
        `/Claims/getClaimStatsData?claimID=${claimID}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error: error in fetching claim stat data.',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function getClaimFinancial(claimID: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<ClaimFinancials> =
      await httpClient.get<ClaimFinancials>(
        `/AddEditClaim/getClaimFinancial?claimID=${claimID}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error: error in fetching claim balance data.',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function fetchDocumentSearchData(data: DocumentSearchCriteria) {
  const obj = JSON.parse(JSON.stringify(data));
  const str = Object.keys(obj)
    .map(function (key) {
      return `${key}=${obj[key]}`;
    })
    .join('&');
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<GetDocumentSearchAPIResult[]> =
      await httpClient.get<GetDocumentSearchAPIResult[]>(
        `Batch/getDocumentSearchData?${str}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function fetchWriteOffData(data: SearchWriteOffCriteria) {
  const obj = JSON.parse(JSON.stringify(data));
  const str = Object.keys(obj)
    .map(function (key) {
      return `${key}=${obj[key]}`;
    })
    .join('&');
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<SearchWriteOffResult[]> =
      await httpClient.get<SearchWriteOffResult[]>(
        `Claims/getMassWriteOffData?${str}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function fetchDocumentBatchGridData(data: BatchSearchCriteria) {
  const obj = JSON.parse(JSON.stringify(data));
  const str = Object.keys(obj)
    .map(function (key) {
      return `${key}=${obj[key]}`;
    })
    .join('&');
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<GetBatchSearchAPIResult[]> =
      await httpClient.get<GetBatchSearchAPIResult[]>(
        `/Batch/getDocumentProfile?${str}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}

export async function fetchDocumentBatchData() {
  try {
    const response: AxiosResponse<IdValuePair[]> = await httpClient.get<
      IdValuePair[]
    >(`/Batch/getDocumentBatchType`);
    return response.data;
  } catch (e: any) {
    return null;
  }
}

export async function fetchBatchTypeData() {
  try {
    const response: AxiosResponse<IdValuePair[]> = await httpClient.get<
      IdValuePair[]
    >(`/Repository/GetBatchTypes`);
    return response.data;
  } catch (e: any) {
    return null;
  }
}
export async function fetchDocumentTags() {
  try {
    const response: AxiosResponse<IdValuePair[]> = await httpClient.get<
      IdValuePair[]
    >(`/Claims/getDocumentTags`);
    return response.data;
  } catch (e: any) {
    return null;
  }
}
export async function fetchChargeBatchSearchData(data: GetChargeBatchCriteria) {
  const obj = JSON.parse(JSON.stringify(data));
  const str = Object.keys(obj)
    .map(function (key) {
      return `${key}=${obj[key]}`;
    })
    .join('&');
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<GetChargeBatchResult[]> =
      await httpClient.get<GetChargeBatchResult[]>(
        `/Batch/getBatchChargeProfile?${str}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function fetchChargesData(data: GetChargesDataCriterea) {
  const obj = JSON.parse(JSON.stringify(data));
  const str = Object.keys(obj)
    .map(function (key) {
      return `${key}=${obj[key]}`;
    })
    .join('&');
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<GetChargesDataResult[]> =
      await httpClient.get<GetChargesDataResult[]>(
        `/Claims/getChargesData?${str}`
      );
    store.dispatch(setAppSpinner(false));
    const res = response.data.map((d) => {
      return { ...d, id: d.chargeID };
    });
    return res;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function linkPaymentPosting(data: LinkPaymentPostingCriterea) {
  const obj = JSON.parse(JSON.stringify(data));
  const str = Object.keys(obj)
    .map(function (key) {
      return `${key}=${obj[key]}`;
    })
    .join('&');
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<any> = await httpClient.get<any>(
      `/AddEditClaim/linkPaymentPosting?${str}`
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function unLinkPaymentPosting(id: number) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<any> = await httpClient.get<any>(
      `/AddEditClaim/deattachERAPosting?postingID=${id}`
    );
    store.dispatch(setAppSpinner(false));
    if (response.data?.pkid === 1) {
      store.dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Charge Successfully Unlinked',
          toastType: ToastType.SUCCESS,
        })
      );
    }
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function applyPaymentPosting(
  earCheckID: number | null,
  postingId: number | null,
  byPassWarningID: number | null
) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<ApplyPaymentPostingRsult> =
      await httpClient.get<ApplyPaymentPostingRsult>(
        `/AddEditClaim/postInsurancePayment?eraCheckID=${earCheckID}&postingID=${postingId}&bypassWarningsID=${byPassWarningID}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function fetchPaymentBatchSearchData(
  data: GetPaymentBatchCriteria
) {
  const obj = JSON.parse(JSON.stringify(data));
  const str = Object.keys(obj)
    .map(function (key) {
      return `${key}=${obj[key]}`;
    })
    .join('&');
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<GetPaymentBatchResult[]> =
      await httpClient.get<GetPaymentBatchResult[]>(
        `/Batch/getBatchesData?${str}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function fetchgPaymentsBatchesSearchData(
  data: GetPaymentBatchCriteria
) {
  const obj = JSON.parse(JSON.stringify(data));
  const str = Object.keys(obj)
    .map(function (key) {
      return `${key}=${obj[key]}`;
    })
    .join('&');
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<GetPaymentsBatchesResult> =
      await httpClient.get<GetPaymentsBatchesResult>(
        `/Batch/getPaymentBatches?${str}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function deletePaymentBatchByID(batchID: number) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<any> = await httpClient.delete<any>(
      `Batch/deletePaymentBatchByID?paymentBatchID=${batchID}`
    );
    store.dispatch(setAppSpinner(false));
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Payment Batch Successfully Deleted',
        toastType: ToastType.SUCCESS,
      })
    );
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function deleteERABatchByID(id: number) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<any> = await httpClient.get<any>(
      `Claims/deleteEraCheckByID?id=${id}`
    );
    store.dispatch(setAppSpinner(false));
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'ERA Successfully Deleted',
        toastType: ToastType.SUCCESS,
      })
    );
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function fetchgPaymentsERASearchData(data: GetPaymentERACriteria) {
  const obj = JSON.parse(JSON.stringify(data));
  const str = Object.keys(obj)
    .map(function (key) {
      return `${key}=${obj[key]}`;
    })
    .join('&');
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<GetPaymentsERAResult> =
      await httpClient.get<GetPaymentsERAResult>(
        `/Claims/getERAProfileData?${str}`
      );
    store.dispatch(setAppSpinner(false));
    const result = response.data.eraPaymentData.map((d) => {
      return { ...d, id: d.eraID };
    });
    return {
      eraPaymentStats: response.data.eraPaymentStats,
      eraPaymentData: result,
    };
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function fetchPaymentReportSearchData(
  data: GetPaymentReportCriteria
) {
  const obj = JSON.parse(JSON.stringify(data));
  const str = Object.keys(obj)
    .map(function (key) {
      return `${key}=${obj[key]}`;
    })
    .join('&');
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<GetPaymentReportsAPIResult> =
      await httpClient.get<GetPaymentReportsAPIResult>(
        `/Reports/getPaymentReportdata?${str}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function fetchDenialReportSearchData(
  data: GetDenialReportCriteria
) {
  const obj = JSON.parse(JSON.stringify(data));
  const str = Object.keys(obj)
    .map(function (key) {
      return `${key}=${obj[key]}`;
    })
    .join('&');
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<GetDenialReportResult[]> =
      await httpClient.get<GetDenialReportResult[]>(
        `/Reports/getDenialManagementReport?${str}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}

export async function fetchChargeDetailReportSearchData(
  data: GetChargeDetailReportCriteria
) {
  const obj = JSON.parse(JSON.stringify(data));
  const str = Object.keys(obj)
    .map(function (key) {
      return `${key}=${obj[key]}`;
    })
    .join('&');
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<ChargeDetailReportData> =
      await httpClient.get<ChargeDetailReportData>(
        `/Reports/getChargeDetailReport?${str}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function fetchProcedureTransactionHistoryReportData(
  searchCriteria: ProcedureTransactionHistoryReportCriteria
) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<ProcedureTransactionHistoryReportResult[]> =
      await httpClient.get<ProcedureTransactionHistoryReportResult[]>(
        `Reports/getProcedureTransactionHistoryReportData?groupID=${searchCriteria.groupID}` +
          `&practiceID=${searchCriteria.practiceID}` +
          `&facilityID=${searchCriteria.facilityID}` +
          `&posID=${searchCriteria.posID}` +
          `&fromDOS=${searchCriteria.fromDOS}` +
          `&toDOS=${searchCriteria.toDOS}` +
          `&claimID=${searchCriteria.claimID}` +
          `&cptCode=${searchCriteria.cptCode}` +
          `&chargeID=${searchCriteria.chargeID}` +
          `&patientFirstName=${searchCriteria.patientFirstName}` +
          `&patientLastName=${searchCriteria.patientLastName}` +
          `&patientID=${searchCriteria.patientID}` +
          `&insuranceID=${searchCriteria.insuranceID}` +
          `&providerID=${searchCriteria.providerID}` +
          `&fromPostingDate=${searchCriteria.fromPostingDate}` +
          `&toPostingDate=${searchCriteria.toPostingDate}` +
          `&pageNumber=${searchCriteria.pageNumber}` +
          `&pageSize=${searchCriteria.pageSize}` +
          `&sortColumn=${searchCriteria.sortColumn}` +
          `&sortOrder=${searchCriteria.sortOrder}` +
          `&getAllData=${searchCriteria.getAllData}` +
          `&getOnlyIDS=${searchCriteria.getOnlyIDS}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function createChargeBatch(payload: FormData) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/Batch/addChargeBatchAndDocuments`,
      payload
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Batch Successfully Created',
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function fetchGlobleSearchData(
  searchCriteria: GlobleSearchCriteria
) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<GlobleSearchResult[]> = await httpClient.get<
      GlobleSearchResult[]
    >(
      `Repository/getSystemGlobalSearch?groupID=${searchCriteria.groupID}&searchValue=${searchCriteria.searchValue}&category=${searchCriteria.category}`
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}

export async function createPaymentBatch(payload: FormData) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<{
      errors: string[];
      message: string;
      paymentBatchID: number;
    }> = await httpClient.post<{
      errors: string[];
      message: string;
      paymentBatchID: number;
    }>(`/Batch/addPaymentBatchAndDocuments`, payload);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Batch Successfully Created',
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}

export async function createDocumentBatch(payload: FormData) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/Batch/addDocumentBatchAndDocuments`,
      payload
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Batch Successfully Created',
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}

export async function updateChargeBatch(payload: TChargeBatchType) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/Batch/updateChargeBatch`,
      payload
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Batch Successfully Update',
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}

export async function updatePaymentBatch(payload: TPaymentBatchType) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/Batch/updatePaymentBatch`,
      payload
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Batch Successfully Update',
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}

export async function updateDocumentBatch(payload: TDocumentBatchType) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/Batch/updateDocumentBatch`,
      payload
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Batch Successfully Update',
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}

export async function fetchChargeBatchByID(id: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<TChargeBatchType[]> = await httpClient.get<
      TChargeBatchType[]
    >(`/Batch/getChargeBatchDataByID?id=${id}`);
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}

export async function fetchPaymentBatchByID(id: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<TPaymentBatchType> =
      await httpClient.get<TPaymentBatchType>(
        `/Batch/getPaymentBatchByID?batchID=${id}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function fetchERAProfileDataByID(id: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<TPaymentERADetailType> =
      await httpClient.get<TPaymentERADetailType>(
        `/Claims/getERAProfileDataByID?eraID=${id}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function fetchDocumentBatchByID(id: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<TDocumentBatchType> =
      await httpClient.get<TDocumentBatchType>(
        `/Batch/getDocumentBatchDataByID?documentBatchID=${id}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}

export async function fetchERAProfileDetailSummary(id: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<GetERADetailSummary> =
      await httpClient.get<GetERADetailSummary>(
        `/Claims/getERAProfileDetailSummary?eraID=${id}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function fetchPaymentPostingErrorData(id: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<GetPaymentPostingErrorsResult[]> =
      await httpClient.get<GetPaymentPostingErrorsResult[]>(
        `/AddEditClaim/getPostingValidationErrors?eraCheckID=${id}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}

export async function fetchERAProfileDetailCharges(id: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<GetERADetailCharges[]> = await httpClient.get<
      GetERADetailCharges[]
    >(`/Claims/getERAProfileDetailCharges?eraID=${id}`);
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}

export async function fetchClaimStatusHistoryDetails(id: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<GetClaimStatusHistoryDetailResult[]> =
      await httpClient.get<GetClaimStatusHistoryDetailResult[]>(
        `/AddEditClaim/getClaimStatusDetailsByID?claimID=${id}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function getClaimStatusHistoryViewDetails(id: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<GetClaimStatusHistoryViewDetailResult[]> =
      await httpClient.get<GetClaimStatusHistoryViewDetailResult[]>(
        `/AddEditClaim/getClaimStatusCode?claimStatusID=${id}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function fetchRealTimeClaimStatusDetails(id: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<GetRealTimeClaimStatusResult[]> =
      await httpClient.get<GetRealTimeClaimStatusResult[]>(
        `/AbilityApiIntegration/getAbilityStatusList?claimID=${id}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function getRealTimeClaimStatusViewDetails(id: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<GetRealTimeClaimStatusViewDetailResult[]> =
      await httpClient.get<GetRealTimeClaimStatusViewDetailResult[]>(
        `/AbilityApiIntegration/getAbilityStatusData?statusID=${id}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function requestUpdateRealTimeClaim(id: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<GetRealTimeClaimStatusResult[]> =
      await httpClient.get<GetRealTimeClaimStatusResult[]>(
        `/AbilityApiIntegration/getAbilityClaimEvents?claimID=${id}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}

export async function fetchChargeBatchDetailByID(id: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<TChargeBatchDetailType> =
      await httpClient.get<TChargeBatchDetailType>(
        `/Batch/getChargeBatchDetailByID?chargeBatchID=${id}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function fetchChargeBatchDetailCharges(id: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<ChargeBatchChargesResult[]> =
      await httpClient.get<ChargeBatchChargesResult[]>(
        `/Batch/getChargeBatchDetailCharges?chargeBatchID=${id}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}

export async function fetchPaymentBatchDetailByID(id: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<TPaymentBatchDetailType> =
      await httpClient.get<TPaymentBatchDetailType>(
        `/Batch/getPaymentBatchDetailData?batchID=${id}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}

export async function fetchPaymentBatchDetailPaidCharges(id: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<PaymentBatchPaidChargesResult> =
      await httpClient.get<PaymentBatchPaidChargesResult>(
        `/Batch/getPaymentBatchDetailPaidCharges?paymentBatchID=${id}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}

export async function fetchPaymentLedgerByBatchID(id: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<TPaymentLedgerByBatchIDResult[]> =
      await httpClient.get<TPaymentLedgerByBatchIDResult[]>(
        `/AddEditClaim/GetPaymentLedgerByBatchID?batchID=${id}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data.map((d) => {
      return { ...d, id: d.ledgerID };
    });
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}

export async function fetchPaymentBatchLedgersPostingByID(id: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<TPaymentPostingResult[]> =
      await httpClient.get<TPaymentPostingResult[]>(
        `/Batch/getPaymentBatchLedgersPostingByID?batchID=${id}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data.map((d, i) => {
      return { ...d, id: i };
    });
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}

export async function uploadedDocumentOCR(documentID: number) {
  try {
    httpClient.get<any>(`/Batch/scanDocument?documentID=${documentID}`, {
      timeout: 0, // Set the timeout to 0 for this specific request (unlimited timeout)
    });
    return null;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}

export async function fetchDocumentDataByID(id: number, categoryID: string) {
  try {
    const response: AxiosResponse<TBatchUploadedDocument[]> =
      await httpClient.get<TBatchUploadedDocument[]>(
        `/Batch/getDocumentData?batchID=${id}&categoryID=${categoryID}`
      );
    return response.data;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}

export async function uploadBatchDocument(payload: FormData) {
  store.dispatch(setAppSpinner(true));
  try {
    await httpClient.post<any>(`/Batch/uploadBatchDocument`, payload);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Document uploaded successfully.',
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return true;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}

export async function getGridLayoutData(gridTypeID: number) {
  try {
    const response: AxiosResponse<any> = await httpClient.get<any>(
      `/Repository/getGridLayout?gridTypeID=${gridTypeID}`
    );
    const resDate = response.data;
    return resDate;
  } catch (e: any) {
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Warning: Failed to load Grid Layout',
        detail: 'Unable to retrieve Grid Layout. Default layout applied.',
        toastType: ToastType.WARNING,
      })
    );
    return null;
  }
}

export async function addUpdateGridLayout(
  gridTypeID: number,
  gridJason: string
) {
  store.dispatch(setAppSpinner(true));
  try {
    await httpClient.post<any>(
      `/Repository/addUpdateGridLayout?gridTypeID=${gridTypeID}&gridJason=${gridJason}`
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Grid Layout successfully updated.',
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return true;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Unable to update Grid Layout.',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}

export async function fetchBatchStatus() {
  try {
    const response: AxiosResponse<IdValuePair[]> = await httpClient.get<
      IdValuePair[]
    >(`/Batch/getBatchStatus`);
    return response.data;
  } catch (e: any) {
    return null;
  }
}

export async function fetchLedgerAccount() {
  try {
    const response: AxiosResponse<IdValuePair[]> = await httpClient.get<
      IdValuePair[]
    >(`/Reports/getLedgerAccount`);
    return response.data;
  } catch (e: any) {
    return null;
  }
}

export async function fetchClaimDNADataByID(claimID: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<ClaimLogsData> =
      await httpClient.get<ClaimLogsData>(
        `/Claims/getClaimDNAData?claimID=${claimID}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function getCrossoverClaimType(claimID: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.get<any>(
      `/AddEditClaim/getCrossoverClaimType?claimID=${claimID}`
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error: unable to get claim crossover type.',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function createCrossOverClaim(data: CreateCrossoverCriteria[]) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `AddEditClaim/createCrossoverClaim`,
      data
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `${response.data.message}`,
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return response.data.crossoverClaimID;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function getClaimDetailSummaryById(claimID: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<ClaimDetailSummaryResult> =
      await httpClient.get<ClaimDetailSummaryResult>(
        `/Claims/getClaimDetailSummaryBillingData?claimID=${claimID}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function fetchClaimDetailDataByID(claimID: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<ClaimDetailResultById> =
      await httpClient.get<ClaimDetailResultById>(
        `/Claims/getClaimDetailData?claimID=${claimID}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}

export async function fetchChargeDetailsByID(claimID: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<ChargeDetailData> =
      await httpClient.get<ChargeDetailData>(
        `/Claims/getChargeDetailData?chargeID=${claimID}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}

export async function getChargesFee(searchCriteria: ChargeFeeCriteria) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<ChargeFeeOutput> =
      await httpClient.get<ChargeFeeOutput>(
        `/AddEditClaim/getCPTFee?cptCode=${searchCriteria.cptCode}` +
          `&modifierCode=${searchCriteria.modifierCode}` +
          `&patientInsuranceID=${searchCriteria.patientInsuranceID}` +
          `&facilityID=${searchCriteria.facilityID}` +
          `&medicalCaseID=${searchCriteria.medicalCaseID}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error: Error in Charge Fee Data.',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}

export async function getPatientLookup() {
  try {
    const response: AxiosResponse<PatientLookupDropdown> =
      await httpClient.get<PatientLookupDropdown>(
        `/Repository/getPatientLookupDropowns`
      );
    return response.data;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error: Error in Charge Status Data.',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function getPatientActiveInsurances(
  groupID: number | undefined,
  patientInsuranceID: number | undefined
) {
  try {
    const response: AxiosResponse<PatientBasedInsuranceDropdown[]> =
      await httpClient.get<PatientBasedInsuranceDropdown[]>(
        `/Patient/getPatientBasedInsurancesData?groupID=${groupID}&patientInsuranceID=${patientInsuranceID}`
      );
    return response.data;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error: Error in Patient Insurance Data.',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}

export async function savePatient(patientData: SavePatientRequestData) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<SavePatientResponseDate> =
      await httpClient.post<SavePatientResponseDate>(
        `/Patient/savePatient/`,
        patientData
      );
    store.dispatch(setAppSpinner(false));
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `Successfully saved patient`,
        toastType: ToastType.SUCCESS,
      })
    );
    return response.data;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function uploadPatientDocs(patientData: FormData) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<PatientUploadDocsResponse> =
      await httpClient.post<PatientUploadDocsResponse>(
        `/Patient/uploadPatientDocument`,
        patientData
      );
    store.dispatch(setAppSpinner(false));
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `Document Successfully uploaded`,
        toastType: ToastType.SUCCESS,
      })
    );
    return response.data;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function deletePatient(patientID: number) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<DeletePatientResponseDate> =
      await httpClient.delete<DeletePatientResponseDate>(
        `Patient/deletePatientByID?patientID=${patientID}`
      );
    store.dispatch(setAppSpinner(false));

    return response.data;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    store.dispatch(setAppSpinner(false));
    return null;
  }
}

export async function deleteGuarantor(GuarantorID: number) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<DeleteGuarantorResponse> =
      await httpClient.delete<DeleteGuarantorResponse>(
        `/Patient/deletePatientGuarantorByID?patientGuarantorID=${GuarantorID}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    store.dispatch(setAppSpinner(false));
    return null;
  }
}

export async function fetchInsuranceInfoData(insID: number | null) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<InsuranceInfoData[]> = await httpClient.get<
      InsuranceInfoData[]
    >(`/Repository/getInsuranceInfo?insuranceID=${insID}`);
    store.dispatch(setAppSpinner(false));
    return response.data[0];
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function updatePatientInsurance(data: UpdatePatientInsuranceData) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/Patient/updatePatientInsurance`,
      data
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `Patient Insurance Update Successfully`,
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return response.data.message;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}

export async function updateGuarantorInsurance(data: UpdateGauranterData) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `Patient/updatePatientGuarantorData`,
      data
    );
    store.dispatch(setAppSpinner(false));
    return response.data.message;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}

export async function updateDos(data: UpdateDosData) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<AddPatientCopaymentResponce> =
      await httpClient.post<AddPatientCopaymentResponce>(
        `/Patient/updateAdvancePaymentDOS`,
        data
      );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `Dos Update Successfully`,
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return response.data.message;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function refundAdvancePayment(data: RefundPaymentData) {
  const obj = JSON.parse(JSON.stringify(data));
  const str = Object.keys(obj)
    .map(function (key) {
      return `${key}=${obj[key]}`;
    })
    .join('&');
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<AddPatientCopaymentResponce> =
      await httpClient.post<AddPatientCopaymentResponce>(
        `/Patient/refundAdvancePayment?${str}`
      );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `Dos Update Successfully`,
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return response.data.message;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function getPatientInsuranceTabData(patientID: number | null) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<PatientInsuranceTabData[]> =
      await httpClient.get<PatientInsuranceTabData[]>(
        `/Patient/getInsuranceByID?id=${patientID}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}

export async function getPatientGaiurantorTabData(patientID: number | null) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<PatientGuarantorTabData[]> =
      await httpClient.get<PatientGuarantorTabData[]>(
        `/Patient/getPatientGuarantor?id=${patientID}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function checkEligibility(data: EligibilityRequestData) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.get<any>(
      `/Claims/viewPatientEligibilityResponse?patientInsuranceID=${data.patientInsuranceID}` +
        `&serviceTypeID=${data.serviceTypeCodeID}` +
        `&dos=${data.dos}`
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function fetchPostingDate(data: PostingDateCriteria) {
  const obj = JSON.parse(JSON.stringify(data));
  const str = Object.keys(obj)
    .map(function (key) {
      return `${key}=${obj[key]}`;
    })
    .join('&');
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<PostingDateResult> =
      await httpClient.get<PostingDateResult>(
        `/AddEditClaim/getPostingDateCheck?${str}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function fetchReconciliationSearchData(
  data: ReconciliationCriteria
) {
  const obj = JSON.parse(JSON.stringify(data));
  const str = Object.keys(obj)
    .map(function (key) {
      return `${key}=${obj[key]}`;
    })
    .join('&');
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<GetReconciledSearchAPIResult[]> =
      await httpClient.get<GetReconciledSearchAPIResult[]>(
        `Claims/getPaymentReconsilationProfileData?${str}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function fetchPaymentReconciliationLedgerData(
  data: GetPaymentReconcilationLedgerCriteria
) {
  const obj = JSON.parse(JSON.stringify(data));
  const str = Object.keys(obj)
    .map(function (key) {
      return `${key}=${obj[key]}`;
    })
    .join('&');
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<GetPaymentReconcilationLedgerResult[]> =
      await httpClient.get<GetPaymentReconcilationLedgerResult[]>(
        `Claims/getPaymentLedgers?${str}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function saveReconcilePayment(data: ReconcilePayment) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<ReconcilePaymentResult> =
      await httpClient.post<ReconcilePaymentResult>(
        `/AddEditClaim/reconsilePosting`,
        data
      );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `${response.data.response}`,
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return true;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}

export async function getPatientInsuranceAsyncCall(patientID: number | null) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<PatientInsuranceData[]> =
      await httpClient.get<PatientInsuranceData[]>(
        `/Repository/getPatientInsurance?patientID=${patientID}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Error in Fetching Patient Insurance Data',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}

export async function getPaymentBatchDropdownData(
  groupID: number,
  value: string
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<PaymentBatchData[]> = await httpClient.get<
      PaymentBatchData[]
    >(`/Batch/getPaymentBatchData?groupID=${groupID}&value=${value}`);
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error: error in fetching payment batch.',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function getClaimTransferInsurance(claimID: any) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<SingleSelectDropDownDataType[]> =
      await httpClient.get<SingleSelectDropDownDataType[]>(
        `/AddEditClaim/getClaimTransferInsurance?claimID=${claimID}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error: error in fetching claim transfer data.',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}

export async function getClaimPayor(claimID: any) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<SingleSelectDropDownDataType[]> =
      await httpClient.get<SingleSelectDropDownDataType[]>(
        `/AddEditClaim/getClaimPayor?claimID=${claimID}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error: error in fetching claim transfer data.',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function getReasonCode(value: string) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<ReasonCodeType[]> = await httpClient.get<
      ReasonCodeType[]
    >(`/Repository/getReasonCode?searchValue=${value}`);
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error: error in fetching reason code.',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function getRemarkCode(value: string) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<ReasonCodeType[]> = await httpClient.get<
      ReasonCodeType[]
    >(`/Repository/getRemarkCode?searchValue=${value}`);
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error: error in fetching remark code.',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}

export async function savePatientPayment(
  paymentDta: SavePatientPaymentCriteria[]
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/AddEditClaim/savePatientPayments`,
      paymentDta
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `${response.data.message}`,
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return true;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function getClaimAdvancePayment(claimID: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<ClaimAdvancePayment> =
      await httpClient.get<ClaimAdvancePayment>(
        `/AddEditClaim/getClaimAdvancePayments?claimID=${claimID}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function saveInsPayment(
  paymentDta: SaveInsurancePaymentCriteria[]
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `AddEditClaim/saveInsurancePayments`,
      paymentDta
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `${response.data.message}`,
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return true;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error: unable to delete charge',
        toastType: ToastType.ERROR,
      })
    );
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function fetchInsuranceData() {
  try {
    const response: AxiosResponse<AllInsuranceData[]> = await httpClient.get<
      AllInsuranceData[]
    >(`/Patient/getInsuranceData`);
    store.dispatch(getAllInsuranceData(response.data));
    return true;
  } catch (e: any) {
    return false;
  }
}
export async function getEligibilityCheckResponse(id: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.get<any>(
      `/Patient/getEligibilityResponse?id=${id}`
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Something Went Wrong',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function fetchClaimNotesData(
  claimID: number | null | undefined,
  type: string | null,
  noteTypeId: number | null,
  createdBy: string | null
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<ClaimNotesData[]> = await httpClient.get<
      ClaimNotesData[]
    >(
      `AddEditClaim/getNotesByLineItemID?lineItemID=${claimID}` +
        `&type=${type}` +
        `&noteTypeID=${noteTypeId}` +
        `&createdBy=${createdBy}`
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function getPatientDocumentData(
  patientID: number | null | undefined,
  groupID: number | null,
  categoryID: string | null
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<PatientDocumnetData[]> = await httpClient.get<
      PatientDocumnetData[]
    >(
      `Patient/getDocumentData?patientID=${patientID}` +
        `&groupID=${groupID}` +
        `&categoryID=${categoryID}`
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function getPlanProcedureHistoryData(
  searchCriteria: PlanProcedureHistoryCriteria
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<ProcedureHistoryReport> =
      await httpClient.get<ProcedureHistoryReport>(
        `Reports/getPlanProcedureHistory?groupID=${searchCriteria.groupID}` +
          `&providerID=${searchCriteria.providerID}` +
          `&fromDos=${searchCriteria.fromDos}` +
          `&toDos=${searchCriteria.toDos}` +
          `&sortByColumn=${searchCriteria.sortByColumn}` +
          `&sortOrder=${searchCriteria.sortOrder}` +
          `&pageNumber=${searchCriteria.pageNumber}` +
          `&pageSize=${searchCriteria.pageSize}` +
          `&getAllData=${searchCriteria.getAllData}` +
          `&getOnlyIDS=${searchCriteria.getOnlyIDS}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function getPlanProcedurePayerHistoryData(
  searchCriteria: PlanProcedurePayerHistoryCriteria
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<PlanProcedurePayerHistoryReport> =
      await httpClient.get<PlanProcedurePayerHistoryReport>(
        `Reports/getPlanProcedureHistoryByPayer?groupID=${searchCriteria.groupID}` +
          `&insuranceID=${searchCriteria.insuranceID}` +
          `&cpt=${searchCriteria.cpt}` +
          `&fromDate=${searchCriteria.fromDate}` +
          `&toDate=${searchCriteria.toDate}` +
          `&dateType=${searchCriteria.dateType}` +
          `&sortByColumn=${searchCriteria.sortByColumn}` +
          `&sortOrder=${searchCriteria.sortOrder}` +
          `&pageNumber=${searchCriteria.pageNumber}` +
          `&pageSize=${searchCriteria.pageSize}` +
          `&getAllData=${searchCriteria.getAllData}` +
          `&getOnlyIDS=${searchCriteria.getOnlyIDS}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function getClaimActivityReportData(
  searchCriteria: ClaimActivityReportCriteria
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<ClaimActivityReportResult[]> =
      await httpClient.get<ClaimActivityReportResult[]>(
        `Reports/getClaimActivityReportByProvider?groupID=${searchCriteria.groupID}` +
          `&providerID=${searchCriteria.providerID}` +
          `&fromPostingDate=${searchCriteria.fromPostingDate}` +
          `&toPostingDate=${searchCriteria.toPostingDate}` +
          `&pageNumber=${searchCriteria.pageNumber}` +
          `&pageSize=${searchCriteria.pageSize}` +
          `&sortByColumn=${searchCriteria.sortColumn}` +
          `&sortOrder=${searchCriteria.sortOrder}` +
          `&getAllData=${searchCriteria.getAllData}` +
          `&getOnlyIDS=${searchCriteria.getOnlyIDS}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function getClaimBatchSubmitReport(
  data: ClaimSubmissionReportCriteria
) {
  const obj = JSON.parse(JSON.stringify(data));
  const str = Object.keys(obj)
    .map(function (key) {
      return `${key}=${obj[key]}`;
    })
    .join('&');
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<ClaimSubmissionReportResult[]> =
      await httpClient.get<ClaimSubmissionReportResult[]>(
        `/Reports/getClaimBatchSubmitReport?${str}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function getAgedTrialBalanceReportData(
  searchCriteria: AgedTrialBalanceReportCriteria
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<AgedTrialBalanceReportResult[]> =
      await httpClient.get<AgedTrialBalanceReportResult[]>(
        `Reports/getAgedTrialBalanceReport?groupID=${searchCriteria.groupID}` +
          `&fromPostingDate=${searchCriteria.fromPostingDate}` +
          `&toPostingDate=${searchCriteria.toPostingDate}` +
          `&pageNumber=${searchCriteria.pageNumber}` +
          `&pageSize=${searchCriteria.pageSize}` +
          `&sortByColumn=${searchCriteria.sortColumn}` +
          `&sortOrder=${searchCriteria.sortOrder}` +
          `&getAllData=${searchCriteria.getAllData}` +
          `&getOnlyIDS=${searchCriteria.getOnlyIDS}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function getChargesPaymentsSummaryByProviderReport(
  searchCriteria: ChargesPaymentsSummaryByProviderCriteria
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<ChargesPaymentsSummaryByProviderReport> =
      await httpClient.get<ChargesPaymentsSummaryByProviderReport>(
        `Reports/getChargesPaymentsSummaryByProviderReport?groupID=${searchCriteria.groupID}` +
          `&practiceID=${searchCriteria.practiceID}` +
          `&providerIDS=${searchCriteria.providerIDS}` +
          `&fromDate=${searchCriteria.fromDate}` +
          `&toDate=${searchCriteria.toDate}` +
          `&chargesBy=${searchCriteria.chargesBy}` +
          `&paymentsBy=${searchCriteria.paymentsBy}` +
          `&pageNumber=${searchCriteria.pageNumber}` +
          `&pageSize=${searchCriteria.pageSize}` +
          `&sortColumn=${searchCriteria.sortColumn}` +
          `&sortOrder=${searchCriteria.sortOrder}` +
          `&runBy=${searchCriteria.runBy}` +
          `&getAllData=${searchCriteria.getAllData}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function getEndOfMonthReport(
  searchCriteria: EndOfMonthReportCriteria
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<EndOfMonthReportResult[]> =
      await httpClient.get<EndOfMonthReportResult[]>(
        `Reports/getMonthEndReportData?groupID=${searchCriteria.groupID}` +
          `&fromDate=${searchCriteria.fromDate}` +
          `&toDate=${searchCriteria.toDate}` +
          `&monthEnd=${searchCriteria.monthEnd}` +
          `&pageNumber=${searchCriteria.pageNumber}` +
          `&pageSize=${searchCriteria.pageSize}` +
          `&sortColumn=${searchCriteria.sortColumn}` +
          `&sortOrder=${searchCriteria.sortOrder}` +
          `&getAllData=${searchCriteria.getAllData}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function getEODViewDetails(
  data: EOMReportViewDetailSearchCriteria
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<EndOfMonthViewDetailResult> =
      await httpClient.get<EndOfMonthViewDetailResult>(
        `Reports/getMonthEndReportViewData?groupID=${data.groupID}` +
          `&monthStartDate=${data.monthStartDate}` +
          `&practiceIDS=${data.practiceIDS}` +
          `&facilityIDS=${data.facilityIDS}` +
          `&providerIDS=${data.providerIDS}` +
          `&pageNumber=${data.pageNumber}` +
          `&pageSize=${data.pageSize}` +
          `&sortColumn=${data.sortColumn}` +
          `&sortOrder=${data.sortOrder}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function getEndOfMonthResult(
  groupID: number | undefined,
  monthStartDate: string
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `Reports/lockMonthEndData?groupID=${groupID}&monthStartDate=${monthStartDate}`
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function getPlanProcedureCountDetailsData(
  searchCriteria: PlanProcedureCountDetailsCriteria
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<PlanProcedureCountDetails[]> =
      await httpClient.get<PlanProcedureCountDetails[]>(
        `Claims/getPlanProcedureChargesData?groupID=${searchCriteria.groupID}` +
          `&providerID=${searchCriteria.providerID}` +
          `&procedureCode=${searchCriteria.procedureCode}` +
          `&responsibility=${searchCriteria.responsibility}` +
          `&sortByColom=${searchCriteria.sortByColumn}` +
          `&pageNumber=${searchCriteria.pageNumber}` +
          `&pageSize=${searchCriteria.pageSize}` +
          `&getAllData=${searchCriteria.getAllData}` +
          `&exportData=${searchCriteria.exportData}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function getInsuranceProfileReportData(
  searchCriteria: InsuranceProfileReportCriteria
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<InsuranceProfileReportData> =
      await httpClient.get<InsuranceProfileReportData>(
        `Reports/getInsuranceProfileReportbyProvider?groupID=${searchCriteria.groupID}` +
          `&providerID=${searchCriteria.providerID}` +
          `&insuranceID=${searchCriteria.insuranceID}` +
          `&fromDos=${searchCriteria.fromDos}` +
          `&toDos=${searchCriteria.toDos}` +
          `&sortByColumn=${searchCriteria.sortByColumn}` +
          `&sortOrder=${searchCriteria.sortOrder}` +
          `&pageNumber=${searchCriteria.pageNumber}` +
          `&pageSize=${searchCriteria.pageSize}` +
          `&getAllData=${searchCriteria.getAllData}` +
          `&getOnlyIDS=${searchCriteria.getOnlyIDS}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function getAgingInsuranceReportData(
  searchCriteria: AgingByInsuranceReportCriteria
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<AgingInsuranceReportData> =
      await httpClient.get<AgingInsuranceReportData>(
        `Reports/getAgingByInsuranceReport?groupID=${searchCriteria.groupID}` +
          `&insuranceName=${searchCriteria.insuranceName}` +
          `&fromBalance=${searchCriteria.fromBalance}` +
          `&toBalance=${searchCriteria.toBalance}` +
          `&fromDate=${searchCriteria.fromDate}` +
          `&toDate=${searchCriteria.toDate}` +
          `&agingType=${searchCriteria.agingType}` +
          `&sortByColumn=${searchCriteria.sortByColumn}` +
          `&sortOrder=${searchCriteria.sortOrder}` +
          `&pageNumber=${searchCriteria.pageNumber}` +
          `&pageSize=${searchCriteria.pageSize}` +
          `&getAllData=${searchCriteria.getAllData}` +
          `&getOnlyIDS=${searchCriteria.getOnlyIDS}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function getAgingProviderReportData(
  searchCriteria: AgingByProviderReportCriteria
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<AgingProviderReportData> =
      await httpClient.get<AgingProviderReportData>(
        `Reports/getAgingByProviderReport?groupID=${searchCriteria.groupID}` +
          `&providerID=${searchCriteria.providerID}` +
          `&fromBalance=${searchCriteria.fromBalance}` +
          `&toBalance=${searchCriteria.toBalance}` +
          `&fromDate=${searchCriteria.fromDate}` +
          `&toDate=${searchCriteria.toDate}` +
          `&agingType=${searchCriteria.agingType}` +
          `&sortColumn=${searchCriteria.sortColumn}` +
          `&sortOrder=${searchCriteria.sortOrder}` +
          `&pageNumber=${searchCriteria.pageNumber}` +
          `&pageSize=${searchCriteria.pageSize}` +
          `&getAllData=${searchCriteria.getAllData}` +
          `&getOnlyIDS=${searchCriteria.getOnlyIDS}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function getAgingInsuranceReportDetailsData(
  searchCriteria: AgingByInsuranceReportDetailsCriteria
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<AgingByInsuranceReportDetailsResult[]> =
      await httpClient.get<AgingByInsuranceReportDetailsResult[]>(
        `Reports/getAgingInsuranceCollapseByID?groupID=${searchCriteria.groupID}` +
          `&agingType=${searchCriteria.agingType}` +
          `&insuranceID=${searchCriteria.insuranceID}` +
          `&currentIndex=${searchCriteria.currentIndex}` +
          `&getAllData=${searchCriteria.getAllData}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function getPatientAdvancePaymentReportData(
  searchCriteria: PatientAdvancePaymentReportCriteria
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<PatientAdvancePaymentReportResult[]> =
      await httpClient.get<PatientAdvancePaymentReportResult[]>(
        `Reports/getPatientAdvancePaymentReport?groupID=${searchCriteria.groupID}` +
          `&patientFirstName=${searchCriteria.patientFirstName}` +
          `&patientLastName=${searchCriteria.patientLastName}` +
          `&patientID=${searchCriteria.patientID}` +
          `&fromAdvanceBalance=${searchCriteria.fromAdvanceBalance}` +
          `&toAdvanceBalance=${searchCriteria.toAdvanceBalance}` +
          `&fromPostingDate=${searchCriteria.fromPostingDate}` +
          `&toPostingDate=${searchCriteria.toPostingDate}` +
          `&sortByColumn=${searchCriteria.sortByColumn}` +
          `&sortOrder=${searchCriteria.sortOrder}` +
          `&pageNumber=${searchCriteria.pageNumber}` +
          `&pageSize=${searchCriteria.pageSize}` +
          `&getAllData=${searchCriteria.getAllData}` +
          `&getOnlyIDS=${searchCriteria.getOnlyIDS}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function getAgingPatientReportData(
  searchCriteria: AgingByPatientReportCriteria
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<AgingPatientReportData> =
      await httpClient.get<AgingPatientReportData>(
        `Reports/getAgingByPatientReport?groupID=${searchCriteria.groupID}` +
          `&patientFirstName=${searchCriteria.patientFirstName}` +
          `&patientLastName=${searchCriteria.patientLastName}` +
          `&patientID=${searchCriteria.patientID}` +
          `&fromBalance=${searchCriteria.fromBalance}` +
          `&toBalance=${searchCriteria.toBalance}` +
          `&fromDate=${searchCriteria.fromDate}` +
          `&toDate=${searchCriteria.toDate}` +
          `&agingType=${searchCriteria.agingType}` +
          `&sortByColumn=${searchCriteria.sortByColumn}` +
          `&sortOrder=${searchCriteria.sortOrder}` +
          `&pageNumber=${searchCriteria.pageNumber}` +
          `&pageSize=${searchCriteria.pageSize}` +
          `&getAllData=${searchCriteria.getAllData}` +
          `&getOnlyIDS=${searchCriteria.getOnlyIDS}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function getPatientAccountingReportData(
  searchCriteria: PatientAccountingReportCriteria
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<PatientAccountingReportResult[]> =
      await httpClient.get<PatientAccountingReportResult[]>(
        `Reports/getPatientAccountingDetailReport?groupID=${searchCriteria.groupID}` +
          `&ledgerAccountID=${searchCriteria.ledgerAccountID}` +
          `&patientID=${searchCriteria.patientID}` +
          `&patientDOB=${searchCriteria.patientDOB}` +
          `&patientFirstName=${searchCriteria.patientFirstName}` +
          `&patientLastName=${searchCriteria.patientLastName}` +
          `&sortByColumn=${searchCriteria.sortByColumn}` +
          `&sortOrder=${searchCriteria.sortOrder}` +
          `&pageNumber=${searchCriteria.pageNumber}` +
          `&pageSize=${searchCriteria.pageSize}` +
          `&getAllData=${searchCriteria.getAllData}` +
          `&getOnlyIDS=${searchCriteria.getOnlyIDS}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function getAgingPatienteReportDetailsData(
  searchCriteria: AgingByPatientReportDetailsCriteria
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<AgingByPatientReportDetailsResult[]> =
      await httpClient.get<AgingByPatientReportDetailsResult[]>(
        `Reports/getAgingPatientCollapseByID?groupID=${searchCriteria.groupID}` +
          `&patientID=${searchCriteria.patientID}` +
          `&agingType=${searchCriteria.agingType}` +
          `&currentIndex=${searchCriteria.currentIndex}` +
          `&getAllData=${searchCriteria.getAllData}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function getEOMMonthlySummaryReportData(
  searchCriteria: EOMMonthlySummaryReportCriteria
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<EOMMonthlySummaryReportData[]> =
      await httpClient.get<EOMMonthlySummaryReportData[]>(
        `Reports/getNewMonthlySummaryDevelopmemt?groupID=${searchCriteria.groupID}` +
          `&providerIDS=${searchCriteria.providerIDs}` +
          `&fromDate=${searchCriteria.fromDate}` +
          `&toDate=${searchCriteria.toDate}` +
          `&practiceIDS=${searchCriteria.practiceIDs}` +
          `&facilityIDS=${searchCriteria.facilityIDs}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function getMonthlySummaryReportData(
  searchCriteria: MonthlySummaryReportCriteria
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<MonthlySummaryReportData[]> =
      await httpClient.get<MonthlySummaryReportData[]>(
        `Reports/getmonthlySummaryDevelopmemt?groupID=${searchCriteria.groupID}` +
          `&providerIDs=${searchCriteria.providerIDs}` +
          `&fromDate=${searchCriteria.fromDate}` +
          `&toDate=${searchCriteria.toDate}` +
          `&practiceIDs=${searchCriteria.practiceIDs}` +
          `&facilityIDs=${searchCriteria.facilityIDs}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function refreshMonthlySummaryReport() {
  try {
    store.dispatch(setAppSpinner(true));
    const response = await httpClient.get(
      '/Reports/reloadMonthlySummaryReport',
      {
        timeout: 0, // Set the timeout to 0 for this specific request (unlimited timeout)
      }
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error: error refreshing monthly summary report data.',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function getRefreshDateAndTime(groupID: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<RefreshDateTimeResult> =
      await httpClient.get<RefreshDateTimeResult>(
        `/Repository/getLastMonthlySummaryReportDate?groupID=${groupID}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}

export async function getFacilitiesProfileData(
  practiceID: number,
  groupID: number
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<FacilitiesResultData[]> =
      await httpClient.get<FacilitiesResultData[]>(
        `Location/getfacilitiesProfileData?groupID=${groupID}&practiceID=${practiceID}&facilityID=null&name=null&active=null`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function saveGlobleSearchViewData(data: GlobleSearchViewCriteria) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<GlobleSearchViewResult[]> =
      await httpClient.post<GlobleSearchViewResult[]>(
        `AddEditClaim/saveGlobalSearchViewItems`,
        data
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function addFacility(json: AddEditFacilitiesData) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `Location/addFacility`,
      json
    );
    store.dispatch(setAppSpinner(false));
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Facility Successfully Created',
        toastType: ToastType.SUCCESS,
      })
    );
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function updateFacility(json: AddEditFacilitiesData) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `Location/updateFacility`,
      json
    );
    store.dispatch(setAppSpinner(false));
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Facility Successfully Saved',
        toastType: ToastType.SUCCESS,
      })
    );
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function getPrintPatientStatementData(patientID: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<PrintPatientStatementData[]> =
      await httpClient.get<PrintPatientStatementData[]>(
        `CustomPrint/getPrintPatientStatements?id=${patientID}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function updateFacilityActive(
  facilityID: number,
  active: boolean
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `Location/updateFacilityActive`,
      { facilityID, active }
    );
    store.dispatch(setAppSpinner(false));
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `Facility Successfully ${active ? 'Activated' : 'Inactivated'}`,
        toastType: ToastType.SUCCESS,
      })
    );
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}

export async function getRoleProfileData() {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<RoleResultData[]> = await httpClient.get<
      RoleResultData[]
    >(`Roles/GetMenuRoles`);
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function getModulesByRoleId(id: string) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<ModulesByRoleIdResultData[]> =
      await httpClient.get<ModulesByRoleIdResultData[]>(
        `Roles/GetModulesByRoleId?id=${id}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function getModuleTypes() {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<TGetModuleTypes[]> = await httpClient.get<
      TGetModuleTypes[]
    >(`Modules/GetModuleTypes`);
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function getModuleForAssignPrivilege() {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<TGetModuleForAssignPrivilege[]> =
      await httpClient.get<TGetModuleForAssignPrivilege[]>(
        `Roles/GetModuleForAssignPrivilege`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function saveRoleData(payload: TAddEditRole) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `Roles/saveRole`,
      payload
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Menu Role Successfully Created',
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    if (message) {
      return { errors: message };
    }
    return null;
  }
}
export async function updateRoleData(payload: TAddEditRole) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `Roles/updateRoleData`,
      payload
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Menu Role Successfully Saved',
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function updateRoleActive(roleID: string, active: boolean) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `Roles/updateRoleActive`,
      { roleID, active }
    );
    store.dispatch(setAppSpinner(false));
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `Menu Role Successfully ${active ? 'Activated' : 'Inactivated'}`,
        toastType: ToastType.SUCCESS,
      })
    );
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}

export async function getUsersProfileData(groupID: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<UserResultData[]> = await httpClient.get<
      UserResultData[]
    >(`Users/GetUsersData?groupID=${groupID}`);
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}

export async function getProvidersProfileData(groupID: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<ProviderResultData[]> = await httpClient.get<
      ProviderResultData[]
    >(
      `Provider/getProviderProfileData?name=null&active=null&groupID=${groupID}&providerID=null`
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function getUserInfoByEmail(email: string) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<UserFields> =
      await httpClient.get<UserFields>(
        `Users/GetUserInfoByEmail?email=${email}&clientId=1`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}

export async function getProfileModalData(id: number | string, type: string) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<ModalFieldsResult> =
      await httpClient.get<ModalFieldsResult>(
        `Repository/getPopupDetailsDatabyID?id=${id}&type=${type}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}

export async function getProviderInfoByID(providerID: number | undefined) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<ProviderFields> =
      await httpClient.get<ProviderFields>(
        `/Provider/getProviderInfoByID?providerID=${providerID}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function getUserLookupDropowns() {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<UserLookup> =
      await httpClient.get<UserLookup>(`Users/getUserLookupDropowns`);
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function addUser(payload: FormData) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/Users/saveUser`,
      payload
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'User Successfully Created',
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(setAppSpinner(false));
    if (message && message.includes('User already exist with this email id.')) {
      return { errors: ['User cannot be added as profile already exists.'] };
    }
    return null;
  }
}

export async function addProvider(payload: FormData) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/Provider/addProviderData`,
      payload
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Provider Successfully Created',
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(setAppSpinner(false));
    if (message && message.includes('User already exist with this email id')) {
      return { errors: ['User already exist with this "Email ID"'] };
    }
    return null;
  }
}

export async function getModuleTypeDropdown() {
  try {
    const response: AxiosResponse<LookupDropdownsDataType[]> =
      await httpClient.get<LookupDropdownsDataType[]>(
        `/Modules/GetModuleTypes`
      );
    return response.data;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error: Error in Charge Status Data.',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}

export async function getTimeDropdown() {
  try {
    const response: AxiosResponse<LookupDropdownsDataType[]> =
      await httpClient.get<LookupDropdownsDataType[]>(
        `/Repository/getStartAndEndTimeDropdown`
      );
    return response.data;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error: Error in Charge Status Data.',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}

export async function getModuleProfileData() {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<ModuleResultData[]> = await httpClient.get<
      ModuleResultData[]
    >(`/Modules/GetModulesData`);
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}

export async function getModuleInfoByID(moduleID: number | undefined) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<ModuleFields> =
      await httpClient.get<ModuleFields>(
        `/Modules/GetModuleInfoByModuleId?moduleID=${moduleID}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}

export async function addModule(payload: FormData) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/Modules/saveModule`,
      payload
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Module Successfully Created',
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(setAppSpinner(false));
    if (message && message.includes('Module Code Already Exists')) {
      return { errors: ['"Module Code" Already Exists"'] };
    }
    if (message && message.includes('Module Name Already Exists')) {
      return { errors: ['"Module Name" Already Exists'] };
    }
    return null;
  }
}

export async function updateModule(payload: FormData) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/Modules/updateModuleData`,
      payload
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Module Successfully Update',
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}

export async function updateUser(payload: FormData) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/Users/updateUserData`,
      payload
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'User successfully saved.',
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}

export async function updateProvider(payload: FormData) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/Provider/updateProviderData`,
      payload
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Provider Successfully Update',
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function updateProviderActive(
  ProviderID: number,
  active: boolean
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/Provider/updateProviderActive`,
      { ProviderID, active }
    );
    store.dispatch(setAppSpinner(false));
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `Provider Successfully ${active ? 'Activated' : 'Inactivated'}`,
        toastType: ToastType.SUCCESS,
      })
    );
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}

export async function updateModuleActive(moduleID: number, active: boolean) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/Modules/updateModuleActive`,
      { moduleID, active }
    );
    store.dispatch(setAppSpinner(false));
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `Module Successfully ${active ? 'Activated' : 'Inactivated'}`,
        toastType: ToastType.SUCCESS,
      })
    );
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}

export async function resetUserPassword(payload: TResetPasswordJson) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/Claims/ResetPassword`,
      payload
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Password successfully reset',
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    if (message) {
      return { errors: message };
    }
    return null;
  }
}
export async function getGroupProfileData(data: GroupSearchCriteria) {
  const obj = JSON.parse(JSON.stringify(data));
  const str = Object.keys(obj)
    .map(function (key) {
      return `${key}=${obj[key]}`;
    })
    .join('&');
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<GroupResultData[]> = await httpClient.get<
      GroupResultData[]
    >(`/Client/getGroupProfileData?${str}`);
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function addGroup(payload: FormData) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/Client/addGroupData`,
      payload
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Group Successfully Created',
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));

    return null;
  }
}
export async function updateGroup(payload: FormData) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/Client/updateGroupData`,
      payload
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Group Successfully Saved',
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function updateGroupActive(groupID: any, active: boolean) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/Client/updateGroupActive`,
      { groupID, active }
    );
    store.dispatch(setAppSpinner(false));
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `Group Successfully ${active ? 'Activated' : 'Inactivated'}`,
        toastType: ToastType.SUCCESS,
      })
    );
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function updateUserActive(userID: string, active: boolean) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `Users/updateUserActive`,
      { userID, active }
    );
    store.dispatch(setAppSpinner(false));
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `User Successfully ${active ? 'Activated' : 'Inactivated'}`,
        toastType: ToastType.SUCCESS,
      })
    );
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}

export async function getInsuranceProfileData(groupID: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<InsuranceResultData[]> = await httpClient.get<
      InsuranceResultData[]
    >(
      `Insurance/getInsuranceProfileData?groupID=${groupID}&insuranceTypeID=null&insuranceName=null&timelyFilingDays=null'`
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function addInsrance(payload: FormData) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/Insurance/addInsuranceData`,
      payload
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Insurance Successfully Created',
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function updateInsurance(payload: FormData) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/Insurance/updateInsuranceData`,
      payload
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Insurance Successfully Saved',
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function getClearingHouseList(groupID: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<IdValuePair[]> = await httpClient.get<
      IdValuePair[]
    >(`Insurance/getClearingHouseList?groupID=${groupID}`);
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function getSubmitionPayerIDsList(
  value: string,
  groupID: number,
  payerTypeID: number
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<IdValuePair[]> = await httpClient.get<
      IdValuePair[]
    >(
      `Insurance/getSubmitionPayerIDsList?value=${value}&groupID=${groupID}&insuranceID=&payerTypeID=${payerTypeID}`
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function getEligibilityPayerIDsList(
  value: string,
  groupID: number,
  payerTypeID: number
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<IdValuePair[]> = await httpClient.get<
      IdValuePair[]
    >(
      `Insurance/getEligibilityPayerIDsList?value=${value}&groupID=${groupID}&insuranceID=&payerTypeID=${payerTypeID}`
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function updateInsuranceActive(
  insuranceID: number,
  active: boolean
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `Insurance/updateInsuranceActive`,
      { insuranceID, active }
    );
    store.dispatch(setAppSpinner(false));
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `Insurance Successfully ${active ? 'Activated' : 'Inactivated'}`,
        toastType: ToastType.SUCCESS,
      })
    );
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function addPractice(payload: FormData) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/Practice/addpracticeData`,
      payload
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Practice Successfully Created',
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function updatePractice(payload: FormData) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/Practice/updatePracticeData`,
      payload
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Practice Successfully Saved',
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function updatePracticeActive(
  practiceID: string,
  active: boolean
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `Practice/updatePracticeActive`,
      { practiceID, active }
    );
    store.dispatch(setAppSpinner(false));
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `User Successfully ${active ? 'Activated' : 'Inactivated'}`,
        toastType: ToastType.SUCCESS,
      })
    );
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function getPracticeProfileData(
  name: string | null,
  groupID: number,
  active: boolean | null,
  practiceID: number | null
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any[]> = await httpClient.get<any[]>(
      `Practice/getPracticeProfileData?name=${name}&groupID=${groupID}&active=${active}&practiceID=${practiceID}`
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function getInfoByNPI(npi: number | null, type: string) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.get<any>(
      `Reports/getInfoByNPI?npi=${npi}&type=${type}`
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function sendVerificationCodeToUser(email: string) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `Users/sendVerificationCodeToUser?email=${email}`
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function validatePasscode(email: string, passcode: string) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.get<any>(
      `Users/validatePasscode?email=${email}&passcode=${passcode}`
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function searchPatientAsyncAPI(obj: PatientSearchCriteria) {
  try {
    store.dispatch(setAppSpinner(true));
    const objString = JSON.stringify(obj);
    const response: AxiosResponse<PatientSearchOutput[]> =
      await httpClient.get<any>(
        `Repository/getPatientSearch?patientSearch=${objString}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function updateUserPassword(payload: UpdateUserPasswordData) {
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `Users/updateUserPassword`,
      payload
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Password Successfully Update',
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    if (message) {
      return { errors: message };
    }
    return null;
  }
}
export async function fetchEligiblityCheckListData(
  data: EligibilityCheckListSearchCriteria
) {
  const obj = JSON.parse(JSON.stringify(data));
  const str = Object.keys(obj)
    .map(function (key) {
      return `${key}=${obj[key]}`;
    })
    .join('&');
  store.dispatch(setAppSpinner(true));
  try {
    const response: AxiosResponse<EligibilityCheckListSearchResult[]> =
      await httpClient.get<EligibilityCheckListSearchResult[]>(
        `/Patient/getEligibilityData?${str}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return null;
  }
}
export async function getERAFullDetail(
  eraID: number,
  eraClaimIDS: string | null
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<ERAFullDetailResult> =
      await httpClient.get<ERAFullDetailResult>(
        `Claims/getERAFullDetail?eraID=${eraID}&eraClaimIDS=${eraClaimIDS}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function DeleteNotes(noteID: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<DeleteNotesResult> =
      await httpClient.post<DeleteNotesResult>(
        `AddEditClaim/archiveNotes?noteID=${noteID}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function getActionNeededClaims(groupID: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<ActionNeededClaimsResult[]> =
      await httpClient.get<ActionNeededClaimsResult[]>(
        `ARDashboard/getActionNeededClaims?groupID=${groupID}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function getRecentlyAccessedData(groupID: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<RecentlyAccessedData[]> =
      await httpClient.get<RecentlyAccessedData[]>(
        `ARDashboard/getRecentlyAccessedData?groupID=${groupID}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function getUnresolvedTasksAssigned(groupID: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<UnresolvedTasksAssignedResult[]> =
      await httpClient.get<UnresolvedTasksAssignedResult[]>(
        `ARDashboard/getUnresolvedTasksAssignedToYou?groupID=${groupID}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function getOpenItemsArManager(groupID: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<OpenItemsResult[]> = await httpClient.get<
      OpenItemsResult[]
    >(`ARDashboard/getOpenItems?groupID=${groupID}`);
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function getClaimScrubingErrors(claimID: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<ClaimScrubbingErrorsResult[]> =
      await httpClient.get<ClaimScrubbingErrorsResult[]>(
        `Claims/getClaimScrubingErrors?claimID=${claimID}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function viewClaimValidationErrors(claimID: number, type: string) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<ClaimValidationErrorsResult[]> =
      await httpClient.get<ClaimValidationErrorsResult[]>(
        `Claims/viewClaimValidationErrors?claimID=${claimID}&type=${type}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function getCollectedAmountsData(
  criteria: CollectedAmountsWidgetCriteria
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<CollectedAmountsWidgetResult[]> =
      await httpClient.get<CollectedAmountsWidgetResult[]>(
        `ARDashboard/getCollectedAmountsData?groupID=${criteria.groupID}&fromPostingDate=${criteria.fromPostingDate}&toPostingDate=${criteria.toPostingDate}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function getExpectedPaymentsByDay(
  groupID: number,
  insuranceID: number | null,
  insuranceTypeID: number | null
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<ExpectedPaymentsByDayResult[]> =
      await httpClient.get<ExpectedPaymentsByDayResult[]>(
        `ARDashboard/getExpectedPaymentsByDay?groupID=${groupID}&insuranceID=${insuranceID}&insuranceTypeID=${insuranceTypeID}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function getARSByData(groupID: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<ARSByDataResult[]> = await httpClient.get<
      ARSByDataResult[]
    >(`ARDashboard/getARSByData?groupID=${groupID}`);
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function getInsurancesWithTypes(groupID: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<InsurancesWithTypesDropdownResult[]> =
      await httpClient.get<InsurancesWithTypesDropdownResult[]>(
        `Patient/getInsurancesWithTypes?groupID=${groupID}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function getPatientMedicalCases(patientID: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<PatientMedicalCaseGridData> =
      await httpClient.get<PatientMedicalCaseGridData>(
        `MedicalCase/getPatientMedicalCases?patientID=${patientID}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function getMedicalCaseLookups() {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<MedicalCaseLookup> =
      await httpClient.get<MedicalCaseLookup>(
        `MedicalCase/getMedicalCaseLookups`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function addMedicalCase(data: MedicalCaseModalData) {
  try {
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/MedicalCase/saveMedicalCase`,
      data
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `Successfully Added Medical Case ${response.data.medicalCaseID}.`,
        toastType: ToastType.SUCCESS,
      })
    );
    return true;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function updateMedicalCase(data: MedicalCaseModalData) {
  try {
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/MedicalCase/updateMedicalCase`,
      data
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `${response.data.message}`,
        toastType: ToastType.SUCCESS,
      })
    );
    return true;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function getMedicalCaseDetailByID(medicalCaseID: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<MedicalCaseModalData> =
      await httpClient.get<MedicalCaseModalData>(
        `MedicalCase/getMedicalCaseDetailByID?medicalCaseID=${medicalCaseID}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function getLinkableClaimsForMedicalCase(
  criteria: GetLinkableClaimsForMedicalCaseCriteria
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<GetLinkableClaimsForMedicalCaseResult[]> =
      await httpClient.get<GetLinkableClaimsForMedicalCaseResult[]>(
        `MedicalCase/getLinkableClaimsForMedicalCase?patientID=${criteria?.patientID}&facilityID=${criteria?.facilityID}&patientInsuranceID=${criteria.patientInsuranceID}&medicalCaseID=${criteria.medicalCaseID}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function linkMedicalCaseWithClaims(
  claimIDS: string,
  medicalCaseID?: number
) {
  try {
    store.dispatch(setAppSpinner(true));
    await httpClient.post<any>(`/MedicalCase/linkMedicalCaseWithClaims`, {
      claimIDS,
      medicalCaseID,
    });
    store.dispatch(setAppSpinner(false));

    return true;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function unlinkMedicalCase(claimID: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/MedicalCase/unlinkMedicalCase?claimID=${claimID}`
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `${response.data.message}`,
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return true;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function deleteMedicalCase(medicalCaseID: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/MedicalCase/deleteMedicalCase?medicalCaseID=${medicalCaseID}`
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `${response.data.message}`,
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return true;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function getMedicalCaseForClaim(
  criteria: GetLinkableClaimsForMedicalCaseCriteria
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<LookupDropdownsDataType[]> =
      await httpClient.get<LookupDropdownsDataType[]>(
        `MedicalCase/getOpenMedicalCaseForClaim?patientID=${criteria?.patientID}&facilityID=${criteria?.facilityID}&patientInsuranceID=${criteria.patientInsuranceID}&medicalCaseID=${criteria.medicalCaseID}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function getRevenueCodesForCPTData(
  practiceID: number | null,
  patientInsuranceID: number | null,
  cptCode: string
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<RevenueCodeDropdownType> =
      await httpClient.get<RevenueCodeDropdownType>(
        `MedicalCase/getRevenueCodesForCPT?practiceID=${practiceID}&patientInsuranceID=${patientInsuranceID}&cptCode=${cptCode}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function getRevenueCrossWalkSearchData(
  searchCriteria: RevenueCrossWalkSearchCriteria
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<RevenueCrossWalkSearchResult[]> =
      await httpClient.get<RevenueCrossWalkSearchResult[]>(
        `MedicalCase/getRevenueCrossWalkSearch?practiceID=${searchCriteria.practiceID}` +
          `&insuranceID=${searchCriteria.insuranceID}` +
          `&cptCode=${searchCriteria.cptCode}` +
          `&revenueCode=${searchCriteria.revenueCode}` +
          `&pageNumber=${searchCriteria.pageNumber}` +
          `&pageSize=${searchCriteria.pageSize}` +
          `&sortColumn=${searchCriteria.sortColumn}` +
          `&sortOrder=${searchCriteria.sortOrder}` +
          `&getAllData=${searchCriteria.getAllData}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    return false;
  }
}
export async function getSearchRevenueCodes(searchValue: string) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<RevenueCodesData[]> = await httpClient.get<
      RevenueCodesData[]
    >(`MedicalCase/getRevenueCodes?searchValue=${searchValue}`);
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function addUpdateCptRevenueCrosswalk(
  data: AddUpdateCptRevenueCrosswalkData
) {
  try {
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/MedicalCase/addUpdateCptRevenueCrosswalk`,
      data
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `${response.data.message}`,
        toastType: ToastType.SUCCESS,
      })
    );
    return true;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function deleteCptRevenueCrosswalk(cptRevenueCrossWalkID: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/MedicalCase/deleteCptRevenueCrosswalk?cptRevenueCrossWalkID=${cptRevenueCrossWalkID}`
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `${response.data.message}`,
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return true;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function getBillType() {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<RevenueCodesData[]> = await httpClient.get<
      RevenueCodesData[]
    >(`Location/getBillType`);
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function getFeeType() {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<LookupDropdownsDataType[]> =
      await httpClient.get<LookupDropdownsDataType[]>(
        `AddEditClaim/getFeeType`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function getClaimUB04PDF(claimID: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<Blob> = await httpClient.get<Blob>(
      `AddEditClaim/viewClaimUB04?claimID=${claimID}`,
      { responseType: 'blob' } // Important for binary data
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : 'Something went wrong';
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message,
        toastType: ToastType.ERROR,
      })
    );
    return null;
  }
}
export async function getPaymentLedgerDetail(paymentLedgerID: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<ClaimDnaPaymentDetails> =
      await httpClient.get<ClaimDnaPaymentDetails>(
        `Repository/getPaymentLedgerDetail?paymentLedgerID=${paymentLedgerID}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function getAutoPopulateClaimsData(patientID: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<AutoPopulateClaimsForPatientsDataResult[]> =
      await httpClient.get<AutoPopulateClaimsForPatientsDataResult[]>(
        `Repository/getAutoPopulateClaimsData?patientID=${patientID}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function getPatientUnappliedAdvancePayment(patientIDS: string) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<PatientUnappliedAdvancePaymentResult[]> =
      await httpClient.get<PatientUnappliedAdvancePaymentResult[]>(
        `Patient/getPatientUnappliedAdvancePayment?patientIDS=${patientIDS}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function applyAdvancePatientPayments(patientIDS: string) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/AddEditClaim/applyAdvancePatientPayments?patientIDS=${patientIDS}`
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `${response.data.message}`,
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return true;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function updateChargeDiagnosisFields(
  data: ChargeDiagnosisFieldsUpdate
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/AddEditClaim/updateChargeDiagnosis`,
      data
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `${response.data.message}`,
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return true;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function savePatientCollectedAdvancePaymentList(
  data: SavePaymentRequestPayload[]
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/AddEditClaim/savePatientCollectedAdvancePaymentList`,
      data
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: `${response.data.message}`,
        toastType: ToastType.SUCCESS,
      })
    );
    store.dispatch(setAppSpinner(false));
    return true;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function getDuplicateWarning(data: GetDuplicateWarningCriteria) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<
      {
        id: number;
        message: string;
      }[]
    > = await httpClient.get<
      {
        id: number;
        message: string;
      }[]
    >(
      `Patient/getDuplicateWarning?practiceID=${data.practiceID}&patientFirstName=${data.patientFirstName}&patientLastName=${data.patientLastName}&patientDateOfBirth=${data.patientDateOfBirth}&patientID=${data.patientID}&dos=${data.dos}&cpt=${data.cpt}&checkDuplicateType=${data.checkDuplicateType}&chargeDOS=${data.chargeDOS}`
    );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function getReferringProvideAsync(groupID: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<ReferringProviderData[]> =
      await httpClient.get<ReferringProviderData[]>(
        `/Repository/getReferringProvider?groupID=${groupID}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function getProviderInforFromNPPES(
  searchCriteria: SearchProviderRequestPayload
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<SearchProviderSuccessPayload[]> =
      await httpClient.get<SearchProviderSuccessPayload[]>(
        `/Reports/getProviderInforFromNPPES?firstName=${searchCriteria.firstName}` +
          `&lastName=${searchCriteria.lastName}` +
          `&taxonomyDescription=${searchCriteria.taxonomyDescription}` +
          `&npi=${searchCriteria.npi}` +
          `&type=${searchCriteria.type}` +
          `&exactMatch=${searchCriteria.exactMatch}` +
          `&state=${searchCriteria.state}` +
          `&zip=${searchCriteria.zip}` +
          `&limit=${searchCriteria.limit}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function fetchActiveProvidersDropdownData(groupID: number) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<ActiveProviderData[]> = await httpClient.get<
      ActiveProviderData[]
    >(`/Repository/getActiveProviders?groupID=${groupID}`);
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
export async function getPatientAccountStatementsDetail(
  searchCriteria: PatientAccountStatementsDetailCriteria
) {
  try {
    store.dispatch(setAppSpinner(true));
    const response: AxiosResponse<PatientAccountStatementsDetailResult[]> =
      await httpClient.get<PatientAccountStatementsDetailResult[]>(
        `/Patient/getPatientTransectionStatement?patientIDs=${searchCriteria.patientIDs}` +
          `&paymentsBy=${searchCriteria.paymentsBy}` +
          `&chargesBy=${searchCriteria.chargesBy}` +
          `&paymentsDateFrom=${searchCriteria.paymentsDateFrom}` +
          `&paymentsDateTo=${searchCriteria.paymentsDateTo}` +
          `&chargesDateFrom=${searchCriteria.chargesDateFrom}` +
          `&chargesDateTo=${searchCriteria.chargesDateTo}`
      );
    store.dispatch(setAppSpinner(false));
    return response.data;
  } catch (e: any) {
    store.dispatch(setAppSpinner(false));
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Something went wrong',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}
// export async function getCPTSearchDataAsyc(
//   searchValue: string,
//   groupID: number
// ) {
//   try {
//     store.dispatch(setAppSpinner(true));
//     const response: AxiosResponse<CPTSearchOutput[]> = await httpClient.get<
//       CPTSearchOutput[]
//     >(
//       `/Repository/getCPTCodes?searchValue=${searchValue}` +
//         `&clientID=${groupID}`
//     );
//     store.dispatch(setAppSpinner(false));
//     return response.data;
//   } catch (e: any) {
//     store.dispatch(setAppSpinner(false));
//     const message = !e.code ? e.message : handleApiError(e);
//     store.dispatch(
//       addToastNotification({
//         id: uuidv4(),
//         text: message || 'Something went wrong',
//         toastType: ToastType.ERROR,
//       })
//     );
//     return false;
//   }
// }
function* sharedSaga() {
  yield all([
    takeLatest(ICD_SEARCH_REQUEST, icdSearchRequestSaga),
    takeLatest(CPT_SEARCH_REQUEST, cptSearchRequestSaga),
    takeLatest(PATIENT_SEARCH_REQUEST, patientSearchRequestSaga),
    takeLatest(GET_LOOKUP_DROPDOWNS_DATA_REQUEST, lookupDropdownsSaga),
    takeLatest(GET_PATIENT_INSURANCE_DATA_REQUEST, patientInsuranceRequestSaga),
    takeLatest(
      GET_CLAIM_PATIENT_INSURANCE_DATA_REQUEST,
      claimPatientInsuranceRequestSaga
    ),
    takeLatest(ASSIGN_CLAIM_TO_DATA_REQUEST, assignClaimToSaga),
    takeLatest(REFERRING_PROVIDER_DATA_REQUEST, referringProviderSaga),
    takeLatest(
      GET_ALL_GLOBLE_SEARCH_RECENTS_DATA_REQUEST,
      getGlobleSearchRecentsSaga
    ),
    takeLatest(GROUP_DATA_REQUEST, getGroupSaga),
    takeLatest(PRACTICE_DATA_REQUEST, getPracticeSaga),
    takeLatest(FACILITY_DATA_REQUEST, getFacilitySaga),
    takeLatest(PROVIDER_DATA_REQUEST, getProviderSaga),
    takeLatest(SAVE_CHARGE_REQUEST, saveChargeSaga),
    takeLatest(SEARCH_PROVIDER_REQUEST, searchProviderRequestSaga),
    takeLatest(BATCH_NUMBER_REQUEST, batchNumberRequestSaga),
    takeLatest(EDIT_CLAIM_REQUEST, editClaimRequestSaga),
    takeLatest(CPT_NDC_REQUEST, cptNdcRequestSaga),
    takeLatest(SAVE_CPT_NDC_REQUEST, saveCptNdcSaga),
    takeLatest(BATCH_DOCUMENT_REQUEST, batchDocumentRequestSaga),
    takeLatest(BATCH_DOCUMENT_PAGE_REQUEST, batchDocumentPageRequestSaga),
    takeLatest(UPDATE_CHARGE_REQUEST, updateChargeSaga),
    takeLatest(SCRUB_CLAIM_REQUEST, claimScrubSaga),
    takeLatest(UPLOAD_DOCUMENT_REQUEST, claimDocumentRequestSaga),
  ]);
}

export default sharedSaga;
