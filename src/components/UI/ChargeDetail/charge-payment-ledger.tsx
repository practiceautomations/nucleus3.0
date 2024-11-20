import type { GridColDef } from '@mui/x-data-grid-pro';
import { useRef } from 'react';

import SearchDetailGrid from '@/components/UI/SearchDetailGrid';
import type { PaymentLedgerType } from '@/store/shared/types';

interface ChargePaymentLedgerProp {
  data: PaymentLedgerType[];
  columns: GridColDef[];
}

export function ChargePaymentLedger({
  data,
  columns,
}: ChargePaymentLedgerProp) {
  const gridRef = useRef<HTMLTableRowElement>(null);
  return (
    <div ref={gridRef} className="h-full">
      <SearchDetailGrid
        hideHeader={true}
        hideFooter={true}
        checkboxSelection={false}
        rows={data}
        columns={columns}
        pinnedColumns={{
          right: ['actions'],
        }}
      />
    </div>
  );
}
