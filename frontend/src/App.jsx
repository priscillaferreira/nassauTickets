import { Route, Routes } from 'react-router-dom';
import Cabecalho from './components/Cabecalho.jsx';
import RotaProtegida from './components/RotaProtegida.jsx';
import StatusConexao from './components/StatusConexao.jsx';
import Atendente from './pages/Atendente.jsx';
import Gestao from './pages/Gestao.jsx';
import Inicio from './pages/Inicio.jsx';
import Login from './pages/Login.jsx';
import NaoEncontrada from './pages/NaoEncontrada.jsx';
import Painel from './pages/Painel.jsx';
import Totem from './pages/Totem.jsx';

export default function App() {
  return (
    <>
      <a href="#conteudo" className="pular-link">Pular para o conteúdo</a>
      <Cabecalho />
      <StatusConexao />
      <main id="conteudo" className="conteudo">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/totem" element={<Totem />} />
          <Route path="/painel" element={<Painel />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/atendente"
            element={
              <RotaProtegida>
                <Atendente />
              </RotaProtegida>
            }
          />
          <Route
            path="/gestao"
            element={
              <RotaProtegida somenteGestor>
                <Gestao />
              </RotaProtegida>
            }
          />
          <Route path="*" element={<NaoEncontrada />} />
        </Routes>
      </main>
    </>
  );
}
