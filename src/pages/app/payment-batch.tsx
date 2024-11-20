import type { GridColDef, GridColTypeDef } from '@mui/x-data-grid-pro';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Icon from '@/components/Icon';
import PageHeader from '@/components/PageHeader';
import SavedSearchCriteria from '@/components/PatientSearch/SavedSearchCriteria';
import AppDatePicker from '@/components/UI/AppDatePicker';
import Badge from '@/components/UI/Badge';
import Breadcrumbs from '@/components/UI/Breadcrumbs/breadcrumbs';
import Button, { ButtonType } from '@/components/UI/Button';
import InputField from '@/components/UI/InputField';
import SearchDetailGrid, {
  globalPaginationConfig,
} from '@/components/UI/SearchDetailGrid';
import type { SingleSelectDropDownDataType } from '@/components/UI/SingleSelectDropDown';
import SingleSelectDropDown from '@/components/UI/SingleSelectDropDown';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import AppLayout from '@/layouts/AppLayout';
import AddPaymentBatch from '@/screen/batch/addPaymentBatch';
import DetailPaymentBatch from '@/screen/batch/detailPaymentBatch';
import { getselectdWorkGroupsIDsSelector } from '@/store/chrome/selectors';
import {
  fetchAssignClaimToDataRequest,
  getLookupDropdownsRequest,
} from '@/store/shared/actions';
import {
  fetchBatchStatus,
  fetchInsuranceData,
  fetchPaymentBatchSearchData,
} from '@/store/shared/sagas';
import {
  getAllInsuranceDataSelector,
  getLookupDropdownsDataSelector,
} from '@/store/shared/selectors';
import {
  type AllInsuranceData,
  type GetPaymentBatchCriteria,
  type GetPaymentBatchResult,
  type GroupData,
} from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';

