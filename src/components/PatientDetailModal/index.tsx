import type { GridColDef } from '@mui/x-data-grid-pro';
import React, { useEffect, useRef, useState } from 'react';
import InputMask from 'react-input-mask';
import { useDispatch, useSelector } from 'react-redux';
import type { MultiValue, SingleValue } from 'react-select';
import { v4 as uuidv4 } from 'uuid';
import validator from 'validator';

import Icon from '@/components/Icon';
// eslint-disable-next-line import/no-cycle
import Tabs from '@/components/OrganizationSelector/Tabs';
import PageHeader from '@/components/PageHeader';
import AppDatePicker from '@/components/UI/AppDatePicker';
import Breadcrumbs from '@/components/UI/Breadcrumbs/breadcrumbs';
import Button, { ButtonType } from '@/components/UI/Button';
import CloseButton from '@/components/UI/CloseButton';
import InputField from '@/components/UI/InputField';
import RadioButton from '@/components/UI/RadioButton';
import SearchDetailGrid from '@/components/UI/SearchDetailGrid';
import SectionHeading from '@/components/UI/SectionHeading';
import type { SingleSelectDropDownDataType } from '@/components/UI/SingleSelectDropDown';
import SingleSelectDropDown from '@/components/UI/SingleSelectDropDown';
import type { StatusModalProps } from '@/components/UI/StatusModal';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import AppTable, {
  AppTableCell,
  AppTableRow,
  reOrderData,
} from '@/components/UI/Table';
import ViewNotes from '@/components/ViewNotes';
// eslint-disable-next-line import/no-cycle
import type { IcdData } from '@/screen/createClaim';
import { getselectdWorkGroupsIDsSelector } from '@/store/chrome/selectors';
import {
  addToastNotification,
  fetchAssignClaimToDataRequest,
  fetchFacilityDataRequest,
  fetchGroupDataRequest,
  fetchPracticeDataRequest,
  getLookupDropdownsRequest,
} from '@/store/shared/actions';
import {
  deletePatient,
  fetchActiveProvidersDropdownData,
  fetchInsuranceData,
  fetchPatientDataByID,
  getDuplicateWarning,
  getPatientLookup,
  icdSearchRequest,
  reSaveRegisterPatientDate,
  savePatient,
  validateDemographicAddress,
  validatePatientAddress,
} from '@/store/shared/sagas';
import {
  getExpandSideMenuSelector,
  getFacilityDataSelector,
  getGroupDataSelector,
  getLookupDropdownsDataSelector,
  getPracticeDataSelector,
} from '@/store/shared/selectors';
import type {
  ActiveProviderData,
  ClaimNotesData,
  DeletePatientResponseDate,
  FacilityData,
  GetDuplicateWarningCriteria,
  GetPatientRequestData,
  ICDSearchCriteria,
  ICDSearchOutput,
  LookupDropdownsData,
  PatientLookupDropdown,
  ProviderData,
  SavePatientRequestData,
  ValidateAddressDataType,
  ValidateDemographicResponseDate,
} from '@/store/shared/types';
import { ToastType } from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';
import {
  DateToStringPipe,
  StringToDatePipe,
} from '@/utils/dateConversionPipes';
import useOnceEffect from '@/utils/useOnceEffect';

import AdvancePaymentTab from '../PatientDetailsTabs/AdvancePaymentTab';
// eslint-disable-next-line import/no-cycle
import PatientClaimsTab from '../PatientDetailsTabs/ClaimsTab';
import DocumentsTab from '../PatientDetailsTabs/DocumentsTab';
import PatientFinancialsTab from '../PatientDetailsTabs/FinancialsTab';
import PatientGuarantorTab from '../PatientDetailsTabs/GuarantorsTab';
import PatientInsuranceTab from '../PatientDetailsTabs/InsuranceTab';
// eslint-disable-next-line import/no-cycle
import MedicalCaseTab from '../PatientDetailsTabs/MedicalCaseTab';
import Modal from '../UI/Modal';
import type { MultiSelectGridDropdownDataType } from '../UI/MultiSelectGridDropdown';
import type { SingleSelectGridDropdownDataType } from '../UI/SingleSelectGridDropdown';
import SingleSelectGridDropDown from '../UI/SingleSelectGridDropdown';

