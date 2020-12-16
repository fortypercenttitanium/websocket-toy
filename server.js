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
		connection.isAlive = true;
		connection.on('pong', heartbeat);
		console.log(
			'client list:',
			connection.clients.map((client) => client.id)
		);
	} catch (err) {
		console.error(err);
	}
});

const interval = setInterval(function ping() {
	wss.clients.forEach((client) => {
		if (client.isAlive) return client.terminate();
		client.isAlive = false;
		client.ping();
	});
}, 5000);

function heartbeat() {
	this.isAlive = true;
}

wss.on('close', (connection) => {
	console.log('closing ID: ', connection.id);
	clearInterval(interval);
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}...`);
});
