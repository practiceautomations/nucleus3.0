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
  getRecnetTabDataSaga,
  unFavoritesItemsSaga,
} from '@/store/chrome/sagas';
import {
  getAllRecentTabDataSelector,
  getselectdWorkGroupsIDsSelector,
} from '@/store/chrome/selectors';
import type {
  AddRecentsData,
  AllRecentTabData,
  Favorites,
  WorkGroupsSelected,
} from '@/store/chrome/types';
import { getGroupDataSelector } from '@/store/shared/selectors';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';

interface Tprops {
  isConfirm: () => void;
  searchInput: string;
  confirmIsTrigger: number | null;
  onSelect?: () => void;
}
const Recents = ({
  confirmIsTrigger,
  searchInput,
  isConfirm,
  onSelect,
}: Tprops) => {
  const dispatch = useDispatch();
  const groupsData = useSelector(getGroupDataSelector);
  const selectedWorkedGroup = useSelector(getselectdWorkGroupsIDsSelector);
  const dataList = useSelector(getAllRecentTabDataSelector);
  const [selectedGroupId, setSelectedGroupId] = useState<number>(0);

  const confirmIsTriggerEvent = async () => {
    const group = groupsData?.filter((m) => m.id === selectedGroupId) || [];
    const workGroupsSelected: WorkGroupsSelected = {
      workGroupId: null,
      workGroupName: null,
      groupsData: group,
      practicesData: [],
      facilitiesData: [],
      providersData: [],
    };

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
    await addRecentHistoryRequestSaga(obj);
    isConfirm();
    dispatch(setWorkGroupSelected(workGroupsSelected));
  };

  useEffect(() => {
    if (!selectedWorkedGroup?.workGroupId && selectedWorkedGroup) {
      if (selectedWorkedGroup.groupsData && selectedWorkedGroup.groupsData[0]) {
        setSelectedGroupId(selectedWorkedGroup.groupsData[0].id);
      }
    }
  }, [selectedWorkedGroup]);

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
    <div className="flex w-full flex-row">
      <div className="flex w-full flex-col items-start">
        <div className="h-40 w-full overflow-y-auto overflow-x-hidden">
          {dataList &&
            dataList
              .filter(function (f) {
                if (f.type === 'group') {
                  if (searchInput) {
                    const einNumber = f.groupEINNumber
                      ? f.groupEINNumber.toString().toLowerCase()
                      : '';
                    return (
                      f.group
                        .toLowerCase()
                        .includes(searchInput.toLowerCase()) ||
                      einNumber.includes(searchInput.toLowerCase())
                    );
                  }
                  return true; // No searchInput, return all items
                }
                return false;
              })
              .map((a) => (
                <div
                  onClick={() => {
                    if (a.workGroup) {
                      dispatch(
                        getWorkGroupsSelectedDataRequest({ workGroupId: a.id })
                      );
                    }
                    setSelectedGroupId(a.id);
                    if (onSelect) onSelect();
                  }}
                  className={
                    selectedGroupId === a.id
                      ? 'flex w-full flex-col rounded-md p-2 cursor-pointer bg-cyan-400'
                      : 'hover:bg-gray-100 flex w-full flex-col rounded-md p-2 cursor-pointer'
                  }
                  key={a.id}
                >
                  <div className="items-left flex flex-col">
                    <div className="inline-flex items-start rounded-md">
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
                          name={
                            a.isFavorite ? 'addFavorites' : 'starUnfavorite'
                          }
                          size={16}
                          color={
                            selectedGroupId === a.id
                              ? IconColors.WHITE_S
                              : IconColors.NONE
                          }
                        />
                      </span>

                      <div className="flex flex-col">
                        <span
                          className={classNames(
                            'mx-2 flex-1 text-left text-sm leading-5 cursor-pointer',
                            selectedGroupId === a.id
                              ? 'text-white'
                              : 'text-gray-600'
                          )}
                        >
                          {a.group}
                        </span>
                        {a.groupEINNumber && (
                          <div className="mx-2 inline-flex items-center justify-start rounded-md pt-2">
                            <div className="rounded-md">
                              <p
                                className={
                                  selectedGroupId === a.id
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
                  </div>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
};

export default Recents;
