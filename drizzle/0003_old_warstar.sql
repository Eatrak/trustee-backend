ALTER TABLE `Wallet` DROP CONSTRAINT `Wallet_name_currencyId_unique`;--> statement-breakpoint
ALTER TABLE `Wallet` DROP FOREIGN KEY `Wallet_currencyId_Currency_id_fk`;
--> statement-breakpoint
ALTER TABLE `Transaction` ADD `currencyId` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_currencyId_Currency_id_fk` FOREIGN KEY (`currencyId`) REFERENCES `Currency`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Wallet` DROP COLUMN `currencyId`;--> statement-breakpoint
ALTER TABLE `Wallet` ADD CONSTRAINT `Wallet_name_unique` UNIQUE(`name`);