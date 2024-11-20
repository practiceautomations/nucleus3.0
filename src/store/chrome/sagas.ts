import type { AxiosResponse } from 'axios';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { v4 as uuidv4 } from 'uuid';

// eslint-disable-next-line import/no-cycle
import { httpClient } from '@/api/http-client';
import type { Notification } from '@/types/components/Notification';
/* eslint-disable-next-line */
import { handleApiError, validateResponse } from '@/utils/apiHelpers';

/* eslint-disable-next-line */
import store from '..';
import {
  addToastNotification,
  fetchFacilityDataSuccess,
  fetchGroupDataSuccess,
  fetchPracticeDataSuccess,
  fetchProviderDataSuccess,
} from '../shared/actions';
import type {
  FacilityData,
  GroupData,
  PracticeData,
  ProviderData,
} from '../shared/types';
import { ToastType } from '../shared/types';
import {
  addFavoritesFailure,
  createNewWorkGroupFailure,
  createNewWorkGroupSuccess,
  deleteWorkGroupFailure,
  deleteWorkGroupSuccess,
  editWorkGroupFailure,
  editWorkGroupSuccess,
  fetchAllFavoritiesDataSuccess,
  fetchNotificationFailure,
  fetchNotificationSuccess,
  fetchOrganizationSelectorDataFailure,
  fetchOrganizationSelectorDataSuccess,
  getRecentTabAllData,
  getSearchOrganizationData,
  getWorkGroupDataFailure,
  getWorkGroupDataSuccess,
  getWorkGroupSelectedDataFailure,
  getWorkGroupSelectedDataSuccess,
  renameWorkGroupFailure,
  renameWorkGroupSuccess,
  unFavoritesFailure,
} from './actions';
import {
  CREATE_NEW_WORKGROUP_REQUEST,
  EDIT_WORKGROUP_REQUEST,
  FETCH_NOTIFICATION_REQUEST,
  GET_ORGANIZATION_SELECTOR_DATA_REQUEST,
  GET_WORKGROUPS_DATA_REQUEST,
  GET_WORKGROUPS_SELECTED_DATA_REQUEST,
} from './actionTypes';
import type {
  AddRecentsData,
  AllFavoritesData,
  AllRecentTabData,
  CreateNewWorkGroupRequest,
  EditWorkgroupData,
  EditWorkGroupRequest,
  Favorites,
  GetWorkGroupsSelectedDataRequest,
  NewWorkgroupData,
  OrganizationSearchDropdownData,
  OrganizationSelectorData,
  RemoveFromWorkGroupType,
  RenameWorkGroup,
  WorkGroupsData,
  WorkGroupsResponseData,
  WorkGroupsSelectedDataRequest,
} from './types';

const getNotifications = () => httpClient.get<Notification[]>(`/notifications`);
// Todo: add proper typing
const createWorkgroup = (workgroup: NewWorkgroupData) =>
  httpClient.post<any>(`/Users/addWorkGroup/`, workgroup);
const getOrganizationSelectorData = () =>
  httpClient.get<any>(`/Repository/getOrganizationSelector/`);

const getWorkgroupData = () =>
  httpClient.get<any>(`/Repository/getWorkGroups/`);

const getWorkgroupSelectedData = (payload: WorkGroupsSelectedDataRequest) =>
  httpClient.get<any>(
    `/Repository/workGroupSelectValues?workGroupID=${payload.workGroupId}`
  );

const editWorkgroup = (payload: EditWorkgroupData, workGroupId: number) =>
  httpClient.put<any>(
    `/Users/editWorkGroup?workGroupId=${workGroupId}`,
    payload
  );
/*
  Worker Saga: Fired on FETCH_NOTIFICATION_REQUEST action
*/
function* fetchNotificationSaga() {
  try {
    const response: AxiosResponse<Notification[]> = yield call(
      getNotifications
    );
    yield put(
      fetchNotificationSuccess({
        notifications: response.data,
      })
    );
  } catch (e: any) {
    yield put(
      fetchNotificationFailure({
        error: e.message,
      })
    );
  }
}

