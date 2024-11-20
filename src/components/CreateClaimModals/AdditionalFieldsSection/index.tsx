import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import AppDatePicker from '@/components/UI/AppDatePicker';
import InfoToggle from '@/components/UI/InfoToggle';
import InputField from '@/components/UI/InputField';
import InputFieldAmount from '@/components/UI/InputFieldAmount';
import MultiSelectDropDown from '@/components/UI/MultiSelectDropDown';
import type { SingleSelectDropDownDataType } from '@/components/UI/SingleSelectDropDown';
import SingleSelectDropDown from '@/components/UI/SingleSelectDropDown';
import { addToastNotification } from '@/store/shared/actions';
import {
  getLookupDropdownsDataSelector,
  getProviderDataSelector,
} from '@/store/shared/selectors';
import { type AdditionalFiedlsPayload, ToastType } from '@/store/shared/types';
import useOnceEffect from '@/utils/useOnceEffect';

export interface AdditionalFiedlsSectionProps {
  selectedData?: AdditionalFiedlsPayload | null;
  onAddAdditionalFields: (value: AdditionalFiedlsPayload) => void;
  disable?: boolean;
}

export interface AditionalFieldsDataType {
  id: number;
  value: string;
  active?: boolean;
  checked: boolean;
  fieldType:
    | 'datePicker'
    | 'amountField'
    | 'inputText'
    | 'dropDown'
    | 'heading';
  selectedValue:
    | Date
    | number
    | string
    | SingleSelectDropDownDataType
    | undefined;
  data: SingleSelectDropDownDataType[] | undefined;
}

