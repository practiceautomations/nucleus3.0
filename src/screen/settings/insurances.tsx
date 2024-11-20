import React, { useEffect, useState } from 'react';
import InputMask from 'react-input-mask';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { baseUrl } from '@/api/http-client';
import Icon from '@/components/Icon';
import PageHeader from '@/components/PageHeader';
import AppDatePicker from '@/components/UI/AppDatePicker';
import Badge from '@/components/UI/Badge';
import Breadcrumbs from '@/components/UI/Breadcrumbs/breadcrumbs';
import Button, { ButtonType } from '@/components/UI/Button';
import CheckBox from '@/components/UI/CheckBox';
import InputField from '@/components/UI/InputField';
import type { SingleSelectDropDownDataType } from '@/components/UI/SingleSelectDropDown';
import SingleSelectDropDown from '@/components/UI/SingleSelectDropDown';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import TextArea from '@/components/UI/TextArea';
import ToggleButton from '@/components/UI/ToggleButton';
import UploadFile from '@/components/UI/UploadFile';
import AppLayout from '@/layouts/AppLayout';
import { getselectdWorkGroupsIDsSelector } from '@/store/chrome/selectors';
import { addToastNotification } from '@/store/shared/actions';
import {
  addInsrance,
  getClearingHouseList,
  getEligibilityPayerIDsList,
  getExcludeInsuranceDropdown,
  getInsuranceProfileData,
  getPatientLookup,
  getSubmitionPayerIDsList,
  updateInsurance,
  updateInsuranceActive,
  validatePatientAddress,
} from '@/store/shared/sagas';
import type {
  AddEditInsuranceData,
  InsuranceResultData,
  PatientLookupDropdown,
} from '@/store/shared/types';
import { ToastType } from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';
import { DateToStringPipe } from '@/utils/dateConversionPipes';

interface Tprops {
  selectedInsuranceID: number | undefined;
}

