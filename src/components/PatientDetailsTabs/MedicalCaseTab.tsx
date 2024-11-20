import type { GridColDef } from '@mui/x-data-grid-pro';
import { useEffect, useState } from 'react';

import {
  deleteMedicalCase,
  getPatientMedicalCases,
} from '@/store/shared/sagas';
import type {
  GetLinkableClaimsForMedicalCaseCriteria,
  GetPatientRequestData,
  PatientMedicalCaseResults,
} from '@/store/shared/types';

import Icon from '../Icon';
// eslint-disable-next-line import/no-cycle
import MedicalCase from '../MedicalCases';
import LinkableClaimModal from '../MedicalCaseTab/linkableClaimsModal';
import Tabs from '../OrganizationSelector/Tabs';
import Button, { ButtonType } from '../UI/Button';
import Modal from '../UI/Modal';
import SearchDetailGrid from '../UI/SearchDetailGrid';
import type { StatusModalProps } from '../UI/StatusModal';
import StatusModal, { StatusModalType } from '../UI/StatusModal';

export interface MedicalCaseTabProps {
  patientID: number | null;
  selectedPatientData: GetPatientRequestData;
}

export default function MedicalCaseTab({
  patientID,
  selectedPatientData,
}: MedicalCaseTabProps) {
  const [linkableClaimsModalData, setLinkableClaimsModal] = useState<{
    open: boolean;
    criteria: GetLinkableClaimsForMedicalCaseCriteria;
  }>({
    open: false,
    criteria: {
      patientID: undefined,
      facilityID: undefined,
      patientInsuranceID: undefined,
      medicalCaseID: undefined,
    },
  });
  const [medicalCaseRowData, setMedicalCaseRowData] = useState<
    PatientMedicalCaseResults[]
  >([]);
  const [medicalCaseTabs, setMedicalCaseTabs] = useState<
    {
      id: number;
      name: string;
      count: number;
    }[]
  >([
    {
      id: 0,
      name: 'Open',
      count: 0,
    },
  ]);
  const getPatientMedicalCaseData = async () => {
    if (patientID) {
      const res = await getPatientMedicalCases(patientID);
      if (res) {
        setMedicalCaseRowData(res.patientMedicalCases);
        const mappedTabs = res.summary.map((summary, index) => ({
          id: index, // Assuming Open has id 1 and Closed has id 2
          name: summary.caseStatus,
          count: summary.counts,
        }));
        // Set the state with the mappedTabs data
        setMedicalCaseTabs(mappedTabs);
      }
    }
  };
  const onDeleteMedicalCaseColumn = async (medicalCaseID: number) => {
    const res = await deleteMedicalCase(medicalCaseID);
    if (res) {
      getPatientMedicalCaseData();
    }
  };
  const [isMedicalCaseModalOpen, setMedicalCaseModalOpen] = useState(false);
  const [isViewMedicalCaseMode, setIsViewMedicalCaseMode] = useState(false);
  const [selectedMedicalCaseID, setSelectedMedicalCaseID] = useState<
    number | null
  >(null);
  const [statusModalState, setStatusModalState] = useState<StatusModalProps>({
    open: false,
    heading: '',
    description: '',
    okButtonText: 'Ok',
    statusModalType: StatusModalType.ERROR,
    showCloseButton: false,
    closeOnClickOutside: false,
  });
  const [deleteMedicalCaseData, setDeleteMedicalCaseData] = useState<{
    isDelete: boolean;
    medicalCaseID?: number;
  }>({
    isDelete: true,
  });
  const MedicalCaseColumns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'Case ID',
      flex: 1,
      minWidth: 170,
      disableReorder: true,
    },
    {
      field: 'title',
      headerName: 'Title',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-cyan-500"
            onClick={() => {
              setSelectedMedicalCaseID(params.row.id);
              setIsViewMedicalCaseMode(true);
              setMedicalCaseModalOpen(true);
            }}
          >
            {params.value}
          </div>
        );
      },
    },
    {
      field: 'facility',
      headerName: 'Facility',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'insurance',
      headerName: 'Insurance',
      flex: 1,
      minWidth: 180,
      disableReorder: true,
    },
    {
      field: 'attendingProvider',
      headerName: 'Attending Provider',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'operatingProvider',
      headerName: 'Operating Provider',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'admissionDate',
      headerName: 'Admission Date',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'dischargeDate',
      headerName: 'Discharge Date',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'dischargeStatus',
      headerName: 'Discharge Status',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'caseStatus',
      headerName: 'Case Status',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'createdOn',
      headerName: 'Created On',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'createdBy',
      headerName: 'Created By',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 255,
      hideSortIcons: true,
      disableReorder: true,
      cellClassName: '!bg-cyan-50 PinnedColumLeftBorder',
      headerClassName: '!bg-cyan-100 !text-center PinnedColumLeftBorder',
      renderCell: (params) => {
        return (
          <div className="flex gap-2">
            <Button
              buttonType={ButtonType.secondary}
              // fullWidth={true}
              cls={' h-[30px] inline-flex px-2 py-2  !justify-center'}
              style={{ verticalAlign: 'middle' }}
              onClick={() => {
                setSelectedMedicalCaseID(params.row.id);
                setIsViewMedicalCaseMode(true);
                setMedicalCaseModalOpen(true);
              }}
            >
              <Icon name={'pencil'} size={16} />
            </Button>
            {/* <div className="ml-2 flex gap-x-2"> */}
            <Button
              // fullWidth={true}
              buttonType={ButtonType.secondary}
              style={{ verticalAlign: 'middle' }}
              cls={`h-[30px] inline-flex px-2 py-2 !justify-center`}
              onClick={() => {
                setDeleteMedicalCaseData({
                  isDelete: true,
                  medicalCaseID: params.row.id,
                });
                setStatusModalState({
                  ...statusModalState,
                  open: true,
                  heading: 'Delete Medical Confirmation',
                  okButtonText: 'Yes, Delete Case',
                  okButtonColor: ButtonType.tertiary,
                  description:
                    'Deleting a Medical Case will permanently remove it from the system. Are you sure you want to proceed with this action?',
                  closeButtonText: 'Cancle',
                  statusModalType: StatusModalType.WARNING,
                  showCloseButton: true,
                  closeOnClickOutside: false,
                });
              }}
            >
              <Icon name={'trash'} size={18} />
            </Button>
            {/* </div> */}
            <Button
              buttonType={
                params.row.caseStatus === 'Open'
                  ? ButtonType.primary
                  : ButtonType.secondary
              }
              cls={
                params.row.caseStatus === 'Open'
                  ? `!h-[30px] inline-flex px-4 py-2 gap-2 leading-5 bg-cyan-500`
                  : `!h-[30px] inline-flex px-4 py-2 gap-2 leading-5 bg-gray-100`
              }
              onClick={() => {
                const criteria: GetLinkableClaimsForMedicalCaseCriteria = {
                  patientID: patientID || undefined,
                  facilityID: params.row.facilityID,
                  patientInsuranceID: params.row.patientInsuranceID,
                  medicalCaseID: params.row.id,
                };
                // const res = await getLinkableClaimsForMedicalCase(criteria);
                setLinkableClaimsModal({
                  open: true,
                  criteria,
                });
              }}
            >
              <Icon name={'link'} size={18} />
              <p className="mt-[2px] self-center text-xs font-medium leading-4">
                Link Claim
              </p>
            </Button>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    getPatientMedicalCaseData();
  }, []);
  const [selectedMedicalCaseTab, setSelectedMedicalCaseTab] = useState(
    medicalCaseTabs[0]
  );
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
          if (
            deleteMedicalCaseData.isDelete &&
            deleteMedicalCaseData.medicalCaseID
          ) {
            onDeleteMedicalCaseColumn(deleteMedicalCaseData.medicalCaseID);
          }
        }}
      />
      <div className="w-full bg-gray-100 text-gray-700">
        <div className="inline-flex w-full flex-col items-start justify-end space-y-6">
          <div className="inline-flex w-full items-center justify-start">
            <div className="inline-flex w-full">
              <div className="text-xl font-bold leading-5 text-gray-700">
                <div className="mr-[24px] inline-flex">
                  <div className="mt-[50px] flex items-center">
                    Medical Case
                  </div>
                </div>
                <Button
                  buttonType={ButtonType.primary}
                  fullWidth={true}
                  cls={`w-[159px] h-[38px] inline-flex !justify-center leading-loose`}
                  style={{ verticalAlign: 'middle' }}
                  onClick={() => {
                    setMedicalCaseModalOpen(true);
                    setIsViewMedicalCaseMode(false);
                    // setSelectedInsuranceGridRow(undefined);
                  }}
                >
                  <p className="text-justify text-sm">Add New Case</p>
                </Button>

                <Modal
                  open={isMedicalCaseModalOpen}
                  onClose={() => {}}
                  modalContentClassName="h-[calc(100%-80px)] w-[calc(100%-220px)] relative rounded-lg bg-white shadow-xl transition-all sm:my-8"
                >
                  <MedicalCase
                    onClose={() => {
                      setMedicalCaseModalOpen(false);
                      getPatientMedicalCaseData();
                    }}
                    selectedPatientID={patientID}
                    groupID={selectedPatientData.groupID}
                    isViewMode={isViewMedicalCaseMode}
                    medicalCaseID={selectedMedicalCaseID}
                  />
                </Modal>
              </div>
            </div>
          </div>
          <div className="relative w-full text-sm leading-tight text-gray-500">
            {!medicalCaseRowData.length ? (
              <div className="h-[40px] w-[372px]">
                {`There are no insurance policies for this patient yet. To add an insurance policy, click the "Add New Insurance" button.`}
              </div>
            ) : (
              <>
                <div className="">
                  {medicalCaseTabs.length && (
                    <Tabs
                      tabs={medicalCaseTabs}
                      onChangeTab={(tab: any) => {
                        setSelectedMedicalCaseTab(tab);
                      }}
                      currentTab={selectedMedicalCaseTab}
                    />
                  )}
                </div>
                <div
                  className="pt-[24px] "
                  style={{ height: '100%', width: '100%' }}
                >
                  <SearchDetailGrid
                    checkboxSelection={false}
                    hideHeader={true}
                    hideFooter={true}
                    persistLayoutId={38}
                    columns={MedicalCaseColumns}
                    rows={
                      selectedMedicalCaseTab?.id === 0
                        ? medicalCaseRowData
                            .filter((m) => m.caseStatusCode === 'O')
                            ?.map((row) => {
                              return {
                                ...row,
                                id: row.medicalCaseID,
                              };
                            }) || []
                        : medicalCaseRowData
                            .filter((m) => m.caseStatusCode === 'C')
                            ?.map((row) => {
                              return {
                                ...row,
                                id: row.medicalCaseID,
                              };
                            }) || []
                    }
                    setHeaderRadiusCSS={true}
                    pinnedColumns={{
                      right: ['actions'],
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <LinkableClaimModal
        open={linkableClaimsModalData.open}
        criteria={linkableClaimsModalData.criteria}
        onClose={() => {
          setLinkableClaimsModal({
            open: false,
            criteria: {
              patientID: undefined,
              facilityID: undefined,
              patientInsuranceID: undefined,
              medicalCaseID: undefined,
            },
          });
        }}
      />
    </>
  );
}
