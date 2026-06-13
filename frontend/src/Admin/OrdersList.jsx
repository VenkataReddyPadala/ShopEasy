// import { useState } from "react";
// import "../AdminStyles/OrdersList.css";
// import { useGetAllOrderItemsQuery } from "../services/ordersApi";
// import Loader from "../ui/Loader";
// import PageTitle from "../components/PageTitle";
// import Modal from "../ui/Modal";
// import NoData from "../components/NoData";
// import EditIcon from "@mui/icons-material/Edit";
// import OrderForm from "./OrderForm";

// function OrdersList() {
//   const [page, setPage] = useState(1);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editData, setEditData] = useState(null);
//   const [selectedStatus, setSelectedStatus] = useState("");
//   const limit = 10;

//   // Fetch individual order items directly from your updated aggregation endpoint
//   const { data, isLoading, isFetching, error } = useGetAllOrderItemsQuery({
//     page,
//     limit,
//   });

//   // Your backend now returns the flattened items array inside `data.data`
//   const flattenedItems = data?.data || [];
//   const totalPages = data?.totalPages || 1;
//   const currentPage = data?.currentPage || 1;

//   // Loading & Error States
//   if (isLoading) return <Loader fullPage={true} />;

//   if (error) {
//     return (
//       <div className="ordersList-container">
//         <div className="error-message">
//           {error?.data?.message ||
//             "Something went wrong while fetching order items."}
//         </div>
//       </div>
//     );
//   }

//   if (flattenedItems.length === 0) {
//     return (
//       <div className="ordersList-container">
//         <NoData data={"Orders"} />
//       </div>
//     );
//   }

//   // Modal Handlers
//   const openEditModal = (item) => {
//     setEditData(item);
//     // setSelectedStatus(item.status || "Processing");
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setEditData(null);
//     // setSelectedStatus("");
//   };

//   // Submit Status Update

//   return (
//     <>
//       <PageTitle title="All Orders" />
//       <div className="ordersList-container">
//         <h1 className="ordersList-title">All Orders</h1>

//         <div className={isFetching ? "fetching-data" : ""}>
//           <table className="ordersList-table">
//             <thead>
//               <tr>
//                 <th>S.No</th>
//                 <th>Item ID</th>
//                 <th>Name</th>
//                 <th>Qty</th>
//                 <th>Unit Price</th>
//                 <th>Status</th>
//                 <th>Created At</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {flattenedItems.map((item, index) => (
//                 <tr key={`${item._id}-${index}`}>
//                   <td>{(currentPage - 1) * limit + index + 1}</td>
//                   <td>{item._id}</td>
//                   <td>{item.name}</td>
//                   <td>{item.quantity}</td>
//                   <td>₹{item.price}</td>
//                   <td className={`order-status ${item.status.toLowerCase()}`}>
//                     {item.status}
//                   </td>
//                   <td>
//                     {item.createdAt
//                       ? new Date(item.createdAt).toLocaleDateString("en-IN")
//                       : "N/A"}
//                   </td>
//                   <td className="product-actions">
//                     <button
//                       className="edit-btn"
//                       onClick={() => openEditModal(item)}
//                       disabled={
//                         item.status === "Cancelled" ||
//                         item.status === "Delivered"
//                       }
//                       style={
//                         item.status === "Cancelled" ||
//                         item.status === "Delivered"
//                           ? {
//                               pointerEvents: "none",
//                               cursor: "not-allowed",
//                               opacity: 0.5,
//                             } // Added opacity just for a visual cue!
//                           : {}
//                       }
//                     >
//                       <EditIcon sx={{ fontSize: 18 }} />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Edit Status Modal */}
//         <Modal
//           isOpen={isModalOpen}
//           onClose={closeModal}
//           title="Edit Order Status"
//           size="small"
//         >
//           <OrderForm initialData={editData} onClose={closeModal} />
//         </Modal>

