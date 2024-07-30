import { PrismaClient } from "@prisma/client";
import { isNullOrUndefined } from "../utils.js";

const prisma = new PrismaClient();

const provasService = {
  getProva: async (id) => {
    // get prova
    return prisma.prova.findUnique({
      where: {
        id_prova: parseInt(id),
      },
      include: {
        Versao: {
          include: {
            Versao_has_Aluno: true,
          },
        },
      },
    });
  },

  getProvas: async (num_mec, nomeProva) => {
    const docente = await prisma.docente.findUnique({where: {num_mec: num_mec}});
    const aluno = await prisma.aluno.findUnique({where: {num_mec: num_mec}});
	
    let whereClause = {};
    let includeClause = {};

    if (docente) {
      // num_mec pertence a um docente
      whereClause = {
        Prova_has_Docente: {
          some: { num_mec: num_mec }
        }
      };
      // incluir as salas de todas as versões da prova
      includeClause = {
        Versao: {
          select: {
            id_sala: true
          }
        }
      };
    } else if (aluno) {
      // num_mec pertence a um aluno
      whereClause = {
        Versao: {
          some: {
            Versao_has_Aluno: {
              some: { num_mec: num_mec }
            }
          }
        }
      };
      // Inclua informações da prova quando um aluno está buscando
      includeClause = {
        Versao: true
      };
    }	    

   if (nomeProva) {
     whereClause = {
       ...whereClause,
       AND: whereClause.AND ? [...whereClause.AND, { nome: { contains: nomeProva } }] : { nome: { contains: nomeProva } }
     }
   }

   return prisma.prova.findMany({
     where: whereClause,
     include: includeClause
   })
  },

  getClassificacoes: async (id) => {
    // check if prova exists
    const prova = await prisma.prova.findUnique({
      where: {
        id_prova: id,
      },
    });

    if (!prova) {
      throw new Error(`Prova com id ${id} não existe`);
    }

    const versoes = await prisma.versao.findMany({
      where: { id_prova: id },
      include: {
        Versao_has_Aluno: {
          select: {
            num_mec: true,
            classificacao: true,
            id_versao: true,
          },
        },
      },
    });

    const classificacoes = versoes.flatMap((versao) =>
      versao.Versao_has_Aluno.map((va) => ({
        id_aluno: va.num_mec,
        id_versao: va.id_versao,
        classificacao: va.classificacao,
      })),
    );

    return classificacoes;
  },

  publishClassificacoes: async (id) => {
    // check if prova exists
    const prova = await prisma.prova.findUnique({
      where: {
        id_prova: id,
      },
    });

    if (!prova) {
      throw new Error(`Prova com id ${id} não existe`);
    }

    // check if all the exams are corrected
    const versoes = await prisma.versao.findMany({
      where: {
        id_prova: id,
        Versao_has_Aluno: {
          some: {
            classificacao: null,
          },
        },
      },
    });

    if (versoes.length > 0) {
      throw new Error(`Existem ${versoes.length} provas por corrigir`);
    }

    await prisma.prova.update({
      where: { id_prova: id },
      data: { estado: 1 }, // 1 = publicado
    });
  },

  updateProvaById: async (prova, id) => {
    return prisma.prova.update({
      where: { id_prova: id },
      data: prova,
    });
  },

  createProva: async (provaData, numDocente) => {
    // Criar prova
    const prova = await prisma.prova.create({
      data: provaData,
    });

    // Adicionar docente à prova
    await provasService.addDocente(prova, numDocente);

    return prova;
  },

  addDocente: async (prova, numDocente) => {
    // check if docente exists
    let docente = await prisma.docente.findUnique({
      where: {
        num_mec: numDocente,
      },
    });

    // caso não exista docente criá-lo
    if (!docente) {
      docente = await prisma.docente.create({
        data: {
          num_mec: numDocente,
        },
      });
    }

    // Adicionar docente à prova
    await prisma.prova_has_Docente.create({
      data: {
        id_prova: prova.id_prova,
        num_mec: docente.num_mec,
      },
    });
  },
  async correctaoAutomatica(id) {
    if (isNullOrUndefined(id)) {
      throw new Error("id cannot be null or undefined");
    }

    //1. buscar versoes associadas a prova
    //2. buscar todos os alunos associados a prova
    const versoes = await prisma.versao.findMany({
      where: { id_prova: parseInt(id) },
      include: {
        Versao_has_Aluno: {
          select: {
            num_mec: true,
            classificacao: true,
            id_versao: true,
          },
        },
        Questao: {
          select: {
            tipo: true,
            id_questao: true,
            cotacao: true,
            solucao: true,
          },
        },
      },
    });

    const classificacoes = new Map();

    // para cada versao tratar dos seus alunos
    for (const versao of versoes) {
      if (versao.Questao.length === 0) continue;
      for (const aluno of versao.Versao_has_Aluno) {
        const respostas = await prisma.resposta.findMany({
          where: {
            num_mec: aluno.num_mec,
          },
        });
        if (respostas.length === 0) continue;
        //3. para cada aluno comparar Questao solucao e Resposta resposta e update Resposta cotacao,
        // no final sum da cotacao e update na classificacao em versao has aluno
        const classificacao = await provasService.correcao(
          aluno,
          versao,
          respostas,
        );
        classificacoes.set(aluno.num_mec, classificacao);
      }
    }
    //4. devolver numMec + classificacao na prova (mapa)
    return classificacoes;
  },

  async correcao(aluno, versao, respostas) {
    let classificacao = 0.0;
    for (let i = 0; i < versao.Questao.length; i++) {
      for (let j = 0; j < respostas.length; j++) {
        if (versao.Questao[i].id_questao !== respostas[j].id_questao) continue;
        if (
          JSON.stringify(versao.Questao[i].solucao) !==
          JSON.stringify(respostas[j].resposta)
        )
          continue;
        // atualizar classificacao na resposta
        await prisma.resposta.update({
          where: {
            id_resposta: respostas[j].id_questao,
          },
          data: {
            cotacao: versao.Questao[i].cotacao,
          },
        });
        classificacao += versao.Questao[i].cotacao;
      }
    }
    // atualizar classificacao global
    await prisma.versao_has_Aluno.update({
      where: {
        id_versao_num_mec: {
          id_versao: versao.id_versao,
          num_mec: aluno.num_mec,
        },
      },
      data: {
        classificacao: classificacao,
      },
    });

    return classificacao;
  },
};

export default provasService;
