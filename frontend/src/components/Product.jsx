import "../componentStyles/Product.css";
import { Link } from "react-router-dom";
import StarRating from "./StarRating";
function Product({ product }) {
  return (
    <Link
      to={`/products/${product._id}`}
      className="product_id"
      key={product._id}
    >
      <div className="product-card">
        <div className="image-container">
          <img
            src={product.images[0].url}
            alt={product.name}
            className="product-image-card"
          />
        </div>

        <div className="product-details">
          <h3 className="product-title">{product.name}</h3>
          <p className="home-price">Price {product.price}/-</p>
          <div className="rating_container">
            <StarRating
              maxRating={5}
              size={16}
              defaultRating={product.ratings}
              isDisabled={true}
            />
          </div>
          <span className="productCardSpan" style={{ color: "black" }}>
            (
            {product.numOfReviews > 0
              ? product.numOfReviews === 1
                ? `${product.numOfReviews} Review`
                : `${product.numOfReviews} Reviews`
              : "No Reviews Yet"}
            )
          </span>
          <button
            className="add-to-cart"
            onClick={(e) => {
              // e.preventDefault();
              e.stopPropagation();
              // add to cart logic
            }}
          >
            View Details
          </button>
        </div>
      </div>
    </Link>
  );
}

export default Product;
