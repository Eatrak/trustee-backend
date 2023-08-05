ALTER TABLE `Transaction` DROP FOREIGN KEY `Transaction_currencyId_Currency_id_fk`;
--> statement-breakpoint
ALTER TABLE `Wallet` ADD `currencyId` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `Wallet` ADD CONSTRAINT `Wallet_currencyId_Currency_id_fk` FOREIGN KEY (`currencyId`) REFERENCES `Currency`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Transaction` DROP COLUMN `currencyId`;