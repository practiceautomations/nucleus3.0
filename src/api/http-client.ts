import type { AxiosRequestConfig } from 'axios';
import axios from 'axios';

/* eslint-disable-next-line */
import store from '@/store';
import { logoutSuccess } from '@/store/login/actions';

export const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;
export const documentBaseUrl = `${process.env.NEXT_PUBLIC_DOCUMENT_API_BASE_URL}`;

export const httpClient = axios.create({
  baseURL: baseUrl,
  timeout: 50000,
});

export const httpClientDocument = axios.create({
  baseURL: documentBaseUrl,
  timeout: 50000,
});

const onLogOut = () => {
  /* eslint-disable-next-line */
  store.dispatch(logoutSuccess());
};

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      onLogOut();
      window.location.href = '/login?deauthorized=1';
    }
    return Promise.reject(error);
  }
);

httpClientDocument.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      onLogOut();
    }
    return Promise.reject(error);
  }
);

export const updateToken = (token: string | boolean) => {
  if (typeof token === 'boolean') {
    httpClient.defaults.headers.common.Authorization = token;
    httpClientDocument.defaults.headers.common.Authorization = token;
  } else {
    httpClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    httpClientDocument.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
};

// Intercept the request and update token if not updated already
httpClient.interceptors.request.use(
  (config: AxiosRequestConfig<any>) => {
    const conf: AxiosRequestConfig<any> = config;
    if (!conf?.headers?.common || typeof conf.headers.common !== 'object') {
      // Check if headers.common exists and is an object
      return conf;
    }
    if (!('Authorization' in conf.headers.common)) {
      const { user } = store.getState().login;
      if (user && user.token) {
        const storedToken = user.token;
        conf.headers = {
          ...conf.headers,
          // eslint-disable-next-line prefer-object-spread
          common: Object.assign({}, conf.headers.common, {
            Authorization: `Bearer ${storedToken}`,
          }),
        };
      }
    }
    return conf;
  },
  (error) => Promise.reject(error)
);

httpClientDocument.interceptors.request.use(
  (config: AxiosRequestConfig<any>) => {
    const conf: AxiosRequestConfig<any> = config;
    if (!conf?.headers?.common || typeof conf.headers.common !== 'object') {
      return conf;
    }
    if (!('Authorization' in conf.headers.common)) {
      const { user } = store.getState().login;
      if (user && user.token) {
        const storedToken = user.token;
        conf.headers = {
          ...conf.headers,
          // eslint-disable-next-line prefer-object-spread
          common: Object.assign({}, conf.headers.common, {
            Authorization: `Bearer ${storedToken}`,
          }),
        };
      }
    }
    return conf;
  },
  (error) => Promise.reject(error)
);
