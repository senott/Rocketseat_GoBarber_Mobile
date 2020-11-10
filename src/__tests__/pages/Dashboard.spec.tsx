import React from 'react';
import { act, fireEvent, render, waitFor } from 'react-native-testing-library';

import Dashboard from '../../pages/Dashboard';

const mockedNavigate = jest.fn();

jest.mock('../../hooks/auth', () => {
  return {
    useAuth: () => ({
      user: {
        name: 'John Doe',
        email: 'john@example.com',
        avatar_url: 'http://avatar.address.com',
      },
    }),
  };
});

jest.mock('@react-navigation/native', () => {
  return {
    useNavigation: () => ({ navigate: mockedNavigate }),
  };
});

jest.mock('../../services/api', () => {
  return {
    get: () => {
      return Promise.resolve({
        data: [
          {
            id: '1',
            name: 'Jane Doe',
            avatar_url: 'http://example.com/avatar01.jpg',
          },
          {
            id: '2',
            name: 'Donald Trump',
            avatar_url: 'http://example.com/avatar02.jpg',
          },
          {
            id: '3',
            name: 'John Wicky',
            avatar_url: 'http://example.com/avatar03.jpg',
          },
        ],
      });
    },
  };
});

describe('Dashboard Page', () => {
  beforeEach(() => {
    mockedNavigate.mockClear();
  });

  it('should contain user name and providers', async () => {
    const { getByText } = render(<Dashboard />);

    await waitFor(() => {
      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('Cabeleireiros')).toBeTruthy();
      expect(getByText('Jane Doe')).toBeTruthy();
      expect(getByText('Donald Trump')).toBeTruthy();
      expect(getByText('John Wicky')).toBeTruthy();
    });
  });

  it('should be able to navigate to profile page', async () => {
    const { getByTestId } = render(<Dashboard />);

    const navigateButton = getByTestId('navigateToProfile');

    fireEvent.press(navigateButton);

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledTimes(1);
    });
  });

  it('should be able to navigate to create appointment page', async () => {
    const { getByText } = render(<Dashboard />);

    await waitFor(() => {
      const navigateButton = getByText('Donald Trump');

      fireEvent.press(navigateButton);

      expect(mockedNavigate).toHaveBeenCalledTimes(1);
    });
  });
});
