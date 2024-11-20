import type { GridColDef, GridColTypeDef } from '@mui/x-data-grid-pro';
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
import RadioButton from '@/components/UI/RadioButton';
import SearchDetailGrid, {
  globalPaginationConfig,
} from '@/components/UI/SearchDetailGrid';
import SectionHeading from '@/components/UI/SectionHeading';
import type { SingleSelectDropDownDataType } from '@/components/UI/SingleSelectDropDown';
import SingleSelectDropDown from '@/components/UI/SingleSelectDropDown';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import AppTable, { AppTableCell, AppTableRow } from '@/components/UI/Table';
import AppLayout from '@/layouts/AppLayout';
import { getselectdWorkGroupsIDsSelector } from '@/store/chrome/selectors';
import {
  addToastNotification,
  fetchAssignClaimToDataRequest,
  fetchPracticeDataRequest,
  fetchProviderDataRequest,
} from '@/store/shared/actions';
import { getChargesPaymentsSummaryByProviderReport } from '@/store/shared/sagas';
import {
  getPracticeDataSelector,
  getProviderDataSelector,
} from '@/store/shared/selectors';
import type {
  ChargesPaymentsSummaryByProviderCriteria,
  ChargesPaymentsSummaryByProviderReport,
  ChargesPaymentsSummaryByProviderReportResults,
  ChargesPaymentsSummaryByProviderReportResultsTotal,
  ChargesPaymentsSummaryByProviderReportSummary,
  ChargesPaymentsSummaryByProviderReportSummaryTotal,
  GroupData,
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

const ChargesSummaryProvider = () => {
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
  const defaultSearchCriteria: ChargesPaymentsSummaryByProviderCriteria = {
    groupID: undefined,
    practiceID: undefined,
    providerIDS: [],
    fromDate: null,
    toDate: null,
    chargesBy: 'created_on',
    paymentsBy: 'created_on',
    runBy: 'both',
    getAllData: null,
    pageNumber: 1,
    pageSize: globalPaginationConfig.activePageSize,
    sortColumn: '',
    sortOrder: '',
  };
  const [lastSearchCriteria, setLastSearchCriteria] = useState(
    defaultSearchCriteria
  );
  const [isChangedJson, setIsChangedJson] = useState(false);

  const [searchCriteria, setSearchCriteria] = useState(defaultSearchCriteria);
  const setSearchCriteriaFields = (
    value: ChargesPaymentsSummaryByProviderCriteria
  ) => {
    setSearchCriteria(value);
    setIsChangedJson(true);
  };
  const [hideSearchParameters, setHideSearchParameters] =
    useState<boolean>(true);
  const selectedWorkedGroup = useSelector(getselectdWorkGroupsIDsSelector);
  const [groupDropdown, setGroupDropdown] = useState<GroupData[]>([]);
  const [practiceDropdown, setPracticeDropdown] = useState<PracticeData[]>([]);
  const [providerDropdown, setProviderDropdown] = useState<ProviderData[]>([]);

  const practiceData = useSelector(getPracticeDataSelector);
  const ProviderData = useSelector(getProviderDataSelector);
  useEffect(() => {
    if (practiceData) {
      setPracticeDropdown(practiceData || []);
      setSearchCriteria({
        ...searchCriteria,
        groupID: selectedWorkedGroup?.groupsData[0]?.id,
        practiceID: practiceData.length === 1 ? practiceData[0]?.id : undefined,
      });
    }
    if (ProviderData) {
      setProviderDropdown(ProviderData);
    }
  }, [practiceData]);

  useEffect(() => {
    if (ProviderData) {
      setProviderDropdown(ProviderData);
    }
  }, [ProviderData]);

  useEffect(() => {
    const groupId = searchCriteria?.groupID;
    if (groupId) {
      setPracticeDropdown([]);
      setProviderDropdown([]);
      dispatch(fetchPracticeDataRequest({ groupID: groupId }));
      dispatch(fetchProviderDataRequest({ groupID: groupId }));
    }
  }, [searchCriteria?.groupID]);

  useEffect(() => {
    setGroupDropdown(selectedWorkedGroup?.groupsData || []);
    setSearchCriteriaFields({
      ...searchCriteria,
      groupID: selectedWorkedGroup?.groupsData[0]?.id || undefined,
    });
    if (selectedWorkedGroup?.groupsData[0]?.id) {
      dispatch(
        fetchAssignClaimToDataRequest({
          clientID: selectedWorkedGroup?.groupsData[0]?.id,
        })
      );
      dispatch(
        fetchProviderDataRequest({
          groupID: selectedWorkedGroup?.groupsData[0]?.id,
        })
      );
    }
  }, [selectedWorkedGroup]);

  const onSelectProviders = (arr: SingleSelectDropDownDataType[]) => {
    setSearchCriteriaFields({
      ...searchCriteria,
      providerIDS: arr.map((Item) => Item.id.toString()),
    });
  };

  const [renderSearchCriteriaView, setRenderSearchCriteriaView] = useState(
    uuidv4()
  );
  const [totalSummaryData, setTotalSummaryData] =
    useState<ChargesPaymentsSummaryByProviderReportSummaryTotal[]>();
  const [totalReportDetailData, setTotalReportDetailData] =
    useState<ChargesPaymentsSummaryByProviderReportResultsTotal[]>();

  const [statusModalInfo, setStatusModalInfo] = useState({
    show: false,
    heading: '',
    text: '',
    type: StatusModalType.WARNING,
  });
  const [searchResult, setSearchResult] = useState<
    ChargesPaymentsSummaryByProviderReportResults[]
  >([]);
  const [summaryData, setSummaryData] = useState<
    ChargesPaymentsSummaryByProviderReportSummary[]
  >([]);
  const getSearchData = async (
    obj: ChargesPaymentsSummaryByProviderCriteria
  ) => {
    const res = await getChargesPaymentsSummaryByProviderReport(obj);
    if (res) {
      setSearchResult(res.chargesPaymentsSummaryByProviderReportData);
      setSummaryData(res.summary);
      setTotalReportDetailData(
        res.chargesPaymentsSummaryByProviderReportDataTotal
      );
      setTotalSummaryData(res.summaryTotal);
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
  const reportSummaryColumns: GridColDef[] = [
    {
      field: 'provider',
      headerName: 'Provider',
      flex: 1,
      minWidth: 180,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-sm font-normal leading-5 text-cyan-500 underline"
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
      field: 'chargesAmount',
      headerName: 'Charges Amount',
      ...usdPrice,
      flex: 1,
      minWidth: 140,
      disableReorder: true,
    },
    {
      field: 'insurancePayment',
      headerName: 'Insurance Payment',
      ...usdPrice,
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'insuranceAdjustment',
      headerName: 'Insurance Adjustment',
      ...usdPrice,
      minWidth: 170,
      flex: 1,
      disableReorder: true,
    },
    {
      field: 'insuranceRefund',
      headerName: 'Insurance Refund',
      ...usdPrice,
      flex: 1,
      minWidth: 140,
      disableReorder: true,
    },
    {
      field: 'patientPayment',
      headerName: 'Patient Payment',
      ...usdPrice,
      flex: 1,
      minWidth: 135,
      disableReorder: true,
    },
    {
      field: 'patientAdjustment',
      headerName: 'Patient Adjustment',
      ...usdPrice,
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'patientRefund',
      headerName: 'Patient Refund',
      ...usdPrice,
      flex: 1,
      minWidth: 135,
      disableReorder: true,
    },
  ];
  const reportDetailsColumns: GridColDef[] = [
    {
      field: 'practice',
      headerName: 'Practice',
      flex: 1,
      minWidth: 230,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="cursor-pointer text-sm font-normal leading-5 text-cyan-500 underline">
              {params.value}
            </div>
            <div
              className="text-xs font-normal leading-4 text-gray-500"
              onClick={() => {}}
            >
              {params.row.practiceAddress}
            </div>
          </div>
        );
      },
    },
    {
      field: 'provider',
      headerName: 'Provider',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="cursor-pointer text-sm font-normal leading-5 text-cyan-500 underline">
              {params.value}
            </div>
            <div
              className="text-xs font-normal leading-4 text-gray-500"
              onClick={() => {}}
            >
              NPI: {params.row.providerNPI}
            </div>
          </div>
        );
      },
    },
    {
      field: 'date',
      headerName: 'Date',
      minWidth: 130,
      flex: 1,
      disableReorder: true,
    },
    {
      field: 'chargesAmount',
      headerName: 'Charges Amount',
      ...usdPrice,
      flex: 1,
      minWidth: 135,
      disableReorder: true,
    },
    {
      field: 'insurancePayment',
      headerName: 'Insurance Payment',
      ...usdPrice,
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'insuranceAdjustment',
      headerName: 'Insurance Adjustment',
      ...usdPrice,
      flex: 1,
      minWidth: 165,
      disableReorder: true,
    },
    {
      field: 'insuranceRefund',
      headerName: 'Insurance Refund',
      ...usdPrice,
      flex: 1,
      minWidth: 140,
      disableReorder: true,
    },
    {
      field: 'patientPayment',
      headerName: 'Patient Payment',
      ...usdPrice,
      flex: 1,
      minWidth: 135,
      disableReorder: true,
    },
    {
      field: 'patientAdjustment',
      headerName: 'Patient Adjustment',
      ...usdPrice,
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'patientRefund',
      headerName: 'Patient Refund',
      ...usdPrice,
      flex: 1,
      minWidth: 135,
      disableReorder: true,
    },
  ];

  const [reportCollapseInfo, setReportCollapseInfo] = useState({
    summary: false,
    detail: false,
  });

  const downloadPdf = (
    pdfExportData: ChargesPaymentsSummaryByProviderReport
  ) => {
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
    if (searchCriteria.groupID) {
      const groupName = groupDropdown.filter(
        (m) => m.id === searchCriteria.groupID
      )[0]?.value;
      criteriaArray.push({ Criteria: 'Group', Value: groupName || '' });
    }
    if (searchCriteria.practiceID) {
      const pName = practiceDropdown.filter(
        (m) => m.id === searchCriteria.practiceID
      )[0]?.value;
      criteriaArray.push({ Criteria: 'Practice', Value: pName || '' });
    }
    if (searchCriteria.providerIDS) {
      const providers = searchCriteria.providerIDS?.map((providerID) => {
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
    if (searchCriteria.fromDate) {
      criteriaArray.push({
        Criteria: 'From Date',
        Value: searchCriteria.fromDate,
      });
    }
    if (searchCriteria.toDate) {
      criteriaArray.push({ Criteria: 'To Date', Value: searchCriteria.toDate });
    }
    if (searchCriteria.chargesBy) {
      let mySelectedCriteria = '';
      if (searchCriteria.chargesBy === 'created_on') {
        mySelectedCriteria = 'Entry Date';
      } else if (searchCriteria.chargesBy === 'payment_date') {
        mySelectedCriteria = 'Posting Date';
      } else if (searchCriteria.chargesBy === 'deposit_date') {
        mySelectedCriteria = 'Deposit Date';
      } else {
        mySelectedCriteria = ''; // Optional: a default value if no match is found
      }

      criteriaArray.push({
        Criteria: 'Charges By',
        Value: mySelectedCriteria,
      });
    }
    if (searchCriteria.paymentsBy) {
      let mySelectedCriteria = '';
      if (searchCriteria.paymentsBy === 'created_on') {
        mySelectedCriteria = 'Entry Date';
      } else if (searchCriteria.paymentsBy === 'payment_date') {
        mySelectedCriteria = 'Posting Date';
      } else if (searchCriteria.paymentsBy === 'deposit_date') {
        mySelectedCriteria = 'Deposit Date';
      } else {
        mySelectedCriteria = ''; // Optional: a default value if no match is found
      }
      criteriaArray.push({
        Criteria: 'Payments By',
        Value: mySelectedCriteria,
      });
    }
    if (searchCriteria.runBy) {
      criteriaArray.push({ Criteria: 'Run By', Value: searchCriteria.runBy });
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
    const reportDetails: PDFRowInput[] =
      pdfExportData.chargesPaymentsSummaryByProviderReportData.map((m) => {
        return {
          Practice: m.practice,
          Provider: m.provider,
          'Provider NPI': m.providerNPI,
          Date: m.date,
          'Charges Amount': currencyFormatter.format(m.chargesAmount),
          'Insurance Payment': currencyFormatter.format(m.insurancePayment),
          'Insurance Adjustment': currencyFormatter.format(
            m.insuranceAdjustment
          ),
          'Insurance Refund': currencyFormatter.format(m.insuranceRefund),
          'Patient Payment': currencyFormatter.format(m.patientPayment),
          'Patient Adjustment': currencyFormatter.format(m.patientAdjustment),
          'Patient Refund': currencyFormatter.format(m.patientRefund),
        };
      });
    const reportDetailTotal = {
      Practice: 'Total',
      Provider: '',
      'Provider NPI': '',
      Date: '',
      'Charges Amount':
        totalReportDetailData && totalReportDetailData[0]
          ? currencyFormatter.format(totalReportDetailData[0].chargesAmount)
          : '$0.00',
      'Insurance Payment':
        totalReportDetailData && totalReportDetailData[0]
          ? currencyFormatter.format(totalReportDetailData[0].insurancePayment)
          : '$0.00',
      'Insurance Adjustment':
        totalReportDetailData && totalReportDetailData[0]
          ? currencyFormatter.format(
              totalReportDetailData[0].insuranceAdjustment
            )
          : '$0.00',
      'Insurance Refund':
        totalReportDetailData && totalReportDetailData[0]
          ? currencyFormatter.format(totalReportDetailData[0].insuranceRefund)
          : '$0.00',
      'Patient Payment':
        totalReportDetailData && totalReportDetailData[0]
          ? currencyFormatter.format(totalReportDetailData[0].patientPayment)
          : '$0.00',
      'Patient Adjustment':
        totalReportDetailData && totalReportDetailData[0]
          ? currencyFormatter.format(totalReportDetailData[0].patientAdjustment)
          : '$0.00',
      'Patient Refund':
        totalReportDetailData && totalReportDetailData[0]
          ? currencyFormatter.format(totalReportDetailData[0].patientRefund)
          : '$0.00',
    };
    const dataColumns: PDFColumnInput[] = [];
    const keyNames = reportDetails[0] && Object.keys(reportDetails[0]);
    if (keyNames) {
      for (let i = 0; i < keyNames.length; i += 1) {
        dataColumns.push({ title: keyNames[i], dataKey: keyNames[i] });
      }
    }
    data.push({
      columns: dataColumns,
      body: [...reportDetails, reportDetailTotal],
    });
    // implement summary
    const summaryExportData: PDFRowInput[] = summaryData.map((n) => {
      return {
        Provider: n.provider,
        'Provider NPI': n.providerNPI,
        'Charges Amount': currencyFormatter.format(n.chargesAmount),
        'Insurance Payment': currencyFormatter.format(n.insurancePayment),
        'Insurance Adjustment': currencyFormatter.format(n.insuranceAdjustment),
        'Insurance Refund': currencyFormatter.format(n.insuranceRefund),
        'Patient Payment': currencyFormatter.format(n.patientPayment),
        'Patient Adjustment': currencyFormatter.format(n.patientAdjustment),
        'Patient Refund': currencyFormatter.format(n.patientRefund),
      };
    });
    const summaryTotal = {
      Provider: 'Total',
      'Provider NPI': '',
      'Charges Amount':
        totalSummaryData && totalSummaryData[0]
          ? currencyFormatter.format(totalSummaryData[0].chargesAmount)
          : '$0.00',
      'Insurance Payment':
        totalSummaryData && totalSummaryData[0]
          ? currencyFormatter.format(totalSummaryData[0].insurancePayment)
          : '$0.00',
      'Insurance Adjustment':
        totalSummaryData && totalSummaryData[0]
          ? currencyFormatter.format(totalSummaryData[0].insuranceAdjustment)
          : '$0.00',
      'Insurance Refund':
        totalSummaryData && totalSummaryData[0]
          ? currencyFormatter.format(totalSummaryData[0].insuranceRefund)
          : '$0.00',
      'Patient Payment':
        totalSummaryData && totalSummaryData[0]
          ? currencyFormatter.format(totalSummaryData[0].patientPayment)
          : '$0.00',
      'Patient Adjustment':
        totalSummaryData && totalSummaryData[0]
          ? currencyFormatter.format(totalSummaryData[0].patientAdjustment)
          : '$0.00',
      'Patient Refund':
        totalSummaryData && totalSummaryData[0]
          ? currencyFormatter.format(totalSummaryData[0].patientRefund)
          : '$0.00',
    };
    const summaryColumns: PDFColumnInput[] = [];
    const keyNames2 = summaryExportData[0] && Object.keys(summaryExportData[0]);
    if (keyNames2) {
      for (let i = 0; i < keyNames2.length; i += 1) {
        summaryColumns.push({ title: keyNames2[i], dataKey: keyNames2[i] });
      }
    }
    data.push({
      columns: summaryColumns,
      body: [...summaryExportData, summaryTotal],
    });
    ExportDataToPDF(data, 'Charges / Payments Summary by Provider Report');
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
    const obj: ChargesPaymentsSummaryByProviderCriteria = {
      groupID: searchCriteria.groupID,
      practiceID: searchCriteria.practiceID,
      providerIDS: searchCriteria.providerIDS,
      fromDate: searchCriteria.fromDate,
      toDate: searchCriteria.toDate,
      chargesBy: searchCriteria.chargesBy,
      paymentsBy: searchCriteria.paymentsBy,
      runBy: searchCriteria.runBy,
      sortColumn: '',
      sortOrder: '',
      pageNumber: undefined,
      pageSize: undefined,
      getAllData: true,
    };
    const res = await getChargesPaymentsSummaryByProviderReport(obj);
    if (res) {
      if (type === 'pdf') {
        downloadPdf(res);
      } else {
        const exportDataArray =
          res.chargesPaymentsSummaryByProviderReportData.map((n) => {
            return {
              Practice: n.practice,
              Provider: n.provider,
              'Provider NPI': n.providerNPI,
              Date: n.date,
              'Charges Amount': currencyFormatter.format(n.chargesAmount),
              'Insurance Payment': currencyFormatter.format(n.insurancePayment),
              'Insurance Adjustment': currencyFormatter.format(
                n.insuranceAdjustment
              ),
              'Insurance Refund': currencyFormatter.format(n.insuranceRefund),
              'Patient Payment': currencyFormatter.format(n.patientPayment),
              'Patient Adjustment': currencyFormatter.format(
                n.patientAdjustment
              ),
              'Patient Refund': currencyFormatter.format(n.patientRefund),
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
            Practice: 'Criteria',
            Provider: 'Value',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            Practice: 'Group',
            Provider:
              groupDropdown.filter(
                (m) => m.id === Number(searchCriteria.groupID)
              )[0]?.value || '',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            Practice: 'Practice',
            Provider:
              practiceDropdown.filter(
                (m) => m.id === searchCriteria.practiceID
              )[0]?.value || '',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          const providers = searchCriteria.providerIDS?.map((providerID) => {
            const provider = providerDropdown.find(
              (m) => m.id === Number(providerID)
            );
            return provider ? provider.value : '';
          });
          criteriaObj = {
            ...criteriaObj,
            Practice: 'Provider',
            Provider: providers?.join(', ') || '',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            Practice: 'Date - From',
            Provider: searchCriteria.fromDate || '',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            Practice: 'Date - To',
            Provider: searchCriteria.toDate || '',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          if (searchCriteria.chargesBy) {
            let mySelectedCriteria = '';
            if (searchCriteria.chargesBy === 'created_on') {
              mySelectedCriteria = 'Entry Date';
            } else if (searchCriteria.chargesBy === 'payment_date') {
              mySelectedCriteria = 'Posting Date';
            } else if (searchCriteria.chargesBy === 'deposit_date') {
              mySelectedCriteria = 'Deposit Date';
            } else {
              mySelectedCriteria = ''; // Optional: a default value if no match is found
            }
            criteriaObj = {
              ...criteriaObj,
              Practice: 'Charges By',
              Provider: mySelectedCriteria || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }

          if (searchCriteria.paymentsBy) {
            let mySelectedCriteria = '';
            if (searchCriteria.paymentsBy === 'created_on') {
              mySelectedCriteria = 'Entry Date';
            } else if (searchCriteria.paymentsBy === 'payment_date') {
              mySelectedCriteria = 'Posting Date';
            } else if (searchCriteria.paymentsBy === 'deposit_date') {
              mySelectedCriteria = 'Deposit Date';
            } else {
              mySelectedCriteria = ''; // Optional: a default value if no match is found
            }
            criteriaObj = {
              ...criteriaObj,
              Practice: 'Payments By',
              Provider: mySelectedCriteria,
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }

          criteriaObj = {
            ...criteriaObj,
            Practice: 'Run By',
            Provider: searchCriteria.runBy || '',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));

          criteriaObj = Object.fromEntries(headerArray.map((key) => [key, '']));
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            Practice: 'Charges Summary Report',
            Provider: '',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = Object.fromEntries(headerArray.map((key) => [key, '']));
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            Practice: 'Provider',
            Provider: 'Provider NPI',
            'Provider NPI': 'Charges Amount',
            Date: 'Insurance Payment',
            'Charges Amount': 'Insurance Adjustment',
            'Insurance Payment': 'Insurance Refund',
            'Insurance Adjustment': 'Patient Payment',
            'Insurance Refund': 'Patient Adjustment',
            'Patient Payment': 'Patient Refund',
          };
          criteriaArray.push(criteriaObj);
          const exportSummaryData = res.summary.map((s) => {
            return {
              Practice: s.provider,
              Provider: s.providerNPI,
              'Provider NPI': currencyFormatter.format(s.chargesAmount),
              Date: currencyFormatter.format(s.insurancePayment),
              'Charges Amount': currencyFormatter.format(s.insuranceAdjustment),
              'Insurance Payment': currencyFormatter.format(s.insuranceRefund),
              'Insurance Adjustment': currencyFormatter.format(
                s.patientPayment
              ),
              'Insurance Refund': currencyFormatter.format(s.patientAdjustment),
              'Patient Payment': currencyFormatter.format(s.patientRefund),
            };
          });
          criteriaArray.push(...exportSummaryData);
          criteriaObj = {
            ...criteriaObj,
            Practice: 'Total',
            Provider: '',
            'Provider NPI':
              totalSummaryData && totalSummaryData[0]
                ? currencyFormatter.format(totalSummaryData[0]?.chargesAmount)
                : '$0.00',
            Date:
              totalSummaryData && totalSummaryData[0]
                ? currencyFormatter.format(
                    totalSummaryData[0]?.insurancePayment
                  )
                : '$0.00',
            'Charges Amount':
              totalSummaryData && totalSummaryData[0]
                ? currencyFormatter.format(
                    totalSummaryData[0]?.insuranceAdjustment
                  )
                : '$0.00',
            'Insurance Payment':
              totalSummaryData && totalSummaryData[0]
                ? currencyFormatter.format(totalSummaryData[0]?.insuranceRefund)
                : '$0.00',
            'Insurance Adjustment':
              totalSummaryData && totalSummaryData[0]
                ? currencyFormatter.format(totalSummaryData[0]?.patientPayment)
                : '$0.00',
            'Insurance Refund':
              totalSummaryData && totalSummaryData[0]
                ? currencyFormatter.format(
                    totalSummaryData[0]?.patientAdjustment
                  )
                : '$0.00',
            'Patient Payment':
              totalSummaryData && totalSummaryData[0]
                ? currencyFormatter.format(totalSummaryData[0]?.patientRefund)
                : '$0.00',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = Object.fromEntries(headerArray.map((key) => [key, '']));
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            Practice: 'Charges Details Report',
            Provider: '',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = Object.fromEntries(headerArray.map((key) => [key, '']));
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = Object.fromEntries(
            headerArray.map((key) => [key, key])
          );
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaArray.push(...exportDataArray);

          // Now add totalReportDetailData to the end
          criteriaObj = {
            ...criteriaObj,
            Practice: 'Total',
            Provider: '',
            'Provider NPI': '',
            Date: '',
            'Charges Amount':
              totalReportDetailData && totalReportDetailData[0]
                ? currencyFormatter.format(
                    totalReportDetailData[0]?.chargesAmount
                  )
                : '$0.00',
            'Insurance Payment':
              totalReportDetailData && totalReportDetailData[0]
                ? currencyFormatter.format(
                    totalReportDetailData[0]?.insurancePayment
                  )
                : '$0.00',
            'Insurance Adjustment':
              totalReportDetailData && totalReportDetailData[0]
                ? currencyFormatter.format(
                    totalReportDetailData[0]?.insuranceAdjustment
                  )
                : '$0.00',
            'Insurance Refund':
              totalReportDetailData && totalReportDetailData[0]
                ? currencyFormatter.format(
                    totalReportDetailData[0]?.insuranceRefund
                  )
                : '$0.00',
            'Patient Payment':
              totalReportDetailData && totalReportDetailData[0]
                ? currencyFormatter.format(
                    totalReportDetailData[0]?.patientPayment
                  )
                : '$0.00',
            'Patient Adjustment':
              totalReportDetailData && totalReportDetailData[0]
                ? currencyFormatter.format(
                    totalReportDetailData[0]?.patientAdjustment
                  )
                : '$0.00',
            'Patient Refund':
              totalReportDetailData && totalReportDetailData[0]
                ? currencyFormatter.format(
                    totalReportDetailData[0]?.patientRefund
                  )
                : '$0.00',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));

          // Now, you have totalReportDetailData at the end of criteriaArray
          const exportArray = criteriaArray;
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
            ExportDataToCSV(exportArray, 'ChargesSummaryByProvider');
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
              'ChargesSummaryByProvider',
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
  const onSelectExportOption = (res: SingleSelectDropDownDataType[]) => {
    if (!searchResult.length && !summaryData.length) {
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

  return (
    <AppLayout title="Nucleus - Charges / Payments Summary by Provider Report">
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
                          Charges / Payments Summary by Provider Report
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
                        <div className="flex gap-8">
                          <div className="w-[50%] lg:w-[75%]">
                            <div className="px-[5px] pb-[5px]">
                              <p className="text-base font-bold leading-normal text-gray-700">
                                Location
                              </p>
                            </div>
                            <div className="flex w-full flex-wrap">
                              <div className={`w-[33.3%] px-[8px]`}>
                                <div
                                  className={`w-full items-start self-stretch`}
                                >
                                  <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                    Group
                                  </div>
                                  <div className="w-full">
                                    <SingleSelectDropDown
                                      placeholder="Select Group"
                                      showSearchBar={true}
                                      disabled={false}
                                      data={
                                        groupDropdown as SingleSelectDropDownDataType[]
                                      }
                                      selectedValue={
                                        groupDropdown.filter(
                                          (f) =>
                                            f.id === searchCriteria?.groupID
                                        )[0]
                                      }
                                      onSelect={(value) => {
                                        setSearchCriteriaFields({
                                          ...searchCriteria,
                                          groupID: value.id,
                                        });
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className={`w-[33.3%] px-[8px]`}>
                                <div
                                  className={`w-full items-start self-stretch`}
                                >
                                  <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                    Practice
                                  </div>
                                  <div className="w-full">
                                    <SingleSelectDropDown
                                      placeholder="Select Practice"
                                      showSearchBar={true}
                                      disabled={false}
                                      data={
                                        practiceDropdown as SingleSelectDropDownDataType[]
                                      }
                                      selectedValue={
                                        practiceDropdown.filter(
                                          (f) =>
                                            f.id === searchCriteria?.practiceID
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
                              <div className={`w-[33.3%] px-[8px]`}>
                                <div
                                  className={`w-full items-start self-stretch`}
                                >
                                  <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                    Provider
                                  </div>
                                  <div className="w-full">
                                    <MultiSelectDropDown
                                      placeholder="Select Providers"
                                      showSearchBar={true}
                                      disabled={false}
                                      data={providerDropdown}
                                      selectedValue={providerDropdown.filter(
                                        (m) =>
                                          searchCriteria.providerIDS?.includes(
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
                          <div className="w-[50%] px-[6px] lg:w-[30%]">
                            <div className="pb-[5px]">
                              <p className="text-base font-bold leading-normal text-gray-700">
                                Date
                              </p>
                            </div>
                            <div className="flex w-full flex-wrap">
                              <div className={`w-[50%] pr-[8px]`}>
                                <div
                                  className={`w-full items-start self-stretch`}
                                >
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
                              <div className={`w-[50%] pl-[8px]`}>
                                <div
                                  className={`w-full items-start self-stretch`}
                                >
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
                    <div className={`px-[5px] py-[20px]`}>
                      <div className={`h-[1px] w-full bg-gray-200`} />
                    </div>
                    <div className="w-[100%] lg:w-[100%]">
                      <div className="px-[2px] pb-[5px]">
                        <p className="text-base font-bold leading-normal text-gray-700">
                          Other
                        </p>
                      </div>
                      <div className="flex w-full flex-wrap">
                        <div className={`w-[23%] px-[5px]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Charges by:
                            </div>
                            <div className="mt-[4px] flex h-[38px] w-full items-center">
                              <RadioButton
                                data={[
                                  {
                                    value: 'from_dos',
                                    label: 'Date of Service',
                                  },
                                  {
                                    value: 'created_on',
                                    label: 'Entry Date',
                                  },
                                ]}
                                checkedValue={
                                  searchCriteria.chargesBy
                                    ? searchCriteria.chargesBy
                                    : 'created_on'
                                }
                                onChange={(e) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    chargesBy: e.target.value,
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
                        <div className={`w-[34%] px-[15px]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Payments by:
                            </div>
                            <div className="mt-[4px] flex h-[38px] w-full items-center">
                              <RadioButton
                                data={[
                                  {
                                    value: 'payment_date',
                                    label: 'Posting Date',
                                  },
                                  {
                                    value: 'deposit_date',
                                    label: 'Deposit Date',
                                  },
                                  {
                                    value: 'created_on',
                                    label: 'Entry Date',
                                  },
                                ]}
                                checkedValue={
                                  searchCriteria.paymentsBy
                                    ? searchCriteria.paymentsBy
                                    : 'created_on'
                                }
                                onChange={(e) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    paymentsBy: e.target.value,
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
                        <div className={`w-[35%] px-[15px]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Run by:
                            </div>
                            <div className="mt-[4px] flex h-[38px] w-full items-center">
                              <RadioButton
                                data={[
                                  {
                                    value: 'detail',
                                    label: 'Details',
                                  },
                                  {
                                    value: 'summary',
                                    label: 'Summary',
                                  },
                                  {
                                    value: 'both',
                                    label: 'Both',
                                  },
                                ]}
                                checkedValue={
                                  searchCriteria.runBy
                                    ? searchCriteria.runBy
                                    : 'both'
                                }
                                onChange={(e) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    runBy: e.target.value,
                                  });
                                }}
                              />
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
                    <div className={'px-[15px]'}>
                      <div className={`w-[1px] h-[35px] bg-gray-300`} />
                    </div>

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
              <div className="w-full gap-4 bg-white px-7 pt-[25px] pb-[15px]">
                <div className="w-full gap-4 bg-white  pt-[25px] pb-[15px]">
                  <SectionHeading
                    label="Report Summary"
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
                    <div hidden={reportCollapseInfo.summary} className="w-full">
                      <SearchDetailGrid
                        hideHeader={true}
                        rows={
                          summaryData.map((row) => {
                            return { ...row, id: row.providerID };
                          }) || []
                        }
                        columns={reportSummaryColumns}
                        checkboxSelection={false}
                        footerContent={
                          <>
                            <AppTable
                              cls="max-h-[400px]  mt-3.5"
                              renderHead={undefined}
                              renderBody={
                                <>
                                  <AppTableRow cls="bg-cyan-50">
                                    <AppTableCell cls="!font-bold !text-cyan-500 !w-[180px]">
                                      Total
                                    </AppTableCell>
                                    <AppTableCell cls="!w-[140px]">
                                      {totalSummaryData &&
                                        (totalSummaryData[0]?.chargesAmount ||
                                          totalSummaryData[0]?.chargesAmount ===
                                            0) &&
                                        currencyFormatter.format(
                                          totalSummaryData[0].chargesAmount
                                        )}
                                    </AppTableCell>
                                    <AppTableCell cls="!w-[150px]">
                                      {totalSummaryData &&
                                        (totalSummaryData[0]
                                          ?.insurancePayment ||
                                          totalSummaryData[0]
                                            ?.insurancePayment === 0) &&
                                        currencyFormatter.format(
                                          totalSummaryData[0].insurancePayment
                                        )}
                                    </AppTableCell>
                                    <AppTableCell cls="!w-[170px]">
                                      {totalSummaryData &&
                                        (totalSummaryData[0]
                                          ?.insuranceAdjustment ||
                                          totalSummaryData[0]
                                            ?.insuranceAdjustment === 0) &&
                                        currencyFormatter.format(
                                          totalSummaryData[0]
                                            .insuranceAdjustment
                                        )}
                                    </AppTableCell>
                                    <AppTableCell cls="!w-[140px]">
                                      {totalSummaryData &&
                                        (totalSummaryData[0]?.insuranceRefund ||
                                          totalSummaryData[0]
                                            ?.insuranceRefund === 0) &&
                                        currencyFormatter.format(
                                          totalSummaryData[0].insuranceRefund
                                        )}
                                    </AppTableCell>
                                    <AppTableCell cls="!w-[135px]">
                                      {totalSummaryData &&
                                        (totalSummaryData[0]?.patientPayment ||
                                          totalSummaryData[0]
                                            ?.patientPayment === 0) &&
                                        currencyFormatter.format(
                                          totalSummaryData[0].patientPayment
                                        )}
                                    </AppTableCell>
                                    <AppTableCell cls="!w-[150px]">
                                      {totalSummaryData &&
                                        (totalSummaryData[0]
                                          ?.patientAdjustment ||
                                          totalSummaryData[0]
                                            ?.patientAdjustment === 0) &&
                                        currencyFormatter.format(
                                          totalSummaryData[0].patientAdjustment
                                        )}
                                    </AppTableCell>
                                    <AppTableCell cls="!w-[135px]">
                                      {totalSummaryData &&
                                        (totalSummaryData[0]?.patientRefund ||
                                          totalSummaryData[0]?.patientRefund ===
                                            0) &&
                                        currencyFormatter.format(
                                          totalSummaryData[0].patientRefund
                                        )}
                                    </AppTableCell>
                                  </AppTableRow>
                                </>
                              }
                            />
                          </>
                        }
                        footerPaginationContent={false}
                      />
                    </div>
                  </div>
                </div>
                <SectionHeading
                  label="Report Details"
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
                <div className="flex w-full flex-col rounded-lg pt-[20px]">
                  <div hidden={reportCollapseInfo.detail} className="h-full">
                    <SearchDetailGrid
                      pageNumber={lastSearchCriteria.pageNumber}
                      pageSize={lastSearchCriteria.pageSize}
                      totalCount={searchResult[0]?.total}
                      rows={searchResult}
                      persistLayoutId={25}
                      showTableHeading={false}
                      columns={reportDetailsColumns}
                      checkboxSelection={false}
                      onPageChange={(page: number) => {
                        const obj: ChargesPaymentsSummaryByProviderCriteria = {
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
                          const obj: ChargesPaymentsSummaryByProviderCriteria =
                            {
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
                          const obj: ChargesPaymentsSummaryByProviderCriteria =
                            {
                              ...lastSearchCriteria,
                              pageSize,
                              pageNumber: page,
                            };
                          setLastSearchCriteria(obj);
                          getSearchData(obj);
                        }
                      }}
                      footerContent={
                        <>
                          <AppTable
                            cls="max-h-[400px]  mt-3.5"
                            renderHead={undefined}
                            renderBody={
                              <>
                                <AppTableRow cls="bg-cyan-50">
                                  <AppTableCell cls="!font-bold !text-cyan-500 !w-[230px]">
                                    Total
                                  </AppTableCell>
                                  <AppTableCell cls="!w-[150px]">
                                    {''}
                                  </AppTableCell>
                                  <AppTableCell cls="!w-[130px]">
                                    {''}
                                  </AppTableCell>
                                  <AppTableCell cls="!w-[135px]">
                                    {totalReportDetailData &&
                                      (totalReportDetailData[0]
                                        ?.chargesAmount ||
                                        totalReportDetailData[0]
                                          ?.chargesAmount === 0) &&
                                      currencyFormatter.format(
                                        totalReportDetailData[0].chargesAmount
                                      )}
                                  </AppTableCell>
                                  <AppTableCell cls="!w-[150px]">
                                    {totalReportDetailData &&
                                      (totalReportDetailData[0]
                                        ?.insurancePayment ||
                                        totalReportDetailData[0]
                                          ?.insurancePayment === 0) &&
                                      currencyFormatter.format(
                                        totalReportDetailData[0]
                                          .insurancePayment
                                      )}
                                  </AppTableCell>
                                  <AppTableCell cls="!w-[165px]">
                                    {totalReportDetailData &&
                                      (totalReportDetailData[0]
                                        ?.insuranceAdjustment ||
                                        totalReportDetailData[0]
                                          ?.insuranceAdjustment === 0) &&
                                      currencyFormatter.format(
                                        totalReportDetailData[0]
                                          .insuranceAdjustment
                                      )}
                                  </AppTableCell>
                                  <AppTableCell cls="!w-[140px]">
                                    {totalReportDetailData &&
                                      (totalReportDetailData[0]
                                        ?.insuranceRefund ||
                                        totalReportDetailData[0]
                                          ?.insuranceRefund === 0) &&
                                      currencyFormatter.format(
                                        totalReportDetailData[0].insuranceRefund
                                      )}
                                  </AppTableCell>
                                  <AppTableCell cls="!w-[135px]">
                                    {totalReportDetailData &&
                                      (totalReportDetailData[0]
                                        ?.patientPayment ||
                                        totalReportDetailData[0]
                                          ?.patientPayment === 0) &&
                                      currencyFormatter.format(
                                        totalReportDetailData[0].patientPayment
                                      )}
                                  </AppTableCell>
                                  <AppTableCell cls="!w-[150px]">
                                    {totalReportDetailData &&
                                      (totalReportDetailData[0]
                                        ?.patientAdjustment ||
                                        totalReportDetailData[0]
                                          ?.patientAdjustment === 0) &&
                                      currencyFormatter.format(
                                        totalReportDetailData[0]
                                          .patientAdjustment
                                      )}
                                  </AppTableCell>
                                  <AppTableCell cls="!w-[135px]">
                                    {totalReportDetailData &&
                                      (totalReportDetailData[0]
                                        ?.patientRefund ||
                                        totalReportDetailData[0]
                                          ?.patientRefund === 0) &&
                                      currencyFormatter.format(
                                        totalReportDetailData[0].patientRefund
                                      )}
                                  </AppTableCell>
                                </AppTableRow>
                              </>
                            }
                          />
                        </>
                      }
                    />
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
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
export default ChargesSummaryProvider;
