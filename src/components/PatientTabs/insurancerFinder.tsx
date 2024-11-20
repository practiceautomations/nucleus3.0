import { Tooltip } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid-pro';
import React, { useEffect, useState } from 'react';

import Button, { ButtonType } from '@/components/UI/Button';
import { addPatientInsurance, getInsuranceFinder } from '@/store/shared/sagas';
import type {
  AllInsuranceData,
  InsurancerFinderDataType,
} from '@/store/shared/types';
import { IconColors } from '@/utils/ColorFilters';

import Icon from '../Icon';
import CloseButton from '../UI/CloseButton';
import SearchDetailGrid from '../UI/SearchDetailGrid';
import SingleSelectGridDropDown from '../UI/SingleSelectGridDropdown';

export interface InsurancerFinderProps {
  onClose: () => void;
  selectedPatientID: number | null;
  groupID: number | undefined;
  insuranceData: AllInsuranceData[];
}

export default function InsuranceFinder({
  onClose,
  selectedPatientID,
  groupID,
  insuranceData,
}: InsurancerFinderProps) {
  const [insuranceFinderData, setInsuranceFinderData] = useState<
    InsurancerFinderDataType[]
  >([]);

  const [insuranceFinder, setInsuranceFinder] =
    useState<InsurancerFinderDataType>({
      eligibilityResponseID: null,
      payerName: '',
      payerID: null,
      subscriberName: '',
      subscriberID: '',
      subscriberDOB: '',
      subscriberGender: '',
      subscriberAddress: '',
      confidenceScore: '',
      confidenceScoreReason: '',
      policyStartDate: '',
      policyEndDate: '',
      insuranceID: null,
      subscriberRelationID: null,
      subscriberFirstName: '',
      subscriberMiddleName: '',
      subscriberLastName: '',
      subscriberGenderID: null,
      subscriberAddress1: '',
      subscriberCity: '',
      subscriberState: '',
      subscriberZipCode: '',
    });
  const [selectedIds, setSelectedIds] = useState<number[]>();
  const onInusranceFinder = async () => {
    if (selectedPatientID) {
      const res = await getInsuranceFinder(selectedPatientID, groupID);
      if (res) {
        setInsuranceFinderData(res.data);
      }
    }
  };
  useEffect(() => {
    if (selectedPatientID) {
      onInusranceFinder();
    }
  }, [selectedPatientID]);

  const onClickInsuranceToPatient = () => {
    if (selectedIds && selectedIds.length >= 1) {
      selectedIds.forEach((id) => {
        const finderData = insuranceFinderData.filter(
          (m) => m.payerID?.toString() === id?.toString()
        )[0];
        if (finderData) {
          const obj = {
            insuranceID: finderData.insuranceID,
            payerResponsibilityID: 1,
            policyStartDate: finderData.policyStartDate,
            policyEndDate: finderData.policyEndDate,
            insuredRelationID: finderData.subscriberRelationID,
            firstName: finderData.subscriberFirstName,
            middleName: finderData.subscriberMiddleName,
            lastName: finderData.subscriberLastName,
            genderID: finderData.subscriberGenderID,
            dob: finderData.subscriberDOB,
            address1: finderData.subscriberAddress1,
            city: finderData.subscriberCity,
            state: finderData.subscriberState,
            zipCode: finderData.subscriberZipCode,
            patientID: selectedPatientID,
            insuranceNumber: finderData.subscriberID,
            wcClaimNumber: '',
            groupName: '',
            groupNumber: '',
            mspTypeID: null,
            copay: null,
            comment: '',
            active: '',
            assignment: '',
            address2: '',
            zipCodeExtension: '',
            homePhone: '',
            officePhone: '',
            cell: '',
            fax: '',
            email: '',
            officePhoneExtension: '',
            accidentDate: null,
            accidentTypeID: null,
            accidentStateID: null,
          };
          addPatientInsurance(obj);
        }
      });
    }
  };
  const finderTableCols: GridColDef[] = [
    {
      field: 'payerName',
      headerName: 'Insurance Name',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      sortable: false,
    },
    {
      field: 'payerID',
      headerName: 'Payer ID',
      flex: 1,
      minWidth: 102,
      disableReorder: true,
      sortable: false,
    },
    {
      field: 'subscriberName',
      headerName: 'Subs. Name',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
      sortable: false,
    },
    {
      field: 'subscriberID',
      headerName: 'Subs. ID',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
      sortable: false,
    },
    {
      field: 'subscriberDOB',
      headerName: 'Subs. DOB',
      flex: 1,
      minWidth: 140,
      disableReorder: true,
      sortable: false,
    },
    {
      field: 'subscriberGender',
      headerName: 'Gender',
      flex: 1,
      minWidth: 88,
      disableReorder: true,
      sortable: false,
    },
    {
      field: 'subscriberAddress',
      headerName: 'Subs. Address',
      flex: 1,
      minWidth: 194,
      disableReorder: true,
      sortable: false,
    },
    {
      field: 'policyStartDate',
      headerName: 'Pol. Start Date',
      flex: 1,
      minWidth: 129,
      disableReorder: true,
      sortable: false,
      renderCell: (params) => {
        return <div>{params.value || '-'}</div>;
      },
    },
    {
      field: 'policyEndDate',
      headerName: 'Pol. End Date',
      flex: 1,
      minWidth: 121,
      disableReorder: true,
      sortable: false,
      renderCell: (params) => {
        return <div>{params.value || '-'}</div>;
      },
    },
    {
      field: 'confidenceScore',
      headerName: 'Score',
      flex: 1,
      minWidth: 121,
      disableReorder: true,
      sortable: false,
      renderHeader: () => {
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <p className="text-ml font-bold text-gray-700">Score</p>
            <Icon
              name={'questionMarkcircle'}
              size={18}
              color={IconColors.NONE}
            />
          </div>
        );
      },
      renderCell: (params) => {
        const confidenceScore = params.value;
        const isHigh = confidenceScore === 'Y';
        return (
          <div className="flex flex-col">
            <div
              className={`cursor-pointer ${
                isHigh ? 'text-green-500 font-bold' : 'text-red-500 font-bold'
              }`}
            >
              {isHigh ? 'High' : 'Low'}
            </div>
            <Tooltip
              title={params.row.confidenceScoreReason}
              arrow
              placement="right"
            >
              <div
                className="cursor-pointer text-blue-500 underline"
                onClick={() => {}}
              >
                View
              </div>
            </Tooltip>
          </div>
        );
      },
    },
    {
      field: 'verifiedValue10',
      headerName: 'Link Plan',
      flex: 1,
      minWidth: 152,
      disableReorder: true,
      sortable: false,
      headerClassName: '!bg-cyan-100 !text-center ',
      cellClassName: '!bg-cyan-50',
      renderHeader: () => {
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <p className="text-ml font-bold text-gray-700">Link Plan</p>
            <Icon
              name={'questionMarkcircle'}
              size={18}
              color={IconColors.NONE}
            />
          </div>
        );
      },
      renderCell: (params) => {
        const insuranceID = insuranceFinderData.find(
          (data) => data.payerID === params.row.id
        )?.insuranceID;
        const selectedInsurance = insuranceData.find(
          (m) => m.id === insuranceID
        );
        return (
          <div className="flex flex-col">
            <div className="cursor-pointer text-cyan-500" onClick={() => {}}>
              <div className="w-[120px]">
                <SingleSelectGridDropDown
                  placeholder="-"
                  showSearchBar={true}
                  data={insuranceData || []}
                  selectedValue={selectedInsurance}
                  onSelect={(value) => {
                    if (value) {
                      const updatedInsuranceFinderData =
                        insuranceFinderData.map((data) => {
                          if (data.payerID === params.row.id) {
                            return {
                              ...data,
                              insuranceID: value.id,
                            };
                          }
                          return data;
                        });
                      setInsuranceFinderData(updatedInsuranceFinderData);
                      setInsuranceFinder({
                        ...insuranceFinder,
                        insuranceID: value.id,
                      });
                    }
                  }}
                />
              </div>
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="flex h-full w-full flex-col items-center justify-start overflow-hidden rounded-lg bg-gray-100 shadow">
        <div className="flex w-full flex-col items-start justify-start p-6 pb-2">
          <div className="inline-flex w-full items-center justify-between">
            <div className="flex items-center justify-start space-x-2">
              <p className="text-xl font-bold leading-7 text-gray-700">
                {`Insurance Finder - ${
                  insuranceFinderData &&
                  insuranceFinderData[0]?.subscriberFirstName
                    ? insuranceFinderData[0]?.subscriberFirstName
                    : ''
                }  ${
                  insuranceFinderData &&
                  insuranceFinderData[0]?.subscriberLastName
                    ? insuranceFinderData[0]?.subscriberLastName
                    : ''
                }`}
              </p>
            </div>
            <div className="float-right flex gap-2 font-medium leading-5 text-gray-700  ">
              <Button
                buttonType={ButtonType.secondary}
                cls={`inline-flex  gap-2 leading-5`}
              >
                <Icon name={'eye'} size={18} />
                <p className="text-sm">
                  View Full Insurance Finder Policies Report
                </p>
              </Button>
              <div className=" flex items-center justify-end gap-5">
                <div className="">
                  <CloseButton
                    onClick={() => {
                      onClose();
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={'w-full px-6'}>
          <div className={`h-[1px] w-full bg-gray-300`} />
        </div>
        <div className="bg-gray w-full flex-1 overflow-y-auto">
          <div className="flex">
            <div className="w-full self-center break-words px-[30px] py-8 text-justify text-sm text-gray-500">
              <p className="pb-4 text-sm text-gray-500">
                Select the insurance plans you want to add to the patient
                profile
              </p>
              <SearchDetailGrid
                checkboxSelection={true}
                hideHeader={true}
                hideFooter={true}
                columns={finderTableCols}
                pinnedColumns={{
                  right: ['verifiedValue10'],
                }}
                onSelectRow={(value) => {
                  setSelectedIds(value);
                }}
                rows={
                  insuranceFinderData
                    ?.filter((f) => !!f.payerID)
                    .map((row) => {
                      return { ...row, id: row.payerID };
                    }) || []
                }
              />
            </div>
          </div>
        </div>
        <div className="flex w-full items-center justify-center rounded-b-lg bg-gray-200 py-6">
          <div className="flex w-full items-center justify-end space-x-4 px-7">
            <Button
              buttonType={ButtonType.secondary}
              cls={`w-[102px]`}
              onClick={() => {
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button
              buttonType={ButtonType.primary}
              onClick={() => {
                // if(selectedIds)
                // {
                onClickInsuranceToPatient();
                onClose();
                // }
              }}
            >
              {' '}
              Add Insurance To Patient Profile
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
