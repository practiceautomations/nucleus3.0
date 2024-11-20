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
  fetchProviderDataRequest,
} from '@/store/shared/actions';
import {
  fetchInsuranceData,
  getInsuranceProfileReportData,
} from '@/store/shared/sagas';
import {
  getAllInsuranceDataSelector,
  getProviderDataSelector,
} from '@/store/shared/selectors';
import type {
  AllInsuranceData,
  GroupData,
  InsuranceProfileReportCriteria,
  InsuranceProfileReportData,
  InsuranceProfileReportDetails,
  InsuranceProfileReportSummary,
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

const InsuranceProfileReport = () => {
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
  const defaultSearchCriteria: InsuranceProfileReportCriteria = {
    groupID: null,
    providerID: null,
    insuranceID: undefined,
    fromDos: null,
    toDos: null,
    getAllData: false,
    getOnlyIDS: false,
    pageNumber: 1,
    pageSize: globalPaginationConfig.activePageSize,
    sortByColumn: '',
    sortOrder: '',
  };
  const [lastSearchCriteria, setLastSearchCriteria] = useState(
    defaultSearchCriteria
  );
  const [isChangedJson, setIsChangedJson] = useState(false);

  const [searchCriteria, setSearchCriteria] = useState(defaultSearchCriteria);
  const setSearchCriteriaFields = (value: InsuranceProfileReportCriteria) => {
    setSearchCriteria(value);
    setIsChangedJson(true);
  };
  const [renderSearchCriteriaView, setRenderSearchCriteriaView] = useState(
    uuidv4()
  );
  const [hideSearchParameters, setHideSearchParameters] =
    useState<boolean>(true);
  const selectedWorkedGroup = useSelector(getselectdWorkGroupsIDsSelector);
  const [groupDropdown, setGroupDropdown] = useState<GroupData[]>([]);
  const [providerDropdown, setProviderDropdown] = useState<ProviderData[]>([]);

  const ProviderData = useSelector(getProviderDataSelector);
  useEffect(() => {
    if (ProviderData) {
      setProviderDropdown(ProviderData);
    }
  }, [ProviderData]);
  const insuranceData = useSelector(getAllInsuranceDataSelector);
  const [insuranceAllData, setInsuanceAllData] = useState<AllInsuranceData[]>(
    []
  );
  const initProfile = () => {
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
    setSearchCriteriaFields({
      ...searchCriteria,
      groupID: selectedWorkedGroup?.groupsData[0]?.id || null,
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

  useEffect(() => {
    if (searchCriteria?.groupID) handleInsuanceAllData(searchCriteria?.groupID);
  }, [searchCriteria?.groupID, insuranceData]);

  const [totalCount, setTotalCount] = useState<number>(0);
  const [statusModalInfo, setStatusModalInfo] = useState({
    show: false,
    heading: '',
    text: '',
    type: StatusModalType.WARNING,
  });
  const [searchResult, setSearchResult] = useState<
    InsuranceProfileReportDetails[]
  >([]);
  const [summaryData, setSummaryData] = useState<
    InsuranceProfileReportSummary[]
  >([]);
  const getSearchData = async (obj: InsuranceProfileReportCriteria) => {
    const res = await getInsuranceProfileReportData(obj);
    if (res) {
      setSearchResult(res.insuranceReportsData);
      setSummaryData(res.summary);
      setTotalCount(res.insuranceReportsData[0]?.total || 0);
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
  const columns: GridColDef[] = [
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
      field: 'group',
      headerName: 'Group',
      flex: 1,
      minWidth: 180,
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
      field: 'insurance',
      headerName: 'Insurance',
      flex: 1,
      minWidth: 180,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-sm font-normal leading-5 text-cyan-500 underline"
            onClick={() => {}}
          >
            {params.value}
          </div>
        );
      },
    },
    {
      field: 'charges',
      headerName: 'Charges',
      ...usdPrice,
      flex: 1,
      minWidth: 120,
      disableReorder: true,
    },
    {
      field: 'payment',
      headerName: 'Payment',
      ...usdPrice,
      flex: 1,
      minWidth: 120,
      disableReorder: true,
    },
    {
      field: 'writeoff',
      headerName: 'Write-Off',
      ...usdPrice,
      flex: 1,
      minWidth: 120,
      disableReorder: true,
    },
  ];
  const [reportCollapseInfo, setReportCollapseInfo] = useState({
    summary: false,
    detail: false,
  });

  const downloadPdf = (pdfExportData: InsuranceProfileReportData) => {
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
    if (searchCriteria.providerID) {
      const Provider = providerDropdown.filter(
        (m) => m.id === Number(searchCriteria.providerID)
      )[0]?.value;
      criteriaArray.push({ Criteria: 'Provider', Value: Provider || '' });
    }
    if (searchCriteria.insuranceID) {
      const Provider = insuranceAllData.filter(
        (m) => m.id === Number(searchCriteria.insuranceID)
      )[0]?.value;
      criteriaArray.push({ Criteria: 'Insurance', Value: Provider || '' });
    }
    if (searchCriteria.fromDos) {
      criteriaArray.push({
        Criteria: 'From Date',
        Value: searchCriteria.fromDos,
      });
    }
    if (searchCriteria.toDos) {
      criteriaArray.push({ Criteria: 'To Date', Value: searchCriteria.toDos });
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
    const insuranceProfileDetails: PDFRowInput[] =
      pdfExportData.insuranceReportsData.map((m) => {
        return {
          Provider: m.provider,
          'Provider NPI': m.providerNPI,
          Group: m.group,
          'Group EIN': m.groupEIN,
          Insurance: m.insurance,
          Charges: currencyFormatter.format(m.charges),
          Payment: currencyFormatter.format(m.payment),
          'Write-Off': currencyFormatter.format(m.writeoff),
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
    // implement summary
    const summaryExportData: PDFRowInput[] = summaryData.map((n) => {
      return {
        'Total Charges': currencyFormatter.format(n.totalCharges),
        'Total Payment': currencyFormatter.format(n.totalPayment),
        'Total Writeoff': currencyFormatter.format(n.totalWriteoff),
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
    ExportDataToPDF(data, 'Insurance Profile By Provider');
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
    const obj: InsuranceProfileReportCriteria = {
      groupID: searchCriteria.groupID,
      providerID: searchCriteria.providerID,
      insuranceID: searchCriteria.insuranceID,
      fromDos: searchCriteria.fromDos,
      toDos: searchCriteria.toDos,
      sortByColumn: '',
      sortOrder: '',
      pageNumber: undefined,
      pageSize: undefined,
      getAllData: true,
      getOnlyIDS: false,
    };
    const res = await getInsuranceProfileReportData(obj);
    if (res) {
      if (type === 'pdf') {
        downloadPdf(res);
      } else {
        const exportDataArray = res.insuranceReportsData.map((n) => {
          return {
            Provider: n.provider,
            'Provider NPI': n.providerNPI,
            Group: n.group,
            'Group EIN': n.groupEIN,
            Insurance: n.insurance,
            Charges: currencyFormatter.format(n.charges),
            Payment: currencyFormatter.format(n.payment),
            Writeoff: currencyFormatter.format(n.writeoff),
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
            Provider: 'Criteria',
            'Provider NPI': 'Value',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            Provider: 'Provider Name + NPI',
            'Provider NPI': `${
              providerDropdown.filter(
                (m) => m.id === Number(searchCriteria.providerID)
              )[0]?.value || ''
            }${
              providerDropdown.filter(
                (m) => m.id === Number(searchCriteria.providerID)
              )[0]?.providerNPI
                ? ` (NPI: ${
                    providerDropdown.filter(
                      (m) => m.id === Number(searchCriteria.providerID)
                    )[0]?.providerNPI
                  })`
                : ''
            }`,
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            Provider: 'Group',
            'Provider NPI':
              groupDropdown.filter(
                (m) => m.id === Number(searchCriteria.groupID)
              )[0]?.value || '',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            Provider: 'Insurance Name',
            'Provider NPI':
              insuranceAllData.filter(
                (m) => m.id === Number(searchCriteria.insuranceID)
              )[0]?.value || '',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            Provider: 'Date - From',
            'Provider NPI': searchCriteria.fromDos || '',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            Provider: 'Date - To',
            'Provider NPI': searchCriteria.toDos || '',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = Object.fromEntries(headerArray.map((key) => [key, '']));
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            Provider: 'Summary',
            'Provider NPI': '',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = Object.fromEntries(headerArray.map((key) => [key, '']));
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            Provider: 'Type',
            'Provider NPI': 'Amount',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            Provider: 'Total Charges',
            'Provider NPI':
              (res.summary[0] &&
                currencyFormatter.format(res.summary[0].totalCharges)) ||
              '',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            Provider: 'Total Payment',
            'Provider NPI':
              (res.summary[0] &&
                currencyFormatter
                  .format(res.summary[0].totalPayment)
                  .toString()) ||
              '',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            Provider: 'Total Write-Off',
            'Provider NPI':
              (res.summary[0] &&
                currencyFormatter
                  .format(res.summary[0].totalWriteoff)
                  .toString()) ||
              '',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = Object.fromEntries(headerArray.map((key) => [key, '']));
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            Provider: 'Insurance Profile Report Details',
            'Provider NPI': '',
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
            ExportDataToCSV(exportArray, 'InsuranceProfileReport');
            dispatch(
              addToastNotification({
                text: 'Export Successful',
                toastType: ToastType.SUCCESS,
                id: '',
              })
            );
          } else {
            ExportDataToDrive(exportArray, 'InsuranceProfileReport', dispatch);
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
  return (
    <AppLayout title="Nucleus - Insurance Profile Report">
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
                          Insurance Profile Report by Provider
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
                        <div className="flex w-full gap-8">
                          <div className="w-[50%] lg:w-[20%]">
                            <div className="px-[5px] pb-[5px]">
                              <p className="text-base font-bold leading-normal text-gray-700">
                                Provider Details
                              </p>
                            </div>
                            <div className="flex w-full flex-wrap">
                              <div className={`w-[100%] px-[5px]`}>
                                <div
                                  className={`w-full items-start self-stretch`}
                                >
                                  <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                    Provider Name + NPI
                                  </div>
                                  <div className="w-full">
                                    <SingleSelectDropDown
                                      placeholder=""
                                      showSearchBar={true}
                                      disabled={false}
                                      isOptional={true}
                                      onDeselectValue={() => {
                                        setSearchCriteriaFields({
                                          ...searchCriteria,
                                          providerID: null,
                                        });
                                      }}
                                      data={
                                        providerDropdown as SingleSelectDropDownDataType[]
                                      }
                                      selectedValue={
                                        providerDropdown.filter(
                                          (f) =>
                                            f.id ===
                                            Number(searchCriteria?.providerID)
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
                            </div>
                          </div>
                          <div
                            className={
                              'hidden justify-center lg:flex lg:w-[1%]'
                            }
                          >
                            <div className={`w-[1px] h-full bg-gray-200`} />
                          </div>
                          <div className="w-[50%] lg:w-[20%]">
                            <div className="px-[5px] pb-[5px]">
                              <p className="text-base font-bold leading-normal text-gray-700">
                                Location
                              </p>
                            </div>
                            <div className="flex w-full flex-wrap">
                              <div className={`w-[100%] px-[5px]`}>
                                <div
                                  className={`w-full items-start self-stretch`}
                                >
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
                                          (f) =>
                                            f.id === searchCriteria?.groupID
                                        )[0]
                                      }
                                      onSelect={(value) => {
                                        setSearchCriteriaFields({
                                          ...searchCriteria,
                                          groupID: value.id,
                                          insuranceID: undefined,
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
                          <div className="w-[50%] lg:w-[20%]">
                            <div className="px-[5px] pb-[5px]">
                              <p className="text-base font-bold leading-normal text-gray-700">
                                Insurance
                              </p>
                            </div>
                            <div className="flex w-full flex-wrap">
                              <div className={`w-[100%] px-[5px]`}>
                                <div
                                  className={`w-full items-start self-stretch`}
                                >
                                  <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                    Insurance Name
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
                                          (m) =>
                                            m.id === searchCriteria.insuranceID
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
                        <div className="w-full">
                          <div className={'py-[15px] '}>
                            <div className={`h-[1px] w-full bg-gray-200`} />
                          </div>
                          <div className="w-[50%] lg:w-[25%] ">
                            <div className="px-[5px] pb-[5px]">
                              <p className="text-base font-bold leading-normal text-gray-700">
                                Date
                              </p>
                            </div>
                            <div className="flex w-full flex-wrap pl-[5px]">
                              <div className={`w-[50%] pr-[5px]`}>
                                <div
                                  className={`w-full items-start self-stretch`}
                                >
                                  <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                    DoS - From
                                  </div>
                                  <div className="w-full">
                                    <AppDatePicker
                                      cls="!mt-1"
                                      selected={searchCriteria?.fromDos}
                                      onChange={(value) => {
                                        setSearchCriteriaFields({
                                          ...searchCriteria,
                                          fromDos: value
                                            ? DateToStringPipe(value, 1)
                                            : '',
                                        });
                                      }}
                                      // isOptional={true}
                                      // onDeselectValue={() => {
                                      //   setSearchCriteriaFields({
                                      //     ...searchCriteria,
                                      //     fromDos: null,
                                      //   });
                                      // }}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className={`w-[50%] pl-[5px]`}>
                                <div
                                  className={`w-full items-start self-stretch`}
                                >
                                  <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                    DoS - To
                                  </div>
                                  <div className="w-full">
                                    <AppDatePicker
                                      cls="!mt-1"
                                      selected={searchCriteria?.toDos}
                                      onChange={(value) => {
                                        setSearchCriteriaFields({
                                          ...searchCriteria,
                                          toDos: value
                                            ? DateToStringPipe(value, 1)
                                            : '',
                                        });
                                      }}
                                      // isOptional={true}
                                      // onDeselectValue={() => {
                                      //   setSearchCriteriaFields({
                                      //     ...searchCriteria,
                                      //     toDos: null,
                                      //   });
                                      // }}
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
                            <AppTableRow>
                              <AppTableCell>Total Charges</AppTableCell>
                              <AppTableCell>
                                {summaryData[0]?.totalCharges &&
                                  currencyFormatter.format(
                                    summaryData[0]?.totalCharges
                                  )}
                              </AppTableCell>
                            </AppTableRow>
                            <AppTableRow>
                              <AppTableCell>Total Payment</AppTableCell>
                              <AppTableCell>
                                {summaryData[0]?.totalPayment &&
                                  currencyFormatter.format(
                                    summaryData[0]?.totalPayment
                                  )}
                              </AppTableCell>
                            </AppTableRow>
                            <AppTableRow>
                              <AppTableCell>Total Write-Off</AppTableCell>
                              <AppTableCell>
                                {summaryData[0]?.totalWriteoff &&
                                  currencyFormatter.format(
                                    summaryData[0]?.totalWriteoff
                                  )}
                              </AppTableCell>
                            </AppTableRow>
                          </>
                        }
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
                      totalCount={totalCount}
                      rows={searchResult}
                      persistLayoutId={23}
                      showTableHeading={false}
                      columns={columns}
                      checkboxSelection={false}
                      onPageChange={(page: number) => {
                        const obj: InsuranceProfileReportCriteria = {
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
                          const obj: InsuranceProfileReportCriteria = {
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
                          const obj: InsuranceProfileReportCriteria = {
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
export default InsuranceProfileReport;
