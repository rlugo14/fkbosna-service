-- DropForeignKey
ALTER TABLE `players` DROP FOREIGN KEY `players_ibfk_1`;

-- AlterTable
ALTER TABLE `players` ADD COLUMN `fupaSlug` VARCHAR(191) NOT NULL DEFAULT '';

-- AddForeignKey
ALTER TABLE `players` ADD CONSTRAINT `players_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `colors`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `colors` RENAME INDEX `colors.name_unique` TO `colors_name_key`;

-- RenameIndex
ALTER TABLE `users` RENAME INDEX `users.email_unique` TO `users_email_key`;
