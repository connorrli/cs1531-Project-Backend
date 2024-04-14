import request from 'sync-request-curl';
import { url, port } from '../../config.json';
import { guestPlayerStatus } from '../requests'; // add player join

const ERROR = { error: expect.any(String) };

const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
    request('DELETE', SERVER_URL + '/v1/clear', { qs: {} });
});

test('Invalid playerId', () => {
    const playerId1 = 123;
    const response = guestPlayerStatus(playerId1);
    expect(response).toStrictEqual(ERROR);
});
test('Correct output for 1 guest player', () => {
    const guest1 = playerJoin();
    const response = guestPlayerStatus(guest1);
    expect(response).toStrictEqual(2); // check how to make it pass
});

test('Correct output for 2 guest player', () => {
    const guest1 = playerJoin();
    const guest2 = playerJoin();

    const response1 = guestPlayerStatus(guest1);
    const response2 = guestPlayerStatus(guest2);

    console.log(response1);
    console.log(response2);

    expect(response1).toStrictEqual(2); // check how to make it pass
    expect(response2).toStrictEqual(2);
});