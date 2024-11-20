import type { ReactElement } from 'react';
import React from 'react';

import Icon from '@/components/Icon';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';

import Button, { ButtonType } from '../Button';
import Modal from '../Modal';
import type { StatusDetailModalDataType } from '../StatusDetailModal';

export enum StatusModalType {
  ERROR = 'error',
  SUCCESS = 'success',
  WARNING = 'warning',
  INFO = 'info',
}

const bgColorsByType: { [key in StatusModalType]: string } = {
  [StatusModalType.SUCCESS]: 'bg-green-100',
  [StatusModalType.ERROR]: 'bg-red-100',
  [StatusModalType.WARNING]: 'bg-yellow-100',
  [StatusModalType.INFO]: 'bg-cyan-100',
};

const iconByType: { [key in StatusModalType]: ReactElement } = {
  [StatusModalType.SUCCESS]: (
    <Icon
      size={24}
      name="checkCircle"
      color={IconColors.GREEN}
      aria-hidden="true"
    />
  ),
  [StatusModalType.ERROR]: (
    <Icon
      size={24}
      name="errorNoBg"
      color={IconColors.RED_600}
      aria-hidden="true"
    />
  ),
  [StatusModalType.WARNING]: (
    <Icon
      size={24}
      name="warningNoBg"
      color={IconColors.Yellow}
      aria-hidden="true"
    />
  ),
  [StatusModalType.INFO]: (
    <Icon
      size={24}
      name="toastInfo"
      color={IconColors.NONE}
      aria-hidden="true"
    />
  ),
};

export interface StatusModalProps {
  open: boolean;
  heading?: string;
  description?: string;
  bottomDescription?: string;
  okButtonText?: string;
  closeButtonText?: string;
  okButtonColor?: ButtonType;
  closeButtonColor?: ButtonType;
  statusModalType?: StatusModalType;
  onClose?: () => void;
  showCloseButton?: boolean;
  onChange?: () => void;
  cls?: string;
  closeOnClickOutside?: boolean;
  showsubmitClaimMessages?: boolean;
  statusData?: StatusDetailModalDataType[];
  confirmType?: string;
}
export default function StatusModal({
  open,
  heading,
  description,
  bottomDescription,
  okButtonText = 'OK',
  closeButtonText = 'Close',
  okButtonColor = ButtonType.primary,
  closeButtonColor = ButtonType.secondary,
  statusModalType = StatusModalType.INFO,
  onClose,
  showCloseButton = true,
  onChange,
  cls = '',
  closeOnClickOutside = true,
  statusData,
}: StatusModalProps) {
  const onPressClose = () => {
    if (onClose) onClose();
  };
  return (
    <Modal
      open={open}
      modalContentClassName=""
      onClose={() => {
        if (closeOnClickOutside) onPressClose();
      }}
      modalClassName={'!z-[9991]'}
    >
      <div
        className={classNames(
          cls,
          'w-[512px] inline-flex flex-col space-y-6 items-center justify-start p-6 bg-white shadow rounded-lg'
        )}
      >
        <div className="flex flex-col items-center justify-start space-y-5">
          <div
            className={classNames(
              bgColorsByType[statusModalType],
              'inline-flex items-center justify-center w-12 h-12 p-3 rounded-full'
            )}
          >
            {iconByType[statusModalType]}
          </div>
          <div className="flex flex-col items-center justify-start space-y-2">
            {!!heading && (
              <p className="text-center text-lg font-medium leading-normal text-gray-900">
                {heading}
              </p>
            )}
            {!!description &&
              description.split('\n').map((line, index) => (
                <p
                  key={index}
                  className="text-center text-sm leading-tight text-gray-500"
                >
                  {line}
                </p>
              ))}
            {statusData && statusData.length > 0 && (
              <div className="max-h-[450px] w-full space-y-5 overflow-auto p-2.5 pt-3">
                {statusData &&
                  statusData.map((d, index) => {
                    const colorMap: any = {
                      success: 'green',
                      warning: 'yellow',
                      error: 'red',
                      informational: 'yellow',
                    };
                    const color = colorMap[d.type] || 'yellow';
                    return (
                      <div
                        key={index}
                        className={classNames(
                          'w-full flex flex-col space-y-2 items-start justify-center p-4 border rounded-lg',
                          `bg-${color}-50 border-${color}-300`
                        )}
                        style={{ minHeight: 10 }}
                      >
                        {!!d.issues?.length && (
                          <div className="flex flex-col items-start justify-center space-y-1">
                            <p
                              className={classNames(
                                `text-sm font-medium leading-tight text-${color}-700`
                              )}
                            >
                              {d.type === 'error'
                                ? 'Critical Errors Found:'
                                : 'Potential Issues Found:'}
                            </p>
                            <ul className="flex list-disc flex-col items-start justify-start px-6">
                              {d.issues.map((r, i) => {
                                return (
                                  <li
                                    key={i}
                                    className={classNames(
                                      `text-sm leading-tight text-${color}-700`
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
            )}
            {bottomDescription && (
              <p className="text-center text-sm leading-tight text-gray-500">
                {bottomDescription}
              </p>
            )}
          </div>
        </div>
        <div className="inline-flex w-full items-start justify-start space-x-3">
          {showCloseButton && (
            <Button
              buttonType={closeButtonColor}
              onClick={onPressClose}
              cls="focus:ring-0 flex items-center justify-center flex-1"
            >
              {closeButtonText}
            </Button>
          )}
          <Button
            buttonType={okButtonColor}
            onClick={onChange}
            cls="flex items-center justify-center flex-1"
          >
            {okButtonText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
