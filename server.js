const express = require('express');
const path = require('path');
const app = express();
const { nanoid } = require('nanoid');
const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;

const wss = new WebSocket.Server({ port: 8081 });

const clients = [];

wss.on('connection', async (connection) => {
	try {
		connection.id = await nanoid(12);
		clients.push(connection);
		console.log(
			'client list:',
			clients.map((client) => client.id)
		);
	} catch (err) {
		console.error(err);
	}
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}...`);
});
