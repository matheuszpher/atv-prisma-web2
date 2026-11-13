import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

type ListFilters = {
  page: number;
  limit: number;
  inStock?: "true" | "false";
  categoryId?: number;
};

export const productService = {
  async list({ page, limit, inStock, categoryId }: ListFilters) {
    const where: Prisma.ProductWhereInput = {
      ...(inStock && { inStock: inStock === "true" }),
      ...(categoryId && { categoryId }),
    };

    // $transaction garante que as duas consultas rodam juntas
    const [data, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        include: { category: { select: { id: true, name: true } } },
        orderBy: { id: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return { data, meta: { page, limit, total, pages: Math.ceil(total / limit) } };
  },

  getById: (id: number) =>
    prisma.product.findUnique({ where: { id }, include: { category: true } }),

  create: (data: Prisma.ProductUncheckedCreateInput) => prisma.product.create({ data }),

  update: (id: number, data: Prisma.ProductUncheckedUpdateInput) =>
    prisma.product.update({ where: { id }, data }),

  remove: (id: number) => prisma.product.delete({ where: { id } }),
};
