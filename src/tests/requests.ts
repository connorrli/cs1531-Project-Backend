import request from 'sync-request-curl';
import { url, port } from '../config.json';
import { QuestionBody } from '../interface';

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

// 'quizCreateRequest' function
export const quizCreateRequest = (token: string, name: string, description: string) => {
  const response = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token, name, description } });
  return JSON.parse(response.body.toString());
};

// 'questionCreateRequest' function
export const questionCreateRequest = (token: string, quizId: number, questionBody: QuestionBody) => {
  const response = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId}/question`, { json: { token, questionBody } });
  return JSON.parse(response.body.toString());
};

// 'quizInfoRequest' function
export const quizInfoRequest = (quizId: number, token: string) => {
  const response = request('GET', SERVER_URL + `/v1/admin/quiz/${quizId}`, { qs: { token } });
  return JSON.parse(response.body.toString());
};

// 'questionUpdateRequest' function
export const questionUpdateRequest = (token: string, quizId: number, questionId: number, questionBody: QuestionBody) => {
  const response = request('PUT', SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}`, { json: { token, questionBody } });
  return JSON.parse(response.body.toString());
};

// 'questionDeleteRequest' function
export const questionDeleteRequest = (token: string, quizId: number, questionId: number) => {
  const response = request('DELETE', SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}`, { qs: { token } });
  return JSON.parse(response.body.toString());
};

// 'questionDuplicateRequest' function
export const questionDuplicateRequest = (token: string, quizId: number, questionId: number) => {
  const response = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}/duplicate`, { json: { token } });
  return JSON.parse(response.body.toString());
};

// 'questionMove' function
export const questionMoveRequest = (token: string, quizId: number, questionId: number, newPosition: number) => {
  const response = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}/move`, { json: { token, newPosition } });
  return JSON.parse(response.body.toString());
};
