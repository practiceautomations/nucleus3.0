/* This example requires Tailwind CSS v2.0+ */
import { Transition } from '@headlessui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';
import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  getWorkGroupsDataRequest,
  setSearchSelectedDataAction,
  setWorkGroupSelected,
  setWorkgroupSelectResponceData,
} from '@/store/chrome/actions';
import {
  fetchSelectorDatabyID,
  getAllFavoritiesDataSaga,
  getRecnetTabDataSaga,
  searchOrganizationSelectorSaga,
} from '@/store/chrome/sagas';
import {
  getAllFavortitesDataSelector,
  getAllTabSaerchDataSelector,
  getSearchSelectedItemSelector,
  getselectdWorkGroupsIDsSelector,
  getWorkGroupDataSelector,
} from '@/store/chrome/selectors';
import type {
  SearchSelectedItemType,
  WorkGroupsSelected,
} from '@/store/chrome/types';
import {
  fetchGroupDataRequest,
  fetchPracticeDataRequest,
} from '@/store/shared/actions';
import {
  getFacilityDataSelector,
  getGroupDataSelector,
  getPracticeDataSelector,
  getProviderDataSelector,
} from '@/store/shared/selectors';
import { isOrganizationSelectorDisabled } from '@/utils';
import classNames from '@/utils/classNames';

import InfoToggle from '../UI/InfoToggle';
import All from './All';
import SearchOrganizationSelectorDropdown from './Component/SearchDropdownOrganizationSelector';
import Favorites from './Favorites';
import Recents from './Recents';
import Tabs from './Tabs';
import WorkGroups from './WorkGroups';

interface TabProps {
  name: string;
  href: string;
  current: boolean;
  count?: number | undefined;
}

