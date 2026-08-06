export type GradebookTerm = "term1" | "term2" | "term3" | "final";
export type GradebookSource = "assessment" | "homework" | "manual";

export type GradebookCell = {
	grade: string;
	gradePoint: number;
	obtainedMarks: number;
	totalMarks: number;
	percentage: number;
	source: GradebookSource;
};

export type GradebookGridRow = {
	studentId: string;
	studentName: string;
	studentCode: string;
	cells: Record<string, GradebookCell>;
};

export type GradebookSubject = {
	id: string;
	code: string;
	name: string;
};

export type GradebookGrid = {
	sectionId: string;
	term: GradebookTerm;
	subjects: GradebookSubject[];
	rows: GradebookGridRow[];
	averages: Record<string, number | null>;
};

export type StudentReportEntry = {
	subjectId: string;
	subjectCode: string;
	subjectName: string;
	sectionId: string;
	sectionName: string;
	academicYearId: string;
	academicYearName: string;
	term: GradebookTerm;
	obtainedMarks: number;
	totalMarks: number;
	percentage: number;
	grade: string;
	gradePoint: number;
	source: GradebookSource;
};

export type StudentReport = {
	student: {
		id: string;
		name: string;
		studentCode: string;
	};
	entries: StudentReportEntry[];
	averageGradePoint: number | null;
};
