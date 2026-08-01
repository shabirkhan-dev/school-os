"use client";

import { MotionProvider } from "@school-os/ui/components/motion-provider";
import { ToastProvider } from "@school-os/ui/components/toaster";
import { TooltipProvider } from "@school-os/ui/components/tooltip";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme";
import { AuthProvider } from "@/modules/auth/context";
import { QueryProvider } from "./providers/query-provider";

export function Providers({ children }: { children: ReactNode }) {
	return (
		<ThemeProvider>
			<MotionProvider>
				<QueryProvider>
					<AuthProvider>
						<ToastProvider>
							{/* Global tooltip defaults; no per-component providers needed. */}
							<TooltipProvider delay={120}>{children}</TooltipProvider>
						</ToastProvider>
					</AuthProvider>
				</QueryProvider>
			</MotionProvider>
		</ThemeProvider>
	);
}
