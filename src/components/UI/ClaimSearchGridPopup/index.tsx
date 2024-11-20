import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import type {
  GridColDef,
  GridRowId,
  GridRowParams,
} from '@mui/x-data-grid-pro';
import { GRID_DETAIL_PANEL_TOGGLE_COL_DEF } from '@mui/x-data-grid-pro';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import Icon from '@/components/Icon';
// eslint-disable-next-line import/no-cycle
import { CustomDetailPanelToggle } from '@/pages/app/all-claims';
import { getselectdWorkGroupsIDsSelector } from '@/store/chrome/selectors';
import { addToastNotification } from '@/store/shared/actions';
import {
  fetchAllClaimsSearchData,
  getAllClaimsExpandRowDataById,
  getScrubingAPIResponce,
  unlinkMedicalCase,
} from '@/store/shared/sagas';
import type {
  ActionNeededClaimsResult,
  AllClaimsExpandRowResult,
  GetAllClaimsSearchDataCriteria,
  GetAllClaimsSearchDataResult,
} from '@/store/shared/types';
import { ToastType } from '@/store/shared/types';
import { currencyFormatter, usdPrice } from '@/utils';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';

import Badge from '../Badge';
import Button, { ButtonType } from '../Button';
import CloseButton from '../CloseButton';
import SearchDetailGrid, { globalPaginationConfig } from '../SearchDetailGrid';
import SearchGridExpandabkeRowModal from '../SearchGridExpandableRowModal';
import StatusModal, { StatusModalType } from '../StatusModal';

