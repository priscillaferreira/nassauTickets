# Diagrama de Casos de Uso

> O GitHub desenha diagramas Mermaid automaticamente. Como o Mermaid não possui notação
> oficial de casos de uso, os atores estão representados à esquerda e os casos de uso como elipses.

```mermaid
flowchart LR
    AC["👤 Cliente (AC)"]
    AA["🧑‍⚕️ Atendente (AA)"]
    GE["👔 Gestor"]
    AS["🖥️ Sistema (AS)"]

    subgraph nassauTickets
        UC01([UC01 Emitir senha])
        UC02([UC02 Acompanhar painel])
        UC03([UC03 Autenticar-se])
        UC04([UC04 Chamar próxima senha])
        UC05([UC05 Chamar novamente])
        UC06([UC06 Iniciar atendimento])
        UC07([UC07 Finalizar atendimento])
        UC08([UC08 Registrar não comparecimento])
        UC09([UC09 Gerar relatórios])
        UC10([UC10 Cadastrar atendente])
        UC11([UC11 Encerrar expediente])
        UC12([UC12 Anunciar chamada])
    end

    AC --- UC01
    AC --- UC02
    AA --- UC03
    AA --- UC04
    AA --- UC05
    AA --- UC06
    AA --- UC07
    AA --- UC08
    GE --- UC09
    GE --- UC10
    GE --- UC11
    AS --- UC11
    AS --- UC12

    GE -. "é um (herda)" .-> AA
    UC04 -. "«include»" .-> UC12
    UC05 -. "«include»" .-> UC12
    UC04 -. "«extend»" .-> UC08
    UC09 -. "«include»" .-> UC03
```
