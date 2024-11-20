import { Popover, Transition } from '@headlessui/react';
import React, { Fragment, useState } from 'react';

import Icon from '@/components/Icon';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';

interface DataType {
  id: number;
  title: string;
  showBottomDivider: boolean;
}
interface Tprops {
  buttonLabel: string;
  icon?: JSX.Element;
  dataList: DataType[];
  onSelect: (value: number) => void;
  onDropdownClick?: (value: boolean) => void;
  cls?: string;
  buttonCls?: string;
  popoverCls?: string;
  disabled?: boolean;
  showIcon?: boolean;
}
export default function ButtonDropdown({
  buttonLabel,
  icon,
  dataList,
  onSelect,
  cls = '',
  onDropdownClick,
  buttonCls,
  popoverCls,
  disabled,
  showIcon = false,
}: Tprops) {
  const [isOpen, setIsOpen] = useState(false);
  const bgDisableColor = () => {
    if (disabled) {
      return 'bg-gray-300 text-gray-500';
    }

    const baseColor = isOpen ? 'cyan-700' : 'cyan-500';
    const ringColor = isOpen ? 'cyan-700' : 'cyan-700';

    return `bg-${baseColor} focus:ring-${ringColor} hover:bg-${baseColor} text-white`;
  };

  return (
    <div
      data-testid="quickActionBtn"
      className={classNames(
        'flex w-[128px] xs:max-w-full sm:max-w-full lg:max-w-md items-center',
        cls || ''
      )}
    >
      <Popover as="div" className="relative flex w-full rounded-full">
        <>
          <Popover.Button
            className={classNames(
              '!h-[38px] relative inline-flex w-full items-center justify-center rounded-md border border-transparent py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-700 focus:ring-offset-2 sm:w-full md:justify-around md:px-2',
              bgDisableColor(),
              buttonCls || ''
            )}
            disabled={disabled}
          >
            {!!icon && (
              <div className="mr-0 flex h-5 w-5 content-center justify-center sm:mr-2">
                {icon}
              </div>
            )}
            <span
              className={classNames(
                'hidden truncate sm:block',
                icon ? 'mr-4' : ''
              )}
            >
              {buttonLabel}
            </span>
            {showIcon && !icon && (
              <span className="mr-0 flex h-5 w-5 content-center justify-center sm:mr-2">
                <Icon
                  name="chevronDown"
                  color={disabled ? IconColors.GRAY_500 : IconColors.WHITE}
                />
              </span>
            )}
          </Popover.Button>
        </>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Popover.Panel
            className={classNames(
              'absolute top-11 z-10 py-1 origin-top-right divide-y rounded-md bg-cyan-500 shadow-lg ring-1 ring-black/5 focus:outline-none w-[224px] ',
              !icon ? 'right-0' : '',
              popoverCls
            )}
          >
            {({ close, open }) => {
              setIsOpen(open);
              if (onDropdownClick) {
                onDropdownClick(open);
              }
              return (
                <div className="flex flex-col">
                  {!!dataList &&
                    dataList.map((d) => (
                      <div
                        className={classNames(
                          d.showBottomDivider
                            ? 'border-b border-cyan-400 hover:border-b hover:border-cyan-400'
                            : 'hover:border-0',
                          'py-2 px-4 hover:bg-cyan-700 focus:border-2 '
                        )}
                        key={d.title}
                      >
                        <button
                          className={classNames(
                            'w-full cursor-pointer text-left text-sm leading-5 font-normal text-white focus:outline-none '
                          )}
                          onClick={async () => {
                            onSelect(d.id);
                            close();
                          }}
                        >
                          {d.title}
                        </button>
                      </div>
                    ))}
                </div>
              );
            }}
          </Popover.Panel>
        </Transition>
      </Popover>
    </div>
  );
}
