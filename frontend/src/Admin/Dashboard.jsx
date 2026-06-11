// import { Link } from "react-router-dom";
// import "../AdminStyles/Dashboard.css";
// import PageTitle from "../components/PageTitle";
// import {
//   AddBox,
//   Cancel,
//   CheckCircle,
//   CurrencyRupee,
//   Dashboard as DashboardIcon,
//   Inventory,
//   LocalMall,
//   People,
//   Star,
// } from "@mui/icons-material";
// function Dashboard() {
//   return (
//     <>
//       <PageTitle title="Admin Dashboard" />
//       <div className="dashboard-container">
//         <div className="sidebar">
//           <div className="logo">
//             <DashboardIcon className="logo-icon" />
//             Admin Dashboard
//           </div>
//           <nav className="nav-menu">
//             <div className="nav-section">
//               <h3>Products</h3>
//               <Link to="/admin/products">
//                 <Inventory className="nav-icon" />
//                 All Products
//               </Link>
//               <Link to="/admin/products/create">
//                 <AddBox className="nav-icon" />
//                 Create Product
//               </Link>
//             </div>
//             <div className="nav-section">
//               <h3>Users</h3>
//               <Link to="/admin/users">
//                 <People className="nav-icon" />
//                 All Users
//               </Link>
//             </div>
//             <div className="nav-section">
//               <h3>Orders</h3>
//               <Link to="/admin/orders">
//                 <LocalMall className="nav-icon" />
//                 All Orders
//               </Link>
//             </div>
//             {/* <div className="nav-section">
//               <h3>Reviews</h3>
//               <Link to="/admin/reviewId">
//                 <Star className="nav-icon" />
//                 All Reviews
//               </Link>
//             </div> */}
//           </nav>
//         </div>
//         <div className="main-content">
//           <div className="stats-grid">
//             <div className="stat-box">
//               <Inventory className="icon" />
//               <h3>Total Products</h3>
//               <p>4</p>
//             </div>
//             <div className="stat-box">
//               <LocalMall className="icon" />
//               <h3>Total Orders</h3>
//               <p>10</p>
//             </div>
//             <div className="stat-box">
//               <Star className="icon" />
//               <h3>Total Reviews</h3>
//               <p>50</p>
//             </div>
//             <div className="stat-box">
//               <CurrencyRupee className="icon" />
//               <h3>Total Revenue</h3>
//               <p>5000</p>
//             </div>
//             <div className="stat-box">
//               <Cancel className="icon" />
//               <h3>Out Of Stock</h3>
//               <p>1</p>
//             </div>
//             <div className="stat-box">
//               <CheckCircle className="icon" />
//               <h3>In Stock</h3>
//               <p>3</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// export default Dashboard;

import { Link } from "react-router-dom";
import "../AdminStyles/Dashboard.css";
import PageTitle from "../components/PageTitle";
import Loader from "../ui/Loader";
import { useGetDashboardStatsQuery } from "../services/ordersApi";
import {
  AddBox,
  Cancel,
  CheckCircle,
  CurrencyRupee,
  Dashboard as DashboardIcon,
  Inventory,
  LocalMall,
  People,
  Star,
} from "@mui/icons-material";
import NoData from "../components/NoData";

function Dashboard() {
  const { data, isLoading, error } = useGetDashboardStatsQuery();

  if (isLoading) return <Loader fullPage={true} />;

  if (error) {
    return (
      <div className="dashboard-container">
        <NoData data="Dashboadd" />
      </div>
    );
  }

  const stats = data?.data || {
    totalProducts: 0,
    totalOrders: 0,
    totalReviews: 0,
    totalRevenue: 0,
    outOfStock: 0,
    inStock: 0,
  };

  return (
    <>
      <PageTitle title="Admin Dashboard" />
      <div className="dashboard-container">
        <div className="sidebar">
          <div className="logo">
            <DashboardIcon className="logo-icon" />
            Admin Dashboard
          </div>
          <nav className="nav-menu">
            <div className="nav-section">
              <h3>Products</h3>
              <Link to="/admin/products">
                <Inventory className="nav-icon" />
                All Products
              </Link>
              <Link to="/admin/products/create">
                <AddBox className="nav-icon" />
                Create Product
              </Link>
            </div>
            <div className="nav-section">
              <h3>Users</h3>
              <Link to="/admin/users">
                <People className="nav-icon" />
                All Users
              </Link>
            </div>
            <div className="nav-section">
              <h3>Orders</h3>
              <Link to="/admin/orders">
                <LocalMall className="nav-icon" />
                All Orders
              </Link>
            </div>
          </nav>
        </div>
        <div className="main-content">
          <div className="stats-grid">
            <div className="stat-box">
              <Inventory className="icon" />
              <h3>Total Products</h3>
              <p>{stats.totalProducts}</p>
            </div>
            <div className="stat-box">
              <LocalMall className="icon" />
              <h3>Total Orders</h3>
              <p>{stats.totalOrders}</p>
            </div>
            <div className="stat-box">
              <Star className="icon" />
              <h3>Total Reviews</h3>
              <p>{stats.totalReviews}</p>
            </div>
            <div className="stat-box">
              <CurrencyRupee className="icon" />
              <h3>Total Revenue</h3>
              <p>₹{stats.totalRevenue.toLocaleString("en-IN")}</p>
            </div>
            <div className="stat-box">
              <Cancel className="icon" />
              <h3>Out Of Stock</h3>
              <p>{stats.outOfStock}</p>
            </div>
            <div className="stat-box">
              <CheckCircle className="icon" />
              <h3>In Stock</h3>
              <p>{stats.inStock}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
