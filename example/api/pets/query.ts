import { useBearerAuthWrapper } from '../../../src';
import { FetchConfig } from '../config';
import { useQuery } from 'react-query';
import { getPetsPet } from './fetch';

export const useGetPetsPet = <Options>(options?: Options) => {
  const bearerAuthWrapper = useBearerAuthWrapper<FetchConfig>();

  return useQuery(
    'petsPet',
    () => bearerAuthWrapper(getPetsPet, void 0),
    options
  );
};
