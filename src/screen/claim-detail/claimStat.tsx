import type { ClaimStatsData } from '@/store/shared/types';
import classNames from '@/utils/classNames';

type ClaimStatProp = {
  data: ClaimStatsData | undefined;
};
const ClaimStat = ({ data }: ClaimStatProp) => {
  const totalBalanceColor = (balance: number) => {
    if (balance === 0) {
      return ' bg-green-50 border-green-300';
    }
    if (balance > 0) {
      return 'border-red-300 bg-red-50';
    }
    return 'bg-yellow-50 border-yellow-300';
  };
  const balanceTextColor = (balance: number) => {
    if (balance === 0) {
      return 'text-green-500';
    }
    if (balance > 0) {
      return 'text-red-500';
    }
    return 'text-yellow-500';
  };
  return (
    <>
      <div className="pt-6 pb-2 text-xl font-bold leading-7 text-gray-700">
        Claim Stats
      </div>
      <div className="inline-flex w-full items-start justify-start space-x-6 rounded-lg border border-gray-300 bg-white p-4 shadow">
        <div className="inline-flex h-full w-1/3 flex-col items-center justify-end space-y-4 rounded-lg border border-gray-300 bg-white pb-2">
          <div className="inline-flex w-full items-start justify-start rounded-t-lg bg-cyan-50 px-6 py-2">
            <div className="inline-flex flex-col items-start justify-start space-y-1">
              <p className="w-full text-lg font-bold leading-7 text-cyan-700">
                Days in Claim Status
              </p>
            </div>
          </div>
          <div className="flex h-56 w-full flex-col items-start justify-start space-y-4 self-start pb-12">
            {data?.statusDays?.map((b) => (
              <>
                <div className="inline-flex w-full items-start justify-between space-x-2">
                  <div className="ml-4 flex items-start justify-start rounded bg-gray-100 px-3 py-0.5">
                    <p className="text-center text-sm font-medium leading-tight text-gray-800">
                      {b.status}
                    </p>
                  </div>
                  <div className="!mr-4 flex items-center justify-center rounded-full bg-gray-100 px-3 py-0.5">
                    <p className="text-center text-sm font-medium leading-tight text-gray-800">
                      {b.days}
                    </p>
                  </div>
                </div>
              </>
            ))}
          </div>
        </div>
        <div className="flex w-1/3 items-start justify-start space-x-4">
          <div className="inline-flex h-full w-2/4 flex-col items-start justify-start space-y-6">
            <div className="inline-flex w-full flex-1 items-start justify-end rounded-md border border-gray-300 bg-white p-4">
              <div className="inline-flex flex-1 flex-col items-start justify-start space-y-1">
                <p className="w-full text-sm leading-tight text-gray-600">
                  Days in AR
                </p>
                <div className="inline-flex w-full items-end justify-start">
                  <div className="flex flex-1 items-end justify-start space-x-2">
                    <p className="text-xl font-bold leading-7 text-gray-600">
                      {data?.daysInAR || 0} Days
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="inline-flex w-full flex-1 items-start justify-end rounded-md border border-gray-300 bg-white p-4">
              <div className="inline-flex flex-1 flex-col items-start justify-start space-y-1">
                <p className="w-full text-sm leading-tight text-gray-600">
                  Timely Filing{' '}
                </p>
                <div className="inline-flex w-full items-end justify-start">
                  <div className="flex flex-1 items-end justify-start space-x-2">
                    <p className="text-xl font-bold leading-7 text-gray-600">
                      {data?.timelyFiling || ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="inline-flex w-full flex-1 items-start justify-end rounded-md border border-gray-300 bg-white p-4">
              <div className="inline-flex flex-1 flex-col items-start justify-start space-y-1">
                <p className="w-full text-sm leading-tight text-gray-600">
                  Days to 1st Subm.
                </p>
                <div className="inline-flex w-full items-end justify-start">
                  <div className="flex flex-1 items-end justify-start space-x-2">
                    <p className="text-xl font-bold leading-7 text-gray-600">
                      {' '}
                      {data?.firstSubmissionDays || 0} days
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="inline-flex h-full w-2/4 flex-col items-start justify-start space-y-6">
            <div className="inline-flex w-full flex-1 items-start justify-end rounded-md border border-gray-300 bg-white p-4">
              <div className="inline-flex flex-1 flex-col items-start justify-start space-y-1">
                <p className="w-full text-sm leading-tight text-gray-600">
                  Scrub Status
                </p>
                <div className="inline-flex w-full items-end justify-start">
                  <div className="flex flex-1 items-end justify-start space-x-2">
                    <p className="text-xl font-bold leading-7 text-gray-600">
                      {data?.scrubStatus || ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="inline-flex w-full flex-1 items-start justify-end rounded-md border border-gray-300 bg-white p-4">
              <div className="inline-flex flex-1 flex-col items-start justify-start space-y-1">
                <p className="w-full text-sm leading-tight text-gray-600">
                  Appeal
                </p>
                <div className="inline-flex w-full items-end justify-start">
                  <div className="flex flex-1 items-end justify-start space-x-2">
                    <p className="text-xl font-bold leading-7 text-gray-600">
                      {data?.appeal || ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="inline-flex w-full flex-1 items-start justify-end rounded-md border border-gray-300 bg-white p-4">
              <div className="inline-flex flex-1 flex-col items-start justify-start space-y-1">
                <p className="w-full text-sm leading-tight text-gray-600">
                  Resubmission
                </p>
                <div className="inline-flex w-full items-end justify-start">
                  <div className="flex flex-1 items-end justify-start space-x-2">
                    <p className="text-xl font-bold leading-7 text-gray-600">
                      {data?.resubmission || ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="inline-flex w-1/3 flex-col items-start justify-start space-y-5">
          <div
            className={classNames(
              'inline-flex w-full items-start justify-start rounded-md border p-3.5',
              totalBalanceColor(data?.insuranceBalance || 0)
            )}
          >
            <div className="inline-flex flex-1 flex-col items-start justify-start space-y-1">
              <p
                className={classNames(
                  'w-full text-base leading-normal ',
                  balanceTextColor(data?.insuranceBalance || 0)
                )}
              >
                Claim Insurance Balance
              </p>
              <div className="inline-flex w-full items-end justify-start">
                <div className="flex flex-1 items-end justify-start space-x-2">
                  <p
                    className={classNames(
                      'text-xl font-bold leading-7  ',
                      balanceTextColor(data?.insuranceBalance || 0)
                    )}
                  >
                    $ {data?.insuranceBalance.toFixed(2) || 0.0}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div
            className={classNames(
              'inline-flex w-full items-start justify-start rounded-md border p-3.5',
              totalBalanceColor(data?.patientBalance || 0)
            )}
          >
            <div className="inline-flex flex-1 flex-col items-start justify-start space-y-1">
              <p
                className={classNames(
                  'w-full text-base leading-normal ',
                  balanceTextColor(data?.patientBalance || 0)
                )}
              >
                Claim Patient Balance
              </p>
              <div className="inline-flex w-full items-end justify-start">
                <div className="flex flex-1 items-end justify-start space-x-2">
                  <p
                    className={classNames(
                      'text-xl font-bold leading-7  ',
                      balanceTextColor(data?.patientBalance || 0)
                    )}
                  >
                    $ {data?.patientBalance.toFixed(2) || 0.0}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div
            className={classNames(
              'inline-flex w-full items-start justify-start rounded-md border p-3.5',
              totalBalanceColor(data?.totalBalance || 0)
            )}
          >
            <div className="inline-flex flex-1 flex-col items-start justify-start space-y-1">
              <p
                className={classNames(
                  'w-full text-base leading-normal ',
                  balanceTextColor(data?.totalBalance || 0)
                )}
              >
                Total Claim Balance
              </p>
              <div className="inline-flex w-full items-end justify-start">
                <div className="flex flex-1 items-end justify-start space-x-2">
                  <p
                    className={classNames(
                      'text-xl font-bold leading-7  ',
                      balanceTextColor(data?.totalBalance || 0)
                    )}
                  >
                    $ {data?.totalBalance.toFixed(2) || 0.0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default ClaimStat;
