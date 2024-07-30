import { PrismaClient } from "@prisma/client";
import { isNullOrUndefined } from "../utils.js";

const prisma = new PrismaClient();

const versoesService = {
  saveResolucao: async (respostaData) => {
    const resposta = await prisma.resposta.create({
      data: {
        num_mec: respostaData.numMec,
        id_questao: parseInt(respostaData.numQuestao),
        resposta: respostaData.resposta,
      },
    });

    await prisma.versao_has_Aluno.update({
      where: {
        id_versao_num_mec: {
          id_versao: parseInt(respostaData.versaoId),
          num_mec: respostaData.numMec,
        },
      },
      data: {
        estado: respostaData.estado,
      },
    });
    return resposta;
  },

  findVersaoByProvaId(provaId, numVersao) {
    if (isNullOrUndefined(provaId) || isNullOrUndefined(numVersao)) return null;

    return prisma.versao.findFirst({
      where: {
        id_prova: parseInt(provaId),
        num_versao: parseInt(numVersao),
      },
    });
  },

  async addQuestao(questao, id) {
    if (isNullOrUndefined(questao) || isNullOrUndefined(id)) return null;
    await prisma.questao.create({
      data: {
        tipo: questao.tipo,
        imagem: questao.imagem,
        descricao: questao.descricao,
        cotacao: questao.cotacao,
        solucao: questao.solucao,
        id_versao: id
      }
    });
  },

  async findClassificacoesByNumMec(numMec) {
    if (isNullOrUndefined(numMec)) return null;

    // Retrieve Versao_has_Aluno records for the given num_mec
    const versaoHasAlunoForNumMec = await prisma.versao_has_Aluno.findMany({
      where: {
        num_mec: numMec,
      },
      include: {
        Versao: {
          include: {
            Prova: true,
          },
        },
      },
    });

    // Create a hashmap where the key is the Prova object and the value is classificacao
    const provaClassificacaoMap = new Map();

    versaoHasAlunoForNumMec.forEach((vha) => {
      const prova = vha.Versao.Prova.nome;
      const classificacao = vha.classificacao;

      provaClassificacaoMap.set(prova, classificacao);
    });

    return provaClassificacaoMap;
  },
  async findCorrecoesById(id, numMec) {
    return prisma.questao.findMany({
      where: {
        id_versao: id,
        Resposta: {
          some: {
            num_mec: numMec,
          },
        },
      },
      include: {
        Resposta: {
          where: {
            num_mec: numMec,
          },
        },
      },
    });
  },

  updateCorrecao: async (id_versao, num_mec, correcoes) => {
    // check if versao exists
    const versao = await prisma.versao.findUnique({
      where: {
        id_versao: id_versao,
      },
    });

    if (!versao) {
      throw new Error(`Versao com id ${id_versao} não existe`);
    }

    // check if aluno exists
    const aluno = await prisma.aluno.findUnique({
      where: {
        num_mec: num_mec,
      },
    });

    if (!aluno) {
      throw new Error(`Aluno com número mecanográfico ${num_mec} não existe`);
    }

    console.log(correcoes);
    // update cotacoes
    // correcao = { id_resposta, cotacao }
    await Promise.all(
      correcoes.map((correcao) =>
        prisma.resposta.update({
          where: {
            id_resposta: correcao.id_resposta,
          },
          data: {
            cotacao: correcao.cotacao,
          },
        }),
      ),
    );

    // get all the ids of the questoes of that versão
    const questoes = await prisma.questao.findMany({
      where: {
        id_versao: id_versao,
      },
      select: {
        id_questao: true,
      },
    });

    // get all the cotações from the questoes of that aluno
    const cotacoes = await prisma.resposta.findMany({
      where: {
        id_questao: { in: questoes.map((questao) => questao.id_questao) },
      },
      select: {
        cotacao: true,
      },
    });

    // check if all the questoes have a cotacao, verify if none of them is null
    if (cotacoes.some((cotacao) => cotacao.cotacao === null)) {
      throw new Error(`Ainda existem questões por corrigir`);
    }

    // calculate the classificacao
    const classificacao = cotacoes.reduce((acc, curr) => acc + curr.cotacao, 0);

    // update classificacao
    await prisma.versao_has_Aluno.update({
      where: {
        id_versao_num_mec: {
          id_versao: id_versao,
          num_mec: num_mec,
        },
      },
      data: {
        classificacao: classificacao,
        estado: 1, // 1 = corrigido
      },
    });
  },

  createVersao: async (versaoData, numAlunos) => {
    // Criar versão
    const versao = await prisma.versao.create({
      data: versaoData,
    });

    // Adicionar alunos à versão
    await versoesService.addAlunos(versao, numAlunos);

    return versao;
  },

  addAlunos: async (versao, numAlunos) => {
    // verificar se os alunos existem
    for (let numAluno of numAlunos) {
      const aluno = await prisma.aluno.findUnique({
        where: {
          num_mec: numAluno,
        },
      });

      // caso não exista aluno criá-lo
      if (!aluno) {
        await prisma.aluno.create({
          data: {
            num_mec: numAluno,
          },
        });
      }

      // Adicionar aluno à versão
      await prisma.versao_has_Aluno.create({
        data: {
          id_versao: versao.id_versao,
          num_mec: numAluno,
          estado: 0,
        },
      });
    }
  },

  getDocentesBySala: async (idSala) => {
    // obter todas as versões da sala
    const versoes = await prisma.versao.findMany({
      where: {
        id_sala: idSala,
      },
    });

    // obter todos os docentes das versões
    let docentes = [];
    for (let versao of versoes) {
      const provasDocentes = await prisma.prova_has_Docente.findMany({
        where: {
          id_prova: versao.id_prova,
        },
        include: {
          Docente: true,
        },
      });

      for (let provaDocente of provasDocentes) {
        docentes.push(provaDocente.Docente);
      }
    }

    // remover docentes duplicados
    docentes = [
      ...new Set(docentes.map((docente) => JSON.stringify(docente))),
    ].map((s) => JSON.parse(s));

    return docentes;
  },

  updateSala: async (idSala, idNovaSala) => {
    // obter todas as versões da sala
    const versoes = await prisma.versao.findMany({
      where: {
        id_sala: idSala,
      },
    });

    // atualizar as versões
    for (let versao of versoes) {
      await prisma.versao.update({
        where: {
          id_versao: versao.id_versao,
        },
        data: {
          id_sala: idNovaSala,
        },
      });
    }
  },

  getVersaoAluno: async (provaId, numMec) => {
    const temp = await prisma.versao_has_Aluno.findFirst({
      where: {
        num_mec: numMec,
        Versao: {
          id_prova: provaId,
        },
      },
    });

    return prisma.versao.findFirst({
      where: {
        id_versao: temp.id_versao,
      },
      include: {
        Questao: {
          select: {
            id_questao: true,
            tipo: true,
            imagem: true,
            descricao: true,
            cotacao: true,
          },
        },
      },
    });
  },


  getVersoes: async (provaId) => {
    const versoes = await prisma.Versao.findMany({
      where: {
	id_prova: provaId
      },
      include: {
	Versao_has_Aluno: {
	   select: {
             num_mec: true
	   }
	}
      }
    });
    return versoes.map(versao => ({
    ...versao,
    num_mec: versao.Versao_has_Aluno.map(v => v.num_mec)
    })).map(versao => {
    delete versao.Versao_has_Aluno; // Remover a estrutura aninhada
    return versao;
    });	  
  },

  getQuestoes: async (idVersao) => {
    return await prisma.Questao.findMany({
      where: {
        id_versao: idVersao
      }
    })
  }
};

export default versoesService;
