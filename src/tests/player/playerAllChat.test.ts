import request from 'sync-request-curl';
import { url, port } from '../../config.json';
import { allChatMessages, sendChatMessage } from '../requests'; // add 'playerjoin'

const ERROR = { error: expect.any(String) };

const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
    request('DELETE', SERVER_URL + '/v1/clear', { qs: {} });
});

test('Invalid playerId', () => {
    const playerId1 = 123;
    const response = allChatMessages(playerId1);
    expect(response).toStrictEqual(ERROR);
});

test('Correct output', () => {
    const guest1 = playeJoin();
    const message1 = sendChatMessage(guest1, 'hello');
    const message2 = sendChatMessage(guest1, 'my name is walter');
    const message3 = sendChatMessage(guest1, 'the weather is good today');

    const response = allChatMessages(guest1);
    console.log(response);

    expect(response).toStrictEqual(success); // check how to make it pass
});

test('2 guest players join and send messages', () => {
    const guest1 = playerJoin();
    const guest2 = playerJoin();

    const guest1FirstMessage = sendChatMessage(guest1, 'I am guest 1');
    const guest1SecondMessage = sendChatMessage(guest1, 'I will be number 1');
    const guest2Message = sendChatMessage(guest2, 'Guest 2 here');

    const response1 = allChatMessages(guest1);
    const response2 = allChatMessages(guest2);

    console.log(response1);
    console.log(response2);

    expect(response1).toStrictEqual(ERROR); // change to success
    expect(response2).toStrictEqual(ERROR); // change to success
});