module.exports = (io, socket, activeUsers) => {

  socket.on("getActiveUsers", async (appId)=>{
    io.to(appId).emit("activeUsers", activeUsers[appId]);
  })

  socket.on("joinRoom", (appId) => {
  
    socket.join(appId);
  });
  
  socket.on("leaveRoom", (appId) => {
    socket.leave(appId);
  });

};
