import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import type { GridColDef, GridColTypeDef } from '@mui/x-data-grid-pro';
import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import Icon from '@/components/Icon';
import Tabs from '@/components/OrganizationSelector/Tabs';
// eslint-disable-next-line import/no-cycle
import PatientDetailModal from '@/components/PatientDetailModal';
import Badge from '@/components/UI/Badge';
import Button, { ButtonType } from '@/components/UI/Button';
// eslint-disable-next-line import/no-cycle
import { ViewChargeDetails } from '@/components/UI/ChargeDetail/view-charge-detail';
// eslint-disable-next-line import/no-cycle
import CloseButton from '@/components/UI/CloseButton';
import Modal from '@/components/UI/Modal';
import type { MultiSelectGridDropdownDataType } from '@/components/UI/MultiSelectGridDropdown';
import SearchDetailGrid from '@/components/UI/SearchDetailGrid';
import SectionHeading from '@/components/UI/SectionHeading';
import StatusModal, { StatusModalType } from '@/components/UI/StatusModal';
import AppTable, { AppTableCell, AppTableRow } from '@/components/UI/Table';
import ViewNotes from '@/components/ViewNotes';
import store from '@/store';
import { addToastNotification } from '@/store/shared/actions';
import {
  applyPaymentPosting,
  fetchERAProfileDataByID,
  fetchERAProfileDetailCharges,
  fetchERAProfileDetailSummary,
  fetchPaymentPostingErrorData,
  getClaimDetailSummaryById,
  unLinkPaymentPosting,
} from '@/store/shared/sagas';
import type {
  GetERADetailCharges,
  GetERADetailSummary,
  GetPaymentPostingErrorsResult,
  TPaymentERADetailType,
} from '@/store/shared/types';
import { ToastType } from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';
import { DateToStringPipe } from '@/utils/dateConversionPipes';

import type { IcdData } from '../createClaim';
import type { ChargesSearchModalParamsT } from './chargesSearchModal';
// eslint-disable-next-line import/no-cycle
import ChargesSearchModal from './chargesSearchModal';
import FullERADetail from './fullERADetail';

interface TProps {
  open: boolean;
  eraId: number;
  onClose: (isAddedUpdated: boolean) => void;
}

