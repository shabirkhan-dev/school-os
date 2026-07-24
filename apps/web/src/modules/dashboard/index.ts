export { AdminDashboard } from "./components/admin-dashboard";
export { AdminHomePage } from "./components/admin-home-page";
export { PrincipalDashboard } from "./components/principal-dashboard";
export { PrincipalSchoolPulse } from "./components/principal-school-pulse";
export { StudentDashboard } from "./components/student-dashboard";
export { TeacherDashboard } from "./components/teacher-dashboard";
export { useDashboardMetricsQuery } from "./hooks/use-dashboard-queries";
export { useDashboardI18n, useDashboardT } from "./i18n/dashboard-i18n-provider";
export { DashboardI18nShell } from "./i18n/dashboard-i18n-shell";
export { DashboardLocaleSwitcher } from "./i18n/dashboard-locale-switcher";
export type {
	AdmissionSource,
	AdmissionStatus,
	DashboardAdmission,
	DashboardGradeRow,
	DashboardMetrics,
	DashboardMonthEnrollment,
	DashboardOpsPulseItem,
	DashboardStatCard,
	DashboardTrend,
} from "./types/dashboard.types";
