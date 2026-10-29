import type { PageServerLoad } from './$types';
import { listOpenSlots } from '#lib/server/booking';

export const load: PageServerLoad = async () => {
	const slots = await listOpenSlots();
	return { slots: slots.slice(0, 3) };
};
