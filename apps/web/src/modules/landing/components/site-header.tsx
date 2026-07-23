"use client";

import { ArrowDown01Icon, Cancel01Icon, Menu01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { SchoolOsLogo } from "@school-os/ui";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useId, useState } from "react";
import { NAV_ITEMS, type NavItem, type NavSubItem } from "../data/landing.data";
import { ATLAS_EASE, menuItemVariants, springSnappy, springSoft } from "../lib/motion";
import { useAtlasTheme } from "../lib/theme";
import { cn } from "../lib/utils";
import { LandingAuthActions } from "./landing-auth-actions";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
	const [openMenu, setOpenMenu] = useState<string | null>(null);
	const [mobileOpen, setMobileOpen] = useState(false);
	const [mobileSection, setMobileSection] = useState<string | null>("Resources");
	const reduceMotion = useReducedMotion();
	const { theme, toggleTheme, mounted } = useAtlasTheme();

	const closeMobile = () => setMobileOpen(false);

	return (
		<section className="sticky top-0 z-50 w-full px-4 pt-6 sm:px-8">
			<header className="relative mx-auto w-full max-w-5xl">
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: -12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.55, ease: ATLAS_EASE }}
					className="relative flex h-14 items-center justify-between rounded-full border border-border/60 bg-card/90 px-3 shadow-sm backdrop-blur-xl sm:px-4"
				>
					<Link
						href="/"
						className="flex shrink-0 items-center rounded-lg px-1 outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
					>
						<SchoolOsLogo className="h-6 sm:h-7" />
					</Link>

					<nav className="-translate-x-1/2 absolute left-1/2 hidden items-center gap-0.5 lg:flex">
						{NAV_ITEMS.map((item) => {
							if (item.items) {
								return (
									<DesktopDropdown
										key={item.label}
										item={item}
										items={item.items}
										open={openMenu === item.label}
										onOpen={() => setOpenMenu(item.label)}
										onClose={() => setOpenMenu(null)}
										reduceMotion={!!reduceMotion}
									/>
								);
							}

							return (
								<motion.div key={item.label} whileHover={{ y: -1 }} transition={springSnappy}>
									<Link
										href={item.href}
										className="relative z-10 rounded-lg px-3 py-2 font-medium text-foreground/80 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-foreground/30 hover:text-foreground"
									>
										{item.label}
									</Link>
								</motion.div>
							);
						})}
					</nav>

					<div className="flex items-center gap-2">
						<ThemeToggle
							theme={theme}
							onToggle={toggleTheme}
							mounted={mounted}
							className="hidden sm:inline-flex"
						/>
						<LandingAuthActions />
						<button
							type="button"
							aria-label={mobileOpen ? "Close menu" : "Open menu"}
							aria-expanded={mobileOpen}
							onClick={() => setMobileOpen((prev) => !prev)}
							className="grid size-9 place-items-center rounded-lg border border-border/60 bg-card text-foreground outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 lg:hidden"
						>
							{mobileOpen ? (
								<HugeiconsIcon icon={Cancel01Icon} className="size-4" strokeWidth={2} />
							) : (
								<HugeiconsIcon icon={Menu01Icon} className="size-4" strokeWidth={2} />
							)}
						</button>
					</div>
				</motion.div>

				<AnimatePresence>
					{mobileOpen ? (
						<motion.div
							key="mobile-nav"
							initial={reduceMotion ? false : { opacity: 0, y: -10, scale: 0.98 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: -8, scale: 0.98 }}
							transition={springSoft}
							className="mt-2 w-full overflow-hidden rounded-[1.75rem] border border-border/50 bg-card shadow-[0_24px_60px_-28px_rgba(0,0,0,0.35)] lg:hidden"
						>
							<nav className="flex flex-col px-2 pt-2 pb-3">
								{NAV_ITEMS.map((item) =>
									item.items ? (
										<MobileAccordion
											key={item.label}
											item={item}
											items={item.items}
											open={mobileSection === item.label}
											reduceMotion={!!reduceMotion}
											onToggle={() =>
												setMobileSection((prev) => (prev === item.label ? null : item.label))
											}
											onNavigate={closeMobile}
										/>
									) : (
										<Link
											key={item.label}
											href={item.href}
											onClick={closeMobile}
											className="rounded-xl px-3.5 py-3.5 font-medium text-foreground text-[15px] outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
										>
											{item.label}
										</Link>
									),
								)}

								<LandingAuthActions mobile onNavigate={closeMobile} />
								<div className="mt-2 flex justify-center px-1.5 pb-1 sm:hidden">
									<ThemeToggle theme={theme} onToggle={toggleTheme} mounted={mounted} />
								</div>
							</nav>
						</motion.div>
					) : null}
				</AnimatePresence>
			</header>
		</section>
	);
}

type MobileAccordionProps = {
	item: NavItem;
	items: NavSubItem[];
	open: boolean;
	reduceMotion: boolean;
	onToggle: () => void;
	onNavigate: () => void;
};

