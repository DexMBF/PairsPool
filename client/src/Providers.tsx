import { ChakraProvider } from "@chakra-ui/react";
import React from "react";
import { theme } from "./lib/ThemeManager";
import { WebSocketContextProvider } from "./providers/WebSockerProvider";

interface Props {
	children: React.ReactChild;
}

const SOCKET_URL =
	process.env.REACT_APP_ENVIRONMENT === "prod" ? process.env.REACT_APP_SOCKET_URL : process.env.REACT_APP_SOCKET_URL_DEV;

export default function Providers({ children }: Props) {
	return (
		<ChakraProvider theme={theme}>
			<WebSocketContextProvider url={SOCKET_URL}>{children}</WebSocketContextProvider>
		</ChakraProvider>
	);
}
