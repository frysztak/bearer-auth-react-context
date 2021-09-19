export type ApiError =
  | {
      response: Response;
      body: any;
    }
  | Error;

export const getAuthorizationHeader = (
  bearerToken?: string
): Record<string, string> => {
  if (!bearerToken) {
    return {};
  }
  return {
    Authorization: `Bearer ${bearerToken}`,
  };
};
