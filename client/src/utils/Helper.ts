import dayjs from "dayjs";
import RelativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(RelativeTime);

export const timeAgo = (time: number) => {
	return dayjs(time * 1000).fromNow();
};
