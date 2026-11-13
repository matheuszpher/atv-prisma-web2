# ---------- etapa de build ----------
FROM node:22-alpine AS build
WORKDIR /usr/src/app
RUN apk add --no-cache openssl

# Instala todas as dependências (inclusive as de desenvolvimento para o build)
COPY package*.json ./
RUN npm ci

# Copia o código, gera o Prisma Client e compila o TypeScript (pasta dist)
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
RUN npm run build

# Remove as dependências de desenvolvimento (o CLI do prisma fica, pois roda as migrations)
RUN npm prune --omit=dev

# ---------- etapa final (imagem leve) ----------
FROM node:22-alpine
WORKDIR /usr/src/app
RUN apk add --no-cache openssl
ENV NODE_ENV=production

COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/prisma ./prisma
COPY package.json ./

EXPOSE 3000

# Aplica as migrations (estrutura + dados) e sobe a API
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
