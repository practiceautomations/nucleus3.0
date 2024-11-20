import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Icon from '@/components/Icon';
import AddPaymentBatch from '@/screen/batch/addPaymentBatch';
// eslint-disable-next-line import/no-cycle
import DetailPaymentBatch from '@/screen/batch/detailPaymentBatch';
// eslint-disable-next-line import/no-cycle
import DetailPaymentERA from '@/screen/payments/DetailPaymentERA';
import { setGlobleSearchDropdownValue } from '@/store/chrome/actions';
import {
  getGlobleSearchDropdownValueSelector,
  getselectdWorkGroupsIDsSelector,
} from '@/store/chrome/selectors';
import {
  fetchGlobleSearchRecentsDataRequest,
  setGlobalModal,
} from '@/store/shared/actions';
import {
  fetchGlobleSearchData,
  saveGlobleSearchViewData,
} from '@/store/shared/sagas';
import { getGlobleSearchRecentsDataSelector } from '@/store/shared/selectors';
import type {
  GlobleSearchCriteria,
  GlobleSearchResult,
  GlobleSearchViewCriteria,
} from '@/store/shared/types';
import { IconColors } from '@/utils/ColorFilters';

import SingleSelectDropDown from '../UI/SingleSelectDropDown';

const GlobalSearch = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [searchVal, setSearchVal] = useState('');
  const [showSearches, setShowSearches] = useState(false);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [searchApiData, setSearchApiData] = useState<GlobleSearchResult[]>();

  const [openAddUpdateBatchModealInfo, setOpenAddUpdateBatchModealInfo] =
    useState<{
      type: string;
      id?: number;
    }>();
  const [openAddUpdateERAModealInfo, setOpenAddUpdateERAModealInfo] = useState<{
    open: boolean;
    type?: string;
    id?: number;
  }>({ open: false });

  const [refreshDetailView, setRefreshDetailView] = useState<string>();
  useEffect(() => {
    if (refreshDetailView === 'refresh') {
      setRefreshDetailView(undefined);
    }
  }, [refreshDetailView]);

  const selectedWorkedGroup = useSelector(getselectdWorkGroupsIDsSelector);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLInputElement>(null);

  const data = [
    {
      id: 0,
      value: 'Claims',
    },
    {
      id: 1,
      value: 'Patients',
    },
    {
      id: 2,
      value: 'Payments',
    },
  ];
  const [selectedValue, setSelectedValue] = useState(data[0]);

  const globleSearchRecents = useSelector(getGlobleSearchRecentsDataSelector);
  useEffect(() => {
    if (selectedWorkedGroup?.groupsData[0]?.id) {
      setSearchVal('');
      dispatch(
        fetchGlobleSearchRecentsDataRequest({
          groupID: selectedWorkedGroup?.groupsData[0]?.id,
          category: selectedValue?.value,
        })
      );
    }
  }, [selectedWorkedGroup, selectedValue]);

  const globleSearchDropdownVal = useSelector(
    getGlobleSearchDropdownValueSelector
  );
  useEffect(() => {
    if (globleSearchDropdownVal) {
      setSelectedValue(globleSearchDropdownVal);
      dispatch(setGlobleSearchDropdownValue(null));
    }
  }, []);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Check if the input length is greater than 3 characters
    if (inputValue.length >= 3) {
      setSearchVal(inputValue);
      setShowSearches(true);
      setShowRecentSearches(false);

      const obj: GlobleSearchCriteria = {
        groupID: selectedWorkedGroup?.groupsData[0]?.id || null,
        category: selectedValue?.value || '',
        searchValue: inputValue,
      };
      const res = await fetchGlobleSearchData(obj);
      if (res) {
        setSearchApiData(res);
      }
    } else {
      setSearchVal(inputValue);
      setShowRecentSearches(false);
      setShowSearches(false);
    }
  };

  const handleInputClick = () => {
    // Show the recent searches dropdown when the search input is clicked
    if (
      searchInputRef &&
      searchInputRef.current &&
      searchInputRef.current.value.length >= 3
    ) {
      setShowSearches(true);
    }
    if (!searchInputRef.current?.value) {
      setShowRecentSearches(true);
      setShowSearches(false);
    }
  };

  useEffect(() => {
    // Add an event listener to close the dropdown when clicking outside of the search bar and dropdown
    const handleOutsideClick = ({ target }: MouseEvent) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(target as Node) &&
        !dropdownRef.current?.contains(target as Node)
      ) {
        setShowRecentSearches(false);
        setShowSearches(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      // Clean up the event listener when the component unmounts
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  return (
    <div className="flex flex-col justify-center px-5 lg:w-[70%]">
      <div className=" inline-flex h-20 w-full items-center justify-start">
        <SingleSelectDropDown
          placeholder="-"
          cls="bg-gray-100 mb-1 h-9.5 w-[118px] focus:ring-0 !text-gray-500 !rounded-none !rounded-l-md"
          cls2="!z-50"
          // disabled={true}
          data={data}
          selectedValue={selectedValue}
          onSelect={(e) => {
            setSelectedValue(e);
            setSearchApiData([]);
          }}
        />
        <div className="relative grow">
          <div className="flex items-center justify-start">
            <div className="absolute top-[12px] left-[10px]">
              <Icon name="search" size={17} color={IconColors.GRAY} />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              className="h-[38px] w-full shrink grow basis-0 rounded-r-md border border-gray-300 px-2 py-1 pl-[35px] pt-1.5 font-['Nunito'] text-sm font-normal leading-tight text-gray-500 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:ring-offset-0"
              placeholder={
                // eslint-disable-next-line no-nested-ternary
                selectedValue?.value === 'Claims'
                  ? 'Search by Claim ID, DOS or Reference #'
                  : selectedValue?.value === 'Patients'
                  ? 'Search by Patient Name or ID'
                  : 'Search by Payment Number'
              }
              value={searchVal}
              onChange={handleInputChange}
              onClick={handleInputClick}
            />
          </div>
          {showRecentSearches && (
            <div
              className="absolute top-10 z-50 mt-1 inline-flex h-auto w-full flex-col items-start justify-start rounded-md border border-gray-300 bg-white shadow"
              ref={dropdownRef}
            >
              <div className="inline-flex items-center justify-start gap-1 self-stretch bg-gray-100 px-4 py-1">
                <div className="font-['Nunito'] text-xs font-normal leading-none text-gray-500">
                  Group /Organization:
                </div>
                <div className="font-['Nunito'] text-xs font-normal leading-none text-gray-500">
                  {selectedWorkedGroup?.groupsData[0]?.value}
                </div>
              </div>
              {globleSearchRecents && globleSearchRecents.length > 0 ? (
                <div className="inline-flex items-start justify-start gap-2 self-stretch p-4">
                  <div className="font-['Nunito'] text-sm font-bold leading-tight text-gray-600">
                    Recently Viewed Items
                  </div>
                </div>
              ) : (
                <div className="inline-flex items-start justify-start gap-2 self-stretch p-4">
                  <div className="font-['Nunito'] text-sm font-bold leading-tight text-gray-600">
                    No Recently Viewed Items
                  </div>
                </div>
              )}
              <div className="flex h-auto flex-col items-start justify-start self-stretch">
                {globleSearchRecents &&
                  globleSearchRecents.map((m) => (
                    <>
                      {selectedValue?.value === 'Claims' && (
                        <div className="inline-flex items-center justify-between self-stretch px-4 py-2">
                          <div className="flex items-center justify-start gap-1">
                            <div className="font-['Nunito'] text-sm font-normal leading-tight text-gray-700">
                              Claim ID #{m.id}
                            </div>
                            <div className="font-['Nunito'] text-xs font-normal leading-none text-gray-500">
                              -
                            </div>
                            <div className="font-['Nunito'] text-xs font-normal leading-none text-gray-500">
                              DoS: {m.value}
                            </div>
                            <div className="font-['Nunito'] text-xs font-normal leading-none text-gray-500">
                              -
                            </div>
                            <div className="font-['Nunito'] text-xs font-normal leading-none text-gray-500">
                              Ref #{m.referenceNumber}
                            </div>
                          </div>
                          <div className="flex items-center justify-start gap-3">
                            <div
                              className="cursor-pointer font-['Nunito'] text-xs font-normal leading-none text-cyan-500 underline"
                              onClick={async () => {
                                const obj: GlobleSearchViewCriteria = {
                                  groupID:
                                    selectedWorkedGroup?.groupsData[0]?.id,
                                  lineItemID: m.id,
                                  viewType: 'claims',
                                  category: `${m.type}`,
                                };
                                await saveGlobleSearchViewData(obj);
                                setShowRecentSearches(false);
                                router.push(`/app/claim-detail/${m.id}`);
                              }}
                            >
                              View
                            </div>
                          </div>
                        </div>
                      )}
                      {selectedValue?.value === 'Patients' && (
                        <div className="inline-flex items-center justify-between self-stretch px-4 py-2">
                          <div className="flex items-center justify-start gap-1">
                            <div className="font-['Nunito'] text-sm font-normal leading-tight text-gray-700">
                              {m.value}
                            </div>
                            <div className="font-['Nunito'] text-xs font-normal leading-none text-gray-500">
                              -
                            </div>
                            <div className="font-['Nunito'] text-xs font-normal leading-none text-gray-500">
                              Patient ID #{m.id}
                            </div>
                          </div>
                          <div className="flex items-center justify-start gap-3">
                            <div
                              className="cursor-pointer font-['Nunito'] text-xs font-normal leading-none text-cyan-500 underline"
                              onClick={async () => {
                                const obj: GlobleSearchViewCriteria = {
                                  groupID:
                                    selectedWorkedGroup?.groupsData[0]?.id,
                                  lineItemID: m.id,
                                  viewType: 'patients',
                                  category: `${m.type}`,
                                };
                                await saveGlobleSearchViewData(obj);
                                setShowRecentSearches(false);
                                // router.push(`/app/register-patient/${m.id}`);
                                dispatch(
                                  setGlobalModal({
                                    type: 'Patient Detail',
                                    id: m.id,
                                    isPopup: true,
                                  })
                                );
                                dispatch(
                                  setGlobleSearchDropdownValue(selectedValue)
                                );
                              }}
                            >
                              View
                            </div>
                          </div>
                        </div>
                      )}
                      {selectedValue?.value === 'Payments' && (
                        <div className="inline-flex items-center justify-between self-stretch px-4 py-2">
                          <div className="flex items-center justify-start gap-1">
                            <div className="font-['Nunito'] text-sm font-normal leading-tight text-gray-700">
                              Payment #{m.value}
                            </div>
                            <div className="font-['Nunito'] text-xs font-normal leading-none text-gray-500">
                              -
                            </div>
                            <div className="font-['Nunito'] text-xs font-normal leading-none text-gray-500">
                              {m.type === 'era'
                                ? 'ERA'
                                : 'Manual Payment Batch'}{' '}
                              #{m.id}
                            </div>
                          </div>
                          <div className="flex items-center justify-start gap-3">
                            <div
                              className="cursor-pointer font-['Nunito'] text-xs font-normal leading-none text-cyan-500 underline"
                              onClick={async () => {
                                const obj: GlobleSearchViewCriteria = {
                                  groupID:
                                    selectedWorkedGroup?.groupsData[0]?.id,
                                  lineItemID: m.id,
                                  viewType: 'payments',
                                  category: `${m.type}`,
                                };
                                await saveGlobleSearchViewData(obj);
                                setShowRecentSearches(false);
                                if (m.type === 'payment batch') {
                                  setOpenAddUpdateBatchModealInfo({
                                    type: 'detail',
                                    id: m.id,
                                  });
                                }
                                if (m.type === 'era') {
                                  setOpenAddUpdateERAModealInfo({
                                    open: true,
                                    type: 'detail',
                                    id: m.id,
                                  });
                                }
                                dispatch(
                                  fetchGlobleSearchRecentsDataRequest({
                                    groupID:
                                      selectedWorkedGroup?.groupsData[0]?.id,
                                    category: selectedValue?.value,
                                  })
                                );
                              }}
                            >
                              View
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ))}
              </div>
            </div>
          )}
          {showSearches && (
            <div
              className={`w-full mt-1 ${
                searchApiData && searchApiData?.length < 6 ? `h-auto` : `h-64`
              } bg-white rounded-md shadow border border-gray-300 flex-col justify-start items-start inline-flex absolute top-10 z-50`}
              ref={dropdownRef}
            >
              <div
                className={`self-stretch ${
                  searchApiData && searchApiData?.length < 6
                    ? `h-auto`
                    : `h-[250px]`
                } flex-col justify-start items-start flex`}
              >
                <div className="inline-flex items-center justify-start gap-1 self-stretch bg-gray-100 px-4 py-1">
                  <div className="font-['Nunito'] text-xs font-normal leading-none text-gray-500">
                    Group /Organization:
                  </div>
                  <div className="font-['Nunito'] text-xs font-normal leading-none text-gray-500">
                    {selectedWorkedGroup?.groupsData[0]?.value}
                  </div>
                </div>
                <div className="h-px self-stretch bg-gray-200" />
                <div className="mt-1 flex flex-col items-start justify-start self-stretch overflow-y-auto">
                  {searchApiData && searchApiData?.length > 0 ? (
                    searchApiData.map((m) => (
                      <>
                        {selectedValue?.value === 'Claims' && (
                          <div className="inline-flex items-center justify-between self-stretch px-4 py-2">
                            <div className="flex items-center justify-start gap-1">
                              <div className="font-['Nunito'] text-sm font-normal leading-tight text-gray-700">
                                Claim ID #{m.id}
                              </div>
                              <div className="font-['Nunito'] text-xs font-normal leading-none text-gray-500">
                                -
                              </div>
                              <div className="font-['Nunito'] text-xs font-normal leading-none text-gray-500">
                                DoS: {m.value}
                              </div>
                              <div className="font-['Nunito'] text-xs font-normal leading-none text-gray-500">
                                -
                              </div>
                              <div className="font-['Nunito'] text-xs font-normal leading-none text-gray-500">
                                Ref #{m.referenceNumber}
                              </div>
                            </div>
                            <div className="flex items-center justify-start gap-3">
                              <div
                                className="cursor-pointer font-['Nunito'] text-xs font-normal leading-none text-cyan-500 underline"
                                onClick={async () => {
                                  const obj: GlobleSearchViewCriteria = {
                                    groupID:
                                      selectedWorkedGroup?.groupsData[0]?.id,
                                    lineItemID: m.id,
                                    viewType: 'claims',
                                    category: `${m.type}`,
                                  };
                                  await saveGlobleSearchViewData(obj);
                                  setShowSearches(false);
                                  router.push(`/app/claim-detail/${m.id}`);
                                }}
                              >
                                View
                              </div>
                            </div>
                          </div>
                        )}
                        {selectedValue?.value === 'Patients' && (
                          <div className="inline-flex items-center justify-between self-stretch px-4 py-2">
                            <div className="flex items-center justify-start gap-1">
                              <div className="font-['Nunito'] text-sm font-normal leading-tight text-gray-700">
                                {m.value}
                              </div>
                              <div className="font-['Nunito'] text-xs font-normal leading-none text-gray-500">
                                -
                              </div>
                              <div className="font-['Nunito'] text-xs font-normal leading-none text-gray-500">
                                Patient ID #{m.id}
                              </div>
                            </div>
                            <div className="flex items-center justify-start gap-3">
                              <div
                                className="cursor-pointer font-['Nunito'] text-xs font-normal leading-none text-cyan-500 underline"
                                onClick={async () => {
                                  const obj: GlobleSearchViewCriteria = {
                                    groupID:
                                      selectedWorkedGroup?.groupsData[0]?.id,
                                    lineItemID: m.id,
                                    viewType: 'patients',
                                    category: `${m.type}`,
                                  };
                                  await saveGlobleSearchViewData(obj);
                                  setShowSearches(false);
                                  dispatch(
                                    setGlobalModal({
                                      type: 'Patient Detail',
                                      id: m.id,
                                      isPopup: true,
                                    })
                                  );
                                  // router.push(`/app/register-patient/${m.id}`);
                                  dispatch(
                                    setGlobleSearchDropdownValue(selectedValue)
                                  );
                                }}
                              >
                                View
                              </div>
                            </div>
                          </div>
                        )}
                        {selectedValue?.value === 'Payments' && (
                          <div className="inline-flex items-center justify-between self-stretch px-4 py-2">
                            <div className="flex items-center justify-start gap-1">
                              <div className="font-['Nunito'] text-sm font-normal leading-tight text-gray-700">
                                Payment #{m.value}
                              </div>
                              <div className="font-['Nunito'] text-xs font-normal leading-none text-gray-500">
                                -
                              </div>
                              <div className="font-['Nunito'] text-xs font-normal leading-none text-gray-500">
                                {m.type === 'era'
                                  ? 'ERA'
                                  : 'Manual Payment Batch'}{' '}
                                #{m.id}
                              </div>
                            </div>
                            <div className="flex items-center justify-start gap-3">
                              <div
                                className="cursor-pointer font-['Nunito'] text-xs font-normal leading-none text-cyan-500 underline"
                                onClick={async () => {
                                  const obj: GlobleSearchViewCriteria = {
                                    groupID:
                                      selectedWorkedGroup?.groupsData[0]?.id,
                                    lineItemID: m.id,
                                    viewType: 'payments',
                                    category: `${m.type}`,
                                  };
                                  await saveGlobleSearchViewData(obj);
                                  setShowSearches(false);
                                  if (m.type === 'payment batch') {
                                    setOpenAddUpdateBatchModealInfo({
                                      type: 'detail',
                                      id: m.id,
                                    });
                                  }
                                  if (m.type === 'era') {
                                    setOpenAddUpdateERAModealInfo({
                                      open: true,
                                      type: 'detail',
                                      id: m.id,
                                    });
                                  }
                                  dispatch(
                                    fetchGlobleSearchRecentsDataRequest({
                                      groupID:
                                        selectedWorkedGroup?.groupsData[0]?.id,
                                      category: selectedValue?.value,
                                    })
                                  );
                                }}
                              >
                                View
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ))
                  ) : (
                    <div className="inline-flex items-center justify-start gap-3 self-stretch p-4">
                      <div className="flex items-center justify-start gap-1">
                        <div className="font-['Nunito'] text-sm font-normal leading-tight text-gray-700">
                          No Results Found
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {openAddUpdateBatchModealInfo?.type && (
        <>
          {['detail', 'updateFromDetail'].includes(
            openAddUpdateBatchModealInfo?.type
          ) && (
            <DetailPaymentBatch
              open={true}
              batchId={openAddUpdateBatchModealInfo.id}
              refreshDetailView={refreshDetailView}
              onClose={() => {
                setOpenAddUpdateBatchModealInfo(undefined);
              }}
              onEdit={() => {
                setOpenAddUpdateBatchModealInfo({
                  ...openAddUpdateBatchModealInfo,
                  type: 'updateFromDetail',
                });
              }}
            />
          )}
          {['update', 'updateFromDetail'].includes(
            openAddUpdateBatchModealInfo?.type
          ) && (
            <AddPaymentBatch
              open={true}
              batchId={openAddUpdateBatchModealInfo.id}
              hideBackdrop={['updateFromDetail'].includes(
                openAddUpdateBatchModealInfo.type
              )}
              onClose={(isAddedUpdated) => {
                // if is added or update, refresh listing data
                // if (isAddedUpdated && isChangedJson) {
                //   getSearchData(lastSearchCriteria);
                // }
                // if 'updateFromDetail' type present then open DetailPaymentBatch model
                // else close both modals
                if (openAddUpdateBatchModealInfo.type === 'updateFromDetail') {
                  if (isAddedUpdated) {
                    setRefreshDetailView('refresh');
                  }
                  setOpenAddUpdateBatchModealInfo({
                    ...openAddUpdateBatchModealInfo,
                    type: 'detail',
                  });
                } else {
                  setOpenAddUpdateBatchModealInfo(undefined);
                }
              }}
            />
          )}
        </>
      )}
      {openAddUpdateERAModealInfo.open && openAddUpdateERAModealInfo.id && (
        <>
          <DetailPaymentERA
            open={openAddUpdateERAModealInfo.open}
            eraId={openAddUpdateERAModealInfo.id}
            onClose={() => {
              setOpenAddUpdateERAModealInfo({ open: false });
            }}
          />
        </>
      )}
    </div>
  );
};

export default GlobalSearch;
