import { useRouteError, useNavigate, Link } from "react-router-dom";
import "./Error.css";

function Error() {
  const error = useRouteError();
  const navigate = useNavigate();

  const is404 = error?.status === 404;

  if (is404) {
    return (
      <div className="error-404-wrapper">
        <div className="error-404-container">
          <div className="error-404-graphic">404</div>
          <h1 className="error-404-title">Lost in Space?</h1>
          <p className="error-404-message">
            We couldn't find the page you're looking for. It might have been
            moved, deleted, or perhaps it never existed in the first place.
          </p>

          <div className="error-404-actions">
            <button
              className="error-btn btn-secondary"
              onClick={() => navigate(-1)}
            >
              &larr; Go Back
            </button>
            <Link to="/" className="error-btn btn-primary">
              Take Me Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- FALLBACK: Serious System/Code Level Crashes ---
  return (
    <div className="system-error-wrapper">
      <div className="system-error-container">
        <span className="system-error-icon" role="img" aria-label="sad face">
          ⚠️
        </span>
        <h1>Something went wrong</h1>
        <p className="system-error-details">
          {error?.data ||
            error?.message ||
            "An unexpected application error occurred."}
        </p>
        <button className="error-btn btn-primary" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    </div>
  );
}

export default Error;
