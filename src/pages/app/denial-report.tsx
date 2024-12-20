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
import InputField from '@/components/UI/InputField';
import RadioButton from '@/components/UI/RadioButton';
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
  setGlobalModal,
} from '@/store/shared/actions';
import {
  fetchDenialReportSearchData,
  fetchInsuranceData,
  getReasonCode,
  getRemarkCode,
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
  GetDenialReportCriteria,
  GetDenialReportResult,
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

const DenialReport = () => {
  const dispatch = useDispatch();
  const lookupsData = useSelector(getLookupDropdownsDataSelector);
  const insuranceData = useSelector(getAllInsuranceDataSelector);
  const practiceData = useSelector(getPracticeDataSelector);
  const providersData = useSelector(getProviderDataSelector);
  const facilityData = useSelector(getFacilityDataSelector);
  const [reasonCodeData, setReasonCodeData] = useState<ReasonCodeType[]>([]);
  const [remarkCodeData, setRemarkCodeData] = useState<ReasonCodeType[]>([]);
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
  const getRemarkCodeData = async (value: string) => {
    const res = await getRemarkCode(value);
    if (res) {
      setRemarkCodeData(res);
    }
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
  const defaultSearchCriteria: GetDenialReportCriteria = {
    groupID: undefined,
    practiceID: undefined,
    providerID: undefined,
    facilityID: undefined,
    eraCheckID: undefined,
    paymentNumber: '',
    groupCode: '',
    reasonCode: '',
    remarkCode: '',
    claimID: '',
    cpt: '',
    chargeID: '',
    fromCreateDate: '',
    toCreateDate: '',
    claimType: '',
    patientFirstName: '',
    patientLastName: '',
    insuranceID: undefined,
    pageNumber: 1,
    pageSize: globalPaginationConfig.activePageSize,
    sortByColumn: '',
    sortOrder: '',
    getAllData: undefined,
    getOnlyIDS: undefined,
  };
  const [lastSearchCriteria, setLastSearchCriteria] = useState(
    defaultSearchCriteria
  );
  const [searchCriteria, setSearchCriteria] = useState(defaultSearchCriteria);
  const [renderSearchCriteriaView, setRenderSearchCriteriaView] = useState(
    uuidv4()
  );
  const [searchResult, setSearchResult] = useState<GetDenialReportResult[]>([]);

  const setSearchCriteriaFields = (value: GetDenialReportCriteria) => {
    setSearchCriteria(value);
    setIsChangedJson(true);
  };

  const getSearchData = async (obj: GetDenialReportCriteria) => {
    const res = await fetchDenialReportSearchData(obj);
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
    getReasonCodeData('');
  };
  useEffect(() => {
    initProfile();
  }, []);

  const columns: GridColDef[] = [
    {
      field: 'group',
      headerName: 'Group',
      flex: 1,
      minWidth: 250,
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
              EIN: {params.row.groupEIN}
            </div>
          </div>
        );
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
            <div
              className="cursor-pointer text-cyan-500 underline"
              onClick={() => {
                window.open(`/app/claim-detail/${params.value}`);
              }}
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
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            {params.value ? `#${params.value}` : ''}
          </div>
        );
      },
    },
    {
      field: 'patient',
      headerName: 'Patient Name',
      flex: 1,
      minWidth: 220,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-cyan-500"
              onClick={() => {
                // window.open(`/app/register-patient/${params.row.patientID}`);
                dispatch(
                  setGlobalModal({
                    type: 'Patient Detail',
                    id: params.row.patientID,
                    isPopup: true,
                  })
                );
              }}
            >
              {params.value}
            </div>
          </div>
        );
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
      field: 'modifier',
      headerName: 'Modifier',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return <div className="flex flex-col">{params.value}</div>;
      },
    },
    {
      field: 'adjustementCodes',
      headerName: 'Group/Reason Code',
      flex: 1,
      minWidth: 180,
      disableReorder: true,
      // renderCell: (params) => {
      //   return (
      //     <div className="flex flex-col">
      //       <div className="cursor-pointer text-cyan-500" onClick={() => { }}>
      //         {params.value}
      //       </div>
      //     </div>
      //   );
      // },
    },
    {
      field: 'remarkCode',
      headerName: 'Remark Code',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return <div className="flex flex-col">{params.value}</div>;
      },
    },
    {
      field: 'dos',
      headerName: 'DoS',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return <div className="flex flex-col">{params.value}</div>;
      },
    },
    {
      field: 'payerClaimNumber',
      headerName: 'Payer Claim Number',
      flex: 1,
      minWidth: 250,
      disableReorder: true,
    },
    {
      field: 'eraID',
      headerName: 'ERA ID',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
      renderCell: (params) => {
        return <div className="flex flex-col">#{params.value}</div>;
      },
    },
    {
      field: 'paymentBatchID',
      headerName: 'Batch ID',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
      renderCell: (params) => {
        return <div className="flex flex-col">#{params.value}</div>;
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
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'eraInsurance',
      headerName: 'Insurance Name',
      flex: 1,
      minWidth: 350,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="cursor-pointer text-sm font-normal leading-5 text-cyan-500 underline">
              {params.value}
            </div>
          </div>
        );
      },
    },
    {
      field: 'crossoverCarrierID',
      headerName: 'Crossover Carrier ID',
      flex: 1,
      minWidth: 190,
      disableReorder: true,
    },
    {
      field: 'crossoverCarrierName',
      headerName: 'Crossover Carrier',
      flex: 1,
      minWidth: 350,
      disableReorder: true,
    },
    {
      field: 'billStatusCodeID',
      headerName: 'Bill Status',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'createdOn',
      headerName: 'Created On',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
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
      dispatch(fetchFacilityDataRequest({ groupID: groupId }));
      dispatch(fetchAssignClaimToDataRequest({ clientID: groupId }));
    }
  }, [searchCriteria?.groupID]);

  useEffect(() => {
    setPracticeDropdown(practiceData || []);
    setProviderDropdown(providersData || []);
    setFacilityDropdown(facilityData || []);
  }, [practiceData, providersData, facilityData]);

  const downloadPdf = (pdfExportData: GetDenialReportResult[]) => {
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
      const fName = facilityData?.filter(
        (m) => m.id === searchCriteria.facilityID
      )[0]?.value;
      criteriaArray.push({ Criteria: 'Facility', Value: fName || '' });
    }
    if (searchCriteria.providerID) {
      const Provider = providerDropdown.filter(
        (m) => m.id === Number(searchCriteria.providerID)
      )[0]?.value;
      criteriaArray.push({ Criteria: 'Provider', Value: Provider || '' });
    }
    if (searchCriteria.eraCheckID) {
      criteriaArray.push({
        Criteria: 'ERA ID Number',
        Value: searchCriteria.eraCheckID || '',
      });
    }
    if (searchCriteria.paymentNumber) {
      criteriaArray.push({
        Criteria: 'Payment Number',
        Value: searchCriteria.paymentNumber || '',
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
    if (searchCriteria.remarkCode) {
      criteriaArray.push({
        Criteria: 'Remark Code',
        Value:
          remarkCodeData?.filter(
            (f) => f.value === searchCriteria?.remarkCode
          )[0]?.value || '',
      });
    }
    if (searchCriteria.fromCreateDate) {
      criteriaArray.push({
        Criteria: 'Pay. Creat. Date - From',
        Value: DateToStringPipe(searchCriteria.fromCreateDate, 1),
      });
    }
    if (searchCriteria.toCreateDate) {
      criteriaArray.push({
        Criteria: 'Pay. Creat. Date - To',
        Value: DateToStringPipe(searchCriteria.toCreateDate, 1),
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
    let claimType = '';
    if (searchCriteria?.claimType || searchCriteria.claimType === '') {
      if (searchCriteria?.claimType === '1') {
        claimType = 'Primary';
      } else if (searchCriteria?.claimType === '2') {
        claimType = 'Secondary+';
      } else {
        claimType = 'Both';
      }
    }
    if (claimType) {
      criteriaArray.push({ Criteria: 'Claim Type', Value: claimType });
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
    if (searchCriteria.insuranceID) {
      criteriaArray.push({
        Criteria: 'Insurance',
        Value:
          insuranceAllData?.filter(
            (m) => m.id === Number(searchCriteria.insuranceID)
          )[0]?.value || '',
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
        Group: n.group,
        'Claim ID': n.claimID,
        'Charge ID': n.chargeID,
        'Patient Name': n.patient,
        'CPT Code': n.cpt,
        Modifier: n.modifier,
        'Group/Reason Code': n.adjustementCodes,
        'Remark Code': n.remarkCode,
        DoS: n.dos,
        'Payer Claim Number': n.payerClaimNumber,
        'ERA ID': n.eraID,
        'Batch ID': n.paymentBatchID,
        'Pay. Number': n.paymentNumber,
        'Pay. Date': n.paymentDate,
        'ERA Insurance': n.eraInsurance,
        'Crossover Carrier ID': n.crossoverCarrierID,
        'Crossover Carrier': n.crossoverCarrierName,
        'Bill Status': n.billStatusCodeID,
        'Created On': n.createdOn,
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
    ExportDataToPDF(data, 'Denial Report');
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
    const obj: GetDenialReportCriteria = {
      groupID: searchCriteria.groupID,
      practiceID: searchCriteria.practiceID,
      facilityID: searchCriteria.facilityID,
      providerID: searchCriteria.providerID,
      eraCheckID: searchCriteria.eraCheckID,
      paymentNumber: searchCriteria.paymentNumber,
      groupCode: searchCriteria.groupCode,
      reasonCode: searchCriteria.reasonCode,
      remarkCode: searchCriteria.remarkCode,
      fromCreateDate: searchCriteria.fromCreateDate,
      toCreateDate: searchCriteria.toCreateDate,
      claimID: searchCriteria.claimID,
      cpt: searchCriteria.cpt,
      chargeID: searchCriteria.chargeID,
      claimType: searchCriteria.claimType,
      patientFirstName: searchCriteria.patientFirstName,
      patientLastName: searchCriteria.patientLastName,
      insuranceID: searchCriteria.insuranceID,
      sortByColumn: '',
      pageNumber: undefined,
      pageSize: undefined,
      sortOrder: '',
      getAllData: true,
      getOnlyIDS: searchCriteria.getOnlyIDS,
    };
    const res = await fetchDenialReportSearchData(obj);
    if (res) {
      if (type === 'pdf') {
        downloadPdf(res);
      } else {
        const exportDataArray = res.map((n) => {
          return {
            Group: n.group,
            'Claim ID': n.claimID?.toString(),
            'Charge ID': n.chargeID?.toString(),
            'Patient Name': n.patient,
            'CPT Code': n.cpt,
            Modifier: n.modifier,
            'Group/Reason Code': n.adjustementCodes,
            'Remark Code': n.remarkCode,
            DoS: n.dos,
            'Payer Claim Number': n.payerClaimNumber,
            'ERA ID': n.eraID.toString(),
            'Batch ID': n.paymentBatchID.toString(),
            'Pay. Number': n.paymentNumber,
            'Pay. Date': n.paymentDate,
            'ERA Insurance': n.eraInsurance,
            'Crossover Carrier ID': n.crossoverCarrierID,
            'Crossover Carrier': n.crossoverCarrierName,
            'Bill Status': n.billStatusCodeID.toString(),
            'Created On': n.createdOn,
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
            Group: 'Criteria',
            'Claim ID': 'Value',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          if (searchCriteria.groupID) {
            criteriaObj = {
              ...criteriaObj,
              Group: 'Group',
              'Claim ID':
                groupDropdown.filter(
                  (m) => m.id === Number(searchCriteria.groupID)
                )[0]?.value || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria.practiceID) {
            criteriaObj = {
              ...criteriaObj,
              Group: 'Practice',
              'Claim ID':
                practiceDropdown.filter(
                  (m) => m.id === Number(searchCriteria.practiceID)
                )[0]?.value || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria.facilityID) {
            criteriaObj = {
              ...criteriaObj,
              Group: 'Facility',
              'Claim ID':
                facilityDropdown.filter(
                  (m) => m.id === Number(searchCriteria.facilityID)
                )[0]?.value || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria.providerID) {
            criteriaObj = {
              ...criteriaObj,
              Group: 'Provider',
              'Claim ID':
                providerDropdown.filter(
                  (m) => m.id === Number(searchCriteria.providerID)
                )[0]?.value || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria.eraCheckID) {
            criteriaObj = {
              ...criteriaObj,
              Group: 'ERA ID Number',
              'Claim ID': searchCriteria.eraCheckID?.toString() || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria.paymentNumber) {
            criteriaObj = {
              ...criteriaObj,
              Group: 'Payment Number',
              'Claim ID': searchCriteria.paymentNumber || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.groupCode) {
            criteriaObj = {
              ...criteriaObj,
              Group: 'Group Code',
              'Claim ID':
                lookupsData?.groupCode.filter(
                  (a) => a.code === searchCriteria?.groupCode
                )[0]?.value || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.reasonCode) {
            criteriaObj = {
              ...criteriaObj,
              Group: 'Reason Code',
              'Claim ID':
                reasonCodeData?.filter(
                  (f) => f.code === searchCriteria?.reasonCode
                )[0]?.value || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.remarkCode) {
            criteriaObj = {
              ...criteriaObj,
              Group: 'Remark Code',
              'Claim ID':
                remarkCodeData?.filter(
                  (f) => f.value === searchCriteria?.remarkCode
                )[0]?.value || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.fromCreateDate) {
            criteriaObj = {
              ...criteriaObj,
              Group: 'Created Date - From',
              'Claim ID': DateToStringPipe(searchCriteria?.fromCreateDate, 1),
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.toCreateDate) {
            criteriaObj = {
              ...criteriaObj,
              Group: 'Created Date - To',
              'Claim ID': DateToStringPipe(searchCriteria?.toCreateDate, 1),
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.claimID) {
            criteriaObj = {
              ...criteriaObj,
              Group: 'Claim ID',
              'Claim ID': searchCriteria?.claimID?.toString() || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.cpt) {
            criteriaObj = {
              ...criteriaObj,
              Group: 'CPT Code',
              'Claim ID': searchCriteria?.cpt || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.chargeID) {
            criteriaObj = {
              ...criteriaObj,
              Group: 'Charge ID',
              'Claim ID': searchCriteria?.chargeID?.toString() || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          let claimType = '';
          if (searchCriteria?.claimType === '1') {
            claimType = 'Primary';
          } else if (searchCriteria?.claimType === '2') {
            claimType = 'Secondary+';
          } else {
            claimType = 'Both';
          }
          if (searchCriteria?.claimType || searchCriteria.claimType === '') {
            criteriaObj = {
              ...criteriaObj,
              Group: 'Claim Type',
              'Claim ID': claimType,
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.patientFirstName) {
            criteriaObj = {
              ...criteriaObj,
              Group: 'Patient First Name',
              'Claim ID': searchCriteria.patientFirstName || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.patientLastName) {
            criteriaObj = {
              ...criteriaObj,
              Group: 'Patient Last Name',
              'Claim ID': searchCriteria.patientLastName || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria.insuranceID) {
            criteriaObj = {
              ...criteriaObj,
              Group: 'Insurance',
              'Claim ID':
                insuranceAllData?.filter(
                  (m) => m.id === Number(searchCriteria.insuranceID)
                )[0]?.value || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          criteriaObj = Object.fromEntries(headerArray.map((key) => [key, '']));
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));

          criteriaObj = Object.fromEntries(headerArray.map((key) => [key, '']));
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            Group: 'Denial Report Details',
            'Claim ID': '',
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
            ExportDataToCSV(exportArray, 'DenailReport');
            dispatch(
              addToastNotification({
                text: 'Export Successful',
                toastType: ToastType.SUCCESS,
                id: '',
              })
            );
          } else {
            ExportDataToDrive(exportArray, 'DenialReport', dispatch);
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
    <AppLayout title="Nucleus - Denial Report">
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
                          Denial Report
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
                                    practiceID: undefined,
                                    facilityID: undefined,
                                    providerID: undefined,
                                    insuranceID: undefined,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={`w-[50%] px-[5px] lg:w-[20%]`}>
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
                        <div className={`w-[50%] px-[5px] lg:w-[20%]`}>
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
                                isOptional={true}
                                onDeselectValue={() => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    facilityID: undefined,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={`w-[50%] px-[5px] lg:w-[20%]`}>
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
                        <div className={`w-[50%] px-[5px] lg:w-[18%]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              ERA ID Number
                            </div>
                            <div className="w-full">
                              <InputField
                                placeholder="ERA ID Number"
                                value={searchCriteria.eraCheckID}
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
                        <div className={`w-[50%] px-[5px] lg:w-[18%]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Payment Number
                            </div>
                            <div className="w-full">
                              <InputField
                                placeholder="Payment Number"
                                value={searchCriteria.paymentNumber}
                                onChange={(evt) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    paymentNumber: evt.target.value,
                                  });
                                }}
                                type={'number'}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={`flex w-[15%] px-[5px] lg:w-[18%]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Group Code
                            </div>
                            <div className="w-full">
                              <SingleSelectDropDown
                                placeholder="-"
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
                        <div className={`flex w-[15%] px-[5px] lg:w-[18%]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Reason Code
                            </div>
                            <div className="w-full">
                              <SingleSelectDropDown
                                placeholder="-"
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
                      <div className="mt-2 flex w-full flex-wrap">
                        <div className={`flex w-[15%] px-[5px] lg:w-[18%]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Remark Code
                            </div>
                            <div className="w-full">
                              <SingleSelectDropDown
                                placeholder="-"
                                showSearchBar={true}
                                data={remarkCodeData}
                                searchOnCharacterLength={3}
                                selectedValue={
                                  remarkCodeData?.filter(
                                    (f) =>
                                      f.value === searchCriteria?.remarkCode
                                  )[0]
                                }
                                onSelect={(e) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    remarkCode: e.value,
                                  });
                                }}
                                onSearch={(e) => {
                                  getRemarkCodeData(e);
                                }}
                                isOptional={true}
                                onDeselectValue={() => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    remarkCode: undefined,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={`flex w-[50%] px-[5px] lg:w-[33%]`}>
                          <div className={`w-[50%] pr-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Created Date - From
                              </div>
                              <div className="w-full">
                                <AppDatePicker
                                  cls="!mt-1"
                                  selected={searchCriteria?.fromCreateDate}
                                  onChange={(value) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      fromCreateDate: DateToStringPipe(
                                        value,
                                        1
                                      ),
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className={`w-[50%] pl-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Created Date - To
                              </div>
                              <div className="w-full">
                                <AppDatePicker
                                  cls="!mt-1"
                                  selected={searchCriteria?.toCreateDate}
                                  onChange={(value) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      toCreateDate: DateToStringPipe(value, 1),
                                    });
                                  }}
                                />
                              </div>
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
                        <div className={`w-[50%] px-[5px] lg:w-[25%]`}>
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
                                    claimID: evt.target.value,
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
                              CPT Code
                            </div>
                            <div className="w-full">
                              <InputField
                                placeholder="CPT Code"
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
                                placeholder="Charge ID"
                                value={searchCriteria.chargeID}
                                onChange={(evt) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    chargeID: evt.target.value,
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
                              Claim Type
                            </div>
                            <div className="mt-[4px]  flex h-[38px] w-full items-center">
                              <RadioButton
                                data={[
                                  { value: '1', label: 'Primary' },
                                  { value: '2', label: 'Secondary+' },
                                  { value: '', label: 'Both' },
                                ]}
                                checkedValue={
                                  searchCriteria.claimType
                                    ? searchCriteria.claimType.toString()
                                    : ''
                                }
                                onChange={(e) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    claimType: e.target.value,
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
                        <div className={`w-[50%] px-[5px] lg:w-[23%]`}>
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
                        <div
                          className={'hidden justify-center lg:flex lg:w-[1%]'}
                        >
                          <div className={`h-full w-[1px] bg-gray-200`} />
                        </div>
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
                <SearchDetailGrid
                  pageNumber={lastSearchCriteria.pageNumber}
                  pageSize={lastSearchCriteria.pageSize}
                  totalCount={searchResult[0]?.totalCount}
                  rows={searchResult.map((row) => {
                    return { ...row, id: row.rid };
                  })}
                  columns={columns}
                  persistLayoutId={18}
                  checkboxSelection={false}
                  onPageChange={(page: number) => {
                    const obj: GetDenialReportCriteria = {
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
                      const obj: GetDenialReportCriteria = {
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
                      const obj: GetDenialReportCriteria = {
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

export default DenialReport;