export async function createEditHelper(
  data: EditWorkgroupData,
  workGroupId: number
) {
  if (data.groups) {
    const groupData: GroupData[] = JSON.parse(
      JSON.stringify(store.getState().shared.groupData)
    );
    const jsonData = groupData.map((row) => {
      if (data.groups.includes(row.id)) {
        const newWorkGroupIds = [...row.workGroups, workGroupId];
        return { ...row, workGroups: newWorkGroupIds };
      }
      return row;
    });
    store.dispatch(fetchGroupDataSuccess(jsonData));
  }
  if (data.practices) {
    const practiceData: PracticeData[] = JSON.parse(
      JSON.stringify(store.getState().shared.practiceData)
    );
    const jsonData = practiceData.map((row) => {
      if (data.practices.includes(row.id)) {
        const newWorkGroupIds = [...row.workGroups, workGroupId];
        return { ...row, workGroups: newWorkGroupIds };
      }
      return row;
    });
    store.dispatch(fetchPracticeDataSuccess(jsonData));
  }
  if (data.facilities) {
    const facilityData: FacilityData[] = JSON.parse(
      JSON.stringify(store.getState().shared.facilityData)
    );
    const jsonData = facilityData.map((row) => {
      if (data.facilities.includes(row.id)) {
        const newWorkGroupIds = [...row.workGroups, workGroupId];
        return { ...row, workGroups: newWorkGroupIds };
      }
      return row;
    });
    store.dispatch(fetchFacilityDataSuccess(jsonData));
  }
  if (data.providers) {
    const providerData: ProviderData[] = JSON.parse(
      JSON.stringify(store.getState().shared.providerData)
    );
    const jsonData = providerData.map((row) => {
      if (data.facilities.includes(row.id)) {
        const newWorkGroupIds = [...row.workGroups, workGroupId];
        return { ...row, workGroups: newWorkGroupIds };
      }
      return row;
    });
    store.dispatch(fetchProviderDataSuccess(jsonData));
  }
}
/*
  Worker Saga: Fired on CREATE_NEW_WORKGROUP_REQUEST action
*/
// Todo: add proper typing

export async function createWorkgroupRequestSaga(payload: EditWorkgroupData) {
  try {
    const response: AxiosResponse<any> = await httpClient.post<any>(
      `/Users/addWorkGroup/`,
      payload
    );
    createEditHelper(payload, response.data.workGroupId);
    store.dispatch(
      createNewWorkGroupSuccess({
        workgroup: {
          ...payload,
          id: response.data.workGroupId,
        },
      })
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Workgroup Successfully created',
        toastType: ToastType.SUCCESS,
      })
    );
    return true;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error: unable to create workgroup',
        toastType: ToastType.ERROR,
      })
    );
    store.dispatch(
      createNewWorkGroupFailure({
        error: e.message,
      })
    );
    return false;
  }
}

function* createNewWorkgroupSaga({ payload }: CreateNewWorkGroupRequest) {
  try {
    // Todo: Add proper typing
    const response: AxiosResponse<any> = yield call(
      createWorkgroup,
      payload.workgroup
    );
    validateResponse(response);
    yield put(
      createNewWorkGroupSuccess({
        workgroup: {
          ...payload.workgroup,
          id: response.data.workGroupId,
        },
      })
    );
    yield put(
      addToastNotification({
        id: uuidv4(),
        text: 'Workgroup Successfully created',
        toastType: ToastType.SUCCESS,
      })
    );
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    yield put(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error: unable to create workgroup',
        toastType: ToastType.ERROR,
      })
    );
    yield put(
      createNewWorkGroupFailure({
        error: e.message,
      })
    );
  }
}

function* editWorkgroupSaga({ payload, workGroupId }: EditWorkGroupRequest) {
  try {
    const response: AxiosResponse<any> = yield call(
      editWorkgroup,
      payload,
      workGroupId
    );
    yield put(
      editWorkGroupSuccess({
        workgroup: {
          ...payload,
          id: response.data.workGroupId,
        },
      })
    );
    yield put(
      addToastNotification({
        id: uuidv4(),
        text: 'Workgroup Updated Successfully',
        toastType: ToastType.SUCCESS,
      })
    );
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    yield put(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error: unable to edit workgroup',
        toastType: ToastType.ERROR,
      })
    );
    yield put(
      editWorkGroupFailure({
        error: e.message,
      })
    );
  }
}

