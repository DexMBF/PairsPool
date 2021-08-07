import "dotenv-safe/config";
import mongoose from "mongoose";
import { PancakeFactory } from "./lib/Helpers";
import { addPair } from "./lib/QueueManager";
import "./server";

(async () => {
	await mongoose.connect(process.env.MONGODB_DATABASE as string, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
		useCreateIndex: true,
	});

	console.log(`[db] Connected..`);
	PancakeFactory.on("PairCreated", async (token0: string, token1: string, pairAddress: string) => {
		await addPair({
			token0,
			token1,
			pairAddress,
			date: Math.floor(Date.now() / 1000),
		});
	});
})();
