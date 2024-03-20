import { adminQuizList, adminQuizCreate } from '../../quiz';
import { clear } from '../../other';
import { url, port } from '../../config.json';
import request from 'sync-request-curl';

const SERVER_URL = `${url}:${port}`;

describe('Testing quizList function:', () => {

    let user1;
    let user1_id : number;
    let list1;

    const adminAuthRegister = (email: string, password: string, nameFirst: string, nameLast: string) => {
        const result = request('POST', SERVER_URL + '/v1/admin/auth/register', {json: {nameFirst, nameLast, email, password}});
        return JSON.parse(result.body.toString());
    }

    beforeEach(() => {
        clear();
        user1 = adminAuthRegister('test@gmail.com', 'Password123', 'John', 'Doe');
        if ('authUserId' in user1) user1_id = user1.authUserId;
        else user1_id = undefined;
    });

    // AuthUserId is not valid
    test('AuthUserId is not a valid user', () => {
        list1 = adminQuizCreate(user1_id, 'name', 'description');
        const result = adminQuizList(user1_id + 1);
        expect(result).toEqual({ error: 'AuthUserId is not a valid user' });
    })

    // Checking if function produces correct output
    test('Correctly print quiz list', () => {
        list1 = adminQuizCreate(user1_id, 'nameOfQuiz', 'description');
        const result = adminQuizList(user1_id);
        expect(result).toEqual({ quizzes : [{ quizId: list1.quizId, name: 'nameOfQuiz' }]});
        console.log(result);
    })
});