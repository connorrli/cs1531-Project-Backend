import request from 'sync-request-curl';
import { url, port } from '../../config.json';
import { response } from 'express';
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
    request('DELETE', SERVER_URL + '/v1/clear', { qs: {} });
});

// 'quizCreateRequest' function
const quizCreateRequest = (token: string, name: string, description: string) => {
    const response = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token, name, description } });
    return JSON.parse(response.body.toString());
};

const authRegisterReq = (email: string, password: string, nameFirst: string, nameLast: string) => {
    const response = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { nameFirst, nameLast, email, password } });
    const { token } = JSON.parse(response.body.toString());
    return token;
};

// 'quizListReq' function
const quizListReq = (token: string) => {
    const response = request('GET', SERVER_URL + '/v1/admin/quiz/list', { qs: { token } });
    return JSON.parse(response.body.toString());
};

const quizTransferReq = (token: string, quizId: number, userEmail: string) => {
    const response = request('POST', SERVER_URL + `/v1/admin/quiz/` + quizId.toString() + `/transfer`, { json: { token, userEmail }});
    return JSON.parse(response.body.toString());
}

describe('adminQuizTransfer', () => {
    test('should transfer ownership of a quiz to a different user', () => {
        const user1Token = authRegisterReq("user1@example.com", "password123", "User", "One");
        const user2Token = authRegisterReq("user2@example.com", "password123", "User", "Two");
        
        const quizId = quizCreateRequest(user1Token, "Quiz 1", "Description");
        const result = quizTransferReq(user1Token, quizId.quizId, "user2@example.com");

        const updatedData = quizListReq(user2Token).quizzes;
        expect(updatedData[0].quizId).toEqual(quizId.quizId);
        expect(result).toStrictEqual({});
    });

    test('should return an error if the user is not the owner of the quiz', () => {
        const user1Token = authRegisterReq("user1@example.com", "password123", "User", "One");
        const user2Token = authRegisterReq("user2@example.com", "password123", "User", "Two");
        
        const quizId = quizCreateRequest(user1Token, "Quiz 1", "Description");
        const result = quizTransferReq(user2Token, quizId.quizId, "user2@example.com");
        expect(result).toStrictEqual({ error: "User is not the owner of quiz", statusValue: 403 });
    });

    test('should return an error if the quiz is not found', () => {
        const user1Token = authRegisterReq("user1@example.com", "password123", "User", "One");
        const user2Token = authRegisterReq("user2@example.com", "password123", "User", "Two");
        
        const quizId = quizCreateRequest(user1Token, "Quiz 1", "Description");
        const result = quizTransferReq(user1Token, quizId.quizId + 1, "user2@example.com");
        expect(result).toStrictEqual({ error: "Quiz not found" });
    });

    test('should return an error if the specified userEmail is not associated with any user', () => {
        const user1Token = authRegisterReq("user1@example.com", "password123", "User", "One");
        const user2Token = authRegisterReq("user2@example.com", "password123", "User", "Two");
        
        const quizId = quizCreateRequest(user1Token, "Quiz 1", "Description");
        const result = quizTransferReq(user1Token, quizId.quizId, "nonexistent@example.com");
        expect(result).toStrictEqual({ error: "UserEmail is not a real user" });
    });

    test('should return an error if the new owner is the current owner', () => {
        const user1Token = authRegisterReq("user1@example.com", "password123", "User", "One");
        authRegisterReq("user2@example.com", "password123", "User", "Two");
        
        const quizId = quizCreateRequest(user1Token, "Quiz 1", "Description");
        const result = quizTransferReq(user1Token, quizId.quizId, "user1@example.com");
        expect(result).toStrictEqual({ error: "New owner is the current owner" });
    });

    test('should return an error if the new owner already owns a quiz with the same name', () => {
        const user1Token = authRegisterReq("user1@example.com", "password123", "User", "One");
        const user2Token = authRegisterReq("user2@example.com", "password123", "User", "Two");
        const quizId1 = quizCreateRequest(user1Token, "Quiz 1", "Description");
        const quizId2 = quizCreateRequest(user2Token, "Quiz 1", "Description");
        console.log("quizId1:", quizId1);
        const result = quizTransferReq(user1Token, quizId1.quizId, 'user2@example.com');
    
        expect(result).toStrictEqual({ error: "Duplicate quiz name for new owner" });
    }); 
}); 
