import type { GridColDef } from '@mui/x-data-grid-pro';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { SingleValue } from 'react-select';
import { v4 as uuidv4 } from 'uuid';

import Icon from '@/components/Icon';
import PageHeader from '@/components/PageHeader';
import SavedSearchCriteria from '@/components/PatientSearch/SavedSearchCriteria';
import Breadcrumbs from '@/components/UI/Breadcrumbs/breadcrumbs';
import Button, { ButtonType } from '@/components/UI/Button';
import CloseButton from '@/components/UI/CloseButton';
import InputField from '@/components/UI/InputField';
import Modal from '@/components/UI/Modal';
import SearchDetailGrid, {
  globalPaginationConfig,
} from '@/components/UI/SearchDetailGrid';
import type { SingleSelectDropDownDataType } from '@/components/UI/SingleSelectDropDown';
import SingleSelectDropDown from '@/components/UI/SingleSelectDropDown';
import type { SingleSelectGridDropdownDataType } from '@/components/UI/SingleSelectGridDropdown';
import SingleSelectGridDropDown from '@/components/UI/SingleSelectGridDropdown';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import AppLayout from '@/layouts/AppLayout';
import { getselectdWorkGroupsIDsSelector } from '@/store/chrome/selectors';
import {
  addToastNotification,
  fetchCPTSearchDataRequest,
  fetchPracticeDataRequest,
  getLookupDropdownsRequest,
} from '@/store/shared/actions';
import {
  addEditCptNdcCrosswalk,
  deleteCptNdcCrosswalkData,
  fetchCptNdcCrosswalkSearchData,
  fetchCptNdcCrosswalkSearchEditData,
  icdSearchRequest,
} from '@/store/shared/sagas';
import {
  getCPTSearchDataSelector,
  getLookupDropdownsDataSelector,
  getPracticeDataSelector,
} from '@/store/shared/selectors';
import {
  type AddUpdateCptNdcCrosswalk,
  type CptNdcCrosswalkCriteria,
  type CptNdcCrosswalkResult,
  type CPTSearchCriteria,
  type GroupData,
  type PracticeData,
  ToastType,
} from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';
import useOnceEffect from '@/utils/useOnceEffect';

