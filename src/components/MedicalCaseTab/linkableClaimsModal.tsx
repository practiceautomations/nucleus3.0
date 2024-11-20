import type { GridColDef } from '@mui/x-data-grid-pro';
import { GRID_CHECKBOX_SELECTION_COL_DEF } from '@mui/x-data-grid-pro';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { addToastNotification } from '@/store/shared/actions';
import {
  getLinkableClaimsForMedicalCase,
  linkMedicalCaseWithClaims,
} from '@/store/shared/sagas';
import type {
  GetLinkableClaimsForMedicalCaseCriteria,
  GetLinkableClaimsForMedicalCaseResult,
} from '@/store/shared/types';
import { ToastType } from '@/store/shared/types';

import Button, { ButtonType } from '../UI/Button';
import CheckBox from '../UI/CheckBox';
import CloseButton from '../UI/CloseButton';
import Modal from '../UI/Modal';
import SearchDetailGrid from '../UI/SearchDetailGrid';
import StatusModal, { StatusModalType } from '../UI/StatusModal';

export interface LinkableClaimModalProps {
  open: boolean;
  criteria: GetLinkableClaimsForMedicalCaseCriteria;
  onClose: () => void;
}
export default function LinkableClaimModal({
  open = false,
  criteria,
  onClose,
}: LinkableClaimModalProps) {
  const dispatch = useDispatch();
  const [totalCount, setTotalCount] = useState<number>(0);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [showWarningModal, setWarningModal] = useState(false);

  const [searchResult, setSearchResult] = useState<
    GetLinkableClaimsForMedicalCaseResult[]
  >([]);

  const onSelectAll = async () => {
    if (searchResult.length === 0) {
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: 'No data to select!',
          toastType: ToastType.ERROR,
        })
      );
      return;
    }
    // else{
    if (selectedRows.length === totalCount) {
      setSelectedRows([]);
      return;
    }
    setSelectedRows(searchResult.map((m) => m.claimID));
    // }
  };

  const columnsData: GridColDef[] = [
    {
      ...GRID_CHECKBOX_SELECTION_COL_DEF,
      flex: 1,
      minWidth: 80,
      renderHeader: () => {
        return (
          <CheckBox
            id="AllCheckbox"
            checked={
              !!searchResult.length && selectedRows.length === totalCount
            }
            onChange={onSelectAll}
            disabled={false}
          />
        );
      },
    },
    {
      field: 'claimID',
      headerName: 'Claim ID',
      flex: 1,
      minWidth: 120,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-cyan-500 underline"
              onClick={() => {
                window.open(`/app/claim-detail/${params.value}`);
              }}
            >
              #{params.value}
            </div>
          </div>
        );
      },
    },
    {
      field: 'dos',
      headerName: 'DoS',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'patientID',
      headerName: 'Patient ID',
      flex: 1,
      minWidth: 120,
      disableReorder: true,
      // renderCell: (params) => {
      //   return (
      //     <div className="flex flex-col">
      //       <div
      //         className="cursor-pointer text-cyan-500 underline"
      //         onClick={() => {
      //           // window.open(`/app/register-patient/${params.value}`);
      //           dispatch(
      //             setGlobalModal({
      //               type: 'Patient Detail',
      //               id: params.value,
      //               isPopup: true,
      //             })
      //           );
      //         }}
      //       >
      //         #{params.value}
      //       </div>
      //     </div>
      //   );
      // },
    },
    {
      field: 'patient',
      headerName: 'Patient',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'facility',
      headerName: 'Facility',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="cursor-pointer text-cyan-500" onClick={() => {}}>
              {params.value}
            </div>
            <div className="text-xs font-normal leading-4">
              {params.row.facilityAddress}
            </div>
          </div>
        );
      },
    },
    {
      field: 'insurance',
      headerName: 'Insurance',
      flex: 1,
      minWidth: 190,
      disableReorder: true,
    },
    {
      field: 'claimStatus',
      headerName: 'Claim Status',
      flex: 1,
      minWidth: 190,
      disableReorder: true,
    },
    {
      field: 'parentClaimID',
      headerName: 'Parent Claim ID',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
    {
      field: 'claimCreatedOn',
      headerName: 'Created On',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'claimCreatedBy',
      headerName: 'Created By',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
    },
  ];

  const getLinkableClaimsData = async () => {
    const res = await getLinkableClaimsForMedicalCase(criteria);
    if (res) {
      setSearchResult(res);
      setSelectedRows([]);
      setTotalCount(res.length || 0);
    }
  };
  useEffect(() => {
    if (criteria) {
      getLinkableClaimsData();
    }
  }, [criteria]);
  const linkClaims = async () => {
    const res = await linkMedicalCaseWithClaims(
      selectedRows.join(','),
      criteria.medicalCaseID
    );
    if (res) {
      setWarningModal(false);
      getLinkableClaimsData();
      dispatch(
        addToastNotification({
          id: uuidv4(),
          text: `Linked Medical Case With ${
            selectedRows.length > 1 ? 'Claims: ' : 'Claim: '
          } ${selectedRows.join(',')}`,
          toastType: ToastType.SUCCESS,
        })
      );
    }
  };
  return (
    <Modal
      open={open}
      onClose={() => {
        onClose();
        setSelectedRows([]);
        setSearchResult([]);
      }}
      modalContentClassName="relative bg-gray-100 h-[calc(100%-80px)] w-[calc(100%-350px)] overflow-y-auto rounded-lg bg-white shadow-xl transition-all sm:my-8 w-full"
    >
      <div className="flex flex-col bg-gray-100">
        <div className="mt-3 max-w-full p-4">
          <div className="flex flex-row justify-between">
            <div>
              <h1 className=" ml-2  text-left text-xl font-bold leading-7 text-gray-700">
                Linkable Claim For Medical Case # {criteria.medicalCaseID}
              </h1>
            </div>
            <div className="">
              <CloseButton
                onClick={() => {
                  onClose();
                  setSelectedRows([]);
                  setSearchResult([]);
                }}
              />
            </div>
          </div>
          <div className="mt-3 h-px w-full bg-gray-300" />
        </div>
        <div className="flex flex-col">
          <div className="w-full flex-1 overflow-y-auto bg-gray-100">
            <div className="flex">
              <div className="no-scrollbar !h-[603px] w-full overflow-y-auto p-4">
                <SearchDetailGrid
                  hideHeader={true}
                  hideFooter={true}
                  totalCount={searchResult?.length}
                  rows={
                    searchResult?.map((row) => {
                      return { ...row, id: row.claimID };
                    }) || []
                  }
                  columns={columnsData}
                  checkboxSelection={true}
                  selectRows={selectedRows}
                  onSelectRow={(ids: number[]) => {
                    setSelectedRows(ids);
                  }}
                  // paginationMode={'client'}
                  pinnedColumns={{
                    right: ['action'],
                  }}
                  setHeaderRadiusCSS={true}
                />
              </div>
            </div>
          </div>
        </div>
        <div className={`h-[86px] bg-gray-200 w-full absolute bottom-0 z-[1]`}>
          <div className="flex flex-row-reverse gap-4 p-6 ">
            <div>
              <Button
                buttonType={ButtonType.primary}
                disabled={!selectedRows.length}
                onClick={async () => {
                  setWarningModal(true);
                }}
              >
                {`Link (${selectedRows.length}) Selected  ${
                  selectedRows.length > 1 ? 'Claims' : 'Claim'
                }`}
              </Button>
            </div>
            <div>
              <Button
                buttonType={ButtonType.secondary}
                cls={`w-[102px]`}
                onClick={() => {
                  onClose();
                  setSelectedRows([]);
                  setSearchResult([]);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
        <StatusModal
          open={showWarningModal}
          heading={'Link Claim with Medical Case Confirmation'}
          description={`This action will cause the selected claims to be linked with Medical Case ${
            criteria.medicalCaseID
          }. Are you sure you want to proceed with linking ${
            selectedRows.length > 1 ? 'Claims: ' : 'Claim: '
          } ${selectedRows.join(',')}?`}
          okButtonText={'Yes, Link'}
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
              linkClaims();
            }
          }}
        />
      </div>
    </Modal>
  );
}
