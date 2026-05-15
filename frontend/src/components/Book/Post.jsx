import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Post.module.css";

export const Post = ({
  title,
  author,
  genre,
  rentPrice,
  buyPrice,
  coverColor,
  cover,
  forRent,
  forSale,
  bookCopyId,
}) => {
  const navigate = useNavigate();

  const handleTransaction = async (type) => {
    console.log("bookCopyId:", bookCopyId)
    const body = {
      book_copy_id: bookCopyId,
      transaction_type: type,
      ...(type === "rent" && {
        rent_start_date: new Date().toISOString().split("T")[0],
        rent_end_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      }),
    };

    try {
      const { data } = await axios.post(
        "http://localhost:3000/transactions",
        body,
        { withCredentials: true }
      );

      navigate("/cart", {
        state: { transaction_id: data.transaction.id },
      });

    } catch (err) {
      alert(err.response?.data?.error || "Failed to create transaction.");
      console.error(err);
    }
  };

  return (
    <section className={styles.card}>
      <div className={styles.cover} style={{ background: coverColor }}>
        <img className={styles.img} src={cover} alt={title} />
        <div className={styles.coverShine} />
      </div>

      <div className={styles.body}>
        <span className={styles.genre}>{genre}</span>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.author}>by {author}</p>

        <div className={styles.pricing}>
          <div className={styles.priceOption}>
            <span className={styles.priceLabel}>Rent</span>
            <span className={styles.priceValue}>
              ₹{rentPrice}<small>/week</small>
            </span>
          </div>
          <div className={styles.priceSep} />
          <div className={styles.priceOption}>
            <span className={styles.priceLabel}>Buy</span>
            <span className={styles.priceValue}>₹{buyPrice}</span>
          </div>
        </div>

        <div className={styles.actions}>
          {forRent && (
            <button className={styles.rentBtn} onClick={() => handleTransaction("rent")}>
              Rent now
            </button>
          )}
          {forSale && (
            <button className={styles.buyBtn} onClick={() => handleTransaction("buy")}>
              Buy
            </button>
          )}
        </div>
      </div>
    </section>
  );
};