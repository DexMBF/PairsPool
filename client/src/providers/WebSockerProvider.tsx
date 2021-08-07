import React, { createContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface ISocketContext {
	socket: Socket | null;
	connected: boolean;
}

interface Props {
	children: React.ReactChild;
	url?: string;
}

const WebSocketContext = createContext<ISocketContext>({ socket: null, connected: false });

const WebSocketContextProvider = ({ children, url = "" }: Props) => {
	const socket = useRef<Socket | null>(null);
	const [connected, setConnected] = useState(false);

	useEffect(() => {
		console.log(`[socket] connecting..`);
		const sock = io(url);
		sock.on("connect", () => {
			console.log(`[socket] connected`);
			socket.current = sock;
			setConnected(true);
		});

		return () => {
			console.log(`[socket] disconnected`);
			socket.current?.disconnect();
			socket.current = null;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<WebSocketContext.Provider value={{ socket: socket.current, connected }}>{children}</WebSocketContext.Provider>
	);
};

export { WebSocketContext, WebSocketContextProvider };
