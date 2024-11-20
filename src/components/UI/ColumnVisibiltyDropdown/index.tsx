import { ClickAwayListener, Popper } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid-pro';
import * as React from 'react';
import { useRef } from 'react';

import classNames from '@/utils/classNames';

import Button, { ButtonType } from '../Button';
import type { MultiSelectViewDataType } from '../MultiSelectView/MultiSelectView';
import ToggleButton from '../ToggleButton';

interface Tprops {
  buttonContent?: JSX.Element;
  disabled?: boolean;
  cls?: string;
  popperCls?: string;
  placeholder?: string;
  onApplyChange: (value: GridColDef[]) => void;
  loadFilterModal?: boolean;
  columnsData?: GridColDef[];
  nonPersistCols?: string[];
}
export interface ColumnVisibilityDropdownProps {
  id: number | string;
  name: string;
  active: boolean;
  showSearchBar?: boolean;
  isSingleSelection?: boolean;
  count?: number | undefined;
  selectedValue: MultiSelectViewDataType[];
  data: MultiSelectViewDataType[];
}

export default function ColumnVisibilityDropdown({
  buttonContent,
  disabled,
  cls,
  popperCls,
  placeholder = 'Press me',
  onApplyChange,
  loadFilterModal = true,
  columnsData,
  nonPersistCols,
}: Tprops) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const isClickAwayListener = useRef(false);
  const [open, setOpen] = React.useState(false);
  const id = open ? 'filter-popover' : undefined;
  const [isLayoutVisibilityChanged, setLayoutVisibilityChanged] =
    React.useState(false);

  const [columnData, setColumnData] = React.useState<GridColDef[]>();
  const handleClick = (event: any) => {
    if (!isClickAwayListener.current) {
      setAnchorEl(event.currentTarget);
      setOpen(!open);
    }
  };
  React.useEffect(() => {
    setColumnData(columnsData);
  }, [loadFilterModal]);
  return (
    <>
      <div className={classNames(cls)} onClick={handleClick}>
        {buttonContent ? (
          <>{buttonContent}</>
        ) : (
          <>
            <Button
              disabled={disabled}
              cls={classNames(
                disabled ? '!bg-gray-50 !text-gray-700' : '',
                'h-[38px] truncate'
              )}
              buttonType={ButtonType.primary}
            >
              {placeholder}
            </Button>
          </>
        )}
      </div>

      <ClickAwayListener
        mouseEvent="onMouseDown"
        touchEvent="onTouchStart"
        onClickAway={() => {
          isClickAwayListener.current = true;
          setOpen(false);
          if (isLayoutVisibilityChanged) {
            setLayoutVisibilityChanged(false);
            onApplyChange(columnData || []);
          }
          setTimeout(() => {
            isClickAwayListener.current = false;
          }, 300);
        }}
      >
        <Popper
          placement={'bottom'}
          id={id}
          open={open}
          anchorEl={anchorEl}
          className={classNames('z-[100] w-[300px] drop-shadow-lg', popperCls)}
        >
          <div className="mt-1 flex flex-col items-start justify-start rounded-lg border border-gray-200 bg-white">
            <div
              className={classNames(
                'flex flex-col bg-white w-full py-4 overflow-auto h-[350px] rounded-lg border border-gray-200'
              )}
            >
              {columnData
                ?.filter((f) => !nonPersistCols?.includes(f.field))
                .map((m, index) => (
                  <>
                    {m.headerName && (
                      <div className="w-full px-4 ">
                        <div className="flex justify-between">
                          <div className="flex justify-between" key={m.field}>
                            {m.headerName}
                          </div>
                          <ToggleButton
                            value={!m.hide}
                            onChange={(value) => {
                              setLayoutVisibilityChanged(true);
                              // Create a copy of the columnData array
                              const updatedColumnData = [...columnData];
                              if (updatedColumnData[index]) {
                                updatedColumnData[index]!.hide = !value ?? true;
                              }
                              // Update the state or trigger any other necessary action
                              setColumnData(updatedColumnData); // Assuming you have a state for columnData
                            }}
                          />
                        </div>
                        {columnData.length - 1 !== index ? (
                          <div className={`w-full py-2`}>
                            <div className={`inset-x-0 h-px bg-gray-300`}></div>
                          </div>
                        ) : (
                          <></>
                        )}
                      </div>
                    )}
                  </>
                ))}
            </div>
          </div>
        </Popper>
      </ClickAwayListener>
    </>
  );
}
