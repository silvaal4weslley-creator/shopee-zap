CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(300) NOT NULL,
	`message` text,
	`type` enum('send_success','send_failed','schedule_created','system') NOT NULL DEFAULT 'system',
	`read` boolean NOT NULL DEFAULT false,
	`relatedLinkId` int,
	`relatedScheduleId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `links` ADD `category` varchar(100);--> statement-breakpoint
ALTER TABLE `schedules` ADD `customMessage` text;--> statement-breakpoint
ALTER TABLE `schedules` ADD `repeatWeekly` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `settings` ADD `allowWeekends` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `settings` ADD `defaultMessage` text;