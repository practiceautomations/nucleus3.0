import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { Fragment, useEffect, useRef, useState } from 'react';

import Icon from '@/components/Icon';
import { AppConfig } from '@/utils/AppConfig';
import classNames from '@/utils/classNames';

import Button, { ButtonType } from '../Button';

export interface SingleSelectDropDownDataType {
  id: number;
  value: string;
  appendText?: string;
  active?: boolean;
  isAlreadyAdded?: boolean;
}

interface Tprops {
  placeholder: string;
  selectedValue?: SingleSelectDropDownDataType | null;
  data: SingleSelectDropDownDataType[];
  onSelect: (value: SingleSelectDropDownDataType) => void;
  showSearchBar?: boolean;
  forcefullyShowSearchBar?: boolean;
  onSearch?: (value: string) => void;
  disabled?: boolean;
  cls?: string;
  cls2?: string;
  btnUpperDivCls?: string;
  appendTextClass?: string;
  searchOnCharacterLength?: number;
  searchDelayInSeconds?: number;
  isOptional?: boolean;
  onDeselectValue?: () => void;
  testId?: string;
}

export default function SingleSelectDropDown({
  placeholder,
  selectedValue,
  data,
  onSelect,
  onSearch,
  disabled = false,
  cls,
  cls2,
  btnUpperDivCls,
  appendTextClass,
  searchOnCharacterLength = AppConfig.searchOnCharacterLength,
  searchDelayInSeconds = AppConfig.searchDelayInSeconds,
  isOptional = false,
  onDeselectValue,
  forcefullyShowSearchBar = false,
  testId,
}: Tprops) {
  const [query, setQuery] = useState(data);

  // Add reference to selected item
  const selectedItemRef = useRef<HTMLLIElement | null>(null);
  useEffect(() => {
    setQuery(data);
  }, [data]);

  // Scroll selected item into view when selectedValue changes
  useEffect(() => {
    if (selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedValue]);

  const onChange = (value: SingleSelectDropDownDataType) => {
    if (selectedValue !== value)
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
  return (
    <Listbox value={selectedValue} onChange={onChange} disabled={disabled}>
      {({ open }) => (
        <>
          <div className={classNames('relative mt-1', btnUpperDivCls)}>
            <Listbox.Button
              data-testid="prc"
              className={classNames(
                'h-[38px] flex leading-5 relative w-full cursor-default rounded-md border-solid border border-gray-300 pl-3 pr-10 text-left focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:ring-offset-0 font-medium sm:text-sm',
                disabled ? 'bg-gray-100' : 'bg-white',
                selectedValue ? 'text-gray-900' : 'text-gray-500',
                cls || '',
                isOptional && selectedValue?.value ? ' py-1.5' : 'py-2'
              )}
            >
              <div
                className={classNames(
                  'block truncate',
                  isOptional && selectedValue?.value
                    ? 'flex gap-1 bg-gray-100 rounded-md  pl-[10px] pr-2'
                    : ''
                )}
              >
                <span
                  data-testid={`singleDropdownSelectedValue-${testId}`}
                  className={classNames(
                    'block truncate',
                    isOptional && selectedValue?.value ? ' py-0.5' : ''
                  )}
                >
                  {selectedValue?.value || placeholder}
                </span>
                <span className="flex-none">
                  {selectedValue && isOptional && (
                    <Button
                      className=" py-[2px] font-bold text-gray-400"
                      buttonType={ButtonType.secondary}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onDeselectValue) onDeselectValue();
                      }}
                    >
                      <Icon name={'deselect'} size={8} />
                    </Button>
                  )}
                </span>
              </div>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>
            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              afterLeave={() => {
                setQuery(data);
              }}
            >
              <Listbox.Options
                className={classNames(
                  'absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white text-base font-normal leading-5 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm',
                  cls2 || ''
                )}
              >
                {(data.length > 4 || forcefullyShowSearchBar || onSearch) && (
                  <div
                    data-testid="claimPatientSearch"
                    className="bg-gray-100 p-1"
                  >
                    <input
                      type="text"
                      ref={(input) => {
                        setTimeout(() => {
                          if (input) input.focus({ preventScroll: true });
                        }, 500);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === ' ') {
                          e.preventDefault(); // Prevent the default space bar behavior
                          const inputElement = e.target as HTMLInputElement;

                          // Get the current input value and caret position
                          const currentValue = inputElement.value;
                          const caretPos = inputElement.selectionStart ?? 0; // Provide a default of 0

                          // Update the input value with a space character at the caret position
                          const newValue = `${currentValue.substring(
                            0,
                            caretPos
                          )} ${currentValue.substring(caretPos)}`;

                          // Set the input value
                          inputElement.value = newValue;

                          // Trigger the input's onChange event
                          const changeEvent = new Event('input', {
                            bubbles: true,
                          });
                          inputElement.dispatchEvent(changeEvent);
                        }
                      }}
                      onChange={(e) => {
                        const txt = e.target.value;
                        if (onSearch) {
                          onTextChange(txt);
                        } else {
                          const filteredOptions = data.filter((d) => {
                            return d.value
                              .toLowerCase()
                              .includes(txt.toLowerCase());
                          });
                          setQuery(filteredOptions);
                          if (
                            txt !== '' &&
                            filteredOptions.length > 0 &&
                            filteredOptions[0]
                          ) {
                            onChange(filteredOptions[0]);
                          }
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
                  <Listbox.Option
                    key={d.id}
                    className={({ active }) =>
                      classNames(
                        active
                          ? 'border-solid border-2 border-cyan-400'
                          : 'border-solid border-2 border-transparent',
                        selectedValue?.id === d.id
                          ? 'bg-cyan-400 text-white'
                          : ' hover:bg-gray-100',
                        d?.active === false ? 'bg-gray-100 text-gray-500' : '',
                        'relative flex cursor-default select-none py-2 pl-3 pr-9  hover:border-transparent'
                      )
                    }
                    value={d}
                    disabled={d?.active === false || d.isAlreadyAdded}
                    ref={selectedValue?.id === d.id ? selectedItemRef : null} // Assign reference to selected item
                  >
                    {d.isAlreadyAdded !== undefined && (
                      <div className="mr-1 h-5 w-5">
                        {d.isAlreadyAdded && (
                          <span className={classNames(`text-cyan-400`)}>
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
                      </div>
                    )}
                    <span
                      data-testid={`singleDropdownOption-${testId}`}
                      className={'block'}
                    >
                      {d.value}
                      {!!d?.appendText && (
                        <span
                          className={classNames(
                            `${
                              selectedValue?.id === d.id
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
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
}
