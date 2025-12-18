/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `exercises` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `training_sessions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `exercises` DROP COLUMN `deleted_at`;

-- AlterTable
ALTER TABLE `training_sessions` DROP COLUMN `deleted_at`;
