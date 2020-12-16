const express = require('express');
const path = require('path');
const http = require('http');
const app = express();
const { nanoid } = require('nanoid');
const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

wss.on('connection', async (connection) => {
	try {
		// assign unique id to the socket connection
		connection.id = await nanoid(12);
		console.log('connected to ' + connection.id);

		// send the ID back to the client - this is just to set up a ping/pong effect
		// to fire the next event, which is to rehydrate the client list
		connection.send(
			JSON.stringify({ type: 'SET_USER_ID', payload: connection.id })
		);

		connection.on('message', (message) => {
			const action = JSON.parse(message);
			console.log('received: ', action);

			// using a reducer-style syntax for handling actions
			const { type, payload } = action;

			// update client list for users after any message
			// insert this in heartbeat connection monitor when complete
			const clientList = [];

			// wss.clients is a set, so most array methods won't work
			// we reformat this as an array so the client has a list they can easily work with
			wss.clients.forEach((client) => {
				clientList.push({ id: client.id, userName: client.userName });
			});

			// send this array to all clients
			wss.clients.forEach((client) => {
				client.send(
					JSON.stringify({ type: 'CLIENT_LIST', payload: clientList })
				);
			});

			// action handler
			switch (type) {
				case 'SET_NAME': {
					connection.userName = payload;
					break;
				}
				case 'SEND_MESSAGE_TO_USER': {
					const { recipient, message } = payload;
					const delivery = {
						type: 'MESSAGE_FROM_USER',
						payload: {
							sender: { userName: connection.userName, id: connection.id },
							message,
						},
					};
					// attach recipient's username to message
					for (client of wss.clients) {
						if (client.id === recipient) {
							delivery.payload.recipient = {
								id: client.id,
								userName: client.userName,
							};
						}
					}
					// send the message to sender and receiver
					for (client of wss.clients) {
						if (client.id === recipient || client.id === connection.id) {
							client.send(JSON.stringify(delivery));
						}
					}
					break;
				}
				case 'SEND_MESSAGE_TO_ALL': {
					const delivery = {
						type: 'MESSAGE_TO_ALL',
						payload: {
							sender: {
								userName: connection.userName,
								id: connection.id,
							},
							message: payload,
						},
					};
					wss.clients.forEach((client) =>
						client.send(JSON.stringify(delivery))
					);
					break;
				}
				default: {
					console.log(payload);
					break;
				}
			}
		});

		connection.on('close', () => {
			console.log('Closed connection: ' + connection.id);
		});
	} catch (err) {
		console.error(err);
	}
});

app.use(express.static(path.join(__dirname, 'public')));

server.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}...`);
});
