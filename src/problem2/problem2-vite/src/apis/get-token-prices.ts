import { z } from "zod";
import { env } from "@/env";
import { logger } from "@/lib/logger";

const TokenPriceSchema = z.object({
	currency: z.string(),
	date: z.string(),
	price: z.number(),
});
type TokenPrice = z.infer<typeof TokenPriceSchema>;

const GetTokenPricesRespSchema = z.array(TokenPriceSchema);

export const getTokenPrices = async ({ signal }: { signal?: AbortSignal }) => {
	try {
		const response = await fetch(env.VITE_GET_TOKEN_PRICES_URL, {
			signal,
		});

		if (!response.ok) {
			throw new Error("Failed to fetch prices");
		}

		const data = await response.json();
		const validation = GetTokenPricesRespSchema.safeParse(data);

		if (!validation.success) {
			logger.log(z.treeifyError(validation.error));
			throw new Error("Invalid data format");
		}

		// remove duplicate currencies, keep the latest one
		const uniquePricesMap = new Map<string, TokenPrice>();
		for (const tokenPrice of validation.data) {
			const existingPrice = uniquePricesMap.get(tokenPrice.currency);
			if (
				!existingPrice ||
				new Date(tokenPrice.date) > new Date(existingPrice.date)
			) {
				uniquePricesMap.set(tokenPrice.currency, tokenPrice);
			}
		}
		const uniquePrices = Array.from(uniquePricesMap.values());

		return uniquePrices;
	} catch (error) {
		console.error(error);
		throw error;
	}
};
