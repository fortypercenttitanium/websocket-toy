const button = document.querySelector('button');
button.addEventListener('click', () => {
	const socket = new WebSocket('ws://localhost:8081');
	socket.onopen = function (event) {
		console.log('connected!');
	};
});
