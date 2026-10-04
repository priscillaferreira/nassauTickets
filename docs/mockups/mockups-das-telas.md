# Mockups das Telas — nassauTickets

Protótipos de baixa fidelidade (wireframes). As telas implementadas em React seguem estes esboços.
Cores e fontes: ver [`docs/branding`](../branding/identidade-visual.md).

## 1. Totem (`/totem`)
```
┌──────────────────────────────────────────────────────────────────┐
│ [logo] nassauTickets     Totem  Painel  Atendente        [Entrar]│
├──────────────────────────────────────────────────────────────────┤
│          Bem-vindo! Escolha o tipo de atendimento                │
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐      │
│  │  PRIORITÁRIA   │  │ RETIRADA DE    │  │     GERAL      │      │
│  │   (vermelho)   │  │ EXAMES (roxo)  │  │    (azul)      │      │
│  │ Idosos, gest., │  │ Buscar         │  │ Coleta e demais│      │
│  │ PcD, lactantes │  │ resultados     │  │ serviços       │      │
│  └────────────────┘  └────────────────┘  └────────────────┘      │
│                                                                  │
│   🔒 Nenhum dado pessoal é solicitado para emitir a senha (LGPD) │
└──────────────────────────────────────────────────────────────────┘

Após o toque:
┌──────────────────────────────────────┐
│             Sua senha                │
│      ┌──────────────────────┐        │
│      │        GERAL         │        │
│      │    260930-SG014      │        │
│      └──────────────────────┘        │
│   Emitida em 30/09/2026 09:12:03     │
│   Aguarde ser chamado no painel.     │
│             [ Concluir ]             │
└──────────────────────────────────────┘
```

## 2. Painel de chamadas (`/painel`) — exibido em TV
```
┌──────────────────────────────────────────────────────────────────┐
│ Painel de Chamadas                                 [🔊 Ativar som]│
├───────────────────────────────────────────┬──────────────────────┤
│              SENHA CHAMADA                │   ÚLTIMAS CHAMADAS   │
│  ┌─────────────────────────────────────┐  │ ┌──────────────────┐ │
│  │         [ÚLTIMA CHAMADA]            │  │ │ 260930-SE003  G1 │ │
│  │           PRIORITÁRIA               │  │ ├──────────────────┤ │
│  │         260930-SP005                │  │ │ 260930-SG011  G3 │ │
│  │           GUICHÊ 2                  │  │ ├──────────────────┤ │
│  └─────────────────────────────────────┘  │ │ 260930-SP004  G1 │ │
│                09:15:42                   │ ├──────────────────┤ │
│                                           │ │ 260930-SG010  G2 │ │
│                                           │ └──────────────────┘ │
└───────────────────────────────────────────┴──────────────────────┘
  (a próxima senha NUNCA é exibida — RN11)
```

## 3. Login do atendente (`/login`)
```
┌──────────────────────────────┐
│     Acesso do Atendente      │
│ Usuário  [______________]    │
│ Senha    [______________]    │
│ Guichê   [ Guichê 1   ▼ ]    │
│          [   Entrar    ]     │
└──────────────────────────────┘
```

## 4. Guichê do atendente (`/atendente`)
```
┌──────────────────────────────────────────────────────────────────┐
│ Guichê 2                                   Bruno · Guichê 2 [Sair]│
│ ┌─────────┐ ┌──────────────┐ ┌───────────┐ ┌────────────┐        │
│ │Na fila 9│ │Prioritárias 2│ │ Exames 3  │ │ Gerais 4   │        │
│ └─────────┘ └──────────────┘ └───────────┘ └────────────┘        │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │   ┌──────────────────┐                                       │ │
│ │   │  260930-SP005    │  Situação: Em atendimento  ⏱ 04:32    │ │
│ │   └──────────────────┘                                       │ │
│ │ [📢 Chamar próxima] [🔁 Chamar novamente] [▶️ Iniciar]         │ │
│ │ [✅ Finalizar]      [🚫 Não compareceu]                       │ │
│ └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
  Botões ficam habilitados/desabilitados conforme o estado da senha.
```

## 5. Gestão (`/gestao`) — somente gestor
```
┌──────────────────────────────────────────────────────────────────┐
│ Gestão     [Relatórios] [Cadastros] [Operação]                   │
│ Tipo [Diário ▼]  Data [30/09/2026]  [Gerar relatório] [Imprimir] │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│ │Emitidas  │ │Atendidas │ │ TM geral │ │ Espera   │              │
│ │   152    │ │ 141 (93%)│ │ 6,1 min  │ │ 12,4 min │              │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘              │
│ Quantitativo e TM por prioridade   (tabela)                      │
│ Desempenho por atendente           (tabela)                      │
│ Relatório detalhado das senhas     (tabela)                      │
│ Relatório de auditoria             (tabela)                      │
└──────────────────────────────────────────────────────────────────┘
```
