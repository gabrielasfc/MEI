var express = require('express');
var router = express.Router();
var Sala = require('../controllers/sala')

// TEMPLATE DE FUNÇÃO DE AUTENTICAÇÃO - DESATUALIZADO
function verificaAutenticacao(req, res, next) {
  let token = req.body.token || req.query.token
  delete req.body.token
  delete req.query.token
  if (token) {
      jwt.verify(token, "Password", function (e, payload) {
          if (e) {
              res.status(401).jsonp({error: e})
          } else {
              req.user = payload // mete os dados do utilizador no pedido do cliente
              next()
          }
      })
  } else {
      res.status(401).jsonp({error: 'Unauthorized Access: No auth token was provided'})
  }
}

/* GET home page. */ // STANDARD
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

// GET /api/salas/ -> Retorna todas as salas 
router.get('/'/* , verificaAutenticacao */, function (req, res, next) {
	Sala.list()
	.then((result) => {
		res.jsonp(result)
	}).catch((err) => {
		res.jsonp(err);
	});
})

// POST /api/salas -> Adiciona uma sala à BD
router.post('/', function (req, res, next) {
    Sala.addSalas(req.body)
    .then((result) => {
        res.jsonp(result);
    }).catch((err) => {
        res.status(400).jsonp(err); // 400 - Bad Request
    });
})

// DELETE /api/salas -> Remove uma sala com um determinado ID da BD
router.delete('/', function (req, res, next) {
	const id = req.query.id

	Sala.deleteSala(id) 
	.then((result) => {
		res.jsonp(result);
	}).catch((err) => {
		res.status(400).jsonp(err); // 400 - Bad Request
	});
})

// GET /api/salas/ids -> Obtenção de salas pelos seus ids
router.get('/ids', function (req, res, next) {
	// const ids = req.query.ids
	// const idsArray = Array.isArray(ids) ? ids : [ids];

    const encodedArrayString = req.query.ids;
    const decodedArrayString = decodeURIComponent(encodedArrayString);
    const receivedArray = decodedArrayString.split(',');

	Sala.getSala(receivedArray)
	.then((result) => {
		res.jsonp(result);
	}).catch((err) => {
		res.status(404).jsonp(err);
	});
})


// PUT /api/salas/allocateSala -> Aloca as salas que vêm no body [{id: id, startTime: startTime, endTime: endTime}]
router.put('/allocateSala', function (req, res, next) {
    Sala.allocateSalas(req.body)
    .then((result) => {
        res.jsonp(result);
    }).catch((err) => {
        res.status(404).jsonp(err);
    });
})


// GET /api/salas/getSalasAvailable -> Obtenção de salas disponíveis entre determinado espaço de tempo
router.get('/getSalasAvailable', function (req, res, next) {
    const startTime = req.query.startTime
    const endTime = req.query.endTime

    Sala.getSalasAvailable(startTime, endTime)
    .then((result) => {
        res.jsonp(result);
    }).catch((err) => {
        res.status(404).jsonp(err);
    });
})

module.exports = router;
