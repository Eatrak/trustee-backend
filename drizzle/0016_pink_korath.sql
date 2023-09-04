ALTER TABLE `TransactionCategoryRelation` DROP FOREIGN KEY `TransactionCategoryRelation_transactionId_Transaction_id_fk`;
--> statement-breakpoint
ALTER TABLE `TransactionCategoryRelation` ADD CONSTRAINT `TransactionCategoryRelation_transactionId_Transaction_id_fk` FOREIGN KEY (`transactionId`) REFERENCES `Transaction`(`id`) ON DELETE cascade ON UPDATE no action;