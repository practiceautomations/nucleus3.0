import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import '../src/styles/global.css';
import rootReducer from '../src/store/rootReducer';
import createSagaMiddleware from 'redux-saga';
import { rootSaga } from '../src/store/rootSaga';

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}

// Create the saga middleware
const sagaMiddleware = createSagaMiddleware();

const middlewares = [sagaMiddleware];

// Mount it on the Store
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(...middlewares),
});

// Run the saga
sagaMiddleware.run(rootSaga);

export const decorators = [
  (Story) => (
    <Provider store={store}>
      <div style={{ height: '100vh' }}>
        <Story />
      </div>
    </Provider>
  ),
];