import React, { useState } from 'react';

import { DateToStringPipe } from '@/utils/dateConversionPipes';

import AppDatePicker from '../AppDatePicker';
import Button, { ButtonType } from '../Button';
import CloseButton from '../CloseButton';

export interface CustomDateSelectionModalProps {
  onClose: () => void;
  onClickSave(
    fromDate: string | null,
    toDate: string | null,
    type: string
  ): void;
  label: string;
  type: string;
}

export default function CustomDateSelectionModal({
  onClose,
  onClickSave,
  label = '',
  type = '',
}: CustomDateSelectionModalProps) {
  const [customDate, setCustomDate] = useState<{
    toDate: string | null;
    fromDate: string | null;
  }>({ toDate: null, fromDate: null });
  return (
    <>
      <div className="flex w-full flex-col rounded-lg bg-gray-100">
        <div className="mt-3 w-full max-w-full p-4">
          <div className="flex w-full flex-row justify-between">
            <div>
              <h1 className=" ml-2  text-left text-xl font-bold leading-7 text-gray-700">
                {label}
              </h1>
            </div>
            <div className="">
              <CloseButton onClick={onClose} />
            </div>
          </div>
          <div className="mt-3 h-px w-full bg-gray-300" />
        </div>
        <div className="flex flex-col justify-between">
          <div className="w-full flex-1 overflow-y-auto bg-gray-100">
            <div className="flex">
              <div className="w-full self-center break-words p-6 text-justify text-sm text-gray-500">
                <div className="flex w-full flex-wrap">
                  <div className={`w-[50%] pr-[8px]`}>
                    <div className={`w-full items-start self-stretch`}>
                      <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                        Date - From
                      </div>
                      <div className="w-full">
                        <AppDatePicker
                          cls="!mt-1"
                          selected={customDate?.fromDate}
                          onChange={(value) => {
                            setCustomDate({
                              ...customDate,
                              fromDate: value ? DateToStringPipe(value, 1) : '',
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className={`w-[50%] pl-[8px]`}>
                    <div className={`w-full items-start self-stretch`}>
                      <div className="truncate py-[2px] text-sm font-medium leading-tight text-gray-700">
                        Date - To
                      </div>
                      <div className="w-full">
                        <AppDatePicker
                          cls="!mt-1"
                          selected={customDate?.toDate}
                          onChange={(value) => {
                            setCustomDate({
                              ...customDate,
                              toDate: value ? DateToStringPipe(value, 1) : '',
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex w-full items-center justify-center rounded-b-lg bg-gray-200 py-6">
            <div className="flex w-full items-center justify-end space-x-4 px-7">
              <Button
                buttonType={ButtonType.secondary}
                cls={`w-[102px] `}
                onClick={() => {
                  setCustomDate({
                    toDate: null,
                    fromDate: null,
                  });
                  onClose();
                }}
              >
                {' '}
                Cancel
              </Button>
              <Button
                buttonType={ButtonType.primary}
                cls={` `}
                onClick={() => {
                  onClickSave(customDate.fromDate, customDate.toDate, type);
                  onClose();
                }}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
