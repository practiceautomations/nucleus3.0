import type { GridRowId } from '@mui/x-data-grid-pro';
import {
  type GridColDef,
  type GridColTypeDef,
  GRID_DETAIL_PANEL_TOGGLE_COL_DEF,
} from '@mui/x-data-grid-pro';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import Icon from '@/components/Icon';
import PageHeader from '@/components/PageHeader';
import SavedSearchCriteria from '@/components/PatientSearch/SavedSearchCriteria';
import AppDatePicker from '@/components/UI/AppDatePicker';
// import Badge from '@/components/UI/Badge';
import Breadcrumbs from '@/components/UI/Breadcrumbs/breadcrumbs';
import Button, { ButtonType } from '@/components/UI/Button';
// import type { ButtonSelectDropdownDataType } from '@/components/UI/ButtonSelectDropdown';
import CloseButton from '@/components/UI/CloseButton';
import Modal from '@/components/UI/Modal';
import RadioButton from '@/components/UI/RadioButton';
import SearchDetailGrid, {
  globalPaginationConfig,
} from '@/components/UI/SearchDetailGrid';
import SearchGridExpandabkeRowModal from '@/components/UI/SearchGridExpandableRowModal';
import SectionHeading from '@/components/UI/SectionHeading';
import SingleSelectDropDown from '@/components/UI/SingleSelectDropDown';
// import type { SingleSelectDropDownDataType } from '@/components/UI/SingleSelectDropDown';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import AppLayout from '@/layouts/AppLayout';
import store from '@/store';
import { getselectdWorkGroupsIDsSelector } from '@/store/chrome/selectors';
import {
  addToastNotification,
  fetchFacilityDataRequest,
  fetchPracticeDataRequest,
  fetchProviderDataRequest,
} from '@/store/shared/actions';
import {
  getAllEOMViewDetailGridResult,
  getEndOfMonthReport,
  getEndOfMonthResult,
  getEODViewDetails,
} from '@/store/shared/sagas';
import {
  getFacilityDataSelector,
  getPracticeDataSelector,
  getProviderDataSelector,
} from '@/store/shared/selectors';
import type {
  EOMReportViewDetailSearchCriteria,
  EOMViewDetailGridCriteria,
  EOMViewDetailGridResult,
} from '@/store/shared/types';
import {
  type EndOfMonthReportCriteria,
  type EndOfMonthReportResult,
  type EndOfMonthViewDetailResult,
  type FacilityData,
  type PracticeData,
  type ProviderData,
  ToastType,
} from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';
import { DateToStringPipe } from '@/utils/dateConversionPipes';

import { CustomDetailPanelToggle } from '../app/all-claims';

