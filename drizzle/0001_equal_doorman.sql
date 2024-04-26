ALTER TABLE `Transaction` MODIFY COLUMN `amount` decimal(19, 2);--> statement-breakpoint
ALTER TABLE `Wallet` MODIFY COLUMN `untrackedBalance` decimal(19, 2) NOT NULL;