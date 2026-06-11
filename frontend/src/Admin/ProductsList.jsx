import React, { useState } from "react";
import "../AdminStyles/ProductsList.css";
import PageTitle from "../components/PageTitle";
import {
  useGetProductsQuery,
  useDeleteProductMutation,
} from "../services/productsApi";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Loader from "../ui/Loader";
import { toast } from "react-toastify";
import Modal from "../ui/Modal";
import ProductForm from "./ProductForm";
import Error from "../ui/Error";
import NoData from "../components/NoData";

function ProductsList() {
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // Just like your selectedReviewId, we use productToDelete to handle
  // both the context AND determine if the modal is open!
  const [productToDelete, setProductToDelete] = useState(null);

  const limit = 10;

  const { data, isLoading, isFetching, error } = useGetProductsQuery(
    { page, limit }
    // { refetchOnFocus: true }
  );

  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const products = data?.data || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.currentPage || 1;

  if (isLoading) return <Loader fullPage={true} />;
  if (error)
    return (
      <div className="product-list-container">
        <Error />
      </div>
    );

  if (!products || products.length === 0) {
    return (
      <div className="product-list-container">
        {/* <h1 className="product-list-title">Admin Products</h1>
        <p className="no-admin-products">No Products Found</p> */}
        <NoData data={"Products"} />
      </div>
    );
  }

  const openEditModal = (product) => {
    setEditData(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditData(null);
  };

  const handleProductDelete = async () => {
    try {
      const targetId = productToDelete._id || productToDelete.id;
      const res = await deleteProduct(targetId).unwrap();
      toast.success(res?.message || "Product deleted successfully");
      setProductToDelete(null);
    } catch (err) {
      if (err.status === 200 || err.status === 204) {
        toast.success("Product deleted successfully");
        setProductToDelete(null);
      } else {
        toast.error(err?.data?.message || "Could not delete product");
      }
    }
  };

  return (
    <>
      <PageTitle title="All Products" />
      <div className="product-list-container">
        <h1 className="product-list-title">All Products</h1>

        <div className={isFetching ? "fetching-data" : ""}>
          <table className="product-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Ratings</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((product, index) => (
                  <tr key={product._id || product.id}>
                    <td>{(currentPage - 1) * limit + index + 1}</td>
                    {/* <td>
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="admin-product-image"
                        />
                      ) : (
                        <div
                          className="admin-product-image-placeholder"
                          style={{ fontSize: "10px", textAlign: "center" }}
                        >
                          No Image
                        </div>
                      )}
                    </td> */}
                    <td>
                      <img
                        src={product.images[0].url || "/placeholder.jpg"}
                        alt={product.name}
                        className="admin-product-image"
                      />
                    </td>
                    <td title={product.name}>
                      <div className="line-clamp-2">{product.name}</div>
                    </td>
                    <td>₹{product.price}</td>
                    <td>
                      {product.ratingsAverage || product.ratings || "N/A"}
                    </td>
                    <td>{product.category}</td>
                    <td>{product.stock ?? "N/A"}</td>
                    <td>
                      {product.createdAt
                        ? new Date(product.createdAt).toLocaleDateString(
                            "en-IN"
                          )
                        : "N/A"}
                    </td>
                    <td className="product-actions">
                      <button
                        className="edit-btn"
                        onClick={() => openEditModal(product)}
                      >
                        <EditIcon sx={{ fontSize: 18 }} />
                      </button>

                      {/* INLINE METHOD: Matching your ProductDetails style exactly */}
                      <button
                        className="delete-btn"
                        onClick={() => setProductToDelete(product)}
                      >
                        <DeleteIcon sx={{ fontSize: 18 }} color="error" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center" }}>
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Edit Product Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title="Edit Product"
          size="large"
        >
          <ProductForm
            initialData={editData}
            initialImages={editData?.images || []}
            onClose={closeModal}
            buttonText="Save Changes"
          />
        </Modal>

        {/* Delete Confirmation Modal - Controlled by whether productToDelete is truthy */}
        <Modal
          isOpen={Boolean(productToDelete)}
          onClose={() => setProductToDelete(null)}
          title="Delete Product"
          size="small"
        >
          <div style={{ padding: "10px 0" }}>
            <p>
              Are you sure you want to delete{" "}
              <strong>{productToDelete?.name}</strong>? This action cannot be
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
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="submit-review-btn"
                style={{ backgroundColor: "#b12704" }}
                onClick={handleProductDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </Modal>

        {/* Pagination Wrapper */}
        {totalPages > 1 && (
          <div
            className="pagination-wrapper"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "15px",
              marginTop: "20px",
            }}
          >
            <button
              className="pagination-btn"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1 || isFetching}
              style={{
                padding: "6px 12px",
                cursor: page === 1 ? "not-allowed" : "pointer",
              }}
            >
              Previous
            </button>
            <span className="pagination-info">
              Page <strong>{currentPage}</strong> of{" "}
              <strong>{totalPages}</strong>
            </span>
            <button
              className="pagination-btn"
              onClick={() =>
                setPage((prev) => (page < totalPages ? prev + 1 : prev))
              }
              disabled={page === totalPages || isFetching}
              style={{
                padding: "6px 12px",
                cursor: page === totalPages ? "not-allowed" : "pointer",
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default ProductsList;
