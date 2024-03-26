import { url, port } from '../../config.json';
import request from 'sync-request-curl';

const SERVER_URL = `${url}:${port}`;

// adminAuthRegister function
const adminAuthRegisterReq = (email: string, password: string, nameFirst: string, nameLast: string) => {
    const result = request('POST', SERVER_URL + '/v1/admin/auth/register', {json: {nameFirst, nameLast, email, password}});
    return JSON.parse(result.body.toString());
}

// quizCreateRequest function
const quizCreateReq = (token: string, name: string, description: string) => {
    const result = request('POST', SERVER_URL + '/v1/admin/quiz', { json: {token, name, description} });
    return JSON.parse(result.body.toString());
}

// quizListReq function
const quizListReq = (token: string) => {
    const result = request('GET', SERVER_URL + '/v1/admin/quiz/list', { qs: { token }});
    return JSON.parse(result.body.toString());
}

// adminQuizRemove function
const adminQuizRemoveReq = (token: string, quizId: number) => {
    const result = request('DELETE', SERVER_URL + '/v1/admin/quiz/' + quizId.toString(), { qs: { token }});
    return JSON.parse(result.body.toString());
}

// adminQuizRestore function
const adminQuizRestoreReq = (token: string, quizId: number) => {
    const result = request('POST', SERVER_URL + '/v1/admin/quiz/' + quizId.toString() + '/restore', { json: { token }});
    return JSON.parse(result.body.toString());
}

// adminAuthLogOutReq function
const adminAuthLogOutReq = (token: string) => {
    const result = request('POST', SERVER_URL + '/v1/admin/auth/logout', { json: { token } });
    return JSON.parse(result.body.toString());
}

// authLoginReq function
const adminAuthLoginReq = (email: string, password: string) => {
    const res = request('POST', SERVER_URL + '/v1/admin/auth/login', {json: {email, password}});
    return JSON.parse(res.body.toString());
};

// adminQuizTrashView function
const adminQuizTrashView = (token: string) => {
    const result = request('GET', SERVER_URL + '/v1/admin/quiz/trash', { qs: { token }});
    return JSON.parse(result.body.toString());
}

let user1;
let user2;
let user1Token : string;
let user2Token : string;
let quiz1QuizId : number;
let quiz2QuizId : number;

beforeEach(() => {
    request('DELETE', SERVER_URL + '/v1/clear', { qs: {} });
    user1 = adminAuthRegisterReq('test@gmail.com', 'Password123', 'John', 'Doe');
    if ('token' in user1) user1Token = user1.token;
    else user1Token = undefined;
    user2 = adminAuthRegisterReq('water@gmail.com', 'Waterisgood123', 'Hydra', 'Tion');
    if ('token' in user2) user2Token = user2.token;
    else user2Token = undefined;
});

// Testing quiz name is already in use by another active quiz
test('Quiz name is already in use by another user', () => {
    const quiz1 = quizCreateReq(user1Token, 'name', 'description');
    if ('quizId' in quiz1) quiz1QuizId = quiz1.quizId;
    else quiz1QuizId = undefined;
    const removeQuiz = adminQuizRemoveReq(user1Token, quiz1QuizId);
    const quiz2 = quizCreateReq(user1Token, 'name', 'another description');
    const restoreRemoveQuiz = adminQuizRestoreReq(user1Token, quiz1QuizId);
    expect(restoreRemoveQuiz.error).toStrictEqual(expect.any(String));
})

// QuizId entered does not exist in trash
test('QuizId entered does not exist in trash', () => {
    const quiz1 = quizCreateReq(user1Token, 'name', 'description');
    if ('quizId' in quiz1) quiz1QuizId = quiz1.quizId;
    else quiz1QuizId = undefined;
    const removeQuiz = adminQuizRemoveReq(user1Token, quiz1QuizId);
    const restoreQuiz = adminQuizRestoreReq(user1Token, 3);
    expect(restoreQuiz.error).toStrictEqual(expect.any(String));
})

// Testing an empty token
test('Token is empty', () => {
    const emptyToken = adminQuizRestoreReq('', 3);
    expect(emptyToken.error).toStrictEqual(expect.any(String));
})

// Testing for invalid token
test('Token is invalid', () => {
    const badToken = adminQuizRestoreReq('2', 3);
    expect(badToken.error).toStrictEqual(expect.any(String));
})

// Testing restore but user does not own that quiz
test('Quiz is not owned by you', () => {
    const quiz1 = quizCreateReq(user1Token, 'name', 'description');
    if ('quizId' in quiz1) quiz1QuizId = quiz1.quizId;
    else quiz1QuizId = undefined;
    const removeQuiz = adminQuizRemoveReq(user1Token, quiz1QuizId);
    const notOwned = adminQuizRestoreReq(user2Token, quiz1QuizId);
    expect(notOwned.error).toStrictEqual(expect.any(String));
})

// Extra tests
// Correct output after logging out and then logging in to restore
test('Logging back in to restore', () => {
    const quiz1 = quizCreateReq(user1Token, 'name', 'description');
    if ('quizId' in quiz1) quiz1QuizId = quiz1.quizId;
    else quiz1QuizId = undefined;
    const removeQuiz = adminQuizRemoveReq(user1Token, quiz1QuizId);
    const logout1 = adminAuthLogOutReq(user1Token);
    const login1 = adminAuthLoginReq('test@gmail.com', 'Password123');
    const restore = adminQuizRestoreReq(user1Token, quiz1QuizId)
    expect(restore).toStrictEqual({  });
})


// Correct output when user creates 2 quizzes, deletes both and restores one
test('Correct output for remainder of items in trash', () => {
    const quiz1 = quizCreateReq(user1Token, 'name', 'to be restored');
    if ('quizId' in quiz1) quiz1QuizId = quiz1.quizId;
    else quiz1QuizId = undefined;
    const quiz2 = quizCreateReq(user1Token, 'name2', 'this should be the only item in trash');
    if ('quizId' in quiz2) quiz2QuizId = quiz2.quizId;
    else quiz2QuizId = undefined;
    const removeQuiz1 = adminQuizRemoveReq(user1Token, quiz1QuizId);
    const removeQuiz2 = adminQuizRemoveReq(user1Token, quiz2QuizId);
    const restoreQuiz1 = adminQuizRestoreReq(user1Token, quiz1QuizId)
    expect(restoreQuiz1).toStrictEqual({  });

    expect(adminQuizTrashView(user1Token)).toStrictEqual({ quizzes: [{ quizId: quiz2.quizId, name: "name2" }] });
})