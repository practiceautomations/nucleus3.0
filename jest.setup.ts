// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`
import '@testing-library/jest-dom/extend-expect';
import '@testing-library/react';

import { mswServer } from './src/mocks/mswServer';

// Establish API mocking before all tests.
beforeAll(() => mswServer.listen());
// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => mswServer.resetHandlers());
// Clean up after the tests are finished.
afterAll(() => mswServer.close());
