import { describe, expect, it } from 'vitest';

import { findConsecutiveAbsenceAlerts, subtractWeekdays } from './teacher-attendance-alerts';

describe('teacher-attendance-alerts', () => {
	it('subtractWeekdays skips weekends', () => {
		expect(subtractWeekdays('2026-07-24', 5)).toBe('2026-07-17');
	});

	it('flags students absent three or more days in a row', () => {
		const alerts = findConsecutiveAbsenceAlerts([
			{
				studentId: 's1',
				status: 'absent',
				sessionDate: '2026-07-24',
				sectionId: 'sec1',
				sectionName: 'A',
				className: 'Grade 7',
				firstName: 'Ali',
				lastName: 'Khan',
			},
			{
				studentId: 's1',
				status: 'absent',
				sessionDate: '2026-07-23',
				sectionId: 'sec1',
				sectionName: 'A',
				className: 'Grade 7',
				firstName: 'Ali',
				lastName: 'Khan',
			},
			{
				studentId: 's1',
				status: 'absent',
				sessionDate: '2026-07-22',
				sectionId: 'sec1',
				sectionName: 'A',
				className: 'Grade 7',
				firstName: 'Ali',
				lastName: 'Khan',
			},
			{
				studentId: 's2',
				status: 'present',
				sessionDate: '2026-07-24',
				sectionId: 'sec1',
				sectionName: 'A',
				className: 'Grade 7',
				firstName: 'Sara',
				lastName: 'Ahmed',
			},
		]);

		expect(alerts).toHaveLength(1);
		expect(alerts[0]?.studentName).toBe('Ali Khan');
		expect(alerts[0]?.consecutiveDays).toBe(3);
	});

	it('ignores streaks broken by present marks', () => {
		const alerts = findConsecutiveAbsenceAlerts([
			{
				studentId: 's1',
				status: 'absent',
				sessionDate: '2026-07-24',
				sectionId: 'sec1',
				sectionName: 'A',
				className: 'Grade 7',
				firstName: 'Ali',
				lastName: 'Khan',
			},
			{
				studentId: 's1',
				status: 'present',
				sessionDate: '2026-07-23',
				sectionId: 'sec1',
				sectionName: 'A',
				className: 'Grade 7',
				firstName: 'Ali',
				lastName: 'Khan',
			},
		]);

		expect(alerts).toHaveLength(0);
	});
});
