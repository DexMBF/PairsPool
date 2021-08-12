interface PairOpts {
	token0: string;
	token1: string;
	pairAddress: string;
	date: number;
}

interface PairReturnData {
	name: string;
	symbol: string;
	address: string;
}

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
