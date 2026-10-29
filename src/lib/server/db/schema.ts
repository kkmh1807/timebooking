import { relations, sql } from 'drizzle-orm';
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const slotStatuses = ['open', 'booked', 'cancelled'] as const;
export type SlotStatus = (typeof slotStatuses)[number];

export const bookingStatuses = ['confirmed', 'cancelled'] as const;
export type BookingStatus = (typeof bookingStatuses)[number];

export const slots = sqliteTable('slots', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	startsAt: integer('startsAt', { mode: 'timestamp_ms' }).notNull(),
	endsAt: integer('endsAt', { mode: 'timestamp_ms' }).notNull(),
	status: text('status', { enum: slotStatuses }).notNull().default('open'),
	label: text('label')
});

export const bookings = sqliteTable(
	'bookings',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		slotId: text('slotId')
			.notNull()
			.references(() => slots.id),
		customerName: text('customerName').notNull(),
		customerEmail: text('customerEmail').notNull(),
		customerPhone: text('customerPhone').notNull(),
		notes: text('notes'),
		status: text('status', { enum: bookingStatuses }).notNull().default('confirmed'),
		createdAt: integer('createdAt', { mode: 'timestamp_ms' })
			.notNull()
			.$defaultFn(() => new Date())
	},
	(table) => [
		uniqueIndex('bookings_active_slot')
			.on(table.slotId)
			.where(sql`${table.status} = 'confirmed'`)
	]
);

export const infoPages = sqliteTable('info_pages', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	slug: text('slug').notNull().unique(),
	title: text('title').notNull(),
	body: text('body').notNull(),
	updatedAt: integer('updatedAt', { mode: 'timestamp_ms' })
		.notNull()
		.$defaultFn(() => new Date()),
	published: integer('published', { mode: 'boolean' }).notNull().default(false)
});

export const slotsRelations = relations(slots, ({ many }) => ({
	bookings: many(bookings)
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
	slot: one(slots, {
		fields: [bookings.slotId],
		references: [slots.id]
	})
}));
