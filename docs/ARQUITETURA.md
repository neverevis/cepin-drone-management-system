# Arquitetura

## Visão geral

O sistema é uma aplicação **Next.js 14 (App Router)** full-stack: a mesma
aplicação serve tanto a interface (React Server/Client Components) quanto o
backend (Server Actions e Route Handlers), compartilhando tipos e validação
entre as duas camadas. Não há uma API separada nem um frontend SPA
desacoplado — essa escolha reduz a superfície de duplicação (schemas de
validação, tipos de dados) para um sistema de porte institucional com uma
equipe pequena de manutenção.

```
┌──────────────────────────────────────────────────────────────┐
│                        Navegador                              │
│  Server Components (HTML já renderizado) + Client Components  │
│  (formulários interativos, gráficos)                          │
└───────────────┬─────────────────────────────┬─────────────────┘
                │  Server Actions               │  fetch (Route Handlers)
                ▼                               ▼
┌──────────────────────────────┐   ┌─────────────────────────────┐
│   src/lib/actions/*.ts        │   │  src/app/api/**/route.ts     │
│   (mutações: criar, aprovar,  │   │  (geração de PDF, exportação │
│   registrar retirada/uso/     │   │  CSV, NextAuth)               │
│   devolução, etc.)            │   └───────────────┬───────────────┘
└───────────────┬────────────────┘                    │
                │  requirePermission() / requireUser()  │
                ▼                                        ▼
┌───────────────────────────────────────────────────────────────┐
│                     src/lib/permissions.ts                     │
│         Matriz de permissões central (4 perfis)                │
└───────────────┬─────────────────────────────────────────────────┘
                ▼
┌───────────────────────────────────────────────────────────────┐
│                       Prisma Client                             │
└───────────────┬─────────────────────────────────────────────────┘
                ▼
┌───────────────────────────────────────────────────────────────┐
│           SQLite (dev/demo) ou PostgreSQL (produção)            │
└───────────────────────────────────────────────────────────────┘
```

## Autenticação e autorização

- **Autenticação**: NextAuth.js com `CredentialsProvider` (e-mail + senha),
  sessão em JWT. As senhas são verificadas com `bcrypt.compare` contra o
  hash armazenado em `users.passwordHash`.
- **Middleware** (`src/middleware.ts`): protege todas as rotas exceto
  `/login` e as rotas internas do NextAuth, redirecionando usuários não
  autenticados para o login.
- **Autorização**: a matriz de permissões vive em `src/lib/permissions.ts`
  (`can(role, permission)`), associando cada um dos 4 perfis a um conjunto
  de permissões (`equipment.manage`, `reservations.review`,
  `withdrawals.register`, etc.). **Toda Server Action que muda dados chama
  `requirePermission(...)` antes de tocar no banco** — a interface também
  esconde botões que o usuário não pode usar, mas isso é só uma
  conveniência visual: a garantia real está no backend.

Essa decisão de projeto (perfis fixos + matriz centralizada, em vez de
tabelas dinâmicas `roles`/`permissions` no banco) foi deliberada: um sistema
de RBAC totalmente dinâmico seria super-engenharia para uma instituição com
4 perfis conhecidos e estáveis. Se no futuro surgir a necessidade de perfis
customizáveis pelo próprio usuário administrador, a matriz pode ser migrada
para tabelas sem alterar a forma como as Server Actions a consultam.

## Server Actions como camada de aplicação

Cada módulo tem um arquivo em `src/lib/actions/` (ex.: `reservations.ts`,
`withdrawals.ts`, `battery.ts`) contendo funções `"use server"` que:

1. Verificam permissão (`requirePermission`).
2. Validam o `FormData` recebido com **Zod** (schemas locais ou
   compartilhados em `src/lib/validators.ts`).
3. Executam a mutação no Prisma — operações que tocam múltiplas tabelas
   (ex.: registrar uma devolução atualiza `Return`, `ReturnItem`,
   `Equipment.status`, `Battery.status` e `Reservation.status`) usam
   `prisma.$transaction(...)` para garantir atomicidade.
4. Registram uma entrada de auditoria (`logAudit`).
5. Invalidam o cache do Next.js (`revalidatePath`) e redirecionam ou
   retornam o estado de erro/sucesso para o formulário.

Os formulários client-side usam o componente genérico `ActionForm`
(`src/components/ActionForm.tsx`), que envolve `useFormState` do React para
exibir erros de validação sem JavaScript extra por formulário.

## Geração de documentos (PDF)

`src/lib/pdf/termoRetirada.ts` e `src/lib/pdf/comprovanteDevolucao.ts`
geram os documentos institucionais usando **pdfkit**, desenhando o
documento a partir dos dados reais da retirada/devolução (nunca dados
fictícios em um documento gerado a partir de um registro real). As rotas
`src/app/api/retiradas/[id]/termo/route.ts` e
`src/app/api/devolucoes/[id]/comprovante/route.ts` chamam esses geradores e
transformam o `PDFDocument` em um `Buffer` (`src/lib/pdf/stream.ts`) para
resposta HTTP. Cada geração cria também um registro em `documents` (para
saber que o termo foi gerado, sem exigir que isso implique assinatura ou
aprovação institucional) e uma entrada de auditoria.

> Nota técnica: o `pdfkit` (via `fontkit`) carrega arquivos de métricas de
> fonte em tempo de execução; por isso ele é declarado em
> `experimental.serverComponentsExternalPackages` no `next.config.mjs`,
> evitando que o bundler do Next.js "perca" esses arquivos no build de
> produção.

## Relatórios e exportação

`src/lib/reports.ts` centraliza as consultas usadas tanto pela página
`/relatorios` (renderização em tabela) quanto pelas rotas
`src/app/api/relatorios/**/csv/route.ts` (exportação), evitando duplicar a
lógica de filtro entre a tela e o arquivo exportado.

## Frontend

- Server Components por padrão; Client Components (`"use client"`) apenas
  onde há interatividade real (formulários, gráfico de baterias, menu
  mobile).
- Tailwind CSS com uma pequena paleta de classes utilitárias reunidas em
  `globals.css` (`.card`, `.btn-primary`, `.input`, etc.) para manter os
  componentes visualmente consistentes sem duplicar classes longas em todo
  lugar.
- `AppShell` (`src/components/AppShell.tsx`) implementa o layout
  responsivo: barra lateral fixa em telas grandes, menu deslizante (drawer)
  em telas pequenas.

## Banco de dados

Ver [MODELO_DE_DADOS.md](./MODELO_DE_DADOS.md) para o detalhamento das 20
entidades e das decisões de modelagem.
