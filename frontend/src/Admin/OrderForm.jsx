import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useUpdateOrderItemStatusMutation } from "../services/ordersApi";

function OrderForm({ onClose, initialData }) {
  const [selectedStatus, setSelectedStatus] = useState(
    initialData?.status || "Processing"
  );
  const [updateOrderItemStatus, { isLoading: isUpdating }] =
    useUpdateOrderItemStatusMutation();

  useEffect(() => {
    if (initialData?.status) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedStatus(initialData.status);
    }
  }, [initialData]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!initialData) return;

    try {
      await updateOrderItemStatus({
        orderId: initialData.orderId,
        itemId: initialData._id,
        status: selectedStatus,
      }).unwrap();

      toast.success("Order item status updated successfully");
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || "Could not update order item status");
    }
  };

  return (
    <form onSubmit={handleStatusUpdate} style={{ padding: "10px 0" }}>
      <div style={{ marginBottom: "15px" }}>
        <p style={{ marginBottom: "8px" }}>
          Updating status for item: <strong>{initialData?.name}</strong>
        </p>
        <label
          htmlFor="orderStatus"
          style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: "600",
          }}
        >
          Select Status
        </label>
        <select
          id="orderStatus"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          disabled={isUpdating}
          style={{
            width: "100%",
            padding: "8px 12px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontSize: "14px",
          }}
        >
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

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
          onClick={onClose}
          disabled={isUpdating}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="submit-review-btn"
          disabled={isUpdating}
        >
          {isUpdating ? "Updating..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

export default OrderForm;
