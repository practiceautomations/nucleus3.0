import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Icon from '@/components/Icon';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import { setWorkGroupSelected } from '@/store/chrome/actions';
import {
  addRecentHistoryRequestSaga,
  unFavoritesItemsSaga,
} from '@/store/chrome/sagas';
import {
  getAllFavortitesDataSelector,
  getselectdWorkGroupsIDsSelector,
} from '@/store/chrome/selectors';
import type { AddRecentsData, WorkGroupsSelected } from '@/store/chrome/types';
import { getGroupDataSelector } from '@/store/shared/selectors';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';

interface Tprops {
  isConfirm: () => void;
  searchInput: string;
  confirmIsTrigger: number | null;
  onSelect?: (isSelected: boolean) => void;
}
const Favorites = ({
  confirmIsTrigger,
  searchInput,
  isConfirm,
  onSelect,
}: Tprops) => {
  const dispatch = useDispatch();
  const groupsData = useSelector(getGroupDataSelector);
  const selectedWorkedGroup = useSelector(getselectdWorkGroupsIDsSelector);
  const dataList = useSelector(getAllFavortitesDataSelector);
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

  const [unFavoritesConfirmationInfo, setUnFavoritesConfirmationInfo] =
    useState({
      show: false,
      text: '',
      id: 0,
      type: '',
    });

  const toggleFavorite = async (id: number, type: string) => {
    interface FavoritesType {
      groups?: number[];
      practices?: number[];
      facilities?: number[];
      providers?: number[];
    }

    const payload: FavoritesType = {};
    if (type === 'group') {
      payload.groups = [id];
    } else if (type === 'practice') {
      payload.practices = [id];
    } else if (type === 'facility') {
      payload.facilities = [id];
    } else if (type === 'provider') {
      payload.providers = [id];
    }

    if (Object.keys(payload).length) {
      const res = await unFavoritesItemsSaga(payload);
      if (res) {
        setSelectedGroupId(0);
        setUnFavoritesConfirmationInfo({
          show: false,
          text: '',
          id: 0,
          type: '',
        });
      }
    }
  };

  useEffect(() => {
    if (selectedGroupId) {
      if (onSelect) onSelect(true);
    } else if (!selectedWorkedGroup && onSelect) {
      onSelect(false);
    }
  }, [selectedGroupId]);

  return (
    <div className="flex w-full flex-row">
      <StatusModal
        open={unFavoritesConfirmationInfo.show}
        heading={'Unfavorite?'}
        description={unFavoritesConfirmationInfo.text}
        okButtonText={'Confirm'}
        closeButtonText={'Cancel'}
        statusModalType={StatusModalType.WARNING}
        showCloseButton={true}
        closeOnClickOutside={true}
        onClose={() => {
          setUnFavoritesConfirmationInfo({
            show: false,
            text: '',
            id: 0,
            type: '',
          });
        }}
        onChange={async () => {
          toggleFavorite(
            unFavoritesConfirmationInfo.id,
            unFavoritesConfirmationInfo.type
          );
        }}
      />
      <div className="flex w-full flex-col items-start">
        <div className="h-40 w-full overflow-y-auto overflow-x-hidden">
          {dataList?.groups &&
            dataList?.groups
              ?.filter(function (f) {
                if (searchInput) {
                  const einNumber = f.einNumber
                    ? f.einNumber.toString().toLowerCase()
                    : '';
                  return (
                    f.value.toLowerCase().includes(searchInput.toLowerCase()) ||
                    einNumber.includes(searchInput.toLowerCase())
                  );
                }
                return true; // No searchInput, return all items
              })
              .map((a) => (
                <div
                  onClick={() => {
                    setSelectedGroupId(a.id);
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
                      <div
                        className="mr-1.5 h-5 w-5 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUnFavoritesConfirmationInfo({
                            show: true,
                            text: `Are you sure you want to unfavorite "${a.value}"?`,
                            id: a.id,
                            type: 'group',
                          });
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
                      </div>
                      <div className="flex flex-col">
                        <span
                          className={classNames(
                            'mx-2 flex-1 text-left text-sm leading-5 cursor-pointer',
                            selectedGroupId === a.id
                              ? 'text-white'
                              : 'text-gray-600'
                          )}
                        >
                          {a.value}
                        </span>
                        {a.einNumber && (
                          <div className="mx-2 inline-flex items-center justify-start rounded-md pt-2">
                            <div className="rounded-md">
                              <p
                                className={
                                  selectedGroupId === a.id
                                    ? 'flex-1 text-xs leading-none text-white'
                                    : 'flex-1 text-xs leading-none text-gray-400'
                                }
                              >
                                EIN:: {a.einNumber}
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

export default Favorites;
