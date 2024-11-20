/* This example requires Tailwind CSS v2.0+ */
import { Transition } from '@headlessui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  getWorkGroupsDataRequest,
  setSearchSelectedDataAction,
  setWorkGroupSelected,
} from '@/store/chrome/actions';
import {
  fetchSelectorDatabyID,
  getAllFavoritiesDataSaga,
  getRecnetTabDataSaga,
} from '@/store/chrome/sagas';
import {
  getAllFavortitesDataSelector,
  getselectdWorkGroupsIDsSelector,
} from '@/store/chrome/selectors';
import type {
  AllRecentTabData,
  WorkGroupsSelected,
} from '@/store/chrome/types';
import { fetchGroupDataRequest } from '@/store/shared/actions';
import { getGroupDataSelector } from '@/store/shared/selectors';
import { isOrganizationSelectorDisabled } from '@/utils';
import classNames from '@/utils/classNames';

import InfoToggle from '../UI/InfoToggle';
import All from './All';
import Favorites from './Favorites';
import Recents from './Recents';
import Tabs from './Tabs';

interface TabProps {
  name: string;
  href: string;
  current: boolean;
  count?: number | undefined;
}

const OrganizationSelector2 = () => {
  const dispatch = useDispatch();
  const [searchInput, setSearchInput] = useState('');
  const [confirmIsTrigger, setConfirmIsTrigger] = useState<number | null>(null);
  const favoriteData = useSelector(getAllFavortitesDataSelector);
  const groupsData = useSelector(getGroupDataSelector);
  const selectedWorkedGroup = useSelector(getselectdWorkGroupsIDsSelector);
  const [selectorButtonLabel, setSelectorButtonLabel] = useState<string>();
  const [infoToggleIsOpen, setInfoToggleIsOpen] = useState(false);

  const tabs: TabProps[] = [
    { name: 'All', href: '#', current: false },
    {
      name: 'Favorites',
      href: '#',
      count:
        favoriteData?.groups && favoriteData.groups.length
          ? favoriteData.groups.length
          : 0,
      current: false,
    },
    { name: 'Recents', href: '#', current: false },
  ];

  const [organizationIsNotSelected, setOrganizationIsNotSelected] =
    useState(false);
  const [recentTabData, setRecentTabData] = useState<AllRecentTabData[]>();

  const getRecnetTabData = async () => {
    const res = await getRecnetTabDataSaga();
    if (res) {
      setOrganizationIsNotSelected(!res.length);
      setRecentTabData(res);
    }
  };

  const setSelectorDataFromRecentData = async () => {
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
          setSelectorButtonLabel(groups[0]?.value);
          dispatch(setWorkGroupSelected(workGroupsSelected));
        }
      }
    }
  };

  useEffect(() => {
    // if selected worked group is not selected or work group is selected, then select the data from recent data
    if (!selectedWorkedGroup || !!selectedWorkedGroup.workGroupName) {
      setSelectorDataFromRecentData();
    }
  }, [selectedWorkedGroup, recentTabData?.length]);

  const [currentTab, setCurrentTab] = useState(tabs[0]);
  const [isOpen, setIsOpen] = useState(false);

  const popupPosition = useRef({ top: 0, left: 0 });
  const handlePopupPositions = () => {
    setTimeout(() => {
      const button = document.getElementById('selectorButtonId');
      if (button) {
        const rect = button.getBoundingClientRect();
        const buttonTop = rect.top + rect.height + window.scrollY + 6;
        const buttonLeft = rect.left + window.scrollX;
        popupPosition.current = { top: buttonTop, left: buttonLeft };
      }
    }, 300);
  };

  useEffect(() => {
    setIsOpen(organizationIsNotSelected);
  }, [organizationIsNotSelected]);

  useEffect(() => {
    getAllFavoritiesDataSaga();
  }, [groupsData]);

  useEffect(() => {
    handlePopupPositions();
  }, []);

  useEffect(() => {
    getRecnetTabData();
    dispatch(fetchGroupDataRequest());
    if (isOpen) {
      dispatch(getWorkGroupsDataRequest());
      dispatch(setSearchSelectedDataAction(null));
      setSearchInput('');
      setCurrentTab(tabs[0]);
    }
    if (!isOpen) {
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
            selectedWorkedGroup.providersData
              .map((item) => item.value)
              .toString()
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
    }
  }, [isOpen]);

  const [confirmButtonIsDisabled, setConfirmButtonIsDisabled] = useState(
    !selectedWorkedGroup
  );

  useEffect(() => {
    setConfirmButtonIsDisabled(!selectedWorkedGroup);
  }, [selectedWorkedGroup]);

  useEffect(() => {
    if (currentTab?.name === 'All') {
      dispatch(setSearchSelectedDataAction(null));
    }
    if (currentTab?.name === 'Custom Workgroups') {
      dispatch(setSearchSelectedDataAction(null));
    }
    if (currentTab?.name === 'Recents') {
      getRecnetTabData();
    }
    if (!selectedWorkedGroup) {
      setConfirmButtonIsDisabled(true);
    }
  }, [currentTab]);

  const onConfirm = () => {
    setIsOpen(!isOpen);
    setConfirmIsTrigger(null);
  };

  const renderRurrentTab = () => {
    if (currentTab?.name === 'All') {
      return (
        <All
          searchInput={searchInput}
          confirmIsTrigger={confirmIsTrigger}
          onSelect={() => {
            setConfirmButtonIsDisabled(false);
          }}
          isConfirm={onConfirm}
        />
      );
    }
    if (currentTab?.name === 'Favorites') {
      return (
        <Favorites
          searchInput={searchInput}
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
          searchInput={searchInput}
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

  const renderRurrentTabTitle = () => {
    if (currentTab?.name === 'All') {
      return 'Healthcare Groups';
    }
    if (currentTab?.name === 'Favorites') {
      return 'Favorite';
    }
    if (currentTab?.name === 'Recents') {
      return 'Recents';
    }
    return '';
  };

  const closeOrganizationSelectorPopup = (value: boolean) => {
    if (!organizationIsNotSelected) {
      setIsOpen(value);
    }
  };

  return (
    <>
      <button
        id="selectorButtonId"
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
              className="fixed z-[243] w-screen max-w-xl overflow-hidden rounded-lg shadow-lg"
              style={{
                top: popupPosition.current.top,
                left: popupPosition.current.left,
              }}
            >
              <div className="relative flex flex-col items-start bg-white p-6">
                <span className="text-lg text-gray-900">
                  Organization Selector
                </span>
                <div className="mt-1 inline-flex items-start justify-start space-x-1">
                  <p className="text-sm leading-tight text-gray-500">
                    Please select a healthcare group from the list below
                  </p>
                  <InfoToggle
                    openToggle={organizationIsNotSelected}
                    position="right"
                    text="When you choose a healthcare group, its data will be automatically populated in all areas of the system. You can change your selection at any time by accessing this area."
                  />
                </div>
                <div className="flex w-full flex-initial grid-cols-2 flex-col items-start justify-between gap-4 pb-4 pt-0 sm:flex">
                  {/* Todo: add proper typing */}
                  <div className="col-span-2 w-full">
                    <Tabs
                      tabs={tabs}
                      onChangeTab={(tab: any) => {
                        setCurrentTab(tab);
                        setConfirmIsTrigger(null);
                      }}
                      currentTab={currentTab}
                    />
                  </div>
                  <div className="relative w-full">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <input
                      ref={(input) => {
                        setTimeout(() => {
                          if (input) input.focus();
                        }, 500);
                      }}
                      id="search"
                      name="search"
                      value={searchInput}
                      className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 leading-5 text-gray-500 placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:text-gray-900 focus:outline-none focus:ring-white sm:text-sm"
                      placeholder="Search"
                      autoComplete="off"
                      // type="search"
                      onChange={(e) => {
                        setSearchInput(e.target.value);
                      }}
                    />
                  </div>
                </div>
                <p className="mb-2 text-sm font-bold leading-tight text-gray-500">
                  {renderRurrentTabTitle()}
                </p>
                <div className="inline-flex w-full flex-col items-start justify-start space-y-1 rounded-md border border-gray-300 p-1">
                  {renderRurrentTab()}
                </div>
              </div>
              <div className="flex w-full flex-row-reverse bg-gray-100 px-6 py-4">
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

export default OrganizationSelector2;
