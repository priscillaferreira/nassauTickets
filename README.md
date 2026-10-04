# nassauTickets

> Sistema de Controle de Atendimento (senhas) para um Laboratório de Análises Clínicas.
> Projeto da disciplina — UNINASSAU.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-22_LTS-339933?logo=node.js)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql)
![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-green)

## Descrição

O **nassauTickets** organiza a fila de atendimento do laboratório: o cliente retira uma senha no
**totem**, acompanha as chamadas no **painel** (com áudio) e é atendido em qualquer **guichê**.
O atendente chama as senhas respeitando as regras de prioridade, e o gestor acompanha
**relatórios diários e mensais**, **auditoria** e **indicadores de desempenho**.

## Objetivo

Aplicar, em um projeto real e em equipe, os conhecimentos de desenvolvimento Web: React,
consumo de API REST, organização de projeto, documentação de requisitos e versionamento com Git/GitHub.

## Funcionalidades

| Módulo | O que faz |
|--------|-----------|
| **Totem** (`/totem`) | Emite senhas **SP** (Prioritária), **SE** (Retirada de Exames) e **SG** (Geral) no formato `YYMMDD-PPSQ`, sem pedir dados pessoais. |
| **Painel** (`/painel`) | Mostra as **5 últimas senhas chamadas** e o guichê; anuncia por **voz**; indica "Última chamada". |
| **Atendente** (`/atendente`) | Login por guichê; **chamar próxima**, **chamar novamente**, **iniciar**, **finalizar** e **não compareceu**. |
| **Gestão** (`/gestao`) | Relatórios diário/mensal, TM, auditoria, desempenho por atendente, cadastro de atendentes, encerramento do expediente e simulação de um dia. |

Regras implementadas: alternância **[SP] → [SE\|SG] → [SP]**, abandono após **2 chamadas**,
expediente **7h–17h** com descarte da fila, máquina de estados da senha e tratamento de concorrência.
Detalhes em [`docs/requirements`](docs/requirements).

## Tecnologias utilizadas

| Camada | Tecnologia | Justificativa |
|--------|------------|---------------|
| Frontend | **React 19** + **Vite** + React Router | Exigido pela atividade; Vite dá inicialização rápida (`npm run dev`). |
| Backend | **Node.js 22 LTS** + **Express 5** | Opção suportada pela infraestrutura do laboratório. Usa **a mesma linguagem do frontend (JavaScript)**, o que reduz a curva de aprendizado da equipe; Express é leve e ideal para APIs REST com JSON. |
| Banco de dados | Memória (fase 1) → **MySQL 8.0** (fase 2) | Na fase 1 os dados ficam em memória para facilitar a execução; o modelo MySQL já está pronto em [`docs/mer/nassaudb.sql`](docs/mer/nassaudb.sql). |
| Áudio | Web Speech API | Nativa do navegador, sem custo. |
| Testes | `node:test` | Test runner nativo do Node, sem dependências extras. |

## Arquitetura

```
Navegador (Totem / Painel / Atendente / Gestão)
        │  React 19 — páginas, componentes, services/api.js (fetch + JSON)
        ▼
  HTTP REST  /api/...
        ▼
Backend Node.js + Express
   routes/ → middlewares/ (login e perfil) → services/ (regras de negócio)
                                           → models/ (máquina de estados)
                                           → data/ (memória → MySQL na fase 2)
```

Diagramas completos em [`docs/models/uml`](docs/models/uml) (arquitetura, casos de uso, classes, sequência, atividades e máquina de estados).

### Estrutura do repositório

```
nassauTickets/
├── backend/            API REST (Node.js + Express)
│   ├── src/
│   │   ├── config/       configurações (.env)
│   │   ├── data/         armazenamento em memória
│   │   ├── middlewares/  autenticação e tratamento de erros
│   │   ├── models/       tipos e máquina de estados da senha
│   │   ├── routes/       rotas HTTP
│   │   ├── services/     regras de negócio
│   │   └── utils/        datas, hash, mutex, erros
│   └── tests/          testes automatizados das regras
├── docs/
│   ├── branding/       identidade visual e logo
│   ├── mer/            MER e script MySQL
│   ├── mockups/        protótipos das telas
│   ├── models/uml/     diagramas UML
│   └── requirements/   requisitos, regras de negócio, casos de uso, testes
├── frontend/           aplicação React
│   └── src/
│       ├── components/   componentes reutilizáveis
│       ├── contexts/     contexto de autenticação
│       ├── hooks/        hook de atualização periódica
│       ├── pages/        telas (Totem, Painel, Atendente, Gestão…)
│       ├── services/     comunicação com a API e áudio
│       ├── styles/       CSS global
│       └── utils/        formatadores
├── .gitignore
├── LICENSE
└── README.md
```

## Instalação

