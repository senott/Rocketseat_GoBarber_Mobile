import React from 'react';
import { Alert, Platform } from 'react-native';
import { fireEvent, render, waitFor } from 'react-native-testing-library';
import { act } from 'react-test-renderer';

import SignIn from '../../pages/SignIn';

const mockedSignIn = jest.fn();
const mockedAlert = jest.spyOn(Alert, 'alert');
const mockedNavigate = jest.fn();

jest.mock('@react-navigation/native', () => {
  return {
    useNavigation: () => ({ navigate: mockedNavigate }),
  };
});

jest.mock('../../hooks/auth', () => {
  return { useAuth: () => ({ signIn: mockedSignIn }) };
});

describe('SigIn Page', () => {
  beforeEach(() => {
    mockedSignIn.mockClear();
    mockedAlert.mockClear();
    mockedNavigate.mockClear();
  });

  it('should contain email, password and button components', () => {
    const { getByPlaceholder, getByText } = render(<SignIn />);

    expect(getByPlaceholder('E-mail')).toBeTruthy();
    expect(getByPlaceholder('Senha')).toBeTruthy();
    expect(getByText('Entrar')).toBeTruthy();
  });

  it('should contain email, password and button components on Android', () => {
    Platform.OS = 'android';

    const { getByPlaceholder, getByText } = render(<SignIn />);

    expect(getByPlaceholder('E-mail')).toBeTruthy();
    expect(getByPlaceholder('Senha')).toBeTruthy();
    expect(getByText('Entrar')).toBeTruthy();
  });

  it('should be able to sign in', async () => {
    const { getByPlaceholder, getByText } = render(<SignIn />);

    const emailInput = getByPlaceholder('E-mail');
    const passwordInput = getByPlaceholder('Senha');
    const buttonElement = getByText('Entrar');

    act(() => {
      fireEvent.changeText(emailInput, 'johndoe@example.com');
      fireEvent.changeText(passwordInput, '123456');
      fireEvent.press(buttonElement);
    });

    await waitFor(() => {
      expect(mockedSignIn).toHaveBeenCalledTimes(1);
    });
  });

  it('should be able to navigate and sign in by going to next element', async () => {
    const { getByPlaceholder } = render(<SignIn />);

    const emailInput = getByPlaceholder('E-mail');
    const passwordInput = getByPlaceholder('Senha');

    act(() => {
      fireEvent.changeText(emailInput, 'johndoe@example.com');
      fireEvent(emailInput, 'onSubmitEditing');
      fireEvent.changeText(passwordInput, '123456');
      fireEvent(passwordInput, 'onSubmitEditing');
    });

    await waitFor(() => {
      expect(mockedSignIn).toHaveBeenCalledTimes(1);
    });
  });

  it('should not be able to sign in with invalid email', async () => {
    const { getByPlaceholder, getByText } = render(<SignIn />);

    const emailInput = getByPlaceholder('E-mail');
    const passwordInput = getByPlaceholder('Senha');
    const buttonElement = getByText('Entrar');

    act(() => {
      fireEvent.changeText(emailInput, 'invalid-email');
      fireEvent.changeText(passwordInput, '123456');
      fireEvent.press(buttonElement);
    });

    await waitFor(() => {
      expect(mockedSignIn).not.toHaveBeenCalled();
    });
  });

  it('should display error when login fails', async () => {
    mockedSignIn.mockImplementation(() => {
      throw new Error();
    });

    const { getByPlaceholder, getByText } = render(<SignIn />);

    const emailInput = getByPlaceholder('E-mail');
    const passwordInput = getByPlaceholder('Senha');
    const buttonElement = getByText('Entrar');

    act(() => {
      fireEvent.changeText(emailInput, 'johndoe@example.com');
      fireEvent.changeText(passwordInput, '123456');
      fireEvent.press(buttonElement);
    });

    await waitFor(() => {
      expect(mockedAlert).toHaveBeenCalledTimes(1);
    });
  });

  it('should be able to navigate to sign up page', async () => {
    const { getByText } = render(<SignIn />);

    const createAccountButton = getByText('Criar conta');

    fireEvent.press(createAccountButton);

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith('SignUp');
    });
  });

  it('should be able to navigate to forgot password page', async () => {
    const { getByText } = render(<SignIn />);

    const forgotPasswordButton = getByText('Esqueci a senha');

    fireEvent.press(forgotPasswordButton);

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith('ForgotPassword');
    });
  });
});
