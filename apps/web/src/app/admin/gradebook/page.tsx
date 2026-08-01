import { Spinner } from "@school-os/ui/components/spinner";
import { Suspense } from "react";
import { GradebookPage } from "@/modules/gradebook";

export default function Page() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-[240px] items-center justify-center">
					<Spinner className="size-6" />
				</div>
			}
		>
			<GradebookPage />
		</Suspense>
	);
}
