import { useLogoutMutation } from "../services/userApi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../UserStyles/UserDashboard.css";

const Logout = () => {
  const [logout, { isLoading }] = useLogoutMutation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="menu-option-btn"
    >
      {isLoading ? "Logging out..." : "Logout"}
    </button>
  );
};

export default Logout;
