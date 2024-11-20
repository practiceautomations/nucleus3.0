import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { baseUrl } from '@/api/http-client';
import Icon from '@/components/Icon';
import PageHeader from '@/components/PageHeader';
import Breadcrumbs from '@/components/UI/Breadcrumbs/breadcrumbs';
import Button, { ButtonType } from '@/components/UI/Button';
import InputField from '@/components/UI/InputField';
import type { SingleSelectDropDownDataType } from '@/components/UI/SingleSelectDropDown';
import SingleSelectDropDown from '@/components/UI/SingleSelectDropDown';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import ToggleButton from '@/components/UI/ToggleButton';
import UploadFile from '@/components/UI/UploadFile';
import AppLayout from '@/layouts/AppLayout';
import { getselectdWorkGroupsIDsSelector } from '@/store/chrome/selectors';
import {
  addToastNotification,
  fetchPracticeDataRequest,
} from '@/store/shared/actions';
import {
  addModule,
  getModuleInfoByID,
  getModuleProfileData,
  getModuleTypeDropdown,
  updateModule,
  updateModuleActive,
} from '@/store/shared/sagas';
import type {
  LookupDropdownsDataType,
  ModuleFields,
  ModuleResultData,
} from '@/store/shared/types';
import { ToastType } from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';
import { DateToStringPipe } from '@/utils/dateConversionPipes';

