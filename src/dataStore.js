// YOU SHOULD MODIFY THIS OBJECT BELOW ONLY
let data = {
  users: [
    {
        authUserId: 1,
        nameFirst: 'user1',
    },
    {
        authUserId: 2,
        nameFirst: 'user2',
    },

  ],
  quizzes: [
    {
        quizId: 1,
        name: 'quiz1',
        authUserId: 1,
    },
    {
        quizId: 2,
        name: 'quiz2',
        authUserId: 1,
    },

  ],
};

// YOU SHOULD MODIFY THIS OBJECT ABOVE ONLY

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// Use get() to access the data
function getData() {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData) {
  data = newData;
}

export { getData, setData };
