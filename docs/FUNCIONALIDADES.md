# Funcionalidades Implementadas

## Autenticação e controle de acesso
- [x] Login com e-mail/senha (hash bcrypt), sessão JWT.
- [x] 4 perfis de acesso (Administrador, Responsável pelo CEPIN, Usuário
      Autorizado, Operador/Conferente) com matriz de permissões aplicada no
      **backend** (cada Server Action valida a permissão antes de mutar dados).
- [x] Rotas protegidas por middleware; usuários inativos não conseguem logar.

## Cadastro patrimonial
- [x] CRUD de equipamentos (nome, fabricante, modelo, patrimônio, série,
      unidade, setor, aquisição, status, observações).
- [x] CRUD de acessórios vinculados a um equipamento, com identificador
      interno próprio (independente de número de patrimônio).
- [x] Histórico de retiradas e ocorrências por equipamento.

## Baterias
- [x] Cadastro individual de cada bateria (código, principal/extra, modelo,
      capacidade, aquisição).
- [x] Registro de carga atual, com validação 0–100%.
- [x] Início/fim de carregamento com carga antes/depois.
- [x] Registro de uso (manual ou vinculado a uma atividade de voo) com
      carga antes/depois e ciclos informados manualmente.
- [x] Gráfico de evolução de carga e tabelas de histórico de carregamento e
      uso.
- [x] Alerta de carga baixa e aviso de ciclos próximos do limite
      recomendado pela DJI (200 ciclos), ambos com limiar configurável.

## Agenda e Solicitações
- [x] Criação de solicitação com equipamento, projeto, finalidade, local,
      período e baterias planejadas.
- [x] Verificação de conflito de agenda (impede duas solicitações
      sobrepostas para o mesmo equipamento), reaplicada na aprovação.
- [x] Fluxo de aprovação/rejeição com parecer, registrando quem e quando.
- [x] Cancelamento de solicitação (pelo próprio solicitante ou por quem
      aprova) antes da retirada física.
- [x] Visualização em mês, semana e lista.

## Retiradas
- [x] Registro da retirada física a partir de uma solicitação aprovada,
      com checklist de entrega, carga de cada bateria e responsável.
- [x] Geração do **Termo de Retirada, Responsabilidade e Registro de Uso**
      em PDF, com dados reais, campos de processo/documento SUAP e espaço
      para assinaturas.
- [x] Registro de que o termo foi gerado (auditoria), sem que isso implique
      assinatura ou aprovação institucional automática.

## Utilização (diário de voo)
- [x] Múltiplos registros de voo por retirada, com cálculo automático de
      duração a partir dos horários informados.
- [x] Tipo de atividade, projeto, local, ocorrências e observações.
- [x] Registro de carga de bateria antes/depois de cada voo.

## Devolução
- [x] Checklist de devolução, condição física, avaria/pendência.
- [x] Atualização automática do status do equipamento e das baterias.
- [x] Geração do **Comprovante de Devolução** em PDF.
- [x] Encerramento administrativo separado da devolução física (só é
      permitido concluir com pendência/avaria mediante justificativa).

## Ocorrências e Manutenção
- [x] Registro de avarias, falhas, perda/extravio, furto, acidente, com
      gravidade e status.
- [x] Bloqueio de disponibilidade do item afetado por uma ocorrência grave.
- [x] Registro de manutenções preventivas/corretivas/calibração/firmware/
      limpeza/inspeção, com responsável e custo.

## Dashboard
- [x] Indicadores em tempo real: equipamentos disponíveis, retiradas em
      andamento, solicitações aguardando análise, ocorrências em aberto,
      horas de uso e atividades no período, baterias com carga baixa,
      devoluções com pendências.
- [x] Situação atual de cada equipamento e bateria.
- [x] Próximas retiradas aprovadas e retiradas em andamento.

## Relatórios
- [x] Relatório de Utilização, Baterias, Patrimonial e Retiradas, com
      filtros por período/projeto/usuário/status.
- [x] Exportação em CSV de cada relatório.
- [x] Trilha de auditoria consultável (Administrador e Responsável pelo
      CEPIN).

## Configurações
- [x] Parâmetros institucionais configuráveis (nomes, limiares, dados de
      assinatura dos documentos).

## Usuários
- [x] CRUD de usuários com definição de perfil, redefinição de senha e
      inativação/reativação (exclusão lógica).

## Infraestrutura e qualidade
- [x] Banco de dados relacional normalizado (20 entidades), com chaves
      estrangeiras e sem registros órfãos.
- [x] Transações no Prisma para as operações que afetam múltiplas tabelas.
- [x] Dados de demonstração claramente identificados como fictícios.
- [x] Testes automatizados (Vitest) das regras de negócio críticas.
- [x] Docker e docker-compose para execução facilitada.
- [x] `.env.example` documentado; nenhum segredo no código-fonte.

Para o que **não** foi implementado (ou foi implementado de forma
simplificada em relação ao pedido original), veja
[LIMITACOES.md](./LIMITACOES.md).
