import request from 'sync-request-curl';
import { url, port } from '../../config.json';
import { userCreateRequest, quizCreateRequestV2, quizInfoRequestV2 } from '../requests';
const ERROR = { error: expect.any(String) };
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
    request('DELETE', SERVER_URL + '/v1/clear', { qs: {}});
});

const quizThumbnailRequest = (token: string, quizId: number, thumbnailUrl: string) => {
    const response = request('PUT', SERVER_URL + `/v1/admin/quiz/${quizId}/thumbnail`, { headers: { token }, json: { thumbnailUrl }});
    return JSON.parse(response.body.toString());
};

describe('adminQuizthumbnailUpdate function tests', () => {
    test('Should return an error when quizId does not refer to a valid quiz', () => {
        const userResponse = userCreateRequest('john1@example.com', 'password346', 'John', 'One');
        const token = userResponse.token;

        const quizResponse = quizCreateRequestV2(token, 'Quiz 1', 'Description');
        const quizId = quizResponse.quizId;

        const invalidQuizId = quizId + 1;

        const thumbnailUrl = 'https://example.com/image.jpg';
        const response = quizThumbnailRequest(token, invalidQuizId, thumbnailUrl);
        expect(response.toStrictEqual({ERROR}));

        const quizInfo = quizInfoRequestV2(token, quizId);
        expect(quizInfo.thumbnailUrl).toBe(null);
    });

    test('Should return an error when quizId does not refer to a quiz that the user owns', () => {

    });

    test('Should return an error when the thumbnail URL does not end with the correct file type', () => {

    });

    test('Should return an error when the thumbnail URL does not end with the correct protocol', () => {

    });

    test('Success case', () => {

    });
});