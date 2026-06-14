import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazy, Suspense } from "react"; // 1. Import lazy and Suspense

// Keep small, global UI components statically imported so they load instantly
import Error from "./ui/Error";
import Loader from "./ui/Loader";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import AdminLayout from "./layouts/AdminLayout";

// Loaders can stay statically imported
import { authLoader } from "./util/authLoader";
import { guestLoader } from "./util/guestLoader";
import { adminLoader } from "./util/adminLoader";

// 2. Turn your page imports into lazy imports
const Home = lazy(() => import("./pages/Home"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Products = lazy(() => import("./pages/Products"));
const Profile = lazy(() => import("./User/Profile"));
const UpdateProfile = lazy(() => import("./User/UpdateProfile"));
const UpdatePassword = lazy(() => import("./User/UpdatePassword"));
const ForgotPassword = lazy(() => import("./User/ForgotPassword"));
const ResetPassword = lazy(() => import("./User/ResetPassword"));
const Register = lazy(() => import("./User/Register"));
const Login = lazy(() => import("./User/Login"));
const Cart = lazy(() => import("./Cart/Cart"));
const Shipping = lazy(() => import("./Cart/Shipping"));
const OrderConfirm = lazy(() => import("./Cart/OrderConfirm"));
const PaymentSuccess = lazy(() => import("./Cart/PaymentSuccess"));
const Orders = lazy(() => import("./Orders/Orders"));
const OrderDetails = lazy(() => import("./Orders/OrderDetails"));

// Admin Pages
const Dashboard = lazy(() => import("./Admin/Dashboard"));
const ProductsList = lazy(() => import("./Admin/ProductsList"));
const CreateProduct = lazy(() => import("./Admin/CreateProduct"));
const UsersList = lazy(() => import("./Admin/UsersList"));
const OrdersList = lazy(() => import("./Admin/OrdersList"));

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    errorElement: <Error />,
    children: [
      {
        path: "/",
        element: <Home />,
        errorElement: <Error />,
      },
      {
        path: "/products/:id",
        element: <ProductDetails />,
      },
      {
        path: "/products",
        element: <Products />,
      },
      {
        path: "/about",
        element: <AboutUs />,
      },
      {
        path: "/contact",
        element: <ContactUs />,
      },
      {
        path: "/account",
        element: <Profile />,
        loader: authLoader,
        HydrateFallback: () => <Loader fullPage={true} />,
      },
      {
        path: "/profile/update",
        element: <UpdateProfile />,
        loader: authLoader,
        HydrateFallback: () => <Loader fullPage={true} />,
      },
      {
        path: "/updateMyPassword",
        element: <UpdatePassword />,
        loader: authLoader,
        HydrateFallback: () => <Loader fullPage={true} />,
      },
      {
        path: "/shipping",
        element: <Shipping />,
        loader: authLoader,
        HydrateFallback: () => <Loader fullPage={true} />,
      },
      {
        path: "/cart",
        element: <Cart />,
        loader: authLoader,
        HydrateFallback: () => <Loader fullPage={true} />,
      },
      {
        path: "/order/confirm",
        element: <OrderConfirm />,
        loader: authLoader,
        HydrateFallback: () => <Loader fullPage={true} />,
      },
      {
        path: "/order/success",
        element: <PaymentSuccess />,
        // loader: authLoader,
        // HydrateFallback: () => <Loader fullPage={true} />,
      },
      {
        path: "/orders",
        element: <Orders />,
        loader: authLoader,
        HydrateFallback: () => <Loader fullPage={true} />,
      },
      {
        path: "/orders/:orderId",
        element: <OrderDetails />,
        loader: authLoader,
        HydrateFallback: () => <Loader fullPage={true} />,
      },
      {
        path: "/forgotPassword",
        element: <ForgotPassword />,
      },
    ],
  },
  {
    element: <AdminLayout />,
    errorElement: <Error />,
    children: [
      {
        path: "/admin/dashboard",
        element: <Dashboard />,
        loader: adminLoader,
        HydrateFallback: () => <Loader fullPage={true} />,
      },
      {
        path: "/admin/products",
        element: <ProductsList />,
        loader: adminLoader,
        HydrateFallback: () => <Loader fullPage={true} />,
      },
      {
        path: "/admin/users",
        element: <UsersList />,
        loader: adminLoader,
        HydrateFallback: () => <Loader fullPage={true} />,
      },
      {
        path: "/admin/orders",
        element: <OrdersList />,
        loader: adminLoader,
        HydrateFallback: () => <Loader fullPage={true} />,
      },
      {
        path: "/admin/products/create",
        element: <CreateProduct />,
        loader: adminLoader,
        HydrateFallback: () => <Loader fullPage={true} />,
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/signup",
        element: <Register />,
        loader: guestLoader,
        HydrateFallback: () => <Loader fullPage={true} />,
      },
      {
        path: "/login",
        element: <Login />,
        loader: guestLoader,
        HydrateFallback: () => <Loader fullPage={true} />,
      },
      {
        path: "/resetPassword/:token",
        element: <ResetPassword />,
      },
    ],
  },
]);

function App() {
  return (
    // 3. Wrap your provider in Suspense to give a loading fallback while chunks load
    <Suspense fallback={<Loader fullPage={true} />}>
      <RouterProvider
        router={router}
        fallbackElement={<Loader fullPage={true} />}
      />
    </Suspense>
  );
}

export default App;
