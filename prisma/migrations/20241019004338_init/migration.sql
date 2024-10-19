-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NULL,
    `prenom` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('SUPER_ADMIN', 'ADMIN') NOT NULL DEFAULT 'ADMIN',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Student` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `prenom` VARCHAR(191) NOT NULL,
    `birthDate` DATETIME(3) NOT NULL,
    `genre` VARCHAR(191) NOT NULL,
    `classId` INTEGER NOT NULL,
    `inscription` VARCHAR(191) NOT NULL,
    `telephone` VARCHAR(191) NOT NULL,
    `ecoleOrigine` VARCHAR(191) NOT NULL,
    `picture` VARCHAR(191) NULL,
    `depart` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Class` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `niveauScolaire` ENUM('Primaire', 'College', 'Lycee', 'Formation') NOT NULL,
    `niveauClasse` VARCHAR(191) NOT NULL,
    `group` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `paymentDate` DATETIME(3) NOT NULL,
    `frais_ins` DOUBLE NOT NULL,
    `septembre` ENUM('PAID', 'UNPAID', 'PENDING') NOT NULL,
    `octobre` ENUM('PAID', 'UNPAID', 'PENDING') NOT NULL,
    `novembre` ENUM('PAID', 'UNPAID', 'PENDING') NOT NULL,
    `decembre` ENUM('PAID', 'UNPAID', 'PENDING') NOT NULL,
    `janvier` ENUM('PAID', 'UNPAID', 'PENDING') NOT NULL,
    `fevrier` ENUM('PAID', 'UNPAID', 'PENDING') NOT NULL,
    `mars` ENUM('PAID', 'UNPAID', 'PENDING') NOT NULL,
    `avril` ENUM('PAID', 'UNPAID', 'PENDING') NOT NULL,
    `mai` ENUM('PAID', 'UNPAID', 'PENDING') NOT NULL,
    `juin` ENUM('PAID', 'UNPAID', 'PENDING') NOT NULL,
    `juillet` ENUM('PAID', 'UNPAID', 'PENDING') NOT NULL,
    `aout` ENUM('PAID', 'UNPAID', 'PENDING') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Student` ADD CONSTRAINT `Student_classId_fkey` FOREIGN KEY (`classId`) REFERENCES `Class`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
