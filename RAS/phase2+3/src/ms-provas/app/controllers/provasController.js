import { isEmptyObject, isNullOrUndefined } from "../utils.js";
import provasService from "../services/provasService.js";

export const getProvas = async (req, res) => {
  const { num_mec, nome } = req.query;

  try {
    const provas = await provasService.getProvas(num_mec, nome);
    res.status(200).json({ data: provas });
  } catch (error) {
    console.error("Erro ao obter provas:", error.message);
    res.status(500).json({ error: `Erro ao obter provas: ${error.message}` });
  }
};

export const createProva = async (req, res) => {
  const { nome, duracao, numDocente } = req.body;
  const fieldsToCheck = ["nome", "duracao", "numDocente"];

  try {
    // verificar se os campos não sao null
    for (const field of fieldsToCheck) {
      if (isNullOrUndefined(req.body[field])) {
        throw new Error(`${field} is null or undefined`);
      }
    }

    const provaData = {
      nome: nome,
      duracao: duracao,
      backtrack: false,
      random: false,
      estado: 0,
    };

    // Criar a Prova
    const prova = await provasService.createProva(provaData, numDocente);

    res.status(201).json({ data: prova });
  } catch (error) {
    console.error("Erro ao criar prova:", error.message);
    res.status(500).json({ error: `Erro ao criar prova: ${error.message}` });
  }
};

export const getProvaById = async (req, res) => {
  const { id } = req.params;

  try {
    const prova = await provasService.getProva(parseInt(id));
    if (prova) {
      res.json(prova);
    } else {
      res.status(404).json({ message: "Prova não encontrada" });
    }
  } catch (error) {
    console.error("Erro ao obter detalhes da prova:", error);
    res.status(500).json({ error: "Erro ao obter detalhes da prova" });
  }
};

export const updateProvaById = async (req, res) => {
  const { id } = req.params;
  let updatedProva = {};
  try {
    const fieldsToCheck = ["nome", "duracao", "backtrack", "random", "estado"];
    // verificar se os campos não sao null
    for (const field of fieldsToCheck) {
      if (!isNullOrUndefined(req.body[field])) {
        updatedProva[field] = req.body[field];
      }
    }

    if (isEmptyObject(updatedProva)) {
      res.status(200).json({ message: "Prova não alterada" });
    }

    updatedProva = await provasService.updateProvaById(
      updatedProva,
      parseInt(id),
    );

    res.status(200).json({ data: updatedProva });
  } catch (error) {
    console.error("Erro ao atualizar a prova:", error);
    res.status(500).json({ error: "Erro ao atualizar a prova" });
  }
};

export const getClassificacoesById = async (req, res) => {
  const { id } = req.params;

  try {
    const classificacoes = await provasService.getClassificacoes(parseInt(id));
    res.status(200).json({ data: classificacoes });
  } catch (error) {
    console.error("Erro ao obter as classificações:", error.message);
    res
      .status(500)
      .json({ error: `Erro ao obter as classificações: ${error.message}` });
  }
};

export const publishClassificacoesById = async (req, res) => {
  const { id } = req.params;

  try {
    await provasService.publishClassificacoes(parseInt(id));
    res.status(200).json({ message: "Classificações publicadas com sucesso" });
  } catch (error) {
    console.error("Erro ao publicar as classificações:", error.message);
    res
      .status(500)
      .json({ error: `Erro ao publicar as classificações: ${error.message}` });
  }
};

export const correcaoAutomatica = async (req, res) => {
  const { id } = req.params;
  try {
    const classificacoes = await provasService.correctaoAutomatica(id);
    const dataArray = Array.from(classificacoes.entries()).map(
      ([aluno, classificacao]) => {
        return { aluno, classificacao };
      },
    );
    res.status(200).json({ data: dataArray });
  } catch (error) {
    console.error("Erro ao corrigir a prova automaticamente:", error.message);
    res.status(500).json({
      error: `Erro ao corrigir a prova automaticamente: ${error.message}`,
    });
  }
};
