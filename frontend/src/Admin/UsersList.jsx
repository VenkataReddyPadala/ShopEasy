import { useState } from "react";
import "../AdminStyles/UsersList.css";
import PageTitle from "../components/PageTitle";
import { useDeleteUserMutation, useGetUsersQuery } from "../services/userApi";
import { toast } from "react-toastify";
import Loader from "../ui/Loader";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Modal from "../ui/Modal";
import UpdateRole from "./UpdateRole";
import Error from "../ui/Error";
import NoData from "../components/NoData";
function UsersList() {
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const limit = 10;

  const { data, isLoading, isFetching, error } = useGetUsersQuery({
    page,
    limit,
  });

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const users = data?.data || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.currentPage || 1;

  if (isLoading) return <Loader fullPage={true} />;
  if (error)
    return (
      <div className="usersList-container">
        <Error />
      </div>
    );
  if (!users || users.length === 0) {
    return (
      <div className="usersList-container">
        {/* <h1 className="userList-title">All users</h1>
        <p className="no-admin-products">No users Found</p> */}
        <NoData data={"Users"} />
      </div>
    );
  }

  const openEditModal = (product) => {
    setEditData(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditData(null);
  };
  const handleUserDelete = async () => {
    try {
      const targetId = userToDelete._id || userToDelete.id;
      const res = await deleteUser(targetId).unwrap();
      toast.success(res?.message || "User deleted successfully");
      setUserToDelete(null);
    } catch (err) {
      if (err.status === 200 || err.status === 204) {
        toast.success("User deleted successfully");
        setUserToDelete(null);
      } else {
        toast.error(err?.data?.message || "Could not delete user");
      }
    }
  };

  return (
    <>
      <PageTitle title="All Users" />
      <div className="usersList-container">
        <h1 className="usersList-title">All Users</h1>
        <div className={isFetching ? "fetching-data" : ""}>
          <table className="usersList-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Image</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user, index) => (
                  <tr key={user._id || user.id}>
                    <td>{(currentPage - 1) * limit + index + 1}</td>
                    <td>
                      <img
                        src={user.avatar.url}
                        alt={user.name}
                        className="admin-product-image"
                      />
                    </td>
                    <td title={user.name}>
                      <div className="line-clamp-2">{user.name}</div>
                    </td>
                    <td title={user.name}>
                      <div className="line-clamp-2">{user.name}</div>
                    </td>
                    <td>{user.role}</td>
                    <td>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-IN")
                        : "N/A"}
                    </td>
                    <td className="product-actions">
                      <button
                        className="edit-btn"
                        onClick={() => openEditModal(user)}
                      >
                        <EditIcon sx={{ fontSize: 18 }} />
                      </button>

                      {/* INLINE METHOD: Matching your ProductDetails style exactly */}
                      <button
                        className="delete-btn"
                        onClick={() => setUserToDelete(user)}
                      >
                        <DeleteIcon sx={{ fontSize: 18 }} color="error" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center" }}>
                    No Users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title="Edit User Role"
          size="small"
        >
          <UpdateRole initialData={editData} onClose={closeModal} />
        </Modal>

        <Modal
          isOpen={Boolean(userToDelete)}
          onClose={() => setUserToDelete(null)}
          title="Delete Product"
          size="small"
        >
          <div style={{ padding: "10px 0" }}>
            <p>
              Are you sure you want to delete{" "}
              <strong>{userToDelete?.name}</strong>? This action cannot be
              undone.
            </p>
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
                onClick={() => setUserToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="submit-review-btn"
                style={{ backgroundColor: "#b12704" }}
                onClick={handleUserDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </Modal>
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

export default UsersList;
