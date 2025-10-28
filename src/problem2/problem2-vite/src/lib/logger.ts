export const logger = {
	log: (...args: any[]) => {
		if (!import.meta.env.DEV) return;
		console.log(...args);
	},
	error: (...args: any[]) => {
		if (!import.meta.env.DEV) return;
		console.error(...args);
	},
};
