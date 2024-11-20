import type { Selector } from 'reselect';
import { createSelector } from 'reselect';

import type { AppState } from '../rootReducer';
import type {
  AllInsuranceData,
  AppConfigurationType,
  ArManagerOpenAtGlanceData,
  AssignClaimToData,
  BatchDocumentOutput,
  BatchDocumentPageOutput,
  BatchNumberOutput,
  ClaimPatientInsuranceData,
  CPTNDCOutput,
  CPTSearchOutput,
  EditClaimSuccessPayload,
  FacilityData,
  GlobalModalData,
  GlobleSearchRecentsData,
  GroupData,
  ICDSearchOutput,
  LookupDropdownsData,
  PatientInsuranceData,
  PatientSearchOutput,
  PracticeData,
  ProviderData,
  ReferringProviderData,
  RouteHistoryData,
  SaveChargeSuccessPayload,
  SaveClaimSuccessPayload,
  SaveCptNdcSuccessPayload,
  ScrubClaimSuccessPayload,
  SearchProviderSuccessPayload,
  Toast,
  UpdateChargeSuccessPayload,
  UploadedDocumentOutput,
} from './types';

const getLoading = (state: AppState) => state.shared.loading;
const getIsMenuOpen = (state: AppState) => state.shared.isMenuOpen;
const getPatientSearchData = (state: AppState) =>
  state.shared.patientSearchOutput;
const getLookupDropdownsData = (state: AppState) =>
  state.shared.lookupDropdownsData;
const getToastNotifications = (state: AppState) =>
  state.shared.toastNotifications;
const getPatientInsuranceData = (state: AppState) =>
  state.shared.patientInsuranceData;
const getClaimPatientInsuranceData = (state: AppState) =>
  state.shared.claimPatientInsuranceData;
const getAssignClaimToData = (state: AppState) =>
  state.shared.assignClaimToData;
const getReferringProviderData = (state: AppState) =>
  state.shared.referringProviderData;
const getGlobleSearchRecentsData = (state: AppState) =>
  state.shared.globleSearchRecentsData;
const getGroupData = (state: AppState) => state.shared.groupData;
const getPracticeData = (state: AppState) => state.shared.practiceData;
const getFacilityData = (state: AppState) => state.shared.facilityData;
const getProviderData = (state: AppState) => state.shared.providerData;
const getSavedClaimData = (state: AppState) =>
  state.shared.saveClaimSuccessPayload;
const getCPTSearchData = (state: AppState) => state.shared.cptSearchOutput;
const getCPTNdcData = (state: AppState) => state.shared.cptNdcOutput;
const getSavedCptNdcData = (state: AppState) =>
  state.shared.saveCptNdcSuccessPayload;
const getBatchNumberData = (state: AppState) => state.shared.batchNumberOutput;
const getBatchDocumentData = (state: AppState) =>
  state.shared.batchDocumentOutput;
const getBatchDocumentPageData = (state: AppState) =>
  state.shared.batchDocumentPageOutput;
const getSavedChargeData = (state: AppState) =>
  state.shared.saveChargeSuccessPayload;
const getUpdateChargeData = (state: AppState) =>
  state.shared.updateChargeSuccessPayload;
const getSearchProviderData = (state: AppState) =>
  state.shared.searchProviderSuccessPayload;
const getScrubClaimData = (state: AppState) =>
  state.shared.scrubClaimSuccessPayload;
const getICDSearchData = (state: AppState) => state.shared.icdSearchOutput;
const getUploadDocumentData = (state: AppState) =>
  state.shared.uploadedDocumentOutput;
const getEditClaimData = (state: AppState) =>
  state.shared.editClaimSuccessPayload;
const getInsuranceData = (state: AppState) => state.shared.allInsuranceData;
const getArManagerOpenAtGlanceData = (state: AppState) =>
  state.shared.arManagerOpenAtGlanceData;
export const getIsMenuOpenSelector: Selector<AppState, boolean> =
  createSelector(getIsMenuOpen, (user) => user);

export const getToastNotificationsSelector: Selector<AppState, Toast[]> =
  createSelector(
    getToastNotifications,
    (toastNotifications) => toastNotifications
  );
export const getAppSpinnerState: Selector<AppState, number[]> = createSelector(
  (state: AppState) => state.shared.showAppSpinnerRequest,
  (showAppSpinnerRequest) => showAppSpinnerRequest
);
const getSideMenuExpand = (state: AppState) => state.shared.sideBarMenuOpened;
const getScreenInActivityStatus = (state: AppState) =>
  state.shared.isScreenInactive;

const getGlobalModal = (state: AppState) => state.shared.openGlobalModal;
const getRouteHistory = (state: AppState) => state.shared.routeHistory;

export const getRouteHistorySelector: Selector<AppState, RouteHistoryData[]> =
  createSelector(getRouteHistory, (data) => data);
export const getGlobalModalSelector: Selector<
  AppState,
  GlobalModalData | undefined
