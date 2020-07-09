// socket.emit -- send event to a specifit client
// io.emit -- send event to every connected client
// socket.broadcast.emit -- send event to every connected client except πχ αμα μπει ενας νεος στο chat θα ερθει μηνυμα A new user has joined! εκτος αυτον που μπηκε τωρα
// io.to.emit -- emit (send) a event to everybody in a specific room ετσι θα μπορουμε να στελνουμε ενα μηνυμα σε ενα room χωρις να το βλεπουν αυτοι που δεν ανηκουν στο room
// socket.broadcast.to.emit -- send event to everyone except specific client but its limited to a specific chat room

//serve up the public directory-1
const path = require("path");
//το βαλαμε οταν βαλαμε το websocket
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

const app = express();
//το βαλαμε οταν βαλαμε το websocket
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
//serve up the public directory-2
const publicDirectoryPath = path.join(__dirname, "../public");

//configure the server
/* //First up we're going to use the Express static middleware to serve up what's ever in this directory */
app.use(express.static(publicDirectoryPath));

//let count = 0;

// server (emit) -> client (receive) - countUpdated
// cleint (emit) -> server(receive) - increment

//use methods on socket to communicate with that specific client.
io.on("connection", (socket) => {
  console.log("new web socket connection");

  //socket.emit("message", generateMessage("Welcome!"));
  //socket.broadcast.emit("message", generateMessage("A new user has joined!"));

  /* //το socketio μας δινει ενα feature να μπορουμε μπαινουμε σε ενα δωματιο συγκεκριμενο δωματιο που φτιαξαμε αυτο γινεται με socket.join ειναι method που μπορει να χρησιμοποιηεθι μονο στον server */
  /* allows us to join a given chat room and we pass to the name of the room we're trying to join. */
  //απο οτι κατλαβα θα μπορουσε αντι για const { error, user } = να μπει const user= addUser({ id: socket.id, username, room });
  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }
    //ειχαμε socket.join(room); με το (user.room) ειμαστε σιγουροι οτι χρησιμοποιουμε τα data Που παιρνουμε απο το addUser
    socket.join(user.room);

    socket.emit("message", generateMessage("Admin", "Welcome!"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("Admin", `${user.username} has joined!`)
      );
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed");
    }

    io.to(user.room).emit("message", generateMessage(user.username, message));
    callback();
  });

  socket.on("sendLocation", (coords, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        user.username,
        `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
    );
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} has left!`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

//το βαλαμε οταν βαλαμε το websocket
// για να δουλεψει ο server αντι για app.listen(port, () => { βαλαμε server.
server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
