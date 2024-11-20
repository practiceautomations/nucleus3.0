import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import type {
  GridColDef,
  GridRowId,
  GridRowParams,
} from '@mui/x-data-grid-pro';
import {
  GRID_CHECKBOX_SELECTION_COL_DEF,
  GRID_DETAIL_PANEL_TOGGLE_COL_DEF,
} from '@mui/x-data-grid-pro';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import InputMask from 'react-input-mask';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import validator from 'validator';

import Icon from '@/components/Icon';
import MedicalCase from '@/components/MedicalCases';
import LinkableClaimModal from '@/components/MedicalCaseTab/linkableClaimsModal';
import Tabs from '@/components/OrganizationSelector/Tabs';
import PageHeader from '@/components/PageHeader';
import PatientInsurance from '@/components/PatientInsurance';
import { AddAdvancePayement } from '@/components/PatientTabs/addAdvancePayment';
import PatientGarantor from '@/components/PatientTabs/guarantor';
import InsuranceFinder from '@/components/PatientTabs/insurancerFinder';
import AppDatePicker from '@/components/UI/AppDatePicker';
import Badge from '@/components/UI/Badge';
import Breadcrumbs from '@/components/UI/Breadcrumbs/breadcrumbs';
import Button, { ButtonType } from '@/components/UI/Button';
import ButtonDropdown from '@/components/UI/ButtonDropdown';
import CheckBox from '@/components/UI/CheckBox';
import CloseButton from '@/components/UI/CloseButton';
import InputField from '@/components/UI/InputField';
import InputFieldAmount from '@/components/UI/InputFieldAmount';
import Modal from '@/components/UI/Modal';
import RadioButton from '@/components/UI/RadioButton';
import SearchDetailGrid, {
  globalPaginationConfig,
} from '@/components/UI/SearchDetailGrid';
import SearchGridExpandabkeRowModal from '@/components/UI/SearchGridExpandableRowModal';
import SectionHeading from '@/components/UI/SectionHeading';
import type { SingleSelectDropDownDataType } from '@/components/UI/SingleSelectDropDown';
import SingleSelectDropDown from '@/components/UI/SingleSelectDropDown';
import type { StatusModalProps } from '@/components/UI/StatusModal';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import AppTable, { AppTableCell, AppTableRow } from '@/components/UI/Table';
import UploadFile from '@/components/UI/UploadFile';
import ViewNotes from '@/components/ViewNotes';
import AppLayout from '@/layouts/AppLayout';
import {
  currencyFormatter,
  CustomDetailPanelToggle,
  usdPrice,
} from '@/pages/app/all-claims';
import store from '@/store';
import { getselectdWorkGroupsIDsSelector } from '@/store/chrome/selectors';
import {
  addToastNotification,
  fetchAssignClaimToDataRequest,
  fetchFacilityDataRequest,
  fetchGroupDataRequest,
  fetchPracticeDataRequest,
  fetchProviderDataRequest,
  getLookupDropdownsRequest,
} from '@/store/shared/actions';
import {
  checkEligibility,
  deleteDocument,
  deleteGuarantor,
  deleteMedicalCase,
  deletePatient,
  downloadDocumentBase64,
  fetchAllClaimsSearchData,
  fetchAllClaimsSearchDataClaimIDS,
  fetchInsuranceData,
  fetchPatientDataByID,
  fetchPostingDate,
  getAdvancePayament,
  getAllClaimsExpandRowDataById,
  getEligibilityCheckResponse,
  getPatientDocumentData,
  getPatientFinicalDate,
  getPatientGaiurantorTabData,
  getPatientInsuranceTabData,
  getPatientLookup,
  getPatientMedicalCases,
  getScrubingAPIResponce,
  patientInsuranceActive,
  refundAdvancePayment,
  reSaveRegisterPatientDate,
  reversePayament,
  savePatient,
  TimeframeDetailPatientFinanical,
  updateDos,
  uploadPatientDocs,
  validateDemographicAddress,
  validatePatientAddress,
} from '@/store/shared/sagas';
import {
  getAllInsuranceDataSelector,
  getExpandSideMenuSelector,
  getFacilityDataSelector,
  getGroupDataSelector,
  getLookupDropdownsDataSelector,
  getPracticeDataSelector,
  getProviderDataSelector,
} from '@/store/shared/selectors';
import type {
  AdvancePayemntData,
  AllClaimsExpandRowResult,
  AllInsuranceData,
  ClaimNotesData,
  DeleteGuarantorResponse,
  DeletePatientResponseDate,
  EligibilityRequestData,
  GetAllClaimsSearchDataCriteria,
  GetAllClaimsSearchDataResult,
  GetLinkableClaimsForMedicalCaseCriteria,
  GetPatientRequestData,
  LookupDropdownsData,
  PatientDocumnetData,
  PatientFinicalTabData,
  PatientGuarantorTabData,
  PatientInsuranceActiveData,
  PatientInsuranceTabData,
  PatientLookupDropdown,
  PatientMedicalCaseResults,
  PostingDateCriteria,
  ProviderData,
  RefundPaymentData,
  SavePatientRequestData,
  TimeFrameData,
  UpdateDosData,
  ValidateAddressDataType,
  ValidateDemographicResponseDate,
} from '@/store/shared/types';
import { ToastType } from '@/store/shared/types';
import { ExportDataToCSV } from '@/utils';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';
import {
  DateToStringPipe,
  StringToDatePipe,
} from '@/utils/dateConversionPipes';

