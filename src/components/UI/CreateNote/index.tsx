import Drawer from '@mui/material/Drawer';
import React from 'react';

import Icon from '@/components/Icon';

import type { SingleSelectDropDownDataType } from '../SingleSelectDropDown';
import SingleSelectDropDown from '../SingleSelectDropDown';
import TextArea from '../TextArea';

export interface CreateNoteProps {
  data: SingleSelectDropDownDataType[];
  selectedNoteType?: SingleSelectDropDownDataType | null;
  onSelectNoteType: (value: SingleSelectDropDownDataType) => void;
  note?: string;
  onNoteChange: (value: string) => void;
  isActive?: boolean;
  isAlert?: boolean;
  onActiveChange: (value: boolean) => void;
  onAlertChange: (value: boolean) => void;
  open: boolean;
  onClose: () => void;
  onAddNoteClick: () => void;
}
export default function CreateClaimNote({
  onAddNoteClick,
  open,
  onClose,
  data,
  onNoteChange,
  note,
  selectedNoteType,
  onSelectNoteType,
}: CreateNoteProps) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <div className="inline-flex h-full flex-col items-center justify-start bg-white shadow">
        <div className="inline-flex h-[76px] w-[448px] items-center justify-between space-x-20 p-6">
          <div className="flex items-center justify-start space-x-4">
            <div onClick={onClose} className="mt-1.5">
              {' '}
              <Icon name={'chevronLeft'} size={18} />
            </div>
            <p className="text-lg font-medium leading-7 text-gray-900">
              New Note
            </p>
          </div>
          <div
            className="h-[20px] rounded-md border border-gray-300 bg-white"
            onClick={onClose}
          >
            <Icon name={'close'} size={18} />
          </div>
        </div>
        <div className="inline-flex h-[38px] w-[400px] items-center justify-start space-x-8">
          <div className="flex h-[38px] w-[400px] items-center justify-start space-x-2">
            <div className="flex h-5 w-12 items-center justify-end space-x-2">
              <p className="text-sm leading-tight text-gray-900">Subject:</p>
            </div>
            <div className="w-[342px]">
              <SingleSelectDropDown
                placeholder="Select note type from the dropdown list"
                showSearchBar={true}
                data={data}
                selectedValue={selectedNoteType}
                onSelect={(e: SingleSelectDropDownDataType) => {
                  onSelectNoteType(e);
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="inline-flex h-[240px] w-[448px] items-end justify-end space-x-4 bg-gray-100 p-6 ">
        <TextArea
          id="textarea"
          value={note}
          cls="!w-72 text-sm leading-tight text-gray-500 flex-1 h-full px-3 py-2 bg-white shadow border rounded-md border-gray-300"
          placeholder={'Click here to write note'}
          onChange={(e) => {
            onNoteChange(e.target.value);
          }}
        />
        <div
          className="flex w-1/4 items-center justify-center rounded-md bg-cyan-500 px-4 py-2 shadow"
          onClick={onAddNoteClick}
        >
          <p className="text-sm font-medium leading-tight text-white">
            Add Note
          </p>
        </div>
      </div>
    </Drawer>
  );
}
