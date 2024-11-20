import { ClickAwayListener, Popper } from '@mui/material';
import * as React from 'react';
import { useRef } from 'react';

import Tabs from '@/components/OrganizationSelector/Tabs';
import classNames from '@/utils/classNames';

import Button, { ButtonType } from '../Button';
import type { MultiSelectViewDataType } from '../MultiSelectView/MultiSelectView';
import MultiSelectView from '../MultiSelectView/MultiSelectView';

interface Tprops {
  buttonContent?: JSX.Element;
  disabled?: boolean;
  cls?: string;
  popperCls?: string;
  placeholder?: string;
  filtersData: FilterModalTabProps[];
  onApplyFilter: (value: FilterModalTabProps[]) => void;
  loadFilterModal?: boolean;
}
export interface FilterModalTabProps {
  id: number | string;
  name: string;
  active: boolean;
  showSearchBar?: boolean;
  isSingleSelection?: boolean;
  count?: number | undefined;
  selectedValue: MultiSelectViewDataType[];
  data: MultiSelectViewDataType[];
}

export default function FilterModal({
  buttonContent,
  disabled,
  cls,
  popperCls,
  placeholder = 'Press me',
  filtersData,
  onApplyFilter,
  loadFilterModal = true,
}: Tprops) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const isClickAwayListener = useRef(false);
  const [open, setOpen] = React.useState(false);
  const id = open ? 'filter-popover' : undefined;

  // React.useEffect (()=>{
  //   setTabData(filtersData);
  // },[])

  const [tabData, setTabData] = React.useState<FilterModalTabProps[]>([]);
  const handleClick = (event: any) => {
    if (!isClickAwayListener.current) {
      setAnchorEl(event.currentTarget);
      setOpen(!open);
    }
  };
  React.useEffect(() => {
    setTabData(filtersData);
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
          setTabData(filtersData);
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
          className={classNames('z-[100] w-full drop-shadow-lg', popperCls)}
        >
          <div className="mt-1 flex flex-col items-start justify-start rounded-lg border border-gray-200 bg-white">
            <div className="inline-flex w-full items-start justify-start overflow-x-auto">
              <Tabs
                tabs={tabData || []}
                onChangeTab={(tab: any) => {
                  const arr = tabData?.map((d) => {
                    return { ...d, active: d.id === tab.id };
                  });
                  setTabData(arr);
                }}
                currentTab={tabData?.filter((m) => m.active)[0]}
              />
            </div>
            <div
              data-testid="filterOptions"
              className="z-10 mt-1 w-full rounded-md bg-white ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
            >
              {tabData?.filter((m) => m.active)[0]?.data.length === 0 && (
                <p className="w-full py-3 !text-center text-sm leading-tight text-gray-500">
                  No rows
                </p>
              )}
              <MultiSelectView
                key={tabData?.filter((m) => m.active)[0]?.id}
                showSearchBar={
                  !!(
                    (tabData?.filter((m) => m.active)[0]?.data || []).length > 3
                  )
                }
                appendTextClass={'italic'}
                data={tabData?.filter((m) => m.active)[0]?.data || []}
                selectedValue={
                  tabData?.filter((m) => m.active)[0]?.selectedValue || []
                }
                onSelect={(res) => {
                  const isSingleSelection = !!tabData?.find((m) => m.active)
                    ?.isSingleSelection;
                  const activeSelectedValue =
                    isSingleSelection && res.length > 0
                      ? ([res[res.length - 1]] as MultiSelectViewDataType[])
                      : res;
                  const updatedTabData = tabData?.map((d) => ({
                    ...d,
                    selectedValue: d.active
                      ? activeSelectedValue
                      : d.selectedValue,
                    count: d.active ? res.length : d.count,
                  }));
                  setTabData(updatedTabData);
                }}
              />
            </div>
            <div
              className={classNames(
                'inline-flex space-x-2 items-center justify-end bg-gray-200 w-full px-4 py-4'
              )}
            >
              <div
                className={classNames(
                  'flex items-center justify-center w-143 h-[38px]'
                )}
              >
                <Button
                  buttonType={ButtonType.secondary}
                  onClick={() => {
                    setOpen(false);
                    setTabData(filtersData);
                  }}
                >
                  Cancel
                </Button>
              </div>
              <div
                data-testid="applyNoteFiler"
                className={classNames(
                  'flex items-center justify-center w-143 h-[38px]'
                )}
              >
                <Button
                  buttonType={ButtonType.primary}
                  onClick={() => {
                    onApplyFilter(tabData);
                    setOpen(false);
                  }}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </Popper>
      </ClickAwayListener>
    </>
  );
}
