var express = require('express');
var router = express.Router();
var auth = require('../auth/auth')

const SALAS = require('../controllers/salas')
const PROVAS = require('../controllers/provas')
const UTILIZADORES = require('../controllers/utilizadores')
const NOTIFICACOES = require('../controllers/notificacoes')



// POSTS 
// Cria uma prova
router.post('/provas', auth.verificaDocente, function(req, res, next) {
	PROVAS.createProva(req.body)
		.then((result) => {
			res.status(200).jsonp(result.data)
		}).catch((err) => {
			res.status(401).jsonp(err)
		})
});


// Cria nova versao da prova
router.post('/versoes', auth.verificaDocente, function(req, res, next) {
	PROVAS.createVersao(req.body)
		.then((result) => {
			res.status(200).jsonp(result.data)
		}).catch((err) => {
			res.status(401).jsonp(err)
		})
});

// Adiciona questões a uma versão
router.post('/questoes/:id_versao', auth.verificaDocente, function(req, res, next) {
	PROVAS.addQuestoes(req.params.id_versao, req.body)
		.then((result) => {
			res.status(200).jsonp(result.data)
		}).catch((err) => {
			res.status(401).jsonp(err)
		})
});


// PUTS
//! Não existe rota no serviço de provas que responda a este pedido
// Edita as questões de uma versão
router.put('/questoes', auth.verificaDocente, function(req, res, next) {
	PROVAS.putQuestoes(req.query.id_prova, req.query.versao, req.body)
		.then((result) => {
			res.status(200).jsonp(result.data)
		}).catch((err) => {
			res.status(401).jsonp(err)
		})
});

// Publica as classificações de uma prova
router.put('/provas/:id_prova/classificacoes/publicar', auth.verificaDocente, (req, res) => {
	PROVAS.publicarClassificacoes(req.params.id_prova, req.body)
		.then(() => {
			res.status(200).jsonp("classificacoes publicadas com sucesso")
		}).catch((err) => {
		res.status(401).jsonp(err)
	})
})


// Edita a informação da prova pelo seu id
router.put('/provas/:id_prova', auth.verificaDocente, function(req, res, next) {
	PROVAS.updateProva(req.params.id_prova, req.body)
		.then((result) => {
			res.status(200).jsonp(result.data)
		}).catch((err) => {
			res.status(401).jsonp(err)
		})
});

//GETS
// Obtém as versões de uma prova
router.get('/versoes/:id_prova', auth.verificaAcesso, function(req, res, next) {
	PROVAS.getVersoes(req.params.id_prova)
		.then((result) => {
			res.status(200).jsonp(result.data)
		}).catch((err) => {
			res.status(401).jsonp(err)
		})
});

// Obtem as questões de uma versão
router.get('/questoes/:id_versao', auth.verificaAcesso, function(req, res, next) {
	PROVAS.getQuestoesByVersao(req.params.id_versao)
		.then((result) => {
			res.status(200).jsonp(result.data)
		}).catch((err) => {
			res.status(401).jsonp(err)
		})
});

// Get das questões de um aluno para uma prova
router.get('/questoes', auth.verificaAcesso, function(req, res, next) {
	PROVAS.getQuestoes(req.query.numMec, req.query.id_prova)
		.then((result) => {
			res.status(200).jsonp(result.data)
		}).catch((err) => {
			res.status(401).jsonp(err)
		})
});

// Corrige uma prova automaticamente
router.get('/provas/:id_prova/correcaoAutomatica', auth.verificaAcesso, (req, res) => {
	PROVAS.correcaoAutomatica(req.params.id_prova)
		.then((result) => {
			res.status(200).jsonp(result.data)
		}).catch((err) => {
		res.status(401).jsonp(err)
	})
})

// Devolve prova, salas e alunos
router.get('/provas/:id_prova', auth.verificaAcesso, (req, res) => {
	PROVAS.getProvaById(req.params.id_prova)
		.then((result) => {
			res.status(200).jsonp(result)
		}).catch((err) => {
		res.status(401).jsonp(err)
	})
})


// Obtém todas as provas a partir do num_mec e/ou nome 
router.get('/provas', auth.verificaAcesso, function(req, res, next) {
	const { num_mec , nome } = req.query

	PROVAS.getProvas(num_mec, nome)
		.then((result) => {
			res.status(200).jsonp(result.data)
		}).catch((err) => {
			res.status(401).jsonp(err)
		})
});

router.put('/provas/docentes', auth.verificaDocente, (req, res) => {
	PROVAS.shareProva(req.body)
		.then(() => {
			res.status(200).jsonp("prova partilhada com sucesso")
		}).catch((err) => {
		res.status(401).jsonp(err)
	})
})

//---------------------- MS-Salas ----------------------

// Retorna todas as salas do serviço de salas (Técnico)
router.get('/salas', auth.verificaDocenteTecnico, function(req, res, next) {
	SALAS.getSalasAvailable(req.query.startTime,req.query.endTime,req.query.numAlunos)
		.then((result) => {
			res.status(200).jsonp(result.data)
		}).catch((err) => {
			res.status(401).jsonp(err)
		})
});

// Adiciona salas ao serviço de salas (Técnico)
router.post('/salas/file', auth.verificaTecnico, function(req, res, next) {
	SALAS.addSalas(req.body)
		.then((result) => {
			res.status(200).jsonp(result.data)
		}).catch((err) => {
			res.status(401).jsonp(err)
		})
});

// Remove uma sala no serviço de salas (Técnico)
router.delete('/salas/:id_sala', auth.verificaTecnico, function(req, res, next) {
	SALAS.deleteSala(req.params.id_sala)
		.then((result) => {
			res.status(200).jsonp(result.data)
		}).catch((err) => {
			res.status(401).jsonp(err)
		})
});

