import { toast } from "react-toastify";
import PageTitle from "../components/PageTitle";
import { useUpdateMyPasswordMutation } from "../services/userApi";
import "../UserStyles/Form.css";
import { useNavigate } from "react-router-dom";

function UpdatePassword() {
  const [updatePassword, { isLoading: isUpdating, error }] =
    useUpdateMyPasswordMutation();
  const navigate = useNavigate();
  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const passwordData = Object.fromEntries(formData.entries());
    try {
      const res = await updatePassword(passwordData).unwrap();
      toast.success(res.message || "Password Updated");
      e.target.reset();
      navigate("/account");
    } catch (err) {
      const isValidationError = err?.data?.errors;
      if (!isValidationError) {
        const message = err?.data?.message || "Password Update Failed";
        toast.error(message);
      }
    }
  }
  return (
    <div className="container update-container">
      <PageTitle title={"Update-Password"} />
      <div className="form-content">
        <form className="form" onSubmit={handleSubmit}>
          <h2>Update Password</h2>
          <div className="input-group">
            <input
              type="password"
              name="currentPassword"
              placeholder="Current Password"
              disabled={isUpdating}
              autoComplete="current-password"
            />
            {error?.data?.errors?.currentPassword && (
              <span className="error-text">
                {error.data.errors.currentPassword}
              </span>
            )}
          </div>
          <div className="input-group">
            <input
              type="password"
              name="password"
              placeholder="New Password"
              disabled={isUpdating}
              autoComplete="new-password"
            />
            {error?.data?.errors?.password && (
              <span className="error-text">{error.data.errors.password}</span>
            )}
          </div>
          <div className="input-group">
            <input
              type="password"
              name="passwordConfirm"
              placeholder="Confirm Password"
              disabled={isUpdating}
              autoComplete="new-password"
            />
            {error?.data?.errors?.passwordConfirm && (
              <span className="error-text">
                {error.data.errors.passwordConfirm}
              </span>
            )}
          </div>
          <button className="authBtn" disabled={isUpdating}>
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default UpdatePassword;