interface Tprops {
  selectedPatientID: number | null;
}
export default function RegisterPatient({ selectedPatientID }: Tprops) {
  const isMenuOpened = useSelector(getExpandSideMenuSelector);
  const [changeModalState, setChangeModalState] = useState<{
    open: boolean;
    heading: string;
    description: string;
    okButtonText: string;
    closeButtonText: string;
    statusModalType: StatusModalType;
    showCloseButton: boolean;
    closeOnClickOutside: boolean;
  }>({
    open: false,
    heading: '',
    description: '',
    okButtonText: '',
    closeButtonText: '',
    statusModalType: StatusModalType.WARNING,
    showCloseButton: true,
    closeOnClickOutside: true,
  });
  const [selectedInsurance, setSelectedInsurance] = useState<
    SingleSelectDropDownDataType | undefined
  >();
  const dispatch = useDispatch();
  const [updatedDemographicRow, setUpdatedDemographicRow] = useState<
    {
      checked: boolean;
      id: number;
      parameter: string;
      existingValue: string;
      verifiedValue: string;
    }[]
  >([]);
  const [firstName, setFirstName] = useState<string>();
  const [catogary, setCatogary] = useState<string>('');
  const [middelName, setMiddelName] = useState<string>();
  const [lastName, setLastName] = useState<string>();
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [isEligibilityCheckOpen, setIsEligibilityCheckOpen] =
    useState<boolean>(false);
  const [isValidateAddressOpen, setIsValidateAddressOpen] =
    useState<boolean>(false);
  const [isDemographicVerifier, setIsDemographicVerifier] =
    useState<boolean>(false);
  const gridRef = useRef<HTMLTableRowElement>(null);
  const [isTimeFrameHistory, setIsTimeFrameHistory] = useState<boolean>(false);
  const [dateofbirth, setDateofbirth] = useState<Date | null>();
  const [decreseDate, setDecreseDate] = useState<Date | null>();
  const [decreaseReason, setDecreaseReason] = useState<string>('');
  const [activeCheck, setActiveCheck] = useState('Y');
  const [statementCheck, setStatementCheck] = useState('Y');
  const [address1, setAddress1] = useState<string>();
  const [address2, setAddress2] = useState<string>();
  const [extension, setExtension1] = useState<string>('');
  const [city, setCity] = useState<string>();
  const [zip, setZip] = useState<string>();
  const [state, setState] = useState<
    SingleSelectDropDownDataType | undefined
  >();
  const [homePhone, setHomePhone] = useState<string>('');
  const [licenseNumber, setLicenseNumber] = useState<string>('');
  const [workPhone, setWorkPhone] = useState<string>('');
  const [cellPhone, setCellPhone] = useState<string>();
  const [patientCatogry, setPatientCatogry] = useState<string>('');
  const [employerName, setEmployerName] = useState<string>('');
  const [chartNumber, setChartNumber] = useState<string>('');
  const [relation, setRelation] = useState<string>('');
  const [relationfname, setRelationfName] = useState<string>('');
  const [relationsName, setRelationsName] = useState<string>('');
  const [relationAddress1, setRelationAddress1] = useState<string>('');
  const [relationAddress2, setRelationAddress2] = useState<string>('');
  const [relationPhone, setRelationPhone] = useState<string>('');
  const [relationCity, setRelationCity] = useState<string>('');
  const [relationZip, setRelationZip] = useState<string>('');
  const [relationState, setRelationState] =
    useState<SingleSelectDropDownDataType | null>();
  const [relationEmail, setRelationEmail] = useState<string>('');
  const [socialSecurityNumber, setSocialSecurityNumber] = useState<string>();
  const [fax, setFax] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [PCP, setPCP] = useState<string>('');
  const [relationExtension, setRelationExtension] = useState<string>('');
  const [race, setRace] = useState<SingleSelectDropDownDataType | undefined>();
  const [ethnicity, setEthnicity] =
    useState<SingleSelectDropDownDataType | null>();
  const [language, setLanguage] =
    useState<SingleSelectDropDownDataType | null>();
  const [smokingStatus, setSmokingStatus] =
    useState<SingleSelectDropDownDataType | null>();
  const [groupData, setGroupData] = useState<
    SingleSelectDropDownDataType[] | undefined
  >();
  const [selectedPractice, setSelectedPractice] = useState<
    SingleSelectDropDownDataType | undefined
  >();
  const [selectedRendringProvider, setSelectedRendringProvider] =
    useState<SingleSelectDropDownDataType | null>();
  const [selectedFacility, setSelectedFacility] = useState<
    SingleSelectDropDownDataType | undefined
  >();
  const [selectedGender, setSelectedGender] = useState<
    SingleSelectDropDownDataType | undefined | null
  >();
  const [selectedMaritalStatus, setSelectedMaritalStatus] = useState<
    SingleSelectDropDownDataType | undefined
  >();
  const [selectedPlaceOfService, setSelectedPlaceOfService] = useState<
    SingleSelectDropDownDataType | undefined
  >();
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
  const [isMedicalCaseModalOpen, setMedicalCaseModalOpen] = useState(false);
  const [isViewMedicalCaseMode, setIsViewMedicalCaseMode] = useState(false);
  const [selectedMedicalCaseID, setSelectedMedicalCaseID] = useState<
    number | null
  >(null);
  const [isInsuranceFinderModalOpen, setIsInsuranceFinderModalOpen] =
    useState(false);
  const [isGuarantorsModalOpen, setIsGuarantorsModalOpen] = useState(false);
  const practicesData = useSelector(getPracticeDataSelector);
  const facilityData = useSelector(getFacilityDataSelector);
  const [patientlookupData, setPatientlookupData] =
    useState<PatientLookupDropdown>();
  const [insuranceAllData, setInsuanceAllData] = useState<AllInsuranceData[]>(
    []
  );
  const insuranceData = useSelector(getAllInsuranceDataSelector);
  const ProviderData = useSelector(getProviderDataSelector);
  const GroupAPIData = useSelector(getGroupDataSelector);
  const selectedWorkedGroup = useSelector(getselectdWorkGroupsIDsSelector);
  const [selectedRenderingGroup, setSelectedRenderingGroup] = useState<
    SingleSelectDropDownDataType | undefined
  >();
  const [rendringProviderData, setRendringProviderData] = useState<
    ProviderData[] | null
  >();

  useEffect(() => {
    if (selectedWorkedGroup) {
      if (selectedWorkedGroup.groupsData[0]) {
        dispatch(
          fetchAssignClaimToDataRequest({
            clientID: selectedWorkedGroup.groupsData[0]?.id,
          })
        );
      }
      if (selectedWorkedGroup.groupsData[0] && groupData) {
        setSelectedRenderingGroup(
          groupData?.filter(
            (m) => m.id === selectedWorkedGroup.groupsData[0]?.id
          )[0]
        );
      }
    }
  }, [selectedWorkedGroup, groupData]);
  const [insuranceDropdownData, setInsruanceDropdownData] = useState<
    SingleSelectDropDownDataType[]
  >([]);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState<boolean>(false);
  const [isEditDos, setIsEditDos] = useState<boolean>(false);

  const [showRefundPaymentModal, setShowRefundPaymentModal] =
    useState<boolean>(false);
  const [refundRemainingBalance, setRefundRemainingBalance] = useState('');
  const [refundPaymentData, setRefundPaymentData] = useState<RefundPaymentData>(
    {
      advancePaymentID: undefined,
      postingDate: new Date(),
      amount: undefined,
    }
  );

  const [isReversed, setIsRevered] = useState<boolean>(false);
  const [postingDateModel, setPostingDateModel] = useState<boolean>(false);
  const [isDelete, setIsDelete] = useState<boolean>(false);
  const [isDeleteGaur, setIsDeleteGaur] = useState<boolean>(false);
  const [insuranceInactiveData, setInsuranceInactiveData] = useState({
    open: false,
    patientInsuraceID: 0,
    active: false,
  });
  const [selectedRowId, setSelectedRowId] = useState<number>(0);
  const [isClosed, setIsClosed] = useState<boolean>(false);
  const [isDemoResponse, setIsDEmoResponse] = useState<boolean>(false);
  const [routePath, setRoutePath] = useState<string | undefined>();
  const router = useRouter();
  const selectedWorkGroupData = useSelector(getselectdWorkGroupsIDsSelector);
  const [isDocumentsOpen, setIsDocumentsOpen] = useState<boolean>(false);
  const allLookupsData = useSelector(getLookupDropdownsDataSelector);
  const [lookupsData, setLookupsData] = useState<LookupDropdownsData | null>(
    null
  );
  useEffect(() => {
    if (allLookupsData) {
      setLookupsData(allLookupsData);
    }
  }, [allLookupsData]);
  const [timeframerow, setTimeframerow] = useState<TimeFrameData[]>([]);
  const onTimeframeHistory = async (responsibility: string, index: string) => {
    let res: TimeFrameData[] | null = null;
    if (selectedPatientID) {
      res = await TimeframeDetailPatientFinanical(
        responsibility,
        index,
        selectedPatientID
      );
    }
    if (res) {
      setTimeframerow(res);
    }
  };
  const [statusModalState, setStatusModalState] = useState<StatusModalProps>({
    open: false,
    heading: '',
    description: '',
    okButtonText: 'Ok',
    statusModalType: StatusModalType.ERROR,
    showCloseButton: false,
    closeOnClickOutside: false,
  });

  const [validateAddressData, setValidateAddressData] =
    useState<ValidateAddressDataType>({
      id: undefined,
      firmName: '',
      contact: undefined,
      contactEmail: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      zip: '',
      zipPlus4: '',
      error: '',
      validateID: null || undefined,
      validateOn: null,
    });

  const [validateDemographicData, setValidateDemographicData] =
    useState<ValidateDemographicResponseDate>({
      response: '',
      data: null,
    });

  const [financialData, setFinancialData] = useState<PatientFinicalTabData>({
    patientID: null,
    lastPatientPayment: 0,
    lastPatientPaymentDate: '',
    lastPatientStatement: 0,
    lastPatientStatementDate: '',
    lastPatientStatementDays: 0,
    lastPatientStatementType: null,
    financials: [],
  });

  const onDeleteGuarantor = async (GuarantorID: number) => {
    let res: DeleteGuarantorResponse | null = null;
    if (GuarantorID) {
      res = await deleteGuarantor(GuarantorID);
      if (res && res.id === 1) {
        dispatch(
          addToastNotification({
            id: uuidv4(),
            text: res.message,
            toastType: ToastType.SUCCESS,
          })
        );
      } else {
        dispatch(
          addToastNotification({
            id: uuidv4(),
            text: 'Failed to Delete Patient Guarantor.',
            toastType: ToastType.ERROR,
          })
        );
      }
    } else {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Invalid Guarantor ID.',
          toastType: ToastType.ERROR,
        })
      );
    }
  };
  const [guarantorsGridRows, setGuarantorsGridRows] = useState<
    PatientGuarantorTabData[]
  >([]);
  const getPatientgaurantorData = async () => {
    const res = await getPatientGaiurantorTabData(selectedPatientID);
    if (res) {
      setGuarantorsGridRows(res);
    }
  };

  const onDeleteGaurRow = async (params: number) => {
    onDeleteGuarantor(params);
    await getPatientgaurantorData();
  };
  const onFninicalTabData = async () => {
    let res: PatientFinicalTabData | null = null;
    if (selectedPatientID) {
      res = await getPatientFinicalDate(selectedPatientID);
      if (res) {
        setFinancialData({
          patientID: res.patientID,
          lastPatientPayment: res.lastPatientPayment,
          lastPatientPaymentDate: res.lastPatientPaymentDate,
          lastPatientStatement: res.lastPatientStatement,
          lastPatientStatementDate: res.lastPatientStatementDate,
          lastPatientStatementDays: res.lastPatientStatementDays,
          lastPatientStatementType: res.lastPatientStatementType,
          financials: res.financials,
        });
      }
    }
  };
  const formattedDateOfBirth = DateToStringPipe(dateofbirth, 1);
  const [updatedDemoValidationrow, setUpdatedDemoValidationrow] = useState<
    {
      checked: boolean;
      id: number;
      parameter: string;
      existingValue: string;
      verifiedValue: string;
    }[]
  >([]);
  const demographicCol: GridColDef[] = [
    {
      field: 'parameter',
      headerName: 'Parameters',
      flex: 1,
      minWidth: 190,
      disableReorder: true,
      sortable: false,
    },
    {
      field: 'existingValue',
      headerName: 'Existing Value',
      flex: 1,
      minWidth: 335,
      disableReorder: true,
      sortable: false,
    },
    {
      field: 'verifiedValue',
      headerName: 'Verified Value',
      flex: 1,
      minWidth: 335,
      disableReorder: true,
      sortable: false,
      renderCell: (params) => {
        const { row } = params;
        const validationRow = updatedDemoValidationrow.find(
          (rowConfig) => rowConfig.id === row.id
        );
        const verifiedValue = validationRow?.verifiedValue?.toLowerCase();
        const existingValue = validationRow?.existingValue?.toLowerCase();
        const match = verifiedValue === existingValue;
        const iconName = match ? 'valid' : 'redAlert';
        return (
          <div className="flex w-full justify-between">
            <div>{params.value}</div>
            <Icon name={iconName} size={18} />
          </div>
        );
      },
    },
  ];

  const demographicRows = [
    {
      id: 1,
      parameter: 'First Name',
      existingValue: firstName || '-',
      verifiedValue: validateDemographicData.data?.correctedFirstname || '-',
      checked: false,
    },
    {
      id: 2,
      parameter: 'Middle Name',
      existingValue: middelName || '-',
      verifiedValue: validateDemographicData.data?.correctedMiddlename || '-',
      checked: false,
    },
    {
      id: 3,
      parameter: 'Last Name',
      existingValue: lastName || '-',
      verifiedValue: validateDemographicData.data?.correctedLastname || '-',
      checked: false,
    },
    {
      id: 4,
      parameter: 'DOB',
      existingValue: formattedDateOfBirth || '-',
      verifiedValue: validateDemographicData.data?.correctedDOB || '-',
      checked: false,
    },
    {
      id: 5,
      parameter: 'Gender',
      existingValue: selectedGender?.value || '-',
      verifiedValue:
        validateDemographicData.data?.gender === 'm' ? 'Male' : 'Female' || '-',
      checked: false,
    },
    {
      id: 6,
      parameter: 'SSN',
      existingValue: socialSecurityNumber?.replace(/-/g, '') || '-',
      verifiedValue: validateDemographicData.data?.correctedSSN || '-',
      checked: false,
    },
    {
      id: 7,
      parameter: 'Address',
      existingValue: address1 || '-',
      verifiedValue: validateDemographicData.data?.correctedAddress || '-',
      checked: false,
    },
    {
      id: 8,
      parameter: 'City',
      existingValue: city || '-',
      verifiedValue: validateDemographicData.data?.correctedCity || '-',
      checked: false,
    },
    {
      id: 9,
      parameter: 'State',
      existingValue: state?.value || '-',
      verifiedValue: validateDemographicData.data?.correctedState || '-',
      checked: false,
    },
    {
      id: 10,
      parameter: 'Zip Code',
      existingValue: zip || '-',
      verifiedValue: validateDemographicData.data?.correctedZip || '-',
      checked: false,
    },
    {
      id: 11,
      parameter: 'Cell Phone',
      existingValue: cellPhone || '-',
      verifiedValue: validateDemographicData.data?.phoneNumber || '-',
      checked: false,
    },
  ];

  const setUpdateDemographicrows = () => {
    setFirstName(validateDemographicData.data?.correctedFirstname);
    setMiddelName(validateDemographicData.data?.correctedMiddlename);
    setLastName(validateDemographicData.data?.correctedLastname);
    setDateofbirth(
      validateDemographicData.data?.correctedDOB
        ? StringToDatePipe(validateDemographicData.data.correctedDOB)
        : null
    );
    setAddress1(validateDemographicData.data?.correctedAddress);
    setSocialSecurityNumber(validateDemographicData.data?.correctedSSN);
    setCellPhone(validateDemographicData.data?.phoneNumber);
    let gender = '';
    if (validateDemographicData.data?.gender === 'm') {
      gender = 'Male';
    } else if (validateDemographicData.data?.gender === 'f') {
      gender = 'Female';
    } else {
      gender = 'Not Specified';
    }
    setSelectedGender(
      patientlookupData?.gender.filter((m) => m.value === gender)[0]
    );
    setCity(validateDemographicData.data?.correctedCity);
    setState(
      patientlookupData?.states.filter(
        (m) => m.value === validateDemographicData.data?.correctedState
      )[0]
    );
    setZip(validateDemographicData.data?.correctedZip);
    setIsDemographicVerifier(false);
    return setIsDEmoResponse(true);
  };

  const updateSelectedRows = (
    selectedRows: string[],
    rows: any[],
    onUpdate: (arg0: any[]) => void
  ): void => {
    const updatedRows = rows.map((row) => {
      if (selectedRows.includes(row.id.toString())) {
        return {
          ...row,
          existingValue: row.verifiedValue,
          checked: true,
        };
      }
      return row;
    });
    setUpdatedDemographicRow(updatedRows);
    onUpdate(updatedRows);
  };

  const handleButtonDemoClick = () => {
    const selectedRows = updatedDemoValidationrow
      .filter((row) => row.checked)
      .map((row) => row.id.toString());
    updateSelectedRows(
      selectedRows,
      updatedDemoValidationrow,
      setUpdateDemographicrows
    );
    setIsDEmoResponse(true);
    if (isDemoResponse) {
      dispatch(
        addToastNotification({
          text: 'Values Successfull Applied',
          toastType: ToastType.SUCCESS,
          id: '',
        })
      );
    }
    // else {
    //   setStatusModalState({
    //     ...statusModalState,
    //     open: true,
    //     heading: 'Error',
    //     description:
    //       'A system error prevented the Demographics Verifier from applying the verified values to the Patient Profile. Please try again.',
    //     okButtonText: 'Ok',
    //     statusModalType: StatusModalType.ERROR,
    //     showCloseButton: false,
    //     closeOnClickOutside: false,
    //   });
    // }
  };
  type AddressValidationRow = {
    id: number;
    parameter: string;
    existingValue?: string;
    verifiedValue: string;
    checked: boolean;
  };

  const AddressValidationrow: AddressValidationRow[] = [
    {
      id: 1,
      parameter: 'Address 1',
      existingValue:
        catogary === 'patient address' ? address1 : relationAddress1 || '-',
      verifiedValue: validateAddressData.address1 || '-',
      checked: false,
    },
    {
      id: 2,
      parameter: 'Address 2',
      existingValue:
        catogary === 'patient address' ? address2 : relationAddress2 || '-',
      verifiedValue: validateAddressData.address2 || '-',
      checked: false,
    },
    {
      id: 3,
      parameter: 'Extension',
      existingValue:
        catogary === 'patient address' ? extension : relationExtension || '-',
      verifiedValue: validateAddressData.zipPlus4 || '-',
      checked: false,
    },
    {
      id: 4,
      parameter: 'City',
      existingValue:
        catogary === 'patient address' ? city : relationCity || '-',
      verifiedValue: validateAddressData.city || '-',
      checked: false,
    },
    {
      id: 5,
      parameter: 'State',
      existingValue:
        catogary === 'patient address'
          ? state?.value
          : relationState?.value || '-',
      verifiedValue: validateAddressData.state || '-',
      checked: false,
    },
    {
      id: 6,
      parameter: 'ZIP Code',
      existingValue: catogary === 'patient address' ? zip : relationZip || '-',
      verifiedValue: validateAddressData.zip || '-',
      checked: false,
    },
  ];

  const [updatedAddressValidationrow, setUpdatedAddressValidationrow] =
    useState<AddressValidationRow[]>([]);
  useEffect(() => {
    if (demographicRows) {
      if (updatedDemographicRow.length > 0) {
        setUpdatedDemoValidationrow(
          updatedDemographicRow.map((row) => ({
            ...row,
            existingValue: row.existingValue ?? '-',
            checked:
              row.verifiedValue?.toLowerCase() !==
              (row.existingValue ?? '-').toLowerCase(),
          }))
        );
      } else {
        setUpdatedDemoValidationrow(
          demographicRows.map((row) => ({
            ...row,
            existingValue: row.existingValue ?? '-',
            checked:
              row.verifiedValue?.toLowerCase() !==
              (row.existingValue ?? '-').toLowerCase(),
          }))
        );
      }
    }
  }, [validateDemographicData.data]);
  useEffect(() => {
    if (validateAddressData) {
      setUpdatedAddressValidationrow(
        AddressValidationrow.map((row) => ({
          ...row,
          existingValue: row.existingValue ?? '-',
          checked:
            row.verifiedValue?.toLowerCase() !==
            (row.existingValue ?? '-').toLowerCase(),
        }))
      );
    }
  }, [validateAddressData]);
  const ValidationCol: GridColDef[] = [
    {
      field: 'parameter',
      headerName: 'Parameters',
      flex: 1,
      minWidth: 185,
      disableReorder: true,
      sortable: false,
    },
    {
      field: 'existingValue',
      headerName: 'Existing Value',
      flex: 1,
      minWidth: 325,
      disableReorder: true,
      sortable: false,
    },
    {
      field: 'verifiedValue',
      headerName: 'Verified Value',
      flex: 1,
      minWidth: 325,
      disableReorder: true,
      sortable: false,
      renderCell: (params) => {
        const { row } = params;
        const validationRow = updatedAddressValidationrow.find(
          (rowConfig) => rowConfig.id === row.id
        );
        const verifiedValue = validationRow?.verifiedValue?.toLowerCase();
        const existingValue = validationRow?.existingValue?.toLowerCase();
        const match = verifiedValue === existingValue;

        const iconName = match ? 'valid' : 'redAlert';
        return (
          <div className="flex w-full justify-between">
            <div>{params.value}</div>
            <Icon name={iconName} size={18} />
          </div>
        );
      },
    },
  ];

  const setUpdaterows = () => {
    if (catogary === 'patient address') {
      setAddress1(validateAddressData.address1);
      setAddress2(validateAddressData.address2);
      setState(
        patientlookupData?.states.filter(
          (m) => m.value === validateAddressData.state
        )[0]
      );
      setExtension1(validateAddressData.zipPlus4);
      setCity(validateAddressData.city);
      setZip(validateAddressData.zip);
    }
    if (catogary === 'patient emergency address') {
      setRelationAddress1(validateAddressData.address1);
      setRelationAddress2(validateAddressData.address2);
      setRelationCity(validateAddressData.city);
      setRelationExtension(validateAddressData.zipPlus4);
      setRelationZip(validateAddressData.zip);
      setRelationState(
        patientlookupData?.states.filter(
          (m) => m.value === validateAddressData.state
        )[0]
      );
    }
    // setIsResponse(true);
    return true;
  };

  const handleButtonClick = () => {
    const isResponse = setUpdaterows();
    const selectedRows = updatedAddressValidationrow
      .filter((row) => row.checked)
      .map((row) => row.id.toString());
    updateSelectedRows(
      selectedRows,
      updatedAddressValidationrow,
      setUpdaterows
    );
    if (isResponse) {
      dispatch(
        addToastNotification({
          text: 'Values Successfull Applied',
          toastType: ToastType.SUCCESS,
          id: '',
        })
      );
    } else {
      setStatusModalState({
        ...statusModalState,
        open: true,
        heading: 'Error',
        description:
          'A system error prevented the Validate Address from applying the selected verified values to the Patient Profile. Please try again.',
        okButtonText: 'Ok',
        statusModalType: StatusModalType.ERROR,
        showCloseButton: false,
        closeOnClickOutside: false,
      });
    }
  };
  const [totalCount, setTotalCount] = useState<number>();
  interface TabProps {
    id: number | undefined;
    name: string;
    count?: number | string;
    dataTestId?: string;
  }

  const [tabs, setTabs] = useState<TabProps[]>([
    {
      id: 1,
      name: selectedPatientID ? 'Patient Details' : 'Register Patient',
    },
    {
      id: 2,
      name: 'Insurance',
    },
    {
      id: 3,
      dataTestId: 'RegisterPatientGuarantorTabTestId',
      name: 'Guarantor',
    },
    {
      id: 4,
      name: 'Financial',
    },
    {
      id: 5,
      name: 'Advanced Payment',
      dataTestId: 'RegisterPatientAdvancedPaymentTabTestId',
    },
    {
      id: 6,
      name: 'Claims',
      count: '',
    },
    {
      id: 7,
      name: 'Medical Case',
      // count: '',
    },
    {
      id: 8,
      name: 'Documents',
      count: '',
    },
  ]);

  const handleInputChange = (event: any) => {
    const inputValue = event.target.value;

    const maskedValue = inputValue.replace(
      /^(\d{3})[-]?(\d{2})[-]?(\d{1,4})$/g,
      '***-**-$3'
    );
    setSocialSecurityNumber(maskedValue);
  };
  const [eligibilityCheckData, setEligibilityCheckData] =
    useState<EligibilityRequestData>({
      patientInsuranceID: null,
      insuranceID: null,
      serviceTypeCodeID: null,
      dos: '',
    });
  const [currentTab, setCurrentTab] = useState(tabs[0]);
  const [selectedPatientData, setSelectedPatientData] =
    useState<GetPatientRequestData | null>(null);
  const [insuranceSubscriberData, setInsuranceSubscriberData] =
    useState<GetPatientRequestData | null>(null);
  const [gaurSubscriberData, setGaurSubscriberData] =
    useState<GetPatientRequestData | null>(null);
  const [addressValidatedOn, setAddressValidatedOn] = useState<string | null>(
    null
  );
  const [emgAddressValidatedOn, setEmgAddressValidatedOn] = useState<
    string | null
  >(null);
  const getRegisterPatientDataByID = async (id: number) => {
    const res = await fetchPatientDataByID(id);
    if (res) {
      setSelectedPatientData(res);
      setSelectedRenderingGroup(
        GroupAPIData?.filter((m) => m.id === res.groupID)[0]
      );
      setSelectedPractice(
        practicesData?.filter((m) => m.id === res.practiceID)[0]
      );
      setSelectedFacility(
        facilityData?.filter((m) => m.id === res.facilityID)[0]
      );
      setSelectedPlaceOfService(
        lookupsData?.placeOfService.filter((m) => m.id === res.posID)[0]
      );

      setSelectedRendringProvider(
        rendringProviderData?.filter((m) => m.id === res.providerID)[0]
      );
      setFirstName(res.firstName);
      setMiddelName(res.middleName);
      setLastName(res.lastName);
      const DOB = res?.dob ? res.dob.toString() : '';
      const DOBs = DOB.split('T')[0];
      if (DOBs) {
        setDateofbirth(StringToDatePipe(DOBs));
      }
      setSelectedGender(
        patientlookupData?.gender.filter((m) => m.id === res.genderID)[0]
      );
      setSelectedMaritalStatus(
        patientlookupData?.maritals.filter(
          (m) => m.id === res.maritalStatusID
        )[0]
      );
      setAccountNumber(res.accountNo);
      setActiveCheck(res.active ? 'Y' : 'N');
      setStatementCheck(res.eStatement ? 'Y' : 'N');
      setAddress1(res.address1);
      setAddress2(res.address2);
      setCity(res.city);
      setState(
        patientlookupData?.states.filter((m) => m.value === res.state)[0]
      );
      setZip(res.zipCode);
      setExtension1(res.zipCodeExtension);
      const hNum = res.homePhone;
      if (hNum) {
        setHomePhone(hNum);
      }
      const WNum = res.workPhone;
      if (WNum) {
        setWorkPhone(WNum);
      }
      const CNum = res.cellPhone;
      if (CNum) {
        setCellPhone(CNum);
      }
      setFax(res.fax);
      setEmail(res.email);
      setRace(patientlookupData?.race.filter((m) => m.id === res.raceID)[0]);
      setEthnicity(
        patientlookupData?.ethnicity.filter((m) => m.id === res.ethnicityID)[0]
      );
      setLanguage(
        patientlookupData?.language.filter((m) => m.id === res.languageID)[0]
      );
      setPCP(res.primaryCarePhysician);
      setPatientCatogry(res.category);
      setChartNumber(res.chartNo);
      setLicenseNumber(res.licenseNo);
      setEmployerName(res.emergencyFirstName);
      setSmokingStatus(
        patientlookupData?.smokingStatus.filter(
          (m) => m.id === res.smokingStatusID
        )[0]
      );
      setDecreaseReason(res.deceaseReason);
      const DD = res?.deceaseDate ? res?.deceaseDate.toString() : '';
      const DDs = DD.split('T')[0];
      if (DDs) {
        setDecreseDate(new Date(DDs));
      }
      setRelation(res.emergencyRelation);
      setRelationAddress1(res.emergencyAddress1);
      setRelationAddress2(res.emergencyAddress2);
      setRelationsName(res.emergencyFirstName);
      setRelationfName(res.emergencyLastName);
      setRelationZip(res.emergencyZipCode);
      setRelationCity(res.emergencyCity);
      setRelationState(
        patientlookupData?.states.filter(
          (m) => m.value === res.emergencyState
        )[0]
      );
      setRelationExtension(res.emergencyzipCodeExtension);
      setRelationPhone(res.emergencyTelephone);
      setRelationEmail(res.emergencyEmail);
      const ssn = res.socialSecurityNumber;
      if (ssn) {
        const formattedSSN = `${ssn?.slice(0, 3)}-${ssn?.slice(
          3,
          5
        )}-${ssn?.slice(5)}`;
        setSocialSecurityNumber(formattedSSN);
      }
      setValidateAddressData({
        ...validateAddressData,
        validateOn: res.addressValidateOn,
      });
      setAddressValidatedOn(res.addressValidateOn);
      setEmgAddressValidatedOn(res.emgAddressValidateOn);
    }
  };
  const [insuranceGridRows, setInsuranceGridRows] = useState<
    PatientInsuranceTabData[]
  >([]);

  const [paymentLedgerRows, setPaymentLedgerRows] =
    useState<AdvancePayemntData>();
  const [dosLedger, setDosLedger] = useState<string>('');
  const [postingDate, setPostingDate] = useState<string>('');
  const [advPaymentID, setAdvPaymentID] = useState<number | null>(null);
  const [selectedInsuranceGridRow, setSelectedInsuranceGridRow] =
    useState<PatientInsuranceTabData>();
  const [selectedGaurGridRow, setSelectedGaurGridRow] =
    useState<PatientGuarantorTabData>();

  const insuranceTabs = [
    {
      id: 1,
      name: 'Active',
      count: insuranceGridRows.filter((m) => m.active === true).length,
    },
    {
      id: 2,
      name: 'Inactive',
      count: insuranceGridRows.filter((m) => m.active === false).length,
    },
  ];
  const [selectedInsuranceTab, setSelectedInsuranceTab] = useState(
    insuranceTabs[0]
  );

  const getPatientInsuranceData = async () => {
    const res = await getPatientInsuranceTabData(selectedPatientID);
    if (res) {
      setInsuranceGridRows(res);
      setInsruanceDropdownData(
        res.map((m) => ({
          id: m.insuranceID,
          value: m.insuranceName,
        }))
      );
    }
  };
  const insuranceActive = async () => {
    const data: PatientInsuranceActiveData = {
      patientInsuranceID: insuranceInactiveData.patientInsuraceID,
      active: insuranceInactiveData.active,
    };
    const res = await patientInsuranceActive(data);
    if (res && res.message) {
      store.dispatch(
        addToastNotification({
          id: uuidv4(),
          text: `${res.message}`,
          toastType: ToastType.SUCCESS,
        })
      );
    }
    getPatientInsuranceData();
    setInsuranceInactiveData({
      open: false,
      patientInsuraceID: 0,
      active: false,
    });
  };

  const getPatientLedgerData = async () => {
    const res = await getAdvancePayament(selectedPatientID);
    if (res) {
      const paymentLedgerData: AdvancePayemntData = {
        withDOSAmount: res.withDOSAmount,
        withoutDOSAmount: res.withoutDOSAmount,
        totalBalance: res.totalBalance,
        patientAdvancePayments: res.patientAdvancePayments,
      };
      setPaymentLedgerRows(paymentLedgerData);
    }
  };

  const onRefundPayment = async () => {
    const postingDateCriteria: PostingDateCriteria = {
      id: selectedPatientData?.groupID,
      type: 'charge',
      postingDate: DateToStringPipe(refundPaymentData.postingDate, 1),
    };
    const dateRes = await fetchPostingDate(postingDateCriteria);
    if (dateRes && dateRes.postingCheck === false) {
      setChangeModalState({
        ...changeModalState,
        open: true,
        heading: 'Error',
        statusModalType: StatusModalType.ERROR,
        description: dateRes.message,
      });
      return;
    }

    const obj: any = { ...refundPaymentData };
    obj.postingDate = DateToStringPipe(obj.postingDate, 1);

    const res = await refundAdvancePayment(obj);
    if (!res) {
      setStatusModalState({
        ...statusModalState,
        open: true,
        heading: 'Error',
        statusModalType: StatusModalType.ERROR,
        description: 'Something Went Wrong',
      });
    } else {
      getPatientLedgerData();
      setShowRefundPaymentModal(false);
    }
  };

  const getReversepaymentResponse = () => {
    reversePayament(advPaymentID || undefined, postingDate);
  };

  const [selectedFile, setSelectedFile] = useState<File>();
  const [documentData, setDocumentData] = useState<PatientDocumnetData[]>([]);
  const [selectedAttachmentType, setSelectedAttachmentType] =
    useState<SingleSelectDropDownDataType>();
  const getDocumentDataByID = async () => {
    if (selectedRenderingGroup) {
      const res = await getPatientDocumentData(
        selectedPatientID,
        selectedRenderingGroup?.id,
        null
      );
      if (res) {
        setDocumentData(res);
        setTabs(
          tabs.map((d) => {
            return { ...d, count: d.id === 8 ? res.length : d.count };
          })
        );
      }
    }
  };
  const defaultSearchDataCriteria: GetAllClaimsSearchDataCriteria = {
    selector: '',
    claimStatusID: undefined,
    scrubStatusID: undefined,
    submitStatusID: undefined,
    timelyFiling: undefined,
    fromAgingDays: undefined,
    toAgingDays: undefined,
    posID: undefined,
    assignedTo: '',
    fromDOS: undefined,
    toDOS: undefined,
    fromCreatedOn: undefined,
    toCreatedOn: undefined,
    fromSubmissionDate: undefined,
    toSubmissionDate: undefined,
    categoryID: undefined,
    stateCategoryID: undefined,
    actionCategoryID: undefined,
    getAllData: false,
    sortColumn: '',
    sortOrder: '',
    pageNumber: 1,
    pageSize: globalPaginationConfig.activePageSize,
    claimStatusIDS: undefined,
    fromFee: undefined,
    toFee: undefined,
  };
  const [lastSearchDataCriteria, setLastSearchDataCriteria] = useState(
    defaultSearchDataCriteria
  );
  const [searchResult, setSearchResult] = useState<
    GetAllClaimsSearchDataResult[]
  >([]);
  const getAllClaimsSearchData = async (
    criterea: GetAllClaimsSearchDataCriteria
  ) => {
    if (!selectedWorkGroupData) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Please Select a Group/Workgroup from Organization Selector',
          toastType: ToastType.ERROR,
        })
      );
      return;
    }
    const selector = {
      groups: selectedWorkGroupData?.groupsData?.map((m) => m.id) || [],
      practices: selectedWorkGroupData?.practicesData?.map((m) => m.id) || [],
      facilities: selectedWorkGroupData?.facilitiesData?.map((m) => m.id) || [],
      providers: selectedWorkGroupData?.providersData?.map((m) => m.id) || [],
    };
    const res = await fetchAllClaimsSearchData({
      ...criterea,
      patientSearch: selectedPatientID?.toString(),
      selector: JSON.stringify(selector),
    });
    if (res) {
      setLastSearchDataCriteria(JSON.parse(JSON.stringify(criterea)));
      setTotalCount(res[0]?.total || 0);
      setSearchResult(res);
      setTabs(
        tabs.map((d) => {
          return { ...d, count: d.id === 6 ? res[0]?.total : d.count };
        })
      );
    }
  };
  const [medicalCaseRowData, setMedicalCaseRowData] = useState<
    PatientMedicalCaseResults[]
  >([]);

  const [medicalCaseTabs, setMedicalCaseTabs] = useState<
    {
      id: number;
      name: string;
      count: number;
    }[]
  >([
    {
      id: 0,
      name: 'Open',
      count: 0,
    },
  ]);

  const getPatientMedicalCaseData = async () => {
    if (selectedPatientID) {
      const res = await getPatientMedicalCases(selectedPatientID);
      if (res) {
        setMedicalCaseRowData(res.patientMedicalCases);
        const mappedTabs = res.summary.map((summary, index) => ({
          id: index, // Assuming Open has id 1 and Closed has id 2
          name: summary.caseStatus,
          count: summary.counts,
        }));
        // Set the state with the mappedTabs data
        setMedicalCaseTabs(mappedTabs);
      }
    }
  };
  useEffect(() => {
    if (
      selectedPatientID &&
      patientlookupData &&
      GroupAPIData &&
      practicesData &&
      ProviderData &&
      facilityData
    ) {
      getRegisterPatientDataByID(selectedPatientID);
    }
    if (selectedPatientID) {
      getPatientMedicalCaseData();
      getPatientInsuranceData();
      getPatientgaurantorData();
      onFninicalTabData();
      getPatientLedgerData();
      getAllClaimsSearchData(lastSearchDataCriteria);
    }
    if (selectedPatientID && selectedRenderingGroup) {
      getDocumentDataByID();
    }
  }, [
    selectedPatientID,
    patientlookupData,
    GroupAPIData,
    selectedRenderingGroup,
    GroupAPIData,
    practicesData,
    ProviderData,
    facilityData,
  ]);
  const [DosData, setDosData] = useState<UpdateDosData>({
    dos: '',
    advancePaymentID: null,
  });

  const onApplyNewDos = async () => {
    const updateDosData: UpdateDosData = {
      dos: DosData.dos,
      advancePaymentID: advPaymentID,
    };
    if (updateDosData) {
      const res = await updateDos(updateDosData);
      setIsEditDos(false);
      if (!res) {
        setStatusModalState({
          ...statusModalState,
          open: true,
          heading: 'Error',
          statusModalType: StatusModalType.ERROR,
          description: 'Something Went Wrong',
        });
      } else {
        getPatientLedgerData();
        setDosLedger('');
      }
    }
    // }
  };

  const [isViewInsuranceMode, setIsViewInsuranceMode] = useState(false);
  const onViewEligibilityResponse = (data: string) => {
    const newTab = window.open();
    if (newTab) {
      newTab.document.write(data);
      newTab.document.close();
    }
  };

  const [isViewGaurMode, setIsViewGaurMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const checkEligibilityForInsurance = async () => {
    const res = await checkEligibility(eligibilityCheckData);
    if (res) {
      onViewEligibilityResponse(res.response);
      setIsEligibilityCheckOpen(false);
      getPatientInsuranceData();
    }
  };

  const postingDateCriteria: PostingDateCriteria = {
    id: selectedPatientData?.groupID,
    type: 'charge',
    postingDate: DateToStringPipe(postingDate, 1),
  };
  const columns: GridColDef[] = [
    {
      field: 'insuranceName',
      headerName: 'Insurance Name',
      flex: 1,
      minWidth: 180,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-cyan-500"
            onClick={() => {
              setSelectedInsuranceGridRow(params.row);
              setIsViewInsuranceMode(false);
              setIsInsuranceModalOpen(true);
            }}
          >
            {params.value}
          </div>
        );
      },
    },
    {
      field: 'payerResponsibility',
      headerName: 'Payer Responsibility',
      flex: 1,
      minWidth: 170,
      disableReorder: true,
    },
    {
      field: 'insuranceNumber',
      headerName: 'Insurance Number',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'groupNumber',
      headerName: 'Group Number',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'firstName',
      headerName: 'Subscriber Name',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div>
            <> {`${params.value}  ${params.row.lastName}`} </>
          </div>
        );
      },
    },
    {
      field: 'relation',
      headerName: 'Relation',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'active',
      headerName: 'Active',
      flex: 1,
      minWidth: 80,
      disableReorder: true,
      renderCell: (params) => {
        return <div>{params.value ? 'Yes' : 'No'}</div>;
      },
    },
    {
      field: 'checkEligibilityDate',
      headerName: 'Eligibility Checks',
      flex: 1,
      minWidth: 460,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-row  gap-4">
            <div className="self-center">
              {params.value ? (
                <div className=" flex flex-col">
                  <div className="flex flex-row gap-1">
                    <Icon name="greenCheck" size={16} />
                    <div className="text-sm font-medium leading-5 text-green-600">
                      {'Checked'}
                    </div>
                    <div className="text-sm font-normal leading-5 text-gray-500">
                      -
                    </div>
                    <div
                      onClick={async () => {
                        const res = await getEligibilityCheckResponse(
                          params.row.eligibilityRequestID
                        );
                        if (res) {
                          onViewEligibilityResponse(res.eligibilityBenefit);
                        }
                      }}
                      className="text-sm font-normal leading-5 text-cyan-500 underline "
                    >
                      View Report
                    </div>
                  </div>
                  <div>
                    {`${'Last Checked On:'} ${
                      params.row.checkEligibilityDate
                        ? params.row.checkEligibilityDate.split('T')[0]
                        : ''
                    }`}
                  </div>
                </div>
              ) : (
                'Not Checked'
              )}
            </div>
            <div className="text-xs font-normal leading-4">
              <div>
                <Button
                  buttonType={ButtonType.primary}
                  cls={
                    params.value
                      ? 'w-[190px] inline-flex px-4 py-2 gap-2 leading-5 ml-2.5'
                      : 'w-[170px] inline-flex px-4 py-2 gap-2 leading-5 ml-2.5'
                  }
                  onClick={() => {
                    setIsEligibilityCheckOpen(true);
                    setEligibilityCheckData({
                      ...eligibilityCheckData,
                      patientInsuranceID: params.row.id,
                      insuranceID: params.row.insuranceID,
                      serviceTypeCodeID: 29,
                      dos: DateToStringPipe(new Date(), 1),
                    });
                  }}
                >
                  <Icon name={'shieldCheck'} size={18} />
                  {params.value ? (
                    <p className="mt-[2px] self-center text-xs font-medium leading-4">
                      Eligibility Check Again
                    </p>
                  ) : (
                    <p className="mt-[2px] self-center text-xs font-medium leading-4">
                      Eligibility Check
                    </p>
                  )}
                </Button>
                <>
                  <Modal
                    open={isEligibilityCheckOpen}
                    onClose={() => {
                      setIsEligibilityCheckOpen(false);
                    }}
                    modalContentClassName="rounded-lg bg-gray-100  text-left shadow-xl  h-[464px] w-[960px]"
                  >
                    <div className="m-5 text-gray-700">
                      <SectionHeading label={'Eligibility Check'} />
                      <div className="flex items-center justify-end gap-5">
                        <CloseButton
                          onClick={() => {
                            setIsEligibilityCheckOpen(false);
                          }}
                        />
                      </div>
                    </div>
                    <div className="mt-[36px] bg-gray-100"></div>
                    <div className="ml-[27px]">
                      <p className="mt-[8px] mb-[4px] w-16  text-base font-bold leading-normal text-gray-700">
                        Insurance
                      </p>
                      <div className="flex w-full gap-4">
                        <div className={`gap-1 w-auto `}>
                          <label className="text-sm font-medium leading-5 text-gray-700">
                            Select Insurance Plan
                            <span className="text-cyan-500">*</span>
                          </label>
                          <div
                            className={`w-full gap-1 justify-center flex flex-col items-start self-stretch `}
                          >
                            <div
                              className="w-[240px] "
                              title={selectedRenderingGroup?.value}
                            >
                              <SingleSelectDropDown
                                placeholder="-"
                                showSearchBar={false}
                                data={
                                  insuranceDropdownData
                                    ? (insuranceDropdownData as SingleSelectDropDownDataType[])
                                    : []
                                }
                                selectedValue={
                                  insuranceDropdownData.filter(
                                    (m) =>
                                      m.id === eligibilityCheckData.insuranceID
                                  )[0]
                                }
                                onSelect={(value) => {
                                  setEligibilityCheckData({
                                    ...eligibilityCheckData,
                                    insuranceID: value.id,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className=" ml-[27px]">
                      <p className="mt-[32px] mb-[4px] w-16  text-base font-bold leading-normal text-gray-700">
                        Service
                      </p>
                      <div className="flex w-auto gap-2 ">
                        <div className={`gap-1 w-auto`}>
                          <label className="text-sm font-medium leading-5 text-gray-700">
                            Service Type
                            <span className="text-cyan-500">*</span>
                          </label>
                          <div
                            className={`w-full gap-1 justify-center flex flex-col items-start self-stretch`}
                          >
                            <div className="w-[240px] ">
                              <SingleSelectDropDown
                                placeholder="-"
                                showSearchBar={true}
                                disabled={false}
                                data={
                                  patientlookupData
                                    ? (patientlookupData.serviceType as SingleSelectDropDownDataType[])
                                    : []
                                }
                                selectedValue={
                                  patientlookupData &&
                                  patientlookupData.serviceType.filter(
                                    (m) =>
                                      m.id ===
                                      eligibilityCheckData.serviceTypeCodeID
                                  )[0]
                                }
                                onSelect={(value) => {
                                  setEligibilityCheckData({
                                    ...eligibilityCheckData,
                                    serviceTypeCodeID: value.id,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={` items-start self-stretch`}>
                          <label className="text-sm font-medium leading-loose text-gray-900">
                            Service date
                            <span className="text-cyan-500">*</span>
                          </label>
                          <div className=" h-[38px] w-[240px]">
                            <AppDatePicker
                              placeholderText="mm/dd/yyyy"
                              cls=""
                              onChange={(date) => {
                                if (date) {
                                  setEligibilityCheckData({
                                    ...eligibilityCheckData,
                                    dos: DateToStringPipe(date, 1),
                                  });
                                }
                              }}
                              selected={StringToDatePipe(
                                eligibilityCheckData.dos
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="pt-[77px] ">
                      <div className={`h-[86px] bg-gray-200 rounded-lg`}>
                        <div className="w-full">
                          <div className="h-px w-full bg-gray-300" />
                        </div>
                        <div className="py-[24px] pr-[27px]">
                          <div className={`gap-4 flex justify-end `}>
                            <div>
                              <Button
                                buttonType={ButtonType.secondary}
                                cls={` `}
                                onClick={() => {
                                  setEligibilityCheckData({
                                    patientInsuranceID: null,
                                    serviceTypeCodeID: null,
                                    insuranceID: null,
                                    dos: '',
                                  });
                                  setIsEligibilityCheckOpen(false);
                                }}
                              >
                                {' '}
                                Cancel
                              </Button>
                            </div>
                            <div>
                              <Button
                                buttonType={ButtonType.primary}
                                cls={` `}
                                onClick={() => {
                                  checkEligibilityForInsurance();
                                }}
                              >
                                {' '}
                                Check Eligibility
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Modal>
                </>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      headerClassName: '!bg-cyan-100 !text-center',
      flex: 1,
      minWidth: 180,
      disableReorder: true,
      cellClassName: '!bg-cyan-50',
      renderCell: (params) => {
        return (
          <div>
            <Button
              buttonType={ButtonType.secondary}
              onClick={() => {
                setIsInsuranceModalOpen(true);
                setIsViewInsuranceMode(true);
                setSelectedInsuranceGridRow(params.row);
              }}
              cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 mr-1 inline-flex gap-2 leading-5`}
            >
              <Icon name={'eye'} size={18} color={IconColors.NONE} />
            </Button>
            <Button
              buttonType={ButtonType.secondary}
              onClick={() => {
                setSelectedInsuranceGridRow(params.row);
                setIsViewInsuranceMode(false);
                setIsInsuranceModalOpen(true);
              }}
              cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 mr-1 inline-flex gap-2 leading-5`}
            >
              <Icon name={'pencil'} size={18} color={IconColors.GRAY} />
            </Button>
            <Button
              buttonType={ButtonType.secondary}
              cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
              onClick={() => {
                setInsuranceInactiveData({
                  open: true,
                  patientInsuraceID: params.row.id,
                  active: !params.row.active,
                });
                if (params.row.active) {
                  setStatusModalState({
                    ...statusModalState,
                    open: true,
                    heading: 'Deactivate Insurance Confirmation',
                    okButtonText: 'Yes, Deactivate',
                    description:
                      'Are you sure you want to Deactivate this insurance?',
                    closeButtonText: 'Cancel',
                    okButtonColor: ButtonType.tertiary,
                    statusModalType: StatusModalType.ERROR,
                    showCloseButton: true,
                    closeOnClickOutside: false,
                  });
                } else {
                  setStatusModalState({
                    ...statusModalState,
                    open: true,
                    heading: 'Activate Insurance Confirmation',
                    okButtonText: 'Yes, Activate',
                    description:
                      'Are you sure you want to activate this insurance?',
                    closeButtonText: 'Cancel',
                    okButtonColor: ButtonType.primary,
                    statusModalType: StatusModalType.WARNING,
                    showCloseButton: true,
                    closeOnClickOutside: false,
                  });
                }
              }}
            >
              <Icon name={'trash'} size={18} />
            </Button>
          </div>
        );
      },
    },
  ];

  const guarantorsCols: GridColDef[] = [
    {
      field: 'lastName',
      headerName: 'Guar. Last Name',
      flex: 1,
      maxWidth: 170,
      disableReorder: true,
      sortable: false,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-cyan-500"
            onClick={() => {
              setSelectedGaurGridRow(params.row);
              setIsViewGaurMode(false);
              setIsGuarantorsModalOpen(true);
              setIsEditMode(true);
            }}
          >
            {params.value}
          </div>
        );
      },
    },
    {
      field: 'firstName',
      headerName: 'Guar. First Name',
      flex: 1,
      maxWidth: 150,
      disableReorder: true,
      sortable: false,
    },
    {
      field: 'relation',
      headerName: 'Relation',
      flex: 1,
      maxWidth: 114,
      disableReorder: true,
      sortable: false,
      renderCell: (params) => {
        if (params.value === null) {
          return '-';
        }
        return params.value;
      },
    },
    {
      field: 'address1',
      headerName: 'Address',
      flex: 1,
      maxWidth: 224,
      disableReorder: true,
      sortable: false,
      renderCell: (params) => {
        if (params.value === null) {
          return '-';
        }
        return params.value;
      },
    },
    {
      field: 'city',
      headerName: 'City',
      flex: 1,
      maxWidth: 186,
      disableReorder: true,
      sortable: false,
    },
    {
      field: 'state',
      headerName: 'State',
      flex: 1,
      maxWidth: 92,
      disableReorder: true,
      sortable: false,
    },
    {
      field: 'zipCode',
      headerName: 'ZIP Code',
      flex: 1,
      maxWidth: 107,
      disableReorder: true,
      sortable: false,
    },
    {
      field: 'active',
      headerName: 'Active',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return <div>{params.value ? 'Yes' : 'No'}</div>;
      },
    },
    {
      field: '',
      headerName: 'Actions',
      headerClassName: '!bg-cyan-100 !text-center',
      flex: 1,
      minWidth: 180,
      disableReorder: true,
      cellClassName: '!bg-cyan-50',
      renderCell: (params) => {
        return (
          <div>
            <Button
              buttonType={ButtonType.secondary}
              onClick={() => {
                setSelectedGaurGridRow(params.row);
                setIsViewGaurMode(true);
                setIsGuarantorsModalOpen(true);
              }}
              cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 mr-1 inline-flex gap-2 leading-5`}
            >
              <Icon name={'eye'} size={18} color={IconColors.NONE} />
            </Button>
            <Button
              buttonType={ButtonType.secondary}
              onClick={() => {
                const updatedObj: PatientGuarantorTabData = {
                  ...params.row,
                  officePhone: params.row.officePhone?.replace(
                    /(\d{3})(\d{3})(\d{4})/,
                    '$1-$2-$3'
                  ),
                  homephone: params.row.homephone?.replace(
                    /(\d{3})(\d{3})(\d{4})/,
                    '$1-$2-$3'
                  ),
                  cell: params.row.cell?.replace(
                    /(\d{3})(\d{3})(\d{4})/,
                    '$1-$2-$3'
                  ),
                  fax: params.row.fax?.replace(
                    /(\d{3})(\d{3})(\d{4})/,
                    '$1-$2-$3'
                  ),
                };

                setSelectedGaurGridRow(updatedObj);
                setIsViewGaurMode(false);
                setIsEditMode(true);
                setIsGuarantorsModalOpen(true);
              }}
              cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 mr-1 inline-flex gap-2 leading-5`}
            >
              <Icon name={'pencil'} size={18} color={IconColors.GRAY} />
            </Button>
            <Button
              buttonType={ButtonType.secondary}
              cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
              onClick={() => {
                setIsDeleteGaur(true);
                setSelectedRowId(params.row?.id);
                setStatusModalState({
                  ...statusModalState,
                  open: true,
                  heading: 'Delete Confirmation',
                  okButtonText: 'Yes',
                  okButtonColor: ButtonType.tertiary,
                  description: `Are you sure you want to delete ${params.row.firstName} ${params.row.lastName}?`,
                  closeButtonText: 'No',
                  statusModalType: StatusModalType.WARNING,
                  showCloseButton: true,
                  closeOnClickOutside: false,
                });
              }}
            >
              <Icon name={'trash'} size={18} />
            </Button>
          </div>
        );
      },
    },
  ];

  const paymentHistoryCols: GridColDef[] = [
    {
      field: 'paymentLedgerID',
      headerName: 'Adv. Pay. ID',
      flex: 1,
      minWidth: 126,
      disableReorder: true,
      sortable: false,
      renderCell: (params) => {
        return <div>#{params.value}</div>;
      },
    },
    {
      field: 'appointmentID',
      headerName: 'Appointment ID',
      flex: 1,
      minWidth: 153,
      disableReorder: true,
      sortable: false,
      renderCell: (params) => {
        const formattedValue = params.value !== null ? `#${params.value}` : '-';
        return <div>{formattedValue}</div>;
      },
    },
    {
      field: 'checkDate',
      headerName: 'Check Date',
      flex: 1,
      minWidth: 132,
      disableReorder: true,
      sortable: false,
      renderCell: (params) => {
        const date = new Date(params.value);
        return <div>{DateToStringPipe(date, 2)}</div>;
      },
    },
    {
      field: 'postingDate',
      headerName: 'Post Date',
      flex: 1,
      minWidth: 113,
      disableReorder: true,
      sortable: false,
      renderCell: (params) => {
        const date = new Date(params.value);
        return <div>{DateToStringPipe(date, 2)}</div>;
      },
    },
    {
      field: 'dos',
      headerName: 'DoS',
      flex: 1,
      minWidth: 137,
      disableReorder: true,
      sortable: false,
      renderCell: (params) => {
        const formattedValue = params.value !== null ? `${params.value}` : '-';
        return <div>{formattedValue}</div>;
      },
    },
    {
      field: 'amount',
      headerName: 'Amount',
      flex: 1,
      minWidth: 101,
      disableReorder: true,
      sortable: false,
      renderCell: (params) => {
        const formattedValue = params.value
          ? currencyFormatter.format(params.value)
          : '-';
        return <div>{formattedValue}</div>;
      },
    },
    {
      field: 'ledgerName',
      headerName: 'Ledger Name',
      flex: 1,
      minWidth: 226,
      disableReorder: true,
    },
    {
      field: 'checkNumber',
      headerName: 'Check Number',
      flex: 1,
      minWidth: 144,
      disableReorder: true,
      renderCell: (params) => {
        const formattedValue = params.value !== null ? `${params.value}` : '-';
        return <div>{formattedValue}</div>;
      },
    },
    {
      field: 'paymentType',
      headerName: 'Payment Type',
      flex: 1,
      minWidth: 145,
      disableReorder: true,
      renderCell: (params) => {
        const formattedValue = params.value !== null ? `${params.value}` : '-';
        return <div>{formattedValue}</div>;
      },
    },
    {
      field: 'comments',
      headerName: 'Comments',
      flex: 1,
      minWidth: 118,
      disableReorder: true,
      renderCell: (params) => {
        const formattedValue = params.value !== null ? `${params.value}` : '-';
        return <div>{formattedValue}</div>;
      },
    },
    {
      field: 'claimID',
      headerName: 'Claim ID',
      flex: 1,
      minWidth: 104,
      disableReorder: true,
      renderCell: (params) => {
        const formattedValue = params.value !== null ? `#${params.value}` : '-';
        return (
          <div className="flex flex-col">
            <div
              data-testid="org"
              className="cursor-pointer text-cyan-500"
              onClick={() => {}}
            >
              {formattedValue}
            </div>
          </div>
        );
      },
    },
    {
      field: 'chargeID',
      headerName: 'Charge ID',
      flex: 1,
      minWidth: 114,
      disableReorder: true,
      renderCell: (params) => {
        const formattedValue = params.value !== null ? `#${params.value}` : '-';
        return (
          <div className="flex flex-col">
            <div
              data-testid="org"
              className="cursor-pointer text-cyan-500"
              onClick={() => {}}
            >
              {formattedValue}
            </div>
          </div>
        );
      },
    },
    {
      field: 'createdOn',
      headerName: 'Created On',
      flex: 1,
      minWidth: 123,
      disableReorder: true,
      renderCell: (params) => {
        const date = new Date(params.value);
        return <div>{DateToStringPipe(date, 2)}</div>;
      },
    },
    {
      field: 'createdBy',
      headerName: 'Created By',
      flex: 1,
      minWidth: 152,
      disableReorder: true,
      renderCell: (params) => {
        const formattedValue = params.value !== null ? `${params.value}` : '-';
        return (
          <div className="flex flex-col">
            <div
              data-testid="org"
              className="cursor-pointer text-cyan-500"
              onClick={() => {}}
            >
              {formattedValue}
            </div>
          </div>
        );
      },
    },
    {
      field: 'action',
      headerName: 'Actions',
      flex: 1,
      minWidth: 460,
      disableReorder: true,
      cellClassName: '!bg-cyan-50',
      headerClassName: '!bg-cyan-100 !text-center',
      renderCell: (params) => {
        return (
          <div className="flex flex-row  gap-2">
            <div>
              <Button
                disabled={params.row.dosDisable}
                buttonType={ButtonType.primary}
                cls={`w-[140px] inline-flex px-4 py-2 gap-2 leading-5 ${
                  params.row.dosDisable === true
                    ? 'bg-cyan-600 cursor-default'
                    : 'bg-cyan-500'
                }`}
                onClick={() => {
                  setIsEditDos(true);
                  setAdvPaymentID(params.row.paymentLedgerID);
                  setDosLedger(params.row.dos);
                }}
              >
                <Icon name={'pen'} size={18} />
                <p
                  data-testid="updateAdvancePaymentDos"
                  className="mt-[2px] self-center text-xs font-medium leading-4"
                >
                  Update DoS
                </p>
              </Button>
            </div>
            <div>
              <Button
                buttonType={ButtonType.secondary}
                disabled={params.row.reverseDisable}
                cls={'w-[160px] inline-flex px-4 py-2 gap-2 leading-5 '}
                onClick={() => {
                  setIsRevered(true);
                  setAdvPaymentID(params.row.paymentLedgerID);
                  setStatusModalState({
                    ...statusModalState,
                    open: true,
                    heading: 'Reverse Advanced Payment',
                    description: 'Are you sure to reverse this payment?',
                    okButtonText: 'Yes',
                    closeButtonText: 'No',
                    statusModalType: StatusModalType.WARNING,
                    showCloseButton: true,
                    closeOnClickOutside: false,
                  });
                }}
              >
                <Icon name={'reverse'} size={18} />
                <p className="mt-[2px] self-center text-xs font-medium leading-4">
                  Reverse Payment
                </p>
              </Button>
            </div>
            <div>
              <Button
                disabled={params.row.refundDisable}
                buttonType={ButtonType.primary}
                cls={`w-[100px] inline-flex px-4 py-2 gap-2 leading-5 ${
                  params.row.dosDisable === true
                    ? 'bg-cyan-600 cursor-default'
                    : 'bg-cyan-500'
                }`}
                onClick={() => {
                  setShowRefundPaymentModal(true);
                  setRefundRemainingBalance(params.row.remainingBalance);
                  setRefundPaymentData({
                    ...refundPaymentData,
                    advancePaymentID: params.row.paymentLedgerID,
                    postingDate: new Date(),
                    amount: undefined,
                  });
                }}
              >
                <Icon name={'payment'} size={18} />
                <p
                  data-testid="updateAdvancePaymentDos"
                  className="mt-[2px] self-center text-xs font-medium leading-4"
                >
                  Refund
                </p>
              </Button>
            </div>
          </div>
        );
      },
    },
  ];

  const finicialCols: GridColDef[] = [
    {
      field: 'responsibility',
      headerName: 'Responsibility',
      flex: 1,
      maxWidth: 175,
      disableReorder: true,
      sortable: false,
    },
    {
      field: 'current',
      headerName: 'Current',
      flex: 1,
      maxWidth: 175,
      disableReorder: true,
      sortable: false,
      renderCell: (params) => {
        const formattedValue =
          params.value || params.value === 0
            ? currencyFormatter.format(params.value)
            : '';
        return (
          <div className="flex flex-col">
            <div
              data-testid="org"
              className="cursor-pointer text-cyan-500"
              onClick={() => {
                setIsTimeFrameHistory(true);
                onTimeframeHistory(params.row.responsibility, 'current');
              }}
            >
              {formattedValue}
            </div>
          </div>
        );
      },
    },
    {
      field: 'plus30',
      headerName: '30 - 60 Days',
      flex: 1,
      maxWidth: 168,
      disableReorder: true,
      sortable: false,
      renderCell: (params) => {
        const formattedValue =
          params.value || params.value === 0
            ? currencyFormatter.format(params.value)
            : '';
        return (
          <div className="flex flex-col">
            <div
              data-testid="org"
              className="cursor-pointer text-cyan-500"
              onClick={() => {
                setIsTimeFrameHistory(true);
                onTimeframeHistory(params.row.responsibility, '30 Plus');
              }}
            >
              {formattedValue}
            </div>
          </div>
        );
      },
    },
    {
      field: 'plus60',
      headerName: '60 - 90 Days',
      flex: 1,
      maxWidth: 168,
      disableReorder: true,
      sortable: false,
      renderCell: (params) => {
        const formattedValue =
          params.value || params.value === 0
            ? currencyFormatter.format(params.value)
            : '';
        return (
          <div className="flex flex-col">
            <div
              data-testid="org"
              className="cursor-pointer text-cyan-500"
              onClick={() => {
                setIsTimeFrameHistory(true);
                onTimeframeHistory(params.row.responsibility, '60 Plus');
              }}
            >
              {formattedValue}
            </div>
          </div>
        );
      },
    },
    {
      field: 'plus90',
      headerName: '90 - 120 Days',
      flex: 1,
      maxWidth: 168,
      disableReorder: true,
      sortable: false,
      renderCell: (params) => {
        const formattedValue =
          params.value || params.value === 0
            ? currencyFormatter.format(params.value)
            : '';
        return (
          <div className="flex flex-col">
            <div
              data-testid="org"
              className="cursor-pointer text-cyan-500"
              onClick={() => {
                setIsTimeFrameHistory(true);
                onTimeframeHistory(params.row.responsibility, '90 Plus');
              }}
            >
              {formattedValue}
            </div>
          </div>
        );
      },
    },
    {
      field: 'plus120',
      headerName: '120 - 180 Days',
      flex: 1,
      maxWidth: 168,
      disableReorder: true,
      sortable: false,
      renderCell: (params) => {
        const formattedValue =
          params.value || params.value === 0
            ? currencyFormatter.format(params.value)
            : '';
        return (
          <div className="flex flex-col">
            <div
              data-testid="org"
              className="cursor-pointer text-cyan-500"
              onClick={() => {
                setIsTimeFrameHistory(true);
                onTimeframeHistory(params.row.responsibility, '120 Plus');
              }}
            >
              {formattedValue}
            </div>
          </div>
        );
      },
    },
    {
      field: 'plus180',
      headerName: '180+ Days',
      flex: 1,
      maxWidth: 168,
      disableReorder: true,
      sortable: false,
      renderCell: (params) => {
        const formattedValue =
          params.value || params.value === 0
            ? currencyFormatter.format(params.value)
            : '';
        return (
          <div className="flex flex-col">
            <div
              data-testid="org"
              className="cursor-pointer text-cyan-500"
              onClick={() => {
                setIsTimeFrameHistory(true);
                onTimeframeHistory(params.row.responsibility, '180 Plus');
              }}
            >
              {formattedValue}
            </div>
          </div>
        );
      },
    },
    {
      field: 'balance',
      headerName: 'Balance',
      flex: 1,
      minWidth: 168,
      disableReorder: true,
      renderCell: (params) => {
        const formattedValue =
          params.value || params.value === 0
            ? currencyFormatter.format(params.value)
            : '';
        return <div>{formattedValue}</div>;
      },
    },
  ];

  const timeframeHistoryCols: GridColDef[] = [
    {
      field: 'claimID',
      headerName: 'Claim ID',
      flex: 1,
      minWidth: 104,
      disableReorder: true,
      sortable: false,
      renderCell: (params) => {
        const formattedValue = `#${params.value}`;
        return (
          <div className="flex flex-col">
            <div
              data-testid="org"
              className="cursor-pointer text-cyan-500"
              onClick={() => {}}
            >
              {formattedValue}
            </div>
          </div>
        );
      },
    },
    {
      field: 'patientID',
      headerName: 'Patient ID',
      flex: 1,
      minWidth: 114,
      disableReorder: true,
      sortable: false,
      renderCell: (params) => {
        const formattedValue = `#${params.value}`;
        return <div>{formattedValue}</div>;
      },
    },
    {
      field: 'patient',
      headerName: 'Patient Name',
      flex: 1,
      minWidth: 185,
      disableReorder: true,
      sortable: false,
    },
    {
      field: 'dos',
      headerName: 'DoS',
      flex: 1,
      minWidth: 135,
      renderCell: (params) => {
        return (
          <div>
            <> {`${params.value} - ${params.row.toDOS}`} </>
          </div>
        );
      },
    },
    {
      field: 'agingType',
      headerName: 'Aging Type',
      flex: 1,
      minWidth: 142,
      disableReorder: true,
      sortable: false,
    },
    {
      field: 'agingDays',
      headerName: 'Aging',
      flex: 1,
      minWidth: 120,
      disableReorder: true,
      sortable: false,
      renderCell: (params) => {
        const formattedValue = `${params.value} Days`;
        return <div>{formattedValue}</div>;
      },
    },
    {
      field: 'insurance',
      headerName: 'Insurance',
      flex: 1,
      minWidth: 131,
      disableReorder: true,
    },
    {
      field: 'group',
      headerName: 'Group',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
      renderCell: (params) => {
        const formattedValue = `EIN:${params.row.groupEIN}`;
        return (
          <div className="flex flex-col">
            <div className="text-cyan-500 underline">{params.value}</div>
            <div>{formattedValue}</div>
          </div>
        );
      },
    },
    {
      field: 'practice',
      headerName: 'Practice',
      flex: 1,
      minWidth: 240,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="text-cyan-500 underline">{params.value}</div>
            <div>{params.row.practiceAddress}</div>
          </div>
        );
      },
    },
    {
      field: 'facility',
      headerName: 'Facility',
      flex: 1,
      minWidth: 235,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="text-cyan-500 underline">{params.value}</div>
            <div>{params.row.facilityAddress}</div>
          </div>
        );
      },
    },
    {
      field: 'provider',
      headerName: 'Provider',
      flex: 1,
      minWidth: 205,
      disableReorder: true,
      renderCell: (params) => {
        const formattedValue = `NPI:${params.row.providerNPI}`;
        return (
          <div className="flex flex-col">
            <div className="text-cyan-500 underline">{params.value}</div>
            <div>{formattedValue}</div>
          </div>
        );
      },
    },
    {
      field: 'claimStatus',
      headerName: 'Claim Status',
      flex: 1,
      minWidth: 195,
      disableReorder: true,
      renderCell: (params) => {
        if (params.row.claimStatusID === 5) {
          return (
            <Badge
              text={params.value}
              cls={'bg-green-50 text-green-800 rounded-[4px] whitespace-normal'}
              icon={<Icon name={'desktop'} color={IconColors.GREEN} />}
            />
          );
        }
        if (params.row.claimStatusID === 6) {
          return (
            <Badge
              text={params.value}
              cls={
                'bg-yellow-50 text-yellow-800 rounded-[4px] whitespace-normal'
              }
              icon={<Icon name={'user'} color={IconColors.Yellow} />}
            />
          );
        }
        return (
          <Badge
            text={params.value}
            cls={'bg-gray-50 text-gray-800 rounded-[4px] whitespace-normal'}
            icon={<Icon name={'desktop'} color={IconColors.GRAY} />}
          />
        );
      },
    },
    {
      field: 'pos',
      headerName: 'PoS',
      flex: 1,
      minWidth: 144,
      disableReorder: true,
    },
    {
      field: 'insuranceAmount',
      headerName: 'Insurance Resp.',
      flex: 1,
      minWidth: 170,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div>
              {params.value ? currencyFormatter.format(params.value) : ''}
            </div>
            {params.row.insuranceBalance < 0 && (
              <div className="whitespace-nowrap text-xs text-yellow-500">
                {`Bal.: ${
                  params.row.insuranceBalance
                    ? currencyFormatter.format(params.row.insuranceBalance)
                    : ''
                }`}
              </div>
            )}
            {params.row.insuranceBalance > 0 && (
              <div className="whitespace-nowrap text-xs text-red-500">
                {`Bal.: ${
                  params.row.insuranceBalance
                    ? currencyFormatter.format(params.row.insuranceBalance)
                    : ''
                }`}
              </div>
            )}
            {(params.row.insuranceBalance === 0 ||
              !params.row.insuranceBalance) && (
              <div className="whitespace-nowrap text-xs text-green-500">
                {`Bal.: ${currencyFormatter.format(0)}`}
              </div>
            )}
          </div>
        );
      },
    },
    {
      field: 'patientAmount',
      headerName: 'Patient Resp.',
      flex: 1,
      minWidth: 154,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div>
              {params.value ? currencyFormatter.format(params.value) : ''}
            </div>
            {params.row.patientBalance > 0 && (
              <div className="whitespace-nowrap text-xs text-red-500">
                {`Bal.: ${
                  params.row.patientBalance
                    ? currencyFormatter.format(params.row.patientBalance)
                    : ''
                }`}
              </div>
            )}
            {params.row.patientBalance < 0 && (
              <div className="whitespace-nowrap text-xs text-yellow-500">
                {`Bal.: ${
                  params.row.patientBalance
                    ? currencyFormatter.format(params.row.patientBalance)
                    : ''
                }`}
              </div>
            )}
            {(params.row.patientBalance === 0 ||
              !params.row.patientBalance) && (
              <div className="whitespace-nowrap text-xs text-green-500">
                {`Bal.: ${currencyFormatter.format(0)}`}
              </div>
            )}
          </div>
        );
      },
    },
    {
      field: 'totalBalance',
      headerName: 'T. Balance',
      flex: 1,
      minWidth: 135,
      disableReorder: true,
      renderCell: (params) => {
        if (params.value > 0) {
          return (
            <div className="text-red-500">
              {params.value ? currencyFormatter.format(params.value) : ''}
            </div>
          );
        }
        if (params.value === 0) {
          return (
            <div className="text-green-500">
              {params.value ? currencyFormatter.format(params.value) : ''}
            </div>
          );
        }

        return (
          <div className="text-yellow-500">
            {params.value ? currencyFormatter.format(params.value * -1) : ''}
          </div>
        );
      },
    },
  ];
  const [linkableClaimsModalData, setLinkableClaimsModal] = useState<{
    open: boolean;
    criteria: GetLinkableClaimsForMedicalCaseCriteria;
  }>({
    open: false,
    criteria: {
      patientID: undefined,
      facilityID: undefined,
      patientInsuranceID: undefined,
      medicalCaseID: undefined,
    },
  });
  const onDeleteMedicalCaseColumn = async (medicalCaseID: number) => {
    const res = await deleteMedicalCase(medicalCaseID);
    if (res) {
      getPatientMedicalCaseData();
    }
  };
  const [deleteMedicalCaseData, setDeleteMedicalCaseData] = useState<{
    isDelete: boolean;
    medicalCaseID?: number;
  }>({
    isDelete: true,
  });
  const MedicalCaseColumns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'Case ID',
      flex: 1,
      minWidth: 170,
      disableReorder: true,
    },
    {
      field: 'title',
      headerName: 'Title',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-cyan-500"
            onClick={() => {
              setSelectedMedicalCaseID(params.row.id);
              setIsViewMedicalCaseMode(true);
              setMedicalCaseModalOpen(true);
            }}
          >
            {params.value}
          </div>
        );
      },
    },
    {
      field: 'facility',
      headerName: 'Facility',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'insurance',
      headerName: 'Insurance',
      flex: 1,
      minWidth: 180,
      disableReorder: true,
    },
    {
      field: 'attendingProvider',
      headerName: 'Attending Provider',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'operatingProvider',
      headerName: 'Operating Provider',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'admissionDate',
      headerName: 'Admission Date',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'dischargeDate',
      headerName: 'Discharge Date',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'dischargeStatus',
      headerName: 'Discharge Status',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'caseStatus',
      headerName: 'Case Status',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'createdOn',
      headerName: 'Created On',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'createdBy',
      headerName: 'Created By',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 255,
      hideSortIcons: true,
      disableReorder: true,
      cellClassName: '!bg-cyan-50 PinnedColumLeftBorder',
      headerClassName: '!bg-cyan-100 !text-center PinnedColumLeftBorder',
      renderCell: (params) => {
        return (
          <div className="flex gap-2">
            <Button
              buttonType={ButtonType.secondary}
              // fullWidth={true}
              cls={' h-[30px] inline-flex px-2 py-2  !justify-center'}
              style={{ verticalAlign: 'middle' }}
              onClick={() => {
                setSelectedMedicalCaseID(params.row.id);
                setIsViewMedicalCaseMode(true);
                setMedicalCaseModalOpen(true);
              }}
            >
              <Icon name={'pencil'} size={16} />
            </Button>
            {/* <div className="ml-2 flex gap-x-2"> */}
            <Button
              // fullWidth={true}
              buttonType={ButtonType.secondary}
              style={{ verticalAlign: 'middle' }}
              cls={`h-[30px] inline-flex px-2 py-2 !justify-center`}
              onClick={() => {
                setDeleteMedicalCaseData({
                  isDelete: true,
                  medicalCaseID: params.row.id,
                });
                setStatusModalState({
                  ...statusModalState,
                  open: true,
                  heading: 'Delete Medical Confirmation',
                  okButtonText: 'Yes, Delete Case',
                  okButtonColor: ButtonType.tertiary,
                  description:
                    'Deleting a Medical Case will permanently remove it from the system. Are you sure you want to proceed with this action?',
                  closeButtonText: 'Cancle',
                  statusModalType: StatusModalType.WARNING,
                  showCloseButton: true,
                  closeOnClickOutside: false,
                });
              }}
            >
              <Icon name={'trash'} size={18} />
            </Button>
            {/* </div> */}
            <Button
              buttonType={
                params.row.caseStatus === 'Open'
                  ? ButtonType.primary
                  : ButtonType.secondary
              }
              cls={
                params.row.caseStatus === 'Open'
                  ? `!h-[30px] inline-flex px-4 py-2 gap-2 leading-5 bg-cyan-500`
                  : `!h-[30px] inline-flex px-4 py-2 gap-2 leading-5 bg-gray-100`
              }
              onClick={() => {
                const criteria: GetLinkableClaimsForMedicalCaseCriteria = {
                  patientID: selectedPatientID || undefined,
                  facilityID: params.row.facilityID,
                  patientInsuranceID: params.row.patientInsuranceID,
                  medicalCaseID: params.row.id,
                };
                // const res = await getLinkableClaimsForMedicalCase(criteria);
                setLinkableClaimsModal({
                  open: true,
                  criteria,
                });
              }}
            >
              <Icon name={'link'} size={18} />
              <p className="mt-[2px] self-center text-xs font-medium leading-4">
                Link Claim
              </p>
            </Button>
          </div>
        );
      },
    },
  ];
  //   {
  //     id: 1,
  //     title: 'Therapeutic Integration Case',
  //     locationName: 'test location',
  //     insuranceName: 'test insurance',
  //     attendingProvider: 'test provider',
  //     operatingProvider: 'test provider',
  //     admissionDate: '4/2/2024',
  //     dischargeDate: '4/2/2024',
  //     dischargeStatus: '',
  //     caseStatus: 'Open',
  //     createdOn: '4/2/2024',
  //     createdBy: 'Awais Q',
  //     active: true,
  //   },
  //   {
  //     id: 2,
  //     title: 'Therapeutic Integration Case',
  //     locationName: 'test location',
  //     insuranceName: 'test insurance',
  //     attendingProvider: 'test provider',
  //     operatingProvider: 'test provider',
  //     admissionDate: '4/2/2024',
  //     dischargeDate: '4/2/2024',
  //     dischargeStatus: '',
  //     caseStatus: 'Closed',
  //     createdOn: '4/2/2024',
  //     createdBy: 'Awais Q',
  //     active: false,
  //   },
  //   {
  //     id: 3,
  //     title: 'Therapeutic Integration Case',
  //     locationName: 'test location',
  //     insuranceName: 'test insurance',
  //     attendingProvider: 'test provider',
  //     operatingProvider: 'test provider',
  //     admissionDate: '4/2/2024',
  //     dischargeDate: '4/2/2024',
  //     dischargeStatus: '',
  //     caseStatus: 'Closed',
  //     createdOn: '4/2/2024',
  //     createdBy: 'Awais Q',
  //     active: false,
  //   },
  //   {
  //     id: 4,
  //     title: 'Therapeutic Integration Case',
  //     locationName: 'test location',
  //     insuranceName: 'test insurance',
  //     attendingProvider: 'test provider',
  //     operatingProvider: 'test provider',
  //     admissionDate: '4/2/2024',
  //     dischargeDate: '4/2/2024',
  //     dischargeStatus: '',
  //     caseStatus: 'Closed',
  //     createdOn: '4/2/2024',
  //     createdBy: 'Awais Q',
  //     active: false,
  //   },
  //   {
  //     id: 5,
  //     title: 'Therapeutic Integration Case',
  //     locationName: 'test location',
  //     insuranceName: 'test insurance',
  //     attendingProvider: 'test provider',
  //     operatingProvider: 'test provider',
  //     admissionDate: '4/2/2024',
  //     dischargeDate: '4/2/2024',
  //     dischargeStatus: '',
  //     caseStatus: 'Closed',
  //     createdOn: '4/2/2024',
  //     createdBy: 'Awais Q',
  //     active: false,
  //   },
  // ];

  const [selectedMedicalCaseTab, setSelectedMedicalCaseTab] = useState(
    medicalCaseTabs[0]
  );
  const [selectRows, setSelectRows] = useState<number[]>([]);
  const onSelectAll = async () => {
    if (searchResult.length === 0) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'No data to select!',
          toastType: ToastType.ERROR,
        })
      );
      return;
    }

    if (selectRows.length === totalCount) {
      setSelectRows([]);
      return;
    }
    if (lastSearchDataCriteria) {
      const res = await fetchAllClaimsSearchDataClaimIDS(
        lastSearchDataCriteria
      );
      if (res) {
        setSelectRows(res);
      }
    }
  };

  const [detailPanelExpandedRowIds, setDetailPanelExpandedRowIds] = useState<
    GridRowId[]
  >([]);
  const [expandedRowData, setExpandedRowData] = useState<
    {
      id: GridRowId;
      data: AllClaimsExpandRowResult[];
    }[]
  >([]);
  const getExpandableRowData = async (claimId: GridRowId | undefined) => {
    if (claimId) {
      const res = await getAllClaimsExpandRowDataById(claimId);
      if (res) {
        setExpandedRowData((prevData) => [
          ...prevData,
          { id: claimId, data: res },
        ]);
      }
    }
  };
  const handleDetailPanelExpandedRowIdsChange = useCallback(
    (newIds: GridRowId[]) => {
      const selectedId = newIds.filter(
        (id) => !detailPanelExpandedRowIds.includes(id)
      )[0];
      getExpandableRowData(selectedId);
      setDetailPanelExpandedRowIds(newIds);
    },
    [detailPanelExpandedRowIds]
  );

  const [selectedInsuranceID, setSelectedInsuranceID] = useState<number>();
  const getScrubingResponce = async (id: number) => {
    const res = await getScrubingAPIResponce(id);
    if (res) {
      const w = window.open('about:blank', '_blank');
      if (w) {
        w.document.write(res);
        w.document.close();
      }
    }
  };
  const claimsColumns: GridColDef[] = [
    {
      ...GRID_DETAIL_PANEL_TOGGLE_COL_DEF,
      renderCell: (params) => (
        <CustomDetailPanelToggle id={params.id} value={params.value} />
      ),
      minWidth: 80,
    },
    {
      ...GRID_CHECKBOX_SELECTION_COL_DEF,
      flex: 1,
      minWidth: 80,
      renderHeader: () => {
        return (
          <CheckBox
            id="AllCheckbox"
            checked={!!searchResult.length && selectRows.length === totalCount}
            onChange={onSelectAll}
            disabled={false}
          />
        );
      },
    },
    {
      field: 'claimID',
      headerName: 'Claim ID',
      flex: 1,
      minWidth: 110,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-cyan-500"
            onClick={async () => {
              setRoutePath(`/app/claim-detail/${params.value}`);
            }}
          >
            {`#${params.value}`}
          </div>
        );
      },
    },
    {
      field: 'dos',
      headerName: 'DoS',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div>
            {params.row.toDOS !== null ? (
              <> {`${params.row.fromDOS} - ${params.row.toDOS}`} </>
            ) : (
              <>{params.row.fromDOS}</>
            )}
          </div>
        );
      },
    },
    {
      field: 'patient',
      headerName: 'Patient',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-cyan-500"
            onClick={() => {
              setRoutePath(`/app/register-patient/${params.row.patientID}`);
            }}
          >
            {params.value}
          </div>
        );
      },
    },
    {
      field: 'insurance',
      headerName: 'Insurance',
      minWidth: 120,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-cyan-500"
            onClick={() => {
              setIsInsuranceModalOpen(true);
              setSelectedInsuranceID(params.row.insuranceID);
              if (selectedInsuranceID) {
                setSelectedInsuranceID(params.row.insuranceID); // remove it afterwards
              }
            }}
          >
            {params.value}
          </div>
        );
      },
    },
    {
      field: 'aging',
      flex: 1,
      minWidth: 150,
      headerName: 'Aging',
      disableReorder: true,
    },
    {
      field: 'followupDays',
      flex: 1,
      minWidth: 150,
      headerName: 'Follow-up in',
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div>{params.value} Days</div>
            <div className="text-xs text-gray-400">
              {params.row.followupDate}
            </div>
          </div>
        );
      },
    },
    {
      field: 'timelyFiling',
      type: 'boolean',
      headerName: 'T. Filling',
      flex: 1,
      minWidth: 110,
      disableReorder: true,
      renderCell: (params) => {
        return params.value ? (
          <CheckIcon
            style={{
              color: '#10B981',
            }}
          />
        ) : (
          <CloseIcon
            style={{
              color: '#EF4444',
            }}
          />
        );
      },
    },
    {
      field: 'scrubStatus',
      headerName: 'Scrub Status',
      flex: 1,
      minWidth: 200,
      disableReorder: true,
      renderCell: (params) => {
        const { scrubStatusID } = params.row;
        const isDisabled = [6, 7].includes(scrubStatusID);

        const statusMapping: any = {
          2: { color: 'red', icon: 'desktop', IconColor: IconColors.RED },
          3: { color: 'red', icon: 'desktop', IconColor: IconColors.RED },
          4: { color: 'yellow', icon: 'user', IconColor: IconColors.Yellow },
          5: { color: 'green', icon: 'desktop', IconColor: IconColors.GREEN },
          6: { color: 'yellow', icon: 'user', IconColor: IconColors.Yellow },
        };

        const defaultMapping = {
          color: 'gray',
          icon: 'desktop',
          IconColor: IconColors.GRAY,
        };
        const { color, icon, IconColor } =
          statusMapping[scrubStatusID] || defaultMapping;

        return (
          <Badge
            text={params.value}
            cls={classNames(
              `rounded-[4px] bg-${color}-50 text-${color}-800`,
              isDisabled ? '' : 'cursor-pointer'
            )}
            icon={<Icon name={icon} color={IconColor} />}
            onClick={() => {
              if (params.row.claimID && !isDisabled)
                getScrubingResponce(params.row.claimID);
            }}
          />
        );
      },
    },
    {
      field: 'claimStatus',
      headerName: 'Claim Status',
      flex: 1,
      minWidth: 250,
      disableReorder: true,
      renderCell: (params) => {
        if (params.row.claimStatusID === 5) {
          return (
            <Badge
              text={params.value}
              cls={'bg-green-50 text-green-800 rounded-[4px] whitespace-normal'}
              icon={<Icon name={'desktop'} color={IconColors.GREEN} />}
            />
          );
        }
        if (params.row.claimStatusID === 6) {
          return (
            <Badge
              text={params.value}
              cls={
                'bg-yellow-50 text-yellow-800 rounded-[4px] whitespace-normal'
              }
              icon={<Icon name={'user'} color={IconColors.Yellow} />}
            />
          );
        }

        return (
          <Badge
            text={params.value}
            cls={'bg-gray-50 text-gray-800 rounded-[4px] whitespace-normal'}
            icon={<Icon name={'desktop'} color={IconColors.GRAY} />}
          />
        );
      },
    },
    {
      field: 'fee',
      headerName: 'Fee',
      ...usdPrice,
      flex: 1,
      type: 'number',
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'allowable',
      headerName: 'Allowable',
      // ...usdPrice,
      flex: 1,
      minWidth: 125,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div>{currencyFormatter.format(params.value)}</div>
            {params.row.adjustments > 0 && (
              <div className="whitespace-nowrap text-xs text-red-500">
                {`Adj.: ${currencyFormatter.format(params.row.adjustments)}`}
              </div>
            )}
            {params.row.adjustments < 0 && (
              <div className="whitespace-nowrap text-xs text-yellow-500">
                {`Adj.: ${currencyFormatter.format(params.row.adjustments)}`}
              </div>
            )}
            {(params.row.adjustments === 0 || !params.row.adjustments) && (
              <div className="whitespace-nowrap text-xs text-green-500">
                {`Adj.: ${currencyFormatter.format(0)}`}
              </div>
            )}
          </div>
        );
      },
    },
    {
      field: 'insuranceAmount',
      headerName: 'Insurance Resp.',
      ...usdPrice,
      flex: 1,
      minWidth: 160,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div>{currencyFormatter.format(params.value)}</div>
            {params.row.insuranceBalance < 0 && (
              <div className="whitespace-nowrap text-xs text-yellow-500">
                {`Bal.: ${currencyFormatter.format(
                  params.row.insuranceBalance
                )}`}
              </div>
            )}
            {params.row.insuranceBalance > 0 && (
              <div className="whitespace-nowrap text-xs text-red-500">
                {`Bal.: ${currencyFormatter.format(
                  params.row.insuranceBalance
                )}`}
              </div>
            )}
            {(params.row.insuranceBalance === 0 ||
              !params.row.insuranceBalance) && (
              <div className="whitespace-nowrap text-xs text-green-500">
                {`Bal.: ${currencyFormatter.format(0)}`}
              </div>
            )}
          </div>
        );
      },
    },
    {
      field: 'patientAmount',
      headerName: 'Patient Resp.',
      ...usdPrice,
      flex: 1,
      minWidth: 160,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div>{currencyFormatter.format(params.value)}</div>
            {params.row.patientBalance > 0 && (
              <div className="whitespace-nowrap text-xs text-red-500">
                {`Bal.: ${currencyFormatter.format(params.row.patientBalance)}`}
              </div>
            )}
            {params.row.patientBalance < 0 && (
              <div className="whitespace-nowrap text-xs text-yellow-500">
                {`Bal.: ${currencyFormatter.format(params.row.patientBalance)}`}
              </div>
            )}
            {(params.row.patientBalance === 0 ||
              !params.row.patientBalance) && (
              <div className="whitespace-nowrap text-xs text-green-500">
                {`Bal.: ${currencyFormatter.format(0)}`}
              </div>
            )}
          </div>
        );
      },
    },
    {
      field: 'totalBalance',
      headerName: 'T. Balance',
      ...usdPrice,
      flex: 1,
      minWidth: 130,
      disableReorder: true,
      renderCell: (params) => {
        if (params.value > 0) {
          return (
            <div className="text-red-500">
              {currencyFormatter.format(params.value)}
            </div>
          );
        }
        if (params.value === 0) {
          return (
            <div className="text-green-500">
              {currencyFormatter.format(params.value)}
            </div>
          );
        }

        return (
          <div className="text-yellow-500">
            {currencyFormatter.format(params.value * -1)}
          </div>
        );
      },
    },
    {
      field: 'group',
      headerName: 'Group',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="cursor-pointer text-cyan-500" onClick={() => {}}>
              {params.value}
            </div>
            <div className="text-xs font-normal leading-4">
              {params.row.groupEIN ? `EIN: ${params.row.groupEIN}` : ''}
            </div>
          </div>
        );
      },
    },
    {
      field: 'practice',
      headerName: 'Practice',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="cursor-pointer text-cyan-500" onClick={() => {}}>
              {params.value}
            </div>
            <div className="text-xs font-normal leading-4">
              {params.row.practiceAddress}
            </div>
          </div>
        );
      },
    },
    {
      field: 'facility',
      headerName: 'Facility',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="cursor-pointer text-cyan-500" onClick={() => {}}>
              {params.value}
            </div>
            <div className="text-xs font-normal leading-4">
              {params.row.facilityAddress}
            </div>
          </div>
        );
      },
    },
    {
      field: 'pos',
      headerName: 'PoS',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'provider',
      headerName: 'Provider',
      flex: 1,
      minWidth: 180,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="cursor-pointer text-cyan-500" onClick={() => {}}>
              {params.value}
            </div>
            <div className="text-xs font-normal leading-4">{`NPI: ${params.row.providerNPI}`}</div>
          </div>
        );
      },
    },
    {
      field: 'assignee',
      headerName: 'Assignee',
      flex: 1,
      minWidth: 180,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="cursor-pointer text-cyan-500" onClick={() => {}}>
              {params.value}
            </div>
            <div className="text-xs font-normal leading-4">
              {params.row.assigneeRole}
            </div>
          </div>
        );
      },
    },
  ];

  const closeExpandedRowContent = (id: GridRowId) => {
    setDetailPanelExpandedRowIds(
      detailPanelExpandedRowIds.filter((f) => f !== id)
    );
  };

  const expandedRowContent = (expandedRowParams: GridRowParams) => {
    return (
      <SearchGridExpandabkeRowModal
        badge={
          <Badge
            text={'Partially Paid'}
            cls={'bg-green-50 text-green-800 rounded-[4px] pt-1'}
            icon={<Icon name={'desktop'} color={IconColors.GREEN} />}
          />
        }
        expandRowData={
          expandedRowData
            .filter((f) => f.id === expandedRowParams.id)
            [
              expandedRowData.filter((f) => f.id === expandedRowParams.id)
                .length - 1
            ]?.data?.map((row) => {
              return { ...row, id: row.chargeID };
            }) || []
        }
        claimID={expandedRowParams.id}
        onClose={() => {
          closeExpandedRowContent(expandedRowParams.id);
        }}
        expandedColumns={[
          {
            field: 'chargeID',
            headerName: 'Charge ID',
            flex: 1,
            minWidth: 110,
            sortable: false,
            renderCell: (params) => {
              return <div>{`#${params.value}`}</div>;
            },
          },
          {
            field: 'chargeStatus',
            headerName: 'Charge Status',
            flex: 1,
            minWidth: 110,
            sortable: false,
            renderCell: (params) => {
              if (params.value === 'Denied') {
                return (
                  <Badge
                    text={params.value}
                    cls={
                      'bg-red-50 text-red-800 rounded-[4px] whitespace-normal'
                    }
                  />
                );
              }
              if (params.value === 'Paid ERA') {
                return (
                  <Badge
                    text={params.value}
                    cls={
                      'bg-green-50 text-green-800 rounded-[4px] whitespace-normal'
                    }
                  />
                );
              }

              return (
                <Badge
                  text={params.value}
                  cls={
                    'bg-gray-50 text-gray-800 rounded-[4px] whitespace-normal'
                  }
                />
              );
            },
          },
          {
            field: 'cpt',
            headerName: 'CPT Code',
            flex: 1,
            minWidth: 110,
            sortable: false,
          },
          {
            field: 'units',
            headerName: 'Units',
            flex: 1,
            minWidth: 110,
            sortable: false,
          },
          {
            field: 'mod',
            headerName: 'Mod.',
            flex: 1,
            minWidth: 110,
            sortable: false,
          },
          {
            field: 'icds',
            headerName: 'DX',
            flex: 1,
            minWidth: 110,
            sortable: false,
          },
          {
            field: 'fee',
            headerName: 'Fee',
            ...usdPrice,
            flex: 1,
            minWidth: 110,
            sortable: false,
          },
          {
            field: 'allowable',
            headerName: 'Allowable',
            ...usdPrice,
            flex: 1,
            minWidth: 110,
            sortable: false,
          },
          {
            field: 'insuranceResponsibility',
            ...usdPrice,
            headerName: 'Ins. Resp.',
            flex: 1,
            minWidth: 110,
            sortable: false,
            renderCell: (params) => {
              return (
                <div className="flex flex-col">
                  {params.row.insuranceAmount >= 0 ? (
                    <div>
                      {currencyFormatter.format(params.row.insuranceAmount)}
                    </div>
                  ) : (
                    <div className="text-red-500 ">
                      {currencyFormatter.format(
                        params.row.insuranceAmount * -1
                      )}
                    </div>
                  )}
                  {params.row.insuranceBalance < 0 && (
                    <div className="whitespace-nowrap text-xs text-red-500">
                      {`Bal.: ${currencyFormatter.format(
                        params.row.insuranceBalance
                      )}`}
                    </div>
                  )}
                  {params.row.insuranceBalance > 0 && (
                    <div className="whitespace-nowrap text-xs text-green-500">
                      {`Bal.: ${currencyFormatter.format(
                        params.row.insuranceBalance
                      )}`}
                    </div>
                  )}
                  {(params.row.insuranceBalance === 0 ||
                    !params.row.insuranceBalance) && (
                    <div className="whitespace-nowrap text-xs">
                      {`Bal.: ${currencyFormatter.format(0)}`}
                    </div>
                  )}
                </div>
              );
            },
          },
          {
            field: 'patientResponsibility',
            headerName: 'Pat. Resp.',
            ...usdPrice,
            flex: 1,
            minWidth: 110,
            sortable: false,
            renderCell: (params) => {
              return (
                <div className="flex flex-col">
                  {params.row.patientAmount >= 0 ? (
                    <div>
                      {currencyFormatter.format(params.row.patientAmount)}
                    </div>
                  ) : (
                    <div className="text-red-500 ">
                      {currencyFormatter.format(params.row.patientAmount * -1)}
                    </div>
                  )}
                  {params.row.patientBalance < 0 && (
                    <div className="whitespace-nowrap text-xs text-red-500">
                      {`Bal.: ${currencyFormatter.format(
                        params.row.patientBalance
                      )}`}
                    </div>
                  )}
                  {params.row.patientBalance > 0 && (
                    <div className="whitespace-nowrap text-xs text-green-500">
                      {`Bal.: ${currencyFormatter.format(
                        params.row.patientBalance
                      )}`}
                    </div>
                  )}
                  {(params.row.patientBalance === 0 ||
                    !params.row.patientBalance) && (
                    <div className="whitespace-nowrap text-xs">
                      {`Bal.: ${currencyFormatter.format(0)}`}
                    </div>
                  )}
                </div>
              );
            },
          },
        ]}
      />
    );
  };

  useEffect(() => {
    if (selectedWorkGroupData && selectedWorkGroupData.groupsData) {
      setGroupData(selectedWorkGroupData.groupsData);
    } else {
      setGroupData(GroupAPIData as SingleSelectDropDownDataType[]);
    }
  }, [selectedWorkGroupData, GroupAPIData]);
  const patientLookupData = async () => {
    const res = await getPatientLookup();
    if (res) {
      setPatientlookupData(res);
    }
  };

  useEffect(() => {
    fetchInsuranceData();
    patientLookupData();
  }, [selectedInsurance]);
  useEffect(() => {
    if (routePath) {
      router.push(routePath);
    }
  }, [routePath]);

  useEffect(() => {
    if (selectedWorkedGroup && selectedWorkedGroup?.workGroupId) {
      const groupIds = selectedWorkedGroup.groupsData.map((m) => m.id);
      setInsuanceAllData(
        insuranceData.filter((m) => groupIds.includes(m.groupID))
      );
    }
    if (selectedRenderingGroup) {
      dispatch(
        fetchPracticeDataRequest({ groupID: selectedRenderingGroup.id })
      );
      dispatch(
        fetchFacilityDataRequest({ groupID: selectedRenderingGroup.id })
      );
      dispatch(
        fetchProviderDataRequest({ groupID: selectedRenderingGroup.id })
      );
      setInsuanceAllData(
        insuranceData.filter((m) => m.groupID === selectedRenderingGroup?.id)
      );
    }
  }, [selectedRenderingGroup]);

  const onSelectFacility = (value: SingleSelectDropDownDataType) => {
    setSelectedFacility(value);
    const facilities = facilityData?.filter((m) => m.id === value.id)[0];
    if (facilities) {
      setSelectedPlaceOfService(
        lookupsData?.placeOfService.filter(
          (m) => m.id === facilities.placeOfServiceID
        )[0]
      );
    }
  };

  useEffect(() => {
    if (
      selectedRenderingGroup &&
      selectedRenderingGroup.id !== selectedWorkedGroup?.groupsData[0]?.id
    ) {
      dispatch(
        fetchPracticeDataRequest({ groupID: selectedRenderingGroup?.id })
      );
      dispatch(
        fetchProviderDataRequest({ groupID: selectedRenderingGroup?.id })
      );
      setSelectedInsurance(undefined);
    }
    setInsuanceAllData(
      insuranceData.filter((m) => m.groupID === selectedRenderingGroup?.id)
    );
  }, [selectedRenderingGroup]);

  useEffect(() => {
    if (ProviderData) {
      setRendringProviderData(ProviderData);
    }
  }, [ProviderData]);

  const onSavedProfile = async () => {
    const todaysDate = new Date();
    todaysDate.setHours(0, 0, 0, 0);
    const ptDateofbirth = dateofbirth ? new Date(dateofbirth) : null;
    if (ptDateofbirth && ptDateofbirth > todaysDate) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'DOB should not be in future',
          toastType: ToastType.ERROR,
        })
      );
      return;
    }
    const socialnumber = socialSecurityNumber
      ? socialSecurityNumber.replace(/-/g, '')
      : '';
    const officeNum = workPhone ? workPhone.replace(/-/g, '') : '';
    const homenum = homePhone ? homePhone.replace(/-/g, '') : '';
    const cellnum = cellPhone ? cellPhone.replace(/-/g, '') : '';
    const patientData: SavePatientRequestData = {
      patientID: selectedPatientID || null || undefined,
      groupID: selectedRenderingGroup?.id,
      practiceID: selectedPractice?.id,
      facilityID: selectedFacility?.id,
      posID: selectedPlaceOfService?.id,
      providerID: selectedRendringProvider?.id,
      firstName,
      middleName: middelName || '',
      lastName,
      dob: dateofbirth ? DateToStringPipe(dateofbirth, 1) || null : null,
      genderID: selectedGender?.id,
      maritalStatusID: selectedMaritalStatus?.id,
      accountNo: accountNumber || '',
      active: activeCheck === 'Y',
      eStatement: statementCheck === 'Y',
      address1,
      address2: address2 || '',
      city,
      state: state?.value,
      zipCode: zip,
      zipCodeExtension: extension || '',
      homePhone: homenum || '',
      workPhone: officeNum || '',
      cellPhone: cellnum || '',
      fax: fax || '',
      email: email || '',
      raceID: race?.id,
      ethnicityID: ethnicity?.id,
      languageID: language?.id,
      primaryCarePhysician: PCP || '',
      category: patientCatogry || '',
      chartNo: chartNumber || '',
      licenseNo: licenseNumber || '',
      employerName: employerName || '',
      smokingStatusID: smokingStatus?.id,
      deceaseDate: decreseDate ? decreseDate?.toISOString().slice(0, 10) : null,
      deceaseReason: decreaseReason || '',
      emergencyRelation: relation || '',
      emergencyFirstName: relationfname || '',
      emergencyLastName: relationsName || '',
      emergencyAddress1: relationAddress1 || '',
      emergencyAddress2: relationAddress2 || '',
      emergencyZipCodeExtension: relationExtension || '',
      emergencyCity: relationCity || '',
      emergencyState: relationState?.value,
      emergencyZipCode: relationZip || '',
      emergencyTelephone: relationPhone || '',
      emergencyEmail: relationEmail || '',
      socialSecurityNumber: socialnumber || '',
      validateIDS: validateAddressData.validateID
        ? [validateAddressData.validateID]
        : [],
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
    };
    let res;
    if (selectedPatientID) {
      res = await reSaveRegisterPatientDate(patientData);
    } else {
      res = await savePatient(patientData);
    }
    if (res) {
      setRoutePath('/app/patient-search');
    }
  };

  const onValidateAddress = async (
    address: string,
    zips: string,
    catogaryy: string,
    id: number | null
  ) => {
    let res: ValidateAddressDataType | null = null;
    res = await validatePatientAddress(address, zips, catogaryy, id);
    if (res?.error === null || res?.error === '') {
      setValidateAddressData({
        ...validateAddressData,
        address1: res.address1,
        address2: res.address2,
        zipPlus4: res.zipPlus4,
        city: res.city,
        state: res.state,
        zip: res.zip,
        validateID: res.validateID,
        validateOn: res.validateOn,
      });
      if (catogaryy === 'patient address') {
        setAddressValidatedOn(res.validateOn);
      } else {
        setEmgAddressValidatedOn(res.validateOn);
      }
    }
    if (!res) {
      setStatusModalState({
        ...statusModalState,
        open: true,
        heading: 'Error',
        description:
          'A system error prevented the Validate Address feature from running. Please try again.',
        okButtonText: 'Ok',
        statusModalType: StatusModalType.ERROR,
        showCloseButton: false,
        closeOnClickOutside: false,
      });
    }
    if (res?.error === 'Address Not Found.  ') {
      setStatusModalState({
        ...statusModalState,
        open: true,
        heading: 'No Results Found',
        description:
          'Sorry,  we couldnt find an address that matches the provided information. Please double-check the information you provided and try again.',
        okButtonText: 'Ok',
        statusModalType: StatusModalType.ERROR,
        showCloseButton: false,
        closeOnClickOutside: false,
      });
    } else {
      setIsValidateAddressOpen(true);
    }
  };

  const onValidateDemographic = async () => {
    let res: ValidateDemographicResponseDate | null = null;
    if (selectedPatientID) {
      res = await validateDemographicAddress(
        selectedPatientID,
        selectedRenderingGroup?.id
      );
      if (res) {
        setValidateDemographicData({
          response: res.response,
          data: res.data,
        });
      }
      if (res?.response === 'Done') {
        setValidateDemographicData({
          ...validateDemographicData,
          data: {
            confidenceScore: res.data?.confidenceScore || '',
            addressDateReported: res.data?.addressDateReported || '',
            correctedFirstname: res.data?.correctedFirstname || '',
            correctedLastname: res.data?.correctedLastname || '',
            correctedMiddlename: res.data?.correctedMiddlename || '',
            correctedSuffix: res.data?.correctedSuffix || '',
            correctedAddress: res.data?.correctedAddress || '',
            correctedCity: res.data?.correctedCity || '',
            correctedState: res.data?.correctedState || '',
            correctedZip: res.data?.correctedZip || '',
            correctedSSN: res.data?.correctedSSN || '',
            correctedDOB: res.data?.correctedDOB || '',
            noHit: res.data?.noHit,
            accuracy: res.data?.accuracy || '',
            warnings: res.data?.warnings || '',
            redFlags: res.data?.redFlags || '',
            phoneNumber: res.data?.phoneNumber || '',
            phoneType: res.data?.phoneType || '',
            gender: res.data?.gender || '',
            deceased: res.data?.deceased,
            status: res.data?.status || '',
            demographicVerifiedOn: res.data?.demographicVerifiedOn || '',
          },
        });
      }
      if (!res) {
        setStatusModalState({
          ...statusModalState,
          open: true,
          heading: 'Error',
          description:
            'A system error prevented the Demographics Verifier from running. Please try again.',
          okButtonText: 'Ok',
          statusModalType: StatusModalType.ERROR,
          showCloseButton: false,
          closeOnClickOutside: false,
        });
      }
      if (res?.response === 'not found') {
        setStatusModalState({
          ...statusModalState,
          open: true,
          heading: 'No Results Found',
          description:
            'Sorry, we couldnt find any results for your query. Please check the info provided about the patient and try again, if applicable.',
          okButtonText: 'Ok',
          statusModalType: StatusModalType.ERROR,
          showCloseButton: false,
          closeOnClickOutside: false,
        });
      } else {
        setIsDemographicVerifier(true);
      }
    }
  };
  const PatientRegisterationValidation = () => {
    let isValid = true;
    const extensionV = /^\d{4}$/;
    const zipV = /^\d{5}$/;
    if (extension && extension?.length > 0 && !extensionV.test(extension)) {
      dispatch(
        addToastNotification({
          text: 'Contact Info. extenstion must be consist of 4 digits',
          toastType: ToastType.ERROR,
          id: '',
        })
      );
      isValid = false;
    }
    if (zip && zip?.length > 0 && !zipV.test(zip)) {
      dispatch(
        addToastNotification({
          text: 'Contact Info. ZIP Code must be consist of 5 digits',
          toastType: ToastType.ERROR,
          id: '',
        })
      );
      isValid = false;
    }
    if (
      relationExtension &&
      relationExtension?.length > 0 &&
      !extensionV.test(relationExtension)
    ) {
      dispatch(
        addToastNotification({
          text: 'Emergency contact extenstion must be consist of 4 digits',
          toastType: ToastType.ERROR,
          id: '',
        })
      );
      isValid = false;
    }
    if (relationZip && relationZip?.length > 0 && !zipV.test(relationZip)) {
      dispatch(
        addToastNotification({
          text: 'Emergency contact  ZIP Code must be consist of 5 digits',
          toastType: ToastType.ERROR,
          id: '',
        })
      );
      isValid = false;
    }
    if (email && email?.length > 0 && !validator.isEmail(email)) {
      dispatch(
        addToastNotification({
          text: 'Invalid Email Format.',
          toastType: ToastType.ERROR,
          id: '',
        })
      );
      isValid = false;
    }
    if (
      relationEmail &&
      relationEmail?.length > 0 &&
      !validator.isEmail(relationEmail)
    ) {
      dispatch(
        addToastNotification({
          text: 'Invalid Relation Email Format.',
          toastType: ToastType.ERROR,
          id: '',
        })
      );
      isValid = false;
    }
    const validatePhoneNumber = (phoneNumber: string) => {
      // Validate the format (XXX) XXX-XXXX using a regex
      const regex1 = /^\(\d{3}\) \d{3}-\d{4}$/;
      const regex2 = /^\d{3}-\d{3}-\d{4}$/;
      const regex3 = /^\(\d{3}\) \d{7}$/;
      const regex4 = /^\d{10}$/;
      // Test the phone number against the regex
      return (
        regex1.test(phoneNumber) ||
        regex2.test(phoneNumber) ||
        regex3.test(phoneNumber) ||
        regex4.test(phoneNumber)
      );
    };
    if (homePhone && homePhone.length > 0 && !validatePhoneNumber(homePhone)) {
      dispatch(
        addToastNotification({
          text: 'Home Phone number is invalid.',
          toastType: ToastType.ERROR,
          id: '',
        })
      );
      isValid = false;
    }

    if (workPhone && workPhone.length > 0 && !validatePhoneNumber(workPhone)) {
      dispatch(
        addToastNotification({
          text: 'Work Phone number is invalid.',
          toastType: ToastType.ERROR,
          id: '',
        })
      );
      isValid = false;
    }

    if (cellPhone && cellPhone.length > 0 && !validatePhoneNumber(cellPhone)) {
      dispatch(
        addToastNotification({
          text: 'Cell Phone number is invalid.',
          toastType: ToastType.ERROR,
          id: '',
        })
      );
      isValid = false;
    }

    if (fax && fax.length > 0 && !validatePhoneNumber(fax)) {
      dispatch(
        addToastNotification({
          text: 'Phone Fax number is invalid.',
          toastType: ToastType.ERROR,
          id: '',
        })
      );
      isValid = false;
    }

    if (
      relationPhone &&
      relationPhone.length > 0 &&
      !validatePhoneNumber(relationPhone)
    ) {
      dispatch(
        addToastNotification({
          text: 'Number is invalid.',
          toastType: ToastType.ERROR,
          id: '',
        })
      );
      isValid = false;
    }
    return isValid;
  };

  // Notes Section
  const [isOpenNotePane, setIsOpenNotePane] = React.useState(false);
  useState<ClaimNotesData>();
  const initProfile = () => {
    dispatch(getLookupDropdownsRequest());
    dispatch(fetchGroupDataRequest());
  };
  useEffect(() => {
    initProfile();
  }, []);

  const onDeletePatient = async () => {
    let res: DeletePatientResponseDate | null = null;
    if (selectedPatientID) {
      res = await deletePatient(selectedPatientID);
    }
    if (!res) {
      setStatusModalState({
        ...statusModalState,
        open: true,
        heading: 'Error',
        okButtonText: 'ok',
        description:
          'A system error prevented the payment info. to be saved. Please try again.',
        statusModalType: StatusModalType.ERROR,
        showCloseButton: true,
        closeOnClickOutside: false,
      });
    }
  };

  const myRef = useRef<HTMLTableRowElement>(null);
  const onUpload = async () => {
    if (selectedFile) {
      // in update mode
      if (selectedPatientID) {
        const formData = new FormData();
        formData.append('patientID', String(selectedPatientID));
        formData.append(
          'groupID',
          selectedRenderingGroup?.id ? String(selectedRenderingGroup?.id) : ''
        );
        formData.append(
          'practiceID',
          selectedPractice?.id ? String(selectedPractice?.id) : ''
        );
        formData.append('file', selectedFile);
        formData.append('categoryID', String(selectedAttachmentType?.id));

        const res = await uploadPatientDocs(formData);
        if (res) {
          getDocumentDataByID();
        } else {
          return;
        }
      }
      setSelectedFile(undefined);
      setTimeout(() => {
        myRef?.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    }
  };
  const ConvertToCSV = (objArray: any[]) => {
    const items = objArray;
    const replacer = (_key: any, value: any) => value || '';
    if (items && items[0]) {
      // specify how you want to handle null values here
      const header = Object.keys(items[0]);
      const csv = items.map((row: any) =>
        header
          .map((fieldName) =>
            JSON.stringify(
              row[fieldName] == null
                ? null
                : String(row[fieldName]).replace(/"/g, "'"),
              replacer
            )
          )
          .join(',')
      );
      return csv.join('\r\n');
    }
    return '';
  };
  const DownloadGridDataCSV = (array: any[]) => {
    // if (!array) {
    //   setStatusModalState({
    //     ...statusModalInfo,
    //     show: true,
    //     heading: 'Alert',
    //     type: StatusModalType.WARNING,
    //     text: 'No Data to Export!',
    //   });
    //   return;
    // }
    const csvData = ConvertToCSV(array);
    const a = document.createElement('a');
    a.setAttribute('style', 'displa.y:none;');
    document.body.appendChild(a);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = 'AdvancedPaymentsHistoryLedger.csv';
    a.click();
  };
  const ExportData = async () => {
    const exportDataArray = paymentLedgerRows?.patientAdvancePayments.map(
      function (n) {
        return {
          'Adv. Pay. ID': n.paymentLedgerID.toString(),
          'Appointment ID': n.appointmentID ? n.appointmentID.toString() : '-',
          'Check Date': n.checkDate,
          'Post Date': n.postingDate || '',
          DoS: n.dos || '',
          Amount: n.amount ? currencyFormatter.format(n.amount) : '-',
          'Ledger Name': n.ledgerName,
          'Check Number': n.checkNumber,
          'Payment Type': n.paymentType,
          Comments: n.comments,
          'Claim ID ': n.claimID ? n.claimID.toString() : '-',
          'Charge ID': n.chargeID ? n.chargeID.toString() : '-',
          'Created On ': n.createdOn,
          'Created By': n.createdBy,
        };
      }
    );
    if (exportDataArray && exportDataArray.length !== 0) {
      const headerArray = Object.keys(exportDataArray[0] || {});
      let criteriaObj: { [key: string]: string } = { ...exportDataArray[0] };
      const criteriaArray = [];
      criteriaObj = Object.fromEntries(headerArray.map((key) => [key, '']));
      criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
      criteriaObj = {
        ...criteriaObj,
        'Adv. Pay. ID': 'Patient ID',
        'Appointment ID': selectedPatientID?.toString() || '',
      };
      criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
      criteriaObj = {
        ...criteriaObj,
        'Adv. Pay. ID': 'With DoS',
        'Appointment ID':
          (paymentLedgerRows?.withDOSAmount &&
            currencyFormatter.format(paymentLedgerRows?.withDOSAmount)) ||
          '',
      };
      criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
      criteriaObj = {
        ...criteriaObj,
        'Adv. Pay. ID': 'Without DoS',
        'Appointment ID':
          (paymentLedgerRows?.withoutDOSAmount &&
            currencyFormatter.format(paymentLedgerRows?.withoutDOSAmount)) ||
          '',
      };
      criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
      criteriaObj = {
        ...criteriaObj,
        'Adv. Pay. ID': 'Total Advance Pay, Bal.',
        'Appointment ID':
          (paymentLedgerRows?.totalBalance &&
            currencyFormatter.format(paymentLedgerRows?.totalBalance)) ||
          '',
      };
      criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
      criteriaObj = Object.fromEntries(headerArray.map((key) => [key, '']));
      criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
      criteriaObj = {
        ...criteriaObj,
        'Adv. Pay. ID': 'Advanced Payments History Ledger',
        'Appointment ID': '',
      };
      criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
      criteriaObj = Object.fromEntries(headerArray.map((key) => [key, '']));
      criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
      criteriaObj = Object.fromEntries(headerArray.map((key) => [key, key]));
      criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
      const exportArray = criteriaArray.concat(exportDataArray);
      DownloadGridDataCSV(exportArray);
    }
  };

  const ExportFinicialData = async () => {
    let res: TimeFrameData[] | null;
    if (selectedPatientID) {
      res = await TimeframeDetailPatientFinanical(
        null,
        null,
        selectedPatientID,
        true
      );
      if (res) {
        const exportDataArray = res.map((n) => {
          return {
            'Claim ID': n.claimID.toString(),
            'Patient ID': n.patientID.toString(),
            'Patient Name': n.patient,
            DoS: n.dos,
            'Aging Type': n.agingType,
            Aging: n.agingDays.toString(),
            Insurance: n.insurance || '',
            Group: n.group,
            'Group EIN': n.groupEIN,
            Practice: n.practice,
            'Practice Address': n.practiceAddress,
            Facility: n.facility,
            'Facility Address': n.facilityAddress,
            Provider: n.provider,
            'Provider NPI': n.providerNPI,
            'Claim Status': n.claimStatus,
            PoS: n.pos,
            'Insurance Resp': currencyFormatter.format(n.insuranceAmount),
            'Patient Resp': currencyFormatter.format(n.patientAmount),
            'T. Balance': currencyFormatter.format(n.totalBalance),
          };
        });
        if (exportDataArray.length !== 0) {
          const headerArray = Object.keys(exportDataArray[0] || {});
          let criteriaObj: { [key: string]: string } = {
            ...exportDataArray[0],
          };
          const criteriaArray = [];
          criteriaObj = Object.fromEntries(
            headerArray.map((key) => [key, key])
          );
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          const exportArray = criteriaArray.concat(exportDataArray);
          ExportDataToCSV(exportArray, 'PatientTimeframeHistory');
        }
      }
    }
  };

  return (
    <AppLayout title="Nucleus - Registration">
      <StatusModal
        open={statusModalState.open}
        heading={statusModalState.heading}
        description={statusModalState.description}
        okButtonText={statusModalState.okButtonText}
        okButtonColor={statusModalState.okButtonColor}
        closeButtonText={statusModalState.closeButtonText}
        statusModalType={statusModalState.statusModalType}
        showCloseButton={statusModalState.showCloseButton}
        closeOnClickOutside={statusModalState.closeOnClickOutside}
        onClose={() => {
          setStatusModalState({
            ...statusModalState,
            open: false,
          });
        }}
        onChange={() => {
          setStatusModalState({
            ...statusModalState,
            open: false,
          });
          if (showRefundPaymentModal) {
            onRefundPayment();
            return;
          }
          if (isDelete) {
            onDeletePatient();
            setRoutePath('/app/register-patient');
          }
          if (isClosed) {
            setRoutePath('/app/patient-search');
          }
          if (isReversed) {
            setPostingDateModel(true);
          }
          if (isDeleteGaur) {
            onDeleteGaurRow(selectedRowId);
          }
          if (insuranceInactiveData.open) {
            insuranceActive();
          }
          if (
            deleteMedicalCaseData.isDelete &&
            deleteMedicalCaseData.medicalCaseID
          ) {
            onDeleteMedicalCaseColumn(deleteMedicalCaseData.medicalCaseID);
          }
        }}
      />
      <div
        className={classNames(
          // eslint-disable-next-line no-nested-ternary
          isOpenNotePane ? (isMenuOpened ? 'md:w-[63%]' : 'md:w-[66.3%]') : '',
          'h-full relative m-0 bg-gray-100 p-0'
        )}
      >
        <div
          className={classNames(
            isOpenNotePane ? '' : 'w-full',
            'overflow-y-scroll m-0 p-0 h-full bg-gray-100'
          )}
        >
          <div className="flex w-full flex-col">
            <div className="m-0 h-full w-full overflow-y-auto overflow-x-hidden bg-gray-100 p-0">
              <div className="h-[230px] w-full">
                <div className="absolute top-0 z-[1] w-full">
                  <Breadcrumbs />
                  <PageHeader cls=" bg-[white] ">
                    <div className="flex items-start justify-between gap-4 px-7 pt-[33px] pb-[21px]">
                      <div className="flex flex-wrap ">
                        <p className=" self-center text-3xl font-bold text-cyan-600">
                          {selectedPatientID
                            ? `Patient Details - ${firstName || ''} ${
                                middelName || ''
                              } ${lastName || ''}`
                            : `${'Register New Patient'} - ${firstName || ''} ${
                                middelName || ''
                              } ${lastName || ''} (unsaved)`}
                        </p>
                      </div>
                      <div className=" flex items-center justify-end gap-5">
                        <div className="">
                          <CloseButton
                            onClick={() => {
                              setIsClosed(true);
                              setStatusModalState({
                                ...statusModalState,
                                open: true,
                                heading: 'Alert',
                                okButtonText: 'Abandon changes',
                                description:
                                  'There are unsaved changes on Patient profile. Do you want to move to patient search screen?',
                                closeButtonText: 'Stay',
                                statusModalType: StatusModalType.WARNING,
                                showCloseButton: true,
                                closeOnClickOutside: false,
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mx-8">
                      <div className="h-px w-full bg-gray-200" />
                    </div>
                    <div className="inline-flex items-center justify-start space-x-2 px-7 pt-[10px] pb-[22px]">
                      <p className="text-sm font-bold leading-tight text-gray-600">
                        Patient ID:
                      </p>
                      <div className="flex items-center justify-center rounded bg-gray-200 px-3 py-0.5">
                        <p className="h-[20px] w-[60px] text-center text-sm font-medium leading-tight text-black">
                          #{selectedPatientID || ''}
                        </p>
                      </div>
                    </div>

                    <div className="h-[1px] w-full bg-gray-300" />
                    <div className="pl-[24px]">
                      <Tabs
                        tabs={tabs}
                        onChangeTab={(tab: any) => {
                          setCurrentTab(tab);
                        }}
                        currentTab={currentTab}
                      />
                    </div>
                  </PageHeader>
                </div>
              </div>
              <div className="relative w-full ">
                <div className="px-7 ">
                  {currentTab && currentTab.id === 1 && (
                    <>
                      <div className="mt-[36px] bg-gray-100">
                        <div className="m-0 text-xl font-bold text-gray-800 sm:text-xl">
                          Group & Provider Info.
                        </div>
                      </div>
                      <p className="mt-[8px] mb-[4px] w-16  text-base font-bold leading-normal text-gray-800">
                        Location
                      </p>
                      <div className="flex w-full gap-4">
                        <div className={`gap-1 w-auto `}>
                          <label className="text-sm font-medium leading-5 text-gray-700">
                            Group<span className="text-cyan-500">*</span>
                          </label>
                          <div
                            className={`w-full gap-1 justify-center flex flex-col items-start self-stretch `}
                          >
                            <div
                              className="w-[240px] "
                              title={selectedRenderingGroup?.value}
                            >
                              <SingleSelectDropDown
                                data-testid="group"
                                placeholder="Select group"
                                showSearchBar={false}
                                disabled={!!selectedPatientID}
                                data={
                                  groupData
                                    ? (groupData as SingleSelectDropDownDataType[])
                                    : []
                                }
                                selectedValue={selectedRenderingGroup}
                                onSelect={(value) => {
                                  setSelectedRenderingGroup(value);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={`gap-1 w-auto`}>
                          <label className="text-sm font-medium leading-5 text-gray-700">
                            Practice<span className="text-cyan-500">*</span>
                          </label>
                          <div
                            className={`w-full gap-1 justify-center flex flex-col items-start self-stretch`}
                          >
                            <div className="w-[240px] ">
                              <SingleSelectDropDown
                                placeholder="Select practice"
                                showSearchBar={false}
                                disabled={!!selectedPatientID}
                                data={
                                  practicesData && practicesData.length > 0
                                    ? (practicesData as SingleSelectDropDownDataType[])
                                    : [
                                        {
                                          id: 1,
                                          value: 'No Record Found',
                                          active: false,
                                        },
                                      ]
                                }
                                selectedValue={selectedPractice}
                                onSelect={(value) => {
                                  setSelectedPractice(value);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={`gap-1 w-auto`}>
                          <label className="text-sm font-medium leading-5 text-gray-700">
                            Facility<span className="text-cyan-500">*</span>
                          </label>
                          <div
                            className={`w-full gap-1 justify-center flex flex-col items-start self-stretch`}
                          >
                            <div className="w-[240px] ">
                              <SingleSelectDropDown
                                placeholder="Select facility"
                                showSearchBar={false}
                                disabled={false}
                                data={
                                  facilityData && facilityData.length > 0
                                    ? (facilityData as SingleSelectDropDownDataType[])
                                    : [
                                        {
                                          id: 1,
                                          value: 'No Record Found',
                                          active: false,
                                        },
                                      ]
                                }
                                selectedValue={selectedFacility}
                                onSelect={(value) => {
                                  onSelectFacility(value);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={`gap-1 w-auto`}>
                          <label className="text-sm font-medium leading-5 text-gray-700">
                            Place of Service
                            <span className="text-cyan-500">*</span>
                          </label>
                          <div
                            className={`w-full gap-1 justify-center flex flex-col items-start self-stretch`}
                          >
                            <div className="w-[240px]">
                              <SingleSelectDropDown
                                placeholder="Place of Service"
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
                      <p className="w-16 pt-[24px] text-base font-bold leading-normal text-gray-800">
                        Provider
                      </p>
                      <div className="flex">
                        <div className={`gap-2 flex items-end`}>
                          <div className={`gap-1 w-auto`}>
                            <label className="pt-[8px] text-sm font-medium leading-5 text-gray-900">
                              Rendering Provider
                              <span className="text-cyan-500">*</span>
                            </label>
                            <div
                              className={`w-full gap-1 justify-center flex flex-col items-start self-stretch`}
                            >
                              <div className="w-[240px]">
                                <SingleSelectDropDown
                                  placeholder="Click search button to add provider"
                                  showSearchBar={true}
                                  disabled={false}
                                  data={
                                    rendringProviderData
                                      ? (rendringProviderData as SingleSelectDropDownDataType[])
                                      : []
                                  }
                                  selectedValue={selectedRendringProvider}
                                  onSelect={(value) => {
                                    setSelectedRendringProvider(value);
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
                      </div>
                      <div className="pt-[72px]">
                        <div className="flow-root flex-col">
                          <div className="flex flex-row">
                            <div className="m-0 pb-[24px] text-xl font-bold text-gray-800 sm:text-xl">
                              Patient Demographics
                            </div>
                            {/* eslint-disable-next-line no-nested-ternary */}
                            {selectedPatientID === null ||
                            validateDemographicData.data
                              ?.demographicVerifiedOn === null ||
                            selectedPatientData?.demographicVerifiedOn ===
                              null ? (
                              selectedPatientID ? (
                                <Button
                                  buttonType={ButtonType.primary}
                                  cls={`inline-flex ml-[30px] !justify-center gap-2 !h-[38px]`}
                                  onClick={() => {
                                    if (
                                      !firstName ||
                                      !lastName ||
                                      !dateofbirth
                                    ) {
                                      setStatusModalState({
                                        ...statusModalState,
                                        open: true,
                                        heading: 'Alert',
                                        description:
                                          'To run the Demographics Verifier you need to enter at least the Patient’s First and Last Name, and the Date of Birth. Please review the fields and try again.',
                                        okButtonText: 'Ok',
                                        statusModalType:
                                          StatusModalType.WARNING,
                                        showCloseButton: false,
                                        closeOnClickOutside: false,
                                      });
                                    } else {
                                      onValidateDemographic();
                                    }
                                  }}
                                >
                                  <Icon name={'verified'} size={18} />
                                  <p className="text-justify text-sm ">
                                    {' '}
                                    Verify Patient Demographics
                                  </p>
                                </Button>
                              ) : (
                                <Button
                                  buttonType={ButtonType.primary}
                                  disabled={true}
                                  cls={`inline-flex ml-[30px] !justify-center gap-2 !h-[38px]`}
                                >
                                  <Icon
                                    name={'verified'}
                                    size={18}
                                    color={IconColors.GRAY}
                                  />
                                  <p className="text-justify text-sm ">
                                    {' '}
                                    Verify Patient Demographics
                                  </p>
                                </Button>
                              )
                            ) : (
                              <div className="ml-[16px] mt-[5px] leading-loose">
                                <div className="inline-flex gap-2 leading-5">
                                  <Icon name={'greenCheck'} size={18} />
                                  <p
                                    className={`text-justify text-sm text-green-600 font-bold`}
                                  >
                                    Verified Patient Demographics
                                  </p>
                                  <p>
                                    {' '}
                                    ( Validated On: )
                                    {validateDemographicData.data
                                      ?.demographicVerifiedOn ||
                                      selectedPatientData?.demographicVerifiedOn}
                                  </p>
                                  <div
                                    className="cursor-pointer text-justify text-sm text-cyan-500 underline"
                                    onClick={() => {
                                      if (
                                        !firstName ||
                                        !lastName ||
                                        !dateofbirth
                                      ) {
                                        setStatusModalState({
                                          ...statusModalState,
                                          open: true,
                                          heading: 'Alert',
                                          description:
                                            'To run the Demographics Verifier you need to enter at least the Patient’s First and Last Name, and the Date of Birth. Please review the fields and try again.',
                                          okButtonText: 'Ok',
                                          statusModalType:
                                            StatusModalType.WARNING,
                                          showCloseButton: false,
                                          closeOnClickOutside: false,
                                        });
                                      } else {
                                        setIsDemographicVerifier(true);
                                        onValidateDemographic();
                                      }
                                    }}
                                  >
                                    Run Verified Patient Demographics Again
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <>
                            <Modal
                              open={isDemographicVerifier}
                              onClose={() => {
                                setIsDemographicVerifier(false);
                              }}
                              modalContentClassName="rounded-lg bg-gray-100  text-left shadow-xl  h-[840px] w-[960px]"
                            >
                              <div className="m-5 mb-[30px] text-gray-700">
                                <SectionHeading
                                  label={`Demographics Verifier - ${
                                    firstName === undefined ? '' : firstName
                                  } ${lastName === undefined ? '' : lastName}`}
                                />
                                <div className="flex items-center justify-end gap-5">
                                  <CloseButton
                                    onClick={() => {
                                      setIsDemographicVerifier(false);
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="my-[24px] ml-[24px]">
                                <div
                                  className={`mr-[16px] inline-flex w-48 items-center justify-start rounded-md border ${
                                    validateDemographicData.data
                                      ?.confidenceScore === 'Y'
                                      ? 'border-green-300 bg-green-50'
                                      : 'border-red-300 bg-red-50'
                                  } p-6 shadow`}
                                >
                                  <div className="inline-flex flex-col items-start justify-start space-y-1">
                                    <div className="inline-flex items-start justify-start gap-2 space-x-1">
                                      <p
                                        className={`text-sm font-bold leading-tight ${
                                          validateDemographicData.data
                                            ?.confidenceScore === 'Y'
                                            ? 'text-green-500'
                                            : 'text-red-500'
                                        }`}
                                      >
                                        Confidence Score
                                      </p>
                                      <Icon
                                        name={'questionMarkcircle'}
                                        size={18}
                                        color={
                                          validateDemographicData.data
                                            ?.confidenceScore === 'Y'
                                            ? IconColors.GREEN
                                            : IconColors.RED
                                        }
                                      />
                                    </div>
                                    <div className="inline-flex items-end justify-start">
                                      <div className="flex items-end justify-start space-x-2">
                                        <p
                                          className={`text-xl font-bold leading-7 ${
                                            validateDemographicData.data
                                              ?.confidenceScore === 'Y'
                                              ? 'text-green-500'
                                              : 'text-red-500'
                                          }`}
                                        >
                                          {validateDemographicData.data
                                            ?.confidenceScore === 'Y'
                                            ? 'High'
                                            : 'Low'}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="inline-flex w-48 items-center justify-start rounded-md border border-gray-300 bg-white p-6 shadow">
                                  <div className="inline-flex flex-col items-start justify-start space-y-1">
                                    <div className="inline-flex items-start justify-start gap-2 space-x-1">
                                      <p className="text-sm font-bold leading-tight text-gray-500">
                                        Date Reported
                                      </p>
                                      <Icon
                                        name={'questionMarkcircle'}
                                        size={18}
                                        color={IconColors.GRAY_500}
                                      />
                                    </div>
                                    <div className="inline-flex items-end justify-start">
                                      <div className="flex items-end justify-start space-x-2">
                                        <p className="text-xl font-bold leading-7 text-gray-500">
                                          {
                                            validateDemographicData.data
                                              ?.addressDateReported
                                          }
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className=" bg-gray-100">
                                <p className="ml-[24px] flex h-[20px] w-[480px] text-sm font-normal leading-5">
                                  Select the verified values you want to apply
                                  to the patient demographics.
                                </p>
                              </div>
                              <>
                                <div
                                  className={` text-gray-700 leading-6 font-bold ml-[27px]`}
                                ></div>
                                <div className="mx-[24px] mt-[16px]">
                                  <SearchDetailGrid
                                    checkboxSelection={true}
                                    hideHeader={true}
                                    hideFooter={true}
                                    columns={demographicCol}
                                    rows={updatedDemoValidationrow}
                                    selectRows={updatedDemoValidationrow
                                      .filter((row) => row.checked)
                                      .map((row) => row.id)}
                                  />
                                </div>
                              </>
                              <div className="mt-[44px] ">
                                <div
                                  className={`h-[86px] bg-gray-200 rounded-lg`}
                                >
                                  <div className="w-full">
                                    <div className="h-px w-full bg-gray-300" />
                                  </div>
                                  <div className="py-[24px] pr-[27px]">
                                    <div className={`gap-4 flex justify-end `}>
                                      <div>
                                        <Button
                                          buttonType={ButtonType.secondary}
                                          cls={` `}
                                          onClick={() => {
                                            setIsDemographicVerifier(false);
                                          }}
                                        >
                                          {' '}
                                          Cancel
                                        </Button>
                                      </div>
                                      <div>
                                        <Button
                                          buttonType={ButtonType.primary}
                                          cls={` `}
                                          onClick={() => {
                                            setIsDemographicVerifier(false);
                                            handleButtonDemoClick();
                                          }}
                                        >
                                          {' '}
                                          Apply Selected Values to Patient
                                          Demographics
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Modal>
                          </>
                          <div
                            className={`relative flex items-start gap-8 text-gray-700 leading-6 text-left font-bold w-full h-full `}
                          >
                            <div className={`gap-6 flex flex-col items-start`}>
                              <div
                                className={`relative w-[280px] h-[62px] flex gap-2`}
                              >
                                <div
                                  className={`w-full items-start self-stretch`}
                                >
                                  <label className="text-sm font-medium leading-5 text-gray-900">
                                    First Name
                                    <span className="text-cyan-500">*</span>
                                  </label>
                                  <div className="mb-[24px] h-[38px] w-[240px]">
                                    <InputField
                                      value={firstName || ''}
                                      placeholder="First"
                                      onChange={(evt) =>
                                        setFirstName(evt.target.value)
                                      }
                                    />
                                  </div>
                                </div>
                                <div
                                  className={`w-full items-start self-stretch`}
                                >
                                  <label className="text-sm font-medium leading-5 text-gray-900">
                                    Middle Name
                                  </label>
                                  <div className="mb-[24px] h-[38px] w-[240px]">
                                    <InputField
                                      value={middelName || ''}
                                      placeholder="Middle"
                                      onChange={(evt) =>
                                        setMiddelName(evt.target.value)
                                      }
                                    />
                                  </div>
                                </div>
                                <div
                                  className={`w-full items-start self-stretch`}
                                >
                                  <label className="text-sm font-medium leading-5 text-gray-900">
                                    Last Name
                                    <span className="text-cyan-500">*</span>
                                  </label>
                                  <div className="h-[38px] w-[240px]">
                                    <InputField
                                      value={lastName || ''}
                                      placeholder="Last"
                                      onChange={(evt) =>
                                        setLastName(evt.target.value)
                                      }
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium leading-loose text-gray-900">
                                    Date of Birth
                                    <span className="text-cyan-500">*</span>
                                  </label>
                                  <div className="w-[144px]">
                                    <AppDatePicker
                                      testId="patientDob_testid"
                                      placeholderText="mm/dd/yyyy"
                                      cls=""
                                      onChange={(date) => {
                                        setDateofbirth(date);
                                      }}
                                      selected={dateofbirth}
                                      // onDeselectValue={() => {
                                      //   setDateofbirth(null);
                                      // }}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="flex w-auto gap-2">
                                <div className={`gap-1 w-auto`}>
                                  <label className="text-sm font-medium leading-5 text-gray-700">
                                    Gender
                                    <span className="text-cyan-500">*</span>
                                  </label>
                                  <div
                                    className={`w-full gap-1 justify-center flex flex-col items-start self-stretch`}
                                  >
                                    <div className="w-[240px] ">
                                      <SingleSelectDropDown
                                        placeholder="-"
                                        showSearchBar={false}
                                        disabled={false}
                                        data={
                                          patientlookupData
                                            ? (patientlookupData?.gender as SingleSelectDropDownDataType[])
                                            : []
                                        }
                                        selectedValue={selectedGender}
                                        onSelect={(value) => {
                                          setSelectedGender(value);
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className={`gap-1 w-auto`}>
                                  <label className="text-sm font-medium leading-5 text-gray-700">
                                    Marital Status
                                  </label>
                                  <div
                                    className={`w-full gap-1 justify-center flex flex-col items-start self-stretch`}
                                  >
                                    <div className="w-[240px] ">
                                      <SingleSelectDropDown
                                        placeholder="-"
                                        showSearchBar={false}
                                        disabled={false}
                                        data={
                                          patientlookupData
                                            ? (patientlookupData?.maritals as SingleSelectDropDownDataType[])
                                            : []
                                        }
                                        selectedValue={selectedMaritalStatus}
                                        onSelect={(maritals) => {
                                          setSelectedMaritalStatus(maritals);
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className={` items-start self-stretch`}>
                                  <label className="text-sm font-medium leading-5 text-gray-900">
                                    Account Number
                                  </label>
                                  <div className=" h-[38px] w-[240px]">
                                    <InputField
                                      placeholder="-"
                                      value={accountNumber || ''}
                                      onChange={(evt) =>
                                        setAccountNumber(evt.target.value)
                                      }
                                    />
                                  </div>
                                </div>
                                <div
                                  className={`w-[100px] h-[62px] top-[4px] relative`}
                                >
                                  <label className="text-sm font-medium leading-loose  text-gray-700">
                                    Active
                                  </label>
                                  <div className="mt-2">
                                    <RadioButton
                                      data={[
                                        { value: 'Y', label: 'Yes' },
                                        { value: 'N', label: 'No' },
                                      ]}
                                      checkedValue={activeCheck}
                                      onChange={(e) => {
                                        setActiveCheck(e.target.value);
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="relative w-[10px]">
                                  <div
                                    className={` [rotate:90deg] origin-top-left bg-gray-200 w-[62px] outline outline-1 outline-[rgba(209,213,219,1)]`}
                                  >
                                    {' '}
                                  </div>
                                </div>
                                <div
                                  className={`w-[100px] h-[62px] top-[4px] relative`}
                                >
                                  <label className="text-sm font-medium leading-loose  text-gray-700">
                                    Statement
                                  </label>
                                  <div className="mt-2">
                                    <RadioButton
                                      data={[
                                        { value: 'Y', label: 'Yes' },
                                        { value: 'N', label: 'No' },
                                      ]}
                                      checkedValue={statementCheck}
                                      onChange={(e) => {
                                        setStatementCheck(e.target.value);
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className={`items-start self-stretch`}>
                                <label className="text-sm font-medium leading-5 text-gray-900">
                                  Social Security Number
                                </label>
                                <div
                                  data-testid="ssn"
                                  className="h-[38px] w-[240px]"
                                >
                                  <InputField
                                    placeholder="***-**-####"
                                    value={
                                      socialSecurityNumber !==
                                      'undefined-undefined-undefined'
                                        ? socialSecurityNumber || ''
                                        : ''
                                    }
                                    maxLength={11}
                                    pattern="[0-9]*"
                                    onKeyDown={(evt: {
                                      key: any;
                                      preventDefault: () => void;
                                    }) => {
                                      const charCode = evt.key;
                                      if (
                                        charCode !== 'Backspace' &&
                                        charCode !== 'Delete' &&
                                        !/^\d+$/.test(charCode)
                                      ) {
                                        evt.preventDefault();
                                      }
                                    }}
                                    onChange={(evt) => {
                                      handleInputChange(evt);
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="pt-[24px]">
                        <div className="m-0 pb-[16px] text-xl font-bold text-gray-800 sm:text-xl">
                          Contact Info.
                        </div>
                        <div className="relative w-full ">
                          <div className="flex-col ">
                            <div
                              className={`mb-[16px] w-[1072px] h-[192px] rounded-md border-2  bg-gray-200 py-[16px] ${
                                addressValidatedOn ||
                                catogary === 'patient address'
                                  ? 'border-green-600'
                                  : 'border-gray-300'
                              }`}
                            >
                              <div className="flex h-full">
                                <div className="px-[16px]">
                                  <div
                                    className={`relative flex flex-col items-start gap-6 text-gray-700 leading-6 text-left font-bold w-full h-full `}
                                  >
                                    <div
                                      className={`relative flex flex-col items-start gap-6 text-gray-700 leading-6 text-left font-bold w-full h-full `}
                                    >
                                      <div
                                        className={`gap-2 flex flex-row items-start`}
                                      >
                                        <div
                                          className={`w-full items-start self-stretch`}
                                        >
                                          <label className="text-sm font-medium leading-5 text-gray-700">
                                            Address 1
                                            <span className="text-cyan-500">
                                              *
                                            </span>
                                          </label>
                                          <div className="h-[38px] w-[372px]">
                                            <InputField
                                              value={address1 || ''}
                                              placeholder="Ex.: 142 Palm Avenue"
                                              onChange={(evt) =>
                                                setAddress1(evt.target.value)
                                              }
                                            />
                                          </div>
                                        </div>
                                        <div
                                          className={`w-full items-start self-stretch`}
                                        >
                                          <label className="text-sm font-medium leading-5 text-gray-700">
                                            Address 2
                                          </label>
                                          <div className="h-[38px] w-[372px]">
                                            <InputField
                                              value={address2 || ''}
                                              placeholder="-"
                                              onChange={(evt) =>
                                                setAddress2(evt.target.value)
                                              }
                                            />
                                          </div>
                                        </div>
                                      </div>
                                      <div
                                        className={`gap-2 flex flex-row items-start`}
                                      >
                                        <div
                                          className={`w-full items-start self-stretch`}
                                        >
                                          <label className="text-sm font-medium leading-5 text-gray-700">
                                            City
                                            <span className="text-cyan-500">
                                              *
                                            </span>
                                          </label>
                                          <div className="h-[38px] w-[240px]">
                                            <InputField
                                              value={city || ''}
                                              placeholder="Ex. Tampa"
                                              onChange={(evt) =>
                                                setCity(evt.target.value)
                                              }
                                            />
                                          </div>
                                        </div>
                                        <div
                                          className={`w-full items-start self-stretch`}
                                        >
                                          <label className="text-sm font-medium leading-5 text-gray-700">
                                            State
                                            <span className="text-cyan-500">
                                              *
                                            </span>
                                          </label>
                                          <div
                                            className={`w-full gap-4 justify-center flex flex-col items-start self-stretch`}
                                          >
                                            <div className="h-[38px] w-[240px]">
                                              <SingleSelectDropDown
                                                placeholder="-"
                                                showSearchBar={false}
                                                disabled={false}
                                                data={
                                                  patientlookupData
                                                    ? (patientlookupData?.states as SingleSelectDropDownDataType[])
                                                    : []
                                                }
                                                selectedValue={state}
                                                onSelect={(value) => {
                                                  setState(value);
                                                }}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                        <div
                                          className={`w-full items-start self-stretch`}
                                        >
                                          <label className="text-sm font-medium leading-5 text-gray-700">
                                            ZIP Code
                                            <span className="text-cyan-500">
                                              *
                                            </span>
                                          </label>
                                          <div
                                            data-testid="zip"
                                            className="h-[38px] w-[120px]"
                                          >
                                            <InputField
                                              value={zip || ''}
                                              placeholder="-"
                                              maxLength={5}
                                              onChange={(evt) => {
                                                const inputValue =
                                                  evt.target.value;
                                                const numericValue =
                                                  inputValue.replace(/\D/g, ''); // Remove non-numeric characters
                                                const limitedValue =
                                                  numericValue.slice(0, 5); // Limit to 5 characters

                                                setZip(limitedValue);
                                              }}
                                            />
                                          </div>
                                        </div>
                                        <div
                                          className={`w-full items-start self-stretch`}
                                        >
                                          <label className="text-sm font-medium leading-5 text-gray-700">
                                            Extension
                                          </label>
                                          <div className="h-[38px] w-[120px] ">
                                            <InputField
                                              value={extension || ''}
                                              maxLength={4}
                                              placeholder="-"
                                              onChange={(evt) => {
                                                const inputValue =
                                                  evt.target.value;
                                                const numericValue =
                                                  inputValue.replace(/\D/g, ''); // Remove non-numeric characters
                                                const limitedValue =
                                                  numericValue.slice(0, 4); // Limit to 4 characters
                                                setExtension1(limitedValue);
                                              }}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="pr-[16px] ">
                                  <div
                                    className={`w-[1px] h-full bg-gray-300`}
                                  />
                                </div>
                                <div className="self-center px-[16px]">
                                  <div
                                    className={`w-full items-start self-stretch `}
                                  >
                                    {!addressValidatedOn &&
                                    catogary !== 'patient address' ? ( // catogary !== 'patient address'
                                      <Button
                                        buttonType={ButtonType.primary}
                                        cls={`inline-flex ml-[10px] !justify-center w-[203px] h-[38px] gap-2 mt-[30px]`}
                                        onClick={() => {
                                          if (!address1 || !zip || zip === '') {
                                            setStatusModalState({
                                              ...statusModalState,
                                              open: true,
                                              heading: 'Alert',
                                              description:
                                                'To use the Validate Address feature, you must enter the Address 1 and Zip Code fields. Please check that these fields are filled out correctly before submitting.',
                                              okButtonText: 'Ok',
                                              statusModalType:
                                                StatusModalType.WARNING,
                                              showCloseButton: false,
                                              closeOnClickOutside: false,
                                            });
                                          } else {
                                            setCatogary('patient address');
                                            onValidateAddress(
                                              address1,
                                              zip,
                                              'patient address',
                                              selectedPatientID
                                            );
                                          }
                                        }}
                                      >
                                        <Icon
                                          name={'verified'}
                                          size={18}
                                          color={IconColors.WHITE_S}
                                        />
                                        <p
                                          className={`text-justify text-sm text-white`}
                                        >
                                          Validate Address
                                        </p>
                                      </Button>
                                    ) : (
                                      <div className="">
                                        <div className="inline-flex gap-2">
                                          <Icon name={'greenCheck'} size={18} />
                                          <p
                                            className={` text-sm text-green-600 font-bold`}
                                          >
                                            Validate Address
                                          </p>
                                        </div>

                                        <p className="text-sm text-gray-700">
                                          Validated On:{' '}
                                          {validateAddressData.validateOn ||
                                            addressValidatedOn}
                                        </p>
                                        <div
                                          className="cursor-pointer  text-sm text-cyan-500 underline"
                                          onClick={() => {
                                            if (
                                              !address1 ||
                                              !zip ||
                                              zip === ''
                                            ) {
                                              setStatusModalState({
                                                ...statusModalState,
                                                open: true,
                                                heading: 'Alert',
                                                description:
                                                  'To use the Validate Address feature, you must enter the Address 1 and Zip Code fields. Please check that these fields are filled out correctly before submitting.',
                                                okButtonText: 'Ok',
                                                statusModalType:
                                                  StatusModalType.WARNING,
                                                showCloseButton: false,
                                                closeOnClickOutside: false,
                                              });
                                            } else {
                                              setIsValidateAddressOpen(true);
                                              setCatogary('patient address');
                                              onValidateAddress(
                                                address1,
                                                zip,
                                                'patient address',
                                                selectedPatientID
                                              );
                                            }
                                          }}
                                        >
                                          Run Validate Address Again
                                        </div>
                                      </div>
                                    )}
                                    <>
                                      <Modal
                                        open={isValidateAddressOpen}
                                        onClose={() => {
                                          setIsValidateAddressOpen(false);
                                        }}
                                        modalContentClassName="rounded-lg bg-gray-100  text-left shadow-xl  h-[464px] w-[960px]"
                                      >
                                        <div className="m-5 text-gray-700">
                                          <SectionHeading
                                            label={'Validate Address'}
                                          />
                                          <div className="flex items-center justify-end gap-5">
                                            <CloseButton
                                              onClick={() => {
                                                setIsValidateAddressOpen(false);
                                              }}
                                            />
                                          </div>
                                        </div>
                                        <div className=" bg-gray-100">
                                          <p className="ml-[24px] flex h-[20px] w-[480px] text-sm font-normal leading-5">
                                            Select the verified values you want
                                            to apply to the address
                                          </p>
                                        </div>
                                        <>
                                          <div
                                            className={` text-gray-700 leading-6 font-bold ml-[27px]`}
                                          ></div>
                                          <div className="mx-[24px] mt-[16px]">
                                            <SearchDetailGrid
                                              checkboxSelection={true}
                                              hideHeader={true}
                                              hideFooter={true}
                                              columns={ValidationCol}
                                              rows={updatedAddressValidationrow}
                                              selectRows={updatedAddressValidationrow
                                                .filter((row) => row.checked)
                                                .map((row) => row.id)}
                                            />
                                          </div>
                                        </>
                                        <div className="mt-[44px] ">
                                          <div
                                            className={`h-[86px] bg-gray-200 rounded-lg`}
                                          >
                                            <div className="w-full">
                                              <div className="h-px w-full bg-gray-300" />
                                            </div>
                                            <div className="py-[24px] pr-[27px]">
                                              <div
                                                className={`gap-4 flex justify-end `}
                                              >
                                                <div>
                                                  <Button
                                                    buttonType={
                                                      ButtonType.secondary
                                                    }
                                                    cls={` `}
                                                    onClick={() => {
                                                      setIsValidateAddressOpen(
                                                        false
                                                      );
                                                    }}
                                                  >
                                                    {' '}
                                                    Cancel
                                                  </Button>
                                                </div>
                                                <div>
                                                  <Button
                                                    buttonType={
                                                      ButtonType.primary
                                                    }
                                                    cls={` `}
                                                    onClick={() => {
                                                      setIsValidateAddressOpen(
                                                        false
                                                      );
                                                      handleButtonClick();
                                                    }}
                                                  >
                                                    {' '}
                                                    Apply Selected Values to
                                                    Patient Address
                                                  </Button>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </Modal>
                                    </>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className={`relative w-[280px] leading-5 `}>
                              <div
                                className={`w-full items-start self-stretch`}
                              >
                                <div
                                  className={`gap-4 flex flex-row items-start`}
                                >
                                  <div
                                    className={`w-full items-start self-stretch`}
                                  >
                                    <label className="text-sm font-medium leading-5 text-gray-700">
                                      Home Phone
                                    </label>
                                    <div className="flex gap-2">
                                      <div className="h-[38px] w-[240px]">
                                        <div
                                          className={classNames(
                                            `h-[38px] mt-1 border-solid border border-gray-300 gap-2 inline-flex items-center rounded-md text-gray-900 leading-5 text-left font-normal px-[10px] pt-[9px] pb-[9px] w-full overflow-clip font-['Nunito'] bg-white`
                                          )}
                                        >
                                          <InputMask
                                            placeholder={'(000) 000-0000'}
                                            mask="(999) 999-9999"
                                            className={classNames(
                                              'flex w-full h-full text-black focus:outline-none items-center justify-center text-sm leading-5 self-center pr-2 bg-transparent'
                                            )}
                                            value={homePhone || ''}
                                            onChange={(evt) => {
                                              const phoneNumber =
                                                evt.target.value ===
                                                '(___) ___-____'
                                                  ? ''
                                                  : evt.target.value;
                                              setHomePhone(phoneNumber);
                                            }}
                                          />
                                        </div>
                                      </div>
                                      <Button
                                        buttonType={ButtonType.secondary}
                                        cls={`h-[38px] w-[38px] leading-5 justify-center  mt-[4px] bg-cyan-500 !px-2 !py-1 inline-flex gap-2 leading-5`}
                                        disabled={true}
                                      >
                                        <Icon name={'phone'} size={14} />
                                      </Button>
                                    </div>
                                  </div>
                                  <div
                                    className={`w-full items-start self-stretch`}
                                  >
                                    <label className="text-sm font-medium leading-5 text-gray-700">
                                      Work Phone
                                    </label>
                                    <div className="flex gap-2 ">
                                      <div className="h-[38px] w-[240px]">
                                        <div
                                          className={classNames(
                                            `h-[38px] mt-1 border-solid border border-gray-300 gap-2 inline-flex items-center rounded-md text-gray-900 leading-5 text-left font-normal px-[10px] pt-[9px] pb-[9px] w-full overflow-clip font-['Nunito'] bg-white`
                                          )}
                                        >
                                          <InputMask
                                            placeholder={'(000) 000-0000'}
                                            mask="(999) 999-9999"
                                            className={classNames(
                                              'flex w-full h-full text-black focus:outline-none items-center justify-center text-sm leading-5 self-center pr-2 bg-transparent'
                                            )}
                                            value={workPhone || ''}
                                            onChange={(evt) => {
                                              const phoneNumber =
                                                evt.target.value ===
                                                '(___) ___-____'
                                                  ? ''
                                                  : evt.target.value;
                                              setWorkPhone(phoneNumber);
                                            }}
                                          />
                                        </div>
                                      </div>
                                      <Button
                                        buttonType={ButtonType.secondary}
                                        cls={`h-[38px] w-[38px] leading-5 justify-center  mt-[4px] bg-cyan-500 !px-2 !py-1 inline-flex gap-2 leading-5`}
                                        disabled={true}
                                      >
                                        <Icon name={'phone'} size={14} />
                                      </Button>
                                    </div>
                                  </div>
                                  <div
                                    className={`w-full items-start self-stretch`}
                                  >
                                    <label className="text-sm font-medium leading-5 text-gray-700">
                                      Cell Phone
                                    </label>
                                    <div className="flex gap-2 ">
                                      <div className="h-[38px] w-[240px]">
                                        <div
                                          className={classNames(
                                            `h-[38px] mt-1 border-solid border border-gray-300 gap-2 inline-flex items-center rounded-md text-gray-900 leading-5 text-left font-normal px-[10px] pt-[9px] pb-[9px] w-full overflow-clip font-['Nunito'] bg-white`
                                          )}
                                        >
                                          <InputMask
                                            placeholder={'(000) 000-0000'}
                                            mask="(999) 999-9999"
                                            className={classNames(
                                              'flex w-full h-full text-black focus:outline-none items-center justify-center text-sm leading-5 self-center pr-2 bg-transparent'
                                            )}
                                            value={cellPhone || ''}
                                            onChange={(evt) => {
                                              const phoneNumber =
                                                evt.target.value ===
                                                '(___) ___-____'
                                                  ? ''
                                                  : evt.target.value;
                                              setCellPhone(phoneNumber);
                                            }}
                                          />
                                        </div>
                                      </div>
                                      <Button
                                        buttonType={ButtonType.secondary}
                                        cls={`h-[38px] w-[38px] justify-center mt-[4px] bg-cyan-500 !px-2 !py-1 inline-flex gap-2 leading-5`}
                                        disabled={true}
                                      >
                                        <Icon name={'phone'} size={14} />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-[16px] flex flex-row gap-4">
                            <div className={`items-start self-stretch`}>
                              <label className="text-sm font-medium leading-5 text-gray-900">
                                Fax
                              </label>
                              <div className="relative flex ">
                                <div className="h-[38px] w-[240px] ">
                                  <div
                                    className={classNames(
                                      `h-[38px] mt-1 border-solid border border-gray-300 gap-2 inline-flex items-center rounded-md text-gray-900 leading-5 text-left font-normal px-[10px] pt-[9px] pb-[9px] w-full overflow-clip font-['Nunito'] bg-white`
                                    )}
                                  >
                                    <InputMask
                                      placeholder={'(000) 000-0000'}
                                      mask="(999) 999-9999"
                                      className={classNames(
                                        'flex w-full h-full text-black focus:outline-none items-center justify-center text-sm leading-5 self-center pr-2 bg-transparent'
                                      )}
                                      value={fax || ''}
                                      onChange={(evt) => {
                                        const phoneNumber =
                                          evt.target.value === '(___) ___-____'
                                            ? ''
                                            : evt.target.value;
                                        setFax(phoneNumber);
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className={`w-full items-start self-stretch`}>
                              <label className="text-sm font-medium leading-5 text-gray-900">
                                Email
                              </label>
                              <div className="h-[38px] w-[240px] ">
                                <InputField
                                  value={email || ''}
                                  placeholder="example@example.com"
                                  onChange={(evt) => setEmail(evt.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mb-[72px] pt-[24px]">
                        <div className="flow-root flex-col">
                          <div className="m-0 text-xl font-bold text-gray-800 sm:text-xl">
                            Miscellaneous{' '}
                          </div>
                          <div className={`relative `}>
                            <div className={`relative gap-4 w-[280px]`}>
                              <div
                                className={`w-full gap-4 flex flex-col items-start self-stretch`}
                              >
                                <div className="flex gap-4">
                                  <div className={` items-start self-stretch`}>
                                    <label className="pt-[24px] text-sm font-medium leading-5 text-gray-900">
                                      Race
                                    </label>
                                    <div
                                      className={`w-full gap-4 justify-center flex flex-col items-start self-stretch`}
                                    >
                                      <div className="mb-[24px] h-[38px] w-[240px]">
                                        <SingleSelectDropDown
                                          placeholder="-"
                                          showSearchBar={false}
                                          disabled={false}
                                          data={
                                            patientlookupData
                                              ? (patientlookupData?.race as SingleSelectDropDownDataType[])
                                              : []
                                          }
                                          selectedValue={race}
                                          onSelect={(value) => {
                                            setRace(value);
                                          }}
                                          isOptional={true}
                                          onDeselectValue={() => {
                                            setRace(undefined);
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  <div className={` items-start self-stretch`}>
                                    <label className="text-sm font-medium leading-5 text-gray-900">
                                      Ethinicity
                                    </label>
                                    <div
                                      className={`w-full gap-4 justify-center flex flex-col items-start self-stretch`}
                                    >
                                      <div className="w-[240px] ">
                                        <SingleSelectDropDown
                                          placeholder="-"
                                          showSearchBar={false}
                                          disabled={false}
                                          data={
                                            patientlookupData
                                              ? (patientlookupData?.ethnicity as SingleSelectDropDownDataType[])
                                              : []
                                          }
                                          selectedValue={ethnicity}
                                          onSelect={(value) => {
                                            setEthnicity(value);
                                          }}
                                          isOptional={true}
                                          onDeselectValue={() => {
                                            setEthnicity(undefined);
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  <div className={` items-start self-stretch`}>
                                    <label className="text-sm font-medium leading-5 text-gray-900">
                                      Language
                                    </label>
                                    <div
                                      className={`w-full gap-4 justify-center flex flex-col items-start self-stretch`}
                                    >
                                      <div className="w-[240px] ">
                                        <SingleSelectDropDown
                                          placeholder="-"
                                          showSearchBar={false}
                                          disabled={false}
                                          data={
                                            patientlookupData
                                              ? (patientlookupData?.language as SingleSelectDropDownDataType[])
                                              : []
                                          }
                                          selectedValue={language}
                                          onSelect={(l) => {
                                            setLanguage(l);
                                          }}
                                          isOptional={true}
                                          onDeselectValue={() => {
                                            setLanguage(undefined);
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  <div className={` items-start self-stretch`}>
                                    <label className="text-sm font-medium leading-5 text-gray-900">
                                      Primary Care Physician (PCP)
                                    </label>
                                    <div className="h-[38px] w-[240px] ">
                                      <InputField
                                        value={PCP || ''}
                                        placeholder="-"
                                        maxLength={50}
                                        onChange={(evt) =>
                                          setPCP(evt.target.value)
                                        }
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className={`gap-4 flex items-start`}>
                                <div className={` items-start self-stretch`}>
                                  <label className="text-sm font-medium leading-5 text-gray-900">
                                    Patient Category
                                  </label>
                                  <div className="h-[38px] w-[240px] ">
                                    <InputField
                                      value={patientCatogry || ''}
                                      placeholder="-"
                                      onChange={(evt) =>
                                        setPatientCatogry(evt.target.value)
                                      }
                                    />
                                  </div>
                                </div>
                                <div className={`items-start self-stretch`}>
                                  <label className="text-sm font-medium leading-5 text-gray-900">
                                    Chart Number
                                  </label>
                                  <div className="mb-[24px] h-[38px] w-[240px]">
                                    <InputField
                                      value={chartNumber || ''}
                                      placeholder="-"
                                      onChange={(evt) =>
                                        setChartNumber(evt.target.value)
                                      }
                                    />
                                  </div>
                                </div>
                                <div className={`items-start self-stretch`}>
                                  <label className="text-sm font-medium leading-5 text-gray-900">
                                    License Number
                                  </label>
                                  <div
                                    className={`w-full gap-4 justify-center flex flex-col items-start self-stretch`}
                                  >
                                    <div className="w-[240px] ">
                                      <InputField
                                        value={licenseNumber || ''}
                                        placeholder="-"
                                        onChange={(evt) =>
                                          setLicenseNumber(evt.target.value)
                                        }
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className={` items-start self-stretch`}>
                                  <label className="text-sm font-medium leading-5 text-gray-900">
                                    Employer Name
                                  </label>
                                  <div className="h-[38px] w-[240px] ">
                                    <InputField
                                      value={employerName || ''}
                                      placeholder="-"
                                      maxLength={50}
                                      onChange={(evt) =>
                                        setEmployerName(evt.target.value)
                                      }
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className={`gap-4 flex items-start`}>
                                <div className={` items-start self-stretch`}>
                                  <label className="text-sm font-medium leading-5 text-gray-900">
                                    Smoking Status
                                  </label>
                                  <div
                                    className={`w-full gap-4 justify-center flex flex-col items-start self-stretch`}
                                  >
                                    <div className="w-[240px] ">
                                      <SingleSelectDropDown
                                        placeholder="-"
                                        showSearchBar={false}
                                        disabled={false}
                                        data={
                                          patientlookupData
                                            ? (patientlookupData?.smokingStatus as SingleSelectDropDownDataType[])
                                            : []
                                        }
                                        selectedValue={smokingStatus}
                                        onSelect={(ss) => {
                                          setSmokingStatus(ss);
                                        }}
                                        isOptional={true}
                                        onDeselectValue={() => {
                                          setSmokingStatus(undefined);
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium leading-loose text-gray-900 ">
                                    Decease Date
                                  </label>
                                  <div className="w-[144px]">
                                    <AppDatePicker
                                      placeholderText="mm/dd/yyyy"
                                      cls=""
                                      onChange={(date) => setDecreseDate(date)}
                                      selected={decreseDate}
                                      // onDeselectValue={() => {
                                      //   setDecreseDate(null);
                                      // }}
                                    />
                                  </div>
                                </div>
                                <div className={`items-start self-stretch`}>
                                  <label className="text-sm font-medium leading-5 text-gray-900">
                                    Decease Reason
                                  </label>
                                  <div className="h-[38px] w-[240px] ">
                                    <InputField
                                      value={decreaseReason || ''}
                                      placeholder="-"
                                      onChange={(evt) =>
                                        setDecreaseReason(evt.target.value)
                                      }
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flow-root flex-col">
                        <div className="m-0 text-xl font-bold text-gray-800 sm:text-xl">
                          Emergency Contact
                        </div>
                        <div
                          className={`relative w-[280px] leading-5 mb-[24px]`}
                        >
                          <div className={`w-full items-start self-stretch`}>
                            <div className={`gap-2 flex flex-row items-start `}>
                              <div
                                className={`w-full items-start self-stretch`}
                              >
                                <label className="text-sm font-medium leading-5 text-gray-700">
                                  Relation
                                </label>
                                <div className="w-[240px] ">
                                  <SingleSelectDropDown
                                    placeholder="-"
                                    showSearchBar={false}
                                    disabled={false}
                                    data={
                                      patientlookupData
                                        ? (patientlookupData?.smokingStatus as SingleSelectDropDownDataType[])
                                        : []
                                    } // relation
                                    selectedValue={smokingStatus}
                                    onSelect={(ss) => {
                                      setSmokingStatus(ss);
                                    }}
                                    isOptional={true}
                                    onDeselectValue={() => {
                                      setSmokingStatus(undefined);
                                    }}
                                  />
                                </div>
                              </div>
                              <div
                                className={`w-full items-start self-stretch`}
                              >
                                <label className="text-sm font-medium leading-5 text-gray-700">
                                  First Name
                                </label>
                                <div className="h-[38px] w-[240px] ">
                                  <InputField
                                    value={relationfname || ''}
                                    placeholder="-"
                                    onChange={(evt) =>
                                      setRelationfName(evt.target.value)
                                    }
                                  />
                                </div>
                              </div>
                              <div
                                className={`w-full items-start self-stretch`}
                              >
                                <label className="text-sm font-medium leading-5 text-gray-700">
                                  Last Name
                                </label>
                                <div className="h-[38px] w-[240px] ">
                                  <InputField
                                    value={relationsName || ''}
                                    placeholder="-"
                                    onChange={(evt) =>
                                      setRelationsName(evt.target.value)
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="relative w-full ">
                          <div className="flex-col ">
                            <div
                              className={`mb-[16px] w-[1072px] h-[192px] rounded-md border-2 bg-gray-200 py-[16px] ${
                                emgAddressValidatedOn
                                  ? 'border-green-600'
                                  : 'border-gray-300'
                              }`}
                            >
                              <div className="flex h-full">
                                <div className="px-[16px]">
                                  <div
                                    className={`relative flex flex-col items-start gap-6 text-gray-700 leading-6 text-left font-bold w-full h-full `}
                                  >
                                    <div
                                      className={`gap-2 flex flex-row items-start`}
                                    >
                                      <div
                                        className={`w-full items-start self-stretch`}
                                      >
                                        <label className="text-sm font-medium leading-5 text-gray-700">
                                          Address 1
                                          <label className="text-sm font-medium leading-5 text-gray-700"></label>
                                        </label>
                                        <div className="h-[38px] w-[372px]">
                                          <InputField
                                            value={relationAddress1 || ''}
                                            placeholder="Ex.: 142 Palm Avenue"
                                            onChange={(evt) =>
                                              setRelationAddress1(
                                                evt.target.value
                                              )
                                            }
                                          />
                                        </div>
                                      </div>
                                      <div
                                        className={`w-full items-start self-stretch`}
                                      >
                                        <label className="text-sm font-medium leading-5 text-gray-700">
                                          Address 2
                                        </label>
                                        <div className="h-[38px] w-[372px] ">
                                          <InputField
                                            value={relationAddress2 || ''}
                                            placeholder="-"
                                            onChange={(evt) =>
                                              setRelationAddress2(
                                                evt.target.value
                                              )
                                            }
                                          />
                                        </div>
                                      </div>
                                    </div>
                                    <div
                                      className={`gap-2 flex flex-row items-start`}
                                    >
                                      <div
                                        className={`w-full items-start self-stretch`}
                                      >
                                        <label className="text-sm font-medium leading-5 text-gray-900">
                                          City
                                        </label>
                                        <div className="h-[38px] w-[240px]">
                                          <InputField
                                            value={relationCity || ''}
                                            placeholder="Ex.: Tampa"
                                            onChange={(evt) =>
                                              setRelationCity(evt.target.value)
                                            }
                                          />
                                        </div>
                                      </div>
                                      <div
                                        className={`w-full items-start self-stretch`}
                                      >
                                        <label className="text-sm font-medium leading-5 text-gray-900">
                                          State
                                        </label>
                                        <div className="w-[240px] ">
                                          <SingleSelectDropDown
                                            placeholder="-"
                                            showSearchBar={false}
                                            disabled={false}
                                            data={
                                              patientlookupData
                                                ? (patientlookupData?.states as SingleSelectDropDownDataType[])
                                                : []
                                            }
                                            selectedValue={relationState}
                                            onSelect={(selectedSubState) => {
                                              setRelationState(
                                                selectedSubState
                                              );
                                            }}
                                            isOptional={true}
                                            onDeselectValue={() => {
                                              setRelationState(undefined);
                                            }}
                                          />
                                        </div>
                                      </div>
                                      <div
                                        className={`w-full items-start self-stretch`}
                                      >
                                        <label className="text-sm font-medium leading-5 text-gray-700">
                                          ZIP Code
                                        </label>
                                        <div className="h-[38px] w-[120px]">
                                          <InputField
                                            value={relationZip || ''}
                                            placeholder="-"
                                            maxLength={5}
                                            onChange={(evt) => {
                                              const inputValue =
                                                evt.target.value;
                                              const numericValue =
                                                inputValue.replace(/\D/g, ''); // Remove non-numeric characters
                                              const limitedValue =
                                                numericValue.slice(0, 5); // Limit to 5 characters

                                              setRelationZip(limitedValue);
                                            }}
                                          />
                                        </div>
                                      </div>
                                      <div
                                        className={`w-full items-start self-stretch`}
                                      >
                                        <label className="text-sm font-medium leading-5 text-gray-700">
                                          Extension
                                        </label>
                                        <div className="h-[38px] w-[120px] ">
                                          <InputField
                                            value={relationExtension || ''}
                                            maxLength={4}
                                            placeholder="-"
                                            onChange={(evt) => {
                                              const inputValue =
                                                evt.target.value;
                                              const numericValue =
                                                inputValue.replace(/\D/g, ''); // Remove non-numeric characters
                                              const limitedValue =
                                                numericValue.slice(0, 4); // Limit to 4 characters

                                              setRelationExtension(
                                                limitedValue
                                              );
                                            }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="pr-[16px] ">
                                  <div
                                    className={`w-[1px] h-full bg-gray-300`}
                                  />
                                </div>
                                <div className="self-center px-[16px]">
                                  <div
                                    className={`w-full items-start self-stretch `}
                                  >
                                    {catogary !== 'patient emergency address' &&
                                    !emgAddressValidatedOn ? (
                                      <Button
                                        buttonType={ButtonType.primary}
                                        cls={`inline-flex ml-[16px] !justify-center w-[203px] h-[38px] gap-2 mt-[30px]`}
                                        onClick={() => {
                                          if (
                                            !relationAddress1 ||
                                            !relationZip ||
                                            relationZip === ''
                                          ) {
                                            setStatusModalState({
                                              ...statusModalState,
                                              open: true,
                                              heading: 'Alert',
                                              description:
                                                'To use the Validate Address feature, you must enter the Address 1 and Zip Code fields. Please check that these fields are filled out correctly before submitting.',
                                              okButtonText: 'Ok',
                                              statusModalType:
                                                StatusModalType.WARNING,
                                              showCloseButton: false,
                                              closeOnClickOutside: false,
                                            });
                                          } else {
                                            setCatogary(
                                              'patient emergency address'
                                            );
                                            onValidateAddress(
                                              relationAddress1,
                                              relationZip,
                                              'patient emergency address',
                                              selectedPatientID
                                            );
                                          }
                                        }}
                                      >
                                        <Icon
                                          name={'verified'}
                                          size={18}
                                          color={IconColors.WHITE_S}
                                        />
                                        <p
                                          className={`text-justify text-sm text-white`}
                                        >
                                          Validate Address
                                        </p>
                                      </Button>
                                    ) : (
                                      <div className="p-[16px]">
                                        <div className="inline-flex gap-2">
                                          <Icon name={'greenCheck'} size={18} />
                                          <p
                                            className={` text-sm text-green-600 font-bold`}
                                          >
                                            Validate Address
                                          </p>
                                        </div>

                                        <p className="text-sm text-gray-700">
                                          Validated On:{' '}
                                          {emgAddressValidatedOn ||
                                            validateAddressData.validateOn}
                                        </p>
                                        <div
                                          className="cursor-pointer text-sm text-cyan-500 underline"
                                          onClick={() => {
                                            if (
                                              !relationAddress1 ||
                                              !relationZip ||
                                              relationZip === ''
                                            ) {
                                              setStatusModalState({
                                                ...statusModalState,
                                                open: true,
                                                heading: 'Alert',
                                                description:
                                                  'To use the Validate Address feature, you must enter the Address 1 and Zip Code fields. Please check that these fields are filled out correctly before submitting.',
                                                okButtonText: 'Ok',
                                                statusModalType:
                                                  StatusModalType.WARNING,
                                                showCloseButton: false,
                                                closeOnClickOutside: false,
                                              });
                                            } else {
                                              setCatogary(
                                                'patient emergency address'
                                              );
                                              onValidateAddress(
                                                relationAddress1,
                                                relationZip,
                                                'patient emergency address',
                                                selectedPatientID
                                              );
                                            }
                                          }}
                                        >
                                          Run Validate Address Again
                                        </div>
                                      </div>
                                    )}
                                    <>
                                      <Modal
                                        open={isValidateAddressOpen}
                                        onClose={() => {
                                          setIsValidateAddressOpen(false);
                                        }}
                                        modalContentClassName="rounded-lg bg-gray-100  text-left shadow-xl  h-[464px] w-[960px]"
                                      >
                                        <div className="m-5 text-gray-700">
                                          <SectionHeading
                                            label={'Validate Address'}
                                          />
                                          <div className="flex items-center justify-end gap-5">
                                            <CloseButton
                                              onClick={() => {
                                                setIsValidateAddressOpen(false);
                                              }}
                                            />
                                          </div>
                                        </div>
                                        <div className=" bg-gray-100">
                                          <p className="ml-[24px] flex h-[20px] w-[480px] text-sm font-normal leading-5">
                                            Select the verified values you want
                                            to apply to the address
                                          </p>
                                        </div>
                                        <>
                                          <div
                                            className={` text-gray-700 leading-6 font-bold ml-[27px]`}
                                          ></div>
                                          <div className="mx-[24px] mt-[16px]">
                                            <SearchDetailGrid
                                              checkboxSelection={true}
                                              hideHeader={true}
                                              hideFooter={true}
                                              columns={ValidationCol}
                                              rows={updatedAddressValidationrow}
                                              selectRows={updatedAddressValidationrow
                                                .filter((row) => row.checked)
                                                .map((row) => row.id)}
                                            />
                                          </div>
                                        </>
                                        <div className="mt-[44px] ">
                                          <div
                                            className={`h-[86px] bg-gray-200 rounded-lg`}
                                          >
                                            <div className="w-full">
                                              <div className="h-px w-full bg-gray-300" />
                                            </div>
                                            <div className="py-[24px] pr-[27px]">
                                              <div
                                                className={`gap-4 flex justify-end `}
                                              >
                                                <div>
                                                  <Button
                                                    buttonType={
                                                      ButtonType.secondary
                                                    }
                                                    cls={` `}
                                                    onClick={() => {
                                                      setIsValidateAddressOpen(
                                                        false
                                                      );
                                                    }}
                                                  >
                                                    {' '}
                                                    Cancel
                                                  </Button>
                                                </div>
                                                <div>
                                                  <Button
                                                    buttonType={
                                                      ButtonType.primary
                                                    }
                                                    cls={` `}
                                                    onClick={() => {
                                                      setIsValidateAddressOpen(
                                                        false
                                                      );
                                                      handleButtonClick();
                                                    }}
                                                  >
                                                    {' '}
                                                    Apply Selected Values to
                                                    Patient Address
                                                  </Button>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </Modal>
                                    </>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row gap-4">
                        <div className={` items-start self-stretch`}>
                          <label className="text-sm font-medium leading-5 text-gray-900">
                            Phone
                          </label>
                          <div className="relative flex gap-2 ">
                            <div className="h-[38px] w-[240px] ">
                              <div
                                className={classNames(
                                  `h-[38px] mt-1 border-solid border border-gray-300 gap-2 inline-flex items-center rounded-md text-gray-900 leading-5 text-left font-normal px-[10px] pt-[9px] pb-[9px] w-full overflow-clip font-['Nunito'] bg-white`
                                )}
                              >
                                <InputMask
                                  placeholder={'(000) 000-0000'}
                                  mask="(999) 999-9999"
                                  className={classNames(
                                    'flex w-full h-full text-black focus:outline-none items-center justify-center text-sm leading-5 self-center pr-2 bg-transparent'
                                  )}
                                  value={relationPhone || ''}
                                  onChange={(evt) => {
                                    const phoneNumber =
                                      evt.target.value === '(___) ___-____'
                                        ? ''
                                        : evt.target.value;
                                    setRelationPhone(phoneNumber);
                                  }}
                                />
                              </div>
                            </div>
                            <Button
                              buttonType={ButtonType.secondary}
                              cls={`h-[38px] w-[38px] justify-center mb-[8px] mt-[4px] bg-cyan-500 !px-2 !py-1 inline-flex gap-2 leading-5`}
                              disabled={true}
                            >
                              <Icon name={'phone'} size={14} />
                            </Button>
                          </div>
                        </div>
                        <div className={` items-start self-stretch`}>
                          <label className="text-sm font-medium leading-5 text-gray-900">
                            Email
                          </label>
                          <div className="h-[38px] w-[240px] ">
                            <InputField
                              value={relationEmail || ''}
                              placeholder="example@example.com"
                              onChange={(evt) =>
                                setRelationEmail(evt.target.value)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}{' '}
                </div>
                <div className="px-7 ">
                  {currentTab && currentTab.id === 2 && (
                    <>
                      <div className="w-full bg-gray-100 text-gray-700">
                        <div className="inline-flex w-full flex-col items-start justify-end space-y-6">
                          <div className="inline-flex w-full items-center justify-start">
                            <div className="inline-flex w-full">
                              <div className="text-xl font-bold leading-5 text-gray-700">
                                <div className="mr-[24px] inline-flex">
                                  <div className="mt-[50px] flex items-center">
                                    Patient Insurances
                                  </div>
                                </div>
                                <Button
                                  buttonType={ButtonType.primary}
                                  fullWidth={true}
                                  cls={`w-[159px] h-[38px] inline-flex !justify-center leading-loose`}
                                  style={{ verticalAlign: 'middle' }}
                                  onClick={() => {
                                    setIsInsuranceModalOpen(true);
                                    setIsViewInsuranceMode(false);
                                    setSelectedInsuranceGridRow(undefined);
                                  }}
                                >
                                  <p className="text-justify text-sm">
                                    Add New Insurance
                                  </p>
                                </Button>
                                <Button
                                  buttonType={ButtonType.primary}
                                  fullWidth={true}
                                  disabled={false}
                                  cls={`ml-[8px] w-[170px] h-[38px] inline-flex !justify-center gap-2 leading-loose`}
                                  style={{ verticalAlign: 'middle' }}
                                  onClick={() => {
                                    setIsInsuranceFinderModalOpen(true);
                                  }}
                                >
                                  <Icon name={'documentSearch'} size={18} />
                                  <p className="text-justify text-sm">
                                    Insurance Finder
                                  </p>
                                </Button>
                                <Modal
                                  open={isInsuranceFinderModalOpen}
                                  onClose={() => {
                                    setIsInsuranceFinderModalOpen(false);
                                  }}
                                  modalContentClassName="bg-gray-100 relative overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-[1404px] h-[551px] "
                                >
                                  <InsuranceFinder
                                    onClose={() => {
                                      setIsInsuranceFinderModalOpen(false);
                                    }}
                                    selectedPatientID={selectedPatientID}
                                    groupID={selectedRenderingGroup?.id}
                                    insuranceData={insuranceAllData || []}
                                  />
                                </Modal>
                                <Modal
                                  open={isInsuranceModalOpen}
                                  onClose={() => {
                                    setIsInsuranceModalOpen(false);
                                    setIsViewInsuranceMode(false);
                                  }}
                                  modalContentClassName="h-[calc(100%-80px)] w-[calc(100%-220px)] relative rounded-lg bg-white shadow-xl transition-all sm:my-8"
                                >
                                  <PatientInsurance
                                    onClose={() => {
                                      setIsInsuranceModalOpen(false);
                                      getPatientInsuranceData();
                                    }}
                                    selectedPatientID={selectedPatientID}
                                    groupID={
                                      selectedRenderingGroup?.id || undefined
                                    }
                                    selectedPatientInsuranceData={
                                      selectedInsuranceGridRow || null
                                    }
                                    onSelectSelf={(value: boolean) => {
                                      if (value === true) {
                                        setInsuranceSubscriberData(
                                          selectedPatientData
                                        );
                                      } else {
                                        setInsuranceSubscriberData(null);
                                      }
                                    }}
                                    insuranceSubscriberData={
                                      insuranceSubscriberData || null
                                    }
                                    isViewMode={isViewInsuranceMode}
                                  />
                                </Modal>
                              </div>
                            </div>
                          </div>
                          <div className="relative w-full text-sm leading-tight text-gray-500">
                            {!insuranceGridRows.length ? (
                              <div className="h-[40px] w-[372px]">
                                {`There are no insurance policies for this patient yet. To add an insurance policy, click the "Add New Insurance" button.`}
                              </div>
                            ) : (
                              <>
                                <div className="">
                                  <Tabs
                                    tabs={insuranceTabs}
                                    onChangeTab={(tab: any) => {
                                      setSelectedInsuranceTab(tab);
                                    }}
                                    currentTab={selectedInsuranceTab}
                                  />
                                </div>
                                <div
                                  className="pt-[24px] "
                                  style={{ height: '100%', width: '100%' }}
                                >
                                  <SearchDetailGrid
                                    checkboxSelection={false}
                                    hideHeader={true}
                                    hideFooter={true}
                                    columns={columns}
                                    rows={
                                      selectedInsuranceTab?.id === 1
                                        ? insuranceGridRows.filter(
                                            (m) => m.active === true
                                          )
                                        : insuranceGridRows.filter(
                                            (m) => m.active === false
                                          )
                                    }
                                    setHeaderRadiusCSS={true}
                                    // pinnedColumns={{
                                    //   right: ['actions'],
                                    // }}
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="px-7 ">
                  {currentTab && currentTab.id === 3 && (
                    <>
                      <div className="w-full bg-gray-100 text-gray-700">
                        <div className="inline-flex w-full flex-col items-start justify-end space-y-6">
                          <div className="inline-flex w-full  items-center justify-start">
                            <div className="inline-flex w-full">
                              <div className="text-xl font-bold leading-5 text-gray-700">
                                <div className="mr-[24px] inline-flex">
                                  {' '}
                                  Existing Guarantors List
                                </div>
                                <Button
                                  buttonType={ButtonType.primary}
                                  fullWidth={true}
                                  cls={`w-[170px] h-[38px] inline-flex  mt-[40px] !justify-center`}
                                  onClick={() => {
                                    setSelectedGaurGridRow(undefined);
                                    setIsGuarantorsModalOpen(true);
                                  }}
                                  data-testid="RegisterPatientGuarantorTabAddBtnTestId"
                                >
                                  <p className="text-justify text-sm  ">
                                    {' '}
                                    Add New Guarantor
                                  </p>
                                </Button>
                                <Modal
                                  open={isGuarantorsModalOpen}
                                  onClose={() => {
                                    setIsGuarantorsModalOpen(false);
                                    setIsViewGaurMode(false);
                                    setSelectedGaurGridRow(undefined);
                                    setIsEditMode(false);
                                    setGaurSubscriberData(null);
                                  }}
                                  modalContentClassName="bg-gray-100 relative overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all  "
                                >
                                  <PatientGarantor
                                    onClose={() => {
                                      setIsGuarantorsModalOpen(false);
                                      getPatientgaurantorData();
                                      setGaurSubscriberData(null);
                                    }}
                                    groupID={
                                      selectedRenderingGroup?.id
                                        ? selectedRenderingGroup?.id
                                        : null
                                    }
                                    selectedPatientID={selectedPatientID}
                                    selectedGaurData={
                                      selectedGaurGridRow || null
                                    }
                                    onSelectSelf={(value: boolean) => {
                                      if (value === true) {
                                        setGaurSubscriberData(
                                          selectedPatientData
                                        );
                                      } else {
                                        setGaurSubscriberData(null);
                                      }
                                    }}
                                    gaurSubscriberData={
                                      gaurSubscriberData || null
                                    }
                                    isViewMode={isViewGaurMode}
                                    isEditMode={isEditMode}
                                  />
                                </Modal>
                              </div>
                            </div>
                          </div>
                          <div className=" relative  w-full text-sm leading-tight text-gray-500">
                            {!guarantorsGridRows.length ? (
                              <div className="h-[40px] w-[372px]">
                                {' '}
                                {`There are no guarantor data for this patient yet. To add a guarantor, click the "Add New Guarantor" button.`}
                              </div>
                            ) : (
                              <div style={{ height: '100%', width: '1200px' }}>
                                <SearchDetailGrid
                                  checkboxSelection={false}
                                  hideHeader={true}
                                  hideFooter={true}
                                  columns={guarantorsCols}
                                  rows={guarantorsGridRows}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="px-7 ">
                  {currentTab && currentTab.id === 4 && (
                    <>
                      <div className="w-full bg-gray-100 text-gray-700">
                        <div className="inline-flex w-full flex-col items-start justify-end space-y-6">
                          <div className="inline-flex w-full items-center justify-start">
                            <div className="inline-flex w-full">
                              <div className="gap-2 text-xl font-bold leading-5 text-gray-700">
                                <div className="mt-[45px] mr-[24px] inline-flex">
                                  {' '}
                                  Patient’s Financial History
                                </div>
                                <ButtonDropdown
                                  buttonCls="!h-[38px] !w-[187px]"
                                  showIcon={false}
                                  disabled={
                                    financialData.financials?.length !== 0 &&
                                    financialData?.financials &&
                                    financialData?.financials[0]?.balance ===
                                      0 &&
                                    financialData?.financials[1] &&
                                    financialData?.financials[1]?.balance === 0
                                  }
                                  cls={`!w-[187px] h-[38px] ml-[10px] inline-flex !justify-center leading-loose`}
                                  popoverCls="!w-[187px]"
                                  buttonLabel="Export Financial History"
                                  dataList={[
                                    {
                                      id: 1,
                                      title: 'Export Report to CSV',
                                      showBottomDivider: false,
                                    },
                                  ]}
                                  onSelect={(value) => {
                                    if (value === 1) {
                                      ExportFinicialData();
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="relative mt-[24px]  w-full text-sm leading-tight text-gray-500">
                        {financialData?.financials &&
                        financialData?.lastPatientPaymentDate === null &&
                        financialData?.lastPatientStatementDate === null &&
                        financialData.financials[0]?.balance === 0 &&
                        financialData.financials[1]?.balance === 0 ? (
                          <div className="h-[20px] w-[372px]">
                            {' '}
                            {`There is no financial data for this patient yet.`}
                          </div>
                        ) : (
                          <>
                            <div>
                              <div className="w-full bg-gray-100 text-gray-700">
                                <div className="inline-flex w-full flex-col items-start justify-end space-y-6">
                                  <div className="inline-flex space-x-4">
                                    <div className="inline-flex w-56 items-start justify-start rounded-md border border-gray-300 bg-white p-4 shadow">
                                      <div className="inline-flex flex-1 flex-col items-start justify-start space-y-1">
                                        <p className="w-full text-base leading-normal text-gray-500">
                                          Last Patient Payment
                                        </p>
                                        <div className="inline-flex w-full items-end justify-start">
                                          <div className="flex flex-1 items-end justify-start space-x-2">
                                            <p className="text-xl font-bold leading-7 text-gray-500">
                                              {financialData.lastPatientPayment ||
                                              financialData.lastPatientPayment ===
                                                0
                                                ? currencyFormatter.format(
                                                    financialData.lastPatientPayment
                                                  )
                                                : ''}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="inline-flex w-56 items-start justify-start rounded-md border border-gray-300 bg-white p-4 shadow">
                                      <div className="inline-flex flex-1 flex-col items-start justify-start space-y-1">
                                        <p className="w-full text-base leading-normal text-gray-500">
                                          Last Pat. Payment Date
                                        </p>
                                        <div className="inline-flex w-full items-end justify-start">
                                          <div className="flex flex-1 items-end justify-start space-x-2">
                                            <p className="text-xl font-bold leading-7 text-gray-500">
                                              {' '}
                                              {
                                                financialData.lastPatientPaymentDate
                                              }
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="inline-flex space-x-4">
                                    <div className="inline-flex w-56 items-start justify-start rounded-md border border-gray-300 bg-white p-4 shadow">
                                      <div className="inline-flex flex-1 flex-col items-start justify-start space-y-1">
                                        <p className="w-full text-base leading-normal text-gray-500">
                                          Last Pat. Statement
                                        </p>
                                        <div className="inline-flex w-full items-end justify-start">
                                          <div className="flex flex-1 items-end justify-start space-x-2">
                                            <p className="text-xl font-bold leading-7 text-gray-500">
                                              {financialData.lastPatientStatement ||
                                              financialData.lastPatientStatement ===
                                                0
                                                ? currencyFormatter.format(
                                                    financialData.lastPatientStatement
                                                  )
                                                : ''}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="inline-flex w-56 items-start justify-start rounded-md border border-gray-300 bg-white p-4 shadow">
                                      <div className="inline-flex flex-1 flex-col items-start justify-start space-y-1">
                                        <p className="w-full text-base leading-normal text-gray-500">
                                          Last Pat. Statement Date
                                        </p>
                                        <div className="inline-flex w-full items-end justify-start">
                                          <div className="flex flex-1 items-end justify-start space-x-2">
                                            <p className="text-xl font-bold leading-7 text-gray-500">
                                              {
                                                financialData.lastPatientStatementDate
                                              }
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="inline-flex w-56 items-start justify-start rounded-md border border-gray-300 bg-white p-4 shadow">
                                      <div className="inline-flex flex-1 flex-col items-start justify-start space-y-1">
                                        <p className="w-full text-base leading-normal text-gray-500">
                                          Last Pat. Statement Days
                                        </p>
                                        <div className="inline-flex w-full items-end justify-start">
                                          <div className="flex flex-1 items-end justify-start space-x-2">
                                            <p className="text-xl font-bold leading-7 text-gray-500">
                                              {
                                                financialData.lastPatientStatementDays
                                              }
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="inline-flex w-56 items-start justify-start rounded-md border border-gray-300 bg-white p-4 shadow">
                                      <div className="inline-flex flex-1 flex-col items-start justify-start space-y-1">
                                        <p className="w-full text-base leading-normal text-gray-500">
                                          Last Pat. Statement Type
                                        </p>
                                        <div className="inline-flex w-full items-end justify-start">
                                          <div className="flex flex-1 items-end justify-start space-x-2">
                                            <p className="text-xl font-bold leading-7 text-gray-500">
                                              {financialData.lastPatientStatementType
                                                ? financialData.lastPatientStatementType
                                                : '-'}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="mt-[40px]">
                              <div style={{ height: '100%', width: '1100px' }}>
                                <SearchDetailGrid
                                  checkboxSelection={false}
                                  hideHeader={true}
                                  hideFooter={true}
                                  columns={finicialCols}
                                  rows={
                                    (financialData.financials &&
                                      financialData?.financials?.map((row) => {
                                        return { ...row, id: row.id };
                                      })) ||
                                    []
                                  }
                                />
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <div className="px-7">
                  {currentTab && currentTab.id === 5 && (
                    <>
                      <div className="w-full bg-gray-100 text-gray-700">
                        <div className="inline-flex w-full flex-col items-start justify-end space-y-6">
                          <div className="inline-flex w-full items-center justify-start">
                            <div className="inline-flex w-full">
                              <div className="text-xl font-bold leading-5 text-gray-700">
                                <div className="mr-[24px] inline-flex">
                                  <div className="mt-[50px] flex items-center">
                                    Advanced Payments Summary
                                  </div>
                                </div>
                                <Button
                                  buttonType={ButtonType.primary}
                                  fullWidth={true}
                                  cls={`w-[200px] h-[38px] inline-flex !justify-center leading-loose`}
                                  style={{ verticalAlign: 'middle' }}
                                  onClick={() => {
                                    setIsAddPaymentOpen(true);
                                  }}
                                >
                                  <p className="text-justify text-sm">
                                    Add Advanced Payment
                                  </p>
                                </Button>
                                {paymentLedgerRows?.patientAdvancePayments
                                  .length ? (
                                  <ButtonDropdown
                                    buttonCls="!h-[38px]"
                                    cls={`!w-[165px] h-[38px] ml-[10px] inline-flex !justify-center leading-loose`}
                                    popoverCls="!w-[172px]"
                                    buttonLabel="Export Report"
                                    dataList={[
                                      {
                                        id: 1,
                                        title: 'Export Report to PDF',
                                        showBottomDivider: false,
                                      },
                                      {
                                        id: 2,
                                        title: 'Export Report to CSV',
                                        showBottomDivider: false,
                                      },
                                    ]}
                                    onSelect={(value) => {
                                      // if (value === 1) {
                                      //   ExportData('pdf');
                                      // }
                                      if (value === 2) {
                                        ExportData();
                                      }
                                    }}
                                  />
                                ) : null}

                                <Modal
                                  open={isAddPaymentOpen}
                                  onClose={() => {
                                    setIsAddPaymentOpen(false);
                                  }}
                                  modalContentClassName="rounded-lg bg-gray-100 text-left shadow-xl "
                                >
                                  <AddAdvancePayement
                                    groupID={selectedPatientData?.groupID}
                                    selectedPatientID={selectedPatientID}
                                    onClose={() => setIsAddPaymentOpen(false)}
                                    refreshDate={() => {
                                      getPatientLedgerData();
                                    }}
                                  />
                                </Modal>
                              </div>
                            </div>
                          </div>
                          <div className="relative w-full text-sm leading-tight text-gray-500">
                            {!paymentLedgerRows?.patientAdvancePayments
                              .length ? (
                              <div className="h-[60px] w-[372px]">
                                {`There are no advanced payments data for this patient yet. To add an advanced payment, click the "Add Advanced Payment" button.`}
                              </div>
                            ) : (
                              <>
                                <div className="inline-flex space-x-4">
                                  <div className="inline-flex w-56 items-start justify-start rounded-md border border-gray-300 bg-white p-4 shadow">
                                    <div className="inline-flex flex-1 flex-col items-start justify-start space-y-1">
                                      <p className="w-full text-base leading-normal text-gray-500">
                                        With DoS
                                      </p>
                                      <div className="inline-flex w-full items-end justify-start">
                                        <div className="flex flex-1 items-end justify-start space-x-2">
                                          <p className="text-xl font-bold leading-7 text-gray-500">
                                            {paymentLedgerRows?.withDOSAmount
                                              ? currencyFormatter.format(
                                                  paymentLedgerRows?.withDOSAmount
                                                )
                                              : '-'}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="inline-flex w-56 items-start justify-start rounded-md border border-gray-300 bg-white p-4 shadow">
                                    <div className="inline-flex flex-1 flex-col items-start justify-start space-y-1">
                                      <p className="w-full text-base leading-normal text-gray-500">
                                        Without DoS
                                      </p>
                                      <div className="inline-flex w-full items-end justify-start">
                                        <div className="flex flex-1 items-end justify-start space-x-2">
                                          <p className="text-xl font-bold leading-7 text-gray-500">
                                            {paymentLedgerRows?.withoutDOSAmount
                                              ? currencyFormatter.format(
                                                  paymentLedgerRows?.withoutDOSAmount
                                                )
                                              : '-'}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="inline-flex w-56 items-start justify-start rounded-md border border-gray-300 bg-white p-4 shadow">
                                    <div className="inline-flex flex-1 flex-col items-start justify-start space-y-1">
                                      <p className="w-full text-base leading-normal text-gray-500">
                                        Total Advance Pay, Bal.
                                      </p>
                                      <div className="inline-flex w-full items-end justify-start">
                                        <div className="flex flex-1 items-end justify-start space-x-2">
                                          <p className="text-xl font-bold leading-7 text-gray-500">
                                            {paymentLedgerRows?.totalBalance
                                              ? currencyFormatter.format(
                                                  paymentLedgerRows?.totalBalance
                                                )
                                              : '-'}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="pt-[40px] pb-[16px] text-xl font-bold text-gray-500">
                                  Advanced Payments History Ledger
                                </div>
                                <div style={{ height: '100%', width: '100%' }}>
                                  <SearchDetailGrid
                                    checkboxSelection={false}
                                    hideHeader={true}
                                    hideFooter={true}
                                    columns={paymentHistoryCols}
                                    pinnedColumns={{
                                      right: ['action'],
                                    }}
                                    rows={
                                      paymentLedgerRows?.patientAdvancePayments.map(
                                        (row) => {
                                          return {
                                            ...row,
                                            id: row.paymentLedgerID,
                                          };
                                        }
                                      ) || []
                                    }
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="px-7">
                  {currentTab && currentTab.id === 6 && (
                    <>
                      <div className="text-xl font-bold leading-5 text-gray-700">
                        <div className="mr-[24px] inline-flex">
                          <div className="mt-[50px] flex items-center">
                            All Claims Associated With Patient
                          </div>
                        </div>
                      </div>
                      <div ref={gridRef} className="h-full">
                        <SearchDetailGrid
                          pageNumber={lastSearchDataCriteria.pageNumber}
                          pageSize={lastSearchDataCriteria.pageSize}
                          totalCount={totalCount}
                          rows={searchResult}
                          columns={claimsColumns}
                          onDetailPanelExpandedRowIdsChange={
                            handleDetailPanelExpandedRowIdsChange
                          }
                          detailPanelExpandedRowIds={detailPanelExpandedRowIds}
                          expandedRowContent={expandedRowContent}
                          checkboxSelection={false}
                          onPageChange={(page: number) => {
                            const obj = {
                              ...lastSearchDataCriteria,
                              pageNumber: page,
                            };
                            setLastSearchDataCriteria(obj);
                            getAllClaimsSearchData(obj);
                          }}
                          onSortChange={(
                            field: string | undefined,
                            sort: 'asc' | 'desc' | null | undefined
                          ) => {
                            if (searchResult.length) {
                              const obj = {
                                ...lastSearchDataCriteria,
                                sortColumn: field || '',
                                sortOrder: sort || '',
                              };
                              setLastSearchDataCriteria(obj);
                              getAllClaimsSearchData(obj);
                            }
                          }}
                          onPageSizeChange={(
                            pageSize: number,
                            page: number
                          ) => {
                            if (searchResult.length) {
                              const obj = {
                                ...lastSearchDataCriteria,
                                pageSize,
                                pageNumber: page,
                              };
                              setLastSearchDataCriteria(obj);
                              getAllClaimsSearchData(obj);
                            }
                          }}
                          setHeaderRadiusCSS={true}
                        />
                      </div>
                    </>
                  )}
                </div>
                <div className="px-7 ">
                  {currentTab && currentTab.id === 7 && (
                    <>
                      <div className="w-full bg-gray-100 text-gray-700">
                        <div className="inline-flex w-full flex-col items-start justify-end space-y-6">
                          <div className="inline-flex w-full items-center justify-start">
                            <div className="inline-flex w-full">
                              <div className="text-xl font-bold leading-5 text-gray-700">
                                <div className="mr-[24px] inline-flex">
                                  <div className="mt-[50px] flex items-center">
                                    Medical Case
                                  </div>
                                </div>
                                <Button
                                  buttonType={ButtonType.primary}
                                  fullWidth={true}
                                  cls={`w-[159px] h-[38px] inline-flex !justify-center leading-loose`}
                                  style={{ verticalAlign: 'middle' }}
                                  onClick={() => {
                                    setMedicalCaseModalOpen(true);
                                    setIsViewMedicalCaseMode(false);
                                    // setSelectedInsuranceGridRow(undefined);
                                  }}
                                >
                                  <p className="text-justify text-sm">
                                    Add New Case
                                  </p>
                                </Button>

                                <Modal
                                  open={isMedicalCaseModalOpen}
                                  onClose={() => {
                                    // setMedicalCaseModalOpen(false);
                                    // setIsViewMedicalCaseMode(false);
                                  }}
                                  modalContentClassName="h-[calc(100%-80px)] w-[calc(100%-220px)] relative rounded-lg bg-white shadow-xl transition-all sm:my-8"
                                >
                                  <MedicalCase
                                    onClose={() => {
                                      setMedicalCaseModalOpen(false);
                                      getPatientMedicalCaseData();
                                      // getPatientInsuranceData();
                                    }}
                                    selectedPatientID={selectedPatientID}
                                    groupID={
                                      selectedRenderingGroup?.id || undefined
                                    }
                                    isViewMode={isViewMedicalCaseMode}
                                    medicalCaseID={selectedMedicalCaseID}
                                  />
                                </Modal>
                              </div>
                            </div>
                          </div>
                          <div className="relative w-full text-sm leading-tight text-gray-500">
                            {!medicalCaseRowData.length ? (
                              <div className="h-[40px] w-[372px]">
                                {`There are no insurance policies for this patient yet. To add an insurance policy, click the "Add New Insurance" button.`}
                              </div>
                            ) : (
                              <>
                                <div className="">
                                  {medicalCaseTabs.length && (
                                    <Tabs
                                      tabs={medicalCaseTabs}
                                      onChangeTab={(tab: any) => {
                                        setSelectedMedicalCaseTab(tab);
                                      }}
                                      currentTab={selectedMedicalCaseTab}
                                    />
                                  )}
                                </div>
                                <div
                                  className="pt-[24px] "
                                  style={{ height: '100%', width: '100%' }}
                                >
                                  <SearchDetailGrid
                                    checkboxSelection={false}
                                    hideHeader={true}
                                    hideFooter={true}
                                    persistLayoutId={38}
                                    columns={MedicalCaseColumns}
                                    rows={
                                      selectedMedicalCaseTab?.id === 0
                                        ? medicalCaseRowData
                                            .filter(
                                              (m) => m.caseStatusCode === 'O'
                                            )
                                            ?.map((row) => {
                                              return {
                                                ...row,
                                                id: row.medicalCaseID,
                                              };
                                            }) || []
                                        : medicalCaseRowData
                                            .filter(
                                              (m) => m.caseStatusCode === 'C'
                                            )
                                            ?.map((row) => {
                                              return {
                                                ...row,
                                                id: row.medicalCaseID,
                                              };
                                            }) || []
                                    }
                                    setHeaderRadiusCSS={true}
                                    pinnedColumns={{
                                      right: ['actions'],
                                    }}
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="px-7 ">
                  {currentTab && currentTab.id === 8 && (
                    <>
                      <div
                        className=" inline-flex flex-col items-start justify-end space-y-6"
                        style={{ width: 401, height: 102 }}
                      >
                        <div
                          className="mb-[24px] inline-flex  items-center justify-start"
                          style={{ width: 401, height: 38 }}
                        >
                          <div className="inline-flex text-xl font-bold leading-5 text-gray-700">
                            <div className="mt-[10px] w-[390px]">
                              {' '}
                              Patient Documents List
                            </div>
                            <div className={`w-full items-start self-stretch `}>
                              <Button
                                buttonType={ButtonType.primary}
                                cls={`ml-[16px] !justify-center h-[38px]`}
                                onClick={() => {
                                  setIsDocumentsOpen(true);
                                  setSelectedAttachmentType(undefined);
                                  setSelectedFile(undefined);
                                }}
                              >
                                <p className="text-justify text-sm ">
                                  {' '}
                                  Add New Document
                                </p>
                              </Button>
                            </div>
                            <Modal
                              open={isDocumentsOpen}
                              onClose={() => {
                                setIsDocumentsOpen(false);
                              }}
                              modalContentClassName="rounded-lg bg-gray-100 h-[325px] text-left shadow-xl "
                            >
                              <div className="w-[913px] ">
                                <div className="flex items-start justify-between gap-4 p-[14px]  ">
                                  <div className="flex h-[24px] gap-4 p-[24px] ">
                                    <p className="self-center text-xl font-bold leading-7 text-gray-700">
                                      Add New Document
                                    </p>
                                  </div>
                                  <div className=" flex items-center justify-end gap-5">
                                    <div className={``}></div>
                                    <div className="">
                                      <CloseButton
                                        onClick={() => {
                                          setIsDocumentsOpen(false);
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="mx-8 ">
                                  <div className="h-px w-full bg-gray-300" />
                                </div>
                                <div className="ml-[27px] mt-[15px]">
                                  <p className="flex h-[20px] w-[300px] text-sm font-normal leading-5">
                                    PNG, JPG, PDF, CSV up to 50MB
                                  </p>
                                  <div
                                    className={`gap-4 flex items-start mt-[16px] `}
                                  >
                                    <div className={`relative w-[280px]`}>
                                      <div
                                        className={`gap-2 flex items-end w-[280px] h-[62px]`}
                                      >
                                        <div className={`relative w-[280px]`}>
                                          <div
                                            className={`w-full items-start self-stretch`}
                                          >
                                            <label className="text-sm font-medium leading-5 text-gray-900">
                                              Attachment Type*
                                            </label>
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
                                                selectedValue={
                                                  selectedAttachmentType
                                                }
                                                onSelect={(value) => {
                                                  setSelectedAttachmentType(
                                                    value
                                                  );
                                                }}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div
                                      className={`relative gap-4 flex items-end`}
                                    >
                                      <div className={`relative w-[280px]`}>
                                        <div
                                          className={`w-full items-start gap-1 flex flex-col self-stretch`}
                                        >
                                          <label className="text-sm font-medium leading-5 text-gray-900">
                                            Select File*
                                          </label>
                                          <UploadFile
                                            onFileSelect={(e) => {
                                              const maxSize =
                                                e.size / 1024 / 1024;
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
                                            }}
                                            selectedFileName={
                                              selectedFile?.name
                                            }
                                            cls={'w-[280px] h-[38px] relative'}
                                          ></UploadFile>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-[49px] rounded-lg bg-gray-200 py-[24px] pr-[27px]">
                                  <div className={`gap-4 flex justify-end `}>
                                    <div>
                                      <Button
                                        buttonType={ButtonType.secondary}
                                        cls={` `}
                                        onClick={() => {
                                          setIsDocumentsOpen(false);
                                        }}
                                      >
                                        {' '}
                                        Cancel
                                      </Button>
                                    </div>
                                    <div>
                                      <Button
                                        buttonType={ButtonType.primary}
                                        cls={` `}
                                        onClick={() => {
                                          if (!selectedFile) {
                                            setChangeModalState({
                                              ...changeModalState,
                                              open: true,
                                              heading: 'Alert',
                                              statusModalType:
                                                StatusModalType.WARNING,
                                              description:
                                                'This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.',
                                            });
                                          } else {
                                            onUpload();
                                            setIsDocumentsOpen(false);
                                          }
                                        }}
                                      >
                                        {' '}
                                        Upload Document
                                      </Button>
                                      <StatusModal
                                        open={changeModalState.open}
                                        heading={changeModalState.heading}
                                        description={
                                          changeModalState.description
                                        }
                                        closeButtonText={'Ok'}
                                        statusModalType={
                                          changeModalState.statusModalType
                                        }
                                        showCloseButton={false}
                                        closeOnClickOutside={false}
                                        onChange={() => {
                                          setChangeModalState({
                                            ...changeModalState,
                                            open: false,
                                          });
                                        }}
                                      />
                                    </div>
                                    <div></div>
                                  </div>
                                </div>
                              </div>
                            </Modal>
                          </div>
                        </div>
                      </div>
                      {!documentData.length ? (
                        <div className="relative h-40 w-96 text-sm leading-tight text-gray-500">
                          {`There are currently no document for this patient. To add a document, click the "Add New Document" button.`}
                        </div>
                      ) : (
                        <>
                          <AppTable
                            cls="max-h-[400px]  "
                            renderHead={
                              <>
                                <AppTableRow cls="bg-gray-200">
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
                                    Created By{' '}
                                  </AppTableCell>
                                  <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                    Created On{' '}
                                  </AppTableCell>
                                  <AppTableCell cls="bg-cyan-50 !border !border-bottom !border-gray-200 !font-bold !py-2 !whitespace-nowrap !px-4">
                                    Action{' '}
                                  </AppTableCell>
                                </AppTableRow>
                              </>
                            }
                            renderBody={
                              <>
                                {documentData?.map((uploadDocRow) => (
                                  <AppTableRow key={uploadDocRow?.id}>
                                    <AppTableCell>{`#${uploadDocRow?.id}`}</AppTableCell>
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
                                                getDocumentDataByID();
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
                    </>
                  )}
                </div>
                <div className="inline-flex flex-col items-end justify-start space-y-4 shadow">
                  <ViewNotes
                    id={selectedPatientID || undefined}
                    noteType="patient"
                    groupID={selectedPatientData?.groupID}
                    btnCls={classNames(
                      'fixed bottom-[100px]',
                      // eslint-disable-next-line no-nested-ternary
                      isOpenNotePane
                        ? isMenuOpened
                          ? 'right-[32.5rem]'
                          : 'right-[32.5rem]'
                        : 'right-6'
                    )}
                    onOpen={() => {
                      setIsOpenNotePane(true);
                    }}
                    onClose={() => {
                      setIsOpenNotePane(false);
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="w-full pt-[120px]">
              <div className="absolute bottom-0  h-[79px] w-full bg-gray-200 ">
                <div className="w-full">
                  <div className="h-px w-full bg-gray-300" />
                </div>
                <div className=" py-[24px] pb-0 pr-[27px]">
                  <div className={`gap-4 flex justify-end `}>
                    <div>
                      <Button
                        buttonType={ButtonType.tertiary}
                        cls={` `}
                        onClick={() => {
                          if (searchResult.length) {
                            setStatusModalState({
                              ...statusModalState,
                              open: true,
                              heading: "Patient can't be deleted",
                              okButtonText: 'Okay',
                              okButtonColor: ButtonType.tertiary,
                              description:
                                'There are financial transactions associated to this record.',
                              statusModalType: StatusModalType.WARNING,
                              showCloseButton: false,
                              closeOnClickOutside: false,
                            });
                          } else {
                            setIsDelete(true);
                            setStatusModalState({
                              ...statusModalState,
                              open: true,
                              heading: 'Delete Patient Confirmation',
                              okButtonText: 'Yes, Delete Patient',
                              okButtonColor: ButtonType.tertiary,
                              description:
                                'Deleting a patient will permanently remove it from the system. Are you sure you want to proceed with this action?',
                              closeButtonText: 'Cancle',
                              statusModalType: StatusModalType.WARNING,
                              showCloseButton: true,
                              closeOnClickOutside: false,
                            });
                          }
                        }}
                      >
                        {' '}
                        Delete Profile
                      </Button>
                    </div>
                    <div>
                      <Button
                        buttonType={ButtonType.secondary}
                        cls={` `}
                        onClick={() => {
                          setIsClosed(true);
                          setStatusModalState({
                            ...statusModalState,
                            open: true,
                            heading: 'Alert',
                            okButtonText: 'Abandon changes',
                            description:
                              'There are unsaved changes on Patient profile. Do you want to move to patient search screen?',
                            closeButtonText: 'Stay',
                            statusModalType: StatusModalType.WARNING,
                            showCloseButton: true,
                            closeOnClickOutside: false,
                          });
                        }}
                      >
                        {' '}
                        Close
                      </Button>
                    </div>
                    <div>
                      <Button
                        buttonType={ButtonType.primary}
                        onClick={() => {
                          if (
                            !selectedRenderingGroup ||
                            !selectedPractice ||
                            !selectedFacility ||
                            !selectedPlaceOfService ||
                            !firstName ||
                            !lastName ||
                            !selectedGender ||
                            !dateofbirth ||
                            !address1 ||
                            !city ||
                            !state ||
                            !zip
                          ) {
                            setChangeModalState({
                              ...changeModalState,
                              open: true,
                              heading: 'Alert',
                              statusModalType: StatusModalType.WARNING,
                              description:
                                'This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.',
                            });
                            return;
                          }
                          const isValid = PatientRegisterationValidation();
                          if (isValid) {
                            onSavedProfile();
                          }
                        }}
                      >
                        {' '}
                        Save profile
                      </Button>
                      <StatusModal
                        open={changeModalState.open}
                        heading={changeModalState.heading}
                        description={changeModalState.description}
                        closeButtonText={'Ok'}
                        statusModalType={changeModalState.statusModalType}
                        showCloseButton={false}
                        closeOnClickOutside={false}
                        onChange={() => {
                          setChangeModalState({
                            ...changeModalState,
                            open: false,
                          });
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
      <>
        <Modal
          open={isTimeFrameHistory}
          onClose={() => {
            setIsTimeFrameHistory(false);
          }}
          modalContentClassName="rounded-lg bg-gray-100  text-left shadow-xl  h-full w-[1232px]"
        >
          <div className="m-5 mb-[30px] text-gray-700">
            <SectionHeading label={`Timeframe Details`} />
            <div className="flex items-center justify-end gap-5">
              <CloseButton
                onClick={() => {
                  setIsTimeFrameHistory(false);
                }}
              />
            </div>
            <div className="mt-[24px]">
              <div ref={gridRef} className="h-full">
                <SearchDetailGrid
                  checkboxSelection={false}
                  rows={
                    timeframerow.map((row) => {
                      return { ...row, id: row.claimID };
                    }) || []
                  }
                  columns={timeframeHistoryCols}
                />
              </div>
            </div>
          </div>
        </Modal>
        <Modal
          open={postingDateModel}
          onClose={() => {}}
          modalContentClassName="rounded-lg bg-gray-100  text-left shadow-xl  h-[200px] w-[300px] "
        >
          <div className="mx-[27px] flex h-[60px] items-center justify-between gap-4">
            <div className="h-[28px] w-full">
              <SectionHeading label="Add Posting date" isCollapsable={false} />
              <div className=" flex items-center justify-end gap-5">
                <CloseButton
                  onClick={() => {
                    setPostingDate('');
                    setPostingDateModel(false);
                  }}
                />
              </div>
            </div>
          </div>
          <div className="  bg-gray-100">
            <div className={`px-[27px] relative w-[280px] h-[60px] flex gap-2`}>
              <div className={`w-full items-start self-stretch`}>
                <label className="text-sm font-medium leading-5 text-gray-900">
                  Posting date
                </label>
                <div className="w-[144px]">
                  <AppDatePicker
                    placeholderText="mm/dd/yyyy"
                    cls=""
                    onChange={(date) => {
                      if (date) {
                        const as = DateToStringPipe(date, 1);
                        setPostingDate(as);
                      }
                    }}
                    selected={postingDate}
                  />
                </div>
              </div>
            </div>
            <div className="w-full pt-[25px]">
              <div className="h-[56px] w-full bg-gray-200 ">
                <div className="w-full">
                  <div className="h-px w-full bg-gray-300" />
                </div>
                <div className=" py-[7px] pr-[7px]">
                  <div className={`gap-4 flex justify-end `}>
                    <div>
                      <Button
                        buttonType={ButtonType.primary}
                        cls={` `}
                        onClick={async () => {
                          const dateRes = await fetchPostingDate(
                            postingDateCriteria
                          );
                          if (dateRes && dateRes.postingCheck === false) {
                            setChangeModalState({
                              ...changeModalState,
                              open: true,
                              heading: 'Error',
                              statusModalType: StatusModalType.ERROR,
                              description: dateRes.message,
                            });
                            return;
                          }
                          getReversepaymentResponse();
                          setPostingDate('');
                          setPostingDateModel(false);
                          getPatientLedgerData();
                        }}
                      >
                        {' '}
                        Done
                      </Button>
                    </div>
                    <div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
        <Modal
          open={showRefundPaymentModal}
          onClose={() => {
            setShowRefundPaymentModal(false);
          }}
          modalContentClassName="bg-gray-100 relative rounded-lg  text-left shadow-xl transition-all w-[560px] "
        >
          <div className="mx-[27px] flex h-[60px] items-center justify-between gap-4">
            <div className="h-[28px] w-full">
              <SectionHeading
                label={`Refund Payment (Balance: $${refundRemainingBalance})`}
                isCollapsable={false}
              />
              <div className=" flex items-center justify-end gap-5">
                <CloseButton
                  onClick={() => {
                    setShowRefundPaymentModal(false);
                  }}
                />
              </div>
            </div>
          </div>
          <div className="mt-[25px] w-full bg-gray-100">
            <div className={`px-[27px] relative w-full h-[62px] flex gap-4`}>
              <div className={`w-full`}>
                <label className="text-sm font-medium leading-5 text-gray-900">
                  Posting Date <span className="text-cyan-500">*</span>
                </label>
                <div className="relative top-[4px] w-full">
                  <AppDatePicker
                    placeholderText="mm/dd/yyyy"
                    cls=""
                    onChange={(date) => {
                      setRefundPaymentData({
                        ...refundPaymentData,
                        postingDate: date,
                      });
                    }}
                    selected={refundPaymentData.postingDate}
                  />
                </div>
              </div>
              <div className={`w-full`}>
                <label className="text-sm font-medium leading-5 text-gray-900">
                  Refund Amount <span className="text-cyan-500">*</span>
                </label>
                <div className="w-full">
                  <InputFieldAmount
                    placeholder="0.00"
                    showCurrencyName={false}
                    value={refundPaymentData.amount}
                    onChange={(evt) => {
                      const value = evt.target.value
                        ? Number(evt.target.value)
                        : 0;
                      setRefundPaymentData({
                        ...refundPaymentData,
                        amount: value,
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="pt-[48px]">
            <div className={`h-full bg-gray-200`}>
              <div className="w-full">
                <div className="h-px w-full bg-gray-300" />
              </div>
              <div className="py-[24px] pr-[27px]">
                <div className={`gap-4 flex justify-end `}>
                  <div>
                    <Button
                      buttonType={ButtonType.secondary}
                      cls={`w-[102px] `}
                      onClick={() => {
                        setShowRefundPaymentModal(false);
                      }}
                    >
                      {' '}
                      Cancel
                    </Button>
                  </div>
                  <div>
                    <Button
                      buttonType={ButtonType.primary}
                      onClick={() => {
                        if (
                          !refundPaymentData.postingDate ||
                          !refundPaymentData.amount
                        ) {
                          setChangeModalState({
                            ...changeModalState,
                            open: true,
                            heading: 'Alert',
                            statusModalType: StatusModalType.WARNING,
                            description:
                              'This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.',
                          });
                          return;
                        }
                        if ((refundPaymentData.amount || 0) <= 0) {
                          setChangeModalState({
                            ...changeModalState,
                            open: true,
                            heading: 'Alert',
                            statusModalType: StatusModalType.WARNING,
                            description:
                              'Refund Amount must be greater than zero.',
                          });
                          return;
                        }
                        if (
                          (refundPaymentData.amount || 0) >
                          (refundRemainingBalance
                            ? Number(refundRemainingBalance)
                            : 0)
                        ) {
                          setChangeModalState({
                            ...changeModalState,
                            open: true,
                            heading: 'Alert',
                            statusModalType: StatusModalType.WARNING,
                            description:
                              'Refund Amount must be less than or equal to Available Balance.',
                          });
                          return;
                        }
                        setStatusModalState({
                          ...statusModalState,
                          open: true,
                          heading: 'Refund Payment',
                          description: 'Are you sure to Post Refund?',
                          okButtonText: 'Yes',
                          closeButtonText: 'No',
                          statusModalType: StatusModalType.WARNING,
                          showCloseButton: true,
                          closeOnClickOutside: false,
                        });
                      }}
                    >
                      {' '}
                      Post Refund
                    </Button>
                  </div>
                </div>
                <div></div>
              </div>
            </div>
          </div>
        </Modal>
        <Modal
          open={isEditDos}
          onClose={() => {
            setIsEditDos(false);
          }}
          modalContentClassName="bg-gray-100 relative overflow-hidden rounded-lg  text-left shadow-xl transition-all w-[960px] h-[352px] "
        >
          <div>
            <div>
              <div className="mx-[27px] flex h-[60px] items-center justify-between gap-4">
                <div className="h-[28px] w-full">
                  <SectionHeading
                    label="Edit Advanced Payment DoS"
                    isCollapsable={false}
                  />
                  <div className=" flex items-center justify-end gap-5">
                    <CloseButton
                      onClick={() => {
                        setIsEditDos(false);
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-row ">
                <div className=" mt-[36px] bg-gray-100">
                  <div className="m-0 ml-[24px] text-xl font-bold text-gray-800 sm:text-xl">
                    Current DoS
                  </div>
                  <div
                    className={`px-[27px] relative w-[280px] h-[62px] flex gap-2`}
                  >
                    <div className={`w-full items-start self-stretch`}>
                      <label className="text-sm font-medium leading-5 text-gray-900">
                        DoS - From
                      </label>
                      <div className="w-[144px]">
                        <AppDatePicker
                          placeholderText="mm/dd/yyyy"
                          cls=""
                          disabled={true}
                          onChange={(date) => {
                            if (date) {
                              const as = DateToStringPipe(date, 1);
                              setDosLedger(as);
                            }
                          }}
                          selected={dosLedger}
                        />
                      </div>
                    </div>
                    <div className={`w-full items-start self-stretch`}>
                      <label className="text-sm font-medium leading-5 text-gray-900">
                        DoS - To
                      </label>
                      <div className="w-[144px]">
                        <AppDatePicker
                          placeholderText="mm/dd/yyyy"
                          cls=""
                          disabled={true}
                          onChange={(date) => {
                            if (date) {
                              const as = DateToStringPipe(date, 1);
                              setDosLedger(as);
                            }
                          }}
                          selected={dosLedger}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ml-[55px] mt-[98px]">
                  <Icon name={'arrow'} size={20} />
                </div>
                <div className="mt-[36px] bg-gray-100">
                  <div className="m-0 ml-[16px] text-xl font-bold text-gray-800 sm:text-xl">
                    New DoS
                  </div>
                  <div className="flex flex-col">
                    <div
                      className={`px-[16px] relative w-[280px] h-[62px] flex gap-2`}
                    >
                      <div className={`w-full items-start self-stretch`}>
                        <label className="text-sm font-medium leading-5 text-gray-900">
                          DoS - From
                        </label>
                        <div className="w-[144px]">
                          <AppDatePicker
                            testId="newDos"
                            placeholderText="mm/dd/yyyy"
                            cls=""
                            onChange={(date) => {
                              if (date) {
                                setDosData({
                                  ...DosData,
                                  dos: DateToStringPipe(date, 1),
                                });
                              }
                            }}
                            selected={StringToDatePipe(DosData.dos)}
                          />
                        </div>
                      </div>
                      <div className={`w-full items-start self-stretch`}>
                        <label className="text-sm font-medium leading-5 text-gray-900">
                          DoS - To
                        </label>
                        <div className="w-[144px]">
                          <AppDatePicker
                            placeholderText="mm/dd/yyyy"
                            cls=""
                            onChange={(date) => {
                              if (date) {
                                setDosData({
                                  ...DosData,
                                  dos: DateToStringPipe(date, 1),
                                });
                              }
                            }}
                            selected={StringToDatePipe(DosData.dos)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="ml-[16px] mt-[8px] flex h-5 items-center">
                      <input
                        data-testid="rem-id"
                        type="checkbox"
                        id="67"
                        className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                      />
                      <div className="ml-3 text-sm">
                        <label
                          htmlFor="67"
                          className="font-medium text-gray-700"
                        >
                          Leave DoS blank for this Advanced Payment
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-[48px]">
              <div className={`h-full bg-gray-200`}>
                <div className="w-full">
                  <div className="h-px w-full bg-gray-300" />
                </div>
                <div className="py-[24px] pr-[27px]">
                  <div className={`gap-4 flex justify-end `}>
                    <div>
                      <Button
                        buttonType={ButtonType.secondary}
                        cls={`w-[102px] `}
                        onClick={() => {
                          setIsEditDos(false);
                        }}
                      >
                        {' '}
                        Cancel
                      </Button>
                    </div>
                    <div>
                      <Button
                        buttonType={ButtonType.primary}
                        onClick={() => {
                          onApplyNewDos();
                        }}
                      >
                        {' '}
                        Apply New DoS
                      </Button>
                    </div>
                  </div>
                  <div></div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
        <LinkableClaimModal
          open={linkableClaimsModalData.open}
          criteria={linkableClaimsModalData.criteria}
          onClose={() => {
            setLinkableClaimsModal({
              open: false,
              criteria: {
                patientID: undefined,
                facilityID: undefined,
                patientInsuranceID: undefined,
                medicalCaseID: undefined,
              },
            });
          }}
        />
      </>
    </AppLayout>
  );
}
