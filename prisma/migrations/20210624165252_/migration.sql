/*
  Warnings:

  - The values [yellow,white,blue,red] on the enum `Color_name` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Color` MODIFY `name` ENUM('YELLOW', 'WHITE', 'BLUE', 'RED') NOT NULL;
