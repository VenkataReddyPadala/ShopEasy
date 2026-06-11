import { useState, useEffect } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  useAddToCartMutation,
  useRemoveItemMutation,
} from "../services/cartApi";
import { toast } from "react-toastify";

function CartItem({ item }) {
  const { product, quantity } = item || {};
  const productId = product?._id;

  const [updateCart, { isLoading: isUpdating }] = useAddToCartMutation();
  const [removeItem, { isLoading: isRemoving }] = useRemoveItemMutation();

  // Local state to keep the UI snappy
  const [localQuantity, setLocalQuantity] = useState(quantity || 1);

  // Keep local state synced with incoming server data
  useEffect(() => {
    setLocalQuantity(quantity);
  }, [quantity]);

  async function handleIncrease() {
    if (localQuantity >= product?.stock) {
      toast.error("Cannot exceed available stock");
      return;
    }
    const nextQty = localQuantity + 1;
    setLocalQuantity(nextQty);

    try {
      // Pass nextQty directly because localQuantity hasn't updated yet
      await updateCart({ productId, quantity: nextQty }).unwrap();
    } catch (err) {
      setLocalQuantity(quantity); // Revert on error
      toast.error(err?.data?.message || "Update failed");
    }
  }

  async function handleDecrease() {
    if (localQuantity <= 1) {
      await removeItem(productId);
      return;
    }
    const nextQty = localQuantity - 1;
    setLocalQuantity(nextQty);

    try {
      await updateCart({ productId, quantity: nextQty }).unwrap();
    } catch (err) {
      setLocalQuantity(quantity); // Revert on error
      toast.error(err?.data?.message || "Update failed");
    }
  }

  return (
    <div
      className={`cart-item ${isUpdating || isRemoving ? "opacity-50" : ""}`}
    >
      <div className="item-info">
        <img
          src={product?.images[0]?.url || "/placeholder.jpg"}
          alt={product?.name || "Product"}
          className="cart-item-image"
        />
        <div className="item-details">
          <h3 className="item-name">{product?.name}</h3>
          <p className="item-price">
            <strong>Price : </strong>
            {product?.price?.toFixed(2)}/-
          </p>
          <p className="item-quantity">
            <strong>Stock : </strong>
            {/* {quantity} */}
            {product.stock}
          </p>
        </div>
      </div>
      <div className="quantity-controls">
        <button
          className="quantity-button"
          onClick={handleDecrease}
          disabled={isUpdating || isRemoving}
        >
          {localQuantity === 1 ? (
            <DeleteIcon fontSize="small" color="error" />
          ) : (
            "-"
          )}
        </button>
        <input
          type="number"
          value={localQuantity}
          className="quantity-input"
          readOnly
        />
        <button
          className="quantity-button"
          onClick={handleIncrease}
          disabled={localQuantity >= product.stock || isUpdating}
        >
          +
        </button>
      </div>
      <div className="item-total">
        <span className="item-total-span">
          {(product?.price * quantity).toFixed(2)}/-
        </span>
      </div>
    </div>
  );
}

export default CartItem;
