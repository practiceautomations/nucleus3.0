import { useRouter } from 'next/router';

import Insurances from '@/screen/settings/insurances';

export default function Main() {
  const router = useRouter();
  const { insuranceIdx } = router.query;

  return (
    <Insurances
      selectedInsuranceID={
        insuranceIdx && typeof insuranceIdx === 'string'
          ? Number(insuranceIdx)
          : undefined
      }
    />
  );
}
