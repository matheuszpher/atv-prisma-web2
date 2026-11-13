import { app } from "./app";
import { prisma } from "./lib/prisma";

const port = Number(process.env.PORT) || 3000;
const server = app.listen(port, () => console.log(`API de Produtos em http://localhost:${port}`));

// encerramento limpo (docker stop envia SIGTERM)
process.on("SIGTERM", async () => {
  server.close();
  await prisma.$disconnect();
});
