# Modelo de Dados

O schema completo está em [`prisma/schema.prisma`](../prisma/schema.prisma).
Este documento resume as 20 entidades e as decisões de modelagem mais
relevantes.

> **Nota sobre tipos**: o SQLite não possui um tipo `enum` nativo. Campos que
> representam um conjunto fixo de valores (papel do usuário, status,
> tipos de ocorrência etc.) são armazenados como `String` no banco e
> validados na camada de aplicação com Zod — os conjuntos válidos estão
> centralizados em [`src/lib/enums.ts`](../src/lib/enums.ts). Ao migrar para
> PostgreSQL, é possível (mas não obrigatório) convertê-los para `enum` do
> Prisma sem alterar a lógica de aplicação.

## Usuários e projetos

- **`users`** — perfil (`ADMIN`, `RESPONSAVEL_CEPIN`, `USUARIO_AUTORIZADO`,
  `OPERADOR_CONFERENTE`), matrícula, cargo, setor, `active` (exclusão
  lógica — usuários nunca são apagados fisicamente, apenas inativados).
- **`projects`** — projetos/atividades aos quais uma solicitação, retirada
  ou atividade de voo podem ser vinculados (usado nos relatórios por
  projeto).

## Cadastro patrimonial

- **`equipment`** — o drone (e qualquer outro equipamento futuro): nome,
  fabricante, modelo, número de patrimônio (opcional — nem todo item possui
  um), número de série, unidade/setor, data de aquisição, status
  (`DISPONIVEL`, `RESERVADO`, `EM_USO`, `EM_MANUTENCAO`, `INDISPONIVEL`,
  `BAIXADO`).
- **`accessories`** — hélices, controle remoto, cabos, maleta, módulo RTK,
  filtro ND, carregador/hub. Vinculados a um `equipment`, com identificador
  interno próprio (nem todo acessório tem número de patrimônio individual).

## Baterias (módulo crítico)

- **`batteries`** — cada uma das 4 baterias (1 principal + 3 extras) com
  código, status operacional, **carga atual (%)** e **ciclos informados
  manualmente** (`cycleCount`). O sistema nunca estima ciclos — eles só são
  atualizados quando um usuário os informa explicitamente (ver
  `battery_usage_records`).
- **`battery_charge_records`** — histórico de carregamento: início, fim,
  carga antes/depois, quem registrou.
- **`battery_usage_records`** — histórico de uso em uma atividade
  (`flight_logs`) ou retirada: carga antes/depois, ciclos informados
  naquele momento (opcional).

Regra de negócio aplicada na camada de aplicação (`src/lib/validators.ts`):
percentuais de carga são sempre validados entre 0 e 100.

## Agenda / Solicitações

- **`reservations`** — a solicitação de retirada, com todo o ciclo de
  status: `RASCUNHO → SOLICITADA → EM_ANALISE → APROVADA/REJEITADA →
  RETIRADA → EM_USO → DEVOLVIDA → ENCERRADA` (ou `CANCELADA` em qualquer
  ponto anterior à retirada física).
- **`reservation_batteries`** — tabela de junção com as baterias planejadas
  para a solicitação.

A verificação de conflito de agenda (`src/lib/reservationConflict.ts`)
consulta todas as solicitações "ativas" (que ocupam a agenda) do mesmo
equipamento e testa sobreposição de intervalo — aplicada tanto na criação
quanto na aprovação de uma solicitação (o estado pode ter mudado entre os
dois momentos).

## Retiradas (Termo de Retirada)

- **`withdrawals`** — a retirada física, criada a partir de uma
  `reservation` **aprovada**. Guarda os campos institucionais (número do
  termo, processo/documento SUAP), o checklist de entrega (JSON) e o
  responsável.
- **`withdrawal_items`** — cada item conferido na entrega (o próprio
  equipamento, cada acessório, cada bateria), com condição e — no caso de
  baterias — carga no momento da entrega.

## Utilização (diário de voo)

- **`flight_logs`** — cada atividade de voo dentro de uma retirada: data,
  horário de início/fim (informados manualmente — o sistema não possui
  integração de telemetria), duração calculada automaticamente, tipo de
  atividade, projeto, ocorrências.

## Devolução

- **`returns`** — devolução vinculada 1:1 a uma `withdrawal`. Tem
  `closedAt` separado de `returnedAt`: a devolução física pode acontecer
  antes do **encerramento administrativo** (que só ocorre quando eventuais
  pendências/avarias foram tratadas ou justificadas).
- **`return_items`** — espelha `withdrawal_items`, registrando o que
  efetivamente retornou e em que condição.

## Ocorrências e Manutenção

- **`incidents`** — avarias, falhas, perdas, furtos, acidentes. Pode
  bloquear a disponibilidade do item afetado (`blocksEquipment`).
- **`maintenance_records`** — manutenções preventivas, corretivas,
  calibrações, atualizações de firmware, limpeza, inspeções.

Ambas as tabelas existem separadamente (para refletir a modelagem sugerida)
mas são apresentadas juntas em uma única tela (`/ocorrencias`), pois no dia
a dia do CEPIN elas são tratadas pelo mesmo fluxo de "algo aconteceu com o
equipamento".

## Documentos, auditoria e configuração

- **`documents`** — metadados de cada PDF gerado (Termo de Retirada,
  Comprovante de Devolução) e um campo livre `externalReference` para
  registrar, por exemplo, o número do documento SUAP em que o PDF foi
  anexado manualmente. **Não há upload de arquivo binário nem integração
  automática com o SUAP** — ver [LIMITACOES.md](./LIMITACOES.md).
- **`audit_logs`** — toda mutação relevante (criar, atualizar, aprovar,
  rejeitar, mudar status, gerar PDF, login) é registrada aqui com usuário,
  data/hora e uma descrição legível — consultável em **Relatórios →
  Auditoria**.
- **`system_settings`** — parâmetros institucionais configuráveis (nome da
  instituição, limiar de carga baixa, dados usados no cabeçalho/assinatura
  dos PDFs), como pares chave/valor.

## Integridade e histórico

- Chaves estrangeiras em todas as relações; nenhuma tabela permite
  registros órfãos de suas entidades pai.
- Datas de criação/atualização (`createdAt`/`updatedAt`) em praticamente
  todas as tabelas.
- Nenhuma operação do sistema apaga fisicamente um registro histórico
  (retiradas, devoluções, atividades de voo, ocorrências, manutenções):
  "excluir" um usuário ou acessório é sempre uma alteração de status
  (`active = false`, `INDISPONIVEL`, etc.), preservando o histórico para
  auditoria e prestação de contas.
