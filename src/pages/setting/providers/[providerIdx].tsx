import { useRouter } from 'next/router';

import SettingsProviders from '@/screen/settings/providers';

export default function Main() {
  const router = useRouter();
  const { providerIdx } = router.query;

  return (
    <SettingsProviders
      selectedProviderID={
        providerIdx && typeof providerIdx === 'string'
          ? Number(providerIdx)
          : undefined
      }
    />
  );
}
