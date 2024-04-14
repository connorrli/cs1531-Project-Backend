import request from 'sync-request-curl';
import { url, port } from '../../config.json';
import { userCreateRequest, quizCreateRequestV2, quizInfoRequestV2, quizThumbnailRequest } from '../requests';
const ERROR = { error: expect.any(String) };
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { qs: {} });
});

describe('adminQuizthumbnailUpdate function tests', () => {
  test('Should return an error when quizId does not refer to a valid quiz', () => {
    const userResponse = userCreateRequest('john1@example.com', 'password346', 'John', 'One');
    const token = userResponse.token;

    const quizResponse = quizCreateRequestV2(token, 'Quiz 1', 'Description');
    const quizId = quizResponse.quizId;

    const invalidQuizId = quizId + 1;

    const thumbnailUrl = 'https://example.com/image.jpg';
    const response = quizThumbnailRequest(token, invalidQuizId, thumbnailUrl);
    expect(response).toStrictEqual(ERROR);

    const quizInfo = quizInfoRequestV2(token, quizId);
    expect(quizInfo.thumbnailUrl).toBe('');
  });

  test('Should return an error when quizId does not refer to a quiz that the user owns', () => {
    const ownerResponse = userCreateRequest('simon3@example.com', 'password213', 'Simon', 'Three');
    const nonOwnerResponse = userCreateRequest('timS@example.com', 'password432', 'Tim', 'Santhosh');
    const ownerToken = ownerResponse.token;
    const nonOwnerToken = nonOwnerResponse.token;

    const quizResponse = quizCreateRequestV2(ownerToken, 'Owner Quiz', 'Qwner Description');
    const quizId = quizResponse.quizId;

    const thumbnailUrl = 'https://example.com/new-image.jpg';
    const response = quizThumbnailRequest(nonOwnerToken, quizId, thumbnailUrl);

    expect(response).toStrictEqual(ERROR);

    const quizInfo = quizInfoRequestV2(ownerToken, quizId);
    expect(quizInfo.thumbnailUrl).toBe('');
  });

  test('Should return an error when the thumbnail URL does not end with the correct file type', () => {
    const userResponse = userCreateRequest('bob3@example.com', 'password549', 'Bob', 'Three');
    const token = userResponse.token;

    const quizResponse = quizCreateRequestV2(token, 'Quiz 2', 'Descriptions');
    const quizId = quizResponse.quizId;

    const thumbnailUrl = 'https://example2.com/new-image.avif';
    const response = quizThumbnailRequest(token, quizId, thumbnailUrl);

    expect(response).toStrictEqual(ERROR);

    const quizInfo = quizInfoRequestV2(token, quizId);
    expect(quizInfo.thumbnailUrl).toBe('');
  });

  test('Should return an error when the thumbnail URL does not start with the correct protocol', () => {
    const userResponse = userCreateRequest('jane3@example.com', 'password978', 'Jane', 'Three');
    const token = userResponse.token;

    const quizResponse = quizCreateRequestV2(token, 'Quiz 3', 'A sample description');
    const quizId = quizResponse.quizId;

    const thumbnailUrl = 'ftp://example2.com/new-image.png';
    const response = quizThumbnailRequest(token, quizId, thumbnailUrl);

    expect(response).toStrictEqual(ERROR);

    const quizInfo = quizInfoRequestV2(token, quizId);
    expect(quizInfo.thumbnailUrl).toBe('');
  });

  test('Success case', () => {
    const userResponse = userCreateRequest('peterpan@example.com', 'password542', 'Peter', 'Pan');
    const token = userResponse.token;

    const quizResponse = quizCreateRequestV2(token, 'Quiz 3', 'A sample description');
    const quizId = quizResponse.quizId;

    const initialThumbnailUrl = 'https://example2.com/initial-image.png';
    const initialResponse = quizThumbnailRequest(token, quizId, initialThumbnailUrl);

    expect(initialResponse).toStrictEqual({});

    let quizInfo = quizInfoRequestV2(token, quizId);
    expect(quizInfo.thumbnailUrl).toBe(initialThumbnailUrl);

    const newThumbnailUrl = 'https://example2.com/new-image.png';
    const response = quizThumbnailRequest(token, quizId, newThumbnailUrl);
    expect(response).toStrictEqual({});

    quizInfo = quizInfoRequestV2(token, quizId);
    expect(quizInfo.thumbnailUrl).toBe(newThumbnailUrl);
  });
});
