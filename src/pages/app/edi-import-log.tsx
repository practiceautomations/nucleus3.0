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
import ButtonDropdown from '@/components/UI/ButtonDropdown';
import CloseButton from '@/components/UI/CloseButton';
import InputField from '@/components/UI/InputField';
import Modal from '@/components/UI/Modal';
import MultiSelectDropDown from '@/components/UI/MultiSelectDropDown';
import SearchDetailGrid, {
  globalPaginationConfig,
} from '@/components/UI/SearchDetailGrid';
import type { SingleSelectDropDownDataType } from '@/components/UI/SingleSelectDropDown';
import SingleSelectDropDown from '@/components/UI/SingleSelectDropDown';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import UploadFile from '@/components/UI/UploadFile';
import AppLayout from '@/layouts/AppLayout';
import BatchStatusView999 from '@/screen/batch-status-view-999/batch-status-view-999';
import store from '@/store';
import { getselectdWorkGroupsIDsSelector } from '@/store/chrome/selectors';
import {
  addToastNotification,
  getLookupDropdownsRequest,
} from '@/store/shared/actions';
import {
  fetchEDIImportLogSearchData,
  fetchEDIReport,
  fetchEDIStatus,
  fetchViewReportLogData,
  getClaimStatusByID,
  uploadEDI,
} from '@/store/shared/sagas';
import type {
  EDIImportDropdown,
  EDIImportLogCriteria,
  GetEDIImportLogAPIResult,
} from '@/store/shared/types';
import { type GroupData, ToastType } from '@/store/shared/types';
import { ExportDataToTextFile } from '@/utils';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';
import { DateToStringPipe } from '@/utils/dateConversionPipes';

