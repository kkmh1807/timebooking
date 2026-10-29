import type { PageServerLoad } from './$types';
import { listOpenSlots } from '#lib/server/booking';

export const load: PageServerLoad = async ({ url }) => {
	const label = url.searchParams.get('label')?.trim() ?? '';
	const all = await listOpenSlots();
	const labels = [...new Set(all.flatMap((slot) => (slot.label ? [slot.label] : [])))].sort((a, b) =>
		a.localeCompare(b, 'nb')
	);
	const slots = label ? all.filter((slot) => slot.label === label) : all;
	return { slots, labels, label };
};
