import type { ComponentStory } from '@storybook/react';
import React from 'react';

import NotificationContainer from '@/components/NotificationContainer';

export default {
  component: NotificationContainer,
  title: 'PAPM/Chrome/NotificationContainer',
};

const Template: ComponentStory<typeof NotificationContainer> = () => (
  <NotificationContainer />
);

export const Default = Template.bind({});

Default.args = {};
