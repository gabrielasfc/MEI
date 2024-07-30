-- AlterTable
ALTER TABLE `Resposta`
    MODIFY `cotacao` DOUBLE NULL DEFAULT 0.0;

-- AlterTable
ALTER TABLE `Versao_has_Aluno`
    MODIFY `classificacao` DOUBLE NULL DEFAULT 0.0;
