import React, { useContext, useEffect, useState } from "react";
import { WebSocketContext } from "./providers/WebSockerProvider";
import clone from "lodash.clonedeep";

function App() {
	const { socket, connected } = useContext(WebSocketContext);
	const [pairs, setPairs] = useState([]);

	useEffect(() => {
		if (!connected) return;
		socket?.on("pair:new", (msg) => {
			const cloned = clone(pairs);
			cloned.push(msg);
			setPairs(cloned.slice(0, 25));
		});
	}, [connected, pairs, socket]);

	return <div className="App"></div>;
}

export default App;
