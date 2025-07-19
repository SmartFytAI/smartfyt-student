import { handleAuth } from '@kinde-oss/kinde-auth-nextjs/server';

export const GET = handleAuth({
  scope: 'openid profile email offline_access',
});
