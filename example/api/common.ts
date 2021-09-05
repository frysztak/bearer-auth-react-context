import { Tokens } from '../../src';

export interface ApiError {
  response: Response;
  body: any;
}

export const getAuthorizationHeader = (
  tokens: Tokens | null
): Record<string, string> => {
  if (!tokens) {
    return {};
  }
  return {
    Authorization: `Bearer ${tokens.bearer}`,
  };
};
