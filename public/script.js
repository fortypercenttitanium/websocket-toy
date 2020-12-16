const socket = new WebSocket('ws://localhost:8081');
socket.onopen = function (event) {
	console.log('connected!');
};
socket.onerror = function (error) {
	console.error(error);
};

const button = document.querySelector('button');
button.addEventListener('click', () => {
	document.querySelector('.connection-status').textContent = socket.isAlive
		? ' connected.'
		: ' not connected.';
});
