import type { GridColDef, GridColTypeDef } from '@mui/x-data-grid-pro';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import Icon from '@/components/Icon';
import Tabs from '@/components/OrganizationSelector/Tabs';
// eslint-disable-next-line import/no-cycle
import PatientDetailModal from '@/components/PatientDetailModal';
import AppDatePicker from '@/components/UI/AppDatePicker';
import Badge from '@/components/UI/Badge';
import Button, { ButtonType } from '@/components/UI/Button';
import ButtonDropdown from '@/components/UI/ButtonDropdown';
// eslint-disable-next-line import/no-cycle
import { ViewChargeDetails } from '@/components/UI/ChargeDetail/view-charge-detail';
import CloseButton from '@/components/UI/CloseButton';
import Modal from '@/components/UI/Modal';
import type { MultiSelectGridDropdownDataType } from '@/components/UI/MultiSelectGridDropdown';
// eslint-disable-next-line import/no-cycle
import PaymentPosting from '@/components/UI/PaymentPosting';
import SearchDetailGrid from '@/components/UI/SearchDetailGrid';
import SectionHeading from '@/components/UI/SectionHeading';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import AppTable, { AppTableCell, AppTableRow } from '@/components/UI/Table';
import { UploadFileModal } from '@/components/UI/UploadFileModal';
import ViewNotes from '@/components/ViewNotes';
import AssignBatchToModal from '@/screen/batch/assignBatchToModal';
import { addToastNotification } from '@/store/shared/actions';
import {
  deleteDocument,
  downloadDocumentBase64,
  fetchDocumentDataByID,
  fetchPaymentBatchDetailByID,
  fetchPaymentBatchDetailPaidCharges,
  fetchPaymentBatchLedgersPostingByID,
  fetchPaymentLedgerByBatchID,
  fetchPostingDate,
  getClaimDetailSummaryById,
  reversePaymentLedger,
  uploadBatchDocument,
} from '@/store/shared/sagas';
import { getAssignClaimToDataSelector } from '@/store/shared/selectors';
import type {
  BatchDetailCriteria,
  PaymentBatchPaidChargesResult,
  PostingDateCriteria,
  ReversePaymetLedgerFields,
  TBatchUploadedDocument,
  TPaymentBatchDetailType,
  TPaymentLedgerByBatchIDResult,
  TPaymentPostingResult,
} from '@/store/shared/types';
import { ToastType } from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';
import { DateToStringPipe } from '@/utils/dateConversionPipes';

import type { IcdData } from '../createClaim';
import type { ChargesSearchModalParamsT } from '../payments/chargesSearchModal';
// eslint-disable-next-line import/no-cycle
import ChargesSearchModal from '../payments/chargesSearchModal';

interface PaymentPostingProp {
  claimID: number;
  groupID: number;
  patientID: number;
  chargeID: number;
  patientPosting?: boolean;
}

interface TProps {
  open: boolean;
  batchId: number | undefined;
  refreshDetailView?: string;
  onClose: (isAddedUpdated: boolean) => void;
  onEdit: () => void;
}

