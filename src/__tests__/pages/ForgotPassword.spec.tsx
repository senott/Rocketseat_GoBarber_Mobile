import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from 'react-native-testing-library';
import { act } from 'react-test-renderer';

import ForgotPassword from '../../pages/ForgotPassword';

const mockedForgotPassword = jest.fn();
const mockedAlert = jest.spyOn(Alert, 'alert');
const mockedNavigate = jest.fn();

jest.mock('@react-navigation/native', () => {
  return {
    useNavigation: () => ({ goBack: mockedNavigate }),
  };
});

jest.mock('../../services/api', () => {
  return {
    post: () => mockedForgotPassword(),
  };
});

describe('Forgot Password Page', () => {
  beforeEach(() => {
    mockedForgotPassword.mockClear();
    mockedAlert.mockClear();
    mockedNavigate.mockClear();
  });

  it('should contain email and button components', () => {
    const { getByPlaceholder, getByText } = render(<ForgotPassword />);

    expect(getByPlaceholder('E-mail')).toBeTruthy();
    expect(getByText('Recuperar senha')).toBeTruthy();
  });

  it('should be able to request password reset', async () => {
    const { getByPlaceholder, getByText } = render(<ForgotPassword />);

    const emailInput = getByPlaceholder('E-mail');
    const buttonElement = getByText('Recuperar senha');

    act(() => {
      fireEvent.changeText(emailInput, 'johndoe@example.com');
      fireEvent.press(buttonElement);
    });

    await waitFor(() => {
      expect(mockedForgotPassword).toHaveBeenCalledTimes(1);
    });
  });

  it('should be able to navigate and sign in by going to next element', async () => {
    const { getByPlaceholder } = render(<ForgotPassword />);

    const emailInput = getByPlaceholder('E-mail');

    act(() => {
      fireEvent.changeText(emailInput, 'johndoe@example.com');
      fireEvent(emailInput, 'onSubmitEditing');
    });

    await waitFor(() => {
      expect(mockedForgotPassword).toHaveBeenCalledTimes(1);
    });
  });

  it('should not be able to reset password with invalid email', async () => {
    const { getByPlaceholder, getByText } = render(<ForgotPassword />);

    const emailInput = getByPlaceholder('E-mail');
    const buttonElement = getByText('Recuperar senha');

    act(() => {
      fireEvent.changeText(emailInput, 'invalid-email');
      fireEvent.press(buttonElement);
    });

    await waitFor(() => {
      expect(mockedForgotPassword).not.toHaveBeenCalled();
    });
  });

  it('should display error when reset password fails', async () => {
    mockedForgotPassword.mockImplementation(() => {
      throw new Error();
    });

    const { getByPlaceholder, getByText } = render(<ForgotPassword />);

    const emailInput = getByPlaceholder('E-mail');
    const buttonElement = getByText('Recuperar senha');

    act(() => {
      fireEvent.changeText(emailInput, 'johndoe@example.com');
      fireEvent.press(buttonElement);
    });

    await waitFor(() => {
      expect(mockedAlert).toHaveBeenCalledTimes(1);
    });
  });

  it('should be able to navigate to sign in page', async () => {
    const { getByText } = render(<ForgotPassword />);

    const createAccountButton = getByText('Voltar para logon');

    fireEvent.press(createAccountButton);

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledTimes(1);
    });
  });
});
