import type { GridColDef } from '@mui/x-data-grid-pro';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Icon from '@/components/Icon';
import PageHeader from '@/components/PageHeader';
import SavedSearchCriteria from '@/components/PatientSearch/SavedSearchCriteria';
import Breadcrumbs from '@/components/UI/Breadcrumbs/breadcrumbs';
import Button, { ButtonType } from '@/components/UI/Button';
import CloseButton from '@/components/UI/CloseButton';
import InputField from '@/components/UI/InputField';
import InputFieldAmount from '@/components/UI/InputFieldAmount';
import Modal from '@/components/UI/Modal';
import RadioButton from '@/components/UI/RadioButton';
import SearchDetailGrid, {
  globalPaginationConfig,
} from '@/components/UI/SearchDetailGrid';
import type { SingleSelectDropDownDataType } from '@/components/UI/SingleSelectDropDown';
import SingleSelectDropDown from '@/components/UI/SingleSelectDropDown';
import type { SingleSelectGridDropdownDataType } from '@/components/UI/SingleSelectGridDropdown';
import SingleSelectGridDropDown from '@/components/UI/SingleSelectGridDropdown';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import AppLayout from '@/layouts/AppLayout';
import { getselectdWorkGroupsIDsSelector } from '@/store/chrome/selectors';
import {
  fetchAssignClaimToDataRequest,
  fetchCPTSearchDataRequest,
  fetchPracticeDataRequest,
  getLookupDropdownsRequest,
} from '@/store/shared/actions';
import {
  addEditFeeSchedule,
  deleteFeeScheduleData,
  fetchFeeScheduleSearchData,
  fetchInsuranceData,
  getFeeType,
} from '@/store/shared/sagas';
import {
  getAllInsuranceDataSelector,
  getCPTSearchDataSelector,
  getLookupDropdownsDataSelector,
  getPracticeDataSelector,
} from '@/store/shared/selectors';
import type {
  AddUpdateFeeSchedule,
  AllInsuranceData,
  CPTSearchCriteria,
  FeeScheduleCriteria,
  FeeScheduleResult,
  GroupData,
  LookupDropdownsDataType,
  PracticeData,
} from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';
import useOnceEffect from '@/utils/useOnceEffect';

