"use client";

import type { MembershipRole } from "@/modules/tenants/constants/permission-codes";
import { useSessionStore } from "@/store";

export type WorkspaceSwitcherPolicy = {
	allowCampusSwitch: boolean;
	allowOrganizationSwitch: boolean;
	workspaceSubtitle: string;
};

export function useWorkspaceSwitcherPolicy(): WorkspaceSwitcherPolicy {
	const role = useSessionStore((state) => state.membership?.role ?? null) as MembershipRole | null;
	const tenants = useSessionStore((state) => state.tenants);

	if (role === "student") {
		return {
			allowCampusSwitch: false,
			allowOrganizationSwitch: false,
			workspaceSubtitle: "Your campus",
		};
	}

	if (role === "parent") {
		return {
			allowCampusSwitch: false,
			allowOrganizationSwitch: tenants.length > 1,
			workspaceSubtitle: "All campuses · your children",
		};
	}

	if (role === "owner") {
		return {
			allowCampusSwitch: true,
			allowOrganizationSwitch: tenants.length > 1,
			workspaceSubtitle: "Organization & campuses",
		};
	}

	return {
		allowCampusSwitch: role !== null && !["student", "parent"].includes(role),
		allowOrganizationSwitch:
			tenants.length > 1 && role !== null && ["owner", "admin", "parent"].includes(role),
		workspaceSubtitle: "Campus workspace",
	};
}
