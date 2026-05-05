import styles from "./Navbar.module.css";
import { useState } from "react";
import { IoMdSearch } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import { RiAccountCircleFill } from "react-icons/ri";
import { useEffect } from "react";
import axios from "axios";

export const Navbar = () => {
  const [user, setUser] = useState(null);
  const [value, setValue] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:3000/auth/user/me", {
          withCredentials: true,
        });

        setUser(res.data.user); // IMPORTANT
      } catch (err) {
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        <span className={styles.logo}>
          <span
            className={styles.logoIcon}
            onClick={() => {
              navigate("/");
            }}
          >
            📖
          </span>
          <span
            className={styles.logoText}
            onClick={() => {
              navigate("/");
            }}
          >
            BookABook
          </span>
        </span>
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
          {value === "" && <IoMdSearch className={styles.search} />}
          <input
            className={styles.iconBtn}
            type="text"
            placeholder="Search"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          {value !== "" && (
            <RxCross2
              className={styles.clearbtn}
              onClick={() => setValue("")}
            />
          )}

          <button
            className={styles.cartBtn}
            aria-label="Cart"
            onClick={() => {
              navigate("/cart");
            }}
          >
            <span className={styles.cart}>Cart</span>
          </button>
          {user ? (
            <RiAccountCircleFill
              className={styles.profile}
              onClick={() => {
                navigate("/profile");
              }}
            />
          ) : (
            <button
              className={styles.ctaBtn}
              onClick={() => {
                navigate("/signin");
              }}
            >
              <span className={styles.cta}></span> Sign in
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
