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
	CONSTRAINT `TransactionCategory_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `Transaction` (
	`id` varchar(36) PRIMARY KEY NOT NULL,
	`name` varchar(256) NOT NULL,
	`userId` varchar(36) NOT NULL,
	`walletId` varchar(36) NOT NULL,
	`categoryId` varchar(36) NOT NULL,
	`carriedOut` int NOT NULL,
	`amount` float NOT NULL,
	`isIncome` boolean NOT NULL,
	`createdAt` int NOT NULL
);
--> statement-breakpoint
CREATE TABLE `User` (
	`id` varchar(36) PRIMARY KEY NOT NULL,
	`email` varchar(256) NOT NULL,
	CONSTRAINT `User_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `Wallet` (
	`id` varchar(36) PRIMARY KEY NOT NULL,
	`name` varchar(256) NOT NULL,
	`userId` varchar(36) NOT NULL,
	`currencyCode` varchar(36) NOT NULL,
	CONSTRAINT `Wallet_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
ALTER TABLE `TransactionCategory` ADD CONSTRAINT `TransactionCategory_userId_User_id_fk` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_userId_User_id_fk` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_walletId_Wallet_id_fk` FOREIGN KEY (`walletId`) REFERENCES `Wallet`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_categoryId_TransactionCategory_id_fk` FOREIGN KEY (`categoryId`) REFERENCES `TransactionCategory`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Wallet` ADD CONSTRAINT `Wallet_userId_User_id_fk` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Wallet` ADD CONSTRAINT `Wallet_currencyCode_Currency_id_fk` FOREIGN KEY (`currencyCode`) REFERENCES `Currency`(`id`) ON DELETE no action ON UPDATE no action;