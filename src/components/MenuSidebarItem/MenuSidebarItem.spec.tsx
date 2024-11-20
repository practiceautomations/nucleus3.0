import { render } from '@testing-library/react';

import MenuSidebarItem from '@/components/MenuSidebarItem';

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'info').mockImplementation(() => {});
  jest.spyOn(console, 'debug').mockImplementation(() => {});
});

const defaultItem = {
  title: 'Dashboard',
  link: 'test',
};

describe('MenuSidebarItem', () => {
  it('Should not display the item text when not hovered', () => {
    render(<MenuSidebarItem item={defaultItem} />);
  });
  it.todo('Should display the item text when hovered');
  it.todo('Should display the item text when isOpened is set to true');
});
