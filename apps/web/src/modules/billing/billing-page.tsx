"use client";

import {
	ArrowRight01Icon,
	CheckmarkCircle02Icon,
	CreditCardIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Badge } from "@school-os/ui/components/badge";
import { Button, buttonVariants } from "@school-os/ui/components/button";
import { Skeleton } from "@school-os/ui/components/skeleton";
import { Spinner } from "@school-os/ui/components/spinner";
import { ToggleGroup, ToggleGroupItem } from "@school-os/ui/components/toggle-group";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import {
	type BillingInterval,
	billingService,
	type PaymentProviderName,
	type PlanCode,
	type SubscriptionView,
} from "./billing.service";

type PlanOption = {
	code: PlanCode;
	label: string;
	tagline: string;
	monthly: number;
	features: string[];
	recommended?: boolean;
};

const PLANS: PlanOption[] = [
	{
		code: "team",
		label: "Team",
		tagline: "For small crews shipping the starter into production.",
		monthly: 49,
		recommended: true,
		features: ["Up to 5 workspaces", "Shared UI + Nest spine", "Email support", "Cancel anytime"],
	},
	{
		code: "enterprise",
		label: "Enterprise",
		tagline: "More seats, priority support, and onboarding help.",
		monthly: 399,
		features: [
			"Higher workspace limits",
			"Priority support",
			"Guided onboarding",
			"Invoice-friendly billing",
		],
	},
];

const PROVIDER_COPY: Record<PaymentProviderName, { label: string; hint: string }> = {
	stripe: { label: "Stripe", hint: "Cards worldwide · hosted checkout" },
	razorpay: { label: "Razorpay", hint: "India-friendly · UPI & cards" },
};

function yearlyMonthly(monthly: number): number {
	return Math.round((monthly * 10) / 12);
}

function formatMoney(amount: number): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: 0,
	}).format(amount);
}

function statusTone(status: string): "default" | "secondary" | "destructive" | "outline" {
	if (status === "active" || status === "trialing") return "default";
	if (status === "past_due" || status === "unpaid") return "destructive";
	return "secondary";
}

