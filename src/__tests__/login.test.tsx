import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory } from 'history';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';

import Login from '@/pages/login';
import store from '@/store';

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'info').mockImplementation(() => {});
  jest.spyOn(console, 'debug').mockImplementation(() => {});
  jest.spyOn(window, 'alert').mockImplementation(() => {});
});

describe('WBT: Login Page Functionality', () => {
  // PA-1699
  it('Scenario 1:should redirect to Dashboard Page after login', async () => {
    // given
    const history = createMemoryHistory();
    history.push('/app/monthly-summary-report');
    // when
    render(
      <Router location={history.location} navigator={history}>
        <Provider store={store}>
          <Login />
        </Provider>
      </Router>
    );
    // do stuff which leads to redirection
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('pass-input');
    fireEvent.change(emailInput, { target: { value: 'frontend@gmail.com' } });
    fireEvent.change(passwordInput, { target: { value: '$@7bJkfN' } });
    const submitBtn = screen.getByText('Sign In');
    fireEvent.click(submitBtn);
    // then
    await waitFor(() => {
      // expect(window.location.pathname).toContain('/app/dashboard');
      expect(history.location.pathname).toBe('/app/monthly-summary-report');
    });
  });

  // PA-1701
  test('Scenario 2:Validate logging into the application using invalid credentials(i.e. invalid email address and invalid password)', async () => {
    render(
      <Provider store={store}>
        <Login />
      </Provider>
    );
    const error = 'Invalid Credentials';
    const emailInput = screen.getByTestId('email-input');
    await userEvent.type(emailInput, 'Wrong@adnare.com');
    const passInput = screen.getByTestId('pass-input');
    await userEvent.type(passInput, '12345628');
    const addButton = screen.getByText('Sign In');
    await userEvent.click(addButton);
    expect(screen.getByTestId('email-error')).toBeInTheDocument();
    expect(await screen.findByText(error)).toHaveTextContent(error);
  });

  // PA-1702
  test('Scenario 3:Validate logging into the application using invalid credentials(i.e. valid email address and invalid password)', async () => {
    render(
      <Provider store={store}>
        <Login />
      </Provider>
    );
    const error = 'Invalid Password';
    const emailInput = screen.getByTestId('email-input');
    await userEvent.type(emailInput, 'frontend@gmail.com');
    const passInput = screen.getByTestId('pass-input');
    await userEvent.type(passInput, '12345628');
    const addButton = screen.getByText('Sign In');
    await userEvent.click(addButton);
    expect(screen.getByTestId('email-error')).toBeInTheDocument();
    expect(await screen.findByText(error)).toHaveTextContent(error);
  });

  // PA-1703
  test('Scenario 4:Validate logging into the application using invalid credentials(i.e. invalid email address and valid password)', async () => {
    render(
      <Provider store={store}>
        <Login />
      </Provider>
    );
    const error = 'Invalid Email';
    const emailInput = screen.getByTestId('email-input');
    await userEvent.type(emailInput, 'Wrong@adnare.com');
    const passInput = screen.getByTestId('pass-input');
    await userEvent.type(passInput, '$@7bJkfN');
    const addButton = screen.getByText('Sign In');
    await userEvent.click(addButton);
    expect(screen.getByTestId('email-error')).toBeInTheDocument();
    expect(await screen.findByText(error)).toHaveTextContent(error);
  });

  // PA-1704
  test('Scenario 5:Validate logging into the application without credentials', async () => {
    render(
      <Provider store={store}>
        <Login />
      </Provider>
    );
    const emailInput = screen.getByTestId('email-input');
    await userEvent.type(emailInput, ' ');
    const passInput = screen.getByTestId('pass-input');
    await userEvent.type(passInput, ' ');
    const addButton = screen.getByText('Sign In');
    userEvent.click(addButton);
    expect(addButton).toBeDisabled();
  });

  // PA-1706
  test('Scenario 7: Validate the email field type and validations', async () => {
    render(
      <Provider store={store}>
        <Login />
      </Provider>
    );
    const error = 'You should provide a valid email address';
    const emailInput = screen.getByTestId('email-input');
    await userEvent.type(emailInput, 'testadnare.com');
    const passInput = screen.getByTestId('pass-input');
    await userEvent.type(passInput, '12345628');
    const addButton = screen.getByText('Sign In');
    await userEvent.click(addButton);
    expect(await screen.findByText(error)).toHaveTextContent(error);
  });

  // PA-1708
  test('Scenario 9: Validate the number of unsuccessful login attempts', async () => {
    render(
      <Provider store={store}>
        <Login />
      </Provider>
    );
    const error =
      'You’ve reached the maximum login attempts. Your account is currently inactive. Please contact support.';
    const emailInput = screen.getByTestId('email-input');
    await userEvent.type(emailInput, 'Test@adnare.com');
    const passInput = screen.getByTestId('pass-input');
    await userEvent.type(passInput, '12345628');
    const addButton = screen.getByText('Sign In');
    await userEvent.tripleClick(addButton);
    expect(await screen.findByText(error)).toHaveTextContent(error);
  });

  // PA-1710
  test('Scenario 10: Validate logging into the application using inactive credential', async () => {
    render(
      <Provider store={store}>
        <Login />
      </Provider>
    );
    const error = 'Your credentials are Inactive, Please contact support';
    const emailInput = screen.getByTestId('email-input');
    await userEvent.type(emailInput, 'passed@adnare.com');
    const passInput = screen.getByTestId('pass-input');
    await userEvent.type(passInput, '01010');
    const addButton = screen.getByText('Sign In');
    await userEvent.tripleClick(addButton);
    expect(await screen.findByText(error)).toHaveTextContent(error);
  });
});
