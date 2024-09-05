
const dataSockets = require('./dataSockets');
const userSockets = require('./userSockets');

module.exports = (io) => {
    io.on('connection', (socket) => {
     
      console.log('New connection established');
  
    //   Kullanıcı durumları (online/offline) ile ilgili Socket.IO event'ları
        userSockets(io, socket);

        dataSockets(io,socket)
  
      socket.on('disconnect', () => {
        console.log('User disconnected');
      });
    });
  };