import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Icon from '@/components/Icon';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import { setWorkGroupSelected } from '@/store/chrome/actions';
import {
  addRecentHistoryRequestSaga,
  fetchSelectorDatabyID,
  unFavoritesItemsSaga,
} from '@/store/chrome/sagas';
import {
  getAllFavortitesDataSelector,
  getselectdWorkGroupsIDsSelector,
} from '@/store/chrome/selectors';
import type {
  AddRecentsData,
  FavoritesFacilities,
  FavoritesPractices,
  FavoritesProviders,
  WorkGroupsResponseData,
  WorkGroupsSelected,
} from '@/store/chrome/types';
import type { GroupData } from '@/store/shared/types';
import { IconColors } from '@/utils/ColorFilters';

import FavoritiesDetail from '../Component/FavoritiesDetail';

interface Tprops {
  confirmIsTrigger: number | null;
  isConfirm: () => void;
  onSelect?: (isSelected: boolean) => void;
}
const Favorites = ({ confirmIsTrigger, isConfirm, onSelect }: Tprops) => {
  const dispatch = useDispatch();
  const dataList = useSelector(getAllFavortitesDataSelector);
  const selectedWorkedGroup = useSelector(getselectdWorkGroupsIDsSelector);

  interface SelectionInfoTprops {
    id: number;
    type: string;
    selectedData:
      | GroupData
      | FavoritesPractices
      | FavoritesFacilities
      | FavoritesProviders
      | undefined;
  }

  const [selectionInfo, setSelectionInfo] = useState<SelectionInfoTprops>({
    id: 0,
    type: '',
    selectedData: undefined,
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

        let data:
          | GroupData
          | FavoritesPractices
          | FavoritesFacilities
          | FavoritesProviders
          | undefined;

        if (selectionInfo.type === 'group') {
          data = selectionInfo.selectedData as GroupData;
          obj.groupID = data.id;
        } else if (selectionInfo.type === 'practice') {
          data = selectionInfo.selectedData as FavoritesPractices;
          obj.groupID = data.groupID;
          obj.practiceID = data.id;
        } else if (selectionInfo.type === 'facility') {
          data = selectionInfo.selectedData as FavoritesFacilities;
          obj.groupID = data?.groupID;
          obj.practiceID = data?.practiceID;
          obj.facilityID = data?.id;
        } else if (selectionInfo.type === 'provider') {
          data = selectionInfo.selectedData as FavoritesProviders;
          obj.groupID = data?.groupID;
          obj.providerID = data?.id;
        }
        const res = await fetchSelectorDatabyID(obj);
        setSelectorDatabyID(res);
        if (onSelect) onSelect(true);
      } else if (!selectedWorkedGroup && onSelect) {
        onSelect(false);
      }
    };
    fetchData();
  }, [selectionInfo.type]);

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

  const isSelectedItem = (id: number, type: string) => {
    return selectionInfo.type === type && selectionInfo.id === id;
  };

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
        setSelectionInfo({
          id: 0,
          type: '',
          selectedData: undefined,
        });
        setUnFavoritesConfirmationInfo({
          show: false,
          text: '',
          id: 0,
          type: '',
        });
      }
    }
  };

  return (
    <div className="flex flex-row">
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
      <div className="flex w-60 flex-col items-start">
        <p
          hidden={!dataList}
          className="mb-2 text-sm font-bold leading-tight text-gray-500"
        >
          Favorite
        </p>
        <div className="h-40  w-60 overflow-y-auto overflow-x-hidden">
          {dataList?.groups &&
            dataList?.groups?.map((a) => (
              <div
                onClick={() => {
                  setSelectionInfo({
                    id: a.id,
                    type: 'group',
                    selectedData: a,
                  });
                }}
                className={
                  isSelectedItem(a.id, 'group')
                    ? 'flex w-56 flex-col rounded-md p-2 cursor-pointer bg-cyan-400'
                    : 'hover:bg-gray-100 flex w-56 flex-col rounded-md p-2 cursor-pointer'
                }
                key={a.id}
              >
                <div className="items-left flex flex-col">
                  <div className="pl-0.25 pr-0.25 inline-flex items-start rounded-md pt-2">
                    <span
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
                        name={a.isFavorite ? 'addFavorites' : 'starUnfavorite'}
                        size={16}
                        color={
                          isSelectedItem(a.id, 'group')
                            ? IconColors.WHITE_S
                            : IconColors.NONE
                        }
                      />
                    </span>
                    <div className="flex space-x-1 rounded-md">
                      <p
                        className={
                          isSelectedItem(a.id, 'group')
                            ? 'text-sm font-medium text-left w-36 truncate leading-tight text-white'
                            : 'text-sm font-medium text-left w-36 truncate leading-tight text-gray-600'
                        }
                      >
                        {a.value}
                      </p>
                    </div>
                    <div className="ml-2 flex items-center justify-end">
                      <Icon
                        name="ellipsisHorizontal"
                        size={12}
                        color={
                          isSelectedItem(a.id, 'group')
                            ? IconColors.WHITE_S
                            : IconColors.NONE
                        }
                      />
                    </div>
                    <Icon
                      name="chevron"
                      size={12}
                      color={
                        isSelectedItem(a.id, 'group')
                          ? IconColors.WHITE
                          : IconColors.GRAY
                      }
                    />
                  </div>
                  {a.einNumber && (
                    <div className="inline-flex items-center justify-start rounded-md pl-2 pr-1 pb-2">
                      <div className="rounded-md">
                        <p
                          className={
                            isSelectedItem(a.id, 'group')
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
            ))}
          {dataList?.practices &&
            dataList?.practices?.map((a) => (
              <div
                onClick={() => {
                  setSelectionInfo({
                    id: a.id,
                    type: 'practice',
                    selectedData: a,
                  });
                }}
                className={
                  isSelectedItem(a.id, 'practice')
                    ? 'flex w-56 flex-col rounded-md p-2 cursor-pointer bg-cyan-400'
                    : 'hover:bg-gray-100 flex w-56 flex-col rounded-md p-2 cursor-pointer'
                }
                key={a.id}
              >
                <div className="items-left flex flex-col">
                  <div className="pl-0.25 pr-0.25 inline-flex items-start rounded-md pt-2">
                    <span
                      className="mr-1.5 h-5 w-5 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUnFavoritesConfirmationInfo({
                          show: true,
                          text: `Are you sure you want to unfavorite "${a.value}"?`,
                          id: a.id,
                          type: 'practice',
                        });
                      }}
                    >
                      <Icon
                        name={a.isFavorite ? 'addFavorites' : 'starUnfavorite'}
                        size={16}
                        color={
                          isSelectedItem(a.id, 'practice')
                            ? IconColors.WHITE_S
                            : IconColors.NONE
                        }
                      />
                    </span>
                    <div className="flex space-x-1 rounded-md">
                      <p
                        className={
                          isSelectedItem(a.id, 'practice')
                            ? 'text-sm font-medium text-left w-36 truncate leading-tight text-white'
                            : 'text-sm font-medium text-left w-36 truncate leading-tight text-gray-600'
                        }
                      >
                        {a.value}
                      </p>
                    </div>
                    <div className="ml-2 flex items-center justify-end">
                      <Icon
                        name="ellipsisHorizontal"
                        size={12}
                        color={
                          isSelectedItem(a.id, 'practice')
                            ? IconColors.WHITE_S
                            : IconColors.NONE
                        }
                      />
                    </div>
                    <Icon
                      name="chevron"
                      size={12}
                      color={
                        isSelectedItem(a.id, 'practice')
                          ? IconColors.WHITE
                          : IconColors.GRAY
                      }
                    />
                  </div>
                  {a.address && (
                    <div className="inline-flex justify-start rounded-md pl-2 pr-1 pb-2 text-left">
                      <div className="rounded-md">
                        <p
                          className={
                            isSelectedItem(a.id, 'practice')
                              ? 'flex-1 text-xs leading-none text-white'
                              : 'flex-1 text-xs leading-none text-gray-400'
                          }
                        >
                          {a.address}
                        </p>
                      </div>
                    </div>
                  )}
                  {a.einNumber && (
                    <div className="inline-flex items-center justify-start rounded-md pl-2 pr-1 pb-2">
                      <div className="rounded-md">
                        <p
                          className={
                            isSelectedItem(a.id, 'practice')
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
            ))}
          {dataList?.facilities &&
            dataList?.facilities?.map((a) => (
              <div
                onClick={() => {
                  setSelectionInfo({
                    id: a.id,
                    type: 'facility',
                    selectedData: a,
                  });
                }}
                className={
                  isSelectedItem(a.id, 'facility')
                    ? 'flex w-56 flex-col rounded-md p-2 cursor-pointer bg-cyan-400'
                    : 'hover:bg-gray-100 flex w-56 flex-col rounded-md p-2 cursor-pointer'
                }
                key={a.id}
              >
                <div className="items-left flex flex-col">
                  <div className="pl-0.25 pr-0.25 inline-flex items-start rounded-md pt-2">
                    <span
                      className="mr-1.5 h-5 w-5 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUnFavoritesConfirmationInfo({
                          show: true,
                          text: `Are you sure you want to unfavorite "${a.value}"?`,
                          id: a.id,
                          type: 'facility',
                        });
                      }}
                    >
                      <Icon
                        name={a.isFavorite ? 'addFavorites' : 'starUnfavorite'}
                        size={16}
                        color={
                          isSelectedItem(a.id, 'facility')
                            ? IconColors.WHITE_S
                            : IconColors.NONE
                        }
                      />
                    </span>
                    <div className="flex space-x-1 rounded-md">
                      <p
                        className={
                          isSelectedItem(a.id, 'facility')
                            ? 'text-sm font-medium text-left w-36 truncate leading-tight text-white'
                            : 'text-sm font-medium text-left w-36 truncate leading-tight text-gray-600'
                        }
                      >
                        {a.value}
                      </p>
                    </div>
                    <div className="ml-2 flex items-center justify-end">
                      <Icon
                        name="ellipsisHorizontal"
                        size={12}
                        color={
                          isSelectedItem(a.id, 'facility')
                            ? IconColors.WHITE_S
                            : IconColors.NONE
                        }
                      />
                    </div>
                    <Icon
                      name="chevron"
                      size={12}
                      color={
                        isSelectedItem(a.id, 'facility')
                          ? IconColors.WHITE
                          : IconColors.GRAY
                      }
                    />
                  </div>
                  {a.address && (
                    <div className="inline-flex justify-start rounded-md pl-2 pr-1 pb-2 text-left">
                      <div className="rounded-md">
                        <p
                          className={
                            isSelectedItem(a.id, 'facility')
                              ? 'flex-1 text-xs leading-none text-white'
                              : 'flex-1 text-xs leading-none text-gray-400'
                          }
                        >
                          {a.address}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          {dataList?.providers &&
            dataList?.providers?.map((a) => (
              <div
                onClick={() => {
                  setSelectionInfo({
                    id: a.id,
                    type: 'provider',
                    selectedData: a,
                  });
                }}
                className={
                  isSelectedItem(a.id, 'provider')
                    ? 'flex w-56 flex-col rounded-md p-2 cursor-pointer bg-cyan-400'
                    : 'hover:bg-gray-100 flex w-56 flex-col rounded-md p-2 cursor-pointer'
                }
                key={a.id}
              >
                <div className="items-left flex flex-col">
                  <div className="pl-0.25 pr-0.25 inline-flex items-start rounded-md pt-2">
                    <span
                      className="mr-1.5 h-5 w-5 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUnFavoritesConfirmationInfo({
                          show: true,
                          text: `Are you sure you want to unfavorite "${a.value}"?`,
                          id: a.id,
                          type: 'provider',
                        });
                      }}
                    >
                      <Icon
                        name={a.isFavorite ? 'addFavorites' : 'starUnfavorite'}
                        size={16}
                        color={
                          isSelectedItem(a.id, 'provider')
                            ? IconColors.WHITE_S
                            : IconColors.NONE
                        }
                      />
                    </span>
                    <div className="flex space-x-1 rounded-md">
                      <p
                        className={
                          isSelectedItem(a.id, 'provider')
                            ? 'text-sm font-medium text-left w-36 truncate leading-tight text-white'
                            : 'text-sm font-medium text-left w-36 truncate leading-tight text-gray-600'
                        }
                      >
                        {a.value}
                      </p>
                    </div>
                    <div className="ml-2 flex items-center justify-end">
                      <Icon
                        name="ellipsisHorizontal"
                        size={16}
                        color={
                          isSelectedItem(a.id, 'provider')
                            ? IconColors.WHITE_S
                            : IconColors.NONE
                        }
                      />
                    </div>
                    <Icon
                      name="chevron"
                      size={16}
                      color={
                        isSelectedItem(a.id, 'provider')
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
                            isSelectedItem(a.id, 'provider')
                              ? 'flex-1 text-xs leading-none text-white'
                              : 'flex-1 text-xs leading-none text-gray-400'
                          }
                        >
                          {a.providerNPI}
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
      <div hidden={selectionInfo.type === ''}>
        <FavoritiesDetail
          groupData={
            selectionInfo.type === 'group'
              ? (selectionInfo.selectedData as GroupData)
              : undefined
          }
          practices={
            selectionInfo.type === 'practice'
              ? (selectionInfo.selectedData as FavoritesPractices)
              : undefined
          }
          facilities={
            selectionInfo.type === 'facility'
              ? (selectionInfo.selectedData as FavoritesFacilities)
              : undefined
          }
          providers={
            selectionInfo.type === 'provider'
              ? (selectionInfo.selectedData as FavoritesProviders)
              : undefined
          }
        ></FavoritiesDetail>
      </div>
    </div>
  );
};

export default Favorites;
