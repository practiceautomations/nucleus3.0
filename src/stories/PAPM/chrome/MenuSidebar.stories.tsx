import type { ComponentStory } from '@storybook/react';
import React from 'react';

import MenuSidebar from '@/components/MenuSidebar';

export default {
  component: MenuSidebar,
  title: 'PAPM/Chrome/MenuSidebar',
};

const Template: ComponentStory<typeof MenuSidebar> = (args) => (
  <MenuSidebar {...args} />
);

export const Default = Template.bind({});

const fakeItems = [
  {
    title: 'Dashboard',
    icon: 'chartBar',
    link: '/dashboard',
  },
  {
    title: 'Claims',
    icon: 'documentText',
    children: [
      { title: 'Claims child 1', link: '/claims' },
      { title: 'Claims child 2', link: '/claims' },
      { title: 'Claims child 3', link: '/claims' },
    ],
  },
  {
    title: 'Remittance',
    icon: 'currencyDolar',
    link: '/remittance',
  },
  {
    title: 'Reports',
    icon: 'clipboard',
    link: '/reports',
  },
];

Default.args = {
  items: fakeItems,
};

Default.parameters = {
  docs: {
    iframeHeight: 600,
  },
};
