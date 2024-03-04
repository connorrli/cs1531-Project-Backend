import { adminAuthRegister } from "../auth";
import { adminQuizCreate, adminQuizInfo } from "../quiz";
import { clear } from "../other";

describe('adminQuizInfo function tests', () => {

    beforeEach(() => {
        clear();
    })

    test('Returns quiz information for a valid quiz owned by the user', () => {
        const { authUserId } = adminAuthRegister('test@example.com', 'password', 'John', 'Doe');
        const { quizId } = adminQuizCreate(authUserId, 'Test Quiz', 'This is a test quiz');
        const quizInfo = adminQuizInfo(authUserId, quizId);
        expect(quizInfo).toEqual({
            quizId: quizId,
            authUserId: authUserId,
            name: 'Test Quiz',
            timeCreated: expect.any(Number), // THIS MIGHT NEED TO CHANGE
            timeLastEdited: expect.any(Number), // THIS MIGHT NEED TO CHANGE
            description: 'This is a test quiz'
        });
    });

    test('Returns an error when authUserId is not a valid user', () => {
        const quizInfo = adminQuizInfo(42, 42);
        expect(quizInfo).toEqual({ error: 'Not a valid authUserId.' });
    });

    test('Returns an error when quizId is not a valid quiz', () => {
        const { authUserId } = adminAuthRegister('test@example.com', 'password', 'John', 'Doe');
        const quizInfo = adminQuizInfo(authUserId, 42);
        expect(quizInfo).toEqual({ error: 'Not a valid quizId.' });
    });

    test('Returns an error when quizId is not owned by authUserId', () => {
        const { authUserId: userId1 } = adminAuthRegister('user1@example.com', 'password', 'First', 'User');
        const { authUserId: userId2 } = adminAuthRegister('user2@example.com', 'password', 'Second', 'User');
        const { quizId } = adminQuizCreate(userId1, 'User 1 Quiz', 'This is a quiz created by user 1');
        const quizInfo = adminQuizInfo(userId2, quizId);
        expect(quizInfo).toEqual({ error: 'authUserId does not own quiz with ID quizId' });

    });

    
});
