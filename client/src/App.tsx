import { Table, TableCaption, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import clone from "lodash.clonedeep";
import React, { useContext, useEffect, useState } from "react";
import { WebSocketContext } from "./providers/WebSockerProvider";

function App() {
	const { socket, connected } = useContext(WebSocketContext);
	const [pairs, setPairs] = useState<PairEmitData[]>([]);

	useEffect(() => {
		if (!connected) return;
		socket?.on("pair:new", (msg: PairEmitData) => {
			const cloned = clone(pairs);
			cloned.unshift(msg);
			setPairs(cloned.slice(0, 25));
		});
	}, [connected, pairs, socket]);

	return (
		<div className="App">
			<Table variant="simple">
				<TableCaption>Imperial to metric conversion factors</TableCaption>
				<Thead>
					<Tr>
						<Th>To convert</Th>
						<Th>into</Th>
						<Th isNumeric>multiply by</Th>
					</Tr>
				</Thead>
				<Tbody>
					{pairs.length > 0 &&
						pairs.map((pair) => {
							return (
								<Tr>
									<Td>{pair.address}</Td>
									<Td>
										{pair.token0.name}/{pair.token1.name}
									</Td>
									<Td>{pair.date}</Td>
								</Tr>
							);
						})}
				</Tbody>
			</Table>
		</div>
	);
}

export default App;
