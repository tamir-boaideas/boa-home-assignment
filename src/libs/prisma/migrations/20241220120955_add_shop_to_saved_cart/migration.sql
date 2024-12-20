/*
  Warnings:

  - A unique constraint covering the columns `[customerId,shop]` on the table `SavedCart` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shop` to the `SavedCart` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `SavedCart_customerId_key` ON `savedcart`;

-- AlterTable
ALTER TABLE `savedcart` ADD COLUMN `shop` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `SavedCart_shop_idx` ON `SavedCart`(`shop`);

-- CreateIndex
CREATE UNIQUE INDEX `SavedCart_customerId_shop_key` ON `SavedCart`(`customerId`, `shop`);
