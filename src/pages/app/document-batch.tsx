import type { GridColDef } from '@mui/x-data-grid-pro';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import Icon from '@/components/Icon';
import PageHeader from '@/components/PageHeader';
import SavedSearchCriteria from '@/components/PatientSearch/SavedSearchCriteria';
import Badge from '@/components/UI/Badge';
import Breadcrumbs from '@/components/UI/Breadcrumbs/breadcrumbs';
import Button, { ButtonType } from '@/components/UI/Button';
import InputField from '@/components/UI/InputField';
import MultiSelectDropDown from '@/components/UI/MultiSelectDropDown';
import SearchDetailGrid, {
  globalPaginationConfig,
} from '@/components/UI/SearchDetailGrid';
import type { SingleSelectDropDownDataType } from '@/components/UI/SingleSelectDropDown';
import SingleSelectDropDown from '@/components/UI/SingleSelectDropDown';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import AppLayout from '@/layouts/AppLayout';
import DetailDocumentBatch from '@/screen/batch/detailDocumentBatch';
import { getselectdWorkGroupsIDsSelector } from '@/store/chrome/selectors';
import {
  fetchAssignClaimToDataRequest,
  getLookupDropdownsRequest,
} from '@/store/shared/actions';
import {
  fetchBatchStatus,
  fetchBatchTypeData,
  fetchDocumentBatchGridData,
} from '@/store/shared/sagas';
import { getAssignClaimToDataSelector } from '@/store/shared/selectors';
import {
  type BatchSearchCriteria,
  type GetBatchSearchAPIResult,
  type GroupData,
  type IdValuePair,
} from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';

import AddDocumentBatch from '../../screen/batch/addDocumentBatch';

