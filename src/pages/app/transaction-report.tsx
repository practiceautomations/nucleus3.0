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
import InputField from '@/components/UI/InputField';
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
  fetchFacilityDataRequest,
  fetchPracticeDataRequest,
  fetchProviderDataRequest,
  getLookupDropdownsRequest,
} from '@/store/shared/actions';
import {
  fetchInsuranceData,
  fetchLedgerAccount,
  fetchPaymentReportSearchData,
  getReasonCode,
} from '@/store/shared/sagas';
import {
  getAllInsuranceDataSelector,
  getAssignClaimToDataSelector,
  getFacilityDataSelector,
  getLookupDropdownsDataSelector,
  getPracticeDataSelector,
  getProviderDataSelector,
} from '@/store/shared/selectors';
import type {
  AllInsuranceData,
  FacilityData,
  GetPaymentReportCriteria,
  GetPaymentReportResult,
  GetPaymentReportsAPIResult,
  GetPaymentReportsSummaryResult,
  GroupData,
  PracticeData,
  ProviderData,
  ReasonCodeType,
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

const PaymentBatch = () => {
  const dispatch = useDispatch();
  const lookupsData = useSelector(getLookupDropdownsDataSelector);
  const insuranceData = useSelector(getAllInsuranceDataSelector);
  const practiceData = useSelector(getPracticeDataSelector);
  const providersData = useSelector(getProviderDataSelector);
  const assignClaimToData = useSelector(getAssignClaimToDataSelector);
  const facilityData = useSelector(getFacilityDataSelector);
  const [reasonCodeData, setReasonCodeData] = useState<ReasonCodeType[]>([]);
  const [practiceDropdown, setPracticeDropdown] = useState<PracticeData[]>([]);
  const [providerDropdown, setProviderDropdown] = useState<ProviderData[]>([]);
  const [facilityDropdown, setFacilityDropdown] = useState<FacilityData[]>([]);
  const [insuranceAllData, setInsuanceAllData] = useState<AllInsuranceData[]>(
    []
  );
  const getReasonCodeData = async (value: string) => {
    const res = await getReasonCode(value);
    if (res) {
      setReasonCodeData(res);
    }
  };
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
  const [ledgerAccountDropdown, setLedgerAccountDropdown] = useState<
    SingleSelectDropDownDataType[]
  >([]);
  const [isChangedJson, setIsChangedJson] = useState(false);
  const [reportCollapseInfo, setReportCollapseInfo] = useState({
    summary: false,
    detail: false,
  });
  const [statusModalInfo, setStatusModalInfo] = useState({
    show: false,
    heading: '',
    text: '',
    type: StatusModalType.WARNING,
  });
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
  const [searchCriteria, setSearchCriteria] = useState(defaultSearchCriteria);
  const [renderSearchCriteriaView, setRenderSearchCriteriaView] = useState(
    uuidv4()
  );
  const [searchResult, setSearchResult] = useState<GetPaymentReportResult[]>(
    []
  );
  const [summaryResult, setSummaryResult] = useState<
    GetPaymentReportsSummaryResult[]
  >([]);
  const [totalCount, setTotalCount] = useState<number>(0);

  const setSearchCriteriaFields = (value: GetPaymentReportCriteria) => {
    setSearchCriteria(value);
    setIsChangedJson(true);
  };

  const getSearchData = async (obj: GetPaymentReportCriteria) => {
    const res = await fetchPaymentReportSearchData(obj);
    if (res) {
      const paymentReportsResults = res.paymentReportsData;
      setSearchResult(paymentReportsResults);
      setTotalCount(paymentReportsResults[0]?.total || 0);
      setLastSearchCriteria(obj);
      setSummaryResult(res.summary);
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
    if (searchResult) setSearchResult([]);
    if (summaryResult) setSummaryResult([]);
    const obj = {
      ...searchCriteria,
      sortColumn: '',
      sortOrder: '',
      pageNumber: 1,
    };
    setSearchCriteria(obj);
    getSearchData(obj);
  };

  const getLedgerAccount = async () => {
    const res = await fetchLedgerAccount();
    if (res) {
      setLedgerAccountDropdown(res);
    }
  };

  const initProfile = () => {
    dispatch(getLookupDropdownsRequest());
    fetchInsuranceData();
    getLedgerAccount();
    getReasonCodeData('');
  };
  useEffect(() => {
    initProfile();
  }, []);

  const columns: GridColDef[] = [
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
      field: 'facility',
      headerName: 'Facility',
      flex: 1,
      minWidth: 230,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="cursor-pointer text-cyan-500" onClick={() => {}}>
              {params.value}
            </div>
            <div className="text-xs font-normal leading-4">
              {params.row.facilityAddress
                ? `${params.row.facilityAddress}`
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
      field: 'ledgerType',
      headerName: 'Ledger Type',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'paymentType',
      headerName: 'Payment Type',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
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
            <div className="cursor-pointer text-cyan-500" onClick={() => {}}>
              {params.value}
            </div>
            <div className="text-xs font-normal leading-4">
              {params.row.providerNPI ? `NPI: ${params.row.providerNPI}` : ''}
            </div>
          </div>
        );
      },
    },
    {
      field: 'paymentNumber',
      headerName: 'Payment Number',
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
    {
      field: 'fromDOS',
      headerName: 'DoS',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            {params.value} {params.row.toDOS ? `- ${params.row.toDOS}` : ''}
          </div>
        );
      },
    },
    {
      field: 'paymentDate',
      headerName: 'Payment Date',
      flex: 1,
      minWidth: 130,
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
      field: 'createdOn',
      headerName: 'Created On',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'createdBy',
      headerName: 'Created By',
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
      field: 'claimCreatedOn',
      headerName: 'Claim Created On',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'claimCreatedBy',
      headerName: 'Claim Created By',
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
      field: 'comments',
      headerName: 'Comments',
      flex: 1,
      minWidth: 140,
      disableReorder: true,
    },
    {
      field: 'zipCode',
      headerName: 'Zip Code',
      flex: 1,
      minWidth: 100,
      disableReorder: true,
    },
    {
      field: 'groupCode',
      headerName: 'Group/Reason Code',
      flex: 1,
      minWidth: 180,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="cursor-pointer text-cyan-500" onClick={() => {}}>
              {params.row.groupCode && params.row.reasonCode
                ? `${params.row.groupCode} - ${params.row.reasonCode}`
                : params.row.groupCode || params.row.reasonCode || ''}
            </div>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    setGroupDropdown(selectedWorkedGroup?.groupsData || []);
    if (selectedWorkedGroup?.groupsData[0]?.id)
      setSearchCriteriaFields({
        ...searchCriteria,
        groupID: selectedWorkedGroup?.groupsData[0]?.id,
      });
  }, [selectedWorkedGroup]);

  const handleInsuanceAllData = (groupID: number) => {
    setInsuanceAllData([...insuranceData.filter((m) => m.groupID === groupID)]);
  };

  useEffect(() => {
    if (searchCriteria?.groupID) handleInsuanceAllData(searchCriteria?.groupID);
  }, [searchCriteria?.groupID, insuranceData]);

  useEffect(() => {
    const groupId = searchCriteria?.groupID;
    if (groupId) {
      setPracticeDropdown([]);
      setProviderDropdown([]);
      dispatch(fetchPracticeDataRequest({ groupID: groupId }));
      dispatch(fetchProviderDataRequest({ groupID: groupId }));
      dispatch(fetchAssignClaimToDataRequest({ clientID: groupId }));
      dispatch(fetchFacilityDataRequest({ groupID: groupId }));
    }
  }, [searchCriteria?.groupID]);

  useEffect(() => {
    setPracticeDropdown(practiceData || []);
    setProviderDropdown(providersData || []);
    setFacilityDropdown(facilityData || []);
  }, [practiceData, providersData, facilityData]);
  const downloadPdf = (pdfExportData: GetPaymentReportsAPIResult) => {
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
      const pName = practiceData?.filter(
        (m) => m.id === searchCriteria.practiceID
      )[0]?.value;
      criteriaArray.push({ Criteria: 'Practice', Value: pName || '' });
    }
    if (searchCriteria.facilityID) {
      const facility = facilityDropdown.filter(
        (m) => m.id === searchCriteria.facilityID
      )[0]?.value;
      criteriaArray.push({ Criteria: 'Facility', Value: facility || '' });
    }
    if (searchCriteria.providerID) {
      const Provider = providerDropdown.filter(
        (m) => m.id === Number(searchCriteria.providerID)
      )[0]?.value;
      criteriaArray.push({ Criteria: 'Provider', Value: Provider || '' });
    }
    if (searchCriteria.ledgerAccount) {
      const ledgAccount =
        ledgerAccountDropdown.filter(
          (m) => m.id === Number(searchCriteria.ledgerAccount)
        )[0]?.value || '';
      criteriaArray.push({
        Criteria: 'Ledger Account',
        Value: ledgAccount || '',
      });
    }
    if (searchCriteria.paymentType) {
      criteriaArray.push({
        Criteria: 'Payment Type',
        Value:
          lookupsData?.method.filter(
            (m) => m.id === Number(searchCriteria.paymentType)
          )[0]?.value || '',
      });
    }
    if (searchCriteria.createdBy) {
      const user = assignClaimToData?.filter(
        (m) => m.id.toString() === searchCriteria.createdBy
      )[0]?.value;
      criteriaArray.push({
        Criteria: 'Payment Created By',
        Value: user || '',
      });
    }
    if (searchCriteria.fromCreatedDate) {
      criteriaArray.push({
        Criteria: 'Pay. Creat. Date - From',
        Value: DateToStringPipe(searchCriteria?.fromCreatedDate, 1),
      });
    }
    if (searchCriteria.toCreatedDate) {
      criteriaArray.push({
        Criteria: 'Pay. Creat. Date - To',
        Value: DateToStringPipe(searchCriteria?.toCreatedDate, 1),
      });
    }
    if (searchCriteria.fromPostingDate) {
      criteriaArray.push({
        Criteria: 'Posting Date - From',
        Value: DateToStringPipe(searchCriteria?.fromPostingDate, 1),
      });
    }
    if (searchCriteria.toPostingDate) {
      criteriaArray.push({
        Criteria: 'Posting Date - To',
        Value: DateToStringPipe(searchCriteria?.toPostingDate, 1),
      });
    }
    if (searchCriteria.fromDepositDate) {
      criteriaArray.push({
        Criteria: 'Deposit Date - From',
        Value: DateToStringPipe(searchCriteria?.fromDepositDate, 1),
      });
    }
    if (searchCriteria.toDepositDate) {
      criteriaArray.push({
        Criteria: 'Deposit Date - To',
        Value: DateToStringPipe(searchCriteria?.toDepositDate, 1),
      });
    }
    if (searchCriteria.groupCode) {
      criteriaArray.push({
        Criteria: 'Group Code',
        Value:
          lookupsData?.groupCode.filter(
            (a) => a.code === searchCriteria?.groupCode
          )[0]?.value || '',
      });
    }
    if (searchCriteria.reasonCode) {
      criteriaArray.push({
        Criteria: 'Reason Code',
        Value:
          reasonCodeData?.filter(
            (f) => f.code === searchCriteria?.reasonCode
          )[0]?.value || '',
      });
    }
    if (searchCriteria.claimCreatedFrom) {
      criteriaArray.push({
        Criteria: 'Claim Creat. Date - From',
        Value: DateToStringPipe(searchCriteria?.claimCreatedFrom, 1),
      });
    }
    if (searchCriteria.claimCreatedTo) {
      criteriaArray.push({
        Criteria: 'Claim Creat. Date - To',
        Value: DateToStringPipe(searchCriteria?.claimCreatedTo, 1),
      });
    }
    if (searchCriteria.claimCreatedBy) {
      const user = assignClaimToData?.filter(
        (m) => m.id.toString() === searchCriteria.claimCreatedBy
      )[0]?.value;
      criteriaArray.push({
        Criteria: 'Claim Created by',
        Value: user || '',
      });
    }
    if (searchCriteria.claimID) {
      criteriaArray.push({
        Criteria: 'Claim ID',
        Value: searchCriteria?.claimID?.toString() || '',
      });
    }
    if (searchCriteria.cpt) {
      criteriaArray.push({
        Criteria: 'CPT Code',
        Value: searchCriteria?.cpt || '',
      });
    }
    if (searchCriteria.chargeID) {
      criteriaArray.push({
        Criteria: 'Charge ID',
        Value: searchCriteria?.chargeID?.toString() || '',
      });
    }
    if (searchCriteria.firstName) {
      criteriaArray.push({
        Criteria: 'Patient First Name',
        Value: searchCriteria?.firstName?.toString() || '',
      });
    }
    if (searchCriteria.lastName) {
      criteriaArray.push({
        Criteria: 'Patient Last Name',
        Value: searchCriteria?.lastName?.toString() || '',
      });
    }
    if (searchCriteria.patientID) {
      criteriaArray.push({
        Criteria: 'Patient ID',
        Value: searchCriteria?.patientID?.toString() || '',
      });
    }
    if (searchCriteria.zipCode) {
      criteriaArray.push({
        Criteria: 'Patient Zip Code',
        Value: searchCriteria?.zipCode || '',
      });
    }
    if (searchCriteria.insuranceID) {
      criteriaArray.push({
        Criteria: 'Insurance',
        Value:
          insuranceAllData?.filter(
            (m) => m.id === Number(searchCriteria.insuranceID)
          )[0]?.value || '',
      });
    }
    let responsibility = '';
    if (searchCriteria?.responsibility) {
      if (searchCriteria?.responsibility === 1) {
        responsibility = 'Primary';
      } else if (searchCriteria?.responsibility === 2) {
        responsibility = 'Secondary+';
      } else {
        responsibility = 'Both';
      }
    }
    if (searchCriteria.responsibility) {
      criteriaArray.push({ Criteria: 'Responsibility', Value: responsibility });
    }
    let totalPaymentsBy = '';
    if (searchCriteria?.totalPaymentsBy === 'total_with_collected') {
      totalPaymentsBy = 'Collected';
    } else if (searchCriteria?.totalPaymentsBy === 'total_with_applied') {
      totalPaymentsBy = 'Applied';
    }
    if (searchCriteria.totalPaymentsBy) {
      criteriaArray.push({
        Criteria: 'Patient Payments',
        Value: totalPaymentsBy,
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
    const procedureDetails: PDFRowInput[] =
      pdfExportData.paymentReportsData.map((n) => {
        return {
          Practice: n.practice,
          'Patient Name': n.patient,
          'Patient ID': n.patientID?.toString() || '',
          'Batch ID': n.batchID?.toString() || '',
          'Claim ID': n.claimID?.toString() || '',
          'CPT Code': n.cpt,
          'Legder ID': n.ledgerID?.toString() || '',
          'Legder Name': n.ledgerName,
          'Legder Type': n.ledgerType,
          'Payment Type': n.paymentType,
          Provider: n.provider,
          'Payment Number': n.paymentNumber,
          Amount: currencyFormatter.format(n.amount || 0),
          DoS: `${n.fromDOS}-\n${n.toDOS}`,
          'Payment Date': n.paymentDate,
          'Posting Date': n.postingDate,
          'Deposit Date': n.depositDate,
          'Created On': n.createdOn,
          'Created By': n.createdBy,
          'Claim Created On': n.claimCreatedOn,
          'Claim Created By': n.claimCreatedBy,
          Comments: n.comments,
          'Zip Code': n.zipCode || '',
          'Group/Reason Code':
            n.groupCode && n.reasonCode
              ? `${n.groupCode} - ${n.reasonCode}`
              : n.groupCode || n.reasonCode || '',
        };
      });
    const dataColumns: PDFColumnInput[] = [];
    const keyNames = procedureDetails[0] && Object.keys(procedureDetails[0]);
    if (keyNames) {
      for (let i = 0; i < keyNames.length; i += 1) {
        dataColumns.push({ title: keyNames[i], dataKey: keyNames[i] });
      }
    }
    data.push({ columns: dataColumns, body: procedureDetails });
    // implement summary
    const summaryExportData: PDFRowInput[] = summaryResult.map((n) => {
      return {
        Type: n.ledgerAccount,
        Amount: currencyFormatter.format(n.totalAmount || 0),
      };
    });
    const summaryColumns: PDFColumnInput[] = [];
    const keyNames2 = summaryExportData[0] && Object.keys(summaryExportData[0]);
    if (keyNames2) {
      for (let i = 0; i < keyNames2.length; i += 1) {
        summaryColumns.push({ title: keyNames2[i], dataKey: keyNames2[i] });
      }
    }
    data.push({ columns: summaryColumns, body: summaryExportData });
    ExportDataToPDF(data, 'Transaction Report');
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
    const obj: GetPaymentReportCriteria = {
      groupID: searchCriteria.groupID,
      practiceID: searchCriteria.practiceID,
      facilityID: searchCriteria.facilityID,
      providerID: searchCriteria.providerID,
      ledgerAccount: searchCriteria.ledgerAccount,
      paymentType: searchCriteria.paymentType,
      createdBy: searchCriteria.createdBy,
      fromCreatedDate: searchCriteria.fromCreatedDate,
      toCreatedDate: searchCriteria.toCreatedDate,
      fromPostingDate: searchCriteria.fromPostingDate,
      toPostingDate: searchCriteria.toPostingDate,
      fromDepositDate: searchCriteria.fromDepositDate,
      toDepositDate: searchCriteria.toDepositDate,
      claimCreatedFrom: searchCriteria.claimCreatedFrom,
      claimCreatedTo: searchCriteria.claimCreatedTo,
      claimCreatedBy: searchCriteria.claimCreatedBy,
      claimID: searchCriteria.claimID,
      cpt: searchCriteria.cpt,
      firstName: searchCriteria.firstName,
      lastName: searchCriteria.lastName,
      patientID: searchCriteria.patientID,
      insuranceID: searchCriteria.insuranceID,
      responsibility: searchCriteria.responsibility,
      sortByColumn: '',
      pageNumber: undefined,
      pageSize: undefined,
      sortOrder: '',
      getAllData: true,
      zipCode: searchCriteria.zipCode,
      reasonCode: searchCriteria.reasonCode,
      groupCode: searchCriteria.groupCode,
      chargeID: searchCriteria.chargeID,
      getOnlyIDS: searchCriteria.getOnlyIDS,
      totalPaymentsBy: searchCriteria.totalPaymentsBy,
    };
    const res = await fetchPaymentReportSearchData(obj);
    if (res) {
      if (type === 'pdf') {
        downloadPdf(res);
      } else {
        const exportDataArray = res.paymentReportsData.map((n) => {
          return {
            Practice: n.practice,
            'Patient Name': n.patient,
            'Patient ID': n.patientID?.toString(),
            'Batch ID': n.batchID?.toString(),
            'Claim ID': n.claimID?.toString(),
            'CPT Code': n.cpt,
            'Legder ID': n.ledgerID?.toString(),
            'Legder Name': n.ledgerName,
            'Legder Type': n.ledgerType,
            'Payment Type': n.paymentType,
            Provider: n.provider,
            'Payment Number': n.paymentNumber,
            Amount: currencyFormatter.format(n.amount || 0),
            DoS: `${n.fromDOS}-\n${n.toDOS}`,
            'Payment Date': n.paymentDate,
            'Posting Date': n.postingDate,
            'Deposit Date': n.depositDate,
            'Created On': n.createdOn,
            'Created By': n.createdBy,
            'Claim Created On': n.claimCreatedOn,
            'Claim Created By': n.claimCreatedBy,
            Comments: n.comments,
            'Zip Code': n.zipCode || '',
            'Group/Reason Code':
              n.groupCode && n.reasonCode
                ? `${n.groupCode} - ${n.reasonCode}`
                : n.groupCode || n.reasonCode || '',
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
            'Patient Name': 'Value',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          if (searchCriteria.groupID) {
            criteriaObj = {
              ...criteriaObj,
              Practice: 'Group',
              'Patient Name':
                groupDropdown.filter(
                  (m) => m.id === Number(searchCriteria.groupID)
                )[0]?.value || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria.practiceID) {
            criteriaObj = {
              ...criteriaObj,
              Practice: 'Practice',
              'Patient Name':
                practiceDropdown.filter(
                  (m) => m.id === Number(searchCriteria.practiceID)
                )[0]?.value || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria.facilityID) {
            criteriaObj = {
              ...criteriaObj,
              'CPT Code': 'Facility',
              Practice:
                facilityDropdown.filter(
                  (m) => m.id === searchCriteria.facilityID
                )[0]?.value || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria.providerID) {
            criteriaObj = {
              ...criteriaObj,
              Practice: 'Provider',
              'Patient Name':
                providerDropdown.filter(
                  (m) => m.id === Number(searchCriteria.providerID)
                )[0]?.value || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria.ledgerAccount) {
            criteriaObj = {
              ...criteriaObj,
              Practice: 'Ledger Account',
              'Patient Name':
                ledgerAccountDropdown.filter(
                  (m) => m.id === Number(searchCriteria.ledgerAccount)
                )[0]?.value || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria.paymentType) {
            criteriaObj = {
              ...criteriaObj,
              Practice: 'Payment Type',
              'Patient Name':
                lookupsData?.method.filter(
                  (m) => m.id === Number(searchCriteria.paymentType)
                )[0]?.value || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria.createdBy) {
            criteriaObj = {
              ...criteriaObj,
              Practice: 'Payment Created By',
              'Patient Name':
                assignClaimToData?.filter(
                  (m) => m.id.toString() === searchCriteria.createdBy
                )[0]?.value || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.fromCreatedDate) {
            criteriaObj = {
              ...criteriaObj,
              Practice: 'Pay. Creat. Date - From',
              'Patient Name': DateToStringPipe(
                searchCriteria?.fromCreatedDate,
                1
              ),
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.toCreatedDate) {
            criteriaObj = {
              ...criteriaObj,
              Practice: 'Pay. Creat. Date - To',
              'Patient Name': DateToStringPipe(
                searchCriteria?.toCreatedDate,
                1
              ),
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.fromPostingDate) {
            criteriaObj = {
              ...criteriaObj,
              Practice: 'Posting Date - From',
              'Patient Name': DateToStringPipe(
                searchCriteria?.fromPostingDate,
                1
              ),
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.toPostingDate) {
            criteriaObj = {
              ...criteriaObj,
              Practice: 'Posting Date - To',
              'Patient Name': DateToStringPipe(
                searchCriteria?.toPostingDate,
                1
              ),
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.fromDepositDate) {
            criteriaObj = {
              ...criteriaObj,
              Practice: 'Deposit Date - From',
              'Patient Name': DateToStringPipe(
                searchCriteria?.fromDepositDate,
                1
              ),
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.toDepositDate) {
            criteriaObj = {
              ...criteriaObj,
              Practice: 'Deposit Date - To',
              'Patient Name': DateToStringPipe(
                searchCriteria?.toDepositDate,
                1
              ),
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.groupCode) {
            criteriaObj = {
              ...criteriaObj,
              Practice: 'Group Code',
              'Patient Name':
                lookupsData?.groupCode.filter(
                  (a) => a.code === searchCriteria?.groupCode
                )[0]?.value || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.reasonCode) {
            criteriaObj = {
              ...criteriaObj,
              Practice: 'Reason Code',
              'Patient Name':
                reasonCodeData?.filter(
                  (f) => f.code === searchCriteria?.reasonCode
                )[0]?.value || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.claimCreatedFrom) {
            criteriaObj = {
              ...criteriaObj,
              Practice: 'Claim Creat. Date - From',
              'Patient Name': DateToStringPipe(
                searchCriteria?.claimCreatedFrom,
                1
              ),
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.claimCreatedTo) {
            criteriaObj = {
              ...criteriaObj,
              Practice: 'Claim Creat. Date - To',
              'Patient Name': DateToStringPipe(
                searchCriteria?.claimCreatedTo,
                1
              ),
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria.claimCreatedBy) {
            criteriaObj = {
              ...criteriaObj,
              Practice: 'Claim Created by',
              'Patient Name':
                assignClaimToData?.filter(
                  (m) => m.id.toString() === searchCriteria.claimCreatedBy
                )[0]?.value || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.claimID) {
            criteriaObj = {
              ...criteriaObj,
              Practice: 'Claim ID',
              'Patient Name': searchCriteria?.claimID?.toString() || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.cpt) {
            criteriaObj = {
              ...criteriaObj,
              Practice: 'CPT Code',
              'Patient Name': searchCriteria?.cpt || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.chargeID) {
            criteriaObj = {
              ...criteriaObj,
              Practice: 'Charge ID',
              'Patient Name': searchCriteria?.chargeID?.toString() || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.firstName) {
            criteriaObj = {
              ...criteriaObj,
              Practice: 'Patient First Name',
              'Patient Name': searchCriteria?.firstName?.toString() || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.lastName) {
            criteriaObj = {
              ...criteriaObj,
              Practice: 'Patient Last Name',
              'Patient Name': searchCriteria?.lastName?.toString() || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.patientID) {
            criteriaObj = {
              ...criteriaObj,
              Practice: 'Patient ID',
              'Patient Name': searchCriteria?.patientID?.toString() || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.zipCode) {
            criteriaObj = {
              ...criteriaObj,
              Practice: 'Patient Zip Code',
              'Patient Name': searchCriteria?.zipCode || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria.insuranceID) {
            criteriaObj = {
              ...criteriaObj,
              Practice: 'Insurance',
              'Patient Name':
                insuranceAllData?.filter(
                  (m) => m.id === Number(searchCriteria.insuranceID)
                )[0]?.value || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          let responsibility = '';
          if (searchCriteria?.responsibility === 1) {
            responsibility = 'Primary';
          } else if (searchCriteria?.responsibility === 2) {
            responsibility = 'Secondary+';
          } else {
            responsibility = 'Both';
          }
          if (searchCriteria?.responsibility) {
            criteriaObj = {
              ...criteriaObj,
              Practice: 'Responsibility',
              'Patient Name': responsibility,
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          let totalPaymentsBy = '';
          if (searchCriteria?.totalPaymentsBy === 'total_with_collected') {
            totalPaymentsBy = 'Collected';
          } else if (searchCriteria?.totalPaymentsBy === 'total_with_applied') {
            totalPaymentsBy = 'Applied';
          }
          if (searchCriteria?.totalPaymentsBy) {
            criteriaObj = {
              ...criteriaObj,
              Practice: 'Patient Payments',
              'Patient Name': totalPaymentsBy,
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          criteriaObj = Object.fromEntries(headerArray.map((key) => [key, '']));
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));

          criteriaObj = Object.fromEntries(headerArray.map((key) => [key, '']));
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            Practice: 'Transaction Details',
            'Patient Name': '',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = Object.fromEntries(headerArray.map((key) => [key, '']));
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = Object.fromEntries(
            headerArray.map((key) => [key, key])
          );
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          const exportArray = criteriaArray.concat(exportDataArray);
          let summaryObj: { [key: string]: string } = {
            ...exportDataArray[0],
          };
          const summaryArray = [];
          for (let i = 0; i < summaryResult.length; i += 1) {
            if (i === 0) {
              summaryObj = Object.fromEntries(
                headerArray.map((key) => [key, ''])
              );
              summaryArray.push(JSON.parse(JSON.stringify(summaryObj)));
              summaryObj = {
                ...summaryObj,
                Practice: 'Summary',
                'Patient Name': '',
              };
              summaryArray.push(JSON.parse(JSON.stringify(summaryObj)));
              summaryObj = Object.fromEntries(
                headerArray.map((key) => [key, ''])
              );
              summaryArray.push(JSON.parse(JSON.stringify(summaryObj)));
              summaryObj = {
                ...summaryObj,
                Practice: ' Type',
                'Patient Name': 'Amount',
              };
              summaryArray.push(JSON.parse(JSON.stringify(summaryObj)));
            }
            summaryObj = {
              ...summaryObj,
              Practice: summaryResult[i]?.ledgerAccount || '',
              'Patient Name': currencyFormatter.format(
                summaryResult[i]?.totalAmount || 0
              ),
            };
            summaryArray.push(JSON.parse(JSON.stringify(summaryObj)));
          }

          Array.prototype.push.apply(exportArray, summaryArray);

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
            ExportDataToCSV(exportArray, 'TransactionReport');
            dispatch(
              addToastNotification({
                text: 'Export Successful',
                toastType: ToastType.SUCCESS,
                id: '',
              })
            );
          } else {
            ExportDataToDrive(exportArray, 'TransactionReport', dispatch);
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
  return (
    <AppLayout title="Nucleus - Transaction Report">
      <div className="relative m-0 h-full bg-gray-100 p-0">
        <div className="m-0 h-full w-full overflow-y-scroll bg-gray-100 p-0">
          <div className="flex w-full flex-col">
            <div className="m-0 h-full w-full overflow-y-auto overflow-x-hidden bg-gray-100 p-0">
              <div className="h-[125px] w-full">
                <div className="absolute top-0 z-[11] w-full">
                  <Breadcrumbs />
                  <PageHeader>
                    <div className="flex items-start justify-between gap-4  px-7 pb-[21px] pt-[33px]">
                      <div className="flex h-[38px] gap-6">
                        <p className="self-center text-3xl font-bold text-cyan-700">
                          Transaction Report
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
                <div className="flex items-center px-[5px] py-[20px]">
                  <div
                    className={`inline-flex items-center pr-[29px] text-left font-bold text-gray-700`}
                  >
                    <p className={`m-0 text-xl sm:text-xl`}>
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
                      <div className="px-[5px] pb-[5px]">
                        <p className="text-base font-bold leading-normal text-gray-700">
                          Location
                        </p>
                      </div>
                      <div className="flex w-full flex-wrap">
                        <div className={`w-[50%] px-[5px] lg:w-[25%]`}>
                          <div className={`w-full items-start self-stretch`}>
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
                                onSelect={(value) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    groupID: value.id,
                                    practiceID: undefined,
                                    providerID: undefined,
                                    createdBy: undefined,
                                    claimCreatedBy: undefined,
                                    insuranceID: undefined,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={`w-[50%] px-[5px] lg:w-[25%]`}>
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
                        <div className={`w-[50%] px-[5px] lg:w-[25%]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Facility
                            </div>
                            <div className="w-full">
                              <SingleSelectDropDown
                                placeholder="-"
                                disabled={false}
                                data={facilityDropdown}
                                selectedValue={
                                  facilityDropdown.filter(
                                    (f) => f.id === searchCriteria?.facilityID
                                  )[0]
                                }
                                onSelect={(value) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    facilityID: value.id,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={`w-[50%] px-[5px] lg:w-[25%]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Provider
                            </div>
                            <div className="w-full">
                              <SingleSelectDropDown
                                placeholder="-"
                                disabled={false}
                                data={providerDropdown}
                                selectedValue={
                                  providerDropdown.filter(
                                    (f) => f.id === searchCriteria?.providerID
                                  )[0]
                                }
                                onSelect={(value) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    providerID: value.id,
                                  });
                                }}
                                isOptional={true}
                                onDeselectValue={() => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    providerID: undefined,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={'px-[5px] py-[15px]'}>
                      <div className={`h-[1px] w-full bg-gray-200`} />
                    </div>
                    <div className="w-full">
                      <div className="px-[5px] pb-[5px]">
                        <p className="text-base font-bold leading-normal text-gray-700">
                          Payment Details
                        </p>
                      </div>
                      <div className="flex w-full flex-wrap">
                        <div className={`w-[50%] px-[5px] lg:w-[25%]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Ledger Account
                            </div>
                            <div className="w-full">
                              <SingleSelectDropDown
                                placeholder="-"
                                disabled={false}
                                data={ledgerAccountDropdown}
                                selectedValue={
                                  ledgerAccountDropdown.filter(
                                    (f) =>
                                      f.id === searchCriteria?.ledgerAccount
                                  )[0]
                                }
                                onSelect={(value) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    ledgerAccount: value.id,
                                  });
                                }}
                                isOptional={true}
                                onDeselectValue={() => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    ledgerAccount: undefined,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={`w-[50%] px-[5px] lg:w-[25%]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Payment Type
                            </div>
                            <div className="w-full">
                              <SingleSelectDropDown
                                placeholder="-"
                                disabled={false}
                                data={
                                  lookupsData?.method
                                    ? (lookupsData?.method as SingleSelectDropDownDataType[])
                                    : []
                                }
                                selectedValue={
                                  lookupsData?.method?.filter(
                                    (m) => m.id === searchCriteria.paymentType
                                  )[0]
                                }
                                onSelect={(value) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    paymentType: value.id,
                                  });
                                }}
                                isOptional={true}
                                onDeselectValue={() => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    paymentType: undefined,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={`w-[50%] px-[5px] lg:w-[25%]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Payment Created by
                            </div>
                            <div className="w-full">
                              <SingleSelectDropDown
                                placeholder="-"
                                disabled={false}
                                data={
                                  assignClaimToData
                                    ? (assignClaimToData as SingleSelectDropDownDataType[])
                                    : []
                                }
                                selectedValue={
                                  assignClaimToData?.filter(
                                    (f) =>
                                      f.id.toString() ===
                                      searchCriteria?.createdBy
                                  )[0]
                                }
                                onSelect={(value) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    createdBy: value.id.toString(),
                                  });
                                }}
                                isOptional={true}
                                onDeselectValue={() => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    createdBy: undefined,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={`flex w-[50%] px-[5px] lg:w-[25%]`}>
                          <div className={`w-[50%] pr-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Pay. Creat. Date - From
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
                          </div>
                          <div className={`w-[50%] pl-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Pay. Creat. Date - To
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
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex w-full flex-wrap">
                        <div className={`flex w-[50%] px-[5px] lg:w-[33%]`}>
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
                          className={'hidden justify-center lg:flex lg:w-[1%]'}
                        >
                          <div className={`h-full w-[1px] bg-gray-200`} />
                        </div>
                        <div className={`flex w-[50%] px-[5px] lg:w-[33%]`}>
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
                        <div
                          className={'hidden justify-center lg:flex lg:w-[1%]'}
                        >
                          <div className={`h-full w-[1px] bg-gray-200`} />
                        </div>
                        <div className={`flex w-[15%] px-[5px] lg:w-[15%]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Group Code
                            </div>
                            <div className="w-full">
                              <SingleSelectDropDown
                                placeholder=""
                                showSearchBar={true}
                                data={lookupsData?.groupCode || []}
                                selectedValue={
                                  lookupsData?.groupCode.filter(
                                    (a) => a.code === searchCriteria?.groupCode
                                  )[0]
                                }
                                onSelect={(e) => {
                                  const value = e?.value.split('|')[0]?.trim();
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    groupCode: value,
                                  });
                                }}
                                isOptional={true}
                                onDeselectValue={() => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    groupCode: undefined,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={`flex w-[15%] px-[5px] lg:w-[15%]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Reason Code
                            </div>
                            <div className="w-full">
                              <SingleSelectDropDown
                                placeholder=""
                                showSearchBar={true}
                                data={reasonCodeData}
                                searchOnCharacterLength={1}
                                selectedValue={
                                  reasonCodeData?.filter(
                                    (f) => f.code === searchCriteria?.reasonCode
                                  )[0]
                                }
                                onSelect={(e) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    reasonCode: e?.value.split('|')[0]?.trim(),
                                  });
                                }}
                                onSearch={(e) => {
                                  getReasonCodeData(e);
                                }}
                                isOptional={true}
                                onDeselectValue={() => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    reasonCode: undefined,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={'px-[5px] py-[15px]'}>
                      <div className={`h-[1px] w-full bg-gray-200`} />
                    </div>
                    <div className="w-full">
                      <div className="px-[5px] pb-[5px]">
                        <p className="text-base font-bold leading-normal text-gray-700">
                          Claim Details
                        </p>
                      </div>
                      <div className="flex w-full flex-wrap">
                        <div className={`flex w-[50%] px-[5px] lg:w-[30%]`}>
                          <div className={`w-[50%] pr-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Claim Creat. Date - From
                              </div>
                              <div className="w-full">
                                <AppDatePicker
                                  cls="!mt-1"
                                  selected={searchCriteria?.claimCreatedFrom}
                                  onChange={(value) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      claimCreatedFrom: value,
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className={`w-[50%] pl-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Claim Creat. Date - To
                              </div>
                              <div className="w-full">
                                <AppDatePicker
                                  cls="!mt-1"
                                  selected={searchCriteria?.claimCreatedTo}
                                  onChange={(value) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      claimCreatedTo: value,
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className={`w-[50%] px-[5px] lg:w-[25%]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Claim Created by
                            </div>
                            <div className="w-full">
                              <SingleSelectDropDown
                                placeholder="-"
                                disabled={false}
                                data={
                                  assignClaimToData
                                    ? (assignClaimToData as SingleSelectDropDownDataType[])
                                    : []
                                }
                                selectedValue={
                                  assignClaimToData?.filter(
                                    (f) =>
                                      f.id.toString() ===
                                      searchCriteria?.claimCreatedBy
                                  )[0]
                                }
                                onSelect={(value) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    claimCreatedBy: value.id.toString(),
                                  });
                                }}
                                isOptional={true}
                                onDeselectValue={() => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    claimCreatedBy: undefined,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={`w-[50%] px-[5px] lg:w-[25%]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Claim ID
                            </div>
                            <div className="w-full">
                              <InputField
                                placeholder="-"
                                value={searchCriteria.claimID}
                                onChange={(evt) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    claimID: evt.target.value
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
                        <div className={`w-[50%] px-[5px] lg:w-[23%]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              CPT Code
                            </div>
                            <div className="w-full">
                              <InputField
                                placeholder="-"
                                value={searchCriteria.cpt}
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
                        <div className={`w-[50%] px-[5px] lg:w-[23%]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Charge ID
                            </div>
                            <div className="w-full">
                              <InputField
                                placeholder="-"
                                value={searchCriteria.chargeID}
                                onChange={(evt) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    chargeID: evt.target.value
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
                    </div>
                    <div className={'px-[5px] py-[15px]'}>
                      <div className={`h-[1px] w-full bg-gray-200`} />
                    </div>
                    <div className="w-full">
                      <div className="px-[5px] pb-[5px]">
                        <p className="text-base font-bold leading-normal text-gray-700">
                          Payor Details
                        </p>
                      </div>
                      <div className="flex w-full flex-wrap">
                        <div className={`w-[50%] px-[5px] lg:w-[23%]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Patient First Name
                            </div>
                            <div className="w-full">
                              <InputField
                                placeholder="-"
                                value={searchCriteria.firstName}
                                onChange={(evt) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    firstName: evt.target.value,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={`w-[50%] px-[5px] lg:w-[23%]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Patient Last Name
                            </div>
                            <div className="w-full">
                              <InputField
                                placeholder="-"
                                value={searchCriteria.lastName}
                                onChange={(evt) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    lastName: evt.target.value,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={`w-[50%] px-[5px] lg:w-[23%]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Patient ID
                            </div>
                            <div className="w-full">
                              <InputField
                                placeholder="-"
                                value={searchCriteria.patientID}
                                onChange={(evt) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    patientID: evt.target.value
                                      ? Number(evt.target.value)
                                      : undefined,
                                  });
                                }}
                                type={'number'}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={`w-[50%] px-[5px] lg:w-[23%]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Patient Zip Code
                            </div>
                            <div className="w-full">
                              <InputField
                                placeholder="-"
                                value={searchCriteria.zipCode}
                                onChange={(evt) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    zipCode: evt.target.value,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex w-full flex-wrap">
                        <div className={`w-[50%] px-[5px] lg:w-[23%]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Insurance
                            </div>
                            <div className="w-full">
                              <SingleSelectDropDown
                                placeholder="-"
                                disabled={false}
                                data={insuranceAllData}
                                selectedValue={
                                  insuranceAllData.filter(
                                    (f) => f.id === searchCriteria?.insuranceID
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
                        <div className={`w-[50%] px-[5px] lg:w-[23%]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Responsibility
                            </div>
                            <div className="mt-[4px]  flex h-[38px] w-full items-center">
                              <RadioButton
                                data={[
                                  { value: '1', label: 'Primary' },
                                  { value: '2', label: 'Secondary+' },
                                  { value: '', label: 'Both' },
                                ]}
                                checkedValue={
                                  searchCriteria.responsibility
                                    ? searchCriteria.responsibility.toString()
                                    : ''
                                }
                                onChange={(e) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    responsibility: e.target.value
                                      ? Number(e.target.value)
                                      : null,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={`w-[50%] px-[5px] lg:w-[23%]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Patient Payments
                            </div>
                            <div className="mt-[4px]  flex h-[38px] w-full items-center">
                              <RadioButton
                                data={[
                                  {
                                    value: 'total_with_collected',
                                    label: 'Collected',
                                  },
                                  {
                                    value: 'total_with_applied',
                                    label: 'Applied',
                                  },
                                ]}
                                checkedValue={
                                  searchCriteria.totalPaymentsBy
                                    ? searchCriteria.totalPaymentsBy
                                    : 'total_with_applied'
                                }
                                onChange={(e) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    totalPaymentsBy: e.target.value
                                      ? e.target.value
                                      : undefined,
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
              <div className="flex h-20 items-start justify-between gap-4 bg-gray-200 px-7 pb-[15px] pt-[25px]">
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
                      <div className={`h-full w-[1px] bg-gray-900`} />
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

              <div className="w-full gap-4 bg-white px-7 pb-[15px] pt-[25px]">
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
                <div className="mb-[20px] mt-[40px] w-full">
                  <div
                    hidden={reportCollapseInfo.summary}
                    className="w-full drop-shadow-lg"
                  >
                    <AppTable
                      cls="max-h-[400px] !w-[700px] "
                      renderHead={
                        <>
                          <AppTableRow>
                            <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                              Type
                            </AppTableCell>
                            <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                              Amount
                            </AppTableCell>
                          </AppTableRow>
                        </>
                      }
                      renderBody={
                        <>
                          {summaryResult.map((d) => {
                            return (
                              <AppTableRow key={d.ledgerAccount}>
                                <AppTableCell>{d.ledgerAccount}</AppTableCell>
                                <AppTableCell>
                                  {currencyFormatter.format(
                                    d.totalAmount ? d.totalAmount : 0
                                  )}
                                </AppTableCell>
                              </AppTableRow>
                            );
                          })}
                          {!summaryResult.length && (
                            <AppTableRow>
                              <AppTableCell cls={'!text-center'} colSpan={2}>
                                No rows
                              </AppTableCell>
                            </AppTableRow>
                          )}
                        </>
                      }
                    />
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

                <div className="flex w-full flex-col pt-[20px]">
                  <div hidden={reportCollapseInfo.detail} className="h-full">
                    <SearchDetailGrid
                      pageNumber={lastSearchCriteria.pageNumber}
                      pageSize={lastSearchCriteria.pageSize}
                      totalCount={totalCount}
                      // persistLayoutId={17}
                      rows={searchResult}
                      columns={columns}
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
                        if (searchResult.length) {
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
                        if (searchResult.length) {
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
    </AppLayout>
  );
};

export default PaymentBatch;
