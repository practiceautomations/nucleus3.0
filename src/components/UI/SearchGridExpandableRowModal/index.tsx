import type { GridColDef } from '@mui/x-data-grid-pro';
import React from 'react';
import { useDispatch } from 'react-redux';

import Icon from '@/components/Icon';
import store from '@/store';
import { setGlobalModal } from '@/store/shared/actions';
import type {
  AllClaimsExpandRowResult,
  DocumentsExpandRowResult,
  EOMViewDetailGridChargesResult,
  EOMViewDetailGridLedgerResult,
  RouteHistoryData,
} from '@/store/shared/types';

import Button, { ButtonType } from '../Button';
import CloseButton from '../CloseButton';
import SearchDetailGrid from '../SearchDetailGrid';

export interface SearchGridExpandabkeRowModalProps {
  // expandedRows: any[];
  expandedColumns: GridColDef[];
  claimID?: string | number;
  tabName?: string;
  expandedRowsCheckboxSelection?: boolean;
  badge?: React.ReactNode;
  onClose?: () => void;
  expandRowData:
    | EOMViewDetailGridChargesResult[]
    | EOMViewDetailGridLedgerResult[]
    | AllClaimsExpandRowResult[]
    | DocumentsExpandRowResult[];
}
export default function SearchGridExpandabkeRowModal({
  // expandedRows,
  expandedColumns,
  expandedRowsCheckboxSelection = false,
  badge,
  onClose,
  claimID,
  tabName,
  expandRowData,
}: SearchGridExpandabkeRowModalProps) {
  const dispatch = useDispatch();
  return (
    <div className="relative w-full overflow-hidden border border-gray-200 bg-gray-200 p-4">
      <div className="rounded-md border border-gray-300 ">
        <div className="flex flex-col rounded-md bg-white">
          {claimID && (
            <div className="flex justify-between rounded-t-md bg-red-100 p-2">
              <div className="flex gap-2 self-start p-2">
                <p className="self-center text-sm font-medium leading-5 text-gray-500">
                  Claim Status:
                </p>
                {badge}
              </div>
              <div className="flex gap-2 self-start">
                <div className="gap-2 font-medium leading-5 text-gray-700">
                  <Button
                    buttonType={ButtonType.secondary}
                    cls={`inline-flex px-4 py-2 gap-2 leading-5 cursor-pointer`}
                    onClick={async () => {
                      // const claimRoute = await getClaimRoute(Number(claimID));
                      // if (claimRoute && claimRoute.screen) {
                      //   router.push(`/app/claim-detail/${claimID}`);
                      // }
                      // First push and change route manually
                      const routeHistory: RouteHistoryData[] = JSON.parse(
                        JSON.stringify(store.getState().shared.routeHistory)
                      );
                      const secLastVal = routeHistory[routeHistory.length - 2];
                      if (
                        !secLastVal?.url.includes('/app/claim-detail') ||
                        (secLastVal?.url.includes('/app/claim-detail') &&
                          !secLastVal?.isModal)
                      ) {
                        window.history.pushState(
                          '/app/all-claims',
                          '',
                          '/app/all-claims'
                        );
                      }
                      dispatch(
                        setGlobalModal({
                          type: 'Claim Detail',
                          id: Number(claimID),
                          fromTab: tabName,
                        })
                      );
                    }}
                  >
                    <Icon name={'eye'} size={18} />
                    <p className="text-sm">See Full Claim Details</p>
                  </Button>
                </div>
                <div className="self-center">
                  <CloseButton
                    onClick={() => {
                      if (onClose) onClose();
                    }}
                  />
                </div>
              </div>
            </div>
          )}
          <div style={{ height: '100%', width: '100%' }}>
            <SearchDetailGrid
              checkboxSelection={expandedRowsCheckboxSelection}
              hideHeader={true}
              hideFooter={true}
              columns={expandedColumns}
              rows={expandRowData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
