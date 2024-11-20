import { useRouter } from 'next/router';

import Users from '@/screen/settings/users';

export default function Main() {
  const router = useRouter();
  const { userEmail } = router.query;

  return (
    <Users
      selectedEmail={
        userEmail && typeof userEmail === 'string' ? userEmail : undefined
      }
    />
  );
}
