const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateHelpMessage, generateJokeMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

let count=0  

const app = express()
const server = http.createServer(app)
const io = socketio(server)
const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New WebSocket connection')
	
	socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

		socket.emit('message', generateMessage('Chatbot', "Welcome! It's Chuck Norris Random Joke Machine! Type 'joke' to receive the first joke, type 'reset' to start over, click 'Help!' for command list. "))
        socket.broadcast.to(user.room).emit('message', generateMessage('Chatbot', `${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()
		
        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }
		
	io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

	
    socket.on('joke', (message) => {
    	if(count<=10){	
            const user = getUser(socket.id)
            io.to(user.room).emit('jokeMessage', generateJokeMessage(user.username, message))
    	}
    	else {
    		const user = getUser(socket.id)
    		io.to(user.room).emit('jokeMessage',generateJokeMessage(user.username, 'Sorry, no more jokes today... You will need to wait 24h for more or you can type "reset" and start over again.'))
    	}
    })
	
	// Set jokes limit to 10	   
    socket.emit('countUpdated', count)
	
    socket.on('increment', ()=> {
    	if(count<=10){
			count++
			io.emit('countUpdated', count)
    	}
    })

	// Reset number of jokes
	socket.on('resetCount', ()=>{
		count=0
	}) 	

    socket.on('help', () => {
        const user = getUser(socket.id)
        io.to(user.room).emit('helpMessage', generateHelpMessage(user.username))
        
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})
