-- CreateTable
CREATE TABLE `SavedCart` (
    `customerId` INTEGER NOT NULL,
    `productVariants` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `SavedCart_customerId_key`(`customerId`),
    PRIMARY KEY (`customerId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
