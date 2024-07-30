import express from "express";
import {
  createQuestoes,
  createVersao,
  getClassificacoesByNumMec,
  getCorrecoesById,
  getDocentesBySala,
  getVersaoAluno,
  updateCorrecoesById,
  updateResolucaoById,
  updateSalas,
  getQuestoes,
  getVersoes
} from "../controllers/versoesController.js";

const router = express.Router();

router.post("/", createVersao);
router.post("/questoes/:id", createQuestoes);
router.get("/salas/:id/docentes", getDocentesBySala);
router.put("/salas", updateSalas);
router.post("/:id/alunos/:numMec/resolucao/:numQuestao", updateResolucaoById);
router.get("/:id/alunos/:numMec/correcoes", getCorrecoesById);
router.put("/:id/alunos/:numMec/correcoes", updateCorrecoesById);
router.get("/alunos/:numMec/classificacoes", getClassificacoesByNumMec);
router.get("/alunos/:numMec/provas/:provaId", getVersaoAluno);
router.get("/questoes/:id", getQuestoes);
router.get("/:id", getVersoes);

export default router;
