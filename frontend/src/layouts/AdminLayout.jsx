import { Outlet, useNavigation } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./MainLayout.css";
import ScrollToTop from "../components/ScrollToTop";
import { useAuth } from "../hooks/useAuth";
import Loader from "../ui/Loader";

function AdminLayout() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigation = useNavigation();
  const isSwitchingRoutes = navigation.state === "loading";

  if (isLoading || isSwitchingRoutes) {
    return <Loader fullPage={true} />;
  }

  return (
    <div className="app-shell">
      <ScrollToTop />
      <Navbar isAuthenticated={isAuthenticated} user={user} />
      <main className="main-content-container" style={{ paddingTop: "0" }}>
        <Outlet />
      </main>
    </div>
  );
}
export default AdminLayout;
