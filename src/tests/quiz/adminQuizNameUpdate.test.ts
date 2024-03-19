import { adminQuizRemove, adminQuizCreate, adminQuizInfo, adminQuizNameUpdate, adminQuizList } from '../../quiz';
import { adminAuthRegister, adminUserDetails } from '../../auth';
import { clear } from '../../other';

const ERROR = { error: expect.any(String) };

describe('adminQuizNameUpdate function tests', () => {

    beforeEach(() => {
        clear();
    })

    test('Should correctly update the quiz name', () => {
        const authUser = adminAuthRegister('test@example.com', 'password123', 'John', 'Doe');
        if ('authUserId' in authUser) {
            const quiz = adminQuizCreate(authUser.authUserId, 'Quiz 1', 'Description');
            if ('quizId' in quiz) {
                const updatedQuizName = 'Updated Quiz Name';
                const result = adminQuizNameUpdate(authUser.authUserId, quiz.quizId, updatedQuizName);
                expect(result).toStrictEqual({});
                const quizInfo = adminQuizInfo(authUser.authUserId, quiz.quizId);
                if ('name' in quizInfo) {
                    expect(quizInfo.name).toStrictEqual(updatedQuizName);
                }
            }
        }
    });

    test('Should return an error when authUserId is invalid', () => {
        const authUser = adminAuthRegister('test@example.com', 'password123', 'John', 'Doe');
        if ('authUserId' in authUser) {
            const quiz = adminQuizCreate(authUser.authUserId, 'Test Quiz', 'This is a test quiz');
            if ('quizId' in quiz) {
                const result = adminQuizNameUpdate(authUser.authUserId + 1, quiz.quizId, 'name');
                expect(result).toStrictEqual(ERROR);
            }
        }
    });

    test('Should return an error when quizId does not refer to a valid quiz', () => {
        const authUser = adminAuthRegister('test@example.com', 'password123', 'John', 'Doe');
        if ('authUserId' in authUser) {
            const quiz = adminQuizCreate(authUser.authUserId, 'Test Quiz', 'This is a test quiz');
            if ('quizId' in quiz) {
                const result = adminQuizNameUpdate(authUser.authUserId, quiz.quizId + 1, 'name');
                expect(result).toStrictEqual(ERROR);
            }
        }
    });
    
    test('Should return an error when quizId does not refer to a quiz that the user owns', () => {
        const authUser1 = adminAuthRegister('test1@example.com', 'password123', 'John', 'Doe');
        const authUser2 = adminAuthRegister('test2@example.com', 'password1232', 'Jane', 'Smith');

        if ('authUserId' in authUser1 && 'authUserId' in authUser2) {
            const quiz = adminQuizCreate(authUser1.authUserId, 'Test Quiz', 'This is a test quiz');
            if ('quizId' in quiz) {
                const result = adminQuizNameUpdate(authUser2.authUserId, quiz.quizId, 'name');
                expect(result).toStrictEqual(ERROR);
            }
        }
    });

    test('Should NOT return an error when quizId DOES refer to a quiz that the user owns', () => {
        const authUser1 = adminAuthRegister('test1@example.com', 'password123', 'John', 'Doe');
        const authUser2 = adminAuthRegister('test2@example.com', 'password1232', 'Jane', 'Smith');
        if ('authUserId' in authUser1 && 'authUserId' in authUser2) {
            const quiz = adminQuizCreate(authUser1.authUserId, 'Test Quiz', 'This is a test quiz');
            if ('quizId' in quiz) {
                const result = adminQuizNameUpdate(authUser1.authUserId, quiz.quizId, 'name');
                expect(result).not.toHaveProperty('error');
                const quizInfo = adminQuizInfo(authUser1.authUserId, quiz.quizId);
                if ('name' in quizInfo) {
                    expect(quizInfo.name).toStrictEqual('name');
                }
            }
        }
    });

    test('Should return error when name has invalid characters', () => {
        const authUser = adminAuthRegister("test@example.com", "password123", "John", "Doe");
        if ('authUserId' in authUser) {
            const quiz = adminQuizCreate(authUser.authUserId, "Quiz 1", "Description");
            if ('quizId' in quiz) {
                const result = adminQuizNameUpdate(authUser.authUserId, quiz.quizId, "Updated Name $");
                expect(result).toStrictEqual(ERROR);
            }
        }
    });

    test('Should return error when name is less than 3 characters long', () => {
        const authUser = adminAuthRegister("test@example.com", "password123", "John", "Doe");
        if ('authUserId' in authUser) {
            const quiz = adminQuizCreate(authUser.authUserId, "Quiz 1", "Description");
            if ('quizId' in quiz) {
                const result = adminQuizNameUpdate(authUser.authUserId, quiz.quizId, "A");
                expect(result).toStrictEqual(ERROR);
            }
        }
    });

    test('Should return error when name is more than 30 characters long', () => {
        const authUser = adminAuthRegister("test@example.com", "password123", "John", "Doe");
        if ('authUserId' in authUser) {
            const quiz = adminQuizCreate(authUser.authUserId, "Quiz 1", "Description");
            if ('quizId' in quiz) {
                const thirtyOneCharName = "abcdefghijklmnopqrstuvwxyzABCDE"
                const result = adminQuizNameUpdate(authUser.authUserId, quiz.quizId, thirtyOneCharName);
                expect(result).toStrictEqual(ERROR);
            }
        }
    });

    test('Should return error when name is already used by the current logged in user for another quiz', () => {
        const authUser = adminAuthRegister("test@example.com", "password123", "John", "Doe");
        if ('authUserId' in authUser) {
            adminQuizCreate(authUser.authUserId, "Quiz 1", "Description1");
            const quiz2 = adminQuizCreate(authUser.authUserId, "Quiz 2", "Description2");
            if ('quizId' in quiz2) {
                const result = adminQuizNameUpdate(authUser.authUserId, quiz2.quizId, "Quiz 1");
                expect(result).toStrictEqual(ERROR);
            }
        }
    });
});
