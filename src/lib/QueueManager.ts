import { Queue, Worker } from "bullmq";
import { ethers } from "ethers";
import ERC21Abi from "../abi/ERC21.json";
import Pair, { IPair } from "../models/Pair.model";
import Token, { IToken } from "../models/Token.model";
import { Provider } from "./Helpers";

const connection = {
	password: process.env.REDIS_PASSWORD as string,
};

const PairQueue = new Queue("PairQueue", { connection });

const addPair = async (opts: PairOpts): Promise<void> => {
	console.log(`[addPair] ${JSON.stringify(opts)}`);
	await PairQueue.add("NewPair", opts);
};

const PairWorker = new Worker<PairOpts>(
	"PairQueue",
	async (job) => {
		try {
			console.log(`[PairWorker] Processing queue ${JSON.stringify(job.data)}`);
			const { token0, token1, pairAddress, date } = job.data;
			const tokenZeroCOntract = new ethers.Contract(token0, ERC21Abi, Provider);
			const tokenOneContract = new ethers.Contract(token1, ERC21Abi, Provider);

			const tokens = await Token.find({
				address: { $in: [token0.toLowerCase(), token1.toLowerCase()] },
			})
				.lean()
				.exec();

			let tokenHash = 0;
			const searchTokens = [];
			const pairDocument: Partial<IPair> = {
				date,
			};

			const dbTokenZero = tokens.find((token) => token.address === token0.toLowerCase());
			if (!dbTokenZero) {
				tokenHash += 1;
				searchTokens.push(...[tokenZeroCOntract.name(), tokenZeroCOntract.symbol()]);
			} else {
				pairDocument.token0 = dbTokenZero._id;
			}

			const dbTokenOne = tokens.find((token) => token.address === token1.toLowerCase());
			if (!dbTokenOne) {
				tokenHash += 2;
				searchTokens.push(...[tokenOneContract.name(), tokenOneContract.symbol()]);
			} else {
				pairDocument.token1 = dbTokenOne._id;
			}

			if (tokenHash === 0) {
				return null;
			}

			const results = (await Promise.allSettled(searchTokens)).filter((p) => p.status === "fulfilled");
			if (results.length !== searchTokens.length) {
				return null;
			}

			if (
				results[0].status === "rejected" ||
				results[1].status === "rejected" ||
				(results[2] && results[2].status === "rejected") ||
				(results[3] && results[3].status === "rejected")
			) {
				return null;
			}

			const tokenDocuments: IToken[] = [];
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

			const tokensInsertResult = await Token.insertMany(tokenDocuments);
			switch (tokenHash) {
				case 1:
					pairDocument.token0 = tokensInsertResult[0]._id;
					break;
				case 2:
					pairDocument.token1 = tokensInsertResult[0]._id;
					break;
				case 3:
					pairDocument.token0 = tokensInsertResult[0]._id;
					pairDocument.token1 = tokensInsertResult[1]._id;
					break;
			}

			const pairUpsertResult = await Pair.findOneAndUpdate(
				{
					address: pairAddress.toLowerCase(),
				},
				pairDocument,
				{
					upsert: true,
					new: true,
					setDefaultsOnInsert: true,
				}
			).exec();

			const result = await Pair.findOne({ _id: pairUpsertResult._id })
				.populate("token0", "-_id -__v")
				.populate("token1", "-_id -__v")
				.select("-__v")
				.lean()
				.exec();
			console.log(`---------------- DONE ----------------`);
			return result;
		} catch (error) {
			console.log(error);
			return null;
		}
	},
	{ connection }
);

PairWorker.on("error", (err) => {
	console.error(err);
});

export { PairQueue, addPair, PairWorker };
