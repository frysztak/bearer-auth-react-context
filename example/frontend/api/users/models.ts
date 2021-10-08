export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
}

export interface AuthenticateResponse extends User {
  jwtToken: string;
}

export interface AuthenticateRequest {
  username: string;
  password: string;
}

export type UsersResponse = Array<User>;
