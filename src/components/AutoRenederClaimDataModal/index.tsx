import type { GridColDef } from '@mui/x-data-grid-pro';
import { useEffect, useState } from 'react';

import { getAutoPopulateClaimsData } from '@/store/shared/sagas';
import type { AutoPopulateClaimsForPatientsDataResult } from '@/store/shared/types';

import Button, { ButtonType } from '../UI/Button';
import CloseButton from '../UI/CloseButton';
import SearchDetailGrid from '../UI/SearchDetailGrid';
import StatusModal, { StatusModalType } from '../UI/StatusModal';
import ToggleButton from '../UI/ToggleButton';

export type CombinedAutoPopulateClaimsType = IncludeValues &
  AutoPopulateClaimsForPatientsDataResult;

type AutoRenderClaimDataModalProps = {
  onClose: () => void;
  patientID: number;
  onSelect: (value: CombinedAutoPopulateClaimsType | null) => void;
};
type IncludeValues = {
  includeProvider: boolean;
  includeRefferingProvider: boolean;
  includeICDs: boolean;
  includeCPTs: boolean;
};
const AutoRenderClaimDataModal = ({
  onClose /* , onSelect */,
  patientID,
  onSelect,
}: AutoRenderClaimDataModalProps) => {
  const [statusModalInfo, setStatusModalInfo] = useState({
    show: false,
    heading: '',
    text: '',
    type: StatusModalType.WARNING,
  });
  const [dataResut, setDataResult] = useState<CombinedAutoPopulateClaimsType[]>(
    []
  );
  const getClaimData = async () => {
    const res = await getAutoPopulateClaimsData(patientID);
    if (res) {
      const updatedRes = res.map((item) => ({
        ...item,
        includeProvider: false,
        includeRefferingProvider: false,
        includeICDs: false,
        includeCPTs: false,
      }));
      setDataResult(updatedRes);
    }
  };
  useEffect(() => {
    if (patientID) {
      getClaimData();
    }
  }, [patientID]);

  // const [includeValues, setIncludeValues] = useState<{
  //   id: number | null;
  //   includeProvider: boolean;
  //   includeRefferingProvider: boolean;
  //   includeICDs: boolean;
  //   includeCPTs: boolean;
  // }>({
  //   id: null,
  //   includeProvider: false,
  //   includeRefferingProvider: false,
  //   includeICDs: false,
  //   includeCPTs: false,
  // });
  const handleToggleChange = (
    id: number,
    field: keyof IncludeValues,
    value: boolean
  ) => {
    setDataResult((prevState) =>
      prevState.map((item) =>
        item.claimID === id ? { ...item, [field]: value } : item
      )
    );
  };
  const columns: GridColDef[] = [
    {
      field: 'claimID',
      headerName: 'Claim ID',
      flex: 1,
      minWidth: 90,
      disableReorder: true,
      hideSortIcons: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div
              className="cursor-pointer text-sm font-normal leading-5"
              onClick={async () => {}}
            >
              #{params.value}
              {/* {`ClaimID: #${params.value} - Referring Provider NPI:${
                params.row.referringProviderNPI
              } - ICDs: ${
                params.row.diagnosis1 ? params.row.diagnosis1 : ''
              }, ${params.row.diagnosis2 ? params.row.diagnosis2 : ''}, ${
                params.row.diagnosis3 ? params.row.diagnosis3 : ''
              } `} */}
            </div>
          </div>
        );
      },
    },
    {
      field: 'fromDOS',
      headerName: 'DoS',
      flex: 1,
      minWidth: 130,
      hideSortIcons: true,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div>
            {params.row.toDOS !== null ? (
              <> {`${params.row.fromDOS} - ${params.row.toDOS}`} </>
            ) : (
              <>{params.row.fromDOS}</>
            )}
          </div>
        );
      },
    },
    {
      field: 'provider',
      headerName: 'Provider',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      hideSortIcons: true,
    },
    {
      field: 'referringProvider',
      headerName: 'Ref. Provider',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      hideSortIcons: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="cursor-pointer text-cyan-500" onClick={() => {}}>
              {params.value}
            </div>
            <div className="text-xs font-normal leading-4">
              {params.row.referringProviderNPI
                ? `NPI: ${params.row.referringProviderNPI}`
                : ''}
            </div>
          </div>
        );
      },
    },
    {
      field: 'icds',
      headerName: 'ICDs',
      hideSortIcons: true,
      disableReorder: true,
      flex: 1,
      minWidth: 150,
      // renderCell: () => {
      //   return `${'122, 2233, 233, 221'}`;
      // },
    },
    {
      field: 'cpts',
      headerName: 'CPTs',
      flex: 1,
      minWidth: 150,
      hideSortIcons: true,
      disableReorder: true,
      // renderCell: () => {
      //   return `${'M221.0, J1100 | 22, 54'}`;
      // },
    },
    {
      field: 'action0',
      headerName: 'Include Provider',
      flex: 1,
      minWidth: 110,
      disableReorder: true,
      hideSortIcons: true,
      cellClassName: '!bg-cyan-50 PinnedColumLeftBorder',
      headerClassName: '!bg-cyan-100 !text-center PinnedColumLeftBorder',
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <ToggleButton
              value={params.row.includeProvider}
              onChange={(value) => {
                handleToggleChange(
                  params.row.claimID,
                  'includeProvider',
                  value
                );
              }}
            />
          </div>
        );
      },
    },
    {
      field: 'action',
      headerName: 'Include Ref. Provider',
      flex: 1,
      minWidth: 140,
      disableReorder: true,
      hideSortIcons: true,
      cellClassName: '!bg-cyan-50 PinnedColumLeftBorder',
      headerClassName: '!bg-cyan-100 !text-center PinnedColumLeftBorder',
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <ToggleButton
              value={params.row.includeRefferingProvider}
              onChange={(value) => {
                handleToggleChange(
                  params.row.claimID,
                  'includeRefferingProvider',
                  value
                );
              }}
            />
          </div>
        );
      },
    },
    {
      field: 'action1',
      headerName: 'Include ICDs',
      flex: 1,
      minWidth: 140,
      disableReorder: true,
      hideSortIcons: true,
      cellClassName: '!bg-cyan-50 PinnedColumLeftBorder',
      headerClassName: '!bg-cyan-100 !text-center PinnedColumLeftBorder',
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <ToggleButton
              value={params.row.includeICDs}
              onChange={(value) => {
                handleToggleChange(params.row.claimID, 'includeICDs', value);
              }}
            />
          </div>
        );
      },
    },
    // {
    //   field: 'action2',
    //   headerName: 'Include CPT',
    //   flex: 1,
    //   minWidth: 120,
    //   disableReorder: true,
    //   hideSortIcons: true,
    //   cellClassName: '!bg-cyan-50 PinnedColumLeftBorder',
    //   headerClassName: '!bg-cyan-100 !text-center PinnedColumLeftBorder',
    //   renderCell: (params) => {
    //     return (
    //       <div className="flex flex-col">
    //         <ToggleButton
    //           value={params.row.includeCPTs}
    //           onChange={(value) => {
    //             handleToggleChange(params.row.claimID, 'includeCPTs', value);
    //           }}
    //         />
    //       </div>
    //     );
    //   },
    // },
  ];
  const [selectedRow, setSelectedRow] = useState<any>();
  return (
    <div className="flex h-full w-full cursor-default flex-col rounded-lg bg-white text-left">
      <div id={'header'} className="w-full max-w-full border-b bg-gray-100 p-4">
        <div className="flex w-full flex-row justify-between">
          <div>
            <h1 className=" ml-2  text-left text-xl font-bold leading-7 text-gray-700">
              {`Auto-Populate Claim for Patient #${patientID}`}
            </h1>
          </div>
          <div className="">
            <CloseButton onClick={onClose} />
          </div>
        </div>
        {/* <div className="mt-3 h-px w-full bg-gray-300" /> */}
      </div>

      <div
        id={'body'}
        className="flex h-full w-full flex-col gap-4 overflow-x-hidden overflow-y-scroll  px-6 py-4"
      >
        <div className="text-base font-bold leading-6 text-gray-700">
          To auto-populate this claim, please select the claim you would like to
          use as a reference
        </div>
        <SearchDetailGrid
          rows={
            dataResut.map((row) => {
              return { ...row, id: row.claimID };
            }) || []
          }
          columns={columns}
          showTableHeading={false}
          checkboxSelection={false}
          hideHeader={true}
          hideFooter={true}
          disableRowSelection={false}
          selectRows={selectedRow}
          onSelectRow={(id: any) => {
            // debugger;
            setSelectedRow(id);
          }}
          pinnedColumns={{
            right: ['actions'],
          }}
        />
      </div>
      <div className=" py-6">
        <div className="h-[45px] "></div>
      </div>
      <div id={'footer'} className="absolute bottom-0 w-full bg-gray-100">
        <div className="flex w-full items-center justify-center self-end rounded-b-lg bg-gray-200 py-6">
          <div className="flex w-full items-center justify-end space-x-4 px-7">
            <Button
              buttonType={ButtonType.secondary}
              cls={`w-[102px] `}
              onClick={() => {
                onClose();
              }}
            >
              {' '}
              Cancel
            </Button>
            <Button
              buttonType={ButtonType.primary}
              // cls={`w-[102px] `}
              onClick={() => {
                setStatusModalInfo({
                  show: true,
                  heading: 'Auto-Populate Claim',
                  text: 'There are previous claims associated with the selected Patient Profile. Would you like this claim to be auto-populated using data from one of the previous claims?',
                  type: StatusModalType.WARNING,
                });
              }}
            >
              {' '}
              Import Data
            </Button>
          </div>
        </div>
      </div>
      <StatusModal
        open={statusModalInfo.show}
        heading={statusModalInfo.heading}
        description={statusModalInfo.text}
        statusModalType={statusModalInfo.type}
        showCloseButton={true}
        closeOnClickOutside={false}
        onChange={() => {
          setStatusModalInfo({
            ...statusModalInfo,
            show: false,
          });

          if (dataResut.length > 0 && selectedRow.length > 0) {
            onClose();
            onSelect(
              dataResut.filter((m) => m.claimID === selectedRow[0])[0] || null
            );
          }
        }}
        onClose={() => {
          setStatusModalInfo({
            ...statusModalInfo,
            show: false,
          });
        }}
      />
    </div>
  );
};
export default AutoRenderClaimDataModal;
