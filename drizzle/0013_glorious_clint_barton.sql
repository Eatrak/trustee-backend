CREATE TABLE `TransactionCategoryRelation` (
	`transactionId` varchar(36) PRIMARY KEY NOT NULL,
	`transactionCategoryId` varchar(36) PRIMARY KEY NOT NULL
);
--> statement-breakpoint
ALTER TABLE `Transaction` DROP FOREIGN KEY `Transaction_categoryId_TransactionCategory_id_fk`;
--> statement-breakpoint
ALTER TABLE `Transaction` DROP COLUMN `categoryId`;--> statement-breakpoint
ALTER TABLE `TransactionCategoryRelation` ADD CONSTRAINT `TransactionCategoryRelation_transactionId_Transaction_id_fk` FOREIGN KEY (`transactionId`) REFERENCES `Transaction`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `TransactionCategoryRelation` ADD CONSTRAINT `TransactionCategoryRelation_transactionCategoryId_TransactionCategory_id_fk` FOREIGN KEY (`transactionCategoryId`) REFERENCES `TransactionCategory`(`id`) ON DELETE no action ON UPDATE no action;