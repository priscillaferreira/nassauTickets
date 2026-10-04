# Máquina de Estados da Senha

```mermaid
stateDiagram-v2
    [*] --> EMITIDA : cliente escolhe o tipo no totem
    EMITIDA --> AGUARDANDO : senha impressa / entra na fila
    AGUARDANDO --> CHAMADA : atendente clica "Chamar próxima"
    AGUARDANDO --> NAO_COMPARECEU : fim do expediente (descartada)
    CHAMADA --> EM_ATENDIMENTO : cliente chegou (1ª chamada)
    CHAMADA --> CHAMADA_NOVAMENTE : "Chamar novamente"
    CHAMADA_NOVAMENTE --> EM_ATENDIMENTO : cliente chegou (2ª chamada)
    CHAMADA_NOVAMENTE --> NAO_COMPARECEU : não compareceu após 2 chamadas
    EM_ATENDIMENTO --> ATENDIDA : "Finalizar atendimento"
    ATENDIDA --> [*]
    NAO_COMPARECEU --> [*]
```

| Estado | Significado |
|--------|-------------|
| EMITIDA | Senha acabou de ser gerada no totem. |
| AGUARDANDO | Na fila, esperando ser chamada. |
| CHAMADA | Chamada no painel pela 1ª vez. |
| CHAMADA_NOVAMENTE | Chamada pela 2ª vez ("Última chamada"). |
| EM_ATENDIMENTO | Cliente está no guichê. |
| ATENDIDA | Atendimento finalizado. |
| NAO_COMPARECEU | Cliente não compareceu após 2 chamadas ou senha descartada no fim do expediente. |
