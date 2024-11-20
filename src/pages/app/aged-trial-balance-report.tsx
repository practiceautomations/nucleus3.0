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
import SearchDetailGrid, {
  globalPaginationConfig,
} from '@/components/UI/SearchDetailGrid';
import type { SingleSelectDropDownDataType } from '@/components/UI/SingleSelectDropDown';
import SingleSelectDropDown from '@/components/UI/SingleSelectDropDown';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import AppLayout from '@/layouts/AppLayout';
import { getselectdWorkGroupsIDsSelector } from '@/store/chrome/selectors';
import { addToastNotification, setGlobalModal } from '@/store/shared/actions';
import { getAgedTrialBalanceReportData } from '@/store/shared/sagas';
import type {
  AgedTrialBalanceReportCriteria,
  AgedTrialBalanceReportResult,
  GroupData,
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

const AgedTrialBalanceReport = () => {
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

  const selectedWorkedGroup = useSelector(getselectdWorkGroupsIDsSelector);
  const defaultSearchCriteria: AgedTrialBalanceReportCriteria = {
    groupID: selectedWorkedGroup?.groupsData[0]?.id || null,
    fromPostingDate: '',
    toPostingDate: '',
    getAllData: null,
    getOnlyIDS: null,
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
  const setSearchCriteriaFields = (value: AgedTrialBalanceReportCriteria) => {
    setSearchCriteria(value);
    setIsChangedJson(true);
  };
  const [groupDropdown, setGroupDropdown] = useState<GroupData[]>([]);

  useEffect(() => {
    setGroupDropdown(selectedWorkedGroup?.groupsData || []);
    setSearchCriteriaFields({
      ...searchCriteria,
      groupID: selectedWorkedGroup?.groupsData[0]?.id || null,
    });
  }, [selectedWorkedGroup]);
  const [hideSearchParameters, setHideSearchParameters] =
    useState<boolean>(true);
  // const [groupDropdown, setGroupDropdown] = useState<GroupData[]>([]);

  const [renderSearchCriteriaView, setRenderSearchCriteriaView] = useState(
    uuidv4()
  );

  const [statusModalInfo, setStatusModalInfo] = useState({
    show: false,
    heading: '',
    text: '',
    type: StatusModalType.WARNING,
  });
  const [searchResult, setSearchResult] = useState<
    AgedTrialBalanceReportResult[]
  >([]);
  const getSearchData = async (obj: AgedTrialBalanceReportCriteria) => {
    const res = await getAgedTrialBalanceReportData(obj);
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
  const columns: GridColDef[] = [
    {
      field: 'patientID',
      headerName: 'Patient ID',
      flex: 1,
      minWidth: 120,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-sm font-normal leading-5 text-cyan-500 underline"
              onClick={async () => {
                // window.open(`/app/register-patient/${params.value}`);
                dispatch(
                  setGlobalModal({
                    type: 'Patient Detail',
                    id: params.value,
                    isPopup: true,
                  })
                );
              }}
            >
              #{params.value}
            </div>
          </div>
        );
      },
    },
    {
      field: 'patient',
      headerName: 'Patient Name',
      flex: 1,
      minWidth: 200,
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
      field: 'patientDOB',
      headerName: 'Patient DOB',
      flex: 1,
      minWidth: 140,
      disableReorder: true,
    },
    {
      field: 'claimID',
      headerName: 'Claim ID',
      flex: 1,
      minWidth: 120,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-sm font-normal leading-5 text-cyan-500 underline"
              onClick={async () => {
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
      field: 'dos',
      headerName: 'DOS',
      flex: 1,
      minWidth: 140,
      disableReorder: true,
    },
    {
      field: 'provider',
      headerName: 'Provider',
      flex: 1,
      minWidth: 250,
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
      field: 'posCode',
      headerName: 'POS',
      flex: 1,
      minWidth: 120,
      disableReorder: true,
    },
    {
      field: 'cptCode',
      headerName: 'CPT Code(s)',
      flex: 1,
      minWidth: 120,
      disableReorder: true,
    },
    {
      field: 'diagnosisCodes',
      headerName: 'Dx Code(s)',
      flex: 1,
      minWidth: 180,
      disableReorder: true,
    },
    {
      field: 'claimResponsibility',
      headerName: 'Responsibility',
      flex: 1,
      minWidth: 140,
      disableReorder: true,
    },
    {
      field: 'currentPayer',
      headerName: 'Current Payer',
      flex: 1,
      minWidth: 230,
      disableReorder: true,
    },
    {
      field: 'primaryPayer',
      headerName: 'Primary Payer',
      flex: 1,
      minWidth: 230,
      disableReorder: true,
    },
    {
      field: 'submitDate',
      headerName: 'Submit Date',
      flex: 1,
      minWidth: 140,
      disableReorder: true,
    },
    {
      field: 'agingByDOS',
      headerName: 'Aging by DOS',
      flex: 1,
      minWidth: 140,
      disableReorder: true,
    },
    {
      field: 'claimStatus',
      headerName: 'Claim Status',
      flex: 1,
      minWidth: 230,
      disableReorder: true,
    },
    {
      field: 'chargeStatus',
      headerName: 'Charge Status',
      flex: 1,
      minWidth: 170,
      disableReorder: true,
    },
    {
      field: 'charges',
      headerName: 'Charges',
      ...usdPrice,
      flex: 1,
      minWidth: 140,
      disableReorder: true,
    },
    {
      field: 'adjustments',
      headerName: 'Adjustments',
      ...usdPrice,
      flex: 1,
      minWidth: 140,
      disableReorder: true,
    },
    {
      field: 'insurancePayment',
      headerName: 'Ins Payment',
      ...usdPrice,
      flex: 1,
      minWidth: 140,
      disableReorder: true,
    },
    {
      field: 'patientPayment',
      headerName: 'Pt Payment',
      ...usdPrice,
      flex: 1,
      minWidth: 140,
      disableReorder: true,
    },
    {
      field: 'totalBalance',
      headerName: 'Balance',
      ...usdPrice,
      flex: 1,
      minWidth: 140,
      disableReorder: true,
    },
  ];

  const downloadPdf = (pdfExportData: AgedTrialBalanceReportResult[]) => {
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
      const group = groupDropdown.filter(
        (m) => m.id === searchCriteria.groupID
      )[0]?.value;
      criteriaArray.push({ Criteria: 'Group', Value: group || '' });
    }
    if (searchCriteria.fromPostingDate) {
      criteriaArray.push({
        Criteria: 'Posting Date - From',
        Value: searchCriteria.fromPostingDate,
      });
    }
    if (searchCriteria.toPostingDate) {
      criteriaArray.push({
        Criteria: 'Posting Date - To',
        Value: searchCriteria.toPostingDate,
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
    const procedureDetails: PDFRowInput[] = pdfExportData.map((m) => {
      return {
        'Patient ID': m.patientID,
        'Patient Name': m.patient,
        'Patient DOB': m.patientDOB,
        'Claim ID': m.claimID,
        DOS: m.dos,
        'Provider Name': m.provider,
        POS: m.posCode,
        'CPT Code(s)': m.cptCode,
        'Dx Code(s)': m.diagnosisCodes,
        Responsibility: m.claimResponsibility,
        'Current Payer': m.currentPayer,
        'Primary Payer': m.primaryPayer,
        'Submit Date': m.submitDate,
        'Aging by DOS': m.agingByDOS,
        'Claim Status': m.claimStatus,
        'Charge Status': m.chargeStatus,
        Charges: currencyFormatter.format(m.charges),
        Adjustments: currencyFormatter.format(m.adjustments),
        'Ins Payment': currencyFormatter.format(m.insurancePayment),
        'Pt Payment': currencyFormatter.format(m.patientPayment),
        Balance: currencyFormatter.format(m.totalBalance),
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
    ExportDataToPDF(data, 'Aged Trial Balance Report');
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
    const obj: AgedTrialBalanceReportCriteria = {
      groupID: searchCriteria.groupID,
      fromPostingDate: searchCriteria.fromPostingDate,
      toPostingDate: searchCriteria.toPostingDate,
      sortColumn: '',
      sortOrder: '',
      pageNumber: undefined,
      pageSize: undefined,
      getAllData: true,
      getOnlyIDS: null,
    };
    const res = await getAgedTrialBalanceReportData(obj);
    if (res) {
      if (type === 'pdf') {
        downloadPdf(res);
      } else {
        const exportDataArray = res.map((m) => {
          return {
            'Patient ID': m.patientID.toString(),
            'Patient Name': m.patient,
            'Patient DOB': m.patientDOB,
            'Claim ID': m.claimID.toString(),
            DOS: m.dos,
            'Provider Name': m.provider,
            POS: m.posCode,
            'CPT Code(s)': m.cptCode,
            'Dx Code(s)': m.diagnosisCodes,
            Responsibility: m.claimResponsibility,
            'Current Payer': m.currentPayer,
            'Primary Payer': m.primaryPayer,
            'Submit Date': m.submitDate,
            'Aging by DOS': m.agingByDOS,
            'Claim Status': m.claimStatus,
            'Charge Status': m.chargeStatus,
            Charges: currencyFormatter.format(m.charges),
            Adjustments: currencyFormatter.format(m.adjustments),
            'Ins Payment': currencyFormatter.format(m.insurancePayment),
            'Pt Payment': currencyFormatter.format(m.patientPayment),
            Balance: currencyFormatter.format(m.totalBalance),
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
            'Patient ID': 'Criteria',
            'Patient Name': 'Value',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            'Patient ID': 'Group',
            'Patient Name': `${
              groupDropdown.filter((m) => m.id === searchCriteria.groupID)[0]
                ?.value || ''
            }`,
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            'Patient ID': 'Posting Date - From',
            'Patient Name': searchCriteria.fromPostingDate || '',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            'Patient ID': 'Posting Date - To',
            'Patient Name': searchCriteria.toPostingDate || '',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));

          criteriaObj = Object.fromEntries(headerArray.map((key) => [key, '']));
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = Object.fromEntries(headerArray.map((key) => [key, '']));
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            'Patient ID': 'Aged Trial Balance Report',
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
            ExportDataToCSV(exportArray, 'AgedTrialBalanceReport');
            dispatch(
              addToastNotification({
                text: 'Export Successful',
                toastType: ToastType.SUCCESS,
                id: '',
              })
            );
          } else {
            ExportDataToDrive(exportArray, 'AgedTrialBalanceReport', dispatch);
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
    <AppLayout title="Nucleus - Aged Trial Balance Report">
      <div className="relative m-0 h-full bg-gray-100 p-0">
        <div className="m-0 h-full w-full overflow-y-scroll bg-gray-100 p-0">
          <div className="flex w-full flex-col">
            <div className="m-0 h-full w-full overflow-y-auto overflow-x-hidden bg-gray-100 p-0">
              <div className="h-[125px] w-full">
                <div className="absolute top-0 z-[11] w-full">
                  <Breadcrumbs />
                  <PageHeader>
                    <div className="flex items-start justify-between gap-4  bg-white px-7 pt-[33px] pb-[21px]">
                      <div className="flex h-[38px] gap-6">
                        <p className="self-center text-3xl font-bold text-cyan-700">
                          Aged Trial Balance Report
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
                          <div className="w-[50%] lg:w-[23%]">
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
                          <div className="w-[50%] lg:w-[30%]">
                            <div className="pb-[5px]">
                              <p className="text-base font-bold leading-normal text-gray-700">
                                Date Range
                              </p>
                            </div>
                            <div className="flex w-full flex-wrap">
                              <div className={`w-[50%] pr-[5px]`}>
                                <div
                                  className={`w-full items-start self-stretch`}
                                >
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
                                          fromPostingDate: value
                                            ? DateToStringPipe(value, 1)
                                            : '',
                                        });
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className={`w-[50%] pl-[10px]`}>
                                <div
                                  className={`w-full items-start self-stretch`}
                                >
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
                                          toPostingDate: value
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
              <div className="w-full gap-4 bg-gray-50 px-7 pt-[25px] pb-[15px]">
                <SearchDetailGrid
                  pageNumber={lastSearchCriteria.pageNumber}
                  pageSize={lastSearchCriteria.pageSize}
                  totalCount={searchResult[0]?.totalCount}
                  persistLayoutId={22}
                  rows={
                    searchResult?.map((row) => {
                      return { ...row, id: row.rid };
                    }) || []
                  }
                  columns={columns}
                  checkboxSelection={false}
                  onPageChange={(page: number) => {
                    const obj: AgedTrialBalanceReportCriteria = {
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
                      const obj: AgedTrialBalanceReportCriteria = {
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
                      const obj: AgedTrialBalanceReportCriteria = {
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
export default AgedTrialBalanceReport;
