import { isNullOrUndefined } from "../utils.js";
import versoesService from "../services/versoesService.js";

export const createVersao = async (req, res) => {
  const { idProva, versaoNum, idSala, horaInicio, idAlunos } = req.body;
  const fieldsToCheck = [
    "idProva",
    "versaoNum",
    "idSala",
    "horaInicio",
    "idAlunos",
  ];

  try {
    // verificar se os campos não sao null
    for (const field of fieldsToCheck) {
      if (isNullOrUndefined(req.body[field])) {
        throw new Error(`${field} is null or undefined`);
      }
    }

    const versaoData = {
      id_prova: idProva,
      id_sala: idSala,
      horario: horaInicio,
      num_versao: versaoNum,
    };

    // Criar a Versão
    const versao = await versoesService.createVersao(versaoData, idAlunos);

    res.status(201).json({ data: versao });
  } catch (error) {
    console.error("Erro ao criar versão:", error.message);
    res.status(500).json({ error: `Erro ao criar versão: ${error.message}` });
  }
};

export const createQuestoes = async (req, res) => {
  const { id } = req.params;

  const { questoes } = req.body;

  try {
    if (isNullOrUndefined(questoes)) {
      throw new Error(`${questoes} is null or undefined`);
    }
    
    for (const questao of questoes) {
      await versoesService.addQuestao(questao, parseInt(id));
    }
    res.status(201).json({ response: "Questões criadas com sucesso" });
  } catch (error) {
    console.error("Erro ao criar as questões:", error.message);
    res
      .status(500)
      .json({ error: `Erro ao criar as questões: ${error.message}` });
  }
};

export const getDocentesBySala = async (req, res) => {
  const { idSala } = req.params;

  try {
    const docentes = await versoesService.getDocentesBySala(idSala);
    if (docentes) {
      res.json(docentes);
    } else {
      res.status(404).json({ message: "Docentes não encontrados" });
    }
  } catch (error) {
    console.error("Erro ao obter docentes da sala:", error);
    res.status(500).json({ error: "Erro ao obter docentes da sala" });
  }
};

export const updateSalas = async (req, res) => {
  const { idSala, idNovaSala } = req.body;

  try {
    if (isNullOrUndefined(idNovaSala)) {
      throw new Error(`${idNovaSala} is null or undefined`);
    }

    const isUpdated = await versoesService.updateSala(idSala, idNovaSala);

    if (!isUpdated) {
      res.status(404).json({ message: "Sala não encontrada" });
      return;
    }

    res.status(200).json({ message: "Sala atualizada" });
  } catch (error) {
    console.error("Erro ao obter versão:", error);
    res.status(500).json({ error: "Erro ao obter sala" });
  }
};

export const updateResolucaoById = async (req, res) => {
  const { id, numMec, numQuestao } = req.params;
  const { estado, resposta } = req.body;

  const fieldsToCheck = ["estado", "resposta"];

  try {
    // verificar se os campos não sao null
    for (const field of fieldsToCheck) {
      if (isNullOrUndefined(req.body[field])) {
        throw new Error(`${field} is null or undefined`);
      }
    }

    const respostaData = {
      estado: estado,
      resposta: resposta,
      versaoId: id,
      numMec: numMec,
      numQuestao: numQuestao,
    };

    res
      .status(201)
      .json({ data: await versoesService.saveResolucao(respostaData) });
  } catch (error) {
    console.error("Erro ao adicionar resposta:", error.message);
    res
      .status(500)
      .json({ error: `Erro ao adicionar resposta: ${error.message}` });
  }
};

export const getCorrecoesById = async (req, res) => {
  const { id, numMec } = req.param;

  try {
    const data = await versoesService.findCorrecoesById(id, numMec);
    const dataArray = Array.from(data.entries()).map(([questao, resposta]) => {
      return { questao, resposta };
    });
    res.status(200).json({ data: dataArray });
  } catch (error) {
    console.error("Erro ao buscar correções:", error.message);
    res
      .status(500)
      .json({ error: `Erro ao buscar correções: ${error.message}` });
  }
};

export const updateCorrecoesById = async (req, res) => {
  const { id, numMec } = req.params;
  const { correcoes } = req.body;

  try {
    await versoesService.updateCorrecao(parseInt(id), numMec, correcoes);
    res.status(200).json({ message: "Cotações atualizadas com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar as cotações:", error.message);
    res
      .status(500)
      .json({ error: `Erro ao atualizar as cotações: ${error.message}` });
  }
};

export const getClassificacoesByNumMec = async (req, res) => {
  const { numMec } = req.params;
  try {
    const data = await versoesService.findClassificacoesByNumMec(numMec);

    res.status(200).json({ data: data });
  } catch (error) {
    console.error("Erro ao buscar classificacões:", error.message);
    res
      .status(500)
      .json({ error: `Erro ao buscar classificacões: ${error.message}` });
  }
};

export const getVersaoAluno = async (req, res) => {
  const { provaId, numMec } = req.params;

  try {
    const versao = await versoesService.getVersaoAluno(
      parseInt(provaId),
      numMec,
    );

    if (versao) {
      res.json(versao);
    } else {
      res.status(404).json({ message: "Versão não encontrada" });
    }
  } catch (error) {
    console.error("Erro ao obter versão:", error);
    res.status(500).json({ error: "Erro ao obter versão" });
  }
};

export const getVersoes = async (req,res) => {
   const { id } = req.params;
   
   try {
     const versoes = await versoesService.getVersoes(parseInt(id));
     res.status(200).json(versoes);
   }
   catch (error) {
     console.log(error)  
     res.status(500).json({error: "Erro ao obter versões" }); 	   
   }

}

export const getQuestoes = async (req,res) => {
  const { id } = req.params;
  try {
    const questoes = await versoesService.getQuestoes(parseInt(id));
    res.status(200).json(questoes);
  }
  catch (error) {
    console.log(error)
    res.status(500).json({error:"Erro ao obter questões"});	   
  }
}
