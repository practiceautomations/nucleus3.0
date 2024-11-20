import type { AxiosError, AxiosResponse } from 'axios';

export const handleApiStatus = (error: any, message: any) => {
  switch (error) {
    case 400:
      return message || `Something went wrong`;
    case 401:
      return 'Unauthorized: Access is denied';
    case 403:
      return `Forbidden.`;
    case 404:
      return `Not Found.`;
    case 406:
      return `Not Acceptable.`;
    case 408:
      return `Request Timeout`;
    default:
      return 'Unknown api error';
  }
};

export const handleApiError = (error: AxiosError<any>) => {
  if (error && error.response && error.response.status) {
    const message = handleApiStatus(
      error.response.status,
      error.response.data.errors || error.response.data.message
    );
    if (message) return message;
  }

  switch (error.code) {
    case 'ERR_NETWORK':
      return 'Network not available.';
    case 'CONNECTION_ERROR':
      return 'Server not available.';
    case 'ECONNABORTED':
      return "Server didn't respond in time.";
    case 'SERVER_ERROR':
      return `Unexpected server error`;
    case 'CLIENT_ERROR':
      return (
        error.response?.data.message ||
        error.response?.data.errors ||
        `Unexpected client error`
      );
    case 'ERR_BAD_REQUEST':
      return (
        error.response?.data.message ||
        error.response?.data.errors ||
        `Unknown api error`
      );
    case 'ERR_CANCELED':
      return `Token canceled`;
    case 'ETIMEDOUT':
      return `Time out error`;
    default:
      return 'Unknown api error';
  }
};

export const validateResponse = (response: AxiosResponse<any>) => {
  if (response.status !== 200) {
    const message = handleApiStatus(response.status, undefined);
    if (message) throw new Error(message);
  }
};
