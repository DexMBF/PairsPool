import "dotenv-safe/config";

import mongoose from "mongoose";
import { ethers } from "ethers";
import ERC21Abi from "./abi/ERC21.json";
import Token from "./models/Token.model";

const Provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed1.ninicoin.io");
const PancakeFactory = new ethers.Contract(
	"0xca143ce32fe78f1f7019d7d551a6402fc5350c73",
	["event PairCreated(address indexed token0, address indexed token1, address pair, uint)"],
	Provider
);

(async () => {
	await mongoose.connect(process.env.MONGODB_DATABASE as string, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
		useCreateIndex: true,
	});

	console.log(`Connected..`);
	PancakeFactory.on("PairCreated", async (token0: string, token1: string, pairAddress	: string) => {
		const tokenZero = new ethers.Contract(token0, ERC21Abi, Provider);
		const tokenOne = new ethers.Contract(token1, ERC21Abi, Provider);
		const tokens = await Token.find({
			address: { $in: [token0.toLowerCase(), token1.toLowerCase()] },
		});

		let tokenHash = 0;
		const searchTokens = [];
		const dbTokenZero = tokens.find((token) => token.address === token0.toLowerCase());
		if (!dbTokenZero) {
			tokenHash += 1;
			searchTokens.push(...[tokenZero.name(), tokenZero.symbol()]);
		}

		const dbTokenOne = tokens.find((token) => token.address === token1.toLowerCase());
		if (!dbTokenOne) {
			tokenHash += 2;
			searchTokens.push(...[tokenOne.name(), tokenOne.symbol()]);
		}

		if (tokenHash === 0) return console.log("Nothing to search");

		const results = (await Promise.allSettled(searchTokens)).filter((p) => p.status === "fulfilled");
		if (results.length !== searchTokens.length) return console.log("Something broke");

		if (
			results[0].status === "rejected" ||
			results[1].status === "rejected" ||
			(results[2] && results[2].status === "rejected") ||
			(results[3] && results[3].status === "rejected")
		)
			return;

		const tokenDocuments: any[] = [];
		switch (tokenHash) {
			case 1: // token0 only
			case 2:
				tokenDocuments.push({
					address: tokenHash === 1 ? token0.toLowerCase() : token1.toLowerCase(),
					name: results[0].value.trim(),
					symbol: results[1].value.trim(),
				});
				break;
			case 3:
				tokenDocuments.push({
					address: token0.toLowerCase(),
					name: results[0].value.trim(),
					symbol: results[1].value.trim(),
				});
				tokenDocuments.push({
					address: token1.toLowerCase(),
					name: results[2].value.trim(),
					symbol: results[3].value.trim(),
				});
				break;
			default:
				throw new Error("Shouldnt even be here");
		}

		const inserts = await Token.insertMany(tokenDocuments);
		console.log(inserts);
		console.log(`---------------- DONE ----------------`);
	});
})();
