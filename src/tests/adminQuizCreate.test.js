import { adminQuizCreate, adminQuizList, adminQuizInfo } from '../quiz.js';
import { adminAuthRegister } from '../auth.js';
import { clear } from '../other.js';

describe('Testing QuizCreate function:', () => {

    let user1;
    
    beforeEach(() => {
        clear();
        user1 = adminAuthRegister('test@gmail.com', 'Password123', 'John', 'Doe').authUserId;
    });

    test('AuthUserId is not a valid user', () => {
        const { authUserId } = adminAuthRegister('test@egmail.com', 'password', 'Walt', 'Smith');
        const result = adminQuizCreate(authUserId + 1);
        expect(result).toEqual({ error: 'AuthUserId is not a valid user' });
    });

});