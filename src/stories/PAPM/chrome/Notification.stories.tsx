import type { ComponentStory } from '@storybook/react';
import React from 'react';

import NotificationItem from '@/components/NotificationItem';

export default {
  component: NotificationItem,
  title: 'PAPM/Chrome/NotificationItem',
};

const Template: ComponentStory<typeof NotificationItem> = (args) => (
  <NotificationItem {...args} />
);

export const Default = Template.bind({});

Default.args = {
  notification: {
    notificationId: 1,
    title: 'Claim#12453 status change:',
    description: 'ERA received',
    ctaText: 'View claim',
    group: 'Remittance',
    timedate: new Date().toISOString(),
  },
};
