import type { PageServerLoad } from './$types';
import { countOpenSlots, listBookingsFrom } from '#lib/server/booking';
import { osloDayKey, startOfOsloDay } from '#lib/time';

export const load: PageServerLoad = async () => {
	const todayKey = osloDayKey(new Date());
	const rows = await listBookingsFrom(startOfOsloDay());
	const confirmed = rows.filter((row) => row.booking.status === 'confirmed');
	return {
		today: confirmed.filter((row) => osloDayKey(row.slot.startsAt) === todayKey),
		later: confirmed.filter((row) => osloDayKey(row.slot.startsAt) > todayKey).slice(0, 5),
		openSlots: await countOpenSlots()
	};
};
