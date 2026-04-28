import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { Button } from 'primereact/button';
import { ListaRichieste } from './pages/ListaRichieste';
import { NuovaRichiesta } from './pages/NuovaRichiesta';
import { DettaglioRichiesta } from './pages/DettaglioRichiesta';

export function App() {
  const location = useLocation();
  const inLista = location.pathname === '/';

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>
          <Link
            to="/"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            Richieste cliente
          </Link>
        </h1>
        {inLista && (
          <Link to="/nuova">
            <Button
              label="Nuova richiesta"
              icon="pi pi-plus"
              severity="success"
            />
          </Link>
        )}
      </header>

      <Routes>
        <Route path="/" element={<ListaRichieste />} />
        <Route path="/nuova" element={<NuovaRichiesta />} />
        <Route path="/richieste/:id" element={<DettaglioRichiesta />} />
      </Routes>
    </div>
  );
}