const PaymentBatch = () => {
  const dispatch = useDispatch();
  const lookupsData = useSelector(getLookupDropdownsDataSelector);
  const insuranceData = useSelector(getAllInsuranceDataSelector);
  const [insuranceAllData, setInsuanceAllData] = useState<AllInsuranceData[]>(
    []
  );
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  const usdPrice: GridColTypeDef = {
    type: 'number',
    width: 130,
    align: 'left',
    valueFormatter: ({ value }) => currencyFormatter.format(value),
    cellClassName: 'font-tabular-nums',
  };
  const [hideSearchParameters, setHideSearchParameters] =
    useState<boolean>(true);
  const selectedWorkedGroup = useSelector(getselectdWorkGroupsIDsSelector);
  const [groupDropdown, setGroupDropdown] = useState<GroupData[]>([]);
  const [batchStatusDropdown, setBatchStatusDropdown] = useState<
    SingleSelectDropDownDataType[]
  >([]);
  const [isChangedJson, setIsChangedJson] = useState(false);
  const [openAddUpdateModealInfo, setOpenAddUpdateModealInfo] = useState<{
    type: string;
    id?: number;
  }>();
  const [refreshDetailView, setRefreshDetailView] = useState<string>();
  useEffect(() => {
    if (refreshDetailView === 'refresh') {
      setRefreshDetailView(undefined);
    }
  }, [refreshDetailView]);
  const [statusModalInfo, setStatusModalInfo] = useState({
    show: false,
    heading: '',
    text: '',
    type: StatusModalType.WARNING,
  });
  const defaultSearchCriteria: GetPaymentBatchCriteria = {
    userID: '',
    fromPaymentDate: null,
    toPaymentDate: null,
    fromDepositDate: null,
    toDepositDate: null,
    fromPostingDate: null,
    toPostingDate: null,
    pageNumber: 1,
    pageSize: globalPaginationConfig.activePageSize,
    sortByColumn: '',
    sortOrder: '',
  };
  const [lastSearchCriteria, setLastSearchCriteria] = useState(
    defaultSearchCriteria
  );
  const [searchCriteria, setSearchCriteria] = useState(defaultSearchCriteria);
  const [searchResult, setSearchResult] = useState<GetPaymentBatchResult[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);

  const setSearchCriteriaFields = (value: GetPaymentBatchCriteria) => {
    setSearchCriteria(value);
    setIsChangedJson(true);
  };

  const getSearchData = async (obj: GetPaymentBatchCriteria) => {
    const res = await fetchPaymentBatchSearchData(obj);
    if (res) {
      setSearchResult(res);
      setTotalCount(res[0]?.total || 0);
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
    if (!isChangedJson) {
      setStatusModalInfo({
        ...statusModalInfo,
        show: true,
        heading: 'Alert',
        text: 'Please fill in at least one search parameter to perform a query.\nReview your input and try again.',
      });
      return;
    }
    const obj = {
      ...searchCriteria,
      sortColumn: '',
      sortOrder: '',
      pageNumber: 1,
    };
    setSearchCriteria(obj);
    getSearchData(obj);
  };

  const getBatchStatus = async () => {
    const res = await fetchBatchStatus();
    if (res) {
      setBatchStatusDropdown(res);
    }
  };

  const initProfile = () => {
    dispatch(getLookupDropdownsRequest());
    fetchInsuranceData();
    getBatchStatus();
  };
  useEffect(() => {
    initProfile();
  }, []);

  const handleInsuanceAllData = (groupID: number) => {
    setInsuanceAllData([...insuranceData.filter((m) => m.groupID === groupID)]);
  };

  useEffect(() => {
    setGroupDropdown(selectedWorkedGroup?.groupsData || []);
    if (selectedWorkedGroup?.groupsData[0]?.id)
      setSearchCriteriaFields({
        ...searchCriteria,
        groupID: selectedWorkedGroup?.groupsData[0]?.id,
      });
  }, [selectedWorkedGroup]);

  useEffect(() => {
    const groupId = searchCriteria?.groupID;
    if (groupId) {
      dispatch(fetchAssignClaimToDataRequest({ clientID: groupId }));
    }
  }, [searchCriteria?.groupID]);

  useEffect(() => {
    if (searchCriteria?.groupID) handleInsuanceAllData(searchCriteria?.groupID);
  }, [searchCriteria?.groupID, insuranceData]);

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'Batch ID',
      flex: 1,
      minWidth: 80,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            data-testid="paymentBatchID"
            className="cursor-pointer text-cyan-500"
            onClick={async () => {
              setOpenAddUpdateModealInfo({
                type: 'detail',
                id: params.row.batchID,
              });
            }}
          >
            {`#${params.row.batchID}`}
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
              {params.row.groupAddress ? `${params.row.groupAddress}` : ''}
            </div>
          </div>
        );
      },
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
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
      field: 'status',
      headerName: 'Status',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        const getIconColor = () => {
          if (params.row.statusColor === 'gray') {
            return IconColors.GRAY;
          }
          if (params.row.statusColor === 'red') {
            return IconColors.RED;
          }
          return IconColors.Yellow;
        };
        const statusColor = params.row.statusColor || 'yellow';
        return (
          <Badge
            text={params.value}
            cls={classNames(
              `rounded-[4px] bg-${statusColor}-50 text-${statusColor}-800`
            )}
            icon={<Icon name={'desktop'} color={getIconColor()} />}
          />
        );
      },
    },
    {
      field: 'paymentType',
      headerName: 'Pay. Type',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'paymentNumber',
      headerName: 'Pay. Number',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'paymentDate',
      headerName: 'Pay. Date',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'depositDate',
      headerName: 'Deposit Date',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'insuranceAmount',
      headerName: 'Ins. Amount',
      ...usdPrice,
      flex: 1,
      minWidth: 100,
      disableReorder: true,
    },
    {
      field: 'insurancePaid',
      headerName: 'Ins. Paid',
      ...usdPrice,
      flex: 1,
      minWidth: 100,
      disableReorder: true,
    },
    {
      field: 'insuranceWriteOff',
      headerName: 'Ins. Adj,',
      ...usdPrice,
      flex: 1,
      minWidth: 100,
      disableReorder: true,
    },
    {
      field: 'insuranceBalance',
      headerName: 'Ins. Bal.',
      flex: 1,
      minWidth: 100,
      disableReorder: true,
      renderCell: (params) => {
        const BalanceCardBackgroundColor = () => {
          if (params.value > 0) {
            return 'text-red-500';
          }
          if (params.value === 0) {
            return 'text-green-500';
          }
          return 'text-yellow-500';
        };

        return (
          <div className={BalanceCardBackgroundColor()}>
            {currencyFormatter.format(
              params.value * (params.value < 0 ? -1 : 1)
            )}
          </div>
        );
      },
    },
    {
      field: 'patientAmount',
      headerName: 'Pat. Amount',
      ...usdPrice,
      flex: 1,
      minWidth: 110,
      disableReorder: true,
    },
    {
      field: 'patientPaid',
      headerName: 'Pat. Paid',
      ...usdPrice,
      flex: 1,
      minWidth: 100,
      disableReorder: true,
    },
    {
      field: 'patientDiscount',
      headerName: 'Pat. Disc.',
      ...usdPrice,
      flex: 1,
      minWidth: 100,
      disableReorder: true,
    },
    {
      field: 'patientBalance',
      headerName: 'Pat. Bal.',
      ...usdPrice,
      flex: 1,
      minWidth: 100,
      disableReorder: true,
      renderCell: (params) => {
        const BalanceCardBackgroundColor = () => {
          if (params.value > 0) {
            return 'text-red-500';
          }
          if (params.value === 0) {
            return 'text-green-500';
          }
          return 'text-yellow-500';
        };

        return (
          <div className={BalanceCardBackgroundColor()}>
            {currencyFormatter.format(
              params.value * (params.value < 0 ? -1 : 1)
            )}
          </div>
        );
      },
    },
    {
      field: 'batchBalance',
      headerName: 'Batch Bal.',
      ...usdPrice,
      flex: 1,
      minWidth: 100,
      disableReorder: true,
      renderCell: (params) => {
        const BalanceCardBackgroundColor = () => {
          if (params.value > 0) {
            return 'text-red-500';
          }
          if (params.value === 0) {
            return 'text-green-500';
          }
          return 'text-yellow-500';
        };

        return (
          <div className={BalanceCardBackgroundColor()}>
            {currencyFormatter.format(
              params.value * (params.value < 0 ? -1 : 1)
            )}
          </div>
        );
      },
    },
  ];

  return (
    <AppLayout title="Nucleus - Payment Batch">
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
                          Payment Batch
                        </p>
                        <div>
                          <Button
                            cls={'h-[38px] truncate '}
                            buttonType={ButtonType.primary}
                            onClick={() => {
                              setOpenAddUpdateModealInfo({ type: 'create' });
                            }}
                          >
                            Create New Payment Batch
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
                      <div className="px-[5px] pb-[5px]">
                        <p className="text-base font-bold leading-normal text-gray-700">
                          Batch Details
                        </p>
                      </div>
                      <div className="flex w-full flex-wrap">
                        <div className={`lg:w-[24.75%] w-[50%] px-[5px]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Batch ID
                            </div>
                            <div data-testid="batch_id" className="w-full">
                              <InputField
                                placeholder="Batch ID"
                                value={searchCriteria?.batchID}
                                onChange={(evt) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    batchID: evt.target.value
                                      ? Number(evt.target.value)
                                      : undefined,
                                  });
                                }}
                                type={'number'}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={`lg:w-[24.75%] w-[50%] px-[5px]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Batch Status
                            </div>
                            <div data-testid="batchStatus" className="w-full">
                              <SingleSelectDropDown
                                placeholder="Select Batch Status"
                                disabled={false}
                                data={batchStatusDropdown}
                                selectedValue={
                                  batchStatusDropdown.filter(
                                    (f) => f.id === searchCriteria?.statusID
                                  )[0]
                                }
                                onSelect={(value) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    statusID: value.id,
                                  });
                                }}
                                isOptional={true}
                                onDeselectValue={() => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    statusID: undefined,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div
                          className={'hidden justify-center lg:flex lg:w-[1%]'}
                        >
                          <div className={`w-[1px] h-full bg-gray-200`} />
                        </div>
                        <div className={`lg:w-[18%] w-[50%] px-[5px]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Balance Amount Greater or Equal to
                            </div>
                            <div className="w-full">
                              <InputField
                                placeholder="-"
                                value={searchCriteria?.fromBalance}
                                onChange={(evt) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    fromBalance: evt.target.value
                                      ? Number(evt.target.value)
                                      : undefined,
                                  });
                                }}
                                type={'number'}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={`lg:w-[18%] w-[50%] px-[5px]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Balance Amount Less or Equal to
                            </div>
                            <div className="w-full">
                              <InputField
                                placeholder="-"
                                value={searchCriteria?.toBalance}
                                onChange={(evt) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    toBalance: evt.target.value
                                      ? Number(evt.target.value)
                                      : undefined,
                                  });
                                }}
                                type={'number'}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex w-full flex-wrap">
                        <div className={`lg:w-[24.75%] w-[50%] px-[5px]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Payment Number
                            </div>
                            <div data-testid="paymentNumber" className="w-full">
                              <InputField
                                placeholder="-"
                                value={searchCriteria?.paymentNumber}
                                onChange={(evt) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    paymentNumber: evt.target.value,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={`lg:w-[24.75%] w-[50%] px-[5px]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Payment Type
                            </div>
                            <div data-testid="paymentType" className="w-full">
                              <SingleSelectDropDown
                                placeholder="-"
                                showSearchBar={true}
                                disabled={false}
                                data={
                                  lookupsData?.method
                                    ? (lookupsData?.method as SingleSelectDropDownDataType[])
                                    : []
                                }
                                selectedValue={
                                  lookupsData?.method?.filter(
                                    (m) => m.id === searchCriteria.paymentTypeID
                                  )[0]
                                }
                                onSelect={(value) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    paymentTypeID: value.id,
                                  });
                                }}
                                isOptional={true}
                                onDeselectValue={() => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    paymentTypeID: undefined,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div
                          className={'hidden justify-center lg:flex lg:w-[1%]'}
                        >
                          <div className={`w-[1px] h-full bg-gray-200`} />
                        </div>
                        <div className={`lg:w-[24.25%] w-[50%] px-[5px] flex`}>
                          <div className={`w-[50%] pr-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Payment Date - From
                              </div>
                              <div className="w-full">
                                <AppDatePicker
                                  cls="!mt-1"
                                  selected={searchCriteria?.fromPaymentDate}
                                  onChange={(value) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      fromPaymentDate: value,
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className={`w-[50%] pl-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Payment Date - To
                              </div>
                              <div className="w-full">
                                <AppDatePicker
                                  cls="!mt-1"
                                  selected={searchCriteria?.toPaymentDate}
                                  onChange={(value) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      toPaymentDate: value,
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div
                          className={'hidden justify-center lg:flex lg:w-[1%]'}
                        >
                          <div className={`w-[1px] h-full bg-gray-200`} />
                        </div>
                        <div className={`lg:w-[24.25%] w-[50%] px-[5px] flex`}>
                          <div className={`w-[50%] pr-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Posting Date - From
                              </div>
                              <div className="w-full">
                                <AppDatePicker
                                  cls="!mt-1"
                                  selected={searchCriteria?.fromPostingDate}
                                  onChange={(value) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      fromPostingDate: value,
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className={`w-[50%] pl-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Posting Date - To
                              </div>
                              <div className="w-full">
                                <AppDatePicker
                                  cls="!mt-1"
                                  selected={searchCriteria?.toPostingDate}
                                  onChange={(value) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      toPostingDate: value,
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div
                          className={`lg:w-[24.25%] w-[50%] px-[5px] flex pt-2`}
                        >
                          <div className={`w-[50%] pr-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Deposit Date - From
                              </div>
                              <div className="w-full">
                                <AppDatePicker
                                  cls="!mt-1"
                                  selected={searchCriteria?.fromDepositDate}
                                  onChange={(value) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      fromDepositDate: value,
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className={`w-[50%] pl-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Deposit Date - To
                              </div>
                              <div className="w-full">
                                <AppDatePicker
                                  cls="!mt-1"
                                  selected={searchCriteria?.toDepositDate}
                                  onChange={(value) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      toDepositDate: value,
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={'py-[15px] px-[5px]'}>
                      <div className={`h-[1px] w-full bg-gray-200`} />
                    </div>
                    <div className="flex">
                      <div className="w-[50%] lg:w-[25%]">
                        <div className="px-[5px] pb-[5px]">
                          <p className="text-base font-bold leading-normal text-gray-700">
                            Location
                          </p>
                        </div>
                        <div className="flex w-full flex-wrap">
                          <div className={`w-[100%] px-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Group
                              </div>
                              <div className="w-full">
                                <SingleSelectDropDown
                                  placeholder="Search group"
                                  showSearchBar={true}
                                  disabled={false}
                                  data={
                                    groupDropdown as SingleSelectDropDownDataType[]
                                  }
                                  selectedValue={
                                    groupDropdown.filter(
                                      (f) => f.id === searchCriteria?.groupID
                                    )[0]
                                  }
                                  onSelect={(value) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      groupID: value.id,
                                      insuranceID: undefined,
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={'px-[15px]'}>
                        <div className={`w-[1px] h-full bg-gray-200`} />
                      </div>
                      <div className="w-[50%] lg:w-[25%]">
                        <div className="px-[5px] pb-[5px]">
                          <p className="text-base font-bold leading-normal text-gray-700">
                            Others
                          </p>
                        </div>
                        <div className="flex w-full flex-wrap">
                          <div className={`w-[100%] px-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Insurance
                              </div>
                              <div className="w-full">
                                <SingleSelectDropDown
                                  placeholder="-"
                                  showSearchBar={true}
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
                      rows={searchResult}
                      columns={columns}
                      persistLayoutId={8}
                      checkboxSelection={false}
                      onPageChange={(page: number) => {
                        const obj: GetPaymentBatchCriteria = {
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
                          const obj: GetPaymentBatchCriteria = {
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
                          const obj: GetPaymentBatchCriteria = {
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
      {openAddUpdateModealInfo?.type && (
        <>
          {['detail', 'updateFromDetail'].includes(
            openAddUpdateModealInfo.type
          ) && (
            <DetailPaymentBatch
              open={true}
              batchId={openAddUpdateModealInfo.id}
              refreshDetailView={refreshDetailView}
              onClose={() => {
                setOpenAddUpdateModealInfo(undefined);
              }}
              onEdit={() => {
                setOpenAddUpdateModealInfo({
                  ...openAddUpdateModealInfo,
                  type: 'updateFromDetail',
                });
              }}
            />
          )}
          {['create', 'updateFromDetail'].includes(
            openAddUpdateModealInfo.type
          ) && (
            <AddPaymentBatch
              open={true}
              batchId={openAddUpdateModealInfo.id}
              hideBackdrop={['updateFromDetail'].includes(
                openAddUpdateModealInfo.type
              )}
              onClose={(isAddedUpdated) => {
                // if is added or update, refresh listing data
                if (isAddedUpdated && isChangedJson) {
                  getSearchData(lastSearchCriteria);
                }
                // if 'id' present then open DetailPaymentBatch model
                // else close both modals
                if (openAddUpdateModealInfo?.id) {
                  if (isAddedUpdated) {
                    setRefreshDetailView('refresh');
                  }
                  setOpenAddUpdateModealInfo({
                    ...openAddUpdateModealInfo,
                    type: 'detail',
                  });
                } else {
                  setOpenAddUpdateModealInfo(undefined);
                }
              }}
            />
          )}
        </>
      )}
    </AppLayout>
  );
};

export default PaymentBatch;
