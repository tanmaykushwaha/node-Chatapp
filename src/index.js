const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage , generatelocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))

//let count = 0
//new connection socket is an object contains information
io.on('connection', (socket) => {
    
    console.log('New WebSocket connection')

    socket.on('join',(options, callback) => {

            const { error ,user} = addUser({ id: socket.id , ...options })
            if(error){
                   return callback(error)
            }
            socket.join(user.room)

            socket.emit('message', generateMessage('Admin' , 'Welcome'))
            socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined`))
            io.to(user.room).emit('roomData', {
                room : user.room,
                users : getUsersInRoom(user.room)
            })
            callback()
            
    })
    socket.on('sendMessage',(message,callback) => {

        const user = getUser(socket.id)
        //console.log(user.username)
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback('profanity is  not allowed')
        }
        io.to(user.room).emit('message', generateMessage(user.username ,message))
        callback()
    })
    socket.on('sendlocation',(coords ,callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generatelocationMessage(user.username , `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })


    socket.on('disconnect',() => {
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message', generateMessage(user.username ,`${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room : user.room,
                users : getUsersInRoom(user.room)
            })
        }
    })
    
})


server.listen(port ,() => {
    console.log(`server is on port ${port}! `)
})