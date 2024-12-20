import { type GridColDef } from '@mui/x-data-grid-pro';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { baseUrl } from '@/api/http-client';
import Icon from '@/components/Icon';
import Tabs from '@/components/OrganizationSelector/Tabs';
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
import StageWidget from '@/components/UI/StageWidget';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import UnappliedPatientAmountModal from '@/components/UnappliedPatientAmountModal';
import AppLayout from '@/layouts/AppLayout';
import AddNewVersaPaperDocument from '@/screen/versapaper/AddNewDocument';
import { getselectdWorkGroupsIDsSelector } from '@/store/chrome/selectors';
import {
  addToastNotification,
  fetchAssignClaimToDataRequest,
  fetchFacilityDataRequest,
  fetchPracticeDataRequest,
} from '@/store/shared/actions';
import {
  fetchAllPatientsSearchDataPatientIDS,
  getExcludeInsuranceDropdown,
  getPatientLookup,
  getPatientStatementData,
  onPatientStatementsFileDownload,
} from '@/store/shared/sagas';
import {
  getFacilityDataSelector,
  getPracticeDataSelector,
} from '@/store/shared/selectors';
import type {
  GetAllClaimsSearchDataCriteria,
  GetPatientStatemntCriteria,
  IdValuePair,
  PatientStatementType,
  StatemntExportType,
} from '@/store/shared/types';
import { ToastType } from '@/store/shared/types';
import type {
  DownloadDataPDFDataType,
  PDFColumnInput,
  PDFRowInput,
} from '@/utils';
import {
  currencyFormatter,
  ExportDataToCSV,
  ExportDataToDrive,
  ExportDataToPDF,
} from '@/utils';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';
import { DateToStringPipe } from '@/utils/dateConversionPipes';

