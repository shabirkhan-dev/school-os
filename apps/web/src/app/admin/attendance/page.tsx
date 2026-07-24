import { Spinner } from "@school-os/ui/components/spinner";
import { Suspense } from "react";
import { AttendancePage } from "@/modules/attendance";

export default function Page() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-[240px] items-center justify-center">
					<Spinner className="size-6" />
				</div>
			}
		>
			<AttendancePage />
		</Suspense>
	);
}
