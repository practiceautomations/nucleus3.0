import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { MultiValue, SingleValue } from 'react-select';
import { v4 as uuidv4 } from 'uuid';

import GridModal from '@/components/Grid/Modal';
import Icon from '@/components/Icon';
import type { IcdData, NdcData } from '@/screen/createClaim';
import {
  addToastNotification,
  fetchBatchDocumentDataRequest,
  fetchBatchDocumentPageDataRequest,
  fetchBatchNumberDataRequest,
  fetchCPTSearchDataRequest,
  saveCptNdcRequest,
} from '@/store/shared/actions';
import {
  addCharges,
  createClaimNote,
  createNDCRule,
  fetchPostingDate,
  getChargesFee,
  getDuplicateWarning,
  getNDCDataByCPT,
  getRevenueCodesForCPTData,
  getSearchRevenueCodes,
} from '@/store/shared/sagas';
import {
  getBatchDocumentDataSelector,
  getBatchDocumentPageDataSelector,
  getBatchNumberDataSelector,
  getCPTNdcDataSelector,
  getCPTSearchDataSelector,
  getLookupDropdownsDataSelector,
} from '@/store/shared/selectors';
import type {
  BatchNumberCriteria,
  ChargeFeeOutput,
  CPTSearchCriteria,
  GetDuplicateWarningCriteria,
  PostingDateCriteria,
  RevenueCodesData,
  SaveChargeRequestPayload,
  SaveCptNdcRequestPayload,
} from '@/store/shared/types';
import { ToastType } from '@/store/shared/types';
import { IconColors } from '@/utils/ColorFilters';
import { DateToStringPipe } from '@/utils/dateConversionPipes';
import useOnceEffect from '@/utils/useOnceEffect';

import AppDatePicker from '../AppDatePicker';
import Button, { ButtonType } from '../Button';
import CheckBox from '../CheckBox';
import CloseButton from '../CloseButton';
import InfoToggle from '../InfoToggle';
import InputField from '../InputField';
import InputFieldAmount from '../InputFieldAmount';
import type { MultiSelectDropDownDataType } from '../MultiSelectDropDown';
import type { MultiSelectGridDropdownDataType } from '../MultiSelectGridDropdown';
import MultiSelectGridDropdown from '../MultiSelectGridDropdown';
import type { SingleSelectDropDownDataType } from '../SingleSelectDropDown';
import type { SingleSelectGridDropdownDataType } from '../SingleSelectGridDropdown';
import SingleSelectGridDropDown from '../SingleSelectGridDropdown';
import type { StatusModalProps } from '../StatusModal';
import StatusModal, { StatusModalType } from '../StatusModal';
import AppTable, { AppTableCell, AppTableRow } from '../Table';
import TextArea from '../TextArea';

