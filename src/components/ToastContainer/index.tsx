import { Transition } from '@headlessui/react';
import { Fragment, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { removeToastNotification } from '@/store/shared/actions';
import {
  getAppConfiguration,
  getToastNotificationsSelector,
} from '@/store/shared/selectors';
import type { Toast as ToastType } from '@/store/shared/types';

import Toast from '../UI/Toast';
import ToastWithDetail from '../UI/ToastWithDetail';

const ToastContainer = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(getToastNotificationsSelector);
  const appConfiguration = useSelector(getAppConfiguration);
  const handleRemoveToastNotification = (notification: ToastType) => {
    dispatch(removeToastNotification(notification));
  };

  const autoCloseHistry = useRef<string[]>([]);
  const autoClose = (notification: ToastType) => {
    if (notification.toastType) {
      const closeAfterSec =
        appConfiguration.toastAutoCloseAfterSec[notification.toastType];
      const isDetailToast = !!notification.detail;

      if (
        !autoCloseHistry.current.includes(notification.id) &&
        !!closeAfterSec &&
        !isDetailToast
      ) {
        autoCloseHistry.current.push(notification.id);
        setTimeout(() => {
          autoCloseHistry.current = autoCloseHistry.current.filter(
            (v) => v !== notification.id
          );
          handleRemoveToastNotification(notification);
        }, closeAfterSec * 1000);
      }
    }
  };

  return (
    <>
      {/* Global notification live region, render this permanently at the end of the document */}
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 !z-[9992] flex items-end px-4 py-6 sm:items-start sm:p-6"
      >
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
          {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
          <Transition
            show={notifications.length > 0}
            as={Fragment}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="flex w-full max-w-sm flex-col items-end">
              {notifications.map((notification) => (
                <>
                  {autoClose(notification)}
                  {notification.detail ? (
                    <ToastWithDetail
                      key={notification.text}
                      detail={notification.detail}
                      {...notification}
                      onClose={() => {
                        if (notification.onClose) notification.onClose();
                        handleRemoveToastNotification(notification);
                      }}
                    />
                  ) : (
                    <Toast
                      key={notification.text}
                      {...notification}
                      onClose={() => {
                        if (notification.onClose) notification.onClose();
                        handleRemoveToastNotification(notification);
                      }}
                    />
                  )}
                </>
              ))}
            </div>
          </Transition>
        </div>
      </div>
    </>
  );
};

export default ToastContainer;
