import { ChakraProvider } from "@chakra-ui/react";
import React from "react";
import { theme } from "./lib/ThemeManager";
import { WebSocketContextProvider } from "./providers/WebSockerProvider";

interface Props {
	children: React.ReactChild;
}

export default function Providers({ children }: Props) {
	return (
		<ChakraProvider theme={theme}>
			<WebSocketContextProvider url="http://localhost:3009">{children}</WebSocketContextProvider>
		</ChakraProvider>
	);
}
