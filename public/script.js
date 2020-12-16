const connect = document.querySelector('.socket-connector');
const messenger = document.querySelector('.message-container');

connect.addEventListener('submit', (e) => {
	e.preventDefault();
	const socket = new WebSocket('ws://localhost:8081');
	socket.onopen = (event) => {
		const name = e.target[0].value;
		socket.send(JSON.stringify({ type: 'SET_NAME', payload: name }));
		if (socket.readyState === 1) {
			document.querySelector('.connection-status').textContent = 'Connected!';
			messenger.style.display = 'flex';
		}
	};
	socket.onerror = (error) => {
		console.error(error);
	};
	socket.onmessage = (message) => {
		const action = JSON.parse(message.data);
		const { type, payload } = action;
		console.log('received: ', action);
		if (type === 'SET_USER_ID') {
			socket.id = payload;
		}
		if (type === 'CLIENT_LIST') {
			const list = document.querySelector('.recipient');
			while (list.firstChild) {
				list.removeChild(list.firstChild);
			}
			payload.forEach((client) => {
				if (client.id !== socket.id) {
					const option = document.createElement('option');
					option.textContent = `${client.userName} (id: ${client.id})`;
					option.value = client.id;
					list.appendChild(option);
				}
			});
		}
	};
});

messenger.addEventListener('submit', (e) => {
	e.preventDefault();
	const message = e.target[0].value;
	console.log('sending message: ', message);
	socket.send(message);
	e.target[0].value = '';
});
