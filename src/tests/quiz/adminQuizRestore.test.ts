import { url, port } from '../../config.json';
import request from 'sync-request-curl';

const SERVER_URL = `${url}:${port}`;

/*// adminAuthRegister function
const adminAuthRegisterReq = (email: string, password: string, nameFirst: string, nameLast: string) => {
    const result = request('POST', SERVER_URL + '/v1/admin/auth/register', {json: {nameFirst, nameLast, email, password}});
    return JSON.parse(result.body.toString());
}

// quizCreateRequest function
const quizCreateReq = (token: string, name: string, description: string) => {
    const result = request('POST', SERVER_URL + '/v1/admin/quiz', { json: {token, name, description} });
    return JSON.parse(result.body.toString());
}

// adminQuizInfo function
const adminQuizInfoReq = (token: string, quizId: number) => {
    const result = request('GET', SERVER_URL + '/v1/admin/quiz/' + quizId.toString(), { qs: { token }});
    return JSON.parse(result.body.toString());
}

// adminQuizRemove function
const adminQuizRemoveReq = (token: string, quizId: number) => {
    const result = request('DELETE', SERVER_URL + '/v1/admin/quiz/' + quizId.toString(), { qs: { token }});
    return JSON.parse(result.body.toString());
}*/

// adminQuizRestore function
const adminQuizRestoreReq = (token: string, quizId: number) => {
    const result = request('POST', SERVER_URL + '/v1/admin/quiz/' + quizId.toString() + '/restore', { qs: { token, quizId }});
    return JSON.parse(result.body.toString());
}

beforeEach(() => {
    request('DELETE', SERVER_URL + '/v1/clear', { qs: {} });
});


// Testing an empty token
test('Token is empty', () => {
    const emptyToken = adminQuizRestoreReq('', 3);
    expect(emptyToken).toStrictEqual({ error: 'Token is empty' });
})