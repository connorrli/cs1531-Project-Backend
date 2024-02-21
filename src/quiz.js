function adminQuizList(authUserId) {
    return {
        quizzes: [
            {
            quizId: 1,
            name: 'My Quiz',
            }
        ]
    }
}

function adminQuizDescriptionUpdate(authUserId, quizId, description) {
    return {}
}

function adminQuizRemove(authUserId, quizId) {
    return {};
}

function adminQuizCreate(authUserId, name, description) {
    return {
      quizID: 2
    };
}

/*
    adminQuizInfo stub. idk what it does yet
*/
function adminQuizInfo(authUserId, quizId) {
    return {
        quizId: 1,
        name: 'My Quiz',
        timeCreated: 1683125870,
        timeLastEdited: 1683125871,
        description: 'This is my quiz',
    }
}

/*
    adminQuizNameUpdate stub.
*/
function adminQuizNameUpdate(authUserId, quizId, name) {
    return {}
}