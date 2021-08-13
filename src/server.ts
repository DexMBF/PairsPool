import { Job } from "bullmq";
import fs from "fs";
import http from "http";
import https from "https";
import { Server } from "socket.io";
import { PairWorker } from "./lib/QueueManager";
import Pair from "./models/Pair.model";

let server;
const history: PairEmitData[] = [];

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

	socket.on("init", () => {
		socket.emit("init", history);
	});
});

server.listen(process.env.SOCKETIO_PORT, async () => {
	console.log(`[server] listening on port ${process.env.SOCKETIO_PORT}`);
	const results = await Pair.find()
		.populate("token0", "-_id -__v")
		.populate("token1", "-_id -__v")
		.select("-__v")
		.sort({ _id: -1 })
		.lean()
		.exec();
	if (results.length > 0) {
		history.push(...(results as unknown as PairEmitData[]));
	}
});

PairWorker.on("completed", (job: Job, value: PairEmitData) => {
	if (!value) return;
	const arr = [...history].slice(0, 24);
	arr.unshift(value);
	history.length = 0;
	history.push(...arr);
	io.emit("pair:new", value);
});

export { io };
