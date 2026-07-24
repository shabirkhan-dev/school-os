export type HomeworkStatus = "draft" | "published" | "closed";
export type AssignMode = "whole_class" | "selected_students";

export type HomeworkAssignment = {
	id: string;
	sectionSubjectId: string;
	sectionId: string;
	sectionName: string;
	subjectId: string;
	subjectCode: string;
	subjectName: string;
	title: string;
	description: string | null;
	dueAt: string | null;
	status: HomeworkStatus;
	assignMode: AssignMode;
	estimatedMinutes: number | null;
	materials: string | null;
	recipientCount: number;
	createdByMembershipId: string;
	createdAt: string;
	updatedAt: string;
};

export type HomeworkRosterStudent = {
	studentId: string;
	studentName: string;
	studentCode: string;
	isAssigned: boolean;
};

export type HomeworkDetail = HomeworkAssignment & {
	recipientStudentIds: string[];
	rosterStudents: HomeworkRosterStudent[];
};

export type CreateHomeworkInput = {
	sectionSubjectId: string;
	title: string;
	description?: string;
	dueAt?: string;
	status?: HomeworkStatus;
	assignMode?: AssignMode;
	studentIds?: string[];
	estimatedMinutes?: number;
	materials?: string;
};

export type UpdateHomeworkInput = {
	title?: string;
	description?: string | null;
	dueAt?: string | null;
	status?: HomeworkStatus;
	assignMode?: AssignMode;
	studentIds?: string[];
	estimatedMinutes?: number | null;
	materials?: string | null;
};
