import type { Notification } from '@/types/components/Notification';
// eslint-disable-next-line import/prefer-default-export
export const notificationsData: Notification[] = [
  {
    notificationId: 1,
    title: 'Claim#12453 status change:',
    description: 'ERA received',
    ctaText: 'View claim',
    group: 'Remittance',
    timedate: new Date().toISOString(),
  },
  {
    notificationId: 2,
    title: 'Claim#12453 status change:',
    description: 'Rejected by Clearinghouse',
    group: 'Remittance',
    timedate: new Date().toISOString(),
  },
  {
    notificationId: 3,
    title: 'Claim#12453 status change:',
    description: 'Rejected by Clearinghouse',
    group: 'Claims',
    timedate: new Date().toISOString(),
    viewTimedate: new Date().toISOString(),
  },
];
