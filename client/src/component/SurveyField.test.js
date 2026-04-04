import React from 'react';
import { render, screen } from '@testing-library/react';
import SurveyField from './SurveyField';

describe('SurveyField Component', () => {
  const mockInput = {
    name: 'testfield',
    value: '',
    onChange: jest.fn(),
    onBlur: jest.fn()
  };

  const mockMeta = {
    touched: false,
    error: null
  };

  test('renders input field with label', () => {
    render(
      <SurveyField
        input={mockInput}
        label="Test Label"
        meta={mockMeta}
      />
    );
    
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Test Label')).toBeInTheDocument();
  });

  test('does not display error when not touched', () => {
    render(
      <SurveyField
        input={mockInput}
        label="Email"
        meta={{
          touched: false,
          error: 'This field is required'
        }}
      />
    );
    
    expect(screen.queryByText('This field is required')).not.toBeInTheDocument();
  });

  test('displays error when touched', () => {
    render(
      <SurveyField
        input={mockInput}
        label="Email"
        meta={{
          touched: true,
          error: 'Invalid email'
        }}
      />
    );
    
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  test('input has correct placeholder', () => {
    const input = screen.getByPlaceholderText('Test Label');
    expect(input).toHaveAttribute('placeholder', 'Test Label');
  });
});
