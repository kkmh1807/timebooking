import { fail, redirect, type RequestEvent } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { assertAdmin } from '#lib/server/auth';
import { cancelBooking, listBookingsFrom, restoreBooking } from '#lib/server/booking';
import { field } from '#lib/server/form';
import { startOfOsloDay } from '#lib/time';

export const load: PageServerLoad = async () => {
	return { rows: await listBookingsFrom(startOfOsloDay()) };
};

export const actions = {
	release: (event) => cancel(event, 'release'),
	noshow: (event) => cancel(event, 'noshow'),
	restore: async (event) => {
		assertAdmin(event.locals.admin, event.url);
		const result = await restoreBooking(field(await event.request.formData(), 'id'));
		if (!result.ok) return fail(400, { message: result.message });
		redirect(303, '/admin/bookings');
	}
} satisfies Actions;

async function cancel(event: RequestEvent, mode: 'release' | 'noshow') {
	assertAdmin(event.locals.admin, event.url);
	const result = await cancelBooking(field(await event.request.formData(), 'id'), mode);
	if (!result.ok) return fail(400, { message: result.message });
	redirect(303, '/admin/bookings');
}
