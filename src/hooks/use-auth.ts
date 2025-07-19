import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs';

export interface AuthUser {
  id: string;
  email: string;
  given_name?: string | null;
  family_name?: string | null;
  picture?: string | null;
  name?: string;
}

export function useAuth() {
  const { 
    user, 
    isLoading, 
    isAuthenticated, 
    getToken 
  } = useKindeAuth();

  // Transform Kinde user to our auth user format
  const authUser: AuthUser | null = user ? {
    id: user.id,
    email: user.email || '',
    given_name: user.given_name,
    family_name: user.family_name,
    picture: user.picture,
    name: user.given_name && user.family_name 
      ? `${user.given_name} ${user.family_name}`.trim()
      : user.given_name || user.email || 'User'
  } : null;

  // Auth action URLs
  const login = () => {
    window.location.href = '/api/auth/login';
  };

  const logout = () => {
    window.location.href = '/api/auth/logout';
  };

  const register = () => {
    window.location.href = '/api/auth/register';
  };

  return {
    user: authUser,
    isLoading,
    isAuthenticated,
    login,
    logout,
    register,
    getToken,
  };
}

export function useAuthToken() {
  const { getToken } = useKindeAuth();
  return { getToken };
} 