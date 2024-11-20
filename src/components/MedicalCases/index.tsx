import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { getselectdWorkGroupsIDsSelector } from '@/store/chrome/selectors';
import type { ProvidersData } from '@/store/chrome/types';
import {
  addToastNotification,
  fetchPatientInsranceDataRequest,
  fetchReferringProviderDataRequest,
} from '@/store/shared/actions';
import {
  addMedicalCase,
  getMedicalCaseDetailByID,
  getMedicalCaseLookups,
  icdSearchRequest,
  searchPatientAsyncAPI,
  updateMedicalCase,
} from '@/store/shared/sagas';
import {
  getFacilityDataSelector,
  getPatientInsuranceDataSelector,
  getProviderDataSelector,
  getReferringProviderDataSelector,
} from '@/store/shared/selectors';
import type {
  ICDSearchOutput,
  PatientSearchOutput,
} from '@/store/shared/types';
import {
  type DropdownLookup,
  type MedicalCaseLookup,
  type MedicalCaseModalData,
  type PatientInsuranceData,
  type ReferringProviderData,
  ToastType,
} from '@/store/shared/types';
import { DateToStringPipe } from '@/utils/dateConversionPipes';

import type { FieldSelectionDropdownDataType } from '../FieldSelectionDropdown';
import FieldSelectionDropdown from '../FieldSelectionDropdown';
import AppDatePicker from '../UI/AppDatePicker';
import Button, { ButtonType } from '../UI/Button';
// eslint-disable-next-line import/no-cycle
import ClaimSearchGridPopup from '../UI/ClaimSearchGridPopup';
import CloseButton from '../UI/CloseButton';
import InputField from '../UI/InputField';
import SectionHeading from '../UI/SectionHeading';
import type { SingleSelectDropDownDataType } from '../UI/SingleSelectDropDown';
import SingleSelectDropDown from '../UI/SingleSelectDropDown';
import StatusModal, { StatusModalType } from '../UI/StatusModal';

export interface MedicalCaseProps {
  onClose: () => void;
  groupID: number | undefined;
  selectedPatientID: number | null;
  medicalCaseID: number | null;
  isViewMode: boolean;
}

