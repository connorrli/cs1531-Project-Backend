import { adminQuizRemove, adminQuizCreate, adminQuizInfo } from '../quiz.js';
import { adminAuthRegister, adminUserDetails } from '../auth.js';
import { clear } from '../other.js';

describe('adminQuizRemove function tests', () => {

    beforeEach(() => {
        clear();
    })

    test('Should remove a quiz owned by the user', () => {
        const { authUserId } = adminAuthRegister('test@example.com', 'password', 'John', 'Doe');
        const { quizId } = adminQuizCreate(authUserId, 'Test Quiz', 'This is a test quiz');
        expect(adminQuizInfo(authUserId, quizId)).not.toHaveProperty("error");
        const result = adminQuizRemove(authUserId, quizId);
        expect(result).toEqual({});
        expect(adminQuizInfo(authUserId, quizId)).toHaveProperty("error");
    });

    test('Should return an error when authUserId is invalid', () => {
        const { authUserId } = adminAuthRegister('test@example.com', 'password', 'John', 'Doe');
        const { quizId } = adminQuizCreate(authUserId, 'Test Quiz', 'This is a test quiz');
        const result = adminQuizRemove(authUserId + 1, quizId);
        expect(result).toEqual({ error: 'Not a valid authUserId' });
    });

    test('Should return an error when quizId does not refer to a valid quiz', () => {
        const { authUserId } = adminAuthRegister('test@example.com', 'password', 'John', 'Doe');
        const result = adminQuizRemove(authUserId, 123);
        expect(result).toEqual({ error: 'Not a valid quizId' });
    });
    
    test('Should return an error when quizId does not refer to a quiz that the user owns', () => {
        const { authUserId: userId1 } = adminAuthRegister('test1@example.com', 'password', 'John', 'Doe');
        const { authUserId: userId2 } = adminAuthRegister('test2@example.com', 'password2', 'Jane', 'Smith');
        const { quizId } = adminQuizCreate(userId1, 'Test Quiz', 'This is a test quiz');
        const result = adminQuizRemove(userId2, quizId);
        expect(result).toHaveProperty('error');
    });

    test('Should NOT return an error when quizId DOES refer to a quiz that the user owns', () => {
        const { authUserId: userId1 } = adminAuthRegister('test1@example.com', 'password', 'John', 'Doe');
        const { authUserId: userId2 } = adminAuthRegister('test2@example.com', 'password2', 'Jane', 'Smith');
        const { quizId } = adminQuizCreate(userId1, 'Test Quiz', 'This is a test quiz');
        const result = adminQuizRemove(userId1, quizId);
        expect(result).not.toHaveProperty('error');
    });
});
