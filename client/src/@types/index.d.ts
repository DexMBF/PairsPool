interface IPair {
	address: string;
	token0: string;
	token1: string;
	date: number;
}

interface IToken {
	address: string;
	name: string;
	symbol: string;
}

interface PairEmitData extends Omit<IPair, "token0" | "token1"> {
	token0: IToken;
	token1: IToken;
}

interface Stats {
	pairs: number;
	tokens: number;
	users: number;
	lastUpdated: number;
}
