CREATE TABLE `guests` (
	`id` text PRIMARY KEY NOT NULL,
	`wedding_id` text NOT NULL,
	`display_name` text NOT NULL,
	`normalized_name` text NOT NULL,
	`party_size` integer DEFAULT 1 NOT NULL,
	`status` text NOT NULL,
	`source` text DEFAULT 'Manuale' NOT NULL,
	`invitation_sent` integer DEFAULT false NOT NULL,
	`allergies` text DEFAULT '' NOT NULL,
	`intolerances` text DEFAULT '' NOT NULL,
	`dietary_needs` text DEFAULT '' NOT NULL,
	`accessibility_needs` text DEFAULT '' NOT NULL,
	`special_needs` text DEFAULT '' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`wedding_id`) REFERENCES `weddings`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `guests_wedding_idx` ON `guests` (`wedding_id`);--> statement-breakpoint
CREATE INDEX `guests_wedding_name_idx` ON `guests` (`wedding_id`,`normalized_name`);--> statement-breakpoint
CREATE TABLE `rsvp_responses` (
	`id` text PRIMARY KEY NOT NULL,
	`wedding_id` text NOT NULL,
	`guest_id` text NOT NULL,
	`idempotency_key` text NOT NULL,
	`fingerprint` text NOT NULL,
	`participation` text NOT NULL,
	`display_name` text NOT NULL,
	`party_size` integer NOT NULL,
	`allergies` text DEFAULT '' NOT NULL,
	`intolerances` text DEFAULT '' NOT NULL,
	`special_needs` text DEFAULT '' NOT NULL,
	`privacy_consent_at` integer NOT NULL,
	`submitted_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`wedding_id`) REFERENCES `weddings`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rsvp_wedding_idempotency_uidx` ON `rsvp_responses` (`wedding_id`,`idempotency_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `rsvp_wedding_fingerprint_uidx` ON `rsvp_responses` (`wedding_id`,`fingerprint`);--> statement-breakpoint
CREATE INDEX `rsvp_guest_idx` ON `rsvp_responses` (`guest_id`);--> statement-breakpoint
CREATE TABLE `weddings` (
	`id` text PRIMARY KEY NOT NULL,
	`public_slug` text NOT NULL,
	`couple_names` text NOT NULL,
	`wedding_date` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `weddings_public_slug_unique` ON `weddings` (`public_slug`);