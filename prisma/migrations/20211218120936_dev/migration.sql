-- AlterIndex
ALTER TABLE `colors` RENAME INDEX `colors_name_key` TO `colors.name_unique`;

-- AlterIndex
ALTER TABLE `users` RENAME INDEX `users_email_key` TO `users.email_unique`;
