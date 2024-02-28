// Import the function to be tested
const { adminQuizDescriptionUpdate } = require('../quiz'); // Replace 'quiz' with the actual module/file name

describe('adminQuizDescriptionUpdate', () => {
  // Test case 1: Valid parameters
  test('updates description successfully', () => {
    const authUserId = 123; // Replace with valid authUserId
    const quizId = 456; // Replace with valid quizId
    const newDescription = 'New quiz description';
    const result = adminQuizDescriptionUpdate(authUserId, quizId, newDescription);
    expect(result).toEqual({});
  });

  // Test case 2: Non-existent quiz ID
  test('throws an error for non-existent quiz ID', () => {
    const authUserId = 123; // Replace with valid authUserId
    const quizId = -1; // Replace with a non-existent quizId
    const newDescription = 'New quiz description';
    expect(() => adminQuizDescriptionUpdate(authUserId, quizId, newDescription)).toThrow('Quiz not found');
  });

  // Test case 3: Empty description
  test('throws an error for empty description', () => {
    const authUserId = 123; // Replace with valid authUserId
    const quizId = 456; // Replace with valid quizId
    const newDescription = '';
    expect(() => adminQuizDescriptionUpdate(authUserId, quizId, newDescription)).toThrow('Description cannot be empty');
  });

  // Test case 4: Invalid auth user ID
  test('throws an error for invalid auth user ID', () => {
    const authUserId = -1; // Replace with an invalid authUserId
    const quizId = 456; // Replace with valid quizId
    const newDescription = 'New quiz description';
    expect(() => adminQuizDescriptionUpdate(authUserId, quizId, newDescription)).toThrow('Unauthorized');
  });

  // Add more test cases as needed based on your requirements
});

