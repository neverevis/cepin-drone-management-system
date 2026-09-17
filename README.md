# Sistema de Gestão do Drone Multiespectral — CEPIN / IFSP Araraquara

Sistema web para controle de **retiradas, utilização, devolução e manutenção**
do drone **DJI Mavic 3 Multispectral** e seus acessórios, desenvolvido para o
**CEPIN — Centro de Pesquisa e Inovação em Inteligência Artificial e Robótica
Agrícola**, do **IFSP — Câmpus Araraquara**.

É uma aplicação web real: banco de dados relacional, autenticação com
controle de acesso por perfil (aplicado no backend), geração de documentos
institucionais em PDF, relatórios com exportação e testes automatizados.

> Documentação complementar na pasta [`docs/`](./docs):
> [Arquitetura](./docs/ARQUITETURA.md) ·
> [Modelo de Dados](./docs/MODELO_DE_DADOS.md) ·
> [Manual de Uso](./docs/MANUAL_DE_USO.md) ·
> [Funcionalidades Implementadas](./docs/FUNCIONALIDADES.md) ·
> [Limitações e Melhorias Futuras](./docs/LIMITACOES.md)

## Stack tecnológica

- **Next.js 14** (App Router) + **TypeScript** — frontend e backend na mesma aplicação (Server Components + Server Actions + Route Handlers).
- **Prisma ORM** + **SQLite** (arquivo local, ideal para desenvolvimento/demonstração de uma instituição com um único equipamento). O schema é compatível com **PostgreSQL** para produção — veja a seção [Usando PostgreSQL em produção](#usando-postgresql-em-produção).
- **NextAuth.js** (Credentials Provider + JWT) para autenticação, com senhas com hash `bcrypt`.
- **Tailwind CSS** para a interface.
- **pdfkit** para geração dos documentos institucionais em PDF.
- **Recharts** para o gráfico de evolução de carga das baterias.
- **Zod** para validação de dados em todas as Server Actions.
- **Vitest** para testes automatizados das regras de negócio críticas.
- **Docker** / **docker-compose** para execução facilitada.

## Pré-requisitos

- Node.js 20 ou superior
- npm 10 ou superior
- (Opcional) Docker e Docker Compose

## Instalação e execução local

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# edite .env se necessário (a chave NEXTAUTH_SECRET deve ser trocada em produção)

# 3. Criar o banco de dados (SQLite) a partir do schema Prisma
npm run db:push

# 4. Popular o banco com dados de demonstração (usuários e o kit do Mavic 3M)
npm run db:seed

# 5. Rodar o servidor de desenvolvimento
npm run dev
```

Acesse **http://localhost:3000**. Você será redirecionado para a tela de
login.

### Usuários de demonstração

Todos criados pelo `npm run db:seed`, com a senha **`cepin@2024`**:

| Perfil                | E-mail                              |
|------------------------|--------------------------------------|
| Administrador          | admin@cepin.ifsp.edu.br              |
| Responsável pelo CEPIN | responsavel@cepin.ifsp.edu.br        |
| Usuário Autorizado     | pesquisador@cepin.ifsp.edu.br        |
| Operador/Conferente    | conferente@cepin.ifsp.edu.br         |

> **Atenção:** estes usuários e os números de série/patrimônio do kit
> cadastrado pelo seed são **dados fictícios**, destinados apenas a
> demonstração e testes. Substitua-os pelos dados reais do CEPIN antes de
> usar o sistema em produção (crie os usuários reais pela tela
> **Usuários** e ajuste o cadastro dos equipamentos).

### Comandos úteis

| Comando               | Descrição                                                              |
|------------------------|--------------------------------------------------------------------------|
| `npm run dev`          | Sobe o servidor em modo desenvolvimento                                 |
| `npm run build`        | Build de produção                                                        |
| `npm run start`        | Sobe o servidor a partir do build de produção                            |
| `npm run test`         | Roda os testes automatizados (Vitest)                                    |
| `npm run db:push`      | Sincroniza o schema Prisma com o banco de dados                          |
| `npm run db:seed`      | Popula o banco com os dados de demonstração                              |
| `npm run db:reset`     | Recria o banco do zero e popula novamente (⚠️ apaga todos os dados atuais) |
| `npm run db:studio`    | Abre o Prisma Studio (inspeção visual do banco de dados)                  |

## Executando com Docker

```bash
cp .env.example .env
docker compose up --build
```

Na primeira execução, popule o banco com os dados de demonstração:

```bash
docker compose exec app npm run db:seed
```

O serviço fica disponível em **http://localhost:3000**. O arquivo do banco
SQLite é persistido em um volume Docker (`cepin_db_data`), sobrevivendo a
reinicializações do container.

## Usando PostgreSQL em produção

Por padrão o projeto usa SQLite (arquivo local), o que facilita a instalação
e a avaliação do sistema sem depender de infraestrutura externa. Para um
ambiente de produção institucional, recomenda-se PostgreSQL:

1. Em `prisma/schema.prisma`, troque:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
   por:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Ajuste `DATABASE_URL` no `.env` para uma string de conexão PostgreSQL, por
   exemplo: `postgresql://usuario:senha@localhost:5432/cepin`.
3. Rode `npm run db:push` (ou configure migrações com `prisma migrate` para
   um fluxo de versionamento de schema mais rigoroso).

Nenhum outro código precisa ser alterado — o restante do schema e das
consultas Prisma é compatível com ambos os bancos.

## Estrutura do projeto

```
prisma/
  schema.prisma      # modelo de dados (20 entidades)
  seed.ts             # dados de demonstração
src/
  app/
    login/            # tela de login (fora da autenticação)
    (app)/             # área autenticada (dashboard + todos os módulos)
    api/               # rotas de geração de PDF, exportação CSV e NextAuth
  components/          # componentes de UI reutilizáveis e por módulo
  lib/
    actions/           # Server Actions (uma por módulo), com validação e permissão
    auth.ts            # configuração do NextAuth
    permissions.ts     # matriz de permissões central (aplicada no backend)
    pdf/               # geração dos documentos institucionais em PDF
    reports.ts          # consultas usadas pelos relatórios
    ...
tests/                 # testes automatizados (Vitest)
docs/                  # documentação complementar
```

## Testes automatizados

```bash
npm run test
```

Os testes cobrem as regras de negócio críticas que não dependem de sessão
HTTP/banco de dados real (matriz de permissões, validação de carga 0–100%,
detecção de conflito de agenda, cálculo de duração de atividades, geração de
códigos sequenciais, navegação da agenda, exportação CSV). O fluxo completo
de ponta a ponta (login → solicitação → aprovação → retirada → geração de
PDF → utilização → devolução → encerramento → ocorrências → manutenção →
relatórios → configurações → usuários → agenda) foi validado manualmente em
navegador real contra o build de produção — ver detalhes em
[docs/LIMITACOES.md](./docs/LIMITACOES.md).

## Segurança

- Autorização é sempre verificada no **backend** (dentro de cada Server
  Action, via `requirePermission`), nunca apenas ocultando botões na
  interface.
- Senhas armazenadas com hash `bcrypt` (nunca em texto puro).
- Segredos (chave do NextAuth, string de conexão do banco) ficam em
  variáveis de ambiente, nunca no código-fonte (`.env` está no
  `.gitignore`; use `.env.example` como referência).
- Toda mutação relevante do sistema é registrada em uma trilha de auditoria
  (`audit_logs`), consultável em **Relatórios → Auditoria** por
  Administrador e Responsável pelo CEPIN.

## Licença e uso

Projeto acadêmico/institucional desenvolvido para o CEPIN — IFSP Câmpus
Araraquara.
