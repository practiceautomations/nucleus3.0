import { Tooltip } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid-pro';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { MultiValue, SingleValue } from 'react-select';
import { v4 as uuidv4 } from 'uuid';

import GroupProfileModal from '@/components/GroupProfileModal';
import Icon from '@/components/Icon';
import Tabs from '@/components/OrganizationSelector/Tabs';
import PageHeader from '@/components/PageHeader';
// eslint-disable-next-line import/no-cycle
import PatientProfileModal from '@/components/PatientProfileModal';
import ProviderProfileModal from '@/components/ProviderProfileModal';
import AddCharge from '@/components/UI/AddCharge';
import AppDatePicker from '@/components/UI/AppDatePicker';
import Breadcrumbs from '@/components/UI/Breadcrumbs/breadcrumbs';
import Button, { ButtonType } from '@/components/UI/Button';
import ButtonDropdown from '@/components/UI/ButtonDropdown';
// eslint-disable-next-line import/no-cycle
import ChargeDetail from '@/components/UI/ChargeDetail';
import { AddNewDocument } from '@/components/UI/ChargeDetail/add-new-document';
import { ChargePaymentLedger } from '@/components/UI/ChargeDetail/charge-payment-ledger';
import CheckBox from '@/components/UI/CheckBox';
import AssignClaimToModal from '@/components/UI/ClaimDetailsModals/AssignClaimToModal';
// eslint-disable-next-line import/no-cycle
import ClaimServiceDetails from '@/components/UI/ClaimDetailsModals/ClaimServiceDetails';
import ClaimStatusDetails from '@/components/UI/ClaimDetailsModals/ClaimStatusDetails';
import CreateTaskModal from '@/components/UI/ClaimDetailsModals/CreateTask';
import CloseButton from '@/components/UI/CloseButton';
import CreateCrossover from '@/components/UI/CreateCrossover';
// eslint-disable-next-line import/no-cycle
import ClaimDetailWidget from '@/components/UI/GridWidget/ClaimDetailWidget';
// eslint-disable-next-line import/no-cycle
import ClaimBalance from '@/components/UI/GridWidget/ClaimDetailWidget/ClaimBalanceWidget';
import Modal from '@/components/UI/Modal';
import type { MultiSelectGridDropdownDataType } from '@/components/UI/MultiSelectGridDropdown';
// eslint-disable-next-line import/no-cycle
import PaymentPosting from '@/components/UI/PaymentPosting';
import SectionHeading from '@/components/UI/SectionHeading';
import type { SingleSelectGridDropdownDataType } from '@/components/UI/SingleSelectGridDropdown';
import SingleSelectGridDropDown from '@/components/UI/SingleSelectGridDropdown';
import type { StatusDetailModalDataType } from '@/components/UI/StatusDetailModal';
import StatusDetailModal from '@/components/UI/StatusDetailModal';
// import type { StatusModalProps } from '@/components/UI/StatusModal';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import AppTable, {
  AppTableCell,
  AppTableRow,
  reOrderData,
} from '@/components/UI/Table';
import UserProfileModal from '@/components/UI/UserProfileModal';
import ViewNotes from '@/components/ViewNotes';
// import AppLayout from '@/layouts/AppLayout';
import TaskWindowPane from '@/screen/claim/task-window-pane';
// eslint-disable-next-line import/no-cycle
import ClaimDNA from '@/screen/claim-detail/claimDNA';
import type { IcdData } from '@/screen/createClaim';
// eslint-disable-next-line import/no-cycle
import DetailPaymentERA from '@/screen/payments/DetailPaymentERA';
import {
  addToastNotification,
  fetchAssignClaimToDataRequest,
  fetchICDSearchDataRequest,
  fetchUploadedClaimDocumentDataRequest,
  fetchUploadedClaimDocumentSuccess,
  getLookupDropdownsRequest,
} from '@/store/shared/actions';
import {
  claimsScrubing,
  deleteDocument,
  deleteSelectedICD,
  downloadDocumentBase64,
  editClaim,
  fetchClaimDataByID,
  fetchClaimDetailDataByID,
  fetchInsuranceInfoData,
  fetchPostingDate,
  getClaimDetailSummaryById,
  getClaimFinancial,
  getClaimRoute,
  getClaimUB04PDF,
  getTaskGridData,
  reversePaymentLedger,
  submitClaim,
  updateChargeDiagnosisFields,
  updateChargeSortOrder,
  updateClaimDocumentEAttachment,
  // voidClaim,
  voidClaims,
} from '@/store/shared/sagas';
import {
  getAssignClaimToDataSelector,
  getClaimDocumentDataSelector,
  getExpandSideMenuSelector,
  getICDSearchDataSelector,
  getLookupDropdownsDataSelector,
} from '@/store/shared/selectors';
import type {
  AllClaimsScrubResponseResult,
  ChargeDiagnosisFieldsUpdate,
  ClaimDataByClaimIDResult,
  ClaimDetailResultById,
  ClaimFinancials,
  ICDSearchCriteria,
  InsuranceInfoData,
  LookupDropdownsData,
  PostingDateCriteria,
  ReversePaymetLedgerFields,
  // SaveChargeRequestPayload,
  SaveClaimRequestPayload,
  SummaryBillingCharges,
  TaskGridData,
  UploadedDocumentCriteria,
  UploadedDocumentOutput,
} from '@/store/shared/types';
import { ToastType } from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';
import { DateToStringPipe } from '@/utils/dateConversionPipes';
import useOnceEffect from '@/utils/useOnceEffect';

import ScrubingResponseModal from '../ScrubbingResponse';
import InfoToggle from '../UI/InfoToggle';

interface Tprops {
  claimID: number;
  isPopup?: boolean;
  onCloseModal: () => void;
}

