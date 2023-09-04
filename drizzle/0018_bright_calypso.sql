ALTER TABLE `UserSettings` DROP FOREIGN KEY `UserSettings_currencyId_Currency_id_fk`;
--> statement-breakpoint
ALTER TABLE `Wallet` DROP FOREIGN KEY `Wallet_currencyId_Currency_id_fk`;
--> statement-breakpoint
ALTER TABLE `UserSettings` ADD CONSTRAINT `UserSettings_currencyId_Currency_id_fk` FOREIGN KEY (`currencyId`) REFERENCES `Currency`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Wallet` ADD CONSTRAINT `Wallet_currencyId_Currency_id_fk` FOREIGN KEY (`currencyId`) REFERENCES `Currency`(`id`) ON DELETE no action ON UPDATE no action;