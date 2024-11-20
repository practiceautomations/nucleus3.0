import React, { useEffect, useState } from 'react';
import InputMask from 'react-input-mask';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import validator from 'validator';

import { baseUrl } from '@/api/http-client';
import Icon from '@/components/Icon';
import PageHeader from '@/components/PageHeader';
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
import {
  addToastNotification,
  fetchPracticeDataRequest,
} from '@/store/shared/actions';
import {
  addPractice,
  getInfoByNPI,
  getPatientLookup,
  getPracticeProfileData,
  updatePractice,
  updatePracticeActive,
  validatePatientAddress,
} from '@/store/shared/sagas';
import type {
  PatientLookupDropdown,
  PracticeProfileData,
} from '@/store/shared/types';
import { ToastType } from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';
import { DateToStringPipe } from '@/utils/dateConversionPipes';

import { currencyFormatter } from '../app/all-claims';

const Practices = () => {
  const dispatch = useDispatch();
  const baseApiUrl = baseUrl.substring(0, baseUrl.lastIndexOf('/'));
  const defaultUserUrl = '/assets/DefaultUser.png';
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
  const [patientlookupData, setPatientlookupData] =
    useState<PatientLookupDropdown>();

  const patientLookupData = async () => {
    const res = await getPatientLookup();
    if (res) {
      setPatientlookupData(res);
    }
  };
  useEffect(() => {
    patientLookupData();
  }, []);
  const [practiceSelectedValue, setPracticeSelectedValue] =
    useState<SingleSelectDropDownDataType>();
  const [apiData, setApiData] = useState<PracticeProfileData[]>([]);

  const [filterText, setFilterText] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [filterData, setFilterData] = useState<PracticeProfileData[]>([]);
  const [selectedData, setSelectedData] = useState<PracticeProfileData>();
  const [uniqueFirstLetters, setUniqueFirstLetters] = useState<string[]>([]);
  const [addEditJSON, setAddEditJSON] = useState<PracticeProfileData>();
  const [isChangedJson, setIsChangedJson] = useState(false);
  const [officePhone, setOfficePhone] = useState<string>('');

  const resetSidebarData = (clearPracticeSelectedData?: boolean) => {
    setFilterText('');
    setApiData([]);
    if (clearPracticeSelectedData) {
      setPracticeSelectedValue(undefined);
    }
  };

  useEffect(() => {
    if (!selectedWorkedGroup?.workGroupId && selectedWorkedGroup) {
      if (selectedWorkedGroup.groupsData && selectedWorkedGroup.groupsData[0]) {
        const value = selectedWorkedGroup.groupsData[0];
        dispatch(fetchPracticeDataRequest({ groupID: value.id }));
        resetSidebarData(true);
      }
    }
  }, [selectedWorkedGroup]);

  const fetchProfileData = async (
    name: string | null,
    groupID: number,
    active: boolean | null,
    practiceID: number | null
  ) => {
    const res = await getPracticeProfileData(name, groupID, active, practiceID);
    if (res) {
      setApiData(res);
    }
    return res;
  };

  useEffect(() => {
    if (selectedWorkedGroup?.groupsData[0]?.id) {
      resetSidebarData();
      fetchProfileData(null, selectedWorkedGroup.groupsData[0].id, null, null);
    }
  }, [practiceSelectedValue]);

  const handleFilterData = () => {
    const filterRes = apiData.filter((item) => {
      const { name, npi, address1 } = item;
      const searchText = filterText.toLowerCase();

      return (
        (name.toLowerCase().includes(searchText) ||
          (npi && npi.toLowerCase().includes(searchText)) ||
          address1?.toLowerCase().includes(searchText)) &&
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
  };

  useEffect(() => {
    handleFilterData();
  }, [filterText, apiData, showInactive]);

  const handleAddUpdateJson = (value: PracticeProfileData) => {
    setAddEditJSON(value);
    setIsChangedJson(true);
  };
  const [disAbleValidateAddressBtn, setDisAbleValidateAddressBtn] =
    useState(true);
  const [disAbleValidatePayToAddressBtn, setDisAbleValidatePayToAddressBtn] =
    useState(true);
  const handleAddForm = () => {
    setSelectedFile(undefined);
    setRemoveLogo(false);
    const obj: PracticeProfileData = {
      id: undefined,
      name: '',
      groupID: selectedWorkedGroup?.groupsData[0]?.id || null,
      npi: '',
      taxonomy: '',
      taxid: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      zipcode: '',
      zipcodeExtension: '',
      contactPerson: '',
      officePhone: '',
      fax: '',
      email: '',
      payToAddress1: '',
      payToAddress2: '',
      payToCity: '',
      payToState: '',
      payToZip: '',
      payToZipExtension: '',
      statementDays: null,
      statementAmount: null,
      statementMessage: '',
      currentMessage: '',
      thirtyPlusMessage: '',
      sixtyPlusMessage: '',
      nintyPlusMessage: '',
      oneTwentyPlusMessage: '',
      active: true,
      comments: '',
      logoURL: '',
      logoName: '',
      createdOn: '',
      createdByID: '',
      createdBy: '',
      updatedOn: '',
      updatedByID: '',
      updatedBy: '',
      addressValidateOn: '',
      payToAddressValidateOn: '',
      validateIDS: [],
      excludeStatementBalance: null,
    };
    setAddEditJSON({ ...obj });
    setDisAbleValidateAddressBtn(true);
    setDisAbleValidatePayToAddressBtn(true);
  };

  const submitAddEditToAPI = async () => {
    if (addEditJSON) {
      if (!addEditJSON.name || !addEditJSON.groupID) {
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
        addEditJSON.taxid.length !== 0 &&
        (addEditJSON.taxid.length > 9 || addEditJSON.taxid.length < 9)
      ) {
        dispatch(
          addToastNotification({
            id: uuidv4(),
            text: 'Tax ID must be of 9 digits',
            toastType: ToastType.ERROR,
          })
        );
        return;
      }
      const formData = new FormData();
      if (addEditJSON.email && !validator.isEmail(addEditJSON.email)) {
        dispatch(
          addToastNotification({
            id: uuidv4(),
            text: 'Enter valid email address.',
            toastType: ToastType.ERROR,
          })
        );
        return;
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
        officePhone &&
        officePhone.length > 0 &&
        !validatePhoneNumber(officePhone)
      ) {
        dispatch(
          addToastNotification({
            text: 'Office Phone number is invalid.',
            toastType: ToastType.ERROR,
            id: uuidv4(),
          })
        );
        return;
      }
      if (
        addEditJSON.taxonomy.length !== 0 &&
        (addEditJSON.taxonomy.length < 10 || addEditJSON.taxonomy.length > 10)
      ) {
        dispatch(
          addToastNotification({
            id: uuidv4(),
            text: 'Taxonomy must be of 10 digit',
            toastType: ToastType.ERROR,
          })
        );
        return;
      }
      if (
        addEditJSON.npi.length !== 0 &&
        (addEditJSON.npi.length < 10 || addEditJSON.npi.length > 10)
      ) {
        dispatch(
          addToastNotification({
            id: uuidv4(),
            text: 'NPI must be of 10 digit',
            toastType: ToastType.ERROR,
          })
        );
        return;
      }
      const obj = {
        practiceID: addEditJSON.id,
        name: addEditJSON.name,
        groupID: selectedWorkedGroup?.groupsData[0]?.id,
        npi: addEditJSON.npi,
        taxonomy: addEditJSON.taxonomy,
        taxid: addEditJSON.taxid,
        address1: addEditJSON.address1,
        address2: addEditJSON.address2,
        city: addEditJSON.city,
        state: addEditJSON.state,
        zipCode: addEditJSON.zipcode,
        zipCodeExtention: addEditJSON.zipcodeExtension,
        contactPerson: addEditJSON.contactPerson,
        officePhone: addEditJSON.officePhone,
        fax: addEditJSON.fax,
        email: addEditJSON.email,
        payToAddress1: addEditJSON.payToAddress1,
        payToAddress2: addEditJSON.payToAddress2,
        payToCity: addEditJSON.payToCity,
        payToState: addEditJSON.payToState,
        payToZip: addEditJSON.payToZip,
        payToZipExtention: addEditJSON.payToZipExtension,
        statementDays: addEditJSON.statementDays,
        statementAmount: addEditJSON.statementAmount,
        statementMessage: addEditJSON.statementMessage,
        currentMessage: addEditJSON.currentMessage,
        thirtyPlusMessage: addEditJSON.thirtyPlusMessage,
        sixtyPlusMessage: addEditJSON.sixtyPlusMessage,
        nintyPlusMessage: addEditJSON.nintyPlusMessage,
        oneTwentyPlusMessage: addEditJSON.oneTwentyPlusMessage,
        active: addEditJSON.active,
        comments: addEditJSON.comments,
        validateIDS: addEditJSON.validateIDS,
        excludeStatementBalance: addEditJSON.excludeStatementBalance,
      };
      formData.append('practice', JSON.stringify(obj));
      if (selectedFile) formData.append('logo', selectedFile);
      formData.append('removeLogo', String(removeLogo));
      let res: any;
      if (addEditJSON.id) {
        res = await updatePractice(formData);
      } else {
        res = await addPractice(formData);
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
        if (selectedWorkedGroup?.groupsData[0]?.id) {
          const resApiData = await fetchProfileData(
            null,
            selectedWorkedGroup.groupsData[0].id,
            null,
            null
          );
          if (selectedData)
            if (resApiData && res.practiceID) {
              const newPreacticeData = resApiData?.filter(
                (f) => f.id === res.practiceID
              )[0];
              setSelectedData(newPreacticeData);
            } else if (resApiData) {
              const selectedPracticeData = resApiData?.filter(
                (f) => f.id === selectedData?.id
              )[0];
              setSelectedData(selectedPracticeData);
            } else {
              setSelectedData(undefined);
            }
          // setSelectedData(
          //   resApiData
          //     ? resApiData?.filter((f) => f.id === res.practiceID)[0]
          //     : undefined
          // );
        } else {
          setSelectedData(undefined);
        }
        setAddEditJSON(undefined);
        setIsChangedJson(false);
      } else {
        setStatusModalInfo({
          show: true,
          heading: 'Error',
          showCloseButton: false,
          text: `A system error prevented the Practice ${
            addEditJSON.id ? 'Settings changes to be saved' : 'to be created'
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
      setAddEditJSON(selectedData);
      if (
        selectedData.address1 ||
        selectedData.address2 ||
        selectedData.city ||
        selectedData.state ||
        selectedData.zipcode ||
        selectedData.zipcodeExtension
      ) {
        setDisAbleValidateAddressBtn(false);
      } else {
        setDisAbleValidateAddressBtn(true);
      }
      if (
        selectedData.payToAddress1 ||
        selectedData.payToAddress2 ||
        selectedData.payToCity ||
        selectedData.payToState ||
        selectedData.payToZip ||
        selectedData.payToZipExtension
      ) {
        setDisAbleValidatePayToAddressBtn(false);
      } else {
        setDisAbleValidatePayToAddressBtn(true);
      }
    }
  };
  const updateItemActive = async (id: string, active: boolean) => {
    const res = await updatePracticeActive(id, active);
    if (res) {
      if (selectedWorkedGroup?.groupsData[0]?.id) {
        const resApiData = await fetchProfileData(
          null,
          selectedWorkedGroup.groupsData[0].id,
          null,
          null
        );
        if (selectedData)
          setSelectedData(
            resApiData
              ? resApiData?.filter((f) => f.id === selectedData.id)[0]
              : undefined
          );
      } else {
        setSelectedData(undefined);
      }
      setAddEditJSON(undefined);
      setIsChangedJson(false);
    } else {
      setStatusModalInfo({
        show: true,
        heading: 'Error',
        showCloseButton: false,
        text: `A system error prevented the Practice ${
          addEditJSON?.id ? 'Settings changes to be saved' : 'to be created'
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
  const onValidateAddress = async (
    address: string,
    zips: string,
    category: string
  ) => {
    const res = await validatePatientAddress(
      address,
      zips,
      category,
      addEditJSON?.id ? addEditJSON?.id : null
    );
    if (res && res.validateID && !res?.error && addEditJSON) {
      if (category === 'practice address') {
        setAddEditJSON({
          ...addEditJSON,
          address1: res.address1 || '',
          address2: res.address2 || '',
          zipcode: res.zip || '',
          zipcodeExtension: res.zipPlus4 || '',
          city: res.city || '',
          state: res.state || '',
          addressValidateOn: res.validateOn || '',
          validateIDS: addEditJSON.validateIDS
            ? [...addEditJSON.validateIDS, res.validateID]
            : [res.validateID],
        });
        if (selectedData)
          setSelectedData({
            ...selectedData,
            addressValidateOn: res.validateOn || '',
          });
      } else {
        setAddEditJSON({
          ...addEditJSON,
          payToAddress1: res.address1 || '',
          payToAddress2: res.address2 || '',
          payToZip: res.zip || '',
          payToZipExtension: res.zipPlus4 || '',
          payToCity: res.city || '',
          payToState: res.state || '',
          payToAddressValidateOn: res.validateOn || '',
          validateIDS: addEditJSON.validateIDS
            ? [...addEditJSON.validateIDS, res.validateID]
            : [res.validateID],
        });
        if (selectedData)
          setSelectedData({
            ...selectedData,
            payToAddressValidateOn: res.validateOn || '',
          });
      }
      setIsChangedJson(true);
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
  const onClickGetInfoByNPI = async () => {
    const res = await getInfoByNPI(Number(addEditJSON?.npi), 'practice');
    if (res) {
      const obj1 = JSON.parse(res.result);
      if (!obj1.result_count) {
        setStatusModalInfo({
          show: true,
          heading: 'No Record Found.',
          showCloseButton: false,
          text: 'No record found against this NPI.',
          type: StatusModalType.WARNING,
        });
        return;
      }
      const obj = obj1.results;
      let ss: PracticeProfileData;

      if (obj && obj[0]) {
        const { name } = obj[0].basic;
        if (addEditJSON) {
          ss = {
            ...addEditJSON,
            name: name || '',
          };
          if (obj[0].addresses.length > 0) {
            ss = {
              ...ss,
              address1: obj[0].addresses[0].address_1,
              address2: obj[0].addresses[0].address_2,
              city: obj[0].addresses[0].city,
              state: obj[0].addresses[0].state,
              zipcode:
                obj[0].addresses[0].postal_code.length === 9
                  ? obj[0].addresses[0].postal_code.substring(0, 5)
                  : obj[0].addresses[0].postal_code,
              zipcodeExtension:
                obj[0].addresses[0].postal_code.length === 9
                  ? obj[0].addresses[0].postal_code.substring(5, 9)
                  : '',
              officePhone: obj[0].addresses[0].telephone_number
                .split('-')
                .join(''),
              taxonomy:
                obj[0].taxonomies.length > 0 ? obj[0].taxonomies[0].code : '',
            };
          }
          setAddEditJSON(ss);
        }
      }
    } else {
      setStatusModalInfo({
        show: true,
        heading: 'Error',
        showCloseButton: false,
        text: 'A system error prevented the Get Info by NPI feature from running. Please try again.',
        type: StatusModalType.ERROR,
      });
    }
  };
  return (
    <AppLayout title="Practice Settings">
      <div className="m-0 h-full w-full overflow-y-auto p-0">
        <Breadcrumbs />
        <PageHeader cls="!bg-white !drop-shadow">
          <div className="flex items-start justify-between gap-4 px-7 pt-[33px] pb-[21px]">
            <div className="flex h-[38px] gap-6">
              <p className="self-center text-3xl font-bold text-cyan-700">
                Practices Settings
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
                          addEditJSON?.id ? 'editing' : 'creating'
                        } this Practice? Clicking "Confirm" will result in the loss of all changes.`,
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
                  Create New Practice
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
            <div className="w-full gap-6 p-6">
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
                    data-testid="practiceFilter"
                    autoComplete="off"
                    id="search"
                    name="search"
                    className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 leading-5 text-gray-500 placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:text-gray-900 focus:outline-none focus:ring-white sm:text-sm"
                    placeholder="Filter by Practice Name, NPI or Address"
                    value={filterText}
                    onChange={(e) => {
                      setFilterText(e.target.value);
                    }}
                  />
                </div>
              </div>
              <div className="mt-2.5 flex gap-2">
                <CheckBox
                  data-testid="showInActivePractice"
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
            {/* <div className="h-[1px] w-full bg-gray-200" /> */}
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
                                  addEditJSON?.id ? 'editing' : 'creating'
                                } this Practice? Clicking "Confirm" will result in the loss of all changes.`,
                                type: StatusModalType.WARNING,
                                okButtonText: 'Confirm',
                                okButtonColor: ButtonType.primary,
                                confirmType:
                                  'CancelConfirmationOnSelectSaidebarItem',
                                data: d,
                              });
                            } else {
                              setAddEditJSON(undefined);
                              setSelectedData(d);
                            }
                          }}
                        >
                          <div className="h-[1px] w-full bg-gray-200" />
                          <div className="flex w-full flex-row items-center justify-center px-3 py-4">
                            <div
                              data-testid="practice_row"
                              className="flex h-full w-[90%] flex-row"
                            >
                              <div className="flex h-full w-[25%] items-center justify-center">
                                <img
                                  className={classNames(
                                    'w-12 h-12 rounded-3xl bg-gray-100'
                                  )}
                                  src={
                                    d.logoURL
                                      ? baseApiUrl + d.logoURL
                                      : defaultUserUrl
                                  }
                                />
                              </div>
                              <div className="flex w-[75%] flex-1 items-center justify-start">
                                <div className="flex w-full flex-1 items-center justify-start space-x-4">
                                  <div className="inline-flex w-full flex-1 flex-col items-start justify-start space-y-1">
                                    <p className="text-truncate-3-lines w-full text-sm font-medium leading-tight text-cyan-500">
                                      {d.name}
                                    </p>
                                    <p className="text-sm font-normal leading-5 text-gray-500">{`NPI: ${d.npi}`}</p>
                                    <p>
                                      {getStatusBadge(
                                        d.active ? 'Active' : 'inActive'
                                      )}
                                    </p>
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
                                addEditJSON.logoURL
                                  ? baseApiUrl + addEditJSON.logoURL
                                  : defaultUserUrl
                              }
                            />
                          ) : (
                            <img
                              className={classNames(
                                'w-12 h-12 rounded-3xl bg-gray-100'
                              )}
                              src={
                                selectedData?.logoURL
                                  ? baseApiUrl + selectedData.logoURL
                                  : defaultUserUrl
                              }
                            />
                          )}
                        </>
                      )}
                    </div>
                    <div className="inline-flex flex-col items-start justify-start space-y-1">
                      <p className="text-lg font-medium leading-normal text-gray-900">
                        {addEditJSON
                          ? addEditJSON.name || 'New Practice'
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
                          Practice Name{' '}
                          {addEditJSON && (
                            <span className="text-cyan-500">*</span>
                          )}
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <InputField
                              placeholder="Practice Name"
                              value={addEditJSON.name}
                              onChange={(evt) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  name: evt.target.value,
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
                          Associated With Group/Organization
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <SingleSelectDropDown
                              placeholder="-"
                              disabled={true}
                              data={selectedWorkedGroup?.groupsData || []}
                              selectedValue={selectedWorkedGroup?.groupsData[0]}
                              onSelect={() => {}}
                            />
                          </div>
                        ) : (
                          <p className="cursor-pointer text-sm leading-tight text-cyan-500 underline">
                            {selectedWorkedGroup?.groupsData[0]?.value}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          NPI{' '}
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="flex gap-2">
                            <div className=" w-[322px]">
                              <InputField
                                placeholder="NPI Number"
                                type="number"
                                value={addEditJSON.npi}
                                maxLength={10}
                                onChange={(evt) => {
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    npi: evt.target.value,
                                  });
                                }}
                              />
                            </div>
                            <Button
                              buttonType={ButtonType.primary}
                              cls={`mt-[4px] inline-flex px-4 py-2 gap-2 !h-[38px] !w-[176px] leading-tight`}
                              disabled={!addEditJSON.npi}
                              onClick={() => {
                                setStatusModalInfo({
                                  show: true,
                                  showCloseButton: true,
                                  heading: 'Alert',
                                  text: 'Are you sure to populate data?',
                                  type: StatusModalType.WARNING,
                                  okButtonText: 'Yes',
                                  okButtonColor: ButtonType.primary,
                                  confirmType: 'PopulateInfoByNPI',
                                });
                              }}
                            >
                              <Icon name={'npiFinder'} size={18} />
                              <p className="text-sm">Get Info by NPI</p>
                            </Button>
                          </div>
                        ) : (
                          <p className="text-sm leading-tight text-gray-900">
                            {selectedData?.npi}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          Taxonomy
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <InputField
                              placeholder="Taxonomy"
                              value={addEditJSON.taxonomy}
                              minLength={10}
                              onChange={(evt) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  taxonomy: evt.target.value,
                                });
                              }}
                            />
                          </div>
                        ) : (
                          <p className="text-sm leading-tight text-gray-900">
                            {selectedData?.taxonomy}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          Tax ID
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <InputField
                              placeholder="Tax ID"
                              maxLength={9}
                              type="number"
                              value={addEditJSON.taxid}
                              onChange={(evt) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  taxid: evt.target.value,
                                });
                              }}
                            />
                          </div>
                        ) : (
                          <p className="text-sm leading-tight text-gray-900">
                            {selectedData?.taxid}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          Practice Logo
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
                                  logoName: e.name,
                                });
                              }}
                              selectedFileName={addEditJSON.logoName || ''}
                              cls={'h-[38px] flex-[2_2_0%] inline-flex'}
                            ></UploadFile>
                            <Button
                              className="inline-flex h-[38px] w-[38px] items-center justify-center gap-2 rounded-md border border border border border-gray-300 bg-gray-100 p-[9px] shadow"
                              onClick={() => {
                                setSelectedFile(undefined);
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  logoName: '',
                                  logoURL: '',
                                });
                                setRemoveLogo(true);
                              }}
                            >
                              <Icon name={'trash'} />
                            </Button>
                          </div>
                        ) : (
                          <p className="text-sm leading-tight text-gray-900">
                            {selectedData?.logoName}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex h-[60px] w-full flex-col items-start justify-center">
                      <div className="inline-flex w-full items-center justify-start space-x-2">
                        <div className="flex h-full w-[50%] items-center justify-start space-x-2">
                          <p className="text-base font-bold leading-normal text-gray-900">
                            Address
                          </p>
                          {selectedData?.addressValidateOn && (
                            <div className="flex items-center justify-start space-x-2">
                              <div className="flex items-center justify-start space-x-1">
                                <Icon name={'greenCheck'} size={18} />
                                <p className="text-xs font-medium leading-none text-green-600">
                                  Verified Address
                                </p>
                              </div>
                              {!!selectedData?.addressValidateOn && (
                                <p className="text-xs leading-none text-gray-500">
                                  (Verified On:{' '}
                                  {DateToStringPipe(
                                    selectedData?.addressValidateOn,
                                    2
                                  )}
                                  )
                                </p>
                              )}
                            </div>
                          )}
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
                                  !addEditJSON.zipcode
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
                                  addEditJSON.zipcode,
                                  'practice address'
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
                              {selectedData?.address1}
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
                              {selectedData?.address2}
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
                              {selectedData?.city}
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
                                placeholder="State"
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
                                    state: '',
                                  });
                                  setDisAbleValidateAddressBtn(false);
                                }}
                              />
                            </div>
                          ) : (
                            <p className="text-sm leading-tight text-gray-900">
                              {selectedData?.state}
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
                                value={addEditJSON.zipcode}
                                type={'number'}
                                onChange={(evt) => {
                                  const zipCodeValue = evt.target.value.slice(
                                    0,
                                    5
                                  );
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    zipcode: zipCodeValue,
                                  });
                                  setDisAbleValidateAddressBtn(false);
                                }}
                              />
                            </div>
                          ) : (
                            <p className="text-sm leading-tight text-gray-900">
                              {selectedData?.zipcode}
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
                                value={addEditJSON.zipcodeExtension}
                                type={'number'}
                                onChange={(evt) => {
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    zipcodeExtension: evt.target.value.slice(
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
                              {selectedData?.zipcodeExtension}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="h-[1px] w-full bg-gray-200" />
                    </>
                    <div className="h-[1px] w-full bg-gray-200" />
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
                              {selectedData?.contactPerson}
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
                                  `h-[38px] mt-1 border-solid border border-gray-300 gap-2 inline-flex items-center rounded-md text-gray-900 leading-5 text-left font-normal px-[10px] pt-[9px] pb-[9px] w-full overflow-clip font-['Nunito'] bg-white`
                                )}
                              >
                                <InputMask
                                  placeholder={'(000) 000-0000'}
                                  mask="(999) 999-9999"
                                  className={classNames(
                                    'flex w-full h-full text-black focus:outline-none items-center justify-center text-sm leading-5 self-center pr-2 bg-transparent'
                                  )}
                                  value={addEditJSON.officePhone || ''}
                                  onChange={(evt) => {
                                    handleAddUpdateJson({
                                      ...addEditJSON,
                                      officePhone: evt.target.value,
                                    });
                                    const phoneNumber =
                                      evt.target.value === '(___) ___-____'
                                        ? ''
                                        : evt.target.value;
                                    setOfficePhone(phoneNumber);
                                  }}
                                />
                                {/* <InputField
                                placeholder="000-000-0000"
                                maxLength={12}
                                value={addEditJSON.officePhone}
                                onChange={(evt) => {
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    officePhone: evt.target.value,
                                  });
                                }}
                              /> */}
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm leading-tight text-gray-900">
                              {selectedData?.officePhone}
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
                              <InputField
                                placeholder="Fax"
                                value={addEditJSON.fax}
                                onChange={(evt) => {
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    fax: evt.target.value,
                                  });
                                }}
                              />
                            </div>
                          ) : (
                            <p className="text-sm leading-tight text-gray-900">
                              {selectedData?.fax}
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
                              {selectedData?.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="h-[1px] w-full bg-gray-200" />
                    </>
                    <div className="flex h-[60px] w-full flex-col items-start justify-center">
                      <div className="inline-flex w-full items-center justify-start space-x-2">
                        <div className="flex h-full w-[50%] items-center justify-start space-x-2">
                          <p className="text-base font-bold leading-normal text-gray-900">
                            Pay To
                          </p>
                          {selectedData?.payToAddressValidateOn && (
                            <div className="flex items-center justify-start space-x-2">
                              <div className="flex items-center justify-start space-x-1">
                                <Icon name={'greenCheck'} size={18} />
                                <p className="text-xs font-medium leading-none text-green-600">
                                  Verified Address
                                </p>
                              </div>
                              {!!selectedData?.payToAddressValidateOn && (
                                <p className="text-xs leading-none text-gray-500">
                                  (Verified On:{' '}
                                  {DateToStringPipe(
                                    selectedData?.payToAddressValidateOn,
                                    2
                                  )}
                                  )
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex w-[50%] items-center justify-end">
                          {!!addEditJSON && (
                            <Button
                              buttonType={ButtonType.primary}
                              disabled={disAbleValidatePayToAddressBtn}
                              cls={`inline-flex ml-[10px] !justify-center w-[203px] h-[38px] gap-2`}
                              onClick={() => {
                                if (
                                  !addEditJSON.payToAddress1 ||
                                  !addEditJSON.payToZip
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
                                  addEditJSON.payToAddress1,
                                  addEditJSON.payToZip,
                                  'practice payto address'
                                );
                              }}
                            >
                              <Icon
                                name={'verified'}
                                size={18}
                                color={
                                  disAbleValidatePayToAddressBtn
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
                                value={addEditJSON.payToAddress1}
                                onChange={(evt) => {
                                  const addressValue = evt.target.value;
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    payToAddress1: addressValue,
                                  });
                                  setDisAbleValidatePayToAddressBtn(false);
                                }}
                              />
                            </div>
                          ) : (
                            <p className="text-sm leading-tight text-gray-900">
                              {selectedData?.payToAddress1}
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
                                value={addEditJSON.payToAddress2}
                                onChange={(evt) => {
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    payToAddress2: evt.target.value,
                                  });
                                  setDisAbleValidatePayToAddressBtn(false);
                                }}
                              />
                            </div>
                          ) : (
                            <p className="text-sm leading-tight text-gray-900">
                              {selectedData?.payToAddress2}
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
                                value={addEditJSON.payToCity}
                                onChange={(evt) => {
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    payToCity: evt.target.value,
                                  });
                                  setDisAbleValidatePayToAddressBtn(false);
                                }}
                              />
                            </div>
                          ) : (
                            <p className="text-sm font-normal leading-5 text-gray-900">
                              {selectedData?.payToCity}
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
                                placeholder="State"
                                data={
                                  patientlookupData?.states
                                    ? (patientlookupData.states as SingleSelectDropDownDataType[])
                                    : []
                                }
                                selectedValue={
                                  patientlookupData?.states.filter(
                                    (f) => f.value === addEditJSON.payToState
                                  )[0]
                                }
                                onSelect={(value) => {
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    payToState: value.value,
                                  });
                                  setDisAbleValidatePayToAddressBtn(false);
                                }}
                                isOptional
                                onDeselectValue={() => {
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    payToState: '',
                                  });
                                  setDisAbleValidatePayToAddressBtn(false);
                                }}
                              />
                            </div>
                          ) : (
                            <p className="text-sm font-normal leading-5 text-gray-900">
                              {selectedData?.payToState}
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
                                value={addEditJSON.payToZip}
                                type={'number'}
                                onChange={(evt) => {
                                  const zipCodeValue = evt.target.value.slice(
                                    0,
                                    5
                                  );
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    payToZip: zipCodeValue,
                                  });
                                  setDisAbleValidatePayToAddressBtn(false);
                                }}
                              />
                            </div>
                          ) : (
                            <p className="text-sm leading-tight text-gray-900">
                              {selectedData?.payToZip}
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
                                value={addEditJSON.payToZipExtension}
                                type={'number'}
                                onChange={(evt) => {
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    payToZipExtension: evt.target.value.slice(
                                      0,
                                      4
                                    ),
                                  });
                                  setDisAbleValidatePayToAddressBtn(false);
                                }}
                              />
                            </div>
                          ) : (
                            <p className="text-sm leading-tight text-gray-900">
                              {selectedData?.payToZipExtension}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="h-[1px] w-full bg-gray-200" />
                    </>
                    <div className="flex h-[60px] w-full flex-col items-start justify-center">
                      <div className="inline-flex w-full items-center justify-start space-x-2">
                        <p className="text-base font-bold leading-normal text-gray-900">
                          Statement Settings
                        </p>
                      </div>
                    </div>
                    <>
                      <div className="inline-flex w-full items-center justify-end space-x-4 py-3">
                        <div className="flex w-[33%] items-start justify-start space-x-4 self-start">
                          <p className="text-sm leading-tight text-gray-500">
                            Settings
                          </p>
                        </div>
                        <div className=" w-[67%] items-start justify-start rounded-md border border-gray-300">
                          <div className="flex w-full justify-between p-3">
                            <div className="self-center text-sm font-normal leading-5 text-gray-900">
                              Statement Days
                            </div>
                            <div>
                              {addEditJSON ? (
                                <div className="w-full">
                                  <InputField
                                    placeholder="Statement Days"
                                    value={addEditJSON.statementDays}
                                    type={'number'}
                                    onChange={(evt) => {
                                      handleAddUpdateJson({
                                        ...addEditJSON,
                                        statementDays: Number(evt.target.value),
                                      });
                                    }}
                                  />
                                </div>
                              ) : (
                                <p className="text-sm leading-tight text-gray-900">
                                  {selectedData?.statementDays}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="h-[1px] w-full bg-gray-200" />
                          <div className="flex w-full justify-between p-3">
                            <div className="w-[50%] self-center text-sm font-normal leading-5 text-gray-900">
                              Exclude Statement Balance If Less Than
                            </div>
                            <div>
                              {addEditJSON ? (
                                <div className="w-full">
                                  <InputField
                                    placeholder="Exclude Statement Balance If Less Than"
                                    value={addEditJSON.excludeStatementBalance}
                                    type={'number'}
                                    onChange={(evt) => {
                                      handleAddUpdateJson({
                                        ...addEditJSON,
                                        excludeStatementBalance: Number(
                                          evt.target.value
                                        ),
                                      });
                                    }}
                                  />
                                </div>
                              ) : (
                                <p className="text-sm leading-tight text-gray-900">
                                  {selectedData?.excludeStatementBalance
                                    ? currencyFormatter.format(
                                        selectedData?.excludeStatementBalance
                                      )
                                    : ''}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="h-[1px] w-full bg-gray-200" />
                          <div className="inline-flex w-full items-start justify-start space-x-4 py-3 pl-3 pr-4">
                            <div className="flex flex-1 items-start justify-start space-x-2">
                              <p className="text-sm leading-tight text-gray-900">
                                Statement Message
                              </p>
                            </div>
                            <TextArea
                              id="textarea"
                              value={
                                addEditJSON
                                  ? addEditJSON.statementMessage || ''
                                  : selectedData?.statementMessage || ''
                              }
                              disabled={!addEditJSON}
                              cls="h-[120px] !bg-white flex items-end justify-end flex-1 h-full pl-3 pr-0.5 pt-2 pb-0.5 bg-white shadow border rounded-md border-gray-300"
                              placeholder={'Enter Message Here'}
                              onChange={(evt) => {
                                if (addEditJSON)
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    statementMessage: evt.target.value,
                                  });
                              }}
                              style={{
                                resize: !addEditJSON ? 'none' : undefined,
                              }}
                            />
                          </div>
                          <div className="h-[1px] w-full bg-gray-200" />
                          <div className="inline-flex w-full items-start justify-start space-x-4 py-3 pl-3 pr-4">
                            <div className="flex flex-1 items-start justify-start space-x-2">
                              <p className="text-sm leading-tight text-gray-900">
                                Current Statement Message
                              </p>
                            </div>
                            <TextArea
                              id="textarea"
                              value={
                                addEditJSON
                                  ? addEditJSON.currentMessage || ''
                                  : selectedData?.currentMessage || ''
                              }
                              disabled={!addEditJSON}
                              cls="h-[120px] !bg-white flex items-end justify-end flex-1 h-full pl-3 pr-0.5 pt-2 pb-0.5 bg-white shadow border rounded-md border-gray-300"
                              placeholder={'Enter Message Here'}
                              onChange={(evt) => {
                                if (addEditJSON)
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    currentMessage: evt.target.value,
                                  });
                              }}
                              style={{
                                resize: !addEditJSON ? 'none' : undefined,
                              }}
                            />
                          </div>
                          <div className="h-[1px] w-full bg-gray-200" />
                          <div className="inline-flex w-full items-start justify-start space-x-4 py-3 pl-3 pr-4">
                            <div className="flex flex-1 items-start justify-start space-x-2">
                              <p className="text-sm leading-tight text-gray-900">
                                30+ Days Statement Message
                              </p>
                            </div>
                            <TextArea
                              id="textarea"
                              value={
                                addEditJSON
                                  ? addEditJSON.thirtyPlusMessage || ''
                                  : selectedData?.thirtyPlusMessage || ''
                              }
                              disabled={!addEditJSON}
                              cls="h-[120px] !bg-white flex items-end justify-end flex-1 h-full pl-3 pr-0.5 pt-2 pb-0.5 bg-white shadow border rounded-md border-gray-300"
                              placeholder={'Enter Message Here'}
                              onChange={(evt) => {
                                if (addEditJSON)
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    thirtyPlusMessage: evt.target.value,
                                  });
                              }}
                              style={{
                                resize: !addEditJSON ? 'none' : undefined,
                              }}
                            />
                          </div>
                          <div className="h-[1px] w-full bg-gray-200" />
                          <div className="inline-flex w-full items-start justify-start space-x-4 py-3 pl-3 pr-4">
                            <div className="flex flex-1 items-start justify-start space-x-2">
                              <p className="text-sm leading-tight text-gray-900">
                                60+ Days Statement Message
                              </p>
                            </div>
                            <TextArea
                              id="textarea"
                              value={
                                addEditJSON
                                  ? addEditJSON.sixtyPlusMessage || ''
                                  : selectedData?.sixtyPlusMessage || ''
                              }
                              disabled={!addEditJSON}
                              cls="h-[120px] !bg-white flex items-end justify-end flex-1 h-full pl-3 pr-0.5 pt-2 pb-0.5 bg-white shadow border rounded-md border-gray-300"
                              placeholder={'Enter Message Here'}
                              onChange={(evt) => {
                                if (addEditJSON)
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    sixtyPlusMessage: evt.target.value,
                                  });
                              }}
                              style={{
                                resize: !addEditJSON ? 'none' : undefined,
                              }}
                            />
                          </div>
                          <div className="h-[1px] w-full bg-gray-200" />
                          <div className="inline-flex w-full items-start justify-start space-x-4 py-3 pl-3 pr-4">
                            <div className="flex flex-1 items-start justify-start space-x-2">
                              <p className="text-sm leading-tight text-gray-900">
                                90+ Days Statement Message
                              </p>
                            </div>
                            <TextArea
                              id="textarea"
                              value={
                                addEditJSON
                                  ? addEditJSON.nintyPlusMessage || ''
                                  : selectedData?.nintyPlusMessage || ''
                              }
                              disabled={!addEditJSON}
                              cls="h-[120px] !bg-white flex items-end justify-end flex-1 h-full pl-3 pr-0.5 pt-2 pb-0.5 bg-white shadow border rounded-md border-gray-300"
                              placeholder={'Enter Message Here'}
                              onChange={(evt) => {
                                if (addEditJSON)
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    nintyPlusMessage: evt.target.value,
                                  });
                              }}
                              style={{
                                resize: !addEditJSON ? 'none' : undefined,
                              }}
                            />
                          </div>
                          <div className="h-[1px] w-full bg-gray-200" />
                          <div className="inline-flex w-full items-start justify-start space-x-4 py-3 pl-3 pr-4">
                            <div className="flex flex-1 items-start justify-start space-x-2">
                              <p className="text-sm leading-tight text-gray-900">
                                120+ Days Statement Message
                              </p>
                            </div>
                            <TextArea
                              id="textarea"
                              value={
                                addEditJSON
                                  ? addEditJSON.oneTwentyPlusMessage || ''
                                  : selectedData?.oneTwentyPlusMessage || ''
                              }
                              disabled={!addEditJSON}
                              cls="h-[120px] !bg-white flex items-end justify-end flex-1 h-full pl-3 pr-0.5 pt-2 pb-0.5 bg-white shadow border rounded-md border-gray-300"
                              placeholder={'Enter Message Here'}
                              onChange={(evt) => {
                                if (addEditJSON)
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    oneTwentyPlusMessage: evt.target.value,
                                  });
                              }}
                              style={{
                                resize: !addEditJSON ? 'none' : undefined,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  </>
                </div>

                <div className="h-[1px] w-full bg-gray-200" />
                <div className="flex h-[60px] w-full flex-col items-start justify-center">
                  <div className="inline-flex w-full items-center justify-start space-x-2">
                    <p className="text-base font-bold leading-normal text-gray-900">
                      General Settings
                    </p>
                  </div>
                </div>
                <div className="flex w-full flex-col items-start justify-center py-4">
                  <div className="inline-flex w-full items-start justify-start space-x-4">
                    <p className="w-60 text-sm font-medium leading-tight text-gray-500">
                      Settings
                    </p>
                    <div className="flex w-full justify-end">
                      <div className="inline-flex flex-col items-start justify-start rounded-md border border-gray-200">
                        <div className="inline-flex w-full items-center justify-center space-x-4 py-3 pl-3 pr-4">
                          <div className="flex w-[50%] items-start justify-start">
                            <p className="text-sm leading-tight text-gray-900">
                              Active
                            </p>
                          </div>
                          <div className="flex w-[50%] items-start justify-end gap-2">
                            {addEditJSON ? (
                              <ToggleButton
                                value={addEditJSON.active}
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
                <div className="inline-flex w-full items-center justify-center pt-6 pb-7">
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
                                heading: 'Deactivate Practice Confirmation',
                                text: 'Deactivating a Practice will make it unavailable throughout the system.\nAre you sure you want to proceed with this action?',
                                type: StatusModalType.ERROR,
                                okButtonText: 'Yes, Deactivate Practice',
                                okButtonColor: ButtonType.tertiary,
                                confirmType:
                                  'CancelConfirmationOnHandleActivateItem',
                              });
                            } else {
                              setStatusModalInfo({
                                show: true,
                                showCloseButton: true,
                                heading: 'Activate Practice Confirmation',
                                text: 'Activating a Practice will make it unavailable throughout the system.\nAre you sure you want to proceed with this action?',
                                type: StatusModalType.WARNING,
                                okButtonText: 'Yes, Activate Practice',
                                okButtonColor: ButtonType.primary,
                                confirmType:
                                  'CancelConfirmationOnHandleActivateItem',
                              });
                            }
                          }}
                        >
                          {selectedData?.active ? 'Deactivate' : 'Activate'}{' '}
                          Practice
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
                                  addEditJSON?.id ? 'editing' : 'creating'
                                } this Practice? Clicking "Confirm" will result in the loss of all changes.`,
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
                          {addEditJSON.id ? 'Save Changes' : 'Add Practice'}
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
              setAddEditJSON(undefined);
              setIsChangedJson(false);
              setSelectedData(statusModalInfo.data);
            }
            if (
              statusModalInfo.data &&
              statusModalInfo.confirmType ===
                'CancelConfirmationOnSelectPractice'
            ) {
              setAddEditJSON(undefined);
              setIsChangedJson(false);
              setSelectedData(undefined);
              setPracticeSelectedValue(statusModalInfo.data);
            }
            if (statusModalInfo.confirmType === 'CancelConfirmationOnAdd') {
              setIsChangedJson(false);
              handleAddForm();
            }
            if (statusModalInfo.confirmType === 'CancelConfirmationOnReset') {
              // isResetPassword();
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
                updateItemActive(
                  selectedData.id.toString(),
                  !selectedData.active
                );
            }
            if (statusModalInfo.confirmType === 'PopulateInfoByNPI') {
              if (addEditJSON?.npi.length !== 10) {
                setStatusModalInfo({
                  show: true,
                  heading: 'Invalid NPI.',
                  showCloseButton: false,
                  text: 'NPI must be 10 digits.',
                  type: StatusModalType.ERROR,
                });
                return;
              }
              onClickGetInfoByNPI();
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

export default Practices;
