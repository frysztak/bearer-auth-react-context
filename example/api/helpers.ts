import { Tokens } from '../../src';
import { AuthenticateResponse, postUsersRefreshToken } from './users';

export function hasTokenExpired({ response, body }): boolean {
  return 'message' in body && body.message === 'Unauthorized';
}

export function handleTokenRefresh(oldTokens: Tokens | null): Promise<Tokens> {
  return new Promise<Tokens>(async (resolve, reject) => {
    try {
      const newTokens: AuthenticateResponse = await postUsersRefreshToken(
        {
          baseUrl: 'http://localhost:4000',
        },
        oldTokens
      )();
      resolve({
        refresh: '',
        bearer: newTokens.jwtToken,
      });
    } catch (e) {
      reject(e);
    }
  });
}
