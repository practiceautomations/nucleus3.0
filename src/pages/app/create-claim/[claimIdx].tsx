import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import CreateClaim from '@/screen/createClaim';

export default function Main() {
  const router = useRouter();
  const { claimIdx } = router.query;

  const [keyVal, setKeyVal] = useState<string | null>();

  const reRenderClaimScreen = () => {
    setKeyVal(String(uuidv4()));
  };

  return (
    <CreateClaim
      key={keyVal}
      selectedClaimID={
        claimIdx && typeof claimIdx === 'string' ? Number(claimIdx) : undefined
      }
      reRenderScreen={() => {
        reRenderClaimScreen();
      }}
    />
  );
}
