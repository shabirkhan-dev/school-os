"use client";

import { Cancel01Icon, Search01Icon, TeacherIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert, AlertDescription } from "@school-os/ui/components/alert";
import { Badge } from "@school-os/ui/components/badge";
import { Button } from "@school-os/ui/components/button";
import { SearchInput } from "@school-os/ui/components/search-input";
import { Skeleton } from "@school-os/ui/components/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@school-os/ui/components/toggle-group";
import { motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import { AdminPageShell } from "@/components/admin";
import { useAcademicYearsQuery, useClassesQuery } from "@/modules/academic";
import { formatSectionLabel } from "@/modules/academic/utils/format-section-label";
import { useTenantContext } from "@/modules/tenants";
import { useMyTeacherDashboardQuery, useMyTeacherProfileQuery } from "../hooks/use-staff-queries";
import type { TeacherAccessibleSection } from "../types/staff.types";
import { ClassAssessmentScheduleSheet } from "./class-assessment-schedule-sheet";
import { ClassHomeworkAssignSheet } from "./class-homework-assign-sheet";
import { TeacherClassCard } from "./teacher-class-card";

function localSessionDate(): string {
	return new Date().toLocaleDateString("en-CA");
}

type FilterCategory = "all" | "homeroom" | "subject";

function MyClassesSkeleton() {
	return (
		<AdminPageShell
			title="My classes"
			description="Homeroom sections and subject classes assigned to you."
			icon={TeacherIcon}
			maxWidth="5xl"
		>
			<div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-6">
				<Skeleton className="h-9 w-full sm:w-72 rounded-lg" />
				<Skeleton className="h-9 w-full sm:w-64 rounded-lg" />
			</div>

			<div className="grid gap-3 sm:grid-cols-2">
				{["sk-1", "sk-2", "sk-3", "sk-4"].map((skKey) => (
					<div key={skKey} className="p-4 rounded-xl border bg-card flex flex-col gap-4">
						<div className="flex justify-between items-start">
							<Skeleton className="h-5 w-32" />
							<Skeleton className="h-5 w-16 rounded-full" />
						</div>
						<Skeleton className="h-4 w-48" />
						<div className="flex gap-2 mt-2 pt-3 border-t">
							<Skeleton className="h-8 flex-1 rounded-md" />
							<Skeleton className="h-8 w-20 rounded-md" />
							<Skeleton className="h-8 w-20 rounded-md" />
						</div>
					</div>
				))}
			</div>
		</AdminPageShell>
	);
}

export function MyClassesPage() {
	const reducedMotion = useReducedMotion();
	const { activeTenant, campuses, activeCampus } = useTenantContext();
	const tenantId = activeTenant?.id ?? null;
	const campusId = activeCampus?.id ?? campuses[0]?.id ?? null;
	const sessionDate = useMemo(() => localSessionDate(), []);

	const profileQuery = useMyTeacherProfileQuery(tenantId);
	const dashboardQuery = useMyTeacherDashboardQuery(tenantId, sessionDate);
	const classesQuery = useClassesQuery(tenantId, Boolean(tenantId));
	const yearsQuery = useAcademicYearsQuery(tenantId, Boolean(tenantId));

	const [searchQuery, setSearchQuery] = useState("");
	const [filterCategory, setFilterCategory] = useState<FilterCategory>("all");
	const [assignHomeworkSection, setAssignHomeworkSection] =
		useState<TeacherAccessibleSection | null>(null);
	const [assignAssessmentSection, setAssignAssessmentSection] =
		useState<TeacherAccessibleSection | null>(null);

	const classNameById = useMemo(
		() => new Map((classesQuery.data ?? []).map((item) => [item.id, item.name])),
		[classesQuery.data],
	);
	const campusNameById = useMemo(
		() => new Map(campuses.map((campus) => [campus.id, campus.name])),
		[campuses],
	);
	const yearNameById = useMemo(
		() => new Map((yearsQuery.data ?? []).map((year) => [year.id, year.name])),
		[yearsQuery.data],
	);

	const sectionMetricsByKey = useMemo(() => {
		const map = new Map<string, NonNullable<typeof dashboardQuery.data>["sections"][number]>();
		for (const item of dashboardQuery.data?.sections ?? []) {
			const key = `${item.section.id}-${item.section.subjectId ?? "homeroom"}`;
			map.set(key, item);
		}
		return map;
	}, [dashboardQuery.data?.sections]);

	const accessibleSections = profileQuery.data?.accessibleSections ?? [];
	const homeroomSections = accessibleSections.filter((s) => s.accessType === "homeroom");
	const subjectSections = accessibleSections.filter((s) => s.accessType === "subject");

	const filteredSections = useMemo(() => {
		return accessibleSections.filter((section) => {
			if (filterCategory === "homeroom" && section.accessType !== "homeroom") return false;
			if (filterCategory === "subject" && section.accessType !== "subject") return false;

			if (!searchQuery.trim()) return true;

			const q = searchQuery.toLowerCase();
			const className = classNameById.get(section.classId)?.toLowerCase() ?? "";
			const campusName = campusNameById.get(section.campusId)?.toLowerCase() ?? "";
			const label = formatSectionLabel(
				section,
				classNameById.get(section.classId),
				campusNameById.get(section.campusId),
			).toLowerCase();
			const subjectName = section.subjectName?.toLowerCase() ?? "";
			const subjectCode = section.subjectCode?.toLowerCase() ?? "";

			return (
				label.includes(q) ||
				className.includes(q) ||
				campusName.includes(q) ||
				subjectName.includes(q) ||
				subjectCode.includes(q)
			);
		});
	}, [accessibleSections, filterCategory, searchQuery, classNameById, campusNameById]);

	if (!tenantId) {
		return (
			<Alert>
				<AlertDescription>Switch to an organization to view your classes.</AlertDescription>
			</Alert>
		);
	}

	if (profileQuery.isLoading || classesQuery.isLoading) {
		return <MyClassesSkeleton />;
	}

	if (profileQuery.isError) {
		return (
			<Alert>
				<AlertDescription>
					My classes is available for teacher accounts in this organization.
				</AlertDescription>
			</Alert>
		);
	}

	const hasSections = accessibleSections.length > 0;
	const activeHomeworkSectionLabel = assignHomeworkSection
		? formatSectionLabel(
				assignHomeworkSection,
				classNameById.get(assignHomeworkSection.classId),
				campusNameById.get(assignHomeworkSection.campusId),
			)
		: "";
	const activeAssessmentSectionLabel = assignAssessmentSection
		? formatSectionLabel(
				assignAssessmentSection,
				classNameById.get(assignAssessmentSection.classId),
				campusNameById.get(assignAssessmentSection.campusId),
			)
		: "";

	return (
		<AdminPageShell
			title="My classes"
			description="Homeroom sections and subject classes assigned to you. Mark attendance, draft homework, or schedule tests in one tap."
			icon={TeacherIcon}
			maxWidth="5xl"
		>
			{/* Search & Category Filter Controls */}
			{hasSections ? (
				<div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-6">
					<SearchInput
						placeholder="Search by class, section, subject, or campus..."
						value={searchQuery}
						onValueChange={(val) => setSearchQuery(val)}
						className="w-full sm:w-80"
					/>

					<ToggleGroup
						value={[filterCategory]}
						onValueChange={(next) => {
							const selected = next[0] as FilterCategory | undefined;
							if (selected) setFilterCategory(selected);
						}}
						variant="outline"
						size="sm"
						spacing={0}
						className="justify-start sm:justify-end"
					>
						<ToggleGroupItem value="all" className="text-xs px-3 py-1.5 flex items-center gap-1.5">
							All classes
							<Badge variant="secondary" className="px-1.5 py-0 text-[10px] rounded-full">
								{accessibleSections.length}
							</Badge>
						</ToggleGroupItem>

						<ToggleGroupItem
							value="homeroom"
							className="text-xs px-3 py-1.5 flex items-center gap-1.5"
						>
							Homeroom
							<Badge variant="secondary" className="px-1.5 py-0 text-[10px] rounded-full">
								{homeroomSections.length}
							</Badge>
						</ToggleGroupItem>

						<ToggleGroupItem
							value="subject"
							className="text-xs px-3 py-1.5 flex items-center gap-1.5"
						>
							Subject classes
							<Badge variant="secondary" className="px-1.5 py-0 text-[10px] rounded-full">
								{subjectSections.length}
							</Badge>
						</ToggleGroupItem>
					</ToggleGroup>
				</div>
			) : null}

			{/* Content Area */}
			{!hasSections ? (
				<div className="rounded-xl border border-dashed p-8 text-center">
					<p className="text-sm font-medium text-foreground">No classes assigned yet</p>
					<p className="mt-1 text-xs text-muted-foreground">
						Ask an administrator to assign you as homeroom teacher or subject instructor.
					</p>
				</div>
			) : filteredSections.length === 0 ? (
				<div className="rounded-xl border border-dashed p-8 text-center flex flex-col items-center justify-center">
					<HugeiconsIcon icon={Search01Icon} size={24} className="text-muted-foreground mb-2" />
					<p className="text-sm font-medium text-foreground">No matching classes found</p>
					<p className="mt-1 text-xs text-muted-foreground">
						No section matches &quot;{searchQuery}&quot; under the &quot;{filterCategory}&quot;
						filter.
					</p>
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							setSearchQuery("");
							setFilterCategory("all");
						}}
						className="mt-4 text-xs"
					>
						<HugeiconsIcon icon={Cancel01Icon} data-icon="inline-start" strokeWidth={2} />
						Clear search &amp; filters
					</Button>
				</div>
			) : (
				<motion.div
					initial={reducedMotion ? undefined : { opacity: 0, y: 6 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.15 }}
					className="grid gap-3 sm:grid-cols-2"
				>
					{filteredSections.map((section) => {
						const key = `${section.id}-${section.subjectId ?? "homeroom"}`;
						return (
							<TeacherClassCard
								key={key}
								section={section}
								label={formatSectionLabel(
									section,
									classNameById.get(section.classId),
									campusNameById.get(section.campusId),
								)}
								campusName={campusNameById.get(section.campusId)}
								academicYearName={yearNameById.get(section.academicYearId)}
								metrics={sectionMetricsByKey.get(key)}
								onAssignHomework={(sec) => setAssignHomeworkSection(sec)}
								onScheduleAssessment={(sec) => setAssignAssessmentSection(sec)}
							/>
						);
					})}
				</motion.div>
			)}

			{/* Integrated Quick-Action Modals */}
			{assignHomeworkSection ? (
				<ClassHomeworkAssignSheet
					open={Boolean(assignHomeworkSection)}
					onOpenChange={(open) => {
						if (!open) setAssignHomeworkSection(null);
					}}
					tenantId={tenantId}
					campusId={assignHomeworkSection.campusId ?? campusId}
					sectionId={assignHomeworkSection.id}
					sectionSubjectId={assignHomeworkSection.subjectId}
					classLabel={activeHomeworkSectionLabel}
					subjectName={assignHomeworkSection.subjectName}
				/>
			) : null}

			{assignAssessmentSection ? (
				<ClassAssessmentScheduleSheet
					open={Boolean(assignAssessmentSection)}
					onOpenChange={(open) => {
						if (!open) setAssignAssessmentSection(null);
					}}
					tenantId={tenantId}
					campusId={assignAssessmentSection.campusId ?? campusId}
					sectionId={assignAssessmentSection.id}
					sectionSubjectId={assignAssessmentSection.subjectId}
					classLabel={activeAssessmentSectionLabel}
					subjectName={assignAssessmentSection.subjectName}
				/>
			) : null}
		</AdminPageShell>
	);
}
