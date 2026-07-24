import { Spinner } from "@school-os/ui/components/spinner";
import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/modules/auth/components";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
	return (
		<div className="flex min-h-svh flex-col items-center justify-center bg-dashboard-bg p-6 md:p-10">
			<div className="w-full max-w-sm md:max-w-md">
				<Suspense
					fallback={
						<div className="flex min-h-48 items-center justify-center">
							<Spinner className="size-6 text-muted-foreground" />
						</div>
					}
				>
					<LoginForm />
				</Suspense>
			</div>
		</div>
	);
}
