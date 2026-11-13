import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { routes } from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
import { swaggerSpec } from "./docs/swagger";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => res.redirect("/docs"));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", routes);

app.use((_req, res) => void res.status(404).json({ erro: "Rota não encontrada" }));
app.use(errorHandler);
