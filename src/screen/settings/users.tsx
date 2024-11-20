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
import CloseButton from '@/components/UI/CloseButton';
import InputField from '@/components/UI/InputField';
import Modal from '@/components/UI/Modal';
import MultiSelectDropDown from '@/components/UI/MultiSelectDropDown';
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
  addUser,
  getUserInfoByEmail,
  getUserLookupDropowns,
  getUsersProfileData,
  resetUserPassword,
  updateUser,
  updateUserActive,
} from '@/store/shared/sagas';
import type {
  TResetPasswordJson,
  UserFields,
  UserLookup,
  UserResultData,
} from '@/store/shared/types';
import { ToastType } from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';
import { DateToStringPipe } from '@/utils/dateConversionPipes';

interface Tprops {
  selectedEmail: string | undefined;
}

const Users = ({ selectedEmail }: Tprops) => {
  const dispatch = useDispatch();
  const baseApiUrl = baseUrl.substring(0, baseUrl.lastIndexOf('/'));
  const defaultUserUrl = '/assets/DefaultUser.png';
  const selectedWorkedGroup = useSelector(getselectdWorkGroupsIDsSelector);

  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetPasswordJson, setResetPasswordJson] =
    useState<TResetPasswordJson>({
      userID: '',
      password: '',
      confirmPassword: '',
    });

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
  const [apiData, setApiData] = useState<UserResultData[]>([]);

  const [filterText, setFilterText] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [filterData, setFilterData] = useState<UserResultData[]>([]);
  const [selectedData, setSelectedData] = useState<UserFields>();
  const [uniqueFirstLetters, setUniqueFirstLetters] = useState<string[]>([]);
  const [addEditJSON, setAddEditJSON] = useState<UserFields>();
  const [isChangedJson, setIsChangedJson] = useState(false);
  const [ipText, setIpText] = useState('');

  const resetSidebarData = () => {
    setFilterText('');
    setApiData([]);
  };

  const fetchProfileData = async (groupID: number) => {
    const res = await getUsersProfileData(groupID);
    if (res) {
      setApiData(res);
    }
    return res;
  };

  useEffect(() => {
    if (selectedWorkedGroup?.groupsData[0]?.id) {
      fetchProfileData(selectedWorkedGroup.groupsData[0].id);
      resetSidebarData();
    }
  }, [selectedWorkedGroup]);

  const fetchUserInfoByEmail = async (email: string) => {
    setSelectedFile(undefined);
    const res = await getUserInfoByEmail(email);
    if (res) {
      setAddEditJSON(undefined);
      setSelectedData({
        ...res,
        allowedIPS: res.allowedIPS.filter((element) => element.trim() !== ''),
        dob: res.dob ? res.dob : '',
      });
    }
  };

  const handleFilterData = () => {
    const filterRes = apiData.filter((item) => {
      const { name, email, roles } = item;
      const searchText = filterText.toLowerCase();

      return (
        (name.toLowerCase().includes(searchText) ||
          (roles && roles.toLowerCase().includes(searchText)) ||
          email.toLowerCase().includes(searchText)) &&
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

    if (selectedEmail) fetchUserInfoByEmail(selectedEmail);
  };

  useEffect(() => {
    handleFilterData();
  }, [filterText, apiData, showInactive]);

  const handleAddUpdateJson = (value: UserFields) => {
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
    setSelectedFile(undefined);
    setRemoveLogo(false);
    const obj = {
      id: '',
      name: '',
      firstName: '',
      lastName: '',
      imgName: null,
      imgURL: null,
      phoneNumber: '',
      email: '',
      dob: '',
      address: '',
      roles: '',
      dataRoles: [],
      reportingManager: '',
      espiaUserName: '',
      allowedIPS: [],
      timeZoneID: null,
      dateFormatID: null,
      dateTimeFormatID: null,
      warningMessage: true,
      isIPAuth: true,
      tfaEnable: true,
      active: true,
      comments: '',
      clientID: 1,
      auditPercentage: '',
      auditor: '',
      createdOn: '',
      createdByID: '',
      createdBy: '',
      updatedOn: '',
      updatedByID: '',
      updatedBy: '',
    };
    setAddEditJSON({ ...obj });
  };

  const validatePhoneNumber = (phoneNumber: string) => {
    // Validate the format (XXX) XXX-XXXX using a regex
    const regex = /^\(\d{3}\) \d{3}-\d{4}$/;
    // Test the phone number against the regex
    return regex.test(phoneNumber);
  };

  const validateEmail = (email: string) => {
    const filter =
      // eslint-disable-next-line no-useless-escape
      /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z]{2,3})+$/;
    return filter.test(email);
  };

  const submitAddEditToAPI = async () => {
    if (addEditJSON) {
      if (
        !addEditJSON.name ||
        !addEditJSON.email ||
        !addEditJSON.phoneNumber ||
        !addEditJSON.dob ||
        !addEditJSON.roles ||
        !addEditJSON.reportingManager ||
        !addEditJSON.timeZoneID ||
        !addEditJSON.dateFormatID ||
        !addEditJSON.dateTimeFormatID
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

      if (!validatePhoneNumber(addEditJSON.phoneNumber)) {
        dispatch(
          addToastNotification({
            id: uuidv4(),
            text: 'Phone number is invalid.',
            toastType: ToastType.ERROR,
          })
        );
        return;
      }
      if (!validateEmail(addEditJSON.email)) {
        dispatch(
          addToastNotification({
            id: uuidv4(),
            text: 'Enter valid email address.',
            toastType: ToastType.ERROR,
          })
        );
        return;
      }

      const sdate = new Date(addEditJSON.dob);
      const edate = new Date();
      if (sdate > edate) {
        dispatch(
          addToastNotification({
            id: uuidv4(),
            text: 'DOB should not be greater than today date.',
            toastType: ToastType.ERROR,
          })
        );
        return;
      }

      const date = new Date(addEditJSON.dob);
      const d = date.getFullYear();
      if (d < 1000) {
        dispatch(
          addToastNotification({
            id: uuidv4(),
            text: 'Enter valid DOB.',
            toastType: ToastType.ERROR,
          })
        );
        return;
      }

      const formData = new FormData();
      formData.append('user', JSON.stringify(addEditJSON));
      if (selectedFile) formData.append('logo', selectedFile);
      formData.append('removeLogo', String(removeLogo));

      let res: any;
      if (addEditJSON.id) {
        res = await updateUser(formData);
      } else {
        res = await addUser(formData);
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
          await fetchUserInfoByEmail(selectedData.email);
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
          text: `A system error prevented the User ${
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
      // setAddEditJSON(selectedData);
      setAddEditJSON({
        ...selectedData,
        dob: DateToStringPipe(new Date(selectedData.dob), 1) || '',
      });
    }
  };

  const updateItemActive = async (id: string, active: boolean) => {
    const res = await updateUserActive(id, active);
    if (res) {
      if (selectedWorkedGroup?.groupsData[0]?.id) {
        fetchProfileData(selectedWorkedGroup.groupsData[0].id);
      }
      if (selectedData) {
        await fetchUserInfoByEmail(selectedData.email);
      } else {
        setSelectedData(undefined);
      }
    } else {
      setStatusModalInfo({
        show: true,
        heading: 'Error',
        showCloseButton: false,
        text: `A system error prevented the User to be ${
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

  const renderIpView = (ip: string, type: string) => {
    return (
      <>
        <div className="mr-1.5 mt-1.5 flex min-h-[20px]  flex-wrap items-center justify-center rounded bg-gray-100 py-0.5 pl-2 pr-1">
          <p className="pt-1 text-center text-xs font-medium leading-none text-gray-700">
            {ip}
          </p>
          <Button
            className="flex h-[16px] w-[16px] items-center justify-center font-bold text-gray-400"
            buttonType={ButtonType.secondary}
            onClick={(e) => {
              e.stopPropagation();
              if (type === 'addEditJSON' && addEditJSON) {
                setAddEditJSON({
                  ...addEditJSON,
                  allowedIPS: addEditJSON.allowedIPS.filter((f) => f !== ip),
                });
              } else if (type === 'selectedData' && selectedData) {
                setSelectedData({
                  ...selectedData,
                  allowedIPS: selectedData.allowedIPS.filter((f) => f !== ip),
                });
              }
            }}
          >
            <Icon name={'deselect'} size={8} />
          </Button>
        </div>
      </>
    );
  };

  const validateIP = (ip: string): boolean => {
    // Regular expression pattern for IP address validation
    const pattern: RegExp = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/;

    // Check if the IP matches the pattern
    if (pattern.test(ip)) {
      // Split the IP address into its octets
      const octets: string[] = ip.split('.');

      // Check if each octet is a valid number (between 0 and 255)
      for (let i = 0; i < octets.length; i += 1) {
        const octet: number = Number(octets[i]);
        if (octet < 0 || octet > 255) {
          return false; // Invalid IP address
        }
      }

      return true; // Valid IP address
    }

    return false; // Invalid IP address format
  };

  const onCloseResetPasswordModal = () => {
    setShowResetPasswordModal(false);
  };

  const onResetPassword = () => {
    if (!resetPasswordJson?.password || !resetPasswordJson?.confirmPassword) {
      setStatusModalInfo({
        show: true,
        heading: 'Alert',
        showCloseButton: false,
        text: 'This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.',
        type: StatusModalType.WARNING,
      });
      return;
    }
    if (resetPasswordJson.password !== resetPasswordJson.confirmPassword) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'New password and Confirm password does not match.',
          toastType: ToastType.ERROR,
        })
      );
      return;
    }
    setStatusModalInfo({
      show: true,
      showCloseButton: true,
      heading: 'Reset Password Confirmation',
      text: `Are you sure you want to proceed with this action?`,
      type: StatusModalType.WARNING,
      okButtonText: 'Yes, Reset Password',
      okButtonColor: ButtonType.primary,
      confirmType: 'CancelConfirmationOnReset',
    });
  };

  const isResetPassword = async () => {
    if (selectedData?.id) {
      const obj = {
        ...resetPasswordJson,
        userID: selectedData?.id,
      };
      const res = await resetUserPassword(obj);

      if (res && res?.errors?.includes('InvalidPattern')) {
        dispatch(
          addToastNotification({
            id: uuidv4(),
            text: 'Password should contain at least one uppercase letter, lowercase letter, number, special character and should be greater than 8 characters in length.',
            toastType: ToastType.ERROR,
          })
        );
        return;
      }

      if (res && res?.errors?.includes('Repetition')) {
        dispatch(
          addToastNotification({
            id: uuidv4(),
            text: 'User password already exists. Choose another.',
            toastType: ToastType.ERROR,
          })
        );
        return;
      }

      if (res) {
        setResetPasswordJson({
          userID: '',
          password: '',
          confirmPassword: '',
        });
        setShowResetPasswordModal(false);
      } else {
        setStatusModalInfo({
          show: true,
          heading: 'Error',
          showCloseButton: false,
          text: `A system error prevented the Password to be reset.\nPlease try again.`,
          type: StatusModalType.ERROR,
        });
      }
    }
  };

  return (
    <AppLayout title="Users Settings">
      <div className="m-0 h-full w-full overflow-y-auto p-0">
        <Breadcrumbs />
        <PageHeader cls="!bg-white !drop-shadow">
          <div className="flex items-start justify-between gap-4 px-7 pb-[21px] pt-[33px]">
            <div className="flex h-[38px] gap-6">
              <p className="self-center text-3xl font-bold text-cyan-700">
                Users Settings
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
                        } this User? Clicking "Confirm" will result in the loss of all changes.`,
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
                  Create New User
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
                    data-testid="UserFilter"
                    autoComplete="off"
                    id="search"
                    name="search"
                    className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 leading-5 text-gray-500 placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:text-gray-900 focus:outline-none focus:ring-white sm:text-sm"
                    placeholder="Filter by User Name, Email or Role"
                    value={filterText}
                    onChange={(e) => {
                      setFilterText(e.target.value);
                    }}
                  />
                </div>
              </div>
              <div className="mt-2.5 flex gap-2">
                <CheckBox
                  data-testid="showInActiveUser"
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
                                } this User? Clicking "Confirm" will result in the loss of all changes.`,
                                type: StatusModalType.WARNING,
                                okButtonText: 'Confirm',
                                okButtonColor: ButtonType.primary,
                                confirmType:
                                  'CancelConfirmationOnSelectSaidebarItem',
                                data: d.email,
                              });
                              return;
                            }
                            fetchUserInfoByEmail(d.email);
                          }}
                        >
                          <div className="h-[1px] w-full bg-gray-200" />
                          <div className="flex w-full flex-row items-center justify-center px-3 py-4">
                            <div
                              data-testid="users_row"
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
                                      <div className="inline-flex w-full items-center justify-start space-x-1.5">
                                        <Icon
                                          name="UserBolt"
                                          size={13}
                                          color={IconColors.GRAY_300}
                                        />
                                        <p className="truncate text-sm leading-tight text-gray-500">
                                          {d.roles}
                                        </p>
                                      </div>
                                      <div className="inline-flex w-full items-center justify-start space-x-1.5">
                                        <Icon
                                          name="email"
                                          size={13}
                                          color={IconColors.GRAY_300}
                                        />
                                        <p className="truncate text-sm leading-tight text-gray-500">
                                          {d.email}
                                        </p>
                                      </div>
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
                                addEditJSON.imgURL
                                  ? baseApiUrl + addEditJSON.imgURL
                                  : defaultUserUrl
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
                          ? addEditJSON.name || 'New User'
                          : selectedData?.name}
                      </p>
                      <div className="text-[14px] font-normal leading-tight text-gray-500">
                        {addEditJSON
                          ? addEditJSON.email || 'email'
                          : selectedData?.email}
                      </div>
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
                          Full Name{' '}
                          {addEditJSON && (
                            <span className="text-cyan-500">*</span>
                          )}
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <InputField
                              placeholder="First Last"
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
                            {selectedData?.imgName}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          Phone Number{' '}
                          {addEditJSON && (
                            <span className="text-cyan-500">*</span>
                          )}
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
                                value={addEditJSON.phoneNumber}
                                onChange={(evt) => {
                                  const phoneNumber =
                                    evt.target.value === '(___) ___-____'
                                      ? ''
                                      : evt.target.value;
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    phoneNumber,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm leading-tight text-gray-900">
                            {selectedData?.phoneNumber}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          Email ID{' '}
                          {addEditJSON && (
                            <span className="text-cyan-500">*</span>
                          )}
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <InputField
                              placeholder="example@example.com"
                              value={addEditJSON.email}
                              disabled={!!addEditJSON.id}
                              onChange={(evt) => {
                                if (!addEditJSON.id)
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
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          Date of Birth{' '}
                          {addEditJSON && (
                            <span className="text-cyan-500">*</span>
                          )}
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <AppDatePicker
                              testId="createUserDob"
                              cls="!mt-1"
                              selected={addEditJSON.dob}
                              onChange={(value) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  dob: value ? DateToStringPipe(value, 1) : '',
                                });
                              }}
                            />
                          </div>
                        ) : (
                          <p className="text-sm leading-tight text-gray-900">
                            {selectedData?.dob}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          Address
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <InputField
                              placeholder="Street, City, State & Zip Code"
                              value={addEditJSON.address}
                              onChange={(evt) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  address: evt.target.value,
                                });
                              }}
                            />
                          </div>
                        ) : (
                          <p className="text-sm leading-tight text-gray-900">
                            {selectedData?.address}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="inline-flex min-h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          Roles{' '}
                          {addEditJSON && (
                            <span className="text-cyan-500">*</span>
                          )}
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div data-testid="userRoletestID" className="w-full">
                            <MultiSelectDropDown
                              placeholder="Select From List"
                              showSearchBar={true}
                              disabled={false}
                              isOptional
                              data={
                                userLookupDropowns?.roles
                                  ? (userLookupDropowns?.roles as unknown as SingleSelectDropDownDataType[])
                                  : []
                              }
                              selectedValue={
                                userLookupDropowns?.roles
                                  ? (userLookupDropowns?.roles
                                      .filter((f) =>
                                        addEditJSON.roles
                                          .split(',')
                                          .includes(f.id.toString())
                                      )
                                      .map((d) => {
                                        return {
                                          id: d.id.toString(),
                                          value: d.value,
                                        };
                                      }) as unknown as SingleSelectDropDownDataType[])
                                  : []
                              }
                              onSelect={(value) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  roles: value.map((obj) => obj.id).join(','),
                                });
                              }}
                            />
                          </div>
                        ) : (
                          <div className="flex w-full flex-wrap items-center justify-start gap-2 py-2">
                            {userLookupDropowns?.roles
                              .filter((f) =>
                                selectedData?.roles
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
                                      data-testid="userRoleOption"
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
                    <div className="inline-flex min-h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          Data Roles
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <MultiSelectDropDown
                              placeholder="Select From List"
                              showSearchBar={true}
                              disabled={false}
                              isOptional
                              data={userLookupDropowns?.dataRoles || []}
                              selectedValue={
                                userLookupDropowns?.dataRoles
                                  ?.filter((f) =>
                                    addEditJSON.dataRoles.includes(f.id)
                                  )
                                  .map((d) => {
                                    return { id: d.id, value: d.value };
                                  }) || []
                              }
                              onSelect={(value) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  dataRoles: [...value.map((obj) => obj.id)],
                                });
                              }}
                            />
                          </div>
                        ) : (
                          <div className="flex w-full flex-wrap items-center justify-start gap-2 py-2">
                            {userLookupDropowns?.dataRoles
                              ?.filter((f) =>
                                selectedData?.dataRoles.includes(f.id)
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
                    <div className="inline-flex min-h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          Reporting Managers{' '}
                          {addEditJSON && (
                            <span className="text-cyan-500">*</span>
                          )}
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div
                            data-testid="userReportingManagertestID"
                            className="w-full"
                          >
                            <MultiSelectDropDown
                              placeholder="Select From List"
                              showSearchBar={true}
                              disabled={false}
                              isOptional
                              data={
                                userLookupDropowns?.reportingManagers
                                  ? (userLookupDropowns?.reportingManagers as unknown as SingleSelectDropDownDataType[])
                                  : []
                              }
                              selectedValue={
                                userLookupDropowns?.reportingManagers
                                  ? (userLookupDropowns?.reportingManagers
                                      .filter((f) =>
                                        addEditJSON.reportingManager
                                          .split(',')
                                          .includes(f.id.toString())
                                      )
                                      .map((d) => {
                                        return {
                                          id: d.id.toString(),
                                          value: d.value,
                                        };
                                      }) as unknown as SingleSelectDropDownDataType[])
                                  : []
                              }
                              onSelect={(value) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  reportingManager: value
                                    .map((obj) => obj.id)
                                    .join(','),
                                });
                              }}
                            />
                          </div>
                        ) : (
                          <div className="flex w-full flex-wrap items-center justify-start gap-2 py-2">
                            {userLookupDropowns?.reportingManagers
                              .filter((f) =>
                                selectedData?.reportingManager
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
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          ESPIA User Name
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <InputField
                              placeholder="username"
                              value={addEditJSON.espiaUserName}
                              onChange={(evt) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  espiaUserName: evt.target.value,
                                });
                              }}
                            />
                          </div>
                        ) : (
                          <p className="text-sm leading-tight text-gray-900">
                            {selectedData?.espiaUserName}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="inline-flex min-h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          Allowed IP(s)
                        </p>
                      </div>
                      <div className="flex w-[67%] flex-col items-start justify-start">
                        {addEditJSON ? (
                          <div className="flex w-full flex-row gap-2">
                            <InputField
                              placeholder={'000.000.000.000'}
                              value={ipText}
                              onChange={(evt) => {
                                setIpText(evt.target.value);
                              }}
                            />
                            <Button
                              buttonType={ButtonType.primary}
                              disabled={!validateIP(ipText)}
                              cls={`h-[38px] w-[90px] mt-[3px]`}
                              onClick={() => {
                                if (
                                  addEditJSON.allowedIPS.filter(
                                    (f) => f === ipText
                                  ).length
                                ) {
                                  dispatch(
                                    addToastNotification({
                                      id: uuidv4(),
                                      text: 'The IP address already exists.',
                                      toastType: ToastType.ERROR,
                                    })
                                  );
                                  return;
                                }
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  allowedIPS: [
                                    ...addEditJSON.allowedIPS,
                                    ipText,
                                  ],
                                });
                                setIpText('');
                              }}
                            >
                              Add IP
                            </Button>
                          </div>
                        ) : (
                          <></>
                        )}
                        <>
                          {addEditJSON ? (
                            <>
                              {addEditJSON.allowedIPS.map((d) => (
                                <>{renderIpView(d, 'addEditJSON')}</>
                              ))}
                            </>
                          ) : (
                            <>
                              {selectedData?.allowedIPS.map((d) => (
                                <>{renderIpView(d, 'selectedData')}</>
                              ))}
                            </>
                          )}
                        </>
                      </div>
                    </div>
                  </>
                </div>
                <div className="h-[1px] w-full bg-gray-200" />
                <div className="flex h-[60px] w-full flex-col items-start justify-center">
                  <div className="inline-flex w-full items-center justify-start space-x-2">
                    <p className="text-base font-bold leading-normal text-gray-900">
                      User Settings
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
                        <div
                          className={classNames(
                            'inline-flex w-full items-center justify-start space-x-4 pl-3 pr-4',
                            addEditJSON ? 'h-[60px]' : 'h-[49px]'
                          )}
                        >
                          <div className="flex h-full w-[50%] flex-1 items-center justify-start space-x-2">
                            <p className="text-sm leading-tight text-gray-900">
                              Time Zone{' '}
                              {addEditJSON && (
                                <span className="text-cyan-500">*</span>
                              )}
                            </p>
                          </div>
                          <div className="w-[50%]">
                            {addEditJSON ? (
                              <div
                                data-testid="UserTimeZoneTestId"
                                className="w-full"
                              >
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
                        <div
                          className={classNames(
                            'inline-flex w-full items-center justify-start space-x-4 pl-3 pr-4',
                            addEditJSON ? 'h-[60px]' : 'h-[49px]'
                          )}
                        >
                          <div className="flex h-full w-[50%] flex-1 items-center justify-start space-x-2">
                            <p className="text-sm leading-tight text-gray-900">
                              Date Format{' '}
                              {addEditJSON && (
                                <span className="text-cyan-500">*</span>
                              )}
                            </p>
                          </div>
                          <div className="w-[50%]">
                            {addEditJSON ? (
                              <div
                                data-testid="UserDateFormatTestId"
                                className="w-full"
                              >
                                <SingleSelectDropDown
                                  placeholder="Select From List"
                                  data={
                                    userLookupDropowns?.dateFormatsData || []
                                  }
                                  selectedValue={
                                    userLookupDropowns?.dateFormatsData.filter(
                                      (m) => m.id === addEditJSON.dateFormatID
                                    )[0]
                                  }
                                  onSelect={(value) => {
                                    handleAddUpdateJson({
                                      ...addEditJSON,
                                      dateFormatID: value.id,
                                    });
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="flex w-full flex-wrap items-center justify-end gap-2 py-2">
                                {userLookupDropowns?.dateFormatsData
                                  .filter(
                                    (m) => m.id === selectedData?.dateFormatID
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
                        <div
                          className={classNames(
                            'inline-flex w-full items-center justify-start space-x-4 pl-3 pr-4',
                            addEditJSON ? 'h-[60px]' : 'h-[49px]'
                          )}
                        >
                          <div className="flex h-full w-[50%] flex-1 items-center justify-start space-x-2">
                            <p className="text-sm leading-tight text-gray-900">
                              Date Time Format{' '}
                              {addEditJSON && (
                                <span className="text-cyan-500">*</span>
                              )}
                            </p>
                          </div>
                          <div className="w-[50%]">
                            {addEditJSON ? (
                              <div
                                data-testid="UserDateTimeFormatTestId"
                                className="w-full"
                              >
                                <SingleSelectDropDown
                                  placeholder="Select From List"
                                  data={
                                    userLookupDropowns?.dateTimeFormatsData ||
                                    []
                                  }
                                  selectedValue={
                                    userLookupDropowns?.dateTimeFormatsData.filter(
                                      (m) =>
                                        m.id === addEditJSON.dateTimeFormatID
                                    )[0]
                                  }
                                  onSelect={(value) => {
                                    handleAddUpdateJson({
                                      ...addEditJSON,
                                      dateTimeFormatID: value.id,
                                    });
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="flex w-full flex-wrap items-center justify-end gap-2 py-2">
                                {userLookupDropowns?.dateTimeFormatsData
                                  .filter(
                                    (m) =>
                                      m.id === selectedData?.dateTimeFormatID
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
                        <div className="inline-flex h-[49px] w-full items-center justify-center space-x-4 pl-3 pr-4">
                          <div className="flex w-[50%] items-start justify-start">
                            <p className="text-sm leading-tight text-gray-900">
                              Warning Messages
                            </p>
                          </div>
                          <div className="flex w-[50%] items-start justify-end gap-2">
                            {addEditJSON ? (
                              <ToggleButton
                                value={!!addEditJSON.warningMessage}
                                onChange={(value) => {
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    warningMessage: value,
                                  });
                                }}
                              />
                            ) : (
                              <ToggleButton
                                value={!!selectedData?.warningMessage}
                              />
                            )}
                          </div>
                        </div>
                        <div className="h-[1px] w-full bg-gray-200" />
                        <div className="inline-flex h-[49px] w-full items-center justify-center space-x-4 pl-3 pr-4">
                          <div className="flex w-[50%] items-start justify-start">
                            <p className="text-sm leading-tight text-gray-900">
                              IP Authorization
                            </p>
                          </div>
                          <div className="flex w-[50%] items-start justify-end gap-2">
                            {addEditJSON ? (
                              <ToggleButton
                                value={!!addEditJSON.isIPAuth}
                                onChange={(value) => {
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    isIPAuth: value,
                                  });
                                }}
                              />
                            ) : (
                              <ToggleButton value={!!selectedData?.isIPAuth} />
                            )}
                          </div>
                        </div>
                        <div className="h-[1px] w-full bg-gray-200" />
                        <div className="inline-flex h-[49px] w-full items-center justify-center space-x-4 pl-3 pr-4">
                          <div className="flex w-[50%] items-start justify-start">
                            <p className="text-sm leading-tight text-gray-900">
                              Two-Factor Authentication
                            </p>
                          </div>
                          <div className="flex w-[50%] items-start justify-end gap-2">
                            {addEditJSON ? (
                              <ToggleButton
                                value={!!addEditJSON.tfaEnable}
                                onChange={(value) => {
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    tfaEnable: value,
                                  });
                                }}
                              />
                            ) : (
                              <ToggleButton value={!!selectedData?.tfaEnable} />
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
                        <div className="inline-flex h-[49px] w-full items-center justify-center space-x-4 pl-3 pr-4">
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
                                heading: 'Deactivate User Confirmation',
                                text: 'Deactivating a User will make it unavailable throughout the system.\nAre you sure you want to proceed with this action?',
                                type: StatusModalType.ERROR,
                                okButtonText: 'Yes, Deactivate User',
                                okButtonColor: ButtonType.tertiary,
                                confirmType:
                                  'CancelConfirmationOnHandleActivateItem',
                              });
                            } else {
                              setStatusModalInfo({
                                show: true,
                                showCloseButton: true,
                                heading: 'Activate User Confirmation',
                                text: 'Activating a User will make it available throughout the system.\nAre you sure you want to proceed with this action?',
                                type: StatusModalType.WARNING,
                                okButtonText: 'Yes, Activate User',
                                okButtonColor: ButtonType.primary,
                                confirmType:
                                  'CancelConfirmationOnHandleActivateItem',
                              });
                            }
                          }}
                        >
                          {selectedData?.active ? 'Deactivate' : 'Activate'}{' '}
                          User
                        </Button>
                        <Button
                          cls={'shadow'}
                          buttonType={ButtonType.secondary}
                          onClick={() => {
                            setShowResetPasswordModal(true);
                          }}
                        >
                          Reset Password
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
                                } this User? Clicking "Confirm" will result in the loss of all changes.`,
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
                          {addEditJSON.id ? 'Save Changes' : 'Add User'}
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
      <Modal
        open={showResetPasswordModal}
        onClose={() => {}}
        modalContentClassName="relative w-[860px] rounded-lg bg-white shadow-xl transition-all sm:my-8"
        modalBackgroundClassName={'!overflow-hidden'}
      >
        <div className="flex w-full flex-col items-center justify-start rounded-lg bg-gray-100 shadow">
          <div className="flex w-full flex-col items-start justify-start p-6">
            <div className="inline-flex w-full items-center justify-between">
              <div className="flex items-center justify-start space-x-2">
                <p className="text-xl font-bold leading-7 text-gray-700">
                  Reset Password
                </p>
              </div>
              <CloseButton onClick={onCloseResetPasswordModal} />
            </div>
          </div>
          <div className={'w-full px-6'}>
            <div className={`h-[1px] w-full bg-gray-300`} />
          </div>
          <div className="w-full flex-1 overflow-y-auto p-6">
            <div className="flex w-full flex-col items-start">
              <div className="flex w-full">
                <div className="px-[5px] md:w-[50%] lg:w-[33.33%]">
                  <div
                    className={`flex w-full flex-col items-start self-stretch`}
                  >
                    <label className="text-sm font-medium leading-tight text-gray-700">
                      User
                    </label>
                    <div className="w-full">
                      <SingleSelectDropDown
                        placeholder="-"
                        disabled={true}
                        data={[]}
                        selectedValue={
                          selectedData
                            ? ({
                                id: selectedData.id,
                                value: selectedData.name,
                              } as unknown as SingleSelectDropDownDataType)
                            : null
                        }
                        onSelect={() => {}}
                      />
                    </div>
                  </div>
                </div>
                <div className="px-[5px] md:w-[50%] lg:w-[33.33%]">
                  <div
                    className={`flex w-full flex-col items-start self-stretch`}
                  >
                    <label className="text-sm font-medium leading-tight text-gray-700">
                      New Password <span className="text-cyan-500">*</span>
                    </label>
                    <div className="w-full">
                      <InputField
                        placeholder="Enter New Password"
                        value={resetPasswordJson?.password}
                        onChange={(evt) => {
                          setResetPasswordJson({
                            ...resetPasswordJson,
                            password: evt.target.value,
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="px-[5px] md:w-[50%] lg:w-[33.33%]">
                  <div
                    className={`flex w-full flex-col items-start self-stretch`}
                  >
                    <label className="text-sm font-medium leading-tight text-gray-700">
                      Confirm Password <span className="text-cyan-500">*</span>
                    </label>
                    <div className="w-full">
                      <InputField
                        placeholder="Confirm New Password"
                        value={resetPasswordJson?.confirmPassword}
                        onChange={(evt) => {
                          setResetPasswordJson({
                            ...resetPasswordJson,
                            confirmPassword: evt.target.value,
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex w-full items-center justify-center rounded-b-lg bg-gray-200 py-6">
            <div className="flex w-full items-center justify-end space-x-4 px-7">
              <Button
                buttonType={ButtonType.secondary}
                cls={`inline-flex px-4 py-2 gap-2 leading-5`}
                onClick={onCloseResetPasswordModal}
              >
                <p className="text-sm font-medium leading-tight text-gray-700">
                  Cancel
                </p>
              </Button>
              <Button
                buttonType={ButtonType.primary}
                cls={`inline-flex px-4 py-2 gap-2 leading-5`}
                onClick={() => {
                  onResetPassword();
                }}
              >
                <p
                  data-testid="resetPassword"
                  className="text-sm font-medium leading-tight"
                >
                  Reset Password
                </p>
              </Button>
            </div>
          </div>
        </div>
      </Modal>

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
              fetchUserInfoByEmail(statusModalInfo.data);
            }
            if (statusModalInfo.confirmType === 'CancelConfirmationOnAdd') {
              setIsChangedJson(false);
              handleAddForm();
            }
            if (statusModalInfo.confirmType === 'CancelConfirmationOnReset') {
              isResetPassword();
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

export default Users;
