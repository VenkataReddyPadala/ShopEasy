import React, { useState } from "react";
import "../OrderStyles/Orders.css";
import {
  useGetMyOrdersQuery,
  useCancelOrderItemMutation,
} from "../services/ordersApi.js";
import Loader from "../ui/Loader";
import Modal from "../ui/Modal.jsx";
import PageTitle from "../components/PageTitle";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const Orders = () => {
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingCancellation, setPendingCancellation] = useState(null); // Stores { orderId, itemId }

  const { data, isLoading, isFetching, error } = useGetMyOrdersQuery(page);
  const [cancelOrderItem, { isLoading: isCancelling }] =
    useCancelOrderItemMutation();

  const orders = data?.data || [];
  const totalPages = data?.totalPages || 1;

  const handleLoadMore = () => {
    if (page < totalPages) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handleCancelClick = (orderId, itemId) => {
    setPendingCancellation({ orderId, itemId });
    setIsModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!pendingCancellation) return;

    const { orderId, itemId } = pendingCancellation;

    try {
      await cancelOrderItem({ orderId, itemId }).unwrap();
      toast.success("Item cancelled successfully.");
      handleCloseModal();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to cancel the item.");
    }
  };

  const handleCloseModal = () => {
    if (isCancelling) return; // Prevent closing while API call is in flight
    setIsModalOpen(false);
    setPendingCancellation(null);
  };

  const getStatusClass = (status) => {
    if (status === "Processing") return "status-processing";
    if (status === "Cancelled") return "status-cancelled";
    return "status-shipped";
  };

  if (isLoading && page === 1) {
    return <Loader fullPage={true} />;
  }

  if (error) {
    return (
      <div className="center-text" style={{ color: "#b12704" }}>
        {error?.data?.message || "Error loading orders. Please try again."}
      </div>
    );
  }

  return (
    <div className="container">
      <PageTitle title="Your Orders" />
      <h2 className="heading">Your Orders</h2>
      {orders.length === 0 && (
        <p className="fallback-text">You haven't placed any orders yet.</p>
      )}

      <div className="orders-list">
        {orders.map((order) => (
          <div key={order._id} className="order-card">
            <div className="order-header">
              <div>
                <span className="header-label">ORDER PLACED</span>
                <div className="header-value">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
              <div>
                <span className="header-label">TOTAL</span>
                <div className="header-value">₹{order.totalPrice}</div>
              </div>
              <div>
                <span className="header-label">SHIP TO</span>
                <div
                  className="header-value"
                  title={order.shippingInfo?.address}
                >
                  {order.shippingInfo?.city || "N/A"}
                </div>
              </div>
              <div className="header-right">
                <span className="header-label">ORDER # {order._id}</span>
              </div>
            </div>
            <Link to={`/orders/${order._id}`} className="order-body-link">
              <div className="order-body">
                {order.orderItems?.map((item) => (
                  <div key={item._id} className="item-row">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="item-image"
                    />

                    <div className="item-details">
                      <h4 className="item-name">{item.name}</h4>
                      <p className="item-meta">Quantity: {item.quantity}</p>
                      <p className="item-meta">Price: ₹{item.price}</p>
                      <div
                        className={`status-badge ${getStatusClass(
                          item.status
                        )}`}
                      >
                        Status: {item.status}
                      </div>
                    </div>

                    <div className="item-actions">
                      {item.status === "Processing" ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleCancelClick(order._id, item._id);
                          }}
                          disabled={isCancelling}
                          className="cancel-btn"
                        >
                          Cancel Item
                        </button>
                      ) : (
                        <button disabled className="disabled-btn">
                          {item.status}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* View More Pagination */}
      {page < totalPages && (
        <div className="pagination-container">
          <button
            onClick={handleLoadMore}
            disabled={isFetching}
            className="view-more-btn"
          >
            {isFetching ? <Loader /> : "View More Orders"}
          </button>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Confirm Cancellation"
        size="small"
      >
        <>
          <p>Are you sure you want to cancel this item from your order?</p>
          <div
            className="modal-confirm-actions"
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "30px",
              justifyContent: "flex-end",
            }}
          >
            <button
              className="view-more-btn"
              style={{
                margin: 0,
                padding: "8px 16px",
                backgroundColor: "#ccc",
                color: "#333",
              }}
              onClick={handleCloseModal}
              disabled={isCancelling}
            >
              No, Keep It
            </button>
            <button
              className="cancel-btn"
              onClick={handleConfirmCancel}
              disabled={isCancelling}
            >
              {isCancelling ? "Cancelling..." : "Yes, Cancel Item"}
            </button>
          </div>
        </>
      </Modal>
    </div>
  );
};

export default Orders;
