import { Outlet, useNavigation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./MainLayout.css";
import ScrollToTop from "../components/ScrollToTop";
import { useAuth } from "../hooks/useAuth";
import Loader from "../ui/Loader";

function MainLayout() {
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
      <main className="main-content-container">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
export default MainLayout;
