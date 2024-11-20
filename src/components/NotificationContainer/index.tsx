import { useEffect, useState } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';

import NotificationItem from '@/components/NotificationItem';
import NotificationTabs, { TabType } from '@/components/NotificationTabs';
import { fetchNotificationRequest } from '@/store/chrome/actions';
import {
  getNotificationsSelector,
  getPendingSelector,
} from '@/store/chrome/selectors';
import type { Notification } from '@/types/components/Notification';

const NotificationContainer = () => {
  const [currentTab, setCurrentTab] = useState(TabType.All);
  const notifications = useSelector(getNotificationsSelector);
  const pending = useSelector(getPendingSelector);

  const dispatch = useDispatch();
  const [data, setCurrentData] = useState<Notification[]>([]);

  useEffect(() => {
    if (currentTab === TabType.All) setCurrentData(notifications);
    else
      setCurrentData(
        notifications.filter(
          (notification: any) => notification.group === currentTab
        )
      );
  }, [currentTab, notifications]);

  useEffect(() => {
    dispatch(fetchNotificationRequest());
  }, []);

  return (
    <>
      <NotificationTabs
        currentTab={currentTab}
        onChangeTab={(newTab: TabType) => setCurrentTab(newTab)}
      />
      {!pending &&
        data.map((notification: any) => (
          <NotificationItem
            key={notification.notificationId}
            notification={notification}
          />
        ))}
    </>
  );
};

export default connect()(NotificationContainer);
