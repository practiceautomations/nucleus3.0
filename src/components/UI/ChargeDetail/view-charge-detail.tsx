import type { GridColDef } from '@mui/x-data-grid-pro';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { MultiValue, SingleValue } from 'react-select';
import { v4 as uuidv4 } from 'uuid';

import GridModal from '@/components/Grid/Modal';
import Icon from '@/components/Icon';
import Modal from '@/components/UI/Modal';
import type { IcdData, NdcData } from '@/screen/createClaim';
// eslint-disable-next-line import/no-cycle
import DetailPaymentERA from '@/screen/payments/DetailPaymentERA';
import {
  addToastNotification,
  fetchCPTSearchDataRequest,
} from '@/store/shared/actions';
import {
  createNDCRule,
  fetchChargeDetailsByID,
  fetchPostingDate,
  getChargesFee,
  getChargeStatusHistory,
  getNDCDataByCPT,
  getRevenueCodesForCPTData,
  getSearchRevenueCodes,
  reversePaymentLedger,
  updateCharge,
} from '@/store/shared/sagas';
import {
  getCPTNdcDataSelector,
  getCPTSearchDataSelector,
  getLookupDropdownsDataSelector,
} from '@/store/shared/selectors';
import type {
  ChargeDetailData,
  ChargeDetailsCodeType,
  ChargeFeeOutput,
  ChargeHistoryResult,
  CPTSearchCriteria,
  CPTSearchOutput,
  PaymentLedgerType,
  PostingDateCriteria,
  RevenueCodesData,
  ReversePaymetLedgerFields,
  SaveChargeRequestPayload,
  SaveCptNdcRequestPayload,
} from '@/store/shared/types';
import { ToastType } from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';
import {
  DateToStringPipe,
  StringToDatePipe,
} from '@/utils/dateConversionPipes';
import useOnceEffect from '@/utils/useOnceEffect';

import AppDatePicker from '../AppDatePicker';
import Badge from '../Badge';
import Button, { ButtonType } from '../Button';
import CheckBox from '../CheckBox';
import CloseButton from '../CloseButton';
import CreateCrossover from '../CreateCrossover';
import InfoToggle from '../InfoToggle';
import InputField from '../InputField';
import InputFieldAmount from '../InputFieldAmount';
import type { MultiSelectDropDownDataType } from '../MultiSelectDropDown';
import type { MultiSelectGridDropdownDataType } from '../MultiSelectGridDropdown';
import MultiSelectGridDropdown from '../MultiSelectGridDropdown';
// eslint-disable-next-line import/no-cycle
import PaymentPosting from '../PaymentPosting';
import SectionHeading from '../SectionHeading';
import type { SingleSelectDropDownDataType } from '../SingleSelectDropDown';
import SingleSelectDropDown from '../SingleSelectDropDown';
import type { SingleSelectGridDropdownDataType } from '../SingleSelectGridDropdown';
import SingleSelectGridDropDown from '../SingleSelectGridDropdown';
// import type { StatusModalProps } from '../StatusModal';
import StatusModal, { StatusModalType } from '../StatusModal';
import AppTable, { AppTableCell, AppTableRow } from '../Table';
import { ChargePaymentLedger } from './charge-payment-ledger';
import { PreviousChargeStatus } from './previous-charge-statuses';

interface ViewChargeDetailsModalProps {
  chargeID: number;
  sortOrder: number;
  onClose: () => void;
  dxCodeDropdownData: MultiSelectDropDownDataType[];
  icdRows: IcdData[];
  patientID?: number;
  setEditable?: boolean;
}