export interface AddChargeProp {
  dxCodeDropdownData: MultiSelectDropDownDataType[];
  practiceID: number | undefined;
  groupID: number | undefined;
  onClose: () => void;
  claimID: number;
  icdRows: IcdData[];
  facilityID: number | undefined;
  insuranceID: number | undefined;
  totalChargesCount: number;
  selectedPatientdob?: string;
  medicalCaseID?: number;
  patientID?: number;
}
export default function AddCharge({
  dxCodeDropdownData,
  practiceID,
  groupID,
  facilityID,
  insuranceID,
  icdRows,
  onClose,
  claimID,
  totalChargesCount,
  selectedPatientdob,
  medicalCaseID,
  patientID,
}: AddChargeProp) {
  const [selectedChargePOS, setSelectedChargePOS] = useState<
    SingleValue<SingleSelectGridDropdownDataType> | undefined
  >();
  const [batchSearch, setBatchSearch] = useState<BatchNumberCriteria>({
    searchValue: '',
    clientID: null,
  });
  const [selectedChargeFee, setSelectedChargeFee] = useState<number>();
  const lookupsData = useSelector(getLookupDropdownsDataSelector);
  const [chargeUnits, setChargeUnits] = useState<number | undefined>(1);
  const [selectedCpt, setSelectedCpt] = useState<
    SingleValue<SingleSelectGridDropdownDataType> | undefined
  >(undefined);
  const [cptSearch, setCptSearch] = useState<CPTSearchCriteria>({
    searchValue: '',
    clientID: null,
  });
  const [ndcCode, setNDCCode] = useState<string | ''>();
  const cptSearchData = useSelector(getCPTSearchDataSelector);
  const [chargesFromDOS, setChargesFromDOS] = useState<Date | null>();
  const [chargesToDOS, setChargesToDOS] = useState<Date | null>();
  const [selectedModifier1, setSelectedModifier1] = useState<
    SingleValue<SingleSelectGridDropdownDataType> | undefined
  >();
  const [chargeNdcUnits, setChargeNdcUnits] = useState<number | undefined>(1);
  const [chargeNdcDescription, setChargeNdcDescription] = useState<
    string | undefined
  >();
  const [chargeFee, setChargeFee] = useState<ChargeFeeOutput>();
  const [batchDocumentPage, setbatchDocumentPage] = useState<
    SingleValue<SingleSelectGridDropdownDataType> | undefined
  >(undefined);
  const [postingDate, setPostingDate] = useState<Date | null>(new Date());
  const batchSearchData = useSelector(getBatchNumberDataSelector);
  const [batchNumber, setbatchNumber] = useState<
    SingleValue<SingleSelectGridDropdownDataType> | undefined
  >(undefined);
  const dispatch = useDispatch();
  const [dosageForm, setDosageForm] = useState<
    SingleValue<SingleSelectGridDropdownDataType> | undefined
  >(undefined);
  const [selectedModifier2, setSelectedModifier2] = useState<
    SingleValue<SingleSelectGridDropdownDataType> | undefined
  >();
  const [selectedModifier3, setSelectedModifier3] = useState<
    SingleValue<SingleSelectGridDropdownDataType> | undefined
  >();
  const [ndcRow, setndcRow] = useState<NdcData[] | undefined>();
  const [selectedModifier4, setSelectedModifier4] = useState<
    SingleValue<SingleSelectGridDropdownDataType> | undefined
  >();
  const [batchDocument, setbatchDocument] = useState<
    SingleValue<SingleSelectGridDropdownDataType> | undefined
  >(undefined);
  const chargeBatchHeader = ['Batch #', 'Posting Date', 'Document', 'Page'];
  const batchDocumentData = useSelector(getBatchDocumentDataSelector);
  const batchDocumentPageData = useSelector(getBatchDocumentPageDataSelector);
  const [dxCode, setdxCode] = useState<
    MultiValue<MultiSelectGridDropdownDataType> | []
  >([]);
  const [selectedNdc, setselectedNdc] = useState<string | null>();
  const [insResp, setInsResp] = useState<number | undefined>();
  const [patResp, setPatResp] = useState<number | undefined>();
  const [comment, setComment] = useState<string | undefined>();
  const cptNdcData = useSelector(getCPTNdcDataSelector);
  const [statusModalState, setStatusModalState] = useState<StatusModalProps>({
    open: false,
    heading: '',
    description: '',
    okButtonText: 'Ok',
    statusModalType: StatusModalType.ERROR,
    showCloseButton: false,
    closeOnClickOutside: false,
  });
  const ndcTableHeader = [
    '',
    'NDC Code',
    'Units',
    'Dosage From',
    'Service Description',
  ];
  useOnceEffect(() => {
    if (groupID !== null) {
      const data = {
        clientID: groupID || null,
        searchValue: batchSearch.searchValue,
      };
      dispatch(fetchBatchNumberDataRequest(data));
    }
  }, [batchSearch.searchValue, groupID]);
  useOnceEffect(() => {
    if (batchNumber !== undefined) {
      setbatchDocument(undefined);
      const obj = {
        chargeBatchID: batchNumber ? batchNumber?.id : undefined,
        getInactive: false,
      };
      dispatch(fetchBatchDocumentDataRequest(obj));
    }
  }, [batchNumber]);
  useOnceEffect(() => {
    if (batchDocument !== undefined) {
      setbatchDocumentPage(undefined);
      const obj = {
        documentID: batchDocument ? batchDocument?.id : undefined,
      };
      dispatch(fetchBatchDocumentPageDataRequest(obj));
    }
  }, [batchDocument]);
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
  const getNDCPopUpData = async (value: string) => {
    const ndcData = {
      cptCode: value,
      practiceID: practiceID || null,
    };
    const res = await getNDCDataByCPT(ndcData);
    if (res) {
      setndcRow(
        res?.map((a) => ({
          ndcRowsData: a,
          isChecked: false,
          isDisabled: true,
        }))
      );
    }
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
    if (practiceID === null) {
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
      practiceID: practiceID || null,
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
  const getChargesFeeData = async () => {
    if (selectedCpt) {
      const obj = {
        cptCode: selectedCpt.value,
        modifierCode: selectedModifier1 ? selectedModifier1.value : null,
        facilityID: facilityID || null,
        patientInsuranceID: insuranceID || null,
        medicalCaseID: medicalCaseID || null,
      };
      const res = await getChargesFee(obj);
      if (res) {
        setChargeFee(res);
      }
    }
  };
  useEffect(() => {
    getChargesFeeData();
  }, [selectedModifier1, selectedCpt]);
  useEffect(() => {
    if (chargeUnits) {
      const calculatedFee = chargeFee ? chargeFee.fee * chargeUnits : 0;
      setSelectedChargeFee(calculatedFee);
    } else {
      setSelectedChargeFee(chargeFee ? chargeFee.fee : 0);
    }
    if (insuranceID) {
      setInsResp(chargeFee ? chargeFee.fee * (chargeUnits || 1) : 0);
      setPatResp(0);
    } else {
      setPatResp(chargeFee ? chargeFee.fee * (chargeUnits || 1) : 0);
      setInsResp(0);
    }
  }, [chargeFee, chargeUnits]);
  const updateNdcRule = () => {
    const checkSelectedRow = ndcRow?.filter((a) => a.isChecked);
    if (checkSelectedRow && checkSelectedRow.length === 0) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Atleast one NDC rule should be selected.',
          toastType: ToastType.ERROR,
        })
      );
      return;
    }
    let updateNdcJson: SaveCptNdcRequestPayload = {
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
    updateNdcJson = {
      ...updateNdcJson,
      cptNdcCrosswalkID:
        checkSelectedRow &&
        checkSelectedRow[0] &&
        checkSelectedRow[0]?.ndcRowsData
          ? checkSelectedRow[0]?.ndcRowsData.id
          : null,
      practiceID: practiceID || null,
      cptCode:
        checkSelectedRow &&
        checkSelectedRow[0] &&
        checkSelectedRow[0]?.ndcRowsData
          ? checkSelectedRow[0]?.ndcRowsData.cptCode
          : null,
      ndcNumber:
        checkSelectedRow &&
        checkSelectedRow[0] &&
        checkSelectedRow[0]?.ndcRowsData
          ? checkSelectedRow[0]?.ndcRowsData.ndcCode
          : null,
      ndcUnitQualifierID:
        checkSelectedRow &&
        checkSelectedRow[0] &&
        checkSelectedRow[0]?.ndcRowsData
          ? checkSelectedRow[0]?.ndcRowsData.ndcUnitQualifierID
          : undefined,
      ndcUnit:
        checkSelectedRow &&
        checkSelectedRow[0] &&
        checkSelectedRow[0]?.ndcRowsData
          ? checkSelectedRow[0]?.ndcRowsData.units
          : null,
      icd1: null,
      icd2: null,
      serviceDescription:
        checkSelectedRow &&
        checkSelectedRow[0] &&
        checkSelectedRow[0]?.ndcRowsData
          ? checkSelectedRow[0]?.ndcRowsData.serviceDescription
          : null,
    };
    const isValid = createNdcValidation(updateNdcJson);
    if (isValid) {
      dispatch(saveCptNdcRequest(updateNdcJson));
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
  const chargesDataValidation = (chargesData: SaveChargeRequestPayload) => {
    let isValid = true;
    if (chargesData.toDOS === null || chargesData.fromDOS === null) {
      isValid = false;
    }
    if (chargesData.chargePostingDate === null) {
      isValid = false;
    }
    if (chargesData.cptCode === '') {
      isValid = false;
    }
    if (chargesData.units === null) {
      isValid = false;
    }
    if (
      chargesData.icd1 === null ||
      comment === null ||
      comment === undefined
    ) {
      isValid = false;
    }
    const todaysDate = new Date();
    todaysDate.setHours(0, 0, 0, 0);

    const dosFrom = chargesData.fromDOS ? new Date(chargesData.fromDOS) : null;
    const dosTo = chargesData.toDOS ? new Date(chargesData.toDOS) : null;
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
    const patDOB = selectedPatientdob ? new Date(selectedPatientdob) : null;
    if (patDOB) {
      patDOB.setHours(0, 0, 0, 0);
    }
    if (
      patDOB !== null &&
      ((dosFrom && dosFrom < patDOB) || (dosTo && dosTo < patDOB))
    ) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'DOS cannot be smaller than patient DOB',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    const validInsResp = chargesData.insuranceAmount || 0;
    const validPatResp = chargesData.patientAmount || 0;
    const validValue = validInsResp + validPatResp;
    if (validValue > 0 && validValue !== chargesData.fee) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Please select valid fee',
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (
      !chargesData.fromDOS ||
      !chargesData.toDOS ||
      !chargesData.cptCode ||
      !chargesData.placeOfServiceID ||
      !chargesData.chargePostingDate ||
      !chargesData.units ||
      !chargesData.icd1 ||
      (!chargesData.revenueCode && medicalCaseID)
    ) {
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
      isValid = false;
    }
    return isValid;
  };
  const postingDateCriteria: PostingDateCriteria = {
    id: claimID,
    type: 'claim',
    postingDate: DateToStringPipe(postingDate, 1),
  };
  const [selectedRevenueCode, setSelectedRevenueCode] =
    useState<SingleSelectDropDownDataType>();
  const [revenueCodeData, setRevenueCodeData] = useState<RevenueCodesData[]>(
    []
  );

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
  const getRevenueCodesForCPT = async () => {
    if (selectedCpt) {
      const res = await getRevenueCodesForCPTData(
        practiceID || null,
        insuranceID || null,
        selectedCpt.value
      );
      if (res && res?.value) {
        getRevenueCodeSearchData(res?.value);
      }
    }
  };

  useEffect(() => {
    getRevenueCodesForCPT();
  }, [selectedCpt]);

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
      claimID,
      groupID,
      sortOrder: totalChargesCount + 1,
      fromDOS: chargesFromDOS ? DateToStringPipe(chargesFromDOS, 1) : null,
      toDOS: chargesToDOS ? DateToStringPipe(chargesToDOS, 1) : null,
      cptCode: selectedCpt ? selectedCpt.value : '',
      units: chargeUnits || null,
      mod1: selectedModifier1 ? selectedModifier1.value : '',
      mod2: selectedModifier2 ? selectedModifier2.value : '',
      mod3: selectedModifier3 ? selectedModifier3.value : '',
      mod4: selectedModifier4 ? selectedModifier4.value : '',
      placeOfServiceID: selectedChargePOS ? selectedChargePOS.id : null,
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
      fee: selectedChargeFee || null,
      insuranceAmount: insResp || null,
      patientAmount: patResp || null,
      chargeBatchID: batchNumber ? batchNumber?.id : undefined,
      chargePostingDate: postingDate ? DateToStringPipe(postingDate, 1) : null,
      systemDocumentID: batchDocument ? batchDocument.id : null,
      pageNumber: batchDocumentPage ? batchDocumentPage.id : null,
      pointers: pointerStr,
      revenueCode: selectedRevenueCode
        ? revenueCodeData.filter((m) => m.id === selectedRevenueCode.id)[0]
            ?.code || ''
        : '',
    };
    const postingDateRes = await fetchPostingDate(postingDateCriteria);
    if (postingDateRes && postingDateRes.postingCheck === false) {
      setStatusModalState({
        ...statusModalState,
        open: true,
        heading: 'Error',
        description: `${postingDateRes.message}`,
        statusModalType: StatusModalType.ERROR,
      });
      return;
    }
    const isValid = chargesDataValidation(chargeJson);
    if (isValid) {
      const res = await addCharges(chargeJson);
      if (!res) {
        setStatusModalState({
          ...statusModalState,
          open: true,
          heading: 'Error',
          description:
            'A system error prevented the Saved Search to be created. Please try again.',
          okButtonText: 'Ok',
          statusModalType: StatusModalType.ERROR,
          showCloseButton: false,
          closeOnClickOutside: false,
        });
      } else {
        onClose();
        const noteData = {
          noteID: null,
          lineItemID: claimID,
          noteTypeID: 57,
          comment,
          active: true,
          alert: false,
        };
        await createClaimNote(noteData);
      }
    }
  };
  const checkDuplicateWarning = async (obj: GetDuplicateWarningCriteria) => {
    const res = await getDuplicateWarning(obj);
    if (res && res.length && res[0]?.id === 3) {
      setStatusModalState({
        ...statusModalState,
        open: true,
        heading: 'Duplicate Charge Warning!',
        description: res[0]?.message,
        okButtonText: 'Save Anyway',
        closeButtonText: 'Close',
        confirmType: 'dupe_warning',
        statusModalType: StatusModalType.WARNING,
        showCloseButton: true,
        closeOnClickOutside: false,
      });
      return false;
    }

    return !!res;
  };
  useOnceEffect(() => {
    if (cptSearch.searchValue !== '') {
      dispatch(fetchCPTSearchDataRequest(cptSearch));
    }
  }, [cptSearch.searchValue]);

  useEffect(() => {
    if (selectedCpt && practiceID && insuranceID) {
      getRevenueCodesForCPT();
    }
  }, [selectedCpt, practiceID, insuranceID]);

  return (
    <div
      className="inline-flex flex-col items-center justify-start space-y-6 rounded-lg bg-gray-100 shadow"
      style={{ width: 1232, height: 638 }}
    >
      <div
        className="flex flex-col items-start justify-start space-y-1 pt-6"
        style={{ width: 1184, height: 76 }}
      >
        <div
          className="inline-flex items-center justify-between space-x-96"
          style={{ width: 1184, height: 28 }}
        >
          <div className="flex items-center justify-start space-x-2">
            <p className="text-xl font-bold leading-7 text-gray-700">
              Add New Charge
            </p>
          </div>
          <CloseButton onClick={onClose} />
        </div>
        <div
          className="inline-flex items-center justify-center pt-2.5 pb-2"
          style={{ width: 1184, height: 20 }}
        >
          <div className="bg-gray-300" style={{ width: 1184, height: 1 }} />
        </div>
      </div>
      <StatusModal
        open={statusModalState.open}
        heading={statusModalState.heading}
        description={statusModalState.description}
        okButtonText={statusModalState.okButtonText}
        closeButtonText={statusModalState.closeButtonText}
        statusModalType={statusModalState.statusModalType}
        showCloseButton={statusModalState.showCloseButton}
        closeOnClickOutside={statusModalState.closeOnClickOutside}
        onChange={() => {
          if (statusModalState.confirmType === 'dupe_warning') {
            saveChargesWithClaim();
          }
          setStatusModalState({
            ...statusModalState,
            open: false,
          });
        }}
        onClose={() => {
          setStatusModalState({
            ...statusModalState,
            open: false,
          });
        }}
      />
      <div
        className="flex flex-wrap items-start justify-start gap-4 px-6"
        // style={{ width: 1232, height: 62 }}
      >
        <div className="inline-flex w-32 flex-col items-start justify-start space-y-1">
          <div className="flex gap-1">
            <p className="text-sm font-medium leading-tight text-gray-700">
              DoS - From*
            </p>
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
          <AppDatePicker
            placeholderText="From"
            cls="!whitespace-nowrap mr-3"
            onChange={(date) => setChargesFromDOS(date)}
            selected={chargesFromDOS}
          />
        </div>
        <div className="inline-flex w-32 flex-col items-start justify-start space-y-1">
          <div className="flex gap-1">
            <p className="text-sm font-medium leading-tight text-gray-700">
              DoS - To*
            </p>
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
          <AppDatePicker
            placeholderText="From"
            cls="!whitespace-nowrap mr-3"
            onChange={(date) => setChargesToDOS(date)}
            selected={chargesToDOS}
          />
        </div>
        <div className=" inline-flex flex-col items-start justify-start space-y-1">
          <div className="flex gap-1">
            <p className="text-sm font-medium leading-tight text-gray-700">
              CPT Code*
            </p>
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
          <div className="h-[38px] w-[300px]">
            <SingleSelectGridDropDown
              placeholder=""
              showSearchBar={true}
              showDropdownIcon={false}
              disabled={false}
              data={
                cptSearchData?.length !== 0
                  ? (cptSearchData as SingleSelectGridDropdownDataType[])
                  : []
              }
              selectedValue={selectedCpt}
              onSelect={(value) => {
                if (value) {
                  setSelectedCpt(value);
                  setselectedNdc('');
                  getNDCPopUpData(value.value);
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
        {medicalCaseID && (
          <div className=" inline-flex flex-col items-start justify-start space-y-1">
            <label className="text-sm font-medium leading-tight text-gray-700">
              Revenue Code*
            </label>
            <div className="h-[38px]  w-[300px]">
              <SingleSelectGridDropDown
                placeholder=""
                showSearchBar={true}
                // showDropdownIcon={false}
                disabled={false}
                data={
                  revenueCodeData?.length !== 0
                    ? (revenueCodeData as SingleSelectDropDownDataType[])
                    : []
                }
                selectedValue={selectedRevenueCode}
                onSelect={(value) => {
                  if (value) {
                    setSelectedRevenueCode({ ...value });
                  }
                }}
                onSearch={(value) => {
                  getRevenueCodeSearchData(value);
                }}
              />
            </div>
          </div>
        )}
        <div className="inline-flex flex-col  items-start justify-start">
          <div className="flex gap-1">
            <p className="text-sm font-medium leading-tight text-gray-700">
              Units*
            </p>
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
          <div className=" h-[38px] w-[64px]">
            <InputField
              value={chargeUnits}
              type="text"
              cls="!pl-[1px] !pr-[1px] !pt-0 !pb-0"
              inputCls="!pl-[9px] !pr-[9px] !pt-0 !pb-0"
              pattern="[0-9]*"
              onChange={(evt) => {
                if (evt.target.value !== '') {
                  setChargeUnits(Number(evt.target.value));
                } else {
                  setChargeUnits(undefined);
                }
              }}
            />
          </div>
        </div>

        <div className="inline-flex flex-col items-start justify-start space-y-1">
          <div className="flex gap-1">
            <p className="text-sm font-medium leading-tight text-gray-700">
              Modifiers
            </p>
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
          <div className="inline-flex items-start justify-start space-x-2">
            <div className="flex gap-x-2">
              <div className="flex gap-x-2">
                <div className="h-[38px] w-[45px]">
                  <SingleSelectGridDropDown
                    placeholder=""
                    showSearchBar={true}
                    data={
                      lookupsData?.modifiers
                        ? (lookupsData?.modifiers as SingleSelectDropDownDataType[])
                        : []
                    }
                    selectedValue={selectedModifier1}
                    onSelect={(e) => {
                      setSelectedModifier1(e);
                    }}
                    showDropdownIcon={false}
                  />
                </div>
                <div className="h-[38px] w-[45px]">
                  <SingleSelectGridDropDown
                    placeholder=""
                    showSearchBar={true}
                    data={
                      lookupsData?.modifiers
                        ? (lookupsData?.modifiers as SingleSelectDropDownDataType[])
                        : []
                    }
                    selectedValue={selectedModifier2}
                    onSelect={(e) => {
                      setSelectedModifier2(e);
                    }}
                    showDropdownIcon={false}
                  />
                </div>
                <div className="h-[38px] w-[45px]">
                  <SingleSelectGridDropDown
                    placeholder=""
                    showSearchBar={true}
                    data={
                      lookupsData?.modifiers
                        ? (lookupsData?.modifiers as SingleSelectDropDownDataType[])
                        : []
                    }
                    selectedValue={selectedModifier3}
                    onSelect={(e) => {
                      setSelectedModifier3(e);
                    }}
                    showDropdownIcon={false}
                  />
                </div>
                <div className="h-[38px] w-[45px]">
                  <SingleSelectGridDropDown
                    placeholder=""
                    showSearchBar={true}
                    data={
                      lookupsData?.modifiers
                        ? (lookupsData?.modifiers as SingleSelectDropDownDataType[])
                        : []
                    }
                    selectedValue={selectedModifier4}
                    onSelect={(e) => {
                      setSelectedModifier4(e);
                    }}
                    showDropdownIcon={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="inline-flex  flex-col items-start justify-start space-y-1">
          <div className="flex gap-1">
            <p className="text-sm font-medium leading-tight text-gray-700">
              Place of Service*
            </p>
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
          <div className="h-[38px] w-[160px]">
            <SingleSelectGridDropDown
              placeholder=""
              showSearchBar={true}
              data={
                lookupsData?.placeOfService
                  ? (lookupsData?.placeOfService as SingleSelectDropDownDataType[])
                  : []
              }
              selectedValue={selectedChargePOS}
              isClearable={false}
              onSelect={(e) => {
                setSelectedChargePOS(e);
              }}
            />
          </div>
        </div>
        <div className="inline-flex  flex-col items-start justify-start space-y-1">
          <p className="text-sm font-medium leading-tight text-gray-700">
            CLIA Number
          </p>
          <div className="mb-2 h-[38px] w-[145px]">
            <InputField disabled={true} />
          </div>
        </div>

        <div className="inline-flex flex-col items-start justify-start space-y-1">
          <div className="flex gap-1">
            <p className="text-sm font-medium leading-tight text-gray-700">
              DX*
            </p>
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
          <div className="w-[323px]">
            <MultiSelectGridDropdown
              placeholder=""
              data={dxCodeDropdownData}
              selectedValue={dxCode}
              showSearchBar={true}
              cls="min-w-[160px]"
              onSelect={(e) => {
                if (e && e.length < 5) setdxCode(e);
              }}
              onSearch={() => {}}
              appendTextSeparator={'|'}
            />
          </div>
        </div>
        {selectedCpt &&
          (selectedCpt.value[0] === 'J' ||
            (selectedCpt.value[0] === '9' && selectedCpt.value[1] === '0')) && (
            <div className="inline-flex flex-col items-start justify-start space-y-1">
              <div className="flex gap-1">
                <p className="text-sm font-medium leading-tight text-gray-700">
                  NDC Codes
                </p>
                <InfoToggle
                  position="right"
                  text={
                    <div>
                      {' '}
                      CMS1500 : BOX24-A shaded area <br /> X12 : LOOP 2410 -
                      CTP105
                    </div>
                  }
                />
              </div>
              <div className="w-[160px]">
                {ndcRow && ndcRow.length > 0 ? (
                  <GridModal
                    icon={
                      <span
                        className="contents"
                        onClick={() => {
                          updateNdcRule();
                        }}
                      >
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
                                <AppTableCell>{header}</AppTableCell>
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
                              cls={ndcRowData.isChecked ? 'bg-cyan-50' : ''}
                            >
                              <AppTableCell component="th">
                                <div className=" w-[16px]">
                                  <CheckBox
                                    id="ndcCheckbox"
                                    checked={ndcRowData.isChecked}
                                    onChange={() =>
                                      onNdcChange(ndcRowData.ndcRowsData?.id)
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
                                                row2.ndcRowsData.units = evt
                                                  .target.value
                                                  ? Number(evt.target.value)
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
                                      ndcRowData.ndcRowsData?.serviceDescription
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
                    icon={
                      <Button
                        buttonType={ButtonType.primary}
                        onClick={() => createNdcRule(selectedCpt?.value || '')}
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
                                      CMS1500 : BOX24-A shaded area <br /> X12 :
                                      LOOP 2410 - CTP105
                                    </div>
                                  }
                                />
                              </div>{' '}
                            </AppTableCell>
                            <AppTableCell>
                              <div className="flex gap-1">
                                Units
                                <InfoToggle
                                  position="right"
                                  text={
                                    <div>
                                      {' '}
                                      CMS1500 : BOX24-A shaded area - X12 : LOOP
                                      2410 - CTP104
                                    </div>
                                  }
                                />
                              </div>
                            </AppTableCell>
                            <AppTableCell>Dosage Form</AppTableCell>
                            <AppTableCell>
                              <div className="flex gap-1">
                                Service Description
                                <InfoToggle
                                  position="right"
                                  text={
                                    <div>
                                      {' '}
                                      CMS1500 : BOX24-A shaded area <br /> X12 :
                                      LOOP 2400 - SV101-7
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
                                      setChargeNdcUnits(undefined);
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
                                    setChargeNdcDescription(evt.target.value);
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
        <div className="inline-flex flex-col items-start justify-start space-y-1">
          <div className="flex gap-1">
            <p className="text-sm font-medium leading-tight text-gray-700">
              Fee*
            </p>
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
          <InputFieldAmount
            disabled={false}
            value={selectedChargeFee}
            showCurrencyName={false}
            onChange={(evt) => {
              if (evt.target.value !== '') {
                setSelectedChargeFee(Number(evt.target.value));
              } else {
                setSelectedChargeFee(undefined);
              }
            }}
          />
        </div>
        <div className="inline-flex flex-col items-start justify-start space-y-1">
          <p className="text-sm font-medium leading-tight text-gray-700">
            Ins. Resp.
          </p>
          <InputFieldAmount
            disabled={false}
            showCurrencyName={false}
            value={insResp}
            onChange={(evt) => {
              if (evt.target.value !== '') {
                setInsResp(Number(evt.target.value));
              } else {
                setInsResp(undefined);
              }
            }}
          />
        </div>
        <div className="inline-flex flex-col items-start justify-start space-y-1">
          <p className="text-sm font-medium leading-tight text-gray-700">
            Pat.Resp.
          </p>
          <InputFieldAmount
            disabled={false}
            showCurrencyName={false}
            value={patResp}
            onChange={(evt) => {
              if (evt.target.value !== '') {
                setPatResp(Number(evt.target.value));
              } else {
                setPatResp(undefined);
              }
            }}
          />
        </div>
        <div className="inline-flex flex-1 flex-col items-start justify-start space-y-1">
          <p className="text-sm font-medium leading-tight text-gray-700">
            Charge Batch
          </p>
          <div className="w-[160px]">
            <GridModal
              icon={<Icon name={'plus1'} size={18} color={IconColors.GRAY} />}
              cls="w-10 p-2 bg-white shadow border rounded-md border-gray-300"
              txt={'Create New Charge Batch'}
              value={batchNumber ? batchNumber.value : ''}
              clsDiv="px-4 py-2"
            >
              <AppTable
                renderHead={
                  <>
                    <AppTableRow>
                      {chargeBatchHeader.map((header) => (
                        <>
                          <AppTableCell>{header}</AppTableCell>
                        </>
                      ))}
                      <AppTableCell cls="bg-cyan-50">Action</AppTableCell>
                    </AppTableRow>
                  </>
                }
                renderBody={
                  <>
                    <AppTableRow>
                      <AppTableCell component="th">
                        <div className=" w-[160px]">
                          <SingleSelectGridDropDown
                            placeholder=""
                            showSearchBar={true}
                            data={
                              batchSearchData?.length !== 0
                                ? (batchSearchData as SingleSelectGridDropdownDataType[])
                                : []
                            }
                            selectedValue={batchNumber}
                            onSelect={(e: any) => {
                              if (e) {
                                setbatchNumber(e);
                                setPostingDate(e.postingDate);
                              }
                            }}
                            onSearch={(value) => {
                              setBatchSearch({
                                ...batchSearch,
                                searchValue: value,
                              });
                            }}
                          />
                        </div>
                      </AppTableCell>
                      <AppTableCell>
                        <div className="w-[160px]">
                          <AppDatePicker
                            placeholderText="From"
                            cls="!whitespace-nowrap mr-3"
                            onChange={(date) => setPostingDate(date)}
                            selected={postingDate}
                          />
                        </div>
                      </AppTableCell>
                      <AppTableCell>
                        <div className="w-[160px]">
                          <SingleSelectGridDropDown
                            placeholder=""
                            showSearchBar={false}
                            data={
                              batchDocumentData?.length !== 0
                                ? (batchDocumentData as SingleSelectGridDropdownDataType[])
                                : []
                            }
                            selectedValue={batchDocument}
                            onSelect={(e) => {
                              setbatchDocument(e);
                            }}
                          />
                        </div>
                      </AppTableCell>
                      <AppTableCell>
                        <div className="flex gap-x-2">
                          <div className="h-[38px] w-[40px]">
                            <SingleSelectGridDropDown
                              placeholder=""
                              showSearchBar={false}
                              data={
                                batchDocumentPageData?.length !== 0
                                  ? (batchDocumentPageData as SingleSelectGridDropdownDataType[])
                                  : []
                              }
                              selectedValue={batchDocumentPage}
                              onSelect={(e) => {
                                setbatchDocumentPage(e);
                              }}
                              showDropdownIcon={false}
                            />
                          </div>
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
          </div>
        </div>
      </div>

      <div
        className="inline-flex items-center justify-center pb-2"
        style={{ width: 1184, height: 20 }}
      >
        <div className="bg-gray-300" style={{ width: 1184, height: 1 }} />
      </div>
      <div
        className="flex flex-col items-start justify-start space-y-4"
        style={{ width: 1184, height: 200 }}
      >
        <div className="flex gap-1">
          <p className="text-base font-bold leading-normal text-gray-700">
            Why are you adding a new charge?*
          </p>
          <InfoToggle
            position="right"
            text={
              <div>
                {' '}
                CMS1500 : BOX24-A shaded area <br /> X12 : LOOP 2400 - NTE02
                (DCP)
              </div>
            }
          />
        </div>
        <TextArea
          id="textarea"
          value={comment}
          cls="!w-[1184px] text-sm leading-tight text-gray-500 flex-1 h-full px-3 py-2 bg-white shadow border rounded-md border-gray-300"
          placeholder={'Click here to write note'}
          onChange={(e) => {
            setComment(e.target.value);
          }}
        />
      </div>

      <div
        className="inline-flex items-center justify-center rounded-b-lg bg-gray-200 py-6"
        style={{ width: 1232, height: 86 }}
      >
        <div
          className="flex items-center justify-end space-x-4 px-7"
          style={{ width: 1232, height: 38 }}
        >
          <Button
            buttonType={ButtonType.secondary}
            cls={`inline-flex px-4 py-2 gap-2 leading-5`}
            onClick={onClose}
          >
            <p className="text-sm font-medium leading-tight text-gray-700">
              Cancel
            </p>
          </Button>

          <Button
            buttonType={ButtonType.primary}
            cls={`inline-flex px-4 py-2 gap-2 leading-5`}
            onClick={async () => {
              const isNotDuplicate = await checkDuplicateWarning({
                practiceID: null,
                patientID: patientID || null,
                patientFirstName: '',
                patientLastName: '',
                patientDateOfBirth: '',
                dos: '',
                cpt: selectedCpt?.value || '',
                checkDuplicateType: 'Charge',
                chargeDOS: chargesFromDOS?.toISOString().split('T')[0] || '',
              });
              if (isNotDuplicate) {
                saveChargesWithClaim();
              }
            }}
          >
            <p className="text-sm font-medium leading-tight">
              Add Charge to Claim
            </p>
          </Button>
        </div>
      </div>
    </div>
  );
}
