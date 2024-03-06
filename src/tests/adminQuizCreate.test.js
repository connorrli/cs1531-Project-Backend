import { adminQuizCreate } from '../quiz.js';
import { adminAuthRegister } from '../auth.js';
import { clear } from '../other.js';

describe('Testing QuizCreate function:', () => {
    
    let quiz1;
    let quiz2;
    let user1;

    beforeEach(() => {
        clear();
        user1 = adminAuthRegister('test@gmail.com', 'Password123', 'John', 'Doe').authUserId;
    });

    // AuthUserId is not valid

    test('AuthUserId is not a valid user', () => { //Other tests work but with this, it overrides them and give "AuthuserId is not valid"
        quiz1 = adminQuizCreate(user1, 'name', 'description');
        expect(quiz1).toEqual({ error: 'AuthUserId is not a valid user' });
    });

    //Invalid character in name
    test('Name contains an invalid character', () => {
        const { authUserId } = adminAuthRegister('test@egmail.com', 'password', 'Walt', 'Smith');
        quiz1 = adminQuizCreate(authUserId, '@@@@', 'simple description');
        expect(quiz1).toEqual({ error: 'Name contains an invalid character' });
    });

    test('Name contains an invalid character', () => {
        const { authUserId } = adminAuthRegister('test@egmail.com', 'password', 'Walt', 'Smith');
        quiz1 = adminQuizCreate(authUserId, 'Johnny@1', 'simple description');
        expect(quiz1).toEqual({ error: 'Name contains an invalid character' });
    });

    // Quiz name < 3 or > 30
    test('Name < 3 characters', () => {
        const { authUserId } = adminAuthRegister('test@egmail.com', 'password', 'Walt', 'Smith');
        quiz1 = adminQuizCreate(authUserId, 'qu', 'simple description');
        expect(quiz1).toEqual({ error: 'Quiz name is < 3 characters' });
    });

    test('Name > 30 characters', () => {
        const { authUserId } = adminAuthRegister('test@egmail.com', 'password', 'Walt', 'Smith');
        quiz1 = adminQuizCreate(authUserId, 'quizname that would be more than 30 characters long', 'simple description');
        expect(quiz1).toEqual({ error: 'Quiz name is > 30 characters' });
    });

    // Quiz description > 100
    test('Description > 100 characters', () => {
        const { authUserId } = adminAuthRegister('test@egmail.com', 'password', 'Walt', 'Smith');
        quiz1 = adminQuizCreate(authUserId, 'quizname', 'The inexorable march of technological advancement continues unabated, revolutionizing industries, reshaping economies, and fundamentally altering the way we live, work, and interact with the world around us.');
        expect(quiz1).toEqual({ error: 'Quiz description is > 100 characters' });
    });

    // Quiz name already in use
    test('Quiz name is already in use', () => {
        let authUserId1 = adminAuthRegister('123@email.com', '1234qwe', 'test', 'ting');
        let authUserId2 = adminAuthRegister('123456@email.com', '1234qwe456', 'test6', '6ting');
        quiz1 = adminQuizCreate(authUserId1, 'samename', 'simple description');
        quiz2 = adminQuizCreate(authUserId2, 'samename', 'description');
        expect(quiz2).toStrictEqual({ error: 'Quiz name is already in use' });
    })
});