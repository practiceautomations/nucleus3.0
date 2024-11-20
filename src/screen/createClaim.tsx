/* eslint-disable no-nested-ternary */
import Tooltip from '@mui/material/Tooltip';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { MultiValue, SingleValue } from 'react-select';
import { v4 as uuidv4 } from 'uuid';

import AutoRenderClaimDataModal from '@/components/AutoRenederClaimDataModal';
import AdditionalFiedlsSection from '@/components/CreateClaimModals/AdditionalFieldsSection';
import SearchProvider from '@/components/CreateClaimModals/SearchProvider';
import GridModal from '@/components/Grid/Modal';
import Icon from '@/components/Icon';
import PageHeader from '@/components/PageHeader';
import PatientDetailModal from '@/components/PatientDetailModal';
import AppDatePicker from '@/components/UI/AppDatePicker';
import Badge from '@/components/UI/Badge';
import Breadcrumbs from '@/components/UI/Breadcrumbs/breadcrumbs';
import Button, { ButtonType } from '@/components/UI/Button';
import ButtonDropdown from '@/components/UI/ButtonDropdown';
import CheckBox from '@/components/UI/CheckBox';
import CloseButton from '@/components/UI/CloseButton';
import InfoToggle from '@/components/UI/InfoToggle';
import InputField from '@/components/UI/InputField';
import InputFieldAmount from '@/components/UI/InputFieldAmount';
import Modal from '@/components/UI/Modal';
import type { MultiSelectGridDropdownDataType } from '@/components/UI/MultiSelectGridDropdown';
import MultiSelectGridDropdown from '@/components/UI/MultiSelectGridDropdown';
import SectionHeading from '@/components/UI/SectionHeading';
import type { SingleSelectDropDownDataType } from '@/components/UI/SingleSelectDropDown';
import SingleSelectDropDown from '@/components/UI/SingleSelectDropDown';
import type { SingleSelectGridDropdownDataType } from '@/components/UI/SingleSelectGridDropdown';
import SingleSelectGridDropDown from '@/components/UI/SingleSelectGridDropdown';
import type { StatusDetailModalDataType } from '@/components/UI/StatusDetailModal';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import AppTable, {
  AppTableCell,
  AppTableRow,
  reOrderData,
} from '@/components/UI/Table';
import TextArea from '@/components/UI/TextArea';
import UploadFile from '@/components/UI/UploadFile';
import ViewNotes, { AddEditViewNotes } from '@/components/ViewNotes';
// eslint-disable-next-line import/no-cycle
import AppLayout from '@/layouts/AppLayout';
import store from '@/store';
import { fetchOrganizationSelectorDataRequest } from '@/store/chrome/actions';
import {
  getErrorSelector,
  getselectdWorkGroupsIDsSelector,
} from '@/store/chrome/selectors';
import type { ProvidersData } from '@/store/chrome/types';
import {
  addToastNotification,
  editClaimRequest,
  fetchAssignClaimToDataRequest,
  fetchBatchDocumentDataRequest,
  fetchBatchDocumentPageDataRequest,
  fetchBatchDocumentPageSuccess,
  fetchBatchDocumentSuccess,
  fetchBatchNumberDataRequest,
  fetchBatchNumberSuccess,
  fetchCPTNdcDataRequest,
  fetchCPTNdcSuccess,
  fetchCPTSearchDataRequest,
  fetchFacilityDataRequest,
  fetchGroupDataRequest,
  fetchPatientInsranceDataRequest,
  fetchPatientInsranceDataSuccess,
  fetchPatientSearchSuccess,
  fetchPracticeDataRequest,
  fetchProviderDataRequest,
  fetchProviderDataSuccess,
  fetchReferringProviderDataSuccess,
  fetchUploadedClaimDocumentDataRequest,
  fetchUploadedClaimDocumentSuccess,
  getLookupDropdownsRequest,
  saveChargesRequest,
  saveCptNdcRequest,
  scrubClaimRequest,
  scrubClaimSuccess,
  updateChargesRequest,
  updateChargeSuccess,
} from '@/store/shared/actions';
import {
  createClaim,
  deleteChargeSaga,
  deleteDocument,
  downloadDocumentBase64,
  fetchClaimDataByID,
  fetchPostingDate,
  getChargesFee,
  getDuplicateWarning,
  getMedicalCaseForClaim,
  getReferringProvideAsync,
  getRevenueCodesForCPTData,
  getSearchRevenueCodes,
  icdSearchRequest,
  savePatientCollectedAdvancePaymentList,
  searchPatientAsyncAPI,
  submitClaim,
  updateChargeSortOrder,
  updateClaimDocumentEAttachment,
  uploadFile,
} from '@/store/shared/sagas';
import {
  getAssignClaimToDataSelector,
  getBatchDocumentDataSelector,
  getBatchDocumentPageDataSelector,
  getBatchNumberDataSelector,
  getClaimDocumentDataSelector,
  getCPTNdcDataSelector,
  getCPTSearchDataSelector,
  getEditClaimResponseSelector,
  getExpandSideMenuSelector,
  getFacilityDataSelector,
  getGroupDataSelector,
  getLookupDropdownsDataSelector,
  getPatientInsuranceDataSelector,
  getPracticeDataSelector,
  getProviderDataSelector,
  getSavedChargeSelector,
  getSavedCptNdcSelector,
  getScrubClaimSelector,
  getUpdateChargeSelector,
} from '@/store/shared/selectors';
import type {
  AdditionalFiedlsPayload,
  BatchNumberCriteria,
  ChargeFeeCriteria,
  ChargeFeeOutput,
  ClaimDataByClaimIDResult,
  CPTNDCOutput,
  CPTSearchCriteria,
  CPTSearchOutput,
  FacilityData,
  GetDuplicateWarningCriteria,
  GetLinkableClaimsForMedicalCaseCriteria,
  PatientInsuranceData,
  PatientSearchCriteria,
  PatientSearchOutput,
  PostingDateCriteria,
  ReferringProviderData,
  RevenueCodesData,
  RouteHistoryData,
  SaveChargeRequestPayload,
  SaveClaimChargePaymentRequestPayload,
  SaveClaimRequestPayload,
  SaveClaimSuccessPayload,
  SaveCptNdcRequestPayload,
  SavePaymentRequestPayload,
  ScrubClaimData,
  UploadedDocumentCriteria,
  UploadedDocumentOutput,
} from '@/store/shared/types';
import { ToastType } from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';
import {
  DateToStringPipe,
  StringToDatePipe,
} from '@/utils/dateConversionPipes';
import useOnceEffect from '@/utils/useOnceEffect';

