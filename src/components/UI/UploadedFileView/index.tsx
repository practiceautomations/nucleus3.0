import React, { useEffect, useState } from 'react';

import Icon from '@/components/Icon';
import classNames from '@/utils/classNames';

export interface UploadedFileViewProps {
  fileName: string;
  cls?: string;
  showViewButton?: boolean;
  showDownloadButton?: boolean;
  showDeleteButton?: boolean;
  onView?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
}

const UploadedFileView = ({
  fileName,
  cls,
  showViewButton = true,
  showDownloadButton = true,
  showDeleteButton = true,
  onView,
  onDownload,
  onDelete,
}: UploadedFileViewProps) => {
  const [fileIcon, setfileIcon] = useState('');

  useEffect(() => {
    const ext = fileName.slice(
      (Math.max(0, fileName.lastIndexOf('.')) || Infinity) + 1
    );
    if (ext === 'pdf') {
      setfileIcon('pdfDocument');
    }
    if (ext === 'xml') {
      setfileIcon('xmlDocument');
    }
    if (ext === 'png') {
      setfileIcon('pngDocument');
    }
    if (ext === 'jpg') {
      setfileIcon('jpgDocument');
    }
  }, [fileName]);

  return (
    <div
      className={classNames(
        'inline-flex space-x-2 items-center justify-start w-full p-2 bg-white shadow border rounded-md border-gray-300',
        cls || ''
      )}
    >
      <div className="flex flex-1 items-center justify-start space-x-2 py-2">
        <Icon name={fileIcon} size={18} />
        <p className="w-[220px] truncate text-sm leading-tight text-gray-500">
          {fileName}
        </p>
      </div>
      <div className="flex items-start justify-start space-x-2">
        {showViewButton && (
          <button
            onClick={onView}
            className="flex h-full items-center justify-center rounded-md border border-gray-300 bg-white p-2 shadow"
          >
            <Icon name={'eye'} size={18} />
          </button>
        )}
        {showDownloadButton && (
          <button
            onClick={onDownload}
            className="flex h-full items-center justify-center rounded-md border border-gray-300 bg-white p-2 shadow"
          >
            <Icon name={'documentDownload'} size={18} />
          </button>
        )}
        {showDeleteButton && (
          <button
            onClick={onDelete}
            className="flex h-full items-center justify-center rounded-md border border-gray-300 bg-white p-2 shadow"
          >
            <Icon name={'trash'} size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default UploadedFileView;
