import jsPDF from 'jspdf';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Icon from '@/components/Icon';
import Tabs from '@/components/OrganizationSelector/Tabs';
import AppDatePicker from '@/components/UI/AppDatePicker';
import Breadcrumbs from '@/components/UI/Breadcrumbs/breadcrumbs';
import Button, { ButtonType } from '@/components/UI/Button';
import type { ButtonSelectDropdownDataType } from '@/components/UI/ButtonSelectDropdown';
import ButtonSelectDropdownForExport from '@/components/UI/ButtonSelectDropdownForExport';
import BarGraph from '@/components/UI/Graphs/BarGraph';
import MultiSelectDropDown from '@/components/UI/MultiSelectDropDown';
import type { PopoverDropdownDataType } from '@/components/UI/PopoverDropdown/Index';
import PopoverDropdown from '@/components/UI/PopoverDropdown/Index';
import type { SingleSelectDropDownDataType } from '@/components/UI/SingleSelectDropDown';
import SingleSelectDropDown from '@/components/UI/SingleSelectDropDown';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import AppLayout from '@/layouts/AppLayout';
import store from '@/store';
import { getselectdWorkGroupsIDsSelector } from '@/store/chrome/selectors';
import type { FacilitiesData } from '@/store/chrome/types';
// import { getSelectedMenuItemSelector } from '@/store/login/selectors';
import {
  addToastNotification,
  fetchFacilityDataRequest,
  fetchPracticeDataRequest,
  fetchProviderDataRequest,
  setAppSpinner,
} from '@/store/shared/actions';
import { getMonthlySummaryReportData } from '@/store/shared/sagas';
import {
  getFacilityDataSelector,
  getPracticeDataSelector,
  getProviderDataSelector,
} from '@/store/shared/selectors';
import type {
  MonthlySummaryReportCriteria,
  MonthlySummaryReportData,
  PracticeData,
  ProviderData,
} from '@/store/shared/types';
import { ToastType } from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';
import { DateToStringPipe } from '@/utils/dateConversionPipes';

import ARManagerDashboard from './ARDashboard/ARManagerDashboard';

