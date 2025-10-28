import { createFileRoute } from "@tanstack/react-router";
import { FancyForm } from "@/components/fancy-form/fancy-form";

export const Route = createFileRoute("/")({ component: App });

function App() {
	return (
		<div className="grow grid place-items-center p-4">
			<FancyForm />
		</div>
	);
}
