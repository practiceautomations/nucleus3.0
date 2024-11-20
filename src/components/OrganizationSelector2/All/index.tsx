import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setWorkGroupSelected } from '@/store/chrome/actions';
import { addRecentHistoryRequestSaga } from '@/store/chrome/sagas';
import {
  getSearchSelectedItemSelector,
  getselectdWorkGroupsIDsSelector,
} from '@/store/chrome/selectors';
import type { AddRecentsData, WorkGroupsSelected } from '@/store/chrome/types';
import { fetchFacilityDataRequest } from '@/store/shared/actions';
import { getGroupDataSelector } from '@/store/shared/selectors';

import Groups from '../Component/Groups';

interface Tprops {
  searchInput: string;
  confirmIsTrigger: number | null;
  isConfirm: () => void;
  onSelect?: () => void;
}

const All = ({
  confirmIsTrigger,
  isConfirm,
  onSelect,
  searchInput,
}: Tprops) => {
  const dispatch = useDispatch();
  const groupsData = useSelector(getGroupDataSelector);
  const searchItems = useSelector(getSearchSelectedItemSelector);
  const selectedWorkedGroup = useSelector(getselectdWorkGroupsIDsSelector);

  const [workGroupsSelected, setworkGroupsSelected] =
    useState<WorkGroupsSelected>({
      workGroupId: null,
      workGroupName: null,
      groupsData: [],
      practicesData: [],
      facilitiesData: [],
      providersData: [],
    });

  const onSelectGroup = async (value: number) => {
    const group = groupsData?.filter((m) => m.id === value);
    if (group) {
      setworkGroupsSelected({
        ...workGroupsSelected,
        groupsData: group,
        practicesData: [],
        providersData: [],
        facilitiesData: [],
      });
    }
  };

  const confirmIsTriggerEvent = async () => {
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
    if (confirmIsTrigger) {
      confirmIsTriggerEvent();
    }
  }, [confirmIsTrigger]);

  useEffect(() => {
    if (!selectedWorkedGroup?.workGroupId && selectedWorkedGroup) {
      setworkGroupsSelected(selectedWorkedGroup);
    }
  }, [selectedWorkedGroup]);

  useEffect(() => {
    if (searchItems && searchItems?.groupId) {
      onSelectGroup(searchItems && searchItems?.groupId);
      if (searchItems.facilityId && searchItems.practiceId) {
        dispatch(fetchFacilityDataRequest({ groupID: searchItems.groupId }));
      }
    }
  }, [searchItems]);

  return (
    <div className="flex w-full flex-row">
      <Groups
        searchInput={searchInput}
        dataList={groupsData}
        onSelect={(id) => {
          onSelectGroup(id);
          if (onSelect) onSelect();
        }}
        workGroupsSelected={workGroupsSelected}
        showMenuIcons={true}
        showRemoveIcons={false}
      />
    </div>
  );
};

export default All;