**Pré-requisitos:** [Node.js 22 LTS](https://nodejs.org/) (inclui o npm) e [Git](https://git-scm.com/).

```bash
git clone https://github.com/<usuario-do-scrum-master>/nassauTickets.git
cd nassauTickets

# Backend
cd backend
npm install

# Frontend (em outro terminal)
cd frontend
npm install
```

## Execução

São necessários **dois terminais** abertos ao mesmo tempo:

```bash
# Terminal 1 — backend (http://localhost:3001)
cd backend
npm run dev
```

```bash
# Terminal 2 — frontend (http://localhost:5173)
cd frontend
npm run dev
```

Abra **http://localhost:5173** no navegador.

Testes automatizados das regras de negócio:

```bash
cd backend
npm test
```

## Configuração

Copie os arquivos de exemplo e ajuste se necessário (opcional — sem eles o sistema usa os valores padrão):

| Arquivo | Variável | Padrão | Descrição |
|---------|----------|--------|-----------|
| `backend/.env` | `PORT` | `3001` | Porta da API |
| | `EXPEDIENTE_INICIO` / `EXPEDIENTE_FIM` | `7` / `17` | Horário do expediente |
| | `IGNORAR_EXPEDIENTE` | `true` | `true` permite testar fora do horário. **Use `false` em produção.** |
| | `CORS_ORIGEM` | `*` | Origem permitida do frontend |
| `frontend/.env` | `VITE_API_URL` | *(vazio)* | Vazio = usa o proxy do Vite para `localhost:3001` |

### Usuários de teste

| Usuário | Senha | Perfil |
|---------|-------|--------|
| `ana` | `senha123` | Atendente + **Gestor** |
| `bruno` | `senha123` | Atendente |
| `carla` | `senha123` | Atendente |

> Na fase 1 os dados ficam em memória: ao reiniciar o backend, senhas e cadastros novos são apagados.

## Como usar (roteiro rápido)

1. Abra **Painel** em uma aba e clique em **Ativar som**.
2. Em outra aba, abra **Totem** e emita algumas senhas de tipos diferentes.
3. Em outra aba, faça **login** (ex.: `ana`, guichê 1) e use **Chamar próxima** → **Iniciar** → **Finalizar**.
4. Para testar o abandono: **Chamar próxima** → **Chamar novamente** → **Não compareceu**.
5. Em **Gestão → Operação**, clique em **Simular** para gerar um dia completo e depois veja **Relatórios**.

## API REST (resumo)

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| GET | `/api/health` | público | Situação do servidor |
| POST | `/api/senhas` | público (totem) | Emite senha `{ "tipo": "SP" }` |
| GET | `/api/painel` | público | 5 últimas chamadas |
| POST | `/api/auth/login` | público | `{ login, senha, guiche }` → token |
| POST | `/api/auth/logout` | atendente | Encerra a sessão |
| GET | `/api/senhas/fila` | atendente | Quantidade na fila por tipo |
| GET | `/api/atendimento/atual` | atendente | Senha atual do guichê |
| POST | `/api/atendimento/chamar-proxima` | atendente | Chama a próxima senha |
| POST | `/api/atendimento/:id/chamar-novamente` | atendente | 2ª chamada ("Última chamada") |
| POST | `/api/atendimento/:id/iniciar` | atendente | Inicia o atendimento |
| POST | `/api/atendimento/:id/finalizar` | atendente | Finaliza o atendimento |
| POST | `/api/atendimento/:id/nao-compareceu` | atendente | Abandono após 2 chamadas |
| GET | `/api/gestao/relatorios?tipo=diario&referencia=AAAA-MM-DD` | gestor | Relatório diário (ou `tipo=mensal&referencia=AAAA-MM`) |
| GET/POST | `/api/gestao/usuarios` | gestor | Lista / cadastra atendentes |
| POST | `/api/gestao/expediente/encerrar` | gestor | Descarta a fila |
| POST | `/api/gestao/simulacao` | gestor | Simula um dia `{ data, quantidade }` |

## Documentação

| Artefato | Local |
|----------|-------|
| Requisitos funcionais | [`docs/requirements/requisitos-funcionais.md`](docs/requirements/requisitos-funcionais.md) |
| Requisitos não funcionais (segurança, disponibilidade, auditoria, desempenho, concorrência, LGPD, acessibilidade) | [`docs/requirements/requisitos-nao-funcionais.md`](docs/requirements/requisitos-nao-funcionais.md) |
| Regras de negócio | [`docs/requirements/regras-de-negocio.md`](docs/requirements/regras-de-negocio.md) |
| Casos de uso | [`docs/requirements/casos-de-uso.md`](docs/requirements/casos-de-uso.md) |
| Desafios e propostas | [`docs/requirements/desafios-e-propostas.md`](docs/requirements/desafios-e-propostas.md) |
| Plano de testes | [`docs/requirements/plano-de-testes.md`](docs/requirements/plano-de-testes.md) |
| Diagramas UML | [`docs/models/uml`](docs/models/uml) |
| MER e script MySQL | [`docs/mer`](docs/mer) |
| Mockups | [`docs/mockups`](docs/mockups) |
| Identidade visual | [`docs/branding`](docs/branding) |

## Branches

| Branch | Uso |
|--------|-----|
| `main` | Versão estável, entregue ao professor. Recebe código **apenas por merge** da `dev`. |
| `dev` | Desenvolvimento diário. Todos os commits são feitos aqui primeiro. |

Fluxo: `commit na dev` → `push` → **Pull Request `dev → main`** → merge.

Padrão de mensagens de commit: `feat:` (funcionalidade), `fix:` (correção), `docs:` (documentação),
`test:` (testes), `style:` (visual), `chore:` (configuração/estrutura).

## Membros

| Nome | Matrícula | Papel |
|------|-----------|-------|
| Priscilla Ferreira Moura | 01044267 | Scrum Master |
| Edieyson Morato de Oliveira | 01345936 | Documentador |
| Alexandre Cavalcanti Dantas Layme | 01883323 | Desenvolvedor |
| João Victor Souza Lins | 01887445 | Desenvolvedor |
| Jonathas Paes Barreto Silva | 01920308 | Testador |

## Roadmap

- [x] **Fase 1:** repositório, documentação, regras de negócio, API em memória e telas React.
- [ ] **Fase 2:** persistência em MySQL 8.0, edição/inativação de atendentes, exportação de relatórios (PDF/CSV), gráficos de desempenho e atualização do painel em tempo real (WebSocket).

## Licença

Distribuído sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE).
