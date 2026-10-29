import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { bookSlot, getSlot } from '#lib/server/booking';
import { sendBookingEmails } from '#lib/server/email';
import { customerInput } from '#lib/server/form';

export const load: PageServerLoad = async ({ params }) => {
	const slot = await getSlot(params.slotId);
	if (!slot) error(404, 'Fant ikke timen.');
	const bookable = slot.status === 'open' && slot.startsAt.getTime() > Date.now();
	return { slot, bookable };
};

export const actions = {
	default: async ({ request, params }) => {
		const input = customerInput(await request.formData());
		if (Object.keys(input.errors).length > 0) return fail(400, input);

		const result = await bookSlot({
			slotId: params.slotId,
			customerName: input.name,
			customerEmail: input.email,
			customerPhone: input.phone,
			notes: input.notes
		});
		if (!result.ok) return fail(400, { ...input, message: result.message });

		const sent = await sendBookingEmails({
			customerName: result.booking.customerName,
			customerEmail: result.booking.customerEmail,
			customerPhone: result.booking.customerPhone,
			notes: result.booking.notes,
			startsAt: result.slot.startsAt,
			endsAt: result.slot.endsAt,
			label: result.slot.label
		});
		redirect(303, `/book/confirmation?id=${result.booking.id}&sent=${sent ? '1' : '0'}`);
	}
} satisfies Actions;
