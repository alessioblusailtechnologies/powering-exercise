import { Link } from 'react-router-dom';

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
      </div>
    </div>
  );
}
