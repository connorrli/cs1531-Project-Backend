import { adminQuizList, adminQuizCreate } from '../quiz.js';
import { adminAuthRegister } from '../auth.js';
import { clear } from '../other.js';

describe('Testing quizList function:', () => {

    let user1;
    let list1;

    beforeEach(() => {
        clear();
        user1 = adminAuthRegister('test@gmail.com', 'Password123', 'John', 'Doe').authUserId;
    });

    // AuthUserId is not valid
    test('AuthUserId is not a valid user', () => {
        list1 = adminQuizCreate(user1, 'name', 'description');
        const result = adminQuizList(user1 + 1);
        expect(result).toEqual({ error: 'AuthUserId is not a valid user' });
    });
});