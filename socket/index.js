// const {Server} = require('socket.io')
// const express = require('express')
// const app = express()
// const http = require('http')

// const server = http.createServer(app)
// const io = new Server(server,{
//     cors:{
//         origin: 'https://nabeelhash-chatapp.vercel.app',
//         credentials: true
//     },
//     transports: ['websocket', 'polling'] // Add this if necessary
// })

// //real time message online 
// const getReceiverId = function(receiverId) {
//     return users[receiverId]; // Returns the socket ID of the specified receiver
// };

// const users ={}
// io.on('connection',function(socket){
//     console.log('user connected',socket.id)
//     const userId = socket.handshake.query.userId
//     if(userId){
//         users[userId] = socket.id
//         console.log(users)
//     }
    
//     socket.on('newMessages', function(msg) {
//         console.log('Message received:', msg);
        
//         // Assuming msg.receiverId is the MongoDB ID of the recipient
//         const receiverSocketId = getReceiverId(msg.receiverId);

//         if (receiverSocketId) {
//             io.to(receiverSocketId).emit('return', msg);
//         } else {
//             console.log(`User with ID ${msg.receiverId} is not connected`);
//         }
//     });

//     socket.on('groupNewMessage',function(msg){
//         console.log(msg)
//         socket.broadcast.emit('groupIncomingMessage',msg)
//     })

//     socket.on('disconnect',function(){
//         console.log('user disconnected',socket.id)
//         delete users[userId]
//     })
// })


// module.exports = {app,server,io, getReceiverId}