const Insurances = ({ selectedInsuranceID }: Tprops) => {
  const dispatch = useDispatch();
  const baseApiUrl = baseUrl.substring(0, baseUrl.lastIndexOf('/'));
  const defaultLogoUrl = '/assets/DefaultUser.png';
  const selectedWorkedGroup = useSelector(getselectdWorkGroupsIDsSelector);

  const [selectedFile, setSelectedFile] = useState<File>();
  const [removeLogo, setRemoveLogo] = useState(false);
  const [statusModalInfo, setStatusModalInfo] = useState<{
    show: boolean;
    showCloseButton?: boolean;
    heading: string;
    text: string;
    type: StatusModalType;
    data?: any;
    confirmType?: string;
    okButtonText?: string;
    okButtonColor?: ButtonType;
  }>();
  const [apiData, setApiData] = useState<InsuranceResultData[]>([]);
  const [filterText, setFilterText] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [filterData, setFilterData] = useState<InsuranceResultData[]>([]);
  const [selectedData, setSelectedData] = useState<InsuranceResultData>();
  const [uniqueFirstLetters, setUniqueFirstLetters] = useState<string[]>([]);
  const [addEditJSON, setAddEditJSON] = useState<AddEditInsuranceData>();
  const [isChangedJson, setIsChangedJson] = useState(false);
  const [disAbleValidateAddressBtn, setDisAbleValidateAddressBtn] =
    useState(true);
  const [patientlookupData, setPatientlookupData] =
    useState<PatientLookupDropdown>();
  const [ClearingHouseDropdownData, setClearingHouseDropdownData] = useState<
    SingleSelectDropDownDataType[]
  >([]);
  const [submitionPayerIDsDropdownData, setSubmitionPayerIDsDropdownData] =
    useState<SingleSelectDropDownDataType[]>([]);
  const [submitionPayerIDSelected, setSubmitionPayerIDSelected] =
    useState<SingleSelectDropDownDataType>();
  const [eligibilityPayerIDsDropdownData, setEligibilityPayerIDsDropdownData] =
    useState<SingleSelectDropDownDataType[]>([]);
  const [eligibilityPayerIDSelected, setEligibilityPayerIDSelected] =
    useState<SingleSelectDropDownDataType>();
  const [insuranceTypeDropdownData, setInsuranceTypeDropdownData] = useState<
    SingleSelectDropDownDataType[]
  >([]);
  // const [
  //   institutionalClearingHouseDropdownData,
  //   setInstitutionalClearingHouseDropdownData,
  // ] = useState<SingleSelectDropDownDataType[]>([]);
  const [
    institutionalSubmitionPayerIDsDropdownData,
    setInstitutionalSubmitionPayerIDsDropdownData,
  ] = useState<SingleSelectDropDownDataType[]>([]);
  const [
    institutionalEligibilityPayerIDsDropdownData,
    setInstitutionalEligibilityPayerIDsDropdownData,
  ] = useState<SingleSelectDropDownDataType[]>([]);
  const [
    institutionalSubmitionPayerIDSelected,
    setInstitutionalSubmitionPayerIDSelected,
  ] = useState<SingleSelectDropDownDataType>();
  const [
    institutionalEligibilityPayerIDSelected,
    setInstitutionalEligibilityPayerIDSelected,
  ] = useState<SingleSelectDropDownDataType>();

  const resetSidebarData = () => {
    setFilterText('');
    setApiData([]);
  };

  const fetchProfileData = async (groupID: number) => {
    const res = await getInsuranceProfileData(groupID);
    if (res) {
      setApiData(res);
    }
    return res;
  };

  const handleFilterData = () => {
    const filterRes = apiData.filter((item) => {
      const { name, insuranceType } = item;
      const searchText = filterText.toLowerCase();

      return (
        (name.toLowerCase().includes(searchText) ||
          (insuranceType &&
            insuranceType.toLowerCase().includes(searchText))) &&
        (showInactive || item.active !== showInactive)
      );
    });
    setFilterData(filterRes);

    const uniqueLetters: Set<string> = new Set();
    filterRes.forEach((item) => {
      const firstLetter = item.name.charAt(0).toUpperCase();
      uniqueLetters.add(firstLetter);
    });
    const result = Array.from(uniqueLetters);
    setUniqueFirstLetters([...result.sort()]);

    if (selectedInsuranceID) {
      const obj: InsuranceResultData | undefined = apiData.filter(
        (i) => i.id === selectedInsuranceID
      )[0];
      if (obj) setSelectedData(obj);
    }
  };

  useEffect(() => {
    handleFilterData();
  }, [filterText, apiData, showInactive]);

  const handleAddUpdateJson = (value: AddEditInsuranceData) => {
    setAddEditJSON(value);
    setIsChangedJson(true);
  };
  const fecthExcludeInsuranceDropdown = async () => {
    const res = await getExcludeInsuranceDropdown();
    if (res) {
      setInsuranceTypeDropdownData(res);
    }
  };

  const fecthSubmitionPayerIDsList = async (value: string, typeID: number) => {
    const groupID = selectedWorkedGroup?.groupsData[0]?.id || 0;
    const res = await getSubmitionPayerIDsList(value, groupID, typeID);
    if (res) {
      if (typeID === 1) {
        setSubmitionPayerIDsDropdownData(res);
      }
      if (typeID === 2) {
        setInstitutionalSubmitionPayerIDsDropdownData(res);
      }
    }
  };
  const fecthEligibilityPayerIDsList = async (
    value: string,
    typeID: number
  ) => {
    const groupID = selectedWorkedGroup?.groupsData[0]?.id || 0;
    const res = await getEligibilityPayerIDsList(value, groupID, typeID);
    if (res) {
      if (typeID === 1) {
        setEligibilityPayerIDsDropdownData(res);
      }
      if (typeID === 2) {
        setInstitutionalEligibilityPayerIDsDropdownData(res);
      }
    }
  };
  const fecthClearingHouseList = async (groupID: number) => {
    const res = await getClearingHouseList(groupID);
    if (res) {
      setClearingHouseDropdownData(res);
    }
  };
  const patientLookupData = async () => {
    const res = await getPatientLookup();
    if (res) {
      setPatientlookupData(res);
    }
  };

  const initProfile = () => {
    fecthExcludeInsuranceDropdown();
    patientLookupData();
  };
  useEffect(() => {
    initProfile();
  }, []);
  useEffect(() => {
    if (selectedWorkedGroup?.groupsData[0]?.id) {
      fetchProfileData(selectedWorkedGroup.groupsData[0].id);
      resetSidebarData();
      fecthClearingHouseList(selectedWorkedGroup.groupsData[0].id);
    }
  }, [selectedWorkedGroup]);

  const handleAddForm = () => {
    setSelectedFile(undefined);
    setRemoveLogo(false);
    const obj: AddEditInsuranceData = {
      insuranceID: null,
      insuranceName: '',
      insuranceTypeID: null,
      groupID: selectedWorkedGroup?.groupsData[0]?.id || null,
      imgName: null,
      imgURL: null,
      insurancePortalURL: null,
      insurancePortalUser: null,
      insurancePortalPassword: null,
      address1: null,
      address2: null,
      city: null,
      state: null,
      zipCode: null,
      zipCodeExtention: null,
      contactPerson: null,
      officePhone: undefined,
      fax: undefined,
      email: null,
      timelyFilingDays: null,
      followUpDays: null,
      underContract: true,
      underContractDate: null,
      eAttachment: true,
      clearingHouseID: null,
      submitPayerID: null,
      submitPayerListID: null,
      eligibilityPayerID: null,
      eligibilityPayerListID: null,
      comments: null,
      active: true,
      validateIDS: [],
      institutionalClearingHouseID: null,
      institutionalSubmitPayerID: null,
      institutionalSubmitPayerListID: null,
      institutionalEligibilityPayerID: null,
      institutionalEligibilityPayerListID: null,
    };
    setAddEditJSON({ ...obj });
    setDisAbleValidateAddressBtn(true);
  };

  const validateOfficePhone = (officePhone: string) => {
    // Validate the format (XXX) XXX-XXXX using a regex
    const regex = /^\(\d{3}\) \d{3}-\d{4}$/;
    // Test the phone number against the regex
    return regex.test(officePhone);
  };

  const validateFax = (fax: string) => {
    // Validate the format (XXX) XXX-XXXX using a regex
    const regex = /^\(\d{3}\) \d{3}-\d{4}$/;
    // Test the phone number against the regex
    return regex.test(fax);
  };

  const validateEmail = (email: string) => {
    const filter =
      // eslint-disable-next-line no-useless-escape
      /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z]{2,3})+$/;
    return filter.test(email);
  };
  const handleFormDataDeselection = () => {
    setAddEditJSON(undefined);
    setIsChangedJson(false);
    setSubmitionPayerIDSelected(undefined);
    setInstitutionalSubmitionPayerIDSelected(undefined);
    setInstitutionalEligibilityPayerIDSelected(undefined);
    setEligibilityPayerIDSelected(undefined);
  };
  const submitAddEditToAPI = async () => {
    if (addEditJSON) {
      if (
        !addEditJSON.insuranceName ||
        !addEditJSON.followUpDays ||
        !addEditJSON.timelyFilingDays
      ) {
        setStatusModalInfo({
          show: true,
          heading: 'Alert',
          showCloseButton: false,
          text: 'This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.',
          type: StatusModalType.WARNING,
        });
        return;
      }

      if (
        addEditJSON.officePhone &&
        !validateOfficePhone(addEditJSON.officePhone)
      ) {
        dispatch(
          addToastNotification({
            id: uuidv4(),
            text: 'Office phone number is invalid.',
            toastType: ToastType.ERROR,
          })
        );
        return;
      }
      if (addEditJSON.fax && !validateFax(addEditJSON.fax)) {
        dispatch(
          addToastNotification({
            id: uuidv4(),
            text: 'Fax number is invalid.',
            toastType: ToastType.ERROR,
          })
        );
        return;
      }
      if (addEditJSON.email && !validateEmail(addEditJSON.email)) {
        dispatch(
          addToastNotification({
            id: uuidv4(),
            text: 'Enter valid email address.',
            toastType: ToastType.ERROR,
          })
        );
        return;
      }

      if (addEditJSON.timelyFilingDays < 0) {
        dispatch(
          addToastNotification({
            id: uuidv4(),
            text: 'Please add Valid Number in Timely Filing Days',
            toastType: ToastType.ERROR,
          })
        );
        return;
      }
      if (addEditJSON.followUpDays < 0) {
        dispatch(
          addToastNotification({
            id: uuidv4(),
            text: 'Please add Valid Number in Follow-up Days',
            toastType: ToastType.ERROR,
          })
        );
        return;
      }
      const formData = new FormData();
      formData.append('insurance', JSON.stringify(addEditJSON));
      if (selectedFile) formData.append('logo', selectedFile);
      formData.append('removeLogo', String(removeLogo));

      let res: any;
      if (addEditJSON.insuranceID) {
        res = await updateInsurance(formData);
      } else {
        res = await addInsrance(formData);
      }
      if (res && !!res.errors.length) {
        dispatch(
          addToastNotification({
            id: uuidv4(),
            text: res.errors,
            toastType: ToastType.ERROR,
          })
        );
        return;
      }

      if (res) {
        setSelectedFile(undefined);
        if (selectedWorkedGroup?.groupsData[0]?.id) {
          const resApiData = await fetchProfileData(
            selectedWorkedGroup.groupsData[0].id
          );
          if (selectedData)
            setSelectedData(
              resApiData?.filter((f) => f.id === selectedData.id)[0]
            );
        } else {
          setSelectedData(undefined);
        }
        handleFormDataDeselection();
      } else {
        setStatusModalInfo({
          show: true,
          heading: 'Error',
          showCloseButton: false,
          text: `A system error prevented the Insurance ${
            addEditJSON.insuranceID
              ? 'Settings changes to be saved'
              : 'to be created'
          }.\nPlease try again.`,
          type: StatusModalType.ERROR,
        });
      }
    }
  };

  const handleEditForm = () => {
    if (selectedData) {
      setSelectedFile(undefined);
      setRemoveLogo(false);
      setDisAbleValidateAddressBtn(true);
      const obj: AddEditInsuranceData = {
        insuranceID: selectedData.id,
        insuranceName: selectedData.name,
        insuranceTypeID: selectedData.insuranceTypeID,
        groupID: selectedData.groupID,
        imgName: selectedData.imgName,
        imgURL: selectedData.imgURL,
        insurancePortalURL: selectedData.insurancePortalURL,
        insurancePortalUser: selectedData.insurancePortalUser,
        insurancePortalPassword: selectedData.insurancePortalPassword,
        address1: selectedData.address1,
        address2: selectedData.address2,
        city: selectedData.city,
        state: selectedData.state,
        zipCode: selectedData.zipcode,
        zipCodeExtention: selectedData.zipcodeExtension,
        contactPerson: selectedData.contactName,
        officePhone: selectedData.officePhone,
        fax: selectedData.fax,
        email: selectedData.email,
        timelyFilingDays: selectedData.timelyFilingDays,
        followUpDays: selectedData.followUpDays,
        underContract: selectedData.underContract,
        underContractDate: selectedData.underContractDate,
        eAttachment: selectedData.eattachments,
        clearingHouseID: selectedData.clearingHouseID,
        submitPayerID: selectedData.submitPayerID,
        submitPayerListID: selectedData.submitPayerListID,
        eligibilityPayerID: selectedData.eligibilityPayerID,
        eligibilityPayerListID: selectedData.eligibilityPayerListID,
        comments: selectedData.comments,
        active: selectedData.active,
        institutionalClearingHouseID: selectedData.institutionalClearingHouseID,
        institutionalSubmitPayerID: selectedData.institutionalSubmitPayerID,
        institutionalSubmitPayerListID:
          selectedData.institutionalSubmitPayerListID,
        institutionalEligibilityPayerID:
          selectedData.institutionalEligibilityPayerID,
        institutionalEligibilityPayerListID:
          selectedData.institutionalEligibilityPayerListID,

        validateIDS: [],
      };
      setAddEditJSON({ ...obj });

      if (selectedData.submitPayerListID) {
        setSubmitionPayerIDSelected({
          id: selectedData.submitPayerListID,
          value: selectedData.submitPayerValue,
        });
      }
      if (selectedData.eligibilityPayerListID) {
        setEligibilityPayerIDSelected({
          id: selectedData.eligibilityPayerListID,
          value: selectedData.eligibilityPayerValue,
        });
      }
      if (selectedData.institutionalSubmitPayerListID) {
        setInstitutionalSubmitionPayerIDSelected({
          id: selectedData.institutionalSubmitPayerListID,
          value: selectedData.institutionalSubmitPayerValue,
        });
      }
      if (selectedData.institutionalEligibilityPayerListID) {
        setInstitutionalEligibilityPayerIDSelected({
          id: selectedData.institutionalEligibilityPayerListID,
          value: selectedData.institutionalEligibilityPayerValue,
        });
      }
    }
  };

  const updateItemActive = async (id: number, active: boolean) => {
    const res = await updateInsuranceActive(id, active);
    if (res) {
      if (selectedWorkedGroup?.groupsData[0]?.id) {
        const resApiData = await fetchProfileData(
          selectedWorkedGroup.groupsData[0].id
        );
        if (selectedData)
          setSelectedData(
            resApiData?.filter((f) => f.id === selectedData.id)[0]
          );
      } else {
        setSelectedData(undefined);
      }
    } else {
      setStatusModalInfo({
        show: true,
        heading: 'Error',
        showCloseButton: false,
        text: `A system error prevented the Insurance to be ${
          active ? 'activated' : 'inactivated'
        }.\nPlease try again.`,
        type: StatusModalType.ERROR,
      });
    }
  };

  const onAddEditCancel = () => {
    setAddEditJSON(undefined);
  };

  const getStatusBadge = (value: string) => {
    const color = value.toLowerCase() === 'active' ? 'green' : 'red';
    return (
      <Badge
        text={value.toUpperCase()}
        cls={classNames(`!rounded-full bg-${color}-100 text-${color}-800`)}
        icon={
          <div className="mt-[-1px] flex">
            <div
              className={classNames(
                `h-2 w-2 rounded-full`,
                value.toLowerCase() === 'active' ? 'bg-green-400' : 'bg-red-400'
              )}
            />
          </div>
        }
      />
    );
  };

  const onValidateAddress = async (address: string, zips: string) => {
    const res = await validatePatientAddress(
      address,
      zips,
      'insurance address',
      addEditJSON?.insuranceID ? addEditJSON?.insuranceID : null
    );
    if (res && res.validateID && !res?.error && addEditJSON) {
      setDisAbleValidateAddressBtn(true);
      setAddEditJSON({
        ...addEditJSON,
        address1: res.address1 || '',
        address2: res.address2 || '',
        zipCode: res.zip || '',
        zipCodeExtention: res.zipPlus4 || '',
        city: res.city || '',
        state: res.state || '',
        validateIDS: [...addEditJSON.validateIDS, res.validateID],
      });
    }
    if (res && res.error) {
      setStatusModalInfo({
        show: true,
        heading: 'No Results Found',
        showCloseButton: false,
        text: 'Sorry,  we couldnt find an address that matches the provided information. Please double-check the information you provided and try again.',
        type: StatusModalType.ERROR,
      });
    }
    if (!res) {
      setStatusModalInfo({
        show: true,
        heading: 'Error',
        showCloseButton: false,
        text: 'A system error prevented the Validate Address feature from running. Please try again.',
        type: StatusModalType.ERROR,
      });
    }
  };

  return (
    <AppLayout title="Insurances Settings">
      <div className="m-0 h-full w-full overflow-y-auto p-0">
        <Breadcrumbs />
        <PageHeader cls="!bg-white !drop-shadow">
          <div className="flex items-start justify-between gap-4 px-7 pb-[21px] pt-[33px]">
            <div className="flex h-[38px] gap-6">
              <p className="self-center text-3xl font-bold text-cyan-700">
                Insurances Settings
              </p>
              <div>
                <Button
                  cls={'h-[38px] truncate '}
                  buttonType={ButtonType.primary}
                  onClick={() => {
                    if (isChangedJson) {
                      setStatusModalInfo({
                        show: true,
                        showCloseButton: true,
                        heading: 'Cancel Confirmation',
                        text: `Are you sure you want to cancel ${
                          addEditJSON?.insuranceID ? 'editing' : 'creating'
                        } this Insurance? Clicking "Confirm" will result in the loss of all changes.`,
                        type: StatusModalType.WARNING,
                        okButtonText: 'Confirm',
                        okButtonColor: ButtonType.primary,
                        confirmType: 'CancelConfirmationOnAdd',
                      });
                      return;
                    }
                    handleAddForm();
                  }}
                >
                  Add New Insurances
                </Button>
              </div>
            </div>
          </div>
          <div className={`px-7`}>
            <div className={`h-[1px] w-full bg-gray-200`} />
          </div>
        </PageHeader>
        <div className="flex h-[calc(100%-118px)] w-full">
          <div className="flex h-full w-[406px] flex-col items-center overflow-y-auto border-r border-gray-300 bg-gray-50">
            <div className="sticky top-0 z-[1] w-full gap-6 border-b border-gray-200 bg-gray-50 p-6">
              <div className="mt-2.5 w-full">
                <div className="relative w-full">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    autoComplete="off"
                    id="search"
                    name="search"
                    className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 leading-5 text-gray-500 placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:text-gray-900 focus:outline-none focus:ring-white sm:text-sm"
                    placeholder="Filter by Insurance Name or Insurance Type"
                    value={filterText}
                    onChange={(e) => {
                      setFilterText(e.target.value);
                    }}
                  />
                </div>
              </div>
              <div className="mt-2.5 flex gap-2">
                <CheckBox
                  data-testid="showInactive_insurance"
                  checked={showInactive}
                  onChange={() => {
                    setShowInactive(!showInactive);
                  }}
                />
                <div className="text-[14px] font-medium leading-tight text-gray-700">
                  Show Inactive
                </div>
              </div>
            </div>
            {uniqueFirstLetters.map((alfa) => {
              const filterRes = filterData
                .filter((item) =>
                  item.name.toLowerCase().startsWith(alfa.toLowerCase())
                )
                .sort((a, b) => a.name.localeCompare(b.name));
              return (
                <>
                  <div className="inline-flex w-full flex-col items-start justify-center bg-gray-50">
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="flex w-full flex-col items-start justify-center px-6 py-1">
                      <p className="w-full text-sm font-bold leading-tight text-gray-500">
                        {alfa}
                      </p>
                    </div>
                  </div>
                  {filterRes.map((d) => {
                    return (
                      <>
                        <div
                          className={classNames(
                            selectedData?.id === d.id
                              ? 'bg-cyan-50'
                              : 'bg-white',
                            'flex flex-col w-full cursor-pointer items-center justify-start bg-white'
                          )}
                          onClick={() => {
                            if (isChangedJson) {
                              setStatusModalInfo({
                                show: true,
                                showCloseButton: true,
                                heading: 'Cancel Confirmation',
                                text: `Are you sure you want to cancel ${
                                  addEditJSON?.insuranceID
                                    ? 'editing'
                                    : 'creating'
                                } this Insurance? Clicking "Confirm" will result in the loss of all changes.`,
                                type: StatusModalType.WARNING,
                                okButtonText: 'Confirm',
                                okButtonColor: ButtonType.primary,
                                confirmType:
                                  'CancelConfirmationOnSelectSaidebarItem',
                                data: d,
                              });
                              return;
                            }
                            handleFormDataDeselection();
                            setSelectedData(d);
                          }}
                        >
                          <div className="h-[1px] w-full bg-gray-200" />
                          <div className="flex w-full flex-row items-center justify-center px-3 py-4">
                            <div className="flex h-full w-[90%] flex-row">
                              <div className="flex h-full w-[25%] items-center justify-center">
                                <img
                                  className={classNames(
                                    'w-12 h-12 rounded-3xl bg-gray-100'
                                  )}
                                  src={
                                    d.imgURL
                                      ? baseApiUrl + d.imgURL
                                      : defaultLogoUrl
                                  }
                                />
                              </div>
                              <div className="flex w-[75%] flex-1 items-center justify-start">
                                <div className="flex w-full flex-1 items-center justify-start space-x-4">
                                  <div
                                    data-testid="insurance_row"
                                    className="inline-flex w-full flex-1 flex-col items-start justify-start space-y-1"
                                  >
                                    <p className="text-truncate-3-lines w-full text-sm font-medium leading-tight text-cyan-500">
                                      {d.name}
                                    </p>
                                    {!!d.insuranceType && (
                                      <div className="inline-flex w-full flex-col items-start justify-start gap-1">
                                        <div className="inline-flex w-full items-start justify-start gap-1.5">
                                          <div className="text-[14px] font-normal leading-tight text-gray-500">
                                            Type:
                                          </div>
                                          <div className="text-[14px] font-normal leading-tight text-gray-500">
                                            {d.insuranceType}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    {getStatusBadge(
                                      d.active ? 'Active' : 'inActive'
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex h-[20px] w-[10%] items-center justify-center">
                              <Icon
                                name="chevron"
                                size={13}
                                color={IconColors.GRAY}
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })}
                </>
              );
            })}
          </div>
          {!selectedData && !addEditJSON ? (
            <div className="flex w-full flex-col items-start p-6">
              <div className="inline-flex items-center justify-start space-x-1">
                <div className="inline-flex items-center justify-start space-x-1">
                  <Icon
                    name={'arrow'}
                    size={18}
                    style={{
                      transform: 'rotate(180deg)',
                    }}
                  />
                </div>
                <p className="text-sm leading-tight text-gray-500">
                  Select an item from the list to view its details.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex h-full w-full flex-col items-center overflow-y-auto pt-6">
              <div className="inline-flex w-[826px] flex-col items-start justify-start rounded-md border border-gray-200 bg-white px-6 pt-10 shadow">
                <div className="inline-flex w-full items-end justify-between py-2">
                  <div className="flex h-full items-center justify-start">
                    <div className="flex h-full items-center justify-center px-2">
                      {selectedFile ? (
                        <img
                          className={classNames(
                            'w-12 h-12 rounded-3xl bg-gray-100'
                          )}
                          src={URL.createObjectURL(selectedFile)}
                        />
                      ) : (
                        <>
                          {addEditJSON ? (
                            <img
                              className={classNames(
                                'w-12 h-12 rounded-3xl bg-gray-100'
                              )}
                              src={
                                addEditJSON.imgURL
                                  ? baseApiUrl + addEditJSON.imgURL
                                  : defaultLogoUrl
                              }
                            />
                          ) : (
                            <img
                              className={classNames(
                                'w-12 h-12 rounded-3xl bg-gray-100'
                              )}
                              src={
                                selectedData?.imgURL
                                  ? baseApiUrl + selectedData.imgURL
                                  : defaultLogoUrl
                              }
                            />
                          )}
                        </>
                      )}
                    </div>
                    <div className="inline-flex flex-col items-start justify-start space-y-1">
                      <p className="text-lg font-medium leading-normal text-gray-900">
                        {addEditJSON
                          ? addEditJSON.insuranceName || 'New Insurance'
                          : selectedData?.name}
                      </p>
                      {addEditJSON ? (
                        <>
                          {getStatusBadge(
                            addEditJSON.active ? 'Active' : 'inActive'
                          )}
                        </>
                      ) : (
                        <>
                          {getStatusBadge(
                            selectedData?.active ? 'Active' : 'inActive'
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="inline-flex flex-col items-end justify-start">
                    {!addEditJSON && (
                      <>
                        {selectedData?.createdOn && (
                          <p className="flex text-xs leading-none">
                            Created On:{' '}
                            {DateToStringPipe(selectedData?.createdOn, 2)}{' '}
                            by&nbsp;
                            <p className="cursor-pointer text-cyan-500 underline">
                              {selectedData?.createdBy}
                            </p>
                          </p>
                        )}
                        {selectedData?.updatedOn && (
                          <p className="flex text-xs leading-none">
                            Last Updated On:{' '}
                            {DateToStringPipe(selectedData?.updatedOn, 2)}{' '}
                            by&nbsp;
                            <p className="cursor-pointer text-cyan-500 underline">
                              {selectedData?.updatedBy}
                            </p>
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="h-[1px] w-full bg-gray-200" />
                <div className="flex w-full flex-col items-center justify-center">
                  <>
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          Insurance Name{' '}
                          {addEditJSON && (
                            <span className="text-cyan-500">*</span>
                          )}
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <InputField
                              placeholder="Insurance Name"
                              value={addEditJSON.insuranceName}
                              onChange={(evt) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  insuranceName: evt.target.value,
                                });
                              }}
                            />
                          </div>
                        ) : (
                          <p className="text-sm leading-tight text-gray-900">
                            {selectedData?.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          Insurance Type
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <SingleSelectDropDown
                              testId="insurance_type_testid"
                              placeholder="Select From Dropdown"
                              data={insuranceTypeDropdownData}
                              isOptional
                              selectedValue={
                                insuranceTypeDropdownData.filter(
                                  (f) => f.id === addEditJSON.insuranceTypeID
                                )[0]
                              }
                              onSelect={(value) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  insuranceTypeID: value.id,
                                });
                              }}
                              onDeselectValue={() => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  insuranceTypeID: null,
                                });
                              }}
                            />
                          </div>
                        ) : (
                          <p className="text-sm leading-tight text-gray-900">
                            {selectedData?.insuranceType || '-'}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          Insurance Logo
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="flex w-full flex-row gap-2">
                            <UploadFile
                              placeholder={'Select File To Upload'}
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
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  imgName: e.name,
                                });
                              }}
                              selectedFileName={addEditJSON.imgName || ''}
                              cls={'h-[38px] flex-[2_2_0%] inline-flex'}
                            ></UploadFile>
                            <Button
                              className="inline-flex h-[38px] w-[38px] items-center justify-center gap-2 rounded-md border border-gray-300 bg-gray-100 p-[9px] shadow"
                              onClick={() => {
                                setSelectedFile(undefined);
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  imgName: '',
                                  imgURL: '',
                                });
                                setRemoveLogo(true);
                              }}
                            >
                              <Icon name={'trash'} />
                            </Button>
                          </div>
                        ) : (
                          <p className="text-sm leading-tight text-gray-900">
                            {selectedData?.imgName || '-'}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          Associated With Group/Organization
                          {addEditJSON && !addEditJSON.insuranceID && (
                            <span className="text-cyan-500"> *</span>
                          )}
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <SingleSelectDropDown
                              placeholder="-"
                              disabled={!!addEditJSON.insuranceID}
                              data={selectedWorkedGroup?.groupsData || []}
                              selectedValue={selectedWorkedGroup?.groupsData[0]}
                              onSelect={() => {}}
                            />
                          </div>
                        ) : (
                          <p className="cursor-pointer text-sm leading-tight text-cyan-500 underline">
                            {selectedData?.group}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          Insurance Portal URL
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <InputField
                              placeholder="HTTPS://"
                              value={addEditJSON.insurancePortalURL}
                              onChange={(evt) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  insurancePortalURL: evt.target.value,
                                });
                              }}
                            />
                          </div>
                        ) : (
                          <p className="text-sm leading-tight text-gray-900">
                            {selectedData?.insurancePortalURL || '-'}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          Insurance Portal User Name
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <InputField
                              placeholder="Insurance Portal User Name"
                              value={addEditJSON.insurancePortalUser}
                              onChange={(evt) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  insurancePortalUser: evt.target.value,
                                });
                              }}
                            />
                          </div>
                        ) : (
                          <p className="text-sm leading-tight text-gray-900">
                            {selectedData?.insurancePortalUser || '-'}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          Insurance Portal Password
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <InputField
                              type={'password'}
                              placeholder="Insurance Portal Password"
                              value={addEditJSON.insurancePortalPassword}
                              onChange={(evt) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  insurancePortalPassword: evt.target.value,
                                });
                              }}
                            />
                          </div>
                        ) : (
                          <p className="text-sm leading-tight text-gray-900">
                            {selectedData?.insurancePortalPassword || '-'}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                  </>
                  <div className="flex h-[66px] w-full flex-col items-start justify-center">
                    <div className="inline-flex w-full items-center justify-start space-x-2">
                      <div className="flex h-full w-[50%] items-center justify-start space-x-2">
                        <p className="text-base font-bold leading-normal text-gray-900">
                          Address
                        </p>
                        <div className="flex items-center justify-start space-x-2">
                          {!!selectedData?.addressValidateOn && !addEditJSON && (
                            <>
                              <div className="flex items-center justify-start space-x-1">
                                <Icon name={'greenCheck'} size={18} />
                                <p className="text-xs font-medium leading-none text-green-600">
                                  Verified Address
                                </p>
                              </div>
                              <p className="text-xs leading-none text-gray-500">
                                (Verified On:{' '}
                                {DateToStringPipe(
                                  selectedData?.addressValidateOn,
                                  2
                                )}
                                )
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex w-[50%] items-center justify-end">
                        {!!addEditJSON && (
                          <Button
                            buttonType={ButtonType.primary}
                            disabled={disAbleValidateAddressBtn}
                            cls={`inline-flex ml-[10px] !justify-center w-[203px] h-[38px] gap-2`}
                            onClick={() => {
                              if (
                                !addEditJSON.address1 ||
                                !addEditJSON.zipCode
                              ) {
                                setStatusModalInfo({
                                  show: true,
                                  heading: 'Warning',
                                  showCloseButton: false,
                                  text: `Please enter the "Address 1" and "ZIP Code" for validation`,
                                  type: StatusModalType.WARNING,
                                });
                                return;
                              }
                              onValidateAddress(
                                addEditJSON.address1,
                                addEditJSON.zipCode
                              );
                            }}
                          >
                            <Icon
                              name={'verified'}
                              size={18}
                              color={
                                disAbleValidateAddressBtn
                                  ? IconColors.GRAY_500
                                  : IconColors.WHITE_S
                              }
                            />
                            <p className={`text-justify text-sm`}>
                              Validate Address
                            </p>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  <>
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          Address 1
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <InputField
                              placeholder="Address 1"
                              value={addEditJSON.address1}
                              onChange={(evt) => {
                                const addressValue = evt.target.value;
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  address1: addressValue,
                                });
                                setDisAbleValidateAddressBtn(false);
                              }}
                            />
                          </div>
                        ) : (
                          <p className="text-sm leading-tight text-gray-900">
                            {selectedData?.address1 || '-'}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          Address 2
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <InputField
                              placeholder="Address 2"
                              value={addEditJSON.address2}
                              onChange={(evt) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  address2: evt.target.value,
                                });
                                setDisAbleValidateAddressBtn(false);
                              }}
                            />
                          </div>
                        ) : (
                          <p className="text-sm leading-tight text-gray-900">
                            {selectedData?.address2 || '-'}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          City
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <InputField
                              placeholder="City"
                              value={addEditJSON.city}
                              onChange={(evt) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  city: evt.target.value,
                                });
                                setDisAbleValidateAddressBtn(false);
                              }}
                            />
                          </div>
                        ) : (
                          <p className="text-sm leading-tight text-gray-900">
                            {selectedData?.city || '-'}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          State
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <SingleSelectDropDown
                              placeholder="Select From Dropdown"
                              data={
                                patientlookupData?.states
                                  ? (patientlookupData.states as SingleSelectDropDownDataType[])
                                  : []
                              }
                              selectedValue={
                                patientlookupData?.states.filter(
                                  (f) => f.value === addEditJSON.state
                                )[0]
                              }
                              onSelect={(value) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  state: value.value,
                                });
                                setDisAbleValidateAddressBtn(false);
                              }}
                              isOptional
                              onDeselectValue={() => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  state: null,
                                });
                                setDisAbleValidateAddressBtn(false);
                              }}
                            />
                          </div>
                        ) : (
                          <p className="text-sm leading-tight text-gray-900">
                            {selectedData?.state || '-'}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          ZIP Code
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <InputField
                              placeholder="ZIP Code"
                              value={addEditJSON.zipCode}
                              type={'number'}
                              onChange={(evt) => {
                                const zipCodeValue = evt.target.value.slice(
                                  0,
                                  5
                                );
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  zipCode: zipCodeValue,
                                });
                                setDisAbleValidateAddressBtn(false);
                              }}
                            />
                          </div>
                        ) : (
                          <p className="text-sm leading-tight text-gray-900">
                            {selectedData?.zipcode || '-'}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          ZIP Extension
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <InputField
                              placeholder="ZIP Extension"
                              value={addEditJSON.zipCodeExtention}
                              type={'number'}
                              onChange={(evt) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  zipCodeExtention: evt.target.value.slice(
                                    0,
                                    4
                                  ),
                                });
                                setDisAbleValidateAddressBtn(false);
                              }}
                            />
                          </div>
                        ) : (
                          <p className="text-sm leading-tight text-gray-900">
                            {selectedData?.zipcodeExtension || '-'}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                  </>
                  <div className="flex h-[60px] w-full flex-col items-start justify-center">
                    <div className="inline-flex w-full items-center justify-start space-x-2">
                      <p className="text-base font-bold leading-normal text-gray-900">
                        Contact Person
                      </p>
                    </div>
                  </div>
                  <>
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          Contact Name
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <InputField
                              placeholder="Contact Name"
                              value={addEditJSON.contactPerson}
                              onChange={(evt) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  contactPerson: evt.target.value,
                                });
                              }}
                            />
                          </div>
                        ) : (
                          <p className="text-sm leading-tight text-gray-900">
                            {selectedData?.contactName || '-'}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          Office Phone
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <div
                              className={classNames(
                                `h-[38px] mt-1 border-solid border border-gray-300 gap-2 inline-flex items-center rounded-md text-gray-900 leading-5 text-left font-normal px-[10px] pt-[9px] pb-[9px] w-full overflow-clip font-['Nunito']`
                              )}
                            >
                              <InputMask
                                placeholder={'(000) 000-0000'}
                                mask="(999) 999-9999"
                                className={classNames(
                                  'flex w-full h-full text-black focus:outline-none items-center justify-center text-sm leading-5 self-center pr-2 bg-transparent'
                                )}
                                value={addEditJSON.officePhone}
                                onChange={(evt) => {
                                  const officePhone =
                                    evt.target.value === '(___) ___-____'
                                      ? ''
                                      : evt.target.value;
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    officePhone,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm leading-tight text-gray-900">
                            {selectedData?.officePhone || '-'}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          Fax
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <div
                              className={classNames(
                                `h-[38px] mt-1 border-solid border border-gray-300 gap-2 inline-flex items-center rounded-md text-gray-900 leading-5 text-left font-normal px-[10px] pt-[9px] pb-[9px] w-full overflow-clip font-['Nunito']`
                              )}
                            >
                              <InputMask
                                placeholder={'(000) 000-0000'}
                                mask="(999) 999-9999"
                                className={classNames(
                                  'flex w-full h-full text-black focus:outline-none items-center justify-center text-sm leading-5 self-center pr-2 bg-transparent'
                                )}
                                value={addEditJSON.fax}
                                onChange={(evt) => {
                                  const fax =
                                    evt.target.value === '(___) ___-____'
                                      ? ''
                                      : evt.target.value;
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    fax,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm leading-tight text-gray-900">
                            {selectedData?.fax || '-'}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          Email
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <InputField
                              placeholder="Email"
                              value={addEditJSON.email}
                              onChange={(evt) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  email: evt.target.value,
                                });
                              }}
                            />
                          </div>
                        ) : (
                          <p className="text-sm leading-tight text-gray-900">
                            {selectedData?.email || '-'}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                  </>
                </div>
                <div className="flex h-[60px] w-full flex-col items-start justify-center">
                  <div className="inline-flex w-full items-center justify-start space-x-2">
                    <p className="text-base font-bold leading-normal text-gray-900">
                      General Settings
                    </p>
                  </div>
                </div>
                <div className="flex w-full flex-col items-start justify-center py-4">
                  <div className="inline-flex w-full items-start justify-start space-x-4">
                    <div className="flex w-[33%] items-start justify-start space-x-4">
                      <p className="text-sm font-medium leading-tight text-gray-500">
                        Settings
                      </p>
                    </div>
                    <div className="flex w-[67%] justify-end">
                      <div className="inline-flex w-full flex-col items-start justify-start rounded-md border border-gray-200">
                        <div className="inline-flex h-[49px] w-full items-center justify-center space-x-4 pl-3 pr-4">
                          <div className="flex w-[50%] items-start justify-start">
                            <p className="text-sm leading-tight text-gray-900">
                              Active
                            </p>
                          </div>
                          <div className="flex w-[50%] items-start justify-end gap-2">
                            {addEditJSON ? (
                              <ToggleButton
                                value={!!addEditJSON.active}
                                onChange={(value) => {
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    active: value,
                                  });
                                }}
                              />
                            ) : (
                              <ToggleButton value={!!selectedData?.active} />
                            )}
                          </div>
                        </div>
                        <div className="h-[1px] w-full bg-gray-200" />
                        <div
                          className={classNames(
                            'inline-flex w-full items-center justify-start space-x-4 pl-3 pr-4',
                            addEditJSON ? 'h-[60px]' : 'h-[49px]'
                          )}
                        >
                          <div className="flex h-full w-[50%] flex-1 items-center justify-start space-x-2">
                            <p className="text-sm leading-tight text-gray-900">
                              Timely Filing Days{' '}
                              {addEditJSON && (
                                <span className="text-cyan-500">*</span>
                              )}
                            </p>
                          </div>
                          <div className="w-[50%]">
                            {addEditJSON ? (
                              <div
                                data-testid="insurance_timely_filing"
                                className="w-full"
                              >
                                <InputField
                                  placeholder="Number of Days"
                                  value={addEditJSON.timelyFilingDays}
                                  type={'number'}
                                  onChange={(evt) => {
                                    handleAddUpdateJson({
                                      ...addEditJSON,
                                      timelyFilingDays: evt.target.value
                                        ? Number(evt.target.value)
                                        : null,
                                    });
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="flex w-full flex-wrap items-center justify-end gap-2 py-2">
                                <div
                                  className={classNames(
                                    'relative gap-1 bg-gray-100 rounded-md pl-[10px] h-full pr-[10px]'
                                  )}
                                >
                                  <span
                                    className={classNames(
                                      'block truncate py-0.5'
                                    )}
                                  >
                                    {selectedData?.timelyFilingDays
                                      ? `${selectedData?.timelyFilingDays} Days`
                                      : ''}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="h-[1px] w-full bg-gray-200" />
                        <div
                          className={classNames(
                            'inline-flex w-full items-center justify-start space-x-4 pl-3 pr-4',
                            addEditJSON ? 'h-[60px]' : 'h-[49px]'
                          )}
                        >
                          <div className="flex h-full w-[50%] flex-1 items-center justify-start space-x-2">
                            <p className="text-sm leading-tight text-gray-900">
                              Follow-Up Days{' '}
                              {addEditJSON && (
                                <span className="text-cyan-500">*</span>
                              )}
                            </p>
                          </div>
                          <div className="w-[50%]">
                            {addEditJSON ? (
                              <div className="w-full">
                                <InputField
                                  data-testid="insurance_follow_up"
                                  placeholder="Number of Days"
                                  value={addEditJSON.followUpDays}
                                  type={'number'}
                                  onChange={(evt) => {
                                    handleAddUpdateJson({
                                      ...addEditJSON,
                                      followUpDays: evt.target.value
                                        ? Number(evt.target.value)
                                        : null,
                                    });
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="flex w-full flex-wrap items-center justify-end gap-2 py-2">
                                <div
                                  className={classNames(
                                    'relative gap-1 bg-gray-100 rounded-md pl-[10px] h-full pr-[10px]'
                                  )}
                                >
                                  <span
                                    className={classNames(
                                      'block truncate py-0.5'
                                    )}
                                  >
                                    {selectedData?.followUpDays
                                      ? `${selectedData?.followUpDays} Days`
                                      : ''}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="h-[1px] w-full bg-gray-200" />
                        <div className="inline-flex h-[49px] w-full items-center justify-center space-x-4 pl-3 pr-4">
                          <div className="flex w-[50%] items-start justify-start">
                            <p className="text-sm leading-tight text-gray-900">
                              Under Contract
                            </p>
                          </div>
                          <div className="flex w-[50%] items-start justify-end gap-2">
                            {addEditJSON ? (
                              <ToggleButton
                                value={!!addEditJSON.underContract}
                                onChange={(value) => {
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    underContract: value,
                                  });
                                }}
                              />
                            ) : (
                              <ToggleButton
                                value={!!selectedData?.underContract}
                              />
                            )}
                          </div>
                        </div>
                        <div className="h-[1px] w-full bg-gray-200" />
                        <div
                          className={classNames(
                            'inline-flex w-full items-center justify-start space-x-4 pl-3 pr-4',
                            addEditJSON ? 'h-[60px]' : 'h-[49px]'
                          )}
                        >
                          <div className="flex h-full w-[50%] flex-1 items-center justify-start space-x-2">
                            <p className="text-sm leading-tight text-gray-900">
                              Contract Date
                            </p>
                          </div>
                          <div className="w-[50%]">
                            {addEditJSON ? (
                              <div className="w-full">
                                <AppDatePicker
                                  cls="!mt-1"
                                  selected={addEditJSON.underContractDate}
                                  onChange={(value) => {
                                    handleAddUpdateJson({
                                      ...addEditJSON,
                                      underContractDate: value
                                        ? DateToStringPipe(value, 1)
                                        : '',
                                    });
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="flex w-full flex-wrap items-center justify-end gap-2 py-2">
                                {selectedData?.underContractDate ? (
                                  <div
                                    className={classNames(
                                      'relative gap-1 bg-gray-100 rounded-md pl-[10px] h-full pr-[10px]'
                                    )}
                                  >
                                    <span
                                      className={classNames(
                                        'block truncate py-0.5'
                                      )}
                                    >
                                      {DateToStringPipe(
                                        selectedData?.underContractDate,
                                        2
                                      )}
                                    </span>
                                  </div>
                                ) : (
                                  <p className="text-sm leading-tight text-gray-900">
                                    {'-'}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="h-[1px] w-full bg-gray-200" />
                        <div className="inline-flex h-[49px] w-full items-center justify-center space-x-4 pl-3 pr-4">
                          <div className="flex w-[50%] items-start justify-start">
                            <p className="text-sm leading-tight text-gray-900">
                              Can Receive E-Attachments
                            </p>
                          </div>
                          <div className="flex w-[50%] items-start justify-end gap-2">
                            {addEditJSON ? (
                              <ToggleButton
                                value={!!addEditJSON.eAttachment}
                                onChange={(value) => {
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    eAttachment: value,
                                  });
                                }}
                              />
                            ) : (
                              <ToggleButton
                                value={!!selectedData?.eattachments}
                              />
                            )}
                          </div>
                        </div>
                        <div className="h-[1px] w-full bg-gray-200" />
                        <div
                          className={classNames(
                            'inline-flex w-full items-center justify-start space-x-4 pl-3 pr-4',
                            addEditJSON ? 'h-[60px]' : 'h-[49px]'
                          )}
                        >
                          <div className="flex h-full w-[50%] flex-1 items-center justify-start space-x-2">
                            <p className="text-sm leading-tight text-gray-900">
                              Clearinghouse (837-P)
                            </p>
                          </div>
                          <div className="w-[50%]">
                            {addEditJSON ? (
                              <div className="w-full">
                                <SingleSelectDropDown
                                  placeholder="Select From Dropdown"
                                  data={ClearingHouseDropdownData}
                                  isOptional
                                  selectedValue={
                                    ClearingHouseDropdownData.filter(
                                      (m) =>
                                        m.id === addEditJSON.clearingHouseID
                                    )[0]
                                  }
                                  onDeselectValue={() => {
                                    handleAddUpdateJson({
                                      ...addEditJSON,
                                      clearingHouseID: null,
                                    });
                                  }}
                                  onSelect={(value) => {
                                    handleAddUpdateJson({
                                      ...addEditJSON,
                                      clearingHouseID: value.id,
                                    });
                                  }}
                                />
                              </div>
                            ) : (
                              <p className="flex justify-end text-sm leading-tight text-gray-900">
                                {selectedData?.clearingHouseValue
                                  ? selectedData?.clearingHouseValue
                                  : '-'}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="h-[1px] w-full bg-gray-200" />
                        <div
                          className={classNames(
                            'inline-flex w-full items-center justify-start space-x-4 pl-3 pr-4',
                            addEditJSON ? 'h-[60px]' : 'h-[49px]'
                          )}
                        >
                          <div className="flex h-full w-[50%] flex-1 items-center justify-start space-x-2">
                            <p className="text-sm leading-tight text-gray-900">
                              Submit Payer ID (837-P)
                            </p>
                          </div>
                          <div className="w-[50%]">
                            {addEditJSON ? (
                              <div className="w-full">
                                <SingleSelectDropDown
                                  placeholder="Select From Dropdown"
                                  data={submitionPayerIDsDropdownData}
                                  selectedValue={submitionPayerIDSelected}
                                  onSearch={(value) => {
                                    fecthSubmitionPayerIDsList(value, 1);
                                  }}
                                  isOptional
                                  onDeselectValue={() => {
                                    handleAddUpdateJson({
                                      ...addEditJSON,
                                      submitPayerListID: null,
                                      submitPayerID: null,
                                    });
                                    setSubmitionPayerIDSelected(undefined);
                                  }}
                                  onSelect={(value) => {
                                    handleAddUpdateJson({
                                      ...addEditJSON,
                                      submitPayerListID: value.id,
                                      submitPayerID:
                                        value.value.split('|')[0] || null,
                                    });
                                    setSubmitionPayerIDSelected(value);
                                  }}
                                />
                              </div>
                            ) : (
                              <p className="flex justify-end text-sm leading-tight text-gray-900">
                                {selectedData?.submitPayerValue
                                  ? selectedData?.submitPayerValue
                                  : '-'}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="h-[1px] w-full bg-gray-200" />
                        <div
                          className={classNames(
                            'inline-flex w-full items-center justify-start space-x-4 pl-3 pr-4',
                            addEditJSON ? 'h-[60px]' : 'h-[49px]'
                          )}
                        >
                          <div className="flex h-full w-[50%] flex-1 items-center justify-start space-x-2">
                            <p className="text-sm leading-tight text-gray-900">
                              Eligibility Payer ID (837-P)
                            </p>
                          </div>
                          <div className="w-[50%]">
                            {addEditJSON ? (
                              <div className="w-full">
                                <SingleSelectDropDown
                                  placeholder="Select From Dropdown"
                                  data={eligibilityPayerIDsDropdownData}
                                  selectedValue={eligibilityPayerIDSelected}
                                  isOptional
                                  onSearch={(value) => {
                                    fecthEligibilityPayerIDsList(value, 1);
                                  }}
                                  onDeselectValue={() => {
                                    handleAddUpdateJson({
                                      ...addEditJSON,
                                      eligibilityPayerListID: null,
                                      eligibilityPayerID: null,
                                    });
                                    setEligibilityPayerIDSelected(undefined);
                                  }}
                                  onSelect={(value) => {
                                    handleAddUpdateJson({
                                      ...addEditJSON,
                                      eligibilityPayerListID: value.id,
                                      eligibilityPayerID:
                                        value.value.split('|')[0] || null,
                                    });
                                    setEligibilityPayerIDSelected(value);
                                  }}
                                  searchOnCharacterLength={1}
                                />
                              </div>
                            ) : (
                              <p className="flex justify-end text-sm leading-tight text-gray-900">
                                {selectedData?.eligibilityPayerValue
                                  ? selectedData?.eligibilityPayerValue
                                  : '-'}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="h-[1px] w-full bg-gray-200" />
                        <div
                          className={classNames(
                            'inline-flex w-full items-center justify-start space-x-4 pl-3 pr-4',
                            addEditJSON ? 'h-[60px]' : 'h-[49px]'
                          )}
                        >
                          <div className="flex h-full w-[50%] flex-1 items-center justify-start space-x-2">
                            <p className="text-sm leading-tight text-gray-900">
                              Clearinghouse (837-I)
                            </p>
                          </div>
                          <div className="w-[50%]">
                            {addEditJSON ? (
                              <div className="w-full">
                                <SingleSelectDropDown
                                  placeholder="Select From Dropdown"
                                  data={ClearingHouseDropdownData}
                                  isOptional
                                  selectedValue={
                                    ClearingHouseDropdownData.filter(
                                      (m) =>
                                        m.id ===
                                        addEditJSON.institutionalClearingHouseID
                                    )[0]
                                  }
                                  onDeselectValue={() => {
                                    handleAddUpdateJson({
                                      ...addEditJSON,
                                      institutionalClearingHouseID: null,
                                    });
                                  }}
                                  onSelect={(value) => {
                                    handleAddUpdateJson({
                                      ...addEditJSON,
                                      institutionalClearingHouseID: value.id,
                                    });
                                  }}
                                />
                              </div>
                            ) : (
                              <p className="flex justify-end text-sm leading-tight text-gray-900">
                                {selectedData?.institutionalClearingHouseValue
                                  ? selectedData?.institutionalClearingHouseValue
                                  : '-'}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="h-[1px] w-full bg-gray-200" />
                        <div
                          className={classNames(
                            'inline-flex w-full items-center justify-start space-x-4 pl-3 pr-4',
                            addEditJSON ? 'h-[60px]' : 'h-[49px]'
                          )}
                        >
                          <div className="flex h-full w-[50%] flex-1 items-center justify-start space-x-2">
                            <p className="text-sm leading-tight text-gray-900">
                              Submit Payer ID (837-I)
                            </p>
                          </div>
                          <div className="w-[50%]">
                            {addEditJSON ? (
                              <div className="w-full">
                                <SingleSelectDropDown
                                  placeholder="Select From Dropdown"
                                  data={
                                    institutionalSubmitionPayerIDsDropdownData
                                  }
                                  selectedValue={
                                    institutionalSubmitionPayerIDSelected
                                  }
                                  onSearch={(value) => {
                                    fecthSubmitionPayerIDsList(value, 2);
                                  }}
                                  isOptional
                                  onDeselectValue={() => {
                                    handleAddUpdateJson({
                                      ...addEditJSON,
                                      institutionalSubmitPayerListID: null,
                                      institutionalSubmitPayerID: null,
                                    });
                                    setInstitutionalSubmitionPayerIDSelected(
                                      undefined
                                    );
                                  }}
                                  onSelect={(value) => {
                                    handleAddUpdateJson({
                                      ...addEditJSON,
                                      institutionalSubmitPayerListID: value.id,
                                      institutionalSubmitPayerID:
                                        value.value.split('|')[0] || null,
                                    });
                                    setInstitutionalSubmitionPayerIDSelected(
                                      value
                                    );
                                  }}
                                />
                              </div>
                            ) : (
                              <p className="flex justify-end text-sm leading-tight text-gray-900">
                                {selectedData?.institutionalSubmitPayerValue
                                  ? selectedData?.institutionalSubmitPayerValue
                                  : '-'}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="h-[1px] w-full bg-gray-200" />
                        <div
                          className={classNames(
                            'inline-flex w-full items-center justify-start space-x-4 pl-3 pr-4',
                            addEditJSON ? 'h-[60px]' : 'h-[49px]'
                          )}
                        >
                          <div className="flex h-full w-[50%] flex-1 items-center justify-start space-x-2">
                            <p className="text-sm leading-tight text-gray-900">
                              Eligibility Payer ID (837-I)
                            </p>
                          </div>
                          <div className="w-[50%]">
                            {addEditJSON ? (
                              <div className="w-full">
                                <SingleSelectDropDown
                                  placeholder="Select From Dropdown"
                                  data={
                                    institutionalEligibilityPayerIDsDropdownData
                                  }
                                  selectedValue={
                                    institutionalEligibilityPayerIDSelected
                                  }
                                  isOptional
                                  onSearch={(value) => {
                                    fecthEligibilityPayerIDsList(value, 2);
                                  }}
                                  onDeselectValue={() => {
                                    handleAddUpdateJson({
                                      ...addEditJSON,
                                      institutionalEligibilityPayerListID: null,
                                      institutionalEligibilityPayerID: null,
                                    });
                                    setInstitutionalEligibilityPayerIDSelected(
                                      undefined
                                    );
                                  }}
                                  onSelect={(value) => {
                                    handleAddUpdateJson({
                                      ...addEditJSON,
                                      institutionalEligibilityPayerListID:
                                        value.id,
                                      institutionalEligibilityPayerID:
                                        value.value.split('|')[0] || null,
                                    });
                                    setInstitutionalEligibilityPayerIDSelected(
                                      value
                                    );
                                  }}
                                />
                              </div>
                            ) : (
                              <p className="flex justify-end text-sm leading-tight text-gray-900">
                                {selectedData?.institutionalEligibilityPayerValue
                                  ? selectedData?.institutionalEligibilityPayerValue
                                  : '-'}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="h-[1px] w-full bg-gray-200" />
                        <div className="inline-flex w-full items-start justify-start space-x-4 py-3 pl-3 pr-4">
                          <div className="flex flex-1 items-start justify-start space-x-2">
                            <p className="text-sm leading-tight text-gray-900">
                              Additional Description
                            </p>
                          </div>
                          <TextArea
                            id="textarea"
                            value={
                              addEditJSON
                                ? addEditJSON.comments || ''
                                : selectedData?.comments || ''
                            }
                            disabled={!addEditJSON}
                            cls="h-[120px] !bg-white flex items-end justify-end flex-1 h-full pl-3 pr-0.5 pt-2 pb-0.5 bg-white shadow border rounded-md border-gray-300"
                            placeholder={
                              !addEditJSON
                                ? 'No Description'
                                : 'Enter Message Here'
                            }
                            onChange={(evt) => {
                              if (addEditJSON)
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  comments: evt.target.value,
                                });
                            }}
                            style={{
                              resize: !addEditJSON ? 'none' : undefined,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="h-[1px] w-full bg-gray-200" />
                <div className="inline-flex w-full items-center justify-center pb-7 pt-6">
                  <div className="flex w-full items-center justify-end space-x-4">
                    {!addEditJSON ? (
                      <>
                        <Button
                          cls={'shadow'}
                          buttonType={
                            selectedData?.active
                              ? ButtonType.quaternary
                              : ButtonType.primary
                          }
                          onClick={() => {
                            if (selectedData?.active) {
                              setStatusModalInfo({
                                show: true,
                                showCloseButton: true,
                                heading: 'Deactivate Insurance Confirmation',
                                text: 'Deactivating a Insurance will make it unavailable throughout the system.\nAre you sure you want to proceed with this action?',
                                type: StatusModalType.ERROR,
                                okButtonText: 'Yes, Deactivate Insurance',
                                okButtonColor: ButtonType.tertiary,
                                confirmType:
                                  'CancelConfirmationOnHandleActivateItem',
                              });
                            } else {
                              setStatusModalInfo({
                                show: true,
                                showCloseButton: true,
                                heading: 'Activate Insurance Confirmation',
                                text: 'Activating a Insurance will make it available throughout the system.\nAre you sure you want to proceed with this action?',
                                type: StatusModalType.WARNING,
                                okButtonText: 'Yes, Activate Insurance',
                                okButtonColor: ButtonType.primary,
                                confirmType:
                                  'CancelConfirmationOnHandleActivateItem',
                              });
                            }
                          }}
                        >
                          {selectedData?.active ? 'Deactivate' : 'Activate'}{' '}
                          Insurance
                        </Button>
                        <Button
                          cls={'shadow w-24'}
                          buttonType={ButtonType.secondary}
                          onClick={() => {
                            handleEditForm();
                          }}
                        >
                          Edit
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          cls={'shadow'}
                          buttonType={ButtonType.secondary}
                          onClick={() => {
                            if (isChangedJson) {
                              setStatusModalInfo({
                                show: true,
                                showCloseButton: true,
                                heading: 'Cancel Confirmation',
                                text: `Are you sure you want to cancel ${
                                  addEditJSON?.insuranceID
                                    ? 'editing'
                                    : 'creating'
                                } this Insurance? Clicking "Confirm" will result in the loss of all changes.`,
                                type: StatusModalType.WARNING,
                                okButtonText: 'Confirm',
                                okButtonColor: ButtonType.primary,
                                confirmType: 'CancelConfirmationOnCancelBtn',
                              });
                              return;
                            }
                            onAddEditCancel();
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          cls={'shadow'}
                          buttonType={ButtonType.primary}
                          disabled={!isChangedJson}
                          onClick={() => {
                            submitAddEditToAPI();
                          }}
                        >
                          {addEditJSON.insuranceID
                            ? 'Save Changes'
                            : 'Add Insurance'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {!!statusModalInfo?.show && (
        <StatusModal
          open={!!statusModalInfo?.show}
          heading={statusModalInfo?.heading}
          description={statusModalInfo?.text}
          statusModalType={statusModalInfo?.type}
          showCloseButton={statusModalInfo?.showCloseButton}
          okButtonText={statusModalInfo?.okButtonText}
          okButtonColor={statusModalInfo?.okButtonColor}
          closeOnClickOutside={true}
          onChange={() => {
            if (
              statusModalInfo.data &&
              statusModalInfo.confirmType ===
                'CancelConfirmationOnSelectSaidebarItem'
            ) {
              setSelectedFile(undefined);
              setAddEditJSON(undefined);
              setIsChangedJson(false);
              setSelectedData(statusModalInfo.data);
            }
            if (statusModalInfo.confirmType === 'CancelConfirmationOnAdd') {
              setIsChangedJson(false);
              handleAddForm();
            }
            if (
              statusModalInfo.confirmType === 'CancelConfirmationOnCancelBtn'
            ) {
              setIsChangedJson(false);
              onAddEditCancel();
            }
            if (
              statusModalInfo.confirmType ===
              'CancelConfirmationOnHandleActivateItem'
            ) {
              if (selectedData?.id)
                updateItemActive(selectedData.id, !selectedData.active);
            }
            setStatusModalInfo(undefined);
          }}
          onClose={() => {
            setStatusModalInfo(undefined);
          }}
        />
      )}
    </AppLayout>
  );
};

export default Insurances;
