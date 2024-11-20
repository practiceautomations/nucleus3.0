import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import React, { Fragment, useEffect, useRef, useState } from 'react';

import Icon from '@/components/Icon';
import { AppConfig } from '@/utils/AppConfig';
import classNames from '@/utils/classNames';

import Button, { ButtonType } from '../Button';

export interface MultiSelectDropDownDataType {
  id: number;
  value: string;
  appendText?: string;
  active?: boolean;
  hide?: boolean;
}
interface Tprops {
  placeholder: string;
  selectedValue: MultiSelectDropDownDataType[];
  data: MultiSelectDropDownDataType[];
  onSelect: (value: MultiSelectDropDownDataType[]) => void;
  showSearchBar?: boolean;
  forcefullyShowSearchBar?: boolean;
  showSelectionInfo?: boolean;
  onSearch?: (value: string) => void;
  disabled?: boolean;
  cls?: string;
  appendTextClass?: string;
  searchOnCharacterLength?: number;
  searchDelayInSeconds?: number;
  isOptional?: boolean;
  onDeselectValue?: () => void;
}
export default function MultiSelectDropDown({
  placeholder,
  selectedValue,
  data,
  onSelect,
  onSearch,
  disabled = false,
  cls,
  appendTextClass,
  searchOnCharacterLength = AppConfig.searchOnCharacterLength,
  searchDelayInSeconds = AppConfig.searchDelayInSeconds,
  isOptional = false,
  forcefullyShowSearchBar = false,
  showSelectionInfo = true,
}: Tprops) {
  const [query, setQuery] = useState(data);
  useEffect(() => {
    setQuery(data);
  }, [data]);
  const onChange = (value: MultiSelectDropDownDataType[]) => {
    setTimeout(() => {
      onSelect(value);
    }, 100);
  };
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
  const [isOpen, setIsOpen] = useState(false);
  const isClickAwayListener = useRef(false);

  const [disabledInputFocus, setDisabledInputFocus] = useState(false);
  useEffect(() => {
    if (isOpen) setDisabledInputFocus(false);
  }, [isOpen]);

  const [breakCount, setBreakCount] = useState<number | null>(0);
  const [
    multiSelectDropDownListboxButtonWidth,
    setMultiSelectDropDownListboxButtonWidth,
  ] = useState(0);

  useEffect(() => {
    const el = document.querySelector(
      '.MultiSelectDropDownListboxButtonClass'
    ) as HTMLElement;
    if (el) {
      setMultiSelectDropDownListboxButtonWidth(el.offsetWidth);
    }
  });

  const shouldBreakOverflow = (id: string, i: number) => {
    const parent = document.getElementById(id)?.parentElement;
    const child = document.getElementById(id);

    if (parent && child) {
      const childPositionFromParent = child.offsetLeft + child.offsetWidth;
      const shouldHide =
        childPositionFromParent === 0 ||
        childPositionFromParent > parent.offsetWidth;

      child.style.display = shouldHide && i !== 0 ? 'none' : 'block';
      child.style.opacity = shouldHide && i !== 0 ? '0' : '1';

      return shouldHide;
    }

    return false;
  };

  useEffect(() => {
    const calculateBreakCount = async () => {
      let breakCountt = 0;
      const promises = selectedValue.map(async (d, i) => {
        const res = await shouldBreakOverflow(
          `MultiSelectDropDownListboxButtonClassItem-${d.id}`,
          i
        );
        if (res && i !== 0) {
          breakCountt += 1;
        }
      });
      await Promise.all(promises);
      setBreakCount(breakCountt);
    };
    calculateBreakCount();
  }, [selectedValue]);

  return (
    <Listbox
      as="div"
      value={selectedValue}
      onChange={(resArr) => {
        setDisabledInputFocus(true);
        // find duplicate data
        const seenDuplicate = resArr.filter(
          (value, index, self) =>
            index !==
            self.findIndex((t) => t.id === value.id && t.value === value.value)
        );
        // remove duplicate data
        const res = resArr.filter(function (objA) {
          return !seenDuplicate.find(function (objB) {
            return objA.id === objB.id && objA.value === objB.value;
          });
        });
        onChange(res);
      }}
      disabled={disabled}
      multiple
    >
      <div className="relative mt-1">
        <Listbox.Button
          id={'MultiSelectDropDownListboxButtonId'}
          className={classNames(
            'MultiSelectDropDownListboxButtonClass h-[38px] py-[6px] flex leading-5 relative w-full cursor-default rounded-md border-solid border border-gray-300 pl-[12px] pr-[70px] text-left focus:outline-none focus:ring-1 focus:ring-gray-300 font-medium sm:text-sm',
            disabled ? 'bg-gray-100' : 'bg-white',
            selectedValue ? 'text-gray-900' : 'text-gray-500',
            cls || ''
          )}
          onClick={() => {
            if (!isClickAwayListener.current) setIsOpen(true);
          }}
        >
          <div
            className="flex h-full flex-row gap-1 overflow-hidden"
            style={{ width: multiSelectDropDownListboxButtonWidth - 85 }}
          >
            {!showSelectionInfo || selectedValue.length === 0 ? (
              <div className={classNames('block truncate')}>
                <span
                  className={classNames('block truncate pt-0.5 text-gray-500')}
                >
                  {placeholder}
                </span>
              </div>
            ) : (
              <>
                {selectedValue.map((d, i) => {
                  return (
                    <div
                      key={i}
                      id={`MultiSelectDropDownListboxButtonClassItem-${d.id}`}
                      className={classNames(
                        'relative gap-1 bg-gray-100 rounded-md pl-[10px] h-full',
                        isOptional ? 'pr-[18px]' : 'pr-[10px]'
                      )}
                      style={{ opacity: 0 }}
                    >
                      <span className={classNames('block truncate py-0.5')}>
                        {d.value}
                      </span>
                      {isOptional && (
                        <Button
                          className="absolute top-[4px] right-[1px] flex h-[16px] w-[16px] items-center justify-center font-bold text-gray-400"
                          buttonType={ButtonType.secondary}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect(
                              selectedValue.filter((f) => f.id !== d.id)
                            );
                          }}
                        >
                          <Icon name={'deselect'} size={8} />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>
          {!!breakCount && (
            <div className="absolute bottom-[3px] right-[30px] flex h-[30px] w-[30px] items-center justify-center rounded-md bg-gray-100">
              +{breakCount}
            </div>
          )}
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>
        {isOpen && (
          <ClickAwayListener
            mouseEvent="onMouseDown"
            touchEvent="onTouchStart"
            onClickAway={() => {
              isClickAwayListener.current = true;
              setIsOpen(false);
              setTimeout(() => {
                isClickAwayListener.current = false;
              }, 300);
            }}
          >
            <div>
              <Transition
                show={isOpen}
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                afterLeave={() => {
                  setQuery(data);
                }}
              >
                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white text-base font-normal leading-5 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {(data.length > 4 || forcefullyShowSearchBar) && (
                    <div className="bg-gray-100 p-1">
                      <input
                        type="text"
                        ref={(input) => {
                          setTimeout(() => {
                            if (!disabledInputFocus && input) input.focus();
                          }, 500);
                        }}
                        onChange={(e) => {
                          const txt = e.target.value;
                          if (onSearch) {
                            onTextChange(txt);
                          } else {
                            setQuery(
                              data.filter((d) => {
                                return d.value
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
                  {query.map((d) => (
                    <>
                      {' '}
                      {!d.hide && (
                        <Listbox.Option
                          key={d.id}
                          className={({ active }) =>
                            classNames(
                              active
                                ? '!bg-cyan-400 !text-white border-solid border-2 border-cyan-400'
                                : 'border-solid border-2 border-transparent',
                              selectedValue
                                .map((m) => {
                                  return m.id;
                                })
                                .includes(d.id)
                                ? 'font-semibold'
                                : ' ',
                              d?.active === false
                                ? 'bg-gray-100 text-gray-500'
                                : '',
                              'relative cursor-default select-none py-2 pl-3 pr-9  hover:border-transparent hover:bg-gray-100'
                            )
                          }
                          value={d}
                          disabled={d?.active === false}
                        >
                          {({ active }) => (
                            <>
                              {selectedValue
                                .map((m) => {
                                  return m.id;
                                })
                                .includes(d.id) &&
                                !d.hide && (
                                  <span
                                    className={classNames(
                                      active ? '' : 'text-cyan-400',
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

                              {!d.hide && (
                                <span className={'ml-6 block'}>
                                  {d.value}
                                  {!!d?.appendText && (
                                    <span
                                      className={classNames(
                                        `${
                                          selectedValue
                                            .map((m) => {
                                              return m.id;
                                            })
                                            .includes(d.id)
                                            ? 'text-white'
                                            : 'text-gray-500'
                                        }
                       ${appendTextClass}`
                                      )}
                                    >
                                      {` - ${d?.appendText}`}
                                    </span>
                                  )}
                                </span>
                              )}
                            </>
                          )}
                        </Listbox.Option>
                      )}
                    </>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </ClickAwayListener>
        )}
      </div>
    </Listbox>
  );
}
