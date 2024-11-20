import type { ComponentStory } from '@storybook/react';
import React from 'react';
import { useDispatch } from 'react-redux';

import ContentSidebar from '@/components/ContentSidebar';
import {
  setSidebarContent,
  toggleContentSidebar,
} from '@/store/shared/actions';

export default {
  component: ContentSidebar,
  title: 'PAPM/Shared/ContentSidebar',
};

const ExampleComponent = () => {
  return (
    <div className="p-10 text-center">
      This is a custom content for the sidebar
    </div>
  );
};

const Template: ComponentStory<typeof ContentSidebar> = (args: any) => {
  const dispatch = useDispatch();
  const handleClick = () => {
    dispatch(toggleContentSidebar());
    dispatch(setSidebarContent({ content: ExampleComponent }));
  };

  return (
    <>
      <button
        className="h-12 w-full rounded-md border border-transparent bg-cyan-600 px-3 text-base font-medium text-white hover:bg-cyan-700"
        onClick={handleClick}
      >
        Toggle Sidebar
      </button>
      <ContentSidebar {...args} />
    </>
  );
};

export const Default = Template.bind({});

Default.args = {};
