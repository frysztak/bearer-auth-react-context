import { RefreshHandler, Tokens } from '../../src';
import { AuthenticateResponse, postUsersRefreshToken } from './users';
import { FetchConfig } from './config';
import { ApiError } from './common';

export function hasTokenExpired(apiError: ApiError): boolean {
  if (apiError instanceof Error) {
    return false;
  }
  const { body } = apiError;
  return 'message' in body && body.message === 'Unauthorized';
}

export const handleTokenRefresh: RefreshHandler = (
  fetcherConfig: FetchConfig,
  oldTokens: Tokens | null
): Promise<Tokens> => {
  return new Promise<Tokens>(async (resolve, reject) => {
    try {
      const newTokens: AuthenticateResponse = await postUsersRefreshToken(
        fetcherConfig,
        oldTokens
      )();

      resolve({
        bearer: newTokens.jwtToken,
      });
    } catch (e) {
      reject(e);
    }
  });
};

export function getErrorMessage(apiError: ApiError): string {
  return apiError instanceof Error ? apiError.message : apiError.body.message;
}
