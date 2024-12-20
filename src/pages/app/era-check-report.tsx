import type { GridColDef } from '@mui/x-data-grid-pro';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Icon from '@/components/Icon';
import PageHeader from '@/components/PageHeader';
import SavedSearchCriteria from '@/components/PatientSearch/SavedSearchCriteria';
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
  getLookupDropdownsRequest,
} from '@/store/shared/actions';
import {
  fetchERACheckReportSearchData,
  fetchInsuranceData,
} from '@/store/shared/sagas';
import {
  type AllInsuranceData,
  type ERACheckReportAPIResult,
  type ERACheckReportCriteria,
  type GroupData,
  ToastType,
} from '@/store/shared/types';
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
  usdPrice,
} from '@/utils';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';
import { DateToStringPipe } from '@/utils/dateConversionPipes';

import AppDatePicker from '../../components/UI/AppDatePicker';
import SectionHeading from '../../components/UI/SectionHeading';
import AppTable, { AppTableCell, AppTableRow } from '../../components/UI/Table';
import { getAllInsuranceDataSelector } from '../../store/shared/selectors';

const ERACheckReport = () => {
  const dispatch = useDispatch();

  const [hideSearchParameters, setHideSearchParameters] =
    useState<boolean>(true);

  const selectedWorkedGroup = useSelector(getselectdWorkGroupsIDsSelector);
  const [groupDropdown, setGroupDropdown] = useState<GroupData[]>([]);

  const [isChangedJson, setIsChangedJson] = useState(false);
  const [refreshDetailView, setRefreshDetailView] = useState<string>();

  const insuranceData = useSelector(getAllInsuranceDataSelector);
  const [insuranceAllData, setInsuanceAllData] = useState<AllInsuranceData[]>(
    []
  );
  useEffect(() => {
    if (refreshDetailView === 'refresh') {
      setRefreshDetailView(undefined);
    }
  }, [refreshDetailView]);
  const [statusModalInfo, setStatusModalInfo] = useState({
    show: false,
    heading: '',
    text: '',
    type: StatusModalType.WARNING,
  });
  const defaultSearchCriteria: ERACheckReportCriteria = {
    pageNumber: 1,
    pageSize: globalPaginationConfig.activePageSize,
    sortByColumn: '',
    sortOrder: '',
    getAllData: false,
    getOnlyIDS: false,
  };
  const [lastSearchCriteria, setLastSearchCriteria] = useState(
    defaultSearchCriteria
  );
  const [searchCriteria, setSearchCriteria] = useState(defaultSearchCriteria);
  const [searchResult, setSearchResult] = useState<ERACheckReportAPIResult[]>(
    []
  );
  const [totalCount, setTotalCount] = useState<number>(0);

  const setSearchCriteriaFields = (value: ERACheckReportCriteria) => {
    setSearchCriteria(value);
    setIsChangedJson(true);
  };

  const getSearchData = async (obj: ERACheckReportCriteria) => {
    const res = await fetchERACheckReportSearchData(obj);
    if (res) {
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
  };
  useEffect(() => {
    initProfile();
  }, []);

  const handleInsuanceAllData = (groupID: number) => {
    setInsuanceAllData([...insuranceData.filter((m) => m.groupID === groupID)]);
  };

  useEffect(() => {
    setGroupDropdown(selectedWorkedGroup?.groupsData || []);
    if (selectedWorkedGroup?.groupsData[0]?.id)
      setSearchCriteriaFields({
        ...searchCriteria,
        groupID: selectedWorkedGroup?.groupsData[0]?.id,
      });
  }, [selectedWorkedGroup]);

  useEffect(() => {
    if (searchCriteria?.groupID) handleInsuanceAllData(searchCriteria?.groupID);
  }, [searchCriteria?.groupID, insuranceData]);

  const [summeryHeading, setSummeryHeading] = useState<string[]>([]);
  const [summeryValue, setSummeryValue] = useState<number[]>([]);

  useEffect(() => {
    if (searchResult && searchResult.length > 0) {
      setSummeryHeading([
        'Total Check Amount',
        'Total CPL Count',
        'Total Service Line Count',
      ]);
      setSummeryValue([
        searchResult[0]?.totalPayment || 0,
        searchResult[0]?.totalCPLCount || 0,
        searchResult[0]?.totalServiceLineCount || 0,
      ]);
    } else {
      setSummeryHeading([]);
      setSummeryValue([]);
    }
  }, [searchResult]);

  const [reportCollapseInfo, setReportCollapseInfo] = useState({
    summary: false,
    detail: false,
  });

  const downloadPdf = (pdfExportData: ERACheckReportAPIResult[]) => {
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
    const criteriaArray: PDFRowInput[] = [];

    if (searchCriteria.eraCheckID) {
      criteriaArray.push({
        Criteria: 'ERA Check ID',
        Value: searchCriteria.eraCheckID || '',
      });
    }

    if (searchCriteria.insuranceID && searchCriteria.insurance) {
      criteriaArray.push({
        Criteria: 'Insurance',
        Value: searchCriteria.insurance || '',
      });
    }

    if (searchCriteria.fromCheckDate) {
      const fromDate = new Date(searchCriteria.fromCheckDate);
      criteriaArray.push({
        Criteria: 'From Check Date',
        Value: DateToStringPipe(fromDate, 1),
      });
    }

    if (searchCriteria.toCheckDate) {
      const toDate = new Date(searchCriteria.toCheckDate);
      criteriaArray.push({
        Criteria: 'To Check Date',
        Value: DateToStringPipe(toDate, 1),
      });
    }

    if (searchCriteria.fromCreatedDate) {
      const fromCreatedDate = new Date(searchCriteria.fromCreatedDate);
      criteriaArray.push({
        Criteria: 'From Created Date',
        Value: DateToStringPipe(fromCreatedDate, 1),
      });
    }

    if (searchCriteria.toCreatedDate) {
      const toCreatedDate = new Date(searchCriteria.toCreatedDate);
      criteriaArray.push({
        Criteria: 'To Created Date',
        Value: DateToStringPipe(toCreatedDate, 1),
      });
    }

    if (searchCriteria.checkNumber) {
      criteriaArray.push({
        Criteria: 'Check Number',
        Value: searchCriteria.checkNumber || '',
      });
    }

    const criteriaColumns: PDFColumnInput[] = [];
    const keyNames1 =
      criteriaArray.length > 0
        ? Object.keys(criteriaArray[0] ? criteriaArray[0] : 0)
        : [];
    if (keyNames1.length > 0) {
      for (let i = 0; i < keyNames1.length; i += 1) {
        criteriaColumns.push({ title: keyNames1[i], dataKey: keyNames1[i] });
      }
    }
    data.push({ columns: criteriaColumns, body: criteriaArray });

    const reportDetails: PDFRowInput[] = pdfExportData.map((m) => ({
      'ERA Check ID': m.eraCheckID.toString(),
      'File Name': m.fileName || '',
      'CPL Count': m.cplCount.toString(),
      'Service Line Count': m.serviceLineCount.toString(),
      Insurance: m.insurance || '',
      'Check Number': m.checkNumber?.toString() || '',
      'Check Date': m.checkDate
        ? DateToStringPipe(new Date(m.checkDate), 1)
        : '',
      'Check Amount': currencyFormatter.format(m.checkAmount || 0),
      'Payee Name': m.payeeName || '',
      'Payee NPI': m.payeeNpi || '',
      'EDI Log ID': m.ediLogID?.toString() || '',
      Timestamp: m.timeStamp ? DateToStringPipe(new Date(m.timeStamp), 1) : '',
    }));

    const dataColumns: PDFColumnInput[] = [];
    const keyNames =
      reportDetails.length > 0
        ? Object.keys(reportDetails[0] ? reportDetails[0] : 0)
        : [];
    if (keyNames.length > 0) {
      for (let i = 0; i < keyNames.length; i += 1) {
        dataColumns.push({ title: keyNames[i], dataKey: keyNames[i] });
      }
    }
    data.push({ columns: dataColumns, body: reportDetails });

    ExportDataToPDF(data, 'ERA Check Report');
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
    const obj: ERACheckReportCriteria = {
      groupID: searchCriteria.groupID,
      eraCheckID: searchCriteria.eraCheckID,
      fromCheckDate: searchCriteria.fromCheckDate,
      toCheckDate: searchCriteria.toCheckDate,
      fromCreatedDate: searchCriteria.fromCreatedDate,
      toCreatedDate: searchCriteria.toCreatedDate,
      insuranceID: searchCriteria.insuranceID,
      insurance: searchCriteria.insurance,
      checkNumber: searchCriteria.checkNumber,
      pageNumber: searchCriteria.pageNumber,
      pageSize: searchCriteria.pageSize,
      sortByColumn: searchCriteria.sortByColumn,
      sortOrder: searchCriteria.sortOrder,
      getAllData: true,
      getOnlyIDS: searchCriteria.getOnlyIDS,
    };

    const res = await fetchERACheckReportSearchData(obj);
    if (res) {
      if (type === 'pdf') {
        downloadPdf(res);
      } else {
        const exportDataArray = res.map((m) => ({
          'ERA Check ID': m.eraCheckID.toString(),
          'File Name': m.fileName || '',
          'CPL Count': m.cplCount.toString(),
          'Service Line Count': m.serviceLineCount.toString(),
          Insurance: m.insurance || '',
          'Check Number': m.checkNumber?.toString() || '',
          'Check Date': m.checkDate
            ? DateToStringPipe(new Date(m.checkDate), 1)
            : '',
          'Check Amount': currencyFormatter.format(m.checkAmount || 0),
          'Payee Name': m.payeeName || '',
          'Payee NPI': m.payeeNpi || '',
          'EDI Log ID': m.ediLogID?.toString() || '',
          Timestamp: m.timeStamp
            ? DateToStringPipe(new Date(m.timeStamp), 1)
            : '',
        }));

        if (type === 'csv') {
          ExportDataToCSV(exportDataArray, 'ERA Check Report');
        } else {
          ExportDataToDrive(exportDataArray, 'ERA Check Report', dispatch);
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
      ExportData('drive');
    }
  };

  const onSelectExportReportOption = (value: number) => {
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
    if (value === 1) {
      ExportData('pdf');
    }
    if (value === 2) {
      ExportData('csv');
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'eraCheckID',
      headerName: 'Check ID',
      flex: 1,
      minWidth: 100,
      disableReorder: true,
    },
    {
      field: 'insurance',
      headerName: 'Insurance',
      flex: 1,
      minWidth: 170,
      disableReorder: true,
    },
    {
      field: 'checkNumber',
      headerName: 'Check Number',
      flex: 1,
      minWidth: 270,
      disableReorder: true,
    },
    {
      field: 'checkDate',
      headerName: 'Check Date',
      flex: 1,
      minWidth: 170,
      disableReorder: true,
    },
    {
      field: 'checkAmount',
      headerName: 'Check Amount',
      flex: 1,
      ...usdPrice,
      minWidth: 170,
      disableReorder: true,
    },
    {
      field: 'payeeName',
      headerName: 'Payee Name',
      flex: 1,
      minWidth: 170,
      disableReorder: true,
    },
    {
      field: 'cplCount',
      headerName: 'CLP Count',
      flex: 1,
      minWidth: 100,
      disableReorder: true,
    },
    {
      field: 'serviceLineCount',
      headerName: 'Service Line Count',
      flex: 1,
      minWidth: 170,
      disableReorder: true,
    },
    {
      field: 'payeeNpi',
      headerName: 'Payee NPI',
      flex: 1,
      minWidth: 170,
      disableReorder: true,
    },
    {
      field: 'ediLogID',
      headerName: 'EDI Log ID',
      flex: 1,
      minWidth: 170,
      disableReorder: true,
    },

    {
      field: 'timeStamp',
      headerName: 'Time Stamp',
      flex: 1,
      minWidth: 170,
      disableReorder: true,
    },
    {
      field: 'fileName',
      headerName: 'File Name',
      flex: 1,
      minWidth: 670,
      disableReorder: true,
    },
  ];

  return (
    <AppLayout title="Nucleus - ERA Check Report">
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
                          ERA Check Report
                        </p>
                      </div>
                      {/* <ExportReport exportData={searchResult} reportName="Patient Accounting Report" /> */}
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
                      onApply={(selecteratem) => {
                        if (selecteratem) {
                          setSearchCriteriaFields(selecteratem);
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
                          ERA Details
                        </p>
                      </div>
                      <div className="flex w-full flex-wrap">
                        <div className={`lg:w-[24.75%] w-[50%] px-[5px]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              ERA Check ID
                            </div>
                            <div className="w-full">
                              <InputField
                                placeholder="ERA Check ID"
                                value={searchCriteria?.eraCheckID}
                                onChange={(evt) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    eraCheckID: evt.target.value
                                      ? String(evt.target.value)
                                      : undefined,
                                  });
                                }}
                                type={'number'}
                              />
                            </div>
                          </div>
                        </div>

                        <div className={`lg:w-[24.75%] w-[50%] px-[5px]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              EDI Log ID
                            </div>
                            <div className="w-full">
                              <InputField
                                placeholder="EDI Log ID"
                                value={searchCriteria?.ediLogID}
                                onChange={(evt) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    ediLogID: evt.target.value,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className={`lg:w-[24.75%] w-[50%] px-[5px]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Check Number
                            </div>
                            <div className="w-full">
                              <InputField
                                placeholder="Check Number"
                                value={searchCriteria?.checkNumber}
                                onChange={(evt) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    checkNumber: evt.target.value,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex w-full flex-wrap">
                        <div className={`lg:w-[30%] w-[50%] px-[5px] flex`}>
                          <div className={`w-[50%] pr-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Check Date - From
                              </div>
                              <div className="w-full">
                                <AppDatePicker
                                  cls="!mt-1"
                                  selected={searchCriteria?.fromCheckDate}
                                  onChange={(value) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      fromCheckDate: value || undefined,
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className={`w-[50%] pl-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Check Date - To
                              </div>
                              <div className="w-full">
                                <AppDatePicker
                                  cls="!mt-1"
                                  selected={searchCriteria?.toCheckDate}
                                  onChange={(value) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      toCheckDate: value || undefined,
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
                          <div className={`w-[1px] h-full bg-gray-200`} />
                        </div>
                        <div className={`lg:w-[30%] w-[50%] px-[5px] flex`}>
                          <div className={`w-[50%] pr-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Created - From
                              </div>
                              <div className="w-full">
                                <AppDatePicker
                                  cls="!mt-1"
                                  selected={searchCriteria?.fromCreatedDate}
                                  onChange={(value) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      fromCreatedDate: value || undefined,
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className={`w-[50%] pl-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Created - To
                              </div>
                              <div className="w-full">
                                <AppDatePicker
                                  cls="!mt-1"
                                  selected={searchCriteria?.toCreatedDate}
                                  onChange={(value) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      toCreatedDate: value || undefined,
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
                          <div className={`w-[1px] h-full bg-gray-200`} />
                        </div>
                      </div>
                    </div>
                    <div className={'py-[15px] px-[5px]'}>
                      <div className={`h-[1px] w-full bg-gray-200`} />
                    </div>
                    <div className="flex">
                      <div className="w-[50%] lg:w-[25%]">
                        <div className="px-[5px] pb-[5px]">
                          <p className="text-base font-bold leading-normal text-gray-700">
                            Location
                          </p>
                        </div>
                        <div className="flex w-full flex-wrap">
                          <div className={`w-[100%] px-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Group
                              </div>
                              <div className="w-full">
                                <SingleSelectDropDown
                                  placeholder="Search group"
                                  showSearchBar={true}
                                  disabled={false}
                                  data={
                                    groupDropdown as SingleSelectDropDownDataType[]
                                  }
                                  selectedValue={
                                    groupDropdown.filter(
                                      (f) => f.id === searchCriteria?.groupID
                                    )[0]
                                  }
                                  onSelect={(value) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      groupID: value.id,
                                      insuranceID: undefined,
                                      insurance: undefined,
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={'px-[15px]'}>
                        <div className={`w-[1px] h-full bg-gray-200`} />
                      </div>
                      <div className="w-[50%] lg:w-[25%]">
                        <div className="px-[5px] pb-[5px]">
                          <p className="text-base font-bold leading-normal text-gray-700">
                            Others
                          </p>
                        </div>
                        <div className="flex w-full flex-wrap">
                          <div className={`w-[100%] px-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Insurance
                              </div>
                              <div className="w-full">
                                <SingleSelectDropDown
                                  placeholder="-"
                                  showSearchBar={true}
                                  disabled={false}
                                  data={
                                    insuranceAllData
                                      ? (insuranceAllData as SingleSelectDropDownDataType[])
                                      : []
                                  }
                                  selectedValue={
                                    insuranceAllData.filter(
                                      (m) => m.id === searchCriteria.insuranceID
                                    )[0]
                                  }
                                  onSelect={(value) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      insuranceID: value.id,
                                      insurance: value.value,
                                    });
                                  }}
                                  isOptional={true}
                                  onDeselectValue={() => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
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
                    <div className={'px-[15px]'}>
                      <div className={`w-[1px] h-[35px] bg-gray-300`} />
                    </div>
                    <div className="">
                      <ButtonDropdown
                        disabled={!searchResult.length}
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
                    setReportCollapseInfo((prev) => ({
                      ...prev,
                      summary: !prev.summary,
                    }));
                  }}
                  isCollapsed={reportCollapseInfo.summary}
                />
                <div className="mb-[20px] mt-[40px] w-full">
                  <div
                    hidden={reportCollapseInfo.summary}
                    className="w-full drop-shadow-lg"
                  >
                    <AppTable
                      cls="max-h-[400px] !w-[700px]"
                      renderHead={
                        <AppTableRow>
                          <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                            Label
                          </AppTableCell>
                          <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                            Value
                          </AppTableCell>
                        </AppTableRow>
                      }
                      renderBody={
                        <>
                          {summeryHeading.map((heading, index) => (
                            <AppTableRow key={heading}>
                              <AppTableCell>{heading}</AppTableCell>
                              <AppTableCell>
                                {index === 0
                                  ? currencyFormatter.format(
                                      summeryValue[index] || 0
                                    )
                                  : summeryValue[index] || 0}
                              </AppTableCell>
                            </AppTableRow>
                          ))}
                          {!summeryValue.length && (
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
              </div>

              <div className="w-full gap-4 bg-white px-7 pt-[25px] pb-[15px]">
                <div className="flex w-full flex-col">
                  <div className="h-full">
                    <SearchDetailGrid
                      pageNumber={lastSearchCriteria.pageNumber}
                      pageSize={lastSearchCriteria.pageSize}
                      totalCount={totalCount}
                      persistLayoutId={42}
                      rows={
                        searchResult.map((row) => {
                          return { ...row, id: row.eraCheckID };
                        }) || []
                      }
                      columns={columns}
                      checkboxSelection={false}
                      onPageChange={(page: number) => {
                        const obj: ERACheckReportCriteria = {
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
                          const obj: ERACheckReportCriteria = {
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
                          const obj: ERACheckReportCriteria = {
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

export default ERACheckReport;
