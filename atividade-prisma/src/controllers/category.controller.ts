import { Request, Response } from "express";
import { categoryService } from "../services/category.service";
import { idParam, createCategory } from "../schemas";

export const categoryController = {
  async list(_req: Request, res: Response) {
    res.json(await categoryService.list());
  },

  async get(req: Request, res: Response) {
    const { id } = idParam.parse(req.params);
    const category = await categoryService.getById(id);
    if (!category) return void res.status(404).json({ erro: "Categoria não encontrada" });
    res.json(category);
  },

  async create(req: Request, res: Response) {
    const data = createCategory.parse(req.body);
    res.status(201).json(await categoryService.create(data));
  },

  async remove(req: Request, res: Response) {
    const { id } = idParam.parse(req.params);
    await categoryService.remove(id);
    res.status(204).send();
  },
};
