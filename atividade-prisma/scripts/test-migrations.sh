#!/usr/bin/env bash
# Testa as migrations: verifica a ESTRUTURA e os DADOS do banco
# apos "prisma migrate deploy".
# Usa as variaveis padrao do psql: PGHOST PGPORT PGUSER PGPASSWORD PGDATABASE
set -euo pipefail

q()    { psql -v ON_ERROR_STOP=1 -tA -c "$1"; }
ok()   { echo "[OK]   $1"; }
fail() { echo "[FALHA] $1"; exit 1; }

echo "=== 1. Migrations aplicadas ==="
psql -c 'SELECT migration_name, finished_at FROM "_prisma_migrations" ORDER BY started_at;'
[ "$(q 'SELECT count(*) FROM "_prisma_migrations" WHERE finished_at IS NOT NULL')" -ge 2 ] \
  || fail "migrations nao foram aplicadas"
ok "migrations aplicadas"

echo "=== 2. Estrutura: tabelas ==="
psql -c '\dt'
for t in Category Product; do
  [ "$(q "SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_name='$t'")" = "1" ] \
    || fail "tabela $t nao existe"
  ok "tabela $t existe"
done

echo "=== 3. Estrutura: colunas ==="
psql -c '\d "Category"'
psql -c '\d "Product"'
for c in id name createdAt; do
  [ "$(q "SELECT count(*) FROM information_schema.columns WHERE table_name='Category' AND column_name='$c'")" = "1" ] \
    || fail "coluna Category.$c ausente"
done
for c in id name price inStock categoryId createdAt updatedAt; do
  [ "$(q "SELECT count(*) FROM information_schema.columns WHERE table_name='Product' AND column_name='$c'")" = "1" ] \
    || fail "coluna Product.$c ausente"
done
[ "$(q "SELECT data_type FROM information_schema.columns WHERE table_name='Product' AND column_name='price'")" = "numeric" ] \
  || fail "Product.price deveria ser numeric(10,2)"
ok "colunas e tipos conferem"

echo "=== 4. Estrutura: constraints ==="
[ "$(q "SELECT count(*) FROM pg_indexes WHERE indexname='Category_name_key'")" = "1" ] \
  || fail "indice unico Category.name ausente"
ok "indice unico Category_name_key"
[ "$(q "SELECT count(*) FROM information_schema.table_constraints WHERE constraint_name='Product_categoryId_fkey' AND constraint_type='FOREIGN KEY'")" = "1" ] \
  || fail "FK Product.categoryId ausente"
ok "chave estrangeira Product_categoryId_fkey"

echo "=== 5. Dados (migration de seed) ==="
psql -c 'SELECT id, name FROM "Category" ORDER BY id;'
psql -c 'SELECT p.id, p.name, p.price, p."inStock", c.name AS categoria FROM "Product" p JOIN "Category" c ON c.id = p."categoryId" ORDER BY p.id;'
[ "$(q 'SELECT count(*) FROM "Category"')" -ge 3 ] || fail "dados de Category ausentes"
[ "$(q 'SELECT count(*) FROM "Product"')" -ge 5 ] || fail "dados de Product ausentes"
[ "$(q "SELECT price FROM \"Product\" WHERE name='Teclado Mecânico'")" = "299.90" ] \
  || fail "preco do Teclado Mecanico incorreto"
ok "dados iniciais presentes e corretos"

echo "=== 6. Integridade: FK deve rejeitar categoria inexistente ==="
if psql -v ON_ERROR_STOP=1 -c 'INSERT INTO "Product" (name, price, "categoryId", "updatedAt") VALUES ($$x$$, 1, 9999, now());' >/dev/null 2>&1; then
  fail "insert com categoria inexistente deveria falhar"
fi
ok "FK rejeitou categoryId inexistente"

echo
echo "RESULTADO: estrutura e dados do banco validados com sucesso"
