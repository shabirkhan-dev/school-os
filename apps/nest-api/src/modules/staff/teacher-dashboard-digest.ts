import type {
	PublicTeacherDaySchedule,
	PublicTimetableClassSlot,
} from '@/modules/timetable/timetable.types';

export type PublicTeacherDashboardUpcomingPeriod = {
	periodName: string;
	startsAt: string;
	endsAt: string;
	sectionId: string;
	sectionName: string;
	subjectName: string | null;
	subjectCode: string | null;
	roomName: string | null;
};

export function parseTimeToMinutes(time: string): number {
	const [hours, minutes] = time.split(':').map((part) => Number.parseInt(part, 10));
	if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return 0;
	return hours * 60 + minutes;
}

export function findUpcomingClassPeriod(
	schedule: PublicTeacherDaySchedule | null,
	sessionDate: string,
	now: Date = new Date(),
): PublicTeacherDashboardUpcomingPeriod | null {
	if (!schedule) return null;

	const isSessionToday = sessionDate === now.toLocaleDateString('en-CA');
	const nowMinutes = isSessionToday ? now.getHours() * 60 + now.getMinutes() : 0;

	for (const slot of schedule.slots) {
		if (slot.type !== 'class') continue;

		const classSlot = slot as PublicTimetableClassSlot;
		const endMinutes = parseTimeToMinutes(classSlot.period.endsAt);
		if (!isSessionToday || endMinutes > nowMinutes) {
			return {
				periodName: classSlot.period.name,
				startsAt: classSlot.period.startsAt,
				endsAt: classSlot.period.endsAt,
				sectionId: classSlot.sectionId,
				sectionName: classSlot.sectionName,
				subjectName: classSlot.subjectName,
				subjectCode: classSlot.subjectCode,
				roomName: classSlot.roomName,
			};
		}
	}

	return null;
}
