import { Job } from "bullmq";
import fs from "fs";
import http from "http";
import https from "https";
import { Server } from "socket.io";
import { PairWorker } from "./lib/QueueManager";
import Pair from "./models/Pair.model";
import Token from "./models/Token.model";

let server;
const history: PairEmitData[] = [];
const stats = {
	pairs: 0,
	tokens: 0,
	users: 0,
	lastUpdated: 0,
};

const io = new Server(server, {
	cors: {
		origin: process.env.CORS_WHITELIST?.split(",") ?? "*",
		methods: ["GET", "POST"],
	},
});

async function getStats() {
	if (+Date.now() < stats.lastUpdated + 5000) return;
	try {
		const results = await Promise.allSettled([Pair.getUniquePairs(), Token.getUniqueTokens()]);
		if (results[0].status === "fulfilled") {
			stats.pairs = results[0].value;
		}

		if (results[1].status === "fulfilled") {
			stats.tokens = results[1].value;
		}

		stats.users = (await io.fetchSockets()).length;
		stats.lastUpdated = +Date.now();
	} catch (error) {
		console.error(error);
	}
}

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

io.on("connection", (socket) => {
	console.log(`[socket] client connected`);
	socket.on("disconnect", () => {
		console.log("Client disconnected");
	});

	socket.on("init", () => {
		socket.emit("init", history);
	});

	socket.on("stats", async () => {
		await getStats();
		socket.emit("stats", stats);
	});
});

server.listen(process.env.SOCKETIO_PORT, async () => {
	console.log(`[server] listening on port ${process.env.SOCKETIO_PORT}`);
	const results = await Pair.find()
		.populate("token0", "-_id -__v")
		.populate("token1", "-_id -__v")
		.select("-__v")
		.sort({ _id: -1 })
		.limit(25)
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
