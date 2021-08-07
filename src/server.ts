import http from "http";
import { Server } from "socket.io";
const server = http.createServer();
const io = new Server(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});

server.listen(process.env.SOCKETIO_PORT, () => {
	console.log(`Server listening on port ${process.env.SOCKETIO_PORT}`);
});

export { io };