> = createSelector(getGlobalModal, (data) => data);
export const getExpandSideMenuSelector: Selector<AppState, boolean> =
  createSelector(getSideMenuExpand, (data) => data);
export const getScreenInActivityStatusSelector: Selector<AppState, boolean> =
  createSelector(getScreenInActivityStatus, (data) => data);
export const getAppConfiguration: Selector<AppState, AppConfigurationType> =
  createSelector(
    (state: AppState) => state.shared.appConfiguration,
    (appConfiguration) => appConfiguration
  );
export const getLoadingSelector: Selector<AppState, boolean> = createSelector(
  getLoading,
  (loading) => loading
);
export const getPatientSearchDataSelector: Selector<
  AppState,
  PatientSearchOutput[] | null
> = createSelector(getPatientSearchData, (data) => data);
export const getLookupDropdownsDataSelector: Selector<
  AppState,
  LookupDropdownsData | null
> = createSelector(getLookupDropdownsData, (data) => data);
export const getPatientInsuranceDataSelector: Selector<
  AppState,
  PatientInsuranceData[] | null
> = createSelector(getPatientInsuranceData, (data) => data);
export const getClaimPatientInsuranceDataSelector: Selector<
  AppState,
  ClaimPatientInsuranceData[] | null
> = createSelector(getClaimPatientInsuranceData, (data) => data);
export const getAssignClaimToDataSelector: Selector<
  AppState,
  AssignClaimToData[] | null
> = createSelector(getAssignClaimToData, (data) => data);
export const getReferringProviderDataSelector: Selector<
  AppState,
  ReferringProviderData[] | null
> = createSelector(getReferringProviderData, (data) => data);
export const getGlobleSearchRecentsDataSelector: Selector<
  AppState,
  GlobleSearchRecentsData[] | null
> = createSelector(getGlobleSearchRecentsData, (data) => data);
export const getGroupDataSelector: Selector<AppState, GroupData[] | null> =
  createSelector(getGroupData, (data) => data);
export const getPracticeDataSelector: Selector<
  AppState,
  PracticeData[] | null
> = createSelector(getPracticeData, (data) => data);
export const getFacilityDataSelector: Selector<
  AppState,
  FacilityData[] | null
> = createSelector(getFacilityData, (data) => data);
export const getProviderDataSelector: Selector<
  AppState,
  ProviderData[] | null
> = createSelector(getProviderData, (data) => data);
export const getSavedClaimSelector: Selector<
  AppState,
  SaveClaimSuccessPayload | null
> = createSelector(getSavedClaimData, (data) => data);
export const getCPTSearchDataSelector: Selector<
  AppState,
  CPTSearchOutput[] | null
> = createSelector(getCPTSearchData, (data) => data);
export const getCPTNdcDataSelector: Selector<AppState, CPTNDCOutput[] | null> =
  createSelector(getCPTNdcData, (data) => data);
export const getSearchProviderDataSelector: Selector<
  AppState,
  SearchProviderSuccessPayload[] | null
> = createSelector(getSearchProviderData, (data) => data);
export const getICDSearchDataSelector: Selector<
  AppState,
  ICDSearchOutput[] | null
> = createSelector(getICDSearchData, (data) => data);
export const getClaimDocumentDataSelector: Selector<
  AppState,
  UploadedDocumentOutput[] | null
> = createSelector(getUploadDocumentData, (data) => data);

export const getBatchNumberDataSelector: Selector<
  AppState,
  BatchNumberOutput[] | null
> = createSelector(getBatchNumberData, (data) => data);
export const getBatchDocumentDataSelector: Selector<
  AppState,
  BatchDocumentOutput[] | null
> = createSelector(getBatchDocumentData, (data) => data);
export const getBatchDocumentPageDataSelector: Selector<
  AppState,
  BatchDocumentPageOutput[] | null
> = createSelector(getBatchDocumentPageData, (data) => data);
export const getSavedChargeSelector: Selector<
  AppState,
  SaveChargeSuccessPayload | null
> = createSelector(getSavedChargeData, (data) => data);
export const getUpdateChargeSelector: Selector<
  AppState,
  UpdateChargeSuccessPayload | null
> = createSelector(getUpdateChargeData, (data) => data);
export const getEditClaimResponseSelector: Selector<
  AppState,
  EditClaimSuccessPayload | null
> = createSelector(getEditClaimData, (data) => data);
export const getSavedCptNdcSelector: Selector<
  AppState,
  SaveCptNdcSuccessPayload | null
> = createSelector(getSavedCptNdcData, (data) => data);
export const getScrubClaimSelector: Selector<
  AppState,
  ScrubClaimSuccessPayload | null
> = createSelector(getScrubClaimData, (data) => data);
export const getAllInsuranceDataSelector: Selector<
  AppState,
  AllInsuranceData[]
> = createSelector(getInsuranceData, (data) => data);
export const getArManagerOpenAtGlanceSelector: Selector<
  AppState,
  ArManagerOpenAtGlanceData | null
> = createSelector(getArManagerOpenAtGlanceData, (data) => data);
