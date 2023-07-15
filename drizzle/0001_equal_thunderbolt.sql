CREATE TABLE `Currency` (
	`id` serial AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`code` varchar(3) NOT NULL,
	`symbol` varchar(10) NOT NULL,
	CONSTRAINT `Currency_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `TransactionCategory` (
	`id` serial AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`name` varchar(256) NOT NULL,
	`userId` varchar(36) NOT NULL,
	CONSTRAINT `TransactionCategory_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `Transaction` (
	`id` serial AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`userId` varchar(36) NOT NULL,
	`walletId` varchar(36) NOT NULL,
	`categoryId` varchar(36) NOT NULL,
	`carriedOut` datetime NOT NULL,
	`amount` float NOT NULL,
	`isIncome` boolean NOT NULL,
	`createdAt` datetime NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Wallet` (
	`id` serial AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`name` varchar(256) NOT NULL,
	`userId` varchar(36) NOT NULL,
	`currencyCode` varchar(36) NOT NULL,
	CONSTRAINT `Wallet_name_unique` UNIQUE(`name`)
);
