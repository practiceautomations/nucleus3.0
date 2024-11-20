import Icon from '@/components/Icon';
import type { ChargeHistoryResult } from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';

import Badge from '../Badge';
import Button, { ButtonType } from '../Button';
import CloseButton from '../CloseButton';

interface PreviousChargeStatusModalProps {
  onClose: () => void;
  data: ChargeHistoryResult[];
}
export function PreviousChargeStatus({
  onClose,
  data,
}: PreviousChargeStatusModalProps) {
  const badgeChargeFromStatusClass = (statusColor: string) => {
    if (statusColor.includes('green')) {
      return 'bg-green-50 text-green-800 ';
    }
    if (statusColor.includes('red')) {
      return 'bg-red-50 text-red-800 ';
    }
    if (statusColor.includes('yellow')) {
      return 'bg-yellow-50 text-yellow-800';
    }
    return 'bg-gray-50 text-gray-800';
  };
  const badgeClaimFromStatusIcon = (chargeStatusColor: string) => {
    if (chargeStatusColor.includes('green')) {
      return IconColors.GREEN;
    }
    if (chargeStatusColor.includes('red')) {
      return IconColors.RED;
    }
    if (chargeStatusColor.includes('yellow')) {
      return IconColors.Yellow;
    }
    return IconColors.GRAY;
  };
  return (
    <div className="w-[1000px] ">
      <div className="flex h-[60px] items-center  justify-between  ">
        <div className="mt-[10px] flex gap-2 leading-5">
          <p className="ml-[27px] self-center text-xl font-bold text-gray-500 ">
            Charge Status History
          </p>
        </div>
        <div className="mt-[10px] mr-[27px] flex items-center justify-end gap-5">
          <CloseButton
            onClick={() => {
              onClose();
            }}
          />
        </div>
      </div>
      <div>
        <div className="h-px  bg-gray-300 " />
      </div>
      <div className="bg-white">
        <div className="inline-flex gap-4">
          <div className="self-center pl-[27px] pt-[20px]  text-xl  font-bold text-gray-400">
            Current
          </div>
        </div>
        <div
          className={`relative inline-flex items-start gap-8 text-gray-700 leading-6 text-left font-bold w-full h-full p-[27px] `}
        >
          <div
            className={classNames(
              `box-border h-full w-full rounded-md border border-solid  p-3 shadow-md drop-shadow-xl border-${
                data[0]?.chargeStatusColor || 'gray'
              }-500`,
              badgeChargeFromStatusClass(data[0]?.chargeStatusColor || '')
            )}
          >
            <div className="flex flex-col items-start justify-center">
              <p
                className={` text-sm font-bold leading-tight   text-${
                  data[0]?.chargeStatusColor || 'gray'
                }-500`}
              >
                Charge Status from: {data[0]?.statusFrom || ''}
              </p>
            </div>
            <div className="py-[10px]">
              <div
                className={`h-px w-full bg-${
                  data[0]?.chargeStatusColor || 'gray'
                }-300`}
              />
            </div>
            <div className="inline-flex">
              <p
                className={`w-[200px] text-sm text-green-${
                  data[0]?.chargeStatusColor || 'gray'
                }-500`}
              >
                Charge Status
                <p
                  className={`p-1 pt-2 text-lg font-bold text-${
                    data[0]?.chargeStatusColor || 'gray'
                  }-500`}
                >
                  <Badge
                    cls={`bg-${
                      data[0]?.chargeStatusColor || 'gray'
                    }-100  text-${data[0]?.chargeStatusColor || 'gray'}-800`}
                    icon={
                      <Icon
                        name="user"
                        size={18}
                        color={badgeClaimFromStatusIcon(
                          data[0]?.chargeStatusColor || 'gray'
                        )}
                      />
                    }
                    text={data[0]?.chargeStatus || ''}
                  />
                </p>
              </p>
              <div className={'ml-[1px]'}>
                <p
                  className={classNames(
                    'text-sm',
                    badgeChargeFromStatusClass(data[0]?.chargeStatusColor || '')
                  )}
                >
                  Charge Status Details{' '}
                </p>
                <p
                  className={`text-sm text-${
                    data[0]?.chargeStatusColor || 'gray'
                  }-500`}
                >
                  GROUP CODE:
                </p>
                {data.length > 0 &&
                  data[0] &&
                  data[0].groupCodes.map((m, index) => (
                    <p
                      key={`${index}`}
                      className={`text-sm text-${
                        data[0]?.chargeStatusColor || 'gray'
                      }-800`}
                    >
                      {m.code}|{m.description}{' '}
                    </p>
                  ))}
                <div className="py-[10px]">
                  <div
                    className={`h-px w-full bg-${
                      data[0]?.chargeStatusColor || 'gray'
                    }-300`}
                  />
                </div>
                <p
                  className={`text-sm text-${
                    data[0]?.chargeStatusColor || 'gray'
                  }-500`}
                >
                  REASON CODE:
                </p>
                {data.length > 0 &&
                  data[0] &&
                  data[0].reasonCodes.map((m, index) => (
                    <p
                      key={`${index}`}
                      className={`text-sm text-${
                        data[0]?.chargeStatusColor || 'gray'
                      }-800`}
                    >
                      {m.code} |{m.description}{' '}
                    </p>
                  ))}
                <div className="w-full py-[10px]">
                  <div
                    className={`h-px w-full bg-${
                      data[0]?.chargeStatusColor || 'gray'
                    }-300`}
                  />
                </div>
                <p
                  className={`text-sm text-${
                    data[0]?.chargeStatusColor || 'gray'
                  }-500`}
                >
                  REMARK CODE:{' '}
                </p>
                {data.length > 0 &&
                  data[0] &&
                  data[0].remarkCodes.map((m, index) => (
                    <p
                      key={`${index}`}
                      className={`text-sm text-${
                        data[0]?.chargeStatusColor || 'gray'
                      }-800`}
                    >
                      {m.code} |{m.description}{' '}
                    </p>
                  ))}
              </div>
            </div>
          </div>
        </div>
        <div className="inline-flex gap-4">
          <div className="mt-[20px] self-center pl-[27px] text-xl font-bold text-gray-400">
            Past Statuses:
          </div>
        </div>
        {data.slice(1).map((m) => (
          <div
            className={`relative inline-flex items-start gap-8 text-gray-700 leading-6 text-left font-bold w-full h-full p-[27px] `}
            key={m.chargeStatusID}
          >
            <div
              className={classNames(
                `box-border h-full w-full rounded-md border border-solid  p-3 shadow-md drop-shadow-xl border-${m.chargeStatusColor}-500`,
                badgeChargeFromStatusClass(m.chargeStatusColor)
              )}
            >
              <div className="flex flex-col items-start justify-center">
                <p
                  className={`text-sm font-bold leading-tight text-${m.chargeStatusColor}-500`}
                >
                  Charge Status from: {m.statusFrom}
                </p>
              </div>
              <div className="py-[10px]">
                <div className={`h-px w-full bg-${m.chargeStatusColor}-300`} />
              </div>
              <div className="inline-flex">
                <p
                  className={`w-[200px] text-sm text-green-${m.chargeStatusColor}-500`}
                >
                  Charge Status
                  <p
                    className={`p-1 pt-2 text-lg font-bold text-${m.chargeStatusColor}-500`}
                  >
                    <Badge
                      cls={`bg-${m.chargeStatusColor}-100  text-${m.chargeStatusColor}-800`}
                      icon={
                        <Icon
                          name="user"
                          size={18}
                          color={badgeClaimFromStatusIcon(m.chargeStatusColor)}
                        />
                      }
                      text={m.chargeStatus}
                    />
                  </p>
                </p>
                <div className={'ml-[1px]'}>
                  <p
                    className={classNames(
                      'text-sm',
                      badgeChargeFromStatusClass(m.chargeStatusColor)
                    )}
                  >
                    Charge Status Details{' '}
                  </p>
                  <p className={`text-sm text-${m.chargeStatusColor}-500`}>
                    GROUP CODE:
                  </p>
                  {data.length > 0 &&
                    data[0] &&
                    data[0].groupCodes.map((a, index) => (
                      <p
                        key={`${index}`}
                        className={`text-sm text-${m.chargeStatusColor}-800`}
                      >
                        {a.code}|{a.description}{' '}
                      </p>
                    ))}
                  <div className="py-[10px]">
                    <div
                      className={`h-px w-full bg-${m.chargeStatusColor}-300`}
                    />
                  </div>
                  <p className={`text-sm text-${m.chargeStatusColor}-500`}>
                    REASON CODE:
                  </p>
                  {data.length > 0 &&
                    data[0] &&
                    data[0].reasonCodes.map((b, index) => (
                      <p
                        key={`${index}`}
                        className={`text-sm text-${m.chargeStatusColor}-800`}
                      >
                        {b.code} |{b.description}{' '}
                      </p>
                    ))}
                  <div className="w-full py-[10px]">
                    <div
                      className={`h-px w-full bg-${m.chargeStatusColor}-300`}
                    />
                  </div>
                  <div>
                    <p className={`text-sm text-${m.chargeStatusColor}-500`}>
                      REMARK CODE:{' '}
                    </p>
                    {data.length > 0 &&
                      data[0] &&
                      data[0].remarkCodes.map((c, index) => (
                        <p
                          key={`${index}`}
                          className={`text-sm text-${m.chargeStatusColor}-800`}
                        >
                          {c.code} |{c.description}{' '}
                        </p>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="pt-[80px]">
        <div className="fixed bottom-0  w-[1000px] bg-gray-200 ">
          <div className=" py-[24px] pr-[27px]">
            <div className={`gap-4 flex justify-end `}>
              <div>
                <Button
                  buttonType={ButtonType.secondary}
                  cls={` `}
                  onClick={() => {
                    onClose();
                  }}
                >
                  {' '}
                  Close
                </Button>
              </div>
              <div>
                <Button
                  buttonType={ButtonType.primary}
                  cls={` `}
                  onClick={() => {}}
                >
                  {' '}
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
