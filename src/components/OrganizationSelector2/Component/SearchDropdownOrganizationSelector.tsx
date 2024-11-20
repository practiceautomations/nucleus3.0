import { Combobox, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';

import type { OrganizationSearchDropdownData } from '@/store/chrome/types';

interface Tprops {
  data: OrganizationSearchDropdownData | null;
  onSelect: (value: any) => void;
  onChange: (value: any) => void;
}

export default function SearchOrganizationSelectorDropdown({
  data,
  onSelect,
  onChange,
}: Tprops) {
  const [selected, setSelected] = useState('');
  return (
    <Combobox value={selected} onChange={(event) => onSelect(event)}>
      <div className="relative mt-1 w-full">
        <div className="relative cursor-default overflow-hidden rounded-md border-slate-300 bg-white text-left sm:text-sm">
          <Combobox.Input
            onChange={(event) => {
              onChange(event.target.value);
            }}
            className=" h-10  w-full rounded-md border-slate-300 text-gray-500"
            value={''}
            placeholder="Search"
            type="text"
          />
        </div>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => {
            setSelected('');
          }}
        >
          <Combobox.Options className="absolute right-0 z-10  mt-1 max-h-60 w-[47rem] overflow-auto rounded-md bg-white text-base shadow-md  sm:text-sm">
            {data && data?.workGroups.length !== 0 && (
              <p className="h-6 items-center bg-gray-100 py-1  pl-2  text-left text-sm leading-none  text-gray-500">
                Workgroup
              </p>
            )}
            {data &&
              data.workGroups.map((m) => (
                <Combobox.Option
                  key={m.id}
                  className={'relative max-h-16 cursor-pointer select-none'}
                  value={m}
                >
                  <span
                    className={`block truncate py-2 max-h-9 text-left pl-2 text-sm font-medium leading-tight text-gray-600`}
                  >
                    {m.value}
                  </span>
                </Combobox.Option>
              ))}
            {data && data?.groups.length !== 0 && (
              <p className="h-6 items-center bg-gray-100 py-1  pl-2  text-left text-sm leading-none  text-gray-500">
                Group
              </p>
            )}
            {data &&
              data.groups.map((m) => (
                <Combobox.Option
                  key={m.id}
                  className="relative max-h-16 cursor-pointer select-none"
                  value={m}
                >
                  <span
                    className={`block truncate py-2 max-h-9 text-left pl-2 `}
                  >
                    <span className="text-sm font-medium leading-tight text-gray-600">
                      {' '}
                      {m.value}{' '}
                    </span>{' '}
                    {m.einNumber && (
                      <span className="pl-1 text-xs text-gray-400">
                        EIN::{m.einNumber}
                      </span>
                    )}
                  </span>
                </Combobox.Option>
              ))}
            {data && data?.practices.length !== 0 && (
              <p className="h-6 items-center bg-gray-100 py-1  pl-2  text-left text-sm leading-none  text-gray-500">
                Practice
              </p>
            )}
            {data &&
              data.practices.map((m) => (
                <Combobox.Option
                  key={m.id}
                  className="relative max-h-16 cursor-pointer select-none"
                  value={m}
                >
                  <span
                    className={`block truncate py-2 max-h-9 text-left pl-2 `}
                  >
                    <span className="text-sm font-medium leading-tight text-gray-600">
                      {' '}
                      {m.value}{' '}
                    </span>{' '}
                    <span className="pl-1 text-xs text-gray-400">
                      {m.address}
                    </span>
                  </span>
                </Combobox.Option>
              ))}
            {data && data?.facilities.length !== 0 && (
              <p className="h-6 items-center bg-gray-100 py-1  pl-2  text-left text-sm leading-none  text-gray-500">
                Facility
              </p>
            )}
            {data &&
              data.facilities.map((m) => (
                <Combobox.Option
                  key={m.id}
                  className="relative max-h-16 cursor-pointer select-none"
                  value={m}
                >
                  <span
                    className={`block truncate py-2 max-h-9 text-left pl-2 `}
                  >
                    <span className="text-sm font-medium leading-tight text-gray-600">
                      {' '}
                      {m.value}{' '}
                    </span>{' '}
                    <span className="pl-1 text-xs text-gray-400">
                      PoS: {m.placeOfServiceCode} | {m.address}
                    </span>
                  </span>
                </Combobox.Option>
              ))}

            {data && data?.providers.length !== 0 && (
              <p className="h-6 items-center bg-gray-100 py-1  pl-2  text-left text-sm leading-none  text-gray-500">
                Provider
              </p>
            )}
            {data &&
              data.providers.map((m) => (
                <Combobox.Option
                  key={m.id}
                  className="relative max-h-16 cursor-pointer select-none "
                  value={m}
                >
                  <span
                    className={`block truncate py-2 max-h-9 text-left pl-2 `}
                  >
                    <span className="text-sm font-medium leading-tight text-gray-600">
                      {' '}
                      {m.value}{' '}
                    </span>{' '}
                    <span className="pl-1 text-xs text-gray-400">
                      NPI: {m.providerNPI}
                    </span>
                  </span>
                </Combobox.Option>
              ))}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  );
}
