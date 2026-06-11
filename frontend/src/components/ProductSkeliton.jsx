import "../componentStyles/Product.css";
import "../componentStyles/Skeleton.css";

function ProductSkeleton() {
  return (
    <div className="product-card">
      {/* 1. Match the image height exactly */}
      <div
        className="skeleton product-image-card"
        style={{ height: "200px" }}
      />

      <div className="product-details">
        {/* 2. Match the Title height and line-clamp space */}
        <div
          className="skeleton"
          style={{ height: "1.4rem", width: "90%", marginBottom: "0.5rem" }}
        />

        {/* 3. Match the Rating/Description area */}
        <div
          className="skeleton"
          style={{ height: "1rem", width: "40%", marginBottom: "1rem" }}
        />

        {/* 4. Match the Price */}
        <div
          className="skeleton"
          style={{ height: "1rem", width: "30%", marginBottom: "1rem" }}
        />

        {/* 5. Match the Button shape at the bottom */}
        <div
          className="skeleton add-to-cart"
          style={{ width: "100%", height: "40px", marginTop: "auto" }}
        />
      </div>
    </div>
  );
}
export default ProductSkeleton;
