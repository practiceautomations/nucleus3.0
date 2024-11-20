/* eslint-disable unused-imports/no-unused-vars */
import type { GridColDef } from '@mui/x-data-grid-pro';
import jsPDF from 'jspdf';
import router from 'next/router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Icon from '@/components/Icon';
import type { ChevronDropdownType } from '@/components/UI/ChevronDropdown';
import ChevronDropdown from '@/components/UI/ChevronDropdown';
import ClaimSearchGridPopup from '@/components/UI/ClaimSearchGridPopup';
import CloseButton from '@/components/UI/CloseButton';
import CustomDateSelectionModal from '@/components/UI/CustomDateSelectionModal';
import DashboardTiles from '@/components/UI/DashboardTiles';
import BarGraph from '@/components/UI/Graphs/BarGraph';
import GraphWithAnnotations from '@/components/UI/Graphs/GraphWithAnnotations';
import HorizontalBarGraph from '@/components/UI/Graphs/HorizontalBarGraph';
import type { InsuranceWithTypeDropdownType } from '@/components/UI/InsuranceWithTypeDropdown';
import InsuranceWithTypeDropdown from '@/components/UI/InsuranceWithTypeDropdown';
import Modal from '@/components/UI/Modal';
import SearchDetailGrid, {
  globalPaginationConfig,
} from '@/components/UI/SearchDetailGrid';
import AddPaymentBatch from '@/screen/batch/addPaymentBatch';
import DetailPaymentBatch from '@/screen/batch/detailPaymentBatch';
import DetailPaymentERA from '@/screen/payments/DetailPaymentERA';
import store from '@/store';
import { getselectdWorkGroupsIDsSelector } from '@/store/chrome/selectors';
import {
  addToastNotification,
  getArManagerOpenAtGlanceData,
  setAppSpinner,
  setGlobalModal,
} from '@/store/shared/actions';
import {
  fetchPaymentReportSearchData,
  getActionNeededClaims,
  getARSByData,
  getCollectedAmountsData,
  getExpectedPaymentsByDay,
  getInsurancesWithTypes,
  getOpenItemsArManager,
  getRecentlyAccessedData,
  getUnresolvedTasksAssigned,
} from '@/store/shared/sagas';
import type {
  ARSByDataResult,
  ExpectedPaymentsByDayResult,
  InsurancesWithTypesDropdownResult,
} from '@/store/shared/types';
import {
  type ActionNeededClaimsResult,
  type CollectedAmountsWidgetCriteria,
  type CollectedAmountsWidgetResult,
  type GetPaymentReportCriteria,
  type GetPaymentReportResult,
  type OpenItemsResult,
  type RecentlyAccessedData,
  type UnresolvedTasksAssignedResult,
  ToastType,
} from '@/store/shared/types';
import { usdPrice } from '@/utils';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';
import {
  DateToStringPipe,
  StringToDatePipe,
} from '@/utils/dateConversionPipes';

import { currencyFormatter } from '../all-claims';
import DenialDetailModal from './DenialDetailsModal';
import RejectionDetailModal from './RejectionDetailsModal';

