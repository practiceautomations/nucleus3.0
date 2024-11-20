import { ClickAwayListener, Popper } from '@mui/material';
import * as React from 'react';
import { useRef, useState } from 'react';

import Icon from '@/components/Icon';
import classNames from '@/utils/classNames';

import Button, { ButtonType } from '../Button';
import type { ButtonSelectDropdownDataType } from '../ButtonSelectDropdown';

interface Tprops {
  buttonContent?: JSX.Element;
  placeholder?: string;
  selectedValue?: ButtonSelectDropdownDataType[];
  data: ButtonSelectDropdownDataType[];
  onChange?: (res: ButtonSelectDropdownDataType[]) => void;
  onCancel?: () => void;
  showSelection?: boolean;
  isSingleSelect?: boolean;
  disabled?: boolean;
  cls?: string;
  clsSelection?: string;
}

export default function ButtonSelectDropdownForExport({
  buttonContent,
  placeholder = 'Press me',
  selectedValue,
  data,
  onChange,
  onCancel,
  showSelection = false,
  isSingleSelect = false,
  disabled = false,
  cls,
  clsSelection,
}: Tprops) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const isClickAwayListener = useRef(false);
  const [open, setOpen] = React.useState(false);
  const id = open ? 'filter-popover' : undefined;

  const [selectionsValue, setSelectionsValue] = useState<
    ButtonSelectDropdownDataType[]
  >([]);
  const handleClick = (event: any) => {
    if (!isClickAwayListener.current && !disabled) {
      setAnchorEl(event.currentTarget);
      setOpen(!open);
      if (selectedValue) setSelectionsValue(selectedValue);
    }
  };
  const onSelect = (d: ButtonSelectDropdownDataType) => {
    if (d?.inactive) return;
    if (!showSelection) {
      setOpen(false);
      if (onChange) onChange([d]);
      return;
    }
    const isExist = selectionsValue
      .map((m) => {
        return m.id;
      })
      .includes(d.id);
    let res: ButtonSelectDropdownDataType[] = [];
    if (isExist) {
      res = selectionsValue.filter((m) => m.id !== d.id);
    } else if (isSingleSelect) {
      res = [d];
    } else {
      res = [...selectionsValue, d];
    }
    setSelectionsValue([...res]);
  };
  const onPressApply = () => {
    setOpen(false);
    if (onChange) onChange(selectionsValue);
  };
  const onPressCancel = () => {
    setOpen(false);
    if (onCancel) onCancel();
  };
  return (
    <>
      <div className={classNames(cls || '')} onClick={handleClick}>
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
          setTimeout(() => {
            isClickAwayListener.current = false;
          }, 300);
        }}
      >
        <Popper
          placement="bottom-end"
          id={id}
          open={open}
          anchorEl={anchorEl}
          className="z-[100]"
        >
          <div className="mt-1 flex w-[250px] flex-col items-start justify-start rounded-lg border border-gray-200 bg-white">
            <div className="z-10 w-full rounded-md bg-white ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              <div className={classNames(clsSelection || '')}>
                {data.map((d, index) => (
                  <div
                    key={index}
                    className={classNames(
                      'border-solid border-2 border-transparent',
                      selectionsValue
                        .map((m) => {
                          return m.id;
                        })
                        .includes(d.id)
                        ? 'bg-gray-50 font-semibold'
                        : ' ',
                      d?.inactive ? 'bg-gray-100 text-gray-500' : '',
                      'relative cursor-default select-none py-2 pl-3 pr-9  hover:border-transparent hover:bg-gray-100'
                    )}
                    onClick={() => {
                      onSelect(d);
                    }}
                  >
                    <>
                      {selectionsValue
                        .map((m) => {
                          return m.id;
                        })
                        .includes(d.id) &&
                        showSelection && (
                          <span
                            className={classNames(
                              selectionsValue
                                .map((m) => {
                                  return m.id;
                                })
                                .includes(d.id)
                                ? 'text-cyan-400'
                                : '',
                              ` absolute inset-y-0 left-0 flex items-center pl-1.5`
                            )}
                          >
                            <svg
                              className="h-5 w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        )}
                      <div className="flex flex-row">
                        {!!d.icon && (
                          <div className="mb-[3px] flex items-center pr-1">
                            <Icon name={d.icon} size={20} />
                          </div>
                        )}
                        <span
                          className={classNames(
                            'block flex flex-row items-center',
                            showSelection ? 'ml-6' : ''
                          )}
                        >
                          {d.value}
                        </span>
                      </div>
                    </>
                  </div>
                ))}
              </div>
            </div>
            {showSelection && (
              <div className="inline-flex w-full items-center justify-end space-x-2 bg-gray-50 p-4">
                <div className="flex flex-1 items-center justify-center">
                  <Button
                    fullWidth
                    buttonType={ButtonType.secondary}
                    onClick={onPressCancel}
                  >
                    Cancel
                  </Button>
                </div>
                <div className="flex flex-1 items-center justify-center">
                  <Button
                    fullWidth
                    buttonType={ButtonType.primary}
                    onClick={onPressApply}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Popper>
      </ClickAwayListener>
    </>
  );
}
