"use client";

import { Alert, AlertDescription, AlertTitle } from "@school-os/ui/components/alert";
import { Button } from "@school-os/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@school-os/ui/components/card";
import { Spinner } from "@school-os/ui/components/spinner";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useMagicLinkConsumeMutation } from "../hooks/use-auth-mutations";

export function MagicLinkConsumer() {
	const router = useRouter();
	const search = useSearchParams();
	const consume = useMagicLinkConsumeMutation();
	const started = useRef(false);
	const token = search.get("token");

	useEffect(() => {
		if (!token || started.current) return;
		started.current = true;
		window.history.replaceState({}, "", "/magic-link");
		consume.mutate(token, { onSuccess: () => router.replace("/admin") });
	}, [consume, router, token]);

	return (
		<Card className="rounded-[16px] border border-dashboard-border bg-dashboard-surface ring-0">
			<CardHeader className="text-center">
				<CardTitle>Secure sign in</CardTitle>
				<CardDescription>Verifying your one-time link</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-4">
				{!token ? (
					<Alert variant="destructive">
						<AlertTitle>Invalid link</AlertTitle>
						<AlertDescription>The sign-in token is missing.</AlertDescription>
					</Alert>
				) : consume.isError ? (
					<Alert variant="destructive">
						<AlertTitle>Link expired</AlertTitle>
						<AlertDescription>{consume.error.message}</AlertDescription>
					</Alert>
				) : (
					<div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
						<Spinner />
						Signing you in...
					</div>
				)}
				<Button variant="outline" render={<Link href="/login" />} nativeButton={false}>
					Back to login
				</Button>
			</CardContent>
		</Card>
	);
}
