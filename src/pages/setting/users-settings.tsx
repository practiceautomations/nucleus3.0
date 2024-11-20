import React, { useEffect, useState } from 'react';
import InputMask from 'react-input-mask';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { baseUrl } from '@/api/http-client';
import Icon from '@/components/Icon';
import PageHeader from '@/components/PageHeader';
import AppDatePicker from '@/components/UI/AppDatePicker';
import Badge from '@/components/UI/Badge';
import Breadcrumbs from '@/components/UI/Breadcrumbs/breadcrumbs';
import Button, { ButtonType } from '@/components/UI/Button';
import CloseButton from '@/components/UI/CloseButton';
import InputField from '@/components/UI/InputField';
import Modal from '@/components/UI/Modal';
import type { SingleSelectDropDownDataType } from '@/components/UI/SingleSelectDropDown';
import SingleSelectDropDown from '@/components/UI/SingleSelectDropDown';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import UploadFile from '@/components/UI/UploadFile';
import AppLayout from '@/layouts/AppLayout';
import store from '@/store';
import { loginSuccess } from '@/store/login/actions';
import { addToastNotification } from '@/store/shared/actions';
import {
  getUserInfoByEmail,
  getUserLookupDropowns,
  resetUserPassword,
  updateUser,
} from '@/store/shared/sagas';
import type {
  TResetPasswordJson,
  UserFields,
  UserLookup,
} from '@/store/shared/types';
import { ToastType } from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { DateToStringPipe } from '@/utils/dateConversionPipes';

