/* eslint-disable no-unsafe-optional-chaining */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { MultiValue } from 'react-select';
import { v4 as uuidv4 } from 'uuid';

import Icon from '@/components/Icon';
import { addToastNotification } from '@/store/shared/actions';
import {
  getClaimTransferInsurance,
  getReasonCode,
  getRemarkCode,
} from '@/store/shared/sagas';
import { getLookupDropdownsDataSelector } from '@/store/shared/selectors';
import type {
  InsurancePatientAdjustments,
  InsurancePatientResponsibilities,
  PatientRefunds,
  ReasonCodeType,
  SaveInsurancePaymentCriteria,
  SavePatientPaymentCriteria,
} from '@/store/shared/types';
import { ToastType } from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';

import Button, { ButtonType } from '../Button';
import InputField from '../InputField';
import InputFieldAmount from '../InputFieldAmount';
import type { MultiSelectGridDropdownDataType } from '../MultiSelectGridDropdown';
import MultiSelectGridDropdown from '../MultiSelectGridDropdown';
import type { SingleSelectDropDownDataType } from '../SingleSelectDropDown';
import SingleSelectGridDropDown from '../SingleSelectGridDropdown';

export interface PaymentPostingExpandableRowProps {
  selectedPayment: string;
  chargeData: any;
  claimID: number;
  data: SaveInsurancePaymentCriteria;
  patientData: SavePatientPaymentCriteria;
  refundData: PatientRefunds;
  onChange: (data: SaveInsurancePaymentCriteria) => void;
  onPatientPaymentChange: (data: SavePatientPaymentCriteria) => void;
  onRefundPaymentChange: (data: PatientRefunds) => void;
  postingMethod?: SingleSelectDropDownDataType;
  selectedRefundTypeId?: number;
  reRenderPatientInsuranceBalance?: string;
  setInsuranceBalanceNeg: (value: number) => void;
  setPatientBalanceNeg: (value: number) => void;
}
export default function PaymentPostingExpandableRow({
  selectedPayment,
  chargeData,
  claimID,
  onChange,
  onPatientPaymentChange,
  patientData,
  refundData,
  onRefundPaymentChange,
  postingMethod,
  data,
  selectedRefundTypeId,
  reRenderPatientInsuranceBalance,
  setInsuranceBalanceNeg,
}: // setPatientBalanceNeg,
PaymentPostingExpandableRowProps) {
  const [newJsonData, setNewJsonData] =
    useState<SaveInsurancePaymentCriteria>(data);
  const [newPatientJsonData, setNewPatientJsonData] =
    useState<SavePatientPaymentCriteria>(patientData);
  const [newRefundJson, setNewRefundJson] =
    useState<PatientRefunds>(refundData);
  const [insAdjustmentsData, setInsAdjustmentsData] = useState<
    InsurancePatientAdjustments[]
  >([
    {
      writeOff: 0,
      writeOffComments: '',
      writeOffReason: '',
      writeOffGroupCode: '',
      writeOffReasonCode: '',
      writeOffRemarkCode: '',
    },
  ]);
  const [insPatientResposibilityData, setPatientInsResponsibilityData] =
    useState<InsurancePatientResponsibilities[]>([
      {
        patientResponsibility: 0,
        responsibilityComments: '',
        patientResponsibilityReason: '',
        responsibilityGroupCode: '',
        responsibilityReasonCode: '',
        responsibilityRemarkCode: '',
      },
    ]);
  const handleInputChange = (
    index: number,
    field: keyof InsurancePatientResponsibilities,
    value: any
  ) => {
    const updatedFields = [...insPatientResposibilityData];
    if (index >= 0 && index < updatedFields.length) {
      const item = updatedFields[index];
      if (item) {
        // Using a type assertion to bypass the 'never' type issue
        (item as any)[field] = value;
        setPatientInsResponsibilityData(updatedFields);
      }
    }

    const updatedNewJsonData = {
      ...newJsonData,
      responsibility: updatedFields,
    };

    setNewJsonData(updatedNewJsonData);
    onChange(updatedNewJsonData);
  };
  const dispatch = useDispatch();
  const [reasonCodeData, setReasonCodeData] = useState<ReasonCodeType[]>([]);
  const [remarkCodeData, setRemarkCodeData] = useState<ReasonCodeType[]>([]);
  const [tranferToData, setTranferToData] = useState<
    SingleSelectDropDownDataType[]
  >([]);
  const lookupsData = useSelector(getLookupDropdownsDataSelector);
  const handleAdjustmentInputChange = (
    index: number,
    field: keyof InsurancePatientAdjustments,
    value: any
  ) => {
    // let allowAddAmuont = true;
    // if (chargeData.allowable && balanceInfo.insuranceBalance?.current) {
    //   const sum = newJsonData.adjustments.reduce((total, item) => {
    //     if (item.writeOff !== undefined && item.writeOff !== null) {
    //       return total + item.writeOff;
    //     }
    //     return total;
    //   }, 0);
    //   const writeOffAmt =
    //     balanceInfo.insuranceBalance?.current - chargeData.allowable;
    //   allowAddAmuont = !(Number(sum) + Number(value) > Number(writeOffAmt));
    // }
    // if (!allowAddAmuont) {
    //   dispatch(
    //     addToastNotification({
    //       id: uuidv4(),
    //       text: 'Adjustment amount should be less than insurance amount.',
    //       toastType: ToastType.ERROR,
    //     })
    //   );
    // }
    const updatedFields = [...insAdjustmentsData];
    if (index >= 0 && index < updatedFields.length) {
      const item = updatedFields[index];
      if (item) {
        // Using a type assertion to bypass the 'never' type issue
        (item as any)[field] = value;
        setInsAdjustmentsData(updatedFields);
      }
    }

    const updatedNewJsonData = {
      ...newJsonData,
      adjustments: updatedFields,
    };

    setNewJsonData(updatedNewJsonData);
    onChange(updatedNewJsonData);
  };
  const [balanceInfo, setBalanceInfo] = useState<{
    patientBalance?: {
      current?: number;
      afterPayment?: number;
    };
    insuranceBalance?: {
      current?: number;
      afterPayment?: number;
    };
    totalChargeBalance?: {
      current?: number;
      afterPayment?: number;
    };
  }>({
    patientBalance: {
      current: chargeData.data.patientBalance,
      afterPayment: chargeData.data.patientBalance,
    },
    insuranceBalance: {
      current: chargeData.data.insuranceBalance,
      afterPayment: chargeData.data.insuranceBalance,
    },
    totalChargeBalance: {
      current:
        chargeData.data.patientBalance + chargeData.data.insuranceBalance,
      afterPayment:
        chargeData.data.patientBalance + chargeData.data.insuranceBalance,
    },
  });
  useEffect(() => {
    if (
      chargeData.allowable &&
      chargeData.payment
      // &&
      // insPatientResposibilityData.length === 1
    ) {
      const amount =
        (Number(chargeData.allowable) || 0) - (Number(chargeData.payment) || 0);
      handleInputChange(0, 'patientResponsibility', amount);
      const adjAmount = // 55; // when you add any payment
        balanceInfo.insuranceBalance?.current && chargeData.allowable
          ? (
              (Number(balanceInfo.insuranceBalance?.current) || 0) -
              (Number(chargeData.allowable) || 0)
            ).toString()
          : '';
      handleAdjustmentInputChange(0, 'writeOff', adjAmount);
    }
  }, [chargeData.allowable, chargeData.payment]);
  const addInsAdjRow = () => {
    setInsAdjustmentsData([
      ...insAdjustmentsData,
      {
        writeOff: 0,
        writeOffComments: '',
        writeOffReason: '',
        writeOffGroupCode:
          lookupsData?.groupCode.filter((a) => a.id === 1)[0]?.code || '',
        writeOffReasonCode:
          reasonCodeData.filter((m) => m.id === 173)[0]?.code || '',
        writeOffRemarkCode: '',
      },
    ]);
  };

  // useEffect(() => {
  //   debugger;
  //   if (
  //     balanceInfo.patientBalance?.afterPayment &&
  //     Number(balanceInfo?.insuranceBalance?.afterPayment?.toFixed(2) || 0) < 0
  //   ) {
  //     setInsuranceBalanceNeg(true);
  //   } else {
  //     setInsuranceBalanceNeg(false);
  //   }
  // }, [balanceInfo.patientBalance?.afterPayment]);
  const addPatInsRow = () => {
    // let allowAddAmuont = true;
    // if (chargeData.allowable && chargeData.payment) {
    //   const sum = insPatientResposibilityData.reduce((total, item) => {
    //     if (item.patientResponsibility) {
    //       return total + item.patientResponsibility;
    //     }
    //     return total;
    //   }, 0);
    //   const respAmount =
    //     Number(chargeData.allowable) - Number(chargeData.payment);
    //   allowAddAmuont = !(
    //     Number(sum) + Number(newJsonData.secondaryInsuranceAmount) >
    //     respAmount
    //   );
    // }
    // if (!allowAddAmuont) {
    //   dispatch(
    //     addToastNotification({
    //       id: uuidv4(),
    //       text: 'Adjustment amount should be less than insurance amount.',
    //       toastType: ToastType.ERROR,
    //     })
    //   );
    //   return;
    // }
    setPatientInsResponsibilityData([
      ...insPatientResposibilityData,
      {
        patientResponsibility: 0,
        responsibilityComments: '',
        patientResponsibilityReason: '',
        responsibilityGroupCode: '',
        responsibilityReasonCode: '',
        responsibilityRemarkCode: '',
      },
    ]);
  };
  const isChangeValue = (cc: SaveInsurancePaymentCriteria) => {
    let newData = cc;
    if (
      cc.secondaryInsuranceAmount &&
      tranferToData.length &&
      tranferToData[0]
    ) {
      newData = {
        ...newData,
        secondaryInsuranceID: tranferToData[0]?.id,
      };
    }
    setNewJsonData({ ...newJsonData, ...newData });
    onChange({ ...newJsonData, ...newData });
  };
  const isPatientValueChange = (cc: SavePatientPaymentCriteria) => {
    setNewPatientJsonData({ ...newPatientJsonData, ...cc });
    onPatientPaymentChange({ ...newPatientJsonData, ...cc });
  };
  const isRefundValueChange = (cc: PatientRefunds) => {
    setNewRefundJson({ ...newRefundJson, ...cc });
    onRefundPaymentChange({ ...newRefundJson, ...cc });
  };
  const totalBalanceColor = (balance: number) => {
    if (balance === 0) {
      return 'bg-green-50 border-green-300';
    }
    if (balance > 0) {
      return 'bg-red-50 border-red-300';
    }
    return 'bg-yellow-50 border-yellow-300';
  };
  const chargeAmountColor = (chargeValue: number) => {
    if (chargeValue === 0) {
      return 'text-green-500';
    }
    if (chargeValue > 0) {
      return 'text-red-500';
    }
    return 'text-yellow-500';
  };

  const [adjRefundRemarkCode, setAdjRefundRemarkCode] = useState<
    MultiValue<MultiSelectGridDropdownDataType>
  >([]);

  const getClaimTransferInsuranceData = async () => {
    const res = await getClaimTransferInsurance(claimID);
    if (res) {
      setTranferToData(res);
    }
  };
  const getReasonCodeData = async (value: string) => {
    const res = await getReasonCode(value);
    if (res) {
      setReasonCodeData(res);
    }
  };
  useEffect(() => {
    if (reasonCodeData && lookupsData?.groupCode) {
      setInsAdjustmentsData([
        {
          writeOff: 0,
          writeOffComments: '',
          writeOffReason: '',
          writeOffReasonCode:
            reasonCodeData.filter((m) => m.id === 173)[0]?.code || '',
          writeOffRemarkCode: '',
          writeOffGroupCode:
            lookupsData.groupCode.filter((a) => a.id === 1)[0]?.code || '',
        },
      ]);
    }
  }, [reasonCodeData, lookupsData]);
  const getRemarkCodeData = async (value: string) => {
    const res = await getRemarkCode(value);
    if (res) {
      setRemarkCodeData(res);
    }
  };

  useEffect(() => {
    if (selectedPayment === 'patient') {
      setBalanceInfo(() => {
        const advancedPayment = chargeData.advancedPayment || 0;
        const patientDiscount = newPatientJsonData.patientDiscount || 0;
        const patientBadDebt = newPatientJsonData.patientBadDebt || 0;
        const insuranceResponsibility =
          newPatientJsonData.insuranceResponsibility || 0;

        const patientBalanceCurrent = chargeData.data.patientBalance || 0;
        const patientBalanceAfterPayment =
          patientBalanceCurrent -
          advancedPayment -
          patientDiscount -
          patientBadDebt -
          insuranceResponsibility;
        const insuranceBalanceCurrent = chargeData.data.insuranceBalance || 0;
        const insuranceBalanceAfterPayment =
          insuranceBalanceCurrent + insuranceResponsibility;
        // setPatientBalanceNeg(patientBalanceAfterPayment < 0);
        return {
          patientBalance: {
            current: patientBalanceCurrent,
            afterPayment: patientBalanceAfterPayment,
          },
          insuranceBalance: {
            current: insuranceBalanceCurrent,
            afterPayment: insuranceBalanceAfterPayment,
          },
          totalChargeBalance: {
            current: patientBalanceCurrent + insuranceBalanceCurrent,
            afterPayment:
              patientBalanceAfterPayment + insuranceBalanceAfterPayment,
          },
        };
      });
    }
  }, [newPatientJsonData, chargeData, selectedPayment]);

  useEffect(() => {
    if (selectedPayment === 'refund') {
      setBalanceInfo(() => {
        const refundAmount = refundData.patientRefund || 0;

        const patientBalanceCurrent = chargeData.data.patientBalance || 0;
        const patientBalanceAfterPayment =
          patientBalanceCurrent +
          (selectedRefundTypeId === 3 ? refundAmount : 0);
        const insuranceBalanceCurrent = chargeData.data.insuranceBalance || 0;
        const insuranceBalanceAfterPayment =
          insuranceBalanceCurrent +
          (selectedRefundTypeId !== 3 ? refundAmount : 0);

        return {
          patientBalance: {
            current: patientBalanceCurrent,
            afterPayment: patientBalanceAfterPayment,
          },
          insuranceBalance: {
            current: insuranceBalanceCurrent,
            afterPayment: insuranceBalanceAfterPayment,
          },
          totalChargeBalance: {
            current: patientBalanceCurrent + insuranceBalanceCurrent,
            afterPayment:
              patientBalanceAfterPayment + insuranceBalanceAfterPayment,
          },
        };
      });
      setNewRefundJson(refundData);
    }
  }, [
    refundData.patientRefund,
    selectedRefundTypeId,
    refundData,
    selectedPayment,
  ]);

  useEffect(() => {
    getClaimTransferInsuranceData();
    getReasonCodeData('');
  }, []);
  useEffect(() => {
    if (selectedPayment === 'insurance') {
      const adjustmentSum = newJsonData.adjustments.reduce((total, item) => {
        if (item.writeOff !== undefined && item.writeOff !== null) {
          return total + item.writeOff;
        }
        return total;
      }, 0);
      const responsibilitySum = newJsonData.responsibility.reduce(
        (total, item) => {
          if (item.patientResponsibility) {
            return total + item.patientResponsibility;
          }
          return total;
        },
        0
      );
      const patInsValue =
        balanceInfo.insuranceBalance?.current !== undefined &&
        balanceInfo.insuranceBalance?.current !== null
          ? balanceInfo.insuranceBalance?.current -
            adjustmentSum -
            responsibilitySum -
            (newJsonData.secondaryInsuranceAmount ?? 0) -
            (chargeData.payment ?? 0)
          : -adjustmentSum;
      setInsuranceBalanceNeg(balanceInfo.insuranceBalance?.current || 0);
      const patValue =
        balanceInfo.patientBalance?.current !== undefined
          ? balanceInfo.patientBalance?.current + responsibilitySum
          : -responsibilitySum;

      const remaingBlnc =
        balanceInfo?.insuranceBalance &&
        balanceInfo.insuranceBalance?.afterPayment
          ? patValue + patInsValue
          : patValue;
      setBalanceInfo((prevData) => ({
        ...prevData,
        insuranceBalance: {
          ...prevData.insuranceBalance,
          afterPayment: patInsValue,
        },
        patientBalance: {
          ...prevData.patientBalance,
          afterPayment: patValue,
        },
        totalChargeBalance: {
          ...prevData.totalChargeBalance,
          afterPayment: remaingBlnc,
        },
      }));
    }
  }, [
    newJsonData.responsibility,
    newJsonData.secondaryInsuranceAmount,
    selectedPayment,
    reRenderPatientInsuranceBalance,
  ]);

  useEffect(() => {
    if (selectedPayment === 'insurance') {
      const adjustmentSum = newJsonData.adjustments.reduce((total, item) => {
        if (item.writeOff !== undefined && item.writeOff !== null) {
          return total + item.writeOff;
        }
        return total;
      }, 0);
      const responsibilitySum = newJsonData.responsibility.reduce(
        (total, item) => {
          if (item.patientResponsibility) {
            return total + item.patientResponsibility;
          }
          return total;
        },
        0
      );
      const patValue =
        balanceInfo.insuranceBalance?.current !== undefined &&
        balanceInfo.insuranceBalance?.current !== null
          ? balanceInfo.insuranceBalance?.current -
            adjustmentSum -
            responsibilitySum -
            (newJsonData.secondaryInsuranceAmount ?? 0) -
            (chargeData.payment ?? 0)
          : -adjustmentSum;
      const remainingBlnc =
        patValue + (balanceInfo.patientBalance?.afterPayment || 0);

      setBalanceInfo((prevData) => ({
        ...prevData,
        insuranceBalance: {
          ...prevData.insuranceBalance,
          afterPayment: patValue,
        },
        totalChargeBalance: {
          ...prevData.totalChargeBalance,
          afterPayment: remainingBlnc,
        },
      }));
    }
  }, [
    newJsonData.adjustments,
    selectedPayment,
    reRenderPatientInsuranceBalance,
  ]);
  const getAddAdjustmentDetails = async (
    writeOffVal: string,
    patientResVal: string
  ) => {
    let secondaryInsRes: any = [];
    // let reasonCodeRes: any = [];
    // let groupCodeAdj: any = [];
    if (tranferToData.length > 0) {
      secondaryInsRes = tranferToData;
    } else {
      secondaryInsRes = await getClaimTransferInsurance(claimID);
    }
    // if (reasonCodeData.length <= 0) {
    //   reasonCodeRes = await getReasonCode('');
    // }
    // if (reasonCodeRes) {
    // const reasonCodeAdj = reasonCodeRes.filter((d: any) => d.id === 173)[0];
    // if (lookupsData?.groupCode) {
    //   // eslint-disable-next-line prefer-destructuring
    //   groupCodeAdj = lookupsData.groupCode.filter((a) => a.id === 1)[0];
    // }

    const adjustmentData: InsurancePatientAdjustments = {
      writeOff: Number(writeOffVal), // when user enters values before expanding
      writeOffComments: '',
      writeOffReason: '',
      writeOffGroupCode:
        lookupsData?.groupCode.filter((a) => a.id === 1)[0]?.code || '',
      writeOffReasonCode:
        reasonCodeData.filter((m) => m.id === 173)[0]?.code || '',
      writeOffRemarkCode: '',
    };
    const patientResData: InsurancePatientResponsibilities = {
      patientResponsibility: Number(patientResVal),
      responsibilityComments: '',
      patientResponsibilityReason: '',
      responsibilityGroupCode: '',
      responsibilityReasonCode: '',
      responsibilityRemarkCode: '',
    };
    if (
      chargeData.allowable &&
      chargeData.payment &&
      newJsonData.adjustments.length === 0 &&
      newJsonData.responsibility.length === 0
    ) {
      if (secondaryInsRes?.length > 0) {
        isChangeValue({
          ...newJsonData,
          secondaryInsuranceAmount:
            chargeData.allowable !== undefined &&
            chargeData.payment !== undefined
              ? chargeData.allowable - chargeData.payment
              : 0,
          allowed: chargeData.allowable,
          insurancePaid: chargeData.payment,
          adjustments: [...newJsonData.adjustments, adjustmentData],
        });
        setInsAdjustmentsData([
          {
            writeOff: 0,
            writeOffComments: '',
            writeOffReason: '',
            writeOffGroupCode:
              lookupsData?.groupCode.filter((a) => a.id === 1)[0]?.code || '',
            writeOffReasonCode:
              reasonCodeData.filter((m) => m.id === 173)[0]?.code || '',
            writeOffRemarkCode: '',
          },
        ]);
      } else {
        isChangeValue({
          ...newJsonData,
          allowed: chargeData.allowable,
          insurancePaid: chargeData.payment,
          responsibility: [...newJsonData.responsibility, patientResData],
          adjustments: [...newJsonData.adjustments, adjustmentData],
        });
        setPatientInsResponsibilityData([
          ...newJsonData.responsibility,
          patientResData,
        ]);

        setInsAdjustmentsData([
          {
            writeOff: 0,
            writeOffComments: '',
            writeOffReason: '',
            writeOffGroupCode:
              lookupsData?.groupCode.filter((a) => a.id === 1)[0]?.code || '',
            writeOffReasonCode:
              reasonCodeData.filter((m) => m.id === 173)[0]?.code || '',

            writeOffRemarkCode: '',
          },
        ]);
      }
    } else if (chargeData.allowable && newJsonData.adjustments.length === 0) {
      isChangeValue({
        ...newJsonData,
        allowed: chargeData.allowable,
        insurancePaid: chargeData.payment,
        adjustments: [...newJsonData.adjustments, adjustmentData],
      });
      setInsAdjustmentsData([
        {
          writeOff: 0,
          writeOffComments: '',
          writeOffReason: '',
          writeOffGroupCode:
            lookupsData?.groupCode.filter((a) => a.id === 1)[0]?.code || '',
          writeOffReasonCode:
            reasonCodeData.filter((m) => m.id === 173)[0]?.code || '',
          writeOffRemarkCode: '',
        },
      ]);
    } else if (chargeData.payment && newJsonData.responsibility.length === 0) {
      if (secondaryInsRes?.length > 0) {
        isChangeValue({
          ...newJsonData,
          secondaryInsuranceAmount:
            chargeData.allowable !== undefined &&
            chargeData.payment !== undefined
              ? chargeData.allowable - chargeData.payment
              : 0,
          allowed: chargeData.allowable,
          insurancePaid: chargeData.payment,
        });
      } else {
        isChangeValue({
          ...newJsonData,
          allowed: chargeData.allowable,
          insurancePaid: chargeData.payment,
          responsibility: [...newJsonData.responsibility, patientResData],
        });

        setPatientInsResponsibilityData([
          ...newJsonData.responsibility,
          patientResData,
        ]);
        // setPatientInsResponsibilityData([
        //   {
        //     patientResponsibility: 0,
        //     responsibilityComments: '',
        //     patientResponsibilityReason: '',
        //     responsibilityGroupCode: '',
        //     responsibilityReasonCode: '',
        //     responsibilityRemarkCode: '',
        //   },
        // ]);
        /// check this
      }
    }
    // }
  };

  const calculateSecondaryInsuranceAmount = () => {
    return chargeData.allowable !== undefined &&
      chargeData.payment !== undefined
      ? Number(chargeData.allowable || 0) - Number(chargeData.payment || 0)
      : 0;
  };

  const updateResponsibility = () => {
    const writeOffAmt = calculateSecondaryInsuranceAmount().toString();
    const updatedResponsibility = [...newJsonData.responsibility];
    if (updatedResponsibility[0]?.patientResponsibility !== undefined) {
      updatedResponsibility[0].patientResponsibility = Number(writeOffAmt);
      isChangeValue({
        ...newJsonData,
        responsibility: updatedResponsibility,
      });
      setPatientInsResponsibilityData(updatedResponsibility);
    }
  };

  const setAdjustmentData = () => {
    const writeOff =
      Number(balanceInfo?.insuranceBalance?.current || 0) -
      Number(chargeData.allowable || 0);
    setInsAdjustmentsData([
      {
        writeOff,
        writeOffComments: '',
        writeOffReason: '',
        writeOffGroupCode: insAdjustmentsData[0]?.writeOffGroupCode || '',
        writeOffReasonCode: insAdjustmentsData[0]?.writeOffReasonCode || '',
        writeOffRemarkCode: '',
      },
    ]);
  };

  const updateAdjustments = () => {
    const writeOffAmt = (
      Number(balanceInfo.insuranceBalance?.current || 0) -
      Number(chargeData.allowable || 0)
    ).toString();
    const updatedAdjustments = [...newJsonData.adjustments];
    if (updatedAdjustments[0]?.writeOff !== undefined) {
      updatedAdjustments[0].writeOff = Number(writeOffAmt);
      handleAdjustmentInputChange(0, 'writeOff', writeOffAmt);

      isChangeValue({
        ...newJsonData,
        adjustments: updatedAdjustments,
      });
    }
  };

  useEffect(() => {
    if (tranferToData.length > 0) {
      isChangeValue({
        ...newJsonData,
        secondaryInsuranceAmount: calculateSecondaryInsuranceAmount(),
        allowed: chargeData.allowable,
        insurancePaid: chargeData.payment,
      });
    }

    if (
      (newJsonData.adjustments.length === 0 && chargeData.allowable) ||
      (newJsonData.responsibility.length === 0 && chargeData.payment)
    ) {
      getAddAdjustmentDetails(
        balanceInfo.insuranceBalance?.current && Number(chargeData.allowable)
          ? (
              Number(balanceInfo.insuranceBalance?.current || 0) -
              Number(chargeData.allowable || 0)
            ).toString()
          : '',
        chargeData.allowable && chargeData.payment
          ? (chargeData.allowable - chargeData.payment).toString()
          : ''
      );
    }

    if (newJsonData.responsibility.length === 1) {
      updateResponsibility();
    }
  }, [chargeData.allowable, chargeData.payment]);

  useEffect(() => {
    if (chargeData.allowable) {
      if (newJsonData.adjustments.length === 0) {
        setAdjustmentData();
      } else if (newJsonData.adjustments.length === 1) {
        updateAdjustments();
      }
    }
  }, [chargeData.allowable]);
  useEffect(() => {
    if (newJsonData.responsibility.length) {
      let totalpatientResponsibility = 0;
      newJsonData.responsibility.forEach((item) => {
        // Ensure item.patientResponsibility is a valid number before adding it to the total
        const patientRes = Number(item.patientResponsibility);
        if (patientRes) {
          totalpatientResponsibility += patientRes;
        }
      });
      const secInsAmount =
        Number(chargeData.allowable) -
        Number(chargeData.payment) -
        totalpatientResponsibility;

      isChangeValue({
        ...newJsonData,
        secondaryInsuranceAmount: secInsAmount > 0 ? secInsAmount : 0,
      });
    }
  }, [newJsonData.responsibility]);
  return (
    <div className="inline-flex w-full items-start justify-start rounded-lg border border-gray-300 bg-white p-6">
      <div className="inline-flex w-full flex-col items-start justify-start">
        {selectedPayment === 'refund' && (
          <div className="flex w-full flex-col items-start justify-start rounded-lg border border-gray-300 bg-gray-50 p-4">
            <div className="flex flex-col items-start justify-start space-y-4">
              <p className="text-sm font-bold leading-tight text-gray-800">
                Refund Details
              </p>

              <div className="inline-flex items-start justify-start">
                <div className="inline-flex w-28 flex-col items-start justify-start space-y-1">
                  <p className="text-sm font-medium leading-tight text-gray-700">
                    Amount
                  </p>
                  <InputFieldAmount
                    disabled={true}
                    showCurrencyName={false}
                    value={newRefundJson.patientRefund}
                  />
                </div>
                <div className=" mx-[-18px] mt-8 h-px w-16 rotate-90 bg-gray-200" />
                <div className="inline-flex items-start justify-start space-x-4">
                  <div className="inline-flex flex-col items-start justify-start space-y-1">
                    <p className="text-sm font-medium leading-tight text-gray-700">
                      Group Code
                    </p>
                    <div className="w-[240px]">
                      <SingleSelectGridDropDown
                        placeholder=""
                        showSearchBar={true}
                        data={lookupsData?.groupCode || []}
                        selectedValue={
                          lookupsData?.groupCode.filter(
                            (a) => a.code === newRefundJson.refundGroupCode
                          )[0]
                        }
                        onSelect={(e) => {
                          const value = e?.value.split('|')[0]?.trim();
                          isRefundValueChange({
                            ...newRefundJson,
                            refundGroupCode: value || '',
                          });
                        }}
                      />
                    </div>
                  </div>
                  <div className="inline-flex flex-col items-start justify-start space-y-1">
                    <p className="text-sm font-medium leading-tight text-gray-700">
                      Reason Code
                    </p>
                    <div className="w-[240px]">
                      <SingleSelectGridDropDown
                        placeholder=""
                        showSearchBar={true}
                        data={reasonCodeData}
                        searchOnCharacterLength={1}
                        selectedValue={
                          reasonCodeData.filter(
                            (a) => a.code === newRefundJson.refundReasonCode
                          )[0]
                        }
                        onSelect={(e) => {
                          const value = e?.value.split('|')[0]?.trim();
                          isRefundValueChange({
                            ...newRefundJson,
                            refundReasonCode: value || '',
                          });
                        }}
                        onSearch={(e) => {
                          getReasonCodeData(e);
                        }}
                      />
                    </div>
                  </div>
                  <div className="inline-flex w-full items-end justify-start space-x-2">
                    <div className="inline-flex flex-col items-start justify-start space-y-1">
                      <p className="text-sm font-medium leading-tight text-gray-700">
                        {'Remark Code (optional)'}
                      </p>
                      <div className="w-[240px]">
                        <MultiSelectGridDropdown
                          placeholder=""
                          showSearchBar={true}
                          data={remarkCodeData}
                          selectedValue={adjRefundRemarkCode}
                          onSelect={(e) => {
                            if (e) setAdjRefundRemarkCode(e);
                            isRefundValueChange({
                              ...newRefundJson,
                              refundRemarkCode: e.map((d) => d.value).join(','),
                            });
                          }}
                          onSearch={(e) => {
                            getRemarkCodeData(e);
                          }}
                          appendTextSeparator={'|'}
                        />
                      </div>
                    </div>
                    {/* <Button
                        buttonType={ButtonType.secondary}
                        onClick={() => {}}
                        cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                      >
                        <Icon
                          name={'plus'}
                          size={18}
                          color={IconColors.GRAY_PLUS}
                        />
                      </Button> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {selectedPayment === 'insurance' && (
          <>
            <p className="text-sm font-bold leading-tight text-gray-800">
              EOB Details
            </p>
            <div className="flex w-full flex-col items-start justify-start space-y-4">
              <div className="flex w-full flex-col items-start justify-start rounded-lg border border-gray-300 bg-gray-50 p-4">
                <div className="flex flex-col items-start justify-start space-y-4">
                  <p className="text-sm font-bold leading-tight text-gray-800">
                    Adjustment Details
                  </p>
                  <div className="flex gap-4">
                    <div className="flex flex-col gap-4">
                      {insAdjustmentsData?.map((row, index) => (
                        <>
                          <div
                            key={index}
                            className="mt-2 inline-flex items-end justify-start"
                          >
                            <div className="inline-flex w-28 flex-col   space-y-1">
                              {index === 0 && (
                                <p className="text-left text-sm font-medium leading-tight text-gray-700">
                                  Amount
                                </p>
                              )}
                              <InputFieldAmount
                                testId="patientRespAmount"
                                showCurrencyName={false}
                                value={
                                  // eslint-disable-next-line no-nested-ternary
                                  !row.writeOff &&
                                  insAdjustmentsData.length === 1
                                    ? newJsonData.adjustments[0]?.writeOff === 0
                                      ? ''
                                      : newJsonData.adjustments[0]?.writeOff
                                    : row.writeOff || ''
                                }
                                onChange={(e) => {
                                  handleAdjustmentInputChange(
                                    index,
                                    'writeOff',
                                    Number(e.target.value)
                                  );
                                }}
                              />
                            </div>
                            <div className=" mx-[-18px] mb-[25px] h-px w-16 rotate-90 bg-gray-200" />
                            <div className="inline-flex items-start justify-start space-x-4 ">
                              <div className="inline-flex flex-col items-start justify-start space-y-1">
                                {index === 0 && (
                                  <p className="text-sm font-medium leading-tight text-gray-700">
                                    Group Code
                                  </p>
                                )}
                                <div className="w-[240px]">
                                  <SingleSelectGridDropDown
                                    placeholder=""
                                    showSearchBar={true}
                                    data={lookupsData?.groupCode || []}
                                    selectedValue={
                                      lookupsData?.groupCode.filter(
                                        (a) => a.code === row.writeOffGroupCode
                                      )[0]
                                    }
                                    onSelect={(e) => {
                                      handleAdjustmentInputChange(
                                        index,
                                        'writeOffGroupCode',
                                        lookupsData?.groupCode.filter(
                                          (a) => a.id === e?.id
                                        )[0]?.code
                                      );
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="inline-flex flex-col items-start justify-start space-y-1">
                                {index === 0 && (
                                  <p className="text-sm font-medium leading-tight text-gray-700">
                                    Reason Code
                                  </p>
                                )}
                                <div className="w-[240px]">
                                  <SingleSelectGridDropDown
                                    placeholder=""
                                    showSearchBar={true}
                                    data={reasonCodeData}
                                    searchOnCharacterLength={1}
                                    selectedValue={
                                      reasonCodeData.filter(
                                        (a) => a.code === row.writeOffReasonCode
                                      )[0]
                                    }
                                    onSelect={(e) => {
                                      handleAdjustmentInputChange(
                                        index,
                                        'writeOffReasonCode',
                                        reasonCodeData.filter(
                                          (a) => a.id === e?.id
                                        )[0]?.code
                                      );
                                    }}
                                    onSearch={(e) => {
                                      getReasonCodeData(e);
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="inline-flex w-full items-end justify-start space-x-2">
                                <div className="inline-flex flex-col items-start justify-start space-y-1">
                                  {index === 0 && (
                                    <p className="text-sm font-medium leading-tight text-gray-700">
                                      Remark Code (optional)
                                    </p>
                                  )}
                                  <div className="w-[240px]">
                                    <MultiSelectGridDropdown
                                      placeholder=""
                                      showSearchBar={true}
                                      data={remarkCodeData}
                                      selectedValue={row.writeOffRemarkCode
                                        .split(',')
                                        .filter((value) => value.trim() !== '')
                                        .map((value, i) => ({
                                          id: i,
                                          value: value.trim(),
                                        }))}
                                      onSelect={(e) => {
                                        const value = e
                                          ?.map((d) => d.value)
                                          .join(',');
                                        handleAdjustmentInputChange(
                                          index,
                                          'writeOffRemarkCode',
                                          value
                                        );
                                      }}
                                      onSearch={(e) => {
                                        getRemarkCodeData(e);
                                      }}
                                      appendTextSeparator={'|'}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      ))}
                    </div>
                    <div className="self-end">
                      <Button
                        buttonType={ButtonType.secondary}
                        onClick={() => {
                          addInsAdjRow();
                        }}
                        cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5 `}
                      >
                        <Icon
                          name={'plus'}
                          size={18}
                          color={IconColors.GRAY_PLUS}
                        />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="flex w-full flex-col items-start justify-start rounded-lg border border-gray-300 bg-gray-50 p-4"
                style={{ height: 130 }}
              >
                <div
                  className="flex w-full flex-col items-start justify-start space-y-4"
                  style={{ height: 98 }}
                >
                  <p className="text-sm font-bold leading-tight text-gray-800">
                    Transfer to Next Insurance
                  </p>
                  <div
                    className="inline-flex w-full  items-start justify-start"
                    style={{ height: 62 }}
                  >
                    <div className="inline-flex w-28 flex-col items-start justify-start space-y-1">
                      <p className="text-sm font-medium leading-tight text-gray-700">
                        Amount
                      </p>
                      <InputFieldAmount
                        showCurrencyName={false}
                        value={newJsonData.secondaryInsuranceAmount || ''}
                        onChange={(e) => {
                          if (
                            newJsonData.adjustments.length === 0 &&
                            newJsonData.secondaryInsuranceAmount === null
                          ) {
                            const value =
                              chargeData.allowable -
                              chargeData.payment -
                              Number(e.target.value);
                            isChangeValue({
                              ...newJsonData,
                              secondaryInsuranceAmount: value,
                            });
                          } else {
                            let allowAddAmuont = true;
                            if (chargeData.allowable && chargeData.payment) {
                              const sum = newJsonData.responsibility.reduce(
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
                              const respAmount =
                                Number(chargeData.allowable) -
                                Number(chargeData.payment);
                              allowAddAmuont = !(
                                Number(sum) +
                                  Number(e.target.value) +
                                  Number(newJsonData.secondaryInsuranceAmount) >
                                respAmount
                              );
                            }
                            if (
                              !allowAddAmuont &&
                              Number(e.target.value) <
                                (Number(
                                  balanceInfo.insuranceBalance?.afterPayment
                                ) || 0)
                            ) {
                              dispatch(
                                addToastNotification({
                                  id: uuidv4(),
                                  text: 'Insurance transfer amount should be less than insurance amount.',
                                  toastType: ToastType.ERROR,
                                })
                              );
                              // return;
                            }
                            isChangeValue({
                              ...newJsonData,
                              secondaryInsuranceAmount: Number(e.target.value),
                            });
                          }
                        }}
                      />
                    </div>
                    <div className=" mx-[-18px] mt-6 h-px w-16 rotate-90 bg-gray-200" />
                    <div
                      className="inline-flex items-start justify-start"
                      style={{ width: 928, height: 62 }}
                    >
                      <div
                        className="inline-flex flex-col items-start justify-start space-y-1"
                        style={{ width: 416, height: 62 }}
                      >
                        <p className="text-sm font-medium leading-tight text-gray-700">
                          Transfer To
                        </p>
                        <div className="w-[416px]">
                          <SingleSelectGridDropDown
                            placeholder=""
                            showSearchBar={true}
                            data={tranferToData || []}
                            selectedValue={
                              tranferToData.filter(
                                (a) => a.id === newJsonData.secondaryInsuranceID
                              )[0]
                            }
                            onSelect={(e) => {
                              isChangeValue({
                                ...newJsonData,
                                secondaryInsuranceID: e?.id || 0,
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex w-full flex-col items-start justify-start rounded-lg border border-gray-300 bg-gray-50 p-4">
                <div className="flex w-full flex-col items-start justify-start space-y-4">
                  <p className="text-sm font-bold leading-tight text-gray-800">
                    Transfer to Patient Responsibility
                  </p>
                  <div className="flex gap-4">
                    <div className="flex flex-col gap-4">
                      {insPatientResposibilityData?.map((patRespRow, index) => (
                        <>
                          <div
                            key={index}
                            className="mt-2 inline-flex items-end justify-start"
                          >
                            <div className="inline-flex w-28 flex-col   space-y-1">
                              {index === 0 && (
                                <p className="text-left text-sm font-medium leading-tight text-gray-700">
                                  Amount
                                </p>
                              )}
                              <InputFieldAmount
                                testId="patientRespAmount"
                                showCurrencyName={false}
                                value={
                                  // eslint-disable-next-line no-nested-ternary
                                  !patRespRow.patientResponsibility &&
                                  insPatientResposibilityData.length === 1
                                    ? newJsonData.responsibility[0]
                                        ?.patientResponsibility === 0
                                      ? ''
                                      : newJsonData.responsibility[0]
                                          ?.patientResponsibility
                                    : patRespRow.patientResponsibility || ''
                                }
                                onChange={(e) => {
                                  handleInputChange(
                                    index,
                                    'patientResponsibility',
                                    Number(e.target.value)
                                  );
                                }}
                              />
                            </div>
                            <div className=" mx-[-18px] mb-[25px] h-px w-16 rotate-90 bg-gray-200" />
                            <div className="inline-flex items-start justify-start space-x-4 ">
                              <div className="inline-flex flex-col items-start justify-start space-y-1">
                                {index === 0 && (
                                  <p className="text-sm font-medium leading-tight text-gray-700">
                                    Group Code
                                  </p>
                                )}
                                <div className="w-[240px]">
                                  <SingleSelectGridDropDown
                                    placeholder=""
                                    showSearchBar={true}
                                    data={lookupsData?.groupCode || []}
                                    selectedValue={
                                      lookupsData?.groupCode.filter(
                                        (a) =>
                                          a.code ===
                                          patRespRow.responsibilityGroupCode
                                      )[0]
                                    }
                                    onSelect={(e) => {
                                      handleInputChange(
                                        index,
                                        'responsibilityGroupCode',
                                        lookupsData?.groupCode.filter(
                                          (a) => a.id === e?.id
                                        )[0]?.code
                                      );
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="inline-flex flex-col items-start justify-start space-y-1">
                                {index === 0 && (
                                  <p className="text-sm font-medium leading-tight text-gray-700">
                                    Reason Code
                                  </p>
                                )}
                                <div className="w-[240px]">
                                  <SingleSelectGridDropDown
                                    placeholder=""
                                    showSearchBar={true}
                                    data={reasonCodeData}
                                    searchOnCharacterLength={1}
                                    selectedValue={
                                      reasonCodeData.filter(
                                        (a) =>
                                          a.code ===
                                          patRespRow.responsibilityReasonCode
                                      )[0]
                                    }
                                    onSelect={(e) => {
                                      handleInputChange(
                                        index,
                                        'responsibilityReasonCode',
                                        reasonCodeData.filter(
                                          (a) => a.id === e?.id
                                        )[0]?.code
                                      );
                                    }}
                                    onSearch={(e) => {
                                      getReasonCodeData(e);
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="inline-flex w-full items-end justify-start space-x-2">
                                <div className="inline-flex flex-col items-start justify-start space-y-1">
                                  {index === 0 && (
                                    <p className="text-sm font-medium leading-tight text-gray-700">
                                      Remark Code (optional)
                                    </p>
                                  )}
                                  <div className="w-[240px]">
                                    <MultiSelectGridDropdown
                                      placeholder=""
                                      showSearchBar={true}
                                      data={remarkCodeData}
                                      selectedValue={patRespRow.responsibilityRemarkCode
                                        .split(',')
                                        .filter((value) => value.trim() !== '')
                                        .map((value, i) => ({
                                          id: i,
                                          value: value.trim(),
                                        }))}
                                      onSelect={(e) => {
                                        const value = e
                                          ?.map((d) => d.value)
                                          .join(',');
                                        handleInputChange(
                                          index,
                                          'responsibilityRemarkCode',
                                          value
                                        );
                                      }}
                                      onSearch={(e) => {
                                        getRemarkCodeData(e);
                                      }}
                                      appendTextSeparator={'|'}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      ))}
                    </div>
                    <div className="self-end">
                      <Button
                        buttonType={ButtonType.secondary}
                        onClick={() => {
                          addPatInsRow();
                        }}
                        cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5 `}
                      >
                        <Icon
                          name={'plus'}
                          size={18}
                          color={IconColors.GRAY_PLUS}
                        />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        {selectedPayment === 'patient' && (
          <>
            <div className="flex w-full flex-col items-start justify-start space-y-4">
              <div className="flex w-full flex-col items-start justify-start rounded-lg border border-gray-300 bg-gray-50 p-4">
                <div className="flex flex-col items-start justify-start space-y-4">
                  <p className="text-sm font-bold leading-tight text-gray-800">
                    Payment Details
                  </p>
                  <div className="inline-flex items-start justify-start">
                    <div className="inline-flex w-28 flex-col items-start justify-start space-y-1">
                      <p className="text-sm font-medium leading-tight text-gray-700">
                        Amount
                      </p>
                      <InputField
                        value={chargeData.advancedPayment}
                        disabled={true}
                      />
                    </div>
                    <div className=" mx-[-18px] mt-6 h-px w-16 rotate-90 bg-gray-200" />
                    <div className="inline-flex items-start justify-start space-x-4">
                      <div className="inline-flex flex-col items-start justify-start space-y-1">
                        <p className="text-sm font-medium leading-tight text-gray-700">
                          Reason
                        </p>
                        <div className="w-[416px]">
                          <SingleSelectGridDropDown
                            placeholder=""
                            showSearchBar={true}
                            data={lookupsData?.comments || []}
                            searchOnCharacterLength={1}
                            selectedValue={
                              lookupsData?.comments.filter(
                                (a) =>
                                  a.value === newPatientJsonData.paymentCode
                              )[0]
                            }
                            onSelect={(e) => {
                              if (postingMethod?.id === 1) {
                                isPatientValueChange({
                                  ...newPatientJsonData,
                                  patientAdvanceCopayment:
                                    chargeData.advancedPayment,
                                  paymentCode: e?.value || '',
                                });
                              } else {
                                isPatientValueChange({
                                  ...newPatientJsonData,
                                  patientPaid: chargeData.advancedPayment,
                                  paymentCode: e?.value || '',
                                });
                              }
                            }}
                            onSearch={(e) => {
                              getReasonCodeData(e);
                            }}
                          />
                        </div>
                      </div>

                      <div className="mt-1 inline-flex w-full items-end justify-start">
                        <div className="inline-flex flex-col items-start justify-start ">
                          <p className="text-sm font-medium leading-tight text-gray-700">
                            {'Comments'}
                          </p>
                          <div className="w-[416px]">
                            <InputField
                              placeholder="-"
                              value={
                                postingMethod?.id === 1
                                  ? newPatientJsonData.patientAdvanceCopaymentComments
                                  : newPatientJsonData.patientPaidComments
                              }
                              onChange={(e) => {
                                if (postingMethod?.id === 1) {
                                  isPatientValueChange({
                                    ...newPatientJsonData,
                                    patientAdvanceCopayment:
                                      chargeData.advancedPayment,
                                    patientAdvanceCopaymentComments:
                                      e.target.value || '',
                                  });
                                } else {
                                  isPatientValueChange({
                                    ...newPatientJsonData,
                                    patientPaidComments: e.target.value || '',
                                  });
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex w-full flex-col items-start justify-start rounded-lg border border-gray-300 bg-gray-50 p-4">
                <div className="flex w-full flex-col items-start justify-start space-y-4">
                  <div className=" flex w-full flex-col items-start justify-start space-y-4">
                    <p className="text-sm font-bold leading-tight text-gray-800">
                      Discount Details
                    </p>
                    <div className="inline-flex items-start justify-start">
                      <div className="inline-flex w-28 flex-col items-start justify-start space-y-1">
                        <p className="text-sm font-medium leading-tight text-gray-700">
                          Amount
                        </p>
                        <InputFieldAmount
                          value={newPatientJsonData.patientDiscount || ''}
                          showCurrencyName={false}
                          onChange={(e) => {
                            isPatientValueChange({
                              ...newPatientJsonData,
                              patientDiscount: Number(e.target.value),
                            });
                          }}
                        />
                      </div>
                      <div className=" mx-[-18px] mt-6 h-px w-16 rotate-90 bg-gray-200" />
                      <div className="inline-flex items-start justify-start space-x-4">
                        <div className="inline-flex flex-col items-start justify-start space-y-1">
                          <p className="text-sm font-medium leading-tight text-gray-700">
                            Reason
                          </p>
                          <div className="w-[416px]">
                            <SingleSelectGridDropDown
                              placeholder=""
                              showSearchBar={true}
                              data={lookupsData?.comments || []}
                              searchOnCharacterLength={1}
                              selectedValue={
                                lookupsData?.comments.filter(
                                  (a) =>
                                    a.value === newPatientJsonData.discountCode
                                )[0]
                              }
                              onSelect={(e) => {
                                isPatientValueChange({
                                  ...newPatientJsonData,
                                  discountCode: e?.value || '',
                                });
                              }}
                              onSearch={(e) => {
                                getReasonCodeData(e);
                              }}
                            />
                          </div>
                        </div>
                        <div className="mt-1 inline-flex w-full items-end justify-start">
                          <div className="inline-flex flex-col items-start justify-start ">
                            <p className="text-sm font-medium leading-tight text-gray-700">
                              {'Comments'}
                            </p>
                            <div className="w-[416px]">
                              <InputField
                                placeholder="-"
                                value={newPatientJsonData.discountComment}
                                onChange={(e) => {
                                  isPatientValueChange({
                                    ...newPatientJsonData,
                                    discountComment: e.target.value,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex w-full flex-col items-start justify-start rounded-lg border border-gray-300 bg-gray-50 p-4">
                <div className="flex w-full flex-col items-start justify-start space-y-4">
                  <div className=" flex w-full flex-col items-start justify-start space-y-4">
                    <p className="text-sm font-bold leading-tight text-gray-800">
                      Bad Debt
                    </p>
                    <div className="inline-flex items-start justify-start">
                      <div className="inline-flex w-28 flex-col items-start justify-start space-y-1">
                        <p className="text-sm font-medium leading-tight text-gray-700">
                          Amount
                        </p>
                        <InputFieldAmount
                          value={newPatientJsonData.patientBadDebt || ''}
                          showCurrencyName={false}
                          onChange={(e) => {
                            isPatientValueChange({
                              ...newPatientJsonData,
                              patientBadDebt: Number(e.target.value),
                            });
                          }}
                        />
                      </div>
                      <div className=" mx-[-18px] mt-6 h-px w-16 rotate-90 bg-gray-200" />
                      <div className="inline-flex items-start justify-start space-x-4">
                        <div className="inline-flex flex-col items-start justify-start space-y-1">
                          <p className="text-sm font-medium leading-tight text-gray-700">
                            Reason
                          </p>
                          <div className="w-[416px]">
                            <SingleSelectGridDropDown
                              placeholder=""
                              showSearchBar={true}
                              data={lookupsData?.comments || []}
                              searchOnCharacterLength={1}
                              selectedValue={
                                lookupsData?.comments.filter(
                                  (a) =>
                                    a.value === newPatientJsonData.badDebtCode
                                )[0]
                              }
                              onSelect={(e) => {
                                isPatientValueChange({
                                  ...newPatientJsonData,
                                  badDebtCode: e?.value || '',
                                });
                              }}
                              onSearch={(e) => {
                                getReasonCodeData(e);
                              }}
                            />
                          </div>
                        </div>
                        <div className="mt-1 inline-flex w-full items-end justify-start">
                          <div className="inline-flex flex-col items-start justify-start ">
                            <p className="text-sm font-medium leading-tight text-gray-700">
                              {'Comments'}
                            </p>
                            <div className="w-[416px]">
                              <InputField
                                placeholder="-"
                                value={newPatientJsonData.badDebtComment}
                                onChange={(e) => {
                                  isPatientValueChange({
                                    ...newPatientJsonData,
                                    badDebtComment: e.target.value,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex w-full flex-col items-start justify-start rounded-lg border border-gray-300 bg-gray-50 p-4">
                <div className="flex flex-col items-start justify-start space-y-4">
                  <div className=" flex w-full flex-col items-start justify-start space-y-4">
                    <p className="text-sm font-bold leading-tight text-gray-800">
                      Transfer to Insurance Responsibility
                    </p>
                    <div className="inline-flex items-start justify-start">
                      <div className="inline-flex w-28 flex-col items-start justify-start space-y-1">
                        <p className="text-sm font-medium leading-tight text-gray-700">
                          Amount
                        </p>
                        <InputFieldAmount
                          value={
                            newPatientJsonData.insuranceResponsibility || ''
                          }
                          showCurrencyName={false}
                          onChange={(e) => {
                            isPatientValueChange({
                              ...newPatientJsonData,
                              insuranceResponsibility: Number(e.target.value),
                            });
                          }}
                        />
                      </div>
                      <div className=" mx-[-18px] mt-6 h-px w-16 rotate-90 bg-gray-200" />
                      <div className="inline-flex items-start justify-start space-x-4 ">
                        <div className="inline-flex flex-col items-start justify-start space-y-1">
                          <p className="text-sm font-medium leading-tight text-gray-700">
                            Reason
                          </p>
                          <div className="w-[416px] ">
                            <SingleSelectGridDropDown
                              placeholder=""
                              showSearchBar={true}
                              data={lookupsData?.comments || []}
                              searchOnCharacterLength={1}
                              selectedValue={
                                lookupsData?.comments.filter(
                                  (a) => a.value === newPatientJsonData.insCode
                                )[0]
                              }
                              onSelect={(e) => {
                                const value = e?.value.split('|')[0]?.trim();
                                isPatientValueChange({
                                  ...newPatientJsonData,
                                  insCode: value || '',
                                });
                              }}
                              onSearch={(e) => {
                                getReasonCodeData(e);
                              }}
                            />
                          </div>
                        </div>
                        <div className="mt-1 inline-flex w-full items-end justify-start ">
                          <div className="inline-flex flex-col items-start justify-start">
                            <p className="text-sm font-medium leading-tight text-gray-700">
                              {'Comments'}
                            </p>
                            <div className="w-[416px] ">
                              <InputField
                                placeholder="-"
                                value={
                                  newPatientJsonData.responsibilityComments
                                }
                                onChange={(e) => {
                                  isPatientValueChange({
                                    ...newPatientJsonData,
                                    responsibilityComments: e.target.value,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="mt-4  inline-flex w-full  items-start justify-start">
          <div className="inline-flex flex-1 flex-col items-start justify-start space-y-2">
            <p className="text-sm font-bold leading-tight text-gray-800">
              Insurance Balance
            </p>
            <div className="inline-flex w-full space-x-4">
              <div
                className={classNames(
                  'inline-flex flex-1 flex-col space-y-1 rounded-md border px-4 py-2 text-left',
                  totalBalanceColor(balanceInfo?.insuranceBalance?.current || 0)
                )}
              >
                <p
                  className={classNames(
                    'w-full text-sm font-bold leading-tight',
                    chargeAmountColor(
                      balanceInfo?.insuranceBalance?.current || 0
                    )
                  )}
                >
                  Current
                </p>
                <p
                  className={classNames(
                    'text-xl font-bold leading-7',
                    chargeAmountColor(
                      balanceInfo?.insuranceBalance?.current || 0
                    )
                  )}
                >
                  $
                  {balanceInfo?.insuranceBalance?.current
                    ? balanceInfo?.insuranceBalance?.current.toFixed(2)
                    : '0.00'}
                </p>
              </div>
              <div
                className={classNames(
                  'inline-flex flex-1 flex-col space-y-1 rounded-md border px-4 py-2 text-left',
                  totalBalanceColor(
                    balanceInfo?.insuranceBalance?.afterPayment || 0
                  )
                )}
              >
                <p
                  className={classNames(
                    'w-full text-sm font-bold leading-tight',
                    chargeAmountColor(
                      balanceInfo?.insuranceBalance?.afterPayment || 0
                    )
                  )}
                >
                  After Payment
                </p>
                <p
                  className={classNames(
                    'text-xl font-bold leading-7',
                    chargeAmountColor(
                      balanceInfo?.insuranceBalance?.afterPayment || 0
                    )
                  )}
                >
                  $
                  {balanceInfo?.insuranceBalance?.afterPayment
                    ? balanceInfo?.insuranceBalance?.afterPayment.toFixed(2)
                    : '0.00'}
                </p>
              </div>
            </div>
          </div>
          <div className=" mx-[-27px] mt-12 h-px w-24 rotate-90 bg-gray-200" />
          <div className="inline-flex flex-1 flex-col space-y-2 text-left">
            <p className="text-sm font-bold leading-tight text-gray-800">
              Patient Balance
            </p>
            <div className="inline-flex w-full space-x-4">
              <div
                className={classNames(
                  'inline-flex flex-1 flex-col space-y-1 rounded-md border px-4 py-2 text-left',
                  totalBalanceColor(balanceInfo?.patientBalance?.current || 0)
                )}
              >
                <p
                  className={classNames(
                    'w-full text-sm font-bold leading-tight',
                    chargeAmountColor(balanceInfo?.patientBalance?.current || 0)
                  )}
                >
                  Current
                </p>
                <p
                  className={classNames(
                    'text-xl font-bold leading-7',
                    chargeAmountColor(balanceInfo?.patientBalance?.current || 0)
                  )}
                >
                  $
                  {balanceInfo?.patientBalance?.current
                    ? balanceInfo?.patientBalance?.current.toFixed(2)
                    : '0.00'}
                </p>
              </div>
              <div
                className={classNames(
                  'inline-flex flex-1 flex-col space-y-1 rounded-md border px-4 py-2 text-left',
                  totalBalanceColor(
                    balanceInfo?.patientBalance?.afterPayment || 0
                  )
                )}
              >
                <p
                  className={classNames(
                    'w-full text-sm font-bold leading-tight',
                    chargeAmountColor(
                      balanceInfo?.patientBalance?.afterPayment || 0
                    )
                  )}
                >
                  After Payment
                </p>
                <p
                  className={classNames(
                    'text-xl font-bold leading-7',
                    chargeAmountColor(
                      balanceInfo?.patientBalance?.afterPayment || 0
                    )
                  )}
                >
                  $
                  {balanceInfo?.patientBalance?.afterPayment
                    ? balanceInfo?.patientBalance?.afterPayment.toFixed(2)
                    : '0.00'}
                </p>
              </div>
            </div>
          </div>
          <div className=" mx-[-27px] mt-12 h-px w-24 rotate-90 bg-gray-200" />
          <div className="inline-flex flex-1 flex-col space-y-2 text-left">
            <p className="text-sm font-bold leading-tight text-gray-800">
              Total Charge Balance
            </p>
            <div className="inline-flex w-full space-x-4">
              <div
                className={classNames(
                  'inline-flex flex-1 flex-col space-y-1 rounded-md border px-4 py-2 text-left',
                  totalBalanceColor(
                    balanceInfo?.totalChargeBalance?.current || 0
                  )
                )}
              >
                <p
                  className={classNames(
                    'w-full text-sm font-bold leading-tight',
                    chargeAmountColor(
                      balanceInfo?.totalChargeBalance?.current || 0
                    )
                  )}
                >
                  Current
                </p>
                <p
                  className={classNames(
                    'text-xl font-bold leading-7',
                    chargeAmountColor(
                      balanceInfo?.totalChargeBalance?.current || 0
                    )
                  )}
                >
                  $
                  {balanceInfo?.totalChargeBalance?.current
                    ? balanceInfo?.totalChargeBalance?.current.toFixed(2)
                    : '0.00'}
                </p>
              </div>
              <div
                className={classNames(
                  'inline-flex flex-1 flex-col space-y-1 rounded-md border px-4 py-2 text-left',
                  totalBalanceColor(
                    balanceInfo?.totalChargeBalance?.afterPayment || 0
                  )
                )}
              >
                <p
                  className={classNames(
                    'w-full text-sm font-bold leading-tight',
                    chargeAmountColor(
                      balanceInfo?.totalChargeBalance?.afterPayment || 0
                    )
                  )}
                >
                  After Payment
                </p>
                <p
                  className={classNames(
                    'text-xl font-bold leading-7',
                    chargeAmountColor(
                      balanceInfo?.totalChargeBalance?.afterPayment || 0
                    )
                  )}
                >
                  $
                  {balanceInfo?.totalChargeBalance?.afterPayment
                    ? balanceInfo?.totalChargeBalance?.afterPayment.toFixed(2)
                    : '0.00'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
