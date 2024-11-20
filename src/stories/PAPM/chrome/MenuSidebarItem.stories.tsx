import type { ComponentStory } from '@storybook/react';
import React from 'react';

import MenuSidebarItem from '@/components/MenuSidebarItem';

export default {
  component: MenuSidebarItem,
  title: 'PAPM/Chrome/MenuSidebarItem',
};

const Template: ComponentStory<typeof MenuSidebarItem> = (args) => (
  <MenuSidebarItem {...args} />
);

export const Default = Template.bind({});

Default.args = {
  item: {
    title: 'Dashboard',
    link: '/',
  },
};