export async function editWorkgroupRequestSaga(
  payload: EditWorkgroupData,
  workGroupId: number
) {
  try {
    const response: AxiosResponse<any> = await httpClient.put<any>(
      `/Users/editWorkGroup?workGroupId=${workGroupId}`,
      payload
    );

    createEditHelper(payload, workGroupId);

    store.dispatch(
      editWorkGroupSuccess({
        workgroup: {
          ...payload,
          id: response.data.workGroupId,
        },
      })
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Workgroup Updated Successfully',
        toastType: ToastType.SUCCESS,
      })
    );
    return true;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error: unable to edit workgroup',
        toastType: ToastType.ERROR,
      })
    );
    store.dispatch(
      editWorkGroupFailure({
        error: e.message,
      })
    );
    return false;
  }
}

function* fetchOrganizationSelectorData() {
  try {
    const response: AxiosResponse<OrganizationSelectorData> = yield call(
      getOrganizationSelectorData
    );
    validateResponse(response);
    yield put(fetchOrganizationSelectorDataSuccess(response.data));
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    yield put(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Unknown api error',
        toastType: ToastType.ERROR,
      })
    );
    yield put(
      fetchOrganizationSelectorDataFailure({
        error: e.message,
      })
    );
  }
}

function* getWorkGroupDataSaga() {
  try {
    const response: AxiosResponse<WorkGroupsData[]> = yield call(
      getWorkgroupData
    );
    yield put(getWorkGroupDataSuccess(response.data));
  } catch (e: any) {
    yield put(
      addToastNotification({
        id: uuidv4(),
        text: 'Error in Fetching WorkGroups',
        toastType: ToastType.ERROR,
      })
    );
    yield put(
      getWorkGroupDataFailure({
        error: e.message,
      })
    );
  }
}

function* getWorkGroupSelectedDataSaga({
  payload,
}: GetWorkGroupsSelectedDataRequest) {
  try {
    const response: AxiosResponse<WorkGroupsResponseData> = yield call(
      getWorkgroupSelectedData,
      payload
    );
    yield put(getWorkGroupSelectedDataSuccess(response.data));
  } catch (e: any) {
    yield put(
      addToastNotification({
        id: uuidv4(),
        text: 'Error in Fetching WorkGroup Data',
        toastType: ToastType.ERROR,
      })
    );
    yield put(
      getWorkGroupSelectedDataFailure({
        error: e.message,
      })
    );
  }
}

export async function fetchSelectorDatabyID(data: any) {
  const obj = JSON.parse(JSON.stringify(data));
  const str = Object.keys(obj)
    .map(function (key) {
      return `${key}=${obj[key]}`;
    })
    .join('&');
  try {
    const response: AxiosResponse<WorkGroupsResponseData> =
      await httpClient.get<WorkGroupsResponseData>(
        `/Repository/getSelectorDatabyID?${str}`
      );

    return response.data;
  } catch (e: any) {
    return null;
  }
}

export async function deleteWorkgroupSaga(workGroupId: number) {
  try {
    const response: AxiosResponse<any> = await httpClient.delete<any>(
      `/Users/deleteWorkGroup?workGroupId=${workGroupId}`
    );
    store.dispatch(
      deleteWorkGroupSuccess({
        message: response.data.response,
      })
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Workgroup Deleted Successfully',
        toastType: ToastType.SUCCESS,
      })
    );
    return true;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error: unable to delete workgroup',
        toastType: ToastType.ERROR,
      })
    );
    store.dispatch(
      deleteWorkGroupFailure({
        error: e.message,
      })
    );
    return false;
  }
}

export async function renameWorkgroupSaga(payload: RenameWorkGroup) {
  try {
    const response: AxiosResponse<any> = await httpClient.put<any>(
      `/Users/renameWorkGroup`,
      payload
    );
    store.dispatch(
      renameWorkGroupSuccess({
        message: response.data.message,
      })
    );
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Renamed Successfully',
        toastType: ToastType.SUCCESS,
      })
    );
    return true;
  } catch (e: any) {
    const message = !e.code ? e.message : handleApiError(e);
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: message || 'Error: unable to rename workgroup',
        toastType: ToastType.ERROR,
      })
    );
    store.dispatch(
      renameWorkGroupFailure({
        error: e.message,
      })
    );
    return false;
  }
}

