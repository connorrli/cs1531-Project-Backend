import { getData } from "../data/dataStore";

export function adminPlayerJoin(name: string, sessionId: number) { 
    if (name.length === 0) {
        name = randPlayerName();
    }
    return;
}

function randPlayerName (): string {
    let string: string = String.fromCharCode(Math.random() * 26 + 97);
    let newchar: string = String.fromCharCode(Math.random() * 26 + 97);
    while (string.length < 5) {
        if (string.includes(newchar)) {
            newchar = String.fromCharCode(Math.random() * 26 + 97);
        } else {
            string += newchar;
        }
    }
    let newint = Math.floor((Math.random() * 9.9)).toString();
    string += newint;
    while (string.length < 8) {
        if (string.includes(newint)) {
            newint = Math.floor((Math.random() * 9.9)).toString();
        } else {
            string+= newint;
        }
    }
    return string;
}