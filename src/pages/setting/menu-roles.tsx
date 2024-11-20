import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

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
import ToggleButton from '@/components/UI/ToggleButton';
import AppLayout from '@/layouts/AppLayout';
import { addToastNotification } from '@/store/shared/actions';
import {
  getModuleForAssignPrivilege,
  getModulesByRoleId,
  getModuleTypes,
  getRoleProfileData,
  saveRoleData,
  updateRoleActive,
  updateRoleData,
} from '@/store/shared/sagas';
import type {
  ModulesByRoleIdResultData,
  RoleResultData,
  TAddEditRole,
  TGetModuleForAssignPrivilege,
  TGetModuleTypes,
} from '@/store/shared/types';
import { ToastType } from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';
import { DateToStringPipe } from '@/utils/dateConversionPipes';

interface TModuleSelectJSON {
  moduleID?: number;
  moduleTypeID?: string;
  createAllowed?: boolean;
  updateAllowed?: boolean;
  deleteAllowed?: boolean;
}

const MenuRoles = () => {
  const dispatch = useDispatch();

  const [moduleSelectJSON, setModuleSelectJSON] = useState<TModuleSelectJSON>();
  const [moduleTypesDropdown, setModuleTypesDropdown] = useState<
    TGetModuleTypes[]
  >([]);
  const [moduleDropdown, setModuleDropdown] = useState<
    TGetModuleForAssignPrivilege[]
  >([]);
  const [moduleApiData, setModuleApiData] = useState<
    TGetModuleForAssignPrivilege[]
  >([]);
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
  const [apiData, setApiData] = useState<RoleResultData[]>([]);

  const [filterText, setFilterText] = useState('');
  const [menulFilterText, setMenulFilterText] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [filterData, setFilterData] = useState<RoleResultData[]>([]);
  const [selectedData, setSelectedData] = useState<RoleResultData>();
  const [uniqueFirstLetters, setUniqueFirstLetters] = useState<string[]>([]);
  const [addEditJSON, setAddEditJSON] = useState<TAddEditRole>();
  const [isChangedJson, setIsChangedJson] = useState(false);

  const fetchProfileData = async () => {
    const res = await getRoleProfileData();
    if (res) {
      setApiData(res);
    }
    return res;
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const [modulesByRoleIdData, setModulesByRoleIdData] = useState<
    ModulesByRoleIdResultData[]
  >([]);

  const fetchModulesByRoleId = async (id: string) => {
    const res = await getModulesByRoleId(id);
    if (res) {
      setModulesByRoleIdData(res);
    } else {
      setModulesByRoleIdData([]);
    }
  };

  const fetchInfoOnSelectItem = async (res: RoleResultData) => {
    setAddEditJSON(undefined);
    setMenulFilterText('');
    setSelectedData(res);
    fetchModulesByRoleId(res.id);
  };

  const handleFilterData = () => {
    const filterRes = apiData.filter((item) => {
      const { name, code, description } = item;
      const searchText = filterText.toLowerCase();

      return (
        (name.toLowerCase().includes(searchText) ||
          (description && description.toLowerCase().includes(searchText)) ||
          code.toLowerCase().includes(searchText)) &&
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

  const refreshSidebarDataAndSelectedData = async (
    isFetchModulesByRoleId: boolean
  ) => {
    const resApiData = await fetchProfileData();
    if (resApiData) {
      const obj = resApiData?.filter((f) => f.id === selectedData?.id)[0];
      if (obj) {
        setSelectedData(obj);
        if (isFetchModulesByRoleId && obj.id) fetchModulesByRoleId(obj.id);
      } else {
        setSelectedData(undefined);
      }
    }
  };

  const handleAddUpdateJson = (value: TAddEditRole) => {
    setAddEditJSON(value);
    setIsChangedJson(true);
  };

  const handleAddForm = () => {
    setMenulFilterText('');
    setModulesByRoleIdData([]);
    setAddEditJSON({
      id: '',
      name: '',
      code: '',
      description: '',
      active: true,
      homePageID: null,
      modules: [],
    });
  };

  const containsOnlyText = (variable: string) => {
    // Regular expression pattern to match any non-alphabetic characters
    const pattern = /[^a-zA-Z]/;

    // Test if the variable matches the pattern
    return !pattern.test(variable.split(' ').join(''));
  };

  const submitAddEditToAPI = async () => {
    if (addEditJSON) {
      if (!containsOnlyText(addEditJSON.name.trim())) {
        dispatch(
          addToastNotification({
            id: uuidv4(),
            text: 'Menu Role Name should not contain special characters',
            toastType: ToastType.ERROR,
          })
        );
        return;
      }

      if (!containsOnlyText(addEditJSON.code.trim())) {
        dispatch(
          addToastNotification({
            id: uuidv4(),
            text: 'Menu Role Code should not contain special characters',
            toastType: ToastType.ERROR,
          })
        );
        return;
      }

      if (!addEditJSON.name || !addEditJSON.code || !addEditJSON.description) {
        setStatusModalInfo({
          show: true,
          heading: 'Alert',
          showCloseButton: false,
          text: 'This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.',
          type: StatusModalType.WARNING,
        });
        return;
      }

      const payload: TAddEditRole = {
        ...addEditJSON,
        modules: modulesByRoleIdData,
      };

      let res: any;
      if (addEditJSON.id) {
        res = await updateRoleData(payload);
      } else {
        res = await saveRoleData(payload);
      }
      if (res && !!res?.errors?.length) {
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
        refreshSidebarDataAndSelectedData(true);
        setAddEditJSON(undefined);
        setIsChangedJson(false);
        setMenulFilterText('');
      } else {
        setStatusModalInfo({
          show: true,
          heading: 'Error',
          showCloseButton: false,
          text: `A system error prevented the Menu Role ${
            addEditJSON.id ? 'Settings changes to be saved' : 'to be created'
          }.\nPlease try again.`,
          type: StatusModalType.ERROR,
        });
      }
    }
  };

  const handleEditForm = () => {
    if (selectedData) {
      setMenulFilterText('');
      setAddEditJSON({
        id: selectedData.id,
        name: selectedData.name,
        code: selectedData.code,
        description: selectedData.description,
        homePageID: selectedData.homePageID,
        active: selectedData.active,
        modules: [],
      });
    }
  };

  const updateItemActive = async (id: string, active: boolean) => {
    const res = await updateRoleActive(id, active);
    if (res) {
      refreshSidebarDataAndSelectedData(false);
    } else {
      setStatusModalInfo({
        show: true,
        heading: 'Error',
        showCloseButton: false,
        text: `A system error prevented the Menu Role to be ${
          active ? 'activated' : 'inactivated'
        }.\nPlease try again.`,
        type: StatusModalType.ERROR,
      });
    }
  };

  const onAddEditCancel = () => {
    setMenulFilterText('');
    setAddEditJSON(undefined);
    if (selectedData && selectedData.id) {
      fetchModulesByRoleId(selectedData.id);
    }
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

  const handleModuleSelectJSON = (value: TModuleSelectJSON) => {
    setModuleSelectJSON(value);
    setIsChangedJson(true);
  };

  const resetAddedModuleInfo = () => {
    setModuleSelectJSON(undefined);
    setModuleDropdown([]);
  };

  const onHandleAddModule = () => {
    if (moduleSelectJSON && moduleSelectJSON.moduleID) {
      const arr: ModulesByRoleIdResultData[] = [
        {
          moduleID: moduleSelectJSON.moduleID,
          moduleName:
            moduleApiData.filter((f) => f.id === moduleSelectJSON.moduleID)[0]
              ?.value || '',
          moduleTypeName:
            moduleTypesDropdown.filter(
              (f) => f.id === moduleSelectJSON.moduleTypeID
            )[0]?.value || '',
          createAllowed: !!moduleSelectJSON.createAllowed,
          updateAllowed: !!moduleSelectJSON.updateAllowed,
          deleteAllowed: !!moduleSelectJSON.deleteAllowed,
        },
      ];
      setModulesByRoleIdData([...modulesByRoleIdData, ...arr]);
      resetAddedModuleInfo();
    }
  };

  const onHandleToggleModule = (res: ModulesByRoleIdResultData) => {
    setModulesByRoleIdData([
      ...modulesByRoleIdData.map((d) => {
        if (d.moduleID === res.moduleID) {
          return res;
        }
        return d;
      }),
    ]);
    setIsChangedJson(true);
  };
  const onHandleDeleteModule = (id: number) => {
    setModulesByRoleIdData([
      ...modulesByRoleIdData.filter((f) => f.moduleID !== id),
    ]);
    setIsChangedJson(true);
  };

  const fetchModuleTypes = async () => {
    const res = await getModuleTypes();
    if (res) {
      setModuleTypesDropdown(res);
    }
  };
  const fetchModuleForAssignPrivilege = async () => {
    const res = await getModuleForAssignPrivilege();
    if (res) {
      setModuleApiData(res);
    }
  };
  const initScreen = () => {
    fetchModuleTypes();
    fetchModuleForAssignPrivilege();
  };

  useEffect(() => {
    initScreen();
  }, []);

  return (
    <AppLayout title="Menu Roles Settings">
      <div className="m-0 h-full w-full overflow-y-auto p-0">
        <Breadcrumbs />
        <PageHeader cls="!bg-white !drop-shadow">
          <div className="flex items-start justify-between gap-4 px-7 pt-[33px] pb-[21px]">
            <div className="flex h-[38px] gap-6">
              <p className="self-center text-3xl font-bold text-cyan-700">
                Menu Roles Settings
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
                        } this Menu Role? Clicking "Confirm" will result in the loss of all changes.`,
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
                  Create New Menu Role
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
                    placeholder="Filter by Menu Role Code, Name, or Description"
                    value={filterText}
                    onChange={(e) => {
                      setFilterText(e.target.value);
                    }}
                  />
                </div>
              </div>
              <div className="mt-2.5 flex gap-2">
                <CheckBox
                  data-testid="showInActiveMenu"
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
                                } this Menu Role? Clicking "Confirm" will result in the loss of all changes.`,
                                type: StatusModalType.WARNING,
                                okButtonText: 'Confirm',
                                okButtonColor: ButtonType.primary,
                                confirmType:
                                  'CancelConfirmationOnSelectSaidebarItem',
                                data: d,
                              });
                              return;
                            }
                            fetchInfoOnSelectItem(d);
                          }}
                        >
                          <div className="h-[1px] w-full bg-gray-200" />
                          <div className="flex w-full flex-row items-center justify-center px-3 py-4">
                            <div
                              data-testid="menu_role_row"
                              className="flex h-full w-[90%] flex-row"
                            >
                              <div className="flex w-full flex-1 items-center justify-start px-3">
                                <div className="flex w-full flex-1 items-center justify-start space-x-4">
                                  <div className="inline-flex w-full flex-1 flex-col items-start justify-start space-y-1">
                                    <p className="text-truncate-3-lines w-full text-sm font-medium leading-tight text-cyan-500">
                                      {d.name}
                                    </p>
                                    <div className="flex w-full flex-col items-start justify-start space-y-1">
                                      <div className="inline-flex w-full flex-col items-start justify-start gap-1">
                                        <div className="inline-flex w-full items-start justify-start gap-1.5">
                                          <div className="text-[14px] font-normal leading-tight text-gray-500">
                                            Code:
                                          </div>
                                          <div className="text-[14px] font-normal leading-tight text-gray-500">
                                            {d.code}
                                          </div>
                                        </div>
                                      </div>
                                      {!!d.description && (
                                        <div className="inline-flex w-full flex-col items-start justify-start gap-1">
                                          <div className="inline-flex w-full items-start justify-start gap-1.5">
                                            <div className="text-[14px] font-normal leading-tight text-gray-500">
                                              Descrip.:
                                            </div>
                                            <div className="text-[14px] font-normal leading-tight text-gray-500">
                                              {d.description}
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
                    <div className="inline-flex flex-col items-start justify-start space-y-1">
                      <p className="text-lg font-medium leading-normal text-gray-900">
                        {addEditJSON
                          ? addEditJSON.name || 'New Menu Role'
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
                          Menu Role Name{' '}
                          {addEditJSON && (
                            <span className="text-cyan-500">*</span>
                          )}
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <InputField
                              placeholder="Menu Role Name"
                              value={addEditJSON.name}
                              disabled={!!addEditJSON.id}
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
                          Menu Role Code{' '}
                          {addEditJSON && (
                            <span className="text-cyan-500">*</span>
                          )}
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <InputField
                              placeholder="Menu Role Code"
                              value={addEditJSON.code}
                              disabled={!!addEditJSON.id}
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
                          Menu Role Description{' '}
                          {addEditJSON && (
                            <span className="text-cyan-500">*</span>
                          )}
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <InputField
                              placeholder="Menu Role Description"
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
                            {selectedData?.description || '-'}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          Menu Role Home Page
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <SingleSelectDropDown
                              placeholder="Select From Dropdown"
                              data={modulesByRoleIdData.map((d) => {
                                return { id: d.moduleID, value: d.moduleName };
                              })}
                              selectedValue={
                                moduleApiData.filter(
                                  (f) => f.id === addEditJSON?.homePageID
                                )[0]
                              }
                              isOptional
                              onSelect={(value) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  homePageID: value.id,
                                });
                              }}
                              onDeselectValue={() => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  homePageID: null,
                                });
                              }}
                            />
                          </div>
                        ) : (
                          <>
                            {moduleApiData.filter(
                              (f) => f.id === selectedData?.homePageID
                            )[0]?.value ? (
                              <div className="inline-flex h-6 items-center justify-center rounded bg-gray-100 px-3 py-0.5">
                                <div className="text-center text-[14px] font-medium leading-tight text-gray-800">
                                  {
                                    moduleApiData.filter(
                                      (f) => f.id === selectedData?.homePageID
                                    )[0]?.value
                                  }
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm leading-tight text-gray-500">
                                -
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                  </>
                </div>
                <div className="flex h-[60px] w-full flex-col items-start justify-center">
                  <div className="inline-flex w-full items-center justify-start space-x-2">
                    <p className="text-base font-bold leading-normal text-gray-900">
                      Module Access Settings
                    </p>
                  </div>
                </div>
                <div className="w-full">
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
                      placeholder="Filter by Module Name"
                      value={menulFilterText}
                      onChange={(e) => {
                        setMenulFilterText(e.target.value);
                      }}
                    />
                  </div>
                  <div className="flex w-full flex-col">
                    <div className="inline-flex items-center justify-start gap-4 self-stretch pl-[13px] pr-[17px] pt-[10px]">
                      <div className="flex h-[38px] shrink grow basis-0 items-start justify-start gap-2">
                        <div className="flex h-[38px] shrink grow basis-0 items-center justify-center px-[13px] py-[9px]">
                          <div className="text-[14px] font-bold leading-tight text-gray-900">
                            Module Type
                          </div>
                        </div>
                        <div className="flex h-[38px] shrink grow basis-0 items-center justify-center px-[13px] py-[9px]">
                          <div className="text-[14px] font-bold leading-tight text-gray-900">
                            Module Name
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-start gap-4">
                        <div className="text-[14px] font-medium leading-tight text-gray-300"></div>
                      </div>
                      <div className="flex items-center justify-start gap-2">
                        <div className="text-[14px] font-bold leading-tight text-gray-900">
                          Create
                        </div>
                      </div>
                      <div className="flex items-center justify-start gap-2">
                        <div className="text-[14px] font-bold leading-tight text-gray-900">
                          Update
                        </div>
                      </div>
                      <div className="flex items-center justify-start gap-2">
                        <div className="text-[14px] font-bold leading-tight text-gray-900">
                          Delete
                        </div>
                      </div>
                      {addEditJSON && (
                        <>
                          <div className="flex items-center justify-start gap-4">
                            <div className="text-[14px] font-medium leading-tight text-gray-300"></div>
                          </div>
                          <div className="flex h-[30px] w-[30px] items-center justify-center gap-2" />
                        </>
                      )}
                    </div>
                    <div className="inline-flex max-h-[448px] flex-col items-start justify-start overflow-y-auto rounded-md border border border border border-gray-200">
                      {modulesByRoleIdData
                        .filter((item) => {
                          const { moduleName } = item;
                          const searchText = menulFilterText.toLowerCase();

                          return moduleName.toLowerCase().includes(searchText);
                        })
                        .map((d) => {
                          return (
                            <>
                              <div className="inline-flex items-center justify-start gap-4 self-stretch pl-[13px] pr-[17px] pt-[13px] pb-3">
                                <div className="flex h-[38px] shrink grow basis-0 items-start justify-start gap-2">
                                  <div className="inline-flex h-full  w-[50%] items-center justify-center rounded bg-gray-100">
                                    <div className="text-center text-[14px] font-medium leading-tight text-gray-800">
                                      {d.moduleTypeName}
                                    </div>
                                  </div>
                                  <div className="inline-flex h-full  w-[50%] items-center justify-center rounded bg-gray-100">
                                    <div className="text-center text-[14px] font-medium leading-tight text-gray-800">
                                      {d.moduleName}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center justify-start gap-4">
                                  <div className="text-[14px] font-medium leading-tight text-gray-300">
                                    |
                                  </div>
                                </div>
                                <div className="flex items-center justify-start gap-2">
                                  <ToggleButton
                                    value={d.createAllowed}
                                    disabled={!addEditJSON}
                                    onChange={() => {
                                      onHandleToggleModule({
                                        ...d,
                                        createAllowed: !d.createAllowed,
                                      });
                                    }}
                                  />
                                </div>
                                <div className="flex items-center justify-start gap-2">
                                  <ToggleButton
                                    value={d.updateAllowed}
                                    disabled={!addEditJSON}
                                    onChange={() => {
                                      onHandleToggleModule({
                                        ...d,
                                        updateAllowed: !d.updateAllowed,
                                      });
                                    }}
                                  />
                                </div>
                                <div className="flex items-center justify-start gap-2">
                                  <ToggleButton
                                    value={d.deleteAllowed}
                                    disabled={!addEditJSON}
                                    onChange={() => {
                                      onHandleToggleModule({
                                        ...d,
                                        deleteAllowed: !d.deleteAllowed,
                                      });
                                    }}
                                  />
                                </div>

                                {addEditJSON && (
                                  <>
                                    <div className="flex items-center justify-start gap-4">
                                      <div className="text-[14px] font-medium leading-tight text-gray-300">
                                        |
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => {
                                        if (
                                          addEditJSON?.homePageID === d.moduleID
                                        ) {
                                          setStatusModalInfo({
                                            show: true,
                                            showCloseButton: true,
                                            heading: 'Remove Confirmation',
                                            text: `It will also be removed from the "Menu Roll Home Page".`,
                                            type: StatusModalType.WARNING,
                                            okButtonText: 'Confirm',
                                            okButtonColor: ButtonType.primary,
                                            confirmType:
                                              'RemoveConfirmationOnModule',
                                            data: d.moduleID,
                                          });
                                          return;
                                        }
                                        onHandleDeleteModule(d.moduleID);
                                      }}
                                    >
                                      <div className="flex h-[30px] w-[30px] items-center justify-center gap-2 rounded-md border border border border border-gray-300 bg-white shadow">
                                        <Icon name={'trash'} size={16} />
                                      </div>
                                    </button>
                                  </>
                                )}
                              </div>
                              <div className="h-[1px] self-stretch bg-gray-200" />
                            </>
                          );
                        })}
                      {!modulesByRoleIdData.length && (
                        <div className="w-full py-2">
                          <p className="w-full !text-center text-sm leading-tight text-gray-500">
                            No rows
                          </p>
                        </div>
                      )}
                    </div>
                    {addEditJSON && (
                      <>
                        <div className="inline-flex w-full items-center justify-start gap-4 self-stretch  pr-[17px] pt-[13px] pb-3">
                          <div className="flex h-[38px] w-[67%]  shrink grow basis-0 items-start justify-start gap-2">
                            <SingleSelectDropDown
                              placeholder="Select From List"
                              btnUpperDivCls={'w-[50%] !mt-0'}
                              data={
                                moduleTypesDropdown as unknown as SingleSelectDropDownDataType[]
                              }
                              selectedValue={
                                moduleTypesDropdown.filter(
                                  (f) => f.id === moduleSelectJSON?.moduleTypeID
                                )[0] as unknown as SingleSelectDropDownDataType
                              }
                              onSelect={(value) => {
                                handleModuleSelectJSON({
                                  ...moduleSelectJSON,
                                  moduleTypeID: value.id.toString(),
                                });
                                const moduleIDs = modulesByRoleIdData.map(
                                  (d) => d.moduleID
                                );
                                setModuleDropdown(
                                  moduleApiData
                                    .filter(
                                      (f) => f.typeCode === value.id.toString()
                                    )
                                    .map((d) => {
                                      return {
                                        ...d,
                                        isAlreadyAdded: !!moduleIDs.includes(
                                          d.id
                                        ),
                                      };
                                    })
                                );
                              }}
                            />
                            <SingleSelectDropDown
                              placeholder="Select From List"
                              btnUpperDivCls={'w-[50%] !mt-0'}
                              data={
                                moduleDropdown as unknown as SingleSelectDropDownDataType[]
                              }
                              selectedValue={
                                moduleDropdown.filter(
                                  (f) => f.id === moduleSelectJSON?.moduleID
                                )[0] as unknown as SingleSelectDropDownDataType
                              }
                              onSelect={(value) => {
                                handleModuleSelectJSON({
                                  ...moduleSelectJSON,
                                  moduleID: value.id,
                                  createAllowed: true,
                                  updateAllowed: true,
                                  deleteAllowed: true,
                                });
                              }}
                            />
                          </div>
                          <div className="flex w-[33%] gap-4">
                            <div className="flex items-center justify-start gap-4">
                              <div className="text-[14px] font-medium leading-tight text-gray-300">
                                |
                              </div>
                            </div>
                            <div className="flex items-center justify-start gap-2">
                              <ToggleButton
                                value={!!moduleSelectJSON?.createAllowed}
                                disabled={!moduleSelectJSON?.moduleID}
                                onChange={() => {
                                  handleModuleSelectJSON({
                                    ...moduleSelectJSON,
                                    createAllowed:
                                      !moduleSelectJSON?.createAllowed,
                                  });
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-start gap-2">
                              <ToggleButton
                                value={!!moduleSelectJSON?.updateAllowed}
                                disabled={!moduleSelectJSON?.moduleID}
                                onChange={() => {
                                  handleModuleSelectJSON({
                                    ...moduleSelectJSON,
                                    updateAllowed:
                                      !moduleSelectJSON?.updateAllowed,
                                  });
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-start gap-2">
                              <ToggleButton
                                value={!!moduleSelectJSON?.deleteAllowed}
                                disabled={!moduleSelectJSON?.moduleID}
                                onChange={() => {
                                  handleModuleSelectJSON({
                                    ...moduleSelectJSON,
                                    deleteAllowed:
                                      !moduleSelectJSON?.deleteAllowed,
                                  });
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-start gap-4">
                              <div className="text-[14px] font-medium leading-tight text-gray-300">
                                |
                              </div>
                            </div>
                            <button
                              className={classNames(
                                'flex h-[30px] w-[30px] items-center justify-center gap-2 rounded-md border border border border border-gray-300 shadow',
                                !moduleSelectJSON?.moduleID
                                  ? 'bg-gray-100'
                                  : 'bg-white'
                              )}
                              disabled={!moduleSelectJSON?.moduleID}
                              onClick={onHandleAddModule}
                            >
                              <Icon
                                name={'plus'}
                                size={16}
                                color={IconColors.GRAY_PLUS}
                              />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

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
                                heading: 'Deactivate Menu Role Confirmation',
                                text: 'Deactivating a Menu Role will make it unavailable throughout the system.\nAre you sure you want to proceed with this action?',
                                type: StatusModalType.ERROR,
                                okButtonText: 'Yes, Deactivate Menu Role',
                                okButtonColor: ButtonType.tertiary,
                                confirmType:
                                  'CancelConfirmationOnHandleActivateItem',
                              });
                            } else {
                              setStatusModalInfo({
                                show: true,
                                showCloseButton: true,
                                heading: 'Activate Menu Role Confirmation',
                                text: 'Activating a Menu Role will make it available throughout the system.\nAre you sure you want to proceed with this action?',
                                type: StatusModalType.WARNING,
                                okButtonText: 'Yes, Activate Menu Role',
                                okButtonColor: ButtonType.primary,
                                confirmType:
                                  'CancelConfirmationOnHandleActivateItem',
                              });
                            }
                          }}
                        >
                          {selectedData?.active ? 'Deactivate' : 'Activate'}{' '}
                          Menu Role
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
                                } this Menu Role? Clicking "Confirm" will result in the loss of all changes.`,
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
                          {addEditJSON.id ? 'Save Changes' : 'Create Menu Role'}
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
              setIsChangedJson(false);
              fetchInfoOnSelectItem(statusModalInfo.data);
            }
            if (
              statusModalInfo.data &&
              statusModalInfo.confirmType === 'RemoveConfirmationOnModule'
            ) {
              if (addEditJSON)
                handleAddUpdateJson({
                  ...addEditJSON,
                  homePageID: null,
                });
              onHandleDeleteModule(statusModalInfo.data);
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

export default MenuRoles;
