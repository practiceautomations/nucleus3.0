import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Icon from '@/components/Icon';
import Modal from '@/components/UI/Modal';
import {
  getWorkGroupsDataRequest,
  getWorkGroupsSelectedDataRequest,
  setCreateEditWorkGroupIsSuccessed,
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
  PracticesData,
  RemoveFromWorkGroupType,
  WorkGroupsData,
  WorkGroupsSelected,
} from '@/store/chrome/types';
import type { PracticeData } from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';

import MultiSelectMenuPoper from '../All/MultiSelectMenuPoper';
import RemoveItemsWorkGroupModel from '../WorkGroups/RemoveItemsWorkGroupModel';
import { multiSelectButton } from './utilities';

interface Tprops {
  dataList: PracticesData[] | null;
  onSelect?: (value: number) => void;
  workGroupsSelected?: WorkGroupsSelected;
  showMenuIcons: boolean | false;
  showRemoveIcons: boolean | false;
  selectedWorkGroup?: WorkGroupsData | null | undefined;
  searchValue?: number;
}

const Practices = ({
  dataList,
  onSelect,
  workGroupsSelected,
  showMenuIcons,
  showRemoveIcons,
  selectedWorkGroup,
}: Tprops) => {
  const dispatch = useDispatch();
  const myRef = useRef<HTMLTableRowElement>(null);
  const ref = useRef<null | HTMLDivElement>(null);
  const searchItems = useSelector(getSearchSelectedItemSelector);
  useEffect(() => {
    setTimeout(() => {
      myRef?.current?.scrollIntoView({
        behavior: 'auto',
        block: 'start',
      });
    }, 300);
  }, []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const createEditWorkGroupSuccessed = useSelector(
    getCreateEditWorkGroupIsSuccessedselector
  );

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  }, [searchItems]);

  const activeIds = workGroupsSelected
    ? workGroupsSelected.practicesData?.map((m) => m.id)
    : [];
  useEffect(() => {
    if (createEditWorkGroupSuccessed && selectedWorkGroup?.id) {
      setIsModalOpen(false);
      dispatch(getWorkGroupsDataRequest());
      dispatch(setCreateEditWorkGroupIsSuccessed(null));
      dispatch(
        getWorkGroupsSelectedDataRequest({
          workGroupId: selectedWorkGroup?.id,
        })
      );
    }
  }, [createEditWorkGroupSuccessed]);

  const [removeObject, setRemoveObject] = useState<RemoveFromWorkGroupType>();

  const removeHelper = (data: PracticeData) => {
    if (selectedWorkGroup?.id) {
      const obj: RemoveFromWorkGroupType = {
        removeEntityName: data.value,
        removeFromEntitiName: selectedWorkGroup.value || '',
        workGroupID: selectedWorkGroup.id,
        practices: [data.id],
      };
      setRemoveObject(obj);
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div hidden={dataList != null} className="flex flex-row">
        <div className="flex h-40 flex-row overflow-y-auto overflow-x-hidden">
          <div className="flex w-60 flex-col items-start">
            <p
              hidden={!dataList?.length}
              className="mb-2 font-bold text-gray-500"
            >
              Practices
            </p>
            <div className="h-40  w-60 overflow-y-auto overflow-x-hidden">
              {dataList?.map((b) => (
                <div
                  onClick={async () => {
                    if (onSelect) onSelect(b.id);
                    activeIds.includes(b.id);
                  }}
                  className={classNames(
                    activeIds.includes(b.id) &&
                      workGroupsSelected?.facilitiesData.length === 0 &&
                      workGroupsSelected?.providersData.length === 0
                      ? 'flex w-56 flex-col rounded-md p-2 bg-cyan-400'
                      : '',
                    activeIds.includes(b.id) ||
                      (searchItems && searchItems.practiceId === b.id)
                      ? 'flex w-56 flex-col rounded-md p-2 bg-gray-100'
                      : 'flex w-56 flex-col rounded-md p-2'
                  )}
                  ref={
                    !!activeIds.length && activeIds[0] === b.id
                      ? myRef
                      : undefined
                  }
                  key={b.id}
                >
                  <div
                    className="flex w-48 flex-row items-center"
                    ref={
                      searchItems && searchItems.practiceId === b.id
                        ? ref
                        : undefined
                    }
                  >
                    <div
                      hidden={b.isFavorite}
                      onClick={(e) => {
                        e.stopPropagation();
                        addFavoritesItemsSaga({ practices: [b.id] });
                      }}
                    >
                      <Icon
                        className="relative h-4 w-4 cursor-pointer"
                        color={
                          activeIds.includes(b.id) &&
                          workGroupsSelected?.facilitiesData.length === 0 &&
                          workGroupsSelected.providersData.length === 0
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
                        unFavoritesItemsSaga({ practices: [b.id] });
                      }}
                    >
                      <Icon
                        className="relative h-4 w-4 cursor-pointer"
                        color={
                          activeIds.includes(b.id) &&
                          workGroupsSelected?.facilitiesData.length === 0 &&
                          workGroupsSelected?.providersData.length === 0
                            ? IconColors.WHITE_S
                            : IconColors.NONE
                        }
                        name="addFavorites"
                      />
                    </div>
                    <span
                      className={
                        activeIds.includes(b.id) &&
                        workGroupsSelected?.facilitiesData.length === 0 &&
                        workGroupsSelected?.providersData.length === 0 &&
                        onSelect
                          ? 'mx-2 flex-1 text-left text-sm leading-5 text-white cursor-pointer'
                          : 'mx-2 flex-1 text-left text-sm leading-5 text-gray-600'
                        // (onSelect
                        //   ? 'mx-2 flex-1 text-left text-sm leading-5 text-gray-600 cursor-pointer'
                        //   : 'mx-2 flex-1 text-left text-sm leading-5 text-gray-600')
                      }
                    >
                      {b.value}
                    </span>
                    {workGroupsSelected ? (
                      <div className="mb-1" hidden={!showMenuIcons}>
                        <MultiSelectMenuPoper
                          dataList={
                            b.workGroups.length === 0
                              ? multiSelectButton.filter((m) => m.id === 1)
                              : multiSelectButton
                          }
                          colors={
                            activeIds.includes(b.id) &&
                            workGroupsSelected.facilitiesData.length === 0 &&
                            workGroupsSelected.providersData.length === 0
                              ? IconColors.WHITE_S
                              : IconColors.NONE
                          }
                          iconColor={IconColors.GRAY}
                          onSelect={() => {}}
                          workGroupsSelected={workGroupsSelected}
                          removedFromWorkGroup={{
                            practice: b,
                            workGroupIds: b.workGroups,
                          }}
                        />
                      </div>
                    ) : (
                      <div></div>
                    )}
                    <div hidden={!showMenuIcons}>
                      <Icon
                        name="chevron"
                        size={13}
                        color={
                          activeIds.includes(b.id) &&
                          workGroupsSelected?.facilitiesData.length === 0 &&
                          workGroupsSelected?.providersData.length === 0
                            ? IconColors.WHITE
                            : IconColors.GRAY
                        }
                      />
                    </div>
                    <div
                      hidden={!showRemoveIcons}
                      onClick={() => {
                        removeHelper(b);
                      }}
                    >
                      <Icon
                        name="remove"
                        className="cursor-pointer"
                        size={14}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <>
        <Modal
          open={isModalOpen}
          onClose={() => {}}
          modalContentClassName="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 w-full sm:max-w-lg sm:p-6 "
          modalClassName={'!z-[4]'}
        >
          {removeObject && (
            <RemoveItemsWorkGroupModel
              removeItemFromWorkGroup={removeObject}
              onClose={() => {
                setIsModalOpen(false);
              }}
            />
          )}
        </Modal>
      </>
    </>
  );
};

export default Practices;
