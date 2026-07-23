import { ClassDetailPage } from "@/modules/staff";

type Props = {
	params: Promise<{ sectionId: string }>;
};

export default async function Page({ params }: Props) {
	const { sectionId } = await params;
	return <ClassDetailPage sectionId={sectionId} />;
}
