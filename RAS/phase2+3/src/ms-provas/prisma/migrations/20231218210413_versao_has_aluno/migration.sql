/*
  Warnings:

  - You are about to drop the `Prova_has_Aluno` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Prova_has_Aluno`
    DROP FOREIGN KEY `Prova_has_Aluno_id_prova_fkey`;

-- DropForeignKey
ALTER TABLE `Prova_has_Aluno`
    DROP FOREIGN KEY `Prova_has_Aluno_num_mec_fkey`;

-- DropTable
DROP TABLE `Prova_has_Aluno`;

-- CreateTable
CREATE TABLE `Versao_has_Aluno`
(
    `id_versao`     INTEGER     NOT NULL,
    `num_mec`       VARCHAR(45) NOT NULL,
    `classificacao` DOUBLE      NULL,
    `estado`        INTEGER     NOT NULL,

    PRIMARY KEY (`id_versao`, `num_mec`)
) DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Versao_has_Aluno`
    ADD CONSTRAINT `Versao_has_Aluno_num_mec_fkey` FOREIGN KEY (`num_mec`) REFERENCES `Aluno` (`num_mec`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Versao_has_Aluno`
    ADD CONSTRAINT `Versao_has_Aluno_id_versao_fkey` FOREIGN KEY (`id_versao`) REFERENCES `Versao` (`id_versao`) ON DELETE RESTRICT ON UPDATE CASCADE;
