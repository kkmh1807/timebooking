import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getPublishedPage } from '#lib/server/info';
import { renderMarkdown } from '#lib/markdown';

export const load: PageServerLoad = async ({ params }) => {
	const page = await getPublishedPage(params.slug);
	if (!page) error(404, 'Fant ikke siden.');
	return { title: page.title, html: renderMarkdown(page.body) };
};
