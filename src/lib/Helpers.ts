import { ethers } from "ethers";

export const Provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed1.ninicoin.io");

export const PancakeFactory = new ethers.Contract(
	"0xca143ce32fe78f1f7019d7d551a6402fc5350c73",
	["event PairCreated(address indexed token0, address indexed token1, address pair, uint)"],
	Provider
);
