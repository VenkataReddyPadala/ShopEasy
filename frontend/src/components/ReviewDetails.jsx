import StarRating from "./StarRating";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import "../componentStyles/ReviewDetails.css";

function ReviewDetails({ review, isOwnReview, onEdit, onDelete }) {
  const DEFAULT_AVATAR = "/images/default-avatar.jpg";

  return (
    <div className={`review-item ${isOwnReview ? "my-review-style" : ""}`}>
      <div className="review-item-container">
        <div className="review-header">
          <div className="review-user-info">
            <img
              src={review.user?.avatar?.url || DEFAULT_AVATAR}
              onError={(e) => {
                e.target.src = DEFAULT_AVATAR;
              }}
              alt={review.user?.name || "User"}
              className="user-avatar-mini"
            />
            <p className="review-name">
              {isOwnReview ? "You" : review.user?.name || "Anonymous"}
            </p>
          </div>
        </div>

        <div className="review-rating-wrapper">
          <StarRating
            maxRating={5}
            size={18}
            defaultRating={review.rating}
            isDisabled={true}
          />
        </div>

        <p className="review-comment">{review.review}</p>
      </div>

      {isOwnReview && (
        <div className="review-actions">
          <button
            className="edit-btn"
            title="Edit review"
            onClick={() => onEdit(review)}
          >
            <EditIcon sx={{ fontSize: 18 }} />
          </button>
          <button
            className="delete-btn"
            title="Delete review"
            onClick={onDelete}
          >
            <DeleteIcon sx={{ fontSize: 18 }} color="error" />
          </button>
        </div>
      )}
    </div>
  );
}

export default ReviewDetails;
