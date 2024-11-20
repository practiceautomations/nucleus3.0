import React, { useEffect, useState } from 'react';

import { baseUrl } from '@/api/http-client';
import Icon from '@/components/Icon';
import Badge from '@/components/UI/Badge';
import CloseButton from '@/components/UI/CloseButton';
import { getProfileModalData } from '@/store/shared/sagas';
import type { InsuranceProfileModalFields } from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';

interface InsuranceModalProps {
  insuranceID: number | null;
  onClose: () => void;
}
// InsuranceID will be used for calling api to get Insurance Data for this mode.

export function InsuranceDetailsModal({
  onClose,
  insuranceID,
}: InsuranceModalProps) {
  const baseApiUrl = baseUrl.substring(0, baseUrl.lastIndexOf('/'));
  const defaultUserUrl = '/assets/DefaultUser.png';
  const [insuranceData, setInsuranceData] =
    useState<InsuranceProfileModalFields>();

  const fetchInsuranceInfoByID = async (id: number) => {
    const res = await getProfileModalData(id, 'insurance');
    if (res && res.insuranceData) {
      setInsuranceData(res.insuranceData);
    }
  };

  const initProfile = () => {
    if (insuranceID) fetchInsuranceInfoByID(insuranceID);
  };
  useEffect(() => {
    initProfile();
  }, []);

  const getStatusBadge = (value: string) => {
    const color = value.toLowerCase() === 'active' ? 'green' : 'red';
    return (
      <Badge
        text={value.toUpperCase()}
        cls={classNames(`!rounded-full bg-${color}-100 text-${color}-800`)}
        icon={
          <div className="mt-[-1px] flex">
            <div
              className={classNames(
                `h-2 w-2 rounded-full`,
                value.toLowerCase() === 'active' ? 'bg-green-400' : 'bg-red-400'
              )}
            />
          </div>
        }
      />
    );
  };
  return (
    <div>
      <div
        className={`w-[480px] ${
          insuranceData?.showFullDetail ? `h-48` : `h-[174px]`
        } pl-6 pr-4 py-4 bg-white rounded-lg shadow border border-gray-300 flex-col justify-start items-end inline-flex`}
      >
        <div className="inline-flex items-start justify-end self-stretch">
          <div className="inline-flex shrink grow basis-0 flex-col items-start justify-center gap-6">
            <div className="inline-flex items-center justify-start gap-4 self-stretch">
              <img
                className={classNames('w-12 h-12 rounded-3xl bg-gray-100')}
                src={
                  insuranceData?.imgURL
                    ? baseApiUrl + insuranceData.imgURL
                    : defaultUserUrl
                }
              />
              {insuranceData?.showFullDetail ? (
                <div className="inline-flex shrink grow basis-0 flex-col items-start justify-start gap-2">
                  <div className="flex h-9 flex-col items-start justify-start self-stretch">
                    <div className="pb-1 font-['Nunito'] text-sm font-bold leading-tight text-gray-800">
                      {insuranceData?.name}
                    </div>
                    <div
                      className="cursor-pointer font-['Nunito'] text-xs font-normal leading-none text-cyan-500 underline"
                      onClick={() => {
                        window.open(
                          `/setting/insurances/${insuranceID}`,
                          '_blank'
                        );
                      }}
                    >
                      View Full Insurance Profile
                    </div>
                  </div>
                  {getStatusBadge(
                    insuranceData?.active ? 'Active' : 'inActive'
                  )}
                </div>
              ) : (
                <div className="inline-flex shrink grow basis-0 flex-col items-start justify-start gap-2">
                  <div className="flex h-9 flex-col items-start justify-start self-stretch">
                    <div className="pb-1 font-['Nunito'] text-sm font-bold leading-tight text-gray-800">
                      {insuranceData?.name}
                    </div>
                    {getStatusBadge(
                      insuranceData?.active ? 'Active' : 'inActive'
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex h-28 flex-col items-start justify-start gap-2 self-stretch">
              <div className="flex h-28 flex-col items-start justify-start gap-1 self-stretch">
                <div className="inline-flex items-center justify-start gap-1.5 self-stretch">
                  <Icon
                    name="officeBuilding2"
                    size={17}
                    color={IconColors.GRAY_300}
                  />
                  <div className="pl-0.5 font-['Nunito'] text-sm font-normal leading-tight text-gray-500">
                    {insuranceData?.address}
                  </div>
                </div>
                <div className="inline-flex items-center justify-start gap-1.5 self-stretch">
                  <Icon name="phone2" size={16} color={IconColors.GRAY_300} />
                  <div className="pl-1 font-['Nunito'] text-sm font-normal leading-tight text-cyan-500 underline">
                    {insuranceData?.phoneNumber}
                  </div>
                </div>
                <div className="inline-flex items-center justify-start gap-1.5 self-stretch">
                  <Icon name="email" size={15} color={IconColors.GRAY_300} />
                  <div
                    className="cursor-pointer pl-1 font-['Nunito'] text-sm font-normal leading-tight text-cyan-500 underline"
                    onClick={() => {
                      const email = insuranceData?.email;
                      if (email) {
                        window.open(`mailto:${email}`);
                      }
                    }}
                  >
                    {insuranceData?.email}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center rounded-md bg-white">
            <CloseButton
              onClick={() => {
                onClose();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
