import React, { useRef } from 'react';

import Icon from '@/components/Icon';
import classNames from '@/utils/classNames';

export interface UploadFileProps
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  placeholder?: string;
  disabled?: boolean;
  cls?: string;
  onFileSelect: (value: File) => void;
  selectedFileName?: string;
}

const UploadFile = ({
  placeholder = 'Click to select file',
  disabled = false,
  cls,
  onFileSelect,
  selectedFileName,
  ...rest
}: UploadFileProps) => {
  const inputFile = useRef<HTMLInputElement | null>(null);

  const onButtonClick = () => {
    if (inputFile.current) {
      inputFile.current.click();
    }
  };
  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onFileSelect(event.target.files[0]);
      // eslint-disable-next-line no-param-reassign
      event.target.value = '';
    }
  };
  return (
    <button
      disabled={disabled}
      onClick={onButtonClick}
      className={classNames(
        'inline-flex space-x-2 items-center justify-between w-full px-3 py-2 border rounded-md border-gray-300',
        disabled ? 'bg-gray-100' : 'bg-white',
        cls || ''
      )}
    >
      {selectedFileName ? (
        <p className="truncate text-sm leading-tight text-gray-500">
          {selectedFileName}
        </p>
      ) : (
        <p className="text-sm leading-tight text-gray-500">{placeholder}</p>
      )}
      <input
        {...rest}
        ref={inputFile}
        disabled={disabled}
        type={'file'}
        accept="application/pdf,image/jpeg,image/png"
        className="hidden"
        onChange={onFileChange}
      />
      <Icon name={'upload'} size={18} />
    </button>
  );
};

export default UploadFile;