const UsersSettings = () => {
  const { email } = store.getState().login;
  const dispatch = useDispatch();
  const baseApiUrl = baseUrl.substring(0, baseUrl.lastIndexOf('/'));
  const defaultUserUrl = '/assets/DefaultUser.png';

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
  const [userData, setUserData] = useState<UserFields>();
  const [editJSON, setEditJSON] = useState<UserFields>();
  const [isChangedJson, setIsChangedJson] = useState(false);

  const fetchUserInfoByEmail = async (userEmail: string, from: string) => {
    setSelectedFile(undefined);
    const res = await getUserInfoByEmail(userEmail);
    if (res) {
      setEditJSON(undefined);
      setUserData({
        ...res,
        dob: res.dob,
      });
      // if called after update, update user img
      if (from === 'update') {
        const { user } = store.getState().login;
        if (user) {
          store.dispatch(
            loginSuccess({
              user: { ...user, userImagePath: res.imgURL },
            })
          );
        }
      }
    }
  };

  const handleUpdateJson = (value: UserFields) => {
    setEditJSON(value);
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
    fetchUserInfoByEmail(email, 'initProfile');
  };
  useEffect(() => {
    initProfile();
  }, []);

  const validatePhoneNumber = (phoneNumber: string) => {
    // Validate the format (XXX) XXX-XXXX using a regex
    const regex = /^\(\d{3}\) \d{3}-\d{4}$/;
    // Test the phone number against the regex
    return regex.test(phoneNumber);
  };

  const submitAddEditToAPI = async () => {
    if (editJSON) {
      if (
        !editJSON.name ||
        !editJSON.phoneNumber ||
        !editJSON.dob ||
        !editJSON.timeZoneID ||
        !editJSON.dateFormatID
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

      if (!validatePhoneNumber(editJSON.phoneNumber)) {
        dispatch(
          addToastNotification({
            id: uuidv4(),
            text: 'Phone number is invalid.',
            toastType: ToastType.ERROR,
          })
        );
        return;
      }

      const sdate = new Date(editJSON.dob);
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

      const date = new Date(editJSON.dob);
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
      formData.append('user', JSON.stringify(editJSON));
      if (selectedFile) formData.append('logo', selectedFile);
      formData.append('removeLogo', String(removeLogo));

      const res = await updateUser(formData);
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
        if (userData) {
          await fetchUserInfoByEmail(email, 'update');
        } else {
          setUserData(undefined);
        }
        setEditJSON(undefined);
        setIsChangedJson(false);
      } else {
        setStatusModalInfo({
          show: true,
          heading: 'Error',
          showCloseButton: false,
          text: `A system error prevented the User Settings changes to be saved.\nPlease try again.`,
          type: StatusModalType.ERROR,
        });
      }
    }
  };

  const handleEditForm = () => {
    if (userData) {
      setSelectedFile(undefined);
      setRemoveLogo(false);
      setEditJSON(userData);
    }
  };

  const onAddEditCancel = () => {
    setEditJSON(undefined);
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

  const onCloseResetPasswordModal = () => {
    setShowResetPasswordModal(false);
    setResetPasswordJson({
      userID: '',
      password: '',
      confirmPassword: '',
    });
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
    if (userData?.id) {
      const obj = {
        ...resetPasswordJson,
        userID: userData?.id,
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
                User Settings
              </p>
            </div>
          </div>
          <div className={`px-7`}>
            <div className={`h-[1px] w-full bg-gray-200`} />
          </div>
        </PageHeader>
        <div className="flex h-[calc(100%-118px)] w-full">
          <div className="flex h-full w-full flex-col items-center overflow-y-auto bg-gray-50 py-6">
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
                        {editJSON ? (
                          <img
                            className={classNames(
                              'w-12 h-12 rounded-3xl bg-gray-100'
                            )}
                            src={
                              editJSON.imgURL
                                ? baseApiUrl + editJSON.imgURL
                                : defaultUserUrl
                            }
                          />
                        ) : (
                          <img
                            className={classNames(
                              'w-12 h-12 rounded-3xl bg-gray-100'
                            )}
                            src={
                              userData?.imgURL
                                ? baseApiUrl + userData.imgURL
                                : defaultUserUrl
                            }
                          />
                        )}
                      </>
                    )}
                  </div>
                  <div className="inline-flex flex-col items-start justify-start space-y-1">
                    <p className="text-lg font-medium leading-normal text-gray-900">
                      {editJSON ? editJSON.name || 'New User' : userData?.name}
                    </p>
                    <div className="text-[14px] font-normal leading-tight text-gray-500">
                      {editJSON ? editJSON.email || 'email' : userData?.email}
                    </div>
                    {editJSON ? (
                      <>
                        {getStatusBadge(
                          editJSON.active ? 'Active' : 'inActive'
                        )}
                      </>
                    ) : (
                      <>
                        {getStatusBadge(
                          userData?.active ? 'Active' : 'inActive'
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="h-[1px] w-full bg-gray-200" />
              <div className="flex w-full flex-col items-center justify-center">
                <>
                  <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                    <div className="flex w-[33%] items-start justify-start space-x-4">
                      <p className="text-sm leading-tight text-gray-500">
                        Full Name{' '}
                        {editJSON && <span className="text-cyan-500">*</span>}
                      </p>
                    </div>
                    <div className="flex w-[67%] items-start justify-start space-x-4">
                      {editJSON ? (
                        <div className="w-full">
                          <InputField
                            placeholder="First Last"
                            value={editJSON.name}
                            onChange={(evt) => {
                              handleUpdateJson({
                                ...editJSON,
                                name: evt.target.value,
                              });
                            }}
                          />
                        </div>
                      ) : (
                        <p className="text-sm leading-tight text-gray-900">
                          {userData?.name}
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
                      {editJSON ? (
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
                              handleUpdateJson({
                                ...editJSON,
                                imgName: e.name,
                              });
                            }}
                            selectedFileName={editJSON.imgName || ''}
                            cls={'h-[38px] flex-[2_2_0%] inline-flex'}
                          ></UploadFile>
                          <Button
                            className="inline-flex h-[38px] w-[38px] items-center justify-center gap-2 rounded-md border border-gray-300 bg-gray-100 p-[9px] shadow"
                            onClick={() => {
                              setSelectedFile(undefined);
                              handleUpdateJson({
                                ...editJSON,
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
                          {userData?.imgName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="h-[1px] w-full bg-gray-200" />
                  <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                    <div className="flex w-[33%] items-start justify-start space-x-4">
                      <p className="text-sm leading-tight text-gray-500">
                        Phone Number{' '}
                        {editJSON && <span className="text-cyan-500">*</span>}
                      </p>
                    </div>
                    <div className="flex w-[67%] items-start justify-start space-x-4">
                      {editJSON ? (
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
                              value={editJSON.phoneNumber}
                              onChange={(evt) => {
                                const phoneNumber =
                                  evt.target.value === '(___) ___-____'
                                    ? ''
                                    : evt.target.value;
                                handleUpdateJson({
                                  ...editJSON,
                                  phoneNumber,
                                });
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm leading-tight text-gray-900">
                          {userData?.phoneNumber}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="h-[1px] w-full bg-gray-200" />
                  <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                    <div className="flex w-[33%] items-start justify-start space-x-4">
                      <p className="text-sm leading-tight text-gray-500">
                        Date of Birth{' '}
                        {editJSON && <span className="text-cyan-500">*</span>}
                      </p>
                    </div>
                    <div className="flex w-[67%] items-start justify-start space-x-4">
                      {editJSON ? (
                        <div className="w-full">
                          <AppDatePicker
                            cls="!mt-1"
                            selected={editJSON.dob}
                            onChange={(value) => {
                              handleUpdateJson({
                                ...editJSON,
                                dob: value ? DateToStringPipe(value, 1) : '',
                              });
                            }}
                          />
                        </div>
                      ) : (
                        <p className="text-sm leading-tight text-gray-900">
                          {userData?.dob}
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
                      {editJSON ? (
                        <div className="w-full">
                          <InputField
                            placeholder="Street, City, State & Zip Code"
                            value={editJSON.address}
                            onChange={(evt) => {
                              handleUpdateJson({
                                ...editJSON,
                                address: evt.target.value,
                              });
                            }}
                          />
                        </div>
                      ) : (
                        <p className="text-sm leading-tight text-gray-900">
                          {userData?.address}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              </div>
              <div className="h-[1px] w-full bg-gray-200" />
              <div className="flex h-[60px] w-full flex-col items-start justify-center">
                <div className="inline-flex w-full items-center justify-start space-x-2">
                  <p className="text-base font-bold leading-normal text-gray-900">
                    {editJSON ? 'User Settings' : 'Preferences'}
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
                          editJSON ? 'h-[60px]' : 'h-[49px]'
                        )}
                      >
                        <div className="flex h-full w-[50%] flex-1 items-center justify-start space-x-2">
                          <p className="text-sm leading-tight text-gray-900">
                            Time Zone{' '}
                            {editJSON && (
                              <span className="text-cyan-500">*</span>
                            )}
                          </p>
                        </div>
                        <div className="w-[50%]">
                          {editJSON ? (
                            <div className="w-full">
                              <SingleSelectDropDown
                                placeholder="Select From List"
                                data={userLookupDropowns?.timeZones || []}
                                selectedValue={
                                  userLookupDropowns?.timeZones.filter(
                                    (m) => m.id === editJSON.timeZoneID
                                  )[0]
                                }
                                onSelect={(value) => {
                                  handleUpdateJson({
                                    ...editJSON,
                                    timeZoneID: value.id,
                                  });
                                }}
                              />
                            </div>
                          ) : (
                            <div className="flex w-full flex-wrap items-center justify-end gap-2 py-2">
                              {userLookupDropowns?.timeZones
                                .filter((m) => m.id === userData?.timeZoneID)
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
                          editJSON ? 'h-[60px]' : 'h-[49px]'
                        )}
                      >
                        <div className="flex h-full w-[50%] flex-1 items-center justify-start space-x-2">
                          <p className="text-sm leading-tight text-gray-900">
                            Date Format{' '}
                            {editJSON && (
                              <span className="text-cyan-500">*</span>
                            )}
                          </p>
                        </div>
                        <div className="w-[50%]">
                          {editJSON ? (
                            <div className="w-full">
                              <SingleSelectDropDown
                                placeholder="Select From List"
                                data={userLookupDropowns?.dateFormatsData || []}
                                selectedValue={
                                  userLookupDropowns?.dateFormatsData.filter(
                                    (m) => m.id === editJSON.dateFormatID
                                  )[0]
                                }
                                onSelect={(value) => {
                                  handleUpdateJson({
                                    ...editJSON,
                                    dateFormatID: value.id,
                                  });
                                }}
                              />
                            </div>
                          ) : (
                            <div className="flex w-full flex-wrap items-center justify-end gap-2 py-2">
                              {userLookupDropowns?.dateFormatsData
                                .filter((m) => m.id === userData?.dateFormatID)
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
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-[1px] w-full bg-gray-200" />
              <div className="inline-flex w-full items-center justify-center pb-7 pt-6">
                <div className="flex w-full items-center justify-end space-x-4">
                  {!editJSON ? (
                    <>
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
                              text: `Are you sure you want to cancel editing this information? Clicking "Confirm" will result in the loss of all changes.`,
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
                        Save Changes
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
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
                          userData
                            ? ({
                                id: userData.id,
                                value: userData.name,
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
                <p className="text-sm font-medium leading-tight">
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
            if (statusModalInfo.confirmType === 'CancelConfirmationOnReset') {
              isResetPassword();
            }
            if (
              statusModalInfo.confirmType === 'CancelConfirmationOnCancelBtn'
            ) {
              setIsChangedJson(false);
              onAddEditCancel();
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

export default UsersSettings;
