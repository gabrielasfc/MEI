var express = require('express')
var router = express.Router()
var passport = require('passport');
var User = require("../controllers/user")
var UserModel = require("../models/user")
var jwt = require('jsonwebtoken')

// GET /api/utilizadores/ -> Devolve todos os users ou os users de um certo type
router.get('/', (req, res) => {
    if(req.query.type){
        User.list({'type' : parseInt(req.query.type)})
        .then(data => {
            res.status(200).jsonp(data)
        })
        .catch(error =>
            res.status(500).json({
                error: error,
                message: "Erro na obtenção da lista de utilizadores",
            })
        )
    }
    else{
        User.list({})
            .then(data => {
                res.status(200).jsonp(data)
            })
            .catch(error =>
                res.status(500).json({
                    error: error,
                    message: "Erro na obtenção da lista de utilizadores",
                })
            )
    }
})

// GET /api/utilizadores/:numMec -> Devolve o user
router.get('/:numMec', (req, res) => {
    User.getUser(req.params.numMec)
        .then(data => {
            res.status(200).json(data)
        })
        .catch(error =>
            res.status(500).json({
                error: error,
                message: "Erro na obtenção do utilizador",
            })
        )
})

// GET /api/utilizadores/numMecs -> Devolve os users dos num mecs dados
router.get('/numMecs', (req, res, next) => {
    const encodedArrayString = req.query.numMecs;
    const decodedArrayString = decodeURIComponent(encodedArrayString);
    const receivedArray = decodedArrayString.split(',');

	User.getUsers(receivedArray)
        .then(data => {
            res.status(200).json(data)
        })
        .catch(error =>
            res.status(500).json({
                error: error,
                message: "Erro na obtenção dos utilizadores",
            })
        )
})

// POST /api/utilizadores/register -> Regista o user
router.post("/register", (req, res) => {
    UserModel.register(new UserModel({
        _id: req.body.numMec,
        name: req.body.name,
        email: req.body.email,
        type: req.body.type
    }), req.body.password, (err, user) => {
        if (err) {
            res.jsonp({
                error: err,
                message: "Erro no registo do utilizador"
            })
        } else {
            req.body.username = req.body.numMec;
            delete req.body.numMec;

            passport.authenticate("local")(req, res, () => {
                req.logIn(user, { session: false }, (loginErr) => {
                    if (!loginErr) {
                        jwt.sign({
                                _id: req.user._id, email: req.user.email, type: req.user.type
                            },
                            "RAS2023",
                            { expiresIn: 3600 }, // 1 hora
                            function (e, token) {
                                if (e) res.status(500).jsonp({ error: "Erro na geração do token: " + e })
                                else {
                                    res.status(201).jsonp({ token: token })
                                }
                            }
                        );
                    }
                })
            })
        }
    })
})

// POST /api/utilizadores/login -> Autentica o utilizador
router.post('/login', (req, res, next) => {
    req.body.username = req.body.numMec;
    delete req.body.numMec;

    passport.authenticate('local', (err, user, info) => {
        if (err) return res.status(500).json({ message: "Erro na autenticação do utilizador" }) 
        if (!user) return res.status(404).json({ message: "Erro no utilizador" })

        req.logIn(user, { session: false }, (loginErr) => {
            if (!loginErr) {
                jwt.sign({
                        _id: req.user._id, email: req.user.email, type: req.user.type
                    },
                    "RAS2023",
                    { expiresIn: 3600 }, // 1 hora
                    function (e, token) {
                        if (e) res.status(500).jsonp({ error: "Erro na geração do token: " + e })
                        else {
                            res.status(201).jsonp({ token: token })
                        }
                    }
                );
            }
        })
    })(req, res, next)
})

// POST /api/utilizadores/registerFile -> Regista os utilizadores do ficheiro
router.post('/registerFile', (req, res) => {
    User.addUsers(req.body)
        .then(response => {
            res.status(201).json(response);
        })
        .catch(error => {
            res.status(500).json({
                error: error,
                message: "Erro ao registar utilizadores"
            })
        })
})

// POST /api/utilizadores/validateFile -> Verifica se os utilizadores do ficheiro existem
router.post('/validateFile', (req, res) => {
    User.checkUsers(req.body)
        .then(result => {
            res.status(200).json(result);
        })
        .catch(error => {
            res.status(500).json({
                error: error,
                message: "Erro ao validar utilizadores"
            })
        })
})

// PUT /api/utilizadores/:numMec -> Atualiza a informação do utilizador
router.put("/:numMec", (req, res) => {
    User.updateUser(req.params.numMec, req.body)
        .then(data => {
            res.status(200).jsonp(data)
        })
        .catch(error => {
            res.status(500).jsonp({
                error: error,
                message: "Erro na atualização do utilizador" })
        })
})

// PUT /api/utilizadores/:numMec/password -> Atualiza a password do utilizador
router.put("/:numMec/password", (req, res) => {
    User.getUser(req.params.numMec)
        .then((user) => {
            user.changePassword(
                req.body.oldpwd,
                req.body.newpwd,
                error => {
                    if (error) {
                        res.status(500).jsonp({
                            error: error,
                            message: "Erro na alteração da password"
                        })
                    }
                    else res.status(200).jsonp()
                }
            )
        })
        .catch((error) => {
            res.status(404).jsonp({
                error: error,
                message: "Utilizador não encontrado" 
            })
        })
})

// DELETE /api/utilizadores/:numMec -> Remove o utilizador
router.delete("/:numMec", (req, res) => {
    User.deleteUser(req.params.numMec)
        .then(data => {
            if (data) { res.status(200).jsonp(data) }
            else res.status(404).jsonp({ message: "Utilizador não encontrado" })
        })
        .catch(error =>
            res.status(500).jsonp({
                error: error,
                message: "Erro na remoção do utilizador"
            })
        )
})

module.exports = router