export default function DetailPaymentBatch({
  open,
  batchId,
  refreshDetailView,
  onClose,
  onEdit,
}: TProps) {
  const dispatch = useDispatch();
  const assignBatchToData = useSelector(getAssignClaimToDataSelector);
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  const usdPrice: GridColTypeDef = {
    type: 'number',
    width: 130,
    align: 'left',
    valueFormatter: ({ value }) => currencyFormatter.format(value),
    cellClassName: 'font-tabular-nums',
  };
  const [modalState, setModalState] = useState<{
    open: boolean;
    heading: string;
    description: string;
    okButtonText: string;
    closeButtonText: string;
    statusModalType: StatusModalType;
    showCloseButton: boolean;
    closeOnClickOutside: boolean;
  }>({
    open: false,
    heading: '',
    description: '',
    okButtonText: '',
    closeButtonText: '',
    statusModalType: StatusModalType.WARNING,
    showCloseButton: true,
    closeOnClickOutside: true,
  });

  const defaultSearchCriteria: BatchDetailCriteria = {
    attachedID: undefined,
    typeID: '',
    pageNumber: 1,
    pageSize: 10,
    sortByColumn: '',
    sortOrder: '',
    getAllData: false,
    getOnlyIDs: false,
  };

  const defaultStatusModalInfo = {
    show: false,
    heading: '',
    text: '',
    okButtonText: 'OK',
    closeButtontext: 'Close',
    type: StatusModalType.WARNING,
    confirmActionType: '',
    showCloseButton: false,
  };
  const [statusModalInfo, setStatusModalInfo] = useState(
    defaultStatusModalInfo
  );
  const [selectedFilesList, setSelectedFileslist] = useState<
    TBatchUploadedDocument[]
  >([]);
  const [documentToDelete, setDocumentToDelete] =
    useState<TBatchUploadedDocument>();
  const [isOpenNotePane, setIsOpenNotePane] = React.useState(false);
  interface TabProps {
    id: number | undefined;
    name: string;
    count?: number;
  }

  const [searchCriteria, setSearchCriteria] = useState(defaultSearchCriteria);

  const priorityOrderRender = (n: number | undefined) => {
    return (
      <div
        className={`relative mr-3 h-5 w-5 text-clip rounded bg-[rgba(6,182,212,1)] text-left font-['Nunito'] font-semibold text-white [box-shadow-width:1px] [box-shadow:0px_0px_0px_1px_rgba(6,_182,_212,_1)_inset]`}
      >
        <p className="absolute left-1.5 top-0.5 m-0 text-xs leading-4">{n}</p>
      </div>
    );
  };
  const [icdRows, setIcdRows] = useState<IcdData[]>([]);
  const [openChargeStatusModal, setOpenChargeStatusModal] = useState(false);
  const [chargeModalInfo, setChargeModalInfo] = useState({
    chargeID: 0,
    patientID: 0,
  });

  const getClaimSummaryData = async (id: number) => {
    const res = await getClaimDetailSummaryById(id);
    if (res) {
      const icdsRows = res.icds?.map((m) => {
        return {
          icd10Code: m.code,
          order: m.order,
          description: m.description,
          selectedICDObj: { id: m.id, value: m.code },
        };
      });
      setIcdRows(icdsRows);
      setOpenChargeStatusModal(true);
    }
  };

  const [tabs, setTabs] = useState<TabProps[]>([
    {
      id: 1,
      name: 'Paid Charges',
      count: 0,
    },
    {
      id: 2,
      name: 'Posted Payment Ledgers',
    },
    {
      id: 3,
      name: 'Payment Posting by User',
    },
    {
      id: 4,
      name: 'Documents',
      count: 0,
    },
  ]);
  const [currentTab, setCurrentTab] = useState(tabs[0]);
  const [chargesSearchModealInfo, setChargesSearchModealInfo] = useState<{
    id: number;
    open: boolean;
    params: ChargesSearchModalParamsT;
  }>();

  const [postingDateModel, setPostingDateModel] = useState<boolean>(false);
  const [reversePostingDate, setReversePostingDate] = useState<string>('');
  const [reverseLedgerID, setReverseLedgerID] = useState<number>();

  const batchcategoryID = useRef('4');
  const [isAssignBatchToModalOpen, setIsAssignBatchToModalOpen] =
    useState(false);
  const [showUploadFileModal, setShowUploadFileModal] = useState(false);
  const [detailRes, setDetailRes] = useState<TPaymentBatchDetailType>();
  const [paidChargesData, setPaidChargesData] =
    useState<PaymentBatchPaidChargesResult>();
  const [ledgersData, setLedgersData] = useState<
    TPaymentLedgerByBatchIDResult[]
  >([]);
  const [paymentPostingData, setPaymentPostingData] = useState<
    TPaymentPostingResult[]
  >([]);

  const [paidChargesCollapseInfo, setPaidChargesCollapseInfo] = useState({
    summary: false,
    detail: false,
  });

  interface PaidChargesSummaryData {
    heading: string;
    data: {
      label: string;
      value: string | number;
    }[];
  }

  const [paidChargesSummaryData, setPaidChargesSummaryData] = useState<
    PaidChargesSummaryData[]
  >([]);

  const [paymentPostingInfo, setPaymentPostingInfo] =
    useState<PaymentPostingProp>();

  useEffect(() => {
    setPaidChargesSummaryData([
      {
        heading: 'Amount',
        data: [
          {
            label: 'Total Claim Count',
            value: paidChargesData?.totalClaimCount || 0,
          },
          {
            label: 'Total Charges Count',
            value: paidChargesData?.totalChargeCount || 0,
          },
          {
            label: 'Total Fee',
            value: currencyFormatter.format(paidChargesData?.fee || 0),
          },
        ],
      },
      {
        heading: 'Insurance',
        data: [
          {
            label: 'Total Insurance Paid',
            value: currencyFormatter.format(
              paidChargesData?.insurancePaid || 0
            ),
          },
          {
            label: 'Total Insurance Adj.',
            value: currencyFormatter.format(
              paidChargesData?.insuranceAdjustment || 0
            ),
          },
        ],
      },
      {
        heading: 'Patient',
        data: [
          {
            label: 'Total Patient Resp.',
            value: currencyFormatter.format(
              paidChargesData?.patientResponsibility || 0
            ),
          },
          {
            label: 'Total Patient Paid',
            value: currencyFormatter.format(paidChargesData?.patientPaid || 0),
          },
          {
            label: 'Total Patient Disc.',
            value: currencyFormatter.format(
              paidChargesData?.patientDiscount || 0
            ),
          },
        ],
      },
    ]);
  }, [paidChargesData]);

  const getPaymentBatchDetailByID = async (id: number) => {
    const res = await fetchPaymentBatchDetailByID(id);
    if (res) {
      setDetailRes({ ...res });
    }
  };

  const getPaymentBatchDetailPaidCharges = async (id: number) => {
    const res = await fetchPaymentBatchDetailPaidCharges(id);
    if (res) {
      setPaidChargesData(res);
    }
  };
  const getPaymentLedgerByBatchID = async (id: number) => {
    const res = await fetchPaymentLedgerByBatchID(id);
    if (res) {
      setLedgersData([...res]);
    }
  };
  const getPaymentBatchLedgersPostingByID = async (id: number) => {
    const res = await fetchPaymentBatchLedgersPostingByID(id);
    if (res) {
      setPaymentPostingData([...res]);
    }
  };

  const initScreen = async (id: number) => {
    getPaymentBatchDetailPaidCharges(id);
    getPaymentBatchDetailByID(id);
    getPaymentLedgerByBatchID(id);
    getPaymentBatchLedgersPostingByID(id);
  };

  useEffect(() => {
    if (batchId) initScreen(batchId);
  }, []);

  useEffect(() => {
    if (batchId && refreshDetailView) getPaymentBatchDetailByID(batchId);
  }, [refreshDetailView]);

  const onPressClose = () => {
    onClose(false);
  };

  const renderSatusView = () => {
    const getIconColor = () => {
      if (detailRes?.batchStatusColor === 'gray') {
        return IconColors.GRAY;
      }
      if (detailRes?.batchStatusColor === 'red') {
        return IconColors.RED;
      }
      return IconColors.Yellow;
    };
    const statusColor = detailRes?.batchStatusColor || 'yellow';
    return (
      <Badge
        text={detailRes?.batchStatus}
        cls={classNames(
          `!ml-[-1px] !rounded-[4px] bg-${statusColor}-100 text-${statusColor}-800`
        )}
        icon={<Icon name={'desktop'} color={getIconColor()} />}
      />
    );
  };

  const BalanceCardTextColor = (n: number | undefined) => {
    if (n === undefined) return 'text-gray-700';
    if (n > 0) {
      return 'text-red-500';
    }
    if (n === 0) {
      return 'text-green-500';
    }
    return 'text-yellow-500';
  };

  const getBatchBalanceStyle = (n: number | undefined) => {
    let color = 'gray';
    if (n !== undefined) {
      if (n > 0) {
        color = 'red';
      } else if (n === 0) {
        color = 'green';
      } else {
        color = 'yellow';
      }
    }
    return `bg-${color}-50 border-${color}-300 text-${color}-500`;
  };
  const [patientDetailsModal, setPatientDetailsModal] = useState<{
    open: boolean;
    id: number | null;
  }>({
    open: false,
    id: null,
  });
  const columnsPaidCharges: GridColDef[] = [
    {
      field: 'claimID',
      headerName: 'Claim ID',
      flex: 1,
      minWidth: 110,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-cyan-500 underline"
            onClick={() => {
              window.open(`/app/claim-detail/${params.value}`, '_blank');
            }}
          >
            {`#${params.value}`}
          </div>
        );
      },
    },
    {
      field: 'id',
      headerName: 'Charge ID',
      flex: 1,
      minWidth: 110,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-cyan-500 underline"
            onClick={() => {
              setChargeModalInfo({
                chargeID: params.value,
                patientID: params.row.patientID,
              });
              getClaimSummaryData(params.row.claimID);
            }}
          >
            {`#${params.value}`}
          </div>
        );
      },
    },
    {
      field: 'cpt',
      headerName: 'CPT Code',
      flex: 1,
      minWidth: 110,
      disableReorder: true,
    },
    {
      field: 'patientID',
      headerName: 'Patient ID',
      flex: 1,
      minWidth: 110,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-cyan-500 underline"
            onClick={() => {
              // window.open(`/app/register-patient/${params.value}`, '_blank');
              setPatientDetailsModal({
                open: true,
                id: params.value || null,
              });
            }}
          >
            {`#${params.value}`}
          </div>
        );
      },
    },
    {
      field: 'patient',
      headerName: 'Patient Name',
      flex: 1,
      minWidth: 160,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-cyan-500 underline"
            onClick={() => {
              // window.open(`/app/register-patient/${params.value}`, '_blank');
              setPatientDetailsModal({
                open: true,
                id: params.value || null,
              });
            }}
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
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'fee',
      headerName: 'Fee',
      ...usdPrice,
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'insuranceAmount',
      headerName: 'Ins. Amount',
      ...usdPrice,
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'insurancePaid',
      headerName: 'Ins. Paid',
      ...usdPrice,
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'insuranceAdjustment',
      headerName: 'Ins. Adj,',
      ...usdPrice,
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'insuranceBalance',
      headerName: 'Ins. Bal.',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
      renderCell: (params) => {
        const BalanceCardBackgroundColor = () => {
          if (params.value > 0) {
            return 'text-red-500';
          }
          if (params.value === 0) {
            return 'text-green-500';
          }
          return 'text-yellow-500';
        };

        return (
          <div className={BalanceCardBackgroundColor()}>
            {currencyFormatter.format(
              params.value * (params.value < 0 ? -1 : 1)
            )}
          </div>
        );
      },
    },
    {
      field: 'patientAmount',
      headerName: 'Pat. Amount',
      ...usdPrice,
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'patientPaid',
      headerName: 'Pat. Paid',
      ...usdPrice,
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'patientDiscount',
      headerName: 'Pat. Disc.',
      ...usdPrice,
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'patientBalance',
      headerName: 'Pat. Bal.',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
      renderCell: (params) => {
        const BalanceCardBackgroundColor = () => {
          if (params.value > 0) {
            return 'text-red-500';
          }
          if (params.value === 0) {
            return 'text-green-500';
          }
          return 'text-yellow-500';
        };

        return (
          <div className={BalanceCardBackgroundColor()}>
            {currencyFormatter.format(
              params.value * (params.value < 0 ? -1 : 1)
            )}
          </div>
        );
      },
    },
    {
      field: 'claimBalance',
      headerName: 'Claim Bal.',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
      renderCell: (params) => {
        const BalanceCardBackgroundColor = () => {
          if (params.value > 0) {
            return 'text-red-500';
          }
          if (params.value === 0) {
            return 'text-green-500';
          }
          return 'text-yellow-500';
        };

        return (
          <div className={BalanceCardBackgroundColor()}>
            {currencyFormatter.format(
              params.value * (params.value < 0 ? -1 : 1)
            )}
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
            <div
              className="cursor-pointer text-cyan-500 underline"
              onClick={() => {}}
            >
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
      minWidth: 200,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-cyan-500 underline"
              onClick={() => {}}
            >
              {params.value}
            </div>
            <div className="text-xs font-normal leading-4">
              {params.row.practiceAddress
                ? `${params.row.practiceAddress}`
                : ''}
            </div>
          </div>
        );
      },
    },
    {
      field: 'pos',
      headerName: 'PoS',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'provider',
      headerName: 'Provider',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-cyan-500 underline"
              onClick={() => {}}
            >
              {params.value}
            </div>
            <div className="text-xs font-normal leading-4">
              {params.row.providerNPI ? `NPI: ${params.row.providerNPI}` : ''}
            </div>
          </div>
        );
      },
    },
    {
      field: 'action',
      headerName: 'Actions',
      flex: 1,
      minWidth: 190,
      hideSortIcons: true,
      disableReorder: true,
      cellClassName: '!bg-cyan-50 PinnedColumLeftBorder',
      headerClassName: '!bg-cyan-100 !text-center PinnedColumLeftBorder',
      renderCell: (params) => {
        return (
          <div className="flex flex-row gap-2">
            <Button
              buttonType={ButtonType.primary}
              cls={`!w-[139px] !h-[30px] pl-[9px] pr-[11px] py-[7px] inline-flex px-4 py-2 gap-2 leading-5 !rounded`}
              onClick={() => {
                setPaymentPostingInfo({
                  claimID: params.row.claimID,
                  groupID: params.row.groupID,
                  patientID: params.row.patientID,
                  chargeID: params.row.id,
                });
              }}
            >
              <div className="flex h-4 w-4 items-center justify-center px-[0.37px] py-[2.40px]">
                <Icon name={'payment'} size={18} />
              </div>
              <div className="min-w-[80px] text-xs font-medium leading-none">
                Post Payment
              </div>
            </Button>
          </div>
        );
      },
    },
  ];

  const columnsLedgers: GridColDef[] = [
    {
      field: 'id',
      headerName: 'Ledger ID',
      flex: 1,
      minWidth: 100,
      disableReorder: true,
      renderCell: (params) => {
        return <div>{`#${params.row.ledgerID}`}</div>;
      },
    },
    {
      field: 'ledgerAccount',
      headerName: 'Ledger Account',
      flex: 1,
      minWidth: 180,
      disableReorder: true,
    },
    {
      field: 'claimID',
      headerName: 'Claim ID',
      flex: 1,
      minWidth: 80,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-cyan-500 underline"
            onClick={async () => {
              window.open(`/app/claim-detail/${params.value}`, '_blank');
            }}
          >
            {`#${params.value}`}
          </div>
        );
      },
    },
    {
      field: 'chargeID',
      headerName: 'Charge ID',
      flex: 1,
      minWidth: 100,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-cyan-500 underline"
            onClick={async () => {
              setChargeModalInfo({
                chargeID: params.value,
                patientID: params.row.patientID,
              });
              getClaimSummaryData(params.row.claimID);
            }}
          >
            {`#${params.value}`}
          </div>
        );
      },
    },
    {
      field: 'insurance',
      headerName: 'Insurance',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-cyan-500 underline"
            onClick={async () => {}}
          >
            {`#${params.value}`}
          </div>
        );
      },
    },
    {
      field: 'paymentType',
      headerName: 'Pay. Type',
      flex: 1,
      minWidth: 100,
      disableReorder: true,
    },
    {
      field: 'paymentNumber',
      headerName: 'Pay. Number',
      flex: 1,
      minWidth: 180,
      disableReorder: true,
    },
    {
      field: 'paymentDate',
      headerName: 'Pay. Date',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
      type: 'date',
      valueGetter: (params) => (params.value ? new Date(params.value) : ''),
      renderCell: (params) => {
        return <div>{`${DateToStringPipe(params.value, 2)}`}</div>;
      },
    },
    {
      field: 'depositDate',
      headerName: 'Deposit Date',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
      type: 'date',
      valueGetter: (params) => (params.value ? new Date(params.value) : ''),
      renderCell: (params) => {
        return <div>{`${DateToStringPipe(params.value, 2)}`}</div>;
      },
    },
    {
      field: 'amount',
      headerName: 'Amount',
      ...usdPrice,
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'comments',
      headerName: 'Comments',
      flex: 1,
      minWidth: 190,
      disableReorder: true,
    },
    {
      field: 'createdOn',
      headerName: 'Created On',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
      type: 'date',
      valueGetter: (params) => (params.value ? new Date(params.value) : ''),
      renderCell: (params) => {
        return <div>{`${DateToStringPipe(params.value, 2)}`}</div>;
      },
    },
    {
      field: 'createdBy',
      headerName: 'Created By',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-cyan-500 underline"
            onClick={async () => {}}
          >
            {`${params.value}`}
          </div>
        );
      },
    },
    {
      field: 'action',
      headerName: 'Actions',
      flex: 1,
      minWidth: 330,
      hideSortIcons: true,
      disableReorder: true,
      cellClassName: '!bg-cyan-50 PinnedColumLeftBorder',
      headerClassName: '!bg-cyan-100 !text-center PinnedColumLeftBorder',
      renderCell: (params) => {
        return (
          <div className="flex flex-row gap-2">
            <Button
              buttonType={ButtonType.primary}
              cls={`!w-[139px] !h-[30px] pl-[9px] pr-[11px] py-[7px] inline-flex px-4 py-2 gap-2 leading-5 !rounded`}
              onClick={() => {
                setPaymentPostingInfo({
                  claimID: params.row.claimID,
                  groupID: detailRes?.groupID || 0,
                  patientID: params.row.patientID,
                  chargeID: params.row.chargeID,
                });
              }}
            >
              <div className="flex h-4 w-4 items-center justify-center px-[0.37px] py-[2.40px]">
                <Icon name={'payment'} size={18} />
              </div>
              <div className="min-w-[80px] text-xs font-medium leading-none">
                Post Payment
              </div>
            </Button>
            <Button
              buttonType={ButtonType.secondary}
              cls={`!w-[139px] !h-[30px] pl-[9px] pr-[11px] py-[7px] inline-flex px-4 py-2 gap-2 leading-5 !rounded`}
              onClick={() => {
                setReverseLedgerID(params.row.id);
                setStatusModalInfo({
                  ...statusModalInfo,
                  show: true,
                  heading: 'Reverse Payment',
                  text: `Are you sure to reverse this payment?`,
                  type: StatusModalType.WARNING,
                  showCloseButton: true,
                  okButtonText: 'Yes',
                  closeButtontext: 'No',
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
          </div>
        );
      },
    },
  ];
  const columnsPaymentPosting: GridColDef[] = [
    {
      field: 'user',
      headerName: 'User',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-cyan-500 underline"
            onClick={async () => {}}
          >
            {`${params.value}`}
          </div>
        );
      },
    },
    {
      field: 'insurancePayment',
      headerName: 'Ins. Pay. Posted',
      ...usdPrice,
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'insuranceAdjustment',
      headerName: 'Ins. Adj,',
      ...usdPrice,
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'patientPayment',
      headerName: 'Pat. Pay. Posted',
      ...usdPrice,
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'patientAdjustment',
      headerName: 'Pat. Disc.',
      ...usdPrice,
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'totalPayment',
      headerName: 'Total Posted',
      ...usdPrice,
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'totalAdjustment',
      headerName: 'Total Adjusted',
      ...usdPrice,
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
  ];

  const getDocumentDataByID = async (obj: BatchDetailCriteria) => {
    const res = await fetchDocumentDataByID(obj);
    if (res) {
      setSelectedFileslist(res);
    }
  };

  useEffect(() => {
    setTabs(
      tabs.map((d) => {
        let { count } = d;
        if (d.id === 1) {
          count = paidChargesData?.paidCharges.length || 0;
        }
        if (d.id === 4) {
          count = selectedFilesList.length;
        }
        return { ...d, count };
      })
    );
  }, [selectedFilesList, paidChargesData]);

  useEffect(() => {
    if (batchId) {
      const obj: BatchDetailCriteria = {
        ...searchCriteria,
        attachedID: batchId,
        typeID: batchcategoryID.current,
      };
      getDocumentDataByID(obj);
    }
  }, []);

  const onViewDacument = async (res: TBatchUploadedDocument) => {
    let base64String = '';
    // in update mode
    if (res.id) {
      const resDownloadDocument = await downloadDocumentBase64(res.id);
      if (resDownloadDocument && resDownloadDocument.documentBase64) {
        // check the file extension
        const extension = res.documentType.substring(1).toLowerCase();
        // set the content type based on the file extension
        let contentType = '';
        if (extension === 'png') {
          contentType = 'image/png';
        } else if (extension === 'jpg' || extension === 'jpeg') {
          contentType = 'image/jpeg';
        } else if (extension === 'pdf') {
          contentType = 'application/pdf';
        }
        // concatenate the content type and base64 string
        base64String = `data:${contentType};base64,${resDownloadDocument.documentBase64}`;
      }
    }

    // view in open new window
    if (base64String) {
      const pdfWindow = window.open('');
      if (pdfWindow) {
        pdfWindow.document.write(
          `<iframe width='100%' height='100%' src='${encodeURI(
            base64String
          )}'></iframe>`
        );
      }
    } else {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Something went wrong',
          toastType: ToastType.ERROR,
        })
      );
    }
  };

  const onDownloadDacument = async (res: TBatchUploadedDocument) => {
    let base64String = '';
    // in update mode
    if (res.id) {
      const resDownloadDocument = await downloadDocumentBase64(res.id);
      if (resDownloadDocument && resDownloadDocument.documentBase64) {
        base64String = `data:application/octet-stream;base64,${resDownloadDocument.documentBase64}`;
      }
    }

    // on download in new window
    if (base64String) {
      const pdfWindow = window.open('');
      if (pdfWindow) {
        const a = document.createElement('a');
        a.href = base64String;
        a.download = res.title + res.documentType;
        a.click();
      }
    } else {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Something went wrong',
          toastType: ToastType.ERROR,
        })
      );
    }
  };

  const onDeleteDacument = async (res: TBatchUploadedDocument) => {
    if (res.id) {
      const docDelete = await deleteDocument(res.id);
      if (docDelete && batchId) {
        const obj: BatchDetailCriteria = {
          ...searchCriteria,
          attachedID: batchId,
          typeID: batchcategoryID.current,
        };
        await getDocumentDataByID(obj);
      }
    }
  };

  const onUpload = async (file: File) => {
    if (batchId) {
      const formData = new FormData();
      formData.append('attachedID', String(batchId));
      formData.append(
        'groupID',
        detailRes?.groupID ? String(detailRes.groupID) : ''
      );
      formData.append('file', file);
      formData.append('documentTypeID', batchcategoryID.current);

      const res = await uploadBatchDocument(formData);
      if (res) {
        const obj: BatchDetailCriteria = {
          ...searchCriteria,
          attachedID: batchId,
          typeID: batchcategoryID.current,
        };
        getDocumentDataByID(obj);
        return true;
      }
    }
    return false;
  };

  const postingDateCriteria: PostingDateCriteria = {
    id: reverseLedgerID,
    type: 'ledger',
    postingDate: DateToStringPipe(reversePostingDate, 1),
  };
  const reversePayment = async () => {
    const dateRes = await fetchPostingDate(postingDateCriteria);
    if (dateRes && dateRes.postingCheck === false) {
      setModalState({
        ...modalState,
        open: true,
        heading: 'Error',
        statusModalType: StatusModalType.ERROR,
        description: dateRes.message,
      });
      return;
    }
    const obj: ReversePaymetLedgerFields = {
      ledgerID: reverseLedgerID,
      postingDate: reversePostingDate,
    };
    const res = await reversePaymentLedger(obj);
    if (res) {
      setPostingDateModel(false);
      setReversePostingDate('');
      if (batchId) {
        getPaymentBatchDetailByID(batchId);
        getPaymentLedgerByBatchID(batchId);
      }
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'Document ID',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'title',
      headerName: 'Document Name',
      flex: 1,
      minWidth: 320,
      disableReorder: true,
    },
    {
      field: 'documentType',
      headerName: 'File Type',
      flex: 1,
      minWidth: 100,
      disableReorder: true,
    },

    {
      field: 'category',
      headerName: 'Category',
      flex: 1,
      minWidth: 160,
      disableReorder: true,
    },
    {
      field: 'documentStatus',
      headerName: 'Status',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'createdBy',
      headerName: 'Uploaded By',
      flex: 1,
      minWidth: 200,
      disableReorder: true,
    },
    {
      field: 'createdOn',
      headerName: 'Uploaded On',
      flex: 1,
      minWidth: 250,
      disableReorder: true,
    },
    {
      field: 'action',
      headerName: 'Actions',
      flex: 1,
      minWidth: 180,
      hideSortIcons: true,
      disableReorder: true,
      cellClassName: '!bg-cyan-50 PinnedColumLeftBorder',
      headerClassName: '!bg-cyan-100 !text-center PinnedColumLeftBorder',
      renderCell: (params) => {
        return (
          <div className="flex flex-row gap-2">
            <Button
              buttonType={ButtonType.secondary}
              onClick={() => {
                onViewDacument(params.row);
              }}
              cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
            >
              <Icon name={'eye'} size={18} />
            </Button>
            <Button
              buttonType={ButtonType.secondary}
              disabled={false}
              cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
              onClick={() => {
                onDownloadDacument(params.row);
              }}
            >
              <Icon name={'documentDownload'} size={18} />
            </Button>
            <Button
              buttonType={ButtonType.secondary}
              disabled={true}
              cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
              onClick={() => {
                setDocumentToDelete(params.row);
                setStatusModalInfo({
                  ...statusModalInfo,
                  show: true,
                  heading: 'Delete Confirmation',
                  text: `Are you sure you want to delete ${params.row.title}?`,
                  type: StatusModalType.WARNING,
                  showCloseButton: true,
                  okButtonText: 'Confirm',
                  confirmActionType: 'deleteConfirmation',
                });
              }}
            >
              <Icon name={'trash'} size={18} />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Modal
        open={open}
        onClose={() => {}}
        modalContentClassName={classNames(
          'h-[calc(100%-80px)] relative rounded-lg bg-white shadow-xl transition-all sm:my-8',
          isOpenNotePane ? 'w-[calc(100%-60px)]' : 'w-[calc(100%-220px)]'
        )}
        modalBackgroundClassName={classNames(
          '!overflow-hidden',
          isOpenNotePane ? 'w-[68%]' : ''
        )}
      >
        <div className="flex h-full w-full flex-col items-center justify-start overflow-hidden rounded-lg bg-white shadow">
          <div className="flex w-full flex-col items-start justify-start px-6 py-4">
            <div className="inline-flex w-full items-center justify-between">
              <div className="flex items-center justify-start space-x-2">
                <p className="text-xl font-bold leading-7 text-cyan-600">
                  Payment Batch #{batchId}
                </p>
                <Button
                  buttonType={ButtonType.secondary}
                  cls={`inline-flex px-3 py-2 gap-2 leading-5 focus:!ring-0`}
                  onClick={onEdit}
                >
                  <Icon name={'pencil'} size={16} color={IconColors.NONE} />
                  <p className="text-sm font-medium leading-tight text-gray-700">
                    Edit
                  </p>
                </Button>
              </div>
              <div className="inline-flex items-center gap-4">
                {/* <ButtonsGroup
                  data={[
                    { id: 2, name: 'Export', icon: 'export' },
                    { id: 3, name: 'Assistant', icon: 'info' },
                  ]}
                  onClick={() => {}}
                /> */}
                <CloseButton onClick={onPressClose} />
              </div>
            </div>
          </div>
          <div className={'w-full px-6'}>
            <div className={`h-[1px] w-full bg-gray-300`} />
          </div>
          <div className="w-full flex-1 overflow-auto bg-gray-50 pb-[55px]">
            <div
              className={classNames(isOpenNotePane ? 'w-[1280px]' : 'w-full')}
            >
              <div className="w-full bg-white drop-shadow-md">
                <div className="inline-flex h-[100px] w-full items-center justify-start py-3 px-6">
                  <div className="flex h-full w-[15%] items-center justify-start space-x-2 py-2">
                    <Icon name={'file'} />
                    <div className="flex flex-col text-left">
                      <p className="text-sm font-bold leading-tight text-gray-600">
                        Description:
                      </p>
                      <p className="text-sm font-semibold leading-tight text-gray-600">
                        {detailRes?.description}
                      </p>
                    </div>
                  </div>
                  <div
                    className={
                      'flex h-full items-center justify-start space-x-2 px-2 py-1'
                    }
                  >
                    <div className={`h-full w-[1px] bg-gray-300`} />
                  </div>
                  <div className="flex h-full w-[20%] items-center justify-start space-x-2 py-2">
                    <Icon name={'building'} />
                    <div className="flex flex-col text-left">
                      <p className="text-sm font-bold leading-tight text-gray-600">
                        Group:
                      </p>
                      <p className="cursor-pointer text-sm leading-tight text-cyan-500 underline">
                        {detailRes?.group}
                      </p>
                      {!!detailRes?.groupEIN && (
                        <p className="text-xs leading-none text-gray-400">
                          EIN: {detailRes?.groupEIN}
                        </p>
                      )}
                    </div>
                  </div>
                  <div
                    className={
                      'flex h-full items-center justify-start space-x-2 px-2 py-1'
                    }
                  >
                    <div className={`h-full w-[1px] bg-gray-300`} />
                  </div>
                  <div className="flex h-full w-[50%] space-x-2">
                    <div className="flex h-full w-[25%] items-center justify-start space-x-2 py-2">
                      <Icon name={'file'} />
                      <div className="flex flex-col text-left">
                        <p className="text-sm font-bold leading-tight text-gray-600">
                          Payment Number:
                        </p>
                        <p className="text-sm font-semibold leading-tight text-gray-600">
                          {detailRes?.paymentNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex h-full w-[25%] items-center justify-start space-x-2 py-2">
                      <Icon name={'calendar'} />
                      <div className="flex flex-col text-left">
                        <p className="text-sm font-bold leading-tight text-gray-600">
                          Payment Date:
                        </p>
                        <p className="text-sm font-semibold leading-tight text-gray-600">
                          {detailRes?.paymentDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex h-full w-[25%] items-center justify-start space-x-2 py-2">
                      <Icon name={'calendar'} />
                      <div className="flex flex-col text-left">
                        <p className="text-sm font-bold leading-tight text-gray-600">
                          Post Date:
                        </p>
                        <p className="text-sm font-semibold leading-tight text-gray-600">
                          {detailRes?.postingDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex h-full w-[25%] items-center justify-start space-x-2 py-2">
                      <Icon name={'calendar'} />
                      <div className="flex flex-col text-left">
                        <p className="text-sm font-bold leading-tight text-gray-600">
                          Deposit Date:
                        </p>
                        <p className="text-sm font-semibold leading-tight text-gray-600">
                          {detailRes?.depositDate}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    className={
                      'flex h-full items-center justify-start space-x-2 px-2 py-1'
                    }
                  >
                    <div className={`h-full w-[1px] bg-gray-300`} />
                  </div>
                  <div className="flex h-full w-[15%] items-center justify-start space-x-2 py-2">
                    <Icon name={'fileTick'} />
                    <div className="flex flex-1 flex-col text-left">
                      <p className="text-sm font-bold leading-tight text-gray-600">
                        Batch Assigned to:
                      </p>
                      <div className="inline-flex items-start justify-start space-x-2">
                        {!!detailRes?.assignee && !!detailRes?.assigneeRole ? (
                          <div className="flex flex-1 flex-col text-left">
                            {!!detailRes?.assignee && (
                              <p className="cursor-pointer text-sm leading-tight text-cyan-500 underline">
                                {detailRes?.assignee}
                              </p>
                            )}
                            {!!detailRes?.assigneeRole && (
                              <p className="text-xs leading-none text-gray-400">
                                {detailRes?.assigneeRole}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col pt-[6px] text-left">
                            <p className="text-xs leading-none text-gray-400">
                              Not assigned yet
                            </p>
                          </div>
                        )}
                        <div>
                          <Button
                            buttonType={ButtonType.secondary}
                            cls={`h-8 h-8 cursor-pointer items-center justify-center rounded-md border border-gray-300 bg-white p-2 shadow`}
                            onClick={() => {
                              setIsAssignBatchToModalOpen(true);
                            }}
                          >
                            <Icon name={'pencil'} size={18} />
                          </Button>
                        </div>
                      </div>
                      <Modal
                        open={isAssignBatchToModalOpen}
                        onClose={() => {}}
                        modalContentClassName="relative h-[420px] w-[960px] overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 w-full"
                      >
                        <AssignBatchToModal
                          label={'Reassign Payment Batch'}
                          DropdownLable={'Reassign Payment Batch to*:'}
                          assignBatchToData={assignBatchToData || []}
                          onClose={() => {
                            setIsAssignBatchToModalOpen(false);
                            if (batchId) {
                              getPaymentBatchDetailByID(batchId);
                            }
                          }}
                          currentlyAssignee={detailRes?.assignee}
                          selectedBatchID={batchId}
                        />
                      </Modal>
                    </div>
                  </div>
                </div>
                <div className={`pb-[12px]`}>
                  <div className={`h-[1px] w-full bg-gray-200`} />
                </div>
                <div className="inline-flex h-[115px] w-full items-start justify-start space-x-4 px-6">
                  <div className="inline-flex h-full min-w-[216px] items-start justify-start rounded-lg border border-gray-300 bg-gray-50 p-6 shadow">
                    <div className="inline-flex h-full flex-col items-start justify-start space-y-4">
                      <div className="flex flex-col items-start justify-start space-y-1">
                        <p className="text-sm font-bold leading-tight text-gray-600">
                          Payment Batch Status:
                        </p>
                        {renderSatusView()}
                        {detailRes?.batchStatusTime && (
                          <p className="pt-[3px] text-xs leading-3 text-gray-400">
                            {DateToStringPipe(
                              new Date(detailRes.batchStatusTime),
                              5
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex h-full flex-1 flex-col items-start justify-start rounded-lg border border-gray-300 bg-gray-50 py-4 px-6 shadow">
                    <div className="flex flex-1 flex-col items-start justify-center rounded-lg py-2">
                      <div className="flex flex-col items-start justify-start space-y-2">
                        <div className="flex items-center justify-start space-x-4">
                          <div className="flex items-center justify-start space-x-4">
                            <p className="text-sm font-bold leading-tight text-gray-600">
                              Insurance Payment Details
                            </p>
                          </div>
                        </div>
                        <div className="inline-flex items-start justify-start space-x-2">
                          <div className="flex h-full w-20 items-start justify-start rounded-md">
                            <div className="inline-flex flex-col items-start justify-start space-y-1">
                              <p className="text-xs font-medium leading-none text-gray-500">
                                Total Amount
                              </p>
                              <div className="inline-flex items-end justify-start">
                                <div className="flex items-end justify-start space-x-2">
                                  <p className="text-sm font-bold leading-tight text-gray-700">
                                    {currencyFormatter.format(
                                      detailRes?.insuranceAmount || 0
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex h-full w-20 items-start justify-start rounded-md">
                            <div className="inline-flex flex-col items-start justify-start space-y-1">
                              <p className="text-xs font-medium leading-none text-gray-500">
                                Paid
                              </p>
                              <div className="inline-flex items-end justify-start">
                                <div className="flex items-end justify-start space-x-2">
                                  <p className="text-sm font-bold leading-tight text-gray-700">
                                    {currencyFormatter.format(
                                      detailRes?.insurancePaid || 0
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex h-full w-20 items-start justify-start rounded-md">
                            <div className="inline-flex flex-col items-start justify-start space-y-1">
                              <p className="text-xs font-medium leading-none text-gray-500">
                                Adjustment
                              </p>
                              <div className="inline-flex items-end justify-start">
                                <div className="flex items-end justify-start space-x-2">
                                  <p className="text-sm font-bold leading-tight text-gray-700">
                                    {currencyFormatter.format(
                                      detailRes?.insuranceWriteOff || 0
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex h-full w-20 items-start justify-start rounded-md">
                            <div className="inline-flex flex-col items-start justify-start space-y-1">
                              <p className="text-xs font-medium leading-none text-gray-500">
                                Balance
                              </p>
                              <div className="inline-flex items-end justify-start">
                                <div className="flex items-end justify-start space-x-2">
                                  <p
                                    className={classNames(
                                      'text-sm font-bold leading-tight',
                                      BalanceCardTextColor(
                                        detailRes?.insuranceBalance
                                      )
                                    )}
                                  >
                                    {currencyFormatter.format(
                                      detailRes?.insuranceBalance
                                        ? detailRes.insuranceBalance *
                                            (detailRes.insuranceBalance < 0
                                              ? -1
                                              : 1)
                                        : 0
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-full flex-1 flex-col items-start justify-start rounded-lg border border-gray-300 bg-gray-50 py-4 px-6 shadow">
                    <div className="flex flex-1 flex-col items-start justify-center rounded-lg py-2">
                      <div className="flex flex-col items-start justify-start space-y-2">
                        <div className="flex items-center justify-start space-x-4">
                          <div className="flex items-center justify-start space-x-4">
                            <p className="text-sm font-bold leading-tight text-gray-600">
                              Patient Payment Details
                            </p>
                          </div>
                        </div>
                        <div className="inline-flex items-start justify-start space-x-2">
                          <div className="flex h-full w-20 items-start justify-start rounded-md">
                            <div className="inline-flex flex-col items-start justify-start space-y-1">
                              <p className="text-xs font-medium leading-none text-gray-500">
                                Total Amount
                              </p>
                              <div className="inline-flex items-end justify-start">
                                <div className="flex items-end justify-start space-x-2">
                                  <p className="text-sm font-bold leading-tight text-gray-700">
                                    {currencyFormatter.format(
                                      detailRes?.patientAmount || 0
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex h-full w-20 items-start justify-start rounded-md">
                            <div className="inline-flex flex-col items-start justify-start space-y-1">
                              <p className="text-xs font-medium leading-none text-gray-500">
                                Paid
                              </p>
                              <div className="inline-flex items-end justify-start">
                                <div className="flex items-end justify-start space-x-2">
                                  <p className="text-sm font-bold leading-tight text-gray-700">
                                    {currencyFormatter.format(
                                      detailRes?.patientPaid || 0
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex h-full w-20 items-start justify-start rounded-md">
                            <div className="inline-flex flex-col items-start justify-start space-y-1">
                              <p className="text-xs font-medium leading-none text-gray-500">
                                Adjustment
                              </p>
                              <div className="inline-flex items-end justify-start">
                                <div className="flex items-end justify-start space-x-2">
                                  <p className="text-sm font-bold leading-tight text-gray-700">
                                    {currencyFormatter.format(
                                      detailRes?.patientDiscount || 0
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex h-full w-20 items-start justify-start rounded-md">
                            <div className="inline-flex flex-col items-start justify-start space-y-1">
                              <p className="text-xs font-medium leading-none text-gray-500">
                                Balance
                              </p>
                              <div className="inline-flex items-end justify-start">
                                <div className="flex items-end justify-start space-x-2">
                                  <p
                                    className={classNames(
                                      'text-sm font-bold leading-tight',
                                      BalanceCardTextColor(
                                        detailRes?.patientBalance
                                      )
                                    )}
                                  >
                                    {currencyFormatter.format(
                                      detailRes?.patientBalance
                                        ? detailRes.patientBalance *
                                            (detailRes.patientBalance < 0
                                              ? -1
                                              : 1)
                                        : 0
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className={classNames(
                      'min-w-[152px] flex items-center justify-center h-full shadow border rounded-md',
                      getBatchBalanceStyle(detailRes?.batchBalance)
                    )}
                  >
                    <div className="flex flex-col text-left">
                      <p className="w-full text-sm font-bold leading-tight">
                        Batch Balance
                      </p>
                      <p className="text-xl font-bold leading-7">
                        {currencyFormatter.format(
                          detailRes?.batchBalance
                            ? detailRes.batchBalance *
                                (detailRes.batchBalance < 0 ? -1 : 1)
                            : 0
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <div className={`pt-[12px]`}>
                  <div className={`h-[1px] w-full bg-gray-200`} />
                </div>
                <div className="w-full px-6">
                  <Tabs
                    tabs={tabs}
                    onChangeTab={(tab: any) => {
                      setCurrentTab(tab);
                    }}
                    currentTab={currentTab}
                  />
                </div>
              </div>
              <div className="w-full px-6 pt-[15px]">
                {currentTab?.id === 1 && (
                  <div className="flex w-full flex-col">
                    <div className="mb-5 flex w-full gap-4">
                      <div className="inline-flex items-center justify-start space-x-2">
                        <p className="text-xl font-bold leading-7 text-gray-700">
                          Paid Charges
                        </p>
                      </div>
                      <Button
                        buttonType={ButtonType.primary}
                        cls={`inline-flex px-4 py-2 gap-2 leading-5 bg-cyan-500`}
                        onClick={() => {
                          if (batchId)
                            setChargesSearchModealInfo({
                              id: batchId,
                              open: true,
                              params: {
                                procedureCode: '',
                                patientFirstName: '',
                                patientLastName: '',
                                fromDOS: null,
                                toDOS: null,
                              },
                            });
                        }}
                      >
                        <p className="mt-[2px] self-center text-xs font-medium leading-4">
                          Post New Payment
                        </p>
                      </Button>
                    </div>
                    <SectionHeading
                      label="Summary"
                      isCollapsable={true}
                      hideBottomDivider
                      onClick={() => {
                        setPaidChargesCollapseInfo({
                          ...paidChargesCollapseInfo,
                          summary: !paidChargesCollapseInfo.summary,
                        });
                      }}
                      isCollapsed={paidChargesCollapseInfo.summary}
                    />
                    <div className="mt-[40px] mb-[20px] w-full">
                      <div
                        hidden={paidChargesCollapseInfo.summary}
                        className="w-full drop-shadow-lg"
                      >
                        <AppTable
                          cls="!w-[700px]"
                          renderHead={<></>}
                          renderBody={
                            <>
                              {paidChargesSummaryData.length ? (
                                <>
                                  {paidChargesSummaryData.map((r) => {
                                    return (
                                      <>
                                        <AppTableCell
                                          cls="!py-2 !whitespace-nowrap !px-4 !bg-gray-100 !text-gray-600 !font-bold"
                                          colSpan={2}
                                        >
                                          {r.heading}
                                        </AppTableCell>
                                        {r.data.map((d, i2) => {
                                          return (
                                            <AppTableRow key={i2}>
                                              <AppTableCell>
                                                {d.label}
                                              </AppTableCell>
                                              <AppTableCell>
                                                {d.value}
                                              </AppTableCell>
                                            </AppTableRow>
                                          );
                                        })}
                                      </>
                                    );
                                  })}
                                </>
                              ) : (
                                <AppTableRow>
                                  <AppTableCell
                                    cls={'!text-center'}
                                    colSpan={2}
                                  >
                                    No rows
                                  </AppTableCell>
                                </AppTableRow>
                              )}
                            </>
                          }
                        />
                      </div>
                    </div>
                    <SectionHeading
                      label="List of Paid Charges Associated With This Batch"
                      isCollapsable={true}
                      hideBottomDivider
                      onClick={() => {
                        setPaidChargesCollapseInfo({
                          ...paidChargesCollapseInfo,
                          detail: !paidChargesCollapseInfo.detail,
                        });
                      }}
                      isCollapsed={paidChargesCollapseInfo.detail}
                    />

                    <div className="flex w-full flex-col pt-[20px]">
                      <div
                        hidden={paidChargesCollapseInfo.detail}
                        className="h-full"
                      >
                        <SearchDetailGrid
                          totalCount={paidChargesData?.paidCharges.length}
                          rows={paidChargesData?.paidCharges || []}
                          columns={columnsPaidCharges}
                          checkboxSelection={false}
                          paginationMode={'client'}
                          pinnedColumns={{
                            right: ['action'],
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                {currentTab?.id === 2 && (
                  <div className="flex w-full flex-col">
                    <div className="inline-flex items-center justify-start space-x-2">
                      <p className="text-xl font-bold leading-7 text-gray-700">
                        Posted Payment Ledgers
                      </p>
                      <div className="pl-4">
                        <ButtonDropdown
                          buttonCls="!h-[33px]"
                          cls="!w-[192px]"
                          popoverCls="!w-[192px]"
                          buttonLabel="Export Payment Ledgers"
                          dataList={[
                            {
                              id: 1,
                              title: 'Export to PDF',
                              showBottomDivider: false,
                            },
                            {
                              id: 2,
                              title: 'Export to CSV',
                              showBottomDivider: false,
                            },
                          ]}
                          onSelect={() => {}}
                        />
                      </div>
                    </div>
                    <div className="h-full">
                      <SearchDetailGrid
                        totalCount={ledgersData.length}
                        rows={ledgersData}
                        columns={columnsLedgers}
                        checkboxSelection={false}
                        paginationMode={'client'}
                        pinnedColumns={{
                          right: ['action'],
                        }}
                      />
                    </div>
                  </div>
                )}
                {currentTab?.id === 3 && (
                  <div className="flex w-full flex-col">
                    <div className="inline-flex items-center justify-start space-x-2">
                      <p className="text-xl font-bold leading-7 text-gray-700">
                        Payment Posting by User
                      </p>
                    </div>
                    <div className="h-full">
                      <SearchDetailGrid
                        totalCount={paymentPostingData.length}
                        rows={paymentPostingData}
                        columns={columnsPaymentPosting}
                        checkboxSelection={false}
                        paginationMode={'client'}
                      />
                    </div>
                  </div>
                )}
                {currentTab?.id === 4 && (
                  <div className="mt-6 flex flex-col pb-[25px]">
                    <div className="inline-flex items-center justify-start space-x-6 pb-4">
                      <p className="text-xl font-bold leading-7 text-gray-700">
                        Uploaded Documents
                      </p>
                      <Button
                        buttonType={ButtonType.primary}
                        onClick={() => {
                          setShowUploadFileModal(true);
                        }}
                      >
                        <p className="text-sm font-medium leading-tight text-white">
                          Add New Document
                        </p>
                      </Button>
                    </div>
                    <UploadFileModal
                      open={showUploadFileModal}
                      onClose={() => {
                        setShowUploadFileModal(false);
                      }}
                      onUploadDocument={async (file) => {
                        const res = await onUpload(file);
                        if (res) {
                          setShowUploadFileModal(false);
                        }
                      }}
                    />
                    {/* <div className="drop-shadow-lg">
                      <AppTable
                        cls="max-h-[400px]"
                        renderHead={
                          <>
                            <AppTableRow>
                              <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                Document ID
                              </AppTableCell>
                              <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                Document Name
                              </AppTableCell>
                              <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                File Type
                              </AppTableCell>
                              <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                Uploaded By
                              </AppTableCell>
                              <AppTableCell cls="!font-bold !py-2 !whitespace-nowrap !px-4">
                                Uploaded On
                              </AppTableCell>
                              <AppTableCell cls="w-[100px] !font-bold !py-2 !whitespace-nowrap !px-4 bg-cyan-100">
                                Actions
                              </AppTableCell>
                            </AppTableRow>
                          </>
                        }
                        renderBody={
                          <>
                            {selectedFilesList.map((uploadDocRow, i) => (
                              <AppTableRow key={i}>
                                <AppTableCell>
                                  {uploadDocRow.id ? `#${uploadDocRow.id}` : ''}
                                </AppTableCell>
                                <AppTableCell>
                                  {uploadDocRow.title}
                                </AppTableCell>
                                <AppTableCell>
                                  {uploadDocRow.documentType
                                    .substring(1)
                                    .toUpperCase()}
                                </AppTableCell>
                                <AppTableCell>
                                  {uploadDocRow.createdBy}
                                </AppTableCell>
                                <AppTableCell>
                                  {DateToStringPipe(
                                    new Date(uploadDocRow.createdOn),
                                    6
                                  )}
                                </AppTableCell>
                                <AppTableCell cls="bg-cyan-50">
                                  <div className="flex gap-x-2">
                                    <>
                                      <Button
                                        buttonType={ButtonType.secondary}
                                        onClick={() => {
                                          onViewDacument(uploadDocRow);
                                        }}
                                        cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                                      >
                                        <Icon name={'eye'} size={18} />
                                      </Button>
                                      <Button
                                        buttonType={ButtonType.secondary}
                                        cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                                        onClick={() => {
                                          onDownloadDacument(uploadDocRow);
                                        }}
                                      >
                                        <Icon
                                          name={'documentDownload'}
                                          size={18}
                                        />
                                      </Button>
                                      <Button
                                        buttonType={ButtonType.secondary}
                                        cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                                        onClick={() => {
                                          setDocumentToDelete(uploadDocRow);
                                          setStatusModalInfo({
                                            ...statusModalInfo,
                                            show: true,
                                            heading: 'Delete Confirmation',
                                            text: `Are you sure you want to delete ${uploadDocRow.title}?`,
                                            type: StatusModalType.WARNING,
                                            showCloseButton: true,
                                            okButtonText: 'Confirm',
                                            confirmActionType:
                                              'deleteConfirmation',
                                          });
                                        }}
                                      >
                                        <Icon name={'trash'} size={18} />
                                      </Button>
                                    </>
                                  </div>
                                </AppTableCell>
                              </AppTableRow>
                            ))}
                            {!selectedFilesList.length && (
                              <AppTableRow>
                                <AppTableCell cls={'!text-center'} colSpan={6}>
                                  No rows
                                </AppTableCell>
                              </AppTableRow>
                            )}
                          </>
                        }
                      />
                    </div> */}

                    <div className="flex w-full flex-col">
                      <div className="h-full">
                        <SearchDetailGrid
                          pageNumber={searchCriteria.pageNumber}
                          pageSize={searchCriteria.pageSize}
                          persistLayoutId={42}
                          hideHeader={false}
                          hideFooter={false}
                          totalCount={selectedFilesList[0]?.total}
                          rows={
                            selectedFilesList?.map((row) => {
                              return { ...row, id: row.id };
                            }) || []
                          }
                          columns={columns}
                          checkboxSelection={false}
                          onPageChange={(page: number) => {
                            const obj: BatchDetailCriteria = {
                              ...searchCriteria,
                              pageNumber: page,
                              attachedID: batchId, // Explicitly include batchId
                              typeID: batchcategoryID.current,
                            };
                            setSearchCriteria(obj);
                            getDocumentDataByID(obj);
                          }}
                          onPageSizeChange={(
                            pageSize: number,
                            page: number
                          ) => {
                            if (selectedFilesList.length) {
                              const obj: BatchDetailCriteria = {
                                ...searchCriteria,
                                pageSize,
                                pageNumber: page,
                                attachedID: batchId, // Explicitly include batchId
                                typeID: batchcategoryID.current,
                              };
                              setSearchCriteria(obj);
                              getDocumentDataByID(obj);
                            }
                          }}
                          pinnedColumns={{
                            right: ['action'],
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {detailRes?.paymentBatchID && (
              <ViewNotes
                id={detailRes.paymentBatchID}
                noteType="payment batch"
                groupID={detailRes?.groupID}
                btnCls="absolute right-[15px] bottom-[15px]"
                // disableBackdropClick={true}
                onOpen={() => {
                  setIsOpenNotePane(true);
                }}
                onClose={() => {
                  setIsOpenNotePane(false);
                }}
              />
            )}
          </div>
        </div>
        {chargesSearchModealInfo?.open && (
          <ChargesSearchModal
            open={chargesSearchModealInfo.open}
            id={chargesSearchModealInfo.id}
            type={'postPayment'}
            inputs={chargesSearchModealInfo.params}
            onClose={(v) => {
              if (v === 'isPost' && batchId) {
                initScreen(batchId);
              }
              setChargesSearchModealInfo(undefined);
            }}
          />
        )}
      </Modal>
      <Modal
        open={postingDateModel}
        onClose={() => {}}
        modalContentClassName="rounded-lg bg-gray-100  text-left shadow-xl  h-[200px] w-[300px] "
      >
        <div className="mx-[27px] flex h-[60px] items-center justify-between gap-4">
          <div className="h-[28px] w-full">
            <SectionHeading label="Add Posting date" isCollapsable={false} />
            <div className=" flex items-center justify-end gap-5">
              <CloseButton
                onClick={() => {
                  setPostingDateModel(false);
                  setReversePostingDate('');
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
                      setReversePostingDate(as);
                    }
                  }}
                  selected={reversePostingDate}
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
                        reversePayment();
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
        open={openChargeStatusModal}
        onClose={() => {
          setOpenChargeStatusModal(false);
        }}
        modalContentClassName="h-[calc(100%-80px)] w-[calc(100%-220px)] relative rounded-lg bg-white shadow-xl transition-all sm:my-8"
      >
        <ViewChargeDetails
          icdRows={icdRows}
          chargeID={chargeModalInfo.chargeID}
          patientID={chargeModalInfo.patientID}
          sortOrder={0}
          dxCodeDropdownData={
            icdRows && icdRows.length > 0
              ? (icdRows.map((a) => ({
                  ...a.selectedICDObj,
                  appendText: a.description,
                  leftIcon: priorityOrderRender(a.order),
                })) as MultiSelectGridDropdownDataType[])
              : []
          }
          onClose={() => {
            setOpenChargeStatusModal(false);
          }}
        />
      </Modal>
      {!!paymentPostingInfo && (
        <Modal
          open={true}
          onClose={() => {}}
          modalContentClassName="h-[calc(100%-80px)] w-[calc(100%-220px)] relative rounded-lg bg-white shadow-xl transition-all sm:my-8"
          modalClassName={'!z-[14]'}
          hideBackdrop={true}
        >
          <PaymentPosting
            claimID={paymentPostingInfo.claimID}
            groupID={paymentPostingInfo.groupID}
            patientID={paymentPostingInfo.patientID}
            onClose={() => {
              setPaymentPostingInfo(undefined);
            }}
            selectedBatchID={batchId}
            chargeId={paymentPostingInfo.chargeID}
          />
        </Modal>
      )}
      <StatusModal
        open={modalState.open}
        heading={modalState.heading}
        description={modalState.description}
        closeButtonText={'Ok'}
        statusModalType={modalState.statusModalType}
        showCloseButton={false}
        closeOnClickOutside={false}
        onChange={() => {
          setModalState({
            ...modalState,
            open: false,
          });
        }}
      />
      <StatusModal
        open={statusModalInfo.show}
        heading={statusModalInfo.heading}
        description={statusModalInfo.text}
        okButtonText={statusModalInfo.okButtonText}
        closeButtonText={statusModalInfo.closeButtontext}
        statusModalType={statusModalInfo.type}
        showCloseButton={statusModalInfo.showCloseButton}
        closeOnClickOutside={true}
        onChange={() => {
          if (statusModalInfo.confirmActionType === 'cancelConfirmation') {
            onClose(false);
          }
          if (
            statusModalInfo.confirmActionType === 'deleteConfirmation' &&
            documentToDelete
          ) {
            onDeleteDacument(documentToDelete);
          }
          if (statusModalInfo.confirmActionType === 'reversePayment') {
            setPostingDateModel(true);
          }
          setStatusModalInfo({
            ...statusModalInfo,
            show: false,
          });
        }}
        onClose={() => {
          setStatusModalInfo({
            ...statusModalInfo,
            show: false,
          });
        }}
      />
      <Modal
        open={patientDetailsModal.open}
        modalContentClassName="relative w-[93%] h-[94%] text-left overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 w-full"
        onClose={() => {}}
      >
        <PatientDetailModal
          isPopup={patientDetailsModal.open}
          selectedPatientID={patientDetailsModal.id}
          onCloseModal={() => {
            setPatientDetailsModal({
              open: false,
              id: null,
            });
          }}
          onSave={() => {}}
        />
      </Modal>
    </>
  );
}
