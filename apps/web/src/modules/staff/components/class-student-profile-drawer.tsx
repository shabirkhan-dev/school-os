"use client";

import { Call02Icon, Copy01Icon, Mail01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Badge } from "@school-os/ui/components/badge";
import { Button } from "@school-os/ui/components/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@school-os/ui/components/drawer";
import { Spinner } from "@school-os/ui/components/spinner";
import { useCallback, useState } from "react";
import { useStudentQuery } from "@/modules/students";
import { StudentIdCard } from "@/modules/students/components/student-id-card";
import {
	formatStudentGender,
	studentStatusBadgeVariant,
} from "@/modules/students/utils/student-ui.utils";
import { TeacherStudentInsights } from "./teacher-student-insights";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	tenantId: string;
	schoolName: string;
	studentId: string | null;
	sectionLabel?: string;
	academicYearLabel?: string;
};

export function ClassStudentProfileDrawer({
	open,
	onOpenChange,
	tenantId,
	schoolName,
	studentId,
	sectionLabel,
	academicYearLabel,
}: Props) {
	const [copied, setCopied] = useState<string | null>(null);
	const studentQuery = useStudentQuery(tenantId, studentId, open && Boolean(studentId));

	const copyValue = useCallback(async (label: string, value: string) => {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(label);
			window.setTimeout(() => setCopied(null), 2000);
		} catch {
			setCopied(null);
		}
	}, []);

	const student = studentQuery.data?.student;

	return (
		<Drawer open={open} onOpenChange={onOpenChange} direction="right">
			<DrawerContent className="h-full max-h-none data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-lg">
				<DrawerHeader className="border-border border-b text-start">
					<DrawerTitle>Student profile</DrawerTitle>
					<DrawerDescription>
						ID card, contact details, and emergency information for your class roster.
					</DrawerDescription>
				</DrawerHeader>

				<div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
					{studentQuery.isLoading || !student ? (
						<div className="flex justify-center py-10">
							<Spinner className="size-6" />
						</div>
					) : (
						<div className="space-y-6">
							<StudentIdCard
								student={student}
								schoolName={schoolName}
								tenantId={tenantId}
								sectionLabel={sectionLabel}
								academicYearLabel={academicYearLabel}
								className="mx-auto"
							/>

							<TeacherStudentInsights tenantId={tenantId} studentId={student.id} enabled={open} />

							<div className="flex flex-wrap gap-2">
								<Button
									type="button"
									size="sm"
									variant="outline"
									onClick={() => void copyValue("code", student.studentCode)}
								>
									<HugeiconsIcon icon={Copy01Icon} data-icon="inline-start" strokeWidth={2} />
									{copied === "code" ? "Copied code" : "Copy student code"}
								</Button>
								{student.email ? (
									<Button
										type="button"
										size="sm"
										variant="outline"
										onClick={() => void copyValue("email", student.email ?? "")}
									>
										<HugeiconsIcon icon={Mail01Icon} data-icon="inline-start" strokeWidth={2} />
										{copied === "email" ? "Copied email" : "Copy email"}
									</Button>
								) : null}
							</div>

							<dl className="grid gap-3 sm:grid-cols-2 text-sm">
								<div>
									<dt className="text-muted-foreground text-xs uppercase">Status</dt>
									<dd className="mt-1">
										<Badge
											variant={studentStatusBadgeVariant(student.status)}
											className="capitalize"
										>
											{student.status}
										</Badge>
									</dd>
								</div>
								<div>
									<dt className="text-muted-foreground text-xs uppercase">Date of birth</dt>
									<dd>{student.dateOfBirth ?? "—"}</dd>
								</div>
								<div>
									<dt className="text-muted-foreground text-xs uppercase">Gender</dt>
									<dd className="capitalize">{formatStudentGender(student.gender)}</dd>
								</div>
								<div>
									<dt className="text-muted-foreground text-xs uppercase">Admitted</dt>
									<dd>{student.admittedOn ?? "—"}</dd>
								</div>
								<div>
									<dt className="text-muted-foreground text-xs uppercase">Email</dt>
									<dd className="break-all">{student.email ?? "—"}</dd>
								</div>
								<div>
									<dt className="text-muted-foreground text-xs uppercase">Phone</dt>
									<dd>{student.phone ?? "—"}</dd>
								</div>
								<div className="sm:col-span-2">
									<dt className="text-muted-foreground text-xs uppercase">Address</dt>
									<dd>
										{[student.addressLine1, student.city, student.state]
											.filter(Boolean)
											.join(", ") || "—"}
									</dd>
								</div>
							</dl>

							<div className="rounded-xl border border-border bg-muted/20 p-4">
								<p className="mb-2 flex items-center gap-1.5 font-medium text-sm">
									<HugeiconsIcon icon={Call02Icon} size={16} strokeWidth={2} />
									Emergency contact
								</p>
								<p className="text-sm">{student.emergencyContactName ?? "Not on file"}</p>
								{student.emergencyContactPhone ? (
									<p className="mt-1 text-muted-foreground text-sm">
										{student.emergencyContactPhone}
									</p>
								) : null}
							</div>

							{studentQuery.data && studentQuery.data.guardians.length > 0 ? (
								<div>
									<p className="mb-2 font-medium text-sm">Guardians</p>
									<ul className="space-y-2">
										{studentQuery.data.guardians.map((link) => (
											<li
												key={link.id}
												className="rounded-lg border border-border px-3 py-2 text-sm"
											>
												<p className="font-medium">{link.guardian.fullName}</p>
												<p className="text-muted-foreground text-xs">
													{link.relationship}
													{link.isPrimary ? " · Primary" : ""}
													{link.guardian.phone ? ` · ${link.guardian.phone}` : ""}
													{link.guardian.email ? ` · ${link.guardian.email}` : ""}
												</p>
											</li>
										))}
									</ul>
								</div>
							) : null}
						</div>
					)}
				</div>

				<DrawerFooter className="border-border border-t">
					<DrawerClose asChild>
						<Button type="button" variant="outline">
							Close
						</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
