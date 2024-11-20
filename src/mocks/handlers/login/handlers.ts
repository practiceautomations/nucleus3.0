/* eslint-disable import/no-extraneous-dependencies */
import { rest } from 'msw';

import config from '../config';

const mockUser = {
  name: 'Dr. Phil',
  role: 'Doctor',
  token: 'TOKEN',
};

// Attention to match the URL to avois breaking the tests
const loginPath = `${config.baseUrl}/api/Users/signIn`;

const loginHandler = rest.post(loginPath, async (req, res, ctx) => {
  const data = await req.json();
  if (data.email === 'phil@gmail.com')
    return res(ctx.status(200), ctx.json(mockUser));
  return res(
    ctx.status(400),
    ctx.json({ error: 'Invalid email or password.' })
  );
});

export const loginHandlerException = rest.get(loginPath, async (_, res, ctx) =>
  res(ctx.status(500), ctx.json({ message: 'Deliberately broken request' }))
);

export const handlers = loginHandler;
