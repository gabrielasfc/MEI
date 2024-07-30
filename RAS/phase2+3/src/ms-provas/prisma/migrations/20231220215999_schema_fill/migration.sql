-- Povoa a tabela Docente
INSERT INTO Docente (num_mec)
VALUES ('12345');

-- Povoa a tabela Aluno
INSERT INTO Aluno (num_mec)
VALUES ('67890');

-- Povoa a tabela Prova
INSERT INTO Prova (nome, duracao)
VALUES ('Prova 1', 120);

-- Povoa a tabela Prova_has_Docente
INSERT INTO Prova_has_Docente (id_prova, num_mec)
VALUES (1, '12345');

-- Povoa a tabela Versao
INSERT INTO Versao (id_prova, id_sala, horario, num_versao)
VALUES (1, 101, '2022-02-15 09:30:00', 1);

-- Povoa a tabela Versao_has_Aluno
INSERT INTO Versao_has_Aluno (id_versao, num_mec, classificacao, estado)
VALUES (1, '67890', NULL, 1);

-- Povoa a tabela Questao
INSERT INTO Questao (tipo, imagem, descricao, cotacao, id_versao)
VALUES (1, NULL, 'Questão 1', 10.0, 1);

-- Povoa a tabela Resposta
INSERT INTO Resposta (num_mec, id_questao, cotacao, resposta)
VALUES ('67890', 1, NULL, '{
  "resposta": "texto da resposta"
}');
