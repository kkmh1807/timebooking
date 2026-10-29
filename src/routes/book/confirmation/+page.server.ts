import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getBookingWithSlot } from '#lib/server/booking';

export const load: PageServerLoad = async ({ url }) => {
	const id = url.searchParams.get('id');
	if (!id) error(404, 'Fant ikke bookingen.');
	const row = await getBookingWithSlot(id);
	if (!row) error(404, 'Fant ikke bookingen.');
	const sent = url.searchParams.get('sent');
	return {
		booking: row.booking,
		slot: row.slot,
		emailSent: sent === '1' ? true : sent === '0' ? false : null
	};
};
