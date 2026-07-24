"use client";

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
import type { ReactNode } from "react";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	children: ReactNode;
	onSubmit?: () => void;
	submitLabel?: string;
	cancelLabel?: string;
	saving?: boolean;
	error?: string | null;
	submitDisabled?: boolean;
};

export function FormDrawer({
	open,
	onOpenChange,
	title,
	description,
	children,
	onSubmit,
	submitLabel = "Save",
	cancelLabel = "Cancel",
	saving = false,
	error = null,
	submitDisabled = false,
}: Props) {
	return (
		<Drawer open={open} onOpenChange={onOpenChange} direction="right">
			<DrawerContent className="h-full max-h-none data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-md">
				<form
					className="flex min-h-0 flex-1 flex-col"
					onSubmit={(event) => {
						event.preventDefault();
						onSubmit?.();
					}}
				>
					<DrawerHeader className="border-dashboard-border border-b text-start">
						<DrawerTitle className="text-[18px]">{title}</DrawerTitle>
						{description ? <DrawerDescription>{description}</DrawerDescription> : null}
					</DrawerHeader>

					<div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{children}</div>

					{error ? (
						<p className="px-4 pb-2 text-[12px] text-destructive" role="alert">
							{error}
						</p>
					) : null}

					<DrawerFooter className="border-dashboard-border border-t sm:flex-row sm:justify-end">
						<DrawerClose asChild>
							<Button type="button" variant="outline" disabled={saving}>
								{cancelLabel}
							</Button>
						</DrawerClose>
						<Button type="submit" disabled={saving || submitDisabled}>
							{saving ? <Spinner className="size-4" /> : submitLabel}
						</Button>
					</DrawerFooter>
				</form>
			</DrawerContent>
		</Drawer>
	);
}
