/*
  Warnings:

  - You are about to alter the column `customerId` on the `saved_carts` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `saved_carts` ADD COLUMN `cartData` VARCHAR(191) NULL,
    MODIFY `customerId` VARCHAR(191) NOT NULL;
