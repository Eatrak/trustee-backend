CREATE TABLE `Currency` (
	`id` varchar(36) PRIMARY KEY NOT NULL,
	`code` varchar(3) NOT NULL,
	`symbol` varchar(10) NOT NULL,
	CONSTRAINT `Currency_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `TransactionCategory` (
	`id` varchar(36) PRIMARY KEY NOT NULL,
	`name` varchar(256) NOT NULL,
	`userId` varchar(36) NOT NULL,
	CONSTRAINT `TransactionCategory_name_userId_unique` UNIQUE(`name`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `TransactionCategoryRelation` (
	`id` varchar(36) PRIMARY KEY NOT NULL,
	`transactionId` varchar(36) NOT NULL,
	`categoryId` varchar(36) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Transaction` (
	`id` varchar(36) PRIMARY KEY NOT NULL,
	`name` varchar(256) NOT NULL,
	`walletId` varchar(36) NOT NULL,
	`carriedOut` int NOT NULL,
	`amount` decimal(19,2) NOT NULL,
	`isIncome` boolean NOT NULL,
	`createdAt` int NOT NULL
);
--> statement-breakpoint
CREATE TABLE `UserSettings` (
	`id` varchar(36) PRIMARY KEY NOT NULL,
	`userId` varchar(36) NOT NULL,
	`currencyId` varchar(36) NOT NULL,
	`language` varchar(10) NOT NULL,
	CONSTRAINT `UserSettings_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `User` (
	`id` varchar(36) PRIMARY KEY NOT NULL,
	`email` varchar(256) NOT NULL,
	`name` varchar(256) NOT NULL,
	`surname` varchar(256) NOT NULL,
	CONSTRAINT `User_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `Wallet` (
	`id` varchar(36) PRIMARY KEY NOT NULL,
	`name` varchar(256) NOT NULL,
	`userId` varchar(36) NOT NULL,
	`currencyId` varchar(36) NOT NULL,
	`untrackedBalance` decimal(19,2) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `TransactionCategory` ADD CONSTRAINT `TransactionCategory_userId_User_id_fk` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `TransactionCategoryRelation` ADD CONSTRAINT `TransactionCategoryRelation_transactionId_Transaction_id_fk` FOREIGN KEY (`transactionId`) REFERENCES `Transaction`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `TransactionCategoryRelation` ADD CONSTRAINT `TransactionCategoryRelation_categoryId_TransactionCategory_id_fk` FOREIGN KEY (`categoryId`) REFERENCES `TransactionCategory`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_walletId_Wallet_id_fk` FOREIGN KEY (`walletId`) REFERENCES `Wallet`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `UserSettings` ADD CONSTRAINT `UserSettings_userId_User_id_fk` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `UserSettings` ADD CONSTRAINT `UserSettings_currencyId_Currency_id_fk` FOREIGN KEY (`currencyId`) REFERENCES `Currency`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Wallet` ADD CONSTRAINT `Wallet_userId_User_id_fk` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Wallet` ADD CONSTRAINT `Wallet_currencyId_Currency_id_fk` FOREIGN KEY (`currencyId`) REFERENCES `Currency`(`id`) ON DELETE no action ON UPDATE no action;