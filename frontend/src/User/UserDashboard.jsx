import { useNavigate } from "react-router-dom";
import "../UserStyles/UserDashboard.css";
import { useLogoutMutation } from "../services/userApi";
import { toast } from "react-toastify";
import { useState } from "react";
function UserDashboard({ user }) {
  const [logout, { isLoading }] = useLogoutMutation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function orders() {
    navigate("/orders");
  }
  function profile() {
    navigate("/account");
  }
  function dashboard() {
    navigate("/admin/dashboard");
  }
  const handleLogout = async () => {
    try {
      await logout().unwrap();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (err) {
      console.log(err);
      toast.error("Logout failed");
    }
  };

  return (
    <>
      <div
        className={`overlay ${isMenuOpen ? "show" : ""}`}
        onClick={() => setIsMenuOpen((cur) => !cur)}
      ></div>
      <div
        className="nav-dashboard-container"
        onClick={() => setIsMenuOpen((cur) => !cur)}
        // onMouseEnter={() => setIsMenuOpen((cur) => !cur)}
        // onMouseLeave={() => setIsMenuOpen((cur) => !cur)}
      >
        <div className="profile-header">
          <img
            src={user.avatar?.url || "/images/default-avatar.jpg"}
            alt="Profile Picture"
            className="profile-avatar"
          />
          <span className="profile-name">{user.name || "User"}</span>
        </div>
        {isMenuOpen && (
          <div className="menu-options">
            {user.role === "admin" && (
              <button className="menu-option-btn" onClick={dashboard}>
                Dashboard
              </button>
            )}
            <button className="menu-option-btn" onClick={orders}>
              Orders
            </button>
            <button className="menu-option-btn" onClick={profile}>
              Account
            </button>
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="menu-option-btn"
            >
              {isLoading ? "Logging out..." : "Logout"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default UserDashboard;
