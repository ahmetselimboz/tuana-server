module.exports = (io, socket)=>{
    socket.on("trackEvent", (data)=>{
        console.log("🚀 ~ socket.on ~ data:", data)
    })
   
}