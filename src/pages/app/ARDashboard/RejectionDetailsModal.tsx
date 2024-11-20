import type { GridColDef } from '@mui/x-data-grid-pro';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import Badge from '@/components/UI/Badge';
import type { ChevronDropdownType } from '@/components/UI/ChevronDropdown';
import ChevronDropdown from '@/components/UI/ChevronDropdown';
import CloseButton from '@/components/UI/CloseButton';
import CustomDateSelectionModal from '@/components/UI/CustomDateSelectionModal';
import DashboardTiles from '@/components/UI/DashboardTiles';
import Modal from '@/components/UI/Modal';
import SearchDetailGrid from '@/components/UI/SearchDetailGrid';

interface RejectionDetailModalProp {
  selectedValue?: any;
  onClose: () => void;
}
export default function RejectionDetailModal({
  // selectedValue,
  onClose,
}: RejectionDetailModalProp) {
  const router = useRouter();
  const [routePath, setRoutePath] = useState<string | undefined>();
  useEffect(() => {
    if (routePath) {
      router.push(routePath);
    }
  }, [routePath]);
  const columns: GridColDef[] = [
    {
      field: 'claim_id',
      headerName: 'Claim ID',
      flex: 1,
      minWidth: 80,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-cyan-500"
            onClick={async () => {
              setRoutePath(`/app/claim-detail/${params.value}`);
            }}
          >
            {`#${params.row.claim_id}`}
          </div>
        );
      },
    },
    {
      field: 'charge_id',
      headerName: 'Charge ID',
      flex: 1,
      minWidth: 80,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="cursor-pointer text-cyan-500" onClick={() => {}}>
            {`#${params.row.charge_id}`}
          </div>
        );
      },
    },
    {
      field: 'dos',
      headerName: 'DoS',
      flex: 1,
      minWidth: 150,
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
      field: 'patient',
      headerName: 'Patient',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div
            className="cursor-pointer text-cyan-500"
            onClick={() => {
              // setRoutePath(`/app/register-patient/${params.row.patientID}`);
            }}
          >
            {params.value}
          </div>
        );
      },
    },
    {
      field: 'adjustmentCodes',
      headerName: 'Group + Reason Code',
      flex: 1,
      minWidth: 180,
      disableReorder: true,
      // renderCell: (params) => {
      //   return (
      //     <div className="flex flex-col">
      //       <div className="cursor-pointer text-cyan-500" onClick={() => { }}>
      //         {params.value}
      //       </div>
      //     </div>
      //   );
      // },
    },
    {
      field: 'remarkCodes',
      headerName: 'Remark Code',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      // renderCell: (params) => {
      //   return <div className="flex flex-col">{params.value}</div>;
      // },
    },
  ];
  const [rejectionStatsDateDropdownData, setRejectionStatsDateDropdownData] =
    useState<ChevronDropdownType[]>([]);
  const [rejectionClaimsData, setRejectionClaimsData] = useState<
    {
      id: number;
      claim_id: number;
      charge_id: number;
      fromDOS: string;
      toDOS: string;
      patient: string;
      adjustmentCodes: string;
      remarkCodes: string;
    }[]
  >([]);
  const [
    selectedRejectionStatsDateDropdownData,
    setSelectedRejectionStatsDateDropdownData,
  ] = useState<ChevronDropdownType>();
  useEffect(() => {
    setRejectionClaimsData([
      {
        id: 1,
        claim_id: 2222,
        charge_id: 123,
        fromDOS: '03/04/2023',
        toDOS: '03/05/2023',
        patient: 'John Doe',
        adjustmentCodes: 'CO-45',
        remarkCodes: 'N11',
      },
      {
        id: 2,
        claim_id: 2222,
        charge_id: 123,
        fromDOS: '03/04/2023',
        toDOS: '03/05/2023',
        patient: 'John Doe',
        adjustmentCodes: 'CO-45',
        remarkCodes: 'N11',
      },
      {
        id: 3,
        claim_id: 2222,
        charge_id: 123,
        fromDOS: '03/04/2023',
        toDOS: '03/05/2023',
        patient: 'John Doe',
        adjustmentCodes: 'CO-45',
        remarkCodes: 'N11',
      },
      {
        id: 4,
        claim_id: 2222,
        charge_id: 123,
        fromDOS: '03/04/2023',
        toDOS: '03/05/2023',
        patient: 'John Doe',
        adjustmentCodes: 'CO-45',
        remarkCodes: 'N11',
      },
      {
        id: 5,
        claim_id: 2222,
        charge_id: 123,
        fromDOS: '03/04/2023',
        toDOS: '03/05/2023',
        patient: 'John Doe',
        adjustmentCodes: 'CO-45',
        remarkCodes: 'N11',
      },
      {
        id: 6,
        claim_id: 2222,
        charge_id: 123,
        fromDOS: '03/04/2023',
        toDOS: '03/05/2023',
        patient: 'John Doe',
        adjustmentCodes: 'CO-45',
        remarkCodes: 'N11',
      },
    ]);
    setRejectionStatsDateDropdownData([
      { id: 1, value: 'Today' },
      { id: 2, value: 'Last 7 Days' },
      { id: 3, value: 'Month to Date' },
      { id: 4, value: 'Year to Date' },
      { id: 5, value: 'All Time' },
      { id: 6, value: 'Custom' },
    ]);
    setSelectedRejectionStatsDateDropdownData({ id: 1, value: 'Today' });
  }, []);

  const [isCustomDateModalOpen, setCustomDateModalOpen] = useState({
    open: false,
    type: '',
  });
  return (
    <>
      <div
        className="flex h-full w-full flex-col gap-4 overflow-y-auto rounded-lg bg-gray-100 p-4"
        style={{ textAlign: 'left' }}
      >
        <div className="text-start mt-3 w-full">
          <div className="flex w-full flex-row justify-between">
            <div className="flex self-start">
              <h1 className=" ml-2  text-left text-xl font-bold leading-7 text-gray-700">
                {`${'Rejections Details'} - ${'John Doe'}`}
                {/* selectedValue.name ||  */}
              </h1>
            </div>
            <div className="">
              <CloseButton onClick={onClose} />
            </div>
          </div>
          <div className="mt-3 h-px w-full bg-gray-300" />
        </div>

        <div className="flex w-[100%] flex-col gap-4 rounded-lg border border-gray-300 bg-white p-4 text-gray-700 shadow ">
          <div className="text-start text-base font-bold leading-normal ">
            {'Overall Rejections Stats'}
          </div>
          <div className="h-px bg-gray-200"></div>
          {/* <div className="no-scrollbar flex flex-col justify-between overflow-auto rounded-lg border border-gray-200 px-4 py-1"> */}
          <div className="flex gap-2">
            <DashboardTiles
              tileTitle={'Avg. Rejections per Day'}
              tilesColor={'gray'}
              isShowViewButton={false}
            />
            <DashboardTiles
              tileTitle={'Team Average'}
              tilesColor={'gray'}
              isShowViewButton={false}
            />
            <DashboardTiles
              tileTitle={'Team Rank'}
              tilesColor={'red'}
              isShowViewButton={false}
              count={`${7}º`}
              subTextNextToCount={'out of 15'}
            />
          </div>
          <div className="h-px bg-gray-200"></div>
          <div className="flex gap-2">
            <DashboardTiles
              tileTitle={'Top Rejection Reason'}
              tilesColor={'gray'}
              isShowViewButton={false}
              count="Invalid CPT Code"
            />
          </div>
          {/* </div> */}
        </div>
        <div className="flex w-[100%] flex-col gap-4 rounded-lg border border-gray-300 bg-white p-4 text-gray-700 shadow ">
          <div className="flex gap-2">
            <div className="text-base font-bold leading-normal ">
              {'Rejection Stats'}
            </div>
            <ChevronDropdown
              data={rejectionStatsDateDropdownData}
              selectedValue={selectedRejectionStatsDateDropdownData}
              onSelect={(value) => {
                setSelectedRejectionStatsDateDropdownData(value);
                if (value.id === 6) {
                  // setcollectedRejectionStatsDateModalOpen(true);
                  setCustomDateModalOpen({
                    open: true,
                    type: 'rejectionStats',
                  });
                }
              }}
            />
            <Badge
              text="16"
              cls="!rounded-full bg-gray-100 text-gray-800 border border-gray-300"
            />
          </div>
          <div className="h-px bg-gray-200"></div>
          {/* <div className="no-scrollbar flex flex-col justify-between overflow-auto rounded-lg border border-gray-200 px-4 py-1"> */}
          <div className="flex gap-2">
            <DashboardTiles
              tileTitle={'Avg. Rejections per Day in time period'}
              tilesColor={'gray'}
              isShowViewButton={false}
            />
            <DashboardTiles
              tileTitle={'Team Average'}
              tilesColor={'gray'}
              isShowViewButton={false}
            />
            <DashboardTiles
              tileTitle={'Team Rank'}
              tilesColor={'green'}
              isShowViewButton={false}
              count={`${7}º`}
              subTextNextToCount={'out of 15'}
            />
          </div>
          <div className="h-px bg-gray-200"></div>
          <div className="flex gap-2">
            <DashboardTiles
              tileTitle={'Top Rejection Reason in time period'}
              tilesColor={'gray'}
              isShowViewButton={false}
              count="Invalid CPT Code"
            />
          </div>
          <div
            className="no-scrollbar overflow-y-auto pt-[24px]"
            style={{ height: '100%', width: '100%' }}
          >
            <SearchDetailGrid
              checkboxSelection={false}
              hideHeader={true}
              hideFooter={true}
              columns={columns}
              rows={rejectionClaimsData}
              setHeaderRadiusCSS={true}
              // pinnedColumns={{
              //   right: ['actions'],
              // }}
            />
          </div>
          {/* </div> */}
        </div>
        <Modal
          open={isCustomDateModalOpen.open}
          onClose={() => {}}
          modalContentClassName=" w-[calc(40%)] relative rounded-lg bg-white shadow-xl transition-all sm:my-8"
        >
          <CustomDateSelectionModal
            onClose={() => {
              // setcollectedAmountDateModalOpen(false);
              setCustomDateModalOpen({
                open: false,
                type: '',
              });
            }}
            onClickSave={(type) => {
              // (fromDate, toDate, type)
              if (type === 'rejectionStats') {
                // setCollectedAmountCustomDate({
                //   toDate,
                //   fromDate,
                // });
              }
            }}
            label="Custom Date Selection"
            type={isCustomDateModalOpen.type}
          />
        </Modal>
      </div>
    </>
  );
}
