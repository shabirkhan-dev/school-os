export function isoDayOfWeekFromDate(date: string): number {
	const parsed = new Date(`${date}T12:00:00`);
	const day = parsed.getDay();
	return day === 0 ? 7 : day;
}

export function formatTimeValue(value: string): string {
	return value.slice(0, 5);
}

export function addDaysToDate(date: string, days: number): string {
	const parsed = new Date(`${date}T12:00:00`);
	parsed.setDate(parsed.getDate() + days);
	return parsed.toLocaleDateString('en-CA');
}

export function startOfIsoWeek(date: string): string {
	const parsed = new Date(`${date}T12:00:00`);
	const day = isoDayOfWeekFromDate(date);
	parsed.setDate(parsed.getDate() - (day - 1));
	return parsed.toLocaleDateString('en-CA');
}

export const DEFAULT_PERIOD_DEFS = [
	{
		name: 'Period 1',
		startsAt: '08:00:00',
		endsAt: '08:45:00',
		kind: 'period' as const,
		sortOrder: 10,
	},
	{
		name: 'Period 2',
		startsAt: '08:50:00',
		endsAt: '09:35:00',
		kind: 'period' as const,
		sortOrder: 20,
	},
	{
		name: 'Period 3',
		startsAt: '09:40:00',
		endsAt: '10:25:00',
		kind: 'period' as const,
		sortOrder: 30,
	},
	{
		name: 'Break',
		startsAt: '10:25:00',
		endsAt: '10:45:00',
		kind: 'break' as const,
		sortOrder: 40,
	},
	{
		name: 'Period 4',
		startsAt: '10:45:00',
		endsAt: '11:30:00',
		kind: 'period' as const,
		sortOrder: 50,
	},
	{
		name: 'Period 5',
		startsAt: '11:35:00',
		endsAt: '12:20:00',
		kind: 'period' as const,
		sortOrder: 60,
	},
	{
		name: 'Lunch',
		startsAt: '12:20:00',
		endsAt: '13:00:00',
		kind: 'break' as const,
		sortOrder: 70,
	},
	{
		name: 'Period 6',
		startsAt: '13:00:00',
		endsAt: '13:45:00',
		kind: 'period' as const,
		sortOrder: 80,
	},
	{
		name: 'Period 7',
		startsAt: '13:50:00',
		endsAt: '14:35:00',
		kind: 'period' as const,
		sortOrder: 90,
	},
];

export const ROOM_NAMES = [
	'Room 12',
	'Room 5',
	'Lab 2',
	'Room 18',
	'Room 3',
	'Hall A',
	'Room 9',
	'Lab 1',
];
