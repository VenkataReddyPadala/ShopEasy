import { Link, useSearchParams } from "react-router-dom";
import { useRef, useState } from "react";
import { useSignupMutation } from "../services/userApi";
import { toast } from "react-toastify";
import PageTitle from "../components/PageTitle";
import { useAuthRedirect } from "../hooks/useAuthRedirect";
import "../UserStyles/Form.css";
function Register() {
  const [signup, { isLoading, error }] = useSignupMutation();
  const { isAuthenticated, isLoading: isAuthChecking } = useAuthRedirect();
  // const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef(null);
  const from = searchParams.get("from") || "/";
  const [avatarPreview, setAvatarPreview] = useState(
    "/images/default-avatar.jpg"
  );
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    avatar: "",
  });
  const { name, email, password, passwordConfirm } = user;
  if (isAuthChecking) return <Loader fullPage={true} />;
  if (isAuthenticated) return null;
  function registerDataChange(e) {
    if (e.target.name === "avatar") {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setAvatarPreview(reader.result);
          setUser({ ...user, avatar: reader.result });
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    } else {
      setUser({ ...user, [e.target.name]: e.target.value });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    // if (password !== passwordConfirm) {
    //   return toast.error("Passwords do not match!");
    // }
    // if (password.length < 8) {
    //   return toast.error("Password must be at least 8 characters");
    // }
    try {
      const res = await signup(user).unwrap();
      // const redirectTo = from || "/";
      // navigate(redirectTo, { replace: true });
      toast.success(res.message || "Account created successfully!");
    } catch (err) {
      const isValidationError = err?.data?.errors;
      if (!isValidationError) {
        const message = err?.data?.message || "Signup failed.";
        toast.error(message);
      }
    }
  }
  // function removeAvatar() {
  //   setAvatarPreview("/images/default-avatar.jpg");
  //   setUser({ ...user, avatar: "" });
  // }

  // Trigger the hidden input when the user clicks the + button or the image
  const handleIconClick = (e) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeAvatar = (e) => {
    e.stopPropagation(); // Prevent triggering the file upload when clicking 'X'
    setAvatarPreview("/images/default-avatar.jpg");
    setUser({ ...user, avatar: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      <PageTitle title="Signup" />
      <div className="form-container container">
        <div className="form-content">
          <form
            className="form"
            onSubmit={handleSubmit}
            encType="multipart/form-data"
          >
            <h2>Sign Up</h2>
            <div className="input-group">
              <div className="input-group avatar-group">
                <input
                  type="file"
                  ref={fileInputRef}
                  name="avatar"
                  accept="image/*"
                  onChange={registerDataChange}
                  style={{ display: "none" }}
                  disabled={isLoading}
                />

                <div
                  className="avatar-wrapper"
                  onClick={!user.avatar ? handleIconClick : undefined}
                >
                  <img
                    src={avatarPreview}
                    alt="Avatar Preview"
                    className="avatar"
                  />

                  {/* Dynamic Action Button */}
                  <button
                    type="button"
                    className={`avatar-action-btn-form ${
                      !user.avatar ? "add-btn" : "remove-btn"
                    }`}
                    onClick={user.avatar ? removeAvatar : handleIconClick}
                    aria-label={user.avatar ? "Remove avatar" : "Add avatar"}
                  />
                </div>
              </div>
              <input
                type="text"
                placeholder="Username"
                name="name"
                value={name}
                onChange={registerDataChange}
                disabled={isLoading}
                autoComplete="username"
              />
              {error?.data?.errors?.name && (
                <span className="error-text">{error.data.errors.name}</span>
              )}
            </div>
            <div className="input-group">
              <input
                type="email"
                placeholder="Email"
                name="email"
                value={email}
                onChange={registerDataChange}
                disabled={isLoading}
                autoComplete="email"
              />
              {error?.data?.errors?.email && (
                <span className="error-text">{error.data.errors.email}</span>
              )}
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="Password"
                name="password"
                autoComplete="new-password"
                value={password}
                onChange={registerDataChange}
                disabled={isLoading}
              />
              {error?.data?.errors?.password && (
                <span className="error-text">{error.data.errors.password}</span>
              )}
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="Confirm Password"
                name="passwordConfirm"
                autoComplete="new-password"
                value={passwordConfirm}
                onChange={registerDataChange}
                disabled={isLoading}
              />
              {error?.data?.errors?.passwordConfirm && (
                <span className="error-text">
                  {error.data.errors.passwordConfirm}
                </span>
              )}
            </div>
            <button
              className="authBtn"
              disabled={isLoading}
              style={{ pointerEvents: isLoading ? "none" : "auto" }}
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </button>
            <p className="form-links">
              Already have an account?
              <Link to={`/login?from=${encodeURIComponent(from)}`}>
                Login
              </Link>{" "}
              here
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

export default Register;
