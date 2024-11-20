import {
  type GridColDef,
  GRID_CHECKBOX_SELECTION_COL_DEF,
} from '@mui/x-data-grid-pro';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import Icon from '@/components/Icon';
import PageHeader from '@/components/PageHeader';
import SavedSearchCriteria from '@/components/PatientSearch/SavedSearchCriteria';
import AppDatePicker from '@/components/UI/AppDatePicker';
import Badge from '@/components/UI/Badge';
import Breadcrumbs from '@/components/UI/Breadcrumbs/breadcrumbs';
import Button, { ButtonType } from '@/components/UI/Button';
import CloseButton from '@/components/UI/CloseButton';
import InfoToggle from '@/components/UI/InfoToggle';
import InputField from '@/components/UI/InputField';
import Modal from '@/components/UI/Modal';
import RadioButton from '@/components/UI/RadioButton';
import SearchDetailGrid, {
  globalPaginationConfig,
} from '@/components/UI/SearchDetailGrid';
import type { SingleSelectDropDownDataType } from '@/components/UI/SingleSelectDropDown';
import SingleSelectDropDown from '@/components/UI/SingleSelectDropDown';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import TextArea from '@/components/UI/TextArea';
import AppLayout from '@/layouts/AppLayout';
import { getselectdWorkGroupsIDsSelector } from '@/store/chrome/selectors';
import {
  addToastNotification,
  fetchFacilityDataRequest,
  fetchPracticeDataRequest,
  fetchProviderDataRequest,
  getLookupDropdownsRequest,
  setGlobalModal,
} from '@/store/shared/actions';
import {
  fetchInsuranceData,
  fetchPostingDate,
  fetchWriteOffData,
  getClaimRoute,
  saveWriteOffClaims,
} from '@/store/shared/sagas';
import {
  getAllInsuranceDataSelector,
  getFacilityDataSelector,
  getLookupDropdownsDataSelector,
  getPracticeDataSelector,
  getProviderDataSelector,
} from '@/store/shared/selectors';
import {
  type AllInsuranceData,
  type GroupData,
  type PostingDateCriteria,
  type PracticeData,
  type ProviderData,
  type SaveWriteOffCriteria,
  type SearchWriteOffCriteria,
  type SearchWriteOffResult,
  ToastType,
} from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';
import { DateToStringPipe } from '@/utils/dateConversionPipes';

