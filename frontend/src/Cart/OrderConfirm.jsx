import { useSelector } from "react-redux";
import "../CartStyles/OrderConfirm.css";
import PageTitle from "../components/PageTitle";
import { useGetMyCartQuery } from "../services/cartApi";
import { useGetMeQuery } from "../services/userApi";
import Loader from "../ui/Loader";
import CheckoutPath from "./CheckoutPath";

import {
  useGetKeyQuery,
  useProcessPaymentMutation,
  useVerifyPaymentMutation,
} from "../services/paymentApi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useState } from "react";

function OrderConfirm() {
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const navigate = useNavigate();
  const { selectedAddressId } = useSelector((store) => store.checkout);
  const {
    data,
    isLoading: isCartLoading,
    refetch: refetchCart,
  } = useGetMyCartQuery();
  const { data: userData, isLoading: isUserLoading } = useGetMeQuery();

  // 2. Initialize payment hooks
  const { data: keyData } = useGetKeyQuery();
  // const [processPayment, { isLoading: isProcessing }] =
  //   useProcessPaymentMutation();
  // const [verifyPayment, { isLoading: isVerifying }] =
  //   useVerifyPaymentMutation();
  const [processPayment] = useProcessPaymentMutation();
  const [verifyPayment] = useVerifyPaymentMutation();

  const cartItems = data?.data?.items;
  const user = userData?.data;

  const shippingInfo = user?.addresses.find(
    (item) => item._id?.toString() === selectedAddressId?.toString()
  );

  // if (
  //   isUserLoading ||
  //   isCartLoading ||
  //   isProcessing ||
  //   isVerifying ||
  //   paymentSuccess
  // ) {
  //   return <Loader fullPage={true} />;
  // }

  if (isUserLoading || isCartLoading || paymentSuccess) {
    return <Loader fullPage={true} />;
  }

  const subTotal = cartItems?.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const tax = subTotal * 0.18;
  const shippingCharges = subTotal > 500 ? 0 : 50;
  const totalAmount = subTotal + tax + shippingCharges;

  // 3. Helper function to dynamically load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // 4. The Payment Handler Logic
  async function proceedToPayment() {
    // A. Load Razorpay script on demand
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      toast.error(
        "Failed to load payment gateway. Please check your connection."
      );
      return;
    }

    try {
      // B. Create order on backend (passing the totalAmount)
      const orderResponse = await processPayment({
        amount: totalAmount,
      }).unwrap();
      const razorpayOrder = orderResponse.order;

      // C. Map your schema data structure to send along with verification later
      const orderSubmissionData = {
        shippingInfo: {
          address: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          country: shippingInfo.country,
          pincode: shippingInfo.pincode,
          phoneNo: shippingInfo.phoneNo,
        },
        orderItems: cartItems.map((item) => ({
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.images[0].url,
          product: item.product._id,
        })),
        itemsPrice: subTotal,
        taxPrice: tax,
        shippingPrice: shippingCharges,
        totalPrice: totalAmount,
      };

      // D. Define Razorpay configurations
      const options = {
        key: keyData?.key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "ShopEasy",
        description: "E-commerce Website Payment Transaction",
        order_id: razorpayOrder.id,
        handler: async function (response) {
          try {
            setPaymentSuccess(true);
            // E. When payment succeeds, call verify endpoint with signatures + order data
            const verificationPayload = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              ...orderSubmissionData, // Attach your schema details here
            };

            const verificationResult = await verifyPayment(
              verificationPayload
            ).unwrap();

            if (verificationResult.status === "success") {
              setTimeout(() => {
                navigate("/order/success", {
                  replace: true,
                  state: {
                    fromPaymentGateway: true,
                    orderId: verificationResult.order._id,
                  },
                });
                refetchCart();
              }, 0);
            }
          } catch (err) {
            setPaymentSuccess(false);
            toast.error("Payment verification failed! " + err?.data?.message);
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: shippingInfo?.phoneNo,
        },
        theme: {
          color: "#3399cc",
        },
      };

      const razorpayWindow = new window.Razorpay(options);
      razorpayWindow.open();
    } catch (error) {
      toast.error(
        "Error initiating payment processing: " + error?.data?.message
      );
    }
  }

  return (
    <>
      {/* {(isProcessing || isVerifying || paymentSuccess) && (
        <Loader fullPage={true} />
      )} */}
      <PageTitle title="Order Confirm" />
      <CheckoutPath activePath={1} />
      <div className="confirm-container">
        <h1 className="confirm-header">Order Confirmation</h1>
        <table className="confirm-table">
          <caption>Shipping Details</caption>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{user.name}</td>
              <td>{shippingInfo.phoneNo}</td>
              <td>
                {shippingInfo.address},{shippingInfo.city},{shippingInfo.state},
                {shippingInfo.country}-{shippingInfo.pinCode}
              </td>
            </tr>
          </tbody>
        </table>

        <table className="confirm-table cart-table">
          <caption>Cart Items</caption>
          <thead>
            <tr>
              <th>Image</th>
              <th>Product Name</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total Price</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item) => (
              <tr key={item._id}>
                <td>
                  <img
                    src={item.product.images[0].url}
                    alt={item.product.name}
                    className="order-product-image"
                  />
                </td>
                <td>{item.product.name}</td>
                <td>{item.product.price}</td>
                <td>{item.quantity}</td>
                <td>{(item.quantity * item.product.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <table className="confirm-table">
          <caption>Order Summary</caption>
          <thead>
            <tr>
              <th>Subtotal</th>
              <th>Shipping Charges</th>
              <th>Tax</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{subTotal}/-</td>
              <td>
                {shippingCharges}
                {shippingCharges !== 0 && "/-"}
              </td>
              <td>{tax}/-</td>
              <td>{totalAmount}/-</td>
            </tr>
          </tbody>
        </table>

        <button className="proceed-button" onClick={proceedToPayment}>
          Proceed to payment
        </button>
      </div>
    </>
  );
}

export default OrderConfirm;
