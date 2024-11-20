import Image from 'next/image';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

// eslint-disable-next-line import/no-cycle
import GlobalSearch from '@/components/GlobalSearch';
import HeaderCreateButton from '@/components/HeaderCreateButton';
import HeaderIcons from '@/components/HeaderIconButtons';
import OrganizationSelector from '@/components/OrganizationSelector';
import OrganizationSelector2 from '@/components/OrganizationSelector2';
import AddChargeBatch from '@/screen/batch/addChargeBatch';
import AddPaymentBatch from '@/screen/batch/addPaymentBatch';
import { getselectdWorkGroupsIDsSelector } from '@/store/chrome/selectors';
import { getUserSelector } from '@/store/login/selectors';

// eslint-disable-next-line import/no-cycle
import MedicalCase from '../MedicalCases';
import Modal from '../UI/Modal';

const Header = () => {
  const user = useSelector(getUserSelector);
  const [openPaymentBatchPopup, setOpenPaymentBatchPopup] = useState(false);
  const [openChargeBatchPopup, setOpenChargeBatchPopup] = useState(false);
  const [isMedicalCaseModalOpen, setMedicalCaseModalOpen] = useState(false);
  const selectedWorkedGroup = useSelector(getselectdWorkGroupsIDsSelector);

  return (
    <>
      <nav className="bg-white shadow">
        <div className="mx-auto">
          <div className="flex h-16 justify-between">
            <div className="hidden w-[232px] shrink-0 items-center pl-3 sm:flex">
              <Image
                className="h-8 w-8"
                src="/assets/logo3.svg"
                alt="Nucleus"
                width={220}
                height={26}
              />
            </div>
            <div className="hidden flex-1 shrink-0 items-center sm:flex">
              {user?.organizationSelectorType === 1 && <OrganizationSelector />}
              {user?.organizationSelectorType === 2 && (
                <OrganizationSelector2 />
              )}
              <GlobalSearch />
            </div>
            <div className="flex items-center justify-end pr-6">
              <HeaderIcons />
              <HeaderCreateButton
                onSelect={(value) => {
                  if (value === 2) {
                    setOpenChargeBatchPopup(true);
                  }
                  if (value === 3) {
                    setOpenPaymentBatchPopup(true);
                  }
                  if (value === 4) {
                    setMedicalCaseModalOpen(true);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </nav>
      <AddPaymentBatch
        open={openPaymentBatchPopup}
        onClose={() => {
          setOpenPaymentBatchPopup(false);
        }}
        hideBackdrop={false}
        batchId={undefined}
      />
      <AddChargeBatch
        open={openChargeBatchPopup}
        batchId={undefined}
        hideBackdrop={false}
        onClose={() => {
          setOpenChargeBatchPopup(false);
        }}
      />
      <Modal
        open={isMedicalCaseModalOpen}
        onClose={() => {}}
        modalContentClassName="h-[calc(100%-80px)] w-[calc(100%-220px)] relative rounded-lg bg-white shadow-xl transition-all sm:my-8"
      >
        <MedicalCase
          onClose={() => {
            setMedicalCaseModalOpen(false);
          }}
          selectedPatientID={null}
          groupID={selectedWorkedGroup?.groupsData[0]?.id || undefined}
          isViewMode={false}
          medicalCaseID={null}
        />
      </Modal>
    </>
  );
};

export default Header;
