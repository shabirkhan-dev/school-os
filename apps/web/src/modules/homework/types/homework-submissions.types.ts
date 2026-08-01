export type HomeworkSubmissionStatus = "pending" | "submitted" | "late" | "graded" | "excused";

export type HomeworkSubmission = {
	id: string;
	tenantId: string;
	homeworkId: string;
	studentId: string;
	status: HomeworkSubmissionStatus;
	submittedAt: string | null;
	grade: string | null;
	marksObtained: number | null;
	totalMarks: number | null;
	feedback: string | null;
	attachmentUrl: string | null;
	gradedBy: string | null;
	gradedAt: string | null;
	createdAt: string;
	updatedAt: string;
	studentName: string;
	studentCode: string;
};

export type HomeworkSubmissionSummary = {
	total: number;
	submitted: number;
	late: number;
	graded: number;
	pending: number;
	excused: number;
};

export type HomeworkSubmissionsResponse = {
	submissions: HomeworkSubmission[];
	summary: HomeworkSubmissionSummary;
};

export type SubmissionUpdateItem = {
	studentId: string;
	status: HomeworkSubmissionStatus;
	grade?: string | null;
	marksObtained?: number | null;
	totalMarks?: number | null;
	feedback?: string | null;
};

export type BulkUpdateSubmissionsInput = {
	submissions: SubmissionUpdateItem[];
};
