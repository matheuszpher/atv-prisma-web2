-- Migration de DADOS: carga inicial de categorias e produtos
-- (mesmos produtos usados na API de Produtos com MongoDB)

INSERT INTO "Category" ("name") VALUES
  ('Periféricos'),
  ('Monitores'),
  ('Armazenamento');

INSERT INTO "Product" ("name", "price", "inStock", "categoryId", "updatedAt") VALUES
  ('Teclado Mecânico',    299.90, true,  (SELECT "id" FROM "Category" WHERE "name" = 'Periféricos'),   CURRENT_TIMESTAMP),
  ('Mouse Gamer',         149.90, true,  (SELECT "id" FROM "Category" WHERE "name" = 'Periféricos'),   CURRENT_TIMESTAMP),
  ('Headset USB',         219.00, false, (SELECT "id" FROM "Category" WHERE "name" = 'Periféricos'),   CURRENT_TIMESTAMP),
  ('Monitor 24" Full HD', 899.00, true,  (SELECT "id" FROM "Category" WHERE "name" = 'Monitores'),     CURRENT_TIMESTAMP),
  ('SSD NVMe 1TB',        459.90, true,  (SELECT "id" FROM "Category" WHERE "name" = 'Armazenamento'), CURRENT_TIMESTAMP);
