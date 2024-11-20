import { XMarkIcon } from '@heroicons/react/20/solid';
import type { ReactElement } from 'react';

import Icon from '@/components/Icon';
import { ToastType } from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';

export interface ToastProps {
  text: string;
  onClose?: () => void;
  toastType?: ToastType;
}

const bgColorsByType: { [key in ToastType]: string } = {
  [ToastType.SUCCESS]: 'bg-green-50 border-green-500',
  [ToastType.ERROR]: 'bg-red-50 border-red-500',
  [ToastType.WARNING]: 'bg-yellow-50 border-yellow-500',
  [ToastType.INFO]: 'bg-cyan-50 border-cyan-500',
};

const fontColorsByType: { [key in ToastType]: string } = {
  [ToastType.SUCCESS]: 'text-green-800',
  [ToastType.ERROR]: 'text-red-800',
  [ToastType.WARNING]: 'text-yellow-800',
  [ToastType.INFO]: 'text-cyan-800',
};
const closeButtonColorsByType: { [key in ToastType]: string } = {
  [ToastType.SUCCESS]: 'text-green-500',
  [ToastType.ERROR]: 'text-red-500',
  [ToastType.WARNING]: 'text-yellow-500',
  [ToastType.INFO]: 'text-cyan-500',
};

const iconByType: { [key in ToastType]: ReactElement } = {
  [ToastType.SUCCESS]: (
    <Icon name="checkCircle" color={IconColors.GREEN} aria-hidden="true" />
  ),
  [ToastType.ERROR]: (
    <Icon name="xCircle" color={IconColors.RED} aria-hidden="true" />
  ),
  [ToastType.WARNING]: (
    <Icon name="warning" color={IconColors.NONE} aria-hidden="true" />
  ),
  [ToastType.INFO]: (
    <Icon name="toastInfo" color={IconColors.NONE} aria-hidden="true" />
  ),
};

const Toast = ({
  text,
  onClose = () => {},
  toastType = ToastType.INFO,
}: ToastProps) => {
  return (
    <div
      className={classNames(
        'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 border-[1px] mb-2',
        bgColorsByType[toastType],
        fontColorsByType[toastType]
      )}
    >
      <div className="p-4">
        <div className="flex items-center">
          <div className="flex items-center">{iconByType[toastType]}</div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p
              className={classNames(
                'text-sm font-medium',
                fontColorsByType[toastType]
              )}
            >
              {text}
            </p>
          </div>
          <div className="ml-4 flex shrink-0">
            <button
              type="button"
              className={classNames(
                'inline-flex rounded-md focus:outline-none focus:ring-2',
                closeButtonColorsByType[toastType]
              )}
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;
