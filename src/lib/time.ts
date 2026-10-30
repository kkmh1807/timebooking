import { studio } from './studio';

export const TIMEZONE = studio.timezone;
export const DURATIONS = [45, 60, 90] as const;
export type DurationMinutes = (typeof DURATIONS)[number];

const dateFormatter = new Intl.DateTimeFormat('nb-NO', {
	timeZone: TIMEZONE,
	weekday: 'long',
	day: 'numeric',
	month: 'long'
});

const monthFormatter = new Intl.DateTimeFormat('nb-NO', {
	timeZone: TIMEZONE,
	month: 'long',
	year: 'numeric'
});

const weekdayFormatter = new Intl.DateTimeFormat('nb-NO', {
	timeZone: TIMEZONE,
	weekday: 'long',
	day: 'numeric'
});

const timeFormatter = new Intl.DateTimeFormat('nb-NO', {
	timeZone: TIMEZONE,
	hour: '2-digit',
	minute: '2-digit',
	hourCycle: 'h23'
});

const dayKeyFormatter = new Intl.DateTimeFormat('en-CA', {
	timeZone: TIMEZONE,
	year: 'numeric',
	month: '2-digit',
	day: '2-digit'
});

const priceFormatter = new Intl.NumberFormat('nb-NO');

export function formatPrice(kr: number) {
	return `kr ${priceFormatter.format(kr)}`;
}

export function parsePrice(value: string) {
	const digits = value.trim().replace(/\s/g, '');
	if (!/^\d+$/.test(digits)) return null;
	const price = Number(digits);
	if (price < 1 || price > 100_000) return null;
	return price;
}

export function isDuration(value: number): value is DurationMinutes {
	return (DURATIONS as readonly number[]).includes(value);
}

export function isDateKey(value: string) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
	const [year, month, day] = value.split('-').map(Number);
	const date = new Date(Date.UTC(year, month - 1, day));
	return (
		date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
	);
}

export function isTime(value: string) {
	return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function osloDayKey(date: Date) {
	return dayKeyFormatter.format(date);
}

export function nextDateKey(dayKey: string) {
	const [year, month, day] = dayKey.split('-').map(Number);
	const next = new Date(Date.UTC(year, month - 1, day + 1));
	const monthText = String(next.getUTCMonth() + 1).padStart(2, '0');
	const dayText = String(next.getUTCDate()).padStart(2, '0');
	return `${next.getUTCFullYear()}-${monthText}-${dayText}`;
}

export function zonedTimeToUtc(date: string, time: string) {
	const [year, month, day] = date.split('-').map(Number);
	const [hour, minute] = time.split(':').map(Number);
	let utc = Date.UTC(year, month - 1, day, hour, minute, 0);
	const firstOffset = timeZoneOffset(utc);
	utc -= firstOffset;
	const secondOffset = timeZoneOffset(utc);
	if (secondOffset !== firstOffset)
		utc = Date.UTC(year, month - 1, day, hour, minute, 0) - secondOffset;
	return new Date(utc);
}

export function osloDayBounds(dayKey: string) {
	return {
		start: zonedTimeToUtc(dayKey, '00:00'),
		end: zonedTimeToUtc(nextDateKey(dayKey), '00:00')
	};
}

export function startOfOsloDay(date = new Date()) {
	return zonedTimeToUtc(osloDayKey(date), '00:00');
}

function capitalizeNb(value: string) {
	return value.charAt(0).toLocaleUpperCase('nb-NO') + value.slice(1);
}

export function formatOsloDate(date: Date) {
	return capitalizeNb(dateFormatter.format(date));
}

export function formatOsloMonth(date: Date) {
	return capitalizeNb(monthFormatter.format(date));
}

export function formatOsloWeekday(date: Date) {
	return capitalizeNb(weekdayFormatter.format(date));
}

export function formatOsloTime(date: Date) {
	return timeFormatter.format(date);
}

export function formatOsloDateTime(date: Date) {
	return `${formatOsloDate(date)} kl. ${formatOsloTime(date)}`;
}

export function formatInterval(startsAt: Date, endsAt: Date) {
	return `${formatOsloTime(startsAt)}–${formatOsloTime(endsAt)}`;
}

export function formatDuration(startsAt: Date, endsAt: Date) {
	const minutes = Math.round((endsAt.getTime() - startsAt.getTime()) / 60_000);
	return `${minutes} min`;
}

export const MAX_CLASSES = 10;

export function nextClock(time: string, durationMinutes: number) {
	const total = clockMinutes(time) + durationMinutes;
	const hour = Math.floor(total / 60) % 24;
	const minute = total % 60;
	return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function formatClockSpan(start: string, durationMinutes: number) {
	const total = clockMinutes(start) + durationMinutes;
	const endHour = Math.floor(total / 60);
	const endMinute = total % 60;
	return `${start}–${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
}

export function hasClockOverlap(starts: string[], durationMinutes: number) {
	const ranges = starts.map((start) => {
		const begin = clockMinutes(start);
		return { begin, end: begin + durationMinutes };
	});
	ranges.sort((a, b) => a.begin - b.begin);
	for (let index = 1; index < ranges.length; index++) {
		if (ranges[index].begin < ranges[index - 1].end) return true;
	}
	return false;
}

export function slotsAt(date: string, starts: string[], durationMinutes: number) {
	if (
		!isDateKey(date) ||
		!isDuration(durationMinutes) ||
		starts.length < 1 ||
		starts.length > MAX_CLASSES ||
		starts.some((start) => !isTime(start))
	) {
		return null;
	}

	const step = durationMinutes * 60_000;
	return starts.map((start) => {
		const begins = zonedTimeToUtc(date, start).getTime();
		return { startsAt: new Date(begins), endsAt: new Date(begins + step) };
	});
}

function clockMinutes(time: string) {
	const [hour, minute] = time.split(':').map(Number);
	return hour * 60 + minute;
}

function timeZoneOffset(utcMs: number) {
	const parts = new Intl.DateTimeFormat('en-US', {
		timeZone: TIMEZONE,
		hourCycle: 'h23',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit'
	}).formatToParts(new Date(utcMs));
	const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
	const asUtc = Date.UTC(+map.year, +map.month - 1, +map.day, +map.hour, +map.minute, +map.second);
	return asUtc - utcMs;
}
