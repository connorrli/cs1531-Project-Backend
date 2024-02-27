import { clear } from '../other.js';
import { getData, setData } from './dataStore.js';

beforeEach(() => {
    // Set up some initial data before each test
    setData({ users: [{ id: 1, name: 'John' }], quizzes: [{ id: 1, title: 'Math Quiz' }] });
});

test('Should clear user data', () => {
    // Call clear function
    clear();

    // Assert that user data is cleared
    const userData = getData('users');
    expect(userData).toEqual([]);
});

test('Should clear quiz data', () => {
    // Call clear function
    clear();

    // Assert that quiz data is cleared
    const quizData = getData('quizzes');
    expect(quizData).toEqual([]);
});
