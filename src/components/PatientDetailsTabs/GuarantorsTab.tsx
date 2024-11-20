import type { GridColDef } from '@mui/x-data-grid-pro';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { addToastNotification } from '@/store/shared/actions';
import {
  deleteGuarantor,
  getPatientGaiurantorTabData,
} from '@/store/shared/sagas';
import type { DeleteGuarantorResponse } from '@/store/shared/types';
import {
  type GetPatientRequestData,
  type PatientGuarantorTabData,
  ToastType,
} from '@/store/shared/types';
import { IconColors } from '@/utils/ColorFilters';

import Icon from '../Icon';
import PatientGarantor from '../PatientTabs/guarantor';
import Button, { ButtonType } from '../UI/Button';
import Modal from '../UI/Modal';
import SearchDetailGrid from '../UI/SearchDetailGrid';
import type { StatusModalProps } from '../UI/StatusModal';
import StatusModal, { StatusModalType } from '../UI/StatusModal';

export interface PatientGuarantorTabProps {
  patientID: number | null;
  selectedPatientData: GetPatientRequestData;
}

export default function PatientGuarantorTab({
  patientID,
  selectedPatientData,
}: PatientGuarantorTabProps) {
  const dispatch = useDispatch();
  const [isViewGaurMode, setIsViewGaurMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteGaur, setIsDeleteGaur] = useState<boolean>(false);
  const [selectedRowId, setSelectedRowId] = useState<number>(0);
  const [statusModalState, setStatusModalState] = useState<StatusModalProps>({
    open: false,
    heading: '',
    description: '',
    okButtonText: 'Ok',
    statusModalType: StatusModalType.ERROR,
    showCloseButton: false,
    closeOnClickOutside: false,
  });
  const [gaurSubscriberData, setGaurSubscriberData] =
    useState<GetPatientRequestData | null>(null);
  const [selectedGaurGridRow, setSelectedGaurGridRow] =
    useState<PatientGuarantorTabData>();
  const [guarantorsGridRows, setGuarantorsGridRows] = useState<
    PatientGuarantorTabData[]
  >([]);
  const [isGuarantorsModalOpen, setIsGuarantorsModalOpen] = useState(false);
  const onDeleteGuarantor = async (GuarantorID: number) => {
    let res: DeleteGuarantorResponse | null = null;
    if (GuarantorID) {
      res = await deleteGuarantor(GuarantorID);
      if (res && res.id === 1) {
        dispatch(
          addToastNotification({
            id: uuidv4(),
            text: res.message,
            toastType: ToastType.SUCCESS,
          })
        );
      } else {
        dispatch(
          addToastNotification({
            id: uuidv4(),
            text: 'Failed to Delete Patient Guarantor.',
            toastType: ToastType.ERROR,
          })
        );
      }
    } else {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'Invalid Guarantor ID.',
          toastType: ToastType.ERROR,
        })
      );
    }
  };
  const getPatientgaurantorData = async () => {
    const res = await getPatientGaiurantorTabData(patientID);
    if (res) {
      setGuarantorsGridRows(res);
    }
  };
  useEffect(() => {
    getPatientgaurantorData();
  }, []);

  const onDeleteGaurRow = async (params: number) => {
    onDeleteGuarantor(params);
    await getPatientgaurantorData();
  };
  const guarantorsCols: GridColDef[] = [
    {
      field: 'lastName',
      headerName: 'Guar. Last Name',
      flex: 1,
      maxWidth: 170,
      disableReorder: true,
      sortable: false,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-cyan-500"
            onClick={() => {
              setSelectedGaurGridRow(params.row);
              setIsViewGaurMode(false);
              setIsGuarantorsModalOpen(true);
              setIsEditMode(true);
            }}
          >
            {params.value}
          </div>
        );
      },
    },
    {
      field: 'firstName',
      headerName: 'Guar. First Name',
      flex: 1,
      maxWidth: 150,
      disableReorder: true,
      sortable: false,
    },
    {
      field: 'relation',
      headerName: 'Relation',
      flex: 1,
      maxWidth: 114,
      disableReorder: true,
      sortable: false,
      renderCell: (params) => {
        if (params.value === null) {
          return '-';
        }
        return params.value;
      },
    },
    {
      field: 'address1',
      headerName: 'Address',
      flex: 1,
      maxWidth: 224,
      disableReorder: true,
      sortable: false,
      renderCell: (params) => {
        if (params.value === null) {
          return '-';
        }
        return params.value;
      },
    },
    {
      field: 'city',
      headerName: 'City',
      flex: 1,
      maxWidth: 186,
      disableReorder: true,
      sortable: false,
    },
    {
      field: 'state',
      headerName: 'State',
      flex: 1,
      maxWidth: 92,
      disableReorder: true,
      sortable: false,
    },
    {
      field: 'zipCode',
      headerName: 'ZIP Code',
      flex: 1,
      maxWidth: 107,
      disableReorder: true,
      sortable: false,
    },
    {
      field: 'active',
      headerName: 'Active',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return <div>{params.value ? 'Yes' : 'No'}</div>;
      },
    },
    {
      field: '',
      headerName: 'Actions',
      headerClassName: '!bg-cyan-100 !text-center',
      flex: 1,
      minWidth: 180,
      disableReorder: true,
      cellClassName: '!bg-cyan-50',
      renderCell: (params) => {
        return (
          <div>
            <Button
              buttonType={ButtonType.secondary}
              onClick={() => {
                setSelectedGaurGridRow(params.row);
                setIsViewGaurMode(true);
                setIsGuarantorsModalOpen(true);
              }}
              cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 mr-1 inline-flex gap-2 leading-5`}
            >
              <Icon name={'eye'} size={18} color={IconColors.NONE} />
            </Button>
            <Button
              buttonType={ButtonType.secondary}
              onClick={() => {
                const updatedObj: PatientGuarantorTabData = {
                  ...params.row,
                  officePhone: params.row.officePhone?.replace(
                    /(\d{3})(\d{3})(\d{4})/,
                    '$1-$2-$3'
                  ),
                  homephone: params.row.homephone?.replace(
                    /(\d{3})(\d{3})(\d{4})/,
                    '$1-$2-$3'
                  ),
                  cell: params.row.cell?.replace(
                    /(\d{3})(\d{3})(\d{4})/,
                    '$1-$2-$3'
                  ),
                  fax: params.row.fax?.replace(
                    /(\d{3})(\d{3})(\d{4})/,
                    '$1-$2-$3'
                  ),
                };

                setSelectedGaurGridRow(updatedObj);
                setIsViewGaurMode(false);
                setIsEditMode(true);
                setIsGuarantorsModalOpen(true);
              }}
              cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 mr-1 inline-flex gap-2 leading-5`}
            >
              <Icon name={'pencil'} size={18} color={IconColors.GRAY} />
            </Button>
            <Button
              buttonType={ButtonType.secondary}
              cls={`h-[38px] w-[38px] justify-center !px-2 !py-1 inline-flex gap-2 leading-5`}
              onClick={() => {
                setIsDeleteGaur(true);
                setSelectedRowId(params.row?.id);
                setStatusModalState({
                  ...statusModalState,
                  open: true,
                  heading: 'Delete Confirmation',
                  okButtonText: 'Yes',
                  okButtonColor: ButtonType.tertiary,
                  description: `Are you sure you want to delete ${params.row.firstName} ${params.row.lastName}?`,
                  closeButtonText: 'No',
                  statusModalType: StatusModalType.WARNING,
                  showCloseButton: true,
                  closeOnClickOutside: false,
                });
              }}
            >
              <Icon name={'trash'} size={18} />
            </Button>
          </div>
        );
      },
    },
  ];

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

          if (isDeleteGaur) {
            onDeleteGaurRow(selectedRowId);
          }
        }}
      />
      <div className="w-full bg-gray-100 text-gray-700">
        <div className="inline-flex w-full flex-col items-start justify-end space-y-6">
          <div className="inline-flex w-full  items-center justify-start">
            <div className="inline-flex w-full">
              <div className="text-xl font-bold leading-5 text-gray-700">
                <div className="mr-[24px] inline-flex">
                  {' '}
                  Existing Guarantors List
                </div>
                <Button
                  buttonType={ButtonType.primary}
                  fullWidth={true}
                  cls={`w-[170px] h-[38px] inline-flex  mt-[40px] !justify-center`}
                  onClick={() => {
                    setSelectedGaurGridRow(undefined);
                    setIsGuarantorsModalOpen(true);
                  }}
                  data-testid="RegisterPatientGuarantorTabAddBtnTestId"
                >
                  <p className="text-justify text-sm  "> Add New Guarantor</p>
                </Button>
                <Modal
                  open={isGuarantorsModalOpen}
                  onClose={() => {
                    setIsGuarantorsModalOpen(false);
                    setIsViewGaurMode(false);
                    setSelectedGaurGridRow(undefined);
                    setIsEditMode(false);
                    setGaurSubscriberData(null);
                  }}
                  modalContentClassName="bg-gray-100 relative overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all  "
                >
                  <PatientGarantor
                    onClose={() => {
                      setIsGuarantorsModalOpen(false);
                      getPatientgaurantorData();
                      setGaurSubscriberData(null);
                    }}
                    groupID={selectedPatientData.groupID || null}
                    selectedPatientID={patientID}
                    selectedGaurData={selectedGaurGridRow || null}
                    onSelectSelf={(value: boolean) => {
                      if (value === true) {
                        setGaurSubscriberData(selectedPatientData);
                      } else {
                        setGaurSubscriberData(null);
                      }
                    }}
                    gaurSubscriberData={gaurSubscriberData || null}
                    isViewMode={isViewGaurMode}
                    isEditMode={isEditMode}
                  />
                </Modal>
              </div>
            </div>
          </div>
          <div className=" relative  w-full text-sm leading-tight text-gray-500">
            {!guarantorsGridRows.length ? (
              <div className="h-[40px] w-[372px]">
                {' '}
                {`There are no guarantor data for this patient yet. To add a guarantor, click the "Add New Guarantor" button.`}
              </div>
            ) : (
              <div style={{ height: '100%', width: '1200px' }}>
                <SearchDetailGrid
                  checkboxSelection={false}
                  hideHeader={true}
                  hideFooter={true}
                  columns={guarantorsCols}
                  rows={guarantorsGridRows}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
