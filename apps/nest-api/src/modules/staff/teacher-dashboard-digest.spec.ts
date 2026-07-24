import { describe, expect, it } from 'vitest';

import type { PublicTeacherDaySchedule } from '@/modules/timetable/timetable.types';

import { findUpcomingClassPeriod, parseTimeToMinutes } from './teacher-dashboard-digest';

describe('teacher-dashboard-digest', () => {
	it('parseTimeToMinutes converts HH:mm', () => {
		expect(parseTimeToMinutes('08:30')).toBe(510);
		expect(parseTimeToMinutes('13:05')).toBe(785);
	});

	it('findUpcomingClassPeriod returns the current or next class', () => {
		const schedule: PublicTeacherDaySchedule = {
			date: '2026-07-24',
			dayOfWeek: 4,
			classCount: 2,
			slots: [
				{
					type: 'class',
					period: {
						id: 'p1',
						name: 'Period 1',
						startsAt: '08:00',
						endsAt: '08:45',
						kind: 'period',
						sortOrder: 1,
					},
					sectionId: 'section-a',
					sectionName: 'A',
					classId: 'class-7',
					subjectId: 'sub-math',
					subjectName: 'Mathematics',
					subjectCode: 'MATH',
					roomName: '101',
				},
				{
					type: 'class',
					period: {
						id: 'p2',
						name: 'Period 2',
						startsAt: '09:00',
						endsAt: '09:45',
						kind: 'period',
						sortOrder: 2,
					},
					sectionId: 'section-b',
					sectionName: 'B',
					classId: 'class-8',
					subjectId: 'sub-eng',
					subjectName: 'English',
					subjectCode: 'ENG',
					roomName: '102',
				},
			],
		};

		const now = new Date('2026-07-24T08:50:00');
		const upcoming = findUpcomingClassPeriod(schedule, '2026-07-24', now);

		expect(upcoming?.periodName).toBe('Period 2');
		expect(upcoming?.subjectCode).toBe('ENG');
	});
});
