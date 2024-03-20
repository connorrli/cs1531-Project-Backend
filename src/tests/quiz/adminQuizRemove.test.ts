import { adminQuizRemove, adminQuizCreate, adminQuizInfo } from '../../quiz';
import { clear } from '../../other';
import { url, port } from '../../config.json';
import request from 'sync-request-curl';

const SERVER_URL = `${url}:${port}`;
const ERROR = { error: expect.any(String) };

const adminAuthRegister = (email: string, password: string, nameFirst: string, nameLast: string) => {
    const result = request('POST', SERVER_URL + '/v1/admin/auth/register', {json: {nameFirst, nameLast, email, password}});
    return JSON.parse(result.body.toString());
}

describe('adminQuizRemove function tests', () => {

    beforeEach(() => {
        clear();
    })

    test('Should remove a quiz owned by the user', () => {
        const test1U = adminAuthRegister('test@example.com', 'password123', 'John', 'Doe');
        if ('authUserId' in test1U) {
            const test1Q = adminQuizCreate(test1U.authUserId, 'Test Quiz', 'This is a test quiz');
            if ('quizId' in test1Q){
                expect(adminQuizInfo(test1U.authUserId, test1Q.quizId)).not.toHaveProperty("error");
                const result = adminQuizRemove(test1U.authUserId, test1Q.quizId);
                expect(result).toStrictEqual({});
                expect(adminQuizInfo(test1U.authUserId, test1Q.quizId)).toHaveProperty("error");
            }
        }    
    });

    test('Should return an error when authUserId is invalid', () => {
        const test2U = adminAuthRegister('test@example.com', 'password123', 'John', 'Doe');
        if ('authUserId' in test2U) {
            const test2Q = adminQuizCreate(test2U.authUserId, 'Test Quiz', 'This is a test quiz');
            if ('quizId' in test2Q){
                const result = adminQuizRemove(test2U.authUserId + 1, test2Q.quizId);
                expect(result).toStrictEqual(ERROR);
            }
        }
    });

    test('Should return an error when quizId does not refer to a valid quiz', () => {
        const test3U = adminAuthRegister('test@example.com', 'password123', 'John', 'Doe');
        if ('authUserId' in test3U) {
            const result = adminQuizRemove(test3U.authUserId, 123);
            expect(result).toStrictEqual(ERROR);
        }
    });
    
    test('Should return an error when quizId does not refer to a quiz that the user owns', () => {
        const test4U1 = adminAuthRegister('test1@example.com', 'password123', 'John', 'Doe');
        if ('authUserId' in test4U1) {
            const test4U2 = adminAuthRegister('test2@example.com', 'password1232', 'Jane', 'Smith');
            if ('authUserId' in test4U2) {
                const test4Q = adminQuizCreate(test4U1.authUserId, 'Test Quiz', 'This is a test quiz');
                if ('quizId' in test4Q){
                    const result = adminQuizRemove(test4U2.authUserId, test4Q.quizId);
                    expect(result).toStrictEqual(ERROR);
                }
            }
        }
    });

    test('Should NOT return an error when quizId DOES refer to a quiz that the user owns', () => {
        const test5U1 = adminAuthRegister('test1@example.com', 'password123', 'John', 'Doe');
        if ('authUserId' in test5U1) {
            const test5U2 = adminAuthRegister('test2@example.com', 'password1232', 'Jane', 'Smith');
            if ('authUserId' in test5U2) {
                const test5Q = adminQuizCreate(test5U1.authUserId, 'Test Quiz', 'This is a test quiz');
                if ('quizId' in test5Q){
                    const result = adminQuizRemove(test5U1.authUserId, test5Q.quizId);
                    expect(result).not.toStrictEqual(ERROR);  
                }
            }
        }
    });
});
