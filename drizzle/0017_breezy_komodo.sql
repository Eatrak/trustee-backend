ALTER TABLE `TransactionCategory` DROP FOREIGN KEY `TransactionCategory_userId_User_id_fk`;
--> statement-breakpoint
ALTER TABLE `Transaction` DROP FOREIGN KEY `Transaction_userId_User_id_fk`;
--> statement-breakpoint
ALTER TABLE `UserSettings` DROP FOREIGN KEY `UserSettings_userId_User_id_fk`;
--> statement-breakpoint
ALTER TABLE `Wallet` DROP FOREIGN KEY `Wallet_userId_User_id_fk`;
--> statement-breakpoint
ALTER TABLE `TransactionCategory` ADD CONSTRAINT `TransactionCategory_userId_User_id_fk` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_userId_User_id_fk` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `UserSettings` ADD CONSTRAINT `UserSettings_userId_User_id_fk` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Wallet` ADD CONSTRAINT `Wallet_userId_User_id_fk` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE cascade ON UPDATE no action;