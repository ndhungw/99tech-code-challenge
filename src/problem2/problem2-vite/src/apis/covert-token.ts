import { getTokenPrices } from "./get-token-prices";

export async function convertToken({
	inputAmount,
	inputCurrency,
	outputCurrency,
}: {
	inputAmount: number;
	inputCurrency: string;
	outputCurrency: string;
}) {
	// Simulate api delay
	await new Promise((resolve) => {
		setTimeout(() => {
			resolve(null);
		}, 1000);
	});

	const tokenPrices = await getTokenPrices({}); // get fresh data

	const fromPrice = tokenPrices?.find(
		(price) => price.currency === inputCurrency,
	)?.price;

	const toPrice = tokenPrices?.find(
		(price) => price.currency === outputCurrency,
	)?.price;

	if (typeof fromPrice !== "number" || typeof toPrice !== "number") {
		throw new InvalidTokenPriceError();
	}

	const exchangeRate = toPrice / fromPrice;
	const outputAmount = exchangeRate * inputAmount;

	return {
		exchangeRate,
		outputAmount,
	};
}

export class InvalidTokenPriceError extends Error {
	constructor() {
		super("Invalid token price!");
	}
}
