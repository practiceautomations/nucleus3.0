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
import ButtonDropdown from '@/components/UI/ButtonDropdown';
import type { ButtonSelectDropdownDataType } from '@/components/UI/ButtonSelectDropdown';
import ButtonSelectDropdownForExport from '@/components/UI/ButtonSelectDropdownForExport';
import InputField from '@/components/UI/InputField';
import SearchDetailGrid, {
  globalPaginationConfig,
} from '@/components/UI/SearchDetailGrid';
import type { SingleSelectDropDownDataType } from '@/components/UI/SingleSelectDropDown';
import SingleSelectDropDown from '@/components/UI/SingleSelectDropDown';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
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
  fetchProcedureTransactionHistoryReportData,
} from '@/store/shared/sagas';
import {
  getAllInsuranceDataSelector,
  getFacilityDataSelector,
  getLookupDropdownsDataSelector,
  getPracticeDataSelector,
  getProviderDataSelector,
} from '@/store/shared/selectors';
import type {
  AllInsuranceData,
  FacilityData,
  GroupData,
  PracticeData,
  ProcedureTransactionHistoryReportCriteria,
  ProcedureTransactionHistoryReportResult,
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

const TransactionHistoryReport = () => {
  const dispatch = useDispatch();
  const lookupsData = useSelector(getLookupDropdownsDataSelector);
  const insuranceData = useSelector(getAllInsuranceDataSelector);
  const practiceData = useSelector(getPracticeDataSelector);
  const providersData = useSelector(getProviderDataSelector);
  const facilityData = useSelector(getFacilityDataSelector);
  const [practiceDropdown, setPracticeDropdown] = useState<PracticeData[]>([]);
  const [providerDropdown, setProviderDropdown] = useState<ProviderData[]>([]);
  const [facilityDropdown, setFacilityDropdown] = useState<FacilityData[]>([]);
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

  const [statusModalInfo, setStatusModalInfo] = useState({
    show: false,
    heading: '',
    text: '',
    type: StatusModalType.WARNING,
  });
  const defaultSearchCriteria: ProcedureTransactionHistoryReportCriteria = {
    groupID: undefined,
    practiceID: undefined,
    facilityID: undefined,
    posID: undefined,
    fromDOS: null,
    toDOS: null,
    claimID: '',
    cptCode: '',
    chargeID: '',
    patientFirstName: '',
    patientLastName: '',
    patientID: '',
    insuranceID: undefined,
    providerID: undefined,
    fromPostingDate: null,
    toPostingDate: null,
    pageNumber: 1,
    pageSize: globalPaginationConfig.activePageSize,
    sortColumn: '',
    sortOrder: '',
    getAllData: false,
    getOnlyIDS: false,
  };
  const [lastSearchCriteria, setLastSearchCriteria] = useState(
    defaultSearchCriteria
  );
  const [searchCriteria, setSearchCriteria] = useState(defaultSearchCriteria);
  const [renderSearchCriteriaView, setRenderSearchCriteriaView] = useState(
    uuidv4()
  );
  const [searchResult, setSearchResult] = useState<
    ProcedureTransactionHistoryReportResult[]
  >([]);

  const setSearchCriteriaFields = (
    value: ProcedureTransactionHistoryReportCriteria
  ) => {
    setSearchCriteria(value);
    setIsChangedJson(true);
  };

  const getSearchData = async (
    obj: ProcedureTransactionHistoryReportCriteria
  ) => {
    const res = await fetchProcedureTransactionHistoryReportData(obj);
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
    const obj = {
      ...searchCriteria,
      sortColumn: '',
      sortOrder: '',
      pageNumber: 1,
    };
    setSearchCriteria(obj);
    getSearchData(obj);
  };

  const initProfile = () => {
    dispatch(getLookupDropdownsRequest());
    fetchInsuranceData();
  };
  useEffect(() => {
    initProfile();
  }, []);

  const columns: GridColDef[] = [
    {
      field: 'cpt',
      headerName: 'CPT Code',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'practice',
      headerName: 'Practice',
      flex: 1,
      minWidth: 230,
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
      field: 'pos',
      headerName: 'PoS',
      flex: 1,
      minWidth: 160,
      disableReorder: true,
    },
    {
      field: 'provider',
      headerName: 'Provider',
      flex: 1,
      minWidth: 230,
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
              {params.row.providerNPI ? `NPI: ${params.row.providerNPI}` : ''}
            </div>
          </div>
        );
      },
    },
    {
      field: 'insurance',
      headerName: 'Insurance',
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
              {params.value}
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
      field: 'claimID',
      headerName: 'Claim ID',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-cyan-500 underline"
              onClick={() => {}}
            >
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
      minWidth: 130,
      disableReorder: true,
      renderCell: (params) => {
        return <div className="flex flex-col">#{params.value}</div>;
      },
    },
    {
      field: 'adjCodes',
      headerName: 'Adj. Codes',
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
      minWidth: 130,
      disableReorder: true,
      renderCell: (params) => {
        return <div className="flex flex-col">#{params.value}</div>;
      },
    },
    {
      field: 'ledgerName',
      headerName: 'Ledger Name',
      flex: 1,
      minWidth: 200,
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
      field: 'fee',
      headerName: 'Fee',
      ...usdPrice,
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'allowed',
      headerName: 'Allowable',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div>{currencyFormatter.format(params.value)}</div>
            {params.row.adjustments > 0 && (
              <div className="whitespace-nowrap text-xs text-red-500">
                {`Adj.: ${currencyFormatter.format(params.row.adjustments)}`}
              </div>
            )}
            {params.row.adjustments < 0 && (
              <div className="whitespace-nowrap text-xs text-yellow-500">
                {`Adj.: ${currencyFormatter.format(params.row.adjustments)}`}
              </div>
            )}
            {(params.row.adjustments === 0 || !params.row.adjustments) && (
              <div className="whitespace-nowrap text-xs text-green-500">
                {`Adj.: ${currencyFormatter.format(0)}`}
              </div>
            )}
          </div>
        );
      },
    },
    {
      field: 'deductible',
      headerName: 'Deductible',
      ...usdPrice,
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'coinsurance',
      headerName: 'CoInsurance',
      ...usdPrice,
      flex: 1,
      minWidth: 140,
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
    setProviderDropdown(providersData || []);
    if (practiceData) {
      setPracticeDropdown(practiceData || []);
      setSearchCriteriaFields({
        ...searchCriteria,
        groupID: selectedWorkedGroup?.groupsData[0]?.id,
        practiceID: practiceData.length === 1 ? practiceData[0]?.id : undefined,
        facilityID:
          facilityData?.length === 1 ? facilityData[0]?.id : undefined,
      });
    }
    if (facilityData) {
      setFacilityDropdown(facilityData || []);
      setSearchCriteriaFields({
        ...searchCriteria,
        groupID: selectedWorkedGroup?.groupsData[0]?.id,
        practiceID:
          practiceData?.length === 1 ? practiceData[0]?.id : undefined,
        facilityID: facilityData.length === 1 ? facilityData[0]?.id : undefined,
      });
    }
  }, [practiceData, providersData, facilityData]);
  const downloadPdf = (
    pdfExportData: ProcedureTransactionHistoryReportResult[]
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
    if (searchCriteria.posID) {
      const pos = lookupsData?.placeOfService.filter(
        (m) => m.id === searchCriteria.posID
      )[0]?.value;
      criteriaArray.push({ Criteria: 'PoS', Value: pos || '' });
    }
    if (searchCriteria.fromDOS) {
      criteriaArray.push({
        Criteria: 'Date of Service - From',
        Value: DateToStringPipe(searchCriteria?.fromDOS, 1),
      });
    }
    if (searchCriteria.toDOS) {
      criteriaArray.push({
        Criteria: 'Date of Service - To',
        Value: DateToStringPipe(searchCriteria?.toDOS, 1),
      });
    }
    if (searchCriteria.claimID) {
      criteriaArray.push({
        Criteria: 'Claim ID',
        Value: searchCriteria?.claimID?.toString() || '',
      });
    }
    if (searchCriteria.cptCode) {
      criteriaArray.push({
        Criteria: 'CPT Code',
        Value: searchCriteria?.cptCode || '',
      });
    }
    if (searchCriteria.chargeID) {
      criteriaArray.push({
        Criteria: 'Charge ID',
        Value: searchCriteria?.chargeID?.toString() || '',
      });
    }
    if (searchCriteria.patientFirstName) {
      criteriaArray.push({
        Criteria: 'Patient First Name',
        Value: searchCriteria?.patientFirstName?.toString() || '',
      });
    }
    if (searchCriteria.patientLastName) {
      criteriaArray.push({
        Criteria: 'Patient Last Name',
        Value: searchCriteria?.patientLastName?.toString() || '',
      });
    }
    if (searchCriteria.patientID) {
      criteriaArray.push({
        Criteria: 'Patient ID',
        Value: searchCriteria?.patientID?.toString() || '',
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
    if (searchCriteria.providerID) {
      const Provider = providerDropdown.filter(
        (m) => m.id === Number(searchCriteria.providerID)
      )[0]?.value;
      criteriaArray.push({ Criteria: 'Provider', Value: Provider || '' });
    }
    if (searchCriteria.fromPostingDate) {
      criteriaArray.push({
        Criteria: 'Post Date - From',
        Value: DateToStringPipe(searchCriteria?.fromPostingDate, 1),
      });
    }
    if (searchCriteria.toPostingDate) {
      criteriaArray.push({
        Criteria: 'Post Date - To',
        Value: DateToStringPipe(searchCriteria?.toPostingDate, 1),
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
    const procedureDetails: PDFRowInput[] = pdfExportData.map((n) => {
      return {
        'CPT Code': n.cpt,
        Practice: n.practice,
        Facility: n.facility,
        PoS: n.pos,
        Provider: n.provider,
        Insurance: n.insurance,
        'Patient Name': n.patient,
        'Patient ID': n.patientID,
        DoS: `${n.fromDOS}-\n${n.toDOS}`,
        'Claim ID': n.claimID?.toString() || '',
        'Charge ID': n.chargeID?.toString() || '',
        'Legder ID': n.ledgerID?.toString() || '',
        'Adj. Codes': n.adjCodes,
        'Legder Name': n.ledgerName,
        'Legder Type': n.ledgerType,
        'Pymt Type': n.paymentType,
        'Pymt Number': n.paymentNumber,
        Amount: currencyFormatter.format(n.amount || 0),
        'Payment Date': n.paymentDate,
        'Post Date': n.postingDate,
        'Deposit Date': n.depositDate,
        Fee: currencyFormatter.format(n.fee || 0),
        Allowable: n.allowed,
        Adjustments: n.adjustments,
        Deductible: n.deductible,
        CoInsurance: n.coinsurance,
        'Created By': n.createdBy,
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
    ExportDataToPDF(data, 'Procedure Transaction History Report', undefined, {
      'CPT Code': { cellWidth: 7 },
      Practice: { cellWidth: 12 },
      Facility: { cellWidth: 12 },
      PoS: { cellWidth: 9 },
      Provider: { cellWidth: 12 },
      Insurance: { cellWidth: 12 },
      'Patient Name': { cellWidth: 11 },
      'Patient ID': { cellWidth: 9 },
      DoS: { cellWidth: 12 },
      'Claim ID': { cellWidth: 9 },
      'Charge ID': { cellWidth: 9 },
      'Legder ID': { cellWidth: 9 },
      'Adj. Codes': { cellWidth: 11 },
      'Legder Name': { cellWidth: 11 },
      'Legder Type': { cellWidth: 12 },
      'Pymt Type': { cellWidth: 9 },
      'Pymt Number': { cellWidth: 11 },
      Amount: { cellWidth: 8 },
      'Payment Date': { cellWidth: 12 },
      'Post Date': { cellWidth: 12 },
      'Deposit Date': { cellWidth: 12 },
      Fee: { cellWidth: 10 },
      Allowable: { cellWidth: 9 },
      Adjustments: { cellWidth: 9 },
      Deductible: { cellWidth: 9 },
      CoInsurance: { cellWidth: 9 },
      'Created By': { cellWidth: 8 },
    });
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
    const obj: ProcedureTransactionHistoryReportCriteria = {
      groupID: searchCriteria.groupID,
      practiceID: searchCriteria.practiceID,
      providerID: searchCriteria.providerID,
      facilityID: searchCriteria.facilityID,
      fromPostingDate: searchCriteria.fromPostingDate,
      toPostingDate: searchCriteria.toPostingDate,
      claimID: searchCriteria.claimID,
      patientID: searchCriteria.patientID,
      insuranceID: searchCriteria.insuranceID,
      sortColumn: '',
      pageNumber: undefined,
      pageSize: undefined,
      sortOrder: '',
      getAllData: true,
      chargeID: searchCriteria.chargeID,
      getOnlyIDS: searchCriteria.getOnlyIDS,
      posID: undefined,
      fromDOS: searchCriteria.fromDOS,
      toDOS: searchCriteria.toDOS,
      cptCode: searchCriteria.cptCode,
      patientFirstName: searchCriteria.patientFirstName,
      patientLastName: searchCriteria.patientLastName,
    };
    const res = await fetchProcedureTransactionHistoryReportData(obj);
    if (res) {
      if (type === 'pdf') {
        downloadPdf(res);
      } else {
        const exportDataArray = res.map((n) => {
          return {
            'CPT Code': n.cpt,
            Practice: n.practice,
            Facility: n.facility,
            PoS: n.pos,
            Provider: n.provider,
            Insurance: n.insurance,
            'Patient Name': n.patient,
            'Patient ID': n.patientID.toString() || '',
            DoS: `${n.fromDOS}-\n${n.toDOS}`,
            'Claim ID': n.claimID?.toString() || '',
            'Charge ID': n.chargeID?.toString() || '',
            'Legder ID': n.ledgerID?.toString() || '',
            'Adj. Codes': n.adjCodes,
            'Ledger ID': n.ledgerID.toString() || '',
            'Legder Name': n.ledgerName,
            'Legder Type': n.ledgerType,
            'Payment Type': n.paymentType,
            'Payment Number': n.paymentNumber,
            Amount: currencyFormatter.format(n.amount || 0),
            'Payment Date': n.paymentDate,
            'Post Date': n.postingDate,
            'Deposit Date': n.depositDate,
            Fee: currencyFormatter.format(n.fee || 0),
            Allowable: currencyFormatter.format(n.allowed || 0),
            Adjustments: currencyFormatter.format(n.adjustments || 0),
            Deductible: currencyFormatter.format(n.deductible || 0),
            CoInsurance: currencyFormatter.format(n.coinsurance || 0),
            'Created By': n.createdBy,
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
            'CPT Code': 'Criteria',
            Practice: 'Value',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          if (searchCriteria.groupID) {
            criteriaObj = {
              ...criteriaObj,
              'CPT Code': 'Group',
              Practice:
                groupDropdown.filter(
                  (m) => m.id === Number(searchCriteria.groupID)
                )[0]?.value || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria.practiceID) {
            criteriaObj = {
              ...criteriaObj,
              'CPT Code': 'Practice',
              Practice:
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
          if (searchCriteria.posID) {
            criteriaObj = {
              ...criteriaObj,
              'CPT Code': 'PoS',
              Practice:
                lookupsData?.placeOfService.filter(
                  (m) => m.id === searchCriteria.posID
                )[0]?.value || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.fromDOS) {
            criteriaObj = {
              ...criteriaObj,
              'CPT Code': 'Date of Service - From',
              Practice: DateToStringPipe(searchCriteria?.fromDOS, 1),
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.toDOS) {
            criteriaObj = {
              ...criteriaObj,
              'CPT Code': 'Date of Service - To',
              Practice: DateToStringPipe(searchCriteria?.toDOS, 1),
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.claimID) {
            criteriaObj = {
              ...criteriaObj,
              'CPT Code': 'Claim ID',
              Practice: searchCriteria?.claimID?.toString() || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.cptCode) {
            criteriaObj = {
              ...criteriaObj,
              'CPT Code': 'CPT Code',
              Practice: searchCriteria?.cptCode || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.chargeID) {
            criteriaObj = {
              ...criteriaObj,
              'CPT Code': 'Charge ID',
              Practice: searchCriteria?.chargeID?.toString() || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.patientFirstName) {
            criteriaObj = {
              ...criteriaObj,
              'CPT Code': 'Patient First Name',
              Practice: searchCriteria?.patientFirstName?.toString() || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.patientLastName) {
            criteriaObj = {
              ...criteriaObj,
              'CPT Code': 'Patient Last Name',
              Practice: searchCriteria?.patientLastName?.toString() || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.patientID) {
            criteriaObj = {
              ...criteriaObj,
              'CPT Code': 'Patient ID',
              Practice: searchCriteria?.patientID?.toString() || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria.insuranceID) {
            criteriaObj = {
              ...criteriaObj,
              'CPT Code': 'Insurance',
              Practice:
                insuranceAllData?.filter(
                  (m) => m.id === Number(searchCriteria.insuranceID)
                )[0]?.value || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria.providerID) {
            criteriaObj = {
              ...criteriaObj,
              'CPT Code': 'Provider',
              Practice:
                providerDropdown.filter(
                  (m) => m.id === Number(searchCriteria.providerID)
                )[0]?.value || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.fromPostingDate) {
            criteriaObj = {
              ...criteriaObj,
              'CPT Code': 'Post Date - From',
              Practice: DateToStringPipe(searchCriteria?.fromPostingDate, 1),
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.toPostingDate) {
            criteriaObj = {
              ...criteriaObj,
              'CPT Code': 'Post Date - To',
              Practice: DateToStringPipe(searchCriteria?.toPostingDate, 1),
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          criteriaObj = Object.fromEntries(headerArray.map((key) => [key, '']));
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));

          criteriaObj = Object.fromEntries(headerArray.map((key) => [key, '']));
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            'CPT Code': 'Procedure Transaction History Details',
            Practice: '',
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
            ExportDataToCSV(exportArray, 'ProcedureTransactionHistoryReport');
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
  const onSelectExportReportOption = (value: number) => {
    if (value === 1) {
      ExportData('pdf');
    }
    if (value === 2) {
      ExportData('csv');
    }
  };

  return (
    <AppLayout title="Nucleus - Procedure Transaction History Report">
      <div className="relative m-0 h-full bg-gray-100 p-0">
        <div className="m-0 h-full w-full overflow-y-scroll bg-gray-100 p-0">
          <div className="flex w-full flex-col">
            <div className="m-0 h-full w-full overflow-y-auto overflow-x-hidden bg-gray-100 p-0">
              <div className="h-[125px] w-full">
                <div className="absolute top-0 z-[11] w-full">
                  <Breadcrumbs />
                  <PageHeader>
                    <div className="flex items-start justify-between gap-4  bg-white px-7 pb-[21px] pt-[33px]">
                      <div className="flex h-[38px] gap-6">
                        <p className="self-center text-3xl font-bold text-cyan-700">
                          Procedure Transaction History Report
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
                        <div className={`w-[50%] px-[5px] lg:w-[20%]`}>
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
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div
                          className={`w-[50%] px-[5px] pl-[10px] lg:w-[20%]`}
                        >
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
                              />
                            </div>
                          </div>
                        </div>
                        <div
                          className={`w-[50%] px-[5px] pl-[10px] lg:w-[20%]`}
                        >
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
                        <div
                          className={`w-[50%] px-[5px] pl-[10px] lg:w-[20%]`}
                        >
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              PoS
                            </div>
                            <div className="w-full">
                              <SingleSelectDropDown
                                placeholder="-"
                                disabled={false}
                                data={
                                  lookupsData?.placeOfService
                                    ? (lookupsData?.placeOfService as SingleSelectDropDownDataType[])
                                    : []
                                }
                                selectedValue={
                                  lookupsData?.placeOfService.filter(
                                    (m) => m.id === searchCriteria.posID
                                  )[0]
                                }
                                onSelect={(value) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    posID: value.id,
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
                                Date of Service - From
                              </div>
                              <div className="w-full">
                                <AppDatePicker
                                  cls="!mt-1"
                                  selected={searchCriteria?.fromDOS}
                                  onChange={(value) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      fromDOS: DateToStringPipe(value, 1),
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className={`w-[50%] pl-[10px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Date of Service - To
                              </div>
                              <div className="w-full">
                                <AppDatePicker
                                  cls="!mt-1"
                                  selected={searchCriteria?.toDOS}
                                  onChange={(value) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      toDOS: DateToStringPipe(value, 1),
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div
                          className={`w-[50%] px-[5px] pl-[10px] lg:w-[20%]`}
                        >
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Claim ID
                            </div>
                            <div className="w-full">
                              <InputField
                                placeholder="Claim ID"
                                value={searchCriteria.claimID}
                                onChange={(evt) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    claimID: evt.target.value
                                      ? evt.target.value
                                      : '',
                                  });
                                }}
                                type={'number'}
                              />
                            </div>
                          </div>
                        </div>
                        <div
                          className={`w-[50%] px-[5px] pl-[10px] lg:w-[20%]`}
                        >
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              CPT Code
                            </div>
                            <div className="w-full">
                              <InputField
                                placeholder="CPT Code"
                                value={searchCriteria.cptCode}
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
                        <div
                          className={`w-[50%] px-[5px] pl-[10px] lg:w-[20%]`}
                        >
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Charge ID
                            </div>
                            <div className="w-full">
                              <InputField
                                placeholder="Charge ID"
                                value={searchCriteria.chargeID}
                                onChange={(evt) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    chargeID: evt.target.value
                                      ? evt.target.value
                                      : '',
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
                        <div className={`w-[50%] px-[5px] lg:w-[20%]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Patient First Name
                            </div>
                            <div className="w-full">
                              <InputField
                                placeholder="Patient First Name"
                                value={searchCriteria.patientFirstName}
                                onChange={(evt) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    patientFirstName: evt.target.value,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div
                          className={`w-[50%] px-[5px] pl-[10px] lg:w-[20%]`}
                        >
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Patient Last Name
                            </div>
                            <div className="w-full">
                              <InputField
                                placeholder="Patient Last Name"
                                value={searchCriteria.patientLastName}
                                onChange={(evt) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    patientLastName: evt.target.value,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={`w-[50%] px-[10px] lg:w-[20%]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Patient ID
                            </div>
                            <div className="w-full">
                              <InputField
                                placeholder="Patient ID"
                                value={searchCriteria.patientID}
                                onChange={(evt) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    patientID: evt.target.value
                                      ? evt.target.value
                                      : '',
                                  });
                                }}
                                type={'number'}
                              />
                            </div>
                          </div>
                        </div>
                        <div
                          className={'hidden justify-center lg:flex lg:w-[1%]'}
                        >
                          <div className={`h-full w-[1px] bg-gray-200`} />
                        </div>
                        <div className={`w-[50%] px-[10px] lg:w-[20%]`}>
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
                      </div>
                    </div>
                    <div className={'px-[5px] py-[15px]'}>
                      <div className={`h-[1px] w-full bg-gray-200`} />
                    </div>
                    <div className="w-full">
                      <div className="px-[5px] pb-[5px]">
                        <p className="text-base font-bold leading-normal text-gray-700">
                          Other
                        </p>
                      </div>
                      <div className="flex w-full flex-wrap">
                        <div
                          className={`w-[50%] px-[5px] pr-[10px] lg:w-[20.5%]`}
                        >
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
                              />
                            </div>
                          </div>
                        </div>
                        <div
                          className={'hidden justify-center lg:flex lg:w-[1%]'}
                        >
                          <div className={`h-full w-[1px] bg-gray-200`} />
                        </div>
                        <div
                          className={`flex w-[50%] px-[5px] pl-[10px] lg:w-[25%]`}
                        >
                          <div className={`w-[50%] pr-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
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
                                      fromPostingDate: DateToStringPipe(
                                        value,
                                        1
                                      ),
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className={`w-[50%] pl-[10px]`}>
                            <div className={`w-full items-start self-stretch`}>
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
                                      toPostingDate: DateToStringPipe(value, 1),
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
                    <div className={'px-[15px]'}>
                      <div className={`w-[1px] h-[35px] bg-gray-300`} />
                    </div>
                    <div className="">
                      <ButtonDropdown
                        disabled={!searchResult?.length}
                        buttonCls="!h-[34px]"
                        showIcon={true}
                        cls="!w-[172px]"
                        popoverCls="!w-[172px]"
                        buttonLabel="Export Report"
                        dataList={[
                          {
                            id: 1,
                            title: 'Export Report to PDF',
                            showBottomDivider: false,
                          },
                          {
                            id: 2,
                            title: 'Export Report to CSV',
                            showBottomDivider: false,
                          },
                        ]}
                        onSelect={(evt) => {
                          onSelectExportReportOption(evt);
                        }}
                      />
                    </div>
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
              <div className="w-full gap-4 bg-gray-50 px-7 pb-[15px] pt-[25px]">
                <SearchDetailGrid
                  pageNumber={lastSearchCriteria.pageNumber}
                  pageSize={lastSearchCriteria.pageSize}
                  totalCount={searchResult[0]?.total}
                  persistLayoutId={26}
                  rows={
                    searchResult?.map((row) => {
                      return { ...row, id: row.rid };
                    }) || []
                  }
                  columns={columns}
                  checkboxSelection={false}
                  onPageChange={(page: number) => {
                    const obj: ProcedureTransactionHistoryReportCriteria = {
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
                      const obj: ProcedureTransactionHistoryReportCriteria = {
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
                      const obj: ProcedureTransactionHistoryReportCriteria = {
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

export default TransactionHistoryReport;