export function BillingPageContent() {
	const { token, user, loading } = useAuth();
	const router = useRouter();
	const [providers, setProviders] = useState<PaymentProviderName[]>([]);
	const [provider, setProvider] = useState<PaymentProviderName>("stripe");
	const [planCode, setPlanCode] = useState<PlanCode>("team");
	const [billingInterval, setBillingInterval] = useState<BillingInterval>("monthly");
	const [subscription, setSubscription] = useState<SubscriptionView>(null);
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);
	const [ready, setReady] = useState(false);

	useEffect(() => {
		if (loading) return;
		if (!token) {
			router.replace("/login?next=/billing");
			return;
		}

		let cancelled = false;
		void (async () => {
			try {
				const [providerResult, subscriptionResult] = await Promise.all([
					billingService.listProviders(token),
					billingService.getSubscription(token),
				]);
				if (cancelled) return;
				setProviders(providerResult.providers);
				if (providerResult.providers[0]) {
					setProvider(providerResult.providers[0]);
				}
				const next = subscriptionResult.subscription;
				setSubscription(next);
				if (next?.planCode === "team" || next?.planCode === "enterprise") {
					setPlanCode(next.planCode);
				}
				if (next?.billingInterval === "monthly" || next?.billingInterval === "yearly") {
					setBillingInterval(next.billingInterval);
				}
				if (next?.provider === "stripe" || next?.provider === "razorpay") {
					setProvider(next.provider);
				}
			} catch {
				if (!cancelled) setProviders([]);
			} finally {
				if (!cancelled) setReady(true);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [loading, router, token]);

	const selectedPlan = useMemo(
		() => PLANS.find((plan) => plan.code === planCode) ?? PLANS[0],
		[planCode],
	);

	const displayPrice =
		billingInterval === "yearly" ? yearlyMonthly(selectedPlan.monthly) : selectedPlan.monthly;
	const billedToday =
		billingInterval === "yearly" ? selectedPlan.monthly * 10 : selectedPlan.monthly;

	const canManageStripe = subscription?.provider === "stripe";
	const checkoutDisabled = busy || providers.length === 0;

	const startCheckout = async () => {
		if (!token) return;
		setBusy(true);
		setError(null);
		try {
			const result = await billingService.createCheckout(token, {
				provider,
				planCode,
				billingInterval,
			});
			window.location.href = result.checkoutUrl;
		} catch (err) {
			setError(err instanceof Error ? err.message : "Checkout failed");
			setBusy(false);
		}
	};

	const openPortal = async () => {
		if (!token) return;
		setBusy(true);
		setError(null);
		try {
			const result = await billingService.createPortal(token, {
				provider: "stripe",
				returnUrl: `${window.location.origin}/billing`,
			});
			window.location.href = result.url;
		} catch (err) {
			setError(err instanceof Error ? err.message : "Billing portal unavailable");
			setBusy(false);
		}
	};

	if (loading || !user || !ready) {
		return <BillingSkeleton />;
	}

	return (
		<div className="min-h-[calc(100vh-4rem)] bg-dashboard-bg">
			<div className="mx-auto w-full max-w-[1120px] px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
				<header className="flex flex-col gap-4 border-dashboard-border border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
					<div className="min-w-0">
						<p className="mb-1.5 text-[11px] text-dashboard-text-muted uppercase tracking-wide">
							Account
						</p>
						<h1 className="font-semibold text-[26px] text-dashboard-text-primary leading-tight tracking-tight">
							Billing
						</h1>
						<p className="mt-1.5 max-w-xl text-[13px] text-dashboard-text-muted leading-5">
							Upgrade when you need team seats or managed support. Starter stays free to clone and
							run.
						</p>
					</div>
					<Link
						href="/pricing"
						className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
					>
						Public pricing
						<HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" strokeWidth={1.8} />
					</Link>
				</header>

				<div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
					<div className="space-y-5">
						<SubscriptionBanner
							subscription={subscription}
							onManage={openPortal}
							busy={busy}
							canManage={canManageStripe}
						/>

						<section className="overflow-hidden rounded-[16px] border border-dashboard-border bg-dashboard-surface">
							<div className="flex flex-col gap-3 border-dashboard-border border-b px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
								<div>
									<h2 className="font-semibold text-[14px] text-dashboard-text-primary">Plan</h2>
									<p className="mt-0.5 text-[12px] text-dashboard-text-muted">
										Select what you want after checkout.
									</p>
								</div>
								<IntervalToggle value={billingInterval} onChange={setBillingInterval} />
							</div>

							<div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
								{PLANS.map((plan) => {
									const selected = planCode === plan.code;
									const price =
										billingInterval === "yearly" ? yearlyMonthly(plan.monthly) : plan.monthly;
									return (
										<button
											key={plan.code}
											type="button"
											onClick={() => setPlanCode(plan.code)}
											aria-pressed={selected}
											className={cn(
												"relative flex h-full flex-col rounded-[12px] border px-4 py-4 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-dashboard-border-focus",
												selected
													? "border-dashboard-text-primary bg-dashboard-surface-strong"
													: "border-dashboard-border bg-dashboard-surface-elevated hover:border-dashboard-text-muted",
											)}
										>
											<div className="flex items-center justify-between gap-2">
												<p className="font-semibold text-[15px] text-dashboard-text-primary">
													{plan.label}
												</p>
												{plan.recommended ? (
													<Badge className="h-auto rounded-md bg-dashboard-text-primary px-1.5 py-0.5 text-[10px] text-dashboard-bg">
														Popular
													</Badge>
												) : null}
											</div>
											<p className="mt-1 text-[12px] text-dashboard-text-muted leading-5">
												{plan.tagline}
											</p>
											<p className="mt-4 flex items-baseline gap-1">
												<span className="font-semibold text-[28px] text-dashboard-text-primary tabular-nums tracking-tight">
													{formatMoney(price)}
												</span>
												<span className="text-[12px] text-dashboard-text-muted">/mo</span>
											</p>
											{billingInterval === "yearly" ? (
												<p className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-400">
													{formatMoney(plan.monthly * 10)} billed yearly · 2 months free
												</p>
											) : (
												<p className="mt-1 text-[11px] text-dashboard-text-muted">Billed monthly</p>
											)}
											<ul className="mt-4 space-y-2 border-dashboard-border-subtle border-t pt-4">
												{plan.features.map((feature) => (
													<li
														key={feature}
														className="flex items-start gap-2 text-[12px] text-dashboard-text-secondary"
													>
														<HugeiconsIcon
															icon={CheckmarkCircle02Icon}
															className="mt-0.5 size-3.5 shrink-0 text-dashboard-text-primary"
															strokeWidth={1.8}
														/>
														{feature}
													</li>
												))}
											</ul>
										</button>
									);
								})}
							</div>
						</section>

						{providers.length > 0 ? (
							<section className="overflow-hidden rounded-[16px] border border-dashboard-border bg-dashboard-surface">
								<div className="border-dashboard-border border-b px-4 py-3.5">
									<h2 className="font-semibold text-[14px] text-dashboard-text-primary">
										Checkout provider
									</h2>
									<p className="mt-0.5 text-[12px] text-dashboard-text-muted">
										{providers.length > 1
											? "Same plan price — pick where payment is processed."
											: `Checkout runs through ${PROVIDER_COPY[provider].label}.`}
									</p>
								</div>
								<div
									className={cn(
										"grid gap-2 p-4 sm:p-5",
										providers.length > 1 ? "sm:grid-cols-2" : "sm:grid-cols-1",
									)}
								>
									{providers.map((item) => {
										const selected = provider === item;
										const copy = PROVIDER_COPY[item];
										const selectable = providers.length > 1;
										return (
											<button
												key={item}
												type="button"
												onClick={() => selectable && setProvider(item)}
												aria-pressed={selected}
												disabled={!selectable}
												className={cn(
													"flex items-start gap-3 rounded-[12px] border px-3.5 py-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-dashboard-border-focus",
													selected
														? "border-dashboard-text-primary bg-dashboard-surface-strong"
														: "border-dashboard-border hover:bg-dashboard-surface-hover",
													!selectable && "cursor-default opacity-100",
												)}
											>
												<span className="mt-0.5 grid size-8 place-items-center rounded-md border border-dashboard-border bg-dashboard-surface-elevated">
													<HugeiconsIcon
														icon={CreditCardIcon}
														className="size-4 text-dashboard-text-secondary"
														strokeWidth={1.8}
													/>
												</span>
												<span className="min-w-0">
													<span className="block font-medium text-[13px] text-dashboard-text-primary">
														{copy.label}
													</span>
													<span className="mt-0.5 block text-[11px] text-dashboard-text-muted">
														{copy.hint}
													</span>
												</span>
											</button>
										);
									})}
								</div>
							</section>
						) : (
							<div className="rounded-[16px] border border-amber-500/30 bg-amber-500/5 px-4 py-4 text-[13px] text-dashboard-text-secondary leading-5">
								<p className="font-medium text-dashboard-text-primary">
									Checkout is not configured
								</p>
								<p className="mt-1">
									Add Stripe and/or Razorpay keys in{" "}
									<code className="rounded bg-dashboard-surface-strong px-1.5 py-0.5 text-[12px]">
										apps/nest-api/.env
									</code>
									, then restart the API. You can still review plans here.
								</p>
							</div>
						)}
					</div>

					<aside className="lg:sticky lg:top-6">
						<div className="overflow-hidden rounded-[16px] border border-dashboard-border bg-dashboard-surface">
							<div className="border-dashboard-border border-b px-4 py-3.5">
								<h2 className="font-semibold text-[14px] text-dashboard-text-primary">
									Order summary
								</h2>
							</div>
							<div className="space-y-4 p-4 sm:p-5">
								<dl className="space-y-3 text-[13px]">
									<div className="flex items-center justify-between gap-3">
										<dt className="text-dashboard-text-muted">Plan</dt>
										<dd className="font-medium text-dashboard-text-primary">
											{selectedPlan.label}
										</dd>
									</div>
									<div className="flex items-center justify-between gap-3">
										<dt className="text-dashboard-text-muted">Billing</dt>
										<dd className="font-medium text-dashboard-text-primary capitalize">
											{billingInterval}
										</dd>
									</div>
									<div className="flex items-center justify-between gap-3">
										<dt className="text-dashboard-text-muted">Provider</dt>
										<dd className="font-medium text-dashboard-text-primary">
											{PROVIDER_COPY[provider].label}
										</dd>
									</div>
									<div className="flex items-baseline justify-between gap-3 border-dashboard-border-subtle border-t pt-3">
										<dt className="text-dashboard-text-muted">Due today</dt>
										<dd className="font-semibold text-[18px] text-dashboard-text-primary tabular-nums">
											{formatMoney(billedToday)}
										</dd>
									</div>
								</dl>

								<p className="rounded-[10px] bg-dashboard-surface-elevated px-3 py-2.5 text-[12px] text-dashboard-text-muted leading-5">
									{billingInterval === "yearly"
										? `Then ${formatMoney(displayPrice)}/mo effective · renews yearly unless canceled.`
										: `Then ${formatMoney(displayPrice)} every month until you cancel.`}
								</p>

								{error ? (
									<p
										role="alert"
										className="rounded-[10px] border border-destructive/30 bg-destructive/5 px-3 py-2 text-[12px] text-destructive"
									>
										{error}
									</p>
								) : null}

								<Button
									type="button"
									disabled={checkoutDisabled}
									onClick={() => void startCheckout()}
									className="h-11 w-full gap-2"
								>
									{busy ? (
										<>
											<Spinner />
											Redirecting…
										</>
									) : (
										<>
											Continue to checkout
											<HugeiconsIcon icon={ArrowRight01Icon} className="size-4" strokeWidth={1.8} />
										</>
									)}
								</Button>

								{canManageStripe ? (
									<Button
										type="button"
										variant="outline"
										disabled={busy}
										onClick={() => void openPortal()}
										className="w-full"
									>
										Open Stripe customer portal
									</Button>
								) : null}

								<p className="text-center text-[11px] text-dashboard-text-muted leading-4">
									Payments are processed by {PROVIDER_COPY[provider].label}. School OS does not
									store card numbers.
								</p>
							</div>
						</div>
					</aside>
				</div>
			</div>
		</div>
	);
}

function IntervalToggle({
	value,
	onChange,
}: {
	value: BillingInterval;
	onChange: (next: BillingInterval) => void;
}) {
	return (
		<ToggleGroup
			value={[value]}
			onValueChange={(next) => {
				const selected = next[0] as BillingInterval | undefined;
				if (selected) onChange(selected);
			}}
			aria-label="Billing interval"
			spacing={0}
			className="rounded-lg border border-dashboard-border bg-dashboard-surface-elevated p-0.5"
		>
			{(["monthly", "yearly"] as const).map((interval) => {
				const active = value === interval;
				return (
					<ToggleGroupItem
						key={interval}
						value={interval}
						className={cn(
							"relative h-8 rounded-md! px-3! text-[12px] capitalize transition-colors",
							active
								? "bg-dashboard-text-primary font-medium text-dashboard-bg hover:bg-dashboard-text-primary hover:text-dashboard-bg aria-pressed:bg-dashboard-text-primary aria-pressed:text-dashboard-bg"
								: "text-dashboard-text-secondary hover:bg-transparent hover:text-dashboard-text-primary",
						)}
					>
						{interval}
						{interval === "yearly" ? (
							<span
								className={cn(
									"ml-1.5 hidden rounded px-1.5 py-0.5 text-[10px] sm:inline",
									active
										? "bg-dashboard-bg/15 text-dashboard-bg"
										: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
								)}
							>
								Save 17%
							</span>
						) : null}
					</ToggleGroupItem>
				);
			})}
		</ToggleGroup>
	);
}

function SubscriptionBanner({
	subscription,
	onManage,
	busy,
	canManage,
}: {
	subscription: SubscriptionView;
	onManage: () => void;
	busy: boolean;
	canManage: boolean;
}) {
	if (!subscription) {
		return (
			<section className="rounded-[16px] border border-dashed border-dashboard-border bg-dashboard-surface px-4 py-4 sm:px-5">
				<div className="flex items-start gap-3">
					<span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md border border-dashboard-border bg-dashboard-surface-elevated">
						<HugeiconsIcon
							icon={CreditCardIcon}
							className="size-4 text-dashboard-text-muted"
							strokeWidth={1.8}
						/>
					</span>
					<div>
						<p className="font-medium text-[13px] text-dashboard-text-primary">Free starter</p>
						<p className="mt-1 text-[12px] text-dashboard-text-muted leading-5">
							No paid subscription yet. Choose a plan below when you are ready to upgrade.
						</p>
					</div>
				</div>
			</section>
		);
	}

	const periodEnd = subscription.currentPeriodEnd
		? new Date(subscription.currentPeriodEnd).toLocaleDateString(undefined, {
				month: "short",
				day: "numeric",
				year: "numeric",
			})
		: null;

	return (
		<section className="overflow-hidden rounded-[16px] border border-dashboard-border bg-dashboard-surface">
			<div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-2">
						<p className="font-semibold text-[14px] text-dashboard-text-primary capitalize">
							{subscription.planCode} plan
						</p>
						<Badge variant={statusTone(subscription.status)} className="capitalize text-[11px]">
							{subscription.status.replaceAll("_", " ")}
						</Badge>
						<Badge variant="outline" className="border-dashboard-border text-[11px] capitalize">
							{subscription.provider}
						</Badge>
					</div>
					<p className="mt-1.5 text-[12px] text-dashboard-text-muted">
						{subscription.cancelAtPeriodEnd
							? `Cancels ${periodEnd ? `on ${periodEnd}` : "at period end"}`
							: periodEnd
								? `Renews on ${periodEnd}`
								: `Billed ${subscription.billingInterval}`}
					</p>
				</div>
				{canManage ? (
					<Button
						type="button"
						variant="outline"
						size="sm"
						disabled={busy}
						onClick={onManage}
						className="shrink-0"
					>
						Manage
					</Button>
				) : null}
			</div>
		</section>
	);
}

function BillingSkeleton() {
	return (
		<div className="min-h-[calc(100vh-4rem)] bg-dashboard-bg">
			<div className="mx-auto w-full max-w-[1120px] px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
				<Skeleton className="h-20 rounded-lg bg-dashboard-surface" />
				<div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
					<div className="space-y-5">
						<Skeleton className="h-24 rounded-[16px] bg-dashboard-surface" />
						<Skeleton className="h-80 rounded-[16px] bg-dashboard-surface" />
					</div>
					<Skeleton className="h-72 rounded-[16px] bg-dashboard-surface" />
				</div>
			</div>
		</div>
	);
}
