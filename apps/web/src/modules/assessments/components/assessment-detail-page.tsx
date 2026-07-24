"use client";

import { File02Icon } from "@hugeicons/core-free-icons";
import { Alert, AlertDescription } from "@school-os/ui/components/alert";
import { Badge } from "@school-os/ui/components/badge";
import { Button } from "@school-os/ui/components/button";
import { Input } from "@school-os/ui/components/input";
import { SelectField } from "@school-os/ui/components/select-field";
import { Spinner } from "@school-os/ui/components/spinner";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@school-os/ui/components/table";
import { useEffect, useMemo, useState } from "react";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import {
	useAssessmentDetailQuery,
	useUpsertAssessmentResultsMutation,
} from "@/modules/assessments/hooks/use-assessments-queries";
import type { AssessmentResultStatus } from "@/modules/assessments/types/assessments.types";
import { PermissionCodes, usePermissions, useTenantContext } from "@/modules/tenants";

const resultStatusOptions = [
	{ label: "Pending", value: "pending" },
	{ label: "Graded", value: "graded" },
	{ label: "Absent", value: "absent" },
];

type Props = {
	assessmentId: string;
};

type DraftRow = {
	studentId: string;
	studentName: string;
	studentCode: string;
	score: string;
	status: AssessmentResultStatus;
};

export function AssessmentDetailPage({ assessmentId }: Props) {
	const { activeTenant } = useTenantContext();
	const { can, isLoading: permissionsLoading } = usePermissions();
	const tenantId = activeTenant?.id ?? null;
	const canRead = can(PermissionCodes.ASSESSMENTS_READ);
	const canWrite = can(PermissionCodes.ASSESSMENTS_WRITE);

	const detailQuery = useAssessmentDetailQuery(tenantId, assessmentId, canRead);
	const saveMutation = useUpsertAssessmentResultsMutation(tenantId ?? "", assessmentId);

	const [draftRows, setDraftRows] = useState<DraftRow[]>([]);
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!detailQuery.data) return;
		setDraftRows(
			detailQuery.data.results.map((result) => ({
				studentId: result.studentId,
				studentName: result.studentName,
				studentCode: result.studentCode,
				score: result.score != null ? String(result.score) : "",
				status: result.status,
			})),
		);
	}, [detailQuery.data]);

	const summary = detailQuery.data?.summary;

	const headerDescription = useMemo(() => {
		if (!detailQuery.data) return undefined;
		return `${detailQuery.data.sectionName} · ${detailQuery.data.subjectName} · ${detailQuery.data.assessedOn} · Max ${detailQuery.data.maxScore}`;
	}, [detailQuery.data]);

	function updateRow(studentId: string, patch: Partial<DraftRow>) {
		setDraftRows((rows) =>
			rows.map((row) => (row.studentId === studentId ? { ...row, ...patch } : row)),
		);
	}

	async function handleSave() {
		if (!detailQuery.data) return;
		setError(null);
		setMessage(null);

		try {
			await saveMutation.mutateAsync({
				results: draftRows.map((row) => ({
					studentId: row.studentId,
					status: row.status,
					score: row.status === "graded" && row.score.trim() !== "" ? Number(row.score) : null,
				})),
			});
			setMessage("Grades saved");
		} catch (saveError) {
			setError(saveError instanceof Error ? saveError.message : "Could not save grades");
		}
	}

	if (permissionsLoading) {
		return (
			<AdminPageShell title="Assessment" description="Loading your access…">
				<div className="flex min-h-[240px] items-center justify-center">
					<Spinner className="size-6" />
				</div>
			</AdminPageShell>
		);
	}

	if (!canRead) {
		return (
			<AdminPageShell
				title="Assessment"
				description="You do not have permission to view assessments."
			>
				<Alert variant="destructive">
					<AlertDescription>Missing assessments.read permission.</AlertDescription>
				</Alert>
			</AdminPageShell>
		);
	}

	return (
		<AdminPageShell
			title={detailQuery.data?.title ?? "Assessment"}
			description={headerDescription}
			icon={File02Icon}
			breadcrumb={{ label: "Tests & exams", href: "/admin/assessments" }}
			loading={permissionsLoading || detailQuery.isLoading}
			actions={
				canWrite ? (
					<Button size="sm" onClick={handleSave} disabled={saveMutation.isPending}>
						Save grades
					</Button>
				) : null
			}
		>
			{summary ? (
				<div className="mb-4 flex flex-wrap gap-2">
					<Badge variant="outline">{summary.graded} graded</Badge>
					<Badge variant="outline">{summary.pending} pending</Badge>
					<Badge variant="outline">{summary.absent} absent</Badge>
					{summary.averageScore != null ? <Badge>Average {summary.averageScore}</Badge> : null}
				</div>
			) : null}

			{message ? (
				<Alert className="mb-4">
					<AlertDescription>{message}</AlertDescription>
				</Alert>
			) : null}
			{error ? (
				<Alert variant="destructive" className="mb-4">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			) : null}

			<div className="overflow-hidden rounded-md border border-border bg-card">
				<Table>
					<TableHeader className="bg-muted/40">
						<TableRow>
							<TableHead>Student</TableHead>
							<TableHead>Code</TableHead>
							<TableHead>Score</TableHead>
							<TableHead>Status</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{draftRows.map((row) => (
							<TableRow key={row.studentId}>
								<TableCell className="font-medium">{row.studentName}</TableCell>
								<TableCell>{row.studentCode}</TableCell>
								<TableCell>
									<Input
										type="number"
										min={0}
										max={detailQuery.data?.maxScore}
										value={row.score}
										disabled={!canWrite || row.status !== "graded"}
										onChange={(event) => updateRow(row.studentId, { score: event.target.value })}
										className="h-8 w-24"
									/>
								</TableCell>
								<TableCell>
									<SelectField
										items={resultStatusOptions}
										value={row.status}
										disabled={!canWrite}
										onValueChange={(value) =>
											updateRow(row.studentId, {
												status: value as AssessmentResultStatus,
												score: value === "graded" ? row.score : "",
											})
										}
										className="min-w-[140px]"
									/>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</AdminPageShell>
	);
}
