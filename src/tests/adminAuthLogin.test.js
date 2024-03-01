import {
    adminAuthRegister,
    adminAuthLogin,
} from '../auth.js';
import {
    clear,
} from '../other.js';

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

    })
    test('Should throw error, if email is registered but pass incorrect', () => {

    })

})