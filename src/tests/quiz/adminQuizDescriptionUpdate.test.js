import { adminQuizCreate, adminQuizDescriptionUpdate, adminQuizInfo } from '../../quiz.js';
import { adminAuthRegister } from '../../auth.js';
import { clear } from '../../other.js';

describe('adminQuizDescriptionUpdate function tests', () => {
    beforeEach(() => {
        clear();
    });

    test('Should return an error when quizId does not refer to a valid quiz', () => {
        const { authUserId } = adminAuthRegister('test@example.com', 'password123', 'John', 'Doe');
    
        const { quizId } = adminQuizCreate(authUserId, 'Test Quiz', 'This is a test quiz');
        adminQuizDescriptionUpdate(authUserId, quizId, 'Updated Test Quiz Description');
    
        const result = adminQuizDescriptionUpdate(authUserId + 1, quizId, "");
        expect(result.error).toEqual(expect.any(String));
    });
    
    test('Should return an error when quizId does not refer to a quiz that the user owns', () => {
        const { authUserId: userId1 } = adminAuthRegister('test1@example.com', 'password643', 'John', 'Doe');
        const { authUserId: userId2 } = adminAuthRegister('test2@example.com', 'password292', 'Jane', 'Smith');
        const { quizId } = adminQuizCreate(userId1, 'Test Quiz', 'This is a test quiz');
    
        adminQuizDescriptionUpdate(userId1, quizId, 'Updated Test Quiz Description');
    
        const result = adminQuizDescriptionUpdate(userId2, quizId, "");
        expect(result.error).toEqual(expect.any(String));
    });

    test('Should return an error when the description is more than 100 characters in length', () => {
        const { authUserId } = adminAuthRegister('test@example.com', 'password433', 'John', 'Doe');
        const { quizId } = adminQuizCreate(authUserId, 'Test Quiz', 'This is a test quiz');

        const newDescription = 'This is a description longer than 100 characters. ' + '...'.repeat(50);
        const result = adminQuizDescriptionUpdate(authUserId, quizId, newDescription);
       
        expect(result.error).toEqual(expect.any(String));
    });

    test('Should update the quiz description successfully', () => {
        const { authUserId } = adminAuthRegister('test@example.com', 'password123', 'John', 'Doe');
        const { quizId } = adminQuizCreate(authUserId, 'Test Quiz', 'This is a test quiz');

        const newDescription = 'This is an updated test quiz description';
        adminQuizDescriptionUpdate(authUserId, quizId, newDescription);

        const quizInfo = adminQuizInfo(authUserId, quizId);

        expect(quizInfo.error).toBeUndefined();
        expect(quizInfo.description).toBe(newDescription);
    });
});
