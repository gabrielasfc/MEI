var jwt = require('jsonwebtoken')

module.exports.verificaAcesso = function (req, res, next) {
	var myToken = req.query.token || req.body.token
	if (myToken) {
		jwt.verify(myToken, "RAS2023", function (e, payload) {
			if (e) {
				res.status(401).jsonp({ error: e })
			}
			else {
				req.idUser = payload._id
				req.type = payload.type
				next()
			}
		})
	}
	else {
		res.status(401).jsonp({ error: "Token inexistente!" })
	}
}

module.exports.verificaDocenteTecnico = function (req, res, next) {
	var myToken = req.query.token || req.body.token
	if (myToken) {
		jwt.verify(myToken, "RAS2023", function (e, payload) {
			if (e) {
				res.status(401).jsonp({ error: e })
			}
			else {
				if(payload.type > 0){
					next()
				}else{
					res.status(403).jsonp({error: 'Apenas docentes ou técnicos têm acesso a esta operação.'})
				}
			}
		})
	}
	else {
		res.status(401).jsonp({ error: "Token inexistente!" })
	}
}


module.exports.verificaTecnico = function (req, res, next) {
	var myToken = req.query.token || req.body.token
	if (myToken) {
		jwt.verify(myToken, "RAS2023", function (e, payload) {
			if (e) {
				res.status(401).jsonp({ error: e })
			}
			else {
				if(payload.type === 2){
					next()
				}else{
					res.status(403).jsonp({error: 'Apenas técnicos têm acesso a esta operação.'})
				}
			}
		})
	}
	else {
		res.status(401).jsonp({ error: "Token inexistente!" })
	}
}

module.exports.verificaDocente = function (req, res, next) {
	var myToken = req.query.token || req.body.token
	if (myToken) {
		jwt.verify(myToken, "RAS2023", function (e, payload) {
			if (e) {
				res.status(401).jsonp({ error: e })
			}
			else {
				if(payload.type === 1){
					next()
				}else{
					res.status(403).jsonp({error: 'Apenas docentes têm acesso a esta operação.'})
				}
			}
		})
	}
	else {
		res.status(401).jsonp({ error: "Token inexistente!" })
	}
}

module.exports.verificaAluno = function (req, res, next) {
	var myToken = req.query.token || req.body.token
	if (myToken) {
		jwt.verify(myToken, "RAS2023", function (e, payload) {
			if (e) {
				res.status(401).jsonp({ error: e })
			}
			else {
				if(payload.type === 0){
					next()
				}else{
					res.status(403).jsonp({error: 'Apenas alunos têm acesso a esta operação.'})
				}
			}
		})
	}
	else {
		res.status(401).jsonp({ error: "Token inexistente!" })
	}
}