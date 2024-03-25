import request from 'sync-request-curl';
import { url, port } from '../config.json';

const SERVER_URL = `${url}:${port}`;

// 'clearRequest' function
export const clearRequest = () => {
  const response = request('DELETE', SERVER_URL + '/v1/clear', { qs: { } });
  return JSON.parse(response.body.toString());
};

// 'loginRequest' function
export const loginRequest = (email: string, password: string) => {
  const response = request('POST', SERVER_URL + '/v1/admin/auth/login', { json: { email, password } });
  return JSON.parse(response.body.toString());
};

// 'passwordUpdateRequest' function
export const passwordUpdateRequest = (token: string, oldPassword: string, newPassword: string) => {
  const response = request('PUT', SERVER_URL + '/v1/admin/user/password', { json: { token, oldPassword, newPassword } });
  return JSON.parse(response.body.toString());
};

// 'userDetailsRequest' function
export const userDetailsRequest = (token: string) => {
  const response = request('GET', SERVER_URL + '/v1/admin/user/details', { qs: { token } });
  return JSON.parse(response.body.toString());
};

// 'userDetailsUpdate' function
export const userDetailsUpdateRequest = (token: string, email: string, nameFirst: string, nameLast: string) => {
  const response = request('PUT', SERVER_URL + '/v1/admin/user/details', { json: { token, email, nameFirst, nameLast } });
  return JSON.parse(response.body.toString());
};

// 'userCreateRequest' function
export const userCreateRequest = (email: string, password: string, nameFirst: string, nameLast: string) => {
  const response = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email, password, nameFirst, nameLast } });
  return JSON.parse(response.body.toString());
};
