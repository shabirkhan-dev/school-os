import {
	ApertureIcon,
	CircleIcon,
	CommandIcon,
	GemIcon,
	HexagonIcon,
	OctagonIcon,
	Package01Icon,
	SecurityCheckIcon,
	TriangleIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

export const SITE = {
	name: "School OS",
	title: "School OS — the trust engine for schools",
	description:
		"Mobile-first school management starting with Smart Attendance and instant WhatsApp parent alerts — not another ERP.",
} as const;

export type NavLink = {
	label: string;
	href: string;
};

export type NavSubItem = {
	label: string;
	description: string;
	href: string;
};

export type NavItem = {
	label: string;
	href: string;
	items?: NavSubItem[];
};

export const NAV_ITEMS: NavItem[] = [
	{
		label: "Product",
		href: "#product",
		items: [
			{
				label: "Smart Attendance",
				description: "QR check-in and instant parent alerts",
				href: "/#product",
			},
			{
				label: "Why School OS",
				description: "Trust-first, mobile-native, privacy by default",
				href: "/#why",
			},
			{
				label: "Modules",
				description: "Communication, academics, finance, and AI",
				href: "/#capabilities",
			},
		],
	},
	{
		label: "Resources",
		href: "#customers",
		items: [
			{
				label: "Docs",
				description: "Product vision and engineering guides",
				href: "http://localhost:3002/docs/product-vision",
			},
			{
				label: "Stack",
				description: "Next.js, Expo, NestJS, Postgres",
				href: "/#customers",
			},
			{
				label: "About",
				description: "Mission and team",
				href: "/about",
			},
		],
	},
	{ label: "Pricing", href: "/pricing" },
	{ label: "About", href: "/about" },
];

export type HeroAvatar = {
	seed: string;
	alt: string;
};

export const HERO_AVATARS: HeroAvatar[] = [
	{ seed: "ParentPriya", alt: "Parent" },
	{ seed: "TeacherMarcus", alt: "Teacher" },
	{ seed: "PrincipalLena", alt: "Principal" },
	{ seed: "GuardTheo", alt: "Gate guard" },
];

export type WorkflowStep = {
	id: string;
	label: string;
	detail: string;
};

/** Killer demo: scan → record → alert → dashboard */
export const WORKFLOW_STEPS: WorkflowStep[] = [
	{
		id: "scan",
		label: "QR scanned at gate",
		detail: "Rohan · Class 7B · Gate A",
	},
	{
		id: "record",
		label: "Attendance recorded",
		detail: "Present · 8:17 AM · signed token",
	},
	{
		id: "queue",
		label: "Alert queued",
		detail: "WhatsApp utility template · guardian opt-in",
	},
	{
		id: "notify",
		label: "Parent notified",
		detail: "“Rohan arrived safely at school.”",
	},
	{
		id: "dashboard",
		label: "Dashboard live",
		detail: "247 in · 3 absent · 1 late",
	},
];

export type ChatMessage = {
	role: "user" | "agent";
	text: string;
};

export const AGENT_MESSAGES: ChatMessage[] = [
	{
		role: "user",
		text: "Did Rohan reach school today?",
	},
	{
		role: "agent",
		text: "Yes — marked present at 8:17 AM after a gate scan. You’re all set.",
	},
	{
		role: "agent",
		text: "Homework for maths is due tomorrow. Fee reminder for Q2 goes out Friday.",
	},
];

export type CustomerLogo = {
	name: string;
	icon: IconSvgElement;
};

export const CUSTOMER_LOGOS: CustomerLogo[] = [
	{ name: "WhatsApp", icon: HexagonIcon },
	{ name: "Expo", icon: TriangleIcon },
	{ name: "NestJS", icon: ApertureIcon },
	{ name: "PostgreSQL", icon: Package01Icon },
	{ name: "Stripe", icon: GemIcon },
	{ name: "Razorpay", icon: CommandIcon },
	{ name: "Next.js", icon: OctagonIcon },
	{ name: "OpenAI", icon: CircleIcon },
];

export const PRODUCT_BULLETS: string[] = [
	"QR check-in at the gate — no special hardware, works on any phone",
	"WhatsApp, SMS, email, and push alerts with guardian consent and quiet hours",
	"Principal live dashboard plus parent feed — the safety loop in under five seconds",
];

export type IncidentEvent = {
	title: string;
	detail: string;
	tone: "info" | "ok";
	icon: "activity" | "search" | "pr" | "wrench" | "shield";
};

export const INCIDENT_TIMELINE: IncidentEvent[] = [
	{
		title: "Gate scan",
		detail: "stu_rohan · arrival_scanned · 08:17:04",
		tone: "info",
		icon: "activity",
	},
	{
		title: "Outbox event",
		detail: "attendance.arrival_scanned.v1 → worker",
		tone: "info",
		icon: "search",
	},
	{
		title: "WhatsApp delivery",
		detail: "template: arrival_safe · delivered",
		tone: "info",
		icon: "pr",
	},
	{
		title: "Daily summary",
		detail: "campus counts refreshed · 247 present",
		tone: "info",
		icon: "wrench",
	},
	{
		title: "Parent peace of mind",
		detail: "alert read · 08:17:09",
		tone: "ok",
		icon: "shield",
	},
];

export type ToolCall = {
	name: string;
	status: "done" | "running";
};

export const AGENT_TOOL_CALLS: ToolCall[] = [
	{ name: "attendance.scan", status: "done" },
	{ name: "outbox.enqueue", status: "done" },
	{ name: "whatsapp.send", status: "done" },
];

export type CapabilityCard = {
	title: string;
	description: string;
	span: 2 | 4;
	kind: "reasoning" | "tools" | "memory" | "output" | "approval";
	palette: MeshPalette;
};

export type MeshPalette = "blue" | "teal" | "lime" | "amber";

export const CAPABILITY_CARDS: CapabilityCard[] = [
	{
		title: "Smart Attendance — the hook",
		description:
			"Signed QR tokens, gate scans, absentee auto-notify, and departure alerts. The mundane register becomes a real-time trust signal.",
		span: 4,
		kind: "reasoning",
		palette: "blue",
	},
	{
		title: "Reach parents where they are",
		description:
			"Official WhatsApp Business API, SMS fallback, email, and in-app push — routed by urgency, consent, and quiet hours.",
		span: 2,
		kind: "tools",
		palette: "blue",
	},
	{
		title: "One app, every role",
		description:
			"Expo mobile for teachers, parents, guards, and bus conductors. Web dashboard for principals and admins.",
		span: 2,
		kind: "memory",
		palette: "teal",
	},
	{
		title: "Auditable by design",
		description:
			"Every scan and alert flows through Postgres + outbox — idempotent, tenant-scoped, and traceable.",
		span: 2,
		kind: "output",
		palette: "lime",
	},
	{
		title: "AI assists, humans decide",
		description:
			"Draft report comments, flag early risk, suggest homework — always with policy checks and approval on high-impact actions.",
		span: 2,
		kind: "approval",
		palette: "blue",
	},
];

export type Stat = {
	value: number;
	suffix: string;
	prefix: string;
	label: string;
	display?: string;
	detail?: string;
};

export const STATS: Stat[] = [
	{
		value: 5,
		suffix: "s",
		prefix: "<",
		label: "Scan to parent alert",
		detail: "target p95 delivery",
	},
	{
		value: 97,
		suffix: "%",
		prefix: "",
		label: "WhatsApp open rate",
		detail: "vs. ~25% for parent apps",
	},
	{
		value: 2000,
		suffix: "",
		prefix: "",
		label: "Students per school",
		display: "200–2K",
		detail: "sweet spot for private schools",
	},
	{
		value: 4,
		suffix: "",
		prefix: "",
		label: "Core personas",
		detail: "owner · teacher · parent · student",
	},
];

export type AboutPrinciple = {
	title: string;
	description: string;
	icon: "bridge" | "eye" | "shield";
};

export const ABOUT_PRINCIPLES: AboutPrinciple[] = [
	{
		icon: "bridge",
		title: "Trust first, ERP second",
		description:
			"Every module answers one question: does this help parents feel their child is safe and schools prove it?",
	},
	{
		icon: "eye",
		title: "Mobile-native, WhatsApp-first",
		description:
			"Teachers live on Android phones. Parents live on WhatsApp. We meet them there — not in another inbox.",
	},
	{
		icon: "shield",
		title: "Privacy and audit by default",
		description:
			"Guardian consent, tenant isolation, append-only events, and human approval before AI touches sensitive records.",
	},
];

export type AboutTeamMember = {
	id: string;
	name: string;
	role: string;
	seed: string;
	bio: string;
	tone: "green" | "teal" | "blue" | "amber";
	profileHref: string;
};

export const ABOUT_TEAM: AboutTeamMember[] = [
	{
		id: "priya",
		name: "Priya Nair",
		role: "Product & schools",
		seed: "PriyaNair",
		bio: "Former school admin. Obsessed with the ninety-second demo: scan, alert, dashboard.",
		tone: "green",
		profileHref: "#",
	},
	{
		id: "marcus",
		name: "Marcus Vale",
		role: "Platform engineer",
		seed: "MarcusVale",
		bio: "NestJS spine, outbox workers, WhatsApp pipelines — reliable side effects at school scale.",
		tone: "teal",
		profileHref: "#",
	},
	{
		id: "lena",
		name: "Lena Ortiz",
		role: "Mobile & UX",
		seed: "LenaOrtiz",
		bio: "Expo apps that feel Apple-polished on mid-range Android — zero training required.",
		tone: "blue",
		profileHref: "#",
	},
	{
		id: "theo",
		name: "Theo Park",
		role: "AI & intelligence",
		seed: "TheoPark",
		bio: "Early warnings and draft comments with reason codes — AI that earns trust, not hype.",
		tone: "amber",
		profileHref: "#",
	},
];

export type Testimonial = {
	quote: string;
	name: string;
	role: string;
	seed: string;
};

export const TESTIMONIALS_ROW_ONE: Testimonial[] = [
	{
		quote:
			"Parents stopped calling the office by 10 AM. The WhatsApp arrival alert sold the whole school in one demo.",
		name: "Maya Chen",
		role: "Principal, Greenfield Academy",
		seed: "Maya",
	},
	{
		quote:
			"Attendance used to take twelve minutes per class. Now I scan at the gate and parents know before first period.",
		name: "Diego Santos",
		role: "Class teacher",
		seed: "Diego",
	},
	{
		quote:
			"I finally know my daughter reached school without calling anyone. That one message is worth the fee.",
		name: "Priya Nair",
		role: "Parent",
		seed: "Priya",
	},
];

export const TESTIMONIALS_ROW_TWO: Testimonial[] = [
	{
		quote:
			"The principal dashboard updates live during morning rush. Absentee follow-ups happen automatically.",
		name: "Theo Park",
		role: "School owner",
		seed: "Theo",
	},
	{
		quote:
			"We piloted on one campus, then rolled out to four. Consent tracking and audit logs made compliance easy.",
		name: "Lena Ortiz",
		role: "Operations lead",
		seed: "Lena",
	},
	{
		quote:
			"It's not another ERP we won't use. It's the one thing parents demand and teachers actually finish.",
		name: "Maya Chen",
		role: "Admissions head",
		seed: "MayaTwo",
	},
];

export type TerminalLine = {
	text: string;
	tone: "prompt" | "muted" | "ok" | "info";
};

export const DEPLOY_TERMINAL: TerminalLine[] = [
	{ text: "git clone school-os && bun install", tone: "prompt" },
	{ text: "Monorepo ready — web, mobile, Nest API, docs", tone: "ok" },
	{ text: "bun run dev  # start building Phase 1 attendance", tone: "prompt" },
	{ text: "Docs: /docs/product-vision · /docs/production-roadmap", tone: "ok" },
];

export type PricingTier = {
	services: number | "unlimited";
	monthly: number;
	label: string;
};

/** Student-count tiers aligned with portfolio SaaS pricing. */
export const PRICING_TIERS: PricingTier[] = [
	{ services: 100, monthly: 0, label: "Pilot" },
	{ services: 500, monthly: 75, label: "Standard" },
	{ services: 1000, monthly: 150, label: "Standard Plus" },
	{ services: 2000, monthly: 350, label: "Premium" },
	{ services: "unlimited", monthly: 500, label: "Enterprise" },
];

export const PRICING_FEATURES: string[] = [
	"Smart Attendance with QR check-in and multi-channel alerts",
	"Principal dashboard and parent mobile feed",
	"Secure teacher–parent chat and announcements (Phase 2)",
	"Fee collection via Stripe / Razorpay (Phase 3)",
	"AI report comments and early warnings with human approval",
];

export type WhyCard = {
	id: string;
	title: string;
	description: string;
	palette: MeshPalette;
	kind: "route" | "keys" | "ready";
};

export const WHY_CARDS: WhyCard[] = [
	{
		id: "route",
		title: "Parents feel it in seconds",
		description:
			"Scan at the gate → WhatsApp alert → live dashboard. The emotional loop that drives admissions and retention.",
		palette: "blue",
		kind: "route",
	},
	{
		id: "keys",
		title: "Safe by architecture",
		description:
			"Tenant-scoped data, guardian consent, audit logs, and AI gated by policy — built for schools handling minors.",
		palette: "lime",
		kind: "keys",
	},
	{
		id: "ready",
		title: "Grows without replatforming",
		description:
			"Start with attendance. Add communication, academics, finance, and AI on the same NestJS + Postgres spine.",
		palette: "amber",
		kind: "ready",
	},
];

export type FaqItem = {
	id: string;
	question: string;
	answer: string;
	icon: IconSvgElement;
};

export const FAQ_ITEMS: FaqItem[] = [
	{
		id: "erp",
		question: "Is this another school ERP?",
		answer:
			"No. School OS is a trust and communication engine — starting with attendance and parent alerts, then expanding into homework, fees, and AI-assisted tools without ERP bloat.",
		icon: HexagonIcon,
	},
	{
		id: "whatsapp",
		question: "Do parents need to install an app?",
		answer:
			"WhatsApp alerts work without an app install. The parent app adds homework, fees, and chat for families who want more — but the safety loop runs on the channel they already use.",
		icon: SecurityCheckIcon,
	},
	{
		id: "consent",
		question: "How do WhatsApp messages stay compliant?",
		answer:
			"We use the official WhatsApp Business Cloud API with explicit guardian opt-in, utility templates for transactional alerts, quiet hours, and delivery audit logs.",
		icon: Package01Icon,
	},
	{
		id: "hardware",
		question: "Do we need special hardware for attendance?",
		answer:
			"No. Teachers or guards scan rotating QR codes with any phone. Face recognition stays optional and off by default until consent and legal review.",
		icon: CommandIcon,
	},
	{
		id: "pricing",
		question: "What does the pilot include?",
		answer:
			"Up to 100 students, one school, Smart Attendance and alerts at no cost — enough to run the ninety-second demo with real parents.",
		icon: GemIcon,
	},
	{
		id: "developers",
		question: "Can developers extend the platform?",
		answer:
			"Yes. The open monorepo ships Next.js, Expo, NestJS, Drizzle, and docs. Clone, run bun install && bun run dev, and follow the production roadmap for Phase 1 modules.",
		icon: OctagonIcon,
	},
];

export type FooterColumn = {
	title: string;
	links: NavLink[];
};

export const FOOTER_COLUMNS: FooterColumn[] = [
	{
		title: "Product",
		links: [
			{ label: "Smart Attendance", href: "/#product" },
			{ label: "Modules", href: "/#capabilities" },
			{ label: "Pricing", href: "/pricing" },
		],
	},
	{
		title: "Resources",
		links: [
			{ label: "Product vision", href: "http://localhost:3002/docs/product-vision" },
			{ label: "Roadmap", href: "http://localhost:3002/docs/production-roadmap" },
			{ label: "FAQ", href: "/#faq" },
			{ label: "Developers", href: "/#deploy" },
		],
	},
	{
		title: "Company",
		links: [
			{ label: "About", href: "/about" },
			{ label: "Contact", href: "/about" },
		],
	},
];

export function dicebearUrl(seed: string): string {
	return `https://api.dicebear.com/10.x/glass/svg?seed=${encodeURIComponent(seed)}`;
}