export default function DetailPaymentERA({ open, eraId, onClose }: TProps) {
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
  const [statusModalInfo, setStatusModalInfo] = useState<{
    show: boolean;
    showCloseButton?: boolean;
    heading: string;
    text: string;
    type: StatusModalType;
    id?: number | null;
    confirmType?: string;
    okButtonText?: string;
    okButtonColor?: ButtonType;
  }>();
  const [chargesSearchModealInfo, setChargesSearchModealInfo] = useState<{
    id: number;
    open: boolean;
    params: ChargesSearchModalParamsT;
  }>();
  const [openfullERADetail, setOpenfullERADetailModal] = useState<{
    open: boolean;
  }>({ open: false });
  const [isOpenNotePane, setIsOpenNotePane] = React.useState(false);
  const [eraDetailClaimIDs, setERADetailClaimIDs] = useState<string | null>(
    null
  );
  const [isViewFullERA, setIsViewFullERA] = useState(false);
  interface TabProps {
    id: number | undefined;
    name: string;
    count?: number;
  }

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
      name: 'ERA Summary',
    },
    {
      id: 2,
      name: 'Charges List',
      count: 0,
    },
    {
      id: 3,
      name: 'Payment Posting Errors',
      count: 0,
    },
  ]);
  const [currentTab, setCurrentTab] = useState(tabs[0]);

  const [linkedChargesTabs, setLinkedChargesTabs] = useState<TabProps[]>([
    {
      id: 1,
      name: 'With Unapplied Payments',
      count: 0,
    },
    {
      id: 2,
      name: 'With Applied Payments',
      count: 0,
    },
  ]);
  const [linkedChargeCurrentTab, setLinkedChargeCurrentTab] = useState(
    linkedChargesTabs[0]
  );

  const [eraCollapseInfo, setEraCollapseInfo] = useState({
    summary: false,
    detail: false,
  });
  const [chargeCollapseInfo, setChargeCollapseInfo] = useState({
    unlinked: false,
    linked: false,
  });

  const [detailRes, setDetailRes] = useState<TPaymentERADetailType>();
  const [eraDetailSummary, setERADetailSummary] =
    useState<GetERADetailSummary>();
  const [paymentPostingErrors, setPaymentPaotingErrors] =
    useState<GetPaymentPostingErrorsResult[]>();
  const [chargesList, setChargesList] = useState<{
    unlinked: GetERADetailCharges[];
    unapplied: GetERADetailCharges[];
    applied: GetERADetailCharges[];
  }>({ unlinked: [], unapplied: [], applied: [] });

  interface ERADetailSummaryArrayType {
    heading: string;
    data: {
      label: string;
      value: string | number;
    }[];
  }

  const [eraDetailSummaryArray, setERADetailSummaryArray] = useState<
    ERADetailSummaryArrayType[]
  >([]);

  useEffect(() => {
    if (eraDetailSummary) {
      setERADetailSummaryArray([
        {
          heading: 'ERA Info.',
          data: [
            { label: 'Provider Name', value: eraDetailSummary.provider },
            { label: 'Provider NPI', value: eraDetailSummary.providerNPI },
            { label: 'ERA Date', value: eraDetailSummary.eraDate },
            {
              label: 'Check / EFT Trace #',
              value: eraDetailSummary.checkNumber,
            },
          ],
        },
        {
          heading: 'Claims Info.',
          data: [
            { label: 'Total Claims', value: eraDetailSummary.claimsCount },
          ],
        },
        {
          heading: 'Financial Info.',
          data: [
            {
              label: 'Billed Amount',
              value: currencyFormatter.format(eraDetailSummary.billedAmount),
            },
            {
              label: 'Total Reason Code Adjustment Amount',
              value: currencyFormatter.format(
                eraDetailSummary.patientResponsibilityAmount
              ),
            },
            {
              label: 'Total Allowed Amount',
              value: currencyFormatter.format(eraDetailSummary.allowedAmount),
            },
          ],
        },
        {
          heading: 'Patient Responsibility Info.',
          data: [
            {
              label: 'Total Coinsurance Amount',
              value: currencyFormatter.format(
                eraDetailSummary.coInsuranceAmount
              ),
            },
            {
              label: 'Total Deductible Amount',
              value: currencyFormatter.format(
                eraDetailSummary.deductibleAmount
              ),
            },
            {
              label: 'Total Patient Responsibility',
              value: currencyFormatter.format(
                eraDetailSummary.patientResponsibilityAmount
              ),
            },
          ],
        },
        {
          heading: 'Totals Info.',
          data: [
            {
              label: 'Total Paid to Provider',
              value: currencyFormatter.format(eraDetailSummary.paidAmount),
            },
            {
              label: 'Total Check / EFT Amount',
              value: currencyFormatter.format(eraDetailSummary.checkAmount),
            },
          ],
        },
      ]);
    }
  }, [eraDetailSummary]);

  const getERAProfileDataByID = async () => {
    const res = await fetchERAProfileDataByID(eraId);
    if (res) {
      setDetailRes(res);
    }
  };
  const [selectRows, setSelectRows] = useState<number[]>([]);
  const [isDisabled, setIsDisabled] = useState(true);

  const getERAProfileDetailSummary = async () => {
    const res = await fetchERAProfileDetailSummary(eraId);
    if (res) {
      setERADetailSummary(res);
      setSelectRows([]);
    }
  };

  const getPaymentPostingErrors = async () => {
    const res = await fetchPaymentPostingErrorData(eraId);
    if (res) {
      setTabs((prevTabs) => {
        return prevTabs.map((d) => {
          if (d.id === 3) {
            return { ...d, count: res.length }; // Update count only for tab with id 3
          }
          return d; // Keep other tabs unchanged
        });
      });
      setPaymentPaotingErrors(res);
    }
  };

  const getERAProfileDetailCharges = async () => {
    const res = await fetchERAProfileDetailCharges(eraId);
    if (res) {
      // handele Applied and Unapplied Count
      const unlinkedCount = res.filter((f) => !f.linked).length;
      const unappliedCount = res.filter((f) => f.linked && !f.posted).length;
      const appliedCount = res.filter((f) => f.linked && f.posted).length;
      setTabs((prevTabs) => {
        return prevTabs.map((d) => {
          if (d.id === 2) {
            return {
              ...d,
              count: unlinkedCount + unappliedCount + appliedCount,
            }; // Update count only for tab with id 3
          }
          return d; // Keep other tabs unchanged
        });
      });
      setLinkedChargesTabs(
        linkedChargesTabs.map((d) => {
          return { ...d, count: d.id === 1 ? unappliedCount : appliedCount };
        })
      );

      // set data
      setChargesList({
        unlinked: res.filter((f) => !f.linked),
        unapplied: res.filter((f) => f.linked && !f.posted),
        applied: res.filter((f) => f.linked && f.posted),
      });
    }
  };

  useEffect(() => {
    getERAProfileDataByID();
    getERAProfileDetailSummary();
    getERAProfileDetailCharges();
    getPaymentPostingErrors();
  }, []);

  const onPressClose = () => {
    onClose(false);
  };
  useEffect(() => {
    if (selectRows.length === 0) {
      setIsDisabled(true);
    }
  }, [selectRows]);
  const renderSatusView = () => {
    const getIconColor = () => {
      if (detailRes?.eraStatusColor === 'gray') {
        return IconColors.GRAY;
      }
      if (detailRes?.eraStatusColor === 'red') {
        return IconColors.RED;
      }
      return IconColors.Yellow;
    };
    const statusColor = detailRes?.eraStatusColor || 'yellow';
    return (
      <Badge
        text={detailRes?.eraStatus}
        cls={classNames(
          `!ml-[-1px] !rounded-[4px] bg-${statusColor}-100 text-${statusColor}-800`
        )}
        icon={<Icon name={'desktop'} color={getIconColor()} />}
      />
    );
  };

  const LinkedPostedTextColor = (type: string) => {
    const isClaimsType = ['claimsLinkedCount', 'claimsPostedCount'].includes(
      type
    );
    const isChargesType = ['chargesLinkedCount', 'chargesPostedCount'].includes(
      type
    );

    if (detailRes?.claimsTotalCount && isClaimsType) {
      if (
        detailRes?.claimsTotalCount === detailRes?.claimsLinkedCount &&
        type === 'claimsLinkedCount'
      ) {
        return 'text-green-500';
      }
      if (
        detailRes?.claimsTotalCount === detailRes?.claimsPostedCount &&
        type === 'claimsPostedCount'
      ) {
        return 'text-green-500';
      }

      return 'text-red-500';
    }
    if (detailRes?.chargesTotalCount && isChargesType) {
      if (
        detailRes?.chargesTotalCount === detailRes?.chargesLinkedCount &&
        type === 'chargesLinkedCount'
      ) {
        return 'text-green-500';
      }
      if (
        detailRes?.chargesTotalCount === detailRes?.chargesPostedCount &&
        type === 'chargesPostedCount'
      ) {
        return 'text-green-500';
      }

      return 'text-red-500';
    }

    return 'text-gray-500';
  };

  const getBalanceStyle = (n: number | undefined | null) => {
    let color = 'gray';
    if (n !== null && n !== undefined) {
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

  const unLinkPayment = async (id: number) => {
    const res = await unLinkPaymentPosting(id);
    if (res?.pkid === 1) {
      getERAProfileDataByID();
      getERAProfileDetailCharges();
    } else {
      setStatusModalInfo({
        showCloseButton: false,
        show: true,
        heading: 'Error',
        text: 'A system error prevented the charge to be unlinked.\nPlease try again.',
        type: StatusModalType.ERROR,
      });
    }
  };

  const applyPayment = async (
    eraCheckID: number | null,
    postingID: number | null,
    byPassWarningID: number | null
  ) => {
    const res = await applyPaymentPosting(
      eraCheckID,
      postingID,
      byPassWarningID
    );
    if (res && res.errors.length > 0) {
      setTabs((prevTabs) => {
        return prevTabs.map((d) => {
          if (d.id === 3) {
            return { ...d, count: res.errors.length }; // Update count only for tab with id 3
          }
          return d; // Keep other tabs unchanged
        });
      });
      setPaymentPaotingErrors(res.errors);
      setStatusModalInfo({
        show: true,
        showCloseButton: true,
        heading: 'Payment Posting Errors',
        text: 'We encountered XX errors while attempting to post payments for this ERA. Please review the error log and resolve any issues before attempting to post again.',
        type: StatusModalType.WARNING,
        okButtonText: 'View Error Log',
        okButtonColor: ButtonType.primary,
        confirmType: 'applyPayment',
        id: eraCheckID || postingID || byPassWarningID,
      });
    } else if (res && res.errors.length === 0) {
      store.dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Payment posting successfully.',
          toastType: ToastType.SUCCESS,
        })
      );
      getERAProfileDetailCharges();
      getPaymentPostingErrors();
    }
  };

  const columnsERAClaimData: GridColDef[] = [
    {
      field: 'patient',
      headerName: 'Patient',
      flex: 1,
      minWidth: 150,
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
      field: 'patientID',
      headerName: 'Patient ID',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return <div>{`#${params.value}`}</div>;
      },
    },
    {
      field: 'billedAmount',
      headerName: 'Billed Amount',
      ...usdPrice,
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'paidAmount',
      headerName: 'Paid Amount',
      ...usdPrice,
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'createdOn',
      headerName: 'Created Date',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
  ];
  const [patientDetailsModal, setPatientDetailsModal] = useState<{
    open: boolean;
    id: number | null;
  }>({
    open: false,
    id: null,
  });
  const columnsUnlinkedCharges: GridColDef[] = [
    {
      field: 'claimID',
      headerName: 'Claim ID',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-cyan-500 underline"
            onClick={async () => {
              window.open(`/app/claim-detail/${params.value}`, '_blank');
            }}
          >
            {params.value ? `#${params.value}` : ''}
          </div>
        );
      },
    },
    {
      field: 'chargeID',
      headerName: 'Charge ID',
      flex: 1,
      minWidth: 150,
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
            {params.value ? `#${params.value}` : ''}
          </div>
        );
      },
    },
    {
      field: 'patientID',
      headerName: 'Patient ID',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-cyan-500 underline"
            onClick={async () => {
              // window.open(`/app/register-patient/${params.value}`, '_blank');
              setPatientDetailsModal({
                open: true,
                id: params.value || null,
              });
            }}
          >
            {params.value ? `#${params.value}` : ''}
          </div>
        );
      },
    },
    {
      field: 'patientFirstName',
      headerName: 'Patient',
      flex: 1,
      minWidth: 240,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-cyan-500 underline"
            onClick={async () => {}}
          >
            {`${params.value} ${params.row.patientLastName}`}
          </div>
        );
      },
    },
    {
      field: 'dos',
      headerName: 'DoS',
      flex: 1,
      minWidth: 140,
      disableReorder: true,
      renderCell: (params) => {
        return <div>{`${params.value} - ${params.row.dosTo}`}</div>;
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
            {params.value ? `${params.value}` : ''}
          </div>
        );
      },
    },
    {
      field: 'cpt',
      headerName: 'CPT Code',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'adjustmentCodes',
      headerName: 'Adj. Codes',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'remarkCodes',
      headerName: 'Rem. Codes',
      flex: 1,
      minWidth: 150,
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
      field: 'allowed',
      headerName: 'Allow.',
      ...usdPrice,
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'adjustment',
      headerName: 'Adj.',
      ...usdPrice,
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'coInsurance',
      headerName: 'Coins.',
      ...usdPrice,
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'deductible',
      headerName: 'Deduc.',
      ...usdPrice,
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'copay',
      headerName: 'Copay',
      ...usdPrice,
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'patientResponsibility',
      headerName: 'Pat. Resp.',
      ...usdPrice,
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'posted',
      type: 'boolean',
      headerName: 'Posted',
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
      field: 'actionUnlink',
      headerName: 'Actions',
      flex: 1,
      minWidth: 175,
      hideSortIcons: true,
      disableReorder: true,
      cellClassName: '!bg-cyan-50 PinnedColumLeftBorder',
      headerClassName: '!bg-cyan-100 !text-center PinnedColumLeftBorder',
      renderCell: (params) => {
        return (
          <div className="flex">
            <Button
              buttonType={ButtonType.primary}
              cls={`!h-[30px] inline-flex px-4 py-2 gap-2 leading-5 bg-cyan-500`}
              onClick={() => {
                const obj = chargesList.unlinked.filter(
                  (f) => f.id === params.row.id
                )[0];
                setChargesSearchModealInfo({
                  id: params.row.id,
                  open: true,
                  params: {
                    procedureCode: obj?.cpt || '',
                    patientFirstName: obj?.patientFirstName || '',
                    patientLastName: obj?.patientLastName || '',
                    fromDOS: obj?.dos ? new Date(obj?.dos) : null,
                    toDOS: null,
                  },
                });
              }}
            >
              <Icon name={'link'} size={18} />
              <p className="mt-[2px] self-center text-xs font-medium leading-4">
                Link Charge
              </p>
            </Button>
          </div>
        );
      },
    },
    {
      field: 'actionLink',
      headerName: 'Actions',
      flex: 1,
      minWidth: 340,
      hideSortIcons: true,
      disableReorder: true,
      cellClassName: '!bg-cyan-50 PinnedColumLeftBorder',
      headerClassName: '!bg-cyan-100 !text-center PinnedColumLeftBorder',
      renderCell: (params) => {
        return (
          <div className="flex gap-2">
            <Button
              buttonType={ButtonType.primary}
              cls={`!h-[30px] inline-flex px-4 py-2 gap-2 leading-5 bg-cyan-500`}
              onClick={() => {
                applyPayment(eraId, params.row.id, null);
              }}
            >
              <Icon name={'payment'} size={18} />
              <p className="mt-[2px] self-center text-xs font-medium leading-4">
                Apply Payment
              </p>
            </Button>
            <Button
              buttonType={ButtonType.secondary}
              cls={`!h-[30px] inline-flex px-4 py-2 gap-2 leading-5`}
              onClick={() => {
                setStatusModalInfo({
                  show: true,
                  showCloseButton: true,
                  heading: 'Unlink Charge Confirmation',
                  text: 'Unlinking a charge will cause it to be disassociated from this ERA. Are you sure you want to proceed with this action?',
                  type: StatusModalType.WARNING,
                  okButtonText: 'Yes, Unlink Charge',
                  okButtonColor: ButtonType.tertiary,
                  confirmType: 'unLinkPayment',
                  id: params.row.id,
                });
              }}
            >
              <Icon name={'link'} size={18} color={IconColors.GRAY_500} />
              <p className="mt-[2px] self-center text-xs font-medium leading-4">
                Unlink Charge
              </p>
            </Button>
          </div>
        );
      },
    },
  ];

  const columnsPaymentPostingErrorData: GridColDef[] = [
    {
      field: 'validationErrorID',
      headerName: 'ERA Line Item ID',
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
      field: 'claimID',
      headerName: 'Claim ID',
      flex: 1,
      minWidth: 150,
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
      field: 'fromDos',
      headerName: 'DoS',
      flex: 1,
      minWidth: 140,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            {params.value ? `${params.row.fromDos} - ${params.row.toDos}` : ''}
          </div>
        );
      },
    },
    {
      field: 'reason',
      headerName: 'Reason',
      flex: 1,
      minWidth: 500,
      disableReorder: true,
    },
    {
      field: 'severity',
      headerName: 'Severity',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
      renderCell: (params) => {
        if (params.value === 'Warning') {
          return (
            <Badge
              text={params.value}
              cls={
                'bg-amber-100 text-amber-800 rounded-[4px] whitespace-normal'
              }
            />
          );
        }
        return (
          <Badge
            text={params.value}
            cls={'bg-red-100 text-red-800 rounded-[4px] whitespace-normal'}
          />
        );
      },
    },
    {
      field: 'action',
      headerName: 'Actions',
      flex: 1,
      minWidth: 210,
      hideSortIcons: true,
      disableReorder: true,
      cellClassName: '!bg-cyan-50 PinnedColumLeftBorder',
      headerClassName: '!bg-cyan-100 !text-center PinnedColumLeftBorder',
      renderCell: (params) => {
        return (
          <div className="flex">
            {params.row.disablePayment === false ? (
              <Button
                buttonType={ButtonType.primary}
                cls={`!h-[30px] inline-flex px-4 py-2 gap-2 leading-5 bg-cyan-500`}
                onClick={() => {
                  applyPayment(
                    eraId,
                    params.row.postingID,
                    params.row.postingID
                  );
                }}
              >
                <Icon name={'payment'} size={18} />
                <p className="mt-[2px] self-center text-xs font-medium leading-4">
                  Force Pay. Posting
                </p>
              </Button>
            ) : (
              <Button
                buttonType={ButtonType.primary}
                cls={`!h-[30px] inline-flex px-4 py-2 gap-2 leading-5 bg-cyan-500`}
                disabled={true}
              >
                <Icon name={'payment'} size={18} color={IconColors.GRAY} />
                <p className="mt-[2px] self-center text-xs font-medium leading-4">
                  Force Pay. Posting
                </p>
              </Button>
            )}
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
        {chargesSearchModealInfo?.open && (
          <ChargesSearchModal
            open={chargesSearchModealInfo.open}
            id={chargesSearchModealInfo.id}
            type={'linkPayment'}
            inputs={chargesSearchModealInfo.params}
            hideBackdrop={!isOpenNotePane}
            onClose={(v) => {
              if (v === 'isLinked') {
                setTimeout(() => {
                  store.dispatch(
                    addToastNotification({
                      id: uuidv4(),
                      text: 'Charge Successfully Linked',
                      toastType: ToastType.SUCCESS,
                    })
                  );
                }, 500);
                getERAProfileDataByID();
                getERAProfileDetailCharges();
              }
              setChargesSearchModealInfo(undefined);
            }}
          />
        )}
        <div className="flex h-full w-full flex-col items-center justify-start overflow-hidden rounded-lg bg-white shadow">
          <div className="flex w-full flex-col items-start justify-start px-6 py-4">
            <div className="inline-flex w-full items-center justify-between">
              <div className="flex items-center justify-start space-x-2">
                <p className="text-xl font-bold leading-7 text-cyan-600">
                  ERA Payment {eraId ? `#${eraId}` : ''}
                </p>
              </div>
              <div className="inline-flex items-center gap-4">
                <CloseButton onClick={onPressClose} />
              </div>
            </div>
          </div>
          <div className={'w-full px-6'}>
            <div className={`h-[1px] w-full bg-gray-300`} />
          </div>
          <div className="w-full flex-1 overflow-y-auto bg-gray-50 pb-[55px]">
            <div className="bg-white drop-shadow-md">
              <div className="inline-flex h-[100px] w-full items-center justify-start py-3 px-6">
                <div className="flex h-full w-[15%] items-center justify-start space-x-2 py-2">
                  <div className="w-[15%]">
                    <Icon name={'building'} />
                  </div>
                  <div className="w-[85%]">
                    <div className="flex flex-col text-left">
                      <p className="text-sm font-bold leading-tight text-gray-600">
                        Insurance:
                      </p>
                      <p
                        title={detailRes?.insurance}
                        className="text-truncate-3-lines cursor-pointer text-sm font-semibold leading-tight text-cyan-500 underline"
                      >
                        {detailRes?.insurance}
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
                  <div className="w-[15%]">
                    <Icon name={'UserBolt'} />
                  </div>
                  <div className="w-[85%]">
                    <div className="flex flex-col text-left">
                      <p className="text-sm font-bold leading-tight text-gray-600">
                        Payee:
                      </p>
                      <p className="cursor-pointer text-sm leading-tight text-cyan-500 underline">
                        {detailRes?.payeeName}
                      </p>
                      {!!detailRes?.payeeNPI && (
                        <p className="text-xs leading-none text-gray-400">
                          NPI: {detailRes?.payeeNPI}
                        </p>
                      )}
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
                <div className="flex h-full w-[55%] space-x-2">
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
                    <Icon name={'file'} />
                    <div className="flex flex-col text-left">
                      <p className="text-sm font-bold leading-tight text-gray-600">
                        Payment Type:
                      </p>
                      <p className="text-sm font-semibold leading-tight text-gray-600">
                        {detailRes?.paymentType}
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
              </div>
              <div className={`pb-[12px]`}>
                <div className={`h-[1px] w-full bg-gray-200`} />
              </div>
              <div className="inline-flex h-[115px] w-full items-start justify-start space-x-4 px-6">
                <div className="inline-flex h-full w-[20%] items-start justify-start rounded-lg border border-gray-300 bg-gray-50 p-6 shadow">
                  <div className="inline-flex h-full flex-col items-start justify-start space-y-4">
                    <div className="flex flex-col items-start justify-start space-y-1">
                      <p className="text-sm font-bold leading-tight text-gray-600">
                        ERA Status:
                      </p>
                      {renderSatusView()}
                      {detailRes?.eraStatusTime && (
                        <p className="pt-[3px] text-xs leading-3 text-gray-400">
                          {DateToStringPipe(
                            new Date(detailRes.eraStatusTime),
                            5
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="inline-flex h-full w-[20%] flex-col items-start justify-start rounded-lg border border-gray-300 bg-gray-50 py-4 px-6 shadow">
                  <div className="flex w-full flex-1 flex-col items-start justify-center rounded-lg py-2">
                    <div className="flex w-full flex-col items-start justify-start space-y-2">
                      <div className="flex items-center justify-start space-x-4">
                        <div className="flex items-center justify-start space-x-4">
                          <p className="text-sm font-bold leading-tight text-gray-600">
                            Claims On ERA
                          </p>
                        </div>
                      </div>
                      <div className="inline-flex w-full items-start justify-start">
                        <div className="flex h-full w-[33%] items-start justify-start rounded-md">
                          <div className="inline-flex flex-col items-start justify-start space-y-1">
                            <p className="text-xs font-medium leading-none text-gray-500">
                              Total
                            </p>
                            <div className="inline-flex items-end justify-start">
                              <div className="flex items-end justify-start space-x-2">
                                <p className="text-sm font-bold leading-tight text-gray-700">
                                  {detailRes?.claimsTotalCount || '0'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex h-full w-[33%] items-start justify-start rounded-md">
                          <div className="inline-flex flex-col items-start justify-start space-y-1">
                            <p className="text-xs font-medium leading-none text-gray-500">
                              Linked
                            </p>
                            <div className="inline-flex items-end justify-start">
                              <div className="flex items-end justify-start space-x-2">
                                <p
                                  className={classNames(
                                    'text-sm font-bold leading-tight',
                                    LinkedPostedTextColor('claimsLinkedCount')
                                  )}
                                >
                                  {detailRes?.claimsLinkedCount || '0'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex h-full w-[33%] items-start justify-start rounded-md">
                          <div className="inline-flex flex-col items-start justify-start space-y-1">
                            <p className="text-xs font-medium leading-none text-gray-500">
                              Posted
                            </p>
                            <div className="inline-flex items-end justify-start">
                              <div className="flex items-end justify-start space-x-2">
                                <p
                                  className={classNames(
                                    'text-sm font-bold leading-tight',
                                    LinkedPostedTextColor('claimsPostedCount')
                                  )}
                                >
                                  {detailRes?.claimsPostedCount || '0'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="inline-flex h-full w-[20%] flex-col items-start justify-start rounded-lg border border-gray-300 bg-gray-50 py-4 px-6 shadow">
                  <div className="flex w-full flex-1 flex-col items-start justify-center rounded-lg py-2">
                    <div className="flex w-full flex-col items-start justify-start space-y-2">
                      <div className="flex items-center justify-start space-x-4">
                        <div className="flex items-center justify-start space-x-4">
                          <p className="text-sm font-bold leading-tight text-gray-600">
                            Charges On ERA
                          </p>
                        </div>
                      </div>
                      <div className="inline-flex w-full items-start justify-start">
                        <div className="flex h-full w-[33%] items-start justify-start rounded-md">
                          <div className="inline-flex flex-col items-start justify-start space-y-1">
                            <p className="text-xs font-medium leading-none text-gray-500">
                              Total
                            </p>
                            <div className="inline-flex items-end justify-start">
                              <div className="flex items-end justify-start space-x-2">
                                <p className="text-sm font-bold leading-tight text-gray-700">
                                  {detailRes?.chargesTotalCount || '0'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex h-full w-[33%] items-start justify-start rounded-md">
                          <div className="inline-flex flex-col items-start justify-start space-y-1">
                            <p className="text-xs font-medium leading-none text-gray-500">
                              Linked
                            </p>
                            <div className="inline-flex items-end justify-start">
                              <div className="flex items-end justify-start space-x-2">
                                <p
                                  className={classNames(
                                    'text-sm font-bold leading-tight',
                                    LinkedPostedTextColor('chargesLinkedCount')
                                  )}
                                >
                                  {detailRes?.chargesLinkedCount || '0'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex h-full w-[33%] items-start justify-start rounded-md">
                          <div className="inline-flex flex-col items-start justify-start space-y-1">
                            <p className="text-xs font-medium leading-none text-gray-500">
                              Posted
                            </p>
                            <div className="inline-flex items-end justify-start">
                              <div className="flex items-end justify-start space-x-2">
                                <p
                                  className={classNames(
                                    'text-sm font-bold leading-tight',
                                    LinkedPostedTextColor('chargesPostedCount')
                                  )}
                                >
                                  {detailRes?.chargesPostedCount || '0'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="inline-flex h-full w-[20%] flex-col items-start justify-start rounded-lg border border-gray-300 bg-gray-50 py-4 px-6 shadow">
                  <div className="flex flex-1 flex-col items-start justify-center rounded-lg py-2">
                    <div className="flex flex-col items-start justify-start space-y-2">
                      <div className="flex items-center justify-start space-x-4">
                        <div className="flex items-center justify-start space-x-4">
                          <p className="text-sm font-bold leading-tight text-gray-600">
                            ERA Payment Details
                          </p>
                        </div>
                      </div>
                      <div className="inline-flex items-start justify-start space-x-2">
                        <div className="flex h-full w-20 items-start justify-start rounded-md">
                          <div className="inline-flex flex-col items-start justify-start space-y-1">
                            <p className="text-xs font-medium leading-none text-gray-500">
                              Total Paid
                            </p>
                            <div className="inline-flex items-end justify-start">
                              <div className="flex items-end justify-start space-x-2">
                                <p className="text-sm font-bold leading-tight text-gray-700">
                                  {currencyFormatter.format(
                                    detailRes?.totalPaid || 0
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex h-full w-20 items-start justify-start rounded-md">
                          <div className="inline-flex flex-col items-start justify-start space-y-1">
                            <p className="text-xs font-medium leading-none text-gray-500">
                              Total Posted
                            </p>
                            <div className="inline-flex items-end justify-start">
                              <div className="flex items-end justify-start space-x-2">
                                <p className="text-sm font-bold leading-tight text-gray-700">
                                  {currencyFormatter.format(
                                    detailRes?.totalPosted || 0
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
                    'flex items-center justify-center flex-1 h-full w-[20%] shadow border rounded-md',
                    getBalanceStyle(detailRes?.eraBalance)
                  )}
                >
                  <div className="flex flex-col text-left">
                    <p className="w-full text-sm font-bold leading-tight">
                      Batch Balance
                    </p>
                    <p className="text-xl font-bold leading-7">
                      {currencyFormatter.format(
                        detailRes?.eraBalance
                          ? detailRes.eraBalance *
                              (detailRes.eraBalance < 0 ? -1 : 1)
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
            {currentTab?.id === 1 && (
              <div className="w-full gap-4 px-7 pt-[25px] pb-[15px]">
                <div className="mb-2 flex h-[40px] w-full gap-4">
                  <div className="inline-flex items-center justify-start space-x-2">
                    <p className="text-xl font-bold leading-7 text-gray-700">
                      ERA Summary
                    </p>
                  </div>
                  <Button
                    buttonType={ButtonType.primary}
                    cls={`inline-flex px-4 py-2 gap-2 leading-5 bg-cyan-500`}
                    onClick={() => {
                      setOpenfullERADetailModal({
                        open: true,
                      });
                      setIsViewFullERA(true);
                    }}
                  >
                    <p className="mt-[2px] self-center text-xs font-medium leading-4">
                      View Full ERA File For All Claims
                    </p>
                  </Button>
                </div>
                <SectionHeading
                  label="Summary"
                  isCollapsable={true}
                  hideBottomDivider
                  onClick={() => {
                    setEraCollapseInfo({
                      ...eraCollapseInfo,
                      summary: !eraCollapseInfo.summary,
                    });
                  }}
                  isCollapsed={eraCollapseInfo.summary}
                />
                <div className="mt-[50px] mb-[20px] w-full">
                  <div
                    hidden={eraCollapseInfo.summary}
                    className="w-full drop-shadow-lg"
                  >
                    <AppTable
                      cls="!w-[700px]"
                      renderHead={
                        <>
                          <AppTableRow>
                            <AppTableCell cls="!py-2 !whitespace-nowrap !px-4 !bg-gray-100 !text-gray-600 !font-bold">
                              Parameter
                            </AppTableCell>
                            <AppTableCell cls="!py-2 !whitespace-nowrap !px-4 !bg-gray-100 !text-gray-600 !font-bold">
                              Value
                            </AppTableCell>
                          </AppTableRow>
                        </>
                      }
                      renderBody={
                        <>
                          {eraDetailSummaryArray.length ? (
                            <>
                              {eraDetailSummaryArray.map((r) => {
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
                                          <AppTableCell>{d.label}</AppTableCell>
                                          <AppTableCell>{d.value}</AppTableCell>
                                        </AppTableRow>
                                      );
                                    })}
                                  </>
                                );
                              })}
                            </>
                          ) : (
                            <AppTableRow>
                              <AppTableCell cls={'!text-center'} colSpan={2}>
                                No rows
                              </AppTableCell>
                            </AppTableRow>
                          )}
                        </>
                      }
                    />
                  </div>
                </div>
                <div className="py-[24px]">
                  <SectionHeading
                    label="ERA Claims List"
                    isCollapsable={true}
                    hideBottomDivider
                    onClick={() => {
                      setEraCollapseInfo({
                        ...eraCollapseInfo,
                        detail: !eraCollapseInfo.detail,
                      });
                    }}
                    isCollapsed={eraCollapseInfo.detail}
                    rightContent={<div className={`h-[38px]`}></div>}
                  />
                </div>
                <div className="flex w-full flex-col pb-[16px] pt-[20px]">
                  <div hidden={eraCollapseInfo.detail} className="h-full">
                    <SearchDetailGrid
                      totalCount={eraDetailSummary?.eraClaimsData.length}
                      rows={eraDetailSummary?.eraClaimsData || []}
                      columns={columnsERAClaimData}
                      selectRows={selectRows}
                      onSelectRow={(ids: number[]) => {
                        setSelectRows(ids);
                        setERADetailClaimIDs(ids.join(','));
                        setIsDisabled(false);
                      }}
                      checkboxSelection={true}
                      hideHeader={true}
                      hideFooter={true}
                      paginationMode={'client'}
                      pinnedColumns={{
                        right: ['action'],
                      }}
                    />
                  </div>
                </div>
                <div style={{ textAlign: 'start' }}>
                  <Button
                    buttonType={
                      isDisabled ? ButtonType.secondary : ButtonType.primary
                    }
                    cls={`!h-[30px] inline-flex px-4 py-2 gap-2 leading-5`}
                    disabled={isDisabled}
                    onClick={() => {
                      if (selectRows.length) {
                        setOpenfullERADetailModal({
                          open: true,
                        });
                      }
                    }}
                  >
                    <Icon name={'eyeWhite'} size={18} />
                    <p className="mt-[2px] self-center text-xs font-medium leading-4">
                      View Full ERA Details
                    </p>
                  </Button>
                </div>
              </div>
            )}
            {currentTab?.id === 2 && (
              <div className="w-full gap-4 px-7 pt-[25px] pb-[15px]">
                <div className="mb-2 flex h-[40px] w-full gap-4">
                  <div className="inline-flex items-center justify-start space-x-2">
                    <p className="text-xl font-bold leading-7 text-gray-700">
                      Charges List
                    </p>
                  </div>
                  <Button
                    buttonType={ButtonType.primary}
                    cls={`h-[38px] inline-flex px-4 py-2 gap-2 leading-5 bg-cyan-500`}
                    onClick={() => {
                      applyPayment(eraId, null, null);
                    }}
                  >
                    <p className="mt-[2px] self-center text-xs font-medium leading-4">
                      Apply All Available Payments
                    </p>
                  </Button>
                </div>
                <SectionHeading
                  label="Unlinked Charges"
                  isCollapsable={true}
                  hideBottomDivider
                  onClick={() => {
                    setChargeCollapseInfo({
                      ...chargeCollapseInfo,
                      unlinked: !chargeCollapseInfo.unlinked,
                    });
                  }}
                  isCollapsed={chargeCollapseInfo.unlinked}
                  rightContent={
                    <span
                      className={classNames(
                        'bg-cyan-500 text-white hidden py-0.5 px-2.5 rounded-full text-xs font-medium md:inline-block'
                      )}
                    >
                      {chargesList.unlinked.length}
                    </span>
                  }
                />
                <div
                  className={classNames(
                    'flex w-full flex-col',
                    chargeCollapseInfo.unlinked ? 'mt-[50px]' : 'mt-[25px]'
                  )}
                >
                  <div hidden={chargeCollapseInfo.unlinked} className="h-full">
                    <SearchDetailGrid
                      totalCount={chargesList.unlinked.length}
                      rows={chargesList.unlinked}
                      columns={columnsUnlinkedCharges.filter(
                        (column) =>
                          ![
                            'claimID',
                            'chargeID',
                            'patientID',
                            'insurance',
                            'actionLink',
                          ].includes(column.field)
                      )}
                      checkboxSelection={false}
                      paginationMode={'client'}
                      pinnedColumns={{
                        right: ['actionUnlink'],
                      }}
                    />
                  </div>
                </div>
                <SectionHeading
                  label="Linked Charges"
                  isCollapsable={true}
                  hideBottomDivider
                  onClick={() => {
                    setChargeCollapseInfo({
                      ...chargeCollapseInfo,
                      linked: !chargeCollapseInfo.linked,
                    });
                  }}
                  isCollapsed={chargeCollapseInfo.linked}
                />
                <div
                  hidden={chargeCollapseInfo.linked}
                  className="w-full pt-[35px]"
                >
                  <Tabs
                    tabs={linkedChargesTabs}
                    onChangeTab={(tab: any) => {
                      setLinkedChargeCurrentTab(tab);
                    }}
                    currentTab={linkedChargeCurrentTab}
                  />
                </div>
                <div className="flex w-full flex-col">
                  <div hidden={chargeCollapseInfo.linked} className="h-full">
                    <div
                      className={classNames(
                        'flex w-full',
                        linkedChargeCurrentTab?.id === 1 ? '' : 'hidden'
                      )}
                    >
                      <SearchDetailGrid
                        totalCount={chargesList.unapplied.length}
                        rows={chargesList.unapplied}
                        columns={columnsUnlinkedCharges.filter(
                          (column) => !['actionUnlink'].includes(column.field)
                        )}
                        checkboxSelection={false}
                        paginationMode={'client'}
                        pinnedColumns={{
                          right: ['actionLink'],
                        }}
                      />
                    </div>
                    <div
                      className={classNames(
                        'flex w-full',
                        linkedChargeCurrentTab?.id === 2 ? '' : 'hidden'
                      )}
                    >
                      <SearchDetailGrid
                        totalCount={chargesList.applied.length}
                        rows={chargesList.applied}
                        columns={columnsUnlinkedCharges.filter(
                          (column) =>
                            !['actionUnlink', 'actionLink'].includes(
                              column.field
                            )
                        )}
                        checkboxSelection={false}
                        paginationMode={'client'}
                        pinnedColumns={{
                          right: ['actionLink'],
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            {currentTab?.id === 3 && (
              <div className="w-full gap-4 px-7 pt-[25px] pb-[15px]">
                <div className="mb-2 flex h-[40px] w-full gap-4">
                  <div className="inline-flex items-center justify-start space-x-2">
                    <p className="text-xl font-bold leading-7 text-gray-700">
                      Payment Posting Errors
                    </p>
                  </div>
                </div>
                <SearchDetailGrid
                  hideHeader={true}
                  hideFooter={true}
                  totalCount={paymentPostingErrors?.length}
                  rows={
                    paymentPostingErrors?.map((row) => {
                      return { ...row, id: row.validationErrorID };
                    }) || []
                  }
                  columns={columnsPaymentPostingErrorData}
                  checkboxSelection={false}
                  pinnedColumns={{
                    right: ['action'],
                  }}
                />
              </div>
            )}
            <div className="w-full px-6 pt-[15px]"></div>
            {!!eraId && (
              <ViewNotes
                id={eraId}
                noteType="era"
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
        {openfullERADetail.open && (
          <>
            <FullERADetail
              openpopup={openfullERADetail.open}
              onClose={() => {
                setOpenfullERADetailModal({ open: false });
                // setERADetailClaimIDs(null);
                setIsViewFullERA(false);
              }}
              eraID={eraId}
              claimIDs={!isViewFullERA ? eraDetailClaimIDs : null}
            />
          </>
        )}
        {!!statusModalInfo?.show && (
          <StatusModal
            open={!!statusModalInfo?.show}
            heading={statusModalInfo?.heading}
            description={statusModalInfo?.text}
            statusModalType={statusModalInfo?.type}
            showCloseButton={statusModalInfo?.showCloseButton}
            okButtonText={statusModalInfo?.okButtonText}
            okButtonColor={statusModalInfo?.okButtonColor}
            closeOnClickOutside={true}
            onChange={() => {
              if (
                statusModalInfo.id &&
                statusModalInfo.confirmType === 'unLinkPayment'
              ) {
                unLinkPayment(statusModalInfo.id);
              }
              if (
                statusModalInfo.id &&
                statusModalInfo.confirmType === 'applyPayment'
              ) {
                // getPaymentPostingErrors();
                setCurrentTab(tabs[2]);
              }
              setStatusModalInfo(undefined);
            }}
            onClose={() => {
              setStatusModalInfo(undefined);
            }}
          />
        )}
      </Modal>
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
