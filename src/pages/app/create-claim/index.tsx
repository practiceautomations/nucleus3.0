import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import CreateClaim from '../../../screen/createClaim';

export default function Main() {
  const [keyVal, setKeyVal] = useState<string | null>();

  const reRenderClaimScreen = () => {
    setKeyVal(String(uuidv4()));
  };
  return (
    <CreateClaim
      key={keyVal}
      selectedClaimID={undefined}
      reRenderScreen={() => {
        reRenderClaimScreen();
      }}
    />
  );
}