// Faz a alocação de salas no serviço de salas (Docente ou Técnico)
router.put('/alocaSalas', auth.verificaDocenteTecnico, function(req, res, next) {
	SALAS.allocateSala(req.body)
		.then((result) => {
			res.status(200).jsonp(result.data)
		}).catch((err) => {
			res.status(401).jsonp(err)
		})
});

module.exports = router;



//---------------------- MS-Utilizadores ----------------------

// Faz o registo de um utilizador
router.post('/utilizadores/register', auth.verificaDocenteTecnico, function(req, res, next) {
	UTILIZADORES.register(req.body)
		.then((result) => {
			res.status(200).jsonp(result.data)
		}).catch((err) => {
			res.status(401).jsonp(err)
		})
});

// Faz o registo de contas através de um ficheiro (Técnico)
router.post('/utilizadores/registerFile', auth.verificaDocenteTecnico, function(req, res, next) {
	UTILIZADORES.registerFile(req.body)
		.then((result) => {
			res.status(200).jsonp(result.data)
		}).catch((err) => {
			res.status(401).jsonp(err)
		})
});

// Faz o login em uma conta da aplicação
router.post('/utilizadores/login', function(req, res, next) {
	UTILIZADORES.login(req.body)
		.then((result) => {
			res.status(200).jsonp(result.data)
		}).catch((err) => {
			res.status(401).jsonp(err)
		})
});

// Obtenção dos dados de um utilizador
router.get('/utilizadores/:numMec', auth.verificaAcesso, function(req, res, next) {
	try{
		if(req.params.numMec === req.idUser){
			UTILIZADORES.getUserInfo(req.params.numMec)
				.then((result) => {
					res.status(200).jsonp(result.data)
				}).catch((err) => {
					res.status(401).jsonp(err)
				})
		}
		else{
			throw({"Erro": "Não pode aceder aos dados deste utilizador!"})
		}
	}
	catch(err) {
		res.status(402).jsonp(err)
	}
});

// Obtenção dos dados de vários utilizadores
router.get('/utilizadores/', auth.verificaDocenteTecnico, function(req, res, next) {
	if(req.query.type){
		UTILIZADORES.getUsers(req.query.type)
			.then((result) => {
				res.status(200).jsonp(result.data)
			}).catch((err) => {
				res.status(401).jsonp(err)
			})
	}
	else{
		UTILIZADORES.getUsers()
			.then((result) => {
				res.status(200).jsonp(result.data)
			}).catch((err) => {
				res.status(401).jsonp(err)
			})
	}
});



// Alteração dos dados de um utilizador
router.put('/utilizadores/:numMec', auth.verificaAcesso, function(req, res, next) {
	try{
		if(req.params.numMec === req.idUser || req.type === 2){
			UTILIZADORES.changeUserInfo(req.params.numMec, req.body)
				.then((result) => {
					res.status(200).jsonp(result.data)
				}).catch((err) => {
					res.status(401).jsonp(err)
				})
			}
		else{
			throw({"Erro": "Não pode alterar os dados deste utilizador!"})
		}
	}
	catch(err) {
		res.status(402).jsonp(err)
	}
});

// Altera a password de um utilizador
router.put('/utilizadores/:numMec/password', auth.verificaAcesso, function(req, res, next) {
	try{
		if(req.params.numMec === req.idUser){
			UTILIZADORES.changeUserPassword(req.params.numMec, req.body)
				.then((result) => {
					res.status(200).jsonp(result.data)
				}).catch((err) => {
					res.status(401).jsonp(err)
				})
		}
		else{
			throw({"Erro": "Não pode alterar a password deste utilizador!"})
		}
	}
	catch(err) {
		res.status(402).jsonp(err)
	}
});

// Elimina um utilizador
router.delete('/utilizadores/:numMec', auth.verificaTecnico, function(req, res, next) {
	UTILIZADORES.deleteUser(req.params.numMec)
		.then((result) => {
			res.status(200).jsonp(result.data)
		}).catch((err) => {
			res.status(401).jsonp(err)
		})
});

//---------------------- MS-Notificações ----------------------

router.get('/notificacoes/:mec', auth.verificaAcesso, function(req, res, next) {
	NOTIFICACOES.byUserMec(req.params.mec)
		.then((result) => {
			res.status(200).jsonp(result.data)
		}).catch((err) => {
			res.status(401).jsonp(err)
		})
});

router.delete('/notificacoes/:mec', auth.verificaAcesso, function(req, res, next) {
	NOTIFICACOES.deleteNotification(req.params.mec)
		.then((result) => {
			res.status(200).jsonp(result.data)
		}).catch((err) => {
			res.status(401).jsonp(err)
		})
});

router.put('/notificacoes/:id/:read', auth.verificaAcesso, function(req, res, next) {
	NOTIFICACOES.readNotification(req.params.id,req.params.read)
		.then((result) => {
			res.status(200).jsonp(result.data)
		}).catch((err) => {
			res.status(401).jsonp(err)
		})
});

router.post('/notificacoes/', auth.verificaAcesso, function(req, res, next) {
	NOTIFICACOES.addNotification(req.body)
		.then((result) => {
			res.status(200).jsonp(result.data)
		}).catch((err) => {
			res.status(401).jsonp(err)
		})
});

router.post('/notificacoes/sendEmail', auth.verificaAcesso, function(req, res, next) {
	NOTIFICACOES.sendEmail(req.body)
		.then((result) => {
			res.status(200).jsonp(result.data)
		}).catch((err) => {
			res.status(401).jsonp(err)
		})
});