export async function favoriteHelper(
  id: number,
  dataType: string,
  isfavorite: boolean
) {
  const workGroupsResponseData: WorkGroupsResponseData | null = JSON.parse(
    JSON.stringify(store.getState().chrome.workGroupsResponseData)
  );

  if (dataType === 'groups') {
    // --- groups handle for All Tab
    let groupData: GroupData[] = JSON.parse(
      JSON.stringify(store.getState().shared.groupData)
    );
    groupData = groupData.map((row) => {
      if (row && row?.id === id) {
        return { ...row, isFavorite: isfavorite };
      }
      return row;
    });
    store.dispatch(fetchGroupDataSuccess(groupData));
    // ---- groups handle for Work Group Tab
    if (workGroupsResponseData) {
      const groupsData = workGroupsResponseData.groupsData.map((row) => {
        if (row && row?.id === id) {
          return { ...row, isFavorite: isfavorite };
        }
        return row;
      });
      workGroupsResponseData.groupsData = groupsData;
      store.dispatch(getWorkGroupSelectedDataSuccess(workGroupsResponseData));
    }
  }
  if (dataType === 'prcatice') {
    // --- prcatice handle for All Tab
    let practiceData: PracticeData[] = JSON.parse(
      JSON.stringify(store.getState().shared.practiceData)
    );
    practiceData = practiceData.map((row) => {
      if (row && row?.id === id) {
        return { ...row, isFavorite: isfavorite };
      }
      return row;
    });
    store.dispatch(fetchPracticeDataSuccess(practiceData));
    // ---- prcatice handle for Work Group Tab
    if (workGroupsResponseData) {
      const practicesData = workGroupsResponseData.practicesData.map((row) => {
        if (row && row?.id === id) {
          return { ...row, isFavorite: isfavorite };
        }
        return row;
      });
      workGroupsResponseData.practicesData = practicesData;
      store.dispatch(getWorkGroupSelectedDataSuccess(workGroupsResponseData));
    }
  }
  if (dataType === 'facilities') {
    // --- facilities handle for All Tab
    let facilityData: FacilityData[] = JSON.parse(
      JSON.stringify(store.getState().shared.facilityData)
    );

    facilityData = facilityData.map((row) => {
      if (row && row?.id === id) {
        return { ...row, isFavorite: isfavorite };
      }
      return row;
    });
    store.dispatch(fetchFacilityDataSuccess(facilityData));

    // ---- facilities handle for Work Group Tab
    if (workGroupsResponseData) {
      const facilitiesData = workGroupsResponseData.facilitiesData.map(
        (row) => {
          if (row && row?.id === id) {
            return { ...row, isFavorite: isfavorite };
          }
          return row;
        }
      );
      workGroupsResponseData.facilitiesData = facilitiesData;
      store.dispatch(getWorkGroupSelectedDataSuccess(workGroupsResponseData));
    }
  }
  if (dataType === 'providers') {
    // --- providers handle for All Tab
    let providerData: ProviderData[] = JSON.parse(
      JSON.stringify(store.getState().shared.providerData)
    );
    providerData = providerData.map((row) => {
      if (row && row?.id === id) {
        return { ...row, isFavorite: isfavorite };
      }
      return row;
    });
    store.dispatch(fetchProviderDataSuccess(providerData));
    // ---- providers handle for Work Group Tab
    if (workGroupsResponseData) {
      const providersData = workGroupsResponseData.providersData.map((row) => {
        if (row && row?.id === id) {
          return { ...row, isFavorite: isfavorite };
        }
        return row;
      });
      workGroupsResponseData.providersData = providersData;
      store.dispatch(getWorkGroupSelectedDataSuccess(workGroupsResponseData));
    }
  }
}

export async function addFavoritesItemsSaga(payload: Favorites) {
  try {
    await httpClient.post<any>(`/Users/addFavorites`, payload);
    if (payload.groups && payload.groups.length && payload.groups[0]) {
      favoriteHelper(payload.groups[0], 'groups', true);
    }
    if (payload.practices && payload.practices.length && payload.practices[0]) {
      favoriteHelper(payload.practices[0], 'prcatice', true);
    }
    if (
      payload.facilities &&
      payload.facilities.length &&
      payload.facilities[0]
    ) {
      favoriteHelper(payload.facilities[0], 'facilities', true);
    }
    if (payload.providers && payload.providers.length && payload.providers[0]) {
      favoriteHelper(payload.providers[0], 'providers', true);
    }
    return true;
  } catch (e: any) {
    store.dispatch(
      addFavoritesFailure({
        error: e.message,
      })
    );
    return false;
  }
}

