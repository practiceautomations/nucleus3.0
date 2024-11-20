import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Icon from '@/components/Icon';
import {
  getWorkGroupsSelectedDataRequest,
  setWorkGroupSelected,
} from '@/store/chrome/actions';
import {
  addFavoritesItemsSaga,
  addRecentHistoryRequestSaga,
  fetchSelectorDatabyID,
  getRecnetTabDataSaga,
  unFavoritesItemsSaga,
} from '@/store/chrome/sagas';
import {
  getAllRecentTabDataSelector,
  getWorkGroupSelectedDataSelector,
} from '@/store/chrome/selectors';
import type {
  AddRecentsData,
  AllRecentTabData,
  Favorites,
  WorkGroupsResponseData,
  WorkGroupsSelected,
} from '@/store/chrome/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';

import RecentsDetail from '../Component/RecentsDetail';

interface Tprops {
  confirmIsTrigger: number | null;
  isConfirm: () => void;
  onSelect?: () => void;
}
const Recents = ({ confirmIsTrigger, isConfirm, onSelect }: Tprops) => {
  const dispatch = useDispatch();
  const [selectedWorkGroup, setSelectedWorkGroup] =
    useState<AllRecentTabData>();
  const [recentDetailData, setRecentDetailData] = useState<AllRecentTabData>();

  interface SelectionInfoTprops {
    id: number;
    type: string;
  }
  const [selectionInfo, setSelectionInfo] = useState<SelectionInfoTprops>({
    id: 0,
    type: '',
  });

  const [selectorDatabyID, setSelectorDatabyID] =
    useState<WorkGroupsResponseData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (selectionInfo.type) {
        setSelectorDatabyID(null);
        const obj: any = {
          groupID: null,
          practiceID: null,
          facilityID: null,
          providerID: null,
          workGroupID: null,
        };

        if (selectionInfo.type === 'group') {
          obj.groupID = recentDetailData?.id;
        } else if (selectionInfo.type === 'practice') {
          obj.groupID = recentDetailData?.groupID;
          obj.practiceID = recentDetailData?.id;
        } else if (selectionInfo.type === 'facility') {
          obj.groupID = recentDetailData?.groupID;
          obj.practiceID = recentDetailData?.facilityPracticeID;
          obj.facilityID = recentDetailData?.id;
        } else if (selectionInfo.type === 'provider') {
          obj.groupID = recentDetailData?.groupID;
          obj.providerID = recentDetailData?.id;
        } else if (selectionInfo.type === 'work group') {
          obj.workGroupID = recentDetailData?.id;
        }
        const res = await fetchSelectorDatabyID(obj);
        setSelectorDatabyID(res);
      }
    };
    fetchData();
  }, [selectionInfo]);

  const confirmIsTriggerEvent = async () => {
    const workGroupsSelected: WorkGroupsSelected = {
      workGroupId: null,
      workGroupName: null,
      groupsData: [],
      practicesData: [],
      facilitiesData: [],
      providersData: [],
    };
    if (selectorDatabyID) {
      const { groupsData, practicesData, facilitiesData, providersData } =
        selectorDatabyID;
      workGroupsSelected.groupsData = groupsData.filter((m) => m.id);
      workGroupsSelected.practicesData = practicesData.filter((m) => m.id);
      workGroupsSelected.facilitiesData = facilitiesData.filter((m) => m.id);
      workGroupsSelected.providersData = providersData.filter((m) => m.id);
      if (selectedWorkGroup) {
        workGroupsSelected.workGroupId = selectedWorkGroup?.id;
        workGroupsSelected.workGroupName = selectedWorkGroup?.workGroup;
      }
    }

    let obj: AddRecentsData = {
      workGroups: [],
      groups: [],
      providers: [],
      facilities: [],
      practices: [],
    };
    if (
      workGroupsSelected.groupsData.length !== 0 &&
      workGroupsSelected.practicesData.length === 0 &&
      workGroupsSelected.providersData.length === 0 &&
      workGroupsSelected.facilitiesData.length === 0
    ) {
      obj = {
        ...obj,
        groups: workGroupsSelected.groupsData.map((item) => item.id),
      };
    }
    if (
      workGroupsSelected.practicesData.length !== 0 &&
      workGroupsSelected.providersData.length === 0 &&
      workGroupsSelected.facilitiesData.length === 0
    ) {
      obj = {
        ...obj,
        practices: workGroupsSelected.practicesData.map((item) => item.id),
      };
    }
    if (workGroupsSelected.providersData.length !== 0) {
      obj = {
        ...obj,
        providers: workGroupsSelected.providersData.map((item) => item.id),
      };
    }
    if (
      workGroupsSelected.facilitiesData.length !== 0 &&
      workGroupsSelected.providersData.length === 0
    ) {
      obj = {
        ...obj,
        facilities: workGroupsSelected.facilitiesData.map((item) => item.id),
      };
    }

    if (workGroupsSelected?.workGroupId) {
      obj = {
        workGroups: [workGroupsSelected.workGroupId],
        groups: [],
        providers: [],
        facilities: [],
        practices: [],
      };
    }

    await addRecentHistoryRequestSaga(obj);
    isConfirm();
    dispatch(setWorkGroupSelected(workGroupsSelected));
  };

  const dataList = useSelector(getAllRecentTabDataSelector);

  const isSelectedItem = (id: number, type: string) => {
    return selectionInfo.type === type && selectionInfo.id === id;
  };

  const workGroupSelectedData = useSelector(getWorkGroupSelectedDataSelector);

  useEffect(() => {
    if (confirmIsTrigger) {
      confirmIsTriggerEvent();
    }
  }, [confirmIsTrigger]);

  const toggleFavorite = async (d: AllRecentTabData) => {
    const { isFavorite } = d;
    const action = isFavorite ? unFavoritesItemsSaga : addFavoritesItemsSaga;

    const payload: Favorites = {};

    if (d.type === 'group') {
      payload.groups = [d.id];
    } else if (d.type === 'practice') {
      payload.practices = [d.id];
    } else if (d.type === 'facility') {
      payload.facilities = [d.id];
    } else if (d.type === 'provider') {
      payload.providers = [d.id];
    }

    if (Object.keys(payload).length) {
      const res = await action(payload);
      if (res) {
        getRecnetTabDataSaga();
      }
    }
  };

  return (
    <div className="flex flex-row">
      <div className="flex w-60 flex-col items-start">
        <p
          hidden={!dataList}
          className="mb-2 text-sm font-bold leading-tight text-gray-500"
        >
          Recents
        </p>
        <div className="h-40  w-60 overflow-y-auto overflow-x-hidden">
          {dataList &&
            dataList?.map((a) => (
              <div
                onClick={() => {
                  if (a.workGroup) {
                    dispatch(
                      getWorkGroupsSelectedDataRequest({ workGroupId: a.id })
                    );
                  }
                  setRecentDetailData(a);
                  setSelectionInfo({
                    id: a.id,
                    type: a.type,
                  });
                  setSelectedWorkGroup(a.type === 'work group' ? a : undefined);
                  if (onSelect) onSelect();
                }}
                className={
                  isSelectedItem(a.id, a.type)
                    ? 'flex w-56 flex-col rounded-md p-2 cursor-pointer bg-cyan-400'
                    : 'hover:bg-gray-100 flex w-56 flex-col rounded-md p-2 cursor-pointer'
                }
                key={a.id}
              >
                <div className="items-left flex flex-col">
                  <div className="pl-0.25 pr-0.25 inline-flex items-start rounded-md pt-2">
                    <span
                      className={classNames(
                        'mr-1.5 w-5 h-5',
                        a.type === 'work group'
                          ? 'cursor-default opacity-50'
                          : 'cursor-pointer'
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(a);
                      }}
                    >
                      <Icon
                        name={a.isFavorite ? 'addFavorites' : 'starUnfavorite'}
                        size={16}
                        color={
                          isSelectedItem(a.id, a.type)
                            ? IconColors.WHITE_S
                            : IconColors.NONE
                        }
                      />
                    </span>

                    <div className="flex space-x-1 rounded-md">
                      {a.type === 'group' && (
                        <p
                          className={
                            isSelectedItem(a.id, a.type)
                              ? 'text-sm font-medium text-left w-36 truncate leading-tight text-white'
                              : 'text-sm font-medium text-left w-36 truncate leading-tight text-gray-600'
                          }
                        >
                          {' '}
                          {a.group}{' '}
                        </p>
                      )}
                      {a.type === 'practice' && (
                        <p
                          className={
                            isSelectedItem(a.id, a.type)
                              ? 'text-sm font-medium text-left w-36 truncate leading-tight text-white'
                              : 'text-sm font-medium text-left w-36 truncate leading-tight text-gray-600'
                          }
                        >
                          {' '}
                          {a.practice}{' '}
                        </p>
                      )}
                      {a.type === 'work group' && (
                        <p
                          className={
                            isSelectedItem(a.id, a.type)
                              ? 'text-sm font-medium text-left w-36 truncate leading-tight text-white'
                              : 'text-sm font-medium text-left w-36 truncate leading-tight text-gray-600'
                          }
                        >
                          {' '}
                          {a.workGroup}{' '}
                        </p>
                      )}
                      {a.type === 'provider' && (
                        <p
                          className={
                            isSelectedItem(a.id, a.type)
                              ? 'text-sm font-medium text-left w-36 truncate leading-tight text-white'
                              : 'text-sm font-medium text-left w-36 truncate leading-tight text-gray-600'
                          }
                        >
                          {' '}
                          {a.provider}{' '}
                        </p>
                      )}
                      {a.type === 'facility' && (
                        <p
                          className={
                            isSelectedItem(a.id, a.type)
                              ? 'text-sm font-medium text-left w-36 truncate leading-tight text-white'
                              : 'text-sm font-medium text-left w-36 truncate leading-tight text-gray-600'
                          }
                        >
                          {' '}
                          {a.facility}{' '}
                        </p>
                      )}
                    </div>
                    <div className="ml-2 flex items-center justify-end">
                      <Icon
                        name="ellipsisHorizontal"
                        size={16}
                        color={
                          isSelectedItem(a.id, a.type)
                            ? IconColors.WHITE_S
                            : IconColors.NONE
                        }
                      />
                    </div>
                    <Icon
                      name="chevron"
                      size={16}
                      color={
                        isSelectedItem(a.id, a.type)
                          ? IconColors.WHITE
                          : IconColors.GRAY
                      }
                    />
                  </div>
                  {a.providerNPI && (
                    <div className="inline-flex justify-start rounded-md pl-2 pr-1 pb-2 text-left">
                      <div className="rounded-md">
                        <p
                          className={
                            isSelectedItem(a.id, a.type)
                              ? 'flex-1 text-xs leading-none text-white'
                              : 'flex-1 text-xs leading-none text-gray-400'
                          }
                        >
                          NPI: {a.providerNPI}
                        </p>
                      </div>
                    </div>
                  )}
                  {a.practiceAddress && (
                    <div className="inline-flex justify-start rounded-md pl-2 pr-1 pb-2 text-left">
                      <div className="rounded-md">
                        <p
                          className={
                            isSelectedItem(a.id, a.type)
                              ? 'flex-1 text-xs leading-none text-white'
                              : 'flex-1 text-xs leading-none text-gray-400'
                          }
                        >
                          {a.practiceAddress}
                        </p>
                      </div>
                    </div>
                  )}
                  {a.facilityAddress && (
                    <div className="inline-flex justify-start rounded-md pl-2 pr-1 pb-2 text-left">
                      <div className="rounded-md">
                        <p
                          className={
                            isSelectedItem(a.id, a.type)
                              ? 'flex-1 text-xs leading-none text-white'
                              : 'flex-1 text-xs leading-none text-gray-400'
                          }
                        >
                          {a.facilityAddress}
                        </p>
                      </div>
                    </div>
                  )}
                  {a.practiceEINNumber && (
                    <div className="inline-flex items-center justify-start rounded-md pl-2 pr-1 pb-2">
                      <div className="rounded-md">
                        <p
                          className={
                            isSelectedItem(a.id, a.type)
                              ? 'flex-1 text-xs leading-none text-white'
                              : 'flex-1 text-xs leading-none text-gray-400'
                          }
                        >
                          EIN:: {a.practiceEINNumber}
                        </p>
                      </div>
                    </div>
                  )}
                  {a.groupEINNumber && (
                    <div className="inline-flex items-center justify-start rounded-md pl-2 pr-1 pb-2">
                      <div className="rounded-md">
                        <p
                          className={
                            isSelectedItem(a.id, a.type)
                              ? 'flex-1 text-xs leading-none text-white'
                              : 'flex-1 text-xs leading-none text-gray-400'
                          }
                        >
                          EIN:: {a.groupEINNumber}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
      <hr className="h-auto w-[1px] bg-gray-200" />
      {/* Items Detail */}
      <div hidden={!selectionInfo.id}>
        <RecentsDetail
          dataList={recentDetailData}
          selectedWorkGroupData={workGroupSelectedData}
        ></RecentsDetail>
      </div>
    </div>
  );
};

export default Recents;
