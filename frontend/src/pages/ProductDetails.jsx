import { useState } from "react";
import PageTitle from "../components/PageTitle";
import StarRating from "../components/StarRating";
import ReviewDetails from "../components/ReviewDetails";
import Modal from "../ui/Modal.jsx"; // Import your Modal component
import { useGetProductQuery } from "../services/productsApi";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../ui/Loader";
import "../pageStyles/ProductDetails.css";
import ErrorBlock from "../ui/ErrorBlock";
import {
  useCreateReviewMutation,
  useGetMyReviewQuery,
  useLazyGetAllReviewsQuery,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} from "../services/reviewsApi";
import { toast } from "react-toastify";
import { useAddToCartMutation } from "../services/cartApi";
import NoData from "../components/NoData";

function ProductDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  // 1. STATE
  const [userRating, setUserRating] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [currentLimit, setCurrentLimit] = useState(5);
  const [expandedReviews, setExpandedReviews] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Modal specific state variables
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");

  // 2. QUERIES & MUTATIONS
  const {
    isLoading,
    isError,
    error,
    data: productData,
    refetch,
  } = useGetProductQuery(id);
  const { data: myReviewData } = useGetMyReviewQuery(id);
  const [fetchMore, { isFetching }] = useLazyGetAllReviewsQuery();
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();
  const [createReview, { isLoading: isCreating }] = useCreateReviewMutation();
  const [updateReview, { isLoading: isUpdating }] = useUpdateReviewMutation();
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();

  const product = productData?.data;
  const myReview = myReviewData?.data;
  const allReviews = expandedReviews || product?.reviews || [];

  const openEditModal = (review) => {
    setEditRating(review.rating);
    setEditComment(review.review);
    setIsEditOpen(true);
    setSelectedReviewId(review._id);
  };
  // const openDeleteModal = (review) => {
  //   setEditRating(review.rating);
  //   setEditComment(review.review);
  //   setIsEditOpen(true);
  //   setSelectedReviewId(review._id);
  // };

  if (isLoading) return <Loader fullPage={true} />;
  if (!product) return <NoData data={"Product"} />;
  // return (
  //   <div>
  //     <div className="no-products-content">
  //       <div className="no-products-icon">⚠️</div>
  //       <h3 className="no-products-title">No Product Found</h3>
  //       <p className="no-products-message">
  //         No product available. Please check back later
  //       </p>
  //       <button className="explore-more" onClick={() => navigate(-1)}>
  //         Explore Products
  //       </button>
  //     </div>
  //   </div>
  // );

  const handleRatingChange = (rating) => setUserRating(rating);
  const handleEditRatingChange = (rating) => setEditRating(rating);

  const handleViewMore = async () => {
    const nextLimit = currentLimit * 2;
    const { data } = await fetchMore({
      productId: id,
      limit: nextLimit,
      page: 1,
    });
    if (data?.data) {
      setExpandedReviews(data.data);
      setCurrentLimit(nextLimit);
    }
  };

  function increaseQuantity() {
    if (quantity >= product.stock) {
      toast.error("Quantity cannot exceed available stock");
      return;
    }
    setQuantity((cur) => cur + 1);
  }

  function decreaseQuantity() {
    if (quantity <= 1) {
      toast.error("Quantity cannot be less than 1");
      return;
    }
    setQuantity((cur) => cur - 1);
  }

  async function handleAddToCart() {
    try {
      await addToCart({ productId: id, quantity, operation: "add" }).unwrap();
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000);
    } catch (err) {
      console.log(err?.message);
      toast.error("Could not add item to cart");
    }
  }

  async function handleReviewSubmit(e) {
    e.preventDefault();
    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    const data = Object.fromEntries(formData.entries());
    if (data.rating) data.rating = Number(data.rating);

    try {
      const res = await createReview({
        productId: id,
        reviewData: data,
      }).unwrap();
      setUserRating(0);
      formElement.reset();
      toast.success(res.message || "Review created successfully");
    } catch (err) {
      toast.error(err.data?.message || "Review could not be created");
    }
  }

  async function handleReviewUpdate(e) {
    e.preventDefault();
    try {
      const res = await updateReview({
        productId: id,
        reviewId: selectedReviewId,
        reviewData: { rating: editRating, review: editComment },
      }).unwrap();
      toast.success(res.message || "Review updated successfully");
      setIsEditOpen(false);
    } catch (err) {
      toast.error(err.data?.message || "Could not update review");
    }
  }

  async function handleReviewDelete() {
    try {
      const res = await deleteReview({
        productId: id,
        reviewId: selectedReviewId,
      }).unwrap();
      toast.success(res?.message || "Review removed successfully");
      setIsDeleteOpen(false);
    } catch (err) {
      if (err.status === 200 || err.status === 204) {
        toast.success("Review removed successfully");
        setIsDeleteOpen(false);
      } else {
        toast.error(err.data?.message || "Could not delete review");
      }
    }
  }

  if (isError) {
    if (error?.status === 404) {
      return (
        <div className="error-container">
          <h1 style={{ fontSize: "4rem", marginBottom: "0" }}>🔍</h1>
          <h2 style={{ margin: "10px 0" }}>Product Not Found</h2>
          <button className="link-btn" onClick={() => navigate(-1)}>
            &larr; Go back
          </button>
        </div>
      );
    }
    return (
      <ErrorBlock
        message={error?.data?.message || error?.message}
        refetch={refetch}
      />
    );
  }
  return (
    <>
      <PageTitle title={`${product.name} - Details`} />
      <div className="product-details-container">
        <div className="product-detail-container">
          <div className="product-image-container">
            <img
              src={
                selectedImage || product.images[0]?.url || "/placeholder.jpg"
              }
              alt={product.name}
              className="product-detail-image"
            />
            {product.images.length > 1 && (
              <div className="product-thumbnails">
                {product.images.map((img, index) => (
                  <img
                    src={img.url}
                    alt={`Thumbnail ${index + 1}`}
                    className="thumbnail-image"
                    key={index}
                    onClick={() => setSelectedImage(img.url)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="product-info">
            <h2>{product.name}</h2>
            <p className="product-description">{product.description}</p>
            <p className="product-price">Price: {product.price}/-</p>

            <div className="product-rating">
              <div style={{ marginBlock: "10px" }}>
                <StarRating
                  maxRating={5}
                  size={24}
                  defaultRating={product.ratings}
                  isDisabled={true}
                />
              </div>
              <span className="productCardSpan">
                ({product.numOfReviews}{" "}
                {product.numOfReviews === 1 ? " Review" : " Reviews"})
              </span>
            </div>

            <div className="stock-status">
              <span className={product.stock > 0 ? "in-stock" : "out-of-stock"}>
                {product.stock > 0
                  ? `In Stock (${product.stock} available)`
                  : "Out of Stock"}
              </span>
            </div>

            {product.stock > 0 && (
              <>
                <div className="product-quantity-controls">
                  <span className="quantity-label">Quantity:</span>
                  <button
                    className="product-quantity-button"
                    onClick={decreaseQuantity}
                    disabled={isAdding}
                  >
                    -
                  </button>
                  <input
                    type="text"
                    value={quantity}
                    className="quantity-value"
                    readOnly
                  />
                  <button
                    className="product-quantity-button"
                    onClick={increaseQuantity}
                    disabled={isAdding}
                  >
                    +
                  </button>
                </div>

                <button
                  className="add-to-cart-btn"
                  disabled={isAdding || product.stock <= 0}
                  onClick={handleAddToCart}
                >
                  {isAdding
                    ? "Adding to cart..."
                    : isSuccess
                    ? "Added! ✓"
                    : "Add to Cart"}
                </button>
              </>
            )}

            {/* UX IMPROVEMENT: Swap Form if Review Exists */}
            {!myReview ? (
              <form className="review-form" onSubmit={handleReviewSubmit}>
                <h3>Write a Review</h3>
                <div style={{ marginBlock: "10px", height: "30px" }}>
                  <StarRating
                    maxRating={5}
                    size={24}
                    defaultRating={userRating}
                    onSetRating={handleRatingChange}
                    isDisabled={isCreating}
                  />
                  <input
                    type="hidden"
                    name="rating"
                    value={userRating}
                    readOnly
                  />
                </div>
                <textarea
                  className="review-input"
                  placeholder="Write your review here..."
                  name="review"
                  disabled={isCreating}
                  required
                ></textarea>
                <button className="submit-review-btn" disabled={isCreating}>
                  {isCreating ? "Submitting Review" : "Submit Review"}
                </button>
              </form>
            ) : (
              <div className="already-reviewed-notice">
                <p>
                  You have already reviewed this product. You can update or
                  delete your submission in the reviews section below.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="reviews-container">
          <h3>Customer Reviews</h3>

          {myReview && (
            <div className="your-review-box">
              <ReviewDetails
                review={myReview}
                isOwnReview={true}
                onEdit={openEditModal}
                onDelete={() => {
                  setIsDeleteOpen(true);
                  setSelectedReviewId(myReview._id);
                }}
              />
            </div>
          )}

          <div className="reviews-section">
            {allReviews.length > 0 ? (
              <>
                {allReviews
                  .filter((rev) => rev._id !== myReview?._id)
                  .map((rev) => (
                    <ReviewDetails key={rev._id} review={rev} />
                  ))}

                {productData?.totalReviews > allReviews.length && (
                  <div className="view-more-controls">
                    {isFetching ? (
                      <Loader />
                    ) : (
                      <button
                        className="view-more-btn"
                        onClick={handleViewMore}
                      >
                        View More
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : (
              !myReview && (
                <p className="no-reviews">No reviews yet. Be the first!</p>
              )
            )}
          </div>
        </div>
      </div>

      {/* --- EDIT REVIEW MODAL --- */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Your Review"
        size="medium"
      >
        <form onSubmit={handleReviewUpdate}>
          <div style={{ marginBlock: "15px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Your Rating:
            </label>
            <StarRating
              maxRating={5}
              size={28}
              defaultRating={editRating}
              onSetRating={handleEditRatingChange}
              isDisabled={isUpdating}
            />
          </div>
          <div style={{ marginBlock: "15px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Your Comments:
            </label>
            <textarea
              className="review-input"
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              disabled={isUpdating}
              required
            ></textarea>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "20px",
            }}
          >
            <button
              type="button"
              className="view-more-btn"
              style={{ margin: 0 }}
              onClick={() => setIsEditOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-review-btn"
              disabled={isUpdating}
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Review"
        size="small"
      >
        <div style={{ padding: "10px 0" }}>
          <p>
            Are you sure you want to delete your review? This action cannot be
            undone.
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "25px",
            }}
          >
            <button
              type="button"
              className="view-more-btn"
              style={{ margin: 0 }}
              onClick={() => setIsDeleteOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="submit-review-btn"
              style={{ backgroundColor: "#b12704" }}
              onClick={handleReviewDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Yes, Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default ProductDetails;
