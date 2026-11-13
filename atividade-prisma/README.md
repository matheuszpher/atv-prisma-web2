# Atividade - Node, Express, Prisma e PostgreSQL (Docker + GitHub Actions)

UFC Quixadá - Desenvolvimento de Software para Web

Aplicação baseada na nossa **API de Produtos** da disciplina (que usava Mongoose/MongoDB e
foi publicada no Cloud Run), migrada para **Prisma + PostgreSQL**, seguindo a estrutura do
código de referência do professor
([silobocarvalho/-2026.2--Web2-node-express-ts-prisma-PostgreSQL](https://github.com/silobocarvalho/-2026.2--Web2-node-express-ts-prisma-PostgreSQL)).

## O que foi feito

| Item da atividade | Onde |
|---|---|
| Aplicação Web com Node, Express, Prisma e PostgreSQL | `src/`, `prisma/schema.prisma` |
| Imagem Docker | `Dockerfile` (multi-stage), `docker-compose.yml` |
| Rodar no GitHub Actions e testar as migrations (estrutura e dados) | `../.github/workflows/atividade-prisma.yml`, `scripts/test-migrations.sh` |
| Variáveis de ambiente cadastradas no GitHub | Variables `POSTGRES_USER`, `POSTGRES_DB` e Secret `POSTGRES_PASSWORD` |
| Evidências | pasta `evidencias/` |

## Estrutura

```
src/
├── lib/prisma.ts                 # PrismaClient
├── schemas/index.ts              # validação com zod
├── services/                     # acesso ao banco (Prisma)
│   ├── category.service.ts
│   └── product.service.ts
├── controllers/                  # regras HTTP
│   ├── category.controller.ts
│   └── product.controller.ts
├── routes/index.ts               # rotas /api/...
├── middlewares/errorHandler.ts   # erros do zod/Prisma -> HTTP
├── docs/swagger.ts               # documentação OpenAPI (/docs)
├── app.ts
└── server.ts
prisma/
├── schema.prisma                 # models Category e Product (1:N)
└── migrations/
    ├── ..._init/                 # ESTRUTURA: tabelas, índice único, FK
    └── ..._seed_data/            # DADOS: 3 categorias e 5 produtos
```

## Modelo

- `Category` (id, name único, createdAt)
- `Product` (id, name, price `Decimal(10,2)`, inStock, categoryId -> Category, createdAt, updatedAt)

## Rotas

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/health` | API + conexão com o PostgreSQL |
| GET/POST | `/api/categories` | lista (com total de produtos) / cria |
| GET/DELETE | `/api/categories/:id` | busca com produtos / remove |
| GET/POST | `/api/products` | lista com filtros `inStock`, `categoryId` e paginação `page`, `limit` / cria |
| GET/PATCH/DELETE | `/api/products/:id` | busca / atualiza parcialmente / remove |
| GET | `/docs` | Swagger UI |

## Como rodar localmente

```bash
cp .env.example .env
npm install

# banco (porta 5433 no host, para não conflitar com um PostgreSQL local)
docker compose up -d db
npx prisma migrate dev          # aplica estrutura + dados

npm run dev                     # http://localhost:3000/docs
```

### Tudo em Docker

```bash
docker build -t api-produtos-prisma:latest .
docker compose up -d            # db + api (a API roda "prisma migrate deploy" ao subir)
curl localhost:3000/api/health
```

## GitHub Actions

O workflow `.github/workflows/atividade-prisma.yml` (na raiz do repositório):

1. sobe um **service container** `postgres:16-alpine` (só existe durante o job, alguns minutos);
2. lê as variáveis cadastradas no GitHub (`vars.POSTGRES_USER`, `vars.POSTGRES_DB`, `secrets.POSTGRES_PASSWORD`);
3. instala dependências e faz o build;
4. roda `prisma migrate deploy`;
5. roda `scripts/test-migrations.sh`, que valida **estrutura** (tabelas, colunas, tipos, índice único, FK)
   e **dados** (categorias e produtos da migration de seed, e que a FK rejeita categoria inexistente);
6. cria a **imagem Docker**, sobe o container da API apontando para o banco do job e testa os endpoints.

## Evidências

| Arquivo | Conteúdo |
|---|---|
| `evidencias/01-banco-postgres-rodando.png` | container PostgreSQL rodando (healthy) |
| `evidencias/02-migration-estrutura-init.png` | `prisma migrate dev --name init` e SQL gerado |
| `evidencias/03-migration-dados-e-banco.png` | migration de dados aplicada, tabelas e registros no banco |
| `evidencias/04-imagem-docker-build.png` | build da imagem Docker |
| `evidencias/05-api-rodando-container.png` | API rodando no container e respondendo requisições |
| `evidencias/06a-api-swagger-rotas.png` | API no navegador (Swagger com todas as rotas) |
| `evidencias/06b-api-swagger-health.png` | requisição pelo Swagger respondendo 200 |
| `evidencias/07-github-variaveis.png` | variáveis e secret cadastrados no GitHub |
| `evidencias/08-github-actions-pipeline.png` | pipeline do GitHub Actions executada com sucesso |
