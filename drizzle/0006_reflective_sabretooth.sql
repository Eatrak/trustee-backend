ALTER TABLE `Transaction` DROP FOREIGN KEY `Transaction_walletId_Wallet_id_fk`;
--> statement-breakpoint
ALTER TABLE `Transaction` MODIFY COLUMN `categoryId` varchar(36);--> statement-breakpoint
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_walletId_Wallet_id_fk` FOREIGN KEY (`walletId`) REFERENCES `Wallet`(`id`) ON DELETE cascade ON UPDATE no action;