const button = document.querySelector('button');
button.addEventListener('click', socketHandler);
let socket;
function socketHandler(event) {
	if (!socket) {
		socket = new WebSocket('ws://localhost:8081');
	} else {
		console.log('socket already connected!', socket);
	}
	socket.onopen = function (event) {
		document.querySelector('.connection-status').textContent = 'Connected!';
		console.log('connected!');
		socket.on('ping', console.log('got ping'));
	};
}
