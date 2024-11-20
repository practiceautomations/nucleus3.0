import { useRouter } from 'next/router';
import React from 'react';

import ClaimDetail from '@/components/ClaimDetailMain';
import AppLayout from '@/layouts/AppLayout';

export default function Main() {
  const router = useRouter();
  const { claimIdx } = router.query;
  const claimID =
    claimIdx && typeof claimIdx === 'string' ? Number(claimIdx) : 0;
  return (
    <AppLayout title="Nucleus - Claim Detail">
      <ClaimDetail
        claimID={claimID}
        onCloseModal={() => {
          router.push(`/app/all-claims`);
        }}
      />
    </AppLayout>
  );
}