const MonthlySummaryReport = () => {
  const dispatch = useDispatch();
  const [isDateActive, setIsDateActive] = useState(true);
  const projectectionActionData = [
    { id: 1, title: 'Charges', showBottomDivider: false },
    { id: 2, title: 'Adjustments', showBottomDivider: false },
    { id: 3, title: 'Payments', showBottomDivider: false },
    { id: 4, title: 'Refunds', showBottomDivider: false },
    { id: 5, title: 'Bad Debt', showBottomDivider: false },
    { id: 6, title: 'Visits', showBottomDivider: false },
    { id: 7, title: 'Average Charges', showBottomDivider: false },
    { id: 8, title: 'Receipts', showBottomDivider: false },
    { id: 9, title: 'Beginning', showBottomDivider: false },
    { id: 10, title: 'Ending', showBottomDivider: false },
    { id: 11, title: 'Net', showBottomDivider: false },
    { id: 12, title: 'Gross', showBottomDivider: false },
    { id: 13, title: 'Net Percentage', showBottomDivider: false },
  ];
  const [selectedComparisonValue, setSelectedComparisonValue] = useState<
    PopoverDropdownDataType | undefined
  >(projectectionActionData.filter((m) => m.id === 1)[0]);
  // const [isChangedJson, setIsChangedJson] = useState(false);
  const [selectedGaphJSON, setSelectedGaphJSON] = useState<{
    charges: number[];
    payments: number[];
    adjustments: number[];
    labels: string[];
    days: number[];
    beginning: number[];
    ending: number[];
    net: number[];
    gross: number[];
    refunds: number[];
    badDebt: number[];
    visits: number[];
    averageCharges: number[];
    receipts: number[];
    netPercentage: number[];
    trailingSixMonthNet: number[];
    trailingSixMonthGross: number[];
    trailingTwelveMonthNet: number[];
    trailingTwelveMonthGross: number[];
    chargesProjection: number[];
    adjustmentsProjection: number[];
    paymentsProjection: number[];
    refundsProjection: number[];
    badDebtProjection: number[];
    visitsProjection: number[];
    averageChargesProjection: number[];
    receiptsProjection: number[];
    beginningProjection: number[];
    endingProjection: number[];
    netProjection: number[];
    daysProjection: number[];
    grossProjection: number[];
    netPercentageProjection: number[];
    actual: number[];
    projection: number[];
  }>();
  const selectedWorkedGroup = useSelector(getselectdWorkGroupsIDsSelector);
  const defaultSearchCriteria: MonthlySummaryReportCriteria = {
    groupID: selectedWorkedGroup?.groupsData[0]?.id || null,
    providerIDs: [],
    facilityIDs: [],
    practiceIDs: [],
    fromDate: new Date(new Date().getFullYear() - 1, new Date().getMonth(), 1)
      .toLocaleDateString()
      .slice(0, 10),
    toDate: new Date(new Date().setMonth(new Date().getMonth(), 0))
      .toLocaleDateString()
      .slice(0, 10),
  };
  const [searchCriteria, setSearchCriteria] = useState(defaultSearchCriteria);
  const setSearchCriteriaFields = (value: MonthlySummaryReportCriteria) => {
    setSearchCriteria(value);
    // setIsChangedJson(true);
  };
  const onSelectProviders = (arr: SingleSelectDropDownDataType[]) => {
    setSearchCriteriaFields({
      ...searchCriteria,
      providerIDs: arr.map((Item) => Item.id.toString()),
    });
  };
  const onSelectPractices = (arr: SingleSelectDropDownDataType[]) => {
    setSearchCriteriaFields({
      ...searchCriteria,
      practiceIDs: arr.map((Item) => Item.id.toString()),
    });
  };
  const onSelectFacilities = (arr: SingleSelectDropDownDataType[]) => {
    setSearchCriteriaFields({
      ...searchCriteria,
      facilityIDs: arr.map((Item) => Item.id.toString()),
    });
  };
  const [hideSearchParameters, setHideSearchParameters] =
    useState<boolean>(true);
  const [providerDropdown, setProviderDropdown] = useState<ProviderData[]>([]);
  const [practiceDropdown, setPracticeDropdown] = useState<PracticeData[]>([]);
  const [facilityDropdown, setFacilityDropdown] = useState<FacilitiesData[]>(
    []
  );

  const ProviderData = useSelector(getProviderDataSelector);
  useEffect(() => {
    if (ProviderData) {
      setProviderDropdown(ProviderData);
    }
  }, [ProviderData]);
  const PracticeData = useSelector(getPracticeDataSelector);
  const [searchResult, setSearchResult] = useState<MonthlySummaryReportData[]>(
    []
  );
  useEffect(() => {
    if (PracticeData) {
      setPracticeDropdown(PracticeData);
    }
  }, [PracticeData]);
  const facilityData = useSelector(getFacilityDataSelector);
  useEffect(() => {
    if (facilityData) {
      setFacilityDropdown(facilityData);
    }
  }, [facilityData]);
  const dateRangeData = [
    { id: 1, value: 'Current Month', numberOfDays: 30 },
    { id: 2, value: 'Previous & Current Month', numberOfDays: 60 },
    { id: 3, value: 'Year to Date', numberOfDays: 365 },
    { id: 4, value: 'Last 12 Months', numberOfDays: 365 },
    { id: 5, value: 'Last 24 Months', numberOfDays: 730 },
    { id: 6, value: 'All Time', numberOfDays: 0 },
    { id: 7, value: 'Custom', numberOfDays: 0 },
  ];
  const [selectedDateRange, setSelectedDateRange] = useState<
    | {
        id: number;
        value: string;
        numberOfDays: number;
      }
    | undefined
  >(dateRangeData[3]);
  useEffect(() => {
    let startDate: Date | null = null;
    let endDate: Date | null = null;
    if (selectedDateRange?.id === 1) {
      startDate = new Date();
      startDate.setDate(1); // Set the day of the month to 1
      endDate = new Date(); // Set the end date to the current date
    }
    if (selectedDateRange?.id === 6) {
      endDate = new Date(); // Set the end date to the current date
    }
    if (selectedDateRange?.id === 3) {
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear(), 0, 1); // Set the day of the month to 1
      endDate = new Date();
    }
    if (selectedDateRange?.id === 7) {
      setIsDateActive(false);
    } else {
      setIsDateActive(true);
    }
    if (selectedDateRange?.id === 2) {
      startDate = new Date();
      endDate = new Date();
      const { numberOfDays } = selectedDateRange;
      const dateOffset = 24 * 60 * 60 * 1000 * numberOfDays;
      startDate.setTime(startDate.getTime() - dateOffset);
    }
    if (
      selectedDateRange &&
      selectedDateRange.id !== 1 &&
      selectedDateRange.id !== 2 &&
      selectedDateRange.id !== 6 &&
      selectedDateRange.id !== 7 &&
      selectedDateRange.id !== 3
    ) {
      startDate = new Date();
      endDate = new Date();
      const { numberOfDays } = selectedDateRange;
      startDate.setDate(1); // Set the day of the month to 1
      startDate.setMonth(startDate.getMonth());
      endDate.setDate(0); // Set to the last day of the previous month
      // startDate.setHours(0, 0, 0, 0); // Set the time to midnight
      const dateOffset = 24 * 60 * 60 * 1000 * numberOfDays;
      startDate.setTime(startDate.getTime() - dateOffset);
    }
    setSearchCriteriaFields({
      ...searchCriteria,
      toDate: DateToStringPipe(endDate, 1),
      fromDate: DateToStringPipe(startDate, 1),
    });
  }, [selectedDateRange, selectedWorkedGroup]);
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
  const [statusModalInfo, setStatusModalInfo] = useState({
    show: false,
    heading: '',
    text: '',
    type: StatusModalType.WARNING,
  });
  const getSearchData = async (obj: MonthlySummaryReportCriteria) => {
    const res = await getMonthlySummaryReportData(obj);
    if (res) {
      setSearchResult(res);
      const filterRes = res.filter(
        (m) => m.month !== 'Total' && m.month !== 'AVG'
      );
      setSelectedGaphJSON({
        charges: filterRes.map((m) => m.charges || 0),
        payments: filterRes.map((m) => m.payments || 0),
        adjustments: filterRes.map((m) => m.adjustments || 0),
        labels: filterRes.map((m) => m.month?.toString() || '0'),
        days: filterRes.map((m) => m.days || 0),
        beginning: filterRes.map((m) => m.beginning || 0),
        ending: filterRes.map((m) => m.ending || 0),
        net: filterRes.map((m) => m.net || 0),
        gross: filterRes.map((m) => m.gross || 0),
        trailingSixMonthNet: filterRes.map((m) => m.trailingSixMonthNet || 0),
        trailingSixMonthGross: filterRes.map(
          (m) => m.trailingSixMonthGross || 0
        ),
        trailingTwelveMonthNet: filterRes.map(
          (m) => m.trailingTwelveMonthNet || 0
        ),
        trailingTwelveMonthGross: filterRes.map(
          (m) => m.trailingTwelveMonthGross || 0
        ),
        netPercentage: filterRes.map((m) => m.netPercentage || 0),
        refunds: filterRes.map((m) => m.refunds || 0),
        badDebt: filterRes.map((m) => m.badDebt || 0),
        visits: filterRes.map((m) => m.visits || 0),
        averageCharges: filterRes.map((m) => m.averageCharges || 0),
        receipts: filterRes.map((m) => m.receipts || 0),
        chargesProjection: filterRes.map((m) => m.chargesProjection || 0),
        adjustmentsProjection: filterRes.map(
          (m) => m.adjustmentsProjection || 0
        ),
        paymentsProjection: filterRes.map((m) => m.paymentsProjection || 0),
        refundsProjection: filterRes.map((m) => m.refundsProjection || 0),
        badDebtProjection: filterRes.map((m) => m.badDebtProjection || 0),
        visitsProjection: filterRes.map((m) => m.visitsProjection || 0),
        averageChargesProjection: filterRes.map(
          (m) => m.averageChargesProjection || 0
        ),
        receiptsProjection: filterRes.map((m) => m.receiptsProjection || 0),
        beginningProjection: filterRes.map((m) => m.beginningProjection || 0),
        endingProjection: filterRes.map((m) => m.endingProjection || 0),
        netProjection: filterRes.map((m) => m.netProjection || 0),
        daysProjection: filterRes.map((m) => m.daysProjection || 0),
        grossProjection: filterRes.map((m) => m.grossProjection || 0),
        netPercentageProjection: filterRes.map(
          (m) => m.netPercentageProjection || 0
        ),
        actual: filterRes.map((m) => m.charges || 0),
        projection: filterRes.map((m) => m.adjustmentsProjection || 0),
      });
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
  useEffect(() => {
    if (selectedWorkedGroup) {
      let searchCriteriaObj: MonthlySummaryReportCriteria = {
        ...searchCriteria,
        groupID: selectedWorkedGroup?.groupsData[0]?.id || null,
      };
      if (selectedWorkedGroup?.groupsData[0]?.id) {
        dispatch(
          fetchPracticeDataRequest({
            groupID: selectedWorkedGroup?.groupsData[0]?.id,
          })
        );
        dispatch(
          fetchProviderDataRequest({
            groupID: selectedWorkedGroup?.groupsData[0]?.id,
          })
        );
        dispatch(
          fetchFacilityDataRequest({
            groupID: selectedWorkedGroup?.groupsData[0]?.id,
          })
        );
        searchCriteriaObj = defaultSearchCriteria;
        setSelectedDateRange(dateRangeData[3]);
        setSearchResult([]);
      }
      setSearchCriteria(searchCriteriaObj);
      const obj = {
        ...searchCriteriaObj,
        sortColumn: '',
        sortOrder: '',
        pageNumber: 1,
      };
      getSearchData(obj);
    }
  }, [selectedWorkedGroup]);
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
  // const initProfile = () => {
  //   onClickSearch();
  // };
  // useEffect(() => {
  //   initProfile();
  // }, []);

  // const removeAndCloneElement = (elementId: string) => {
  //   const element = document.getElementById(elementId);
  //   let clone = null;
  //   let originalParent = null;
  //   if (element) {
  //     clone = element.cloneNode(true);
  //     originalParent = element.parentNode;
  //     element.remove();
  //   }
  //   return { clone, originalParent };
  // };
  const tabs = [
    {
      id: 1,
      name: 'Financial Snapshot',
    },
    {
      id: 2,
      name: 'AR Manager Dashboard',
    },
  ];
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState(tabs[0]);
  // const isMenuSelected = useSelector(getSelectedMenuItemSelector);
  // useEffect(() => {
  //   if (isMenuSelected && isMenuSelected?.title === 'AR Manager Dashboard') {
  //     setCurrentTab(tabs[1]);
  //   }
  // }, [isMenuSelected]);
  useEffect(() => {
    const {
      query: { tab },
    } = router;

    if (tab) {
      const tabId = parseInt(tab as string, 10);
      if (tabId === 2) {
        setCurrentTab(tabs[1]);
      }
    }
  }, [router]);
  const [refreshARManagerDashboard, setRefreshARManagerDashboard] =
    useState<string>();
  const handleTabChange = (tab: any) => {
    setCurrentTab(tab);
    if (tab.id === 1) {
      setRefreshARManagerDashboard('refresh');
    }
    const currentPath = router.pathname;
    const newPath = tab.id === 2 ? `${currentPath}?tab=${tab.id}` : currentPath;
    router.push(newPath);
  };
  const [isArManagerExport, setArManagerExport] = useState(false);
  const downloadPdf = () => {
    store.dispatch(setAppSpinner(true));
    // eslint-disable-next-line new-cap
    const doc1 = new jsPDF('l', 'pt');
    const data1 = document.getElementById('canvas11');
    const data2 = document.getElementById('canvas12');
    const data3 = document.getElementById('canvas13');
    const data4 = document.getElementById('canvas14');
    const data5 = document.getElementById('canvas15');
    let pageSize = 0;
    document.body.style.scale = '1';
    if (data1) {
      doc1.html(data1, {
        x: 55,
        y: 55,
        callback(docc) {
          doc1.setFontSize(16);
          doc1.text('Monthly Summary - Financial Snapshot', 50, 33);
          docc.setPage(0);
          pageSize = doc1.internal.pageSize.height;
          if (data2) {
            doc1.html(data2, {
              x: 55,
              y: 318,
              callback(docc2) {
                docc2.setPage(0);
                docc2.addPage();
                if (data3) {
                  doc1.html(data3, {
                    x: 55,
                    y: pageSize + 55,
                    callback(docc3) {
                      docc3.setPage(1);
                      if (data4) {
                        doc1.html(data4, {
                          x: 55,
                          y: pageSize + 318,
                          callback(docc4) {
                            docc4.setPage(1);
                            docc4.addPage();
                            if (data5) {
                              doc1.html(data5, {
                                x: 55,
                                y: pageSize * 2 + 55,
                                callback(docc5) {
                                  docc5.setPage(2);
                                  docc5.save(
                                    'Monthly_Summary_Financial_Snapshot'
                                  );
                                },
                                width: 710,
                                windowWidth: data5.offsetWidth, // 1379,
                              });
                            }
                          },
                          width: 670,
                          windowWidth: data4.offsetWidth, // 1360,
                        });
                      }
                    },
                    width: 670,
                    windowWidth: data3.offsetWidth, // 1360,
                  });
                }
              },
              width: 670,
              windowWidth: data2.offsetWidth, // 1360,
            });
          }
        },
        width: 670,
        windowWidth: data1.offsetWidth, // 1378,
      });
    }
    store.dispatch(setAppSpinner(false));
    dispatch(
      addToastNotification({
        text: 'Export Successful',
        toastType: ToastType.SUCCESS,
        id: '',
      })
    );
  };
  // const popoverDateRange = [
  //   { id: 1, title: 'Current Month', showBottomDivider: false },
  //   { id: 2, title: 'Previous & Current Month', showBottomDivider: false },
  //   { id: 3, title: 'Year to Date', showBottomDivider: false },
  //   { id: 4, title: 'Last 12 Months', showBottomDivider: false },
  //   { id: 5, title: 'Last 24 Months', showBottomDivider: false },
  //   { id: 6, title: 'All Time', showBottomDivider: false },
  //   { id: 7, title: 'Custom', showBottomDivider: false },
  // ];
  const exportDropdownData: ButtonSelectDropdownDataType[] = [
    {
      id: 1,
      value: 'Export Report to PDF',
      icon: 'pdf',
    },
    // {
    //   id: 2,
    //   value: 'Export Report to CSV',
    // },
  ];
  const onSelectExportOption = (res: SingleSelectDropDownDataType[]) => {
    if (!searchResult.length) {
      setStatusModalInfo({
        ...statusModalInfo,
        show: true,
        heading: 'Alert',
        type: StatusModalType.WARNING,
        text: 'No Record to Export!',
      });
      return;
    }
    const id = res[0]?.id || 0;
    if (id === 1 && currentTab?.id === 1) {
      downloadPdf();
    } else if (id === 1 && currentTab?.id === 2) {
      setArManagerExport(true);
    }
  };
  useEffect(() => {
    if (refreshARManagerDashboard === 'refresh') {
      setRefreshARManagerDashboard(undefined);
    }
  }, [refreshARManagerDashboard]);
  return (
    <AppLayout title="Nucleus - Monthly Summary Report">
      <div className="relative m-0 h-full bg-gray-100 p-0">
        <div className="m-0 h-full w-full overflow-y-scroll bg-gray-100 p-0">
          <div className="flex h-full w-full flex-col">
            <div className="m-0 h-full w-full overflow-y-auto overflow-x-hidden bg-gray-100 p-0">
              <div className="h-[192px] w-full">
                <div className="absolute top-0 z-[11] w-full">
                  <Breadcrumbs />
                  <div className="relative w-full bg-white text-left">
                    <div className="flex items-start justify-between gap-4  px-7 pt-[33px] pb-[21px]">
                      <div className="flex h-[38px] gap-6">
                        <p className="self-center text-3xl font-bold text-cyan-700">
                          {selectedWorkedGroup?.groupsData[0]?.value ||
                            'Group Name'}
                        </p>
                      </div>
                      <div className="flex h-[38px]  items-center self-end px-6">
                        <ButtonSelectDropdownForExport
                          data={exportDropdownData}
                          onChange={onSelectExportOption}
                          isSingleSelect={true}
                          cls={'inline-flex'}
                          disabled={false}
                          buttonContent={
                            <button
                              className={classNames(
                                `bg-white inline-flex items-center justify-center gap-2 border border-solid border-gray-300 bg-white pt-[9px] pb-[9px] pl-[13px] pr-[17px] text-left font-medium leading-5 text-gray-700 transition-all rounded-md`
                              )}
                            >
                              <Icon name={'export'} size={18} />
                              <p className="text-sm">Export</p>
                            </button>
                          }
                        />
                      </div>
                    </div>

                    <div className={`px-[24px]`}>
                      <div className={`h-[1px] w-full bg-gray-200`} />
                    </div>
                    <div className="px-[24px] pt-[24px]">
                      <Tabs
                        tabs={tabs}
                        onChangeTab={(tab: any) => {
                          handleTabChange(tab);
                        }}
                        currentTab={currentTab}
                      />
                    </div>
                  </div>
                </div>
              </div>
              {currentTab?.id === 2 && (
                <ARManagerDashboard
                  refreshARManagerDashboard={refreshARManagerDashboard}
                  isExport={isArManagerExport}
                  onExport={(value) => {
                    if (value) {
                      setTimeout(() => {
                        setArManagerExport(false);
                      }, 5000);
                    }
                  }}
                />
              )}
              {currentTab?.id === 1 && (
                <>
                  <div className={'bg-gray-50 px-[25px] pb-[25px]'}>
                    {hideSearchParameters && (
                      <div className="pt-[20px]">
                        <div className="w-full">
                          <div className="flex w-full flex-wrap">
                            <div className="flex w-full gap-6">
                              <div className="w-[50%] lg:w-[50%]">
                                <div className="px-[5px] pb-[5px]">
                                  <p className="text-base font-bold leading-normal text-gray-700">
                                    Location
                                  </p>
                                </div>
                                <div className="flex w-full flex-wrap">
                                  <div className={`w-[33%] px-[5px]`}>
                                    <div className={` `}>
                                      <label className="text-sm font-medium leading-5 text-gray-900">
                                        Practices
                                      </label>
                                      <div className="">
                                        <MultiSelectDropDown
                                          placeholder="Select Practices"
                                          showSearchBar={true}
                                          disabled={false}
                                          data={practiceDropdown}
                                          selectedValue={practiceDropdown.filter(
                                            (m) =>
                                              searchCriteria.practiceIDs?.includes(
                                                m.id.toString()
                                              )
                                          )}
                                          onSelect={(value) => {
                                            onSelectPractices(value);
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  <div className={`w-[33%] px-[5px]`}>
                                    <div className={` `}>
                                      <label className="text-sm font-medium leading-5 text-gray-900">
                                        Facilities
                                      </label>
                                      <div className="">
                                        <MultiSelectDropDown
                                          placeholder="Select Facilities"
                                          showSearchBar={true}
                                          disabled={false}
                                          data={facilityDropdown}
                                          selectedValue={facilityDropdown.filter(
                                            (m) =>
                                              searchCriteria.facilityIDs?.includes(
                                                m.id.toString()
                                              )
                                          )}
                                          onSelect={(value) => {
                                            onSelectFacilities(value);
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  <div className={`w-[33%] px-[5px]`}>
                                    <div className={` `}>
                                      <label className="text-sm font-medium leading-5 text-gray-900">
                                        Providers
                                      </label>
                                      <div className="">
                                        <MultiSelectDropDown
                                          placeholder="Select Providers"
                                          showSearchBar={true}
                                          disabled={false}
                                          data={providerDropdown}
                                          selectedValue={providerDropdown.filter(
                                            (m) =>
                                              searchCriteria.providerIDs?.includes(
                                                m.id.toString()
                                              )
                                          )}
                                          onSelect={(value) => {
                                            onSelectProviders(value);
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div
                                className={
                                  'hidden justify-center lg:flex lg:w-[1%]'
                                }
                              >
                                <div className={`w-[1px] h-full bg-gray-200`} />
                              </div>
                              <div className="w-[50%] lg:w-[50%]">
                                <div className="px-[5px] pb-[5px]">
                                  <p className="text-base font-bold leading-normal text-gray-700">
                                    Posting Date
                                  </p>
                                </div>
                                <div className="flex w-full flex-wrap">
                                  <div className={`w-[33%] px-[5px]`}>
                                    <div
                                      className={`w-full items-start self-stretch`}
                                    >
                                      <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                        Period
                                      </div>
                                      <div className="w-full">
                                        <SingleSelectDropDown
                                          placeholder="Search Period"
                                          showSearchBar={true}
                                          disabled={false}
                                          data={dateRangeData}
                                          selectedValue={selectedDateRange}
                                          onSelect={(value) => {
                                            setSelectedDateRange(
                                              dateRangeData.filter(
                                                (m) => m.id === value.id
                                              )[0]
                                            );
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  <div className={`w-[33%] pr-[5px]`}>
                                    <div
                                      className={`w-full items-start self-stretch`}
                                    >
                                      <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                        Date - From
                                      </div>
                                      <div className="w-full">
                                        <AppDatePicker
                                          cls="!mt-1"
                                          disabled={isDateActive}
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
                                  <div className={`w-[33%] pl-[5px]`}>
                                    <div
                                      className={`w-full items-start self-stretch`}
                                    >
                                      <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                        Date - To
                                      </div>
                                      <div className="w-full">
                                        <AppDatePicker
                                          cls="!mt-1"
                                          disabled={isDateActive}
                                          selected={searchCriteria?.toDate}
                                          onChange={(value) => {
                                            setSearchCriteriaFields({
                                              ...searchCriteria,
                                              toDate: value
                                                ? DateToStringPipe(value, 1)
                                                : '',
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
                            Apply Parameters
                          </p>
                        </Button>
                        <div
                          className={'hidden justify-center lg:flex lg:w-[1%]'}
                        >
                          <div className={`w-[1px] h-full bg-gray-900`} />
                        </div>
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
                              hideSearchParameters === false
                                ? ''
                                : '-rotate-180'
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
                  {searchResult.length ? (
                    <div className="flex w-full flex-col bg-gray-50">
                      {/* <div className="self-end py-[24px] pr-[50px]">
              <Button
                buttonType={ButtonType.secondary}
                onClick={async () => {}}
                cls="inline-flex space-x-2 h-[38px] items-center justify-center w-[158px] py-1 px-1 bg-white shadow border rounded-md border-gray-300"
              >
                <Icon
                  className="h-full w-5 rounded-lg"
                  name="pencil"
                  size={12}
                />
                <p className="text-xs font-medium leading-4 text-gray-700">
                  Edit Dashboard
                </p>
              </Button>
            </div> */}
                      <div
                        id="monthlySummary"
                        className="flex flex-col gap-6 px-5 py-[24px]"
                      >
                        <div className="flex flex-col gap-5">
                          <div id="canvas11" className=" w-full ">
                            {selectedGaphJSON?.charges.length ? (
                              <div>
                                <BarGraph
                                  widthCls={'100%'}
                                  type={'bar'}
                                  label={
                                    'Charges x Payments x Adjustments by Date'
                                  }
                                  dataSets={[
                                    {
                                      label: 'Charges',
                                      data: selectedGaphJSON?.charges,
                                      backgroundColor: '#67E8F9',
                                      barPercentage: 0.8,
                                      categoryPercentage: 0.6,
                                    },
                                    {
                                      label: 'Payments',
                                      data: selectedGaphJSON?.payments,
                                      backgroundColor: '#6B7280',
                                      barPercentage: 0.8,
                                      categoryPercentage: 0.6,
                                    },
                                    {
                                      label: 'Adjustments',
                                      data: selectedGaphJSON?.adjustments,
                                      backgroundColor: '#155E75',
                                      barPercentage: 0.8,
                                      categoryPercentage: 0.6,
                                    },
                                  ]}
                                  yAxisLabelsAppendFront={'$'}
                                  data={searchResult}
                                  dateLabels={selectedGaphJSON?.labels}
                                ></BarGraph>
                              </div>
                            ) : (
                              <></>
                            )}
                          </div>
                          {selectedGaphJSON?.days.length ? (
                            <div
                              id="canvas12"
                              className="flex w-full gap-4 bg-white "
                            >
                              <div className="w-[50%]">
                                <BarGraph
                                  widthCls={'608px'}
                                  type={'line'}
                                  label={'Days in AR'}
                                  yAxisLabelsAppendEnd={' Days'}
                                  dataSets={[
                                    {
                                      label: 'Days in AR',
                                      fill: true,
                                      data: selectedGaphJSON?.days,
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
                                      borderColor: '#67E8F9',
                                      barPercentage: 1,
                                      categoryPercentage: 0.6,
                                      borderWidth: 5,
                                      type: 'line',
                                      pointStyle: 'circle',
                                      pointBackgroundColor: '#67E8F9',
                                    },
                                  ]}
                                  data={searchResult}
                                  dateLabels={selectedGaphJSON.labels}
                                >
                                  {/* <div id="childDiv1">
                        <div className={``}>
                          <div className={`h-[1px] w-full bg-gray-200`} />
                        </div>
                        <div className="py-[19px]">
                          <div className="flex justify-between">
                            <div className="flex gap-1 self-center">
                              <span className="text-base font-bold leading-6 text-gray-700">
                                Date Range:{' '}
                              </span>
                              <span className="mt-1">
                                <PopoverDropdown
                                  popoverCls={'w-[220px]'}
                                  buttonLabel={'Year to Date'}
                                  buttonCls=""
                                  dataList={popoverDateRange}
                                  onSelect={() => {}}
                                  selectedValue={undefined}
                                  forcefullyShowSearchBar={true}
                                />
                              </span>
                            </div>
                            <div>
                              <Button
                                buttonType={ButtonType.secondary}
                                onClick={async () => {}}
                                cls="inline-flex space-x-2 h-[38px] items-center justify-center w-[141px] py-1 px-1 bg-white shadow border rounded-md border-gray-300"
                              >
                                <Icon
                                  className="h-full w-5 rounded-lg"
                                  name="table"
                                  size={16}
                                />
                                <p className="text-xs font-medium leading-4 text-gray-700">
                                  View Data Table
                                </p>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div> */}
                                </BarGraph>
                              </div>
                              <div className="w-[50%]">
                                <BarGraph
                                  type={'bar'}
                                  widthCls={'100%'}
                                  label={'Average $ per Claim'}
                                  dataSets={[
                                    {
                                      label: 'Number of Billed Claims',
                                      fill: true,
                                      data: selectedGaphJSON.visits,
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
                                      borderColor: '#67E8F9',
                                      barPercentage: 1,
                                      categoryPercentage: 0.6,
                                      borderWidth: 5,
                                      type: 'line',
                                      pointStyle: 'circle',
                                      pointBackgroundColor: '#67E8F9',
                                    },
                                    {
                                      label: 'Avg $ per Claim - Billed',
                                      data: selectedGaphJSON.averageCharges,
                                      backgroundColor: '#6B7280',
                                      barPercentage: 0.8,
                                      categoryPercentage: 0.6,
                                    },
                                    {
                                      label: 'Avg $ per Claim - Collected',
                                      data: selectedGaphJSON.receipts,
                                      backgroundColor: '#155E75',
                                      barPercentage: 0.8,
                                      categoryPercentage: 0.6,
                                    },
                                  ]}
                                  yAxisLabelsAppendFront={'$'}
                                  data={searchResult}
                                  dateLabels={selectedGaphJSON.labels}
                                >
                                  {/* <div id="childDiv2">
                        <div className={``}>
                          <div className={`h-[1px] w-full bg-gray-200`} />
                        </div>
                        <div className="py-[19px]">
                          <div className="flex justify-between">
                            <div className="flex gap-1 self-center">
                              <span className="text-base font-bold leading-6 text-gray-700">
                                Date Range:{' '}
                              </span>
                              <span className="mt-1">
                                <PopoverDropdown
                                  popoverCls={'w-[220px]'}
                                  buttonLabel={'Year to Date'}
                                  buttonCls=""
                                  dataList={popoverDateRange}
                                  onSelect={() => {}}
                                  selectedValue={undefined}
                                  forcefullyShowSearchBar={true}
                                />
                              </span>
                            </div>
                            <div>
                              <Button
                                buttonType={ButtonType.secondary}
                                onClick={async () => {}}
                                cls="inline-flex space-x-2 h-[38px] items-center justify-center w-[141px] py-1 px-1 bg-white shadow border rounded-md border-gray-300"
                              >
                                <Icon
                                  className="h-full w-5 rounded-lg"
                                  name="table"
                                  size={16}
                                />
                                <p className="text-xs font-medium leading-4 text-gray-700">
                                  View Data Table
                                </p>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div> */}
                                </BarGraph>
                              </div>
                            </div>
                          ) : (
                            <></>
                          )}
                        </div>
                        {selectedGaphJSON?.beginning.length ? (
                          <div id="canvas13" className="flex w-full gap-4 ">
                            <div className="w-[50%]">
                              <BarGraph
                                type={'bar'}
                                label={'Beginning and Ending AR vs Net Results'}
                                dataSets={[
                                  {
                                    label: 'Beginning',
                                    data: selectedGaphJSON?.beginning,
                                    backgroundColor: '#67E8F9',
                                    barPercentage: 0.8,
                                    categoryPercentage: 0.6,
                                  },
                                  {
                                    label: 'Ending',
                                    data: selectedGaphJSON?.ending,
                                    backgroundColor: '#6B7280',
                                    barPercentage: 0.8,
                                    categoryPercentage: 0.6,
                                  },
                                  {
                                    label: 'Net Results',
                                    data: selectedGaphJSON?.net,
                                    backgroundColor: '#155E75',
                                    barPercentage: 0.8,
                                    categoryPercentage: 0.6,
                                  },
                                ]}
                                yAxisLabelsAppendFront={'$'}
                                data={searchResult}
                                dateLabels={selectedGaphJSON.labels}
                              ></BarGraph>
                            </div>
                            <div className="w-[50%]">
                              {selectedGaphJSON?.net.length && (
                                <BarGraph
                                  type={'bar'}
                                  label={'Net vs Gross Collection'}
                                  dataSets={[
                                    {
                                      label: 'Net',
                                      data: selectedGaphJSON.netPercentage,
                                      backgroundColor: '#67E8F9',
                                      barPercentage: 0.8,
                                      categoryPercentage: 0.6,
                                    },
                                    {
                                      label: 'Gross',
                                      data: selectedGaphJSON.gross,
                                      backgroundColor: '#6B7280',
                                      barPercentage: 0.8,
                                      categoryPercentage: 0.6,
                                    },
                                  ]}
                                  yAxisLabelsAppendFront={'%'}
                                  data={searchResult}
                                  dateLabels={selectedGaphJSON.labels}
                                ></BarGraph>
                              )}
                            </div>
                          </div>
                        ) : (
                          <></>
                        )}
                        <div id="canvas14" className="flex w-full gap-4 ">
                          <div className="w-[50%]">
                            {selectedGaphJSON?.trailingSixMonthNet.length ? (
                              <BarGraph
                                type={'bar'}
                                label={'Trailing 6 Month Average %'}
                                dataSets={[
                                  {
                                    label: 'Net',
                                    data: selectedGaphJSON.trailingSixMonthNet,
                                    backgroundColor: '#67E8F9',
                                    barPercentage: 0.8,
                                    categoryPercentage: 0.6,
                                  },
                                  {
                                    label: 'Gross',
                                    data: selectedGaphJSON.trailingSixMonthGross,
                                    backgroundColor: '#6B7280',
                                    barPercentage: 0.8,
                                    categoryPercentage: 0.6,
                                  },
                                ]}
                                yAxisLabelsAppendEnd={'%'}
                                data={searchResult}
                                dateLabels={selectedGaphJSON.labels}
                              ></BarGraph>
                            ) : (
                              <></>
                            )}
                          </div>
                          <div className="w-[50%]">
                            {selectedGaphJSON?.trailingTwelveMonthNet.length ? (
                              <BarGraph
                                type={'bar'}
                                label={'Trailing 12 Month Average %'}
                                dataSets={[
                                  {
                                    label: 'Net',
                                    data: selectedGaphJSON.trailingTwelveMonthNet,
                                    backgroundColor: '#67E8F9',
                                    barPercentage: 0.8,
                                    categoryPercentage: 0.6,
                                  },
                                  {
                                    label: 'Gross',
                                    data: selectedGaphJSON.trailingTwelveMonthGross,
                                    backgroundColor: '#6B7280',
                                    barPercentage: 0.8,
                                    categoryPercentage: 0.6,
                                  },
                                ]}
                                yAxisLabelsAppendEnd={'%'}
                                data={searchResult}
                                dateLabels={selectedGaphJSON.labels}
                              ></BarGraph>
                            ) : (
                              <></>
                            )}
                          </div>
                        </div>
                        <div id="canvas15" className="flex w-full gap-4 ">
                          {selectedGaphJSON?.actual.length ? (
                            <div className="flex w-full flex-col rounded-md border border-gray-300">
                              <div className="inline-flex gap-1 px-[16px] py-[19px] text-base font-bold leading-6">
                                Actual vs Projection:
                                <span className="mt-1">
                                  <PopoverDropdown
                                    popoverCls={'w-[220px]'}
                                    buttonLabel={
                                      selectedComparisonValue?.title || ''
                                    }
                                    buttonCls=""
                                    dataList={projectectionActionData}
                                    onSelect={(value) => {
                                      setSelectedComparisonValue(value);
                                      switch (value?.id) {
                                        case 1:
                                          setSelectedGaphJSON({
                                            ...selectedGaphJSON,
                                            actual: selectedGaphJSON.charges,
                                            projection:
                                              selectedGaphJSON.chargesProjection,
                                          });
                                          break;
                                        case 2:
                                          setSelectedGaphJSON({
                                            ...selectedGaphJSON,
                                            actual:
                                              selectedGaphJSON.adjustments,
                                            projection:
                                              selectedGaphJSON.adjustmentsProjection,
                                          });
                                          break;
                                        case 3:
                                          setSelectedGaphJSON({
                                            ...selectedGaphJSON,
                                            actual: selectedGaphJSON.payments,
                                            projection:
                                              selectedGaphJSON.paymentsProjection,
                                          });
                                          break;
                                        case 4:
                                          setSelectedGaphJSON({
                                            ...selectedGaphJSON,
                                            actual: selectedGaphJSON.refunds,
                                            projection:
                                              selectedGaphJSON.refundsProjection,
                                          });
                                          break;
                                        case 5:
                                          setSelectedGaphJSON({
                                            ...selectedGaphJSON,
                                            actual: selectedGaphJSON.badDebt,
                                            projection:
                                              selectedGaphJSON.badDebtProjection,
                                          });
                                          break;
                                        case 6:
                                          setSelectedGaphJSON({
                                            ...selectedGaphJSON,
                                            actual: selectedGaphJSON.visits,
                                            projection:
                                              selectedGaphJSON.visitsProjection,
                                          });
                                          break;
                                        case 7:
                                          setSelectedGaphJSON({
                                            ...selectedGaphJSON,
                                            actual:
                                              selectedGaphJSON.averageCharges,
                                            projection:
                                              selectedGaphJSON.averageChargesProjection,
                                          });
                                          break;
                                        case 8:
                                          setSelectedGaphJSON({
                                            ...selectedGaphJSON,
                                            actual: selectedGaphJSON.receipts,
                                            projection:
                                              selectedGaphJSON.receiptsProjection,
                                          });
                                          break;
                                        case 9:
                                          setSelectedGaphJSON({
                                            ...selectedGaphJSON,
                                            actual: selectedGaphJSON.beginning,
                                            projection:
                                              selectedGaphJSON.beginningProjection,
                                          });
                                          break;
                                        case 10:
                                          setSelectedGaphJSON({
                                            ...selectedGaphJSON,
                                            actual: selectedGaphJSON.ending,
                                            projection:
                                              selectedGaphJSON.endingProjection,
                                          });
                                          break;
                                        case 11:
                                          setSelectedGaphJSON({
                                            ...selectedGaphJSON,
                                            actual: selectedGaphJSON.net,
                                            projection:
                                              selectedGaphJSON.netProjection,
                                          });
                                          break;
                                        case 12:
                                          setSelectedGaphJSON({
                                            ...selectedGaphJSON,
                                            actual: selectedGaphJSON.gross,
                                            projection:
                                              selectedGaphJSON.grossProjection,
                                          });
                                          break;
                                        case 13:
                                          setSelectedGaphJSON({
                                            ...selectedGaphJSON,
                                            actual:
                                              selectedGaphJSON.netPercentage,
                                            projection:
                                              selectedGaphJSON.netPercentageProjection,
                                          });
                                          break;
                                        default:
                                          setSelectedGaphJSON({
                                            ...selectedGaphJSON,
                                            actual: selectedGaphJSON.charges,
                                            projection:
                                              selectedGaphJSON.chargesProjection,
                                          });
                                      }
                                    }}
                                    selectedValue={selectedComparisonValue}
                                    forcefullyShowSearchBar={true}
                                  />
                                </span>
                              </div>
                              <div className={``}>
                                <div className={`h-[1px] w-full bg-gray-200`} />
                              </div>
                              <BarGraph
                                type={'bar'}
                                label={null}
                                dataSets={[
                                  {
                                    label: 'Projection',
                                    fill: true,
                                    data: selectedGaphJSON.projection,
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
                                    borderColor: '#67E8F9',
                                    barPercentage: 1,
                                    categoryPercentage: 0.6,
                                    borderWidth: 5,
                                    type: 'line',
                                    pointStyle: 'circle',
                                    pointBackgroundColor: '#67E8F9',
                                  },
                                  {
                                    label: 'Actual',
                                    data: selectedGaphJSON.actual,
                                    backgroundColor: '#6B7280',
                                    barPercentage: 0.5,
                                    categoryPercentage: 0.6,
                                  },
                                ]}
                                yAxisLabelsAppendFront={
                                  selectedComparisonValue?.id === 6 ||
                                  selectedComparisonValue?.id === 8 ||
                                  selectedComparisonValue?.id === 13
                                    ? ''
                                    : '$'
                                }
                                yAxisLabelsAppendEnd={
                                  selectedComparisonValue?.id === 13 ? '%' : ''
                                }
                                data={searchResult}
                                dateLabels={selectedGaphJSON.labels}
                              >
                                {/* <div id="childDiv7">
                        <div className={``}>
                          <div className={`h-[1px] w-full bg-gray-200`} />
                        </div>
                        <div className="py-[19px]">
                          <div className="flex justify-between">
                            <div className="flex gap-1 self-center">
                              <span className="text-base font-bold leading-6 text-gray-700">
                                Date Range:{' '}
                              </span>
                              <span className="mt-1">
                                <PopoverDropdown
                                  popoverCls={'w-[220px]'}
                                  buttonLabel={'Year to Date'}
                                  buttonCls=""
                                  dataList={popoverDateRange}
                                  onSelect={() => {}}
                                  selectedValue={undefined}
                                  forcefullyShowSearchBar={true}
                                />
                              </span>
                            </div>
                            <div>
                              <Button
                                buttonType={ButtonType.secondary}
                                onClick={async () => {}}
                                cls="inline-flex space-x-2 h-[38px] items-center justify-center w-[141px] py-1 px-1 bg-white shadow border rounded-md border-gray-300"
                              >
                                <Icon
                                  className="h-full w-5 rounded-lg"
                                  name="table"
                                  size={16}
                                />
                                <p className="text-xs font-medium leading-4 text-gray-700">
                                  View Data Table
                                </p>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div> */}
                              </BarGraph>
                            </div>
                          ) : (
                            <></>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}
                </>
              )}

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
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
export default MonthlySummaryReport;
