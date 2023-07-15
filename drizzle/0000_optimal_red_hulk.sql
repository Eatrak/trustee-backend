CREATE TABLE `User` (
	`id` serial AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`email` varchar(256) NOT NULL,
	CONSTRAINT `User_email_unique` UNIQUE(`email`)
);
