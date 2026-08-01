export type ReportOverview = {
	tenantId: string;
	sectionId: string | null;
	students: number;
	sections: number;
	subjects: number;
	assessments: number;
	attendance: {
		marked: number;
		present: number;
		rate: number | null;
	};
};

export type GradeDistributionBucket = {
	grade: string;
	count: number;
};

export type GradeSubjectSummary = {
	subjectId: string;
	subjectCode: string;
	subjectName: string;
	entryCount: number;
	studentCount: number;
	averagePercentage: number | null;
	distribution: GradeDistributionBucket[];
};

export type GradeStudentSummary = {
	studentId: string;
	studentName: string;
	studentCode: string;
	entryCount: number;
	averagePercentage: number | null;
	averageGradePoint: number | null;
};

export type GradesReport = {
	sectionId: string;
	term: string | null;
	overallAveragePercentage: number | null;
	subjects: GradeSubjectSummary[];
	students: GradeStudentSummary[];
};

export type AttendanceReport = {
	sectionId: string;
	from: string | null;
	to: string | null;
	sessionCount: number;
	marked: number;
	present: number;
	absent: number;
	late: number;
	excused: number;
	leftEarly: number;
	unknown: number;
	attendanceRate: number | null;
};

export type HomeworkReport = {
	sectionId: string;
	assignmentCount: number;
	submissionCount: number;
	pending: number;
	submitted: number;
	late: number;
	graded: number;
	excused: number;
	submissionRate: number | null;
	gradedRate: number | null;
};
