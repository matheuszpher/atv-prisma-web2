const idParam = (descricao: string) => ({
  name: "id",
  in: "path",
  required: true,
  description: descricao,
  schema: { type: "integer" },
});

const jsonBody = (schema: string) => ({
  required: true,
  content: { "application/json": { schema: { $ref: `#/components/schemas/${schema}` } } },
});

const jsonResponse = (description: string, schema: string) => ({
  description,
  content: { "application/json": { schema: { $ref: `#/components/schemas/${schema}` } } },
});

const errorResponse = (description: string) => jsonResponse(description, "Error");

// Especificação OpenAPI exibida pelo Swagger UI em /docs
export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "API de Produtos (Prisma + PostgreSQL)",
    version: "2.0.0",
    description:
      "CRUD de produtos e categorias com Node, Express, Prisma e PostgreSQL. Versão migrada da API de Produtos (Mongoose/MongoDB) da disciplina.",
  },
  servers: [{ url: "/api" }],
  tags: [{ name: "Saúde" }, { name: "Categorias" }, { name: "Produtos" }],
  paths: {
    "/health": {
      get: {
        tags: ["Saúde"],
        summary: "Verifica a API e a conexão com o PostgreSQL",
        responses: { 200: { description: "API e banco operando" } },
      },
    },
    "/categories": {
      get: {
        tags: ["Categorias"],
        summary: "Lista as categorias (com total de produtos)",
        responses: { 200: { description: "Lista de categorias" } },
      },
      post: {
        tags: ["Categorias"],
        summary: "Cria uma categoria",
        requestBody: jsonBody("CategoryInput"),
        responses: {
          201: jsonResponse("Categoria criada", "Category"),
          400: errorResponse("Dados inválidos"),
          409: errorResponse("Categoria duplicada"),
        },
      },
    },
    "/categories/{id}": {
      get: {
        tags: ["Categorias"],
        summary: "Busca uma categoria com seus produtos",
        parameters: [idParam("ID da categoria")],
        responses: {
          200: jsonResponse("Categoria encontrada", "Category"),
          404: errorResponse("Categoria não encontrada"),
        },
      },
      delete: {
        tags: ["Categorias"],
        summary: "Remove uma categoria (sem produtos vinculados)",
        parameters: [idParam("ID da categoria")],
        responses: {
          204: { description: "Categoria removida" },
          400: errorResponse("Categoria possui produtos"),
          404: errorResponse("Categoria não encontrada"),
        },
      },
    },
    "/products": {
      get: {
        tags: ["Produtos"],
        summary: "Lista produtos com filtros e paginação",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          { name: "inStock", in: "query", schema: { type: "string", enum: ["true", "false"] } },
          { name: "categoryId", in: "query", schema: { type: "integer" } },
        ],
        responses: { 200: { description: "Página de produtos com metadados" } },
      },
      post: {
        tags: ["Produtos"],
        summary: "Cria um produto",
        requestBody: jsonBody("ProductInput"),
        responses: {
          201: jsonResponse("Produto criado", "Product"),
          400: errorResponse("Dados inválidos ou categoria inexistente"),
        },
      },
    },
    "/products/{id}": {
      get: {
        tags: ["Produtos"],
        summary: "Busca um produto pelo ID",
        parameters: [idParam("ID do produto")],
        responses: {
          200: jsonResponse("Produto encontrado", "Product"),
          400: errorResponse("ID inválido"),
          404: errorResponse("Produto não encontrado"),
        },
      },
      patch: {
        tags: ["Produtos"],
        summary: "Atualiza só os campos enviados",
        parameters: [idParam("ID do produto")],
        requestBody: jsonBody("ProductPatch"),
        responses: {
          200: jsonResponse("Produto atualizado", "Product"),
          400: errorResponse("Dados inválidos"),
          404: errorResponse("Produto não encontrado"),
        },
      },
      delete: {
        tags: ["Produtos"],
        summary: "Remove um produto",
        parameters: [idParam("ID do produto")],
        responses: {
          204: { description: "Produto removido" },
          404: errorResponse("Produto não encontrado"),
        },
      },
    },
  },
  components: {
    schemas: {
      CategoryInput: {
        type: "object",
        required: ["name"],
        properties: { name: { type: "string", example: "Periféricos" } },
      },
      Category: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Periféricos" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      ProductInput: {
        type: "object",
        required: ["name", "price", "categoryId"],
        properties: {
          name: { type: "string", example: "Teclado Mecânico" },
          price: { type: "number", example: 299.9 },
          inStock: { type: "boolean", default: true },
          categoryId: { type: "integer", example: 1 },
        },
      },
      ProductPatch: {
        type: "object",
        properties: {
          name: { type: "string" },
          price: { type: "number", example: 249.9 },
          inStock: { type: "boolean" },
          categoryId: { type: "integer" },
        },
        example: { price: 249.9 },
      },
      Product: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Teclado Mecânico" },
          price: { type: "string", example: "299.9" },
          inStock: { type: "boolean", example: true },
          categoryId: { type: "integer", example: 1 },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Error: {
        type: "object",
        properties: { erro: { type: "string" } },
      },
    },
  },
};
