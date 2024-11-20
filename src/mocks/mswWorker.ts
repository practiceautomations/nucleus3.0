/* eslint-disable import/no-extraneous-dependencies */
import { setupWorker } from 'msw';

import { handlers } from './handlers';

export const mswWorker = setupWorker(...handlers);
