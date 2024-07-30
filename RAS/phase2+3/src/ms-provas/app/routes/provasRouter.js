import express from "express";

import {
  correcaoAutomatica,
  createProva,
  getClassificacoesById,
  getProvaById,
  getProvas,
  publishClassificacoesById,
  updateProvaById,
} from "../controllers/provasController.js";

const router = express.Router();

// Gets
router.get("/", getProvas);
router.get("/:id", getProvaById);
router.get("/:id/correcaoAutomatica", correcaoAutomatica);
router.get("/:id/classificacoes", getClassificacoesById);

// Put
router.put("/:id/classificacoes/publicar", publishClassificacoesById);

// Patch
router.patch("/:id", updateProvaById);

// Post
router.post("/", createProva);

export default router;
