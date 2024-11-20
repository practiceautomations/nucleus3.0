import type { TableCellProps } from '@mui/material';
import { TableCell, TableRow } from '@mui/material';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import React from 'react';

import classNames from '@/utils/classNames';

export interface AppTableProps {
  renderHead: React.ReactNode;
  renderBody: React.ReactNode;
  cls?: string;
  tableRef?: React.RefObject<HTMLDivElement> | null | undefined;
}
export default function AppTable({
  renderHead,
  renderBody,
  cls,
  tableRef,
}: AppTableProps) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <TableContainer
        component={Paper}
        ref={tableRef}
        className={classNames(
          '!rounded-lg border-solid border border-gray-200 !text-sm  !shadow-none',
          cls || ''
        )}
      >
        <Table aria-label="simple table">
          <TableHead className="bg-gray-200">{renderHead}</TableHead>
          <TableBody>{renderBody}</TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
export interface AppTablePropsRow {
  children: React.ReactNode;
  rowRef?: React.RefObject<HTMLTableRowElement> | null | undefined;
  cls?: string;
}
export function AppTableRow({ children, rowRef, cls }: AppTablePropsRow) {
  return (
    <TableRow
      className={classNames(`!font-['Nunito']`, cls || '')}
      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
      ref={rowRef}
    >
      {children}
    </TableRow>
  );
}
export interface AppTablePropsCell extends TableCellProps {
  children: React.ReactNode;
  cls?: string;
}
export function AppTableCell({ children, cls, ...props }: AppTablePropsCell) {
  return (
    <TableCell {...props} className={classNames(`!font-['Nunito']`, cls || '')}>
      {children}
    </TableCell>
  );
}
export function reOrderData(
  list: Iterable<unknown> | ArrayLike<unknown>,
  startIndex: number,
  endIndex: number
) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}
