import { useCallback, useState } from "react";
export default function useUpdate() {
	const [, setCount] = useState(0);
	return useCallback(() => {
		setCount((num) => num + 1);
	}, []);
}
