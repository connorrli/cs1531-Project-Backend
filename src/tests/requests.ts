/// ////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////// IMPORTS /////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

import request from 'sync-request-curl';
import { url, port } from '../config.json';
import { QuestionBody, QuestionBodyV2 } from '../interface';

const SERVER_URL = `${url}:${port}`;

/// ////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////// ITER2 REQUEST FUNCTIONS //////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

/* ----------------------------------------------------------------------------------
| OTHER HTTP WRAPPERS
------------------------------------------------------------------------------------ */

// 'clearRequest' function
export const clearRequest = () => {
  const response = request('DELETE', SERVER_URL + '/v1/clear', { qs: { } });
  return JSON.parse(response.body.toString());
};

/* ----------------------------------------------------------------------------------
| AUTH HTTP WRAPPERS
------------------------------------------------------------------------------------ */

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

/* ----------------------------------------------------------------------------------
| QUIZ HTTP WRAPPERS
------------------------------------------------------------------------------------ */

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
  const response = request('PUT', SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}/move`, { json: { token, newPosition } });
  return JSON.parse(response.body.toString());
};

// 'userLogoutRequestV2' function
export const userLogoutRequestV2 = (token: string) => {
  const response = request('POST', SERVER_URL + '/v2/admin/auth/logout', { headers: { token } });
  return JSON.parse(response.body.toString());
};

// 'userDetailsRequestV2' function
export const userDetailsRequestV2 = (token: string) => {
  const response = request('GET', SERVER_URL + '/v2/admin/user/details', { headers: { token } });
  return JSON.parse(response.body.toString());
};

/// ////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////// ITER3 REQUEST FUNCTIONS //////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////

/* ----------------------------------------------------------------------------------
| OTHER HTTP WRAPPERS
------------------------------------------------------------------------------------ */

/* ----------------------------------------------------------------------------------
| AUTH HTTP WRAPPERS
------------------------------------------------------------------------------------ */

// 'userDetailsUpdateRequestV2' function
export const userDetailsUpdateRequestV2 = (token: string, email: string, nameFirst: string, nameLast: string) => {
  const response = request('PUT', SERVER_URL + '/v2/admin/user/details', { headers: { token }, json: { email, nameFirst, nameLast } });
  return JSON.parse(response.body.toString());
};

// 'userPasswordUpdateRequestV2' function
export const userPasswordUpdateRequestV2 = (token: string, oldPassword: string, newPassword: string) => {
  const response = request('PUT', SERVER_URL + '/v2/admin/user/password', { headers: { token }, json: { oldPassword, newPassword } });
  return JSON.parse(response.body.toString());
};

/* ----------------------------------------------------------------------------------
| QUIZ HTTP WRAPPERS
------------------------------------------------------------------------------------ */

// 'quizTrashRequestV2' function
export const quizTrashRequestV2 = (token: string, quizId: number) => {
  const response = request('DELETE', SERVER_URL + `/v2/admin/quiz/${quizId}`, { headers: { token } });
  return JSON.parse(response.body.toString());
};

// 'quizListRequestV2' function
export const quizListRequestV2 = (token: string) => {
  const response = request('GET', SERVER_URL + '/v2/admin/quiz/list', { headers: { token } });
  return JSON.parse(response.body.toString());
};

// 'quizCreateRequestV2' function
export const quizCreateRequestV2 = (token: string, name: string, description: string) => {
  const response = request('POST', SERVER_URL + '/v2/admin/quiz', { headers: { token }, json: { name, description } });
  return JSON.parse(response.body.toString());
};

// 'quizInfoRequestV2' function
export const quizInfoRequestV2 = (token: string, quizId: number) => {
  const response = request('GET', SERVER_URL + `/v2/admin/quiz/${quizId}`, { headers: { token } });
  return JSON.parse(response.body.toString());
};

// 'quizNameUpdateRequestV2' function
export const quizNameUpdateRequestV2 = (token: string, quizId: number, name: string) => {
  const response = request('PUT', SERVER_URL + `/v2/admin/quiz/${quizId}/name`, { headers: { token }, json: { name } });
  return JSON.parse(response.body.toString());
};

// 'quizDescriptionUpdateRequestV2' function
export const quizDescriptionUpdateRequestV2 = (token: string, quizId: number, description: string) => {
  const response = request('PUT', SERVER_URL + `/v2/admin/quiz/${quizId}/description`, { headers: { token }, json: { description } });
  return JSON.parse(response.body.toString());
};

// 'quizTrashViewRequestV2' function
export const quizTrashViewRequestV2 = (token: string) => {
  const response = request('GET', SERVER_URL + '/v2/admin/quiz/trash', { headers: { token } });
  return JSON.parse(response.body.toString());
};

// 'quizRestoreRequestV2' function
export const quizRestoreRequestV2 = (token: string, quizId: number) => {
  const response = request('POST', SERVER_URL + `/v2/admin/quiz/${quizId}/restore`, { headers: { token } });
  return JSON.parse(response.body.toString());
};

// 'quizTrashEmptyRequestV2' function
export const quizTrashEmptyRequestV2 = (token: string, quizIds: Array<number>) => {
  const response = request('DELETE', SERVER_URL + '/v2/admin/quiz/trash/empty', { headers: { token }, qs: { quizIds: JSON.stringify(quizIds) } });
  return JSON.parse(response.body.toString());
};

// 'quizTransferRequestV2' function
export const quizTransferRequestV2 = (token: string, quizId: number, userEmail: string) => {
  const response = request('POST', SERVER_URL + `/v2/admin/quiz/${quizId}/transfer`, { headers: { token }, json: { userEmail } });
  return JSON.parse(response.body.toString());
};

// 'questionCreateRequestV2' function
export const questionCreateRequestV2 = (token: string, quizId: number, questionBody: QuestionBodyV2) => {
  const response = request('POST', SERVER_URL + `/v2/admin/quiz/${quizId}/question`, { json: { questionBody }, headers: { token } });
  return JSON.parse(response.body.toString());
};

// 'questionUpdateRequestV2' function
export const questionUpdateRequestV2 = (token: string, quizId: number, questionId: number, questionBody: QuestionBodyV2) => {
  const response = request('PUT', SERVER_URL + `/v2/admin/quiz/${quizId}/question/${questionId}`, { headers: { token }, json: { questionBody } });
  return JSON.parse(response.body.toString());
};

// 'questionDeleteRequestV2' function
export const questionDeleteRequestV2 = (token: string, quizId: number, questionId: number) => {
  const response = request('DELETE', SERVER_URL + `/v2/admin/quiz/${quizId}/question/${questionId}`, { headers: { token } });
  return JSON.parse(response.body.toString());
};

// 'questionMoveRequestV2' function
export const questionMoveRequestV2 = (token: string, quizId: number, questionId: number, newPosition: number) => {
  const response = request('PUT', SERVER_URL + `/v2/admin/quiz/${quizId}/question/${questionId}/move`, { headers: { token }, json: { newPosition } });
  return JSON.parse(response.body.toString());
};

// 'questionDuplicateRequestV2' function
export const questionDuplicateRequestV2 = (token: string, quizId: number, questionId: number) => {
  const response = request('POST', SERVER_URL + `/v2/admin/quiz/${quizId}/question/${questionId}/duplicate`, { headers: { token } });
  return JSON.parse(response.body.toString());
};

// 'quizThumbnailRequest' function
export const quizThumbnailRequest = (token: string, quizId: number, imgUrl: string) => {
  const response = request('PUT', SERVER_URL + `/v1/admin/quiz/${quizId}/thumbnail`, { headers: { token }, json: { imgUrl } });
  return JSON.parse(response.body.toString());
};

/* ----------------------------------------------------------------------------------
| QUIZ (SESSION) HTTP WRAPPERS
------------------------------------------------------------------------------------ */

// 'quizSessionStartRequest' function
export const quizSessionStartRequest = (token: string, quizId: number, autoStartNum: number) => {
  const response = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId}/session/start`, { headers: { token }, json: { autoStartNum } });
  return JSON.parse(response.body.toString());
};

