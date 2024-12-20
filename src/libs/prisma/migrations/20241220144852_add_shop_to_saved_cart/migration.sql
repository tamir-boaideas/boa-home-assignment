/*
  Warnings:

  - The primary key for the `savedcart` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropIndex
DROP INDEX `SavedCart_shop_idx` ON `savedcart`;

-- AlterTable
ALTER TABLE `savedcart` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);
