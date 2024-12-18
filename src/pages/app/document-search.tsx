import {
  type GridColDef,
  type GridRowId,
  type GridRowParams,
  GRID_DETAIL_PANEL_TOGGLE_COL_DEF,
} from '@mui/x-data-grid-pro';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import Icon from '@/components/Icon';
import PageHeader from '@/components/PageHeader';
import SavedSearchCriteria from '@/components/PatientSearch/SavedSearchCriteria';
import Breadcrumbs from '@/components/UI/Breadcrumbs/breadcrumbs';
import Button, { ButtonType } from '@/components/UI/Button';
import InputField from '@/components/UI/InputField';
import MultiSelectGridDropdown from '@/components/UI/MultiSelectGridDropdown';
import SearchDetailGrid, {
  globalPaginationConfig,
} from '@/components/UI/SearchDetailGrid';
import SearchGridExpandabkeRowModal from '@/components/UI/SearchGridExpandableRowModal';
import type { SingleSelectDropDownDataType } from '@/components/UI/SingleSelectDropDown';
import SingleSelectDropDown from '@/components/UI/SingleSelectDropDown';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import AppLayout from '@/layouts/AppLayout';
import AddPaymentBatch from '@/screen/batch/addPaymentBatch';
import DetailPaymentBatch from '@/screen/batch/detailPaymentBatch';
import IframeModel from '@/screen/iframe-model/iframe-model';
import { getselectdWorkGroupsIDsSelector } from '@/store/chrome/selectors';
import {
  addToastNotification,
  getLookupDropdownsRequest,
} from '@/store/shared/actions';
import {
  downloadDocumentBase64,
  fetchBatchStatus,
  fetchDocumentBatchData,
  fetchDocumentSearchData,
  fetchDocumentTags,
} from '@/store/shared/sagas';
import type {
  DocumentSearchCriteria,
  DocumentsExpandRowResult,
  GetDocumentSearchAPIResult,
  GroupData,
  IdValuePair,
} from '@/store/shared/types';
import { ToastType } from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';

import { CustomDetailPanelToggle } from './all-claims';

