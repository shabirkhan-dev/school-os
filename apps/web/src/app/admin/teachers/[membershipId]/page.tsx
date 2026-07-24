import { TeacherDetailPage } from "@/modules/staff";

type Props = {
	params: Promise<{ membershipId: string }>;
};

export default async function AdminTeacherDetailPage({ params }: Props) {
	const { membershipId } = await params;
	return <TeacherDetailPage membershipId={membershipId} />;
}
