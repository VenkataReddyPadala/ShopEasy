import { Phone, Mail, GitHub, LinkedIn, Instagram } from "@mui/icons-material";
import "../componentStyles/Footer.css";
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section contact">
          <h3>Contact Us</h3>
          <p>
            <Phone fontSize="small" />
            Phone: +918558763366
          </p>
          <p>
            <Mail fontSize="small" />
            Email: temp@gmail.com
          </p>
        </div>
        <div className="footer-section social">
          <h3>Follow Us</h3>
          <div className="social-links">
            <a href="#" target="_blank">
              <GitHub className="social-icon" />
            </a>
            <a href="#" target="_blank">
              <LinkedIn className="social-icon" />
            </a>
            <a href="#" target="_blank">
              <Instagram className="social-icon" />
            </a>
          </div>
        </div>
        <div className="footer-section about">
          <h3>About</h3>
          <p>
            Discover a wide range of products at unbeatable prices. Shop your
            favorites, explore new arrivals, and enjoy a seamless online
            shopping experience all in one place.
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} ShopEasy. All rights reserved</p>
      </div>
    </footer>
  );
}

export default Footer;
