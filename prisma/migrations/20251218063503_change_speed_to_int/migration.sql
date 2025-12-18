/*
  Warnings:

  - You are about to alter the column `speed` on the `workout_sets` table. The data in that column could be lost. The data in that column will be cast from `Decimal(5,2)` to `Int`.

*/
-- AlterTable
ALTER TABLE `workout_sets` MODIFY `speed` INTEGER NULL;
