/*
  Warnings:

  - You are about to alter the column `name` on the `Color` table. The data in that column could be lost. The data in that column will be cast from `Enum("Color_name")` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `Color` MODIFY `name` VARCHAR(191) NOT NULL;
