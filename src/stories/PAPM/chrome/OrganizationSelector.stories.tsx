import type { ComponentStory } from '@storybook/react';
import React from 'react';

import OrganizationSelector from '@/components/OrganizationSelector';

export default {
  component: OrganizationSelector,
  title: 'PAPM/Chrome/OrganizationSelector',
};

const Template: ComponentStory<typeof OrganizationSelector> = () => (
  <OrganizationSelector />
);

export const Default = Template.bind({});

Default.args = {};
