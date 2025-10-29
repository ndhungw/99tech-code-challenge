import { useMemo } from "react";

interface WalletBalance {
	id: string;
	currency: string;
	amount: number;
	blockchain: string;
}

function useWalletBalances(): WalletBalance[] {
	return [];
}

function usePrices(): Record<string, number> {
	return {};
}

const classes = {
	row: "TBD",
};

const MINIMUM_BLOCKCHAIN_PRIORITY = -99 as const;

const getPriority = (blockchain: string) => {
	switch (blockchain) {
		case "Osmosis":
			return 100;
		case "Ethereum":
			return 50;
		case "Arbitrum":
			return 30;
		case "Zilliqa":
			return 20;
		case "Neo":
			return 20;
		default:
			return MINIMUM_BLOCKCHAIN_PRIORITY;
	}
};

//#region WalletPage Component

const WalletPage = () => {
	const balances = useWalletBalances();
	const prices = usePrices();

	const standardizedBalances = useMemo(
		() =>
			balances
				.map((balance) => {
					const usdValue = (prices[balance.currency] || 0) * balance.amount;
					return {
						...balance,
						formatted: balance.amount.toFixed(),
						usdValue,
						priority: getPriority(balance.blockchain),
					};
				})
				.filter((balance) => balance.priority > -99 && balance.amount > 0)
				.sort((lhs, rhs) => lhs.priority - rhs.priority),
		[balances, prices],
	);

	const rows = useMemo(() => {
		return standardizedBalances.map((balance) => {
			return (
				<WalletRow
					className={classes.row}
					key={balance.id}
					amount={balance.amount}
					usdValue={balance.usdValue}
					formattedAmount={balance.formatted}
				/>
			);
		});
	}, [standardizedBalances]);

	return <div>{rows}</div>;
};
//#endregion WalletPage Component

//#region WalletRow Component

type WalletRowProps = {
	className?: string;
	amount: number;
	usdValue: number;
	formattedAmount: string;
};

function WalletRow({
	className,
	amount,
	usdValue,
	formattedAmount,
}: WalletRowProps) {
	return (
		<div className={className}>
			<div>{formattedAmount}</div>
			<div>{usdValue}</div>
			<div>{amount}</div>
		</div>
	);
}

//#endregion WalletRow Component
