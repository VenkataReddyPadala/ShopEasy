import { useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import "../componentStyles/Navbar.css";
import "../pageStyles/Search.css";
import UserDashboard from "../User/UserDashboard";
import { useGetMyCartQuery } from "../services/cartApi";
function Navbar({ isAuthenticated, user }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef(null);
  const toggleMenu = () => setIsMenuOpen((cur) => !cur);
  const toggleSearch = () => setIsSearchOpen((cur) => !cur);
  const { data: cart } = useGetMyCartQuery();
  const numOfItems = cart?.data?.items.length;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/products");
      setSearchQuery("");
    }
    toggleSearch();
    setSearchQuery("");
  };
  useEffect(() => {
    const query = searchParams.get("search");
    const isProductsPage = location.pathname === "/products";

    if (isProductsPage && query) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsSearchOpen(true);
      setSearchQuery(query);
    } else {
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  }, [location.pathname, searchParams]);
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/" onClick={() => setIsMenuOpen(false)}>
            ShopEasy
          </Link>
        </div>
        <div className={`navbar-links ${isMenuOpen ? "active" : ""}`}>
          <ul>
            <li>
              <NavLink to="/" onClick={() => setIsMenuOpen(false)}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/products">Products</NavLink>
            </li>
            <li>
              <NavLink to="/about">About Us</NavLink>
            </li>
            <li>
              <NavLink to="/contact">Contact Us</NavLink>
            </li>
          </ul>
        </div>
        <div className="navbar-icons">
          <div className="search-container">
            <form
              className={`search-form ${isSearchOpen ? "active" : ""}`}
              onSubmit={handleSearchSubmit}
            >
              <input
                type="text"
                className="search-input"
                placeholder="search products.."
                value={searchQuery}
                ref={inputRef}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                className="search-icon"
                onClick={toggleSearch}
                type="button"
              >
                <SearchIcon focusable="false" />
              </button>
            </form>
          </div>
          <div className="cart-container">
            <NavLink to="/cart">
              <ShoppingCartIcon className="icon" />
              {numOfItems > 0 && (
                <span className="cart-badge">{numOfItems}</span>
              )}
            </NavLink>
          </div>

          {!isAuthenticated && (
            <NavLink to="/signup" className="register-link">
              <PersonAddIcon className="icon" />
            </NavLink>
          )}
          {isAuthenticated && (
            <div>
              <UserDashboard user={user} />
            </div>
          )}
          <div className="navbar-hamburger" onClick={toggleMenu}>
            {isMenuOpen ? (
              <CloseIcon className="icon" />
            ) : (
              <MenuIcon className="icon" />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
