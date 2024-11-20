import type { GridColDef, GridColTypeDef } from '@mui/x-data-grid-pro';
import { GRID_CHECKBOX_SELECTION_COL_DEF } from '@mui/x-data-grid-pro';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import Icon from '@/components/Icon';
import SavedSearchCriteria from '@/components/PatientSearch/SavedSearchCriteria';
import AppDatePicker from '@/components/UI/AppDatePicker';
import Button, { ButtonType } from '@/components/UI/Button';
import ButtonsGroup from '@/components/UI/ButtonsGroup';
// eslint-disable-next-line import/no-cycle
import { ViewChargeDetails } from '@/components/UI/ChargeDetail/view-charge-detail';
import CloseButton from '@/components/UI/CloseButton';
import InputField from '@/components/UI/InputField';
import Modal from '@/components/UI/Modal';
import type { MultiSelectGridDropdownDataType } from '@/components/UI/MultiSelectGridDropdown';
// eslint-disable-next-line import/no-cycle
import PaymentPosting from '@/components/UI/PaymentPosting';
import RadioButton from '@/components/UI/RadioButton';
import SearchDetailGrid, {
  globalPaginationConfig,
} from '@/components/UI/SearchDetailGrid';
import type { SingleSelectDropDownDataType } from '@/components/UI/SingleSelectDropDown';
import SingleSelectDropDown from '@/components/UI/SingleSelectDropDown';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import { getselectdWorkGroupsIDsSelector } from '@/store/chrome/selectors';
import {
  fetchChargesData,
  getClaimDetailSummaryById,
  linkPaymentPosting,
} from '@/store/shared/sagas';
import type {
  GetChargesDataCriterea,
  GetChargesDataResult,
  GroupData,
  LinkPaymentPostingCriterea,
} from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';

import type { IcdData } from '../createClaim';

interface PaymentPostingProp {
  claimID: number;
  groupID: number;
  patientID: number;
  chargeID: number;
  patientPosting?: boolean;
}

export interface ChargesSearchModalParamsT {
  procedureCode: string;
  patientFirstName: string;
  patientLastName: string;
  fromDOS: Date | null;
  toDOS: Date | null;
}

interface TProps {
  open: boolean;
  id?: number;
  type: string;
  inputs: ChargesSearchModalParamsT;
  hideBackdrop?: boolean;
  onClose: (isAction?: string) => void;
}

