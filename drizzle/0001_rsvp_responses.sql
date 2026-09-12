CREATE TABLE `rsvp_responses` (
  `id` text PRIMARY KEY NOT NULL,
  `event_key` text NOT NULL,
  `payload` text NOT NULL,
  `created_at` integer NOT NULL
);
