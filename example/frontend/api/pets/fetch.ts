import { FetchConfig } from '../config';
import { getAuthorizationHeader } from '../common';
import { Pet } from './models';

export const getPetsPet = (config: FetchConfig) => (): Promise<Pet> => {
  const controller = new AbortController();
  const { signal } = controller;
  const { baseUrl, bearerToken } = config;
  const url = baseUrl + '/pets/pet';
  const promise = new Promise<Pet>(async (resolve, reject) => {
    try {
      const response = await fetch(url, {
        signal,
        method: 'GET',
        headers: getAuthorizationHeader(bearerToken),
      });
      const json = await response.json();
      if (!response.ok) {
        reject({ response, body: json });
      }
      resolve(json);
    } catch (err) {
      reject(err);
    }
  });
  (promise as any).cancel = () => controller.abort();
  return promise;
};
