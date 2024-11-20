import type { Middleware } from '@reduxjs/toolkit';
import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import createSagaMiddleware from 'redux-saga';

import rootReducer from './rootReducer';
import { rootSaga } from './rootSaga';

// Create the saga middleware
const sagaMiddleware = createSagaMiddleware();

const middlewares: Middleware[] = [sagaMiddleware];
if (process.env.NODE_ENV !== 'production') middlewares.push(logger);

// Mount it on the Store
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(...middlewares),
});

// Run the saga
sagaMiddleware.run(rootSaga);

export default store;
