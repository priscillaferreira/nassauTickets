# Regras de Negócio — nassauTickets

| ID | Regra |
|----|-------|
| **RN01 – Tipos de senha** | Existem 3 tipos: **SP** (Prioritária), **SE** (Retirada de Exames) e **SG** (Geral). |
| **RN02 – Alternância** | A sequência de chamadas segue o modelo **[SP] → [SE\|SG] → [SP] → [SE\|SG]**: após chamar uma SP, a próxima deve ser de outro tipo; após uma SE ou SG, a próxima deve ser SP. |
| **RN03 – Ordem entre SE e SG** | Quando a vez for de "SE\|SG", a **SE tem preferência** (atendimento rápido, "prioridade operacional especial"); a SG só é chamada se não houver SE. |
| **RN04 – Fila vazia** | Se o tipo da vez não tiver senhas, o sistema escolhe o próximo tipo disponível mantendo a ordem de prioridade (SP > SE > SG). Dentro do mesmo tipo vale a ordem de chegada (FIFO). Qualquer guichê atende qualquer tipo. |
| **RN05 – Numeração** | Formato **YYMMDD-PPSQ**: ano, mês e dia com 2 dígitos, tipo com 2 letras e sequência com 3 dígitos **por tipo**, reiniciando todo dia. Ex.: `260930-SP001`. |
| **RN06 – Não comparecimento** | Após **duas chamadas** sem o cliente comparecer, a senha é considerada **abandonada** (NÃO_COMPARECEU) e o sistema passa para a próxima prioridade. |
| **RN07 – Taxa histórica de abandono** | Cerca de **5%** das senhas emitidas não são atendidas por responsabilidade do cliente; são descartadas sem Serviço de Atendimento. Essa taxa é usada na simulação. |
| **RN08 – Tempo Médio (TM)** | SP: 15 min (±5 min, distribuição uniforme). SG: 5 min (±3 min, uniforme). SE: 1 min em 95% dos casos e 5 min em 5%. |
| **RN09 – Expediente** | Senhas só podem ser emitidas e chamadas entre **7h e 17h**. |
| **RN10 – Encerramento** | Às 17h, atendimentos em andamento devem ser concluídos pelo atendente; senhas que ainda estão na fila são **descartadas**. |
| **RN11 – Painel** | Exibe as **5 últimas senhas chamadas**; **não** exibe a próxima, pois uma nova emissão pode alterar a sequência. |
| **RN12 – Máquina de estados** | EMITIDA → AGUARDANDO → CHAMADA → CHAMADA_NOVAMENTE → EM_ATENDIMENTO → ATENDIDA; e CHAMADA_NOVAMENTE → NÃO_COMPARECEU. O cliente pode iniciar o atendimento já na primeira chamada (CHAMADA → EM_ATENDIMENTO). Transições fora desse fluxo são rejeitadas. |
| **RN13 – Um atendimento por guichê** | Um guichê só pode ter uma senha ativa por vez; é preciso finalizar (ou registrar o não comparecimento) antes de chamar outra. |
| **RN14 – Perfis** | Apenas atendentes fazem login. **Somente um** atendente possui o perfil adicional de **gestor** (cadastros e relatórios). |
| **RN15 – Cliente anônimo** | O cliente interage apenas com o totem, sem fornecer dados pessoais. |
| **RN16 – Guichê exclusivo** | Um guichê não pode ser usado por dois atendentes logados ao mesmo tempo. |

## Interpretações adotadas pelo grupo

- **"Varia 5 minutos para baixo ou para cima, em igual distribuição"** foi interpretado como distribuição **uniforme** no intervalo [TM−5, TM+5].
- A **prioridade de SE sobre SG** (RN03) segue o trecho que diz que a SG é chamada "após finalização do atendimento para as senhas SP e SE".
- A alternância (RN02) considera o **último tipo chamado no laboratório** (global), e não por guichê.
- Senhas descartadas no fim do expediente ficam com estado NÃO_COMPARECEU e motivo `DESCARTADA_FIM_EXPEDIENTE`, diferenciando-as de quem não compareceu após 2 chamadas.
