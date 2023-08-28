ALTER TABLE `TransactionCategoryRelation` RENAME COLUMN `transactionCategoryId` TO `categoryId`;--> statement-breakpoint
ALTER TABLE `TransactionCategoryRelation` DROP FOREIGN KEY `TransactionCategoryRelation_transactionCategoryId_TransactionCategory_id_fk`;
--> statement-breakpoint
ALTER TABLE `TransactionCategoryRelation` ADD CONSTRAINT `TransactionCategoryRelation_categoryId_TransactionCategory_id_fk` FOREIGN KEY (`categoryId`) REFERENCES `TransactionCategory`(`id`) ON DELETE no action ON UPDATE no action;