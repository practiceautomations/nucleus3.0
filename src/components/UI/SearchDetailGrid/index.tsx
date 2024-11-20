import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import Pagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';
import type { Theme } from '@mui/material/styles';
import { createTheme, styled, ThemeProvider } from '@mui/material/styles';
import type {
  GridCallbackDetails,
  GridColDef,
  GridColumnOrderChangeParams,
  GridFeatureMode,
  GridPinnedColumns,
  GridRowParams,
  GridSelectionModel,
  GridSortModel,
} from '@mui/x-data-grid-pro';
import {
  GridFooterContainer,
  gridPageCountSelector,
  gridPageSelector,
  useGridApiContext,
  useGridApiRef,
  useGridSelector,
} from '@mui/x-data-grid-pro';
import { DataGridPro } from '@mui/x-data-grid-pro/DataGridPro';
import $ from 'jquery';
import React, { useEffect, useRef, useState } from 'react';

import Icon from '@/components/Icon';
import { addUpdateGridLayout, getGridLayoutData } from '@/store/shared/sagas';
import { IconColors } from '@/utils/ColorFilters';

import Button, { ButtonType } from '../Button';
import ColumnVisibilityDropdown from '../ColumnVisibiltyDropdown';

function customCheckbox(theme: Theme) {
  return {
    '& .MuiCheckbox-root svg': {
      width: 16,
      height: 16,
      backgroundColor: 'transparent',
      border: `1px solid ${
        theme.palette.mode === 'light' ? '#D1D5DB' : 'rgb(67, 67, 67)'
      }`,
      borderRadius: 4,
    },
    '& .MuiCheckbox-root svg path': {
      display: 'none',
    },
    '& .MuiCheckbox-root.Mui-checked svg': {
      backgroundColor: '#06B6D4',
      borderColor: '#06B6D4',
      backgroundImage:
        "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath" +
        " fill-rule='evenodd' clip-rule='evenodd' d='M12 5c-.28 0-.53.11-.71.29L7 9.59l-2.29-2.3a1.003 " +
        "1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l5-5A1.003 1.003 0 0012 5z' fill='%23fff'/%3E%3C/svg%3E\")",
    },
    '& .MuiCheckbox-root.Mui-checked .MuiIconButton-label:after': {
      position: 'absolute',
      display: 'table',
      border: '2px solid #fff',
      borderTop: 0,
      borderLeft: 0,
      transform: 'rotate(45deg) translate(-50%,-50%)',
      opacity: 1,
      transition: 'all .2s cubic-bezier(.12,.4,.29,1.46) .1s',
      content: '""',
      top: '50%',
      left: '39%',
      width: 5.71428571,
      height: 9.14285714,
    },
    '& .MuiDataGrid-columnHeaderCheckbox': {
      paddingLeft: 24,
      paddingRight: 24,
    },
    '& .MuiCheckbox-root.MuiCheckbox-indeterminate .MuiIconButton-label:after':
      {
        position: 'absolute',
        display: 'table',
        border: '2px solid #fff',
        borderTop: 0,
        borderLeft: 0,
        transform: 'rotate(45deg) translate(-50%,-50%)',
        opacity: 1,
        transition: 'all .2s cubic-bezier(.12,.4,.29,1.46) .1s',
        content: '""',
        top: '50%',
        left: '39%',
        width: 5.71428571,
        height: 9.14285714,
      },
    '& .MuiCheckbox-root.MuiCheckbox-indeterminate svg': {
      backgroundColor: '#06B6D4',
      borderColor: '#06B6D4',
      backgroundImage:
        "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Crect" +
        " x='3' y='7' width='10' height='2' rx='1' fill='%23fff'/%3E%3C/svg%3E\")",
    },
  };
}

const customClasses = {
  overlay: 'MuiDataGrid-overlay-custom-dh717h',
};

