import { RefreshHandler, Tokens } from '../../src';
import { AuthenticateResponse, postUsersRefreshToken } from './users';
import { FetchConfig } from './config';

export function hasTokenExpired({ response, body }): boolean {
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
