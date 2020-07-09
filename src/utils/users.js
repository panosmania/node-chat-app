// keeping track users
const users = [];

//addUser -- allow to track a new user
//removeUser -- allow us to stop tracking a user
//getUser -- allow us to fetch data from a existing user
//getUsersInRoom -- allow us to get a complete list of all of the users in a specific room

const addUser = ({ id, username, room }) => {
  //clean data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //validate data
  if (!username || !room) {
    return {
      error: "Username and room are required"
    };
  }

  //check for existing user
  const existingUser = users.find(user => {
    return user.room === room && user.username === username;
  });

  //validate username
  if (existingUser) {
    return {
      error: "Username is in use"
    };
  }

  //Store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

//findIndex βρισκει την θεση στο array
//splice remove items from a array by index , το υποδηλωνει ποσα items θελουμε να σβηστουν 1
const removeUser = id => {
  const index = users.findIndex(user => {
    return user.id === id;
  });

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = id => {
  return users.find(user => user.id === id);
};

const getUsersInRoom = room => {
  room = room.trim().toLowerCase();
  return users.filter(user => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
};

// addUser({
//   id: 22,
//   username: "Andrew ",
//   room: "greece"
// });

// addUser({
//   id: 42,
//   username: "Mike",
//   room: "greece"
// });

// addUser({
//   id: 22,
//   username: "Andrew",
//   room: "kavala"
// });

// const user = getUser(42);
// console.log(user);

// const userList = getUsersInRoom("");
// console.log(userList);

// console.log(users);

// const removedUser = removeUser(22);
// console.log(removedUser);
// console.log(users);
