import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";

import { PrismaClient } from "@prisma/client";
import provasRoutes from "./routes/provasRouter.js";
import versoesRoutes from "./routes/versoesRouter.js";

const prisma = new PrismaClient();

const app = express();
dotenv.config();
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

app.use("/api/provas", provasRoutes);
app.use("/api/versoes", versoesRoutes);

const APP_PORT = process.env.APP_PORT;

try {
  await prisma.$connect();
  app.listen(APP_PORT, () =>
    console.log(`Server running on port: ${APP_PORT}`),
  );
} catch (error) {
  console.error("Unable to connect to the database:", error);
} finally {
  await prisma.$disconnect();
}
