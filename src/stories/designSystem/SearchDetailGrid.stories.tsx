import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import {
  GRID_CHECKBOX_SELECTION_COL_DEF,
  GRID_DETAIL_PANEL_TOGGLE_COL_DEF,
} from '@mui/x-data-grid-pro';
import type { ComponentStory } from '@storybook/react';
import React from 'react';

import Icon from '@/components/Icon';
import Badge from '@/components/UI/Badge';
import SearchDetailGrid from '@/components/UI/SearchDetailGrid';
import SearchGridExpandabkeRowModal from '@/components/UI/SearchGridExpandableRowModal';
import {
  currencyFormatter,
  CustomDetailPanelToggle,
  usdPrice,
} from '@/pages/app/all-claims';
import { IconColors } from '@/utils/ColorFilters';

function expandedRowContent() {
  return (
    <SearchGridExpandabkeRowModal
      badge={
        <Badge
          text={'Partially Paid'}
          cls={'bg-green-50 text-green-800 rounded-[4px] pt-1'}
          icon={<Icon name={'desktop'} color={IconColors.GREEN} />}
        />
      }
      expandRowData={[]}
      claimID={''}
      onClose={() => {}}
      // expandedRows={[
      //   {
      //     id: 1,
      //     chargeID: 3240,
      //     chargeStatus: 'Paid ERA',
      //     cptCode: 84214,
      //     units: 1,
      //     mod: '-',
      //     dx: 'G51.0, C18.9 ,E11.9, N17.9',
      //     fee: 5000,
      //     allowable: 7500,
      //     insuranceResponsibility: 5500,
      //     patientResponsibility: 2000,
      //     patientBalance: 3400,
      //     insuranceBalance: -3003,
      //   },
      //   {
      //     id: 2,
      //     chargeID: 3241,
      //     chargeStatus: 'Denied',
      //     cptCode: 84214,
      //     units: 1,
      //     mod: '-',
      //     dx: 'G51.0, C18.9 ,E11.9, N17.9',
      //     fee: 5000,
      //     allowable: 7500,
      //     insuranceResponsibility: 5500,
      //     patientResponsibility: 2000,
      //     patientBalance: -3400,
      //     insuranceBalance: 3003,
      //   },
      // ]}
      expandedColumns={[
        {
          field: 'chargeID',
          headerName: 'Charge ID',
          flex: 1,
          minWidth: 110,
          sortable: false,
          renderCell: (params) => {
            return <div>{`#${params.value}`}</div>;
          },
        },
        {
          field: 'chargeStatus',
          headerName: 'Charge Status',
          flex: 1,
          minWidth: 110,
          sortable: false,
          renderCell: (params) => {
            if (params.value === 'Denied') {
              return (
                <Badge
                  text={params.value}
                  cls={'bg-red-50 text-red-800 rounded-[4px] whitespace-normal'}
                />
              );
            }
            if (params.value === 'Paid ERA') {
              return (
                <Badge
                  text={params.value}
                  cls={
                    'bg-green-50 text-green-800 rounded-[4px] whitespace-normal'
                  }
                />
              );
            }

            return (
              <Badge
                text={params.value}
                cls={'bg-gray-50 text-gray-800 rounded-[4px] whitespace-normal'}
              />
            );
          },
        },
        {
          field: 'cptCode',
          headerName: 'CPT Code',
          flex: 1,
          minWidth: 110,
          sortable: false,
        },
        {
          field: 'units',
          headerName: 'Units',
          flex: 1,
          minWidth: 110,
          sortable: false,
        },
        {
          field: 'mod',
          headerName: 'Mod.',
          flex: 1,
          minWidth: 110,
          sortable: false,
        },
        {
          field: 'dx',
          headerName: 'DX',
          flex: 1,
          minWidth: 110,
          sortable: false,
        },
        {
          field: 'fee',
          headerName: 'Fee',
          ...usdPrice,
          flex: 1,
          minWidth: 110,
          sortable: false,
        },
        {
          field: 'allowable',
          headerName: 'Allowable',
          ...usdPrice,
          flex: 1,
          minWidth: 110,
          sortable: false,
        },
        {
          field: 'insuranceResponsibility',
          ...usdPrice,
          headerName: 'Ins. Resp.',
          flex: 1,
          minWidth: 110,
          sortable: false,
          renderCell: (params) => {
            return (
              <div className="flex flex-col">
                {params.value >= 0 ? (
                  <div>{currencyFormatter.format(params.value)}</div>
                ) : (
                  <div className="text-red-500 ">
                    {currencyFormatter.format(params.value * -1)}
                  </div>
                )}
                {params.row.insuranceBalance < 0 && (
                  <div className="whitespace-nowrap text-xs text-red-500">
                    {`Bal.: ${currencyFormatter.format(
                      params.row.insuranceBalance
                    )}`}
                  </div>
                )}
                {params.row.insuranceBalance > 0 && (
                  <div className="whitespace-nowrap text-xs text-green-500">
                    {`Bal.: ${currencyFormatter.format(
                      params.row.insuranceBalance
                    )}`}
                  </div>
                )}
                {(params.row.insuranceBalance === 0 ||
                  !params.row.insuranceBalance) && (
                  <div className="whitespace-nowrap text-xs">
                    {`Bal.: ${currencyFormatter.format(0)}`}
                  </div>
                )}
              </div>
            );
          },
        },
        {
          field: 'patientResponsibility',
          headerName: 'Pat. Resp.',
          ...usdPrice,
          flex: 1,
          minWidth: 110,
          sortable: false,
          renderCell: (params) => {
            return (
              <div className="flex flex-col">
                {params.value >= 0 ? (
                  <div>{currencyFormatter.format(params.value)}</div>
                ) : (
                  <div className="text-red-500 ">
                    {currencyFormatter.format(params.value * -1)}
                  </div>
                )}
                {params.row.patientBalance < 0 && (
                  <div className="whitespace-nowrap text-xs text-red-500">
                    {`Bal.: ${currencyFormatter.format(
                      params.row.patientBalance
                    )}`}
                  </div>
                )}
                {params.row.patientBalance > 0 && (
                  <div className="whitespace-nowrap text-xs text-green-500">
                    {`Bal.: ${currencyFormatter.format(
                      params.row.patientBalance
                    )}`}
                  </div>
                )}
                {(params.row.patientBalance === 0 ||
                  !params.row.patientBalance) && (
                  <div className="whitespace-nowrap text-xs">
                    {`Bal.: ${currencyFormatter.format(0)}`}
                  </div>
                )}
              </div>
            );
          },
        },
      ]}
    />
  );
}
export default {
  component: SearchDetailGrid,
  title: 'Design System/Atoms/SearchDetailGrid',
};

