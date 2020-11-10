import React from 'react';
import { fireEvent, render, waitFor } from 'react-native-testing-library';

import AppointmentCreated from '../../pages/AppointmentCreated';

const mockedGoBack = jest.fn();
const mockedReset = jest.fn();

jest.mock('@react-navigation/native', () => {
  return {
    useNavigation: () => ({ goBack: mockedGoBack, reset: mockedReset }),
    useRoute: () => ({ params: { date: new Date() } }),
  };
});

describe('Appointment Created Page', () => {
  beforeEach(() => {
    mockedGoBack.mockClear();
    mockedReset.mockClear();
  });

  it('should contain success message and button components', () => {
    const { getByText } = render(<AppointmentCreated />);

    expect(getByText('Ok')).toBeTruthy();
    expect(getByText('Agendamento concluído')).toBeTruthy();
  });

  it('should be able to navigate to sign in page', async () => {
    const { getByText } = render(<AppointmentCreated />);

    const okButton = getByText('Ok');

    fireEvent.press(okButton);

    await waitFor(() => {
      expect(mockedReset).toHaveBeenCalledTimes(1);
    });
  });
});
