import React, { useState } from 'react';

import AppDatePicker from '@/components/UI/AppDatePicker';
import InputField from '@/components/UI/InputField';
import InputFieldAmount from '@/components/UI/InputFieldAmount';
import MultiSelectDropDown from '@/components/UI/MultiSelectDropDown';
import type { SingleSelectDropDownDataType } from '@/components/UI/SingleSelectDropDown';
import SingleSelectDropDown from '@/components/UI/SingleSelectDropDown';
import useOnceEffect from '@/utils/useOnceEffect';

export interface FieldSelectionDropdownProps {
  selectedData: SingleSelectDropDownDataType[] | null;
  disable?: boolean;
  fieldsData: FieldSelectionDropdownDataType[];
  onSelectFieldsData: (value: FieldSelectionDropdownDataType[]) => void;
  onSearchFieldsData?: (value: FieldSelectionDropdownDataType[]) => void;

  label: string;
}

export interface FieldSelectionDropdownDataType {
  id: number;
  value: string;
  active?: boolean;
  checked: boolean;
  fieldType:
    | 'datePicker'
    | 'amountField'
    | 'inputText'
    | 'dropDown'
    | 'heading';
  selectedValue:
    | Date
    | number
    | string
    | SingleSelectDropDownDataType
    | undefined;
  data: SingleSelectDropDownDataType[] | undefined;
  isRequired?: boolean;
  searchedValue?: string;
  maxLength?: number;
  relatedFields?: number[];
  parentField?: number;
}

