import { Tokens } from '../../src';

export type ApiError =
  | {
      response: Response;
      body: any;
    }
  | Error;

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
