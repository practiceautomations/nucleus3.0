import React, { useEffect, useRef, useState } from 'react';
import type { MenuPlacement, SingleValue } from 'react-select';
import Select, { components } from 'react-select';

import Icon from '@/components/Icon';
import { AppConfig } from '@/utils/AppConfig';
import classNames from '@/utils/classNames';

export interface TableSearchBarDropdownDataType {
  id: number;
  value: string;
  appendText?: string;
  type?: string;
  active?: boolean;
  leftIcon?: React.ReactNode;
}
interface Tprops {
  placeholder?: string;
  selectedValue?: SingleValue<TableSearchBarDropdownDataType>;
  data: TableSearchBarDropdownDataType[];
  onSelect: (value: SingleValue<TableSearchBarDropdownDataType>) => void;
  showSearchBar?: boolean;
  onSearch?: (value: string) => void;
  disabled?: boolean;
  cls?: string;
  menuPlacement?: MenuPlacement | undefined;
  appendTextClass?: string;
  searchOnCharacterLength?: number;
  searchDelayInSeconds?: number;
  showDropdownIcon?: boolean;
  appendTextSeparator?: string;
  isClearable?: boolean | undefined;
}
export default function TableSearchBarDropdown({
  placeholder,
  selectedValue,
  data,
  onSelect,
  showSearchBar = false,
  onSearch,
  disabled = false,
  cls,
  showDropdownIcon = false,
  menuPlacement = 'auto',
  searchOnCharacterLength = AppConfig.searchOnCharacterLength,
  searchDelayInSeconds = AppConfig.searchDelayInSeconds,
  isClearable = true,
}: Tprops) {
  const onChange = (value: SingleValue<TableSearchBarDropdownDataType>) => {
    setTimeout(() => {
      onSelect(value);
    }, 100);
  };
  const [enableSearchCall, setEnableSearchCall] = useState(true);
  const searchTxt = useRef('');
  const preSearchTxt = useRef('');
  const [query, setQuery] = useState(data);
  useEffect(() => {
    setQuery(data);
  }, [data]);
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
        o.value.toString().toLowerCase().includes(rawInput.toLowerCase())
      );
      setQuery(filteredOptions);
    }
  };
  const DropdownIndicator = (props: any) => {
    return (
      <components.DropdownIndicator {...props}>
        {showDropdownIcon ? (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Icon name={'search1'} size={18} />
          </div>
        ) : (
          <></>
        )}
      </components.DropdownIndicator>
    );
  };

  const NoOptionsMessage = (props: any) => {
    return (
      <components.NoOptionsMessage {...props}>
        <span data-testid="no_record">No Record Found</span>
      </components.NoOptionsMessage>
    );
  };
  const SingleValue = (props: any) => {
    const { ...rest } = props;
    return (
      <components.SingleValue {...rest}>
        <div className="block w-full truncate pt-[6px] font-medium sm:text-sm">
          {props?.data?.leftIcon}
          <span className="text-left">{props?.data?.value}</span>
        </div>
      </components.SingleValue>
    );
  };
  const customStyles = {
    container: (base: any) => ({
      ...base,
      minWidth: '100% !important',
    }),
    control: (base: any) => ({
      ...base,
      borderRadius: '6px',
      minWidth: '100% !important',
      border: base.isFocused ? '1px solid #D1D5DB' : '1px solid #D1D5DB',
      boxShadow: base.isFocused
        ? '0px 1px 2px rgba(0, 0, 0, 0.05)'
        : '0px 0px 1px #D1D5DB',
      '&:hover': {
        border: '1px solid #D1D5DB',
        boxShadow: '0px 0px 1px #D1D5DB',
      },
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      width: 'auto',
      backgroundColor: state.isSelected ? 'rgb(34, 211 ,238);' : 'white',
      border: state.isFocused
        ? '1px solid rgb(34, 211 ,238)'
        : '1px solid white',
      '&:hover': {
        backgroundColor: state.isSelected ? 'rgb(34, 211 ,238);' : '#F3F4F6',
        border: '1px solid white',
      },
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      backgroundColor: '#F3F4F6',
      color: '#1F2937',
      fontWeight: 'normal',
      fontSize: '14px',
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
    menuList: (base: any) => ({
      ...base,
      borderRadius: '6px',
    }),
    indicatorsContainer: (prevStyle: any) =>
      !showDropdownIcon
        ? {
            ...prevStyle,
            display: 'none',
          }
        : null,
    clearIndicator: (base: any) => ({
      ...base,
      display: 'none',
    }),
    valueContainer: (base: any) => ({
      ...base,
      paddingLeft: 40,
    }),
  };
  return (
    <div className={classNames('relative w-full', cls || '')}>
      <Select
        value={selectedValue}
        onChange={(e: SingleValue<TableSearchBarDropdownDataType>) =>
          onChange(e)
        }
        hideSelectedOptions={false}
        options={query}
        menuPlacement={menuPlacement}
        menuPosition="fixed"
        filterOption={() => true}
        onInputChange={(e: string) => onInputChange(e)}
        controlShouldRenderValue={!!selectedValue}
        isDisabled={disabled}
        isSearchable={showSearchBar}
        components={{
          IndicatorSeparator: () => null,
          DropdownIndicator,
          NoOptionsMessage,
          SingleValue,
        }}
        isClearable={isClearable}
        classNamePrefix="select2-selection"
        getOptionLabel={(e: TableSearchBarDropdownDataType) => {
          return (
            <div className="flex w-full justify-between font-medium sm:text-sm">
              <span className="px-2 py-1 text-center text-sm font-normal leading-5">
                {e.value}
              </span>
              {!!e.appendText && (
                <span className="rounded bg-gray-100 px-2.5 pt-[4px] text-sm text-gray-800">
                  {' '}
                  {e?.appendText}
                </span>
              )}
            </div>
          ) as unknown as string;
        }}
        placeholder={<div className="pt-1">{placeholder}</div>}
        styles={customStyles}
        menuPortalTarget={document.body}
      />
    </div>
  );
}
