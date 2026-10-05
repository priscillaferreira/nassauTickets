# Requisitos Não Funcionais — nassauTickets

## Segurança
| ID | Requisito |
|----|-----------|
| RNF01 | Senhas de usuários armazenadas somente como **hash com salt** (scrypt). Nunca em texto puro. |
| RNF02 | Rotas de atendente e gestor exigem **token de sessão** (`Authorization: Bearer`), que expira em 8 horas. |
| RNF03 | **Controle de acesso por perfil**: rotas de cadastros e relatórios exigem o perfil GESTOR. |
| RNF04 | Mensagens de erro de login **genéricas** ("Usuário ou senha inválidos"), sem revelar qual campo está errado. |
| RNF05 | Em produção, toda comunicação deve usar **HTTPS**, e o CORS deve aceitar apenas a origem do frontend. |
| RNF06 | Validação de todos os dados de entrada no backend (tipo de senha, guichê, datas) e limite de 100 KB no corpo das requisições. |

## Disponibilidade e recuperação de desastres
| ID | Requisito |
|----|-----------|
| RNF07 | O sistema deve estar disponível durante todo o expediente (7h–17h), com meta de **99%**. |
| RNF08 | O backend expõe `GET /api/health`; o frontend verifica a cada 5 s e exibe aviso quando o servidor está fora do ar. |
| RNF09 | Em caso de falha, o **painel continua exibindo as últimas chamadas conhecidas** (cache local) e volta a se atualizar sozinho. |
| RNF10 | Em caso de falha, o **totem bloqueia a emissão** e orienta o cliente a procurar a recepção (contingência manual). |
| RNF11 | Todas as requisições do frontend têm **tempo limite de 5 s**, para a interface nunca travar. |
| RNF12 | (Fase 2) Backup diário do MySQL e replicação; reinício automático do backend (ex.: PM2 ou Docker `restart: always`). |

## Auditoria
| ID | Requisito |
|----|-----------|
| RNF13 | Cada senha guarda o **histórico completo de estados** com data e hora. |
| RNF14 | Eventos de segurança (login, falha de login, logout, cadastros) são registrados em log. |
| RNF15 | Os registros de auditoria não podem ser alterados pelos usuários. |

## Desempenho
| ID | Requisito |
|----|-----------|
| RNF16 | Emissão de senha e chamada devem responder em **menos de 1 segundo**. |
| RNF17 | O painel deve refletir uma nova chamada em **até 2 segundos**. |
| RNF18 | Os relatórios mensais devem ser gerados em até 5 segundos. |

## Concorrência
| ID | Requisito |
|----|-----------|
| RNF19 | Se dois ou mais atendentes chamarem a próxima senha ao mesmo tempo, **cada guichê recebe uma senha diferente**. Fase 1: operação protegida por **Mutex** (fila de execução). Fase 2: transação MySQL com `SELECT ... FOR UPDATE SKIP LOCKED`. |
| RNF20 | Transições de estado inválidas (ex.: finalizar duas vezes) são rejeitadas com HTTP 409. |

## LGPD (Lei nº 13.709/2018)
| ID | Requisito |
|----|-----------|
| RNF21 | **Minimização de dados**: o totem não coleta nenhum dado pessoal do cliente. |
| RNF22 | Dos atendentes, apenas nome, login e hash da senha são armazenados, para fins de controle de acesso e auditoria. |
| RNF23 | Relatórios de auditoria são restritos ao gestor. |
| RNF24 | (Fase 2) Definir prazo de retenção dos logs e registrar a política de privacidade. |

## Acessibilidade (Lei nº 13.146/2015 – Lei Brasileira de Inclusão; referência WCAG 2.1 AA / eMAG)
| ID | Requisito |
|----|-----------|
| RNF25 | Chamadas anunciadas de forma **visual e sonora** (para pessoas com deficiência visual ou auditiva). |
| RNF26 | **Alto contraste** entre texto e fundo, fontes grandes no totem e no painel. |
| RNF27 | Navegação completa pelo **teclado**, foco visível e link "Pular para o conteúdo". |
| RNF28 | Uso de rótulos (`label`), `aria-live` e `role="alert"` para leitores de tela. |
| RNF29 | O tipo **SP** atende ao atendimento prioritário previsto em lei (idosos, gestantes, lactantes, pessoas com deficiência etc.). |

## Manutenibilidade e portabilidade
| ID | Requisito |
|----|-----------|
| RNF30 | Frontend em **React 19** (Vite); backend em **Node.js 22 LTS + Express**; banco **MySQL 8.0** (fase 2). |
| RNF31 | Código organizado em camadas (rotas → serviços → dados) e componentes reutilizáveis. |
| RNF32 | Regras de negócio cobertas por **testes automatizados** (`npm test` no backend). |
| RNF33 | Interface responsiva, funcionando em navegadores modernos (Chrome, Edge, Firefox). |