const EODReport = () => {
  const dispatch = useDispatch();
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

  const selectedWorkedGroup = useSelector(getselectdWorkGroupsIDsSelector);

  const defaultSearchCriteria: EndOfMonthReportCriteria = {
    groupID: undefined,
    fromDate: '',
    toDate: '',
    monthEnd: '2',
    getAllData: undefined,
    pageNumber: 1,
    pageSize: globalPaginationConfig.activePageSize,
    sortColumn: '',
    sortOrder: '',
  };

  const defaultViewDetailSearchCriteria: EOMReportViewDetailSearchCriteria = {
    groupID: undefined,
    month: '',
    monthEnd: '',
    monthStartDate: '',
    practiceIDS: '',
    facilityIDS: '',
    providerIDS: '',
    pageNumber: 1,
    pageSize: globalPaginationConfig.activePageSize,
    sortColumn: '',
    sortOrder: '',
  };

  const [lastSearchCriteria, setLastSearchCriteria] = useState(
    defaultSearchCriteria
  );
  const [lastViewDetailSearchCriteria, setLastViewDetailSearchCriteria] =
    useState(defaultViewDetailSearchCriteria);
  const [isChangedJson, setIsChangedJson] = useState(false);

  const practiceData = useSelector(getPracticeDataSelector);
  const providersData = useSelector(getProviderDataSelector);
  const facilityData = useSelector(getFacilityDataSelector);
  const [practiceDropdown, setPracticeDropdown] = useState<PracticeData[]>([]);
  const [providerDropdown, setProviderDropdown] = useState<ProviderData[]>([]);
  const [facilityDropdown, setFacilityDropdown] = useState<FacilityData[]>([]);

  const [
    detailPanelExpandedSummaryRowIds,
    setDetailPanelExpandedSummaryRowIds,
  ] = useState<GridRowId[]>([]);
  const handleDetailPanelExpandedSummaryRowIdsChange = useCallback(
    (newIds: GridRowId[]) => {
      setDetailPanelExpandedSummaryRowIds(newIds);
    },
    []
  );
  const [detailPanelExpandedDetailRowIds, setDetailPanelExpandedDetailRowIds] =
    useState<GridRowId[]>([]);
  const handleDetailPanelExpandedDetailRowIdsChange = useCallback(
    (newIds: GridRowId[]) => {
      setDetailPanelExpandedDetailRowIds(newIds);
    },
    []
  );
  const [expandedModalSummaryData, setExpandedModalSummaryData] = useState<{
    id: GridRowId;
    type: string;
  }>({ id: '', type: '' });
  const [expandedModalDetailData, setExpandedModalDetailData] = useState<{
    id: GridRowId;
    type: string;
  }>({ id: '', type: '' });

  const [searchCriteria, setSearchCriteria] = useState(defaultSearchCriteria);
  const setSearchCriteriaFields = (value: EndOfMonthReportCriteria) => {
    setSearchCriteria(value);
    setIsChangedJson(true);
  };

  const [viewDetailSearchCriteria, setViewDetailSearchCriteria] = useState(
    defaultViewDetailSearchCriteria
  );
  const setViewDetailSearchCriteriaFields = (
    value: EOMReportViewDetailSearchCriteria
  ) => {
    setViewDetailSearchCriteria(value);
  };

  const [hideSearchParameters, setHideSearchParameters] =
    useState<boolean>(true);

  const [openEODViewDetailModal, setOpenEODViewDetailModal] = useState(false);

  useEffect(() => {
    setSearchCriteriaFields({
      ...searchCriteria,
      groupID: selectedWorkedGroup?.groupsData[0]?.id || undefined,
    });
  }, [selectedWorkedGroup]);

  useEffect(() => {
    const groupId = searchCriteria?.groupID;
    if (groupId) {
      setPracticeDropdown([]);
      setProviderDropdown([]);
      dispatch(fetchPracticeDataRequest({ groupID: groupId }));
      dispatch(fetchProviderDataRequest({ groupID: groupId }));
      dispatch(fetchFacilityDataRequest({ groupID: groupId }));
    }
  }, [searchCriteria?.groupID]);
  useEffect(() => {
    setPracticeDropdown(practiceData || []);
    setProviderDropdown(providersData || []);
    setFacilityDropdown(facilityData || []);
  }, [practiceData, providersData, facilityData]);

  const [renderSearchCriteriaView, setRenderSearchCriteriaView] = useState(
    uuidv4()
  );

  const defaultStatusModalState = {
    open: false,
    heading: '',
    description: '',
    okButtonText: 'Ok',
    closeButtonText: 'Close',
    statusModalType: StatusModalType.ERROR,
    showCloseButton: false,
    closeOnClickOutside: false,
    confirmActionType: '',
  };
  const [statusModalState, setStatusModalState] = useState(
    defaultStatusModalState
  );

  const [statusModalInfo, setStatusModalInfo] = useState({
    show: false,
    heading: '',
    text: '',
    type: StatusModalType.WARNING,
  });
  const [searchResult, setSearchResult] = useState<EndOfMonthReportResult[]>(
    []
  );
  const [viewDetailResult, setViewDetailResult] =
    useState<EndOfMonthViewDetailResult>({
      summary: [],
      monthEndReportViewData: [],
    });

  const [viewDetailGridResult, setViewDetailGridResult] =
    useState<EOMViewDetailGridResult>({
      chargesData: [],
      ledgersData: [],
    });

  const getSearchData = async (obj: EndOfMonthReportCriteria) => {
    const res = await getEndOfMonthReport(obj);
    if (res) {
      setSearchResult(res);
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

  const closeExpandedSummaryRowContent = (id: GridRowId) => {
    setDetailPanelExpandedSummaryRowIds(
      detailPanelExpandedSummaryRowIds.filter((f) => f !== id)
    );
  };
  const closeExpandedDetailRowContent = (id: GridRowId) => {
    setDetailPanelExpandedDetailRowIds(
      detailPanelExpandedDetailRowIds.filter((f) => f !== id)
    );
  };

  const resetModalViewDetails = () => {
    setOpenEODViewDetailModal(false);
    setViewDetailResult({
      summary: [],
      monthEndReportViewData: [],
    });
    closeExpandedSummaryRowContent(expandedModalSummaryData.id);
    closeExpandedDetailRowContent(expandedModalDetailData.id);
    setExpandedModalSummaryData({
      id: '',
      type: '',
    });
    setExpandedModalDetailData({
      id: '',
      type: '',
    });
    setViewDetailSearchCriteria(defaultViewDetailSearchCriteria);
  };

  const eodViewDetails = async (obj: EOMReportViewDetailSearchCriteria) => {
    const res = await getEODViewDetails(obj);
    if (res) {
      setViewDetailResult(res);
      setLastViewDetailSearchCriteria(obj);
    }
  };

  useEffect(() => {
    eodViewDetails({
      ...viewDetailSearchCriteria,
      groupID: searchCriteria.groupID,
      monthStartDate: viewDetailSearchCriteria.monthStartDate,
    });
  }, [
    viewDetailSearchCriteria.practiceIDS,
    viewDetailSearchCriteria.facilityIDS,
    viewDetailSearchCriteria.providerIDS,
  ]);

  const endOfMonth = async () => {
    if (
      viewDetailResult.summary.length &&
      viewDetailResult.monthEndReportViewData.length
    ) {
      const res = await getEndOfMonthResult(
        searchCriteria.groupID,
        viewDetailSearchCriteria.monthStartDate
      );
      if (res.id === 1) {
        resetModalViewDetails();
        onClickSearch();
        store.dispatch(
          addToastNotification({
            id: uuidv4(),
            text: `${res.message}`,
            toastType: ToastType.SUCCESS,
          })
        );
      } else if (res) {
        store.dispatch(
          addToastNotification({
            id: uuidv4(),
            text: `${res.message}`,
            toastType: ToastType.ERROR,
          })
        );
      } else {
        setStatusModalInfo({
          ...statusModalInfo,
          show: true,
          heading: 'Error',
          type: StatusModalType.ERROR,
          text: 'A system error occurred while searching for results.\nPlease try again.',
        });
      }
    } else {
      setStatusModalInfo({
        ...statusModalInfo,
        show: true,
        heading: 'Alert',
        type: StatusModalType.WARNING,
        text: 'No records found for finalize month.',
      });
    }
  };

  const getEOMViewDetailGridResult = async (
    data: EOMViewDetailGridCriteria
  ) => {
    closeExpandedSummaryRowContent(expandedModalSummaryData.id);
    closeExpandedDetailRowContent(expandedModalDetailData.id);
    setExpandedModalSummaryData({
      id: '',
      type: '',
    });
    setExpandedModalDetailData({
      id: '',
      type: '',
    });
    const res = await getAllEOMViewDetailGridResult(data);
    if (res) {
      setViewDetailGridResult(res);
    }
  };

  const eodReportColums: GridColDef[] = [
    {
      field: 'monthName',
      headerName: 'Month',
      flex: 1,
      minWidth: 80,
      disableReorder: true,
    },
    {
      field: 'monthEndDate',
      headerName: 'Month End Date',
      flex: 1,
      minWidth: 140,
      disableReorder: true,
    },
    {
      field: 'monthEndBy',
      headerName: 'Month End By',
      flex: 1,
      minWidth: 160,
      disableReorder: true,
    },
    {
      field: 'monthEnd',
      headerName: 'Month End',
      minWidth: 110,
      flex: 1,
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
              'ml-[8px] w-[175px] h-[32px] inline-flex !justify-center gap-2 leading-loose '
            }
            style={{ verticalAlign: 'middle' }}
            onClick={() => {
              const obj: EOMReportViewDetailSearchCriteria = {
                ...viewDetailSearchCriteria,
                groupID: searchCriteria.groupID,
                month: params.row.monthName.replace('-', ' '),
                monthEnd: params.row.monthEnd,
                monthStartDate: params.row.monthStartDate,
                practiceIDS:
                  practiceData && practiceData[0]?.id
                    ? practiceData[0]?.id.toString()
                    : '',
                facilityIDS: viewDetailSearchCriteria.facilityIDS,
                providerIDS: viewDetailSearchCriteria.providerIDS,
              };
              setOpenEODViewDetailModal(true);
              setViewDetailSearchCriteriaFields(obj);
              eodViewDetails(obj);
            }}
          >
            <Icon name={'eyeWhite'} size={18} />
            <p
              data-testid="paymentReconcileBtn"
              className="text-justify text-sm"
            >
              View Details
            </p>
          </Button>
        );
      },
    },
  ];
  const eodReportSummaryColums: GridColDef[] = [
    {
      ...GRID_DETAIL_PANEL_TOGGLE_COL_DEF,
      renderCell: (params) => (
        <CustomDetailPanelToggle id={params.id} value={params.value} />
      ),
      minWidth: 80,
      hide: true,
    },
    {
      field: 'practice',
      headerName: 'Practice',
      flex: 1,
      minWidth: 280,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              data-testid="practice"
              className="text-cyan-500"
              onClick={() => {}}
            >
              {params.value}
            </div>
            <div className="text-xs font-normal leading-4">
              {params.row.practiceAddress}
            </div>
          </div>
        );
      },
    },
    {
      field: 'facility',
      headerName: 'Facility',
      flex: 1,
      minWidth: 280,
      disableReorder: true,
      hide: !viewDetailSearchCriteria.facilityIDS,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="text-cyan-500" onClick={() => {}}>
              {params.value}
            </div>
            <div className="text-xs font-normal leading-4">
              {params.row.facilityAddress}
            </div>
          </div>
        );
      },
    },
    {
      field: 'provider',
      headerName: 'Provider',
      flex: 1,
      minWidth: 220,
      disableReorder: true,
      hide: !viewDetailSearchCriteria.providerIDS,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="text-sm font-normal leading-5 text-cyan-500 underline"
              onClick={async () => {}}
            >
              {params.value}
            </div>
            <div className="text-xs font-normal leading-4 text-gray-500">
              NPI: {params.row.providerNPI}
            </div>
          </div>
        );
      },
    },
    {
      field: 'monthName',
      headerName: 'Month',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'chargesCount',
      headerName: 'Charges Count',
      flex: 1,
      minWidth: 160,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-sm font-normal leading-5 text-cyan-500 underline"
              onClick={async () => {
                if (
                  expandedModalSummaryData.id !== params.id ||
                  expandedModalSummaryData.type !== 'chargeCount'
                ) {
                  const obj: EOMViewDetailGridCriteria = {
                    groupID: searchCriteria.groupID,
                    practiceID: params.row.practiceID,
                    facilityID: params.row.facilityID,
                    providerID: params.row.providerID,
                    monthStartDate: viewDetailSearchCriteria.monthStartDate,
                    postingDate: '',
                    endOfMonthType: 'summary',
                    dataType: 'charges',
                    ledgerType: '',
                  };
                  getEOMViewDetailGridResult(obj);
                  setExpandedModalSummaryData({
                    id: params.id,
                    type: 'chargeCount',
                  });
                  setDetailPanelExpandedSummaryRowIds([params.id]);
                } else {
                  setExpandedModalSummaryData({
                    id: '',
                    type: '',
                  });
                  closeExpandedSummaryRowContent(params.id);
                }
              }}
            >
              {params.value}
            </div>
          </div>
        );
      },
    },
    {
      field: 'visitsCount',
      headerName: 'Visits Count',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'patientsCount',
      headerName: 'Patients Count',
      flex: 1,
      minWidth: 135,
      disableReorder: true,
    },
    {
      field: 'charges',
      headerName: 'Charges',
      flex: 1,
      ...usdPrice,
      minWidth: 140,
      disableReorder: true,
    },
    {
      field: 'payments',
      headerName: 'Payments',
      ...usdPrice,
      minWidth: 170,
      flex: 1,
      disableReorder: true,
      description: '(Ins Payments + Pat Payments + Collected Adv Payments)',
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-sm font-normal leading-5 text-cyan-500 underline"
              onClick={async () => {
                if (
                  expandedModalSummaryData.id !== params.id ||
                  expandedModalSummaryData.type !== 'payment'
                ) {
                  const obj: EOMViewDetailGridCriteria = {
                    groupID: searchCriteria.groupID,
                    practiceID: params.row.practiceID,
                    facilityID: params.row.facilityID,
                    providerID: params.row.providerID,
                    monthStartDate: viewDetailSearchCriteria.monthStartDate,
                    postingDate: '',
                    endOfMonthType: 'summary',
                    dataType: 'ledgers',
                    ledgerType: 'payments',
                  };
                  getEOMViewDetailGridResult(obj);
                  setExpandedModalSummaryData({
                    id: params.id,
                    type: 'payment',
                  });
                  setDetailPanelExpandedSummaryRowIds([params.id]);
                } else {
                  setExpandedModalSummaryData({
                    id: '',
                    type: '',
                  });
                  closeExpandedSummaryRowContent(params.id);
                }
              }}
            >
              {currencyFormatter.format(params.value)}
            </div>
          </div>
        );
      },
    },
    {
      field: 'adjustments',
      headerName: 'Adjustments',
      ...usdPrice,
      flex: 1,
      minWidth: 140,
      disableReorder: true,
      description: 'Insurance Adjustment',
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-sm font-normal leading-5 text-cyan-500 underline"
              onClick={async () => {
                if (
                  expandedModalSummaryData.id !== params.id ||
                  expandedModalSummaryData.type !== 'adjustment'
                ) {
                  const obj: EOMViewDetailGridCriteria = {
                    groupID: searchCriteria.groupID,
                    practiceID: params.row.practiceID,
                    facilityID: params.row.facilityID,
                    providerID: params.row.providerID,
                    monthStartDate: viewDetailSearchCriteria.monthStartDate,
                    postingDate: '',
                    endOfMonthType: 'summary',
                    dataType: 'ledgers',
                    ledgerType: 'adjustments',
                  };
                  getEOMViewDetailGridResult(obj);
                  setExpandedModalSummaryData({
                    id: params.id,
                    type: 'adjustment',
                  });
                  setDetailPanelExpandedSummaryRowIds([params.id]);
                } else {
                  setExpandedModalSummaryData({
                    id: '',
                    type: '',
                  });
                  closeExpandedSummaryRowContent(params.id);
                }
              }}
            >
              {currencyFormatter.format(params.value)}
            </div>
          </div>
        );
      },
    },
    {
      field: 'refunds',
      headerName: 'Refunds',
      ...usdPrice,
      flex: 1,
      minWidth: 140,
      disableReorder: true,
      description: '(Insurance Refunds + Patient Refunds)',
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-sm font-normal leading-5 text-cyan-500 underline"
              onClick={async () => {
                if (
                  expandedModalSummaryData.id !== params.id ||
                  expandedModalSummaryData.type !== 'refund'
                ) {
                  const obj: EOMViewDetailGridCriteria = {
                    groupID: searchCriteria.groupID,
                    practiceID: params.row.practiceID,
                    facilityID: params.row.facilityID,
                    providerID: params.row.providerID,
                    monthStartDate: viewDetailSearchCriteria.monthStartDate,
                    postingDate: '',
                    endOfMonthType: 'summary',
                    dataType: 'ledgers',
                    ledgerType: 'refunds',
                  };
                  getEOMViewDetailGridResult(obj);
                  setExpandedModalSummaryData({
                    id: params.id,
                    type: 'refund',
                  });
                  setDetailPanelExpandedSummaryRowIds([params.id]);
                } else {
                  setExpandedModalSummaryData({
                    id: '',
                    type: '',
                  });
                  closeExpandedSummaryRowContent(params.id);
                }
              }}
            >
              {currencyFormatter.format(params.value)}
            </div>
          </div>
        );
      },
    },
    {
      field: 'patientDiscounts',
      headerName: 'Patient Discount',
      ...usdPrice,
      flex: 1,
      minWidth: 140,
      disableReorder: true,
      description: 'Patient Discount',
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-sm font-normal leading-5 text-cyan-500 underline"
              onClick={async () => {
                if (
                  expandedModalSummaryData.id !== params.id ||
                  expandedModalSummaryData.type !== 'refund'
                ) {
                  const obj: EOMViewDetailGridCriteria = {
                    groupID: searchCriteria.groupID,
                    practiceID: params.row.practiceID,
                    facilityID: params.row.facilityID,
                    providerID: params.row.providerID,
                    monthStartDate: viewDetailSearchCriteria.monthStartDate,
                    postingDate: '',
                    endOfMonthType: 'summary',
                    dataType: 'ledgers',
                    ledgerType: 'patient_discount',
                  };
                  getEOMViewDetailGridResult(obj);
                  setExpandedModalSummaryData({
                    id: params.id,
                    type: 'refund',
                  });
                  setDetailPanelExpandedSummaryRowIds([params.id]);
                } else {
                  setExpandedModalSummaryData({
                    id: '',
                    type: '',
                  });
                  closeExpandedSummaryRowContent(params.id);
                }
              }}
            >
              {currencyFormatter.format(params.value)}
            </div>
          </div>
        );
      },
    },
    {
      field: 'badDebts',
      headerName: 'Bad Debt',
      ...usdPrice,
      flex: 1,
      minWidth: 140,
      disableReorder: true,
      description: 'Bad Debt',
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-sm font-normal leading-5 text-cyan-500 underline"
              onClick={async () => {
                if (
                  expandedModalSummaryData.id !== params.id ||
                  expandedModalSummaryData.type !== 'badDebt'
                ) {
                  const obj: EOMViewDetailGridCriteria = {
                    groupID: searchCriteria.groupID,
                    practiceID: params.row.practiceID,
                    facilityID: params.row.facilityID,
                    providerID: params.row.providerID,
                    monthStartDate: viewDetailSearchCriteria.monthStartDate,
                    postingDate: '',
                    endOfMonthType: 'summary',
                    dataType: 'ledgers',
                    ledgerType: 'bad_debt',
                  };
                  getEOMViewDetailGridResult(obj);
                  setExpandedModalSummaryData({
                    id: params.id,
                    type: 'badDebt',
                  });
                  setDetailPanelExpandedSummaryRowIds([params.id]);
                } else {
                  setExpandedModalSummaryData({
                    id: '',
                    type: '',
                  });
                  closeExpandedSummaryRowContent(params.id);
                }
              }}
            >
              {currencyFormatter.format(params.value)}
            </div>
          </div>
        );
      },
    },
    {
      field: 'collectedAdvancePayments',
      headerName: 'Collected Adv Pay.',
      ...usdPrice,
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-sm font-normal leading-5 text-cyan-500 underline"
              onClick={async () => {
                if (
                  expandedModalSummaryData.id !== params.id ||
                  expandedModalSummaryData.type !== 'collectedAdvPay'
                ) {
                  const obj: EOMViewDetailGridCriteria = {
                    groupID: searchCriteria.groupID,
                    practiceID: params.row.practiceID,
                    facilityID: params.row.facilityID,
                    providerID: params.row.providerID,
                    monthStartDate: viewDetailSearchCriteria.monthStartDate,
                    postingDate: '',
                    endOfMonthType: 'summary',
                    dataType: 'ledgers',
                    ledgerType: 'collected_adv_payment',
                  };
                  getEOMViewDetailGridResult(obj);
                  setExpandedModalSummaryData({
                    id: params.id,
                    type: 'collectedAdvPay',
                  });
                  setDetailPanelExpandedSummaryRowIds([params.id]);
                } else {
                  setExpandedModalSummaryData({
                    id: '',
                    type: '',
                  });
                  closeExpandedSummaryRowContent(params.id);
                }
              }}
            >
              {currencyFormatter.format(params.value)}
            </div>
          </div>
        );
      },
    },
    {
      field: 'appliedAdvancePayments',
      headerName: 'Applied Adv Pay.',
      ...usdPrice,
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-sm font-normal leading-5 text-cyan-500 underline"
              onClick={async () => {
                if (
                  expandedModalSummaryData.id !== params.id ||
                  expandedModalSummaryData.type !== 'appliedAdvPay'
                ) {
                  const obj: EOMViewDetailGridCriteria = {
                    groupID: searchCriteria.groupID,
                    practiceID: params.row.practiceID,
                    facilityID: params.row.facilityID,
                    providerID: params.row.providerID,
                    monthStartDate: viewDetailSearchCriteria.monthStartDate,
                    postingDate: '',
                    endOfMonthType: 'summary',
                    dataType: 'ledgers',
                    ledgerType: 'applied_adv_payment',
                  };
                  getEOMViewDetailGridResult(obj);
                  setExpandedModalSummaryData({
                    id: params.id,
                    type: 'appliedAdvPay',
                  });
                  setDetailPanelExpandedSummaryRowIds([params.id]);
                } else {
                  setExpandedModalSummaryData({
                    id: '',
                    type: '',
                  });
                  closeExpandedSummaryRowContent(params.id);
                }
              }}
            >
              {currencyFormatter.format(params.value)}
            </div>
          </div>
        );
      },
    },
    {
      field: 'beginning',
      headerName: 'Beginning',
      ...usdPrice,
      flex: 1,
      minWidth: 140,
      disableReorder: true,
    },
    {
      field: 'ending',
      headerName: 'Ending',
      ...usdPrice,
      flex: 1,
      minWidth: 140,
      disableReorder: true,
      description: '( Beginning + Net )',
    },
    {
      field: 'netBalance',
      headerName: 'Net',
      ...usdPrice,
      flex: 1,
      minWidth: 170,
      disableReorder: true,
      description:
        '[ Charges - ( Adjustments + Payments + Patient Discount + Bad Debt ) + Refund ]',
    },
  ];

  const eodReportDetailColums: GridColDef[] = [
    {
      ...GRID_DETAIL_PANEL_TOGGLE_COL_DEF,
      renderCell: (params) => (
        <CustomDetailPanelToggle id={params.id} value={params.value} />
      ),
      minWidth: 80,
      hide: true,
    },
    {
      field: 'practice',
      headerName: 'Practice',
      flex: 1,
      minWidth: 280,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              data-testid="practice"
              className="text-cyan-500"
              onClick={() => {}}
            >
              {params.value}
            </div>
            <div className="text-xs font-normal leading-4">
              {params.row.practiceAddress}
            </div>
          </div>
        );
      },
    },
    {
      field: 'facility',
      headerName: 'Facility',
      flex: 1,
      minWidth: 280,
      disableReorder: true,
      hide: !viewDetailSearchCriteria.facilityIDS,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="text-cyan-500" onClick={() => {}}>
              {params.value}
            </div>
            <div className="text-xs font-normal leading-4">
              {params.row.facilityAddress}
            </div>
          </div>
        );
      },
    },
    {
      field: 'provider',
      headerName: 'Provider',
      flex: 1,
      minWidth: 220,
      disableReorder: true,
      hide: !viewDetailSearchCriteria.providerIDS,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="text-sm font-normal leading-5 text-cyan-500 underline"
              onClick={async () => {}}
            >
              {params.value}
            </div>
            <div className="text-xs font-normal leading-4 text-gray-500">
              NPI: {params.row.providerNPI}
            </div>
          </div>
        );
      },
    },
    {
      field: 'postingDate',
      headerName: 'Posting Date',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
      renderCell: (params) => {
        return <div>{DateToStringPipe(params.value, 2)}</div>;
      },
    },
    {
      field: 'chargesCount',
      headerName: 'Charges Count',
      flex: 1,
      minWidth: 160,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-sm font-normal leading-5 text-cyan-500 underline"
              onClick={async () => {
                if (
                  expandedModalDetailData.id !== params.id ||
                  expandedModalDetailData.type !== 'chargeCount'
                ) {
                  const obj: EOMViewDetailGridCriteria = {
                    groupID: searchCriteria.groupID,
                    practiceID: params.row.practiceID,
                    facilityID: params.row.facilityID,
                    providerID: params.row.providerID,
                    monthStartDate: viewDetailSearchCriteria.monthStartDate,
                    postingDate: params.row.postingDate,
                    endOfMonthType: 'detail',
                    dataType: 'charges',
                    ledgerType: '',
                  };
                  getEOMViewDetailGridResult(obj);
                  setExpandedModalDetailData({
                    id: params.id,
                    type: 'chargeCount',
                  });
                  setDetailPanelExpandedDetailRowIds([params.id]);
                } else {
                  setExpandedModalDetailData({
                    id: '',
                    type: '',
                  });
                  closeExpandedDetailRowContent(params.id);
                }
              }}
            >
              {params.value}
            </div>
          </div>
        );
      },
    },
    {
      field: 'visitsCount',
      headerName: 'Visits Count',
      flex: 1,
      minWidth: 160,
      disableReorder: true,
    },
    {
      field: 'patientsCount',
      headerName: 'Patients Count',
      flex: 1,
      minWidth: 160,
      disableReorder: true,
    },
    {
      field: 'charges',
      headerName: 'Charges',
      ...usdPrice,
      flex: 1,
      minWidth: 140,
      disableReorder: true,
    },
    {
      field: 'payments',
      headerName: 'Payments',
      ...usdPrice,
      minWidth: 170,
      flex: 1,
      disableReorder: true,
      description: '(Ins Payments + Pat Payments + Collected Adv Payments)',
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-sm font-normal leading-5 text-cyan-500 underline"
              onClick={async () => {
                if (
                  expandedModalDetailData.id !== params.id ||
                  expandedModalDetailData.type !== 'payment'
                ) {
                  const obj: EOMViewDetailGridCriteria = {
                    groupID: searchCriteria.groupID,
                    practiceID: params.row.practiceID,
                    facilityID: params.row.facilityID,
                    providerID: params.row.providerID,
                    monthStartDate: viewDetailSearchCriteria.monthStartDate,
                    postingDate: params.row.postingDate,
                    endOfMonthType: 'detail',
                    dataType: 'ledgers',
                    ledgerType: 'payments',
                  };
                  getEOMViewDetailGridResult(obj);
                  setExpandedModalDetailData({
                    id: params.id,
                    type: 'payment',
                  });
                  setDetailPanelExpandedDetailRowIds([params.id]);
                } else {
                  setExpandedModalDetailData({
                    id: '',
                    type: '',
                  });
                  closeExpandedDetailRowContent(params.id);
                }
              }}
            >
              {currencyFormatter.format(params.value)}
            </div>
          </div>
        );
      },
    },
    {
      field: 'adjustments',
      headerName: 'Adjustments',
      ...usdPrice,
      flex: 1,
      minWidth: 140,
      disableReorder: true,
      description: 'Insurance Adjustment',
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-sm font-normal leading-5 text-cyan-500 underline"
              onClick={async () => {
                if (
                  expandedModalDetailData.id !== params.id ||
                  expandedModalDetailData.type !== 'adjustment'
                ) {
                  const obj: EOMViewDetailGridCriteria = {
                    groupID: searchCriteria.groupID,
                    practiceID: params.row.practiceID,
                    facilityID: params.row.facilityID,
                    providerID: params.row.providerID,
                    monthStartDate: viewDetailSearchCriteria.monthStartDate,
                    postingDate: params.row.postingDate,
                    endOfMonthType: 'detail',
                    dataType: 'ledgers',
                    ledgerType: 'adjustments',
                  };
                  getEOMViewDetailGridResult(obj);
                  setExpandedModalDetailData({
                    id: params.id,
                    type: 'adjustment',
                  });
                  setDetailPanelExpandedDetailRowIds([params.id]);
                } else {
                  setExpandedModalDetailData({
                    id: '',
                    type: '',
                  });
                  closeExpandedDetailRowContent(params.id);
                }
              }}
            >
              {currencyFormatter.format(params.value)}
            </div>
          </div>
        );
      },
    },
    {
      field: 'refunds',
      headerName: 'Refunds',
      ...usdPrice,
      flex: 1,
      minWidth: 140,
      disableReorder: true,
      description: '(Insurance Refunds + Patient Refunds)',
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-sm font-normal leading-5 text-cyan-500 underline"
              onClick={async () => {
                if (
                  expandedModalDetailData.id !== params.id ||
                  expandedModalDetailData.type !== 'refund'
                ) {
                  const obj: EOMViewDetailGridCriteria = {
                    groupID: searchCriteria.groupID,
                    practiceID: params.row.practiceID,
                    facilityID: params.row.facilityID,
                    providerID: params.row.providerID,
                    monthStartDate: viewDetailSearchCriteria.monthStartDate,
                    postingDate: params.row.postingDate,
                    endOfMonthType: 'detail',
                    dataType: 'ledgers',
                    ledgerType: 'refunds',
                  };
                  getEOMViewDetailGridResult(obj);
                  setExpandedModalDetailData({
                    id: params.id,
                    type: 'refund',
                  });
                  setDetailPanelExpandedDetailRowIds([params.id]);
                } else {
                  setExpandedModalDetailData({
                    id: '',
                    type: '',
                  });
                  closeExpandedDetailRowContent(params.id);
                }
              }}
            >
              {currencyFormatter.format(params.value)}
            </div>
          </div>
        );
      },
    },
    {
      field: 'patientDiscounts',
      headerName: 'Patient Discount',
      ...usdPrice,
      flex: 1,
      minWidth: 140,
      disableReorder: true,
      description: 'Patient Discount',
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-sm font-normal leading-5 text-cyan-500 underline"
              onClick={async () => {
                if (
                  expandedModalDetailData.id !== params.id ||
                  expandedModalDetailData.type !== 'refund'
                ) {
                  const obj: EOMViewDetailGridCriteria = {
                    groupID: searchCriteria.groupID,
                    practiceID: params.row.practiceID,
                    facilityID: params.row.facilityID,
                    providerID: params.row.providerID,
                    monthStartDate: viewDetailSearchCriteria.monthStartDate,
                    postingDate: params.row.postingDate,
                    endOfMonthType: 'detail',
                    dataType: 'ledgers',
                    ledgerType: 'patient_discount',
                  };
                  getEOMViewDetailGridResult(obj);
                  setExpandedModalDetailData({
                    id: params.id,
                    type: 'refund',
                  });
                  setDetailPanelExpandedDetailRowIds([params.id]);
                } else {
                  setExpandedModalDetailData({
                    id: '',
                    type: '',
                  });
                  closeExpandedDetailRowContent(params.id);
                }
              }}
            >
              {currencyFormatter.format(params.value)}
            </div>
          </div>
        );
      },
    },
    {
      field: 'badDebts',
      headerName: 'Bad Debt',
      ...usdPrice,
      flex: 1,
      minWidth: 140,
      disableReorder: true,
      description: 'Bad Debt',
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-sm font-normal leading-5 text-cyan-500 underline"
              onClick={async () => {
                if (
                  expandedModalDetailData.id !== params.id ||
                  expandedModalDetailData.type !== 'badDebt'
                ) {
                  const obj: EOMViewDetailGridCriteria = {
                    groupID: searchCriteria.groupID,
                    practiceID: params.row.practiceID,
                    facilityID: params.row.facilityID,
                    providerID: params.row.providerID,
                    monthStartDate: viewDetailSearchCriteria.monthStartDate,
                    postingDate: params.row.postingDate,
                    endOfMonthType: 'detail',
                    dataType: 'ledgers',
                    ledgerType: 'bad_debt',
                  };
                  getEOMViewDetailGridResult(obj);
                  setExpandedModalDetailData({
                    id: params.id,
                    type: 'badDebt',
                  });
                  setDetailPanelExpandedDetailRowIds([params.id]);
                } else {
                  setExpandedModalDetailData({
                    id: '',
                    type: '',
                  });
                  closeExpandedDetailRowContent(params.id);
                }
              }}
            >
              {currencyFormatter.format(params.value)}
            </div>
          </div>
        );
      },
    },
    {
      field: 'collectedAdvancePayments',
      headerName: 'Collected Adv Pay.',
      ...usdPrice,
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-sm font-normal leading-5 text-cyan-500 underline"
              onClick={async () => {
                if (
                  expandedModalDetailData.id !== params.id ||
                  expandedModalDetailData.type !== 'collectedAdvPay'
                ) {
                  const obj: EOMViewDetailGridCriteria = {
                    groupID: searchCriteria.groupID,
                    practiceID: params.row.practiceID,
                    facilityID: params.row.facilityID,
                    providerID: params.row.providerID,
                    monthStartDate: viewDetailSearchCriteria.monthStartDate,
                    postingDate: params.row.postingDate,
                    endOfMonthType: 'detail',
                    dataType: 'ledgers',
                    ledgerType: 'collected_adv_payment',
                  };
                  getEOMViewDetailGridResult(obj);
                  setExpandedModalDetailData({
                    id: params.id,
                    type: 'collectedAdvPay',
                  });
                  setDetailPanelExpandedDetailRowIds([params.id]);
                } else {
                  setExpandedModalDetailData({
                    id: '',
                    type: '',
                  });
                  closeExpandedDetailRowContent(params.id);
                }
              }}
            >
              {currencyFormatter.format(params.value)}
            </div>
          </div>
        );
      },
    },
    {
      field: 'appliedAdvancePayments',
      headerName: 'Applied Adv Pay.',
      ...usdPrice,
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-sm font-normal leading-5 text-cyan-500 underline"
              onClick={async () => {
                if (
                  expandedModalDetailData.id !== params.id ||
                  expandedModalDetailData.type !== 'appliedAdvPay'
                ) {
                  const obj: EOMViewDetailGridCriteria = {
                    groupID: searchCriteria.groupID,
                    practiceID: params.row.practiceID,
                    facilityID: params.row.facilityID,
                    providerID: params.row.providerID,
                    monthStartDate: viewDetailSearchCriteria.monthStartDate,
                    postingDate: params.row.postingDate,
                    endOfMonthType: 'detail',
                    dataType: 'ledgers',
                    ledgerType: 'applied_adv_payment',
                  };
                  getEOMViewDetailGridResult(obj);
                  setExpandedModalDetailData({
                    id: params.id,
                    type: 'appliedAdvPay',
                  });
                  setDetailPanelExpandedDetailRowIds([params.id]);
                } else {
                  setExpandedModalDetailData({
                    id: '',
                    type: '',
                  });
                  closeExpandedDetailRowContent(params.id);
                }
              }}
            >
              {currencyFormatter.format(params.value)}
            </div>
          </div>
        );
      },
    },
    {
      field: 'beginning',
      headerName: 'Beginning',
      ...usdPrice,
      flex: 1,
      minWidth: 140,
      disableReorder: true,
    },
    {
      field: 'ending',
      headerName: 'Ending',
      ...usdPrice,
      flex: 1,
      minWidth: 140,
      disableReorder: true,
      description: '( Beginning + Net )',
    },
    {
      field: 'netBalance',
      headerName: 'Net',
      ...usdPrice,
      flex: 1,
      minWidth: 170,
      disableReorder: true,
      description:
        '[ Charges - ( Adjustments + Payments + Patient Discount + Bad Debt ) + Refund ]',
    },
  ];

  const getColumnsBasedOnType = (type: string) => {
    switch (type) {
      case 'chargeCount':
        return [
          {
            field: 'chargeID',
            headerName: 'Charge ID',
            flex: 1,
            minWidth: 110,
            sortable: false,
            renderCell: (params: any) => {
              return <div>{`#${params.value}`}</div>;
            },
          },
          {
            field: 'claimID',
            headerName: 'Claim ID',
            flex: 1,
            minWidth: 110,
            sortable: false,
            renderCell: (params: any) => {
              return <div>{`#${params.value}`}</div>;
            },
          },
          {
            field: 'cpt',
            headerName: 'CPT Code',
            flex: 1,
            minWidth: 110,
            sortable: false,
          },
          {
            field: 'postingDate',
            headerName: 'Posting Date',
            flex: 1,
            minWidth: 130,
            disableReorder: true,
            sortable: false,
          },
          {
            field: 'fee',
            headerName: 'Fee',
            ...usdPrice,
            flex: 1,
            type: 'number',
            minWidth: 130,
            disableReorder: true,
            sortable: false,
          },
          {
            field: 'insuranceResponsibility',
            ...usdPrice,
            headerName: 'Ins. Resp.',
            flex: 1,
            minWidth: 110,
            sortable: false,
          },
          {
            field: 'patientResponsibility',
            headerName: 'Pat. Resp.',
            ...usdPrice,
            flex: 1,
            minWidth: 110,
            sortable: false,
          },
          {
            field: 'totalBalance',
            headerName: 'Total Balance',
            ...usdPrice,
            flex: 1,
            minWidth: 110,
            sortable: false,
          },
        ];
      default:
        return [
          {
            field: 'patientID',
            headerName: 'Patient ID',
            flex: 1,
            minWidth: 150,
            disableReorder: true,
            sortable: false,
            renderCell: (params: any) => {
              return <div className="flex flex-col">#{params.value}</div>;
            },
          },
          {
            field: 'chargeID',
            headerName: 'Charge ID',
            flex: 1,
            minWidth: 150,
            disableReorder: true,
            sortable: false,
            renderCell: (params: any) => {
              return <div className="flex flex-col">#{params.value}</div>;
            },
          },
          {
            field: 'claimID',
            headerName: 'Claim ID',
            flex: 1,
            minWidth: 150,
            disableReorder: true,
            sortable: false,
            renderCell: (params: any) => {
              return <div className="flex flex-col">#{params.value}</div>;
            },
          },
          {
            field: 'batchID',
            headerName: 'Batch ID',
            flex: 1,
            minWidth: 150,
            disableReorder: true,
            sortable: false,
            renderCell: (params: any) => {
              return <div className="flex flex-col">#{params.value}</div>;
            },
          },
          {
            field: 'ledgerID',
            headerName: 'Ledger ID',
            flex: 1,
            minWidth: 150,
            disableReorder: true,
            sortable: false,
            renderCell: (params: any) => {
              return <div className="flex flex-col">#{params.value}</div>;
            },
          },
          {
            field: 'ledgerName',
            headerName: 'Ledger Name',
            flex: 1,
            minWidth: 220,
            disableReorder: true,
            sortable: false,
          },
          {
            field: 'ledgerType',
            headerName: 'Ledger Type',
            flex: 1,
            minWidth: 170,
            disableReorder: true,
            sortable: false,
          },
          {
            field: 'paymentType',
            headerName: 'Payment Type',
            flex: 1,
            minWidth: 120,
            disableReorder: true,
            sortable: false,
          },
          {
            field: 'paymentNumber',
            headerName: 'Payment Number',
            flex: 1,
            minWidth: 200,
            disableReorder: true,
            sortable: false,
          },
          {
            field: 'amount',
            headerName: 'Amount',
            flex: 1,
            ...usdPrice,
            minWidth: 150,
            disableReorder: true,
            sortable: false,
          },
          {
            field: 'paymentDate',
            headerName: 'Payment Date',
            flex: 1,
            minWidth: 130,
            disableReorder: true,
            sortable: false,
          },
          {
            field: 'postingDate',
            headerName: 'Posting Date',
            flex: 1,
            minWidth: 130,
            disableReorder: true,
            sortable: false,
          },
          {
            field: 'depositDate',
            headerName: 'Deposit Date',
            flex: 1,
            minWidth: 130,
            disableReorder: true,
            sortable: false,
          },
        ];
    }
  };

  const expandedRowSummaryContent = () => {
    const columns = getColumnsBasedOnType(expandedModalSummaryData.type);
    return (
      <SearchGridExpandabkeRowModal
        expandRowData={
          (viewDetailGridResult.chargesData.length &&
            viewDetailGridResult.chargesData.map((row) => {
              return { ...row, id: row.chargeID };
            })) ||
          (viewDetailGridResult.ledgersData.length &&
            viewDetailGridResult.ledgersData.map((row) => {
              return { ...row, id: row.ledgerID };
            })) ||
          []
        }
        expandedColumns={columns}
      />
    );
  };
  const expandedRowDetailContent = () => {
    const columns = getColumnsBasedOnType(expandedModalDetailData.type);
    return (
      <SearchGridExpandabkeRowModal
        expandRowData={
          (viewDetailGridResult.chargesData.length &&
            viewDetailGridResult.chargesData.map((row) => {
              return { ...row, id: row.chargeID };
            })) ||
          (viewDetailGridResult.ledgersData.length &&
            viewDetailGridResult.ledgersData.map((row) => {
              return { ...row, id: row.ledgerID };
            })) ||
          []
        }
        expandedColumns={columns}
      />
    );
  };

  const [reportCollapseInfo, setReportCollapseInfo] = useState({
    summary: false,
    detail: false,
  });

  return (
    <AppLayout title="Nucleus - End of Month (EOM)">
      <div className="relative m-0 h-full bg-gray-100 p-0">
        <div className="m-0 h-full w-full overflow-y-scroll bg-gray-100 p-0">
          <div className="flex w-full flex-col">
            <div className="m-0 h-full w-full overflow-y-auto overflow-x-hidden bg-gray-100 p-0">
              <div className="h-[125px] w-full">
                <div className="absolute top-0 z-[11] w-full">
                  <Breadcrumbs />
                  <PageHeader>
                    <div className="flex items-start justify-between gap-4 bg-white  px-7 pt-[33px] pb-[21px]">
                      <div className="flex h-[38px] gap-6">
                        <p className="self-center text-3xl font-bold text-cyan-700">
                          End of Month (EOM)
                        </p>
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
                    <div className="w-full">
                      <div className="w-[50%] lg:w-[100%]">
                        <div className="px-[5px] pb-[5px]">
                          <p className="text-base font-bold leading-normal text-gray-700">
                            Date
                          </p>
                        </div>
                        <div className="flex w-full flex-wrap pl-[5px]">
                          <div className={`w-[20%] pr-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Date - From
                              </div>
                              <div className="w-full">
                                <AppDatePicker
                                  cls="!mt-1"
                                  selected={searchCriteria?.fromDate}
                                  onChange={(value) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      fromDate: value
                                        ? DateToStringPipe(value, 1)
                                        : '',
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className={`w-[20%] pl-[10px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Date - To
                              </div>
                              <div className="w-full">
                                <AppDatePicker
                                  cls="!mt-1"
                                  selected={searchCriteria?.toDate}
                                  onChange={(value) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      toDate: DateToStringPipe(value, 1)
                                        ? DateToStringPipe(value, 1)
                                        : '',
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className={`w-[50%] px-[25px] lg:w-[30%]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Month End
                              </div>
                              <div className="mt-[4px]  flex h-[38px] w-full items-center">
                                <RadioButton
                                  data={[
                                    {
                                      value: '1',
                                      label: 'Yes',
                                    },
                                    {
                                      value: '2',
                                      label: 'No',
                                    },
                                    {
                                      value: '',
                                      label: 'Both',
                                    },
                                  ]}
                                  checkedValue={
                                    searchCriteria.monthEnd ||
                                    searchCriteria.monthEnd === ''
                                      ? searchCriteria.monthEnd
                                      : '2'
                                  }
                                  onChange={(e) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      monthEnd: e.target.value,
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
                  <div className="flex w-[50%] items-center justify-start">
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
                        {hideSearchParameters === false ? 'Show' : 'Hide'}{' '}
                        Search Parameters
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full gap-4 bg-white px-7 pt-[25px] pb-[15px]">
                <SearchDetailGrid
                  pageNumber={lastSearchCriteria.pageNumber}
                  pageSize={lastSearchCriteria.pageSize}
                  totalCount={searchResult[0]?.total}
                  rows={
                    searchResult.map((row) => {
                      return { ...row, id: row.rid };
                    }) || []
                  }
                  columns={eodReportColums}
                  persistLayoutId={33}
                  checkboxSelection={false}
                  onPageChange={(page: number) => {
                    const obj: EndOfMonthReportCriteria = {
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
                      const obj: EndOfMonthReportCriteria = {
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
                      const obj: EndOfMonthReportCriteria = {
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
              <Modal
                open={openEODViewDetailModal}
                onClose={() => {
                  // setOpenEODViewDetailModal(false);
                }}
                modalContentClassName="h-[calc(100%-80px)] w-[calc(100%-220px)] relative rounded-lg bg-white shadow-xl transition-all sm:my-8"
                modalBackgroundClassName={'!overflow-hidden'}
              >
                <div className="flex h-full w-full flex-col items-center justify-start overflow-hidden rounded-lg bg-gray-100 shadow">
                  <div className="flex w-full flex-col items-start justify-start p-6">
                    <div className="inline-flex w-full items-center justify-between">
                      <div className="flex items-center justify-start space-x-2">
                        <p className="text-xl font-bold leading-7 text-gray-700">
                          End of Month (EOM) - {viewDetailSearchCriteria.month}
                        </p>
                      </div>
                      <CloseButton
                        onClick={() => {
                          resetModalViewDetails();
                        }}
                      />
                    </div>
                  </div>
                  <div className={'w-full px-6'}>
                    <div className={`h-[1px] w-full bg-gray-300`} />
                  </div>
                  <div className="no-scrollbar w-full flex-1 overflow-y-auto bg-gray-100">
                    <div className="flex">
                      <div className="w-full self-center break-words text-justify text-sm text-gray-500">
                        <div className="flex w-full p-6 pb-[50px]">
                          <div className="px-[5px] md:w-[50%] lg:w-[25%]">
                            <div
                              className={`flex flex-col w-full items-start justify-start self-stretch`}
                            >
                              <label className="text-sm font-medium leading-tight text-gray-700">
                                Practice
                              </label>
                              <div className="w-full">
                                <SingleSelectDropDown
                                  placeholder="-"
                                  showSearchBar={true}
                                  disabled={false}
                                  data={practiceDropdown}
                                  selectedValue={
                                    practiceDropdown.filter(
                                      (f) =>
                                        f.id ===
                                        Number(
                                          viewDetailSearchCriteria.practiceIDS
                                        )
                                    )[0]
                                  }
                                  onSelect={(value) => {
                                    setViewDetailSearchCriteriaFields({
                                      ...viewDetailSearchCriteria,
                                      practiceIDS: value.id.toString(),
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
                                Facility
                              </label>
                              <div className="w-full">
                                <SingleSelectDropDown
                                  placeholder="-"
                                  showSearchBar={true}
                                  disabled={false}
                                  data={facilityDropdown}
                                  selectedValue={
                                    facilityDropdown.filter(
                                      (f) =>
                                        f.id ===
                                        Number(
                                          viewDetailSearchCriteria.facilityIDS
                                        )
                                    )[0]
                                  }
                                  onSelect={(value) => {
                                    setViewDetailSearchCriteriaFields({
                                      ...viewDetailSearchCriteria,
                                      facilityIDS: value.id.toString(),
                                    });
                                  }}
                                  isOptional={true}
                                  onDeselectValue={() => {
                                    setViewDetailSearchCriteriaFields({
                                      ...viewDetailSearchCriteria,
                                      facilityIDS: '',
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
                                Provider
                              </label>
                              <div className="w-full">
                                <SingleSelectDropDown
                                  placeholder="-"
                                  showSearchBar={true}
                                  disabled={false}
                                  data={providerDropdown}
                                  selectedValue={
                                    providerDropdown.filter(
                                      (f) =>
                                        f.id ===
                                        Number(
                                          viewDetailSearchCriteria.providerIDS
                                        )
                                    )[0]
                                  }
                                  onSelect={(value) => {
                                    setViewDetailSearchCriteriaFields({
                                      ...viewDetailSearchCriteria,
                                      providerIDS: value.id.toString(),
                                    });
                                  }}
                                  isOptional={true}
                                  onDeselectValue={() => {
                                    setViewDetailSearchCriteriaFields({
                                      ...viewDetailSearchCriteria,
                                      providerIDS: '',
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className={'px-6'}>
                          <div className={`h-[1px] w-full bg-gray-200`} />
                        </div>
                        <div className="w-full gap-4 px-7">
                          <div className="w-full gap-4  py-[25px]">
                            <SectionHeading
                              label="End of Month (EOM) Summary"
                              isCollapsable={true}
                              hideBottomDivider
                              onClick={() => {
                                setReportCollapseInfo({
                                  ...reportCollapseInfo,
                                  summary: !reportCollapseInfo.summary,
                                });
                              }}
                              isCollapsed={reportCollapseInfo.summary}
                            />
                            <div className="mt-[40px] mb-[20px] w-full">
                              <div
                                hidden={reportCollapseInfo.summary}
                                className="w-full"
                              >
                                <SearchDetailGrid
                                  hideHeader={true}
                                  rows={
                                    viewDetailResult.summary.map((row) => {
                                      return { ...row, id: row.rid };
                                    }) || []
                                  }
                                  columns={eodReportSummaryColums}
                                  persistLayoutId={36}
                                  nonPersistCols={['facility', 'provider']}
                                  onDetailPanelExpandedRowIdsChange={
                                    handleDetailPanelExpandedSummaryRowIdsChange
                                  }
                                  detailPanelExpandedRowIds={
                                    detailPanelExpandedSummaryRowIds
                                  }
                                  expandedRowContent={expandedRowSummaryContent}
                                  checkboxSelection={false}
                                  footerPaginationContent={false}
                                  pinnedColumns={{
                                    left: ['practice'],
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          <SectionHeading
                            label="End of Month (EOM) Detail by Days"
                            isCollapsable={true}
                            hideBottomDivider
                            onClick={() => {
                              setReportCollapseInfo({
                                ...reportCollapseInfo,
                                detail: !reportCollapseInfo.detail,
                              });
                            }}
                            isCollapsed={reportCollapseInfo.detail}
                          />
                          <div className="flex w-full flex-col rounded-lg pt-[35px]">
                            <div
                              hidden={reportCollapseInfo.detail}
                              className="h-full"
                            >
                              <SearchDetailGrid
                                totalCount={
                                  viewDetailResult.monthEndReportViewData[0]
                                    ?.total
                                }
                                showTableHeading={false}
                                paginationMode={'client'}
                                rows={
                                  viewDetailResult.monthEndReportViewData.map(
                                    (row) => {
                                      return { ...row, id: row.rid };
                                    }
                                  ) || []
                                }
                                columns={eodReportDetailColums}
                                persistLayoutId={37}
                                nonPersistCols={['facility', 'provider']}
                                onDetailPanelExpandedRowIdsChange={
                                  handleDetailPanelExpandedDetailRowIdsChange
                                }
                                detailPanelExpandedRowIds={
                                  detailPanelExpandedDetailRowIds
                                }
                                expandedRowContent={expandedRowDetailContent}
                                checkboxSelection={false}
                                onPageChange={(page: number) => {
                                  const obj: EOMReportViewDetailSearchCriteria =
                                    {
                                      ...lastViewDetailSearchCriteria,
                                      pageNumber: page,
                                    };
                                  setLastViewDetailSearchCriteria(obj);
                                  eodViewDetails(obj);
                                }}
                                onSortChange={(
                                  field: string | undefined,
                                  sort: 'asc' | 'desc' | null | undefined
                                ) => {
                                  if (searchResult.length) {
                                    const obj: EOMReportViewDetailSearchCriteria =
                                      {
                                        ...lastViewDetailSearchCriteria,
                                        sortColumn: field || '',
                                        sortOrder: sort || '',
                                      };
                                    setLastViewDetailSearchCriteria(obj);
                                    eodViewDetails(obj);
                                  }
                                }}
                                onPageSizeChange={(
                                  pageSize: number,
                                  page: number
                                ) => {
                                  if (searchResult.length) {
                                    const obj: EOMReportViewDetailSearchCriteria =
                                      {
                                        ...lastViewDetailSearchCriteria,
                                        pageSize,
                                        pageNumber: page,
                                      };
                                    setLastViewDetailSearchCriteria(obj);
                                    eodViewDetails(obj);
                                  }
                                }}
                                pinnedColumns={{
                                  left: ['practice', 'postingDate'],
                                }}
                                setHeaderRadiusCSS={false}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full items-center justify-center rounded-b-lg bg-gray-200 py-6">
                    <div className="flex w-full items-center justify-end space-x-4 px-7">
                      {viewDetailSearchCriteria.monthEnd === 'No' &&
                        viewDetailSearchCriteria.month !==
                          new Date().toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric',
                          }) && (
                          <Button
                            buttonType={ButtonType.tertiary}
                            cls={`w-[140px]`}
                            onClick={async () => {
                              setStatusModalState({
                                ...statusModalState,
                                open: true,
                                heading: 'EOM Confirmation',
                                description: `Are you sure you want to proceed with this action?`,
                                statusModalType: StatusModalType.WARNING,
                                showCloseButton: true,
                                okButtonText: 'Yes, Finalize Month',
                                closeButtonText: 'Cancel',
                                confirmActionType: 'monthEnd',
                              });
                            }}
                          >
                            Finalize Month
                          </Button>
                        )}
                      <Button
                        buttonType={ButtonType.secondary}
                        cls={`w-[102px]`}
                        onClick={() => {
                          resetModalViewDetails();
                        }}
                      >
                        Exit
                      </Button>
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
              <StatusModal
                open={statusModalState.open}
                heading={statusModalState.heading}
                description={statusModalState.description}
                okButtonText={statusModalState.okButtonText}
                closeButtonText={statusModalState.closeButtonText}
                statusModalType={statusModalState.statusModalType}
                showCloseButton={statusModalState.showCloseButton}
                okButtonColor={ButtonType.tertiary}
                closeOnClickOutside={statusModalState.closeOnClickOutside}
                onClose={() => {
                  setStatusModalState({
                    ...statusModalState,
                    open: false,
                    confirmActionType: '',
                  });
                }}
                onChange={() => {
                  if (statusModalState.confirmActionType === 'monthEnd') {
                    endOfMonth();
                  }
                  setStatusModalState({
                    ...statusModalState,
                    open: false,
                    confirmActionType: '',
                  });
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
export default EODReport;
