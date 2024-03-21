import request from 'sync-request-curl';
import { url, port } from '../../config.json';

const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
    request('DELETE', SERVER_URL + '/v1/clear', {qs: {} });
});

const clearRequest = () => {
    const response = request('DELETE', SERVER_URL + `/v1/clear`, { qs: {} });
    return JSON.parse(response.body.toString());
}

const userDetailsRequest = (token: string) => {
    const response = request('GET', SERVER_URL + `/v1/admin/user/details`, { qs: { token } });
    return JSON.parse(response.body.toString());
}

const quizListRequest = (token: string) => {
    const response = request('GET', SERVER_URL + `/v1/admin/quiz/list`, { qs: { token } });
    return JSON.parse(response.body.toString());
}

const userCreateRequest = (email: string, password: string, nameFirst: string, nameLast: string) => {
    const response = request('POST', SERVER_URL + `/v1/admin/auth/register`, { json: { email, password, nameFirst, nameLast } });
    return JSON.parse(response.body.toString());
}

const quizCreateRequest = (token: string, name: string, description: string) => {
    const response = request('POST', SERVER_URL + `/v1/admin/quiz`, { json: { token, name, description } });
    return JSON.parse(response.body.toString());
}

test('Should clear user data', () => {
    const user1 = userCreateRequest('anotheruser@genericemail.com', 'password123', 'Another', 'User');
    clearRequest();
    const userData = userDetailsRequest(user1.token);
    expect(userData.error).toBeDefined();
});

test('Should clear quiz data', () => {
    clearRequest();
    const user1 = userCreateRequest('anotheruser@genericemail.com', 'password123', 'Another', 'User');
    const quizId = quizCreateRequest(user1.token, 'Biology', 'This is a short quiz about biology concepts.');

    const quizzesBeforeClear = quizListRequest(user1.token);
    expect(quizzesBeforeClear.error).toBeUndefined();

    clearRequest();

    const quizzesAfterClear = quizListRequest(user1.token);
    expect(quizzesAfterClear.error).toBeDefined();
});

test('Should actually delete the quiz data in the datastore', () => {
    const ownerUser = userCreateRequest('owner@example.com', 'password123', 'Owner', 'User');
    const quizId = quizCreateRequest(ownerUser.token, 'Math Quiz', 'This is a math quiz.');

    const quizzesBeforeClear = quizListRequest(ownerUser.token);
    expect(quizzesBeforeClear.error).toBeUndefined();

    clearRequest();
    const user2 = userCreateRequest('owner@example.com', 'password123', 'Owner', 'User');
    expect(user2).toStrictEqual({ token: expect.any(String) });
    const quizzesAfterClear = quizListRequest(user2.token);
    expect(quizzesAfterClear).toStrictEqual({ quizzes: []});
});
