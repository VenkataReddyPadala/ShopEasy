import { Link, useNavigate } from "react-router-dom";
import "../CartStyles/Cart.css";
import PageTitle from "../components/PageTitle";
import { useGetMyCartQuery } from "../services/cartApi";
import Loader from "../ui/Loader";
import CartItem from "./CartItem";
function Cart() {
  const navigate = useNavigate();
  const { data, isLoading } = useGetMyCartQuery();
  const cartItems = data?.data?.items;

  if (isLoading) return <Loader fullPage={true} />;
  const subTotal = cartItems?.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const tax = subTotal * 0.18;
  const shippingCharges = subTotal > 500 ? 0 : 50;
  const totalAmount = subTotal + tax + shippingCharges;
  if (cartItems?.length === 0)
    return (
      <div className="empty-cart-container">
        <PageTitle title="Your Cart" />
        <p className="empty-cart-message">Your cart is empty</p>
        <Link to="/products" className="viewProducts">
          View Products
        </Link>
      </div>
    );

  return (
    <>
      <PageTitle title="Your Cart" />
      <div className="cart-page">
        <div className="cart-items">
          <div className="cart-items-heading">Your Cart</div>
          <div className="cart-table">
            <div className="cart-table-header">
              <div className="header-product">Product</div>
              <div className="header-quantity">Quantity</div>
              <div className="header-total item-total-heading">Item Total</div>
              {/* <div className="header-action item-total-heading">Actions</div> */}
            </div>
            {cartItems &&
              cartItems.map((item) => <CartItem key={item._id} item={item} />)}
          </div>
        </div>
        <div className="price-summary">
          <h3 className="price-summary-heading">Price Summary</h3>
          <div className="summary-item">
            <p className="summary-label">Subtotal :</p>
            <p className="summary-value">{subTotal.toFixed(2)}/-</p>
          </div>
          <div className="summary-item">
            <p className="summary-label">Tax (18%) :</p>
            <p className="summary-value">{tax.toFixed(2)}/-</p>
          </div>
          <div className="summary-item">
            <p className="summary-label">Shipping :</p>
            <p className="summary-value">{shippingCharges.toFixed(2)}/-</p>
          </div>
          <div className="summary-total">
            <p className="total-label">Total :</p>
            <p className="total-value">{totalAmount.toFixed(2)}/-</p>
          </div>
          <button
            className="checkout-btn"
            onClick={() => navigate("/shipping")}
            disabled={isLoading}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </>
  );
}

export default Cart;
