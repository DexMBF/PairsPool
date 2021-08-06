import "dotenv-safe/config";

import { ethers } from "ethers";
import { Database } from "./lib/Database";
import ERC21Abi from "./abi/ERC21.json";

const Provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed1.ninicoin.io");
const PancakeFactory = new ethers.Contract(
	"0xca143ce32fe78f1f7019d7d551a6402fc5350c73",
	["event PairCreated(address indexed token0, address indexed token1, address pair, uint)"],
	Provider
);

PancakeFactory.on("PairCreated", async (token0, token1, pair) => {
	console.log(token0, token1, pair);
	const tokenZero = new ethers.Contract(token0, ERC21Abi, Provider);
	const tokenOne = new ethers.Contract(token1, ERC21Abi, Provider);
	const results = await Promise.allSettled([tokenZero.symbol(), tokenOne.symbol()]);
	console.log(results);
});

(async () => {
	const db = new Database();
	await db.connect();
	console.log(`Connected..`);
})();
