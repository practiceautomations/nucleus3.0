import type { GridColDef, GridColTypeDef } from '@mui/x-data-grid-pro';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Icon from '@/components/Icon';
import Tabs from '@/components/OrganizationSelector/Tabs';
import AppDatePicker from '@/components/UI/AppDatePicker';
import Badge from '@/components/UI/Badge';
import Button, { ButtonType } from '@/components/UI/Button';
import InputField from '@/components/UI/InputField';
import SearchDetailGrid, {
  globalPaginationConfig,
} from '@/components/UI/SearchDetailGrid';
import type { SingleSelectDropDownDataType } from '@/components/UI/SingleSelectDropDown';
import SingleSelectDropDown from '@/components/UI/SingleSelectDropDown';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import { getselectdWorkGroupsIDsSelector } from '@/store/chrome/selectors';
import {
  fetchAssignClaimToDataRequest,
  getArManagerOpenAtGlanceData,
  getLookupDropdownsRequest,
} from '@/store/shared/actions';
import {
  deleteERABatchByID,
  fetchgPaymentsERASearchData,
  fetchInsuranceData,
} from '@/store/shared/sagas';
import {
  getAllInsuranceDataSelector,
  getArManagerOpenAtGlanceSelector,
  getLookupDropdownsDataSelector,
} from '@/store/shared/selectors';
import type {
  AllInsuranceData,
  ArManagerOpenAtGlanceData,
  GetPaymentERACriteria,
  GroupData,
  PaymentsERADataResult,
  PaymentsStatusCount,
} from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';

import DetailPaymentERA from './DetailPaymentERA';

interface TabProps {
  id?: number;
  name: string;
  count?: number | undefined;
}