function MobileAccordion({
	item,
	items,
	open,
	reduceMotion,
	onToggle,
	onNavigate,
}: MobileAccordionProps) {
	const panelId = useId();

	return (
		<div className="border-border/40 border-b last:border-b-0">
			<button
				type="button"
				aria-expanded={open}
				aria-controls={panelId}
				onClick={onToggle}
				className="flex w-full items-center justify-between rounded-xl px-3.5 py-3.5 text-left font-medium text-foreground text-[15px] outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
			>
				{item.label}
				<motion.span
					animate={{ rotate: open ? 180 : 0 }}
					transition={springSnappy}
					className="inline-flex text-muted-foreground"
				>
					<HugeiconsIcon
						icon={ArrowDown01Icon}
						className="size-4"
						strokeWidth={2}
						aria-hidden={true}
					/>
				</motion.span>
			</button>

			<AnimatePresence initial={false}>
				{open ? (
					<motion.div
						id={panelId}
						key={`${item.label}-panel`}
						initial={reduceMotion ? false : { height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
						transition={springSoft}
						className="overflow-hidden"
					>
						<div className="flex flex-col gap-0.5 pb-3 pl-2">
							{items.map((sub, index) => (
								<motion.div
									key={sub.label}
									initial={reduceMotion ? false : { opacity: 0, y: 6 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.04, ...springSoft }}
								>
									<Link
										href={sub.href}
										onClick={onNavigate}
										className="block rounded-xl px-3.5 py-2.5 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
									>
										<span className="block font-medium text-foreground text-sm">{sub.label}</span>
										<span className="mt-0.5 block text-muted-foreground text-xs leading-5">
											{sub.description}
										</span>
									</Link>
								</motion.div>
							))}
						</div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</div>
	);
}

type DesktopDropdownProps = {
	item: NavItem;
	items: NavSubItem[];
	open: boolean;
	onOpen: () => void;
	onClose: () => void;
	reduceMotion: boolean;
};

function DesktopDropdown({
	item,
	items,
	open,
	onOpen,
	onClose,
	reduceMotion,
}: DesktopDropdownProps) {
	const menuId = useId();
	const [hovered, setHovered] = useState<string | null>(items[0]?.label ?? null);

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: hover bridge for dropdown + keyboard via trigger
		<div
			className="relative"
			onMouseEnter={onOpen}
			onMouseLeave={() => {
				onClose();
				setHovered(items[0]?.label ?? null);
			}}
			onFocus={onOpen}
			onBlur={(event) => {
				if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
					onClose();
				}
			}}
		>
			<motion.button
				type="button"
				aria-expanded={open}
				aria-haspopup="menu"
				aria-controls={menuId}
				onClick={() => (open ? onClose() : onOpen())}
				className={cn(
					"relative z-10 flex items-center gap-1 rounded-lg px-3 py-2 font-medium text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-foreground/30",
					open ? "text-foreground" : "text-foreground/80 hover:text-foreground",
				)}
				whileHover={{ y: -1 }}
				transition={springSnappy}
			>
				{item.label}
				<motion.span
					animate={{ rotate: open ? 180 : 0 }}
					transition={springSnappy}
					className="inline-flex"
				>
					<HugeiconsIcon
						icon={ArrowDown01Icon}
						className="size-3.5"
						strokeWidth={2}
						aria-hidden={true}
					/>
				</motion.span>
			</motion.button>

			<AnimatePresence>
				{open ? (
					<motion.div
						id={menuId}
						key={`${item.label}-menu`}
						role="menu"
						aria-label={item.label}
						initial={reduceMotion ? false : { opacity: 0, y: 8, scale: 0.98 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 6, scale: 0.98 }}
						transition={reduceMotion ? { duration: 0 } : springSnappy}
						className="absolute top-full left-1/2 w-[min(20rem,calc(100vw-2rem))] origin-top -translate-x-1/2 pt-3"
						style={{ transformOrigin: "50% 0%" }}
					>
						<div className="rounded-2xl border border-border/50 bg-popover p-2 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.55)]">
							<LayoutGroup id={`${item.label}-menu-items`}>
								<motion.div
									initial="hidden"
									animate="visible"
									variants={
										reduceMotion
											? undefined
											: {
													hidden: {},
													visible: {
														transition: { staggerChildren: 0.04, delayChildren: 0.03 },
													},
												}
									}
									className="flex flex-col"
								>
									{items.map((sub) => (
										<NavMenuItem
											key={sub.label}
											item={sub}
											hovered={hovered === sub.label}
											onHoverStart={() => setHovered(sub.label)}
											reduceMotion={reduceMotion}
										/>
									))}
								</motion.div>
							</LayoutGroup>
						</div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</div>
	);
}

type NavMenuItemProps = {
	item: NavSubItem;
	hovered: boolean;
	onHoverStart: () => void;
	reduceMotion: boolean;
};

function NavMenuItem({ item, hovered, onHoverStart, reduceMotion }: NavMenuItemProps) {
	return (
		<motion.div
			variants={reduceMotion ? undefined : menuItemVariants}
			onHoverStart={onHoverStart}
			className="relative"
		>
			{hovered ? (
				reduceMotion ? (
					<div className="absolute inset-0 rounded-xl bg-muted" />
				) : (
					<motion.div
						layoutId="nav-menu-highlight"
						className="absolute inset-0 rounded-xl bg-muted"
						transition={springSnappy}
					/>
				)
			) : null}

			<Link
				href={item.href}
				role="menuitem"
				className="relative z-10 block rounded-xl px-3.5 py-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
			>
				<span className="block font-medium text-foreground text-sm leading-5">{item.label}</span>
				<span className="mt-0.5 block text-muted-foreground text-xs leading-5">
					{item.description}
				</span>
			</Link>
		</motion.div>
	);
}
