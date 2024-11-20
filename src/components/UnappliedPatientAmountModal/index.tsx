import type { GridColDef } from '@mui/x-data-grid-pro';
import { GRID_CHECKBOX_SELECTION_COL_DEF } from '@mui/x-data-grid-pro';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { addToastNotification } from '@/store/shared/actions';
import {
  applyAdvancePatientPayments,
  getPatientUnappliedAdvancePayment,
} from '@/store/shared/sagas';
import type { PatientUnappliedAdvancePaymentResult } from '@/store/shared/types';
import { ToastType } from '@/store/shared/types';
import { currencyFormatter } from '@/utils';

import Button, { ButtonType } from '../UI/Button';
import CheckBox from '../UI/CheckBox';
import CloseButton from '../UI/CloseButton';
import Modal from '../UI/Modal';
import SearchDetailGrid from '../UI/SearchDetailGrid';
import StatusModal, { StatusModalType } from '../UI/StatusModal';

export interface LinkableClaimModalProps {
  open: boolean;
  onDownload: () => void;
  patientIDs: number[];
  onClose: () => void;
  // onDownload: () => void;
}
export default function UnappliedPatientAmountModal({
  open = false,
  patientIDs,
  onClose,
  onDownload,
}: LinkableClaimModalProps) {
  const dispatch = useDispatch();
  const [totalCount, setTotalCount] = useState<number>(0);
  const [showWarningModal, setWarningModal] = useState(false);
  const [ModalState, setModalState] = useState<{
    open: boolean;
    heading: string;
    description: string;
    okButtonText: string;
    closeButtonText: string;
    statusModalType: StatusModalType;
    showCloseButton: boolean;
    closeOnClickOutside: boolean;
    confirmButtonType: string;
    cancelButtonType: string;
  }>({
    open: false,
    heading: '',
    description: '',
    okButtonText: '',
    closeButtonText: '',
    statusModalType: StatusModalType.WARNING,
    showCloseButton: true,
    closeOnClickOutside: true,
    confirmButtonType: '',
    cancelButtonType: '',
  });
  const [unappliedPatientData, setUnappliedPatientData] = useState<
    PatientUnappliedAdvancePaymentResult[]
  >([]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const onSelectAll = async () => {
    if (unappliedPatientData.length === 0) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'No data to select!',
          toastType: ToastType.ERROR,
        })
      );
      return;
    }

    if (selectedRows.length === totalCount) {
      setSelectedRows([]);
      return;
    }
    if (patientIDs) {
      const res = await getPatientUnappliedAdvancePayment(
        patientIDs.toString()
      );
      if (res) setSelectedRows(res.map((m) => m.patientID));
    }
  };
  const column: GridColDef[] = [
    {
      ...GRID_CHECKBOX_SELECTION_COL_DEF,
      flex: 1,
      minWidth: 80,
      renderHeader: () => {
        return (
          <CheckBox
            id="AllCheckbox"
            checked={
              !!unappliedPatientData.length &&
              selectedRows.length === totalCount
            }
            onChange={onSelectAll}
            disabled={false}
          />
        );
      },
    },
    {
      field: 'patientID',
      headerName: 'Patient ID',
      flex: 1,
      minWidth: 120,
      disableReorder: true,
    },
    {
      field: 'unappliedAdvancePayment',
      headerName: 'Unapplied Advance Payment',
      flex: 1,
      minWidth: 120,

      disableReorder: true,
      renderCell: (params) => {
        const formattedValue = params.value
          ? currencyFormatter.format(params.value)
          : '-';
        return <div>{formattedValue}</div>;
      },
    },
    {
      field: 'patientBalance',
      headerName: 'Patient Balance',
      flex: 1,
      minWidth: 120,
      disableReorder: true,
      renderCell: (params) => {
        const formattedValue = params.value
          ? currencyFormatter.format(params.value)
          : '-';
        return <div>{formattedValue}</div>;
      },
    },
  ];
  const [openUnappliedPaymentModal, setOpenUnappliedPaymentModal] =
    useState(false);
  const getPatientUnappliedAdvancePaymentData = async () => {
    const res = await getPatientUnappliedAdvancePayment(patientIDs.toString());
    if (res && res.length) {
      setModalState({
        ...ModalState,
        open: true,
        heading: 'Unapplied Patient Payments Available',
        showCloseButton: true,
        closeButtonText: 'Apply Payments',
        okButtonText: 'Download Statement',
        confirmButtonType: 'download_statement',
        cancelButtonType: 'apply_amounts',
        statusModalType: StatusModalType.WARNING,
        description:
          'Unapplied patient payments detected; would you like to apply them before generating statements or proceed with unapplied payments?',
      });
      // setOpenUnappliedPaymentModal(true);
      setUnappliedPatientData(res);
      setTotalCount(res.length);
    } else {
      onDownload();
      setUnappliedPatientData([]);
    }
  };
  useEffect(() => {
    if (open) {
      getPatientUnappliedAdvancePaymentData();
    }
  }, [open]);
  const applyAdvancePatientPaymentsForSelectedRows = async () => {
    const res = await applyAdvancePatientPayments(selectedRows.toString());
    if (res) {
      setSelectedRows([]);
      setUnappliedPatientData([]);
      setWarningModal(false);
      setOpenUnappliedPaymentModal(false);
      onClose();
    }
  };
  return (
    <>
      <Modal
        open={openUnappliedPaymentModal}
        onClose={() => {
          onClose();
          setOpenUnappliedPaymentModal(false);
          setSelectedRows([]);
          setUnappliedPatientData([]);
        }}
        modalContentClassName="relative bg-gray-100 h-[calc(100%-80px)] w-[calc(100%-350px)] overflow-y-auto rounded-lg bg-white shadow-xl transition-all sm:my-8 w-full"
      >
        <div className="flex flex-col bg-gray-100">
          <div className="mt-3 max-w-full p-4">
            <div className="flex flex-row justify-between">
              <div>
                <h1 className=" ml-2  text-left text-xl font-bold leading-7 text-gray-700">
                  Apply Patient Payments
                </h1>
              </div>
              <div className="">
                <CloseButton
                  onClick={() => {
                    onClose();
                    setOpenUnappliedPaymentModal(false);
                    setSelectedRows([]);
                    setUnappliedPatientData([]);
                  }}
                />
              </div>
            </div>
            <div className="mt-3 h-px w-full bg-gray-300" />
          </div>
          <div className="flex flex-col">
            <div className="w-full flex-1 overflow-y-auto bg-gray-100">
              <div className="flex">
                <div className="w-full self-center break-words p-6 text-justify text-sm text-gray-500">
                  <SearchDetailGrid
                    hideHeader={true}
                    hideFooter={true}
                    totalCount={unappliedPatientData?.length}
                    rows={
                      unappliedPatientData?.map((row) => {
                        return { ...row, id: row.patientID };
                      }) || []
                    }
                    columns={column}
                    checkboxSelection={true}
                    selectRows={selectedRows}
                    onSelectRow={(ids: number[]) => {
                      setSelectedRows(ids);
                    }}
                    pinnedColumns={{
                      right: ['action'],
                    }}
                    setHeaderRadiusCSS={true}
                  />
                </div>
              </div>
            </div>
          </div>
          <div
            className={`h-[86px] bg-gray-200 w-full absolute bottom-0 z-[1]`}
          >
            <div className="flex flex-row-reverse gap-4 p-6 ">
              <div>
                <Button
                  buttonType={ButtonType.primary}
                  disabled={!selectedRows.length}
                  onClick={async () => {
                    setWarningModal(true);
                  }}
                >
                  Apply Payments
                </Button>
              </div>
              <div>
                <Button
                  buttonType={ButtonType.secondary}
                  cls={`w-[102px]`}
                  onClick={() => {
                    onClose();
                    setOpenUnappliedPaymentModal(false);
                    setSelectedRows([]);
                    setUnappliedPatientData([]);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
          <StatusModal
            open={showWarningModal}
            heading={'Apply Patient Payments Confirmation'}
            description={`This action will cause the selected Patient Payments to be Applied. Are you sure you want to proceed with Applying ${
              selectedRows.length > 1
                ? 'Payments for Patients: '
                : 'Payment for Patient: '
            } ${selectedRows.join(',')}?`}
            okButtonText={'Yes, Apply'}
            closeButtonText={'Cancel'}
            okButtonColor={ButtonType.tertiary}
            statusModalType={StatusModalType.WARNING}
            showCloseButton={true}
            closeOnClickOutside={false}
            onClose={() => {
              setWarningModal(false);
            }}
            onChange={async () => {
              if (selectedRows.length > 0) {
                applyAdvancePatientPaymentsForSelectedRows();
              }
            }}
          />
        </div>
      </Modal>
      <StatusModal
        open={ModalState.open}
        heading={ModalState.heading}
        description={ModalState.description}
        closeButtonText={ModalState.closeButtonText}
        statusModalType={ModalState.statusModalType}
        showCloseButton={ModalState.showCloseButton}
        okButtonText={ModalState.okButtonText}
        closeOnClickOutside={false}
        onChange={() => {
          if (ModalState.confirmButtonType === 'download_statement') {
            onDownload();
            setOpenUnappliedPaymentModal(false);
          }
          setModalState({
            ...ModalState,
            open: false,
          });
        }}
        onClose={() => {
          if (ModalState.cancelButtonType === 'apply_amounts') {
            setModalState({
              ...ModalState,
              open: false,
            });
            setOpenUnappliedPaymentModal(true);
          }
        }}
      />
    </>
  );
}
