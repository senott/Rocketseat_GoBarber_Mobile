import React from 'react';
import { Alert, Platform } from 'react-native';
import { ImagePickerResponse } from 'react-native-image-picker';
import { render, fireEvent, waitFor, act } from 'react-native-testing-library';

import Profile from '../../pages/Profile';

const mockedUsersPut = jest.fn();
const mockedUpdateUser = jest.fn();
const mockedUsersPatch = jest.fn();
const mockedAlert = jest.spyOn(Alert, 'alert');
const mockedNavigate = jest.fn();
const mockedGoBack = jest.fn();
const mockedSignOut = jest.fn();

let mockResponse: ImagePickerResponse = {
  customButton: '',
  didCancel: false,
  error: '',
  data:
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNUuz73PwAFYAKbSSNX6QAAAABJRU5ErkJggg==',
  uri: 'file://avatar.jpg',
  isVertical: false,
  width: 1,
  height: 1,
  fileSize: 70,
  type: 'image/jpeg',
};

jest.mock('../../hooks/auth', () => {
  return {
    useAuth: () => ({
      updateUser: () => mockedUpdateUser(),
      user: {
        name: 'John Doe',
        email: 'john@example.com',
        avatar_url: 'http://avatar.address.com',
      },
      signOut: () => mockedSignOut(),
    }),
  };
});

jest.mock('../../services/api', () => {
  return {
    put: () => mockedUsersPut(),
    patch: () => mockedUsersPatch(),
  };
});

jest.mock('@react-navigation/native', () => {
  return {
    useNavigation: () => ({ navigate: mockedNavigate, goBack: mockedGoBack }),
  };
});

jest.mock('react-native-image-picker', () => {
  return {
    showImagePicker: jest
      .fn()
      .mockImplementation((options, callback) => callback(mockResponse)),
    launchCamera: () => jest.fn(),
    launchImageLibrary: () => jest.fn(),
  };
});

// TODO: solve this warnings!!!
// jest.mock('global.FormData', () => {
//   return {
//     append: jest.fn(),
//   };
// });
function FormDataMock() {
  this.append = jest.fn();
}
global.FormData = FormDataMock;

