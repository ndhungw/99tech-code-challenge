import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";

import { useQuery } from "@tanstack/react-query";
import { ClientOnly } from "@tanstack/react-router";
import { ArrowDownUpIcon, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { convertToken, InvalidTokenPriceError } from "@/apis/covert-token";
import { getTokenPrices } from "@/apis/get-token-prices";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from "@/components/ui/field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { getTokenImageUrl } from "./get-token-images";

const DEFAULT_TOKEN_IMAGE = "https://placehold.co/80x80?text=?"; // demo purpose

const FORM_ID = "currency-swap-form" as const;

const tokenExchangeFormSchema = z
	.object({
		inputAmount: z
			.union([z.number(), z.string()])
			.transform((val) => {
				if (typeof val === "string") {
					if (val === "") return 0;
					// handle decimal point at the end while typing
					if (val.endsWith(".")) {
						return parseFloat(val.slice(0, -1)) || 0;
					}
					const parsed = parseFloat(val);
					return Number.isNaN(parsed) ? 0 : parsed;
				}
				return val;
			})
			.pipe(z.number().min(1, "Amount must be at least 1")),
		inputCurrency: z.string().min(1, "Currency to send is required"),
		outputCurrency: z.string().min(1, "Currency to receive is required"),
	})
	.superRefine((val, ctx) => {
		if (val.inputCurrency === val.outputCurrency) {
			ctx.addIssue({
				code: "custom",
				message: "Input and output currencies cannot be the same",
				path: ["outputCurrency"],
			});
			ctx.addIssue({
				code: "custom",
				message: "Input and output currencies cannot be the same",
				path: ["inputCurrency"],
			});
		}
	});

type TokenExchangeFormValue = z.infer<typeof tokenExchangeFormSchema>;

export function FancyForm() {
	const {
		data: tokenPrices,
		isLoading: isLoadingTokenPrices,
		isError: isErrorTokenPrices,
	} = useQuery({
		queryKey: ["token-prices"],
		queryFn: ({ signal }) => getTokenPrices({ signal }),
	});

	const form = useForm({
		resolver: zodResolver(tokenExchangeFormSchema),
		mode: "onChange",
		defaultValues: {
			inputAmount: 1,
			inputCurrency: "",
			outputCurrency: "",
		},
	});

	const handleSwapCurrencies = () => {
		const inputCurrency = form.getValues("inputCurrency");
		const outCurrency = form.getValues("outputCurrency");
		form.clearErrors();
		form.setValue("inputCurrency", outCurrency);
		form.setValue("outputCurrency", inputCurrency);
	};

	type Result = {
		inputCurrency: string;
		outputCurrency: string;
		inputAmount: number;
		outputAmount: number;
		exchangeRate: number;
	};
	const [result, setResult] = useState<Result | null>(null);
	const [convertStatus, setConvertStatus] = useState<
		"idle" | "loading" | "error"
	>("idle");

	// Reset the result on any field value changes
	useEffect(() => {
		const subscription = form.watch(() => {
			setResult(null);
		});
		return () => subscription.unsubscribe();
	}, [form]);

	async function onSubmit({
		inputAmount,
		inputCurrency,
		outputCurrency,
	}: TokenExchangeFormValue) {
		try {
			setConvertStatus("loading");

			const res = await convertToken({
				inputAmount,
				inputCurrency,
				outputCurrency,
			});

			setResult({
				inputCurrency,
				outputCurrency,
				inputAmount,
				outputAmount: res.outputAmount,
				exchangeRate: res.exchangeRate,
			});
			setConvertStatus("idle");
		} catch (error) {
			if (error instanceof InvalidTokenPriceError) {
				toast.error(error.message);
				return;
			}
			toast.error("Something went wrong!");
			setConvertStatus("error");
		}
	}

	return (
		<Card className="w-full max-w-lg">
			<CardHeader>
				<CardTitle>Currency exchange tool</CardTitle>
				<CardDescription>
					Use this form to exchange your currencies quickly.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form id={FORM_ID} onSubmit={form.handleSubmit(onSubmit)}>
					<FieldGroup>
						<Controller
							name="inputAmount"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field
									orientation="vertical"
									className="gap-2"
									data-invalid={fieldState.invalid}
								>
									<FieldLabel htmlFor={field.name}>Amount to send</FieldLabel>
									<Input
										{...field}
										type="text" // allow user to type decimal point
										inputMode="decimal"
										pattern="[0-9]*\.?[0-9]*"
										onChange={(ev) => {
											const inputValue = ev.target.value;

											// allow empty input
											if (inputValue === "") {
												field.onChange("");
												return;
											}

											const decimalRegex = /^\d*\.?\d*$/;

											if (!decimalRegex.test(inputValue)) {
												return; // Reject invalid input
											}

											const numericValue = parseFloat(inputValue);

											// handle case where user typed just a decimal point
											if (inputValue.endsWith(".") || inputValue === ".") {
												// Keep the raw string to allow typing decimal numbers
												field.onChange(inputValue);
											} else {
												// Convert valid numbers to numeric type
												field.onChange(numericValue);
											}
										}}
										value={
											typeof field.value === "number"
												? field.value.toString()
												: field.value
										}
										aria-invalid={fieldState.invalid}
										id={field.name}
										placeholder="Enter amount to send"
										autoComplete="off"
										disabled={convertStatus === "loading" || field.disabled}
									/>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>

						<Controller
							name="inputCurrency"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field
									orientation="vertical"
									className="gap-2"
									data-invalid={fieldState.invalid}
								>
									<FieldLabel htmlFor={field.name}>From</FieldLabel>
									<Select
										name={field.name}
										value={field.value}
										onValueChange={field.onChange}
										disabled={
											isLoadingTokenPrices ||
											isErrorTokenPrices ||
											convertStatus === "loading" ||
											field.disabled
										}
									>
										<SelectTrigger
											aria-invalid={fieldState.invalid}
											id={field.name}
											onBlur={field.onBlur}
										>
											<SelectValue placeholder="Select a unit" />
										</SelectTrigger>
										<SelectContent position="item-aligned" className="min-w-0">
											{tokenPrices?.map((price) => (
												<SelectItem key={price.currency} value={price.currency}>
													<div className="flex items-center gap-2">
														<img
															src={getTokenImageUrl(price.currency)}
															alt={price.currency}
															className="h-6 w-6 rounded-full"
															loading="lazy"
															fetchPriority="low"
															onError={(ev) => {
																ev.currentTarget.src = DEFAULT_TOKEN_IMAGE;
															}}
														/>
														<span className="font-medium">
															{price.currency}
														</span>
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>

						<FieldSeparator className="h-9">
							<Button
								variant="outline"
								size="icon"
								onClick={handleSwapCurrencies}
								type="button"
								disabled={isLoadingTokenPrices || convertStatus === "loading"}
							>
								<ArrowDownUpIcon />
							</Button>
						</FieldSeparator>

						<Controller
							name="outputCurrency"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field
									orientation="vertical"
									className="gap-2"
									data-invalid={fieldState.invalid}
								>
									<FieldLabel htmlFor={field.name}>To</FieldLabel>
									<Select
										name={field.name}
										value={field.value}
										onValueChange={field.onChange}
										disabled={
											isLoadingTokenPrices ||
											isErrorTokenPrices ||
											convertStatus === "loading" ||
											field.disabled
										}
									>
										<SelectTrigger
											aria-invalid={fieldState.invalid}
											id={field.name}
											onBlur={field.onBlur}
										>
											<SelectValue placeholder="Select a unit" />
										</SelectTrigger>
										<SelectContent position="item-aligned" className="min-w-0">
											{tokenPrices?.map((price) => (
												<SelectItem key={price.currency} value={price.currency}>
													<div className="flex items-center gap-2">
														<img
															src={getTokenImageUrl(price.currency)}
															alt={price.currency}
															className="h-6 w-6 rounded-full"
															loading="lazy"
															onError={(ev) => {
																ev.currentTarget.src = DEFAULT_TOKEN_IMAGE;
															}}
														/>
														<span className="font-medium">
															{price.currency}
														</span>
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>
					</FieldGroup>
				</form>
			</CardContent>

			<CardFooter>
				<Button
					type="submit"
					form={FORM_ID}
					className="w-full"
					disabled={convertStatus === "loading"}
				>
					{convertStatus === "loading" ? (
						<>
							Converting
							<Loader2 className="ml-2 h-4 w-4 animate-spin" />
						</>
					) : (
						"Convert"
					)}
				</Button>
			</CardFooter>

			{result && (
				<>
					<div className="flex items-center gap-2 mx-6">
						<Separator className="shrink" />
						<span className="text-lg font-bold">RESULT</span>
						<Separator className="shrink" />
					</div>

					<div className="px-6">
						<div className="text-2xl">
							<span>{result.inputAmount}</span>{" "}
							<span className="font-bold">{result.inputCurrency}</span>{" "}
							<span> = </span> <span>{result.outputAmount}</span>{" "}
							<span className="font-bold">{result.outputCurrency}</span>
						</div>
					</div>
				</>
			)}

			<ClientOnly>
				<DevTool control={form.control} />
			</ClientOnly>
		</Card>
	);
}
