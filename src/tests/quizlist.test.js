import { adminQuizList, adminQuizCreate, adminQuizInfo } from '../quiz.js';
import { adminAuthRegister } from '../auth.js';
import { clear } from '../other.js';

describe('Testing quizList function:', () => {

    let user1;
    let user2;

    beforeEach(() => {
        clear();
        user1 = adminAuthRegister('test@gmail.com', 'Password123', 'John', 'Doe').authUserId;
    });

    test('Check if there is a quiz list for user', () => {
        const test1 = adminQuizList(user2);
        expect(test1).toStrictEqual({ error: 'AuthUserId is not a valid user'});

    });

    test('AuthUserId is not a valid user', () => {
        const { authUserId } = adminAuthRegister('test@egmail.com', 'password', 'Walt', 'Smith');
        const result = adminQuizList(authUserId + 1);
        expect(result).toEqual({ error: 'AuthUserId is not a valid user' });
    });

});