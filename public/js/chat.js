const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $helpButton = document.querySelector('#help')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const helpMessageTemplate = document.querySelector('#help-message-template').innerHTML
const jokeMessageTemplate = document.querySelector('#joke-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })
						
const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('jokeMessage', (message) => {
    console.log(message)
    const html = Mustache.render(jokeMessageTemplate, {
        username: "Chatbot",
		message: message.text,		
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('helpMessage', (message) => {
    console.log(message)
    const html = Mustache.render(helpMessageTemplate, {
        username: "Help List",
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

   // Check the message

$messageForm.addEventListener('submit',(e)=> {	
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    let message = e.target.elements.message.value
	
    socket.emit('sendMessage', message, (error) => {
		
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
		
        if (error) {
       		return console.log(error)
    	}		

		// Ask for joke
		else if (message=='joke') {  
			console.log('Asked for joke!')	
			botOptions.fetchApi()
			botOptions.countJokes()
			botOptions.additionalJokes()
		}

		else if (message=="reset")	{
			botOptions.restart();
		}
	    
        else {
        	console.log('Message delivered!')
        }	
    })
})

$helpButton.addEventListener('click', () => {
    $helpButton.setAttribute('disabled', 'disabled')

          socket.emit('help')
            $helpButton.removeAttribute('disabled')
            console.log('Asked for help!')  
        
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
    }
})


