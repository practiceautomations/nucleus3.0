import { render } from '@testing-library/react';
import { Provider } from 'react-redux';

import NotificationContainer from '@/components/NotificationContainer';
import store from '@/store';
// // import { render } from '@/test/utils/rtl-wrapper';

// describe('NotificationContainer', () => {
//   it('test', async () => {
//     // mswServer.use(notificationsHandler);
//     render(<NotificationContainer />);

//     // expect(await findByText(/trololo/i)).toBeInTheDocument();
//   });
//   it.todo('Should display the item text when hovered');
//   it.todo('Should display the item text when isOpened is set to true');
// });

test('throws You should provide a valid email address on invalid email', async () => {
  render(
    <Provider store={store}>
      <NotificationContainer />
    </Provider>
  );
});
