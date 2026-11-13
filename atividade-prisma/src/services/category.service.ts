import { prisma } from "../lib/prisma";

export const categoryService = {
  list: () =>
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    }),

  getById: (id: number) =>
    prisma.category.findUnique({ where: { id }, include: { products: true } }),

  create: (data: { name: string }) => prisma.category.create({ data }),

  remove: (id: number) => prisma.category.delete({ where: { id } }),
};