export interface ChargesData {
  charge: SaveChargeRequestPayload | undefined;
  isEditMode: boolean;
}
export interface NdcData {
  ndcRowsData: CPTNDCOutput | null;
  isChecked: boolean;
  isDisabled: boolean;
}
export interface IcdData {
  icd10Code: string | undefined;
  order: number | undefined;
  description?: string | undefined;
  selectedICDObj?:
    | SingleValue<SingleSelectGridDropdownDataType>
    | undefined
    | null;
  searchValue?: string;
  data?: SingleSelectGridDropdownDataType[];
}
interface Tprops {
  reRenderScreen: () => void;
  selectedClaimID: number | undefined;
}
export default function CreateClaim({
  reRenderScreen,
  selectedClaimID,
}: Tprops) {
  // API Calls
  const [patientsearch, setPatientsearch] = useState<PatientSearchCriteria>({
    searchValue: '',
    groups: [],
    practices: [],
    facilities: [],
    providers: [],
  });
  const [chargeDragOverIndex, setChargeDragOverIndex] = useState<number>();
  const selectedWorkGroupData = useSelector(getselectdWorkGroupsIDsSelector);
  useEffect(() => {
    if (selectedWorkGroupData) {
      setPatientsearch({
        ...patientsearch,
        groups:
          selectedWorkGroupData.groupsData &&
          selectedWorkGroupData.groupsData.length > 0
            ? selectedWorkGroupData.groupsData.map((m) => m.id)
            : [],
        practices:
          selectedWorkGroupData.practicesData &&
          selectedWorkGroupData.practicesData.length > 0
            ? selectedWorkGroupData.practicesData.map((m) => m.id)
            : [],
        facilities:
          selectedWorkGroupData.facilitiesData &&
          selectedWorkGroupData.facilitiesData.length > 0
            ? selectedWorkGroupData.facilitiesData.map((m) => m.id)
            : [],
        providers:
          selectedWorkGroupData.providersData &&
          selectedWorkGroupData.providersData.length > 0
            ? selectedWorkGroupData.providersData.map((m) => m.id)
            : [],
      });
    }
  }, [selectedWorkGroupData]);
  const [patientSearchData, setPatientSearchData] = useState<
    PatientSearchOutput[]
  >([]);
  const [selectedPatient, setSelectedPatient] = useState<
    SingleSelectDropDownDataType | undefined
  >();
  const dispatch = useDispatch();
  const getSearchPatient = async () => {
    const res = await searchPatientAsyncAPI(patientsearch);
    if (res) {
      const filteredPatients = res.filter((m) => m.active === true);
      setPatientSearchData(filteredPatients || []);
      if (filteredPatients.length === 0) {
        setSelectedPatient(undefined);
      }
    }
  };
  useOnceEffect(() => {
    if (patientsearch.searchValue !== '') {
      if (selectedWorkGroupData !== null) {
        getSearchPatient();
      } else {
        dispatch(
          addToastNotification({
            id: uuidv4(),
            text: 'Please Select a Group/Workgroup from Organization Selector',
            toastType: ToastType.ERROR,
          })
        );
        patientsearch.searchValue = '';
      }
    }
  }, [patientsearch.searchValue]);
  const isMenuOpened = useSelector(getExpandSideMenuSelector);
  const [btnClass, setBtnClass] = useState('fixed bottom-0 bg-gray-200 pr-16');
  const initProfile = () => {
    dispatch(getLookupDropdownsRequest());
    dispatch(fetchOrganizationSelectorDataRequest());
    dispatch(fetchGroupDataRequest());
  };
  useEffect(() => {
    initProfile();
  }, []);
  // Selector Calls
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<
    string | undefined
  >();
  const [scrubClaimIcon, setScrubClaimIcon] = useState<string>('desktop');
  const [scrubClaimStatus, setScrubClaimStatus] = useState<string | undefined>(
    'Unscrubbed'
  );
  const [submitClaimStatus, setSubmitClaimStatus] = useState<
    string | undefined
  >('New / Draft');
  const [claimType, setClaimType] = useState<string | undefined>('Primary');
  const [scrubClaimClass, setScrubClaimClass] = useState<string>(
    'bg-gray-100 text-gray-800'
  );
  const [scrubClaimIconColor, setScrubClaimIconColor] = useState<IconColors>(
    IconColors.GRAY
  );
  // const patientSearchData = useSelector(getPatientSearchDataSelector);

  const lookupsData = useSelector(getLookupDropdownsDataSelector);
  const [selectedSubscriberRelation, setSelectedSubscriberRelation] =
    useState<string>();
  const [selectedAssignmentBelongsTo, setSelectedAssignmentBelongsTo] =
    useState<SingleSelectDropDownDataType | undefined>();
  const [primaryInsuranceData, setPrimaryInsuranceData] = useState<
    PatientInsuranceData[] | undefined
  >();

  const [chargesRow, setChargesRow] = useState<ChargesData[] | undefined>([]);
  // const [origChargesRow, setOrigChargesRow] = useState<ChargesData[] | undefined>([]);
  const [showAddChargesRow, setshowAddChargesRow] = useState(true);
  const assignClaimToData = useSelector(getAssignClaimToDataSelector);
  const [chargeFee, setChargeFee] = useState<ChargeFeeOutput>();
  // Patient Selection Based

  const [selectedGroup, setSelectedGroup] = useState<
    SingleSelectDropDownDataType | undefined
  >();
  const [selectedPractice, setSelectedPractice] = useState<
    SingleSelectDropDownDataType | undefined
  >();
  const [selectedPlaceOfService, setSelectedPlaceOfService] = useState<
    SingleSelectDropDownDataType | undefined
  >();
  const [supervisingProviderData, setSupervisingProviderData] = useState<
    ProvidersData[] | undefined
  >();
  const [referringProviderData, setReferringProviderData] = useState<
    ReferringProviderData[]
  >([]);
  const [selectedSupervisingProvider, setSelectedSupervisingProvider] =
    useState<SingleSelectDropDownDataType | undefined>();
  const [selectedPatientData, setSelectedPatientData] = useState<
    PatientSearchOutput | undefined
  >();
  // Save Charges Api Call
  const [batchNumber, setbatchNumber] = useState<
    SingleValue<SingleSelectGridDropdownDataType> | undefined
  >(undefined);
  const [batchDocument, setbatchDocument] = useState<
    SingleValue<SingleSelectGridDropdownDataType> | undefined
  >(undefined);
  const [batchDocumentPage, setbatchDocumentPage] = useState<
    SingleValue<SingleSelectGridDropdownDataType> | undefined
  >(undefined);
  const [postingDate, setPostingDate] = useState<Date | null>(new Date());
  const [claimID, setClaimID] = useState<number | null>();
  const [selectedChargeFee, setSelectedChargeFee] = useState<number>();
  const [savedCharges, setSavedCharges] = useState<
    SaveChargeRequestPayload | undefined
  >();
  const [dosageForm, setDosageForm] = useState<
    SingleValue<SingleSelectGridDropdownDataType> | undefined
  >(undefined);
  const [ndcCode, setNDCCode] = useState<string | ''>();
  const [chargesFromDOS, setChargesFromDOS] = useState<Date | null>();
  const [chargeUnits, setChargeUnits] = useState<number | undefined>(1);
  const [chargeNdcUnits, setChargeNdcUnits] = useState<number | undefined>(1);
  const [chargeNdcDescription, setChargeNdcDescription] = useState<
    string | undefined
  >();
  const [selectedNdc, setselectedNdc] = useState<string | null>();
  const [insResp, setInsResp] = useState<number | undefined>();
  const [patResp, setPatResp] = useState<number | undefined>();
  const [chargesToDOS, setChargesToDOS] = useState<Date | null>();
  const [selectedModifier1, setSelectedModifier1] = useState<
    SingleValue<SingleSelectGridDropdownDataType> | undefined
  >();
  const [selectedModifier2, setSelectedModifier2] = useState<
    SingleValue<SingleSelectGridDropdownDataType> | undefined
  >();
  const [selectedModifier3, setSelectedModifier3] = useState<
    SingleValue<SingleSelectGridDropdownDataType> | undefined
  >();
  const [selectedModifier4, setSelectedModifier4] = useState<
    SingleValue<SingleSelectGridDropdownDataType> | undefined
  >();
  const [dateOfPayment, setDateOfPayment] = useState<Date | null>(new Date());
  const [advancePaymentAmount, setAdvancePaymentAmount] = useState<string>();
  const providersData = useSelector(getProviderDataSelector);
  const [fromDOS, setfromDOS] = useState<Date | null>(new Date());
  const [toDOS, setToDOS] = useState<Date | null>();
  const [admissionDate, setAdmissionDate] = useState<Date | null>();
  const [selectedClaimStatus, setSelectedClaimStatus] = useState<
    string | undefined
  >('Draft Claim');
  const formatNDC = (value: string) => {
    const cleaned = `${value}`.replace(/\D/g, '');
    const normValue = `${cleaned.substring(0, 5)}${
      cleaned.length > 5 ? '-' : ''
    }${cleaned.substring(5, 9)}${
      cleaned.length > 9 ? '-' : ''
    }${cleaned.substring(9, 11)}`;
    return normValue;
  };
  // Note SEction
  const [noteSliderOpen, setNoteSliderOpen] = useState(false);
  const [viewNoteskey, setViewNoteskey] = useState(uuidv4());
  // ICD-10 Section
  // const [showAddICDRow, setshowAddICDRow] = useState(true);
  // const [addICDDescription, setAddICDDescription] = useState<
  //   string | undefined
  // >();
  const [icdCollapse, setICDCollapse] = useState(false);
  // const [selectedICDCode, setSelctedICDCode] = useState<
  //   SingleValue<SingleSelectGridDropdownDataType> | undefined
  // >();
  const [icdOrderCount, setIcdOrderCount] = useState(1);
  const [icdRows, setIcdRows] = useState<IcdData[]>([
    {
      icd10Code: '',
      order: 1, // Increment the order based on the current length
      description: undefined,
      selectedICDObj: null,
      searchValue: '',
      data: [],
    },
  ]);
  // const [icdSearch, setIcdSearch] = useState<ICDSearchCriteria>({
  //   searchValue: '',
  // });
  // const [icdSearchData, setIcdSearchData] = useState<ICDSearchOutput[]>([]);

  // const getIcdSearch = async (text?: string) => {
  //   if (text) {
  //     const res = await icdSearchRequest(text);
  //     debugger;
  //     if (res) {
  //       setTimeout(() => {
  //         setIcdSearchData(res);
  //         setSelctedICDCode(res[0]);
  //         setIcdOrderCount(icdOrderCount + 1);
  //         setAddICDDescription('');
  //         setshowAddICDRow(false);
  //         icdRows?.push({
  //           order: icdOrderCount || undefined,
  //           icd10Code: res[0] && res[0].value ? res[0].value : undefined,
  //           description: res[0]?.appendText ? res[0]?.appendText : undefined,
  //           data: res,
  //           selectedICDObj: res[0] || undefined,
  //           searchValue: icdSearch.searchValue,
  //         });
  //         setSelctedICDCode(null);
  //       }, 100);
  //     }
  //   }
  // };
  const [selectedICDs, setSelectedICDs] = useState<IcdData[]>([]);
  const searchIcds = async (value: IcdData) => {
    if (value.searchValue) {
      const res = await icdSearchRequest(value.searchValue);
      if (res) {
        setIcdRows((prevIcdRows) => {
          let updatedIcdRows: IcdData[] = [];
          if (prevIcdRows) {
            const existingRowIndex = prevIcdRows.findIndex(
              (icdRow) => icdRow.order === value.order
            );

            if (existingRowIndex > -1) {
              updatedIcdRows = prevIcdRows.map((icdRow, index) => {
                if (index === existingRowIndex) {
                  return {
                    ...icdRow,
                    searchValue: value.searchValue,
                    icd10Code: res[0]?.value,
                    data: res, // Update with appropriate field from 'res'
                    selectedICDObj: res[0], // type === 'auto' ? res[0] : undefined,
                    description: res[0]?.appendText,
                  };
                }
                return icdRow;
              });
            } else {
              updatedIcdRows = [
                ...prevIcdRows,
                {
                  order: value.order,
                  icd10Code: value.icd10Code,
                  searchValue: value.searchValue,
                  data: res, // Update with appropriate field from 'res'
                  selectedICDObj: res[0], // type === 'auto' ? res[0] : undefined,
                  description: res[0]?.appendText,
                },
              ];
            }
          }

          // Sort the updatedIcdRows array by the order property
          const sortedIcdRows = updatedIcdRows.sort(
            (a, b) => (a.order ?? 0) - (b.order ?? 0)
          );

          // Update the icdOrderCount to reflect the highest order value
          const newOrderCount =
            sortedIcdRows.length > 0
              ? (sortedIcdRows[sortedIcdRows.length - 1]?.order ?? 0) + 1
              : 1;
          setIcdOrderCount(newOrderCount);

          return sortedIcdRows;
        });
      }
    }
  };

  useEffect(() => {
    if (selectedICDs.length) {
      selectedICDs.forEach((icd) =>
        searchIcds({
          icd10Code: icd.icd10Code,
          order: icd.order,
          searchValue: icd.searchValue,
        } as IcdData)
      );
    }
  }, [selectedICDs]);

  const updateICDArray = (
    order: number | undefined,
    updatedIcd: SingleValue<SingleSelectGridDropdownDataType>
  ) => {
    setIcdRows(() => {
      return icdRows?.map((row) => {
        if (row.order === order) {
          return {
            ...row,
            icd10Code: updatedIcd?.value,
            selectedICDObj: updatedIcd,
            description: updatedIcd?.appendText,
          };
        }
        return row;
      });
    });
  };
  // const icdSearchData = useSelector(getICDSearchDataSelector);
  const uploadDocumentData = useSelector(getClaimDocumentDataSelector);
  // Charges Section Api Calls
  const [cptSearch, setCptSearch] = useState<CPTSearchCriteria>({
    searchValue: '',
    clientID: null,
  });
  const [revenueSearch, setRevenueSearch] = useState<string>('');
  const [batchSearch, setBatchSearch] = useState<BatchNumberCriteria>({
    searchValue: '',
    clientID: null,
  });
  const [selectedChargePOS, setSelectedChargePOS] = useState<
    SingleValue<SingleSelectGridDropdownDataType> | undefined
  >();
  const cptSearchDataValue = useSelector(getCPTSearchDataSelector);
  const [cptSearchData, setCptSearchData] = useState<CPTSearchOutput[] | null>(
    null
  );
  useEffect(() => {
    if (cptSearchDataValue) {
      setCptSearchData(cptSearchDataValue);
    }
  }, [cptSearchDataValue]);
  const cptNdcData = useSelector(getCPTNdcDataSelector);
  const batchSearchData = useSelector(getBatchNumberDataSelector);
  const batchDocumentData = useSelector(getBatchDocumentDataSelector);
  const batchDocumentPageData = useSelector(getBatchDocumentPageDataSelector);
  const [selectedCpt, setSelectedCpt] = useState<
    SingleValue<SingleSelectGridDropdownDataType> | undefined
  >(undefined);
  const [selectedReasonOfPayment, setSelectedReasonOfPayment] = useState<
    SingleValue<SingleSelectGridDropdownDataType> | undefined
  >();
  const [selectedMethod, setSelectedMethod] = useState<
    SingleValue<SingleSelectGridDropdownDataType> | undefined
  >();
  const [selectedattachmentType, setSelectedAttachmentType] = useState<
    SingleSelectDropDownDataType | undefined
  >();
  const [selectedFacility, setSelectedFacility] = useState<
    SingleSelectDropDownDataType | undefined
  >();
  const [selectedRenderingProvider, setSelectedRenderingProvider] = useState<
    SingleSelectDropDownDataType | undefined
  >();
  const [selectedReferringProvider, setSelectedReferringProvider] = useState<
    SingleSelectDropDownDataType | undefined
  >();
  const [updateCptNdc, setUpadteCptNdc] = useState(false);
  const claimsSubmittingResponse = useRef<StatusDetailModalDataType[]>([]);
  const [submitModalState, setSubmitModalState] = useState<{
    open: boolean;
    heading: string;
    description: string;
    bottomDescription: string;
    okButtonText: string;
    closeButtonText: string;
    statusModalType: StatusModalType;
    closeButtonColor: ButtonType;
    okButtonColor: ButtonType;
    showCloseButton: boolean;
    closeOnClickOutside: boolean;
    statusData: StatusDetailModalDataType[];
  }>({
    open: false,
    heading: '',
    description: '',
    bottomDescription: '',
    okButtonText: '',
    closeButtonText: '',
    statusModalType: StatusModalType.ERROR,
    closeButtonColor: ButtonType.primary,
    okButtonColor: ButtonType.secondary,
    showCloseButton: true,
    closeOnClickOutside: true,
    statusData: [],
  });
  const [statusModalInfo, setStatusModalInfo] = useState<{
    show: boolean;
    showCloseButton?: boolean;
    heading: string;
    text: string;
    type: StatusModalType;
    confirmType?: string;
    okButtonText?: string;
    okButtonColor?: ButtonType;
    closeButtonText?: string;
    cancelSaveType?: string;
    saveCriteria?: any;
  }>({
    show: false,
    heading: '',
    text: '',
    type: StatusModalType.WARNING,
  });
  const [selectedAdditionalFields, setSelectedAdditionalFields] =
    useState<AdditionalFiedlsPayload>({
      dischargeDate: null,
      currentIllnessDate: null,
      disabilityBeginDate: null,
      disabilityEndDate: null,
      firstSymptomDate: null,
      initialTreatmentDate: null,
      lmpDate: null,
      lastSeenDate: null,
      lastXrayDate: null,
      simillarIllnesDate: null,
      responsibilityDate: null,
      accidentDate: null,
      admissionDate: null,
      emg: null,
      accidentTypeID: null,
      accidentStateID: null,
      labCharges: null,
      delayReason: null,
      epsdtConditionID: null,
      serviceAuthExcepID: null,
      specialProgramIndicatorID: null,
      orderingProviderID: null,
      box19: null,
      comments: null,
      originalRefenceNumber: null,
      claimFrequencyID: null,
      conditionCodeID: null,
      pwkControlNumber: null,
      transmissionCodeID: null,
      attachmentTypeID: null,
    });
  // Assign User Notes
  const [assignUserNote, setAssignUserNote] = useState<string | null>();
  const [selectedAssignClaimTo, setSelectedAssignClaimTo] = useState<
    SingleSelectDropDownDataType | undefined
  >();
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [panNumber, setPANNumber] = useState<string | null>();
  useEffect(() => {
    setSelectedChargePOS(selectedPlaceOfService);
  }, [selectedPlaceOfService]);
  // useOnceEffect(() => {
  //   if (cptSearch.searchValue !== '') {
  //     if (cptSearch.clientID !== null) {
  //       dispatch(fetchCPTSearchDataRequest(cptSearch));
  //     } else {
  //       dispatch(
  //         addToastNotification({
  //           id: uuidv4(),
  //           text: 'Please Select a Patient',
  //           toastType: ToastType.ERROR,
  //         })
  //       );
  //       cptSearch.searchValue = '';
  //     }
  //   }
  // }, [cptSearch.searchValue]);
  const handleSearch = (value: string) => {
    setCptSearch({
      searchValue: value,
      clientID: selectedPatientData?.groupID || null,
    });
    if (value !== '' && selectedPatientData?.groupID) {
      const cptSearchCriteria: CPTSearchCriteria = {
        searchValue: value,
        clientID: selectedPatientData?.groupID,
      };
      dispatch(fetchCPTSearchDataRequest(cptSearchCriteria));
    } else {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Please Select a Patient',
          toastType: ToastType.ERROR,
        })
      );
    }
  };
  useOnceEffect(() => {
    if (selectedCpt && selectedPractice) {
      const ndcData = {
        cptCode: selectedCpt.value,
        practiceID: selectedPractice.id,
      };
      dispatch(fetchCPTNdcDataRequest(ndcData));
    }
  }, [selectedCpt, selectedPractice]);
  useOnceEffect(() => {
    if (batchSearch.clientID !== null) {
      dispatch(fetchBatchNumberDataRequest(batchSearch));
    }
  }, [batchSearch.clientID, batchSearch.searchValue]);
  useOnceEffect(() => {
    if (batchNumber !== undefined) {
      setbatchDocument(undefined);
      const obj = {
        chargeBatchID: batchNumber ? batchNumber?.id : undefined,
        getInactive: false,
      };
      dispatch(fetchBatchDocumentDataRequest(obj));
    }
  }, [batchNumber]);
  useOnceEffect(() => {
    if (batchDocument !== undefined) {
      setbatchDocumentPage(undefined);
      const obj = {
        documentID: batchDocument ? batchDocument?.id : undefined,
      };
      dispatch(fetchBatchDocumentPageDataRequest(obj));
    }
  }, [batchDocument]);
  const [selectedClaimData, setSelectedClaimData] =
    useState<ClaimDataByClaimIDResult | null>();
  const getClaimDataByID = async (id: number) => {
    const res = await fetchClaimDataByID(id);
    if (res) {
      setBatchSearch({
        ...batchSearch,
        clientID: res.groupID,
      });
    }
    setSelectedClaimData(res);
    setIsEditMode(true);
  };
  useEffect(() => {
    if (selectedClaimID) {
      getClaimDataByID(selectedClaimID);
    }
  }, [selectedClaimID]);

  // referral number input field
  const [referelNumber, setReferelNumber] = useState<string | null>();
  const [showAddAdvancePaymentRow, setshowAddAdvancePaymentRow] =
    useState(false);
  const advancePaymentHeader = [
    'Reason of Payment',
    'Amount',
    'Method',
    'Date of Payment',
  ];
  interface AdvancePaymentData {
    id?: number;
    reasonOfPayment?: SingleValue<SingleSelectGridDropdownDataType>;
    amount: number;
    method: SingleValue<SingleSelectGridDropdownDataType>;
    dateOfPayment: any | null;
    isEditMode?: boolean;
  }
  const [advancePaymentRows, setAdvancePaymentRows] = useState<
    AdvancePaymentData[] | undefined
  >([]);
  const [advancePaymentData, setAdvancePaymentData] = useState<
    SavePaymentRequestPayload[] | undefined
  >([]);
  const AdvancePaymentValidation = (paymentData: AdvancePaymentData) => {
    let isValid = true;
    if (!selectedPatient) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Please Select Patient',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
      return isValid;
    }
    if (paymentData.reasonOfPayment === null) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Please Select Reason Of Payment',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (paymentData.amount === 0) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Please Select Amount',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (paymentData.method === null) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Please Select Method',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (paymentData.dateOfPayment === null) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Please Select Date Of Payment',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    return isValid;
  };
  const getClaimDocumentData = () => {
    const getDocCriteria: UploadedDocumentCriteria = {
      claimID,
      groupID: selectedGroup ? selectedGroup.id : undefined,
      categoryID: undefined,
    };
    dispatch(fetchUploadedClaimDocumentDataRequest(getDocCriteria));
  };
  const saveAdvancePayment = (value: any) => {
    if (value) {
      advancePaymentData?.push({
        appointmentID: null,
        patientID: selectedPatient ? selectedPatient.id : null,
        dos: fromDOS ? DateToStringPipe(fromDOS, 1) : null,
        ledgerAccounID: value.reasonOfPayment ? value.reasonOfPayment.id : null,
        amount: value?.amount ? Number(value?.amount) : null,
        paymentTypeID: value.method ? value.method.id : null,
        paymentDate: value.dateOfPayment
          ? DateToStringPipe(value.dateOfPayment, 1)
          : null,
        paymentNumber: null,
        comments: null,
      });
    }
    if (advancePaymentData) {
      setAdvancePaymentData(advancePaymentData);
    }
  };
  useEffect(() => {
    if (selectedClaimData) {
      setSelectedPatient({
        id: selectedClaimData.patientID,
        value: selectedClaimData.patientName,
      });
      const selectedRendProvider = providersData?.filter(
        (m) => m.id === selectedClaimData.providerID
      )[0];
      const selectedSupProvider = providersData?.filter(
        (m) => m.id === selectedClaimData.supervisingProviderID
      )[0];
      const selectedAssignmentBelong = lookupsData?.assignmentBelongsTo.filter(
        (m) => m.id === selectedClaimData.assignmentBelongsToID
      )[0];
      const selectedScrubClaimStatus = lookupsData?.scrubStatus.filter(
        (m) => m.id === selectedClaimData.scrubStatusID
      )[0];
      const selectedClaimStatuss = lookupsData?.claimStatus.filter(
        (m) => m.id === selectedClaimData.claimStatusID
      )[0];
      const selectedSubmitStatuss = lookupsData?.submitStatus.filter(
        (m) => m.id === selectedClaimData.submitStatusID
      )[0];
      setSubmitClaimStatus(selectedSubmitStatuss?.value);
      setSelectedClaimStatus(selectedClaimStatuss?.value);
      setScrubClaimStatus(selectedScrubClaimStatus?.value);
      setAssignUserNote(selectedClaimData.assignUserNote);
      setSelectedRenderingProvider(selectedRendProvider);
      setSelectedSupervisingProvider(selectedSupProvider);
      setReferelNumber(
        selectedClaimData.referralNumber
          ? selectedClaimData.referralNumber.toString()
          : ''
      );
      setSelectedAssignmentBelongsTo(selectedAssignmentBelong);
      setPANNumber(selectedClaimData.panNumber?.toString());
      setfromDOS(StringToDatePipe(selectedClaimData.dosFrom));
      setToDOS(
        selectedClaimData.dosTo
          ? StringToDatePipe(selectedClaimData.dosTo)
          : null
      );
      setAdmissionDate(
        selectedClaimData.additionalFieldsData.admissionDate
          ? new Date(selectedClaimData.additionalFieldsData.admissionDate)
          : null
      );
      const icdsRows = selectedClaimData.icds?.map((m) => {
        return {
          icd10Code: m.code,
          order: m.order,
          description: m.description,
          selectedICDObj: { id: m.id, value: m.code },
        };
      });
      // setshowAddICDRow(false);
      setIcdRows(icdsRows);
      setIcdOrderCount(icdsRows.length + 1);
      setSelectedAdditionalFields(selectedClaimData.additionalFieldsData);
      setClaimID(selectedClaimID);
      if (
        selectedClaimData &&
        selectedClaimData?.groupID &&
        selectedClaimData.claimID
      ) {
        const getDocCriteria: UploadedDocumentCriteria = {
          claimID: selectedClaimData ? selectedClaimData.claimID : undefined,
          groupID: selectedClaimData ? selectedClaimData.groupID : undefined,
          categoryID: undefined,
        };
        dispatch(fetchUploadedClaimDocumentDataRequest(getDocCriteria));
      }
      const chargesEditRows: SaveChargeRequestPayload[] =
        selectedClaimData.charges?.map((m) => {
          return {
            chargeID: m.chargeID,
            claimID: selectedClaimData.claimID,
            groupID: selectedClaimData.groupID,
            fromDOS: m.fromDOS,
            toDOS: m.toDOS,
            cptCode: m.cptCode,
            units: m.units,
            mod1: m.mod1,
            mod2: m.mod2,
            mod3: m.mod3,
            mod4: m.mod4,
            placeOfServiceID: m.placeOfServiceID,
            icd1: m.icd1,
            icd2: m.icd2,
            icd3: m.icd3,
            icd4: m.icd4,
            ndcNumber: m.ndcNumber,
            ndcUnit: m.ndcUnit,
            ndcUnitQualifierID: m.ndcUnitQualifierID,
            serviceDescription: m.serviceDescription,
            fee: m.fee,
            insuranceAmount: m.insuranceAmount,
            patientAmount: m.patientAmount,
            chargeBatchID: m.chargeBatchID,
            chargePostingDate: m.chargePostingDate,
            systemDocumentID: m.systemDocumentID,
            pageNumber: m.pageNumber,
            pointers: m.pointers,
            sortOrder: m.sortOrder,
            revenueCode: m.revenueCode,
          };
        });
      if (selectedClaimData.charges && selectedClaimData.charges.length > 0) {
        setshowAddChargesRow(false);
      }
      setChargesRow(() => {
        return chargesEditRows?.map((chargeRow) => {
          if (chargeRow.systemDocumentID) {
            const obj = {
              chargeBatchID: chargeRow ? chargeRow?.chargeBatchID : null,
              getInactive: false,
            };
            dispatch(fetchBatchDocumentDataRequest(obj));
          }
          return { charge: chargeRow, isEditMode: true };
        });
      });
    }
    if (selectedClaimData?.claimTypeID) {
      const claimTypeData = lookupsData?.claimType
        .filter((a) => a.id === selectedClaimData?.claimTypeID)
        .map((a) => a.value);
      const claimTypeVal = claimTypeData ? claimTypeData[0] : 'Primary';
      setClaimType(claimTypeVal);
    }
  }, [selectedClaimData]);

  const [isAdvancePaymentValid, setIsAdvancePaymentValid] =
    useState<boolean>(false);
  useEffect(() => {
    if (selectedClaimData && selectedPatient) {
      if (selectedClaimData.advancePayments && lookupsData !== null) {
        for (let i = 0; i < selectedClaimData.advancePayments.length; i += 1) {
          if (selectedClaimData.advancePayments[i]?.amount) {
            setAdvancePaymentAmount(
              selectedClaimData.advancePayments[i]?.amount?.toString()
            );
          }
          const dateOfPaymentt =
            selectedClaimData.advancePayments[i]?.paymentDate;
          if (dateOfPaymentt) {
            setDateOfPayment(new Date(dateOfPaymentt));
          }
          const selectedReasonOfPaymentt = lookupsData?.reasonOfPayment.filter(
            (m) => m.id === selectedClaimData.advancePayments[i]?.ledgerAccounID
          )[0];
          setSelectedReasonOfPayment(selectedReasonOfPaymentt);
          setSelectedMethod(
            lookupsData?.method.filter(
              (m) =>
                m.id === selectedClaimData.advancePayments[i]?.paymentTypeID
            )[0]
          );
        }
      }
    }
  }, [selectedPatient, lookupsData]);
  useEffect(() => {
    if (
      selectedReasonOfPayment &&
      advancePaymentAmount &&
      selectedMethod &&
      dateOfPayment
    ) {
      const isPaymentValid = AdvancePaymentValidation({
        reasonOfPayment: selectedReasonOfPayment || null,
        amount: advancePaymentAmount ? Number(advancePaymentAmount) : 0,
        method: selectedMethod || null,
        dateOfPayment: dateOfPayment || null,
      });
      setIsAdvancePaymentValid(isPaymentValid);
    }
  }, [selectedReasonOfPayment]);
  useEffect(() => {
    if (isAdvancePaymentValid === true) {
      if (selectedClaimData?.advancePayments.length) {
        const autoPopulateAdvancePaymentRowData =
          selectedClaimData?.advancePayments.map((m) => {
            return {
              reasonOfPayment: lookupsData?.reasonOfPayment.filter(
                (n) => n.id === m.ledgerAccounID
              )[0] as SingleValue<SingleSelectGridDropdownDataType>,
              amount: m.amount ? m.amount : 0,
              method: lookupsData?.method.filter(
                (n) => n.id === m.paymentTypeID
              )[0] as SingleValue<SingleSelectGridDropdownDataType>,
              dateOfPayment: m.paymentDate ? new Date(m.paymentDate) : null,
              isEditMode: true,
            };
          });
        setAdvancePaymentRows(autoPopulateAdvancePaymentRowData);
      }
      setshowAddAdvancePaymentRow(false);
      saveAdvancePayment({
        reasonOfPayment: selectedReasonOfPayment || null,
        amount: advancePaymentAmount || null,
        method: selectedMethod || null,
        dateOfPayment: dateOfPayment || null,
      });
    }
  }, [isAdvancePaymentValid]);
  // useEffect(() => {
  //   if (icdSearch.searchValue !== '') {
  //     // searchIcds(icdSearch.searchValue);
  //   }
  // }, [icdSearch.searchValue]);
  const getReferringProviderData = async (groupID: number) => {
    const res = await getReferringProvideAsync(groupID);
    if (res) {
      setReferringProviderData(res);
    }
  };
  useOnceEffect(() => {
    if (selectedPatient?.id) {
      dispatch(
        fetchPatientInsranceDataRequest({ patientID: selectedPatient.id })
      );
      const selectedPatientFiltered = patientSearchData?.filter(
        (m) => m.id === selectedPatient?.id
      )[0];
      if (selectedPatientFiltered) {
        const newIcdRows: IcdData[] = [];

        if (selectedPatientFiltered.icd1 !== null) {
          setIcdRows([]);
          newIcdRows.push({
            icd10Code: selectedPatientFiltered.icd1,
            order: 1,
            searchValue: selectedPatientFiltered.icd1,
          });
        }

        if (selectedPatientFiltered.icd2 !== null)
          newIcdRows.push({
            icd10Code: selectedPatientFiltered.icd2,
            order: 2,
            searchValue: selectedPatientFiltered.icd2,
          });
        if (selectedPatientFiltered.icd3 !== null)
          newIcdRows.push({
            icd10Code: selectedPatientFiltered.icd3,
            order: 3,
            searchValue: selectedPatientFiltered.icd3,
          });
        if (selectedPatientFiltered.icd4 !== null)
          newIcdRows.push({
            icd10Code: selectedPatientFiltered.icd4,
            order: 4,
            searchValue: selectedPatientFiltered.icd4,
          });
        if (selectedPatientFiltered.icd5 !== null)
          newIcdRows.push({
            icd10Code: selectedPatientFiltered.icd5,
            order: 5,
            searchValue: selectedPatientFiltered.icd5,
          });
        if (selectedPatientFiltered.icd6 !== null)
          newIcdRows.push({
            icd10Code: selectedPatientFiltered.icd6,
            order: 6,
            searchValue: selectedPatientFiltered.icd6,
          });
        if (selectedPatientFiltered.icd7 !== null)
          newIcdRows.push({
            icd10Code: selectedPatientFiltered.icd7,
            order: 7,
            searchValue: selectedPatientFiltered.icd7,
          });
        if (selectedPatientFiltered.icd8 !== null)
          newIcdRows.push({
            icd10Code: selectedPatientFiltered.icd8,
            order: 8,
            searchValue: selectedPatientFiltered.icd8,
          });
        if (selectedPatientFiltered.icd9 !== null)
          newIcdRows.push({
            icd10Code: selectedPatientFiltered.icd9,
            order: 9,
            searchValue: selectedPatientFiltered.icd9,
          });
        if (selectedPatientFiltered.icd10 !== null)
          newIcdRows.push({
            icd10Code: selectedPatientFiltered.icd10,
            order: 10,
            searchValue: selectedPatientFiltered.icd10,
          });
        if (selectedPatientFiltered.icd11 !== null)
          newIcdRows.push({
            icd10Code: selectedPatientFiltered.icd11,
            order: 11,
            searchValue: selectedPatientFiltered.icd11,
          });
        if (selectedPatientFiltered.icd12 !== null)
          newIcdRows.push({
            icd10Code: selectedPatientFiltered.icd12,
            order: 12,
            searchValue: selectedPatientFiltered.icd12,
          });
        setSelectedICDs(newIcdRows);
      }
      const groupID = selectedPatientFiltered?.groupID
        ? selectedPatientFiltered?.groupID
        : selectedClaimData?.groupID;

      if (groupID) {
        setCptSearch({
          ...cptSearch,
          clientID: groupID,
        });
        setbatchNumber(undefined);
        setBatchSearch({
          ...batchSearch,
          clientID: groupID,
        });
        setSelectedPatientData(selectedPatientFiltered);
        getReferringProviderData(groupID);
        // dispatch(
        //   fetchReferringProviderDataRequest({
        //     groupID,
        //   })
        // );
        dispatch(
          fetchAssignClaimToDataRequest({
            clientID: groupID,
          })
        );
        dispatch(fetchPracticeDataRequest({ groupID }));
        dispatch(fetchFacilityDataRequest({ groupID }));
        dispatch(fetchProviderDataRequest({ groupID }));
      }
    }
  }, [selectedPatient]);
  useEffect(() => {
    if (assignClaimToData && selectedClaimData) {
      const selectedUser = assignClaimToData?.filter(
        (m) => m.id.toString() === selectedClaimData.assignClaimTo
      )[0];
      setSelectedAssignClaimTo(selectedUser);
    }
  }, [assignClaimToData]);

  const patientInsuranceData = useSelector(getPatientInsuranceDataSelector);
  const groupsData = useSelector(getGroupDataSelector);
  const practicesData = useSelector(getPracticeDataSelector);
  const facilityDropdownData = useSelector(getFacilityDataSelector);
  const [facilitiesData, setFacilitiesData] = useState<FacilityData[]>([]);
  useEffect(() => {
    if (
      facilityDropdownData?.length &&
      selectedPractice &&
      selectedPractice.id
    ) {
      setFacilitiesData(
        facilityDropdownData.filter((m) => m.practiceID === selectedPractice.id)
      );
    }
  }, [facilityDropdownData, selectedPractice]);
  // const referringProviderDataSet = useSelector(
  //   getReferringProviderDataSelector
  // );
  useEffect(() => {
    if (groupsData) {
      setSelectedGroup(
        groupsData?.filter(
          (m) => m.id === selectedWorkGroupData?.groupsData[0]?.id
        )[0]
      );
    }
  }, [groupsData]);
  // useEffect(() => {
  //   if (referringProviderDataSet) {
  //     setReferringProviderData(referringProviderDataSet);
  //   }
  // }, [referringProviderDataSet]);
  useEffect(() => {
    if (referringProviderData && selectedClaimData) {
      const selectedRefProvider = referringProviderData?.filter(
        (m) => m.id === selectedClaimData.referringProviderID
      )[0];
      setSelectedReferringProvider(selectedRefProvider);
    }
  }, [referringProviderData]);
  // Dropdown data setting on selection

  useEffect(() => {
    if (providersData) {
      setSupervisingProviderData(providersData);
    }
  }, [providersData]);
  const onSelectFacility = (value: SingleSelectDropDownDataType) => {
    setSelectedFacility(value);
    const f = facilitiesData?.filter((m) => m.id === value.id)[0];
    if (f) {
      setSelectedPlaceOfService(
        lookupsData?.placeOfService.filter(
          (m) => m.id === f.placeOfServiceID
        )[0]
      );
    }
  };
  useEffect(() => {
    if (selectedPatientData) {
      setSelectedGroup(
        groupsData?.filter((m) => m.id === selectedPatientData.groupID)[0]
      );
      setSelectedPlaceOfService(
        lookupsData?.placeOfService.filter(
          (m) => m.id === selectedPatientData.placeOfServiceID
        )[0]
      );
    }
    if (selectedClaimData) {
      setSelectedGroup(
        groupsData?.filter((m) => m.id === selectedClaimData.groupID)[0]
      );
      setSelectedPlaceOfService(
        lookupsData?.placeOfService.filter(
          (m) => m.id === selectedClaimData.posID
        )[0]
      );
    }
  }, [selectedPatientData, selectedClaimData]);
  useEffect(() => {
    if (selectedPatientData && practicesData) {
      setSelectedPractice(
        practicesData.filter((m) => m.id === selectedPatientData?.practiceID)[0]
      );
    }
    if (selectedClaimData && practicesData) {
      setSelectedPractice(
        practicesData.filter((m) => m.id === selectedClaimData?.practiceID)[0]
      );
    }
  }, [practicesData]);
  useEffect(() => {
    if (selectedPatientData && facilitiesData) {
      setSelectedFacility(
        facilitiesData.filter(
          (m) => m.id === selectedPatientData?.facilityID
        )[0]
      );
    }
    if (selectedClaimData && facilitiesData) {
      setSelectedFacility(
        facilitiesData.filter((m) => m.id === selectedClaimData?.facilityID)[0]
      );
    }
  }, [facilitiesData]);
  useEffect(() => {
    if (selectedPatientData && providersData) {
      setSelectedRenderingProvider(
        providersData.filter((m) => m.id === selectedPatientData?.providerID)[0]
      );
    }
    if (selectedClaimData && providersData) {
      setSelectedRenderingProvider(
        providersData.filter((m) => m.id === selectedClaimData?.providerID)[0]
      );
    }
  }, [providersData]);
  // Primary Insurance Selection Based
  const [selectedPrimaryInsurance, setSelectedPrimaryInsurance] = useState<
    SingleSelectDropDownDataType | undefined
  >();
  const onSelectPrimaryInsurance = (value: SingleSelectDropDownDataType) => {
    if (selectedPatient) {
      setSelectedPrimaryInsurance(value);
      if (patientInsuranceData) {
        const selectedPrimaryInsuranceFiltered = patientInsuranceData.filter(
          (m) => m.id === value.id
        )[0];
        if (selectedPrimaryInsuranceFiltered) {
          setSelectedSubscriberRelation(
            selectedPrimaryInsuranceFiltered.subscriberRelation
          );
          const assignmentBelongsTo = lookupsData?.assignmentBelongsTo.filter(
            (m) =>
              m.id === selectedPrimaryInsuranceFiltered.assignmentBelongsToID
          )[0];
          setSelectedAssignmentBelongsTo(assignmentBelongsTo);
          setSelectedAdditionalFields({
            ...selectedAdditionalFields,
            accidentDate: selectedPrimaryInsuranceFiltered.accidentDate
              ? selectedPrimaryInsuranceFiltered.accidentDate.toString()
              : null,
            accidentTypeID: selectedPrimaryInsuranceFiltered.accidentTypeID,
            accidentStateID: selectedPrimaryInsuranceFiltered.accidentStateID,
          });
        }
      }
    }
  };
  const [selectedMedicalCaseDropdownData, setSelectedMedicalCaseDropdownData] =
    useState<SingleSelectDropDownDataType | null>(null);
  // const generateIcdRows = (value: any) => {
  //   const newIcdRows = [];
  //   for (let i = 1; i <= 12; i += 1) {
  //     const icdKey = `icd${i}`;
  //     if (value[icdKey] !== null) {
  //       newIcdRows.push({
  //         icd10Code: value[icdKey],
  //         order: i,
  //         searchValue: value[icdKey],
  //       });
  //     }
  //   }
  //   return newIcdRows;
  // };
  // Charge Fee
  const getChargesFeeData = async (obj: ChargeFeeCriteria, type: string) => {
    const res = await getChargesFee(obj);
    if (res) {
      if (type === 'add') {
        setChargeFee(res);
      }
      if (type === 'edit') {
        const updatedChargesRow = chargesRow?.map((chargeData) => {
          if (chargeData.charge && chargeData.charge.cptCode === obj.cptCode) {
            const calculatedFee = res.fee * (chargeData.charge?.units || 1);
            return {
              ...chargeData,
              charge: {
                ...chargeData.charge,
                fee: res.fee || 0,
                insuranceAmount: selectedPrimaryInsurance ? calculatedFee : 0,
                patientAmount: !selectedPrimaryInsurance ? calculatedFee : 0,
              },
            };
          }
          return chargeData;
        });
        setChargesRow(updatedChargesRow);
      }
    }
    // }
  };
  useEffect(() => {
    if (selectedFacility && selectedCpt) {
      getChargesFeeData(
        {
          cptCode: selectedCpt.value,
          modifierCode: selectedModifier1 ? selectedModifier1.value : null,
          facilityID: selectedFacility.id,
          patientInsuranceID: selectedPrimaryInsurance
            ? selectedPrimaryInsurance?.id
            : null,
          medicalCaseID: selectedMedicalCaseDropdownData?.id || null,
        },
        'add'
      );
    }
  }, [
    selectedModifier1,
    selectedFacility,
    selectedCpt,
    selectedPrimaryInsurance,
  ]);
  useEffect(() => {
    if (patientInsuranceData) {
      const primaryInsuranceDataFiltered = patientInsuranceData?.filter(
        (patientInsurance) => patientInsurance.insuranceResponsibility === 'P'
      );
      setPrimaryInsuranceData(primaryInsuranceDataFiltered);
      if (
        primaryInsuranceDataFiltered.length &&
        primaryInsuranceDataFiltered[0]
      ) {
        onSelectPrimaryInsurance(primaryInsuranceDataFiltered[0]);
      }
    }
  }, [patientInsuranceData]);
  // Medical Case Dropdown
  const [medicalCaseDropdownData, setMedicalCaseDropdownData] = useState<
    SingleSelectDropDownDataType[]
  >([]);

  const getMedicalCaseForClaimData = async (
    obj: GetLinkableClaimsForMedicalCaseCriteria
  ) => {
    const res = await getMedicalCaseForClaim(obj);
    if (res) {
      setMedicalCaseDropdownData(res);
    } else {
      setMedicalCaseDropdownData([]);
      setSelectedMedicalCaseDropdownData(null);
    }
  };
  useEffect(() => {
    // Only set the default selection when the dropdown data is loaded
    if (medicalCaseDropdownData.length > 0) {
      setSelectedMedicalCaseDropdownData(
        medicalCaseDropdownData[0] as SingleSelectDropDownDataType
      );
    } else {
      setSelectedMedicalCaseDropdownData(null);
    }
  }, [medicalCaseDropdownData]);
  useEffect(() => {
    if (selectedPatientData && selectedFacility && selectedPrimaryInsurance) {
      getMedicalCaseForClaimData({
        patientID: selectedPatientData.id,
        facilityID: selectedFacility.id,
        patientInsuranceID: selectedPrimaryInsurance.id,
        medicalCaseID: selectedMedicalCaseDropdownData
          ? selectedMedicalCaseDropdownData.id
          : undefined,
      });
    }
  }, [selectedPatientData, selectedFacility, selectedPrimaryInsurance]);
  const [chargesHeader, setChargesHeader] = useState<string[]>([
    '',
    'DOS',
    'CPT Code',
    'Units',
    'Modifiers',
    'POS',
    'CLIA Number',
    'DX',
    'NDC Code',
    'Fee',
    'Ins.Resp.',
    'Pat.Resp.',
    'Charge Batch',
  ]);
  const getTooltipTextforCharges = (header: string, type: string) => {
    if (type === 'charges') {
      if (header === 'DOS') {
        return (
          <div>
            {' '}
            CMS1500 : BOX24-A <br /> X12 : LOOP 2400 - DTP03 (472)
          </div>
        );
      }
      if (header === 'CPT Code') {
        return (
          <div>
            {' '}
            CMS1500 : BOX24-D <br /> X12 : LOOP 2400 - SV101-1 (HC)
          </div>
        );
      }
      if (header === 'Units') {
        return (
          <div>
            CMS1500 : BOX24-G <br /> X12 : LOOP 2400 - SV104 (UN)
          </div>
        );
      }
      if (header === 'Modifiers') {
        return (
          <div className="flex flex-col">
            <div className="font-bold">MOD1:</div>
            <div>
              {' '}
              CMS1500 : BOX24-D <br /> X12 : LOOP 2400 - SV101-3
            </div>
            <div className="font-bold">MOD2:</div>
            <div>
              {' '}
              CMS1500 : BOX24-D <br /> X12 : LOOP 2400 - SV101-4
            </div>
            <div className="font-bold">MOD3:</div>
            <div>
              {' '}
              CMS1500 : BOX24-D <br /> X12 : LOOP 2400 - SV101-5
            </div>
            <div className="font-bold">MOD4:</div>
            <div>
              {' '}
              CMS1500 : BOX24-D <br /> X12 : LOOP 2400 - SV101-6
            </div>
          </div>
        );
      }
      if (header === 'POS') {
        return (
          <div>
            {' '}
            CMS1500 : BOX24-B <br /> X12 : LOOP 2400 - SV105
          </div>
        );
      }
      if (header === 'DX') {
        return (
          <div>
            {' '}
            CMS1500 : BOX24-E <br /> X12 : LOOP 2400 - SV107
          </div>
        );
      }
      if (header === 'Fee') {
        return (
          <div>
            {' '}
            CMS1500 : BOX24-F <br /> X12 : LOOP 2400 - SV102
          </div>
        );
      }
    }
    if (type === 'ndc') {
      if (header === 'NDC Code') {
        return (
          <div>
            {' '}
            CMS1500 : BOX24-A shaded area <br /> X12 : LOOP 2410 - LIN103 (N4)
          </div>
        );
      }
      if (header === 'Units') {
        return (
          <div>
            {' '}
            BOX24-A shaded area <br /> X12 : LOOP 2410 - CTP104
          </div>
        );
      }
      if (header === 'Dosage From') {
        return (
          <div>
            {' '}
            BOX24-A shaded area <br /> X12 : LOOP 2410 - CTP105
          </div>
        );
      }
      if (header === 'Service Description') {
        return (
          <div>
            {' '}
            CMS1500 : BOX24-A shaded area <br /> X12 : LOOP 2400 - SV101-7
          </div>
        );
      }
    }
    return '';
  };
  const [revenueCodeData, setRevenueCodeData] = useState<RevenueCodesData[]>(
    []
  );
  const [selectedRevenueCodeData, setSelectedRevenueCodeData] =
    useState<SingleSelectGridDropdownDataType>();

  useEffect(() => {
    if (selectedMedicalCaseDropdownData) {
      // Check if 'Revenue Code' is not already at position 3
      if (chargesHeader[3] !== 'Revenue Code') {
        // Create a new array with 'Revenue Code' inserted at position 3
        const newChargesHeader = [
          ...chargesHeader.slice(0, 3),
          'Revenue Code',
          ...chargesHeader.slice(3),
        ];
        setChargesHeader(newChargesHeader);
      }
    } else {
      // Find the index of 'Revenue Code'
      const index = chargesHeader.indexOf('Revenue Code');
      if (index !== -1) {
        // Create a new array without 'Revenue Code'
        const newChargesHeader = [
          ...chargesHeader.slice(0, index),
          ...chargesHeader.slice(index + 1),
        ];
        setChargesHeader(newChargesHeader);
      }
    }
  }, [selectedMedicalCaseDropdownData, chargesHeader]);

  const getRevenueCodeSearchData = async (revenueSearchValue: string) => {
    const res = await getSearchRevenueCodes(revenueSearchValue);
    if (res) {
      setRevenueCodeData(res);
      setSelectedRevenueCodeData(res[0] as SingleSelectDropDownDataType);
    }
  };
  useEffect(() => {
    if (revenueSearch) {
      getRevenueCodeSearchData(revenueSearch);
    }
  }, [revenueSearch]);
  const getRevenueCodesForCPT = async () => {
    if (selectedPractice && selectedCpt) {
      const res = await getRevenueCodesForCPTData(
        selectedPractice?.id || null,
        selectedPrimaryInsurance?.id || null,
        selectedCpt.value
      );
      if (res && res.value) {
        getRevenueCodeSearchData(res.value);
        // setRevenueCodeData([res] as SingleSelectDropDownDataType[]);
        // setSelectedRevenueCodeData(res as SingleSelectDropDownDataType);
      }
    }
  };
  useEffect(() => {
    getRevenueCodesForCPT();
  }, [selectedPractice, selectedCpt, selectedPrimaryInsurance]);
  // Header Collapse
  const [billClaimToCollapse, setBillClaimToCollapse] = useState(false);
  const [serviceDetailsCollapse, setServiceDetailsCollapse] = useState(false);
  const [
    collectedAdvancePaymentsCollapse,
    setCollectedAdvancePaymentsCollapse,
  ] = useState(false);
  const [additionalInformationCollapse, setAdditionalInformationCollapse] =
    useState(false);
  const [documentUploadCollapse, setDocumentUploadCollapse] = useState(false);
  // Check Box
  const [dxCode, setdxCode] = useState<
    MultiValue<MultiSelectGridDropdownDataType> | []
  >([]);

  // Prior Authorization Number
  const [ndcRow, setndcRow] = useState<NdcData[] | undefined>();
  const [ndcEditDataRows, setNdcEditData] = useState<NdcData[] | undefined>();

  // SELECTED ADDITIONAL INFORMATION
  const [selectedAddtionalInformation, setSelectedAddtionalInformation] =
    useState<AdditionalFiedlsPayload | null>();

  useOnceEffect(() => {
    if (chargesRow && chargesRow.length > 0) {
      let smallestFromDate =
        chargesRow[0] && chargesRow[0].charge && chargesRow[0].charge.fromDOS
          ? StringToDatePipe(chargesRow[0].charge.fromDOS)
          : null;
      let smallestToDate =
        chargesRow[0] && chargesRow[0].charge && chargesRow[0].charge.toDOS
          ? StringToDatePipe(chargesRow[0].charge.toDOS)
          : null;
      for (let i = 1; i < chargesRow.length; i += 1) {
        const currentFromDate =
          chargesRow[i] &&
          chargesRow[i]?.charge &&
          chargesRow[i]?.charge?.fromDOS;
        const fromDate = currentFromDate
          ? StringToDatePipe(currentFromDate)
          : null;
        if (smallestFromDate && fromDate && fromDate < smallestFromDate) {
          smallestFromDate = fromDate;
        }
      }
      for (let i = 1; i < chargesRow.length; i += 1) {
        const currentToDate =
          chargesRow[i] &&
          chargesRow[i]?.charge &&
          chargesRow[i]?.charge?.toDOS;
        const toDate = currentToDate ? StringToDatePipe(currentToDate) : null;
        if (smallestToDate && toDate && toDate > smallestToDate) {
          smallestToDate = toDate;
        }
      }
      if (savedCharges === null || savedCharges === undefined) {
        setToDOS(smallestToDate);
        setfromDOS(smallestFromDate);
      }
    }
  }, [savedCharges || chargesRow]);
  // CHECK DUPLICATE ICDS
  const checkDuplicateICD = () => {
    if (icdRows) {
      for (let i = 0; i < icdRows?.length; i += 1) {
        for (let j = i + 1; j < icdRows.length; j += 1) {
          if (icdRows[i]?.icd10Code === icdRows[j]?.icd10Code) {
            return true;
          }
        }
      }
    }
    return false;
  };
  // SAVE CLAIM
  const claimDataValidation = (claimData: SaveClaimRequestPayload) => {
    let isValid = true;
    const todaysDate = new Date();
    todaysDate.setHours(0, 0, 0, 0);

    const dosFrom = claimData.dosFrom
      ? StringToDatePipe(claimData.dosFrom)
      : null;
    const dosTo = claimData.dosTo ? StringToDatePipe(claimData.dosTo) : null;
    if (dosFrom) {
      dosFrom.setHours(0, 0, 0, 0);
    }
    if (dosTo) {
      dosTo.setHours(0, 0, 0, 0);
    }
    // Compare timestamps using getTime()
    if (dosFrom && dosFrom > todaysDate) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Date of Service cannot be in the Future',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (
      selectedPlaceOfService?.value === '21 | Inpatient Hospital' &&
      (claimData.admissionDate === null ||
        claimData.admissionDate === undefined)
    ) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Addmission Date is required',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (dosTo && dosTo > todaysDate) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Date of Service cannot be in the Future',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (dosFrom && dosTo && dosFrom > dosTo) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'DOS From cannot be greater then DOS To',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    const patDOB = selectedPatientData
      ? new Date(selectedPatientData.patientDOB)
      : null;
    if (patDOB) {
      patDOB.setHours(0, 0, 0, 0);
    }
    if (
      patDOB !== null &&
      ((dosFrom && dosFrom < patDOB) || (dosTo && dosTo < patDOB))
    ) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'DOS cannot be smaller than patient DOB',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (claimData.patientID === null) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Please Select Patient',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (claimData.groupID === null) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Please Select Group',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (claimData.practiceID === null) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Please Select Practice',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (claimData.facilityID === null) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Please Select Facility',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (claimData.providerID === null) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Please Select Rendering Provider',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (claimData.icd1 === null) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Please Select ICD',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (checkDuplicateICD() === true) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Duplicate ICD-10 exists on the claim. Please update ICD-10 and resubmit claim.',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    return isValid;
  };

  const chargesDataValidation = (chargesData: SaveChargeRequestPayload) => {
    let isValid = true;
    if (selectedMedicalCaseDropdownData?.id && chargesData.revenueCode === '') {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Please Select Revenue Code',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (
      chargesData.toDOS === null ||
      chargesData.fromDOS === null ||
      chargesData.fromDOS === undefined ||
      chargesData.toDOS === undefined
    ) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'DOS is missing in Charge',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    const todaysDate = new Date();
    todaysDate.setHours(0, 0, 0, 0);
    const dosFrom = chargesData.fromDOS
      ? StringToDatePipe(chargesData.fromDOS)
      : null;
    const dosTo = chargesData.toDOS
      ? StringToDatePipe(chargesData.toDOS)
      : null;
    if (dosFrom) {
      dosFrom.setHours(0, 0, 0, 0);
    }
    if (dosTo) {
      dosTo.setHours(0, 0, 0, 0);
    }
    if (dosFrom && dosFrom > todaysDate) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Date of Service cannot be in the Future',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (dosTo && dosTo > todaysDate) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Date of Service cannot be in the Future',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (dosFrom && dosTo && dosFrom > dosTo) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'DOS From cannot be greater then DOS To',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    const patDOB = selectedPatientData
      ? new Date(selectedPatientData.patientDOB)
      : null;
    if (patDOB) {
      patDOB.setHours(0, 0, 0, 0);
    }
    if (
      patDOB !== null &&
      ((dosFrom && dosFrom < patDOB) || (dosTo && dosTo < patDOB))
    ) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'DOS cannot be smaller than patient DOB',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (chargesData.chargePostingDate === null) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Please Select Posting Date',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (chargesData.cptCode === '') {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Please Select CPT Code',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (chargesData.units === null) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Please Select Units',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (chargesData.icd1 === null) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Charge requires Diagnosis pointer. Please update and resubmit the claim.',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    const validInsResp = chargesData.insuranceAmount || 0;
    const validPatResp = chargesData.patientAmount || 0;
    const validValue = validInsResp + validPatResp;
    if (validValue > 0 && validValue !== chargesData.fee) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Please select valid fee',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    return isValid;
  };
  const createNdcValidation = (ndcData: SaveCptNdcRequestPayload) => {
    let isValid = true;
    if (!ndcData.cptCode) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Please Select CPT',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (ndcData.practiceID === null) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Please Select Practice',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (ndcData.ndcUnit === null) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Units cannot be empty',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (ndcData.ndcNumber == null || ndcData.ndcNumber.length < 11) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'NDC Code must consist of 11 digits.',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    return isValid;
  };
  const [isSubmitCreateButtonClicked, setIsSubmitCreateButtonClicked] =
    useState(false);
  const [isSubmitButtonClicked, setIsSubmitButtonClicked] = useState(false);
  const [isCreateClaimButtonClicked, setCreateClaimButtonClicked] =
    useState(false);
  // const saveClaimResponse = useSelector(getSavedClaimSelector);
  const [saveClaimResponse, setSaveClaimResponse] =
    useState<SaveClaimSuccessPayload | null>(null);
  const [isScrubResponseModalOpen, setIsScrubResponseModalOpen] =
    useState<boolean>(false);
  const [isScrubResultModalOpen, setIsScrubResultModalOpen] =
    useState<boolean>(false);
  const router = useRouter();
  const onCreateNewClaim = () => {
    if (selectedClaimID) {
      router.push('/app/create-claim');
    }
    reRenderScreen();
    // dispatch(saveClaimSuccess(null));
    dispatch(fetchPatientInsranceDataSuccess([]));
    dispatch(fetchPatientSearchSuccess([]));
    dispatch(fetchCPTNdcSuccess([]));
    dispatch(fetchBatchNumberSuccess([]));
    dispatch(fetchBatchDocumentSuccess([]));
    dispatch(fetchBatchDocumentPageSuccess([]));
    dispatch(updateChargeSuccess(null));
    dispatch(scrubClaimSuccess(null));
    dispatch(fetchReferringProviderDataSuccess([]));
    dispatch(fetchProviderDataSuccess([]));
  };

  const checkDuplicateWarning = async (
    obj: GetDuplicateWarningCriteria,
    criteria: any
  ) => {
    const res = await getDuplicateWarning(obj);

    if (res && res.length) {
      let messages = '';

      res.forEach((element) => {
        messages += `${element.message} `;
      });
      let heading = '';
      if (obj.checkDuplicateType === 'Claim') {
        heading = 'Duplicate Claim Warning!';
      } else if (obj.checkDuplicateType === 'Charge') {
        heading = 'Duplicate Charge Warning!';
      } else {
        heading = 'Duplicate Claim/Charge Warning!';
      }
      setStatusModalInfo({
        ...statusModalInfo,
        show: true,
        heading,
        text: messages.trim(), // Trim to remove any trailing spaces
        type: StatusModalType.WARNING,
        showCloseButton: true,
        okButtonText: 'Save Anyway',
        closeButtonText: 'Close',
        confirmType: 'dupe_warning',
        cancelSaveType:
          obj.checkDuplicateType === null ? 'CC' : obj.checkDuplicateType,
        saveCriteria: criteria,
      });
      return false;
    }
    return !!res;
  };

  const creatClaimRequest = async (
    data: SaveClaimChargePaymentRequestPayload
  ) => {
    const res = await createClaim(data);
    if (!res) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Something went wrong!',
          toastType: ToastType.ERROR,
        })
      );
    } else {
      setSaveClaimResponse(res);
    }
  };
  const saveClaim = async () => {
    let claimData: SaveClaimRequestPayload = {
      claimID: null,
      appointmentID: null,
      claimStatusID: null,
      scrubStatusID: null,
      submitStatusID: null,
      patientID: null,
      patientInsuranceID: null,
      insuranceID: null,
      subscriberID: null,
      dosFrom: null,
      dosTo: null,
      groupID: null,
      practiceID: null,
      facilityID: null,
      posID: null,
      providerID: null,
      referringProviderNPI: null,
      referringProviderFirstName: null,
      referringProviderLastName: null,
      referralNumber: null,
      supervisingProviderID: null,
      panNumber: null,
      icd1: null,
      icd2: null,
      icd3: null,
      icd4: null,
      icd5: null,
      icd6: null,
      icd7: null,
      icd8: null,
      icd9: null,
      icd10: null,
      icd11: null,
      icd12: null,
      dischargeDate: null,
      currentIllnessDate: null,
      disabilityBeginDate: null,
      disabilityEndDate: null,
      firstSymptomDate: null,
      initialTreatmentDate: null,
      lmpDate: null,
      lastSeenDate: null,
      lastXrayDate: null,
      simillarIllnesDate: null,
      responsibilityDate: null,
      accidentDate: null,
      accidentTypeID: null,
      accidentStateID: null,
      labCharges: null,
      delayReason: null,
      epsdtConditionID: null,
      serviceAuthExcepID: null,
      specialProgramIndicatorID: null,
      orderingProviderID: null,
      box19: null,
      emg: null,
      comments: null,
      originalRefenceNumber: null,
      claimFrequencyID: null,
      conditionCodeID: null,
      pwkControlNumber: null,
      transmissionCodeID: null,
      attachmentTypeID: null,
      assignClaimTo: null,
      assignUserNote: null,
      admissionDate: null,
      medicalCaseID: null,
    };
    const primaryInsuranceSelected = patientInsuranceData?.filter(
      (m) => m.id === selectedPrimaryInsurance?.id
    )[0];
    const referringProviderSelected = referringProviderData?.filter(
      (m) => m.id === selectedReferringProvider?.id
    )[0];
    if (icdRows && icdRows?.length > 0) {
      const icds = icdRows.filter((m) => m.icd10Code);
      claimData = {
        ...claimData,
        icd1: icds.length > 0 && icds[0] ? icds[0].icd10Code : undefined,
        icd2: icds.length > 1 && icds[1] ? icds[1].icd10Code : undefined,
        icd3: icds.length > 2 && icds[2] ? icds[2].icd10Code : undefined,
        icd4: icds.length > 3 && icds[3] ? icds[3].icd10Code : undefined,
        icd5: icds.length > 4 && icds[4] ? icds[4].icd10Code : undefined,
        icd6: icds.length > 5 && icds[5] ? icds[5].icd10Code : undefined,
        icd7: icds.length > 6 && icds[6] ? icds[6].icd10Code : undefined,
        icd8: icds.length > 7 && icds[7] ? icds[7].icd10Code : undefined,
        icd9: icds.length > 8 && icds[8] ? icds[8].icd10Code : undefined,
        icd10: icds.length > 9 && icds[9] ? icds[9].icd10Code : undefined,
        icd11: icds.length > 10 && icds[10] ? icds[10].icd10Code : undefined,
        icd12: icds.length > 11 && icds[11] ? icds[11].icd10Code : undefined,
      };
    }
    if (selectedAddtionalInformation) {
      claimData = {
        ...claimData,
        dischargeDate: selectedAddtionalInformation.dischargeDate
          ? selectedAddtionalInformation.dischargeDate.split('T')[0]
          : null,
        currentIllnessDate: selectedAddtionalInformation.currentIllnessDate
          ? selectedAddtionalInformation.currentIllnessDate.split('T')[0]
          : null,
        disabilityBeginDate: selectedAddtionalInformation.disabilityBeginDate
          ? selectedAddtionalInformation.disabilityBeginDate.split('T')[0]
          : null,
        disabilityEndDate: selectedAddtionalInformation.disabilityEndDate
          ? selectedAddtionalInformation.disabilityEndDate.split('T')[0]
          : null,
        firstSymptomDate: selectedAddtionalInformation.firstSymptomDate
          ? selectedAddtionalInformation.firstSymptomDate.split('T')[0]
          : null,
        initialTreatmentDate: selectedAddtionalInformation.initialTreatmentDate
          ? selectedAddtionalInformation.initialTreatmentDate.split('T')[0]
          : null,
        lmpDate: selectedAddtionalInformation.lmpDate
          ? selectedAddtionalInformation.lmpDate.split('T')[0]
          : null,
        lastSeenDate: selectedAddtionalInformation.lastSeenDate
          ? selectedAddtionalInformation.lastSeenDate.split('T')[0]
          : null,
        lastXrayDate: selectedAddtionalInformation.lastXrayDate
          ? selectedAddtionalInformation.lastXrayDate.split('T')[0]
          : null,
        simillarIllnesDate: selectedAddtionalInformation.simillarIllnesDate
          ? selectedAddtionalInformation.simillarIllnesDate.split('T')[0]
          : null,
        responsibilityDate: selectedAddtionalInformation.responsibilityDate
          ? selectedAddtionalInformation.responsibilityDate.split('T')[0]
          : null,
        accidentDate: selectedAddtionalInformation.accidentDate
          ? selectedAddtionalInformation.accidentDate.split('T')[0]
          : null,
        accidentTypeID: selectedAddtionalInformation.accidentTypeID,
        accidentStateID: selectedAddtionalInformation.accidentStateID,
        labCharges: selectedAddtionalInformation.labCharges,
        delayReason: selectedAddtionalInformation.delayReason,
        epsdtConditionID: selectedAddtionalInformation.epsdtConditionID,
        serviceAuthExcepID: selectedAddtionalInformation.serviceAuthExcepID,
        specialProgramIndicatorID:
          selectedAddtionalInformation.specialProgramIndicatorID,
        orderingProviderID: selectedAddtionalInformation.orderingProviderID,
        box19: selectedAddtionalInformation.box19,
        comments: selectedAddtionalInformation.comments,
        originalRefenceNumber:
          selectedAddtionalInformation.originalRefenceNumber,
        claimFrequencyID: selectedAddtionalInformation.claimFrequencyID,
        conditionCodeID: selectedAddtionalInformation.conditionCodeID,
        pwkControlNumber: selectedAddtionalInformation.pwkControlNumber,
        transmissionCodeID: selectedAddtionalInformation.transmissionCodeID,
        attachmentTypeID: selectedAddtionalInformation.attachmentTypeID,
      };
    }
    claimData = {
      ...claimData,
      patientID: selectedPatient ? selectedPatient.id : null,
      groupID: selectedGroup ? selectedGroup.id : null,
      practiceID: selectedPractice ? selectedPractice.id : null,
      facilityID: selectedFacility ? selectedFacility.id : null,
      patientInsuranceID: selectedPrimaryInsurance
        ? selectedPrimaryInsurance.id
        : null,
      insuranceID: primaryInsuranceSelected
        ? primaryInsuranceSelected.insuranceID
        : null,
      subscriberID: primaryInsuranceSelected
        ? primaryInsuranceSelected.subcriberID
        : null,
      providerID: selectedRenderingProvider
        ? selectedRenderingProvider.id
        : null,
      supervisingProviderID: selectedSupervisingProvider
        ? selectedSupervisingProvider.id
        : null,
      referringProviderNPI: referringProviderSelected
        ? referringProviderSelected.id.toString()
        : null,
      referringProviderFirstName: referringProviderSelected
        ? referringProviderSelected.firstName
        : null,
      referringProviderLastName: referringProviderSelected
        ? referringProviderSelected.firstName
        : null,
      referralNumber: referelNumber || null,
      posID: selectedPlaceOfService ? selectedPlaceOfService.id : null,
      panNumber: panNumber || null,
      assignClaimTo: selectedAssignClaimTo
        ? selectedAssignClaimTo.id.toString()
        : null,
      assignUserNote: assignUserNote || null,
      dosFrom: fromDOS ? DateToStringPipe(fromDOS, 1) : null,
      dosTo: toDOS ? DateToStringPipe(toDOS, 1) : null,
      admissionDate: admissionDate ? DateToStringPipe(admissionDate, 1) : null,
      claimStatusID: 1,
      scrubStatusID: 7,
      submitStatusID: 1,
      medicalCaseID: selectedMedicalCaseDropdownData?.id || null,
    };
    const isValid = claimDataValidation(claimData);
    if (isValid) {
      let isNotDuplicate = true;
      if (!saveClaimResponse?.claimID && !selectedClaimID) {
        const crit = advancePaymentData?.length
          ? {
              claimJson: claimData,
              chargeJson: null,
              paymentList: advancePaymentData,
            }
          : {
              claimJson: claimData,
              chargeJson: null,
              paymentList: advancePaymentData,
            };
        isNotDuplicate = await checkDuplicateWarning(
          {
            practiceID: null,
            patientID: claimData.patientID,
            patientFirstName: '',
            patientLastName: '',
            patientDateOfBirth: '',
            dos: claimData.dosFrom || '',
            chargeDOS: '',
            cpt: '',
            checkDuplicateType: 'Claim',
          },
          crit
        );
      }
      try {
        if (saveClaimResponse?.claimID) {
          claimData = {
            ...claimData,
            claimID: saveClaimResponse.claimID,
          };
          await dispatch(editClaimRequest(claimData));
        } else if (selectedClaimID) {
          claimData = {
            ...claimData,
            claimID: selectedClaimID,
          };
          await dispatch(editClaimRequest(claimData));
        } else if (advancePaymentData?.length) {
          if (isNotDuplicate) {
            await creatClaimRequest({
              claimJson: claimData,
              chargeJson: null,
              paymentList: advancePaymentData,
            });
          }
        } else if (isNotDuplicate) {
          await creatClaimRequest({
            claimJson: claimData,
            chargeJson: null,
            paymentList: [],
          });
        }
        return true;
        // }
        // Claim saved successfully
      } catch (error) {
        return false; // Error saving claim
      }
    } else {
      return false; // Validation failed
    }
  };
  const postingDateCriteria: PostingDateCriteria = {
    id: selectedGroup?.id,
    type: 'charge',
    postingDate: DateToStringPipe(postingDate, 1),
  };
  const saveCharges = async () => {
    let claimData: SaveClaimRequestPayload = {
      claimID: null,
      appointmentID: null,
      claimStatusID: null,
      scrubStatusID: null,
      submitStatusID: null,
      patientID: null,
      patientInsuranceID: null,
      insuranceID: null,
      subscriberID: null,
      dosFrom: null,
      dosTo: null,
      groupID: null,
      practiceID: null,
      facilityID: null,
      posID: null,
      providerID: null,
      referringProviderNPI: null,
      referringProviderFirstName: null,
      referringProviderLastName: null,
      referralNumber: null,
      supervisingProviderID: null,
      panNumber: null,
      icd1: null,
      icd2: null,
      icd3: null,
      icd4: null,
      icd5: null,
      icd6: null,
      icd7: null,
      icd8: null,
      icd9: null,
      icd10: null,
      icd11: null,
      icd12: null,
      dischargeDate: null,
      currentIllnessDate: null,
      disabilityBeginDate: null,
      disabilityEndDate: null,
      firstSymptomDate: null,
      initialTreatmentDate: null,
      lmpDate: null,
      lastSeenDate: null,
      lastXrayDate: null,
      simillarIllnesDate: null,
      responsibilityDate: null,
      accidentDate: null,
      accidentTypeID: null,
      accidentStateID: null,
      labCharges: null,
      delayReason: null,
      epsdtConditionID: null,
      serviceAuthExcepID: null,
      specialProgramIndicatorID: null,
      orderingProviderID: null,
      box19: null,
      emg: null,
      comments: null,
      originalRefenceNumber: null,
      claimFrequencyID: null,
      conditionCodeID: null,
      pwkControlNumber: null,
      transmissionCodeID: null,
      attachmentTypeID: null,
      assignClaimTo: null,
      assignUserNote: null,
      admissionDate: null,
      medicalCaseID: null,
    };
    let isChargeDxValid = true;
    dxCode.forEach((m) => {
      const isDxValueValid = icdRows.some(
        ({ icd10Code }) => icd10Code === m.value
      );
      if (!isDxValueValid) {
        isChargeDxValid = false;
      }
    });
    if (!isChargeDxValid) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'One or more DX codes do not match any ICD-10 codes from the available ICD rows.',
          toastType: ToastType.ERROR,
        })
      );
      return;
    }
    const pointerArr = [];
    pointerArr.push(
      dxCode &&
        dxCode?.length > 0 &&
        dxCode[0] &&
        icdRows
          ?.filter((a) => a.icd10Code === dxCode[0]?.value)
          .map((a) => a.order)[0]
        ? icdRows
            ?.filter((a) => a.icd10Code === dxCode[0]?.value)
            .map((a) => a.order)[0]
        : ''
    );
    pointerArr.push(
      dxCode &&
        dxCode?.length > 1 &&
        dxCode[1] &&
        icdRows
          ?.filter((a) => a.icd10Code === dxCode[1]?.value)
          .map((a) => a.order)[0]
        ? icdRows
            ?.filter((a) => a.icd10Code === dxCode[1]?.value)
            .map((a) => a.order)[0]
        : ''
    );
    pointerArr.push(
      dxCode &&
        dxCode?.length > 2 &&
        dxCode[2] &&
        icdRows
          ?.filter((a) => a.icd10Code === dxCode[2]?.value)
          .map((a) => a.order)[0]
        ? icdRows
            ?.filter((a) => a.icd10Code === dxCode[2]?.value)
            .map((a) => a.order)[0]
        : ''
    );
    pointerArr.push(
      dxCode &&
        dxCode?.length > 3 &&
        dxCode[3] &&
        icdRows
          ?.filter((a) => a.icd10Code === dxCode[3]?.value)
          .map((a) => a.order)[0]
        ? icdRows
            ?.filter((a) => a.icd10Code === dxCode[3]?.value)
            .map((a) => a.order)[0]
        : ''
    );
    const pointerStr =
      pointerArr.length > 0 ? pointerArr.filter((a) => a !== '').join(',') : '';
    let chargeJson: SaveChargeRequestPayload = {
      chargeID: null,
      claimID: null,
      groupID: 0,
      fromDOS: '',
      toDOS: '',
      cptCode: '',
      units: null,
      mod1: null,
      mod2: null,
      mod3: null,
      mod4: null,
      placeOfServiceID: null,
      icd1: null,
      icd2: null,
      icd3: null,
      icd4: null,
      ndcNumber: null,
      ndcUnit: null,
      ndcUnitQualifierID: null,
      serviceDescription: null,
      fee: null,
      insuranceAmount: null,
      patientAmount: null,
      chargeBatchID: null,
      chargePostingDate: null,
      systemDocumentID: null,
      pageNumber: null,
      pointers: null,
      sortOrder: null,
      revenueCode: '',
    };
    const primaryInsuranceSelected = patientInsuranceData?.filter(
      (m) => m.id === selectedPrimaryInsurance?.id
    )[0];
    const referringProviderSelected = referringProviderData?.filter(
      (m) => m.id === selectedReferringProvider?.id
    )[0];
    if (icdRows && icdRows?.length > 0) {
      const icds = icdRows.filter((m) => m.icd10Code);
      claimData = {
        ...claimData,
        icd1: icds.length > 0 && icds[0] ? icds[0].icd10Code : null,
        icd2: icds.length > 1 && icds[1] ? icds[1].icd10Code : null,
        icd3: icds.length > 2 && icds[2] ? icds[2].icd10Code : null,
        icd4: icds.length > 3 && icds[3] ? icds[3].icd10Code : null,
        icd5: icds.length > 4 && icds[4] ? icds[4].icd10Code : null,
        icd6: icds.length > 5 && icds[5] ? icds[5].icd10Code : null,
        icd7: icds.length > 6 && icds[6] ? icds[6].icd10Code : null,
        icd8: icds.length > 7 && icds[7] ? icds[7].icd10Code : null,
        icd9: icds.length > 8 && icds[8] ? icds[8].icd10Code : null,
        icd10: icds.length > 9 && icds[9] ? icds[9].icd10Code : null,
        icd11: icds.length > 10 && icds[10] ? icds[10].icd10Code : null,
        icd12: icds.length > 11 && icds[11] ? icds[11].icd10Code : null,
      };
    }
    const ndcCodeObj = ndcRow?.filter((a) => a.isChecked);
    chargeJson = {
      ...chargeJson,
      claimID: null,
      sortOrder: chargesRow ? chargesRow.length + 1 : 1,
      groupID: selectedGroup?.id,
      fromDOS: chargesFromDOS ? DateToStringPipe(chargesFromDOS, 1) : null,
      toDOS: chargesToDOS ? DateToStringPipe(chargesToDOS, 1) : null,
      cptCode: selectedCpt ? selectedCpt.value : '',
      units: chargeUnits || null,
      mod1: selectedModifier1 ? selectedModifier1.value : '',
      mod2: selectedModifier2 ? selectedModifier2.value : '',
      mod3: selectedModifier3 ? selectedModifier3.value : '',
      mod4: selectedModifier4 ? selectedModifier4.value : '',
      placeOfServiceID: selectedChargePOS ? selectedChargePOS.id : null,
      icd1: dxCode && dxCode?.length > 0 && dxCode[0] ? dxCode[0].value : null,
      icd2: dxCode && dxCode?.length > 1 && dxCode[1] ? dxCode[1].value : null,
      icd3: dxCode && dxCode?.length > 2 && dxCode[2] ? dxCode[2].value : null,
      icd4: dxCode && dxCode?.length > 3 && dxCode[3] ? dxCode[3].value : null,
      ndcNumber: selectedNdc || null,
      ndcUnit:
        ndcCodeObj && ndcCodeObj[0] && ndcCodeObj[0].ndcRowsData
          ? ndcCodeObj[0].ndcRowsData.units
          : null,
      ndcUnitQualifierID:
        ndcCodeObj && ndcCodeObj[0] && ndcCodeObj[0].ndcRowsData
          ? ndcCodeObj[0].ndcRowsData.ndcUnitQualifierID
          : null,
      serviceDescription:
        ndcCodeObj && ndcCodeObj[0] && ndcCodeObj[0].ndcRowsData
          ? ndcCodeObj[0].ndcRowsData.serviceDescription
          : null,
      fee: selectedChargeFee || null,
      insuranceAmount: insResp || null,
      patientAmount: patResp || null,
      chargeBatchID: batchNumber ? batchNumber.id : null,
      chargePostingDate: postingDate ? DateToStringPipe(postingDate, 1) : null,
      systemDocumentID: batchDocument ? batchDocument.id : null,
      pageNumber: batchDocumentPage ? batchDocumentPage.id : null,
      pointers: pointerStr,
      revenueCode:
        revenueCodeData.filter((m) => m.id === selectedRevenueCodeData?.id)[0]
          ?.code || '',
    };
    const res = await fetchPostingDate(postingDateCriteria);
    if (res && res.postingCheck === false) {
      setStatusModalInfo({
        ...statusModalInfo,
        show: true,
        heading: 'Error',
        text: `${res.message}`,
        type: StatusModalType.ERROR,
      });
      return;
    }
    setSavedCharges(chargeJson);
    claimData = {
      ...claimData,
      patientID: selectedPatient ? selectedPatient.id : null,
      groupID: selectedGroup ? selectedGroup.id : null,
      practiceID: selectedPractice ? selectedPractice.id : null,
      facilityID: selectedFacility ? selectedFacility.id : null,
      patientInsuranceID: selectedPrimaryInsurance
        ? selectedPrimaryInsurance.id
        : null,
      insuranceID: primaryInsuranceSelected
        ? primaryInsuranceSelected.insuranceID
        : null,
      subscriberID: primaryInsuranceSelected
        ? primaryInsuranceSelected.subcriberID
        : null,
      providerID: selectedRenderingProvider
        ? selectedRenderingProvider.id
        : null,
      supervisingProviderID: selectedSupervisingProvider
        ? selectedSupervisingProvider.id
        : null,
      referringProviderNPI: referringProviderSelected
        ? referringProviderSelected.id.toString()
        : null,
      referringProviderFirstName: referringProviderSelected
        ? referringProviderSelected.firstName
        : null,
      referringProviderLastName: referringProviderSelected
        ? referringProviderSelected.firstName
        : null,
      referralNumber: referelNumber || null,
      posID: selectedPlaceOfService ? selectedPlaceOfService.id : null,
      panNumber: panNumber || null,
      assignClaimTo: selectedAssignClaimTo
        ? selectedAssignClaimTo.id.toString()
        : null,
      assignUserNote: assignUserNote || null,
      dosFrom: fromDOS ? DateToStringPipe(fromDOS, 1) : null,
      dosTo: toDOS ? DateToStringPipe(toDOS, 1) : null,
      admissionDate: admissionDate ? DateToStringPipe(admissionDate, 1) : null,
      claimStatusID: 1,
      scrubStatusID: 7,
      submitStatusID: 1,
      medicalCaseID: selectedMedicalCaseDropdownData?.id || null,
    };
    const isValid = chargesDataValidation(chargeJson);
    if (isValid) {
      const isNotDuplicate = await checkDuplicateWarning(
        {
          practiceID: null,
          patientID: claimData.patientID,
          patientFirstName: '',
          patientLastName: '',
          patientDateOfBirth: '',
          dos: claimData.dosFrom || '',
          cpt: chargeJson.cptCode || '',
          checkDuplicateType: null,
          chargeDOS: chargeJson.fromDOS || '',
        },
        {
          claimJson: claimData,
          chargeJson,
          paymentList: advancePaymentData || [],
        }
      );
      if (!claimID && isNotDuplicate) {
        creatClaimRequest({
          claimJson: claimData,
          chargeJson,
          paymentList: advancePaymentData || [],
        });
      }
    }
  };
  const saveChargesWithClaim = async () => {
    let chargeJson: SaveChargeRequestPayload = {
      chargeID: null,
      claimID: null,
      groupID: 0,
      fromDOS: '',
      toDOS: '',
      cptCode: '',
      units: null,
      mod1: null,
      mod2: null,
      mod3: null,
      mod4: null,
      placeOfServiceID: null,
      icd1: null,
      icd2: null,
      icd3: null,
      icd4: null,
      ndcNumber: null,
      ndcUnit: null,
      ndcUnitQualifierID: null,
      serviceDescription: null,
      fee: null,
      insuranceAmount: null,
      patientAmount: null,
      chargeBatchID: null,
      chargePostingDate: null,
      systemDocumentID: null,
      pageNumber: null,
      pointers: null,
      sortOrder: null,
      revenueCode: '',
    };
    let isChargeDxValid = true;
    dxCode.forEach((m) => {
      const isDxValueValid = icdRows.some(
        ({ icd10Code }) => icd10Code === m.value
      );
      if (!isDxValueValid) {
        isChargeDxValid = false;
      }
    });
    if (!isChargeDxValid) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'One or more DX codes do not match any ICD-10 codes from the available ICD rows.',
          toastType: ToastType.ERROR,
        })
      );
      return;
    }
    const pointerArr = [];
    pointerArr.push(
      dxCode &&
        dxCode?.length > 0 &&
        dxCode[0] &&
        icdRows
          ?.filter((a) => a.icd10Code === dxCode[0]?.value)
          .map((a) => a.order)[0]
        ? icdRows
            ?.filter((a) => a.icd10Code === dxCode[0]?.value)
            .map((a) => a.order)[0]
        : ''
    );
    pointerArr.push(
      dxCode &&
        dxCode?.length > 1 &&
        dxCode[1] &&
        icdRows
          ?.filter((a) => a.icd10Code === dxCode[1]?.value)
          .map((a) => a.order)[0]
        ? icdRows
            ?.filter((a) => a.icd10Code === dxCode[1]?.value)
            .map((a) => a.order)[0]
        : ''
    );
    pointerArr.push(
      dxCode &&
        dxCode?.length > 2 &&
        dxCode[2] &&
        icdRows
          ?.filter((a) => a.icd10Code === dxCode[2]?.value)
          .map((a) => a.order)[0]
        ? icdRows
            ?.filter((a) => a.icd10Code === dxCode[2]?.value)
            .map((a) => a.order)[0]
        : ''
    );
    pointerArr.push(
      dxCode &&
        dxCode?.length > 3 &&
        dxCode[3] &&
        icdRows
          ?.filter((a) => a.icd10Code === dxCode[3]?.value)
          .map((a) => a.order)[0]
        ? icdRows
            ?.filter((a) => a.icd10Code === dxCode[3]?.value)
            .map((a) => a.order)[0]
        : ''
    );
    const pointerStr =
      pointerArr.length > 0 ? pointerArr.filter((a) => a !== '').join(',') : '';
    const ndcCodeObj = ndcRow?.filter((a) => a.isChecked);
    chargeJson = {
      ...chargeJson,
      claimID,
      sortOrder: chargesRow ? chargesRow.length + 1 : 1,
      groupID: selectedGroup?.id,
      fromDOS: chargesFromDOS ? DateToStringPipe(chargesFromDOS, 1) : null,
      toDOS: chargesToDOS ? DateToStringPipe(chargesToDOS, 1) : null,
      cptCode: selectedCpt ? selectedCpt.value : '',
      units: chargeUnits || null,
      mod1: selectedModifier1 ? selectedModifier1.value : '',
      mod2: selectedModifier2 ? selectedModifier2.value : '',
      mod3: selectedModifier3 ? selectedModifier3.value : '',
      mod4: selectedModifier4 ? selectedModifier4.value : '',
      placeOfServiceID: selectedChargePOS ? selectedChargePOS.id : null,
      icd1: dxCode && dxCode?.length > 0 && dxCode[0] ? dxCode[0].value : null,
      icd2: dxCode && dxCode?.length > 1 && dxCode[1] ? dxCode[1].value : null,
      icd3: dxCode && dxCode?.length > 2 && dxCode[2] ? dxCode[2].value : null,
      icd4: dxCode && dxCode?.length > 3 && dxCode[3] ? dxCode[3].value : null,
      ndcNumber: selectedNdc || null,
      ndcUnit:
        ndcCodeObj && ndcCodeObj[0] && ndcCodeObj[0].ndcRowsData
          ? ndcCodeObj[0].ndcRowsData.units
          : null,
      ndcUnitQualifierID:
        ndcCodeObj && ndcCodeObj[0] && ndcCodeObj[0].ndcRowsData
          ? ndcCodeObj[0].ndcRowsData.ndcUnitQualifierID
          : null,
      serviceDescription:
        ndcCodeObj && ndcCodeObj[0] && ndcCodeObj[0].ndcRowsData
          ? ndcCodeObj[0].ndcRowsData.serviceDescription
          : null,
      fee: selectedChargeFee || null,
      insuranceAmount: insResp || null,
      patientAmount: patResp || null,
      chargeBatchID: batchNumber ? batchNumber?.id : undefined,
      chargePostingDate: postingDate ? DateToStringPipe(postingDate, 1) : null,
      systemDocumentID: batchDocument ? batchDocument.id : null,
      pageNumber: batchDocumentPage ? batchDocumentPage.id : null,
      pointers: pointerStr,
      revenueCode:
        revenueCodeData.filter((m) => m.id === selectedRevenueCodeData?.id)[0]
          ?.code || '',
    };
    const res = await fetchPostingDate(postingDateCriteria);
    if (res && res.postingCheck === false) {
      setStatusModalInfo({
        ...statusModalInfo,
        show: true,
        heading: 'Error',
        text: `${res.message}`,
        type: StatusModalType.ERROR,
      });
      return;
    }
    setSavedCharges(chargeJson);
    const isValid = chargesDataValidation(chargeJson);
    if (isValid) {
      const isNotDuplicate = await checkDuplicateWarning(
        {
          practiceID: null,
          patientID: selectedPatient?.id || null,
          patientFirstName: '',
          patientLastName: '',
          patientDateOfBirth: '',
          dos: claimID ? DateToStringPipe(fromDOS, 1) : '',
          cpt: chargeJson.cptCode || '',
          checkDuplicateType: claimID ? 'Charge' : null,
          chargeDOS: chargeJson.fromDOS || '',
        },
        chargeJson
      );
      if (isNotDuplicate) {
        dispatch(saveChargesRequest(chargeJson));
      }
    }
  };
  const onToggleEditMode = (id: number | null | undefined) => {
    setChargesRow(() => {
      return chargesRow?.map((row) => {
        if (row && row?.charge?.chargeID === id) {
          return { ...row, isEditMode: !row.isEditMode };
        }
        return { ...row, isEditMode: true };
      });
    });
  };
  const updateCharges = (id: number | null | undefined) => {
    let updateJson: SaveChargeRequestPayload = {
      chargeID: null,
      claimID: null,
      groupID: 0,
      fromDOS: '',
      toDOS: '',
      cptCode: '',
      units: null,
      mod1: null,
      mod2: null,
      mod3: null,
      mod4: null,
      placeOfServiceID: null,
      icd1: null,
      icd2: null,
      icd3: null,
      icd4: null,
      ndcNumber: null,
      ndcUnit: null,
      ndcUnitQualifierID: null,
      serviceDescription: null,
      fee: null,
      insuranceAmount: null,
      patientAmount: null,
      chargeBatchID: null,
      chargePostingDate: null,
      systemDocumentID: null,
      pageNumber: null,
      pointers: null,
      sortOrder: null,
      revenueCode: '',
    };
    const updatedNdc = ndcEditDataRows?.filter((a) => a.isChecked)
      ? ndcEditDataRows?.filter((a) => a.isChecked)[0]
      : null;
    const updateObj = chargesRow?.filter((a) => a.charge?.chargeID === id);
    const pointerArr = [];
    pointerArr.push(
      updateObj &&
        updateObj.length > 0 &&
        updateObj[0] &&
        icdRows
          ?.filter((a) => a.icd10Code === updateObj[0]?.charge?.icd1)
          .map((a) => a.order)[0]
        ? icdRows
            ?.filter((a) => a.icd10Code === updateObj[0]?.charge?.icd1)
            .map((a) => a.order)[0]
        : ''
    );
    pointerArr.push(
      updateObj &&
        updateObj.length > 0 &&
        updateObj[0] &&
        icdRows
          ?.filter((a) => a.icd10Code === updateObj[0]?.charge?.icd2)
          .map((a) => a.order)[0]
        ? icdRows
            ?.filter((a) => a.icd10Code === updateObj[0]?.charge?.icd2)
            .map((a) => a.order)[0]
        : ''
    );
    pointerArr.push(
      updateObj &&
        updateObj.length > 0 &&
        updateObj[0] &&
        icdRows
          ?.filter((a) => a.icd10Code === updateObj[0]?.charge?.icd3)
          .map((a) => a.order)[0]
        ? icdRows
            ?.filter((a) => a.icd10Code === updateObj[0]?.charge?.icd3)
            .map((a) => a.order)[0]
        : ''
    );
    pointerArr.push(
      updateObj &&
        updateObj.length > 0 &&
        updateObj[0] &&
        icdRows
          ?.filter((a) => a.icd10Code === updateObj[0]?.charge?.icd4)
          .map((a) => a.order)[0]
        ? icdRows
            ?.filter((a) => a.icd10Code === updateObj[0]?.charge?.icd4)
            .map((a) => a.order)[0]
        : ''
    );
    const pointerStr = pointerArr.filter((a) => a !== '').join(',');
    updateJson = {
      ...updateJson,
      claimID,
      chargeID:
        updateObj && updateObj.length > 0
          ? updateObj[0]?.charge?.chargeID
          : null,
      groupID: selectedGroup?.id,
      fromDOS:
        updateObj && updateObj.length > 0
          ? updateObj[0]?.charge?.fromDOS
          : null,
      toDOS:
        updateObj && updateObj.length > 0 ? updateObj[0]?.charge?.toDOS : null,
      cptCode:
        updateObj && updateObj.length > 0
          ? updateObj[0]?.charge?.cptCode
          : null,
      units:
        updateObj && updateObj.length > 0 ? updateObj[0]?.charge?.units : null,
      mod1:
        updateObj && updateObj.length > 0 ? updateObj[0]?.charge?.mod1 : null,
      mod2:
        updateObj && updateObj.length > 0 ? updateObj[0]?.charge?.mod2 : null,
      mod3:
        updateObj && updateObj.length > 0 ? updateObj[0]?.charge?.mod3 : null,
      mod4:
        updateObj && updateObj.length > 0 ? updateObj[0]?.charge?.mod4 : null,
      placeOfServiceID:
        updateObj && updateObj.length > 0
          ? updateObj[0]?.charge?.placeOfServiceID
          : null,
      icd1:
        updateObj && updateObj.length > 0 ? updateObj[0]?.charge?.icd1 : null,
      icd2:
        updateObj && updateObj.length > 0 ? updateObj[0]?.charge?.icd2 : null,
      icd3:
        updateObj && updateObj.length > 0 ? updateObj[0]?.charge?.icd3 : null,
      icd4:
        updateObj && updateObj.length > 0 ? updateObj[0]?.charge?.icd4 : null,
      ndcNumber: updatedNdc && updatedNdc.ndcRowsData?.ndcCode,
      ndcUnit: updatedNdc && updatedNdc.ndcRowsData?.units,
      ndcUnitQualifierID:
        updatedNdc && updatedNdc.ndcRowsData?.ndcUnitQualifierID,
      serviceDescription:
        updatedNdc && updatedNdc.ndcRowsData?.serviceDescription,
      fee: updateObj && updateObj.length > 0 ? updateObj[0]?.charge?.fee : null,
      insuranceAmount:
        updateObj && updateObj.length > 0
          ? updateObj[0]?.charge?.insuranceAmount
          : null,
      patientAmount:
        updateObj && updateObj.length > 0
          ? updateObj[0]?.charge?.patientAmount
          : null,
      chargeBatchID:
        updateObj && updateObj.length > 0
          ? updateObj[0]?.charge?.chargeBatchID
          : null,
      chargePostingDate:
        updateObj && updateObj.length > 0
          ? updateObj[0]?.charge?.chargePostingDate
          : null,
      systemDocumentID:
        updateObj && updateObj.length > 0
          ? updateObj[0]?.charge?.systemDocumentID
          : null,
      pageNumber: batchDocumentPage ? batchDocumentPage.id : null,
      pointers: pointerStr,
      revenueCode:
        updateObj && updateObj.length > 0
          ? updateObj[0]?.charge?.revenueCode || ''
          : '',
    };
    const isValid = chargesDataValidation(updateJson);
    if (isValid) {
      onToggleEditMode(id);
      dispatch(updateChargesRequest(updateJson));
      setChargesRow(() => {
        return chargesRow?.map((row) => {
          if (row && row?.charge?.chargeID === id) {
            return { ...row, charge: updateJson, isEditMode: true };
          }
          return { ...row, isEditMode: true };
        });
      });
    }
  };
  const handleSaveButtonClick = async (chargeID: number) => {
    const claimSaved = await saveClaim();
    if (claimSaved) {
      updateCharges(chargeID);
    }
  };
  const handleChargeUpdateClick = async () => {
    const claimSaved = await saveClaim();
    if (claimSaved) {
      saveChargesWithClaim();
    }
  };

  const uploadClaimDocument = async () => {
    if (!selectedattachmentType) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Please select an attachment type in order to upload a file.',
          toastType: ToastType.ERROR,
        })
      );
      return;
    }
    if (!selectedFile) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Please select file.',
          toastType: ToastType.ERROR,
        })
      );
      return;
    }
    if (selectedFile && claimID && selectedattachmentType && selectedGroup) {
      const file: File = selectedFile;
      const formData: FormData = new FormData();
      formData.append('file', file);
      formData.append('claimID', claimID.toString());
      formData.append(
        'patientID',
        selectedPatient ? selectedPatient.id.toString() : ''
      );
      formData.append(
        'clientID',
        selectedGroup ? selectedGroup.id.toString() : ''
      );
      formData.append(
        'practiceID',
        selectedPractice ? selectedPractice.id.toString() : ''
      );
      formData.append(
        'categoryID',
        selectedattachmentType ? selectedattachmentType.id.toString() : ''
      );
      formData.append('eAttachment', '');
      const res = await uploadFile(formData);
      if (res) {
        setSelectedFile(null);
        setSelectedFileName(undefined);
        setSelectedAttachmentType(undefined);
        getClaimDocumentData();
      }
    }
  };
  const updateEAttachmentClaimDoc = async (
    uploadDocRow: UploadedDocumentOutput
  ) => {
    const updateEAttachData = {
      documentID: uploadDocRow.id,
      eAttachment: !uploadDocRow.e_attachment,
    };
    const res = await updateClaimDocumentEAttachment(updateEAttachData);
    if (res) {
      if (uploadDocumentData) {
        const latestData = uploadDocumentData.map((row) => {
          if (row && row?.id === uploadDocRow.id) {
            return { ...row, e_attachment: !uploadDocRow.e_attachment };
          }
          return { ...row };
        });
        dispatch(fetchUploadedClaimDocumentSuccess(latestData));
      }
    }
  };
  const updateChargeResponse = useSelector(getUpdateChargeSelector);
  useOnceEffect(() => {
    if (updateChargeResponse) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: updateChargeResponse.message,
          toastType: ToastType.SUCCESS,
        })
      );
    }
  }, [updateChargeResponse]);
  const scrubClaimResponse = useSelector(getScrubClaimSelector);
  useOnceEffect(() => {
    if (scrubClaimResponse) {
      if (
        scrubClaimResponse.scrubStatus &&
        scrubClaimResponse.scrubStatus.length > 0
      ) {
        const scrubStatusData = lookupsData?.scrubStatus
          .filter(
            (a) => a.id === scrubClaimResponse.scrubStatus[0]?.scrubStatusID
          )
          .map((a) => a.value);
        const scrubStatus = scrubStatusData ? scrubStatusData[0] : 'Unscrubbed';
        setScrubClaimStatus(scrubStatus);
        if (scrubStatus && scrubStatus.toLowerCase().includes('forcefully')) {
          setScrubClaimIcon('user');
          setScrubClaimIconColor(IconColors.Yellow);
          setScrubClaimClass('bg-yellow-100 text-yellow-800');
        } else if (
          scrubStatus &&
          scrubStatus.toLowerCase().includes('informational')
        ) {
          setScrubClaimIcon('desktop');
          setScrubClaimIconColor(IconColors.Yellow);
          setScrubClaimClass('bg-yellow-100 text-yellow-800');
        } else if (
          scrubStatus &&
          (scrubStatus.toLowerCase().includes('warning') ||
            scrubStatus.toLowerCase().includes('error'))
        ) {
          setScrubClaimIcon('desktop');
          setScrubClaimIconColor(IconColors.RED);
          setScrubClaimClass('bg-red-100 text-red-800');
        } else if (
          scrubStatus &&
          scrubStatus.toLowerCase().includes('passed')
        ) {
          setScrubClaimIcon('desktop');
          setScrubClaimIconColor(IconColors.GREEN);
          setScrubClaimClass('bg-green-100 text-green-800');
        } else {
          setScrubClaimIcon('desktop');
          setScrubClaimIconColor(IconColors.GRAY);
          setScrubClaimClass('bg-gray-100 text-gray-800');
        }
      }
      if (
        scrubClaimResponse.response &&
        scrubClaimResponse.response !== 'No Response Found'
      ) {
        setIsScrubResponseModalOpen(true);
      }
      if (
        scrubClaimResponse.response &&
        scrubClaimResponse.response === 'No Response Found'
      ) {
        setIsScrubResultModalOpen(true);
      }
    }
  }, [scrubClaimResponse]);
  const onSubmitClaim = async (
    id: number | null | undefined,
    submitAsIs: boolean
  ) => {
    const res = await submitClaim([{ claimID: id, submitAs: submitAsIs }]);
    if (res) {
      claimsSubmittingResponse.current = res.response;
      const submitStatusData = lookupsData?.submitStatus
        .filter((a) => a.id === res.submitStatus[0]?.submitStatusID)
        .map((a) => a.value);
      const submitStatus = submitStatusData
        ? submitStatusData[0]
        : 'New / Draft';
      setSubmitClaimStatus(submitStatus);
      let heading = '';
      let description = '';
      let bottomDescription = '';
      const success = res.response.filter((m) => m.type === 'success').length;
      if (success > 0) {
        dispatch(
          addToastNotification({
            id: uuidv4(),
            text: 'Claim Successfully Submitted',
            toastType: ToastType.SUCCESS,
          })
        );
        if (isSubmitCreateButtonClicked) {
          onCreateNewClaim();
          setIsSubmitCreateButtonClicked(false);
        }
      } else {
        const warning = res.response.filter((m) => m.type === 'warning').length;
        const error = res.response.filter((m) => m.type === 'error').length;
        heading =
          warning === res.response.length
            ? 'Claim Issues Warning'
            : 'Submission Rejected by Nucleus';
        if (warning === res.response.length) {
          description =
            'We have identified issues with this claim that may cause it to be rejected.';
        } else if (error === res.response.length) {
          description =
            'We have identified critical errors that prevented the claim from being submitted.';
        } else {
          description =
            'We have identified both critical errors and potential issues that prevented the claim from being submitted.';
        }
        bottomDescription =
          warning === res.response.length
            ? 'We recommend fixing these issues before submitting the claim. You can also choose to submit the claim as is.'
            : 'Please fix the errors and try resubmitting.';
        setSubmitModalState({
          ...submitModalState,
          open: true,
          heading,
          description,
          bottomDescription,
          okButtonColor:
            warning === res.response.length
              ? ButtonType.secondary
              : ButtonType.primary,
          closeButtonColor:
            warning === res.response.length
              ? ButtonType.primary
              : ButtonType.secondary,
          okButtonText: warning === res.response.length ? 'Submit As Is' : 'OK',
          statusModalType:
            warning === res.response.length
              ? StatusModalType.WARNING
              : StatusModalType.ERROR,
          closeOnClickOutside: false,
          showCloseButton: warning === res.response.length,
          closeButtonText: 'Cancel Submission',
          statusData: claimsSubmittingResponse
            ? claimsSubmittingResponse.current.map((d) => {
                return { ...d, title: `#${d.id} - ${d.title}` };
              })
            : [],
        });
      }
    }
  };
  const [cptWithNewNDC, setCPTWithNewNDC] = useState('');

  const createNdcRule = (selectedCptCode: string) => {
    let createNdcJson: SaveCptNdcRequestPayload = {
      cptNdcCrosswalkID: null,
      practiceID: null,
      cptCode: null,
      ndcNumber: null,
      ndcUnitQualifierID: null,
      ndcUnit: null,
      icd1: null,
      icd2: null,
      serviceDescription: null,
    };
    setCPTWithNewNDC(selectedCptCode);
    const createNdcCode = ndcCode
      ? ndcCode.replace('-', '').replace('-', '')
      : null;
    createNdcJson = {
      ...createNdcJson,
      cptNdcCrosswalkID: null,
      practiceID: selectedPractice ? selectedPractice?.id : null,
      cptCode: selectedCptCode,
      ndcNumber: createNdcCode || null,
      ndcUnitQualifierID: dosageForm ? dosageForm.id : null,
      ndcUnit: chargeNdcUnits || null,
      icd1: null,
      icd2: null,
      serviceDescription: chargeNdcDescription || null,
    };
    const isValid = createNdcValidation(createNdcJson);
    if (isValid) {
      dispatch(saveCptNdcRequest(createNdcJson));
    }
  };
  const updateNdcRule = () => {
    const checkSelectedRow = ndcRow?.filter((a) => a.isChecked);
    if (checkSelectedRow && checkSelectedRow.length === 0) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'At least one NDC rule should be selected.',
          toastType: ToastType.ERROR,
        })
      );
      return;
    }
    let updateNdcJson: SaveCptNdcRequestPayload = {
      cptNdcCrosswalkID: null,
      practiceID: null,
      cptCode: null,
      ndcNumber: null,
      ndcUnitQualifierID: null,
      ndcUnit: null,
      icd1: null,
      icd2: null,
      serviceDescription: null,
    };
    updateNdcJson = {
      ...updateNdcJson,
      cptNdcCrosswalkID:
        checkSelectedRow &&
        checkSelectedRow[0] &&
        checkSelectedRow[0]?.ndcRowsData
          ? checkSelectedRow[0]?.ndcRowsData.id
          : null,
      practiceID: selectedPractice ? selectedPractice?.id : null,
      cptCode:
        checkSelectedRow &&
        checkSelectedRow[0] &&
        checkSelectedRow[0]?.ndcRowsData
          ? checkSelectedRow[0]?.ndcRowsData.cptCode
          : null,
      ndcNumber:
        checkSelectedRow &&
        checkSelectedRow[0] &&
        checkSelectedRow[0]?.ndcRowsData
          ? checkSelectedRow[0]?.ndcRowsData.ndcCode
          : null,
      ndcUnitQualifierID:
        checkSelectedRow &&
        checkSelectedRow[0] &&
        checkSelectedRow[0]?.ndcRowsData
          ? checkSelectedRow[0]?.ndcRowsData.ndcUnitQualifierID
          : undefined,
      ndcUnit:
        checkSelectedRow &&
        checkSelectedRow[0] &&
        checkSelectedRow[0]?.ndcRowsData
          ? checkSelectedRow[0]?.ndcRowsData.units
          : null,
      icd1: null,
      icd2: null,
      serviceDescription:
        checkSelectedRow &&
        checkSelectedRow[0] &&
        checkSelectedRow[0]?.ndcRowsData
          ? checkSelectedRow[0]?.ndcRowsData.serviceDescription
          : null,
    };
    const isValid = createNdcValidation(updateNdcJson);
    if (isValid) {
      dispatch(saveCptNdcRequest(updateNdcJson));
    }
    setUpadteCptNdc(true);
  };
  const updateSelectedChargeNdcRule = () => {
    const checkSelectedRow = ndcEditDataRows?.filter((a) => a.isChecked);
    if (checkSelectedRow && checkSelectedRow.length === 0) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'At least one NDC rule should be selected.',
          toastType: ToastType.ERROR,
        })
      );
      return;
    }
    let updateNdcJson: SaveCptNdcRequestPayload = {
      cptNdcCrosswalkID: null,
      practiceID: null,
      cptCode: null,
      ndcNumber: null,
      ndcUnitQualifierID: null,
      ndcUnit: null,
      icd1: null,
      icd2: null,
      serviceDescription: null,
    };
    updateNdcJson = {
      ...updateNdcJson,
      cptNdcCrosswalkID:
        checkSelectedRow &&
        checkSelectedRow[0] &&
        checkSelectedRow[0]?.ndcRowsData
          ? checkSelectedRow[0]?.ndcRowsData.id
          : null,
      practiceID: selectedPractice ? selectedPractice?.id : null,
      cptCode:
        checkSelectedRow &&
        checkSelectedRow[0] &&
        checkSelectedRow[0]?.ndcRowsData
          ? checkSelectedRow[0]?.ndcRowsData.cptCode
          : null,
      ndcNumber:
        checkSelectedRow &&
        checkSelectedRow[0] &&
        checkSelectedRow[0]?.ndcRowsData
          ? checkSelectedRow[0]?.ndcRowsData.ndcCode
          : null,
      ndcUnitQualifierID:
        checkSelectedRow &&
        checkSelectedRow[0] &&
        checkSelectedRow[0]?.ndcRowsData
          ? checkSelectedRow[0]?.ndcRowsData.ndcUnitQualifierID
          : undefined,
      ndcUnit:
        checkSelectedRow &&
        checkSelectedRow[0] &&
        checkSelectedRow[0]?.ndcRowsData
          ? checkSelectedRow[0]?.ndcRowsData.units
          : null,
      icd1: null,
      icd2: null,
      serviceDescription:
        checkSelectedRow &&
        checkSelectedRow[0] &&
        checkSelectedRow[0]?.ndcRowsData
          ? checkSelectedRow[0]?.ndcRowsData.serviceDescription
          : null,
    };
    const isValid = createNdcValidation(updateNdcJson);
    if (isValid) {
      dispatch(saveCptNdcRequest(updateNdcJson));
    }
  };
  const saveChargeResponse = useSelector(getSavedChargeSelector);
  const saveCptNdcResponse = useSelector(getSavedCptNdcSelector);
  const ResetAddChargeData = (chargeID: number) => {
    setshowAddChargesRow(!showAddChargesRow);
    if (savedCharges) {
      savedCharges.chargeID = chargeID;
      chargesRow?.push({
        charge: savedCharges,
        isEditMode: true,
      });
      setSavedCharges(undefined);
    }
    setshowAddChargesRow(false);
    setSelectedCpt(null);
    setSelectedRevenueCodeData(undefined);
    setChargesFromDOS(fromDOS);
    setChargesToDOS(toDOS);
    setSelectedModifier1(null);
    setSelectedModifier2(null);
    setSelectedModifier3(null);
    setSelectedModifier4(null);
    setChargeUnits(1);
    setSelectedChargePOS(selectedPlaceOfService);
    setdxCode([]);
    setSelectedChargeFee(undefined);
    setPatResp(0);
    setInsResp(0);
    setbatchDocument(undefined);
    setbatchNumber(undefined);
    setbatchDocumentPage(undefined);
    setPostingDate(new Date());
  };
  useOnceEffect(() => {
    if (saveChargeResponse) {
      ResetAddChargeData(saveChargeResponse?.chargeID);
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: `${'Successfully Saved Charge'} ( ${
            saveChargeResponse.chargeID
          } ) `,
          toastType: ToastType.SUCCESS,
        })
      );
    }
  }, [saveChargeResponse]);
  useOnceEffect(() => {
    if (saveCptNdcResponse) {
      setDosageForm(null);
      setChargeNdcUnits(1);
      setChargeNdcDescription(undefined);
      setNDCCode(undefined);
      if (cptWithNewNDC && selectedPractice) {
        const ndcData = {
          cptCode: cptWithNewNDC,
          practiceID: selectedPractice.id,
        };
        dispatch(fetchCPTNdcDataRequest(ndcData));
      }
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: `${saveCptNdcResponse.message}  `,
          toastType: ToastType.SUCCESS,
        })
      );
    }
  }, [saveCptNdcResponse]);
  useOnceEffect(() => {
    setClaimID(saveClaimResponse?.claimID);
    if (!selectedClaimID) {
      setIsEditMode(!!saveClaimResponse?.claimID);
    }
    if (
      saveClaimResponse &&
      saveClaimResponse?.claimID &&
      isSubmitButtonClicked
    ) {
      onSubmitClaim(saveClaimResponse?.claimID, false);
      setIsSubmitButtonClicked(false);
    }
    // save and create new claim
    if (
      saveClaimResponse &&
      saveClaimResponse?.claimID &&
      isCreateClaimButtonClicked
    ) {
      onCreateNewClaim();
      setCreateClaimButtonClicked(false);
    }
    if (saveClaimResponse?.chargeID) {
      ResetAddChargeData(saveClaimResponse?.chargeID);
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: `${'Successfully Saved Charge'} ( ${
            saveClaimResponse?.chargeID
          } ) `,
          toastType: ToastType.SUCCESS,
        })
      );
      return;
    }
    if (saveClaimResponse) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: `${'Successfully Saved Claim'} 
           ${
             saveClaimResponse.claimID
               ? ` ( ${saveClaimResponse.claimID} ) `
               : ''
           }  `,
          toastType: ToastType.SUCCESS,
        })
      );
    }
  }, [saveClaimResponse]);

  // charges section changes
  const myRef = useRef<HTMLTableRowElement>(null);
  const icdTableRef = useRef<HTMLTableRowElement>(null);
  const [chargesCollapse, setchargesCollapse] = useState(false);
  const [chargesSort, setchargesSort] = useState(false);
  const [showGridDropdown, setShowGridDropdown] = useState(false);
  const ndcTableHeader = [
    '',
    'NDC Code daa',
    'Units',
    'Dosage From',
    'Service Description',
  ];

  const chargeBatchHeader = ['Batch #', 'Posting Date', 'Document', 'Page'];

  const getNdcPopupData = (cptCode: string | null | undefined) => {
    if (selectedPractice && cptCode) {
      const ndcData = {
        cptCode,
        practiceID: selectedPractice.id,
      };
      dispatch(fetchCPTNdcDataRequest(ndcData));
    }
  };
  // const [tablekey, settablekey] = useState('');
  const startIndex = React.useRef<number | undefined>();
  const [dragOverIndex, setDragOverIndex] = useState<number | undefined>();
  const onNdcChange = (id: number | null | undefined) => {
    setndcRow(() => {
      return ndcRow?.map((row) => {
        if (row.ndcRowsData?.id !== id && row.isChecked === true) {
          setselectedNdc(null);
          return { ...row, isChecked: false };
        }
        if (row.ndcRowsData?.id === id && row.isChecked) {
          setselectedNdc(null);
          const dataObj = cptNdcData?.filter(
            (a) => a.id === row.ndcRowsData?.id
          );
          if (dataObj && dataObj.length > 0 && row.ndcRowsData) {
            row.ndcRowsData.units = dataObj[0]?.units
              ? dataObj[0].units
              : undefined;
            row.ndcRowsData.ndcUnitQualifierID = dataObj[0]?.ndcUnitQualifierID
              ? dataObj[0].ndcUnitQualifierID
              : undefined;
            return {
              ...row,
              isChecked: !row.isChecked,
              isDisabled: !!row.isChecked,
            };
          }
        }
        if (row.ndcRowsData?.id === id) {
          if (!row.isChecked) {
            setselectedNdc(row.ndcRowsData?.ndcCode);
          }
          return {
            ...row,
            isChecked: !row.isChecked,
            isDisabled: !!row.isChecked,
          };
        }

        return row;
      });
    });
  };
  const onNdcEditChange = (id: number | null | undefined) => {
    setNdcEditData(() => {
      return ndcEditDataRows?.map((row) => {
        if (row.ndcRowsData?.id === id) {
          return {
            ...row,
            isChecked: !row.isChecked,
            isDisabled: !!row.isChecked,
          };
        }
        return {
          ...row,
          isChecked: false,
          isDisabled: true,
        };
      });
    });
    // const editNdc =
    //   ndcEditDataRows?.filter((a) => a.isChecked) &&
    //   ndcEditDataRows?.filter((a) => a.isChecked)[0];
    // if (editNdc) {
    //   setChargesRow(() => {
    //     return chargesRow?.map((editRow) => {
    //       if (!editRow.isEditMode) {
    //         if (editRow.charge) {
    //           editRow.charge.ndcNumber = editNdc?.ndcRowsData?.ndcCode || '';
    //           return {
    //             ...editRow,
    //           };
    //         }
    //       }
    //       return editRow;
    //     });
    //   });
    // }
  };
  useEffect(() => {
    if (ndcEditDataRows?.length) {
      const editNdc = ndcEditDataRows.find((row) => row.isChecked);
      // if (editNdc) {
      setChargesRow((prevChargesRow) => {
        return prevChargesRow?.map((editRow) => {
          if (!editRow.isEditMode && editRow.charge) {
            return {
              ...editRow,
              charge: {
                ...editRow.charge,
                ndcNumber: editNdc?.ndcRowsData
                  ? editNdc?.ndcRowsData.ndcCode || ''
                  : '',
              },
            };
          }
          return editRow;
        });
      });
    } else {
      setChargesRow((prevChargesRow) => {
        return prevChargesRow?.map((editRow) => {
          if (!editRow.isEditMode && editRow.charge) {
            return {
              ...editRow,
              charge: {
                ...editRow.charge,
                ndcNumber: '',
              },
            };
          }
          return editRow;
        });
      });
    }
  }, [ndcEditDataRows]);

  const priorityOrderRender = (n: number | undefined) => {
    return (
      <div
        className={`[box-shadow:0px_0px_0px_1px_rgba(6,_182,_212,_1)_inset] [box-shadow-width:1px] w-5 h-5 relative rounded text-white text-left font-semibold bg-[rgba(6,182,212,1)] overflow-clip font-['Nunito'] mr-3`}
      >
        <p className="absolute left-1.5 top-0.5 m-0 text-xs leading-4">{n}</p>
      </div>
    );
  };

  const [chargesDxData, setChargesDxData] = useState<
    MultiSelectGridDropdownDataType[]
  >([]);
  useEffect(() => {
    const processedData: MultiSelectGridDropdownDataType[] | [] =
      icdRows && icdRows.length > 0
        ? (icdRows
            .filter((row) => row.selectedICDObj) // Only include rows where selectedICDObj has a value
            .map((row) => ({
              ...row.selectedICDObj,
              leftIcon: priorityOrderRender(row.order),
            })) as MultiSelectGridDropdownDataType[])
        : [];

    setChargesDxData(processedData);
  }, [icdRows]);
  // update Charge Fee
  useEffect(() => {
    if (chargeUnits) {
      const calculatedFee = chargeFee ? chargeFee.fee * chargeUnits : 0;
      setSelectedChargeFee(calculatedFee);
    } else {
      setSelectedChargeFee(chargeFee ? chargeFee.fee : 0);
    }
    if (selectedPrimaryInsurance) {
      const chargeAmt = chargeFee ? chargeFee.fee * (chargeUnits || 1) : 0;
      setInsResp(chargeAmt);
      setPatResp(0);
    } else {
      setPatResp(chargeFee ? chargeFee.fee * (chargeUnits || 1) : 0);
      setInsResp(0);
    }
  }, [chargeFee, chargeUnits]);
  useEffect(() => {
    setChargesFromDOS(fromDOS);
  }, [fromDOS]);
  useEffect(() => {
    if (cptNdcData) {
      setCPTWithNewNDC('');
    }

    const chargesFilterRow = chargesRow?.filter((a) => a.isEditMode === false);
    if (chargesFilterRow && chargesFilterRow.length > 0) {
      const copyData = cptNdcData?.map((a) => ({
        ndcRowsData: a,
        isChecked: false,
        isDisabled: true,
      }));
      const jsonNdcArr = JSON.parse(JSON.stringify(copyData));

      setNdcEditData(() => {
        return jsonNdcArr?.map((row2: NdcData) => {
          if (
            row2.ndcRowsData?.ndcCode === chargesFilterRow[0]?.charge?.ndcNumber
          ) {
            if (row2.ndcRowsData) {
              row2.ndcRowsData.units = chargesFilterRow[0]?.charge?.ndcUnit;
              row2.ndcRowsData.ndcUnitQualifierID = chargesFilterRow[0]?.charge
                ?.ndcUnitQualifierID
                ? chargesFilterRow[0]?.charge?.ndcUnitQualifierID
                : undefined;
              row2.isChecked = true;
              row2.isDisabled = false;
              return {
                ...row2,
              };
            }
          }
          if (row2.ndcRowsData) {
            row2.isChecked = true;
            row2.isDisabled = false;
          }
          return row2;
        });
      });
    } else {
      const arrObj1 = cptNdcData?.map((a: CPTNDCOutput) => ({
        ndcRowsData: a,
        isChecked: !updateCptNdc,
        isDisabled: !!updateCptNdc,
      }));
      const jsonArr1 = JSON.stringify(arrObj1);
      setndcRow(JSON.parse(jsonArr1));
      if (updateCptNdc) {
        setselectedNdc(null);
      } else if (arrObj1) {
        setselectedNdc(arrObj1[0]?.ndcRowsData.ndcCode);
      }
    }
  }, [cptNdcData]);
  const checkCPTCode = () => {
    // Iterate through each row in the chargesRow array
    return chargesRow?.some((row) => {
      const cptCode = row?.charge?.cptCode;
      return cptCode && (cptCode.charAt(0) === 'J' || cptCode.startsWith('90'));
    });
  };
  const shouldRenderCPTCell = () => {
    return (
      checkCPTCode() ||
      selectedCpt?.value[0] === 'J' ||
      (selectedCpt?.value[0] === '9' && selectedCpt?.value[1] === '0')
    );
  };
  const editClaimResponse = useSelector(getEditClaimResponseSelector);
  const [editModePaymentData, setEditModePaymentData] = useState<
    SavePaymentRequestPayload[]
  >([]);
  const saveAdvancePaymentInEditMode = async () => {
    if (editModePaymentData.length) {
      const res = await savePatientCollectedAdvancePaymentList(
        editModePaymentData
      );
      if (res) {
        setEditModePaymentData([]);
      }
    }
  };
  useEffect(() => {
    if (editClaimResponse?.message) {
      saveAdvancePaymentInEditMode();
    }
  }, [editClaimResponse]);

  useEffect(() => {
    setChargesToDOS(toDOS);
  }, [toDOS]);
  useEffect(() => {
    setShowGridDropdown(true);
  }, []);
  // charges section ends
  // Search Provider
  const [isModalOpen, setIsModalOpen] = useState(false);
  const error = useSelector(getErrorSelector);
  useEffect(() => {
    if (error) {
      setIsModalOpen(false);
    }
  }, [error]);
  const [patientDetailsModal, setPatientDetailsModal] = useState<{
    open: boolean;
    id: number | null;
  }>({
    open: false,
    id: null,
  });
  const [newPatientID, setNewPatientID] = useState<number | null>(null);
  useEffect(() => {
    if (newPatientID) {
      setPatientsearch({
        ...patientsearch,
        searchValue: newPatientID.toString(),
      });
    }
  }, [newPatientID]);
  useEffect(() => {
    if (patientSearchData?.length === 1) {
      setSelectedPatient(patientSearchData[0]);
    }
  }, [patientSearchData]);
  const [autoRenderModal, setAutoRenderModal] = useState<{
    open: boolean;
    id: number | null;
  }>({
    open: false,
    id: null,
  });
  return (
    <AppLayout title="Nucleus - Create Claim">
      {claimID && noteSliderOpen && (
        <AddEditViewNotes
          id={claimID}
          open={noteSliderOpen}
          noteType={'claim'}
          groupID={selectedGroup?.id}
          onClose={(isAddEdit?: boolean) => {
            setNoteSliderOpen(false);
            if (isAddEdit) {
              setViewNoteskey(uuidv4());
            }
          }}
          disableBackdropClick={true}
        />
      )}
      <StatusModal
        open={submitModalState.open}
        heading={submitModalState.heading}
        description={submitModalState.description}
        okButtonText={submitModalState.okButtonText}
        bottomDescription={submitModalState.bottomDescription}
        closeButtonText={submitModalState.closeButtonText}
        closeButtonColor={submitModalState.closeButtonColor}
        okButtonColor={submitModalState.okButtonColor}
        statusModalType={submitModalState.statusModalType}
        showCloseButton={submitModalState.showCloseButton}
        statusData={submitModalState.statusData}
        closeOnClickOutside={submitModalState.closeOnClickOutside}
        onClose={() => {
          setSubmitModalState({
            ...submitModalState,
            open: false,
          });
          if (submitModalState.showCloseButton) {
            dispatch(
              addToastNotification({
                id: uuidv4(),
                text: 'Submission Canceled by User',
                toastType: ToastType.ERROR,
              })
            );
          }
        }}
        onChange={() => {
          setSubmitModalState({
            ...submitModalState,
            open: false,
          });
          if (!submitModalState.showCloseButton) {
            dispatch(
              addToastNotification({
                id: uuidv4(),
                text: 'Submission Error: Rejected by Nucleus',
                toastType: ToastType.ERROR,
              })
            );
          } else {
            onSubmitClaim(claimID, true);
          }
        }}
      />
      <Modal
        open={patientDetailsModal.open}
        modalContentClassName="relative w-[93%] h-[94%] text-left overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 w-full"
        onClose={() => {}}
      >
        <PatientDetailModal
          isPopup={patientDetailsModal.open}
          selectedPatientID={patientDetailsModal.id}
          onCloseModal={() => {
            const patientID = patientDetailsModal.id ?? newPatientID;
            if (patientID) {
              dispatch(fetchPatientInsranceDataRequest({ patientID }));
            }
            setPatientDetailsModal({
              open: false,
              id: null,
            });
          }}
          onSave={(value) => {
            setNewPatientID(value);
          }}
        />
      </Modal>

      <Modal
        open={isScrubResponseModalOpen}
        modalContentClassName="relative w-[1232px] overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 w-full"
        onClose={() => {
          setIsScrubResponseModalOpen(false);
        }}
      >
        <div className="h-[600px] overflow-scroll">
          {
            <div
              className="m-5"
              dangerouslySetInnerHTML={{
                __html: scrubClaimResponse
                  ? scrubClaimResponse.response +
                    scrubClaimResponse.adnareResponse
                  : '',
              }}
            />
          }
        </div>
      </Modal>
      <Modal
        open={isScrubResultModalOpen}
        modalContentClassName="relative w-[632px] overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 w-full"
        onClose={() => {
          setIsScrubResponseModalOpen(false);
        }}
      >
        <div className="h-[300px] overflow-scroll">
          <div className="max-w-full bg-gray-300 p-4">
            <div className="flex flex-row justify-between">
              <div>
                <h1 className=" text-left  text-xl font-bold leading-7 text-gray-700">
                  Claim Submission Validations
                </h1>
              </div>
              <div className="">
                <CloseButton
                  onClick={() => {
                    setIsScrubResultModalOpen(false);
                  }}
                />
              </div>
            </div>
          </div>
          <div />
          {
            <>
              {scrubClaimResponse &&
                scrubClaimResponse.result?.map((row) => (
                  <>
                    {row.chargeID ? (
                      <div className="mx-10 mt-2 text-left font-bold">
                        {row.chargeID}
                      </div>
                    ) : (
                      ''
                    )}
                    <div className="mx-10 mt-2 text-left">
                      {row.errormessage}
                    </div>
                  </>
                ))}
            </>
          }
        </div>
      </Modal>
      <div className="relative m-0 h-full bg-gray-100 p-0">
        <div className="m-0 h-full w-full overflow-y-scroll bg-gray-100 p-0">
          <div className="flex w-full flex-col">
            <div className="m-0 h-full w-full overflow-y-auto overflow-x-hidden bg-gray-100 p-0">
              <div className="h-[225px] w-full">
                <div className="absolute top-0 z-[11] w-full">
                  <Breadcrumbs />
                  <PageHeader cls="h-[238px]">
                    <div className="absolute top-[33px] inline-flex w-full flex-col items-start gap-5 text-clip px-5 font-bold leading-9 text-[rgba(14,116,144,1)]">
                      <div className="flex w-full items-center justify-between self-stretch">
                        <div className="gap-6">
                          <div className="gap-2">
                            <p className="text-3xl">
                              {claimID
                                ? `Claim ID #${claimID}`
                                : `Create New Claim `}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-5">
                          {/* <ButtonsGroup
                            data={[
                              { id: 1, name: 'Print', icon: 'print' },
                              { id: 2, name: 'Export', icon: 'export' },
                              { id: 3, name: 'Assistant', icon: 'info' },
                            ]}
                            onClick={() => {}}
                          /> */}
                          <CloseButton />
                        </div>
                      </div>
                      <div className="h-px w-full bg-gray-200" />
                    </div>
                    <div className="absolute top-[116px] gap-2 px-5 font-medium leading-5 text-[rgba(14,116,144,1)]">
                      <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                          <div className="gap-2 text-left font-medium leading-5 text-[rgba(14,116,144,1)]">
                            <p className="text-sm">Claim Status:</p>
                          </div>
                          <Badge
                            cls="bg-gray-100 text-gray-800"
                            icon={
                              <Icon
                                name="user"
                                size={18}
                                color={IconColors.GRAY}
                              />
                            }
                            text={selectedClaimStatus || ''}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="gap-2 text-left font-medium leading-5 text-[rgba(14,116,144,1)]">
                            <p className="text-sm">Scrub Status:</p>
                          </div>
                          <Badge
                            cls={scrubClaimClass}
                            icon={
                              <Icon
                                name={scrubClaimIcon}
                                size={18}
                                color={scrubClaimIconColor}
                              />
                            }
                            text={scrubClaimStatus || ''}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="gap-2 text-left font-medium leading-5 text-[rgba(14,116,144,1)]">
                            <p className="text-sm">Claim Type:</p>
                          </div>
                          <Badge
                            cls="bg-gray-100 text-gray-800"
                            text={claimType || ''}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="gap-2 text-left font-medium leading-5 text-[rgba(14,116,144,1)]">
                            <p className="text-sm">Submit Status:</p>
                          </div>
                          <Badge
                            cls="bg-gray-100 text-gray-800"
                            text={submitClaimStatus || ''}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-[158px] inline-flex h-5 w-full px-5 ">
                      <div className="h-px w-full bg-gray-200" />
                    </div>
                    <div className="absolute top-44 flex flex-row gap-2 px-5 font-medium leading-5 text-gray-700">
                      <ViewNotes
                        key={claimID + viewNoteskey}
                        id={claimID || undefined}
                        noteType="claim"
                        groupID={selectedGroup?.id}
                        btnCls=""
                        disableBackdropClick={true}
                        buttonContent={
                          <Button
                            buttonType={ButtonType.secondary}
                            cls={`inline-flex px-4 py-2 gap-2 leading-5`}
                            onClick={async () => {
                              if (!claimID) {
                                dispatch(
                                  addToastNotification({
                                    id: uuidv4(),
                                    text: 'Please create claim first.',
                                    toastType: ToastType.ERROR,
                                  })
                                );
                              }
                            }}
                          >
                            <Icon name={'chatAlt2'} size={18} />
                            <p className="text-sm">View Claim Notes</p>
                            <div
                              className={`inline-flex items-center justify-center font-medium  transition-all rounded text-left leading-5 rounded-[10px] px-2.5 py-0.5 text-center leading-4 bg-gray-100 text-gray-800`}
                            >
                              <div
                                className={`transition-all flex h-full flex-1 items-center gap-2 self-stretch px-1 text-center`}
                              >
                                <p
                                  id={'viewNotesCount3@3&34'}
                                  className={`transition-all text-xs leading-2 font-medium`}
                                >
                                  {'0'}
                                </p>
                              </div>
                            </div>
                          </Button>
                        }
                      />
                      <Button
                        buttonType={ButtonType.primary}
                        cls={`w-[137px] inline-flex px-4 py-2 gap-2 leading-5 ml-2.5`}
                        onClick={async () => {
                          if (!claimID) {
                            dispatch(
                              addToastNotification({
                                id: uuidv4(),
                                text: 'Please create claim first.',
                                toastType: ToastType.ERROR,
                              })
                            );
                            return;
                          }
                          setNoteSliderOpen(true);
                        }}
                      >
                        <Icon name={'chat'} size={18} />
                        <p className="text-sm">Create Note</p>
                      </Button>
                    </div>
                  </PageHeader>
                </div>
              </div>
              <div className="pt-[72px] pl-[25px] pr-[29px]">
                <div
                  className={`relative text-gray-700 leading-7 text-left font-bold w-full h-[122px]`}
                >
                  <SectionHeading label="Patient" isCollapsable={false} />
                  <div
                    className={`absolute left-0 gap-6 inline-flex items-start top-[60px] `}
                  >
                    <div className={`gap-2 flex items-end`}>
                      <div className={`gap-1 w-auto`}>
                        <div className="flex gap-1">
                          <label className="text-sm font-medium  text-gray-700">
                            Choose an existing patient or add a new one
                          </label>
                          <InfoToggle
                            position="right"
                            text={
                              <div>
                                {' '}
                                CMS1500: BOX2 <br /> X12: LOOP 2010CA - NM103
                              </div>
                            }
                          />
                        </div>
                        <div
                          className={`w-full gap-2 flex flex-row items-start self-stretch`}
                        >
                          <div
                            data-testid="addClaimPatient"
                            className="w-[280px]"
                          >
                            <SingleSelectDropDown
                              placeholder="Patient Name"
                              forcefullyShowSearchBar={true}
                              disabled={isEditMode}
                              data={
                                patientSearchData?.length !== 0
                                  ? (patientSearchData as SingleSelectDropDownDataType[])
                                  : [
                                      {
                                        id: 1,
                                        value: 'No Record Found',
                                        active: false,
                                      },
                                    ]
                              }
                              selectedValue={selectedPatient}
                              onSelect={(value) => {
                                setSelectedPatient(value);
                                onSelectPrimaryInsurance({
                                  id: 0,
                                  value: '',
                                });
                                setIcdRows([
                                  {
                                    icd10Code: '',
                                    order: 1, // Increment the order based on the current length
                                    description: undefined,
                                    selectedICDObj: null,
                                    searchValue: '',
                                    data: [],
                                  },
                                ]);
                                setIcdOrderCount(1);
                              }}
                              onSearch={(value) => {
                                setPatientsearch({
                                  ...patientsearch,
                                  searchValue: value,
                                });
                              }}
                            />
                          </div>
                          <Button
                            buttonType={ButtonType.secondary}
                            cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5 mt-1`}
                            disabled={!selectedPatient}
                            onClick={() => {
                              setPatientDetailsModal({
                                open: true,
                                id: selectedPatient?.id || null,
                              });
                              // window.open(
                              //   `/app/register-patient/${selectedPatient?.id}`,
                              //   '_blank'
                              // );
                            }}
                          >
                            <Icon
                              name={'pencil'}
                              size={18}
                              color={IconColors.GRAY}
                            />
                          </Button>
                          <Button
                            buttonType={ButtonType.secondary}
                            cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5 mt-1`}
                            onClick={() => {
                              // window.open(`/app/register-patient`, '_blank');
                              // dispatch(
                              //   setGlobalModal({
                              //     type: 'Patient Detail',
                              //     id: null,
                              //     isPopup: true,
                              //   })
                              // );
                              setPatientDetailsModal({
                                open: true,
                                id: null,
                              });
                            }}
                          >
                            <Icon
                              name={'plus1'}
                              size={18}
                              color={IconColors.GRAY}
                            />
                          </Button>
                          <Button
                            buttonType={ButtonType.secondary}
                            cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5 mt-1`}
                            disabled={false}
                            onClick={() => {
                              setAutoRenderModal({
                                open: true,
                                id: selectedPatient?.id || null,
                              });
                            }}
                          >
                            <Icon
                              name={'link'}
                              size={18}
                              color={IconColors.GRAY}
                            />
                          </Button>
                        </div>
                      </div>
                    </div>
                    {/* <div className={`gap-2 flex items-end`}>
                <div className={`gap-1 w-auto`}>
                  <label className="text-sm font-medium leading-5 text-gray-700">
                    Link claim to patient treatment
                  </label>
                  <div
                    className={`w-full gap-1 justify-center flex flex-col items-start self-stretch`}
                  >
                    <div className="w-[280px] ">
                      <SingleSelectDropDown
                        placeholder="Select Treatment or add a new one"
                        showSearchBar={false}
                        disabled={false}
                        data={[
                          { id: 1, value: 'Diabetes' },
                          { id: 2, value: 'Back Pain PT' },
                        ]}
                        onSelect={() => {}}
                      />
                    </div>
                  </div>
                </div>
                <Button
                  buttonType={ButtonType.secondary}
                  cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 text-sm inline-flex `}
                >
                  <Icon name={'pencil'} size={18} color={IconColors.GRAY} />
                </Button>
                <Button
                  buttonType={ButtonType.secondary}
                  cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                >
                  <Icon name={'plus1'} size={18} color={IconColors.GRAY} />
                </Button>
              </div> */}
                  </div>
                </div>
                <div className="pt-[75px]">
                  <div
                    className={
                      billClaimToCollapse === false
                        ? `h-52 relative text-gray-700 leading-7 text-left font-bold w-full`
                        : `h-full relative text-gray-700 leading-7 text-left font-bold w-full`
                    }
                  >
                    <SectionHeading
                      label="Bill Claim To"
                      isCollapsable={true}
                      onClick={() =>
                        setBillClaimToCollapse(!billClaimToCollapse)
                      }
                      isCollapsed={billClaimToCollapse}
                    />
                    <div
                      hidden={billClaimToCollapse}
                      className="relative top-[60px]"
                    >
                      <div className={`relative `}>
                        <div className={`relative gap-1 w-[280px]`}>
                          <div
                            className={`w-full gap-1 flex flex-col items-start self-stretch`}
                          >
                            <label className="text-sm font-medium leading-5 text-gray-900">
                              Assignment Belongs to
                            </label>
                            <div className="w-[280px]">
                              <SingleSelectDropDown
                                placeholder="Assignment Belongs to"
                                showSearchBar={false}
                                disabled={true}
                                data={
                                  lookupsData?.assignmentBelongsTo
                                    ? (lookupsData?.assignmentBelongsTo as SingleSelectDropDownDataType[])
                                    : []
                                }
                                selectedValue={selectedAssignmentBelongsTo}
                                onSelect={(value) => {
                                  setSelectedAssignmentBelongsTo(value);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={`relative `}>
                        <div
                          className={`inset-0 relative gap-6 flex items-start`}
                        >
                          <div className={`flex`}>
                            <div className={`gap-2 flex items-end`}>
                              <div className="pt-[14px]">
                                <div className={`gap-1 w-[280px]`}>
                                  <div
                                    className={`w-full items-start self-stretch`}
                                  >
                                    <div className="flex gap-1">
                                      <label className="text-sm font-medium leading-5 text-gray-900">
                                        Primary Insurance
                                      </label>
                                      <InfoToggle
                                        position="right"
                                        text={
                                          <div>
                                            {' '}
                                            CMS1500 : BOX11-C <br /> X12 : LOOP
                                            2010BB - NM103
                                          </div>
                                        }
                                      />
                                    </div>
                                    <div className="w-[280px]">
                                      <SingleSelectDropDown
                                        placeholder="Primary Insurance"
                                        showSearchBar={false}
                                        disabled={false}
                                        data={
                                          primaryInsuranceData
                                            ? (primaryInsuranceData as SingleSelectDropDownDataType[])
                                            : []
                                        }
                                        selectedValue={
                                          selectedPrimaryInsurance &&
                                          (selectedPrimaryInsurance as SingleSelectDropDownDataType)
                                        }
                                        onSelect={(value) => {
                                          onSelectPrimaryInsurance(value);
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <Button
                                buttonType={ButtonType.secondary}
                                cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 text-sm inline-flex `}
                              >
                                <Icon
                                  name={'pencil'}
                                  size={18}
                                  color={IconColors.GRAY}
                                />
                              </Button>

                              <div className={`flex pl-[24px]`}>
                                <div className={`gap-1 w-[280px]`}>
                                  <div
                                    className={`w-full items-start self-stretch`}
                                  >
                                    <div className="flex gap-1">
                                      <label className="text-sm font-medium leading-5 text-gray-900">
                                        Relation to Insurance Subscriber
                                      </label>
                                      <InfoToggle
                                        position="right"
                                        text={
                                          <div>
                                            {' '}
                                            CMS1500 : BOX11 <br /> X12 : LOOP
                                            2010BA - NM109
                                          </div>
                                        }
                                      />
                                    </div>
                                    <div className="w-[280px]">
                                      <InputField
                                        placeholder="Relation to Insurance Subscriber"
                                        disabled={true}
                                        value={selectedSubscriberRelation}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-[75px]">
                  <div className="flow-root flex-col">
                    <SectionHeading
                      label="Service Details"
                      isCollapsable={true}
                      onClick={() =>
                        setServiceDetailsCollapse(!serviceDetailsCollapse)
                      }
                      isCollapsed={serviceDetailsCollapse}
                    />
                    <div className="flex-col pt-[65px]">
                      <div hidden={serviceDetailsCollapse}>
                        <div className={`relative flex gap-4 `}>
                          <div>
                            <div className="flex gap-1">
                              <label className="text-sm font-medium leading-5 text-gray-900">
                                DOS - From
                              </label>
                              <InfoToggle
                                position="right"
                                text={
                                  <div>
                                    {' '}
                                    CMS1500 : BOX24-A <br /> X12 : LOOP 2400 -
                                    DTP03 (472)
                                  </div>
                                }
                              />
                            </div>
                            <div className="w-[144px]">
                              <AppDatePicker
                                placeholderText="mm/dd/yyyy"
                                cls=""
                                disabled={isEditMode}
                                onChange={(date) => setfromDOS(date)}
                                selected={fromDOS}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex gap-1">
                              <label className="text-sm font-medium leading-5 text-gray-900">
                                DOS - To
                              </label>
                              <InfoToggle
                                position="right"
                                text={
                                  <div>
                                    {' '}
                                    CMS1500 : BOX24-A <br /> X12 : LOOP 2400 -
                                    DTP03 (472)
                                  </div>
                                }
                              />
                            </div>
                            <div className="w-[144px]">
                              <AppDatePicker
                                placeholderText="mm/dd/yyyy"
                                cls=""
                                onChange={(date) => setToDOS(date)}
                                selected={toDOS}
                                disabled={isEditMode}
                                // isOptional={!isEditMode}
                                // onDeselectValue={() => {
                                //   setToDOS(null);
                                // }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        hidden={serviceDetailsCollapse}
                        className="relative w-full pt-[40px]"
                      >
                        <div
                          className={`relative flex items-start gap-8 text-gray-700 leading-6 text-left font-bold w-full h-full `}
                        >
                          <div className={`gap-6 flex flex-col items-start`}>
                            <p className={`text-base inline m-0`}>
                              {'Location'}
                            </p>
                            <div className={`w-[280px]`}>
                              <div
                                className={`w-full items-start self-stretch`}
                              >
                                <label className="text-sm font-medium leading-5 text-gray-900">
                                  Group
                                </label>
                                <div className="w-[280px]">
                                  <InputField
                                    placeholder="Group"
                                    disabled={true}
                                    value={selectedGroup?.value}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className={`w-[280px]`}>
                              <div
                                className={`w-full items-start self-stretch`}
                              >
                                <label className="text-sm font-medium leading-5 text-gray-900">
                                  Practice
                                </label>
                                <div className="w-[280px]">
                                  <InputField
                                    placeholder="Practice"
                                    disabled={true}
                                    value={selectedPractice?.value}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className={`w-[280px]`}>
                              <div
                                className={`w-full items-start self-stretch`}
                              >
                                <div className="flex gap-1">
                                  <label className="text-sm font-medium leading-5 text-gray-900">
                                    Facility
                                  </label>
                                  <InfoToggle
                                    position="right"
                                    text={
                                      <div>
                                        {' '}
                                        CMS1500 : BOX32 <br /> X12 : LOOP 2310C
                                        - NM103
                                      </div>
                                    }
                                  />
                                </div>
                                <div className="w-[280px]">
                                  <SingleSelectDropDown
                                    placeholder="Facility"
                                    showSearchBar={true}
                                    disabled={false}
                                    data={
                                      facilitiesData
                                        ? (facilitiesData as SingleSelectDropDownDataType[])
                                        : []
                                    }
                                    selectedValue={selectedFacility}
                                    onSelect={(value) => {
                                      onSelectFacility(value);
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className={`w-[280px]`}>
                              <div
                                className={`w-full items-start self-stretch`}
                              >
                                <div className="flex gap-1">
                                  <label className="text-sm font-medium leading-5 text-gray-900">
                                    Place of Service
                                  </label>
                                  <InfoToggle
                                    position="right"
                                    text={
                                      <div>
                                        {' '}
                                        CMS1500 : BOX24-B <br /> X12 : LOOP 2400
                                        - SV105
                                      </div>
                                    }
                                  />
                                </div>
                                <div className="w-[280px]" data-testid="pos">
                                  <SingleSelectDropDown
                                    placeholder="Place of Service"
                                    showSearchBar={true}
                                    disabled={false}
                                    data={
                                      lookupsData?.placeOfService
                                        ? (lookupsData?.placeOfService as SingleSelectDropDownDataType[])
                                        : []
                                    }
                                    selectedValue={selectedPlaceOfService}
                                    onSelect={(value) => {
                                      setSelectedPlaceOfService(value);
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="w-px">
                            <div
                              className={` [rotate:90deg] origin-top-left bg-gray-300 w-[400px] outline outline-1 outline-[rgba(209,213,219,1)]`}
                            ></div>
                          </div>

                          <div
                            className={`relative gap-6 inline-flex flex-col items-start text-gray-700 leading-6 text-left font-bold  `}
                          >
                            <p className={`text-base m-0`}>{'Provider'}</p>
                            <div className={`gap-2 flex items-end`}>
                              <div className={`relative w-[280px] h-[66px]`}>
                                <div
                                  className={`w-[372.77px] items-start self-stretch`}
                                >
                                  <div className="flex gap-1">
                                    <label className="text-sm font-medium text-gray-900">
                                      Rendering Provider
                                    </label>
                                    <InfoToggle
                                      position="right"
                                      text={
                                        <div>
                                          {' '}
                                          CMS1500 : BOX31 <br /> X12 : LOOP
                                          2310B - NM103
                                        </div>
                                      }
                                    />
                                  </div>
                                  <div className="w-[280px]">
                                    <SingleSelectDropDown
                                      placeholder="Search or add new provider"
                                      showSearchBar={true}
                                      disabled={false}
                                      data={
                                        providersData
                                          ? (providersData as SingleSelectDropDownDataType[])
                                          : []
                                      }
                                      selectedValue={selectedRenderingProvider}
                                      onSelect={(value) => {
                                        setSelectedRenderingProvider(value);
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                              <Button
                                buttonType={ButtonType.secondary}
                                cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                              >
                                <Icon
                                  name={'pencil'}
                                  size={18}
                                  color={IconColors.GRAY}
                                />
                              </Button>
                              <Button
                                buttonType={ButtonType.secondary}
                                cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                              >
                                <Icon
                                  name={'plus1'}
                                  size={18}
                                  color={IconColors.GRAY}
                                />
                              </Button>
                            </div>
                            <div className={`gap-2 flex items-end`}>
                              <div className={`relative w-[280px] h-[65px]`}>
                                <div
                                  className={`w-full items-start self-stretch`}
                                >
                                  <div className="flex gap-1">
                                    <label className="text-sm font-medium text-gray-900">
                                      Referring Provider
                                    </label>
                                    <InfoToggle
                                      position="right"
                                      text={
                                        <div>
                                          {' '}
                                          CMS1500 : BOX17 <br /> X12 : LOOP
                                          2310A - NM103
                                        </div>
                                      }
                                    />
                                  </div>
                                  <div className="w-[280px]">
                                    <SingleSelectDropDown
                                      placeholder="Click search button to add provider"
                                      showSearchBar={true}
                                      disabled={false}
                                      data={
                                        referringProviderData
                                          ? (referringProviderData as SingleSelectDropDownDataType[])
                                          : []
                                      }
                                      selectedValue={selectedReferringProvider}
                                      onSelect={(value) => {
                                        setSelectedReferringProvider(value);
                                      }}
                                      isOptional={true}
                                      onDeselectValue={() => {
                                        setSelectedReferringProvider(undefined);
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                              <Button
                                buttonType={ButtonType.secondary}
                                cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                                onClick={() => setIsModalOpen(true)}
                              >
                                <Icon
                                  name={'search1'}
                                  size={18}
                                  color={IconColors.GRAY}
                                />
                              </Button>
                              <Modal
                                open={isModalOpen}
                                onClose={() => {}}
                                modalContentClassName="relative w-[1232px] overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 w-full"
                              >
                                <SearchProvider
                                  onClose={() => setIsModalOpen(false)}
                                  onSelect={(value) => {
                                    // if (selectedPatientData) {
                                    //   getReferringProviderData(
                                    //     selectedPatientData?.groupID
                                    //   );
                                    // }
                                    const newProvider = [
                                      ...(referringProviderData || []),
                                      value,
                                    ];
                                    setReferringProviderData(newProvider);
                                    setSelectedReferringProvider(value);
                                  }}
                                />
                              </Modal>
                            </div>
                            <div className={`relative w-[280px] h-[62px]`}>
                              <div
                                className={`w-full items-start self-stretch`}
                              >
                                <div className="flex gap-1">
                                  <label className="text-sm font-medium leading-5 text-gray-900">
                                    Referral Number
                                  </label>
                                  <InfoToggle
                                    position="right"
                                    text={
                                      <div>
                                        {' '}
                                        CMS1500 : BOX23 <br /> X12 : LOOP 2300 -
                                        REF02 (9F)
                                      </div>
                                    }
                                  />
                                </div>
                                <div className="w-[280px]">
                                  <InputField
                                    value={referelNumber || ''}
                                    onChange={(evt) =>
                                      setReferelNumber(evt.target.value)
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="w-px">
                            <div
                              className={`relative [rotate:90deg] origin-top-left h-0 bg-gray-300 w-[490px] outline outline-1 outline-[rgba(209,213,219,1)]`}
                            ></div>
                          </div>
                          <div className={`gap-6 flex flex-col items-start`}>
                            <p className={` text-base inline m-0`}>{'Other'}</p>
                            <div
                              className={`gap-2 inline-flex items-end w-[372.px] `}
                            >
                              <div className={`relative w-[280px] h-[66px]`}>
                                <div
                                  className={`w-full items-start self-stretch`}
                                >
                                  <div className="flex gap-1">
                                    <label className="text-sm font-medium leading-5 text-gray-900">
                                      Supervising Provider
                                    </label>
                                    <InfoToggle
                                      position="right"
                                      text={
                                        <div>
                                          {' '}
                                          CMS1500 : BOX17 <br /> X12 : LOOP
                                          2310D - NM103 (DQ)
                                        </div>
                                      }
                                    />
                                  </div>
                                  <div className="w-[280px]">
                                    <SingleSelectDropDown
                                      placeholder="Supervising Provider"
                                      showSearchBar={true}
                                      disabled={false}
                                      data={
                                        supervisingProviderData
                                          ? (supervisingProviderData as SingleSelectDropDownDataType[])
                                          : []
                                      }
                                      selectedValue={
                                        selectedSupervisingProvider
                                      }
                                      onSelect={(value) => {
                                        setSelectedSupervisingProvider(value);
                                      }}
                                      isOptional={true}
                                      onDeselectValue={() => {
                                        setSelectedSupervisingProvider(
                                          undefined
                                        );
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                              <Button
                                buttonType={ButtonType.secondary}
                                cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5 mb-1`}
                              >
                                <Icon
                                  name={'pencil'}
                                  size={18}
                                  color={IconColors.GRAY}
                                />
                              </Button>
                              <Button
                                buttonType={ButtonType.secondary}
                                cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5 mb-1`}
                              >
                                <Icon
                                  name={'plus1'}
                                  size={18}
                                  color={IconColors.GRAY}
                                />
                              </Button>
                            </div>
                            <div className={` w-[280px] `}>
                              <div className={` gap-2 w-[280px]`}>
                                <div
                                  className={`w-full items-start self-stretch`}
                                >
                                  <div className="flex gap-1">
                                    <label className="text-sm font-medium leading-5 text-gray-900">
                                      Billing Provider
                                    </label>
                                    <InfoToggle
                                      position="right"
                                      text={
                                        <div>
                                          {' '}
                                          CMS1500 : BOX33 <br /> X12 : LOOP
                                          2010AA - NM103
                                        </div>
                                      }
                                    />
                                  </div>
                                  <div className="w-[280px]">
                                    <InputField
                                      placeholder="Billing Provider"
                                      disabled={true}
                                      value={selectedPractice?.value}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className={`relative w-[280px] `}>
                              <div
                                className={`w-full items-start self-stretch`}
                              >
                                <div className="flex gap-1">
                                  <label className="text-sm font-medium leading-5 text-gray-900">
                                    Prior Authorization Number
                                  </label>
                                  <InfoToggle
                                    position="right"
                                    text={
                                      <div>
                                        {' '}
                                        CMS1500 : BOX23 <br /> X12 : LOOP 2300 -
                                        REF02 (G1)
                                      </div>
                                    }
                                  />
                                </div>
                                <div className="w-[280px]">
                                  <InputField
                                    value={panNumber || ''}
                                    onChange={(evt) =>
                                      setPANNumber(evt.target.value)
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                            <div className={`relative w-[280px] `}>
                              <div
                                className={`w-full items-start self-stretch`}
                              >
                                <div className="flex gap-1">
                                  <label className="text-sm font-medium leading-5 text-gray-900">
                                    Admission Date
                                  </label>
                                  <InfoToggle
                                    position="right"
                                    text={
                                      <div>
                                        {' '}
                                        CMS1500 : BOX18 <br /> X12 : LOOP 2300 -
                                        DTP03 (435)
                                      </div>
                                    }
                                  />
                                </div>
                                <div className="w-[280px]">
                                  <AppDatePicker
                                    placeholderText="mm/dd/yyyy"
                                    cls="mt-1"
                                    onChange={(date) => setAdmissionDate(date)}
                                    selected={admissionDate}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className={`relative w-[280px] h-[66px]`}>
                              <div
                                className={`w-full items-start self-stretch`}
                              >
                                <div className="flex gap-1">
                                  <label className="text-sm font-medium leading-5 text-gray-900">
                                    Medical Case
                                  </label>
                                  {/* <InfoToggle
                                    openToggle={true}
                                    position="right"
                                    showOnHover
                                    text={
                                      'Select Patient, Facility and Primary Insurance to Fetch Data in Dropdown'
                                    }
                                    onToggle={(isOpend: boolean) => {
                                      // setInfoToggleIsOpen(isOpend);
                                    }}
                                  /> */}
                                </div>
                                <div className="w-[280px]">
                                  <SingleSelectDropDown
                                    placeholder="Medical Case"
                                    showSearchBar={true}
                                    disabled={false}
                                    data={
                                      medicalCaseDropdownData
                                        ? (medicalCaseDropdownData as SingleSelectDropDownDataType[])
                                        : []
                                    }
                                    selectedValue={
                                      selectedMedicalCaseDropdownData
                                    }
                                    onSelect={(value) => {
                                      setSelectedMedicalCaseDropdownData(value);
                                    }}
                                    isOptional={true}
                                    onDeselectValue={() => {
                                      setSelectedMedicalCaseDropdownData(null);
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="py-[75px]">
                  <div className="flow-root">
                    <SectionHeading
                      label="ICD-10 Codes"
                      isCollapsable={true}
                      onClick={() => setICDCollapse(!icdCollapse)}
                      isCollapsed={icdCollapse}
                    />
                  </div>
                  <div
                    hidden={icdCollapse}
                    className="relative top-11 bottom-4"
                  >
                    <p
                      className="p-4 text-sm leading-tight text-gray-500"
                      style={{ width: 512 }}
                    >
                      Drag and drop to reorder diagnosis codes tags.
                    </p>
                    <AppTable
                      cls="max-h-[400px]"
                      renderHead={
                        <>
                          <AppTableRow>
                            <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                              {' '}
                            </AppTableCell>
                            <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                              Order{' '}
                            </AppTableCell>
                            <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                              <div className="flex gap-1">
                                ICD-10 Code{' '}
                                <InfoToggle
                                  position="right"
                                  text={
                                    <div>
                                      {' '}
                                      CMS1500 : BOX21 <br /> X12 : LOOP 2300 -
                                      HI101(BK),HI102 (BF)
                                    </div>
                                  }
                                />
                              </div>
                            </AppTableCell>
                            <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4 w-[75%]">
                              {' '}
                              Description
                            </AppTableCell>
                            <AppTableCell cls="!font-bold !py-2 bg-cyan-100 !whitespace-nowrap !px-4">
                              Action
                            </AppTableCell>
                          </AppTableRow>
                        </>
                      }
                      renderBody={
                        <>
                          {icdRows?.map((icdRow, index) => (
                            <AppTableRow
                              rowRef={icdTableRef}
                              key={icdRow?.order}
                              cls={
                                dragOverIndex === index
                                  ? 'transform translate-y-0.5 drop-shadow-lg bg-[rgba(236,254,255,1)]'
                                  : ''
                              }
                            >
                              <AppTableCell component="th">
                                <div
                                  className={`cursor-move h-[30px] w-[30px] justify-center inline-flex `}
                                  draggable
                                  onMouseDown={() => {
                                    setDragOverIndex(index);
                                  }}
                                  onMouseUp={() => {
                                    setDragOverIndex(undefined);
                                  }}
                                  onDragStart={(
                                    e: React.DragEvent<HTMLDivElement>
                                  ) => {
                                    startIndex.current = index;
                                    const dragIcon =
                                      document.createElement('img');
                                    dragIcon.src = '';
                                    dragIcon.width = 0;
                                    e.dataTransfer.setDragImage(
                                      dragIcon,
                                      20,
                                      20
                                    );
                                  }}
                                  onDragOver={(
                                    e: React.DragEvent<HTMLDivElement>
                                  ) => {
                                    e.preventDefault();
                                  }}
                                  onDrop={() => {
                                    setDragOverIndex(undefined);
                                  }}
                                  onDragOverCapture={() => {
                                    if (dragOverIndex !== index) {
                                      const startIndexDrag = startIndex.current;
                                      setDragOverIndex(index);

                                      if (startIndexDrag !== undefined) {
                                        const res: any = reOrderData(
                                          icdRows,
                                          startIndexDrag,
                                          index
                                        );
                                        setIcdRows(() => {
                                          return res?.map(
                                            (
                                              orderRow: IcdData,
                                              dragIndex: number
                                            ) => {
                                              return {
                                                ...orderRow,
                                                order: dragIndex + 1,
                                              };
                                            }
                                          );
                                        });
                                      }
                                    }
                                  }}
                                >
                                  <Icon
                                    name={'drag'}
                                    size={18}
                                    color={IconColors.GRAY}
                                  />
                                </div>
                              </AppTableCell>
                              <AppTableCell>
                                <div className="inline-flex items-center justify-center rounded bg-gray-100 px-3 py-0.5">
                                  <p className="text-center text-sm font-medium leading-tight text-gray-800">
                                    {icdRow?.order}
                                  </p>
                                </div>
                              </AppTableCell>
                              <AppTableCell>
                                <div
                                  data-testid="icd_input"
                                  className="w-[110px]"
                                >
                                  <SingleSelectGridDropDown
                                    placeholder=""
                                    showSearchBar={true}
                                    showDropdownIcon={false}
                                    data={
                                      icdRow.data && icdRow.data.length !== 0
                                        ? (icdRow.data as SingleSelectGridDropdownDataType[])
                                        : []
                                      // icdSearchData?.length !== 0
                                      //   ? (icdSearchData as SingleSelectGridDropdownDataType[])
                                      //   : []
                                    }
                                    selectedValue={icdRow?.selectedICDObj}
                                    onSelect={(e) => {
                                      updateICDArray(
                                        icdRow.order ? icdRow.order : undefined,
                                        e
                                      );
                                    }}
                                    onSearch={(value) => {
                                      if (value !== '') {
                                        const row = {
                                          ...icdRow,
                                          searchValue: value,
                                        };
                                        searchIcds(row);
                                      }
                                      // setIcdSearch({
                                      //   ...icdSearch,
                                      //   searchValue: value,
                                      // });
                                    }}
                                    // searchValue={icdRow.searchValue}
                                    appendTextSeparator={'|'}
                                  />
                                </div>
                              </AppTableCell>
                              <AppTableCell>
                                <div className="inline-flex items-center justify-center rounded bg-gray-100 px-3 py-0.5">
                                  <p className="text-center text-sm font-medium leading-tight text-gray-800">
                                    {icdRow?.description}
                                  </p>
                                </div>
                              </AppTableCell>
                              <AppTableCell cls="bg-cyan-50">
                                <div className="flex gap-x-2">
                                  <Button
                                    onClick={() => {
                                      const checkIcdAttached =
                                        chargesRow?.filter(
                                          (a) =>
                                            a.charge &&
                                            (a.charge.icd1 ===
                                              icdRow.icd10Code ||
                                              a.charge.icd2 ===
                                                icdRow.icd10Code ||
                                              a.charge.icd3 ===
                                                icdRow.icd10Code ||
                                              a.charge.icd4 ===
                                                icdRow.icd10Code)
                                        );
                                      if (
                                        checkIcdAttached &&
                                        checkIcdAttached.length > 0
                                      ) {
                                        dispatch(
                                          addToastNotification({
                                            id: uuidv4(),
                                            text: 'This Diagnosis code is attached with charge. You need to remove it from charge first.',
                                            toastType: ToastType.ERROR,
                                          })
                                        );
                                        return;
                                      }
                                      const checkedDxCode = dxCode.filter(
                                        (a) => a.value === icdRow.icd10Code
                                      );
                                      if (checkedDxCode) {
                                        setdxCode(
                                          dxCode.filter(
                                            (a) => a.value !== icdRow.icd10Code
                                          )
                                        );
                                      }
                                      setIcdOrderCount(icdOrderCount - 1);
                                      icdRows.splice(index, 1);
                                      setIcdRows(() => {
                                        return icdRows?.map(
                                          (
                                            deleteRow: IcdData,
                                            deleteIndex: number
                                          ) => {
                                            return {
                                              ...deleteRow,
                                              order: deleteIndex + 1,
                                            };
                                          }
                                        );
                                      });
                                    }}
                                    buttonType={ButtonType.secondary}
                                    cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                                  >
                                    <Icon
                                      name={'trash'}
                                      size={18}
                                      // color={IconColors.GRAY}
                                    />
                                  </Button>
                                </div>
                              </AppTableCell>
                            </AppTableRow>
                          ))}
                          {/* {showAddICDRow ? (
                            <AppTableRow rowRef={icdTableRef}>
                              <AppTableCell component="th"> </AppTableCell>
                              <AppTableCell>
                                <div className="inline-flex items-center justify-center rounded bg-gray-100 px-3 py-0.5">
                                  <p className="text-center text-sm font-medium leading-tight text-gray-800">
                                    {icdOrderCount}
                                  </p>
                                </div>
                              </AppTableCell>
                              <AppTableCell>
                                <div
                                  data-testid="addIcdDropdown"
                                  className="w-[110px]"
                                >
                                  <SingleSelectGridDropDown
                                    placeholder=""
                                    showSearchBar={true}
                                    showDropdownIcon={false}
                                    //  disabled={row.isEditMode}
                                    data={
                                      icdSearchData?.length
                                        ? (icdSearchData as SingleSelectGridDropdownDataType[])
                                        : []
                                    }
                                    selectedValue={selectedICDCode}
                                    onSelect={(
                                      e: SingleValue<SingleSelectGridDropdownDataType>
                                    ) => {
                                      setSelctedICDCode(e);
                                      setIcdOrderCount(icdOrderCount + 1);
                                      setAddICDDescription('');
                                      setshowAddICDRow(false);
                                      icdRows?.push({
                                        order: icdOrderCount || undefined,
                                        icd10Code:
                                          e && e.value ? e.value : undefined,
                                        description: e?.appendText
                                          ? e?.appendText
                                          : undefined,
                                        data: icdSearchData,
                                        selectedICDObj: e || undefined,
                                        searchValue: icdSearch.searchValue,
                                      });
                                      setSelctedICDCode(null);
                                    }}
                                    onSearch={(value) => {
                                      setIcdSearch({
                                        ...icdSearch,
                                        searchValue: value,
                                      });
                                    }}
                                    appendTextSeparator={'|'}
                                    // searchValue={icdSearch.searchValue}
                                  />
                                </div>
                              </AppTableCell>
                              <AppTableCell>
                                {selectedICDCode && (
                                  <div className="inline-flex items-center justify-center rounded bg-gray-100 px-3 py-0.5">
                                    <p className="text-center text-sm font-medium leading-tight text-gray-800">
                                      {addICDDescription}
                                    </p>
                                  </div>
                                )}
                              </AppTableCell>
                            </AppTableRow>
                          ) : (
                            ''
                          )} */}
                        </>
                      }
                    />
                  </div>
                  <div
                    hidden={icdCollapse}
                    className="relative left-0 bottom-0 right-[85.75%] top-16 font-medium leading-5"
                  >
                    <Button
                      data-testid="AddMoreIcd"
                      buttonType={ButtonType.secondary}
                      onClick={() => {
                        // setIcdSearchData([]);
                        // setIcdSearch({
                        //   searchValue: '',
                        // });
                        if (icdRows && icdRows?.length >= 12) {
                          dispatch(
                            addToastNotification({
                              id: uuidv4(),
                              text: 'Only 12 ICD-10 Codes are allowed.',
                              toastType: ToastType.ERROR,
                            })
                          );
                        } else {
                          // setshowAddICDRow(!showAddICDRow);
                          setIcdRows((prevRows) => {
                            const currentRows = prevRows || [];

                            // Only add a new row if the last row has values
                            const lastRow = currentRows[currentRows.length - 1];
                            if (
                              lastRow &&
                              lastRow.icd10Code &&
                              lastRow.description
                            ) {
                              return [
                                ...currentRows,
                                {
                                  icd10Code: '',
                                  order: currentRows.length + 1, // Increment the order based on the current length
                                  description: undefined,
                                  selectedICDObj: null,
                                  searchValue: '',
                                  data: [],
                                },
                              ];
                            }

                            return currentRows; // No new row added if the last row doesn't have values
                          });
                          setTimeout(() => {
                            icdTableRef?.current?.scrollIntoView({
                              behavior: 'smooth',
                              block: 'nearest',
                            });
                          }, 100);
                        }
                      }}
                      cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                    >
                      <Icon name={'plus1'} size={18} color={IconColors.GRAY} />
                    </Button>
                    <p className={`absolute text-sm inline m-0 px-2 py-2.5`}>
                      Add more ICD-10 Codes
                    </p>
                  </div>
                </div>

                <div className="py-[75px]">
                  <div className="flow-root">
                    <SectionHeading
                      label="Charges"
                      isCollapsable={true}
                      onClick={() => setchargesCollapse(!chargesCollapse)}
                      isCollapsed={chargesCollapse}
                    />
                    <div className="float-right inline-flex items-center justify-start space-x-2">
                      <CheckBox
                        id="ndcCheckbox"
                        checked={chargesSort}
                        onChange={() => {
                          setchargesSort(!chargesSort);
                        }}
                        disabled={false}
                      />
                      <span className="text-right text-sm font-medium leading-tight text-gray-700">
                        Auto arrange charges from highest to lowest value
                      </span>
                    </div>
                  </div>
                  <div
                    hidden={chargesCollapse}
                    className="relative top-11 bottom-4"
                  >
                    <AppTable
                      cls="max-h-[400px]"
                      renderHead={
                        <>
                          <AppTableRow>
                            {chargesHeader.map((header) => (
                              <>
                                {/* 'NDC Code' field show only for drug cpt */}
                                {/* eslint-disable-next-line no-nested-ternary */}
                                {header === 'NDC Code' ? (
                                  // eslint-disable-next-line no-nested-ternary
                                  !claimID ? (
                                    selectedCpt &&
                                    (selectedCpt.value[0] === 'J' ||
                                      (selectedCpt.value[0] === '9' &&
                                        selectedCpt.value[1] === '0')) ? (
                                      <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                        {header}
                                      </AppTableCell>
                                    ) : null
                                  ) : (chargesRow &&
                                      chargesRow.some(
                                        (row) =>
                                          row.charge &&
                                          row.charge.cptCode &&
                                          (row.charge.cptCode.charAt(0) ===
                                            'J' ||
                                            (row.charge.cptCode.charAt(0) ===
                                              '9' &&
                                              row.charge.cptCode.charAt(1) ===
                                                '0'))
                                      )) ||
                                    (selectedCpt &&
                                      (selectedCpt.value[0] === 'J' ||
                                        (selectedCpt.value[0] === '9' &&
                                          selectedCpt.value[1] === '0'))) ? (
                                    <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                      {header}
                                    </AppTableCell>
                                  ) : null
                                ) : (
                                  <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                    <div className="flex gap-1">
                                      {header}
                                      {header !== 'CLIA Number' &&
                                        header !== 'Pat.Resp.' &&
                                        header !== 'Ins.Resp.' && (
                                          <InfoToggle
                                            position="right"
                                            text={
                                              <div>
                                                {getTooltipTextforCharges(
                                                  header,
                                                  'charges'
                                                )}
                                              </div>
                                            }
                                          />
                                        )}
                                    </div>
                                  </AppTableCell>
                                )}
                              </>
                            ))}
                            <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4 bg-cyan-100 sticky right-0">
                              Action
                            </AppTableCell>
                          </AppTableRow>
                        </>
                      }
                      renderBody={
                        <>
                          {chargesRow?.map((row, index) => (
                            <AppTableRow
                              key={row?.charge?.chargeID}
                              cls={
                                chargeDragOverIndex === index
                                  ? 'transform translate-y-0.5 drop-shadow-lg bg-[rgba(236,254,255,1)]'
                                  : ''
                              }
                            >
                              <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                <div
                                  className={`!cursor-move h-[30px] w-[30px] justify-center inline-flex `}
                                  draggable
                                  onMouseDown={() => {
                                    setChargeDragOverIndex(index);
                                  }}
                                  onMouseUp={() => {
                                    setChargeDragOverIndex(undefined);
                                  }}
                                  onDragStart={(
                                    e: React.DragEvent<HTMLDivElement>
                                  ) => {
                                    startIndex.current = index;
                                    const dragIcon =
                                      document.createElement('img');
                                    dragIcon.src = '';
                                    dragIcon.width = 0;
                                    e.dataTransfer.setDragImage(
                                      dragIcon,
                                      20,
                                      20
                                    );
                                  }}
                                  onDragOver={(
                                    e: React.DragEvent<HTMLDivElement>
                                  ) => {
                                    e.preventDefault();
                                  }}
                                  onDrop={() => {
                                    setChargeDragOverIndex(undefined);
                                  }}
                                  onDragOverCapture={() => {
                                    if (chargeDragOverIndex !== index) {
                                      const startIndexDrag = startIndex.current;
                                      setChargeDragOverIndex(index);
                                      if (startIndexDrag !== undefined) {
                                        const res: any = reOrderData(
                                          chargesRow,
                                          startIndexDrag,
                                          index
                                        );
                                        setChargesRow(() => {
                                          return res?.map(
                                            (
                                              orderRow: ChargesData,
                                              dragIndex: number
                                            ) => {
                                              return {
                                                ...orderRow,
                                                sortOrder: dragIndex + 1,
                                              };
                                            }
                                          );
                                        });
                                        const updateSortData = res?.map(
                                          (
                                            orderRow: ChargesData,
                                            dragIndex: number
                                          ) => {
                                            return {
                                              chargeID:
                                                orderRow.charge?.chargeID,
                                              sortOrder: dragIndex + 1,
                                            };
                                          }
                                        );
                                        updateChargeSortOrder(updateSortData);
                                        setChargesRow(res);
                                        startIndex.current = index;
                                      }
                                    }
                                  }}
                                >
                                  <Icon
                                    name={'drag'}
                                    size={18}
                                    color={IconColors.GRAY}
                                  />
                                </div>
                              </AppTableCell>
                              <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                <div className="mr-2.5 flex w-[250px]">
                                  <AppDatePicker
                                    placeholderText="From"
                                    disabled={row.isEditMode}
                                    cls="!whitespace-nowrap mr-3"
                                    onChange={(evt) => {
                                      setChargesRow(() => {
                                        return chargesRow?.map((editRow) => {
                                          if (
                                            editRow.charge?.chargeID ===
                                            row?.charge?.chargeID
                                          ) {
                                            if (editRow.charge) {
                                              editRow.charge.fromDOS = evt
                                                ? DateToStringPipe(evt, 1)
                                                : undefined;
                                              return {
                                                ...editRow,
                                              };
                                            }
                                          }
                                          return editRow;
                                        });
                                      });
                                    }}
                                    selected={
                                      row.charge && row.charge.fromDOS
                                        ? DateToStringPipe(
                                            row?.charge.fromDOS,
                                            1
                                          )
                                        : null
                                    }
                                  />
                                  <AppDatePicker
                                    placeholderText="To"
                                    disabled={row.isEditMode}
                                    cls="ml-3"
                                    selected={
                                      row.charge && row.charge.toDOS
                                        ? DateToStringPipe(row?.charge.toDOS, 1)
                                        : null
                                    }
                                    onChange={(evt) => {
                                      setChargesRow(() => {
                                        return chargesRow?.map((editRow) => {
                                          if (
                                            editRow.charge?.chargeID ===
                                            row?.charge?.chargeID
                                          ) {
                                            if (editRow.charge) {
                                              editRow.charge.toDOS = evt
                                                ? DateToStringPipe(evt, 1)
                                                : undefined;
                                              return {
                                                ...editRow,
                                              };
                                            }
                                          }
                                          return editRow;
                                        });
                                      });
                                    }}
                                  />
                                </div>
                              </AppTableCell>
                              <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                {row.isEditMode ? (
                                  <div className="mb-2 h-[38px] w-[85px]">
                                    <InputField
                                      disabled={true}
                                      value={
                                        row.charge && row.charge?.cptCode
                                          ? row.charge?.cptCode
                                          : ''
                                      }
                                    />
                                  </div>
                                ) : (
                                  <div className="w-[85px] ">
                                    <SingleSelectGridDropDown
                                      placeholder=""
                                      showSearchBar={true}
                                      showDropdownIcon={false}
                                      disabled={row.isEditMode}
                                      data={
                                        cptSearchData?.length !== 0
                                          ? (cptSearchData as SingleSelectGridDropdownDataType[])
                                          : []
                                      }
                                      selectedValue={
                                        cptSearchData &&
                                        cptSearchData.length > 0 &&
                                        cptSearchData.filter(
                                          (a) => a.value === row.charge?.cptCode
                                        )
                                          ? cptSearchData.filter(
                                              (a) =>
                                                a.value === row.charge?.cptCode
                                            )[0]
                                          : undefined
                                      }
                                      onSelect={(evt) => {
                                        setChargesRow(() => {
                                          return chargesRow?.map((editRow) => {
                                            if (
                                              editRow.charge?.chargeID ===
                                              row?.charge?.chargeID
                                            ) {
                                              if (editRow.charge) {
                                                editRow.charge.cptCode = evt
                                                  ? evt.value
                                                  : '';
                                                editRow.charge.ndcNumber = '';
                                                editRow.charge.revenueCode = '';
                                                return {
                                                  ...editRow,
                                                };
                                              }
                                            }
                                            return editRow;
                                          });
                                        });
                                        if (evt && selectedFacility) {
                                          getChargesFeeData(
                                            {
                                              cptCode: evt.value,
                                              modifierCode: row.charge?.mod1
                                                ? row.charge?.mod1
                                                : null,
                                              facilityID: selectedFacility.id,
                                              patientInsuranceID:
                                                selectedPrimaryInsurance
                                                  ? selectedPrimaryInsurance.id
                                                  : null,
                                              medicalCaseID:
                                                selectedMedicalCaseDropdownData?.id ||
                                                null,
                                            },
                                            'edit'
                                          );
                                        }

                                        getNdcPopupData(evt ? evt.value : '');
                                      }}
                                      onSearch={(value) => {
                                        handleSearch(value);
                                        // setCptSearch({
                                        //   ...cptSearch,
                                        //   searchValue: value,
                                        // });
                                      }}
                                      appendTextSeparator={'|'}
                                      searchValue={cptSearch.searchValue}
                                    />
                                  </div>
                                )}
                              </AppTableCell>
                              {selectedMedicalCaseDropdownData && (
                                <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                  {row.isEditMode ? (
                                    <div className="mb-2 h-[38px] w-[85px]">
                                      <InputField
                                        disabled={true}
                                        value={
                                          row.charge && row.charge?.revenueCode
                                            ? row.charge?.revenueCode
                                            : ''
                                        }
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-[85px] ">
                                      <SingleSelectGridDropDown
                                        placeholder=""
                                        showSearchBar={true}
                                        showDropdownIcon={false}
                                        disabled={row.isEditMode}
                                        data={
                                          revenueCodeData?.length !== 0
                                            ? (revenueCodeData as SingleSelectGridDropdownDataType[])
                                            : []
                                        }
                                        selectedValue={
                                          revenueCodeData &&
                                          revenueCodeData.length > 0 &&
                                          revenueCodeData.filter(
                                            (a) =>
                                              a.value ===
                                              row.charge?.revenueCode
                                          )
                                            ? revenueCodeData.filter(
                                                (a) =>
                                                  a.code ===
                                                  row.charge?.revenueCode
                                              )[0]
                                            : undefined
                                        }
                                        onSelect={(evt) => {
                                          setChargesRow(() => {
                                            return chargesRow?.map(
                                              (editRow) => {
                                                if (
                                                  editRow.charge?.chargeID ===
                                                  row?.charge?.chargeID
                                                ) {
                                                  if (editRow.charge) {
                                                    editRow.charge.revenueCode =
                                                      evt
                                                        ? revenueCodeData.filter(
                                                            (m) =>
                                                              m.id === evt.id
                                                          )[0]?.code || ''
                                                        : '';
                                                    return {
                                                      ...editRow,
                                                    };
                                                  }
                                                }
                                                return editRow;
                                              }
                                            );
                                          });
                                          // getNdcPopupData(evt ? evt.value : '');
                                        }}
                                        onSearch={(value) => {
                                          setRevenueSearch(value);
                                        }}
                                        appendTextSeparator={'|'}
                                      />
                                    </div>
                                  )}
                                </AppTableCell>
                              )}
                              <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                <div className="mb-2 h-[38px] w-[38px]">
                                  <InputField
                                    disabled={row.isEditMode}
                                    value={
                                      row.charge?.units ? row.charge.units : ''
                                    }
                                    cls="!pl-[1px] !pr-[1px] !pt-0 !pb-0"
                                    inputCls="!pl-[9px] !pr-[9px] !pt-0 !pb-0"
                                    onChange={(evt) => {
                                      setChargesRow(() => {
                                        return chargesRow?.map((editRow) => {
                                          if (
                                            editRow.charge?.chargeID ===
                                            row?.charge?.chargeID
                                          ) {
                                            if (editRow.charge) {
                                              editRow.charge.units =
                                                evt.target.value !== ''
                                                  ? Number(evt.target.value)
                                                  : null;
                                              return {
                                                ...editRow,
                                              };
                                            }
                                          }
                                          return editRow;
                                        });
                                      });
                                    }}
                                  />
                                </div>
                              </AppTableCell>
                              <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                <div className="flex gap-x-2">
                                  <div className="flex gap-x-2">
                                    <div className="h-[38px] w-[45px]">
                                      <SingleSelectGridDropDown
                                        placeholder=""
                                        showSearchBar={true}
                                        disabled={row.isEditMode}
                                        data={
                                          lookupsData?.modifiers
                                            ? (lookupsData?.modifiers as SingleSelectDropDownDataType[])
                                            : []
                                        }
                                        selectedValue={
                                          lookupsData?.modifiers &&
                                          lookupsData?.modifiers.length > 0 &&
                                          lookupsData?.modifiers.filter(
                                            (a) => a.value === row.charge?.mod1
                                          )
                                            ? lookupsData?.modifiers.filter(
                                                (a) =>
                                                  a.value === row.charge?.mod1
                                              )[0]
                                            : undefined
                                        }
                                        onSelect={(evt) => {
                                          setChargesRow(() => {
                                            return chargesRow?.map(
                                              (editRow) => {
                                                if (
                                                  editRow.charge?.chargeID ===
                                                  row?.charge?.chargeID
                                                ) {
                                                  if (editRow.charge) {
                                                    editRow.charge.mod1 = evt
                                                      ? evt.value
                                                      : '';
                                                    return {
                                                      ...editRow,
                                                    };
                                                  }
                                                }
                                                return editRow;
                                              }
                                            );
                                          });
                                        }}
                                        showDropdownIcon={false}
                                        searchOptionFull={false}
                                      />
                                    </div>
                                    <div className="h-[38px] w-[45px]">
                                      <SingleSelectGridDropDown
                                        placeholder=""
                                        showSearchBar={true}
                                        disabled={row.isEditMode}
                                        data={
                                          lookupsData?.modifiers
                                            ? (lookupsData?.modifiers as SingleSelectDropDownDataType[])
                                            : []
                                        }
                                        selectedValue={
                                          lookupsData?.modifiers &&
                                          lookupsData?.modifiers.length > 0 &&
                                          lookupsData?.modifiers.filter(
                                            (a) => a.value === row.charge?.mod2
                                          )
                                            ? lookupsData?.modifiers.filter(
                                                (a) =>
                                                  a.value === row.charge?.mod2
                                              )[0]
                                            : undefined
                                        }
                                        onSelect={(evt) => {
                                          setChargesRow(() => {
                                            return chargesRow?.map(
                                              (editRow) => {
                                                if (
                                                  editRow.charge?.chargeID ===
                                                  row?.charge?.chargeID
                                                ) {
                                                  if (editRow.charge) {
                                                    editRow.charge.mod2 = evt
                                                      ? evt.value
                                                      : '';
                                                    return {
                                                      ...editRow,
                                                    };
                                                  }
                                                }
                                                return editRow;
                                              }
                                            );
                                          });
                                        }}
                                        searchOptionFull={false}
                                        showDropdownIcon={false}
                                      />
                                    </div>
                                    <div className="h-[38px] w-[45px]">
                                      <SingleSelectGridDropDown
                                        placeholder=""
                                        showSearchBar={true}
                                        disabled={row.isEditMode}
                                        data={
                                          lookupsData?.modifiers
                                            ? (lookupsData?.modifiers as SingleSelectDropDownDataType[])
                                            : []
                                        }
                                        selectedValue={
                                          lookupsData?.modifiers &&
                                          lookupsData?.modifiers.length > 0 &&
                                          lookupsData?.modifiers.filter(
                                            (a) => a.value === row.charge?.mod3
                                          )
                                            ? lookupsData?.modifiers.filter(
                                                (a) =>
                                                  a.value === row.charge?.mod3
                                              )[0]
                                            : undefined
                                        }
                                        onSelect={(evt) => {
                                          setChargesRow(() => {
                                            return chargesRow?.map(
                                              (editRow) => {
                                                if (
                                                  editRow.charge?.chargeID ===
                                                  row?.charge?.chargeID
                                                ) {
                                                  if (editRow.charge) {
                                                    editRow.charge.mod3 = evt
                                                      ? evt.value
                                                      : '';
                                                    return {
                                                      ...editRow,
                                                    };
                                                  }
                                                }
                                                return editRow;
                                              }
                                            );
                                          });
                                        }}
                                        showDropdownIcon={false}
                                        searchOptionFull={false}
                                      />
                                    </div>
                                    <div className="h-[38px] w-[45px]">
                                      <SingleSelectGridDropDown
                                        placeholder=""
                                        showSearchBar={true}
                                        disabled={row.isEditMode}
                                        data={
                                          lookupsData?.modifiers
                                            ? (lookupsData?.modifiers as SingleSelectDropDownDataType[])
                                            : []
                                        }
                                        selectedValue={
                                          lookupsData?.modifiers &&
                                          lookupsData?.modifiers.length > 0 &&
                                          lookupsData?.modifiers.filter(
                                            (a) => a.value === row.charge?.mod4
                                          )
                                            ? lookupsData?.modifiers.filter(
                                                (a) =>
                                                  a.value === row.charge?.mod4
                                              )[0]
                                            : undefined
                                        }
                                        onSelect={(evt) => {
                                          setChargesRow(() => {
                                            return chargesRow?.map(
                                              (editRow) => {
                                                if (
                                                  editRow.charge?.chargeID ===
                                                  row?.charge?.chargeID
                                                ) {
                                                  if (editRow.charge) {
                                                    editRow.charge.mod4 = evt
                                                      ? evt.value
                                                      : '';
                                                    return {
                                                      ...editRow,
                                                    };
                                                  }
                                                }
                                                return editRow;
                                              }
                                            );
                                          });
                                        }}
                                        showDropdownIcon={false}
                                        searchOptionFull={false}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </AppTableCell>
                              <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                <div className="w-[160px]">
                                  <SingleSelectGridDropDown
                                    placeholder=""
                                    showSearchBar={false}
                                    disabled={row.isEditMode}
                                    data={
                                      lookupsData?.placeOfService
                                        ? (lookupsData?.placeOfService as SingleSelectDropDownDataType[])
                                        : []
                                    }
                                    selectedValue={
                                      lookupsData?.placeOfService &&
                                      lookupsData?.placeOfService.length > 0 &&
                                      lookupsData?.placeOfService.filter(
                                        (a) =>
                                          a.id === row.charge?.placeOfServiceID
                                      )
                                        ? lookupsData?.placeOfService.filter(
                                            (a) =>
                                              a.id ===
                                              row.charge?.placeOfServiceID
                                          )[0]
                                        : undefined
                                    }
                                    onSelect={(evt) => {
                                      setChargesRow(() => {
                                        return chargesRow?.map((editRow) => {
                                          if (
                                            editRow.charge?.chargeID ===
                                            row?.charge?.chargeID
                                          ) {
                                            if (editRow.charge) {
                                              editRow.charge.placeOfServiceID =
                                                evt ? evt.id : null;
                                              return {
                                                ...editRow,
                                              };
                                            }
                                          }
                                          return editRow;
                                        });
                                      });
                                    }}
                                  />
                                </div>
                              </AppTableCell>
                              <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                <div className="mb-2 h-[38px] w-[110px]">
                                  <InputField disabled={true} />
                                </div>
                              </AppTableCell>
                              <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                {showGridDropdown ? (
                                  <div className="w-max">
                                    <MultiSelectGridDropdown
                                      placeholder=""
                                      data={chargesDxData}
                                      disabled={row.isEditMode}
                                      selectedValue={
                                        icdRows && icdRows.length > 0
                                          ? (icdRows
                                              .filter(
                                                (a) =>
                                                  a.icd10Code ===
                                                    row.charge?.icd1 ||
                                                  a.icd10Code ===
                                                    row.charge?.icd2 ||
                                                  a.icd10Code ===
                                                    row.charge?.icd3 ||
                                                  a.icd10Code ===
                                                    row.charge?.icd4
                                              )
                                              .sort(function (obj1, obj2) {
                                                let a = 0;
                                                let b = 0;
                                                if (
                                                  obj1.icd10Code ===
                                                  row.charge?.icd1
                                                )
                                                  a = 1;
                                                if (
                                                  obj1.icd10Code ===
                                                  row.charge?.icd2
                                                )
                                                  a = 2;
                                                if (
                                                  obj1.icd10Code ===
                                                  row.charge?.icd3
                                                )
                                                  a = 3;
                                                if (
                                                  obj1.icd10Code ===
                                                  row.charge?.icd4
                                                )
                                                  a = 4;
                                                if (
                                                  obj2.icd10Code ===
                                                  row.charge?.icd1
                                                )
                                                  b = 1;
                                                if (
                                                  obj2.icd10Code ===
                                                  row.charge?.icd2
                                                )
                                                  b = 2;
                                                if (
                                                  obj2.icd10Code ===
                                                  row.charge?.icd3
                                                )
                                                  b = 3;
                                                if (
                                                  obj2.icd10Code ===
                                                  row.charge?.icd4
                                                )
                                                  b = 4;
                                                return a - b;
                                              })
                                              .map((a) => ({
                                                ...a.selectedICDObj,
                                              })) as MultiValue<MultiSelectGridDropdownDataType>)
                                          : []
                                      }
                                      showSearchBar={true}
                                      cls="min-w-[160px]"
                                      onSelect={(evt) => {
                                        setChargesRow(() => {
                                          return chargesRow?.map((editRow) => {
                                            if (
                                              editRow.charge?.chargeID ===
                                              row?.charge?.chargeID
                                            ) {
                                              if (editRow.charge) {
                                                editRow.charge.icd1 =
                                                  evt && evt.length > 0
                                                    ? evt[0]?.value
                                                    : null;
                                                editRow.charge.icd2 =
                                                  evt && evt.length > 1
                                                    ? evt[1]?.value
                                                    : null;
                                                editRow.charge.icd3 =
                                                  evt && evt.length > 2
                                                    ? evt[2]?.value
                                                    : null;
                                                editRow.charge.icd4 =
                                                  evt && evt.length > 3
                                                    ? evt[3]?.value
                                                    : null;
                                                return {
                                                  ...editRow,
                                                };
                                              }
                                            }
                                            return editRow;
                                          });
                                        });
                                      }}
                                    />
                                  </div>
                                ) : (
                                  ''
                                )}
                              </AppTableCell>
                              {checkCPTCode() && (
                                <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                  {row &&
                                    (row.charge?.cptCode?.charAt(0) === 'J' ||
                                      (row.charge?.cptCode?.charAt(0) === '9' &&
                                        row.charge?.cptCode?.charAt(1) ===
                                          '0')) && (
                                      <>
                                        {ndcEditDataRows &&
                                        ndcEditDataRows.length > 0 ? (
                                          <div className="h-[38px] w-[160px]">
                                            <GridModal
                                              icon={
                                                <span
                                                  className="contents"
                                                  onClick={() => {
                                                    updateSelectedChargeNdcRule();
                                                  }}
                                                >
                                                  <Icon
                                                    name={'pencil'}
                                                    size={18}
                                                    color={IconColors.GRAY}
                                                  />
                                                </span>
                                              }
                                              txt={'Edit NDC Rule'}
                                              cls="w-10 p-2 bg-white shadow border rounded-md border-gray-300"
                                              clsDiv="px-4 py-4"
                                              disabled={row.isEditMode}
                                              value={
                                                row.charge?.ndcNumber || ''
                                              }
                                            >
                                              <AppTable
                                                renderHead={
                                                  <>
                                                    <AppTableRow>
                                                      {ndcTableHeader.map(
                                                        (header) => (
                                                          <AppTableCell
                                                            key={header}
                                                          >
                                                            <div className="flex gap-1">
                                                              {header}
                                                              <InfoToggle
                                                                position="right"
                                                                text={
                                                                  <div>
                                                                    {getTooltipTextforCharges(
                                                                      header,
                                                                      'ndc'
                                                                    )}
                                                                  </div>
                                                                }
                                                              />
                                                            </div>
                                                          </AppTableCell>
                                                        )
                                                      )}
                                                    </AppTableRow>
                                                  </>
                                                }
                                                renderBody={
                                                  <>
                                                    {ndcEditDataRows?.map(
                                                      (ndcEditData) => (
                                                        <AppTableRow
                                                          key={
                                                            ndcEditData
                                                              .ndcRowsData?.id
                                                          }
                                                          cls={
                                                            ndcEditData.isChecked
                                                              ? 'bg-cyan-50'
                                                              : ''
                                                          }
                                                        >
                                                          <AppTableCell component="th">
                                                            <div className="w-[16px]">
                                                              <CheckBox
                                                                id="ndcCheckbox"
                                                                checked={
                                                                  ndcEditData.isChecked
                                                                }
                                                                onChange={() => {
                                                                  onNdcEditChange(
                                                                    ndcEditData
                                                                      .ndcRowsData
                                                                      ?.id
                                                                  );
                                                                }}
                                                                disabled={false}
                                                              />
                                                            </div>
                                                          </AppTableCell>
                                                          <AppTableCell component="th">
                                                            <div className="mb-2 h-[38px] w-[131px]">
                                                              <InputField
                                                                value={
                                                                  ndcEditData
                                                                    .ndcRowsData
                                                                    ?.ndcCode ||
                                                                  ''
                                                                }
                                                                disabled={true}
                                                              />
                                                            </div>
                                                          </AppTableCell>
                                                          <AppTableCell>
                                                            <div className="flex gap-x-2">
                                                              <div className="mb-2 h-[38px] w-[38px]">
                                                                <InputField
                                                                  value={
                                                                    ndcEditData
                                                                      .ndcRowsData
                                                                      ?.units ||
                                                                    ''
                                                                  }
                                                                  disabled={
                                                                    ndcEditData.isDisabled
                                                                  }
                                                                  onChange={(
                                                                    evt
                                                                  ) => {
                                                                    setNdcEditData(
                                                                      () => {
                                                                        return ndcEditDataRows?.map(
                                                                          (
                                                                            row2
                                                                          ) => {
                                                                            if (
                                                                              row2
                                                                                .ndcRowsData
                                                                                ?.id ===
                                                                              ndcEditData
                                                                                .ndcRowsData
                                                                                ?.id
                                                                            ) {
                                                                              if (
                                                                                row2.ndcRowsData
                                                                              ) {
                                                                                row2.ndcRowsData.units =
                                                                                  evt
                                                                                    .target
                                                                                    .value
                                                                                    ? Number(
                                                                                        evt
                                                                                          .target
                                                                                          .value
                                                                                      )
                                                                                    : undefined;
                                                                                return {
                                                                                  ...row2,
                                                                                };
                                                                              }
                                                                            }
                                                                            return row2;
                                                                          }
                                                                        );
                                                                      }
                                                                    );
                                                                  }}
                                                                  cls="!pl-[1px] !pr-[1px] !pt-0 !pb-0"
                                                                  inputCls="!pl-[9px] !pr-[9px] !pt-0 !pb-0"
                                                                />
                                                              </div>
                                                            </div>
                                                          </AppTableCell>
                                                          <AppTableCell>
                                                            <div className="w-[120px]">
                                                              <SingleSelectGridDropDown
                                                                placeholder=""
                                                                showSearchBar={
                                                                  false
                                                                }
                                                                disabled={
                                                                  ndcEditData.isDisabled
                                                                }
                                                                data={
                                                                  lookupsData?.ndcCodes ||
                                                                  []
                                                                }
                                                                selectedValue={
                                                                  lookupsData?.ndcCodes &&
                                                                  lookupsData
                                                                    ?.ndcCodes
                                                                    .length >
                                                                    0 &&
                                                                  lookupsData?.ndcCodes.filter(
                                                                    (a) =>
                                                                      a.id ===
                                                                      ndcEditData
                                                                        .ndcRowsData
                                                                        ?.ndcUnitQualifierID
                                                                  )
                                                                    ? lookupsData?.ndcCodes.filter(
                                                                        (a) =>
                                                                          a.id ===
                                                                          ndcEditData
                                                                            .ndcRowsData
                                                                            ?.ndcUnitQualifierID
                                                                      )[0]
                                                                    : undefined
                                                                }
                                                                onSelect={(
                                                                  e
                                                                ) => {
                                                                  setNdcEditData(
                                                                    () => {
                                                                      return ndcEditDataRows?.map(
                                                                        (
                                                                          row1
                                                                        ) => {
                                                                          if (
                                                                            row1
                                                                              .ndcRowsData
                                                                              ?.id ===
                                                                            ndcEditData
                                                                              .ndcRowsData
                                                                              ?.id
                                                                          ) {
                                                                            if (
                                                                              row1.ndcRowsData
                                                                            ) {
                                                                              row1.ndcRowsData.ndcUnitQualifierID =
                                                                                e
                                                                                  ? e.id
                                                                                  : undefined;
                                                                              return {
                                                                                ...row1,
                                                                              };
                                                                            }
                                                                          }
                                                                          return row1;
                                                                        }
                                                                      );
                                                                    }
                                                                  );
                                                                }}
                                                              />
                                                            </div>
                                                          </AppTableCell>
                                                          <AppTableCell>
                                                            <div className="mb-2 h-[38px] w-[400px]">
                                                              <InputField
                                                                value={
                                                                  ndcEditData
                                                                    .ndcRowsData
                                                                    ?.serviceDescription ||
                                                                  ''
                                                                }
                                                                disabled={true}
                                                              />
                                                            </div>
                                                          </AppTableCell>
                                                        </AppTableRow>
                                                      )
                                                    )}
                                                  </>
                                                }
                                              />
                                            </GridModal>
                                          </div>
                                        ) : (
                                          <div className="h-[38px] w-[160px]">
                                            <GridModal
                                              icon={
                                                <Button
                                                  buttonType={
                                                    ButtonType.primary
                                                  }
                                                  onClick={() =>
                                                    createNdcRule(
                                                      row.charge?.cptCode || ''
                                                    )
                                                  }
                                                >
                                                  Create NDC Rule
                                                </Button>
                                              }
                                              cls="[w-143px] h-[38px]"
                                              clsDiv="px-4 py-4"
                                              value={
                                                row.charge?.ndcNumber || ''
                                                // !ndcEditDataRows
                                                //   ? row.charge?.ndcNumber || ''
                                                //   : ''
                                              }
                                              disabled={row.isEditMode}
                                            >
                                              <AppTable
                                                renderHead={
                                                  <>
                                                    <AppTableRow>
                                                      <AppTableCell>
                                                        <div className="flex gap-1">
                                                          NDC Code
                                                          <InfoToggle
                                                            position="right"
                                                            text={
                                                              <div>
                                                                CMS1500 :
                                                                BOX24-A shaded
                                                                area <br /> X12
                                                                : LOOP 2410 -
                                                                CTP105
                                                              </div>
                                                            }
                                                          />
                                                        </div>
                                                      </AppTableCell>
                                                      <AppTableCell>
                                                        <div className="flex gap-1">
                                                          Units
                                                          <InfoToggle
                                                            position="right"
                                                            text={
                                                              <div>
                                                                CMS1500 :
                                                                BOX24-A shaded
                                                                area <br /> X12
                                                                : LOOP 2410 -
                                                                CTP104
                                                              </div>
                                                            }
                                                          />
                                                        </div>
                                                      </AppTableCell>
                                                      <AppTableCell>
                                                        <div className="flex gap-1">
                                                          Dosage Form
                                                          <InfoToggle
                                                            position="right"
                                                            text={
                                                              <div>
                                                                CMS1500 :
                                                                BOX24-A shaded
                                                                area <br /> X12
                                                                : LOOP 2410 -
                                                                CTP105
                                                              </div>
                                                            }
                                                          />
                                                        </div>
                                                      </AppTableCell>
                                                      <AppTableCell>
                                                        <div className="flex gap-1">
                                                          Service Description
                                                          <InfoToggle
                                                            position="right"
                                                            text={
                                                              <div>
                                                                CMS1500 :
                                                                BOX24-A shaded
                                                                area <br /> X12
                                                                : LOOP 2400 -
                                                                SV101-7
                                                              </div>
                                                            }
                                                          />
                                                        </div>
                                                      </AppTableCell>
                                                      <AppTableCell cls="bg-cyan-100">
                                                        Action
                                                      </AppTableCell>
                                                    </AppTableRow>
                                                  </>
                                                }
                                                renderBody={
                                                  <>
                                                    <AppTableRow>
                                                      <AppTableCell component="th">
                                                        <div className="mb-2 h-[38px] w-[131px]">
                                                          <InputField
                                                            value={ndcCode}
                                                            onChange={(evt) => {
                                                              const formattedValue =
                                                                formatNDC(
                                                                  evt.target
                                                                    .value
                                                                );
                                                              setNDCCode(
                                                                formattedValue
                                                              );
                                                            }}
                                                          />
                                                        </div>
                                                      </AppTableCell>
                                                      <AppTableCell>
                                                        <div className="mb-2 h-[38px] w-[38px]">
                                                          <InputField
                                                            cls="!pl-[1px] !pr-[1px] !pt-0 !pb-0"
                                                            inputCls="!pl-[9px] !pr-[9px] !pt-0 !pb-0"
                                                            value={
                                                              chargeNdcUnits
                                                            }
                                                            onChange={(evt) => {
                                                              setChargeNdcUnits(
                                                                evt.target.value
                                                                  ? Number(
                                                                      evt.target
                                                                        .value
                                                                    )
                                                                  : undefined
                                                              );
                                                            }}
                                                          />
                                                        </div>
                                                      </AppTableCell>
                                                      <AppTableCell>
                                                        <div className="w-[120px]">
                                                          <SingleSelectGridDropDown
                                                            placeholder=""
                                                            showSearchBar={
                                                              false
                                                            }
                                                            data={
                                                              lookupsData?.ndcCodes ||
                                                              []
                                                            }
                                                            selectedValue={
                                                              dosageForm
                                                            }
                                                            onSelect={(e) => {
                                                              setDosageForm(e);
                                                            }}
                                                          />
                                                        </div>
                                                      </AppTableCell>
                                                      <AppTableCell>
                                                        <div className="mb-2 h-[38px] w-[400px]">
                                                          <InputField
                                                            value={
                                                              chargeNdcDescription
                                                            }
                                                            onChange={(evt) => {
                                                              setChargeNdcDescription(
                                                                evt.target.value
                                                              );
                                                            }}
                                                          />
                                                        </div>
                                                      </AppTableCell>
                                                      <AppTableCell cls="bg-cyan-50">
                                                        <div className="flex gap-x-2">
                                                          <Button
                                                            buttonType={
                                                              ButtonType.secondary
                                                            }
                                                            cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                                                          >
                                                            <Icon
                                                              name={'trash'}
                                                              size={18}
                                                            />
                                                          </Button>
                                                        </div>
                                                      </AppTableCell>
                                                    </AppTableRow>
                                                  </>
                                                }
                                              />
                                            </GridModal>
                                          </div>
                                        )}
                                      </>
                                    )}
                                </AppTableCell>
                              )}

                              <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                <div className="h-[38px] w-[112px]">
                                  <InputFieldAmount
                                    showCurrencyName={false}
                                    disabled={row.isEditMode}
                                    value={
                                      row.charge?.fee ? row.charge?.fee : ''
                                    }
                                    onChange={(evt) => {
                                      setChargesRow(() => {
                                        return chargesRow?.map((editRow) => {
                                          if (
                                            editRow.charge?.chargeID ===
                                            row?.charge?.chargeID
                                          ) {
                                            if (editRow.charge) {
                                              editRow.charge.fee =
                                                evt.target.value !== ''
                                                  ? Number(evt.target.value)
                                                  : undefined;
                                              return {
                                                ...editRow,
                                              };
                                            }
                                          }
                                          return editRow;
                                        });
                                      });
                                    }}
                                  />
                                </div>
                              </AppTableCell>
                              <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                <div className="h-[38px] w-[112px]">
                                  <InputFieldAmount
                                    showCurrencyName={false}
                                    disabled={row.isEditMode}
                                    value={
                                      row.charge?.insuranceAmount
                                        ? row.charge?.insuranceAmount
                                        : ''
                                    }
                                    onChange={(evt) => {
                                      setChargesRow(() => {
                                        return chargesRow?.map((editRow) => {
                                          if (
                                            editRow.charge?.chargeID ===
                                            row?.charge?.chargeID
                                          ) {
                                            if (editRow.charge) {
                                              editRow.charge.insuranceAmount =
                                                evt.target.value !== ''
                                                  ? Number(evt.target.value)
                                                  : undefined;
                                              return {
                                                ...editRow,
                                              };
                                            }
                                          }
                                          return editRow;
                                        });
                                      });
                                    }}
                                  />
                                </div>
                              </AppTableCell>
                              <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                <div className="h-[38px] w-[112px]">
                                  <InputFieldAmount
                                    showCurrencyName={false}
                                    disabled={row.isEditMode}
                                    value={
                                      row.charge?.patientAmount
                                        ? row.charge?.patientAmount
                                        : ''
                                    }
                                    onChange={(evt) => {
                                      setChargesRow(() => {
                                        return chargesRow?.map((editRow) => {
                                          if (
                                            editRow.charge?.chargeID ===
                                            row?.charge?.chargeID
                                          ) {
                                            if (editRow.charge) {
                                              editRow.charge.patientAmount =
                                                evt.target.value !== ''
                                                  ? Number(evt.target.value)
                                                  : undefined;
                                              return {
                                                ...editRow,
                                              };
                                            }
                                          }
                                          return editRow;
                                        });
                                      });
                                    }}
                                  />
                                </div>
                              </AppTableCell>
                              <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                <GridModal
                                  icon={<Icon name={'plus1'} size={18} />}
                                  cls="w-10 p-2 bg-white shadow border rounded-md border-gray-300"
                                  txt={'Create New Charge Batch'}
                                  value={
                                    batchSearchData &&
                                    batchSearchData.length > 0 &&
                                    batchSearchData.filter(
                                      (a) => a.id === row.charge?.chargeBatchID
                                    )
                                      ? batchSearchData.filter(
                                          (a) =>
                                            a.id === row.charge?.chargeBatchID
                                        )[0]?.value
                                      : undefined
                                  }
                                  clsDiv="px-4 py-2"
                                  disabled={row.isEditMode}
                                >
                                  <AppTable
                                    renderHead={
                                      <>
                                        <AppTableRow>
                                          {chargeBatchHeader.map((header) => (
                                            <>
                                              <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                                {header}
                                              </AppTableCell>
                                            </>
                                          ))}
                                          <AppTableCell cls="bg-cyan-100">
                                            Action
                                          </AppTableCell>
                                        </AppTableRow>
                                      </>
                                    }
                                    renderBody={
                                      <>
                                        <AppTableRow>
                                          <AppTableCell component="th">
                                            <div className="h-[38px] w-[160px]">
                                              <SingleSelectGridDropDown
                                                placeholder=""
                                                data={
                                                  batchSearchData?.length !== 0
                                                    ? (batchSearchData as SingleSelectGridDropdownDataType[])
                                                    : []
                                                }
                                                selectedValue={
                                                  batchSearchData &&
                                                  batchSearchData.length > 0 &&
                                                  batchSearchData.filter(
                                                    (a) =>
                                                      a.id ===
                                                      row.charge?.chargeBatchID
                                                  )
                                                    ? batchSearchData.filter(
                                                        (a) =>
                                                          a.id ===
                                                          row.charge
                                                            ?.chargeBatchID
                                                      )[0]
                                                    : undefined
                                                }
                                                onSelect={() => {}}
                                                disabled={true}
                                              />
                                            </div>
                                          </AppTableCell>
                                          <AppTableCell>
                                            <div className="w-[160px]">
                                              <AppDatePicker
                                                placeholderText="From"
                                                disabled={true}
                                                cls="!whitespace-nowrap mr-3"
                                                onChange={() => {}}
                                                selected={
                                                  row.charge?.chargePostingDate
                                                    ? new Date(
                                                        row.charge?.chargePostingDate
                                                      )
                                                    : null
                                                }
                                              />
                                            </div>
                                          </AppTableCell>
                                          <AppTableCell>
                                            <div className="h-[38px]  w-[160px]">
                                              <SingleSelectGridDropDown
                                                placeholder=""
                                                showSearchBar={false}
                                                data={
                                                  batchDocumentData?.length !==
                                                  0
                                                    ? (batchDocumentData as SingleSelectGridDropdownDataType[])
                                                    : []
                                                }
                                                disabled={true}
                                                selectedValue={
                                                  batchDocumentData &&
                                                  batchDocumentData.length >
                                                    0 &&
                                                  batchDocumentData.filter(
                                                    (a) =>
                                                      a.id ===
                                                      row.charge
                                                        ?.systemDocumentID
                                                  )
                                                    ? batchDocumentData.filter(
                                                        (a) =>
                                                          a.id ===
                                                          row.charge
                                                            ?.systemDocumentID
                                                      )[0]
                                                    : undefined
                                                }
                                                onSelect={() => {}}
                                              />
                                            </div>
                                          </AppTableCell>
                                          <AppTableCell>
                                            <div className="flex gap-x-2">
                                              <div className="mb-2 h-[38px] w-[40px]">
                                                <InputField
                                                  value={
                                                    row.charge?.pageNumber
                                                      ? row.charge?.pageNumber
                                                      : ''
                                                  }
                                                  disabled={true}
                                                />
                                              </div>
                                            </div>
                                          </AppTableCell>
                                          <AppTableCell cls="bg-cyan-50">
                                            <div className="flex gap-x-2">
                                              <Button
                                                buttonType={
                                                  ButtonType.secondary
                                                }
                                                cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                                              >
                                                <Icon
                                                  name={'trash'}
                                                  size={18}
                                                />
                                              </Button>
                                            </div>
                                          </AppTableCell>
                                        </AppTableRow>
                                      </>
                                    }
                                  />
                                </GridModal>
                              </AppTableCell>
                              <AppTableCell cls=" !font-bold !py-2 !whitespace-nowrap !px-4 bg-cyan-50 sticky right-0">
                                <div className="flex gap-x-2">
                                  {!row.isEditMode ? (
                                    <Button
                                      onClick={() => {
                                        if (row && row?.charge?.chargeID) {
                                          handleSaveButtonClick(
                                            row?.charge?.chargeID
                                          );
                                        }
                                      }}
                                      buttonType={ButtonType.primary}
                                      cls={`inline-flex h-[38px] justify-center items-center rounded-md text-white leading-5 text-left font-medium pl-[17px] pr-[17px] pt-[9px] pb-[9px] w-[102.03px] `}
                                    >
                                      Save
                                    </Button>
                                  ) : (
                                    <>
                                      <Button
                                        buttonType={ButtonType.secondary}
                                        onClick={() => {
                                          onToggleEditMode(
                                            row?.charge?.chargeID
                                          );
                                          if (
                                            row.charge?.cptCode &&
                                            selectedPractice
                                          ) {
                                            setCptSearch({
                                              ...cptSearch,
                                              searchValue: row.charge?.cptCode,
                                            });
                                            getNdcPopupData(
                                              row.charge?.cptCode
                                            );
                                          }
                                          if (row.charge?.cptCode) {
                                            handleSearch(row.charge?.cptCode);
                                          }
                                        }}
                                        cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                                      >
                                        <Icon
                                          name={'pencil'}
                                          size={18}
                                          color={IconColors.GRAY}
                                        />
                                      </Button>
                                      <Button
                                        buttonType={ButtonType.secondary}
                                        cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                                        onClick={async () => {
                                          const res = await deleteChargeSaga(
                                            row.charge?.chargeID
                                          );
                                          if (res) {
                                            const deletedIndex =
                                              chargesRow &&
                                              chargesRow.findIndex(
                                                (a) =>
                                                  a.charge?.chargeID ===
                                                  row.charge?.chargeID
                                              );
                                            chargesRow.splice(deletedIndex, 1);
                                            setChargesRow([...chargesRow]);
                                          }
                                        }}
                                      >
                                        <Icon name={'trash'} size={18} />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </AppTableCell>
                            </AppTableRow>
                          ))}
                          {showAddChargesRow ? (
                            <AppTableRow rowRef={myRef}>
                              <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                {' '}
                              </AppTableCell>
                              <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                <div className="mr-2.5 flex h-[38px] w-[250px]">
                                  <AppDatePicker
                                    placeholderText="From"
                                    cls="!whitespace-nowrap mr-3"
                                    onChange={(date) => setChargesFromDOS(date)}
                                    selected={chargesFromDOS}
                                  />
                                  <AppDatePicker
                                    testId="chargesTo"
                                    placeholderText="To"
                                    cls="ml-3"
                                    onChange={(date) => setChargesToDOS(date)}
                                    selected={chargesToDOS}
                                  />
                                </div>
                              </AppTableCell>
                              <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                <div
                                  data-testid="chargesCptCode"
                                  className="h-[38px] w-[85px]"
                                >
                                  <SingleSelectGridDropDown
                                    placeholder=""
                                    showSearchBar={true}
                                    showDropdownIcon={false}
                                    disabled={false}
                                    data={
                                      cptSearchData?.length !== 0
                                        ? (cptSearchData as SingleSelectGridDropdownDataType[])
                                        : []
                                    }
                                    selectedValue={selectedCpt}
                                    onSelect={(value) => {
                                      setSelectedCpt(value);
                                      if (value?.value && selectedPractice) {
                                        getNdcPopupData(value?.value);
                                      }
                                      // setselectedNdc(
                                      //   ndcRow[0]?.ndcRowsData?.ndcCode
                                      // );
                                    }}
                                    onSearch={(value) => {
                                      handleSearch(value);
                                    }}
                                    searchValue={cptSearch.searchValue}
                                    appendTextSeparator={'|'}
                                  />
                                </div>
                              </AppTableCell>
                              {selectedMedicalCaseDropdownData && (
                                <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                  <div
                                    data-testid="chargesCptCode"
                                    className="h-[38px] w-[85px]"
                                  >
                                    <SingleSelectGridDropDown
                                      placeholder=""
                                      showSearchBar={true}
                                      showDropdownIcon={false}
                                      disabled={false}
                                      data={
                                        revenueCodeData?.length !== 0
                                          ? (revenueCodeData as SingleSelectGridDropdownDataType[])
                                          : []
                                      }
                                      selectedValue={selectedRevenueCodeData}
                                      onSelect={(value) => {
                                        setSelectedRevenueCodeData(
                                          value || undefined
                                        );
                                      }}
                                      onSearch={(value) => {
                                        setRevenueSearch(value);
                                      }}
                                    />
                                  </div>
                                </AppTableCell>
                              )}
                              <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                <div
                                  className="mb-2 h-[38px] w-[65px]"
                                  title={chargeUnits?.toString() || ''}
                                >
                                  <InputField
                                    value={chargeUnits}
                                    type="text"
                                    cls="!pl-[1px] !pr-[1px] !pt-0 !pb-0"
                                    inputCls="!pl-[9px] !pr-[9px] !pt-0 !pb-0"
                                    pattern="[0-9]*"
                                    onChange={(evt) => {
                                      if (evt.target.value !== '') {
                                        setChargeUnits(
                                          Number(evt.target.value)
                                        );
                                      } else {
                                        setChargeUnits(undefined);
                                      }
                                    }}
                                  />
                                </div>
                              </AppTableCell>
                              <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                <div className="flex gap-x-2">
                                  <div className="flex gap-x-2">
                                    <div
                                      data-testid="modifier1"
                                      className="h-[38px] w-[45px]"
                                    >
                                      <SingleSelectGridDropDown
                                        placeholder=""
                                        showSearchBar={true}
                                        data={
                                          lookupsData?.modifiers
                                            ? (lookupsData?.modifiers as SingleSelectDropDownDataType[])
                                            : []
                                        }
                                        selectedValue={selectedModifier1}
                                        onSelect={(e) => {
                                          setSelectedModifier1(e);
                                        }}
                                        showDropdownIcon={false}
                                        searchOptionFull={false}
                                      />
                                    </div>
                                    <div
                                      data-testid="modifier2"
                                      className="h-[38px] w-[45px]"
                                    >
                                      <SingleSelectGridDropDown
                                        placeholder=""
                                        showSearchBar={true}
                                        data={
                                          lookupsData?.modifiers
                                            ? (lookupsData?.modifiers as SingleSelectDropDownDataType[])
                                            : []
                                        }
                                        selectedValue={selectedModifier2}
                                        onSelect={(e) => {
                                          setSelectedModifier2(e);
                                        }}
                                        showDropdownIcon={false}
                                        searchOptionFull={false}
                                      />
                                    </div>
                                    <div
                                      data-testid="modifier3"
                                      className="h-[38px] w-[45px]"
                                    >
                                      <SingleSelectGridDropDown
                                        placeholder=""
                                        showSearchBar={true}
                                        data={
                                          lookupsData?.modifiers
                                            ? (lookupsData?.modifiers as SingleSelectDropDownDataType[])
                                            : []
                                        }
                                        selectedValue={selectedModifier3}
                                        onSelect={(e) => {
                                          setSelectedModifier3(e);
                                        }}
                                        showDropdownIcon={false}
                                        searchOptionFull={false}
                                      />
                                    </div>
                                    <div
                                      data-testid="modifier4"
                                      className="h-[38px] w-[45px]"
                                    >
                                      <SingleSelectGridDropDown
                                        placeholder=""
                                        showSearchBar={true}
                                        data={
                                          lookupsData?.modifiers
                                            ? (lookupsData?.modifiers as SingleSelectDropDownDataType[])
                                            : []
                                        }
                                        selectedValue={selectedModifier4}
                                        onSelect={(e) => {
                                          setSelectedModifier4(e);
                                        }}
                                        showDropdownIcon={false}
                                        searchOptionFull={false}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </AppTableCell>
                              <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                <div className="h-[38px] w-[160px]">
                                  <SingleSelectGridDropDown
                                    placeholder=""
                                    showSearchBar={true}
                                    data={
                                      lookupsData?.placeOfService
                                        ? (lookupsData?.placeOfService as SingleSelectDropDownDataType[])
                                        : []
                                    }
                                    selectedValue={selectedChargePOS}
                                    isClearable={false}
                                    onSelect={(e) => {
                                      setSelectedChargePOS(e);
                                    }}
                                  />
                                </div>
                              </AppTableCell>
                              <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                <div className="mb-2 h-[38px] w-[110px]">
                                  <InputField disabled={true} />
                                </div>
                              </AppTableCell>
                              <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                {showGridDropdown ? (
                                  <div
                                    data-testid="charge_dx_testid"
                                    className="w-max"
                                  >
                                    <MultiSelectGridDropdown
                                      placeholder=""
                                      data={chargesDxData}
                                      selectedValue={dxCode}
                                      showSearchBar={true}
                                      cls="min-w-[160px]"
                                      onSelect={(e) => {
                                        if (e && e.length < 5) setdxCode(e);
                                      }}
                                      appendTextSeparator={'|'}
                                    />
                                  </div>
                                ) : (
                                  ''
                                )}
                              </AppTableCell>
                              {shouldRenderCPTCell() && (
                                <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                  {selectedCpt && (
                                    <>
                                      {selectedCpt.value[0] === 'J' ||
                                      (selectedCpt.value[0] === '9' &&
                                        selectedCpt.value[1] === '0') ? (
                                        ndcRow && ndcRow.length > 0 ? (
                                          <div className="h-[38px] w-[160px]">
                                            <GridModal
                                              icon={
                                                <span
                                                  className="contents"
                                                  onClick={() =>
                                                    updateNdcRule()
                                                  }
                                                >
                                                  <Icon
                                                    name="pencil"
                                                    size={18}
                                                    color={IconColors.GRAY}
                                                  />
                                                </span>
                                              }
                                              txt="Edit NDC Rule"
                                              cls="w-10 p-2 bg-white shadow border rounded-md border-gray-300"
                                              clsDiv="px-4 py-4"
                                              value={selectedNdc || ''}
                                            >
                                              <AppTable
                                                renderHead={
                                                  <AppTableRow>
                                                    {ndcTableHeader.map(
                                                      (header) => (
                                                        <AppTableCell
                                                          key={header}
                                                        >
                                                          <div className="flex gap-1">
                                                            {header}
                                                            <InfoToggle
                                                              position="right"
                                                              text={
                                                                <div>
                                                                  {getTooltipTextforCharges(
                                                                    header,
                                                                    'ndc'
                                                                  )}
                                                                </div>
                                                              }
                                                            />
                                                          </div>
                                                        </AppTableCell>
                                                      )
                                                    )}
                                                  </AppTableRow>
                                                }
                                                renderBody={ndcRow.map(
                                                  (ndcRowData) => (
                                                    <AppTableRow
                                                      key={
                                                        ndcRowData.ndcRowsData
                                                          ?.id
                                                      }
                                                      cls={
                                                        ndcRowData.isChecked
                                                          ? 'bg-cyan-50'
                                                          : ''
                                                      }
                                                    >
                                                      <AppTableCell component="th">
                                                        <div className="w-[16px]">
                                                          <CheckBox
                                                            id="ndcCheckbox"
                                                            checked={
                                                              ndcRowData.isChecked
                                                            }
                                                            onChange={() =>
                                                              onNdcChange(
                                                                ndcRowData
                                                                  .ndcRowsData
                                                                  ?.id
                                                              )
                                                            }
                                                            disabled={false}
                                                          />
                                                        </div>
                                                      </AppTableCell>
                                                      <AppTableCell component="th">
                                                        <div className="mb-2 h-[38px] w-[131px]">
                                                          <InputField
                                                            value={
                                                              ndcRowData
                                                                .ndcRowsData
                                                                ?.ndcCode || ''
                                                            }
                                                            disabled={true}
                                                          />
                                                        </div>
                                                      </AppTableCell>
                                                      <AppTableCell>
                                                        <div className="flex gap-x-2">
                                                          <div className="mb-2 h-[38px] w-[38px]">
                                                            <InputField
                                                              value={
                                                                ndcRowData
                                                                  .ndcRowsData
                                                                  ?.units || ''
                                                              }
                                                              disabled={
                                                                ndcRowData.isDisabled
                                                              }
                                                              onChange={(
                                                                evt
                                                              ) => {
                                                                setndcRow(
                                                                  () => {
                                                                    /* eslint no-param-reassign: "error" */
                                                                    return ndcRow?.map(
                                                                      (
                                                                        row2
                                                                      ) => {
                                                                        if (
                                                                          row2
                                                                            .ndcRowsData
                                                                            ?.id ===
                                                                          ndcRowData
                                                                            .ndcRowsData
                                                                            ?.id
                                                                        ) {
                                                                          if (
                                                                            row2.ndcRowsData
                                                                          ) {
                                                                            row2.ndcRowsData.units =
                                                                              evt
                                                                                .target
                                                                                .value
                                                                                ? Number(
                                                                                    evt
                                                                                      .target
                                                                                      .value
                                                                                  )
                                                                                : undefined;
                                                                            return {
                                                                              ...row2,
                                                                            };
                                                                          }
                                                                        }
                                                                        return row2;
                                                                      }
                                                                    );
                                                                  }
                                                                );
                                                              }}
                                                              cls="!pl-[1px] !pr-[1px] !pt-0 !pb-0"
                                                              inputCls="!pl-[9px] !pr-[9px] !pt-0 !pb-0"
                                                            />
                                                          </div>
                                                        </div>
                                                      </AppTableCell>
                                                      <AppTableCell>
                                                        <div className="w-[120px]">
                                                          <SingleSelectGridDropDown
                                                            placeholder=""
                                                            showSearchBar={
                                                              false
                                                            }
                                                            disabled={
                                                              ndcRowData.isDisabled
                                                            }
                                                            data={
                                                              lookupsData?.ndcCodes ||
                                                              []
                                                            }
                                                            selectedValue={lookupsData?.ndcCodes?.find(
                                                              (a) =>
                                                                a.id ===
                                                                ndcRowData
                                                                  .ndcRowsData
                                                                  ?.ndcUnitQualifierID
                                                            )}
                                                            onSelect={(e) => {
                                                              setndcRow(() => {
                                                                return ndcRow?.map(
                                                                  (row1) => {
                                                                    if (
                                                                      row1
                                                                        .ndcRowsData
                                                                        ?.id ===
                                                                      ndcRowData
                                                                        .ndcRowsData
                                                                        ?.id
                                                                    ) {
                                                                      if (
                                                                        row1.ndcRowsData
                                                                      ) {
                                                                        row1.ndcRowsData.ndcUnitQualifierID =
                                                                          e
                                                                            ? e.id
                                                                            : undefined;
                                                                        return {
                                                                          ...row1,
                                                                        };
                                                                      }
                                                                    }
                                                                    return row1;
                                                                  }
                                                                );
                                                              });
                                                            }}
                                                          />
                                                        </div>
                                                      </AppTableCell>
                                                      <AppTableCell>
                                                        <div className="mb-2 h-[38px] w-[400px]">
                                                          <InputField
                                                            value={
                                                              ndcRowData
                                                                .ndcRowsData
                                                                ?.serviceDescription ||
                                                              ''
                                                            }
                                                            disabled={true}
                                                          />
                                                        </div>
                                                      </AppTableCell>
                                                    </AppTableRow>
                                                  )
                                                )}
                                              />
                                            </GridModal>
                                          </div>
                                        ) : (
                                          <div className="h-[38px] w-[160px]">
                                            <GridModal
                                              icon={
                                                <Button
                                                  buttonType={
                                                    ButtonType.primary
                                                  }
                                                  onClick={() =>
                                                    createNdcRule(
                                                      selectedCpt?.value || ''
                                                    )
                                                  }
                                                >
                                                  Create NDC Rule
                                                </Button>
                                              }
                                              cls="w-143 h-[38px]"
                                              clsDiv="px-4 py-4"
                                              value=""
                                            >
                                              <AppTable
                                                renderHead={
                                                  <AppTableRow>
                                                    <AppTableCell>
                                                      NDC Code
                                                    </AppTableCell>
                                                    <AppTableCell>
                                                      Units
                                                    </AppTableCell>
                                                    <AppTableCell>
                                                      Dosage Form
                                                    </AppTableCell>
                                                    <AppTableCell>
                                                      Service Description
                                                    </AppTableCell>
                                                    <AppTableCell cls="bg-cyan-100">
                                                      Action
                                                    </AppTableCell>
                                                  </AppTableRow>
                                                }
                                                renderBody={
                                                  <AppTableRow>
                                                    <AppTableCell component="th">
                                                      <div className="mb-2 h-[38px] w-[131px]">
                                                        <InputField
                                                          value={ndcCode}
                                                          onChange={(evt) => {
                                                            const formattedValue =
                                                              formatNDC(
                                                                evt.target.value
                                                              );
                                                            setNDCCode(
                                                              formattedValue
                                                            );
                                                          }}
                                                        />
                                                      </div>
                                                    </AppTableCell>
                                                    <AppTableCell>
                                                      <div className="mb-2 h-[38px] w-[38px]">
                                                        <InputField
                                                          cls="!pl-[1px] !pr-[1px] !pt-0 !pb-0"
                                                          inputCls="!pl-[9px] !pr-[9px] !pt-0 !pb-0"
                                                          value={chargeNdcUnits}
                                                          onChange={(evt) => {
                                                            setChargeNdcUnits(
                                                              evt.target.value
                                                                ? Number(
                                                                    evt.target
                                                                      .value
                                                                  )
                                                                : undefined
                                                            );
                                                          }}
                                                        />
                                                      </div>
                                                    </AppTableCell>
                                                    <AppTableCell>
                                                      <div className="w-[120px]">
                                                        <SingleSelectGridDropDown
                                                          placeholder=""
                                                          showSearchBar={false}
                                                          data={
                                                            lookupsData?.ndcCodes ||
                                                            []
                                                          }
                                                          selectedValue={
                                                            dosageForm
                                                          }
                                                          onSelect={
                                                            setDosageForm
                                                          }
                                                        />
                                                      </div>
                                                    </AppTableCell>
                                                    <AppTableCell>
                                                      <div className="mb-2 h-[38px] w-[400px]">
                                                        <InputField
                                                          value={
                                                            chargeNdcDescription
                                                          }
                                                          onChange={(evt) =>
                                                            setChargeNdcDescription(
                                                              evt.target.value
                                                            )
                                                          }
                                                        />
                                                      </div>
                                                    </AppTableCell>
                                                    <AppTableCell cls="bg-cyan-50">
                                                      <div className="flex gap-x-2">
                                                        <Button
                                                          buttonType={
                                                            ButtonType.secondary
                                                          }
                                                          cls="h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5"
                                                        >
                                                          <Icon
                                                            name="trash"
                                                            size={18}
                                                          />
                                                        </Button>
                                                      </div>
                                                    </AppTableCell>
                                                  </AppTableRow>
                                                }
                                              />
                                            </GridModal>
                                          </div>
                                        )
                                      ) : (
                                        checkCPTCode() && <div></div>
                                      )}
                                    </>
                                  )}
                                </AppTableCell>
                              )}

                              <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                <div
                                  data-testid="chargesFee"
                                  className="mb-2 h-[38px] w-[112px]"
                                >
                                  <InputFieldAmount
                                    disabled={false}
                                    value={selectedChargeFee}
                                    showCurrencyName={false}
                                    onChange={(evt) => {
                                      if (evt.target.value !== '') {
                                        setSelectedChargeFee(
                                          Number(evt.target.value)
                                        );
                                      } else {
                                        setSelectedChargeFee(undefined);
                                      }
                                    }}
                                  />
                                </div>
                              </AppTableCell>

                              <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                <div
                                  data-testid="chargesInsRespFee"
                                  className="mb-2 h-[38px] w-[112px]"
                                >
                                  <InputFieldAmount
                                    disabled={false}
                                    showCurrencyName={false}
                                    value={insResp}
                                    onChange={(evt) => {
                                      if (evt.target.value !== '') {
                                        setInsResp(Number(evt.target.value));
                                      } else {
                                        setInsResp(undefined);
                                      }
                                    }}
                                  />
                                </div>
                              </AppTableCell>
                              <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                <div
                                  data-testid="chargesPatResp"
                                  className="mb-2 h-[38px] w-[112px]"
                                >
                                  <InputFieldAmount
                                    disabled={false}
                                    showCurrencyName={false}
                                    value={patResp}
                                    type="number"
                                    step="0.1"
                                    onChange={(evt) => {
                                      if (evt.target.value !== '') {
                                        setPatResp(Number(evt.target.value));
                                      } else {
                                        setPatResp(undefined);
                                      }
                                    }}
                                  />
                                </div>
                              </AppTableCell>
                              <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                <GridModal
                                  testId="claim_chargebatch_testid"
                                  icon={
                                    <Icon
                                      name={'plus1'}
                                      size={18}
                                      color={IconColors.GRAY}
                                    />
                                  }
                                  cls="w-10 p-2 bg-white shadow border rounded-md border-gray-300"
                                  txt={'Create New Charge Batch'}
                                  value={batchNumber ? batchNumber.value : ''}
                                  clsDiv="px-4 py-2"
                                >
                                  <AppTable
                                    renderHead={
                                      <>
                                        <AppTableRow>
                                          {chargeBatchHeader.map((header) => (
                                            <>
                                              <AppTableCell>
                                                {header}
                                              </AppTableCell>
                                            </>
                                          ))}
                                          <AppTableCell cls="bg-cyan-100">
                                            Action
                                          </AppTableCell>
                                        </AppTableRow>
                                      </>
                                    }
                                    renderBody={
                                      <>
                                        <AppTableRow>
                                          <AppTableCell component="th">
                                            <div
                                              data-testid="batchDropdownOption"
                                              className=" w-[160px]"
                                            >
                                              <SingleSelectGridDropDown
                                                placeholder=""
                                                showSearchBar={true}
                                                data={
                                                  batchSearchData?.length !== 0
                                                    ? (batchSearchData as SingleSelectGridDropdownDataType[])
                                                    : []
                                                }
                                                selectedValue={batchNumber}
                                                onSelect={(e) => {
                                                  setbatchNumber(e);
                                                }}
                                                onSearch={(value) => {
                                                  setBatchSearch({
                                                    ...batchSearch,
                                                    searchValue: value,
                                                  });
                                                }}
                                              />
                                            </div>
                                          </AppTableCell>
                                          <AppTableCell>
                                            <div className="w-[160px]">
                                              <AppDatePicker
                                                testId="claimChargePostingDate"
                                                placeholderText="From"
                                                cls="!whitespace-nowrap mr-3"
                                                onChange={(date) =>
                                                  setPostingDate(date)
                                                }
                                                selected={postingDate}
                                              />
                                            </div>
                                          </AppTableCell>
                                          <AppTableCell>
                                            <div className="w-[160px]">
                                              <SingleSelectGridDropDown
                                                placeholder=""
                                                showSearchBar={false}
                                                data={
                                                  batchDocumentData?.length !==
                                                  0
                                                    ? (batchDocumentData as SingleSelectGridDropdownDataType[])
                                                    : []
                                                }
                                                selectedValue={batchDocument}
                                                onSelect={(e) => {
                                                  setbatchDocument(e);
                                                }}
                                              />
                                            </div>
                                          </AppTableCell>
                                          <AppTableCell>
                                            <div className="flex gap-x-2">
                                              <div className="h-[38px] w-[40px]">
                                                <SingleSelectGridDropDown
                                                  placeholder=""
                                                  showSearchBar={false}
                                                  data={
                                                    batchDocumentPageData?.length !==
                                                    0
                                                      ? (batchDocumentPageData as SingleSelectGridDropdownDataType[])
                                                      : []
                                                  }
                                                  selectedValue={
                                                    batchDocumentPage
                                                  }
                                                  onSelect={(e) => {
                                                    setbatchDocumentPage(e);
                                                  }}
                                                  showDropdownIcon={false}
                                                />
                                              </div>
                                            </div>
                                          </AppTableCell>

                                          <AppTableCell cls="bg-cyan-50">
                                            <div className="flex gap-x-2">
                                              <Button
                                                buttonType={
                                                  ButtonType.secondary
                                                }
                                                cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                                              >
                                                <Icon
                                                  name={'trash'}
                                                  size={18}
                                                />
                                              </Button>
                                            </div>
                                          </AppTableCell>
                                        </AppTableRow>
                                      </>
                                    }
                                  />
                                </GridModal>
                              </AppTableCell>
                              <AppTableCell cls="bg-cyan-50 sticky right-0">
                                <div className="flex gap-x-2">
                                  <Button
                                    buttonType={ButtonType.primary}
                                    onClick={() => {
                                      if (claimID) {
                                        handleChargeUpdateClick();
                                      } else {
                                        saveCharges();
                                      }
                                    }}
                                    cls={`inline-flex h-[38px] justify-center items-center rounded-md text-white leading-5 text-left font-medium pl-[17px] pr-[17px] pt-[9px] pb-[9px] w-[102.03px] `}
                                  >
                                    Save
                                  </Button>
                                </div>
                              </AppTableCell>
                            </AppTableRow>
                          ) : (
                            ''
                          )}
                        </>
                      }
                    />
                  </div>
                  <div
                    hidden={chargesCollapse}
                    className="relative left-0 bottom-0 right-[85.75%] top-20 font-medium leading-5"
                  >
                    <Button
                      buttonType={ButtonType.secondary}
                      onClick={() => {
                        setshowAddChargesRow(true);
                        onToggleEditMode(null);
                        setselectedNdc(null);
                        setCptSearch({
                          searchValue: '',
                          clientID: null,
                        });
                        setndcRow([]);
                        setTimeout(() => {
                          myRef?.current?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'nearest',
                          });
                        }, 100);
                      }}
                      cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                    >
                      <Icon name={'plus1'} size={18} color={IconColors.GRAY} />
                    </Button>
                    <p className={`absolute text-sm inline m-0 px-2 py-2.5`}>
                      Add more charges
                    </p>
                  </div>
                </div>
                <div className="pt-[75px]">
                  <div className="flow-root flex-col">
                    <SectionHeading
                      label="Collected Advance Payments"
                      isCollapsable={true}
                      onClick={() =>
                        setCollectedAdvancePaymentsCollapse(
                          !collectedAdvancePaymentsCollapse
                        )
                      }
                      isCollapsed={collectedAdvancePaymentsCollapse}
                    />
                    <div hidden={collectedAdvancePaymentsCollapse}>
                      <div className=" pt-[60px]">
                        <AppTable
                          cls="max-h-[400px]"
                          renderHead={
                            <>
                              <AppTableRow>
                                {advancePaymentHeader.map((header) => (
                                  <>
                                    <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-2">
                                      {header}
                                    </AppTableCell>
                                  </>
                                ))}
                                <AppTableCell cls="bg-cyan-100 !font-bold !py-2 !whitespace-nowrap !px-2">
                                  Action
                                </AppTableCell>
                              </AppTableRow>
                            </>
                          }
                          renderBody={
                            <>
                              {advancePaymentRows?.map((row) => (
                                <AppTableRow key={row.id}>
                                  <AppTableCell>
                                    <div className="h-[38px] w-[280px]">
                                      <SingleSelectGridDropDown
                                        placeholder="Reason of Payment"
                                        showSearchBar={false}
                                        disabled={row.isEditMode}
                                        data={
                                          lookupsData?.reasonOfPayment
                                            ? (lookupsData?.reasonOfPayment as SingleSelectDropDownDataType[])
                                            : []
                                        }
                                        selectedValue={row?.reasonOfPayment}
                                        onSelect={(value) => {
                                          setSelectedReasonOfPayment(value);
                                        }}
                                      />
                                    </div>
                                  </AppTableCell>
                                  <AppTableCell>
                                    <div className="h-[38px] w-[280px]">
                                      <InputFieldAmount
                                        disabled={row.isEditMode}
                                        value={row.amount}
                                      />
                                    </div>
                                  </AppTableCell>
                                  <AppTableCell>
                                    <div className="h-[38px] w-[280px]">
                                      <SingleSelectGridDropDown
                                        placeholder="Method"
                                        showSearchBar={false}
                                        disabled={row.isEditMode}
                                        data={
                                          lookupsData?.method
                                            ? (lookupsData?.method as SingleSelectDropDownDataType[])
                                            : []
                                        }
                                        selectedValue={row?.method}
                                        onSelect={(value) => {
                                          setSelectedMethod(value);
                                        }}
                                      />
                                    </div>
                                  </AppTableCell>
                                  <AppTableCell component="th">
                                    <div className="flex h-[38px] w-[144px]">
                                      <AppDatePicker
                                        placeholderText="mm/dd/yyyy"
                                        cls=""
                                        onChange={(date) =>
                                          setDateOfPayment(date)
                                        }
                                        disabled={row.isEditMode}
                                        selected={row.dateOfPayment}
                                      />
                                    </div>
                                  </AppTableCell>
                                  <AppTableCell cls="bg-cyan-50">
                                    <div className=" w-[38px]"></div>
                                  </AppTableCell>
                                </AppTableRow>
                              ))}
                              {showAddAdvancePaymentRow ? (
                                <AppTableRow rowRef={myRef}>
                                  <AppTableCell>
                                    <div className="h-[38px] w-[280px]">
                                      <SingleSelectGridDropDown
                                        placeholder="Reason of Payment"
                                        showSearchBar={false}
                                        disabled={false}
                                        data={
                                          lookupsData?.reasonOfPayment
                                            ? (lookupsData?.reasonOfPayment as SingleSelectDropDownDataType[])
                                            : []
                                        }
                                        selectedValue={selectedReasonOfPayment}
                                        onSelect={(value) => {
                                          setSelectedReasonOfPayment(value);
                                        }}
                                      />
                                    </div>
                                  </AppTableCell>
                                  <AppTableCell>
                                    <div className="h-[38px] w-[280px]">
                                      <InputFieldAmount
                                        disabled={false}
                                        value={
                                          advancePaymentAmount
                                            ? Number(advancePaymentAmount)
                                            : ''
                                        }
                                        onChange={(evt) =>
                                          setAdvancePaymentAmount(
                                            evt.target.value
                                          )
                                        }
                                      />
                                    </div>
                                  </AppTableCell>
                                  <AppTableCell>
                                    <div className="h-[38px] w-[280px]">
                                      <SingleSelectGridDropDown
                                        placeholder="Method"
                                        showSearchBar={false}
                                        disabled={false}
                                        data={
                                          lookupsData?.method
                                            ? (lookupsData?.method as SingleSelectDropDownDataType[])
                                            : []
                                        }
                                        selectedValue={selectedMethod}
                                        onSelect={(value) => {
                                          setSelectedMethod(value);
                                        }}
                                      />
                                    </div>
                                  </AppTableCell>
                                  <AppTableCell component="th">
                                    <div className="flex h-[38px] w-[144px]">
                                      <AppDatePicker
                                        placeholderText="mm/dd/yyyy"
                                        cls=""
                                        onChange={(date) =>
                                          setDateOfPayment(date)
                                        }
                                        selected={dateOfPayment}
                                      />
                                    </div>
                                  </AppTableCell>
                                  <AppTableCell cls="bg-cyan-50">
                                    <div className="flex gap-x-2">
                                      <Button
                                        disabled={false}
                                        buttonType={ButtonType.primary}
                                        onClick={() => {
                                          const isPaymentValid =
                                            AdvancePaymentValidation({
                                              reasonOfPayment:
                                                selectedReasonOfPayment || null,
                                              amount: advancePaymentAmount
                                                ? Number(advancePaymentAmount)
                                                : 0,
                                              method: selectedMethod || null,
                                              dateOfPayment:
                                                dateOfPayment || null,
                                            });
                                          if (isPaymentValid) {
                                            if (advancePaymentRows) {
                                              advancePaymentRows.push({
                                                reasonOfPayment:
                                                  selectedReasonOfPayment ||
                                                  null,
                                                amount: advancePaymentAmount
                                                  ? Number(advancePaymentAmount)
                                                  : 0,
                                                method: selectedMethod || null,
                                                dateOfPayment:
                                                  dateOfPayment || null,
                                                isEditMode: true,
                                              });
                                              setAdvancePaymentRows(
                                                advancePaymentRows
                                              );
                                            }
                                            setshowAddAdvancePaymentRow(
                                              !showAddAdvancePaymentRow
                                            );

                                            saveAdvancePayment({
                                              reasonOfPayment:
                                                selectedReasonOfPayment || null,
                                              amount:
                                                advancePaymentAmount || null,
                                              method: selectedMethod || null,
                                              dateOfPayment:
                                                dateOfPayment || null,
                                            });
                                            if (isEditMode) {
                                              const newPaymentData: SavePaymentRequestPayload =
                                                {
                                                  appointmentID: null,
                                                  patientID: selectedPatient
                                                    ? selectedPatient.id
                                                    : null,
                                                  dos: fromDOS
                                                    ? DateToStringPipe(
                                                        fromDOS,
                                                        1
                                                      )
                                                    : null,
                                                  ledgerAccounID:
                                                    selectedReasonOfPayment?.id
                                                      ? selectedReasonOfPayment?.id
                                                      : null,
                                                  amount: advancePaymentAmount
                                                    ? Number(
                                                        advancePaymentAmount
                                                      )
                                                    : null,
                                                  paymentTypeID:
                                                    selectedMethod?.id
                                                      ? selectedMethod?.id
                                                      : null,
                                                  paymentDate: dateOfPayment
                                                    ? DateToStringPipe(
                                                        dateOfPayment,
                                                        1
                                                      )
                                                    : null,
                                                  paymentNumber: null,
                                                  comments: null,
                                                };

                                              // If you want to add the new payment data to the array:
                                              setEditModePaymentData(
                                                (prevData) => [
                                                  ...prevData,
                                                  newPaymentData,
                                                ]
                                              );
                                            }
                                          }
                                        }}
                                        cls={`inline-flex h-[38px] justify-center items-center rounded-md text-white leading-5 text-left font-medium pl-[17px] pr-[17px] pt-[9px] pb-[9px] w-[102.03px] `}
                                      >
                                        Save
                                      </Button>
                                    </div>
                                  </AppTableCell>
                                </AppTableRow>
                              ) : (
                                ''
                              )}
                            </>
                          }
                        />
                      </div>
                    </div>
                    <div
                      hidden={collectedAdvancePaymentsCollapse}
                      className="relative pt-[16px] font-medium leading-5"
                    >
                      <Button
                        buttonType={ButtonType.secondary}
                        onClick={() => {
                          setshowAddAdvancePaymentRow(
                            !showAddAdvancePaymentRow
                          );
                          setDateOfPayment(new Date());
                          setSelectedMethod(undefined);
                          setSelectedReasonOfPayment(undefined);
                          setAdvancePaymentAmount(undefined);
                          setTimeout(() => {
                            myRef?.current?.scrollIntoView({
                              behavior: 'smooth',
                              block: 'nearest',
                            });
                          }, 100);
                        }}
                        cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                      >
                        <Icon
                          name={'plus1'}
                          size={18}
                          color={IconColors.GRAY}
                        />
                      </Button>
                      <p className={`absolute text-sm inline m-0 px-2 py-2.5`}>
                        Add more Advance Payment
                      </p>
                    </div>
                  </div>
                </div>
                <div className="pt-[75px]">
                  <div
                    className={`flex-col relative text-gray-700 leading-7 text-left font-bold w-full`}
                  >
                    <SectionHeading
                      label="Additional Information"
                      isCollapsable={true}
                      onClick={() =>
                        setAdditionalInformationCollapse(
                          !additionalInformationCollapse
                        )
                      }
                      isCollapsed={additionalInformationCollapse}
                    />
                    <div hidden={additionalInformationCollapse}>
                      <AdditionalFiedlsSection
                        selectedData={selectedAdditionalFields}
                        onAddAdditionalFields={(value) => {
                          setSelectedAddtionalInformation(value);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className=" pt-[75px] ">
                  <div
                    className={`flex-col relative text-gray-700 leading-7 text-left font-bold w-full`}
                  >
                    <SectionHeading
                      label="Document Upload"
                      isCollapsable={true}
                      onClick={() =>
                        setDocumentUploadCollapse(!documentUploadCollapse)
                      }
                      isCollapsed={documentUploadCollapse}
                    />
                    <div hidden={documentUploadCollapse}>
                      <div className="flex flex-col gap-6 pt-[60px]">
                        <div>
                          <p className={`text-sm leading-tight text-gray-500`}>
                            {'PNG, JPG, PDF up to 50MB'}
                          </p>
                        </div>
                        <div className={`gap-4 flex items-start  `}>
                          <div className={`relative w-[280px]`}>
                            <div
                              className={`gap-2 flex items-end w-[280px] h-[62px]`}
                            >
                              <div className={`relative w-[280px]`}>
                                <div
                                  className={`w-full items-start self-stretch`}
                                >
                                  <div className="flex gap-1">
                                    <label className="text-sm font-medium leading-5 text-gray-900">
                                      Attachment Type
                                    </label>
                                    <InfoToggle
                                      position="right"
                                      text={
                                        <div>
                                          {' '}
                                          CMS1500 : BOX17 <br /> X12 : LOOP
                                          2310A - NM103
                                        </div>
                                      }
                                    />
                                  </div>
                                  <div className="w-[280px]">
                                    <SingleSelectDropDown
                                      placeholder="Attachment Type"
                                      showSearchBar={true}
                                      disabled={false}
                                      data={
                                        lookupsData?.documentAttachmentType
                                          ? (lookupsData?.documentAttachmentType as SingleSelectDropDownDataType[])
                                          : []
                                      }
                                      selectedValue={selectedattachmentType}
                                      onSelect={(value) => {
                                        setSelectedAttachmentType(value);
                                      }}
                                      isOptional={true}
                                      onDeselectValue={() => {
                                        setSelectedAttachmentType(undefined);
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className={`relative gap-4 flex items-end`}>
                            <div className={`relative w-[280px]`}>
                              <div
                                className={`w-full items-start gap-1 flex flex-col self-stretch`}
                              >
                                <label className="text-sm font-medium leading-5 text-gray-900">
                                  Select File
                                </label>
                                <UploadFile
                                  disabled={
                                    !!(!selectedattachmentType || !claimID)
                                  }
                                  onFileSelect={(e) => {
                                    const maxSize = e.size / 1024 / 1024;
                                    if (maxSize > 50) {
                                      dispatch(
                                        addToastNotification({
                                          id: uuidv4(),
                                          text: 'File size limit exceeded.',
                                          toastType: ToastType.ERROR,
                                        })
                                      );
                                      return;
                                    }
                                    setSelectedFile(e);
                                    setSelectedFileName(e ? e.name : '');
                                  }}
                                  selectedFileName={selectedFileName}
                                  cls={'w-[280px] h-[38px] relative'}
                                ></UploadFile>
                              </div>
                            </div>
                            <Button
                              buttonType={ButtonType.primary}
                              cls={`inline-flex h-[38px] justify-center items-center rounded-md text-white leading-5 text-left font-medium pl-[17px] pr-[17px] pt-[9px] pb-[9px] w-[102.03px] `}
                              onClick={() => {
                                uploadClaimDocument();
                              }}
                            >
                              Upload
                            </Button>
                          </div>
                        </div>
                        {uploadDocumentData && uploadDocumentData.length > 0 && (
                          <>
                            <div
                              className={` text-gray-700 leading-6 font-bold`}
                            >
                              <p className={` text-base m-0 `}>
                                {'Uploaded Files'}
                              </p>
                            </div>
                            <AppTable
                              cls="max-h-[400px]"
                              renderHead={
                                <>
                                  <AppTableRow>
                                    <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !text-center !px-4 w-[10%]">
                                      <div className="inline-flex w-32 items-center justify-center space-x-1  bg-gray-200">
                                        <p className="text-sm font-bold leading-tight text-gray-600">
                                          E-Attach
                                        </p>
                                        <Tooltip
                                          title="Include file with claim submission"
                                          arrow
                                          placement="top"
                                        >
                                          <div className="mt-1">
                                            <Icon
                                              name={'questionMarkcircle'}
                                              size={18}
                                            />
                                          </div>
                                        </Tooltip>
                                      </div>
                                    </AppTableCell>
                                    <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                      Document ID{' '}
                                    </AppTableCell>
                                    <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                      Document Title{' '}
                                    </AppTableCell>
                                    <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                      File Type{' '}
                                    </AppTableCell>
                                    <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                      Attachment Type{' '}
                                    </AppTableCell>
                                    <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                      Uploaded By{' '}
                                    </AppTableCell>
                                    <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                      Uploaded On{' '}
                                    </AppTableCell>
                                    <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4 bg-cyan-100">
                                      Actions
                                    </AppTableCell>
                                  </AppTableRow>
                                </>
                              }
                              renderBody={
                                <>
                                  {uploadDocumentData?.map((uploadDocRow) => (
                                    <AppTableRow key={uploadDocRow?.id}>
                                      <AppTableCell cls="!text-center">
                                        <CheckBox
                                          id="checkbox1"
                                          checked={uploadDocRow.e_attachment}
                                          onChange={() => {
                                            updateEAttachmentClaimDoc(
                                              uploadDocRow
                                            );
                                          }}
                                          disabled={false}
                                        />
                                      </AppTableCell>
                                      <AppTableCell>
                                        {`#${uploadDocRow?.id}`}
                                      </AppTableCell>
                                      <AppTableCell>
                                        {uploadDocRow.title}
                                      </AppTableCell>
                                      <AppTableCell>
                                        {uploadDocRow.documentType
                                          .substring(1)
                                          .toUpperCase()}
                                      </AppTableCell>
                                      <AppTableCell>
                                        {uploadDocRow.category}
                                      </AppTableCell>
                                      <AppTableCell>
                                        {uploadDocRow.createdBy}
                                      </AppTableCell>
                                      <AppTableCell>
                                        {DateToStringPipe(
                                          uploadDocRow.createdOn,
                                          6
                                        )}
                                      </AppTableCell>
                                      <AppTableCell cls="bg-cyan-50">
                                        <div className="flex gap-x-2">
                                          <>
                                            <Button
                                              buttonType={ButtonType.secondary}
                                              onClick={async () => {
                                                const downloadDocData =
                                                  await downloadDocumentBase64(
                                                    uploadDocRow.id
                                                  );
                                                if (
                                                  downloadDocData &&
                                                  downloadDocData.data
                                                ) {
                                                  const pdfResult =
                                                    downloadDocData.data;
                                                  const pdfWindow =
                                                    window.open('');
                                                  if (
                                                    downloadDocData.fileType !==
                                                    '.pdf'
                                                  ) {
                                                    if (pdfWindow) {
                                                      pdfWindow.document.write(
                                                        `<iframe  width='100%' height='100%'  style='position:fixed; top:0; left:0; bottom:0; right:0; transform: translate(5%, 5%); width:100%; height:100%; border:none; margin:0; padding:0; overflow:hidden; z-index:999999;' src='data:image/png;base64, ${encodeURI(
                                                          pdfResult
                                                        )}'></iframe>`
                                                      );
                                                    }
                                                  } else if (pdfWindow) {
                                                    pdfWindow.document.write(
                                                      `<iframe width='100%' height='100%' src='data:application/pdf;base64, ${encodeURI(
                                                        pdfResult
                                                      )}'></iframe>`
                                                    );
                                                  }
                                                }
                                              }}
                                              cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                                            >
                                              <Icon name={'eye'} size={18} />
                                            </Button>
                                            <Button
                                              buttonType={ButtonType.secondary}
                                              cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                                              onClick={async () => {
                                                const downloadDocData =
                                                  await downloadDocumentBase64(
                                                    uploadDocRow.id
                                                  );
                                                if (
                                                  downloadDocData &&
                                                  downloadDocData.data
                                                ) {
                                                  const a =
                                                    document.createElement('a');
                                                  a.href = `data:application/octet-stream;base64,${downloadDocData.data}`;
                                                  a.download =
                                                    downloadDocData.fileName +
                                                    downloadDocData.fileType;
                                                  a.click();
                                                }
                                              }}
                                            >
                                              <Icon
                                                name={'documentDownload'}
                                                size={18}
                                              />
                                            </Button>
                                            <Button
                                              buttonType={ButtonType.secondary}
                                              cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                                              onClick={async () => {
                                                const docDelete =
                                                  await deleteDocument(
                                                    uploadDocRow.id
                                                  );
                                                if (docDelete) {
                                                  getClaimDocumentData();
                                                }
                                              }}
                                            >
                                              <Icon name={'trash'} size={18} />
                                            </Button>
                                          </>
                                        </div>
                                      </AppTableCell>
                                    </AppTableRow>
                                  ))}
                                </>
                              }
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-[75px]">
                  <div
                    className={`flex-col relative text-gray-700 leading-7 text-left font-bold w-full`}
                  >
                    <SectionHeading
                      label="Assign Claim To"
                      isCollapsable={false}
                      isCollapsed={additionalInformationCollapse}
                    />
                    <div className="py-[44px]">
                      <div
                        className={`relative rounded-lg w-[352px] h-[271px] `}
                      >
                        <div
                          className={`pl-[16px] pt-[14px] gap-4 inline-flex flex-col items-start h-[233px] `}
                        >
                          <div
                            className={`w-full gap-1 flex flex-col items-start self-stretch`}
                          >
                            <div className={`relative w-[320px]`}>
                              <div
                                className={`w-full items-start self-stretch`}
                              >
                                <label className="text-sm font-medium leading-5 text-gray-900">
                                  Assign claim to
                                </label>
                                <div className="w-[320px]">
                                  <SingleSelectDropDown
                                    placeholder="Assign Claim To"
                                    showSearchBar={true}
                                    disabled={false}
                                    data={
                                      assignClaimToData
                                        ? (assignClaimToData as SingleSelectDropDownDataType[])
                                        : []
                                    }
                                    appendTextClass={'italic'}
                                    selectedValue={selectedAssignClaimTo}
                                    onSelect={(value) => {
                                      setSelectedAssignClaimTo(value);
                                    }}
                                    isOptional={true}
                                    onDeselectValue={() => {
                                      setSelectedAssignClaimTo(undefined);
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div
                            className={`w-full flex-1 gap-1 flex flex-col items-start flex-grow self-stretch`}
                          >
                            <div
                              className={`gap-2 text-gray-700 leading-5 text-left font-medium font-['Nunito']`}
                            >
                              <p className={`text-sm m-0`}>
                                Leave Note to Assigned User
                              </p>
                            </div>
                            <div className="flex h-[79px] w-[398px]">
                              <TextArea
                                id="textarea"
                                placeholder="Note (optional)"
                                value={assignUserNote || ''}
                                onChange={(evt) =>
                                  setAssignUserNote(evt.target.value)
                                }
                              />
                              <div className="ml-4 inline-flex flex-col justify-end space-y-2">
                                <div className="inline-flex">
                                  <CheckBox
                                    id="activeNote"
                                    cls="w-[16px] h-4 mr-2"
                                    checked={true}
                                    // onChange={() => {
                                    //   setchargesSort(!chargesSort);
                                    // }}
                                    disabled={false}
                                  />
                                  <p className="text-right text-sm font-medium leading-tight text-gray-700">
                                    Active
                                  </p>
                                </div>
                                <div className="inline-flex">
                                  <CheckBox
                                    id="activeNote"
                                    cls="w-[16px] h-4 mr-2"
                                    checked={true}
                                    // onChange={() => {
                                    //   setchargesSort(!chargesSort);
                                    // }}
                                    disabled={false}
                                  />
                                  <p className="text-right text-sm font-medium leading-tight text-gray-700">
                                    Alert
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <Button
                            buttonType={ButtonType.primary}
                            cls={` inline-flex place-self-end justify-center items-center rounded-md text-white leading-5 text-left font-medium pl-[17px] pr-[17px] pt-[9px] pb-[9px] w-[102.03px]`}
                          >
                            Confirm
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-[75px]">
                <div
                  className={classNames(
                    btnClass,
                    isMenuOpened ? `w-11/12  ` : 'w-screen'
                  )}
                >
                  <div className="pt-[24px] pr-[27px] pb-[38px] ">
                    <div className={`gap-4 flex justify-end `}>
                      <div>
                        <Button
                          buttonType={ButtonType.secondary}
                          cls={`w-[102px] `}
                          onClick={() => {
                            const routeHistory: RouteHistoryData[] = JSON.parse(
                              JSON.stringify(
                                store.getState().shared.routeHistory
                              )
                            );
                            if (routeHistory && routeHistory.length > 1) {
                              const newRoute =
                                routeHistory[routeHistory.length - 2];
                              router.push(newRoute?.url || '');
                            } else {
                              router.push('/app/monthly-summary');
                            }
                          }}
                        >
                          Close
                        </Button>
                      </div>
                      <div>
                        <Button
                          buttonType={ButtonType.secondary}
                          cls={` `}
                          onClick={() => {
                            if (claimID) {
                              const scrubClaim: ScrubClaimData[] = [
                                {
                                  claimID: claimID || null,
                                  clientID: selectedGroup
                                    ? selectedGroup.id
                                    : null,
                                  practiceID: selectedPractice
                                    ? selectedPractice.id
                                    : null,
                                  insuranceID: selectedPrimaryInsurance
                                    ? selectedPrimaryInsurance.id
                                    : null,
                                },
                              ];
                              dispatch(scrubClaimRequest(scrubClaim));
                            } else {
                              dispatch(
                                addToastNotification({
                                  id: uuidv4(),
                                  text: 'Please create claim first.',
                                  toastType: ToastType.ERROR,
                                })
                              );
                            }
                          }}
                        >
                          Scrub Claim
                        </Button>
                      </div>
                      <div>
                        <Button
                          buttonType={ButtonType.primary}
                          cls={` `}
                          onClick={() => {
                            saveClaim();
                          }}
                        >
                          Save Claim
                        </Button>
                      </div>
                      <div>
                        <ButtonDropdown
                          buttonLabel="Save and Continue"
                          dataList={[
                            {
                              id: 1,
                              title: 'Create a New Claim',
                              showBottomDivider: false,
                            },
                            {
                              id: 2,
                              title: 'Submit Claim',
                              showBottomDivider: false,
                            },
                            {
                              id: 3,
                              title: 'Submit + Create New Claim',
                              showBottomDivider: false,
                            },
                          ]}
                          onDropdownClick={(val: boolean) => {
                            if (val) {
                              setBtnClass(
                                'fixed bottom-0 bg-gray-200 pr-16 h-[224px]'
                              );
                            } else {
                              setBtnClass('fixed bottom-0 bg-gray-200 pr-16');
                            }
                          }}
                          onSelect={(e: number) => {
                            if (e === 2) {
                              setIsSubmitButtonClicked(true);
                              if (claimID) {
                                onSubmitClaim(claimID, false);
                              } else {
                                saveClaim();
                              }
                            }
                            if (e === 1) {
                              setCreateClaimButtonClicked(true);
                              if (claimID) {
                                onCreateNewClaim();
                              } else {
                                saveClaim();
                              }
                            }
                            if (e === 3) {
                              setIsSubmitButtonClicked(true);
                              setIsSubmitCreateButtonClicked(true);
                              if (claimID) {
                                onSubmitClaim(claimID, false);
                              } else {
                                saveClaim();
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal
        open={autoRenderModal.open}
        modalContentClassName="relative w-[70%] h-[80%] text-left overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 w-full"
        onClose={() => {}}
      >
        <AutoRenderClaimDataModal
          patientID={autoRenderModal.id || 0}
          onClose={() => {
            setAutoRenderModal({ open: false, id: null });
          }}
          onSelect={(value) => {
            if (value) {
              if (value.providerID && value.includeProvider) {
                const providerValue = providersData?.filter(
                  (m) => m.id === value.providerID
                )[0];
                if (providerValue) {
                  setSelectedRenderingProvider(providerValue);
                }
              }
              if (
                value.referringProviderNPI &&
                value.includeRefferingProvider
              ) {
                const refProviderValue = referringProviderData?.filter(
                  (m) => m.id === Number(value.referringProviderNPI)
                )[0];
                if (refProviderValue) {
                  setSelectedReferringProvider(refProviderValue);
                }
              }
              // if (value.includeICDs) {
              //   const newIcdRows = generateIcdRows(value);
              //   setSelectedICDs((prevIcds) => {
              //     const existingIcds = [...prevIcds];
              //     const maxOrder =
              //       existingIcds.length > 0
              //         ? Math.max(...existingIcds.map((icd) => icd.order))
              //         : 0;
              //     const orderedNewIcdRows = newIcdRows.map((icd, index) => ({
              //       ...icd,
              //       order: maxOrder + index + 1,
              //     }));
              //     return [...existingIcds, ...orderedNewIcdRows].sort(
              //       (a, b) => a.order - b.order
              //     );
              //   });
              // }
              setIcdRows([]);
              if (value.includeICDs) {
                const newIcdRows: IcdData[] = [];

                if (value.icd1 !== null)
                  newIcdRows.push({
                    icd10Code: value.icd1,
                    order: 1, // (icdRows?.length || 0) + 1,
                    searchValue: value.icd1,
                  });
                if (value.icd2 !== null)
                  newIcdRows.push({
                    icd10Code: value.icd2,
                    order: 2,
                    searchValue: value.icd2,
                  });
                if (value.icd3 !== null)
                  newIcdRows.push({
                    icd10Code: value.icd3,
                    order: 3,
                    searchValue: value.icd3,
                  });
                if (value.icd4 !== null)
                  newIcdRows.push({
                    icd10Code: value.icd4,
                    order: 4,
                    searchValue: value.icd4,
                  });
                if (value.icd5 !== null)
                  newIcdRows.push({
                    icd10Code: value.icd5,
                    order: 5,
                    searchValue: value.icd5,
                  });
                if (value.icd6 !== null)
                  newIcdRows.push({
                    icd10Code: value.icd6,
                    order: 6,
                    searchValue: value.icd6,
                  });
                if (value.icd7 !== null)
                  newIcdRows.push({
                    icd10Code: value.icd7,
                    order: 7,
                    searchValue: value.icd7,
                  });
                if (value.icd8 !== null)
                  newIcdRows.push({
                    icd10Code: value.icd8,
                    order: 8,
                    searchValue: value.icd8,
                  });
                if (value.icd9 !== null)
                  newIcdRows.push({
                    icd10Code: value.icd9,
                    order: 9,
                    searchValue: value.icd9,
                  });
                if (value.icd10 !== null)
                  newIcdRows.push({
                    icd10Code: value.icd10,
                    order: 10,
                    searchValue: value.icd10,
                  });
                if (value.icd11 !== null)
                  newIcdRows.push({
                    icd10Code: value.icd11,
                    order: 11,
                    searchValue: value.icd11,
                  });
                if (value.icd12 !== null)
                  newIcdRows.push({
                    icd10Code: value.icd12,
                    order: 12,
                    searchValue: value.icd12,
                  });

                setSelectedICDs(newIcdRows);
              }
            }
          }}
        />
      </Modal>
      <StatusModal
        open={statusModalInfo.show}
        heading={statusModalInfo.heading}
        description={statusModalInfo.text}
        statusModalType={statusModalInfo.type}
        showCloseButton={statusModalInfo.showCloseButton}
        okButtonText={statusModalInfo.okButtonText}
        closeButtonText={statusModalInfo.closeButtonText}
        // closeOnClickOutside={true}
        onChange={() => {
          if (statusModalInfo.confirmType === 'dupe_warning') {
            if (
              statusModalInfo.cancelSaveType &&
              statusModalInfo.cancelSaveType === 'Charge' &&
              statusModalInfo.saveCriteria
            ) {
              dispatch(saveChargesRequest(statusModalInfo.saveCriteria));
            }
            if (
              statusModalInfo.cancelSaveType &&
              statusModalInfo.cancelSaveType === 'Claim' &&
              statusModalInfo.saveCriteria
            ) {
              creatClaimRequest(statusModalInfo.saveCriteria);
            }
            if (
              statusModalInfo.cancelSaveType &&
              statusModalInfo.cancelSaveType === 'CC' &&
              statusModalInfo.saveCriteria
            ) {
              creatClaimRequest(statusModalInfo.saveCriteria);
            }
            // setCancelSave((prevState) => ({
            //   ...prevState,
            //   save: true,
            //   type: statusModalInfo.cancelSaveType || '',
            // }));
          }
          setStatusModalInfo({
            ...statusModalInfo,
            show: false,
          });
        }}
        onClose={() => {
          setStatusModalInfo({
            ...statusModalInfo,
            show: false,
          });
        }}
      />
    </AppLayout>
  );
}
