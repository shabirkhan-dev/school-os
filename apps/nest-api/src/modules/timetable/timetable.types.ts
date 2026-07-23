export type PublicTimetablePeriod = {
	id: string;
	name: string;
	startsAt: string;
	endsAt: string;
	kind: 'period' | 'break';
	sortOrder: number;
};

export type PublicTimetableClassSlot = {
	type: 'class';
	period: PublicTimetablePeriod;
	sectionId: string;
	sectionName: string;
	classId: string;
	subjectId: string | null;
	subjectName: string | null;
	subjectCode: string | null;
	roomName: string | null;
};

export type PublicTimetableBreakSlot = {
	type: 'break';
	period: PublicTimetablePeriod;
};

export type PublicTimetableFreeSlot = {
	type: 'free';
	period: PublicTimetablePeriod;
};

export type PublicTimetableSlot =
	| PublicTimetableClassSlot
	| PublicTimetableBreakSlot
	| PublicTimetableFreeSlot;

export type PublicTeacherDaySchedule = {
	date: string;
	dayOfWeek: number;
	slots: PublicTimetableSlot[];
	classCount: number;
};

export type PublicTeacherWeekSchedule = {
	weekStart: string;
	days: PublicTeacherDaySchedule[];
};
