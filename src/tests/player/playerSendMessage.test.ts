import request from 'sync-request-curl';
import { url, port } from '../../config.json';
import { sendChatMessage } from '../requests'; // add player join

const ERROR = { error: expect.any(String) };

const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
    request('DELETE', SERVER_URL + '/v1/clear', { qs: {} });
});

test('Invalid playerId', () => {
    const playerId1 = 123;
    const response = sendChatMessage(playerId1);
    expect(response).toStrictEqual(ERROR);
});

test('Message < 1 character', () => {
    const guest1 = playerJoin();
    const response = sendChatMessage(guest1, '');
    expect(response).toStrictEqual(ERROR);
});

test('Message > 100 character', () => {
    const guest1 = playerJoin();
    const response = sendChatMessage(guest1, 'qewdqwdqwdq wqdqwdqwdqbhnid dqiowhdioqwhodiqhw dioqhwdoiqwhdihqoilwdhoq iqahndoiqwh');
    expect(response).toStrictEqual(ERROR);
});

test('Correct output', () => {
    const guest1 = playerJoin();
    const response = sendChatMessage(guest1, 'hello my friends');

    //console.log() to see if items came out correctly

    expect(response).toStrictEqual({});
});

test('2 guest players join and send messages', () => {
    const guest1 = playerJoin();
    const guest2 = playerJoin();

    const guest1FirstMessage = sendChatMessage(guest1, 'I am guest 1');
    const guest1SecondMessage = sendChatMessage(guest1, 'I will be number 1');
    const guest2Message = sendChatMessage(guest2, 'Guest 2 here');

    expect(guest1FirstMessage).toStrictEqual(ERROR); // change to success
    expect(guest1SecondMessage).toStrictEqual(ERROR); // change to success
    expect(guest2Message).toStrictEqual(ERROR); // change to success
});