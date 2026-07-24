type SectionLike = {
	name: string;
	classId?: string;
	campusId?: string;
};

export function formatSectionLabel(
	section: SectionLike,
	className?: string | null,
	campusName?: string | null,
): string {
	const grade = className?.trim() || "Unknown grade";
	const sectionLabel = section.name.trim() || "—";
	const core = `${grade} · Section ${sectionLabel}`;
	return campusName?.trim() ? `${core} (${campusName.trim()})` : core;
}
