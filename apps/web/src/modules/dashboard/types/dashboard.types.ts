export type DashboardTrend = "up" | "down" | "flat";

export type AdmissionStatus = "enrolled" | "pending" | "waitlisted";
export type AdmissionSource = "portal" | "walk-in" | "referral" | "transfer";

export type DashboardAdmission = {
	id: string;
	student: string;
	email: string;
	grade: string;
	campus: string;
	guardian: string;
	guardianRelation: string;
	guardianPhone: string;
	date: string;
	status: AdmissionStatus;
	source: AdmissionSource;
	note: string;
};

export type DashboardGradeRow = {
	grade: number;
	label: string;
	students: number;
};

export type DashboardMonthEnrollment = {
	month: string;
	newAdmissions: number;
	returning: number;
	total: number;
};

export type DashboardStatCard = {
	id: string;
	label: string;
	value: number;
	formatValue: (n: number) => string;
	detail: string;
	trend: DashboardTrend;
	trendDelta: string;
	trendLabel: string;
	bars: number[];
	activeIndex: number;
	unavailable?: boolean;
};

export type DashboardOpsPulseItem = {
	id: string;
	label: string;
	value: string;
	hint: string;
};

export type DashboardMetrics = {
	stats: DashboardStatCard[];
	opsPulse: DashboardOpsPulseItem[];
	gradeRows: DashboardGradeRow[];
	enrollmentMonths: DashboardMonthEnrollment[];
	recentAdmissions: DashboardAdmission[];
	admissionSummary: {
		total: number;
		pending: number;
		waitlisted: number;
		enrolled: number;
	};
	insights: {
		totalStudents: number;
		newThisMonth: number;
		activeYearLabel: string;
		campusCount: number;
		sectionCount: number;
		avgPerGrade: number;
		gradeSpread: number;
		enrolledThisTerm: number;
		peakGradeLabel: string;
		softestGradeLabel: string;
		updatedAt: string;
	};
};
