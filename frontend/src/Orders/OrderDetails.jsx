import { useParams } from "react-router-dom";
import {
  useCancelOrderMutation,
  useGetOrderQuery,
} from "../services/ordersApi";
import PageTitle from "../components/PageTitle";
import "../OrderStyles/OrderDetails.css";
import Loader from "../ui/Loader";
import { useState } from "react";
import { toast } from "react-toastify";
import Modal from "../ui/Modal";

const OrderDetails = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingCancellation, setPendingCancellation] = useState(null);
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  const { orderId } = useParams();

  const { data: order, isLoading, error } = useGetOrderQuery(orderId);

  const handleCancelClick = (orderId) => {
    setPendingCancellation({ orderId });
    setIsModalOpen(true);
  };
  const handleConfirmCancel = async () => {
    if (!pendingCancellation) return;

    const { orderId } = pendingCancellation;

    try {
      await cancelOrder(orderId).unwrap();
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
    if (status === "Processing") return "processing";
    if (status === "Cancelled") return "cancelled";
    return "delivered";
  };

  if (isLoading) return <Loader fullPage={true} />;
  if (error) return <div className="no-orders">Failed to load order.</div>;

  const orderItems = order?.orderItems || [];
  const shippingInfo = order?.shippingInfo || {};
  return (
    <>
      <PageTitle title="Order Details" />
      <div className="order-box">
        <div className="table-block">
          <h2 className="table-title">Order Items</h2>
          <table className="table-main">
            <thead>
              <tr>
                <th className="head-cell">Image</th>
                <th className="head-cell">Name</th>
                <th className="head-cell">Quantity</th>
                <th className="head-cell">Price</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map((item) => (
                <tr key={item._id} className="table-row">
                  <td className="table-cell">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="item-img"
                    />
                  </td>
                  <td className="table-cell">
                    <span className="item-name-text" title={item.name}>
                      {item.name}
                    </span>
                  </td>
                  <td className="table-cell">{item.quantity}</td>
                  <td className="table-cell">{item.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-block">
          <h2 className="table-title">Shipping Info</h2>
          <table className="table-main">
            <tbody>
              <tr className="table-row">
                <th className="table-cell">Address</th>
                <th className="table-cell">
                  {shippingInfo.address},{shippingInfo.city},
                  {shippingInfo.state},{shippingInfo.country},
                  {shippingInfo.pincode}
                </th>
              </tr>
              <tr className="table-row">
                <th className="table-cell">Phone</th>
                <th className="table-cell">{shippingInfo.phoneNo}</th>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="table-block">
          <h2 className="table-title">Order Summary</h2>
          <table className="table-main">
            <tbody>
              <tr className="table-row">
                <th className="table-cell">Order Status</th>
                <td className="table-cell">
                  <span
                    className={`status-tag ${getStatusClass(
                      order.orderStatus
                    )}`}
                  >
                    {order.orderStatus.toUpperCase()}
                  </span>
                </td>
              </tr>
              <tr className="table-row">
                <th className="table-cell">Payment</th>
                <td className="table-cell">
                  <span
                    className={`pay-tag ${
                      order.paymentInfo.status === "success"
                        ? "paid"
                        : "not-paid"
                    }`}
                  >
                    {order.paymentInfo.status === "success"
                      ? "PAID"
                      : "NOT PAID"}
                  </span>
                </td>
              </tr>
              {order.paidAt && (
                <tr className="table-row">
                  <th className="table-cell">Paid At</th>
                  <td className="table-cell">
                    {new Date(order.paidAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                    })}
                  </td>
                </tr>
              )}
              <tr className="table-row">
                <th className="table-cell">Items Price</th>
                <td className="table-cell">{order.itemsPrice}</td>
              </tr>
              <tr className="table-row">
                <th className="table-cell">Tax Price</th>
                <td className="table-cell">{order.taxPrice}</td>
              </tr>
              <tr className="table-row">
                <th className="table-cell">Shipping Price</th>
                <td className="table-cell">{order.shippingPrice}</td>
              </tr>
              <tr className="table-row">
                <th className="table-cell">Total Price</th>
                <td className="table-cell">{order.totalPrice}</td>
              </tr>
            </tbody>
          </table>
        </div>
        {order.orderStatus === "Processing" && (
          <div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleCancelClick(order._id);
              }}
              className="cancel-order-btn"
            >
              Cancel Item
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
    </>
  );
};

export default OrderDetails;
