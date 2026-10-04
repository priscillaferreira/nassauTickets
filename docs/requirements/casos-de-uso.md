# Especificação dos Casos de Uso — nassauTickets

Diagrama: [`docs/models/uml/diagrama-casos-de-uso.md`](../models/uml/diagrama-casos-de-uso.md)

| ID | Caso de uso | Ator principal |
|----|-------------|----------------|
| UC01 | Emitir senha | Cliente (AC) |
| UC02 | Acompanhar painel | Cliente (AC) |
| UC03 | Autenticar-se | Atendente (AA) |
| UC04 | Chamar próxima senha | Atendente (AA) |
| UC05 | Chamar novamente | Atendente (AA) |
| UC06 | Iniciar atendimento | Atendente (AA) |
| UC07 | Finalizar atendimento | Atendente (AA) |
| UC08 | Registrar não comparecimento | Atendente (AA) |
| UC09 | Gerar relatórios | Gestor |
| UC10 | Cadastrar atendente | Gestor |
| UC11 | Encerrar expediente | Gestor / Sistema (AS) |
| UC12 | Anunciar chamada | Sistema (AS) |

---

## UC01 – Emitir senha
- **Ator:** Cliente · **Requisitos:** RF01, RF02 · **Regras:** RN01, RN05, RN09, RN15
- **Pré-condição:** estar dentro do expediente.
- **Fluxo principal:**
  1. O cliente toca no tipo de atendimento (Prioritária, Retirada de Exames ou Geral).
  2. O sistema gera o número (ex.: `260930-SG014`), registra a senha como EMITIDA e a coloca na fila (AGUARDANDO).
  3. O totem exibe a senha, a data/hora e a orientação para aguardar o painel.
  4. Após 8 segundos, o totem volta à tela inicial.
- **Fluxos alternativos:**
  - *A1 – Fora do expediente:* o sistema recusa e informa o horário de funcionamento.
  - *A2 – Servidor indisponível:* o totem orienta o cliente a procurar a recepção.

## UC02 – Acompanhar painel
- **Ator:** Cliente · **Requisitos:** RF09, RF10 · **Regras:** RN11
- **Fluxo principal:** o painel mostra em destaque a última senha chamada e o guichê, e ao lado as 4 anteriores; a cada nova chamada toca um aviso sonoro com a fala da senha.
- **Alternativo:** se o servidor cair, mantém os últimos dados e mostra "Reconectando…".

## UC03 – Autenticar-se
- **Ator:** Atendente · **Requisitos:** RF11 · **Regras:** RN14, RN16
- **Fluxo principal:** 1) informa usuário, senha e guichê; 2) o sistema valida e cria a sessão; 3) abre a tela do guichê.
- **Alternativos:** credenciais inválidas → mensagem genérica; guichê em uso → recusa.

## UC04 – Chamar próxima senha
- **Ator:** Atendente · **Requisitos:** RF04, RF03 · **Regras:** RN02–RN04, RN06, RN09, RN13
- **Pré-condição:** atendente logado e guichê livre (ou com senha já chamada duas vezes).
- **Fluxo principal:**
  1. O atendente clica em **Chamar próxima**.
  2. O sistema (com bloqueio de concorrência) escolhe a senha conforme a alternância SP → SE|SG.
  3. A senha passa para CHAMADA, é vinculada ao guichê e ao atendente e aparece no painel.
  4. O painel anuncia a chamada (UC12).
- **Alternativos:**
  - *A1 – Fila vazia:* informa "Não há senhas na fila".
  - *A2 – Senha atual em CHAMADA_NOVAMENTE:* o sistema a marca como NÃO_COMPARECEU e segue para o passo 2.
  - *A3 – Senha atual em CHAMADA ou EM_ATENDIMENTO:* o sistema recusa a ação.
  - *A4 – Dois atendentes clicam juntos:* as solicitações são processadas em série; cada guichê recebe uma senha diferente.

## UC05 – Chamar novamente
- **Pré-condição:** senha do guichê no estado CHAMADA.
- **Fluxo:** a senha passa para CHAMADA_NOVAMENTE, a hora da 2ª chamada é registrada e o painel anuncia **"Última chamada"**.

## UC06 – Iniciar atendimento
- **Pré-condição:** senha em CHAMADA ou CHAMADA_NOVAMENTE.
- **Fluxo:** cliente chega ao guichê; atendente clica em **Iniciar**; a senha vai para EM_ATENDIMENTO e o cronômetro começa.

## UC07 – Finalizar atendimento
- **Pré-condição:** senha EM_ATENDIMENTO.
- **Fluxo:** atendente clica em **Finalizar**; senha vai para ATENDIDA; o guichê fica livre.

## UC08 – Registrar não comparecimento
- **Pré-condição:** senha em CHAMADA_NOVAMENTE.
- **Fluxo:** atendente clica em **Não compareceu**; senha vai para NÃO_COMPARECEU.

## UC09 – Gerar relatórios
- **Ator:** Gestor · **Requisitos:** RF13, RF14, RF16
- **Fluxo:** escolhe **diário** (data) ou **mensal** (mês); o sistema mostra totais, quantitativo por prioridade, TM de referência x TM real, desempenho por atendente, relatório detalhado e de auditoria; o gestor pode imprimir.

## UC10 – Cadastrar atendente
- **Ator:** Gestor · **Requisito:** RF12 · **Regra:** RN14
- **Fluxo:** informa nome, login e senha (mín. 6 caracteres); o sistema valida login único e grava o hash da senha.

## UC11 – Encerrar expediente
- **Atores:** Gestor (manual) ou Sistema (automático após as 17h) · **Regras:** RN10
- **Fluxo:** todas as senhas AGUARDANDO passam para NÃO_COMPARECEU com motivo DESCARTADA_FIM_EXPEDIENTE; atendimentos em andamento continuam até o atendente finalizar.

## UC12 – Anunciar chamada
- **Ator:** Sistema · **Requisito:** RF10
- **Fluxo:** ao detectar nova chamada, o painel emite um bip e fala: "Senha *Prioritária*, número *5*. Dirija-se ao guichê *2*." Na 2ª chamada, a frase começa com "Última chamada!".