export function ViewChargeDetails({
  chargeID,
  sortOrder,
  onClose,
  dxCodeDropdownData,
  icdRows,
  patientID,
  setEditable = false,
}: ViewChargeDetailsModalProps) {
  const [showCrossoverClaimModal, setShowCrossoverClaimModal] =
    useState<boolean>(false);
  const [showPaymentPostingPopUp, setShowPaymentPostingPopUp] =
    useState<boolean>(false);
  const [patientPosting, setPatientPosting] = useState<boolean>(false);
  const cptNdcData = useSelector(getCPTNdcDataSelector);
  const [isChargeStatueOpen, setIsChargeStatueOpen] = useState<boolean>(false);
  const [unit, setUnit] = useState<number | null | undefined>();
  const [mod1, setMod1] = useState<
    SingleValue<SingleSelectGridDropdownDataType> | undefined
  >();
  const [mod2, setMod2] = useState<
    SingleValue<SingleSelectGridDropdownDataType> | undefined
  >();
  const [mod3, setMod3] = useState<
    SingleValue<SingleSelectGridDropdownDataType> | undefined
  >();
  const [mod4, setMod4] = useState<
    SingleValue<SingleSelectGridDropdownDataType> | undefined
  >();
  const lookupsData = useSelector(getLookupDropdownsDataSelector);
  const [insuranceAmount, setinsuranceAmount] = useState<number | undefined>(0);
  const [insuranceAdjustment, setinsuranceAdjustment] = useState<number>(0);
  const [insurancePaid, setinsurancePaid] = useState<number>(0);
  const [insuranceBalance, setinsuranceBalance] = useState<number>(0);
  const [expected, setExpected] = useState<number>(0);
  const [writeOFF, setWriteOFF] = useState<number>(0);
  const [adjustments, setAdjustments] = useState<number>(0);
  const [fee, setFee] = useState<number | undefined>(0);
  const [patientPaid, setPatientPaid] = useState<number>(0);
  const [patientBalance, setPatientBalance] = useState<number>(0);
  const [patientAdjustment, setPatientAdjustment] = useState<number>(0);
  const [patientAmount, setPatientAmount] = useState<number | undefined>(0);
  const [CLIANumber, setCLIANumber] = useState<string | null>();
  const [DoSTo, setDosTo] = useState<Date | null>();
  const [DoSFrom, setDosFrom] = useState<Date | null>();
  const [PlaceOfService, setPlaceOfService] = useState<
    SingleSelectDropDownDataType | undefined
  >();
  const [chargeDetailData, setChargeDetailData] = useState<ChargeDetailData>();
  const [selectedReasonCode, setSelectedReasonCode] = useState<
    ChargeDetailsCodeType[]
  >([]);
  const [selectedRemarkCode, setSelectedRemarkCode] = useState<
    ChargeDetailsCodeType[]
  >([]);
  const [selectedGroupCode, setSelectedGroupCode] = useState<
    ChargeDetailsCodeType[]
  >([]);
  const [totalBalance, setTotalBalance] = useState<number>();
  const [ndcRow, setndcRow] = useState<NdcData[] | undefined>();
  const [selectedNdc, setselectedNdc] = useState<string | null>();
  const [paymentLedgerData, setPaymentLedgerData] = useState<
    PaymentLedgerType[]
  >([]);
  const [chargeFee, setChargeFee] = useState<ChargeFeeOutput>();

  const [postingDateModel, setPostingDateModel] = useState<boolean>(false);
  const [reversePostingDate, setReversePostingDate] = useState<string>('');
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
      minWidth: 140,
      disableReorder: true,
    },
    {
      field: 'paymentBatch',
      headerName: 'Pay. Batch',
      flex: 1,
      minWidth: 140,
      disableReorder: true,
    },
    {
      field: 'chargeID',
      headerName: 'Charge ID',
      flex: 1,
      minWidth: 140,
      disableReorder: true,
    },
    {
      field: 'cptCode',
      headerName: 'CPT Code',
      minWidth: 140,
      disableReorder: true,
    },
    {
      field: 'payor',
      flex: 1,
      minWidth: 140,
      headerName: 'Payor',
      disableReorder: true,
    },
    {
      field: 'name',
      flex: 1,
      minWidth: 140,
      headerName: 'Name',
      disableReorder: true,
    },
    {
      field: 'paymentReason',
      headerName: 'Pay Reason',
      flex: 1,
      minWidth: 140,
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
      minWidth: 140,
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
      minWidth: 140,
      disableReorder: true,
    },
    {
      field: 'postingDate',
      headerName: 'Post Date',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'depositDate',
      headerName: 'Deposit Date',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'checkNumber',
      headerName: 'Check Number',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
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
          </>
        );
      },
    },
  ];
  const ndcTableHeader = [
    '',
    'NDC Code',
    'Units',
    'Dosage From',
    'Service Description',
  ];
  const [isEditMode, setIsEditMode] = useState<boolean>(setEditable);
  const [dxCode, setdxCode] = useState<
    MultiValue<MultiSelectGridDropdownDataType>
  >([]);
  const [dosageForm, setDosageForm] =
    useState<SingleValue<SingleSelectGridDropdownDataType>>();

  const [chargeNdcUnits, setChargeNdcUnits] = useState<number>(1);
  const [chargeNdcDescription, setChargeNdcDescription] = useState<string>();
  const [ndcCode, setNDCCode] = useState<string>('');
  const [cptSearch, setCptSearch] = useState<CPTSearchCriteria>({
    searchValue: '',
    clientID: null,
  });
  const [chargeHistoryData, setChargeHistoryData] = useState<
    ChargeHistoryResult[]
  >([]);
  const [selectedCpt, setSelectedCpt] =
    useState<SingleValue<SingleSelectGridDropdownDataType>>();
  const dispatch = useDispatch();
  const cptData = useSelector(getCPTSearchDataSelector);
  const [cptSearchData, setCptSearchData] = useState<CPTSearchOutput[]>([]);
  useEffect(() => {
    if (cptData) {
      setCptSearchData(cptData);
    }
  }, [cptData]);
  const getNDCPopUpData = async (value: string | undefined) => {
    const ndcData = {
      cptCode: value,
      practiceID: chargeDetailData ? chargeDetailData.practiceID : null,
    };
    const res = await getNDCDataByCPT(ndcData);
    if (res) {
      setndcRow(() => {
        return res.map((a) => {
          if (selectedNdc === a.ndcCode) {
            return {
              ndcRowsData: a,
              isChecked: true,
              isDisabled: true,
            };
          }
          return {
            ndcRowsData: a,
            isChecked: false,
            isDisabled: true,
          };
        });
      });
    }
  };
  useOnceEffect(() => {
    if (cptSearch.searchValue !== '') {
      dispatch(fetchCPTSearchDataRequest(cptSearch));
      // getNDCPopUpData(cptSearch.searchValue);
    }
  }, [cptSearch.searchValue]);
  const onNdcChange = (id: number | null | undefined) => {
    setndcRow(() => {
      return ndcRow?.map((row) => {
        if (row.ndcRowsData?.id !== id && row.isChecked === true) {
          setselectedNdc(null);
          return { ...row, isChecked: false };
        }
        if (row.ndcRowsData?.id === id && row.isChecked) {
          setselectedNdc(null);
          const dataObj = cptNdcData?.filter(
            (a) => a.id === row.ndcRowsData?.id
          );
          if (dataObj && dataObj.length > 0 && row.ndcRowsData) {
            row.ndcRowsData.units = dataObj[0]?.units
              ? dataObj[0].units
              : undefined;
            row.ndcRowsData.ndcUnitQualifierID = dataObj[0]?.ndcUnitQualifierID
              ? dataObj[0].ndcUnitQualifierID
              : undefined;
            return {
              ...row,
              isChecked: !row.isChecked,
              isDisabled: !!row.isChecked,
            };
          }
        }
        if (row.ndcRowsData?.id === id) {
          if (!row.isChecked) {
            setselectedNdc(row.ndcRowsData?.ndcCode);
          }
          return {
            ...row,
            isChecked: !row.isChecked,
            isDisabled: !!row.isChecked,
          };
        }

        return row;
      });
    });
  };
  const createNdcValidation = (ndcData: SaveCptNdcRequestPayload) => {
    let isValid = true;
    if (!ndcData.cptCode) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Please Select CPT',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (chargeDetailData?.practiceID === null) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Please Select Practice',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (ndcData.ndcUnit === null) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Units cannot be empty',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (ndcData.ndcNumber == null || ndcData.ndcNumber.length < 11) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'NDC Code must consist of 11 digits.',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    return isValid;
  };
  const createNdcRule = async (selectedCptCode: string) => {
    let createNdcJson: SaveCptNdcRequestPayload = {
      cptNdcCrosswalkID: null,
      practiceID: null,
      cptCode: null,
      ndcNumber: null,
      ndcUnitQualifierID: null,
      ndcUnit: null,
      icd1: null,
      icd2: null,
      serviceDescription: null,
    };
    const createNdcCode = ndcCode
      ? ndcCode.replace('-', '').replace('-', '')
      : null;
    createNdcJson = {
      ...createNdcJson,
      cptNdcCrosswalkID: null,
      practiceID: chargeDetailData?.practiceID || null,
      cptCode: selectedCptCode,
      ndcNumber: createNdcCode || null,
      ndcUnitQualifierID: dosageForm ? dosageForm.id : null,
      ndcUnit: chargeNdcUnits || null,
      icd1: null,
      icd2: null,
      serviceDescription: chargeNdcDescription || null,
    };
    const isValid = createNdcValidation(createNdcJson);
    if (isValid) {
      const res = await createNDCRule(createNdcJson);
      if (res) {
        setNDCCode('');
        setChargeNdcUnits(1);
        setDosageForm(undefined);
        setChargeNdcDescription('');
        getNDCPopUpData(selectedCptCode);
      }
    }
  };
  const formatNDC = (value: string) => {
    const cleaned = `${value}`.replace(/\D/g, '');
    const normValue = `${cleaned.substring(0, 5)}${
      cleaned.length > 5 ? '-' : ''
    }${cleaned.substring(5, 9)}${
      cleaned.length > 9 ? '-' : ''
    }${cleaned.substring(9, 11)}`;
    return normValue;
  };
  const [revenueCodeData, setRevenueCodeData] = useState<RevenueCodesData[]>(
    []
  );
  const [selectedRevenueCode, setSelectedRevenueCode] =
    useState<SingleSelectDropDownDataType>();
  const getRevenueCodeSearchData = async (revenueSearchValue: string) => {
    const res = await getSearchRevenueCodes(revenueSearchValue);
    if (res) {
      setRevenueCodeData(res);
      setSelectedRevenueCode(res[0] as SingleSelectDropDownDataType);
    } else {
      setRevenueCodeData([]);
      setSelectedRevenueCode(undefined);
    }
  };
  const getChargeDetailDataByID = async (id: number) => {
    const res = await fetchChargeDetailsByID(id);
    if (res) {
      const ledgerRows = res.paymentLedgers.map((row) => {
        return { ...row, id: row.ledgerID };
      });
      setPaymentLedgerData(ledgerRows);
      setChargeDetailData(res);
      setselectedNdc(res.ndcNumber);
      const todos = res?.toDOS ? res?.toDOS.toString() : '';
      const toDos = todos.split('T')[0];
      if (toDos) {
        setDosTo(StringToDatePipe(toDos));
      }
      const DOB = res?.fromDOS ? res?.fromDOS.toString() : '';
      const DOBs = DOB.split('T')[0];
      if (DOBs) {
        setDosFrom(StringToDatePipe(DOBs));
      }
      const chargedDate = res?.fromDOS ? res?.fromDOS.toString() : '';
      const chargedDates = chargedDate.split('T')[0];
      if (chargedDates) {
        setDosFrom(StringToDatePipe(chargedDates));
      }
      setCptSearch({
        clientID: res.groupID,
        searchValue: res.cptCode,
      });
      setUnit(res.units);
      setMod1(lookupsData?.modifiers.filter((m) => m.value === res?.mod1)[0]);
      setMod2(lookupsData?.modifiers.filter((m) => m.value === res?.mod2)[0]);
      setMod3(lookupsData?.modifiers.filter((m) => m.value === res?.mod3)[0]);
      setMod4(lookupsData?.modifiers.filter((m) => m.value === res?.mod4)[0]);
      setPlaceOfService(
        lookupsData?.placeOfService.filter(
          (m) => m.id === res?.placeOfServiceID
        )[0]
      );
      setdxCode(
        dxCodeDropdownData && dxCodeDropdownData.length > 0
          ? (dxCodeDropdownData
              .filter(
                (a) =>
                  a.value === res?.icd1 ||
                  a.value === res?.icd2 ||
                  a.value === res?.icd3 ||
                  a.value === res?.icd4
              )
              .sort(function (obj1, obj2) {
                let a = 0;
                let b = 0;
                if (obj1.value === res?.icd1) a = 1;
                if (obj1.value === res?.icd2) a = 2;
                if (obj1.value === res?.icd3) a = 3;
                if (obj1.value === res?.icd4) a = 4;
                if (obj2.value === res?.icd1) b = 1;
                if (obj2.value === res?.icd2) b = 2;
                if (obj2.value === res?.icd3) b = 3;
                if (obj2.value === res?.icd4) b = 4;
                return a - b;
              })
              .map((a) => ({
                ...a,
              })) as MultiValue<MultiSelectGridDropdownDataType>)
          : []
      );
      if (res.chargeRevenueCode && res.medicalCaseID) {
        getRevenueCodeSearchData(res.chargeRevenueCode);
      }
      setCLIANumber(res.cliaNumber);
      setSelectedReasonCode(res.reasonCodes);
      setSelectedGroupCode(res.groupCodes);
      setSelectedRemarkCode(res.remarkCodes);
      setinsuranceBalance(res.insuranceBalance);
      setinsurancePaid(res.insurancePaid);
      setinsuranceAdjustment(res.insuranceAdjustment);
      setinsuranceAmount(res.insuranceAmount);
      setFee(res.fee);
      setAdjustments(res.adjustments);
      setWriteOFF(res.writeOFF);
      setExpected(res.expected);
      setPatientAmount(res.patientAmount);
      setPatientBalance(res.patientBalance);
      setPatientAdjustment(res.patientAdjustment);
      setPatientPaid(res.patientPaid);
      setTotalBalance(res.totalBalance);
    }
  };

  const getChargesFeeData = async () => {
    if (selectedCpt) {
      const obj = {
        cptCode: selectedCpt.value,
        modifierCode: mod1 ? mod1.value : null,
        facilityID: chargeDetailData?.facilityID || null,
        patientInsuranceID: chargeDetailData?.patientInsuranceID || null,
        medicalCaseID: chargeDetailData?.medicalCaseID || null,
      };
      const res = await getChargesFee(obj);
      if (res) {
        setChargeFee(res);
      }
    }
  };
  useEffect(() => {
    if (isEditMode) {
      getChargesFeeData();
    }
  }, [mod1, selectedCpt]);
  useEffect(() => {
    if (unit) {
      const calculatedFee = chargeFee ? chargeFee.fee * unit : fee;
      setFee(calculatedFee);
    } else {
      setFee(chargeFee ? chargeFee.fee : fee);
    }
    if (chargeFee && chargeDetailData?.patientInsuranceID) {
      setinsuranceAmount(chargeFee.fee * (unit || 1));
      setPatientAmount(0);
    } else if (chargeFee) {
      setPatientAmount(chargeFee.fee * (unit || 1));
      setinsuranceAmount(0);
    }
  }, [chargeFee, unit]);

  const postingDateCriteria: PostingDateCriteria = {
    id: reverseLedgerID,
    type: 'ledger',
    postingDate: DateToStringPipe(reversePostingDate, 1),
  };
  const reversePayment = async () => {
    const dateRes = await fetchPostingDate(postingDateCriteria);
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
      setPostingDateModel(false);
      setReversePostingDate('');
      getChargeDetailDataByID(chargeID);
    }
  };

  useEffect(() => {
    if (chargeID) {
      getChargeDetailDataByID(chargeID);
    }
  }, [chargeID]);
  useEffect(() => {
    if (cptSearchData && chargeDetailData && chargeDetailData.cptCode) {
      const selectedCptData = cptSearchData.filter(
        (a) => a.value === chargeDetailData.cptCode
      );
      setSelectedCpt(selectedCptData[0]);
    }
  }, [cptSearchData]);

  const chargeAmountColor = (chargeValue: number) => {
    if (chargeValue === 0) {
      return 'text-green-500';
    }
    if (chargeValue > 0) {
      return 'text-red-500';
    }
    return 'text-yellow-500';
  };

  const chargePaidAmountColor = (value: number) => {
    if (value === 0) {
      return 'text-red-500';
    }
    if (value > 0) {
      return 'text-green-500';
    }
    return 'text-yellow-500';
  };

  const getTotalBalanceClass = (type: string) => {
    let divClassName =
      'drop-shadow-xl box-border h-full w-full rounded-md border border-solid ';
    let pClassName = 'text-sm ';
    let balanceClassName = 'p-1 pt-3 text-lg font-bold ';

    if (totalBalance && totalBalance > 0) {
      divClassName += 'border-red-500 bg-red-50 p-3 shadow-md';
      pClassName += 'text-red-500';
      balanceClassName += 'text-red-500';
    } else if (totalBalance === 0) {
      divClassName += 'border-green-500 bg-green-50 p-3 shadow-md';
      pClassName += 'text-green-500';
      balanceClassName += 'text-green-500';
    } else {
      divClassName += 'border-yellow-500 bg-yellow-50 p-3 shadow-md';
      pClassName += 'text-yellow-500';
      balanceClassName += 'text-yellow-500';
    }

    if (type === 'divClassName') {
      return divClassName;
    }
    if (type === 'pClassName') {
      return pClassName;
    }
    return balanceClassName;
  };
  const chargesDataValidation = (chargesData: SaveChargeRequestPayload) => {
    let isValid = true;
    if (chargesData.toDOS === null || chargesData.fromDOS === null) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Please Select DoS',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (chargesData.chargePostingDate === null) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Please Select Posting Date',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (chargesData.cptCode === '') {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Please Select CPT Code',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (chargesData.units === null) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Please Select Units',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (chargesData.icd1 === null) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Please Select ICD',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (chargeDetailData?.medicalCaseID && chargesData.revenueCode === '') {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Please Select Revenue Code',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    const todaysDate = new Date();
    todaysDate.setHours(0, 0, 0, 0);

    const dosFrom = chargesData.fromDOS && new Date(chargesData.fromDOS);
    const dosTo = chargesData.toDOS && new Date(chargesData.toDOS);
    if (dosFrom) {
      dosFrom.setHours(0, 0, 0, 0);
    }
    if (dosTo) {
      dosTo.setHours(0, 0, 0, 0);
    }
    if (dosFrom && dosFrom > todaysDate) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Date of Service cannot be in the Future',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (dosTo && dosTo > todaysDate) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Date of Service cannot be in the Future',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (dosFrom && dosTo && dosFrom > dosTo) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'DOS From cannot be greater then DOS To',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (!chargesData.placeOfServiceID) {
      setStatusModalState({
        ...statusModalState,
        open: true,
        heading: 'Alert',
        description:
          'This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.',
        okButtonText: 'Ok',
        statusModalType: StatusModalType.WARNING,
        showCloseButton: false,
        closeOnClickOutside: false,
      });
    }
    return isValid;
  };

  const [showRevenueDropdown, setShowRevenueDropdown] = useState(false);

  useEffect(() => {
    if (chargeDetailData?.medicalCaseID) {
      setShowRevenueDropdown(true);
    }
  }, [chargeDetailData?.medicalCaseID]); /* selectedMedicalCaseDropdownData, */

  const getRevenueCodesForCPT = async () => {
    if (chargeDetailData && selectedCpt) {
      const res = await getRevenueCodesForCPTData(
        chargeDetailData.practiceID || null,
        chargeDetailData.patientInsuranceID || null,
        selectedCpt.value
      );
      if (res && res?.value) {
        getRevenueCodeSearchData(res?.value);
      }
    }
  };
  useEffect(() => {
    getRevenueCodesForCPT();
  }, [selectedCpt, chargeDetailData]);
  const saveChargesWithClaim = async () => {
    let chargeJson: SaveChargeRequestPayload = {
      chargeID: null,
      claimID: null,
      groupID: 0,
      fromDOS: '',
      toDOS: '',
      cptCode: '',
      units: null,
      mod1: null,
      mod2: null,
      mod3: null,
      mod4: null,
      placeOfServiceID: null,
      icd1: null,
      icd2: null,
      icd3: null,
      icd4: null,
      ndcNumber: null,
      ndcUnit: null,
      ndcUnitQualifierID: null,
      serviceDescription: null,
      fee: null,
      insuranceAmount: null,
      patientAmount: null,
      chargeBatchID: null,
      chargePostingDate: null,
      systemDocumentID: null,
      pageNumber: null,
      pointers: null,
      sortOrder: null,
      revenueCode: '',
    };
    const pointerArr = [];
    pointerArr.push(
      dxCode &&
        dxCode?.length > 0 &&
        dxCode[0] &&
        icdRows
          ?.filter((a) => a.icd10Code === dxCode[0]?.value)
          .map((a) => a.order)[0]
        ? icdRows
            ?.filter((a) => a.icd10Code === dxCode[0]?.value)
            .map((a) => a.order)[0]
        : ''
    );
    pointerArr.push(
      dxCode &&
        dxCode?.length > 1 &&
        dxCode[1] &&
        icdRows
          ?.filter((a) => a.icd10Code === dxCode[1]?.value)
          .map((a) => a.order)[0]
        ? icdRows
            ?.filter((a) => a.icd10Code === dxCode[1]?.value)
            .map((a) => a.order)[0]
        : ''
    );
    pointerArr.push(
      dxCode &&
        dxCode?.length > 2 &&
        dxCode[2] &&
        icdRows
          ?.filter((a) => a.icd10Code === dxCode[2]?.value)
          .map((a) => a.order)[0]
        ? icdRows
            ?.filter((a) => a.icd10Code === dxCode[2]?.value)
            .map((a) => a.order)[0]
        : ''
    );
    pointerArr.push(
      dxCode &&
        dxCode?.length > 3 &&
        dxCode[3] &&
        icdRows
          ?.filter((a) => a.icd10Code === dxCode[3]?.value)
          .map((a) => a.order)[0]
        ? icdRows
            ?.filter((a) => a.icd10Code === dxCode[3]?.value)
            .map((a) => a.order)[0]
        : ''
    );
    const pointerStr =
      pointerArr.length > 0 ? pointerArr.filter((a) => a !== '').join(',') : '';
    const ndcCodeObj = ndcRow?.filter((a) => a.isChecked);
    chargeJson = {
      ...chargeJson,
      chargeID,
      claimID: chargeDetailData?.claimID,
      groupID: chargeDetailData?.groupID,
      sortOrder,
      fromDOS: DateToStringPipe(DoSFrom, 1),
      toDOS: DateToStringPipe(DoSTo, 1),
      cptCode: selectedCpt ? selectedCpt.value : '',
      units: unit || null,
      mod1: mod1 ? mod1.value : '',
      mod2: mod2 ? mod2.value : '',
      mod3: mod3 ? mod3.value : '',
      mod4: mod4 ? mod4.value : '',
      placeOfServiceID: PlaceOfService ? PlaceOfService.id : null,
      icd1: dxCode && dxCode?.length > 0 && dxCode[0] ? dxCode[0].value : null,
      icd2: dxCode && dxCode?.length > 1 && dxCode[1] ? dxCode[1].value : null,
      icd3: dxCode && dxCode?.length > 2 && dxCode[2] ? dxCode[2].value : null,
      icd4: dxCode && dxCode?.length > 3 && dxCode[3] ? dxCode[3].value : null,
      ndcNumber: selectedNdc || null,
      ndcUnit:
        ndcCodeObj && ndcCodeObj[0] && ndcCodeObj[0].ndcRowsData
          ? ndcCodeObj[0].ndcRowsData.units
          : null,
      ndcUnitQualifierID:
        ndcCodeObj && ndcCodeObj[0] && ndcCodeObj[0].ndcRowsData
          ? ndcCodeObj[0].ndcRowsData.ndcUnitQualifierID
          : null,
      serviceDescription:
        ndcCodeObj && ndcCodeObj[0] && ndcCodeObj[0].ndcRowsData
          ? ndcCodeObj[0].ndcRowsData.serviceDescription
          : null,
      fee: fee || undefined,
      insuranceAmount: insuranceAmount || undefined,
      patientAmount: patientAmount || undefined,
      chargeBatchID: chargeDetailData
        ? chargeDetailData.chargeBatchID
        : undefined,
      chargePostingDate: chargeDetailData
        ? chargeDetailData.chargePostingDate
        : undefined,
      systemDocumentID:
        chargeDetailData && chargeDetailData.systemDocumentID
          ? Number(chargeDetailData.systemDocumentID)
          : undefined,
      pageNumber:
        chargeDetailData && chargeDetailData.pageNumber
          ? Number(chargeDetailData.pageNumber)
          : null,
      pointers: pointerStr,
      revenueCode: selectedRevenueCode
        ? revenueCodeData.filter((m) => m.id === selectedRevenueCode.id)[0]
            ?.code || ''
        : '',
    };
    const isValid = chargesDataValidation(chargeJson);
    if (isValid) {
      const res = await updateCharge(chargeJson);
      if (!res) {
        setStatusModalState({
          ...statusModalState,
          open: true,
          heading: 'Error',
          description:
            'A system error prevented the charge to be updated. Please try again.',
          okButtonText: 'Ok',
          statusModalType: StatusModalType.ERROR,
          showCloseButton: false,
          closeOnClickOutside: false,
        });
      } else {
        onClose();
      }
    }
  };
  const badgeClasses = (chargeValue: String | undefined | null) => {
    let badgeClass;
    if (chargeValue?.includes('Paid')) {
      badgeClass = 'bg-green-100 text-green-800 rounded-[2px]';
    } else if (chargeValue?.includes('Denied')) {
      badgeClass = 'bg-red-100 text-red-800 rounded-[2px]';
    } else if (chargeValue?.includes('Responsib')) {
      badgeClass = 'bg-yellow-100 text-yellow-800 rounded-[2px]';
    } else {
      badgeClass = 'bg-gray-100 text-gray-800 rounded-[2px]';
    }
    return badgeClass;
  };
  const badgeIcon = (chargeStatus: String | undefined | null) => {
    let iconColor;
    if (chargeStatus?.includes('Paid')) {
      iconColor = IconColors.GREEN;
    } else if (chargeStatus?.includes('Denied')) {
      iconColor = IconColors.RED;
    } else if (chargeStatus?.includes('Responsib')) {
      iconColor = IconColors.Yellow;
    } else {
      iconColor = IconColors.GRAY;
    }
    return iconColor;
  };
  const [isJsonChanged, setIsJsonChanged] = useState(false);
  return (
    <div className="flex h-full w-full flex-col items-center justify-start overflow-hidden rounded-lg bg-gray-100 shadow">
      <div className="flex w-full items-start justify-between gap-4 pt-[13px] pb-[11px] ">
        <div className="flex h-[38px] gap-4 leading-5">
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
                setPostingDateModel(true);
              }
              if (statusModalState.confirmActionType === 'saveConfirmation') {
                saveChargesWithClaim();
              }
              if (statusModalState.confirmActionType === 'closeConfirmation') {
                onClose();
              }
              setStatusModalState({
                ...statusModalState,
                open: false,
              });
            }}
          />
          <p className="self-center pl-[27px] text-xl font-bold text-gray-500">
            Charge ID: #{chargeID}
          </p>
          <p className={'p-1 pt-2 text-lg font-bold text-green-500 '}>
            <Badge
              cls={badgeClasses(chargeDetailData?.chargeStatus)}
              text={`${chargeDetailData?.chargeStatus}`}
              icon={
                <Icon
                  name={
                    chargeDetailData?.chargeStatus?.includes('Responsib')
                      ? 'user'
                      : 'desktop'
                  }
                  color={badgeIcon(chargeDetailData?.chargeStatus)}
                />
              }
            />
          </p>
        </div>
        <div className="flex  h-[38px] items-center justify-end gap-5">
          <div className="pr-5">
            <CloseButton
              onClick={() => {
                if (isJsonChanged) {
                  setStatusModalState({
                    ...statusModalState,
                    open: true,
                    heading: 'Cancel Confirmation',
                    description: `Are you certain you want to cancel all changes made to this charge? Clicking "Confirm" will result in the loss of all changes.`,
                    statusModalType: StatusModalType.WARNING,
                    showCloseButton: true,
                    okButtonText: 'Confirm',
                    closeButtonText: 'Cancel',
                    confirmActionType: 'closeConfirmation',
                  });
                } else {
                  onClose();
                }
              }}
            />
          </div>
        </div>
      </div>
      <div className={'w-full px-6'}>
        <div className={`h-[1px] w-full bg-gray-300`} />
      </div>
      <div className="w-full flex-1 overflow-y-auto p-6">
        <div className="inline-flex w-full gap-4">
          <div className="mt-[10px] ml-[27px] self-center text-xl font-bold text-gray-700">
            {selectedCpt
              ? `${selectedCpt.value} | ${selectedCpt.appendText}`
              : ''}
          </div>
          <div className="gap-2 font-medium leading-5 text-gray-700">
            <Button
              buttonType={ButtonType.secondary}
              cls={`inline-flex px-4 py-2 gap-2 leading-5 mt-[10px]  ml-[4px]`}
              onClick={() => {
                setIsEditMode(true);
              }}
            >
              <Icon name={'pencil'} size={16} color={IconColors.NONE} />
              <p className="text-sm font-medium leading-tight text-gray-700 ">
                Edit
              </p>
            </Button>
          </div>
        </div>
        <div
          className={`relative flex items-start gap-8 text-gray-700 leading-6 text-left font-bold w-full pt-[20px]`}
        >
          <div className={`gap-6 flex flex-col items-start`}>
            <div className={`relative w-[280px] h-[62px] flex gap-2 items-end`}>
              <div>
                <div className="flex gap-1">
                  <label className="ml-[27px] text-sm font-medium leading-loose text-gray-900">
                    DoS - From*
                  </label>
                  <InfoToggle
                    position="right"
                    text={
                      <div>
                        {' '}
                        CMS1500 : BOX24-A <br /> X12 : LOOP 2400 - DTP03 (472)
                      </div>
                    }
                  />
                </div>
                <div className="ml-[27px] w-[144px]">
                  <AppDatePicker
                    placeholderText="mm/dd/yyyy"
                    cls=""
                    onChange={(date) => {
                      setDosFrom(date);
                      setIsJsonChanged(true);
                    }}
                    selected={DoSFrom}
                    disabled={!isEditMode}
                  />
                </div>
              </div>
              <div>
                <div className="flex gap-1">
                  <label className="text-sm font-medium leading-loose text-gray-900">
                    DoS - To*
                  </label>
                  <InfoToggle
                    position="right"
                    text={
                      <div>
                        {' '}
                        CMS1500 : BOX24-A <br /> X12 : LOOP 2400 - DTP03 (472)
                      </div>
                    }
                  />
                </div>
                <div className="w-[144px]">
                  <AppDatePicker
                    placeholderText="mm/dd/yyyy"
                    cls=""
                    onChange={(date) => {
                      setDosTo(date);
                      setIsJsonChanged(true);
                    }}
                    selected={DoSTo}
                    disabled={!isEditMode}
                  />
                </div>
              </div>
              <div>
                <div className="flex gap-1">
                  <label className="text-sm font-medium leading-5 text-gray-900 ">
                    CPT Code*
                  </label>
                  <InfoToggle
                    position="right"
                    text={
                      <div>
                        {' '}
                        CMS1500 : BOX24-D <br /> X12 : LOOP 2400 - SV101-1 (HC)
                      </div>
                    }
                  />
                </div>
                <div className=" mt-1 w-[400px]">
                  {/* <InputField
                  value={CPT || ''}
                  disabled={!isEditMode}
                  onChange={(evt) => setCPT(evt.target.value)}
                /> */}
                  <SingleSelectGridDropDown
                    placeholder=""
                    showSearchBar={true}
                    showDropdownIcon={false}
                    disabled={!isEditMode}
                    data={
                      cptSearchData?.length !== 0
                        ? (cptSearchData as SingleSelectGridDropdownDataType[])
                        : []
                    }
                    selectedValue={selectedCpt}
                    onSelect={(value) => {
                      if (value) {
                        setSelectedCpt({ ...value });
                        setselectedNdc('');
                        getNDCPopUpData(value.value);
                        setIsJsonChanged(true);
                      }
                    }}
                    onSearch={(value) => {
                      setCptSearch({
                        ...cptSearch,
                        searchValue: value,
                      });
                    }}
                    appendTextSeparator={'|'}
                  />
                </div>
              </div>
              {showRevenueDropdown && (
                <div>
                  <label className="text-sm font-medium leading-5 text-gray-900 ">
                    Revenue Code*
                  </label>
                  <div className=" mt-1 w-[300px]">
                    <SingleSelectDropDown
                      placeholder=""
                      showSearchBar={true}
                      // isOptional={true}
                      disabled={!isEditMode}
                      data={
                        revenueCodeData?.length !== 0
                          ? (revenueCodeData as SingleSelectDropDownDataType[])
                          : []
                      }
                      selectedValue={selectedRevenueCode}
                      onSelect={(value) => {
                        if (value) {
                          setSelectedRevenueCode({ ...value });
                          setIsJsonChanged(true);
                        }
                      }}
                      onSearch={(value) => {
                        getRevenueCodeSearchData(value);
                      }}
                      // onDeselectValue={() => {
                      //   setSelectedRevenueCode(undefined);
                      // }}
                    />
                  </div>
                </div>
              )}
              <div className="self-start">
                <div className={`w-full items-start self-stretch`}>
                  <div className="flex gap-1">
                    <label className="text-sm font-medium leading-5 text-gray-900">
                      Unit*
                    </label>
                    <InfoToggle
                      position="right"
                      text={
                        <div>
                          {' '}
                          CMS1500 : BOX24-G <br /> X12 : LOOP 2400 - SV104 (UN)
                        </div>
                      }
                    />
                  </div>
                  <div className="h-[38px]  w-[45px]">
                    <InputField
                      value={unit || ''}
                      type="text"
                      pattern="[0-9]*"
                      placeholder=""
                      disabled={!isEditMode}
                      onChange={(e) => {
                        if (e.target.value !== '') {
                          setUnit(Number(e.target.value));
                          setIsJsonChanged(true);
                        } else {
                          setUnit(undefined);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className={`w-full items-start self-stretch `}>
                <div className="flex gap-1">
                  <label className="text-sm font-medium leading-5 text-gray-900">
                    Modifiers
                  </label>
                  <InfoToggle
                    position="right"
                    text={
                      <div className="flex flex-col">
                        <div className="font-bold">MOD1:</div>
                        <div>
                          {' '}
                          CMS1500 : BOX24-D <br /> X12 : LOOP 2400 - SV101-3
                        </div>
                        <div className="font-bold">MOD2:</div>
                        <div>
                          {' '}
                          CMS1500 : BOX24-D <br /> X12 : LOOP 2400 - SV101-4
                        </div>
                        <div className="font-bold">MOD3:</div>
                        <div>
                          {' '}
                          CMS1500 : BOX24-D <br /> X12 : LOOP 2400 - SV101-5
                        </div>
                        <div className="font-bold">MOD4:</div>
                        <div>
                          {' '}
                          CMS1500 : BOX24-D <br /> X12 : LOOP 2400 - SV101-6
                        </div>
                      </div>
                    }
                  />
                </div>
                <div className="mt-[4px] flex gap-x-2">
                  <div className="flex gap-x-2">
                    <div className="h-[38px] w-[45px]">
                      <SingleSelectGridDropDown
                        placeholder=""
                        showSearchBar={true}
                        disabled={!isEditMode}
                        showDropdownIcon={false}
                        data={
                          lookupsData?.modifiers
                            ? (lookupsData?.modifiers as SingleSelectDropDownDataType[])
                            : []
                        }
                        selectedValue={mod1}
                        onSelect={(value) => {
                          setMod1(value);
                          setIsJsonChanged(true);
                        }}
                      />
                    </div>
                    <div className="h-[38px] w-[45px]">
                      <SingleSelectGridDropDown
                        placeholder=""
                        showSearchBar={true}
                        disabled={!isEditMode}
                        showDropdownIcon={false}
                        data={
                          lookupsData?.modifiers
                            ? (lookupsData?.modifiers as SingleSelectDropDownDataType[])
                            : []
                        }
                        selectedValue={mod2}
                        onSelect={(value) => {
                          setMod2(value);
                          setIsJsonChanged(true);
                        }}
                      />
                    </div>
                    <div className="h-[38px] w-[45px]">
                      <SingleSelectGridDropDown
                        placeholder=""
                        showSearchBar={true}
                        disabled={!isEditMode}
                        showDropdownIcon={false}
                        data={
                          lookupsData?.modifiers
                            ? (lookupsData?.modifiers as SingleSelectDropDownDataType[])
                            : []
                        }
                        selectedValue={mod3}
                        onSelect={(value) => {
                          setMod3(value);
                          setIsJsonChanged(true);
                        }}
                      />
                    </div>
                    <div className="h-[38px] w-[45px]">
                      <SingleSelectGridDropDown
                        placeholder=""
                        showSearchBar={true}
                        disabled={!isEditMode}
                        showDropdownIcon={false}
                        data={
                          lookupsData?.modifiers
                            ? (lookupsData?.modifiers as SingleSelectDropDownDataType[])
                            : []
                        }
                        selectedValue={mod4}
                        onSelect={(value) => {
                          setMod4(value);
                          setIsJsonChanged(true);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className={`w-full items-start self-stretch`}>
                <div className="flex gap-1">
                  <label className="text-sm font-medium leading-5 text-gray-900">
                    Place of Service*
                  </label>
                  <InfoToggle
                    position="right"
                    text={
                      <div>
                        {' '}
                        CMS1500 : BOX24-B <br /> X12 : LOOP 2400 - SV105
                      </div>
                    }
                  />
                </div>
                <div
                  className={`w-full gap-1 justify-center flex flex-col items-start self-stretch`}
                >
                  <div className="w-[175px]">
                    <SingleSelectDropDown
                      placeholder="Place of Service"
                      disabled={!isEditMode}
                      data={
                        lookupsData?.placeOfService
                          ? (lookupsData?.placeOfService as SingleSelectDropDownDataType[])
                          : []
                      }
                      selectedValue={PlaceOfService}
                      onSelect={(value) => {
                        setPlaceOfService(value);
                        setIsJsonChanged(true);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className={`relative w-[280px] h-[62px] flex gap-2 ml-[27px]`}>
              <div>
                <label className="text-sm font-medium leading-loose text-gray-900 ">
                  CLIA Number
                </label>
                <div className="mt-[-4px] h-[38px] w-[144px]">
                  <InputField
                    value={CLIANumber || ''}
                    placeholder=""
                    disabled={true}
                    onChange={(evt) => {
                      setCLIANumber(evt.target.value);
                      setIsJsonChanged(true);
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex gap-1">
                  <label className="text-sm font-medium leading-loose text-gray-900 ">
                    DX*
                  </label>
                  <InfoToggle
                    position="right"
                    text={
                      <div>
                        {' '}
                        CMS1500 : BOX24-E <br /> X12 : LOOP 2400 - SV107
                      </div>
                    }
                  />
                </div>

                <div className="h-[38px] w-[400px]">
                  <MultiSelectGridDropdown
                    placeholder=""
                    disabled={!isEditMode}
                    data={dxCodeDropdownData || []}
                    selectedValue={dxCode}
                    onSelect={(e) => {
                      if (e && e.length < 5) {
                        setdxCode(e);
                      }
                      setIsJsonChanged(true);
                    }}
                  />
                </div>
              </div>
              {selectedCpt &&
                (selectedCpt.value[0] === 'J' ||
                  (selectedCpt.value[0] === '9' &&
                    selectedCpt.value[1] === '0')) && (
                  <div>
                    <label className="text-sm font-medium leading-loose text-gray-900 ">
                      NDC Codes
                    </label>
                    <div className="h-[38px] w-[300px] ">
                      {ndcRow && ndcRow.length > 0 ? (
                        <GridModal
                          disabled={!isEditMode}
                          icon={
                            <span className="contents" onClick={() => {}}>
                              <Icon
                                name={'pencil'}
                                size={18}
                                color={IconColors.GRAY}
                              />
                            </span>
                          }
                          txt={'Edit NDC Rule'}
                          cls="w-10 p-2 bg-white shadow border rounded-md border-gray-300"
                          clsDiv="px-4 py-4"
                          value={selectedNdc || ''}
                        >
                          <AppTable
                            renderHead={
                              <>
                                <AppTableRow>
                                  {ndcTableHeader.map((header) => (
                                    <>
                                      <AppTableCell key={header}>
                                        {header}
                                      </AppTableCell>
                                    </>
                                  ))}
                                </AppTableRow>
                              </>
                            }
                            renderBody={
                              <>
                                {ndcRow?.map((ndcRowData) => (
                                  <AppTableRow
                                    key={ndcRowData.ndcRowsData?.id}
                                    cls={
                                      ndcRowData.isChecked ? 'bg-cyan-50' : ''
                                    }
                                  >
                                    <AppTableCell component="th">
                                      <div className=" w-[16px]">
                                        <CheckBox
                                          id="ndcCheckbox"
                                          checked={ndcRowData.isChecked}
                                          onChange={() =>
                                            onNdcChange(
                                              ndcRowData.ndcRowsData?.id
                                            )
                                          }
                                          disabled={false}
                                        />
                                      </div>
                                    </AppTableCell>
                                    <AppTableCell component="th">
                                      <div className="mb-2 h-[38px] w-[131px]">
                                        <InputField
                                          value={
                                            ndcRowData.ndcRowsData?.ndcCode
                                              ? ndcRowData.ndcRowsData?.ndcCode
                                              : ''
                                          }
                                          disabled={true}
                                        />
                                      </div>
                                    </AppTableCell>
                                    <AppTableCell>
                                      <div className="flex gap-x-2">
                                        <div className="mb-2 h-[38px] w-[38px]">
                                          <InputField
                                            value={
                                              ndcRowData.ndcRowsData?.units
                                                ? ndcRowData.ndcRowsData?.units
                                                : ''
                                            }
                                            disabled={ndcRowData.isDisabled}
                                            onChange={(evt) => {
                                              setndcRow(() => {
                                                /* eslint no-param-reassign: "error" */
                                                return ndcRow?.map((row2) => {
                                                  if (
                                                    row2.ndcRowsData?.id ===
                                                    ndcRowData.ndcRowsData?.id
                                                  ) {
                                                    if (row2.ndcRowsData) {
                                                      row2.ndcRowsData.units =
                                                        evt.target.value
                                                          ? Number(
                                                              evt.target.value
                                                            )
                                                          : undefined;
                                                      return {
                                                        ...row2,
                                                      };
                                                    }
                                                  }
                                                  return row2;
                                                });
                                              });
                                            }}
                                            cls="!pl-[1px] !pr-[1px] !pt-0 !pb-0"
                                            inputCls="!pl-[9px] !pr-[9px] !pt-0 !pb-0"
                                          />
                                        </div>
                                      </div>
                                    </AppTableCell>
                                    <AppTableCell>
                                      <div className="w-[120px]">
                                        <SingleSelectGridDropDown
                                          placeholder=""
                                          showSearchBar={false}
                                          disabled={ndcRowData.isDisabled}
                                          data={
                                            lookupsData?.ndcCodes
                                              ? lookupsData?.ndcCodes
                                              : []
                                          }
                                          selectedValue={
                                            lookupsData?.ndcCodes &&
                                            lookupsData?.ndcCodes.length > 0 &&
                                            lookupsData?.ndcCodes.filter(
                                              (a) =>
                                                a.id ===
                                                ndcRowData.ndcRowsData
                                                  ?.ndcUnitQualifierID
                                            )
                                              ? lookupsData?.ndcCodes.filter(
                                                  (a) =>
                                                    a.id ===
                                                    ndcRowData.ndcRowsData
                                                      ?.ndcUnitQualifierID
                                                )[0]
                                              : undefined
                                          }
                                          onSelect={(e) => {
                                            setndcRow(() => {
                                              return ndcRow?.map((row1) => {
                                                if (
                                                  row1.ndcRowsData?.id ===
                                                  ndcRowData.ndcRowsData?.id
                                                ) {
                                                  if (row1.ndcRowsData) {
                                                    row1.ndcRowsData.ndcUnitQualifierID =
                                                      e ? e.id : undefined;
                                                    return {
                                                      ...row1,
                                                    };
                                                  }
                                                }
                                                return row1;
                                              });
                                            });
                                          }}
                                        />
                                      </div>
                                    </AppTableCell>
                                    <AppTableCell>
                                      <div className="mb-2 h-[38px] w-[400px]">
                                        <InputField
                                          value={
                                            ndcRowData.ndcRowsData
                                              ?.serviceDescription
                                              ? ndcRowData.ndcRowsData
                                                  ?.serviceDescription
                                              : ''
                                          }
                                          disabled={true}
                                        />
                                      </div>
                                    </AppTableCell>
                                  </AppTableRow>
                                ))}
                              </>
                            }
                          />
                        </GridModal>
                      ) : (
                        <GridModal
                          disabled={!isEditMode}
                          icon={
                            <Button
                              buttonType={ButtonType.primary}
                              onClick={() => {
                                createNdcRule(selectedCpt?.value || '');
                              }}
                            >
                              Create NDC Rule
                            </Button>
                          }
                          cls="w-143 h-[38px]"
                          clsDiv="px-4 py-4"
                          value={''}
                        >
                          <AppTable
                            renderHead={
                              <>
                                <AppTableRow>
                                  <AppTableCell>
                                    <div className="flex gap-1">
                                      NDC Code
                                      <InfoToggle
                                        position="right"
                                        text={
                                          <div>
                                            {' '}
                                            CMS1500 : BOX24-A shaded area <br />{' '}
                                            X12 : LOOP 2410 - CTP104
                                          </div>
                                        }
                                      />
                                    </div>
                                  </AppTableCell>
                                  <AppTableCell>
                                    <div className="flex gap-1">
                                      Units
                                      <InfoToggle
                                        position="right"
                                        text={
                                          <div>
                                            {' '}
                                            CMS1500 : BOX24-A shaded area <br />{' '}
                                            X12 : LOOP 2410 - CTP104
                                          </div>
                                        }
                                      />
                                    </div>
                                  </AppTableCell>
                                  <AppTableCell>
                                    <div className="flex gap-1">
                                      Dosage Form
                                      <InfoToggle
                                        position="right"
                                        text={
                                          <div>
                                            {' '}
                                            CMS1500 : BOX24-A shaded area <br />{' '}
                                            X12 : LOOP 2410 - CTP105
                                          </div>
                                        }
                                      />
                                    </div>
                                  </AppTableCell>
                                  <AppTableCell>
                                    <div className="flex gap-1">
                                      Service Description
                                      <InfoToggle
                                        position="right"
                                        text={
                                          <div>
                                            {' '}
                                            CMS1500 : BOX24-A shaded area <br />{' '}
                                            X12 : LOOP 2400 - SV101-7
                                          </div>
                                        }
                                      />
                                    </div>
                                  </AppTableCell>
                                  <AppTableCell cls="bg-cyan-100">
                                    Action
                                  </AppTableCell>
                                </AppTableRow>
                              </>
                            }
                            renderBody={
                              <>
                                <AppTableRow>
                                  <AppTableCell component="th">
                                    <div className="mb-2 h-[38px] w-[131px]">
                                      <InputField
                                        value={ndcCode}
                                        onChange={(evt) => {
                                          const formattedValue = formatNDC(
                                            evt.target.value
                                          );
                                          setNDCCode(formattedValue);
                                        }}
                                      />
                                    </div>
                                  </AppTableCell>
                                  <AppTableCell>
                                    <div className="mb-2 h-[38px] w-[38px]">
                                      <InputField
                                        cls="!pl-[1px] !pr-[1px] !pt-0 !pb-0"
                                        inputCls="!pl-[9px] !pr-[9px] !pt-0 !pb-0"
                                        value={chargeNdcUnits}
                                        onChange={(evt) => {
                                          if (evt.target.value !== '') {
                                            setChargeNdcUnits(
                                              Number(evt.target.value)
                                            );
                                          } else {
                                            setChargeNdcUnits(1);
                                          }
                                        }}
                                      />
                                    </div>
                                  </AppTableCell>
                                  <AppTableCell>
                                    <div className="w-[120px]">
                                      <SingleSelectGridDropDown
                                        placeholder=""
                                        showSearchBar={false}
                                        data={
                                          lookupsData?.ndcCodes
                                            ? lookupsData?.ndcCodes
                                            : []
                                        }
                                        selectedValue={dosageForm}
                                        onSelect={(e) => {
                                          setDosageForm(e);
                                        }}
                                      />
                                    </div>
                                  </AppTableCell>
                                  <AppTableCell>
                                    <div className="mb-2 h-[38px] w-[400px]">
                                      <InputField
                                        value={chargeNdcDescription}
                                        onChange={(evt) => {
                                          setChargeNdcDescription(
                                            evt.target.value
                                          );
                                        }}
                                      />
                                    </div>
                                  </AppTableCell>
                                  <AppTableCell cls="bg-cyan-50">
                                    <div className="flex gap-x-2">
                                      <Button
                                        buttonType={ButtonType.secondary}
                                        cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
                                      >
                                        <Icon name={'trash'} size={18} />
                                      </Button>
                                    </div>
                                  </AppTableCell>
                                </AppTableRow>
                              </>
                            }
                          />
                        </GridModal>
                      )}
                    </div>
                  </div>
                )}
              <div>
                <div className="flex gap-1">
                  <label className="text-sm font-medium leading-loose text-gray-900 ">
                    Fee*
                  </label>
                  <InfoToggle
                    position="right"
                    text={
                      <div>
                        {' '}
                        CMS1500 : BOX24-F <br /> X12 : LOOP 2400 - SV102
                      </div>
                    }
                  />
                </div>
                <div className="mt-[-4px] h-[38px] w-[144px]">
                  <InputFieldAmount
                    disabled={!isEditMode}
                    value={fee}
                    showCurrencyName={false}
                    onChange={(evt) => {
                      if (evt.target.value !== '') {
                        setFee(Number(evt.target.value));
                        setIsJsonChanged(true);
                      } else {
                        setFee(undefined);
                      }
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium leading-loose text-gray-900 ">
                  Ins. Resp.
                </label>
                <div className="mt-[-4px] h-[38px] w-[144px]">
                  <InputFieldAmount
                    disabled={!isEditMode}
                    value={insuranceAmount}
                    showCurrencyName={false}
                    onChange={(evt) => {
                      if (evt.target.value !== '') {
                        setinsuranceAmount(Number(evt.target.value));
                        setIsJsonChanged(true);
                      } else {
                        setinsuranceAmount(undefined);
                      }
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium leading-loose text-gray-900 ">
                  Pat. Resp.
                </label>
                <div className="mt-[-4px] h-[38px] w-[144px]">
                  <InputFieldAmount
                    disabled={!isEditMode}
                    value={patientAmount}
                    showCurrencyName={false}
                    onChange={(evt) => {
                      if (evt.target.value !== '') {
                        setPatientAmount(Number(evt.target.value));
                        setIsJsonChanged(true);
                      } else {
                        setPatientAmount(undefined);
                      }
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium leading-loose text-gray-900 ">
                  Charge Batch
                </label>
                <div className="mt-[-4px] h-[38px] w-[187px]">
                  <InputField
                    value={
                      chargeDetailData && chargeDetailData.chargeBatchID
                        ? `${chargeDetailData.chargeBatchID} | ${chargeDetailData.chargeBatchDescription}`
                        : ''
                    }
                    placeholder=""
                    disabled={true}
                    onChange={() => {}}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className={`relative inline-flex items-start gap-8 text-gray-700 leading-6 text-left font-bold w-full p-[27px]`}
        >
          <div
            className={
              'box-border w-full rounded-md border border-solid border-green-500 bg-green-50 p-3 shadow-md drop-shadow-xl'
            }
          >
            <div className="inline-flex">
              <p className="w-[200px] text-sm text-green-500">
                Charge Status
                <p className={'p-1 pt-2 text-lg font-bold text-green-500 '}>
                  <Badge
                    cls="bg-green-100 text-green-800"
                    icon={
                      <Icon name="user" size={18} color={IconColors.GREEN} />
                    }
                    text={'Paid EOB'}
                  />
                </p>
              </p>
              <div className={'ml-[1px]'}>
                <p className="text-sm text-green-500">Charge Status Details </p>
                <p className="text-sm text-green-500">GROUP CODE:</p>
                {selectedGroupCode.map((m, i) => (
                  <p key={i} className="text-sm text-green-800">
                    {m.code} | {m.description}{' '}
                  </p>
                ))}
                <div className="py-[10px]">
                  <div className="h-px w-full bg-green-200 " />
                </div>
                <p className="text-sm text-green-500">REASON CODE:</p>
                {selectedReasonCode.map((m, i) => (
                  <p key={i} className="text-sm text-green-800">
                    {m.code} | {m.description}{' '}
                  </p>
                ))}
                <div className="w-full py-[10px]">
                  <div className="h-px w-full bg-green-200 " />
                </div>
                <p className="text-sm text-green-500">REMARK CODE: </p>
                {selectedRemarkCode.map((m, i) => (
                  <p key={i} className="text-sm text-green-800">
                    {m.code} | {m.description}{' '}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className={'flex items-start py-3'}>
          <Button
            buttonType={ButtonType.secondary}
            cls={`inline-flex px-4 py-2 gap-2 leading-5 ml-[27px]`}
            onClick={async () => {
              setIsChargeStatueOpen(true);
              const historyData = await getChargeStatusHistory(chargeID);
              if (historyData) {
                setChargeHistoryData(historyData.chargeStatuses);
              }
            }}
          >
            <p className="text-sm font-medium leading-tight text-gray-700">
              View Previous Charge Statuses
            </p>
          </Button>
          <>
            <Modal
              open={showCrossoverClaimModal}
              onClose={() => {}}
              modalContentClassName="relative w-[1232px] overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 w-full"
            >
              <CreateCrossover
                claimID={chargeDetailData?.claimID || 0}
                groupID={chargeDetailData?.groupID || 0}
                patientID={patientID}
                selectedChargeID={chargeID}
                onClose={() => {
                  setShowCrossoverClaimModal(false);
                }}
              />
            </Modal>
            <Modal
              open={showPaymentPostingPopUp}
              onClose={() => {}}
              modalContentClassName="h-[calc(100%-80px)] w-[calc(100%-220px)] relative rounded-lg bg-white shadow-xl transition-all sm:my-8"
              hideBackdrop
            >
              <PaymentPosting
                claimID={chargeDetailData?.claimID || 0}
                groupID={chargeDetailData?.groupID || 0}
                patientID={patientID}
                patientPosting={patientPosting}
                onClose={() => {
                  setShowPaymentPostingPopUp(false);
                  getChargeDetailDataByID(chargeID);
                }}
                chargeRowID={chargeDetailData?.chargeID}
              />
            </Modal>
            <Modal
              open={isChargeStatueOpen}
              onClose={() => {
                setIsChargeStatueOpen(false);
              }}
              modalContentClassName="rounded-lg bg-gray-100  text-left shadow-xl overflow-scroll "
            >
              <PreviousChargeStatus
                onClose={() => setIsChargeStatueOpen(false)}
                data={chargeHistoryData}
              ></PreviousChargeStatus>
            </Modal>
            <Modal
              open={postingDateModel}
              onClose={() => {}}
              modalContentClassName="rounded-lg bg-gray-100  text-left shadow-xl  h-[200px] w-[300px] "
            >
              <div className="mx-[27px] flex h-[60px] items-center justify-between gap-4">
                <div className="h-[28px] w-full">
                  <SectionHeading
                    label="Add Posting date"
                    isCollapsable={false}
                  />
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
                <div
                  className={`px-[27px] relative w-[280px] h-[60px] flex gap-2`}
                >
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
          </>
        </div>
        <div className="flex items-start justify-between gap-4 px-7">
          <div className="flex h-[38px]">
            <p className="self-center text-xl font-bold text-gray-700">
              Charge Balance
            </p>
          </div>
        </div>
        <div
          className={`relative inline-flex items-start gap-8 text-gray-700 leading-6 text-left font-bold w-full p-[27px] `}
        >
          <div
            className={
              'relative h-[550px] overflow-hidden rounded-lg bg-white bg-white px-4 pt-5 pb-4 text-left shadow-xl drop-shadow-xl transition-all'
            }
          >
            <div className="text-xl font-bold text-gray-500">
              {' '}
              Fee Adjustments
            </div>
            <div className="inline-flex">
              <div className="inline-flex">
                <p className="w-[200px] text-sm  text-gray-500">
                  Charge Fee
                  <p
                    className={classNames(
                      'p-1 pt-3 text-lg font-bold text-gray-900'
                    )}
                  >
                    $ {fee?.toFixed(2)}
                  </p>
                </p>
                <p className="w-[200px] text-sm  text-gray-500">
                  Adjustment
                  <p
                    className={classNames(
                      'p-1 pt-3 text-lg font-bold',
                      chargeAmountColor(adjustments)
                    )}
                  >
                    $ {adjustments?.toFixed(2)}
                  </p>
                </p>
                <p className="w-[200px] text-sm  text-gray-500">
                  Write-Off
                  <p
                    className={classNames(
                      'p-1 pt-3 text-lg font-bold',
                      chargeAmountColor(writeOFF)
                    )}
                  >
                    $ {writeOFF?.toFixed(2)}
                  </p>
                </p>
                <p className="w-[200px] text-sm  text-gray-500">
                  Expected
                  <p
                    className={classNames(
                      'p-1 pt-3 text-lg font-bold',
                      chargeAmountColor(expected)
                    )}
                  >
                    $ {expected?.toFixed(2)}
                  </p>
                </p>
              </div>
            </div>
            <div className="mx-1 py-[30px]">
              <div className="h-px w-full bg-gray-200 " />
            </div>
            <div className="text-xl font-bold text-gray-500 ">
              Insurance Balance
              <div className="inline-flex pb-[20px]">
                <div className="inline-flex">
                  <p className="w-[200px] text-sm  text-gray-500">
                    Ins. Responsibility
                    <p
                      className={classNames(
                        'p-1 pt-3 text-lg font-bold text-gray-900'
                      )}
                    >
                      $ {insuranceAmount?.toFixed(2)}
                    </p>
                  </p>
                  <p className="w-[200px] text-sm  text-gray-500">
                    Ins. Adjustment
                    <p
                      className={classNames(
                        'p-1 pt-3 text-lg font-bold',
                        chargeAmountColor(insuranceAdjustment)
                      )}
                    >
                      $ {insuranceAdjustment?.toFixed(2)}
                    </p>
                  </p>
                  <p className="w-[200px] text-sm  text-gray-500">
                    Ins. Paid
                    <p
                      className={classNames(
                        'p-1 pt-3 text-lg font-bold',
                        chargePaidAmountColor(insurancePaid)
                      )}
                    >
                      $ {insurancePaid?.toFixed(2)}
                    </p>
                  </p>
                  <p className="w-[200px] text-sm  text-gray-500">
                    Ins. Balance
                    <p
                      className={classNames(
                        'p-1 pt-3 text-lg font-bold',
                        chargeAmountColor(insuranceBalance)
                      )}
                    >
                      $ {insuranceBalance?.toFixed(2)}
                    </p>
                  </p>
                </div>
              </div>
              <div className="">
                <Button
                  buttonType={ButtonType.primary}
                  cls={`w-[220px] inline-flex px-4 py-2 gap-2 leading-5 ml-2.5`}
                  onClick={async () => {
                    setShowPaymentPostingPopUp(true);
                    setPatientPosting(false);
                  }}
                >
                  <Icon name={'payment'} size={18} />
                  <p className="text-sm">Post Insurance Payment</p>
                </Button>
                <Button
                  buttonType={ButtonType.primary}
                  cls={`w-[220px] inline-flex px-4 py-2 gap-2 leading-5 ml-2.5`}
                  onClick={async () => {
                    setShowCrossoverClaimModal(true);
                  }}
                >
                  <Icon name={'copy'} size={18} />
                  <p className="text-sm">Create Crossover Claim</p>
                </Button>
              </div>
              <div className="mx-1 py-[30px]">
                <div className="h-px w-full bg-gray-200 " />
              </div>
            </div>
            <div className="text-xl font-bold text-gray-500 ">
              {' '}
              Patient Balance
              <div className="inline-flex pb-[20px]">
                <div className="inline-flex">
                  <p className="w-[200px] text-sm  text-gray-500">
                    Patient Responsibility
                    <p
                      className={classNames(
                        'p-1 pt-3 text-lg font-bold text-gray-900'
                      )}
                    >
                      $ {patientAmount?.toFixed(2)}
                    </p>
                  </p>
                  <p className="w-[200px] text-sm  text-gray-500">
                    Patient Adjustment
                    <p
                      className={classNames(
                        'p-1 pt-3 text-lg font-bold',
                        chargeAmountColor(patientAdjustment)
                      )}
                    >
                      $ {patientAdjustment?.toFixed(2)}
                    </p>
                  </p>
                  <p className="w-[200px] text-sm  text-gray-500">
                    Patient Paid
                    <p
                      className={classNames(
                        'p-1 pt-3 text-lg font-bold',
                        chargePaidAmountColor(patientPaid)
                      )}
                    >
                      $ {patientPaid?.toFixed(2)}
                    </p>
                  </p>
                  <p className="w-[200px] text-sm  text-gray-500">
                    Patient Balance
                    <p
                      className={classNames(
                        'p-1 pt-3 text-lg font-bold',
                        chargeAmountColor(patientBalance)
                      )}
                    >
                      $ {patientBalance?.toFixed(2)}
                    </p>
                  </p>
                </div>
              </div>
              <div className="">
                <Button
                  buttonType={ButtonType.primary}
                  cls={`w-[220px] inline-flex px-4 py-2 gap-2 leading-5 ml-2.5`}
                  onClick={async () => {
                    setShowPaymentPostingPopUp(true);
                    setPatientPosting(true);
                  }}
                >
                  <Icon name={'payment'} size={18} />
                  <p className="text-sm">Post Patient Payment</p>
                </Button>
                <Button
                  buttonType={ButtonType.primary}
                  cls={`w-[220px] inline-flex px-4 py-2 gap-2 leading-5 ml-2.5`}
                  onClick={async () => {
                    setShowCrossoverClaimModal(true);
                  }}
                >
                  <Icon name={'copy'} size={18} />
                  <p className="text-sm">Create Crossover Claim</p>
                </Button>
              </div>
            </div>
          </div>
          <div className="h-[550px] w-[450px]  text-right">
            <div className={getTotalBalanceClass('divClassName')}>
              <p className={getTotalBalanceClass('pClassName')}>
                TOTAL CHARGE BALANCE:
              </p>
              <div className="pt-[450px] text-right">
                <p className={getTotalBalanceClass('balanceClassName')}>
                  $ {totalBalance?.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full gap-4  px-7 pt-[25px] pb-[15px]">
          <div className="flex w-full flex-col">
            <div className="h-full">
              <ChargePaymentLedger data={paymentLedgerData} columns={columns} />
            </div>
          </div>
        </div>
      </div>
      <div className="w-full bg-gray-200 ">
        <div className=" py-[24px] pr-[27px]">
          <div className={`gap-4 flex justify-end `}>
            <div>
              <Button
                buttonType={ButtonType.secondary}
                cls={`w-[110px] `}
                onClick={() => {
                  if (isJsonChanged) {
                    setStatusModalState({
                      ...statusModalState,
                      open: true,
                      heading: 'Cancel Confirmation',
                      description: `Are you certain you want to cancel all changes made to this charge? Clicking "Confirm" will result in the loss of all changes.`,
                      statusModalType: StatusModalType.WARNING,
                      showCloseButton: true,
                      okButtonText: 'Confirm',
                      closeButtonText: 'Cancel',
                      confirmActionType: 'closeConfirmation',
                    });
                  } else {
                    onClose();
                  }
                }}
              >
                {' '}
                Close
              </Button>
            </div>
            {isEditMode && (
              <div>
                <Button
                  buttonType={ButtonType.primary}
                  cls={` `}
                  onClick={() => {
                    setStatusModalState({
                      ...statusModalState,
                      open: true,
                      heading: 'Save Confirmation',
                      description: `Are you sure you wish to save the changes made to this charge?`,
                      statusModalType: StatusModalType.WARNING,
                      showCloseButton: true,
                      okButtonText: 'Confirm',
                      closeButtonText: 'Cancel',
                      confirmActionType: 'saveConfirmation',
                    });
                  }}
                >
                  {' '}
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
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
    </div>
  );
}
