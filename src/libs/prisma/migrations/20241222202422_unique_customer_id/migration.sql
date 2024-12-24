/*
  Warnings:

  - A unique constraint covering the columns `[customerId]` on the table `SavedCart` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `SavedCart_customerId_key` ON `SavedCart`(`customerId`);
