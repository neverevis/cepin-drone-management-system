# Manual de Uso

Este manual descreve o fluxo típico de uso do sistema, perfil por perfil.
Para instalar e rodar o sistema, veja o [README](../README.md).

## Perfis de acesso

| Perfil                  | Pode fazer                                                                                                    |
|--------------------------|----------------------------------------------------------------------------------------------------------------|
| **Administrador**        | Tudo: cadastrar/editar equipamentos, baterias, acessórios; gerenciar usuários; aprovar solicitações; registrar retiradas/devoluções; gerenciar ocorrências e manutenções; configurar o sistema; ver relatórios e auditoria. |
| **Responsável pelo CEPIN** | Consultar equipamentos; aprovar/rejeitar solicitações; conferir devoluções e encerrá-las; gerenciar ocorrências; ver relatórios e auditoria. |
| **Usuário Autorizado**   | Solicitar retirada; consultar disponibilidade (agenda); registrar utilização (voos); registrar carga/uso de bateria; reportar ocorrências; ver relatórios. |
| **Operador/Conferente**  | Registrar a retirada física (conferência de saída); registrar a devolução física (conferência de entrada); reportar ocorrências; registrar carregamento de bateria. |

## Fluxo completo (do pedido à devolução)

1. **Usuário Autorizado** acessa **Solicitações → Nova solicitação**,
   escolhe o equipamento, a finalidade, o local, o período (data/hora de
   retirada e devolução previstas) e, se aplicável, as baterias planejadas.
   O sistema impede o envio se já existir outra solicitação com período
   sobreposto para o mesmo equipamento.
2. **Administrador** ou **Responsável pelo CEPIN** acessa a solicitação
   (pela lista em **Solicitações** ou pela **Agenda**) e a **aprova** ou
   **rejeita**, podendo registrar um parecer.
3. No dia da retirada, um **Operador/Conferente** (ou Administrador) abre a
   solicitação aprovada e clica em **Registrar retirada física**: confere o
   checklist de entrega (aeronave, controle, hélices, cada bateria,
   carregador, cartão SD, demais acessórios), informa a carga de cada
   bateria entregue e confirma. Isso gera o **Termo de Retirada** (número
   único) e já disponibiliza o botão **Gerar Termo (PDF)** para download —
   o PDF deve ser assinado e, se necessário, anexado ao processo SUAP
   correspondente (o sistema permite registrar os números do processo e do
   documento SUAP, mas não realiza a assinatura eletrônica nem o envio
   automático — ver [LIMITACOES.md](./LIMITACOES.md)).
4. Durante o uso, o piloto (ou qualquer usuário autorizado) registra cada
   voo em **Registrar utilização**, a partir da tela da retirada: data,
   horário de início/fim (a duração é calculada automaticamente), tipo de
   atividade, local e a carga da(s) bateria(s) usada(s) antes/depois do
   voo. É possível registrar quantas atividades forem necessárias na mesma
   retirada.
5. Ao final, o responsável leva o equipamento de volta e um
   **Operador/Conferente** registra a **devolução**: confere o checklist de
   devolução, informa a carga final de cada bateria, registra a condição
   física geral e, se houver avaria/perda/divergência, marca a opção
   correspondente e descreve o ocorrido. Isso já disponibiliza o
   **Comprovante de Devolução (PDF)**.
6. Um **Administrador** ou **Responsável pelo CEPIN** revisa a devolução e
   a **encerra** (com uma nota de providências, obrigatória se houve
   avaria) — só então a solicitação é marcada como `ENCERRADA` e o ciclo se
   completa.

## Baterias

Em **Baterias**, cada uma das 4 baterias tem sua própria página com:

- Carga atual e gráfico de evolução de carga ao longo do tempo.
- **Iniciar carregamento** / **Concluir carregamento** — registra a data e
  a carga antes/depois de um ciclo de carregamento (útil quando o
  carregamento acontece fora do contexto de uma retirada, por manutenção
  preventiva das baterias).
- **Registrar uso manual** — para anotar uso, ciclos informados pelo
  aplicativo DJI, ou observações (aquecimento, deformações etc.) fora do
  fluxo de uma atividade de voo específica.
- Histórico completo de carregamentos e usos, sempre com data/hora e
  usuário responsável.

O sistema nunca calcula ciclos de bateria automaticamente — o número que
aparece é sempre o último valor informado manualmente por um usuário, o que
é destacado no formulário para evitar a impressão de que é um dado de
telemetria.

## Agenda

Em **Agenda**, é possível visualizar as solicitações em três formatos:
mês (calendário), semana e lista — cada solicitação aparece colorida de
acordo com seu status.

## Ocorrências e Manutenção

Uma única tela com duas abas:

- **Ocorrências**: avarias, falhas de funcionamento, problemas de bateria,
  perda/extravio, furto, acidente. Um Administrador ou Responsável pelo
  CEPIN pode definir a gravidade, registrar providências e, se necessário,
  **bloquear a disponibilidade** do item afetado até a liberação.
- **Manutenções**: preventiva, corretiva, calibração, atualização de
  firmware, limpeza, inspeção — com responsável, data agendada/concluída e
  custo.

## Relatórios

Quatro relatórios com filtro por período/projeto/usuário/status e
exportação em CSV: **Utilização**, **Baterias**, **Patrimonial** e
**Retiradas**. Administradores e Responsáveis pelo CEPIN também têm acesso
a uma aba de **Auditoria**, com o histórico de ações relevantes do sistema.

## Configurações

Um Administrador pode ajustar, em **Configurações**: o nome da instituição
e do câmpus, o nome/sigla do centro, o limiar de carga considerado "baixa"
(usado nos alertas do painel), o limite de ciclos de bateria a partir do
qual o sistema avisa (a DJI recomenda substituição a partir de 200 ciclos),
o setor padrão e os dados usados na assinatura dos documentos gerados.

## Usuários

Em **Usuários** (apenas Administrador), é possível cadastrar novos
usuários com o perfil adequado, editar dados cadastrais, redefinir senha e
inativar/reativar um acesso (a exclusão é sempre lógica — o histórico de um
usuário nunca é perdido).
