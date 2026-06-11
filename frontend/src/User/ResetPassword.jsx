import { toast } from "react-toastify";
import { useResetPasswordMutation } from "../services/userApi";
import "../UserStyles/Form.css";
import { useNavigate, useParams } from "react-router-dom";
import PageTitle from "../components/PageTitle";
function ResetPassword() {
  const [resetPassword, { isLoading: isUpdating, error }] =
    useResetPasswordMutation();
  const navigate = useNavigate();
  const { token } = useParams();
  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await resetPassword({ token, passwordData: data }).unwrap();
      toast.success(res.message || "Password Reset successfull");
      e.target.reset();
      navigate("/");
    } catch (err) {
      const isValidationError = err?.data?.errors;
      if (!isValidationError) {
        const message = err?.data?.message || "Password Reset Failed";
        toast.error(message);
      }
    }
  }
  return (
    <div className="container update-container">
      <PageTitle title={"Reset-Password"} />
      <div className="form-content">
        <form className="form" onSubmit={handleSubmit}>
          <h2>Reset Password</h2>
          <div className="input-group">
            <input
              type="password"
              name="password"
              placeholder="New Password"
              disabled={isUpdating}
              autoComplete="true"
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
              autoComplete="true"
            />
            {error?.data?.errors?.passwordConfirm && (
              <span className="error-text">
                {error.data.errors.passwordConfirm}
              </span>
            )}
          </div>
          <button className="authBtn" disabled={isUpdating}>
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
