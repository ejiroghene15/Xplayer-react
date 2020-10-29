export const songDuration = (duration) => {
	duration = parseInt(duration);
	let hours = parseInt(duration / (60 * 60));
	let mins = parseInt((duration % (60 * 60)) / 60);
	let secs = parseInt(duration % 60);
	secs = secs < 10 ? `0${secs}` : secs;
	return (duration =
		hours > 0 ? `${hours}:${mins}:${secs}` : `${mins}:${secs}`);
};

