# Como Executar o Sistema — Passo a Passo

Este guia parte do zero (repositório ainda não clonado) até o sistema
rodando no seu navegador. Se você só quer o resumo rápido, ele também está
no [README](../README.md#instalação-e-execução-local).

Duas formas de rodar: **local com Node.js** (mais simples para desenvolver)
ou **Docker** (não precisa instalar Node na sua máquina).

---

## Opção 1 — Local com Node.js

### Pré-requisitos

- **Node.js 20+** — confira com `node -v`. Se não tiver, baixe em
  https://nodejs.org (versão LTS).
- **Git** — confira com `git -v`.

### Passo 1 — Clonar o repositório

```bash
git clone https://github.com/neverevis/cepin-drone-management-system.git
cd cepin-drone-management-system
```

Se você quer a versão mais recente da branch de desenvolvimento (antes de
ela virar `main`), troque de branch depois do clone:

```bash
git checkout claude/zealous-hopper-glk7z0
```

### Passo 2 — Instalar as dependências

```bash
npm install
```

Isso também gera o Prisma Client automaticamente (`postinstall`). Pode
demorar um minuto na primeira vez.

### Passo 3 — Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Abra o `.env` gerado. Para rodar localmente, os valores padrão já
funcionam:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="troque-esta-chave-por-uma-string-aleatoria-segura"
NEXTAUTH_URL="http://localhost:3000"
```

> Em produção, **troque `NEXTAUTH_SECRET`** por uma string aleatória longa
> (ex.: gere uma com `openssl rand -base64 32`).

### Passo 4 — Criar o banco de dados

```bash
npm run db:push
```

Isso cria o arquivo SQLite (`prisma/dev.db`) com todas as 20 tabelas do
sistema, a partir do `prisma/schema.prisma`.

### Passo 5 — Popular com dados de demonstração

```bash
npm run db:seed
```

Isso cria: 4 usuários (um por perfil), o drone, seus acessórios e as 4
baterias. O terminal mostra os e-mails de login ao final — todos usam a
senha **`cepin@2024`**.

> Esses dados (usuários, números de série) são **fictícios**, apenas para
> teste. Substitua pelos dados reais do CEPIN antes de um uso real.

### Passo 6 — Rodar o sistema

```bash
npm run dev
```

Acesse **http://localhost:3000** no navegador. Você cai na tela de login —
use qualquer um dos e-mails do seed (ex.: `admin@cepin.ifsp.edu.br`) com a
senha `cepin@2024`.

### (Opcional) Rodar como em produção

```bash
npm run build
npm run start
```

`npm run dev` é melhor para desenvolver (recarrega sozinho a cada mudança);
`build` + `start` reproduz exatamente o que roda em produção — foi contra
esse modo que o fluxo completo do sistema foi validado.

---

## Opção 2 — Docker

### Pré-requisitos

- **Docker** e **Docker Compose** instalados
  (https://docs.docker.com/get-docker/).

### Passo 1 — Clonar o repositório

```bash
git clone https://github.com/neverevis/cepin-drone-management-system.git
cd cepin-drone-management-system
```

### Passo 2 — Configurar variáveis de ambiente

```bash
cp .env.example .env
```

### Passo 3 — Subir o container

```bash
docker compose up --build
```

Na primeira vez, isso builda a imagem (alguns minutos) e já cria o banco de
dados (o `Dockerfile` roda `prisma db push` automaticamente ao iniciar).

### Passo 4 — Popular com dados de demonstração

Em outro terminal, com o container já rodando:

```bash
docker compose exec app npm run db:seed
```

### Passo 5 — Acessar

Abra **http://localhost:3000** e faça login como no passo a passo local
(ex.: `admin@cepin.ifsp.edu.br` / `cepin@2024`).

Para parar: `Ctrl+C` no terminal do `docker compose up`, ou
`docker compose down` (os dados continuam salvos no volume Docker
`cepin_db_data` para a próxima vez).

---

## Problemas comuns

| Sintoma | Causa provável / solução |
|---|---|
| `Error: P1012` ou erro de schema do Prisma | Rode `npx prisma generate` e depois `npm run db:push` novamente. |
| Porta 3000 já em uso | Outro processo está usando a porta. Pare-o, ou rode com `PORT=3001 npm run start` (o `dev` também aceita `-p 3001`). |
| Login não funciona / redireciona sempre pro login | Confira se `NEXTAUTH_URL` no `.env` bate com a URL que você está acessando (ex.: ambos `http://localhost:3000`), e se `npm run db:seed` foi executado. |
| Erro ao gerar o PDF do Termo de Retirada | Certifique-se de estar usando o build normal (`npm run build && npm run start`, ou Docker) — isso já está corrigido no repositório, mas se você alterar `next.config.mjs`, mantenha a opção `experimental.serverComponentsExternalPackages` com `pdfkit`. |
| Quero apagar tudo e recomeçar do zero | `npm run db:reset` (⚠️ apaga todos os dados atuais e recria o seed). |

Se algo não listado aqui acontecer, veja os logs do terminal onde o `npm
run dev`/`start` (ou `docker compose up`) está rodando — a mensagem de erro
completa aparece lá.
