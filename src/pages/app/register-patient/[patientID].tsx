import { useRouter } from 'next/router';
import React from 'react';

import RegisterPatient from '@/screen/registerPatient';

export default function Main() {
  const router = useRouter();
  const { patientID } = router.query;

  return (
    <RegisterPatient
      selectedPatientID={
        patientID && typeof patientID === 'string' ? Number(patientID) : null
      }
    />
  );
}
