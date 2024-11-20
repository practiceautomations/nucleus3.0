/* This example requires Tailwind CSS v2.0+ */
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useSelector } from 'react-redux';

import { getAppSpinnerState } from '@/store/shared/selectors';
import classNames from '@/utils/classNames';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  modalClassName?: string;
  modalContentClassName?: string;
  modalBackgroundClassName?: string;
  hideBackdrop?: boolean;
}

function Modal({
  open,
  onClose,
  children,
  modalClassName = '',
  modalContentClassName = '',
  modalBackgroundClassName = '',
  hideBackdrop = false,
}: ModalProps) {
  const showAppSpinnerRequest = useSelector(getAppSpinnerState);
  return (
    <Transition show={open} as={Fragment}>
      <Dialog
        as="div"
        className={classNames(
          `relative z-[12] ${modalClassName}`,
          showAppSpinnerRequest.length ? '!pointer-events-none' : ''
        )}
        onClose={onClose}
        static
      >
        {!hideBackdrop && (
          <Transition
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500/75 transition-opacity" />
          </Transition>
        )}
        <div
          className={`fixed inset-0 z-10 overflow-y-auto ${modalBackgroundClassName}`}
        >
          <div className="flex h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              {/* relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6  */}
              <Dialog.Panel className={`${modalContentClassName}`}>
                {children}
              </Dialog.Panel>
            </Transition>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default Modal;