// 'quizSessionStateUpdateRequest' function
export const quizSessionStateUpdateRequest = (token: string, quizId: number, sessionId: number, action: string) => {
  const response = request('PUT', SERVER_URL + `/v1/admin/quiz/${quizId}/session/${sessionId}`, { headers: { token }, json: { action } });
  return JSON.parse(response.body.toString());
};

// 'quizSessionStatusRequest' function
export const quizSessionStatusRequest = (token: string, quizId: number, sessionId: number) => {
  const response = request('GET', SERVER_URL + `/v1/admin/quiz/${quizId}/session/${sessionId}`, { headers: { token } });
  return JSON.parse(response.body.toString());
};

// 'quizSessionsRequest' function
export const quizSessionsRequest = (token: string, quizId: number) => {
  const response = request('GET', SERVER_URL + `/v1/admin/quiz/${quizId}/sessions`, { headers: { token } });
  return JSON.parse(response.body.toString());
};

// 'quizSessionResultsRequest' function
export const quizSessionResultsRequest = (token: string, quizId: number, sessionId: number) => {
  const response = request('GET', SERVER_URL + `/v1/admin/quiz/${quizId}/session/${sessionId}/results`, { headers: { token } });
  return JSON.parse(response.body.toString());
};

/* ----------------------------------------------------------------------------------
| PLAYER HTTP WRAPPERS
------------------------------------------------------------------------------------ */

export const playerJoinRequest = (name: string, sessionId: number) => {
  const response = request('POST', SERVER_URL + '/v1/player/join', { json: { name: name, sessionId: sessionId } });
  return JSON.parse(response.body.toString());
};

export const playerQuestionInfoRequest = (playerId: number, questionPosition: number) => {
  const response = request('GET', SERVER_URL + `/v1/player/${playerId}/question/${questionPosition}`);
  return JSON.parse(response.body.toString());
};

export const playerSubmitRequest = (answerIds: Array<number>, playerId: number, questionPosition: number) => {
  const response = request('PUT', SERVER_URL + `/v1/player/${playerId}/question/${questionPosition}/answer`, { json: { answerIds } });
  return JSON.parse(response.body.toString());
};

export const playerQuestionResultsRequest = (playerId: number, questionPosition: number) => {
  const response = request('GET', SERVER_URL + `/v1/player/${playerId}/question/${questionPosition}/results`);
  return JSON.parse(response.body.toString());
};

// 'statusOfGuestPlayer' function
export const guestPlayerStatus = (playerId: number) => {
  const response = request('GET', SERVER_URL + `/v1/player/${playerId}`);
  return JSON.parse(response.body.toString());
};

/* ----------------------------------------------------------------------------------
| CHAT ITEMS HTTP WRAPPERS
------------------------------------------------------------------------------------ */

// 'allChatMessages' function
export const allChatMessages = (playerId: number) => {
  const response = request('GET', SERVER_URL + `/v1/player/${playerId}/chat`);
  return JSON.parse(response.body.toString());
};

// 'sendChatMessage' function
export const sendChatMessage = (playerId: number, message: string) => {
  const response = request('POST', SERVER_URL + `/v1/player/${playerId}/chat`, { json: { message: message } });
  return JSON.parse(response.body.toString());
};
