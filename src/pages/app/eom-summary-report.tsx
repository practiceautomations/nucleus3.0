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
import type { ButtonSelectDropdownDataType } from '@/components/UI/ButtonSelectDropdown';
import ButtonSelectDropdownForExport from '@/components/UI/ButtonSelectDropdownForExport';
import MultiSelectDropDown from '@/components/UI/MultiSelectDropDown';
import SectionHeading from '@/components/UI/SectionHeading';
import type { SingleSelectDropDownDataType } from '@/components/UI/SingleSelectDropDown';
import SingleSelectDropDown from '@/components/UI/SingleSelectDropDown';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import AppLayout from '@/layouts/AppLayout';
import { getselectdWorkGroupsIDsSelector } from '@/store/chrome/selectors';
import type { FacilitiesData } from '@/store/chrome/types';
import {
  addToastNotification,
  fetchFacilityDataRequest,
  fetchPracticeDataRequest,
  fetchProviderDataRequest,
} from '@/store/shared/actions';
import {
  getEOMMonthlySummaryReportData,
  // getRefreshDateAndTime,
  // refreshMonthlySummaryReport,
} from '@/store/shared/sagas';
import {
  getFacilityDataSelector,
  getPracticeDataSelector,
  getProviderDataSelector,
} from '@/store/shared/selectors';
import type {
  EOMMonthlySummaryReportCriteria,
  EOMMonthlySummaryReportData,
  PracticeData,
  ProviderData,
} from '@/store/shared/types';
import { ToastType } from '@/store/shared/types';
import type {
  DownloadDataPDFDataType,
  PDFColumnInput,
  PDFRowInput,
} from '@/utils';
import { ExportDataToCSV, ExportDataToDrive, ExportDataToPDF } from '@/utils';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';
import { DateToStringPipe } from '@/utils/dateConversionPipes';

import { currencyFormatter, usdPrice } from './all-claims';

