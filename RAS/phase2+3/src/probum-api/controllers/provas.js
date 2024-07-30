const axios = require('axios');
const env = require('../config/env')

module.exports.shareProva = async (body) => {
  const {docentes} = body
  try {
    //TODO: Endpoint para validar docentes
    const responseUtilizadores = {}

    //TODO: endpoint retorna docentes da prova
    const responseProvas = {}

    const receiverList = [];

    const bodySubset = docentes.map(item => {
      return {
        name: item.name,
        email: item.email
      };
    });
    bodySubset.forEach(element => receiverList.push(element));
    const data = {
      "receiverList": receiverList,
      "email": {
        "subject": `Prova Partilhada`,
        "body": "Foi partilhado uma prova"
      }
    };

    // Serviço de notificacoes
    try {
      await axios.post(env.notificacoesRoute('/notificacoes/sendEmail'), data);
    } catch(err) {
      console.error("não foi possivel notificar partilha da prova")
      console.error(err)
    }
  } catch(err) {
    throw err
  }
}

module.exports.changeConfiguration = (id_prova, body) => {
    return axios.patch(env.provasRoute(`/provas/${id_prova}`), body)
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}

module.exports.createVersao = (body) => {
    return axios.post(env.provasRoute(`/versoes/`), body)
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}

module.exports.getVersoes = (id_prova) => {
    return axios.get(env.provasRoute(`/versoes/${id_prova}`))
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}


module.exports.getQuestoes = (numMec, id_prova) => {
    return axios.get(env.provasRoute(`/versoes/alunos/${numMec}/provas/${id_prova}`))
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}

module.exports.getQuestoesByVersao = (id_versao) => {
    return axios.get(env.provasRoute(`/versoes/questoes/${id_versao}`))
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}



// Não existe rota no serviço de provas que responda a este pedido
module.exports.putQuestoes = (id_prova, versao, body) => {
    return axios.patch(env.provasRoute(`/versoes/`), body)
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}

module.exports.addQuestoes = (id_versao, body) => {
    return axios.post(env.provasRoute(`/versoes/questoes/${id_versao}`), body)
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}

module.exports.createProva = (body) => {
    return axios.post(env.provasRoute(`/provas`), body)
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}

module.exports.updateProva = (id_prova, body) => {
    return axios.patch(env.provasRoute(`/provas/${id_prova}`), body)
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}

module.exports.getProvas = (numMec, nome) => {
  if(numMec && nome){
    return axios.get(env.provasRoute(`/provas?num_mec=${numMec}&nome=${nome}`))
      .then((result) => {
          return result
      }).catch((err) => {
          throw err
      });
  }
  else if(numMec){
    return axios.get(env.provasRoute(`/provas?num_mec=${numMec}`))
      .then((result) => {
          return result
      }).catch((err) => {
          throw err
      });
  }
  else if(nome){
    return axios.get(env.provasRoute(`/provas?nome=${nome}`))
      .then((result) => {
          return result
      }).catch((err) => {
          throw err
      });
  }
}

module.exports.getProvaById = async (idProva) => {
  try {
    // Prova
    const prova = await axios.get(env.provasRoute(`/provas/${idProva}`))
    const idSalas = prova.data.Versao.map(item => item.id_sala)
    // Salas
    let salas = []
    if (idSalas.length > 0) {
      const idSalasString = idSalas.join(',');
      const encodedIds = encodeURIComponent(idSalasString);
      const response = await axios.get(env.salasRoute(`/salas/ids?ids=${encodedIds}`))
      salas = response.data
    }
    // Alunos
    let alunos = []
    const numMecsArray = prova.data.Versao.flatMap(versao => versao.Versao_has_Aluno.map(item => item.num_mec));
    if (numMecsArray.length > 0) {
      const encodedNumMecs = encodeURIComponent(numMecsArray)
      const response = await axios.get(env.utilizadoresRoute(`/utilizadores/numMecs?numMecs=${encodedNumMecs}`))
      alunos = response.data
    }
    return {
      "prova": prova.data,
      "salas": salas,
      "alunos": alunos
    }
  } catch(err) {
    throw err
  }
}

module.exports.publicarClassificacoes = async(id_prova, body) => {
  const {alunos} = body

  try {
    const response =
      await axios.put(env.provasRoute(`/provas/${id_prova}/classificacoes/publicar`))
    if (response.status !== 200) throw new Error("nao foi possivel publicar classificacoes")

    // Notificar users
    const receiverList = [];
    const bodySubset = alunos.map(item => {
      return {
        name: item.name,
        email: item.email
      };
    });
    bodySubset.forEach(element => receiverList.push(element));
    const data = {
      "receiverList": receiverList,
      "email": {
        "subject": `PROBUM: Classificacoes disponíveis`,
        "body": "Consulta agora a tua classificacao no PROBUM"
      }
    };

    // Serviço de notificacoes
    try {
      await axios.post(env.notificacoesRoute('/notificacoes/sendEmail'), data);
    } catch(err) {
      console.error("não foi possivel notificar registo")
      console.error(err.message)
    }
  } catch(err) {
    throw err
  }
}

module.exports.correcaoAutomatica = async (idProva) => {
  try {
    return await axios.get(env.provasRoute(`/provas/${idProva}/correcaoAutomatica`))
  } catch(err) {
    throw err
  }
}
