import { TenantCreateForm } from "@/modules/tenants";

export default function TenantOnboardingPage() {
	return (
		<div className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-3 py-8 sm:px-6 lg:px-8">
			<div>
				<p className="text-[11px] text-dashboard-text-muted uppercase tracking-[0.06em]">
					Getting started
				</p>
				<h1 className="mt-1 font-semibold text-[24px] text-dashboard-text-primary">
					Welcome to School OS
				</h1>
				<p className="mt-2 max-w-xl text-[14px] text-dashboard-text-muted leading-relaxed">
					Before attendance, messaging, or dashboards go live, create your organization tenant. This
					is the boundary for your school network — campuses and users attach to it next.
				</p>
			</div>
			<TenantCreateForm />
		</div>
	);
}
