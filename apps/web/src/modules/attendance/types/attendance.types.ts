export type AttendanceMarkStatus =
	| "present"
	| "absent"
	| "late"
	| "excused"
	| "left_early"
	| "unknown";

export type AttendanceSession = {
	id: string;
	tenantId: string;
	campusId: string;
	sectionId: string | null;
	sessionType: "class" | "gate" | "bus";
	sessionDate: string;
	startsAt: string | null;
	endsAt: string | null;
	createdAt: string;
	updatedAt: string;
};

export type AttendanceMark = {
	id: string;
	tenantId: string;
	sessionId: string;
	studentId: string;
	status: AttendanceMarkStatus;
	markedAt: string | null;
	markedByMembershipId: string | null;
	createdAt: string;
	updatedAt: string;
};

export type AttendanceStatusCounts = {
	present: number;
	absent: number;
	late: number;
	excused: number;
	leftEarly: number;
	unknown: number;
	total: number;
};

export type AttendanceSessionView = {
	session: AttendanceSession;
	marks: AttendanceMark[];
	summary: AttendanceStatusCounts;
};

export type CreateAttendanceSessionInput = {
	sectionId: string;
	sessionDate: string;
	sessionType?: "class" | "gate" | "bus";
};

export type MarkAttendanceInput = {
	marks: Array<{ studentId: string; status: AttendanceMarkStatus }>;
};

export type ConfirmAllPresentInput = {
	exceptStudentIds?: string[];
};

export type StudentAttendanceHistoryEntry = {
	mark: AttendanceMark;
	session: AttendanceSession;
};
