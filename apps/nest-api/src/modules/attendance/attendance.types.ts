import type { AttendanceMarkRecord, AttendanceSessionRecord } from '@/database/schema';

export type PublicAttendanceSession = {
	id: string;
	tenantId: string;
	campusId: string;
	sectionId: string | null;
	sessionType: AttendanceSessionRecord['sessionType'];
	sessionDate: string;
	startsAt: string | null;
	endsAt: string | null;
	createdAt: string;
	updatedAt: string;
};

export type PublicAttendanceMark = {
	id: string;
	tenantId: string;
	sessionId: string;
	studentId: string;
	status: AttendanceMarkRecord['status'];
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

export function toPublicSession(session: AttendanceSessionRecord): PublicAttendanceSession {
	return {
		id: session.id,
		tenantId: session.tenantId,
		campusId: session.campusId,
		sectionId: session.sectionId,
		sessionType: session.sessionType,
		sessionDate: session.sessionDate,
		startsAt: session.startsAt?.toISOString() ?? null,
		endsAt: session.endsAt?.toISOString() ?? null,
		createdAt: session.createdAt.toISOString(),
		updatedAt: session.updatedAt.toISOString(),
	};
}

export function toPublicMark(mark: AttendanceMarkRecord): PublicAttendanceMark {
	return {
		id: mark.id,
		tenantId: mark.tenantId,
		sessionId: mark.sessionId,
		studentId: mark.studentId,
		status: mark.status,
		markedAt: mark.markedAt?.toISOString() ?? null,
		markedByMembershipId: mark.markedByMembershipId,
		createdAt: mark.createdAt.toISOString(),
		updatedAt: mark.updatedAt.toISOString(),
	};
}

export function countMarksByStatus(marks: AttendanceMarkRecord[]): AttendanceStatusCounts {
	const counts: AttendanceStatusCounts = {
		present: 0,
		absent: 0,
		late: 0,
		excused: 0,
		leftEarly: 0,
		unknown: 0,
		total: marks.length,
	};

	for (const mark of marks) {
		switch (mark.status) {
			case 'present':
				counts.present += 1;
				break;
			case 'absent':
				counts.absent += 1;
				break;
			case 'late':
				counts.late += 1;
				break;
			case 'excused':
				counts.excused += 1;
				break;
			case 'left_early':
				counts.leftEarly += 1;
				break;
			default:
				counts.unknown += 1;
		}
	}

	return counts;
}

export function countMarksByStatusRows(
	rows: ReadonlyArray<{ status: AttendanceMarkRecord['status']; count: number }>,
): AttendanceStatusCounts {
	const counts: AttendanceStatusCounts = {
		present: 0,
		absent: 0,
		late: 0,
		excused: 0,
		leftEarly: 0,
		unknown: 0,
		total: 0,
	};

	for (const row of rows) {
		counts.total += row.count;
		switch (row.status) {
			case 'present':
				counts.present += row.count;
				break;
			case 'absent':
				counts.absent += row.count;
				break;
			case 'late':
				counts.late += row.count;
				break;
			case 'excused':
				counts.excused += row.count;
				break;
			case 'left_early':
				counts.leftEarly += row.count;
				break;
			default:
				counts.unknown += row.count;
		}
	}

	return counts;
}
