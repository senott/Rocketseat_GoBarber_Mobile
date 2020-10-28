import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, waitFor, act } from 'react-native-testing-library';
import SignUp from '../../pages/SignUp';

const mockedUsersPost = jest.fn();
const mockedAlert = jest.spyOn(Alert, 'alert');
const mockedGoBack = jest.fn();

jest.mock('../../services/api', () => {
  return {
    post: () => mockedUsersPost(),
  };
});

jest.mock('@react-navigation/native', () => {
  return {
    useNavigation: () => ({ goBack: mockedGoBack }),
  };
});

describe('SignUp Page', () => {
  beforeEach(() => {
    mockedUsersPost.mockClear();
    mockedGoBack.mockClear();
    mockedAlert.mockClear();
  });

  it('should be able to sign up', async () => {
    const { getByPlaceholder, getByText } = render(<SignUp />);

    const nameField = getByPlaceholder('Nome');
    const emailField = getByPlaceholder('E-mail');
    const passwordField = getByPlaceholder('Senha');
    const buttonElement = getByText('Cadastrar');

    act(() => {
      fireEvent.changeText(nameField, 'John Doe');
      fireEvent.changeText(emailField, 'johndoe@example.com');
      fireEvent.changeText(passwordField, '123456');

      fireEvent.press(buttonElement);
    });

    await waitFor(() => {
      expect(mockedGoBack).toHaveBeenCalledTimes(1);
      expect(mockedUsersPost).toHaveBeenCalledTimes(1);
      expect(mockedAlert).toHaveBeenCalledWith(
        'Cadastro realizado com sucesso',
        'Você já pode fazer login na aplicação.',
      );
    });
  });

  it('should be able to navigate and sign up by going to next elements', async () => {
    const { getByPlaceholder } = render(<SignUp />);

    const nameField = getByPlaceholder('Nome');
    const emailField = getByPlaceholder('E-mail');
    const passwordField = getByPlaceholder('Senha');

    act(() => {
      fireEvent.changeText(nameField, 'John Doe');
      fireEvent(nameField, 'onSubmitEditing');

      fireEvent.changeText(emailField, 'johndoe@example.com');
      fireEvent(emailField, 'onSubmitEditing');

      fireEvent.changeText(passwordField, '123456');
      fireEvent(passwordField, 'onSubmitEditing');
    });

    await waitFor(() => {
      expect(mockedGoBack).toHaveBeenCalledTimes(1);
      expect(mockedUsersPost).toHaveBeenCalledTimes(1);
      expect(mockedAlert).toHaveBeenCalledWith(
        'Cadastro realizado com sucesso',
        'Você já pode fazer login na aplicação.',
      );
    });
  });

  it('should not be able to sign up with invalid email', async () => {
    const { getByPlaceholder, getByText } = render(<SignUp />);

    const nameField = getByPlaceholder('Nome');
    const emailField = getByPlaceholder('E-mail');
    const passwordField = getByPlaceholder('Senha');
    const buttonElement = getByText('Cadastrar');

    act(() => {
      fireEvent.changeText(nameField, 'John Doe');
      fireEvent.changeText(emailField, 'invalid-email');
      fireEvent.changeText(passwordField, '123456');

      fireEvent.press(buttonElement);
    });

    await waitFor(() => {
      expect(mockedGoBack).not.toHaveBeenCalledTimes(1);
      expect(mockedUsersPost).not.toHaveBeenCalledTimes(1);
    });
  });

  it('should not be able to sign up with password length minor then 6 characters', async () => {
    const { getByPlaceholder, getByText } = render(<SignUp />);

    const nameField = getByPlaceholder('Nome');
    const emailField = getByPlaceholder('E-mail');
    const passwordField = getByPlaceholder('Senha');
    const buttonElement = getByText('Cadastrar');

    act(() => {
      fireEvent.changeText(nameField, 'John Doe');
      fireEvent.changeText(emailField, 'johndoe@example.com');
      fireEvent.changeText(passwordField, '123');

      fireEvent.press(buttonElement);
    });

    await waitFor(() => {
      expect(mockedGoBack).not.toHaveBeenCalledTimes(1);
      expect(mockedUsersPost).not.toHaveBeenCalledTimes(1);
    });
  });

  it('should display error when sign up fails', async () => {
    mockedUsersPost.mockImplementation(() => {
      throw new Error();
    });

    const { getByPlaceholder, getByText } = render(<SignUp />);

    const nameField = getByPlaceholder('Nome');
    const emailField = getByPlaceholder('E-mail');
    const passwordField = getByPlaceholder('Senha');
    const buttonElement = getByText('Cadastrar');

    act(() => {
      fireEvent.changeText(nameField, 'John Doe');
      fireEvent.changeText(emailField, 'johndoe@example.com');
      fireEvent.changeText(passwordField, '123456');

      fireEvent.press(buttonElement);
    });

    await waitFor(() => {
      expect(mockedAlert).toHaveBeenCalledWith(
        'Erro no cadastro',
        'Ocorreu um erro ao cadastrar o usuário, verifique as informações enviadas.',
      );
    });
  });

  it('should be able to go back to sign in page', async () => {
    const { getByText } = render(<SignUp />);

    const BackToSignInButton = getByText('Voltar para logon');

    fireEvent.press(BackToSignInButton);

    await waitFor(() => {
      expect(mockedGoBack).toHaveBeenCalledTimes(1);
    });
  });
});