const ChargesSearchModal = ({
  open,
  id,
  type,
  inputs,
  hideBackdrop = true,
  onClose,
}: TProps) => {
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
  const [groupDropdown, setGroupDropdown] = useState<GroupData[]>([]);
  const [hideSearchParameters, setHideSearchParameters] =
    useState<boolean>(true);
  const [isChangedJson, setIsChangedJson] = useState(false);
  const [selectRows, setSelectRows] = useState<number[]>([]);
  const [statusModalInfo, setStatusModalInfo] = useState({
    show: false,
    heading: '',
    text: '',
    type: StatusModalType.WARNING,
  });
  const defaultSearchCriteria: GetChargesDataCriterea = {
    userID: '',
    claimID: '',
    chargeID: '',
    patientID: '',
    patientFirstName: '',
    patientLastName: '',
    referringProvider: '',
    procedureCode: '',
    getOnlyIDS: false,
    responsibility: null,
    sortByColom: '',
    sortOrder: '',
    pageNumber: 1,
    pageSize: globalPaginationConfig.activePageSize,
  };
  const [lastSearchCriteria, setLastSearchCriteria] = useState(
    defaultSearchCriteria
  );
  const [searchCriteria, setSearchCriteria] = useState(defaultSearchCriteria);
  const [searchResult, setSearchResult] = useState<GetChargesDataResult[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [paymentPostingInfo, setPaymentPostingInfo] =
    useState<PaymentPostingProp>();

  const setSearchCriteriaFields = (value: GetChargesDataCriterea) => {
    setSearchCriteria(value);
    setIsChangedJson(true);
  };

  const getSearchData = async (obj: GetChargesDataCriterea) => {
    const res = await fetchChargesData(obj);
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

  useEffect(() => {
    setGroupDropdown(selectedWorkedGroup?.groupsData || []);
    const obj = {
      ...searchCriteria,
      ...inputs,
      groupID: selectedWorkedGroup?.groupsData[0]?.id,
    };
    setSearchCriteriaFields(obj);
    getSearchData(obj);
  }, [selectedWorkedGroup]);

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

  const linkPayment = async () => {
    const obj = searchResult.filter((f) => f.id === selectRows[0])[0];
    if (obj && id) {
      const cri: LinkPaymentPostingCriterea = {
        id,
        claimID: obj.claimID,
        chargeID: obj.chargeID,
        patientID: obj.patientID,
      };
      const res = await linkPaymentPosting(cri);
      if (res?.pkid === 1) {
        onClose('isLinked');
      } else {
        setStatusModalInfo({
          show: true,
          heading: 'Error',
          text: 'A system error prevented the charge to be linked.\nPlease try again.',
          type: StatusModalType.ERROR,
        });
      }
    }
  };

  const postPayment = async () => {
    const obj = searchResult.filter((f) => f.id === selectRows[0])[0];
    if (obj) {
      setPaymentPostingInfo({
        claimID: obj.claimID,
        groupID: obj.groupID || 0,
        patientID: obj.patientID || 0,
        chargeID: obj.chargeID || 0,
      });
    }
  };

  const priorityOrderRender = (n: number | undefined) => {
    return (
      <div
        className={`relative mr-3 h-5 w-5 text-clip rounded bg-[rgba(6,182,212,1)] text-left font-['Nunito'] font-semibold text-white [box-shadow-width:1px] [box-shadow:0px_0px_0px_1px_rgba(6,_182,_212,_1)_inset]`}
      >
        <p className="absolute left-1.5 top-0.5 m-0 text-xs leading-4">{n}</p>
      </div>
    );
  };
  const [icdRows, setIcdRows] = useState<IcdData[]>([]);
  const [openChargeStatusModal, setOpenChargeStatusModal] = useState(false);
  const [chargeModalInfo, setChargeModalInfo] = useState({
    chargeID: 0,
    patientID: 0,
  });

  const getClaimSummaryData = async (claimId: number) => {
    const res = await getClaimDetailSummaryById(claimId);
    if (res) {
      const icdsRows = res.icds?.map((m) => {
        return {
          icd10Code: m.code,
          order: m.order,
          description: m.description,
          selectedICDObj: { id: m.id, value: m.code },
        };
      });
      setIcdRows(icdsRows);
      setOpenChargeStatusModal(true);
    }
  };
  // const dispatch = useDispatch();
  const columns: GridColDef[] = [
    {
      ...GRID_CHECKBOX_SELECTION_COL_DEF,
      flex: 1,
      minWidth: 80,
      renderHeader: () => {
        return <></>;
      },
    },
    {
      field: 'claimID',
      headerName: 'Claim ID',
      flex: 1,
      minWidth: 110,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-cyan-500"
            onClick={() => {
              window.open(`/app/claim-detail/${params.value}`, '_blank');
            }}
          >
            {`#${params.value}`}
          </div>
        );
      },
    },
    {
      field: 'chargeID',
      headerName: 'Charge ID',
      flex: 1,
      minWidth: 110,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-cyan-500"
            onClick={() => {
              setChargeModalInfo({
                chargeID: params.value,
                patientID: params.row.patientID,
              });
              getClaimSummaryData(params.row.claimID);
            }}
          >
            {`#${params.value}`}
          </div>
        );
      },
    },
    {
      field: 'cpt',
      headerName: 'CPT Code',
      flex: 1,
      minWidth: 110,
      disableReorder: true,
    },
    {
      field: 'patientID',
      headerName: 'Patient ID',
      flex: 1,
      minWidth: 110,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-cyan-500"
            onClick={() => {
              // window.open(`/app/register-patient/${params.value}`, '_blank');
              // dispatch(
              //   setGlobalModal({
              //     type: 'Patient Detail',
              //     id: params.value,
              //     isPopup: true,
              //   })
              // );
            }}
          >
            {`#${params.value}`}
          </div>
        );
      },
    },
    {
      field: 'patient',
      headerName: 'Patient Name',
      flex: 1,
      minWidth: 160,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="cursor-pointer text-cyan-500" onClick={() => {}}>
            {`${params.value}`}
          </div>
        );
      },
    },
    {
      field: 'dos',
      headerName: 'DoS',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'fee',
      headerName: 'Fee',
      ...usdPrice,
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'insuranceAmount',
      headerName: 'Ins. Amount',
      ...usdPrice,
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'insurancePaid',
      headerName: 'Ins. Paid',
      ...usdPrice,
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'insuranceAdjustment',
      headerName: 'Ins. Adj,',
      ...usdPrice,
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'insuranceBalance',
      headerName: 'Ins. Bal.',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
      renderCell: (params) => {
        const BalanceCardBackgroundColor = () => {
          if (params.value > 0) {
            return 'text-red-500';
          }
          if (params.value === 0) {
            return 'text-green-500';
          }
          return 'text-yellow-500';
        };

        return (
          <div className={BalanceCardBackgroundColor()}>
            {currencyFormatter.format(
              params.value * (params.value < 0 ? -1 : 1)
            )}
          </div>
        );
      },
    },
    {
      field: 'patientAmount',
      headerName: 'Pat. Amount',
      ...usdPrice,
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'patientPaid',
      headerName: 'Pat. Paid',
      ...usdPrice,
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'patientDiscount',
      headerName: 'Pat. Disc.',
      ...usdPrice,
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'patientBalance',
      headerName: 'Pat. Bal.',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
      renderCell: (params) => {
        const BalanceCardBackgroundColor = () => {
          if (params.value > 0) {
            return 'text-red-500';
          }
          if (params.value === 0) {
            return 'text-green-500';
          }
          return 'text-yellow-500';
        };

        return (
          <div className={BalanceCardBackgroundColor()}>
            {currencyFormatter.format(
              params.value * (params.value < 0 ? -1 : 1)
            )}
          </div>
        );
      },
    },
    {
      field: 'totalBalance',
      headerName: 'Claim Bal.',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
      renderCell: (params) => {
        const BalanceCardBackgroundColor = () => {
          if (params.value > 0) {
            return 'text-red-500';
          }
          if (params.value === 0) {
            return 'text-green-500';
          }
          return 'text-yellow-500';
        };

        return (
          <div className={BalanceCardBackgroundColor()}>
            {currencyFormatter.format(
              params.value * (params.value < 0 ? -1 : 1)
            )}
          </div>
        );
      },
    },
    {
      field: 'group',
      headerName: 'Group',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="cursor-pointer text-cyan-500" onClick={() => {}}>
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
      field: 'practice',
      headerName: 'Practice',
      flex: 1,
      minWidth: 200,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="cursor-pointer text-cyan-500" onClick={() => {}}>
              {params.value}
            </div>
            <div className="text-xs font-normal leading-4">
              {params.row.practiceAddress
                ? `${params.row.practiceAddress}`
                : ''}
            </div>
          </div>
        );
      },
    },
    {
      field: 'pos',
      headerName: 'PoS',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'provider',
      headerName: 'Provider',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="cursor-pointer text-cyan-500" onClick={() => {}}>
              {params.value}
            </div>
            <div className="text-xs font-normal leading-4">
              {params.row.providerNPI ? `NPI: ${params.row.providerNPI}` : ''}
            </div>
          </div>
        );
      },
    },
  ];

  const onPressClose = () => {
    onClose();
  };
  return (
    <Modal
      open={open}
      onClose={() => {}}
      modalContentClassName="h-[calc(100%-80px)] w-[calc(100%-220px)] relative rounded-lg bg-white shadow-xl transition-all sm:my-8"
      modalBackgroundClassName={'!overflow-hidden'}
      modalClassName={'!z-[13]'}
      //! z-[2]
      hideBackdrop={hideBackdrop}
    >
      <div className="flex h-full w-full flex-col items-center justify-start overflow-hidden rounded-lg bg-white shadow">
        <div className="flex w-full flex-col items-start justify-start px-6 py-4">
          <div className="inline-flex w-full items-center justify-between">
            <div className="flex items-center justify-start space-x-2">
              <p className="text-xl font-bold leading-7 text-cyan-600">
                Charges Search
              </p>
            </div>
            <div className="inline-flex items-center gap-4">
              <ButtonsGroup
                data={[
                  { id: 1, name: 'Print', icon: 'print' },
                  { id: 2, name: 'Export', icon: 'export' },
                ]}
                onClick={() => {}}
              />
              <CloseButton onClick={onPressClose} />
            </div>
          </div>
        </div>
        <div className={'w-full px-6'}>
          <div className={`h-[1px] w-full bg-gray-300`} />
        </div>
        <div className="m-0 h-full w-full overflow-y-auto bg-gray-100 p-0">
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
                  moduleUrl="/searchmodallinkchargetoera"
                  addNewButtonActive={isChangedJson}
                />
              </div>
            </div>
            <div className={`px-[5px]`}>
              <div className={`h-[1px] w-full bg-gray-200`} />
            </div>
            {hideSearchParameters && (
              <div className="pt-[20px]">
                <div className="flex flex-wrap">
                  <div className="md:w-[50%] lg:w-[25%]">
                    <div className="flex items-start px-[5px] pb-[5px]">
                      <p className="text-base font-bold leading-normal text-gray-700">
                        Location
                      </p>
                    </div>
                    <div className="flex w-full flex-wrap">
                      <div className={`w-[100%] px-[5px]`}>
                        <div
                          className={`w-full items-start self-stretch flex flex-col flex flex-col`}
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
                                });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={'min-w-[1%] px-[15px] md:hidden lg:block'}>
                    <div className={`w-[1px] h-full bg-gray-200`} />
                  </div>
                  <div className="md:w-[100%] lg:flex-1">
                    <div className="flex items-start px-[5px] pb-[5px]">
                      <p className="text-base font-bold leading-normal text-gray-700">
                        Claim Details
                      </p>
                    </div>
                    <div className="flex w-full flex-wrap">
                      <div className={`lg:w-[20%] md:w-[50%] px-[5px]`}>
                        <div
                          className={`w-full items-start self-stretch flex flex-col`}
                        >
                          <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                            Claim ID
                          </div>
                          <div className="w-full">
                            <InputField
                              placeholder="Claim ID"
                              value={searchCriteria?.claimID}
                              onChange={(evt) => {
                                setSearchCriteriaFields({
                                  ...searchCriteria,
                                  claimID: evt.target.value,
                                });
                              }}
                              type={'number'}
                            />
                          </div>
                        </div>
                      </div>
                      <div className={`lg:w-[20%] md:w-[50%] px-[5px]`}>
                        <div
                          className={`w-full items-start self-stretch flex flex-col`}
                        >
                          <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                            CPT Code
                          </div>
                          <div className="w-full">
                            <InputField
                              placeholder="CPT Code"
                              value={searchCriteria?.procedureCode}
                              onChange={(evt) => {
                                setSearchCriteriaFields({
                                  ...searchCriteria,
                                  procedureCode: evt.target.value,
                                });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className={`lg:w-[20%] md:w-[50%] px-[5px]`}>
                        <div
                          className={`w-full items-start self-stretch flex flex-col`}
                        >
                          <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                            Charge ID
                          </div>
                          <div className="w-full">
                            <InputField
                              placeholder="Charge ID"
                              value={searchCriteria?.chargeID}
                              onChange={(evt) => {
                                setSearchCriteriaFields({
                                  ...searchCriteria,
                                  chargeID: evt.target.value,
                                });
                              }}
                              type={'number'}
                            />
                          </div>
                        </div>
                      </div>
                      <div className={`lg:w-[20%] md:w-[50%] px-[5px]`}>
                        <div className="flex w-full flex-wrap">
                          <div className={`lg:w-[100%] md:w-[100%] px-[5px]`}>
                            <div
                              className={`w-full items-start self-stretch flex flex-col`}
                            >
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                DoS - From
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
                        </div>
                      </div>
                      <div className={`lg:w-[20%] md:w-[50%] px-[5px]`}>
                        <div className="flex w-full flex-wrap">
                          <div className={`lg:w-[100%] md:w-[100%] px-[5px]`}>
                            <div
                              className={`w-full items-start self-stretch flex flex-col`}
                            >
                              <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                                DoS - To
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
                      </div>
                    </div>
                  </div>
                </div>
                <div className={'py-[15px] px-[5px]'}>
                  <div className={`h-[1px] w-full bg-gray-200`} />
                </div>
                <div className="w-full">
                  <div className="flex items-start px-[5px] pb-[5px]">
                    <p className="text-base font-bold leading-normal text-gray-700">
                      Payor Details
                    </p>
                  </div>
                  <div className="flex w-full flex-wrap">
                    <div className="w-[50%] lg:w-[25%]">
                      <div className="flex w-full flex-wrap">
                        <div className={`lg:w-[100%] md:w-[100%] px-[5px]`}>
                          <div
                            className={`w-full items-start self-stretch flex flex-col`}
                          >
                            <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                              Patient ID
                            </div>
                            <div className="w-full">
                              <InputField
                                placeholder="Patient ID"
                                value={searchCriteria?.patientID}
                                onChange={(evt) => {
                                  setSearchCriteriaFields({
                                    ...searchCriteria,
                                    patientID: evt.target.value,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="w-[50%] lg:w-[25%]">
                      <div className="flex w-full flex-wrap">
                        <div className={`lg:w-[100%] md:w-[100%] px-[5px]`}>
                          <div
                            className={`w-full items-start self-stretch flex flex-col`}
                          >
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
                      </div>
                    </div>
                    <div className="w-[50%] lg:w-[25%]">
                      <div className="flex w-full flex-wrap">
                        <div className={`lg:w-[100%] md:w-[100%] px-[5px]`}>
                          <div
                            className={`w-full items-start self-stretch flex flex-col`}
                          >
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
                      </div>
                    </div>
                    <div className={`lg:w-[25%] w-[50%] px-[5px]`}>
                      <div
                        className={`w-full items-start self-stretch flex flex-col`}
                      >
                        <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                          Responsibility
                        </div>
                        <div className="mt-[4px]  flex h-[38px] w-full items-center">
                          <RadioButton
                            data={[
                              { value: '1', label: 'Primary' },
                              { value: '2', label: 'Secondary+' },
                              { value: '', label: 'Both' },
                            ]}
                            checkedValue={
                              searchCriteria.responsibility
                                ? searchCriteria.responsibility.toString()
                                : ''
                            }
                            onChange={(e) => {
                              setSearchCriteriaFields({
                                ...searchCriteria,
                                responsibility: e.target.value
                                  ? Number(e.target.value)
                                  : null,
                              });
                            }}
                          />
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
                  rows={searchResult}
                  columns={columns}
                  checkboxSelection={true}
                  selectRows={selectRows}
                  onSelectRow={(ids: number[]) => {
                    const result = ids.filter(
                      (num) => !selectRows.includes(num)
                    );
                    setSelectRows(result);
                  }}
                  onPageChange={(page: number) => {
                    const obj: GetChargesDataCriterea = {
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
                      const obj: GetChargesDataCriterea = {
                        ...lastSearchCriteria,
                        sortByColom: field || '',
                        sortOrder: sort || '',
                      };
                      setLastSearchCriteria(obj);
                      getSearchData(obj);
                    }
                  }}
                  onPageSizeChange={(pageSize: number, page: number) => {
                    if (searchResult.length) {
                      const obj: GetChargesDataCriterea = {
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
        <div className="flex w-full items-center justify-center rounded-b-lg bg-gray-200 py-6">
          <div className="flex w-full items-center justify-end space-x-4 px-7">
            <Button
              buttonType={ButtonType.secondary}
              cls={`inline-flex px-4 py-2 gap-2 leading-5`}
              onClick={onPressClose}
            >
              <p className="text-sm font-medium leading-tight text-gray-700">
                Cancel
              </p>
            </Button>
            {type === 'linkPayment' && (
              <Button
                buttonType={
                  !selectRows.length ? ButtonType.secondary : ButtonType.primary
                }
                disabled={!selectRows.length}
                cls={`inline-flex px-4 py-2 gap-2 leading-5`}
                onClick={linkPayment}
              >
                <p className="text-sm font-medium leading-tight">
                  Link Selected Charge to ERA
                </p>
              </Button>
            )}
            {type === 'postPayment' && (
              <Button
                buttonType={
                  !selectRows.length ? ButtonType.secondary : ButtonType.primary
                }
                disabled={!selectRows.length}
                cls={`inline-flex px-4 py-2 gap-2 leading-5`}
                onClick={postPayment}
              >
                <p className="text-sm font-medium leading-tight">
                  Post Payment
                </p>
              </Button>
            )}
          </div>
        </div>
      </div>
      {!!paymentPostingInfo && (
        <Modal
          open={true}
          onClose={() => {}}
          modalContentClassName="h-[calc(100%-80px)] w-[calc(100%-220px)] relative rounded-lg bg-white shadow-xl transition-all sm:my-8"
          modalClassName={'!z-[14]'}
          hideBackdrop={true}
        >
          <PaymentPosting
            claimID={paymentPostingInfo.claimID}
            groupID={paymentPostingInfo.groupID}
            patientID={paymentPostingInfo.patientID}
            onClose={(v) => {
              if (v === 'isPost') {
                onClose('isPost');
              }
              setPaymentPostingInfo(undefined);
            }}
            selectedBatchID={id}
            chargeId={paymentPostingInfo.chargeID}
          />
        </Modal>
      )}
      <Modal
        open={openChargeStatusModal}
        onClose={() => {
          setOpenChargeStatusModal(false);
        }}
        modalContentClassName="h-[calc(100%-80px)] w-[calc(100%-220px)] relative rounded-lg bg-white shadow-xl transition-all sm:my-8"
        modalClassName={'!z-[14]'}
      >
        <ViewChargeDetails
          icdRows={icdRows}
          chargeID={chargeModalInfo.chargeID}
          patientID={chargeModalInfo.patientID}
          sortOrder={0}
          dxCodeDropdownData={
            icdRows && icdRows.length > 0
              ? (icdRows.map((a) => ({
                  ...a.selectedICDObj,
                  appendText: a.description,
                  leftIcon: priorityOrderRender(a.order),
                })) as MultiSelectGridDropdownDataType[])
              : []
          }
          onClose={() => {
            setOpenChargeStatusModal(false);
          }}
        />
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
    </Modal>
  );
};

export default ChargesSearchModal;
