import { useMutation, useQuery } from 'react-query';
import { useBearerAuthWrapper } from 'bearer-auth-react-context';
import { getUsers, postUsersAuthenticate } from './fetch';

export const useUsersAuthenticateMutation = <Options>(options?: Options) => {
  const mutationFn = useBearerAuthWrapper(postUsersAuthenticate);
  return useMutation('usersAuthenticateMutation', mutationFn, options);
};

export const useUsersQuery = <Options>(options?: Options) => {
  const queryFn = useBearerAuthWrapper(getUsers);
  return useQuery('users', queryFn, options);
};
