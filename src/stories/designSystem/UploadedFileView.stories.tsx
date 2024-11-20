import type { ComponentStory } from '@storybook/react';
import React from 'react';

import UploadedFileView from '@/components/UI/UploadedFileView';

export default {
  component: UploadedFileView,
  title: 'Design System/Atoms/UploadedFileView',
  argTypes: {
    onView: { action: 'clicked' },
    onDownload: { action: 'clicked' },
    onDelete: { action: 'clicked' },
  },
};

const Template: ComponentStory<typeof UploadedFileView> = (args) => (
  <UploadedFileView {...args} />
);

export const Default = Template.bind({});

Default.args = {
  fileName: 'Encounter_Notes.pdf',
  showViewButton: true,
  showDownloadButton: true,
  showDeleteButton: true,
};
