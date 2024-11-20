/* eslint-disable import/no-extraneous-dependencies */
import { rest } from 'msw';

import config from '../config';

const mockNotifications = [
  {
    notificationId: 1,
    title: 'trololo',
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

const getNotificationsPath = `${config.baseUrl}/api/notifications`;

const notificationsHandler = rest.get(
  getNotificationsPath,
  async (_, res, ctx) => res(ctx.status(200), ctx.json(mockNotifications))
);

export const notificationsHandlerException = rest.get(
  getNotificationsPath,
  async (_, res, ctx) =>
    res(ctx.status(500), ctx.json({ message: 'Deliberately broken request' }))
);

export const handlers = notificationsHandler;
