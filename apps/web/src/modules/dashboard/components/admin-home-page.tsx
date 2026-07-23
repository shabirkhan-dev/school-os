"use client";

import { Spinner } from "@school-os/ui/components/spinner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PermissionCodes, usePermissions } from "@/modules/tenants";
import { AdminDashboard } from "./admin-dashboard";
import { TeacherDashboard } from "./teacher-dashboard";

export function AdminHomePage() {
	const router = useRouter();
	const { role, can, isLoading } = usePermissions();
	const isOpsDashboard = can(PermissionCodes.TENANT_MEMBERSHIP_READ);

	useEffect(() => {
		if (isLoading || role !== "parent") return;
		router.replace("/admin/my-children");
	}, [isLoading, role, router]);

	if (isLoading) {
		return (
			<div className="flex min-h-[320px] items-center justify-center">
				<Spinner className="size-8" />
			</div>
		);
	}

	if (role === "parent") {
		return (
			<div className="flex min-h-[320px] items-center justify-center">
				<Spinner className="size-8" />
			</div>
		);
	}

	if (role === "teacher" && !isOpsDashboard) {
		return <TeacherDashboard />;
	}

	return <AdminDashboard enabled={isOpsDashboard} />;
}
