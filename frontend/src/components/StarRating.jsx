import { useEffect, useState } from "react";

const containerStyle = { display: "flex", alignItems: "center", gap: "16px" };
const starContainerStyle = { display: "flex" };

function StarRating({
  maxRating = 5,
  color = "#6C5B7B",
  size = 48,
  defaultRating = 0,
  onSetRating,
  isDisabled = false,
}) {
  const [rating, setRating] = useState(defaultRating);
  const [tempRating, setTempRating] = useState(0);
  useEffect(() => {
    setRating(defaultRating);
  }, [defaultRating]);
  function handleRating(rating) {
    if (isDisabled) return;
    setRating(rating);
    onSetRating && onSetRating(rating);
  }
  const textStyle = {
    lineHeight: "1",
    margin: "0",
    color: "white",
    fontSize: `${size / 1.5}px`,
    backgroundColor: color,
    padding: "5px",
    borderRadius: "5px",
  };

  return (
    <div style={containerStyle}>
      <div style={starContainerStyle}>
        {Array.from({ length: maxRating }, (_, i) => (
          <Star
            key={i}
            full={tempRating ? i + 1 <= tempRating : i + 1 <= rating}
            onRate={() => handleRating(i + 1)}
            onHoverIn={() => !isDisabled && setTempRating(i + 1)}
            onHoverOut={() => !isDisabled && setTempRating(0)}
            color={color}
            size={size}
            isDisabled={isDisabled}
          />
        ))}
      </div>
      {/* {!isDisabled && <p style={textStyle}>{tempRating || rating || ""}</p>} */}
      {/* <p style={textStyle}>
        {tempRating || rating ? Number(tempRating || rating).toFixed(1) : ""}
      </p> */}
      {tempRating || rating ? (
        <p style={textStyle}>{Number(tempRating || rating).toFixed(1)}</p>
      ) : (
        ""
      )}
    </div>
  );
}

export default StarRating;

function Star({
  onRate,
  full,
  onHoverIn,
  onHoverOut,
  color,
  size,
  isDisabled,
}) {
  const starStyle = {
    width: `${size}px`,
    height: `${size}px`,
    display: "block",
    cursor: "pointer",
  };
  return (
    <span
      role="button"
      //   style={starStyle}
      onClick={onRate}
      onMouseEnter={onHoverIn}
      onMouseLeave={onHoverOut}
      style={{
        ...starStyle,
        pointerEvents: isDisabled ? "none" : "auto",
        cursor: isDisabled ? "not-allowed" : "pointer",
        // opacity: isDisabled ? 0.6 : 1,
      }}
    >
      {full ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill={color}
          stroke={color}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke={color}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="{2}"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      )}
    </span>
  );
}
