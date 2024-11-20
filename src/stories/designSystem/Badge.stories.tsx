import type { ComponentStory } from '@storybook/react';
import React from 'react';

import Badge from '@/components/UI/Badge';

export default {
  component: Badge,
  title: 'Design System/Atoms/Badge',
};

const Template: ComponentStory<typeof Badge> = (args) => <Badge {...args} />;

export const Default = Template.bind({});

Default.args = {
  text: 'Draft Claim',
  icon: 'desktop',
};
