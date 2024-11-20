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
import CloseButton from '@/components/UI/CloseButton';
import InputField from '@/components/UI/InputField';
import Modal from '@/components/UI/Modal';
import SearchDetailGrid, {
  globalPaginationConfig,
} from '@/components/UI/SearchDetailGrid';
import type { SingleSelectDropDownDataType } from '@/components/UI/SingleSelectDropDown';
import SingleSelectDropDown from '@/components/UI/SingleSelectDropDown';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import AppLayout from '@/layouts/AppLayout';
import BatchStatusView999 from '@/screen/batch-status-view-999/batch-status-view-999';
import { getselectdWorkGroupsIDsSelector } from '@/store/chrome/selectors';
import {
  addToastNotification,
  fetchProviderDataRequest,
  // fetchAssignClaimToDataRequest,
} from '@/store/shared/actions';
import { getClaimBatchSubmitReport } from '@/store/shared/sagas';
import { getAssignClaimToDataSelector } from '@/store/shared/selectors';
import type {
  ClaimSubmissionReportCriteria,
  ClaimSubmissionReportResult,
  GroupData,
} from '@/store/shared/types';
import { ToastType } from '@/store/shared/types';
import type {
  DownloadDataPDFDataType,
  PDFColumnInput,
  PDFRowInput,
} from '@/utils';
import {
  ExportDataToCSV,
  ExportDataToDrive,
  ExportDataToPDF,
  ExportDataToTextFile,
} from '@/utils';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';
import { DateToStringPipe } from '@/utils/dateConversionPipes';

