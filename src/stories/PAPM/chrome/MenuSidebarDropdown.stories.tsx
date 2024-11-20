import type { ComponentStory } from '@storybook/react';
import React from 'react';

import MenuSidebarDropdown from '@/components/MenuSidebarDropdown';

export default {
  component: MenuSidebarDropdown,
  title: 'PAPM/Chrome/MenuSidebarDropdown',
};

const Template: ComponentStory<typeof MenuSidebarDropdown> = (args) => (
  <MenuSidebarDropdown {...args} />
);

export const Default = Template.bind({});

Default.args = {
  item: {
    title: 'Dashboard',
    children: [
      { title: 'Dashboard child 1', link: '/' },
      { title: 'Dashboard child 2', link: '/' },
      { title: 'Dashboard child 3', link: '/' },
    ],
  },
};
