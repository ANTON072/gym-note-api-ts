-- DropForeignKey
ALTER TABLE `exercises` DROP FOREIGN KEY `exercises_user_id_fkey`;

-- AlterTable
ALTER TABLE `exercises` ADD COLUMN `is_preset` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `user_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `exercises` ADD CONSTRAINT `exercises_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
