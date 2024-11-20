import type { ComponentStory } from '@storybook/react';
import React, { useState } from 'react';

import Button from '@/components/UI/Button';
import Modal from '@/components/UI/Modal';

export default {
  component: Modal,
  title: 'Design System/Atoms/Modal',
};

const Template: ComponentStory<typeof Modal> = (args: any) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal {...args} open={isOpen} onClose={() => setIsOpen(false)}>
        <div className="rounded-lg bg-white p-4">
          This is a custom modal content, click outside the div to close it
        </div>
      </Modal>
    </>
  );
};

export const Default = Template.bind({});

Default.args = {};
