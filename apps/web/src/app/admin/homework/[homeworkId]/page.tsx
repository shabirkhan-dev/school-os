import { HomeworkDetailPage } from "@/modules/homework";

type Props = {
	params: Promise<{ homeworkId: string }>;
};

export default async function Page({ params }: Props) {
	const { homeworkId } = await params;
	return <HomeworkDetailPage homeworkId={homeworkId} />;
}