const DocumentSearch = () => {
  const [documentTagDropdown, setDocumentTagDropdown] = useState<IdValuePair[]>(
    []
  );
  const [documentTypeDropdown, setDocumentTypeDropdown] = useState<
    IdValuePair[]
  >([]);
  const [batchStatusDropdown, setBatchStatusDropdown] = useState<IdValuePair[]>(
    []
  );
  const [refreshDetailView, setRefreshDetailView] = useState<string>();
  const [openAddUpdateModealInfo, setOpenAddUpdateModealInfo] = useState<{
    open: boolean;
    type?: string;
    id?: number;
  }>({ open: false });
  const dispatch = useDispatch();
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
  const defaultSearchCriteria: DocumentSearchCriteria = {
    groupIDS: 0,
    pageNumber: 1,
    pageSize: globalPaginationConfig.activePageSize,
    batchTypeID: undefined,
    batchID: undefined,
    batchStatusID: undefined,
    documentText: '',
    documentTags: undefined,
    sortColumn: '',
    sortOrder: '',
    getAllData: false,
  };
  const [lastSearchCriteria, setLastSearchCriteria] = useState(
    defaultSearchCriteria
  );
  const [searchCriteria, setSearchCriteria] = useState(defaultSearchCriteria);
  const [renderSearchCriteriaView, setRenderSearchCriteriaView] = useState(
    uuidv4()
  );
  const [searchResult, setSearchResult] = useState<
    GetDocumentSearchAPIResult[]
  >([]);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [pdfViewer, setPdfViewer] = useState({
    open: false,
    url: '',
  });

  const setSearchCriteriaFields = (value: DocumentSearchCriteria) => {
    setSearchCriteria(value);
    setIsChangedJson(true);
  };

  const getSearchData = async (obj: DocumentSearchCriteria) => {
    const res = await fetchDocumentSearchData(obj);
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
  const getDocumentBatchTypeData = async () => {
    const res = await fetchDocumentBatchData();
    if (res) {
      setDocumentTypeDropdown(res);
    }
  };
  const viewDocument = async (id: number) => {
    let base64String = '';
    const resDownloadDocument = await downloadDocumentBase64(id);
    if (resDownloadDocument && resDownloadDocument.documentBase64) {
      // check the file extension
      const extension = resDownloadDocument.documentExtension
        .substring(1)
        .toLowerCase();
      // set the content type based on the file extension
      let contentType = '';
      if (extension === 'png') {
        contentType = 'image/png';
      } else if (extension === 'jpg' || extension === 'jpeg') {
        contentType = 'image/jpeg';
      } else if (extension === 'pdf') {
        contentType = 'application/pdf';
      }
      // concatenate the content type and base64 string
      base64String = `data:${contentType};base64,${resDownloadDocument.documentBase64}`;
    }
    // view in open new window
    if (base64String) {
      const pdfWindow = window.open('');
      if (pdfWindow) {
        pdfWindow.document.write(
          `<iframe width='100%' height='100%' src='${encodeURI(
            base64String
          )}'></iframe>`
        );
      }
    } else {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Something went wrong',
          toastType: ToastType.ERROR,
        })
      );
    }
  };
  const getDocumentBatchStatusData = async () => {
    const res = await fetchBatchStatus();
    if (res) {
      setBatchStatusDropdown(res);
    }
  };
  const getDocumentTagData = async () => {
    const res = await fetchDocumentTags();
    if (res) {
      setDocumentTagDropdown(res);
    }
  };
  const initProfile = () => {
    dispatch(getLookupDropdownsRequest());
    getDocumentBatchTypeData();
    getDocumentBatchStatusData();
    getDocumentTagData();
  };
  useEffect(() => {
    initProfile();
  }, []);

  const columns: GridColDef[] = [
    {
      ...GRID_DETAIL_PANEL_TOGGLE_COL_DEF,
      renderCell: (params) => (
        <CustomDetailPanelToggle id={params.id} value={params.value} />
      ),
      minWidth: 80,
    },
    {
      field: 'documentID',
      headerName: 'Document ID',
      flex: 1,
      minWidth: 120,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="cursor-pointer text-cyan-500" onClick={() => {}}>
              #{params.value || ''}
            </div>
          </div>
        );
      },
    },
    {
      field: 'documentName',
      headerName: 'Document Name',
      flex: 1,
      minWidth: 250,
      disableReorder: true,
    },
    {
      field: 'documentType',
      headerName: 'Document Type',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'documentTags',
      headerName: 'Document Tags',
      flex: 1,
      minWidth: 200,
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
      minWidth: 180,
      disableReorder: true,
    },
    {
      field: 'batchID',
      headerName: 'Batch ID',
      flex: 1,
      minWidth: 120,
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
      field: 'tags',
      headerName: 'Tags',
      flex: 1,
      minWidth: 180,
      disableReorder: true,
      renderCell: (params) => {
        return <div className="flex flex-col">{params.value}</div>;
      },
    },

    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 240,
      disableReorder: true,
      headerClassName: '!bg-cyan-100 !text-center ',
      cellClassName: '!bg-cyan-50',
      renderCell: (params) => {
        return (
          <Button
            buttonType={ButtonType.primary}
            fullWidth={true}
            cls={
              'ml-[8px] w-[165px] h-[38px] inline-flex !justify-center gap-2 leading-loose '
            }
            style={{ verticalAlign: 'middle' }}
            onClick={() => {
              viewDocument(params.row.documentID);
            }}
          >
            <Icon name={'eye'} size={20} />
            <p className="text-justify text-sm">View Document</p>
          </Button>
        );
      },
    },
  ];

  const [detailPanelExpandedRowIds, setDetailPanelExpandedRowIds] = useState<
    GridRowId[]
  >([]);

  const [expandedRowData, setExpandedRowData] = useState<
    {
      id: GridRowId;
      data: DocumentsExpandRowResult[];
    }[]
  >([]);

  const getExpandableRowData = async (id: GridRowId | undefined) => {
    if (id) {
      const document = searchResult.filter((r) => r.documentID === id)[0];
      if (
        document &&
        document.pageNumber.trim() !== '' &&
        document.pageNumber !== '0'
      ) {
        const { documentType } = document;
        const pageNumbersArray = document.pageNumber.split(',');
        const expandedData = pageNumbersArray?.map((pageNumber) => {
          return { documentID: document.documentID, pageNumber, documentType };
        });
        setExpandedRowData((prevData) => [
          ...prevData,
          { id: document.documentID, data: expandedData },
        ]);
      }
    }
  };

  const handleDetailPanelExpandedRowIdsChange = useCallback(
    (newIds: GridRowId[]) => {
      const selectedId = newIds.filter(
        (id) => !detailPanelExpandedRowIds.includes(id)
      )[0];
      getExpandableRowData(selectedId);
      setDetailPanelExpandedRowIds(newIds);
    },
    [detailPanelExpandedRowIds, searchResult]
  );

  const closeExpandedRowContent = (id: GridRowId) => {
    setDetailPanelExpandedRowIds(
      detailPanelExpandedRowIds.filter((f) => f !== id)
    );
  };

  const expandedRowContent = (expandedRowParams: GridRowParams) => {
    return (
      <SearchGridExpandabkeRowModal
        expandRowData={
          expandedRowData
            .filter((f) => f.id === expandedRowParams.id)
            [
              expandedRowData.filter((f) => f.id === expandedRowParams.id)
                .length - 1
            ]?.data.map((row) => {
              return { ...row, id: row.pageNumber };
            }) || []
        }
        onClose={() => {
          closeExpandedRowContent(expandedRowParams.id);
        }}
        expandedColumns={[
          {
            field: 'documentID',
            headerName: 'Document ID',
            flex: 1,
            minWidth: 140,
            disableReorder: true,
            sortable: false,
            renderCell: (params: any) => {
              return <div>{`#${params.value}`}</div>;
            },
          },
          {
            field: 'pageNumber',
            headerName: 'Page #',
            flex: 1,
            minWidth: 150,
            disableReorder: true,
            sortable: false,
            renderCell: (params) => {
              return (
                <div className="flex flex-col">
                  <div
                    className="cursor-pointer text-sm font-normal leading-5 text-cyan-500 underline"
                    onClick={async () => {
                      const obj = params.row;
                      const ADNARE_PDF = process.env.NEXT_PUBLIC_ADNARE_PDF;
                      const API_BASE_URL =
                        process.env.NEXT_PUBLIC_API_BASE_URL?.replace(
                          '/api',
                          ''
                        );
                      const url = `${ADNARE_PDF}id=${obj.documentID}&type=${
                        obj.documentType
                      }&page=${
                        obj.pageNumber && obj.documentType === '.pdf'
                          ? obj.pageNumber
                          : 1
                      }&baseurl=${API_BASE_URL}&isViewer=true`;
                      setPdfViewer({ open: true, url });
                    }}
                  >
                    {params.value}
                  </div>
                </div>
              );
            },
          },
        ]}
      />
    );
  };

  useEffect(() => {
    setGroupDropdown(selectedWorkedGroup?.groupsData || []);
    if (selectedWorkedGroup?.groupsData[0]?.id)
      setSearchCriteriaFields({
        ...searchCriteria,
        groupIDS: selectedWorkedGroup?.groupsData[0]?.id || 0,
      });
  }, [selectedWorkedGroup]);

  return (
    <AppLayout title="Nucleus - Document Search">
      <div className="relative m-0 h-full bg-gray-100 p-0">
        <div className="m-0 h-full w-full overflow-y-scroll bg-gray-100 p-0">
          <div className="flex w-full flex-col">
            <div className="m-0 h-full w-full overflow-y-auto overflow-x-hidden bg-gray-100 p-0">
              <div className="h-[125px] w-full">
                <div className="absolute top-0 z-[11] w-full">
                  <Breadcrumbs />
                  <PageHeader>
                    <div className="flex h-[90px] items-start justify-between !bg-white  px-7 pt-8">
                      <div className="flex h-[38px] gap-6">
                        <p className="self-center text-3xl font-bold text-cyan-700">
                          Document Search
                        </p>
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
                      <div className="px-[5px] pb-[5px]">
                        <p className="text-base font-bold leading-normal text-gray-700">
                          Batch Details
                        </p>
                      </div>
                      <div className="flex w-full flex-wrap">
                        <div className={`lg:w-[60%] w-[50%] px-[5px] flex`}>
                          <div className={`w-[50%] pr-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Batch ID
                              </div>
                              <div className="w-full">
                                <InputField
                                  value={searchCriteria?.batchID || ''}
                                  onChange={(evt) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      batchID: evt.target.value
                                        ? Number(evt.target.value)
                                        : undefined,
                                    });
                                  }}
                                  type={'number'}
                                />
                              </div>
                            </div>
                          </div>
                          <div className={`w-[50%] pl-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Batch Type
                              </div>
                              <div className="w-full">
                                <SingleSelectDropDown
                                  placeholder="-"
                                  disabled={false}
                                  data={documentTypeDropdown}
                                  selectedValue={
                                    documentTypeDropdown.filter(
                                      (a) => a.id === searchCriteria.batchTypeID
                                    )[0]
                                  }
                                  onSelect={(value) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      batchTypeID: value.id,
                                    });
                                  }}
                                  isOptional={true}
                                  onDeselectValue={() => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      batchTypeID: undefined,
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className={`w-[50%] pl-[10px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Batch Status
                              </div>
                              <div className="w-full">
                                <SingleSelectDropDown
                                  placeholder="-"
                                  disabled={false}
                                  data={batchStatusDropdown}
                                  selectedValue={
                                    batchStatusDropdown.filter(
                                      (f) =>
                                        f.id === searchCriteria?.batchStatusID
                                    )[0]
                                  }
                                  onSelect={(value) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      batchStatusID: value.id,
                                    });
                                  }}
                                  isOptional={true}
                                  onDeselectValue={() => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      batchStatusID: undefined,
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex w-full flex-wrap">
                        <div className={`lg:w-[50%] w-[50%] px-[5px] flex`}>
                          <div className={`lg:w-[40%] w-[50%] px-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Text
                              </div>
                              <div className="w-full">
                                <InputField
                                  placeholder="-"
                                  value={searchCriteria.documentText}
                                  onChange={(e) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      documentText: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className={`w-[40%] pl-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Document Tags
                              </div>
                              <div className="w-full pt-1">
                                <MultiSelectGridDropdown
                                  placeholder="-"
                                  disabled={false}
                                  data={documentTagDropdown}
                                  selectedValue={documentTagDropdown.filter(
                                    (item) =>
                                      searchCriteria.documentTags?.includes(
                                        item.id.toString()
                                      )
                                  )}
                                  onSelect={(value) => {
                                    const commaSeparatedIDs = value
                                      .map((item) => item.id)
                                      .join(',');
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      documentTags: commaSeparatedIDs,
                                    });
                                  }}
                                />
                              </div>
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
                        <div className={`lg:w-[23%] w-[50%] px-[5px]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className={`w-[85%] pl-[5px]`}>
                              <div
                                className={`w-full items-start self-stretch`}
                              >
                                <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                  Group
                                </div>
                                <div className="w-full">
                                  <SingleSelectDropDown
                                    placeholder="-"
                                    disabled={false}
                                    data={
                                      groupDropdown as SingleSelectDropDownDataType[]
                                    }
                                    selectedValue={
                                      groupDropdown.filter(
                                        (f) => f.id === searchCriteria?.groupIDS
                                      )[0]
                                    }
                                    onSelect={(value) => {
                                      setSearchCriteriaFields({
                                        ...searchCriteria,
                                        groupIDS: value.id,
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

              <div className="flex w-full w-full flex-col gap-4 p-5 pt-[20px]">
                <div className="h-full">
                  <SearchDetailGrid
                    pageNumber={lastSearchCriteria.pageNumber}
                    pageSize={lastSearchCriteria.pageSize}
                    pinnedColumns={{
                      right: ['actions'],
                    }}
                    persistLayoutId={10}
                    totalCount={totalCount}
                    rows={
                      searchResult.map((row) => {
                        return { ...row, id: row.documentID };
                      }) || []
                    }
                    columns={columns}
                    onDetailPanelExpandedRowIdsChange={
                      handleDetailPanelExpandedRowIdsChange
                    }
                    detailPanelExpandedRowIds={detailPanelExpandedRowIds}
                    expandedRowContent={expandedRowContent}
                    checkboxSelection={false}
                    onPageChange={(page: number) => {
                      const obj: DocumentSearchCriteria = {
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
                        const obj: DocumentSearchCriteria = {
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
                        const obj: DocumentSearchCriteria = {
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
      {openAddUpdateModealInfo.open && (
        <>
          {!!openAddUpdateModealInfo.type && (
            <DetailPaymentBatch
              open={openAddUpdateModealInfo.open}
              batchId={openAddUpdateModealInfo.id}
              refreshDetailView={refreshDetailView}
              onClose={() => {
                setOpenAddUpdateModealInfo({ open: false });
              }}
              onEdit={() => {
                setOpenAddUpdateModealInfo({
                  ...openAddUpdateModealInfo,
                  type: 'create',
                });
              }}
            />
          )}
          {openAddUpdateModealInfo.type === 'create' && (
            <AddPaymentBatch
              open={openAddUpdateModealInfo.open}
              batchId={openAddUpdateModealInfo.id}
              onClose={(isAddedUpdated) => {
                if (isAddedUpdated && isChangedJson)
                  getSearchData(lastSearchCriteria);
                if (openAddUpdateModealInfo.id) {
                  if (isAddedUpdated) {
                    setRefreshDetailView('refresh');
                  }
                  setOpenAddUpdateModealInfo({
                    ...openAddUpdateModealInfo,
                    type: 'detail',
                  });
                  return;
                }
                setOpenAddUpdateModealInfo({ open: false });
              }}
            />
          )}
        </>
      )}
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
      <IframeModel
        open={pdfViewer.open}
        url={pdfViewer.url}
        onClose={() => {
          setPdfViewer({ open: false, url: '' });
        }}
      />
    </AppLayout>
  );
};

export default DocumentSearch;
