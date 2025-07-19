import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { NextResponse } from 'next/server';

import { authLogger } from '@/lib/logger';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function createOrHandleExistingUser(user: any, token: string) {
  try {
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.given_name || '',
      lastName: user.family_name || '',
      profileImage:
        user.picture || `https://avatar.vercel.sh/${user.given_name || 'user'}`,
      username: user.email,
    };

    authLogger.debug('Attempting to create user with data:', userData);

    // Use POST to create user
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    if (response.status === 409) {
      // User already exists - this is fine for login
      authLogger.info('User already exists in API - proceeding with login');
      return { success: true, message: 'User already exists' };
    }

    if (!response.ok) {
      const errorText = await response.text();
      authLogger.error('API user creation failed:', response.status, errorText);
      throw new Error(`API responded with ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    authLogger.info('User created successfully in API');
    return result;
  } catch (error) {
    authLogger.error('Error in createOrHandleExistingUser:', error);
    throw error;
  }
}

function getRedirectUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  authLogger.debug('Using base URL:', baseUrl);
  return baseUrl;
}

export const dynamic = 'force-dynamic';

export async function GET(_request: Request) {
  try {
    authLogger.info('🚀 Starting post-login user sync');
    const { getUser, isAuthenticated, getAccessToken } =
      getKindeServerSession();

    if (!(await isAuthenticated())) {
      authLogger.warn('🚫 User not authenticated in post-login flow');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUser();
    if (!user?.id) {
      authLogger.error('❌ Authentication failed: Invalid user data');
      throw new Error('Authentication failed: Invalid user data');
    }

    authLogger.debug(
      '👤 Authenticated user in post-login flow:',
      JSON.stringify(user, null, 2)
    );

    // Get the JWT token to authenticate with our API
    const accessToken = await getAccessToken();
    if (!accessToken) {
      authLogger.error('🔑 No access token available');
      throw new Error('No authentication token available');
    }

    try {
      const result = await createOrHandleExistingUser(
        user,
        String(accessToken)
      );
      authLogger.info('✅ User sync completed:', result);

      const redirectUrl = getRedirectUrl();
      const dashboardUrl = new URL('/dashboard', redirectUrl);
      authLogger.debug('🏠 Redirecting to dashboard:', {
        dashboardUrl: dashboardUrl.toString(),
      });

      return NextResponse.redirect(dashboardUrl);
    } catch (error) {
      authLogger.error('❌ Error in createOrHandleExistingUser:', error);
      throw error;
    }
  } catch (error) {
    authLogger.error('💥 Error in post-login flow:', error);
    return NextResponse.json(
      {
        message: 'User sync failed',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
