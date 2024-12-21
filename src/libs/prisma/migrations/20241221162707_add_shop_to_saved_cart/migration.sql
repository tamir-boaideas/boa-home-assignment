/*
  Warnings:

  - You are about to drop the `savedcart` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `savedcart`;

-- CreateTable
CREATE TABLE `saved_carts` (
    `id` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `shop` VARCHAR(191) NOT NULL,
    `cartItems` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `saved_carts_customerId_shop_key`(`customerId`, `shop`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
