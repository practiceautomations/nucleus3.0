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
import CloseButton from '@/components/UI/CloseButton';
import InputField from '@/components/UI/InputField';
import Modal from '@/components/UI/Modal';
import SingleSelectDropDown from '@/components/UI/SingleSelectDropDown';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import TextArea from '@/components/UI/TextArea';
import ToggleButton from '@/components/UI/ToggleButton';
import UploadFile from '@/components/UI/UploadFile';
import AppLayout from '@/layouts/AppLayout';
import { addToastNotification } from '@/store/shared/actions';
import {
  addDataRole,
  addPractice,
  getDataRoleGroups,
  getDataRolePractices,
  getDataRoles,
  updateDataRole,
  updateDataRoleActive,
} from '@/store/shared/sagas';
import type {
  DataRoleResult,
  DataRoleSearchCriteria,
  TDataRoleGroups,
  TDataRolePractices,
} from '@/store/shared/types';
import { ToastType } from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';
import { DateToStringPipe } from '@/utils/dateConversionPipes';

const DataRole = () => {
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
  const [apiData, setApiData] = useState<DataRoleResult[]>([]);
  const [groupApiData, setGroupApiData] = useState<TDataRoleGroups[]>([]);
  const [practiceApiData, setPracticeApiData] = useState<TDataRolePractices[]>(
    []
  );
  const [filterText, setFilterText] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [filterData, setFilterData] = useState<DataRoleResult[]>([]);
  const [filterGroupText, setFilterGroupText] = useState('');
  const [filterPracticeText, setFilterPracticeText] = useState('');
  const [selectedData, setSelectedData] = useState<DataRoleResult>();
  const [uniqueFirstLetters, setUniqueFirstLetters] = useState<string[]>([]);
  const [addEditJSON, setAddEditJSON] = useState<DataRoleResult>();
  const [isChangedJson, setIsChangedJson] = useState(false);

  const [selectAllGroupToggle, setSelectAllGroupToggle] = useState(false);
  const [selectAllPracticeToggle, setSelectAllPracticeToggle] = useState(false);
  const [groupFilterData, setGroupFilterData] = useState<TDataRoleGroups[]>([]);
  const [practiceFilterData, setPracticeFilterData] = useState<
    TDataRolePractices[]
  >([]);

  const [addNewPracticeModal, setAddNewPracticeModal] = useState({
    open: false,
    practiceName: '',
    associatedGroupID: 0,
    npi: '',
  });

  const handleSelectAllToggleGroup = () => {
    setSelectAllGroupToggle(!selectAllGroupToggle);
    const groupRes = groupFilterData.map((d) => {
      return { ...d, select: !selectAllGroupToggle };
    });
    const practiceRes = practiceFilterData.map((d) => {
      return { ...d, show: !selectAllGroupToggle };
    });
    setGroupFilterData([...groupRes]);
    setPracticeFilterData([...practiceRes]);
    setIsChangedJson(true);
  };
  const handleToggleChangeGroup = (id: number, value: boolean) => {
    const updatedGroupData = groupFilterData.map((d) =>
      d.id === id ? { ...d, select: value } : d
    );

    const updatedPracticeData = practiceFilterData.map((d) =>
      d.groupID === id ? { ...d, show: value } : d
    );

    setGroupFilterData(updatedGroupData);
    setPracticeFilterData(updatedPracticeData);
    setIsChangedJson(true);
  };
  const handleAddUpdateJson = (value: DataRoleResult) => {
    setAddEditJSON(value);
    setIsChangedJson(true);
  };

  const handleSelectAllTogglePractice = () => {
    setSelectAllPracticeToggle(!selectAllPracticeToggle);
    const res = practiceFilterData.map((d) => {
      return { ...d, select: !selectAllPracticeToggle };
    });
    const selectPractice = res
      .filter((d) => d.select === true)
      .map((d) => d.id.toString())
      .join(',');
    if (addEditJSON) {
      handleAddUpdateJson({
        ...addEditJSON,
        practiceIDS: selectPractice,
      });
    }
    setPracticeFilterData([...res]);
    setIsChangedJson(true);
  };
  const handleToggleChangePractice = (id: number, value: boolean) => {
    const updatedData = practiceFilterData.map((d) =>
      d.id === id ? { ...d, select: value } : d
    );
    const selectPractice = updatedData
      .filter((d) => d.select === true)
      .map((d) => d.id.toString())
      .join(',');
    if (addEditJSON) {
      handleAddUpdateJson({
        ...addEditJSON,
        practiceIDS: selectPractice,
      });
    }
    setPracticeFilterData(updatedData);
    setIsChangedJson(true);
  };

  const fetchProfileData = async () => {
    const obj: DataRoleSearchCriteria = {
      title: '',
      description: '',
      active: null,
    };
    const res = await getDataRoles(obj);
    if (res) {
      setApiData(res);
    }
    return res;
  };

  const fetchDataRoleGroup = async () => {
    const res = await getDataRoleGroups();
    if (res) {
      setGroupApiData(res);
    }
    return res;
  };
  const handleSelectedGroups = (groupIds: string) => {
    const selectedGroups = groupApiData.map((d) => {
      return {
        ...d,
        select: !!(d.id && groupIds?.split(',').includes(d.id.toString())),
      };
    });
    setGroupFilterData(selectedGroups);
  };

  const fetchDataRolePractice = async () => {
    const res = await getDataRolePractices();
    if (res) {
      setPracticeApiData(res);
    }
    return res;
  };
  const handleSelectedPractices = (practiceIds: string, groupIds: string) => {
    const selectedPractice = practiceApiData.map((d) => {
      return {
        ...d,
        select: !!(d.id && practiceIds?.split(',').includes(d.id.toString())),
        show: !!(
          d.groupID && groupIds?.split(',').includes(d.groupID.toString())
        ),
      };
    });
    setPracticeFilterData(selectedPractice);
  };
  const fetchGroupInfo = (data: DataRoleResult) => {
    handleSelectedGroups(data.groupIDS);
    handleSelectedPractices(data.practiceIDS, data.groupIDS);
    setSelectedFile(undefined);
    setAddEditJSON(undefined);
    setSelectedData(data);
  };

  const handleFilterData = () => {
    const filterRes = apiData.filter((item) => {
      const { name, description } = item;
      const searchText = filterText.toLowerCase();

      return (
        (name.toLowerCase().includes(searchText) ||
          description?.toLowerCase().includes(searchText)) &&
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

  const initProfile = () => {
    fetchProfileData();
    fetchDataRoleGroup();
    fetchDataRolePractice();
  };
  useEffect(() => {
    initProfile();
  }, []);

  const handleAddForm = () => {
    setGroupFilterData(groupApiData);
    setPracticeFilterData(practiceApiData);
    setSelectedFile(undefined);
    setRemoveLogo(false);
    const obj: DataRoleResult = {
      id: 0,
      name: '',
      active: false,
      imgName: '',
      imgURL: '',
      createdOn: '',
      createdBy: '',
      createdByID: '',
      updatedOn: '',
      updatedBy: '',
      updatedByID: '',
      description: '',
      comments: '',
      groupIDS: '',
      practiceIDS: '',
    };
    setAddEditJSON({ ...obj });
  };

  const submitAddEditToAPI = async () => {
    if (addEditJSON) {
      if (!addEditJSON.name || !addEditJSON.description) {
        setStatusModalInfo({
          show: true,
          heading: 'Alert',
          showCloseButton: false,
          text: 'This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.',
          type: StatusModalType.WARNING,
        });
        return;
      }
      let dataRole;
      if (addEditJSON.id) {
        dataRole = {
          dataRoleID: addEditJSON.id,
          title: addEditJSON.name,
          description: addEditJSON.description,
          comments: addEditJSON.comments,
          active: addEditJSON.active,
          practiceIDs: addEditJSON.practiceIDS,
        };
      } else {
        dataRole = {
          title: addEditJSON.name,
          description: addEditJSON.description,
          comments: addEditJSON.comments,
          active: addEditJSON.active,
          practiceIDs: addEditJSON.practiceIDS,
        };
      }
      const formData = new FormData();
      formData.append('dataRole', JSON.stringify(dataRole));
      if (selectedFile) formData.append('logo', selectedFile);
      formData.append('removeLogo', String(removeLogo));

      let res: any;
      if (addEditJSON.id) {
        res = await updateDataRole(formData);
      } else {
        res = await addDataRole(formData);
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
          text: `A system error prevented the Data Role ${
            addEditJSON.id ? 'Settings changes to be saved' : 'to be created'
          }.\nPlease try again.`,
          type: StatusModalType.ERROR,
        });
      }
    }
  };
  const updateItemActive = async (id: number, active: boolean) => {
    const res = await updateDataRoleActive(id, active);
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
        text: `A system error prevented the Data Role to be ${
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
    setSelectAllGroupToggle(false);
    setSelectAllPracticeToggle(false);
    if (selectedData) {
      handleSelectedGroups(selectedData.groupIDS);
      handleSelectedPractices(selectedData.practiceIDS, selectedData.groupIDS);
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

  const submitAddPracticeToAPI = async () => {
    if (addNewPracticeModal) {
      if (!addNewPracticeModal.practiceName) {
        setStatusModalInfo({
          show: true,
          heading: 'Alert',
          showCloseButton: false,
          text: 'This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.',
          type: StatusModalType.WARNING,
        });
        return;
      }
      if (addNewPracticeModal.npi && addNewPracticeModal.npi.length !== 10) {
        dispatch(
          addToastNotification({
            id: uuidv4(),
            text: 'NPI must be of 10 digits.',
            toastType: ToastType.ERROR,
          })
        );
        return;
      }
      const formData = new FormData();
      const obj = {
        id: undefined,
        name: addNewPracticeModal.practiceName,
        groupID: addNewPracticeModal.associatedGroupID,
        npi: addNewPracticeModal.npi,
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
      formData.append('practice', JSON.stringify(obj));
      formData.append('removeLogo', String(removeLogo));
      const res = await addPractice(formData);
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
        const pracRes = await fetchDataRolePractice();
        if (pracRes) {
          const activeGroupIds = groupFilterData
            .filter((item) => item.select === true)
            .map((item) => item.id);
          const existingPracticeIDs = practiceFilterData.map((p) => p.id);
          const newPractice = pracRes.filter(
            (n) => !existingPracticeIDs.includes(n.id)
          );

          // Add new practice in existing practice data
          if (newPractice) {
            newPractice.forEach((m) => {
              practiceFilterData.push(m);
            });
          }

          // Update 'show' property for items in practiceFilterData based on activeGroupIds
          practiceFilterData.forEach((d, index) => {
            if (activeGroupIds.includes(d.groupID)) {
              practiceFilterData[index] = { ...d, show: true };
            }
          });
          setPracticeFilterData([...practiceFilterData]);
        }
        setAddNewPracticeModal({
          open: false,
          practiceName: '',
          associatedGroupID: 0,
          npi: '',
        });
      } else {
        setStatusModalInfo({
          show: true,
          heading: 'Error',
          showCloseButton: false,
          text: `A system error prevented the Practice to be created.\nPlease try again.`,
          type: StatusModalType.ERROR,
        });
      }
    }
  };

  return (
    <AppLayout title="Nucleus - Data Roles Settings">
      <div className="m-0 h-full w-full overflow-y-auto p-0">
        <Breadcrumbs />
        <PageHeader cls="!bg-white !drop-shadow">
          <div className="flex items-start justify-between gap-4 px-7 pt-[33px] pb-[21px]">
            <div className="flex h-[38px] gap-6">
              <p className="self-center text-3xl font-bold text-cyan-700">
                Data Roles
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
                        } this Data Role? Clicking "Confirm" will result in the loss of all changes.`,
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
                  Create New Data Role
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
                    autoComplete="off"
                    id="search"
                    name="search"
                    className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 leading-5 text-gray-500 placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:text-gray-900 focus:outline-none focus:ring-white sm:text-sm"
                    placeholder="Filter by Data Role Name or Description"
                    value={filterText}
                    onChange={(e) => {
                      setFilterText(e.target.value);
                    }}
                  />
                </div>
              </div>
              <div className="mt-2.5 flex gap-2">
                <CheckBox
                  data-testid="showInActiveDataRole"
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
                                } this Data Role? Clicking "Confirm" will result in the loss of all changes.`,
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
                            <div
                              data-testid="dataRole_row"
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
                                        <p className="truncate text-sm leading-tight text-gray-500">
                                          Descrip.: {d.description}
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
                          ? addEditJSON.name || 'New Data Role'
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
                          Data Role Name{' '}
                          {addEditJSON && (
                            <span className="text-cyan-500">*</span>
                          )}
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <InputField
                              placeholder="Data Role Name"
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
                          Data Role Description{' '}
                          {addEditJSON && (
                            <span className="text-cyan-500">*</span>
                          )}
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <InputField
                              placeholder="Data Role Description"
                              value={addEditJSON?.description || ''}
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
                            {selectedData?.description || ''}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          Data Role Logo{' '}
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
                  </>
                </div>
                <div className="h-[1px] w-full bg-gray-200" />
                <div className="flex h-[60px] w-full flex-col items-start justify-center">
                  <div className="inline-flex w-full items-center justify-start space-x-2">
                    <p className="text-base font-bold leading-normal text-gray-900">
                      Access Settings
                    </p>
                  </div>
                </div>
                <div className="flex w-full flex-col items-start justify-center py-4">
                  <div className="inline-flex w-full items-start justify-start space-x-4">
                    <div className="flex w-[33%] items-start justify-start space-x-4">
                      <p className="text-sm font-medium leading-tight text-gray-500">
                        Group / Organizations
                      </p>
                    </div>
                    <div className="flex w-[67%] items-start justify-start space-x-4">
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
                            placeholder="Filter by Group/Organization Name"
                            value={filterGroupText}
                            onChange={(e) => {
                              setFilterGroupText(e.target.value);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-auto mt-2 flex w-[65.5%] justify-end">
                    <div className="z-[1] inline-flex max-h-[350px] w-full flex-col items-start justify-start overflow-y-auto rounded-md border border-gray-200">
                      {addEditJSON && (
                        <div className="sticky top-0 z-[1] w-full bg-white">
                          <div className="inline-flex w-full items-center justify-center space-x-4 py-3 pl-3 pr-4">
                            <div className="flex w-[50%] items-start justify-start">
                              <p className="text-sm font-bold leading-tight text-gray-900">
                                Select All
                              </p>
                            </div>
                            <div className="flex w-[50%] items-start justify-end gap-2">
                              {addEditJSON ? (
                                <ToggleButton
                                  value={selectAllGroupToggle}
                                  onChange={handleSelectAllToggleGroup}
                                />
                              ) : (
                                <ToggleButton value={selectAllGroupToggle} />
                              )}
                            </div>
                          </div>
                          <div className="h-[1px] w-full bg-gray-200" />
                        </div>
                      )}
                      {groupFilterData
                        .filter((item) => {
                          if (filterGroupText) {
                            return item.value
                              .toLocaleLowerCase()
                              .includes(filterGroupText.toLowerCase());
                          }
                          return true;
                        })
                        .map((d) => (
                          <React.Fragment key={d.id}>
                            <div className="inline-flex w-full items-center justify-center space-x-4 py-3 pl-3 pr-4">
                              <div className="flex w-[50%] items-start justify-start">
                                <p className="text-sm leading-tight text-gray-900">
                                  {d.value}
                                </p>
                              </div>
                              <div className="flex w-[50%] items-start justify-end gap-2">
                                {addEditJSON ? (
                                  <>
                                    <div className="flex items-center justify-start gap-2 pt-[2px]">
                                      <ToggleButton
                                        testId="org"
                                        value={!!d.select}
                                        onChange={(value) => {
                                          handleToggleChangeGroup(d.id, value);
                                        }}
                                      />
                                    </div>
                                    <div className="flex items-center justify-start gap-4 px-[8px] pt-[5px]">
                                      <div className="text-[14px] font-medium leading-tight text-gray-300">
                                        |
                                      </div>
                                    </div>
                                    <button
                                      className={classNames(
                                        'flex h-[30px] w-[32px] items-center justify-center gap-2 rounded-md border border border border border-gray-300 shadow bg-white'
                                      )}
                                      title="Add Practice"
                                      onClick={() => {
                                        setAddNewPracticeModal({
                                          ...addNewPracticeModal,
                                          open: true,
                                          associatedGroupID: d.id,
                                        });
                                      }}
                                    >
                                      <Icon
                                        name={'plus'}
                                        size={16}
                                        color={IconColors.GRAY_PLUS}
                                      />
                                    </button>
                                  </>
                                ) : (
                                  <ToggleButton value={!!d.select} />
                                )}
                              </div>
                            </div>
                            <div className="">
                              <div className="h-[2px] w-full bg-gray-200" />
                            </div>
                          </React.Fragment>
                        ))}
                    </div>
                  </div>
                </div>
                <div className="h-[1px] w-full bg-gray-200" />
                <div className="mt-2 flex w-full flex-col items-start justify-center py-4">
                  <div className="inline-flex w-full items-start justify-start space-x-4">
                    <div className="flex w-[33%] items-start justify-start space-x-4">
                      <p className="text-sm font-medium leading-tight text-gray-500">
                        Practices
                      </p>
                    </div>
                    <div className="flex w-[67%] items-start justify-start space-x-4">
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
                            placeholder="Filter by Practice Name"
                            value={filterPracticeText}
                            onChange={(e) => {
                              setFilterPracticeText(e.target.value);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-auto mt-2 flex w-[65.5%] justify-end">
                    <div className="z-[1] inline-flex max-h-[350px] w-full flex-col items-start justify-start overflow-y-auto rounded-md border border-gray-200">
                      {addEditJSON && (
                        <div className="sticky top-0 z-[1] w-full bg-white">
                          <div className="inline-flex w-full items-center justify-center space-x-4 py-3 pl-3 pr-4">
                            <div className="flex w-[50%] items-start justify-start">
                              <p className="text-sm font-bold leading-tight text-gray-900">
                                Select All
                              </p>
                            </div>
                            <div className="flex w-[50%] items-start justify-end gap-2">
                              {addEditJSON ? (
                                <ToggleButton
                                  value={selectAllPracticeToggle}
                                  onChange={handleSelectAllTogglePractice}
                                />
                              ) : (
                                <ToggleButton value={selectAllPracticeToggle} />
                              )}
                            </div>
                          </div>
                          <div className="h-[1px] w-full bg-gray-200" />
                        </div>
                      )}

                      {practiceFilterData
                        .filter((item) => {
                          if (filterPracticeText) {
                            return item.value
                              .toLocaleLowerCase()
                              .includes(filterPracticeText.toLowerCase());
                          }
                          return true;
                        })
                        .map((d) =>
                          d.show ? (
                            <React.Fragment key={d.id}>
                              <div className="inline-flex w-full items-center justify-center space-x-4 py-3 pl-3 pr-4">
                                <div className="flex w-[50%] items-start justify-start">
                                  <p className="text-sm leading-tight text-gray-900">
                                    {d.value}
                                  </p>
                                </div>
                                <div className="flex w-[50%] items-start justify-end gap-2">
                                  {addEditJSON ? (
                                    <ToggleButton
                                      testId="prac"
                                      value={!!d.select}
                                      onChange={(value) => {
                                        handleToggleChangePractice(d.id, value);
                                      }}
                                    />
                                  ) : (
                                    <ToggleButton value={!!d.select} />
                                  )}
                                </div>
                              </div>
                            </React.Fragment>
                          ) : null
                        )}
                      <div className="h-[1px] w-full bg-gray-200" />
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
                                heading: 'Deactivate Data Role Confirmation',
                                text: 'Deactivating a data role will make it unavailable throughout the system.\nAre you sure you want to proceed with this action?',
                                type: StatusModalType.WARNING,
                                okButtonText: 'Yes, Deactivate Data Role',
                                okButtonColor: ButtonType.tertiary,
                                confirmType:
                                  'CancelConfirmationOnHandleActivateItem',
                              });
                            } else {
                              setStatusModalInfo({
                                show: true,
                                showCloseButton: true,
                                heading: 'Activate Data Role Confirmation',
                                text: 'Activating a data role will make it unavailable throughout the system.\nAre you sure you want to proceed with this action?',
                                type: StatusModalType.WARNING,
                                okButtonText: 'Yes, Activate Data Role',
                                okButtonColor: ButtonType.primary,
                                confirmType:
                                  'CancelConfirmationOnHandleActivateItem',
                              });
                            }
                          }}
                        >
                          {selectedData?.active ? 'Deactivate' : 'Activate'}{' '}
                          Data Role
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
                                } this Data Role? Clicking "Confirm" will result in the loss of all changes.`,
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
                          {addEditJSON.id ? 'Save Changes' : 'Create Data Role'}
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
        open={addNewPracticeModal.open}
        onClose={() => {}}
        modalContentClassName="relative w-[65%] overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 w-full"
      >
        <div className="flex flex-col bg-gray-100">
          <div className="mt-3 max-w-full p-4">
            <div className="flex flex-row justify-between">
              <div>
                <h1 className=" ml-2  text-left text-xl font-bold leading-7 text-gray-700">
                  Add New Practice
                </h1>
              </div>
              <div className="">
                <CloseButton
                  onClick={() => {
                    setAddNewPracticeModal({
                      open: false,
                      practiceName: '',
                      associatedGroupID: 0,
                      npi: '',
                    });
                  }}
                />
              </div>
            </div>
            <div className="mt-3 h-px w-full bg-gray-300" />
          </div>
          <div className="flex flex-col">
            <div className=" px-6 pt-6">
              <div>
                <div className="flex gap-3">
                  <div className="flex w-[29%] shrink flex-col items-start gap-1 ">
                    <label className="text-sm font-medium leading-5 text-gray-900">
                      Practice Name
                      <span style={{ color: '#007BFF' }}>*</span>
                    </label>
                    <div
                      data-testid="paymentReconsilationPaymentNumber"
                      className="h-[38px] w-full"
                    >
                      <InputField
                        placeholder="Practice Name"
                        disabled={false}
                        value={addNewPracticeModal.practiceName}
                        onChange={(e) => {
                          setAddNewPracticeModal({
                            ...addNewPracticeModal,
                            practiceName: e.target.value,
                          });
                        }}
                      />
                    </div>
                  </div>
                  <div className="ml-3 flex w-[28%] shrink flex-col items-start gap-1 text-left">
                    <div className=" inline-flex items-start justify-start space-x-1">
                      <label className="text-sm font-medium leading-5 text-gray-900">
                        Associated With Group/Organization
                      </label>
                    </div>
                    <div className="datePickerInModal w-full">
                      <SingleSelectDropDown
                        placeholder="-"
                        disabled={true}
                        data={groupFilterData}
                        selectedValue={
                          groupFilterData.filter(
                            (g) =>
                              g.id === addNewPracticeModal.associatedGroupID
                          )[0]
                        }
                        onSelect={() => {}}
                      />
                    </div>
                  </div>
                  <div className="ml-3 flex w-[25%] shrink flex-col items-start gap-1 text-left">
                    <div className=" inline-flex items-start justify-start space-x-1">
                      <label className="text-sm font-medium leading-5 text-gray-900">
                        NPI
                      </label>
                    </div>
                    <div className="datePickerInModal w-full">
                      <InputField
                        placeholder="NPI"
                        disabled={false}
                        value={addNewPracticeModal.npi}
                        onChange={(e) => {
                          setAddNewPracticeModal({
                            ...addNewPracticeModal,
                            npi: e.target.value,
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-7" />
            </div>
          </div>
          <div className={`h-[90px] bg-gray-200 w-full`}>
            <div className="flex flex-row-reverse gap-4 p-6 ">
              <div data-testid="reconsileModelBtn">
                <Button
                  buttonType={ButtonType.primary}
                  onClick={submitAddPracticeToAPI}
                >
                  Add Practice
                </Button>
              </div>
              <div>
                <Button
                  buttonType={ButtonType.secondary}
                  cls={`w-[102px]`}
                  onClick={() => {
                    setAddNewPracticeModal({
                      open: false,
                      practiceName: '',
                      associatedGroupID: 0,
                      npi: '',
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
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
              fetchGroupInfo(statusModalInfo.data);
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

export default DataRole;