//         {/* Pagination Controls */}
//         {totalPages > 1 && (
//           <div
//             className="pagination-wrapper"
//             style={{
//               display: "flex",
//               justifyContent: "center",
//               alignItems: "center",
//               gap: "15px",
//               marginTop: "20px",
//             }}
//           >
//             <button
//               className="pagination-btn"
//               onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
//               disabled={page === 1 || isFetching}
//               style={{
//                 padding: "6px 12px",
//                 cursor: page === 1 ? "not-allowed" : "pointer",
//               }}
//             >
//               Previous
//             </button>
//             <span className="pagination-info">
//               Page <strong>{currentPage}</strong> of{" "}
//               <strong>{totalPages}</strong>
//             </span>
//             <button
//               className="pagination-btn"
//               onClick={() =>
//                 setPage((prev) => (page < totalPages ? prev + 1 : prev))
//               }
//               disabled={page === totalPages || isFetching}
//               style={{
//                 padding: "6px 12px",
//                 cursor: page === totalPages ? "not-allowed" : "pointer",
//               }}
//             >
//               Next
//             </button>
//           </div>
//         )}
//       </div>
//     </>
//   );
// }

// export default OrdersList;

import { useState } from "react";
import "../AdminStyles/OrdersList.css";
import { useGetAllOrderItemsQuery } from "../services/ordersApi";
import Loader from "../ui/Loader";
import PageTitle from "../components/PageTitle";
import Modal from "../ui/Modal";
import NoData from "../components/NoData";
import EditIcon from "@mui/icons-material/Edit";
import OrderForm from "./OrderForm";

function OrdersList() {
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const limit = 10;

  // Fetch individual order items directly from your updated aggregation endpoint
  const { data, isLoading, isFetching, error } = useGetAllOrderItemsQuery({
    page,
    limit,
  });

  // Your backend now returns the flattened items array inside `data.data`
  const flattenedItems = data?.data || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.currentPage || 1;

  // Loading & Error States
  if (isLoading) return <Loader fullPage={true} />;

  if (error) {
    return (
      <div className="ordersList-container">
        <div className="error-message">
          {error?.data?.message ||
            "Something went wrong while fetching order items."}
        </div>
      </div>
    );
  }

  if (flattenedItems.length === 0) {
    return (
      <div className="ordersList-container">
        <NoData data={"Orders"} />
      </div>
    );
  }

  // Modal Handlers
  const openEditModal = (item) => {
    setEditData(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditData(null);
  };

  return (
    <>
      <PageTitle title="All Orders" />
      <div className="ordersList-container">
        <h1 className="ordersList-title">All Orders</h1>

        <div className={isFetching ? "fetching-data" : ""}>
          <table className="ordersList-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Item ID</th>
                <th>Name</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {flattenedItems.map((item, index) => (
                <tr key={`${item._id}-${index}`}>
                  <td>{(currentPage - 1) * limit + index + 1}</td>
                  <td>{item._id}</td>
                  <td title={item.name}>
                    <div className="line-clamp-2">{item.name}</div>
                  </td>
                  <td>{item.quantity}</td>
                  <td>₹{item.price}</td>
                  <td className={`order-status ${item.status.toLowerCase()}`}>
                    {item.status}
                  </td>
                  <td>
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString("en-IN")
                      : "N/A"}
                  </td>
                  <td className="order-actions">
                    <button
                      className="edit-btn"
                      onClick={() => openEditModal(item)}
                      disabled={
                        item.status === "Cancelled" ||
                        item.status === "Delivered"
                      }
                      style={
                        item.status === "Cancelled" ||
                        item.status === "Delivered"
                          ? {
                              pointerEvents: "none",
                              cursor: "not-allowed",
                              opacity: 0.5,
                            }
                          : {}
                      }
                    >
                      <EditIcon sx={{ fontSize: 18 }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit Status Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title="Edit Order Status"
          size="small"
        >
          <OrderForm initialData={editData} onClose={closeModal} />
        </Modal>

        {/* Pagination Controls */}
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

export default OrdersList;
