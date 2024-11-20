import React, { useEffect, useState } from 'react';

import Icon from '@/components/Icon';

import InputField from '../InputField';

export interface InsuranceWithTypeDropdownType {
  id: number;
  value: string;
  type: string;
}

export interface InsuranceWithTypeDropdownProps {
  data: InsuranceWithTypeDropdownType[] | [];
  onSelect: (value: InsuranceWithTypeDropdownType | null) => void;
  selectedValue?: InsuranceWithTypeDropdownType;
}

export default function InsuranceWithTypeDropdown({
  data,
  onSelect,
  selectedValue,
}: InsuranceWithTypeDropdownProps) {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const handleDropdownClick = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const handleDropdownItemClick = (
    item: InsuranceWithTypeDropdownType | null
  ) => {
    if (item === null) {
      onSelect(null);
    } else {
      onSelect(item);
    }
    setDropdownOpen(false);
  };
  const [insuranceDropdownSearchData, setInsuranceDropdownSearchData] =
    useState<string>('');
  const [filteredInsuranceOptions, setFilteredInsuranceOptions] = useState<
    InsuranceWithTypeDropdownType[]
  >([]);
  useEffect(() => {
    if (data) {
      setFilteredInsuranceOptions(data);
    }
  }, [data]);
  return (
    <>
      <div className="relative inline-block">
        <div className="flex gap-2">
          <p
            className="self-center truncate text-sm font-normal leading-tight text-gray-700"
            onClick={handleDropdownClick}
          >
            {selectedValue?.value || 'All Insurances'}
          </p>
          <button onClick={handleDropdownClick}>
            {/* Your ChevronDown icon */}
            <Icon name="chevronDown" size={10} />
          </button>
        </div>
        {isDropdownOpen && (
          <div className="absolute right-0 z-10 mt-2 h-[335px] w-[200px] justify-start overflow-auto rounded-md border border-gray-300 bg-white shadow">
            <div
              onClick={() => handleDropdownItemClick(null)}
              className="cursor-pointer p-2 hover:bg-gray-100"
            >
              <div className="px-2 py-1 text-sm font-normal leading-tight text-gray-900">
                {'All Insurances'}
              </div>
            </div>
            <div className="flex-col items-start justify-start border-b border-gray-200 bg-gray-100 p-1">
              <InputField
                placeholder="Type to search..."
                value={insuranceDropdownSearchData || ''}
                disabled={false}
                onChange={(evt) => {
                  const searchTerm = evt.target.value.toLowerCase();
                  setInsuranceDropdownSearchData(searchTerm);
                  if (searchTerm === '') {
                    setFilteredInsuranceOptions(data);
                    return;
                  }

                  // Filter options based on search term
                  const filteredOptions: InsuranceWithTypeDropdownType[] =
                    data.filter((option) =>
                      option.value.toLowerCase().includes(searchTerm)
                    );

                  // Update the state with filtered options
                  setFilteredInsuranceOptions(filteredOptions);
                }}
              />
            </div>
            {filteredInsuranceOptions.map((item, index) => (
              <>
                {item.type === 'insurance_type' &&
                  filteredInsuranceOptions[index - 1]?.type === 'insurance' && (
                    <div className="h-px bg-gray-200"></div>
                  )}
                <div
                  key={item.id}
                  onClick={() => handleDropdownItemClick(item)}
                  className="cursor-pointer p-2 hover:bg-gray-100"
                >
                  <div className="px-2 py-1 text-sm font-normal leading-tight text-gray-900">
                    {' '}
                    {item.value}{' '}
                  </div>
                </div>
              </>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
