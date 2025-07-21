'use client';
import { KindeProvider, useKindeAuth } from '@kinde-oss/kinde-auth-nextjs';
import { ReactNode, useEffect } from 'react';

import { apiClient } from '@/lib/api-client';
import { authLogger } from '@/lib/logger';

function ApiClientConfig() {
  const { getToken } = useKindeAuth();

  useEffect(() => {
    // Configure the API client with the token provider
    apiClient.setTokenProvider(async () => {
      try {
        return await getToken();
      } catch (error) {
        authLogger.warn('⚠️ Failed to get token:', error);
        return null;
      }
    });
    authLogger.debug('🔧 API client configured with token provider');
  }, [getToken]);

  return null;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  return (
    <KindeProvider
      scope='openid profile email offline_access'
      logoutRedirectUrl='/'
    >
      <ApiClientConfig />
      {children}
    </KindeProvider>
  );
};
