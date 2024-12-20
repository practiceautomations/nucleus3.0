import { ClickAwayListener, Popper } from '@mui/material';
import type { ReactNode } from 'react';
import React, { useEffect, useRef } from 'react';

import Icon from '@/components/Icon';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';

export interface TProps {
  text: string | ReactNode;
  position: 'left' | 'right' | 'top' | 'bottom';
  openToggle?: boolean;
  showOnHover?: boolean;
  onToggle?: (isOpen: boolean) => void;
}

export default function InfoToggle({
  text,
  position,
  openToggle,
  showOnHover = false,
  onToggle,
}: TProps) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const isClickAwayListener = useRef(false);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!isClickAwayListener.current) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const openPopover = Boolean(anchorEl);

  const id = openPopover ? 'simple-popover-info-toggle' : undefined;

  useEffect(() => {
    if (onToggle) onToggle(openPopover);
  }, [openPopover]);

  useEffect(() => {
    const button = document.querySelector('#my-button') as HTMLButtonElement;
    if (button && openToggle) {
      setTimeout(() => {
        button.click();
      }, 200);
    }
  }, []);

  // const renderOrigin = (type: string) => {
  //   const positions: any = {
  //     right: {
  //       anchor: { vertical: 'center', horizontal: 'right' },
  //       transform: { vertical: 'center', horizontal: 'left' },
  //     },
  //     left: {
  //       anchor: { vertical: 'center', horizontal: 'left' },
  //       transform: { vertical: 'center', horizontal: 'right' },
  //     },
  //     top: {
  //       anchor: { vertical: 'top', horizontal: 'center' },
  //       transform: { vertical: 'bottom', horizontal: 'center' },
  //     },
  //     bottom: {
  //       anchor: { vertical: 'bottom', horizontal: 'center' },
  //       transform: { vertical: 'top', horizontal: 'center' },
  //     },
  //   };

  //   return positions[position][type];
  // };

  const handleMouseOver = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (showOnHover) {
      handleClick(event);
    }
  };

  const handleMouseLeave = () => {
    if (showOnHover) {
      handleClose();
    }
  };

  return (
    <>
      <button
        className="flex items-center"
        onMouseOver={handleMouseOver}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        id="my-button"
        tabIndex={-1}
      >
        <Icon name="help" size={16} color={IconColors.GRAY_600} />
      </button>
      <ClickAwayListener
        mouseEvent="onMouseDown"
        touchEvent="onTouchStart"
        onClickAway={() => {
          isClickAwayListener.current = true;
          handleClose();
          setTimeout(() => {
            isClickAwayListener.current = false;
          }, 300);
        }}
      >
        <Popper
          id={id}
          open={openPopover}
          anchorEl={anchorEl}
          placement={position}
          // onClose={handleClose}
          // anchorOrigin={renderOrigin('anchor')}
          // transformOrigin={renderOrigin('transform')}
          // classes={{
          //   paper: 'info-toggle-popover',
          // }}
          modifiers={[
            {
              name: 'offset',
              options: {
                offset: [0, 10],
              },
            },
          ]}
          onPointerEnterCapture={undefined} // Ensure this event handler is defined
          onPointerLeaveCapture={undefined}
          placeholder=""
        >
          <div
            className={classNames(
              `info-toggle-popover info-toggle-popover-${position} relative flex items-center`,
              ['top', 'bottom'].includes(position) ? 'flex-col' : ''
            )}
          >
            {position === 'right' && (
              <div id="arrow-right" className="border-gray-700"></div>
            )}
            {position === 'bottom' && (
              <div id="arrow-bottom" className="border-gray-700"></div>
            )}
            <div className="inline-flex max-w-[240px] items-center justify-start rounded bg-gray-700 p-2">
              <p className="flex-1 text-xs leading-[14px] text-white">{text}</p>
            </div>
            {position === 'top' && (
              <div id="arrow-top" className="border-gray-700"></div>
            )}
            {position === 'left' && (
              <div id="arrow-left" className="border-gray-700"></div>
            )}
          </div>
        </Popper>
      </ClickAwayListener>
    </>
  );
}
