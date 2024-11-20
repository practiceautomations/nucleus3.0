import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import type {
  GridColDef,
  GridRowId,
  GridRowParams,
} from '@mui/x-data-grid-pro';
import {
  GRID_CHECKBOX_SELECTION_COL_DEF,
  GRID_DETAIL_PANEL_TOGGLE_COL_DEF,
} from '@mui/x-data-grid-pro';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { InsuranceDetailsModal } from '@/components/AllClaimsModals/InsuranceDetailsModal';
import Icon from '@/components/Icon';
import Tabs from '@/components/OrganizationSelector/Tabs';
import ScrubingResponseModal from '@/components/ScrubbingResponse';
import AppDatePicker from '@/components/UI/AppDatePicker';
import Badge from '@/components/UI/Badge';
import Button, { ButtonType } from '@/components/UI/Button';
import type { ButtonSelectDropdownDataType } from '@/components/UI/ButtonSelectDropdown';
import ButtonSelectDropdown from '@/components/UI/ButtonSelectDropdown';
import ButtonSelectDropdownForExport from '@/components/UI/ButtonSelectDropdownForExport';
import AssignClaimToModal from '@/components/UI/ClaimDetailsModals/AssignClaimToModal';
import CreateTaskModal from '@/components/UI/ClaimDetailsModals/CreateTask';
import CloseButton from '@/components/UI/CloseButton';
import type { FilterModalTabProps } from '@/components/UI/FilterModal';
import FilterModal from '@/components/UI/FilterModal';
import InputField from '@/components/UI/InputField';
import Modal from '@/components/UI/Modal';
import type { MultiSelectViewDataType } from '@/components/UI/MultiSelectView/MultiSelectView';
// eslint-disable-next-line import/no-cycle
import PaymentPosting from '@/components/UI/PaymentPosting';
import RadioButton from '@/components/UI/RadioButton';
import SearchDetailGrid, {
  globalPaginationConfig,
} from '@/components/UI/SearchDetailGrid';
import SearchGridExpandabkeRowModal from '@/components/UI/SearchGridExpandableRowModal';
import SectionHeading from '@/components/UI/SectionHeading';
import type { SingleSelectDropDownDataType } from '@/components/UI/SingleSelectDropDown';
import SingleSelectDropDown from '@/components/UI/SingleSelectDropDown';
import type { StatusDetailModalDataType } from '@/components/UI/StatusDetailModal';
import StatusDetailModal from '@/components/UI/StatusDetailModal';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import type { TableSearchBarDropdownDataType } from '@/components/UI/TableSearchBarDropdown';
import TableSearchBarDropdown from '@/components/UI/TableSearchBarDropdown';
import TextArea from '@/components/UI/TextArea';
import WarningModal from '@/components/UI/WarningModal';
import { AddEditViewNotes } from '@/components/ViewNotes';
// eslint-disable-next-line import/no-cycle
import {
  currencyFormatter,
  CustomDetailPanelToggle,
  usdPrice,
} from '@/pages/app/all-claims';
// eslint-disable-next-line import/no-cycle
import {
  getErrorSelector,
  getselectdWorkGroupsIDsSelector,
} from '@/store/chrome/selectors';
import {
  addToastNotification,
  getArManagerOpenAtGlanceData,
  getLookupDropdownsRequest,
  setGlobalModal,
} from '@/store/shared/actions';
import {
  changeClaimsStatuses,
  changeClaimStatus,
  claimsScrubing,
  fetchARClaimsSearchChargesData,
  fetchARClaimsSearchData,
  fetchARClaimsSearchDataClaimIDS,
  fetchARClaimsSearchStatusCategories,
  fetchPostingDate,
  forceFullyScrub,
  getAllClaimsAssigneeData,
  getAllClaimsExpandRowDataById,
  getARClaimsTableSearch,
  getClaimAssignToData,
  getScrubingAPIResponce,
  getTaskDataById,
  submitClaim,
  // voidClaim,
  voidClaims,
} from '@/store/shared/sagas';
import {
  getArManagerOpenAtGlanceSelector,
  getLookupDropdownsDataSelector,
} from '@/store/shared/selectors';
import type {
  AllClaimsExpandRowResult,
  AllClaimsScrubResponseResult,
  ArManagerOpenAtGlanceData,
  AssignClaimToData,
  ClaimsSubmitRequest,
  GetARClaimsSearchDataCriteria,
  GetARClaimsSearchDataResult,
  GetARClaimsSectionCategories,
  LookupClaimStatusDataType,
  LookupDropdownsData,
  LookupDropdownsDataType,
  PostingDateCriteria,
  TaskGridData,
} from '@/store/shared/types';
import { ToastType } from '@/store/shared/types';
import type {
  DownloadDataPDFDataType,
  PDFColumnInput,
  PDFRowInput,
} from '@/utils';
import { ExportDataToCSV, ExportDataToDrive, ExportDataToPDF } from '@/utils';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';
import { DateToStringPipe } from '@/utils/dateConversionPipes';

import type { PrintChildRef } from './all-claims-tab';

interface SearchCritereaType {
  parameter: SingleSelectDropDownDataType | null;
  dateRange: SingleSelectDropDownDataType | null;
  startDate: Date | null;
  endDate: Date | null;
  claimType: SingleSelectDropDownDataType | null;
}

