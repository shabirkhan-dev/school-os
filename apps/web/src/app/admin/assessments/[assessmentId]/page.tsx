import { Spinner } from "@school-os/ui/components/spinner";
import { Suspense } from "react";
import { AssessmentDetailPage } from "@/modules/assessments";

type Props = {
	params: Promise<{ assessmentId: string }>;
};

export default async function Page({ params }: Props) {
	const { assessmentId } = await params;

	return (
		<Suspense
			fallback={
				<div className="flex min-h-[240px] items-center justify-center">
					<Spinner className="size-6" />
				</div>
			}
		>
			<AssessmentDetailPage assessmentId={assessmentId} />
		</Suspense>
	);
}
