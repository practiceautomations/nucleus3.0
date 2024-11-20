import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Icon from '@/components/Icon';
import WorkGroupMenuPopper from '@/components/OrganizationSelector/WorkGroups/WorkGroupMenuPopper';
import {
  getWorkGroupsSelectedDataRequest,
  setSearchSelectedDataAction,
  setWorkGroupSelected,
  setWorkgroupSelectResponceData,
} from '@/store/chrome/actions';
import { addRecentHistoryRequestSaga } from '@/store/chrome/sagas';
import {
  getSearchSelectedItemSelector,
  getselectdWorkGroupsIDsSelector,
  getWorkGroupSelectedDataSelector,
} from '@/store/chrome/selectors';
import type {
  AddRecentsData,
  WorkGroupsData,
  WorkGroupsSelected,
} from '@/store/chrome/types';
import { IconColors } from '@/utils/ColorFilters';
import useOnceEffect from '@/utils/useOnceEffect';

import Facilities from '../Component/Facilities';
import Groups from '../Component/Groups';
import Practices from '../Component/Practices';
import Providers from '../Component/Providers';
import CreateNewWorkgroupButton from './CreateNewWorkgroupButton';

interface Tprops {
  confirmIsTrigger: number | null;
  workGroupData: WorkGroupsData[] | null;
  isConfirm: () => void;
  onSelect?: (isSelected: boolean) => void;
}

