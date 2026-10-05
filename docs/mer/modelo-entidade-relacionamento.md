# Modelo Entidade-Relacionamento (MER)

Banco: **MySQL 8.0** (implementação prevista para a fase 2). Script: [`nassaudb.sql`](nassaudb.sql).

```mermaid
erDiagram
    USUARIO ||--o{ SESSAO : "abre"
    USUARIO ||--o{ SENHA : "atende"
    GUICHE  ||--o{ SESSAO : "é usado em"
    GUICHE  ||--o{ SENHA : "atende"
    TIPO_SENHA ||--o{ SENHA : "classifica"
    TIPO_SENHA ||--o{ SEQUENCIA_DIARIA : "controla"
    SENHA ||--|{ HISTORICO_ESTADO : "registra"
    USUARIO ||--o{ LOG_EVENTO : "gera"

    USUARIO {
        int id PK
        varchar nome
        varchar login UK
        varchar hash_senha
        boolean gestor
        boolean ativo
        datetime criado_em
    }
    GUICHE {
        int id PK
        int numero UK
        boolean ativo
    }
    SESSAO {
        char token PK
        int usuario_id FK
        int guiche_id FK
        datetime expira_em
    }
    TIPO_SENHA {
        char codigo PK "SP, SE, SG"
        varchar nome
        int prioridade
        decimal tm_base_min
    }
    SEQUENCIA_DIARIA {
        date data PK
        char tipo PK, FK
        int ultimo_numero
    }
    SENHA {
        bigint id PK
        char numero UK "YYMMDD-PPSQ"
        char tipo FK
        enum estado
        datetime emitida_em
        int guiche_id FK
        int usuario_id FK
        datetime primeira_chamada_em
        datetime segunda_chamada_em
        datetime inicio_atendimento_em
        datetime fim_atendimento_em
        varchar motivo_encerramento
    }
    HISTORICO_ESTADO {
        bigint id PK
        bigint senha_id FK
        enum estado
        datetime registrado_em
    }
    LOG_EVENTO {
        bigint id PK
        int usuario_id FK
        varchar tipo
        json detalhes
        datetime registrado_em
    }
```

## Dicionário resumido
| Entidade | Descrição |
|----------|-----------|
| USUARIO | Atendentes. Apenas um possui `gestor = true` (RN14). |
| GUICHE | Guichês físicos; qualquer um atende qualquer tipo. |
| SESSAO | Login ativo do atendente em um guichê. |
| TIPO_SENHA | SP, SE e SG com prioridade e TM de referência. |
| SEQUENCIA_DIARIA | Último número usado por tipo e dia (reinício diário da numeração). |
| SENHA | Ticket e todos os horários usados na auditoria. |
| HISTORICO_ESTADO | Trilha de todas as transições da máquina de estados. |
| LOG_EVENTO | Eventos de segurança (login, falha, cadastro). |