const OrganizationSelector = () => {
  const dispatch = useDispatch();
  const [searchInput, setSearchInput] = useState('');
  const [confirmIsTrigger, setConfirmIsTrigger] = useState<number | null>(null);
  const workGroupData = useSelector(getWorkGroupDataSelector);
  const favoriteData = useSelector(getAllFavortitesDataSelector);
  const groupsData = useSelector(getGroupDataSelector);
  const practicesDataSelector = useSelector(getPracticeDataSelector);
  const facilitiesData = useSelector(getFacilityDataSelector);
  const providersDataSelector = useSelector(getProviderDataSelector);
  const selectedWorkedGroup = useSelector(getselectdWorkGroupsIDsSelector);
  const searchItems = useSelector(getSearchSelectedItemSelector);
  const searchDropdownData = useSelector(getAllTabSaerchDataSelector);
  const [selectorButtonLabel, setSelectorButtonLabel] = useState<string>();
  const [infoToggleIsOpen, setInfoToggleIsOpen] = useState(false);

  const tabs: TabProps[] = [
    { name: 'All', href: '#', current: false },
    {
      name: 'Custom Workgroups',
      href: '#',
      count: workGroupData?.length,
      current: true,
    },
    {
      name: 'Favorites',
      href: '#',
      count:
        (favoriteData?.groups && favoriteData.groups.length
          ? favoriteData.groups.length
          : 0) +
        (favoriteData?.facilities && favoriteData.facilities?.length
          ? favoriteData.facilities.length
          : 0) +
        (favoriteData?.practices && favoriteData.practices?.length
          ? favoriteData.practices.length
          : 0) +
        (favoriteData?.providers && favoriteData.providers?.length
          ? favoriteData.providers.length
          : 0),
      current: false,
    },
    { name: 'Recents', href: '#', current: false },
  ];

  const [currentTab, setCurrentTab] = useState(tabs[0]);
  const [isOpen, setIsOpen] = useState(false);
  const [organizationIsNotSelected, setOrganizationIsNotSelected] =
    useState(false);

  const [confirmButtonIsDisabled, setConfirmButtonIsDisabled] = useState(
    !selectedWorkedGroup
  );

  const getRecnetTabData = async () => {
    const res = await getRecnetTabDataSaga();
    if (res) {
      setOrganizationIsNotSelected(
        !res.filter((f) => f.type === 'group').length
      );
    }
  };

  const setSelectorDataFromRecentData = async () => {
    const recentTabData = await getRecnetTabDataSaga();
    if (recentTabData && recentTabData[0]) {
      const recentDetailData = recentTabData[0];
      if (recentDetailData.type) {
        const obj: any = {
          groupID: null,
          practiceID: null,
          facilityID: null,
          providerID: null,
          workGroupID: null,
        };

        if (recentDetailData.type === 'group') {
          obj.groupID = recentDetailData?.id;
        } else if (recentDetailData.type === 'practice') {
          obj.groupID = recentDetailData?.groupID;
          obj.practiceID = recentDetailData?.id;
        } else if (recentDetailData.type === 'facility') {
          obj.groupID = recentDetailData?.groupID;
          obj.practiceID = recentDetailData?.facilityPracticeID;
          obj.facilityID = recentDetailData?.id;
        } else if (recentDetailData.type === 'provider') {
          obj.groupID = recentDetailData?.groupID;
          obj.providerID = recentDetailData?.id;
        } else if (recentDetailData.type === 'work group') {
          obj.workGroupID = recentDetailData?.id;
        }
        const selectorDatabyID = await fetchSelectorDatabyID(obj);

        const workGroupsSelected: WorkGroupsSelected = {
          workGroupId: null,
          workGroupName: null,
          groupsData: [],
          practicesData: [],
          facilitiesData: [],
          providersData: [],
        };
        if (selectorDatabyID) {
          const {
            groupsData: groups,
            practicesData,
            facilitiesData: facilities,
            providersData,
          } = selectorDatabyID;
          workGroupsSelected.groupsData = groups.filter((m) => m.id);
          workGroupsSelected.practicesData = practicesData.filter((m) => m.id);
          workGroupsSelected.facilitiesData = facilities.filter((m) => m.id);
          workGroupsSelected.providersData = providersData.filter((m) => m.id);
          if (recentDetailData.type === 'work group') {
            workGroupsSelected.workGroupId = recentDetailData.id;
            workGroupsSelected.workGroupName = recentDetailData.workGroup;
          }
          dispatch(setWorkGroupSelected(workGroupsSelected));
        }
      }
    }
  };

  useEffect(() => {
    // if selected worked group is not selected or work group is selected, then select the data from recent data
    if (!selectedWorkedGroup) {
      setSelectorDataFromRecentData();
    }
  }, [selectedWorkedGroup]);

  useEffect(() => {
    getAllFavoritiesDataSaga();
  }, [
    groupsData,
    practicesDataSelector,
    facilitiesData,
    providersDataSelector,
  ]);

  const handleSelectorButtonLabel = () => {
    if (selectedWorkedGroup?.workGroupName) {
      setSelectorButtonLabel(selectedWorkedGroup.workGroupName);
    } else {
      if (
        selectedWorkedGroup?.groupsData.length !== 0 &&
        selectedWorkedGroup?.practicesData.length === 0 &&
        selectedWorkedGroup?.providersData.length === 0 &&
        selectedWorkedGroup?.facilitiesData.length === 0
      ) {
        setSelectorButtonLabel(
          selectedWorkedGroup?.groupsData.map((item) => item.value).toString()
        );
      }
      if (
        selectedWorkedGroup?.practicesData.length !== 0 &&
        selectedWorkedGroup?.providersData.length === 0 &&
        selectedWorkedGroup?.facilitiesData.length === 0
      ) {
        setSelectorButtonLabel(
          selectedWorkedGroup?.practicesData
            .map((item) => item.value)
            .toString()
        );
      }
      if (
        selectedWorkedGroup &&
        selectedWorkedGroup?.providersData.length !== 0
      ) {
        setSelectorButtonLabel(
          selectedWorkedGroup.providersData.map((item) => item.value).toString()
        );
      }
      if (
        selectedWorkedGroup?.facilitiesData.length !== 0 &&
        selectedWorkedGroup?.providersData.length === 0
      ) {
        setSelectorButtonLabel(
          selectedWorkedGroup.facilitiesData
            .map((item) => item.value)
            .toString()
        );
      }
      if (!selectedWorkedGroup) {
        setSelectorButtonLabel('Organization Selector');
      }
    }
  };

  useEffect(() => {
    getRecnetTabData();
    if (isOpen) {
      dispatch(fetchGroupDataRequest());
      dispatch(getWorkGroupsDataRequest());
      dispatch(setSearchSelectedDataAction(null));
      if (selectedWorkedGroup?.workGroupId) {
        setCurrentTab(tabs[1]);
      } else {
        setCurrentTab(tabs[0]);
      }
    }
    if (!isOpen) {
      handleSelectorButtonLabel();
    }
  }, [isOpen]);

  useEffect(() => {
    handleSelectorButtonLabel();
  }, [selectedWorkedGroup]);

  useEffect(() => {
    if (currentTab?.name === 'All' && !searchItems?.groupId) {
      dispatch(setSearchSelectedDataAction(null));
    }
    if (currentTab?.name === 'Custom Workgroups' && !searchItems?.workgroupId) {
      dispatch(setSearchSelectedDataAction(null));
      dispatch(setWorkgroupSelectResponceData(null));
    }
    if (currentTab?.name === 'Recents') {
      getRecnetTabData();
    }
    if (!selectedWorkedGroup) {
      setConfirmButtonIsDisabled(true);
    }
  }, [currentTab]);

  useEffect(() => {
    if (searchInput.length > 2) {
      searchOrganizationSelectorSaga(searchInput);
    }
  }, [searchInput]);

  useEffect(() => {
    if (searchItems) {
      setTimeout(() => {
        setConfirmButtonIsDisabled(false);
      }, 500);
    }
  }, [searchItems]);

  const onConfirm = () => {
    setIsOpen(!isOpen);
    setConfirmIsTrigger(null);
  };

  const renderRurrentTab = () => {
    if (currentTab?.name === 'All') {
      return (
        <All
          confirmIsTrigger={confirmIsTrigger}
          onSelect={() => {
            setConfirmButtonIsDisabled(false);
          }}
          isConfirm={onConfirm}
        />
      );
    }
    if (currentTab?.name === 'Custom Workgroups') {
      return (
        <WorkGroups
          workGroupData={workGroupData}
          confirmIsTrigger={confirmIsTrigger}
          onSelect={(isSelected) => {
            setConfirmButtonIsDisabled(!isSelected);
          }}
          isConfirm={onConfirm}
        />
      );
    }
    if (currentTab?.name === 'Favorites') {
      return (
        <Favorites
          confirmIsTrigger={confirmIsTrigger}
          onSelect={(isSelected) => {
            setConfirmButtonIsDisabled(!isSelected);
          }}
          isConfirm={onConfirm}
        />
      );
    }
    if (currentTab?.name === 'Recents') {
      return (
        <Recents
          confirmIsTrigger={confirmIsTrigger}
          onSelect={() => {
            setConfirmButtonIsDisabled(false);
          }}
          isConfirm={onConfirm}
        />
      );
    }
    return <></>;
  };

  useEffect(() => {
    setIsOpen(organizationIsNotSelected);
  }, [organizationIsNotSelected]);

  useEffect(() => {
    setConfirmButtonIsDisabled(!selectedWorkedGroup);
  }, [selectedWorkedGroup]);

  const closeOrganizationSelectorPopup = (value: boolean) => {
    if (!organizationIsNotSelected) {
      setIsOpen(value);
    }
  };

  return (
    <>
      <button
        className={classNames(
          isOpen ? 'text-gray-500' : 'text-gray-400',
          organizationIsNotSelected ? 'cursor-default' : 'cursor-pointer',
          isOrganizationSelectorDisabled()
            ? 'cursor-default bg-gray-100 !text-gray-500'
            : 'cursor-pointer bg-white',
          'w-[237px]  group inline-flex items-center rounded-md sm:text-sm font-medium hover:text-gray-500 focus:outline-cyan-500 rounded-md border border-gray-300 py-2 px-4 leading-5'
        )}
        onClick={() => closeOrganizationSelectorPopup(!isOpen)}
        style={{ zIndex: isOpen ? 15 : 0 }}
        title={infoToggleIsOpen ? undefined : selectorButtonLabel}
        disabled={isOrganizationSelectorDisabled()}
      >
        <p data-testid="Org" className="block w-[220px] truncate text-left">
          {selectorButtonLabel}
        </p>
        {isOrganizationSelectorDisabled() ? (
          <InfoToggle
            openToggle={organizationIsNotSelected}
            position="right"
            showOnHover
            text={
              'The Organization Selector only changes on the listing screen.'
            }
            onToggle={(isOpend: boolean) => {
              setInfoToggleIsOpen(isOpend);
            }}
          />
        ) : (
          <>
            {isOpen ? (
              <ChevronUpIcon
                className="-mr-1 ml-4 h-5 w-5"
                aria-hidden="true"
              />
            ) : (
              <ChevronDownIcon
                className="-mr-1 ml-4 h-5 w-5"
                aria-hidden="true"
              />
            )}
          </>
        )}
      </button>
      <div className="z-[14]">
        <Transition
          show={isOpen}
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <div
            onClick={() => {
              closeOrganizationSelectorPopup(false);
            }}
            className="fixed top-0 left-0 z-[14] h-full w-full select-none bg-black/[.5]"
          >
            <div
              onClick={(e) => {
                e.preventDefault();
              }}
              className="fixed top-[55px] left-1/2 z-[243] w-screen max-w-7xl -translate-x-1/2 overflow-hidden rounded-lg shadow-lg"
            >
              <div className="relative flex flex-col items-start bg-white p-6">
                <span className="text-lg text-gray-900">
                  Organization Selector
                </span>
                <div className="grid w-full flex-initial grid-cols-2 items-end justify-between gap-4 pb-6 pt-2 sm:flex">
                  {/* Todo: add proper typing */}
                  <div className="col-span-2 w-2/3 ">
                    <Tabs
                      tabs={tabs}
                      onChangeTab={(tab: any) => {
                        setCurrentTab(tab);
                        setConfirmIsTrigger(null);
                      }}
                      currentTab={currentTab}
                    />
                  </div>
                  <SearchOrganizationSelectorDropdown
                    data={searchDropdownData}
                    onChange={(e: string) => {
                      if (e.length > 2) {
                        setSearchInput(e);
                      }
                    }}
                    onSelect={async (event) => {
                      if (event?.type === 'work group') {
                        const obj: SearchSelectedItemType = {
                          value: event?.value,
                          workgroupId: event?.id,
                          groupId: null,
                          facilityId: null,
                          providerId: null,
                          practiceId: null,
                          type: 'work group',
                        };
                        await dispatch(setSearchSelectedDataAction(obj));
                        setCurrentTab(tabs[1]);
                      } else {
                        if (event?.type === 'group') {
                          const obj: SearchSelectedItemType = {
                            value: event?.value,
                            workgroupId: null,
                            groupId: event?.id,
                            facilityId: null,
                            providerId: null,
                            practiceId: null,
                            type: 'group',
                          };
                          await dispatch(setSearchSelectedDataAction(obj));
                        }
                        if (event?.type === 'practice') {
                          const obj: SearchSelectedItemType = {
                            value: event?.value,
                            workgroupId: null,
                            groupId: event?.groupID,
                            facilityId: null,
                            providerId: null,
                            practiceId: event?.id,
                            type: 'practice',
                          };
                          await dispatch(setSearchSelectedDataAction(obj));
                        }
                        if (event?.type === 'provider') {
                          const obj: SearchSelectedItemType = {
                            value: event?.value,
                            workgroupId: null,
                            groupId: event?.groupID,
                            facilityId: null,
                            providerId: event?.id,
                            practiceId: null,
                            type: 'provider',
                          };
                          await dispatch(setSearchSelectedDataAction(obj));
                        }
                        if (event?.type === 'facility') {
                          const obj: SearchSelectedItemType = {
                            value: event?.value,
                            workgroupId: null,
                            groupId: event.groupID,
                            facilityId: event.id,
                            providerId: null,
                            practiceId: event.practiceID,
                            type: 'facility',
                          };
                          dispatch(
                            fetchPracticeDataRequest({ groupID: event.groupID })
                          );
                          await dispatch(setSearchSelectedDataAction(obj));
                        }
                        setCurrentTab(tabs[0]);
                      }
                    }}
                  />
                </div>
                <div>{renderRurrentTab()}</div>
              </div>
              <div
                data-testid="org_confirm"
                className="flex w-full flex-row-reverse bg-gray-100 px-6 py-4"
              >
                <button
                  className={classNames(
                    'rounded-md px-5 py-3 text-sm font-normal text-white',
                    confirmButtonIsDisabled ? 'bg-gray-300' : 'bg-cyan-500'
                  )}
                  onClick={() => {
                    const confirmIsTriggerLog = confirmIsTrigger
                      ? confirmIsTrigger + 1
                      : 1;
                    setConfirmIsTrigger(confirmIsTriggerLog);
                  }}
                  disabled={confirmButtonIsDisabled}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </>
  );
};

export default OrganizationSelector;
