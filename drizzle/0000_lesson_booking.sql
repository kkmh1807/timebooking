CREATE TABLE `bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`slotId` text NOT NULL,
	`customerName` text NOT NULL,
	`customerEmail` text NOT NULL,
	`customerPhone` text NOT NULL,
	`notes` text,
	`status` text DEFAULT 'confirmed' NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`slotId`) REFERENCES `slots`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bookings_active_slot` ON `bookings` (`slotId`) WHERE "bookings"."status" = 'confirmed';--> statement-breakpoint
CREATE TABLE `info_pages` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`updatedAt` integer NOT NULL,
	`published` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `info_pages_slug_unique` ON `info_pages` (`slug`);--> statement-breakpoint
CREATE TABLE `slots` (
	`id` text PRIMARY KEY NOT NULL,
	`startsAt` integer NOT NULL,
	`endsAt` integer NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`label` text
);