const VersaPaperDocument = () => {
  const [selectRows, setSelectRows] = useState<number[]>([]);
  const dispatch = useDispatch();
  const [groupData, setGroupData] = useState<SingleSelectDropDownDataType[]>();
  const [practiceData, setPracticeData] =
    useState<SingleSelectDropDownDataType[]>();
  const practicesAPIData = useSelector(getPracticeDataSelector);
  const facilityAPIData = useSelector(getFacilityDataSelector);
  // const [statementData, setStatementData] = useState<PatientStatementType[]>(
  //   []
  // );
  const [hideSearchParameters, setHideSearchParameters] =
    useState<boolean>(true);
  const selectedWorkedGroup = useSelector(getselectdWorkGroupsIDsSelector);
  const [patientExludeInsuarnecData, setPatientExludeInsuarnecData] = useState<
    IdValuePair[] | null
  >([]);
  const [facilityData, setFacilityData] =
    useState<SingleSelectDropDownDataType[]>();
  const [isChangedJson, setIsChangedJson] = useState(false);
  const [statusModalInfo, setStatusModalInfo] = useState({
    show: false,
    heading: '',
    text: '',
    type: StatusModalType.WARNING,
  });
  const [openUnappliedPaymentsModal, setOpenUnappliedPaymentModal] =
    useState(false);
  const parameterDropdownList = [
    { id: 1, value: 'Recieve Date' },
    { id: 2, value: 'Process Date' },
  ];
  const stateCategories = [
    {
      id: 1,
      count: 10,
      value: 'Recieved',
      color: 'gray',
    },
    {
      id: 2,
      count: 11,
      value: 'Unprocessed',
      color: 'pink',
    },
    {
      id: 3,
      count: 82,
      value: 'Unverfied',
      color: 'yellow',
    },
    {
      id: 4,
      count: 22,
      value: 'Processed',
      color: 'green',
    },
    {
      id: 5,
      count: 11,
      value: 'Rejected',
      color: 'red',
    },
  ];

  const dateRangeDropdownList = [
    { id: 1, value: 'Custom' },
    { id: 2, value: 'All Dates' },
    { id: 7, value: 'Last 7 Days' },
    { id: 15, value: 'Last 15 Days' },
    { id: 30, value: 'Last 30 Days' },
    { id: 60, value: 'Last 60 Days' },
    { id: 90, value: 'Last 90 Days' },
    { id: 120, value: 'Last 120 Days' },
  ];
  const defaultSearchCriteria: any = {
    patientID: undefined,
    groupID: undefined,
    providerID: undefined,
    practiceID: undefined,
    pageNumber: 1,
    pageSize: globalPaginationConfig.activePageSize,
    sortByColumn: '',
    sortOrder: '',
    patientLastName: '',
    patientFirstName: '',
    patientDOB: '',
    showRecent: 'false',
    facilityID: undefined,
    parameter: parameterDropdownList[0] || null,
    startDate: new Date(new Date().setDate(new Date().getDate() - 7))
      .toLocaleDateString()
      .slice(0, 10),
    endDate: new Date().toLocaleDateString().slice(0, 10),
    dateRange: dateRangeDropdownList[2] || null,
    // getAllData: false,
  };
  const [lastSearchCriteria, setLastSearchCriteria] = useState(
    defaultSearchCriteria
  );
  const [searchCriteria, setSearchCriteria] = useState(defaultSearchCriteria);

  const onSelectDateRange = (selectedDateRange: any) => {
    let startDate: Date | null = null;
    let endDate: Date | null = null;
    setSearchCriteria({
      ...searchCriteria,
      dateRange: selectedDateRange,
    });
    if (
      selectedDateRange &&
      selectedDateRange.id !== 1 &&
      selectedDateRange.id !== 2
    ) {
      startDate = new Date();
      endDate = new Date();
      const numberOfDays = selectedDateRange.id;
      const dateOffset = 24 * 60 * 60 * 1000 * numberOfDays;
      startDate.setTime(startDate.getTime() - dateOffset);

      setSearchCriteria({
        ...searchCriteria,
        endDate,
        startDate,
      });
    }
  };

  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const setSearchCriteriaFields = (value: GetPatientStatemntCriteria) => {
    setSearchCriteria(value);
    setIsChangedJson(true);
  };

  const getSearchData = async (obj: GetPatientStatemntCriteria) => {
    console.log(obj);
    setSearchResult([
      {
        id: 1,
        documentID: 'D194038',
        documentName: 'abc_doc54353',
        templateName: 'AMBETTER_MH0927_R33333 ',
        templatedID: 'T100280',
        eraCreated: 'E007132',
        status: 'Done',
        amountVerified: 'yes',
        createdOn: '10-23-2024',
      },
      {
        id: 2,
        documentID: 'D194039',
        documentName: 'abc_doc4433',
        templateName: 'AMBETTER_MH0927_R33333 ',
        templatedID: 'T100280',
        eraCreated: 'E007132',
        status: 'Done',
        amountVerified: 'yes',
        createdOn: '10-23-2024',
      },
      {
        id: 3,
        documentID: 'D194040',
        documentName: 'abc_doc123',
        templateName: 'AMBETTER_MH0927_R33333 ',
        templatedID: 'T100280',
        eraCreated: 'E007132',
        status: 'Done',
        amountVerified: 'yes',
        createdOn: '10-23-2024',
      },
    ]);
    // const res = await getPatientStatementData(obj);
    // if (res) {
    //   setStatementData(res);
    //   setSearchResult(res);
    //   setTotalCount(res[0]?.total || 0);
    //   setLastSearchCriteria(obj);
    // } else {
    //   setStatusModalInfo({
    //     ...statusModalInfo,
    //     show: true,
    //     heading: 'Error',
    //     type: StatusModalType.ERROR,
    //     text: 'A system error occurred while searching for results.\nPlease try again.',
    //   });
    // }
  };

  // Search bar
  const tabs = [
    // { name: 'All', count: 0 },
    { name: 'Unverified', count: 82 },
    { name: 'Recieved', count: 10 },
    { name: 'Unprocessed', count: 11 },
    { name: 'Processed', count: 22 },
    { name: 'Rejected', count: 11 },
  ];
  const [currentTab, setCurrentTab] = useState(tabs[0]);
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
  const onClickSearch = async () => {
    const obj = {
      ...searchCriteria,
      sortColumn: '',
      sortOrder: '',
      pageNumber: 1,
    };
    setSearchCriteria(obj);
    getSearchData(obj);
    setCurrentTab(tabs[0]);
  };
  const gridRef = useRef<HTMLTableRowElement>(null);
  const onSelectStateCategories = (
    criteria: GetAllClaimsSearchDataCriteria
  ) => {
    if (criteria) {
      onClickSearch();
    }
    gridRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  useEffect(() => {
    const groupId = searchCriteria?.groupID;
    if (groupId) {
      dispatch(fetchAssignClaimToDataRequest({ clientID: groupId }));
    }
  }, [searchCriteria?.groupID]);

  const DropDownExclude = async () => {
    const res = await getExcludeInsuranceDropdown();
    if (res !== null) {
      setPatientExludeInsuarnecData(res);
    }
  };
  const patientLookupData = async () => {
    const res = await getPatientLookup();
    if (res) {
      DropDownExclude();
    }
  };

  useEffect(() => {
    patientLookupData();
  }, []);

  const onSelectAll = async () => {
    if (searchResult.length === 0) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'No data to select!',
          toastType: ToastType.ERROR,
        })
      );
      return;
    }

    if (selectRows.length === totalCount) {
      setSelectRows([]);
      return;
    }
    if (lastSearchCriteria) {
      const res = await fetchAllPatientsSearchDataPatientIDS(
        lastSearchCriteria
      );
      if (res) setSelectRows(res);
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'documentID',
      headerName: 'Document ID',
      flex: 1,
      minWidth: 138,
      disableReorder: true,
      renderCell: (params) => {
        const formattedValue = `#${params.value}`;
        return (
          <div className="flex flex-col">
            <div
              data-testid="org"
              className="cursor-pointer text-cyan-500"
              onClick={() => {}}
            >
              {formattedValue}
            </div>
          </div>
        );
      },
    },
    {
      field: 'documentName',
      headerName: 'Document Name',
      flex: 1,
      minWidth: 138,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="text-cyan-500 underline">{params.value}</div>
          </div>
        );
      },
    },
    {
      field: 'templateID',
      headerName: 'Template ID',
      flex: 1,
      minWidth: 140,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="text-cyan-500 underline">{params.value}</div>
          </div>
        );
      },
    },
    {
      field: 'createdOn',
      headerName: 'Created On',
      flex: 1,
      minWidth: 203,
      disableReorder: true,
      renderCell: (params) => {
        const date = new Date(params.value);
        return <div>{DateToStringPipe(date, 2)}</div>;
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      minWidth: 174,
      disableReorder: true,
      renderCell: (params) => {
        return <div>{params.value ? params.value : '-'}</div>;
      },
    },
    {
      field: 'eraCreated',
      headerName: 'ERA Created',
      flex: 1,
      minWidth: 140,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="text-cyan-500 underline">{params.value}</div>
          </div>
        );
      },
    },
    {
      field: 'amountVerified',
      headerName: 'Amount Verified',
      flex: 1,
      minWidth: 223,
      disableReorder: true,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      headerClassName: '!bg-cyan-100 !text-center',
      flex: 1,
      minWidth: 260,
      disableReorder: true,
      cellClassName: '!bg-cyan-50',
      renderCell: () => {
        return (
          <div>
            {currentTab?.name === 'Unverified' && (
              <Button
                buttonType={ButtonType.secondary}
                onClick={() => {
                  // setShowCrossoverClaimModal(true);
                  // setInsResponsibility(params.row.payerResponsibility);
                }}
                title="View Error List"
                cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 mr-1 inline-flex gap-2 leading-5`}
              >
                <Icon name={'warningNoBg'} size={18} color={IconColors.GRAY} />
              </Button>
            )}
            {(currentTab?.name === 'Unverified' ||
              currentTab?.name === 'Processed') && (
              <Button
                buttonType={ButtonType.secondary}
                onClick={() => {
                  // setIsInsuranceModalOpen(true);
                  // setIsViewInsuranceMode(true);
                  // setSelectedInsuranceGridRow(params.row);
                }}
                title="View Document"
                cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 mr-1 inline-flex gap-2 leading-5`}
              >
                <Icon name={'eye'} size={18} color={IconColors.NONE} />
              </Button>
            )}
            {(currentTab?.name === 'Unverified' ||
              currentTab?.name === 'Processed') && (
              <Button
                buttonType={ButtonType.secondary}
                onClick={() => {
                  // setSelectedInsuranceGridRow(params.row);
                  // setIsViewInsuranceMode(false);
                  // setIsInsuranceModalOpen(true);
                }}
                title="Document Log"
                cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 mr-1 inline-flex gap-2 leading-5`}
              >
                <Icon name={'documentText'} size={18} color={IconColors.GRAY} />
              </Button>
            )}
            {currentTab?.name === 'Unverified' && (
              <Button
                buttonType={ButtonType.secondary}
                cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                title="Delete Document"
                onClick={() => {}}
              >
                <Icon name={'trash'} size={18} />
              </Button>
            )}
            {currentTab?.name === 'Unverified' && (
              <Button
                buttonType={ButtonType.secondary}
                cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                title="Reject Document"
                onClick={() => {}}
              >
                <Icon name={'xCircle'} size={18} />
              </Button>
            )}
          </div>
        );
      },
    },
  ];
  const [isAddNewDocument, setAddNewDocument] = useState(false);
  useEffect(() => {
    if (selectedWorkedGroup && selectedWorkedGroup.groupsData) {
      setGroupData(selectedWorkedGroup.groupsData);
      setSearchCriteria({
        ...searchCriteria,
        groupID: selectedWorkedGroup?.groupsData[0]?.id || 0,
      });
      setSelectRows([]);
      onSelectDateRange(dateRangeDropdownList[2]);
    }
  }, [selectedWorkedGroup]);

  useEffect(() => {
    const { groupID } = searchCriteria;
    if (groupID) {
      dispatch(fetchPracticeDataRequest({ groupID }));
      dispatch(fetchFacilityDataRequest({ groupID }));
    }
  }, [searchCriteria.groupID]);

  useEffect(() => {
    if (practicesAPIData) {
      setPracticeData(practicesAPIData as SingleSelectDropDownDataType[]);
      setSearchCriteria({
        ...searchCriteria,
        groupID: selectedWorkedGroup?.groupsData[0]?.id,
        practiceID:
          practicesAPIData?.length === 1 ? practicesAPIData[0]?.id : undefined,
      });
    }
  }, [practicesAPIData]);

  useEffect(() => {
    if (facilityAPIData) {
      setFacilityData(facilityAPIData as SingleSelectDropDownDataType[]);
    }
  }, [facilityAPIData]);
  const onDownloadPatientStatementFile = async () => {
    const data: StatemntExportType = {
      patientIDs: selectRows.toString(),
      isProceeding: 'downloading',
      practiceID: searchCriteria.practiceID,
    };
    const response = await onPatientStatementsFileDownload(data);
    if (response?.response === 'Done') {
      const baseApiUrl = baseUrl.substring(0, baseUrl.lastIndexOf('/'));
      if (response && response.filePath) {
        const fileName = response.filePath; // Extract the file name from the file path
        if (fileName) {
          window.open(`${baseApiUrl}/${fileName}`, '_blank');
          onClickSearch();
        }
      }
      setOpenUnappliedPaymentModal(false);
    }
  };

  const exportDropdownData: ButtonSelectDropdownDataType[] = [
    {
      id: 1,
      value: 'Export to PDF',
      icon: 'pdf',
    },
    {
      id: 2,
      value: 'Export to CSV',
      icon: 'csv',
    },
    {
      id: 3,
      value: 'Export to Google Drive',
      icon: 'drive',
    },
  ];
  // const [statusModalInfo, setStatusModalInfo] = useState({
  //   show: false,
  //   heading: '',
  //   text: '',
  //   type: StatusModalType.WARNING,
  //   showCloseBUtton: StatusModalType.WARNING,
  // });
  const downloadPdf = (pdfExportData: PatientStatementType[]) => {
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

    if (searchCriteria.patientFirstName) {
      criteriaArray.push({
        Criteria: 'First Name',
        Value: searchCriteria?.patientFirstName || '',
      });
    }

    if (searchCriteria.patientLastName) {
      criteriaArray.push({
        Criteria: 'Last Name',
        Value: searchCriteria?.patientLastName || '',
      });
    }

    if (searchCriteria.patientDOB) {
      criteriaArray.push({
        Criteria: 'DOB',
        Value: DateToStringPipe(searchCriteria.patientDOB, 1),
      });
    }
    if (searchCriteria.patientID) {
      criteriaArray.push({
        Criteria: 'Patient ID',
        Value: searchCriteria?.patientID?.toString() || '',
      });
    }
    if (searchCriteria?.showRecent) {
      criteriaArray.push({
        Criteria: 'Show Recent Statements',
        Value: searchCriteria?.showRecent === 'true' ? 'Yes' : 'No',
      });
    }
    if (searchCriteria.groupID && groupData) {
      const groupName = groupData.filter(
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
    if (searchCriteria.facilityID && facilityData) {
      const facilityD = facilityData.filter(
        (m) => m.id === Number(searchCriteria.facilityID)
      )[0]?.value;
      criteriaArray.push({ Criteria: 'Facility', Value: facilityD || '' });
    }

    if (searchCriteria.insuranceTypeID) {
      const insurance = patientExludeInsuarnecData?.filter(
        (m) => m.id === Number(searchCriteria.insuranceTypeID)
      )[0]?.value;
      criteriaArray.push({
        Criteria: 'Exclude Insurance Type',
        Value: insurance || '',
      });
    }

    if (searchCriteria.patientBalanceFrom) {
      criteriaArray.push({
        Criteria: 'Balance Amount Greater or Equal to',
        Value: searchCriteria.patientBalanceFrom.toString() || '',
      });
    }
    if (searchCriteria.patientBalanceTo) {
      criteriaArray.push({
        Criteria: 'Balance Amount Less or Equal to',
        Value: searchCriteria.patientBalanceTo.toString() || '',
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
    const searchData: PDFRowInput[] = pdfExportData.map((n) => {
      return {
        'Patient ID': n.patientID.toString(),
        'Last Name': n.lastName,
        'First Name': n.firstName,
        Group: n.group,
        'Group EIN': n.groupEIN ? n.groupEIN.toString() : '',
        Practice: n.practice,
        'Practice Address': n.practiceAddress,
        Provider: n.provider,
        'Provider NPI': n.providerNPI,
        'Primary Insurance': n.primaryInsurance,
        'Secondary Insurance': n.secondaryInsurance,
        'Last Payment Date': n.lastPaymentDate,
        'Last Payment Amount': n.lastPaymentAmount
          ? currencyFormatter.format(n.lastPaymentAmount).toString()
          : '',
        'Patient Balance': n.patientBalance
          ? currencyFormatter.format(n.patientBalance).toString()
          : '',
        'Last Statement Date': n.lastStatementDate,
        'Last Statement Amount': n.lastStatementAmount
          ? currencyFormatter.format(n.lastStatementAmount).toString()
          : '',
        'Statement Type': n.statementType,
        'Days Since Last Statement': n.statementDays
          ? n.statementDays.toString()
          : '',
      };
    });
    const dataColumns: PDFColumnInput[] = [];
    const keyNames = searchData[0] && Object.keys(searchData[0]);
    if (keyNames) {
      for (let i = 0; i < keyNames.length; i += 1) {
        dataColumns.push({ title: keyNames[i], dataKey: keyNames[i] });
      }
    }
    data.push({ columns: dataColumns, body: searchData });
    ExportDataToPDF(data, 'Versapaper Documents');
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
    const obj: GetPatientStatemntCriteria = {
      patientFirstName: searchCriteria.patientFirstName,
      patientLastName: searchCriteria.patientLastName,
      patientDOB: searchCriteria.patientDOB,
      patientID: searchCriteria.patientID,
      groupID: searchCriteria.groupID,
      practiceID: searchCriteria.practiceID,
      facilityID: searchCriteria.facilityID,
      insuranceTypeID: searchCriteria.insuranceTypeID,
      patientBalanceFrom: searchCriteria.patientBalanceFrom,
      patientBalanceTo: searchCriteria.patientBalanceTo,
      showRecent: searchCriteria.showRecent,
      pageNumber: 0,
      pageSize: 10,
      sortByColumn: '',
      sortOrder: '',
      getAllData: true,
    };
    const res = await getPatientStatementData(obj);
    if (res) {
      if (type === 'pdf') {
        downloadPdf(res);
      } else {
        const exportDataArray = res.map((n) => {
          return {
            'Patient ID': n.patientID.toString(),
            'Last Name': n.lastName,
            'First Name': n.firstName,
            Group: n.group,
            'Group EIN': n.groupEIN ? n.groupEIN.toString() : '',
            Practice: n.practice,
            'Practice Address': n.practiceAddress,
            Provider: n.provider,
            'Provider NPI': n.providerNPI,
            'Primary Insurance': n.primaryInsurance,
            'Secondary Insurance': n.secondaryInsurance,
            'Last Payment Date': n.lastPaymentDate,
            'Last Payment Amount': n.lastPaymentAmount
              ? currencyFormatter.format(n.lastPaymentAmount).toString()
              : '',
            'Patient Balance': n.patientBalance
              ? currencyFormatter.format(n.patientBalance).toString()
              : '',
            'Last Statement Date': n.lastStatementDate,
            'Last Statement Amount': n.lastStatementAmount
              ? currencyFormatter.format(n.lastStatementAmount).toString()
              : '',
            'Statement Type': n.statementType,
            'Days Since Last Statement': n.statementDays
              ? n.statementDays.toString()
              : '',
          };
        });
        if (exportDataArray.length !== 0) {
          const headerArray = Object.keys(exportDataArray[0] || {});
          let criteriaObj: { [key: string]: string } = {
            ...exportDataArray[0],
          };

          const criteriaArray = [];

          // Clear out the initial criteria object values
          criteriaObj = Object.fromEntries(headerArray.map((key) => [key, '']));
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));

          // Replace the initial criteria headers
          criteriaObj = {
            ...criteriaObj,
            'Patient ID': 'Criteria',
            'Last Name': 'Value',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          if (searchCriteria?.patientFirstName) {
            criteriaObj = {
              ...criteriaObj,
              'Patient ID': 'Patient First Name',
              'Last Name': searchCriteria?.patientFirstName?.toString() || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.patientLastName) {
            criteriaObj = {
              ...criteriaObj,
              'Patient ID': 'Patient Last Name',
              'Last Name': searchCriteria?.patientLastName?.toString() || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria.patientDOB) {
            criteriaObj = {
              ...criteriaObj,
              'Patient ID': 'Date of Birth',
              'Last Name': DateToStringPipe(searchCriteria.patientDOB, 2),
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.patientID) {
            criteriaObj = {
              ...criteriaObj,
              'Patient ID': 'Patient ID',
              'Last Name': searchCriteria?.patientID?.toString() || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria?.showRecent) {
            criteriaObj = {
              ...criteriaObj,
              'Patient ID': 'Show Recent Statements',
              'Last Name': searchCriteria?.showRecent === 'true' ? 'Yes' : 'No',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria.groupID && groupData) {
            criteriaObj = {
              ...criteriaObj,
              'Patient ID': 'Group',
              'Last Name':
                groupData.filter(
                  (m) => m.id === Number(searchCriteria.groupID)
                )[0]?.value || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }

          if (searchCriteria.practiceID && practiceData) {
            criteriaObj = {
              ...criteriaObj,
              'Patient ID': 'Practice',
              'Last Name':
                practiceData.filter(
                  (m) => m.id === Number(searchCriteria.practiceID)
                )[0]?.value || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }

          if (searchCriteria.facilityID && facilityData) {
            criteriaObj = {
              ...criteriaObj,
              'Patient ID': 'Facility',
              'Last Name':
                facilityData.filter(
                  (m) => m.id === Number(searchCriteria.facilityID)
                )[0]?.value || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }

          if (searchCriteria.insuranceTypeID) {
            criteriaObj = {
              ...criteriaObj,
              'Patient ID': 'Exclude Insurance Type',
              'Last Name':
                patientExludeInsuarnecData?.filter(
                  (m) => m.id === Number(searchCriteria.insuranceTypeID)
                )[0]?.value || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }

          if (searchCriteria.patientBalanceFrom) {
            criteriaObj = {
              ...criteriaObj,
              'Patient ID': 'Balance Amount Greater or Equal to',
              'Last Name': searchCriteria.patientBalanceFrom.toString() || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          if (searchCriteria.patientBalanceTo) {
            criteriaObj = {
              ...criteriaObj,
              'Patient ID': 'Balance Amount Less or Equal to',
              'Last Name': searchCriteria.patientBalanceTo.toString() || '',
            };
            criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          }
          criteriaObj = Object.fromEntries(headerArray.map((key) => [key, '']));
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));

          criteriaObj = {
            ...criteriaObj,
            'Patient ID': 'Versapaper Documents Details',
            'Last Name': '',
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
            ExportDataToCSV(exportArray, 'Versapaper Documents');
            dispatch(
              addToastNotification({
                text: 'Export Successful',
                toastType: ToastType.SUCCESS,
                id: '',
              })
            );
          } else {
            ExportDataToDrive(exportArray, 'Versapaper Documents', dispatch);
          }
        }
      }
    } else {
      setStatusModalInfo({
        ...statusModalInfo,
        show: true,
        heading: 'Error',
        type: StatusModalType.ERROR,
        text: 'A system error prevented the report to be exported. \nPlease try again.',
      });
    }
  };
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
  return (
    <AppLayout title="Nucleus - Versapaper Documents">
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
                          Versapaper Documents
                        </p>
                        <div>
                          <Button
                            cls={'h-[38px] truncate '}
                            buttonType={ButtonType.primary}
                            onClick={() => {
                              // setRoutePath('/app/register-patient');
                              // setPatientDetailsModal({
                              //   open: true,
                              //   id: null,
                              // });
                              setAddNewDocument(true);
                            }}
                          >
                            Add New Document
                          </Button>
                        </div>
                      </div>
                      <div className="flex h-[38px]  items-center px-6">
                        <ButtonSelectDropdownForExport
                          data={exportDropdownData}
                          onChange={onSelectExportOption}
                          isSingleSelect={true}
                          cls={'inline-flex'}
                          disabled={false}
                          buttonContent={
                            <button
                              id={''}
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
                  <div className="pt-[20px]">
                    <div className="w-full">
                      <div className="px-[5px] pb-[5px]">
                        <p className="text-base font-bold leading-normal text-gray-700">
                          Document Details
                        </p>
                      </div>
                      <div className="flex w-full flex-wrap">
                        <div className={`w-[240px] px-[5px]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Document Name
                            </div>
                            <div className="w-full">
                              <InputField
                                placeholder="Document Name"
                                value={searchCriteria?.patientFirstName}
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
                        <div className={`w-[240px] px-[5px]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Template Name
                            </div>
                            <div className="w-full">
                              <InputField
                                placeholder="Template Name"
                                value={searchCriteria?.patientLastName}
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
                        <div className={`w-[240px] px-[5px]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-5 text-gray-700">
                              Template ID
                            </div>
                            <div className="w-full">
                              <InputField
                                placeholder="Template ID"
                                value={''}
                                onChange={() => {}}
                                // type={'number'}
                              />
                            </div>
                          </div>
                        </div>

                        <div className={`ml-[16px] w-[240px] px-[5px]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-6 text-gray-700">
                              Varified Amount
                            </div>
                            <div className="mt-2">
                              <RadioButton
                                data={[
                                  {
                                    value: 'true',
                                    label: 'Yes',
                                  },
                                  { value: 'false', label: 'No' },
                                ]}
                                checkedValue={searchCriteria?.showRecent}
                                disabled={false}
                                onChange={(evt) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    showRecent: evt.target.value,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={'py-[15px] px-[5px]'}>
                      <div className={`h-[1px] w-full bg-gray-200`} />
                    </div>
                    <div className="flex w-full flex-row gap-4">
                      <div className="flex w-[23%] shrink flex-col items-start gap-1 ">
                        <label className="text-sm font-medium leading-5 text-gray-900">
                          Parameter
                        </label>
                        <div className="w-full">
                          <SingleSelectDropDown
                            placeholder="Parameter"
                            showSearchBar={false}
                            disabled={false}
                            data={parameterDropdownList}
                            onSelect={(v) => {
                              setSearchCriteria({
                                ...searchCriteria,
                                parameter: v,
                              });
                            }}
                            selectedValue={searchCriteria.parameter}
                          />
                        </div>
                      </div>
                      <div className=" flex w-[23%] flex-col items-start gap-1 self-stretch">
                        <label className="text-sm font-medium leading-5 text-gray-900">
                          Date Range
                        </label>
                        <div className="w-full">
                          <SingleSelectDropDown
                            placeholder="Date Range"
                            showSearchBar={false}
                            disabled={false}
                            data={dateRangeDropdownList}
                            selectedValue={searchCriteria.dateRange}
                            onSelect={(v) => {
                              onSelectDateRange(v);
                              // setSearchCriteria({
                              //   ...searchCriteria,
                              //   dateRange: v,
                              // });
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex w-[23%] flex-col items-start gap-1 self-stretch">
                        <label className="text-sm font-medium leading-5 text-gray-900">
                          Start Date
                        </label>
                        <div className="w-full">
                          <AppDatePicker
                            placeholderText="mm/dd/yyyy"
                            cls="mt-1"
                            disabled={!(searchCriteria.dateRange?.id === 1)}
                            onChange={(date) => {
                              setSearchCriteria({
                                ...searchCriteria,
                                startDate: date,
                              });
                            }}
                            selected={searchCriteria.startDate}
                          />
                        </div>
                      </div>
                      <div className="flex w-[23%] flex-col items-start gap-1 self-stretch">
                        <label className="text-sm font-medium leading-5 text-gray-900">
                          End Date
                        </label>
                        <div className="w-full">
                          <AppDatePicker
                            placeholderText="mm/dd/yyyy"
                            cls="mt-1"
                            disabled={!(searchCriteria.dateRange?.id === 1)}
                            onChange={(date) => {
                              setSearchCriteria({
                                ...searchCriteria,
                                endDate: date,
                              });
                            }}
                            selected={searchCriteria.endDate}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex h-20 items-start  gap-4 bg-gray-200 px-7 pt-[25px] pb-[15px]">
                <div className="flex w-full items-center ">
                  <div className="flex w-[50%] items-center ">
                    <Button
                      cls={
                        'h-[38px] inline-flex items-center justify-center w-56 py-2 bg-cyan-500 shadow rounded-md'
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
                <div className="flex w-full gap-4 p-6">
                  {stateCategories.map((d, index) => {
                    return (
                      <div key={index} className="w-[20%]">
                        <StageWidget
                          label={d.value}
                          count={`${d.count}`}
                          color={d.color}
                          onClick={() => {
                            onSelectStateCategories({
                              ...searchCriteria,
                              stateCategoryID: d.id,
                              actionCategoryID: undefined,
                              claimStatusID: undefined,
                              categoryID: undefined,
                            });
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="col-span-2 w-full">
                  {/* <p className="text-xl font-bold leading-7 text-gray-700">Results</p> */}
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
                      columns={columns}
                      checkboxSelection={false}
                      // persistLayoutId={6}
                      rows={searchResult || []}
                      onSelectAllClick={onSelectAll}
                      selectRows={selectRows}
                      onSelectRow={(ids: number[]) => {
                        if (ids.length === totalCount) {
                          onSelectAll();
                        } else if (
                          selectRows.length ===
                          ids.length + (lastSearchCriteria.pageSize || 0)
                        ) {
                          setSelectRows([]);
                        } else if (
                          ids.length === (totalCount || 0) &&
                          selectRows.length === 1
                        ) {
                          setSelectRows([]);
                        } else {
                          setSelectRows(ids);
                        }
                      }}
                      onPageChange={(page: number) => {
                        const obj: GetPatientStatemntCriteria = {
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
                          const obj: GetPatientStatemntCriteria = {
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
                          const obj: GetPatientStatemntCriteria = {
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

      <AddNewVersaPaperDocument
        open={isAddNewDocument}
        onClose={() => {
          setAddNewDocument(false);
        }}
        batchId={undefined}
      />
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
      <UnappliedPatientAmountModal
        open={openUnappliedPaymentsModal}
        onDownload={() => {
          onDownloadPatientStatementFile();
        }}
        patientIDs={selectRows}
        onClose={() => {
          onClickSearch();
          setOpenUnappliedPaymentModal(false);
        }}
      />
    </AppLayout>
  );
};

export default VersaPaperDocument;