const PaymentERA = () => {
  const dispatch = useDispatch();

  const [tabs, setTabs] = useState<TabProps[]>([
    { name: 'All', count: 0 },
    { name: 'New', count: 0 },
    { name: 'Open', count: 0 },
    { name: 'Closed', count: 0 },
  ]);
  const [currentTab, setCurrentTab] = useState(tabs[0]);

  const [openAddUpdateModealInfo, setOpenAddUpdateModealInfo] = useState<{
    open: boolean;
    type?: string;
    id?: number;
  }>({ open: false });

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
    data?: any;
    confirmType?: string;
    okButtonText?: string;
    okButtonColor?: ButtonType;
  }>();
  const defaultSearchCriteria: GetPaymentERACriteria = {
    fromPaymentDate: null,
    toPaymentDate: null,
    fromDepositDate: null,
    toDepositDate: null,
    fromPostingDate: null,
    toPostingDate: null,
    pageNumber: 1,
    pageSize: globalPaginationConfig.activePageSize,
    sortColumn: '',
    sortOrder: '',
  };
  const [lastSearchCriteria, setLastSearchCriteria] = useState(
    defaultSearchCriteria
  );
  const [searchCriteria, setSearchCriteria] = useState(defaultSearchCriteria);
  const [searchResult, setSearchResult] = useState<PaymentsERADataResult[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);

  const setSearchCriteriaFields = (value: GetPaymentERACriteria) => {
    setSearchCriteria(value);
    setIsChangedJson(true);
  };

  const handleTabStats = (result: PaymentsStatusCount[], totalSum?: number) => {
    if (result.length) {
      const res = result.map((d) => {
        return { id: d.statusID, name: d.status, count: d.total };
      });
      const allTotalCount = tabs.filter((f) => f.name === 'All')[0]?.count;
      setTabs([
        {
          name: 'All',
          count: totalSum !== undefined ? totalSum : allTotalCount,
        },
        ...res,
      ]);
    }
  };

  const getSearchData = async (obj: GetPaymentERACriteria) => {
    const res = await fetchgPaymentsERASearchData(obj);
    if (res) {
      setSearchResult(res.eraPaymentData);
      setTotalCount(res.eraPaymentData[0]?.total || 0);
      handleTabStats(
        res.eraPaymentStats,
        obj.statusID ? undefined : res.eraPaymentData[0]?.total || 0
      );
      setLastSearchCriteria({ ...obj });
    } else {
      setStatusModalInfo({
        show: true,
        heading: 'Error',
        type: StatusModalType.ERROR,
        text: 'A system error occurred while searching for results.\nPlease try again.',
        showCloseButton: false,
      });
    }
  };
  const arManagernavigationSelectorData = useSelector(
    getArManagerOpenAtGlanceSelector
  );
  const [arManagernavigationData, setArManagernavigationData] =
    useState<ArManagerOpenAtGlanceData | null>(null);
  useEffect(() => {
    if (arManagernavigationSelectorData) {
      setArManagernavigationData(arManagernavigationSelectorData);
    }
  }, [arManagernavigationSelectorData]);

  useEffect(() => {
    if (arManagernavigationData?.tabValue === 'OpenEras') {
      if (!isChangedJson) {
        setStatusModalInfo({
          show: true,
          heading: 'Alert',
          showCloseButton: false,
          text: 'Please fill in at least one search parameter to perform a query.\nReview your input and try again.',
          type: StatusModalType.WARNING,
        });
        return;
      }
      const obj = {
        ...searchCriteria,
        statusID: 2,
        sortColumn: '',
        sortOrder: '',
        pageNumber: 1,
      };
      setSearchCriteria(obj);
      getSearchData(obj);
      setCurrentTab(tabs[2]);
      setArManagernavigationData(null);
      dispatch(getArManagerOpenAtGlanceData(null));
    }
  }, [arManagernavigationData]);
  const deleteERABatch = async (id: number) => {
    const res = await deleteERABatchByID(id);
    if (res && res?.pkid === 1) {
      getSearchData(lastSearchCriteria);
    } else if (res && res?.pkid === 2) {
      setStatusModalInfo({
        show: true,
        heading: 'Error',
        type: StatusModalType.ERROR,
        showCloseButton: false,
        text: 'Cannot delete ERA Check (already posted). Please contact Support.',
      });
    } else {
      setStatusModalInfo({
        show: true,
        heading: 'Error',
        type: StatusModalType.ERROR,
        showCloseButton: false,
        text: 'A system error prevented the ERA to be deleted.\nPlease try again.',
      });
    }
  };

  // Search bar
  const onClickSearch = async () => {
    if (!isChangedJson) {
      setStatusModalInfo({
        show: true,
        heading: 'Alert',
        type: StatusModalType.WARNING,
        text: 'Please fill in at least one search parameter to perform a query.\nReview your input and try again.',
        showCloseButton: false,
      });
      return;
    }
    if (!arManagernavigationData) {
      const obj = {
        ...searchCriteria,
        statusID: undefined,
        sortColumn: '',
        sortOrder: '',
        pageNumber: 1,
      };
      setSearchCriteria(obj);
      getSearchData(obj);
      setCurrentTab(tabs[0]);
    }
  };

  const onChangeTabStatus = (tab: any) => {
    setCurrentTab(tab);
    if (tabs[0]?.count && tabs[0]?.count > 0) {
      const obj = {
        ...lastSearchCriteria,
        statusID: tab.id,
        sortColumn: '',
        sortOrder: '',
        pageNumber: 1,
      };
      setLastSearchCriteria({ ...obj });
      if (tab?.count > 0) {
        setSearchCriteria({ ...obj });
        getSearchData(obj);
      } else if (tab?.count === 0) {
        setSearchResult([]);
        setTotalCount(0);
      }
    }
  };

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
      headerName: 'ERA ID',
      flex: 1,
      minWidth: 80,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-cyan-500 underline"
            onClick={async () => {
              setOpenAddUpdateModealInfo({
                open: true,
                type: 'detail',
                id: params.row.eraID,
              });
            }}
          >
            {`#${params.row.eraID}`}
          </div>
        );
      },
    },
    {
      field: 'insurance',
      headerName: 'Insurance Name',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-cyan-500 underline"
              onClick={() => {}}
            >
              {params.value}
            </div>
          </div>
        );
      },
    },
    {
      field: 'eraStatus',
      headerName: 'EOB Status',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        const getIconColor = () => {
          if (params.row.eraStatusColor === 'gray') {
            return IconColors.GRAY;
          }
          if (params.row.eraStatusColor === 'red') {
            return IconColors.RED;
          }
          return IconColors.Yellow;
        };
        const statusColor = params.row.eraStatusColor || 'yellow';
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
      field: 'eraAmount',
      headerName: 'ERA Amount',
      ...usdPrice,
      flex: 1,
      minWidth: 120,
      disableReorder: true,
    },
    {
      field: 'eraBalance',
      headerName: 'ERA Bal.',
      ...usdPrice,
      flex: 1,
      minWidth: 120,
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
      field: 'payeeName',
      headerName: 'Payee Name',
      flex: 1,
      minWidth: 180,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-cyan-500 underline"
              onClick={() => {}}
            >
              {params.value}
            </div>
            <div className="text-xs font-normal leading-4">
              {params.row.payeeNPI ? `NPI: ${params.row.payeeNPI}` : ''}
            </div>
          </div>
        );
      },
    },
    {
      field: 'action',
      headerName: 'Actions',
      flex: 1,
      minWidth: 200,
      hideSortIcons: true,
      disableReorder: true,
      cellClassName: '!bg-cyan-50 PinnedColumLeftBorder',
      headerClassName: '!bg-cyan-100 !text-center PinnedColumLeftBorder',
      renderCell: (params) => {
        return (
          <div className="flex flex-row gap-2">
            <Button
              buttonType={ButtonType.primary}
              cls={`!w-[114px] !h-[30px] pl-[9px] pr-[11px] py-[7px] inline-flex px-4 py-2 gap-2 leading-5 bg-cyan-500 !rounded`}
              onClick={() => {
                setOpenAddUpdateModealInfo({
                  open: true,
                  type: 'detail',
                  id: params.row.eraID,
                });
              }}
            >
              <div className="flex h-4 w-4 items-center justify-center px-[0.37px] py-[2.40px]">
                <Icon name={'eyeWhite'} size={18} />
              </div>
              <div className="min-w-[70px] text-xs font-medium leading-none text-white">
                View Details
              </div>
            </Button>
            <Button
              buttonType={ButtonType.secondary}
              cls={`h-[30px] w-[30px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
              onClick={() => {
                setStatusModalInfo({
                  show: true,
                  heading: 'Delete ERA Confirmation',
                  text: `Deleting an ERA will permanently remove it from the system. Are you sure you want to proceed with this action?`,
                  type: StatusModalType.ERROR,
                  showCloseButton: true,
                  okButtonText: 'Yes, Delete ERA',
                  okButtonColor: ButtonType.tertiary,
                  confirmType: 'deleteConfirmation',
                  data: params.row.eraID,
                });
              }}
              disabled={params.row.deleteDisable}
            >
              <Icon name={'trash'} size={18} />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <div className="m-0 h-full w-full overflow-y-auto bg-gray-100 p-0">
        <div className={'bg-gray-50 px-[25px] pb-[25px]'}>
          {hideSearchParameters && (
            <div className="pt-[20px]">
              <div className="w-full">
                <div className="px-[5px] pb-[5px]">
                  <p className="text-base font-bold leading-normal text-gray-700">
                    Payment Details
                  </p>
                </div>
                <div className="flex w-full flex-wrap">
                  <div className={`lg:w-[24.75%] w-[50%] px-[5px]`}>
                    <div className={`w-full items-start self-stretch`}>
                      <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                        ERA ID Number
                      </div>
                      <div className="w-full">
                        <InputField
                          placeholder="ERA ID Number"
                          value={searchCriteria?.eraCheckID}
                          onChange={(evt) => {
                            setSearchCriteriaFields({
                              ...searchCriteria,
                              eraCheckID: evt.target.value
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
                        Payment Number
                      </div>
                      <div className="w-full">
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
                      <div className="w-full">
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
                </div>
                <div className="mt-2 flex w-full flex-wrap">
                  <div className={`lg:w-[30%] w-[50%] px-[5px] flex`}>
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
                  <div className={'hidden justify-center lg:flex lg:w-[1%]'}>
                    <div className={`w-[1px] h-full bg-gray-200`} />
                  </div>
                  <div className={`lg:w-[30%] w-[50%] px-[5px] flex`}>
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
                  <div className={'hidden justify-center lg:flex lg:w-[1%]'}>
                    <div className={`w-[1px] h-full bg-gray-200`} />
                  </div>
                  <div className={`lg:w-[30%] w-[50%] px-[5px] flex`}>
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
                                insurance: undefined,
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
                                insurance: value.value,
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
          <div className="col-span-2 w-full">
            <p className="text-xl font-bold leading-7 text-gray-700">Results</p>
            <Tabs
              tabs={tabs}
              onChangeTab={(tab: any) => {
                onChangeTabStatus(tab);
              }}
              currentTab={currentTab}
            />
          </div>
          <div className="flex w-full flex-col">
            <div className="h-full">
              <SearchDetailGrid
                pageNumber={lastSearchCriteria.pageNumber}
                pageSize={lastSearchCriteria.pageSize}
                totalCount={totalCount}
                rows={searchResult}
                persistLayoutId={35}
                columns={columns}
                checkboxSelection={false}
                onPageChange={(page: number) => {
                  const obj: GetPaymentERACriteria = {
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
                  if (field === 'action') return;
                  if (searchResult.length) {
                    const obj: GetPaymentERACriteria = {
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
                    const obj: GetPaymentERACriteria = {
                      ...lastSearchCriteria,
                      pageSize,
                      pageNumber: page,
                    };
                    setLastSearchCriteria(obj);
                    getSearchData(obj);
                  }
                }}
                pinnedColumns={{
                  right: ['action'],
                }}
              />
            </div>
          </div>
        </div>
      </div>
      {!!statusModalInfo && (
        <StatusModal
          open={statusModalInfo.show}
          heading={statusModalInfo.heading}
          description={statusModalInfo.text}
          okButtonText={statusModalInfo.okButtonText}
          okButtonColor={statusModalInfo.okButtonColor}
          statusModalType={statusModalInfo.type}
          showCloseButton={statusModalInfo.showCloseButton}
          closeOnClickOutside={true}
          onChange={() => {
            if (
              statusModalInfo.confirmType === 'deleteConfirmation' &&
              statusModalInfo.data
            ) {
              deleteERABatch(statusModalInfo.data);
            }
            setStatusModalInfo(undefined);
          }}
          onClose={() => {
            setStatusModalInfo(undefined);
          }}
        />
      )}
      {openAddUpdateModealInfo.open && openAddUpdateModealInfo.id && (
        <>
          <DetailPaymentERA
            open={openAddUpdateModealInfo.open}
            eraId={openAddUpdateModealInfo.id}
            onClose={() => {
              setOpenAddUpdateModealInfo({ open: false });
            }}
          />
        </>
      )}
    </div>
  );
};

export default PaymentERA;
