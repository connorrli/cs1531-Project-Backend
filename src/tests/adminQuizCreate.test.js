import { adminQuizCreate, adminQuizList, adminQuizInfo } from '../quiz.js';
import { adminAuthRegister } from '../auth.js';
import { clear } from '../other.js';

describe('Testing QuizCreate function:', () => {
    
    let quiz1;
    let quiz2;

    beforeEach(() => {
        clear();
    });

    test('AuthUserId is not a valid user', () => { /////////////////////something is wrong here
        //const { authUserId } = adminAuthRegister('test@egmail.com', 'password', 'Walt', 'Smith');
        //const result = adminQuizCreate(authUserId + 1, 'testing', 'Test authuserid not valid');
        let authUserId1 = adminAuthRegister('123@email.com', '1234qwe', 'test', 'ting');
        quiz1 = adminQuizCreate(authUserId1 + 1, 'name', 'description')
        expect(result).toEqual({ error: 'AuthUserId is not a valid user' });
    });

    /*test('Name contains an invalid character', () => {
        const { authUserId } = adminAuthRegister('test@egmail.com', 'password', 'Walt', 'Smith');
        quiz1 = adminQuizCreate(authUserId, '@@@@', 'simple description');
        expect(quiz1).toEqual({ error: 'Name contains an invalid character' });
    });*/

    // Quiz name
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

    // Quiz description
   test('Description > 100 characters', () => {
        const { authUserId } = adminAuthRegister('test@egmail.com', 'password', 'Walt', 'Smith');
        quiz1 = adminQuizCreate(authUserId, 'quizname', 'simple description to test if it is over 100 characters long. This should be more than 100 dgqiudgiqdhuqwhdiuqhwiudhiqwhiduqwhuidhqw');
        expect(quiz1).toEqual({ error: 'Quiz description is > 100 characters' });
    });

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