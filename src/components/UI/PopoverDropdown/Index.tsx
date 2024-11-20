import { Popover, Transition } from '@headlessui/react';
import React, { Fragment, useEffect, useRef, useState } from 'react';

import ImageIcon from '@/components/ImageIcon';
import { AppConfig } from '@/utils/AppConfig';
import classNames from '@/utils/classNames';

export interface PopoverDropdownDataType {
  id: number;
  title: string;
  showBottomDivider: boolean;
}
interface Tprops {
  buttonLabel: string;
  icon?: JSX.Element;
  dataList: PopoverDropdownDataType[];
  selectedValue: PopoverDropdownDataType | undefined;
  onSelect: (value: PopoverDropdownDataType | undefined) => void;
  onDropdownClick?: (value: boolean) => void;
  cls?: string;
  buttonCls?: string;
  popoverCls?: string;
  showSearchBar?: boolean;
  forcefullyShowSearchBar?: boolean;
  onSearch?: (value: string) => void;
  searchOnCharacterLength?: number;
  searchDelayInSeconds?: number;
}
export default function PopoverDropdown({
  buttonLabel,
  icon,
  dataList,
  onSelect,
  cls = '',
  popoverCls = '',
  selectedValue,
  forcefullyShowSearchBar = false,
  searchOnCharacterLength = AppConfig.searchOnCharacterLength,
  searchDelayInSeconds = AppConfig.searchDelayInSeconds,
  onSearch,
}: Tprops) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);
  const [selectedOption, setSelectedOption] = useState<
    PopoverDropdownDataType | undefined
  >(selectedValue);
  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };
  const handleSelect = (id: number) => {
    const selected = dataList.find((item) => item.id === id);
    setSelectedOption(selected);
    setIsOpen(false);
    onSelect(selected);
  };
  const [query, setQuery] = useState(dataList);
  useEffect(() => {
    setQuery(dataList);
  }, [dataList]);
  const [enableSearchCall, setEnableSearchCall] = useState(true);
  const searchTxt = useRef('');
  const preSearchTxt = useRef('');
  const isSearch = () => {
    preSearchTxt.current = searchTxt.current;
    if (onSearch) {
      onSearch(searchTxt.current);
    }
  };
  const onTextChange = (txt: string) => {
    searchTxt.current = txt;
    if (txt.length >= searchOnCharacterLength && enableSearchCall) {
      isSearch();
      setEnableSearchCall(false);
      setTimeout(() => {
        setEnableSearchCall(true);
        if (searchTxt.current !== preSearchTxt.current) isSearch();
      }, searchDelayInSeconds * 1000);
    }
  };
  return (
    <div
      className={classNames(
        'flex xs:max-w-full sm:max-w-full lg:max-w-md items-center',
        cls || ''
      )}
    >
      <Popover as="div" className="relative w-full flex-col " ref={popoverRef}>
        <>
          <span onClick={handleToggle} className={'flex w-full'}>
            <span
              className={classNames(
                'text-sm leading-5 font-normal text-gray-700',
                icon ? 'mr-4' : ''
              )}
            >
              {buttonLabel}
            </span>
            {!icon && (
              <span className="m-[4px] flex h-[10px] w-[11px]  self-center sm:mr-2">
                <ImageIcon name="chevronDown" size={12} />
              </span>
            )}
          </span>
        </>
        <Transition
          as={Fragment}
          show={isOpen}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Popover.Panel
            className={classNames(
              'absolute z-10 mt-1 max-h-60 overflow-auto rounded-md bg-white text-base font-normal leading-5 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm',
              popoverCls || ''
            )}
          >
            {(dataList.length > 4 || forcefullyShowSearchBar) && (
              <div className="bg-gray-100 p-1">
                <input
                  type="text"
                  ref={(input) => {
                    setTimeout(() => {
                      if (input) input.focus();
                    }, 500);
                  }}
                  onChange={(e) => {
                    const txt = e.target.value;
                    if (onSearch) {
                      onTextChange(txt);
                    } else {
                      setQuery(
                        dataList.filter((d) => {
                          return d.title
                            .toLowerCase()
                            .includes(txt.toLowerCase());
                        })
                      );
                    }
                  }}
                  className={
                    'w-full rounded-md border border-solid border-gray-300 bg-white py-2 pl-3 pr-10 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300 sm:text-sm'
                  }
                  aria-describedby="email-error"
                  placeholder="Type to search..."
                />
              </div>
            )}
            {query.length ? (
              query.map((d) => (
                <div
                  className={classNames(
                    d.showBottomDivider
                      ? 'border-b border-gray-300 hover:border-b hover:border-gray-300'
                      : 'hover:border-0',
                    'py-2 px-4 hover:bg-gray-100 focus:border-2',
                    selectedOption?.id === d.id ? 'bg-gray-200' : '' // Apply background color to selected option
                  )}
                  key={d.title}
                >
                  <button
                    className={classNames(
                      'w-full cursor-pointer text-left text-sm leading-5 font-normal text-gray-800 focus:outline-none '
                    )}
                    onClick={async () => {
                      handleSelect(d.id);
                    }}
                  >
                    {d.title}
                  </button>
                </div>
              ))
            ) : (
              <div className="p-2 text-sm text-gray-500">No results found.</div>
            )}
          </Popover.Panel>
        </Transition>
      </Popover>
    </div>
  );
}
