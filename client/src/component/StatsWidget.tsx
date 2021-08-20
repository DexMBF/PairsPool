import { Box, Flex, Spacer, Text } from "@chakra-ui/layout";
import { Container, useInterval } from "@chakra-ui/react";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { WebSocketContext } from "../providers/WebSockerProvider";

export default function StatsWidget() {
	const { socket, connected } = useContext(WebSocketContext);
	const [stats, setStats] = useState<Stats>({
		pairs: 0,
		tokens: 0,
		users: 0,
		lastUpdated: 0,
	});

	const handleStats = useCallback((stats: Stats) => setStats(stats), []);

	useEffect(() => {
		if (!connected) return;
		socket?.on("stats", handleStats);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connected]);

	useInterval(() => {
		if (!connected) return;
		socket?.emit("stats");
	}, 5000);

	return (
		<Container maxW="container.lg" mt="6">
			<Flex flexWrap="wrap">
				<Box h="90" bg="red.500" flex={1} borderRadius={6}>
					<Flex justifyContent="space-evenly" alignItems="center">
						<Text fontSize="6xl">{stats?.pairs}</Text>
						<Text fontSize="lg">pairs</Text>
					</Flex>
				</Box>
				<Spacer />
				<Box h="90" bg="red.400" flex={1} borderRadius={6}>
					<Flex justifyContent="space-evenly" alignItems="center">
						<Text fontSize="6xl">{stats?.tokens}</Text>
						<Text fontSize="lg">tokens</Text>
					</Flex>
				</Box>
				<Spacer />
				<Box h="90" bg="red.300" flex={1} borderRadius={6}>
					<Flex justifyContent="space-evenly" alignItems="center">
						<Text fontSize="6xl">{stats?.users}</Text>
						<Text fontSize="lg">users</Text>
					</Flex>
				</Box>
			</Flex>
		</Container>
	);
}
