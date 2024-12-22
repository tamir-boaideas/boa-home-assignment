/*
  Warnings:

  - The primary key for the `savedcart` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `savedcart` DROP PRIMARY KEY,
    MODIFY `customerId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`customerId`);
