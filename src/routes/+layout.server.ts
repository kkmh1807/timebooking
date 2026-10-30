import type { LayoutServerLoad } from './$types';
import { listPublishedPages } from '#lib/server/info';

export const load: LayoutServerLoad = async ({ locals }) => {
	const pages = await listPublishedPages();
	return { admin: locals.admin, pages };
};
