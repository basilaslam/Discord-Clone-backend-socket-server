const io = require('socket.io')(5555, {
    cors: {
        origin: '*'
    }
})

let activeUsers = [];

io.on('connection', (socket) => {
let a = 1
    socket.on('new-user-add', (newUserId) => {
        // if user already added
        if (activeUsers.some(user => user.userId === newUserId)) {
            const currentUserIdx = activeUsers.findIndex(user => user.userId === newUserId);
            activeUsers.splice(currentUserIdx, 1);
        }
        activeUsers.push({
            userId: newUserId,
            socketId: socket.id
        });
        io.emit('get-users', activeUsers);
    })

    socket.on('connect-room',({roomId})=>{
        socket.join(roomId)
        console.log('joined',a++);
    })

    socket.on('send-message', ({roomId, message}) => {
        
            io.to(roomId).emit('recieve-message', message)

            console.log('hello', message) 
    })

    socket.on("send-notification", (data) => {
        const { receiver } = data;
        const user = activeUsers.find(user => {
            return user.userId === receiver
        })
    
        if (user) {
            console.log({ data });
            io.to(user.socketId).emit('receive-notification', data)
        }
    })

    socket.on('disconnect', () => {
        activeUsers = activeUsers.filter(user => user.socketId !== socket.id);
        io.emit('get-users', activeUsers);
    })


})
