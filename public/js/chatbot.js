// Chatbot options
botOptions = function() {
	const restart=()=> {
		socket.emit('resetCount') 		
		window.location.reload(true)
	}
	
	const fetchApi=()=>{
		$.getJSON("https://api.icndb.com/jokes/random", function(chuckNorris) {
		let message = chuckNorris.value.joke
		socket.emit('joke', message)})
	}
	
	const countJokes = () =>{
		socket.emit('increment') 
		socket.on('countUpdated', (count)=>{
		console.log('The count of jokes has been updated!', count)})		
	}
	
	// Ask for more jokes
	
	const additionalJokes = () => {
		const getMoreJokes = new Promise ((resolve, reject)=> {
			setTimeout(()=> {
			$messageFormButton.removeAttribute('disabled')
			resolve (socket.emit('joke', "Would you like to see more jokes? If yes type 'yes' otherwise type 'no'.")) 
			}, 2000)
		})
			getMoreJokes.then (Jokes => {				
			   let onSubmitListener2 = ""
			   $messageForm.addEventListener('submit', onSubmitListener2 =(e)=> {
			   e.stopPropagation()
			   e.preventDefault()

			   let answer = e.target.elements.message.value

			   //Yes & No question 									
			   if (answer=='yes'){
				countJokes()
				fetchApi();
				console.log('Asked for another joke!')
			   }	

			   else if(answer=='no'){
				socket.emit('joke', 'Thank you for participating! See you next time!')
				$messageForm.removeEventListener('submit', onSubmitListener2)
			   }

			   else if(answer=='joke'){
				$messageForm.removeEventListener('submit', onSubmitListener2)
			   }				

				})					
			})
				.catch(error => {
					console.log(error)
				})
	}

	return{
		restart:restart,
		fetchApi:fetchApi,
		countJokes:countJokes,
		additionalJokes: additionalJokes
	}
}()
