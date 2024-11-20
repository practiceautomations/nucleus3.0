import React from 'react';

import Button, { ButtonType } from '../UI/Button';
import InputField from '../UI/InputField';

export interface SavedReportModalProps {
  onClick: () => void;
  onClose: () => void;
  createButton?: string;
  savedReportHeading: string | undefined;
  value?: string;
  onchange?: (value: any) => void;
}
export default function savedReportModal({
  onClick,
  onClose,
  savedReportHeading,
  createButton = 'Create',
  value,
  onchange,
}: SavedReportModalProps) {
  return (
    <div className="w-full rounded-md bg-white p-6 shadow-xl">
      <div className="flex flex-col justify-center  gap-6 ">
        <div className="flex flex-col gap-2">
          <div className="text-lg font-medium leading-6 text-gray-900">
            <p>{savedReportHeading}</p>
          </div>
          <div className="w-full">
            <InputField
              autoFocus
              placeholder="Type new saved search name here"
              value={value || ''}
              onChange={onchange}
            />
          </div>
        </div>
        <div className="w-half flex gap-4">
          <Button
            buttonType={ButtonType.secondary}
            cls={`focus:ring-transparent w-56 h-[38px] place-self-end justify-center items-center rounded-md text-gray text-sm leading-5 font-medium right-3`}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            buttonType={ButtonType.primary}
            cls={`focus:ring-transparent w-56 h-[38px] place-self-end justify-center items-center rounded-md text-white text-sm leading-5 font-medium `}
            onClick={onClick}
          >
            {createButton}
          </Button>
        </div>
      </div>
    </div>
  );
}
