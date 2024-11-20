import { ClickAwayListener, Popover } from '@mui/material';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Icon from '@/components/Icon';
import Modal from '@/components/UI/Modal';
import {
  getWorkGroupsSelectedDataRequest,
  setCreateEditWorkGroupIsSuccessed,
  setWorkgroupSelectResponceData,
} from '@/store/chrome/actions';
import { editWorkgroupRequestSaga } from '@/store/chrome/sagas';
import {
  getCreateEditWorkGroupIsSuccessedselector,
  getWorkGroupDataSelector,
  getWorkGroupSelectedDataSelector,
} from '@/store/chrome/selectors';
import type {
  EditWorkgroupData,
  FacilitiesData,
  GroupsData,
  ProvidersData,
  RemoveFromWorkGroupType,
  WorkGroupsData,
  WorkGroupsSelected,
} from '@/store/chrome/types';
import type { PracticeData } from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';

import NewWorkgroupForm from '../../WorkGroups/NewWorkgroupForm';
import RemoveItemsWorkGroupModel from '../../WorkGroups/RemoveItemsWorkGroupModel';

interface DataType {
  id: number;
  title: string;
  showBottomDivider: boolean;
}

interface RemovedFromWorkGroupType {
  workGroupIds: number[];
  group?: GroupsData;
  practice?: PracticeData;
  facilities?: FacilitiesData;
  provider?: ProvidersData;
}

interface Tprops {
  colors?: any;
  dataList: DataType[];
  onSelect: (value: number) => void;
  cls?: string;
  iconColor?: IconColors | undefined;
  workGroupsSelected: WorkGroupsSelected;
  removedFromWorkGroup?: RemovedFromWorkGroupType | undefined;
}

