import {
    adminAuthRegister,
    adminAuthLogin,
} from '../../auth';
import {
    clear,
} from '../../other';

const ERROR = { error: expect.any(String) };


beforeEach( () => {
    clear();
})

describe ('Should successfuly log in under normal conditions.', () => { 
    test('Should log in John Doe, the only user on the entire platform', () => {
        const johnId = adminAuthRegister('johndoe@gmail.com', 'password123', 'John', 'Doe');
        expect(adminAuthLogin('johndoe@gmail.com', 'password123')).toEqual(johnId);
    })  
    test('Should log in Jane Doe, the only user on the entire platform other than john', () => {
        const johnId = adminAuthRegister('johndoe@gmail.com', 'password123', 'John', 'Doe');
        const janeId = adminAuthRegister('janedoe@gmail.com', 'password123', 'Jane', 'Doe');
        expect(adminAuthLogin('johndoe@gmail.com', 'password123')).toEqual(johnId);
        expect(adminAuthLogin('janedoe@gmail.com', 'password123')).toEqual(janeId);
    })   
});


describe ('Should throw an error message under error conditions', () => {
    test('Should throw error, if email isnt registered', () => {
        expect(adminAuthLogin('johndoe@gmail.com', 'password123')).toEqual(ERROR);
    })
    test('Should throw error, if email is registered but pass incorrect', () => {
        adminAuthRegister('johndoe@gmail.com', 'password123', 'John', 'Doe');
        expect(adminAuthLogin('johndoe@gmail.com', 'Password123')).toEqual(ERROR);
    })
    test('Should throw error, if correct password correlates with a different correct email', () => {
        adminAuthLogin('johndoe@gmail.com', 'password123', 'John', 'Doe');
        adminAuthLogin('janedoe@gmail.com', 'diffpassw0rd', 'Jane', 'Doe');
        expect(adminAuthLogin('johndoe@gmail.com', 'diffpassw0rd')).toEqual(ERROR);
    })
})