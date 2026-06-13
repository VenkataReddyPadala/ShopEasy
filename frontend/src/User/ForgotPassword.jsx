import { toast } from "react-toastify";
import PageTitle from "../components/PageTitle";
import { useForgotPasswordMutation } from "../services/userApi";
import "../UserStyles/Form.css";
function ForgotPassword() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    try {
      const res = await forgotPassword(data).unwrap();
      toast.success(res.message || "Message send to registered email");
      e.target.reset();
    } catch (err) {
      toast.error(err.data?.message || "Something went wrong try again later");
    }
  }
  return (
    <div className="container forgot-container">
      <PageTitle title="Forgot-Password" />
      <div className="form-content email-group">
        <form className="form" onSubmit={handleSubmit}>
          <h2>Forgot Password</h2>
          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="Enter registered Email"
              required={true}
              autoComplete="email"
              disabled={isLoading}
            />
          </div>
          <button className="authBtn" disabled={isLoading}>
            {!isLoading ? "Send Email" : "Sending Email..."}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
