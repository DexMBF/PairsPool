import http from "http";
import { Server } from "socket.io";
const server = http.createServer();
const io = new Server(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});

io.on("connection", (socket) => {
	console.log(`[socket] client connected`);
	socket.on("disconnect", () => {
		console.log("Client disconnected");
	});
});

server.listen(process.env.SOCKETIO_PORT, () => {
	console.log(`[server] listening on port ${process.env.SOCKETIO_PORT}`);
});

export { io };
