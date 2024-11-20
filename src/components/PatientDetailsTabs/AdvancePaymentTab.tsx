import type { GridColDef } from '@mui/x-data-grid-pro';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { addToastNotification } from '@/store/shared/actions';
import {
  fetchPostingDate,
  getAdvancePayament,
  refundAdvancePayment,
  reversePayament,
  updateDos,
} from '@/store/shared/sagas';
import type { AdvancePayemntType } from '@/store/shared/types';
import {
  type AdvancePayemntData,
  type GetPatientRequestData,
  type PostingDateCriteria,
  type RefundPaymentData,
  type UpdateDosData,
  ToastType,
} from '@/store/shared/types';
import type {
  DownloadDataPDFDataType,
  PDFColumnInput,
  PDFRowInput,
} from '@/utils';
import {
  currencyFormatter,
  ExportDataToCSV,
  ExportDataToDrive,
  ExportDataToPDF,
} from '@/utils';
import classNames from '@/utils/classNames';
import {
  DateToStringPipe,
  StringToDatePipe,
} from '@/utils/dateConversionPipes';

import Icon from '../Icon';
import { AddAdvancePayement } from '../PatientTabs/addAdvancePayment';
import AppDatePicker from '../UI/AppDatePicker';
import Button, { ButtonType } from '../UI/Button';
import type { ButtonSelectDropdownDataType } from '../UI/ButtonSelectDropdown';
import ButtonSelectDropdownForExport from '../UI/ButtonSelectDropdownForExport';
import CloseButton from '../UI/CloseButton';
import InputFieldAmount from '../UI/InputFieldAmount';
import Modal from '../UI/Modal';
import SearchDetailGrid from '../UI/SearchDetailGrid';
import SectionHeading from '../UI/SectionHeading';
import type { StatusModalProps } from '../UI/StatusModal';
import StatusModal, { StatusModalType } from '../UI/StatusModal';

export interface AdvancePaymentTabProps {
  patientID: number | null;
  selectedPatientData: GetPatientRequestData;
}

