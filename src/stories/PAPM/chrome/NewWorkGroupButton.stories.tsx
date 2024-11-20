import type { ComponentStory } from '@storybook/react';
import React from 'react';

import CreateNewWorkgroupButton from '@/components/OrganizationSelector/WorkGroups/CreateNewWorkgroupButton';

export default {
  component: CreateNewWorkgroupButton,
  title: 'PAPM/Chrome/CreateNewWorkgroupButton',
};

const Template: ComponentStory<typeof CreateNewWorkgroupButton> = () => (
  <CreateNewWorkgroupButton />
);

export const Default = Template.bind({});

Default.args = {};
