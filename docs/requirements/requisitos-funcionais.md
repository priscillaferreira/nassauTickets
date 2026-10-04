# Requisitos Funcionais — nassauTickets

> Base: documento *Sistema para controle de atendimento* (Laboratório de Análises Clínicas).
> Agentes: **AS** (Agente Sistema), **AA** (Agente Atendente), **AC** (Agente Cliente).
> Status: ✅ implementado na fase 1 · 🟡 parcial · ⏳ previsto para a fase 2.

| ID | Requisito | Ator | Prioridade | Status |
|----|-----------|------|-----------|--------|
| RF01 | O sistema deve permitir que o cliente emita uma senha no totem escolhendo o tipo **SP**, **SE** ou **SG**, sem se identificar. | AC | Alta | ✅ |
| RF02 | O sistema deve numerar cada senha no padrão **YYMMDD-PPSQ** (ver RN05). | AS | Alta | ✅ |
| RF03 | O sistema deve manter a fila de atendimento aplicando as regras de priorização (RN02, RN03, RN04). | AS | Alta | ✅ |
| RF04 | O atendente deve poder **chamar a próxima senha**; o sistema escolhe a senha e a direciona ao guichê do atendente. | AA | Alta | ✅ |
| RF05 | O atendente deve poder **chamar novamente** a senha atual; o painel e o áudio indicam **"Última chamada"**. | AA | Alta | ✅ |
| RF06 | O atendente deve poder **iniciar o atendimento** quando o cliente chegar ao guichê. | AA | Alta | ✅ |
| RF07 | O atendente deve poder **finalizar o atendimento**. | AA | Alta | ✅ |
| RF08 | O atendente deve poder registrar que o cliente **não compareceu** após a segunda chamada; ao chamar a próxima com uma senha já chamada 2 vezes, o sistema a abandona automaticamente. | AA/AS | Alta | ✅ |
| RF09 | O painel deve exibir as **5 últimas senhas chamadas** com o guichê, **sem exibir a próxima senha**. | AS | Alta | ✅ |
| RF10 | O painel deve **anunciar por áudio** a chamada informando prioridade, sequencial e guichê. | AS | Média | ✅ |
| RF11 | O atendente deve se **autenticar** (usuário, senha e guichê) para usar as funções de atendimento. | AA | Alta | ✅ |
| RF12 | O gestor deve poder **cadastrar e listar atendentes**. | Gestor | Média | 🟡 (editar/inativar na fase 2) |
| RF13 | O gestor deve poder emitir **relatórios diário e mensal** com: total de senhas emitidas e atendidas (geral e por prioridade), relatório detalhado e relatório de TM. | Gestor | Alta | ✅ |
| RF14 | O gestor deve poder emitir o **relatório de auditoria**: atendente, guichê, senha, 1ª chamada, 2ª chamada, início e fim do atendimento. | Gestor | Alta | ✅ |
| RF15 | O sistema deve controlar o **expediente (7h–17h)**, bloqueando emissão/chamada fora do horário e descartando as senhas que ficaram na fila ao final. | AS | Alta | ✅ |
| RF16 | O sistema deve apresentar **indicadores de desempenho** por atendente e por tipo de senha. | Gestor | Média | ✅ |
| RF17 | O sistema deve informar ao atendente **quantas** senhas há na fila por tipo (sem revelar qual será a próxima). | AA | Baixa | ✅ |
| RF18 | O frontend deve **detectar indisponibilidade** do backend e informar o usuário, reconectando automaticamente. | AS | Média | ✅ |
| RF19 | O gestor deve poder **simular um dia de atendimento** para validar regras e relatórios. | Gestor | Baixa | ✅ |
| RF20 | O sistema deve **persistir os dados em MySQL 8.0**. | AS | Alta | ⏳ |
| RF21 | O sistema deve permitir **exportar relatórios** (PDF/CSV). | Gestor | Baixa | ⏳ (fase 1: impressão pelo navegador) |