interface ClaimSearchGridPopupProp {
  claimSearchCriteria?: ActionNeededClaimsResult;
  onClose: () => void;
  headerClaimStatus: string;
  type: string;
  medicalCaseID?: number;
}
const defaultSearchDataCriteria: GetAllClaimsSearchDataCriteria = {
  selector: '',
  claimStatusID: undefined,
  scrubStatusID: undefined,
  submitStatusID: undefined,
  timelyFiling: undefined,
  fromAgingDays: undefined,
  toAgingDays: undefined,
  posID: undefined,
  assignedTo: '',
  fromDOS: undefined,
  toDOS: undefined,
  fromCreatedOn: undefined,
  toCreatedOn: undefined,
  fromSubmissionDate: undefined,
  toSubmissionDate: undefined,
  categoryID: undefined,
  stateCategoryID: undefined,
  actionCategoryID: undefined,
  getAllData: false,
  sortColumn: '',
  sortOrder: '',
  pageNumber: 1,
  pageSize: globalPaginationConfig.activePageSize,
  claimStatusIDS: undefined,
  fromFee: undefined,
  toFee: undefined,
};
export default function ClaimSearchGridPopup({
  claimSearchCriteria,
  onClose,
  headerClaimStatus,
  type = '',
  medicalCaseID,
}: ClaimSearchGridPopupProp) {
  const dispatch = useDispatch();
  const gridRef = useRef<HTMLTableRowElement>(null);
  const selectedWorkedGroup = useSelector(getselectdWorkGroupsIDsSelector);

  const [searchResult, setSearchResult] = useState<
    GetAllClaimsSearchDataResult[]
  >([]);
  const [lastSearchDataCriteria, setLastSearchDataCriteria] = useState(
    defaultSearchDataCriteria
  );

  const [totalCount, setTotalCount] = useState<number>();
  const getAllClaimsSearchData = async (
    criteria: GetAllClaimsSearchDataCriteria
  ) => {
    if (!selectedWorkedGroup) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Please Select a Group/Workgroup from Organization Selector',
          toastType: ToastType.ERROR,
        })
      );
      return;
    }

    const selector = {
      groups: selectedWorkedGroup?.groupsData?.map((m) => m.id) || [],
      practices: selectedWorkedGroup?.practicesData?.map((m) => m.id) || [],
      facilities: selectedWorkedGroup?.facilitiesData?.map((m) => m.id) || [],
      providers: selectedWorkedGroup?.providersData?.map((m) => m.id) || [],
    };
    const res = await fetchAllClaimsSearchData({
      ...criteria,
      selector: JSON.stringify(selector),
      claimStatusIDS:
        type === 'claimActions' && claimSearchCriteria?.rid !== 5
          ? claimSearchCriteria?.viewBy
          : null,
      sortColumn: '',
      sortOrder: '',
      pageNumber: 1,
      pageSize: 10,
      fromAgingDays:
        type === 'claimActions' && claimSearchCriteria?.rid === 5 ? 30 : null,
      stateCategoryID:
        type === 'openItems' && claimSearchCriteria?.rid !== 1
          ? Number(claimSearchCriteria?.viewBy)
          : undefined,
      medicalCaseID: medicalCaseID || undefined,
    });
    if (res) {
      setLastSearchDataCriteria(JSON.parse(JSON.stringify(criteria)));
      setTotalCount(res[0]?.total || 0);
      setSearchResult(res);
    }
  };
  useEffect(() => {
    const criteria: GetAllClaimsSearchDataCriteria = {
      selector: '',
      getAllData: false,
      sortColumn: '',
      sortOrder: '',
      pageNumber: undefined,
      pageSize: undefined,
    };
    getAllClaimsSearchData(criteria);
  }, []);
  const [detailPanelExpandedRowIds, setDetailPanelExpandedRowIds] = useState<
    GridRowId[]
  >([]);
  const [expandedRowData, setExpandedRowData] = useState<
    {
      id: GridRowId;
      data: AllClaimsExpandRowResult[];
    }[]
  >([]);
  const getExpandableRowData = async (claimId: GridRowId | undefined) => {
    if (claimId) {
      const res = await getAllClaimsExpandRowDataById(claimId);
      if (res) {
        setExpandedRowData((prevData) => [
          ...prevData,
          { id: claimId, data: res },
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
    [detailPanelExpandedRowIds]
  );

  const closeExpandedRowContent = (id: GridRowId) => {
    setDetailPanelExpandedRowIds(
      detailPanelExpandedRowIds.filter((f) => f !== id)
    );
  };

  const expandedRowContent = (expandedRowParams: GridRowParams) => {
    return (
      <SearchGridExpandabkeRowModal
        badge={
          <Badge
            text={'Partially Paid'}
            cls={'bg-green-50 text-green-800 rounded-[4px] pt-1'}
            icon={<Icon name={'desktop'} color={IconColors.GREEN} />}
          />
        }
        expandRowData={
          expandedRowData
            .filter((f) => f.id === expandedRowParams.id)
            [
              expandedRowData.filter((f) => f.id === expandedRowParams.id)
                .length - 1
            ]?.data?.map((row) => {
              return { ...row, id: row.chargeID };
            }) || []
        }
        claimID={expandedRowParams.id}
        onClose={() => {
          closeExpandedRowContent(expandedRowParams.id);
        }}
        expandedColumns={[
          {
            field: 'chargeID',
            headerName: 'Charge ID',
            flex: 1,
            minWidth: 110,
            sortable: false,
            renderCell: (params) => {
              return <div>{`#${params.value}`}</div>;
            },
          },
          {
            field: 'chargeStatus',
            headerName: 'Charge Status',
            flex: 1,
            minWidth: 110,
            sortable: false,
            renderCell: (params) => {
              if (params.value === 'Denied') {
                return (
                  <Badge
                    text={params.value}
                    cls={
                      'bg-red-50 text-red-800 rounded-[4px] whitespace-normal'
                    }
                  />
                );
              }
              if (params.value === 'Paid ERA') {
                return (
                  <Badge
                    text={params.value}
                    cls={
                      'bg-green-50 text-green-800 rounded-[4px] whitespace-normal'
                    }
                  />
                );
              }

              return (
                <Badge
                  text={params.value}
                  cls={
                    'bg-gray-50 text-gray-800 rounded-[4px] whitespace-normal'
                  }
                />
              );
            },
          },
          {
            field: 'cpt',
            headerName: 'CPT Code',
            flex: 1,
            minWidth: 110,
            sortable: false,
          },
          {
            field: 'units',
            headerName: 'Units',
            flex: 1,
            minWidth: 110,
            sortable: false,
          },
          {
            field: 'mod',
            headerName: 'Mod.',
            flex: 1,
            minWidth: 110,
            sortable: false,
          },
          {
            field: 'icds',
            headerName: 'DX',
            flex: 1,
            minWidth: 110,
            sortable: false,
          },
          {
            field: 'fee',
            headerName: 'Fee',
            ...usdPrice,
            flex: 1,
            minWidth: 110,
            sortable: false,
          },
          {
            field: 'allowable',
            headerName: 'Allowable',
            ...usdPrice,
            flex: 1,
            minWidth: 110,
            sortable: false,
          },
          {
            field: 'insuranceResponsibility',
            ...usdPrice,
            headerName: 'Ins. Resp.',
            flex: 1,
            minWidth: 110,
            sortable: false,
            renderCell: (params) => {
              return (
                <div className="flex flex-col">
                  {params.row.insuranceAmount >= 0 ? (
                    <div>
                      {currencyFormatter.format(params.row.insuranceAmount)}
                    </div>
                  ) : (
                    <div className="text-red-500 ">
                      {currencyFormatter.format(
                        params.row.insuranceAmount * -1
                      )}
                    </div>
                  )}
                  {params.row.insuranceBalance < 0 && (
                    <div className="whitespace-nowrap text-xs text-red-500">
                      {`Bal.: ${currencyFormatter.format(
                        params.row.insuranceBalance
                      )}`}
                    </div>
                  )}
                  {params.row.insuranceBalance > 0 && (
                    <div className="whitespace-nowrap text-xs text-green-500">
                      {`Bal.: ${currencyFormatter.format(
                        params.row.insuranceBalance
                      )}`}
                    </div>
                  )}
                  {(params.row.insuranceBalance === 0 ||
                    !params.row.insuranceBalance) && (
                    <div className="whitespace-nowrap text-xs">
                      {`Bal.: ${currencyFormatter.format(0)}`}
                    </div>
                  )}
                </div>
              );
            },
          },
          {
            field: 'patientResponsibility',
            headerName: 'Pat. Resp.',
            ...usdPrice,
            flex: 1,
            minWidth: 110,
            sortable: false,
            renderCell: (params) => {
              return (
                <div className="flex flex-col">
                  {params.row.patientAmount >= 0 ? (
                    <div>
                      {currencyFormatter.format(params.row.patientAmount)}
                    </div>
                  ) : (
                    <div className="text-red-500 ">
                      {currencyFormatter.format(params.row.patientAmount * -1)}
                    </div>
                  )}
                  {params.row.patientBalance < 0 && (
                    <div className="whitespace-nowrap text-xs text-red-500">
                      {`Bal.: ${currencyFormatter.format(
                        params.row.patientBalance
                      )}`}
                    </div>
                  )}
                  {params.row.patientBalance > 0 && (
                    <div className="whitespace-nowrap text-xs text-green-500">
                      {`Bal.: ${currencyFormatter.format(
                        params.row.patientBalance
                      )}`}
                    </div>
                  )}
                  {(params.row.patientBalance === 0 ||
                    !params.row.patientBalance) && (
                    <div className="whitespace-nowrap text-xs">
                      {`Bal.: ${currencyFormatter.format(0)}`}
                    </div>
                  )}
                </div>
              );
            },
          },
        ]}
      />
    );
  };
  // const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
  // const [isViewInsuranceMode, setIsViewInsuranceMode] = useState(false);
  // const [selectedInsuranceID, setSelectedInsuranceID] = useState<number>();
  const getScrubingResponce = async (id: number) => {
    const res = await getScrubingAPIResponce(id);
    if (res) {
      const responseWindow = window.open('about:blank', '_blank');
      let adnareResponseWindow;
      if (res.adnareResponse) {
        adnareResponseWindow = window.open('about:blank', '_blank');
      }
      if (responseWindow) {
        // Write the response content to the first window
        responseWindow.document.write(res.response);
        responseWindow.document.close();
      }

      if (adnareResponseWindow) {
        adnareResponseWindow.document.write(res.adnareResponse);
        adnareResponseWindow.document.close();
      }
    }
  };
  const [showWarningModal, setWarningModal] = useState(false);
  const [selectedClaimID, setSelectedClaimID] = useState<number>();
  const claimsColumns: GridColDef[] = [
    {
      ...GRID_DETAIL_PANEL_TOGGLE_COL_DEF,
      renderCell: (params) => (
        <CustomDetailPanelToggle id={params.id} value={params.value} />
      ),
      minWidth: 40,
      sortable: false,
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
            onClick={async () => {
              window.open(`/app/claim-detail/${params.value}`);
            }}
          >
            {`#${params.value}`}
          </div>
        );
      },
    },
    {
      field: 'dos',
      headerName: 'DoS',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div>
            {params.row.toDOS !== null ? (
              <> {`${params.row.fromDOS} - ${params.row.toDOS}`} </>
            ) : (
              <>{params.row.fromDOS}</>
            )}
          </div>
        );
      },
    },
    {
      field: 'patient',
      headerName: 'Patient',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      // renderCell: (params) => {
      //   return (
      //     <div
      //       className="cursor-pointer text-cyan-500"
      //       onClick={() => {
      //         // window.open(`/app/register-patient/${params.row.patientID}`);
      //         dispatch(
      //           setGlobalModal({
      //             type: 'Patient Detail',
      //             id: params.row.patientID,
      //             isPopup: true,
      //           })
      //         );
      //       }}
      //     >
      //       {params.value}
      //     </div>
      //   );
      // },
    },

    {
      field: 'insurance',
      headerName: 'Insurance',
      minWidth: 120,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-cyan-500"
            // onClick={() => {
            //   setIsInsuranceModalOpen(true);
            //   setSelectedInsuranceID(params.row.insuranceID);
            //   if (selectedInsuranceID) {
            //     setSelectedInsuranceID(params.row.insuranceID); // remove it afterwards
            //   }
            // }}
          >
            {params.value}
          </div>
        );
      },
    },
    {
      field: 'aging',
      flex: 1,
      minWidth: 150,
      headerName: 'Aging',
      disableReorder: true,
    },
    {
      field: 'followupDays',
      flex: 1,
      minWidth: 150,
      headerName: 'Follow-up in',
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div>{params.value} Days</div>
            <div className="text-xs text-gray-400">
              {params.row.followupDate}
            </div>
          </div>
        );
      },
    },
    {
      field: 'timelyFiling',
      type: 'boolean',
      headerName: 'T. Filling',
      flex: 1,
      minWidth: 110,
      disableReorder: true,
      renderCell: (params) => {
        return params.value ? (
          <CheckIcon
            style={{
              color: '#10B981',
            }}
          />
        ) : (
          <CloseIcon
            style={{
              color: '#EF4444',
            }}
          />
        );
      },
    },
    {
      field: 'scrubStatus',
      headerName: 'Scrub Status',
      flex: 1,
      minWidth: 200,
      disableReorder: true,
      renderCell: (params) => {
        const { scrubStatusID } = params.row;
        const isDisabled = [6, 7].includes(scrubStatusID);

        const statusMapping: any = {
          2: { color: 'red', icon: 'desktop', IconColor: IconColors.RED },
          3: { color: 'red', icon: 'desktop', IconColor: IconColors.RED },
          4: { color: 'yellow', icon: 'user', IconColor: IconColors.Yellow },
          5: { color: 'green', icon: 'desktop', IconColor: IconColors.GREEN },
          6: { color: 'yellow', icon: 'user', IconColor: IconColors.Yellow },
        };

        const defaultMapping = {
          color: 'gray',
          icon: 'desktop',
          IconColor: IconColors.GRAY,
        };
        const { color, icon, IconColor } =
          statusMapping[scrubStatusID] || defaultMapping;

        return (
          <Badge
            text={params.value}
            cls={classNames(
              `rounded-[4px] bg-${color}-50 text-${color}-800`,
              isDisabled ? '' : 'cursor-pointer'
            )}
            icon={<Icon name={icon} color={IconColor} />}
            onClick={() => {
              if (params.row.claimID && !isDisabled)
                getScrubingResponce(params.row.claimID);
            }}
          />
        );
      },
    },
    {
      field: 'claimStatus',
      headerName: 'Claim Status',
      flex: 1,
      minWidth: 250,
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
      field: 'fee',
      headerName: 'Fee',
      ...usdPrice,
      flex: 1,
      type: 'number',
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'allowable',
      headerName: 'Allowable',
      // ...usdPrice,
      flex: 1,
      minWidth: 125,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div>{currencyFormatter.format(params.value)}</div>
            {params.row.adjustments > 0 && (
              <div className="whitespace-nowrap text-xs text-red-500">
                {`Adj.: ${currencyFormatter.format(params.row.adjustments)}`}
              </div>
            )}
            {params.row.adjustments < 0 && (
              <div className="whitespace-nowrap text-xs text-yellow-500">
                {`Adj.: ${currencyFormatter.format(params.row.adjustments)}`}
              </div>
            )}
            {(params.row.adjustments === 0 || !params.row.adjustments) && (
              <div className="whitespace-nowrap text-xs text-green-500">
                {`Adj.: ${currencyFormatter.format(0)}`}
              </div>
            )}
          </div>
        );
      },
    },
    {
      field: 'insuranceAmount',
      headerName: 'Insurance Resp.',
      ...usdPrice,
      flex: 1,
      minWidth: 160,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div>{currencyFormatter.format(params.value)}</div>
            {params.row.insuranceBalance < 0 && (
              <div className="whitespace-nowrap text-xs text-yellow-500">
                {`Bal.: ${currencyFormatter.format(
                  params.row.insuranceBalance
                )}`}
              </div>
            )}
            {params.row.insuranceBalance > 0 && (
              <div className="whitespace-nowrap text-xs text-red-500">
                {`Bal.: ${currencyFormatter.format(
                  params.row.insuranceBalance
                )}`}
              </div>
            )}
            {(params.row.insuranceBalance === 0 ||
              !params.row.insuranceBalance) && (
              <div className="whitespace-nowrap text-xs text-green-500">
                {`Bal.: ${currencyFormatter.format(0)}`}
              </div>
            )}
          </div>
        );
      },
    },
    {
      field: 'patientAmount',
      headerName: 'Patient Resp.',
      ...usdPrice,
      flex: 1,
      minWidth: 160,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div>{currencyFormatter.format(params.value)}</div>
            {params.row.patientBalance > 0 && (
              <div className="whitespace-nowrap text-xs text-red-500">
                {`Bal.: ${currencyFormatter.format(params.row.patientBalance)}`}
              </div>
            )}
            {params.row.patientBalance < 0 && (
              <div className="whitespace-nowrap text-xs text-yellow-500">
                {`Bal.: ${currencyFormatter.format(params.row.patientBalance)}`}
              </div>
            )}
            {(params.row.patientBalance === 0 ||
              !params.row.patientBalance) && (
              <div className="whitespace-nowrap text-xs text-green-500">
                {`Bal.: ${currencyFormatter.format(0)}`}
              </div>
            )}
          </div>
        );
      },
    },
    {
      field: 'totalBalance',
      headerName: 'T. Balance',
      ...usdPrice,
      flex: 1,
      minWidth: 130,
      disableReorder: true,
      renderCell: (params) => {
        if (params.value > 0) {
          return (
            <div className="text-red-500">
              {currencyFormatter.format(params.value)}
            </div>
          );
        }
        if (params.value === 0) {
          return (
            <div className="text-green-500">
              {currencyFormatter.format(params.value)}
            </div>
          );
        }

        return (
          <div className="text-yellow-500">
            {currencyFormatter.format(params.value * -1)}
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
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="cursor-pointer text-cyan-500" onClick={() => {}}>
              {params.value}
            </div>
            <div className="text-xs font-normal leading-4">
              {params.row.practiceAddress}
            </div>
          </div>
        );
      },
    },
    {
      field: 'facility',
      headerName: 'Facility',
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
              {params.row.facilityAddress}
            </div>
          </div>
        );
      },
    },
    {
      field: 'pos',
      headerName: 'PoS',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'provider',
      headerName: 'Provider',
      flex: 1,
      minWidth: 180,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="cursor-pointer text-cyan-500" onClick={() => {}}>
              {params.value}
            </div>
            <div className="text-xs font-normal leading-4">{`NPI: ${params.row.providerNPI}`}</div>
          </div>
        );
      },
    },
    {
      field: 'assignee',
      headerName: 'Assignee',
      flex: 1,
      minWidth: 180,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="cursor-pointer text-cyan-500" onClick={() => {}}>
              {params.value}
            </div>
            <div className="text-xs font-normal leading-4">
              {params.row.assigneeRole}
            </div>
          </div>
        );
      },
    },
    {
      field: 'action',
      headerName: 'Actions',
      flex: 1,
      minWidth: 190,
      hideSortIcons: true,
      disableReorder: true,
      hide: !medicalCaseID,
      cellClassName: '!bg-cyan-50 PinnedColumLeftBorder',
      headerClassName: '!bg-cyan-100 !text-center PinnedColumLeftBorder',
      renderCell: (params) => {
        return (
          <div className="flex flex-row gap-2">
            <Button
              buttonType={ButtonType.primary}
              cls={`!w-[139px] !h-[30px] pl-[9px] pr-[11px] py-[7px] inline-flex px-4 py-2 gap-2 leading-5 !rounded`}
              onClick={async () => {
                setWarningModal(true);
                setSelectedClaimID(params.row.claimID);
              }}
            >
              <Icon name={'link'} size={18} />
              <p className="mt-[2px] self-center text-xs font-medium leading-4">
                Unlink Claim
              </p>
            </Button>
          </div>
        );
      },
    },
  ];
  return (
    <div
      className={
        'flex h-full w-full flex-col items-center justify-start overflow-hidden rounded-lg bg-gray-100 shadow'
      }
    >
      {!medicalCaseID && (
        <div className="mt-3 w-full max-w-full p-4">
          <div className="flex flex-row justify-between">
            <div>
              <h1 className=" ml-2  text-left text-xl font-bold leading-7 text-gray-700">
                {`${headerClaimStatus} - ${
                  selectedWorkedGroup?.groupsData[0]?.value || 'Group Name'
                }`}
              </h1>
            </div>
            <div className="">
              <CloseButton onClick={onClose} />
            </div>
          </div>
          <div className="mt-3 h-px w-full bg-gray-300" />
        </div>
      )}
      <div className="flex w-full flex-col overflow-y-auto">
        <div className="w-full flex-1 overflow-y-auto bg-gray-100">
          <div className="flex">
            <div className="w-full self-center break-words p-6 text-justify text-sm text-gray-500">
              <div ref={gridRef} className="h-full">
                <SearchDetailGrid
                  pageNumber={lastSearchDataCriteria.pageNumber}
                  pageSize={lastSearchDataCriteria.pageSize}
                  totalCount={totalCount}
                  rows={searchResult}
                  columns={claimsColumns}
                  checkboxSelection={false}
                  persistLayoutId={39}
                  onDetailPanelExpandedRowIdsChange={
                    handleDetailPanelExpandedRowIdsChange
                  }
                  detailPanelExpandedRowIds={detailPanelExpandedRowIds}
                  expandedRowContent={expandedRowContent}
                  onPageChange={(page: number) => {
                    const obj = {
                      ...lastSearchDataCriteria,
                      pageNumber: page,
                    };
                    setLastSearchDataCriteria(obj);
                    getAllClaimsSearchData(obj);
                  }}
                  onSortChange={(
                    field: string | undefined,
                    sort: 'asc' | 'desc' | null | undefined
                  ) => {
                    if (searchResult.length) {
                      const obj = {
                        ...lastSearchDataCriteria,
                        sortColumn: field || '',
                        sortOrder: sort || '',
                      };
                      setLastSearchDataCriteria(obj);
                      getAllClaimsSearchData(obj);
                    }
                  }}
                  onPageSizeChange={(pageSize: number, page: number) => {
                    if (searchResult.length) {
                      const obj = {
                        ...lastSearchDataCriteria,
                        pageSize,
                        pageNumber: page,
                      };
                      setLastSearchDataCriteria(obj);
                      getAllClaimsSearchData(obj);
                    }
                  }}
                  setHeaderRadiusCSS={true}
                  pinnedColumns={{
                    right: ['action'],
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <StatusModal
        open={showWarningModal}
        heading={'Unlink Claim from Medical Case Confirmation'}
        description={`This action will cause the claim ${selectedClaimID} to be unlinked from Medical Case ${medicalCaseID}. Are you sure you want to proceed with unlinking Claim: ${selectedClaimID}?`}
        okButtonText={'Yes, Unlink'}
        closeButtonText={'Cancel'}
        okButtonColor={ButtonType.tertiary}
        statusModalType={StatusModalType.WARNING}
        showCloseButton={true}
        closeOnClickOutside={false}
        onClose={() => {
          setWarningModal(false);
        }}
        onChange={async () => {
          if (selectedClaimID) {
            const res = await unlinkMedicalCase(selectedClaimID);
            if (res) {
              const criteria: GetAllClaimsSearchDataCriteria = {
                selector: '',
                getAllData: false,
                sortColumn: '',
                sortOrder: '',
                pageNumber: undefined,
                pageSize: undefined,
              };
              setWarningModal(false);
              getAllClaimsSearchData(criteria);
            }
          }
        }}
      />
    </div>
  );
}
