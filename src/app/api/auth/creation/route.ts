import { NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function createUserInAPI(user: any, token: string) {
  try {
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.given_name || '',
      lastName: user.family_name || '',
      profileImage: user.picture || `https://avatar.vercel.sh/${user.given_name || 'user'}`,
      username: user.email,
      roles: ['student'],
      activeRole: 'student',
    };

    console.log('Creating user in API:', userData);

    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API user creation failed:', response.status, errorText);
      throw new Error(`API responded with ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating user in API:', error);
    throw error;
  }
}

function getRedirectUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

export async function GET(_request: Request) {
  try {
    console.log('Starting user creation flow');
    const { getUser, isAuthenticated, getAccessToken } = getKindeServerSession();

    if (!(await isAuthenticated())) {
      console.log('User not authenticated');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUser();
    if (!user?.id) {
      console.error('Authentication failed: Invalid user data');
      throw new Error('Authentication failed: Invalid user data');
    }

    console.log('Authenticated user:', JSON.stringify(user, null, 2));

    // Get the JWT token to authenticate with our API
    const accessToken = await getAccessToken();
    if (!accessToken) {
      console.error('No access token available');
      throw new Error('No authentication token available');
    }

    try {
      // KindeAccessToken has the token string value
      const apiUser = await createUserInAPI(user, String(accessToken));
      console.log('User created/updated in API:', JSON.stringify(apiUser, null, 2));
      return NextResponse.redirect(new URL('/', getRedirectUrl()));
    } catch (error) {
      console.error('Error in createUserInAPI:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in user creation flow:', error);
    return NextResponse.json(
      {
        message: 'User creation failed',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
} 