export async function unFavoritesItemsSaga(payload: Favorites) {
  try {
    await httpClient.put<any>(`/Users/unFavorites`, payload);
    if (payload.groups && payload.groups.length && payload.groups[0]) {
      favoriteHelper(payload.groups[0], 'groups', false);
    }
    if (payload.practices && payload.practices.length && payload.practices[0]) {
      favoriteHelper(payload.practices[0], 'prcatice', false);
    }
    if (
      payload.facilities &&
      payload.facilities.length &&
      payload.facilities[0]
    ) {
      favoriteHelper(payload.facilities[0], 'facilities', false);
    }
    if (payload.providers && payload.providers.length && payload.providers[0]) {
      favoriteHelper(payload.providers[0], 'providers', false);
    }
    return true;
  } catch (e: any) {
    store.dispatch(
      unFavoritesFailure({
        error: e.message,
      })
    );
    return false;
  }
}

export async function removeHelper(
  id: number,
  workGorupId: number,
  dataType: string
) {
  const workGroupsResponseData: WorkGroupsResponseData | null = JSON.parse(
    JSON.stringify(store.getState().chrome.workGroupsResponseData)
  );

  if (dataType === 'groups') {
    // --- groups handle for All Tab
    let removeGroupData: GroupData[] = JSON.parse(
      JSON.stringify(store.getState().shared.groupData)
    );
    removeGroupData = removeGroupData.map((row) => {
      if (row.id === id) {
        return {
          ...row,
          workGroups: row.workGroups.filter((m) => m !== workGorupId),
        };
      }
      return row;
    });
    store.dispatch(fetchGroupDataSuccess(removeGroupData));
    // --- groups handle for Work Group Tab
    if (workGroupsResponseData) {
      const groupData = workGroupsResponseData.groupsData.filter(
        (m) => m.id !== id
      );
      workGroupsResponseData.groupsData = groupData;
      store.dispatch(getWorkGroupSelectedDataSuccess(workGroupsResponseData));
    }
  }
  if (dataType === 'prcatice') {
    // --- prcatice handle for All Tab
    let practiceData: PracticeData[] = JSON.parse(
      JSON.stringify(store.getState().shared.practiceData)
    );
    practiceData = practiceData.map((row) => {
      if (row.id === id) {
        return {
          ...row,
          workGroups: row.workGroups.filter((m) => m !== workGorupId),
        };
      }
      return row;
    });
    store.dispatch(fetchPracticeDataSuccess(practiceData));
    // --- prcatice handle for Work Group Tab
    if (workGroupsResponseData) {
      const practicesData = workGroupsResponseData.practicesData.filter(
        (m) => m.id !== id
      );
      workGroupsResponseData.practicesData = practicesData;
      store.dispatch(getWorkGroupSelectedDataSuccess(workGroupsResponseData));
    }
  }
  if (dataType === 'facilities') {
    // --- facilities handle for All Tab
    let facilityData: FacilityData[] = JSON.parse(
      JSON.stringify(store.getState().shared.facilityData)
    );
    facilityData = facilityData.map((row) => {
      if (row.id === id) {
        return {
          ...row,
          workGroups: row.workGroups.filter((m) => m !== workGorupId),
        };
      }
      return row;
    });
    store.dispatch(fetchFacilityDataSuccess(facilityData));
    // --- facilities handle for Work Group Tab
    if (workGroupsResponseData) {
      const facilitiesData = workGroupsResponseData.facilitiesData.filter(
        (m) => m.id !== id
      );
      workGroupsResponseData.facilitiesData = facilitiesData;
      store.dispatch(getWorkGroupSelectedDataSuccess(workGroupsResponseData));
    }
  }
  if (dataType === 'providers') {
    // --- providers handle for All Tab
    let providerData: ProviderData[] = JSON.parse(
      JSON.stringify(store.getState().shared.providerData)
    );
    providerData = providerData.map((row) => {
      if (row.id === id) {
        return {
          ...row,
          workGroups: row.workGroups.filter((m) => m !== workGorupId),
        };
      }
      return row;
    });
    store.dispatch(fetchProviderDataSuccess(providerData));
    // --- providers handle for Work Group Tab
    if (workGroupsResponseData) {
      const providersData = workGroupsResponseData.providersData.filter(
        (m) => m.id !== id
      );
      workGroupsResponseData.providersData = providersData;
      store.dispatch(getWorkGroupSelectedDataSuccess(workGroupsResponseData));
    }
  }
}

