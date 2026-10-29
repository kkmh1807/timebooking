import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { assertAdmin } from '#lib/server/auth';
import { createSlots, deleteSlot, listAdminSlots } from '#lib/server/booking';
import { field } from '#lib/server/form';
import { isDuration, MAX_CLASSES } from '#lib/time';

export const load: PageServerLoad = async ({ url }) => {
	const created = Number(url.searchParams.get('opprettet'));
	const notice =
		Number.isInteger(created) && created > 0
			? created === 1
				? 'La ut 1 time.'
				: `La ut ${created} timer.`
			: null;
	return { slots: await listAdminSlots(), notice };
};

export const actions = {
	create: async ({ request, locals, url }) => {
		assertAdmin(locals.admin, url);
		const data = await request.formData();
		const date = field(data, 'date');
		const starts = data
			.getAll('start')
			.flatMap((value) => (typeof value === 'string' ? [value] : []));
		const duration = Number(field(data, 'duration'));
		const label = field(data, 'label');
		const values = { date, starts, duration: String(duration || ''), label, message: '' };

		if (label.length > 80) {
			return fail(400, { ...values, message: 'Merket kan være maks 80 tegn.' });
		}
		if (!isDuration(duration)) return fail(400, { ...values, message: 'Velg varighet.' });
		if (starts.length < 1 || starts.length > MAX_CLASSES) {
			return fail(400, { ...values, message: `Velg mellom 1 og ${MAX_CLASSES} timer.` });
		}

		const result = await createSlots({ date, starts, durationMinutes: duration, label });
		if (!result.ok) return fail(400, { ...values, message: result.message });
		redirect(303, `/admin/slots?opprettet=${result.count}`);
	},
	remove: async ({ request, locals, url }) => {
		assertAdmin(locals.admin, url);
		const result = await deleteSlot(field(await request.formData(), 'id'));
		if (!result.ok) {
			return fail(400, {
				date: '',
				starts: [] as string[],
				duration: '',
				label: '',
				message: result.message
			});
		}
		redirect(303, '/admin/slots');
	}
} satisfies Actions;
