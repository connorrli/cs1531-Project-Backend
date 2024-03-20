import { adminQuizCreate } from '../../quiz';
///import { adminAuthRegister } from '../../auth';
import { clear } from '../../other';
import { url, port } from '../../config.json';
import request from 'sync-request-curl';

const SERVER_URL = `${url}:${port}`;

const adminAuthRegister = (email: string, password: string, nameFirst: string, nameLast: string) => {
    const result = request('POST', SERVER_URL + '/v1/admin/auth/register', {json: {nameFirst, nameLast, email, password}});
    return JSON.parse(result.body.toString());
}

describe('Testing QuizCreate function:', () => {
    
    let quiz1;
    let quiz2;
    let user1_id : number;
    let user1;

    beforeEach(() => {
        clear();
        user1 = adminAuthRegister('test@gmail.com', 'Password123', 'John', 'Doe');
        if ('authUserId' in user1) user1_id = user1.authUserId;
        else user1_id = undefined;
    });
    test('successful output upon successful input', () => {
        quiz1 = adminQuizCreate(user1_id, "Scrimbo", "bloink");
        expect(quiz1).toStrictEqual({ quizId: expect.any(Number) });
        quiz2 = adminQuizCreate(user1_id, "scrimbo TWO", "buebr");
        expect(quiz2).toStrictEqual({ quizId: expect.any(Number) });

        if ('quizId' in quiz1 && 'quizId' in quiz2) expect(quiz1.quizId).not.toEqual(quiz2.quizId);
    });

    // AuthUserId is not valid
    test('AuthUserId is not a valid user', () => {
        const user1 = adminAuthRegister('email123@gmail.com', 'rtgfre356', 'Smith', 'Lee');
        quiz1 = adminQuizCreate(30, 'name', 'description');
        expect(quiz1).toStrictEqual({ error: 'AuthUserId is not a valid user' });
    });

    //Invalid character in name
    test('Name contains an invalid character', () => {
        const user = adminAuthRegister('testing@egmail.com', 'waltsmith123', 'Walt', 'Smith');
        let user_id : number;
        if ('authUserId' in user) user_id = user.authUserId;
        else user_id = undefined;
        quiz1 = adminQuizCreate(user_id, '@@@@', 'simple description');
        expect(quiz1).toStrictEqual({ error: 'Name contains an invalid character' });
    });

    test('Name contains an invalid character', () => {
        const user = adminAuthRegister('testing@egmail.com', 'waltsmith', 'Walt', 'Smith');
        let user_id : number;
        if ('authUserId' in user) user_id = user.authUserId;
        else user_id = undefined;
        quiz1 = adminQuizCreate(user_id, 'Johnny@1', 'simple description');
        expect(quiz1).toStrictEqual({ error: 'Name contains an invalid character' });
    });

    // Quiz name < 3 or > 30
    test('Name < 3 characters', () => {
        const user = adminAuthRegister('testing@egmail.com', 'waltsmith', 'Walt', 'Smith');
        let user_id : number;
        if ('authUserId' in user) user_id = user.authUserId;
        else user_id = undefined;
        quiz1 = adminQuizCreate(user_id, 'qu', 'simple description');
        expect(quiz1).toStrictEqual({ error: 'Quiz name is < 3 characters' });
    });

    test('Name > 30 characters', () => {
        const user = adminAuthRegister('test@egmail.com', 'password123', 'Walt', 'Smith');
        let user_id : number;
        if ('authUserId' in user) user_id = user.authUserId;
        else user_id = undefined;
        quiz1 = adminQuizCreate(user_id, 'quizname that would be more than 30 characters long', 'simple description');
        expect(quiz1).toStrictEqual({ error: 'Quiz name is > 30 characters' });
    });

    // Quiz description > 100
    test('Description > 100 characters', () => {
        const user = adminAuthRegister('test@egmail.com', 'password123', 'Walt', 'Smith');
        let user_id : number;
        if ('authUserId' in user) user_id = user.authUserId;
        else user_id = undefined;
        quiz1 = adminQuizCreate(user_id, 'quizname', 'The inexorable march of technological advancement continues unabated, revolutionizing industries, reshaping economies, and fundamentally altering the way we live, work, and interact with the world around us.');
        expect(quiz1).toStrictEqual({ error: 'Quiz description is > 100 characters' });
    });

    // Quiz name already in use
    test('Quiz name is already in use', () => {
        let authUserId1 = adminAuthRegister('123@email.com', '1234qwef', 'test', 'ting');
        expect('authUserId' in authUserId1).toStrictEqual(true);
        if ('authUserId' in authUserId1) {
            quiz1 = adminQuizCreate(authUserId1.authUserId, 'samename', 'simple description');
            quiz2 = adminQuizCreate(authUserId1.authUserId, 'samename', 'description');
            expect(quiz2).toStrictEqual({ error: 'Quiz name is already in use' });   
        }
    })
});