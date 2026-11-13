import { z } from "zod";

// Validação antes do banco

export const idParam = z.object({
  id: z.coerce.number().int().positive(),
});

export const createCategory = z.object({
  name: z.string().min(2),
});

export const createProduct = z.object({
  name: z.string().min(2),
  price: z.number().nonnegative(),
  inStock: z.boolean().optional(),
  categoryId: z.number().int().positive(),
});
export const updateProduct = createProduct.partial();

export const listProducts = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  inStock: z.enum(["true", "false"]).optional(),
  categoryId: z.coerce.number().int().optional(),
});
