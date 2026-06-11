import { useLocation, useNavigate, Navigate } from "react-router-dom";
import "../CartStyles/PaymentSuccess.css";
import PageTitle from "../components/PageTitle";

function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  const isLegitimateRedirect = location.state?.fromPaymentGateway;
  const orderId = location.state?.orderId;

  // If someone typed the URL manually, location.state is undefined.
  // Instantly redirect them away to the homepage or orders tab.
  if (!isLegitimateRedirect) {
    return navigate("/", { replace: true });
    // return <Navigate to="/" replace={true} />;
  }

  return (
    <>
      <PageTitle title="Payment Status" />
      <div className="payment-success-container">
        <div className="success-content">
          <div className="success-icon">
            <div className="checkmark"></div>
          </div>
          <h1>🎉 Payment Successful!</h1>
          <p>Thank you for your purchase. Your order has been placed.</p>
          {orderId && (
            <p>
              <strong>Order ID:</strong> {orderId}
            </p>
          )}
          <button
            className="explore-btn"
            onClick={() => navigate("/orders", { replace: true })}
          >
            View Orders
          </button>
        </div>
      </div>
    </>
  );
}

export default PaymentSuccess;
