import styles from "./Navbar.module.css";
export const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        <a href="#" className={styles.logo}>
          <span className={styles.logoIcon}>📖</span>
          <span className={styles.logoText}>Book</span>
        </a>
        <ul className={styles.navLinks}>
          <li>
            <a href="#" className={styles.navLink}>
              Browse
            </a>
          </li>
          <li>
            <a href="#" className={styles.navLink}>
              Rent
            </a>
          </li>
          <li>
            <a href="#" className={styles.navLink}>
              Sell
            </a>
          </li>
          <li>
            <a href="#" className={styles.navLink}>
              About
            </a>
          </li>
        </ul>
        <div className={styles.navActions}>
          <input className={styles.iconBtn} type="Search"></input>
          <button className={styles.cartBtn} aria-label="Cart">
            <span className={styles.cart}>Cart</span> 
          </button>
          <button className={styles.ctaBtn}>
            <span className={styles.cta}></span> Sign in</button>
        </div>
      </div>
    </nav>
  );
};
