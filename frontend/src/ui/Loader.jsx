import "./Loader.css";

function Loader({ fullPage = false }) {
  return (
    // If fullPage is true, we add the extra class to center it in the middle of the screen
    <div className={`loader-container ${fullPage ? "loader-full-page" : ""}`}>
      <div className="loader"></div>
    </div>
  );
}

export default Loader;
