import { render } from '@testing-library/react';

import MenuSidebarDropdown from '@/components/MenuSidebarDropdown';

const defaultItem = {
  title: 'Dashboard',
  children: [],
};

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'info').mockImplementation(() => {});
  jest.spyOn(console, 'debug').mockImplementation(() => {});
});

describe('MenuSidebarDropdown', () => {
  describe('when the MenuSidebar is closed', () => {
    it('Should not display the item text, the inner items and dropdown icon', () => {
      render(
        <MenuSidebarDropdown item={defaultItem} isMenuSidebarOpened={false} />
      );
    });
  });
  describe('when the MenuSidebar is opened', () => {
    it.todo('Should display the item text and dropdown icon by default');
    it.todo(
      'Should display the inner items and right arrow icon when dropdown is opened'
    );
  });
});
