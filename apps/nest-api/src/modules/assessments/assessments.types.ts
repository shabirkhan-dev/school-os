import type { AssessmentRecord, AssessmentResultRecord } from '@/database/schema';

export type PublicAssessment = {
	id: string;
	sectionSubjectId: string;
	sectionId: string;
	sectionName: string;
	subjectId: string;
	subjectCode: string;
	subjectName: string;
	type: AssessmentRecord['type'];
	title: string;
	assessedOn: string;
	maxScore: number;
	status: AssessmentRecord['status'];
	assignMode: AssessmentRecord['assignMode'];
	startsAt: string | null;
	durationMinutes: number | null;
	room: string | null;
	instructions: string | null;
	recipientCount: number;
	createdByMembershipId: string;
	createdAt: string;
	updatedAt: string;
};

export type PublicAssessmentResult = {
	id: string | null;
	studentId: string;
	studentName: string;
	studentCode: string;
	score: number | null;
	status: AssessmentResultRecord['status'];
};

export type PublicAssessmentDetail = PublicAssessment & {
	recipientStudentIds: string[];
	results: PublicAssessmentResult[];
	summary: {
		graded: number;
		pending: number;
		absent: number;
		total: number;
		averageScore: number | null;
	};
};

export function toPublicAssessment(
	record: AssessmentRecord,
	context: {
		sectionId: string;
		sectionName: string;
		subjectId: string;
		subjectCode: string;
		subjectName: string;
		recipientCount?: number;
	},
): PublicAssessment {
	return {
		id: record.id,
		sectionSubjectId: record.sectionSubjectId,
		sectionId: context.sectionId,
		sectionName: context.sectionName,
		subjectId: context.subjectId,
		subjectCode: context.subjectCode,
		subjectName: context.subjectName,
		type: record.type,
		title: record.title,
		assessedOn: record.assessedOn,
		maxScore: Number(record.maxScore),
		status: record.status,
		assignMode: record.assignMode,
		startsAt: record.startsAt?.toISOString() ?? null,
		durationMinutes: record.durationMinutes,
		room: record.room,
		instructions: record.instructions,
		recipientCount: context.recipientCount ?? 0,
		createdByMembershipId: record.createdByMembershipId,
		createdAt: record.createdAt.toISOString(),
		updatedAt: record.updatedAt.toISOString(),
	};
}

export function computeAssessmentSummary(
	results: PublicAssessmentResult[],
	_maxScore: number,
): PublicAssessmentDetail['summary'] {
	let graded = 0;
	let pending = 0;
	let absent = 0;
	let scoreSum = 0;
	let scoreCount = 0;

	for (const result of results) {
		if (result.status === 'graded') {
			graded += 1;
			if (result.score !== null) {
				scoreSum += result.score;
				scoreCount += 1;
			}
		} else if (result.status === 'absent') {
			absent += 1;
		} else {
			pending += 1;
		}
	}

	return {
		graded,
		pending,
		absent,
		total: results.length,
		averageScore: scoreCount > 0 ? Math.round((scoreSum / scoreCount) * 100) / 100 : null,
	};
}
