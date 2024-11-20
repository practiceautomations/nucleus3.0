import React, { useState } from 'react';

import Icon from '@/components/Icon';

export interface ChevronDropdownType {
  id: number;
  value: string;
}

export interface ChevronDropdownProps {
  data: ChevronDropdownType[] | [];
  onSelect: (value: ChevronDropdownType) => void;
  selectedValue?: ChevronDropdownType;
}

export default function ChevronDropdown({
  data,
  onSelect,
  selectedValue,
}: ChevronDropdownProps) {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const handleDropdownClick = () => {
    setDropdownOpen(!isDropdownOpen);
  };
  // const [selectedDropdownData, setSelectedDropdownData] = useState(data[0]);
  const handleDropdownItemClick = (item: any) => {
    onSelect(item);
    setDropdownOpen(false);
    // If "custom date" is selected, open a popup
    // if (item.id === 2) {
    //   setcollectedAmountDateModalOpen(true);
    // }
  };
  return (
    <>
      <div className="relative inline-block">
        <div className="flex gap-2">
          <p
            className="self-center truncate text-sm font-normal leading-tight text-gray-700"
            onClick={handleDropdownClick}
          >
            {selectedValue?.value || ''}
          </p>
          <button onClick={handleDropdownClick}>
            {/* Your ChevronDown icon */}
            <Icon name="chevronDown" size={10} />
          </button>
        </div>
        {isDropdownOpen && (
          <div className="absolute right-0 z-10 mt-2 w-[200px] justify-start rounded-md border border-gray-300 bg-white shadow">
            {data.map((item) => (
              <>
                {item.value === 'Custom' && (
                  <div className="h-px bg-gray-200"></div>
                )}
                <div
                  key={item.id}
                  onClick={() => {
                    handleDropdownItemClick(item);
                    onSelect(item);
                  }}
                  className="cursor-pointer p-2 hover:bg-gray-100"
                >
                  <div className=" px-2 py-1 text-sm font-normal leading-tight text-gray-900">
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
