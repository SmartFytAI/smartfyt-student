import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs';
import { useEffect } from 'react';

import { authLogger } from '@/lib/logger';

export interface AuthUser {
  id: string;
  email: string;
  given_name?: string | null;
  family_name?: string | null;
  picture?: string | null;
  name?: string;
}

export function useAuth() {
  const { user, isLoading, isAuthenticated, getToken } = useKindeAuth();

  // Debug logging for auth state changes
  useEffect(() => {
    authLogger.debug('Auth state changed:', {
      isLoading,
      isAuthenticated,
      hasUser: !!user,
      userId: user?.id,
    });
  }, [isLoading, isAuthenticated, user]);

  // Transform Kinde user to our auth user format
  const authUser: AuthUser | null = user
    ? {
        id: user.id,
        email: user.email || '',
        given_name: user.given_name,
        family_name: user.family_name,
        picture: user.picture,
        name:
          user.given_name && user.family_name
            ? `${user.given_name} ${user.family_name}`.trim()
            : user.given_name || user.email || 'User',
      }
    : null;

  return {
    user: authUser,
    isLoading,
    isAuthenticated,
    getToken,
  };
}

export function useAuthToken() {
  const { getToken } = useKindeAuth();
  return { getToken };
}
