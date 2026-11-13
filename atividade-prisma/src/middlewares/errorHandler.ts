import { ErrorRequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

// Traduz erros de validação e do banco para HTTP

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({ erro: "Dados inválidos", detalhes: err.issues });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": // violação de campo único
        res.status(409).json({ erro: "Registro duplicado", campo: err.meta?.target });
        return;
      case "P2003": // chave estrangeira inválida ou em uso
        res.status(400).json({ erro: "Referência inválida (chave estrangeira)" });
        return;
      case "P2025": // registro não encontrado
        res.status(404).json({ erro: "Registro não encontrado" });
        return;
    }
  }

  console.error(err);
  res.status(500).json({ erro: "Erro interno do servidor" });
};
