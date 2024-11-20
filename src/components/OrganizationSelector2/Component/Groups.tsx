import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Icon from '@/components/Icon';
import {
  getWorkGroupsDataRequest,
  getWorkGroupsSelectedDataRequest,
  setCreateEditWorkGroupIsSuccessed,
  setSearchSelectedDataAction,
} from '@/store/chrome/actions';
import {
  addFavoritesItemsSaga,
  unFavoritesItemsSaga,
} from '@/store/chrome/sagas';
import {
  getCreateEditWorkGroupIsSuccessedselector,
  getSearchSelectedItemSelector,
} from '@/store/chrome/selectors';
import type {
  GroupsData,
  WorkGroupsData,
  WorkGroupsSelected,
} from '@/store/chrome/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';

interface Tprops {
  searchInput: string;
  dataList: GroupsData[] | null;
  onSelect?: (value: number) => void;
  workGroupsSelected?: WorkGroupsSelected;
  showMenuIcons: boolean | false;
  showRemoveIcons: boolean | false;
  selectedWorkGroup?: WorkGroupsData | null | undefined;
  onFavorite?: (value: GroupsData[]) => void;
}

const Groups = ({
  searchInput,
  dataList,
  onSelect,
  workGroupsSelected,
  selectedWorkGroup,
}: Tprops) => {
  const myRef = useRef<HTMLTableRowElement>(null);
  const ref = useRef<null | HTMLDivElement>(null);
  const searchItems = useSelector(getSearchSelectedItemSelector);
  const dispatch = useDispatch();
  useEffect(() => {
    setTimeout(() => {
      myRef?.current?.scrollIntoView({
        behavior: 'auto',
        block: 'start',
      });
    }, 300);
  }, []);
  const createEditWorkGroupSuccessed = useSelector(
    getCreateEditWorkGroupIsSuccessedselector
  );
  const activeIds = workGroupsSelected
    ? workGroupsSelected.groupsData?.map((m) => m.id)
    : [];
  useEffect(() => {
    if (createEditWorkGroupSuccessed && selectedWorkGroup?.id) {
      dispatch(getWorkGroupsDataRequest());
      dispatch(setCreateEditWorkGroupIsSuccessed(null));
      dispatch(
        getWorkGroupsSelectedDataRequest({
          workGroupId: selectedWorkGroup?.id,
        })
      );
    }
  }, [createEditWorkGroupSuccessed]);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  }, [searchItems]);

  return (
    <>
      <div hidden={dataList != null} className="flex w-full flex-row">
        <div className="flex h-40 w-full flex-row ">
          <div className="flex w-full flex-col items-start">
            <div className="h-40  w-full overflow-y-auto overflow-x-hidden">
              {dataList
                ?.filter(function (f) {
                  if (searchInput) {
                    const einNumber = f.einNumber
                      ? f.einNumber.toString().toLowerCase()
                      : '';
                    return (
                      f.value
                        .toLowerCase()
                        .includes(searchInput.toLowerCase()) ||
                      einNumber.includes(searchInput.toLowerCase())
                    );
                  }
                  return true; // No searchInput, return all items
                })
                .map((b) => (
                  <div
                    onClick={async () => {
                      if (onSelect) {
                        onSelect(b.id);
                        dispatch(setSearchSelectedDataAction(null));
                      }
                    }}
                    className={classNames(
                      activeIds.includes(b.id) &&
                        workGroupsSelected?.practicesData.length === 0 &&
                        workGroupsSelected?.facilitiesData.length === 0 &&
                        workGroupsSelected?.providersData.length === 0
                        ? 'flex w-full flex-col rounded-md p-2 bg-cyan-400'
                        : '',
                      activeIds.includes(b.id) || searchItems?.groupId === b.id
                        ? 'flex w-full flex-col rounded-md p-2 bg-gray-100'
                        : 'flex w-full flex-col rounded-md p-2'
                    )}
                    ref={
                      (!!activeIds.length && activeIds[0] === b.id) ||
                      searchItems?.groupId === b.id
                        ? myRef
                        : undefined
                    }
                    key={b.id}
                  >
                    <div
                      className="flex flex-row items-center"
                      ref={
                        searchItems && searchItems.groupId === b.id
                          ? ref
                          : undefined
                      }
                    >
                      <div
                        hidden={b.isFavorite}
                        onClick={(e) => {
                          e.stopPropagation();
                          addFavoritesItemsSaga({ groups: [b.id] });
                        }}
                      >
                        <Icon
                          className="relative h-4 w-4 cursor-pointer"
                          color={
                            activeIds.includes(b.id) &&
                            workGroupsSelected?.practicesData.length === 0 &&
                            workGroupsSelected?.facilitiesData.length === 0 &&
                            workGroupsSelected?.providersData.length === 0
                              ? IconColors.WHITE_S
                              : IconColors.NONE
                          }
                          name="starUnfavorite"
                        />
                      </div>
                      <div
                        hidden={!b.isFavorite}
                        onClick={(e) => {
                          e.stopPropagation();
                          unFavoritesItemsSaga({ groups: [b.id] });
                        }}
                      >
                        <Icon
                          className="relative h-4 w-4 cursor-pointer"
                          color={
                            activeIds.includes(b.id) &&
                            workGroupsSelected?.practicesData.length === 0 &&
                            workGroupsSelected?.facilitiesData.length === 0 &&
                            workGroupsSelected?.providersData.length === 0
                              ? IconColors.WHITE_S
                              : IconColors.NONE
                          }
                          name="addFavorites"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span
                          className={classNames(
                            'mx-2 flex-1 text-left text-sm leading-5 cursor-pointer',
                            activeIds.includes(b.id) &&
                              workGroupsSelected?.practicesData.length === 0 &&
                              workGroupsSelected?.facilitiesData.length === 0 &&
                              workGroupsSelected?.providersData.length === 0 &&
                              onSelect
                              ? 'text-white'
                              : 'text-gray-600'
                          )}
                        >
                          {b.value}
                        </span>
                        {b.einNumber && (
                          <div className=" mx-2 inline-flex items-center justify-start rounded-md pt-2">
                            <div className="rounded-md">
                              <p
                                className={classNames(
                                  'flex-1 text-xs leading-none',
                                  activeIds.includes(b.id) &&
                                    workGroupsSelected?.practicesData.length ===
                                      0 &&
                                    workGroupsSelected?.facilitiesData
                                      .length === 0 &&
                                    workGroupsSelected?.providersData.length ===
                                      0 &&
                                    onSelect
                                    ? 'text-white'
                                    : 'text-gray-400'
                                )}
                              >
                                EIN:: {b.einNumber}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Groups;
