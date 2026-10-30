import { and, asc, eq, ne } from 'drizzle-orm';
import { db } from './db';
import { infoPages } from './db/schema';

export async function listPublishedPages() {
	return db
		.select({ slug: infoPages.slug, title: infoPages.title })
		.from(infoPages)
		.where(eq(infoPages.published, true))
		.orderBy(asc(infoPages.title));
}

export async function listAllPages() {
	return db.select().from(infoPages).orderBy(asc(infoPages.title));
}

export async function getPublishedPage(slug: string) {
	const [page] = await db
		.select()
		.from(infoPages)
		.where(and(eq(infoPages.slug, slug), eq(infoPages.published, true)));
	return page ?? null;
}

export async function getPage(id: string) {
	const [page] = await db.select().from(infoPages).where(eq(infoPages.id, id));
	return page ?? null;
}

export async function createPage(input: {
	slug: string;
	title: string;
	body: string;
	published: boolean;
}) {
	const [existing] = await db
		.select({ id: infoPages.id })
		.from(infoPages)
		.where(eq(infoPages.slug, input.slug))
		.limit(1);
	if (existing) return { ok: false as const, message: 'Dette URL-navnet er allerede i bruk.' };

	const [page] = await db
		.insert(infoPages)
		.values({
			slug: input.slug,
			title: input.title,
			body: input.body,
			published: input.published
		})
		.returning();
	return { ok: true as const, page };
}

export async function updatePage(
	id: string,
	input: { slug: string; title: string; body: string; published: boolean }
) {
	const [existing] = await db
		.select({ id: infoPages.id })
		.from(infoPages)
		.where(and(eq(infoPages.slug, input.slug), ne(infoPages.id, id)))
		.limit(1);
	if (existing) return { ok: false as const, message: 'Dette URL-navnet er allerede i bruk.' };

	const [page] = await db
		.update(infoPages)
		.set({
			slug: input.slug,
			title: input.title,
			body: input.body,
			published: input.published,
			updatedAt: new Date()
		})
		.where(eq(infoPages.id, id))
		.returning();
	if (!page) return { ok: false as const, message: 'Fant ikke siden.' };
	return { ok: true as const, page };
}

export async function deletePage(id: string) {
	await db.delete(infoPages).where(eq(infoPages.id, id));
}