interface Tprops {
  selectedPatientID: number | null;
  isPopup?: boolean;
  onCloseModal: () => void;
  onSave: (value: number) => void;
}
interface IcdDataa {
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
export default function PatientDetailModal({
  selectedPatientID,
  onCloseModal,
  isPopup,
  onSave,
}: //
Tprops) {
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
  const [category, setCatogary] = useState<string>('');
  const [isValidateAddressOpen, setIsValidateAddressOpen] =
    useState<boolean>(false);
  const [isDemographicVerifier, setIsDemographicVerifier] =
    useState<boolean>(false);

  const [activeCheck, setActiveCheck] = useState('Y');
  const [statementCheck, setStatementCheck] = useState('Y');
  const [groupData, setGroupData] = useState<
    SingleSelectDropDownDataType[] | undefined
  >();

  const practicesData = useSelector(getPracticeDataSelector);
  const facilityDropdownData = useSelector(getFacilityDataSelector);
  const [facilityData, setFacilityData] = useState<FacilityData[]>([]);
  const [patientlookupData, setPatientlookupData] =
    useState<PatientLookupDropdown>();
  // const ProviderData = useSelector(getProviderDataSelector);
  const [providerData, setProviderData] = useState<ActiveProviderData[]>([]);
  const GroupAPIData = useSelector(getGroupDataSelector);
  const selectedWorkedGroup = useSelector(getselectdWorkGroupsIDsSelector);

  const [rendringProviderData, setRendringProviderData] = useState<
    ProviderData[] | null
  >();
  const selectedWorkGroupData = useSelector(getselectdWorkGroupsIDsSelector);
  const [isJsonChanged, setIsJsonChanged] = useState(false);

  const [icdRows, setIcdRows] = useState<IcdDataa[]>([]);
  const [selectedICDs, setSelectedICDs] = useState<IcdDataa[]>([]);
  const initialPatientRequestData: GetPatientRequestData = {
    relationID: undefined,
    patientID: selectedPatientID || undefined,
    groupID: selectedWorkGroupData?.groupsData[0]?.id,
    practiceID: undefined,
    facilityID: undefined,
    posID: undefined,
    providerID: undefined,
    firstName: '',
    middleName: '',
    lastName: '',
    dob: '',
    genderID: 0,
    maritalStatusID: undefined,
    accountNo: '',
    active: false,
    eStatement: false,
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    zipCodeExtension: '',
    homePhone: '',
    workPhone: '',
    cellPhone: '',
    fax: '',
    email: '',
    raceID: undefined,
    ethnicityID: undefined,
    languageID: undefined,
    primaryCarePhysician: '',
    category: '',
    chartNo: '',
    licenseNo: '',
    employerName: '',
    deceaseDate: '',
    deceaseReason: '',
    emergencyRelation: '',
    emergencyFirstName: '',
    emergencyLastName: '',
    emergencyAddress1: '',
    emergencyAddress2: '',
    emergencyzipCodeExtension: '',
    emergencyCity: '',
    emergencyState: '',
    emergencyZipCode: '',
    emergencyTelephone: '',
    emergencyEmail: '',
    socialSecurityNumber: '',
    addressValidateOn: '',
    emgAddressValidateOn: '',
    demographicVerifiedOn: '',
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
  const [selectedPatientData, setSelectedPatientData] =
    useState<GetPatientRequestData>(initialPatientRequestData);
  useEffect(() => {
    if (facilityDropdownData?.length && selectedPatientData.practiceID) {
      setFacilityData(
        facilityDropdownData.filter(
          (m) => m.practiceID === selectedPatientData.practiceID
        )
      );
    }
  }, [facilityDropdownData, selectedPatientData.practiceID]);
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
        setSelectedPatientData({
          ...selectedPatientData,
          groupID: selectedWorkedGroup.groupsData[0]?.id,
        });
      }
    }
  }, [selectedWorkedGroup, groupData]);

  const [isDelete, setIsDelete] = useState<boolean>(false);
  const [isClosed, setIsClosed] = useState<boolean>(false);
  const [isDemoResponse, setIsDEmoResponse] = useState<boolean>(false);
  const allLookupsData = useSelector(getLookupDropdownsDataSelector);
  const [lookupsData, setLookupsData] = useState<LookupDropdownsData | null>(
    null
  );
  useEffect(() => {
    if (allLookupsData) {
      setLookupsData(allLookupsData);
    }
  }, [allLookupsData]);
  const [statusModalState, setStatusModalState] = useState<StatusModalProps>({
    open: false,
    heading: '',
    description: '',
    okButtonText: 'Ok',
    statusModalType: StatusModalType.ERROR,
    showCloseButton: false,
    closeOnClickOutside: false,
    confirmType: '',
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

  const formattedDateOfBirth = DateToStringPipe(selectedPatientData.dob, 1);
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

  const [demographicRows, setDemographicRows] = useState<
    {
      id: number;
      parameter: string;
      existingValue: string;
      verifiedValue: string;
      checked: boolean;
    }[]
  >();
  useEffect(() => {
    if (selectedPatientData) {
      setDemographicRows([
        {
          id: 1,
          parameter: 'First Name',
          existingValue: selectedPatientData.firstName || '-',
          verifiedValue:
            validateDemographicData.data?.correctedFirstname || '-',
          checked: false,
        },
        {
          id: 2,
          parameter: 'Middle Name',
          existingValue: selectedPatientData.middleName || '-',
          verifiedValue:
            validateDemographicData.data?.correctedMiddlename || '-',
          checked: false,
        },
        {
          id: 3,
          parameter: 'Last Name',
          existingValue: selectedPatientData.lastName || '-',
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
          existingValue:
            patientlookupData?.gender.filter(
              (m) => m.id === selectedPatientData.genderID
            )[0]?.value || '-',
          verifiedValue:
            validateDemographicData.data?.gender === 'm'
              ? 'Male'
              : 'Female' || '-',
          checked: false,
        },
        {
          id: 6,
          parameter: 'SSN',
          existingValue:
            selectedPatientData.socialSecurityNumber?.replace(/-/g, '') || '-',
          verifiedValue: validateDemographicData.data?.correctedSSN || '-',
          checked: false,
        },
        {
          id: 7,
          parameter: 'Address',
          existingValue: selectedPatientData.address1 || '-',
          verifiedValue: validateDemographicData.data?.correctedAddress || '-',
          checked: false,
        },
        {
          id: 8,
          parameter: 'City',
          existingValue: selectedPatientData.city || '-',
          verifiedValue: validateDemographicData.data?.correctedCity || '-',
          checked: false,
        },
        {
          id: 9,
          parameter: 'State',
          existingValue:
            patientlookupData?.states.filter(
              (m) => m.value === selectedPatientData.state
            )[0]?.value || '-',
          verifiedValue: validateDemographicData.data?.correctedState || '-',
          checked: false,
        },
        {
          id: 10,
          parameter: 'Zip Code',
          existingValue: selectedPatientData.zipCode || '-',
          verifiedValue: validateDemographicData.data?.correctedZip || '-',
          checked: false,
        },
        {
          id: 11,
          parameter: 'Cell Phone',
          existingValue: selectedPatientData.cellPhone || '-',
          verifiedValue: validateDemographicData.data?.phoneNumber || '-',
          checked: false,
        },
      ]);
    }
  }, [selectedPatientData]);
  const setUpdateDemographicrows = () => {
    let gender = '';
    if (validateDemographicData.data?.gender === 'm') {
      gender = 'Male';
    } else if (validateDemographicData.data?.gender === 'f') {
      gender = 'Female';
    } else {
      gender = 'Not Specified';
    }
    setSelectedPatientData({
      ...selectedPatientData,
      firstName: validateDemographicData.data?.correctedFirstname || '',
      middleName: validateDemographicData.data?.correctedMiddlename || '',
      lastName: validateDemographicData.data?.correctedLastname || '',
      dob: validateDemographicData.data?.correctedDOB || '',
      address1: validateDemographicData.data?.correctedAddress || '',
      socialSecurityNumber: validateDemographicData.data?.correctedSSN || '',
      cellPhone: validateDemographicData.data?.phoneNumber || '',
      genderID:
        patientlookupData?.gender.filter((m) => m.value === gender)[0]?.id || 0,
      city: validateDemographicData.data?.correctedCity || '',
      state:
        patientlookupData?.states.filter(
          (m) => m.value === validateDemographicData.data?.correctedState
        )[0]?.code || '',
      zipCode: validateDemographicData.data?.correctedZip || '',
    });
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
        category === 'patient address'
          ? selectedPatientData.address1
          : selectedPatientData.emergencyAddress1 || '-',
      verifiedValue: validateAddressData.address1 || '-',
      checked: false,
    },
    {
      id: 2,
      parameter: 'Address 2',
      existingValue:
        category === 'patient address'
          ? selectedPatientData.address2
          : selectedPatientData.emergencyAddress2 || '-',
      verifiedValue: validateAddressData.address2 || '-',
      checked: false,
    },
    {
      id: 3,
      parameter: 'Extension',
      existingValue:
        category === 'patient address'
          ? selectedPatientData.zipCodeExtension
          : selectedPatientData.emergencyzipCodeExtension || '-',
      verifiedValue: validateAddressData.zipPlus4 || '-',
      checked: false,
    },
    {
      id: 4,
      parameter: 'City',
      existingValue:
        category === 'patient address'
          ? selectedPatientData.city
          : selectedPatientData.emergencyCity || '-',
      verifiedValue: validateAddressData.city || '-',
      checked: false,
    },
    {
      id: 5,
      parameter: 'State',
      existingValue:
        category === 'patient address'
          ? patientlookupData?.states.filter(
              (m) => m.value === selectedPatientData.state
            )[0]?.value
          : patientlookupData?.states.filter(
              (m) => m.value === selectedPatientData.emergencyState
            )[0]?.value || '-',
      verifiedValue: validateAddressData.state || '-',
      checked: false,
    },
    {
      id: 6,
      parameter: 'ZIP Code',
      existingValue:
        category === 'patient address'
          ? selectedPatientData.zipCode
          : selectedPatientData.emergencyZipCode || '-',
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
    if (category === 'patient address') {
      setSelectedPatientData({
        ...selectedPatientData,
        address1: validateAddressData.address1,
        address2: validateAddressData.address2,
        state:
          patientlookupData?.states.filter(
            (m) => m.value === validateAddressData.state
          )[0]?.value || '',
        zipCode: validateAddressData.zip,
        zipCodeExtension: validateAddressData.zipPlus4,
        city: validateAddressData.city,
      });
    }
    if (category === 'patient emergency address') {
      setSelectedPatientData({
        ...selectedPatientData,
        emergencyAddress1: validateAddressData.address1,
        emergencyAddress2: validateAddressData.address2,
        emergencyState:
          patientlookupData?.states.filter(
            (m) => m.value === validateAddressData.state
          )[0]?.value || '',
        emergencyZipCode: validateAddressData.zip,
        emergencyzipCodeExtension: validateAddressData.zipPlus4,
        emergencyCity: validateAddressData.city,
      });
    }
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
  const [maskedSsn, setMaskedSsn] = useState('');
  const [ssnUndo, setSsnUndo] = useState('');

  const handleInputChange = (event: any) => {
    let string = event.target.value;
    const regex = /^(\d{3})(\d{2})(\d{1,4})$/;
    const match = string.match(regex);

    if (match) {
      match.shift();
      string = match.join('-');
    }

    setSelectedPatientData({
      ...selectedPatientData,
      socialSecurityNumber: string,
    });
    setSsnUndo(string);
    setMaskedSsn(string);
  };

  const asterisk = () => {
    if (selectedPatientData.socialSecurityNumber) {
      const result = selectedPatientData.socialSecurityNumber.replace(
        /^(\d{3})[-]?(\d{2})[-]?(\d{1,4})$/g,
        '***-**-$3'
      );
      setMaskedSsn(result);
    }
  };

  const unasterisk = () => {
    setMaskedSsn(ssnUndo);
  };

  const [currentTab, setCurrentTab] = useState(tabs[0]);

  const [addressValidatedOn, setAddressValidatedOn] = useState<string | null>(
    null
  );
  const [emgAddressValidatedOn, setEmgAddressValidatedOn] = useState<
    string | null
  >(null);
  const [icdOrderCount, setIcdOrderCount] = useState(1);
  const searchIcds = async (value: IcdDataa, type: string) => {
    if (value.searchValue) {
      const res = await icdSearchRequest(value.searchValue);
      if (res) {
        setIcdRows((prevIcdRows) => {
          let updatedIcdRows: IcdDataa[] = [];

          const existingRowIndex = prevIcdRows.findIndex(
            (icdRow) => icdRow.order === value.order
          );

          if (existingRowIndex > -1) {
            updatedIcdRows = prevIcdRows.map((icdRow, index) => {
              if (index === existingRowIndex) {
                return {
                  ...icdRow,
                  searchValue: value.searchValue,
                  data: res, // Update with appropriate field from 'res'
                  selectedICDObj: type === 'auto' ? res[0] : undefined,
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
                selectedICDObj: type === 'auto' ? res[0] : undefined,
                description: res[0]?.appendText,
              },
            ];
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
        searchIcds(
          {
            icd10Code: icd.icd10Code,
            order: icd.order,
            searchValue: icd.searchValue,
          } as IcdDataa,
          'auto'
        )
      );
    }
  }, [selectedICDs]);

  const getRegisterPatientDataByID = async (id: number) => {
    const ress = await fetchPatientDataByID(id);
    if (ress) {
      const res: GetPatientRequestData = ress;
      const ssnn = res.socialSecurityNumber;
      if (ssnn) {
        const maskedValue = ssnn.replace(
          /^(\d{3})[-]?(\d{2})[-]?(\d{1,4})$/g,
          '***-**-$3'
        );
        setMaskedSsn(maskedValue);
        setSsnUndo(
          ssnn.replace(/^(\d{3})[-]?(\d{2})[-]?(\d{1,4})$/g, '$1-$2-$3')
        );
      }

      setSelectedPatientData({
        ...res,
        dob: res.dob ? res.dob.split('T')[0] || '' : '',
        deceaseDate: res.deceaseDate ? res.deceaseDate.split('T')[0] || '' : '',
      });
      setActiveCheck(res.active ? 'Y' : 'N');
      setStatementCheck(res.eStatement ? 'Y' : 'N');
      const newIcdRows: IcdDataa[] = [];

      if (res.icd1 !== null)
        newIcdRows.push({
          icd10Code: res.icd1,
          order: 1,
          searchValue: res.icd1,
        });
      if (res.icd2 !== null)
        newIcdRows.push({
          icd10Code: res.icd2,
          order: 2,
          searchValue: res.icd2,
        });
      if (res.icd3 !== null)
        newIcdRows.push({
          icd10Code: res.icd3,
          order: 3,
          searchValue: res.icd3,
        });
      if (res.icd4 !== null)
        newIcdRows.push({
          icd10Code: res.icd4,
          order: 4,
          searchValue: res.icd4,
        });
      if (res.icd5 !== null)
        newIcdRows.push({
          icd10Code: res.icd5,
          order: 5,
          searchValue: res.icd5,
        });
      if (res.icd6 !== null)
        newIcdRows.push({
          icd10Code: res.icd6,
          order: 6,
          searchValue: res.icd6,
        });
      if (res.icd7 !== null)
        newIcdRows.push({
          icd10Code: res.icd7,
          order: 7,
          searchValue: res.icd7,
        });
      if (res.icd8 !== null)
        newIcdRows.push({
          icd10Code: res.icd8,
          order: 8,
          searchValue: res.icd8,
        });
      if (res.icd9 !== null)
        newIcdRows.push({
          icd10Code: res.icd9,
          order: 9,
          searchValue: res.icd9,
        });
      if (res.icd10 !== null)
        newIcdRows.push({
          icd10Code: res.icd10,
          order: 10,
          searchValue: res.icd10,
        });
      if (res.icd11 !== null)
        newIcdRows.push({
          icd10Code: res.icd11,
          order: 11,
          searchValue: res.icd11,
        });
      if (res.icd12 !== null)
        newIcdRows.push({
          icd10Code: res.icd12,
          order: 12,
          searchValue: res.icd12,
        });

      setSelectedICDs(newIcdRows);

      setValidateAddressData({
        ...validateAddressData,
        validateOn: res.addressValidateOn,
      });
      setAddressValidatedOn(res.addressValidateOn);
      setEmgAddressValidatedOn(res.emgAddressValidateOn);
    }
  };

  const [isPatientDataFetched, setIsPatientDataFetched] = useState(false);
  useEffect(() => {
    if (
      selectedPatientID &&
      patientlookupData &&
      GroupAPIData &&
      practicesData &&
      providerData &&
      facilityData &&
      !isPatientDataFetched
    ) {
      getRegisterPatientDataByID(selectedPatientID);
      setIsPatientDataFetched(true);
    }
  }, [
    selectedPatientID,
    patientlookupData,
    GroupAPIData,
    practicesData,
    providerData,
    facilityData,
  ]);
  // useEffect(() => {
  //   if (selectedPatientID) {
  //     getPatientMedicalCaseData();
  //     // getPatientInsuranceData();
  //     // getPatientgaurantorData();
  //     // getPatientLedgerData();
  //     // getAllClaimsSearchData(lastSearchDataCriteria);
  //   }
  // }, [selectedPatientID]);

  /// icds section
  const icdTableRef = useRef<HTMLTableRowElement>(null);

  const [showAddICDRow, setshowAddICDRow] = useState(true);
  const [addICDDescription, setAddICDDescription] = useState<
    string | undefined
  >();
  const [selectedICDCode, setSelctedICDCode] = useState<
    SingleValue<SingleSelectGridDropdownDataType> | undefined
  >();

  const [dxCode, setdxCode] = useState<
    MultiValue<MultiSelectGridDropdownDataType> | []
  >([]);

  const startIndex = React.useRef<number | undefined>();
  const [dragOverIndex, setDragOverIndex] = useState<number | undefined>();
  const [icdSearch, setIcdSearch] = useState<ICDSearchCriteria>({
    searchValue: '',
  });
  const [icdSearchData, setIcdSearchData] = useState<ICDSearchOutput[]>([]);
  const getIcdSearch = async (text?: string) => {
    if (text) {
      const res = await icdSearchRequest(text);
      if (res) {
        setIcdSearchData(res);
      }
    }
  };

  useOnceEffect(() => {
    if (icdSearch.searchValue !== '') {
      getIcdSearch(icdSearch.searchValue);
    }
  }, [icdSearch.searchValue]);
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
  const fetchProviderDropdownData = async (groupID: number) => {
    const res = await fetchActiveProvidersDropdownData(groupID);
    if (res) {
      setProviderData(res);
    }
  };
  useEffect(() => {
    // if (selectedWorkedGroup && selectedWorkedGroup?.workGroupId) {
    //   const groupIds = selectedWorkedGroup.groupsData.map((m) => m.id);
    //   setInsuanceAllData(
    //     insuranceData.filter((m) => groupIds.includes(m.groupID))
    //   );
    // }
    if (selectedPatientData.groupID) {
      dispatch(
        fetchPracticeDataRequest({ groupID: selectedPatientData.groupID })
      );
      dispatch(
        fetchFacilityDataRequest({ groupID: selectedPatientData.groupID })
      );
      // setInsuanceAllData(
      //   insuranceData.filter((m) => m.groupID === selectedPatientData.groupID)
      // );
      fetchProviderDropdownData(selectedPatientData.groupID);
      // dispatch(
      //   fetchProviderDataRequest({ groupID: selectedPatientData.groupID })
      // );
      setSelectedInsurance(undefined);
    }
  }, [selectedPatientData.groupID]);

  const onSelectFacility = (value: SingleSelectDropDownDataType) => {
    const facilities = facilityData?.filter((m) => m.id === value.id)[0];
    if (facilities) {
      setSelectedPatientData({
        ...selectedPatientData,
        facilityID: value.id,
        posID: lookupsData?.placeOfService.filter(
          (m) => m.id === facilities.placeOfServiceID
        )[0]?.id,
      });
      setIsJsonChanged(true);
    }
  };

  useEffect(() => {
    if (providerData) {
      setRendringProviderData(providerData as ProviderData[]);
    }
  }, [providerData]);
  const checkDuplicateWarning = async (obj: GetDuplicateWarningCriteria) => {
    const res = await getDuplicateWarning(obj);

    if (res && res.length && res[0]?.id === 1) {
      setStatusModalState({
        ...statusModalState,
        open: true,
        heading: 'Duplicate Patient Warning!',
        description: res[0]?.message,
        okButtonText: 'Save Anyway',
        closeButtonText: 'Close',
        confirmType: 'dupe_warning',
        statusModalType: StatusModalType.WARNING,
        showCloseButton: true,
        closeOnClickOutside: false,
      });
      return false;
    }

    return !!res;
  };

  const onSavedProfile = async (skipDuplicateCheck: boolean) => {
    const socialnumber = selectedPatientData.socialSecurityNumber
      ? selectedPatientData.socialSecurityNumber.replace(/-/g, '')
      : '';
    const patientData: SavePatientRequestData = {
      patientID: selectedPatientID || null || undefined,
      groupID: selectedPatientData.groupID,
      practiceID: selectedPatientData.practiceID,
      facilityID: selectedPatientData.facilityID,
      posID: selectedPatientData.posID,
      providerID: selectedPatientData.providerID,
      firstName: selectedPatientData.firstName,
      middleName: selectedPatientData.middleName || '',
      lastName: selectedPatientData.lastName,
      dob: selectedPatientData.dob || null,
      genderID: selectedPatientData.genderID,
      maritalStatusID: selectedPatientData.maritalStatusID,
      accountNo: selectedPatientData.accountNo || '',
      active: activeCheck === 'Y',
      eStatement: statementCheck === 'Y',
      address1: selectedPatientData.address1,
      address2: selectedPatientData.address2 || '',
      city: selectedPatientData.city,
      state: selectedPatientData.state,
      zipCode: selectedPatientData.zipCode,
      zipCodeExtension: selectedPatientData.zipCodeExtension || '',
      homePhone: selectedPatientData.homePhone
        ? selectedPatientData.homePhone.replace(/-/g, '') || ''
        : '',
      workPhone: selectedPatientData.workPhone
        ? selectedPatientData.workPhone.replace(/-/g, '') || ''
        : '',
      cellPhone: selectedPatientData.cellPhone
        ? selectedPatientData.cellPhone.replace(/-/g, '') || ''
        : '',
      fax: selectedPatientData.fax || '',
      email: selectedPatientData.email || '',
      raceID: selectedPatientData.raceID,
      ethnicityID: selectedPatientData.ethnicityID,
      languageID: selectedPatientData.languageID,
      primaryCarePhysician: selectedPatientData.primaryCarePhysician || '',
      category: selectedPatientData.category || '',
      chartNo: selectedPatientData.chartNo || '',
      licenseNo: selectedPatientData.licenseNo || '',
      employerName: selectedPatientData.employerName || '',
      smokingStatusID: selectedPatientData.smokingStatusID,
      deceaseDate: selectedPatientData.deceaseDate, // decreseDate ? decreseDate?.toISOString().slice(0, 10) : null,
      deceaseReason: selectedPatientData.deceaseReason || '',
      emergencyRelation: selectedPatientData.emergencyRelation || '',
      emergencyFirstName: selectedPatientData.emergencyFirstName || '',
      emergencyLastName: selectedPatientData.emergencyLastName || '',
      emergencyAddress1: selectedPatientData.emergencyAddress1 || '',
      emergencyAddress2: selectedPatientData.emergencyAddress2 || '',
      emergencyZipCodeExtension:
        selectedPatientData.emergencyzipCodeExtension || '',
      emergencyCity: selectedPatientData.emergencyCity || '',
      emergencyState: selectedPatientData.emergencyState,
      emergencyZipCode: selectedPatientData.emergencyZipCode || '',
      emergencyTelephone: selectedPatientData.emergencyTelephone || '',
      emergencyEmail: selectedPatientData.emergencyEmail || '',
      socialSecurityNumber: socialnumber || '',
      validateIDS: validateAddressData.validateID
        ? [validateAddressData.validateID]
        : [],
      icd1:
        icdRows && icdRows.length > 0 && icdRows[0]?.icd10Code != null
          ? icdRows[0].icd10Code
          : null,
      icd2:
        icdRows && icdRows.length > 1 && icdRows[1]?.icd10Code != null
          ? icdRows[1].icd10Code
          : null,
      icd3:
        icdRows && icdRows.length > 2 && icdRows[2]?.icd10Code != null
          ? icdRows[2].icd10Code
          : null,
      icd4:
        icdRows && icdRows.length > 3 && icdRows[3]?.icd10Code != null
          ? icdRows[3].icd10Code
          : null,
      icd5:
        icdRows && icdRows.length > 4 && icdRows[4]?.icd10Code != null
          ? icdRows[4].icd10Code
          : null,
      icd6:
        icdRows && icdRows.length > 5 && icdRows[5]?.icd10Code != null
          ? icdRows[5].icd10Code
          : null,
      icd7:
        icdRows && icdRows.length > 6 && icdRows[6]?.icd10Code != null
          ? icdRows[6].icd10Code
          : null,
      icd8:
        icdRows && icdRows.length > 7 && icdRows[7]?.icd10Code != null
          ? icdRows[7].icd10Code
          : null,
      icd9:
        icdRows && icdRows.length > 8 && icdRows[8]?.icd10Code != null
          ? icdRows[8].icd10Code
          : null,
      icd10:
        icdRows && icdRows.length > 9 && icdRows[9]?.icd10Code != null
          ? icdRows[9].icd10Code
          : null,
      icd11:
        icdRows && icdRows.length > 10 && icdRows[10]?.icd10Code != null
          ? icdRows[10].icd10Code
          : null,
      icd12:
        icdRows && icdRows.length > 11 && icdRows[11]?.icd10Code != null
          ? icdRows[11].icd10Code
          : null,
    };
    let isNotDuplicate = true;
    if (!selectedPatientID && !skipDuplicateCheck) {
      isNotDuplicate = await checkDuplicateWarning({
        practiceID: selectedPatientData.practiceID || null,
        patientID: null,
        patientFirstName: selectedPatientData.firstName || '',
        patientLastName: selectedPatientData.lastName || '',
        patientDateOfBirth: selectedPatientData.dob || '',
        dos: '',
        cpt: '',
        checkDuplicateType: 'Patient',
        chargeDOS: '',
      });
    }
    let res;
    if (selectedPatientID) {
      res = await reSaveRegisterPatientDate(patientData);
    } else if (isNotDuplicate) {
      const resp = await savePatient(patientData);
      res = resp;
      if (resp) {
        onSave(resp.patientID);
      }
    }
    if (res) {
      onCloseModal();
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
      setIsJsonChanged(true);
      if (catogaryy === 'patient address') {
        setAddressValidatedOn(res.validateOn);
      } else {
        setEmgAddressValidatedOn(res.validateOn);
      }
      setIsValidateAddressOpen(true);
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
    } else if (res?.error === 'Invalid Zip Code.  ') {
      setStatusModalState({
        ...statusModalState,
        open: true,
        heading: 'Invalid Zip Code',
        description:
          'Sorry,  we couldnt find an address that matches the provided information. Please enter another Zip-code and try again.',
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
        selectedPatientData.groupID
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
        setIsJsonChanged(true);
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
    const todaysDate = new Date();
    todaysDate.setHours(0, 0, 0, 0);
    const ptDateofbirth = selectedPatientData.dob
      ? new Date(selectedPatientData.dob)
      : null;
    const ptDeasedDate = selectedPatientData.deceaseDate
      ? new Date(selectedPatientData.deceaseDate)
      : null;
    if (ptDateofbirth && ptDateofbirth > todaysDate) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'DOB should not be in future.',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (ptDeasedDate && ptDeasedDate > todaysDate) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Decease Date should not be in future.',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    const extensionV = /^\d{4}$/;
    const zipV = /^\d{5}$/;
    if (
      selectedPatientData.zipCodeExtension &&
      selectedPatientData.zipCodeExtension?.length > 0 &&
      !extensionV.test(selectedPatientData.zipCodeExtension)
    ) {
      dispatch(
        addToastNotification({
          text: 'Contact Info. extenstion must be consist of 4 digits',
          toastType: ToastType.ERROR,
          id: '',
        })
      );
      isValid = false;
    }
    if (
      selectedPatientData.zipCode &&
      selectedPatientData.zipCode?.length > 0 &&
      !zipV.test(selectedPatientData.zipCode)
    ) {
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
      selectedPatientData.emergencyzipCodeExtension &&
      selectedPatientData.emergencyzipCodeExtension?.length > 0 &&
      !extensionV.test(selectedPatientData.emergencyzipCodeExtension)
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
    if (
      selectedPatientData.emergencyZipCode &&
      selectedPatientData.emergencyZipCode?.length > 0 &&
      !zipV.test(selectedPatientData.emergencyZipCode)
    ) {
      dispatch(
        addToastNotification({
          text: 'Emergency contact  ZIP Code must be consist of 5 digits',
          toastType: ToastType.ERROR,
          id: '',
        })
      );
      isValid = false;
    }
    if (
      selectedPatientData.email &&
      selectedPatientData.email?.length > 0 &&
      !validator.isEmail(selectedPatientData.email)
    ) {
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
      selectedPatientData.emergencyEmail &&
      selectedPatientData.emergencyEmail?.length > 0 &&
      !validator.isEmail(selectedPatientData.emergencyEmail)
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
    if (
      selectedPatientData.homePhone &&
      selectedPatientData.homePhone.length > 0 &&
      !validatePhoneNumber(selectedPatientData.homePhone)
    ) {
      dispatch(
        addToastNotification({
          text: 'Home Phone number is invalid.',
          toastType: ToastType.ERROR,
          id: '',
        })
      );
      isValid = false;
    }

    if (
      selectedPatientData.workPhone &&
      selectedPatientData.workPhone.length > 0 &&
      !validatePhoneNumber(selectedPatientData.workPhone)
    ) {
      dispatch(
        addToastNotification({
          text: 'Work Phone number is invalid.',
          toastType: ToastType.ERROR,
          id: '',
        })
      );
      isValid = false;
    }

    if (
      selectedPatientData.cellPhone &&
      selectedPatientData.cellPhone.length > 0 &&
      !validatePhoneNumber(selectedPatientData.cellPhone)
    ) {
      dispatch(
        addToastNotification({
          text: 'Cell Phone number is invalid.',
          toastType: ToastType.ERROR,
          id: '',
        })
      );
      isValid = false;
    }

    if (
      selectedPatientData.fax &&
      selectedPatientData.fax.length > 0 &&
      !validatePhoneNumber(selectedPatientData.fax)
    ) {
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
      selectedPatientData.emergencyTelephone &&
      selectedPatientData.emergencyTelephone.length > 0 &&
      !validatePhoneNumber(selectedPatientData.emergencyTelephone)
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
    if (res && res.id === 1) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: `Successfully Deleted patient`,
          toastType: ToastType.SUCCESS,
        })
      );
      onCloseModal();
    }
    if (res && res.id === 3) {
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
    if (res && res.id === 2) {
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
    }
  };
  return (
    <>
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
            confirmType: '',
          });
        }}
        onChange={() => {
          if (statusModalState.confirmType === 'dupe_warning') {
            onSavedProfile(true);
          }
          setStatusModalState({
            ...statusModalState,
            open: false,
            confirmType: '',
          });
          // if (showRefundPaymentModal) {
          //   onRefundPayment();
          //   return;
          // }
          if (isDelete) {
            onDeletePatient();
            // setRoutePath('/app/register-patient');
          }
          if (isClosed) {
            // setRoutePath('/app/patient-search');
            onCloseModal();
          }
        }}
      />
      <div
        className={classNames(
          // eslint-disable-next-line no-nested-ternary
          // isOpenNotePane ? (isMenuOpened ? 'md:w-[63%]' : 'md:w-[66.3%]') : '',
          'h-full relative m-0 bg-gray-100 p-0 w-full'
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
                  {!isPopup && (
                    <Breadcrumbs
                      onPreviousLink={() => {
                        onCloseModal();
                      }}
                    />
                  )}
                  <PageHeader cls=" bg-[white] ">
                    <div className="flex items-start justify-between gap-4 px-7 pt-[33px] pb-[21px]">
                      <div className="flex flex-wrap ">
                        <p className=" self-center text-3xl font-bold text-cyan-600">
                          {selectedPatientID
                            ? `Patient Details - ${
                                selectedPatientData.firstName || ''
                              } ${selectedPatientData.middleName || ''} ${
                                selectedPatientData.lastName || ''
                              }`
                            : `${'Register New Patient'} - ${
                                selectedPatientData.firstName || ''
                              } ${selectedPatientData.middleName || ''} ${
                                selectedPatientData.lastName || ''
                              } (unsaved)`}
                        </p>
                      </div>
                      <div className=" flex items-center justify-end gap-5">
                        <div className="">
                          <CloseButton
                            onClick={() => {
                              if (isJsonChanged) {
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
                              } else {
                                onCloseModal();
                              }
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
                              title={
                                groupData?.filter(
                                  (m) => m.id === selectedPatientData.groupID
                                )[0]?.value
                              }
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
                                selectedValue={
                                  groupData?.filter(
                                    (m) => m.id === selectedPatientData.groupID
                                  )[0]
                                }
                                onSelect={(value) => {
                                  setIsJsonChanged(true);
                                  setSelectedPatientData({
                                    ...selectedPatientData,
                                    groupID: value.id,
                                  });
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
                                selectedValue={
                                  practicesData?.filter(
                                    (m) =>
                                      m.id === selectedPatientData.practiceID
                                  )[0]
                                }
                                onSelect={(value) => {
                                  setSelectedPatientData({
                                    ...selectedPatientData,
                                    practiceID: value.id,
                                  });
                                  setIsJsonChanged(true);
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
                                selectedValue={
                                  facilityData?.filter(
                                    (m) =>
                                      m.id === selectedPatientData.facilityID
                                  )[0]
                                }
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
                                selectedValue={
                                  lookupsData?.placeOfService?.filter(
                                    (m) => m.id === selectedPatientData.posID
                                  )[0]
                                }
                                onSelect={(value) => {
                                  setSelectedPatientData({
                                    ...selectedPatientData,
                                    posID: value.id,
                                  });
                                  setIsJsonChanged(true);
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
                                  selectedValue={
                                    rendringProviderData?.filter(
                                      (m) =>
                                        m.id === selectedPatientData.providerID
                                    )[0]
                                  }
                                  onSelect={(value) => {
                                    setSelectedPatientData({
                                      ...selectedPatientData,
                                      providerID: value.id,
                                    });
                                    setIsJsonChanged(true);
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
                                      !selectedPatientData?.firstName ||
                                      !selectedPatientData?.lastName ||
                                      !selectedPatientData?.dob
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
                                        !selectedPatientData?.firstName ||
                                        !selectedPatientData?.lastName ||
                                        !selectedPatientData?.dob
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
                                    selectedPatientData.firstName === undefined
                                      ? ''
                                      : selectedPatientData.firstName
                                  } ${
                                    selectedPatientData.lastName === undefined
                                      ? ''
                                      : selectedPatientData.lastName
                                  }`}
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
                                <div className="mx-[24px] mt-[16px] h-[494px] overflow-y-auto overflow-x-hidden">
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
                                      value={
                                        selectedPatientData.firstName || ''
                                      }
                                      placeholder="First"
                                      onChange={(evt) => {
                                        setSelectedPatientData({
                                          ...selectedPatientData,
                                          firstName: evt.target.value,
                                        });
                                        setIsJsonChanged(true);
                                      }}
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
                                      value={
                                        selectedPatientData.middleName || ''
                                      }
                                      placeholder="Middle"
                                      onChange={(evt) => {
                                        setSelectedPatientData({
                                          ...selectedPatientData,
                                          middleName: evt.target.value,
                                        });
                                        setIsJsonChanged(true);
                                      }}
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
                                      value={selectedPatientData.lastName || ''}
                                      placeholder="Last"
                                      onChange={(evt) => {
                                        setSelectedPatientData({
                                          ...selectedPatientData,
                                          lastName: evt.target.value,
                                        });
                                        setIsJsonChanged(true);
                                      }}
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
                                        setSelectedPatientData({
                                          ...selectedPatientData,
                                          dob: DateToStringPipe(date, 1),
                                        });
                                        setIsJsonChanged(true);
                                      }}
                                      selected={StringToDatePipe(
                                        selectedPatientData.dob
                                      )}
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
                                        selectedValue={
                                          patientlookupData?.gender.filter(
                                            (m) =>
                                              m.id ===
                                              selectedPatientData.genderID
                                          )[0]
                                        }
                                        onSelect={(value) => {
                                          setSelectedPatientData({
                                            ...selectedPatientData,
                                            genderID: value.id,
                                          });
                                          setIsJsonChanged(true);
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
                                        selectedValue={
                                          patientlookupData?.maritals.filter(
                                            (m) =>
                                              m.id ===
                                              selectedPatientData.maritalStatusID
                                          )[0]
                                        }
                                        onSelect={(maritals) => {
                                          setSelectedPatientData({
                                            ...selectedPatientData,
                                            maritalStatusID: maritals.id,
                                          });
                                          setIsJsonChanged(true);
                                        }}
                                        isOptional={true}
                                        onDeselectValue={() => {
                                          setSelectedPatientData({
                                            ...selectedPatientData,
                                            maritalStatusID: undefined,
                                          });
                                          setIsJsonChanged(true);
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
                                      value={
                                        selectedPatientData.accountNo || ''
                                      }
                                      onChange={(evt) => {
                                        setSelectedPatientData({
                                          ...selectedPatientData,
                                          accountNo: evt.target.value,
                                        });
                                        setIsJsonChanged(true);
                                      }}
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
                                        setIsJsonChanged(true);
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
                                        setIsJsonChanged(true);
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
                                  className="h-[38px] w-[240px] "
                                >
                                  {/* <input
                                    value={maskedSsn}
                                    onChange={handleInputChange}
                                    maxLength={11}
                                    placeholder="***-**-####"
                                  /> */}
                                  <InputField
                                    value={maskedSsn}
                                    onChange={handleInputChange}
                                    maxLength={11}
                                    onBlur={asterisk}
                                    onFocus={unasterisk}
                                    placeholder="***-**-####"
                                  />
                                  {/* <InputField
                                    placeholder="***-**-####"
                                    value={
                                      maskedSsn !==
                                      'undefined-undefined-undefined'
                                        ? maskedSsn || ''
                                        : ''
                                    }
                                    // value={`xxx-xxx-${maskedSsn.substr(
                                    //   maskedSsn.length - 4
                                    // )}`}
                                    // onChange={this.handleChanges}
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
                                      setIsJsonChanged(true);
                                    }}
                                  /> */}
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
                                category === 'patient address'
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
                                              value={
                                                selectedPatientData.address1 ||
                                                ''
                                              }
                                              placeholder="Ex.: 142 Palm Avenue"
                                              onChange={(evt) => {
                                                setSelectedPatientData({
                                                  ...selectedPatientData,
                                                  address1: evt.target.value,
                                                });
                                                setIsJsonChanged(true);
                                              }}
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
                                              value={
                                                selectedPatientData.address2 ||
                                                ''
                                              }
                                              placeholder="-"
                                              onChange={(evt) => {
                                                setSelectedPatientData({
                                                  ...selectedPatientData,
                                                  address2: evt.target.value,
                                                });
                                                setIsJsonChanged(true);
                                              }}
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
                                              value={
                                                selectedPatientData.city || ''
                                              }
                                              placeholder="Ex. Tampa"
                                              onChange={(evt) => {
                                                setSelectedPatientData({
                                                  ...selectedPatientData,
                                                  city: evt.target.value,
                                                });
                                                setIsJsonChanged(true);
                                              }}
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
                                                selectedValue={
                                                  patientlookupData?.states.filter(
                                                    (m) =>
                                                      m.value ===
                                                      selectedPatientData.state
                                                  )[0]
                                                }
                                                onSelect={(value) => {
                                                  setSelectedPatientData({
                                                    ...selectedPatientData,
                                                    state: value.value,
                                                  });
                                                  setIsJsonChanged(true);
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
                                              value={
                                                selectedPatientData.zipCode ||
                                                ''
                                              }
                                              placeholder="-"
                                              maxLength={5}
                                              onChange={(evt) => {
                                                const inputValue =
                                                  evt.target.value;
                                                const numericValue =
                                                  inputValue.replace(/\D/g, ''); // Remove non-numeric characters
                                                const limitedValue =
                                                  numericValue.slice(0, 5); // Limit to 5 characters
                                                setSelectedPatientData({
                                                  ...selectedPatientData,
                                                  zipCode: limitedValue,
                                                });
                                                setIsJsonChanged(true);
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
                                              value={
                                                selectedPatientData.zipCodeExtension ||
                                                ''
                                              }
                                              maxLength={4}
                                              placeholder="-"
                                              onChange={(evt) => {
                                                const inputValue =
                                                  evt.target.value;
                                                const numericValue =
                                                  inputValue.replace(/\D/g, ''); // Remove non-numeric characters
                                                const limitedValue =
                                                  numericValue.slice(0, 4); // Limit to 4 characters
                                                setSelectedPatientData({
                                                  ...selectedPatientData,
                                                  zipCodeExtension:
                                                    limitedValue,
                                                });
                                                setIsJsonChanged(true);
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
                                    category !== 'patient address' ? ( // catogary !== 'patient address'
                                      <Button
                                        buttonType={ButtonType.primary}
                                        cls={`inline-flex ml-[10px] !justify-center w-[203px] h-[38px] gap-2 mt-[30px]`}
                                        onClick={() => {
                                          if (
                                            !selectedPatientData.address1 ||
                                            !selectedPatientData.zipCode ||
                                            selectedPatientData.zipCode === ''
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
                                            setCatogary('patient address');
                                            onValidateAddress(
                                              selectedPatientData.address1,
                                              selectedPatientData.zipCode,
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
                                              !selectedPatientData.address1 ||
                                              !selectedPatientData.zipCode ||
                                              selectedPatientData.zipCode === ''
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
                                              setCatogary('patient address');
                                              onValidateAddress(
                                                selectedPatientData.address1,
                                                selectedPatientData.zipCode,
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
                                        modalContentClassName="rounded-lg bg-gray-100  text-left shadow-xl  w-[960px]"
                                      >
                                        {/* h-[464px]  */}
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
                                            value={
                                              selectedPatientData.homePhone ||
                                              ''
                                            }
                                            onChange={(evt) => {
                                              const phoneNumber =
                                                evt.target.value ===
                                                '(___) ___-____'
                                                  ? ''
                                                  : evt.target.value;
                                              setSelectedPatientData({
                                                ...selectedPatientData,
                                                homePhone: phoneNumber,
                                              });
                                              setIsJsonChanged(true);
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
                                            value={
                                              selectedPatientData.workPhone ||
                                              ''
                                            }
                                            onChange={(evt) => {
                                              const phoneNumber =
                                                evt.target.value ===
                                                '(___) ___-____'
                                                  ? ''
                                                  : evt.target.value;
                                              setSelectedPatientData({
                                                ...selectedPatientData,
                                                workPhone: phoneNumber,
                                              });
                                              setIsJsonChanged(true);
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
                                            value={
                                              selectedPatientData.cellPhone ||
                                              ''
                                            }
                                            onChange={(evt) => {
                                              const phoneNumber =
                                                evt.target.value ===
                                                '(___) ___-____'
                                                  ? ''
                                                  : evt.target.value;
                                              setSelectedPatientData({
                                                ...selectedPatientData,
                                                cellPhone: phoneNumber,
                                              });
                                              setIsJsonChanged(true);
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
                                      value={selectedPatientData.fax || ''}
                                      onChange={(evt) => {
                                        const phoneNumber =
                                          evt.target.value === '(___) ___-____'
                                            ? ''
                                            : evt.target.value;
                                        setSelectedPatientData({
                                          ...selectedPatientData,
                                          fax: phoneNumber,
                                        });
                                        setIsJsonChanged(true);
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
                                  value={selectedPatientData.email || ''}
                                  placeholder="example@example.com"
                                  onChange={(evt) => {
                                    setSelectedPatientData({
                                      ...selectedPatientData,
                                      email: evt.target.value,
                                    });
                                    setIsJsonChanged(true);
                                  }}
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
                                          selectedValue={
                                            patientlookupData?.race.filter(
                                              (m) =>
                                                m.id ===
                                                selectedPatientData.raceID
                                            )[0]
                                          }
                                          onSelect={(value) => {
                                            setSelectedPatientData({
                                              ...selectedPatientData,
                                              raceID: value.id,
                                            });
                                            setIsJsonChanged(true);
                                          }}
                                          isOptional={true}
                                          onDeselectValue={() => {
                                            setSelectedPatientData({
                                              ...selectedPatientData,
                                              raceID: undefined,
                                            });
                                            setIsJsonChanged(true);
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
                                          selectedValue={
                                            patientlookupData?.ethnicity.filter(
                                              (m) =>
                                                m.id ===
                                                selectedPatientData.ethnicityID
                                            )[0]
                                          }
                                          onSelect={(value) => {
                                            setSelectedPatientData({
                                              ...selectedPatientData,
                                              ethnicityID: value.id,
                                            });
                                            setIsJsonChanged(true);
                                          }}
                                          isOptional={true}
                                          onDeselectValue={() => {
                                            setSelectedPatientData({
                                              ...selectedPatientData,
                                              ethnicityID: undefined,
                                            });
                                            setIsJsonChanged(true);
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
                                          selectedValue={
                                            patientlookupData?.language.filter(
                                              (m) =>
                                                m.id ===
                                                selectedPatientData.languageID
                                            )[0]
                                          }
                                          onSelect={(l) => {
                                            setSelectedPatientData({
                                              ...selectedPatientData,
                                              languageID: l.id,
                                            });
                                            setIsJsonChanged(true);
                                          }}
                                          isOptional={true}
                                          onDeselectValue={() => {
                                            setSelectedPatientData({
                                              ...selectedPatientData,
                                              languageID: undefined,
                                            });
                                            setIsJsonChanged(true);
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
                                        value={
                                          selectedPatientData.primaryCarePhysician ||
                                          ''
                                        }
                                        placeholder="-"
                                        maxLength={50}
                                        onChange={(evt) => {
                                          setSelectedPatientData({
                                            ...selectedPatientData,
                                            primaryCarePhysician:
                                              evt.target.value,
                                          });
                                          setIsJsonChanged(true);
                                        }}
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
                                      value={selectedPatientData.category || ''}
                                      placeholder="-"
                                      onChange={(evt) => {
                                        setSelectedPatientData({
                                          ...selectedPatientData,
                                          category: evt.target.value,
                                        });
                                        setIsJsonChanged(true);
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className={`items-start self-stretch`}>
                                  <label className="text-sm font-medium leading-5 text-gray-900">
                                    Chart Number
                                  </label>
                                  <div className="mb-[24px] h-[38px] w-[240px]">
                                    <InputField
                                      value={selectedPatientData.chartNo || ''}
                                      placeholder="-"
                                      onChange={(evt) => {
                                        setSelectedPatientData({
                                          ...selectedPatientData,
                                          chartNo: evt.target.value,
                                        });
                                        setIsJsonChanged(true);
                                      }}
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
                                        value={
                                          selectedPatientData.licenseNo || ''
                                        }
                                        placeholder="-"
                                        onChange={(evt) => {
                                          setSelectedPatientData({
                                            ...selectedPatientData,
                                            licenseNo: evt.target.value,
                                          });
                                          setIsJsonChanged(true);
                                        }}
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
                                      value={
                                        selectedPatientData.employerName || ''
                                      }
                                      placeholder="-"
                                      maxLength={50}
                                      onChange={(evt) => {
                                        setSelectedPatientData({
                                          ...selectedPatientData,
                                          employerName: evt.target.value,
                                        });
                                        setIsJsonChanged(true);
                                      }}
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
                                        selectedValue={
                                          patientlookupData?.smokingStatus.filter(
                                            (m) =>
                                              m.id ===
                                              selectedPatientData.smokingStatusID
                                          )[0]
                                        }
                                        onSelect={(ss) => {
                                          setSelectedPatientData({
                                            ...selectedPatientData,
                                            smokingStatusID: ss.id,
                                          });
                                          setIsJsonChanged(true);
                                        }}
                                        isOptional={true}
                                        onDeselectValue={() => {
                                          setSelectedPatientData({
                                            ...selectedPatientData,
                                            smokingStatusID: undefined,
                                          });
                                          setIsJsonChanged(true);
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
                                      onChange={(date) => {
                                        setSelectedPatientData({
                                          ...selectedPatientData,
                                          deceaseDate: DateToStringPipe(
                                            date,
                                            1
                                          ),
                                        });
                                      }}
                                      selected={StringToDatePipe(
                                        selectedPatientData.deceaseDate
                                      )}
                                      // onDeselectValue={() => {
                                      //   setSelectedPatientData({
                                      //     ...selectedPatientData,
                                      //     deceaseDate: '',
                                      //   });
                                      //   setIsJsonChanged(true);
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
                                      value={
                                        selectedPatientData.deceaseReason || ''
                                      }
                                      placeholder="-"
                                      onChange={(evt) => {
                                        setSelectedPatientData({
                                          ...selectedPatientData,
                                          deceaseReason: evt.target.value,
                                        });
                                        setIsJsonChanged(true);
                                      }}
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
                                    selectedValue={
                                      patientlookupData?.smokingStatus.filter(
                                        (m) =>
                                          m.id ===
                                          selectedPatientData.smokingStatusID
                                      )[0]
                                    }
                                    onSelect={(ss) => {
                                      setSelectedPatientData({
                                        ...selectedPatientData,
                                        smokingStatusID: ss.id,
                                      });
                                      setIsJsonChanged(true);
                                    }}
                                    isOptional={true}
                                    onDeselectValue={() => {
                                      setSelectedPatientData({
                                        ...selectedPatientData,
                                        smokingStatusID: undefined,
                                      });
                                      setIsJsonChanged(true);
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
                                    value={
                                      selectedPatientData.emergencyFirstName ||
                                      ''
                                    }
                                    placeholder="-"
                                    onChange={(evt) => {
                                      setSelectedPatientData({
                                        ...selectedPatientData,
                                        emergencyFirstName: evt.target.value,
                                      });
                                      setIsJsonChanged(true);
                                    }}
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
                                    value={
                                      selectedPatientData.emergencyLastName ||
                                      ''
                                    }
                                    placeholder="-"
                                    onChange={(evt) => {
                                      setSelectedPatientData({
                                        ...selectedPatientData,
                                        emergencyLastName: evt.target.value,
                                      });
                                      setIsJsonChanged(true);
                                    }}
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
                                            value={
                                              selectedPatientData.emergencyAddress1 ||
                                              ''
                                            }
                                            placeholder="Ex.: 142 Palm Avenue"
                                            onChange={(evt) => {
                                              setSelectedPatientData({
                                                ...selectedPatientData,
                                                emergencyAddress1:
                                                  evt.target.value,
                                              });
                                              setIsJsonChanged(true);
                                            }}
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
                                            value={
                                              selectedPatientData.emergencyAddress2 ||
                                              ''
                                            }
                                            placeholder="-"
                                            onChange={(evt) => {
                                              setSelectedPatientData({
                                                ...selectedPatientData,
                                                emergencyAddress2:
                                                  evt.target.value,
                                              });
                                              setIsJsonChanged(true);
                                            }}
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
                                            value={
                                              selectedPatientData.emergencyCity ||
                                              ''
                                            }
                                            placeholder="Ex.: Tampa"
                                            onChange={(evt) => {
                                              setSelectedPatientData({
                                                ...selectedPatientData,
                                                emergencyCity: evt.target.value,
                                              });
                                              setIsJsonChanged(true);
                                            }}
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
                                            selectedValue={
                                              patientlookupData?.states.filter(
                                                (m) =>
                                                  m.value ===
                                                  selectedPatientData.emergencyState
                                              )[0]
                                            }
                                            onSelect={(selectedSubState) => {
                                              setSelectedPatientData({
                                                ...selectedPatientData,
                                                emergencyState:
                                                  selectedSubState.value,
                                              });
                                              setIsJsonChanged(true);
                                            }}
                                            isOptional={true}
                                            onDeselectValue={() => {
                                              setSelectedPatientData({
                                                ...selectedPatientData,
                                                emergencyState: '',
                                              });
                                              setIsJsonChanged(true);
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
                                            value={
                                              selectedPatientData.emergencyZipCode ||
                                              ''
                                            }
                                            placeholder="-"
                                            maxLength={5}
                                            onChange={(evt) => {
                                              const inputValue =
                                                evt.target.value;
                                              const numericValue =
                                                inputValue.replace(/\D/g, ''); // Remove non-numeric characters
                                              const limitedValue =
                                                numericValue.slice(0, 5); // Limit to 5 characters
                                              setSelectedPatientData({
                                                ...selectedPatientData,
                                                emergencyZipCode: limitedValue,
                                              });
                                              setIsJsonChanged(true);
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
                                            value={
                                              selectedPatientData.emergencyzipCodeExtension ||
                                              ''
                                            }
                                            maxLength={4}
                                            placeholder="-"
                                            onChange={(evt) => {
                                              const inputValue =
                                                evt.target.value;
                                              const numericValue =
                                                inputValue.replace(/\D/g, ''); // Remove non-numeric characters
                                              const limitedValue =
                                                numericValue.slice(0, 4); // Limit to 4 characters

                                              setSelectedPatientData({
                                                ...selectedPatientData,
                                                emergencyzipCodeExtension:
                                                  limitedValue,
                                              });
                                              setIsJsonChanged(true);
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
                                    {category !== 'patient emergency address' &&
                                    !emgAddressValidatedOn ? (
                                      <Button
                                        buttonType={ButtonType.primary}
                                        cls={`inline-flex ml-[16px] !justify-center w-[203px] h-[38px] gap-2 mt-[30px]`}
                                        onClick={() => {
                                          if (
                                            !selectedPatientData.emergencyAddress1 ||
                                            !selectedPatientData.emergencyZipCode ||
                                            selectedPatientData.emergencyZipCode ===
                                              ''
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
                                              selectedPatientData.emergencyAddress1,
                                              selectedPatientData.emergencyZipCode,
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
                                              !selectedPatientData.emergencyAddress1 ||
                                              !selectedPatientData.emergencyZipCode ||
                                              selectedPatientData.emergencyZipCode ===
                                                ''
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
                                                selectedPatientData.emergencyAddress1,
                                                selectedPatientData.emergencyZipCode,
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
                                        modalContentClassName="rounded-lg bg-gray-100  text-left shadow-xl   w-[960px]"
                                      >
                                        {/* h-[464px] */}
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
                                  value={
                                    selectedPatientData.emergencyTelephone || ''
                                  }
                                  onChange={(evt) => {
                                    const phoneNumber =
                                      evt.target.value === '(___) ___-____'
                                        ? ''
                                        : evt.target.value;
                                    setSelectedPatientData({
                                      ...selectedPatientData,
                                      emergencyTelephone: phoneNumber,
                                    });
                                    setIsJsonChanged(true);
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
                              value={selectedPatientData.emergencyEmail || ''}
                              placeholder="example@example.com"
                              onChange={(evt) => {
                                setSelectedPatientData({
                                  ...selectedPatientData,
                                  emergencyEmail: evt.target.value,
                                });
                                setIsJsonChanged(true);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <>
                        <div className="flex flex-col gap-4 py-[54px]">
                          <div className="flow-root">
                            <div className="m-0 text-xl font-bold text-gray-800 sm:text-xl">
                              ICD-10 Codes
                            </div>
                          </div>
                          <div className="flex flex-col gap-4 text-left">
                            <p
                              className=" text-sm leading-tight text-gray-500"
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
                                        ICD 10 Code{' '}
                                      </div>
                                    </AppTableCell>
                                    <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4 w-[75%]">
                                      {' '}
                                      Description
                                    </AppTableCell>
                                    <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                      Action
                                    </AppTableCell>
                                  </AppTableRow>
                                </>
                              }
                              renderBody={
                                <>
                                  {icdRows?.map((icdRow, index) => (
                                    <AppTableRow
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
                                              const startIndexDrag =
                                                startIndex.current;
                                              setDragOverIndex(index);

                                              if (
                                                startIndexDrag !== undefined
                                              ) {
                                                const res: any = reOrderData(
                                                  icdRows,
                                                  startIndexDrag,
                                                  index
                                                );
                                                setIsJsonChanged(true);
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
                                              icdRow.data &&
                                              icdRow.data.length !== 0
                                                ? (icdRow.data as SingleSelectGridDropdownDataType[])
                                                : []
                                              // icdSearchData?.length !== 0
                                              //   ? (icdSearchData as SingleSelectGridDropdownDataType[])
                                              //   : []
                                            }
                                            selectedValue={
                                              icdRow?.selectedICDObj
                                            }
                                            onSelect={(e) => {
                                              updateICDArray(
                                                icdRow.order
                                                  ? icdRow.order
                                                  : undefined,
                                                e
                                              );
                                              setIsJsonChanged(true);
                                            }}
                                            onSearch={(value) => {
                                              const row = {
                                                ...icdRow,
                                                searchValue: value,
                                              };
                                              searchIcds(row, 'manual');
                                              // setIcdSearch({
                                              //   ...icdSearch,
                                              //   searchValue: value,
                                              // });
                                            }}
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
                                              const checkedDxCode =
                                                dxCode.filter(
                                                  (a) =>
                                                    a.value === icdRow.icd10Code
                                                );
                                              if (checkedDxCode) {
                                                setdxCode(
                                                  dxCode.filter(
                                                    (a) =>
                                                      a.value !==
                                                      icdRow.icd10Code
                                                  )
                                                );
                                              }
                                              setIcdOrderCount(
                                                icdOrderCount - 1
                                              );
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
                                              setIsJsonChanged(true);
                                            }}
                                            buttonType={ButtonType.secondary}
                                            cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                                          >
                                            <Icon name={'trash'} size={18} />
                                          </Button>
                                        </div>
                                      </AppTableCell>
                                    </AppTableRow>
                                  ))}
                                  {showAddICDRow ? (
                                    <AppTableRow rowRef={icdTableRef}>
                                      <AppTableCell component="th">
                                        {' '}
                                      </AppTableCell>
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
                                              icdSearchData?.length !== 0
                                                ? (icdSearchData as SingleSelectGridDropdownDataType[])
                                                : []
                                            }
                                            selectedValue={selectedICDCode}
                                            onSelect={(
                                              e: SingleValue<SingleSelectGridDropdownDataType>
                                            ) => {
                                              setSelctedICDCode(e);
                                              setIcdOrderCount(
                                                icdOrderCount + 1
                                              );
                                              setAddICDDescription('');
                                              setshowAddICDRow(false);
                                              icdRows?.push({
                                                order:
                                                  icdOrderCount || undefined,
                                                icd10Code:
                                                  e && e.value
                                                    ? e.value
                                                    : undefined,
                                                description: e?.appendText
                                                  ? e?.appendText
                                                  : undefined,
                                                selectedICDObj: e || undefined,
                                              });
                                              setSelctedICDCode(null);
                                              setIsJsonChanged(true);
                                            }}
                                            onSearch={(value) => {
                                              setIcdSearch({
                                                ...icdSearch,
                                                searchValue: value,
                                              });
                                            }}
                                            appendTextSeparator={'|'}
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
                                  )}
                                </>
                              }
                            />
                          </div>
                          <div className="font-medium leading-5">
                            <Button
                              data-testid="AddMoreIcd"
                              buttonType={ButtonType.secondary}
                              onClick={() => {
                                setIcdSearchData([]);
                                if (icdRows && icdRows?.length >= 12) {
                                  dispatch(
                                    addToastNotification({
                                      id: uuidv4(),
                                      text: 'Only 12 ICD-10 Codes are allowed.',
                                      toastType: ToastType.ERROR,
                                    })
                                  );
                                } else {
                                  setshowAddICDRow(!showAddICDRow);
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
                              <Icon
                                name={'plus1'}
                                size={18}
                                color={IconColors.GRAY}
                              />
                            </Button>
                            <p
                              className={`absolute text-sm inline m-0 px-2 py-2.5`}
                            >
                              Add more ICD-10 Codes
                            </p>
                          </div>
                        </div>
                      </>
                    </>
                  )}{' '}
                </div>
                <div className="px-7 ">
                  {currentTab && currentTab.id === 2 && (
                    <PatientInsuranceTab
                      patientID={selectedPatientID}
                      selectedPatientData={selectedPatientData}
                    />
                  )}
                </div>
                <div className="px-7 ">
                  {currentTab && currentTab.id === 3 && (
                    <PatientGuarantorTab
                      patientID={selectedPatientID}
                      selectedPatientData={selectedPatientData}
                    />
                  )}
                </div>
                <div className="px-7 ">
                  {currentTab && currentTab.id === 4 && (
                    <PatientFinancialsTab
                      patientID={selectedPatientID}
                      selectedPatientData={selectedPatientData}
                    />
                  )}
                </div>
                <div className="px-7">
                  {currentTab && currentTab.id === 5 && (
                    <AdvancePaymentTab
                      patientID={selectedPatientID}
                      selectedPatientData={selectedPatientData}
                    />
                  )}
                </div>
                <div className="px-7">
                  {currentTab && currentTab.id === 6 && (
                    <PatientClaimsTab
                      patientID={selectedPatientID}
                      setCount={(count) => {
                        setTabs(
                          tabs.map((d) => {
                            return {
                              ...d,
                              count: d.id === 6 ? count : d.count,
                            };
                          })
                        );
                      }}
                    />
                  )}
                </div>
                <div className="px-7 ">
                  {currentTab && currentTab.id === 7 && (
                    <MedicalCaseTab
                      patientID={selectedPatientID}
                      selectedPatientData={selectedPatientData}
                    />
                  )}
                </div>
                <div className="px-7 ">
                  {currentTab && currentTab.id === 8 && (
                    <DocumentsTab
                      patientID={selectedPatientID}
                      selectedPatientData={selectedPatientData}
                    />
                  )}
                </div>
                <div className="inline-flex flex-col items-end justify-start space-y-4 shadow">
                  <ViewNotes
                    id={selectedPatientID || undefined}
                    noteType="patient"
                    groupID={selectedPatientData?.groupID}
                    btnCls={classNames(
                      'fixed bottom-[120px]',
                      // eslint-disable-next-line no-nested-ternary
                      isOpenNotePane
                        ? isMenuOpened
                          ? 'right-[665px]'
                          : 'right-[665px]'
                        : 'right-[50px]'
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
                          // if (hasClaims) {
                          //   setStatusModalState({
                          //     ...statusModalState,
                          //     open: true,
                          //     heading: "Patient can't be deleted",
                          //     okButtonText: 'Okay',
                          //     okButtonColor: ButtonType.tertiary,
                          //     description:
                          //       'There are financial transactions associated to this record.',
                          //     statusModalType: StatusModalType.WARNING,
                          //     showCloseButton: false,
                          //     closeOnClickOutside: false,
                          //   });
                          // } else {
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
                          // }
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
                          if (isJsonChanged) {
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
                          } else {
                            onCloseModal();
                          }
                        }}
                      >
                        {' '}
                        Close
                      </Button>
                    </div>
                    <div>
                      <Button
                        buttonType={ButtonType.primary}
                        onClick={async () => {
                          if (
                            !selectedPatientData.groupID ||
                            !selectedPatientData.practiceID ||
                            !selectedPatientData.facilityID ||
                            !selectedPatientData.posID ||
                            !selectedPatientData.firstName ||
                            !selectedPatientData.lastName ||
                            !selectedPatientData.genderID ||
                            !selectedPatientData.dob ||
                            !selectedPatientData.address1 ||
                            !selectedPatientData.city ||
                            !selectedPatientData.state ||
                            !selectedPatientData.zipCode ||
                            !selectedPatientData.providerID
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
                            onSavedProfile(!!selectedPatientID);
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
        {/* <Modal
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
        </Modal> */}
      </>
    </>
  );
}
