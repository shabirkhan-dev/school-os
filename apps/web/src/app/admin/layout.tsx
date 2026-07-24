import { RequireAuth } from "@/modules/auth/components";
import { DashboardI18nShell } from "@/modules/dashboard";
import { PendingInvitesBanner } from "@/modules/members";
import { RoleCampusScope, TenantOnboardingGate, TenantProvider } from "@/modules/tenants";
import { AdminScrollLock } from "./_components/admin-scroll-lock";
import { AdminSidebar } from "./_components/admin-sidebar";
import { AdminTopbar } from "./_components/admin-topbar";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<RequireAuth>
			<TenantProvider>
				<TenantOnboardingGate>
					<RoleCampusScope />
					<AdminScrollLock />
					{/*
					  One scroll owner only: this shell is viewport-locked; main scrolls.
					  overflow-x-hidden stops wide charts from adding a second (horizontal) bar.
					*/}
					<DashboardI18nShell className="flex h-dvh max-h-dvh overflow-hidden bg-dashboard-bg text-dashboard-text-primary">
						<AdminSidebar className="hidden lg:flex" />
						<div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
							<AdminTopbar />
							<PendingInvitesBanner />
							<main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
								{children}
							</main>
						</div>
					</DashboardI18nShell>
				</TenantOnboardingGate>
			</TenantProvider>
		</RequireAuth>
	);
};

export default AdminLayout;
