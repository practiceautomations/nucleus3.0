/* eslint-disable react/display-name */
/* eslint-disable import/no-extraneous-dependencies */
import { configureStore } from '@reduxjs/toolkit';
import type { RenderOptions } from '@testing-library/react';
import { render as rtlRender } from '@testing-library/react';
import * as React from 'react';
import { Provider } from 'react-redux';
import type { Store } from 'redux';
import createSagaMiddleware from 'redux-saga';

import type { AppState } from '@/store/rootReducer';
import rootReducer from '@/store/rootReducer';
import { rootSaga } from '@/store/rootSaga';

interface ExtendedRenderOptions extends RenderOptions {
  initialState: Partial<AppState>;
  store?: Store<Partial<AppState>>;
}

const TestWrapper =
  (store: Store) =>
  ({ children }: { children?: React.ReactNode }) =>
    <Provider store={store}>{children}</Provider>;

// Create the saga middleware
const sagaMiddleware = createSagaMiddleware();

const render = (
  component: React.ReactElement,
  {
    initialState,
    store = configureStore({
      reducer: rootReducer,
      preloadedState: initialState,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false }).concat(
          sagaMiddleware
        ),
    }),
    ...renderOptions
  }: ExtendedRenderOptions = {
    initialState: {
      /* any default state you want */
    },
  }
) => {
  // Run the saga
  sagaMiddleware.run(rootSaga);
  return rtlRender(component, {
    wrapper: TestWrapper(store),
    ...renderOptions,
  });
};

export * from '@testing-library/react';
// override the built-in render with our own
export { render };
