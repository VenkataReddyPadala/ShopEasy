import { toast } from "react-toastify";
import "../AdminStyles/UpdateRole.css";
import { useUpdateUserRoleMutation } from "../services/userApi";
function UpdateRole({ initialData, onClose }) {
  const userRoles = ["admin", "user"];
  const [updateUserRole, { isLoading }] = useUpdateUserRoleMutation();
  async function handleUpdate(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData); // Result: { role: "admin" }

    try {
      await updateUserRole({
        id: initialData._id || initialData.id,
        body: payload,
      }).unwrap();
      toast.success("User Role updated successfully!");
      onClose();
    } catch (err) {
      if (err?.data?.message || err?.status) {
        toast.error(err?.data?.message || "Failed to update user role:");
      }
    }
  }
  return (
    <div className="page-wrapper">
      <div className="update-user-role-container">
        {/* <h1>Update User Role</h1> */}
        <form className="update-user-role-form" onSubmit={handleUpdate}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input type="text" id="name" value={initialData.name} readOnly />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" value={initialData.email} readOnly />
          </div>
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              defaultValue={initialData.role}
              id="role"
              name="role"
              disabled={isLoading}
              required
            >
              {userRoles.map((role) => (
                <option value={role} key={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
          <button className="submit-btn" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UpdateRole;