export default function ClaimDetail({
  claimID,
  onCloseModal,
  isPopup,
}: Tprops) {
  const dispatch = useDispatch();
  const divHeightActions = 79;
  const divHeightTaskView = 240;
  const icdTableRef = useRef<HTMLTableRowElement>(null);
  const [icdRows, setIcdRows] = useState<IcdData[]>([]);
  const [icdSearch, setIcdSearch] = useState<ICDSearchCriteria>({
    searchValue: '',
  });
  const [isDocumentsOpen, setIsDocumentsOpen] = useState<boolean>(false);
  const [viewChargeClick, setViewChargeClick] = useState(false);

  const [showAddICDRow, setshowAddICDRow] = useState(false);
  const [dxCode, setdxCode] = useState<
    MultiValue<MultiSelectGridDropdownDataType>
  >([]);
  // const [chargesRow, setChargesRow] = useState<ChargesData[]>([]);
  const [icdOrderCount, setIcdOrderCount] = useState(1);
  const startIndex = React.useRef<number | undefined>();
  const [selectedICDCode, setSelctedICDCode] =
    useState<SingleValue<SingleSelectGridDropdownDataType>>();
  const [dragOverIndex, setDragOverIndex] = useState<number>();
  const [chargeDragOverIndex, setChargeDragOverIndex] = useState<number>();
  const [selectedCrossOverChargeId, setSelectedCrossOverChargeId] =
    useState<number>();
  const [addICDDescription, setAddICDDescription] = useState<string>();
  const [claimData, setClaimData] = useState<ClaimDataByClaimIDResult>();
  const [summaryCharges, setSummaryCharges] = useState<SummaryBillingCharges[]>(
    []
  );
  const [showCrossoverClaimModal, setShowCrossoverClaimModal] =
    useState<boolean>(false);
  const [taskGridData, setTaskGridData] = useState<TaskGridData[]>([]);
  const tabstask = [
    {
      id: 1,
      name: 'Unresolved',
      count: taskGridData?.filter((m) => m.resolve === false).length,
    },
    {
      id: 2,
      name: 'Resolved',
      count: taskGridData?.filter((m) => m.resolve === true).length,
    },
  ];
  const router = useRouter();
  // const { claimIdx } = router.query;
  // const claimID =
  //   claimId && typeof claimId === 'string' ? Number(claimId) : 0;
  // const [routePath, setRoutePath] = useState<string>();
  // useEffect(() => {
  //   if (routePath) {
  //     router.push(routePath);
  //   }
  // }, [routePath]);
  const [isSubmitButtonClicked, setIsSubmitButtonClicked] = useState(false);
  const [isScrubButtonClicked, setIsScrubButtonClicked] = useState(false);
  const [isCancelButtonClick, setIsCancelButtonClick] = useState(false);
  const [voidClaimButtonClick, setVoidClaimButtonClick] = useState(false);
  const [isAssignClaimToModalOpen, setIsAssignClaimToModalOpen] =
    useState(false);
  const [isSaveButtonClick, setIsSaveButtonClick] = useState(false);
  const [onSaveChanges, setOnSaveChanges] = useState(false);
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] =
    useState<boolean>(false);
  const [relatedClaimID, setRelatedClaimID] = useState<
    number | null | undefined
  >();

  const [providerModalOpen, setProviderModalOpen] = useState(false);
  const [patientModalOpen, setPatientModalOpen] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const closeModal = () => {
    setProviderModalOpen(false);
    setPatientModalOpen(false);
    setGroupModalOpen(false);
    setUserModalOpen(false);
  };

  const uploadDocumentData = useSelector(getClaimDocumentDataSelector);
  const [submitModalState, setSubmitModalState] = useState<{
    open: boolean;
    heading: string;
    description: string;
    bottomDescription: string;
    okButtonText: string;
    closeButtonText: string;
    statusModalType: StatusModalType;
    closeButtonColor: ButtonType;
    okButtonColor: ButtonType;
    showCloseButton: boolean;
    closeOnClickOutside: boolean;
    statusData: StatusDetailModalDataType[];
  }>({
    open: false,
    heading: '',
    description: '',
    bottomDescription: '',
    okButtonText: '',
    closeButtonText: '',
    statusModalType: StatusModalType.ERROR,
    closeButtonColor: ButtonType.primary,
    okButtonColor: ButtonType.secondary,
    showCloseButton: true,
    closeOnClickOutside: true,
    statusData: [],
  });
  const [confirmationHeading, setConfirmationHeading] = useState<string>();
  const [viewNotesKey, setViewNotesKey] = useState(uuidv4());
  const [confirmationDescription, setConfirmationDescription] =
    useState<string>();
  const [selectedClaimData, setSelectedClaimData] =
    useState<ClaimDetailResultById | null>();
  const [insuranceInfoData, setInsuranceInfoData] =
    useState<InsuranceInfoData | null>();
  const [showWarningModal, setWarningModal] = useState(false);
  const [isJSONChanged, setIsJSONChanged] = useState(false);
  const [allowEditCharge, setAllowEditCharge] = useState(true);
  // const [showPatientWarningModal, setPatientWarningModal] = useState(false);
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const getClaimDataByID = async (id: number) => {
    const res = await fetchClaimDetailDataByID(id);
    if (res) {
      setSelectedClaimData(res);
      const strNum = res.totalBalance;
      const num = Number(strNum);
      setTotalBalance(num);
    }
  };
  const getClaimData = async () => {
    const res = await fetchClaimDataByID(claimID);
    if (res) {
      setClaimData(res);
      // const chargesEditRows: SaveChargeRequestPayload[] = res.charges?.map(
      //   (m) => {
      //     return {
      //       chargeID: m.chargeID,
      //       claimID,
      //       groupID: res.groupID,
      //       fromDOS: m.fromDOS,
      //       toDOS: m.toDOS,
      //       cptCode: m.cptCode,
      //       units: m.units,
      //       mod1: m.mod1,
      //       mod2: m.mod2,
      //       mod3: m.mod3,
      //       mod4: m.mod4,
      //       placeOfServiceID: m.placeOfServiceID,
      //       icd1: m.icd1,
      //       icd2: m.icd2,
      //       icd3: m.icd3,
      //       icd4: m.icd4,
      //       ndcNumber: m.ndcNumber,
      //       ndcUnit: m.ndcUnit,
      //       ndcUnitQualifierID: m.ndcUnitQualifierID,
      //       serviceDescription: m.serviceDescription,
      //       fee: m.fee,
      //       insuranceAmount: m.insuranceAmount,
      //       patientAmount: m.patientAmount,
      //       chargeBatchID: m.chargeBatchID,
      //       chargePostingDate: m.chargePostingDate,
      //       systemDocumentID: m.systemDocumentID,
      //       pageNumber: m.pageNumber,
      //       pointers: m.pointers,
      //       sortOrder: m.sortOrder,
      //     };
      //   }
      // );
      // setChargesRow(() => {
      //   return chargesEditRows?.map((chargeRow) => {
      //     return { charge: chargeRow, isEditMode: true };
      //   });
      // });
    }
  };
  useEffect(() => {
    // this needs to be removed
    if (selectedClaimData) {
      dispatch(
        fetchAssignClaimToDataRequest({
          clientID: selectedClaimData.groupID,
        })
      );
    }
  }, [selectedClaimData]);
  const claimsSubmittingResponse = useRef<StatusDetailModalDataType[]>([]);
  const [lookUpData, setLookUpData] = useState<LookupDropdownsData>();
  const lookupsData = useSelector(getLookupDropdownsDataSelector);
  const initProfile = () => {
    dispatch(getLookupDropdownsRequest());
  };
  useEffect(() => {
    initProfile();
  }, []);
  useEffect(() => {
    if (lookupsData) {
      setLookUpData(lookupsData);
    }
  }, [lookupsData]);
  const badgeClaimFromStatusClass = (claimStatus: string) => {
    let badgeClass = 'bg-gray-100 text-gray-800 rounded-[2px]';
    const statusColor =
      lookUpData &&
      lookUpData?.claimStatus
        .filter((a) => a.value === claimStatus)
        .map((a) => a.color)[0];
    if (statusColor) {
      if (statusColor.includes('green')) {
        badgeClass = 'bg-green-100 text-green-800 rounded-[2px]';
      } else if (statusColor.includes('red')) {
        badgeClass = 'bg-red-100 text-red-800 rounded-[2px]';
      } else if (statusColor.includes('yellow')) {
        badgeClass = 'bg-yellow-100 text-yellow-800 rounded-[2px]';
      } else {
        badgeClass = 'bg-gray-100 text-gray-800 rounded-[2px]';
      }
    }
    return badgeClass;
  };
  const badgeClaimFromStatusIcon = (claimStatus: string) => {
    let icon = IconColors.GRAY;
    const statusColor =
      lookUpData &&
      lookUpData?.claimStatus
        .filter((a) => a.value === claimStatus)
        .map((a) => a.color)[0];
    if (statusColor) {
      if (statusColor.includes('green')) {
        icon = IconColors.GREEN;
      } else if (statusColor.includes('red')) {
        icon = IconColors.RED;
      } else if (statusColor.includes('yellow')) {
        icon = IconColors.Yellow;
      } else {
        icon = IconColors.GRAY;
      }
    }
    return icon;
  };

  const BalanceCardBackgroundColor = () => {
    if (totalBalance > 0) {
      return 'bg-red-50 border-red-500 text-red-500';
    }
    if (totalBalance === 0) {
      return 'bg-green-50 border-green-500 text-green-500';
    }
    return 'bg-yellow-50 border-yellow-500 text-yellow-500';
  };

  const priorityOrderRender = (n: number | undefined) => {
    return (
      <div
        className={`relative mr-3 h-5 w-5 text-clip rounded bg-[rgba(6,182,212,1)] text-left font-['Nunito'] font-semibold text-white [box-shadow-width:1px] [box-shadow:0px_0px_0px_1px_rgba(6,_182,_212,_1)_inset]`}
      >
        <p className="absolute left-1.5 top-0.5 m-0 text-xs leading-4">{n}</p>
      </div>
    );
  };

  const [postingDateModel, setPostingDateModel] = useState({
    type: '',
    show: false,
  });
  const [reversePostingDate, setReversePostingDate] = useState<string>('');
  const [voidPostingDate, setVoidPostingDate] = useState<string>('');
  const [reverseLedgerID, setReverseLedgerID] = useState<number>();

  const defaultStatusModalState = {
    open: false,
    heading: '',
    description: '',
    okButtonText: 'Ok',
    closeButtonText: 'Close',
    statusModalType: StatusModalType.ERROR,
    showCloseButton: false,
    closeOnClickOutside: false,
    confirmActionType: '',
  };
  const [statusModalState, setStatusModalState] = useState(
    defaultStatusModalState
  );

  const [isTaskCreated, setIsTaskCreated] = useState(false);
  const getTaskGridDataAPICall = async (selectedClaimID: number) => {
    const res = await getTaskGridData(selectedClaimID);
    if (res) {
      setTaskGridData(res);
    }
  };
  const [isOpen, setIsOpen] = React.useState(false);

  useEffect(() => {
    if (!isTaskCreated && taskGridData && !isOpen) {
      const aletOpen = taskGridData.filter((m) => m.alertPopUp === true);
      if (aletOpen.length) {
        setStatusModalState({
          ...statusModalState,
          open: true,
          heading: 'Task Alert',
          description:
            'You are receiving this notification because one or more tasks associated with this claim may require your attention. An alert icon (exclamation mark) identifies them.',
          okButtonText: 'View Tasks',
          closeButtonText: 'Dismiss',
          statusModalType: StatusModalType.WARNING,
          showCloseButton: true,
          closeOnClickOutside: false,
          confirmActionType: 'view_task',
        });
      }
    }
  }, [taskGridData]);
  const assignClaimToData = useSelector(getAssignClaimToDataSelector);
  const getClaimSummaryData = async (id: number) => {
    const res = await getClaimDetailSummaryById(id);
    if (res) {
      setSummaryCharges(res.charges);
      const icdsRows = res.icds?.map((m) => {
        return {
          icd10Code: m.code,
          order: m.order,
          description: m.description,
          selectedICDObj: { id: m.id, value: m.code },
        };
      });
      setIcdRows(icdsRows);
      setIcdOrderCount(icdsRows.length + 1);
    }
  };
  const getClaimDocumentData = () => {
    const getDocCriteria: UploadedDocumentCriteria = {
      claimID,
      categoryID: undefined,
      groupID: undefined,
    };
    dispatch(fetchUploadedClaimDocumentDataRequest(getDocCriteria));
  };

  useEffect(() => {
    if (claimID) {
      getClaimData();
      getClaimDataByID(claimID);
      getTaskGridDataAPICall(claimID);
      getClaimSummaryData(claimID);
      getClaimDocumentData();
    }
  }, [claimID]);
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
  // const [statusModalHeading, setStatusModalHeading] = useState('');
  const [claimBalanceData, setClaimBalanceData] = useState<ClaimFinancials>();
  const [openAddUpdateERAModealInfo, setOpenAddUpdateERAModealInfo] = useState<{
    open: boolean;
    type?: string;
    id?: number;
  }>({ open: false });
  const columns: GridColDef[] = [
    {
      field: 'ledgerID',
      headerName: 'Ledger ID',
      flex: 1,
      minWidth: 110,
      disableReorder: true,
    },
    {
      field: 'paymentBatch',
      headerName: 'Pay. Batch',
      flex: 1,
      minWidth: 200,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <p className="cursor-pointer text-sm leading-tight text-cyan-400 underline">
            {params.value}
          </p>
        );
      },
    },
    {
      field: 'chargeID',
      headerName: 'Charge ID',
      flex: 1,
      minWidth: 100,
      disableReorder: true,
    },
    {
      field: 'cptCode',
      headerName: 'CPT Code',
      minWidth: 120,
      disableReorder: true,
    },
    {
      field: 'payor',
      flex: 1,
      minWidth: 180,
      headerName: 'Payor',
      disableReorder: true,
    },
    {
      field: 'name',
      flex: 1,
      minWidth: 180,
      headerName: 'Name',
      disableReorder: true,
      renderCell: (params) => {
        return (
          <p className="cursor-pointer text-sm leading-tight text-cyan-400 underline">
            {params.value}
          </p>
        );
      },
    },
    {
      field: 'paymentReason',
      headerName: 'Pay Reason',
      flex: 1,
      minWidth: 180,
      disableReorder: true,
    },
    {
      field: 'adjustmentReason',
      headerName: 'Adjust. Reason',
      flex: 1,
      minWidth: 140,
      disableReorder: true,
    },
    {
      field: 'paymentType',
      headerName: 'Pay. Type',
      flex: 1,
      minWidth: 120,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className={classNames(
                params.row.eraCheckID ? 'cursor-pointer text-cyan-500' : ''
              )}
              onClick={() => {
                // if (params.row.eraCheckID) {
                setOpenAddUpdateERAModealInfo({
                  open: true,
                  type: 'detail',
                  id: params.row.eraCheckID,
                });
                // }
              }}
            >
              {params.value}
            </div>
          </div>
        );
      },
    },
    {
      field: 'amount',
      headerName: 'Amount',
      flex: 1,
      minWidth: 120,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div>${params && params.value ? params.value.toFixed(2) : ''}</div>
        );
      },
    },
    {
      field: 'postingDate',
      headerName: 'Post Date',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'depositDate',
      headerName: 'Deposit Date',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'checkDate',
      headerName: 'Check Date',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'checkNumber',
      headerName: 'Check Number',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    // {
    //   field: 'comments',
    //   headerName: 'Comments',
    //   minWidth: 120,
    //   disableReorder: true,
    // },
    {
      field: 'actions',
      headerName: 'Actions',
      headerClassName: '!bg-cyan-100 !text-center',
      flex: 1,
      minWidth: 180,
      disableReorder: true,
      cellClassName: '!bg-cyan-50',
      renderCell: (params) => {
        return (
          <>
            <Button
              buttonType={ButtonType.secondary}
              cls={`!w-[139px] !h-[30px] pl-[9px] pr-[11px] py-[7px] inline-flex px-4 py-2 gap-2 leading-5 !rounded`}
              onClick={() => {
                setReverseLedgerID(params.row.ledgerID);
                setStatusModalState({
                  ...statusModalState,
                  open: true,
                  heading: 'Reverse Payment',
                  description: `Are you sure to reverse this payment?`,
                  statusModalType: StatusModalType.WARNING,
                  showCloseButton: true,
                  okButtonText: 'Yes',
                  closeButtonText: 'No',
                  confirmActionType: 'reversePayment',
                });
              }}
              disabled={params.row.disableReverse}
            >
              <div className="flex h-4 w-4 items-center justify-center px-[0.37px] py-[2.40px]">
                <Icon name={'reverse'} size={18} />
              </div>
              <div className="min-w-[95px] text-xs font-medium leading-none">
                Reverse Payment
              </div>
            </Button>
            {/* <Button
              buttonType={ButtonType.secondary}
              onClick={() => {}}
              cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 mr-1 inline-flex gap-2 leading-5`}
            >
              <Icon name={'eye'} size={18} color={IconColors.NONE} />
            </Button>
            <Button
              buttonType={ButtonType.secondary}
              onClick={() => {}}
              cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 mr-1 inline-flex gap-2 leading-5`}
            >
              <Icon name={'pencil'} size={18} color={IconColors.GRAY} />
            </Button>
            <Button
              buttonType={ButtonType.secondary}
              cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
              onClick={() => {}}
            >
              <Icon name={'trash'} size={18} />
            </Button> */}
          </>
        );
      },
    },
  ];

  const getClaimBalnceData = async () => {
    const res = await getClaimFinancial(claimID);
    if (res) {
      setClaimBalanceData(res);
    }
  };
  const reversePostingDateCriteria: PostingDateCriteria = {
    id: reverseLedgerID,
    type: 'ledger',
    postingDate: DateToStringPipe(reversePostingDate, 1),
  };
  const reversePayment = async () => {
    const dateRes = await fetchPostingDate(reversePostingDateCriteria);
    if (dateRes && dateRes.postingCheck === false) {
      setStatusModalState({
        ...statusModalState,
        open: true,
        heading: 'Error',
        statusModalType: StatusModalType.ERROR,
        description: dateRes.message,
        okButtonText: 'Ok',
        showCloseButton: false,
        closeOnClickOutside: false,
      });
      return;
    }
    const obj: ReversePaymetLedgerFields = {
      ledgerID: reverseLedgerID,
      postingDate: reversePostingDate,
    };
    const res = await reversePaymentLedger(obj);
    if (res) {
      setPostingDateModel({
        type: '',
        show: false,
      });
      setReversePostingDate('');
      getClaimBalnceData();
    }
  };
  const [showScrubingResponse, setShowScrubingResponse] = useState<{
    data?: AllClaimsScrubResponseResult;
    open: boolean;
  }>({
    open: false,
  });

  const scrubClaim = async () => {
    const res = await claimsScrubing([claimID]);
    if (res) {
      setShowScrubingResponse({
        data: res,
        open: true,
      });
    } else {
      setIsScrubButtonClicked(false);
    }
  };
  const voidPostingDateCriteria: PostingDateCriteria = {
    id: claimID,
    type: 'Claim',
    postingDate: DateToStringPipe(voidPostingDate, 1),
  };
  const onVoidClaim = async () => {
    const dateRes = await fetchPostingDate(voidPostingDateCriteria);
    if (dateRes && dateRes.postingCheck === false) {
      setStatusModalState({
        ...statusModalState,
        open: true,
        heading: 'Error',
        statusModalType: StatusModalType.ERROR,
        description: dateRes.message,
        okButtonText: 'Ok',
        showCloseButton: false,
        closeOnClickOutside: false,
      });
      return;
    }
    const res = await voidClaims(claimID, voidPostingDate);
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
      getClaimSummaryData(claimID);
      getClaimDataByID(claimID);
    } else {
      setSubmitModalState({
        ...submitModalState,
        open: true,
        heading: 'Error',
        description:
          'A system error prevented the claim to be voided. Please try again.',
        bottomDescription: '',
        okButtonColor: ButtonType.primary,
        okButtonText: 'OK',
        statusModalType: StatusModalType.ERROR,
        closeOnClickOutside: false,
        showCloseButton: false,
        statusData: [],
      });
      setVoidPostingDate('');
      getClaimSummaryData(claimID);
      getClaimDataByID(claimID);
    }
  };
  const onSubmitClaim = async (submitAsIs: boolean) => {
    setIsSubmitButtonClicked(false);
    const res = await submitClaim([{ claimID, submitAs: submitAsIs }]);
    if (res) {
      claimsSubmittingResponse.current = res.response;
      let heading = '';
      let description = '';
      let bottomDescription = '';
      const success = res.response.filter((m) => m.type === 'success').length;
      if (success > 0) {
        dispatch(
          addToastNotification({
            id: uuidv4(),
            text: 'Claim Successfully Submitted',
            toastType: ToastType.SUCCESS,
          })
        );
        getClaimSummaryData(claimID);
        getClaimDataByID(claimID);
      } else {
        const warning = res.response.filter((m) => m.type === 'warning').length;
        const error = res.response.filter((m) => m.type === 'error').length;
        heading =
          warning === res.response.length
            ? 'Claim Issues Warning'
            : 'Submission Rejected by Nucleus';
        if (warning === res.response.length) {
          description =
            'We have identified issues with this claim that may cause it to be rejected.';
        } else if (error === res.response.length) {
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
        setSubmitModalState({
          ...submitModalState,
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
        getClaimSummaryData(claimID);
        getClaimDataByID(claimID);
      }
    }
  };
  const icdSearchData = useSelector(getICDSearchDataSelector);
  useOnceEffect(() => {
    if (icdSearch.searchValue !== '') {
      dispatch(fetchICDSearchDataRequest(icdSearch));
    }
  }, [icdSearch.searchValue]);
  const updateICDArray = (
    order: number | undefined,
    updatedIcd: SingleValue<SingleSelectGridDropdownDataType>
  ) => {
    setIcdRows(() => {
      return icdRows?.map((row) => {
        if (row.order === order) {
          return {
            ...row,
            order: row.order,
            icd10Code: updatedIcd?.value,
            selectedICDObj: updatedIcd,
            description: updatedIcd?.appendText,
          };
        }
        return row;
      });
    });
  };
  const [currentTabWindow, setCurrentTabWindow] = useState(tabstask[0]);
  const [isOpenNotePane, setIsOpenNotePane] = React.useState(false);
  const [isOpenAddChargeModal, setIsOpenAddChargeModal] = React.useState(false);
  const [showPaymentPostingPopUp, setShowPaymentPostingPopUp] =
    React.useState(false);
  const [ppChargeRowID, setPPChargeRowID] = useState<number>();
  const [isEditMode, setIsEditMode] = React.useState(false);
  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };
  const checkDuplicateICD = () => {
    if (icdRows) {
      for (let i = 0; i < icdRows?.length; i += 1) {
        for (let j = i + 1; j < icdRows.length; j += 1) {
          if (icdRows[i]?.icd10Code === icdRows[j]?.icd10Code) {
            return true;
          }
        }
      }
    }
    return false;
  };
  const saveClaim = async () => {
    let saveClaimData: SaveClaimRequestPayload = {
      claimID: null,
      appointmentID: null,
      claimStatusID: null,
      scrubStatusID: null,
      submitStatusID: null,
      patientID: null,
      patientInsuranceID: null,
      insuranceID: null,
      subscriberID: null,
      dosFrom: null,
      dosTo: null,
      groupID: null,
      practiceID: null,
      facilityID: null,
      posID: null,
      providerID: null,
      referringProviderNPI: null,
      referringProviderFirstName: null,
      referringProviderLastName: null,
      referralNumber: null,
      supervisingProviderID: null,
      panNumber: null,
      icd1: null,
      icd2: null,
      icd3: null,
      icd4: null,
      icd5: null,
      icd6: null,
      icd7: null,
      icd8: null,
      icd9: null,
      icd10: null,
      icd11: null,
      icd12: null,
      dischargeDate: null,
      currentIllnessDate: null,
      disabilityBeginDate: null,
      disabilityEndDate: null,
      firstSymptomDate: null,
      initialTreatmentDate: null,
      lmpDate: null,
      lastSeenDate: null,
      lastXrayDate: null,
      simillarIllnesDate: null,
      responsibilityDate: null,
      accidentDate: null,
      accidentTypeID: null,
      accidentStateID: null,
      labCharges: null,
      delayReason: null,
      epsdtConditionID: null,
      serviceAuthExcepID: null,
      specialProgramIndicatorID: null,
      orderingProviderID: null,
      box19: null,
      emg: null,
      comments: null,
      originalRefenceNumber: null,
      claimFrequencyID: null,
      conditionCodeID: null,
      pwkControlNumber: null,
      transmissionCodeID: null,
      attachmentTypeID: null,
      assignClaimTo: null,
      assignUserNote: null,
      admissionDate: null,
      medicalCaseID: null,
    };
    if (icdRows && icdRows?.length > 0) {
      saveClaimData = {
        ...saveClaimData,
        icd1:
          icdRows.length > 0 && icdRows[0] ? icdRows[0].icd10Code : undefined,
        icd2:
          icdRows.length > 1 && icdRows[1] ? icdRows[1].icd10Code : undefined,
        icd3:
          icdRows.length > 2 && icdRows[2] ? icdRows[2].icd10Code : undefined,
        icd4:
          icdRows.length > 3 && icdRows[3] ? icdRows[3].icd10Code : undefined,
        icd5:
          icdRows.length > 4 && icdRows[4] ? icdRows[4].icd10Code : undefined,
        icd6:
          icdRows.length > 5 && icdRows[5] ? icdRows[5].icd10Code : undefined,
        icd7:
          icdRows.length > 6 && icdRows[6] ? icdRows[6].icd10Code : undefined,
        icd8:
          icdRows.length > 7 && icdRows[7] ? icdRows[7].icd10Code : undefined,
        icd9:
          icdRows.length > 8 && icdRows[8] ? icdRows[8].icd10Code : undefined,
        icd10:
          icdRows.length > 9 && icdRows[9] ? icdRows[9].icd10Code : undefined,
        icd11:
          icdRows.length > 10 && icdRows[10]
            ? icdRows[10].icd10Code
            : undefined,
        icd12:
          icdRows.length > 11 && icdRows[11]
            ? icdRows[11].icd10Code
            : undefined,
      };
    }
    saveClaimData = {
      ...saveClaimData,
      claimID,
      appointmentID: null,
      emg: claimData ? claimData.additionalFieldsData.emg : null,
      admissionDate: claimData
        ? claimData.additionalFieldsData.admissionDate
        : null,
      patientID: selectedClaimData?.patientID || null,
      groupID: claimData ? claimData.groupID : null,
      practiceID: claimData ? claimData.practiceID : null,
      facilityID: claimData ? claimData.facilityID : null,
      patientInsuranceID: claimData ? claimData.patientInsuranceID : null,
      insuranceID: claimData ? claimData.insuranceID : null,
      subscriberID: claimData ? claimData.subscriberID : null,
      providerID: claimData ? claimData.providerID : null,
      supervisingProviderID: claimData ? claimData.supervisingProviderID : null,
      referringProviderNPI:
        claimData && claimData.referringProviderID
          ? claimData.referringProviderID.toString()
          : null,
      referringProviderFirstName: claimData
        ? claimData.referringProviderFirstName
        : null,
      referringProviderLastName: claimData
        ? claimData.referringProviderLastName
        : null,
      referralNumber:
        claimData && claimData.referralNumber
          ? claimData.referralNumber?.toString()
          : '',
      posID: claimData ? claimData.posID : null,
      panNumber:
        claimData && claimData.panNumber ? claimData.panNumber?.toString() : '',
      assignClaimTo: claimData ? claimData.assignClaimTo : null,
      assignUserNote: claimData ? claimData.assignUserNote : null,
      dosFrom: claimData ? claimData.dosFrom : null,
      dosTo: claimData ? claimData.dosTo : null,
      claimStatusID: claimData ? claimData.claimStatusID : null,
      scrubStatusID: claimData ? claimData.scrubStatusID : null,
      submitStatusID: claimData ? claimData.submitStatusID : null,
      dischargeDate:
        claimData && claimData.additionalFieldsData.dischargeDate
          ? claimData.additionalFieldsData.dischargeDate.split('T')[0]
          : null,
      currentIllnessDate:
        claimData && claimData.additionalFieldsData.currentIllnessDate
          ? claimData.additionalFieldsData.currentIllnessDate.split('T')[0]
          : null,
      disabilityBeginDate:
        claimData && claimData.additionalFieldsData.disabilityBeginDate
          ? claimData.additionalFieldsData.disabilityBeginDate.split('T')[0]
          : null,
      disabilityEndDate:
        claimData && claimData.additionalFieldsData.disabilityEndDate
          ? claimData.additionalFieldsData.disabilityEndDate.split('T')[0]
          : null,
      firstSymptomDate:
        claimData && claimData.additionalFieldsData.firstSymptomDate
          ? claimData.additionalFieldsData.firstSymptomDate.split('T')[0]
          : null,
      initialTreatmentDate:
        claimData && claimData.additionalFieldsData.initialTreatmentDate
          ? claimData.additionalFieldsData.initialTreatmentDate.split('T')[0]
          : null,
      lmpDate:
        claimData && claimData.additionalFieldsData.lmpDate
          ? claimData.additionalFieldsData.lmpDate.split('T')[0]
          : null,
      lastSeenDate:
        claimData && claimData.additionalFieldsData.lastSeenDate
          ? claimData.additionalFieldsData.lastSeenDate.split('T')[0]
          : null,
      lastXrayDate:
        claimData && claimData.additionalFieldsData.lastXrayDate
          ? claimData.additionalFieldsData.lastXrayDate.split('T')[0]
          : null,
      simillarIllnesDate:
        claimData && claimData.additionalFieldsData.simillarIllnesDate
          ? claimData.additionalFieldsData.simillarIllnesDate.split('T')[0]
          : null,
      responsibilityDate:
        claimData && claimData.additionalFieldsData.responsibilityDate
          ? claimData.additionalFieldsData.responsibilityDate.split('T')[0]
          : null,
      accidentDate:
        claimData && claimData.additionalFieldsData.accidentDate
          ? claimData.additionalFieldsData.accidentDate.split('T')[0]
          : null,
      accidentTypeID: claimData
        ? claimData.additionalFieldsData.accidentTypeID
        : null,
      accidentStateID: claimData
        ? claimData.additionalFieldsData.accidentStateID
        : null,
      labCharges: claimData ? claimData.additionalFieldsData.labCharges : null,
      delayReason: claimData
        ? claimData.additionalFieldsData.delayReason
        : null,
      epsdtConditionID: claimData
        ? claimData.additionalFieldsData.epsdtConditionID
        : null,
      serviceAuthExcepID: claimData
        ? claimData.additionalFieldsData.serviceAuthExcepID
        : null,
      specialProgramIndicatorID: claimData
        ? claimData.additionalFieldsData.specialProgramIndicatorID
        : null,
      orderingProviderID: claimData
        ? claimData.additionalFieldsData.orderingProviderID
        : null,
      box19: claimData ? claimData.additionalFieldsData.box19 : null,
      comments: claimData ? claimData.additionalFieldsData.comments : null,
      originalRefenceNumber: claimData
        ? claimData.additionalFieldsData.originalRefenceNumber
        : null,
      claimFrequencyID: claimData
        ? claimData.additionalFieldsData.claimFrequencyID
        : null,
      conditionCodeID: claimData
        ? claimData.additionalFieldsData.conditionCodeID
        : null,
      pwkControlNumber: claimData
        ? claimData.additionalFieldsData.pwkControlNumber
        : null,
      transmissionCodeID: claimData
        ? claimData.additionalFieldsData.transmissionCodeID
        : null,
      attachmentTypeID: claimData
        ? claimData.additionalFieldsData.attachmentTypeID
        : null,
      medicalCaseID: claimData?.medicalCaseID || null,
    };
    if (saveClaimData.icd1 === null) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Please Select ICD',
          toastType: ToastType.ERROR,
        })
      );
      return false;
    }
    if (checkDuplicateICD() === true) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Duplicate ICD-10 exists on the claim. Please update ICD-10 and resubmit claim.',
          toastType: ToastType.ERROR,
        })
      );
      return false;
    }
    saveClaimData = {
      ...saveClaimData,
      claimID,
    };
    const res = await editClaim(saveClaimData);
    if (!res) {
      setStatusModalState({
        ...statusModalState,
        open: true,
        heading: 'Error',
        description:
          'A system error prevented the claim to be updated. Please try again.',
        okButtonText: 'Ok',
        statusModalType: StatusModalType.ERROR,
        showCloseButton: false,
        closeOnClickOutside: false,
      });
      return false;
    }
    return true;
  };
  const [closeDiagnosisPopup, setCloseDiagnosisPopup] = useState(false);
  const updateChargeDiagnosis = async (obj: ChargeDiagnosisFieldsUpdate) => {
    const res = await updateChargeDiagnosisFields(obj);
    if (res) {
      setCloseDiagnosisPopup(true);
      getClaimSummaryData(claimID);
      if (claimID) {
        getClaimData();
        getClaimDataByID(claimID);
        getTaskGridDataAPICall(claimID);
        getClaimSummaryData(claimID);
        getClaimDocumentData();
      }
    } else {
      // alert('error');
    }
  };
  const handleSaveButtonClick = async (obj: ChargeDiagnosisFieldsUpdate) => {
    if (!allowEditCharge) {
      const claimSaved = await saveClaim();
      if (claimSaved) {
        updateChargeDiagnosis(obj);
      }
    } else {
      updateChargeDiagnosis(obj);
    }
  };
  const [documantData, setDocumantData] = useState<UploadedDocumentOutput[]>(
    []
  );
  useEffect(() => {
    if (uploadDocumentData) setDocumantData(uploadDocumentData);
  }, [uploadDocumentData]);
  const tabs = [
    {
      id: undefined,
      name: 'Service Details',
    },
    {
      id: undefined,
      name: 'Summary & Billing',
    },
    {
      id: undefined,
      name: 'Financial',
    },
    {
      id: undefined,
      name: 'Claim DNA',
    },
    {
      id: undefined,
      name: 'Uploaded Documents',
      count: documantData.length,
    },
    {
      id: undefined,
      name: 'Claim Status Details',
    },
  ];
  const deleteIcd = async (
    claimId: number | undefined,
    icd: string | undefined
  ) => {
    const res = await deleteSelectedICD(claimId, icd);
    if (res === 1) {
      // dispatch(
      //   addToastNotification({
      //     id: uuidv4(),
      //     text: `Successfully deleted ICD.`,
      //     toastType: ToastType.SUCCESS,
      //   })
      // );
      return true;
    }
    return false;
  };
  const [currentTab, setCurrentTab] = useState(tabs[0]);
  const renderRurrentTab = () => {
    if (currentTab?.name === 'Service Details') {
      return (
        <>
          {/* ICD-10 Code Section */}
          <div className="mt-7 inline-flex w-full flex-col items-start justify-end space-y-4 px-5 pb-1.5">
            <div className="inline-flex w-full items-center justify-start space-x-6">
              <div className="flex items-center justify-start space-x-6">
                <div className="flex items-center justify-start space-x-2">
                  <p className="text-xl font-bold leading-7 text-gray-700">
                    ICD-10
                  </p>
                </div>
              </div>
              {/* <div className="flex items-start justify-end space-x-2">
                <Button
                  buttonType={ButtonType.secondary}
                  cls={`inline-flex px-3 py-2 gap-2 leading-5`}
                  onClick={() => {
                    setIsEditMode(true);
                  }}
                >
                  <Icon name={'pencil'} size={16} color={IconColors.NONE} />
                  <p className="text-sm font-medium leading-tight text-gray-700">
                    Edit
                  </p>
                </Button>
              </div> */}
            </div>
            <p
              className="items-start justify-start text-sm leading-tight text-gray-500"
              style={{ width: 512 }}
            >
              Drag and drop to reorder diagnosis codes tags.
            </p>
            <div className="w-full rounded-lg border border-gray-300 shadow">
              <AppTable
                cls="max-h-[400px]"
                renderHead={
                  <>
                    <AppTableRow>
                      <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                        {' '}
                      </AppTableCell>
                      <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                        Order{' '}
                      </AppTableCell>
                      <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4 ">
                        <div className="flex gap-1">
                          ICD 10 Code{' '}
                          <InfoToggle
                            position="right"
                            text={
                              <div>
                                {' '}
                                CMS1500 : BOX21 <br /> X12 : LOOP 2300 -
                                HI101(BK),HI102 (BF)
                              </div>
                            }
                          />
                        </div>
                      </AppTableCell>
                      <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4 w-[75%]">
                        {' '}
                        Description
                      </AppTableCell>
                      <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                        Action
                      </AppTableCell>
                    </AppTableRow>
                  </>
                }
                renderBody={
                  <>
                    {icdRows?.map((icdRow, index) => (
                      <AppTableRow
                        key={icdRow?.order}
                        cls={
                          dragOverIndex === index
                            ? 'transform translate-y-0.5 drop-shadow-lg bg-[rgba(236,254,255,1)]'
                            : ''
                        }
                      >
                        <AppTableCell component="th">
                          <div
                            className={`inline-flex h-[30px] w-[30px] cursor-move justify-center `}
                            draggable
                            onMouseDown={() => {
                              setDragOverIndex(index);
                            }}
                            onMouseUp={() => {
                              setDragOverIndex(undefined);
                            }}
                            onDragStart={(
                              e: React.DragEvent<HTMLDivElement>
                            ) => {
                              startIndex.current = index;
                              const dragIcon = document.createElement('img');
                              dragIcon.src = '';
                              dragIcon.width = 0;
                              e.dataTransfer.setDragImage(dragIcon, 20, 20);
                            }}
                            onDragOver={(
                              e: React.DragEvent<HTMLDivElement>
                            ) => {
                              e.preventDefault();
                            }}
                            onDrop={() => {
                              setDragOverIndex(undefined);
                            }}
                            onDragOverCapture={() => {
                              if (dragOverIndex !== index) {
                                const startIndexDrag = startIndex.current;
                                setDragOverIndex(index);

                                if (startIndexDrag !== undefined) {
                                  const res: any = reOrderData(
                                    icdRows,
                                    startIndexDrag,
                                    index
                                  );
                                  setIcdRows(() => {
                                    return res?.map(
                                      (
                                        orderRow: IcdData,
                                        dragIndex: number
                                      ) => {
                                        return {
                                          ...orderRow,
                                          order: dragIndex + 1,
                                        };
                                      }
                                    );
                                  });
                                }
                              }
                            }}
                          >
                            <Icon
                              name={'drag'}
                              size={18}
                              color={IconColors.GRAY}
                            />
                          </div>
                        </AppTableCell>
                        <AppTableCell>
                          <div className="inline-flex items-center justify-center rounded bg-gray-100 px-3 py-0.5">
                            <p className="text-center text-sm font-medium leading-tight text-gray-800">
                              {icdRow?.order}
                            </p>
                          </div>
                        </AppTableCell>
                        <AppTableCell>
                          <div className="w-[110px]">
                            <SingleSelectGridDropDown
                              placeholder=""
                              showSearchBar={true}
                              showDropdownIcon={false}
                              data={
                                icdSearchData?.length !== 0
                                  ? (icdSearchData as SingleSelectGridDropdownDataType[])
                                  : []
                              }
                              disabled={!isEditMode}
                              selectedValue={icdRow?.selectedICDObj}
                              onSelect={(e) => {
                                updateICDArray(
                                  icdRow.order ? icdRow.order : undefined,
                                  e
                                );
                                setIsJSONChanged(true);
                                setAllowEditCharge(false);
                              }}
                              onSearch={(value) => {
                                setIcdSearch({
                                  ...icdSearch,
                                  searchValue: value,
                                });
                              }}
                              appendTextSeparator={'|'}
                            />
                          </div>
                        </AppTableCell>
                        <AppTableCell>
                          <div className="inline-flex items-center justify-center rounded bg-gray-100 px-3 py-0.5">
                            <p className="text-center text-sm font-medium leading-tight text-gray-800">
                              {icdRow?.description}
                            </p>
                          </div>
                        </AppTableCell>
                        <AppTableCell cls="bg-cyan-50">
                          <div className="flex gap-x-2">
                            <Button
                              disabled={!isEditMode}
                              onClick={async () => {
                                if (icdRows.length > 1) {
                                  const flag = await deleteIcd(
                                    claimData?.claimID,
                                    icdRow.icd10Code
                                  );
                                  if (flag) {
                                    const checkedDxCode = dxCode.filter(
                                      (a) => a.value === icdRow.icd10Code
                                    );
                                    if (checkedDxCode) {
                                      setdxCode(
                                        dxCode.filter(
                                          (a) => a.value !== icdRow.icd10Code
                                        )
                                      );
                                    }
                                    setIcdOrderCount(icdOrderCount - 1);
                                    icdRows.splice(index, 1);
                                    setIcdRows(() => {
                                      return icdRows?.map(
                                        (
                                          deleteRow: IcdData,
                                          deleteIndex: number
                                        ) => {
                                          return {
                                            ...deleteRow,
                                            order: deleteIndex + 1,
                                          };
                                        }
                                      );
                                    });
                                  }
                                } else {
                                  dispatch(
                                    addToastNotification({
                                      id: uuidv4(),
                                      text: `You can't remove single icd.`,
                                      toastType: ToastType.ERROR,
                                    })
                                  );
                                }

                                // const checkIcdAttached = chargesRow?.filter(
                                //   (a) =>
                                //     a.charge &&
                                //     (a.charge.icd1 === icdRow.icd10Code ||
                                //       a.charge.icd2 === icdRow.icd10Code ||
                                //       a.charge.icd3 === icdRow.icd10Code ||
                                //       a.charge.icd4 === icdRow.icd10Code)
                                // );
                                // if (
                                //   checkIcdAttached &&
                                //   checkIcdAttached.length > 0
                                // ) {
                                //   dispatch(
                                //     addToastNotification({
                                //       id: uuidv4(),
                                //       text: 'This Diagnosis code is attached to a charge.Please remove the diagnosis from the charge before deleting from the claim.',
                                //       toastType: ToastType.ERROR,
                                //     })
                                //   );
                                //   return;
                                // }
                              }}
                              buttonType={ButtonType.secondary}
                              cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                            >
                              <Icon
                                name={'trash'}
                                size={18}
                                color={IconColors.NONE}
                              />
                            </Button>
                          </div>
                        </AppTableCell>
                      </AppTableRow>
                    ))}
                    {showAddICDRow ? (
                      <AppTableRow rowRef={icdTableRef}>
                        <AppTableCell component="th"> </AppTableCell>
                        <AppTableCell>
                          <div className="inline-flex items-center justify-center rounded bg-gray-100 px-3 py-0.5">
                            <p className="text-center text-sm font-medium leading-tight text-gray-800">
                              {icdOrderCount}
                            </p>
                          </div>
                        </AppTableCell>
                        <AppTableCell>
                          <div className="w-[110px]">
                            <SingleSelectGridDropDown
                              placeholder=""
                              showSearchBar={true}
                              showDropdownIcon={false}
                              //  disabled={row.isEditMode}
                              data={
                                icdSearchData?.length !== 0
                                  ? (icdSearchData as SingleSelectGridDropdownDataType[])
                                  : []
                              }
                              selectedValue={selectedICDCode}
                              onSelect={(
                                e: SingleValue<SingleSelectGridDropdownDataType>
                              ) => {
                                setSelctedICDCode(e);
                                setIcdOrderCount(icdOrderCount + 1);
                                setAddICDDescription('');
                                setshowAddICDRow(false);
                                icdRows?.push({
                                  order: icdOrderCount || undefined,
                                  icd10Code: e && e.value ? e.value : undefined,
                                  description: e?.appendText
                                    ? e?.appendText
                                    : undefined,
                                  selectedICDObj: e || undefined,
                                });
                                setSelctedICDCode(null);
                                setIsJSONChanged(true);
                                setAllowEditCharge(false);
                              }}
                              onSearch={(value) => {
                                setIcdSearch({
                                  ...icdSearch,
                                  searchValue: value,
                                });
                              }}
                              appendTextSeparator={'|'}
                            />
                          </div>
                        </AppTableCell>
                        <AppTableCell>
                          {selectedICDCode && (
                            <div className="inline-flex items-center justify-center rounded bg-gray-100 px-3 py-0.5">
                              <p className="text-center text-sm font-medium leading-tight text-gray-800">
                                {addICDDescription}
                              </p>
                            </div>
                          )}
                        </AppTableCell>
                      </AppTableRow>
                    ) : (
                      ''
                    )}
                  </>
                }
              />
            </div>
            <div className="inline-flex h-9 w-1/6 items-center justify-end space-x-2">
              <Button
                buttonType={ButtonType.secondary}
                onClick={() => {
                  setIsEditMode(true);
                  if (icdRows && icdRows?.length >= 12) {
                    dispatch(
                      addToastNotification({
                        id: uuidv4(),
                        text: 'Only 12 ICD-10 Codes are allowed.',
                        toastType: ToastType.ERROR,
                      })
                    );
                  } else {
                    setshowAddICDRow(!showAddICDRow);
                    setTimeout(() => {
                      icdTableRef?.current?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                      });
                    }, 100);
                  }
                }}
                cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
              >
                <Icon name={'plus1'} size={18} color={IconColors.GRAY} />
              </Button>
              <p className="text-sm font-medium leading-tight text-gray-700">
                Add more ICD 10 Codes
              </p>
            </div>
          </div>
          {/* Charge Code Section */}
          <div className="mt-6 inline-flex flex-col items-start justify-end space-y-4 px-5 pb-1.5">
            <div className="inline-flex items-center justify-start space-x-6">
              <div className="flex items-center justify-start space-x-2">
                <p className="text-xl font-bold leading-7 text-gray-700">
                  Charges
                </p>
              </div>
              <Button
                buttonType={ButtonType.primary}
                cls={` h-[34px]`}
                onClick={() => {
                  setIsOpenAddChargeModal(true);
                }}
              >
                <p className="text-sm font-medium leading-4">Add New Charge</p>
              </Button>
            </div>
            {summaryCharges.map((chargeRow, index) => (
              <>
                <div
                  className="inline-flex  cursor-move justify-center"
                  draggable
                  onMouseDown={() => {
                    if (!viewChargeClick) setChargeDragOverIndex(index);
                  }}
                  onMouseUp={() => {
                    if (!viewChargeClick) setChargeDragOverIndex(undefined);
                  }}
                  onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
                    startIndex.current = index;
                    const dragIcon = document.createElement('img');
                    dragIcon.src = '';
                    dragIcon.width = 0;
                    e.dataTransfer.setDragImage(dragIcon, 20, 20);
                  }}
                  onDragOver={(e: React.DragEvent<HTMLDivElement>) => {
                    e.preventDefault();
                  }}
                  onDrop={() => {
                    setChargeDragOverIndex(undefined);
                  }}
                  onDragOverCapture={() => {
                    if (chargeDragOverIndex !== index) {
                      const startIndexDrag = startIndex.current;
                      setChargeDragOverIndex(index);
                      if (startIndexDrag !== undefined) {
                        const res: any = reOrderData(
                          summaryCharges,
                          startIndexDrag,
                          index
                        );
                        setSummaryCharges(() => {
                          return res?.map(
                            (
                              orderRow: SummaryBillingCharges,
                              dragIndex: number
                            ) => {
                              return {
                                ...orderRow,
                                sortOrder: dragIndex + 1,
                              };
                            }
                          );
                        });
                        const updateSortData = res?.map(
                          (
                            orderRow: SummaryBillingCharges,
                            dragIndex: number
                          ) => {
                            return {
                              chargeID: orderRow.chargeID,
                              sortOrder: dragIndex + 1,
                            };
                          }
                        );
                        updateChargeSortOrder(updateSortData);
                      }
                    }
                  }}
                >
                  <ChargeDetail
                    openViewChargeDetails={(v) => {
                      setViewChargeClick(v);
                    }}
                    cls={classNames(
                      chargeDragOverIndex === index
                        ? 'transform translate-y-0.5 drop-shadow-lg bg-[rgba(236,254,255,1)]'
                        : ''
                    )}
                    onCrossOverClaimClick={() => {
                      setShowCrossoverClaimModal(true);
                      setSelectedCrossOverChargeId(chargeRow.chargeID);
                    }}
                    onPaymentClaimClick={() => {
                      setShowPaymentPostingPopUp(true);
                      setPPChargeRowID(chargeRow.chargeID);
                    }}
                    data={chargeRow}
                    icdRows={icdRows}
                    patientID={claimData?.patientID}
                    dxCodeDropdownData={
                      icdRows && icdRows.length > 0
                        ? (icdRows.map((a) => ({
                            ...a.selectedICDObj,
                            appendText: a.description,
                            leftIcon: priorityOrderRender(a.order),
                          })) as MultiSelectGridDropdownDataType[])
                        : []
                    }
                    reloadData={() => {
                      getClaimSummaryData(claimID);
                      if (claimID) {
                        getClaimData();
                        getClaimDataByID(claimID);
                        getTaskGridDataAPICall(claimID);
                        getClaimSummaryData(claimID);
                        getClaimDocumentData();
                      }
                    }}
                    closeDiagnosisPopup={closeDiagnosisPopup}
                    onSaveDiagnosis={(obj) => {
                      handleSaveButtonClick(obj);
                    }}
                    onIsDXpopupOpened={() => {
                      setCloseDiagnosisPopup(false);
                    }}
                  />
                </div>
              </>
            ))}
            <div
              className={classNames(
                'box-border h-full w-full rounded-md border border-solid  p-3 shadow-md !mb-20',
                BalanceCardBackgroundColor()
              )}
            >
              <p className="text-sm">TOTAL CLAIM BALANCE:</p>
              <p
                className={classNames(
                  'p-1 pt-3 text-lg ',
                  BalanceCardBackgroundColor()
                )}
              >
                $ {totalBalance}
              </p>
            </div>
          </div>
        </>
      );
    }
    if (currentTab?.name === 'Claim Status Details') {
      return <ClaimStatusDetails claimID={claimID} />;
    }
    if (currentTab?.name === 'Claim DNA') {
      return (
        <ClaimDNA claimID={claimID} groupID={selectedClaimData?.groupID} />
      );
    }
    if (currentTab?.name === 'Summary & Billing') {
      return (
        <>
          {claimData && (
            <ClaimServiceDetails
              isEditMode={isEditMode}
              data={claimData}
              onChange={(data) => {
                setClaimData(data);
              }}
              onSave={onSaveChanges}
              onClickEdit={() => {
                setIsEditMode(true);
                setIsJSONChanged(true);
              }}
              onSaveChanges={() => {
                setOnSaveChanges(false);
              }}
            />
          )}
        </>
      );
    }
    if (currentTab?.name === 'Financial') {
      return (
        <>
          <ClaimBalance
            data={claimBalanceData}
            groupID={claimData?.groupID}
            patientID={claimData?.patientID}
            reloadData={() => {
              getClaimBalnceData();
            }}
          />
          <div className="pl-6 pt-6 pb-[85px] text-xl font-bold leading-7 text-gray-700">
            <div className="my-3 text-xl font-bold leading-7 text-gray-700">
              Claim Payment Ledger
            </div>
            <ChargePaymentLedger
              data={
                claimBalanceData?.paymentLedgers.map((row) => {
                  return { ...row, id: row.ledgerID };
                }) || []
              }
              columns={columns}
            />
          </div>
        </>
      );
    }
    if (currentTab?.name === 'Uploaded Documents') {
      const updateEAttachmentClaimDoc = async (
        uploadDocRow: UploadedDocumentOutput
      ) => {
        const updateEAttachData = {
          documentID: uploadDocRow.id,
          eAttachement: !uploadDocRow.eAttachment,
        };
        const res = await updateClaimDocumentEAttachment(updateEAttachData);
        if (res) {
          if (documantData) {
            const latestData = documantData.map((row) => {
              if (row && row?.id === uploadDocRow.id) {
                return { ...row, eAttachment: !uploadDocRow.eAttachment };
              }
              return { ...row };
            });
            dispatch(fetchUploadedClaimDocumentSuccess(latestData));
          }
        }
      };

      return (
        <div>
          <div className="ml-[27px]  inline-flex gap-2">
            <p className="mt-[32px]">Uploaded Documents</p>
            <Button
              buttonType={ButtonType.primary}
              cls={`w-[170px] mt-[26px] inline-flex px-4 py-2 gap-2 leading-5 ml-2.5`}
              onClick={() => {
                setIsDocumentsOpen(true);
              }}
            >
              <p className="text-sm">Add New Document</p>
            </Button>
            <>
              <Modal
                open={isDocumentsOpen}
                onClose={() => {
                  setIsDocumentsOpen(false);
                }}
                modalContentClassName="rounded-lg bg-gray-100 h-[325px] text-left shadow-xl "
              >
                {claimData && (
                  <AddNewDocument
                    onClose={() => setIsDocumentsOpen(false)}
                    claimID={claimID}
                    practiceID={claimData.practiceID}
                    patientID={claimData.patientID}
                    groupID={claimData.groupID}
                  />
                )}
              </Modal>
            </>
          </div>
          {documantData && documantData.length > 0 && (
            <>
              <div
                className={` ml-[27px] font-bold leading-6 text-gray-700`}
              ></div>
              <AppTable
                cls="max-h-[400px] m-[27px] "
                renderHead={
                  <>
                    <AppTableRow>
                      <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !text-center !px-4 w-[10%]">
                        <div className="inline-flex w-32 items-center justify-center space-x-1  bg-gray-200">
                          <p className="text-sm font-bold leading-tight text-gray-600">
                            E-Attach
                          </p>
                          <Tooltip
                            title="Include file with claim submission"
                            arrow
                            placement="top"
                          >
                            <div className="mt-1">
                              <Icon name={'questionMarkcircle'} size={18} />
                            </div>
                          </Tooltip>
                        </div>
                      </AppTableCell>
                      <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                        Document ID{' '}
                      </AppTableCell>
                      <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                        Document Title{' '}
                      </AppTableCell>
                      <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                        File Type{' '}
                      </AppTableCell>
                      <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                        Attachment Type{' '}
                      </AppTableCell>
                      <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                        Uploaded By{' '}
                      </AppTableCell>
                      <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                        Uploaded On{' '}
                      </AppTableCell>
                      <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4 bg-cyan-100">
                        Actions
                      </AppTableCell>
                    </AppTableRow>
                  </>
                }
                renderBody={
                  <>
                    {documantData?.map((uploadDocRow) => (
                      <AppTableRow key={uploadDocRow?.id}>
                        <AppTableCell cls="!text-center">
                          <CheckBox
                            id="checkbox1"
                            checked={uploadDocRow.eAttachment}
                            onChange={() => {
                              updateEAttachmentClaimDoc(uploadDocRow);
                            }}
                            disabled={false}
                          />
                        </AppTableCell>
                        <AppTableCell>{`#${uploadDocRow?.id}`}</AppTableCell>
                        <AppTableCell>{uploadDocRow.title}</AppTableCell>
                        <AppTableCell>
                          {uploadDocRow.documentType.substring(1).toUpperCase()}
                        </AppTableCell>
                        <AppTableCell>{uploadDocRow.category}</AppTableCell>
                        <AppTableCell>{uploadDocRow.createdBy}</AppTableCell>
                        <AppTableCell>
                          {DateToStringPipe(uploadDocRow.createdOn, 6)}
                        </AppTableCell>
                        <AppTableCell cls="bg-cyan-50">
                          <div className="flex gap-x-2">
                            <>
                              <Button
                                buttonType={ButtonType.secondary}
                                onClick={async () => {
                                  const downloadDocData =
                                    await downloadDocumentBase64(
                                      uploadDocRow.id
                                    );
                                  if (
                                    downloadDocData &&
                                    downloadDocData.documentBase64
                                  ) {
                                    const pdfResult =
                                      downloadDocData.documentBase64;
                                    const pdfWindow = window.open('');
                                    if (
                                      downloadDocData.documentExtension !==
                                      '.pdf'
                                    ) {
                                      if (pdfWindow) {
                                        pdfWindow.document.write(
                                          `<iframe  width='100%' height='100%'  style='position:fixed; top:0; left:0; bottom:0; right:0; transform: translate(5%, 5%); width:100%; height:100%; border:none; margin:0; padding:0; overflow:hidden; z-index:999999;' src='data:image/png;base64, ${encodeURI(
                                            pdfResult
                                          )}'></iframe>`
                                        );
                                      }
                                    } else if (pdfWindow) {
                                      pdfWindow.document.write(
                                        `<iframe width='100%' height='100%' src='data:application/pdf;base64, ${encodeURI(
                                          pdfResult
                                        )}'></iframe>`
                                      );
                                    }
                                  }
                                }}
                                cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                              >
                                <Icon name={'eye'} size={18} />
                              </Button>
                              <Button
                                buttonType={ButtonType.secondary}
                                cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                                onClick={async () => {
                                  const downloadDocData =
                                    await downloadDocumentBase64(
                                      uploadDocRow.id
                                    );
                                  if (
                                    downloadDocData &&
                                    downloadDocData.documentBase64
                                  ) {
                                    const a = document.createElement('a');
                                    a.href = `data:application/octet-stream;base64,${downloadDocData.documentBase64}`;
                                    a.download =
                                      downloadDocData.documentName +
                                      downloadDocData.documentExtension;
                                    a.click();
                                  }
                                }}
                              >
                                <Icon name={'documentDownload'} size={18} />
                              </Button>
                              <Button
                                buttonType={ButtonType.secondary}
                                cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                                onClick={async () => {
                                  const docDelete = await deleteDocument(
                                    uploadDocRow.id
                                  );
                                  if (docDelete) {
                                    getClaimDocumentData();
                                  }
                                }}
                              >
                                <Icon name={'trash'} size={18} />
                              </Button>
                            </>
                          </div>
                        </AppTableCell>
                      </AppTableRow>
                    ))}
                  </>
                }
              />
            </>
          )}
        </div>
      );
    }
    return <></>;
  };

  const renderRurrentTabWindow = () => {
    if (currentTabWindow?.name === 'Unresolved') {
      return (
        <TaskWindowPane
          taskGridData={taskGridData?.filter((m) => m.resolve === false) || []}
          assignClaimToData={assignClaimToData || []}
          toggleDrawer={(value) => {
            if (value) {
              toggleDrawer();
            }
          }}
          taskGridDataUpdate={() => {
            getTaskGridDataAPICall(claimID);
            setViewNotesKey(uuidv4());
          }}
        />
      );
    }
    if (currentTabWindow?.name === 'Resolved') {
      return (
        <TaskWindowPane
          taskGridData={taskGridData?.filter((m) => m.resolve === true) || []}
          assignClaimToData={assignClaimToData || []}
          toggleDrawer={(value) => {
            if (value) {
              toggleDrawer();
            }
          }}
          taskGridDataUpdate={() => {
            getTaskGridDataAPICall(claimID);
            setViewNotesKey(uuidv4());
          }}
        />
      );
    }
    return <></>;
  };

  const isMenuOpened = useSelector(getExpandSideMenuSelector);
  useEffect(() => {
    if (isInsuranceModalOpen === true) {
      setIsOpen(false);
      // setIsOpenNotePane(false);
    }
  }, [isInsuranceModalOpen]);
  useEffect(() => {
    if (isOpen === true) {
      setCurrentTabWindow(tabstask[0]);
    }
  }, [isOpen]);

  const resizeWidthOpenNote = () => {
    if (isOpenNotePane) {
      if (isPopup) return 'w-[68.66%]';
      return isMenuOpened ? 'w-[62.4%]' : 'w-[66.4%]';
    }
    return 'w-full';
  };
  const onClickViewUb04 = async () => {
    const res = await getClaimUB04PDF(claimID);
    if (res) {
      const url = window.URL.createObjectURL(res);
      const printWindow = window.open(
        url,
        '_blank',
        'width=1200,height=700,top=100,left=100,toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes'
      );

      if (printWindow) {
        printWindow.onload = () => {
          printWindow.focus();
          // Optionally print the document:
          // printWindow.print();
        };
      }
    }
  };
  return (
    <>
      <div
        className={classNames(
          // eslint-disable-next-line no-nested-ternary
          'h-full relative m-0 bg-gray-100 p-0 md:w-full'
        )}
      >
        <div
          className={classNames(
            `overflow-y-scroll overflow-x-hidden bg-gray-100 p-0 m-0 h-full`,
            resizeWidthOpenNote()
          )}
          style={{
            paddingBottom: (isOpen ? divHeightTaskView : divHeightActions) - 17,
          }}
        >
          <div>
            {!isPopup && (
              <Breadcrumbs
                onPreviousLink={() => {
                  onCloseModal();
                }}
              />
            )}
            <Modal
              open={isOpenAddChargeModal}
              onClose={() => {}}
              modalContentClassName="relative w-[1232px] overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 w-full"
            >
              <AddCharge
                totalChargesCount={summaryCharges.length}
                practiceID={claimData ? claimData.practiceID : undefined}
                groupID={claimData ? claimData.groupID : undefined}
                facilityID={claimData ? claimData.facilityID : undefined}
                insuranceID={
                  claimData ? claimData.patientInsuranceID : undefined
                }
                dxCodeDropdownData={
                  icdRows && icdRows.length > 0
                    ? (icdRows.map((a) => ({
                        ...a.selectedICDObj,
                        appendText: a.description,
                        leftIcon: priorityOrderRender(a.order),
                      })) as MultiSelectGridDropdownDataType[])
                    : []
                }
                icdRows={icdRows || []}
                claimID={claimID}
                medicalCaseID={claimData?.medicalCaseID}
                patientID={claimData?.patientID}
                onClose={() => {
                  setIsOpenAddChargeModal(false);
                  getClaimSummaryData(claimID);
                  if (claimID) {
                    getClaimData();
                    getClaimDataByID(claimID);
                    getTaskGridDataAPICall(claimID);
                    getClaimSummaryData(claimID);
                    getClaimDocumentData();
                  }
                }}
              />
            </Modal>
            <Modal
              open={showPaymentPostingPopUp}
              onClose={() => {}}
              modalContentClassName="h-[calc(100%-80px)] w-[calc(100%-220px)] relative rounded-lg bg-white shadow-xl transition-all sm:my-8"
            >
              <PaymentPosting
                claimID={claimID}
                groupID={claimData?.groupID}
                onClose={() => {
                  setShowPaymentPostingPopUp(false);
                  getClaimSummaryData(claimID);
                  setPPChargeRowID(undefined);
                }}
                patientID={selectedClaimData?.patientID}
                chargeRowID={ppChargeRowID}
              />
            </Modal>
            <StatusModal
              open={submitModalState.open}
              heading={submitModalState.heading}
              description={submitModalState.description}
              okButtonText={submitModalState.okButtonText}
              bottomDescription={submitModalState.bottomDescription}
              closeButtonText={submitModalState.closeButtonText}
              closeButtonColor={submitModalState.closeButtonColor}
              okButtonColor={submitModalState.okButtonColor}
              statusModalType={submitModalState.statusModalType}
              showCloseButton={submitModalState.showCloseButton}
              statusData={submitModalState.statusData}
              closeOnClickOutside={submitModalState.closeOnClickOutside}
              onClose={() => {
                setSubmitModalState({
                  ...submitModalState,
                  open: false,
                });
                if (submitModalState.showCloseButton) {
                  dispatch(
                    addToastNotification({
                      id: uuidv4(),
                      text: 'Submission Canceled by User',
                      toastType: ToastType.ERROR,
                    })
                  );
                }
                if (claimID) {
                  getClaimData();
                  getClaimDataByID(claimID);
                  getTaskGridDataAPICall(claimID);
                  getClaimSummaryData(claimID);
                  getClaimDocumentData();
                }
              }}
              onChange={() => {
                setSubmitModalState({
                  ...submitModalState,
                  open: false,
                });
                if (isScrubButtonClicked) {
                  setStatusDetailModalState({
                    ...statusDetailModalState,
                    open: true,
                    headingText: '', // statusModalHeading,
                    data: claimsScrubingResponce.current.map((d) => {
                      return { ...d, title: `#${d.id} - ${d.title}` };
                    }),
                  });
                  getClaimDataByID(claimID);
                  return;
                }
                if (
                  !submitModalState.showCloseButton &&
                  !isScrubButtonClicked
                ) {
                  dispatch(
                    addToastNotification({
                      id: uuidv4(),
                      text: 'Submission Error: Rejected by Nucleus',
                      toastType: ToastType.ERROR,
                    })
                  );
                } else {
                  onSubmitClaim(true);
                }
              }}
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
                setIsScrubButtonClicked(false);
              }}
            />
            <Modal
              open={showCrossoverClaimModal}
              onClose={() => {}}
              modalContentClassName="relative w-[1232px] overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 w-full"
            >
              <CreateCrossover
                claimID={claimID}
                groupID={selectedClaimData?.groupID}
                patientID={selectedClaimData?.patientID}
                selectedChargeID={selectedCrossOverChargeId}
                onClose={() => {
                  setShowCrossoverClaimModal(false);
                  setSelectedCrossOverChargeId(undefined);
                  getClaimDetailSummaryById(claimID);
                  getClaimSummaryData(claimID);
                }}
              />
            </Modal>
            <StatusModal
              open={showWarningModal}
              heading={confirmationHeading}
              description={confirmationDescription}
              okButtonText={'Confirm'}
              closeButtonText={'Cancel'}
              statusModalType={StatusModalType.WARNING}
              showCloseButton={true}
              closeOnClickOutside={false}
              onClose={() => {
                setWarningModal(false);
                setIsSubmitButtonClicked(false);
                setIsSaveButtonClick(false);
              }}
              onChange={async () => {
                if (relatedClaimID) {
                  const claimRoute = await getClaimRoute(relatedClaimID);
                  if (claimRoute && claimRoute.screen) {
                    router.push(`/app/claim-detail/${relatedClaimID}`);
                    setWarningModal(false);
                    setRelatedClaimID(null);
                  }
                }
                if (isSubmitButtonClicked) {
                  setWarningModal(false);
                  onSubmitClaim(false);
                }
                if (isCancelButtonClick) {
                  onCloseModal();
                }
                if (isSaveButtonClick) {
                  saveClaim();
                  setIsSaveButtonClick(false);
                  setWarningModal(false);
                }
                if (voidClaimButtonClick) {
                  // onVoidClaim();
                  setPostingDateModel({
                    type: 'void',
                    show: true,
                  });
                  setVoidClaimButtonClick(false);
                  setWarningModal(false);
                }
                setIsEditMode(false);
              }}
            />
            <Modal
              open={isInsuranceModalOpen}
              modalContentClassName="relative w-[528px] overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 w-full"
              onClose={() => {
                setIsInsuranceModalOpen(false);
              }}
            >
              <div className=" w-[528px] bg-gray-100">
                <div className="max-w-full  p-4">
                  <div className="flex h-[49px] flex-row justify-between  border-b border-gray-300">
                    <div className=" items-center text-left text-xl font-bold leading-7 text-gray-500">
                      {insuranceInfoData?.name}
                    </div>
                    <div className="items-center">
                      <CloseButton
                        onClick={() => {
                          setIsInsuranceModalOpen(false);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="inline-flex h-[120px] items-start justify-start space-x-8 rounded-b-lg bg-gray-100 px-8 py-6">
                  <div className="inline-flex flex-col items-start justify-center space-y-2 text-left">
                    <p className="text-base font-bold leading-normal text-gray-700">
                      Address
                    </p>
                    <p className=" text-sm font-normal leading-5 text-gray-800 ">
                      {insuranceInfoData?.address}
                    </p>
                  </div>
                  <div className="inline-flex flex-col items-start justify-center space-y-2">
                    <p className="text-base font-bold leading-normal text-gray-700">
                      Phone
                    </p>
                    <p className="cursor-pointer text-sm leading-tight text-cyan-400 underline">
                      {insuranceInfoData?.phoneNumber}
                    </p>
                  </div>
                  <div className="inline-flex flex-col items-start justify-center space-y-2">
                    <p className="text-base font-bold leading-normal text-gray-700">
                      Email
                    </p>
                    <p className="cursor-pointer text-sm leading-tight text-cyan-400 underline">
                      {insuranceInfoData?.email}
                      {/* {'test@support.com'} */}
                    </p>
                  </div>
                </div>
                <div />
              </div>
            </Modal>

            <PageHeader cls="bg-[white] ">
              <div className="pr-[27px]">
                <div className={'inset-0 z-50 max-h-screen  flex-1 '}>
                  <div className="flex items-start justify-between gap-4  px-7 pb-[21px] pt-[33px]">
                    <div className="flex h-[38px]">
                      <p className="self-center text-3xl font-bold text-cyan-600">
                        Claim #{claimID}
                      </p>
                      <div className="mt-5 h-px w-8 rotate-90 bg-gray-200" />

                      <ButtonDropdown
                        buttonLabel="Quick Actions"
                        buttonCls={`!w-[150px] `}
                        icon={
                          <Icon
                            name={'quickActions'}
                            size={19}
                            color={IconColors.WHITE_S}
                          />
                        }
                        dataList={[
                          {
                            id: 1,
                            title: 'Post Payment',
                            showBottomDivider: true,
                          },
                          {
                            id: 2,
                            title: 'Resubmit Claim',
                            showBottomDivider: false,
                          },
                          {
                            id: 3,
                            title: 'Void Claim',
                            showBottomDivider: false,
                          },
                          {
                            id: 4,
                            title: 'Create Crossover Claim',
                            showBottomDivider: false,
                          },
                        ]}
                        onSelect={(e: number) => {
                          if (e === 1) {
                            setShowPaymentPostingPopUp(true);
                          }
                          if (e === 2) {
                            setConfirmationHeading('Resubmit Confirmation');
                            setConfirmationDescription(
                              'Are you sure you want to resubmit this claim?'
                            );
                            setWarningModal(true);
                            setIsSubmitButtonClicked(true);
                          }
                          if (e === 3) {
                            setConfirmationHeading('Void Claim Confirmation');
                            setConfirmationDescription(
                              'Voiding this claim will cause it to be ignored by the payer. Are you sure you want to proceed?'
                            );
                            setWarningModal(true);
                            setVoidClaimButtonClick(true);
                          }
                          if (e === 4) {
                            setShowCrossoverClaimModal(true);
                          }
                          setIsJSONChanged(true);
                        }}
                      />
                      {claimData?.medicalCaseID && (
                        <div className="pl-8">
                          <Button
                            buttonType={ButtonType.primary}
                            cls={`!px-4 !py-2`}
                            onClick={() => {
                              onClickViewUb04();
                              // setShowCrossoverClaimModal(true);
                            }}
                          >
                            View Claim Form
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-end gap-5">
                      <CloseButton
                        onClick={() => {
                          if (isJSONChanged) {
                            setIsCancelButtonClick(true);
                            setWarningModal(true);
                            setConfirmationHeading('Cancel Confirmation ');
                            setConfirmationDescription(
                              "Are you certain you want to cancel? Clicking 'Confirm' will result in the loss of all changes."
                            );
                          } else {
                            onCloseModal();
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="mx-8">
                    <div className="h-px w-full bg-gray-200" />
                  </div>
                  <div className="flex items-center gap-1 p-8">
                    <div className="box-border flex h-full w-auto gap-2 rounded-md border border-solid bg-gray-50 p-[16px] shadow-md">
                      <Icon
                        color={IconColors.GRAY_500}
                        name={'user'}
                        size={20}
                      />
                      <div className="flex flex-col text-left">
                        <p className="text-sm font-bold leading-5 text-gray-600">
                          Patient:
                        </p>
                        <div
                          className="cursor-pointer text-cyan-500"
                          onClick={() => {
                            // setConfirmationHeading(
                            //   'There are unsaved changes on the claim'
                            // );
                            // setConfirmationDescription(
                            //   'Do you want to abandon changes and continue to the Patient Profile?'
                            // );
                            // setPatientWarningModal(true);
                            setPatientModalOpen(true);
                          }}
                        >
                          {' '}
                          <p className="text-sm font-normal leading-5 text-cyan-500 underline">
                            {selectedClaimData?.patient}
                          </p>
                          {patientModalOpen && (
                            <PatientProfileModal
                              open={true}
                              patientID={selectedClaimData?.patientID}
                              onClose={closeModal}
                            />
                          )}
                          {/* <StatusModal
                            open={showPatientWarningModal}
                            heading={confirmationHeading}
                            description={confirmationDescription}
                            okButtonText={'Continue'}
                            closeButtonText={'Cancel'}
                            statusModalType={StatusModalType.WARNING}
                            showCloseButton={true}
                            closeOnClickOutside={false}
                            onClose={() => {
                              setPatientWarningModal(false);
                            }}
                            onChange={async () => {
                              setPatientWarningModal(false);
                              router.push(
                                `/app/register-patient/${selectedClaimData?.patientID}`
                              );
                            }}
                          /> */}
                        </div>
                      </div>
                    </div>
                    <div className=" h-px w-20 rotate-90 bg-gray-200" />
                    <div className="flex flex-row gap-2">
                      <Icon name={'calendar'} size={20} />
                      <div className="flex flex-col text-left">
                        <p className="text-sm font-bold leading-5 text-gray-600">
                          DOS:
                        </p>
                        <p className="text-sm font-semibold leading-5 text-gray-600">
                          From:{' '}
                          {selectedClaimData?.dosFrom
                            ? new Intl.DateTimeFormat('en-US', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                              }).format(new Date(selectedClaimData?.dosFrom))
                            : ''}
                        </p>
                        <p className="text-sm font-semibold leading-5 text-gray-600">
                          To:{' '}
                          {selectedClaimData?.dosTo
                            ? new Intl.DateTimeFormat('en-US', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                              }).format(new Date(selectedClaimData?.dosTo))
                            : ''}
                        </p>
                      </div>
                    </div>
                    <div className=" h-px w-20 rotate-90 bg-gray-200" />
                    <div className="flex flex-row gap-2">
                      <Icon
                        color={IconColors.GRAY_500}
                        name={'officeBuilding'}
                        size={20}
                      />
                      <div className="flex flex-col text-left">
                        <p className="text-sm font-bold leading-5 text-gray-600">
                          Group:
                        </p>
                        <div
                          className="cursor-pointer text-cyan-500"
                          onClick={() => {
                            setGroupModalOpen(true);
                          }}
                        >
                          {' '}
                          <p className="text-sm font-normal leading-5 text-cyan-500 underline">
                            {selectedClaimData?.group}
                          </p>
                          {groupModalOpen && (
                            <GroupProfileModal
                              open={true}
                              groupID={selectedClaimData?.groupID}
                              onClose={closeModal}
                            />
                          )}
                        </div>
                        <p className="text-xs font-normal leading-4 text-gray-400">
                          EIN: {selectedClaimData?.groupEIN}
                        </p>
                      </div>
                    </div>

                    <div className=" h-px w-20 rotate-90 bg-gray-200" />
                    <div className="flex flex-row gap-2">
                      <Icon
                        color={IconColors.GRAY_500}
                        name={'briefcase'}
                        size={20}
                      />
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col text-left">
                          <p className="text-sm font-bold leading-5 text-gray-600">
                            Provider:
                          </p>
                          <div
                            className="cursor-pointer text-cyan-500"
                            onClick={() => {
                              setProviderModalOpen(true);
                            }}
                          >
                            {' '}
                            <p className="text-sm font-normal leading-5 text-cyan-500 underline">
                              {selectedClaimData?.provider}
                            </p>
                            {providerModalOpen && (
                              <ProviderProfileModal
                                open={true}
                                providerID={selectedClaimData?.providerID}
                                onClose={closeModal}
                              />
                            )}
                          </div>
                          <p className="text-xs font-normal leading-4 text-gray-400">
                            NPI: {selectedClaimData?.providerNPI}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className=" h-px w-20 rotate-90 bg-gray-200" />
                    <div className="flex flex-row gap-2">
                      <Icon
                        color={IconColors.GRAY_500}
                        name={'clipboardCheck'}
                        size={20}
                      />
                      <div className="flex flex-col text-left">
                        <p className="text-sm font-bold  leading-5 text-gray-600">
                          Claim Assigned to:
                        </p>
                        <div className="flex flex-row gap-2">
                          <div className="flex flex-col">
                            {selectedClaimData?.assignee ? (
                              <>
                                <p
                                  className="cursor-pointer text-sm font-normal leading-5 text-cyan-500 underline"
                                  onClick={() => {
                                    setUserModalOpen(true);
                                  }}
                                >
                                  {selectedClaimData?.assignee}
                                  {userModalOpen && (
                                    <UserProfileModal
                                      open={true}
                                      userID={selectedClaimData.assigneeID.toString()}
                                      onClose={closeModal}
                                    />
                                  )}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {selectedClaimData?.assigneeRole}
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="text-sm font-normal leading-5 text-gray-500 underline">
                                  {'Unassigned'}
                                </p>
                                <p className="text-xs text-gray-400"> </p>
                              </>
                            )}
                          </div>
                          <Button
                            buttonType={ButtonType.secondary}
                            cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                            onClick={() => {
                              setIsAssignClaimToModalOpen(true);
                              setIsOpen(false);
                              setIsOpenNotePane(false);
                            }}
                          >
                            <Icon name={'pencil'} size={18} />
                          </Button>
                        </div>
                        <Modal
                          open={isAssignClaimToModalOpen}
                          onClose={() => {}}
                          modalContentClassName="relative h-[538px] w-[960px] overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 w-full"
                        >
                          <AssignClaimToModal
                            label={'Reassign Claim'}
                            DropdownLable={'Reassign Claim to*:'}
                            assignClaimToData={assignClaimToData || []}
                            onClose={() => {
                              setIsAssignClaimToModalOpen(false);
                              getClaimDataByID(claimID);
                              setViewNotesKey(uuidv4());
                            }}
                            currentlyAssignee={selectedClaimData?.assignee}
                            selectedClaimID={claimID}
                          />
                        </Modal>
                      </div>
                    </div>
                  </div>
                  <div className="h-px w-full bg-gray-200" />
                  <div className="w-full pt-6">
                    <div className="flex w-full gap-4 px-6 pb-6">
                      <div className="w-[26%]">
                        <ClaimDetailWidget
                          icon={
                            <Icon
                              name={
                                selectedClaimData?.claimStatus?.includes(
                                  'Paid E'
                                ) ||
                                selectedClaimData?.claimStatus?.includes(
                                  'Appeal'
                                ) ||
                                selectedClaimData?.claimStatus?.includes(
                                  'Draft'
                                ) ||
                                selectedClaimData?.claimStatus?.includes(
                                  'Review'
                                ) ||
                                selectedClaimData?.claimStatus?.includes(
                                  'Hold'
                                ) ||
                                selectedClaimData?.claimStatus?.includes(
                                  'Ready to Bill Patient'
                                ) ||
                                selectedClaimData?.claimStatus?.includes(
                                  'Billed to Patient'
                                )
                                  ? 'user'
                                  : 'desktop'
                              }
                              color={badgeClaimFromStatusIcon(
                                selectedClaimData
                                  ? selectedClaimData?.claimStatus
                                  : ''
                              )}
                            />
                          }
                          label={'CLAIM STATUS:'}
                          badgeColor={
                            selectedClaimData
                              ? badgeClaimFromStatusClass(
                                  selectedClaimData?.claimStatus
                                )
                              : ''
                          }
                          badgeText={selectedClaimData?.claimStatus || ''}
                          time={
                            selectedClaimData
                              ? `${DateToStringPipe(
                                  selectedClaimData.claimStatusTime,
                                  2
                                )} at ${DateToStringPipe(
                                  selectedClaimData.claimStatusTime,
                                  8
                                )}`
                              : ''
                          }
                          showEllipsis={true}
                          claimID={claimID}
                          claimStatus={selectedClaimData?.claimStatus}
                          onRelatedClaimClick={() => {}}
                          chargesData={selectedClaimData?.charges}
                          scrubStatus={selectedClaimData?.scrubStatus}
                          scrubStatusID={selectedClaimData?.scrubStatusID}
                          claimStatusID={selectedClaimData?.claimStatusID}
                          reloadScreen={() => {
                            getClaimDataByID(claimID);
                            getClaimSummaryData(claimID);
                            setViewNotesKey(uuidv4());
                          }}
                        />
                      </div>
                      <div className="w-[26%]">
                        <ClaimDetailWidget
                          label={'CLAIM TYPE:'}
                          badgeColor={'bg-gray-100 rounded-[2px] font-bold'}
                          sublabel={'Submitted To:'}
                          submissionCount={selectedClaimData?.submissionCount}
                          insurance={selectedClaimData?.insurance}
                          insuranceType={selectedClaimData?.insuranceType}
                          sublabel2={'Related Claims:'}
                          badgeText={selectedClaimData?.claimType || ''}
                          showEllipsis={false}
                          time={
                            selectedClaimData?.icn
                              ? `ICN:${selectedClaimData?.icn}`
                              : ''
                          }
                          relatedClaims={
                            selectedClaimData
                              ? selectedClaimData.relatedClaims
                              : []
                          }
                          onRelatedClaimClick={(claimId) => {
                            setRelatedClaimID(claimId);
                            setWarningModal(true);
                            setConfirmationHeading('Leave Confirmation');
                            setConfirmationDescription(
                              'Changes to this claim have not been saved. Exiting the page will result in the loss of all changes. Are you sure you want to proceed?'
                            );
                          }}
                          onInsuranceClick={async () => {
                            const res = await fetchInsuranceInfoData(
                              selectedClaimData?.insuranceID || null
                            );
                            if (res) {
                              setInsuranceInfoData(res);
                              setIsInsuranceModalOpen(true);
                            }
                          }}
                          medicalCaseID={claimData?.medicalCaseID}
                          groupID={claimData?.groupID}
                          patientID={claimData?.patientID}
                        />
                      </div>
                      <div className="w-[26%]">
                        <ClaimDetailWidget
                          label={'LAST ACTION:'}
                          claimID={claimID}
                          sublabel={'From:'}
                          sublabel2={'To:'}
                          badgeColor={'bg-gray-100 rounded-[2px] font-bold'}
                          time={
                            selectedClaimData
                              ? `${DateToStringPipe(
                                  selectedClaimData.lastActionTime,
                                  2
                                )} at ${DateToStringPipe(
                                  selectedClaimData.lastActionTime,
                                  8
                                )}`
                              : ''
                          }
                          showEllipsis={true}
                          onRelatedClaimClick={() => {}}
                          badgeText={selectedClaimData?.lastAction || ''}
                          subBadgeColor={
                            selectedClaimData
                              ? badgeClaimFromStatusClass(
                                  selectedClaimData?.lastActionStatusFrom
                                )
                              : ''
                          }
                          subBadgeText={
                            selectedClaimData?.lastActionStatusFrom || ''
                          }
                          subBadge2Text={
                            selectedClaimData?.lastActionStatus || ''
                          }
                          subBadge2Color={
                            selectedClaimData
                              ? badgeClaimFromStatusClass(
                                  selectedClaimData?.lastActionStatus
                                )
                              : ''
                          }
                          subBadgeicon={
                            <Icon
                              name={
                                selectedClaimData?.lastActionStatusFrom?.includes(
                                  'Paid E'
                                ) ||
                                selectedClaimData?.lastActionStatusFrom?.includes(
                                  'Appeal'
                                ) ||
                                selectedClaimData?.lastActionStatusFrom?.includes(
                                  'Draft'
                                ) ||
                                selectedClaimData?.lastActionStatusFrom?.includes(
                                  'Review'
                                ) ||
                                selectedClaimData?.lastActionStatusFrom?.includes(
                                  'Hold'
                                ) ||
                                selectedClaimData?.lastActionStatusFrom?.includes(
                                  'Ready to Bill Patient'
                                ) ||
                                selectedClaimData?.lastActionStatusFrom?.includes(
                                  'Billed to Patient'
                                )
                                  ? 'user'
                                  : 'desktop'
                              }
                              color={badgeClaimFromStatusIcon(
                                selectedClaimData
                                  ? selectedClaimData?.lastActionStatusFrom
                                  : ''
                              )}
                            />
                          }
                          subBadge2icon={
                            <Icon
                              name={
                                selectedClaimData?.lastActionStatus?.includes(
                                  'Paid E'
                                ) ||
                                selectedClaimData?.lastActionStatus?.includes(
                                  'Appeal'
                                ) ||
                                selectedClaimData?.lastActionStatus?.includes(
                                  'Draft'
                                ) ||
                                selectedClaimData?.lastActionStatus?.includes(
                                  'Review'
                                ) ||
                                selectedClaimData?.lastActionStatus?.includes(
                                  'Hold'
                                ) ||
                                selectedClaimData?.lastActionStatus?.includes(
                                  'Ready to Bill Patient'
                                ) ||
                                selectedClaimData?.lastActionStatus?.includes(
                                  'Billed to Patient'
                                )
                                  ? 'user'
                                  : 'desktop'
                              }
                              color={badgeClaimFromStatusIcon(
                                selectedClaimData
                                  ? selectedClaimData?.lastActionStatus
                                  : ''
                              )}
                            />
                          }
                          reloadScreen={() => {
                            getClaimDataByID(claimID);
                            getClaimSummaryData(claimID);
                            setViewNotesKey(uuidv4());
                          }}
                        />
                      </div>
                      <div className="flex flex-col gap-4">
                        <div className="mr-0 box-border h-full w-full rounded-md border border-solid bg-gray-50 p-3 shadow-md">
                          <div className="gap-2 p-2 text-left font-medium leading-5 text-gray-600">
                            <p className="text-sm">TOTAL CLAIM FEE:</p>
                            <p className="text-black-800 p-1 pt-3 text-lg font-bold">
                              {selectedClaimData?.totalFee || 0}
                            </p>
                          </div>
                        </div>
                        <div
                          /* eslint-disable no-nested-ternary */
                          className={`${
                            totalBalance && totalBalance > 0
                              ? 'box-border h-full w-full rounded-md border border-solid border-red-500 bg-red-50 p-3 shadow-md' // apply red background if value is greater than 0
                              : totalBalance === 0
                              ? 'box-border h-full w-full rounded-md border border-solid border-green-500 bg-green-50 p-3 shadow-md' // apply green background if value is equal to 0
                              : 'box-border h-full w-full rounded-md border border-solid border-yellow-500 bg-yellow-50 p-3 shadow-md' // apply yellow background if value is less than 0
                          } `}
                        >
                          <p
                            className={`${
                              totalBalance && totalBalance > 0
                                ? 'text-sm text-red-500'
                                : totalBalance === 0
                                ? 'text-sm text-green-500'
                                : 'text-sm text-yellow-500'
                            } `}
                          >
                            TOTAL CLAIM BALANCE:
                          </p>
                          <p
                            className={`${
                              totalBalance && totalBalance > 0
                                ? 'p-1 pt-3 text-lg font-bold text-red-500'
                                : totalBalance === 0
                                ? 'p-1 pt-3 text-lg font-bold text-green-500'
                                : 'p-1 pt-3 text-lg font-bold text-yellow-500'
                            } `}
                          >
                            $ {totalBalance}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </PageHeader>
            <div className="no-scrollbar w-full overflow-x-auto rounded-t-md border border-gray-300 bg-white px-6">
              <Tabs
                tabs={tabs}
                currentTab={currentTab}
                onChangeTab={(newTab: any) => {
                  setCurrentTab(newTab);
                  if (newTab?.name === 'Financial') {
                    getClaimBalnceData();
                  }
                }}
              />
            </div>
            <div className="m-2 overflow-y-hidden overflow-x-scroll pb-3">
              {renderRurrentTab()}
            </div>
          </div>
          <div
            className={classNames('absolute bottom-0', resizeWidthOpenNote())}
          >
            {!isOpen ? (
              <div
                className="w-full bg-gray-200"
                style={!isOpen && { height: divHeightActions }}
              >
                <div className="w-full">
                  <div className="h-px w-full bg-gray-300" />
                </div>
                <div className=" py-[24px] pb-0 pr-[27px]">
                  <div className={`flex justify-end gap-4 `}>
                    {/* <Button
                buttonType={ButtonType.secondary}
                cls={`!bg-red-500 !text-white`}
                onClick={() => {}}
              >
                Close / Write-Off Claim
              </Button> */}
                    <Button
                      buttonType={ButtonType.secondary}
                      cls={`!bg-gray-800  !text-white px-4 py-2`}
                      onClick={() => {
                        setConfirmationHeading('Void Claim Confirmation');
                        setConfirmationDescription(
                          'Voiding this claim will cause it to be ignored by the payer. Are you sure you want to proceed?'
                        );
                        setWarningModal(true);
                        setVoidClaimButtonClick(true);
                      }}
                    >
                      Void Claim
                    </Button>
                    <Button
                      buttonType={ButtonType.secondary}
                      cls={`!px-4 !py-2`}
                      onClick={() => {
                        setShowCrossoverClaimModal(true);
                      }}
                    >
                      Create Crossover Claim
                    </Button>
                    <Button
                      buttonType={ButtonType.secondary}
                      cls={`px-4 py-2`}
                      onClick={() => {
                        setIsScrubButtonClicked(true);
                        scrubClaim();
                      }}
                    >
                      Scrub Claim
                    </Button>
                    <Button
                      buttonType={ButtonType.primary}
                      cls={`px-4 py-2`}
                      onClick={() => {
                        setConfirmationHeading('Resubmit Confirmation');
                        setConfirmationDescription(
                          'Are you sure you want to resubmit this claim?'
                        );
                        setWarningModal(true);
                        setIsSubmitButtonClicked(true);
                      }}
                    >
                      Resubmit Claim
                    </Button>
                    {isEditMode ? (
                      <>
                        <div className="!ml-0 !mr-[-15px] h-0.5 w-9 rotate-90 bg-gray-300" />
                        <Button
                          buttonType={ButtonType.secondary}
                          cls={`w-[112px] px-4 py-2`}
                          onClick={() => {
                            if (isJSONChanged) {
                              setIsCancelButtonClick(true);
                              setWarningModal(true);
                              setConfirmationHeading('Cancel Confirmation ');
                              setConfirmationDescription(
                                "Are you certain you want to cancel? Clicking 'Confirm' will result in the loss of all changes."
                              );
                            } else {
                              onCloseModal();
                            }
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          buttonType={ButtonType.primary}
                          cls={``}
                          onClick={() => {
                            setIsSaveButtonClick(true);
                            setIsCancelButtonClick(false);
                            setWarningModal(true);
                            setConfirmationHeading('Save Confirmation');
                            setConfirmationDescription(
                              'Are you sure you wish to save the changes made to this claim?'
                            );
                            setOnSaveChanges(true);
                            setAllowEditCharge(true);
                          }}
                        >
                          Save Changes
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="!ml-0 !mr-[-15px] h-0.5 w-9 rotate-90 bg-gray-300" />
                        <Button
                          buttonType={ButtonType.secondary}
                          cls={`w-[112px] px-4 py-2`}
                          onClick={() => {
                            setIsEditMode(true);
                          }}
                        >
                          Edit
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={classNames(
                  'z-[1] pb-6 bg-white overflow-y-auto left-0 right-0 border-t-[14px] border-gray-200 transition-all duration-300 ease-in-out w-full'
                )}
                style={isOpen && { height: divHeightTaskView }}
              >
                {/* <div className="h-[14px] w-full border-y border-solid  border-gray-400 bg-gray-300"></div> */}

                <div className="px-[27px] pt-[27px]">
                  <div className="flex flex-row gap-2">
                    <h2 className="text-lg font-bold">
                      Claim #{claimID} Task List
                    </h2>
                    <div>
                      <Button
                        buttonType={ButtonType.primary}
                        cls={` h-[34px]`}
                        onClick={() => {
                          setCreateTaskModalOpen(true);
                          setIsOpenNotePane(false);
                          toggleDrawer();
                          setViewNotesKey(uuidv4());
                        }}
                      >
                        <p className="text-sm font-medium leading-4">
                          Create Task
                        </p>
                      </Button>
                    </div>
                  </div>
                  <div>
                    <div className="no-scrollbar w-full overflow-x-auto rounded-t-md  bg-white ">
                      <Tabs
                        tabs={tabstask}
                        currentTab={currentTabWindow}
                        onChangeTab={(newTab: any) =>
                          setCurrentTabWindow(newTab)
                        }
                      />
                    </div>
                    <div className="m-2">{renderRurrentTabWindow()}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={toggleDrawer}
            className={classNames(
              'absolute inline-flex w-40 items-center justify-center space-x-2 rounded-full bg-yellow-500 px-6 py-3 shadow hover:bg-yellow-700 focus:border-2 focus:border-cyan-500 focus:bg-yellow-500 active:border-yellow-200',
              isOpenNotePane ? 'right-[35rem]' : 'right-6'
            )}
            style={{
              bottom: (isOpen ? divHeightTaskView : divHeightActions) + 17,
            }}
          >
            <Icon name={'task'} size={18} />
            <p className="text-base font-medium leading-normal text-white">
              Tasks
            </p>
            <div className="flex items-center justify-center rounded-full bg-yellow-100 px-2.5 py-0.5">
              <p className="text-center text-xs font-medium leading-none text-yellow-800">
                {taskGridData.length}
              </p>
            </div>
          </button>
          <ViewNotes
            key={viewNotesKey}
            id={claimID}
            noteType="claim"
            groupID={selectedClaimData?.groupID}
            btnCls={classNames(
              'absolute',
              isOpen ? 'bottom-[315px]' : 'bottom-[157px]',
              isOpenNotePane ? 'right-[35rem]' : 'right-6'
            )}
            tabOptions={[
              {
                filterValue: 'patient',
                name: 'Patient Notes',
              },
              {
                filterValue: 'claim',
                name: 'Claim Notes',
              },
            ]}
            onOpen={() => {
              setIsOpenNotePane(true);
            }}
            onClose={() => {
              setIsOpenNotePane(false);
            }}
          />
        </div>
      </div>

      <>
        <Modal
          open={createTaskModalOpen}
          onClose={() => {}}
          modalContentClassName="h-[calc(100%-80px)] w-[calc(100%-420px)] relative rounded-lg bg-white shadow-xl transition-all sm:my-8"
        >
          <CreateTaskModal
            assignClaimToData={assignClaimToData || []}
            onCloseModal={() => {
              setIsTaskCreated(true);
              setCreateTaskModalOpen(false);
              getTaskGridDataAPICall(claimID);
            }}
            newTaskClaimID={claimID}
            newTaskPatientID={selectedClaimData?.patientID}
          />
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
                    setReversePostingDate('');
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
                        if (postingDateModel.type === 'reverse') {
                          setReversePostingDate(as);
                        } else {
                          setVoidPostingDate(as);
                        }
                        setIsJSONChanged(true);
                      }
                    }}
                    selected={
                      postingDateModel.type === 'reverse'
                        ? reversePostingDate
                        : voidPostingDate
                    }
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
                          if (postingDateModel.type === 'reverse') {
                            reversePayment();
                          } else {
                            onVoidClaim();
                          }
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
        <StatusModal
          open={statusModalState.open}
          heading={statusModalState.heading}
          description={statusModalState.description}
          okButtonText={statusModalState.okButtonText}
          closeButtonText={statusModalState.closeButtonText}
          statusModalType={statusModalState.statusModalType}
          showCloseButton={statusModalState.showCloseButton}
          closeOnClickOutside={statusModalState.closeOnClickOutside}
          onClose={() => {
            setStatusModalState({
              ...statusModalState,
              open: false,
            });
          }}
          onChange={() => {
            if (statusModalState.confirmActionType === 'reversePayment') {
              setPostingDateModel({
                type: 'reverse',
                show: true,
              });
            }
            if (statusModalState.confirmActionType === 'view_task') {
              // setCreateTaskModalOpen(true);
              // setIsOpenNotePane(false);
              toggleDrawer();
              setViewNotesKey(uuidv4());
            }
            setStatusModalState({
              ...statusModalState,
              open: false,
            });
          }}
        />
        {openAddUpdateERAModealInfo.open && openAddUpdateERAModealInfo.id && (
          <>
            <DetailPaymentERA
              open={openAddUpdateERAModealInfo.open}
              eraId={openAddUpdateERAModealInfo.id}
              onClose={() => {
                setOpenAddUpdateERAModealInfo({ open: false });
              }}
            />
          </>
        )}
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
      </>
    </>
  );
}
