import { useRouter } from 'next/router';

import Group from '@/screen/settings/group';

export default function Main() {
  const router = useRouter();
  const { groupIdx } = router.query;

  return (
    <Group
      selectedGroupID={
        groupIdx && typeof groupIdx === 'string' ? Number(groupIdx) : undefined
      }
    />
  );
}