export default function MultiSelectMenuPoper({
  colors,
  dataList,
  onSelect,
  workGroupsSelected,
  removedFromWorkGroup,
}: Tprops) {
  const dispatch = useDispatch();
  const workGroupData = useSelector(getWorkGroupDataSelector);
  const workGroupSelectedData = useSelector(getWorkGroupSelectedDataSelector);
  const [newWorkgroupModelOpen, setNewWorkgroupModelOpen] = useState(false);
  const [removeItemModalOpen, setRemoveItemModalOpen] = useState(false);
  const [removeObject, setRemoveObject] = useState<
    RemoveFromWorkGroupType | undefined
  >();
  const [anchorAddRemove, setAnchorAddRemove] = useState<null | HTMLElement>(
    null
  );
  const [anchorAdd, setAnchorAdd] = useState<null | HTMLElement>(null);
  const [anchorRemove, setAnchorRemove] = useState<null | HTMLElement>(null);
  const createEditWorkGroupSuccessed = useSelector(
    getCreateEditWorkGroupIsSuccessedselector
  );
  const [itemsWorkGroups, setItemsWorkGroups] = useState<
    WorkGroupsData[] | null
  >();
  const [onClickWorkGroupsData, setOnClickWorkGroupsData] =
    useState<WorkGroupsData | null>();

  const handleClickAddRemove = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorAddRemove(anchorAddRemove ? null : event.currentTarget);
  };

  const handleClickAdd = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorAdd(anchorAdd ? null : event.currentTarget);
  };

  const handleClickRemove = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorRemove(anchorRemove ? null : event.currentTarget);
  };

  useEffect(() => {
    if (createEditWorkGroupSuccessed) {
      setAnchorAdd(null);
      setAnchorAddRemove(null);
      setNewWorkgroupModelOpen(false);
      dispatch(setCreateEditWorkGroupIsSuccessed(null));
    }
  }, [createEditWorkGroupSuccessed]);

  const handelEditWorkGroup = async () => {
    if (
      onClickWorkGroupsData?.id &&
      onClickWorkGroupsData?.value &&
      workGroupSelectedData
    ) {
      const groupsDataIds = workGroupSelectedData.groupsData.map((m) => m.id);
      const practicesDataIds = workGroupSelectedData.practicesData.map(
        (m) => m.id
      );
      const facilitiesDataIds = workGroupSelectedData.facilitiesData.map(
        (m) => m.id
      );
      const providersDataIds = workGroupSelectedData.providersData.map(
        (m) => m.id
      );
      const obj: EditWorkgroupData = {
        name: onClickWorkGroupsData.value,
        providers: Array.from(
          new Set(
            workGroupsSelected.providersData
              .map((m) => m.id)
              .concat(providersDataIds)
          )
        ),
        practices: Array.from(
          new Set(
            workGroupsSelected.practicesData
              .map((m) => m.id)
              .concat(practicesDataIds)
          )
        ),
        groups: Array.from(
          new Set(
            workGroupsSelected.groupsData.map((m) => m.id).concat(groupsDataIds)
          )
        ),
        facilities: Array.from(
          new Set(
            workGroupsSelected.facilitiesData
              .map((m) => m.id)
              .concat(facilitiesDataIds)
          )
        ),
      };
      editWorkgroupRequestSaga(obj, onClickWorkGroupsData.id);
    }
  };
  useEffect(() => {
    handelEditWorkGroup();
  }, [workGroupSelectedData]);

  const openAddRemove = Boolean(anchorAddRemove);
  const openAdd = Boolean(anchorAdd);
  const openRemove = Boolean(anchorRemove);
  const addRemoveId = openAddRemove ? 'menu' : undefined;
  const addId = openAdd ? 'menu2' : undefined;
  const removeId = openRemove ? 'menu3' : undefined;
  const handleClose = () => {
    setAnchorAddRemove(null);
  };

  const onRemoveButtonClick = () => {
    if (workGroupData && removedFromWorkGroup) {
      setItemsWorkGroups(
        workGroupData?.filter(
          (m) => m.id && removedFromWorkGroup.workGroupIds.includes(m.id)
        )
      );
    }
  };

  const handleCloseAddRemove = (e: any) => {
    const event: any = e;
    function handlePopoverAddRemoveDoc(id: string) {
      const popoverAddRemoveDoc = document.getElementById(id);
      if (popoverAddRemoveDoc) {
        if (
          event.pageX > popoverAddRemoveDoc.getBoundingClientRect().x &&
          event.pageX <
            popoverAddRemoveDoc.getBoundingClientRect().x +
              popoverAddRemoveDoc.getBoundingClientRect().width &&
          event.pageY > popoverAddRemoveDoc.getBoundingClientRect().y &&
          event.pageY <
            popoverAddRemoveDoc.getBoundingClientRect().y +
              popoverAddRemoveDoc.getBoundingClientRect().height
        ) {
          return true;
        }
        return false;
      }
      return false;
    }

    const resAddRemove = handlePopoverAddRemoveDoc('popover_ref_add_remove');
    if (resAddRemove) {
      const resAdd = handlePopoverAddRemoveDoc('popover_ref_add');
      if (!resAdd) {
        setAnchorAdd(null);
        setAnchorRemove(document.getElementById('popover_ref_remove'));
        onRemoveButtonClick();
      } else if (anchorAdd) {
        setAnchorAdd(null);
        return;
      }

      const resRemove = handlePopoverAddRemoveDoc('popover_ref_remove');
      if (!resRemove) {
        setAnchorRemove(null);
        setAnchorAdd(document.getElementById('popover_ref_add'));
      } else if (anchorRemove) {
        setAnchorRemove(null);
      }
    } else {
      setAnchorAddRemove(null);
      setAnchorAdd(null);
      setAnchorRemove(null);
    }
  };

  const onRemoveFromWorkGroupClick = (data: WorkGroupsData) => {
    if (data && data.id && data.value) {
      let obj: RemoveFromWorkGroupType = {
        removeEntityName: '',
        removeFromEntitiName: data.value,
        workGroupID: data.id,
      };
      if (removedFromWorkGroup?.group) {
        obj = {
          ...obj,
          removeEntityName: removedFromWorkGroup?.group.value,
          groups: [removedFromWorkGroup?.group.id],
        };
      }
      if (removedFromWorkGroup?.practice) {
        obj = {
          ...obj,
          removeEntityName: removedFromWorkGroup?.practice.value,
          practices: [removedFromWorkGroup?.practice.id],
        };
      }
      if (removedFromWorkGroup?.provider) {
        obj = {
          ...obj,
          removeEntityName: removedFromWorkGroup?.provider.value,
          providers: [removedFromWorkGroup?.provider.id],
        };
      }
      if (removedFromWorkGroup?.facilities) {
        obj = {
          ...obj,
          removeEntityName: removedFromWorkGroup?.facilities.value,
          facilities: [removedFromWorkGroup?.facilities.id],
        };
      }
      setRemoveObject(obj);
    }
  };

  return (
    <div style={{}}>
      <ClickAwayListener
        mouseEvent="onMouseDown"
        touchEvent="onTouchStart"
        onClickAway={() => {}}
      >
        <button
          className="relative flex cursor-pointer"
          aria-describedby={addRemoveId}
          onClick={handleClickAddRemove}
        >
          <Icon
            name="ellipsisHorizontal"
            className="pr-10"
            size={13}
            color={colors}
          />
        </button>
      </ClickAwayListener>
      <Popover
        id={addRemoveId}
        open={openAddRemove}
        anchorEl={anchorAddRemove}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        className=""
      >
        <div className="top-12 z-40 w-[224px] shadow-lg ring-1 ring-black  ring-opacity-5">
          <div id={'popover_ref_add_remove'} className="flex flex-col">
            {!!dataList &&
              dataList.map((d) => (
                <div
                  id={d.id === 1 ? 'popover_ref_add' : 'popover_ref_remove'}
                  className="cursor-pointer"
                  key={d.title}
                >
                  <div
                    onClick={async (e) => {
                      onSelect(d.id);
                      if (d.id === 1) {
                        handleClickAdd(e);
                      } else if (d.id === 2) {
                        handleClickRemove(e);
                        onRemoveButtonClick();
                      }
                    }}
                    className="inline-flex w-56 items-center justify-between space-x-3 px-4 py-2 "
                  >
                    <p className="text-sm leading-tight text-gray-700">
                      {d.title}
                    </p>
                    <Icon name="chevron" size={12} color={IconColors.GRAY} />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </Popover>

      <Popover
        id={addId}
        open={openAdd}
        anchorEl={anchorAdd}
        onClose={handleCloseAddRemove}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        className=""
      >
        <div className="top-12 z-40 w-[224px] py-1 shadow-lg ring-1 ring-black  ring-opacity-5">
          <div className="flex flex-col">
            <div className="h-40 overflow-y-auto overflow-x-hidden">
              {!!workGroupData &&
                workGroupData.map((d) => (
                  <div className="py-2 px-4 " key={d.value}>
                    <button
                      className={classNames(
                        d.value ? 'border-zinc-100' : 'hover:border-0',
                        'w-full cursor-pointer flex flex-row text-left text-sm leading-5 font-normal text-zinc-800 hover:opacity-75 focus:outline-none'
                      )}
                      onClick={async () => {
                        if (d.id) {
                          setOnClickWorkGroupsData(d);
                          dispatch(setWorkgroupSelectResponceData(null));
                          dispatch(
                            getWorkGroupsSelectedDataRequest({
                              workGroupId: d.id,
                            })
                          );
                        }
                      }}
                    >
                      <span className="truncate ">{d.value}</span>
                    </button>
                  </div>
                ))}
            </div>
            <div className="border-t-4 border-zinc-100 py-2 px-4">
              <button
                onClick={() => {
                  setNewWorkgroupModelOpen(true);
                  setAnchorAdd(null);
                  setAnchorAddRemove(null);
                }}
                className="flex w-full cursor-pointer flex-row border-zinc-100 text-left text-sm font-normal leading-5 text-zinc-800 hover:opacity-75 focus:outline-none"
              >
                <span className="mr-1.5">
                  <Icon size={12} name="plus" color={IconColors.GRAY_PLUS} />
                </span>
                Add to New Workgroup
              </button>
            </div>
          </div>
        </div>
      </Popover>
      <Popover
        id={removeId}
        open={openRemove}
        anchorEl={anchorRemove}
        onClose={handleCloseAddRemove}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        className=""
      >
        <div className="top-12 z-40 w-[224px] py-1 shadow-lg ring-1 ring-black  ring-opacity-5">
          <div className="flex flex-col">
            <div className="h-auto overflow-y-auto overflow-x-hidden">
              {!!itemsWorkGroups &&
                itemsWorkGroups.map((d) => (
                  <div className="py-2 px-4 " key={d.value}>
                    <button
                      className={classNames(
                        d.value ? 'border-zinc-100' : 'hover:border-0',
                        'w-full inline-flex justify-between space-x-3 cursor-pointer flex flex-row text-left text-sm leading-5 font-normal text-zinc-800 hover:opacity-75 focus:outline-none'
                      )}
                      onClick={async () => {
                        if (d.id) {
                          setRemoveItemModalOpen(true);
                          setAnchorRemove(null);
                          setAnchorAddRemove(null);
                          onRemoveFromWorkGroupClick(d);
                        }
                      }}
                    >
                      <span className="truncate ">{d.value}</span>
                      <Icon name="checkmark" size={12} />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </Popover>
      <>
        <Modal
          open={newWorkgroupModelOpen}
          onClose={() => {}}
          modalContentClassName="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 w-full sm:max-w-lg sm:p-6 "
          modalClassName={'!z-[4]'}
        >
          <NewWorkgroupForm
            workGroupsSelected={workGroupsSelected}
            onClose={() => setNewWorkgroupModelOpen(false)}
          />
        </Modal>
      </>
      <>
        <Modal
          open={removeItemModalOpen}
          onClose={() => {}}
          modalContentClassName="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 w-full sm:max-w-lg sm:p-6 "
          modalClassName={'!z-[4]'}
        >
          {removeObject && (
            <RemoveItemsWorkGroupModel
              removeItemFromWorkGroup={removeObject}
              onClose={() => {
                setRemoveItemModalOpen(false);
              }}
            />
          )}
        </Modal>
      </>
    </div>
  );
}
