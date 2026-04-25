import styles from "./Navbar.module.css";
import { useState } from "react";
import { IoMdSearch } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";

export const Navbar = () => {
  const [value, setValue] = useState("");
  const navigate = useNavigate();

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
          
          {value==="" && <IoMdSearch className={styles.search} />}
          <input className={styles.iconBtn} type="text" placeholder="Search" value={value} onChange={(e)=>setValue(e.target.value)}></input>
          {value!=="" && <RxCross2 className={styles.clearbtn} onClick={()=> setValue("")} />}

          <button className={styles.cartBtn} aria-label="Cart">
            <span className={styles.cart}>Cart</span> 
          </button>
          <button className={styles.ctaBtn} onClick={()=>{navigate("/signin")}}>
            <span className={styles.cta}></span> Sign in</button>
        </div>
      </div>
    </nav>
  );
};
