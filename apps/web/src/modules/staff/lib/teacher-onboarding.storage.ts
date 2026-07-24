export type TeacherPlanStyle = "brief" | "detailed" | "resources";

export type TeacherNotificationPref = "digest" | "important" | "all";

export type TeacherOnboardingPrefs = {
	completedAt: string;
	planStyle: TeacherPlanStyle;
	notifications: TeacherNotificationPref;
	quietHours: boolean;
};

const STORAGE_KEY = "school-os.teacher-onboarding-v1";

export function readTeacherOnboarding(): TeacherOnboardingPrefs | null {
	if (typeof window === "undefined") return null;
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		return JSON.parse(raw) as TeacherOnboardingPrefs;
	} catch {
		return null;
	}
}

export function writeTeacherOnboarding(prefs: TeacherOnboardingPrefs): void {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function isTeacherOnboardingComplete(): boolean {
	return Boolean(readTeacherOnboarding()?.completedAt);
}
