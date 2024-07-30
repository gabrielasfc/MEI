const axios = require('axios');
const env = require('../config/env')

module.exports.byUserMec = (mec) => {
    return axios.get(env.notificacoesRoute(`/notificacoes/${mec}`))
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}

module.exports.deleteNotification = (mec) => {
    return axios.delete(env.notificacoesRoute(`/notificacoes/${mec}`))
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}

module.exports.readNotification = (id,read) => {
    return axios.put(env.notificacoesRoute(`/notificacoes/${id}/${read}`))
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}

module.exports.addNotification = (body) => {
    return axios.post(env.notificacoesRoute('/notificacoes/'), body)
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}

module.exports.sendEmail = (body) => {
    return axios.post(env.notificacoesRoute('/notificacoes/sendEmail'), body)
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}


