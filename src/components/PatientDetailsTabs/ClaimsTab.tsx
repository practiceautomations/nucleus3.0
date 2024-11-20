import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import type {
  GridColDef,
  GridRowId,
  GridRowParams,
} from '@mui/x-data-grid-pro';
import {
  GRID_CHECKBOX_SELECTION_COL_DEF,
  GRID_DETAIL_PANEL_TOGGLE_COL_DEF,
} from '@mui/x-data-grid-pro';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

// eslint-disable-next-line import/no-cycle
import { CustomDetailPanelToggle } from '@/pages/app/all-claims';
import { getselectdWorkGroupsIDsSelector } from '@/store/chrome/selectors';
import { addToastNotification } from '@/store/shared/actions';
import {
  fetchAllClaimsSearchData,
  fetchAllClaimsSearchDataClaimIDS,
  getAllClaimsExpandRowDataById,
  getScrubingAPIResponce,
} from '@/store/shared/sagas';
import type {
  AllClaimsExpandRowResult,
  GetAllClaimsSearchDataCriteria,
  GetAllClaimsSearchDataResult,
} from '@/store/shared/types';
import { ToastType } from '@/store/shared/types';
import { currencyFormatter, usdPrice } from '@/utils';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';

import Icon from '../Icon';
import Badge from '../UI/Badge';
import CheckBox from '../UI/CheckBox';
import SearchDetailGrid, {
  globalPaginationConfig,
} from '../UI/SearchDetailGrid';
import SearchGridExpandabkeRowModal from '../UI/SearchGridExpandableRowModal';

export interface PatientClaimsTabProps {
  patientID: number | null;
  setCount: (count: number) => void;
}

export default function PatientClaimsTab({
  patientID,
  setCount,
}: PatientClaimsTabProps) {
  const selectedWorkGroupData = useSelector(getselectdWorkGroupsIDsSelector);
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
  const [totalCount, setTotalCount] = useState<number>();
  const [routePath, setRoutePath] = useState<string | undefined>();
  const dispatch = useDispatch();
  const [lastSearchDataCriteria, setLastSearchDataCriteria] = useState(
    defaultSearchDataCriteria
  );
  const router = useRouter();
  useEffect(() => {
    if (routePath) {
      router.push(routePath);
    }
  }, [routePath]);
  const [searchResult, setSearchResult] = useState<
    GetAllClaimsSearchDataResult[]
  >([]);

  const getAllClaimsSearchData = async (
    criterea: GetAllClaimsSearchDataCriteria
  ) => {
    if (!selectedWorkGroupData) {
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
      groups: selectedWorkGroupData?.groupsData?.map((m) => m.id) || [],
      practices: selectedWorkGroupData?.practicesData?.map((m) => m.id) || [],
      facilities: selectedWorkGroupData?.facilitiesData?.map((m) => m.id) || [],
      providers: selectedWorkGroupData?.providersData?.map((m) => m.id) || [],
    };
    const res = await fetchAllClaimsSearchData({
      ...criterea,
      patientSearch: patientID?.toString(),
      selector: JSON.stringify(selector),
    });
    if (res) {
      setLastSearchDataCriteria(JSON.parse(JSON.stringify(criterea)));
      setTotalCount(res[0]?.total || 0);
      setSearchResult(res);
      setCount(res[0]?.total || 0);
    }
  };
  const [selectRows, setSelectRows] = useState<number[]>([]);
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
    if (lastSearchDataCriteria) {
      const res = await fetchAllClaimsSearchDataClaimIDS(
        lastSearchDataCriteria
      );
      if (res) {
        setSelectRows(res);
      }
    }
  };
  useEffect(() => {
    getAllClaimsSearchData(lastSearchDataCriteria);
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
  const claimsColumns: GridColDef[] = [
    {
      ...GRID_DETAIL_PANEL_TOGGLE_COL_DEF,
      renderCell: (params) => (
        <CustomDetailPanelToggle id={params.id} value={params.value} />
      ),
      minWidth: 80,
    },
    {
      ...GRID_CHECKBOX_SELECTION_COL_DEF,
      flex: 1,
      minWidth: 80,
      renderHeader: () => {
        return (
          <CheckBox
            id="AllCheckbox"
            checked={!!searchResult.length && selectRows.length === totalCount}
            onChange={onSelectAll}
            disabled={false}
          />
        );
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
            onClick={async () => {
              setRoutePath(`/app/claim-detail/${params.value}`);
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
      //         // setRoutePath(`/app/register-patient/${params.row.patientID}`);
      //         // dispatch(
      //         //   setGlobalModal({
      //         //     type: 'Patient Detail',
      //         //     id: params.row.patientID,
      //         //     isPopup: true,
      //         //   })
      //         // );
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
      // renderCell: (params) => {
      //   return (
      //     <div
      //       className="cursor-pointer text-cyan-500"
      //       onClick={() => {
      //         setIsInsuranceModalOpen(true);
      //         setSelectedInsuranceID(params.row.insuranceID);
      //         if (selectedInsuranceID) {
      //           setSelectedInsuranceID(params.row.insuranceID); // remove it afterwards
      //         }
      //       }}
      //     >
      //       {params.value}
      //     </div>
      //   );
      // },
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
  ];

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
  const gridRef = useRef<HTMLTableRowElement>(null);
  return (
    <>
      <div className="text-xl font-bold leading-5 text-gray-700">
        <div className="mr-[24px] inline-flex">
          <div className="mt-[50px] flex items-center">
            All Claims Associated With Patient
          </div>
        </div>
      </div>
      <div ref={gridRef} className="h-full">
        <SearchDetailGrid
          pageNumber={lastSearchDataCriteria.pageNumber}
          pageSize={lastSearchDataCriteria.pageSize}
          totalCount={totalCount}
          rows={searchResult}
          columns={claimsColumns}
          onDetailPanelExpandedRowIdsChange={
            handleDetailPanelExpandedRowIdsChange
          }
          detailPanelExpandedRowIds={detailPanelExpandedRowIds}
          expandedRowContent={expandedRowContent}
          checkboxSelection={false}
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
        />
      </div>
    </>
  );
}
