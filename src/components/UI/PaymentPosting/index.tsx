import type {
  GridColDef,
  GridRowId,
  GridRowParams,
} from '@mui/x-data-grid-pro';
import { GRID_DETAIL_PANEL_TOGGLE_COL_DEF } from '@mui/x-data-grid-pro';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import Icon from '@/components/Icon';
// eslint-disable-next-line import/no-cycle
import { CustomDetailPanelToggle } from '@/pages/app/all-claims';
import AddPaymentBatch from '@/screen/batch/addPaymentBatch';
import store from '@/store';
import {
  addToastNotification,
  setSelectedPaymentBatchID,
} from '@/store/shared/actions';
import {
  fetchPostingDate,
  getClaimAdvancePayment,
  getClaimDetailSummaryById,
  getClaimPayor,
  getPaymentBatchDropdownData,
  saveInsPayment,
  savePatientPayment,
} from '@/store/shared/sagas';
import { getLookupDropdownsDataSelector } from '@/store/shared/selectors';
import type {
  ClaimAdvancePayment,
  PatientRefunds,
  PaymentBatchData,
  PostingDateCriteria,
  SaveInsurancePaymentCriteria,
  SavePatientPaymentCriteria,
  SummaryBillingCharges,
} from '@/store/shared/types';
import { ToastType } from '@/store/shared/types';
import { IconColors } from '@/utils/ColorFilters';
import { DateToStringPipe } from '@/utils/dateConversionPipes';

import AppDatePicker from '../AppDatePicker';
import Button, { ButtonType } from '../Button';
import CloseButton from '../CloseButton';
import InputField from '../InputField';
import InputFieldAmount from '../InputFieldAmount';
import PaymentPostingExpandableRow from '../PaymentPostingExpandableRow';
import RadioButton from '../RadioButton';
import SearchDetailGrid from '../SearchDetailGrid';
import type { SingleSelectDropDownDataType } from '../SingleSelectDropDown';
import SingleSelectGridDropDown from '../SingleSelectGridDropdown';
import StatusModal, { StatusModalType } from '../StatusModal';

