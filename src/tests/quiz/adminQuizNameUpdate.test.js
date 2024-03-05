import { adminQuizRemove, adminQuizCreate, adminQuizInfo, adminQuizNameUpdate, adminQuizList } from '../../quiz.js';
import { adminAuthRegister, adminUserDetails } from '../../auth.js';
import { clear } from '../../other.js';

describe('adminQuizNameUpdate function tests', () => {

    beforeEach(() => {
        clear();
    })

    test('Should correctly update the quiz name', () => {
        const authUserId = adminAuthRegister('test@example.com', 'password', 'John', 'Doe').authUserId;
        const quizId = adminQuizCreate(authUserId, 'Quiz 1', 'Description').quizId;
        const updatedQuizName = 'Updated Quiz Name';
        const result = adminQuizNameUpdate(authUserId, quizId, updatedQuizName);
        expect(result).toEqual({});
        const quizInfo = adminQuizInfo(authUserId, quizId);
        expect(quizInfo.name).toEqual(updatedQuizName);
    });

    test('Should return an error when authUserId is invalid', () => {
        const { authUserId } = adminAuthRegister('test@example.com', 'password', 'John', 'Doe');
        const { quizId } = adminQuizCreate(authUserId, 'Test Quiz', 'This is a test quiz');
        const result = adminQuizNameUpdate(authUserId + 1, quizId, 'name');
        expect(result).toEqual({ error: 'Not a valid authUserId.' });
    });

    test('Should return an error when quizId does not refer to a valid quiz', () => {
        const { authUserId } = adminAuthRegister('test@example.com', 'password', 'John', 'Doe');
        const { quizId } = adminQuizCreate(authUserId, 'Test Quiz', 'This is a test quiz');
        const result = adminQuizNameUpdate(authUserId, quizId + 1, 'name');
        expect(result).toEqual({ error: 'Not a valid quizId.' });
    });
    
    test('Should return an error when quizId does not refer to a quiz that the user owns', () => {
        const { authUserId: userId1 } = adminAuthRegister('test1@example.com', 'password', 'John', 'Doe');
        const { authUserId: userId2 } = adminAuthRegister('test2@example.com', 'password2', 'Jane', 'Smith');
        const { quizId } = adminQuizCreate(userId1, 'Test Quiz', 'This is a test quiz');
        const result = adminQuizNameUpdate(userId2, quizId, 'name');
        expect(result).toEqual({ error: 'Quiz ID does not refer to a quiz that this user owns.' });
    });

    test('Should NOT return an error when quizId DOES refer to a quiz that the user owns', () => {
        const { authUserId: userId1 } = adminAuthRegister('test1@example.com', 'password', 'John', 'Doe');
        const { authUserId: userId2 } = adminAuthRegister('test2@example.com', 'password2', 'Jane', 'Smith');
        const { quizId } = adminQuizCreate(userId1, 'Test Quiz', 'This is a test quiz');
        const result = adminQuizNameUpdate(userId1, quizId, 'name');
        expect(result).not.toHaveProperty('error');
        const quizInfo = adminQuizInfo(userId1, quizId);
        expect(quizInfo.name).toEqual('name');
    });

    test('Should return error when name has invalid characters', () => {
        const authUserId = adminAuthRegister("test@example.com", "password", "John", "Doe").authUserId;
        const quizId = adminQuizCreate(authUserId, "Quiz 1", "Description").quizId;
        const result = adminQuizNameUpdate(authUserId, quizId, "Updated Name $");
        expect(result).toEqual({ error: 'Name contains invalid characters. Valid characters are alphanumeric and spaces.' });
    });

    test('Should return error when name is less than 3 characters long', () => {
        const authUserId = adminAuthRegister("test@example.com", "password", "John", "Doe").authUserId;
        const quizId = adminQuizCreate(authUserId, "Quiz 1", "Description").quizId;
        const result = adminQuizNameUpdate(authUserId, quizId, "A");
        expect(result).toEqual({ error: 'Name must be between 3 and 30 characters long.' });
    });

    test('Should return error when name is more than 30 characters long', () => {
        const authUserId = adminAuthRegister("test@example.com", "password", "John", "Doe").authUserId;
        const quizId = adminQuizCreate(authUserId, "Quiz 1", "Description").quizId;
        const thirtyOneCharName = "abcdefghijklmnopqrstuvwxyzABCDE"
        const result = adminQuizNameUpdate(authUserId, quizId, thirtyOneCharName);
        expect(result).toEqual({ error: 'Name must be between 3 and 30 characters long.' });
    });

    test('Should return error when name is already used by the current logged in user for another quiz', () => {
        const authUserId = adminAuthRegister("test@example.com", "password", "John", "Doe").authUserId;
        adminQuizCreate(authUserId, "Quiz 1", "Description1");
        const secondQuizId = adminQuizCreate(authUserId, "Quiz 2", "Description2").quizId;
        const result = adminQuizNameUpdate(authUserId, secondQuizId, "Quiz 1");
        expect(result).toEqual({ error: 'Name must not be identical to your other quiz names.' });
    });
    
});
