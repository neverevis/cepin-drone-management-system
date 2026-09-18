#!/bin/sh
# Ponto de entrada do container: sincroniza o schema do banco e, se for a
# primeira execução (banco vazio), popula automaticamente com os dados de
# demonstração — assim "docker compose up" já deixa o sistema pronto para
# uso, sem nenhum passo manual adicional.
set -e

echo "Sincronizando o schema do banco de dados..."
npx prisma db push --skip-generate

USER_COUNT=$(node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.count()
  .then((count) => { process.stdout.write(String(count)); return prisma.\$disconnect(); })
  .catch(() => { process.stdout.write('0'); });
" 2>/dev/null)

if [ "$USER_COUNT" = "0" ]; then
  echo "Banco de dados vazio — populando com os dados de demonstração (npm run db:seed)..."
  npm run db:seed
else
  echo "Banco de dados já possui usuários cadastrados — seed automático ignorado."
fi

echo "Iniciando o servidor..."
exec npm run start
