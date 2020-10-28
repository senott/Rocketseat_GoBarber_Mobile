import { fireEvent, render, waitFor, act } from 'react-native-testing-library';
import React from 'react';
import 'jest-styled-components/native';

import Input from '../../components/Input';

jest.mock('@unform/core', () => {
  return {
    useField() {
      return {
        fieldName: 'email',
        defaultValue: '',
        error: '',
        registerField: jest.fn(),
      };
    },
  };
});

describe('Input component', () => {
  it('should be able to render input', () => {
    const { getByPlaceholder } = render(
      <Input name="email" icon="mail" placeholder="E-mail" />,
    );

    expect(getByPlaceholder('E-mail')).toBeTruthy();
  });

  it('should be highlighted when focused and back to normal on blur', async () => {
    const { getByTestId, getByPlaceholder } = render(
      <Input name="email" icon="mail" placeholder="E-mail" />,
    );

    const inputElement = getByPlaceholder('E-mail');
    const containerElement = getByTestId('input-email');

    fireEvent(inputElement, 'onFocus');

    await waitFor(() => {
      expect(containerElement).toHaveStyleRule('border-color', '#ff9000');
    });

    fireEvent(inputElement, 'onBlur');

    await waitFor(() => {
      expect(containerElement).not.toHaveStyleRule('border-color', '#ff9000');
    });
  });

  it('should keep icon highlighted when filled', () => {
    const { getByTestId, getByPlaceholder } = render(
      <Input name="email" icon="mail" placeholder="E-mail" />,
    );

    const inputElement = getByPlaceholder('E-mail');

    fireEvent.changeText(inputElement, 'johndoe@example.com');

    fireEvent(inputElement, 'onBlur');

    expect(getByTestId('input-email-icon')).toHaveStyleRule('color', '#ff9000');
  });

  // TODO: setValue and clearValue tests
  // Property 'toHaveStyleRule' does not exist on type 'JestMatchersShape<Matchers<void, ReactTestInstance>, Matchers<Promise<void>, ReactTestInstance>>'
});
