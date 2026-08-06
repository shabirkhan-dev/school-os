export const AppColors = {
	background: "#F8FAFC",
	surface: "#FFFFFF",
	card: {
		background: "#FFFFFF",
		border: "#E2E8F0",
		subtle: "#F1F5F9",
	},
	text: {
		primary: "#0F172A",
		secondary: "#475569",
		muted: "#94A3B8",
		inverse: "#FFFFFF",
	},
	primary: {
		main: "#0F172A",
		foreground: "#FFFFFF",
		brand: "#2563EB",
		subtle: "#EFF6FF",
	},
	status: {
		present: "#16A34A",
		presentBg: "#DCFCE7",
		absent: "#DC2626",
		absentBg: "#FEE2E2",
		late: "#D97706",
		lateBg: "#FEF3C7",
		excused: "#2563EB",
		excusedBg: "#DBEAFE",
		pending: "#64748B",
		pendingBg: "#F1F5F9",
	},
	accent: {
		blue: "#2563EB",
		green: "#16A34A",
		amber: "#D97706",
		red: "#DC2626",
		purple: "#7C3AED",
		cyan: "#0891B2",
		gray: "#64748B",
	},
};

export const NeonColors = {
	background: AppColors.background,
	surface: AppColors.surface,
	card: {
		gradient: [AppColors.card.background, AppColors.card.subtle] as const,
		border: AppColors.card.border,
	},
	text: {
		primary: AppColors.text.primary,
		secondary: AppColors.text.secondary,
		muted: AppColors.text.muted,
	},
	accent: {
		green: AppColors.status.present,
		orange: AppColors.status.late,
		blue: AppColors.primary.brand,
		red: AppColors.status.absent,
		purple: AppColors.accent.purple,
		yellow: AppColors.status.late,
		cyan: AppColors.accent.cyan,
		pink: "#E11D48",
		teal: "#0D9488",
	},
};

export const AppShadows = {
	sm: {
		shadowColor: "#0F172A",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 2,
		elevation: 1,
	},
	md: {
		shadowColor: "#0F172A",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.08,
		shadowRadius: 6,
		elevation: 3,
	},
};

export const NeonShadows = AppShadows;
