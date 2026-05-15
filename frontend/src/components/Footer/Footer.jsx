import styles from "./Footer.module.css";
import { useNavigate } from "react-router-dom";

export const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        
        {/* Left Section */}
        <div className={styles.brandSection}>
          <div
            className={styles.brand}
            onClick={() => navigate("/")}
          >
            <span className={styles.logoIcon}>📖</span>

            <div>
              <h2 className={styles.logoText}>BookABook</h2>

              <p className={styles.tagline}>
                A modern platform to rent, buy and resell books
                easily for students and readers.
              </p>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className={styles.linksWrapper}>
          
          <div className={styles.footerSection}>
            <h3>Platform</h3>

            <span onClick={() => navigate("/")}>Home</span>
            <span onClick={() => navigate("/books")}>
              Browse Books
            </span>
            <span onClick={() => navigate("/cart")}>Cart</span>
            <span onClick={() => navigate("/orders")}>
              Orders
            </span>
          </div>

          <div className={styles.footerSection}>
            <h3>Services</h3>

            <span>Book Rentals</span>
            <span>Book Reselling</span>
            <span>Secure Payments</span>
            <span>Student Marketplace</span>
          </div>

          <div className={styles.footerSection}>
            <h3>Contact</h3>

            <span>support@bookabook.com</span>
            <span>+91 9876543210</span>
            <span>Pune, Maharashtra</span>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.bottomBar}>
        <p>
          © {new Date().getFullYear()} BookABook. All rights reserved.
        </p>

        <div className={styles.bottomLinks}>
          <span>Privacy Policy</span>
          <span>Terms</span>
          <span>Help Center</span>
        </div>
      </div>
    </footer>
  );
};