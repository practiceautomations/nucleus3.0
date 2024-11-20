import {
  type GridColDef,
  GRID_CHECKBOX_SELECTION_COL_DEF,
} from '@mui/x-data-grid-pro';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { baseUrl } from '@/api/http-client';
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
import RadioButton from '@/components/UI/RadioButton';
import SearchDetailGrid, {
  globalPaginationConfig,
} from '@/components/UI/SearchDetailGrid';
import type { SingleSelectDropDownDataType } from '@/components/UI/SingleSelectDropDown';
import SingleSelectDropDown from '@/components/UI/SingleSelectDropDown';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import UnappliedPatientAmountModal from '@/components/UnappliedPatientAmountModal';
import AppLayout from '@/layouts/AppLayout';
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
  getPrintPatientStatementData,
  onPatientStatementsFileDownload,
} from '@/store/shared/sagas';
import {
  getFacilityDataSelector,
  getPracticeDataSelector,
} from '@/store/shared/selectors';
import type {
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
import {
  DateToStringPipe,
  StringToDatePipe,
} from '@/utils/dateConversionPipes';

const PatientStatement = () => {
  const [selectRows, setSelectRows] = useState<number[]>([]);
  const dispatch = useDispatch();
  const [groupData, setGroupData] = useState<SingleSelectDropDownDataType[]>();
  const [practiceData, setPracticeData] =
    useState<SingleSelectDropDownDataType[]>();
  const practicesAPIData = useSelector(getPracticeDataSelector);
  const facilityAPIData = useSelector(getFacilityDataSelector);
  const [statementData, setStatementData] = useState<PatientStatementType[]>(
    []
  );
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
  const defaultSearchCriteria: GetPatientStatemntCriteria = {
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
    // getAllData: false,
  };
  const [ModalState, setModalState] = useState<{
    open: boolean;
    heading: string;
    description: string;
    okButtonText: string;
    closeButtonText: string;
    statusModalType: StatusModalType;
    showCloseButton: boolean;
    closeOnClickOutside: boolean;
    confirmButtonType: string;
    cancelButtonType: string;
  }>({
    open: false,
    heading: '',
    description: '',
    okButtonText: 'OK',
    closeButtonText: '',
    statusModalType: StatusModalType.WARNING,
    showCloseButton: true,
    closeOnClickOutside: true,
    confirmButtonType: '',
    cancelButtonType: '',
  });
  const [lastSearchCriteria, setLastSearchCriteria] = useState(
    defaultSearchCriteria
  );
  const [searchCriteria, setSearchCriteria] = useState(defaultSearchCriteria);
  const [searchResult, setSearchResult] = useState<PatientStatementType[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const setSearchCriteriaFields = (value: GetPatientStatemntCriteria) => {
    setSearchCriteria(value);
    setIsChangedJson(true);
  };

  const getSearchData = async (obj: GetPatientStatemntCriteria) => {
    const res = await getPatientStatementData(obj);
    if (res) {
      setStatementData(res);
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

  // Search bar
  const onClickSearch = async () => {
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
    if (statementData.length === 0) {
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
      ...GRID_CHECKBOX_SELECTION_COL_DEF,
      flex: 1,
      minWidth: 80,
    },
    {
      field: 'patientID',
      headerName: 'Patient ID',
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
      field: 'lastName',
      headerName: 'Last Name',
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
      field: 'firstName',
      headerName: 'First Name',
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
      field: 'group',
      headerName: 'Group',
      flex: 1,
      minWidth: 155,
      disableReorder: true,
      renderCell: (params) => {
        const formattedValue = params.row.groupEIN
          ? `EIN: ${params.row.groupEIN}`
          : 'EIN: -';
        return (
          <div className="flex flex-col">
            <div className="text-cyan-500 underline">{params.value}</div>
            <div>{formattedValue}</div>
          </div>
        );
      },
    },
    {
      field: 'practice',
      headerName: 'Practice',
      flex: 1,
      minWidth: 276,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="text-cyan-500 underline">{params.value}</div>
            <div>{params.row.practiceAddress}</div>
          </div>
        );
      },
    },
    {
      field: 'provider',
      headerName: 'Provider',
      flex: 1,
      minWidth: 225,
      disableReorder: true,
      renderCell: (params) => {
        const formattedValue = params.row.providerNPI
          ? `NPI: ${params.row.providerNPI}`
          : 'NPI: -';
        return (
          <div className="flex flex-col">
            <div className="text-cyan-500 underline">{params.value}</div>
            <div>{formattedValue}</div>
          </div>
        );
      },
    },
    {
      field: 'primaryInsurance',
      headerName: 'Primary Insurance',
      flex: 1,
      minWidth: 186,
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
      field: 'secondaryInsurance',
      headerName: 'Secondary Insurance',
      flex: 1,
      minWidth: 203,
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
      field: 'lastPaymentDate',
      headerName: 'Last Payment Date',
      flex: 1,
      minWidth: 192,
      disableReorder: true,
      renderCell: (params) => {
        const date = new Date(params.value);
        return <div>{DateToStringPipe(date, 2)}</div>;
      },
    },
    {
      field: 'lastPaymentAmount',
      headerName: 'Last Payment Amount',
      flex: 1,
      minWidth: 213,
      disableReorder: true,
      renderCell: (params) => {
        const formattedValue = params.value
          ? currencyFormatter.format(params.value)
          : '-';
        return <div>{formattedValue}</div>;
      },
    },
    {
      field: 'patientBalance',
      headerName: 'Patient Balance',
      flex: 1,
      minWidth: 171,
      disableReorder: true,
      renderCell: (params) => {
        const formattedValue = params.value
          ? currencyFormatter.format(params.value)
          : '-';
        return <div>{formattedValue}</div>;
      },
    },
    {
      field: 'lastStatementDate',
      headerName: 'Last Statement Date',
      flex: 1,
      minWidth: 203,
      disableReorder: true,
      renderCell: (params) => {
        const date = new Date(params.value);
        return <div>{DateToStringPipe(date, 2)}</div>;
      },
    },
    {
      field: 'lastStatementAmount',
      headerName: 'Last Statement Amount',
      flex: 1,
      minWidth: 224,
      disableReorder: true,
      renderCell: (params) => {
        const formattedValue = params.value
          ? currencyFormatter.format(params.value)
          : '-';
        return <div>{formattedValue}</div>;
      },
    },
    {
      field: 'statementType',
      headerName: 'Statement Type',
      flex: 1,
      minWidth: 174,
      disableReorder: true,
      renderCell: (params) => {
        return <div>{params.value ? params.value : '-'}</div>;
      },
    },
    {
      field: 'statementDays',
      headerName: 'Days Since Last Statement',
      flex: 1,
      minWidth: 223,
      disableReorder: true,
    },
  ];
  useEffect(() => {
    if (selectedWorkedGroup && selectedWorkedGroup.groupsData) {
      setGroupData(selectedWorkedGroup.groupsData);
      setSearchCriteria({
        ...searchCriteria,
        groupID: selectedWorkedGroup?.groupsData[0]?.id || 0,
      });
      setSelectRows([]);
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

  async function handleExportClick() {
    // Make the API call to download the statement file
    if (searchCriteria.practiceID === undefined) {
      setModalState({
        ...ModalState,
        open: true,
        heading: 'Error',
        showCloseButton: false,
        statusModalType: StatusModalType.ERROR,
        description: 'Practice not selected',
      });
    } else {
      setOpenUnappliedPaymentModal(true);
    }
  }

  async function handleSftpClick() {
    const data: StatemntExportType = {
      patientIDs: selectRows.toString(),
      isProceeding: 'sftp',
      practiceID: searchCriteria.practiceID,
    };
    // Make the API call to download the statement file
    if (searchCriteria.practiceID === undefined) {
      setModalState({
        ...ModalState,
        open: true,
        heading: 'Error',
        showCloseButton: false,
        statusModalType: StatusModalType.ERROR,
        description: 'Practice not selected',
      });
    } else {
      const res = await onPatientStatementsFileDownload(data);
      if (!res) {
        setModalState({
          ...ModalState,
          open: true,
          heading: 'Error',
          showCloseButton: false,
          statusModalType: StatusModalType.ERROR,
          description: 'Something Went Wrong',
        });
      }
      if (res?.response === 'There are no credentials for that client') {
        setModalState({
          ...ModalState,
          open: true,
          heading: 'Error',
          showCloseButton: false,
          statusModalType: StatusModalType.ERROR,
          description: 'There are no credentials for that group.',
        });
      } else if (res?.response === 'Error uploading file') {
        setModalState({
          ...ModalState,
          open: true,
          heading: 'Error',
          showCloseButton: false,
          statusModalType: StatusModalType.ERROR,
          description: 'Error uploading sftp file.',
        });
      }
      if (res?.response === 'Done') {
        dispatch(
          addToastNotification({
            text: 'Sftp file uploaded successfully',
            toastType: ToastType.SUCCESS,
            id: '',
          })
        );
        onClickSearch();
      }
    }
  }
  function exportToPdf(data: any, type: string) {
    const selectedPatientStatementLog = data.data;
    // eslint-disable-next-line new-cap
    const doc = new jsPDF('p', 'in', 'letter', true);

    const jsxContent = (
      <div>
        {selectedPatientStatementLog && selectedPatientStatementLog[0] && (
          <div className=" w-full p-[44px]">
            <div className="flex w-full flex-col justify-between">
              <div className="flex w-full flex-col">
                <div className="flex w-full justify-between pt-[54px]">
                  <div className="flex w-[20%] flex-col">
                    <div className=" text-2xl font-bold text-cyan-700">
                      {type === 'practice'
                        ? selectedPatientStatementLog[0].RemitAddressName
                        : 'PA Address'}
                    </div>
                    <div className="text-xl font-bold leading-normal text-gray-700">
                      {`${selectedPatientStatementLog[0].RemitAddressLine1},`}
                      <br />
                      {`${selectedPatientStatementLog[0].RemitAddressCity}, ${selectedPatientStatementLog[0].RemitAddressState}, ${selectedPatientStatementLog[0].RemitAddressZip}`}
                    </div>
                  </div>
                  <div className="h-full w-[50%] rounded-sm border border-gray-300">
                    <div className="flex w-full flex-col">
                      <div className="flex h-full w-full items-stretch rounded-t-sm bg-cyan-500">
                        <div className=" w-[25%] border-r border-gray-300 ">
                          <p className=" bg-cyan-500 p-3 text-xl font-normal leading-5 text-white">
                            Account No.
                          </p>
                        </div>
                        <div className=" w-[33%] border-r border-gray-300">
                          <p className=" bg-cyan-500 p-3 text-xl font-normal leading-5 text-white">
                            Statement Date
                          </p>
                        </div>
                        <div className=" w-[42%]">
                          <p className=" bg-cyan-500 p-3 text-xl font-normal leading-5 text-white">
                            Account Balance
                          </p>
                        </div>
                      </div>
                      <div className="flex h-full w-full items-stretch">
                        <div className="w-[25%] border-r border-gray-300">
                          <p className="p-3 text-xl font-normal leading-5 text-gray-900">
                            {selectedPatientStatementLog[0].AccountNumber}
                          </p>
                        </div>
                        <div className="w-[33%] border-r border-gray-300">
                          <p className=" p-3 text-xl font-normal leading-5 text-gray-900">
                            {selectedPatientStatementLog[0].StatementDate}
                          </p>
                        </div>
                        <div className="w-[42%]">
                          <p className=" p-3 text-right text-xl font-bold leading-5 text-gray-900">
                            {currencyFormatter.format(
                              selectedPatientStatementLog[0].AmountDue
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="py-[42px]">
                  <div className="text-xl font-bold text-gray-900">
                    {'For Billing Inquiries Call:'}
                  </div>
                  <div className="text-xl font-normal text-gray-900">
                    {'(123)123-456'}
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="w-[20%] ">
                    <div className="text-xl font-bold text-gray-900">
                      {selectedPatientStatementLog[0].PatientName
                        ? selectedPatientStatementLog[0].PatientName
                        : selectedPatientStatementLog[0].GuarantorAddressName}
                    </div>
                    <div className="text-xl font-normal text-gray-900">
                      {selectedPatientStatementLog[0].PatientName ? (
                        <>
                          {`${selectedPatientStatementLog[0].PatientAddressLine1},`}
                          <br />
                          {`${selectedPatientStatementLog[0].PatientAddressCity}, ${selectedPatientStatementLog[0].PatientAddressState}, ${selectedPatientStatementLog[0].PatientAddressZip}`}
                        </>
                      ) : (
                        <>
                          {`${selectedPatientStatementLog[0].GuarantorAddressLine1},`}
                          <br />
                          {`${selectedPatientStatementLog[0].GuarantorAddressCity}, ${selectedPatientStatementLog[0].GuarantorAddressState}, ${selectedPatientStatementLog[0].GuarantorAddressZip}`}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-5 ">
                    <div className="flex">
                      <div className="text-xl font-bold leading-5 text-gray-900">
                        {'Last Patient Payment Date: '}
                      </div>
                      <div className="text-xl font-normal leading-5 text-gray-900">
                        {selectedPatientStatementLog[0].DueDate}
                      </div>
                    </div>
                    <div className="flex">
                      <div className="text-xl font-bold leading-5 text-gray-900">
                        {'Last Patient Payment Amount: '}
                      </div>
                      <div className="text-xl font-normal leading-5 text-gray-900">
                        {currencyFormatter.format(
                          selectedPatientStatementLog[0].AmountDue
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-[42px]">
                  <div className="flex flex-col ">
                    <div className="w-full rounded-sm border border-gray-300  bg-cyan-500  text-white">
                      <div className="p-2 text-xl font-bold leading-normal ">
                        Messages
                      </div>
                    </div>
                    <div className="p-2 text-xl font-bold text-gray-900">
                      {selectedPatientStatementLog[0].statementmessage}
                    </div>
                  </div>
                </div>
                <div className="w-full rounded-sm border border-gray-300  bg-cyan-500  text-white">
                  <div className="flex justify-between p-2 text-xl font-bold leading-normal">
                    <div>Service Detail </div>
                    <div className="flex gap-2">
                      <div>
                        {' '}
                        Statement Date:{' '}
                        {selectedPatientStatementLog[0].statementmessage}
                      </div>
                      <div>
                        Account No.:{' '}
                        {selectedPatientStatementLog[0].AccountNumber}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="rounded-sm border-x-[1px] border-t-0 border-gray-300">
                  <div className="flex w-full flex-col">
                    <div className="flex h-full w-full items-stretch rounded-t-sm ">
                      <div className=" w-[15%] border-r-[1px] border-b-[1px] border-gray-300 ">
                        <p className=" p-2 text-xl font-bold leading-normal text-gray-700">
                          Date
                        </p>
                      </div>
                      <div className=" w-[15%] border-r-[1px] border-b-[1px] border-gray-300">
                        <p className=" p-2 text-xl font-bold leading-normal text-gray-700">
                          CPT
                        </p>
                      </div>
                      <div className=" w-[50%] border-r-[1px] border-b-[1px] border-gray-300">
                        <p className=" p-2 text-xl font-bold leading-normal text-gray-700">
                          Description
                        </p>
                      </div>
                      <div className=" w-[20%]">
                        <p className=" border-b-[1px] border-gray-300 p-2 text-xl font-bold leading-normal text-gray-700">
                          Amount
                        </p>
                      </div>
                    </div>
                    <div className="flex h-[718px] w-full flex-col border-b border-gray-300">
                      {selectedPatientStatementLog.map((m: any) => (
                        <div
                          key={uuidv4()}
                          className="flex w-full items-stretch"
                        >
                          <div className="w-[15%] border-r border-gray-300">
                            <p className="p-3 text-xl font-normal leading-5 text-gray-900">
                              {m.ServiceDate}
                            </p>
                          </div>
                          <div className="w-[15%] border-r border-gray-300">
                            <p className="p-3 text-xl font-normal leading-5 text-gray-900">
                              {m.CPT}
                            </p>
                          </div>
                          <div className="w-[50%] border-r border-gray-300">
                            <p className="p-3 text-xl font-normal leading-5 text-gray-900">
                              {m.ServiceDescription}
                            </p>
                          </div>
                          <div className="w-[20%] border-r border-gray-300">
                            <p className="p-3 text-right text-xl font-bold leading-5 text-gray-900">
                              {currencyFormatter.format(m.ServiceBalance)}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div className="flex h-full w-full items-stretch">
                        <div className="w-[15%] border-r border-gray-300">
                          <p className="p-3 text-xl font-normal leading-5 text-gray-900"></p>
                        </div>
                        <div className="w-[15%] border-r border-gray-300">
                          <p className="p-3 text-xl font-normal leading-5 text-gray-900"></p>
                        </div>
                        <div className="w-[50%] border-r border-gray-300">
                          <p className="p-3 text-xl font-normal leading-5 text-gray-900"></p>
                        </div>
                        <div className="w-[20%] border-r border-gray-300">
                          <p className="p-3 text-right text-xl font-bold leading-5 text-gray-900"></p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-[70%] pt-[52px]">
                  <div className="h-full w-full rounded-sm border border-gray-300">
                    <div className="flex w-full">
                      <div className="flex w-[10%] border-r border-gray-300 bg-cyan-500 text-white">
                        <div className="self-center px-[30%] ">Aging</div>
                      </div>
                      <div className="flex w-[90%] flex-col">
                        <div className="flex h-full w-full items-stretch rounded-t-sm bg-cyan-500">
                          <div className=" w-[16.6%] border-r border-gray-300 ">
                            <p className=" bg-cyan-500 p-3 text-xl font-normal leading-5 text-white">
                              Current
                            </p>
                          </div>
                          <div className=" w-[16.6%] border-r border-gray-300">
                            <p className=" bg-cyan-500 p-3 text-xl font-normal leading-5 text-white">
                              31-60 Days
                            </p>
                          </div>
                          <div className=" w-[16.6%] border-r border-gray-300">
                            <p className=" bg-cyan-500 p-3 text-xl font-normal leading-5 text-white">
                              61-90 Days
                            </p>
                          </div>
                          <div className=" w-[16.6%] border-r border-gray-300">
                            <p className=" bg-cyan-500 p-3 text-xl font-normal leading-5 text-white">
                              91-120 Days
                            </p>
                          </div>
                          <div className=" w-[16.6%] border-r border-gray-300">
                            <p className=" bg-cyan-500 p-3 text-xl font-normal leading-5 text-white">
                              120+ Days
                            </p>
                          </div>
                          <div className=" w-[16.6%]">
                            <p className=" bg-cyan-500 p-3 text-xl font-normal leading-5 text-white">
                              Balance
                            </p>
                          </div>
                        </div>
                        <div className="flex h-full w-full items-stretch">
                          <div className=" w-[16.6%] border-r border-gray-300">
                            <p className=" p-3 text-xl font-normal leading-5 text-gray-900">
                              {currencyFormatter.format(
                                selectedPatientStatementLog[0]
                                  .AgingBucketsCurrent
                              )}
                            </p>
                          </div>
                          <div className=" w-[16.6%] border-r border-gray-300">
                            <p className=" p-3 text-xl font-normal leading-5 text-gray-900">
                              {currencyFormatter.format(
                                selectedPatientStatementLog[0].AgingBucket30to60
                              )}
                            </p>
                          </div>
                          <div className=" w-[16.6%] border-r border-gray-300">
                            <p className=" p-3 text-xl font-normal leading-5 text-gray-900">
                              {currencyFormatter.format(
                                selectedPatientStatementLog[0].AgingBucket60to90
                              )}
                            </p>
                          </div>
                          <div className=" w-[16.6%] border-r border-gray-300">
                            <p className=" p-3 text-xl font-normal leading-5 text-gray-900">
                              {currencyFormatter.format(
                                selectedPatientStatementLog[0]
                                  .AgingBucket90to120
                              )}
                            </p>
                          </div>
                          <div className=" w-[16.6%] border-r border-gray-300">
                            <p className=" p-3 text-xl font-normal leading-5 text-gray-900">
                              {currencyFormatter.format(
                                selectedPatientStatementLog[0]
                                  .AgingBucket120over
                              )}
                            </p>
                          </div>
                          <div className=" w-[16.6%]">
                            <p className=" p-3 text-xl font-normal leading-5 text-gray-900">
                              {currencyFormatter.format(
                                selectedPatientStatementLog[0].AmountDue
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="justify-end self-center pt-[42px] text-lg font-normal leading-5 text-gray-900">
                {
                  'For questions / queries regarding statement please contact the office at Phone # (972) 200-4664'
                }
              </div>
            </div>
          </div>
        )}
      </div>
    );

    const container = document.createElement('div');
    document.body.appendChild(container);

    // Adjust the DPI value for better resolution
    const imageQuality = 0.1;
    ReactDOM.render(jsxContent, container, async () => {
      const canvas = await html2canvas(container, { useCORS: true });
      const imageData = canvas.toDataURL('image/png', imageQuality);

      const imgWidth = doc.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      doc.addImage(imageData, 'PNG', 0, 0, imgWidth, imgHeight);
      doc.save('PatientStatement.pdf');

      ReactDOM.unmountComponentAtNode(container);
      document.body.removeChild(container);
    });

    return doc.output('blob');
  }
  async function getPatientStatementLogsAndPrint(type: string) {
    if (selectRows.length > 1) {
      setModalState({
        ...ModalState,
        open: true,
        heading: 'Alert',
        showCloseButton: false,
        statusModalType: StatusModalType.WARNING,
        description: 'Please select only one record!',
      });
      return;
    }
    if (selectRows.length && selectRows[0]) {
      const res = await getPrintPatientStatementData(selectRows[0]);
      if (!res) {
        setModalState({
          ...ModalState,
          open: true,
          heading: 'Error',
          showCloseButton: false,
          statusModalType: StatusModalType.ERROR,
          description: 'Error in fetching Statement Logs',
        });
      } else if (res[0]?.jsonResult) {
        exportToPdf(JSON.parse(res[0]?.jsonResult), type);
      }
    }
  }
  const printPatientStatementDropdownData = [
    {
      id: 1,
      title: 'With Practice Address',
      showBottomDivider: false,
    },
    {
      id: 2,
      title: 'With PAPM Address',
      showBottomDivider: false,
    },
  ];

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
    ExportDataToPDF(data, 'Patient Statements');
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
            'Patient ID': 'Patient Statements Details',
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
            ExportDataToCSV(exportArray, 'Patient Statements');
            dispatch(
              addToastNotification({
                text: 'Export Successful',
                toastType: ToastType.SUCCESS,
                id: '',
              })
            );
          } else {
            ExportDataToDrive(exportArray, 'Patient Statements', dispatch);
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
    <AppLayout title="Nucleus - Patient Statements">
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
                          Patient Statements
                        </p>
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
                          Patient Details
                        </p>
                      </div>
                      <div className="flex w-full flex-wrap">
                        <div className={`w-[240px] px-[5px]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Patient First Name
                            </div>
                            <div className="w-full">
                              <InputField
                                placeholder="Patient First Name"
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
                              Patient Last Name
                            </div>
                            <div className="w-full">
                              <InputField
                                placeholder="Patient Last Name"
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
                              Patient Date of birth
                            </div>
                            <div className="w-full">
                              <AppDatePicker
                                onChange={(date) => {
                                  if (date) {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      patientDOB: DateToStringPipe(date, 1),
                                    });
                                  }
                                }}
                                selected={StringToDatePipe(
                                  searchCriteria.patientDOB
                                )}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={`w-[240px] px-[5px]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-4 text-gray-700">
                              Patient ID
                            </div>
                            <div className="w-full">
                              <InputField
                                placeholder="Patient ID"
                                value={searchCriteria?.patientID}
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
                        <div className={`ml-[16px] w-[240px] px-[5px]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-6 text-gray-700">
                              Show Recent Statements
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
                    <div className="w-full">
                      <div className="px-[5px] pb-[5px]">
                        <p className="text-base font-bold leading-normal text-gray-700">
                          Location
                        </p>
                      </div>
                      <div className="flex w-full flex-wrap">
                        <div className={`w-[260px] px-[5px]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Group
                            </div>
                            <div className="w-full">
                              <SingleSelectDropDown
                                data-testid="group"
                                placeholder="Select group"
                                data={
                                  groupData
                                    ? (groupData as SingleSelectDropDownDataType[])
                                    : []
                                }
                                selectedValue={
                                  groupData?.filter(
                                    (f) => f.id === searchCriteria?.groupID
                                  )[0]
                                }
                                onSelect={(evt) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    groupID: evt.id,
                                    practiceID: undefined,
                                    facilityID: undefined,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={`w-[240px] px-[5px]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Practice
                            </div>
                            <div className="w-full">
                              <SingleSelectDropDown
                                placeholder="Select practice"
                                data={
                                  practiceData
                                    ? (practiceData as SingleSelectDropDownDataType[])
                                    : [
                                        {
                                          id: 1,
                                          value: 'No Record Found',
                                          active: false,
                                        },
                                      ]
                                }
                                selectedValue={
                                  practiceData && practiceData.length > 0
                                    ? practiceData.find(
                                        (f) =>
                                          f.id === searchCriteria?.practiceID
                                      )
                                    : undefined
                                }
                                onSelect={(evt) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    practiceID: evt.id,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={`w-[240px] px-[5px]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Facility
                            </div>
                            <div className="w-full">
                              <SingleSelectDropDown
                                placeholder="Select faculity"
                                showSearchBar={false}
                                disabled={false}
                                data={
                                  facilityData && facilityData.length > 0
                                    ? (facilityData as SingleSelectDropDownDataType[])
                                    : [
                                        {
                                          id: 1,
                                          value: 'No Record Found',
                                          active: false,
                                        },
                                      ]
                                }
                                isOptional={true}
                                selectedValue={
                                  facilityData && facilityData.length > 0
                                    ? facilityData.find(
                                        (f) =>
                                          f.id === searchCriteria?.facilityID
                                      )
                                    : undefined
                                }
                                onSelect={(evt) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    facilityID: evt.id,
                                  });
                                }}
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
                      </div>
                    </div>
                    <div className={'py-[15px] px-[5px]'}>
                      <div className={`h-[1px] w-full bg-gray-200`} />
                    </div>
                    <div className="w-full">
                      <div className="px-[5px] pb-[5px]">
                        <p className="text-base font-bold leading-normal text-gray-700">
                          Other
                        </p>
                      </div>
                      <div className="flex w-full flex-wrap">
                        <div className={`w-[240px] px-[5px]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Exclude Insurance Type
                            </div>
                            <div className="w-full">
                              <SingleSelectDropDown
                                placeholder="-"
                                showSearchBar={true}
                                data={
                                  patientExludeInsuarnecData &&
                                  patientExludeInsuarnecData.length > 0
                                    ? (patientExludeInsuarnecData as SingleSelectDropDownDataType[])
                                    : []
                                }
                                isOptional={true}
                                selectedValue={
                                  patientExludeInsuarnecData &&
                                  patientExludeInsuarnecData.length > 0
                                    ? patientExludeInsuarnecData.find(
                                        (f) =>
                                          f.id ===
                                          searchCriteria?.insuranceTypeID
                                      )
                                    : undefined
                                }
                                onSelect={(evt) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    insuranceTypeID: evt.id,
                                  });
                                }}
                                onDeselectValue={() => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    insuranceTypeID: undefined,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={`w-[240px] px-[5px]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Balance Amount Greater or Equal to
                            </div>
                            <div className="w-full">
                              <InputField
                                placeholder="-"
                                value={searchCriteria?.patientBalanceFrom}
                                onChange={(evt) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    patientBalanceFrom: evt.target.value
                                      ? Number(evt.target.value)
                                      : undefined,
                                  });
                                }}
                                type={'number'}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={`w-[240px] px-[5px]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Balance Amount Less or Equal to
                            </div>
                            <div className="w-full">
                              <InputField
                                placeholder="-"
                                value={searchCriteria?.patientBalanceTo}
                                onChange={(evt) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    patientBalanceTo: evt.target.value
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
                  </div>
                )}
              </div>
              <div className="flex h-20 items-start  gap-4 bg-gray-200 px-7 pt-[25px] pb-[15px]">
                <div className="flex w-full items-center ">
                  <div className="flex w-[240px] items-center ">
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
                  <div className="ml-[20px] mb-[30px] w-px">
                    <div
                      className={`relative [rotate:90deg] origin-top-left h-0 bg-gray-500 w-[30px] outline outline-1 outline-[rgba(209,213,219,1)]`}
                    >
                      {' '}
                    </div>
                  </div>
                  <div className="flex w-[224px] items-center justify-between">
                    <ButtonDropdown
                      buttonCls="!h-[38px]"
                      cls={`!w-[224px] h-[38px] inline-flex !justify-center leading-loose ml-[16px] `}
                      disabled={!selectRows.length}
                      popoverCls="!w-[212px]"
                      buttonLabel="Print Patient Statement"
                      dataList={printPatientStatementDropdownData}
                      onSelect={(value) => {
                        if (value === 1) {
                          getPatientStatementLogsAndPrint('practice');
                        } else {
                          getPatientStatementLogsAndPrint('papm');
                        }
                      }}
                    />
                  </div>

                  <div className="ml-[16px] flex w-[224px] items-center justify-between">
                    <ButtonDropdown
                      buttonCls="!h-[38px]"
                      cls={`!w-[224px] h-[38px] inline-flex !justify-center leading-loose`}
                      popoverCls="!w-[224px]"
                      buttonLabel="Issue Patient Statement"
                      disabled={!selectRows.length}
                      dataList={[
                        {
                          id: 1,
                          title: 'Download',
                          showBottomDivider: false,
                        },
                        {
                          id: 2,
                          title: 'Upload to SFTP',
                          showBottomDivider: false,
                        },
                      ]}
                      onSelect={(value) => {
                        if (value === 1) {
                          handleExportClick();
                        }
                        if (value === 2) {
                          handleSftpClick();
                        }
                      }}
                    />
                    <StatusModal
                      open={ModalState.open}
                      heading={ModalState.heading}
                      description={ModalState.description}
                      closeButtonText={ModalState.closeButtonText}
                      statusModalType={ModalState.statusModalType}
                      showCloseButton={ModalState.showCloseButton}
                      okButtonText={ModalState.okButtonText}
                      closeOnClickOutside={false}
                      onChange={() => {
                        setModalState({
                          ...ModalState,
                          open: false,
                        });
                      }}
                      onClose={() => {
                        setModalState({
                          ...ModalState,
                          open: false,
                        });
                      }}
                    />
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
                <div className="flex w-full flex-col">
                  <div className="h-full">
                    <SearchDetailGrid
                      pageNumber={lastSearchCriteria.pageNumber}
                      pageSize={lastSearchCriteria.pageSize}
                      totalCount={totalCount}
                      columns={columns}
                      checkboxSelection={true}
                      persistLayoutId={6}
                      rows={
                        (statementData &&
                          statementData?.map((row) => {
                            return { ...row, id: row.patientID };
                          })) ||
                        []
                      }
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

export default PatientStatement;
