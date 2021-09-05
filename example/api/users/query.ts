import { useMutation, useQuery } from 'react-query';
import { useBearerAuthWrapper } from '../../../src';
import { FetchConfig } from '../config';
import { getUsers, postUsersAuthenticate } from './fetch';
import { AuthenticateRequest } from './models';

export const useUsersAuthenticateMutation = <Options>(options?: Options) => {
  const bearerAuthWrapper = useBearerAuthWrapper<FetchConfig>();

  return useMutation(
    'usersAuthenticateMutation',
    (data: AuthenticateRequest) =>
      bearerAuthWrapper(postUsersAuthenticate, data),
    options
  );
};

export const useUsersQuery = <Options>(options?: Options) => {
  const bearerAuthWrapper = useBearerAuthWrapper<FetchConfig>();

  return useQuery('users', () => bearerAuthWrapper(getUsers, void 0), options);
};