export default function MedicalCase({
  onClose,
  groupID,
  selectedPatientID,
  isViewMode = false,
  medicalCaseID = null,
}: MedicalCaseProps) {
  const dispatch = useDispatch();
  const [medicalCaseLookupsData, setMedicalCaseLookupsData] =
    useState<MedicalCaseLookup | null>(null);
  const getMedicalCaseAllLookups = async () => {
    const res = await getMedicalCaseLookups();
    setMedicalCaseLookupsData(res);
  };
  const [selectedPatientIDState, setSelectedPatientIDState] =
    useState<number>();
  useEffect(() => {
    getMedicalCaseAllLookups();
    if (selectedPatientID) {
      setSelectedPatientIDState(selectedPatientID);
    }
  }, [selectedPatientID]);
  const [headingCollapse, setHeadingCollapse] = useState<{
    isCollapsePatientInfo: boolean;
    isCollapseCondition: boolean;
    isCollapseOccurance: boolean;
    isCollapseValue: boolean;
    isCollapseDiagnosis: boolean;
    isCollapseLinkedClaims: boolean;
    isCollapsePrincipleProc: boolean;
  }>({
    isCollapsePatientInfo: false,
    isCollapseCondition: true,
    isCollapseOccurance: true,
    isCollapseValue: true,
    isCollapseDiagnosis: false,
    isCollapseLinkedClaims: false,
    isCollapsePrincipleProc: true,
  });
  const [medicalCaseModalState, setMedicalCaseModalState] = useState<{
    open: boolean;
    heading: string;
    description: string;
    okButtonText: string;
    closeButtonText: string;
    statusModalType: StatusModalType;
    showCloseButton: boolean;
    closeOnClickOutside: boolean;
    confirmActionType: string;
  }>({
    open: false,
    heading: '',
    description: '',
    okButtonText: 'Ok',
    closeButtonText: 'Close',
    statusModalType: StatusModalType.ERROR,
    showCloseButton: false,
    closeOnClickOutside: false,
    confirmActionType: '',
  });
  const [isSaveClicked, setSaveClicked] = useState(false);
  const facilitiesData = useSelector(getFacilityDataSelector);
  const [primaryInsuranceData, setPrimaryInsuranceData] =
    useState<PatientInsuranceData[]>();
  const patientInsuranceData = useSelector(getPatientInsuranceDataSelector);
  useEffect(() => {
    if (patientInsuranceData) {
      const insuranceDataFiltered = patientInsuranceData?.filter(
        (patientInsurance) => patientInsurance.insuranceResponsibility === 'P'
      );
      setPrimaryInsuranceData(insuranceDataFiltered);
    }
  }, [patientInsuranceData]);
  const referringProviderDataSet = useSelector(
    getReferringProviderDataSelector
  );
  const [referringProviderData, setReferringProviderData] = useState<
    ReferringProviderData[] | null
  >();
  const providersData = useSelector(getProviderDataSelector);
  const [supervisingProviderData, setSupervisingProviderData] = useState<
    ProvidersData[] | undefined
  >();
  useEffect(() => {
    if (providersData) {
      setSupervisingProviderData(providersData);
    }
  }, [providersData]);
  useEffect(() => {
    if (referringProviderDataSet) {
      setReferringProviderData(referringProviderDataSet);
    }
  }, [referringProviderDataSet]);
  useEffect(() => {
    if (groupID) {
      dispatch(
        fetchReferringProviderDataRequest({
          groupID,
        })
      );
    }
  }, [groupID]);
  const [isWarningAlert, setIsWarningAlert] = useState(false);
  const initializeMedicalCaseData = (): MedicalCaseModalData => ({
    medicalCaseID,
    patientID: selectedPatientIDState || null,
    title: '',
    hospitalCaseNumber: '',
    referringProviderFirstName: '',
    referringProviderLastName: '',
    referringProviderNPI: '',
    admissionDate: null,
    dischargeDate: null,
    admissionHourCode: '',
    dischargeHourCode: '',
    frequencyCode: '',
    admissionPriorityCode: '',
    admissionSourceCode: '',
    patDischargeStatusCode: '',
    conditCodeBox18: '',
    conditCodeBox19: '',
    conditCodeBox20: '',
    conditCodeBox21: '',
    conditCodeBox22: '',
    conditCodeBox23: '',
    conditCodeBox24: '',
    conditCodeBox25: '',
    conditCodeBox26: '',
    conditCodeBox27: '',
    conditCodeBox28: '',
    accidentStateBox29: '',
    occurrCodeBox31: '',
    occurrDateBox31: null,
    occurrCodeBox32: '',
    occurrDateBox32: null,
    occurrCodeBox33: '',
    occurrDateBox33: null,
    occurrCodeBox34: '',
    occurrDateBox34: null,
    occurrSpanCodeBox35: '',
    occurrSpanFromDateBox35: null,
    occurrSpanToDateBox35: null,
    occurrSpanCodeBox36: '',
    occurrSpanFromDateBox36: null,
    occurrSpanToDateBox36: null,
    valCodeBox39a: '',
    valCodeBox39b: '',
    valCodeBox39c: '',
    valCodeBox39d: '',
    valCodeBox40a: '',
    valCodeBox40b: '',
    valCodeBox40c: '',
    valCodeBox40d: '',
    valCodeBox41a: '',
    valCodeBox41b: '',
    valCodeBox41c: '',
    valCodeBox41d: '',
    admitDxBox69: '',
    diagnosis1: '',
    diagnosis2: '',
    diagnosis3: '',
    diagnosis4: '',
    diagnosis5: '',
    diagnosis6: '',
    diagnosis7: '',
    diagnosis8: '',
    diagnosis9: '',
    diagnosis10: '',
    diagnosis11: '',
    diagnosis12: '',
    patReasonDxBox70a: '',
    patReasonDxBox70b: '',
    patReasonDxBox70c: '',
    ppsCodeBox71: '',
    eciBox72a: '',
    eciBox72b: '',
    eciBox72c: '',
    princProcedureCodeBox74: '',
    princProcedureDateBox74: null,
    othProcedureCodeBox74a: '',
    othProcedureDateBox74a: null,
    othProcedureCodeBox74b: '',
    othProcedureDateBox74b: null,
    othProcedureCodeBox74c: '',
    othProcedureDateBox74c: null,
    othProcedureCodeBox74d: '',
    othProcedureDateBox74d: null,
    othProcedureCodeBox74e: '',
    othProcedureDateBox74e: null,
    caseStatusCode: 'O',
    caseNote: '',
  });
  const [medicalCaseData, setMedicalCaseData] = useState<MedicalCaseModalData>(
    initializeMedicalCaseData()
  );
  const getMedicalCaseDataByID = async () => {
    if (medicalCaseID) {
      const res = await getMedicalCaseDetailByID(medicalCaseID);
      if (res) {
        const modifiedRes = {
          ...res,
          admissionDate: res.admissionDate === '' ? null : res.admissionDate,
          dischargeDate: res.dischargeDate === '' ? null : res.dischargeDate,
          occurrDateBox31:
            res.occurrDateBox31 === '' ? null : res.occurrDateBox31,
          occurrDateBox32:
            res.occurrDateBox32 === '' ? null : res.occurrDateBox32,
          occurrDateBox33:
            res.occurrDateBox33 === '' ? null : res.occurrDateBox33,
          occurrDateBox34:
            res.occurrDateBox34 === '' ? null : res.occurrDateBox34,
          occurrSpanFromDateBox35:
            res.occurrSpanFromDateBox35 === ''
              ? null
              : res.occurrSpanFromDateBox35,
          occurrSpanToDateBox35:
            res.occurrSpanToDateBox35 === '' ? null : res.occurrSpanToDateBox35,
          occurrSpanFromDateBox36:
            res.occurrSpanFromDateBox36 === ''
              ? null
              : res.occurrSpanFromDateBox36,
          occurrSpanToDateBox36:
            res.occurrSpanToDateBox36 === '' ? null : res.occurrSpanToDateBox36,
          princProcedureDateBox74:
            res.princProcedureDateBox74 === ''
              ? null
              : res.princProcedureDateBox74,
          othProcedureDateBox74a:
            res.othProcedureDateBox74a === ''
              ? null
              : res.othProcedureDateBox74a,
          othProcedureDateBox74b:
            res.othProcedureDateBox74b === ''
              ? null
              : res.othProcedureDateBox74b,
          othProcedureDateBox74c:
            res.othProcedureDateBox74c === ''
              ? null
              : res.othProcedureDateBox74c,
          othProcedureDateBox74d:
            res.othProcedureDateBox74d === ''
              ? null
              : res.othProcedureDateBox74d,
          othProcedureDateBox74e:
            res.othProcedureDateBox74e === ''
              ? null
              : res.othProcedureDateBox74e,
        };
        setMedicalCaseData(modifiedRes);
      }
    }
  };
  useEffect(() => {
    if (isViewMode && medicalCaseID) {
      getMedicalCaseDataByID();
    }
  }, [medicalCaseID]);
  const [conditionCodeFields, setConditionCodeFields] = useState<
    FieldSelectionDropdownDataType[]
  >([
    {
      id: 1,
      value: 'Condition Code (Box 18)',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
    },
    {
      id: 2,
      value: 'Condition Code (Box 19)',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
    },
    {
      id: 3,
      value: 'Condition Code (Box 20)',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
    },
    {
      id: 4,
      value: 'Condition Code (Box 21)',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
    },
    {
      id: 5,
      value: 'Condition Code (Box 22)',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
    },
    {
      id: 6,
      value: 'Condition Code (Box 23)',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
    },
    {
      id: 7,
      value: 'Condition Code (Box 24)',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
    },
    {
      id: 8,
      value: 'Condition Code (Box 25)',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
    },
    {
      id: 9,
      value: 'Condition Code (Box 26)',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
    },
    {
      id: 10,
      value: 'Condition Code (Box 27)',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
    },
    {
      id: 11,
      value: 'Condition Code (Box 28)',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
    },
  ]);
  const [occuranceCodeFields, setOccuranceCodeFields] = useState<
    FieldSelectionDropdownDataType[]
  >([
    {
      id: 1,
      value: 'Occurrence Code (Box 31)',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
      relatedFields: [2],
    },
    {
      id: 2,
      value: 'Occurrence Date (Box 31)',
      active: true,
      checked: false,
      fieldType: 'datePicker',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
      parentField: 1,
    },
    {
      id: 3,
      value: 'Occurrence Code (Box 32)',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      relatedFields: [4],
      isRequired: false,
    },
    {
      id: 4,
      value: 'Occurrence Date (Box 32)',
      active: true,
      checked: false,
      fieldType: 'datePicker',
      selectedValue: undefined,
      data: undefined,
      parentField: 3,
      isRequired: false,
    },
    {
      id: 5,
      value: 'Occurrence Code (Box 33)',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
      relatedFields: [6],
    },
    {
      id: 6,
      value: 'Occurrence Date (Box 33)',
      active: true,
      checked: false,
      fieldType: 'datePicker',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
      parentField: 5,
    },
    {
      id: 7,
      value: 'Occurrence Code (Box 34)',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
      relatedFields: [8],
    },
    {
      id: 8,
      value: 'Occurrence Date (Box 34)',
      active: true,
      checked: false,
      fieldType: 'datePicker',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
      parentField: 7,
    },
  ]);
  const [occuranceSpanCodeFields, setOccuranceSpanCodeFields] = useState<
    FieldSelectionDropdownDataType[]
  >([
    {
      id: 1,
      value: 'Occurrence Span Code (Box 35)',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
      relatedFields: [2, 3],
    },
    {
      id: 2,
      value: 'Occurrence Span From Date (Box 35)',
      active: true,
      checked: false,
      fieldType: 'datePicker',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
      parentField: 1,
    },
    {
      id: 3,
      value: 'Occurrence span Through Date (Box 35)',
      active: true,
      checked: false,
      fieldType: 'datePicker',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
      parentField: 1,
    },
    {
      id: 4,
      value: 'Occurrence Span Code (Box 36)',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
      relatedFields: [5, 6],
    },
    {
      id: 5,
      value: 'Occurrence Span From Date (Box 36)',
      active: true,
      checked: false,
      fieldType: 'datePicker',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
      parentField: 4,
    },
    {
      id: 6,
      value: 'Occurrence span Through Date (Box 36)',
      active: true,
      checked: false,
      fieldType: 'datePicker',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
      parentField: 4,
    },
  ]);
  const [valueCodeFields, setValueCodeFields] = useState<
    FieldSelectionDropdownDataType[]
  >([
    {
      id: 1,
      value: 'Value Code (Box 39-a)',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
      relatedFields: [2],
    },
    {
      id: 2,
      value: 'Value Code (Box 39-a) Amount',
      active: true,
      checked: false,
      fieldType: 'amountField',
      selectedValue: undefined,
      data: undefined,
      parentField: 1,
      isRequired: false,
    },
    {
      id: 3,
      value: 'Value Code (Box 39-b)',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      relatedFields: [4],
      isRequired: false,
    },
    {
      id: 4,
      value: 'Value Code (Box 39-b) Amount',
      active: true,
      checked: false,
      fieldType: 'amountField',
      selectedValue: undefined,
      data: undefined,
      parentField: 3,
      isRequired: false,
    },
    {
      id: 5,
      value: 'Value Code (Box 39-c)',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      relatedFields: [6],
      isRequired: false,
    },
    {
      id: 6,
      value: 'Value Code (Box 39-c) Amount',
      active: true,
      checked: false,
      fieldType: 'amountField',
      selectedValue: undefined,
      data: undefined,
      parentField: 5,
      isRequired: false,
    },
    {
      id: 7,
      value: 'Value Code (Box 39-d)',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      relatedFields: [8],
      isRequired: false,
    },
    {
      id: 8,
      value: 'Value Code (Box 39-d) Amount',
      active: true,
      checked: false,
      fieldType: 'amountField',
      selectedValue: undefined,
      data: undefined,
      parentField: 7,
      isRequired: false,
    },
    {
      id: 9,
      value: 'Value Code (Box 40-a) ',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      relatedFields: [10],
      isRequired: false,
    },
    {
      id: 10,
      value: 'Value Code (Box 40-a) Amount',
      active: true,
      checked: false,
      fieldType: 'amountField',
      selectedValue: undefined,
      data: undefined,
      parentField: 9,
      isRequired: false,
    },
    {
      id: 11,
      value: 'Value Code (Box 40-b) ',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      relatedFields: [12],
      isRequired: false,
    },
    {
      id: 12,
      value: 'Value Code (Box 40-b) Amount',
      active: true,
      checked: false,
      fieldType: 'amountField',
      selectedValue: undefined,
      data: undefined,
      parentField: 11,
      isRequired: false,
    },
    {
      id: 13,
      value: 'Value Code (Box 40-c) ',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      relatedFields: [14],
      isRequired: false,
    },
    {
      id: 14,
      value: 'Value Code (Box 40-c) Amount',
      active: true,
      checked: false,
      fieldType: 'amountField',
      selectedValue: undefined,
      data: undefined,
      parentField: 13,
      isRequired: false,
    },
    {
      id: 15,
      value: 'Value Code (Box 40-d) ',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      relatedFields: [16],
      isRequired: false,
    },
    {
      id: 16,
      value: 'Value Code (Box 40-d) Amount',
      active: true,
      checked: false,
      fieldType: 'amountField',
      selectedValue: undefined,
      data: undefined,
      parentField: 15,
      isRequired: false,
    },
    {
      id: 17,
      value: 'Value Code (Box 41-a)',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      relatedFields: [18],
      isRequired: false,
    },
    {
      id: 18,
      value: 'Value Code (Box 41-a) Amount',
      active: true,
      checked: false,
      fieldType: 'amountField',
      selectedValue: undefined,
      data: undefined,
      parentField: 17,
      isRequired: false,
    },
    {
      id: 19,
      value: 'Value Code (Box 41-b)',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      relatedFields: [20],
      isRequired: false,
    },
    {
      id: 20,
      value: 'Value Code (Box 41-b) Amount',
      active: true,
      checked: false,
      fieldType: 'amountField',
      selectedValue: undefined,
      data: undefined,
      parentField: 19,
      isRequired: false,
    },
    {
      id: 21,
      value: 'Value Code (Box 41-c)',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      relatedFields: [22],
      isRequired: false,
    },
    {
      id: 22,
      value: 'Value Code (Box 41-c) Amount',
      active: true,
      checked: false,
      fieldType: 'amountField',
      selectedValue: undefined,
      data: undefined,
      parentField: 21,
      isRequired: false,
    },
    {
      id: 23,
      value: 'Value Code (Box 41-d)',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      relatedFields: [24],
      isRequired: false,
    },
    {
      id: 24,
      value: 'Value Code (Box 41-d) Amount',
      active: true,
      checked: false,
      fieldType: 'amountField',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
      parentField: 23,
    },
  ]);
  const diagnosisFieldsInitialState: FieldSelectionDropdownDataType[] = [
    {
      id: 1,
      value: 'AdmitDx',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
      searchedValue: undefined,
    },
    // {
    //   id: 2,
    //   value: 'Diagnosis 1',
    //   active: true,
    //   checked: true,
    //   fieldType: 'dropDown',
    //   selectedValue: undefined,
    //   data: undefined,
    //   isRequired: true,
    //   searchedValue: undefined,
    // },
    {
      id: 3,
      value: 'Diagnosis 2',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
      searchedValue: undefined,
    },
    {
      id: 4,
      value: 'Diagnosis 3',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
      searchedValue: undefined,
    },
    {
      id: 5,
      value: 'Diagnosis 4',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
      searchedValue: undefined,
    },
    {
      id: 6,
      value: 'Diagnosis 5',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
      searchedValue: undefined,
    },
    {
      id: 7,
      value: 'Diagnosis 6',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
      searchedValue: undefined,
    },
    {
      id: 8,
      value: 'Diagnosis 7',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
      searchedValue: undefined,
    },
    {
      id: 9,
      value: 'Diagnosis 8',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
      searchedValue: undefined,
    },
    {
      id: 10,
      value: 'Diagnosis 9',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
      searchedValue: undefined,
    },
    {
      id: 11,
      value: 'Diagnosis 10',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
      searchedValue: undefined,
    },
    {
      id: 12,
      value: 'Diagnosis 11',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
      searchedValue: undefined,
    },
    {
      id: 13,
      value: 'Diagnosis 12',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
      searchedValue: undefined,
    },
    {
      id: 14,
      value: 'PatientReasonDx1',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
    },
    {
      id: 15,
      value: 'PatientReasonDx2',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
    },
    {
      id: 16,
      value: 'PatientReasonDx3',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
    },
    {
      id: 17,
      value: 'PPS Code',
      active: true,
      checked: false,
      fieldType: 'inputText',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
      maxLength: 4,
    },
    {
      id: 18,
      value: 'ECIDx1',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
    },
    {
      id: 19,
      value: 'ECIDx2',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
    },
    {
      id: 20,
      value: 'ECIDx3',
      active: true,
      checked: false,
      fieldType: 'dropDown',
      selectedValue: undefined,
      data: undefined,
      isRequired: false,
    },
  ];
  const [diagnosisCodeFields, setDiagnosisCodeFields] = useState<
    FieldSelectionDropdownDataType[]
  >(diagnosisFieldsInitialState);
  const [principleProcedureCodeFields, setPrincipleProcedureCodeFields] =
    useState<FieldSelectionDropdownDataType[]>([
      {
        id: 1,
        value: 'Principle Procedure Code (Box 74)',
        active: true,
        checked: false,
        fieldType: 'dropDown',
        selectedValue: undefined,
        data: undefined,
        isRequired: false,
        relatedFields: [2],
        searchedValue: undefined,
      },
      {
        id: 2,
        value: 'Principle Procedure Date (Box 74)',
        active: true,
        checked: false,
        fieldType: 'datePicker',
        selectedValue: undefined,
        data: undefined,
        parentField: 1,
        isRequired: false,
      },
      {
        id: 3,
        value: 'Other Procedure Code (Box 74-a)',
        active: true,
        checked: false,
        fieldType: 'dropDown',
        selectedValue: undefined,
        data: undefined,
        isRequired: false,
        relatedFields: [4],
        searchedValue: undefined,
      },
      {
        id: 4,
        value: 'Other Procedure Date (Box 74-a)',
        active: true,
        checked: false,
        fieldType: 'datePicker',
        selectedValue: undefined,
        data: undefined,
        parentField: 3,
        isRequired: false,
      },
      {
        id: 5,
        value: 'Other Procedure Code (Box 74-b)',
        active: true,
        checked: false,
        fieldType: 'dropDown',
        selectedValue: undefined,
        data: undefined,
        isRequired: false,
        relatedFields: [6],
        searchedValue: undefined,
      },
      {
        id: 6,
        value: 'Other Procedure Date (Box 74-b)',
        active: true,
        checked: false,
        fieldType: 'datePicker',
        selectedValue: undefined,
        data: undefined,
        parentField: 5,
        isRequired: false,
      },
      {
        id: 7,
        value: 'Other Procedure Code (Box 74-c)',
        active: true,
        checked: false,
        fieldType: 'dropDown',
        selectedValue: undefined,
        data: undefined,
        isRequired: false,
        relatedFields: [8],
        searchedValue: undefined,
      },
      {
        id: 8,
        value: 'Other Procedure Date (Box 74-c)',
        active: true,
        checked: false,
        fieldType: 'datePicker',
        selectedValue: undefined,
        data: undefined,
        parentField: 7,
        isRequired: false,
      },
      {
        id: 9,
        value: 'Other Procedure Code (Box 74-d)',
        active: true,
        checked: false,
        fieldType: 'dropDown',
        selectedValue: undefined,
        data: undefined,
        isRequired: false,
        relatedFields: [10],
        searchedValue: undefined,
      },
      {
        id: 10,
        value: 'Other Procedure Date (Box 74-d)',
        active: true,
        checked: false,
        fieldType: 'datePicker',
        selectedValue: undefined,
        data: undefined,
        parentField: 9,
        isRequired: false,
      },
      {
        id: 11,
        value: 'Other Procedure Code (Box 74-e)',
        active: true,
        checked: false,
        fieldType: 'dropDown',
        selectedValue: undefined,
        data: undefined,
        isRequired: false,
        searchedValue: undefined,
        relatedFields: [12],
      },
      {
        id: 12,
        value: 'Other Procedure Date (Box 74-e)',
        active: true,
        checked: false,
        fieldType: 'datePicker',
        selectedValue: undefined,
        data: undefined,
        parentField: 11,
        isRequired: false,
      },
    ]);

  const [selectedDiagnosisFieldDropdown, setSelectedDiagnosisFieldDropdown] =
    useState<SingleSelectDropDownDataType[]>([]);
  const [selectedDiagnosisInfo, setSelectedDiagosisInfo] = useState<{
    admitDxBox69: string;
    // diagnosis1: string;
    diagnosis2: string;
    diagnosis3: string;
    diagnosis4: string;
    diagnosis5: string;
    diagnosis6: string;
    diagnosis7: string;
    diagnosis8: string;
    diagnosis9: string;
    diagnosis10: string;
    diagnosis11: string;
    diagnosis12: string;
    patReasonDxBox70a: string;
    patReasonDxBox70b: string;
    patReasonDxBox70c: string;
    ppsCodeBox71: string;
    eciBox72a: string;
    eciBox72b: string;
    eciBox72c: string;
  }>({
    admitDxBox69: '',
    // diagnosis1: '',
    diagnosis2: '',
    diagnosis3: '',
    diagnosis4: '',
    diagnosis5: '',
    diagnosis6: '',
    diagnosis7: '',
    diagnosis8: '',
    diagnosis9: '',
    diagnosis10: '',
    diagnosis11: '',
    diagnosis12: '',
    patReasonDxBox70a: '',
    patReasonDxBox70b: '',
    patReasonDxBox70c: '',
    ppsCodeBox71: '',
    eciBox72a: '',
    eciBox72b: '',
    eciBox72c: '',
  });
  const getIcdSearch = async (
    value: FieldSelectionDropdownDataType[],
    isUpdateMode: boolean
  ) => {
    // Extract unique search values
    const searchValuesSet = new Set<string>();
    value.forEach((code) => {
      if (code.searchedValue) {
        searchValuesSet.add(code.searchedValue);
      }
    });
    const searchValues = Array.from(searchValuesSet);

    // Make all asynchronous calls concurrently
    const searchResults = await Promise.all(
      searchValues.map((searchValue) => icdSearchRequest(searchValue))
    );

    // Update the state with the results
    let updatedDiagnosisCodeFields = value;
    searchResults.forEach((res, index) => {
      const searchValue = searchValues[index];
      if (res) {
        updatedDiagnosisCodeFields = updatedDiagnosisCodeFields.map((row) => {
          if (row.searchedValue === searchValue) {
            let selectedValue: SingleSelectDropDownDataType | undefined;
            if (isUpdateMode) {
              if (row.id === 1 && selectedDiagnosisInfo.admitDxBox69) {
                selectedValue = res.find(
                  (m) => m.value === selectedDiagnosisInfo.admitDxBox69
                );
              }
              // else if (row.id === 2 && selectedDiagnosisInfo.diagnosis1) {
              //   selectedValue = res.find(
              //     (m) => m.value === selectedDiagnosisInfo.diagnosis1
              //   );
              // }
              // Add additional conditions for setting selectedValue here
              else if (row.id === 3 && selectedDiagnosisInfo.diagnosis2) {
                selectedValue = res.find(
                  (m) => m.value === selectedDiagnosisInfo.diagnosis2
                );
              } else if (row.id === 4 && selectedDiagnosisInfo.diagnosis3) {
                selectedValue = res.find(
                  (m) => m.value === selectedDiagnosisInfo.diagnosis3
                );
              } else if (row.id === 5 && selectedDiagnosisInfo.diagnosis4) {
                selectedValue = res.find(
                  (m) => m.value === selectedDiagnosisInfo.diagnosis4
                );
              } else if (row.id === 6 && selectedDiagnosisInfo.diagnosis5) {
                selectedValue = res.find(
                  (m) => m.value === selectedDiagnosisInfo.diagnosis5
                );
              } else if (row.id === 7 && selectedDiagnosisInfo.diagnosis6) {
                selectedValue = res.find(
                  (m) => m.value === selectedDiagnosisInfo.diagnosis6
                );
              } else if (row.id === 8 && selectedDiagnosisInfo.diagnosis7) {
                selectedValue = res.find(
                  (m) => m.value === selectedDiagnosisInfo.diagnosis7
                );
              } else if (row.id === 9 && selectedDiagnosisInfo.diagnosis8) {
                selectedValue = res.find(
                  (m) => m.value === selectedDiagnosisInfo.diagnosis8
                );
              } else if (row.id === 10 && selectedDiagnosisInfo.diagnosis9) {
                selectedValue = res.find(
                  (m) => m.value === selectedDiagnosisInfo.diagnosis9
                );
              } else if (row.id === 11 && selectedDiagnosisInfo.diagnosis10) {
                selectedValue = res.find(
                  (m) => m.value === selectedDiagnosisInfo.diagnosis10
                );
              } else if (row.id === 12 && selectedDiagnosisInfo.diagnosis11) {
                selectedValue = res.find(
                  (m) => m.value === selectedDiagnosisInfo.diagnosis11
                );
              } else if (row.id === 13 && selectedDiagnosisInfo.diagnosis12) {
                selectedValue = res.find(
                  (m) => m.value === selectedDiagnosisInfo.diagnosis12
                );
              } else if (
                row.id === 14 &&
                selectedDiagnosisInfo.patReasonDxBox70a
              ) {
                selectedValue = res.find(
                  (m) => m.value === selectedDiagnosisInfo.patReasonDxBox70a
                );
              } else if (
                row.id === 15 &&
                selectedDiagnosisInfo.patReasonDxBox70b
              ) {
                selectedValue = res.find(
                  (m) => m.value === selectedDiagnosisInfo.patReasonDxBox70b
                );
              } else if (
                row.id === 16 &&
                selectedDiagnosisInfo.patReasonDxBox70c
              ) {
                selectedValue = res.find(
                  (m) => m.value === selectedDiagnosisInfo.patReasonDxBox70c
                );
              } else if (row.id === 18 && selectedDiagnosisInfo.eciBox72a) {
                selectedValue = res.find(
                  (m) => m.value === selectedDiagnosisInfo.eciBox72a
                );
              } else if (row.id === 19 && selectedDiagnosisInfo.eciBox72b) {
                selectedValue = res.find(
                  (m) => m.value === selectedDiagnosisInfo.eciBox72b
                );
              } else if (row.id === 20 && selectedDiagnosisInfo.eciBox72c) {
                selectedValue = res.find(
                  (m) => m.value === selectedDiagnosisInfo.eciBox72c
                );
              }
            }
            return {
              ...row,
              data: res,
              selectedValue: selectedValue || row.selectedValue,
            };
          }
          return row;
        });
      }
    });

    // Update the state only once after processing all fields
    setDiagnosisCodeFields(updatedDiagnosisCodeFields);
  };
  const [selectedProcedureInfo, setSelectedProcedureInfo] = useState<{
    princProcedureCodeBox74: string;
    princProcedureDateBox74: string | null;
    othProcedureCodeBox74a: string;
    othProcedureDateBox74a: string | null;
    othProcedureCodeBox74b: string;
    othProcedureDateBox74b: string | null;
    othProcedureCodeBox74c: string;
    othProcedureDateBox74c: string | null;
    othProcedureCodeBox74d: string;
    othProcedureDateBox74d: string | null;
    othProcedureCodeBox74e: string;
    othProcedureDateBox74e: string | null;
  }>({
    princProcedureCodeBox74: '',
    princProcedureDateBox74: null,
    othProcedureCodeBox74a: '',
    othProcedureDateBox74a: null,
    othProcedureCodeBox74b: '',
    othProcedureDateBox74b: null,
    othProcedureCodeBox74c: '',
    othProcedureDateBox74c: null,
    othProcedureCodeBox74d: '',
    othProcedureDateBox74d: null,
    othProcedureCodeBox74e: '',
    othProcedureDateBox74e: null,
  });
  const getIcdSearchForProcedureCodes = async (
    value: FieldSelectionDropdownDataType[],
    isUpdateMode: boolean
  ) => {
    // Extract unique search values
    const searchValuesSet = new Set<string>();
    value.forEach((code) => {
      if (code.searchedValue) {
        searchValuesSet.add(code.searchedValue);
      }
    });
    const searchValues = Array.from(searchValuesSet);

    // Make all asynchronous calls concurrently
    const searchResults = await Promise.all(
      searchValues.map((searchValue) => icdSearchRequest(searchValue))
    );

    // Update the state with the results
    let updatedProcedureCodeFields = value;
    searchResults.forEach((res, index) => {
      const searchValue = searchValues[index];
      if (res) {
        updatedProcedureCodeFields = updatedProcedureCodeFields.map((row) => {
          if (row.searchedValue === searchValue) {
            let selectedValue: SingleSelectDropDownDataType | undefined;
            if (isUpdateMode) {
              if (
                row.id === 1 &&
                selectedProcedureInfo.princProcedureCodeBox74
              ) {
                selectedValue = res.find(
                  (m) =>
                    m.value === selectedProcedureInfo.princProcedureCodeBox74
                );
              } else if (
                row.id === 3 &&
                selectedProcedureInfo.othProcedureCodeBox74a
              ) {
                selectedValue = res.find(
                  (m) =>
                    m.value === selectedProcedureInfo.othProcedureCodeBox74a
                );
              }
              // Add additional conditions for setting selectedValue here
              else if (
                row.id === 5 &&
                selectedProcedureInfo.othProcedureCodeBox74b
              ) {
                selectedValue = res.find(
                  (m) =>
                    m.value === selectedProcedureInfo.othProcedureCodeBox74b
                );
              } else if (
                row.id === 7 &&
                selectedProcedureInfo.othProcedureCodeBox74c
              ) {
                selectedValue = res.find(
                  (m) =>
                    m.value === selectedProcedureInfo.othProcedureCodeBox74c
                );
              } else if (
                row.id === 9 &&
                selectedProcedureInfo.othProcedureCodeBox74d
              ) {
                selectedValue = res.find(
                  (m) =>
                    m.value === selectedProcedureInfo.othProcedureCodeBox74d
                );
              } else if (
                row.id === 11 &&
                selectedProcedureInfo.othProcedureCodeBox74e
              ) {
                selectedValue = res.find(
                  (m) =>
                    m.value === selectedProcedureInfo.othProcedureCodeBox74e
                );
              }
            }
            return {
              ...row,
              data: res,
              selectedValue: selectedValue || row.selectedValue,
            };
          }
          return row;
        });
      }
    });

    // Update the state only once after processing all fields
    setPrincipleProcedureCodeFields(updatedProcedureCodeFields);
  };
  const [
    selectedPrincipleProcFieldDropdown,
    setSelectedPrincipleProcFieldDropdown,
  ] = useState<SingleSelectDropDownDataType[]>([]);

  const [selectedConditionFieldDropdown, setSelectedConditionFieldDropdown] =
    useState<SingleSelectDropDownDataType[]>([]);

  const [selectedOccuranceFieldDropdown, setSelectedOccuranceFieldDropdown] =
    useState<SingleSelectDropDownDataType[]>([]);
  const [selectedValueFieldDropdown, setSelectedValueFieldDropdown] = useState<
    SingleSelectDropDownDataType[]
  >([]);
  const [
    selectedOccuranceSpanFieldDropdown,
    setSelectedOccuranceSpanFieldDropdown,
  ] = useState<SingleSelectDropDownDataType[]>([]);
  const [isDataChanged, setIsDataChanged] = useState(false);
  const [selectedPatientInfo, setSelectedPatientInfo] = useState<{
    medicalCaseID: number | null;
    patientID: number | null;
    facilityID?: number;
    patientInsuranceID?: number;
    title: string;
    hospitalCaseNumber: string;
    referringProviderFirstName: string;
    referringProviderLastName: string;
    referringProviderNPI: string;
    attendingProviderID?: number;
    operatingProviderID?: number;
    admissionDate: string | null;
    dischargeDate: string | null;
    admissionHourCode: string;
    dischargeHourCode: string;
    frequencyCode: string;
    admissionPriorityCode: string;
    admissionSourceCode: string;
    patDischargeStatusCode: string;
    accidentStateBox29: string;
    caseStatusCode: string;
    caseNote: string;
    diagnosis1: string;
  }>({
    medicalCaseID: null,
    patientID: selectedPatientID,
    facilityID: undefined,
    patientInsuranceID: undefined,
    title: '',
    hospitalCaseNumber: '',
    referringProviderFirstName: '',
    referringProviderLastName: '',
    referringProviderNPI: '',
    attendingProviderID: undefined,
    operatingProviderID: undefined,
    admissionDate: null,
    dischargeDate: null,
    admissionHourCode: '',
    dischargeHourCode: '',
    frequencyCode: '',
    admissionPriorityCode: '',
    admissionSourceCode: '',
    patDischargeStatusCode: '',
    accidentStateBox29: '',
    caseStatusCode: 'O',
    caseNote: '',
    diagnosis1: '',
  });
  const [selectedConditionInfo, setSelectedConditionInfo] = useState<{
    conditCodeBox18: string;
    conditCodeBox19: string;
    conditCodeBox20: string;
    conditCodeBox21: string;
    conditCodeBox22: string;
    conditCodeBox23: string;
    conditCodeBox24: string;
    conditCodeBox25: string;
    conditCodeBox26: string;
    conditCodeBox27: string;
    conditCodeBox28: string;
  }>({
    conditCodeBox18: '',
    conditCodeBox19: '',
    conditCodeBox20: '',
    conditCodeBox21: '',
    conditCodeBox22: '',
    conditCodeBox23: '',
    conditCodeBox24: '',
    conditCodeBox25: '',
    conditCodeBox26: '',
    conditCodeBox27: '',
    conditCodeBox28: '',
  });
  const [selectedOccurrenceInfo, setSelectedOccurrenceInfo] = useState<{
    occurrCodeBox31: string;
    occurrDateBox31: string | null;
    occurrCodeBox32: string;
    occurrDateBox32: string | null;
    occurrCodeBox33: string;
    occurrDateBox33: string | null;
    occurrCodeBox34: string;
    occurrDateBox34: string | null;
  }>({
    occurrCodeBox31: '',
    occurrDateBox31: null,
    occurrCodeBox32: '',
    occurrDateBox32: null,
    occurrCodeBox33: '',
    occurrDateBox33: null,
    occurrCodeBox34: '',
    occurrDateBox34: null,
  });
  const [selectedOccurrenceSpanInfo, setSelectedOccurrenceSpanInfo] = useState<{
    occurrSpanCodeBox35: string;
    occurrSpanFromDateBox35: string | null;
    occurrSpanToDateBox35: string | null;
    occurrSpanCodeBox36: string;
    occurrSpanFromDateBox36: string | null;
    occurrSpanToDateBox36: string | null;
  }>({
    occurrSpanCodeBox35: '',
    occurrSpanFromDateBox35: null,
    occurrSpanToDateBox35: null,
    occurrSpanCodeBox36: '',
    occurrSpanFromDateBox36: null,
    occurrSpanToDateBox36: null,
  });
  const [selectedValueInfo, setSelectedValueInfo] = useState<{
    valCodeBox39a: string;
    valCodeAmtBox39a?: number;
    valCodeBox39b: string;
    valCodeAmtBox39b?: number;
    valCodeBox39c: string;
    valCodeAmtBox39c?: number;
    valCodeBox39d: string;
    valCodeAmtBox39d?: number;
    valCodeBox40a: string;
    valCodeAmtBox40a?: number;
    valCodeBox40b: string;
    valCodeAmtBox40b?: number;
    valCodeBox40c: string;
    valCodeAmtBox40c?: number;
    valCodeBox40d: string;
    valCodeAmtBox40d?: number;
    valCodeBox41a: string;
    valCodeAmtBox41a?: number;
    valCodeBox41b: string;
    valCodeAmtBox41b?: number;
    valCodeBox41c: string;
    valCodeAmtBox41c?: number;
    valCodeBox41d: string;
    valCodeAmtBox41d?: number;
  }>({
    valCodeBox39a: '',
    valCodeBox39b: '',
    valCodeBox39c: '',
    valCodeBox39d: '',
    valCodeBox40a: '',
    valCodeBox40b: '',
    valCodeBox40c: '',
    valCodeBox40d: '',
    valCodeBox41a: '',
    valCodeBox41b: '',
    valCodeBox41c: '',
    valCodeBox41d: '',
  });
  const [diagnosisSearchValue, setDiagnosisSearchValue] = useState<string>('');
  useEffect(() => {
    if (medicalCaseData && isViewMode) {
      setDiagnosisSearchValue(medicalCaseData.diagnosis1);
      setSelectedPatientInfo({
        medicalCaseID: medicalCaseData.medicalCaseID,
        patientID: medicalCaseData.patientID,
        title: medicalCaseData.title,
        facilityID: medicalCaseData.facilityID,
        patientInsuranceID: medicalCaseData.patientInsuranceID,
        frequencyCode: medicalCaseData.frequencyCode,
        admissionSourceCode: medicalCaseData.admissionSourceCode,
        admissionPriorityCode: medicalCaseData.admissionPriorityCode,
        patDischargeStatusCode: medicalCaseData.patDischargeStatusCode,
        referringProviderNPI: medicalCaseData.referringProviderNPI,
        referringProviderFirstName: medicalCaseData.referringProviderFirstName,
        referringProviderLastName: medicalCaseData.referringProviderLastName,
        attendingProviderID: medicalCaseData.attendingProviderID,
        operatingProviderID: medicalCaseData.operatingProviderID,
        hospitalCaseNumber: medicalCaseData.hospitalCaseNumber,
        dischargeDate: medicalCaseData.dischargeDate || null,
        dischargeHourCode: medicalCaseData.dischargeHourCode,
        admissionDate: medicalCaseData.admissionDate || null,
        admissionHourCode: medicalCaseData.admissionHourCode,
        accidentStateBox29: medicalCaseData.accidentStateBox29,
        caseStatusCode: medicalCaseData.caseStatusCode || 'O',
        caseNote: medicalCaseData.caseNote,
        diagnosis1: medicalCaseData.diagnosis1,
      });
      setSelectedDiagosisInfo({
        admitDxBox69: medicalCaseData.admitDxBox69,
        // diagnosis1: medicalCaseData.diagnosis1,
        diagnosis2: medicalCaseData.diagnosis2,
        diagnosis3: medicalCaseData.diagnosis3,
        diagnosis4: medicalCaseData.diagnosis4,
        diagnosis5: medicalCaseData.diagnosis5,
        diagnosis6: medicalCaseData.diagnosis6,
        diagnosis7: medicalCaseData.diagnosis7,
        diagnosis8: medicalCaseData.diagnosis8,
        diagnosis9: medicalCaseData.diagnosis9,
        diagnosis10: medicalCaseData.diagnosis10,
        diagnosis11: medicalCaseData.diagnosis11,
        diagnosis12: medicalCaseData.diagnosis12,
        patReasonDxBox70a: medicalCaseData.patReasonDxBox70a,
        patReasonDxBox70b: medicalCaseData.patReasonDxBox70b,
        patReasonDxBox70c: medicalCaseData.patReasonDxBox70c,
        ppsCodeBox71: medicalCaseData.ppsCodeBox71,
        eciBox72a: medicalCaseData.eciBox72a,
        eciBox72b: medicalCaseData.eciBox72b,
        eciBox72c: medicalCaseData.eciBox72c,
      });
      setSelectedConditionInfo({
        conditCodeBox18: medicalCaseData.conditCodeBox18,
        conditCodeBox19: medicalCaseData.conditCodeBox19,
        conditCodeBox20: medicalCaseData.conditCodeBox20,
        conditCodeBox21: medicalCaseData.conditCodeBox21,
        conditCodeBox22: medicalCaseData.conditCodeBox22,
        conditCodeBox23: medicalCaseData.conditCodeBox23,
        conditCodeBox24: medicalCaseData.conditCodeBox24,
        conditCodeBox25: medicalCaseData.conditCodeBox25,
        conditCodeBox26: medicalCaseData.conditCodeBox26,
        conditCodeBox27: medicalCaseData.conditCodeBox27,
        conditCodeBox28: medicalCaseData.conditCodeBox28,
      });
      setSelectedOccurrenceInfo({
        occurrCodeBox31: medicalCaseData.occurrCodeBox31,
        occurrDateBox31: medicalCaseData.occurrDateBox31,
        occurrCodeBox32: medicalCaseData.occurrCodeBox32,
        occurrDateBox32: medicalCaseData.occurrDateBox32,
        occurrCodeBox33: medicalCaseData.occurrCodeBox33,
        occurrDateBox33: medicalCaseData.occurrDateBox33,
        occurrCodeBox34: medicalCaseData.occurrCodeBox34,
        occurrDateBox34: medicalCaseData.occurrDateBox34,
      });
      setSelectedOccurrenceSpanInfo({
        occurrSpanCodeBox35: medicalCaseData.occurrSpanCodeBox35,
        occurrSpanFromDateBox35: medicalCaseData.occurrSpanFromDateBox35,
        occurrSpanToDateBox35: medicalCaseData.occurrSpanToDateBox35,
        occurrSpanCodeBox36: medicalCaseData.occurrSpanCodeBox36,
        occurrSpanFromDateBox36: medicalCaseData.occurrSpanFromDateBox36,
        occurrSpanToDateBox36: medicalCaseData.occurrSpanToDateBox36,
      });
      setSelectedValueInfo({
        valCodeBox39a: medicalCaseData.valCodeBox39a,
        valCodeAmtBox39a: medicalCaseData.valCodeAmtBox39a,
        valCodeBox39b: medicalCaseData.valCodeBox39b,
        valCodeAmtBox39b: medicalCaseData.valCodeAmtBox39b,
        valCodeBox39c: medicalCaseData.valCodeBox39c,
        valCodeAmtBox39c: medicalCaseData.valCodeAmtBox39c,
        valCodeBox39d: medicalCaseData.valCodeBox39d,
        valCodeAmtBox39d: medicalCaseData.valCodeAmtBox39d,
        valCodeBox40a: medicalCaseData.valCodeBox40a,
        valCodeAmtBox40a: medicalCaseData.valCodeAmtBox40a,
        valCodeBox40b: medicalCaseData.valCodeBox40b,
        valCodeAmtBox40b: medicalCaseData.valCodeAmtBox40b,
        valCodeBox40c: medicalCaseData.valCodeBox40c,
        valCodeAmtBox40c: medicalCaseData.valCodeAmtBox40c,
        valCodeBox40d: medicalCaseData.valCodeBox40d,
        valCodeAmtBox40d: medicalCaseData.valCodeAmtBox40d,
        valCodeBox41a: medicalCaseData.valCodeBox41a,
        valCodeAmtBox41a: medicalCaseData.valCodeAmtBox41a,
        valCodeBox41b: medicalCaseData.valCodeBox41b,
        valCodeAmtBox41b: medicalCaseData.valCodeAmtBox41b,
        valCodeBox41c: medicalCaseData.valCodeBox41c,
        valCodeAmtBox41c: medicalCaseData.valCodeAmtBox41c,
        valCodeBox41d: medicalCaseData.valCodeBox41d,
        valCodeAmtBox41d: medicalCaseData.valCodeAmtBox41d,
      });
      setSelectedProcedureInfo({
        princProcedureCodeBox74: medicalCaseData.princProcedureCodeBox74,
        princProcedureDateBox74: medicalCaseData.princProcedureDateBox74,
        othProcedureCodeBox74a: medicalCaseData.othProcedureCodeBox74a,
        othProcedureDateBox74a: medicalCaseData.othProcedureDateBox74a,
        othProcedureCodeBox74b: medicalCaseData.othProcedureCodeBox74b,
        othProcedureDateBox74b: medicalCaseData.othProcedureDateBox74b,
        othProcedureCodeBox74c: medicalCaseData.othProcedureCodeBox74c,
        othProcedureDateBox74c: medicalCaseData.othProcedureDateBox74c,
        othProcedureCodeBox74d: medicalCaseData.othProcedureCodeBox74d,
        othProcedureDateBox74d: medicalCaseData.othProcedureDateBox74d,
        othProcedureCodeBox74e: medicalCaseData.othProcedureCodeBox74e,
        othProcedureDateBox74e: medicalCaseData.othProcedureDateBox74e,
      });
    }
  }, [medicalCaseData]);
  const [diagnosis1Data, setDiagnosis1Data] = useState<ICDSearchOutput[]>([]);
  const getICDsForDiagnosis1 = async (value: string) => {
    const res = await icdSearchRequest(value);
    if (res) {
      setDiagnosis1Data(res);
    }
  };
  useEffect(() => {
    if (diagnosisSearchValue) {
      getICDsForDiagnosis1(diagnosisSearchValue);
    }
  }, [diagnosisSearchValue]);
  useEffect(() => {
    if (selectedConditionInfo && isViewMode) {
      const selectedCondtionCodesValues = conditionCodeFields.map((row) => {
        if (row.id === 1 && selectedConditionInfo.conditCodeBox18) {
          return {
            ...row,
            checked: true,
            selectedValue: medicalCaseLookupsData?.conditionCodeData.filter(
              (m) => m.code === selectedConditionInfo.conditCodeBox18
            )[0],
          };
        }
        if (row.id === 2 && selectedConditionInfo.conditCodeBox19) {
          return {
            ...row,
            checked: true,
            selectedValue: medicalCaseLookupsData?.conditionCodeData.filter(
              (m) => m.code === selectedConditionInfo.conditCodeBox19
            )[0],
          };
        }
        if (row.id === 3 && selectedConditionInfo.conditCodeBox20) {
          return {
            ...row,
            checked: true,
            selectedValue: medicalCaseLookupsData?.conditionCodeData.filter(
              (m) => m.code === selectedConditionInfo.conditCodeBox20
            )[0],
          };
        }
        if (row.id === 4 && selectedConditionInfo.conditCodeBox21) {
          return {
            ...row,
            checked: true,
            selectedValue: medicalCaseLookupsData?.conditionCodeData.filter(
              (m) => m.code === selectedConditionInfo.conditCodeBox21
            )[0],
          };
        }
        if (row.id === 5 && selectedConditionInfo.conditCodeBox22) {
          return {
            ...row,
            checked: true,
            selectedValue: medicalCaseLookupsData?.conditionCodeData.filter(
              (m) => m.code === selectedConditionInfo.conditCodeBox22
            )[0],
          };
        }
        if (row.id === 6 && selectedConditionInfo.conditCodeBox23) {
          return {
            ...row,
            checked: true,
            selectedValue: medicalCaseLookupsData?.conditionCodeData.filter(
              (m) => m.code === selectedConditionInfo.conditCodeBox23
            )[0],
          };
        }
        if (row.id === 7 && selectedConditionInfo.conditCodeBox24) {
          return {
            ...row,
            checked: true,
            selectedValue: medicalCaseLookupsData?.conditionCodeData.filter(
              (m) => m.code === selectedConditionInfo.conditCodeBox24
            )[0],
          };
        }
        if (row.id === 8 && selectedConditionInfo.conditCodeBox25) {
          return {
            ...row,
            checked: true,
            selectedValue: medicalCaseLookupsData?.conditionCodeData.filter(
              (m) => m.code === selectedConditionInfo.conditCodeBox25
            )[0],
          };
        }
        if (row.id === 9 && selectedConditionInfo.conditCodeBox26) {
          return {
            ...row,
            checked: true,
            selectedValue: medicalCaseLookupsData?.conditionCodeData.filter(
              (m) => m.code === selectedConditionInfo.conditCodeBox26
            )[0],
          };
        }
        if (row.id === 10 && selectedConditionInfo.conditCodeBox27) {
          return {
            ...row,
            checked: true,
            selectedValue: medicalCaseLookupsData?.conditionCodeData.filter(
              (m) => m.code === selectedConditionInfo.conditCodeBox27
            )[0],
          };
        }
        if (row.id === 11 && selectedConditionInfo.conditCodeBox28) {
          return {
            ...row,
            checked: true,
            selectedValue: medicalCaseLookupsData?.conditionCodeData.filter(
              (m) => m.code === selectedConditionInfo.conditCodeBox28
            )[0],
          };
        }
        return row;
      });
      const selectedConditionFields = selectedCondtionCodesValues.filter(
        (m) => m.checked
      );
      setSelectedConditionFieldDropdown(selectedConditionFields);
      setConditionCodeFields(selectedCondtionCodesValues);
    }
  }, [selectedConditionInfo]);
  useEffect(() => {
    if (selectedDiagnosisInfo && isViewMode) {
      const res = diagnosisCodeFields.map((row) => {
        if (row.id === 1 && selectedDiagnosisInfo.admitDxBox69) {
          return {
            ...row,
            checked: true,
            searchedValue: selectedDiagnosisInfo.admitDxBox69,
          };
        }
        if (row.id === 3 && selectedDiagnosisInfo.diagnosis2) {
          return {
            ...row,
            checked: true,
            searchedValue: selectedDiagnosisInfo.diagnosis2,
          };
        }
        if (row.id === 4 && selectedDiagnosisInfo.diagnosis3) {
          return {
            ...row,
            checked: true,
            searchedValue: selectedDiagnosisInfo.diagnosis3,
          };
        }
        if (row.id === 5 && selectedDiagnosisInfo.diagnosis4) {
          return {
            ...row,
            checked: true,
            searchedValue: selectedDiagnosisInfo.diagnosis4,
          };
        }
        if (row.id === 6 && selectedDiagnosisInfo.diagnosis5) {
          return {
            ...row,
            checked: true,
            searchedValue: selectedDiagnosisInfo.diagnosis5,
          };
        }
        if (row.id === 7 && selectedDiagnosisInfo.diagnosis6) {
          return {
            ...row,
            checked: true,
            searchedValue: selectedDiagnosisInfo.diagnosis6,
          };
        }
        if (row.id === 8 && selectedDiagnosisInfo.diagnosis7) {
          return {
            ...row,
            checked: true,
            searchedValue: selectedDiagnosisInfo.diagnosis7,
          };
        }
        if (row.id === 9 && selectedDiagnosisInfo.diagnosis8) {
          return {
            ...row,
            checked: true,
            searchedValue: selectedDiagnosisInfo.diagnosis8,
          };
        }
        if (row.id === 10 && selectedDiagnosisInfo.diagnosis9) {
          return {
            ...row,
            checked: true,
            searchedValue: selectedDiagnosisInfo.diagnosis9,
          };
        }
        if (row.id === 11 && selectedDiagnosisInfo.diagnosis10) {
          return {
            ...row,
            checked: true,
            searchedValue: selectedDiagnosisInfo.diagnosis10,
          };
        }
        if (row.id === 12 && selectedDiagnosisInfo.diagnosis11) {
          return {
            ...row,
            checked: true,
            searchedValue: selectedDiagnosisInfo.diagnosis11,
          };
        }
        if (row.id === 13 && selectedDiagnosisInfo.diagnosis12) {
          return {
            ...row,
            checked: true,
            searchedValue: selectedDiagnosisInfo.diagnosis12,
          };
        }
        if (row.id === 14 && selectedDiagnosisInfo.patReasonDxBox70a) {
          return {
            ...row,
            checked: true,
            searchedValue: selectedDiagnosisInfo.patReasonDxBox70a,
          };
        }
        if (row.id === 15 && selectedDiagnosisInfo.patReasonDxBox70b) {
          return {
            ...row,
            checked: true,
            searchedValue: selectedDiagnosisInfo.patReasonDxBox70b,
          };
        }
        if (row.id === 16 && selectedDiagnosisInfo.patReasonDxBox70c) {
          return {
            ...row,
            checked: true,
            searchedValue: selectedDiagnosisInfo.patReasonDxBox70c,
          };
        }
        if (row.id === 17 && selectedDiagnosisInfo.ppsCodeBox71) {
          return {
            ...row,
            checked: true,
            selectedValue: selectedDiagnosisInfo.ppsCodeBox71,
          };
        }
        if (row.id === 18 && selectedDiagnosisInfo.eciBox72a) {
          return {
            ...row,
            checked: true,
            searchedValue: selectedDiagnosisInfo.eciBox72a,
          };
        }
        if (row.id === 19 && selectedDiagnosisInfo.eciBox72b) {
          return {
            ...row,
            checked: true,
            searchedValue: selectedDiagnosisInfo.eciBox72b,
          };
        }
        if (row.id === 20 && selectedDiagnosisInfo.eciBox72c) {
          return {
            ...row,
            checked: true,
            searchedValue: selectedDiagnosisInfo.eciBox72c,
          };
        }
        return row;
      });
      const selectedDiagnosisFields = res.filter((m) => m.checked);
      setSelectedDiagnosisFieldDropdown(selectedDiagnosisFields);
      setDiagnosisCodeFields(res);
      // if (icdSeachFlag) {
      if (res) {
        getIcdSearch(res, true);
      }
    }
  }, [selectedDiagnosisInfo]);
  useEffect(() => {
    if (
      selectedOccurrenceInfo &&
      isViewMode &&
      medicalCaseLookupsData?.occurrenceCodeData
    ) {
      const selectedOccuranceValues = occuranceCodeFields.map((row) => {
        if (row.id === 1 && selectedOccurrenceInfo.occurrCodeBox31) {
          return {
            ...row,
            checked: true,
            selectedValue: medicalCaseLookupsData?.occurrenceCodeData.filter(
              (m) => m.code === selectedOccurrenceInfo.occurrCodeBox31
            )[0],
          };
        }
        if (row.id === 2 && selectedOccurrenceInfo.occurrDateBox31) {
          return {
            ...row,
            checked: true,
            selectedValue: selectedOccurrenceInfo.occurrDateBox31,
          };
        }
        if (row.id === 3 && selectedOccurrenceInfo.occurrCodeBox32) {
          return {
            ...row,
            checked: true,
            selectedValue: medicalCaseLookupsData?.occurrenceCodeData.filter(
              (m) => m.code === selectedOccurrenceInfo?.occurrCodeBox32
            )[0],
          };
        }
        if (row.id === 4 && selectedOccurrenceInfo.occurrDateBox32) {
          return {
            ...row,
            checked: true,
            selectedValue: selectedOccurrenceInfo.occurrDateBox32,
          };
        }
        if (row.id === 5 && selectedOccurrenceInfo.occurrCodeBox33) {
          return {
            ...row,
            checked: true,
            selectedValue: medicalCaseLookupsData?.occurrenceCodeData.filter(
              (m) => m.code === selectedOccurrenceInfo.occurrCodeBox33
            )[0],
          };
        }
        if (row.id === 6 && selectedOccurrenceInfo.occurrDateBox33) {
          return {
            ...row,
            checked: true,
            selectedValue: selectedOccurrenceInfo.occurrDateBox33,
          };
        }
        if (row.id === 7 && selectedOccurrenceInfo.occurrCodeBox34) {
          return {
            ...row,
            checked: true,
            selectedValue: medicalCaseLookupsData?.occurrenceCodeData.filter(
              (m) => m.code === selectedOccurrenceInfo.occurrDateBox34
            )[0],
          };
        }
        if (row.id === 8 && selectedOccurrenceInfo.occurrDateBox34) {
          return {
            ...row,
            checked: true,
            selectedValue: selectedOccurrenceInfo.occurrDateBox34,
          };
        }
        return row;
      });
      const selectedOccuranceFields = selectedOccuranceValues.filter(
        (m) => m.checked
      );
      setSelectedOccuranceFieldDropdown(selectedOccuranceFields);
      setOccuranceCodeFields(selectedOccuranceValues);
    }
  }, [selectedOccurrenceInfo, medicalCaseLookupsData]);
  useEffect(() => {
    if (
      selectedOccurrenceSpanInfo &&
      isViewMode &&
      medicalCaseLookupsData?.occurrenceSpanCodeData
    ) {
      const selectedOccuranceSpanValues = occuranceSpanCodeFields.map((row) => {
        if (row.id === 1 && selectedOccurrenceSpanInfo.occurrSpanCodeBox35) {
          return {
            ...row,
            checked: true,
            selectedValue:
              medicalCaseLookupsData?.occurrenceSpanCodeData.filter(
                (m) => m.code === selectedOccurrenceSpanInfo.occurrSpanCodeBox35
              )[0],
          };
        }
        if (
          row.id === 2 &&
          selectedOccurrenceSpanInfo.occurrSpanFromDateBox35
        ) {
          return {
            ...row,
            checked: true,
            selectedValue: selectedOccurrenceSpanInfo.occurrSpanFromDateBox35,
          };
        }
        if (row.id === 3 && selectedOccurrenceSpanInfo.occurrSpanToDateBox35) {
          return {
            ...row,
            checked: true,
            selectedValue: selectedOccurrenceSpanInfo.occurrSpanToDateBox35,
          };
        }
        if (row.id === 4 && selectedOccurrenceSpanInfo.occurrSpanCodeBox36) {
          return {
            ...row,
            checked: true,
            selectedValue:
              medicalCaseLookupsData?.occurrenceSpanCodeData.filter(
                (m) => m.code === selectedOccurrenceSpanInfo.occurrSpanCodeBox36
              )[0],
          };
        }
        if (
          row.id === 5 &&
          selectedOccurrenceSpanInfo.occurrSpanFromDateBox36
        ) {
          return {
            ...row,
            checked: true,
            selectedValue: selectedOccurrenceSpanInfo.occurrSpanFromDateBox36,
          };
        }
        if (row.id === 6 && selectedOccurrenceSpanInfo.occurrSpanToDateBox36) {
          return {
            ...row,
            checked: true,
            selectedValue: selectedOccurrenceSpanInfo.occurrSpanToDateBox36,
          };
        }

        return row;
      });
      const selectedOccuranceSpanFields = selectedOccuranceSpanValues.filter(
        (m) => m.checked
      );
      setSelectedOccuranceSpanFieldDropdown(selectedOccuranceSpanFields);
      setOccuranceSpanCodeFields(selectedOccuranceSpanValues);
    }
  }, [selectedOccurrenceSpanInfo, medicalCaseLookupsData]);
  useEffect(() => {
    if (selectedValueInfo && isViewMode) {
      const selectedValueCodeValues = valueCodeFields.map((row) => {
        if (row.id === 1 && selectedValueInfo.valCodeBox39a) {
          return {
            ...row,
            checked: true,
            selectedValue: medicalCaseLookupsData?.valueCodeData.filter(
              (m) => m.code === selectedValueInfo.valCodeBox39a
            )[0],
          };
        }
        if (row.id === 3 && selectedValueInfo.valCodeBox39b) {
          return {
            ...row,
            checked: true,
            selectedValue: medicalCaseLookupsData?.valueCodeData.filter(
              (m) => m.code === selectedValueInfo.valCodeBox39b
            )[0],
          };
        }
        if (row.id === 5 && selectedValueInfo.valCodeBox39c) {
          return {
            ...row,
            checked: true,
            selectedValue: medicalCaseLookupsData?.valueCodeData.filter(
              (m) => m.code === selectedValueInfo.valCodeBox39c
            )[0],
          };
        }
        if (row.id === 7 && selectedValueInfo.valCodeBox39d) {
          return {
            ...row,
            checked: true,
            selectedValue: medicalCaseLookupsData?.valueCodeData.filter(
              (m) => m.code === selectedValueInfo.valCodeBox39d
            )[0],
          };
        }
        if (row.id === 2 && selectedValueInfo.valCodeAmtBox39a) {
          return {
            ...row,
            checked: true,
            selectedValue: selectedValueInfo.valCodeAmtBox39a,
          };
        }
        if (row.id === 4 && selectedValueInfo.valCodeAmtBox39b) {
          return {
            ...row,
            checked: true,
            selectedValue: selectedValueInfo.valCodeAmtBox39b,
          };
        }
        if (row.id === 6 && selectedValueInfo.valCodeAmtBox39c) {
          return {
            ...row,
            checked: true,
            selectedValue: selectedValueInfo.valCodeAmtBox39c,
          };
        }
        if (row.id === 8 && selectedValueInfo.valCodeAmtBox39d) {
          return {
            ...row,
            checked: true,
            selectedValue: selectedValueInfo.valCodeAmtBox39d,
          };
        }
        if (row.id === 9 && selectedValueInfo.valCodeBox40a) {
          return {
            ...row,
            checked: true,
            selectedValue: medicalCaseLookupsData?.valueCodeData.filter(
              (m) => m.code === selectedValueInfo.valCodeBox40a
            )[0],
          };
        }
        if (row.id === 11 && selectedValueInfo.valCodeBox40b) {
          return {
            ...row,
            checked: true,
            selectedValue: medicalCaseLookupsData?.valueCodeData.filter(
              (m) => m.code === selectedValueInfo.valCodeBox40b
            )[0],
          };
        }
        if (row.id === 13 && selectedValueInfo.valCodeBox40c) {
          return {
            ...row,
            checked: true,
            selectedValue: medicalCaseLookupsData?.valueCodeData.filter(
              (m) => m.code === selectedValueInfo.valCodeBox40c
            )[0],
          };
        }
        if (row.id === 15 && selectedValueInfo.valCodeBox40d) {
          return {
            ...row,
            checked: true,
            selectedValue: medicalCaseLookupsData?.valueCodeData.filter(
              (m) => m.code === selectedValueInfo.valCodeBox40d
            )[0],
          };
        }
        if (row.id === 10 && selectedValueInfo.valCodeAmtBox40a) {
          return {
            ...row,
            checked: true,
            selectedValue: selectedValueInfo.valCodeAmtBox40a,
          };
        }
        if (row.id === 12 && selectedValueInfo.valCodeAmtBox40b) {
          return {
            ...row,
            checked: true,
            selectedValue: selectedValueInfo.valCodeAmtBox40b,
          };
        }
        if (row.id === 14 && selectedValueInfo.valCodeAmtBox40c) {
          return {
            ...row,
            checked: true,
            selectedValue: selectedValueInfo.valCodeAmtBox40c,
          };
        }
        if (row.id === 16 && selectedValueInfo.valCodeAmtBox40d) {
          return {
            ...row,
            checked: true,
            selectedValue: selectedValueInfo.valCodeAmtBox40d,
          };
        }
        if (row.id === 17 && selectedValueInfo.valCodeBox41a) {
          return {
            ...row,
            checked: true,
            selectedValue: medicalCaseLookupsData?.valueCodeData.filter(
              (m) => m.code === selectedValueInfo.valCodeBox41a
            )[0],
          };
        }
        if (row.id === 19 && selectedValueInfo.valCodeBox41b) {
          return {
            ...row,
            checked: true,
            selectedValue: medicalCaseLookupsData?.valueCodeData.filter(
              (m) => m.code === selectedValueInfo.valCodeBox41b
            )[0],
          };
        }
        if (row.id === 21 && selectedValueInfo.valCodeBox41c) {
          return {
            ...row,
            checked: true,
            selectedValue: medicalCaseLookupsData?.valueCodeData.filter(
              (m) => m.code === selectedValueInfo.valCodeBox41c
            )[0],
          };
        }
        if (row.id === 23 && selectedValueInfo.valCodeBox41d) {
          return {
            ...row,
            checked: true,
            selectedValue: medicalCaseLookupsData?.valueCodeData.filter(
              (m) => m.code === selectedValueInfo.valCodeBox41d
            )[0],
          };
        }
        if (row.id === 18 && selectedValueInfo.valCodeAmtBox41a) {
          return {
            ...row,
            checked: true,
            selectedValue: selectedValueInfo.valCodeAmtBox41a,
          };
        }
        if (row.id === 20 && selectedValueInfo.valCodeAmtBox41b) {
          return {
            ...row,
            checked: true,
            selectedValue: selectedValueInfo.valCodeAmtBox41b,
          };
        }
        if (row.id === 22 && selectedValueInfo.valCodeAmtBox41c) {
          return {
            ...row,
            checked: true,
            selectedValue: selectedValueInfo.valCodeAmtBox41c,
          };
        }
        if (row.id === 24 && selectedValueInfo.valCodeAmtBox41d) {
          return {
            ...row,
            checked: true,
            selectedValue: selectedValueInfo.valCodeAmtBox41d,
          };
        }
        return row;
      });
      const selectedValueFields = selectedValueCodeValues.filter(
        (m) => m.checked
      );
      setSelectedValueFieldDropdown(selectedValueFields);
      setValueCodeFields(selectedValueCodeValues);
    }
  }, [selectedValueInfo]);

  useEffect(() => {
    if (selectedProcedureInfo && isViewMode) {
      const procedureFieldSearchValue = principleProcedureCodeFields.map(
        (row) => {
          if (row.id === 1 && selectedProcedureInfo.princProcedureCodeBox74) {
            return {
              ...row,
              checked: true,
              searchedValue: selectedProcedureInfo.princProcedureCodeBox74,
              // selectedValue: medicalCaseData?.admitDxBox69,
            };
          }
          if (row.id === 2 && selectedProcedureInfo.princProcedureDateBox74) {
            return {
              ...row,
              checked: true,
              selectedValue: selectedProcedureInfo.princProcedureDateBox74,
            };
          }
          if (row.id === 3 && selectedProcedureInfo.othProcedureCodeBox74a) {
            return {
              ...row,
              checked: true,
              searchedValue: selectedProcedureInfo.othProcedureCodeBox74a,
            };
          }
          if (row.id === 4 && selectedProcedureInfo.othProcedureDateBox74a) {
            return {
              ...row,
              checked: true,
              selectedValue: selectedProcedureInfo.othProcedureDateBox74a,
            };
          }
          if (row.id === 5 && selectedProcedureInfo.othProcedureCodeBox74b) {
            return {
              ...row,
              checked: true,
              searchedValue: selectedProcedureInfo.othProcedureCodeBox74b,
            };
          }
          if (row.id === 6 && selectedProcedureInfo.othProcedureDateBox74b) {
            return {
              ...row,
              checked: true,
              selectedValue: selectedProcedureInfo.othProcedureDateBox74b,
            };
          }
          if (row.id === 7 && selectedProcedureInfo.othProcedureCodeBox74c) {
            return {
              ...row,
              checked: true,
              searchedValue: selectedProcedureInfo.othProcedureCodeBox74c,
            };
          }
          if (row.id === 8 && selectedProcedureInfo.othProcedureDateBox74c) {
            return {
              ...row,
              checked: true,
              selectedValue: selectedProcedureInfo.othProcedureDateBox74c,
            };
          }
          if (row.id === 9 && selectedProcedureInfo.othProcedureCodeBox74d) {
            return {
              ...row,
              checked: true,
              searchedValue: selectedProcedureInfo.othProcedureCodeBox74d,
            };
          }
          if (row.id === 10 && selectedProcedureInfo.othProcedureDateBox74d) {
            return {
              ...row,
              checked: true,
              selectedValue: selectedProcedureInfo.othProcedureDateBox74d,
            };
          }
          if (row.id === 11 && selectedProcedureInfo.othProcedureCodeBox74e) {
            return {
              ...row,
              checked: true,
              searchedValue: selectedProcedureInfo.othProcedureCodeBox74e,
            };
          }
          if (row.id === 12 && selectedProcedureInfo.othProcedureDateBox74e) {
            return {
              ...row,
              checked: true,
              selectedValue: selectedProcedureInfo.othProcedureDateBox74e,
            };
          }
          return row;
        }
      );
      const selectedProcedureFields = procedureFieldSearchValue.filter(
        (m) => m.checked
      );
      setSelectedPrincipleProcFieldDropdown(selectedProcedureFields);
      setPrincipleProcedureCodeFields(procedureFieldSearchValue);
      // if (icdSeachFlag) {
      if (procedureFieldSearchValue) {
        getIcdSearchForProcedureCodes(procedureFieldSearchValue, true);
      }
    }
  }, [selectedProcedureInfo]);

  useEffect(() => {
    if (medicalCaseLookupsData) {
      setConditionCodeFields((prevFields) =>
        prevFields.map((field) => ({
          ...field,
          data: medicalCaseLookupsData.conditionCodeData,
        }))
      );
      setOccuranceCodeFields((prevFields) =>
        prevFields.map((field) => ({
          ...field,
          data: medicalCaseLookupsData.occurrenceCodeData,
        }))
      );
      setOccuranceSpanCodeFields((prevFields) =>
        prevFields.map((field) => ({
          ...field,
          data: medicalCaseLookupsData.occurrenceSpanCodeData,
        }))
      );
      setValueCodeFields((prevFields) =>
        prevFields.map((field) => ({
          ...field,
          data: medicalCaseLookupsData.valueCodeData,
        }))
      );
    }
  }, [medicalCaseLookupsData]);

  const fieldsSquenceValidations = () => {
    let isSeqValid = true;
    const sequenceDiagnosisFields = [
      selectedDiagnosisInfo.diagnosis2,
      selectedDiagnosisInfo.diagnosis3,
      selectedDiagnosisInfo.diagnosis4,
      selectedDiagnosisInfo.diagnosis5,
      selectedDiagnosisInfo.diagnosis6,
      selectedDiagnosisInfo.diagnosis7,
      selectedDiagnosisInfo.diagnosis8,
      selectedDiagnosisInfo.diagnosis9,
      selectedDiagnosisInfo.diagnosis10,
      selectedDiagnosisInfo.diagnosis11,
      selectedDiagnosisInfo.diagnosis12,
    ];
    let firstEmptyDiagnosisIndex = -1;
    for (let i = 0; i < sequenceDiagnosisFields.length; i += 1) {
      if (sequenceDiagnosisFields[i] === '') {
        firstEmptyDiagnosisIndex = i;
        break;
      }
    }
    if (firstEmptyDiagnosisIndex !== -1) {
      for (
        let i = firstEmptyDiagnosisIndex + 1;
        i < sequenceDiagnosisFields.length;
        i += 1
      ) {
        if (sequenceDiagnosisFields[i] !== '') {
          dispatch(
            addToastNotification({
              id: uuidv4(),
              text: `Diagnosis fields must be selected in sequence without gaps.`,
              toastType: ToastType.ERROR,
            })
          );
          isSeqValid = false;
          break;
        }
      }
    }
    const sequencepatReasonFields = [
      selectedDiagnosisInfo.patReasonDxBox70a,
      selectedDiagnosisInfo.patReasonDxBox70b,
      selectedDiagnosisInfo.patReasonDxBox70c,
    ];
    let firstEmptypatReasonIndex = -1;
    for (let i = 0; i < sequencepatReasonFields.length; i += 1) {
      if (sequencepatReasonFields[i] === '') {
        firstEmptypatReasonIndex = i;
        break;
      }
    }
    if (firstEmptypatReasonIndex !== -1) {
      for (
        let i = firstEmptypatReasonIndex + 1;
        i < sequencepatReasonFields.length;
        i += 1
      ) {
        if (sequencepatReasonFields[i] !== '') {
          dispatch(
            addToastNotification({
              id: uuidv4(),
              text: `PatientReasonDx fields must be selected in sequence.`,
              toastType: ToastType.ERROR,
            })
          );
          isSeqValid = false;
          break;
        }
      }
    }
    const sequenceeciBoxFields = [
      selectedDiagnosisInfo.eciBox72a,
      selectedDiagnosisInfo.eciBox72b,
      selectedDiagnosisInfo.eciBox72c,
    ];
    let firstEmptyeciBoxIndex = -1;
    for (let i = 0; i < sequenceeciBoxFields.length; i += 1) {
      if (sequenceeciBoxFields[i] === '') {
        firstEmptyeciBoxIndex = i;
        break;
      }
    }
    if (firstEmptyeciBoxIndex !== -1) {
      for (
        let i = firstEmptyeciBoxIndex + 1;
        i < sequenceeciBoxFields.length;
        i += 1
      ) {
        if (sequenceeciBoxFields[i] !== '') {
          dispatch(
            addToastNotification({
              id: uuidv4(),
              text: `ECIDx fields must be selected in sequence.`,
              toastType: ToastType.ERROR,
            })
          );
          isSeqValid = false;
          break;
        }
      }
    }
    const sequenceConditionFields = Object.values(selectedConditionInfo);
    let firstEmptyConditionIndex = -1;
    for (let i = 0; i < sequenceConditionFields.length; i += 1) {
      if (sequenceConditionFields[i] === '') {
        firstEmptyConditionIndex = i;
        break;
      }
    }
    if (firstEmptyConditionIndex !== -1) {
      for (
        let i = firstEmptyConditionIndex + 1;
        i < sequenceConditionFields.length;
        i += 1
      ) {
        if (sequenceConditionFields[i] !== '') {
          dispatch(
            addToastNotification({
              id: uuidv4(),
              text: `Condition fields must be selected in sequence.`,
              toastType: ToastType.ERROR,
            })
          );
          isSeqValid = false;
          break;
        }
      }
    }
    const sequenceOccurenceFields = [
      selectedOccurrenceInfo.occurrCodeBox31,
      selectedOccurrenceInfo.occurrCodeBox32,
      selectedOccurrenceInfo.occurrCodeBox33,
      selectedOccurrenceInfo.occurrCodeBox34,
    ];
    let firstEmptyOccurenceIndex = -1;
    for (let i = 0; i < sequenceOccurenceFields.length; i += 1) {
      if (sequenceOccurenceFields[i] === '') {
        firstEmptyOccurenceIndex = i;
        break;
      }
    }
    if (firstEmptyOccurenceIndex !== -1) {
      for (
        let i = firstEmptyOccurenceIndex + 1;
        i < sequenceOccurenceFields.length;
        i += 1
      ) {
        if (sequenceOccurenceFields[i] !== '') {
          dispatch(
            addToastNotification({
              id: uuidv4(),
              text: `Occurence Code fields must be selected in sequence.`,
              toastType: ToastType.ERROR,
            })
          );
          isSeqValid = false;
          break;
        }
      }
    }
    const sequenceOccurenceSpanFields = [
      selectedOccurrenceSpanInfo.occurrSpanCodeBox35,
      selectedOccurrenceSpanInfo.occurrSpanCodeBox36,
    ];
    let firstEmptyOccurenceSpanIndex = -1;
    for (let i = 0; i < sequenceOccurenceSpanFields.length; i += 1) {
      if (sequenceOccurenceSpanFields[i] === '') {
        firstEmptyOccurenceSpanIndex = i;
        break;
      }
    }
    if (firstEmptyOccurenceSpanIndex !== -1) {
      for (
        let i = firstEmptyOccurenceSpanIndex + 1;
        i < sequenceOccurenceSpanFields.length;
        i += 1
      ) {
        if (sequenceOccurenceSpanFields[i] !== '') {
          dispatch(
            addToastNotification({
              id: uuidv4(),
              text: `Occurence Span Code fields must be selected in sequence.`,
              toastType: ToastType.ERROR,
            })
          );
          isSeqValid = false;
          break;
        }
      }
    }
    const sequenceValueFields = [
      selectedValueInfo.valCodeBox39a,
      selectedValueInfo.valCodeBox39b,
      selectedValueInfo.valCodeBox39c,
      selectedValueInfo.valCodeBox39d,
      selectedValueInfo.valCodeBox40a,
      selectedValueInfo.valCodeBox40b,
      selectedValueInfo.valCodeBox40c,
      selectedValueInfo.valCodeBox40d,
      selectedValueInfo.valCodeBox41a,
      selectedValueInfo.valCodeBox41b,
      selectedValueInfo.valCodeBox41c,
      selectedValueInfo.valCodeBox41d,
    ];
    let firstEmptyValueIndex = -1;
    for (let i = 0; i < sequenceValueFields.length; i += 1) {
      if (sequenceValueFields[i] === '') {
        firstEmptyValueIndex = i;
        break;
      }
    }
    if (firstEmptyValueIndex !== -1) {
      for (
        let i = firstEmptyValueIndex + 1;
        i < sequenceValueFields.length;
        i += 1
      ) {
        if (sequenceValueFields[i] !== '') {
          dispatch(
            addToastNotification({
              id: uuidv4(),
              text: `Value Code fields must be selected in sequence.`,
              toastType: ToastType.ERROR,
            })
          );
          isSeqValid = false;
          break;
        }
      }
    }
    const sequencePrincProcFields = [
      selectedProcedureInfo.princProcedureCodeBox74,
      selectedProcedureInfo.othProcedureCodeBox74a,
      selectedProcedureInfo.othProcedureCodeBox74b,
      selectedProcedureInfo.othProcedureCodeBox74c,
      selectedProcedureInfo.othProcedureCodeBox74d,
      selectedProcedureInfo.othProcedureCodeBox74e,
    ];
    let firstEmptyPrincProcIndex = -1;
    for (let i = 0; i < sequencePrincProcFields.length; i += 1) {
      if (sequencePrincProcFields[i] === '') {
        firstEmptyPrincProcIndex = i;
        break;
      }
    }
    if (firstEmptyPrincProcIndex !== -1) {
      for (
        let i = firstEmptyPrincProcIndex + 1;
        i < sequencePrincProcFields.length;
        i += 1
      ) {
        if (sequencePrincProcFields[i] !== '') {
          dispatch(
            addToastNotification({
              id: uuidv4(),
              text: `Principle/Other Procedure Code fields must be selected in sequence.`,
              toastType: ToastType.ERROR,
            })
          );
          isSeqValid = false;
          break;
        }
      }
    }
    return isSeqValid;
  };
  const runValidations = () => {
    let isValid = true;
    if (
      !selectedPatientInfo.title ||
      !selectedPatientInfo.facilityID ||
      !selectedPatientInfo.patientInsuranceID ||
      !selectedPatientInfo.frequencyCode ||
      !selectedPatientInfo.admissionPriorityCode ||
      !selectedPatientInfo.admissionSourceCode ||
      !selectedPatientInfo.diagnosis1 ||
      !selectedPatientInfo.caseStatusCode ||
      !selectedPatientInfo.patDischargeStatusCode
    ) {
      setMedicalCaseModalState({
        ...medicalCaseModalState,
        open: true,
        heading: 'Incomplete Information',
        statusModalType: StatusModalType.ERROR,
        description:
          'Please ensure all required fields are filled out before proceeding.',
      });
      isValid = false;
    }
    const diagnosisCodes = [
      selectedPatientInfo.diagnosis1,
      selectedDiagnosisInfo.admitDxBox69,
      selectedDiagnosisInfo.diagnosis2,
      selectedDiagnosisInfo.diagnosis3,
      selectedDiagnosisInfo.diagnosis4,
      selectedDiagnosisInfo.diagnosis5,
      selectedDiagnosisInfo.diagnosis6,
      selectedDiagnosisInfo.diagnosis7,
      selectedDiagnosisInfo.diagnosis8,
      selectedDiagnosisInfo.diagnosis9,
      selectedDiagnosisInfo.diagnosis10,
      selectedDiagnosisInfo.diagnosis11,
      selectedDiagnosisInfo.diagnosis12,
      selectedDiagnosisInfo.eciBox72a,
      selectedDiagnosisInfo.eciBox72b,
      selectedDiagnosisInfo.eciBox72c,
      selectedDiagnosisInfo.patReasonDxBox70a,
      selectedDiagnosisInfo.patReasonDxBox70b,
      selectedDiagnosisInfo.patReasonDxBox70c,
    ].filter((code) => code !== '');
    const uniqueDiagnosisCodes = new Set(diagnosisCodes);

    if (uniqueDiagnosisCodes.size !== diagnosisCodes.length) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: `Diagnosis codes must be unique.`,
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    const conditionCodes = Object.values(selectedConditionInfo).filter(
      (code) => code !== ''
    );
    const uniqueConditionsCodes = new Set(conditionCodes);
    if (uniqueConditionsCodes.size !== conditionCodes.length) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: `Condition codes must be unique.`,
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    const occurrenceCodes = [
      selectedOccurrenceInfo.occurrCodeBox31,
      selectedOccurrenceInfo.occurrCodeBox32,
      selectedOccurrenceInfo.occurrCodeBox33,
      selectedOccurrenceInfo.occurrCodeBox34,
    ].filter((code) => code !== '');
    const uniqueOccurrenceCodes = new Set(occurrenceCodes);

    if (uniqueOccurrenceCodes.size !== occurrenceCodes.length) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: `Occurrence codes must be unique.`,
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    const occurrenceSpanCodes = [
      selectedOccurrenceSpanInfo.occurrSpanCodeBox35,
      selectedOccurrenceSpanInfo.occurrSpanCodeBox36,
    ].filter((code) => code !== '');
    const uniqueOccurrenceSpanCodes = new Set(occurrenceSpanCodes);

    if (uniqueOccurrenceSpanCodes.size !== occurrenceSpanCodes.length) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: `Occurrence Span codes must be unique.`,
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    const ValueCodes = [
      selectedValueInfo.valCodeBox39a,
      selectedValueInfo.valCodeBox39b,
      selectedValueInfo.valCodeBox39c,
      selectedValueInfo.valCodeBox39d,
      selectedValueInfo.valCodeBox40a,
      selectedValueInfo.valCodeBox40b,
      selectedValueInfo.valCodeBox40c,
      selectedValueInfo.valCodeBox40d,
      selectedValueInfo.valCodeBox41a,
      selectedValueInfo.valCodeBox41b,
      selectedValueInfo.valCodeBox41c,
      selectedValueInfo.valCodeBox41d,
    ].filter((code) => code !== '');
    const uniqueValueCodes = new Set(ValueCodes);

    if (uniqueValueCodes.size !== ValueCodes.length) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: `Value codes must be unique.`,
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    const procedureCodes = [
      selectedProcedureInfo.princProcedureCodeBox74,
      selectedProcedureInfo.othProcedureCodeBox74a,
      selectedProcedureInfo.othProcedureCodeBox74b,
      selectedProcedureInfo.othProcedureCodeBox74c,
      selectedProcedureInfo.othProcedureCodeBox74d,
      selectedProcedureInfo.othProcedureCodeBox74e,
    ].filter((code) => code !== '');
    const uniqueProcedureCodes = new Set(procedureCodes);

    if (uniqueProcedureCodes.size !== procedureCodes.length) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: `Principle/Procedure codes must be unique.`,
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (
      (selectedOccurrenceInfo.occurrCodeBox31 &&
        !selectedOccurrenceInfo.occurrDateBox31) ||
      (!selectedOccurrenceInfo.occurrCodeBox31 &&
        selectedOccurrenceInfo.occurrDateBox31)
    ) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: `Please fill in both the fields of Occurrence Code Box 31.`,
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (
      (selectedOccurrenceInfo.occurrCodeBox32 &&
        !selectedOccurrenceInfo.occurrDateBox32) ||
      (!selectedOccurrenceInfo.occurrCodeBox32 &&
        selectedOccurrenceInfo.occurrDateBox32)
    ) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: `Please fill in both the fields of Occurrence Code Box 32.`,
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (
      (selectedOccurrenceInfo.occurrCodeBox33 &&
        !selectedOccurrenceInfo.occurrDateBox33) ||
      (!selectedOccurrenceInfo.occurrCodeBox33 &&
        selectedOccurrenceInfo.occurrDateBox33)
    ) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: `Please fill in both the fields of Occurrence Code Box 33.`,
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (
      (selectedOccurrenceInfo.occurrCodeBox34 &&
        !selectedOccurrenceInfo.occurrDateBox34) ||
      (!selectedOccurrenceInfo.occurrCodeBox34 &&
        selectedOccurrenceInfo.occurrDateBox34)
    ) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: `Please fill in both the fields of Occurrence Code Box 34.`,
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (
      (selectedOccurrenceSpanInfo.occurrSpanFromDateBox35 ||
        selectedOccurrenceSpanInfo.occurrSpanToDateBox35) &&
      !selectedOccurrenceSpanInfo.occurrSpanCodeBox35
    ) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: `Please select a code for Occurrence Span Code Box 35 if any date is filled.`,
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (
      selectedOccurrenceSpanInfo.occurrSpanCodeBox35 &&
      (!selectedOccurrenceSpanInfo.occurrSpanFromDateBox35 ||
        !selectedOccurrenceSpanInfo.occurrSpanToDateBox35)
    ) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: `Please fill in both the "From" and "To" dates for Occurrence Span Code Box 35.`,
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (
      (selectedOccurrenceSpanInfo.occurrSpanFromDateBox36 ||
        selectedOccurrenceSpanInfo.occurrSpanToDateBox36) &&
      !selectedOccurrenceSpanInfo.occurrSpanCodeBox36
    ) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: `Please select a code for Occurrence Span Code Box 36 if any date is filled.`,
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (
      selectedOccurrenceSpanInfo.occurrSpanCodeBox36 &&
      (!selectedOccurrenceSpanInfo.occurrSpanFromDateBox36 ||
        !selectedOccurrenceSpanInfo.occurrSpanToDateBox36)
    ) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: `Please fill in both the "From" and "To" dates for Occurrence Span Code Box 36.`,
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (
      (selectedValueInfo.valCodeBox39a &&
        !selectedValueInfo.valCodeAmtBox39a) ||
      (!selectedValueInfo.valCodeBox39a && selectedValueInfo.valCodeAmtBox39a)
    ) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: `Please fill in both the fields of Value Code Box 39-a.`,
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (
      (selectedValueInfo.valCodeBox39b &&
        !selectedValueInfo.valCodeAmtBox39b) ||
      (!selectedValueInfo.valCodeBox39b && selectedValueInfo.valCodeAmtBox39b)
    ) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: `Please fill in both the fields of Value Code Box 39-b.`,
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (
      (selectedValueInfo.valCodeBox39c &&
        !selectedValueInfo.valCodeAmtBox39c) ||
      (!selectedValueInfo.valCodeBox39c && selectedValueInfo.valCodeAmtBox39c)
    ) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: `Please fill in both the fields of Value Code Box 39-c.`,
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (
      (selectedValueInfo.valCodeBox39d &&
        !selectedValueInfo.valCodeAmtBox39d) ||
      (!selectedValueInfo.valCodeBox39d && selectedValueInfo.valCodeAmtBox39d)
    ) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: `Please fill in both the fields of Value Code Box 39-d.`,
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (
      (selectedValueInfo.valCodeBox40a &&
        !selectedValueInfo.valCodeAmtBox40a) ||
      (!selectedValueInfo.valCodeBox40a && selectedValueInfo.valCodeAmtBox40a)
    ) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: `Please fill in both the fields of Value Code Box 40-a.`,
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (
      (selectedValueInfo.valCodeBox40b &&
        !selectedValueInfo.valCodeAmtBox40b) ||
      (!selectedValueInfo.valCodeBox40b && selectedValueInfo.valCodeAmtBox40b)
    ) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: `Please fill in both the fields of Value Code Box 40-b.`,
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (
      (selectedValueInfo.valCodeBox40c &&
        !selectedValueInfo.valCodeAmtBox40c) ||
      (!selectedValueInfo.valCodeBox40c && selectedValueInfo.valCodeAmtBox40c)
    ) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: `Please fill in both the fields of Value Code Box 40-c.`,
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (
      (selectedValueInfo.valCodeBox40d &&
        !selectedValueInfo.valCodeAmtBox40d) ||
      (!selectedValueInfo.valCodeBox40d && selectedValueInfo.valCodeAmtBox40d)
    ) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: `Please fill in both the fields of Value Code Box 40-d.`,
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (
      (selectedValueInfo.valCodeBox41a &&
        !selectedValueInfo.valCodeAmtBox41a) ||
      (!selectedValueInfo.valCodeBox41a && selectedValueInfo.valCodeAmtBox41a)
    ) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: `Please fill in both the fields of Value Code Box 41-a.`,
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (
      (selectedValueInfo.valCodeBox41b &&
        !selectedValueInfo.valCodeAmtBox41b) ||
      (!selectedValueInfo.valCodeBox41b && selectedValueInfo.valCodeAmtBox41b)
    ) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: `Please fill in both the fields of Value Code Box 41-b.`,
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (
      (selectedValueInfo.valCodeBox41c &&
        !selectedValueInfo.valCodeAmtBox41c) ||
      (!selectedValueInfo.valCodeBox41c && selectedValueInfo.valCodeAmtBox41c)
    ) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: `Please fill in both the fields of Value Code Box 41-c.`,
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (
      (selectedValueInfo.valCodeBox41d &&
        !selectedValueInfo.valCodeAmtBox41d) ||
      (!selectedValueInfo.valCodeBox41d && selectedValueInfo.valCodeAmtBox41d)
    ) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: `Please fill in both the fields of Value Code Box 41-d.`,
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (
      (selectedProcedureInfo.princProcedureCodeBox74 &&
        !selectedProcedureInfo.princProcedureDateBox74) ||
      (!selectedProcedureInfo.princProcedureCodeBox74 &&
        selectedProcedureInfo.princProcedureDateBox74)
    ) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: `Please fill in both the fields of Principle Procedure Code Box 74.`,
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (
      (selectedProcedureInfo.othProcedureCodeBox74a &&
        !selectedProcedureInfo.othProcedureDateBox74a) ||
      (!selectedProcedureInfo.othProcedureCodeBox74a &&
        selectedProcedureInfo.othProcedureDateBox74a)
    ) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: `Please fill in both the fields of Other Procedure Code Box 74-a.`,
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (
      (selectedProcedureInfo.othProcedureCodeBox74b &&
        !selectedProcedureInfo.othProcedureDateBox74b) ||
      (!selectedProcedureInfo.othProcedureCodeBox74b &&
        selectedProcedureInfo.othProcedureDateBox74b)
    ) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: `Please fill in both the fields of Other Procedure Code Box 74-b.`,
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (
      (selectedProcedureInfo.othProcedureCodeBox74c &&
        !selectedProcedureInfo.othProcedureDateBox74c) ||
      (!selectedProcedureInfo.othProcedureCodeBox74c &&
        selectedProcedureInfo.othProcedureDateBox74c)
    ) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: `Please fill in both the fields of Other Procedure Code Box 74-c.`,
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    if (
      (selectedProcedureInfo.othProcedureCodeBox74d &&
        !selectedProcedureInfo.othProcedureDateBox74d) ||
      (!selectedProcedureInfo.othProcedureCodeBox74d &&
        selectedProcedureInfo.othProcedureDateBox74d)
    ) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: `Please fill in both the fields of Other Procedure Code Box 74-d.`,
          toastType: ToastType.ERROR,
        })
      );
      isValid = false;
    }
    return isValid;
  };

  const saveMedicalCase = async () => {
    const mergedData: MedicalCaseModalData = {
      ...medicalCaseData,
      ...selectedPatientInfo,
      ...selectedDiagnosisInfo,
      ...selectedConditionInfo,
      ...selectedOccurrenceInfo,
      ...selectedOccurrenceSpanInfo,
      ...selectedValueInfo,
      ...selectedProcedureInfo,
    };
    // Get today's date without time for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Check for future dates using array iteration
    const dateFields = Object.entries(mergedData).filter(([key, _value]) =>
      key.endsWith('Date')
    );

    let hasFutureDateError = false;
    dateFields.forEach(([key, value]) => {
      const date = new Date(value);
      if (date > today) {
        dispatch(
          addToastNotification({
            id: uuidv4(),
            text: `The date in the field "${key}" cannot be in the future.`,
            toastType: ToastType.ERROR,
          })
        );
        hasFutureDateError = true;
      }
    });

    if (hasFutureDateError) {
      return;
    }

    // Check if "Admission Date" is less than or equal to "Discharge Date"
    if (mergedData.admissionDate && mergedData.dischargeDate) {
      const admissionDate = new Date(mergedData.admissionDate);
      const dischargeDate = new Date(mergedData.dischargeDate);

      if (admissionDate > dischargeDate) {
        dispatch(
          addToastNotification({
            id: uuidv4(),
            text: 'The "Admission Date" must be less than or equal to the "Discharge Date".',
            toastType: ToastType.ERROR,
          })
        );
        return;
      }
    }
    setSaveClicked(true);

    const isValid = runValidations();
    const isSeqValid = fieldsSquenceValidations();
    if (isValid && isSeqValid) {
      const res = isViewMode
        ? await updateMedicalCase(mergedData)
        : await addMedicalCase(mergedData);
      if (res) {
        onClose();
      }
    }
    setSaveClicked(false);
  };
  const [patientSearchData, setPatientSearchData] = useState<
    PatientSearchOutput[]
  >([]);
  const selectedWorkedGroup = useSelector(getselectdWorkGroupsIDsSelector);

  const onSearchPatient = async (value: string) => {
    const res = await searchPatientAsyncAPI({
      searchValue: value,
      groups: selectedWorkedGroup?.groupsData.map((m) => m.id) || [],
      practices: selectedWorkedGroup?.practicesData.map((m) => m.id) || [],
      facilities: selectedWorkedGroup?.facilitiesData.map((m) => m.id) || [],
      providers: selectedWorkedGroup?.providersData.map((m) => m.id) || [],
    });
    if (res) {
      setPatientSearchData(res);
    }
  };
  useEffect(() => {
    if (selectedPatientIDState) {
      dispatch(
        fetchPatientInsranceDataRequest({
          patientID: selectedPatientIDState,
        })
      );
    }
  }, [selectedPatientIDState]);
  return (
    <>
      <div className="flex h-full w-full flex-col items-center justify-start overflow-hidden rounded-lg bg-gray-100 shadow">
        <div className="flex w-full flex-col items-start justify-start p-6">
          <div className="inline-flex w-full items-center justify-between">
            <div className="flex items-center justify-start space-x-2">
              <p className="text-xl font-bold leading-7 text-gray-700">
                {isViewMode
                  ? `Case Details - #${medicalCaseID}`
                  : 'Add New Case'}
              </p>
            </div>
            <CloseButton
              onClick={() => {
                if (isDataChanged) {
                  setMedicalCaseModalState({
                    ...medicalCaseModalState,
                    open: true,
                    heading: 'Cancel Confirmation',
                    description: `Are you certain you want to cancel all changes made to this medical Case? Clicking "Confirm" will result in the loss of all changes.`,
                    statusModalType: StatusModalType.WARNING,
                    showCloseButton: true,
                    okButtonText: 'Confirm',
                    closeButtonText: 'Cancel',
                    confirmActionType: 'closeConfirmation',
                  });
                  setIsWarningAlert(true);
                } else {
                  setDiagnosisCodeFields(diagnosisFieldsInitialState);
                  onClose();
                }
              }}
            />
          </div>
        </div>
        <div className={'w-full px-6'}>
          <div className={`h-[1px] w-full bg-gray-300`} />
        </div>

        <div className="h-full w-full flex-1 overflow-y-auto">
          <div
            className={
              !headingCollapse.isCollapsePatientInfo
                ? `p-6   text-gray-700 leading-7 text-left font-bold w-full`
                : `p-6  h-10 relative text-gray-700 leading-7 text-left font-bold w-full`
            }
          >
            <SectionHeading
              label="Patient/Miscellaneous"
              isCollapsable={true}
              onClick={() => {
                setHeadingCollapse({
                  ...headingCollapse,
                  isCollapsePatientInfo: !headingCollapse.isCollapsePatientInfo,
                });
              }}
              isCollapsed={headingCollapse.isCollapsePatientInfo}
            />
            <div
              hidden={headingCollapse.isCollapsePatientInfo}
              className="mt-[40px]  w-full pt-[24px]"
            >
              <div className="flex flex-wrap gap-4">
                <div className={` w-[280px] `}>
                  <div className={` gap-2 w-[280px]`}>
                    <div className={`w-full items-start self-stretch`}>
                      <label className="text-sm font-medium leading-5 text-gray-900">
                        Case Title<span className="text-cyan-500">*</span>
                      </label>
                      <div className="w-[280px]">
                        <InputField
                          placeholder="Title"
                          disabled={false}
                          value={selectedPatientInfo?.title || ''}
                          onChange={(evt) => {
                            setSelectedPatientInfo({
                              ...selectedPatientInfo,
                              title: evt.target.value,
                            });
                            setIsDataChanged(true);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {!selectedPatientID && (
                  <div className={` w-[280px] `}>
                    <div className={`gap-1 w-auto `}>
                      <label className="text-sm font-medium leading-5 text-gray-700">
                        Search Patient
                        <span className="text-cyan-500">*</span>
                      </label>
                      <div
                        className={`w-full gap-1 justify-center flex flex-col items-start self-stretch `}
                      >
                        <div className="w-[280px]">
                          <SingleSelectDropDown
                            placeholder="Patient Name"
                            forcefullyShowSearchBar={true}
                            data={
                              patientSearchData?.length !== 0
                                ? (patientSearchData as SingleSelectDropDownDataType[])
                                : [
                                    {
                                      id: 1,
                                      value: 'No Record Found',
                                      active: false,
                                    },
                                  ]
                            }
                            selectedValue={
                              patientSearchData.filter(
                                (m) => m.id === selectedPatientInfo.patientID
                              )[0]
                            }
                            onSelect={(value) => {
                              setSelectedPatientIDState(value.id);
                              setSelectedPatientInfo({
                                ...selectedPatientInfo,
                                patientID: value.id,
                              });
                              setIsDataChanged(true);
                            }}
                            onSearch={(value) => {
                              onSearchPatient(value);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className={`w-[280px]`}>
                  <div className={`w-full items-start self-stretch`}>
                    <label className="text-sm font-medium leading-5 text-gray-900">
                      Facility<span className="text-cyan-500">*</span>
                    </label>
                    <div className="w-[280px]">
                      <SingleSelectDropDown
                        placeholder="Facility"
                        showSearchBar={true}
                        disabled={false}
                        data={
                          facilitiesData
                            ? (facilitiesData as SingleSelectDropDownDataType[])
                            : []
                        }
                        selectedValue={
                          facilitiesData?.filter(
                            (f) => f.id === selectedPatientInfo?.facilityID
                          )[0]
                        }
                        onSelect={(value) => {
                          setSelectedPatientInfo({
                            ...selectedPatientInfo,
                            facilityID: value.id,
                          });
                          setIsDataChanged(true);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className={`w-[280px]`}>
                  <div className={`w-full items-start self-stretch`}>
                    <label className="text-sm font-medium leading-5 text-gray-900">
                      Primary Insurance<span className="text-cyan-500">*</span>
                    </label>
                    <div className="w-[280px]">
                      <SingleSelectDropDown
                        placeholder="Primary Insurance"
                        showSearchBar={true}
                        disabled={false}
                        data={
                          primaryInsuranceData
                            ? (primaryInsuranceData as SingleSelectDropDownDataType[])
                            : []
                        }
                        selectedValue={
                          primaryInsuranceData?.filter(
                            (f) =>
                              f.id === selectedPatientInfo?.patientInsuranceID
                          )[0]
                        }
                        onSelect={(value) => {
                          setSelectedPatientInfo({
                            ...selectedPatientInfo,
                            patientInsuranceID: value.id,
                          });
                          setIsDataChanged(true);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className={`w-[280px]`}>
                  <div className={`w-full items-start self-stretch`}>
                    <label className="text-sm font-medium leading-5 text-gray-900">
                      Frequency<span className="text-cyan-500">*</span>
                    </label>
                    <div className="w-[280px]">
                      <SingleSelectDropDown
                        placeholder="Frequency"
                        showSearchBar={true}
                        disabled={false}
                        data={
                          medicalCaseLookupsData?.frequencyData
                            ? (medicalCaseLookupsData?.frequencyData as SingleSelectDropDownDataType[])
                            : []
                        }
                        selectedValue={
                          medicalCaseLookupsData?.frequencyData?.filter(
                            (f) => f.code === selectedPatientInfo?.frequencyCode
                          )[0]
                        }
                        onSelect={(value) => {
                          setSelectedPatientInfo({
                            ...selectedPatientInfo,
                            frequencyCode:
                              medicalCaseLookupsData?.frequencyData?.filter(
                                (f) => f.value === value.value
                              )[0]?.code || '',
                          });
                          setIsDataChanged(true);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className={`w-[280px]`}>
                  <div className={`w-full items-start self-stretch`}>
                    <label className="text-sm font-medium leading-5 text-gray-900">
                      Admission Priority<span className="text-cyan-500">*</span>
                    </label>
                    <div className="w-[280px]">
                      <SingleSelectDropDown
                        placeholder="Admission Priority"
                        showSearchBar={true}
                        disabled={false}
                        data={
                          medicalCaseLookupsData?.admissionPriorityData
                            ? (medicalCaseLookupsData.admissionPriorityData as SingleSelectDropDownDataType[])
                            : []
                        }
                        selectedValue={
                          medicalCaseLookupsData?.admissionPriorityData?.filter(
                            (f) =>
                              f.code ===
                              selectedPatientInfo?.admissionPriorityCode
                          )[0]
                        }
                        onSelect={(value) => {
                          setSelectedPatientInfo({
                            ...selectedPatientInfo,
                            admissionPriorityCode:
                              medicalCaseLookupsData?.admissionPriorityData?.filter(
                                (f) => f.value === value.value
                              )[0]?.code || '',
                          });
                          setIsDataChanged(true);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className={`w-[280px]`}>
                  <div className={`w-full items-start self-stretch`}>
                    <label className="text-sm font-medium leading-5 text-gray-900">
                      Admission Source<span className="text-cyan-500">*</span>
                    </label>
                    <div className="w-[280px]">
                      <SingleSelectDropDown
                        placeholder="Admission Source"
                        showSearchBar={true}
                        disabled={false}
                        data={
                          medicalCaseLookupsData?.admissionSourceData
                            ? (medicalCaseLookupsData.admissionSourceData as SingleSelectDropDownDataType[])
                            : []
                        }
                        selectedValue={
                          medicalCaseLookupsData?.admissionSourceData?.filter(
                            (f) =>
                              f.code ===
                              selectedPatientInfo?.admissionSourceCode
                          )[0]
                        }
                        onSelect={(value) => {
                          setSelectedPatientInfo({
                            ...selectedPatientInfo,
                            admissionSourceCode:
                              medicalCaseLookupsData?.admissionSourceData?.filter(
                                (f) => f.value === value.value
                              )[0]?.code || '',
                          });
                          setIsDataChanged(true);
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className={`w-[280px]`}>
                  <div className={`w-full items-start self-stretch`}>
                    <label className="text-sm font-medium leading-5 text-gray-900">
                      Patient Discharge Status
                      <span className="text-cyan-500">*</span>
                    </label>
                    <div className="w-[280px]">
                      <SingleSelectDropDown
                        placeholder=" Patient Discharge Status"
                        showSearchBar={true}
                        disabled={false}
                        isOptional={true}
                        onDeselectValue={() => {
                          setSelectedPatientInfo({
                            ...selectedPatientInfo,
                            patDischargeStatusCode: '',
                          });
                        }}
                        data={
                          medicalCaseLookupsData?.patientDischargeStatusData
                            ? (medicalCaseLookupsData.patientDischargeStatusData as SingleSelectDropDownDataType[])
                            : []
                        }
                        selectedValue={
                          medicalCaseLookupsData?.patientDischargeStatusData?.filter(
                            (f) =>
                              f.code ===
                              selectedPatientInfo?.patDischargeStatusCode
                          )[0]
                        }
                        onSelect={(value) => {
                          setSelectedPatientInfo({
                            ...selectedPatientInfo,
                            patDischargeStatusCode:
                              medicalCaseLookupsData?.patientDischargeStatusData?.filter(
                                (f) => f.value === value.value
                              )[0]?.code || '',
                          });
                          setIsDataChanged(true);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className={`w-[280px]`}>
                  <div className={`w-full items-start self-stretch`}>
                    <label className="text-sm font-medium leading-5 text-gray-900">
                      Referring Provider
                    </label>
                    <div className="w-[280px]">
                      <SingleSelectDropDown
                        placeholder="Referring Provider"
                        showSearchBar={true}
                        disabled={false}
                        isOptional={true}
                        onDeselectValue={() => {
                          setSelectedPatientInfo({
                            ...selectedPatientInfo,
                            referringProviderNPI: '',
                            referringProviderLastName: '',
                            referringProviderFirstName: '',
                          });
                        }}
                        data={
                          referringProviderData?.length
                            ? (referringProviderData as SingleSelectDropDownDataType[])
                            : [{ id: 1, value: 'No Data Found' }]
                        }
                        selectedValue={
                          referringProviderData?.filter(
                            (f) =>
                              f.appendText?.split(' ')[1] ===
                              selectedPatientInfo?.referringProviderNPI
                          )[0]
                        }
                        onSelect={(value) => {
                          const name = value.value.split(' ');
                          setSelectedPatientInfo({
                            ...selectedPatientInfo,
                            referringProviderNPI:
                              value.appendText?.split(' ')[1] || '',
                            referringProviderLastName: name[0] || '',
                            referringProviderFirstName: name[1] || '',
                          });
                          setIsDataChanged(true);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className={`w-[280px]`}>
                  <div className={`w-full items-start self-stretch`}>
                    <label className="text-sm font-medium leading-5 text-gray-900">
                      Attending Provider
                    </label>
                    <div className="w-[280px]">
                      <SingleSelectDropDown
                        placeholder="Attending Provider"
                        showSearchBar={true}
                        disabled={false}
                        isOptional={true}
                        onDeselectValue={() => {
                          setSelectedPatientInfo({
                            ...selectedPatientInfo,
                            attendingProviderID: undefined,
                          });
                        }}
                        data={
                          supervisingProviderData
                            ? (supervisingProviderData as SingleSelectDropDownDataType[])
                            : []
                        }
                        selectedValue={
                          supervisingProviderData?.filter(
                            (f) =>
                              f.id === selectedPatientInfo?.attendingProviderID
                          )[0]
                        }
                        onSelect={(value) => {
                          setSelectedPatientInfo({
                            ...selectedPatientInfo,
                            attendingProviderID: value.id,
                          });
                          setIsDataChanged(true);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className={`w-[280px]`}>
                  <div className={`w-full items-start self-stretch`}>
                    <label className="text-sm font-medium leading-5 text-gray-900">
                      Operating Provider
                    </label>
                    <div className="w-[280px]">
                      <SingleSelectDropDown
                        placeholder="Operating Provider"
                        showSearchBar={true}
                        disabled={false}
                        isOptional={true}
                        onDeselectValue={() => {
                          setSelectedPatientInfo({
                            ...selectedPatientInfo,
                            operatingProviderID: undefined,
                          });
                        }}
                        data={
                          supervisingProviderData
                            ? (supervisingProviderData as SingleSelectDropDownDataType[])
                            : []
                        }
                        selectedValue={
                          supervisingProviderData?.filter(
                            (f) =>
                              f.id === selectedPatientInfo?.operatingProviderID
                          )[0]
                        }
                        onSelect={(value) => {
                          setSelectedPatientInfo({
                            ...selectedPatientInfo,
                            operatingProviderID: value.id,
                          });
                          setIsDataChanged(true);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className={` w-[280px] `}>
                  <div className={` gap-2 w-[280px]`}>
                    <div className={`w-full items-start self-stretch`}>
                      <label className="text-sm font-medium leading-5 text-gray-900">
                        Hospital Case Number
                      </label>
                      <div className="w-[280px]">
                        <InputField
                          placeholder="Hospital Case Number"
                          disabled={false}
                          value={selectedPatientInfo?.hospitalCaseNumber || ''}
                          onChange={(evt) => {
                            setSelectedPatientInfo({
                              ...selectedPatientInfo,
                              hospitalCaseNumber: evt.target.value,
                            });
                            setIsDataChanged(true);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-[280px] pt-[5px] ">
                  <div
                    className={`flex flex-col w-full items-start self-stretch`}
                  >
                    <label className="truncate-overflow truncate text-sm font-medium leading-tight text-gray-700">
                      Discharge Date
                    </label>
                    <div className="w-full pt-[5px]">
                      <AppDatePicker
                        cls="!mt-1"
                        selected={selectedPatientInfo?.dischargeDate}
                        onChange={(value) => {
                          setSelectedPatientInfo({
                            ...selectedPatientInfo,
                            dischargeDate: value
                              ? DateToStringPipe(value, 1)
                              : null,
                          });
                          setIsDataChanged(true);
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className={`w-[280px]`}>
                  <div className={`w-full items-start self-stretch`}>
                    <label className="text-sm font-medium leading-5 text-gray-900">
                      Discharge Hour
                    </label>
                    <div className="w-[280px]">
                      <SingleSelectDropDown
                        placeholder="Discharge Hour"
                        showSearchBar={true}
                        disabled={false}
                        isOptional={true}
                        onDeselectValue={() => {
                          setSelectedPatientInfo({
                            ...selectedPatientInfo,
                            dischargeHourCode: '',
                          });
                          setIsDataChanged(true);
                        }}
                        data={
                          medicalCaseLookupsData?.hoursData
                            ? (medicalCaseLookupsData.hoursData as SingleSelectDropDownDataType[])
                            : []
                        }
                        selectedValue={
                          medicalCaseLookupsData?.hoursData?.filter(
                            (f) =>
                              f.code === selectedPatientInfo?.dischargeHourCode
                          )[0]
                        }
                        onSelect={(value) => {
                          setSelectedPatientInfo({
                            ...selectedPatientInfo,
                            dischargeHourCode:
                              medicalCaseLookupsData?.hoursData?.filter(
                                (f) => f.value === value.value
                              )[0]?.code || '',
                          });
                          setIsDataChanged(true);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="w-[280px] pt-[5px] ">
                  <div
                    className={`flex flex-col w-full items-start self-stretch`}
                  >
                    <label className="truncate text-sm font-medium leading-tight text-gray-700">
                      Admission Date
                    </label>
                    <div className="w-full pt-[5px]">
                      <AppDatePicker
                        cls="!mt-1"
                        selected={selectedPatientInfo?.admissionDate}
                        onChange={(value) => {
                          setSelectedPatientInfo({
                            ...selectedPatientInfo,
                            admissionDate: value
                              ? DateToStringPipe(value, 1)
                              : null,
                          });
                          setIsDataChanged(true);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className={`w-[280px]`}>
                  <div className={`w-full items-start self-stretch`}>
                    <label className="text-sm font-medium leading-5 text-gray-900">
                      Admission Hour
                    </label>
                    <div className="w-[280px]">
                      <SingleSelectDropDown
                        placeholder="Admission Hour"
                        showSearchBar={true}
                        disabled={false}
                        isOptional={true}
                        onDeselectValue={() => {
                          setSelectedPatientInfo({
                            ...selectedPatientInfo,
                            admissionHourCode: '',
                          });
                          setIsDataChanged(true);
                        }}
                        data={
                          medicalCaseLookupsData?.hoursData
                            ? (medicalCaseLookupsData.hoursData as SingleSelectDropDownDataType[])
                            : []
                        }
                        selectedValue={
                          medicalCaseLookupsData?.hoursData?.filter(
                            (f) =>
                              f.code === selectedPatientInfo?.admissionHourCode
                          )[0]
                        }
                        onSelect={(value) => {
                          setSelectedPatientInfo({
                            ...selectedPatientInfo,
                            admissionHourCode:
                              medicalCaseLookupsData?.hoursData?.filter(
                                (f) => f.value === value.value
                              )[0]?.code || '',
                          });
                          setIsDataChanged(true);
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className={`w-[280px]`}>
                  <div className={`w-full items-start self-stretch`}>
                    <label className="text-sm font-medium leading-5 text-gray-900">
                      Accident State
                    </label>
                    <div className="w-[280px]">
                      <SingleSelectDropDown
                        placeholder=" Accident State"
                        showSearchBar={true}
                        disabled={false}
                        isOptional={true}
                        onDeselectValue={() => {
                          setSelectedPatientInfo({
                            ...selectedPatientInfo,
                            accidentStateBox29: '',
                          });
                          setIsDataChanged(true);
                        }}
                        data={
                          medicalCaseLookupsData?.accidentStateData
                            ? (medicalCaseLookupsData.accidentStateData as SingleSelectDropDownDataType[])
                            : []
                        }
                        selectedValue={
                          medicalCaseLookupsData?.accidentStateData?.filter(
                            (f) =>
                              f.code === selectedPatientInfo?.accidentStateBox29
                          )[0]
                        }
                        onSelect={(value) => {
                          setSelectedPatientInfo({
                            ...selectedPatientInfo,
                            accidentStateBox29:
                              medicalCaseLookupsData?.accidentStateData?.filter(
                                (f) => f.value === value.value
                              )[0]?.code || '',
                          });
                          setIsDataChanged(true);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className={`w-[280px]`}>
                  <div className={`w-full items-start self-stretch`}>
                    <label className="text-sm font-medium leading-5 text-gray-900">
                      Case Status<span className="text-cyan-500">*</span>
                    </label>
                    <div className="w-[280px]">
                      <SingleSelectDropDown
                        placeholder="Case Status"
                        showSearchBar={true}
                        disabled={false}
                        isOptional={true}
                        onDeselectValue={() => {
                          setSelectedPatientInfo({
                            ...selectedPatientInfo,
                            caseStatusCode: '',
                          });
                          setIsDataChanged(true);
                        }}
                        data={
                          medicalCaseLookupsData?.caseStatusData
                            ? (medicalCaseLookupsData.caseStatusData as SingleSelectDropDownDataType[])
                            : []
                        }
                        selectedValue={
                          medicalCaseLookupsData?.caseStatusData?.filter(
                            (f) =>
                              f.code === selectedPatientInfo?.caseStatusCode
                          )[0]
                        }
                        onSelect={(value) => {
                          setSelectedPatientInfo({
                            ...selectedPatientInfo,
                            caseStatusCode:
                              medicalCaseLookupsData?.caseStatusData?.filter(
                                (f) => f.value === value.value
                              )[0]?.code || '',
                          });
                          setIsDataChanged(true);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className={
              !headingCollapse.isCollapseDiagnosis
                ? `p-6 relative text-gray-700 leading-7 text-left font-bold w-full`
                : `p-6 h-10 relative text-gray-700 leading-7 text-left font-bold w-full`
            }
          >
            <SectionHeading
              label="Diagnosis Codes"
              isCollapsable={true}
              onClick={() =>
                setHeadingCollapse({
                  ...headingCollapse,
                  isCollapseDiagnosis: !headingCollapse.isCollapseDiagnosis,
                })
              }
              isCollapsed={headingCollapse.isCollapseDiagnosis}
            />
            <div
              hidden={headingCollapse.isCollapseDiagnosis}
              className="mt-[40px] flex w-full flex-col gap-4 pt-[24px]"
            >
              <div className={`w-[280px]`}>
                <div className={`w-full items-start self-stretch`}>
                  <label className="text-sm font-medium leading-5 text-gray-900">
                    Diagnosis 1<span className="text-cyan-500">*</span>
                  </label>
                  <div className="w-[280px]">
                    <SingleSelectDropDown
                      placeholder="Diagnosis 1"
                      showSearchBar={true}
                      disabled={false}
                      data={
                        diagnosis1Data
                          ? (diagnosis1Data as SingleSelectDropDownDataType[])
                          : []
                      }
                      selectedValue={
                        diagnosis1Data?.filter(
                          (f) => f.value === selectedPatientInfo?.diagnosis1
                        )[0]
                      }
                      onSelect={(value) => {
                        setSelectedPatientInfo({
                          ...selectedPatientInfo,
                          diagnosis1: value.value,
                        });
                        setIsDataChanged(true);
                      }}
                      onSearch={(value) => {
                        setDiagnosisSearchValue(value);
                        // setDiagnosis1Seach(value);
                      }}
                    />
                  </div>
                </div>
              </div>
              <FieldSelectionDropdown
                label={'Select Diagnosis Codes'}
                selectedData={selectedDiagnosisFieldDropdown}
                fieldsData={diagnosisCodeFields}
                onSearchFieldsData={(value) => {
                  setTimeout(() => {
                    setDiagnosisCodeFields(value);

                    if (value) {
                      getIcdSearch(value, false);
                    }
                  }, 1000);
                }}
                onSelectFieldsData={(value) => {
                  setDiagnosisCodeFields(value);
                  setSelectedDiagosisInfo({
                    ...selectedDiagnosisInfo,
                    admitDxBox69:
                      value
                        .filter((m) => m.id === 1 && m.checked)
                        .map(
                          (n) =>
                            (n.selectedValue as SingleSelectDropDownDataType)
                              ?.value
                        )[0]
                        ?.toString() || '',
                    // diagnosis1:
                    //   value
                    //     .filter((m) => m.id === 2 && m.checked)
                    //     .map(
                    //       (n) =>
                    //         (n.selectedValue as SingleSelectDropDownDataType)
                    //           ?.value
                    //     )[0]
                    //     ?.toString() || '',
                    diagnosis2:
                      value
                        .filter((m) => m.id === 3 && m.checked)
                        .map(
                          (n) =>
                            (n.selectedValue as SingleSelectDropDownDataType)
                              ?.value
                        )[0]
                        ?.toString() || '',
                    diagnosis3:
                      value
                        .filter((m) => m.id === 4 && m.checked)
                        .map(
                          (n) =>
                            (n.selectedValue as SingleSelectDropDownDataType)
                              ?.value
                        )[0]
                        ?.toString() || '',
                    diagnosis4:
                      value
                        .filter((m) => m.id === 5 && m.checked)
                        .map(
                          (n) =>
                            (n.selectedValue as SingleSelectDropDownDataType)
                              ?.value
                        )[0]
                        ?.toString() || '',
                    diagnosis5:
                      value
                        .filter((m) => m.id === 6 && m.checked)
                        .map(
                          (n) =>
                            (n.selectedValue as SingleSelectDropDownDataType)
                              ?.value
                        )[0]
                        ?.toString() || '',
                    diagnosis6:
                      value
                        .filter((m) => m.id === 7 && m.checked)
                        .map(
                          (n) =>
                            (n.selectedValue as SingleSelectDropDownDataType)
                              ?.value
                        )[0]
                        ?.toString() || '',
                    diagnosis7:
                      value
                        .filter((m) => m.id === 8 && m.checked)
                        .map(
                          (n) =>
                            (n.selectedValue as SingleSelectDropDownDataType)
                              ?.value
                        )[0]
                        ?.toString() || '',
                    diagnosis8:
                      value
                        .filter((m) => m.id === 9 && m.checked)
                        .map(
                          (n) =>
                            (n.selectedValue as SingleSelectDropDownDataType)
                              ?.value
                        )[0]
                        ?.toString() || '',
                    diagnosis9:
                      value
                        .filter((m) => m.id === 10 && m.checked)
                        .map(
                          (n) =>
                            (n.selectedValue as SingleSelectDropDownDataType)
                              ?.value
                        )[0]
                        ?.toString() || '',
                    diagnosis10:
                      value
                        .filter((m) => m.id === 11 && m.checked)
                        .map(
                          (n) =>
                            (n.selectedValue as SingleSelectDropDownDataType)
                              ?.value
                        )[0]
                        ?.toString() || '',
                    diagnosis11:
                      value
                        .filter((m) => m.id === 12 && m.checked)
                        .map(
                          (n) =>
                            (n.selectedValue as SingleSelectDropDownDataType)
                              ?.value
                        )[0]
                        ?.toString() || '',
                    diagnosis12:
                      value
                        .filter((m) => m.id === 13 && m.checked)
                        .map(
                          (n) =>
                            (n.selectedValue as SingleSelectDropDownDataType)
                              ?.value
                        )[0]
                        ?.toString() || '',
                    patReasonDxBox70a:
                      value
                        .filter((m) => m.id === 14 && m.checked)
                        .map(
                          (n) =>
                            (n.selectedValue as SingleSelectDropDownDataType)
                              ?.value
                        )[0]
                        ?.toString() || '',
                    patReasonDxBox70b:
                      value
                        .filter((m) => m.id === 15 && m.checked)
                        .map(
                          (n) =>
                            (n.selectedValue as SingleSelectDropDownDataType)
                              ?.value
                        )[0]
                        ?.toString() || '',
                    patReasonDxBox70c:
                      value
                        .filter((m) => m.id === 16 && m.checked)
                        .map(
                          (n) =>
                            (n.selectedValue as SingleSelectDropDownDataType)
                              ?.value
                        )[0]
                        ?.toString() || '',
                    ppsCodeBox71:
                      value
                        .filter((m) => m.id === 17 && m.checked)
                        .map((n) => n.selectedValue?.toString())[0] || '',
                    eciBox72a:
                      value
                        .filter((m) => m.id === 18 && m.checked)
                        .map(
                          (n) =>
                            (n.selectedValue as SingleSelectDropDownDataType)
                              ?.value
                        )[0]
                        ?.toString() || '',
                    eciBox72b:
                      value
                        .filter((m) => m.id === 19 && m.checked)
                        .map(
                          (n) =>
                            (n.selectedValue as SingleSelectDropDownDataType)
                              ?.value
                        )[0]
                        ?.toString() || '',
                    eciBox72c:
                      value
                        .filter((m) => m.id === 20 && m.checked)
                        .map(
                          (n) =>
                            (n.selectedValue as SingleSelectDropDownDataType)
                              ?.value
                        )[0]
                        ?.toString() || '',
                  });
                  setIsDataChanged(true);
                }}
              />
            </div>
          </div>
          <div
            className={
              !headingCollapse.isCollapseCondition
                ? `p-6  relative text-gray-700 leading-7 text-left font-bold w-full`
                : `p-6 h-10 relative text-gray-700 leading-7 text-left font-bold w-full`
            }
          >
            <SectionHeading
              label="Condition Codes"
              isCollapsable={true}
              onClick={() =>
                setHeadingCollapse({
                  ...headingCollapse,
                  isCollapseCondition: !headingCollapse.isCollapseCondition,
                })
              }
              isCollapsed={headingCollapse.isCollapseCondition}
            />
            <div
              hidden={headingCollapse.isCollapseCondition}
              className="mt-[40px]  w-full pt-[24px]"
            >
              <FieldSelectionDropdown
                label={'Select Condition Codes'}
                selectedData={selectedConditionFieldDropdown}
                fieldsData={conditionCodeFields}
                onSelectFieldsData={(value) => {
                  setConditionCodeFields(value);
                  setSelectedConditionInfo({
                    ...selectedConditionInfo,
                    conditCodeBox18:
                      value
                        .filter((m) => m.id === 1 && m.checked)
                        .map(
                          (n) => (n.selectedValue as DropdownLookup)?.code
                        )[0]
                        ?.toString() || '',
                    conditCodeBox19:
                      value
                        .filter((m) => m.id === 2 && m.checked)
                        .map(
                          (n) => (n.selectedValue as DropdownLookup)?.code
                        )[0]
                        ?.toString() || '',
                    conditCodeBox20:
                      value
                        .filter((m) => m.id === 3 && m.checked)
                        .map(
                          (n) => (n.selectedValue as DropdownLookup)?.code
                        )[0]
                        ?.toString() || '',
                    conditCodeBox21:
                      value
                        .filter((m) => m.id === 4 && m.checked)
                        .map(
                          (n) => (n.selectedValue as DropdownLookup)?.code
                        )[0]
                        ?.toString() || '',
                    conditCodeBox22:
                      value
                        .filter((m) => m.id === 5 && m.checked)
                        .map(
                          (n) => (n.selectedValue as DropdownLookup)?.code
                        )[0]
                        ?.toString() || '',
                    conditCodeBox23:
                      value
                        .filter((m) => m.id === 6 && m.checked)
                        .map(
                          (n) => (n.selectedValue as DropdownLookup)?.code
                        )[0]
                        ?.toString() || '',
                    conditCodeBox24:
                      value
                        .filter((m) => m.id === 7 && m.checked)
                        .map(
                          (n) => (n.selectedValue as DropdownLookup)?.code
                        )[0]
                        ?.toString() || '',
                    conditCodeBox25:
                      value
                        .filter((m) => m.id === 8 && m.checked)
                        .map(
                          (n) => (n.selectedValue as DropdownLookup)?.code
                        )[0]
                        ?.toString() || '',
                    conditCodeBox26:
                      value
                        .filter((m) => m.id === 9 && m.checked)
                        .map(
                          (n) => (n.selectedValue as DropdownLookup)?.code
                        )[0]
                        ?.toString() || '',
                    conditCodeBox27:
                      value
                        .filter((m) => m.id === 10 && m.checked)
                        .map(
                          (n) => (n.selectedValue as DropdownLookup)?.code
                        )[0]
                        ?.toString() || '',
                    conditCodeBox28:
                      value
                        .filter((m) => m.id === 11 && m.checked)
                        .map(
                          (n) => (n.selectedValue as DropdownLookup)?.code
                        )[0]
                        ?.toString() || '',
                  });
                  setIsDataChanged(true);
                }}
              />
            </div>
          </div>
          <div
            className={
              !headingCollapse.isCollapseOccurance
                ? `p-6 relative text-gray-700 leading-7 text-left font-bold w-full`
                : `p-6 h-10 relative text-gray-700 leading-7 text-left font-bold w-full`
            }
          >
            <SectionHeading
              label="Occurrence Codes"
              isCollapsable={true}
              onClick={() =>
                setHeadingCollapse({
                  ...headingCollapse,
                  isCollapseOccurance: !headingCollapse.isCollapseOccurance,
                })
              }
              isCollapsed={headingCollapse.isCollapseOccurance}
            />

            <div
              hidden={headingCollapse.isCollapseOccurance}
              className="mt-[40px]  w-full pt-[24px]"
            >
              <div className="flex justify-between">
                <div className="w-[50%]">
                  <FieldSelectionDropdown
                    label={'Select Occurrence Codes'}
                    selectedData={selectedOccuranceFieldDropdown}
                    fieldsData={occuranceCodeFields}
                    onSelectFieldsData={(value) => {
                      setOccuranceCodeFields(value);
                      setSelectedOccurrenceInfo({
                        ...selectedOccurrenceInfo,
                        occurrCodeBox31:
                          value
                            .filter((m) => m.id === 1 && m.checked)
                            .map(
                              (n) => (n.selectedValue as DropdownLookup)?.code
                            )[0]
                            ?.toString() || '',
                        occurrDateBox31:
                          value
                            .filter((m) => m.id === 2 && m.checked)
                            .map((n) =>
                              DateToStringPipe(n.selectedValue?.toString(), 1)
                            )[0] || null,
                        occurrCodeBox32:
                          value
                            .filter((m) => m.id === 3 && m.checked)
                            .map(
                              (n) => (n.selectedValue as DropdownLookup)?.code
                            )[0]
                            ?.toString() || '',
                        occurrDateBox32:
                          value
                            .filter((m) => m.id === 4 && m.checked)
                            .map((n) =>
                              DateToStringPipe(n.selectedValue?.toString(), 1)
                            )[0] || null,
                        occurrCodeBox33:
                          value
                            .filter((m) => m.id === 5 && m.checked)
                            .map(
                              (n) => (n.selectedValue as DropdownLookup)?.code
                            )[0]
                            ?.toString() || '',
                        occurrDateBox33:
                          value
                            .filter((m) => m.id === 6 && m.checked)
                            .map((n) =>
                              DateToStringPipe(n.selectedValue?.toString(), 1)
                            )[0] || null,
                        occurrCodeBox34:
                          value
                            .filter((m) => m.id === 7 && m.checked)
                            .map(
                              (n) => (n.selectedValue as DropdownLookup)?.code
                            )[0]
                            ?.toString() || '',
                        occurrDateBox34:
                          value
                            .filter((m) => m.id === 8 && m.checked)
                            .map((n) =>
                              DateToStringPipe(n.selectedValue?.toString(), 1)
                            )[0] || null,
                      });
                      setIsDataChanged(true);
                    }}
                  />
                </div>
                <div className="w-[50%]">
                  <FieldSelectionDropdown
                    label={'Select Occurrence Span Codes'}
                    selectedData={selectedOccuranceSpanFieldDropdown}
                    fieldsData={occuranceSpanCodeFields}
                    onSelectFieldsData={(value) => {
                      setOccuranceSpanCodeFields(value);
                      setSelectedOccurrenceSpanInfo({
                        ...selectedOccurrenceSpanInfo,
                        occurrSpanCodeBox35:
                          value
                            .filter((m) => m.id === 1 && m.checked)
                            .map(
                              (n) => (n.selectedValue as DropdownLookup)?.code
                            )[0]
                            ?.toString() || '',
                        occurrSpanFromDateBox35:
                          value
                            .filter((m) => m.id === 2 && m.checked)
                            .map((n) =>
                              DateToStringPipe(n.selectedValue?.toString(), 1)
                            )[0] || null,
                        occurrSpanToDateBox35:
                          value
                            .filter((m) => m.id === 3 && m.checked)
                            .map((n) =>
                              DateToStringPipe(n.selectedValue?.toString(), 1)
                            )[0] || null,
                        occurrSpanCodeBox36:
                          value
                            .filter((m) => m.id === 4 && m.checked)
                            .map(
                              (n) => (n.selectedValue as DropdownLookup)?.code
                            )[0]
                            ?.toString() || '',
                        occurrSpanFromDateBox36:
                          value
                            .filter((m) => m.id === 5 && m.checked)
                            .map((n) =>
                              DateToStringPipe(n.selectedValue?.toString(), 1)
                            )[0] || null,
                        occurrSpanToDateBox36:
                          value
                            .filter((m) => m.id === 6 && m.checked)
                            .map((n) =>
                              DateToStringPipe(n.selectedValue?.toString(), 1)
                            )[0] || null,
                      });
                      setIsDataChanged(true);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div
            className={
              !headingCollapse.isCollapseValue
                ? `p-6  relative text-gray-700 leading-7 text-left font-bold w-full`
                : `p-6 h-10 relative text-gray-700 leading-7 text-left font-bold w-full`
            }
          >
            <SectionHeading
              label="Value Codes"
              isCollapsable={true}
              onClick={() =>
                setHeadingCollapse({
                  ...headingCollapse,
                  isCollapseValue: !headingCollapse.isCollapseValue,
                })
              }
              isCollapsed={headingCollapse.isCollapseValue}
            />
            <div
              hidden={headingCollapse.isCollapseValue}
              className="mt-[40px] w-full pt-[24px]"
            >
              <FieldSelectionDropdown
                label={'Select Value Codes'}
                selectedData={selectedValueFieldDropdown}
                fieldsData={valueCodeFields}
                onSelectFieldsData={(value) => {
                  setValueCodeFields(value);
                  setSelectedValueInfo({
                    ...selectedValueInfo,
                    valCodeBox39a:
                      value
                        .filter((m) => m.id === 1 && m.checked)
                        .map(
                          (n) => (n.selectedValue as DropdownLookup)?.code
                        )[0]
                        ?.toString() || '',
                    valCodeAmtBox39a:
                      value
                        .filter((m) => m.id === 2 && m.checked)
                        .map((n) => Number(n.selectedValue))[0] || undefined,
                    valCodeBox39b:
                      value
                        .filter((m) => m.id === 3 && m.checked)
                        .map(
                          (n) => (n.selectedValue as DropdownLookup)?.code
                        )[0]
                        ?.toString() || '',
                    valCodeAmtBox39b:
                      value
                        .filter((m) => m.id === 4 && m.checked)
                        .map((n) => Number(n.selectedValue))[0] || undefined,
                    valCodeBox39c:
                      value
                        .filter((m) => m.id === 5 && m.checked)
                        .map(
                          (n) => (n.selectedValue as DropdownLookup)?.code
                        )[0]
                        ?.toString() || '',
                    valCodeAmtBox39c:
                      value
                        .filter((m) => m.id === 6 && m.checked)
                        .map((n) => Number(n.selectedValue))[0] || undefined,

                    valCodeBox39d:
                      value
                        .filter((m) => m.id === 7 && m.checked)
                        .map(
                          (n) => (n.selectedValue as DropdownLookup)?.code
                        )[0]
                        ?.toString() || '',
                    valCodeAmtBox39d:
                      value
                        .filter((m) => m.id === 8 && m.checked)
                        .map((n) => Number(n.selectedValue))[0] || undefined,
                    valCodeBox40a:
                      value
                        .filter((m) => m.id === 9 && m.checked)
                        .map(
                          (n) => (n.selectedValue as DropdownLookup)?.code
                        )[0]
                        ?.toString() || '',
                    valCodeAmtBox40a:
                      value
                        .filter((m) => m.id === 10 && m.checked)
                        .map((n) => Number(n.selectedValue))[0] || undefined,
                    valCodeBox40b:
                      value
                        .filter((m) => m.id === 11 && m.checked)
                        .map(
                          (n) => (n.selectedValue as DropdownLookup)?.code
                        )[0]
                        ?.toString() || '',
                    valCodeAmtBox40b:
                      value
                        .filter((m) => m.id === 12 && m.checked)
                        .map((n) => Number(n.selectedValue))[0] || undefined,
                    valCodeBox40c:
                      value
                        .filter((m) => m.id === 13 && m.checked)
                        .map(
                          (n) => (n.selectedValue as DropdownLookup)?.code
                        )[0]
                        ?.toString() || '',
                    valCodeAmtBox40c:
                      value
                        .filter((m) => m.id === 14 && m.checked)
                        .map((n) => Number(n.selectedValue))[0] || undefined,
                    valCodeBox40d:
                      value
                        .filter((m) => m.id === 15 && m.checked)
                        .map(
                          (n) => (n.selectedValue as DropdownLookup)?.code
                        )[0]
                        ?.toString() || '',
                    valCodeAmtBox40d:
                      value
                        .filter((m) => m.id === 16 && m.checked)
                        .map((n) => Number(n.selectedValue))[0] || undefined,
                    valCodeBox41a:
                      value
                        .filter((m) => m.id === 17 && m.checked)
                        .map(
                          (n) => (n.selectedValue as DropdownLookup)?.code
                        )[0]
                        ?.toString() || '',
                    valCodeAmtBox41a:
                      value
                        .filter((m) => m.id === 18 && m.checked)
                        .map((n) => Number(n.selectedValue))[0] || undefined,
                    valCodeBox41b:
                      value
                        .filter((m) => m.id === 19 && m.checked)
                        .map(
                          (n) => (n.selectedValue as DropdownLookup)?.code
                        )[0]
                        ?.toString() || '',
                    valCodeAmtBox41b:
                      value
                        .filter((m) => m.id === 20 && m.checked)
                        .map((n) => Number(n.selectedValue))[0] || undefined,
                    valCodeBox41c:
                      value
                        .filter((m) => m.id === 21 && m.checked)
                        .map(
                          (n) => (n.selectedValue as DropdownLookup)?.code
                        )[0]
                        ?.toString() || '',
                    valCodeAmtBox41c:
                      value
                        .filter((m) => m.id === 22 && m.checked)
                        .map((n) => Number(n.selectedValue))[0] || undefined,
                    valCodeBox41d:
                      value
                        .filter((m) => m.id === 23 && m.checked)
                        .map(
                          (n) => (n.selectedValue as DropdownLookup)?.code
                        )[0]
                        ?.toString() || '',
                    valCodeAmtBox41d:
                      value
                        .filter((m) => m.id === 24 && m.checked)
                        .map((n) => Number(n.selectedValue))[0] || undefined,
                  });
                }}
              />
            </div>
          </div>
          {/* {isViewMode && ( */}
          <div
            className={
              !headingCollapse.isCollapsePrincipleProc
                ? `p-6 relative text-gray-700 leading-7 text-left font-bold w-full`
                : `p-6 h-10 relative text-gray-700 leading-7 text-left font-bold w-full`
            }
          >
            <SectionHeading
              label="Principle/Other Procedure Codes"
              isCollapsable={true}
              onClick={() =>
                setHeadingCollapse({
                  ...headingCollapse,
                  isCollapsePrincipleProc:
                    !headingCollapse.isCollapsePrincipleProc,
                })
              }
              isCollapsed={headingCollapse.isCollapsePrincipleProc}
            />
            <div
              hidden={headingCollapse.isCollapsePrincipleProc}
              className="mt-[40px] w-full pb-[100px] pt-[24px]"
            >
              <FieldSelectionDropdown
                label={'Select Procedure Codes'}
                selectedData={selectedPrincipleProcFieldDropdown}
                fieldsData={principleProcedureCodeFields}
                onSearchFieldsData={(value) => {
                  setTimeout(() => {
                    setPrincipleProcedureCodeFields(value);

                    if (value) {
                      getIcdSearchForProcedureCodes(value, false);
                    }
                  }, 1000);
                }}
                onSelectFieldsData={(value) => {
                  setPrincipleProcedureCodeFields(value);
                  setSelectedProcedureInfo({
                    ...selectedProcedureInfo,
                    princProcedureCodeBox74:
                      value
                        .filter((m) => m.id === 1 && m.checked)
                        .map(
                          (n) =>
                            (n.selectedValue as SingleSelectDropDownDataType)
                              ?.value
                        )[0]
                        ?.toString() || '',
                    princProcedureDateBox74:
                      value
                        .filter((m) => m.id === 2 && m.checked)
                        .map((n) =>
                          DateToStringPipe(n.selectedValue?.toString(), 1)
                        )[0] || null,
                    othProcedureCodeBox74a:
                      value
                        .filter((m) => m.id === 3 && m.checked)
                        .map(
                          (n) =>
                            (n.selectedValue as SingleSelectDropDownDataType)
                              ?.value
                        )[0]
                        ?.toString() || '',
                    othProcedureDateBox74a:
                      value
                        .filter((m) => m.id === 4 && m.checked)
                        .map((n) =>
                          DateToStringPipe(n.selectedValue?.toString(), 1)
                        )[0] || null,
                    othProcedureCodeBox74b:
                      value
                        .filter((m) => m.id === 5 && m.checked)
                        .map(
                          (n) =>
                            (n.selectedValue as SingleSelectDropDownDataType)
                              ?.value
                        )[0]
                        ?.toString() || '',
                    othProcedureDateBox74b:
                      value
                        .filter((m) => m.id === 6 && m.checked)
                        .map((n) =>
                          DateToStringPipe(n.selectedValue?.toString(), 1)
                        )[0] || null,
                    othProcedureCodeBox74c:
                      value
                        .filter((m) => m.id === 7 && m.checked)
                        .map(
                          (n) =>
                            (n.selectedValue as SingleSelectDropDownDataType)
                              ?.value
                        )[0]
                        ?.toString() || '',
                    othProcedureDateBox74c:
                      value
                        .filter((m) => m.id === 8 && m.checked)
                        .map((n) =>
                          DateToStringPipe(n.selectedValue?.toString(), 1)
                        )[0] || null,
                    othProcedureCodeBox74d:
                      value
                        .filter((m) => m.id === 9 && m.checked)
                        .map(
                          (n) =>
                            (n.selectedValue as SingleSelectDropDownDataType)
                              ?.value
                        )[0]
                        ?.toString() || '',
                    othProcedureDateBox74d:
                      value
                        .filter((m) => m.id === 10 && m.checked)
                        .map((n) =>
                          DateToStringPipe(n.selectedValue?.toString(), 1)
                        )[0] || null,
                    othProcedureCodeBox74e:
                      value
                        .filter((m) => m.id === 11 && m.checked)
                        .map(
                          (n) =>
                            (n.selectedValue as SingleSelectDropDownDataType)
                              ?.value
                        )[0]
                        ?.toString() || '',
                    othProcedureDateBox74e:
                      value
                        .filter((m) => m.id === 12 && m.checked)
                        .map((n) =>
                          DateToStringPipe(n.selectedValue?.toString(), 1)
                        )[0] || null,
                  });
                  setIsDataChanged(true);
                }}
              />
            </div>
          </div>
          {/* )} */}
          {isViewMode && (
            <div
              className={
                !headingCollapse.isCollapseLinkedClaims
                  ? `p-6  relative text-gray-700 leading-7 text-left font-bold w-full`
                  : `p-6 h-10 relative text-gray-700 leading-7 text-left font-bold w-full`
              }
            >
              <SectionHeading
                label="Linked Claims"
                isCollapsable={true}
                onClick={() =>
                  setHeadingCollapse({
                    ...headingCollapse,
                    isCollapseLinkedClaims:
                      !headingCollapse.isCollapseLinkedClaims,
                  })
                }
                isCollapsed={headingCollapse.isCollapseLinkedClaims}
              />
              <div
                hidden={headingCollapse.isCollapseLinkedClaims}
                className="mt-[40px]  w-full pb-[100px] pt-[24px]"
              >
                <ClaimSearchGridPopup
                  claimSearchCriteria={undefined}
                  headerClaimStatus={''}
                  type={''}
                  onClose={() => {
                    // setClaimModalOpen({
                    //   open: false,
                    //   claimSearchCriteria: undefined,
                    //   header: '',
                    //   type: '',
                    // });
                  }}
                  medicalCaseID={medicalCaseID || undefined}
                />
              </div>
            </div>
          )}
        </div>
        <div className="flex w-full items-center justify-center rounded-b-lg bg-gray-200 py-6">
          <div className="flex w-full items-center justify-end space-x-4 px-7">
            <Button
              buttonType={ButtonType.secondary}
              cls={`w-[102px] `}
              onClick={() => {
                if (isDataChanged) {
                  setMedicalCaseModalState({
                    ...medicalCaseModalState,
                    open: true,
                    heading: 'Cancel Confirmation',
                    description: `Are you certain you want to cancel all changes made to this medical Case? Clicking "Confirm" will result in the loss of all changes.`,
                    statusModalType: StatusModalType.WARNING,
                    showCloseButton: true,
                    okButtonText: 'Confirm',
                    closeButtonText: 'Cancel',
                    confirmActionType: 'closeConfirmation',
                  });
                  setIsWarningAlert(true);
                } else {
                  setDiagnosisCodeFields(diagnosisFieldsInitialState);
                  onClose();
                }
              }}
            >
              {' '}
              Cancel
            </Button>
            <Button
              buttonType={ButtonType.primary}
              disabled={isSaveClicked}
              cls={` `}
              onClick={async () => {
                saveMedicalCase();
              }}
            >
              {isViewMode ? 'Save Changes' : 'Save New Case'}
            </Button>
          </div>
        </div>
      </div>
      <StatusModal
        open={medicalCaseModalState.open}
        heading={medicalCaseModalState.heading}
        description={medicalCaseModalState.description}
        okButtonText={medicalCaseModalState.okButtonText}
        closeButtonText={medicalCaseModalState.closeButtonText}
        statusModalType={medicalCaseModalState.statusModalType}
        showCloseButton={medicalCaseModalState.showCloseButton}
        closeOnClickOutside={medicalCaseModalState.closeOnClickOutside}
        onClose={() => {
          setMedicalCaseModalState({
            ...medicalCaseModalState,
            open: false,
          });
        }}
        onChange={() => {
          if (isWarningAlert) {
            onClose();
            setDiagnosisCodeFields(diagnosisFieldsInitialState);
          }
          setMedicalCaseModalState({
            ...medicalCaseModalState,
            open: false,
          });
        }}
      />
    </>
  );
}
