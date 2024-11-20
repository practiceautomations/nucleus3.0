import { Popover, Transition } from '@headlessui/react';
import React, { Fragment } from 'react';
import { useSelector } from 'react-redux';

import { baseUrl } from '@/api/http-client';
import { getUserSelector } from '@/store/login/selectors';
import classNames from '@/utils/classNames';

interface DataType {
  id: number;
  title: string;
  showBottomDivider: boolean;
}
interface Tprops {
  buttonLabel: string;
  dataList: DataType[];
  onSelect: (value: number) => void;
  cls?: string;
}
export default function ButtonDropdown({
  dataList,
  onSelect,
  cls = '',
}: Tprops) {
  const user = useSelector(getUserSelector);
  const baseApiUrl = baseUrl.substring(0, baseUrl.lastIndexOf('/'));
  const userImagePath = user?.userImagePath
    ? baseApiUrl + user.userImagePath
    : '/assets/DefaultUser.png';

  return (
    <div
      className={classNames(
        'flex xs:max-w-full sm:max-w-full lg:max-w-md items-center',
        cls || ''
      )}
    >
      <Popover as="div" className="relative flex w-full rounded-full">
        <>
          <Popover.Button
            className={classNames(
              'mx-2 flex rounded-full bg-[#9ca3af] text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2'
            )}
          >
            <span className="sr-only">Open user menu</span>
            <img
              className="h-8 w-8 rounded-full"
              src={userImagePath}
              alt="dash-img"
            />
          </Popover.Button>
        </>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Popover.Panel
            className={classNames(
              'absolute top-12 right-[-100px] z-[14] py-1 origin-top-right divide-y rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none w-[224px] right-0'
            )}
          >
            {({ close }) => {
              return (
                <div className="flex flex-col">
                  {!!dataList &&
                    dataList.map((d) => (
                      <div
                        className={classNames(
                          d.showBottomDivider
                            ? 'border-b border-gray-100 hover:border-b w-full hover:border-gray-100'
                            : 'hover:border-0',
                          'py-3 px-4'
                        )}
                        key={d.id}
                      >
                        <button
                          className={classNames(
                            d.id === 1
                              ? 'text-black font-medium'
                              : 'text-gray-700 font-normal',
                            'w-full cursor-pointer text-left text-sm leading-5 text-ellipsis overflow-hidden hover:opacity-75 focus:outline-none'
                          )}
                          onClick={async () => {
                            onSelect(d.id);
                            close();
                          }}
                        >
                          {d.title}
                        </button>
                      </div>
                    ))}
                </div>
              );
            }}
          </Popover.Panel>
        </Transition>
      </Popover>
    </div>
  );
}
