import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { logoutRequest } from '@/store/login/actions';
import { getUserSelector } from '@/store/login/selectors';
import { isScreenInActive } from '@/store/shared/actions';

function UseScreenInactivity() {
  const [lastActivity, setLastActivity] = useState(Date.now());
  const router = useRouter();
  const dispatch = useDispatch();

  const handleActivity = () => {
    setLastActivity(Date.now());
  };
  const user = useSelector(getUserSelector);
  const onLogOut = () => {
    if (user && user.loginAuditID) {
      dispatch(
        logoutRequest({
          loginAuditID: user.loginAuditID,
        })
      );
    }
  };

  const handleInactivity = async () => {
    const timeoutMinutes = 30; // Set the timeout duration here
    const timeoutMillis = timeoutMinutes * 60 * 1000;
    const elapsedTime = Date.now() - lastActivity;
    if (elapsedTime >= timeoutMillis) {
      onLogOut();
      dispatch(isScreenInActive(true));
    }
  };

  useEffect(() => {
    const inactivityTimer = setTimeout(handleInactivity, 1 * 60 * 1000); // Set the timeout duration here
    document.addEventListener('mousemove', handleActivity);
    document.addEventListener('keypress', handleActivity);
    document.addEventListener('touchstart', handleActivity);
    // document.addEventListener('visibilitychange', handleActivity);

    return () => {
      clearTimeout(inactivityTimer);
      document.removeEventListener('mousemove', handleActivity);
      document.removeEventListener('keypress', handleActivity);
      document.removeEventListener('touchstart', handleActivity);
      // document.removeEventListener('visibilitychange', handleActivity);
    };
  }, [handleInactivity, lastActivity, router]);

  return <></>;
}
export default UseScreenInactivity;
