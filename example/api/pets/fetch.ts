import { FetchConfig } from '../config';
import { Tokens } from '../../../src';
import { getAuthorizationHeader } from '../common';
import { Pet } from './models';

export const getPetsPet =
  (config: FetchConfig, tokens: Tokens | null) => (): Promise<Pet> => {
    const controller = new AbortController();
    const { signal } = controller;
    const { baseUrl } = config;
    const url = baseUrl + '/pets/pet';
    const promise = new Promise<Pet>(async (resolve, reject) => {
      const response = await fetch(url, {
        signal,
        method: 'GET',
        headers: getAuthorizationHeader(tokens),
      });
      const json = await response.json();
      if (!response.ok) {
        reject({ response, body: json });
      }
      resolve(json);
    });
    (promise as any).cancel = () => controller.abort();
    return promise;
  };