export async function removeWorkGroupItemSaga(
  payload: RemoveFromWorkGroupType
) {
  try {
    type RemoveFromWorkGroup = {
      workGroupID: number;
      groups?: number[];
      practices?: number[];
      facilities?: number[];
      providers?: number[];
    };

    const obj: RemoveFromWorkGroup = {
      workGroupID: payload.workGroupID,
      groups: payload.groups,
      practices: payload.practices,
      facilities: payload.facilities,
      providers: payload.providers,
    };

    await httpClient.delete<any>(`/Users/removeFromWorkGroup`, { data: obj });

    if (payload.groups && payload.groups.length && payload.groups[0]) {
      removeHelper(payload.groups[0], payload.workGroupID, 'groups');
    }
    if (payload.practices && payload.practices.length && payload.practices[0]) {
      removeHelper(payload.practices[0], payload.workGroupID, 'prcatice');
    }
    if (
      payload.facilities &&
      payload.facilities.length &&
      payload.facilities[0]
    ) {
      removeHelper(payload.facilities[0], payload.workGroupID, 'facilities');
    }
    if (payload.providers && payload.providers.length && payload.providers[0]) {
      removeHelper(payload.providers[0], payload.workGroupID, 'providers');
    }
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Item Successfully removed',
        toastType: ToastType.SUCCESS,
      })
    );
    return true;
  } catch (e: any) {
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Error: unable to remove item',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}

export async function getAllFavoritiesDataSaga() {
  try {
    const response: AxiosResponse<AllFavoritesData> = await httpClient.get<any>(
      `/Repository/getFavorites`
    );
    store.dispatch(fetchAllFavoritiesDataSuccess(response.data));
    return true;
  } catch (e: any) {
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Error in Fetching Favorities',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}

export async function searchOrganizationSelectorSaga(searchValue: string) {
  try {
    const response: AxiosResponse<OrganizationSearchDropdownData> =
      await httpClient.get<any>(
        `/Repository/searchOrganizationSelector?searchValue=${searchValue}`
      );
    store.dispatch(getSearchOrganizationData(response.data));
    return true;
  } catch (e: any) {
    store.dispatch(
      addToastNotification({
        id: uuidv4(),
        text: 'Error in Fetching search data',
        toastType: ToastType.ERROR,
      })
    );
    return false;
  }
}

export async function addRecentHistoryRequestSaga(
  addRecentData: AddRecentsData
) {
  try {
    await httpClient.post<any>(`/Users/addRecents`, addRecentData);
    return true;
  } catch (e: any) {
    return false;
  }
}

export async function getRecnetTabDataSaga() {
  try {
    const response: AxiosResponse<AllRecentTabData[]> =
      await httpClient.get<any>(`/Repository/getRecents`);
    store.dispatch(getRecentTabAllData(response.data));
    return response.data;
  } catch (e: any) {
    return false;
  }
}

function* chromeSaga() {
  yield all([
    takeLatest(FETCH_NOTIFICATION_REQUEST, fetchNotificationSaga),
    takeLatest(CREATE_NEW_WORKGROUP_REQUEST, createNewWorkgroupSaga),
    takeLatest(EDIT_WORKGROUP_REQUEST, editWorkgroupSaga),
    takeLatest(
      GET_ORGANIZATION_SELECTOR_DATA_REQUEST,
      fetchOrganizationSelectorData
    ),
    takeLatest(GET_WORKGROUPS_DATA_REQUEST, getWorkGroupDataSaga),
    takeLatest(
      GET_WORKGROUPS_SELECTED_DATA_REQUEST,
      getWorkGroupSelectedDataSaga
    ),
  ]);
}

export default chromeSaga;
