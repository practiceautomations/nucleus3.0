import React, { useEffect, useRef, useState } from 'react';

import { AppConfig } from '@/utils/AppConfig';
import classNames from '@/utils/classNames';

export interface MultiSelectViewDataType {
  id: number;
  value: string;
  appendText?: string;
  active?: boolean;
}
interface Tprops {
  selectedValue: MultiSelectViewDataType[];
  data: MultiSelectViewDataType[];
  onSelect: (value: MultiSelectViewDataType[]) => void;
  cls?: string;
  clsSelection?: string;
  showSearchBar?: boolean;
  onSearch?: (value: string) => void;
  appendTextClass?: string;
  searchOnCharacterLength?: number;
  searchDelayInSeconds?: number;
}
export default function MultiSelectView({
  selectedValue,
  data,
  onSelect,
  cls,
  clsSelection,
  showSearchBar = false,
  onSearch,
  appendTextClass,
  searchOnCharacterLength = AppConfig.searchOnCharacterLength,
  searchDelayInSeconds = AppConfig.searchDelayInSeconds,
}: Tprops) {
  const [query, setQuery] = useState<MultiSelectViewDataType[]>([]);
  useEffect(() => {
    setQuery(
      data.map((item) => ({
        ...item,
        active: item.active === undefined ? true : item.active,
      }))
    );
  }, [data]);
  const onChange = (value: MultiSelectViewDataType[]) => {
    setTimeout(() => {
      onSelect(value);
    }, 100);
  };
  const [enableSearchCall, setEnableSearchCall] = useState(true);
  const searchTxt = useRef('');
  const preSearchTxt = useRef('');
  const isSearch = () => {
    preSearchTxt.current = searchTxt.current;
    if (onSearch) {
      onSearch(searchTxt.current);
    }
  };
  const onTextChange = (txt: string) => {
    searchTxt.current = txt;
    if (txt.length >= searchOnCharacterLength && enableSearchCall) {
      isSearch();
      setEnableSearchCall(false);
      setTimeout(() => {
        setEnableSearchCall(true);
        if (searchTxt.current !== preSearchTxt.current) isSearch();
      }, searchDelayInSeconds * 1000);
    }
  };
  return (
    <div className={classNames(cls || '', 'h-full w-full bg-white')}>
      {showSearchBar && (
        <div className="bg-gray-100 p-1">
          <input
            ref={(input) => {
              setTimeout(() => {
                if (input) input.focus();
              }, 500);
            }}
            autoComplete="off"
            type="text"
            onChange={(e) => {
              const txt = e.target.value;
              if (onSearch) {
                onTextChange(txt);
              } else {
                setQuery(
                  data.filter((d) => {
                    return d.value.toLowerCase().includes(txt.toLowerCase());
                  })
                );
              }
            }}
            className={
              'w-full rounded-md border border-solid border-gray-300 bg-white py-2 pl-3 pr-10 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300 sm:text-sm'
            }
            aria-describedby="email-error"
            placeholder="Type to search..."
          />
        </div>
      )}
      <div className={classNames(clsSelection || '', 'max-h-80 overflow-auto')}>
        {query.map((d) => (
          <div
            key={d.id}
            className={classNames(
              'border-solid border-2 border-transparent',
              selectedValue
                .map((m) => {
                  return m.id;
                })
                .includes(d.id)
                ? 'font-semibold'
                : ' ',
              d?.active === false ? 'bg-gray-100 text-gray-500' : '',
              'relative cursor-default select-none py-2 pl-3 pr-9  hover:border-transparent hover:bg-gray-100'
            )}
            onClick={() => {
              // if (!d?.active) return;
              const isExist = selectedValue
                .map((m) => {
                  return m.id;
                })
                .includes(d.id);
              onChange(
                isExist
                  ? selectedValue.filter((m) => m.id !== d.id)
                  : [...selectedValue, d]
              );
            }}
          >
            <>
              {selectedValue
                .map((m) => {
                  return m.id;
                })
                .includes(d.id) && (
                <span
                  className={classNames(
                    selectedValue
                      .map((m) => {
                        return m.id;
                      })
                      .includes(d.id)
                      ? 'text-cyan-400'
                      : '',
                    ` absolute inset-y-0 left-0 flex items-center pl-1.5`
                  )}
                >
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              )}
              <span className={'ml-6 block'}>
                {d.value}
                {!!d?.appendText && (
                  <span
                    className={classNames(`text-gray-500  ${appendTextClass}`)}
                  >
                    {` - ${d?.appendText}`}
                  </span>
                )}
              </span>
            </>
          </div>
        ))}
      </div>
      {!!selectedValue.length && (
        <div className="z-40 box-border flex flex flex-none grow-0 flex-row flex-wrap items-start gap-2 border-x-0 border-y-2 border-solid border-gray-300 bg-gray-100 px-[16px] py-2">
          {selectedValue.map((d, index) => {
            return (
              <div
                key={`${index}`}
                className="flex gap-1 rounded bg-cyan-100 px-[8px]"
              >
                <div className="py-[2px]  text-sm text-cyan-700">{d.value}</div>
                <div>
                  <button
                    className="py-[2px] text-sm font-bold text-cyan-400"
                    onClick={() => {
                      onChange(selectedValue.filter((m) => m.id !== d.id));
                    }}
                  >
                    x
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
