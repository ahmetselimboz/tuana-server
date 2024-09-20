


module.exports = (io, socket) => {
  socket.on("joinRoom", (appId) => {
    socket.join(appId);
  });
  
  socket.on("leaveRoom", (appId) => {
    socket.leave(appId);
  });

};
