import { Link } from "react-router-dom";

/** 404-pagina voor onbekende routes. */
export default function NotFound() {
  return (
    <div className="page">
      <div className="empty-state">
        <h3>404 — Dit scherm bestaat niet</h3>
        <div className="empty-state__text">
          De pagina die je zoekt zit niet in deze applicatie.
        </div>
        <Link to="/" className="btn btn--primary">
          Terug naar home
        </Link>
      </div>
    </div>
  );
}
