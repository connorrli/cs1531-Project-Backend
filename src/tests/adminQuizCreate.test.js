import { adminQuizCreate, adminQuizList, adminQuizInfo } from '../quiz.js';
import { adminAuthRegister } from '../auth.js';
import { clear } from '../other.js';

describe('Testing QuizCreate function:', () => {
    
    let quiz1;

    beforeEach(() => {
        clear();
    });

    /*test('AuthUserId is not a valid user', () => { //something is wrong here
        const { authUserId } = adminAuthRegister('test@egmail.com', 'password', 'Walt', 'Smith');
        const result = adminQuizCreate(authUserId + 1, 'testing', 'Test authuserid not valid');
        expect(result).toEqual({ error: 'AuthUserId is not a valid user' });
    });*/

    /*test('Name contains an invalid character', () => {
        const { authUserId } = adminAuthRegister('test@egmail.com', 'password', 'Walt', 'Smith');
        quiz1 = adminQuizCreate(authUserId, '@@@@', 'simple description');
        expect(quiz1).toEqual({ error: 'Name contains an invalid character' });
    });*/

    test('Name < 3 or > 30 characters long', () => {
        const { authUserId } = adminAuthRegister('test@egmail.com', 'password', 'Walt', 'Smith');
        quiz1 = adminQuizCreate(authUserId, 'qu', 'simple description');
        expect(quiz1).toEqual({ error: 'Quiz name is < 3 characters' });
    });

    test('Name > 30 characters long', () => {
        const { authUserId } = adminAuthRegister('test@egmail.com', 'password', 'Walt', 'Smith');
        quiz1 = adminQuizCreate(authUserId, 'quizname that would be more than 30 characters long', 'simple description');
        expect(quiz1).toEqual({ error: 'Quiz name is > 30 characters' });
    });

    /*test('Name is already in use by another logged in user', () => {
        const { authUserId } = adminAuthRegister('test@egmail.com', 'password', 'Walt', 'Smith');
        const result = adminQuizCreate(authUserId + 1);
        expect(result).toEqual({ error: 'AuthUserId is not a valid user' });
    });*/

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

    test('Description = 100 characters', () => {
        const { authUserId } = adminAuthRegister('test@egmail.com', 'password', 'Walt', 'Smith');
        quiz1 = adminQuizCreate(authUserId, 'quizname', 'Thequickbrownfoxjumpsoverthelazydogprovingthedogslackofmotivationforanyactionwhatsoever');
        expect(quiz1).toEqual({ error: 'Quiz description is > 100 characters' });
    });


});