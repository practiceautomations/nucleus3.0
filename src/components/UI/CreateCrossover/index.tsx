import type { GridColDef } from '@mui/x-data-grid-pro';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { addToastNotification } from '@/store/shared/actions';
import {
  createCrossOverClaim,
  getClaimAssignToData,
  getClaimDetailSummaryById,
  getClaimTransferInsurance,
  getCrossoverClaimType,
  submitClaim,
} from '@/store/shared/sagas';
import type {
  CreateCrossoverCriteria,
  SummaryBillingCharges,
} from '@/store/shared/types';
import { ToastType } from '@/store/shared/types';

import Button, { ButtonType } from '../Button';
import CloseButton from '../CloseButton';
import InputFieldAmount from '../InputFieldAmount';
import SearchDetailGrid from '../SearchDetailGrid';
import type { SingleSelectDropDownDataType } from '../SingleSelectDropDown';
import SingleSelectGridDropDown from '../SingleSelectGridDropdown';
import type { StatusDetailModalDataType } from '../StatusDetailModal';
import StatusModal, { StatusModalType } from '../StatusModal';
import TextArea from '../TextArea';

export interface CreateCrossoverProp {
  claimID?: number;
  onClose: () => void;
  groupID?: number;
  patientID?: number;
  selectedChargeID?: number;
}
export default function CreateCrossover({
  claimID,
  onClose,
  groupID,
  patientID,
  selectedChargeID,
}: CreateCrossoverProp) {
  const dispatch = useDispatch();
  const [summaryCharges, setSummaryCharges] = useState<SummaryBillingCharges[]>(
    []
  );
  const [crossOverTypeData, setCrossOverTypeData] = useState<
    SingleSelectDropDownDataType[]
  >([]);
  const [crossOverClaimToData, setCrossOverClaimToData] = useState<
    SingleSelectDropDownDataType[]
  >([]);
  const [crossOverAssignToData, setCrossOverAssignToData] = useState<
    SingleSelectDropDownDataType[]
  >([]);
  const [selectRows, setSelectRows] = useState<number[]>([]);
  const [crossoverID, setCrossoverID] = useState<number>();
  const [jsonData, setJsonData] = useState<{
    crossOverType?: SingleSelectDropDownDataType;
    crossOverClaimTo?: SingleSelectDropDownDataType;
    crossOverAssignTo?: SingleSelectDropDownDataType;
    comment?: string;
    chargesData?: {
      chargeID: number;
      amount: string;
    }[];
  }>();
  const chargeAmountColor = (chargeValue: string) => {
    if (Number(chargeValue) === 0) {
      return 'text-green-500';
    }
    if (Number(chargeValue) > 0) {
      return 'text-red-500';
    }
    return 'text-yellow-500';
  };
  const getChargesData = async () => {
    const res = await getClaimDetailSummaryById(claimID || 0);
    if (res) {
      setSummaryCharges(res.charges);
      if (selectedChargeID) {
        setSelectRows([selectedChargeID]);
      } else {
        setSelectRows(res.charges.map((row) => row.chargeID) || []);
      }
      setJsonData((prevData) => ({
        ...prevData,
        chargesData:
          res.charges.map((row) => ({
            chargeID: row.chargeID,
            amount: '',
          })) || [],
      }));
    }
  };
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
  const updateJson = (
    chargeID: number | null,
    feildName: string,
    value: any
  ) => {
    setJsonData((prevData) => {
      if (chargeID) {
        const updatedChargesData = prevData?.chargesData?.map((charge) => {
          if (charge.chargeID === chargeID) {
            return { ...charge, amount: value };
          }
          return charge;
        });
        return {
          ...prevData,
          chargesData: updatedChargesData,
        };
      }
      return {
        ...prevData,
        [feildName]: value,
      };
    });
  };
  const getCrossoverTypeData = async () => {
    if (claimID) {
      const res = await getCrossoverClaimType(claimID);
      if (res) {
        setCrossOverTypeData(res);
        if (res.length === 1) {
          updateJson(null, 'crossOverType', res[0]);
        }
      }
    }
  };
  const getClaimCrossOverAssignto = async () => {
    const res = await getClaimAssignToData(groupID);
    if (res) {
      setCrossOverAssignToData(res);
    }
  };
  const getClaimTransferInsuranceData = async () => {
    const res = await getClaimTransferInsurance(claimID);
    if (res) {
      setCrossOverClaimToData(res);
      if (res.length === 1) {
        updateJson(null, 'crossOverClaimTo', res[0]);
      }
    }
  };
  useEffect(() => {
    getCrossoverTypeData();
    getChargesData();
    getClaimTransferInsuranceData();
    getClaimCrossOverAssignto();
  }, []);
  const onSubmitClaim = async (
    submitAsIs: boolean,
    crossoverClaimID: number | undefined
  ) => {
    const res = await submitClaim([
      { claimID: crossoverClaimID, submitAs: submitAsIs },
    ]);
    if (res) {
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
        onClose();
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
          statusData: res.response.map((d) => {
            return { ...d, title: `#${d.id} - ${d.title}` };
          }),
        });
      }
    }
  };
  const createCrossOverClaims = async (isSubmit: boolean) => {
    if (jsonData && (!jsonData?.crossOverClaimTo || !jsonData?.crossOverType)) {
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
    if (jsonData && jsonData.chargesData) {
      const arrData: CreateCrossoverCriteria[] = [];
      const selectedCharges = jsonData?.chargesData.filter((a) =>
        selectRows.includes(a.chargeID)
      );
      if (selectedCharges.length === 0) {
        dispatch(
          addToastNotification({
            id: uuidv4(),
            text: 'Please select atleast one charge for creating crossover claim.',
            toastType: ToastType.ERROR,
          })
        );
        return;
      }
      if (selectedCharges.filter((a) => a.amount === '').length > 0) {
        dispatch(
          addToastNotification({
            id: uuidv4(),
            text: 'Amount to crossover cannot be empty.',
            toastType: ToastType.ERROR,
          })
        );
        return;
      }
      const invalidAmount = jsonData?.chargesData.filter((charge) => {
        const insuranceBalance = summaryCharges.find(
          (data) => data.chargeID === charge.chargeID
        )?.insuranceBalance;
        return Number(charge.amount) > (insuranceBalance || 0);
      });
      if (invalidAmount.length > 0) {
        dispatch(
          addToastNotification({
            id: uuidv4(),
            text: 'Amount to crossover should be less than insurance balance.',
            toastType: ToastType.ERROR,
          })
        );
        return;
      }
      selectedCharges.forEach((charge) => {
        const newData: CreateCrossoverCriteria = {
          claimID: claimID || 0,
          chargeID: charge.chargeID,
          patientID: patientID || 0,
          secondaryInsuranceID: jsonData.crossOverClaimTo?.id || 0,
          secondaryInsuranceAmount: Number(charge.amount) || 0,
          crossoverAssigneeID: jsonData.crossOverAssignTo?.id.toString() || '',
          crossoverClaimNote: jsonData?.comment || '',
        };
        arrData.push(newData);
      });
      const res = await createCrossOverClaim(arrData);
      if (!res) {
        setChangeModalState({
          ...changeModalState,
          open: true,
          heading: 'Error',
          statusModalType: StatusModalType.ERROR,
          description:
            'A system error prevented the crossover claim to be created. Please try again.',
        });
      } else if (isSubmit) {
        setCrossoverID(res);
        onSubmitClaim(false, res);
      } else {
        onClose();
      }
    }
  };

  const columns: GridColDef[] = [
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
      minWidth: 100,
      disableReorder: true,
    },
    {
      field: 'fee',
      flex: 1,
      minWidth: 90,
      headerName: 'Fee',
      disableReorder: true,
      renderCell: (params) => {
        return (
          <p>{`$${
            params && params.value ? params.value.toFixed(2) : '0.00'
          }`}</p>
        );
      },
    },
    {
      field: 'expected',
      headerName: 'Allowable',
      flex: 1,
      minWidth: 100,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <p>{`$${
            params && params.value ? params.value.toFixed(2) : '0.00'
          }`}</p>
        );
      },
    },
    {
      field: 'insurancePaid',
      headerName: 'Paid',
      flex: 1,
      minWidth: 90,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <p>{`$${
            params && params.value ? params.value.toFixed(2) : '0.00'
          }`}</p>
        );
      },
    },
    {
      field: 'insuranceAdjustment',
      headerName: 'Adj.',
      flex: 1,
      minWidth: 90,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <p className={chargeAmountColor(params?.value || '0.00')}>{`$${
            params && params.value ? params.value.toFixed(2) : '0.00'
          }`}</p>
        );
      },
    },
    {
      field: 'patientAmount',
      headerName: 'Pat. Resp.',
      flex: 1,
      minWidth: 90,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <p>{`$${
            params && params.value ? params.value.toFixed(2) : '0.00'
          }`}</p>
        );
      },
    },
    {
      field: 'insuranceBalance',
      headerName: 'Ins. Bal.',
      flex: 1,
      minWidth: 90,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <p className={chargeAmountColor(params?.value || '0.00')}>{`$${
            params && params.value ? params.value.toFixed(2) : '0.00'
          }`}</p>
        );
      },
    },
    {
      field: 'amount',
      headerName: 'Amount to Crossover*',
      flex: 1,
      minWidth: 200,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <InputFieldAmount
            disabled={false}
            showCurrencyName={false}
            value={
              jsonData?.chargesData?.find(
                (charge) => charge.chargeID === params.row.chargeID
              )?.amount || ''
            }
            onChange={(e) => {
              updateJson(params.row.chargeID, 'charge', e.target.value);
            }}
          />
        );
      },
    },
  ];
  return (
    <div
      className="inline-flex flex-col items-center justify-start space-y-6 rounded-lg bg-gray-50 shadow "
      style={{ width: 1232, height: 780 }}
    >
      <div
        className="no-scrollbar flex flex-col items-start justify-start space-y-1 overflow-y-auto pt-6 "
        style={{ width: 1184 }}
      >
        <div
          className="inline-flex items-center justify-between space-x-96"
          style={{ width: 1184, height: 28 }}
        >
          <div className="flex items-center justify-start space-x-2">
            <p className="text-xl font-bold leading-7 text-gray-700">
              Create Crossover Claim {claimID}
            </p>
          </div>
          <CloseButton onClick={onClose} />
        </div>
        <div
          className="inline-flex items-center justify-center pt-2.5 pb-2"
          style={{ width: 1184 }}
        >
          <div className="bg-gray-300" style={{ width: 1184, height: 1 }} />
        </div>
        <div className="!my-3 inline-flex items-start justify-start space-x-8">
          <div className="inline-flex items-start justify-start space-x-6">
            <div className="inline-flex w-48 flex-col items-start justify-start space-y-1">
              <p className="text-sm font-medium leading-tight">
                Crossover Claim Type*
              </p>
              <div className="w-[200px]">
                <SingleSelectGridDropDown
                  placeholder=""
                  showSearchBar={true}
                  data={crossOverTypeData}
                  selectedValue={jsonData?.crossOverType}
                  onSelect={(e) => {
                    updateJson(null, 'crossOverType', e);
                  }}
                />
              </div>
            </div>
            <div className="flex items-end justify-end space-x-2">
              <div className="inline-flex flex-1 flex-col items-start justify-start space-y-1">
                <p className="text-sm font-medium leading-tight">
                  Bill Crossover Claim To*
                </p>
                <div className="w-[320px]">
                  <SingleSelectGridDropDown
                    placeholder=""
                    showSearchBar={true}
                    data={crossOverClaimToData}
                    selectedValue={jsonData?.crossOverClaimTo}
                    onSelect={(e) => {
                      updateJson(null, 'crossOverClaimTo', e);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-end justify-start space-x-2">
            <div className="inline-flex flex-col items-start justify-start space-y-1">
              <div className="inline-flex items-center justify-start space-x-2">
                <p className="text-sm font-medium leading-tight">
                  Assign Crossover Claim to
                </p>
              </div>
              <div className="w-[280px]">
                <SingleSelectGridDropDown
                  placeholder=""
                  showSearchBar={true}
                  data={crossOverAssignToData}
                  selectedValue={jsonData?.crossOverAssignTo}
                  onSelect={(e) => {
                    updateJson(null, 'crossOverAssignTo', e);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="inline-flex items-center justify-center pt-2.5 pb-2">
          <div className="bg-gray-300" style={{ width: 1184, height: 1 }} />
        </div>
        <div className="inline-flex w-full flex-col items-start justify-start ">
          <div className="mt-2 mb-6 flex flex-col items-start justify-start space-y-4">
            <p className="text-base font-bold leading-normal text-gray-700">
              Select Charges and Amounts to include in Crossover Claim*
            </p>
          </div>
          <div className="no-scrollbar !h-[240px] w-full overflow-y-auto">
            <SearchDetailGrid
              hideHeader={true}
              hideFooter={true}
              checkboxSelection={true}
              rows={
                summaryCharges?.map((row) => {
                  return { ...row, id: row.chargeID };
                }) || []
              }
              columns={columns}
              selectRows={selectRows}
              onSelectRow={(ids: number[]) => {
                setSelectRows(ids);
              }}
            />
          </div>
        </div>
        <div
          className="inline-flex items-center justify-center py-6"
          style={{ width: 1184, height: 20 }}
        >
          <div className="bg-gray-300" style={{ width: 1184, height: 1 }} />
        </div>
        <div
          className="inline-flex flex-col items-start justify-start space-y-4"
          style={{ width: 1184, height: 140 }}
        >
          <p className="text-base font-bold leading-normal">
            Why are you creating a Crossover Claim?
          </p>
          <TextArea
            placeholder="Click here to write note"
            value={jsonData?.comment}
            onChange={(e) => {
              updateJson(null, 'comment', e.target.value);
            }}
          />
        </div>
      </div>
      <div
        className="absolute bottom-0 inline-flex items-center justify-center rounded-b-lg bg-gray-200 py-6"
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
            onClick={() => {
              createCrossOverClaims(false);
            }}
          >
            <p className="text-sm font-medium leading-tight">
              Create Crossover Claim
            </p>
          </Button>
          <Button
            buttonType={ButtonType.primary}
            cls={`inline-flex px-4 py-2 gap-2 leading-5`}
            onClick={() => {
              createCrossOverClaims(true);
            }}
          >
            <p className="text-sm font-medium leading-tight">
              Create and Submit Crossover Claim
            </p>
          </Button>
        </div>
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
        }}
        onChange={() => {
          setSubmitModalState({
            ...submitModalState,
            open: false,
          });
          if (!submitModalState.showCloseButton) {
            onClose();
            dispatch(
              addToastNotification({
                id: uuidv4(),
                text: 'Submission Error: Rejected by Nucleus',
                toastType: ToastType.ERROR,
              })
            );
          } else {
            onSubmitClaim(true, crossoverID);
          }
        }}
      />
    </div>
  );
}