export default function AdvancePaymentTab({
  patientID,
  selectedPatientData,
}: AdvancePaymentTabProps) {
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState<boolean>(false);
  const [refundRemainingBalance, setRefundRemainingBalance] = useState('');
  const [isReversed, setIsRevered] = useState<boolean>(false);
  const [advPaymentID, setAdvPaymentID] = useState<number | null>(null);
  const [paymentLedgerRows, setPaymentLedgerRows] =
    useState<AdvancePayemntData>();

  const getPatientLedgerData = async () => {
    const res = await getAdvancePayament(patientID);
    if (res) {
      const paymentLedgerData: AdvancePayemntData = {
        withDOSAmount: res.withDOSAmount,
        withoutDOSAmount: res.withoutDOSAmount,
        totalBalance: res.totalBalance,
        patientAdvancePayments: res.patientAdvancePayments,
      };
      setPaymentLedgerRows(paymentLedgerData);
    }
  };
  useEffect(() => {
    getPatientLedgerData();
  }, []);
  const [showRefundPaymentModal, setShowRefundPaymentModal] =
    useState<boolean>(false);
  const [refundPaymentData, setRefundPaymentData] = useState<RefundPaymentData>(
    {
      advancePaymentID: undefined,
      postingDate: new Date(),
      amount: undefined,
    }
  );
  const [postingDateModel, setPostingDateModel] = useState<boolean>(false);
  const [statusModalState, setStatusModalState] = useState<StatusModalProps>({
    open: false,
    heading: '',
    description: '',
    okButtonText: 'Ok',
    statusModalType: StatusModalType.ERROR,
    showCloseButton: false,
    closeOnClickOutside: false,
  });
  const [isEditDos, setIsEditDos] = useState<boolean>(false);
  const onRefundPayment = async () => {
    const postingDateCriteria: PostingDateCriteria = {
      id: selectedPatientData?.groupID,
      type: 'charge',
      postingDate: DateToStringPipe(refundPaymentData.postingDate, 1),
    };
    const dateRes = await fetchPostingDate(postingDateCriteria);
    if (dateRes && dateRes.postingCheck === false) {
      setStatusModalState({
        ...statusModalState,
        open: true,
        heading: 'Error',
        statusModalType: StatusModalType.ERROR,
        description: dateRes.message,
      });
      return;
    }

    const obj: any = { ...refundPaymentData };
    obj.postingDate = DateToStringPipe(obj.postingDate, 1);

    const res = await refundAdvancePayment(obj);
    if (!res) {
      setStatusModalState({
        ...statusModalState,
        open: true,
        heading: 'Error',
        statusModalType: StatusModalType.ERROR,
        description: 'Something Went Wrong',
      });
    } else {
      getPatientLedgerData();
      setShowRefundPaymentModal(false);
    }
  };
  const [DosData, setDosData] = useState<UpdateDosData>({
    dos: '',
    advancePaymentID: null,
  });
  const [dosLedger, setDosLedger] = useState<string>('');
  const onApplyNewDos = async () => {
    const updateDosData: UpdateDosData = {
      dos: DosData.dos,
      advancePaymentID: advPaymentID,
    };
    if (updateDosData) {
      const res = await updateDos(updateDosData);
      setIsEditDos(false);
      if (!res) {
        setStatusModalState({
          ...statusModalState,
          open: true,
          heading: 'Error',
          statusModalType: StatusModalType.ERROR,
          description: 'Something Went Wrong',
        });
      } else {
        getPatientLedgerData();
        setDosLedger('');
      }
    }
    // }
  };
  const [postingDate, setPostingDate] = useState<string>('');

  const getReversepaymentResponse = () => {
    reversePayament(advPaymentID || undefined, postingDate);
  };
  const paymentHistoryCols: GridColDef[] = [
    {
      field: 'paymentLedgerID',
      headerName: 'Adv. Pay. ID',
      flex: 1,
      minWidth: 126,
      disableReorder: true,
      sortable: false,
      renderCell: (params) => {
        return <div>#{params.value}</div>;
      },
    },
    {
      field: 'appointmentID',
      headerName: 'Appointment ID',
      flex: 1,
      minWidth: 153,
      disableReorder: true,
      sortable: false,
      renderCell: (params) => {
        const formattedValue = params.value !== null ? `#${params.value}` : '-';
        return <div>{formattedValue}</div>;
      },
    },
    {
      field: 'checkDate',
      headerName: 'Check Date',
      flex: 1,
      minWidth: 132,
      disableReorder: true,
      sortable: false,
      renderCell: (params) => {
        const date = new Date(params.value);
        return <div>{DateToStringPipe(date, 2)}</div>;
      },
    },
    {
      field: 'postingDate',
      headerName: 'Post Date',
      flex: 1,
      minWidth: 113,
      disableReorder: true,
      sortable: false,
      renderCell: (params) => {
        const date = new Date(params.value);
        return <div>{DateToStringPipe(date, 2)}</div>;
      },
    },
    {
      field: 'dos',
      headerName: 'DoS',
      flex: 1,
      minWidth: 137,
      disableReorder: true,
      sortable: false,
      renderCell: (params) => {
        const formattedValue = params.value !== null ? `${params.value}` : '-';
        return <div>{formattedValue}</div>;
      },
    },
    {
      field: 'amount',
      headerName: 'Amount',
      flex: 1,
      minWidth: 101,
      disableReorder: true,
      sortable: false,
      renderCell: (params) => {
        const formattedValue = params.value
          ? currencyFormatter.format(params.value)
          : '-';
        return <div>{formattedValue}</div>;
      },
    },
    {
      field: 'ledgerName',
      headerName: 'Ledger Name',
      flex: 1,
      minWidth: 226,
      disableReorder: true,
    },
    {
      field: 'checkNumber',
      headerName: 'Check Number',
      flex: 1,
      minWidth: 144,
      disableReorder: true,
      renderCell: (params) => {
        const formattedValue = params.value !== null ? `${params.value}` : '-';
        return <div>{formattedValue}</div>;
      },
    },
    {
      field: 'paymentType',
      headerName: 'Payment Type',
      flex: 1,
      minWidth: 145,
      disableReorder: true,
      renderCell: (params) => {
        const formattedValue = params.value !== null ? `${params.value}` : '-';
        return <div>{formattedValue}</div>;
      },
    },
    {
      field: 'comments',
      headerName: 'Comments',
      flex: 1,
      minWidth: 118,
      disableReorder: true,
      renderCell: (params) => {
        const formattedValue = params.value !== null ? `${params.value}` : '-';
        return <div>{formattedValue}</div>;
      },
    },
    {
      field: 'claimID',
      headerName: 'Claim ID',
      flex: 1,
      minWidth: 104,
      disableReorder: true,
      renderCell: (params) => {
        const formattedValue = params.value !== null ? `#${params.value}` : '-';
        return (
          <div className="flex flex-col">
            <div
              data-testid="org"
              className="cursor-pointer text-cyan-500"
              onClick={() => {}}
            >
              {formattedValue}
            </div>
          </div>
        );
      },
    },
    {
      field: 'chargeID',
      headerName: 'Charge ID',
      flex: 1,
      minWidth: 114,
      disableReorder: true,
      renderCell: (params) => {
        const formattedValue = params.value !== null ? `#${params.value}` : '-';
        return (
          <div className="flex flex-col">
            <div
              data-testid="org"
              className="cursor-pointer text-cyan-500"
              onClick={() => {}}
            >
              {formattedValue}
            </div>
          </div>
        );
      },
    },
    {
      field: 'createdOn',
      headerName: 'Created On',
      flex: 1,
      minWidth: 123,
      disableReorder: true,
      renderCell: (params) => {
        const date = new Date(params.value);
        return <div>{DateToStringPipe(date, 2)}</div>;
      },
    },
    {
      field: 'createdBy',
      headerName: 'Created By',
      flex: 1,
      minWidth: 152,
      disableReorder: true,
      renderCell: (params) => {
        const formattedValue = params.value !== null ? `${params.value}` : '-';
        return (
          <div className="flex flex-col">
            <div
              data-testid="org"
              className="cursor-pointer text-cyan-500"
              onClick={() => {}}
            >
              {formattedValue}
            </div>
          </div>
        );
      },
    },
    {
      field: 'action',
      headerName: 'Actions',
      flex: 1,
      minWidth: 460,
      disableReorder: true,
      cellClassName: '!bg-cyan-50',
      headerClassName: '!bg-cyan-100 !text-center',
      renderCell: (params) => {
        return (
          <div className="flex flex-row  gap-2">
            <div>
              <Button
                disabled={params.row.dosDisable}
                buttonType={ButtonType.primary}
                cls={`w-[140px] inline-flex px-4 py-2 gap-2 leading-5 ${
                  params.row.dosDisable === true
                    ? 'bg-cyan-600 cursor-default'
                    : 'bg-cyan-500'
                }`}
                onClick={() => {
                  setIsEditDos(true);
                  setAdvPaymentID(params.row.paymentLedgerID);
                  setDosLedger(params.row.dos);
                }}
              >
                <Icon name={'pen'} size={18} />
                <p
                  data-testid="updateAdvancePaymentDos"
                  className="mt-[2px] self-center text-xs font-medium leading-4"
                >
                  Update DoS
                </p>
              </Button>
            </div>
            <div>
              <Button
                buttonType={ButtonType.secondary}
                disabled={params.row.reverseDisable}
                cls={'w-[160px] inline-flex px-4 py-2 gap-2 leading-5 '}
                onClick={() => {
                  setIsRevered(true);
                  setAdvPaymentID(params.row.paymentLedgerID);
                  setStatusModalState({
                    ...statusModalState,
                    open: true,
                    heading: 'Reverse Advanced Payment',
                    description: 'Are you sure to reverse this payment?',
                    okButtonText: 'Yes',
                    closeButtonText: 'No',
                    statusModalType: StatusModalType.WARNING,
                    showCloseButton: true,
                    closeOnClickOutside: false,
                  });
                }}
              >
                <Icon name={'reverse'} size={18} />
                <p className="mt-[2px] self-center text-xs font-medium leading-4">
                  Reverse Payment
                </p>
              </Button>
            </div>
            <div>
              <Button
                disabled={params.row.refundDisable}
                buttonType={ButtonType.primary}
                cls={`w-[100px] inline-flex px-4 py-2 gap-2 leading-5 ${
                  params.row.dosDisable === true
                    ? 'bg-cyan-600 cursor-default'
                    : 'bg-cyan-500'
                }`}
                onClick={() => {
                  setShowRefundPaymentModal(true);
                  setRefundRemainingBalance(params.row.remainingBalance);
                  setRefundPaymentData({
                    ...refundPaymentData,
                    advancePaymentID: params.row.paymentLedgerID,
                    postingDate: new Date(),
                    amount: undefined,
                  });
                }}
              >
                <Icon name={'payment'} size={18} />
                <p
                  data-testid="updateAdvancePaymentDos"
                  className="mt-[2px] self-center text-xs font-medium leading-4"
                >
                  Refund
                </p>
              </Button>
            </div>
          </div>
        );
      },
    },
  ];
  const exportDropdownData: ButtonSelectDropdownDataType[] = [
    {
      id: 1,
      value: 'Export to PDF',
      icon: 'pdf',
    },
    {
      id: 2,
      value: 'Export to CSV',
      icon: 'csv',
    },
    {
      id: 3,
      value: 'Export to Google Drive',
      icon: 'drive',
    },
  ];
  const dispatch = useDispatch();
  const [statusModalInfo, setStatusModalInfo] = useState({
    show: false,
    heading: '',
    text: '',
    type: StatusModalType.WARNING,
    showCloseBUtton: StatusModalType.WARNING,
  });
  const downloadPdf = (pdfExportData: AdvancePayemntType[]) => {
    if (!pdfExportData) {
      setStatusModalInfo({
        ...statusModalInfo,
        show: true,
        heading: 'Alert',
        type: StatusModalType.WARNING,
        text: 'No Record to Export!',
      });
      return false;
    }
    const data: DownloadDataPDFDataType[] = [];
    // implement criteria
    const criteriaArray: PDFRowInput[] = [];

    if (patientID) {
      criteriaArray.push({
        Criteria: 'Patient ID',
        Value: patientID?.toString() || '',
      });
    }

    if (paymentLedgerRows?.withDOSAmount) {
      criteriaArray.push({
        Criteria: 'With DOS',
        Value:
          (paymentLedgerRows?.withDOSAmount &&
            currencyFormatter.format(paymentLedgerRows?.withDOSAmount)) ||
          '',
      });
    }

    if (paymentLedgerRows?.withoutDOSAmount) {
      criteriaArray.push({
        Criteria: 'Without DOS',
        Value:
          (paymentLedgerRows?.withoutDOSAmount &&
            currencyFormatter.format(paymentLedgerRows?.withoutDOSAmount)) ||
          '',
      });
    }

    if (paymentLedgerRows?.totalBalance) {
      criteriaArray.push({
        Criteria: 'Total Advance Pay. Bal.',
        Value:
          (paymentLedgerRows?.totalBalance &&
            currencyFormatter.format(paymentLedgerRows?.totalBalance)) ||
          '',
      });
    }

    const criteriaColumns: PDFColumnInput[] = [];
    const keyNames1 =
      criteriaArray && criteriaArray[0] && Object.keys(criteriaArray[0]);
    if (keyNames1) {
      for (let i = 0; i < keyNames1.length; i += 1) {
        criteriaColumns.push({ title: keyNames1[i], dataKey: keyNames1[i] });
      }
    }
    data.push({ columns: criteriaColumns, body: criteriaArray });
    // implement data
    const searchData: PDFRowInput[] = pdfExportData.map((n) => {
      return {
        'Adv. Pay. ID': n.paymentLedgerID.toString(),
        'Appointment ID': n.appointmentID ? n.appointmentID.toString() : '-',
        'Check Date': n.checkDate,
        'Post Date': n.postingDate || '',
        DoS: n.dos || '',
        Amount: n.amount ? currencyFormatter.format(n.amount) : '-',
        'Ledger Name': n.ledgerName,
        'Check Number': n.checkNumber,
        'Payment Type': n.paymentType,
        Comments: n.comments,
        'Claim ID ': n.claimID ? n.claimID.toString() : '-',
        'Charge ID': n.chargeID ? n.chargeID.toString() : '-',
        'Created On ': n.createdOn,
        'Created By': n.createdBy,
      };
    });
    const dataColumns: PDFColumnInput[] = [];
    const keyNames = searchData[0] && Object.keys(searchData[0]);
    if (keyNames) {
      for (let i = 0; i < keyNames.length; i += 1) {
        dataColumns.push({ title: keyNames[i], dataKey: keyNames[i] });
      }
    }
    data.push({ columns: dataColumns, body: searchData });
    ExportDataToPDF(data, 'Advanced Payments Summary');
    dispatch(
      addToastNotification({
        text: 'Export Successful',
        toastType: ToastType.SUCCESS,
        id: '',
      })
    );
    return true;
  };
  const ExportData = async (type: string) => {
    if (type === 'pdf') {
      downloadPdf(paymentLedgerRows?.patientAdvancePayments || []);
    } else {
      const exportDataArray = paymentLedgerRows?.patientAdvancePayments.map(
        function (n) {
          return {
            'Adv. Pay. ID': n.paymentLedgerID.toString(),
            'Appointment ID': n.appointmentID
              ? n.appointmentID.toString()
              : '-',
            'Check Date': n.checkDate,
            'Post Date': n.postingDate || '',
            DoS: n.dos || '',
            Amount: n.amount ? currencyFormatter.format(n.amount) : '-',
            'Ledger Name': n.ledgerName,
            'Check Number': n.checkNumber,
            'Payment Type': n.paymentType,
            Comments: n.comments,
            'Claim ID ': n.claimID ? n.claimID.toString() : '-',
            'Charge ID': n.chargeID ? n.chargeID.toString() : '-',
            'Created On ': n.createdOn,
            'Created By': n.createdBy,
          };
        }
      );
      if (exportDataArray && exportDataArray.length !== 0) {
        const headerArray = Object.keys(exportDataArray[0] || {});
        let criteriaObj: { [key: string]: string } = { ...exportDataArray[0] };
        const criteriaArray = [];
        criteriaObj = Object.fromEntries(headerArray.map((key) => [key, '']));
        criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
        criteriaObj = {
          ...criteriaObj,
          'Adv. Pay. ID': 'Patient ID',
          'Appointment ID': patientID?.toString() || '',
        };
        criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
        criteriaObj = {
          ...criteriaObj,
          'Adv. Pay. ID': 'With DoS',
          'Appointment ID':
            (paymentLedgerRows?.withDOSAmount &&
              currencyFormatter.format(paymentLedgerRows?.withDOSAmount)) ||
            '',
        };
        criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
        criteriaObj = {
          ...criteriaObj,
          'Adv. Pay. ID': 'Without DoS',
          'Appointment ID':
            (paymentLedgerRows?.withoutDOSAmount &&
              currencyFormatter.format(paymentLedgerRows?.withoutDOSAmount)) ||
            '',
        };
        criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
        criteriaObj = {
          ...criteriaObj,
          'Adv. Pay. ID': 'Total Advance Pay, Bal.',
          'Appointment ID':
            (paymentLedgerRows?.totalBalance &&
              currencyFormatter.format(paymentLedgerRows?.totalBalance)) ||
            '',
        };
        criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
        criteriaObj = Object.fromEntries(headerArray.map((key) => [key, '']));
        criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
        criteriaObj = {
          ...criteriaObj,
          'Adv. Pay. ID': 'Advanced Payments History Ledger',
          'Appointment ID': '',
        };
        criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
        criteriaObj = Object.fromEntries(headerArray.map((key) => [key, '']));
        criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
        criteriaObj = Object.fromEntries(headerArray.map((key) => [key, key]));
        criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
        const exportArray = criteriaArray.concat(exportDataArray);
        if (type === 'csv') {
          ExportDataToCSV(exportArray, 'Advanced Payments Summary');
          dispatch(
            addToastNotification({
              text: 'Export Successful',
              toastType: ToastType.SUCCESS,
              id: '',
            })
          );
        } else {
          ExportDataToDrive(exportArray, 'Advanced Payments Summary', dispatch);
        }
      }
    }
  };
  const postingDateCriteria: PostingDateCriteria = {
    id: selectedPatientData?.groupID,
    type: 'charge',
    postingDate: DateToStringPipe(postingDate, 1),
  };
  const onSelectExportOption = (res: ButtonSelectDropdownDataType[]) => {
    if (
      !paymentLedgerRows ||
      !paymentLedgerRows.patientAdvancePayments.length
    ) {
      setStatusModalInfo({
        ...statusModalInfo,
        show: true,
        heading: 'Alert',
        type: StatusModalType.WARNING,
        text: 'No Record to Export!',
      });
      return;
    }
    const id = res[0]?.id || 0;
    if (id === 1) {
      ExportData('pdf');
    }
    if (id === 2) {
      ExportData('csv');
    }
    if (id === 3) {
      ExportData('download');
    }
  };
  return (
    <>
      <StatusModal
        open={statusModalState.open}
        heading={statusModalState.heading}
        description={statusModalState.description}
        okButtonText={statusModalState.okButtonText}
        okButtonColor={statusModalState.okButtonColor}
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
          setStatusModalState({
            ...statusModalState,
            open: false,
          });

          if (showRefundPaymentModal) {
            onRefundPayment();
            return;
          }
          if (isReversed) {
            setPostingDateModel(true);
          }
          if (isReversed) {
            setPostingDateModel(true);
          }
        }}
      />
      <div className="w-full bg-gray-100 text-gray-700">
        <div className="inline-flex w-full flex-col items-start justify-end space-y-6">
          <div className="inline-flex w-full items-center justify-start">
            <div className="inline-flex w-full">
              <div className="text-xl font-bold leading-5 text-gray-700">
                <div className="mt-[50px] mr-[24px] flex gap-6">
                  <div className=" inline-flex">
                    <div className=" flex items-center">
                      Advanced Payments Summary
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button
                      buttonType={ButtonType.primary}
                      fullWidth={true}
                      cls={`w-[200px] h-[38px] inline-flex !justify-center leading-loose`}
                      style={{ verticalAlign: 'middle' }}
                      onClick={() => {
                        setIsAddPaymentOpen(true);
                      }}
                    >
                      <p className="text-justify text-sm">
                        Add Advanced Payment
                      </p>
                    </Button>
                    {paymentLedgerRows?.patientAdvancePayments.length ? (
                      <ButtonSelectDropdownForExport
                        data={exportDropdownData}
                        onChange={onSelectExportOption}
                        isSingleSelect={true}
                        cls={'inline-flex'}
                        disabled={false}
                        buttonContent={
                          <button
                            id={''}
                            className={classNames(
                              `border-transparent bg-cyan-500 focus:ring-cyan-700 hover:bg-cyan-700 text-white inline-flex items-center justify-center gap-2 border border-solid border-gray-300  pt-[9px] pb-[9px] pl-[13px] pr-[17px] text-left font-medium leading-5 transition-all rounded-md`
                            )}
                          >
                            <Icon name={'export'} size={18} />
                            <p className="text-sm">Export</p>
                          </button>
                        }
                      />
                    ) : // <ButtonDropdown
                    //   buttonCls="!h-[38px]"
                    //   cls={`!w-[165px] h-[38px] ml-[10px] inline-flex !justify-center leading-loose`}
                    //   popoverCls="!w-[172px]"
                    //   buttonLabel="Export Report"
                    //   dataList={[
                    //     {
                    //       id: 1,
                    //       title: 'Export Report to PDF',
                    //       showBottomDivider: false,
                    //     },
                    //     {
                    //       id: 2,
                    //       title: 'Export Report to CSV',
                    //       showBottomDivider: false,
                    //     },
                    //     {
                    //       id: 3,
                    //       title: 'Export to Google Drive',
                    //       showBottomDivider: false,
                    //     },
                    //   ]}
                    //   onSelect={(value) => {
                    //     // if (value === 1) {
                    //     //   ExportData('pdf');
                    //     // }
                    //     if (value === 2) {
                    //       ExportData();
                    //     }
                    //   }}
                    // />
                    null}
                  </div>
                </div>
                <Modal
                  open={isAddPaymentOpen}
                  onClose={() => {
                    setIsAddPaymentOpen(false);
                  }}
                  modalContentClassName="rounded-lg bg-gray-100 text-left shadow-xl "
                >
                  <AddAdvancePayement
                    groupID={selectedPatientData?.groupID}
                    selectedPatientID={patientID}
                    onClose={() => setIsAddPaymentOpen(false)}
                    refreshDate={() => {
                      getPatientLedgerData();
                    }}
                  />
                </Modal>
              </div>
            </div>
          </div>
          <div className="relative w-full text-sm leading-tight text-gray-500">
            {!paymentLedgerRows?.patientAdvancePayments.length ? (
              <div className="h-[60px] w-[372px]">
                {`There are no advanced payments data for this patient yet. To add an advanced payment, click the "Add Advanced Payment" button.`}
              </div>
            ) : (
              <>
                <div className="inline-flex space-x-4">
                  <div className="inline-flex w-56 items-start justify-start rounded-md border border-gray-300 bg-white p-4 shadow">
                    <div className="inline-flex flex-1 flex-col items-start justify-start space-y-1">
                      <p className="w-full text-base leading-normal text-gray-500">
                        With DoS
                      </p>
                      <div className="inline-flex w-full items-end justify-start">
                        <div className="flex flex-1 items-end justify-start space-x-2">
                          <p className="text-xl font-bold leading-7 text-gray-500">
                            {paymentLedgerRows?.withDOSAmount
                              ? currencyFormatter.format(
                                  paymentLedgerRows?.withDOSAmount
                                )
                              : '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="inline-flex w-56 items-start justify-start rounded-md border border-gray-300 bg-white p-4 shadow">
                    <div className="inline-flex flex-1 flex-col items-start justify-start space-y-1">
                      <p className="w-full text-base leading-normal text-gray-500">
                        Without DoS
                      </p>
                      <div className="inline-flex w-full items-end justify-start">
                        <div className="flex flex-1 items-end justify-start space-x-2">
                          <p className="text-xl font-bold leading-7 text-gray-500">
                            {paymentLedgerRows?.withoutDOSAmount
                              ? currencyFormatter.format(
                                  paymentLedgerRows?.withoutDOSAmount
                                )
                              : '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="inline-flex w-56 items-start justify-start rounded-md border border-gray-300 bg-white p-4 shadow">
                    <div className="inline-flex flex-1 flex-col items-start justify-start space-y-1">
                      <p className="w-full text-base leading-normal text-gray-500">
                        Total Advance Pay, Bal.
                      </p>
                      <div className="inline-flex w-full items-end justify-start">
                        <div className="flex flex-1 items-end justify-start space-x-2">
                          <p className="text-xl font-bold leading-7 text-gray-500">
                            {paymentLedgerRows?.totalBalance
                              ? currencyFormatter.format(
                                  paymentLedgerRows?.totalBalance
                                )
                              : '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-[40px] pb-[16px] text-xl font-bold text-gray-500">
                  Advanced Payments History Ledger
                </div>
                <div style={{ height: '100%', width: '100%' }}>
                  <SearchDetailGrid
                    checkboxSelection={false}
                    hideHeader={true}
                    hideFooter={true}
                    columns={paymentHistoryCols}
                    pinnedColumns={{
                      right: ['action'],
                    }}
                    rows={
                      paymentLedgerRows?.patientAdvancePayments.map((row) => {
                        return {
                          ...row,
                          id: row.paymentLedgerID,
                        };
                      }) || []
                    }
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Modal
        open={postingDateModel}
        onClose={() => {}}
        modalContentClassName="rounded-lg bg-gray-100  text-left shadow-xl  h-[200px] w-[300px] "
      >
        <div className="mx-[27px] flex h-[60px] items-center justify-between gap-4">
          <div className="h-[28px] w-full">
            <SectionHeading label="Add Posting date" isCollapsable={false} />
            <div className=" flex items-center justify-end gap-5">
              <CloseButton
                onClick={() => {
                  setPostingDate('');
                  setPostingDateModel(false);
                }}
              />
            </div>
          </div>
        </div>
        <div className="  bg-gray-100">
          <div className={`px-[27px] relative w-[280px] h-[60px] flex gap-2`}>
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
                      setPostingDate(as);
                    }
                  }}
                  selected={postingDate}
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
                      onClick={async () => {
                        const dateRes = await fetchPostingDate(
                          postingDateCriteria
                        );
                        if (dateRes && dateRes.postingCheck === false) {
                          setStatusModalState({
                            ...statusModalState,
                            open: true,
                            heading: 'Error',
                            statusModalType: StatusModalType.ERROR,
                            description: dateRes.message,
                          });
                          return;
                        }
                        getReversepaymentResponse();
                        setPostingDate('');
                        setPostingDateModel(false);
                        getPatientLedgerData();
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
      <Modal
        open={showRefundPaymentModal}
        onClose={() => {
          setShowRefundPaymentModal(false);
        }}
        modalContentClassName="bg-gray-100 relative rounded-lg  text-left shadow-xl transition-all w-[560px] "
      >
        <div className="mx-[27px] flex h-[60px] items-center justify-between gap-4">
          <div className="h-[28px] w-full">
            <SectionHeading
              label={`Refund Payment (Balance: $${refundRemainingBalance})`}
              isCollapsable={false}
            />
            <div className=" flex items-center justify-end gap-5">
              <CloseButton
                onClick={() => {
                  setShowRefundPaymentModal(false);
                }}
              />
            </div>
          </div>
        </div>
        <div className="mt-[25px] w-full bg-gray-100">
          <div className={`px-[27px] relative w-full h-[62px] flex gap-4`}>
            <div className={`w-full`}>
              <label className="text-sm font-medium leading-5 text-gray-900">
                Posting Date <span className="text-cyan-500">*</span>
              </label>
              <div className="relative top-[4px] w-full">
                <AppDatePicker
                  placeholderText="mm/dd/yyyy"
                  cls=""
                  onChange={(date) => {
                    setRefundPaymentData({
                      ...refundPaymentData,
                      postingDate: date,
                    });
                  }}
                  selected={refundPaymentData.postingDate}
                />
              </div>
            </div>
            <div className={`w-full`}>
              <label className="text-sm font-medium leading-5 text-gray-900">
                Refund Amount <span className="text-cyan-500">*</span>
              </label>
              <div className="w-full">
                <InputFieldAmount
                  placeholder="0.00"
                  showCurrencyName={false}
                  value={refundPaymentData.amount}
                  onChange={(evt) => {
                    const value = evt.target.value
                      ? Number(evt.target.value)
                      : 0;
                    setRefundPaymentData({
                      ...refundPaymentData,
                      amount: value,
                    });
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="pt-[48px]">
          <div className={`h-full bg-gray-200`}>
            <div className="w-full">
              <div className="h-px w-full bg-gray-300" />
            </div>
            <div className="py-[24px] pr-[27px]">
              <div className={`gap-4 flex justify-end `}>
                <div>
                  <Button
                    buttonType={ButtonType.secondary}
                    cls={`w-[102px] `}
                    onClick={() => {
                      setShowRefundPaymentModal(false);
                    }}
                  >
                    {' '}
                    Cancel
                  </Button>
                </div>
                <div>
                  <Button
                    buttonType={ButtonType.primary}
                    onClick={() => {
                      if (
                        !refundPaymentData.postingDate ||
                        !refundPaymentData.amount
                      ) {
                        setStatusModalState({
                          ...statusModalState,
                          open: true,
                          heading: 'Alert',
                          statusModalType: StatusModalType.WARNING,
                          description:
                            'This action cannot be completed until all the required fields (*) are filled in. Please review the fields and try again.',
                        });
                        return;
                      }
                      if ((refundPaymentData.amount || 0) <= 0) {
                        setStatusModalState({
                          ...statusModalState,
                          open: true,
                          heading: 'Alert',
                          statusModalType: StatusModalType.WARNING,
                          description:
                            'Refund Amount must be greater than zero.',
                        });
                        return;
                      }
                      if (
                        (refundPaymentData.amount || 0) >
                        (refundRemainingBalance
                          ? Number(refundRemainingBalance)
                          : 0)
                      ) {
                        setStatusModalState({
                          ...statusModalState,
                          open: true,
                          heading: 'Alert',
                          statusModalType: StatusModalType.WARNING,
                          description:
                            'Refund Amount must be less than or equal to Available Balance.',
                        });
                        return;
                      }
                      setStatusModalState({
                        ...statusModalState,
                        open: true,
                        heading: 'Refund Payment',
                        description: 'Are you sure to Post Refund?',
                        okButtonText: 'Yes',
                        closeButtonText: 'No',
                        statusModalType: StatusModalType.WARNING,
                        showCloseButton: true,
                        closeOnClickOutside: false,
                      });
                    }}
                  >
                    {' '}
                    Post Refund
                  </Button>
                </div>
              </div>
              <div></div>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        open={isEditDos}
        onClose={() => {
          setIsEditDos(false);
        }}
        modalContentClassName="bg-gray-100 relative overflow-hidden rounded-lg  text-left shadow-xl transition-all w-[960px] h-[352px] "
      >
        <div>
          <div>
            <div className="mx-[27px] flex h-[60px] items-center justify-between gap-4">
              <div className="h-[28px] w-full">
                <SectionHeading
                  label="Edit Advanced Payment DoS"
                  isCollapsable={false}
                />
                <div className=" flex items-center justify-end gap-5">
                  <CloseButton
                    onClick={() => {
                      setIsEditDos(false);
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-row ">
              <div className=" mt-[36px] bg-gray-100">
                <div className="m-0 ml-[24px] text-xl font-bold text-gray-800 sm:text-xl">
                  Current DoS
                </div>
                <div
                  className={`px-[27px] relative w-[280px] h-[62px] flex gap-2`}
                >
                  <div className={`w-full items-start self-stretch`}>
                    <label className="text-sm font-medium leading-5 text-gray-900">
                      DoS - From
                    </label>
                    <div className="w-[144px]">
                      <AppDatePicker
                        placeholderText="mm/dd/yyyy"
                        cls=""
                        disabled={true}
                        onChange={(date) => {
                          if (date) {
                            const as = DateToStringPipe(date, 1);
                            setDosLedger(as);
                          }
                        }}
                        selected={dosLedger}
                      />
                    </div>
                  </div>
                  <div className={`w-full items-start self-stretch`}>
                    <label className="text-sm font-medium leading-5 text-gray-900">
                      DoS - To
                    </label>
                    <div className="w-[144px]">
                      <AppDatePicker
                        placeholderText="mm/dd/yyyy"
                        cls=""
                        disabled={true}
                        onChange={(date) => {
                          if (date) {
                            const as = DateToStringPipe(date, 1);
                            setDosLedger(as);
                          }
                        }}
                        selected={dosLedger}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="ml-[55px] mt-[98px]">
                <Icon name={'arrow'} size={20} />
              </div>
              <div className="mt-[36px] bg-gray-100">
                <div className="m-0 ml-[16px] text-xl font-bold text-gray-800 sm:text-xl">
                  New DoS
                </div>
                <div className="flex flex-col">
                  <div
                    className={`px-[16px] relative w-[280px] h-[62px] flex gap-2`}
                  >
                    <div className={`w-full items-start self-stretch`}>
                      <label className="text-sm font-medium leading-5 text-gray-900">
                        DoS - From
                      </label>
                      <div className="w-[144px]">
                        <AppDatePicker
                          testId="newDos"
                          placeholderText="mm/dd/yyyy"
                          cls=""
                          onChange={(date) => {
                            if (date) {
                              setDosData({
                                ...DosData,
                                dos: DateToStringPipe(date, 1),
                              });
                            }
                          }}
                          selected={StringToDatePipe(DosData.dos)}
                        />
                      </div>
                    </div>
                    <div className={`w-full items-start self-stretch`}>
                      <label className="text-sm font-medium leading-5 text-gray-900">
                        DoS - To
                      </label>
                      <div className="w-[144px]">
                        <AppDatePicker
                          placeholderText="mm/dd/yyyy"
                          cls=""
                          onChange={(date) => {
                            if (date) {
                              setDosData({
                                ...DosData,
                                dos: DateToStringPipe(date, 1),
                              });
                            }
                          }}
                          selected={StringToDatePipe(DosData.dos)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="ml-[16px] mt-[8px] flex h-5 items-center">
                    <input
                      data-testid="rem-id"
                      type="checkbox"
                      id="67"
                      className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                    />
                    <div className="ml-3 text-sm">
                      <label htmlFor="67" className="font-medium text-gray-700">
                        Leave DoS blank for this Advanced Payment
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-[48px]">
            <div className={`h-full bg-gray-200`}>
              <div className="w-full">
                <div className="h-px w-full bg-gray-300" />
              </div>
              <div className="py-[24px] pr-[27px]">
                <div className={`gap-4 flex justify-end `}>
                  <div>
                    <Button
                      buttonType={ButtonType.secondary}
                      cls={`w-[102px] `}
                      onClick={() => {
                        setIsEditDos(false);
                      }}
                    >
                      {' '}
                      Cancel
                    </Button>
                  </div>
                  <div>
                    <Button
                      buttonType={ButtonType.primary}
                      onClick={() => {
                        onApplyNewDos();
                      }}
                    >
                      {' '}
                      Apply New DoS
                    </Button>
                  </div>
                </div>
                <div></div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
