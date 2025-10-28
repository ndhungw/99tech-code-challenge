import { env } from "@/env";

export const getTokenImageUrl = (currency: string) => {
	// https://github.com/Switcheo/token-icons/tree/main#:~:text=Token%20icons%20are%20named%20after%20token%20shorthand%20names%20in%20capital
	// The repo said the tokens are named after token shorthand names in capital but some are not
	// so we just use the currency as is because it works for most of them
	return `${env.VITE_TOKEN_IMAGE_URL}/${currency}.svg`;
};
