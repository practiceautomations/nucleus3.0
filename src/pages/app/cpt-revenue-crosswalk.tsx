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
import Modal from '@/components/UI/Modal';
import RadioButton from '@/components/UI/RadioButton';
import SearchDetailGrid, {
  globalPaginationConfig,
} from '@/components/UI/SearchDetailGrid';
import type { SingleSelectDropDownDataType } from '@/components/UI/SingleSelectDropDown';
import SingleSelectDropDown from '@/components/UI/SingleSelectDropDown';
import SingleSelectGridDropDown from '@/components/UI/SingleSelectGridDropdown';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import AppLayout from '@/layouts/AppLayout';
import { getselectdWorkGroupsIDsSelector } from '@/store/chrome/selectors';
import {
  fetchCPTSearchDataRequest,
  fetchPracticeDataRequest,
  getLookupDropdownsRequest,
} from '@/store/shared/actions';
import {
  addUpdateCptRevenueCrosswalk,
  deleteCptRevenueCrosswalk,
  fetchInsuranceData,
  getRevenueCrossWalkSearchData,
  getSearchRevenueCodes,
} from '@/store/shared/sagas';
import {
  getAllInsuranceDataSelector,
  getCPTSearchDataSelector,
  getPracticeDataSelector,
} from '@/store/shared/selectors';
import type {
  AddUpdateCptRevenueCrosswalkData,
  AllInsuranceData,
  CPTSearchCriteria,
  PracticeData,
  RevenueCodesData,
  RevenueCrossWalkSearchCriteria,
  RevenueCrossWalkSearchResult,
} from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';
import useOnceEffect from '@/utils/useOnceEffect';