// basically forward ref use for call the function from parent to child
// eslint-disable-next-line react/display-name
const ARClaimsTab = forwardRef<PrintChildRef>((_, ref) => {
  // const router = useRouter();
  const dispatch = useDispatch();
  // const [routePath, setRoutePath] = useState<string | undefined>();
  const [detailPanelExpandedRowIds, setDetailPanelExpandedRowIds] = useState<
    GridRowId[]
  >([]);
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] =
    useState<boolean>(false);

  const [exportType, setExportType] = useState('');
  const [reportCheck, setReportCheck] = useState('Claim');
  const [reportModal, setReportModal] = useState(false);
  const [noteSliderOpen, setNoteSliderOpen] = useState(false);
  const [submitSingleClaim, setSubmitSingleClaim] = useState<boolean>(false);
  const [showErrorMesaage, setShowErrorMesaage] = useState<boolean>(false);
  const [changeStatus, setChangeStatus] = useState<boolean>(false);
  const [statusValue, setStatusValue] = useState<string>();
  const [action, setAction] = useState<string>();
  const [editNote, setEditNote] = useState<string>();
  const [selectedInsuranceID, setSelectedInsuranceID] = useState<number>();
  const [selectedGroup] = useState<SingleSelectDropDownDataType | undefined>();

  const [assignClaimToData, setAssignClaimToData] =
    useState<AssignClaimToData[]>();
  const [createTaskModal, setCreateTaskModal] = useState<{
    open: boolean;
    claimID?: number;
    patientID?: number;
    selectedTaskData?: TaskGridData;
    taskModalInEditMode?: boolean;
  }>({ open: false });

  const [expandedRowData, setExpandedRowData] = useState<
    {
      id: GridRowId;
      data: AllClaimsExpandRowResult[];
    }[]
  >([]);

  const [showPaymentPostingPopUp, setShowPaymentPostingPopUp] =
    React.useState(false);
  const [postPaymentData, setPostPaymentData] =
    useState<GetARClaimsSearchDataResult>();

  const [postingDateModel, setPostingDateModel] = useState({
    type: '',
    show: false,
  });
  const [voidPostingDate, setVoidPostingDate] = useState<string>('');

  const getExpandableRowData = async (claimId: GridRowId | undefined) => {
    if (claimId) {
      const res = await getAllClaimsExpandRowDataById(claimId);
      if (res) {
        setExpandedRowData((prevData) => [
          ...prevData,
          { id: claimId, data: res },
        ]);
      }
    }
  };
  const handleDetailPanelExpandedRowIdsChange = useCallback(
    (newIds: GridRowId[]) => {
      const selectedId = newIds.filter(
        (id) => !detailPanelExpandedRowIds.includes(id)
      )[0];
      getExpandableRowData(selectedId);
      setDetailPanelExpandedRowIds(newIds);
    },
    [detailPanelExpandedRowIds]
  );
  const [filterModalTabs, setFilterModalTabs] = React.useState<
    FilterModalTabProps[]
  >([]);
  const selectedWorkGroupData = useSelector(getselectdWorkGroupsIDsSelector);
  const [isAssignClaimToModalOpen, setIsAssignClaimToModalOpen] =
    useState(false);
  // useEffect(() => {
  //   if (routePath) {
  //     router.push(routePath);
  //   }
  // }, [routePath]);
  const assignClaimData = async () => {
    const claimAssigneeData = await getClaimAssignToData(
      selectedWorkGroupData?.groupsData[0]?.id
    );
    if (claimAssigneeData) {
      setAssignClaimToData(claimAssigneeData);
    }
  };
  const initProfile = () => {
    dispatch(getLookupDropdownsRequest());
    assignClaimData();
  };
  useEffect(() => {
    initProfile();
  }, []);

  // Table Menu Tabs
  interface TabProps {
    id: number | undefined;
    name: string;
    count?: number | undefined;
  }
  const [tabs, setTabs] = useState<TabProps[]>([
    {
      id: undefined,
      name: 'All',
      count: 0,
    },
  ]);
  const lookupsData = useSelector(getLookupDropdownsDataSelector);
  const [changeStatusToDropdownList, setStatusDropDown] = useState<
    LookupDropdownsDataType[]
  >([]);
  const [claimStatusData, setClaimStatusData] = useState<LookupDropdownsData>();
  const [changedStatusVal, setChangedStatusVal] =
    useState<SingleSelectDropDownDataType>();
  const [selectedAssigneeData, setSelectedAssigneeData] = useState<
    MultiSelectViewDataType[]
  >([]);
  const getAssigneeData = async (clientIDs: string) => {
    if (clientIDs) {
      const res = await getAllClaimsAssigneeData(clientIDs);
      if (res) {
        setSelectedAssigneeData(res);
      }
    }
  };
  useEffect(() => {
    if (selectedWorkGroupData?.groupsData) {
      getAssigneeData(
        selectedWorkGroupData?.groupsData?.map((m) => m.id).join(',')
      );
    }
  }, [selectedWorkGroupData]);
  // Filter modal Tabs
  const FillingData = [
    {
      id: 1,
      value: 'Timely Filed',
      active: true,
    },
    {
      id: 2,
      value: 'Not Timely Filed',
      active: true,
    },
  ];
  const DaysAging = [
    {
      id: 1,
      value: '120 days +',
      active: true,
    },
    {
      id: 2,
      value: '60 - 90 days',
      active: true,
    },
    {
      id: 3,
      value: '30 - 60 days',
      active: true,
    },
    {
      id: 4,
      value: '15 - 30 days',
      active: true,
    },
    {
      id: 5,
      value: '7 - 15 days',
      active: true,
    },
    {
      id: 6,
      value: '7 days -',
      active: true,
    },
  ];

  const valueRanges = [
    {
      id: 1,
      value: '$10,000 +',
      active: true,
    },
    {
      id: 2,
      value: '$5,000 - $10,000',
      active: true,
    },
    {
      id: 3,
      value: '$1,000 - $5,000',
      active: true,
    },
    {
      id: 4,
      value: '$100 - $1,000',
      active: true,
    },
    {
      id: 5,
      value: '$100 -',
      active: true,
    },
  ];
  const [categorizedClaimStatus, setCategorizedClaimStatus] = useState<
    MultiSelectViewDataType[]
  >([]);
  useEffect(() => {
    if (lookupsData?.claimStatus) {
      interface GroupedData {
        [categoryID: number]: LookupClaimStatusDataType[];
      }
      const grouped = lookupsData.claimStatus.reduce(
        (acc: GroupedData, curr: LookupClaimStatusDataType) => {
          if (acc[curr.categoryID]) {
            acc[curr.categoryID]?.push(curr);
          } else {
            acc[curr.categoryID] = [curr];
          }
          return acc;
        },
        {}
      );
      const sorted = Object.entries(grouped)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([categoryID, data]) => {
          return {
            id: Number(categoryID),
            value: data[0].categoryName,
            claimStatus: data,
          };
        });
      const output = Object.values(sorted).flat();
      const something: MultiSelectViewDataType[] = [];
      for (let i = 0; i < output.length; i += 1) {
        const randomNum = Math.floor(Math.random() * 900000) + 100000;
        something.push({
          id: randomNum,
          value: output[i]?.value,
          active: false,
        });
        for (let j = 0; j < output[i]?.claimStatus.length; j += 1) {
          something.push({
            id: output[i]?.claimStatus[j]?.id,
            value: output[i]?.claimStatus[j]?.value,
            active: true,
          });
        }
      }
      setCategorizedClaimStatus(something);
    }
  }, [lookupsData?.claimStatus]);
  useEffect(() => {
    if (lookupsData) {
      setClaimStatusData(lookupsData);
    }
  }, [lookupsData]);
  useEffect(() => {
    if (
      lookupsData &&
      lookupsData.placeOfService &&
      selectedAssigneeData &&
      categorizedClaimStatus
    ) {
      setFilterModalTabs([
        {
          id: 1,
          name: 'Claim Status',
          active: true,
          count: 0,
          showSearchBar: true,
          selectedValue: [],
          data: categorizedClaimStatus,
        },
        {
          id: 2,
          name: 'Submission Type',
          active: false,
          count: 0,
          selectedValue: [],
          data: lookupsData.submitStatus.map((m) => ({
            id: m.id,
            value: m.value,
            active: true,
          })),
        },
        {
          id: 3,
          name: 'T. Filling',
          active: false,
          isSingleSelection: true,
          count: 0,
          selectedValue: [],
          data: FillingData,
        },
        {
          id: 4,
          name: 'Scrub Status',
          active: false,
          count: 0,
          selectedValue: [],
          data: lookupsData.scrubStatus.map((m) => ({
            id: m.id,
            value: m.value,
            active: true,
          })),
        },
        {
          id: 5,
          name: 'Days Aging',
          active: false,
          isSingleSelection: true,
          count: 0,
          selectedValue: [],
          data: DaysAging,
        },
        {
          id: 6,
          name: 'Value Range',
          active: false,
          isSingleSelection: true,
          count: 0,
          selectedValue: [],
          data: valueRanges,
        },
        {
          id: 7,
          name: 'PoS',
          active: false,
          count: 0,
          showSearchBar: true,
          selectedValue: [],
          data: lookupsData.placeOfService.map((m) => ({
            id: m.id,
            value: m.value,
            active: true,
          })),
        },
        {
          id: 8,
          name: 'Assigned to',
          active: false,
          count: 0,
          showSearchBar: true,
          selectedValue: [],
          data: selectedAssigneeData.map((m) => ({
            id: m.id,
            value: m.value,
            appendText: m.appendText,
            active: true,
          })),
        },
      ]);
    }
  }, [lookupsData, selectedAssigneeData, categorizedClaimStatus]);
  const parameterDropdownList = [
    { id: 1, value: 'Claim Creation Date' },
    { id: 2, value: 'Date of Service' },
    { id: 3, value: 'Submission Date' },
  ];

  const dateRangeDropdownList = [
    { id: 1, value: 'Custom' },
    { id: 2, value: 'All Dates' },
    { id: 7, value: 'Last 7 Days' },
    { id: 15, value: 'Last 15 Days' },
    { id: 30, value: 'Last 30 Days' },
    { id: 60, value: 'Last 60 Days' },
    { id: 90, value: 'Last 90 Days' },
    { id: 120, value: 'Last 120 Days' },
  ];
  const claimTypeData = [
    { id: 1, value: 'Professional Claims' },
    { id: 2, value: 'Institutional Claims' },
  ];
  const [searchCriterea, setSearchCriterea] = useState<SearchCritereaType>({
    parameter: parameterDropdownList[0] || null,
    dateRange: dateRangeDropdownList[1] || null,
    startDate: null,
    endDate: null,
    claimType: claimTypeData[0] || null,
  });
  useEffect(() => {
    let startDate: Date | null = null;
    let endDate: Date | null = null;
    if (
      searchCriterea?.dateRange &&
      searchCriterea.dateRange.id !== 1 &&
      searchCriterea.dateRange.id !== 2
    ) {
      startDate = new Date();
      endDate = new Date();
      const numberOfDays = searchCriterea.dateRange.id;
      const dateOffset = 24 * 60 * 60 * 1000 * numberOfDays;
      startDate.setTime(startDate.getTime() - dateOffset);
    }
    setSearchCriterea({
      ...searchCriterea,
      endDate,
      startDate,
    });
  }, [searchCriterea.dateRange]);

  const defaultSearchDataCriteria: GetARClaimsSearchDataCriteria = {
    groupID: undefined,
    fromCreatedOn: undefined,
    toCreatedOn: undefined,
    fromDOS: undefined,
    toDOS: undefined,
    fromSubmissionDate: undefined,
    toSubmissionDate: undefined,
    scrubStatusIDS: '',
    claimStatusIDS: '',
    submitStatusIDS: '',
    timelyFiling: undefined,
    fromAgingDays: undefined,
    toAgingDays: undefined,
    fromFee: undefined,
    toFee: undefined,
    posIDS: '',
    assignedTo: '',
    claimIDSearch: '',
    patientSearch: '',
    dosSearch: '',
    insuranceSearch: '',
    arByFollowUP: '',
    arByWorkDate: '',
    getAllData: false,
    getOnlyIDS: false,
    sortColumn: '',
    sortOrder: '',
    pageNumber: 1,
    pageSize: globalPaginationConfig.activePageSize,
  };
  const [searchDataCriteria, setSearchDataCriteria] = useState(
    defaultSearchDataCriteria
  );
  const [lastSearchDataCriteria, setLastSearchDataCriteria] = useState(
    defaultSearchDataCriteria
  );
  const [totalCount, setTotalCount] = useState<number>();
  const [searchResult, setSearchResult] = useState<
    GetARClaimsSearchDataResult[]
  >([]);
  const [statsResult, setStatsResult] =
    useState<GetARClaimsSectionCategories>();
  const [selectRows, setSelectRows] = useState<number[]>([]);
  const arManagernavigationSelectorData = useSelector(
    getArManagerOpenAtGlanceSelector
  );
  const [arManagernavigationData, setArManagernavigationData] =
    useState<ArManagerOpenAtGlanceData | null>(null);
  useEffect(() => {
    if (arManagernavigationSelectorData) {
      setArManagernavigationData(arManagernavigationSelectorData);
    }
  }, [arManagernavigationSelectorData]);
  const [isClaimTypeChanged, setClaimTypeChanged] = useState(false);
  const getARClaimsSearchData = async (
    criterea: GetARClaimsSearchDataCriteria
  ) => {
    if (!selectedWorkGroupData) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Please Select a Group/Workgroup from Organization Selector',
          toastType: ToastType.ERROR,
        })
      );
      return;
    }

    const res = await fetchARClaimsSearchData(criterea);
    if (res) {
      setLastSearchDataCriteria(JSON.parse(JSON.stringify(criterea)));
      setTotalCount(res[0]?.total || 0);
      setSearchResult(res);
      setClaimTypeChanged(false);
    }
  };

  const getARClaimsSectionCategories = async () => {
    if (!selectedWorkGroupData) {
      return;
    }

    const { startDate, endDate } = searchCriterea;
    const { id } = searchCriterea.parameter || {};
    const obj = {
      groupID: selectedWorkGroupData?.groupsData[0]?.id,
      fromDOS: id === 2 && startDate ? startDate : undefined,
      toDOS: id === 2 && endDate ? endDate : undefined,
      fromCreatedOn: id === 1 && startDate ? startDate : undefined,
      toCreatedOn: id === 1 && endDate ? endDate : undefined,
      fromSubmissionDate: id === 3 && startDate ? startDate : undefined,
      toSubmissionDate: id === 3 && endDate ? endDate : undefined,
      claimCaseTypeID: searchCriterea.claimType?.id,
    };

    const res = await fetchARClaimsSearchStatusCategories(
      JSON.parse(JSON.stringify(obj))
    );
    if (res) {
      const filteredTabs = [
        ...tabs
          .filter((f) => !f.id)
          .map((d) => {
            return { ...d, count: !d.id ? res.totalCount : d.count };
          }),
      ];
      setTabs(filteredTabs);
      setStatsResult(res);
    }
  };

  const onSelectAll = async () => {
    if (searchResult.length === 0) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'No data to select!',
          toastType: ToastType.ERROR,
        })
      );
      return;
    }

    if (selectRows.length === totalCount) {
      setSelectRows([]);
      return;
    }
    if (lastSearchDataCriteria) {
      const res = await fetchARClaimsSearchDataClaimIDS(lastSearchDataCriteria);
      if (res) setSelectRows(res);
    }
  };

  const findDataAndResetParams = (
    criteria: GetARClaimsSearchDataCriteria,
    preventResetType?: string
  ) => {
    const { arByFollowUP, arByWorkDate } = criteria;
    const obj = {
      ...criteria,
      arByFollowUP: preventResetType === 'statsParams' ? arByFollowUP : '',
      arByWorkDate: preventResetType === 'statsParams' ? arByWorkDate : '',
      sortColumn: '',
      sortOrder: '',
      pageNumber: 1,
    };
    setSearchDataCriteria(obj);
    getARClaimsSearchData(obj);
    setSelectRows([]);
  };

  const gridRef = useRef<HTMLTableRowElement>(null);

  const onSelectStateCategories = (criteria: GetARClaimsSearchDataCriteria) => {
    findDataAndResetParams(criteria, 'statsParams');
    gridRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const onCinfirm = () => {
    const { startDate, endDate } = searchCriterea;
    const { id } = searchCriterea.parameter || {};

    const obj: GetARClaimsSearchDataCriteria = {
      ...searchDataCriteria,
      claimCaseTypeID: searchCriterea.claimType?.id,
      groupID: selectedWorkGroupData?.groupsData[0]?.id,
      fromDOS: id === 2 && startDate ? startDate : undefined,
      toDOS: id === 2 && endDate ? endDate : undefined,
      fromCreatedOn: id === 1 && startDate ? startDate : undefined,
      toCreatedOn: id === 1 && endDate ? endDate : undefined,
      fromSubmissionDate: id === 3 && startDate ? startDate : undefined,
      toSubmissionDate: id === 3 && endDate ? endDate : undefined,
    };
    findDataAndResetParams(obj);
    getARClaimsSectionCategories();
  };

  const isLoaded = useRef(false);
  useEffect(() => {
    if (!isLoaded.current && !searchCriterea.startDate) {
      onCinfirm();
      isLoaded.current = true;
    }
  }, [searchCriterea.startDate]);
  interface ActivefiltersProps {
    id: number | undefined;
    value: string;
    type: string | undefined;
  }
  const [selectedSearchBarDropdown, setSelectedSearchBarDropdown] =
    useState<TableSearchBarDropdownDataType>();
  const [activefilters, setActivefilters] = useState<ActivefiltersProps[]>([]);
  const [activeFiltersOfFilterModal, setActiveFiltersOfFilterModal] = useState<
    FilterModalTabProps[]
  >([]);
  const [searchWithFiltersCriteria, setSearchWithFiltersCriteria] = useState<
    FilterSearchCriteria | undefined
  >();
  interface FilterSearchCriteria {
    claimStatusIDS?: string | undefined;
    submitStatusIDS?: string | undefined;
    timelyFiling?: boolean | undefined;
    scrubStatusIDS?: string | undefined;
    fromAgingDays?: number | undefined;
    toAgingDays?: number | undefined;
    posIDS?: string | undefined;
    assignedTo?: string | undefined;
    fromFee?: number | undefined;
    toFee?: number | undefined;
  }
  const onDeselectActivefilters = (res: ActivefiltersProps) => {
    let filteredActiveFilterss;
    const tabName = activeFiltersOfFilterModal.find((tab) =>
      tab.data.find(
        (status) => status.id === res.id && status.value === res.value
      )
    )?.name;
    const tabID = activeFiltersOfFilterModal.find((tab) =>
      tab.data.find(
        (status) => status.id === res.id && status.value === res.value
      )
    )?.id;
    if (res.type === tabName) {
      filteredActiveFilterss = activefilters.filter((m) => m.id !== res.id);
      setFilterModalTabs((prevState) =>
        prevState?.map((tab) => {
          if (tab.id === tabID) {
            const updatedSelectedValue = tab.selectedValue.filter(
              (item) => item.id !== res.id && item.value !== res.value
            );
            return {
              ...tab,
              selectedValue: updatedSelectedValue,
              count: updatedSelectedValue.length,
            };
          }
          return tab;
        })
      );
    } else {
      filteredActiveFilterss = activefilters.filter((m) => m.type !== res.type);
    }
    setActivefilters(filteredActiveFilterss);
    if (res.type === 'selectSearchBarDropdown') {
      setSelectedSearchBarDropdown(undefined);
      onSelectStateCategories({
        ...searchDataCriteria,
        claimIDSearch: '',
        patientSearch: '',
        dosSearch: '',
        insuranceSearch: '',
      });
    } else if (res.type === tabName) {
      if (res.type === 'Claim Status') {
        const claimStatuses = searchWithFiltersCriteria?.claimStatusIDS
          ? searchWithFiltersCriteria?.claimStatusIDS.split(',')
          : [];
        for (let i = 0; i < claimStatuses.length; i += 1) {
          if (claimStatuses[i] === res.id?.toString()) {
            claimStatuses.splice(i, 1);
            setSearchWithFiltersCriteria({
              ...searchWithFiltersCriteria,
              claimStatusIDS: claimStatuses.join(','),
            });
          }
        }
      }
      if (res.type === 'Submission Type') {
        const submitStatus = searchWithFiltersCriteria?.submitStatusIDS
          ? searchWithFiltersCriteria?.submitStatusIDS.split(',')
          : [];
        for (let i = 0; i < submitStatus.length; i += 1) {
          if (submitStatus[i] === res.id?.toString()) {
            submitStatus.splice(i, 1);
            setSearchWithFiltersCriteria({
              ...searchWithFiltersCriteria,
              submitStatusIDS: submitStatus.join(','),
            });
          }
        }
      }
      if (res.type === 'Scrub Status') {
        const scrubStatuses = searchWithFiltersCriteria?.scrubStatusIDS
          ? searchWithFiltersCriteria?.scrubStatusIDS.split(',')
          : [];
        for (let i = 0; i < scrubStatuses.length; i += 1) {
          if (scrubStatuses[i] === res.id?.toString()) {
            scrubStatuses.splice(i, 1);
            setSearchWithFiltersCriteria({
              ...searchWithFiltersCriteria,
              scrubStatusIDS: scrubStatuses.join(','),
            });
          }
        }
      }
      if (res.type === 'T. Filling') {
        setSearchWithFiltersCriteria({
          ...searchWithFiltersCriteria,
          timelyFiling: undefined,
        });
      }
      if (res.type === 'Days Aging') {
        setSearchWithFiltersCriteria({
          ...searchWithFiltersCriteria,
          toAgingDays: undefined,
          fromAgingDays: undefined,
        });
      }
      if (res.type === 'PoS') {
        const pos = searchWithFiltersCriteria?.posIDS
          ? searchWithFiltersCriteria?.posIDS.split(',')
          : [];
        for (let i = 0; i < pos.length; i += 1) {
          if (pos[i] === res.id?.toString()) {
            pos.splice(i, 1);
            setSearchWithFiltersCriteria({
              ...searchWithFiltersCriteria,
              posIDS: pos.join(','),
            });
          }
        }
      }
      if (res.type === 'Assigned To') {
        const assigneddTo = searchWithFiltersCriteria?.assignedTo
          ? searchWithFiltersCriteria?.assignedTo.split(',')
          : [];
        for (let i = 0; i < assigneddTo.length; i += 1) {
          if (assigneddTo[i] === res.id?.toString()) {
            assigneddTo.splice(i, 1);
            setSearchWithFiltersCriteria({
              ...searchWithFiltersCriteria,
              assignedTo: assigneddTo.join(','),
            });
          }
        }
      }
      if (res.type === 'Value Range') {
        setSearchWithFiltersCriteria({
          ...searchWithFiltersCriteria,
          toFee: undefined,
          fromFee: undefined,
        });
      }
    } else {
      onSelectStateCategories({
        ...searchDataCriteria,
        arByFollowUP: '',
        arByWorkDate: '',
      });
    }
  };
  const [loadFilterModal, setLoadFilterModal] = useState(false);
  useEffect(() => {
    if (
      statsResult &&
      arManagernavigationData &&
      arManagernavigationData?.actionType === 'TimelyFiling'
    ) {
      setSearchDataCriteria({
        ...searchDataCriteria,
        arByFollowUP: arManagernavigationData?.viewBy || '',
        arByWorkDate: '',
      });
      onSelectStateCategories({
        ...searchDataCriteria,
        arByFollowUP: arManagernavigationData?.viewBy || '',
        arByWorkDate: '',
      });
      dispatch(getArManagerOpenAtGlanceData(null));
      setArManagernavigationData(null);
    }
  }, [arManagernavigationData, statsResult]);

  useEffect(() => {
    const { arByFollowUP, arByWorkDate } = searchDataCriteria;
    const filterIds = [
      'arByFollowUP',
      'arByWorkDate',
      'selectSearchBarDropdown',
    ];
    let filteredActiveFilterss = [
      ...activefilters.filter((m) => m.type && !filterIds.includes(m.type)),
    ];

    filteredActiveFilterss = filteredActiveFilterss.filter((m) => !!m.id);
    if (!arByFollowUP && !arByWorkDate && activefilters.length === 0) {
      const tabss = tabs.find((m) => m.id === undefined);
      filteredActiveFilterss.push({
        id: tabss?.id || undefined,
        value: tabss?.name ? 'All Claims' : '',
        type: 'All',
      });
    }
    if (arByFollowUP) {
      filteredActiveFilterss.push(
        ...(statsResult?.arClaimsByFollowUPDays
          .filter((f) => f.id === Number(arByFollowUP))
          .map((d) => {
            return {
              id: d.id,
              value: d.value,
              type: 'arByFollowUP',
            };
          }) || [])
      );
    }
    if (arByWorkDate) {
      filteredActiveFilterss.push(
        ...(statsResult?.arClaimsByWorkDates
          .filter((f) => f.id === Number(arByWorkDate))
          .map((d) => {
            return {
              id: d.id,
              value: d.value,
              type: 'arByWorkDate',
            };
          }) || [])
      );
    }
    if (selectedSearchBarDropdown) {
      const v = selectedSearchBarDropdown;
      let value = '';

      if (v?.type === 'claim') {
        value = v.value;
      } else if (v?.type === 'patient') {
        value = `Patient: ${v.value}`;
      } else if (v?.type === 'dos') {
        value = `DoS: ${v.value}`;
      } else if (v?.type === 'insurance') {
        value = `Insurance: ${v.value}`;
      }

      filteredActiveFilterss.push({
        id: v.id,
        value,
        type: 'selectSearchBarDropdown',
      });
    }
    setActivefilters(filteredActiveFilterss);
  }, [searchDataCriteria]);

  const getCategoriesCurrentTab = () => {
    const { arByFollowUP, arByWorkDate } = searchDataCriteria;
    let tabss: TabProps | {} = {};
    if (!arByFollowUP && !arByWorkDate) {
      tabss = tabs.find((m) => m.id === undefined) || {};
    }
    return tabss;
  };

  const getScrubingResponce = async (id: number) => {
    const res = await getScrubingAPIResponce(id);
    if (res) {
      // Open two new windows for the response and adnareResponse
      const responseWindow = window.open('about:blank', '_blank');
      let adnareResponseWindow;
      if (res.adnareResponse) {
        adnareResponseWindow = window.open('about:blank', '_blank');
      }
      if (responseWindow) {
        // Write the response content to the first window
        responseWindow.document.write(res.response);
        responseWindow.document.close();
      }

      if (adnareResponseWindow) {
        adnareResponseWindow.document.write(res.adnareResponse);
        adnareResponseWindow.document.close();
      }
    }
  };

  const getTaskGridDataAPICall = async (taskID: number) => {
    const res = await getTaskDataById(taskID);
    if (res) {
      setCreateTaskModal({
        open: true,
        claimID: undefined,
        patientID: undefined,
        selectedTaskData: res,
        taskModalInEditMode: false,
      });
    }
  };

  const columns: GridColDef[] = [
    {
      ...GRID_DETAIL_PANEL_TOGGLE_COL_DEF,
      renderCell: (params) => (
        <CustomDetailPanelToggle id={params.id} value={params.value} />
      ),
      minWidth: 80,
    },
    {
      ...GRID_CHECKBOX_SELECTION_COL_DEF,
      flex: 1,
      minWidth: 80,
    },
    {
      field: 'claimID',
      headerName: 'Claim ID',
      flex: 1,
      minWidth: 110,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-cyan-500"
            onClick={async () => {
              dispatch(
                setGlobalModal({
                  type: 'Claim Detail',
                  id: params.value,
                  isPopup: true,
                })
              );
            }}
            data-testid="ClaimSearchClaimID"
          >
            {`#${params.value}`}
          </div>
        );
      },
    },
    {
      field: 'dos',
      headerName: 'DoS',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div>
            {params.row.toDOS !== null ? (
              <> {`${params.row.fromDOS} - ${params.row.toDOS}`} </>
            ) : (
              <>{params.row.fromDOS}</>
            )}
          </div>
        );
      },
    },
    {
      field: 'patient',
      headerName: 'Patient',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-cyan-500"
            onClick={() => {
              // setRoutePath(`/app/register-patient/${params.row.patientID}`);
              dispatch(
                setGlobalModal({
                  type: 'Patient Detail',
                  id: params.row.patientID,
                  isPopup: true,
                })
              );
            }}
          >
            {params.value}
          </div>
        );
      },
    },
    {
      field: 'insurance',
      headerName: 'Insurance',
      minWidth: 120,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-cyan-500"
            onClick={() => {
              setIsInsuranceModalOpen(true);
              setSelectedInsuranceID(params.row.insuranceID);
            }}
          >
            {params.value}
          </div>
        );
      },
    },
    {
      field: 'aging',
      flex: 1,
      minWidth: 150,
      headerName: 'Aging',
      disableReorder: true,
    },
    {
      field: 'followupDays',
      flex: 1,
      minWidth: 150,
      headerName: 'Follow-up in',
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div>{params.value} Days</div>
            <div className="text-xs text-gray-400">
              {params.row.followupDate}
            </div>
          </div>
        );
      },
    },
    {
      field: 'unresolvedTasks',
      flex: 1,
      minWidth: 170,
      headerName: 'Unresolved Tasks',
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-cyan-500 underline"
            onClick={() => {}}
          >
            {params.value}
          </div>
        );
      },
    },
    {
      field: 'lastWorkDate',
      flex: 1,
      minWidth: 150,
      headerName: 'Last Work Date',
      disableReorder: true,
    },
    {
      field: 'timelyFiling',
      type: 'boolean',
      headerName: 'T. Filling',
      flex: 1,
      minWidth: 110,
      disableReorder: true,
      renderCell: (params) => {
        return params.value ? (
          <CheckIcon
            style={{
              color: '#10B981',
            }}
          />
        ) : (
          <CloseIcon
            style={{
              color: '#EF4444',
            }}
          />
        );
      },
    },
    {
      field: 'scrubStatus',
      headerName: 'Scrub Status',
      flex: 1,
      minWidth: 200,
      disableReorder: true,
      renderCell: (params) => {
        const { scrubStatusID } = params.row;
        const isDisabled = [6, 7].includes(scrubStatusID);

        const statusMapping: any = {
          2: { color: 'red', icon: 'desktop', IconColor: IconColors.RED },
          3: { color: 'red', icon: 'desktop', IconColor: IconColors.RED },
          4: { color: 'yellow', icon: 'user', IconColor: IconColors.Yellow },
          5: { color: 'green', icon: 'desktop', IconColor: IconColors.GREEN },
          6: { color: 'yellow', icon: 'user', IconColor: IconColors.Yellow },
        };

        const defaultMapping = {
          color: 'gray',
          icon: 'desktop',
          IconColor: IconColors.GRAY,
        };
        const { color, icon, IconColor } =
          statusMapping[scrubStatusID] || defaultMapping;

        return (
          <Badge
            text={params.value}
            cls={classNames(
              `rounded-[4px] bg-${color}-50 text-${color}-800`,
              isDisabled ? '' : 'cursor-pointer'
            )}
            icon={<Icon name={icon} color={IconColor} />}
            onClick={() => {
              if (params.row.claimID && !isDisabled)
                getScrubingResponce(params.row.claimID);
            }}
          />
        );
      },
    },
    {
      field: 'claimStatus',
      headerName: 'Claim Status',
      flex: 1,
      minWidth: 250,
      disableReorder: true,
      renderCell: (params) => {
        if (params.row.claimStatusColor === 'green') {
          return (
            <Badge
              text={params.value}
              cls={'bg-green-50 text-green-800 rounded-[4px] whitespace-normal'}
              icon={
                <Icon
                  name={
                    params.row.claimStatus.includes('Paid E') ||
                    params.row.claimStatus.includes('Appeal') ||
                    params.row.claimStatus.includes('Draft') ||
                    params.row.claimStatus.includes('Review') ||
                    params.row.claimStatus.includes('Hold') ||
                    params.row.claimStatus.includes('Ready to Bill Patient') ||
                    params.row.claimStatus.includes('Billed to Patient')
                      ? 'user'
                      : 'desktop'
                  }
                  color={IconColors.GREEN}
                />
              }
            />
          );
        }
        if (params.row.claimStatusColor === 'yellow') {
          return (
            <Badge
              text={params.value}
              cls={
                'bg-yellow-50 text-yellow-800 rounded-[4px] whitespace-normal'
              }
              icon={
                <Icon
                  name={
                    params.row.claimStatus.includes('Paid E') ||
                    params.row.claimStatus.includes('Appeal') ||
                    params.row.claimStatus.includes('Draft') ||
                    params.row.claimStatus.includes('Review') ||
                    params.row.claimStatus.includes('Hold') ||
                    params.row.claimStatus.includes('Ready to Bill Patient') ||
                    params.row.claimStatus.includes('Billed to Patient')
                      ? 'user'
                      : 'desktop'
                  }
                  color={IconColors.Yellow}
                />
              }
            />
          );
        }
        if (params.row.claimStatusColor === 'red') {
          return (
            <Badge
              text={params.value}
              cls={'bg-red-50 text-red-800 rounded-[4px] whitespace-normal'}
              icon={
                <Icon
                  name={
                    params.row.claimStatus.includes('Paid E') ||
                    params.row.claimStatus.includes('Appeal') ||
                    params.row.claimStatus.includes('Draft') ||
                    params.row.claimStatus.includes('Review') ||
                    params.row.claimStatus.includes('Hold') ||
                    params.row.claimStatus.includes('Ready to Bill Patient') ||
                    params.row.claimStatus.includes('Billed to Patient')
                      ? 'user'
                      : 'desktop'
                  }
                  color={IconColors.RED}
                />
              }
            />
          );
        }

        return (
          <Badge
            text={params.value}
            cls={'bg-gray-50 text-gray-800 rounded-[4px] whitespace-normal'}
            icon={<Icon name={'desktop'} color={IconColors.GRAY} />}
          />
        );
      },
    },
    {
      field: 'fee',
      headerName: 'Fee',
      ...usdPrice,
      flex: 1,
      type: 'number',
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'allowable',
      headerName: 'Allowable',
      // ...usdPrice,
      flex: 1,
      minWidth: 125,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div>{currencyFormatter.format(params.value)}</div>
            {params.row.adjustments > 0 && (
              <div className="whitespace-nowrap text-xs text-red-500">
                {`Adj.: ${currencyFormatter.format(params.row.adjustments)}`}
              </div>
            )}
            {params.row.adjustments < 0 && (
              <div className="whitespace-nowrap text-xs text-yellow-500">
                {`Adj.: ${currencyFormatter.format(params.row.adjustments)}`}
              </div>
            )}
            {(params.row.adjustments === 0 || !params.row.adjustments) && (
              <div className="whitespace-nowrap text-xs text-green-500">
                {`Adj.: ${currencyFormatter.format(0)}`}
              </div>
            )}
          </div>
        );
      },
    },
    {
      field: 'insuranceAmount',
      headerName: 'Insurance Resp.',
      ...usdPrice,
      flex: 1,
      minWidth: 160,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div>{currencyFormatter.format(params.value)}</div>
            {params.row.insuranceBalance < 0 && (
              <div className="whitespace-nowrap text-xs text-yellow-500">
                {`Bal.: ${currencyFormatter.format(
                  params.row.insuranceBalance
                )}`}
              </div>
            )}
            {params.row.insuranceBalance > 0 && (
              <div className="whitespace-nowrap text-xs text-red-500">
                {`Bal.: ${currencyFormatter.format(
                  params.row.insuranceBalance
                )}`}
              </div>
            )}
            {(params.row.insuranceBalance === 0 ||
              !params.row.insuranceBalance) && (
              <div className="whitespace-nowrap text-xs text-green-500">
                {`Bal.: ${currencyFormatter.format(0)}`}
              </div>
            )}
          </div>
        );
      },
    },
    {
      field: 'patientAmount',
      headerName: 'Patient Resp.',
      ...usdPrice,
      flex: 1,
      minWidth: 160,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div>{currencyFormatter.format(params.value)}</div>
            {params.row.patientBalance > 0 && (
              <div className="whitespace-nowrap text-xs text-red-500">
                {`Bal.: ${currencyFormatter.format(params.row.patientBalance)}`}
              </div>
            )}
            {params.row.patientBalance < 0 && (
              <div className="whitespace-nowrap text-xs text-yellow-500">
                {`Bal.: ${currencyFormatter.format(params.row.patientBalance)}`}
              </div>
            )}
            {(params.row.patientBalance === 0 ||
              !params.row.patientBalance) && (
              <div className="whitespace-nowrap text-xs text-green-500">
                {`Bal.: ${currencyFormatter.format(0)}`}
              </div>
            )}
          </div>
        );
      },
    },
    {
      field: 'totalBalance',
      headerName: 'T. Balance',
      ...usdPrice,
      flex: 1,
      minWidth: 130,
      disableReorder: true,
      renderCell: (params) => {
        if (params.value > 0) {
          return (
            <div className="text-red-500">
              {currencyFormatter.format(params.value)}
            </div>
          );
        }
        if (params.value === 0) {
          return (
            <div className="text-green-500">
              {currencyFormatter.format(params.value)}
            </div>
          );
        }

        return (
          <div className="text-yellow-500">
            {currencyFormatter.format(params.value * -1)}
          </div>
        );
      },
    },
    {
      field: 'group',
      headerName: 'Group',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="cursor-pointer text-cyan-500" onClick={() => {}}>
              {params.value}
            </div>
            <div className="text-xs font-normal leading-4">
              {params.row.groupEIN ? `EIN: ${params.row.groupEIN}` : ''}
            </div>
          </div>
        );
      },
    },
    {
      field: 'practice',
      headerName: 'Practice',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="cursor-pointer text-cyan-500" onClick={() => {}}>
              {params.value}
            </div>
            <div className="text-xs font-normal leading-4">
              {params.row.practiceAddress}
            </div>
          </div>
        );
      },
    },
    {
      field: 'facility',
      headerName: 'Facility',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="cursor-pointer text-cyan-500" onClick={() => {}}>
              {params.value}
            </div>
            <div className="text-xs font-normal leading-4">
              {params.row.facilityAddress}
            </div>
          </div>
        );
      },
    },
    {
      field: 'pos',
      headerName: 'PoS',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'provider',
      headerName: 'Provider',
      flex: 1,
      minWidth: 180,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="cursor-pointer text-cyan-500" onClick={() => {}}>
              {params.value}
            </div>
            <div className="text-xs font-normal leading-4">{`NPI: ${params.row.providerNPI}`}</div>
          </div>
        );
      },
    },
    {
      field: 'assignee',
      headerName: 'Assignee',
      flex: 1,
      minWidth: 180,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="cursor-pointer text-cyan-500" onClick={() => {}}>
              {params.value}
            </div>
            <div className="text-xs font-normal leading-4">
              {params.row.assigneeRole}
            </div>
          </div>
        );
      },
    },
  ];

  const closeExpandedRowContent = (id: GridRowId) => {
    setDetailPanelExpandedRowIds(
      detailPanelExpandedRowIds.filter((f) => f !== id)
    );
  };

  const expandedRowContent = (expandedRowParams: GridRowParams) => {
    return (
      <SearchGridExpandabkeRowModal
        badge={
          <Badge
            text={expandedRowParams.row.claimStatus}
            cls={'bg-green-50 text-green-800 rounded-[4px] pt-1'}
            icon={<Icon name={'desktop'} color={IconColors.GREEN} />}
          />
        }
        expandRowData={
          expandedRowData
            .filter((f) => f.id === expandedRowParams.id)
            [
              expandedRowData.filter((f) => f.id === expandedRowParams.id)
                .length - 1
            ]?.data?.map((row) => {
              return { ...row, id: row.chargeID };
            }) || []
        }
        claimID={expandedRowParams.row.claimID}
        tabName={'AR Claims'}
        onClose={() => {
          closeExpandedRowContent(expandedRowParams.id);
        }}
        expandedColumns={[
          {
            field: 'chargeID',
            headerName: 'Charge ID',
            flex: 1,
            minWidth: 110,
            sortable: false,
            renderCell: (params) => {
              return <div>{`#${params.value}`}</div>;
            },
          },
          {
            field: 'chargeStatus',
            headerName: 'Charge Status',
            flex: 1,
            minWidth: 110,
            sortable: false,
            renderCell: (params) => {
              if (params.value === 'Denied') {
                return (
                  <Badge
                    text={params.value}
                    cls={
                      'bg-red-50 text-red-800 rounded-[4px] whitespace-normal'
                    }
                  />
                );
              }
              if (params.value === 'Paid ERA') {
                return (
                  <Badge
                    text={params.value}
                    cls={
                      'bg-green-50 text-green-800 rounded-[4px] whitespace-normal'
                    }
                  />
                );
              }

              return (
                <Badge
                  text={params.value}
                  cls={
                    'bg-gray-50 text-gray-800 rounded-[4px] whitespace-normal'
                  }
                />
              );
            },
          },
          {
            field: 'cpt',
            headerName: 'CPT Code',
            flex: 1,
            minWidth: 110,
            sortable: false,
          },
          {
            field: 'units',
            headerName: 'Units',
            flex: 1,
            minWidth: 110,
            sortable: false,
          },
          {
            field: 'mod',
            headerName: 'Mod.',
            flex: 1,
            minWidth: 110,
            sortable: false,
          },
          {
            field: 'icds',
            headerName: 'DX',
            flex: 1,
            minWidth: 110,
            sortable: false,
          },
          {
            field: 'fee',
            headerName: 'Fee',
            ...usdPrice,
            flex: 1,
            minWidth: 110,
            sortable: false,
          },
          {
            field: 'allowable',
            headerName: 'Allowable',
            ...usdPrice,
            flex: 1,
            minWidth: 110,
            sortable: false,
          },
          {
            field: 'insuranceResponsibility',
            ...usdPrice,
            headerName: 'Ins. Resp.',
            flex: 1,
            minWidth: 110,
            sortable: false,
            renderCell: (params) => {
              return (
                <div className="flex flex-col">
                  {params.row.insuranceAmount >= 0 ? (
                    <div>
                      {currencyFormatter.format(params.row.insuranceAmount)}
                    </div>
                  ) : (
                    <div className="text-red-500 ">
                      {currencyFormatter.format(
                        params.row.insuranceAmount * -1
                      )}
                    </div>
                  )}
                  {params.row.insuranceBalance < 0 && (
                    <div className="whitespace-nowrap text-xs text-red-500">
                      {`Bal.: ${currencyFormatter.format(
                        params.row.insuranceBalance
                      )}`}
                    </div>
                  )}
                  {params.row.insuranceBalance > 0 && (
                    <div className="whitespace-nowrap text-xs text-green-500">
                      {`Bal.: ${currencyFormatter.format(
                        params.row.insuranceBalance
                      )}`}
                    </div>
                  )}
                  {(params.row.insuranceBalance === 0 ||
                    !params.row.insuranceBalance) && (
                    <div className="whitespace-nowrap text-xs">
                      {`Bal.: ${currencyFormatter.format(0)}`}
                    </div>
                  )}
                </div>
              );
            },
          },
          {
            field: 'patientResponsibility',
            headerName: 'Pat. Resp.',
            ...usdPrice,
            flex: 1,
            minWidth: 110,
            sortable: false,
            renderCell: (params) => {
              return (
                <div className="flex flex-col">
                  {params.row.patientAmount >= 0 ? (
                    <div>
                      {currencyFormatter.format(params.row.patientAmount)}
                    </div>
                  ) : (
                    <div className="text-red-500 ">
                      {currencyFormatter.format(params.row.patientAmount * -1)}
                    </div>
                  )}
                  {params.row.patientBalance < 0 && (
                    <div className="whitespace-nowrap text-xs text-red-500">
                      {`Bal.: ${currencyFormatter.format(
                        params.row.patientBalance
                      )}`}
                    </div>
                  )}
                  {params.row.patientBalance > 0 && (
                    <div className="whitespace-nowrap text-xs text-green-500">
                      {`Bal.: ${currencyFormatter.format(
                        params.row.patientBalance
                      )}`}
                    </div>
                  )}
                  {(params.row.patientBalance === 0 ||
                    !params.row.patientBalance) && (
                    <div className="whitespace-nowrap text-xs">
                      {`Bal.: ${currencyFormatter.format(0)}`}
                    </div>
                  )}
                </div>
              );
            },
          },
        ]}
      />
    );
  };

  // warning Modal
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const error = useSelector(getErrorSelector);
  useEffect(() => {
    if (error) {
      setIsWarningModalOpen(false);
    }
  }, [error]);
  const [sortSelected, setSortSelected] = useState<
    ButtonSelectDropdownDataType[]
  >([]);

  const sortDropdownData: ButtonSelectDropdownDataType[] = [
    {
      id: 1,
      value: 'Aging Claims Increasing',
    },
    {
      id: 2,
      value: 'Aging Claims Decreasing',
      showBottomDivider: true,
    },
    {
      id: 3,
      value: 'Claims Never Touched Increasing (Days)',
    },
    {
      id: 4,
      value: 'Claims Never Touched Decreasing (Days)',
      showBottomDivider: true,
    },
    {
      id: 5,
      value: 'Dollar Value of Claim Increasing',
    },
    {
      id: 6,
      value: 'Dollar Value of Claim Decreasing',
      showBottomDivider: true,
    },
    {
      id: 7,
      value: 'Fee Increasing',
    },
    {
      id: 8,
      value: 'Fee Decreasing',
      showBottomDivider: true,
    },
    {
      id: 9,
      value: 'Follow-Up Days Increasing',
    },
    {
      id: 10,
      value: 'Follow-Up Days Decreasing',
      showBottomDivider: true,
    },
    {
      id: 11,
      value: 'Insurance with Most Outstanding Claims Increasing',
    },
    {
      id: 12,
      value: 'Insurance with Most Outstanding Claims Decreasing',
      showBottomDivider: true,
    },
    {
      id: 13,
      value: 'Patient with Most Claims Increasing',
    },
    {
      id: 14,
      value: 'Patient with Most Claims Decreasing',
      showBottomDivider: true,
    },
    {
      id: 15,
      value: 'Timely Filing Increasing',
    },
    {
      id: 16,
      value: 'Timely Filing Decreasing',
    },
  ];

  const onSelectSortDropdownData = (res: ButtonSelectDropdownDataType[]) => {
    setSortSelected(res);

    const id = res[0]?.id || 0;
    let field = '';
    let sort = '';

    if (id) sort = [1, 3, 5, 7, 9, 11, 13, 15].includes(id) ? 'asc' : 'desc';
    if ([1, 2].includes(id)) field = 'AGE';
    if ([3, 4].includes(id)) field = 'CNT';
    if ([5, 6].includes(id)) field = 'DVC';
    if ([7, 8].includes(id)) field = 'fee';
    if ([9, 10].includes(id)) field = 'followupDays';
    if ([11, 12].includes(id)) field = 'IMO';
    if ([13, 14].includes(id)) field = 'PMC';
    if ([15, 16].includes(id)) field = 'TFD';

    const obj = {
      ...searchDataCriteria,
      sortColumn: field,
      sortOrder: sort,
    };

    setSearchDataCriteria(obj);
    if (searchResult.length) getARClaimsSearchData(obj);
  };

  const quickActionsDropdownData: ButtonSelectDropdownDataType[] = [
    { id: 1, value: 'Create Task', showBottomDivider: true },
    { id: 2, value: 'View Claim Details' },
    { id: 3, value: 'Submit' },
    { id: 4, value: 'Scrub' },
    { id: 5, value: 'Forcefully Pass Scrub' },
    { id: 6, value: 'Post Payment' },
    { id: 7, value: 'Change Status' },
    { id: 8, value: 'Void' },
    { id: 9, value: 'Leave Note' },
    { id: 10, value: 'Assign' },
  ];

  const [statusModalInfo, setStatusModalInfo] = useState({
    show: false,
    heading: '',
    text: '',
    type: StatusModalType.WARNING,
  });
  const [statusModalState, setStatusModalState] = useState({
    open: false,
    heading: '',
    description: '',
    bottomDescription: '',
    okButtonText: '',
    statusModalType: StatusModalType.ERROR,
    showCloseButton: true,
    closeOnClickOutside: true,
    okButtonColor: ButtonType.primary,
    closeButtonColor: ButtonType.secondary,
    closeButtonText: 'Close',
    statusData: [] as StatusDetailModalDataType[],
  });
  const claimsScrubingResponce = useRef<StatusDetailModalDataType[]>([]);
  const [statusDetailModalState, setStatusDetailModalState] = useState<{
    open: boolean;
    headingText: string;
    data: StatusDetailModalDataType[];
  }>({
    open: false,
    headingText: '',
    data: [],
  });
  const [statusModalHeading, setStatusModalHeading] = useState('');
  const [showScrubingResponse, setShowScrubingResponse] = useState<{
    data?: AllClaimsScrubResponseResult;
    open: boolean;
  }>({
    open: false,
  });
  const scrubClaim = async () => {
    const res = await claimsScrubing(selectRows);
    if (res) {
      setShowScrubingResponse({
        data: res,
        open: true,
      });
    } else {
      setShowErrorMesaage(true);
      setStatusModalState({
        ...statusModalState,
        open: true,
        heading: 'Error',
        description:
          'A system error prevented the claims to be scrubbed. Please try again.',
        okButtonText: 'Ok',
        statusModalType: StatusModalType.ERROR,
        showCloseButton: false,
        closeOnClickOutside: false,
      });
    }
  };
  const voidPostingDateCriteria: PostingDateCriteria = {
    id: selectRows[0],
    type: 'Claim',
    postingDate: DateToStringPipe(voidPostingDate, 1),
  };
  const onVoidClaim = async () => {
    const dateRes = await fetchPostingDate(voidPostingDateCriteria);
    if (dateRes && dateRes.postingCheck === false) {
      setStatusModalInfo({
        ...statusModalInfo,
        show: true,
        heading: 'Error',
        type: StatusModalType.ERROR,
        text: `${dateRes.message}`,
      });
      return;
    }
    if (selectRows[0]) {
      const res = await voidClaims(selectRows[0], voidPostingDate);
      setPostingDateModel({
        type: '',
        show: false,
      });
      if (res && res.message) {
        if (res.id === 1) {
          dispatch(
            addToastNotification({
              id: uuidv4(),
              text: res.message,
              toastType: ToastType.SUCCESS,
            })
          );
        } else if (res.id === 2) {
          dispatch(
            addToastNotification({
              id: uuidv4(),
              text: res.message,
              toastType: ToastType.ERROR,
            })
          );
        } else if (res.id === 3) {
          dispatch(
            addToastNotification({
              id: uuidv4(),
              text: res.message,
              toastType: ToastType.ERROR,
            })
          );
        } else {
          dispatch(
            addToastNotification({
              id: uuidv4(),
              text: res.message,
              toastType: ToastType.ERROR,
            })
          );
        }
        setVoidPostingDate('');
        getARClaimsSearchData(searchDataCriteria);
      } else {
        setStatusModalInfo({
          ...statusModalInfo,
          show: true,
          heading: 'Error',
          type: StatusModalType.ERROR,
          text: 'A system error prevented the claim claim to be voided.\n Please try again.',
        });
      }
    }
  };
  // const onVoidClaim = async () => {
  //   const res = await voidClaim(selectRows);
  //   if (res && res.message) {
  //     dispatch(
  //       addToastNotification({
  //         id: uuidv4(),
  //         text: res.message,
  //         toastType: ToastType.SUCCESS,
  //       })
  //     );
  //     getARClaimsSearchData(searchDataCriteria);
  //   }
  // };
  const onLeaveNote = async () => {
    setNoteSliderOpen(true);
  };
  const onSubmitClaim = async () => {
    const claims: ClaimsSubmitRequest[] = selectRows.map((m) => ({
      claimID: m,
      submitAs: false,
    }));
    const res = await submitClaim(claims);
    if (res) {
      // claimsScrubingResponce.current = res.response;
      let heading = '';
      let description = '';
      const data = res.response;
      const uniqueIds = data.reduce((ids: number[], obj) => {
        if (!ids.includes(obj.id)) {
          ids.push(obj.id);
        }
        return ids;
      }, []);
      const selectedIssuess: StatusDetailModalDataType[] = [];
      uniqueIds.forEach((id) => {
        const selectedObjects = data.filter((obj) => obj.id === id);
        const issues = selectedObjects.flatMap((obj) =>
          obj.issues?.map((issue) => issue.issue)
        );
        if (selectedObjects && selectedObjects[0]?.id) {
          selectedIssuess.push({
            id: selectedObjects[0]?.id,
            title: selectedObjects[0]?.title ? selectedObjects[0]?.title : '',
            type: selectedObjects[0]?.type,
            issues: issues ? [...issues].map((a) => ({ issue: a || '' })) : [],
          });
        }
      });
      claimsScrubingResponce.current = selectedIssuess;
      setStatusModalHeading('Claim(s) Submission Validations');
      const success = res.response.filter((m) => m.type === 'success').length;
      if (success === selectRows.length) {
        dispatch(
          addToastNotification({
            id: uuidv4(),
            text: `Claim${
              selectRows.length === 1 ? '' : 's'
            } Successfully Submitted`,
            toastType: ToastType.SUCCESS,
          })
        );
        getARClaimsSearchData(searchDataCriteria);
        return;
      }
      heading =
        selectRows.length === 1
          ? 'Claim Were Not Submitted'
          : 'Some Claims Were Not Submitted';
      description =
        selectRows.length === 1
          ? 'This claim was not Submitted. Please review the rejection details for more information on how to resolve the rejection causes before attempting again.'
          : 'The system rejected some of the selected claims while attempting to scrub. Please review the rejection details for more information on how to resolve the rejection causes before attempting again.';

      setStatusModalState({
        ...statusModalState,
        open: true,
        heading,
        description,
        okButtonColor: ButtonType.primary,
        closeButtonColor: ButtonType.secondary,
        closeButtonText: 'Close',
        statusData: [],
        showCloseButton: true,
        okButtonText: 'View Validation Details',
        statusModalType: StatusModalType.WARNING,
        closeOnClickOutside: false,
      });
    }
  };
  const forceFullyScrubClaim = async () => {
    const res = await forceFullyScrub(selectRows);
    if (res && res.message) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: res.message,
          toastType: ToastType.SUCCESS,
        })
      );
      getARClaimsSearchData(searchDataCriteria);
    }
  };
  const claimsSubmittingResponse = useRef<StatusDetailModalDataType[]>([]);
  const onSubmitSingleClaim = async (submitAsIs: boolean) => {
    setSubmitSingleClaim(true);
    let res = null;
    if (selectRows.length === 1) {
      res = await submitClaim([
        { claimID: selectRows[0], submitAs: submitAsIs },
      ]);
    }
    if (res) {
      claimsSubmittingResponse.current = res.response;
      let heading = '';
      let description = '';
      let bottomDescription = '';
      const success = res.response.filter((m) => m.type === 'success').length;
      if (success > 0) {
        setSubmitSingleClaim(false);
        dispatch(
          addToastNotification({
            id: uuidv4(),
            text: 'Claim Successfully Submitted',
            toastType: ToastType.SUCCESS,
          })
        );
      } else {
        const warning = res.response.filter((m) => m.type === 'warning').length;
        const errorMessage = res.response.filter(
          (m) => m.type === 'error'
        ).length;
        heading =
          warning === res.response.length
            ? 'Claim Issues Warning'
            : 'Submission Rejected by Nucleus';
        if (warning === res.response.length) {
          description =
            'We have identified issues with this claim that may cause it to be rejected.';
        } else if (errorMessage === res.response.length) {
          description =
            'We have identified critical errors that prevented the claim from being submitted.';
        } else {
          description =
            'We have identified both critical errors and potential issues that prevented the claim from being submitted.';
        }
        bottomDescription =
          warning === res.response.length
            ? 'We recommend fixing these issues before submitting the claim. You can also choose to submit the claim as is.'
            : 'Please fix the errors and try resubmitting.';
        setStatusModalState({
          ...statusModalState,
          open: true,
          heading,
          description,
          bottomDescription,
          okButtonColor:
            warning === res.response.length
              ? ButtonType.secondary
              : ButtonType.primary,
          closeButtonColor:
            warning === res.response.length
              ? ButtonType.primary
              : ButtonType.secondary,
          okButtonText: warning === res.response.length ? 'Submit As Is' : 'OK',
          statusModalType:
            warning === res.response.length
              ? StatusModalType.WARNING
              : StatusModalType.ERROR,
          closeOnClickOutside: false,
          showCloseButton: warning === res.response.length,
          closeButtonText: 'Cancel Submission',
          statusData: claimsSubmittingResponse
            ? claimsSubmittingResponse.current.map((d) => {
                return { ...d, title: `#${d.id} - ${d.title}` };
              })
            : [],
        });
      }
    }
  };
  const bulkActionsDropdownData: ButtonSelectDropdownDataType[] = [
    { id: 1, value: 'Create Task', showBottomDivider: true },
    { id: 2, value: 'Submit' },
    { id: 3, value: 'Scrub' },
    { id: 4, value: 'Forcefully Pass Scrub' },
    { id: 5, value: 'Change Status' },
    // { id: 6, value: 'Void' },
    { id: 7, value: 'Leave Note' },
    { id: 8, value: 'Assign' },
  ];
  const onSelectBulkActionsDropdownData = (
    res: ButtonSelectDropdownDataType[]
  ) => {
    const id = res[0]?.id || 0;
    if (id === 1) {
      setAction('bulk');
      setCreateTaskModal({
        open: true,
      });
    }
    if (id === 2) {
      onSubmitClaim();
    }
    if (id === 3) {
      scrubClaim();
    }
    if (id === 4) {
      forceFullyScrubClaim();
    }
    if (id === 5) {
      setAction('bulk');
      setChangeStatus(true);
      if (claimStatusData?.claimStatus) {
        setStatusDropDown(claimStatusData?.claimStatus);
      }
    }
    if (id === 7) {
      onLeaveNote();
    }
    if (id === 8) {
      setIsAssignClaimToModalOpen(true);
    }
  };
  const onSelectQuickActionsDropdownData = (
    res: ButtonSelectDropdownDataType[]
  ) => {
    const id = res[0]?.id || 0;
    if (id === 1) {
      setAction('quick');
      const selectedClaim = searchResult.find(
        (m) => m.claimID === selectRows[0]
      );
      setCreateTaskModal({
        open: true,
        claimID: selectedClaim?.claimID,
        patientID: selectedClaim?.patientID,
        selectedTaskData: undefined,
        taskModalInEditMode: undefined,
      });
    }
    if (id === 2) {
      if (selectRows[0]) {
        dispatch(
          setGlobalModal({
            type: 'Claim Detail',
            id: selectRows[0],
            isPopup: true,
          })
        );
      }
    }
    if (id === 3) {
      onSubmitSingleClaim(false);
    }
    if (id === 4) {
      scrubClaim();
    }
    if (id === 5) {
      forceFullyScrubClaim();
    }
    if (id === 6) {
      setShowPaymentPostingPopUp(true);
      const selectedClaim = searchResult.find(
        (m) => m.claimID === selectRows[0]
      );
      if (selectedClaim) setPostPaymentData(selectedClaim);
    }
    if (id === 7) {
      setAction('quick');
      setChangeStatus(true);
      const selectedClaim = searchResult.find(
        (m) => m.claimID === selectRows[0]
      );
      setStatusValue(selectedClaim?.claimStatus);
      if (claimStatusData?.claimStatus) {
        setStatusDropDown(claimStatusData?.claimStatus);
      }
    }
    if (id === 8) {
      setPostingDateModel({
        show: true,
        type: '',
      });
    }
    if (id === 9) {
      onLeaveNote();
    }
    if (id === 10) {
      setIsAssignClaimToModalOpen(true);
    }
  };
  const [searchBarDropdown, setSearchBarDropdown] = useState<
    TableSearchBarDropdownDataType[]
  >([]);
  const onSearchData = async (v: string) => {
    if (lastSearchDataCriteria && !!v) {
      const obj: any = { ...lastSearchDataCriteria };
      obj.searchValue = v;
      const res = await getARClaimsTableSearch(obj);
      if (res) {
        const mappedData = res.map((d) => {
          let appendText: string = '';
          const typeMap: any = {
            insurance: 'Insurance Profile',
            patient: 'Patient Profile',
            claim: 'Claim',
            dos: 'DoS',
          };
          if (d.type in typeMap) {
            appendText = typeMap[d.type];
          }
          const value = (d.type === 'claim' ? 'Claim ID#' : '') + d.value;
          return { ...d, value, appendText };
        });
        setSearchBarDropdown(mappedData);
      }
    }
  };
  // Search bar
  const onClickSearch = () => {
    // setIsWarningModalOpen(true);
    const v = selectedSearchBarDropdown;

    const claimIDSearch = v?.type === 'claim' && v.id ? String(v.id) : '';
    const patientSearch = v?.type === 'patient' && v.id ? String(v.id) : '';
    const dosSearch = v?.type === 'dos' && v.id ? String(v.id) : '';
    const insuranceSearch = v?.type === 'insurance' && v.id ? String(v.id) : '';

    const obj = {
      ...searchDataCriteria,
      claimIDSearch,
      patientSearch,
      dosSearch,
      insuranceSearch,
    };

    setSearchDataCriteria(obj);
    if (searchResult.length) {
      getARClaimsSearchData(obj);
    }
  };
  useEffect(() => {
    if (filterModalTabs) {
      const newFilterValue = filterModalTabs?.filter(
        (s) => s.selectedValue.length !== 0
      );
      setActiveFiltersOfFilterModal(newFilterValue);
      const filtersOfFilterModal = newFilterValue.flatMap((a) =>
        a.selectedValue.map((b) => b)
      );

      setActivefilters([
        ...activefilters.filter(
          (af) =>
            !filtersOfFilterModal.some(
              (fm) => fm.id === af.id && fm.value === af.value
            )
        ),
        ...filtersOfFilterModal.map((m) => ({
          id: m.id,
          value: m.value,
          type: newFilterValue.find((tab) =>
            tab.data.find((status) => status.id === m.id)
          )
            ? newFilterValue.find((tab) =>
                tab.data.find(
                  (status) => status.id === m.id && status.value === m.value
                )
              )?.name
            : '',
        })),
      ]);
    }
  }, [filterModalTabs]);
  useEffect(() => {
    if (activeFiltersOfFilterModal.length) {
      const selectedClaimStatusFilters = activeFiltersOfFilterModal
        .find((a) => a.id === 1)
        ?.selectedValue.map((a) => a.id)
        .join(',');
      const selectedSubmissionTypeFilters = activeFiltersOfFilterModal
        .find((a) => a.id === 2)
        ?.selectedValue.map((a) => a.id)
        .join(',');
      let selectedTimilyFilingActive;
      const selectedTimilyFillingFilters = activeFiltersOfFilterModal
        .filter((a) => a.id === 3)
        .flatMap((a) => a.selectedValue.map((b) => b.id));
      if (
        selectedTimilyFillingFilters.map((n) => n)[0] === 1 &&
        selectedTimilyFillingFilters.length === 1
      ) {
        selectedTimilyFilingActive = true;
      } else if (
        selectedTimilyFillingFilters.map((n) => n)[0] === 2 &&
        selectedTimilyFillingFilters.length === 1
      ) {
        selectedTimilyFilingActive = false;
      } else if (selectedTimilyFillingFilters.length !== 1) {
        selectedTimilyFilingActive = undefined;
      }
      const selectedScrubStatusFilters = activeFiltersOfFilterModal
        .find((a) => a.id === 4)
        ?.selectedValue.map((a) => a.id)
        .join(',');
      const selectPOSFilter = activeFiltersOfFilterModal
        .find((a) => a.id === 7)
        ?.selectedValue.map((a) => a.id)
        .join(',');
      const selectedAssignClaimToFilters = activeFiltersOfFilterModal
        .find((a) => a.id === 8)
        ?.selectedValue.map((a) => a.id)
        .join(',');
      const selectedDaysOfAgingFilterID = activeFiltersOfFilterModal
        .find((a) => a.id === 5)
        ?.selectedValue.map((a) => a.id)[0]; // ?.split(' - ');
      const agingValue = activeFiltersOfFilterModal
        .find((a) => a.id === 5)
        ?.selectedValue.map((a) => a.value)[0]
        ?.split(' - ');
      let selectedDaysOfAgingFromFilter;
      let selectedDaysOfAgingToFilter;
      if (agingValue) {
        if (selectedDaysOfAgingFilterID === 6) {
          selectedDaysOfAgingToFilter = agingValue[0]
            ? Number(agingValue[0].split(' ')[0])
            : undefined;
        } else if (selectedDaysOfAgingFilterID === 1) {
          selectedDaysOfAgingFromFilter = agingValue[0]
            ? Number(agingValue[0].split(' ')[0])
            : undefined;
        } else {
          selectedDaysOfAgingFromFilter = agingValue[0]
            ? Number(agingValue[0])
            : undefined;
          const secondValue = agingValue[1] ? agingValue[1].split(' ')[0] : '';
          selectedDaysOfAgingToFilter = secondValue
            ? Number(secondValue)
            : undefined;
        }
      }
      const selectedValueFilterID = activeFiltersOfFilterModal
        .find((a) => a.id === 6)
        ?.selectedValue.map((a) => a.id)[0];
      const selectedRangeValue = activeFiltersOfFilterModal
        .find((a) => a.id === 6)
        ?.selectedValue.map((a) => a.value)[0]
        ?.replace(/\$|,/g, '')
        .split(' - ');
      let selectedFromFee;
      let selectedToFee;
      if (selectedRangeValue) {
        if (selectedValueFilterID === 5) {
          selectedToFee = selectedRangeValue[0]
            ? Number(selectedRangeValue[0]?.split(' ')[0])
            : undefined;
        } else if (selectedValueFilterID === 1) {
          selectedFromFee = selectedRangeValue[0]
            ? Number(selectedRangeValue[0]?.split(' ')[0])
            : undefined;
        } else {
          selectedFromFee = selectedRangeValue[0]
            ? Number(selectedRangeValue[0])
            : undefined;
          selectedToFee = selectedRangeValue[1]
            ? Number(selectedRangeValue[1])
            : undefined;
        }
      }
      setSearchWithFiltersCriteria({
        claimStatusIDS: selectedClaimStatusFilters,
        submitStatusIDS: selectedSubmissionTypeFilters,
        timelyFiling: selectedTimilyFilingActive,
        scrubStatusIDS: selectedScrubStatusFilters,
        fromAgingDays: selectedDaysOfAgingFromFilter,
        toAgingDays: selectedDaysOfAgingToFilter,
        posIDS: selectPOSFilter,
        assignedTo: selectedAssignClaimToFilters,
        fromFee: selectedFromFee,
        toFee: selectedToFee,
      });
    }
  }, [activeFiltersOfFilterModal]);
  useEffect(() => {
    if (searchWithFiltersCriteria) {
      setSearchDataCriteria({
        ...searchDataCriteria,
        claimStatusIDS: searchWithFiltersCriteria.claimStatusIDS || '',
        submitStatusIDS: searchWithFiltersCriteria.submitStatusIDS || '',
        timelyFiling: searchWithFiltersCriteria.timelyFiling,
        scrubStatusIDS: searchWithFiltersCriteria.scrubStatusIDS || '',
        fromAgingDays: searchWithFiltersCriteria.fromAgingDays,
        toAgingDays: searchWithFiltersCriteria.toAgingDays,
        posIDS: searchWithFiltersCriteria.posIDS || '',
        assignedTo: searchWithFiltersCriteria.assignedTo || '',
        fromFee: searchWithFiltersCriteria.fromFee,
        toFee: searchWithFiltersCriteria.toFee,
      });

      getARClaimsSearchData({
        ...searchDataCriteria,
        claimStatusIDS: searchWithFiltersCriteria.claimStatusIDS || '',
        submitStatusIDS: searchWithFiltersCriteria.submitStatusIDS || '',
        timelyFiling: searchWithFiltersCriteria.timelyFiling,
        scrubStatusIDS: searchWithFiltersCriteria.scrubStatusIDS || '',
        fromAgingDays: searchWithFiltersCriteria.fromAgingDays,
        toAgingDays: searchWithFiltersCriteria.toAgingDays,
        posIDS: searchWithFiltersCriteria.posIDS || '',
        assignedTo: searchWithFiltersCriteria.assignedTo || '',
        fromFee: searchWithFiltersCriteria.fromFee,
        toFee: searchWithFiltersCriteria.toFee,
      });
    }
  }, [searchWithFiltersCriteria]);

  const exportCsv = async () => {
    const obj: GetARClaimsSearchDataCriteria = {
      groupID: searchDataCriteria.groupID,
      fromCreatedOn: searchDataCriteria.fromCreatedOn,
      toCreatedOn: searchDataCriteria.toCreatedOn,
      fromDOS: searchDataCriteria.fromDOS,
      toDOS: searchDataCriteria.toDOS,
      fromSubmissionDate: searchDataCriteria.fromSubmissionDate,
      toSubmissionDate: searchDataCriteria.toSubmissionDate,
      claimStatusIDS: searchDataCriteria.claimStatusIDS,
      scrubStatusIDS: searchDataCriteria.scrubStatusIDS,
      submitStatusIDS: searchDataCriteria.submitStatusIDS,
      timelyFiling: searchDataCriteria.timelyFiling,
      fromAgingDays: searchDataCriteria.fromAgingDays,
      toAgingDays: searchDataCriteria.toAgingDays,
      fromFee: searchDataCriteria.fromFee,
      toFee: searchDataCriteria.toFee,
      posIDS: searchDataCriteria.posIDS,
      assignedTo: searchDataCriteria.assignedTo,
      claimIDSearch: searchDataCriteria.claimIDSearch,
      patientSearch: searchDataCriteria.patientSearch,
      dosSearch: searchDataCriteria.dosSearch,
      insuranceSearch: searchDataCriteria.insuranceSearch,
      arByFollowUP: searchDataCriteria.arByFollowUP,
      arByWorkDate: searchDataCriteria.arByWorkDate,
      getAllData: true,
      getOnlyIDS: false,
      sortColumn: '',
      sortOrder: '',
      pageNumber: undefined,
      pageSize: undefined,
    };
    if (reportCheck === 'Claim') {
      const res = await fetchARClaimsSearchData(obj);
      if (res) {
        const exportDataArray = res.map((m) => {
          return {
            'Claim ID': m?.claimID,
            DoS: `${m.fromDOS}-\n${m.toDOS}`,
            Pat: m.patient,
            Ins: m.insurance,
            Aging: m.aging,
            'Foll-up Days': m?.followupDays || null,
            'Foll-up Date': m.followupDate,
            'Unresolved Tasks': m.unresolvedTasks,
            'Last Work Date': m.lastWorkDate,
            'T.Fill': m.timelyFiling,
            'Scrub Status': m.scrubStatus,
            'Claim Status': m.claimStatus,
            Fee: currencyFormatter.format(m.fee),
            Allowable: currencyFormatter.format(m.allowable),
            'Ins Amt': currencyFormatter.format(m.insuranceAmount),
            'Ins Bal': currencyFormatter.format(m.insuranceBalance),
            'Pat Amt': currencyFormatter.format(m.patientAmount),
            'Pat Bal': currencyFormatter.format(m.patientBalance),
            'T.Bal': currencyFormatter.format(m.totalBalance),
            Group: m.group,
            Practice: m.practice,
            Facility: m.facility,
            PoS: m.pos,
            Provider: m.provider,
            'P.NPI': m.providerNPI,
            Assignee: m.assignee,
            'A.Role': m?.assigneeRole || null,
          };
        });
        if (exportDataArray.length !== 0) {
          const headerArray = Object.keys(exportDataArray[0] || {});
          let criteriaObj: { [key: string]: any } = {
            ...exportDataArray[0],
          };
          const criteriaArray = [];
          criteriaObj = Object.fromEntries(
            headerArray.map((key) => [key, key])
          );
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          const exportArray = criteriaArray.concat(exportDataArray);
          if (!exportArray) {
            setStatusModalInfo({
              ...statusModalInfo,
              show: true,
              heading: 'Alert',
              type: StatusModalType.WARNING,
              text: 'No Data to Export!',
            });
            return;
          }
          if (exportType === 'download') {
            ExportDataToCSV(exportArray, 'ARClaimsData');
            dispatch(
              addToastNotification({
                text: 'Export successful',
                toastType: ToastType.SUCCESS,
                id: '',
              })
            );
          } else {
            ExportDataToDrive(exportArray, 'ARClaimsData', dispatch);
          }
        }
        setReportModal(false);
      } else {
        setStatusModalInfo({
          ...statusModalInfo,
          show: true,
          heading: 'Error',
          type: StatusModalType.ERROR,
          text: 'A system error prevented the page to be exported. \nPlease try again.',
        });
      }
    } else {
      const res = await fetchARClaimsSearchChargesData(obj);
      if (res) {
        const exportDataArray = res.map((m) => {
          return {
            'Claim ID': m?.claimID,
            'Charge ID': m.chargeID,
            CPT: m.cpt,
            DoS: m.dos,
            Pat: m.patient,
            Ins: m.insurance,
            Aging: m.aging,
            'Foll-up Days': m?.followupDays || null,
            'Foll-up Date': m.followupDate,
            'Unresolved Tasks': m.unresolvedTasks,
            'Last Work Date': m.lastWorkDate,
            'T.Fill': m.timelyFiling,
            'Scrub Status': m.scrubStatus,
            'Claim Status': m.claimStatus,
            Fee: currencyFormatter.format(m.fee),
            Allowable: currencyFormatter.format(m.allowable),
            'Ins Amt': currencyFormatter.format(m.insuranceAmount),
            'Ins Bal': currencyFormatter.format(m.insuranceBalance),
            'Pat Amt': currencyFormatter.format(m.patientAmount),
            'Pat Bal': currencyFormatter.format(m.patientBalance),
            'T.Bal': currencyFormatter.format(m.totalBalance),
            Group: m.group,
            Practice: m.practice,
            Facility: m.facility,
            PoS: m.pos,
            Provider: m.provider,
            'P.NPI': m.providerNPI,
            Assignee: m.assignee,
            'A.Role': m?.assigneeRole || null,
          };
        });
        if (exportDataArray.length !== 0) {
          const headerArray = Object.keys(exportDataArray[0] || {});
          let criteriaObj: { [key: string]: any } = {
            ...exportDataArray[0],
          };
          const criteriaArray = [];
          criteriaObj = Object.fromEntries(
            headerArray.map((key) => [key, key])
          );
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          const exportArray = criteriaArray.concat(exportDataArray);
          if (!exportArray) {
            setStatusModalInfo({
              ...statusModalInfo,
              show: true,
              heading: 'Alert',
              type: StatusModalType.WARNING,
              text: 'No Data to Export!',
            });
            return;
          }
          if (exportType === 'download') {
            ExportDataToCSV(exportArray, 'ARClaimsChargesData');
            dispatch(
              addToastNotification({
                text: 'Export successful',
                toastType: ToastType.SUCCESS,
                id: '',
              })
            );
          } else {
            ExportDataToDrive(exportArray, 'ARClaimsChargesData', dispatch);
          }
        } else {
          setStatusModalInfo({
            ...statusModalInfo,
            show: true,
            heading: 'Alert',
            type: StatusModalType.WARNING,
            text: 'No claim charge to export!',
          });
        }
        setReportModal(false);
      } else {
        setStatusModalInfo({
          ...statusModalInfo,
          show: true,
          heading: 'Error',
          type: StatusModalType.ERROR,
          text: 'A system error prevented the page to be exported. \nPlease try again.',
        });
      }
    }
  };
  const downloadPdf = (pdfExportData: GetARClaimsSearchDataResult[]) => {
    if (!pdfExportData) {
      setStatusModalInfo({
        ...statusModalInfo,
        show: true,
        heading: 'Alert',
        type: StatusModalType.WARNING,
        text: 'No Record to Export!',
      });
      return false;
    }
    const data: DownloadDataPDFDataType[] = [];
    // implement data
    const arClaimData: PDFRowInput[] = pdfExportData.map((m) => {
      return {
        'Claim ID': m?.claimID,
        DoS: `${m.fromDOS}-\n${m.toDOS}`,
        Pat: m.patient,
        Ins: m.insurance,
        Aging: m.aging,
        'Foll-up Days': m?.followupDays || null,
        'Foll-up Date': m.followupDate,
        'Unresolved Tasks': m.unresolvedTasks,
        'Last Work Date': m.lastWorkDate,
        'T.Fill': m.timelyFiling,
        'Scrub Status': m.scrubStatus,
        'Claim Status': m.claimStatus,
        Fee: currencyFormatter.format(m.fee),
        Allowable: currencyFormatter.format(m.allowable),
        'Ins Amt': currencyFormatter.format(m.insuranceAmount),
        'Ins Bal': currencyFormatter.format(m.insuranceBalance),
        'Pat Amt': currencyFormatter.format(m.patientAmount),
        'Pat Bal': currencyFormatter.format(m.patientBalance),
        'T.Bal': currencyFormatter.format(m.totalBalance),
        Group: m.group,
        Practice: m.practice,
        Facility: m.facility,
        PoS: m.pos,
        Provider: m.provider,
        'P.NPI': m.providerNPI,
        Assignee: m.assignee,
        'A.Role': m?.assigneeRole || null,
      };
    });
    const dataColumns: PDFColumnInput[] = [];
    const keyNames = arClaimData[0] && Object.keys(arClaimData[0]);
    if (keyNames) {
      for (let i = 0; i < keyNames.length; i += 1) {
        dataColumns.push({ title: keyNames[i], dataKey: keyNames[i] });
      }
    }
    data.push({ columns: dataColumns, body: arClaimData });
    ExportDataToPDF(data, 'AR Claims Data');
    dispatch(
      addToastNotification({
        text: 'Export successful',
        toastType: ToastType.SUCCESS,
        id: '',
      })
    );
    return true;
  };
  const ExportPdf = async () => {
    const obj: GetARClaimsSearchDataCriteria = {
      groupID: searchDataCriteria.groupID,
      fromCreatedOn: searchDataCriteria.fromCreatedOn,
      toCreatedOn: searchDataCriteria.toCreatedOn,
      fromDOS: searchDataCriteria.fromDOS,
      toDOS: searchDataCriteria.toDOS,
      fromSubmissionDate: searchDataCriteria.fromSubmissionDate,
      toSubmissionDate: searchDataCriteria.toSubmissionDate,
      claimStatusIDS: searchDataCriteria.claimStatusIDS,
      scrubStatusIDS: searchDataCriteria.scrubStatusIDS,
      submitStatusIDS: searchDataCriteria.submitStatusIDS,
      timelyFiling: searchDataCriteria.timelyFiling,
      fromAgingDays: searchDataCriteria.fromAgingDays,
      toAgingDays: searchDataCriteria.toAgingDays,
      fromFee: searchDataCriteria.fromFee,
      toFee: searchDataCriteria.toFee,
      posIDS: searchDataCriteria.posIDS,
      assignedTo: searchDataCriteria.assignedTo,
      claimIDSearch: searchDataCriteria.claimIDSearch,
      patientSearch: searchDataCriteria.patientSearch,
      dosSearch: searchDataCriteria.dosSearch,
      insuranceSearch: searchDataCriteria.insuranceSearch,
      arByFollowUP: searchDataCriteria.arByFollowUP,
      arByWorkDate: searchDataCriteria.arByWorkDate,
      getAllData: true,
      getOnlyIDS: false,
      sortColumn: '',
      sortOrder: '',
      pageNumber: undefined,
      pageSize: undefined,
    };
    const res = await fetchARClaimsSearchData(obj);
    if (res) {
      downloadPdf(res);
    } else {
      setStatusModalInfo({
        ...statusModalInfo,
        show: true,
        heading: 'Error',
        type: StatusModalType.ERROR,
        text: 'A system error prevented the report to be exported. \nPlease try again.',
      });
    }
  };
  const reportDropdownData: ButtonSelectDropdownDataType[] = [
    {
      id: 2,
      value: 'Export to CSV',
      icon: 'csv',
    },
    {
      id: 3,
      value: 'Export to Google Drive',
      icon: 'drive',
    },
  ];
  const onSelectExportOption = (res: ButtonSelectDropdownDataType[]) => {
    if (!searchResult.length) {
      setStatusModalInfo({
        ...statusModalInfo,
        show: true,
        heading: 'Alert',
        type: StatusModalType.WARNING,
        text: 'No Record to Export!',
      });
      return;
    }
    const id = res[0]?.id || 0;
    if (id === 1) {
      ExportPdf();
    }
    if (id === 2) {
      setReportModal(true);
      setExportType('download');
    }
    if (id === 3) {
      setReportModal(true);
      setExportType('upload');
    }
  };

  const getFollowUPDaysTileColor = (value: string) => {
    if (value.includes('Reached')) {
      return 'red';
    }
    if (value.includes('Near')) {
      return 'yellow';
    }
    return 'green';
  };

  // Define the function in the child component and Call child function when parent want
  const childPrintFunction = (res: ButtonSelectDropdownDataType[]) => {
    // console.log('Child print function called for AR Claims!');
    onSelectExportOption(res);
  };

  // Expose the function to the parent component using useImperativeHandle
  useImperativeHandle(ref, () => ({
    childPrintFunction,
  }));

  useEffect(() => {
    if (isClaimTypeChanged) {
      onCinfirm();
    }
  }, [isClaimTypeChanged]);

  return (
    <>
      <div className="flex w-full flex-col gap-4 pt-[75px] pl-[28px] pr-[100px]">
        <div className="flex w-[23%] shrink flex-col items-start gap-1 ">
          <label className="text-sm font-medium leading-5 text-gray-900">
            Claim Type
          </label>
          <div className="w-full">
            <SingleSelectDropDown
              placeholder="Claims Type"
              showSearchBar={false}
              disabled={false}
              data={claimTypeData}
              onSelect={(v) => {
                setSearchCriterea({ ...searchCriterea, claimType: v });
                setClaimTypeChanged(true);
              }}
              selectedValue={searchCriterea.claimType}
            />
          </div>
        </div>
        <div className="flex w-full flex-row gap-4">
          <div className="flex w-[23%] shrink flex-col items-start gap-1 ">
            <label className="text-sm font-medium leading-5 text-gray-900">
              Parameter
            </label>
            <div className="w-full">
              <SingleSelectDropDown
                placeholder="Parameter"
                showSearchBar={false}
                disabled={false}
                data={parameterDropdownList}
                onSelect={(v) => {
                  setSearchCriterea({ ...searchCriterea, parameter: v });
                }}
                selectedValue={searchCriterea.parameter}
              />
            </div>
          </div>
          <div className=" flex w-[23%] flex-col items-start gap-1 self-stretch">
            <label className="text-sm font-medium leading-5 text-gray-900">
              Date Range
            </label>
            <div className="w-full">
              <SingleSelectDropDown
                placeholder="Date Range"
                showSearchBar={false}
                disabled={false}
                data={dateRangeDropdownList}
                selectedValue={searchCriterea.dateRange}
                onSelect={(v) => {
                  setSearchCriterea({ ...searchCriterea, dateRange: v });
                }}
              />
            </div>
          </div>
          <div className="flex w-[23%] flex-col items-start gap-1 self-stretch">
            <label className="text-sm font-medium leading-5 text-gray-900">
              Start Date
            </label>
            <div className="w-full">
              <AppDatePicker
                placeholderText="mm/dd/yyyy"
                cls="mt-1"
                disabled={!(searchCriterea.dateRange?.id === 1)}
                onChange={(date) => {
                  setSearchCriterea({
                    ...searchCriterea,
                    startDate: date,
                  });
                }}
                selected={searchCriterea.startDate}
              />
            </div>
          </div>
          <div className="flex w-[23%] flex-col items-start gap-1 self-stretch">
            <label className="text-sm font-medium leading-5 text-gray-900">
              End Date
            </label>
            <div className="w-full">
              <AppDatePicker
                placeholderText="mm/dd/yyyy"
                cls="mt-1"
                disabled={!(searchCriterea.dateRange?.id === 1)}
                onChange={(date) => {
                  setSearchCriterea({ ...searchCriterea, endDate: date });
                }}
                selected={searchCriterea.endDate}
              />
            </div>
          </div>
          <Button
            buttonType={ButtonType.primary}
            cls={`h-[38px] place-self-end justify-center items-center rounded-md text-white leading-5 text-left font-medium pl-[17px] pr-[17px] pt-[9px] pb-[9px] w-[102.03px]`}
            onClick={onCinfirm}
          >
            Confirm
          </Button>
        </div>
      </div>
      <div className="w-full px-[27px] pt-[52px] ">
        <div className="inline-flex h-full w-full flex-col items-center justify-center rounded-lg border border-gray-300 bg-white shadow">
          <div className="w-full rounded-md bg-gray-200 ">
            <div className="flex flex-col gap-1 py-[16px] pl-[48px]">
              <p className="self-stretch text-base font-normal leading-6 text-gray-900">
                AR Claims within the selected date range
              </p>
              <p className="self-stretch text-2xl font-extrabold leading-8 text-gray-900">
                {statsResult?.totalCount || 0}
              </p>
            </div>
          </div>
          <div className="inline-flex h-full items-start justify-start gap-4 self-stretch p-6">
            <div className="inline-flex w-[53%] flex-col items-start justify-start gap-4 self-stretch">
              <div className="flex shrink grow basis-0 flex-col items-start justify-center gap-4 self-stretch rounded-lg border border-gray-300 bg-white p-4 shadow">
                <div className="font-['Nunito'] text-base font-bold leading-normal text-gray-700">
                  AR Claims by Follow-up Days
                </div>
                <div className="h-px self-stretch bg-gray-200" />
                <div className="inline-flex items-start justify-start gap-4 self-stretch">
                  {statsResult?.arClaimsByFollowUPDays.map((f) => (
                    <>
                      <div
                        className={classNames(
                          `grow shrink basis-0 h-full p-4 bg-${getFollowUPDaysTileColor(
                            f.value
                          )}-50 rounded-md border border-${getFollowUPDaysTileColor(
                            f.value
                          )}-300 justify-start items-start flex`
                        )}
                      >
                        <div className="inline-flex shrink grow basis-0 flex-col items-start justify-start gap-1">
                          <div
                            className={classNames(
                              `text-${getFollowUPDaysTileColor(
                                f.value
                              )}-500 text-sm font-medium font-['Nunito'] leading-tight`
                            )}
                          >
                            {f.value}
                          </div>
                          <div className="inline-flex items-center justify-start self-stretch">
                            <div className="flex h-full shrink grow basis-0 items-end justify-between">
                              <div
                                className={classNames(
                                  `text-${getFollowUPDaysTileColor(
                                    f.value
                                  )}-500 text-xl font-extrabold font-['Nunito'] leading-7`
                                )}
                              >
                                {f.count}
                              </div>
                              <button
                                className="font-['Nunito'] text-xs font-normal leading-none text-cyan-500 underline"
                                onClick={() => {
                                  onSelectStateCategories({
                                    ...searchDataCriteria,
                                    arByFollowUP: f.id?.toString(),
                                    arByWorkDate: '',
                                  });
                                }}
                              >
                                View All
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ))}
                </div>
              </div>
              <div className="flex shrink grow basis-0 flex-col items-start justify-center gap-4 self-stretch rounded-lg border border-gray-300 bg-white p-4 shadow">
                <div className="font-['Nunito'] text-base font-bold leading-normal text-gray-700">
                  AR Claims by Work Date
                </div>
                <div className="h-px self-stretch bg-gray-200" />
                <div className="inline-flex items-start justify-start gap-4 self-stretch">
                  {statsResult?.arClaimsByWorkDates.map((d) => (
                    <>
                      <div className="flex h-full shrink grow basis-0 items-start justify-start rounded-md border border-gray-300 bg-gray-50 p-4">
                        <div className="inline-flex shrink grow basis-0 flex-col items-start justify-start gap-1">
                          <div className="font-['Nunito'] text-sm font-medium leading-tight text-gray-600">
                            {d.value}
                          </div>
                          <div className="inline-flex items-center justify-start self-stretch">
                            <div className="flex h-full shrink grow basis-0 items-end justify-between">
                              <div className="font-['Nunito'] text-xl font-extrabold leading-7 text-gray-600">
                                {d.count}
                              </div>
                              <button
                                className="font-['Nunito'] text-xs font-normal leading-none text-cyan-500 underline"
                                onClick={() => {
                                  onSelectStateCategories({
                                    ...searchDataCriteria,
                                    arByFollowUP: '',
                                    arByWorkDate: d.id?.toString(),
                                  });
                                }}
                              >
                                View All
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ))}
                </div>
              </div>
            </div>
            <div className="inline-flex shrink grow basis-0 flex-col items-start justify-start gap-4 self-stretch rounded-lg border border-gray-300 bg-white p-4 shadow">
              <div className="inline-flex items-center justify-start gap-2">
                <div className="font-['Nunito'] text-base font-bold leading-normal text-gray-700">
                  Unresolved Tasks
                </div>
                <div className="flex items-center justify-center rounded-lg border border-gray-300 bg-gray-100 px-2.5 py-0.5">
                  <div className="text-center font-['Nunito'] text-xs font-medium leading-none text-gray-800">
                    {statsResult?.totalUnResolvedTasksCount}
                  </div>
                </div>
              </div>
              <div className="h-px self-stretch bg-gray-200" />
              <div className="no-scrollbar shrink grow basis-0 self-stretch overflow-y-auto rounded-lg border border-gray-200 px-4 py-1">
                <div className="flex flex-col items-start justify-between">
                  {statsResult?.unResolvedTasksData.map((t) => (
                    <>
                      <div className="inline-flex items-center justify-between self-stretch py-[12px]">
                        <div className="flex items-center justify-start gap-1">
                          <div className="font-['Nunito'] text-sm font-normal leading-tight text-gray-700">
                            Task ID #{t.taskID}
                          </div>
                          <div className="font-['Nunito'] text-xs font-normal leading-none text-gray-500">
                            -
                          </div>
                          <div className="font-['Nunito'] text-xs font-normal leading-none text-gray-500">
                            Claim ID#{t.claimID}
                          </div>
                        </div>
                        <div className="flex items-center justify-start gap-3">
                          <div
                            className={classNames(
                              `px-2.5 py-0.5 bg-${t.taskColor}-100 rounded justify-center items-center flex`
                            )}
                          >
                            <div
                              className={classNames(
                                `text-center text-${t.taskColor}-800 text-xs font-medium font-['Nunito'] leading-none`
                              )}
                            >
                              Due: {t.dueDate}
                            </div>
                          </div>
                          <button
                            className="font-['Nunito'] text-xs font-normal leading-none text-cyan-600 underline"
                            onClick={() => {
                              getTaskGridDataAPICall(t.taskID);
                            }}
                          >
                            View
                          </button>
                        </div>
                      </div>
                      <div className="h-px self-stretch bg-gray-200" />
                    </>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={`w-full py-6`}>
          <div className={`inset-x-0 h-px bg-gray-300`}></div>
        </div>
        <div className="w-full">
          <div className="flex w-full flex-col">
            <div ref={gridRef} className="h-full">
              <SearchDetailGrid
                headerContent={
                  <>
                    <div className="no-scrollbar w-full overflow-x-auto rounded-t-md border border-gray-300 bg-white px-6">
                      <Tabs
                        tabs={tabs}
                        onChangeTab={() => {
                          onSelectStateCategories({
                            ...searchDataCriteria,
                            arByFollowUP: '',
                            arByWorkDate: '',
                          });
                        }}
                        currentTab={getCategoriesCurrentTab()}
                      />
                    </div>
                    <div className="w-full">
                      <div className="flex w-full border-x border-gray-300 bg-cyan-50 px-6 py-4">
                        <div className="w-[50%]">
                          <div className="flex w-full gap-2">
                            <div className="w-[81%]" data-testid="clmsch">
                              <TableSearchBarDropdown
                                placeholder="Search"
                                showSearchBar={true}
                                showDropdownIcon={true}
                                selectedValue={selectedSearchBarDropdown}
                                data={searchBarDropdown}
                                onSelect={(v) => {
                                  const obj: any = { ...v };
                                  setSelectedSearchBarDropdown(obj);
                                }}
                                onSearch={onSearchData}
                              />
                            </div>
                            <div className=" w-[17%]">
                              <Button
                                data-testid="ds"
                                buttonType={ButtonType.primary}
                                cls={`w-full h-[38px] place-self-end justify-center items-center rounded-md text-white leading-5 text-left font-medium pl-[17px] pr-[17px] pt-[9px] pb-[9px]`}
                                onClick={onClickSearch}
                              >
                                Search
                              </Button>
                              <Modal
                                open={isWarningModalOpen}
                                onClose={() => {}}
                                modalContentClassName="relative w-[512px] overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 w-full"
                              >
                                <WarningModal
                                  waringHeading="No Search Results Found"
                                  warningMessage="Sorry, but we could not find any results for your search. Please retry with a different query."
                                  onClose={() => setIsWarningModalOpen(false)}
                                />
                              </Modal>
                            </div>
                          </div>
                        </div>
                        <div className="flex h-[38px] w-[50%] items-center gap-5 px-6">
                          <div className={`truncate `}>
                            <FilterModal
                              cls={'inline-flex'}
                              popperCls={'px-[100px] w-[80%]'}
                              filtersData={filterModalTabs}
                              loadFilterModal={loadFilterModal}
                              onApplyFilter={(value) =>
                                setFilterModalTabs(value)
                              }
                              buttonContent={
                                <button
                                  onClick={() => {
                                    setLoadFilterModal(!loadFilterModal);
                                  }}
                                  aria-describedby={'filter-popover'}
                                  className={`inline-flex items-center justify-center gap-2  border border-solid border-gray-300 bg-white pt-[9px] pb-[9px] pl-[13px] pr-[17px] text-left font-medium leading-5 text-gray-700 transition-all rounded-md`}
                                >
                                  <Icon name={'filter'} size={18} />
                                  <p className="text-sm">Filters</p>
                                </button>
                              }
                            />
                            <ButtonSelectDropdown
                              selectedValue={sortSelected}
                              data={sortDropdownData}
                              onChange={onSelectSortDropdownData}
                              showSelection={true}
                              isSingleSelect={true}
                              cls={'inline-flex'}
                              buttonContent={
                                <button
                                  className={`inline-flex items-center justify-center gap-2  border border-solid border-gray-300 bg-white pt-[9px] pb-[9px] pl-[13px] pr-[17px] text-left  font-medium leading-5 text-gray-700 transition-all`}
                                >
                                  <Icon name={'sort'} size={18} />
                                  <p className="text-sm">Sort</p>
                                </button>
                              }
                            />
                            <ButtonSelectDropdown
                              data={quickActionsDropdownData}
                              onChange={onSelectQuickActionsDropdownData}
                              isSingleSelect={true}
                              cls={'inline-flex'}
                              disabled={!(selectRows.length === 1)}
                              buttonContent={
                                <button
                                  className={classNames(
                                    selectRows.length === 1
                                      ? 'bg-white'
                                      : 'bg-gray-50 cursor-auto',
                                    `inline-flex items-center justify-center gap-2 border border-solid border-gray-300 pt-[9px] pb-[9px] pl-[13px] pr-[17px] text-left font-medium leading-5 text-gray-700 transition-all`
                                  )}
                                >
                                  <Icon name={'quickActions'} size={18} />
                                  <p className="text-sm">Quick Actions</p>
                                </button>
                              }
                            />
                            <ButtonSelectDropdown
                              data={bulkActionsDropdownData}
                              onChange={onSelectBulkActionsDropdownData}
                              cls={'inline-flex'}
                              disabled={!(selectRows.length > 1)}
                              buttonContent={
                                <button
                                  className={classNames(
                                    selectRows.length > 1
                                      ? 'bg-white'
                                      : 'bg-gray-50 cursor-auto',
                                    `inline-flex items-center justify-center gap-2 border border-solid border-gray-300 pt-[9px] pb-[9px] pl-[13px] pr-[17px] text-left font-medium leading-5 text-gray-700 transition-all`
                                  )}
                                >
                                  <Icon name={'bulkActions'} size={18} />
                                  <p className="text-sm">Bulk Actions</p>
                                </button>
                              }
                            />
                            <ButtonSelectDropdownForExport
                              data={reportDropdownData}
                              onChange={onSelectExportOption}
                              isSingleSelect={true}
                              cls={'inline-flex'}
                              disabled={false}
                              buttonContent={
                                <button
                                  className={classNames(
                                    `inline-flex items-center justify-center gap-2  border border-solid border-gray-300 bg-white pt-[9px] pb-[9px] pl-[13px] pr-[17px] text-left  font-medium leading-5 text-gray-700 transition-all rounded-r-md`
                                  )}
                                >
                                  <Icon name={'reports'} size={18} />
                                  <p className="text-sm">Reports</p>
                                </button>
                              }
                            />
                            <Modal
                              open={isAssignClaimToModalOpen}
                              onClose={() => {}}
                              modalContentClassName="relative h-[538px] w-[960px] overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 w-full"
                            >
                              {selectRows.length === 1 && selectRows[0] && (
                                <AssignClaimToModal
                                  label={'Assign Claim'}
                                  DropdownLable={'Assign Claim to*:'}
                                  assignClaimToData={selectedAssigneeData || []}
                                  onClose={() => {
                                    setIsAssignClaimToModalOpen(false);
                                    // getClaimDataByID(claimID);
                                    getARClaimsSearchData(searchDataCriteria);
                                  }}
                                  currentlyAssignee={
                                    searchResult
                                      ?.filter(
                                        (m) => m.claimID === selectRows[0]
                                      )
                                      .map((a) => a.assignee)[0]
                                  }
                                  selectedClaimID={selectRows[0]}
                                />
                              )}
                              {selectRows && selectRows.length > 1 && (
                                <AssignClaimToModal
                                  label={'Assign Claim'}
                                  DropdownLable={'Assign Claim to*:'}
                                  assignClaimToData={selectedAssigneeData || []}
                                  onClose={() => {
                                    setIsAssignClaimToModalOpen(false);
                                    // getClaimDataByID(claimID);
                                    getARClaimsSearchData(searchDataCriteria);
                                  }}
                                  currentlyAssignee={
                                    searchResult
                                      ?.filter(
                                        (m) => m.claimID === selectRows[0]
                                      )
                                      .map((a) => a.assignee)[0]
                                  }
                                  selectedClaimIDS={selectRows}
                                  action={'bulk'}
                                />
                              )}
                            </Modal>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="w-full border border-gray-300 bg-gray-50">
                      <div className="w-full py-4 px-6">
                        <div className="flex w-full flex-wrap gap-2">
                          <div className="self-center text-sm font-bold leading-5 text-gray-600">
                            Active filters:
                          </div>
                          {activefilters.map((d, index) => {
                            return (
                              <div
                                key={index}
                                className="flex gap-1 rounded bg-cyan-100 px-[8px]"
                              >
                                <div className="py-[2px]  text-sm text-cyan-700">
                                  {d.value}
                                </div>
                                {d.type !== 'All' && (
                                  <div>
                                    <button
                                      onClick={() => {
                                        onDeselectActivefilters(d);
                                      }}
                                      className="py-[2px] text-sm font-bold text-cyan-400"
                                    >
                                      x
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </>
                }
                pageNumber={lastSearchDataCriteria.pageNumber}
                pageSize={lastSearchDataCriteria.pageSize}
                totalCount={totalCount}
                rows={
                  searchResult.map((row) => {
                    return { ...row, id: row.claimID };
                  }) || []
                }
                columns={columns}
                checkboxSelection={true}
                onDetailPanelExpandedRowIdsChange={
                  handleDetailPanelExpandedRowIdsChange
                }
                persistLayoutId={2}
                detailPanelExpandedRowIds={detailPanelExpandedRowIds}
                expandedRowContent={expandedRowContent}
                selectRows={selectRows}
                onSelectAllClick={onSelectAll}
                onSelectRow={(ids: number[]) => {
                  if (ids.length === totalCount) {
                    onSelectAll();
                  } else if (
                    selectRows.length ===
                    ids.length + (lastSearchDataCriteria.pageSize || 0)
                  ) {
                    setSelectRows([]);
                  } else if (
                    ids.length === (totalCount || 0) &&
                    selectRows.length === 1
                  ) {
                    setSelectRows([]);
                  } else {
                    setSelectRows(ids);
                  }
                }}
                onPageChange={(page: number) => {
                  const obj = {
                    ...lastSearchDataCriteria,
                    pageNumber: page,
                  };
                  setLastSearchDataCriteria(obj);
                  getARClaimsSearchData(obj);
                }}
                onSortChange={(
                  field: string | undefined,
                  sort: 'asc' | 'desc' | null | undefined
                ) => {
                  if (searchResult.length) {
                    const obj = {
                      ...lastSearchDataCriteria,
                      sortColumn: field || '',
                      sortOrder: sort || '',
                    };
                    setLastSearchDataCriteria(obj);
                    getARClaimsSearchData(obj);
                  }
                }}
                onPageSizeChange={(pageSize: number, page: number) => {
                  if (searchResult.length) {
                    const obj = {
                      ...lastSearchDataCriteria,
                      pageSize,
                      pageNumber: page,
                    };
                    setLastSearchDataCriteria(obj);
                    getARClaimsSearchData(obj);
                  }
                }}
                setHeaderRadiusCSS={false}
              />
            </div>
          </div>
        </div>
        <div className="p-10"></div>
        {selectRows[0] && noteSliderOpen && selectRows.length === 1 && (
          <AddEditViewNotes
            id={selectRows[0]}
            open={noteSliderOpen}
            noteType={'claim'}
            groupID={selectedGroup?.id}
            onClose={() => {
              setNoteSliderOpen(false);
            }}
            disableBackdropClick={true}
          />
        )}
        {selectRows && noteSliderOpen && selectRows.length > 1 && (
          <AddEditViewNotes
            ids={selectRows}
            action={'bulk'}
            open={noteSliderOpen}
            noteType={'claim'}
            groupID={selectedGroup?.id}
            onClose={() => {
              setNoteSliderOpen(false);
            }}
            disableBackdropClick={true}
          />
        )}
        <Modal
          open={createTaskModal.open}
          onClose={() => {}}
          modalContentClassName="h-[calc(100%-80px)] w-[calc(100%-420px)] relative rounded-lg bg-white shadow-xl transition-all sm:my-8"
        >
          <CreateTaskModal
            assignClaimToData={assignClaimToData || []}
            onCloseModal={() => {
              setCreateTaskModal({
                open: false,
                claimID: undefined,
                patientID: undefined,
                selectedTaskData: undefined,
                taskModalInEditMode: undefined,
              });
              getARClaimsSectionCategories();
              getARClaimsSearchData(searchDataCriteria);
            }}
            newTaskClaimID={createTaskModal?.claimID}
            newTaskPatientID={createTaskModal?.patientID}
            selectedTaskData={createTaskModal?.selectedTaskData}
            taskModalInEditMode={createTaskModal?.taskModalInEditMode}
            claimIDS={selectRows.toString()}
            action={action}
          />
        </Modal>
        <Modal
          open={isInsuranceModalOpen}
          onClose={() => setIsInsuranceModalOpen(false)}
          modalContentClassName="relative w-[480px] overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 w-full"
        >
          <InsuranceDetailsModal
            onClose={() => setIsInsuranceModalOpen(false)}
            insuranceID={selectedInsuranceID || null}
          />
        </Modal>
        <Modal
          open={reportModal}
          onClose={() => {}}
          modalContentClassName="relative w-[40%] overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 w-full"
        >
          <div className="flex flex-col bg-gray-100">
            <div className="mt-3 max-w-full p-4">
              <div className="flex flex-row justify-between">
                <div>
                  <h1 className=" ml-2  text-left text-xl font-bold leading-7 text-gray-700">
                    Report Settings
                  </h1>
                </div>
                <div className="justify-between">
                  <CloseButton
                    onClick={() => {
                      setReportModal(false);
                    }}
                  />
                </div>
              </div>
              <div className="mt-3 h-px w-full bg-gray-300" />
            </div>
            <div className="flex flex-col">
              <div className=" px-6 pt-2">
                <div className="flex gap-3">
                  <label className="text-sm font-medium leading-5 text-gray-900">
                    Select the type of report you would like to export:
                  </label>
                </div>
                <div className="flex gap-3 pt-4 pl-3">
                  <RadioButton
                    data={[{ value: 'Claim', label: 'Claim Level Report' }]}
                    checkedValue={reportCheck}
                    onChange={(e) => {
                      setReportCheck(e.target.value);
                    }}
                  />
                </div>
                <div className="flex gap-3 pt-2 pl-3">
                  <RadioButton
                    data={[{ value: 'Charge', label: 'Charge Level Report' }]}
                    checkedValue={reportCheck}
                    onChange={(e) => {
                      setReportCheck(e.target.value);
                    }}
                  />
                </div>
                <div className="mt-7" />
              </div>
            </div>
            <div className={`h-[90px] bg-gray-200 w-full`}>
              <div className="flex flex-row-reverse gap-4 p-6 ">
                <div>
                  <Button
                    buttonType={ButtonType.primary}
                    onClick={() => {
                      exportCsv();
                    }}
                  >
                    Export Report
                  </Button>
                </div>
                <div>
                  <Button
                    buttonType={ButtonType.secondary}
                    cls={`w-[102px]`}
                    onClick={() => {
                      setReportModal(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
        <Modal
          open={changeStatus}
          onClose={() => {}}
          modalContentClassName="relative w-[60%] overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 w-full"
        >
          <div className="flex flex-col bg-gray-100">
            <div className="mt-3 max-w-full p-4">
              <div className="flex flex-row justify-between">
                <div>
                  <h1 className=" text-left  text-xl font-bold leading-7 text-gray-700">
                    Manually Change Claim Status
                  </h1>
                </div>
                <div className="">
                  <CloseButton
                    onClick={() => {
                      setChangeStatus(false);
                      setChangedStatusVal(undefined);
                      setEditNote('');
                      setStatusValue('');
                    }}
                  />
                </div>
              </div>
              <div className="mt-3 h-px w-full bg-gray-200" />
            </div>
            <div className="flex flex-col">
              <div className=" px-6 pt-6">
                <div className={` `}>
                  <div className={`   `}>
                    <div>
                      <div className="flex gap-3">
                        {action === 'quick' && (
                          <div className="flex w-[32%] shrink flex-col items-start gap-1 ">
                            <label className="text-sm font-medium leading-5 text-gray-900">
                              Current Claim Status:
                            </label>
                            <div className="h-[38px] w-full">
                              <InputField
                                placeholder="Value"
                                disabled={true}
                                value={statusValue || ''}
                              />
                            </div>
                          </div>
                        )}
                        <div className="flex w-[32%] shrink flex-col items-start gap-1 text-left ">
                          <label className="text-sm font-medium leading-5 text-gray-900">
                            Change Claim Status to*:
                          </label>
                          <div className="w-full">
                            <SingleSelectDropDown
                              placeholder="select a value"
                              showSearchBar={false}
                              disabled={false}
                              data={
                                // hide void status in dropdown
                                changeStatusToDropdownList.filter(
                                  (item) => item.value !== 'Void'
                                )
                              }
                              onSelect={(e) => {
                                setChangedStatusVal(e);
                              }}
                              selectedValue={changedStatusVal}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 h-px w-full bg-gray-200" />
              </div>
              <div className="flex flex-col p-[24px] px-6">
                <div className="mb-3">
                  <label className="flex text-sm  font-bold leading-5 text-gray-700">
                    Why are you manually changing the Claim status?
                  </label>
                </div>
                <div>
                  <TextArea
                    id="textarea"
                    value={editNote}
                    cls=" flex h-36 flex-col overflow-y-auto rounded-md  border border-gray-300 bg-white"
                    placeholder={'Click here to write note'}
                    onChange={(e) => {
                      setEditNote(e.target.value);
                    }}
                  />
                </div>
              </div>
            </div>
            <div className={`h-[120px] bg-gray-200 w-full`}>
              <div className="flex flex-row-reverse gap-4 p-6 ">
                <div>
                  <Button
                    buttonType={ButtonType.primary}
                    onClick={async () => {
                      if (!changedStatusVal) {
                        setStatusModalInfo({
                          ...statusModalInfo,
                          show: true,
                          heading: 'Alert',
                          type: StatusModalType.WARNING,
                          text: 'This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.',
                        });
                        return;
                      }
                      if (action === 'quick') {
                        const claimSdata = {
                          claimID: selectRows[0],
                          claimStatusID: changedStatusVal?.id,
                          note: editNote,
                        };
                        const resStatus = await changeClaimStatus(claimSdata);
                        if (!resStatus) {
                          setStatusModalInfo({
                            ...statusModalInfo,
                            show: true,
                            heading: 'Error',
                            type: StatusModalType.ERROR,
                            text: 'A system error prevented the claim status to be updated.\n Please try again.',
                          });
                          return;
                        }
                        setChangeStatus(false);
                        setChangedStatusVal(undefined);
                        setEditNote('');
                        setStatusValue('');
                        getARClaimsSearchData(searchDataCriteria);
                      } else {
                        const claimSdata = {
                          claimIDS: selectRows.join(','),
                          claimStatusID: changedStatusVal?.id,
                          note: editNote,
                        };
                        const resStatus = await changeClaimsStatuses(
                          claimSdata
                        );
                        if (!resStatus) {
                          setStatusModalInfo({
                            ...statusModalInfo,
                            show: true,
                            heading: 'Error',
                            type: StatusModalType.ERROR,
                            text: 'A system error prevented the claim status to be updated.\n Please try again.',
                          });
                          return;
                        }
                        setChangeStatus(false);
                        setChangedStatusVal(undefined);
                        setEditNote('');
                        setStatusValue('');
                        getARClaimsSearchData(searchDataCriteria);
                      }
                    }}
                  >
                    Confirm
                  </Button>
                </div>
                <div>
                  <Button
                    buttonType={ButtonType.secondary}
                    cls={`w-[102px]`}
                    onClick={() => {
                      setChangeStatus(false);
                      setChangedStatusVal(undefined);
                      setEditNote('');
                      setStatusValue('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
        <Modal
          open={postingDateModel.show}
          onClose={() => {}}
          modalContentClassName="rounded-lg bg-gray-100  text-left shadow-xl  h-[200px] w-[300px] "
        >
          <div className="mx-[27px] flex h-[60px] items-center justify-between gap-4">
            <div className="h-[28px] w-full">
              <SectionHeading label="Add Posting date" isCollapsable={false} />
              <div className=" flex items-center justify-end gap-5">
                <CloseButton
                  onClick={() => {
                    setPostingDateModel({
                      type: '',
                      show: false,
                    });
                    setVoidPostingDate('');
                  }}
                />
              </div>
            </div>
          </div>
          <div className="  bg-gray-100">
            <div className={`px-[27px] relative w-[280px] h-[60px] flex gap-2`}>
              <div className={`w-full items-start self-stretch`}>
                <label className="text-sm font-medium leading-5 text-gray-900">
                  Posting date
                </label>
                <div className="w-[144px]">
                  <AppDatePicker
                    placeholderText="mm/dd/yyyy"
                    cls=""
                    onChange={(date) => {
                      if (date) {
                        const as = DateToStringPipe(date, 1);
                        setVoidPostingDate(as);
                      }
                    }}
                    selected={voidPostingDate}
                  />
                </div>
              </div>
            </div>
            <div className="w-full pt-[25px]">
              <div className="h-[56px] w-full bg-gray-200 ">
                <div className="w-full">
                  <div className="h-px w-full bg-gray-300" />
                </div>
                <div className=" py-[7px] pr-[7px]">
                  <div className={`gap-4 flex justify-end `}>
                    <div>
                      <Button
                        buttonType={ButtonType.primary}
                        cls={` `}
                        onClick={() => {
                          onVoidClaim();
                        }}
                      >
                        {' '}
                        Done
                      </Button>
                    </div>
                    <div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
        <Modal
          open={showPaymentPostingPopUp}
          onClose={() => {}}
          modalContentClassName="h-[calc(100%-80px)] w-[calc(100%-220px)] relative rounded-lg bg-white shadow-xl transition-all sm:my-8"
        >
          {postPaymentData && (
            <PaymentPosting
              claimID={postPaymentData.claimID}
              groupID={postPaymentData.groupID}
              onClose={() => {
                setShowPaymentPostingPopUp(false);
                getARClaimsSearchData(searchDataCriteria);
              }}
              patientID={postPaymentData.patientID}
            />
          )}
        </Modal>
        <Modal
          open={showScrubingResponse.open}
          onClose={() => {}}
          modalContentClassName="h-[calc(100%-200px)] w-[calc(100%-520px)] relative rounded-lg bg-white shadow-xl transition-all sm:my-8"
          hideBackdrop
        >
          <ScrubingResponseModal
            onClose={() => {
              setShowScrubingResponse({ open: false });
            }}
            data={showScrubingResponse.data}
          />
        </Modal>
        <StatusModal
          open={statusModalState.open}
          heading={statusModalState.heading}
          description={statusModalState.description}
          okButtonText={statusModalState.okButtonText}
          bottomDescription={statusModalState.bottomDescription}
          okButtonColor={statusModalState.okButtonColor}
          closeButtonColor={statusModalState.closeButtonColor}
          closeButtonText={statusModalState.closeButtonText}
          statusModalType={statusModalState.statusModalType}
          showCloseButton={statusModalState.showCloseButton}
          closeOnClickOutside={statusModalState.closeOnClickOutside}
          onClose={() => {
            setStatusModalState({
              ...statusModalState,
              open: false,
            });
            if (submitSingleClaim) {
              if (statusModalState.showCloseButton) {
                dispatch(
                  addToastNotification({
                    id: uuidv4(),
                    text: 'Submission Canceled by User',
                    toastType: ToastType.ERROR,
                  })
                );
              }
              setSubmitSingleClaim(false);
            }
            getARClaimsSearchData(searchDataCriteria);
          }}
          onChange={() => {
            setStatusModalState({
              ...statusModalState,
              open: false,
            });
            if (showErrorMesaage) {
              setShowErrorMesaage(false);
              return;
            }
            if (submitSingleClaim) {
              if (!statusModalState.showCloseButton) {
                dispatch(
                  addToastNotification({
                    id: uuidv4(),
                    text: 'Submission Error: Rejected by Nucleus',
                    toastType: ToastType.ERROR,
                  })
                );
              } else {
                onSubmitSingleClaim(true);
              }
              setSubmitSingleClaim(false);
              return;
            }
            setStatusDetailModalState({
              ...statusDetailModalState,
              open: true,
              headingText: statusModalHeading,
              data: claimsScrubingResponce.current.map((d) => {
                return { ...d, title: `#${d.id} - ${d.title}` };
              }),
            });
          }}
          statusData={statusModalState.statusData}
        />
        <StatusDetailModal
          open={statusDetailModalState.open}
          headingText={statusDetailModalState.headingText}
          data={statusDetailModalState.data}
          onClose={() => {
            setStatusDetailModalState({
              ...statusDetailModalState,
              open: false,
            });
            getARClaimsSearchData(searchDataCriteria);
          }}
        />
        <StatusModal
          open={statusModalInfo.show}
          heading={statusModalInfo.heading}
          description={statusModalInfo.text}
          statusModalType={statusModalInfo.type}
          showCloseButton={false}
          closeOnClickOutside={true}
          onChange={() => {
            setStatusModalInfo({
              ...statusModalInfo,
              show: false,
              heading: '',
              text: '',
            });
          }}
          onClose={() => {
            setStatusModalInfo({
              ...statusModalInfo,
              show: false,
              heading: '',
              text: '',
            });
          }}
        />
      </div>
    </>
  );
});

export default ARClaimsTab;
