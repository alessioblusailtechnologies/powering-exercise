import { Link, NavLink } from 'react-router-dom';

export function TopBar() {
  return (
    <div className="topbar">
      <div className="topbar-inner">
        <Link to="/" className="topbar-brand" aria-label="Home">
          <img src="/logo.png" alt="Powering" />
          <div className="topbar-tagline">
            <span className="top">Sistema</span>
            <span className="bottom">Gestione richieste</span>
          </div>
        </Link>

        <nav className="topbar-nav">
          <NavLink to="/configurazione" className="topbar-nav-link">
            <i className="pi pi-cog" />
            <span>Configurazione</span>
          </NavLink>
        </nav>
      </div>
    </div>
  );
}
