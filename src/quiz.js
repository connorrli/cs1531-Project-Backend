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
      quizID: 2,
    }
}
