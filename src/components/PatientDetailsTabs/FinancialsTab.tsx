import type { GridColDef } from '@mui/x-data-grid-pro';
import { useEffect, useRef, useState } from 'react';

import {
  getPatientFinicalDate,
  TimeframeDetailPatientFinanical,
} from '@/store/shared/sagas';
import type {
  GetPatientRequestData,
  PatientFinicalTabData,
  TimeFrameData,
} from '@/store/shared/types';
import { currencyFormatter, ExportDataToCSV } from '@/utils';
import { IconColors } from '@/utils/ColorFilters';

import Icon from '../Icon';
import AccountStatmentModal from '../PatientAccountStatement/AccountStatementModal';
import Badge from '../UI/Badge';
import Button, { ButtonType } from '../UI/Button';
import ButtonDropdown from '../UI/ButtonDropdown';
import CloseButton from '../UI/CloseButton';
import Modal from '../UI/Modal';
import SearchDetailGrid from '../UI/SearchDetailGrid';
import SectionHeading from '../UI/SectionHeading';

export interface PatientFinancialsTabProps {
  patientID: number | null;
  selectedPatientData: GetPatientRequestData;
}

export default function PatientFinancialsTab({
  patientID,
}: PatientFinancialsTabProps) {
  const [financialData, setFinancialData] = useState<PatientFinicalTabData>({
    patientID: null,
    lastPatientPayment: 0,
    lastPatientPaymentDate: '',
    lastPatientStatement: 0,
    lastPatientStatementDate: '',
    lastPatientStatementDays: 0,
    lastPatientStatementType: null,
    financials: [],
  });
  const [timeframerow, setTimeframerow] = useState<TimeFrameData[]>([]);
  const ExportFinicialData = async () => {
    let res: TimeFrameData[] | null;
    if (patientID) {
      res = await TimeframeDetailPatientFinanical(null, null, patientID, true);
      if (res) {
        const exportDataArray = res.map((n) => {
          return {
            'Claim ID': n.claimID.toString(),
            'Patient ID': n.patientID.toString(),
            'Patient Name': n.patient,
            DoS: n.dos,
            'Aging Type': n.agingType,
            Aging: n.agingDays.toString(),
            Insurance: n.insurance || '',
            Group: n.group,
            'Group EIN': n.groupEIN,
            Practice: n.practice,
            'Practice Address': n.practiceAddress,
            Facility: n.facility,
            'Facility Address': n.facilityAddress,
            Provider: n.provider,
            'Provider NPI': n.providerNPI,
            'Claim Status': n.claimStatus,
            PoS: n.pos,
            'Insurance Resp': currencyFormatter.format(n.insuranceAmount),
            'Patient Resp': currencyFormatter.format(n.patientAmount),
            'T. Balance': currencyFormatter.format(n.totalBalance),
          };
        });
        if (exportDataArray.length !== 0) {
          const headerArray = Object.keys(exportDataArray[0] || {});
          let criteriaObj: { [key: string]: string } = {
            ...exportDataArray[0],
          };
          const criteriaArray = [];
          criteriaObj = Object.fromEntries(
            headerArray.map((key) => [key, key])
          );
          criteriaArray.push(JSON.parse(JSON.stringify(criteriaObj)));
          const exportArray = criteriaArray.concat(exportDataArray);
          ExportDataToCSV(exportArray, 'PatientTimeframeHistory');
        }
      }
    }
  };
  const onFninicalTabData = async () => {
    let res: PatientFinicalTabData | null = null;
    if (patientID) {
      res = await getPatientFinicalDate(patientID);
      if (res) {
        setFinancialData({
          patientID: res.patientID,
          lastPatientPayment: res.lastPatientPayment,
          lastPatientPaymentDate: res.lastPatientPaymentDate,
          lastPatientStatement: res.lastPatientStatement,
          lastPatientStatementDate: res.lastPatientStatementDate,
          lastPatientStatementDays: res.lastPatientStatementDays,
          lastPatientStatementType: res.lastPatientStatementType,
          financials: res.financials,
        });
      }
    }
  };
  const [isTimeFrameHistory, setIsTimeFrameHistory] = useState<boolean>(false);

  const timeframeHistoryCols: GridColDef[] = [
    {
      field: 'claimID',
      headerName: 'Claim ID',
      flex: 1,
      minWidth: 104,
      disableReorder: true,
      sortable: false,
      renderCell: (params) => {
        const formattedValue = `#${params.value}`;
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
      field: 'patientID',
      headerName: 'Patient ID',
      flex: 1,
      minWidth: 114,
      disableReorder: true,
      sortable: false,
      renderCell: (params) => {
        const formattedValue = `#${params.value}`;
        return <div>{formattedValue}</div>;
      },
    },
    {
      field: 'patient',
      headerName: 'Patient Name',
      flex: 1,
      minWidth: 185,
      disableReorder: true,
      sortable: false,
    },
    {
      field: 'dos',
      headerName: 'DoS',
      flex: 1,
      minWidth: 135,
      renderCell: (params) => {
        return (
          <div>
            <> {`${params.value} - ${params.row.toDOS}`} </>
          </div>
        );
      },
    },
    {
      field: 'agingType',
      headerName: 'Aging Type',
      flex: 1,
      minWidth: 142,
      disableReorder: true,
      sortable: false,
    },
    {
      field: 'agingDays',
      headerName: 'Aging',
      flex: 1,
      minWidth: 120,
      disableReorder: true,
      sortable: false,
      renderCell: (params) => {
        const formattedValue = `${params.value} Days`;
        return <div>{formattedValue}</div>;
      },
    },
    {
      field: 'insurance',
      headerName: 'Insurance',
      flex: 1,
      minWidth: 131,
      disableReorder: true,
    },
    {
      field: 'group',
      headerName: 'Group',
      flex: 1,
      minWidth: 130,
      disableReorder: true,
      renderCell: (params) => {
        const formattedValue = `EIN:${params.row.groupEIN}`;
        return (
          <div className="flex flex-col">
            <div className="text-cyan-500 underline">{params.value}</div>
            <div>{formattedValue}</div>
          </div>
        );
      },
    },
    {
      field: 'practice',
      headerName: 'Practice',
      flex: 1,
      minWidth: 240,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="text-cyan-500 underline">{params.value}</div>
            <div>{params.row.practiceAddress}</div>
          </div>
        );
      },
    },
    {
      field: 'facility',
      headerName: 'Facility',
      flex: 1,
      minWidth: 235,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="text-cyan-500 underline">{params.value}</div>
            <div>{params.row.facilityAddress}</div>
          </div>
        );
      },
    },
    {
      field: 'provider',
      headerName: 'Provider',
      flex: 1,
      minWidth: 205,
      disableReorder: true,
      renderCell: (params) => {
        const formattedValue = `NPI:${params.row.providerNPI}`;
        return (
          <div className="flex flex-col">
            <div className="text-cyan-500 underline">{params.value}</div>
            <div>{formattedValue}</div>
          </div>
        );
      },
    },
    {
      field: 'claimStatus',
      headerName: 'Claim Status',
      flex: 1,
      minWidth: 195,
      disableReorder: true,
      renderCell: (params) => {
        if (params.row.claimStatusID === 5) {
          return (
            <Badge
              text={params.value}
              cls={'bg-green-50 text-green-800 rounded-[4px] whitespace-normal'}
              icon={<Icon name={'desktop'} color={IconColors.GREEN} />}
            />
          );
        }
        if (params.row.claimStatusID === 6) {
          return (
            <Badge
              text={params.value}
              cls={
                'bg-yellow-50 text-yellow-800 rounded-[4px] whitespace-normal'
              }
              icon={<Icon name={'user'} color={IconColors.Yellow} />}
            />
          );
        }
        return (
          <Badge
            text={params.value}
            cls={'bg-gray-50 text-gray-800 rounded-[4px] whitespace-normal'}
            icon={<Icon name={'desktop'} color={IconColors.GRAY} />}
          />
        );
      },
    },
    {
      field: 'pos',
      headerName: 'PoS',
      flex: 1,
      minWidth: 144,
      disableReorder: true,
    },
    {
      field: 'insuranceAmount',
      headerName: 'Insurance Resp.',
      flex: 1,
      minWidth: 170,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div>
              {params.value ? currencyFormatter.format(params.value) : ''}
            </div>
            {params.row.insuranceBalance < 0 && (
              <div className="whitespace-nowrap text-xs text-yellow-500">
                {`Bal.: ${
                  params.row.insuranceBalance
                    ? currencyFormatter.format(params.row.insuranceBalance)
                    : ''
                }`}
              </div>
            )}
            {params.row.insuranceBalance > 0 && (
              <div className="whitespace-nowrap text-xs text-red-500">
                {`Bal.: ${
                  params.row.insuranceBalance
                    ? currencyFormatter.format(params.row.insuranceBalance)
                    : ''
                }`}
              </div>
            )}
            {(params.row.insuranceBalance === 0 ||
              !params.row.insuranceBalance) && (
              <div className="whitespace-nowrap text-xs text-green-500">
                {`Bal.: ${currencyFormatter.format(0)}`}
              </div>
            )}
          </div>
        );
      },
    },
    {
      field: 'patientAmount',
      headerName: 'Patient Resp.',
      flex: 1,
      minWidth: 154,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div>
              {params.value ? currencyFormatter.format(params.value) : ''}
            </div>
            {params.row.patientBalance > 0 && (
              <div className="whitespace-nowrap text-xs text-red-500">
                {`Bal.: ${
                  params.row.patientBalance
                    ? currencyFormatter.format(params.row.patientBalance)
                    : ''
                }`}
              </div>
            )}
            {params.row.patientBalance < 0 && (
              <div className="whitespace-nowrap text-xs text-yellow-500">
                {`Bal.: ${
                  params.row.patientBalance
                    ? currencyFormatter.format(params.row.patientBalance)
                    : ''
                }`}
              </div>
            )}
            {(params.row.patientBalance === 0 ||
              !params.row.patientBalance) && (
              <div className="whitespace-nowrap text-xs text-green-500">
                {`Bal.: ${currencyFormatter.format(0)}`}
              </div>
            )}
          </div>
        );
      },
    },
    {
      field: 'totalBalance',
      headerName: 'T. Balance',
      flex: 1,
      minWidth: 135,
      disableReorder: true,
      renderCell: (params) => {
        if (params.value > 0) {
          return (
            <div className="text-red-500">
              {params.value ? currencyFormatter.format(params.value) : ''}
            </div>
          );
        }
        if (params.value === 0) {
          return (
            <div className="text-green-500">
              {params.value ? currencyFormatter.format(params.value) : ''}
            </div>
          );
        }

        return (
          <div className="text-yellow-500">
            {params.value ? currencyFormatter.format(params.value * -1) : ''}
          </div>
        );
      },
    },
  ];
  useEffect(() => {
    onFninicalTabData();
  }, []);
  const onTimeframeHistory = async (responsibility: string, index: string) => {
    let res: TimeFrameData[] | null = null;
    if (patientID) {
      res = await TimeframeDetailPatientFinanical(
        responsibility,
        index,
        patientID
      );
    }
    if (res) {
      setTimeframerow(res);
    }
  };
  const finicialCols: GridColDef[] = [
    {
      field: 'responsibility',
      headerName: 'Responsibility',
      flex: 1,
      maxWidth: 175,
      disableReorder: true,
      sortable: false,
    },
    {
      field: 'current',
      headerName: 'Current',
      flex: 1,
      maxWidth: 175,
      disableReorder: true,
      sortable: false,
      renderCell: (params) => {
        const formattedValue =
          params.value || params.value === 0
            ? currencyFormatter.format(params.value)
            : '';
        return (
          <div className="flex flex-col">
            <div
              data-testid="org"
              className="cursor-pointer text-cyan-500"
              onClick={() => {
                setIsTimeFrameHistory(true);
                onTimeframeHistory(params.row.responsibility, 'current');
              }}
            >
              {formattedValue}
            </div>
          </div>
        );
      },
    },
    {
      field: 'plus30',
      headerName: '30 - 60 Days',
      flex: 1,
      maxWidth: 168,
      disableReorder: true,
      sortable: false,
      renderCell: (params) => {
        const formattedValue =
          params.value || params.value === 0
            ? currencyFormatter.format(params.value)
            : '';
        return (
          <div className="flex flex-col">
            <div
              data-testid="org"
              className="cursor-pointer text-cyan-500"
              onClick={() => {
                setIsTimeFrameHistory(true);
                onTimeframeHistory(params.row.responsibility, '30 Plus');
              }}
            >
              {formattedValue}
            </div>
          </div>
        );
      },
    },
    {
      field: 'plus60',
      headerName: '60 - 90 Days',
      flex: 1,
      maxWidth: 168,
      disableReorder: true,
      sortable: false,
      renderCell: (params) => {
        const formattedValue =
          params.value || params.value === 0
            ? currencyFormatter.format(params.value)
            : '';
        return (
          <div className="flex flex-col">
            <div
              data-testid="org"
              className="cursor-pointer text-cyan-500"
              onClick={() => {
                setIsTimeFrameHistory(true);
                onTimeframeHistory(params.row.responsibility, '60 Plus');
              }}
            >
              {formattedValue}
            </div>
          </div>
        );
      },
    },
    {
      field: 'plus90',
      headerName: '90 - 120 Days',
      flex: 1,
      maxWidth: 168,
      disableReorder: true,
      sortable: false,
      renderCell: (params) => {
        const formattedValue =
          params.value || params.value === 0
            ? currencyFormatter.format(params.value)
            : '';
        return (
          <div className="flex flex-col">
            <div
              data-testid="org"
              className="cursor-pointer text-cyan-500"
              onClick={() => {
                setIsTimeFrameHistory(true);
                onTimeframeHistory(params.row.responsibility, '90 Plus');
              }}
            >
              {formattedValue}
            </div>
          </div>
        );
      },
    },
    {
      field: 'plus120',
      headerName: '120 - 180 Days',
      flex: 1,
      maxWidth: 168,
      disableReorder: true,
      sortable: false,
      renderCell: (params) => {
        const formattedValue =
          params.value || params.value === 0
            ? currencyFormatter.format(params.value)
            : '';
        return (
          <div className="flex flex-col">
            <div
              data-testid="org"
              className="cursor-pointer text-cyan-500"
              onClick={() => {
                setIsTimeFrameHistory(true);
                onTimeframeHistory(params.row.responsibility, '120 Plus');
              }}
            >
              {formattedValue}
            </div>
          </div>
        );
      },
    },
    {
      field: 'plus180',
      headerName: '180+ Days',
      flex: 1,
      maxWidth: 168,
      disableReorder: true,
      sortable: false,
      renderCell: (params) => {
        const formattedValue =
          params.value || params.value === 0
            ? currencyFormatter.format(params.value)
            : '';
        return (
          <div className="flex flex-col">
            <div
              data-testid="org"
              className="cursor-pointer text-cyan-500"
              onClick={() => {
                setIsTimeFrameHistory(true);
                onTimeframeHistory(params.row.responsibility, '180 Plus');
              }}
            >
              {formattedValue}
            </div>
          </div>
        );
      },
    },
    {
      field: 'balance',
      headerName: 'Balance',
      flex: 1,
      minWidth: 168,
      disableReorder: true,
      renderCell: (params) => {
        const formattedValue =
          params.value || params.value === 0
            ? currencyFormatter.format(params.value)
            : '';
        return <div>{formattedValue}</div>;
      },
    },
  ];
  const gridRef = useRef<HTMLTableRowElement>(null);
  const [downloadAccountStatement, setDownloadAccountStatement] =
    useState(false);
  return (
    <>
      <Modal
        open={isTimeFrameHistory}
        onClose={() => {
          setIsTimeFrameHistory(false);
        }}
        modalContentClassName="rounded-lg bg-gray-100  text-left shadow-xl  h-full w-[1232px]"
      >
        <div className="m-5 mb-[30px] text-gray-700">
          <SectionHeading label={`Timeframe Details`} />
          <div className="flex items-center justify-end gap-5">
            <CloseButton
              onClick={() => {
                setIsTimeFrameHistory(false);
              }}
            />
          </div>
          <div className="mt-[24px]">
            <div ref={gridRef} className="h-full">
              <SearchDetailGrid
                checkboxSelection={false}
                rows={
                  timeframerow.map((row) => {
                    return { ...row, id: row.claimID };
                  }) || []
                }
                columns={timeframeHistoryCols}
              />
            </div>
          </div>
        </div>
      </Modal>
      <div className="w-full bg-gray-100 text-gray-700">
        <div className="flex items-center gap-4 text-xl font-bold leading-5">
          <div className="inline-flex py-4"> Patient’s Financial History</div>
          <ButtonDropdown
            buttonCls="!h-[38px] !w-[187px]"
            showIcon={false}
            disabled={
              financialData.financials?.length !== 0 &&
              financialData?.financials &&
              financialData?.financials[0]?.balance === 0 &&
              financialData?.financials[1] &&
              financialData?.financials[1]?.balance === 0
            }
            cls={`!w-[187px] h-[38px] ml-[10px] inline-flex !justify-center leading-loose`}
            popoverCls="!w-[187px]"
            buttonLabel="Export Financial History"
            dataList={[
              {
                id: 1,
                title: 'Export Report to CSV',
                showBottomDivider: false,
              },
            ]}
            onSelect={(value) => {
              if (value === 1) {
                ExportFinicialData();
              }
            }}
          />
          <Button
            cls={
              'h-[38px] inline-flex items-center justify-center py-2 bg-cyan-500 shadow rounded-md'
            }
            disabled={
              financialData.financials?.length !== 0 &&
              financialData?.financials &&
              financialData?.financials[0]?.balance === 0 &&
              financialData?.financials[1] &&
              financialData?.financials[1]?.balance === 0
            }
            buttonType={ButtonType.primary}
            onClick={() => {
              setDownloadAccountStatement(true);
            }}
          >
            Account Statement
          </Button>
        </div>
      </div>
      <div className="relative mt-[24px]  w-full text-sm leading-tight text-gray-500">
        {financialData?.financials &&
        financialData?.lastPatientPaymentDate === null &&
        financialData?.lastPatientStatementDate === null &&
        financialData.financials[0]?.balance === 0 &&
        financialData.financials[1]?.balance === 0 ? (
          <div className="h-[20px] w-[372px]">
            {' '}
            {`There is no financial data for this patient yet.`}
          </div>
        ) : (
          <>
            <div>
              <div className="w-full bg-gray-100 text-gray-700">
                <div className="inline-flex w-full flex-col items-start justify-end space-y-6">
                  <div className="inline-flex space-x-4">
                    <div className="inline-flex w-56 items-start justify-start rounded-md border border-gray-300 bg-white p-4 shadow">
                      <div className="inline-flex flex-1 flex-col items-start justify-start space-y-1">
                        <p className="w-full text-base leading-normal text-gray-500">
                          Last Patient Payment
                        </p>
                        <div className="inline-flex w-full items-end justify-start">
                          <div className="flex flex-1 items-end justify-start space-x-2">
                            <p className="text-xl font-bold leading-7 text-gray-500">
                              {financialData.lastPatientPayment ||
                              financialData.lastPatientPayment === 0
                                ? currencyFormatter.format(
                                    financialData.lastPatientPayment
                                  )
                                : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="inline-flex w-56 items-start justify-start rounded-md border border-gray-300 bg-white p-4 shadow">
                      <div className="inline-flex flex-1 flex-col items-start justify-start space-y-1">
                        <p className="w-full text-base leading-normal text-gray-500">
                          Last Pat. Payment Date
                        </p>
                        <div className="inline-flex w-full items-end justify-start">
                          <div className="flex flex-1 items-end justify-start space-x-2">
                            <p className="text-xl font-bold leading-7 text-gray-500">
                              {' '}
                              {financialData.lastPatientPaymentDate}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="inline-flex space-x-4">
                    <div className="inline-flex w-56 items-start justify-start rounded-md border border-gray-300 bg-white p-4 shadow">
                      <div className="inline-flex flex-1 flex-col items-start justify-start space-y-1">
                        <p className="w-full text-base leading-normal text-gray-500">
                          Last Pat. Statement
                        </p>
                        <div className="inline-flex w-full items-end justify-start">
                          <div className="flex flex-1 items-end justify-start space-x-2">
                            <p className="text-xl font-bold leading-7 text-gray-500">
                              {financialData.lastPatientStatement ||
                              financialData.lastPatientStatement === 0
                                ? currencyFormatter.format(
                                    financialData.lastPatientStatement
                                  )
                                : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="inline-flex w-56 items-start justify-start rounded-md border border-gray-300 bg-white p-4 shadow">
                      <div className="inline-flex flex-1 flex-col items-start justify-start space-y-1">
                        <p className="w-full text-base leading-normal text-gray-500">
                          Last Pat. Statement Date
                        </p>
                        <div className="inline-flex w-full items-end justify-start">
                          <div className="flex flex-1 items-end justify-start space-x-2">
                            <p className="text-xl font-bold leading-7 text-gray-500">
                              {financialData.lastPatientStatementDate}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="inline-flex w-56 items-start justify-start rounded-md border border-gray-300 bg-white p-4 shadow">
                      <div className="inline-flex flex-1 flex-col items-start justify-start space-y-1">
                        <p className="w-full text-base leading-normal text-gray-500">
                          Last Pat. Statement Days
                        </p>
                        <div className="inline-flex w-full items-end justify-start">
                          <div className="flex flex-1 items-end justify-start space-x-2">
                            <p className="text-xl font-bold leading-7 text-gray-500">
                              {financialData.lastPatientStatementDays}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="inline-flex w-56 items-start justify-start rounded-md border border-gray-300 bg-white p-4 shadow">
                      <div className="inline-flex flex-1 flex-col items-start justify-start space-y-1">
                        <p className="w-full text-base leading-normal text-gray-500">
                          Last Pat. Statement Type
                        </p>
                        <div className="inline-flex w-full items-end justify-start">
                          <div className="flex flex-1 items-end justify-start space-x-2">
                            <p className="text-xl font-bold leading-7 text-gray-500">
                              {financialData.lastPatientStatementType
                                ? financialData.lastPatientStatementType
                                : '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-[40px]">
              <div style={{ height: '100%', width: '1100px' }}>
                <SearchDetailGrid
                  checkboxSelection={false}
                  hideHeader={true}
                  hideFooter={true}
                  columns={finicialCols}
                  rows={
                    (financialData.financials &&
                      financialData?.financials?.map((row) => {
                        return { ...row, id: row.id };
                      })) ||
                    []
                  }
                />
              </div>
            </div>
          </>
        )}
      </div>
      <Modal
        open={downloadAccountStatement}
        onClose={() => {}}
        modalContentClassName="h-[calc(100%-200px)] w-[calc(100%-520px)] relative rounded-lg bg-white shadow-xl transition-all sm:my-8"
        hideBackdrop
      >
        <AccountStatmentModal
          onClose={() => setDownloadAccountStatement(false)}
          patientID={patientID}
        />
      </Modal>
    </>
  );
}
