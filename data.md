```javascript
let data = {
    users: [
        // Example object for user
        {
            userId: 1,
            nameFirst: 'Connor',
            nameLast: 'Li',
            email: 'z5425430@ad.unsw.edu.au',
            password: 'password123',
        },
        {
            // Next user
        },
    ],

    quizzes: [
        // Example object for quiz
        {
            quizId : 1,
            name: 'Test Quiz',
            timeCreated: 02202024,
            timeLastEdited: 02202024,
            description: 'This is a test quiz',
            questions: [
                'What is the capital of Australia?',
                'How much could a woodchuck chuck if a woodchuck could chuck wood?',
                'What is the meaning of life?', 
            ],
            // List of options paired with correct answer(s). Number is option no., not index.
            // We can change this later.
            answers: [
                [['Sydney', 'Tokyo', 'Canberra', 'Adelaide'], [3]],
                [['idk', 42, 'as much as they can', 16], [1, 4]],
                [['get rich', 'start a family', 'there is no meaning', 42], [4]]
            ],
        },
        {
            // Next quiz
        },
    ],
}
```

[Optional] short description: 
There are 2 arrays, one which stores user data and one that stores quiz data. Each user and quiz is identified by relevant Id. 