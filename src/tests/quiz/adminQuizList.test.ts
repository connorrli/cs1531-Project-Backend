import { adminQuizList, adminQuizCreate } from '../../quiz';
import { adminAuthRegister } from '../../auth';
import { clear } from '../../other';

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
    })

    // Checking if function produces correct output
    test('Correctly print quiz list', () => {
        list1 = adminQuizCreate(user1, 'nameOfQuiz', 'description');
        const result = adminQuizList(user1);
        expect(result).toEqual({ quizzes : [{ quizId: list1.quizId, name: 'nameOfQuiz' }]});
        console.log(result);
    })
});