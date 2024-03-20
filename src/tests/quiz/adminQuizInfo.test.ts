import { adminQuizCreate, adminQuizInfo } from "../../quiz";
import { clear } from "../../other";
import { url, port } from '../../config.json';
import request from 'sync-request-curl';

const SERVER_URL = `${url}:${port}`;
const ERROR = { error: expect.any(String) };

const adminAuthRegister = (email: string, password: string, nameFirst: string, nameLast: string) => {
    const result = request('POST', SERVER_URL + '/v1/admin/auth/register', {json: {nameFirst, nameLast, email, password}});
    return JSON.parse(result.body.toString());
}

describe('adminQuizInfo function tests', () => {

    beforeEach(() => {
        clear();
    })

    test('Returns quiz information for a valid quiz owned by the user', () => {
        const authUser = adminAuthRegister('test@example.com', 'password123', 'John', 'Doe');
        if ('authUserId' in authUser) {
            const quiz = adminQuizCreate(authUser.authUserId, 'Test Quiz', 'This is a test quiz');
            if ('quizId' in quiz) {
                const quizInfo = adminQuizInfo(authUser.authUserId, quiz.quizId);
                expect(quizInfo).toStrictEqual({
                    quizId: quiz.quizId,
                    name: 'Test Quiz',
                    timeCreated: expect.any(Number), 
                    timeLastEdited: expect.any(Number), 
                    description: 'This is a test quiz'
                });
            }
        }
    });

    test('Returns an error when authUserId is not a valid user', () => {
        const quizInfo = adminQuizInfo(42, 42);
        expect(quizInfo).toEqual(ERROR);
    });

    test('Returns an error when quizId is not a valid quiz', () => {
        const authUser = adminAuthRegister('test@example.com', 'password123', 'John', 'Doe');
        if ('authUserId' in authUser) {
            const quizInfo = adminQuizInfo(authUser.authUserId, 42);
            expect(quizInfo).toEqual(ERROR);
        }
    });

    test('Returns an error when quizId is not owned by authUserId', () => {
        const authUser1 = adminAuthRegister('user1@example.com', 'password231', 'First', 'User');
        const authUser2 = adminAuthRegister('user2@example.com', 'password123', 'Second', 'User');
        if ('authUserId' in authUser1 && 'authUserId' in authUser2) {
            const quiz = adminQuizCreate(authUser1.authUserId, 'User 1 Quiz', 'This is a quiz created by user 1');
            if ('quizId' in quiz) {
                const quizInfo = adminQuizInfo(authUser2.authUserId, quiz.quizId);
                expect(quizInfo).toEqual(ERROR);
            }
        }
    });

});