const FeeSchedule = () => {
  const dispatch = useDispatch();
  const lookupsData = useSelector(getLookupDropdownsDataSelector);
  const insuranceData = useSelector(getAllInsuranceDataSelector);
  const [insuranceAllData, setInsuanceAllData] = useState<AllInsuranceData[]>(
    []
  );
  const [practiceDropdown, setPracticeDropdown] = useState<PracticeData[]>([]);
  const cptSearchData = useSelector(getCPTSearchDataSelector);
  const [showWriteOffModal, setShowWriteOffModal] = useState(false);
  const [hideSearchParameters, setHideSearchParameters] =
    useState<boolean>(true);
  const selectedWorkedGroup = useSelector(getselectdWorkGroupsIDsSelector);
  const [groupDropdown, setGroupDropdown] = useState<GroupData[]>([]);

  const [isChangedJson, setIsChangedJson] = useState(true);
  const [selectedFeeScheduleId, setSelectedFeeScheduleId] = useState<number>();

  const [cptSearch, setCptSearch] = useState<CPTSearchCriteria>({
    searchValue: '',
    clientID: null,
  });
  const [feeTypeData, setFeeTypeData] = useState<LookupDropdownsDataType[]>([]);
  const [addEditJSON, setAddEditJSON] = useState<AddUpdateFeeSchedule>({
    feeScheduleID: null,
    groupID: null,
    practiceID: null,
    insuranceID: null,
    cpt: '',
    modifier: '',
    fee: null,
    active: true,
    selfPay: true,
    feeTypeID: null,
  });

  const practiceData = useSelector(getPracticeDataSelector);
  const [refreshDetailView, setRefreshDetailView] = useState<string>();
  useEffect(() => {
    if (refreshDetailView === 'refresh') {
      setRefreshDetailView(undefined);
    }
  }, [refreshDetailView]);
  useOnceEffect(() => {
    if (cptSearch.searchValue !== '') {
      dispatch(fetchCPTSearchDataRequest(cptSearch));
    }
  }, [cptSearch.searchValue]);
  const [statusModalInfo, setStatusModalInfo] = useState<{
    show: boolean;
    showCloseButton?: boolean;
    heading: string;
    text: string;
    type: StatusModalType;
    confirmType?: string;
    okButtonText?: string;
    okButtonColor?: ButtonType;
  }>();

  const defaultSearchCriteria: FeeScheduleCriteria = {
    pageNumber: 1,
    pageSize: globalPaginationConfig.activePageSize,
    sortByColumn: '',
    sortOrder: '',
    groupID: 0,
    active: true,
  };
  const [lastSearchCriteria, setLastSearchCriteria] = useState(
    defaultSearchCriteria
  );
  const [searchCriteria, setSearchCriteria] = useState(defaultSearchCriteria);
  const [searchResult, setSearchResult] = useState<FeeScheduleResult[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);

  const setSearchCriteriaFields = (value: FeeScheduleCriteria) => {
    setSearchCriteria(value);
    setIsChangedJson(true);
  };

  const getSearchData = async (obj: FeeScheduleCriteria) => {
    const res = await fetchFeeScheduleSearchData(obj);
    if (res) {
      setSearchResult(res);
      setTotalCount(res[0]?.total || 0);
      setLastSearchCriteria(obj);
    } else {
      setStatusModalInfo({
        ...statusModalInfo,
        show: true,
        showCloseButton: false,
        heading: 'Error',
        type: StatusModalType.ERROR,
        text: 'A system error occurred while searching for results.\nPlease try again.',
      });
    }
  };
  const handleAddUpdateJson = (value: AddUpdateFeeSchedule) => {
    setAddEditJSON(value);
  };

  useEffect(() => {
    setPracticeDropdown(practiceData || []);
    if (practiceData?.length === 1) {
      setSearchCriteria({
        ...searchCriteria,
        practiceID: practiceData[0]?.id,
      });
      handleAddUpdateJson({
        ...addEditJSON,
        practiceID: practiceData[0]?.id || null,
      });
    }
  }, [practiceData]);

  // Search bar
  const onClickSearch = async () => {
    const obj = {
      ...searchCriteria,
      sortColumn: '',
      sortOrder: '',
      pageNumber: 1,
    };
    setSearchCriteria(obj);
    getSearchData(obj);
  };
  const clearForm = () => {
    setAddEditJSON({
      feeScheduleID: null,
      groupID: selectedWorkedGroup?.groupsData[0]?.id || null,
      practiceID: searchCriteria.practiceID || null,
      insuranceID: null,
      cpt: '',
      modifier: '',
      fee: null,
      active: true,
      selfPay: true,
      feeTypeID: null,
    });
  };
  const initProfile = async () => {
    dispatch(getLookupDropdownsRequest());
    fetchInsuranceData();
    const res = await getFeeType();
    if (res) {
      setFeeTypeData(res);
    }
  };
  useEffect(() => {
    initProfile();
  }, []);

  const handleInsuanceAllData = (groupID: number) => {
    setInsuanceAllData([...insuranceData.filter((m) => m.groupID === groupID)]);
  };
  const onAddEditFeeSchedule = async () => {
    if (
      !addEditJSON.practiceID ||
      !addEditJSON.cpt ||
      !addEditJSON.fee ||
      !addEditJSON.feeTypeID
    ) {
      setStatusModalInfo({
        ...statusModalInfo,
        show: true,
        heading: 'Alert',
        showCloseButton: false,
        type: StatusModalType.WARNING,
        text: 'This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.',
      });
      return;
    }
    const res = await addEditFeeSchedule(addEditJSON);
    if (res) {
      setShowWriteOffModal(false);
      clearForm();
      getSearchData(lastSearchCriteria);
    }
  };
  const deleteFeeSchedule = async (id: number | undefined) => {
    const res = await deleteFeeScheduleData(id);
    if (!res) {
      setStatusModalInfo({
        ...statusModalInfo,
        show: true,
        showCloseButton: false,
        heading: 'Error',
        okButtonColor: ButtonType.primary,
        okButtonText: 'Ok',
        type: StatusModalType.ERROR,
        text: `A system error prevented the Fee Schedule to be deleted. Please try again.`,
        confirmType: '',
      });
    } else {
      getSearchData(lastSearchCriteria);
    }
  };
  useEffect(() => {
    setGroupDropdown(selectedWorkedGroup?.groupsData || []);
    setSearchCriteria({
      ...searchCriteria,
      groupID: selectedWorkedGroup?.groupsData[0]?.id || 0,
    });
    handleAddUpdateJson({
      ...addEditJSON,
      groupID: selectedWorkedGroup?.groupsData[0]?.id || null,
    });
    dispatch(
      fetchPracticeDataRequest({
        groupID: selectedWorkedGroup?.groupsData[0]?.id || 0,
      })
    );
  }, [selectedWorkedGroup]);
  useEffect(() => {
    const groupId = searchCriteria?.groupID;
    if (groupId) {
      dispatch(fetchAssignClaimToDataRequest({ clientID: groupId }));
    }
  }, [searchCriteria?.groupID]);

  useEffect(() => {
    if (searchCriteria.groupID) handleInsuanceAllData(searchCriteria.groupID);
  }, [searchCriteria.groupID, insuranceData]);

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'Fee Schedule ID',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-cyan-500"
            onClick={async () => {
              setCptSearch({
                ...cptSearch,
                searchValue: params.row.cpt,
              });
              setAddEditJSON({
                feeScheduleID: params.row.id,
                groupID: params.row.groupID,
                practiceID: params.row.practiceID,
                insuranceID: params.row.insuranceID,
                cpt: params.row.cpt,
                modifier: params.row.modifier,
                fee: params.row.fee,
                active: params.row.active === 'Yes',
                selfPay: params.row.selfPay === 'Yes',
                feeTypeID: params.row.feeTypeID,
              });
              setShowWriteOffModal(true);
            }}
          >
            {`#${params.row.id}`}
          </div>
        );
      },
    },
    {
      field: 'group',
      headerName: 'Group',
      flex: 1,
      minWidth: 240,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="cursor-pointer text-cyan-500" onClick={() => {}}>
              {params.value}
            </div>
            <div className="text-xs font-normal leading-4">
              EIN: {params.row.groupEIN ? `${params.row.groupEIN}` : ''}
            </div>
          </div>
        );
      },
    },
    {
      field: 'practice',
      headerName: 'Practice',
      flex: 1,
      minWidth: 220,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="cursor-pointer text-cyan-500 " onClick={() => {}}>
              {params.value}
            </div>
            <div className="text-xs font-normal leading-4">
              EIN: {params.row.practiceEIN ? `${params.row.practiceEIN}` : ''}
            </div>
          </div>
        );
      },
    },
    {
      field: 'insurance',
      headerName: 'Insurance',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      // renderCell: (params) => {
      //   return (
      //     <div className="flex flex-col">
      //       <div
      //         className="cursor-pointer text-cyan-500 underline"
      //         onClick={() => {}}
      //       >
      //         {params.value}
      //       </div>
      //     </div>
      //   );
      // },
    },
    {
      field: 'cpt',
      headerName: 'CPT Code',
      flex: 1,
      minWidth: 120,
      disableReorder: true,
    },
    {
      field: 'modifier',
      headerName: 'Modifier',
      flex: 1,
      minWidth: 120,
      disableReorder: true,
    },
    {
      field: 'feeType',
      headerName: 'Fee Type',
      flex: 1,
      minWidth: 160,
      disableReorder: true,
    },
    {
      field: 'fee',
      headerName: 'Fee',
      flex: 1,
      minWidth: 100,
      disableReorder: true,
      renderCell: (params) => {
        return <div>{params.value ? `$${params.value.toFixed(2)}` : ''}</div>;
      },
    },
    {
      field: 'active',
      headerName: 'Active',
      flex: 1,
      minWidth: 100,
      disableReorder: true,
    },
    {
      field: 'selfPay',
      headerName: 'Self Pay',
      flex: 1,
      minWidth: 100,
      disableReorder: true,
    },
    {
      field: 'updatedOn',
      headerName: 'Updated On',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'updatedBy',
      headerName: 'Updated By',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="cursor-pointer text-cyan-500 " onClick={() => {}}>
              {params.value}
            </div>
            <div className="text-xs font-normal leading-4">
              {params.row.updatedByRole ? `${params.row.updatedByRole}` : ''}
            </div>
          </div>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 180,
      disableReorder: true,
      headerClassName: '!bg-cyan-100 !text-center ',
      cellClassName: '!bg-cyan-50',
      renderCell: (params) => {
        return (
          <>
            <Button
              buttonType={ButtonType.secondary}
              fullWidth={true}
              cls={
                'ml-[2px] w-[85px] h-[38px] inline-flex !justify-center gap-2 leading-loose '
              }
              style={{ verticalAlign: 'middle' }}
              onClick={() => {
                setCptSearch({
                  ...cptSearch,
                  searchValue: params.row.cpt,
                });
                setAddEditJSON({
                  feeScheduleID: params.row.id,
                  groupID: params.row.groupID,
                  practiceID: params.row.practiceID,
                  insuranceID: params.row.insuranceID,
                  cpt: params.row.cpt,
                  modifier: params.row.modifier,
                  fee: params.row.fee,
                  active: params.row.active === 'Yes',
                  selfPay: params.row.selfPay === 'Yes',
                  feeTypeID: params.row.feeTypeID,
                });
                setShowWriteOffModal(true);
              }}
            >
              <Icon name={'pencil'} size={20} />
              <p className="text-justify text-sm">Edit</p>
            </Button>
            <div className="ml-2 flex gap-x-2">
              <Button
                buttonType={ButtonType.secondary}
                cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                onClick={() => {
                  setSelectedFeeScheduleId(params.row.id);
                  setStatusModalInfo({
                    show: true,
                    showCloseButton: true,
                    heading: 'Delete Fee Schedule Confirmation',
                    text: `Deleting a Fee Schedule  will permanently remove it from the system. Are you sure you want to proceed with this action?`,
                    type: StatusModalType.WARNING,
                    okButtonText: 'Yes, Delete Fee Schedule',
                    okButtonColor: ButtonType.tertiary,
                    confirmType: 'Delete',
                  });
                }}
              >
                <Icon name={'trash'} size={18} />
              </Button>
            </div>
          </>
        );
      },
    },
  ];

  return (
    <AppLayout title="Nucleus - Fee Schedule">
      <div className="m-0 h-full w-full overflow-y-auto bg-gray-100 p-0">
        <Breadcrumbs />
        <PageHeader>
          <div className="flex items-start justify-between gap-4  px-7 pt-[33px] pb-[21px]">
            <div className="flex h-[38px] gap-6">
              <p className="self-center text-3xl font-bold text-cyan-600">
                Fee Schedule
              </p>
              <div>
                <Button
                  cls={'h-[38px] truncate '}
                  buttonType={ButtonType.primary}
                  onClick={() => {
                    setShowWriteOffModal(true);
                  }}
                >
                  Create New Fee Schedule
                </Button>
              </div>
            </div>
          </div>
        </PageHeader>

        <div className={'bg-gray-50 px-[25px] pb-[25px]'}>
          <div className="flex items-center py-[20px] px-[5px]">
            <div
              className={`text-left font-bold text-gray-700 inline-flex items-center pr-[29px]`}
            >
              <p className={`text-xl m-0 sm:text-xl`}>Search Parameters</p>
            </div>
            <div className={`flex items-start`}>
              <SavedSearchCriteria
                jsonValue={JSON.stringify(searchCriteria)}
                onApply={(selectedItem) => {
                  if (selectedItem) {
                    setSearchCriteriaFields(selectedItem);
                  }
                }}
                addNewButtonActive={isChangedJson}
              />
            </div>
          </div>
          <div className={`px-[5px]`}>
            <div className={`h-[1px] w-full bg-gray-200`} />
          </div>
          {hideSearchParameters && (
            <div className="pt-[20px]">
              <div className="w-full">
                <div className="px-[5px] pb-[5px]">
                  <p className="text-base font-bold leading-normal text-gray-700">
                    Location
                  </p>
                </div>
                <div className="flex w-full flex-wrap">
                  <div className={`lg:w-[20%] w-[50%] px-[5px]`}>
                    <div className={`w-full items-start self-stretch`}>
                      <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                        Practice
                      </div>
                      <div className="w-full">
                        <SingleSelectDropDown
                          placeholder="-"
                          disabled={false}
                          data={practiceDropdown}
                          selectedValue={
                            practiceDropdown.filter(
                              (f) => f.id === searchCriteria?.practiceID
                            )[0]
                          }
                          onSelect={(value) => {
                            setSearchCriteriaFields({
                              ...searchCriteria,
                              practiceID: value.id,
                            });
                          }}
                          isOptional={true}
                          onDeselectValue={() => {
                            setSearchCriteriaFields({
                              ...searchCriteria,
                              practiceID: undefined,
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className={`lg:w-[20%] w-[50%] px-[5px]`}>
                    <div className={`w-full items-start self-stretch`}>
                      <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                        Insurance
                      </div>
                      <div className="w-full">
                        <SingleSelectDropDown
                          placeholder="-"
                          disabled={false}
                          data={
                            insuranceAllData
                              ? (insuranceAllData as SingleSelectDropDownDataType[])
                              : []
                          }
                          selectedValue={
                            insuranceAllData.filter(
                              (m) => m.id === searchCriteria.insuranceID
                            )[0]
                          }
                          onSelect={(value) => {
                            setSearchCriteriaFields({
                              ...searchCriteria,
                              insuranceID: value.id,
                            });
                          }}
                          isOptional={true}
                          onDeselectValue={() => {
                            setSearchCriteriaFields({
                              ...searchCriteria,
                              insuranceID: undefined,
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className={`lg:w-[20%] w-[50%] px-[5px]`}>
                    <div className={`w-full items-start self-stretch`}>
                      <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                        Fee Type
                      </div>
                      <div className="w-full">
                        <SingleSelectDropDown
                          placeholder="-"
                          disabled={false}
                          data={
                            feeTypeData
                              ? (feeTypeData as SingleSelectDropDownDataType[])
                              : []
                          }
                          selectedValue={
                            feeTypeData.filter(
                              (m) => m.id === searchCriteria.feeTypeID
                            )[0]
                          }
                          onSelect={(value) => {
                            setSearchCriteriaFields({
                              ...searchCriteria,
                              feeTypeID: value.id,
                            });
                          }}
                          isOptional={true}
                          onDeselectValue={() => {
                            setSearchCriteriaFields({
                              ...searchCriteria,
                              feeTypeID: undefined,
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className={'py-[15px] px-[5px]'}>
                  <div className={`h-[1px] w-full bg-gray-200`} />
                </div>

                <div className="w-full">
                  <div className="px-[5px] pb-[5px]">
                    <p className="text-base font-bold leading-normal text-gray-700">
                      Details
                    </p>
                  </div>
                  <div className="flex w-full flex-wrap">
                    <div className={`lg:w-[100%] w-[50%] px-[5px] flex`}>
                      <div className={`w-[20%] pr-[8px]`}>
                        <div className={`w-full items-start self-stretch`}>
                          <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                            CPT Code
                          </div>
                          <div className="w-full">
                            <InputField
                              placeholder="CPT Code"
                              value={searchCriteria?.cpt || ''}
                              onChange={(evt) => {
                                setSearchCriteriaFields({
                                  ...searchCriteria,
                                  cpt: evt.target.value,
                                });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className={`w-[20%] pr-[8px]`}>
                        <div className={`w-full items-start self-stretch`}>
                          <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                            Modifier
                          </div>
                          <div className="w-full">
                            <InputField
                              placeholder="Modifier"
                              value={searchCriteria?.modifier || ''}
                              onChange={(evt) => {
                                setSearchCriteriaFields({
                                  ...searchCriteria,
                                  modifier: evt.target.value,
                                });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className={`w-[20%] pr-[8px]`}>
                        <div className={`w-full items-start self-stretch`}>
                          <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                            Fee Schedule Greater or Equal to
                          </div>
                          <div className="w-full">
                            <InputFieldAmount
                              placeholder=""
                              showCurrencyName={false}
                              value={searchCriteria?.toFee || ''}
                              onChange={(evt) => {
                                setSearchCriteriaFields({
                                  ...searchCriteria,
                                  toFee: evt.target.value
                                    ? Number(evt.target.value)
                                    : undefined,
                                });
                              }}
                              type={'number'}
                            />
                          </div>
                        </div>
                      </div>
                      <div className={`w-[20%] pr-[8px]`}>
                        <div className={`w-full items-start self-stretch`}>
                          <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                            Fee Schedule Less or Equal to
                          </div>
                          <div className="w-full">
                            <InputFieldAmount
                              showCurrencyName={false}
                              value={searchCriteria?.fromFee || ''}
                              onChange={(evt) => {
                                setSearchCriteriaFields({
                                  ...searchCriteria,
                                  fromFee: evt.target.value
                                    ? Number(evt.target.value)
                                    : undefined,
                                });
                              }}
                              type={'number'}
                            />
                          </div>
                        </div>
                      </div>

                      <div
                        className={'hidden justify-center lg:flex lg:w-[1%]'}
                      >
                        <div className={`w-[1px] h-full bg-gray-200`} />
                      </div>
                      <div className={`lg:w-[20%] w-[50%] px-[5px] pl-[15px]`}>
                        <div className={`w-full items-start self-stretch`}>
                          <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                            Active
                          </div>
                          <div className="mt-[4px]  flex h-[38px] w-full items-center">
                            <RadioButton
                              data={[
                                { value: 'true', label: 'Yes' },
                                { value: 'false', label: 'No' },
                                { value: '', label: 'Both' },
                              ]}
                              checkedValue={
                                searchCriteria.active?.toString() || ''
                              }
                              onChange={(e) => {
                                const value =
                                  e.target.value === ''
                                    ? null
                                    : e.target.value === 'true';
                                setSearchCriteriaFields({
                                  ...searchCriteria,
                                  active: value,
                                });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex h-20 items-start justify-between gap-4 bg-gray-200 px-7 pt-[25px] pb-[15px]">
          <div className="flex w-full items-center justify-between">
            <div className="flex w-[50%] items-center justify-between">
              <Button
                cls={
                  'h-[33px] inline-flex items-center justify-center w-56 py-2 bg-cyan-500 shadow rounded-md'
                }
                buttonType={ButtonType.primary}
                onClick={onClickSearch}
              >
                <p className="text-sm font-medium leading-tight text-white">
                  Search
                </p>
              </Button>
            </div>
            <div className="flex w-[50%] items-end justify-end">
              <div
                onClick={() => {
                  setHideSearchParameters(!hideSearchParameters);
                }}
                className="flex cursor-pointer items-center px-6"
              >
                <Icon
                  className={classNames(
                    'w-5 h-5 rounded-lg',
                    hideSearchParameters === false ? '' : '-rotate-180'
                  )}
                  name={
                    hideSearchParameters === false
                      ? 'chevronDown'
                      : 'chevronDown'
                  }
                  size={16}
                  color={IconColors.GRAY_500}
                />
                <p className="pl-[5px] text-sm font-medium uppercase leading-tight tracking-wide text-gray-500">
                  {hideSearchParameters === false ? 'Show' : 'Hide'} Search
                  Parameters
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full gap-4 bg-white px-7 pt-[25px] pb-[15px]">
          <div className="flex w-full flex-col">
            <div className="h-full">
              <SearchDetailGrid
                pageNumber={lastSearchCriteria.pageNumber}
                pageSize={lastSearchCriteria.pageSize}
                totalCount={totalCount}
                rows={searchResult}
                persistLayoutId={32}
                columns={columns}
                pinnedColumns={{
                  right: ['actions'],
                }}
                checkboxSelection={false}
                onPageChange={(page: number) => {
                  const obj: FeeScheduleCriteria = {
                    ...lastSearchCriteria,
                    pageNumber: page,
                  };
                  setLastSearchCriteria(obj);
                  getSearchData(obj);
                }}
                onSortChange={(
                  field: string | undefined,
                  sort: 'asc' | 'desc' | null | undefined
                ) => {
                  if (searchResult.length) {
                    const obj: FeeScheduleCriteria = {
                      ...lastSearchCriteria,
                      sortByColumn: field || '',
                      sortOrder: sort || '',
                    };
                    setLastSearchCriteria(obj);
                    getSearchData(obj);
                  }
                }}
                onPageSizeChange={(pageSize: number, page: number) => {
                  if (searchResult.length) {
                    const obj: FeeScheduleCriteria = {
                      ...lastSearchCriteria,
                      pageSize,
                      pageNumber: page,
                    };
                    setLastSearchCriteria(obj);
                    getSearchData(obj);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
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
          if (statusModalInfo?.confirmType === 'CancelConfirmationOnAdd') {
            clearForm();
          }

          if (statusModalInfo?.confirmType === 'Delete') {
            deleteFeeSchedule(selectedFeeScheduleId);
          }
          setStatusModalInfo(undefined);
        }}
        onClose={() => {
          setStatusModalInfo(undefined);
        }}
      />
      <Modal
        open={showWriteOffModal}
        onClose={() => {}}
        modalContentClassName="relative w-[70%] overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 w-full"
      >
        <div className="flex flex-col bg-gray-100">
          <div className="mt-3 max-w-full py-4 px-6">
            <div className="flex flex-row justify-between">
              <div>
                <h1 className=" text-left  text-xl font-bold leading-7 text-gray-700">
                  {addEditJSON.feeScheduleID
                    ? `Edit Fee Schedule - ID#${addEditJSON.feeScheduleID}`
                    : 'New Fee Schedule'}
                </h1>
              </div>
              <div className="">
                <CloseButton
                  onClick={() => {
                    setShowWriteOffModal(false);
                    clearForm();
                  }}
                />
              </div>
            </div>
            <div className="mt-3 h-px w-full bg-gray-300" />
          </div>
          <div className="flex flex-col">
            <div className=" px-6 pt-4">
              <div className={` `}>
                <div className={`   `}>
                  <div>
                    <div className="flex w-full">
                      <div className="px-[5px] md:w-[50%] lg:w-[25%]">
                        <div
                          className={`flex flex-col w-full items-start justify-start self-stretch`}
                        >
                          <label className="text-sm font-medium leading-tight text-gray-700">
                            Group <span className="text-cyan-500">*</span>
                          </label>
                          <div className="w-full">
                            <SingleSelectDropDown
                              placeholder="-"
                              showSearchBar={true}
                              disabled={true}
                              data={
                                selectedWorkedGroup?.groupsData ||
                                ([] as SingleSelectDropDownDataType[])
                              }
                              selectedValue={
                                groupDropdown.filter(
                                  (f) => f.id === searchCriteria?.groupID
                                )[0]
                              }
                              onSelect={() => {}}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="px-[5px] md:w-[50%] lg:w-[25%]">
                        <div
                          className={`flex flex-col w-full items-start justify-start self-stretch`}
                        >
                          <label className="text-sm font-medium leading-tight text-gray-700">
                            Practice<span className="text-cyan-500">*</span>
                          </label>
                          <div className="w-full">
                            <SingleSelectDropDown
                              placeholder="Select From Dropdown"
                              showSearchBar={true}
                              disabled={false}
                              data={practiceDropdown}
                              selectedValue={
                                practiceDropdown.filter(
                                  (a) => a.id === addEditJSON.practiceID
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
                        </div>
                      </div>
                      <div className="px-[5px] md:w-[50%] lg:w-[25%]">
                        <div
                          className={`flex flex-col w-full items-start justify-start self-stretch`}
                        >
                          <label className="text-sm font-medium leading-tight text-gray-700">
                            Insurance
                          </label>
                          <div className="mt-1 w-full">
                            <SingleSelectGridDropDown
                              placeholder="Select From Dropdown"
                              showSearchBar={true}
                              disabled={addEditJSON.selfPay}
                              data={insuranceAllData}
                              selectedValue={
                                insuranceAllData.filter(
                                  (a) => a.id === addEditJSON.insuranceID
                                )[0]
                              }
                              onSelect={(value) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  insuranceID: value?.id || null,
                                });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="px-[5px] md:w-[50%] lg:w-[25%]">
                        <div
                          className={`flex flex-col w-full items-start justify-start self-stretch`}
                        >
                          <label className="text-sm font-medium leading-tight text-gray-700">
                            Fee Type<span className="text-cyan-500">*</span>
                          </label>
                          <div className="mt-1 w-full">
                            <SingleSelectGridDropDown
                              placeholder="Select From Dropdown"
                              showSearchBar={true}
                              disabled={false}
                              data={feeTypeData}
                              selectedValue={
                                feeTypeData.filter(
                                  (a) => a.id === addEditJSON.feeTypeID
                                )[0]
                              }
                              onSelect={(value) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  feeTypeID: value?.id || null,
                                });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={'py-[15px] px-[5px]'}>
                      <div className={`h-[1px] w-full bg-gray-200`} />
                    </div>
                    <div className="mb-6 flex w-full  flex-col items-start">
                      <div className="px-[5px] pb-[15px]">
                        <p className="text-base font-bold leading-normal text-gray-700">
                          Fee Schedule Details
                        </p>
                      </div>
                      <div className="flex w-full">
                        <div className="px-[5px] md:w-[50%] lg:w-[25%]">
                          <div
                            className={`flex flex-col w-full items-start self-stretch`}
                          >
                            <label className="text-sm font-medium leading-tight text-gray-700">
                              CPT Code <span className="text-cyan-500">*</span>
                            </label>
                            <div className="w-full">
                              <SingleSelectGridDropDown
                                placeholder=""
                                showSearchBar={true}
                                showDropdownIcon={false}
                                disabled={false}
                                data={
                                  cptSearchData?.length !== 0
                                    ? (cptSearchData as SingleSelectGridDropdownDataType[])
                                    : []
                                }
                                selectedValue={
                                  cptSearchData?.filter(
                                    (a) => a.value === addEditJSON.cpt
                                  )[0]
                                }
                                onSelect={(e) => {
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    cpt: e?.value || '',
                                  });
                                }}
                                onSearch={(value) => {
                                  setCptSearch({
                                    ...cptSearch,
                                    searchValue: value,
                                  });
                                }}
                                appendTextSeparator={'|'}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="px-[5px] md:w-[50%] lg:w-[25%]">
                          <div
                            className={`flex flex-col w-full items-start self-stretch`}
                          >
                            <label className="text-sm font-medium leading-tight text-gray-700">
                              Modifier
                            </label>
                            <div className="w-full">
                              <SingleSelectGridDropDown
                                placeholder=""
                                showSearchBar={true}
                                data={
                                  lookupsData?.modifiers
                                    ? (lookupsData?.modifiers as SingleSelectDropDownDataType[])
                                    : []
                                }
                                selectedValue={
                                  lookupsData?.modifiers?.filter(
                                    (a) => a.value === addEditJSON.modifier
                                  )[0]
                                }
                                onSelect={(e) => {
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    modifier: e?.value || '',
                                  });
                                }}
                                showDropdownIcon={false}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="px-[5px] md:w-[50%] lg:w-[25%]">
                          <div
                            className={`mt-[-4px] flex flex-col w-full items-start self-stretch`}
                          >
                            <label className="text-sm font-medium leading-tight text-gray-700">
                              Fee <span className="text-cyan-500">*</span>
                            </label>
                            <div className="w-full">
                              <InputFieldAmount
                                value={addEditJSON.fee || ''}
                                showCurrencyName={false}
                                onChange={(evt) => {
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    fee: Number(evt.target.value),
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div
                          className={`lg:w-[15%] w-[50%] px-[5px] pl-[15px]`}
                        >
                          <div
                            className={`mt-[-4px]  w-full items-start self-stretch`}
                          >
                            <div className="truncate py-[2px] text-left text-sm font-medium leading-tight text-gray-700">
                              Active
                            </div>
                            <div className="  flex h-[38px] w-full items-center">
                              <RadioButton
                                data={[
                                  { value: 'true', label: 'Yes' },
                                  { value: 'false', label: 'No' },
                                ]}
                                checkedValue={addEditJSON.active.toString()}
                                onChange={(e) => {
                                  const value = e.target.value === 'true';
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    active: value,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={`lg:w-[15%] w-[50%] px-[5px]`}>
                          <div
                            className={`mt-[-4px]  w-full items-start self-stretch`}
                          >
                            <div className="truncate py-[2px] text-left text-sm font-medium leading-tight text-gray-700">
                              Self Pay
                            </div>
                            <div className="  flex h-[38px] w-full items-center">
                              <RadioButton
                                data={[
                                  { value: 'true', label: 'Yes' },
                                  { value: 'false', label: 'No' },
                                ]}
                                checkedValue={addEditJSON.selfPay.toString()}
                                onChange={(e) => {
                                  const value = e.target.value === 'true';
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    selfPay: value,
                                    insuranceID:
                                      value === true
                                        ? null
                                        : addEditJSON.insuranceID,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`h-[86px] bg-gray-200 w-full`}>
            <div className="flex flex-row-reverse gap-4 p-6 ">
              <div>
                <Button
                  buttonType={ButtonType.primary}
                  onClick={async () => {
                    onAddEditFeeSchedule();
                  }}
                >
                  {addEditJSON.feeScheduleID
                    ? 'Save Changes'
                    : 'Create Fee Schedule'}
                </Button>
              </div>
              <div>
                <Button
                  buttonType={ButtonType.secondary}
                  cls={`w-[102px]`}
                  onClick={() => {
                    setStatusModalInfo({
                      show: true,
                      showCloseButton: true,
                      heading: 'Cancel Confirmation',
                      text: `Are you sure you want to cancel ${
                        addEditJSON.feeScheduleID ? 'editing' : 'creating'
                      } this Fee Schedule.`,
                      type: StatusModalType.WARNING,
                      okButtonText: 'Confirm',
                      okButtonColor: ButtonType.primary,
                      confirmType: 'CancelConfirmationOnAdd',
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
    </AppLayout>
  );
};

export default FeeSchedule;
