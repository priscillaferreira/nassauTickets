# Plano de Testes — nassauTickets

## Testes automatizados (backend)
Executar: `cd backend && npm test` — 20 testes cobrindo RN02–RN12, concorrência e relatórios.

## Testes manuais (roteiro do Testador)
| # | Cenário | Passos | Resultado esperado | OK? |
|---|---------|--------|--------------------|-----|
| T01 | Emitir senha | Totem → Geral | Senha no formato `YYMMDD-SG001` | ☐ |
| T02 | Sequência por tipo | Emitir 2 SG e 1 SP | SG001, SG002, SP001 | ☐ |
| T03 | Login inválido | Senha errada | "Usuário ou senha inválidos" | ☐ |
| T04 | Prioridade | Emitir SG, SE, SP; chamar 3 vezes | Ordem SP, SE, SG | ☐ |
| T05 | Painel | Chamar 6 senhas | Painel mostra só as 5 últimas | ☐ |
| T06 | Chamar novamente | Chamar → Chamar novamente | Selo "Última chamada" + áudio | ☐ |
| T07 | Não compareceu | Após 2 chamadas clicar "Não compareceu" | Estado NÃO_COMPARECEU | ☐ |
| T08 | Guichê ocupado | Chamar próxima sem finalizar | Mensagem de bloqueio | ☐ |
| T09 | Concorrência | 2 navegadores, guichês 1 e 2, clicar juntos | Senhas diferentes | ☐ |
| T10 | Backend fora | Parar o backend (Ctrl+C) | Faixa vermelha; painel mantém dados | ☐ |
| T11 | Relatório | Gestão → Operação → Simular; gerar relatório diário | Totais e tabelas preenchidos | ☐ |
| T12 | Acesso gestor | Logar como `bruno` e abrir /gestao | "Acesso permitido apenas ao gestor" | ☐ |
| T13 | Acessibilidade | Navegar só com Tab/Enter | Todos os botões acessíveis com foco visível | ☐ |
