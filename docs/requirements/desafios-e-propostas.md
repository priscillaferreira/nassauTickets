# Desafios da Especificação e Propostas do Grupo

## 1. Concorrência — dois atendentes chamando ao mesmo tempo
**Problema:** dois guichês podem receber a mesma senha.
**Solução fase 1:** a função `chamarProxima` roda dentro de um **Mutex** (`backend/src/utils/lock.js`). As requisições entram numa fila e são executadas uma por vez; a primeira pega a senha X e a segunda já encontra X como CHAMADA e pega a próxima. Existe teste automatizado que comprova isso.
**Solução fase 2 (MySQL):**
```sql
START TRANSACTION;
SELECT id FROM senha
 WHERE estado = 'AGUARDANDO' AND tipo = ?
 ORDER BY emitida_em
 LIMIT 1
 FOR UPDATE SKIP LOCKED;   -- linhas travadas por outro guichê são ignoradas
UPDATE senha SET estado = 'CHAMADA', guiche_id = ?, ... WHERE id = ?;
COMMIT;
```
Além disso, a transição de estado só é aceita se o estado atual for o esperado (`UPDATE ... WHERE estado = 'AGUARDANDO'`), funcionando como bloqueio otimista.

## 2. Quantificar e acompanhar o desempenho
Indicadores calculados pelo relatório (`relatorioService.js`):
- **TM real x TM de referência** por tipo de senha;
- **Tempo médio de espera** (emissão → 1ª chamada) por tipo;
- **Taxa de atendimento** (% de senhas atendidas);
- **Por atendente:** chamadas, atendimentos, não comparecimentos, TM e tempo total atendido.
Proposta para a fase 2: painel gerencial com gráficos por hora do dia e metas (ex.: espera máxima de 20 min para SP).

## 3. Áudio nas chamadas
Web Speech API do navegador (`frontend/src/services/audio.js`), sem custo e sem servidor extra. Frase: *"Senha Prioritária, número 5. Dirija-se ao guichê 2."* Como os navegadores bloqueiam som automático, o painel tem o botão **"Ativar som"**, clicado uma vez ao ligar a TV do painel.

## 4. Botão "Chamar Novamente"
Muda a senha para CHAMADA_NOVAMENTE, grava a hora da 2ª chamada (auditoria), coloca a senha no topo do painel com o selo **"Última chamada"** e repete o áudio começando com "Última chamada!".

## 5. Máquina de estados
Implementada em `backend/src/models/estadosSenha.js`, com tabela de transições permitidas e histórico. Diagrama: `docs/models/uml/maquina-de-estados.md`.

## 6. Recuperação de desastres
| Falha | Comportamento |
|-------|---------------|
| Backend fora do ar | Faixa vermelha "Sem conexão com o servidor" em todas as telas; reconexão automática a cada 5 s. |
| Painel sem conexão | Continua mostrando as últimas chamadas (cache no `localStorage`) com aviso "Reconectando…". |
| Totem sem conexão | Não emite senha e orienta o cliente a procurar a recepção (senha manual de contingência). |
| Tela do atendente sem conexão | Botões mostram erro; nenhuma ação é perdida porque o estado fica no servidor. Ao voltar, a tela recarrega a senha atual do guichê. |
| Banco de dados (fase 2) | Backend responde 503 no `/api/health`; backups diários + réplica; o painel segue o mesmo comportamento acima. |
| Reinício do servidor (fase 1) | Dados em memória são perdidos — limitação conhecida, resolvida na fase 2 com MySQL. |
