import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { baseUrl } from '@/api/http-client';
import Icon from '@/components/Icon';
import PageHeader from '@/components/PageHeader';
import Badge from '@/components/UI/Badge';
import Breadcrumbs from '@/components/UI/Breadcrumbs/breadcrumbs';
import Button, { ButtonType } from '@/components/UI/Button';
import CheckBox from '@/components/UI/CheckBox';
import InputField from '@/components/UI/InputField';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import ToggleButton from '@/components/UI/ToggleButton';
import UploadFile from '@/components/UI/UploadFile';
import AppLayout from '@/layouts/AppLayout';
import { addToastNotification } from '@/store/shared/actions';
import {
  addGroup,
  getGroupProfileData,
  updateGroup,
  updateGroupActive,
} from '@/store/shared/sagas';
import type {
  GroupResultData,
  GroupSearchCriteria,
} from '@/store/shared/types';
import { ToastType } from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';
import { DateToStringPipe } from '@/utils/dateConversionPipes';

interface Tprops {
  selectedGroupID: number | undefined;
}

const Group = ({ selectedGroupID }: Tprops) => {
  const dispatch = useDispatch();
  const baseApiUrl = baseUrl.substring(0, baseUrl.lastIndexOf('/'));
  const defaultUserUrl = '/assets/DefaultUser.png';
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
  const [apiData, setApiData] = useState<GroupResultData[]>([]);
  const [filterText, setFilterText] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [filterData, setFilterData] = useState<GroupResultData[]>([]);
  const [selectedData, setSelectedData] = useState<GroupResultData>();
  const [uniqueFirstLetters, setUniqueFirstLetters] = useState<string[]>([]);
  const [addEditJSON, setAddEditJSON] = useState<GroupResultData>();
  const [isChangedJson, setIsChangedJson] = useState(false);

  const fetchProfileData = async () => {
    const obj: GroupSearchCriteria = {
      name: null,
      pmSystem: null,
      active: null,
    };
    const res = await getGroupProfileData(obj);
    if (res) {
      setApiData(res);
    }
    return res;
  };

  const fetchGroupInfo = (data: GroupResultData) => {
    setSelectedFile(undefined);
    setAddEditJSON(undefined);
    setSelectedData(data);
  };

  const handleFilterData = () => {
    const filterRes = apiData.filter((item) => {
      const { name, ein } = item;
      const searchText = filterText.toLowerCase();

      return (
        (name.toLowerCase().includes(searchText) ||
          ein?.toLowerCase().includes(searchText)) &&
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

    if (selectedGroupID) {
      const obj: GroupResultData | undefined = apiData.filter(
        (g) => g.id === selectedGroupID
      )[0];
      if (obj) fetchGroupInfo(obj);
    }
  };

  useEffect(() => {
    handleFilterData();
  }, [filterText, apiData, showInactive]);

  const handleAddUpdateJson = (value: GroupResultData) => {
    setAddEditJSON(value);
    setIsChangedJson(true);
  };

  const initProfile = () => {
    fetchProfileData();
  };
  useEffect(() => {
    initProfile();
  }, []);

  const handleAddForm = () => {
    setSelectedFile(undefined);
    setRemoveLogo(false);
    const obj: GroupResultData = {
      id: 0,
      name: '',
      ein: '',
      pmSystem: '',
      piUserName: null,
      piPassword: null,
      statementDays: 0,
      active: false,
      generalNote: false,
      sequenceNote: false,
      timer: false,
      logoName: '',
      logoURL: '',
      createdOn: '',
      createdBy: '',
      createdByID: '',
      updatedOn: '',
      updatedBy: '',
      updatedByID: '',
    };
    setAddEditJSON({ ...obj });
  };

  const submitAddEditToAPI = async () => {
    if (addEditJSON) {
      if (!addEditJSON.name || !addEditJSON.pmSystem) {
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
        addEditJSON.ein.length !== 0 &&
        (addEditJSON.ein.length > 9 || addEditJSON.ein.length < 9)
      ) {
        dispatch(
          addToastNotification({
            id: uuidv4(),
            text: 'EIN number must be of 9 digits',
            toastType: ToastType.ERROR,
          })
        );
        return;
      }
      let groupDta;
      if (addEditJSON.id) {
        groupDta = {
          groupId: addEditJSON.id,
          name: addEditJSON.name,
          ein: addEditJSON.ein,
          pmSystem: addEditJSON.pmSystem,
          piUserName: addEditJSON.piUserName,
          piPassword: addEditJSON.piPassword,
          statementDays: addEditJSON.statementDays,
          active: addEditJSON.active,
          generalNote: addEditJSON.generalNote,
          sequenceNote: addEditJSON.sequenceNote,
          timer: addEditJSON.timer,
        };
      } else {
        groupDta = {
          name: addEditJSON.name,
          ein: addEditJSON.ein,
          pmSystem: addEditJSON.pmSystem,
          piUserName: addEditJSON.piUserName,
          piPassword: addEditJSON.piPassword,
          statementDays: addEditJSON.statementDays,
          active: addEditJSON.active,
          generalNote: addEditJSON.generalNote,
          sequenceNote: addEditJSON.sequenceNote,
          timer: addEditJSON.timer,
        };
      }
      const formData = new FormData();
      formData.append('group', JSON.stringify(groupDta));
      if (selectedFile) formData.append('logo', selectedFile);
      formData.append('removeLogo', String(removeLogo));

      let res: any;
      if (addEditJSON.id) {
        res = await updateGroup(formData);
      } else {
        res = await addGroup(formData);
      }

      if (res) {
        setSelectedData(addEditJSON);
        fetchProfileData();
        setAddEditJSON(undefined);
        setIsChangedJson(false);
      } else {
        setStatusModalInfo({
          show: true,
          heading: 'Error',
          showCloseButton: false,
          text: `A system error prevented the Organization ${
            addEditJSON.id ? 'Settings changes to be saved' : 'to be created'
          }.\nPlease try again.`,
          type: StatusModalType.ERROR,
        });
      }
    }
  };
  const updateItemActive = async (id: number, active: boolean) => {
    const res = await updateGroupActive(id, active);
    if (res) {
      fetchProfileData();
      if (selectedData) {
        setSelectedData({
          ...selectedData,
          active,
        });
      } else {
        setSelectedData(undefined);
      }
    } else {
      setStatusModalInfo({
        show: true,
        heading: 'Error',
        showCloseButton: false,
        text: `A system error prevented the Group to be ${
          active ? 'activated' : 'inactivated'
        }.\nPlease try again.`,
        type: StatusModalType.ERROR,
      });
    }
  };
  const handleEditForm = () => {
    if (selectedData) {
      setSelectedFile(undefined);
      setRemoveLogo(false);
      setAddEditJSON(selectedData);
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
  return (
    <AppLayout title="Nucleus - Group/Organization Settings">
      <div className="m-0 h-full w-full overflow-y-auto p-0">
        <Breadcrumbs />
        <PageHeader cls="!bg-white !drop-shadow">
          <div className="flex items-start justify-between gap-4 px-7 pt-[33px] pb-[21px]">
            <div className="flex h-[38px] gap-6">
              <p className="self-center text-3xl font-bold text-cyan-700">
                Group/Organization Settings
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
                        } this Organization? Clicking "Confirm" will result in the loss of all changes.`,
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
                  Add New Group/Organization
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
                    placeholder="Filter by Group/Organization Name or EIN"
                    value={filterText}
                    onChange={(e) => {
                      setFilterText(e.target.value);
                    }}
                  />
                </div>
              </div>
              <div className="mt-2.5 flex gap-2">
                <CheckBox
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
                            Number(selectedData?.id) === d.id
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
                                } this Organization? Clicking "Confirm" will result in the loss of all changes.`,
                                type: StatusModalType.WARNING,
                                okButtonText: 'Confirm',
                                okButtonColor: ButtonType.primary,
                                confirmType:
                                  'CancelConfirmationOnSelectSaidebarItem',
                                data: d,
                              });
                              return;
                            }
                            fetchGroupInfo(d);
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
                                    <div className="flex w-full flex-col items-start justify-start space-y-1">
                                      <div className="inline-flex w-full items-center justify-start space-x-1.5">
                                        <p className="truncate text-sm leading-tight text-gray-500">
                                          EIN: {d.ein}
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
                            <div className="flex h-[20px] w-[10%] items-start justify-start">
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
            <div className="flex h-full w-full flex-col items-center overflow-y-auto bg-gray-50 pt-6">
              <div className="inline-flex w-11/12 flex-col items-start justify-start rounded-md border border-gray-200 bg-white px-6 py-4 shadow">
                <div className="inline-flex w-full items-end justify-between py-5">
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
                          ? addEditJSON.name || 'New Group'
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
                          Organization Name{' '}
                          {addEditJSON && (
                            <span className="text-cyan-500">*</span>
                          )}
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <InputField
                              placeholder="Organization Name"
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
                          EIN
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <InputField
                              placeholder="EIN Number"
                              maxLength={9}
                              type="number"
                              value={addEditJSON?.ein || ''}
                              onChange={(evt) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  ein: evt.target.value,
                                });
                              }}
                            />
                          </div>
                        ) : (
                          <p className="text-sm leading-tight text-gray-900">
                            {selectedData?.ein || ''}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          Group / Organization Logo{' '}
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
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          PM System{' '}
                          {addEditJSON && (
                            <span className="text-cyan-500">*</span>
                          )}
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <InputField
                              placeholder="PM System Name"
                              value={addEditJSON?.pmSystem || ''}
                              onChange={(evt) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  pmSystem: evt.target.value,
                                });
                              }}
                            />
                          </div>
                        ) : (
                          <p className="text-sm leading-tight text-gray-900">
                            {selectedData?.pmSystem || ''}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          PI User Name{' '}
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <InputField
                              placeholder="PI User Name"
                              value={addEditJSON?.piUserName || ''}
                              onChange={(evt) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  piUserName: evt.target.value,
                                });
                              }}
                            />
                          </div>
                        ) : (
                          <p className="text-sm leading-tight text-gray-900">
                            {selectedData?.piUserName || ''}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          PI Password
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <InputField
                              type="password"
                              placeholder="PI Password"
                              value={addEditJSON.piPassword}
                              onChange={(evt) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  piPassword: evt.target.value,
                                });
                              }}
                            />
                          </div>
                        ) : (
                          <p className="text-sm leading-tight text-gray-900">
                            {selectedData?.piPassword}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="inline-flex min-h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          Statement Days{' '}
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <InputField
                              placeholder="Number of Statement Days"
                              value={addEditJSON.statementDays}
                              type="number"
                              onChange={(evt) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  statementDays: Number(evt.target.value),
                                });
                              }}
                            />
                          </div>
                        ) : (
                          <p className="bg-gray-100 p-2 text-sm leading-tight text-gray-900">
                            {selectedData?.statementDays} Days
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                </div>
                <div className="h-[1px] w-full bg-gray-200" />
                <div className="flex w-full flex-col items-start justify-center py-4">
                  <div className="inline-flex w-full items-start justify-start space-x-4">
                    <div className="flex w-[33%] items-start justify-start space-x-4">
                      <p className="text-sm font-medium leading-tight text-gray-500">
                        Settings
                      </p>
                    </div>
                    <div className="flex w-[67%] justify-end">
                      <div className="inline-flex w-full flex-col items-start justify-start rounded-md border border-gray-200">
                        <div className="inline-flex w-full items-center justify-center space-x-4 py-3 pl-3 pr-4">
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
                        <div className="inline-flex w-full items-center justify-center space-x-4 py-3 pl-3 pr-4">
                          <div className="flex w-[50%] items-start justify-start">
                            <p className="text-sm leading-tight text-gray-900">
                              General Note
                            </p>
                          </div>
                          <div className="flex w-[50%] items-start justify-end gap-2">
                            {addEditJSON ? (
                              <ToggleButton
                                value={!!addEditJSON.generalNote}
                                onChange={(value) => {
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    generalNote: value,
                                  });
                                }}
                              />
                            ) : (
                              <ToggleButton
                                value={!!selectedData?.generalNote}
                              />
                            )}
                          </div>
                        </div>
                        <div className="h-[1px] w-full bg-gray-200" />
                        <div className="inline-flex w-full items-center justify-center space-x-4 py-3 pl-3 pr-4">
                          <div className="flex w-[50%] items-start justify-start">
                            <p className="text-sm leading-tight text-gray-900">
                              Sequence Note
                            </p>
                          </div>
                          <div className="flex w-[50%] items-start justify-end gap-2">
                            {addEditJSON ? (
                              <ToggleButton
                                value={!!addEditJSON.sequenceNote}
                                onChange={(value) => {
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    sequenceNote: value,
                                  });
                                }}
                              />
                            ) : (
                              <ToggleButton
                                value={!!selectedData?.sequenceNote}
                              />
                            )}
                          </div>
                        </div>
                        <div className="h-[1px] w-full bg-gray-200" />
                        <div className="inline-flex w-full items-center justify-center space-x-4 py-3 pl-3 pr-4">
                          <div className="flex w-[50%] items-start justify-start">
                            <p className="text-sm leading-tight text-gray-900">
                              Auto Timer
                            </p>
                          </div>
                          <div className="flex w-[50%] items-start justify-end gap-2">
                            {addEditJSON ? (
                              <ToggleButton
                                value={!!addEditJSON.timer}
                                onChange={(value) => {
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    timer: value,
                                  });
                                }}
                              />
                            ) : (
                              <ToggleButton value={!!selectedData?.timer} />
                            )}
                          </div>
                        </div>
                        <div className="h-[1px] w-full bg-gray-200" />
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
                                heading: 'Deactivate Group Confirmation',
                                text: 'Deactivating a group will make it unavailable throughout the system.\nAre you sure you want to proceed with this action?',
                                type: StatusModalType.WARNING,
                                okButtonText: 'Yes, Deactivate Group',
                                okButtonColor: ButtonType.tertiary,
                                confirmType:
                                  'CancelConfirmationOnHandleActivateItem',
                              });
                            } else {
                              setStatusModalInfo({
                                show: true,
                                showCloseButton: true,
                                heading: 'Activate Group Confirmation',
                                text: 'Activating a Group will make it unavailable throughout the system.\nAre you sure you want to proceed with this action?',
                                type: StatusModalType.WARNING,
                                okButtonText: 'Yes, Activate Group',
                                okButtonColor: ButtonType.primary,
                                confirmType:
                                  'CancelConfirmationOnHandleActivateItem',
                              });
                            }
                          }}
                        >
                          {selectedData?.active ? 'Deactivate' : 'Activate'}{' '}
                          Group/Organization
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
                                } this Organization? Clicking "Confirm" will result in the loss of all changes.`,
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
                          {addEditJSON.id ? 'Save Changes' : 'Add Organization'}
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
              fetchGroupInfo(statusModalInfo.data);
              //  fetchUserInfoByEmail(statusModalInfo.data);
            }
            if (
              statusModalInfo.data &&
              statusModalInfo.confirmType ===
                'CancelConfirmationOnSelectPractice'
            ) {
              setAddEditJSON(undefined);
              setIsChangedJson(false);
              setSelectedData(undefined);
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

export default Group;