const CPTRevenueCrosswalk = () => {
  const dispatch = useDispatch();
  const insuranceData = useSelector(getAllInsuranceDataSelector);
  const [insuranceAllData, setInsuanceAllData] = useState<AllInsuranceData[]>(
    []
  );
  const [practiceDropdown, setPracticeDropdown] = useState<PracticeData[]>([]);

  const [hideSearchParameters, setHideSearchParameters] =
    useState<boolean>(true);
  const selectedWorkedGroup = useSelector(getselectdWorkGroupsIDsSelector);
  const [isChangedJson, setIsChangedJson] = useState(false);
  const [refreshDetailView, setRefreshDetailView] = useState<string>();
  useEffect(() => {
    if (refreshDetailView === 'refresh') {
      setRefreshDetailView(undefined);
    }
  }, [refreshDetailView]);
  const [statusModalInfo, setStatusModalInfo] = useState<{
    show: boolean;
    showCloseButton?: boolean;
    heading: string;
    text: string;
    type: StatusModalType;
    confirmType?: string;
    okButtonText?: string;
    okButtonColor?: ButtonType;
  }>({
    show: false,
    heading: '',
    text: '',
    type: StatusModalType.WARNING,
  });
  const [showAddEditModal, setShowAddEditModal] = useState<{
    open: boolean;
    id?: number;
  }>({
    open: false,
  });

  const [addEditJSON, setAddEditJSON] =
    useState<AddUpdateCptRevenueCrosswalkData>({
      cptRevenueCrossWalkID: null,
      groupID: selectedWorkedGroup?.groupsData[0]?.id || null,
      practiceID: null,
      insuranceID: null,
      revenueCode: '',
      cptCode: '',
      active: true,
    });
  const handleAddUpdateJson = (value: AddUpdateCptRevenueCrosswalkData) => {
    setAddEditJSON(value);
  };
  const defaultSearchCriteria: RevenueCrossWalkSearchCriteria = {
    cptCode: '',
    revenueCode: '',
    pageNumber: 1,
    pageSize: globalPaginationConfig.activePageSize,
    sortColumn: '',
    sortOrder: '',
    getAllData: false,
  };
  const [lastSearchCriteria, setLastSearchCriteria] = useState(
    defaultSearchCriteria
  );
  const [searchCriteria, setSearchCriteria] = useState(defaultSearchCriteria);

  const clearForm = () => {
    setAddEditJSON({
      cptRevenueCrossWalkID: null,
      groupID: selectedWorkedGroup?.groupsData[0]?.id || null,
      practiceID: searchCriteria.practiceID || null,
      insuranceID: null,
      revenueCode: '',
      cptCode: '',
      active: true,
    });
  };
  const [cptSearch, setCptSearch] = useState<CPTSearchCriteria>({
    searchValue: '',
    clientID: null,
  });
  const [revenueSearchValue, setRevenueSearchValue] = useState('');
  const cptSearchData = useSelector(getCPTSearchDataSelector);
  useOnceEffect(() => {
    if (cptSearch.searchValue !== '') {
      dispatch(fetchCPTSearchDataRequest(cptSearch));
    }
  }, [cptSearch.searchValue]);
  const [revenueCodeModalData, setRevenueCodeModalData] = useState<
    RevenueCodesData[]
  >([]);
  const [revenueCodeData, setRevenueCodeData] = useState<RevenueCodesData[]>(
    []
  );
  const [revenueSearchGridValue, setRevenueSearchGridValue] = useState('');
  const [selectedCPTRevenueID, setSelectedCPTRevenueID] = useState<number>();
  const getRevenueCodeSearchData = async (
    revenueSearch: string,
    type: string
  ) => {
    const res = await getSearchRevenueCodes(revenueSearch);
    if (res) {
      if (type === 'modal') {
        setRevenueCodeModalData(res);
      } else {
        setRevenueCodeData(res);
      }
    }
  };
  useEffect(() => {
    if (revenueSearchValue !== '') {
      getRevenueCodeSearchData(revenueSearchValue, 'modal');
    }
  }, [revenueSearchValue]);

  useEffect(() => {
    if (revenueSearchGridValue !== '') {
      getRevenueCodeSearchData(revenueSearchGridValue, 'grid');
    }
  }, [revenueSearchGridValue]);

  const [searchResult, setSearchResult] = useState<
    RevenueCrossWalkSearchResult[]
  >([]);
  const [totalCount, setTotalCount] = useState<number>(0);

  const setSearchCriteriaFields = (value: RevenueCrossWalkSearchCriteria) => {
    setSearchCriteria(value);
    setIsChangedJson(true);
  };

  const getSearchData = async (obj: RevenueCrossWalkSearchCriteria) => {
    const res = await getRevenueCrossWalkSearchData(obj);
    if (res) {
      setSearchResult(res);
      setTotalCount(res?.length || 0);
      setLastSearchCriteria(obj);
    } else {
      setStatusModalInfo({
        ...statusModalInfo,
        show: true,
        heading: 'Error',
        type: StatusModalType.ERROR,
        text: 'A system error occurred while searching for results.\nPlease try again.',
      });
    }
  };

  // Search bar
  const onClickSearch = async () => {
    // if (!isChangedJson) {
    //   setStatusModalInfo({
    //     ...statusModalInfo,
    //     show: true,
    //     heading: 'Alert',
    //     text: 'Please fill in at least one search parameter to perform a query.\nReview your input and try again.',
    //   });
    //   return;
    // }
    const obj = {
      ...searchCriteria,
      sortColumn: '',
      sortOrder: '',
      pageNumber: 1,
    };
    setSearchCriteria(obj);
    getSearchData(obj);
  };

  const practiceData = useSelector(getPracticeDataSelector);

  const initProfile = () => {
    dispatch(getLookupDropdownsRequest());
    fetchInsuranceData();
  };
  useEffect(() => {
    initProfile();
  }, []);

  const handleInsuanceAllData = (groupID: number) => {
    setInsuanceAllData([...insuranceData.filter((m) => m.groupID === groupID)]);
  };

  useEffect(() => {
    if (selectedWorkedGroup && selectedWorkedGroup.groupsData) {
      dispatch(
        fetchPracticeDataRequest({
          groupID: selectedWorkedGroup?.groupsData[0]?.id || 0,
        })
      );
      setAddEditJSON({
        ...addEditJSON,
        groupID: selectedWorkedGroup?.groupsData[0]?.id || null,
      });
      if (selectedWorkedGroup?.groupsData[0]?.id) {
        handleInsuanceAllData(selectedWorkedGroup?.groupsData[0]?.id);
      }
    }
  }, [selectedWorkedGroup, insuranceData]);
  useEffect(() => {
    if (practiceData) {
      setPracticeDropdown(practiceData);
      setSearchCriteria({
        ...searchCriteria,
        practiceID: practiceData[0]?.id || undefined,
      });
      setAddEditJSON({
        ...addEditJSON,
        practiceID: practiceData[0]?.id || null,
      });
    }
  }, [practiceData]);
  const columns: GridColDef[] = [
    {
      field: 'revenueCrossWalkID',
      headerName: 'ID',
      flex: 1,
      minWidth: 80,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-cyan-500"
            onClick={async () => {
              setCptSearch({
                ...cptSearch,
                searchValue: params.row.cptCode,
              });
              setRevenueSearchValue(params.row.revenueCode);
              setAddEditJSON({
                ...addEditJSON,
                cptRevenueCrossWalkID: params.value,
                active: params.row.active === 'Yes',
                cptCode: params.row.cptCode,
                revenueCode: params.row.revenueCode,
                insuranceID: params.row.insuranceID,
                practiceID: params.row.practiceID,
                groupID: params.row.groupID,
              });
              setShowAddEditModal({
                open: true,
                id: params.row.revenueCrossWalkID,
              });
            }}
          >
            {`#${params.value}`}
          </div>
        );
      },
    },
    {
      field: 'group',
      headerName: 'Group',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="cursor-pointer text-cyan-500" onClick={() => {}}>
              {params.value}
            </div>
            <div className="text-xs font-normal leading-4">
              {params.row.groupEIN ? `${params.row.groupEIN}` : ''}
            </div>
          </div>
        );
      },
    },
    {
      field: 'practice',
      headerName: 'Practice',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="cursor-pointer text-cyan-500" onClick={() => {}}>
              {params.value}
            </div>
            <div className="text-xs font-normal leading-4">
              {params.row.practiceAddress
                ? `${params.row.practiceAddress}`
                : ''}
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
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="cursor-pointer text-cyan-500" onClick={() => {}}>
              {params.value}
            </div>
          </div>
        );
      },
    },
    {
      field: 'cptCode',
      headerName: 'CPT Code',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'revenueCode',
      headerName: 'Revenue Code',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'active',
      headerName: 'Active',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'updatedOn',
      headerName: 'Updated On',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'updatedBy',
      headerName: 'Updated By',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
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
                  searchValue: params.row.cptCode,
                });
                setRevenueSearchValue(params.row.revenueCode);
                setAddEditJSON({
                  ...addEditJSON,
                  cptRevenueCrossWalkID: params.row.revenueCrossWalkID,
                  active: params.row.active === 'Yes',
                  cptCode: params.row.cptCode,
                  revenueCode: params.row.revenueCode,
                  insuranceID: params.row.insuranceID,
                  practiceID: params.row.practiceID,
                  groupID: params.row.groupID,
                });
                setShowAddEditModal({
                  open: true,
                  id: params.row.revenueCrossWalkID,
                });
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
                  setSelectedCPTRevenueID(params.row.id);
                  setStatusModalInfo({
                    show: true,
                    showCloseButton: true,
                    heading: 'Delete CPT Revenue Crosswalk Confirmation',
                    text: `Deleting a CPT Revenue Crosswalk will permanently remove it from the system. Are you sure you want to proceed with this action?`,
                    type: StatusModalType.WARNING,
                    okButtonText: 'Yes, Delete CPT Revenue Crosswalk',
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
  const [isSaveClicked, setSaveClicked] = useState(false);

  const onSaveCPTRevenueCrosswalk = async () => {
    const res = await addUpdateCptRevenueCrosswalk(addEditJSON);
    if (res) {
      clearForm();
      getSearchData(lastSearchCriteria);
      setShowAddEditModal({ open: false });
    }
    setSaveClicked(false);
  };
  const deleteCPTRevenueCrosswalk = async (id: number) => {
    const res = await deleteCptRevenueCrosswalk(id);
    if (!res) {
      setStatusModalInfo({
        ...statusModalInfo,
        show: true,
        showCloseButton: false,
        heading: 'Error',
        okButtonColor: ButtonType.primary,
        okButtonText: 'Ok',
        type: StatusModalType.ERROR,
        text: `A system error prevented the CPT Revenue Crosswalk to be deleted. Please try again.`,
        confirmType: '',
      });
    } else {
      getSearchData(lastSearchCriteria);
    }
  };
  return (
    <AppLayout title="Nucleus - CPT Revenue Crosswalk">
      <div className="relative m-0 h-full bg-gray-100 p-0">
        <div className="m-0 h-full w-full overflow-y-scroll bg-gray-100 p-0">
          <div className="flex w-full flex-col">
            <div className="m-0 h-full w-full overflow-y-auto overflow-x-hidden bg-gray-100 p-0">
              <div className="h-[125px] w-full">
                <div className="absolute top-0 z-[11] w-full">
                  <Breadcrumbs />
                  <PageHeader>
                    <div className="flex items-start justify-between gap-4  px-7 pt-[33px] pb-[21px]">
                      <div className="flex h-[38px] gap-6">
                        <p className="self-center text-3xl font-bold text-cyan-700">
                          CPT Revenue Crosswalk
                        </p>
                        <div>
                          <Button
                            cls={'h-[38px] truncate '}
                            buttonType={ButtonType.primary}
                            onClick={() => {
                              setShowAddEditModal({ open: true });
                            }}
                          >
                            Create New CPT Revenue Crosswalk
                          </Button>
                        </div>
                      </div>
                    </div>
                  </PageHeader>
                </div>
              </div>
              <div className={'bg-gray-50 px-[25px] pb-[25px]'}>
                <div className="flex items-center py-[20px] px-[5px]">
                  <div
                    className={`text-left font-bold text-gray-700 inline-flex items-center pr-[29px]`}
                  >
                    <p className={`text-xl m-0 sm:text-xl`}>
                      Search Parameters
                    </p>
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
                      <div className="flex w-full flex-wrap">
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
                                  data={
                                    practiceDropdown as SingleSelectDropDownDataType[]
                                  }
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
                            <div className={`lg:w-[20%] w-[50%] px-[5px] flex`}>
                              <div
                                className={`w-full items-start self-stretch`}
                              >
                                <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                  CPT Code
                                </div>
                                <div className="w-full">
                                  <InputField
                                    placeholder="CPT Code"
                                    value={searchCriteria?.cptCode || ''}
                                    onChange={(evt) => {
                                      setSearchCriteriaFields({
                                        ...searchCriteria,
                                        cptCode: evt.target.value,
                                      });
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="w-[50%] px-[5px] lg:w-[20%]">
                              <div
                                className={`w-full items-start self-stretch`}
                              >
                                <label className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                  Revenue Code
                                </label>
                                <div className="w-full">
                                  <SingleSelectGridDropDown
                                    placeholder=""
                                    showSearchBar={true}
                                    showDropdownIcon={false}
                                    disabled={false}
                                    data={
                                      revenueCodeData?.length !== 0
                                        ? (revenueCodeData as SingleSelectDropDownDataType[])
                                        : []
                                    }
                                    selectedValue={
                                      revenueCodeData?.filter(
                                        (a) =>
                                          a.code === searchCriteria.revenueCode
                                      )[0]
                                    }
                                    onSelect={(e) => {
                                      setSearchCriteriaFields({
                                        ...searchCriteria,
                                        revenueCode:
                                          revenueCodeData?.filter(
                                            (a) => a.value === e?.value
                                          )[0]?.code || '',
                                      });
                                    }}
                                    onSearch={(value) => {
                                      setRevenueSearchGridValue(value);
                                    }}
                                    appendTextSeparator={'|'}
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
                      <p
                        data-testid="payment_batch_search"
                        className="text-sm font-medium leading-tight text-white"
                      >
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
                        {hideSearchParameters === false ? 'Show' : 'Hide'}{' '}
                        Search Parameters
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
                      persistLayoutId={40}
                      rows={searchResult.map((row) => {
                        return {
                          ...row,
                          id: row.revenueCrossWalkID,
                        };
                      })}
                      columns={columns}
                      checkboxSelection={false}
                      onPageChange={(page: number) => {
                        const obj: RevenueCrossWalkSearchCriteria = {
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
                          const obj: RevenueCrossWalkSearchCriteria = {
                            ...lastSearchCriteria,
                            sortColumn: field || '',
                            sortOrder: sort || '',
                          };
                          setLastSearchCriteria(obj);
                          getSearchData(obj);
                        }
                      }}
                      onPageSizeChange={(pageSize: number, page: number) => {
                        if (searchResult.length) {
                          const obj: RevenueCrossWalkSearchCriteria = {
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
          </div>
        </div>
      </div>
      <StatusModal
        open={statusModalInfo.show}
        heading={statusModalInfo.heading}
        description={statusModalInfo.text}
        statusModalType={statusModalInfo.type}
        showCloseButton={false}
        closeOnClickOutside={true}
        onChange={() => {
          if (statusModalInfo?.confirmType === 'CancelConfirmationOnAdd') {
            clearForm();
          }
          if (
            statusModalInfo?.confirmType === 'Delete' &&
            selectedCPTRevenueID
          ) {
            deleteCPTRevenueCrosswalk(selectedCPTRevenueID);
          }
          setShowAddEditModal({ open: false, id: undefined });
          setStatusModalInfo({
            ...statusModalInfo,
            show: false,
            heading: '',
            text: '',
          });
        }}
        onClose={() => {
          setStatusModalInfo({
            ...statusModalInfo,
            show: false,
            heading: '',
            text: '',
          });
        }}
      />
      <Modal
        open={showAddEditModal.open}
        onClose={() => {}}
        modalContentClassName="relative w-[70%] overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 w-full"
      >
        <div className="flex flex-col bg-gray-100">
          <div className="mt-3 max-w-full py-4 px-6">
            <div className="flex flex-row justify-between">
              <div>
                <h1 className=" text-left  text-xl font-bold leading-7 text-gray-700">
                  {showAddEditModal.id
                    ? `Edit CPT Revenue Crosswalk - ID#${showAddEditModal.id}`
                    : 'New CPT Revenue Crosswalk'}
                </h1>
              </div>
              <div className="">
                <CloseButton
                  onClick={() => {
                    setShowAddEditModal({ open: false });
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
                                selectedWorkedGroup?.groupsData.filter(
                                  (f) =>
                                    f.id ===
                                    selectedWorkedGroup?.groupsData[0]?.id
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
                              disabled={false}
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
                    </div>
                    <div className={'py-[15px] px-[5px]'}>
                      <div className={`h-[1px] w-full bg-gray-200`} />
                    </div>
                    <div className="mb-6 flex w-full  flex-col items-start">
                      <div className="px-[5px] pb-[15px]">
                        <p className="text-base font-bold leading-normal text-gray-700">
                          CPT Revenue Crosswalk Details
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
                                    ? (cptSearchData as SingleSelectDropDownDataType[])
                                    : []
                                }
                                selectedValue={
                                  cptSearchData?.filter(
                                    (a) => a.value === addEditJSON.cptCode
                                  )[0]
                                }
                                onSelect={(e) => {
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    cptCode: e?.value || '',
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
                              Revenue Code{' '}
                              <span className="text-cyan-500">*</span>
                            </label>
                            <div className="w-full">
                              <SingleSelectGridDropDown
                                placeholder=""
                                showSearchBar={true}
                                showDropdownIcon={false}
                                disabled={false}
                                data={
                                  revenueCodeModalData?.length !== 0
                                    ? (revenueCodeModalData as SingleSelectDropDownDataType[])
                                    : []
                                }
                                selectedValue={
                                  revenueCodeModalData?.filter(
                                    (a) => a.code === addEditJSON.revenueCode
                                  )[0]
                                }
                                onSelect={(e) => {
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    revenueCode:
                                      revenueCodeModalData?.filter(
                                        (a) => a.value === e?.value
                                      )[0]?.code || '',
                                  });
                                }}
                                onSearch={(value) => {
                                  setRevenueSearchValue(value);
                                }}
                                appendTextSeparator={'|'}
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
                  disabled={isSaveClicked}
                  buttonType={ButtonType.primary}
                  onClick={async () => {
                    setSaveClicked(true);
                    onSaveCPTRevenueCrosswalk();
                  }}
                >
                  {addEditJSON.cptRevenueCrossWalkID ? 'Save Changes' : 'Save'}
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
                        addEditJSON.cptRevenueCrossWalkID
                          ? 'editing'
                          : 'creating'
                      } this CPT Revenue Crosswalk.`,
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

export default CPTRevenueCrosswalk;
