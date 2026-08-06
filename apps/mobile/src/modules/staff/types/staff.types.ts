export type TeacherSubjectAssignment = {
	id: string;
	sectionId: string;
	sectionName: string;
	subjectId: string;
	subjectCode: string;
	subjectName: string;
};

export type TeacherDetail = {
	teacher: {
		id: string;
		membershipId: string;
		userId: string;
		email: string;
		username: string;
		role: string;
		campusId: string | null;
		status: string | null;
		profile: {
			id: string | null;
			employeeCode: string | null;
			phone: string | null;
			qualification: string | null;
			specialization: string | null;
		} | null;
		homeroomSectionCount: number;
		subjectAssignmentCount: number;
	};
	homeroomSections: Array<{
		id: string;
		name: string;
		campusId: string;
		classId: string;
		academicYearId: string;
	}>;
	subjectAssignments: TeacherSubjectAssignment[];
	accessibleSections: TeacherAccessibleSection[];
};

export type TeacherDashboardAttendanceSummary = {
	present: number;
	absent: number;
	late: number;
	excused: number;
	leftEarly: number;
	unknown: number;
	total: number;
	attendanceRate: number | null;
};

export type TeacherAccessibleSection = {
	id: string;
	name: string;
	campusId: string;
	classId: string;
	academicYearId: string;
	accessType: "homeroom" | "subject";
	subjectId: string | null;
	subjectName: string | null;
	subjectCode: string | null;
};

export type TeacherDashboardSection = {
	section: TeacherAccessibleSection;
	studentCount: number;
	todayAttendance: {
		sessionId: string | null;
		isComplete: boolean;
		summary: TeacherDashboardAttendanceSummary | null;
	};
};

export type TeacherDashboardPriorityAction = {
	type: "mark_attendance" | "review_absences";
	sectionId: string;
	label: string;
	reason: string;
};

export type TeacherDashboardAlert = {
	type: "consecutive_absence";
	studentId: string;
	studentName: string;
	sectionId: string;
	sectionLabel: string;
	consecutiveDays: number;
};

export type TeacherDashboardUpcomingPeriod = {
	periodName: string;
	startsAt: string;
	endsAt: string;
	sectionId: string;
	sectionName: string;
	subjectName: string | null;
	subjectCode: string | null;
	roomName: string | null;
};

export type TeacherDashboardYesterdaySection = {
	sectionId: string;
	sectionName: string;
	classId: string;
};

export type TeacherDashboardMorningDigest = {
	draftHomeworkCount: number;
	dueTodayHomeworkCount: number;
	upcomingPeriod: TeacherDashboardUpcomingPeriod | null;
	yesterdayUnmarkedSections: TeacherDashboardYesterdaySection[];
};

export type TeacherDashboard = {
	sessionDate: string;
	teacher: {
		membershipId: string;
		userId: string;
		email: string;
		username: string;
		role: string;
		campusId: string | null;
		profile: {
			id: string | null;
			employeeCode: string | null;
			phone: string | null;
			qualification: string | null;
			specialization: string | null;
		};
		homeroomSectionCount: number;
		subjectAssignmentCount: number;
	};
	stats: {
		totalClasses: number;
		homeroomCount: number;
		subjectCount: number;
		totalStudents: number;
		pendingAttendanceCount: number;
		todayPresent: number;
		todayAbsent: number;
		todayLate: number;
		todayAttendanceRate: number | null;
		todayPeriodCount: number;
		alertCount: number;
		pendingTaskCount: number;
	};
	sections: TeacherDashboardSection[];
	priorityActions: TeacherDashboardPriorityAction[];
	alerts: TeacherDashboardAlert[];
	morningDigest: TeacherDashboardMorningDigest;
};

export type TeacherSectionStudent = {
	student: {
		id: string;
		studentCode: string;
		firstName: string;
		lastName: string;
		fullName: string;
		email: string | null;
		phone: string | null;
		photoUrl: string | null;
		status: string;
	};
	enrollment: {
		id: string;
		sectionId: string;
		status: string;
		rollNumber?: string | null;
	};
};
