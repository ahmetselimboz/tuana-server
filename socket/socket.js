const dataSockets = require("./dataSockets");

const connectedUsers = new Set();

module.exports = (io) => {
  io.on("connection", async (socket) => {

    socket.on("register", () => {
      console.log("Register event received for socket id:", socket.id);
      connectedUsers.add(socket.id);
      console.log(
        "A user connected. Total connected users:",
        connectedUsers.size
      );
    });

    
    dataSockets(io, socket);


    socket.on("disconnect", () => {
      connectedUsers.delete(socket.id);
      console.log(
        "A user disconnected. Total connected users:",
        connectedUsers.size
      );
    });
  });
};
