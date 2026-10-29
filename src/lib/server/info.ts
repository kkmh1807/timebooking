import { and, asc, eq, ne } from 'drizzle-orm';
import { db } from './db';
import { infoPages } from './db/schema';

const starterPages = [
	{
		slug: 'om',
		title: 'Om undervisningen',
		published: true,
		body: `Undervisningen er privat: én til én, eller en liten gruppe som booker timen sammen.

Skriv gjerne ønsket stil og erfaring i merknadsfeltet når du booker.

Denne teksten kan endres av studioet.`
	},
	{
		slug: 'praktisk',
		title: 'Praktisk informasjon',
		published: true,
		body: `## Slik booker du

Velg en ledig time, fyll inn navn og kontakt, og send inn. Timen blir opptatt for andre med en gang.

## Betaling

Du betaler i studio. Vi tar ikke imot betaling på nettet.

## Avbestilling

Avbestilling gjøres av studioet. Ta kontakt hvis du ikke kan komme.

## Sted

Oppdater denne teksten med adresse og hvordan man finner fram.`
	},
	{
		slug: 'priser',
		title: 'Priser',
		published: true,
		body: `Pris avtales i studio.

En time er vanligvis 45, 60 eller 90 minutter. Lengden står på den ledige timen.`
	}
];

let seeded: Promise<void> | null = null;

export function ensureInfoPages() {
	seeded ??= db
		.insert(infoPages)
		.values(starterPages)
		.onConflictDoNothing({ target: infoPages.slug })
		.then(() => undefined)
		.catch((error) => {
			seeded = null;
			throw error;
		});
	return seeded;
}

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
