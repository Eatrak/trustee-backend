CREATE TABLE `UserSettings` (
	`id` varchar(36) PRIMARY KEY NOT NULL,
	`userId` varchar(36) NOT NULL,
	`currencyId` varchar(36) NOT NULL,
	CONSTRAINT `UserSettings_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `UserSettings` ADD CONSTRAINT `UserSettings_userId_User_id_fk` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `UserSettings` ADD CONSTRAINT `UserSettings_currencyId_Currency_id_fk` FOREIGN KEY (`currencyId`) REFERENCES `Currency`(`id`) ON DELETE no action ON UPDATE no action;