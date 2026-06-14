import { Link } from "react-router-dom";
import "../UserStyles/Form.css";
import { toast } from "react-toastify";
import { useLoginMutation } from "../services/userApi";
import Loader from "../ui/Loader";
import PageTitle from "../components/PageTitle";
import { useAuthRedirect } from "../hooks/useAuthRedirect";
function Login() {
  // const navigate = useNavigate();
  // const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoading: isAuthChecking } = useAuthRedirect();
  const [login, { isLoading }] = useLoginMutation();

  if (isAuthChecking) return <Loader fullPage={true} />;
  if (isAuthenticated) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await login(data).unwrap();
      // const redirectTo = searchParams.get("from") || "/";
      // navigate(redirectTo, { replace: true });
      toast.success(res.message || "Welcome back!");
      // on success unwrap sends the same response as you send from backed so you can just use res.message but for err it puts the backend object inside data so you need to do err.data?.message
    } catch (err) {
      toast.error(err?.data?.message || "Login failed");
    }
  };
  return (
    <>
      <PageTitle title="Login" />
      <div className="form-container container">
        <div className="form-content">
          <form className="form" onSubmit={handleSubmit}>
            <h2>Login</h2>
            <div className="input-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                disabled={isLoading}
                required={true}
                autoComplete="email"
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                disabled={isLoading}
                required={true}
                autoComplete="current-password"
              />
            </div>
            <button
              className="authBtn"
              disabled={isLoading}
              style={{ pointerEvents: isLoading ? "none" : "auto" }}
            >
              {isLoading ? <span className="spinner-sm"></span> : "Login"}
            </button>
            <p className="form-links">
              Forget your password?<Link to="/forgotPassword">Reset</Link> Here
            </p>
            <p className="form-links">
              Don't have an account?<Link to="/signup">Signup</Link> Here
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

export default Login;