const Template: ComponentStory<typeof SearchDetailGrid> = (args) => (
  <SearchDetailGrid {...args} />
);

export const Default = Template.bind({});

Default.args = {
  pageSize: 10,
  columns: [
    {
      ...GRID_DETAIL_PANEL_TOGGLE_COL_DEF,
      renderCell: (params) => (
        <CustomDetailPanelToggle id={params.id} value={params.value} />
      ),
      flex: 1,
      minWidth: 80,
    },
    {
      ...GRID_CHECKBOX_SELECTION_COL_DEF,
      flex: 1,
      minWidth: 80,
    },
    {
      field: 'claimID',
      headerName: 'Claim ID',
      flex: 1,
      minWidth: 110,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="cursor-pointer text-cyan-500" onClick={() => {}}>
            {`#${params.value}`}
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
    },
    {
      field: 'patient',
      headerName: 'Patient',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="cursor-pointer text-cyan-500" onClick={() => {}}>
            {params.value}
          </div>
        );
      },
    },
    {
      field: 'insurance',
      headerName: 'Insurance',
      minWidth: 120,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="cursor-pointer text-cyan-500" onClick={() => {}}>
            {params.value}
          </div>
        );
      },
    },
    {
      field: 'aging',
      flex: 1,
      minWidth: 150,
      headerName: 'Aging',
      disableReorder: true,
    },
    {
      field: 'followUp',
      flex: 1,
      minWidth: 150,
      headerName: 'Follow-up in',
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div>{params.value}</div>
            <div className="text-xs text-gray-400">
              {params.row.followUpDate}
            </div>
          </div>
        );
      },
    },
    {
      field: 'timelyFilling',
      type: 'boolean',
      headerName: 'T. Filling',
      flex: 1,
      minWidth: 110,
      disableReorder: true,
      renderCell: (params) => {
        return params.value ? (
          <CheckIcon
            style={{
              color: '#10B981',
            }}
          />
        ) : (
          <CloseIcon
            style={{
              color: '#EF4444',
            }}
          />
        );
      },
    },
    {
      field: 'scrubStatus',
      headerName: 'Scrub Status',
      flex: 1,
      minWidth: 200,
      disableReorder: true,
      renderCell: (params) => {
        if (params.row.scrubStatusID === 5) {
          return (
            <Badge
              text={params.value}
              cls={'bg-green-50 text-green-800 rounded-[4px] '}
              icon={<Icon name={'desktop'} color={IconColors.GREEN} />}
            />
          );
        }
        if (params.row.scrubStatusID === 6) {
          return (
            <Badge
              text={params.value}
              cls={'bg-yellow-50 text-yellow-800 rounded-[4px] '}
              icon={<Icon name={'user'} color={IconColors.Yellow} />}
            />
          );
        }

        return (
          <Badge
            text={params.value}
            cls={'bg-gray-50 text-gray-800 rounded-[4px] '}
            icon={<Icon name={'desktop'} color={IconColors.GRAY} />}
          />
        );
      },
    },
    {
      field: 'claimStatus',
      headerName: 'Claim Status',
      flex: 1,
      minWidth: 250,
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
      field: 'fee',
      headerName: 'Fee',
      // ...usdPrice,
      flex: 1,
      type: 'number',
      minWidth: 130,
      disableReorder: true,
      renderCell: (params) => {
        if (params.value < 0) {
          return (
            <div className="text-red-500">
              {currencyFormatter.format(params.value * -1)}
            </div>
          );
        }

        return <div>{currencyFormatter.format(params.value)}</div>;
      },
    },
    {
      field: 'allowable',
      headerName: 'Allowable',
      // ...usdPrice,
      flex: 1,
      minWidth: 125,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            {params.value >= 0 ? (
              <div>{currencyFormatter.format(params.value)}</div>
            ) : (
              <div className="text-red-500 ">
                {currencyFormatter.format(params.value * -1)}
              </div>
            )}
            {params.row.adjustments < 0 && (
              <div className="whitespace-nowrap text-xs text-red-500">
                {`Adj.: ${currencyFormatter.format(params.row.adjustments)}`}
              </div>
            )}
            {params.row.adjustments > 0 && (
              <div className="whitespace-nowrap text-xs text-green-500">
                {`Adj.: ${currencyFormatter.format(params.row.adjustments)}`}
              </div>
            )}
            {(params.row.adjustments === 0 || !params.row.adjustments) && (
              <div className="whitespace-nowrap text-xs">
                {`Adj.: ${currencyFormatter.format(0)}`}
              </div>
            )}
          </div>
        );
      },
    },
    {
      field: 'insuranceResponsibility',
      headerName: 'Insurance Resp.',
      ...usdPrice,
      flex: 1,
      minWidth: 160,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            {params.value >= 0 ? (
              <div>{currencyFormatter.format(params.value)}</div>
            ) : (
              <div className="text-red-500 ">
                {currencyFormatter.format(params.value * -1)}
              </div>
            )}
            {params.row.insuranceBalance < 0 && (
              <div className="whitespace-nowrap text-xs text-red-500">
                {`Bal.: ${currencyFormatter.format(
                  params.row.insuranceBalance
                )}`}
              </div>
            )}
            {params.row.insuranceBalance > 0 && (
              <div className="whitespace-nowrap text-xs text-green-500">
                {`Bal.: ${currencyFormatter.format(
                  params.row.insuranceBalance
                )}`}
              </div>
            )}
            {(params.row.insuranceBalance === 0 ||
              !params.row.insuranceBalance) && (
              <div className="whitespace-nowrap text-xs">
                {`Bal.: ${currencyFormatter.format(0)}`}
              </div>
            )}
          </div>
        );
      },
    },
    {
      field: 'patientResponsibility',
      headerName: 'Patient Resp.',
      ...usdPrice,
      flex: 1,
      minWidth: 160,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            {params.value >= 0 ? (
              <div>{currencyFormatter.format(params.value)}</div>
            ) : (
              <div className="text-red-500 ">
                {currencyFormatter.format(params.value * -1)}
              </div>
            )}
            {params.row.patientBalance < 0 && (
              <div className="whitespace-nowrap text-xs text-red-500">
                {`Bal.: ${currencyFormatter.format(params.row.patientBalance)}`}
              </div>
            )}
            {params.row.patientBalance > 0 && (
              <div className="whitespace-nowrap text-xs text-green-500">
                {`Bal.: ${currencyFormatter.format(params.row.patientBalance)}`}
              </div>
            )}
            {(params.row.patientBalance === 0 ||
              !params.row.patientBalance) && (
              <div className="whitespace-nowrap text-xs">
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
      ...usdPrice,
      flex: 1,
      minWidth: 130,
      disableReorder: true,
      renderCell: (params) => {
        if (params.value < 0) {
          return (
            <div className="text-red-500">
              {currencyFormatter.format(params.value * -1)}
            </div>
          );
        }

        return (
          <div className="text-green-500">
            {currencyFormatter.format(params.value)}
          </div>
        );
      },
    },
    {
      field: 'group',
      headerName: 'Group',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="cursor-pointer text-cyan-500" onClick={() => {}}>
              {params.value}
            </div>
            <div className="text-xs font-normal leading-4">{`EIN: ${12324455}`}</div>
          </div>
        );
      },
    },
    {
      field: 'practice',
      headerName: 'Practice',
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
              {params.row.location}
            </div>
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
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="cursor-pointer text-cyan-500" onClick={() => {}}>
              {params.value}
            </div>
            <div className="text-xs font-normal leading-4">
              {params.row.location}
            </div>
          </div>
        );
      },
    },
    {
      field: 'placeOfServide',
      headerName: 'PoS',
      flex: 1,
      minWidth: 150,
      disableReorder: true,
    },
    {
      field: 'provider',
      headerName: 'Provider',
      flex: 1,
      minWidth: 180,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="cursor-pointer text-cyan-500" onClick={() => {}}>
              {params.value}
            </div>
            <div className="text-xs font-normal leading-4">{`NPI: ${12324455}`}</div>
          </div>
        );
      },
    },
    {
      field: 'assignee',
      headerName: 'Assignee',
      flex: 1,
      minWidth: 180,
      disableReorder: true,
      renderCell: (params) => {
        return (
          <div className="flex flex-col">
            <div className="cursor-pointer text-cyan-500" onClick={() => {}}>
              {params.value}
            </div>
            <div className="text-xs font-normal leading-4">
              {params.row.assigneeRole}
            </div>
          </div>
        );
      },
    },
  ],
  rows: [
    {
      id: 1,
      claimID: 3221,
      dos: 'May 5-8, 2022',
      patient: 'Tom Cruise',
      insurance: 'Blue Cross',
      aging: '35 Days',
      followUp: '15 days',
      timelyFilling: false,
      scrubStatusID: 6,
      claimStatusID: 1,
      scrubStatus: 'Forcefully Passed',
      claimStatus: 'Billed to Primary or Secondary Insurance',
      fee: -10000,
      allowable: -7500,
      adjustments: -9387,
      insuranceBalance: 3343,
      patientBalance: 0,
      insuranceResponsibility: 5500,
      patientResponsibility: 2000,
      totalBalance: 10000,
      group: 'Health Clinic',
      practice: 'Health Clinic',
      facility: 'Health Clinic',
      placeOfServide: '11 | Office',
      provider: 'Dr. Wanda	G.	DanieIi',
      assignee: 'Floyd Miles',
      location: '3605 Parker Rd.',
      assigneeRole: 'Denial Specialist',
      followUpDate: '06/30/2022',
    },
    {
      id: 2,
      claimID: 3223,
      dos: 'May 5, 2022',
      patient: 'Jane Doe',
      insurance: 'Blue Cross',
      aging: '35 Days',
      followUp: '15 days',
      timelyFilling: true,
      scrubStatusID: 7,
      claimStatusID: 1,
      allowable: -7500,
      adjustments: 9387,
      insuranceBalance: 3343,
      scrubStatus: 'Unscrubbed',
      claimStatus: 'Billed to Primary or Secondary Insurance',
      fee: 10000,
      insuranceResponsibility: 5500,
      patientResponsibility: 2000,
      totalBalance: 10000,
      group: 'Health Clinic',
      practice: 'Health Clinic',
      facility: 'Health Clinic',
      placeOfServide: '11 | Office',
      provider: 'Dr. Wanda	G.	DanieIi',
      assignee: 'Floyd Miles',
      location: '3605 Parker Rd.',
      assigneeRole: 'Denial Specialist',
      followUpDate: '06/30/2022',
    },
    {
      id: 3,
      claimID: 3224,
      dos: 'May 15-28, 2022',
      patient: 'John Doe',
      insurance: 'Blue Cross',
      aging: '35 Days',
      followUp: '15 days',
      timelyFilling: true,
      scrubStatusID: 7,
      claimStatusID: 1,
      allowable: 7500,
      adjustments: 0,
      insuranceBalance: 3343,
      scrubStatus: 'Unscrubbed',
      claimStatus: 'Billed to Primary or Secondary Insurance',
      fee: 10000,
      insuranceResponsibility: 5500,
      patientResponsibility: 2000,
      totalBalance: 10000,
      group: 'Health Clinic',
      practice: 'Health Clinic',
      facility: 'Health Clinic',
      placeOfServide: '11 | Office',
      provider: 'Dr. Wanda	G.	DanieIi',
      assignee: 'Floyd Miles',
      location: '3605 Parker Rd.',
      assigneeRole: 'Denial Specialist',
      followUpDate: '06/30/2022',
    },
    {
      id: 4,
      claimID: 3225,
      dos: 'May 5-28, 2022',
      patient: 'stuart little',
      insurance: 'Blue Cross',
      aging: '35 Days',
      followUp: '15 days',
      timelyFilling: false,
      scrubStatusID: 6,
      claimStatusID: 1,
      adjustments: 6387,
      insuranceBalance: -3343,
      patientBalance: 321,
      scrubStatus: 'Forcefully Passed',
      claimStatus: 'Billed to Primary or Secondary Insurance',
      fee: 10000,
      allowable: 7500,
      insuranceResponsibility: 5500,
      patientResponsibility: 2000,
      totalBalance: 10000,
      group: 'Health Clinic',
      practice: 'Health Clinic',
      facility: 'Health Clinic',
      placeOfServide: '11 | Office',
      provider: 'Dr. Wanda	G.	DanieIi',
      assignee: 'Floyd Miles',
      location: '3605 Parker Rd.',
      assigneeRole: 'Denial Specialist',
      followUpDate: '06/30/2022',
    },
    {
      id: 5,
      claimID: 3226,
      dos: 'May 18, 2022',
      patient: 'hela odinsdottir',
      insurance: 'Blue Cross',
      aging: '35 Days',
      followUp: '15 days',
      timelyFilling: true,
      scrubStatusID: 5,
      claimStatusID: 1,
      scrubStatus: 'Passed',
      claimStatus: 'Billed to Primary or Secondary Insurance',
      fee: 10000,
      allowable: 7500,
      adjustments: 6387,
      insuranceBalance: -3343,
      patientBalance: 321,
      insuranceResponsibility: 5500,
      patientResponsibility: 2000,
      totalBalance: 10000,
      group: 'Health Clinic',
      practice: 'Health Clinic',
      facility: 'Health Clinic',
      placeOfServide: '11 | Office',
      provider: 'Dr. Wanda	G.	DanieIi',
      assignee: 'Floyd Miles',
      location: '3605 Parker Rd.',
      assigneeRole: 'Denial Specialist',
      followUpDate: '06/30/2022',
    },
    {
      id: 6,
      claimID: 3227,
      dos: 'May 12, 2022',
      patient: 'Jane Doe',
      insurance: 'Blue Cross',
      aging: '35 Days',
      followUp: '15 days',
      timelyFilling: true,
      scrubStatusID: 1,
      claimStatusID: 1,
      scrubStatus: 'Forcefully Passed',
      claimStatus: 'Billed to Primary or Secondary Insurance',
      fee: 10000,
      allowable: 7500,
      insuranceResponsibility: 5500,
      patientResponsibility: 2000,
      totalBalance: 10000,
      group: 'Health Clinic',
      practice: 'Health Clinic',
      facility: 'Health Clinic',
      placeOfServide: '11 | Office',
      provider: 'Dr. Wanda	G.	DanieIi',
      assignee: 'Floyd Miles',
      location: '3605 Parker Rd.',
      assigneeRole: 'Denial Specialist',
      followUpDate: '06/30/2022',
    },
    {
      id: 7,
      claimID: 3228,
      dos: 'May 5-8, 2022',
      patient: 'stuart little',
      insurance: 'Blue Cross',
      aging: '35 Days',
      followUp: '15 days',
      timelyFilling: true,
      scrubStatusID: 6,
      claimStatusID: 1,
      scrubStatus: 'Forcefully Passed',
      claimStatus: 'Billed to Primary or Secondary Insurance',
      fee: 10000,
      allowable: 7500,
      insuranceResponsibility: 5500,
      patientResponsibility: 2000,
      totalBalance: 10000,
      group: 'Health Clinic',
      practice: 'Health Clinic',
      facility: 'Health Clinic',
      placeOfServide: '11 | Office',
      provider: 'Dr. Wanda	G.	DanieIi',
      assignee: 'Floyd Miles',
      location: '3605 Parker Rd.',
      assigneeRole: 'Denial Specialist',
      followUpDate: '06/30/2022',
    },
    {
      id: 8,
      claimID: 3229,
      dos: 'May 25-28, 2022',
      patient: 'Tom Cruise',
      insurance: 'Blue Cross',
      aging: '35 Days',
      followUp: '15 days',
      timelyFilling: false,
      scrubStatusID: 5,
      claimStatusID: 1,
      scrubStatus: 'Passed',
      claimStatus: 'Billed to Primary or Secondary Insurance',
      fee: 10000,
      allowable: 7500,
      insuranceResponsibility: 5500,
      patientResponsibility: 2000,
      totalBalance: 10000,
      group: 'Health Clinic',
      practice: 'Health Clinic',
      facility: 'Health Clinic',
      placeOfServide: '11 | Office',
      provider: 'Dr. Wanda	G.	DanieIi',
      assignee: 'Floyd Miles',
      location: '3605 Parker Rd.',
      assigneeRole: 'Denial Specialist',
      followUpDate: '06/30/2022',
    },
    {
      id: 9,
      claimID: 3230,
      dos: 'May 15-28, 2022',
      patient: 'John Doe',
      insurance: 'Blue Cross',
      aging: '35 Days',
      followUp: '15 days',
      timelyFilling: true,
      scrubStatusID: 6,
      claimStatusID: 1,
      scrubStatus: 'Forcefully Passed',
      claimStatus: 'Billed to Primary or Secondary Insurance',
      fee: 10000,
      allowable: 7500,
      insuranceResponsibility: 5500,
      patientResponsibility: 2000,
      totalBalance: 10000,
      group: 'Health Clinic',
      practice: 'Health Clinic',
      facility: 'Health Clinic',
      placeOfServide: '11 | Office',
      provider: 'Dr. Wanda	G.	DanieIi',
      assignee: 'Floyd Miles',
      location: '3605 Parker Rd.',
      assigneeRole: 'Denial Specialist',
      followUpDate: '06/30/2022',
    },
    {
      id: 10,
      claimID: 3231,
      dos: 'May 23-24, 2022',
      patient: 'hela odinsdottir',
      insurance: 'Blue Cross',
      aging: '35 Days',
      followUp: '15 days',
      timelyFilling: false,
      scrubStatusID: 5,
      claimStatusID: 1,
      scrubStatus: 'Passed',
      claimStatus: 'Billed to Primary or Secondary Insurance',
      fee: 10000,
      allowable: 7500,
      insuranceResponsibility: 5500,
      patientResponsibility: 2000,
      totalBalance: 10000,
      group: 'Health Clinic',
      practice: 'Health Clinic',
      facility: 'Health Clinic',
      placeOfServide: '11 | Office',
      provider: 'Dr. Wanda	G.	DanieIi',
      assignee: 'Floyd Miles',
      location: '3605 Parker Rd.',
      assigneeRole: 'Denial Specialist',
      followUpDate: '06/30/2022',
    },
    {
      id: 11,
      claimID: 3232,
      dos: 'May 2, 2022',
      patient: 'John Doe',
      insurance: 'Blue Cross',
      aging: '35 Days',
      followUp: '15 days',
      timelyFilling: true,
      scrubStatusID: 6,
      claimStatusID: 1,
      scrubStatus: 'Forcefully Passed',
      claimStatus: 'Billed to Primary or Secondary Insurance',
      fee: 10000,
      allowable: 7500,
      insuranceResponsibility: 5500,
      patientResponsibility: 2000,
      totalBalance: 10000,
      group: 'Health Clinic',
      practice: 'Health Clinic',
      facility: 'Health Clinic',
      placeOfServide: '11 | Office',
      provider: 'Dr. Wanda	G.	DanieIi',
      assignee: 'Floyd Miles',
      location: '3605 Parker Rd.',
      assigneeRole: 'Denial Specialist',
      followUpDate: '06/30/2022',
    },
    {
      id: 12,
      claimID: 3233,
      dos: 'May 30, 2022',
      patient: 'Jane Doe',
      insurance: 'Blue Cross',
      aging: '35 Days',
      followUp: '15 days',
      timelyFilling: false,
      scrubStatusID: 1,
      claimStatusID: 1,
      scrubStatus: 'Forcefully Passed',
      claimStatus: 'Billed to Primary or Secondary Insurance',
      fee: 10000,
      allowable: 7500,
      insuranceResponsibility: 5500,
      patientResponsibility: 2000,
      totalBalance: 10000,
      group: 'Health Clinic',
      practice: 'Health Clinic',
      facility: 'Health Clinic',
      placeOfServide: '11 | Office',
      provider: 'Dr. Wanda	G.	DanieIi',
      assignee: 'Floyd Miles',
      location: '3605 Parker Rd.',
      assigneeRole: 'Denial Specialist',
      followUpDate: '06/30/2022',
    },
    {
      id: 13,
      claimID: 3234,
      dos: 'May 18, 2022',
      patient: 'hela odinsdottir',
      insurance: 'Blue Cross',
      aging: '35 Days',
      followUp: '15 days',
      timelyFilling: true,
      scrubStatusID: 1,
      claimStatusID: 1,
      scrubStatus: 'Forcefully Passed',
      claimStatus: 'Billed to Primary or Secondary Insurance',
      fee: 10000,
      allowable: 7500,
      insuranceResponsibility: 5500,
      patientResponsibility: 2000,
      totalBalance: 10000,
      group: 'Health Clinic',
      practice: 'Health Clinic',
      facility: 'Health Clinic',
      placeOfServide: '11 | Office',
      provider: 'Dr. Wanda	G.	DanieIi',
      assignee: 'Floyd Miles',
      location: '3605 Parker Rd.',
      assigneeRole: 'Denial Specialist',
      followUpDate: '06/30/2022',
    },
    {
      id: 14,
      claimID: 3235,
      dos: 'May 5-28, 2022',
      patient: 'Tom Cruise',
      insurance: 'Blue Cross',
      aging: '35 Days',
      followUp: '15 days',
      timelyFilling: true,
      scrubStatusID: 1,
      claimStatusID: 1,
      scrubStatus: 'Forcefully Passed',
      claimStatus: 'Billed to Primary or Secondary Insurance',
      fee: 10000,
      allowable: 7500,
      insuranceResponsibility: 5500,
      patientResponsibility: 2000,
      totalBalance: 10000,
      group: 'Health Clinic',
      practice: 'Health Clinic',
      facility: 'Health Clinic',
      placeOfServide: '11 | Office',
      provider: 'Dr. Wanda	G.	DanieIi',
      assignee: 'Floyd Miles',
      location: '3605 Parker Rd.',
      assigneeRole: 'Denial Specialist',
      followUpDate: '06/30/2022',
    },
    {
      id: 15,
      claimID: 3236,
      dos: 'May 11-19, 2022',
      patient: 'John Doe',
      insurance: 'Blue Cross',
      aging: '35 Days',
      followUp: '15 days',
      timelyFilling: false,
      scrubStatusID: 1,
      claimStatusID: 1,
      scrubStatus: 'Forcefully Passed',
      claimStatus: 'Billed to Primary or Secondary Insurance',
      fee: 10000,
      allowable: 7500,
      insuranceResponsibility: 5500,
      patientResponsibility: 2000,
      totalBalance: 10000,
      group: 'Health Clinic',
      practice: 'Health Clinic',
      facility: 'Health Clinic',
      placeOfServide: '11 | Office',
      provider: 'Dr. Wanda	G.	DanieIi',
      assignee: 'Floyd Miles',
      location: '3605 Parker Rd.',
      assigneeRole: 'Denial Specialist',
      followUpDate: '06/30/2022',
    },
  ],
  expandedRowContent,
};
