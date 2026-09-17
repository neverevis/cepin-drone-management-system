# Limitações e Melhorias Futuras

Este documento lista, de forma transparente, o que foi simplificado ou
deixado de fora do escopo desta primeira versão — e por quê.

## Decisões de escopo deliberadas

- **Sem integração real com o SUAP.** O sistema registra os campos de
  processo e documento SUAP e permite anexar uma referência externa
  (`externalReference`), mas **não** existe uma API do SUAP inventada nem
  envio automático de documentos. Isso foi uma decisão explícita: uma
  integração real exigiria credenciais e endpoints institucionais que não
  devem ser simulados. Uma futura integração oficial poderia consumir a API
  do SUAP (quando disponível) a partir da rota que gera o Termo em PDF,
  anexando o arquivo automaticamente ao processo.
- **Sem assinatura eletrônica.** Os PDFs gerados têm espaço para assinatura
  manual (física ou por um sistema de assinatura eletrônica externo, como
  o SUAP/gov.br). A geração do PDF é explicitamente tratada como um passo
  administrativo, não como uma aprovação ou assinatura.
- **Sem upload de arquivos binários.** O modelo `documents` guarda metadados
  de cada PDF gerado (e permite anexar fotos/ocorrências como texto/link),
  mas não há um serviço de armazenamento de arquivos (S3, disco local com
  antivírus, etc.) para anexos genéricos. Adicionar isso é relativamente
  simples (um novo campo de upload + um provedor de armazenamento), mas foi
  deixado de fora para não introduzir uma dependência de infraestrutura
  extra sem necessidade clara no momento.
- **Papéis fixos, não um RBAC dinâmico.** Os 4 perfis e a matriz de
  permissões vivem no código (`src/lib/permissions.ts`), não em tabelas
  `roles`/`permissions` editáveis pela interface. Para uma instituição com
  perfis conhecidos e estáveis, isso é mais simples de auditar do que um
  RBAC totalmente configurável — mas significa que criar um novo perfil
  exige uma alteração de código.
- **Sem telemetria do drone.** Todos os horários de voo, ciclos de bateria
  e níveis de carga são **informados manualmente** pelo usuário — não há
  integração com o DJI Pilot 2 ou com o próprio drone. Isso é deixado
  explícito na interface (ex.: "Os horários informados são registros
  manuais, não há integração de telemetria").

## Limitações técnicas conhecidas

- **Next.js 14.x tem CVEs sem correção na série 14.** O projeto está na
  última versão da série 14.2.x (`14.2.35`), que corrige a maioria dos
  problemas conhecidos, mas o `npm audit` ainda acusa vulnerabilidades cuja
  correção definitiva exige migrar para o Next.js 15/16 — uma mudança de
  major version que alteraria APIs usadas em várias páginas (ex.:
  `searchParams` passa a ser uma Promise). Não foi feita agora para não
  arriscar regressões em um sistema já validado ponta a ponta; é a
  melhoria de infraestrutura mais importante para antes de uma exposição
  pública ampla.
- **Geração de código sequencial (`RET-2025-0001` etc.) não é
  atômica sob alta concorrência** — em teoria, duas requisições simultâneas
  poderiam gerar o mesmo número (o campo é `@unique`, então a segunda
  falharia em vez de duplicar, mas o usuário precisaria tentar novamente).
  Para o volume de uso esperado (um único drone, poucas operações por dia),
  isso não é um problema prático; uma melhoria futura seria uma sequência
  atômica no banco de dados.
- **Sem rate limiting / bloqueio de tentativas de login.** Recomenda-se
  colocar o sistema atrás de um proxy/WAF institucional se for exposto
  publicamente.
- **Backup do banco de dados**: não há rotina automática de backup
  incluída. Para SQLite, recomenda-se copiar periodicamente o arquivo do
  banco (ou o volume Docker); para PostgreSQL, usar a rotina de backup
  padrão da instituição (`pg_dump` agendado).
- **Sem internacionalização** — a interface está inteiramente em
  português (pt-BR), como esperado para o contexto de uso.
- **Acessibilidade básica, não uma auditoria completa de WCAG** — labels,
  foco visível e contraste adequado foram observados, mas não houve uma
  auditoria formal de acessibilidade.

## Estratégia de testes

- Os testes automatizados (`npm run test`, Vitest) cobrem as regras de
  negócio críticas que são **puras** ou de fácil isolamento: matriz de
  permissões, validação de carga (0–100%), detecção de conflito de agenda,
  cálculo de duração de atividades, geração de códigos sequenciais,
  navegação da agenda (mês/semana) e exportação CSV.
- As Server Actions em si (que dependem de sessão HTTP autenticada e do
  Prisma) **não** têm testes de integração automatizados nesta versão —
  isso exigiria uma infraestrutura de banco de testes e mocks do NextAuth
  que não coube no tempo disponível.
- Em compensação, **o fluxo completo do sistema foi validado manualmente em
  navegador real (Chromium via Playwright), contra o build de produção**,
  cobrindo: login de cada um dos 4 perfis, criação e aprovação de
  solicitação (com verificação de conflito), registro de retirada física,
  geração do Termo em PDF, registro de utilização (voo), registro de
  devolução, geração do comprovante em PDF, encerramento da devolução,
  verificação de que o status do equipamento/bateria volta ao normal,
  registro de ocorrência e manutenção, as quatro páginas de relatório e
  suas exportações CSV, atualização de configurações, cadastro de usuário e
  as três visualizações da agenda. Esse processo revelou e permitiu corrigir
  dois problemas reais que só apareciam no build de produção (um erro de
  empacotamento do `pdfkit` e um nome de propriedade reservado do React em
  um componente), reforçando o valor de testar contra o build real e não
  apenas o build de desenvolvimento.
- **Melhoria futura recomendada**: um conjunto de testes end-to-end
  automatizados (Playwright) cobrindo o mesmo roteiro, rodando em CI a cada
  mudança.

## Simplificações de modelagem

- Ocorrências e manutenções ficam em tabelas separadas (`incidents` e
  `maintenance_records`, como sugerido no escopo original), mas são
  exibidas juntas em uma única tela — no dia a dia do CEPIN, ambas
  respondem à mesma pergunta ("o que aconteceu com o equipamento?").
- O checklist de entrega/devolução usa um conjunto fixo de itens
  (aeronave, controle, cada bateria, carregador, cartão SD, demais
  acessórios, maleta) em vez de uma lista dinâmica configurável — reflete o
  kit real do CEPIN (1 drone + acessórios descritos no escopo), mas exigiria
  ajuste de código se o kit crescer significativamente no futuro.
