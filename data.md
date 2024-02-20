```javascript
let data = {
    users: [
        // Example object for user
        {
            userId: 1,
            nameFirst: "Connor",
            nameLast: "Li",
            email: "z5425430@ad.unsw.edu.au",
            password: "password123",
        },
    ],

    quizzes: [
        // Example object for quiz
        {
            quizId : 1,
            name: "Test Quiz",
            timeCreated: 02202024,
            timeLastEdited: 02202024,
            description: "This is a test quiz",
            /* Question stored with answer
            Question answers (for now) numbered left->right, top->bottom
            Array for multiple answers */
            questions: [
                ["What is the capital of Australia?", [1]],
                ["How much could a woodchuck chuck if a woodchuck could chuck wood?", [1, 3]],
                ["What is the meaning of life?", [2]], 
            ],
        },
    ],
}
```

[Optional] short description: 
There are 2 arrays, one which stores user data and one that stores quiz data. Each user and quiz is identified by relevant Id. 