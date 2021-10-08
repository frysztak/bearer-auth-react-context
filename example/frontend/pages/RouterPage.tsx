import * as React from 'react';
import { useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import {
  RefreshFailureHandler,
  RefreshSuccessHandler,
  useBearerAuthContext,
  useBearerToken,
  useRefreshFailureHandler,
  useRefreshSuccessHandler,
} from 'bearer-auth-react-context';
import { LoginPage } from './LoginPage';
import { MainPage } from './MainPage';

export const RouterPage: React.FC = () => {
  const isLoggedIn: boolean = useBearerToken() !== undefined;
  const { clearTokens } = useBearerAuthContext();

  const refreshFailureHandler: RefreshFailureHandler = useCallback(
    (error: unknown) => {
      console.error(`Token refresh failed with `, error);
      clearTokens();
    },
    [clearTokens]
  );
  useRefreshFailureHandler(refreshFailureHandler);

  const toast = useToast({
    isClosable: true,
    position: 'bottom-left',
  });
  const refreshSuccessHandler: RefreshSuccessHandler = useCallback(() => {
    toast({
      status: 'info',
      description: 'Bearer token successfully refreshed',
    });
  }, [toast]);
  useRefreshSuccessHandler(refreshSuccessHandler);

  return isLoggedIn ? <MainPage /> : <LoginPage />;
};
