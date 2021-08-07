import React, { useContext, useEffect } from "react";
import { WebSocketContext } from "./providers/WebSockerProvider";

function App() {
	const { socket, connected } = useContext(WebSocketContext);
	useEffect(() => {
		if (!connected) return;
		socket?.on("pair:new", (msg) => {
			console.log(msg);
		});
	}, [connected, socket]);
	return <div className="App"></div>;
}

export default App;