export default function FieldSelectionDropdown({
  selectedData,
  disable,
  fieldsData,
  onSelectFieldsData,
  onSearchFieldsData,
  label,
}: FieldSelectionDropdownProps) {
  const [selectedFieldFromDropdown, setSelectedFieldFromDropdown] = useState<
    SingleSelectDropDownDataType[]
  >([]);

  useOnceEffect(() => {
    if (selectedData) {
      setSelectedFieldFromDropdown(selectedData);
    }
  }, [selectedData]);

  const onSelectField = (arr: SingleSelectDropDownDataType[]) => {
    setSelectedFieldFromDropdown(arr);
    const selectedIds = new Set(arr.map((m) => m.id));
    fieldsData.forEach((row) => {
      if (selectedIds.has(row.id) && Array.isArray(row.relatedFields)) {
        row.relatedFields.forEach((relatedId) => selectedIds.add(relatedId));
      }
    });
    const res = fieldsData.map((row) => {
      if (row.parentField && !selectedIds.has(row.parentField)) {
        return { ...row, checked: false };
      }
      return { ...row, checked: selectedIds.has(row.id) };
    });
    onSelectFieldsData(JSON.parse(JSON.stringify(res)));
  };
  const renderDropdown = (
    id: number,
    selectedValue: SingleSelectDropDownDataType | undefined,
    data: SingleSelectDropDownDataType[]
  ) => {
    return (
      <SingleSelectDropDown
        placeholder={'Select value'}
        disabled={disable}
        data={data}
        selectedValue={selectedValue}
        onSelect={(value) => {
          const arr = fieldsData;
          onSelectFieldsData([]);
          const obj = arr.filter((m) => m.id === id)[0];
          if (obj) obj.selectedValue = value;
          onSelectFieldsData(JSON.parse(JSON.stringify(arr)));
        }}
        isOptional={!fieldsData.filter((m) => m.id === id)[0]?.isRequired}
        onDeselectValue={() => {
          const arr = fieldsData;
          onSelectFieldsData([]);
          const obj = arr.filter((m) => m.id === id)[0];
          if (obj) obj.selectedValue = undefined;
          onSelectFieldsData(JSON.parse(JSON.stringify(arr)));
        }}
        forcefullyShowSearchBar={true}
        onSearch={(value) => {
          const arr = fieldsData;
          if (onSearchFieldsData) {
            onSearchFieldsData([]);
          }
          const obj = arr.filter((m) => m.id === id)[0];
          if (obj) obj.searchedValue = value;
          if (onSearchFieldsData) {
            onSearchFieldsData(JSON.parse(JSON.stringify(arr)));
          }
        }}
      />
    );
  };

  const renderDatePicker = (id: number, selectedValue: Date) => {
    return (
      <AppDatePicker
        placeholderText="mm/dd/yyyy"
        disabled={disable}
        onChange={(date) => {
          const arr = fieldsData;
          onSelectFieldsData([]);
          const obj = arr.filter((m) => m.id === id)[0];
          if (obj && date) obj.selectedValue = date;
          onSelectFieldsData(JSON.parse(JSON.stringify(arr)));
        }}
        selected={selectedValue ? new Date(String(selectedValue)) : null}
        // isOptional={!fieldsData.filter((m) => m.id === id)[0]?.isRequired}
        // onDeselectValue={() => {
        //   const arr = fieldsData;
        //   onSelectFieldsData([]);
        //   const obj = arr.filter((m) => m.id === id)[0];
        //   if (obj) obj.selectedValue = undefined;
        //   onSelectFieldsData(JSON.parse(JSON.stringify(arr)));
        // }}
      />
    );
  };

  const renderAmountField = (id: number, selectedValue: number) => {
    return (
      <InputFieldAmount
        disabled={disable}
        className="!mt-1 !h-[38px]"
        placeholder="Type text"
        value={selectedValue}
        onChange={(evt) => {
          const arr = fieldsData;
          onSelectFieldsData([]);
          const obj = arr.filter((m) => m.id === id)[0];
          if (obj) obj.selectedValue = evt.target.value;
          onSelectFieldsData(JSON.parse(JSON.stringify(arr)));
        }}
      />
    );
  };

  const renderInputText = (
    id: number,
    selectedValue: string,
    maxLenth?: number
  ) => {
    return (
      <InputField
        disabled={disable}
        placeholder="Type text"
        value={selectedValue}
        maxLength={maxLenth}
        onChange={(evt) => {
          const arr = fieldsData;
          onSelectFieldsData([]);
          const obj = arr.filter((m) => m.id === id)[0];
          if (obj) obj.selectedValue = evt.target.value;
          onSelectFieldsData(JSON.parse(JSON.stringify(arr)));
        }}
      />
    );
  };

  return (
    <div className="flex-col gap-6">
      <div className={`flex items-end gap-4`}>
        <div className={` `}>
          <label className="text-sm font-medium leading-5 text-gray-900">
            {label}
          </label>
          <div className="w-[488px]">
            <MultiSelectDropDown
              placeholder="Type or click arrow to reveal available fields"
              showSearchBar={true}
              showSelectionInfo={false}
              disabled={disable}
              data={fieldsData.map((field) => {
                return {
                  ...field,
                  hide: field.parentField !== undefined, // Set show to true if parentField is defined, false otherwise
                };
              })}
              selectedValue={selectedFieldFromDropdown} // selectedFieldFromDropdown
              onSelect={(value) => {
                onSelectField(value);
              }}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 pt-[24px]">
        {fieldsData
          .filter((f) => f.checked)
          .map((d) => (
            <div key={d.id} className={`relative w-[280px]`}>
              <div className={`w-full items-start self-stretch`}>
                <label className="text-sm font-medium leading-5 text-gray-900">
                  {d.value}{' '}
                  {d.isRequired && <span className="text-cyan-500">*</span>}
                </label>

                <div className="h-[38px] w-[280px]">
                  {d.fieldType === 'dropDown' &&
                    renderDropdown(
                      d.id,
                      d.selectedValue as SingleSelectDropDownDataType,
                      d.data ? d.data : []
                    )}
                  {d.fieldType === 'datePicker' && (
                    <div className="mt-1">
                      {renderDatePicker(d.id, d.selectedValue as Date)}
                    </div>
                  )}
                  {d.fieldType === 'inputText' &&
                    renderInputText(
                      d.id,
                      d.selectedValue as string,
                      d.maxLength
                    )}
                  {d.fieldType === 'amountField' &&
                    renderAmountField(d.id, d.selectedValue as number)}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
