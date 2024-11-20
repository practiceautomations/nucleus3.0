import type { GridColDef } from '@mui/x-data-grid-pro';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import Icon from '@/components/Icon';
import PageHeader from '@/components/PageHeader';
import SavedSearchCriteria from '@/components/PatientSearch/SavedSearchCriteria';
import AppDatePicker from '@/components/UI/AppDatePicker';
import Breadcrumbs from '@/components/UI/Breadcrumbs/breadcrumbs';
import Button, { ButtonType } from '@/components/UI/Button';
import CloseButton from '@/components/UI/CloseButton';
import InputField from '@/components/UI/InputField';
import Modal from '@/components/UI/Modal';
import RadioButton from '@/components/UI/RadioButton';
import SearchDetailGrid, {
  globalPaginationConfig,
} from '@/components/UI/SearchDetailGrid';
import SingleSelectDropDown from '@/components/UI/SingleSelectDropDown';
import type { StatusModalProps } from '@/components/UI/StatusModal';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import AppLayout from '@/layouts/AppLayout';
import AddPaymentBatch from '@/screen/batch/addPaymentBatch';
import DetailPaymentBatch from '@/screen/batch/detailPaymentBatch';
import { getselectdWorkGroupsIDsSelector } from '@/store/chrome/selectors';
import { fetchPracticeDataRequest } from '@/store/shared/actions';
import {
  fetchPaymentReconciliationLedgerData,
  fetchPostingDate,
  fetchReconciliationSearchData,
  saveReconcilePayment,
} from '@/store/shared/sagas';
import { getPracticeDataSelector } from '@/store/shared/selectors';
import type {
  GetPaymentReconcilationLedgerCriteria,
  ReconcilePayment,
} from '@/store/shared/types';
import {
  type GetReconciledSearchAPIResult,
  type GroupData,
  type PracticeData,
  type ReconciliationCriteria,
} from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';
import { DateToStringPipe } from '@/utils/dateConversionPipes';

