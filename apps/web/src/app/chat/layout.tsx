import type { Metadata } from "next";

import { RequireAuth } from "@/modules/auth/components";
import "@/modules/chat/styles/chat.css";

export const metadata: Metadata = {
	title: "Chat",
	description: "School OS chat workspace",
};

export default function ChatLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return <RequireAuth>{children}</RequireAuth>;
}
