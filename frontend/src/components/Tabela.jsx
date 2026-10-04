/**
 * Tabela genérica e reutilizável.
 * colunas = [{ chave: 'numero', titulo: 'Senha', formatar: (valor, linha) => ... }]
 */
export default function Tabela({ titulo, colunas, linhas, vazio = 'Nenhum registro.' }) {
  return (
    <div className="tabela-container">
      <table>
        {titulo && <caption>{titulo}</caption>}
        <thead>
          <tr>
            {colunas.map((c) => (
              <th key={c.chave} scope="col">
                {c.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.length === 0 ? (
            <tr>
              <td colSpan={colunas.length}>{vazio}</td>
            </tr>
          ) : (
            linhas.map((linha, i) => (
              <tr key={linha.id ?? linha.numero ?? linha.senha ?? i}>
                {colunas.map((c) => (
                  <td key={c.chave}>
                    {c.formatar ? c.formatar(linha[c.chave], linha) : linha[c.chave] ?? ''}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