const PaymentReconciliation = () => {
  const practiceData = useSelector(getPracticeDataSelector);
  const dispatch = useDispatch();
  const [hideSearchParameters, setHideSearchParameters] =
    useState<boolean>(true);
  const selectedWorkedGroup = useSelector(getselectdWorkGroupsIDsSelector);
  const [groupDropdown, setGroupDropdown] = useState<GroupData[]>([]);
  const [practiceDropdown, setPracticeDropdown] = useState<PracticeData[]>([]);
  const [isChangedJson, setIsChangedJson] = useState(false);
  const [reconcileModal, setReconcileModal] = useState(false);
  const [paymentBatchID, setPaymentBatchID] = useState('');
  const [refreshDetailView, setRefreshDetailView] = useState<string>();
  const [openAddUpdateModealInfo, setOpenAddUpdateModealInfo] = useState<{
    type: string;
    id?: number;
  }>();
  const [reconcilePaymentPopUp, setReconcilePaymentPopUp] =
    useState<ReconcilePayment>({
      ledgerID: '',
      paymentNumber: '',
      postingDate: '',
      depositDate: '',
      reconsile: '',
    });
  const [statusModalInfo, setStatusModalInfo] = useState({
    show: false,
    heading: '',
    text: '',
    type: StatusModalType.WARNING,
  });
  const [reconcileModalStatusInfo, setReconcileModalStatusInfo] =
    useState<StatusModalProps>({
      open: false,
      heading: '',
      description: '',
      okButtonText: 'Ok',
      statusModalType: StatusModalType.ERROR,
      showCloseButton: false,
      closeOnClickOutside: false,
    });
  const defaultSearchCriteria: ReconciliationCriteria = {
    groupID: 0,
    pageNumber: 1,
    pageSize: globalPaginationConfig.activePageSize,
    batchID: undefined,
    getAllData: false,
    paymentNumber: '',
    postingType: '',
    sortByColumn: '',
    sortOrder: '',
    getOnlyIDS: false,
  };
  const [lastSearchCriteria, setLastSearchCriteria] = useState(
    defaultSearchCriteria
  );
  const [searchCriteria, setSearchCriteria] = useState(defaultSearchCriteria);
  const [includePaymentCheck, setIncludePaymentCheck] = useState('');
  const [reconciledPaymentCheck, setReconciledPaymentCheck] = useState('N');
  const [renderSearchCriteriaView, setRenderSearchCriteriaView] = useState(
    uuidv4()
  );
  const [searchResult, setSearchResult] = useState<
    GetReconciledSearchAPIResult[]
  >([]);
  const [totalCount, setTotalCount] = useState<number>(0);

  const setSearchCriteriaFields = (value: ReconciliationCriteria) => {
    setSearchCriteria(value);
    setIsChangedJson(true);
  };

  const handlePostingDateChange = (date: any) => {
    setReconcilePaymentPopUp({
      ...reconcilePaymentPopUp,
      postingDate: DateToStringPipe(date, 1),
    });
  };

  const handleDepositDateChange = (date: any) => {
    setReconcilePaymentPopUp({
      ...reconcilePaymentPopUp,
      depositDate: DateToStringPipe(date, 1),
    });
  };

  const getSearchData = async (obj: ReconciliationCriteria) => {
    const res = await fetchReconciliationSearchData(obj);
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
  // const postingDateCriteria: PostingDateCriteria = {
  //   id: parseInt(reconcilePaymentPopUp.ledgerID, 10),
  //   type: 'ledger',
  //   postingDate: DateToStringPipe(reconcilePaymentPopUp.postingDate, 1),
  // };
  // Search bar
  const onClickSearch = async () => {
    if (reconciledPaymentCheck === 'Y') {
      searchCriteria.isReconsiled = true;
    }
    if (reconciledPaymentCheck === 'N') {
      searchCriteria.isReconsiled = false;
    }
    if (reconciledPaymentCheck === 'A') {
      searchCriteria.isReconsiled = null;
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

  const onClickPaymentReconcile = async (params: any) => {
    const obj: GetPaymentReconcilationLedgerCriteria = {
      groupID: params.row.group ? params.row.groupID : searchCriteria.groupID,
      practiceID: params.row.practiceID
        ? params.row.practiceID
        : searchCriteria.practiceID,
      postingType: params.row.payerType
        ? params.row.payerType
        : searchCriteria.postingType,
      paymentNumber: params.row.paymentNumber
        ? params.row.paymentNumber
        : searchCriteria.paymentNumber,
      batchID: params.row.batchID ? params.row.batchID : searchCriteria.batchID,
      isReconsiled: params.row.reconsiled
        ? params.row.reconsiled
        : searchCriteria.isReconsiled,
      fromPaymentDate: searchCriteria.fromPaymentDate
        ? searchCriteria.fromPaymentDate
        : undefined,
      toPaymentDate: searchCriteria.toPaymentDate
        ? searchCriteria.toPaymentDate
        : undefined,
      fromDepositDate: searchCriteria.fromDepositDate
        ? searchCriteria.fromDepositDate
        : undefined,
      toDepositDate: searchCriteria.toDepositDate
        ? searchCriteria.toDepositDate
        : undefined,
      fromCreatedDate: searchCriteria.fromCreatedDate
        ? searchCriteria.fromCreatedDate
        : undefined,
      toCreatedDate: searchCriteria.toCreatedDate
        ? searchCriteria.toCreatedDate
        : undefined,
    };

    const res = await fetchPaymentReconciliationLedgerData(obj);
    let commaSeparatedLedgerIds = '';
    if (res) {
      commaSeparatedLedgerIds = res.map((a) => a.ledgerID).join(',');
    }
    setReconcilePaymentPopUp({
      ...reconcilePaymentPopUp,
      paymentNumber: params.row.paymentNumber,
      postingDate: params.row.postingDate,
      depositDate: params.row.depositDate,
      reconsile: params.row.reconsiled,
      ledgerID: commaSeparatedLedgerIds,
    });
    setPaymentBatchID(params.row.batchID);
    setReconcileModal(true);
  };

  const columns: GridColDef[] = [
    {
      field: 'group',
      headerName: 'Group',
      flex: 1,
      minWidth: 240,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-cyan-500 underline"
              onClick={() => {}}
            >
              {params.value || ''}
            </div>
            {params.row.practiceAddress}
          </div>
        );
      },
    },
    {
      field: 'practice',
      headerName: 'Practice',
      flex: 1,
      minWidth: 200,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-cyan-500 underline"
              onClick={() => {}}
            >
              {params.value || ''}
            </div>
            {params.row.practiceAddress}
          </div>
        );
      },
    },
    {
      field: 'payerType',
      headerName: 'Payer Type',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'batchID',
      headerName: 'Pay. Batch ID',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            data-testid="paymentBatchID"
            className="cursor-pointer text-cyan-500 underline"
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
      field: 'paymentNumber',
      headerName: 'Pay. Number',
      flex: 1,
      minWidth: 220,
      disableReorder: true,
    },
    {
      field: 'paymentAmount',
      headerName: 'Pay. Amount',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return <div className="flex flex-col">${params.value}</div>;
      },
    },
    {
      field: 'paymentDate',
      headerName: 'Pay. Date',
      flex: 1,
      minWidth: 140,
      disableReorder: true,
    },
    {
      field: 'postingDate',
      headerName: 'Post Date',
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
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 240,
      disableReorder: true,
      headerClassName: '!bg-cyan-100 !text-center ',
      cellClassName: '!bg-cyan-50',
      renderCell: (params) => {
        return (
          <Button
            buttonType={ButtonType.primary}
            fullWidth={true}
            cls={
              'ml-[8px] w-[185px] h-[38px] inline-flex !justify-center gap-2 leading-loose '
            }
            style={{ verticalAlign: 'middle' }}
            onClick={() => {
              onClickPaymentReconcile(params);
            }}
          >
            <Icon name={'reconcile'} size={20} />
            <p
              data-testid="paymentReconcileBtn"
              className="text-justify text-sm"
            >
              Reconcile Payment
            </p>
          </Button>
        );
      },
    },
  ];

  useEffect(() => {
    setGroupDropdown(selectedWorkedGroup?.groupsData || []);
    setSearchCriteria({
      ...searchCriteria,
      groupID: selectedWorkedGroup?.groupsData[0]?.id || 0,
    });
  }, [selectedWorkedGroup]);

  useEffect(() => {
    const groupId = searchCriteria?.groupID;
    if (groupId) {
      setPracticeDropdown([]);
      dispatch(fetchPracticeDataRequest({ groupID: groupId }));
    }
  }, [searchCriteria?.groupID]);
  useEffect(() => {
    setPracticeDropdown(practiceData || []);
  }, [practiceData]);

  return (
    <AppLayout title="Nucleus - Payment Reconcilation">
      <div className="relative m-0 h-full bg-gray-100 p-0">
        <div className="m-0 h-full w-full overflow-y-scroll bg-gray-100 p-0">
          <div className="flex w-full flex-col">
            <div className="m-0 h-full w-full overflow-y-auto overflow-x-hidden bg-gray-100 p-0">
              <div className="h-[125px] w-full">
                <div className="absolute top-0 z-[11] w-full">
                  <Breadcrumbs />
                  <PageHeader>
                    <div className="flex h-[90px] items-start justify-between !bg-white  px-7 pt-8">
                      <div className="flex h-[38px] gap-6">
                        <p className="self-center text-3xl font-bold text-cyan-700">
                          Payment Reconciliation
                        </p>
                      </div>
                    </div>
                  </PageHeader>
                </div>
              </div>
              <div className={'bg-gray-50 px-[25px] pb-[20px]'}>
                <div className="flex items-center py-[20px] px-[5px] pb-4">
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
                          setRenderSearchCriteriaView(uuidv4());
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
                  <div key={renderSearchCriteriaView} className="pt-[20px]">
                    <div className="flex">
                      <div className="w-[50%] lg:w-[25%]">
                        <div className="px-[5px] pb-[5px]">
                          <p className="text-base font-bold leading-normal text-gray-700">
                            Location
                          </p>
                        </div>
                        <div className="flex w-full flex-wrap">
                          <div className={`w-[100%] px-[5px]`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Group
                            </div>
                            <div className="w-full">
                              <SingleSelectDropDown
                                placeholder="-"
                                disabled={false}
                                data={groupDropdown}
                                selectedValue={
                                  groupDropdown.filter(
                                    (f) => f.id === searchCriteria?.groupID
                                  )[0]
                                }
                                onSelect={(e) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    groupID: e.id,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={'px-[3px]'}>
                        <div className={`w-[1px]  bg-gray-200`} />
                      </div>
                      <div className="w-[50%] lg:w-[25%]">
                        <div className="mb-6 px-[5px] pb-[5px]"></div>
                        <div className="flex w-full flex-wrap">
                          <div className={`w-[100%] px-[5px]`}>
                            <div
                              className={`w-full items-start self-stretch pb-[15px]`}
                            >
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Practice
                              </div>
                              <div className="w-full">
                                <SingleSelectDropDown
                                  placeholder="-"
                                  disabled={false}
                                  isOptional={true}
                                  onDeselectValue={() => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      practiceID: undefined,
                                    });
                                  }}
                                  data={practiceDropdown}
                                  selectedValue={
                                    practiceDropdown.filter(
                                      (a) => a.id === searchCriteria.practiceID
                                    )[0]
                                  }
                                  onSelect={(value) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      practiceID: value.id,
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={'py-[15px] px-[5px] pt-0 pb-5 '}>
                      <div className={`h-[1px] w-full bg-gray-200`} />
                    </div>
                    <div className="w-full">
                      <div className="px-[5px] pb-[5px]">
                        <p className="text-base font-bold leading-normal text-gray-700">
                          Payment Details
                        </p>
                      </div>
                      <div className="mt-2 flex w-full flex-wrap">
                        <div className={`lg:w-[25%] w-[50%] px-[5px] mr-3`}>
                          <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                            Payment Batch ID Number
                          </div>
                          <div className="w-full">
                            <InputField
                              placeholder="Payment Batch ID Number"
                              value={searchCriteria?.batchID}
                              onChange={(evt) => {
                                setSearchCriteriaFields({
                                  ...searchCriteria,
                                  batchID: evt.target.value
                                    ? Number(evt.target.value)
                                    : undefined,
                                });
                              }}
                            />
                          </div>
                        </div>
                        <div className={`w-[18%] pr-[5px] mr-[7px]`}>
                          <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                            Pay. Batch Creat. Date - From
                          </div>
                          <div className="w-full">
                            <AppDatePicker
                              cls="!mt-1"
                              selected={searchCriteria?.fromCreatedDate}
                              onChange={(value) => {
                                setSearchCriteriaFields({
                                  ...searchCriteria,
                                  fromCreatedDate: value,
                                });
                              }}
                            />
                          </div>
                        </div>
                        <div className={`w-[18%] pl-[5px] mr-[10px]`}>
                          <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                            Pay. Batch Creat. Date - To
                          </div>
                          <div className="w-full">
                            <AppDatePicker
                              cls="!mt-1"
                              selected={searchCriteria?.toCreatedDate}
                              onChange={(value) => {
                                setSearchCriteriaFields({
                                  ...searchCriteria,
                                  toCreatedDate: value,
                                });
                              }}
                            />
                          </div>
                        </div>
                        <div className={`lg:w-[22%] w-[50%] px-[5px]`}>
                          <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                            Payment Number
                          </div>
                          <div className="w-full">
                            <InputField
                              placeholder="Payment Number"
                              value={searchCriteria.paymentNumber}
                              onChange={(e) => {
                                setSearchCriteriaFields({
                                  ...searchCriteria,
                                  paymentNumber: e.target.value,
                                });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex w-full flex-wrap">
                        <div className={`lg:w-[30%] w-[50%] px-[5px] flex`}>
                          <div className={`w-[50%] pr-[5px] mr-[6px]`}>
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
                          <div className={`w-[50%] pl-[5px] mr-1`}>
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
                        <div
                          className={'hidden justify-center lg:flex lg:w-[1%]'}
                        >
                          <div className={`w-[1px] h-full bg-gray-200`} />
                        </div>
                        <div className={`lg:w-[30%] w-[50%] px-[5px] flex`}>
                          <div className={`w-[50%] pr-[5px] mr-[6px] ml-1`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Post Date - From
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
                          <div className={`w-[50%] pl-[5px] mr-1`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Post Date - To
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
                        <div
                          className={'hidden justify-center lg:flex lg:w-[1%]'}
                        >
                          <div className={`w-[1px] h-full bg-gray-200`} />
                        </div>
                        <div className={`lg:w-[30%] w-[50%] px-[5px] flex`}>
                          <div className={`w-[50%] pr-[5px] mr-[6px] ml-1`}>
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
                          <div className={`w-[50%] pl-[5px]`}>
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
                    <div className="mt-2 flex">
                      <div
                        className={`relative w-[250px] h-[62px] top-[4px] ml-1`}
                      >
                        <label className="text-sm font-medium leading-tight text-gray-700">
                          Include Payments From
                        </label>
                        <div className="mt-3">
                          <RadioButton
                            data={[
                              { value: 'Insurance', label: 'Insurance' },
                              { value: 'Patient', label: 'Patient' },
                              { value: '', label: 'Both' },
                            ]}
                            checkedValue={includePaymentCheck}
                            onChange={(e) => {
                              setIncludePaymentCheck(
                                (searchCriteria.postingType = e.target.value)
                              );
                            }}
                          />
                        </div>
                      </div>
                      <div
                        className={
                          'mt-[7px] hidden justify-center lg:flex lg:w-[1%]'
                        }
                      >
                        <div className={`w-[1px] h-16 bg-gray-200`} />
                      </div>
                      <div
                        className={`relative w-[250px] h-[62px] top-[4px] ml-3`}
                      >
                        <label className="text-sm font-medium leading-tight text-gray-700">
                          Show Reconciled Payments
                        </label>
                        <div className="mt-3">
                          <RadioButton
                            data={[
                              { value: 'Y', label: 'Yes' },
                              { value: 'N', label: 'No' },
                              { value: 'A', label: 'All' },
                            ]}
                            checkedValue={reconciledPaymentCheck}
                            onChange={(e) => {
                              setReconciledPaymentCheck(e.target.value);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex h-20 items-start justify-between gap-4 bg-gray-200 px-7 pt-[25px] pb-[15px]">
                <div className="flex w-full items-center justify-between">
                  <div className="flex w-[50%] items-center justify-start">
                    <Button
                      cls={
                        'h-[33px] inline-flex items-center justify-center w-56 py-2 bg-cyan-500 shadow rounded-md'
                      }
                      buttonType={ButtonType.primary}
                      onClick={onClickSearch}
                    >
                      <p
                        data-testid="searchPayment"
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

              <div className="flex w-full w-full flex-col gap-4 p-5 pt-[20px]">
                <div className="h-full">
                  <SearchDetailGrid
                    pageNumber={lastSearchCriteria.pageNumber}
                    pageSize={lastSearchCriteria.pageSize}
                    pinnedColumns={{
                      right: ['actions'],
                    }}
                    persistLayoutId={13}
                    totalCount={totalCount}
                    rows={searchResult || []}
                    columns={columns}
                    checkboxSelection={false}
                    onPageChange={(page: number) => {
                      const obj: ReconciliationCriteria = {
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
                        const obj: ReconciliationCriteria = {
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
                        const obj: ReconciliationCriteria = {
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
            <Modal
              open={reconcileModal}
              onClose={() => {}}
              modalContentClassName="relative w-[65%] overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 w-full"
            >
              <div className="flex flex-col bg-gray-100">
                <div className="mt-3 max-w-full p-4">
                  <div className="flex flex-row justify-between">
                    <div>
                      <h1 className=" ml-2  text-left text-xl font-bold leading-7 text-gray-700">
                        Reconcile Payment ID #{paymentBatchID}
                      </h1>
                    </div>
                    <div className="">
                      <CloseButton
                        onClick={() => {
                          setReconcileModal(false);
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
                            Payment Number
                            <span style={{ color: '#007BFF' }}>*</span>
                          </label>
                          <div
                            data-testid="paymentReconsilationPaymentNumber"
                            className="h-[38px] w-full"
                          >
                            <InputField
                              placeholder="Payment Number"
                              disabled={false}
                              value={reconcilePaymentPopUp.paymentNumber}
                              onChange={(e) => {
                                setReconcilePaymentPopUp({
                                  ...reconcilePaymentPopUp,
                                  paymentNumber: e.target.value,
                                });
                              }}
                            />
                          </div>
                        </div>
                        <div className="ml-3 flex w-[25%] shrink flex-col items-start gap-1 text-left">
                          <div className=" inline-flex items-start justify-start space-x-1">
                            <label className="text-sm font-medium leading-5 text-gray-900">
                              Posting Date
                              <span style={{ color: '#007BFF' }}>*</span>
                            </label>
                            <Icon name="questionMarkcircle" size={20} />
                          </div>
                          <div className="datePickerInModal w-full">
                            <AppDatePicker
                              testId="reconcilePaymentPostingDate"
                              cls="!mt-1"
                              selected={reconcilePaymentPopUp.postingDate}
                              onChange={handlePostingDateChange}
                            />
                          </div>
                        </div>
                        <div className="ml-3 flex w-[25%] shrink flex-col items-start gap-1 text-left">
                          <div className=" inline-flex items-start justify-start space-x-1">
                            <label className="text-sm font-medium leading-5 text-gray-900">
                              Deposit Date
                              <span style={{ color: '#007BFF' }}>*</span>
                            </label>
                            <Icon name="questionMarkcircle" size={20} />
                          </div>
                          <div className="datePickerInModal w-full">
                            <AppDatePicker
                              cls="!mt-1"
                              selected={reconcilePaymentPopUp.depositDate}
                              onChange={handleDepositDateChange}
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
                        onClick={async () => {
                          if (
                            reconcilePaymentPopUp.paymentNumber &&
                            reconcilePaymentPopUp.postingDate &&
                            reconcilePaymentPopUp.depositDate
                          ) {
                            const res = await fetchPostingDate({
                              id: parseInt(reconcilePaymentPopUp.ledgerID, 10),
                              type: 'ledger',
                              postingDate: DateToStringPipe(
                                new Date(reconcilePaymentPopUp.postingDate),
                                1
                              ),
                            });
                            if (res && res.postingCheck === false) {
                              setStatusModalInfo({
                                ...statusModalInfo,
                                show: true,
                                heading: 'Error',
                                text: `${res.message}`,
                                type: StatusModalType.ERROR,
                              });
                              return;
                            }
                            setReconcileModalStatusInfo({
                              ...reconcileModalStatusInfo,
                              open: true,
                              heading: 'Reconcile Payment Confirmation',
                              okButtonText: 'Yes, Reconcile Payment',
                              closeButtonText: 'Cancel',
                              statusModalType: StatusModalType.WARNING,
                              description:
                                'Are you sure you want to proceed with this transaction?',
                              showCloseButton: true,
                            });
                          } else {
                            setStatusModalInfo({
                              ...statusModalInfo,
                              show: true,
                              heading: 'Alert',
                              text: 'Please fill all search parameter to perform a query.\nReview your input and try again.',
                              type: StatusModalType.WARNING,
                            });
                          }
                        }}
                      >
                        Reconcile Payment
                      </Button>
                    </div>
                    <div>
                      <Button
                        buttonType={ButtonType.secondary}
                        cls={`w-[102px]`}
                        onClick={() => {
                          setReconcileModal(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Modal>
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
                });
              }}
              onClose={() => {
                setStatusModalInfo({
                  ...statusModalInfo,
                  show: false,
                });
              }}
            />
            <StatusModal
              open={reconcileModalStatusInfo.open}
              heading={reconcileModalStatusInfo.heading}
              description={reconcileModalStatusInfo.description}
              okButtonText={reconcileModalStatusInfo.okButtonText}
              closeButtonText={reconcileModalStatusInfo.closeButtonText}
              statusModalType={reconcileModalStatusInfo.statusModalType}
              showCloseButton={reconcileModalStatusInfo.showCloseButton}
              closeOnClickOutside={reconcileModalStatusInfo.closeOnClickOutside}
              onClose={() => {
                setReconcileModalStatusInfo({
                  ...reconcileModalStatusInfo,
                  open: false,
                });
              }}
              onChange={async () => {
                const reconcileObj: ReconcilePayment = {
                  ledgerID: reconcilePaymentPopUp.ledgerID,
                  paymentNumber: reconcilePaymentPopUp.paymentNumber,
                  reconsile: reconcilePaymentPopUp.reconsile,
                  depositDate: DateToStringPipe(
                    reconcilePaymentPopUp.depositDate,
                    1
                  ),
                  postingDate: DateToStringPipe(
                    reconcilePaymentPopUp.postingDate,
                    1
                  ),
                };
                const res = await saveReconcilePayment(reconcileObj);
                if (res) {
                  setReconcileModal(false);
                  const obj = {
                    ...searchCriteria,
                    sortColumn: '',
                    sortOrder: '',
                    pageNumber: 1,
                  };
                  setSearchCriteria(obj);
                  getSearchData(obj);
                } else {
                  setStatusModalInfo({
                    ...statusModalInfo,
                    show: true,
                    heading: 'Error',
                    text: 'A system error prevented the payment to be \nreconciled. Pleaase try again.',
                    type: StatusModalType.ERROR,
                  });
                }
                setReconcileModalStatusInfo({
                  ...reconcileModalStatusInfo,
                  open: false,
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
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default PaymentReconciliation;
