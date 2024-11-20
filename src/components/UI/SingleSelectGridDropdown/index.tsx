import React, { useEffect, useRef, useState } from 'react';
import type { MenuPlacement, SingleValue } from 'react-select';
import Select, { components } from 'react-select';

import { AppConfig } from '@/utils/AppConfig';
import classNames from '@/utils/classNames';

export interface SingleSelectGridDropdownDataType {
  id: number;
  value: string;
  appendText?: string;
  active?: boolean;
  leftIcon?: React.ReactNode;
}

interface Tprops {
  placeholder?: string;
  selectedValue?: SingleValue<SingleSelectGridDropdownDataType>;
  data: SingleSelectGridDropdownDataType[];
  onSelect: (value: SingleValue<SingleSelectGridDropdownDataType>) => void;
  showSearchBar?: boolean;
  onSearch?: (value: string) => void;
  disabled?: boolean;
  cls?: string;
  menuPlacement?: MenuPlacement;
  appendTextClass?: string;
  searchOnCharacterLength?: number;
  searchDelayInSeconds?: number;
  showDropdownIcon?: boolean;
  appendTextSeparator?: string;
  isClearable?: boolean;
  testId?: string;
  searchOptionFull?: boolean;
  searchValue?: string;
}

export default function SingleSelectGridDropDown({
  placeholder,
  selectedValue,
  data,
  onSelect,
  showSearchBar = false,
  onSearch,
  disabled = false,
  cls,
  showDropdownIcon = true,
  appendTextClass,
  menuPlacement = 'auto',
  searchOnCharacterLength = AppConfig.searchOnCharacterLength,
  searchDelayInSeconds = AppConfig.searchDelayInSeconds,
  appendTextSeparator = '-',
  isClearable = true,
  testId,
  searchOptionFull = true,
  searchValue,
}: Tprops) {
  const onChange = (value: SingleValue<SingleSelectGridDropdownDataType>) => {
    setTimeout(() => {
      onSelect(value);
    }, 100);
  };

  const [enableSearchCall, setEnableSearchCall] = useState(true);
  const searchTxt = useRef('');
  const preSearchTxt = useRef('');
  const [query, setQuery] = useState(data);

  useEffect(() => {
    if (data) setQuery(data);
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
  useEffect(() => {
    if (data && data.length > 0 && searchValue && searchValue !== '') {
      // Find the closest matching option
      const closestMatch = data[0];

      if (closestMatch) {
        onChange(closestMatch);
      }
    }
  }, [searchValue, data]);
  const onInputChange = (rawInput: string, { action }: { action: string }) => {
    if (action !== 'input-change') {
      return;
    }

    if (onSearch) {
      // Server-side search
      onTextChange(rawInput);
    } else {
      // Local filtering
      let filteredOptions = data;
      if (searchOptionFull) {
        filteredOptions = data.filter(
          (o: any) =>
            o.value.toString().toLowerCase().includes(rawInput.toLowerCase()) ||
            (o.appendText &&
              o.appendText
                .toString()
                .toLowerCase()
                .includes(rawInput.toLowerCase()))
        );
      } else {
        filteredOptions = data.filter((o: any) =>
          o.value.toString().toLowerCase().includes(rawInput.toLowerCase())
        );
      }

      setQuery(filteredOptions);

      if (rawInput !== '' && filteredOptions.length > 0 && filteredOptions[0]) {
        onChange(filteredOptions[0]);
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Tab') {
      event.stopPropagation();
    }
  };

  const DropdownIndicator = (props: any) => {
    return (
      <components.DropdownIndicator {...props}>
        {showDropdownIcon ? (
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
        ) : (
          <></>
        )}
      </components.DropdownIndicator>
    );
  };

  const NoOptionsMessage = (props: any) => {
    return (
      <components.NoOptionsMessage {...props}>
        <span>No Record Found</span>
      </components.NoOptionsMessage>
    );
  };

  const SingleValue = (props: any) => {
    const { ...rest } = props;
    return (
      <components.SingleValue {...rest}>
        <div
          data-testid={`singleGridDropdownSelectedValue-${testId}`}
          className="block truncate font-medium sm:text-sm"
        >
          {props?.data?.leftIcon}
          <span className="text-left">{props?.data?.value}</span>
        </div>
      </components.SingleValue>
    );
  };

  // const MenuList = (props: any) => {
  //   const ref = useRef<HTMLDivElement>(null);
  //   const [scrollToSelected, setScrollToSelected] = useState(false);

  //   useEffect(() => {
  //     if (ref.current) {
  //       const selectedIndex = props.options.findIndex(
  //         (option: any) => option.value === selectedValue?.value
  //       );
  //       if (selectedIndex >= 0) {
  //         const selectedOption = ref.current.children[
  //           selectedIndex
  //         ] as HTMLElement;
  //         selectedOption.scrollIntoView({
  //           behavior: 'smooth',
  //           block: 'nearest',
  //           inline: 'start',
  //         });
  //       }
  //     }
  //   }, [props.options, selectedValue, scrollToSelected]);

  //   const handleOptionFocus = (option: any) => {
  //     setScrollToSelected(true);
  //   };

  //   return (
  //     <components.MenuList {...props} innerRef={ref}>
  //       {React.Children.map(props.children, (child) => {
  //         return React.cloneElement(child as any, {
  //           onFocus: () => handleOptionFocus(child.props.data),
  //         });
  //       })}
  //     </components.MenuList>
  //   );
  // };

  const onMenuOpen = () => {
    setTimeout(() => {
      const selectedEl = document.getElementsByClassName(
        'select2-selection__option--is-selected'
      )[0];
      if (selectedEl) {
        selectedEl.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start',
        });
      }
    }, 15);
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
      width: 'auto',
      textAlign: 'start',
      backgroundColor: state.isSelected ? 'rgb(34, 211 ,238);' : 'white',
      border: state.isFocused
        ? '1px solid rgb(34, 211 ,238)'
        : '1px solid white',
      '&:hover': {
        backgroundColor: state.isSelected ? 'rgb(34, 211 ,238);' : '#F3F4F6',
        border: '1px solid white',
      },
    }),
    valueContainer: (base: any) => ({
      ...base,
      justifyContent: 'start',
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
    menu: (base: any) => ({
      ...base,
      width: 'max-content',
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
  };

  return (
    <div
      data-testid={`singleGridDropdownMainDiv-${testId}`}
      className={classNames(cls || '')}
    >
      <Select
        value={selectedValue}
        onChange={(e: SingleValue<SingleSelectGridDropdownDataType>) =>
          onChange(e)
        }
        // menuIsOpen={true} // => To debug of open popup, uncomment this line. popup will remain open at all times.
        hideSelectedOptions={false}
        options={query}
        menuPlacement={menuPlacement}
        menuPosition="fixed"
        filterOption={() => true}
        onInputChange={(e: string, actionMeta) => onInputChange(e, actionMeta)}
        onKeyDown={handleKeyDown}
        controlShouldRenderValue={!!selectedValue}
        isDisabled={disabled}
        isSearchable={showSearchBar}
        tabSelectsValue={false}
        openMenuOnFocus={true}
        onMenuOpen={onMenuOpen}
        components={{
          IndicatorSeparator: () => null,
          DropdownIndicator,
          NoOptionsMessage,
          SingleValue,
          // MenuList,
        }}
        isClearable={isClearable}
        classNamePrefix="select2-selection"
        getOptionLabel={(e: SingleSelectGridDropdownDataType) => {
          return (
            <div className="w-[280px] font-medium sm:text-sm">
              {e.leftIcon}
              <span
                data-testid={`singleGridDropdownOption-${testId}`}
                className="text-left"
              >
                {e.value}
              </span>
              {!!e.appendText && (
                <span
                  className={classNames(
                    `ml-1 ${'text-gray-500'}
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
