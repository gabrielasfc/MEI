// MS-Salas
module.exports.salasAccessPoint = process.env.SALAS || 'http://localhost:8073/api' // alterar aqui a porta 

module.exports.salasRoute = (route) => this.salasAccessPoint + route 

// MS-Provas
module.exports.provasAccessPoint = process.env.PROVAS || 'http://localhost:8075/api' // alterar aqui a porta

module.exports.provasRoute = (route) => this.provasAccessPoint + route 

// MS-Utilizadores
module.exports.utilizadoresAccessPoint = process.env.UTILIZADORES || 'http://localhost:8072/api' // alterar aqui a porta

module.exports.utilizadoresRoute = (route) => this.utilizadoresAccessPoint + route 

// MS-Notificações
module.exports.notificacoesAccessPoint = process.env.NOTIFICACOES || 'http://localhost:8074/api' // alterar aqui a porta

module.exports.notificacoesRoute = (route) => this.notificacoesAccessPoint + route 