const SettingModules = () => {
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
  const [practiceSelectedValue, setPracticeSelectedValue] =
    useState<SingleSelectDropDownDataType>();
  const [apiData, setApiData] = useState<ModuleResultData[]>([]);
  const [moduleTypeData, setModuleTypeData] = useState<
    LookupDropdownsDataType[] | null
  >(null);
  const [filterText, setFilterText] = useState('');
  // const [showInactive, setShowInactive] = useState(false);
  const [filterData, setFilterData] = useState<ModuleResultData[]>([]);
  const [selectedData, setSelectedData] = useState<ModuleFields>();
  const [uniqueFirstLetters, setUniqueFirstLetters] = useState<string[]>([]);
  const [addEditJSON, setAddEditJSON] = useState<ModuleFields>();
  const [isChangedJson, setIsChangedJson] = useState(false);

  const resetSidebarData = (clearPracticeSelectedData?: boolean) => {
    setFilterText('');
    setApiData([]);
    if (clearPracticeSelectedData) {
      setPracticeSelectedValue(undefined);
    }
  };

  const moduletypeData = async () => {
    const res = await getModuleTypeDropdown();
    if (res) {
      setModuleTypeData(res);
    }
  };
  useEffect(() => {
    moduletypeData();
  }, []);
  const fetchModuleInfoByID = async (id: number | undefined) => {
    setSelectedFile(undefined);

    const res = await getModuleInfoByID(id);
    if (res) {
      setAddEditJSON(undefined);
      setSelectedData({
        ...res,
      });
    }
  };
  const fetchProfileData = async () => {
    const res = await getModuleProfileData();
    if (res) {
      setApiData(res);
    }
    return res;
  };
  const updateItemActive = async (id: number, active: boolean) => {
    const res = await updateModuleActive(id, active);
    if (res) {
      fetchProfileData();
      if (selectedData) {
        await fetchModuleInfoByID(selectedData.id);
      } else {
        setSelectedData(undefined);
      }
    } else {
      setStatusModalInfo({
        show: true,
        heading: 'Error',
        showCloseButton: false,
        text: `A system error prevented the Module to be ${
          active ? 'activated' : 'inactivated'
        }.\nPlease try again.`,
        type: StatusModalType.ERROR,
      });
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

  useEffect(() => {
    if (selectedWorkedGroup?.groupsData[0]?.id) {
      resetSidebarData();
      fetchProfileData();
    }
  }, [practiceSelectedValue]);

  const handleFilterData = () => {
    const filterRes = apiData.filter((item) => {
      const { name, code } = item;
      const searchText = filterText.toLowerCase();

      return (
        (name && name.toLowerCase().includes(searchText)) ||
        (code && code.includes(searchText))
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
  }, [filterText, apiData]);

  const handleAddUpdateJson = (value: ModuleFields) => {
    setAddEditJSON(value);
    setIsChangedJson(true);
  };

  const handleAddForm = () => {
    if (selectedWorkedGroup?.groupsData[0]?.id) {
      setSelectedFile(undefined);
      setRemoveLogo(false);
      const obj: ModuleFields = {
        id: undefined,
        name: '',
        code: '',
        imgName: null,
        description: '',
        moduleUrl: '',
        moduleParameter: '',
        moduleDisplayOrder: undefined,
        moduleTypeCode: '',
        displayIcon: '',
        createAllowed: true,
        updateAllowed: true,
        deleteAllowed: true,
        createdBy: '',
        updatedBy: '',
        createdOn: '',
        updatedOn: '',
        groupID: 0,
        active: false,
        createdByID: '',
        updatedByID: '',
      };
      setAddEditJSON({ ...obj });
    }
  };

  const submitAddEditToAPI = async () => {
    if (addEditJSON) {
      if (
        !addEditJSON.name ||
        !addEditJSON.code ||
        !addEditJSON.moduleUrl ||
        !addEditJSON.moduleDisplayOrder ||
        !addEditJSON.moduleTypeCode
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
      let ModuleData;
      if (addEditJSON.id) {
        ModuleData = {
          moduleID: addEditJSON.id,
          moduleName: addEditJSON.name,
          moduleCode: addEditJSON.code,
          moduleTypeCode: addEditJSON.moduleTypeCode,
          moduleDescription: addEditJSON.description,
          moduleURL: addEditJSON.moduleUrl,
          displayOrder: addEditJSON.moduleDisplayOrder,
          displayIcon: addEditJSON.displayIcon,
          moduleParameter: addEditJSON.moduleParameter,
          createAllowed: addEditJSON.createAllowed,
          updateAllowed: addEditJSON.updateAllowed,
          deleteAllowed: addEditJSON.deleteAllowed,
        };
      } else {
        ModuleData = {
          moduleID: addEditJSON.id,
          moduleName: addEditJSON.name,
          moduleCode: addEditJSON.code,
          moduleTypeCode: addEditJSON.moduleTypeCode,
          moduleDescription: addEditJSON.description,
          moduleURL: addEditJSON.moduleUrl,
          displayOrder: addEditJSON.moduleDisplayOrder,
          displayIcon: addEditJSON.displayIcon,
          moduleParameter: addEditJSON.moduleParameter,
          createAllowed: addEditJSON.createAllowed,
          updateAllowed: addEditJSON.updateAllowed,
          deleteAllowed: addEditJSON.deleteAllowed,
        };
      }

      const formData = new FormData();
      formData.append('module', JSON.stringify(ModuleData));
      if (selectedFile) formData.append('logo', selectedFile);
      formData.append('removeLogo', String(removeLogo));

      let res: any;
      if (addEditJSON.id) {
        res = await updateModule(formData);
      } else {
        res = await addModule(formData);
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
          fetchProfileData();
        }
        if (selectedData) {
          await fetchModuleInfoByID(selectedData.id);
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
          text: `A system error prevented the Module${
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
  };

  const onAddEditCancel = () => {
    setAddEditJSON(undefined);
  };

  return (
    <AppLayout title="Modules Settings">
      <div className="m-0 h-full w-full overflow-y-auto p-0">
        <Breadcrumbs />
        <PageHeader cls="!bg-white !drop-shadow">
          <div className="flex items-start justify-between gap-4 px-7 pt-[33px] pb-[21px]">
            <div className="flex h-[38px] gap-6">
              <p className="self-center text-3xl font-bold text-cyan-700">
                Modules Settings
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
                        } this Module? Clicking "Confirm" will result in the loss of all changes.`,
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
                  Create New Module
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
                    autoComplete="off"
                    id="search"
                    name="search"
                    className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 leading-5 text-gray-500 placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:text-gray-900 focus:outline-none focus:ring-white sm:text-sm"
                    placeholder="Filter by Module Name, Code, or Description"
                    value={filterText}
                    onChange={(e) => {
                      setFilterText(e.target.value);
                    }}
                  />
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
                                  addEditJSON?.id ? 'editing' : 'creating'
                                } this Module? Clicking "Confirm" will result in the loss of all changes.`,
                                type: StatusModalType.WARNING,
                                okButtonText: 'Confirm',
                                okButtonColor: ButtonType.primary,
                                confirmType:
                                  'CancelConfirmationOnSelectSaidebarItem',
                                data: d.id,
                              });
                              return;
                            }
                            fetchModuleInfoByID(d.id);
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
                                      <p className="truncate text-sm leading-tight text-gray-500">
                                        Code: {d.code}
                                      </p>
                                      <p className="truncate text-sm leading-tight text-gray-500">
                                        Descrip.: {d.description}
                                      </p>
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
                          ? addEditJSON.name || 'New Module'
                          : selectedData?.name}
                      </p>
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
                          Module Name<span className="text-cyan-500">*</span>
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <InputField
                              placeholder="Module Name"
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
                          Module Code<span className="text-cyan-500">*</span>
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <InputField
                              placeholder="Module Code"
                              value={addEditJSON.code}
                              onChange={(evt) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  code: evt.target.value,
                                });
                              }}
                            />
                          </div>
                        ) : (
                          <p className="text-sm leading-tight text-gray-900">
                            {selectedData?.code}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          Module Icon
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
                          Module Description
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <InputField
                              placeholder="Module Description"
                              value={addEditJSON.description}
                              onChange={(evt) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  description: evt.target.value,
                                });
                              }}
                            />
                          </div>
                        ) : (
                          <p className="text-sm leading-tight text-gray-900">
                            {selectedData?.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          Module URL
                          <span className="text-cyan-500">*</span>
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <InputField
                              placeholder="/"
                              value={addEditJSON.moduleUrl}
                              onChange={(evt) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  moduleUrl: evt.target.value,
                                });
                              }}
                            />
                          </div>
                        ) : (
                          <p className="text-sm leading-tight text-gray-900">
                            {selectedData?.moduleUrl}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          Module Parameter
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <InputField
                              placeholder="Module Parameter"
                              value={addEditJSON.moduleParameter}
                              onChange={(evt) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  moduleParameter: evt.target.value,
                                });
                              }}
                            />
                          </div>
                        ) : (
                          <p className="text-sm leading-tight text-gray-900">
                            {selectedData?.moduleParameter}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          Module Display Order
                          <span className="text-cyan-500">*</span>
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <InputField
                              placeholder="Module Parameter"
                              value={addEditJSON.moduleDisplayOrder}
                              onChange={(evt) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  moduleDisplayOrder: evt.target.value,
                                });
                              }}
                            />
                          </div>
                        ) : (
                          <p className="cursor-pointer text-sm leading-tight">
                            {selectedData?.moduleDisplayOrder}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          Module Type Code
                          <span className="text-cyan-500">*</span>
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <SingleSelectDropDown
                              placeholder="Select From Dropdown"
                              data={
                                moduleTypeData
                                  ? (moduleTypeData as unknown as SingleSelectDropDownDataType[])
                                  : []
                              }
                              selectedValue={
                                moduleTypeData?.filter(
                                  (m) =>
                                    m.id.toString() ===
                                    addEditJSON?.moduleTypeCode
                                )[0]
                              }
                              onSelect={(evt) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  moduleTypeCode: evt.id.toString(),
                                });
                              }}
                            />
                          </div>
                        ) : (
                          <p className="cursor-pointer text-sm leading-tight">
                            {moduleTypeData?.filter(
                              (m) =>
                                m.id.toString() === selectedData?.moduleTypeCode
                            )[0]?.value || ''}
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
                      Module Settings
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
                    <div className="flex w-[67%] justify-end pb-[40px]">
                      <div className="inline-flex w-full flex-col items-start justify-start rounded-md border border-gray-200">
                        <div className="inline-flex w-full items-center justify-center space-x-4 py-3 pl-3 pr-4">
                          <div className="flex w-[50%] items-start justify-start">
                            <p className="text-sm leading-tight text-gray-900">
                              Create
                            </p>
                          </div>
                          <div className="flex w-[50%] items-start justify-end gap-2">
                            {addEditJSON ? (
                              <ToggleButton
                                value={!!addEditJSON.createAllowed}
                                onChange={(value) => {
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    createAllowed: value,
                                  });
                                }}
                              />
                            ) : (
                              <ToggleButton
                                value={!!selectedData?.createAllowed}
                              />
                            )}
                          </div>
                        </div>
                        <div className="h-[1px] w-full bg-gray-200" />
                        <div className="inline-flex w-full items-center justify-center space-x-4 py-3 pl-3 pr-4">
                          <div className="flex w-[50%] items-start justify-start">
                            <p className="text-sm leading-tight text-gray-900">
                              Update
                            </p>
                          </div>
                          <div className="flex w-[50%] items-start justify-end gap-2">
                            {addEditJSON ? (
                              <ToggleButton
                                value={!!addEditJSON.updateAllowed}
                                onChange={(value) => {
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    updateAllowed: value,
                                  });
                                }}
                              />
                            ) : (
                              <ToggleButton
                                value={!!selectedData?.updateAllowed}
                              />
                            )}
                          </div>
                        </div>
                        <div className="h-[1px] w-full bg-gray-200" />
                        <div className="inline-flex w-full items-center justify-center space-x-4 py-3 pl-3 pr-4">
                          <div className="flex w-[50%] items-start justify-start">
                            <p className="text-sm leading-tight text-gray-900">
                              Delete
                            </p>
                          </div>
                          <div className="flex w-[50%] items-start justify-end gap-2">
                            {addEditJSON ? (
                              <ToggleButton
                                value={!!addEditJSON.deleteAllowed}
                                onChange={(value) => {
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    deleteAllowed: value,
                                  });
                                }}
                              />
                            ) : (
                              <ToggleButton
                                value={!!selectedData?.deleteAllowed}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="sticky bottom-0 inline-flex w-[826px] items-center justify-center  bg-white pt-6 pb-7">
                <div className="absolute top-0 h-[1px] w-full bg-gray-200" />
                <div className="relative">
                  <div className="absolute top-0 right-0 mt-[40px] h-px !w-[90px] origin-top-right rotate-90 bg-gray-200" />
                </div>
                <div className="flex w-full items-center justify-end space-x-4 pr-9">
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
                              heading: 'Deactivate Module Confirmation',
                              text: 'Deactivating a Module will make it unavailable throughout the system.\nAre you sure you want to proceed with this action?',
                              type: StatusModalType.ERROR,
                              okButtonText: 'Yes, Deactivate Module',
                              okButtonColor: ButtonType.tertiary,
                              confirmType:
                                'CancelConfirmationOnHandleActivateItem',
                            });
                          } else {
                            setStatusModalInfo({
                              show: true,
                              showCloseButton: true,
                              heading: 'Activate Module Confirmation',
                              text: 'Activating a Module will make it unavailable throughout the system.\nAre you sure you want to proceed with this action?',
                              type: StatusModalType.WARNING,
                              okButtonText: 'Yes, Activate Module',
                              okButtonColor: ButtonType.primary,
                              confirmType:
                                'CancelConfirmationOnHandleActivateItem',
                            });
                          }
                        }}
                      >
                        {selectedData?.active ? 'Deactivate' : 'Activate'}{' '}
                        Module
                      </Button>
                      <Button
                        cls={'shadow w-24 mr-[20px]'}
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
                              } this Module? Clicking "Confirm" will result in the loss of all changes.`,
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
                        {addEditJSON.id ? 'Save Changes' : 'Create Module'}
                      </Button>
                    </>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute bottom-0 left-0 mb-[40px] h-px !w-[90px] origin-top-left rotate-90 bg-gray-200" />
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
              fetchModuleInfoByID(statusModalInfo.data);
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

export default SettingModules;
