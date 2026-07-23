import { describe, expect, it } from 'vitest';

import {
	addDaysToDate,
	formatTimeValue,
	isoDayOfWeekFromDate,
	startOfIsoWeek,
} from './timetable.utils';

describe('timetable.utils', () => {
	it('maps Sunday to ISO day 7', () => {
		expect(isoDayOfWeekFromDate('2026-07-26')).toBe(7);
	});

	it('maps Monday to ISO day 1', () => {
		expect(isoDayOfWeekFromDate('2026-07-27')).toBe(1);
	});

	it('returns Monday as week start', () => {
		expect(startOfIsoWeek('2026-07-24')).toBe('2026-07-20');
	});

	it('adds days in en-CA format', () => {
		expect(addDaysToDate('2026-07-20', 2)).toBe('2026-07-22');
	});

	it('formats postgres time strings', () => {
		expect(formatTimeValue('08:00:00')).toBe('08:00');
	});
});
