const connect = document.querySelector('.socket-connector');
const messenger = document.querySelector('.message-container');

// wait till the form is submitted to connect so we can get a username immediately
connect.addEventListener('submit', (e) => {
	e.preventDefault();
	const socketURI = window.location.href.includes('localhost')
		? 'wss://https://benders-web-sockets.herokuapp.com:8081/'
		: 'ws://localhost:8081/';
	const socket = new WebSocket(socketURI);
	socket.onopen = () => {
		const name = e.target[0].value;
		socket.userName = name;
		// send the user's name to the user. keep the client app dumb
		socket.send(JSON.stringify({ type: 'SET_NAME', payload: name }));
		// do this when the connection is established - there are 4 ready states
		if (socket.readyState === 1) {
			document.querySelector('.connection-status').textContent = 'Connected!';
			document.querySelector(
				'.welcome'
			).textContent = `Hello, ${socket.userName}!`;
			document.querySelector('.socket-connector').style.display = 'none';
			messenger.style.display = 'flex';
		}
		// clear the input field
		e.target.reset();
	};
	// simple error handler
	socket.onerror = (error) => {
		console.error(error);
	};

	// this will handle all messages from the server
	socket.onmessage = (message) => {
		const action = JSON.parse(message.data);
		const { type, payload } = action;

		// reducer-style message parser
		switch (type) {
			case 'SET_USER_ID': {
				socket.id = payload;
				// sending this message will let the server know we are ready to receive the full client list
				// this helps the server because the client list is updated on each message received and
				// then sent to all clients
				socket.send(JSON.stringify({ type: 'info', payload: 'Got ID!' }));
				break;
			}
			case 'CLIENT_LIST': {
				const list = document.querySelector('.recipient');
				// clear the current options in the message list
				while (list.firstChild) {
					list.removeChild(list.firstChild);
				}
				// rehydrate the list of clients
				payload.forEach((client) => {
					if (client.id !== socket.id) {
						const option = document.createElement('option');
						option.textContent = `${client.userName}`;
						option.value = client.id;
						list.appendChild(option);
					}
				});
				// send to all option
				const allOption = document.createElement('option');
				allOption.textContent = 'ALL CLIENTS';
				allOption.value = 'ALL';
				list.appendChild(allOption);
				break;
			}
			case 'MESSAGE_FROM_USER': {
				const newMessage = document.createElement('p');
				// if we are the recipient, show the message
				if (payload.recipient.id === socket.id) {
					newMessage.textContent = `FROM ${payload.sender.userName}: ${payload.message}`;
				} else {
					// if we are the sender, also show the message
					newMessage.textContent = `TO ${payload.recipient.userName}: ${payload.message}`;
				}
				document.querySelector('.message-box').appendChild(newMessage);
			}
			case 'MESSAGE_TO_ALL': {
				const newMessage = document.createElement('p');
				newMessage.textContent = `From ${payload.sender.userName} TO ALL: ${payload.message}`;
				document.querySelector('.message-box').appendChild(newMessage);
			}
			default:
				console.log(payload);
		}
	};
	messenger.addEventListener('submit', (e) => {
		e.preventDefault();
		// mutate this variable depending on which action
		let message;
		const recipient = e.target[0].value;
		if (recipient === 'ALL') {
			message = JSON.stringify({
				type: 'SEND_MESSAGE_TO_ALL',
				payload: e.target[1].value,
			});
		} else {
			message = JSON.stringify({
				type: 'SEND_MESSAGE_TO_USER',
				payload: { recipient, message: e.target[1].value },
			});
		}
		// clear the input
		e.target.reset();
		socket.send(message);
	});
});