interface TProps {
  refreshARManagerDashboard?: string;
  isExport: boolean;
  onExport: (value: boolean) => void;
}
const ARManagerDashboard = ({
  // refreshARManagerDashboard,
  isExport = true,
  onExport,
}: TProps) => {
  const dispatch = useDispatch();
  const selectedWorkedGroup = useSelector(getselectdWorkGroupsIDsSelector);
  const [selectedInsuranceDropdownData, setSelectedInsuranceDropdownData] =
    useState<InsuranceWithTypeDropdownType | null>(null);

  const [dashboardApisData, setDashboardApisData] = useState<{
    actionNeededClaimsData: ActionNeededClaimsResult[];
    recentlyAccessed: RecentlyAccessedData[];
    unresolvedTasks: UnresolvedTasksAssignedResult[];
    openItems: OpenItemsResult[];
    arsByPracticeData: ARSByDataResult[];
    arsByProviderData: ARSByDataResult[];
    arsByInsuranceData: ARSByDataResult[];
    arsByInsurancetypeData: ARSByDataResult[];
    insuranceWithTypeDropdownData: InsurancesWithTypesDropdownResult[];
  }>({
    actionNeededClaimsData: [],
    recentlyAccessed: [],
    unresolvedTasks: [],
    openItems: [],
    arsByPracticeData: [],
    arsByProviderData: [],
    arsByInsuranceData: [],
    arsByInsurancetypeData: [],
    insuranceWithTypeDropdownData: [],
  });
  const [expectedPaymentsByDayData, setExpectedPaymentsByDayData] = useState<
    ExpectedPaymentsByDayResult[]
  >([]);
  const getExpectedPaymentsByDayData = async (
    groupID: number,
    insuranceValue: InsuranceWithTypeDropdownType | null
  ) => {
    setSelectedInsuranceDropdownData(insuranceValue);
    let res: ExpectedPaymentsByDayResult[] | null = null;
    if (!insuranceValue) {
      res = await getExpectedPaymentsByDay(groupID, null, null);
    } else if (insuranceValue && insuranceValue.type === 'insurance') {
      res = await getExpectedPaymentsByDay(groupID, insuranceValue.id, null);
    } else if (insuranceValue && insuranceValue.type === 'insurance_type') {
      res = await getExpectedPaymentsByDay(groupID, null, insuranceValue.id);
    }
    if (res) {
      setExpectedPaymentsByDayData(res);
    }
  };

  const getCallDashboardApi = async (groupID: number) => {
    try {
      const [
        actionNeededClaimsRes,
        recentlyAccessedRes,
        unresolvedTasksRes,
        openItemsRes,
        arsByDefaultRes,
        insuranceWithTypeDropdownRes,
      ] = await Promise.all([
        getActionNeededClaims(groupID),
        getRecentlyAccessedData(groupID),
        getUnresolvedTasksAssigned(groupID),
        getOpenItemsArManager(groupID),
        getARSByData(groupID),
        getInsurancesWithTypes(groupID),
      ]);
      setDashboardApisData({
        actionNeededClaimsData: actionNeededClaimsRes || [],
        recentlyAccessed: recentlyAccessedRes || [],
        unresolvedTasks: unresolvedTasksRes || [],
        openItems: openItemsRes || [],
        arsByPracticeData:
          arsByDefaultRes?.filter((m) => m.type === 'ARByPractice') || [],
        arsByProviderData:
          arsByDefaultRes?.filter((m) => m.type === 'ARByProvider') || [],
        arsByInsuranceData:
          arsByDefaultRes?.filter((m) => m.type === 'ARByInsurance') || [],
        arsByInsurancetypeData:
          arsByDefaultRes?.filter((m) => m.type === 'ARByInsuranceType') || [],
        insuranceWithTypeDropdownData: insuranceWithTypeDropdownRes || [],
      });
    } catch (error) {
      // Handle error
      console.error('Error fetching dashboard data:', error);
    }
  };
  const [collectedAmountCustomDate, setCollectedAmountCustomDate] = useState<{
    toDate: string | null;
    fromDate: string | null;
  }>({ toDate: null, fromDate: null });
  const [collectedAmountsData, setCollectedAmountsData] = useState<
    CollectedAmountsWidgetResult[]
  >([]);
  const getCollectedAmountsDataResult = async (
    criteria: CollectedAmountsWidgetCriteria
  ) => {
    const res = await getCollectedAmountsData(criteria);
    if (res) {
      setCollectedAmountsData(res);
    }
  };
  const collectedAmountDropdownData = [
    { id: 1, value: 'Current Month' },
    { id: 2, value: 'Custom' },
  ];

  const [
    selectedCollectedAmountDropdownData,
    setSelectedCollectedAmountDropdownData,
  ] = useState<ChevronDropdownType | undefined>(collectedAmountDropdownData[0]);
  useEffect(() => {
    if (selectedWorkedGroup?.groupsData[0]?.id) {
      getCallDashboardApi(selectedWorkedGroup.groupsData[0].id);
      getExpectedPaymentsByDayData(selectedWorkedGroup.groupsData[0].id, null);
      if (selectedCollectedAmountDropdownData?.id === 1) {
        getCollectedAmountsDataResult({
          groupID: selectedWorkedGroup.groupsData[0].id,
          fromPostingDate: DateToStringPipe(
            new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            1
          ),
          toPostingDate: DateToStringPipe(new Date(), 1),
        });
      }
    }
  }, [selectedWorkedGroup, selectedCollectedAmountDropdownData]);
  const [openAddUpdateBatchModealInfo, setOpenAddUpdateBatchModealInfo] =
    useState<{
      type: string;
      id?: number;
    }>();
  const [openAddUpdateERAModealInfo, setOpenAddUpdateERAModealInfo] = useState<{
    open: boolean;
    type?: string;
    id?: number;
  }>({ open: false });
  const [refreshDetailView, setRefreshDetailView] = useState<string>();
  useEffect(() => {
    if (refreshDetailView === 'refresh') {
      setRefreshDetailView(undefined);
    }
  }, [refreshDetailView]);

  const [isCustomDateModalOpen, setCustomDateModalOpen] = useState({
    open: false,
    type: '',
  });

  // @ts-ignore
  const [paymentsByDayGraphDataSet, setPaymentsByDayGraphDataSet] = useState<
    ExpectedPaymentsByDayResult[]
  >([]);
  // @ts-ignore
  const [practiceByDayGraphDataSet, setPracticeByDayGraphDataSet] = useState<
    ARSByDataResult[]
  >([]);
  // const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const currentDateTimeRef = useRef(new Date());
  const [, updateState] = useState<boolean>(false); // Specify boolean as the type
  const forceUpdate = () => updateState((prevState) => !prevState); // Use updater function

  useEffect(() => {
    const intervalId = setInterval(() => {
      const newDate = new Date();
      if (newDate.getMinutes() !== currentDateTimeRef.current.getMinutes()) {
        currentDateTimeRef.current = newDate;
        forceUpdate(); // Trigger re-render only when minute changes
      }
    }, 60000); // 60000 milliseconds = 1 minute

    return () => clearInterval(intervalId);
  }, []);

  const getGreeting = () => {
    const currentHour = currentDateTimeRef.current.getHours();

    if (currentHour >= 5 && currentHour < 12) {
      return { greeting: 'Good Morning!', icon: 'sun' };
    }
    if (currentHour >= 12 && currentHour < 15) {
      return { greeting: 'Good Afternoon!', icon: 'sun' };
    }
    if (currentHour >= 15 && currentHour < 18) {
      return { greeting: 'Good Noon!', icon: 'cloud' };
    }
    if (currentHour >= 18 && currentHour < 24) {
      return { greeting: 'Good Evening!', icon: 'cloud' };
    }
    return { greeting: 'Good Night!', icon: 'moon' };
  };

  const formattedTime = currentDateTimeRef.current.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });

  const formattedDate = currentDateTimeRef.current.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  // @ts-ignore
  const [graphDataLoaded, setGraphDataLoaded] = useState(false);
  // @ts-ignore
  const [graphDataLable, setGraphDataLable] = useState<any[]>([]);
  // @ts-ignore
  const [graphDataSet, setGraphDataSet] = useState<any[]>([]);

  const memoizedARByPracticeGraphData = useMemo(() => {
    if (!graphDataLoaded) {
      const updatedPaymentsByDayGraphDataSet = [
        { id: 1, value: 'sample1' },
        { id: 2, value: 'sample2' },
      ];
      const updatedGraphDataSet = [
        {
          label: '',
          data: [1200, 1600, 1500, 3000, 5000, 7800, 10000, 4500],
          backgroundColor: '#67E8F9',
          barPercentage: 0.8,
          categoryPercentage: 0.6,
        },
      ];
      const updatedGraphDataLabel = [
        'Practice 1',
        'Practice 2',
        'Practice 3',
        'Practice 4',
        'Practice 5',
        'Practice 6',
        'Practice 7',
        'Practice 8',
      ];
      const indexAxis: 'x' | 'y' | undefined = 'y';
      return {
        paymentsByDayGraphDataSet: updatedPaymentsByDayGraphDataSet,
        graphDataSet: updatedGraphDataSet,
        graphDataLabel: updatedGraphDataLabel,
        indexAxis,
      };
    }
    // If graph data is already loaded, return the existing data
    return {
      paymentsByDayGraphDataSet,
      graphDataSet,
      graphDataLable,
    };
  }, [
    graphDataLoaded,
    paymentsByDayGraphDataSet,
    graphDataSet,
    graphDataLable,
  ]);
  const memorizedARByInsuranceByTypeGraphData = useMemo(() => {
    if (!graphDataLoaded) {
      const updatedPaymentsByDayGraphDataSet = [
        { id: 1, value: 'sample1' },
        { id: 2, value: 'sample2' },
      ];
      const updatedGraphDataSet = [
        {
          label: '',
          data: [1200, 4500],
          backgroundColor: '#155E75',
          barPercentage: 0.8,
          categoryPercentage: 0.6,
        },
      ];
      const updatedGraphDataLabel = ['Medicare', 'Comercial'];
      const indexAxis: 'x' | 'y' | undefined = 'y';
      return {
        paymentsByDayGraphDataSet: updatedPaymentsByDayGraphDataSet,
        graphDataSet: updatedGraphDataSet,
        graphDataLabel: updatedGraphDataLabel,
        indexAxis,
      };
    }
    // If graph data is already loaded, return the existing data
    return {
      paymentsByDayGraphDataSet,
      graphDataSet,
      graphDataLable,
    };
  }, [
    graphDataLoaded,
    paymentsByDayGraphDataSet,
    graphDataSet,
    graphDataLable,
  ]);
  let width: number;
  let height: number;
  let gradient: any;
  function getGradient(ctx: any, chartArea: any) {
    const chartWidth = chartArea.right - chartArea.left;
    const chartHeight = chartArea.bottom - chartArea.top;
    if (!gradient || width !== chartWidth || height !== chartHeight) {
      // Create the gradient because this is either the first render
      // or the size of the chart has changed
      width = chartWidth;
      height = chartHeight;
      gradient = ctx.createLinearGradient(
        0,
        chartArea.top,
        0,
        chartArea.bottom
      );
      gradient.addColorStop(0, `rgba(103, 232, 249, 0.8)`);
      gradient.addColorStop(0.954, `rgba(103, 232, 249, 0)`);
    }

    return gradient;
  }
  const memoizedAverageClaimRevenueGraphData = useMemo(() => {
    if (!graphDataLoaded) {
      const updatedPaymentsByDayGraphDataSet = [
        { id: 1, value: 'sample1' },
        { id: 2, value: 'sample2' },
      ];
      const updatedGraphDataSet = [
        {
          label: '',
          data: [1200, 1600, 1500, 3000, 5000, 7800, 10000, 4500],
          fill: true,
          borderColor: '#67E8F9',
          barPercentage: 1,
          categoryPercentage: 0.6,
          borderWidth: 5,
          type: 'line',
          pointStyle: 'circle',
          pointBackgroundColor: '#67E8F9',
          backgroundColor: (context: any) => {
            const { chart } = context;
            const { ctx, chartArea } = chart;

            if (!chartArea) {
              // This case happens on initial chart load
              return;
            }
            // eslint-disable-next-line consistent-return
            return getGradient(ctx, chartArea);
          },
        },
      ];
      const updatedGraphDataLabel = [
        '10/18/2023',
        '10/28/2023',
        '11/01/2023',
        '11/18/2023',
        '12/24/2023',
        '01/08/2024',
        '01/10/2024',
        '01/15/2024',
      ];

      return {
        paymentsByDayGraphDataSet: updatedPaymentsByDayGraphDataSet,
        graphDataSet: updatedGraphDataSet,
        graphDataLabel: updatedGraphDataLabel,
      };
    }
    // If graph data is already loaded, return the existing data
    return {
      paymentsByDayGraphDataSet,
      graphDataSet,
      graphDataLable,
    };
  }, [
    graphDataLoaded,
    paymentsByDayGraphDataSet,
    graphDataSet,
    graphDataLable,
  ]);
  const [collectedAmountModal, setCollectedAmountModal] = useState(false);
  const defaultSearchCriteria: GetPaymentReportCriteria = {
    fromCreatedDate: null,
    toCreatedDate: null,
    fromPostingDate: null,
    toPostingDate: null,
    fromDepositDate: null,
    toDepositDate: null,
    claimCreatedFrom: null,
    claimCreatedTo: null,
    responsibility: null,
    pageNumber: 1,
    pageSize: globalPaginationConfig.activePageSize,
    sortByColumn: '',
    sortOrder: '',
    groupID: undefined,
    practiceID: undefined,
    facilityID: undefined,
    providerID: undefined,
    ledgerAccount: undefined,
    paymentType: undefined,
    createdBy: undefined,
    claimCreatedBy: undefined,
    claimID: undefined,
    cpt: undefined,
    chargeID: undefined,
    firstName: undefined,
    lastName: undefined,
    patientID: undefined,
    insuranceID: undefined,
    getAllData: undefined,
    getOnlyIDS: undefined,
    zipCode: undefined,
    reasonCode: undefined,
    groupCode: undefined,
    totalPaymentsBy: undefined,
  };
  const [lastSearchCriteria, setLastSearchCriteria] = useState(
    defaultSearchCriteria
  );
  const [collectedAmountTotalCount, setCollectedAmountTotalCount] =
    useState<number>(0);
  const [collectAmountGridData, setCollectAmountGridData] = useState<
    GetPaymentReportResult[]
  >([]);
  const getSearchData = async (obj: GetPaymentReportCriteria) => {
    const res = await fetchPaymentReportSearchData(obj);
    if (res) {
      const paymentReportsResults = res.paymentReportsData;
      setCollectAmountGridData(paymentReportsResults);
      setCollectedAmountTotalCount(paymentReportsResults[0]?.total || 0);
      setLastSearchCriteria(obj);
    } else {
      // setStatusModalInfo({
      //   ...statusModalInfo,
      //   show: true,
      //   heading: 'Error',
      //   type: StatusModalType.ERROR,
      //   text: 'A system error occurred while searching for results.\nPlease try again.',
      // });
    }
  };
  const collectedAmountColumns: GridColDef[] = [
    {
      field: 'practice',
      headerName: 'Practice',
      flex: 1,
      minWidth: 160,
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
      field: 'patient',
      headerName: 'Patient Name',
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
      field: 'patientID',
      headerName: 'Patient ID',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return <div className="flex flex-col">#{params.value}</div>;
      },
    },
    {
      field: 'batchID',
      headerName: 'Batch ID',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return <div className="flex flex-col">#{params.value}</div>;
      },
    },
    {
      field: 'claimID',
      headerName: 'Claim ID',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="cursor-pointer text-cyan-500" onClick={() => {}}>
              #{params.value}
            </div>
          </div>
        );
      },
    },
    {
      field: 'chargeID',
      headerName: 'Charge ID',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return <div className="flex flex-col">#{params.value}</div>;
      },
    },
    {
      field: 'cpt',
      headerName: 'CPT Code',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return <div className="flex flex-col">{params.value}</div>;
      },
    },
    {
      field: 'ledgerID',
      headerName: 'Ledger ID',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return <div className="flex flex-col">#{params.value}</div>;
      },
    },
    {
      field: 'ledgerName',
      headerName: 'Ledger Name',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'amount',
      headerName: 'Amount',
      flex: 1,
      ...usdPrice,
      minWidth: 150,
      disableReorder: true,
    },
  ];
  const [isClaimModalOpen, setClaimModalOpen] = useState<{
    open: boolean;
    claimSearchCriteria?: ActionNeededClaimsResult;
    header: string;
    type: string;
  }>({
    open: false,
    claimSearchCriteria: undefined,
    header: '',
    type: '',
  });
  const defaultUserUrl = '/assets/DefaultUser.png';
  // @ts-ignore
  const [deniedClaimsByTime, setDeniedClaimsByTime] = useState<
    {
      id: number;
      name: string;
      role: string;
      count: number;
      lastCount: number;
    }[]
  >([
    {
      id: 1,
      name: 'John Doe',
      role: 'AR Manager | Admin',
      count: 24,
      lastCount: 26,
    },
    {
      id: 2,
      name: 'John Doe',
      role: 'AR Manager | Admin',
      count: 14,
      lastCount: 20,
    },
    {
      id: 3,
      name: 'John Doe',
      role: 'AR Manager | Admin',
      count: 21,
      lastCount: 16,
    },
    {
      id: 4,
      name: 'John Doe',
      role: 'AR Manager | Admin',
      count: 20,
      lastCount: 36,
    },
    {
      id: 5,
      name: 'John Doe',
      role: 'AR Manager | Admin',
      count: 19,
      lastCount: 19,
    },
    {
      id: 6,
      name: 'John Doe',
      role: 'AR Manager | Admin',
      count: 23,
      lastCount: 26,
    },
  ]);
  const getDeniedCliamsByTimeCountColors = (
    count: number,
    lastCount: number
  ) => {
    if (count > lastCount) {
      return { color: 'emerald', icon: 'green_trending_down' };
    }
    if (count < lastCount) {
      return { color: 'red', icon: 'red_trending_up' };
    }
    return { color: 'amber', icon: 'minus' };
  };

  const annotation1 = {
    type: 'line',
    borderColor: '#F59E0B',
    borderDash: [6, 6],
    borderDashOffset: 0,
    borderWidth: 3,
    scaleID: 'y',
    value: 5000,
  };
  const annotation2 = {
    type: 'line',
    borderColor: '#67E8F9',
    borderDash: [6, 6],
    borderDashOffset: 0,
    borderWidth: 3,
    scaleID: 'y',
    value: 4000,
  };
  // const annotationBox1 = {
  //   type: 'box',
  //   backgroundColor: 'rgba(255, 245, 157, 0.2)',
  //   borderWidth: 0,
  //   xMax: 2.5,
  //   xMin: -0.5,
  //   label: {
  //     drawTime: 'beforeDraw',
  //     display: true,
  //     content: 'First quarter',
  //     position: {
  //       x: 'center',
  //       y: 'start',
  //     },
  //   },
  // };
  // const annotationBox2 = {
  //   type: 'box',
  //   backgroundColor: 'rgba(188, 170, 164, 0.2)',
  //   borderWidth: 0,
  //   xMax: 5.5,
  //   xMin: 2.5,
  //   label: {
  //     drawTime: 'afterDraw',
  //     display: true,
  //     content: 'Second quarter',
  //     position: {
  //       x: 'center',
  //       y: 'start',
  //     },
  //   },
  // };
  // const annotationBox3 = {
  //   type: 'box',
  //   backgroundColor: 'rgba(165, 214, 167, 0.2)',
  //   borderWidth: 0,
  //   xMax: 8.5,
  //   xMin: 5.5,
  //   label: {
  //     drawTime: 'afterDraw',
  //     display: true,
  //     content: 'Third quarter',
  //     position: {
  //       x: 'center',
  //       y: 'start',
  //     },
  //   },
  // };
  // const annotationBox4 = {
  //   type: 'box',
  //   backgroundColor: 'rgba(159, 168, 218, 0.2)',
  //   borderWidth: 0,
  //   xMin: 8.5,
  //   label: {
  //     drawTime: 'afterDraw',
  //     display: true,
  //     content: 'Fourth quarter',
  //     position: {
  //       x: 'center',
  //       y: 'start',
  //     },
  //   },
  // };
  const [isDenialDetailsOpen, setDenialDetailsOpen] = useState(false);
  const [isRejectionDetailsOpen, setRejectionDetailsOpen] = useState(false);
  const downloadPdf = () => {
    onExport(true);
    store.dispatch(setAppSpinner(true));
    // eslint-disable-next-line new-cap
    const doc1 = new jsPDF('l', 'pt');
    const data1 = document.getElementById('arManager1');
    const data2 = document.getElementById('arManager2');
    const data3 = document.getElementById('arManager3');
    const data4 = document.getElementById('arManager4');
    const data5 = document.getElementById('arManager5');
    let pageSize = 0;

    document.body.style.scale = 'none';
    doc1.setFontSize(16);
    doc1.text('Monthly Summary - AR Manager Dashboard', 50, 35);
    const fullData = document.getElementById('arManager');
    if (fullData) {
      const tags = fullData.getElementsByTagName('*');
      for (let i = 0; i < tags.length; i += 1) {
        const currentTag = tags[i];
        if (
          currentTag &&
          currentTag.children.length === 0 &&
          currentTag.innerHTML !== undefined
        ) {
          currentTag.innerHTML = currentTag.innerHTML.replace(/ /gm, '&nbsp;');
        }
      }
    }

    if (data1) {
      doc1.html(data1, {
        x: 55,
        y: 40,
        callback(docc) {
          docc.addPage();
          pageSize = doc1.internal.pageSize.getHeight();
          if (data2) {
            doc1.html(data2, {
              x: 55,
              y: pageSize + 57,
              callback(docc2) {
                if (data3) {
                  docc2.html(data3, {
                    x: 55,
                    y: pageSize * 2 + 57,
                    callback(docc3) {
                      docc3.addPage();

                      if (data4) {
                        docc3.html(data4, {
                          x: 55,
                          y: pageSize * 3 + 57,
                          callback(docc4) {
                            docc4.addPage();
                            if (data5) {
                              docc4.html(data5, {
                                x: 55,
                                y: pageSize * 4 + 57,
                                callback(docc5) {
                                  docc5.save(
                                    'Monthly_Summary_Ar_Manager_Dashboard'
                                  );
                                },
                                width: 710,
                                windowWidth: data5.offsetWidth, // 1379,
                              });
                            }
                          },
                          width: 700,
                          windowWidth: data4.offsetWidth, // 1360,
                        });
                      }
                    },
                    width: 700,
                    windowWidth: data3.offsetWidth, // 1360,
                  });
                }
              },
              width: 700,
              windowWidth: data2.offsetWidth, // 1360,
            });
          }
        },
        width: 700,
        windowWidth: data1.offsetWidth, // 1378,
        margin: [30, 0, 30, 0],
      });
    }
    setTimeout(() => {
      onExport(false);
      store.dispatch(setAppSpinner(false));
      // document.body.style.zoom = zoom;
      dispatch(
        addToastNotification({
          text: 'Export Successful',
          toastType: ToastType.SUCCESS,
          id: '',
        })
      );
    }, 5000);
  };
  useEffect(() => {
    if (isExport) {
      downloadPdf();
    }
  }, [isExport]);
  return (
    <div id="arManager" className="flex w-full flex-col gap-4 p-[27px]">
      <div id="arManager1" className="flex flex-col gap-4">
        <div className="flex h-[173px] w-full gap-4">
          <div className="flex w-[25%] flex-col gap-4 rounded-lg border border-gray-300 bg-white p-4 text-gray-700 shadow ">
            <div className="flex gap-2">
              {!isExport && ( // Conditionally render the icon based on the value of shouldRenderIcon
                <Icon
                  name={getGreeting().icon}
                  size={20}
                  color={IconColors.GRAY_300}
                />
              )}
              <div className=" text-lg font-bold leading-7">
                {getGreeting().greeting}
              </div>
            </div>
            <div className="h-px bg-gray-200"></div>
            <div className="flex flex-col pt-[12px]">
              <div className=" text-3xl font-normal leading-9">
                {formattedTime}
              </div>
              <div className=" text-sm font-bold leading-tight">
                {formattedDate}
              </div>
            </div>
          </div>
          <div className="flex h-full w-[75%] rounded-lg border border-gray-300 bg-white p-4 shadow ">
            <div className="flex w-full flex-col gap-4">
              <div className="w-full text-base font-bold leading-normal text-gray-700">
                Action Needed - Claims{' '}
              </div>
              <div className="h-px bg-gray-200"></div>
              <div className="flex h-[66%] w-full gap-4">
                {dashboardApisData.actionNeededClaimsData.map((m) => (
                  <div key={m.rid} className="w-[20%]">
                    <DashboardTiles
                      tileTitle={m.value}
                      tilesColor={m.color || 'gray'} // m.color
                      onClickView={(value) => {
                        if (m.rid !== 4) {
                          setClaimModalOpen({
                            open: true,
                            claimSearchCriteria: m,
                            header: value,
                            type: 'claimActions',
                          });
                        } else {
                          dispatch(
                            getArManagerOpenAtGlanceData({
                              actionType: 'TimelyFiling',
                              tabValue: 'openARClaim',
                              viewBy: m.viewBy,
                            })
                          );
                          router.push(`/app/all-claims`);
                        }
                      }}
                      count={m.totalCount.toString()}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex h-[320px] w-full gap-4">
          <div className="flex w-[25%] flex-col gap-4 rounded-lg border border-gray-300 bg-white p-4 text-gray-700 shadow ">
            <div className="text-base font-bold leading-normal ">
              {'Jump Back In - Recently Accessed'}
            </div>
            <div className="h-px bg-gray-200"></div>
            <div className="no-scrollbar h-full overflow-auto rounded-lg border border-gray-200 px-4 py-1">
              <div className="flex h-full flex-col justify-between">
                {dashboardApisData.recentlyAccessed.map((f, index) => (
                  <div key={index} className="flex flex-col">
                    <div>
                      <div className="flex justify-between py-2">
                        <div className="text-sm font-normal leading-tight text-gray-700">
                          {' '}
                          {f.value}{' '}
                        </div>
                        <div
                          onClick={() => {
                            if (f.type === 'patient') {
                              // window.open(`/app/register-patient/${f.id}`);
                              dispatch(
                                setGlobalModal({
                                  type: 'Patient Detail',
                                  id: f.id,
                                  isPopup: true,
                                })
                              );
                            } else if (f.type === 'claim') {
                              window.open(`/app/claim-detail/${f.id}`);
                            } else if (f.type === 'payment batch') {
                              setOpenAddUpdateBatchModealInfo({
                                type: 'detail',
                                id: f.id,
                              });
                            } else if (f.type === 'era') {
                              setOpenAddUpdateERAModealInfo({
                                open: true,
                                type: 'detail',
                                id: f.id,
                              });
                            }
                          }}
                          className="cursor-pointer text-xs font-normal leading-none text-cyan-500 underline"
                        >
                          View
                        </div>
                      </div>
                      {index !==
                        dashboardApisData.recentlyAccessed.length - 1 && (
                        <div className="h-px bg-gray-200"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex w-[40%] flex-col gap-4 rounded-lg border border-gray-300 bg-white p-4 text-gray-700 shadow ">
            <div className="text-base font-bold leading-normal ">
              {'Unresolved Tasks Assigned to You'}
            </div>
            <div className="h-px bg-gray-200"></div>
            <div className="no-scrollbar h-full overflow-auto rounded-lg border border-gray-200 px-4 py-1">
              <div className="flex flex-col justify-between">
                {dashboardApisData.unresolvedTasks.map((f, index) => (
                  <div key={f.id} className="flex flex-col">
                    <div>
                      <div className="flex items-center justify-between py-2">
                        <div className="flex">
                          <div className="text-sm font-normal leading-tight text-gray-700">
                            {`Task ID #${f.id}`}
                          </div>
                          <div className="self-center text-xs font-normal leading-none text-gray-500">
                            {` - Claim ID #${f.claimID}`}
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div
                            className={classNames(
                              `items-center justify-center rounded bg-${f.taskColor}-100 px-2.5 py-[4px]  text-${f.taskColor}-800`
                            )}
                          >
                            <div className="text-center text-xs font-medium leading-none ">{`Due: ${f.dueDate}`}</div>
                          </div>
                          <div className="cursor-pointer text-xs font-normal leading-none text-cyan-500 underline">
                            View
                          </div>
                        </div>
                      </div>
                      {index !==
                        dashboardApisData.recentlyAccessed.length - 1 && (
                        <div className="h-px bg-gray-200"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex w-[35%] flex-col gap-4 rounded-lg border border-gray-300 bg-white p-4 text-gray-700 shadow ">
            <div className="text-base font-bold leading-normal ">
              {'At a Glance - Open Items'}
            </div>
            <div className="h-px bg-gray-200"></div>
            <div className="flex h-full w-full flex-col gap-4 ">
              <div className="flex h-[50%] w-full gap-4">
                {dashboardApisData.openItems.map((m, index) => (
                  <>
                    {index < 2 && (
                      <div key={m.rid} className="h-full w-[47.8%]">
                        <DashboardTiles
                          tileTitle={m.value}
                          tilesColor={'gray'}
                          count={m.total.toString()}
                          onClickView={(value) => {
                            if (m.rid === 1) {
                              setClaimModalOpen({
                                open: true,
                                claimSearchCriteria: {
                                  ...m,
                                  totalCount: m.total,
                                },
                                header: value,
                                type: 'openItems',
                              });
                            }
                            if (m.rid === 2) {
                              dispatch(
                                getArManagerOpenAtGlanceData({
                                  actionType: 'OpenTasks',
                                  tabValue: 'openARClaim',
                                  viewBy: m.viewBy,
                                })
                              );
                              router.push(`/app/all-claims`);
                            }
                          }}
                        />
                      </div>
                    )}
                  </>
                ))}
              </div>
              <div className="flex h-[50%] w-full gap-4">
                {dashboardApisData.openItems.map((m, index) => (
                  <>
                    {index >= 2 && (
                      <div key={m.rid} className="h-full w-[47.8%]">
                        <DashboardTiles
                          tileTitle={m.value}
                          tilesColor={'gray'}
                          count={m.total.toString()}
                          onClickView={() => {
                            if (m.rid === 3) {
                              dispatch(
                                getArManagerOpenAtGlanceData({
                                  actionType: 'openPayments',
                                  tabValue: 'OpenBatches',
                                  viewBy: m.viewBy,
                                })
                              );
                              router.push(`/app/payments`);
                            }
                            if (m.rid === 4) {
                              dispatch(
                                getArManagerOpenAtGlanceData({
                                  actionType: 'openPayments',
                                  tabValue: 'OpenEras',
                                  viewBy: m.viewBy,
                                })
                              );
                              router.push(`/app/payments`);
                            }
                          }}
                        />
                      </div>
                    )}
                  </>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex h-[320px] w-full gap-4">
          <div className="flex w-[25%] flex-col gap-4 rounded-lg border border-gray-300 bg-white p-4 text-gray-700 shadow ">
            <div className="flex gap-2">
              <div className="truncate text-base font-bold leading-normal">
                {'Collected Amount'}
              </div>
              {!isExport && (
                <ChevronDropdown
                  data={collectedAmountDropdownData}
                  selectedValue={selectedCollectedAmountDropdownData}
                  onSelect={(value) => {
                    setSelectedCollectedAmountDropdownData(value);
                    if (value.id === 2) {
                      setCustomDateModalOpen({
                        open: true,
                        type: 'CollectedAmount',
                      });
                    }
                  }}
                />
              )}
            </div>
            <div className="h-px bg-gray-200"></div>
            <div className="flex h-full flex-col items-end justify-center gap-1 rounded-lg border border-gray-300 bg-gray-50 p-6">
              <div className=" text-sm font-medium leading-tight text-gray-500">
                {selectedCollectedAmountDropdownData?.id === 1
                  ? `${new Date().toLocaleString('default', {
                      month: 'long',
                    })} ${new Date().getFullYear()}`
                  : `${DateToStringPipe(
                      new Date(collectedAmountCustomDate.fromDate ?? ''),
                      2
                    )} - ${
                      DateToStringPipe(
                        new Date(collectedAmountCustomDate.toDate ?? ''),
                        2
                      ) || ''
                    }`}
              </div>
              <div className="flex h-14 flex-col items-end justify-end gap-1 self-stretch">
                <div className="text-3xl font-extrabold leading-9 text-gray-900">
                  {currencyFormatter.format(
                    collectedAmountsData[0]?.totalAmount || 0
                  )}
                </div>
                <div
                  className="cursor-pointer text-xs font-normal leading-none text-cyan-500 underline"
                  onClick={() => {
                    setCollectedAmountModal(true);
                    if (selectedCollectedAmountDropdownData?.id === 2) {
                      getSearchData({
                        ...defaultSearchCriteria,
                        groupID: selectedWorkedGroup?.groupsData[0]?.id,
                        fromPostingDate: collectedAmountCustomDate.fromDate
                          ? StringToDatePipe(collectedAmountCustomDate.fromDate)
                          : null,
                        toPostingDate: collectedAmountCustomDate.toDate
                          ? StringToDatePipe(collectedAmountCustomDate.toDate)
                          : null,
                      });
                    } else {
                      getSearchData({
                        ...defaultSearchCriteria,
                        groupID: selectedWorkedGroup?.groupsData[0]?.id,
                        fromPostingDate: new Date(
                          new Date().getFullYear(),
                          new Date().getMonth(),
                          1
                        ),

                        toPostingDate: new Date(),
                      });
                    }
                  }}
                >
                  View Details
                </div>
              </div>
            </div>
          </div>
          <div className="flex w-[75%] flex-col gap-4 rounded-lg border border-gray-300 bg-white p-4 text-gray-700 shadow ">
            <div className="flex  flex-col gap-4">
              <div className="flex gap-2">
                <div className="text-base font-bold leading-normal ">
                  {'Expected Payments by Day'}
                </div>
                {!isExport && (
                  <InsuranceWithTypeDropdown
                    data={dashboardApisData.insuranceWithTypeDropdownData}
                    selectedValue={selectedInsuranceDropdownData || undefined}
                    onSelect={(value) => {
                      if (
                        selectedWorkedGroup &&
                        selectedWorkedGroup.groupsData[0] &&
                        selectedWorkedGroup.groupsData[0].id
                      ) {
                        getExpectedPaymentsByDayData(
                          selectedWorkedGroup.groupsData[0]?.id,
                          value
                        );
                      }
                      // }
                    }}
                  />
                )}
              </div>
              <div className="h-px bg-gray-200"></div>
              <div id="canvas11" className="w-full">
                <div className="h-[300px]">
                  <BarGraph
                    widthCls={'100%'}
                    heightCls={'240px'}
                    type={'bar'}
                    label={null}
                    displayLegend={false}
                    dataSets={[
                      {
                        label: '',
                        data: expectedPaymentsByDayData.map((m) => m.payments),
                        backgroundColor: '#67E8F9',
                        barPercentage: 0.8,
                        categoryPercentage: 0.6,
                      },
                    ]}
                    yAxisLabelsAppendFront={'$'}
                    data={expectedPaymentsByDayData}
                    dateLabels={expectedPaymentsByDayData.map(
                      (m) => m.postingDate
                    )}
                  >
                    <></>
                  </BarGraph>
                  {/* <GraphWithAnnotations
                  widthCls={'100%'}
                  heightCls={'240px'}
                  type={'bar'}
                  label={null}
                  displayLegend={false}
                  dataSets={memoizedPaymentByDayGraphData?.graphDataSet || []}
                  yAxisLabelsAppendFront={'$'}
                  data={
                    memoizedPaymentByDayGraphData?.paymentsByDayGraphDataSet ||
                    []
                  }
                  dateLabels={memoizedPaymentByDayGraphData?.graphDataLabel}
                  annotations={{
                    annotationBox1,
                    annotationBox2,
                    annotationBox3,
                    annotationBox4,
                  }}
                >
                  <></>
                </GraphWithAnnotations> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="arManager2" className="flex flex-col gap-4">
        <div className="flex h-[351px] w-full gap-4">
          <div className="flex w-[25%] flex-col gap-4 rounded-lg border border-gray-300 bg-white p-4 text-gray-700 shadow ">
            <div className="flex  flex-col gap-4">
              <div className="flex gap-2">
                <div className="text-base font-bold leading-normal ">
                  {'AR By Practice'}
                </div>
              </div>
              <div className="h-px bg-gray-200"></div>
              <div id="canvas21" className="w-full">
                <div className="h-[300px]">
                  <HorizontalBarGraph
                    widthCls={'100%'}
                    heightCls={'240px'}
                    type={'bar'}
                    label={null}
                    displayLegend={false}
                    yAxisLabelsAppendFront={'$'}
                    dataSets={[
                      {
                        label: '',
                        data: dashboardApisData.arsByPracticeData.map(
                          (m) => m.totalAmount
                        ),
                        backgroundColor: '#67E8F9',
                        barPercentage: 0.8,
                        categoryPercentage: 0.6,
                      },
                    ]}
                    data={dashboardApisData.arsByPracticeData}
                    dateLabels={dashboardApisData.arsByPracticeData.map(
                      (m) => m.value
                    )}
                  >
                    <></>
                  </HorizontalBarGraph>
                </div>
              </div>
            </div>
          </div>
          <div className="flex w-[25%] flex-col gap-4 rounded-lg border border-gray-300 bg-white p-4 text-gray-700 shadow ">
            <div className="flex  flex-col gap-4">
              <div className="flex gap-2">
                <div className="text-base font-bold leading-normal ">
                  {'AR By Provider'}
                </div>
              </div>
              <div className="h-px bg-gray-200"></div>
              <div id="canvas11" className="w-full">
                <div className="">
                  <HorizontalBarGraph
                    widthCls={'100%'}
                    heightCls={'240px'}
                    type={'bar'}
                    label={null}
                    displayLegend={false}
                    dataSets={[
                      {
                        label: '',
                        data: dashboardApisData.arsByProviderData.map(
                          (m) => m.totalAmount
                        ),
                        backgroundColor: '#6B7280',
                        barPercentage: 0.8,
                        categoryPercentage: 0.6,
                      },
                    ]}
                    yAxisLabelsAppendFront={'$'}
                    data={dashboardApisData.arsByProviderData}
                    dateLabels={dashboardApisData.arsByProviderData.map(
                      (m) => m.value
                    )}
                  >
                    <></>
                  </HorizontalBarGraph>
                </div>
              </div>
            </div>
          </div>
          <div className="flex w-[25%] flex-col gap-4 rounded-lg border border-gray-300 bg-white p-4 text-gray-700 shadow ">
            <div className="flex  flex-col gap-4">
              <div className="flex gap-2">
                <div className="text-base font-bold leading-normal ">
                  {'AR By Insurance'}
                </div>
              </div>
              <div className="h-px bg-gray-200"></div>
              <div id="canvas12" className="w-full">
                <div className="">
                  <HorizontalBarGraph
                    widthCls={'100%'}
                    heightCls={'240px'}
                    type={'bar'}
                    label={null}
                    displayLegend={false}
                    dataSets={[
                      {
                        label: '',
                        data: dashboardApisData.arsByInsuranceData.map(
                          (m) => m.totalAmount
                        ),
                        backgroundColor: '#6B7280',
                        barPercentage: 0.8,
                        categoryPercentage: 0.6,
                      },
                    ]}
                    data={dashboardApisData.arsByInsuranceData}
                    yAxisLabelsAppendFront={'$'}
                    dateLabels={dashboardApisData.arsByInsuranceData.map(
                      (m) => m.value
                    )}
                  >
                    <></>
                  </HorizontalBarGraph>
                </div>
              </div>
            </div>
          </div>
          <div className="flex w-[25%] flex-col gap-4 rounded-lg border border-gray-300 bg-white p-4 text-gray-700 shadow ">
            <div className="flex  flex-col gap-4">
              <div className="flex gap-2">
                <div className="text-base font-bold leading-normal ">
                  {'AR By Insurance Type'}
                </div>
              </div>
              <div className="h-px bg-gray-200"></div>
              <div id="canvas13" className="w-full">
                <div className="">
                  <HorizontalBarGraph
                    widthCls={'100%'}
                    heightCls={'240px'}
                    type={'bar'}
                    label={null}
                    displayLegend={false}
                    dataSets={[
                      {
                        label: '',
                        data: dashboardApisData.arsByInsurancetypeData.map(
                          (m) => m.totalAmount
                        ),
                        backgroundColor: '#6B7280',
                        barPercentage: 0.8,
                        categoryPercentage: 0.6,
                      },
                    ]}
                    data={dashboardApisData.arsByInsurancetypeData}
                    yAxisLabelsAppendFront={'$'}
                    dateLabels={dashboardApisData.arsByInsurancetypeData.map(
                      (m) => m.value
                    )}
                  >
                    <></>
                  </HorizontalBarGraph>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex h-[320px] w-full gap-4">
          <div className="flex w-[50%] flex-col gap-4 rounded-lg border border-gray-300 bg-white p-4 text-gray-700 shadow ">
            <div className="flex  flex-col gap-4">
              <div className="flex gap-2">
                <div className="text-base font-bold leading-normal ">
                  {'Average Claim Revenue - Last 12 months'}
                </div>
              </div>
              <div className="h-px bg-gray-200"></div>
              <div id="canvas101" className="w-full">
                <div className="">
                  <BarGraph
                    widthCls={'100%'}
                    heightCls={'240px'}
                    type={'line'}
                    label={null}
                    displayLegend={false}
                    dataSets={memoizedAverageClaimRevenueGraphData.graphDataSet}
                    yAxisLabelsAppendFront={'$'}
                    data={
                      memoizedAverageClaimRevenueGraphData.paymentsByDayGraphDataSet
                    }
                    dateLabels={
                      memoizedAverageClaimRevenueGraphData.graphDataLabel
                    }
                  >
                    <></>
                  </BarGraph>
                </div>
              </div>
            </div>
          </div>
          <div className="flex w-[50%] flex-col gap-4 rounded-lg border border-gray-300 bg-white p-4 text-gray-700 shadow ">
            <div className="flex  flex-col gap-4">
              <div className="flex gap-2">
                <div className="text-base font-bold leading-normal ">
                  {'Average Charge Amount per Claim - Last 12 months'}
                </div>
              </div>
              <div className="h-px bg-gray-200"></div>
              <div id="canvas102" className="w-full">
                <div className="h-[300px]">
                  <BarGraph
                    widthCls={'100%'}
                    heightCls={'240px'}
                    type={'line'}
                    label={null}
                    displayLegend={false}
                    dataSets={memoizedAverageClaimRevenueGraphData.graphDataSet}
                    yAxisLabelsAppendFront={'$'}
                    data={
                      memoizedAverageClaimRevenueGraphData.paymentsByDayGraphDataSet
                    }
                    dateLabels={
                      memoizedAverageClaimRevenueGraphData.graphDataLabel
                    }
                  >
                    <></>
                  </BarGraph>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="arManager3" className="flex flex-col gap-4">
        <div className="text-base font-bold leading-normal text-gray-700">
          Denials
        </div>
        <div className="flex h-[320px] w-full gap-4">
          <div className="flex w-[40%] flex-col gap-4 rounded-lg border border-gray-300 bg-white p-4 text-gray-700 shadow ">
            <div className="flex  flex-col gap-4">
              <div className="flex gap-2">
                <div className="text-base font-bold leading-normal ">
                  {'Denied Claims by Time:'}
                </div>
                {!isExport && (
                  <ChevronDropdown
                    data={[
                      { id: 1, value: 'Today' },
                      { id: 2, value: 'Last 7 Days' },
                      { id: 3, value: 'Month to Date' },
                      { id: 4, value: 'Year to Date' },
                      { id: 5, value: 'All Time' },
                      { id: 6, value: 'Custom' },
                    ]}
                    selectedValue={{ id: 1, value: 'Today' }}
                    onSelect={(value) => {
                      if (value.id === 6) {
                        //--
                      }
                    }}
                  />
                )}
              </div>
              <div className="h-px bg-gray-200"></div>
              <div id="canvas111" className="w-full">
                <div className="">
                  <GraphWithAnnotations
                    widthCls={'100%'}
                    heightCls={'240px'}
                    type={'line'}
                    label={null}
                    displayLegend={false}
                    dataSets={memoizedAverageClaimRevenueGraphData.graphDataSet}
                    data={
                      memoizedAverageClaimRevenueGraphData.paymentsByDayGraphDataSet
                    }
                    dateLabels={
                      memoizedAverageClaimRevenueGraphData.graphDataLabel
                    }
                    // annotationValue={5000}
                    annotations={{ annotation1, annotation2 }}
                  >
                    <></>
                  </GraphWithAnnotations>
                </div>
              </div>
            </div>
          </div>
          <div className="flex w-[30%] flex-col gap-4 rounded-lg border border-gray-300 bg-white p-4 text-gray-700 shadow ">
            <div className="flex  flex-col gap-4">
              <div className="flex gap-2">
                <div className="text-base font-bold leading-normal ">
                  {'Denial Reason Codes:'}
                </div>
                {!isExport && (
                  <ChevronDropdown
                    data={[
                      { id: 1, value: 'Today' },
                      { id: 2, value: 'Last 7 Days' },
                      { id: 3, value: 'Month to Date' },
                      { id: 4, value: 'Year to Date' },
                      { id: 5, value: 'All Time' },
                      { id: 6, value: 'Custom' },
                    ]}
                    selectedValue={{ id: 1, value: 'Today' }}
                    onSelect={(value) => {
                      if (value.id === 6) {
                        //--
                      }
                    }}
                  />
                )}
              </div>
              <div className="h-px bg-gray-200"></div>
              <div id="canvas1122" className="w-full">
                <div className="h-[300px]">
                  <HorizontalBarGraph
                    widthCls={'100%'}
                    heightCls={'240px'}
                    type={'bar'}
                    label={null}
                    displayLegend={false}
                    yAxisLabelsAppendFront={'$'}
                    dataSets={memoizedARByPracticeGraphData.graphDataSet}
                    data={
                      memoizedARByPracticeGraphData.paymentsByDayGraphDataSet
                    }
                    dateLabels={memoizedARByPracticeGraphData.graphDataLabel}
                  >
                    <></>
                  </HorizontalBarGraph>
                </div>
              </div>
            </div>
          </div>
          <div className="flex w-[30%] flex-col gap-4 rounded-lg border border-gray-300 bg-white p-4 text-gray-700 shadow ">
            <div className="flex  flex-col gap-4">
              <div className="flex gap-2">
                <div className="text-base font-bold leading-normal ">
                  {'Denial Remark Codes:'}
                </div>
                {!isExport && (
                  <ChevronDropdown
                    data={[
                      { id: 1, value: 'Today' },
                      { id: 2, value: 'Last 7 Days' },
                      { id: 3, value: 'Month to Date' },
                      { id: 4, value: 'Year to Date' },
                      { id: 5, value: 'All Time' },
                      { id: 6, value: 'Custom' },
                    ]}
                    selectedValue={{ id: 1, value: 'Today' }}
                    onSelect={(value) => {
                      if (value.id === 6) {
                        //--
                      }
                    }}
                  />
                )}
              </div>
              <div className="h-px bg-gray-200"></div>
              <div id="canvas113" className="w-full">
                <div className="h-[300px]">
                  <HorizontalBarGraph
                    widthCls={'100%'}
                    heightCls={'240px'}
                    type={'bar'}
                    label={null}
                    displayLegend={false}
                    yAxisLabelsAppendFront={'$'}
                    dataSets={memoizedARByPracticeGraphData.graphDataSet}
                    data={
                      memoizedARByPracticeGraphData.paymentsByDayGraphDataSet
                    }
                    dateLabels={memoizedARByPracticeGraphData.graphDataLabel}
                  >
                    <></>
                  </HorizontalBarGraph>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex h-[320px] w-full gap-4">
          <div className="flex w-[50%] flex-col gap-4 rounded-lg border border-gray-300 bg-white p-4 text-gray-700 shadow ">
            <div className="flex  flex-col gap-4">
              <div className="flex gap-2">
                <div className="text-base font-bold leading-normal ">
                  {'Expected Denials:'}
                </div>
                {!isExport && (
                  <>
                    {' '}
                    <ChevronDropdown
                      data={[
                        { id: 1, value: 'Today' },
                        { id: 2, value: 'Last 7 Days' },
                        { id: 3, value: 'Month to Date' },
                        { id: 4, value: 'Year to Date' },
                        { id: 5, value: 'All Time' },
                        { id: 6, value: 'Custom' },
                      ]}
                      selectedValue={{ id: 1, value: 'Today' }}
                      onSelect={(value) => {
                        if (value.id === 6) {
                          //--
                        }
                      }}
                    />
                    <ChevronDropdown
                      data={[
                        { id: 1, value: 'Today' },
                        { id: 2, value: 'Last 7 Days' },
                        { id: 3, value: 'Month to Date' },
                        { id: 4, value: 'Year to Date' },
                        { id: 5, value: 'All Time' },
                        { id: 6, value: 'Custom' },
                      ]}
                      selectedValue={{ id: 1, value: 'insurance' }}
                      onSelect={(value) => {
                        if (value.id === 6) {
                          //--
                        }
                      }}
                    />{' '}
                  </>
                )}
              </div>
              <div className="h-px bg-gray-200"></div>
              <div id="canvas114" className="w-full">
                <div className="">
                  <HorizontalBarGraph
                    widthCls={'100%'}
                    heightCls={'240px'}
                    type={'bar'}
                    label={null}
                    displayLegend={false}
                    yAxisLabelsAppendFront={'$'}
                    dataSets={memoizedARByPracticeGraphData.graphDataSet}
                    data={
                      memoizedARByPracticeGraphData.paymentsByDayGraphDataSet
                    }
                    dateLabels={memoizedARByPracticeGraphData.graphDataLabel}
                  >
                    <></>
                  </HorizontalBarGraph>
                </div>
              </div>
            </div>
          </div>
          <div className="flex w-[50%] flex-col gap-4 rounded-lg border border-gray-300 bg-white p-4 text-gray-700 shadow ">
            <div className="flex  flex-col gap-4">
              <div className="flex gap-2">
                <div className="text-base font-bold leading-normal ">
                  {'Unexpected Denials'}
                </div>
                {!isExport && (
                  <>
                    <ChevronDropdown
                      data={[
                        { id: 1, value: 'Today' },
                        { id: 2, value: 'Last 7 Days' },
                        { id: 3, value: 'Month to Date' },
                        { id: 4, value: 'Year to Date' },
                        { id: 5, value: 'All Time' },
                        { id: 6, value: 'Custom' },
                      ]}
                      selectedValue={{ id: 1, value: 'Today' }}
                      onSelect={(value) => {
                        if (value.id === 6) {
                          //--
                        }
                      }}
                    />
                    <ChevronDropdown
                      data={[
                        { id: 1, value: 'Today' },
                        { id: 2, value: 'Last 7 Days' },
                        { id: 3, value: 'Month to Date' },
                        { id: 4, value: 'Year to Date' },
                        { id: 5, value: 'All Time' },
                        { id: 6, value: 'Custom' },
                      ]}
                      selectedValue={{ id: 1, value: 'insurance' }}
                      onSelect={(value) => {
                        if (value.id === 6) {
                          //--
                        }
                      }}
                    />{' '}
                  </>
                )}
              </div>
              <div className="h-px bg-gray-200"></div>
              <div id="canvas115" className="w-full">
                <div className="h-[300px]">
                  <HorizontalBarGraph
                    widthCls={'100%'}
                    heightCls={'240px'}
                    type={'bar'}
                    label={null}
                    displayLegend={false}
                    yAxisLabelsAppendFront={'$'}
                    dataSets={memoizedARByPracticeGraphData.graphDataSet}
                    data={
                      memoizedARByPracticeGraphData.paymentsByDayGraphDataSet
                    }
                    dateLabels={memoizedARByPracticeGraphData.graphDataLabel}
                  >
                    <></>
                  </HorizontalBarGraph>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="arManager4" className="flex flex-col gap-4">
        <div className="flex h-[320px] w-full gap-4">
          <div className="flex w-[50%] flex-col gap-4 rounded-lg border border-gray-300 bg-white p-4 text-gray-700 shadow ">
            <div className="flex  flex-col gap-4">
              <div className="flex gap-2">
                <div className="text-base font-bold leading-normal ">
                  {'Denials by Insurance Type - Dollar Amount'}
                </div>
              </div>
              <div className="h-px bg-gray-200"></div>
              <div id="canvas114" className="w-full">
                <div className="">
                  <HorizontalBarGraph
                    widthCls={'100%'}
                    heightCls={'240px'}
                    type={'bar'}
                    label={null}
                    displayLegend={false}
                    dataSets={
                      memorizedARByInsuranceByTypeGraphData.graphDataSet
                    }
                    data={
                      memorizedARByInsuranceByTypeGraphData.paymentsByDayGraphDataSet
                    }
                    yAxisLabelsAppendFront={'$'}
                    dateLabels={
                      memorizedARByInsuranceByTypeGraphData.graphDataLabel
                    }
                  >
                    <></>
                  </HorizontalBarGraph>
                </div>
              </div>
            </div>
          </div>
          <div className="flex w-[50%] flex-col gap-4 rounded-lg border border-gray-300 bg-white p-4 text-gray-700 shadow ">
            <div className="flex  flex-col gap-4">
              <div className="flex gap-2">
                <div className="text-base font-bold leading-normal ">
                  {'Denials by Insurance Type - Count'}
                </div>
              </div>
              <div className="h-px bg-gray-200"></div>
              <div id="canvas115" className="w-full">
                <div className="h-[300px]">
                  <HorizontalBarGraph
                    widthCls={'100%'}
                    heightCls={'240px'}
                    type={'bar'}
                    label={null}
                    displayLegend={false}
                    dataSets={
                      memorizedARByInsuranceByTypeGraphData.graphDataSet
                    }
                    data={
                      memorizedARByInsuranceByTypeGraphData.paymentsByDayGraphDataSet
                    }
                    yAxisLabelsAppendFront={'$'}
                    dateLabels={
                      memorizedARByInsuranceByTypeGraphData.graphDataLabel
                    }
                  >
                    <></>
                  </HorizontalBarGraph>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex h-[320px] w-full flex-col gap-4 rounded-lg border border-gray-300 bg-white p-4 text-gray-700 shadow ">
          <div className="flex gap-2">
            <div className="text-base font-bold leading-normal ">
              {'Denied Claims by Parameter x Time:'}
            </div>
            {!isExport && (
              <>
                <ChevronDropdown
                  data={[
                    { id: 1, value: 'Today' },
                    { id: 2, value: 'Last 7 Days' },
                    { id: 3, value: 'Month to Date' },
                    { id: 4, value: 'Year to Date' },
                    { id: 5, value: 'All Time' },
                    { id: 6, value: 'Custom' },
                  ]}
                  selectedValue={{ id: 1, value: 'User' }}
                  onSelect={(value) => {
                    if (value.id === 6) {
                      //--
                    }
                  }}
                />
                <ChevronDropdown
                  data={[
                    { id: 1, value: 'Today' },
                    { id: 2, value: 'Last 7 Days' },
                    { id: 3, value: 'Month to Date' },
                    { id: 4, value: 'Year to Date' },
                    { id: 5, value: 'All Time' },
                    { id: 6, value: 'Custom' },
                  ]}
                  selectedValue={{ id: 1, value: 'Today' }}
                  onSelect={(value) => {
                    if (value.id === 6) {
                      //--
                    }
                  }}
                />
              </>
            )}
          </div>
          <div className="h-px bg-gray-200"></div>
          <div className="no-scrollbar flex flex-col justify-between overflow-auto rounded-lg border border-gray-200 px-4 py-1">
            {deniedClaimsByTime.map((m) => (
              <div key={m.id} className="flex flex-col">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-1">
                    <div className="flex items-center justify-center">
                      {!isExport && (
                        <img
                          className={classNames(
                            'w-6 h-6 relative bg-gray-100 rounded-3xl'
                          )}
                          src={defaultUserUrl}
                        />
                      )}
                    </div>
                    <div className="text-sm font-normal leading-tight text-gray-700">
                      {' '}
                      {m.name}{' '}
                    </div>
                    <div className="text-xs font-normal leading-none text-gray-500">
                      {' '}
                      {` - ${m.role}`}{' '}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-base font-bold leading-normal text-gray-700">
                      {m.lastCount}
                    </div>
                    <div
                      className={classNames(
                        `text-${
                          getDeniedCliamsByTimeCountColors(m.count, m.lastCount)
                            .color
                        }-600 text-base font-bold leading-normal`
                      )}
                    >
                      {m.count}
                      {!isExport && (
                        <Icon
                          name={
                            getDeniedCliamsByTimeCountColors(
                              m.count,
                              m.lastCount
                            ).icon
                          }
                        />
                      )}
                    </div>
                    <div
                      className="cursor-pointer text-xs font-normal leading-none text-cyan-500 underline"
                      onClick={() => {
                        setDenialDetailsOpen(true);
                      }}
                    >
                      View Details
                    </div>
                  </div>
                </div>
                {m.id !==
                  deniedClaimsByTime[deniedClaimsByTime.length - 1]?.id && (
                  <div className="h-px bg-gray-200"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div id="arManager5" className="flex flex-col gap-4">
        <div className="text-base font-bold leading-normal text-gray-700">
          Rejections
        </div>
        <div className="flex h-[320px] w-full gap-4">
          <div className="flex w-[50%] flex-col gap-4 rounded-lg border border-gray-300 bg-white p-4 text-gray-700 shadow ">
            <div className="flex  flex-col gap-4">
              <div className="flex gap-2">
                <div className="text-base font-bold leading-normal ">
                  {'Denied Claims by Time:'}
                </div>
                {!isExport && (
                  <ChevronDropdown
                    data={[
                      { id: 1, value: 'Today' },
                      { id: 2, value: 'Last 7 Days' },
                      { id: 3, value: 'Month to Date' },
                      { id: 4, value: 'Year to Date' },
                      { id: 5, value: 'All Time' },
                      { id: 6, value: 'Custom' },
                    ]}
                    selectedValue={{
                      id: 1,
                      value: 'User',
                    }}
                    onSelect={(value) => {
                      if (value.id === 6) {
                        //--
                      }
                    }}
                  />
                )}
              </div>
              <div className="h-px bg-gray-200"></div>
              <div id="canvas1111" className="w-full">
                <div className="">
                  <GraphWithAnnotations
                    widthCls={'100%'}
                    heightCls={'240px'}
                    type={'line'}
                    label={null}
                    displayLegend={false}
                    dataSets={memoizedAverageClaimRevenueGraphData.graphDataSet}
                    data={
                      memoizedAverageClaimRevenueGraphData.paymentsByDayGraphDataSet
                    }
                    dateLabels={
                      memoizedAverageClaimRevenueGraphData.graphDataLabel
                    }
                    // annotationValue={5000}
                    annotations={{ annotation1, annotation2 }}
                  >
                    <></>
                  </GraphWithAnnotations>
                </div>
              </div>
            </div>
          </div>
          <div className="flex w-[50%] flex-col gap-4 rounded-lg border border-gray-300 bg-white p-4 text-gray-700 shadow ">
            <div className="flex  flex-col gap-4">
              <div className="flex gap-2">
                <div className="text-base font-bold leading-normal ">
                  {'Denial Reason Codes:'}
                </div>
                {!isExport && (
                  <ChevronDropdown
                    data={[
                      { id: 1, value: 'Today' },
                      { id: 2, value: 'Last 7 Days' },
                      { id: 3, value: 'Month to Date' },
                      { id: 4, value: 'Year to Date' },
                      { id: 5, value: 'All Time' },
                      { id: 6, value: 'Custom' },
                    ]}
                    selectedValue={{ id: 1, value: 'Today' }}
                    onSelect={(value) => {
                      if (value.id === 6) {
                        //--
                      }
                    }}
                  />
                )}
              </div>
              <div className="h-px bg-gray-200"></div>
              <div id="canvas112" className="w-full">
                <div className="h-[300px]">
                  <HorizontalBarGraph
                    widthCls={'100%'}
                    heightCls={'240px'}
                    type={'bar'}
                    label={null}
                    displayLegend={false}
                    yAxisLabelsAppendFront={'$'}
                    dataSets={memoizedARByPracticeGraphData.graphDataSet}
                    data={
                      memoizedARByPracticeGraphData.paymentsByDayGraphDataSet
                    }
                    dateLabels={memoizedARByPracticeGraphData.graphDataLabel}
                  >
                    <></>
                  </HorizontalBarGraph>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex h-[320px] w-full flex-col gap-4 rounded-lg border border-gray-300 bg-white p-4 text-gray-700 shadow ">
          <div className="flex gap-2">
            <div className="text-base font-bold leading-normal ">
              {'Rejected Claims by Parameter x Time:'}
            </div>
            {!isExport && (
              <>
                {' '}
                <ChevronDropdown
                  data={[
                    { id: 1, value: 'Today' },
                    { id: 2, value: 'Last 7 Days' },
                    { id: 3, value: 'Month to Date' },
                    { id: 4, value: 'Year to Date' },
                    { id: 5, value: 'All Time' },
                    { id: 6, value: 'Custom' },
                  ]}
                  selectedValue={{ id: 1, value: 'User' }}
                  onSelect={(value) => {
                    if (value.id === 6) {
                      //--
                    }
                  }}
                />
                <ChevronDropdown
                  data={[
                    { id: 1, value: 'Today' },
                    { id: 2, value: 'Last 7 Days' },
                    { id: 3, value: 'Month to Date' },
                    { id: 4, value: 'Year to Date' },
                    { id: 5, value: 'All Time' },
                    { id: 6, value: 'Custom' },
                  ]}
                  selectedValue={{ id: 1, value: 'Today' }}
                  onSelect={(value) => {
                    if (value.id === 6) {
                      //--
                    }
                  }}
                />
              </>
            )}
          </div>
          <div className="h-px bg-gray-200"></div>
          <div className="no-scrollbar flex flex-col justify-between overflow-auto rounded-lg border border-gray-200 px-4 py-1">
            {deniedClaimsByTime.map((m) => (
              <div key={m.id} className="flex flex-col">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-1">
                    <div className="flex items-center justify-center">
                      {!isExport && (
                        <img
                          className={classNames(
                            'w-6 h-6 relative bg-gray-100 rounded-3xl'
                          )}
                          src={defaultUserUrl}
                        />
                      )}
                    </div>
                    <div className="text-sm font-normal leading-tight text-gray-700">
                      {' '}
                      {m.name}{' '}
                    </div>
                    <div className="text-xs font-normal leading-none text-gray-500">
                      {' '}
                      {` - ${m.role}`}{' '}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-base font-bold leading-normal text-gray-700">
                      {m.lastCount}
                    </div>
                    <div
                      className={classNames(
                        `text-${
                          getDeniedCliamsByTimeCountColors(m.count, m.lastCount)
                            .color
                        }-600 text-base font-bold leading-normal`
                      )}
                    >
                      {m.count}
                      {!isExport && (
                        <Icon
                          name={
                            getDeniedCliamsByTimeCountColors(
                              m.count,
                              m.lastCount
                            ).icon
                          }
                        />
                      )}
                    </div>
                    <div
                      className="cursor-pointer text-xs font-normal leading-none text-cyan-500 underline"
                      onClick={() => {
                        setRejectionDetailsOpen(true);
                      }}
                    >
                      View Details
                    </div>
                  </div>
                </div>
                {m.id !==
                  deniedClaimsByTime[deniedClaimsByTime.length - 1]?.id && (
                  <div className="h-px bg-gray-200"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Modal
        open={collectedAmountModal}
        onClose={() => {}}
        modalContentClassName="relative h-[calc(100%-80px)] w-[calc(100%-350px)] overflow-y-auto rounded-lg bg-white shadow-xl transition-all sm:my-8 w-full"
      >
        <div className="flex flex-col bg-gray-100">
          <div className="mt-3 max-w-full p-4">
            <div className="flex flex-row justify-between">
              <div>
                <h1 className=" ml-2  text-left text-xl font-bold leading-7 text-gray-700">
                  Collected Amount
                </h1>
              </div>
              <div className="">
                <CloseButton
                  onClick={() => {
                    setCollectedAmountModal(false);
                  }}
                />
              </div>
            </div>
            <div className="mt-3 h-px w-full bg-gray-300" />
          </div>
          <div className="flex flex-col">
            <div className="w-full flex-1 overflow-y-auto bg-gray-100">
              <div className="flex">
                <div className="w-full self-center break-words p-6 text-justify text-sm text-gray-500">
                  <SearchDetailGrid
                    pageNumber={lastSearchCriteria.pageNumber}
                    pageSize={lastSearchCriteria.pageSize}
                    totalCount={collectedAmountTotalCount}
                    rows={collectAmountGridData}
                    columns={collectedAmountColumns}
                    checkboxSelection={false}
                    onPageChange={(page: number) => {
                      const obj: GetPaymentReportCriteria = {
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
                      if (collectAmountGridData.length) {
                        const obj: GetPaymentReportCriteria = {
                          ...lastSearchCriteria,
                          sortByColumn: field || '',
                          sortOrder: sort || '',
                        };
                        setLastSearchCriteria(obj);
                        getSearchData(obj);
                      }
                    }}
                    onPageSizeChange={(pageSize: number, page: number) => {
                      if (collectAmountGridData.length) {
                        const obj: GetPaymentReportCriteria = {
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
      </Modal>
      <Modal
        open={isClaimModalOpen.open}
        onClose={() => {}}
        modalContentClassName="h-[calc(100%-80px)] w-[calc(100%-220px)] relative rounded-lg bg-white shadow-xl transition-all sm:my-8"
      >
        <ClaimSearchGridPopup
          claimSearchCriteria={isClaimModalOpen.claimSearchCriteria}
          headerClaimStatus={isClaimModalOpen.header}
          type={isClaimModalOpen.type}
          onClose={() => {
            setClaimModalOpen({
              open: false,
              claimSearchCriteria: undefined,
              header: '',
              type: '',
            });
          }}
        />
      </Modal>
      <Modal
        open={isCustomDateModalOpen.open}
        onClose={() => {}}
        modalContentClassName=" w-[calc(40%)] relative rounded-lg bg-white shadow-xl transition-all sm:my-8"
      >
        <CustomDateSelectionModal
          onClose={() => {
            setCustomDateModalOpen({
              open: false,
              type: '',
            });
          }}
          onClickSave={(fromDate, toDate, type) => {
            if (type === 'CollectedAmount') {
              setCollectedAmountCustomDate({
                toDate,
                fromDate,
              });
              getCollectedAmountsDataResult({
                groupID: selectedWorkedGroup?.groupsData[0]?.id,
                fromPostingDate: fromDate || undefined,
                toPostingDate: toDate || undefined,
              });
            }
          }}
          label="Custom Date Selection"
          type={isCustomDateModalOpen.type}
        />
      </Modal>
      <Modal
        open={isDenialDetailsOpen}
        onClose={() => {}}
        modalContentClassName="h-[calc(100%-80px)] w-[calc(100%-350px)] relative rounded-lg bg-white shadow-xl transition-all sm:my-8"
      >
        <DenialDetailModal
          onClose={() => {
            setDenialDetailsOpen(false);
          }}
        />
      </Modal>
      <Modal
        open={isRejectionDetailsOpen}
        onClose={() => {}}
        modalContentClassName="h-[calc(100%-80px)] w-[calc(100%-350px)] relative rounded-lg bg-white shadow-xl transition-all sm:my-8"
      >
        <RejectionDetailModal
          onClose={() => {
            setRejectionDetailsOpen(false);
          }}
        />
      </Modal>
      {openAddUpdateBatchModealInfo?.type && (
        <>
          {['detail', 'updateFromDetail'].includes(
            openAddUpdateBatchModealInfo?.type
          ) && (
            <DetailPaymentBatch
              open={true}
              batchId={openAddUpdateBatchModealInfo.id}
              refreshDetailView={refreshDetailView}
              onClose={() => {
                setOpenAddUpdateBatchModealInfo(undefined);
              }}
              onEdit={() => {
                setOpenAddUpdateBatchModealInfo({
                  ...openAddUpdateBatchModealInfo,
                  type: 'updateFromDetail',
                });
              }}
            />
          )}
          {['update', 'updateFromDetail'].includes(
            openAddUpdateBatchModealInfo?.type
          ) && (
            <AddPaymentBatch
              open={true}
              batchId={openAddUpdateBatchModealInfo.id}
              hideBackdrop={['updateFromDetail'].includes(
                openAddUpdateBatchModealInfo.type
              )}
              onClose={(isAddedUpdated) => {
                // if is added or update, refresh listing data
                // if (isAddedUpdated && isChangedJson) {
                //   getSearchData(lastSearchCriteria);
                // }
                // if 'updateFromDetail' type present then open DetailPaymentBatch model
                // else close both modals
                if (openAddUpdateBatchModealInfo.type === 'updateFromDetail') {
                  if (isAddedUpdated) {
                    setRefreshDetailView('refresh');
                  }
                  setOpenAddUpdateBatchModealInfo({
                    ...openAddUpdateBatchModealInfo,
                    type: 'detail',
                  });
                } else {
                  setOpenAddUpdateBatchModealInfo(undefined);
                }
              }}
            />
          )}
        </>
      )}
      {openAddUpdateERAModealInfo.open && openAddUpdateERAModealInfo.id && (
        <>
          <DetailPaymentERA
            open={openAddUpdateERAModealInfo.open}
            eraId={openAddUpdateERAModealInfo.id}
            onClose={() => {
              setOpenAddUpdateERAModealInfo({ open: false });
            }}
          />
        </>
      )}
    </div>
  );
};

export default ARManagerDashboard;