describe('Profile Page', () => {
  beforeEach(() => {
    mockedUsersPut.mockClear();
    mockedUpdateUser.mockClear();
    mockedUsersPatch.mockClear();
    mockedAlert.mockClear();
    mockedNavigate.mockClear();
    mockedGoBack.mockClear();
    mockedSignOut.mockClear();
  });

  it('should be able to update profile with valid user name and email', async () => {
    mockedUsersPut.mockResolvedValue({
      data: {
        user: {
          name: 'John Doe II',
          email: 'johnII@example.com',
          avatar_url: 'http://avatar.address.com',
        },
      },
    });

    const { getByPlaceholder, getByText } = render(<Profile />);

    const nameField = getByPlaceholder('Nome');
    const emailField = getByPlaceholder('E-mail');
    const buttonElement = getByText('Confirmar mudanças');

    act(() => {
      fireEvent.changeText(nameField, 'John Doe II');
      fireEvent.changeText(emailField, 'johndoeII@example.com');

      fireEvent.press(buttonElement);
    });

    await waitFor(() => {
      expect(mockedUsersPut).toHaveBeenCalledTimes(1);
      expect(mockedUpdateUser).toHaveBeenCalledTimes(1);
      expect(mockedGoBack).toHaveBeenCalledTimes(1);
      expect(mockedAlert).toHaveBeenCalledWith('Perfil atualizado com sucesso');
    });
  });

  it('should be able to update profile by going to next elements', async () => {
    mockedUsersPut.mockResolvedValue({
      data: {
        user: {
          name: 'John Doe II',
          email: 'johnII@example.com',
          avatar_url: 'http://avatar.address.com',
        },
      },
    });

    const { getByPlaceholder, getByText } = render(<Profile />);

    const nameField = getByPlaceholder('Nome');
    const emailField = getByPlaceholder('E-mail');
    const currentPasswordField = getByPlaceholder('Senha atual');
    const passwordField = getByPlaceholder('Nova senha');
    const passwordConfirmationdField = getByPlaceholder('Confirmação senha');

    act(() => {
      fireEvent.changeText(nameField, 'John Doe II');
      fireEvent(nameField, 'onSubmitEditing');

      fireEvent.changeText(emailField, 'johndoeII@example.com');
      fireEvent(emailField, 'onSubmitEditing');

      fireEvent.changeText(currentPasswordField, '123456');
      fireEvent(currentPasswordField, 'onSubmitEditing');

      fireEvent.changeText(passwordField, '123123');
      fireEvent(passwordField, 'onSubmitEditing');

      fireEvent.changeText(passwordConfirmationdField, '123123');
      fireEvent(passwordConfirmationdField, 'onSubmitEditing');
    });

    await waitFor(() => {
      expect(mockedUsersPut).toHaveBeenCalledTimes(1);
      expect(mockedUpdateUser).toHaveBeenCalledTimes(1);
      expect(mockedGoBack).toHaveBeenCalledTimes(1);
      expect(mockedAlert).toHaveBeenCalledWith('Perfil atualizado com sucesso');
    });
  });

  it('should not be able to update profile with invalid user email', async () => {
    const { getByPlaceholder, getByText } = render(<Profile />);

    const nameField = getByPlaceholder('Nome');
    const emailField = getByPlaceholder('E-mail');
    const buttonElement = getByText('Confirmar mudanças');

    act(() => {
      fireEvent.changeText(nameField, 'John Doe II');
      fireEvent.changeText(emailField, 'johndoeIIexample.com');

      fireEvent.press(buttonElement);
    });

    await waitFor(() => {
      expect(mockedAlert).toHaveBeenCalledWith(
        'Erro na atualização do perfil',
        'Ocorreu um erro ao atualizar o perfil, verifique as informações enviadas.',
      );
      expect(mockedUsersPut).not.toHaveBeenCalled();
      expect(mockedUpdateUser).not.toHaveBeenCalled();
      expect(mockedGoBack).not.toHaveBeenCalled();
    });
  });

  it('should display error when profile update fails', async () => {
    mockedUsersPut.mockImplementation(() => {
      throw new Error();
    });

    const { getByPlaceholder, getByText } = render(<Profile />);

    const nameField = getByPlaceholder('Nome');
    const emailField = getByPlaceholder('E-mail');
    const buttonElement = getByText('Confirmar mudanças');

    act(() => {
      fireEvent.changeText(nameField, 'John Doe II');
      fireEvent.changeText(emailField, 'johndoeII@example.com');

      fireEvent.press(buttonElement);
    });

    await waitFor(() => {
      expect(mockedAlert).toHaveBeenCalledWith(
        'Erro na atualização do perfil',
        'Ocorreu um erro ao atualizar o perfil, verifique as informações enviadas.',
      );
    });
  });

  it('should be able to update user password', async () => {
    mockedUsersPut.mockResolvedValue({
      data: {
        user: {
          name: 'John Doe II',
          email: 'johnII@example.com',
          avatar_url: 'http://avatar.address.com',
        },
      },
    });
    const { getByPlaceholder, getByText } = render(<Profile />);

    const currentPasswordField = getByPlaceholder('Senha atual');
    const passwordField = getByPlaceholder('Nova senha');
    const passwordConfirmationdField = getByPlaceholder('Confirmação senha');

    const buttonElement = getByText('Confirmar mudanças');

    act(() => {
      fireEvent.changeText(currentPasswordField, '123456');
      fireEvent.changeText(passwordField, '123123');
      fireEvent.changeText(passwordConfirmationdField, '123123');

      fireEvent.press(buttonElement);
    });

    await waitFor(() => {
      expect(mockedUsersPut).toHaveBeenCalledTimes(1);
      expect(mockedUpdateUser).toHaveBeenCalledTimes(1);
      expect(mockedGoBack).toHaveBeenCalledTimes(1);
      expect(mockedAlert).toHaveBeenCalledWith('Perfil atualizado com sucesso');
    });
  });

  it('should not be able to update user password with wrong password confirmation', async () => {
    const { getByPlaceholder, getByText } = render(<Profile />);

    const currentPasswordField = getByPlaceholder('Senha atual');
    const passwordField = getByPlaceholder('Nova senha');
    const passwordConfirmationdField = getByPlaceholder('Confirmação senha');

    const buttonElement = getByText('Confirmar mudanças');

    act(() => {
      fireEvent.changeText(currentPasswordField, '123456');
      fireEvent.changeText(passwordField, '123123');
      fireEvent.changeText(passwordConfirmationdField, '123456');

      fireEvent.press(buttonElement);
    });

    await waitFor(() => {
      expect(mockedAlert).toHaveBeenCalledWith(
        'Erro na atualização do perfil',
        'Ocorreu um erro ao atualizar o perfil, verifique as informações enviadas.',
      );
      expect(mockedUsersPut).not.toHaveBeenCalled();
      expect(mockedUpdateUser).not.toHaveBeenCalled();
      expect(mockedGoBack).not.toHaveBeenCalled();
    });
  });

  // TODO
  it('should be able to update user avatar', async () => {
    mockedUsersPatch.mockResolvedValue({
      data: {
        user: {
          name: 'John Doe II',
          email: 'johnII@example.com',
          avatar_url: 'http://avatar.address.com',
        },
      },
    });

    const { getByTestId } = render(<Profile />);

    const avatarField = getByTestId('avatar');

    fireEvent.press(avatarField);

    await waitFor(() => {
      expect(mockedUsersPatch).toHaveBeenCalledTimes(1);
      expect(mockedUpdateUser).toHaveBeenCalledTimes(1);
    });
  });

  it('should be able to update user avatar on Android', async () => {
    Platform.OS = 'android';

    mockedUsersPatch.mockResolvedValue({
      data: {
        user: {
          name: 'John Doe II',
          email: 'johnII@example.com',
          avatar_url: 'http://avatar.address.com',
        },
      },
    });

    const { getByTestId } = render(<Profile />);

    const avatarField = getByTestId('avatar');

    fireEvent.press(avatarField);

    await waitFor(() => {
      expect(mockedUsersPatch).toHaveBeenCalledTimes(1);
      expect(mockedUpdateUser).toHaveBeenCalledTimes(1);
    });
  });

  it('should do nothing when user cancels file selection', async () => {
    mockResponse = {
      customButton: '',
      didCancel: true,
      error: '',
      data: '',
      uri: '',
      isVertical: false,
      width: 1,
      height: 1,
      fileSize: 70,
      type: 'image/jpeg',
    };

    const { getByTestId } = render(<Profile />);

    const avatarField = getByTestId('avatar');

    fireEvent.press(avatarField);

    await waitFor(() => {
      expect(mockedUsersPatch).not.toHaveBeenCalledTimes(1);
      expect(mockedUpdateUser).not.toHaveBeenCalledTimes(1);
    });
  });

  it('should show error message when update user avatar fails', async () => {
    mockResponse = {
      customButton: '',
      didCancel: false,
      error: 'Error message.',
      data: '',
      uri: '',
      isVertical: false,
      width: 1,
      height: 1,
      fileSize: 70,
      type: 'image/jpeg',
    };

    const { getByTestId } = render(<Profile />);

    const avatarField = getByTestId('avatar');

    fireEvent.press(avatarField);

    await waitFor(() => {
      expect(mockedAlert).toHaveBeenCalledWith('Erro ao atualizar seu avatar.');
    });
  });

  it('should be able to go back to dashboard page', async () => {
    const { getByTestId } = render(<Profile />);

    const goBackButton = getByTestId('backButton');

    fireEvent.press(goBackButton);

    await waitFor(() => {
      expect(mockedGoBack).toHaveBeenCalledTimes(1);
    });
  });

  it('should be able to sign out', async () => {
    const { getByTestId } = render(<Profile />);

    const signOutButton = getByTestId('signOutButton');

    fireEvent.press(signOutButton);

    await waitFor(() => {
      expect(mockedSignOut).toHaveBeenCalledTimes(1);
    });
  });
});
