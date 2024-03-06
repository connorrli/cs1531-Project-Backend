import { adminQuizCreate } from '../../quiz.js';
import { adminAuthRegister } from '../../auth.js';
import { clear } from '../../other.js';

describe('adminQuizDescriptionUpdate function tests', () => {

    beforeEach(() => {
        clear();
    })

    test('Should return an error when AuthUserId is not a valid user', () => {
        const { authUserId } = adminAuthRegister('test@example.com', 'password', 'John', 'Doe');
        const { quizId } = adminQuizCreate(authUserId, 'Test Quiz', 'This is a test quiz');

        const newDescription = 'This is an updated test quiz description';

        const invalidAuthUserId = authUserId + 1;

        const result = adminQuizDescriptionUpdate(invalidAuthUserId, quizId, newDescription);
        expect(result).toEqual({ error: 'Not a valid authUserId.' });
    });


    test('Should return an error when AuthUserId is not a valid user', () => {
    
        expect(result).toEqual({error: 'Not a valid authUserId.'});
    });

    test('Should return an error when AuthUserId is not a valid user', () => {
   
        expect(result).toEqual({error: 'Not a valid authUserId.'});
    });

    test('Should return an error when AuthUserId is not a valid user', () => {

        expect(result).toEqual({error: 'Not a valid authUserId.'});
    });
});

