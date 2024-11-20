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
import type { MultiSelectDropDownDataType } from '@/components/UI/MultiSelectDropDown';
import MultiSelectDropDown from '@/components/UI/MultiSelectDropDown';
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
  addProvider,
  getInfoByNPI,
  getPatientLookup,
  getProviderInfoByID,
  getProvidersProfileData,
  getTimeDropdown,
  getUserLookupDropowns,
  updateProvider,
  updateProviderActive,
  validatePatientAddress,
} from '@/store/shared/sagas';
import type {
  LookupDropdownsDataType,
  PatientLookupDropdown,
  ProviderFields,
  ProviderResultData,
  UserLookup,
} from '@/store/shared/types';
import { ToastType } from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';
import { DateToStringPipe } from '@/utils/dateConversionPipes';

interface Tprops {
  selectedProviderID: number | undefined;
}

const SettingsProviders = ({ selectedProviderID }: Tprops) => {
  const dispatch = useDispatch();
  const baseApiUrl = baseUrl.substring(0, baseUrl.lastIndexOf('/'));
  const defaultUserUrl = '/assets/DefaultUser.png';
  const selectedWorkedGroup = useSelector(getselectdWorkGroupsIDsSelector);
  const [patientlookupData, setPatientlookupData] =
    useState<PatientLookupDropdown>();
  const patientLookupData = async () => {
    const res = await getPatientLookup();
    if (res) {
      setPatientlookupData(res);
    }
  };

  const workingDays: MultiSelectDropDownDataType[] = [
    { id: 1, value: 'Monday' },
    { id: 2, value: 'Tuesday' },
    { id: 3, value: 'Wednesday' },
    { id: 4, value: 'Thursday' },
    { id: 5, value: 'Friday' },
    { id: 6, value: 'Saturday' },
    { id: 0, value: 'Sunday' },
  ];
  const [TimeData, setTimeData] = useState<LookupDropdownsDataType[] | null>(
    null
  );
  const providerTimeData = async () => {
    const res = await getTimeDropdown();
    if (res) {
      setTimeData(res);
    }
  };
  useEffect(() => {
    providerTimeData();
  }, []);

  useEffect(() => {
    patientLookupData();
  }, []);
  const [disAbleValidateAddressBtn, setDisAbleValidateAddressBtn] =
    useState(true);
  const [selectedFile, setSelectedFile] = useState<File>();
  const [removeLogo, setRemoveLogo] = useState(false);
  const [userLookupDropowns, setUserLookupDropowns] = useState<UserLookup>();
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
  const [practiceSelectedValue, setPracticeSelectedValue] =
    useState<SingleSelectDropDownDataType>();
  const [apiData, setApiData] = useState<ProviderResultData[]>([]);

  const [filterText, setFilterText] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [filterData, setFilterData] = useState<ProviderResultData[]>([]);
  const [selectedData, setSelectedData] = useState<ProviderFields>();
  const [uniqueFirstLetters, setUniqueFirstLetters] = useState<string[]>([]);
  const [addEditJSON, setAddEditJSON] = useState<ProviderFields>();
  const [isChangedJson, setIsChangedJson] = useState(false);

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

  const fetchProfileData = async (groupID: number) => {
    const res = await getProvidersProfileData(groupID);
    if (res) {
      setApiData(res);
    }
    return res;
  };

  const fetchProviderInfoByID = async (id: number | undefined) => {
    setSelectedFile(undefined);
    const res = await getProviderInfoByID(id);
    if (res) {
      setAddEditJSON(undefined);
      setSelectedData({
        ...res,
      });
    }
  };

  useEffect(() => {
    if (selectedWorkedGroup?.groupsData[0]?.id) {
      resetSidebarData();
      fetchProfileData(selectedWorkedGroup.groupsData[0].id);
    }
  }, [practiceSelectedValue]);

  const handleFilterData = () => {
    const filterRes = apiData.filter((item) => {
      const { name, npi } = item;
      const searchText = filterText.toLowerCase();

      return (
        (name && name.toLowerCase().includes(searchText)) ||
        (npi &&
          npi.includes(searchText) &&
          (showInactive || item.active !== showInactive))
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
    if (selectedProviderID) fetchProviderInfoByID(selectedProviderID);
  };

  useEffect(() => {
    handleFilterData();
  }, [filterText, apiData, showInactive]);

  const handleAddUpdateJson = (value: ProviderFields) => {
    setAddEditJSON(value);
    setIsChangedJson(true);
  };

  const fetchUserLookupDropowns = async () => {
    const res = await getUserLookupDropowns();
    if (res) {
      setUserLookupDropowns(res);
    }
  };

  const initProfile = () => {
    fetchUserLookupDropowns();
  };

  useEffect(() => {
    initProfile();
  }, []);

  const handleAddForm = () => {
    if (selectedWorkedGroup?.groupsData[0]?.id) {
      setSelectedFile(undefined);
      setRemoveLogo(false);
      const obj: ProviderFields = {
        groupID: selectedWorkedGroup?.groupsData[0].id,
        firstName: '',
        lastName: '',
        middleName: '',
        name: '',
        imgName: '',
        npi: '',
        taxonomy: '',
        addressValidateOn: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        zipcode: '',
        zipcodeExtension: '',
        homePhone: '',
        officePhone: '',
        fax: '',
        email: '',
        workingDays: '',
        overrideBlockSlots: false,
        overbookingAllowed: false,
        active: false,
        comments: '',
        createdOn: '',
        createdByID: '',
        createdBy: '',
        updatedOn: '',
        updatedByID: '',
        updatedBy: '',
        timeZoneID: 0,
        overbookingLimit: '',
        startTime: '',
        endTime: '',
        validateIDS: [],
        group: '',
      };
      setAddEditJSON({ ...obj });
      setDisAbleValidateAddressBtn(true);
    }
  };

  // const validatePhoneNumber = (phoneNumber: string | undefined) => {
  //   // Validate the format (XXX) XXX-XXXX using a regex
  //   const regex = /^\(\d{3}\) \d{3}-\d{4}$/;
  //   // Test the phone number against the regex
  //   return regex.test(phoneNumber);
  // };

  // const validateEmail = (email: string) => {
  //   const filter =
  //     // eslint-disable-next-line no-useless-escape
  //     /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z]{2,3})+$/;
  //   return filter.test(email);
  // };

  // if (!validatePhoneNumber(addEditJSON?.homePhone)) {
  //   dispatch(
  //     addToastNotification({
  //       id: uuidv4(),
  //       text: 'Phone number is invalid.',
  //       toastType: ToastType.ERROR,
  //     })
  //   );
  //   return;
  // }

  const submitAddEditToAPI = async () => {
    if (addEditJSON) {
      if (
        !addEditJSON.firstName ||
        !addEditJSON.lastName ||
        !addEditJSON.name ||
        !addEditJSON.groupID ||
        !addEditJSON.workingDays
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
      let providerData;
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
      if (
        addEditJSON.taxonomy.length !== 0 &&
        (addEditJSON.taxonomy.length < 10 || addEditJSON.taxonomy.length > 10)
      ) {
        dispatch(
          addToastNotification({
            id: uuidv4(),
            text: 'Taxonomy Code must be of 10 characters.',
            toastType: ToastType.ERROR,
          })
        );
        return;
      }
      if (addEditJSON.id) {
        providerData = {
          providerID: addEditJSON.id,
          firstName: addEditJSON.firstName,
          middleName: addEditJSON.middleName,
          lastName: addEditJSON.lastName,
          name: addEditJSON.name,
          groupid: selectedWorkedGroup?.groupsData[0]?.id,
          npi: addEditJSON.npi,
          taxonomy: addEditJSON.taxonomy,
          address1: addEditJSON.address1,
          address2: addEditJSON.address2,
          city: addEditJSON.city,
          state: addEditJSON.state,
          zipcode: addEditJSON.zipcode,
          zipcodeextention: addEditJSON.zipcodeExtension,
          homephone: addEditJSON.homePhone,
          officephone: addEditJSON.officePhone,
          fax: addEditJSON.fax,
          email: addEditJSON.email,
          timeZoneID: addEditJSON.timeZoneID,
          startTime: addEditJSON.startTime,
          endTime: addEditJSON.endTime,
          workingDays: addEditJSON.workingDays,
          overrideBlockSlots: addEditJSON.overrideBlockSlots,
          overBookingAllowed: addEditJSON.overbookingAllowed,
          overBookingLimit: addEditJSON.overbookingLimit,
          active: addEditJSON.active,
          comments: addEditJSON.comments,
          validateIDS: addEditJSON.validateIDS,
        };
      } else {
        providerData = {
          firstName: addEditJSON.firstName,
          middleName: addEditJSON.middleName,
          lastName: addEditJSON.lastName,
          name: addEditJSON.name,
          groupid: selectedWorkedGroup?.groupsData[0]?.id,
          npi: addEditJSON.npi,
          taxonomy: addEditJSON.taxonomy,
          address1: addEditJSON.address1,
          address2: addEditJSON.address2,
          city: addEditJSON.city,
          state: addEditJSON.state,
          zipcode: addEditJSON.zipcode,
          zipcodeextention: addEditJSON.zipcodeExtension,
          homephone: addEditJSON.homePhone,
          officephone: addEditJSON.officePhone,
          fax: addEditJSON.fax,
          email: addEditJSON.email,
          timeZoneID: addEditJSON.timeZoneID,
          startTime: addEditJSON.startTime,
          endTime: addEditJSON.endTime,
          workingDays: addEditJSON.workingDays,
          overrideBlockSlots: addEditJSON.overrideBlockSlots,
          overBookingAllowed: addEditJSON.overbookingAllowed,
          overBookingLimit: addEditJSON.overbookingLimit,
          active: addEditJSON.active,
          comments: addEditJSON.comments,
          validateIDS: addEditJSON.validateIDS,
        };
      }

      const formData = new FormData();
      formData.append('provider', JSON.stringify(providerData));
      if (selectedFile) formData.append('logo', selectedFile);
      formData.append('removeLogo', String(removeLogo));

      let res: any;
      if (addEditJSON.id) {
        res = await updateProvider(formData);
      } else {
        res = await addProvider(formData);
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
          fetchProfileData(selectedWorkedGroup.groupsData[0].id);
        }
        if (selectedData) {
          await fetchProviderInfoByID(selectedData.id);
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
          text: `A system error prevented the Provider${
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
    }
    setDisAbleValidateAddressBtn(true);
  };

  const updateItemActive = async (id: number, active: boolean) => {
    const res = await updateProviderActive(id, active);
    if (res) {
      if (selectedWorkedGroup?.groupsData[0]?.id) {
        fetchProfileData(selectedWorkedGroup.groupsData[0].id);
      }
      if (selectedData) {
        await fetchProviderInfoByID(selectedData.id);
      } else {
        setSelectedData(undefined);
      }
    } else {
      setStatusModalInfo({
        show: true,
        heading: 'Error',
        showCloseButton: false,
        text: `A system error prevented the Provider to be ${
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
      'provider address',
      addEditJSON?.id ? addEditJSON?.id : null
    );
    if (res && res.validateID && !res?.error && addEditJSON) {
      setAddEditJSON({
        ...addEditJSON,
        address1: res.address1 || '',
        address2: res.address2 || '',
        zipcode: res.zip || '',
        zipcodeExtension: res.zipPlus4 || '',
        city: res.city || '',
        state: res.state || '',
        // validateIDS: [...addEditJSON.validateIDS, res.validateID],
      });
    }
    if (selectedData)
      setSelectedData({
        ...selectedData,
        addressValidateOn: res?.validateOn || '',
      });
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
    setDisAbleValidateAddressBtn(true);
  };

  const onClickGetInfoByNPI = async () => {
    const res = await getInfoByNPI(Number(addEditJSON?.npi), 'provider');
    if (res) {
      const obj1 = JSON.parse(res.result);
      const obj = obj1.results;
      let newobj: ProviderFields;
      if (obj && obj[0]) {
        const { name } = obj[0].basic;
        if (addEditJSON) {
          newobj = {
            ...addEditJSON,
            name: name || '',
            firstName: obj[0].basic.first_name || '',
            lastName: obj[0].basic.last_name || '',
          };
          if (obj[0].addresses.length > 0) {
            newobj = {
              ...newobj,
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
          setAddEditJSON(newobj);
        }
      }
    }
  };

  return (
    <AppLayout title="Provider Settings">
      <div className="m-0 h-full w-full overflow-y-auto p-0">
        <Breadcrumbs />
        <PageHeader cls="!bg-white !drop-shadow">
          <div className="flex items-start justify-between gap-4 px-7 pt-[33px] pb-[21px]">
            <div className="flex h-[38px] gap-6">
              <p className="self-center text-3xl font-bold text-cyan-700">
                Provider Settings
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
                        } this Provider? Clicking "Confirm" will result in the loss of all changes.`,
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
                  Add New provider
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
            <div
              className="z-[1] w-full gap-6 border-b border-gray-200 bg-gray-50 p-6"
              style={{ position: 'sticky', top: 0 }}
            >
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
                    data-testid="practicesFilterTestId"
                    autoComplete="off"
                    id="search"
                    name="search"
                    className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 leading-5 text-gray-500 placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:text-gray-900 focus:outline-none focus:ring-white sm:text-sm"
                    placeholder="Filter by Provider Name or NPI"
                    value={filterText}
                    onChange={(e) => {
                      setFilterText(e.target.value);
                    }}
                  />
                </div>
              </div>
              <div className="mt-2.5 flex gap-2">
                <CheckBox
                  data-testid="showInActiveProvider"
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
                                } this Provider? Clicking "Confirm" will result in the loss of all changes.`,
                                type: StatusModalType.WARNING,
                                okButtonText: 'Confirm',
                                okButtonColor: ButtonType.primary,
                                confirmType:
                                  'CancelConfirmationOnSelectSaidebarItem',
                                data: d.id,
                              });
                              return;
                            }
                            fetchProviderInfoByID(d.id);
                          }}
                        >
                          <div className="h-[1px] w-full bg-gray-200" />
                          <div className="flex w-full flex-row items-center justify-center px-3 py-4">
                            <div
                              data-testid="providers_row"
                              className="flex h-full w-[90%] flex-row"
                            >
                              <div className="flex h-full w-[25%] items-center justify-center">
                                <img
                                  className={classNames(
                                    'w-12 h-12 rounded-3xl bg-gray-100'
                                  )}
                                  src={
                                    d.imgURL
                                      ? baseApiUrl + d.imgURL
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
                                    <div className="flex w-full flex-col items-start justify-start space-y-1">
                                      {/* <div className="inline-flex w-full items-center justify-start space-x-1.5"> */}

                                      <p className="truncate text-sm leading-tight text-gray-500">
                                        NPI: {d.npi}
                                      </p>
                                      {/* </div> */}
                                      {/* <div className="inline-flex w-full items-center justify-start space-x-1.5">
                                        <Icon
                                          name="email"
                                          size={13}
                                          color={IconColors.GRAY_300}
                                        />
                                        <p className="truncate text-sm leading-tight text-gray-500">
                                          {d.email}
                                        </p>
                                      </div> */}
                                      {getStatusBadge(
                                        d.active ? 'Active' : 'inActive'
                                      )}
                                    </div>
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
                                addEditJSON.imgName // imgURL
                                  ? baseApiUrl + addEditJSON.imgName
                                  : defaultUserUrl
                              }
                            />
                          ) : (
                            <img
                              className={classNames(
                                'w-12 h-12 rounded-3xl bg-gray-100'
                              )}
                              src={
                                selectedData?.imgName
                                  ? baseApiUrl + selectedData.imgName
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
                          ? addEditJSON.firstName || 'New Provider'
                          : selectedData?.firstName}
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
                          First Name<span className="text-cyan-500">*</span>{' '}
                          {/* {addEditJSON && (
                            <span className="text-cyan-500">*</span>
                          )} */}
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <InputField
                              placeholder="First Name"
                              value={addEditJSON.firstName}
                              onChange={(evt) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  firstName: evt.target.value,
                                });
                              }}
                            />
                          </div>
                        ) : (
                          <p className="text-sm leading-tight text-gray-900">
                            {selectedData?.firstName}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          Middle Name{' '}
                          {/* {addEditJSON && (
                            <span className="text-cyan-500">*</span>
                          )} */}
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <InputField
                              placeholder="Middle Name"
                              value={addEditJSON.middleName}
                              onChange={(evt) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  middleName: evt.target.value,
                                });
                              }}
                            />
                          </div>
                        ) : (
                          <p className="text-sm leading-tight text-gray-900">
                            {selectedData?.middleName}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          Last Name<span className="text-cyan-500">*</span>{' '}
                          {/* {addEditJSON && (
                            <span className="text-cyan-500">*</span>
                          )} */}
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <InputField
                              placeholder="Last Name"
                              value={addEditJSON.lastName}
                              onChange={(evt) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  lastName: evt.target.value,
                                });
                              }}
                            />
                          </div>
                        ) : (
                          <p className="text-sm leading-tight text-gray-900">
                            {selectedData?.lastName}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          Short Name<span className="text-cyan-500">*</span>{' '}
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <InputField
                              placeholder="Short Name"
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
                          Profile Image
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
                              className="inline-flex h-[38px] w-[38px] items-center justify-center gap-2 rounded-md border border border border border-gray-300 bg-gray-100 p-[9px] shadow"
                              onClick={() => {
                                setSelectedFile(undefined);
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  imgName: '',
                                  // imgURL: '',
                                });
                                setRemoveLogo(true);
                              }}
                            >
                              <Icon name={'trash'} />
                            </Button>
                          </div>
                        ) : (
                          <p className="text-sm leading-tight text-gray-900">
                            {selectedData?.imgName}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          Associated With Group/Organization
                          {!addEditJSON && (
                            <span className="text-cyan-500"> *</span>
                          )}
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <SingleSelectDropDown
                              placeholder="-"
                              disabled={!!addEditJSON.groupID}
                              data={selectedWorkedGroup?.groupsData || []}
                              selectedValue={
                                selectedWorkedGroup?.groupsData.filter(
                                  (f) => f.id === addEditJSON.groupID
                                )[0]
                              }
                              onSelect={(evt) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  groupID: evt.id,
                                });
                              }}
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
                          NPI{' '}
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="flex gap-2">
                            <div className=" w-[322px]">
                              <InputField
                                placeholder="NPI Number"
                                maxLength={10}
                                value={addEditJSON.npi}
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
                          Taxonomy{' '}
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <InputField
                              placeholder="Taxonomy"
                              minLength={10}
                              value={addEditJSON.taxonomy}
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
                    <div className="flex h-[60px] w-full flex-col items-start justify-center">
                      <div className="inline-flex w-full items-center justify-start space-x-2">
                        <div className="flex h-full w-[50%] items-center justify-start space-x-2">
                          <p className="text-base font-bold leading-normal text-gray-900">
                            Address
                          </p>
                          <div className="flex items-center justify-start space-x-2">
                            {!!selectedData?.addressValidateOn && (
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
                                  addEditJSON.zipcode
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
                                placeholder="Address1"
                                value={addEditJSON.address1}
                                onChange={(evt) => {
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    address1: evt.target.value,
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
                                placeholder="Address2"
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
                                placeholder="Zip Code"
                                value={addEditJSON.zipcode}
                                onChange={(evt) => {
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    zipcode: evt.target.value,
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
                                placeholder="Zip Extension"
                                value={addEditJSON.zipcodeExtension}
                                onChange={(evt) => {
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    zipcodeExtension: evt.target.value,
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
                      <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                        <div className="flex w-[33%] items-start justify-start space-x-4">
                          <p className="text-sm leading-tight text-gray-500">
                            Home phone
                          </p>
                        </div>
                        <div className="flex w-[67%] items-start justify-start space-x-4">
                          {addEditJSON ? (
                            <div className="w-full">
                              <InputMask
                                placeholder={'(000) 000-0000'}
                                mask="(999) 999-9999"
                                className={classNames(
                                  'flex w-full h-full text-black focus:outline-none items-center justify-center text-sm leading-5 self-center pr-2 bg-transparent'
                                )}
                                value={addEditJSON.homePhone}
                                onChange={(evt: {
                                  target: { value: string };
                                }) => {
                                  const phoneNumber =
                                    evt.target.value === '(___) ___-____'
                                      ? ''
                                      : evt.target.value;
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    homePhone: phoneNumber,
                                  });
                                }}
                              />
                            </div>
                          ) : (
                            <p className="text-sm leading-tight text-gray-900">
                              {selectedData?.homePhone}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="h-[1px] w-full bg-gray-200" />
                      <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                        <div className="flex w-[33%] items-start justify-start space-x-4">
                          <p className="text-sm leading-tight text-gray-500">
                            Office phone
                          </p>
                        </div>
                        <div className="flex w-[67%] items-start justify-start space-x-4">
                          {addEditJSON ? (
                            <div className="w-full">
                              <InputMask
                                placeholder={'(000) 000-0000'}
                                mask="(999) 999-9999"
                                className={classNames(
                                  'flex w-full h-full text-black focus:outline-none items-center justify-center text-sm leading-5 self-center pr-2 bg-transparent'
                                )}
                                value={addEditJSON.officePhone}
                                onChange={(evt: {
                                  target: { value: string };
                                }) => {
                                  const phoneNumber =
                                    evt.target.value === '(___) ___-____'
                                      ? ''
                                      : evt.target.value;
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    officePhone: phoneNumber,
                                  });
                                }}
                              />
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
                              <InputMask
                                placeholder={'(000) 000-0000'}
                                mask="(999) 999-9999"
                                className={classNames(
                                  'flex w-full h-full text-black focus:outline-none items-center justify-center text-sm leading-5 self-center pr-2 bg-transparent'
                                )}
                                value={addEditJSON.fax}
                                onChange={(evt: {
                                  target: { value: string };
                                }) => {
                                  const phoneNumber =
                                    evt.target.value === '(___) ___-____'
                                      ? ''
                                      : evt.target.value;
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    fax: phoneNumber,
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
                  </>
                </div>
                <div className="h-[1px] w-full bg-gray-200" />
                <div className="flex h-[60px] w-full flex-col items-start justify-center">
                  <div className="inline-flex w-full items-center justify-start space-x-2">
                    <p className="text-base font-bold leading-normal text-gray-900">
                      Schedule Settings
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
                        <div className="inline-flex w-full items-start justify-start space-x-4 py-3 pl-3 pr-4">
                          <div className="flex h-full w-[50%] flex-1 items-center justify-start space-x-2">
                            <p className="text-sm leading-tight text-gray-900">
                              Time Zone{' '}
                              {/* {addEditJSON && (
                                <span className="text-cyan-500">*</span>
                              )} */}
                            </p>
                          </div>
                          <div className="w-[50%]">
                            {addEditJSON ? (
                              <div className="w-full">
                                <SingleSelectDropDown
                                  placeholder="Select From List"
                                  data={userLookupDropowns?.timeZones || []}
                                  selectedValue={
                                    userLookupDropowns?.timeZones.filter(
                                      (m) => m.id === addEditJSON.timeZoneID
                                    )[0]
                                  }
                                  onSelect={(value) => {
                                    handleAddUpdateJson({
                                      ...addEditJSON,
                                      timeZoneID: value.id,
                                    });
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="flex w-full flex-wrap items-center justify-end gap-2 py-2">
                                {userLookupDropowns?.timeZones
                                  .filter(
                                    (m) => m.id === selectedData?.timeZoneID
                                  )
                                  .map((d, i) => {
                                    return (
                                      <div
                                        key={i}
                                        id={`MultiSelectDropDownListboxButtonClassItem-${d.id}`}
                                        className={classNames(
                                          'relative gap-1 bg-gray-100 rounded-md pl-[10px] h-full pr-[10px]'
                                        )}
                                      >
                                        <span
                                          className={classNames(
                                            'block truncate py-0.5'
                                          )}
                                        >
                                          {d.value}
                                        </span>
                                      </div>
                                    );
                                  })}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="h-[1px] w-full bg-gray-200" />
                        <div className="inline-flex w-full items-start justify-start space-x-4 py-3 pl-3 pr-4">
                          <div className="flex h-full w-[50%] flex-1 items-center justify-start space-x-2">
                            <p className="text-sm leading-tight text-gray-900">
                              Start Time{' '}
                              {/* {addEditJSON && (
                                <span className="text-cyan-500">*</span>
                              )} */}
                            </p>
                          </div>
                          <div className="flex w-[50%] items-start justify-start space-x-4">
                            {addEditJSON ? (
                              <div className="w-full">
                                <SingleSelectDropDown
                                  placeholder="Select From Dropdown"
                                  data={
                                    TimeData
                                      ? (TimeData as unknown as SingleSelectDropDownDataType[])
                                      : []
                                  }
                                  selectedValue={
                                    TimeData?.filter(
                                      (m) => m.id === addEditJSON?.startTime
                                    )[0]
                                  }
                                  onSelect={(evt) => {
                                    handleAddUpdateJson({
                                      ...addEditJSON,
                                      startTime: evt.id,
                                    });
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="flex w-full flex-wrap items-center justify-start gap-2 py-2">
                                {
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
                                      {TimeData?.filter(
                                        (f) => f.id === selectedData?.startTime
                                      )[0]?.value || ''}
                                    </span>
                                  </div>
                                }
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="h-[1px] w-full bg-gray-200" />
                        <div className="inline-flex w-full items-start justify-start space-x-4 py-3 pl-3 pr-4">
                          <div className="flex h-full w-[50%] flex-1 items-center justify-start space-x-2">
                            <p className="text-sm leading-tight text-gray-900">
                              End Time{' '}
                            </p>
                          </div>
                          <div className="flex w-[50%] items-start justify-start space-x-4">
                            {addEditJSON ? (
                              <div className="w-full">
                                <SingleSelectDropDown
                                  placeholder="Select From Dropdown"
                                  data={
                                    TimeData
                                      ? (TimeData as unknown as SingleSelectDropDownDataType[])
                                      : []
                                  }
                                  selectedValue={
                                    TimeData?.filter(
                                      (m) => m.id === addEditJSON?.endTime
                                    )[0]
                                  }
                                  onSelect={(evt) => {
                                    handleAddUpdateJson({
                                      ...addEditJSON,
                                      endTime: evt.id,
                                    });
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="flex w-full flex-wrap items-center justify-start gap-2 py-2">
                                {
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
                                      {TimeData?.filter(
                                        (f) => f.id === selectedData?.endTime
                                      )[0]?.value || ''}
                                    </span>
                                  </div>
                                }
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="h-[1px] w-full bg-gray-200" />
                        <div className="inline-flex w-full items-start justify-start space-x-4 py-3 pl-3 pr-4">
                          <div className="flex h-full w-[50%] flex-1 items-center justify-start space-x-2">
                            <p className="text-sm leading-tight text-gray-900">
                              Working Days
                              <span className="text-cyan-500">*</span>
                            </p>
                          </div>
                          <div className="flex w-[50%] items-start justify-start space-x-4">
                            {addEditJSON ? (
                              <div
                                data-testid="workingDaysID"
                                className="w-full"
                              >
                                <MultiSelectDropDown
                                  placeholder="Select From List"
                                  showSearchBar={true}
                                  disabled={false}
                                  isOptional
                                  data={workingDays}
                                  selectedValue={workingDays.filter((f) =>
                                    addEditJSON.workingDays
                                      .split(',')
                                      .includes(f.id.toString())
                                  )}
                                  onSelect={(value) => {
                                    handleAddUpdateJson({
                                      ...addEditJSON,
                                      workingDays: value
                                        .map((obj) => obj.id)
                                        .join(','),
                                    });
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="flex w-full flex-wrap items-center justify-start gap-2 py-2">
                                {workingDays
                                  .filter((f) =>
                                    selectedData?.workingDays
                                      .split(',')
                                      .includes(f.id.toString())
                                  )
                                  .map((d, i) => {
                                    return (
                                      <div
                                        key={i}
                                        className={classNames(
                                          'relative gap-1 bg-gray-100 rounded-md pl-[10px] h-full pr-[10px]'
                                        )}
                                      >
                                        <span
                                          className={classNames(
                                            'block truncate py-0.5'
                                          )}
                                        >
                                          {d.value}
                                        </span>
                                      </div>
                                    );
                                  })}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="h-[1px] w-full bg-gray-200" />
                        <div className="inline-flex w-full items-center justify-center space-x-4 py-3 pl-3 pr-4">
                          <div className="flex w-[50%] items-start justify-start">
                            <p className="text-sm leading-tight text-gray-900">
                              Override Block Slot
                            </p>
                          </div>
                          <div className="flex w-[50%] items-start justify-end gap-2">
                            {addEditJSON ? (
                              <ToggleButton
                                value={!!addEditJSON.overrideBlockSlots}
                                onChange={(value) => {
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    overrideBlockSlots: value,
                                  });
                                }}
                              />
                            ) : (
                              <ToggleButton
                                value={!!selectedData?.overrideBlockSlots}
                              />
                            )}
                          </div>
                        </div>
                        <div className="h-[1px] w-full bg-gray-200" />
                        <div className="inline-flex w-full items-center justify-center space-x-4 py-3 pl-3 pr-4">
                          <div className="flex w-[50%] items-start justify-start">
                            <p className="text-sm leading-tight text-gray-900">
                              Overbook
                            </p>
                          </div>
                          <div className="flex w-[50%] items-start justify-end gap-2">
                            {addEditJSON ? (
                              <ToggleButton
                                value={!!addEditJSON.overbookingAllowed}
                                onChange={(value) => {
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    overbookingAllowed: value,
                                  });
                                }}
                              />
                            ) : (
                              <ToggleButton
                                value={!!selectedData?.overbookingAllowed}
                              />
                            )}
                          </div>
                        </div>
                        <div className="h-[1px] w-full bg-gray-200" />
                        <div className="inline-flex w-full items-center justify-center space-x-4 py-3 pl-3 pr-4">
                          <div className="flex w-[50%] items-start justify-start">
                            <p className="text-sm leading-tight text-gray-900">
                              Overbooking Limit
                            </p>
                          </div>
                          <div className="flex w-[50%] items-start justify-end gap-2">
                            {addEditJSON ? (
                              <div className="w-full">
                                <InputField
                                  // placeholder="First Last"
                                  disabled={!!addEditJSON}
                                  value={addEditJSON.overbookingLimit}
                                  onChange={(evt) => {
                                    handleAddUpdateJson({
                                      ...addEditJSON,
                                      overbookingLimit: evt.target.id,
                                    });
                                  }}
                                />
                              </div>
                            ) : (
                              <p className="text-sm leading-tight text-gray-900">
                                {selectedData?.overbookingLimit}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="h-[1px] w-full bg-gray-200" />
                      </div>
                    </div>
                  </div>
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
                                heading: 'Deactivate Provider Confirmation',
                                text: 'Deactivating a Provider will make it unavailable throughout the system.\nAre you sure you want to proceed with this action?',
                                type: StatusModalType.ERROR,
                                okButtonText: 'Yes, Deactivate Provider',
                                okButtonColor: ButtonType.tertiary,
                                confirmType:
                                  'CancelConfirmationOnHandleActivateItem',
                              });
                            } else {
                              setStatusModalInfo({
                                show: true,
                                showCloseButton: true,
                                heading: 'Activate Provider Confirmation',
                                text: 'Activating a Provider will make it unavailable throughout the system.\nAre you sure you want to proceed with this action?',
                                type: StatusModalType.WARNING,
                                okButtonText: 'Yes, Activate Provider',
                                okButtonColor: ButtonType.primary,
                                confirmType:
                                  'CancelConfirmationOnHandleActivateItem',
                              });
                            }
                          }}
                        >
                          {selectedData?.active ? 'Deactivate' : 'Activate'}{' '}
                          Provider
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
                                } this Provider? Clicking "Confirm" will result in the loss of all changes.`,
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
                          {addEditJSON.id ? 'Save Changes' : 'Add Provider'}
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
              fetchProviderInfoByID(statusModalInfo.data);
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
            if (statusModalInfo.confirmType === 'PopulateInfoByNPI') {
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

export default SettingsProviders;
