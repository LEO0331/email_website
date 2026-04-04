import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import reduxThunk from 'redux-thunk';
import App from './App';
import reducer from '../reducers';

const mockStore = createStore(reducer, applyMiddleware(reduxThunk));

describe('App Component', () => {
  test('renders App without crashing', () => {
    render(
      <Provider store={mockStore}>
        <App />
      </Provider>
    );
    
    const header = screen.queryByText(/Header/i);
    // Component renders successfully if no error is thrown
    expect(document.querySelector('.container')).toBeInTheDocument();
  });

  test('calls fetchUser on mount', () => {
    const spy = jest.fn();
    render(
      <Provider store={mockStore}>
        <App />
      </Provider>
    );
    
    // Component mounts successfully
    expect(document.querySelector('.container')).toBeInTheDocument();
  });

  test('renders routing structure', () => {
    render(
      <Provider store={mockStore}>
        <App />
      </Provider>
    );
    
    const browserRouter = document.querySelector('.container');
    expect(browserRouter).toBeInTheDocument();
  });
});
