-- DropForeignKey
ALTER TABLE `workout_exercises` DROP FOREIGN KEY `workout_exercises_workout_id_fkey`;

-- DropForeignKey
ALTER TABLE `workout_sets` DROP FOREIGN KEY `workout_sets_workout_exercise_id_fkey`;

-- DropIndex
DROP INDEX `workout_sets_workout_exercise_id_fkey` ON `workout_sets`;

-- AlterTable
ALTER TABLE `exercises` ADD COLUMN `deleted_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `workouts` ADD COLUMN `deleted_at` DATETIME(3) NULL;

-- AddForeignKey
ALTER TABLE `workout_exercises` ADD CONSTRAINT `workout_exercises_workout_id_fkey` FOREIGN KEY (`workout_id`) REFERENCES `workouts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_sets` ADD CONSTRAINT `workout_sets_workout_exercise_id_fkey` FOREIGN KEY (`workout_exercise_id`) REFERENCES `workout_exercises`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