const StyledDataGrid = styled(DataGridPro)(({ theme }) => ({
  position: 'relative',
  border: 0,
  color:
    theme.palette.mode === 'light'
      ? 'rgba(0,0,0,.85)'
      : 'rgba(255,255,255,0.85)',
  WebkitFontSmoothing: 'auto',
  letterSpacing: 'normal',
  '& .MuiDataGrid-main': {
    borderWidth: 'thin',
    borderColor: '#D1D5DB',
    borderEndEndRadius: 8,
    borderEndStartRadius: 8,
    boxShadow:
      '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  '& .MuiDataGrid-columnsContainer': {
    backgroundColor: theme.palette.mode === 'light' ? '#fafafa' : '#1d1d1d',
  },
  '& .MuiDataGrid-iconSeparator': {
    display: 'none',
  },
  '& .MuiDataGrid-columnSeparator': {
    display: 'none',
  },
  '& .MuiDataGrid-columnHeader, .MuiDataGrid-cell': {
    borderRight: 'none',
    paddingTop: 12,
    paddingBottom: 12,
    paddingRight: 24,
    paddingLeft: 24,
  },
  '& .MuiDataGrid-columnHeaderDraggableContainer': {
    width: 'fit-content',
    height: 'auto',
  },
  '& .MuiDataGrid-cellContent': {
    // whiteSpace: 'normal',
  },
  '& .MuiDataGrid-columnHeaderTitle': {
    fontWeight: 700,
    fontSize: 14,
    color: '#4B5563',
  },
  '& .MuiDataGrid-columnHeader:focus-within': {
    outline: 'none',
  },
  '& .MuiDataGrid-columnHeader': {
    border: 1,
    borderColor: '#4E5566',
    backgroundColor: theme.palette.mode === 'light' ? '#F3F4F6' : '#1d1d1d',
  },
  '& .MuiDataGrid-columnsContainer, .MuiDataGrid-cell': {
    // whiteSpace: 'normal',
    borderBottom: `1px solid ${
      theme.palette.mode === 'light' ? '#f0f0f0' : '#303030'
    }`,
  },
  '& .MuiDataGrid-cell:focus-within': {
    outline: 'none',
  },
  '& .MuiDataGrid-columnsContainer:hover': {
    display: 'none',
  },
  '& .MuiDataGrid-cell': {
    paddingLeft: 24,
    paddingRight: 24,
    paddingTop: 10,
    paddingBottom: 10,
    cursor: 'default',
    color:
      theme.palette.mode === 'light' ? '#6B7280' : 'rgba(255,255,255,0.65)',
  },
  '& .MuiPaginationItem-root': {
    borderRadius: 0,
    width: 43,
    height: 38,
    padding: 0,
    margin: 0,
    border: 'none',
    backgroundColor: '#FFFFFF',
  },
  '& .MuiPaginationItem-icon': {
    color: '#6B7280',
    height: 25,
    width: 25,
  },
  '& .MuiPaginationItem-root.Mui-selected': {
    borderRadius: 0,
    color: '#06B6D4',
    borderColor: '#22D3EE',
    backgroundColor: '#ECFEFF',
  },
  '& .MuiDataGrid-footerContainer': {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: 24,
    paddingBottom: 24,
    border: 'none',
    backgroundColor: 'transparent',
  },
  '& .MuiTablePagination-actions': {
    display: 'none',
  },
  '& .MuiTablePagination-toolbar .MuiTablePagination-displayedRows': {
    color: '#6B7280',
    fontWeight: 400,
    fontSize: 14,
  },
  '& .MuiTablePagination-toolbar': {
    paddingLeft: 0,
  },
  '& .MuiDataGrid-row:hover': {
    backgroundColor: 'transparent',
  },
  '& .MuiDataGrid-row:focus': {
    backgroundColor: '#ECFEFF',
  },
  '& .MuiDataGrid-virtualScrollerContent': {
    backgroundColor: 'white',
    // position:'relative'
  },
  '& .MuiDataGrid-detailPanels': {
    position: 'inherit',
  },
  '& ul.MuiPagination-ul li:first-child': {
    borderLeft: 'solid',
    borderBottomLeftRadius: 6,
    borderTopLeftRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  '& ul.MuiPagination-ul li:first-child .MuiPaginationItem-root': {
    borderBottomLeftRadius: 6,
    borderTopLeftRadius: 6,
  },
  '& ul.MuiPagination-ul li:last-child .MuiPaginationItem-root': {
    borderBottomRightRadius: 6,
    borderTopRightRadius: 6,
  },
  '& ul.MuiPagination-ul li:last-child': {
    borderRight: 'solid',
    borderBottomRightRadius: 6,
    borderTopRightRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  '& ul.MuiPagination-ul li': {
    borderLeft: 'solid',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  '& ul.MuiPagination-ul li .MuiPaginationItem-root.Mui-selected': {
    border: 'solid',
    borderWidth: 1,
    borderColor: '#22D3EE',
  },
  '& .MuiDataGrid-virtualScroller': {
    position: 'relative',
    left: 0,
  },
  '& .MuiDataGrid-detailPanel': {
    position: 'absolute',
    zIndex: 1,
  },
  '& .MuiDataGrid-pinnedColumns': {
    zIndex: 0,
  },
  '& .MuiDataGrid-pinnedColumns.MuiDataGrid-pinnedColumns--left': {
    zIndex: 1,
  },
  '& .MuiDataGrid-pinnedColumnHeaders': {
    zIndex: 0,
  },
  '& .MuiDataGrid-pinnedColumnHeaders.MuiDataGrid-pinnedColumnHeaders--left': {
    zIndex: 1,
  },
  '& .MuiDataGrid-pinnedColumns:has(> div > .PinnedColumLeftBorder)': {
    borderLeftWidth: 2,
    borderColor: 'rgb(6 182 212)',
  },
  '& .MuiDataGrid-pinnedColumnHeaders:has(> div > .PinnedColumLeftBorder)': {
    borderLeftWidth: 2,
    borderColor: 'rgb(6 182 212)',
  },
  '& .MuiDataGrid-pinnedColumnHeaders--right .MuiDataGrid-columnHeader': {
    marginLeft: -2,
  },
  ...customCheckbox(theme),
  // MuiTableRow style overrides
  '& .MuiTableRow-root:hover': {
    backgroundColor: 'transparent !important',
  },
  '& .MuiDataGrid-row.Mui-selected': {
    backgroundColor: '#e1f8ff !important',
  },
}));

export const globalPaginationConfig = {
  rowsPerPageOptions: [10, 25, 50],
  activePageSize: 10,
};

const CustomPagination = () => {
  const apiRef = useGridApiContext();
  const page = useGridSelector(apiRef, gridPageSelector);
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);

  return (
    <Pagination
      color="primary"
      variant="outlined"
      shape="rounded"
      page={page + 1}
      showFirstButton
      showLastButton
      count={pageCount}
      renderItem={(items) => (
        <PaginationItem
          sx={{ borderRadius: 8 }}
          components={{
            first: KeyboardDoubleArrowLeftIcon,
            last: KeyboardDoubleArrowRightIcon,
          }}
          {...items}
        />
      )}
      // @ts-expect-error
      onChange={(event: React.ChangeEvent<unknown>, value: number) =>
        apiRef.current.setPage(value - 1)
      }
    />
  );
};
export interface SearchDetailGridProps {
  pageNumber?: number;
  pageSize?: number;
  totalCount?: number | undefined;
  rows: any[];
  columns: GridColDef[];
  hideHeader?: boolean;
  hideFooter?: boolean;
  detailPanelExpandedRowIds?: any[];
  expandedRowContent?: (params: GridRowParams) => React.ReactNode;
  onDetailPanelExpandedRowIdsChange?: any;
  checkboxSelection?: boolean;
  paginationMode?: GridFeatureMode;
  onSortChange?: (
    field: string | undefined,
    sort: 'asc' | 'desc' | null | undefined
  ) => void;
  selectRows?: number[];
  onSelectRow?: (selectionIds: number[]) => void;
  onPageSizeChange?: (pageSize: number, page: number) => void;
  onPageChange?: (page: number, details: GridCallbackDetails<any>) => void;
  headerContent?: JSX.Element;
  footerContent?: JSX.Element;
  setHeaderRadiusCSS?: boolean;
  pinnedColumns?: GridPinnedColumns;
  showTableHeading?: boolean;
  footerPaginationContent?: boolean;
  persistLayoutId?: number;
  nonPersistCols?: string[];
  disableRowSelection?: boolean;
  onSelectAllClick?: () => void;
}
export default function SearchDetailGrid({
  columns,
  totalCount,
  rows,
  pageNumber = 1,
  pageSize = globalPaginationConfig.activePageSize,
  onDetailPanelExpandedRowIdsChange,
  detailPanelExpandedRowIds,
  expandedRowContent,
  hideHeader = false,
  hideFooter = false,
  checkboxSelection = true,
  paginationMode = 'server',
  onSortChange,
  selectRows,
  onSelectRow,
  onPageSizeChange,
  onPageChange,
  headerContent,
  footerContent,
  setHeaderRadiusCSS = true,
  pinnedColumns,
  showTableHeading = true,
  footerPaginationContent = true,
  persistLayoutId,
  nonPersistCols,
  disableRowSelection = true,
  onSelectAllClick,
}: SearchDetailGridProps) {
  const [pageNum, setPageNum] = useState(pageNumber);
  const [itemsPerPage, setItemsPerPage] = useState(pageSize);
  useEffect(() => {
    setPageNum(pageNumber);
    setItemsPerPage(pageSize);
  }, [pageNumber, pageSize]);
  const apiRef = useGridApiRef();
  const RowsPerPageOptionsView = () => {
    const { rowsPerPageOptions } = globalPaginationConfig;
    return (
      <>
        <div className="inline-flex items-center justify-start space-x-2">
          <p className="text-sm leading-tight text-gray-500">
            Results per page:
          </p>
          <div className="flex items-start justify-start rounded-md shadow">
            {rowsPerPageOptions.map((d, index) => {
              return (
                <button
                  key={`${index}`}
                  className={`[box-shadow-width:1px] inline-flex flex-col !cursor-pointer justify-center items-center self-stretch text-center font-medium pl-[17px] pr-[17px] pt-[9px] pb-[9px] w-[51px] font-['Nunito'] transition-all
                  ${
                    itemsPerPage === d
                      ? '[box-shadow:0px_0px_0px_1px_rgba(34,_211,_238,_1)_inset] bg-[rgba(236,254,255,1)] text-[rgba(6,182,212,1)]'
                      : '[box-shadow:0px_0px_0px_1px_rgba(209,_213,_219,_1)_inset] bg-white text-gray-500'
                  } ${index === 0 ? 'rounded-l-md' : ''} ${
                    index === rowsPerPageOptions.length - 1
                      ? 'rounded-r-md'
                      : ''
                  }`}
                  onClick={() => {
                    apiRef.current.setPageSize(d);
                  }}
                >
                  <p className="m-0 text-sm leading-5">{d}</p>
                </button>
              );
            })}
          </div>
        </div>
      </>
    );
  };

  function adjustDetailPanelPosition(
    $grid: JQuery<HTMLElement>,
    $detailPanel: JQuery<HTMLElement>
  ) {
    const xpos = $grid.scrollLeft();
    $detailPanel.css({
      left: xpos || 0,
    });
  }
  // Expanded Row Fix position on table scroll
  $('.MuiDataGrid-virtualScroller').each(function () {
    const $this = $(this);
    const $detailPanel = $this.find('.MuiDataGrid-detailPanel');

    // Initialize the detail panel position
    adjustDetailPanelPosition($this, $detailPanel);

    // Update detail panel position on scroll
    $this.on('scroll', function () {
      adjustDetailPanelPosition($this, $detailPanel);
    });
  });
  $(document).ready(function () {
    $('.MuiDataGrid-main').css({
      borderTopRightRadius: setHeaderRadiusCSS ? 8 : 0,
      borderTopLeftRadius: setHeaderRadiusCSS ? 8 : 0,
    });
  });
  const theme = createTheme({
    typography: {
      fontFamily: ['Nunito'].join(','),
    },
  });
  const nonLayoutFields = ['__detail_panel_toggle__', '__check__', 'actions'];
  type TLayout = {
    field_name: string;
    hide: boolean;
    order: number;
  };
  const [columnVisibilityModel, setColumnVisibilityModel] = useState({});
  const [columnsData, setColumnsData] = useState<GridColDef[]>([]);
  let columnsDataTemp: GridColDef[] = [];
  const [loadFilterModal, setLoadFilterModal] = useState(false);
  const handleColumnsData = (data: GridColDef[]) => {
    const transformedColumns: GridColDef[] = data.map((row) => {
      return {
        ...row,
        disableReorder: persistLayoutId
          ? !!nonLayoutFields.includes(row.field)
          : true,
        hide: nonPersistCols?.includes(row.field)
          ? columns.filter((f) => f.field === row.field)[0]?.hide
          : row.hide,
      };
    });
    setColumnsData(transformedColumns);

    const result: { [key: string]: boolean } = {};
    transformedColumns.forEach((item) => {
      result[item.field] = !item.hide;
    });
    setColumnVisibilityModel(result);
  };

  const fetchGridLayoutData = async () => {
    if (persistLayoutId) {
      const resDate = await getGridLayoutData(persistLayoutId);
      if (resDate && resDate.length > 0) {
        const persistLayoutDate: TLayout[] = JSON.parse(resDate[0].value);
        const persisttTransformedColumns = persistLayoutDate
          .map((persistRow) => {
            const foundColumn: GridColDef = {
              ...columns.find((f) => f.field === persistRow.field_name),
            } as GridColDef;
            if (foundColumn) {
              foundColumn.hide = persistRow.hide;
              return foundColumn;
            }
            return undefined;
          })
          .filter((f) => f !== undefined) as GridColDef[];

        const notInPersistLayoutData = columns.filter((column) => {
          return !persistLayoutDate.some(
            (layout) => layout.field_name === column.field
          );
        });

        const finalInLayoutData = [
          ...persisttTransformedColumns,
          ...notInPersistLayoutData,
        ];

        handleColumnsData(finalInLayoutData);
      } else {
        handleColumnsData(columns);
      }
    }
  };

  useEffect(() => {
    if (nonPersistCols) {
      const updatedModel: any = { ...columnVisibilityModel };
      nonPersistCols.forEach((entity) => {
        // eslint-disable-next-line no-prototype-builtins
        if (updatedModel.hasOwnProperty(entity)) {
          updatedModel[entity] = !columns.filter((f) => f.field === entity)[0]
            ?.hide;
        }
      });
      setColumnVisibilityModel(updatedModel);
    }
    if (!persistLayoutId) {
      const result: { [key: string]: boolean } = {};
      columns.forEach((item) => {
        result[item.field] = !item.hide;
      });
      setColumnVisibilityModel(result);
      setColumnsData(columns);
    }
  }, [columns]);

  useEffect(() => {
    if (persistLayoutId) {
      fetchGridLayoutData();
    }
  }, []);

  let columnReorderInfo:
    | { field: string; oldIndex: number; targetIndex?: number }
    | undefined;

  const handleColumnReorder = async (evt: GridColumnOrderChangeParams) => {
    columnsDataTemp = [...columnsData];
    const { targetIndex } = evt;

    if (columnReorderInfo?.field !== evt.field) {
      columnReorderInfo = { field: evt.field, oldIndex: evt.oldIndex };
    }

    if (columnReorderInfo.oldIndex !== targetIndex) {
      columnReorderInfo.targetIndex = targetIndex;
    }
  };

  const onDragEndCapture = async () => {
    if (columnReorderInfo && columnReorderInfo?.targetIndex) {
      const columnsDataModi = [...columnsData];

      // Remove the element from the old index
      const oI = columnReorderInfo.oldIndex;
      const removedElement = columnsDataModi.splice(oI, 1)[0];

      // Insert the removed element at the target index
      const tI = columnReorderInfo.targetIndex;
      if (removedElement) columnsDataModi.splice(tI, 0, removedElement);

      if (persistLayoutId) {
        const gridJason = columnsDataModi.map((row, i) => {
          return { field_name: row.field, hide: !!row.hide, order: i };
        });
        const res = await addUpdateGridLayout(
          persistLayoutId,
          JSON.stringify(gridJason)
        );
        columnReorderInfo = undefined;
        if (res) {
          handleColumnsData(columnsDataModi);
        } else {
          handleColumnsData(columnsDataTemp);
        }
      } else {
        handleColumnsData(columnsDataModi);
      }
    }
  };

  const CustomHeader = () => {
    let pageInfo = '';
    if (totalCount && itemsPerPage && pageNum) {
      const startIndex = (pageNum - 1) * itemsPerPage;
      const startRow = startIndex + 1;
      const endRow = Math.min(startIndex + itemsPerPage, totalCount);
      pageInfo = `Showing ${startRow} to ${endRow} of ${totalCount} results`;
    } else {
      pageInfo = `0 results`;
    }
    return (
      <>
        <div
          className={`flex w-full justify-between py-6 ${
            !showTableHeading && 'pt-2.5'
          }`}
        >
          {showTableHeading && (
            <div className="relative w-[50%]">
              <div className="absolute top-[-5px]">
                <p className="text-xl font-bold leading-7 text-gray-700">
                  Results
                </p>
              </div>
              <div className="absolute top-[23px]">
                <p className="text-sm leading-tight text-gray-500">
                  {pageInfo}
                </p>
              </div>
            </div>
          )}
          {!showTableHeading && (
            <div className="relative w-[50%] self-center">
              <div className="">
                <p className="flex text-sm leading-tight text-gray-500">
                  {pageInfo}
                </p>
              </div>
            </div>
          )}
          <div className="flex">
            <RowsPerPageOptionsView />
            {!!persistLayoutId && (
              <ColumnVisibilityDropdown
                key={JSON.stringify(1)}
                cls={'inline-flex'}
                popperCls={'w-[300px] px-2 !z-[9992]'}
                loadFilterModal={loadFilterModal}
                nonPersistCols={nonPersistCols}
                onApplyChange={async (value) => {
                  if (persistLayoutId) {
                    const gridJason = value.map((row, i) => {
                      return {
                        field_name: row.field,
                        hide: !!row.hide,
                        order: i,
                      };
                    });
                    const res = await addUpdateGridLayout(
                      persistLayoutId,
                      JSON.stringify(gridJason)
                    );
                    if (res) {
                      handleColumnsData(value);
                    } else {
                      handleColumnsData(columnsData);
                    }
                  } else {
                    handleColumnsData(value);
                  }
                }}
                columnsData={columnsData}
                buttonContent={
                  <div
                    className="relative cursor-pointer text-cyan-500"
                    onClick={async () => {
                      setLoadFilterModal(!loadFilterModal);
                    }}
                  >
                    <Button
                      buttonType={ButtonType.secondary}
                      cls="inline-flex space-x-2 h-[38px] items-center justify-center ml-[10px] bg-white hover:!bg-white shadow border rounded-md border-gray-300"
                    >
                      <Icon
                        className="h-full w-5 rounded-lg"
                        name="options2"
                        size={20}
                        color={IconColors.GRAY}
                      />
                      <p className="text-sm font-medium leading-tight text-gray-700">
                        Columns
                      </p>
                    </Button>
                  </div>
                }
              />
            )}
          </div>
        </div>
        <div className="w-full">{headerContent}</div>
      </>
    );
  };
  const CustomFooter = () => {
    return (
      <>
        <div className="w-full">{footerContent}</div>
        {footerPaginationContent && (
          <GridFooterContainer>
            <div></div>
            <CustomPagination />
          </GridFooterContainer>
        )}
      </>
    );
  };
  // const Checkbox = (props: any) => {
  //   return <CheckBox {...props} />;
  // };
  const preventOnPageChange = useRef(false);

  return (
    <ThemeProvider theme={theme}>
      <div
        onDragEndCapture={onDragEndCapture}
        style={{
          height: '100%',
          width: '100%',
        }}
      >
        {!hideHeader && CustomHeader()}
        <StyledDataGrid
          apiRef={apiRef}
          autoHeight
          classes={customClasses}
          rows={rows}
          rowCount={totalCount}
          paginationMode={paginationMode}
          sortingOrder={['asc', 'desc']}
          sortingMode={paginationMode}
          onSortModelChange={(model: GridSortModel) => {
            if (onSortChange) onSortChange(model[0]?.field, model[0]?.sort);
          }}
          onPageSizeChange={(page_Size: number) => {
            const { page, rowCount } = apiRef.current.state.pagination;
            const pageCount = Math.ceil(rowCount / page_Size);
            const activePage = page + 1;

            if (pageCount < activePage) {
              preventOnPageChange.current = true;
            }

            setItemsPerPage(page_Size);
            setPageNum(Math.min(activePage, pageCount));

            if (onPageSizeChange)
              onPageSizeChange(page_Size, Math.min(activePage, pageCount));
          }}
          onPageChange={(page: number, details: GridCallbackDetails<any>) => {
            if (preventOnPageChange.current) {
              preventOnPageChange.current = false;
              return;
            }
            setPageNum(page + 1);
            if (onPageChange) onPageChange(page + 1, details);
          }}
          hideFooter={hideFooter}
          columns={columnsData}
          columnVisibilityModel={columnVisibilityModel}
          disableSelectionOnClick={disableRowSelection}
          disableColumnMenu
          onColumnOrderChange={handleColumnReorder}
          page={pageNum && pageNum - 1}
          pageSize={itemsPerPage}
          pagination
          rowsPerPageOptions={[]}
          localeText={{
            footerRowSelected: CustomPagination,
          }}
          components={{
            // Header: !hideHeader ? CustomHeader : undefined,
            Footer: CustomFooter,
            // BaseCheckbox: Checkbox,
          }}
          rowThreshold={0}
          getDetailPanelContent={expandedRowContent}
          getDetailPanelHeight={() => 'auto'}
          detailPanelExpandedRowIds={detailPanelExpandedRowIds}
          onDetailPanelExpandedRowIdsChange={onDetailPanelExpandedRowIdsChange}
          checkboxSelection={checkboxSelection}
          keepNonExistentRowsSelected={true}
          selectionModel={selectRows}
          onSelectionModelChange={(newSelectionModel: GridSelectionModel) => {
            if (onSelectRow)
              onSelectRow(
                newSelectionModel.map((gridRowId) => Number(gridRowId))
              );
          }}
          onColumnHeaderClick={(data) => {
            if (data.field === '__check__') {
              if (onSelectAllClick) {
                onSelectAllClick();
              }
            }
          }}
          getRowHeight={() => 'auto'}
          pinnedColumns={pinnedColumns}
        />
      </div>
    </ThemeProvider>
  );
}
