import * as React from 'react';
import { useBearerToken } from '../../src';
import { LoginPage } from './LoginPage';
import { MainPage } from './MainPage';

export const RouterPage: React.FC = () => {
  const isLoggedIn: boolean = useBearerToken() !== undefined;

  return isLoggedIn ? <MainPage /> : <LoginPage />;
};
