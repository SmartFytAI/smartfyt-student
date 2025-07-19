import { handleAuth } from '@kinde-oss/kinde-auth-nextjs/server';

export const GET = handleAuth({
  scope: 'openid profile email offline_access',
});

export const POST = handleAuth({
  scope: 'openid profile email offline_access',
});

export const PUT = handleAuth({
  scope: 'openid profile email offline_access',
});

export const DELETE = handleAuth({
  scope: 'openid profile email offline_access',
});