const WorkGroups = ({
  confirmIsTrigger,
  workGroupData,
  isConfirm,
  onSelect,
}: Tprops) => {
  const [isActive, setIsActive] = useState<number | null | undefined>(0);
  const dispatch = useDispatch();
  const workGroupSelectedData = useSelector(getWorkGroupSelectedDataSelector);
  const selectedWorkedGroup = useSelector(getselectdWorkGroupsIDsSelector);
  const searchItems = useSelector(getSearchSelectedItemSelector);
  const ref = useRef<null | HTMLDivElement>(null);
  const [selectedWorkGroup, setSelectedWorkGroup] =
    useState<WorkGroupsData | null>();

  useEffect(() => {
    if (
      selectedWorkedGroup &&
      selectedWorkedGroup.workGroupId &&
      selectedWorkedGroup.workGroupName
    ) {
      setIsActive(selectedWorkedGroup.workGroupId);
      const obj: WorkGroupsData = {
        id: selectedWorkedGroup.workGroupId,
        value: selectedWorkedGroup.workGroupName,
      };
      setSelectedWorkGroup(obj);
    }
  }, [selectedWorkedGroup]);

  useOnceEffect(() => {
    if (selectedWorkGroup?.id && !searchItems?.workgroupId) {
      setIsActive(selectedWorkGroup?.id);
      dispatch(
        getWorkGroupsSelectedDataRequest({ workGroupId: selectedWorkGroup.id })
      );
    }
    if (!selectedWorkedGroup?.workGroupId) {
      dispatch(setWorkgroupSelectResponceData(null));
    }
  }, [selectedWorkGroup]);

  const myRef = useRef<HTMLTableRowElement>(null);
  useEffect(() => {
    if (!searchItems?.workgroupId) {
      setTimeout(() => {
        myRef?.current?.scrollIntoView({
          behavior: 'auto',
          block: 'start',
        });
      }, 300);
    }
  }, [workGroupData]);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
    setIsActive(0);
    if (searchItems?.workgroupId) {
      const obj: WorkGroupsData = {
        id: searchItems.workgroupId,
        value: searchItems.value,
      };
      dispatch(setSearchSelectedDataAction(null));
      setSelectedWorkGroup(obj);
    }
  }, [searchItems?.workgroupId]);

  const confirmIsTriggerEvent = async () => {
    if (workGroupSelectedData) {
      const workGroupsSelected: WorkGroupsSelected = {
        workGroupId: null,
        workGroupName: null,
        groupsData: [],
        practicesData: [],
        facilitiesData: [],
        providersData: [],
      };

      workGroupsSelected.groupsData = workGroupSelectedData?.groupsData.filter(
        (m) => m.id
      );
      workGroupsSelected.practicesData =
        workGroupSelectedData?.practicesData.filter((m) => m.id);
      workGroupsSelected.facilitiesData =
        workGroupSelectedData?.facilitiesData.filter((m) => m.id);
      workGroupsSelected.providersData =
        workGroupSelectedData?.providersData.filter((m) => m.id);
      if (selectedWorkGroup) {
        workGroupsSelected.workGroupId = selectedWorkGroup?.id;
        workGroupsSelected.workGroupName = selectedWorkGroup?.value;
      }
      const obj: AddRecentsData = {
        workGroups: workGroupsSelected?.workGroupId
          ? [workGroupsSelected.workGroupId]
          : [],
        groups: [],
        practices: [],
        facilities: [],
        providers: [],
      };
      const res = await addRecentHistoryRequestSaga(obj);
      if (res) {
        dispatch(setWorkGroupSelected(workGroupsSelected));
        isConfirm();
      }
    }
  };

  useEffect(() => {
    if (confirmIsTrigger) {
      confirmIsTriggerEvent();
    }
  }, [confirmIsTrigger]);

  useEffect(() => {
    if (isActive) {
      if (onSelect) onSelect(true);
    } else if (!selectedWorkedGroup && onSelect) {
      onSelect(false);
    }
  }, [isActive]);

  return (
    <div className="flex flex-row">
      <div>
        <div className="flex h-40 flex-row">
          <div className="flex w-56 flex-col items-start">
            <p
              hidden={!workGroupData?.length}
              className="mb-2 font-bold text-gray-500"
            >
              Work Groups
            </p>
            <div className="h-40  w-56 overflow-y-auto overflow-x-hidden">
              {workGroupData?.map((a) => (
                <div
                  className={
                    isActive === a.id ||
                    (searchItems && searchItems?.workgroupId === a.id)
                      ? 'flex w-52 flex-col rounded-md p-2 bg-cyan-400 h-9'
                      : 'flex w-52 flex-col h-9 rounded-md p-2 hover:bg-gray-100 mr-3'
                  }
                  key={a.value}
                  ref={
                    !!selectedWorkedGroup?.workGroupId &&
                    selectedWorkedGroup?.workGroupId === a.id
                      ? myRef
                      : undefined
                  }
                >
                  <div
                    onClick={() => {
                      dispatch(setSearchSelectedDataAction(null));
                      setSelectedWorkGroup(a);
                      if (onSelect) onSelect(true);
                    }}
                    className={'flex cursor-pointer flex-row items-center'}
                    ref={
                      searchItems && searchItems?.workgroupId === a.id
                        ? ref
                        : undefined
                    }
                  >
                    <span
                      className={
                        isActive === a.id ||
                        (searchItems && searchItems?.workgroupId === a.id)
                          ? 'ml-2 flex-1 text-sm leading-5 text-white text-left truncate'
                          : 'text-left ml-2 flex-1 text-sm leading-5 text-gray-600 truncate'
                      }
                    >
                      {a.value}
                    </span>
                    <WorkGroupMenuPopper
                      dataList={[
                        {
                          id: 1,
                          title: 'Rename Workgroup',
                          showBottomDivider: false,
                        },
                        {
                          id: 2,
                          title: 'Delete Workgroup',
                          showBottomDivider: false,
                        },
                      ]}
                      iconColor={
                        isActive === a.id ||
                        (searchItems && searchItems?.workgroupId === a.id)
                          ? IconColors.WHITE_S
                          : IconColors.NONE
                      }
                      onDelete={() => {
                        setIsActive(0);
                      }}
                      workGroup={a}
                    />
                    <Icon
                      name="chevron"
                      size={13}
                      color={
                        isActive === a.id ||
                        (searchItems && searchItems?.workgroupId === a.id)
                          ? IconColors.WHITE
                          : IconColors.GRAY
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <CreateNewWorkgroupButton />
      </div>
      <hr className="mr-2 h-auto w-[1px] bg-gray-200" />
      <div className="w-52 ">
        {workGroupSelectedData && (
          <Groups
            dataList={workGroupSelectedData.groupsData}
            showMenuIcons={false}
            showRemoveIcons={true}
            selectedWorkGroup={selectedWorkGroup}
          ></Groups>
        )}
      </div>
      <hr className="mr-2 ml-7 h-auto w-[1px] bg-gray-200" />
      <div className="w-52">
        {workGroupSelectedData && (
          <Practices
            dataList={workGroupSelectedData.practicesData}
            showMenuIcons={false}
            showRemoveIcons={true}
            selectedWorkGroup={selectedWorkGroup}
          ></Practices>
        )}
      </div>
      <hr className="mr-3 ml-7 h-auto w-[1px] bg-gray-200" />
      <div className="w-52">
        {workGroupSelectedData && (
          <Facilities
            dataList={workGroupSelectedData.facilitiesData}
            showMenuIcons={false}
            showRemoveIcons={true}
            selectedWorkGroup={selectedWorkGroup}
          ></Facilities>
        )}
      </div>
      <hr className="mr-3 ml-7 h-auto w-[1px] bg-gray-200" />
      <div className="w-52">
        {workGroupSelectedData && (
          <Providers
            dataList={workGroupSelectedData.providersData}
            showMenuIcons={false}
            showRemoveIcons={true}
            selectedWorkGroup={selectedWorkGroup}
          ></Providers>
        )}
      </div>
    </div>
  );
};

export default WorkGroups;
