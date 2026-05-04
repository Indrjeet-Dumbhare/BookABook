import { useNavigate } from "react-router-dom";
import { Navbar } from "../../components/Navbar/Navbar";
import styles from "./Profile.module.css";
import { FaHome } from "react-icons/fa";
import { RiAccountCircleFill } from "react-icons/ri";
import { IoBag } from "react-icons/io5";
import { IoExit } from "react-icons/io5";
import { Footer } from "../../components/Footer/Footer";
import axios from "axios";
import { useEffect, useState } from "react";

export const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/auth/user/me",
          { withCredentials: true }
        );

        setUser(res.data.user);
      } catch (err) {
        navigate("/signin");
      }
    };

    fetchUser();
  }, [navigate]);

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.menu}>
          <div className={styles.profile}>
            <div className={styles.profilePic}></div>
          </div>

          <span
            className={styles.menuItem}
            onClick={() => navigate("/")}
          >
            <FaHome className={styles.profileIcon} /> Home
          </span>

          <span
            className={styles.menuItem}
            onClick={() => navigate("/profile")}
          >
            <RiAccountCircleFill className={styles.profileIcon} />
            My Profile
          </span>

          <span className={styles.menuItem}>
            <IoBag className={styles.profileIcon} />
            My Order
          </span>

          {/* ✅ LOGOUT FIX */}
          <span
            className={styles.menuItem}
            onClick={async () => {
              await axios.post(
                "http://localhost:3000/auth/user/logout",
                {},
                { withCredentials: true }
              );
              navigate("/signin");
            }}
          >
            <IoExit className={styles.profileIcon} /> Log Out
          </span>
        </div>

        <div className={styles.details}>
          <h2> My Profile</h2>

          <div className={styles.form}>
            <form>
              <div className={styles.info}>
                <div className={styles.fnm}>
                  <h3>First Name</h3>
                  <input
                    type="text"
                    className={styles.input}
                    value={user?.full_name?.split(" ")[0] || ""}
                    placeholder="First Name"
                    readOnly
                  />
                </div>

                <div className={styles.lnm}>
                  <h3>Last Name</h3>
                  <input
                    type="text"
                    className={styles.input}
                    value={user?.full_name?.split(" ")[1] || ""}
                    placeholder="Last Name"
                    readOnly
                  />
                </div>
              </div>

              <div className={styles.info}>
                <div className={styles.fnm}>
                  <h3>Email</h3>
                  <input
                    type="text"
                    className={styles.input}
                    value={user?.email || ""}
                    placeholder="Email"
                    readOnly
                  />
                </div>

                <div className={styles.lnm}>
                  <h3>Contact Number</h3>
                  <input
                    type="text"
                    className={styles.input}
                    value={user?.phone || ""}
                    placeholder="Phone"
                    readOnly
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};