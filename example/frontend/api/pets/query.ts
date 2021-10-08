import { useBearerAuthWrapper } from '../../../src';
import { useQuery } from 'react-query';
import { getPetsPet } from './fetch';

export const useGetPetsPet = <Options>(options?: Options) => {
  const queryFn = useBearerAuthWrapper(getPetsPet);

  return useQuery('petsPet', queryFn, options);
};