const EDIImportLog = () => {
  const dispatch = useDispatch();
  const [EDIStatusData, setEDIStatusData] = useState<EDIImportDropdown[]>([]);
  const [EDIReportData, setEDIReportData] = useState<EDIImportDropdown[]>([]);
  const [selectedType, setSelecetedType] = useState<
    SingleSelectDropDownDataType[]
  >([]);

  const [hideSearchParameters, setHideSearchParameters] =
    useState<boolean>(true);
  const selectedWorkedGroup = useSelector(getselectdWorkGroupsIDsSelector);
  const [groupDropdown, setGroupDropdown] = useState<GroupData[]>([]);
  const [EDIUploadModal, setEDIUploadModal] = useState(false);
  const [viewLogReportModal, setViewLogReportModal] = useState(false);
  const [reportTypeAndLogID, setReportTypeAndLogID] = useState({
    ediLogID: 0,
    reportType: '',
    reportData: '',
    fileName: '',
  });
  const [selectedFile, setSelectedFile] = useState<File>();
  const [isChangedJson, setIsChangedJson] = useState(false);
  const [refreshDetailView, setRefreshDetailView] = useState<string>();
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
  const defaultSearchCriteria: EDIImportLogCriteria = {
    status: '',
    reportType: '',
    getAllData: false,
    getOnlyIDS: false,
    pageNumber: 1,
    pageSize: globalPaginationConfig.activePageSize,
    sortByColumn: '',
    sortOrder: '',
    fromCreatedOn: null,
    toCreatedOn: null,
  };
  const [lastSearchCriteria, setLastSearchCriteria] =
    useState<EDIImportLogCriteria>(defaultSearchCriteria);
  const [searchCriteria, setSearchCriteria] = useState(defaultSearchCriteria);
  const [searchResult, setSearchResult] = useState<GetEDIImportLogAPIResult[]>(
    []
  );
  const [totalCount, setTotalCount] = useState<number>(0);
  const [showSubmissionBatchID, setShowSubmissionBatchID] = useState<number>();
  const [claimStatusDetailData, setClaimStatusDetailData] = useState<{
    id: any;
    html: '';
  }>();

  const setSearchCriteriaFields = (value: EDIImportLogCriteria) => {
    setSearchCriteria(value);
    setIsChangedJson(true);
  };
  const onSelectTypes = (arr: SingleSelectDropDownDataType[]) => {
    setSelecetedType(arr);
    setSearchCriteriaFields({
      ...searchCriteria,
      reportType: arr.map((Item) => Item.value).join(','),
    });
  };

  const getSearchData = async (obj: EDIImportLogCriteria) => {
    const res = await fetchEDIImportLogSearchData(obj);
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

  const getEDIStatusDropdownData = async () => {
    const res = await fetchEDIStatus();
    if (res) {
      setEDIStatusData(res);
    }
  };
  const getEDIReportDropdownData = async () => {
    const res = await fetchEDIReport();
    if (res) {
      setEDIReportData(res);
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
    getEDIReportDropdownData();
    getEDIStatusDropdownData();
  };
  useEffect(() => {
    initProfile();
  }, []);

  useEffect(() => {
    setGroupDropdown(selectedWorkedGroup?.groupsData || []);
    if (selectedWorkedGroup?.groupsData[0]?.id)
      setSearchCriteriaFields({
        ...searchCriteria,
        groupID: selectedWorkedGroup?.groupsData[0]?.id,
      });
  }, [selectedWorkedGroup]);

  const uploadEDIDocument = async () => {
    if (!searchCriteria.groupID || !selectedFile) {
      setStatusModalInfo({
        show: true,
        heading: 'Alert',
        // showCloseButton: false,
        text: 'This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.',
        type: StatusModalType.WARNING,
      });
      return;
    }
    const formData = new FormData();
    if (selectedFile) formData.append('file', selectedFile);
    const res = await uploadEDI(searchCriteria.groupID, formData);
    if (res.message === 'EDI successfully uploaded.') {
      store.dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'EDI successfully uploaded.',
          toastType: ToastType.SUCCESS,
        })
      );
      setSelectedFile(undefined);
      setEDIUploadModal(false);
    } else {
      setStatusModalInfo({
        show: true,
        heading: 'Error',
        text: `A system error prevented the EDI to be uploaded.\nPlease try again.`,
        type: StatusModalType.ERROR,
      });
    }
  };

  const viewLogReport = async (params: any) => {
    const res = await fetchViewReportLogData(params.row.ediLogID);
    if (res != null && res.message === 'Done') {
      setReportTypeAndLogID({
        ediLogID: params.row.ediLogID,
        reportType: params.row.reportType,
        reportData: res.data,
        fileName: params.row.fileName,
      });
      setViewLogReportModal(true);
    } else {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'File not found.',
          toastType: ToastType.ERROR,
        })
      );
    }
  };

  const getClaimStatusDataByID = async (id: number) => {
    const res = await getClaimStatusByID(id);
    if (res?.claimStatusHTML) {
      setClaimStatusDetailData({
        id,
        html: res?.claimStatusHTML,
      });
    } else {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Data not found.',
          toastType: ToastType.ERROR,
        })
      );
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'ediLogID',
      headerName: 'EDI Log ID',
      flex: 1,
      minWidth: 100,
      disableReorder: true,
      renderCell: (params) => {
        return <div>{`#${params.row.ediLogID}`}</div>;
      },
    },
    {
      field: 'errorMessage',
      headerName: 'Error Message',
      flex: 1,
      minWidth: 170,
      disableReorder: true,
    },
    {
      field: 'group',
      headerName: 'Group',
      flex: 1,
      minWidth: 170,
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
              {params.row.groupEIN ? `EIN: ${params.row.groupEIN}` : ''}
            </div>
          </div>
        );
      },
    },
    {
      field: 'reportType',
      headerName: 'Report Type',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'fileName',
      headerName: 'File Name',
      flex: 1,
      minWidth: 800,
      disableReorder: true,
    },
    {
      field: 'ediStatus',
      headerName: 'EDI Status',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'createdOn',
      headerName: 'Created On',
      flex: 1,
      minWidth: 200,
      disableReorder: true,
      renderCell: (params) => {
        return <div>{`${DateToStringPipe(params.row.createdOn, 6)}`}</div>;
      },
    },
    {
      field: 'action',
      headerName: 'Actions',
      flex: 1,
      minWidth: 345,
      hideSortIcons: true,
      disableReorder: true,
      cellClassName: '!bg-cyan-50 PinnedColumLeftBorder',
      headerClassName: '!bg-cyan-100 !text-center PinnedColumLeftBorder',
      renderCell: (params) => {
        return (
          <div className="flex flex-row gap-2">
            <Button
              buttonType={ButtonType.primary}
              cls={`!w-[145px] !h-[30px] pl-[9px] pr-[11px] py-[7px] inline-flex px-4 py-2 gap-2 leading-5 bg-cyan-500 !rounded`}
              onClick={() => {
                viewLogReport(params);
              }}
            >
              <div className="flex h-4 w-4 items-center justify-center px-[0.37px] py-[2.40px]">
                <Icon name={'eyeWhite'} size={18} />
              </div>
              <div className="min-w-[70px] text-xs font-medium leading-none text-white">
                View Report Log
              </div>
            </Button>
            {/* <Button
              buttonType={ButtonType.primary}
              cls={`!w-[137px] !h-[30px] pl-[9px] pr-[11px] py-[7px] inline-flex px-4 py-2 gap-2 leading-5 !rounded`}
              onClick={() => {}}
              disabled={!!(params.row.statusID === 3)}
            >
              <div className="flex h-4 w-4 items-center justify-center px-[0.37px] py-[2.40px]">
                <Icon
                  name={'payment'}
                  size={18}
                  color={
                    params.row.statusID === 3 ? IconColors.GRAY_500 : undefined
                  }
                />
              </div>
              <div className="min-w-[79px] text-xs font-medium leading-none">
                Full ERA Details
              </div>
            </Button> */}
            <Button
              buttonType={ButtonType.primary}
              cls={`!w-[150px] !h-[30px] pl-[9px] pr-[11px] py-[7px] inline-flex px-4 py-2 gap-2 leading-5 !rounded`}
              onClick={() => {
                if (params.row.reportType === '277')
                  getClaimStatusDataByID(params.row.ediLogID);
                else setShowSubmissionBatchID(params.row.ediLogID);
              }}
              disabled={!['999', '277'].includes(params.row.reportType)}
            >
              <div className="flex h-4 w-4 items-center justify-center px-[0.37px] py-[2.40px]">
                <Icon
                  name={'payment'}
                  size={18}
                  color={
                    !['999', '277'].includes(params.row.reportType)
                      ? IconColors.GRAY_500
                      : undefined
                  }
                />
              </div>
              <div className="min-w-[70px] text-xs font-medium leading-none">
                View {params.row.reportType === '999' ? 'Batch' : 'Claim'}{' '}
                Status
              </div>
            </Button>
          </div>
        );
      },
    },
  ];
  return (
    <AppLayout title="Nucleus - EDI Import Log">
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
                          EDI Import Log
                        </p>
                        <div>
                          <Button
                            cls={'h-[38px] truncate '}
                            buttonType={ButtonType.primary}
                            onClick={() => {
                              setEDIUploadModal(true);
                            }}
                          >
                            Upload EDI
                          </Button>
                        </div>
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
                    <div className="flex">
                      <div className="w-[50%] lg:w-[18%]">
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
                      <div className="w-[50%] lg:w-[18%]">
                        <div className="px-[5px] pb-[5px]">
                          <p className="text-base font-bold leading-normal text-gray-700">
                            EDI Details
                          </p>
                        </div>
                        <div className="flex w-full flex-wrap">
                          <div className={`w-[100%] px-[5px]`}>
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
                                      ediLogID: evt.target.value
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
                      <div className="w-[50%] pt-[29px] lg:w-[17%]">
                        <div className="flex w-full flex-wrap">
                          <div className={`w-[100%] px-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                EDI Status
                              </div>
                              <div className="w-full">
                                <SingleSelectDropDown
                                  placeholder="Select From Dropdown"
                                  forcefullyShowSearchBar={true}
                                  disabled={false}
                                  data={
                                    EDIStatusData
                                      ? (EDIStatusData as SingleSelectDropDownDataType[])
                                      : []
                                  }
                                  selectedValue={
                                    EDIStatusData.filter(
                                      (m) => m.value === searchCriteria.status
                                    )[0]
                                  }
                                  onSelect={(value) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      status: value.value,
                                    });
                                  }}
                                  isOptional={true}
                                  onDeselectValue={() => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      status: undefined,
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="w-[50%] pt-[29px] lg:w-[17%]">
                        <div className="flex w-full flex-wrap">
                          <div className={`w-[100%] px-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                EDI Report Type
                              </div>
                              <div className="w-full">
                                <MultiSelectDropDown
                                  placeholder="Select From Dropdown"
                                  forcefullyShowSearchBar={true}
                                  disabled={false}
                                  data={EDIReportData}
                                  selectedValue={selectedType}
                                  onSelect={(value) => {
                                    onSelectTypes(value);
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="w-[50%] pt-[29px] lg:w-[15%]">
                        <div className="flex w-full flex-wrap">
                          <div className={`w-[100%] px-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Created On - From
                              </div>
                              <div className="w-full">
                                <AppDatePicker
                                  cls="!mt-1"
                                  selected={searchCriteria?.fromCreatedOn}
                                  onChange={(value) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      fromCreatedOn: value,
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="w-[50%] pt-[29px] lg:w-[15%]">
                        <div className="flex w-full flex-wrap">
                          <div className={`w-[100%] px-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Created On - To
                              </div>
                              <div className="w-full">
                                <AppDatePicker
                                  cls="!mt-1"
                                  selected={searchCriteria?.toCreatedOn}
                                  onChange={(value) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      toCreatedOn: value,
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
                        buttonCls="!h-[33px]"
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
                        onSelect={() => {}}
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

              <div className="w-full gap-4 bg-white px-7 pt-[25px] pb-[15px]">
                <div className="flex w-full flex-col">
                  <div className="h-full">
                    <SearchDetailGrid
                      pageNumber={lastSearchCriteria.pageNumber}
                      pageSize={lastSearchCriteria.pageSize}
                      totalCount={totalCount}
                      persistLayoutId={19}
                      rows={
                        searchResult.map((row) => {
                          return { ...row, id: row.rid };
                        }) || []
                      }
                      columns={columns}
                      checkboxSelection={false}
                      onPageChange={(page: number) => {
                        const obj: EDIImportLogCriteria = {
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
                          const obj: EDIImportLogCriteria = {
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
                          const obj: EDIImportLogCriteria = {
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
      <Modal
        open={EDIUploadModal}
        onClose={() => {}}
        modalContentClassName="relative w-[55%] overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 w-full"
      >
        <div className="flex flex-col bg-gray-100">
          <div className="mt-3 max-w-full p-4">
            <div className="flex flex-row justify-between">
              <div>
                <h1 className=" ml-2  text-left text-xl font-bold leading-7 text-gray-700">
                  EDI Upload
                </h1>
              </div>
              <div className="">
                <CloseButton
                  onClick={() => {
                    setSelectedFile(undefined);
                    setEDIUploadModal(false);
                  }}
                />
              </div>
            </div>
            <div className="mt-3 h-px w-full bg-gray-300" />
          </div>
          <div className="flex flex-col">
            <div className=" px-6 pt-6">
              <div>
                <div className="flex gap-3">
                  <div className="flex w-[39%] shrink flex-col items-start gap-1 ">
                    <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                      Group / Organization
                      <span style={{ color: '#007BFF' }}>*</span>
                    </div>
                    <div className="w-full">
                      <SingleSelectDropDown
                        placeholder="Search group"
                        showSearchBar={true}
                        disabled={false}
                        data={groupDropdown as SingleSelectDropDownDataType[]}
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
                  <div className="flex w-[29%] shrink flex-col items-start gap-1 ">
                    <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                      Select File
                      <span style={{ color: '#007BFF' }}>*</span>
                    </div>
                    <div className="w-full py-[4px]">
                      <UploadFile
                        onFileSelect={(e) => {
                          const maxSize = e.size / 1024 / 1024;
                          if (maxSize > 50) {
                            dispatch(
                              addToastNotification({
                                id: uuidv4(),
                                text: 'File size limit exceeded.',
                                toastType: ToastType.ERROR,
                              })
                            );
                            return;
                          }
                          setSelectedFile(e);
                        }}
                        selectedFileName={selectedFile?.name}
                        cls={'w-[280px] h-[38px] relative'}
                      ></UploadFile>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-7" />
            </div>
          </div>
          <div className={`h-[90px] bg-gray-200 w-full`}>
            <div className="flex flex-row-reverse gap-4 p-6 ">
              <div data-testid="uploadDocBtn">
                <Button
                  buttonType={ButtonType.primary}
                  onClick={async () => {
                    uploadEDIDocument();
                  }}
                >
                  Upload Document
                </Button>
              </div>
              <div>
                <Button
                  buttonType={ButtonType.secondary}
                  cls={`w-[102px]`}
                  onClick={() => {
                    setSelectedFile(undefined);
                    setEDIUploadModal(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
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
                  Report Log Viewer - {reportTypeAndLogID.reportType} - EDI Log
                  ID#{reportTypeAndLogID.ediLogID}
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

      <Modal
        open={!!claimStatusDetailData?.html}
        onClose={() => {}}
        modalContentClassName="h-[calc(100%-80px)] w-[calc(100%-220px)] relative rounded-lg bg-white shadow-xl transition-all sm:my-8"
        modalBackgroundClassName={'!overflow-hidden'}
        modalClassName={'!z-[14]'}
      >
        <div className="flex h-full w-full flex-col items-center justify-start overflow-hidden rounded-lg bg-white shadow">
          <div className="flex w-full flex-col items-start justify-start px-6 py-4">
            <div className="inline-flex w-full items-center justify-between">
              <div className="flex items-center justify-start space-x-2">
                <p className="text-xl font-bold leading-7 text-cyan-600">
                  <p className="text-xl font-bold leading-7 text-gray-700">
                    Claim Status Viewer - EDI Log ID#{claimStatusDetailData?.id}
                  </p>
                </p>
              </div>
              <div className="inline-flex items-center gap-4">
                <CloseButton
                  onClick={() => {
                    setClaimStatusDetailData(undefined);
                  }}
                />
              </div>
            </div>
          </div>
          <div className={'w-full px-6'}>
            <div className={`h-[1px] w-full bg-gray-300`} />
          </div>
          <div className="w-full flex-1 overflow-y-auto bg-white">
            <div className="flex">
              <div className="h-full w-full self-center break-words p-7 text-justify text-sm text-gray-500">
                <div
                  dangerouslySetInnerHTML={{
                    __html: claimStatusDetailData?.html || '',
                  }}
                />
              </div>
            </div>
          </div>
          <div className="flex w-full items-center justify-center rounded-b-lg bg-gray-200 py-6">
            <div className="flex w-full items-center justify-end space-x-4 px-7">
              <Button
                buttonType={ButtonType.secondary}
                cls={`w-[102px]`}
                onClick={() => {
                  setClaimStatusDetailData(undefined);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <BatchStatusView999
        open={!!showSubmissionBatchID}
        id={showSubmissionBatchID}
        type={'EdiLogID'}
        onClose={() => {
          setShowSubmissionBatchID(undefined);
        }}
      />
    </AppLayout>
  );
};

export default EDIImportLog;
