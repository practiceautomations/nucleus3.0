import React from 'react';

import Button, { ButtonType } from '../Button';

export interface WarningModalProps {
  onClose: () => void;
  waringHeading: string;
  warningMessage: string;
}
export default function WarningModal({
  onClose,
  waringHeading,
  warningMessage,
}: WarningModalProps) {
  return (
    <div className="w-full rounded-md bg-white p-6 shadow-xl">
      <div className="flex flex-col justify-center  gap-6 ">
        <div className="flex flex-col gap-2">
          <div className="text-lg font-medium leading-6 text-gray-900">
            <p>{waringHeading}</p>
          </div>
          <div className="text-sm font-normal leading-5 text-gray-500">
            <p>{warningMessage}</p>
          </div>
        </div>
        <div className="w-full">
          <Button
            buttonType={ButtonType.primary}
            cls={`focus:ring-transparent w-full h-[38px] place-self-end justify-center items-center rounded-md text-white text-sm leading-5 font-medium pl-[17px] pr-[17px] pt-[9px] pb-[9px]`}
            onClick={onClose}
          >
            OK
          </Button>
        </div>
      </div>
    </div>
  );
}