export default function AdditionalFiedlsSection({
  selectedData,
  onAddAdditionalFields,
  disable,
}: AdditionalFiedlsSectionProps) {
  const dispatch = useDispatch();
  const [selectedAditionalFieldsData, setSelectedAditionalFieldsData] =
    useState<AditionalFieldsDataType[]>([
      {
        id: 1,
        value: 'Miscellaneous',
        active: false,
        checked: false,
        fieldType: 'heading',
        selectedValue: undefined,
        data: undefined,
      },
      {
        id: 2,
        value: 'Discharge Date',
        active: true,
        checked: false,
        fieldType: 'datePicker',
        selectedValue: undefined,
        data: undefined,
      },
      {
        id: 3,
        value: 'Current Illness Date',
        active: true,
        checked: false,
        fieldType: 'datePicker',
        selectedValue: undefined,
        data: undefined,
      },
      {
        id: 4,
        value: 'Disability Begin Date',
        active: true,
        checked: false,
        fieldType: 'datePicker',
        selectedValue: undefined,
        data: undefined,
      },
      {
        id: 5,
        value: 'Disability End Date',
        active: true,
        checked: false,
        fieldType: 'datePicker',
        selectedValue: undefined,
        data: undefined,
      },
      {
        id: 6,
        value: 'First Symptom Date',
        active: true,
        checked: false,
        fieldType: 'datePicker',
        selectedValue: undefined,
        data: undefined,
      },
      {
        id: 7,
        value: 'Initial Treatment Date',
        active: true,
        checked: false,
        fieldType: 'datePicker',
        selectedValue: undefined,
        data: undefined,
      },
      {
        id: 8,
        value: 'LMP Date',
        active: true,
        checked: false,
        fieldType: 'datePicker',
        selectedValue: undefined,
        data: undefined,
      },
      {
        id: 9,
        value: 'Last Seen Date',
        active: true,
        checked: false,
        fieldType: 'datePicker',
        selectedValue: undefined,
        data: undefined,
      },
      {
        id: 10,
        value: 'Last X-Ray Date',
        active: true,
        checked: false,
        fieldType: 'datePicker',
        selectedValue: undefined,
        data: undefined,
      },
      {
        id: 11,
        value: 'Similar Illness Date',
        active: true,
        checked: false,
        fieldType: 'datePicker',
        selectedValue: undefined,
        data: undefined,
      },
      {
        id: 12,
        value: 'Responsibility Date',
        active: true,
        checked: false,
        fieldType: 'datePicker',
        selectedValue: undefined,
        data: undefined,
      },
      {
        id: 13,
        value: 'Accident Date',
        active: true,
        checked: false,
        fieldType: 'datePicker',
        selectedValue: undefined,
        data: undefined,
      },
      {
        id: 14,
        value: 'Accident Type',
        active: true,
        checked: false,
        fieldType: 'dropDown',
        selectedValue: undefined,
        data: undefined,
      },
      {
        id: 15,
        value: 'Accident State',
        active: true,
        checked: false,
        fieldType: 'dropDown',
        selectedValue: undefined,
        data: undefined,
      },
      {
        id: 16,
        value: 'Lab Charges',
        active: true,
        checked: false,
        fieldType: 'amountField',
        selectedValue: undefined,
        data: undefined,
      },
      {
        id: 17,
        value: 'Delay Reason',
        active: true,
        checked: false,
        fieldType: 'dropDown',
        selectedValue: undefined,
        data: undefined,
      },
      {
        id: 18,
        value: 'EPSDT Condition',
        active: true,
        checked: false,
        fieldType: 'dropDown',
        selectedValue: undefined,
        data: undefined,
      },
      {
        id: 19,
        value: 'Service Authorization Exception',
        active: true,
        checked: false,
        fieldType: 'dropDown',
        selectedValue: undefined,
        data: undefined,
      },
      {
        id: 20,
        value: 'Special Program Indicator',
        active: true,
        checked: false,
        fieldType: 'dropDown',
        selectedValue: undefined,
        data: undefined,
      },
      {
        id: 21,
        value: 'Ordering Provider',
        active: true,
        checked: false,
        fieldType: 'dropDown',
        selectedValue: undefined,
        data: undefined,
      },
      {
        id: 22,
        value: 'BOX-19',
        active: true,
        checked: false,
        fieldType: 'inputText',
        selectedValue: undefined,
        data: undefined,
      },
      {
        id: 23,
        value: 'Comments',
        active: true,
        checked: false,
        fieldType: 'inputText',
        selectedValue: undefined,
        data: undefined,
      },
      {
        id: 24,
        value: 'Resubmission',
        active: false,
        checked: false,
        fieldType: 'heading',
        selectedValue: undefined,
        data: undefined,
      },
      {
        id: 25,
        value: 'Orig Reference Number',
        active: true,
        checked: false,
        fieldType: 'inputText',
        selectedValue: undefined,
        data: undefined,
      },
      {
        id: 26,
        value: 'Claim Frequency',
        active: true,
        checked: false,
        fieldType: 'dropDown',
        selectedValue: undefined,
        data: undefined,
      },
      {
        id: 27,
        value: 'Condition Code',
        active: true,
        checked: false,
        fieldType: 'dropDown',
        selectedValue: undefined,
        data: undefined,
      },
      {
        id: 28,
        value: 'PWK',
        active: false,
        checked: false,
        fieldType: 'heading',
        selectedValue: undefined,
        data: undefined,
      },
      {
        id: 29,
        value: 'Control Number',
        active: true,
        checked: false,
        fieldType: 'inputText',
        selectedValue: undefined,
        data: undefined,
      },
      {
        id: 30,
        value: 'Transmission Code',
        active: true,
        checked: false,
        fieldType: 'dropDown',
        selectedValue: undefined,
        data: undefined,
      },
      {
        id: 31,
        value: 'Attachment Type',
        active: true,
        checked: false,
        fieldType: 'dropDown',
        selectedValue: undefined,
        data: undefined,
      },
    ]);

  const infoTooptipValue = (id: number) => {
    if (id === 2) {
      return (
        <InfoToggle
          position="right"
          text={
            <div>
              {' '}
              CMS1500 : BOX18 <br /> X12 : LOOP 2300 - DTP03 (096)
            </div>
          }
        />
      );
    }
    if (id === 3) {
      return (
        <InfoToggle
          position="right"
          text={
            <div>
              {' '}
              CMS1500 : BOX14 <br /> X12 : LOOP 2300 - DTP03 (431)
            </div>
          }
        />
      );
    }
    if (id === 4) {
      return (
        <InfoToggle
          position="right"
          text={
            <div>
              {' '}
              CMS1500 : <br /> X12 : LOOP 2300 - DTP03 (360)
            </div>
          }
        />
      );
    }
    if (id === 5) {
      return (
        <InfoToggle
          position="right"
          text={
            <div>
              {' '}
              CMS1500 :<br /> X12 : LOOP 2300 - DTP03 (361)
            </div>
          }
        />
      );
    }
    if (id === 7) {
      return (
        <InfoToggle
          position="right"
          text={
            <div>
              {' '}
              CMS1500 : BOX15 <br /> X12 : LOOP 2300 - DTP03 (444)
            </div>
          }
        />
      );
    }
    if (id === 8) {
      return (
        <InfoToggle
          position="right"
          text={
            <div>
              {' '}
              CMS1500 : BOX14 <br /> X12 : LOOP 2300 - DTP03 (484)
            </div>
          }
        />
      );
    }
    if (id === 9) {
      return (
        <InfoToggle
          position="right"
          text={
            <div>
              {' '}
              CMS1500 : BOX15 <br /> X12 : LOOP 2300 - DTP03 (304)
            </div>
          }
        />
      );
    }
    if (id === 10) {
      return (
        <InfoToggle
          position="right"
          text={
            <div>
              {' '}
              CMS1500 : BOX15 <br /> X12 : LOOP 2300 - DTP03 (455)
            </div>
          }
        />
      );
    }
    if (id === 11) {
      return (
        <InfoToggle
          position="right"
          text={
            <div>
              {' '}
              CMS1500 : BOX15 <br /> X12 : LOOP 2300 - DTP03 (434)
            </div>
          }
        />
      );
    }
    if (id === 13) {
      return (
        <InfoToggle
          position="right"
          text={
            <div>
              {' '}
              CMS1500 : BOX15 <br /> X12 : LOOP 2300 - DTP03 (435)
            </div>
          }
        />
      );
    }
    if (id === 14) {
      return (
        <InfoToggle
          position="right"
          text={
            <div>
              {' '}
              CMS1500 : BOX10 <br /> X12 : LOOP 2300 - CLM11-1
            </div>
          }
        />
      );
    }
    if (id === 15) {
      return (
        <InfoToggle
          position="right"
          text={
            <div>
              {' '}
              CMS1500 : BOX10-B <br /> X12 : LOOP 2300 - CLM11-4
            </div>
          }
        />
      );
    }
    if (id === 16) {
      return (
        <InfoToggle
          position="right"
          text={
            <div>
              {' '}
              CMS1500 : BOX20 <br /> X12 :
            </div>
          }
        />
      );
    }
    if (id === 17) {
      return (
        <InfoToggle
          position="right"
          text={
            <div>
              {' '}
              CMS1500 : <br /> X12 : LOOP 2300 - CLM20
            </div>
          }
        />
      );
    }
    if (id === 18) {
      return (
        <InfoToggle
          position="right"
          text={
            <div>
              {' '}
              CMS1500 : BOX24-H <br /> X12 : LOOP 2400 - SV111
            </div>
          }
        />
      );
    }
    if (id === 19) {
      return (
        <InfoToggle
          position="right"
          text={
            <div>
              {' '}
              CMS1500 : <br /> X12 : LOOP 2300 - REF02 (4N)
            </div>
          }
        />
      );
    }
    if (id === 20) {
      return (
        <InfoToggle
          position="right"
          text={
            <div>
              {' '}
              CMS1500 : <br /> X12 : LOOP 2300 - CLM12
            </div>
          }
        />
      );
    }
    if (id === 21) {
      return (
        <InfoToggle
          position="right"
          text={
            <div>
              {' '}
              CMS1500 : BOX17 <br /> X12 : LOOP 2420E - NM103 (DK)
            </div>
          }
        />
      );
    }
    if (id === 22) {
      return (
        <InfoToggle
          position="right"
          text={
            <div>
              {' '}
              CMS1500 : BOX19 <br /> X12 :
            </div>
          }
        />
      );
    }
    if (id === 23) {
      return (
        <InfoToggle
          position="right"
          text={
            <div>
              {' '}
              CMS1500 : <br /> X12 :LOOP 2300 - NTE02 (ADD)
            </div>
          }
        />
      );
    }
    if (id === 25) {
      return (
        <InfoToggle
          position="right"
          text={
            <div>
              {' '}
              CMS1500 : BOX22 <br /> X12 :LOOP 2300 - REF02 (F8)
            </div>
          }
        />
      );
    }
    if (id === 26) {
      return (
        <InfoToggle
          position="right"
          text={
            <div>
              {' '}
              CMS1500 : BOX22 <br /> X12 :LOOP 2300 - CLM05-3
            </div>
          }
        />
      );
    }
    if (id === 27) {
      return (
        <InfoToggle
          position="right"
          text={
            <div>
              {' '}
              CMS1500 : BOX10-D <br /> X12 :LOOP 2300 - HI01-1 (BG)
            </div>
          }
        />
      );
    }
    if (id === 29) {
      return (
        <InfoToggle
          position="right"
          text={
            <div>
              {' '}
              CMS1500 : <br /> X12 :LOOP 2300 - PWK05
            </div>
          }
        />
      );
    }
    if (id === 30) {
      return (
        <InfoToggle
          position="right"
          text={
            <div>
              {' '}
              CMS1500 : <br /> X12 :LOOP 2300 - PWK02
            </div>
          }
        />
      );
    }
    if (id === 31) {
      return (
        <InfoToggle
          position="right"
          text={
            <div>
              {' '}
              CMS1500 : <br /> X12 :LOOP 2300 - PWK01
            </div>
          }
        />
      );
    }

    return '';
  };
  const [selectedAdditionalField, setSelectedAdditionalField] = useState<
    SingleSelectDropDownDataType[]
  >([]);
  const lookupsData = useSelector(getLookupDropdownsDataSelector);
  const providersData = useSelector(getProviderDataSelector);

  const handleSelectedValue = (arr: AditionalFieldsDataType[]) => {
    const res = arr.map((row) => {
      if (row.id === 2 && selectedData?.dischargeDate) {
        return {
          ...row,
          checked: true,
          selectedValue: selectedData.dischargeDate,
        };
      }
      if (row.id === 3 && selectedData?.currentIllnessDate) {
        return {
          ...row,
          checked: true,
          selectedValue: selectedData.currentIllnessDate,
        };
      }
      if (row.id === 4 && selectedData?.disabilityBeginDate) {
        return {
          ...row,
          checked: true,
          selectedValue: selectedData.disabilityBeginDate,
        };
      }
      if (row.id === 5 && selectedData?.disabilityEndDate) {
        return {
          ...row,
          checked: true,
          selectedValue: selectedData.disabilityEndDate,
        };
      }
      if (row.id === 6 && selectedData?.firstSymptomDate) {
        return {
          ...row,
          checked: true,
          selectedValue: selectedData.firstSymptomDate,
        };
      }
      if (row.id === 7 && selectedData?.initialTreatmentDate) {
        return {
          ...row,
          checked: true,
          selectedValue: selectedData.initialTreatmentDate,
        };
      }
      if (row.id === 8 && selectedData?.lmpDate) {
        return { ...row, checked: true, selectedValue: selectedData.lmpDate };
      }
      if (row.id === 9 && selectedData?.lastSeenDate) {
        return {
          ...row,
          checked: true,
          selectedValue: selectedData.lastSeenDate,
        };
      }
      if (row.id === 10 && selectedData?.lastXrayDate) {
        return {
          ...row,
          checked: true,
          selectedValue: selectedData.lastXrayDate,
        };
      }
      if (row.id === 11 && selectedData?.simillarIllnesDate) {
        return {
          ...row,
          checked: true,
          selectedValue: selectedData.simillarIllnesDate,
        };
      }
      if (row.id === 12 && selectedData?.responsibilityDate) {
        return {
          ...row,
          checked: true,
          selectedValue: selectedData.responsibilityDate,
        };
      }
      if (row.id === 13 && selectedData?.accidentDate) {
        return {
          ...row,
          checked: true,
          selectedValue: selectedData.accidentDate,
        };
      }
      if (row.id === 16 && selectedData?.labCharges) {
        return {
          ...row,
          checked: true,
          selectedValue: selectedData.labCharges,
        };
      }
      if (row.id === 22 && selectedData?.box19) {
        return { ...row, checked: true, selectedValue: selectedData.box19 };
      }
      if (row.id === 23 && selectedData?.comments) {
        return { ...row, checked: true, selectedValue: selectedData.comments };
      }
      if (row.id === 25 && selectedData?.originalRefenceNumber) {
        return {
          ...row,
          checked: true,
          selectedValue: selectedData.originalRefenceNumber,
        };
      }
      if (row.id === 29 && selectedData?.pwkControlNumber) {
        return {
          ...row,
          checked: true,
          selectedValue: selectedData.pwkControlNumber,
        };
      }
      if (row.id === 14 && selectedData?.accidentTypeID) {
        return {
          ...row,
          checked: true,
          selectedValue: lookupsData?.accidentType
            ? lookupsData.accidentType.filter(
                (m) => m.id === selectedData.accidentTypeID
              )[0]
            : undefined,
        };
      }
      if (row.id === 15 && selectedData?.accidentStateID) {
        return {
          ...row,
          checked: true,
          selectedValue: lookupsData?.accidentState
            ? lookupsData.accidentState.filter(
                (m) => m.id === selectedData.accidentStateID
              )[0]
            : undefined,
        };
      }
      if (row.id === 17 && selectedData?.delayReason) {
        return {
          ...row,
          checked: true,
          selectedValue: lookupsData?.delayReason
            ? lookupsData.delayReason.filter(
                (m) => m.id === selectedData.delayReason
              )[0]
            : undefined,
        };
      }
      if (row.id === 18 && selectedData?.epsdtConditionID) {
        return {
          ...row,
          checked: true,
          selectedValue: lookupsData?.epsdtCondition
            ? lookupsData.epsdtCondition.filter(
                (m) => m.id === selectedData.epsdtConditionID
              )[0]
            : undefined,
        };
      }
      if (row.id === 19 && selectedData?.serviceAuthExcepID) {
        return {
          ...row,
          checked: true,
          selectedValue: lookupsData?.serviceAuthExcep
            ? lookupsData.serviceAuthExcep.filter(
                (m) => m.id === selectedData.serviceAuthExcepID
              )[0]
            : undefined,
        };
      }
      if (row.id === 20 && selectedData?.specialProgramIndicatorID) {
        return {
          ...row,
          checked: true,
          selectedValue: lookupsData?.specialProgramIndicator
            ? lookupsData.specialProgramIndicator.filter(
                (m) => m.id === selectedData.specialProgramIndicatorID
              )[0]
            : undefined,
        };
      }
      if (row.id === 21 && selectedData?.orderingProviderID) {
        return {
          ...row,
          checked: true,
          selectedValue: providersData
            ? providersData.filter(
                (m) => m.id === selectedData.orderingProviderID
              )[0]
            : undefined,
        };
      }
      if (row.id === 26 && selectedData?.claimFrequencyID) {
        return {
          ...row,
          checked: true,
          selectedValue: lookupsData?.claimFrequency
            ? lookupsData.claimFrequency.filter(
                (m) => m.id === selectedData.claimFrequencyID
              )[0]
            : undefined,
        };
      }
      if (row.id === 27 && selectedData?.conditionCodeID) {
        return {
          ...row,
          checked: true,
          selectedValue: lookupsData?.conditionCode
            ? lookupsData.conditionCode.filter(
                (m) => m.id === selectedData.conditionCodeID
              )[0]
            : undefined,
        };
      }
      if (row.id === 30 && selectedData?.transmissionCodeID) {
        return {
          ...row,
          checked: true,
          selectedValue: lookupsData?.transmissionCode
            ? lookupsData.transmissionCode.filter(
                (m) => m.id === selectedData.transmissionCodeID
              )[0]
            : undefined,
        };
      }
      if (row.id === 31 && selectedData?.attachmentTypeID) {
        return {
          ...row,
          checked: true,
          selectedValue: lookupsData?.attachmentType
            ? lookupsData.attachmentType.filter(
                (m) => m.id === selectedData.attachmentTypeID
              )[0]
            : undefined,
        };
      }
      return row;
    });
    const selectedAdditionalFieldData = res.filter((m) => m.checked);
    setSelectedAdditionalField(selectedAdditionalFieldData);
    return res;
  };

  const handleLookupsData = (arr: AditionalFieldsDataType[]) => {
    return arr.map((row) => {
      if (row.id === 14) {
        return {
          ...row,
          data: lookupsData?.accidentType
            ? (lookupsData?.accidentType as SingleSelectDropDownDataType[])
            : [],
        };
      }
      if (row.id === 15) {
        return {
          ...row,
          data: lookupsData?.accidentState
            ? (lookupsData?.accidentState as SingleSelectDropDownDataType[])
            : [],
        };
      }
      if (row.id === 17) {
        return {
          ...row,
          data: lookupsData?.delayReason
            ? (lookupsData?.delayReason as SingleSelectDropDownDataType[])
            : [],
        };
      }
      if (row.id === 18) {
        return {
          ...row,
          data: lookupsData?.epsdtCondition
            ? (lookupsData?.epsdtCondition as SingleSelectDropDownDataType[])
            : [],
        };
      }
      if (row.id === 19) {
        return {
          ...row,
          data: lookupsData?.serviceAuthExcep
            ? (lookupsData?.serviceAuthExcep as SingleSelectDropDownDataType[])
            : [],
        };
      }
      if (row.id === 20) {
        return {
          ...row,
          data: lookupsData?.specialProgramIndicator
            ? (lookupsData?.specialProgramIndicator as SingleSelectDropDownDataType[])
            : [],
        };
      }
      if (row.id === 21) {
        return {
          ...row,
          data: providersData
            ? (providersData as SingleSelectDropDownDataType[])
            : [],
        };
      }
      if (row.id === 26) {
        return {
          ...row,
          data: lookupsData?.claimFrequency
            ? (lookupsData?.claimFrequency as SingleSelectDropDownDataType[])
            : [],
        };
      }
      if (row.id === 27) {
        return {
          ...row,
          data: lookupsData?.conditionCode
            ? (lookupsData?.conditionCode as SingleSelectDropDownDataType[])
            : [],
        };
      }
      if (row.id === 30) {
        return {
          ...row,
          data: lookupsData?.transmissionCode
            ? (lookupsData?.transmissionCode as SingleSelectDropDownDataType[])
            : [],
        };
      }
      if (row.id === 31) {
        return {
          ...row,
          data: lookupsData?.attachmentType
            ? (lookupsData?.attachmentType as SingleSelectDropDownDataType[])
            : [],
        };
      }
      return row;
    });
  };

  const handleSelectedValueAndLookupsData = async () => {
    let res = selectedAditionalFieldsData;
    if (selectedData && lookupsData) {
      res = await handleSelectedValue(res);
    }
    if (lookupsData) {
      res = await handleLookupsData(res);
    }
    setSelectedAditionalFieldsData(res);
  };

  useOnceEffect(() => {
    handleSelectedValueAndLookupsData();
  }, [lookupsData]);

  useOnceEffect(() => {
    handleSelectedValueAndLookupsData();
  }, [selectedData]);

  const onClickAdd = () => {
    let fieldsData: AdditionalFiedlsPayload = {
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
      comments: null,
      originalRefenceNumber: null,
      claimFrequencyID: null,
      conditionCodeID: null,
      pwkControlNumber: null,
      transmissionCodeID: null,
      attachmentTypeID: null,
      admissionDate: null,
      emg: null,
    };
    const selectedAccidentType = selectedAditionalFieldsData
      .filter((m) => m.id === 14 && m.checked)
      .map((n) => n.selectedValue)[0] as SingleSelectDropDownDataType;
    const selectedAccidentStateID = selectedAditionalFieldsData
      .filter((m) => m.id === 15 && m.checked)
      .map((n) => n.selectedValue)[0] as SingleSelectDropDownDataType;
    const selectedDelayReason = selectedAditionalFieldsData
      .filter((m) => m.id === 17 && m.checked)
      .map((n) => n.selectedValue)[0] as SingleSelectDropDownDataType;
    const selectedEPSDTConditionID = selectedAditionalFieldsData
      .filter((m) => m.id === 18 && m.checked)
      .map((n) => n.selectedValue)[0] as SingleSelectDropDownDataType;
    const selectedServiceAuthExcepID = selectedAditionalFieldsData
      .filter((m) => m.id === 19 && m.checked)
      .map((n) => n.selectedValue)[0] as SingleSelectDropDownDataType;
    const selectedSpecialProgramIndicatorID = selectedAditionalFieldsData
      .filter((m) => m.id === 20 && m.checked)
      .map((n) => n.selectedValue)[0] as SingleSelectDropDownDataType;
    const selectedOrderingProviderID = selectedAditionalFieldsData
      .filter((m) => m.id === 21 && m.checked)
      .map((n) => n.selectedValue)[0] as SingleSelectDropDownDataType;
    const selectedClaimFrequencyID = selectedAditionalFieldsData
      .filter((m) => m.id === 26 && m.checked)
      .map((n) => n.selectedValue)[0] as SingleSelectDropDownDataType;
    const selectedConditionCodeID = selectedAditionalFieldsData
      .filter((m) => m.id === 27 && m.checked)
      .map((n) => n.selectedValue)[0] as SingleSelectDropDownDataType;
    const selectedTransmissionCodeID = selectedAditionalFieldsData
      .filter((m) => m.id === 30 && m.checked)
      .map((n) => n.selectedValue)[0] as SingleSelectDropDownDataType;
    const selectedAttachmentTypeID = selectedAditionalFieldsData
      .filter((m) => m.id === 31 && m.checked)
      .map((n) => n.selectedValue)[0] as SingleSelectDropDownDataType;

    fieldsData = {
      ...fieldsData,
      dischargeDate:
        selectedAditionalFieldsData
          .filter((m) => m.id === 2 && m.checked)
          .map((n) => n.selectedValue)[0]
          ?.toString() || null,
      currentIllnessDate:
        selectedAditionalFieldsData
          .filter((m) => m.id === 3 && m.checked)
          .map((n) => n.selectedValue)[0]
          ?.toString() || null,
      disabilityBeginDate:
        selectedAditionalFieldsData
          .filter((m) => m.id === 4 && m.checked)
          .map((n) => n.selectedValue)[0]
          ?.toString() || null,
      disabilityEndDate:
        selectedAditionalFieldsData
          .filter((m) => m.id === 5 && m.checked)
          .map((n) => n.selectedValue)[0]
          ?.toString() || null,
      firstSymptomDate:
        selectedAditionalFieldsData
          .filter((m) => m.id === 6 && m.checked)
          .map((n) => n.selectedValue)[0]
          ?.toString() || null,
      initialTreatmentDate:
        selectedAditionalFieldsData
          .filter((m) => m.id === 7 && m.checked)
          .map((n) => n.selectedValue)[0]
          ?.toString() || null,
      lmpDate:
        selectedAditionalFieldsData
          .filter((m) => m.id === 8 && m.checked)
          .map((n) => n.selectedValue)[0]
          ?.toString() || null,
      lastSeenDate:
        selectedAditionalFieldsData
          .filter((m) => m.id === 9 && m.checked)
          .map((n) => n.selectedValue)[0]
          ?.toString() || null,
      lastXrayDate:
        selectedAditionalFieldsData
          .filter((m) => m.id === 10 && m.checked)
          .map((n) => n.selectedValue)[0]
          ?.toString() || null,
      simillarIllnesDate:
        selectedAditionalFieldsData
          .filter((m) => m.id === 11 && m.checked)
          .map((n) => n.selectedValue)[0]
          ?.toString() || null,
      responsibilityDate:
        selectedAditionalFieldsData
          .filter((m) => m.id === 12 && m.checked)
          .map((n) => n.selectedValue)[0]
          ?.toString() || null,
      accidentDate:
        selectedAditionalFieldsData
          .filter((m) => m.id === 13 && m.checked)
          .map((n) => n.selectedValue)[0]
          ?.toString() || null,
      accidentTypeID: selectedAccidentType ? selectedAccidentType.id : null,
      accidentStateID: selectedAccidentStateID
        ? selectedAccidentStateID.id
        : null,
      labCharges:
        Number(
          selectedAditionalFieldsData
            .filter((m) => m.id === 16 && m.checked)
            .map((n) => n.selectedValue)[0]
        ) || null,
      delayReason: selectedDelayReason ? selectedDelayReason.id : null,
      epsdtConditionID: selectedEPSDTConditionID
        ? selectedEPSDTConditionID.id
        : null,
      serviceAuthExcepID: selectedServiceAuthExcepID
        ? selectedServiceAuthExcepID.id
        : null,
      specialProgramIndicatorID: selectedSpecialProgramIndicatorID
        ? selectedSpecialProgramIndicatorID.id
        : null,
      orderingProviderID: selectedOrderingProviderID
        ? selectedOrderingProviderID.id
        : null,
      box19:
        selectedAditionalFieldsData
          .filter((m) => m.id === 22 && m.checked)
          .map((n) => n.selectedValue)[0]
          ?.toString() || null,
      comments:
        selectedAditionalFieldsData
          .filter((m) => m.id === 23 && m.checked)
          .map((n) => n.selectedValue)[0]
          ?.toString() || null,
      originalRefenceNumber:
        selectedAditionalFieldsData
          .filter((m) => m.id === 25 && m.checked)
          .map((n) => n.selectedValue)[0]
          ?.toString() || null,
      claimFrequencyID: selectedClaimFrequencyID
        ? selectedClaimFrequencyID.id
        : null,
      conditionCodeID: selectedConditionCodeID
        ? selectedConditionCodeID.id
        : null,
      pwkControlNumber:
        selectedAditionalFieldsData
          .filter((m) => m.id === 29 && m.checked)
          .map((n) => n.selectedValue)[0]
          ?.toString() || null,
      transmissionCodeID: selectedTransmissionCodeID
        ? selectedTransmissionCodeID.id
        : null,
      attachmentTypeID: selectedAttachmentTypeID
        ? selectedAttachmentTypeID.id
        : null,
    };

    onAddAdditionalFields(fieldsData);
  };

  useOnceEffect(() => {
    onClickAdd();
  }, [selectedAditionalFieldsData]);
  const onSelectAdditionalField = (arr: SingleSelectDropDownDataType[]) => {
    setSelectedAdditionalField(arr);
    const res = selectedAditionalFieldsData.map((row) => {
      return { ...row, checked: arr.map((m) => m.id).includes(row.id) };
    });
    setSelectedAditionalFieldsData(JSON.parse(JSON.stringify(res)));
  };
  const renderDropdown = (
    id: number,
    selectedValue: SingleSelectDropDownDataType | undefined,
    data: SingleSelectDropDownDataType[]
  ) => {
    return (
      <SingleSelectDropDown
        placeholder={'Select value'}
        showSearchBar={true}
        disabled={disable}
        data={data}
        selectedValue={selectedValue}
        onSelect={(value) => {
          const arr = selectedAditionalFieldsData;
          setSelectedAditionalFieldsData([]);
          const obj = arr.filter((m) => m.id === id)[0];
          if (obj) obj.selectedValue = value;
          setSelectedAditionalFieldsData(JSON.parse(JSON.stringify(arr)));
        }}
        isOptional={true}
        onDeselectValue={() => {
          const arr = selectedAditionalFieldsData;
          setSelectedAditionalFieldsData([]);
          const obj = arr.filter((m) => m.id === id)[0];
          if (obj) obj.selectedValue = undefined;
          setSelectedAditionalFieldsData(JSON.parse(JSON.stringify(arr)));
        }}
      />
    );
  };

  const renderDatePicker = (id: number, selectedValue: Date) => {
    return (
      <AppDatePicker
        placeholderText="mm/dd/yyyy"
        disabled={disable}
        onChange={(date) => {
          const today = new Date();
          if (date && date <= today) {
            // setSelectedDate(event.target.value);
            const arr = selectedAditionalFieldsData;
            setSelectedAditionalFieldsData([]);
            const obj = arr.filter((m) => m.id === id)[0];
            if (obj && date) obj.selectedValue = date;
            setSelectedAditionalFieldsData(JSON.parse(JSON.stringify(arr)));
          } else {
            dispatch(
              addToastNotification({
                id: uuidv4(),
                text: 'Future dates are not allowed.',
                toastType: ToastType.ERROR,
              })
            );
          }
        }}
        selected={selectedValue ? new Date(String(selectedValue)) : null}
        // isOptional={true}
        // onDeselectValue={() => {
        //   const arr = selectedAditionalFieldsData;
        //   setSelectedAditionalFieldsData([]);
        //   const obj = arr.filter((m) => m.id === id)[0];
        //   if (obj) obj.selectedValue = undefined;
        //   setSelectedAditionalFieldsData(JSON.parse(JSON.stringify(arr)));
        // }}
      />
    );
  };

  const renderAmountField = (id: number, selectedValue: number) => {
    return (
      <InputFieldAmount
        disabled={disable}
        className="!mt-1 !h-[38px]"
        placeholder="Type text"
        value={selectedValue}
        onChange={(evt) => {
          const arr = selectedAditionalFieldsData;
          setSelectedAditionalFieldsData([]);
          const obj = arr.filter((m) => m.id === id)[0];
          if (obj) obj.selectedValue = evt.target.value;
          setSelectedAditionalFieldsData(JSON.parse(JSON.stringify(arr)));
        }}
      />
    );
  };

  const renderInputText = (id: number, selectedValue: string) => {
    return (
      <InputField
        disabled={disable}
        placeholder="Type text"
        value={selectedValue}
        onChange={(evt) => {
          const arr = selectedAditionalFieldsData;
          setSelectedAditionalFieldsData([]);
          const obj = arr.filter((m) => m.id === id)[0];
          if (obj) obj.selectedValue = evt.target.value;
          setSelectedAditionalFieldsData(JSON.parse(JSON.stringify(arr)));
        }}
      />
    );
  };

  return (
    <div className="flex-col gap-6 pt-[55px]">
      <div className={`flex items-end gap-4`}>
        <div className={` `}>
          <label className="text-sm font-medium leading-5 text-gray-900">
            Add Information Fields
          </label>
          <div className="w-[488px]">
            <MultiSelectDropDown
              placeholder="Type or click arrow to reveal available fields of additional information"
              showSearchBar={true}
              showSelectionInfo={false}
              disabled={disable}
              data={selectedAditionalFieldsData}
              selectedValue={selectedAdditionalField}
              onSelect={(value) => {
                onSelectAdditionalField(value);
              }}
            />
          </div>
        </div>
        {/* <div className="">
          <Button
            buttonType={ButtonType.primary}
            cls={`relative h-[38px] justify-center items-center rounded-md text-white leading-5 text-left font-medium pl-[17px] pr-[17px] pt-[9px] pb-[9px] w-[102.03px]  `}
            onClick={() => {
              // setIsClickAdd(true);
              onClickAdd();
            }}
          >
            Add
          </Button>
        </div> */}
      </div>
      <div className="flex flex-wrap gap-4 pt-[24px]">
        {selectedAditionalFieldsData
          .filter((f) => f.checked)
          .map((d) => (
            <div key={d.id} className={`relative w-[280px]`}>
              <div className={`w-full items-start self-stretch`}>
                <div className="flex gap-1">
                  <label className="text-sm font-medium leading-5 text-gray-900">
                    {d.value}
                  </label>
                  {infoTooptipValue(d.id)}
                </div>
                <div className="h-[38px] w-[280px]">
                  {d.fieldType === 'dropDown' &&
                    renderDropdown(
                      d.id,
                      d.selectedValue as SingleSelectDropDownDataType,
                      d.data ? d.data : []
                    )}
                  {d.fieldType === 'datePicker' && (
                    <div className="mt-1">
                      {renderDatePicker(d.id, d.selectedValue as Date)}
                    </div>
                  )}
                  {d.fieldType === 'inputText' &&
                    renderInputText(d.id, d.selectedValue as string)}
                  {d.fieldType === 'amountField' &&
                    renderAmountField(d.id, d.selectedValue as number)}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
