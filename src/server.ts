import http from "http";
import https from "https";
import { Server } from "socket.io";
import fs from "fs";

let server;

if (process.env.ENVIRONMENT && process.env.ENVIRONMENT === "prod") {
	console.log("[server] prod environment");
	const opts = {
		key: fs.readFileSync(process.env.SSL_KEY as string),
		cert: fs.readFileSync(process.env.SSL_CERT as string),
		ca: fs.readFileSync(process.env.SSL_CHAIN as string),
	};
	server = https.createServer(opts);
} else {
	console.log("[server] dev environment");
	server = http.createServer();
}

const io = new Server(server, {
	cors: {
		origin: process.env.CORS_WHITELIST?.split(",") ?? "*",
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
