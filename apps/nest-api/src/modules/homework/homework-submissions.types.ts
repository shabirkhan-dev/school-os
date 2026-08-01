import type { HomeworkSubmissionRecord } from '@/database/schema';
import type { HomeworkSubmissionStatus } from './homework-submissions.dto';

export type PublicHomeworkSubmission = {
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
};

export type PublicHomeworkSubmissionWithStudent = PublicHomeworkSubmission & {
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

export function toPublicHomeworkSubmission(
	record: HomeworkSubmissionRecord,
): PublicHomeworkSubmission {
	return {
		id: record.id,
		tenantId: record.tenantId,
		homeworkId: record.homeworkId,
		studentId: record.studentId,
		status: record.status,
		submittedAt: record.submittedAt?.toISOString() ?? null,
		grade: record.grade,
		marksObtained: record.marksObtained === null ? null : Number(record.marksObtained),
		totalMarks: record.totalMarks === null ? null : Number(record.totalMarks),
		feedback: record.feedback,
		attachmentUrl: record.attachmentUrl,
		gradedBy: record.gradedBy,
		gradedAt: record.gradedAt?.toISOString() ?? null,
		createdAt: record.createdAt.toISOString(),
		updatedAt: record.updatedAt.toISOString(),
	};
}
