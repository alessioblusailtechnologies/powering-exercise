import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { Button } from 'primereact/button';
import { TopBar } from './components/TopBar';
import { ListaRichieste } from './pages/ListaRichieste';
import { NuovaRichiesta } from './pages/NuovaRichiesta';
import { DettaglioRichiesta } from './pages/DettaglioRichiesta';
import { Configurazione } from './pages/Configurazione';

export function App() {
  const location = useLocation();
  const inLista = location.pathname === '/';
  const inConfig = location.pathname === '/configurazione';

  return (
    <>
      <TopBar />
      <div className="app-shell">
        <header className="page-header">
          <h1>{inConfig ? 'Configurazione' : 'Richieste cliente'}</h1>
          {inLista && (
            <Link to="/nuova">
              <Button label="Nuova richiesta" icon="pi pi-plus" />
            </Link>
          )}
        </header>

        <Routes>
          <Route path="/" element={<ListaRichieste />} />
          <Route path="/nuova" element={<NuovaRichiesta />} />
          <Route path="/richieste/:id" element={<DettaglioRichiesta />} />
          <Route path="/configurazione" element={<Configurazione />} />
        </Routes>
      </div>
    </>
  );
}
