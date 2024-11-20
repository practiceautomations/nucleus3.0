import React, { useEffect, useState } from 'react';

import { baseUrl } from '@/api/http-client';
import Icon from '@/components/Icon';
import Badge from '@/components/UI/Badge';
import { getProfileModalData } from '@/store/shared/sagas';
import type { GroupProfileModalFields } from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';

import CloseButton from '../UI/CloseButton';
import Modal from '../UI/Modal';

export interface GroupProfileModalProps {
  open: boolean;
  groupID: number | undefined;
  onClose: () => void;
}
export default function GroupProfileModal({
  open,
  groupID,
  onClose,
}: GroupProfileModalProps) {
  const baseApiUrl = baseUrl.substring(0, baseUrl.lastIndexOf('/'));
  const defaultUserUrl = '/assets/DefaultUser.png';
  const [groupData, setGroupData] = useState<GroupProfileModalFields>();

  const fetchGroupInfoByID = async (id: number) => {
    const res = await getProfileModalData(id, 'group');
    if (res && res.groupData) {
      setGroupData(res.groupData);
    }
  };

  const initProfile = () => {
    if (groupID) fetchGroupInfoByID(groupID);
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
    <Modal
      open={open}
      onClose={onClose}
      modalContentClassName="relative w-[415px] overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 w-full"
    >
      <div
        className={`w-[415px] ${
          groupData?.showFullDetail ? `h-36` : `h-[128px]`
        } pl-6 pr-4 py-4 bg-white rounded-lg shadow border border-gray-300 flex-col justify-start items-end inline-flex`}
      >
        <div className="inline-flex items-start justify-end self-stretch">
          <div className="inline-flex shrink grow basis-0 flex-col items-start justify-center gap-6">
            <div className="inline-flex items-center justify-start gap-4 self-stretch">
              <img
                className={classNames('w-12 h-12 rounded-3xl bg-gray-100')}
                src={
                  groupData?.imgURL
                    ? baseApiUrl + groupData.imgURL
                    : defaultUserUrl
                }
              />
              {groupData?.showFullDetail ? (
                <div className="inline-flex shrink grow basis-0 flex-col items-start justify-start gap-2">
                  <div className="flex h-9 flex-col items-start justify-start self-stretch">
                    <div className="pb-1 font-['Nunito'] text-sm font-bold leading-tight text-gray-800">
                      {groupData?.name}
                    </div>
                    <div
                      className="cursor-pointer font-['Nunito'] text-xs font-normal leading-none text-cyan-500 underline"
                      onClick={() => {
                        window.open(`/setting/group/${groupID}`, '_blank');
                      }}
                    >
                      View Full Group Profile
                    </div>
                  </div>
                  {getStatusBadge(groupData?.active ? 'Active' : 'inActive')}
                </div>
              ) : (
                <div className="inline-flex shrink grow basis-0 flex-col items-start justify-start gap-2">
                  <div className="flex h-9 flex-col items-start justify-start self-stretch">
                    <div className="pb-1 font-['Nunito'] text-sm font-bold leading-tight text-gray-800">
                      {groupData?.name}
                    </div>
                    {getStatusBadge(groupData?.active ? 'Active' : 'inActive')}
                  </div>
                </div>
              )}
            </div>
            <div className="flex h-28 flex-col items-start justify-start gap-2 self-stretch">
              <div className="flex h-28 flex-col items-start justify-start gap-1 self-stretch">
                <div className="inline-flex items-center justify-start gap-1.5 self-stretch">
                  <Icon
                    name="officeBuilding2"
                    size={18}
                    color={IconColors.GRAY_300}
                  />
                  <div className="pl-1 font-['Nunito'] text-sm font-normal leading-tight text-gray-500">
                    EIN: {groupData?.einNumber}
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
    </Modal>
  );
}