const DocumentBatch = () => {
  const [batchTypeDropdown, setBatchTypeDropdown] = useState<IdValuePair[]>([]);
  const [batchStatusDropdown, setBatchStatusDropdown] = useState<IdValuePair[]>(
    []
  );
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
  const defaultSearchCriteria: BatchSearchCriteria = {
    groupID: 0,
    pageNumber: 1,
    pageSize: globalPaginationConfig.activePageSize,
    batchTypeID: [],
    batchID: undefined,
    statusID: undefined,
    sortOrder: '',
    getAllData: false,
    assigneeUser: '',
    description: '',
    sortByColumn: '',
    getOnlyIDs: false,
    followUpAssignee: '',
  };
  const assignClaimToData = useSelector(getAssignClaimToDataSelector);
  const [lastSearchCriteria, setLastSearchCriteria] = useState(
    defaultSearchCriteria
  );
  const [searchCriteria, setSearchCriteria] = useState(defaultSearchCriteria);
  const [renderSearchCriteriaView, setRenderSearchCriteriaView] = useState(
    uuidv4()
  );
  const [searchResult, setSearchResult] = useState<GetBatchSearchAPIResult[]>(
    []
  );
  const [totalCount, setTotalCount] = useState<number>(0);
  const setSearchCriteriaFields = (value: BatchSearchCriteria) => {
    setSearchCriteria(value);
    setIsChangedJson(true);
  };
  const [selectedType, setSelecetedType] = useState<
    SingleSelectDropDownDataType[]
  >([]);
  const onSelectTypes = (arr: SingleSelectDropDownDataType[]) => {
    setSelecetedType(arr);
    setSearchCriteriaFields({
      ...searchCriteria,
      batchTypeID: arr.map((Item) => Item.id.toString()),
    });
  };

  const getSearchData = async (obj: BatchSearchCriteria) => {
    const res = await fetchDocumentBatchGridData(obj);
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
    const res = await fetchBatchTypeData();
    if (res) {
      setBatchTypeDropdown(res);
    }
  };

  const getDocumentBatchStatusData = async () => {
    const res = await fetchBatchStatus();
    if (res) {
      setBatchStatusDropdown(res);
    }
  };

  useEffect(() => {
    const groupId = searchCriteria?.groupID;
    if (groupId) {
      dispatch(fetchAssignClaimToDataRequest({ clientID: groupId }));
    }
  }, [searchCriteria?.groupID]);

  const initProfile = () => {
    dispatch(getLookupDropdownsRequest());
    getDocumentBatchTypeData();
    getDocumentBatchStatusData();
  };
  useEffect(() => {
    initProfile();
  }, []);

  const [openAddUpdateModealInfo, setOpenAddUpdateModealInfo] = useState<{
    open: boolean;
    type?: string;
    id?: number;
  }>({ open: false });

  const columns: GridColDef[] = [
    {
      field: 'batchID',
      headerName: 'Batch ID',
      flex: 1,
      minWidth: 104,
      disableReorder: true,
      renderCell: (params) => {
        const formattedValue = `#${params.value}`;
        return (
          <div className="flex flex-col">
            <div
              data-testid="org"
              className="cursor-pointer text-cyan-500"
              onClick={() => {
                setOpenAddUpdateModealInfo({
                  open: true,
                  type: 'detail',
                  id: params.row.batchID,
                });
              }}
            >
              {formattedValue}
            </div>
          </div>
        );
      },
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      minWidth: 475,
      disableReorder: true,
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      minWidth: 118,
      disableReorder: true,
      renderCell: (params) => {
        if (params.row.claimStatusID === 5) {
          return (
            <Badge
              text={params.value}
              cls={'bg-green-50 text-green-800 rounded-[4px] whitespace-normal'}
              icon={<Icon name={'desktop'} color={IconColors.GREEN} />}
            />
          );
        }
        if (params.row.claimStatusID === 6) {
          return (
            <Badge
              text={params.value}
              cls={
                'bg-yellow-50 text-yellow-800 rounded-[4px] whitespace-normal'
              }
              icon={<Icon name={'user'} color={IconColors.Yellow} />}
            />
          );
        }
        return (
          <Badge
            text={params.value}
            cls={'bg-gray-50 text-gray-800 rounded-[4px] whitespace-normal'}
            icon={<Icon name={'desktop'} color={IconColors.GRAY} />}
          />
        );
      },
    },
    {
      field: 'batchType',
      headerName: 'Batch Type',
      flex: 1,
      minWidth: 122,
      disableReorder: true,
    },
    {
      field: 'assignee',
      headerName: 'Assignee',
      flex: 1,
      minWidth: 131,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="text-cyan-500 underline">{params.value}</div>
            <div>{params.row.practiceAddress || '-'}</div>
          </div>
        );
      },
    },
    {
      field: 'createdOn',
      headerName: 'Created On',
      flex: 1,
      minWidth: 143,
      disableReorder: true,
    },
    {
      field: 'createdBy',
      headerName: 'Created By',
      flex: 1,
      minWidth: 141,
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
  ];
  const [refreshDetailView, setRefreshDetailView] = useState<string>();
  useEffect(() => {
    if (refreshDetailView === 'refresh') {
      setRefreshDetailView(undefined);
    }
  }, [refreshDetailView]);
  useEffect(() => {
    setGroupDropdown(selectedWorkedGroup?.groupsData || []);
    if (selectedWorkedGroup?.groupsData[0]?.id)
      setSearchCriteriaFields({
        ...searchCriteria,
        groupID: selectedWorkedGroup?.groupsData[0]?.id || 0,
      });
  }, [selectedWorkedGroup]);

  return (
    <AppLayout title="Nucleus - Document Batch">
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
                          Document Batch
                        </p>
                        <div>
                          <Button
                            cls={'h-[38px] truncate '}
                            buttonType={ButtonType.primary}
                            onClick={() => {
                              setOpenAddUpdateModealInfo({
                                open: true,
                                type: 'create',
                              });
                            }}
                          >
                            Create New Document Batch
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
                          <div className={`w-[40%] pl-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Batch Type
                              </div>
                              <div className="w-full">
                                <MultiSelectDropDown
                                  placeholder="Select Batch Type"
                                  showSearchBar={true}
                                  disabled={false}
                                  data={batchTypeDropdown}
                                  selectedValue={selectedType}
                                  onSelect={(value) => {
                                    onSelectTypes(value);
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
                                  isOptional={true}
                                  data={batchStatusDropdown}
                                  selectedValue={
                                    batchStatusDropdown.filter(
                                      (f) => f.id === searchCriteria?.statusID
                                    )[0]
                                  }
                                  onSelect={(value) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      statusID: value.id,
                                    });
                                  }}
                                  onDeselectValue={() =>
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      statusID: undefined,
                                    })
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex">
                        <div className="mt-[16px] w-[50%] lg:w-[25%]">
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
                                        (f) => f.id === searchCriteria?.groupID
                                      )[0]
                                    }
                                    onSelect={(value) => {
                                      setSearchCriteriaFields({
                                        ...searchCriteria,
                                        groupID: value.id,
                                        followUpAssignee: '',
                                      });
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className={'mt-[16px] px-[15px]'}>
                          <div className={`w-[1px] h-full bg-gray-200`} />
                        </div>
                        <div className="mt-[16px] md:w-[50%] lg:w-[25%]">
                          <div className="px-[5px] pb-[5px]">
                            <p className="text-base font-bold leading-normal text-gray-700">
                              Others
                            </p>
                          </div>
                          <div className="flex w-full flex-wrap">
                            <div className={`w-[100%] px-[5px]`}>
                              <div
                                className={`w-full items-start self-stretch`}
                              >
                                <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                  Assignee
                                </div>
                                <div className="w-full">
                                  <SingleSelectDropDown
                                    placeholder="-"
                                    showSearchBar={true}
                                    disabled={false}
                                    isOptional={true}
                                    data={
                                      assignClaimToData
                                        ? (assignClaimToData as SingleSelectDropDownDataType[])
                                        : []
                                    }
                                    selectedValue={
                                      assignClaimToData?.filter(
                                        (m) =>
                                          m.id.toString() ===
                                          searchCriteria.followUpAssignee
                                      )[0]
                                    }
                                    onSelect={(value) => {
                                      setSearchCriteriaFields({
                                        ...searchCriteria,
                                        followUpAssignee: String(value.id),
                                      });
                                    }}
                                    onDeselectValue={() =>
                                      setSearchCriteriaFields({
                                        ...searchCriteria,
                                        followUpAssignee: undefined,
                                      })
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={'py-[15px] px-[5px]'}>
                      <div className={`h-[1px] w-full bg-gray-200`} />
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
                    persistLayoutId={9}
                    totalCount={totalCount}
                    rows={
                      searchResult.map((row) => {
                        return { ...row, id: row.batchID };
                      }) || []
                    }
                    columns={columns}
                    checkboxSelection={false}
                    onPageChange={(page: number) => {
                      const obj: BatchSearchCriteria = {
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
                        const obj: BatchSearchCriteria = {
                          ...lastSearchCriteria,
                          sortByColumn: field || undefined,
                          sortOrder: sort || '',
                        };
                        setLastSearchCriteria(obj);
                        getSearchData(obj);
                      }
                    }}
                    onPageSizeChange={(pageSize: number, page: number) => {
                      if (searchResult.length) {
                        const obj: BatchSearchCriteria = {
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
      {openAddUpdateModealInfo.open && (
        <>
          {!!openAddUpdateModealInfo.type && (
            <DetailDocumentBatch
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
            <AddDocumentBatch
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
    </AppLayout>
  );
};

export default DocumentBatch;
