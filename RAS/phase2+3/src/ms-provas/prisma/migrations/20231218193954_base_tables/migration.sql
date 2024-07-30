/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `User`;

-- CreateTable
CREATE TABLE `Docente`
(
    `num_mec` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`num_mec`)
) DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Aluno`
(
    `num_mec` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`num_mec`)
) DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Prova`
(
    `id_prova`  INTEGER     NOT NULL AUTO_INCREMENT,
    `nome`      VARCHAR(45) NOT NULL,
    `duracao`   INTEGER     NOT NULL,
    `backtrack` BOOLEAN     NOT NULL,
    `random`    BOOLEAN     NOT NULL,
    `estado`    INTEGER     NOT NULL,

    PRIMARY KEY (`id_prova`)
) DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Prova_has_Docente`
(
    `id_prova` INTEGER     NOT NULL,
    `num_mec`  VARCHAR(45) NOT NULL,

    PRIMARY KEY (`id_prova`, `num_mec`)
) DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Prova_has_Aluno`
(
    `id_prova`      INTEGER     NOT NULL,
    `num_mec`       VARCHAR(45) NOT NULL,
    `classificacao` DOUBLE      NULL,
    `estado`        INTEGER     NOT NULL,

    PRIMARY KEY (`id_prova`, `num_mec`)
) DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Versao`
(
    `id_versao`  INTEGER     NOT NULL AUTO_INCREMENT,
    `id_prova`   INTEGER     NOT NULL,
    `id_sala`    INTEGER     NOT NULL,
    `horario`    DATETIME(3) NOT NULL,
    `num_versao` INTEGER     NOT NULL,

    PRIMARY KEY (`id_versao`)
) DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Questao`
(
    `id_questao` INTEGER      NOT NULL AUTO_INCREMENT,
    `tipo`       INTEGER      NOT NULL,
    `imagem`     MEDIUMTEXT   NULL,
    `descricao`  VARCHAR(191) NOT NULL,
    `cotacao`    DOUBLE       NULL,
    `id_versao`  INTEGER      NOT NULL,
    `solucao`    JSON         NULL,

    PRIMARY KEY (`id_questao`)
) DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Resposta`
(
    `id_resposta` INTEGER     NOT NULL AUTO_INCREMENT,
    `num_mec`     VARCHAR(45) NOT NULL,
    `id_questao`  INTEGER     NOT NULL,
    `cotacao`     DOUBLE      NULL,
    `resposta`    JSON        NULL,

    PRIMARY KEY (`id_resposta`)
) DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Prova_has_Docente`
    ADD CONSTRAINT `Prova_has_Docente_num_mec_fkey` FOREIGN KEY (`num_mec`) REFERENCES `Docente` (`num_mec`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Prova_has_Docente`
    ADD CONSTRAINT `Prova_has_Docente_id_prova_fkey` FOREIGN KEY (`id_prova`) REFERENCES `Prova` (`id_prova`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Prova_has_Aluno`
    ADD CONSTRAINT `Prova_has_Aluno_num_mec_fkey` FOREIGN KEY (`num_mec`) REFERENCES `Aluno` (`num_mec`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Prova_has_Aluno`
    ADD CONSTRAINT `Prova_has_Aluno_id_prova_fkey` FOREIGN KEY (`id_prova`) REFERENCES `Prova` (`id_prova`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Versao`
    ADD CONSTRAINT `Versao_id_prova_fkey` FOREIGN KEY (`id_prova`) REFERENCES `Prova` (`id_prova`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Questao`
    ADD CONSTRAINT `Questao_id_versao_fkey` FOREIGN KEY (`id_versao`) REFERENCES `Versao` (`id_versao`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Resposta`
    ADD CONSTRAINT `Resposta_num_mec_fkey` FOREIGN KEY (`num_mec`) REFERENCES `Aluno` (`num_mec`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Resposta`
    ADD CONSTRAINT `Resposta_id_questao_fkey` FOREIGN KEY (`id_questao`) REFERENCES `Questao` (`id_questao`) ON DELETE RESTRICT ON UPDATE CASCADE;
