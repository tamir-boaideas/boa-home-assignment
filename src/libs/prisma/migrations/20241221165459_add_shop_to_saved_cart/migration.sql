/*
  Warnings:

  - The primary key for the `saved_carts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `cartItems` on the `saved_carts` table. All the data in the column will be lost.
  - You are about to drop the column `shop` on the `saved_carts` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `saved_carts` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - A unique constraint covering the columns `[customerId]` on the table `saved_carts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `products` to the `saved_carts` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `saved_carts_customerId_shop_key` ON `saved_carts`;

-- AlterTable
ALTER TABLE `saved_carts` DROP PRIMARY KEY,
    DROP COLUMN `cartItems`,
    DROP COLUMN `shop`,
    ADD COLUMN `products` JSON NOT NULL,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- CreateIndex
CREATE UNIQUE INDEX `saved_carts_customerId_key` ON `saved_carts`(`customerId`);
