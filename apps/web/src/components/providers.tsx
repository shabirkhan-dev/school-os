"use client";

import { MotionProvider } from "@school-os/ui/components/motion-provider";
import { ToastProvider } from "@school-os/ui/components/toaster";
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
						<ToastProvider>{children}</ToastProvider>
					</AuthProvider>
				</QueryProvider>
			</MotionProvider>
		</ThemeProvider>
	);
}
