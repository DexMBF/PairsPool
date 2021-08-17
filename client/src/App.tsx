import { Table, TableCaption, Tbody, Td, Th, Thead, Tr, useInterval } from "@chakra-ui/react";
import clone from "lodash.clonedeep";
import React, { useCallback, useContext, useEffect, useState } from "react";
import useUpdate from "./hooks/useUpdate";
import { WebSocketContext } from "./providers/WebSockerProvider";
import { timeAgo } from "./utils/Helper";

function App() {
	const { socket, connected } = useContext(WebSocketContext);
	const [pairs, setPairs] = useState<PairEmitData[]>([]);
	const [hasInit, setInit] = useState(false);
	const forceUpdate = useUpdate();

	const addPair = useCallback(
		(pair: PairEmitData) => {
			const cloned = clone(pairs);
			cloned.unshift(pair);
			setPairs(cloned.slice(0, 25));
		},
		[pairs]
	);

	useEffect(() => {
		if (!connected) return;
		socket?.emit("init");
		socket?.once("init", (initPairs: PairEmitData[]) => {
			setPairs(initPairs);
			setInit(true);
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connected]);

	useEffect(() => {
		if (!hasInit || !connected) return;
		socket?.on("pair:new", (pair: PairEmitData) => {
			addPair(pair);
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [addPair, connected, hasInit]);

	useInterval(() => {
		forceUpdate();
	}, pairs.length > 0 ? 5000: null);

	return (
		<div className="App">
			<Table variant="simple">
				<TableCaption>pancakeswap ❤</TableCaption>
				<Thead>
					<Tr>
						<Th>address</Th>
						<Th>token0</Th>
						<Th>token1</Th>
						<Th></Th>
					</Tr>
				</Thead>
				<Tbody>
					{pairs.length > 0 &&
						pairs.map((pair) => {
							return (
								<Tr key={pair.address}>
									<Td>
										<a href={`https://bscscan.com/address/${pair.address}`} target="_blank" rel="noreferrer">
											{pair.address}
										</a>
									</Td>
									<Td>
										<a href={`https://bscscan.com/address/${pair.token0.address}`} target="_blank" rel="noreferrer">
											{pair.token0.name}
										</a>
									</Td>
									<Td>
										<a href={`https://bscscan.com/address/${pair.token1.address}`} target="_blank" rel="noreferrer">
											{pair.token1.name}
										</a>
									</Td>
									<Td>{timeAgo(pair.date)}</Td>
								</Tr>
							);
						})}
				</Tbody>
			</Table>
		</div>
	);
}

export default App;
