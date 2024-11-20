import React, { useEffect, useRef, useState } from 'react';
import type { MenuPlacement, MultiValue } from 'react-select';
import Select, { components } from 'react-select';

import { AppConfig } from '@/utils/AppConfig';
import classNames from '@/utils/classNames';

export interface MultiSelectGridDropdownDataType {
  id: number;
  value: string;
  appendText?: string;
  active?: boolean;
  leftIcon?: React.ReactNode;
}
interface Tprops {
  placeholder?: string;
  selectedValue?: MultiValue<MultiSelectGridDropdownDataType>;
  data: MultiSelectGridDropdownDataType[];
  onSelect: (value: MultiValue<MultiSelectGridDropdownDataType>) => void;
  showSearchBar?: boolean;
  onSearch?: (value: string) => void;
  disabled?: boolean;
  cls?: string;
  appendTextClass?: string;
  menuPlacement?: MenuPlacement | undefined;
  searchOnCharacterLength?: number;
  searchDelayInSeconds?: number;
  isClearable?: boolean;
  appendTextSeparator?: string;
  openFullWidthMenu?: boolean;
}
export default function MultiSelectGridDropdown({
  placeholder = 'Select value',
  selectedValue,
  data,
  onSelect,
  onSearch,
  showSearchBar = false,
  disabled = false,
  appendTextClass,
  menuPlacement = 'auto',
  searchOnCharacterLength = AppConfig.searchOnCharacterLength,
  searchDelayInSeconds = AppConfig.searchDelayInSeconds,
  cls,
  isClearable = false,
  appendTextSeparator = '-',
  openFullWidthMenu = false,
  ...rest
}: Tprops) {
  const [query, setQuery] = useState(data);
  useEffect(() => {
    setQuery(data);
  }, [data]);
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
  const onInputChange = (rawInput: string) => {
    if (onSearch) {
      onTextChange(rawInput);
    } else {
      const filteredOptions = data.filter((o: any) =>
        o.value.toLowerCase().includes(rawInput.toLowerCase())
      );
      setQuery(filteredOptions);
    }
  };
  const onChange = (value: MultiValue<MultiSelectGridDropdownDataType>) => {
    setTimeout(() => {
      onSelect(value);
    }, 100);
  };
  const NoOptionsMessage = (props: any) => {
    return (
      <components.NoOptionsMessage {...props}>
        <span>No Record Found</span>
      </components.NoOptionsMessage>
    );
  };
  const DropdownIndicator = (props: any) => {
    return (
      <components.DropdownIndicator {...props}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          className="h-5 w-5 text-gray-400"
        >
          <path
            fillRule="evenodd"
            d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z"
            clipRule="evenodd"
          ></path>
        </svg>
      </components.DropdownIndicator>
    );
  };
  const MultiValue = (props: any) => {
    const { ...base } = props;
    return (
      <components.MultiValue {...base}>
        <div className="block truncate font-medium sm:text-sm">
          <span className="text-left">{props?.data?.value}</span>
        </div>
      </components.MultiValue>
    );
  };
  const customStyles = {
    container: (base: any) => ({
      ...base,
      minWidth: '100% !important',
    }),
    control: (base: any, state: any) => ({
      ...base,
      borderRadius: '6px',
      minWidth: '100% !important',
      border: state.isFocused ? '2px solid #06B6D4' : '1px solid #D1D5DB',
      boxShadow: state.isFocused
        ? '0px 0px 2px rgba(0, 0, 0, 0.1)'
        : '0px 0px 1px #D1D5DB',
      '&:hover': {
        border: state.isFocused ? '2px solid #06B6D4' : '1px solid #D1D5DB',
        boxShadow: state.isFocused
          ? '0px 0px 2px rgba(0, 0, 0, 0.1)'
          : '0px 0px 1px #D1D5DB',
      },
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? 'rgb(34, 211 ,238);' : 'white',
      border: state.isFocused
        ? '1px solid rgb(34, 211 ,238)'
        : '1px solid white',
      '&:hover': {
        backgroundColor: state.isSelected ? 'rgb(34, 211 ,238);' : '#F3F4F6',
        border: '1px solid white',
      },
    }),
    multiValue: (base: any) => ({
      ...base,
      borderRadius: '4px',
      border: '1px solid #D1D5DB',
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      backgroundColor: '#F3F4F6',
      color: '#1F2937',
      fontWeight: 'normal',
      fontSize: '14px',
    }),
    menu: (base: any) => ({
      ...base,
      width: openFullWidthMenu ? '100%' : 'max-content',
    }),
    multiValueRemove: (base: any) => ({
      ...base,
      backgroundColor: '#F3F4F6',
      color: '#9ca3af',
      fontWeight: 'normal',
      '&:hover': {
        backgroundColor: '#F3F4F6',
        color: '#9ca3af',
      },
    }),
  };
  return (
    <div className={classNames(cls || '')}>
      <Select
        {...rest}
        closeMenuOnSelect={false}
        isClearable={isClearable}
        // menuIsOpen={true} // => To debug of open popup, uncomment this line. popup will remain open at all times.
        menuPosition="fixed"
        value={selectedValue}
        menuPlacement={menuPlacement}
        controlShouldRenderValue={!!selectedValue}
        onChange={(e: MultiValue<MultiSelectGridDropdownDataType>) => {
          onChange(e);
        }}
        hideSelectedOptions={false}
        options={query}
        tabSelectsValue={false}
        openMenuOnFocus={true}
        filterOption={() => true}
        onInputChange={(e: string) => onInputChange(e)}
        isDisabled={disabled}
        isSearchable={showSearchBar}
        components={{
          IndicatorSeparator: () => null,
          DropdownIndicator,
          NoOptionsMessage,
          MultiValue,
        }}
        classNamePrefix="select2-selection"
        isMulti
        getOptionLabel={(e) => {
          return (
            <div className="flex truncate font-medium sm:text-sm">
              {e.leftIcon}
              <span className="text-left">{e.value}</span>
              {!!e.appendText && (
                <span
                  className={classNames(
                    `${'ml-1 text-gray-500'}
                       ${appendTextClass}`
                  )}
                >
                  {` ${appendTextSeparator} ${e?.appendText}`}
                </span>
              )}
            </div>
          ) as unknown as string;
        }}
        placeholder={placeholder}
        styles={customStyles}
        menuPortalTarget={document.body}
      />
    </div>
  );
}