const ClaimActivityReport = () => {
  const dispatch = useDispatch();
  const assignClaimToData = useSelector(getAssignClaimToDataSelector);

  const selectedWorkedGroup = useSelector(getselectdWorkGroupsIDsSelector);

  const [showSubmissionBatchID, setShowSubmissionBatchID] = useState<number>();
  const [viewLogReportModal, setViewLogReportModal] = useState(false);
  const [reportTypeAndLogID, setReportTypeAndLogID] = useState({
    ediLogID: 0,
    reportType: '',
    reportData: '',
    fileName: '',
  });

  const defaultSearchCriteria: ClaimSubmissionReportCriteria = {
    groupID: selectedWorkedGroup?.groupsData[0]?.id || null,
    batchID: null,
    fromSubmittedDate: '',
    toSubmittedDate: '',
    batchSubmittedBy: '',
    claimID: null,
    pageNumber: 1,
    paginationSize: globalPaginationConfig.activePageSize,
    sortByColumn: '',
    sortOrder: '',
    getAllData: null,
    getOnlyIDS: null,
  };
  const [lastSearchCriteria, setLastSearchCriteria] = useState(
    defaultSearchCriteria
  );
  const [groupDropdown, setGroupDropdown] = useState<GroupData[]>([]);

  const [isChangedJson, setIsChangedJson] = useState(false);

  const [searchCriteria, setSearchCriteria] = useState(defaultSearchCriteria);
  const setSearchCriteriaFields = (value: ClaimSubmissionReportCriteria) => {
    setSearchCriteria(value);
    setIsChangedJson(true);
  };
  useEffect(() => {
    setGroupDropdown(selectedWorkedGroup?.groupsData || []);
    setSearchCriteriaFields({
      ...searchCriteria,
      groupID: selectedWorkedGroup?.groupsData[0]?.id || null,
    });
    if (selectedWorkedGroup?.groupsData[0]?.id) {
      dispatch(
        fetchProviderDataRequest({
          groupID: selectedWorkedGroup?.groupsData[0]?.id,
        })
      );
    }
  }, [selectedWorkedGroup]);

  const [hideSearchParameters, setHideSearchParameters] =
    useState<boolean>(true);

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
    ClaimSubmissionReportResult[]
  >([]);
  const getSearchData = async (obj: ClaimSubmissionReportCriteria) => {
    const res = await getClaimBatchSubmitReport(obj);
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
    const obj: ClaimSubmissionReportCriteria = {
      ...searchCriteria,
      sortByColumn: '',
      sortOrder: '',
      pageNumber: 1,
    };
    setSearchCriteria(obj);
    getSearchData(obj);
  };

  const columns: GridColDef[] = [
    {
      field: 'submissionBatchID',
      headerName: 'Submission Batch ID',
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
          </div>
        );
      },
    },
    {
      field: 'group',
      headerName: 'Group',
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
          </div>
        );
      },
    },
    {
      field: 'submissionType',
      headerName: 'Submission Type',
      flex: 1,
      minWidth: 250,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="text-sm font-normal leading-5">{params.value}</div>
          </div>
        );
      },
    },
    {
      field: 'clearingHouse',
      headerName: 'Clearing House',
      flex: 1,
      minWidth: 250,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="text-sm font-normal leading-5">{params.value}</div>
          </div>
        );
      },
    },
    {
      field: 'submittedOn',
      headerName: 'Submitted On',
      flex: 1,
      minWidth: 250,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="text-sm font-normal leading-5">{params.value}</div>
          </div>
        );
      },
    },
    {
      field: 'submittedBy',
      headerName: 'Submitted By',
      flex: 1,
      minWidth: 250,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="text-sm font-normal leading-5">{params.value}</div>
          </div>
        );
      },
    },
    {
      field: 'submittedClaimsCount',
      headerName: 'Submitted Claims Count',
      flex: 1,
      minWidth: 250,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="text-sm font-normal leading-5">{params.value}</div>
          </div>
        );
      },
    },
    {
      field: 'action',
      headerName: 'Actions',
      flex: 1,
      minWidth: 280,
      hideSortIcons: true,
      disableReorder: true,
      cellClassName: '!bg-cyan-50 PinnedColumLeftBorder',
      headerClassName: '!bg-cyan-100 !text-center PinnedColumLeftBorder',
      renderCell: (params) => {
        return (
          <div className="flex flex-row gap-2">
            <Button
              buttonType={ButtonType.primary}
              cls={`!w-[80px] !h-[30px] pl-[9px] pr-[11px] py-[7px] inline-flex px-4 py-2 gap-2 leading-5 bg-cyan-500 !rounded`}
              onClick={() => {
                setReportTypeAndLogID({
                  ediLogID: params.row.submissionBatchID,
                  reportType: 'txt',
                  reportData: params.row.file837,
                  fileName: `837-submission-batch-id-${params.row.submissionBatchID}`,
                });
                setViewLogReportModal(true);
              }}
            >
              <div className="flex h-4 w-4 items-center justify-center px-[0.37px] py-[2.40px]">
                <Icon name={'eyeWhite'} size={18} />
              </div>
              <div className="min-w-[30px] text-xs font-medium leading-none text-white">
                View
              </div>
            </Button>
            <Button
              buttonType={ButtonType.primary}
              cls={`!w-[147px] !h-[30px] pl-[9px] pr-[11px] py-[7px] inline-flex px-4 py-2 gap-2 leading-5 !rounded`}
              onClick={() => {
                setShowSubmissionBatchID(params.row.submissionBatchID);
              }}
            >
              <div className="flex h-4 w-4 items-center justify-center px-[0.37px] py-[2.40px]">
                <Icon name={'payment'} size={18} />
              </div>
              <div className="min-w-[70px] text-xs font-medium leading-none">
                View Batch Status
              </div>
            </Button>
          </div>
        );
      },
    },
  ];

  const downloadPdf = (pdfExportData: ClaimSubmissionReportResult[]) => {
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
    if (searchCriteria.batchID) {
      criteriaArray.push({
        Criteria: 'Submission Batch ID',
        Value: searchCriteria.batchID.toString(),
      });
    }
    if (searchCriteria.batchSubmittedBy) {
      const submittedName = assignClaimToData?.filter(
        (m) => m.id.toString() === searchCriteria.batchSubmittedBy
      )[0]?.value;
      criteriaArray.push({
        Criteria: 'Submitted By',
        Value: submittedName || '',
      });
    }
    if (searchCriteria.groupID) {
      const groupName = groupDropdown.filter(
        (m) => m.id === Number(searchCriteria.groupID)
      )[0]?.value;
      criteriaArray.push({ Criteria: 'Group', Value: groupName || '' });
    }
    if (searchCriteria.fromSubmittedDate) {
      criteriaArray.push({
        Criteria: 'Submitted Date - From',
        Value: searchCriteria.fromSubmittedDate,
      });
    }
    if (searchCriteria.toSubmittedDate) {
      criteriaArray.push({
        Criteria: 'Submitted Date - To',
        Value: searchCriteria.toSubmittedDate,
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
        'Submission Batch ID': m.groupID,
        Group: m.group,
        'Submission Type': m.submissionType,
        'Clearing House': m.clearingHouse,
        'Submitted On': m.submittedOn,
        'Submitted By': m.submittedBy,
        'Submitted Claims Count': m.submittedClaimsCount,
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
    ExportDataToPDF(data, 'Claim Submission Report');
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
    const obj: ClaimSubmissionReportCriteria = {
      groupID: searchCriteria.groupID,
      batchID: searchCriteria.batchID,
      batchSubmittedBy: searchCriteria.batchSubmittedBy,
      fromSubmittedDate: searchCriteria.fromSubmittedDate,
      toSubmittedDate: searchCriteria.toSubmittedDate,
      claimID: null,
      pageNumber: undefined,
      paginationSize: undefined,
      sortByColumn: '',
      sortOrder: '',
      getAllData: true,
      getOnlyIDS: null,
    };
    const res = await getClaimBatchSubmitReport(obj);
    if (res) {
      if (type === 'pdf') {
        downloadPdf(res);
      } else {
        const exportDataArray = res.map((m) => {
          return {
            'Submission Batch ID': m.groupID.toString(),
            Group: m.group,
            'Submission Type': m.submissionType,
            'Clearing House': m.clearingHouse,
            'Submitted On': m.submittedOn,
            'Submitted By': m.submittedBy,
            'Submitted Claims Count': m.submittedClaimsCount.toString(),
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
            'Submission Batch ID': 'Criteria',
            Group: 'Value',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));

          criteriaObj = {
            ...criteriaObj,
            'Submission Batch ID': 'Submission Batch ID',
            Group: searchCriteria.batchID?.toString() || '',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));

          const submittedName = assignClaimToData?.filter(
            (m) => m.id.toString() === searchCriteria.batchSubmittedBy
          )[0]?.value;
          criteriaObj = {
            ...criteriaObj,
            'Submission Batch ID': 'Submitted By',
            Group: submittedName || '',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));

          const groupName = groupDropdown.filter(
            (m) => m.id === Number(searchCriteria.groupID)
          )[0]?.value;
          criteriaObj = {
            ...criteriaObj,
            'Submission Batch ID': 'Group',
            Group: groupName || '',
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));

          criteriaObj = {
            ...criteriaObj,
            'Submission Batch ID': 'Submitted Date - From',
            Group: searchCriteria.fromSubmittedDate,
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));

          criteriaObj = {
            ...criteriaObj,
            'Submission Batch ID': 'Submitted Date - To',
            Group: searchCriteria.toSubmittedDate,
          };
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));

          criteriaObj = Object.fromEntries(headerArray.map((key) => [key, '']));
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = Object.fromEntries(headerArray.map((key) => [key, '']));
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          criteriaObj = {
            ...criteriaObj,
            'Submission Batch ID': 'Claim Submission Report',
            Group: '',
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
            ExportDataToCSV(exportArray, 'ClaimSubmissionReport');
            dispatch(
              addToastNotification({
                text: 'Export Successful',
                toastType: ToastType.SUCCESS,
                id: '',
              })
            );
          } else {
            ExportDataToDrive(exportArray, 'ClaimSubmissionReport', dispatch);
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
    <AppLayout title="Nucleus - Claim Submission Report">
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
                          Claim Submission Report
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
                  <div key={renderSearchCriteriaView}>
                    <div className="w-full pt-[20px]">
                      <div className="flex w-full flex-wrap">
                        <div className="flex w-full gap-8">
                          <div className="w-[50%] lg:w-[50%]">
                            <div className="px-[5px] pb-[5px]">
                              <p className="text-base font-bold leading-normal text-gray-700">
                                Submission Details
                              </p>
                            </div>
                            <div className="flex w-full flex-wrap">
                              <div className={`w-[50%] px-[5px]`}>
                                <div
                                  className={`w-full items-start self-stretch`}
                                >
                                  <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                    Submission Batch ID
                                  </div>
                                  <div className="w-full">
                                    <InputField
                                      placeholder="Batch ID"
                                      value={searchCriteria?.batchID}
                                      onChange={(evt) => {
                                        setSearchCriteriaFields({
                                          ...searchCriteria,
                                          batchID: evt.target.value
                                            ? Number(evt.target.value)
                                            : null,
                                        });
                                      }}
                                      type={'number'}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className={`w-[50%] px-[5px]`}>
                                <div
                                  className={`w-full items-start self-stretch`}
                                >
                                  <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                    Submitted By
                                  </div>
                                  <div className="w-full">
                                    <SingleSelectDropDown
                                      placeholder="-"
                                      showSearchBar={true}
                                      disabled={false}
                                      data={
                                        assignClaimToData
                                          ? (assignClaimToData as SingleSelectDropDownDataType[])
                                          : []
                                      }
                                      selectedValue={
                                        assignClaimToData?.filter(
                                          (m) =>
                                            m.id.toString() ===
                                            searchCriteria.batchSubmittedBy
                                        )[0]
                                      }
                                      onSelect={(value) => {
                                        setSearchCriteriaFields({
                                          ...searchCriteria,
                                          batchSubmittedBy: String(value.id),
                                        });
                                      }}
                                      isOptional={true}
                                      onDeselectValue={() => {
                                        setSearchCriteriaFields({
                                          ...searchCriteria,
                                          batchSubmittedBy: '',
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
                                    Submitted Date - From
                                  </div>
                                  <div className="w-full">
                                    <AppDatePicker
                                      cls="!mt-1"
                                      selected={
                                        searchCriteria?.fromSubmittedDate
                                      }
                                      onChange={(value) => {
                                        setSearchCriteriaFields({
                                          ...searchCriteria,
                                          fromSubmittedDate: value
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
                                    Submitted Date - To
                                  </div>
                                  <div className="w-full">
                                    <AppDatePicker
                                      cls="!mt-1"
                                      selected={searchCriteria?.toSubmittedDate}
                                      onChange={(value) => {
                                        setSearchCriteriaFields({
                                          ...searchCriteria,
                                          toSubmittedDate: value
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
                  pageSize={lastSearchCriteria.pageNumber}
                  totalCount={searchResult[0]?.total}
                  persistLayoutId={41}
                  rows={
                    searchResult?.map((row) => {
                      return { ...row, id: row.rid };
                    }) || []
                  }
                  columns={columns}
                  checkboxSelection={false}
                  onPageChange={(page: number) => {
                    const obj: ClaimSubmissionReportCriteria = {
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
                      const obj: ClaimSubmissionReportCriteria = {
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
                      const obj: ClaimSubmissionReportCriteria = {
                        ...lastSearchCriteria,
                        pageNumber: page,
                        paginationSize: pageSize,
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
              <Modal
                open={viewLogReportModal}
                onClose={() => {}}
                modalContentClassName="h-[calc(100%-80px)] w-[calc(100%-220px)] relative rounded-lg bg-white shadow-xl transition-all sm:my-8"
                modalBackgroundClassName={'!overflow-hidden'}
              >
                <div className="flex h-full w-full flex-col items-center justify-start overflow-hidden rounded-lg bg-gray-100 shadow">
                  <div className="flex w-full flex-col items-start justify-start p-6">
                    <div className="inline-flex w-full items-center justify-between">
                      <div className="flex items-center justify-start space-x-2">
                        <p className="text-xl font-bold leading-7 text-gray-700">
                          837 Viewer - Submission Batch ID#
                          {reportTypeAndLogID.ediLogID}
                        </p>
                      </div>
                      <CloseButton
                        onClick={() => {
                          setViewLogReportModal(false);
                        }}
                      />
                    </div>
                  </div>
                  <div className={'w-full px-6'}>
                    <div className={`h-[1px] w-full bg-gray-300`} />
                  </div>
                  <div className="w-full flex-1 overflow-y-auto bg-white">
                    <div className="flex">
                      <div className="w-full self-center break-words px-[160px] py-16 text-justify text-sm text-gray-500">
                        {reportTypeAndLogID.reportData}
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full items-center justify-center rounded-b-lg bg-gray-200 py-6">
                    <div className="flex w-full items-center justify-end space-x-4 px-7">
                      <Button
                        buttonType={ButtonType.secondary}
                        cls={`w-[102px]`}
                        onClick={() => {
                          setViewLogReportModal(false);
                        }}
                      >
                        Close
                      </Button>
                      <Button
                        buttonType={ButtonType.primary}
                        onClick={async () => {
                          ExportDataToTextFile(
                            reportTypeAndLogID.reportData,
                            `${reportTypeAndLogID.reportType}`,
                            `${reportTypeAndLogID.fileName}`
                          );
                        }}
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </Modal>

              <BatchStatusView999
                open={!!showSubmissionBatchID}
                id={showSubmissionBatchID}
                type={'SubmissionBatchID'}
                onClose={() => {
                  setShowSubmissionBatchID(undefined);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
export default ClaimActivityReport;
