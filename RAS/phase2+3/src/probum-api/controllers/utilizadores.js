const axios = require('axios');
const env = require('../config/env')

module.exports.register = async (body) => {
  try {
    const {name, email} = body
    const result =
      await axios.post(env.utilizadoresRoute('/utilizadores/register'), body);
    // Notificar novo user
    const receiverList = []
    receiverList.push({
      name: name,
      email: email
    })
    const data = {
      "receiverList": receiverList,
      "email": {
        "subject": "PROBUM: Bem-vindo",
        "body": "Registo no PROBUM com sucesso"
      }
    };

    // Serviço de notificacoes
    try {
      await axios.post(env.notificacoesRoute('/notificacoes/sendEmail'), data);
    } catch(err) {
      console.error("não foi possivel notificar registo")
      console.error(err)
    }
    return result;
  } catch (err) {
    throw err
  }
}

module.exports.registerFile = async (body) => {
  try {
    const result =
      await axios.post(env.utilizadoresRoute(`/utilizadores/registerFile`), body);
    const bodySubset = body.map(item => {
      return {
        name: item.name,
        email: item.email
      };
    });

    // Notificar novos users
    const receiverList = [];
    bodySubset.forEach(element => receiverList.push(element));
    const data = {
      "receiverList": receiverList,
      "email": {
        "subject": "PROBUM: Bem-vindo",
        "body": "Registo no PROBUM com sucesso"
      }
    };

    // Serviço de notificacoes
    try {
      await axios.post(env.notificacoesRoute('/notificacoes/sendEmail'), data);
    } catch(err) {
      console.error("não foi possivel notificar registo")
      console.error(err)
    }
    return result;
  } catch (err) {
    throw err;
  }
}

module.exports.login = (body) => {
    return axios.post(env.utilizadoresRoute('/utilizadores/login'), body)
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}

module.exports.getUserInfo = (numMec) => {
    return axios.get(env.utilizadoresRoute(`/utilizadores/${numMec}`))
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}

module.exports.getUsers = (type) => {
  if(type){
    return axios.get(env.utilizadoresRoute(`/utilizadores?type=${type}`))
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
  }
  else{
    return axios.get(env.utilizadoresRoute(`/utilizadores`))
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
  }
}

module.exports.changeUserInfo = (numMec, body) => {
    return axios.put(env.utilizadoresRoute(`/utilizadores/${numMec}`), body)
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}

module.exports.changeUserPassword = (numMec, body) => {
    return axios.put(env.utilizadoresRoute(`/utilizadores/${numMec}/password`), body)
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}

module.exports.deleteUser = (numMec) => {
  return axios.delete(env.utilizadoresRoute(`/utilizadores/${numMec}`))
      .then((result) => {
          return result
      }).catch((err) => {
          throw err
      });
}