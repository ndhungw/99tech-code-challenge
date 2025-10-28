import { Toaster } from "../ui/sonner";

export function AppLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-dvh bg-background flex flex-col">
			{children}
			<Toaster />
		</div>
	);
}
