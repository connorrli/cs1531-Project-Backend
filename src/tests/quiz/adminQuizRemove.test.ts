import { url, port } from '../../config.json';
import request from 'sync-request-curl';
import { getTrash, setTrash } from '../../trash';
import { getData } from '../../dataStore';

const SERVER_URL = `${url}:${port}`;
const ERROR = { error: expect.any(String) };

// 'adminAuthRegister' function
const adminAuthRegister = (email: string, password: string, nameFirst: string, nameLast: string) => {
    const result = request('POST', SERVER_URL + '/v1/admin/auth/register', {json: {nameFirst, nameLast, email, password}});
    return JSON.parse(result.body.toString());
}

// 'adminQuizCreate' function
const adminQuizCreate = (token: string, name: string, description: string) => {
    const result = request('POST', SERVER_URL + '/v1/admin/quiz', { json: {token, name, description} });
    return JSON.parse(result.body.toString());
}

// 'adminQuizInfo' function
const adminQuizInfo = (token: string, quizId: number) => {
    const result = request('GET', SERVER_URL + '/v1/admin/quiz/' + quizId.toString(), { qs: { token }});
    return JSON.parse(result.body.toString());
}

// 'adminQuizRemove' function
const adminQuizRemove = (token: string, quizId: number) => {
    const result = request('DELETE', SERVER_URL + '/v1/admin/quiz/' + quizId.toString(), { qs: { token }});
    return JSON.parse(result.body.toString());
}

beforeEach(() => {
    request('DELETE', SERVER_URL + '/v1/clear', { qs: {} });
});

describe('adminQuizRemove function tests', () => {
    // A success case and multiple error cases
    test('Should remove a quiz owned by the user', () => {
        const test1U = adminAuthRegister('test@example.com', 'password123', 'John', 'Doe');
        if ('token' in test1U) {
            const test1Q = adminQuizCreate(test1U.token, 'Test Quiz', 'This is a test quiz');
            if ('quizId' in test1Q){
                expect(adminQuizInfo(test1U.token, test1Q.quizId)).not.toHaveProperty("error");
                const result = adminQuizRemove(test1U.token, test1Q.quizId);
                expect(result).toStrictEqual({});
                expect(adminQuizInfo(test1U.token, test1Q.quizId)).toHaveProperty("error");
                const trashres = (request('GET', SERVER_URL + '/v1/admin/quiz/trash', {qs: { token: test1U.token }}));
                const trash = JSON.parse(trashres.body.toString());
                let removedQuiz;
                for(const quiz of trash.quizzes) {
                    if (quiz.quizId == test1Q.quizId) {
                        removedQuiz = quiz;
                    }
                }
                expect(removedQuiz).toStrictEqual({ quizId: test1Q.quizId, name: "Test Quiz"});
            }
        }    
    });

    test('Should return an error when token is invalid', () => {
        const test2U = adminAuthRegister('test@example.com', 'password123', 'John', 'Doe');
        if ('token' in test2U) {
            const test2Q = adminQuizCreate(test2U.token, 'Test Quiz', 'This is a test quiz');
            if ('quizId' in test2Q){
                const result = adminQuizRemove(test2U.token + "1", test2Q.quizId);
                expect(result).toStrictEqual(ERROR);
            }
        }
    });

    test('Should return an error when quizId does not refer to a valid quiz', () => {
        const test3U = adminAuthRegister('test@example.com', 'password123', 'John', 'Doe');
        if ('token' in test3U) {
            const result = adminQuizRemove(test3U.token, 123);
            expect(result).toStrictEqual(ERROR);
        }
    });
    
    test('Should return an error when quizId does not refer to a quiz that the user owns', () => {
        const test4U1 = adminAuthRegister('test1@example.com', 'password123', 'John', 'Doe');
        if ('token' in test4U1) {
            const test4U2 = adminAuthRegister('test2@example.com', 'password1232', 'Jane', 'Smith');
            if ('token' in test4U2) {
                const test4Q = adminQuizCreate(test4U1.token, 'Test Quiz', 'This is a test quiz');
                if ('quizId' in test4Q){
                    const result = adminQuizRemove(test4U2.token, test4Q.quizId);
                    expect(result).toStrictEqual(ERROR);
                }
            }
        }
    });

    test('Should NOT return an error when quizId DOES refer to a quiz that the user owns', () => {
        const test5U1 = adminAuthRegister('test1@example.com', 'password123', 'John', 'Doe');
        if ('token' in test5U1) {
            const test5U2 = adminAuthRegister('test2@example.com', 'password1232', 'Jane', 'Smith');
            if ('token' in test5U2) {
                const test5Q = adminQuizCreate(test5U1.token, 'Test Quiz', 'This is a test quiz');
                if ('quizId' in test5Q){
                    const result = adminQuizRemove(test5U1.token, test5Q.quizId);
                    expect(result).not.toStrictEqual(ERROR);  
                }
            }
        }
    });
});
