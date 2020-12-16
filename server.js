const express = require('express');
const path = require('path');
const app = express();
const { nanoid } = require('nanoid');
const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;

const wss = new WebSocket.Server({ port: 8081 });

wss.on('connection', async (connection) => {
	try {
		connection.id = await nanoid(12);
		connection.send(
			JSON.stringify({ type: 'SET_USER_ID', payload: connection.id })
		);
		console.log('connected to ' + connection.id);
		const clientList = [];
		wss.clients.forEach((client) => {
			clientList.push({ id: client.id, userName: client.userName });
		});
		wss.clients.forEach((client) => {
			client.send(JSON.stringify({ type: 'CLIENT_LIST', payload: clientList }));
		});
		connection.on('message', (message) => {
			const action = JSON.parse(message);
			console.log('received: ', action);
			const { type, payload } = action;
			switch (type) {
				case 'SET_NAME': {
					connection.userName = payload;
					break;
				}
				case 'SEND_MESSAGE_TO_USER': {
					const recipient = payload.recipient;
					wss.clients.find((client) => client.id === recipient).send(payload);
					break;
				}
				case 'SEND_MESSAGE_TO_ALL': {
					wss.clients.forEach((client) => client.send(payload));
				}
				default: {
					console.log(payload);
					break;
				}
			}
		});
		// connection.isAlive = true;
		// connection.on('pong', heartbeat);
		// console.log(
		// 	'client list:',
		// 	connection.clients.map((client) => client.id)
		// );
	} catch (err) {
		console.error(err);
	}
});

// const interval = setInterval(function ping() {
// 	wss.clients.forEach((client) => {
// 		if (client.isAlive) return client.terminate();
// 		client.isAlive = false;
// 		client.ping();
// 	});
// }, 5000);

// function heartbeat() {
// 	this.isAlive = true;
// }

wss.on('close', (connection) => {
	console.log('closing ID: ', connection.id);
	clearInterval(interval);
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}...`);
});
