import { and, asc, count, eq, gt, gte, lt, ne } from 'drizzle-orm';
import { db } from './db';
import { bookings, slots } from './db/schema';
import { hasClockOverlap, slotsAt, startOfOsloDay } from '#lib/time';

export async function listOpenSlots(label?: string) {
	const conditions = [eq(slots.status, 'open'), gt(slots.startsAt, new Date())];
	if (label) conditions.push(eq(slots.label, label));
	return db
		.select()
		.from(slots)
		.where(and(...conditions))
		.orderBy(asc(slots.startsAt));
}

export async function getSlot(id: string) {
	const [slot] = await db.select().from(slots).where(eq(slots.id, id));
	return slot ?? null;
}

export async function createSlots(input: {
	date: string;
	starts: string[];
	durationMinutes: number;
	label: string;
}) {
	const built = slotsAt(input.date, input.starts, input.durationMinutes);
	if (!built) return { ok: false as const, message: 'Sjekk dato og klokkeslett.' };
	if (hasClockOverlap(input.starts, input.durationMinutes)) {
		return { ok: false as const, message: 'To av timene overlapper. Endre klokkeslettet.' };
	}
	if (built.some((slot) => slot.startsAt.getTime() <= Date.now())) {
		return { ok: false as const, message: 'Et av tidspunktene har allerede passert.' };
	}

	return db.transaction(async (tx) => {
		for (const slot of built) {
			const [overlap] = await tx
				.select({ id: slots.id })
				.from(slots)
				.where(
					and(
						ne(slots.status, 'cancelled'),
						lt(slots.startsAt, slot.endsAt),
						gt(slots.endsAt, slot.startsAt)
					)
				)
				.limit(1);
			if (overlap) {
				return {
					ok: false as const,
					message: 'En av timene overlapper en time som allerede er lagt ut.'
				};
			}
		}

		await tx.insert(slots).values(
			built.map((slot) => ({
				startsAt: slot.startsAt,
				endsAt: slot.endsAt,
				label: input.label || null,
				status: 'open' as const
			}))
		);
		return { ok: true as const, count: built.length };
	});
}

export async function deleteSlot(id: string) {
	const [slot] = await db.select().from(slots).where(eq(slots.id, id));
	if (!slot) return { ok: false as const, message: 'Fant ikke timen.' };
	if (slot.status === 'booked') {
		return { ok: false as const, message: 'Avbestill bookingen før du sletter timen.' };
	}

	if (slot.status === 'cancelled') {
		await db.transaction(async (tx) => {
			await tx.delete(bookings).where(eq(bookings.slotId, id));
			await tx.delete(slots).where(eq(slots.id, id));
		});
		return { ok: true as const };
	}

	const [booking] = await db
		.select({ id: bookings.id })
		.from(bookings)
		.where(eq(bookings.slotId, id))
		.limit(1);
	if (booking) return { ok: false as const, message: 'Timen har en booking og kan ikke slettes.' };

	await db.delete(slots).where(eq(slots.id, id));
	return { ok: true as const };
}

export async function listAdminSlots() {
	const rows = await db
		.select({ slot: slots, bookingId: bookings.id })
		.from(slots)
		.leftJoin(bookings, eq(bookings.slotId, slots.id))
		.where(gte(slots.startsAt, startOfOsloDay()))
		.orderBy(asc(slots.startsAt));

	const grouped = new Map<string, { slot: (typeof rows)[number]['slot']; hasBooking: boolean }>();
	for (const row of rows) {
		const existing = grouped.get(row.slot.id);
		if (!existing) grouped.set(row.slot.id, { slot: row.slot, hasBooking: row.bookingId != null });
		else if (row.bookingId) existing.hasBooking = true;
	}
	return [...grouped.values()];
}

export async function bookSlot(input: {
	slotId: string;
	customerName: string;
	customerEmail: string;
	customerPhone: string;
	notes: string | null;
}) {
	try {
		return await db.transaction(async (tx) => {
			const [slot] = await tx
				.update(slots)
				.set({ status: 'booked' })
				.where(
					and(eq(slots.id, input.slotId), eq(slots.status, 'open'), gt(slots.startsAt, new Date()))
				)
				.returning();
			if (!slot) return { ok: false as const, message: 'Timen er ikke lenger ledig.' };

			const [booking] = await tx
				.insert(bookings)
				.values({
					slotId: slot.id,
					customerName: input.customerName,
					customerEmail: input.customerEmail,
					customerPhone: input.customerPhone,
					notes: input.notes,
					status: 'confirmed'
				})
				.returning();
			return { ok: true as const, booking, slot };
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : '';
		if (message.toLowerCase().includes('unique')) {
			return { ok: false as const, message: 'Timen er ikke lenger ledig.' };
		}
		throw error;
	}
}

export async function getBookingWithSlot(id: string) {
	const [row] = await db
		.select({ booking: bookings, slot: slots })
		.from(bookings)
		.innerJoin(slots, eq(bookings.slotId, slots.id))
		.where(eq(bookings.id, id));
	return row ?? null;
}

export async function listBookingsFrom(from: Date) {
	return db
		.select({ booking: bookings, slot: slots })
		.from(bookings)
		.innerJoin(slots, eq(bookings.slotId, slots.id))
		.where(gte(slots.startsAt, from))
		.orderBy(asc(slots.startsAt));
}

export async function listConfirmedBetween(start: Date, end: Date) {
	return db
		.select({ booking: bookings, slot: slots })
		.from(bookings)
		.innerJoin(slots, eq(bookings.slotId, slots.id))
		.where(
			and(eq(bookings.status, 'confirmed'), gte(slots.startsAt, start), lt(slots.startsAt, end))
		)
		.orderBy(asc(slots.startsAt));
}

export async function countOpenSlots() {
	const [row] = await db
		.select({ value: count() })
		.from(slots)
		.where(and(eq(slots.status, 'open'), gt(slots.startsAt, new Date())));
	return row?.value ?? 0;
}

export async function cancelBooking(id: string, mode: 'release' | 'noshow') {
	return db.transaction(async (tx) => {
		const [booking] = await tx
			.update(bookings)
			.set({ status: 'cancelled' })
			.where(and(eq(bookings.id, id), eq(bookings.status, 'confirmed')))
			.returning();
		if (!booking) return { ok: false as const, message: 'Bookingen er allerede avsluttet.' };

		await tx
			.update(slots)
			.set({ status: mode === 'release' ? 'open' : 'cancelled' })
			.where(eq(slots.id, booking.slotId));
		return { ok: true as const };
	});
}

export async function restoreBooking(id: string) {
	try {
		return await db.transaction(async (tx) => {
			const [booking] = await tx
				.update(bookings)
				.set({ status: 'confirmed' })
				.where(and(eq(bookings.id, id), eq(bookings.status, 'cancelled')))
				.returning();
			if (!booking) return { ok: false as const, message: 'Bookingen er allerede aktiv.' };

			const [slot] = await tx
				.update(slots)
				.set({ status: 'booked' })
				.where(and(eq(slots.id, booking.slotId), ne(slots.status, 'booked')))
				.returning();
			if (!slot) throw new Error('SLOT_TAKEN');
			return { ok: true as const };
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : '';
		if (message === 'SLOT_TAKEN' || message.toLowerCase().includes('unique')) {
			return { ok: false as const, message: 'Timen er booket av noen andre.' };
		}
		throw error;
	}
}
