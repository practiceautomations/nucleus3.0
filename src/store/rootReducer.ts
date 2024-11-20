import { combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

import chromeReducer from './chrome/reducer';
import loginReducer from './login/reducer';
import sharedReducer from './shared/reducer';

const loginPersistConfig = {
  key: 'papm%$#Hdbh%&5*#%^s3',
  storage,
  whitelist: ['user', 'email', 'menuItems'],
};

const chromePersistConfig = {
  key: 'papm%$#Hbh%&5*#%^%%(#$^',
  storage,
  whitelist: ['workGroupsSelected'],
};

const rootReducer = combineReducers({
  chrome: persistReducer(chromePersistConfig, chromeReducer),
  login: persistReducer(loginPersistConfig, loginReducer),
  shared: sharedReducer,
});

export type AppState = ReturnType<typeof rootReducer>;

export default rootReducer;
