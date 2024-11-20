import React from 'react';

import classNames from '@/utils/classNames';

import Button, { ButtonType } from '../Button';
import CloseButton from '../CloseButton';
import Modal from '../Modal';

export interface StatusDetailModalDataType {
  id: number;
  title: string;
  type: string;
  issues?: {
    issue: string;
  }[];
}

interface TProps {
  headingText: string;
  open: boolean;
  data: StatusDetailModalDataType[];
  onClose?: () => void;
  onDownload?: () => void;
}
export default function StatusDetailModal({
  headingText,
  open,
  data,
  onClose,
  onDownload,
}: TProps) {
  const onPressClose = () => {
    if (onClose) onClose();
  };
  return (
    <Modal open={open} modalContentClassName="" onClose={() => {}}>
      <div
        className="inline-flex flex-col items-center justify-start rounded-lg bg-white shadow"
        style={{ width: 960 }}
      >
        <div
          className="inline-flex items-end justify-center rounded-t-lg bg-gray-300 px-6 pt-6 pb-4"
          style={{ width: 960, height: 67 }}
        >
          <div
            className="inline-flex flex-col items-start justify-start space-y-1"
            style={{ width: 913, height: 28 }}
          >
            <div
              className="inline-flex items-center justify-between space-x-96"
              style={{ width: 913, height: 28 }}
            >
              <div className="flex items-center justify-start space-x-2">
                <p className="text-xl font-bold leading-7 text-gray-700">
                  {headingText}
                </p>
              </div>
              <div className="flex items-center justify-start space-x-4">
                <CloseButton onClick={onPressClose} />
              </div>
            </div>
          </div>
        </div>
        <div className="max-h-[450px] w-full space-y-5 overflow-auto p-5">
          {data.map((d, index) => {
            const colorMap: any = {
              success: 'green',
              warning: 'red',
              error: 'red',
              informational: 'yellow',
            };

            const color = colorMap[d.type] || 'green';

            return (
              <div
                key={index}
                className={classNames(
                  'w-full flex flex-col space-y-2 items-start justify-center p-4 border rounded-lg',
                  `bg-${color}-50 border-${color}-300`
                )}
                style={{ minHeight: 10 }}
              >
                <div
                  className="inline-flex flex-col items-start justify-center"
                  style={{ width: 881, height: 48 }}
                >
                  <p
                    className={classNames(
                      'text-sm font-medium leading-tight',
                      `text-${color}-700`
                    )}
                  >
                    Claim ID:
                  </p>
                  <p
                    className={classNames(
                      'text-xl font-bold leading-7',
                      `text-${color}-800`
                    )}
                  >
                    {d.title}
                  </p>
                </div>
                {!!d.issues?.length && (
                  <div className="flex flex-col items-start justify-center space-y-1">
                    <p
                      className={classNames(
                        `text-sm font-medium leading-tight text-${color}-700`
                      )}
                    >
                      Issues Found:
                    </p>
                    <ul className="flex list-disc flex-col items-start justify-start px-6">
                      {d.issues.map((r, i) => {
                        return (
                          <li
                            key={i}
                            className={classNames(
                              `text-sm leading-tight text-${color}-500`
                            )}
                          >
                            {r.issue}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="inline-flex w-full items-start justify-center rounded-b-lg bg-gray-200 py-6">
          <div className="flex w-full items-center justify-end space-x-4 px-7">
            <Button buttonType={ButtonType.secondary} onClick={onPressClose}>
              Close
            </Button>
            {onDownload && (
              <Button buttonType={ButtonType.primary} onClick={() => {}}>
                Download
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