export interface PaymentPostingProp {
  claimID: number;
  groupID?: number;
  patientID?: number;
  chargeId?: number;
  onClose: (isAction?: string) => void;
  patientPosting?: boolean;
  selectedBatchID?: number;
  chargeRowID?: number;
}
export default function PaymentPosting({
  claimID,
  groupID,
  onClose,
  patientID,
  chargeId,
  patientPosting,
  selectedBatchID,
  chargeRowID,
}: PaymentPostingProp) {
  const dispatch = useDispatch();
  const [addPaymentBatch, setAddPaymentBatch] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState<{
    show: boolean;
    showCloseButton?: boolean;
    heading: string;
    text: string;
    type: StatusModalType;
    okButtonText?: string;
    okButtonColor?: ButtonType;
  }>();
  const [changeModalState, setChangeModalState] = useState<{
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
  const [claimDos, setClaimDos] = useState<string | null>(null);
  const [paymentFrom, setPaymentFrom] = useState('insurance');
  const [paymentData, setPaymentData] = useState<
    SaveInsurancePaymentCriteria[]
  >([]);
  const [refundInsData, setRefundInsData] = useState<
    SaveInsurancePaymentCriteria[]
  >([]);
  const [refundPatData, setRefundPatData] = useState<
    SavePatientPaymentCriteria[]
  >([]);
  const [refundData, setRefundData] = useState<PatientRefunds[]>([]);
  const [patientPaymentData, setPatientPaymentData] = useState<
    SavePatientPaymentCriteria[]
  >([]);
  const [chargesJsonData, setChargesJsonData] = useState<
    {
      data: SummaryBillingCharges;
      payment?: number;
      allowable?: number;
      advancedPayment?: number;
    }[]
  >([]);
  const [paymentDetailJson, setPaymentDetailJson] = useState<{
    paymentbatch?: SingleSelectDropDownDataType;
    paymentType?: SingleSelectDropDownDataType;
    paymentDate?: string;
    postingDate?: string;
    depositDate?: string;
    paymentNumber?: string;
    selectedPatientPosting?: SingleSelectDropDownDataType;
    patientPaymentFrom?: string;
    selectedRefundType?: SingleSelectDropDownDataType;
  }>();
  const [paymentBatchData, setPaymentBatchData] = useState<PaymentBatchData[]>(
    []
  );
  const lookupsData = useSelector(getLookupDropdownsDataSelector);
  const [patientAdvancePosting, setPatientAdvancePosting] =
    useState<ClaimAdvancePayment | null>();
  const selectPostPatientPaymentData = [
    { id: 1, value: 'From Unapplied Advanced Payments' },
    { id: 2, value: 'From New Payment' },
  ];
  const refundTypeData = [
    { id: 1, value: 'Insurance Refund' },
    { id: 2, value: 'Insurance Recoupment' },
    { id: 3, value: 'Patient Refund' },
  ];
  const [payor, setPayorData] = useState<SingleSelectDropDownDataType[]>([]);
  const getClaimPayorData = async () => {
    const res = await getClaimPayor(claimID);
    if (res) {
      setPayorData(res);
    }
  };
  const [isPaymentJsonChanged, SetPaymentJsonChanged] = useState(false);
  const handlePaymentJsonChange = (
    fieldName: string,
    value: any,
    check?: boolean
  ) => {
    if (
      fieldName === 'paymentDate' ||
      fieldName === 'postingDate' ||
      fieldName === 'depositDate'
    ) {
      setPaymentDetailJson((prevData) => {
        return {
          ...prevData,
          [fieldName]: DateToStringPipe(value, 1),
        };
      });
    } else {
      setPaymentDetailJson((prevData) => {
        return {
          ...prevData,
          [fieldName]: value,
        };
      });
    }
    if (!check) {
      SetPaymentJsonChanged(true);
    }
  };
  const getClaimData = async () => {
    const res = await getClaimDetailSummaryById(claimID);
    if (res) {
      setClaimDos(res.dos);
      setRefundData(
        res.charges.map((chargeRow: SummaryBillingCharges) => {
          return {
            id: chargeRow.chargeID,
            patientRefund: 0,
            patientRefundComments: '',
            refundGroupCode: '',
            refundReasonCode: '',
            refundRemarkCode: '',
          };
        })
      );
      const filteredCharges = res.charges.filter(
        (m) => m.chargeID === chargeRowID
      );
      const chargesToUse = filteredCharges.length
        ? filteredCharges
        : res.charges;
      setChargesJsonData(() => {
        return chargesToUse.map((chargeRow: SummaryBillingCharges) => {
          return {
            data: chargeRow,
            id: chargeRow.chargeID,
            payment: undefined,
            allowable: undefined,
            advancedPayment: undefined,
          };
        });
      });
    }
  };
  const getClaimAdvanceData = async () => {
    if (groupID) {
      const res = await getClaimAdvancePayment(claimID);
      if (res) {
        setPatientAdvancePosting(res);
        if (res.withDOSAmount <= 0) {
          handlePaymentJsonChange('patientPaymentFrom', 'withoutDos', true);
        } else {
          handlePaymentJsonChange('patientPaymentFrom', 'withDos', true);
        }
        handlePaymentJsonChange(
          'selectedPatientPosting',
          selectPostPatientPaymentData[1],
          true
        );
        // if (res.totalAmount <= 0) {
        //   handlePaymentJsonChange(
        //     'selectedPatientPosting',
        //     selectPostPatientPaymentData[1],
        //     true
        //   );
        // } else {
        //   handlePaymentJsonChange(
        //     'selectedPatientPosting',
        //     selectPostPatientPaymentData[0],
        //     true
        //   );
        // }
      }
    }
  };
  const getPaymentBatchData = async (value: string) => {
    if (groupID) {
      const res = await getPaymentBatchDropdownData(groupID, value);
      if (res) {
        const batchID =
          selectedBatchID || store.getState().shared.selectedPaymentBatchID;
        if (batchID) {
          const selectedBatch = res.filter((a) => a.id === batchID);
          if (
            selectedBatch &&
            selectedBatch[0]
            // selectedBatch[0].batchBalance > 0
          ) {
            handlePaymentJsonChange('paymentbatch', selectedBatch[0]);
            handlePaymentJsonChange(
              'postingDate',
              selectedBatch[0].postingDate
            );
            handlePaymentJsonChange(
              'depositDate',
              selectedBatch[0].depositDate
            );
            handlePaymentJsonChange(
              'paymentNumber',
              selectedBatch[0].checkNumber
            );
            handlePaymentJsonChange('paymentDate', selectedBatch[0].checkDate);
          }
        }
        setPaymentBatchData(res);
      }
    }
  };
  useEffect(() => {
    if (paymentBatchData.length === 1) {
      setPaymentDetailJson({
        ...paymentDetailJson,
        paymentbatch: paymentBatchData[0],
      });
    }
  }, [paymentBatchData]);
  useEffect(() => {
    getClaimAdvanceData();
    getClaimPayorData();
    getPaymentBatchData('');
    getClaimData();
    if (patientPosting) {
      setPaymentFrom('patient');
    }
    handlePaymentJsonChange('selectedRefundType', refundTypeData[0], true);
  }, []);
  const saveRefundData = (data: PatientRefunds, chargeID: number) => {
    if (paymentDetailJson?.selectedRefundType?.id !== 3) {
      setRefundInsData((prevData) => {
        if (prevData.some((item) => item.chargeID === chargeID)) {
          return prevData.map((item) => {
            if (item.chargeID === chargeID) {
              return {
                ...item,
                claimID,
                paymentTypeID: paymentDetailJson?.paymentType?.id || 0,
                batchID: paymentDetailJson?.paymentbatch?.id || 0,
                checkDate: paymentDetailJson?.paymentDate || null,
                postingDate: paymentDetailJson?.postingDate || null,
                depositDate: paymentDetailJson?.depositDate || null,
                checkNumber: paymentDetailJson?.paymentNumber || '',
                refunds: [
                  {
                    id: data.id,
                    insuranceRefund: data.patientRefund,
                    insuranceRefundComments: data.patientRefundComments,
                    refundGroupCode: data.refundGroupCode,
                    refundReasonCode: data.refundReasonCode,
                    refundRemarkCode: data.refundRemarkCode,
                  },
                ],
              };
            }
            return item;
          });
        }
        return [
          ...prevData,
          {
            claimID,
            chargeID,
            advancePayDOS: null,
            patientID: patientID || 0,
            paymentTypeID: paymentDetailJson?.paymentType?.id || 0,
            batchID: paymentDetailJson?.paymentbatch?.id || 0,
            checkDate: paymentDetailJson?.paymentDate || null,
            postingDate: paymentDetailJson?.postingDate || null,
            depositDate: paymentDetailJson?.depositDate || null,
            checkNumber: paymentDetailJson?.paymentNumber || '',
            refunds: [
              {
                id: data.id,
                insuranceRefund: data.patientRefund,
                insuranceRefundComments: data.patientRefundComments,
                refundGroupCode: data.refundGroupCode,
                refundReasonCode: data.refundReasonCode,
                refundRemarkCode: data.refundRemarkCode,
              },
            ],
            allowed: null,
            insurancePaid: null,
            insuranceComments: '',
            previousInsuranceAmount: false,
            secondaryInsuranceAmount: null,
            secondaryInsuranceID: null,
            crossover: false,
            adjustments: [],
            responsibility: [],
          },
        ];
      });
    } else {
      setRefundPatData((prevData) => {
        if (prevData.some((item) => item.chargeID === chargeID)) {
          return prevData.map((item) => {
            if (item.chargeID === chargeID) {
              return {
                ...item,
                claimID,
                paymentTypeID: paymentDetailJson?.paymentType?.id || 0,
                batchID: paymentDetailJson?.paymentbatch?.id || 0,
                checkDate: paymentDetailJson?.paymentDate || null,
                postingDate: paymentDetailJson?.postingDate || null,
                depositDate: paymentDetailJson?.depositDate || null,
                checkNumber: paymentDetailJson?.paymentNumber || '',
                refunds: [
                  {
                    id: data.id,
                    patientRefund: data.patientRefund,
                    patientRefundComments: data.patientRefundComments,
                    refundGroupCode: data.refundGroupCode,
                    refundReasonCode: data.refundReasonCode,
                    refundRemarkCode: data.refundRemarkCode,
                  },
                ],
              };
            }
            return item;
          });
        }
        return [
          ...prevData,
          {
            claimID,
            chargeID,
            advancePayDOS: null,
            patientID: patientID || 0,
            paymentTypeID: paymentDetailJson?.paymentType?.id || 0,
            batchID: paymentDetailJson?.paymentbatch?.id || 0,
            checkDate: paymentDetailJson?.paymentDate || null,
            postingDate: paymentDetailJson?.postingDate || null,
            depositDate: paymentDetailJson?.depositDate || null,
            checkNumber: paymentDetailJson?.paymentNumber || '',
            patientPaid: null,
            patientAdvanceCopayment: null,
            patientPaidComments: '',
            patientAdvanceCopaymentComments: '',
            discountComment: '',
            responsibilityComments: '',
            patientDiscount: null,
            patientBadDebt: null,
            insuranceResponsibility: null,
            refunds: [
              {
                id: data.id,
                patientRefund: data.patientRefund,
                patientRefundComments: data.patientRefundComments,
                refundGroupCode: data.refundGroupCode,
                refundReasonCode: data.refundReasonCode,
                refundRemarkCode: data.refundRemarkCode,
              },
            ],
          },
        ];
      });
    }
  };
  useEffect(() => {
    if (
      paymentFrom === 'patient' &&
      paymentDetailJson?.selectedPatientPosting?.id === 1
    ) {
      handlePaymentJsonChange(
        'paymentType',
        {
          id: 5,
          value: 'Advance Credit',
        },
        true
      );
    } else if (paymentDetailJson?.paymentType?.id === 5) {
      handlePaymentJsonChange('paymentType', null, true);
    }
  }, [paymentDetailJson?.selectedPatientPosting]);
  const handleFieldChange = (fieldName: string, value: any, id: number) => {
    setChargesJsonData((prevData) => {
      const newData = prevData.map((item) => {
        if (item.data.chargeID === id) {
          return {
            ...item,
            [fieldName]: value,
          };
        }
        return item;
      });
      return newData;
    });
    if (fieldName === 'advancedPayment') {
      setPatientPaymentData((prevData) => {
        const newData = prevData.map((item) => {
          if (item.chargeID === id) {
            return {
              ...item,
              patientPaid: value,
            };
          }
          return item;
        });
        return newData;
      });
    }
  };
  const [isInsuranceBalanceNeg, setInsuranceBalanceNeg] = useState(false);
  const [isPatientBalanceNeg, setPatientBalanceNeg] = useState(false);
  const expandedRowContent = (expandedRowParams: GridRowParams) => {
    const newData: SaveInsurancePaymentCriteria = {
      claimID,
      chargeID: Number(expandedRowParams.id),
      patientID: patientID || 0,
      paymentTypeID: paymentDetailJson?.paymentType?.id || 0,
      batchID: paymentDetailJson?.paymentbatch?.id || 0,
      checkDate: paymentDetailJson?.paymentDate || null,
      postingDate: paymentDetailJson?.postingDate || null,
      depositDate: paymentDetailJson?.depositDate || null,
      checkNumber: paymentDetailJson?.paymentNumber || '',
      allowed: expandedRowParams.row.allowable,
      insurancePaid: expandedRowParams.row.payment,
      insuranceComments: '',
      previousInsuranceAmount: false,
      secondaryInsuranceAmount: null,
      secondaryInsuranceID: null,
      crossover: false,
      adjustments: [],
      responsibility: [],
      refunds: [],
    };

    const newPatientData = {
      claimID,
      chargeID: Number(expandedRowParams.id),
      patientID: patientID || 0,
      paymentTypeID: paymentDetailJson?.paymentType?.id || 0,
      batchID: paymentDetailJson?.paymentbatch?.id || 0,
      checkDate: paymentDetailJson?.paymentDate || null,
      postingDate: paymentDetailJson?.postingDate || null,
      depositDate: paymentDetailJson?.depositDate || null,
      checkNumber: paymentDetailJson?.paymentNumber || '',
      patientPaid: expandedRowParams.row.advancedPayment,
      patientPaidComments: '',
      patientAdvanceCopayment: null,
      patientAdvanceCopaymentComments: '',
      patientDiscount: null,
      discountComment: '',
      insuranceResponsibility: null,
      responsibilityComments: '',
      patientRefund: null,
      patientRefundComments: '',
      advancePayDOS: null,
      patientBadDebt: null,
    };
    const refundDataObj = refundData.find(
      (f) => f.id === Number(expandedRowParams.id)
    );
    return (
      <div className="bg-gray-300 p-4">
        {refundDataObj && (
          <PaymentPostingExpandableRow
            onPatientPaymentChange={(data: SavePatientPaymentCriteria) => {
              setPatientPaymentData((prevData) => {
                if (prevData.some((item) => item.chargeID === data.chargeID)) {
                  return prevData.map((item) => {
                    if (item.chargeID === data.chargeID) {
                      return {
                        ...data,
                        paymentTypeID: paymentDetailJson?.paymentType?.id || 0,
                        batchID: paymentDetailJson?.paymentbatch?.id || 0,
                        checkDate: paymentDetailJson?.paymentDate || null,
                        postingDate: paymentDetailJson?.postingDate || null,
                        depositDate: paymentDetailJson?.depositDate || null,
                        checkNumber: paymentDetailJson?.paymentNumber || '',
                      };
                    }
                    return item;
                  });
                }
                return [...prevData, data];
              });
            }}
            selectedRefundTypeId={paymentDetailJson?.selectedRefundType?.id}
            reRenderPatientInsuranceBalance={JSON.stringify(chargesJsonData)}
            onChange={(data: SaveInsurancePaymentCriteria) => {
              setPaymentData((prevData) => {
                if (prevData.some((item) => item.chargeID === data.chargeID)) {
                  return prevData.map((item) => {
                    if (item.chargeID === data.chargeID) {
                      return {
                        ...data,
                        paymentTypeID: paymentDetailJson?.paymentType?.id || 0,
                        batchID: paymentDetailJson?.paymentbatch?.id || 0,
                        checkDate: paymentDetailJson?.paymentDate || null,
                        postingDate: paymentDetailJson?.postingDate || null,
                        depositDate: paymentDetailJson?.depositDate || null,
                        checkNumber: paymentDetailJson?.paymentNumber || '',
                      };
                    }
                    return item;
                  });
                }
                return [...prevData, data];
              });
            }}
            onRefundPaymentChange={(data: PatientRefunds) => {
              const refData = refundData.map((obj) => {
                if (obj.id === Number(data.id)) {
                  return {
                    ...obj,
                    patientRefund: data.patientRefund,
                    patientRefundComments: data.patientRefundComments,
                    refundGroupCode: data.refundGroupCode,
                    refundReasonCode: data.refundReasonCode,
                    refundRemarkCode: data.refundRemarkCode,
                  };
                }
                return obj;
              });
              setRefundData(refData);
              saveRefundData(data, Number(expandedRowParams.id));
            }}
            refundData={refundDataObj}
            claimID={claimID}
            chargeData={expandedRowParams.row}
            data={
              paymentData.filter(
                (a) => a.chargeID === expandedRowParams.id
              )[0] || newData
            }
            patientData={
              patientPaymentData.filter(
                (a) => a.chargeID === expandedRowParams.id
              )[0] || newPatientData
            }
            postingMethod={paymentDetailJson?.selectedPatientPosting}
            selectedPayment={paymentFrom}
            setInsuranceBalanceNeg={(value) => {
              setInsuranceBalanceNeg(value);
            }}
            setPatientBalanceNeg={(value) => {
              setPatientBalanceNeg(value);
            }}
          />
        )}
      </div>
    );
  };
  const [detailPanelExpandedRowIds, setDetailPanelExpandedRowIds] = useState<
    GridRowId[] | undefined
  >(chargeId ? [chargeId] : undefined);
  const handleDetailPanelExpandedRowIdsChange = useCallback(
    (newIds: GridRowId[]) => {
      setDetailPanelExpandedRowIds(newIds);
    },
    []
  );
  const columns: GridColDef[] = [
    {
      ...GRID_DETAIL_PANEL_TOGGLE_COL_DEF,
      renderCell: (params) => (
        <CustomDetailPanelToggle id={params.id} value={params.value} />
      ),
      minWidth: 50,
    },
    {
      field: 'chargeID',
      headerName: 'Charge ID',
      flex: 1,
      minWidth: 90,
      disableReorder: true,
      renderCell: (params) => {
        return <p>{`#${params.id}`}</p>;
      },
    },
    {
      field: 'cpt',
      headerName: 'CPT Code',
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <InputField
            placeholder="CPT Code"
            value={params.row?.data?.cpt || ''}
            disabled={true}
          />
        );
      },
    },
    {
      field: 'fromDOS',
      flex: 1,
      minWidth: 300,
      headerName: 'DoS',
      disableReorder: true,
      renderCell: (params) => {
        return (
          <>
            <div className="mr-2 mt-1">
              <AppDatePicker
                placeholderText="mm/dd/yyyy"
                cls="w-[133px]"
                disabled={true}
                onChange={() => {}}
                selected={params.row.data.fromDOS}
              />
            </div>
            <AppDatePicker
              placeholderText="mm/dd/yyyy"
              cls="w-[133px] mt-1"
              disabled={true}
              onChange={() => {}}
              selected={params.row.data.toDOS}
            />
          </>
        );
      },
    },
    {
      field: 'units',
      headerName: 'Units',
      flex: 1,
      minWidth: 90,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <InputField value={params.row.data.units || ''} disabled={true} />
        );
      },
    },
    {
      field: 'fee',
      headerName: 'Fee',
      flex: 1,
      minWidth: 160,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <InputField
            value={
              `$ ${
                params?.row?.data?.fee ? params.row.data.fee.toFixed(2) : '0.00'
              }` || ''
            }
            disabled={true}
          />
        );
      },
    },
    {
      field: paymentFrom === 'patient' ? 'patientAmount' : 'allowable',
      headerName: paymentFrom === 'patient' ? 'Pat. Resp.' : 'Allowable',
      flex: 1,
      minWidth: 160,
      disableReorder: true,
      renderCell: (params) => {
        if (paymentFrom === 'patient') {
          return (
            <InputField
              value={`$ ${
                params.row.data.patientAmount
                  ? params.row.data.patientAmount.toFixed(2)
                  : '0.00'
              }`}
              disabled={true}
            />
          );
        }
        return (
          <InputFieldAmount
            data-testid="allowable"
            disabled={false}
            showCurrencyName={false}
            value={
              paymentFrom === 'patient'
                ? params.row.data?.patientAmount?.toFixed(2)
                : params.row.allowable
            }
            onChange={(evt) => {
              const checkPaymentExist = paymentData.filter(
                (a) => a.chargeID === Number(params.id)
              );
              if (checkPaymentExist.length === 0) {
                const newData: SaveInsurancePaymentCriteria = {
                  claimID,
                  chargeID: Number(params.id),
                  patientID: patientID || 0,
                  paymentTypeID: paymentDetailJson?.paymentType?.id || 0,
                  batchID: paymentDetailJson?.paymentbatch?.id || 0,
                  checkDate: paymentDetailJson?.paymentDate || null,
                  postingDate: paymentDetailJson?.postingDate || null,
                  depositDate: paymentDetailJson?.depositDate || null,
                  checkNumber: paymentDetailJson?.paymentNumber || '',
                  allowed: Number(evt.target.value),
                  insurancePaid: null,
                  insuranceComments: '',
                  previousInsuranceAmount: false,
                  secondaryInsuranceAmount: null,
                  secondaryInsuranceID: null,
                  crossover: false,
                  adjustments: [],
                  responsibility: [],
                  refunds: [],
                };
                setPaymentData([...paymentData, newData]);
              }
              handleFieldChange(
                'allowable',
                evt.target.value,
                params.row.data.chargeID
              );
            }}
          />
        );
      },
    },
    {
      field: paymentFrom === 'insurance' ? 'payment' : 'advancedPayment',
      headerName: 'Payment',
      flex: 1,
      minWidth: 160,
      disableReorder: true,
      renderCell: (params) => {
        if (paymentFrom === 'insurance') {
          return (
            <InputFieldAmount
              data-testid="paymentInputFeild"
              disabled={false}
              showCurrencyName={false}
              value={params.row.payment}
              onChange={(e) => {
                const checkPaymentExist = paymentData.filter(
                  (a) => a.chargeID === Number(params.id)
                );
                if (checkPaymentExist.length === 0) {
                  const newData: SaveInsurancePaymentCriteria = {
                    claimID,
                    chargeID: Number(params.id),
                    patientID: patientID || 0,
                    paymentTypeID: paymentDetailJson?.paymentType?.id || 0,
                    batchID: paymentDetailJson?.paymentbatch?.id || 0,
                    checkDate: paymentDetailJson?.paymentDate || null,
                    postingDate: paymentDetailJson?.postingDate || null,
                    depositDate: paymentDetailJson?.depositDate || null,
                    checkNumber: paymentDetailJson?.paymentNumber || '',
                    allowed: null,
                    insurancePaid: Number(e.target.value),
                    insuranceComments: '',
                    previousInsuranceAmount: false,
                    secondaryInsuranceAmount: null,
                    secondaryInsuranceID: null,
                    crossover: false,
                    adjustments: [],
                    responsibility: [],
                    refunds: [],
                  };
                  setPaymentData([...paymentData, newData]);
                }
                handleFieldChange(
                  'payment',
                  e.target.value,
                  params.row.data.chargeID
                );
              }}
            />
          );
        }

        return (
          <InputFieldAmount
            data-testid="paymentPatientInputFeild"
            disabled={false}
            showCurrencyName={false}
            value={params.row.advancedPayment}
            onChange={(e) => {
              const checkPaymentExist = patientPaymentData.filter(
                (a) => a.chargeID === Number(params.id)
              );
              if (checkPaymentExist.length === 0) {
                const newPayment = {
                  claimID,
                  chargeID: Number(params.id),
                  patientID: patientID || 0,
                  paymentTypeID: paymentDetailJson?.paymentType?.id || 0,
                  batchID: paymentDetailJson?.paymentbatch?.id || 0,
                  checkDate: paymentDetailJson?.paymentDate || null,
                  postingDate: paymentDetailJson?.postingDate || null,
                  depositDate: paymentDetailJson?.depositDate || null,
                  checkNumber: paymentDetailJson?.paymentNumber || '',
                  patientPaid: Number(e.target.value),
                  patientPaidComments: '',
                  patientAdvanceCopayment: null,
                  patientAdvanceCopaymentComments: '',
                  patientDiscount: null,
                  discountComment: '',
                  insuranceResponsibility: null,
                  responsibilityComments: '',
                  patientRefund: null,
                  patientRefundComments: '',
                  advancePayDOS: null,
                  patientBadDebt: null,
                };
                setPatientPaymentData([...patientPaymentData, newPayment]);
              }

              handleFieldChange(
                'advancedPayment',
                e.target.value,
                params.row.data.chargeID
              );
            }}
          />
        );
      },
    },
  ];
  const refundColumns: GridColDef[] = [
    {
      ...GRID_DETAIL_PANEL_TOGGLE_COL_DEF,
      renderCell: (params) => (
        <CustomDetailPanelToggle id={params.id} value={params.value} />
      ),
      minWidth: 50,
    },
    {
      field: 'chargeID',
      headerName: 'Charge ID',
      flex: 1,
      minWidth: 90,
      disableReorder: true,
      renderCell: (params) => {
        return <p>{`#${params.id}`}</p>;
      },
    },
    {
      field: 'cptCode',
      headerName: 'CPT Code',
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <InputField
            placeholder="CPT Code"
            value={params.row.data.cptCode || ''}
            disabled={true}
          />
        );
      },
    },
    {
      field: 'fromDOS',
      flex: 1,
      minWidth: 300,
      headerName: 'DoS',
      disableReorder: true,
      renderCell: (params) => {
        return (
          <>
            <div className="mr-2 mt-1">
              <AppDatePicker
                placeholderText="mm/dd/yyyy"
                cls="w-[133px]"
                disabled={true}
                onChange={() => {}}
                selected={params.row.data.fromDOS}
              />
            </div>
            <AppDatePicker
              placeholderText="mm/dd/yyyy"
              cls="w-[133px] mt-1"
              disabled={true}
              onChange={() => {}}
              selected={params.row.data.toDOS}
            />
          </>
        );
      },
    },
    {
      field: 'units',
      headerName: 'Units',
      flex: 1,
      minWidth: 90,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <InputField value={params.row.data.units || ''} disabled={true} />
        );
      },
    },
    {
      field: 'fee',
      headerName: 'Fee',
      flex: 1,
      minWidth: 160,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <InputField
            value={`$ ${params.row.data?.fee?.toFixed(2)}` || ''}
            disabled={true}
          />
        );
      },
    },
    {
      field: 'refundAmount',
      headerName: 'Refund Amount*',
      flex: 1,
      minWidth: 160,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <InputFieldAmount
            key={params.id}
            data-testid="refund_amount"
            disabled={false}
            showCurrencyName={false}
            value={
              refundData.filter((f) => f.id === Number(params.id))[0]
                ?.patientRefund || ''
            }
            onChange={(e) => {
              const matchRefData = refundData.find(
                (f) => f.id === Number(params.id)
              );
              if (matchRefData) {
                const data = {
                  id: matchRefData.id,
                  patientRefund: e.target.value ? Number(e.target.value) : 0,
                  patientRefundComments: matchRefData.patientRefundComments,
                  refundGroupCode: matchRefData.refundGroupCode,
                  refundReasonCode: matchRefData.refundReasonCode,
                  refundRemarkCode: matchRefData.refundRemarkCode,
                };
                saveRefundData(data, Number(params.id));
              }
              const refData = refundData.map((obj) => {
                return {
                  ...obj,
                  patientRefund:
                    obj.id === Number(params.id)
                      ? Number(e.target.value) || 0
                      : obj.patientRefund,
                };
              });
              setRefundData(refData);
            }}
          />
        );
      },
    },
  ];
  const postingDateCriteria: PostingDateCriteria = {
    id: claimID,
    type: 'claim',
    postingDate: DateToStringPipe(paymentDetailJson?.postingDate, 1),
  };
  const savePayment = async () => {
    for (let i = 0; i < patientPaymentData.length; i += 1) {
      const patientPayment = patientPaymentData[i];
      const correspondingCharge =
        patientPayment &&
        chargesJsonData.find(
          (charge) => charge.data.chargeID === patientPayment.chargeID
        );
      // if (
      //   correspondingCharge &&
      //   patientPayment &&
      //   patientPayment.insuranceResponsibility !== null &&
      //   correspondingCharge.data.patientBalance !== null &&
      //   patientPayment.insuranceResponsibility >
      //     correspondingCharge.data.patientBalance
      // ) {
      //   dispatch(
      //     addToastNotification({
      //       id: uuidv4(),
      //       text: `Transfer Amount should be less than Patient Amount`,
      //       toastType: ToastType.ERROR,
      //     })
      //   );
      //   return;
      // }
      if (
        correspondingCharge &&
        patientPayment &&
        correspondingCharge.data.patientBalance === 0 &&
        paymentDetailJson?.selectedPatientPosting?.id === 1 &&
        (paymentDetailJson?.patientPaymentFrom === 'withDos' ||
          paymentDetailJson?.patientPaymentFrom === 'withoutDos')
      ) {
        setChangeModalState({
          ...changeModalState,
          open: true,
          heading: 'Unable to Post payment',
          statusModalType: StatusModalType.WARNING,
          description:
            'No available balance for the selected Date of Service (DOS). Please verify the patient balance and try again.',
        });
        return;
      }
    }
    if (
      paymentDetailJson &&
      (!paymentDetailJson?.paymentType?.id ||
        !paymentDetailJson?.paymentbatch?.id ||
        !paymentDetailJson?.paymentDate ||
        !paymentDetailJson?.postingDate ||
        !paymentDetailJson?.depositDate ||
        !paymentDetailJson?.paymentNumber)
    ) {
      setChangeModalState({
        ...changeModalState,
        open: true,
        heading: 'Alert',
        statusModalType: StatusModalType.WARNING,
        description:
          'This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.',
      });
      return;
    }
    const chargeStatusID = chargesJsonData.some(
      (m) => m.data.chargeStatusID === 10
    );
    if (chargeStatusID) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: `Charge status is void so we can't post payment.`,
          toastType: ToastType.ERROR,
        })
      );
      return;
    }
    const postingDateRes = await fetchPostingDate(postingDateCriteria);
    if (postingDateRes && postingDateRes.postingCheck === false) {
      setChangeModalState({
        ...changeModalState,
        open: true,
        heading: 'Error',
        description: `${postingDateRes.message}`,
        statusModalType: StatusModalType.ERROR,
      });
      return;
    }
    if (isInsuranceBalanceNeg && paymentFrom === 'insurance') {
      // setChangeModalState({
      //   ...changeModalState,
      //   open: true,
      //   heading: 'Error',
      //   statusModalType: StatusModalType.ERROR,
      //   description: 'Transfer Amount should be less than Insurance Balance.',
      // });
      // return;
    }
    if (isPatientBalanceNeg && paymentFrom === 'patient') {
      // setChangeModalState({
      //   ...changeModalState,
      //   open: true,
      //   heading: 'Error',
      //   statusModalType: StatusModalType.ERROR,
      //   description: 'Transfer Amount should be less than Patient Balance.',
      // });
      // return;
    }
    if (paymentFrom === 'refund') {
      if (paymentDetailJson?.selectedRefundType?.id === 3) {
        const updatedRefund = refundPatData.map((item) => ({
          ...item,
          paymentTypeID: paymentDetailJson?.paymentType?.id || 0,
          batchID: paymentDetailJson?.paymentbatch?.id || 0,
          checkDate: paymentDetailJson?.paymentDate || null,
          postingDate: paymentDetailJson?.postingDate || null,
          depositDate: paymentDetailJson?.depositDate || null,
          checkNumber: paymentDetailJson?.paymentNumber || '',
        }));
        const res = await savePatientPayment(updatedRefund);
        if (res) {
          onClose('isPost');
        } else {
          setChangeModalState({
            ...changeModalState,
            open: true,
            heading: 'Error',
            statusModalType: StatusModalType.ERROR,
            description:
              'A system error prevented the payment to be posted. Please try again.',
          });
        }
      } else if (payor.length > 0) {
        const updatedInsRefund = refundInsData.map((item) => ({
          ...item,
          paymentTypeID: paymentDetailJson?.paymentType?.id || 0,
          batchID: paymentDetailJson?.paymentbatch?.id || 0,
          checkDate: paymentDetailJson?.paymentDate || null,
          postingDate: paymentDetailJson?.postingDate || null,
          depositDate: paymentDetailJson?.depositDate || null,
          checkNumber: paymentDetailJson?.paymentNumber || '',
        }));
        const insRefundVal = updatedInsRefund.some((r) =>
          r.refunds.some((m) => m.insuranceRefund <= 0)
        );
        if (insRefundVal) {
          dispatch(
            addToastNotification({
              id: uuidv4(),
              text: `ERROR: We cannot reversal the refund payment.`,
              toastType: ToastType.ERROR,
            })
          );
          return;
        }
        const res = await saveInsPayment(updatedInsRefund);
        if (res) {
          onClose('isPost');
        } else {
          setChangeModalState({
            ...changeModalState,
            open: true,
            heading: 'Error',
            statusModalType: StatusModalType.ERROR,
            description:
              'A system error prevented the payment to be posted. Please try again.',
          });
        }
      } else {
        dispatch(
          addToastNotification({
            id: uuidv4(),
            text: 'No insurance attach with this claim.',
            toastType: ToastType.ERROR,
          })
        );
        return;
      }
    }
    if (paymentFrom === 'insurance') {
      paymentData.forEach((payment) => {
        const totalAdjustmentAmt = payment.adjustments.reduce((total, item) => {
          if (item.writeOff !== undefined && item.writeOff !== null) {
            return total + item.writeOff;
          }
          return total;
        }, 0);
        const totalResponsibilityAmt = payment.responsibility.reduce(
          (total, item) => {
            if (
              item.patientResponsibility !== undefined &&
              item.patientResponsibility !== null
            ) {
              return total + item.patientResponsibility;
            }
            return total;
          },
          0
        );
        const foundCharge = chargesJsonData.find(
          (d) => d.data.chargeID === payment.chargeID
        );
        if (foundCharge && foundCharge.allowable && foundCharge.payment) {
          const allowableAmt = foundCharge.data.fee - foundCharge.allowable;
          const paymentAmt = foundCharge.allowable - foundCharge.payment;
          if (
            allowableAmt &&
            totalAdjustmentAmt &&
            totalAdjustmentAmt > allowableAmt
          ) {
            dispatch(
              addToastNotification({
                id: uuidv4(),
                text: 'Adjustment amount should be less than insurance amount.',
                toastType: ToastType.ERROR,
              })
            );
            return;
          }
          if (
            paymentAmt &&
            totalResponsibilityAmt &&
            payment.secondaryInsuranceAmount &&
            totalResponsibilityAmt + payment.secondaryInsuranceAmount >
              paymentAmt
          ) {
            dispatch(
              addToastNotification({
                id: uuidv4(),
                text: 'Patient responsiblity amount should be less than insurance amount.',
                toastType: ToastType.ERROR,
              })
            );
          }
        }
        // payment.adjustments = payment.adjustments.filter((a) => {
        //   return a.writeOff !== null && a.writeOff !== undefined;
        // });
        // payment.responsibility = payment.responsibility.filter((r) => {
        //   return r.patientResponsibility !== null && r.patientResponsibility !== undefined;
        // });
        // payment.allowed = foundCharge?.allowable;
        // payment.insurancePaid = foundCharge?.payment;
      });
      const updatedPaymentData = paymentData.map((payment) => {
        const foundCharge = chargesJsonData.find(
          (d) => d.data.chargeID === payment.chargeID
        );

        // Create a new object with the updated properties
        const updatedPayment = {
          ...payment, // Copy all properties from the original payment
          allowed: foundCharge?.allowable,
          insurancePaid: foundCharge?.payment,
        };

        return updatedPayment; // Return the updated payment object.
      });
      const updatedIns = updatedPaymentData.map((item) => ({
        ...item,
        paymentTypeID: paymentDetailJson?.paymentType?.id || 0,
        batchID: paymentDetailJson?.paymentbatch?.id || 0,
        checkDate: paymentDetailJson?.paymentDate || null,
        postingDate: paymentDetailJson?.postingDate || null,
        depositDate: paymentDetailJson?.depositDate || null,
        checkNumber: paymentDetailJson?.paymentNumber || '',
      }));
      const res = await saveInsPayment(updatedIns);
      if (res) {
        onClose('isPost');
      } else {
        setChangeModalState({
          ...changeModalState,
          open: true,
          heading: 'Error',
          statusModalType: StatusModalType.ERROR,
          description:
            'A system error prevented the payment to be posted. Please try again.',
        });
      }
    }
    if (paymentFrom === 'patient') {
      if (
        paymentDetailJson?.selectedPatientPosting?.id === 1 &&
        paymentDetailJson?.patientPaymentFrom === 'withDos'
      ) {
        const patientPaidSum = patientPaymentData.reduce(
          (sum, payment) => sum + Number(payment.patientPaid),
          0
        );
        if (
          patientAdvancePosting &&
          patientPaidSum > patientAdvancePosting.withDOSAmount
        ) {
          dispatch(
            addToastNotification({
              id: uuidv4(),
              text: 'Payment amount should be less than With DoS amount.',
              toastType: ToastType.ERROR,
            })
          );
          return;
        }
      }
      if (
        paymentDetailJson?.selectedPatientPosting?.id === 1 &&
        paymentDetailJson?.patientPaymentFrom === 'withoutDos'
      ) {
        const patientPaidSum = patientPaymentData.reduce(
          (sum, payment) => sum + Number(payment.patientPaid),
          0
        );
        if (
          patientAdvancePosting &&
          patientPaidSum > patientAdvancePosting.withoutDOSAmount
        ) {
          dispatch(
            addToastNotification({
              id: uuidv4(),
              text: 'Payment amount should be less than Without DoS amount.',
              toastType: ToastType.ERROR,
            })
          );
          return;
        }
      }
      const updatedPatientPaymentData = patientPaymentData.map((item) => ({
        ...item,
        patientPaid:
          paymentDetailJson?.selectedPatientPosting?.id !== 1
            ? item.patientPaid
            : null,
        patientAdvanceCopayment:
          paymentDetailJson?.selectedPatientPosting?.id === 1
            ? item.patientPaid
            : null,
        advancePayDOS:
          paymentDetailJson?.selectedPatientPosting?.id === 1 &&
          paymentDetailJson &&
          paymentDetailJson.patientPaymentFrom === 'withDos'
            ? claimDos
            : null,
        paymentTypeID: paymentDetailJson?.paymentType?.id || 0,
        batchID: paymentDetailJson?.paymentbatch?.id || 0,
        checkDate: paymentDetailJson?.paymentDate || null,
        postingDate: paymentDetailJson?.postingDate || null,
        depositDate: paymentDetailJson?.depositDate || null,
        checkNumber: paymentDetailJson?.paymentNumber || '',
        badDebtComment:
          item.badDebtCode && item.badDebtComment
            ? `${item.badDebtCode}|${item.badDebtComment}`
            : item.badDebtComment || item.badDebtCode,
        discountComment:
          item.discountCode && item.discountComment
            ? `${item.discountCode}|${item.discountComment}`
            : item.discountCode || item.discountComment,
        patientAdvanceCopaymentComments:
          item.paymentCode && item.patientAdvanceCopaymentComments
            ? `${item.paymentCode}|${item.patientAdvanceCopaymentComments}`
            : item.paymentCode || item.patientAdvanceCopaymentComments,
        responsibilityComments:
          item.insCode && item.responsibilityComments
            ? `${item.insCode}|${item.responsibilityComments}`
            : item.insCode || item.responsibilityComments,
        patientPaidComments:
          item.paymentCode && item.patientPaidComments
            ? `${item.paymentCode}|${item.patientPaidComments}`
            : item.paymentCode || item.patientPaidComments,
      }));
      const res = await savePatientPayment(updatedPatientPaymentData);
      if (res) {
        onClose('isPost');
      } else {
        setChangeModalState({
          ...changeModalState,
          open: true,
          heading: 'Error',
          statusModalType: StatusModalType.ERROR,
          description:
            'A system error prevented the payment to be posted. Please try again.',
        });
      }
    }
  };
  return (
    <div className="flex h-full w-full flex-col items-center justify-start overflow-hidden rounded-lg bg-gray-100 shadow">
      <div className="flex w-full flex-col items-start justify-start px-6 py-4">
        <div className="inline-flex w-full items-center justify-between">
          <div className="flex items-center justify-start space-x-2">
            <p className="text-xl font-bold leading-7 text-cyan-600">
              Payment Posting - Claim #{claimID}
            </p>
          </div>
          <CloseButton
            onClick={() => {
              if (isPaymentJsonChanged) {
                setConfirmationModal({
                  show: true,
                  showCloseButton: true,
                  heading: 'Cancel Confirmation',
                  text: `Are you certain you want to cancel? Clicking "Confirm" will result in the loss of all changes.`,
                  type: StatusModalType.WARNING,
                  okButtonText: 'Confirm',
                  okButtonColor: ButtonType.primary,
                });
              } else {
                onClose();
              }
            }}
          />
        </div>
      </div>
      <div className={'w-full px-6'}>
        <div className={`h-[1px] w-full bg-gray-300`} />
      </div>
      <div className="m-0 h-full w-full overflow-y-auto bg-gray-100 p-0 !px-6">
        <div className="inline-flex w-full items-center justify-start space-x-4 pt-4">
          <p className="text-base font-bold leading-normal text-gray-700">
            Post Payment From:
          </p>
          <div className="inline-flex flex-col items-start justify-start space-y-1">
            <div className="inline-flex flex-1 items-center justify-start space-x-4">
              <RadioButton
                data={[
                  {
                    value: 'insurance',
                    label: 'Insurance',
                  },
                  { value: 'patient', label: 'Patient' },
                  { value: 'refund', label: 'Refund' },
                ]}
                checkedValue={paymentFrom}
                onChange={(e) => {
                  if (
                    e.target.value === 'patient' &&
                    paymentDetailJson?.selectedPatientPosting?.id === 1
                  ) {
                    handlePaymentJsonChange('paymentType', {
                      id: 5,
                      value: 'Advance Credit',
                    });
                  } else {
                    handlePaymentJsonChange('paymentType', null);
                  }
                  setPaymentFrom(e.target.value);
                }}
              />
            </div>
          </div>
        </div>
        <div className={'w-full py-4'}>
          <div className={`h-[1px] w-full bg-gray-300`} />
        </div>
        {paymentFrom === 'patient' && (
          <>
            <div className="inline-flex w-full flex-col items-start justify-start space-y-4">
              <p className="text-base font-bold leading-normal text-gray-700">
                Unapplied Advanced Payments Balance
              </p>
              <div className="inline-flex space-x-4 text-left">
                <div className="inline-flex w-40 flex-col  space-y-1 rounded-md border border-red-300 bg-red-50 px-4 py-2">
                  <p className="w-full text-sm font-bold leading-tight text-red-500">
                    With DoS
                  </p>
                  <p className="text-xl font-bold leading-7 text-red-500">
                    $
                    {patientAdvancePosting?.withDOSAmount?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div className="inline-flex w-40 flex-col  space-y-1 rounded-md border border-red-300 bg-red-50 px-4 py-2">
                  <p className="w-full text-sm font-bold leading-tight text-red-500">
                    Without DoS
                  </p>
                  <p className="text-xl font-bold leading-7 text-red-500">
                    $
                    {patientAdvancePosting?.withoutDOSAmount?.toFixed(2) ||
                      '0.00'}
                  </p>
                </div>
                <div className="inline-flex w-40 flex-col  space-y-1 rounded-md border border-red-300 bg-red-50 px-4 py-2">
                  <p className="w-full text-sm font-bold leading-tight text-red-500">
                    Total Unapplied
                  </p>
                  <p className="text-xl font-bold leading-7 text-red-500">
                    ${patientAdvancePosting?.totalAmount?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </div>
            <div className={'w-full py-4'}>
              <div className={`h-[1px] w-full bg-gray-300`} />
            </div>
          </>
        )}
        <div className="inline-flex w-full flex-col items-start justify-start space-y-4">
          <p className="text-base font-bold leading-normal text-gray-700">
            Payment Details
          </p>
          <div className="inline-flex w-full items-start justify-start space-x-6">
            {paymentFrom === 'refund' && (
              <div className="inline-flex w-60 flex-col items-start justify-start space-y-1">
                <p className="text-sm font-medium leading-tight">
                  Refund Type <span className="text-cyan-500">*</span>
                </p>
                <div data-testid="refundType" className="w-[240px]">
                  <SingleSelectGridDropDown
                    testId="refundDropdown"
                    placeholder=""
                    showSearchBar={true}
                    data={refundTypeData}
                    selectedValue={paymentDetailJson?.selectedRefundType}
                    onSelect={(e) => {
                      handlePaymentJsonChange('selectedRefundType', e);
                    }}
                  />
                </div>
              </div>
            )}
            {(paymentFrom === 'insurance' || paymentFrom === 'refund') && (
              <div className="inline-flex w-60 flex-col items-start justify-start space-y-1">
                <p className="text-sm font-medium leading-tight">Payor</p>
                <div className="w-[240px]">
                  <SingleSelectGridDropDown
                    placeholder=""
                    disabled={true}
                    showSearchBar={true}
                    data={payor}
                    selectedValue={payor[0]}
                    onSelect={() => {}}
                  />
                </div>
              </div>
            )}
            <div className="inline-flex w-60 flex-col items-start justify-start space-y-1">
              <p className="text-sm font-medium leading-tight">
                Payment Type <span className="text-cyan-500">*</span>
              </p>
              <div data-testid="paymentType" className="w-[240px]">
                <SingleSelectGridDropDown
                  placeholder=""
                  showSearchBar={true}
                  disabled={
                    !!(
                      paymentFrom === 'patient' &&
                      paymentDetailJson &&
                      paymentDetailJson.selectedPatientPosting &&
                      paymentDetailJson.selectedPatientPosting.id === 1
                    )
                  }
                  data={
                    (paymentFrom === 'patient' &&
                    paymentDetailJson &&
                    paymentDetailJson.selectedPatientPosting &&
                    paymentDetailJson.selectedPatientPosting.id === 1
                      ? [{ id: 5, value: 'Advance Credit' }]
                      : lookupsData?.method) || []
                  }
                  selectedValue={
                    paymentFrom === 'patient' &&
                    paymentDetailJson &&
                    paymentDetailJson.selectedPatientPosting &&
                    paymentDetailJson.selectedPatientPosting.id === 1
                      ? { id: 5, value: 'Advance Credit' }
                      : paymentDetailJson?.paymentType
                  }
                  onSelect={(e) => {
                    handlePaymentJsonChange('paymentType', e);
                  }}
                />
              </div>
            </div>
            <div className="inline-flex flex-col items-start justify-start space-y-1">
              <div className="inline-flex items-center justify-start space-x-2">
                <p className="text-sm font-medium leading-tight">
                  Payment Batch <span className="text-cyan-500">*</span>
                </p>
              </div>
              <div className="inline-flex items-center justify-start space-x-2">
                <div data-testid="paymentBatch" className="w-[240px]">
                  <SingleSelectGridDropDown
                    testId="paymentBatchDropdown"
                    placeholder=""
                    showSearchBar={true}
                    data={paymentBatchData || []}
                    selectedValue={paymentDetailJson?.paymentbatch}
                    onSelect={(e: any) => {
                      if (e) {
                        dispatch(setSelectedPaymentBatchID(e.id));
                        handlePaymentJsonChange('postingDate', e.postingDate);
                        handlePaymentJsonChange('depositDate', e.depositDate);
                        handlePaymentJsonChange('paymentNumber', e.checkNumber);
                        handlePaymentJsonChange('paymentDate', e.checkDate);
                        handlePaymentJsonChange('paymentbatch', e);
                      }
                    }}
                    searchOnCharacterLength={1}
                    onSearch={(value) => {
                      getPaymentBatchData(value);
                    }}
                  />
                </div>
                {/* <Button
                  buttonType={ButtonType.secondary}
                  onClick={() => { }}
                  cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                >
                  <Icon name={'search'} size={18} color={IconColors.GRAY} />
                </Button> */}
                <Button
                  buttonType={ButtonType.secondary}
                  onClick={() => {
                    setAddPaymentBatch(true);
                  }}
                  cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                >
                  <Icon name={'plus'} size={18} color={IconColors.GRAY_PLUS} />
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className={'w-full py-4'}>
          <div className={`h-[1px] w-full bg-gray-300`} />
        </div>
        <div className="inline-flex w-full flex-col items-start justify-start space-y-4">
          <p className="text-base font-bold leading-normal text-gray-700">
            Payment Dates
          </p>
          <div className="inline-flex w-full items-start justify-start space-x-6">
            <div className="inline-flex flex-col items-start justify-start space-y-1">
              <div className="inline-flex items-start justify-start space-x-1">
                <p className="mr-0.5 text-sm font-medium leading-tight">
                  Payment Date <span className="text-cyan-500">*</span>
                </p>
                <Icon name="questionMarkcircle" size={16} />
              </div>
              <AppDatePicker
                placeholderText="mm/dd/yyyy"
                cls="w-[180px]"
                onChange={(e) => {
                  handlePaymentJsonChange('paymentDate', e);
                }}
                selected={paymentDetailJson?.paymentDate}
              />
            </div>
            <div className="inline-flex flex-col items-start justify-start space-y-1">
              <div className="inline-flex items-start justify-start space-x-1">
                <p className="mr-0.5 text-sm font-medium leading-tight">
                  Posting Date <span className="text-cyan-500">*</span>
                </p>
                <Icon name="questionMarkcircle" size={16} />
              </div>
              <AppDatePicker
                testId="posting_date_testid"
                placeholderText="mm/dd/yyyy"
                cls="w-[180px]"
                onChange={(e) => {
                  handlePaymentJsonChange('postingDate', e);
                }}
                selected={paymentDetailJson?.postingDate}
              />
            </div>
            <div className="inline-flex flex-col items-start justify-start space-y-1">
              <div className="inline-flex items-start justify-start space-x-1">
                <p className="mr-0.5 text-sm font-medium leading-tight">
                  Deposit Date <span className="text-cyan-500">*</span>
                </p>
                <Icon name="questionMarkcircle" size={16} />
              </div>
              <AppDatePicker
                placeholderText="mm/dd/yyyy"
                cls="w-[180px]"
                onChange={(e) => {
                  handlePaymentJsonChange('depositDate', e);
                }}
                selected={paymentDetailJson?.depositDate}
              />
            </div>
            <div className="inline-flex w-72 flex-col items-start justify-start space-y-1">
              <p className="text-sm font-medium leading-tight">
                Payment Number <span className="text-cyan-500">*</span>
              </p>
              <InputField
                placeholder=""
                onChange={(e) => {
                  handlePaymentJsonChange('paymentNumber', e.target.value);
                }}
                value={paymentDetailJson?.paymentNumber}
              />
            </div>
          </div>
        </div>
        <div className={'w-full py-4'}>
          <div className={`h-[1px] w-full bg-gray-300`} />
        </div>
        <div className="inline-flex w-full flex-col items-start justify-start py-4">
          <div className="flex flex-col items-start justify-start space-y-4 pb-4">
            {paymentFrom === 'insurance' && (
              <p className="text-base font-bold leading-normal text-gray-700">
                Insurance Payment Details
              </p>
            )}
            {paymentFrom === 'patient' && (
              <div className="inline-flex items-center">
                <p className="text-base font-bold  leading-normal text-gray-700">
                  Post Patient Payment:
                </p>
                <div
                  data-testid="post_patient_payment"
                  className="ml-2 w-[288px]"
                >
                  <SingleSelectGridDropDown
                    placeholder=""
                    showSearchBar={true}
                    data={selectPostPatientPaymentData}
                    selectedValue={
                      paymentDetailJson?.selectedPatientPosting || undefined
                    }
                    onSelect={(e) => {
                      handlePaymentJsonChange('selectedPatientPosting', e);
                    }}
                  />
                </div>
                <div
                  data-testid="radiopost"
                  className="ml-6 inline-flex flex-1 items-center justify-start space-x-4"
                >
                  {paymentDetailJson?.selectedPatientPosting?.id !== 2 && (
                    <RadioButton
                      data={[
                        {
                          value: 'withDos',
                          label: 'Using With DoS Balance',
                        },
                        {
                          value: 'withoutDos',
                          label: 'Using Without DoS Balance',
                        },
                      ]}
                      checkedValue={paymentDetailJson?.patientPaymentFrom}
                      onChange={(e) => {
                        handlePaymentJsonChange(
                          'patientPaymentFrom',
                          e.target.value
                        );
                      }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
          <SearchDetailGrid
            hideHeader={true}
            hideFooter={true}
            checkboxSelection={false}
            rows={chargesJsonData}
            columns={paymentFrom === 'refund' ? refundColumns : columns}
            onDetailPanelExpandedRowIdsChange={
              handleDetailPanelExpandedRowIdsChange
            }
            detailPanelExpandedRowIds={detailPanelExpandedRowIds}
            expandedRowContent={expandedRowContent}
          />
        </div>
      </div>
      <div className="flex w-full items-center justify-center rounded-b-lg bg-gray-200 py-6">
        <div className="flex w-full items-center justify-end space-x-4 px-7">
          <Button
            buttonType={ButtonType.secondary}
            cls={`inline-flex px-4 py-2 gap-2 leading-5`}
            onClick={() => {
              if (isPaymentJsonChanged) {
                setConfirmationModal({
                  show: true,
                  showCloseButton: true,
                  heading: 'Cancel Confirmation',
                  text: `Are you sure you want to cancel creating this batch? Clicking "Confirm" will result in the loss of all changes.`,
                  type: StatusModalType.WARNING,
                  okButtonText: 'Confirm',
                  okButtonColor: ButtonType.primary,
                });
              } else {
                onClose();
              }
            }}
          >
            <p className="text-sm font-medium leading-tight text-gray-700">
              Cancel
            </p>
          </Button>
          <Button
            buttonType={ButtonType.primary}
            cls={`inline-flex px-4 py-2 gap-2 leading-5`}
            onClick={() => {
              savePayment();
            }}
          >
            <p
              data-testid="postPayment"
              className="text-sm font-medium leading-tight"
            >
              Post Payment
            </p>
          </Button>
        </div>
        <StatusModal
          open={changeModalState.open}
          heading={changeModalState.heading}
          description={changeModalState.description}
          closeButtonText={'Ok'}
          statusModalType={changeModalState.statusModalType}
          showCloseButton={false}
          closeOnClickOutside={false}
          onChange={() => {
            setChangeModalState({
              ...changeModalState,
              open: false,
            });
          }}
        />
        <AddPaymentBatch
          open={addPaymentBatch}
          onClose={() => {
            setAddPaymentBatch(false);
          }}
          onCreateBatch={(value) => {
            if (value) {
              getPaymentBatchData(value.toString());
            }
          }}
          batchId={undefined}
        />
        <StatusModal
          open={!!confirmationModal?.show}
          heading={confirmationModal?.heading}
          description={confirmationModal?.text}
          statusModalType={confirmationModal?.type}
          showCloseButton={confirmationModal?.showCloseButton}
          okButtonText={confirmationModal?.okButtonText}
          okButtonColor={confirmationModal?.okButtonColor}
          closeOnClickOutside={true}
          onChange={() => {
            onClose();
          }}
          onClose={() => {
            setConfirmationModal(undefined);
          }}
        />
      </div>
      <StatusModal
        open={changeModalState.open}
        heading={changeModalState.heading}
        description={changeModalState.description}
        closeButtonText={'Ok'}
        statusModalType={changeModalState.statusModalType}
        showCloseButton={false}
        closeOnClickOutside={false}
        onChange={() => {
          setChangeModalState({
            ...changeModalState,
            open: false,
          });
        }}
      />
      {/* <AddPaymentBatch
        open={addPaymentBatch}
        onClose={() => {
          setAddPaymentBatch(false);
        }}
        onCreateBatch={(value) => {

        }}
        batchId={undefined}
      /> */}
    </div>
  );
}
