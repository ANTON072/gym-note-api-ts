/*
  Warnings:

  - A unique constraint covering the columns `[user_id,name]` on the table `exercises` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `exercises_user_id_name_key` ON `exercises`(`user_id`, `name`);
