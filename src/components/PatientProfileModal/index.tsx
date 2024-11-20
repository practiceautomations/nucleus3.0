import React, { useEffect, useState } from 'react';

import { baseUrl } from '@/api/http-client';
import Icon from '@/components/Icon';
import Badge from '@/components/UI/Badge';
import { getProfileModalData } from '@/store/shared/sagas';
import type { PatientProfileModalFields } from '@/store/shared/types';
import classNames from '@/utils/classNames';
import { IconColors } from '@/utils/ColorFilters';

// eslint-disable-next-line import/no-cycle
import PatientDetailModal from '../PatientDetailModal';
import CloseButton from '../UI/CloseButton';
import Modal from '../UI/Modal';

export interface PatientProfileModalProps {
  open: boolean;
  patientID: number | undefined;
  onClose: () => void;
}
export default function PatientProfileModal({
  open,
  patientID,
  onClose,
}: PatientProfileModalProps) {
  const baseApiUrl = baseUrl.substring(0, baseUrl.lastIndexOf('/'));
  const defaultUserUrl = '/assets/DefaultUser.png';
  const [patientData, setPatientData] = useState<PatientProfileModalFields>();

  const fetchPatientProfileInfo = async (id: number) => {
    const res = await getProfileModalData(id, 'patient');
    if (res && res.patientData) {
      setPatientData(res.patientData);
    }
  };

  const initProfile = () => {
    if (patientID) fetchPatientProfileInfo(patientID);
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
  const [patientDetailsModal, setPatientDetailsModal] = useState<{
    open: boolean;
    id: number | null;
  }>({
    open: false,
    id: null,
  });
  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        modalContentClassName="relative w-[450px] overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 w-full"
      >
        <div
          className={`w-[450px] ${
            patientData?.showFullDetail ? `h-60` : `h-[220px]`
          } pl-6 pr-4 py-4 bg-white rounded-lg shadow border border-gray-300 flex-col justify-start items-end inline-flex`}
        >
          <div className="inline-flex items-start justify-end self-stretch">
            <div className="inline-flex shrink grow basis-0 flex-col items-start justify-center gap-6">
              <div className="inline-flex items-center justify-start gap-4 self-stretch">
                <img
                  className={classNames('w-12 h-12 rounded-3xl bg-gray-100')}
                  src={
                    patientData?.imgURL
                      ? baseApiUrl + patientData.imgURL
                      : defaultUserUrl
                  }
                />
                {patientData?.showFullDetail ? (
                  <div className="inline-flex shrink grow basis-0 flex-col items-start justify-start gap-2">
                    <div className="flex h-9 flex-col items-start justify-start self-stretch">
                      <div className="pb-1 font-['Nunito'] text-sm font-bold leading-tight text-gray-800">
                        {patientData?.name}
                      </div>
                      <div
                        className="cursor-pointer font-['Nunito'] text-xs font-normal leading-none text-cyan-500 underline"
                        onClick={() => {
                          // window.open(
                          //   `/app/register-patient/${patientID}`,
                          //   '_blank'
                          // );
                          setPatientDetailsModal({
                            open: true,
                            id: patientID || null,
                          });
                        }}
                      >
                        View Full Patient Profile
                      </div>
                    </div>
                    {getStatusBadge(
                      patientData?.active ? 'Active' : 'inActive'
                    )}
                  </div>
                ) : (
                  <div className="inline-flex shrink grow basis-0 flex-col items-start justify-start gap-2">
                    <div className="flex h-9 flex-col items-start justify-start self-stretch">
                      <div className="pb-1 font-['Nunito'] text-sm font-bold leading-tight text-gray-800">
                        {patientData?.name}
                      </div>
                      {getStatusBadge(
                        patientData?.active ? 'Active' : 'inActive'
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex h-28 flex-col items-start justify-start gap-2 self-stretch">
                <div className="flex h-28 flex-col items-start justify-start gap-1 self-stretch">
                  <div className="inline-flex items-center justify-start gap-1.5 self-stretch">
                    <Icon
                      name="UserBolt"
                      size={15}
                      color={IconColors.GRAY_300}
                    />
                    <div className="pl-1 font-['Nunito'] text-sm font-normal leading-tight text-gray-500">
                      ID#{patientData?.id}
                    </div>
                  </div>
                  <div className="inline-flex items-center justify-start gap-1.5 self-stretch">
                    <Icon
                      name="UserBolt"
                      size={15}
                      color={IconColors.GRAY_300}
                    />
                    <div className="pl-1 font-['Nunito'] text-sm font-normal leading-tight text-gray-500">
                      DoB: {patientData?.dob}
                    </div>
                  </div>
                  <div className="inline-flex items-center justify-start gap-1.5 self-stretch">
                    <Icon name="home" size={16} color={IconColors.GRAY_300} />
                    <div className="pl-1 font-['Nunito'] text-sm font-normal leading-tight text-gray-500">
                      {patientData?.address}
                    </div>
                  </div>
                  <div className="inline-flex items-center justify-start gap-1.5 self-stretch">
                    <Icon name="phone2" size={16} color={IconColors.GRAY_300} />
                    <div className="pl-1 font-['Nunito'] text-sm font-normal leading-tight text-cyan-500 underline">
                      {patientData?.phoneNumber}
                    </div>
                  </div>
                  <div className="inline-flex items-center justify-start gap-1.5 self-stretch">
                    <Icon name="email" size={15} color={IconColors.GRAY_300} />
                    <div
                      className="cursor-pointer pl-1 font-['Nunito'] text-sm font-normal leading-tight text-cyan-500 underline"
                      onClick={() => {
                        const email = patientData?.email;
                        if (email) {
                          window.open(`mailto:${email}`);
                        }
                      }}
                    >
                      {patientData?.email}
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
      <Modal
        open={patientDetailsModal.open}
        modalContentClassName="relative w-[93%] h-[94%] text-left overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 w-full"
        onClose={() => {}}
      >
        <PatientDetailModal
          isPopup={patientDetailsModal.open}
          selectedPatientID={patientDetailsModal.id}
          onCloseModal={() => {
            if (patientID) {
              fetchPatientProfileInfo(patientID);
            }
            setPatientDetailsModal({
              open: false,
              id: null,
            });
          }}
          onSave={() => {}}
        />
      </Modal>
    </>
  );
}