const EOMSummaryReport = () => {
  const dispatch = useDispatch();
  const selectedWorkedGroup = useSelector(getselectdWorkGroupsIDsSelector);
  const defaultSearchCriteria: EOMMonthlySummaryReportCriteria = {
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

  const [isDateActive, setIsDateActive] = useState(true);
  const [searchCriteria, setSearchCriteria] = useState(defaultSearchCriteria);
  const [isChangedJson, setIsChangedJson] = useState(false);
  const [renderSearchCriteriaView, setRenderSearchCriteriaView] = useState(
    uuidv4()
  );
  const setSearchCriteriaFields = (value: EOMMonthlySummaryReportCriteria) => {
    setSearchCriteria(value);
    setIsChangedJson(true);
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

  // const [refreshDateAndTime, setRefreshDateAndTime] = useState<Date | string>();
  // const refreshDateTime = async (groupID: number) => {
  //   const res = await getRefreshDateAndTime(groupID);
  //   if (res && res.lastReportCreatedOn) {
  //     setRefreshDateAndTime(res.lastReportCreatedOn);
  //   } else {
  //     setRefreshDateAndTime('');
  //   }
  // };

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

  const ProviderData = useSelector(getProviderDataSelector);
  useEffect(() => {
    if (ProviderData) {
      setProviderDropdown(ProviderData);
    }
  }, [ProviderData]);
  const PracticeData = useSelector(getPracticeDataSelector);
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
  const [searchResult, setSearchResult] = useState<
    EOMMonthlySummaryReportData[]
  >([]);
  useEffect(() => {
    if (selectedWorkedGroup && selectedWorkedGroup?.groupsData[0]) {
      // refreshDateTime(selectedWorkedGroup?.groupsData[0]?.id);
      setSearchCriteria({
        ...searchCriteria,
        groupID: selectedWorkedGroup?.groupsData[0]?.id || null,
      });
      setSearchCriteriaFields({
        ...searchCriteria,
        groupID: selectedWorkedGroup?.groupsData[0]?.id || null,
      });
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
      }
      setSearchCriteria(defaultSearchCriteria);
      setSelectedDateRange(dateRangeData[3]);
      setSearchResult([]);
    }
  }, [selectedWorkedGroup]);
  const [statusModalInfo, setStatusModalInfo] = useState({
    show: false,
    heading: '',
    text: '',
    type: StatusModalType.WARNING,
  });
  const [avgRowResult, setAvgRowResult] =
    useState<EOMMonthlySummaryReportData>();
  const [totalRowResult, setTotalRowResult] =
    useState<EOMMonthlySummaryReportData>();
  const getSearchData = async (obj: EOMMonthlySummaryReportCriteria) => {
    const res = await getEOMMonthlySummaryReportData(obj);
    if (res) {
      setSearchResult(res);
      setAvgRowResult(res.filter((m) => m.month === 'AVG')[0]);
      setTotalRowResult(res.filter((m) => m.month === 'Total')[0]);
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
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(1); // Set to the 1st of the current month
      startDate.setMonth(startDate.getMonth() - 1);
      startDate.setHours(0, 0, 0, 0);
    }
    if (selectedDateRange && selectedDateRange.id === 4) {
      endDate = new Date(); // Set endDate to today
      endDate.setHours(23, 59, 59, 999); // Set end time to the end of the current day

      // Set startDate to the 1st day of the month that is exactly 12 months ago
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 12); // Go back 12 months
      startDate.setDate(1); // Set to the 1st of that month
      startDate.setHours(0, 0, 0, 0);
    }
    if (selectedDateRange && selectedDateRange.id === 5) {
      endDate = new Date(); // Set endDate to today
      endDate.setHours(23, 59, 59, 999); // Set end time to the end of the current day

      // Set startDate to the 1st day of the month that is exactly 12 months ago
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 24); // Go back 12 months
      startDate.setDate(1); // Set to the 1st of that month
      startDate.setHours(0, 0, 0, 0);
    }
    setSearchCriteriaFields({
      ...searchCriteria,
      toDate: DateToStringPipe(endDate, 1),
      fromDate: DateToStringPipe(startDate, 1),
    });
  }, [selectedDateRange]);
  const columns: GridColDef[] = [
    {
      field: 'month',
      headerName: 'Month',
      flex: 1,
      minWidth: 100,
      disableReorder: true,
      description: '',
    },
    {
      field: 'charges',
      headerName: 'Charges',
      ...usdPrice,
      flex: 1,
      minWidth: 140,
      disableReorder: true,
      description: '',
    },
    {
      field: 'adjustments',
      headerName: 'Adj.',
      ...usdPrice,
      flex: 1,
      minWidth: 140,
      disableReorder: true,
      description: 'Insurance Adjustment',
    },
    {
      field: 'payments',
      headerName: 'Payments',
      ...usdPrice,
      flex: 1,
      minWidth: 140,
      disableReorder: true,
      description: '(Ins Payments + Pat Payments + Collected Adv Payments)',
    },
    {
      field: 'refunds',
      headerName: 'Refunds',
      ...usdPrice,
      flex: 1,
      minWidth: 140,
      disableReorder: true,
      description: '(Insurance Refunds + Patient Refunds)',
    },
    {
      field: 'patientDiscounts',
      headerName: 'Patient Discount',
      ...usdPrice,
      flex: 1,
      minWidth: 140,
      disableReorder: true,
      description: 'Patient Discount',
    },
    {
      field: 'badDebt',
      headerName: 'Bad Debt',
      ...usdPrice,
      flex: 1,
      minWidth: 140,
      disableReorder: true,
      description: 'Bad Debt',
    },
    {
      field: 'visits',
      headerName: 'Visits',
      flex: 1,
      minWidth: 120,
      disableReorder: true,
      description: '',
    },
    {
      field: 'averageCharges',
      headerName: 'Avg. Charges',
      ...usdPrice,
      flex: 1,
      minWidth: 140,
      disableReorder: true,
      description: '( Charges / Visits )',
    },
    {
      field: 'receipts',
      headerName: 'Receipts',
      ...usdPrice,
      flex: 1,
      minWidth: 140,
      disableReorder: true,
      description: '( Payment / Visits )',
    },
    {
      field: 'beginning',
      headerName: 'Beginning',
      ...usdPrice,
      flex: 1,
      minWidth: 140,
      disableReorder: true,
      description: '',
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
      field: 'net',
      headerName: 'Net',
      ...usdPrice,
      flex: 1,
      minWidth: 140,
      disableReorder: true,
      description:
        '[ Charges - ( Adjustments + Payments + Patient Discount + Bad Debt ) + Refund ]',
    },
    {
      field: 'days',
      headerName: 'Days',
      flex: 1,
      minWidth: 100,
      disableReorder: true,
      description:
        '[ Ending AR / (Sum of Charges for Last 6 months / 182 days)]',
    },
    {
      field: 'gross',
      headerName: 'Gross %',
      flex: 1,
      minWidth: 100,
      disableReorder: true,
      description: '( Payment / Charges )',
      renderCell: (params) => {
        return <div>{params.value}%</div>;
      },
    },
    {
      field: 'netPercentage',
      headerName: 'Net %',
      ...usdPrice,
      flex: 1,
      minWidth: 100,
      disableReorder: true,
      description:
        '[(Adjustments + Patient Discount + Bad Debt + Payments + Refunds)] / Charges',
      renderCell: (params) => {
        return <div>{params.value}%</div>;
      },
    },
    {
      field: 'trailingSixMonthNet',
      headerName: 'Trailing 6 Net %',
      ...usdPrice,
      flex: 1,
      minWidth: 180,
      disableReorder: true,
      description: '',
      renderCell: (params) => {
        return <div>{params.value}%</div>;
      },
    },
    {
      field: 'trailingSixMonthGross',
      headerName: 'Trailing 6 Gross %',
      ...usdPrice,
      flex: 1,
      minWidth: 180,
      disableReorder: true,
      description: '',
      renderCell: (params) => {
        return <div>{params.value}%</div>;
      },
    },
    {
      field: 'trailingTwelveMonthNet',
      headerName: 'Trailing 12 Net %',
      ...usdPrice,
      flex: 1,
      minWidth: 180,
      disableReorder: true,
      description: '',
      renderCell: (params) => {
        return <div>{params.value}%</div>;
      },
    },
    {
      field: 'trailingTwelveMonthGross',
      headerName: 'Trailing 12 Gross %',
      ...usdPrice,
      flex: 1,
      minWidth: 180,
      disableReorder: true,
      description: '',
      renderCell: (params) => {
        return <div>{params.value}%</div>;
      },
    },
  ];
  const [reportCollapseInfo, setReportCollapseInfo] = useState({
    summary: false,
    detail: false,
  });

  const downloadPdf = (pdfExportData: EOMMonthlySummaryReportData[]) => {
    if (!pdfExportData) {
      setStatusModalInfo({
        ...statusModalInfo,
        show: true,
        heading: 'Alert',
        type: StatusModalType.WARNING,
        text: 'No Record to Export!',
      });
      return false;
    }
    const data: DownloadDataPDFDataType[] = [];
    // implement criteria
    const criteriaArray: PDFRowInput[] = [];

    if (searchCriteria.providerIDs && searchCriteria.providerIDs?.length > 0) {
      const providers = searchCriteria.providerIDs?.map((providerID) => {
        const provider = providerDropdown.find(
          (m) => m.id === Number(providerID)
        );
        return provider ? provider.value : '';
      });

      criteriaArray.push({
        Criteria: 'Provider',
        Value: providers?.join(', ') || '',
      });
    }
    if (searchCriteria.facilityIDs && searchCriteria.facilityIDs?.length > 0) {
      const facilities = searchCriteria.facilityIDs?.map((n) => {
        const facility = facilityDropdown.find((m) => m.id === Number(n));
        return facility ? facility.value : '';
      });

      criteriaArray.push({
        Criteria: 'Facility',
        Value: facilities?.join(', ') || '',
      });
    }
    if (searchCriteria.practiceIDs && searchCriteria.practiceIDs?.length > 0) {
      const practices = searchCriteria.practiceIDs?.map((n) => {
        const practice = practiceDropdown.find((m) => m.id === Number(n));
        return practice ? practice.value : '';
      });

      criteriaArray.push({
        Criteria: 'Practice',
        Value: practices?.join(', ') || '',
      });
    }
    if (searchCriteria.fromDate) {
      const dateObject = new Date(searchCriteria.fromDate);
      criteriaArray.push({
        Criteria: 'From Date',
        Value: DateToStringPipe(dateObject, 1),
      });
    }
    if (searchCriteria.toDate) {
      const dateObject = new Date(searchCriteria.toDate);
      criteriaArray.push({
        Criteria: 'To Date',
        Value: DateToStringPipe(dateObject, 1),
      });
    }
    const criteriaColumns: PDFColumnInput[] = [];
    const keyNames1 =
      criteriaArray && criteriaArray[0] && Object.keys(criteriaArray[0]);
    if (keyNames1) {
      for (let i = 0; i < keyNames1.length; i += 1) {
        criteriaColumns.push({ title: keyNames1[i], dataKey: keyNames1[i] });
      }
    }
    data.push({ columns: criteriaColumns, body: criteriaArray });
    // implement data
    const insuranceProfileDetails: PDFRowInput[] = pdfExportData.map((m) => {
      return {
        Month: m.month || '',
        Charges: currencyFormatter.format(m.charges || 0),
        Adjustments: currencyFormatter.format(m.adjustments || 0),
        Payments: currencyFormatter.format(m.payments || 0),
        Refunds: currencyFormatter.format(m.refunds || 0),
        'Patient Discount': currencyFormatter.format(m.patientDiscounts || 0),
        'Bad Debt': currencyFormatter.format(m.badDebt || 0),
        Visits: m.visitsCount || 0,
        'Average Charges': currencyFormatter.format(m.averageCharges || 0),
        Receipts: currencyFormatter.format(m.receipts || 0),
        Beginning: currencyFormatter.format(m.beginning || 0),
        Ending: currencyFormatter.format(m.ending || 0),
        Net: currencyFormatter.format(m.net || 0),
        Days: m.days || 0,
        Gross: `${m.gross} %` || '0%',
        'Net %': `${m.netPercentage} %` || '0%',
        'Trailing 6 Net %':
          m.trailingSixMonthNet !== null
            ? `${m.trailingSixMonthNet} %` || '0%'
            : '',
        'Trailing 12 Net %':
          m.trailingTwelveMonthNet !== null
            ? `${m.trailingTwelveMonthNet} %` || '0%'
            : '',
        'Trailing 6 Gross %':
          m.trailingSixMonthGross !== null
            ? `${m.trailingSixMonthGross} %` || '0%'
            : '',
        'Trailing 12 Gross %':
          m.trailingTwelveMonthGross !== null
            ? `${m.trailingTwelveMonthGross} %` || '0%'
            : '',
      };
    });
    const dataColumns: PDFColumnInput[] = [];
    const keyNames =
      insuranceProfileDetails[0] && Object.keys(insuranceProfileDetails[0]);
    if (keyNames) {
      for (let i = 0; i < keyNames.length; i += 1) {
        dataColumns.push({ title: keyNames[i], dataKey: keyNames[i] });
      }
    }
    data.push({ columns: dataColumns, body: insuranceProfileDetails });

    ExportDataToPDF(data, 'Monthly Summary Report');
    dispatch(
      addToastNotification({
        text: 'Export Successful',
        toastType: ToastType.SUCCESS,
        id: '',
      })
    );
    return true;
  };

  const ExportData = async (type: string) => {
    const obj: EOMMonthlySummaryReportCriteria = {
      groupID: searchCriteria.groupID,
      providerIDs: searchCriteria.providerIDs,
      facilityIDs: searchCriteria.facilityIDs,
      practiceIDs: searchCriteria.practiceIDs,
      fromDate: searchCriteria.fromDate,
      toDate: searchCriteria.toDate,
    };
    const res = await getEOMMonthlySummaryReportData(obj);
    if (res) {
      if (type === 'pdf') {
        downloadPdf(res);
      } else {
        const exportDataArray = res.map((m) => {
          return {
            Month: m.month || '',
            Charges: currencyFormatter.format(m.charges || 0),
            Adjustments: currencyFormatter.format(m.adjustments || 0),
            Payments: currencyFormatter.format(m.payments || 0),
            Refunds: currencyFormatter.format(m.refunds || 0),
            'Patient Discount': currencyFormatter.format(
              m.patientDiscounts || 0
            ),
            'Bad Debt': currencyFormatter.format(m.badDebt || 0),
            Visits: m.visitsCount?.toString() || '0',
            'Average Charges': currencyFormatter.format(m.averageCharges || 0),
            Receipts: currencyFormatter.format(m.receipts || 0),
            Beginning: currencyFormatter.format(m.beginning || 0),
            Ending: currencyFormatter.format(m.ending || 0),
            Net: currencyFormatter.format(m.net || 0),
            Days: m.days?.toString() || '0',
            Gross: currencyFormatter.format(m.gross || 0),
            'Net %': currencyFormatter.format(m.netPercentage || 0),
            'Trailing 6 Net %': currencyFormatter.format(
              m.trailingSixMonthNet || 0
            ),
            'Trailing 12 Net %': currencyFormatter.format(
              m.trailingTwelveMonthNet || 0
            ),
            'Trailing 6 Gross %': currencyFormatter.format(
              m.trailingSixMonthGross || 0
            ),
            'Trailing 12 Gross %': currencyFormatter.format(
              m.trailingTwelveMonthGross || 0
            ),
          };
        });
        if (exportDataArray.length !== 0) {
          const headerArray = Object.keys(exportDataArray[0] || {});
          let criteriaObj: { [key: string]: string } = {
            ...exportDataArray[0],
          };
          const criteriaArray = [];
          criteriaObj = Object.fromEntries(headerArray.map((key) => [key, '']));
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            Month: 'Criteria',
            charges: 'Value',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          const providers = searchCriteria.providerIDs?.map((providerID) => {
            const provider = providerDropdown.find(
              (m) => m.id === Number(providerID)
            );
            return provider ? provider.value : '';
          });

          criteriaObj = {
            ...criteriaObj,
            Month: 'Providers',
            Charges: providers?.join(', ') || '',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          const facilities = searchCriteria.facilityIDs?.map((n) => {
            const facility = facilityDropdown.find((m) => m.id === Number(n));
            return facility ? facility.value : '';
          });
          criteriaObj = {
            ...criteriaObj,
            Month: 'Facilites',
            Charges: facilities?.join(', ') || '',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          const practices = searchCriteria.practiceIDs?.map((n) => {
            const practice = practiceDropdown.find((m) => m.id === Number(n));
            return practice ? practice.value : '';
          });
          criteriaObj = {
            ...criteriaObj,
            Month: 'Practices',
            Charges: practices?.join(', ') || '',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          if (searchCriteria.fromDate) {
            const dateObject1 = new Date(searchCriteria.fromDate);
            criteriaObj = {
              ...criteriaObj,
              Month: 'Date - From',
              Charges: DateToStringPipe(dateObject1, 1) || '',
            };
          }
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));

          if (searchCriteria.toDate) {
            const dateObject2 = new Date(searchCriteria.toDate);
            criteriaObj = {
              ...criteriaObj,
              Month: 'Date - To',
              Charges: DateToStringPipe(dateObject2, 1) || '',
            };
          }
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = Object.fromEntries(headerArray.map((key) => [key, '']));
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            Month: 'End of Month (EOM) Summary Report',
            charges: '',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = Object.fromEntries(headerArray.map((key) => [key, '']));
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = Object.fromEntries(
            headerArray.map((key) => [key, key])
          );
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          const exportArray = criteriaArray.concat(exportDataArray);
          if (!exportArray) {
            setStatusModalInfo({
              ...statusModalInfo,
              show: true,
              heading: 'Alert',
              type: StatusModalType.WARNING,
              text: 'No Data to Export!',
            });
            return;
          }
          if (type === 'csv') {
            ExportDataToCSV(exportArray, 'End of Month (EOM) Summary Report');
            dispatch(
              addToastNotification({
                text: 'Export Successful',
                toastType: ToastType.SUCCESS,
                id: '',
              })
            );
          } else {
            ExportDataToDrive(
              exportArray,
              'End of Month (EOM) Summary Report',
              dispatch
            );
          }
        }
      }
    } else {
      setStatusModalInfo({
        ...statusModalInfo,
        show: true,
        heading: 'Error',
        type: StatusModalType.ERROR,
        text: 'A system error prevented the report to be exported. Please try again.',
      });
    }
  };
  const exportDropdownData: ButtonSelectDropdownDataType[] = [
    {
      id: 1,
      value: 'Export Report to PDF',
      icon: 'pdf',
    },
    {
      id: 2,
      value: 'Export Report to CSV',
      icon: 'csv',
    },
    {
      id: 3,
      value: 'Export to Google Drive',
      icon: 'drive',
    },
  ];
  const onSelectExportOption = (res: ButtonSelectDropdownDataType[]) => {
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
    if (id === 1) {
      ExportData('pdf');
    }
    if (id === 2) {
      ExportData('csv');
    }
    if (id === 3) {
      ExportData('download');
    }
  };

  // const refreshMontlySummaryReport = async () => {
  //   const res = await refreshMonthlySummaryReport();
  //   if (res) {
  //     onClickSearch();
  //     if (searchCriteria.groupID) {
  //       refreshDateTime(searchCriteria.groupID);
  //     }
  //   } else {
  //     setStatusModalInfo({
  //       ...statusModalInfo,
  //       show: true,
  //       heading: 'Error',
  //       type: StatusModalType.ERROR,
  //       text: 'A system error occurred while refreshing for results.\nPlease try again.',
  //     });
  //   }
  // };

  return (
    <AppLayout title="Nucleus - EOM Summary Report">
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
                          End of Month (EOM) Summary Report
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
                        Search
                      </p>
                    </Button>
                    <div className={'hidden justify-center lg:flex lg:w-[1%]'}>
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
              <div className="flex w-full flex-col gap-4 bg-white px-7 pt-[25px] pb-[15px]">
                <SectionHeading
                  label="Results"
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
                {/* <div className="w-100 inline-flex h-[95px] items-center justify-start gap-2">
                  <Button
                    buttonType={ButtonType.primary}
                    cls={`inline-flex gap-2 leading-5 bg-cyan-500`}
                    onClick={() => {
                      refreshMontlySummaryReport();
                    }}
                  >
                    <p className="text-s mt-[2px] self-center font-medium leading-4">
                      Refresh Result
                    </p>
                  </Button>
                  <div className="font-['Nunito'] text-xs font-normal leading-none text-gray-500">
                    {refreshDateAndTime
                      ? `Last Report Generated On: ${DateToStringPipe(
                          refreshDateAndTime,
                          5
                        )}`
                      : ''}
                  </div>
                </div> */}
                <div className="no-scrollbar flex flex-col gap-3 overflow-x-auto pt-[50px]">
                  <div className="inline-table w-full rounded-lg border border-gray-300">
                    <table className="w-full table-fixed text-sm font-normal leading-5">
                      <colgroup>
                        {columns.map((header, index) => (
                          <col
                            key={index}
                            className={classNames(
                              header.headerName === 'Month'
                                ? 'pl-[24px] pr-2 w-[128px]'
                                : 'px-2',
                              index === 1 ? ' w-[120px]' : '',
                              index === 2 ? ' w-[120px]' : '',
                              index === 3 ? ' w-[120px]' : '',
                              index === 4 ? ' w-[120px]' : '',
                              index === 5 ? ' w-[120px]' : '',
                              index === 6 ? ' w-[120px]' : '',
                              index === 7 ? ' w-[120px]' : '',
                              index === 8 ? ' w-[120px]' : '',
                              index === 9 ? ' w-[120px]' : '',
                              index === 10 ? ' w-[120px]' : '',
                              index === 11 ? ' w-[120px]' : '',
                              index === 12 ? ' w-[120px]' : '',
                              index === 13 ? ' w-[120px]' : '',
                              index === 14 ? ' w-[120px]' : '',
                              index === 15 ? ' w-[120px]' : '',
                              index === 16 ? ' w-[160px]' : '',
                              index === 17 ? ' w-[160px]' : '',
                              index === 18 ? ' w-[160px]' : '',
                              index === 19 ? ' w-[160px]' : 'pr-[24px]'
                            )}
                            style={{}}
                          />
                        ))}
                      </colgroup>
                      <thead className="rounded-t-lg bg-gray-100">
                        <tr>
                          {columns.map((header, index) => (
                            <th
                              key={index}
                              title={`${header.description}`}
                              className={classNames(
                                `py-2 text-left whitespace-nowrap font-bold ${
                                  header.description ? 'cursor-pointer' : ''
                                }`,
                                header.headerName === 'Month'
                                  ? 'px-[24px]'
                                  : 'px-2'
                              )}
                            >
                              {header.headerName}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {searchResult.length > 0 ? (
                          searchResult
                            .filter(
                              (m) => m.month !== 'AVG' && m.month !== 'Total'
                            )
                            .map((rowData, index) => (
                              <React.Fragment key={uuidv4()}>
                                <tr
                                  className="px-[24px]"
                                  style={{ height: '72px' }}
                                >
                                  <td className="py-2 pl-[24px] pr-2">
                                    <div className="flex h-full items-center">
                                      {rowData.month}
                                    </div>
                                  </td>
                                  <td className="p-2 ">
                                    <div className="flex h-full items-center">
                                      {currencyFormatter.format(
                                        rowData.charges || 0
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-2">
                                    <div className="flex h-full items-center">
                                      {currencyFormatter.format(
                                        rowData.adjustments || 0
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-2">
                                    <div className="flex h-full items-center">
                                      {currencyFormatter.format(
                                        rowData.payments || 0
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-2">
                                    <div className="flex h-full items-center">
                                      {currencyFormatter.format(
                                        rowData.refunds || 0
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-2">
                                    <div className="flex h-full items-center">
                                      {currencyFormatter.format(
                                        rowData.patientDiscounts || 0
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-2">
                                    <div className="flex h-full items-center">
                                      {currencyFormatter.format(
                                        rowData.badDebt || 0
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-2">
                                    <div className="flex h-full items-center">
                                      {rowData.visitsCount || 0}
                                    </div>
                                  </td>
                                  <td className="p-2">
                                    <div className="flex h-full items-center">
                                      {currencyFormatter.format(
                                        rowData.averageCharges || 0
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-2">
                                    <div className="flex h-full items-center">
                                      {currencyFormatter.format(
                                        rowData.receipts || 0
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-2">
                                    <div className="flex h-full items-center">
                                      {currencyFormatter.format(
                                        rowData.beginning || 0
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-2">
                                    <div className="flex h-full items-center">
                                      {currencyFormatter.format(
                                        rowData.ending || 0
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-2">
                                    <div className="flex h-full items-center">
                                      {currencyFormatter.format(
                                        rowData.net || 0
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-2">
                                    <div className="flex h-full items-center">
                                      {rowData.days}
                                    </div>
                                  </td>
                                  <td className="p-2">
                                    <div className="flex h-full items-center">
                                      {rowData.gross}%
                                    </div>
                                  </td>
                                  <td className="p-2">
                                    <div className="flex h-full items-center">
                                      {rowData.netPercentage}%
                                    </div>
                                  </td>
                                  <td className="p-2">
                                    <div className="flex h-full items-center">
                                      {rowData.trailingSixMonthNet}%
                                    </div>
                                  </td>
                                  <td className="p-2">
                                    <div className="flex h-full items-center">
                                      {rowData.trailingTwelveMonthNet}%
                                    </div>
                                  </td>
                                  <td className="p-2">
                                    <div className="flex h-full items-center">
                                      {rowData.trailingSixMonthGross}%
                                    </div>
                                  </td>
                                  <td className="p-2">
                                    <div className="flex h-full items-center">
                                      {rowData.trailingTwelveMonthGross}%
                                    </div>
                                  </td>
                                </tr>
                                {index < searchResult.length - 1 && (
                                  <tr
                                    style={{
                                      height: '1px',
                                      background: 'rgba(0, 0, 0, 0.1)',
                                    }}
                                  >
                                    <td colSpan={columns.length}></td>
                                  </tr>
                                )}
                              </React.Fragment>
                            ))
                        ) : (
                          <tr>
                            <td
                              colSpan={columns.length}
                              className="h-[72px] text-center text-sm font-medium text-gray-700"
                            >
                              No Result Found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {searchResult.length ? (
                    <>
                      <div className="inline-table w-full rounded-md border border-gray-200 bg-cyan-50 px-[24px] py-[16px] text-sm font-bold leading-5">
                        <div className="flex flex-row">
                          <div className="w-[100px] pr-2 text-cyan-500">
                            {avgRowResult?.month}
                          </div>
                          <div className="w-[125px] px-2">
                            {currencyFormatter.format(
                              avgRowResult?.charges || 0
                            )}
                          </div>
                          <div className="w-[120px] px-2">
                            {currencyFormatter.format(
                              avgRowResult?.adjustments || 0
                            )}
                          </div>
                          <div className="w-[120px] px-2">
                            {currencyFormatter.format(
                              avgRowResult?.payments || 0
                            )}
                          </div>
                          <div className="w-[118px] px-2">
                            {currencyFormatter.format(
                              avgRowResult?.refunds || 0
                            )}
                          </div>
                          <div className="w-[118px] px-2">
                            {currencyFormatter.format(
                              avgRowResult?.patientDiscounts || 0
                            )}
                          </div>
                          <div className="w-[125px] px-2">
                            {currencyFormatter.format(
                              avgRowResult?.badDebt || 0
                            )}
                          </div>
                          <div className="w-[115px] px-2">
                            {avgRowResult?.visitsCount}
                          </div>
                          <div className="w-[120px] px-2">
                            {currencyFormatter.format(
                              avgRowResult?.averageCharges || 0
                            )}
                          </div>
                          <div className="w-[122px] px-2">
                            {currencyFormatter.format(
                              avgRowResult?.receipts || 0
                            )}
                          </div>
                          <div className="w-[122px] px-2">
                            {currencyFormatter.format(
                              avgRowResult?.beginning || 0
                            )}
                          </div>
                          <div className="w-[120px] px-2">
                            {currencyFormatter.format(
                              avgRowResult?.ending || 0
                            )}
                          </div>
                          <div className="w-[120px] px-2">
                            {currencyFormatter.format(avgRowResult?.net || 0)}
                          </div>
                          <div className="w-[120px] px-2">
                            {avgRowResult?.days}
                          </div>
                          <div className="w-[120px] px-2">
                            {avgRowResult?.gross}
                          </div>
                          <div className="w-[120px] px-2">
                            {avgRowResult?.netPercentage}
                          </div>
                          <div className="w-[180px] px-2"></div>
                          <div className="w-[180px] px-2"></div>
                          <div className="w-[180px] px-2"></div>
                          <div className="w-[76px] px-2"></div>
                        </div>
                      </div>
                      <div className="inline-table w-full gap-2 rounded-md border border-gray-200 bg-cyan-50 px-[24px] py-[16px] text-sm font-bold leading-5">
                        <div className="flex flex-row">
                          <div className="w-[100px] pr-2 text-cyan-500">
                            {totalRowResult?.month}
                          </div>
                          <div className="w-[125px] px-2">
                            {currencyFormatter.format(
                              totalRowResult?.charges || 0
                            )}
                          </div>
                          <div className="w-[120px] px-2">
                            {currencyFormatter.format(
                              totalRowResult?.adjustments || 0
                            )}
                          </div>
                          <div className="w-[120px] px-2">
                            {currencyFormatter.format(
                              totalRowResult?.payments || 0
                            )}
                          </div>
                          <div className="w-[118px] px-2">
                            {currencyFormatter.format(
                              totalRowResult?.refunds || 0
                            )}
                          </div>
                          <div className="w-[118px] px-2">
                            {currencyFormatter.format(
                              totalRowResult?.patientDiscounts || 0
                            )}
                          </div>
                          <div className="w-[125px] px-2">
                            {currencyFormatter.format(
                              totalRowResult?.badDebt || 0
                            )}
                          </div>
                          <div className="w-[115px] px-2">
                            {totalRowResult?.visitsCount}
                          </div>
                          <div className="w-[120px] px-2">
                            {currencyFormatter.format(
                              totalRowResult?.averageCharges || 0
                            )}
                          </div>
                          <div className="w-[122px] px-2">
                            {currencyFormatter.format(
                              totalRowResult?.receipts || 0
                            )}
                          </div>
                          <div className="w-[122px] px-2">
                            {currencyFormatter.format(
                              totalRowResult?.beginning || 0
                            )}
                          </div>
                          <div className="w-[120px] px-2">
                            {currencyFormatter.format(
                              totalRowResult?.ending || 0
                            )}
                          </div>
                          <div className="w-[120px] px-2">
                            {currencyFormatter.format(totalRowResult?.net || 0)}
                          </div>
                          <div className="w-[120px] px-2">
                            {totalRowResult?.days}
                          </div>
                          <div className="w-[120px] px-2">
                            {totalRowResult?.gross}
                          </div>
                          <div className="w-[120px] px-2">
                            {totalRowResult?.netPercentage}
                          </div>
                          <div className="w-[180px] px-2"></div>
                          <div className="w-[180px] px-2"></div>
                          <div className="w-[180px] px-2"></div>
                          <div className="w-[76px] px-2"></div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <></>
                  )}
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
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
export default EOMSummaryReport;
