import { FetchConfig } from '../config';
import {
  AuthenticateRequest,
  AuthenticateResponse,
  UsersResponse,
} from './models';
import { getAuthorizationHeader } from '../common';

export const postUsersAuthenticate =
  (config: FetchConfig) =>
  (data: AuthenticateRequest): Promise<AuthenticateResponse> => {
    const controller = new AbortController();
    const { signal } = controller;
    const { baseUrl, bearerToken } = config;
    const url = baseUrl + '/users/authenticate';
    const promise = new Promise<AuthenticateResponse>(
      async (resolve, reject) => {
        try {
          const response = await fetch(url, {
            signal,
            method: 'POST',
            headers: {
              ...getAuthorizationHeader(bearerToken),
              'Content-type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify(data),
            credentials: 'include',
          });
          const json = await response.json();
          if (!response.ok) {
            reject({ response, body: json });
          }
          resolve(json);
        } catch (err) {
          reject(err);
        }
      }
    );
    (promise as any).cancel = () => controller.abort();
    return promise;
  };

export const postUsersRefreshToken =
  (config: FetchConfig) => (): Promise<AuthenticateResponse> => {
    const controller = new AbortController();
    const { signal } = controller;
    const { baseUrl, bearerToken } = config;
    const url = baseUrl + '/users/refresh-token';
    const promise = new Promise<AuthenticateResponse>(
      async (resolve, reject) => {
        try {
          const response = await fetch(url, {
            signal,
            method: 'POST',
            headers: {
              ...getAuthorizationHeader(bearerToken),
              'Content-type': 'application/json; charset=UTF-8',
            },
            credentials: 'include',
          });
          const json = await response.json();
          if (!response.ok) {
            reject({ response, body: json });
          }
          resolve(json);
        } catch (err) {
          reject(err);
        }
      }
    );
    (promise as any).cancel = () => controller.abort();
    return promise;
  };

export const getUsers = (config: FetchConfig) => (): Promise<UsersResponse> => {
  const controller = new AbortController();
  const { signal } = controller;
  const { baseUrl, bearerToken } = config;
  const url = baseUrl + '/users';
  const promise = new Promise<UsersResponse>(async (resolve, reject) => {
    try {
      const response = await fetch(url, {
        signal,
        method: 'GET',
        headers: {
          ...getAuthorizationHeader(bearerToken),
          'Content-type': 'application/json; charset=UTF-8',
        },
        credentials: 'include',
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
