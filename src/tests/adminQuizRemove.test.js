import { adminQuizRemove, adminQuizCreate } from '../quiz.js';
import { adminAuthRegister } from '../auth.js';
import { clear } from '../other.js';




describe('adminQuizRemove function tests', () => {

    beforeEach(() => {
        clear();
    })

    test('Should remove a quiz owned by the user', () => {
        const { authUserId } = adminAuthRegister('test@example.com', 'password', 'John', 'Doe');
        const { quizId } = adminQuizCreate(authUserId, 'Test Quiz', 'This is a test quiz');
        const result = adminQuizRemove(authUserId, quizId);
        expect(result).toEqual({});
    });

    test('Should return an error when authUserId is invalid', () => {
        const { authUserId } = adminAuthRegister('test@example.com', 'password', 'John', 'Doe');
        const { quizId } = adminQuizCreate(authUserId, 'Test Quiz', 'This is a test quiz');
        const result = adminQuizRemove(authUserId + 1, quizId);
        // expect(result).toEqual({ error: 'ADD SPECIFIC ERROR MESSAGE HERE' });
        expect(result).toHaveProperty('error');
    });

    test('Should return an error when quizId does not refer to a valid quiz', () => {
        const { authUserId } = adminAuthRegister('test@example.com', 'password', 'John', 'Doe');
        const result = adminQuizRemove(authUserId, 123);
        expect(result).toHaveProperty('error');
    });

    test('Should return an error when quizId does not refer to a quiz that the user owns', () => {
        const { authUserId: userId1 } = adminAuthRegister('test1@example.com', 'password', 'John', 'Doe');
        const { authUserId: userId2 } = adminAuthRegister('test2@example.com', 'password2', 'Jane', 'Smith');
        const { quizId } = adminQuizCreate(userId1, 'Test Quiz', 'This is a test quiz');
        const result = adminQuizRemove(userId2, quizId);
        expect(result).toHaveProperty('error');
    });
});
