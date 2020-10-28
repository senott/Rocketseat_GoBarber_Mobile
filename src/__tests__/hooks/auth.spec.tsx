import AsyncStorage from '@react-native-community/async-storage';
import { renderHook } from '@testing-library/react-hooks';
import MockAdapter from 'axios-mock-adapter';
import { AuthProvider, useAuth } from '../../hooks/auth';
import api from '../../services/api';

const apiMock = new MockAdapter(api);

describe('Auth hook', () => {
  it('should be able to sign in', async () => {
    apiMock.onPost('/sessions').reply(200, {
      user: { id: '123user', name: 'John Doe', email: 'johndoe@example.com' },
      token: '123token',
    });

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    result.current.signIn({ email: 'johndoe@example.com', password: '123456' });

    await waitForNextUpdate();

    expect(result.current.user.email).toEqual('johndoe@example.com');
  });

  it('should store user and token in local storage after sign in', async () => {
    const apiResponse = {
      user: { id: '123user', name: 'John Doe', email: 'johndoe@example.com' },
      token: '123token',
    };

    apiMock.onPost('/sessions').reply(200, apiResponse);

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    const setItemSpy = jest.spyOn(AsyncStorage, 'multiSet');

    result.current.signIn({
      email: 'johndoe@example.com',
      password: '123456',
    });

    await waitForNextUpdate();

    expect(setItemSpy).toHaveBeenCalledWith([
      ['@GoBarber:token', apiResponse.token],
      ['@GoBarber:user', JSON.stringify(apiResponse.user)],
    ]);
  });

  it('should restore saved user from storage when exists and auth initializes', async () => {
    jest.spyOn(AsyncStorage, 'multiGet').mockImplementation(() => {
      return Promise.resolve([
        ['@GoBarber:token', '123token'],
        [
          '@GoBarber:user',
          JSON.stringify({
            id: '123user',
            name: 'John Doe',
            email: 'johndoe@example.com',
          }),
        ],
      ]);
    });

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitForNextUpdate();

    expect(result.current.user.email).toEqual('johndoe@example.com');
  });

  it('should be able to sign out', async () => {
    jest.spyOn(AsyncStorage, 'multiGet').mockImplementation(() => {
      return Promise.resolve([
        ['@GoBarber:token', '123token'],
        [
          '@GoBarber:user',
          JSON.stringify({
            id: '123user',
            name: 'John Doe',
            email: 'johndoe@example.com',
          }),
        ],
      ]);
    });

    const removeItemSpy = jest.spyOn(AsyncStorage, 'multiRemove');

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    result.current.signOut();

    await waitForNextUpdate();

    expect(removeItemSpy).toHaveBeenCalledTimes(1);
  });

  it('should be able to update user data', async () => {
    const setItemSpy = jest.spyOn(AsyncStorage, 'setItem');

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    const user = {
      id: '123user',
      name: 'John Doe',
      email: 'johndoe@example.com',
      avatar_url: '',
    };

    result.current.updateUser(user);

    await waitForNextUpdate();

    expect(setItemSpy).toHaveBeenCalledWith(
      '@GoBarber:user',
      JSON.stringify(user),
    );
  });
});