const BulkWriteOffSearch = () => {
  const router = useRouter();
  const [writeOffJson, setWriteOffJson] = useState<{
    writeOffComments: string;
    postingDate: Date | null;
    depositDate: Date | null;
  }>({
    writeOffComments: '',
    postingDate: new Date(),
    depositDate: new Date(),
  });
  const practiceData = useSelector(getPracticeDataSelector);
  const providersData = useSelector(getProviderDataSelector);
  const [practiceDropdown, setPracticeDropdown] = useState<PracticeData[]>([]);
  const [providerDropdown, setProviderDropdown] = useState<ProviderData[]>([]);
  const [selectRows, setSelectRows] = useState<number[]>([]);
  const [showWarningModal, setWarningModal] = useState(false);
  const lookupsData = useSelector(getLookupDropdownsDataSelector);
  const facilitiesData = useSelector(getFacilityDataSelector);
  const [selectedClaimId, setSelectedClaimId] = useState<number>();
  const [showWriteOffModal, setShowWriteOffModal] = useState(false);
  const dispatch = useDispatch();
  const [hideSearchParameters, setHideSearchParameters] =
    useState<boolean>(true);
  const selectedWorkedGroup = useSelector(getselectdWorkGroupsIDsSelector);
  const [groupDropdown, setGroupDropdown] = useState<GroupData[]>([]);
  const [statusModalInfo, setStatusModalInfo] = useState({
    show: false,
    heading: '',
    text: '',
    type: StatusModalType.WARNING,
    showCloseBUtton: StatusModalType.WARNING,
  });
  const defaultSearchCriteria: SearchWriteOffCriteria = {
    groupID: null,
    pageNumber: 1,
    pageSize: globalPaginationConfig.activePageSize,
    claimType: 'primary',
    writeOffType: 'patient',
    sortByColumn: '',
    sortOrder: '',
  };
  const [lastSearchCriteria, setLastSearchCriteria] = useState(
    defaultSearchCriteria
  );
  const [searchCriteria, setSearchCriteria] = useState(defaultSearchCriteria);
  const [renderSearchCriteriaView, setRenderSearchCriteriaView] = useState(
    uuidv4()
  );
  const [searchResult, setSearchResult] = useState<SearchWriteOffResult[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const setSearchCriteriaFields = (value: SearchWriteOffCriteria) => {
    setSearchCriteria(value);
  };
  const insuranceData = useSelector(getAllInsuranceDataSelector);
  const [insuranceAllData, setInsuanceAllData] = useState<AllInsuranceData[]>(
    []
  );
  const handleInsuanceAllData = (groupID: number) => {
    setInsuanceAllData([...insuranceData.filter((m) => m.groupID === groupID)]);
  };
  const badgeClaimFromStatusClass = (claimStatusColor: string) => {
    if (claimStatusColor.includes('green')) {
      return 'bg-green-100 text-green-800 rounded-[2px]';
    }
    if (claimStatusColor.includes('red')) {
      return 'bg-red-100 text-red-800 rounded-[2px]';
    }
    if (claimStatusColor.includes('yellow')) {
      return 'bg-yellow-100 text-yellow-800 rounded-[2px]';
    }
    return 'bg-gray-100 text-gray-800 rounded-[2px]';
  };
  const badgeClaimFromStatusIcon = (claimStatusColor: string) => {
    if (claimStatusColor.includes('green')) {
      return IconColors.GREEN;
    }
    if (claimStatusColor.includes('red')) {
      return IconColors.RED;
    }
    if (claimStatusColor.includes('yellow')) {
      return IconColors.Yellow;
    }
    return IconColors.GRAY;
  };
  useEffect(() => {
    if (searchCriteria?.groupID) handleInsuanceAllData(searchCriteria?.groupID);
  }, [searchCriteria?.groupID, insuranceData]);
  const getSearchData = async (obj: SearchWriteOffCriteria) => {
    const res = await fetchWriteOffData(obj);
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
  const onSelectFacility = (value: SingleSelectDropDownDataType) => {
    const f = facilitiesData?.filter((m) => m.id === value.id)[0];
    if (f) {
      setSearchCriteriaFields({
        ...searchCriteria,
        facilityID: value.id,
        posID:
          lookupsData?.placeOfService.filter(
            (m) => m.id === f.placeOfServiceID
          )[0]?.id || undefined,
      });
    } else {
      setSearchCriteriaFields({
        ...searchCriteria,
        facilityID: value.id,
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
  const initProfile = () => {
    dispatch(getLookupDropdownsRequest());
    fetchInsuranceData();
  };
  useEffect(() => {
    initProfile();
  }, []);
  useEffect(() => {
    setPracticeDropdown(practiceData || []);
    setProviderDropdown(providersData || []);
  }, [practiceData, providersData]);
  useEffect(() => {
    const groupId = searchCriteria?.groupID;
    if (groupId) {
      setPracticeDropdown([]);
      setProviderDropdown([]);
      dispatch(fetchPracticeDataRequest({ groupID: groupId }));
      dispatch(fetchProviderDataRequest({ groupID: groupId }));
      dispatch(fetchFacilityDataRequest({ groupID: groupId }));
      setSelectRows([]);
    }
  }, [searchCriteria?.groupID]);
  const saveWriteOff = async (data: SaveWriteOffCriteria) => {
    setWarningModal(false);
    const res = await saveWriteOffClaims(data);
    if (!res) {
      setStatusModalInfo({
        ...statusModalInfo,
        show: true,
        heading: 'Error',
        type: StatusModalType.ERROR,
        text: 'A system error prevented the balance to be written-off. Please try again.',
      });
    } else {
      setShowWriteOffModal(false);
      setWriteOffJson({
        writeOffComments: '',
        postingDate: new Date(),
        depositDate: new Date(),
      });
      getSearchData(lastSearchCriteria);
      setSelectRows([]);
    }
  };
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
    const obj = {
      ...searchCriteria,
      sortColumn: '',
      sortOrder: '',
      pageNumber: 1,
      getAllData: true,
    };
    if (obj) {
      const res = await fetchWriteOffData(obj);
      if (res) {
        setSelectRows(res.map((m) => m.claimID));
      }
    }
  };
  const columns: GridColDef[] = [
    {
      ...GRID_CHECKBOX_SELECTION_COL_DEF,
      flex: 1,
      minWidth: 80,
    },
    {
      field: 'claimID',
      headerName: 'Claim ID',
      flex: 1,
      minWidth: 100,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-cyan-500 underline"
              onClick={async () => {
                if (params.value) {
                  const claimRoute = await getClaimRoute(Number(params.value));
                  if (claimRoute && claimRoute.screen) {
                    router.push(`/app/claim-detail/${params.value}`);
                  }
                }
              }}
            >
              {`#${params.value}` || ''}
            </div>
          </div>
        );
      },
    },
    {
      field: 'group',
      headerName: 'Group',
      flex: 1,
      minWidth: 240,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-cyan-500 underline"
              onClick={() => {}}
            >
              {params.value || ''}
            </div>
            <div>{params.row.groupEIN || ''}</div>
          </div>
        );
      },
    },
    {
      field: 'practice',
      headerName: 'Practice',
      flex: 1,
      minWidth: 300,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-cyan-500 underline"
              onClick={() => {}}
            >
              {params.value || ''}
            </div>
            <div>{params.row.practiceAddress || ''}</div>
          </div>
        );
      },
    },
    {
      field: 'patient',
      headerName: 'Patient',
      flex: 1,
      minWidth: 160,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-cyan-500 underline"
              onClick={() => {
                // router.push(`/app/register-patient/${params.row.patientID}`);
                dispatch(
                  setGlobalModal({
                    type: 'Patient Detail',
                    id: params.row.patientID,
                    isPopup: true,
                  })
                );
              }}
            >
              {params.value || ''}
            </div>
          </div>
        );
      },
    },
    {
      field: 'fromDOS',
      headerName: 'DoS',
      flex: 1,
      minWidth: 140,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            {params.value} {params.row.fromDOS ? `- ${params.row.toDOS}` : ''}
          </div>
        );
      },
    },
    {
      field: 'claimStatus',
      headerName: 'Claim Status',
      flex: 1,
      minWidth: 230,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <Badge
              cls={badgeClaimFromStatusClass(params.row.claimStatusColor || '')}
              text={params.value || ''}
              icon={
                <Icon
                  name={'desktop'}
                  color={badgeClaimFromStatusIcon(
                    params.row.claimStatusColor || ''
                  )}
                />
              }
            />
          </div>
        );
      },
    },
    {
      field: 'fee',
      headerName: 'Fee',
      flex: 1,
      minWidth: 100,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col" onClick={() => {}}>
            ${params.value?.toFixed(2) || ''}
          </div>
        );
      },
    },
    {
      field: 'insuranceAmount',
      headerName: 'Ins. Amount',
      flex: 1,
      minWidth: 100,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">${params.value?.toFixed(2) || ''}</div>
        );
      },
    },
    {
      field: 'insurancePaid',
      headerName: 'Ins. Paid',
      flex: 1,
      minWidth: 100,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">${params.value?.toFixed(2) || ''}</div>
        );
      },
    },
    {
      field: 'insuranceAdjustment',
      headerName: 'Ins. Adj',
      flex: 1,
      minWidth: 100,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">${params.value?.toFixed(2) || ''}</div>
        );
      },
    },
    {
      field: 'insuranceBalance',
      headerName: 'Ins. Bal.',
      flex: 1,
      minWidth: 100,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">${params.value?.toFixed(2) || ''}</div>
        );
      },
    },
    {
      field: 'patientAmount',
      headerName: 'Pat. Amount',
      flex: 1,
      minWidth: 100,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">${params.value?.toFixed(2) || ''}</div>
        );
      },
    },
    {
      field: 'patientPaid',
      headerName: 'Pat. Paid',
      flex: 1,
      minWidth: 100,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">${params.value?.toFixed(2) || ''}</div>
        );
      },
    },
    {
      field: 'patientDiscount',
      headerName: 'Pat. Disc.',
      flex: 1,
      minWidth: 100,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">${params.value?.toFixed(2) || ''}</div>
        );
      },
    },
    {
      field: 'patientBalance',
      headerName: 'Pat. Bal.',
      flex: 1,
      minWidth: 100,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">${params.value?.toFixed(2) || ''}</div>
        );
      },
    },
    {
      field: 'claimBalance',
      headerName: 'Claim Bal.',
      flex: 1,
      minWidth: 100,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">${params.value?.toFixed(2) || ''}</div>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 220,
      disableReorder: true,
      headerClassName: '!bg-cyan-100 !text-center ',
      cellClassName: '!bg-cyan-50',
      renderCell: (params) => {
        return (
          <Button
            buttonType={ButtonType.primary}
            disabled={!!selectRows.length}
            fullWidth={true}
            cls={
              'ml-[8px] w-[165px] h-[38px] inline-flex !justify-center gap-2 leading-loose '
            }
            style={{ verticalAlign: 'middle' }}
            onClick={() => {
              setSelectRows([]);
              if (selectRows.length === 0) {
                setShowWriteOffModal(true);
                setSelectedClaimId(params.row.claimID);
              }
            }}
          >
            <Icon name={'writeOff'} size={20} />
            <p
              data-testid="bulkWriteoffRecordBtn"
              className="text-justify text-sm"
            >
              Write-Off
            </p>
          </Button>
        );
      },
    },
  ];
  useEffect(() => {
    setGroupDropdown(selectedWorkedGroup?.groupsData || []);
    setSearchCriteria({
      ...searchCriteria,
      groupID: selectedWorkedGroup?.groupsData[0]?.id || 0,
    });
  }, [selectedWorkedGroup]);
  return (
    <AppLayout title="Nucleus - Bulk Write-Off">
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
                        <p className="self-center text-3xl font-bold text-cyan-600">
                          Bulk Write-Off
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
                      addNewButtonActive={true}
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
                          Location
                        </p>
                      </div>
                      <div className="flex w-full flex-wrap">
                        <div className={`lg:w-[80%] w-[50%] px-[5px] flex`}>
                          <div className={`w-[25%] pr-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
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
                                  isOptional={true}
                                  onDeselectValue={() => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      groupID: null,
                                    });
                                  }}
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
                          <div className={`w-[25%] pl-[5px]`}>
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
                          <div className={`w-[25%] pl-[10px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Facility
                              </div>
                              <div className="w-full">
                                <SingleSelectDropDown
                                  placeholder="-"
                                  disabled={false}
                                  data={
                                    facilitiesData?.length !== 0
                                      ? (facilitiesData as SingleSelectDropDownDataType[])
                                      : [
                                          {
                                            id: 1,
                                            value: 'No Record Found',
                                            active: false,
                                          },
                                        ]
                                  }
                                  selectedValue={
                                    facilitiesData?.filter(
                                      (f) => f.id === searchCriteria?.facilityID
                                    )[0]
                                  }
                                  onSelect={(value) => {
                                    onSelectFacility(value);
                                  }}
                                  isOptional={true}
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
                          <div className={`w-[25%] pl-[10px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Place of Service
                              </div>
                              <div className="w-full">
                                <SingleSelectDropDown
                                  placeholder="-"
                                  disabled={false}
                                  data={lookupsData?.placeOfService || []}
                                  selectedValue={
                                    lookupsData?.placeOfService.filter(
                                      (f) => f.id === searchCriteria?.posID
                                    )[0]
                                  }
                                  onSelect={(value) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      posID: value.id,
                                    });
                                  }}
                                  isOptional={true}
                                  onDeselectValue={() => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      posID: undefined,
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
                          Claim Details
                        </p>
                      </div>
                      <div className="flex w-full flex-wrap">
                        <div className={`lg:w-[90%] w-[50%] px-[5px] flex`}>
                          <div className={`w-[25%] pr-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Claim ID
                              </div>
                              <div className="w-full">
                                <InputField
                                  placeholder="Claim ID"
                                  value={searchCriteria?.claimID || ''}
                                  onChange={(evt) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      claimID: evt.target.value
                                        ? Number(evt.target.value)
                                        : undefined,
                                    });
                                  }}
                                  type={'number'}
                                />
                              </div>
                            </div>
                          </div>
                          <div className={`w-[25%] pl-[5px] pr-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Claim Status
                              </div>
                              <div className="w-full">
                                <SingleSelectDropDown
                                  placeholder="-"
                                  disabled={false}
                                  data={lookupsData?.claimStatus || []}
                                  selectedValue={
                                    lookupsData?.claimStatus.filter(
                                      (a) => a.id === searchCriteria.claimStatus
                                    )[0]
                                  }
                                  onSelect={(value) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      claimStatus: value.id,
                                    });
                                  }}
                                  isOptional={true}
                                  onDeselectValue={() => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      claimStatus: undefined,
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className={`lg:w-[35%] w-[50%] px-[5px] flex`}>
                            <div className={`w-[50%] pr-[5px]`}>
                              <div
                                className={`w-full items-start self-stretch`}
                              >
                                <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                  Date of Service - From
                                </div>
                                <div className="w-full">
                                  <AppDatePicker
                                    cls="!mt-1"
                                    selected={searchCriteria?.fromDOS}
                                    onChange={(value) => {
                                      setSearchCriteriaFields({
                                        ...searchCriteria,
                                        fromDOS: value,
                                      });
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className={`w-[50%] pl-[5px]`}>
                              <div
                                className={`w-full items-start self-stretch`}
                              >
                                <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                  Date of Service - To
                                </div>
                                <div className="w-full">
                                  <AppDatePicker
                                    cls="!mt-1"
                                    selected={searchCriteria?.toDOS}
                                    onChange={(value) => {
                                      setSearchCriteriaFields({
                                        ...searchCriteria,
                                        toDOS: value,
                                      });
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className={`lg:w-[28%] w-[50%] px-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Claim Type
                              </div>
                              <div className="mt-[4px]  flex h-[38px] w-full items-center">
                                <RadioButton
                                  data={[
                                    { value: 'primary', label: 'Primary' },
                                    { value: 'secondary', label: 'Secondary+' },
                                    { value: '', label: 'Both' },
                                  ]}
                                  checkedValue={searchCriteria?.claimType || ''}
                                  onChange={(e) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      claimType: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex w-full flex-wrap">
                        <div className={`lg:w-[50%] w-[50%] px-[3px] flex`}>
                          <div className={`lg:w-[40%] w-[50%] px-[3px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Balance Amount Greater or Equal to
                              </div>
                              <div className="w-full">
                                <InputField
                                  placeholder="-"
                                  value={searchCriteria.fromBalanceAmount || ''}
                                  onChange={(e) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      fromBalanceAmount:
                                        e.target.value !== ''
                                          ? Number(e.target.value)
                                          : undefined,
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className={`w-[40%] pl-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Balance Amount Less or Equal to
                              </div>
                              <div className="w-full">
                                <InputField
                                  placeholder="-"
                                  value={searchCriteria.toBalanceAmount || ''}
                                  onChange={(e) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      toBalanceAmount:
                                        e.target.value !== ''
                                          ? Number(e.target.value)
                                          : undefined,
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
                          Payor Details
                        </p>
                      </div>
                      <div className="flex w-full flex-wrap">
                        <div className={`lg:w-[100%] w-[50%] px-[5px] flex`}>
                          <div className={`w-[20%] pr-[10px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Patient First Name
                              </div>
                              <div className="w-full">
                                <InputField
                                  placeholder="Patient First Name"
                                  value={searchCriteria?.firstName || ''}
                                  onChange={(evt) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      firstName: evt.target.value,
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className={`w-[20%] pr-[10px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Patient Last Name
                              </div>
                              <div className="w-full">
                                <InputField
                                  placeholder="Patient Last Name"
                                  value={searchCriteria?.lastName || ''}
                                  onChange={(evt) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      lastName: evt.target.value,
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className={`w-[20%] pr-[5px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Patient ID
                              </div>
                              <div className="w-full">
                                <InputField
                                  placeholder="Patient ID"
                                  value={searchCriteria?.patientID || ''}
                                  onChange={(evt) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      patientID: evt.target.value
                                        ? Number(evt.target.value)
                                        : undefined,
                                    });
                                  }}
                                  type="number"
                                />
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
                          <div className={`w-[20%] pl-[10px]`}>
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Insurance
                              </div>
                              <div className="w-full">
                                <SingleSelectDropDown
                                  placeholder="-"
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
                          <div
                            className={`lg:w-[20%] w-[50%] px-[5px] pl-[15px]`}
                          >
                            <div className={`w-full items-start self-stretch`}>
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                Claim Type
                              </div>
                              <div className="mt-[4px]  flex h-[38px] w-full items-center">
                                <RadioButton
                                  data={[
                                    { value: 'patient', label: 'Patient' },
                                    { value: 'insurance', label: 'Insurance' },
                                  ]}
                                  checkedValue={
                                    searchCriteria?.writeOffType || ''
                                  }
                                  onChange={(e) => {
                                    setSearchCriteriaFields({
                                      ...searchCriteria,
                                      writeOffType: e.target.value,
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
                          Provider Details
                        </p>
                      </div>
                      <div className="flex w-full flex-wrap">
                        <div className={`lg:w-[23%] w-[50%] px-[3px]`}>
                          <div className={`w-full items-start self-stretch`}>
                            <div className={`w-[85%] pl-[3px]`}>
                              <div
                                className={`w-full items-start self-stretch`}
                              >
                                <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                  Provider
                                </div>
                                <div className="w-full">
                                  <SingleSelectDropDown
                                    placeholder="-"
                                    disabled={false}
                                    data={providerDropdown}
                                    isOptional={true}
                                    onDeselectValue={() => {
                                      setSearchCriteriaFields({
                                        ...searchCriteria,
                                        providerID: undefined,
                                      });
                                    }}
                                    selectedValue={
                                      providerDropdown.filter(
                                        (f) =>
                                          f.id === searchCriteria?.providerID
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
                      <p
                        data-testid="seachBulkWriteoffBtn"
                        className="text-sm font-medium leading-tight text-white"
                      >
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

              <div className="flex w-full w-full flex-col gap-4 p-5 pb-[80px] pt-[20px]">
                <div className="h-full">
                  <SearchDetailGrid
                    selectRows={selectRows}
                    onSelectAllClick={onSelectAll}
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
                    pageNumber={lastSearchCriteria.pageNumber}
                    pageSize={lastSearchCriteria.pageSize}
                    pinnedColumns={{
                      right: ['actions'],
                    }}
                    persistLayoutId={12}
                    totalCount={totalCount}
                    rows={
                      searchResult.map((row) => {
                        return { ...row, id: row.claimID };
                      }) || []
                    }
                    columns={columns}
                    checkboxSelection={true}
                    onPageChange={(page: number) => {
                      const obj: SearchWriteOffCriteria = {
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
                        const obj: SearchWriteOffCriteria = {
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
                        const obj: SearchWriteOffCriteria = {
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
              <div
                className={`h-[86px] bg-gray-200 w-full absolute bottom-0 z-[1]`}
              >
                <div className="flex flex-row-reverse gap-4 p-6 ">
                  <div>
                    <Button
                      buttonType={ButtonType.primary}
                      disabled={!selectRows.length}
                      onClick={async () => {
                        setSelectedClaimId(undefined);
                        setShowWriteOffModal(true);
                      }}
                    >
                      Write-Off ({selectRows.length}) Selected Claims
                    </Button>
                  </div>
                  <div>
                    <Button
                      buttonType={ButtonType.secondary}
                      cls={`w-[102px]`}
                      onClick={() => {
                        setSelectRows([]);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal
        open={showWriteOffModal}
        onClose={() => {}}
        modalContentClassName="relative w-[60%] overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 w-full"
      >
        <div className="flex flex-col bg-gray-100">
          <div className="mt-3 max-w-full py-4 px-6">
            <div className="flex flex-row justify-between">
              <div>
                <h1 className=" text-left  text-xl font-bold leading-7 text-gray-700">
                  {searchCriteria?.writeOffType
                    ? searchCriteria.writeOffType.charAt(0).toUpperCase() +
                      searchCriteria.writeOffType.slice(1)
                    : ''}
                  &nbsp;Balance Write-Off{' '}
                  {selectRows.length > 0 ? `-${selectRows.length} Claims` : ''}
                </h1>
              </div>
              <div className="">
                <CloseButton
                  onClick={() => {
                    setShowWriteOffModal(false);
                    setWriteOffJson({
                      writeOffComments: '',
                      postingDate: new Date(),
                      depositDate: new Date(),
                    });
                  }}
                />
              </div>
            </div>
            <div className="mt-3 h-px w-full bg-gray-300" />
          </div>
          <div className="flex flex-col">
            <div className=" px-6 pt-4">
              <div className={` `}>
                <div className={`   `}>
                  <div>
                    <div className="flex gap-3">
                      <div className="flex w-[25%] shrink flex-col items-start  text-left">
                        <div className=" inline-flex items-start justify-start space-x-1">
                          <label className="text-sm font-medium leading-5 text-gray-700">
                            Posting Date
                            <span style={{ color: '#007BFF' }}>*</span>
                          </label>
                          <InfoToggle position="right" text="" />
                        </div>
                        <div className="datePickerInModal w-full">
                          <AppDatePicker
                            testId="bulkWriteoffPostingDate"
                            cls="!mt-1"
                            selected={writeOffJson?.postingDate}
                            onChange={(value) => {
                              setWriteOffJson({
                                ...writeOffJson,
                                postingDate: value,
                              });
                            }}
                          />
                        </div>
                      </div>
                      <div className="ml-3 flex w-[25%] shrink flex-col items-start gap-1 text-left">
                        <div className=" inline-flex items-start justify-start space-x-1">
                          <label className="text-sm font-medium leading-5 text-gray-700">
                            Deposit Date
                            <span style={{ color: '#007BFF' }}>*</span>
                          </label>
                          <InfoToggle
                            // openToggle={undefined}
                            position="right"
                            text=""
                          />
                        </div>
                        <div className="datePickerInModal w-full">
                          <AppDatePicker
                            cls="!mt-1"
                            selected={writeOffJson?.depositDate}
                            onChange={(value) => {
                              setWriteOffJson({
                                ...writeOffJson,
                                depositDate: value,
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
          <div className="py-2 px-6">
            <div className="mt-3 h-px w-full bg-gray-300" />
          </div>
          <div className="flex flex-col p-4 px-6">
            <div className="mb-3">
              <label className="flex text-sm  font-bold leading-5 text-gray-700">
                Why are you writing-off these balances?
                <span style={{ color: '#007BFF' }}>*</span>
              </label>
            </div>
            <div data-testid="bulkWriteModelText">
              <TextArea
                value={writeOffJson.writeOffComments || ''}
                cls=" flex h-36 flex-col overflow-y-auto rounded-md  border border-gray-300 bg-white"
                placeholder={'Click here to write note'}
                onChange={(e) => {
                  setWriteOffJson({
                    ...writeOffJson,
                    writeOffComments: e.target.value,
                  });
                }}
              />
            </div>
          </div>
          <div className={`h-[86px] bg-gray-200 w-full`}>
            <div className="flex flex-row-reverse gap-4 p-6 ">
              <div>
                <Button
                  data-testid="bulkModelConfirmBtn"
                  buttonType={ButtonType.primary}
                  onClick={async () => {
                    const postingDateCriteria: PostingDateCriteria = {
                      id: selectedClaimId,
                      type: 'claim',
                      postingDate: DateToStringPipe(
                        writeOffJson.postingDate,
                        1
                      ),
                    };
                    const res = await fetchPostingDate(postingDateCriteria);
                    if (res && res.postingCheck === false) {
                      setStatusModalInfo({
                        ...statusModalInfo,
                        show: true,
                        heading: 'Error',
                        text: `${res.message}`,
                        type: StatusModalType.ERROR,
                      });
                      return;
                    }
                    setWarningModal(true);
                  }}
                >
                  Confirm
                </Button>
              </div>
              <div>
                <Button
                  buttonType={ButtonType.secondary}
                  cls={`w-[102px]`}
                  onClick={() => {
                    setShowWriteOffModal(false);
                    setWriteOffJson({
                      writeOffComments: '',
                      postingDate: new Date(),
                      depositDate: new Date(),
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
      <StatusModal
        open={showWarningModal}
        heading={'Write-Off Balance Confirmation'}
        description={
          'This action will cause the selected claims to be closed and archived. Are you sure you want to proceed with writing-off one or multiple balances?'
        }
        okButtonText={'Yes, Write-Off'}
        closeButtonText={'Cancel'}
        okButtonColor={ButtonType.tertiary}
        statusModalType={StatusModalType.WARNING}
        showCloseButton={true}
        closeOnClickOutside={false}
        onClose={() => {
          setWarningModal(false);
        }}
        onChange={async () => {
          if (
            writeOffJson.depositDate === null ||
            writeOffJson.postingDate === null ||
            writeOffJson.writeOffComments === ''
          ) {
            setStatusModalInfo({
              ...statusModalInfo,
              show: true,
              heading: 'Alert',
              type: StatusModalType.WARNING,
              text: 'This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.',
            });
            return;
          }
          if (selectedClaimId) {
            const obj: SaveWriteOffCriteria = {
              claimIDS: selectedClaimId.toString(),
              writeOffComments: writeOffJson.writeOffComments,
              postingDate: DateToStringPipe(writeOffJson.postingDate, 1),
              depositDate: DateToStringPipe(writeOffJson.depositDate, 1),
              writeOffType: searchCriteria.writeOffType || '',
            };
            saveWriteOff(obj);
          }
          if (selectRows.length > 0) {
            const obj: SaveWriteOffCriteria = {
              claimIDS: selectRows.toString(),
              writeOffComments: writeOffJson.writeOffComments,
              postingDate: DateToStringPipe(writeOffJson.postingDate, 1),
              depositDate: DateToStringPipe(writeOffJson.depositDate, 1),
              writeOffType: searchCriteria.writeOffType || '',
            };
            saveWriteOff(obj);
          }
        }}
      />
    </AppLayout>
  );
};
export default BulkWriteOffSearch;
