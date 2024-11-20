import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
import TextArea from '@/components/UI/TextArea';
import ToggleButton from '@/components/UI/ToggleButton';
import AppLayout from '@/layouts/AppLayout';
import { getselectdWorkGroupsIDsSelector } from '@/store/chrome/selectors';
import {
  addToastNotification,
  fetchPracticeDataRequest,
  getLookupDropdownsRequest,
} from '@/store/shared/actions';
import {
  addFacility,
  getBillType,
  getFacilitiesProfileData,
  getPatientLookup,
  updateFacility,
  updateFacilityActive,
  validatePatientAddress,
} from '@/store/shared/sagas';
import {
  getLookupDropdownsDataSelector,
  getPracticeDataSelector,
} from '@/store/shared/selectors';
import type {
  AddEditFacilitiesData,
  FacilitiesResultData,
  PatientLookupDropdown,
  RevenueCodesData,
} from '@/store/shared/types';
import { ToastType } from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';
import { DateToStringPipe } from '@/utils/dateConversionPipes';

const Facilities = () => {
  const dispatch = useDispatch();
  const lookupsData = useSelector(getLookupDropdownsDataSelector);
  const practicesDataSelector = useSelector(getPracticeDataSelector);
  const selectedWorkedGroup = useSelector(getselectdWorkGroupsIDsSelector);

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
  const [apiData, setApiData] = useState<FacilitiesResultData[]>([]);
  const [filterText, setFilterText] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [filterData, setFilterData] = useState<FacilitiesResultData[]>([]);
  const [selectedData, setSelectedData] = useState<FacilitiesResultData>();
  const [uniqueFirstLetters, setUniqueFirstLetters] = useState<string[]>([]);
  const [addEditJSON, setAddEditJSON] = useState<AddEditFacilitiesData>();
  const [isChangedJson, setIsChangedJson] = useState(false);
  const [disAbleValidateAddressBtn, setDisAbleValidateAddressBtn] =
    useState(true);
  const [patientlookupData, setPatientlookupData] =
    useState<PatientLookupDropdown>();

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

  const fetchProfileData = async (practiceID: number, groupID: number) => {
    const res = await getFacilitiesProfileData(practiceID, groupID);
    if (res) {
      setApiData(res);
    }
    return res;
  };
  useEffect(() => {
    if (practiceSelectedValue?.id && selectedWorkedGroup?.groupsData[0]?.id) {
      resetSidebarData();
      fetchProfileData(
        practiceSelectedValue?.id,
        selectedWorkedGroup.groupsData[0].id
      );
    }
  }, [practiceSelectedValue]);

  const handleFilterData = () => {
    const filterRes = apiData.filter((item) => {
      const { name, npi, pos, address1 } = item;
      const searchText = filterText.toLowerCase();

      return (
        (name.toLowerCase().includes(searchText) ||
          (npi && npi.toLowerCase().includes(searchText)) ||
          pos.toLowerCase().includes(searchText) ||
          (address1 && address1.toLowerCase().includes(searchText))) &&
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

  const patientLookupData = async () => {
    const res = await getPatientLookup();
    if (res) {
      setPatientlookupData(res);
    }
  };
  const [billTypeData, setBillTypeData] = useState<RevenueCodesData[]>([]);
  const getBillTypeData = async () => {
    const res = await getBillType();
    if (res) {
      setBillTypeData(res);
    }
  };
  useEffect(() => {
    patientLookupData();
    getBillTypeData();
  }, []);

  const handleAddUpdateJson = (value: AddEditFacilitiesData) => {
    setAddEditJSON(value);
    setIsChangedJson(true);
  };

  const initProfile = () => {
    dispatch(getLookupDropdownsRequest());
  };
  useEffect(() => {
    initProfile();
  }, []);

  const handleAddForm = () => {
    const obj: AddEditFacilitiesData = {
      facilityID: null,
      name: null,
      groupID: selectedWorkedGroup?.groupsData[0]?.id || null,
      practiceID: null,
      placeOfServiceID: null,
      npi: null,
      cliaNo: null,
      address1: null,
      address2: null,
      zipCodeExtention: null,
      city: '',
      state: undefined,
      zipCode: '',
      contact: null,
      officePhone: null,
      fax: null,
      email: null,
      active: true,
      comments: null,
      validateIDS: [],
      billTypeID: null,
    };
    setAddEditJSON({ ...obj });
    setDisAbleValidateAddressBtn(true);
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
        !addEditJSON.practiceID ||
        !addEditJSON.placeOfServiceID
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
        addEditJSON.npi &&
        addEditJSON.npi?.length &&
        (addEditJSON.npi?.length < 10 || addEditJSON.npi?.length > 10)
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

      let res: any;
      if (addEditJSON.facilityID) {
        res = await updateFacility(addEditJSON);
      } else {
        res = await addFacility(addEditJSON);
      }

      if (res) {
        if (
          practiceSelectedValue?.id &&
          selectedWorkedGroup?.groupsData[0]?.id
        ) {
          const resApiData = await fetchProfileData(
            practiceSelectedValue.id,
            selectedWorkedGroup.groupsData[0].id
          );
          if (selectedData)
            setSelectedData(
              resApiData?.filter((f) => f.id === selectedData.id)[0]
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
          text: `A system error prevented the Facility ${
            addEditJSON.facilityID
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
      setAddEditJSON({
        facilityID: selectedData.id,
        name: selectedData.name,
        groupID: selectedData.groupID,
        practiceID: selectedData.practiceID,
        placeOfServiceID: selectedData.posID,
        npi: selectedData.npi,
        cliaNo: selectedData.cliaNumber,
        address1: selectedData.address1,
        address2: selectedData.address2,
        city: selectedData.city,
        state: selectedData.state,
        zipCode: selectedData.zipcode,
        zipCodeExtention: selectedData.zipcodeExtension,
        contact: selectedData.contact,
        officePhone: selectedData.officePhone,
        fax: selectedData.fax,
        email: selectedData.email,
        active: selectedData.active,
        comments: selectedData.comments,
        validateIDS: [],
        billTypeID: selectedData.billTypeID,
      });
      setDisAbleValidateAddressBtn(true);
    }
  };

  const updateItemActive = async (facilityID: number, active: boolean) => {
    const res = await updateFacilityActive(facilityID, active);
    if (res) {
      if (practiceSelectedValue?.id && selectedWorkedGroup?.groupsData[0]?.id) {
        const resApiData = await fetchProfileData(
          practiceSelectedValue.id,
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
        text: `A system error prevented the Facility to be ${
          active ? 'activated' : 'inactivated'
        }.\nPlease try again.`,
        type: StatusModalType.ERROR,
      });
    }
  };

  const onAddEditCancel = () => {
    setAddEditJSON(undefined);
  };

  const onValidateAddress = async (address: string, zips: string) => {
    const res = await validatePatientAddress(
      address,
      zips,
      'facility address',
      addEditJSON?.facilityID ? addEditJSON?.facilityID : null
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
    <AppLayout title="Nucleus - Facilities Settings">
      <div className="m-0 h-full w-full overflow-y-auto p-0">
        <Breadcrumbs />
        <PageHeader cls="!bg-white !drop-shadow">
          <div className="flex items-start justify-between gap-4 px-7 pt-[33px] pb-[21px]">
            <div className="flex h-[38px] gap-6">
              <p className="self-center text-3xl font-bold text-cyan-700">
                Facilities Settings
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
                          addEditJSON?.facilityID ? 'editing' : 'creating'
                        } this Facility? Clicking "Confirm" will result in the loss of all changes.`,
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
                  Add New Facility
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
              <div className="inline-flex w-full flex-col items-start justify-start space-y-1">
                <p className="text-sm font-medium leading-tight text-gray-700">
                  Choose a Practice to View Its Facilities
                </p>
                <div className="w-full">
                  <SingleSelectDropDown
                    testId="facility_select_filter"
                    placeholder="Select From Dropdown"
                    showSearchBar={true}
                    disabled={false}
                    data={
                      practicesDataSelector as SingleSelectDropDownDataType[]
                    }
                    selectedValue={practiceSelectedValue}
                    onSelect={(value) => {
                      if (isChangedJson) {
                        setStatusModalInfo({
                          show: true,
                          showCloseButton: true,
                          heading: 'Cancel Confirmation',
                          text: `Are you sure you want to cancel ${
                            addEditJSON?.facilityID ? 'editing' : 'creating'
                          } this Facility? Clicking "Confirm" will result in the loss of all changes.`,
                          type: StatusModalType.WARNING,
                          okButtonText: 'Confirm',
                          okButtonColor: ButtonType.primary,
                          confirmType: 'CancelConfirmationOnSelectPractice',
                          data: value,
                        });
                        return;
                      }
                      setAddEditJSON(undefined);
                      setSelectedData(undefined);
                      setPracticeSelectedValue(value);
                    }}
                  />
                </div>
              </div>
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
                    placeholder="Filter by Facility Name, NPI, PoS or Address"
                    value={filterText}
                    onChange={(e) => {
                      setFilterText(e.target.value);
                    }}
                  />
                </div>
              </div>
              <div className="mt-2.5 flex gap-2">
                <CheckBox
                  data-testid="showInActiveFacility"
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
                                  addEditJSON?.facilityID
                                    ? 'editing'
                                    : 'creating'
                                } this Facility? Clicking "Confirm" will result in the loss of all changes.`,
                                type: StatusModalType.WARNING,
                                okButtonText: 'Confirm',
                                okButtonColor: ButtonType.primary,
                                confirmType:
                                  'CancelConfirmationOnSelectSaidebarItem',
                                data: d,
                              });
                              return;
                            }
                            setAddEditJSON(undefined);
                            setSelectedData(d);
                          }}
                        >
                          <div className="h-[1px] w-full bg-gray-200" />
                          <div className="flex w-full flex-row items-center justify-center px-6 py-4">
                            <div className="flex w-full flex-1 items-center justify-start">
                              <div className="flex w-full flex-1 items-center justify-start space-x-4">
                                <div className="inline-flex w-full flex-1 flex-col items-start justify-start space-y-1">
                                  <p
                                    data-testid="facility_row"
                                    className="text-truncate-3-lines w-full text-sm font-medium leading-tight text-cyan-500"
                                  >
                                    {d.name}
                                  </p>
                                  <div className="flex w-full flex-col items-start justify-start space-y-1">
                                    <div className="inline-flex w-full items-start justify-start space-x-1.5">
                                      <p className="text-sm leading-tight text-gray-500">
                                        PoS:
                                      </p>
                                      <p className="text-sm leading-tight text-gray-500">
                                        {d.posCode} | {d.pos}
                                      </p>
                                    </div>
                                    {getStatusBadge(
                                      d.active ? 'Active' : 'inActive'
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex h-[20px] w-[20px] items-center justify-center">
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
                          ? addEditJSON.name || 'New Facility'
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
                          Facility Name{' '}
                          {addEditJSON && (
                            <span className="text-cyan-500">*</span>
                          )}
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div
                            data-testid="facility_name_testid"
                            className="w-full"
                          >
                            <InputField
                              placeholder="Facility Name"
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
                          {addEditJSON && !addEditJSON.facilityID && (
                            <span className="text-cyan-500"> *</span>
                          )}
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <SingleSelectDropDown
                              placeholder="-"
                              disabled={!!addEditJSON.facilityID}
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
                          Associated With Practice{' '}
                          {addEditJSON && (
                            <span className="text-cyan-500">*</span>
                          )}
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <SingleSelectDropDown
                              testId="associated_with_practice_testid"
                              placeholder="Select From Dropdown"
                              data={
                                practicesDataSelector as SingleSelectDropDownDataType[]
                              }
                              selectedValue={
                                practicesDataSelector?.filter(
                                  (f) => f.id === addEditJSON.practiceID
                                )[0]
                              }
                              onSelect={(value) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  practiceID: value.id,
                                });
                              }}
                            />
                          </div>
                        ) : (
                          <p className="cursor-pointer text-sm leading-tight text-cyan-500 underline">
                            {selectedData?.practice}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          PoS{' '}
                          {addEditJSON && (
                            <span className="text-cyan-500">*</span>
                          )}
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <SingleSelectDropDown
                              testId="pos"
                              placeholder="Select From Dropdown"
                              data={
                                lookupsData?.placeOfService
                                  ? (lookupsData?.placeOfService as SingleSelectDropDownDataType[])
                                  : []
                              }
                              selectedValue={
                                lookupsData?.placeOfService?.filter(
                                  (m) => m.id === addEditJSON.placeOfServiceID
                                )[0]
                              }
                              onSelect={(value) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  placeOfServiceID: value.id,
                                });
                              }}
                            />
                          </div>
                        ) : (
                          <p className="text-sm leading-tight text-gray-900">
                            {selectedData?.posCode} | {selectedData?.pos}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          NPI
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div data-testid="facility_npi" className="w-full">
                            <InputField
                              placeholder="NPI Number"
                              value={addEditJSON.npi}
                              type="number"
                              maxLength={10}
                              onChange={(evt) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  npi: evt.target.value,
                                });
                              }}
                            />
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
                          CLIA Number
                        </p>
                      </div>
                      <div
                        data-testid="facility_clianumber"
                        className="flex w-[67%] items-start justify-start space-x-4"
                      >
                        {addEditJSON ? (
                          <div className="w-full">
                            <InputField
                              placeholder="CLIA Number"
                              value={addEditJSON.cliaNo}
                              onChange={(evt) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  cliaNo: evt.target.value,
                                });
                              }}
                            />
                          </div>
                        ) : (
                          <p className="text-sm leading-tight text-gray-900">
                            {selectedData?.cliaNumber}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-gray-200" />
                    <div className="inline-flex h-[60px] w-full items-center justify-end space-x-4">
                      <div className="flex w-[33%] items-start justify-start space-x-4">
                        <p className="text-sm leading-tight text-gray-500">
                          Bill Type{' '}
                        </p>
                      </div>
                      <div className="flex w-[67%] items-start justify-start space-x-4">
                        {addEditJSON ? (
                          <div className="w-full">
                            <SingleSelectDropDown
                              placeholder="Bill Type"
                              isOptional={true}
                              data={
                                billTypeData
                                  ? (billTypeData as SingleSelectDropDownDataType[])
                                  : []
                              }
                              selectedValue={
                                billTypeData?.filter(
                                  (m) => m.id === addEditJSON.billTypeID
                                )[0]
                              }
                              onSelect={(value) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  billTypeID: value.id,
                                });
                              }}
                              onDeselectValue={() => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  billTypeID: null,
                                });
                              }}
                            />
                          </div>
                        ) : (
                          <p className="text-sm leading-tight text-gray-900">
                            {selectedData &&
                              billTypeData.filter(
                                (m) => m.id === selectedData.billTypeID
                              )[0]?.value}
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
                                  state: undefined,
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
                            {selectedData?.zipcodeExtension}
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
                              value={addEditJSON.contact}
                              onChange={(evt) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  contact: evt.target.value,
                                });
                              }}
                            />
                          </div>
                        ) : (
                          <p className="text-sm leading-tight text-gray-900">
                            {selectedData?.contact}
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
                            <InputField
                              placeholder="Office Phone"
                              value={addEditJSON.officePhone}
                              onChange={(evt) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  officePhone: evt.target.value,
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
                            <InputField
                              placeholder="Fax Number"
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
                          <div data-testid="facility_email" className="w-full">
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
                                heading: 'Deactivate Facility Confirmation',
                                text: 'Deactivating a Facility will make it unavailable throughout the system.\nAre you sure you want to proceed with this action?',
                                type: StatusModalType.ERROR,
                                okButtonText: 'Yes, Deactivate Facility',
                                okButtonColor: ButtonType.tertiary,
                                confirmType:
                                  'CancelConfirmationOnHandleActivateFacility',
                              });
                            } else {
                              setStatusModalInfo({
                                show: true,
                                showCloseButton: true,
                                heading: 'Activate Facility Confirmation',
                                text: 'Activating a Facility will make it available throughout the system.\nAre you sure you want to proceed with this action?',
                                type: StatusModalType.WARNING,
                                okButtonText: 'Yes, Activate Facility',
                                okButtonColor: ButtonType.primary,
                                confirmType:
                                  'CancelConfirmationOnHandleActivateFacility',
                              });
                            }
                          }}
                        >
                          {selectedData?.active ? 'Deactivate' : 'Activate'}{' '}
                          Facility
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
                                  addEditJSON?.facilityID
                                    ? 'editing'
                                    : 'creating'
                                } this Facility? Clicking "Confirm" will result in the loss of all changes.`,
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
                          {addEditJSON.facilityID
                            ? 'Save Changes'
                            : 'Add Facility'}
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
            if (
              statusModalInfo.confirmType === 'CancelConfirmationOnCancelBtn'
            ) {
              setIsChangedJson(false);
              onAddEditCancel();
            }
            if (
              statusModalInfo.confirmType ===
              'CancelConfirmationOnHandleActivateFacility'
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

export default Facilities;
