import "./ErrorBlock.css";

function ErrorBlock({ message, refetch }) {
  return (
    <div className="error-container">
      <p className="error-message">{message || "Something went wrong."}</p>
      {refetch && (
        <button onClick={refetch} className="try-again">
          Try Again
        </button>
      )}
    </div>
  );
}
export default ErrorBlock;
