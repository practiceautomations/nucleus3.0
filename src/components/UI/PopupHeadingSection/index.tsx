import React from 'react';

import CloseButton from '../CloseButton';

interface PopupHeadingSectionProps {
  label: string;
  onClose: () => void;
  children?: React.ReactNode;
}

export default function PopupHeadingSection({
  label,
  onClose,
  children,
}: PopupHeadingSectionProps) {
  return (
    <div className="flex max-w-full flex-col gap-4 p-[24px]">
      <div className="flex flex-row justify-between">
        <div className="flex flex-row">
          <div className=" text-left text-xl font-bold leading-7 text-gray-700">
            {label}
          </div>
          {children}
        </div>
        <div className="">
          <CloseButton onClick={onClose} />
        </div>
      </div>
      <div className={`w-full`}>
        <div className={`h-px bg-gray-300 `}></div>
      </div>
    </div>
  );
}
