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
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";

export const Profile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [myBooks, setMyBooks] = useState([]);

  useEffect(() => {
    fetchUser();
    fetchMyBooks();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/auth/user/me",
        {
          withCredentials: true,
        }
      );

      setUser(res.data.user);
    } catch (err) {
      navigate("/signin");
    }
  };

  const fetchMyBooks = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/copies/user/me",
        {
          withCredentials: true,
        }
      );

      console.log(res.data);

      setMyBooks(res.data.copies);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `http://localhost:3000/copies/${id}`,
        {
          withCredentials: true,
        }
      );

      setMyBooks((prev) =>
        prev.filter((book) => book.id !== id)
      );
    } catch (error) {
      console.error(error);
    }
  };

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
            <FaHome className={styles.profileIcon} />
            Home
          </span>

          <span
            className={styles.menuItem}
            onClick={() => navigate("/profile")}
          >
            <RiAccountCircleFill
              className={styles.profileIcon}
            />
            My Profile
          </span>

          <span className={styles.menuItem}>
            <IoBag className={styles.profileIcon} />
            My Order
          </span>

          <span
            className={styles.menuItem}
            onClick={async () => {
              await axios.post(
                "http://localhost:3000/auth/user/logout",
                {},
                {
                  withCredentials: true,
                }
              );

              navigate("/signin");
            }}
          >
            <IoExit className={styles.profileIcon} />
            Log Out
          </span>

        </div>

        <div className={styles.details}>

          <h2>My Profile</h2>

          <div className={styles.form}>

            <form>

              <div className={styles.info}>

                <div className={styles.fnm}>
                  <h3>First Name</h3>

                  <input
                    type="text"
                    className={styles.input}
                    value={
                      user?.full_name?.split(" ")[0] || ""
                    }
                    placeholder="First Name"
                    readOnly
                  />
                </div>

                <div className={styles.lnm}>
                  <h3>Last Name</h3>

                  <input
                    type="text"
                    className={styles.input}
                    value={
                      user?.full_name?.split(" ")[1] || ""
                    }
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

      {/* UPLOADED BOOKS SECTION */}

      <div className={styles.uploadSection}>

        <h2 className={styles.bookHeading}>
          My Uploaded Books
        </h2>

        <div className={styles.bookGrid}>

          {myBooks.map((book) => {

            const isLocked =
              book.status === "rented" ||
              book.status === "sold";

            return (
              <div
                key={book.id}
                className={styles.bookCard}
              >

                <img
                  src={
                    book.images?.[0] ||
                    "/default-book.png"
                  }
                  alt="book"
                  className={styles.bookImage}
                />

                <div className={styles.bookInfo}>

                  <div className={styles.bookText}>

                    <h3 className={styles.bookTitle}>
                      {book.title}
                    </h3>

                    <p className={styles.bookAuthor}>
                      {book.author}
                    </p>

                    <p className={styles.bookStatus}>
                      Status: {book.status}
                    </p>

                  </div>

                  <div className={styles.bookPrice}>

                    {book.for_sale && (
                      <span className={styles.priceTag}>
                        ₹{book.buy_price}
                      </span>
                    )}

                    {book.for_rent && (
                      <span className={styles.priceTag}>
                        ₹{book.rent_price_per_day}/day
                      </span>
                    )}

                  </div>

                </div>

                <div className={styles.bookButtons}>

                  <button
                    className={styles.editBtn}
                    disabled={isLocked}
                    onClick={() =>
                      navigate(`/edit-book/${book.id}`)
                    }
                  >
                    <FaEdit />
                    Edit
                  </button>

                  <button
                    className={styles.deleteBtn}
                    disabled={isLocked}
                    onClick={() =>
                      handleDelete(book.id)
                    }
                  >
                    <MdDelete />
                    Delete
                  </button>

                </div>

              </div>
            );
          })}

        </div>

      </div>

      <Footer />
    </>
  );
};