const CptNdc = () => {
  const dispatch = useDispatch();
  const lookupsData = useSelector(getLookupDropdownsDataSelector);
  const [practiceDropdown, setPracticeDropdown] = useState<PracticeData[]>([]);
  const cptSearchData = useSelector(getCPTSearchDataSelector);
  const [showWriteOffModal, setShowWriteOffModal] = useState(false);
  const [hideSearchParameters, setHideSearchParameters] =
    useState<boolean>(true);
  const selectedWorkedGroup = useSelector(getselectdWorkGroupsIDsSelector);
  const [groupDropdown, setGroupDropdown] = useState<GroupData[]>([]);

  const [selectedCptNdcCrosswalkId, setSelectedCptNdcCrosswalkId] =
    useState<number>();
  const [isChangedJson, setIsChangedJson] = useState(true);

  const [icdSearchData, setIcdSearchData] = useState<
    SingleSelectGridDropdownDataType[]
  >([]);
  const [selectedIcd1, setSelectedIcd1] =
    useState<SingleValue<SingleSelectGridDropdownDataType>>();
  const [selectedIcd2, setSelectedIcd2] =
    useState<SingleValue<SingleSelectGridDropdownDataType>>();

  const [cptSearch, setCptSearch] = useState<CPTSearchCriteria>({
    searchValue: '',
    clientID: null,
  });
  const [addEditJSON, setAddEditJSON] = useState<AddUpdateCptNdcCrosswalk>({
    cptNdcCrossWalkID: null,
    practiceID: null,
    cpt: '',
    ndcCode: '',
    qualifierID: '',
    units: null,
    icd1: '',
    icd2: '',
    serviceDescription: '',
  });

  const practiceData = useSelector(getPracticeDataSelector);
  const [refreshDetailView, setRefreshDetailView] = useState<string>();
  useEffect(() => {
    if (refreshDetailView === 'refresh') {
      setRefreshDetailView(undefined);
    }
  }, [refreshDetailView]);
  useOnceEffect(() => {
    if (cptSearch.searchValue !== '') {
      dispatch(fetchCPTSearchDataRequest(cptSearch));
    }
  }, [cptSearch.searchValue]);

  const getIcdSearch = async (text: string) => {
    const res = await icdSearchRequest(text);
    if (res) {
      setIcdSearchData(res);
    }
    return res;
  };
  const [statusModalInfo, setStatusModalInfo] = useState<{
    show: boolean;
    showCloseButton?: boolean;
    heading: string;
    text: string;
    type: StatusModalType;
    confirmType?: string;
    okButtonText?: string;
    okButtonColor?: ButtonType;
  }>();

  const defaultSearchCriteria: CptNdcCrosswalkCriteria = {
    pageNumber: 1,
    pageSize: globalPaginationConfig.activePageSize,
    sortColumn: '',
    sortOrder: '',
    cpt: '',
    ndc: '',
    getAllData: null,
    getCptNdcCrosswalkIDS: null,
  };
  const [lastSearchCriteria, setLastSearchCriteria] = useState(
    defaultSearchCriteria
  );
  const [searchCriteria, setSearchCriteria] = useState(defaultSearchCriteria);
  const [searchResult, setSearchResult] = useState<CptNdcCrosswalkResult[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);

  const setSearchCriteriaFields = (value: CptNdcCrosswalkCriteria) => {
    setSearchCriteria(value);
    setIsChangedJson(true);
  };

  const getSearchData = async (obj: CptNdcCrosswalkCriteria) => {
    const res = await fetchCptNdcCrosswalkSearchData(obj);
    if (res) {
      setSearchResult(res);
      setTotalCount(res[0]?.total || 0);
      setLastSearchCriteria(obj);
    } else {
      setStatusModalInfo({
        ...statusModalInfo,
        show: true,
        showCloseButton: false,
        heading: 'Error',
        type: StatusModalType.ERROR,
        text: 'A system error occurred while searching for results.\nPlease try again.',
      });
    }
  };
  const handleAddUpdateJson = (value: AddUpdateCptNdcCrosswalk) => {
    setAddEditJSON(value);
  };

  useEffect(() => {
    setPracticeDropdown(practiceData || []);
    if (practiceData?.length === 1) {
      setSearchCriteria({
        ...searchCriteria,
        practiceID: practiceData[0]?.id,
      });
      handleAddUpdateJson({
        ...addEditJSON,
        practiceID: practiceData[0]?.id || null,
      });
    }
  }, [practiceData]);

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
  const clearForm = () => {
    setAddEditJSON({
      cptNdcCrossWalkID: null,
      practiceID: searchCriteria.practiceID || null,
      ndcCode: '',
      cpt: '',
      qualifierID: '',
      units: null,
      icd1: '',
      icd2: '',
      serviceDescription: '',
    });
  };
  const initProfile = () => {
    dispatch(getLookupDropdownsRequest());
  };
  useEffect(() => {
    initProfile();
  }, []);
  const onAddEditCptNdcCrosswalk = async () => {
    if (
      !addEditJSON.practiceID ||
      !addEditJSON.cpt ||
      !addEditJSON.ndcCode ||
      !addEditJSON.units
    ) {
      setStatusModalInfo({
        ...statusModalInfo,
        show: true,
        heading: 'Alert',
        showCloseButton: false,
        type: StatusModalType.WARNING,
        text: 'This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.',
      });
      return;
    }
    if (addEditJSON.ndcCode.length !== 11) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'NDC code must be 11 digits.',
          toastType: ToastType.ERROR,
        })
      );
      return;
    }
    const res = await addEditCptNdcCrosswalk(addEditJSON);
    if (!res) {
      setStatusModalInfo({
        ...statusModalInfo,
        show: true,
        showCloseButton: false,
        heading: 'Error',
        type: StatusModalType.ERROR,
        confirmType: '',
        text: `A system error prevented the CPT - NDC Crosswalk to be ${
          addEditJSON.cptNdcCrossWalkID ? 'created' : 'saved'
        }. Please try again.`,
      });
    } else {
      setShowWriteOffModal(false);
      clearForm();
      getSearchData(lastSearchCriteria);
      setSelectedIcd1(undefined);
      setSelectedIcd2(undefined);
    }
  };
  const deleteCptNdcCrosswalk = async (id: number | undefined) => {
    const res = await deleteCptNdcCrosswalkData(id);
    if (!res) {
      setStatusModalInfo({
        ...statusModalInfo,
        show: true,
        showCloseButton: false,
        heading: 'Error',
        okButtonColor: ButtonType.primary,
        okButtonText: 'Ok',
        type: StatusModalType.ERROR,
        text: `A system error prevented the CPT - NDC item to be deleted. Please try again.`,
        confirmType: '',
      });
    } else {
      getSearchData(lastSearchCriteria);
    }
  };
  useEffect(() => {
    setGroupDropdown(selectedWorkedGroup?.groupsData || []);
    dispatch(
      fetchPracticeDataRequest({
        groupID: selectedWorkedGroup?.groupsData[0]?.id || 0,
      })
    );
  }, [selectedWorkedGroup]);

  const columns: GridColDef[] = [
    {
      field: 'crossWalkID',
      headerName: 'Crosswalk ID',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-cyan-500 underline"
            onClick={async () => {}}
          >
            {`#${params.row.crossWalkID}`}
          </div>
        );
      },
    },
    {
      field: 'practice',
      headerName: 'Practice',
      flex: 1,
      minWidth: 220,
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
              EIN: {params.row.practiceEIN ? `${params.row.practiceEIN}` : ''}
            </div>
          </div>
        );
      },
    },
    {
      field: 'ndc',
      headerName: 'NDC',
      flex: 1,
      minWidth: 170,
      disableReorder: true,
    },
    {
      field: 'cpt',
      headerName: 'CPT Code',
      flex: 1,
      minWidth: 120,
      disableReorder: true,
    },
    {
      field: 'qualifier',
      headerName: 'Qualifier',
      flex: 1,
      minWidth: 110,
      disableReorder: true,
    },
    {
      field: 'units',
      headerName: 'Units',
      flex: 1,
      minWidth: 100,
      disableReorder: true,
    },
    {
      field: 'icd1',
      headerName: 'ICD 1',
      flex: 1,
      minWidth: 120,
      disableReorder: true,
    },
    {
      field: 'icd2',
      headerName: 'ICD 2',
      flex: 1,
      minWidth: 120,
      disableReorder: true,
    },
    {
      field: 'updatedOn',
      headerName: 'Updated On',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'updatedBy',
      headerName: 'Updated By',
      flex: 1,
      minWidth: 150,
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
              {params.row.updateByRole ? `${params.row.updateByRole}` : ''}
            </div>
          </div>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 180,
      disableReorder: true,
      headerClassName: '!bg-cyan-100 !text-center ',
      cellClassName: '!bg-cyan-50',
      renderCell: (params) => {
        return (
          <>
            <Button
              buttonType={ButtonType.secondary}
              fullWidth={true}
              cls={
                'ml-[2px] w-[85px] h-[38px] inline-flex !justify-center gap-2 leading-loose '
              }
              style={{ verticalAlign: 'middle' }}
              onClick={async () => {
                const res = await fetchCptNdcCrosswalkSearchEditData(
                  params.row.id
                );
                if (res) {
                  setCptSearch({
                    ...cptSearch,
                    searchValue: res.cpt,
                  });
                  if (res.icd1 !== '' && res.icd1 !== null) {
                    const icd1 = await getIcdSearch(res.icd1);
                    setSelectedIcd1(icd1 && icd1[0]);
                  }
                  if (res.icd2 !== '' && res.icd2 !== null) {
                    const icd2 = await getIcdSearch(res.icd2);
                    setSelectedIcd2(icd2 && icd2[0]);
                  }
                  setAddEditJSON({
                    cptNdcCrossWalkID: res.cptNdcCrossWalkID,
                    practiceID: res.practiceID,
                    ndcCode: res.ndcCode,
                    cpt: res.cpt,
                    qualifierID: res.qualifierID,
                    units: res.units,
                    icd1: res.icd1,
                    icd2: res.icd2,
                    serviceDescription: res.serviceDescription,
                  });
                  setShowWriteOffModal(true);
                }
              }}
            >
              <Icon name={'pencil'} size={20} />
              <p className="text-justify text-sm">Edit</p>
            </Button>
            <div className="ml-2 flex gap-x-2">
              <Button
                buttonType={ButtonType.secondary}
                cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                onClick={() => {
                  setSelectedCptNdcCrosswalkId(params.row.id);
                  setStatusModalInfo({
                    show: true,
                    showCloseButton: true,
                    heading: 'Delete CPT - NDC Crosswalk Confirmation',
                    text: `Deleting a CPT - NDC Crosswalk will permanently remove it from the system. Are you sure you want to proceed with this action?`,
                    type: StatusModalType.WARNING,
                    okButtonText: 'Yes, Delete CPT - NDC Item',
                    okButtonColor: ButtonType.tertiary,
                    confirmType: 'Delete',
                  });
                }}
              >
                <Icon name={'trash'} size={18} />
              </Button>
            </div>
          </>
        );
      },
    },
  ];

  return (
    <AppLayout title="Nucleus - CPT-NDC Crosswalk">
      <div className="m-0 h-full w-full overflow-y-auto bg-gray-100 p-0">
        <Breadcrumbs />
        <PageHeader>
          <div className="flex items-start justify-between gap-4  bg-white px-7 pt-[33px] pb-[21px]">
            <div className="flex h-[38px] gap-6">
              <p className="self-center text-3xl font-bold text-cyan-600">
                CPT - NDC Crosswalk
              </p>
              <div>
                <Button
                  cls={'h-[38px] truncate '}
                  buttonType={ButtonType.primary}
                  onClick={() => {
                    setShowWriteOffModal(true);
                  }}
                >
                  Create New CPT/NDC Crosswalk
                </Button>
              </div>
            </div>
          </div>
        </PageHeader>

        <div className={'bg-gray-50 px-[25px] pb-[25px]'}>
          <div className="flex items-center py-[20px] px-[5px]">
            <div
              className={`text-left font-bold text-gray-700 inline-flex items-center pr-[29px]`}
            >
              <p className={`text-xl m-0 sm:text-xl`}>Search Parameters</p>
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
                    Details
                  </p>
                </div>
                <div className="flex w-full flex-wrap">
                  <div className={`lg:w-[20%] w-[50%] px-[5px]`}>
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

                  <div className={`w-[20%] pr-[8px] ml-3`}>
                    <div className={`w-full items-start self-stretch`}>
                      <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                        CPT Code
                      </div>
                      <div className="w-full">
                        <InputField
                          placeholder="CPT Code"
                          value={searchCriteria?.cpt || ''}
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

                  <div className={`w-[20%] pr-[8px] ml-[9px]`}>
                    <div className={`w-full items-start self-stretch`}>
                      <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                        NDC Code
                      </div>
                      <div className="w-full">
                        <InputField
                          placeholder="NDC Code"
                          value={searchCriteria?.ndc || ''}
                          onChange={(evt) => {
                            setSearchCriteriaFields({
                              ...searchCriteria,
                              ndc: evt.target.value,
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className={'py-[15px] px-[5px] pb-0'}>
                  <div className={`h-[1px] w-full bg-gray-200`} />
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex h-20 items-start justify-between gap-4 bg-gray-200 px-7 pt-[25px] pb-[15px]">
          <div className="flex w-full items-center justify-between">
            <div className="flex w-[50%] items-center justify-between">
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
                  {hideSearchParameters === false ? 'Show' : 'Hide'} Search
                  Parameters
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
                persistLayoutId={33}
                rows={
                  searchResult.map((row) => {
                    return { ...row, id: row.crossWalkID };
                  }) || []
                }
                columns={columns}
                pinnedColumns={{
                  right: ['actions'],
                }}
                checkboxSelection={false}
                onPageChange={(page: number) => {
                  const obj: CptNdcCrosswalkCriteria = {
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
                    const obj: CptNdcCrosswalkCriteria = {
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
                    const obj: CptNdcCrosswalkCriteria = {
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
      <StatusModal
        open={!!statusModalInfo?.show}
        heading={statusModalInfo?.heading}
        description={statusModalInfo?.text}
        statusModalType={statusModalInfo?.type}
        showCloseButton={statusModalInfo?.showCloseButton}
        okButtonText={statusModalInfo?.okButtonText}
        okButtonColor={statusModalInfo?.okButtonColor}
        closeOnClickOutside={true}
        onChange={() => {
          if (statusModalInfo?.confirmType === 'CancelConfirmationOnAdd') {
            clearForm();
            setSelectedIcd1(undefined);
            setSelectedIcd2(undefined);
            setShowWriteOffModal(false);
          }
          if (statusModalInfo?.confirmType === 'Delete') {
            deleteCptNdcCrosswalk(selectedCptNdcCrosswalkId);
            setShowWriteOffModal(false);
          }
          setStatusModalInfo(undefined);
        }}
        onClose={() => {
          setStatusModalInfo(undefined);
        }}
      />
      <Modal
        open={showWriteOffModal}
        onClose={() => {}}
        modalContentClassName="relative w-[80%] overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 w-full"
      >
        <div className="flex flex-col bg-gray-100">
          <div className="mt-3 max-w-full py-4 px-6">
            <div className="flex flex-row justify-between">
              <div>
                <h1 className=" text-left  text-xl font-bold leading-7 text-gray-700">
                  {addEditJSON.cptNdcCrossWalkID
                    ? `Edit CPT - NDC Crosswalk - ID#${addEditJSON.cptNdcCrossWalkID}`
                    : 'New CPT - NDC Crosswalk'}
                </h1>
              </div>
              <div className="">
                <CloseButton
                  onClick={() => {
                    setShowWriteOffModal(false);
                    clearForm();
                    setSelectedIcd1(undefined);
                    setSelectedIcd2(undefined);
                  }}
                />
              </div>
            </div>
            <div className="mt-3 h-px w-full bg-gray-300" />
          </div>
          <div className="flex flex-col">
            <div className=" px-6 pt-4 pb-7">
              <div className={` `}>
                <div className={`   `}>
                  <div>
                    <div className="flex w-full">
                      <div className="px-[5px] md:w-[50%] lg:w-[25%]">
                        <div
                          className={`flex flex-col w-full items-start justify-start self-stretch`}
                        >
                          <label className="text-sm font-medium leading-tight text-gray-700">
                            Group<span className="text-cyan-500">*</span>
                          </label>
                          <div className="w-full">
                            <SingleSelectDropDown
                              placeholder="-"
                              showSearchBar={true}
                              disabled={true}
                              data={
                                selectedWorkedGroup?.groupsData ||
                                ([] as SingleSelectDropDownDataType[])
                              }
                              selectedValue={
                                groupDropdown.filter((f) => f.value)[0]
                              }
                              onSelect={() => {}}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="px-[5px] md:w-[50%] lg:w-[25%]">
                        <div
                          className={`flex flex-col w-full items-start justify-start self-stretch`}
                        >
                          <label className="text-sm font-medium leading-tight text-gray-700">
                            Practice<span className="text-cyan-500">*</span>
                          </label>
                          <div className="w-full">
                            <SingleSelectDropDown
                              placeholder="Select From Dropdown"
                              showSearchBar={true}
                              disabled={false}
                              data={practiceDropdown}
                              selectedValue={
                                practiceDropdown.filter(
                                  (a) => a.id === addEditJSON.practiceID
                                )[0]
                              }
                              onSelect={(value) => {
                                handleAddUpdateJson({
                                  ...addEditJSON,
                                  practiceID: value.id,
                                });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={'py-[15px] px-[5px]'}>
                      <div className={`h-[1px] w-full bg-gray-200`} />
                    </div>
                    <div className="mb-[15px] flex w-full  flex-col items-start">
                      <div className="px-[5px] pb-[15px]">
                        <p className="text-base font-bold leading-normal text-gray-700">
                          CPT - NDC Details
                        </p>
                      </div>
                      <div className="flex w-full">
                        <div className="px-[5px] md:w-[50%] lg:w-[22%]">
                          <div
                            className={`mt-[-3px] flex flex-col w-full items-start self-stretch`}
                          >
                            <label className="pb-[3px] text-sm font-medium leading-tight text-gray-700">
                              CPT Code<span className="text-cyan-500">*</span>
                            </label>
                            <div className="w-full">
                              <SingleSelectGridDropDown
                                placeholder="CPT Code"
                                showSearchBar={true}
                                showDropdownIcon={false}
                                disabled={false}
                                data={
                                  cptSearchData?.length !== 0
                                    ? (cptSearchData as SingleSelectGridDropdownDataType[])
                                    : []
                                }
                                selectedValue={
                                  cptSearchData?.filter(
                                    (a) => a.value === addEditJSON.cpt
                                  )[0]
                                }
                                onSelect={(e) => {
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    cpt: e?.value || '',
                                  });
                                }}
                                onSearch={(value) => {
                                  setCptSearch({
                                    ...cptSearch,
                                    searchValue: value,
                                  });
                                }}
                                appendTextSeparator={'|'}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="px-[5px] md:w-[50%] lg:w-[22%]">
                          <div
                            className={`mt-[-4px] flex flex-col w-full items-start self-stretch`}
                          >
                            <label className="text-sm font-medium leading-tight text-gray-700">
                              NDC Code<span className="text-cyan-500">*</span>
                            </label>
                            <div className="w-full">
                              <InputField
                                value={addEditJSON.ndcCode || ''}
                                placeholder="NDC Code"
                                onChange={(evt) => {
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    ndcCode: evt.target.value,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="px-[5px] md:w-[50%] lg:w-[23%]">
                          <div
                            className={`mt-[-4px] flex flex-col w-full items-start self-stretch`}
                          >
                            <label className="text-sm font-medium leading-tight text-gray-700">
                              Qualifier
                            </label>
                            <div className="w-full">
                              <SingleSelectDropDown
                                placeholder="Select From Dropdown"
                                disabled={false}
                                data={
                                  lookupsData?.ndcCodes
                                    ? lookupsData?.ndcCodes
                                    : []
                                }
                                selectedValue={
                                  lookupsData?.ndcCodes.filter(
                                    (m) =>
                                      String(m.id) === addEditJSON.qualifierID
                                  )[0]
                                }
                                onSelect={(value) => {
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    qualifierID: String(value.id),
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="px-[5px] md:w-[50%] lg:w-[22%]">
                          <div
                            className={`mt-[-4px] flex flex-col w-full items-start self-stretch`}
                          >
                            <label className="text-sm font-medium leading-tight text-gray-700">
                              Units<span className="text-cyan-500">*</span>
                            </label>
                            <div className="w-full">
                              <InputField
                                value={addEditJSON.units}
                                placeholder="Units Count"
                                onChange={(evt) => {
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    units: Number(evt.target.value),
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={'py-[15px] px-[5px] pt-0'}>
                      <div className={`h-[1px] w-full bg-gray-200`} />
                    </div>
                    <div className="mb-6 flex w-full  flex-col items-start">
                      <div className="px-[5px] pb-[15px]">
                        <p className="text-base font-bold leading-normal text-gray-700">
                          ICD Details
                        </p>
                      </div>
                      <div className="flex w-full">
                        <div className="px-[5px] md:w-[50%] lg:w-[22.1%]">
                          <div
                            className={`mt-[-3px] flex flex-col w-full items-start self-stretch`}
                          >
                            <label className="pb-[3px] text-sm font-medium leading-tight text-gray-700">
                              ICD (1)
                            </label>
                            <div className="w-full">
                              <SingleSelectGridDropDown
                                placeholder="ICD Code"
                                showSearchBar={true}
                                showDropdownIcon={false}
                                disabled={false}
                                data={icdSearchData}
                                selectedValue={selectedIcd1}
                                onSelect={(e) => {
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    icd1: e?.value || '',
                                  });
                                  setSelectedIcd1(e);
                                }}
                                onSearch={(value) => {
                                  getIcdSearch(value);
                                }}
                                appendTextSeparator={'|'}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="px-[5px] md:w-[50%] lg:w-[22.1%]">
                          <div
                            className={`mt-[-3px] flex flex-col w-full items-start self-stretch`}
                          >
                            <label className="pb-[3px] text-sm font-medium leading-tight text-gray-700">
                              ICD (2)
                            </label>
                            <div className="w-full">
                              <SingleSelectGridDropDown
                                placeholder="ICD Code"
                                showSearchBar={true}
                                showDropdownIcon={false}
                                disabled={false}
                                data={icdSearchData}
                                selectedValue={selectedIcd2}
                                onSelect={(e) => {
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    icd2: e?.value || '',
                                  });
                                  setSelectedIcd2(e);
                                }}
                                onSearch={(value) => {
                                  getIcdSearch(value);
                                }}
                                appendTextSeparator={'|'}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="px-[5px] md:w-[50%] lg:w-[55%]">
                          <div
                            className={`mt-[-4px] flex flex-col w-full items-start self-stretch`}
                          >
                            <label className="text-sm font-medium leading-tight text-gray-700">
                              Service Description
                            </label>
                            <div className="w-full">
                              <InputField
                                value={addEditJSON.serviceDescription || ''}
                                placeholder="Service Description"
                                onChange={(evt) => {
                                  handleAddUpdateJson({
                                    ...addEditJSON,
                                    serviceDescription: evt.target.value,
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
          </div>

          <div className={`h-[86px] bg-gray-200 w-full`}>
            <div className="flex flex-row-reverse gap-4 p-6 ">
              <div>
                <Button
                  buttonType={ButtonType.primary}
                  onClick={async () => {
                    onAddEditCptNdcCrosswalk();
                  }}
                >
                  {addEditJSON.cptNdcCrossWalkID
                    ? 'Save Changes'
                    : 'Create CPT - NDC Crosswalk'}
                </Button>
              </div>
              <div>
                <Button
                  buttonType={ButtonType.secondary}
                  cls={`w-[102px]`}
                  onClick={() => {
                    setStatusModalInfo({
                      show: true,
                      showCloseButton: true,
                      heading: 'Cancel Confirmation',
                      text: `Are you sure you want to cancel ${
                        addEditJSON.cptNdcCrossWalkID ? 'editing' : 'creating'
                      } this CPT - NDC Crosswalk? Clicking "Confirm" will result in the loss of all changes.`,
                      type: StatusModalType.WARNING,
                      okButtonText: 'Confirm',
                      okButtonColor: ButtonType.primary,
                      confirmType: 'CancelConfirmationOnAdd',
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
};

export default CptNdc;
