import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setWorkGroupSelected } from '@/store/chrome/actions';
import { addRecentHistoryRequestSaga } from '@/store/chrome/sagas';
import {
  getSearchSelectedItemSelector,
  getselectdWorkGroupsIDsSelector,
} from '@/store/chrome/selectors';
import type {
  AddRecentsData,
  PracticesData,
  WorkGroupsSelected,
} from '@/store/chrome/types';
import {
  fetchFacilityDataRequest,
  fetchPracticeDataRequest,
  fetchProviderDataRequest,
} from '@/store/shared/actions';
import {
  getFacilityDataSelector,
  getGroupDataSelector,
  getPracticeDataSelector,
  getProviderDataSelector,
} from '@/store/shared/selectors';
import type { FacilityData } from '@/store/shared/types';

import Facilities from '../Component/Facilities';
import Groups from '../Component/Groups';
import Practices from '../Component/Practices';
import Providers from '../Component/Providers';

interface Tprops {
  confirmIsTrigger: number | null;
  isConfirm: () => void;
  onSelect?: () => void;
}

const All = ({ confirmIsTrigger, isConfirm, onSelect }: Tprops) => {
  const dispatch = useDispatch();
  const groupsData = useSelector(getGroupDataSelector);
  const practicesDataSelector = useSelector(getPracticeDataSelector);
  const facilitiesData = useSelector(getFacilityDataSelector);
  const providersDataSelector = useSelector(getProviderDataSelector);
  const searchItems = useSelector(getSearchSelectedItemSelector);
  const [practicesData, setPracticesData] = useState(practicesDataSelector);
  const [providersData, setProvidersData] = useState(providersDataSelector);
  const selectedWorkedGroup = useSelector(getselectdWorkGroupsIDsSelector);
  const [facilityData, setFacilitiesData] = useState<
    FacilityData[] | undefined
  >();

  const [workGroupsSelected, setworkGroupsSelected] =
    useState<WorkGroupsSelected>({
      workGroupId: null,
      workGroupName: null,
      groupsData: [],
      practicesData: [],
      facilitiesData: [],
      providersData: [],
    });

  const filterFacilitiesData = (practices: PracticesData[]) => {
    const practiceIds = practices?.map((m) => m.id);
    setFacilitiesData(
      facilitiesData?.filter((m) => practiceIds.includes(m.practiceID))
    );
  };

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
      filterFacilitiesData([]);
      dispatch(fetchPracticeDataRequest({ groupID: value }));
      dispatch(fetchProviderDataRequest({ groupID: value }));
      dispatch(fetchFacilityDataRequest({ groupID: value }));
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
    if (workGroupsSelected && searchItems && searchItems.facilityId === null) {
      filterFacilitiesData(workGroupsSelected.practicesData);
    }
    if (searchItems?.facilityId && searchItems && searchItems.practiceId) {
      setFacilitiesData(
        facilitiesData?.filter((m) => m.practiceID === searchItems?.practiceId)
      );
    }
  }, [facilitiesData]);

  useEffect(() => {
    setPracticesData(practicesDataSelector);
  }, [practicesDataSelector]);

  useEffect(() => {
    setProvidersData(providersDataSelector);
  }, [providersDataSelector]);

  useEffect(() => {
    if (!selectedWorkedGroup?.workGroupId && selectedWorkedGroup) {
      setworkGroupsSelected(selectedWorkedGroup);
      filterFacilitiesData(selectedWorkedGroup.practicesData);
      if (selectedWorkedGroup.groupsData && selectedWorkedGroup.groupsData[0]) {
        const value = selectedWorkedGroup.groupsData[0];
        dispatch(fetchPracticeDataRequest({ groupID: value.id }));
        dispatch(fetchProviderDataRequest({ groupID: value.id }));
        dispatch(fetchFacilityDataRequest({ groupID: value.id }));
      }
    } else {
      setPracticesData([]);
      setProvidersData([]);
    }
  }, [selectedWorkedGroup]);

  const onSelectPractices = (value: number) => {
    const practices = practicesData?.filter((m) => m.id === value);
    if (practices) {
      setworkGroupsSelected({
        ...workGroupsSelected,
        practicesData: practices,
      });
      filterFacilitiesData(practices);
    }
  };

  /// get Facilities Data
  const practicesActiveIds = workGroupsSelected
    ? workGroupsSelected.practicesData?.map((m) => m.id)
    : [];
  useEffect(() => {
    if (
      practicesActiveIds[0] &&
      practicesData?.length &&
      facilitiesData?.length
    ) {
      const practices = practicesData?.filter(
        (m) => m.id === practicesActiveIds[0]
      );
      filterFacilitiesData(practices);
    }
  }, [
    practicesActiveIds.length,
    practicesData?.length,
    facilitiesData?.length,
  ]);

  const onSelectFacilities = (value: number) => {
    const fcilities = facilitiesData?.filter((m) => m.id === value);
    if (fcilities) {
      setworkGroupsSelected({
        ...workGroupsSelected,
        facilitiesData: fcilities,
      });
    }
  };
  const onSelectProviders = (value: number) => {
    const providers = providersData?.filter((m) => m.id === value);
    if (providers) {
      setworkGroupsSelected({
        ...workGroupsSelected,
        providersData: providers,
      });
    }
  };

  useEffect(() => {
    if (searchItems && searchItems?.groupId) {
      onSelectGroup(searchItems && searchItems?.groupId);
      if (searchItems.facilityId && searchItems.practiceId) {
        dispatch(fetchFacilityDataRequest({ groupID: searchItems.groupId }));
      }
    }
  }, [searchItems]);

  return (
    <div className="flex flex-row">
      {/* Groups */}
      <Groups
        dataList={groupsData}
        onSelect={(id) => {
          onSelectGroup(id);
          if (onSelect) onSelect();
        }}
        workGroupsSelected={workGroupsSelected}
        showMenuIcons={true}
        showRemoveIcons={false}
      />
      <hr className="mr-6 h-auto w-[1px] bg-gray-200" />
      {/* Practices */}
      <Practices
        dataList={practicesData}
        onSelect={(id) => {
          onSelectPractices(id);
        }}
        showMenuIcons={true}
        workGroupsSelected={workGroupsSelected}
        showRemoveIcons={false}
      />

      <hr className="mr-6 h-auto w-[1px] bg-gray-200" />
      {/* Facilities */}
      <Facilities
        dataList={facilityData}
        onSelect={(id) => {
          onSelectFacilities(id);
        }}
        workGroupsSelected={workGroupsSelected}
        showMenuIcons={true}
        showRemoveIcons={false}
      />
      <hr className="mr-6 h-auto w-[1px] bg-gray-200" />
      {/* Providers */}
      <Providers
        dataList={providersData}
        onSelect={(id) => {
          onSelectProviders(id);
        }}
        workGroupsSelected={workGroupsSelected}
        showMenuIcons={true}
        showRemoveIcons={false}
      />
    </div>
  );
};

export default All;
