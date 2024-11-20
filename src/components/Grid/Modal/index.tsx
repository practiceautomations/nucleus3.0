import { ClickAwayListener, Popper } from '@mui/material';
import Button from '@mui/material/Button';
import * as React from 'react';
import { useRef, useState } from 'react';

import Icon from '@/components/Icon';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';

export interface GridModalProps {
  children: React.ReactNode;
  cls?: string;
  clsDiv?: string;
  txt?: string;
  icon: React.ReactNode;
  value?: string;
  disabled?: boolean;
  testId?: string;
}
export default function GridModal({
  children,
  cls,
  txt,
  icon,
  value,
  clsDiv,
  disabled = false,
  testId,
}: GridModalProps) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const isClickAwayListener = useRef(false);
  const [open, setOpen] = React.useState(false);
  const id = open ? 'simple-popover' : undefined;
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!isClickAwayListener.current) {
      setAnchorEl(event.currentTarget);
      setOpen(!open);
    }
  };

  return (
    <div>
      <Button
        data-testid={`gridModelFeildValue-${testId}`}
        disableRipple
        className={classNames(
          '!h-[38px] w-full !justify-start rounded-md  !text-gray-800 shadow-none ',
          disabled ? '!bg-gray-100' : '!bg-white'
        )}
        style={{
          border: '1px solid #D1D5DB',
          boxShadow: 'none',
          padding: '6px 11px',
          outline: isFocused ? '2px solid rgb(6 182 212)' : 'none',
          outlineOffset: '2px',
        }}
        aria-describedby={id}
        variant="contained"
        onClick={handleClick}
        disabled={disabled}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        <span className="mr-6 truncate !font-[Nunito] font-medium sm:text-sm">
          {value}
        </span>
        <span className="absolute right-1.5 top-2">
          <Icon name={'dropdown'} size={18} color={IconColors.GRAY} />
        </span>
      </Button>
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
        <Popper id={id} open={open} anchorEl={anchorEl} className="z-[13]">
          <div className="mt-1 mr-7 flex flex-col items-start justify-start rounded-lg border border-gray-200 bg-white">
            <div className="inline-flex items-start justify-start">
              {children}
            </div>
            <div
              className={classNames(
                'inline-flex space-x-2 items-center justify-start bg-gray-200 w-full ',
                clsDiv || ''
              )}
            >
              <div
                className={classNames(
                  'flex items-center justify-center ',
                  cls || ''
                )}
              >
                {icon}
              </div>
              <p className="text-sm font-medium leading-tight text-gray-700">
                {txt}
              </p>
            </div>
          </div>
        </Popper>
      </ClickAwayListener>
    </div>
  );
}
