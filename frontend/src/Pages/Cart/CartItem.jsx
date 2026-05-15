import styles from "./Cart.module.css";
import { RiDeleteBin6Line } from "react-icons/ri";

export const CartItem = ({
  item,
  onDelete,
}) => {

  return (

    <div className={styles.item}>

      {/* IMAGE */}
      <img
        src={
          item.image_url ||
          item.cover
        }
        alt={item.title}
        className={styles.bookImage}
      />

      {/* DETAILS */}
      <div className={styles.details}>

        <h3 className={styles.bookTitle}>
          {item.title}
        </h3>

        <p className={styles.author}>
          by {item.author}
        </p>

        <div className={styles.transactionType}>

          {item.transaction_type ===
          "buy"
            ? "Purchase"
            : "Rental"}

        </div>

        <div className={styles.status}>

          Status:
          {" "}
          {item.status}

        </div>

      </div>

      {/* PRICE */}
      <div className={styles.priceSection}>

        <RiDeleteBin6Line
          className={styles.delete}
          onClick={() =>
            onDelete(item.id)
          }
        />

        <div className={styles.price}>

          ₹
          {Number(
            item.buy_price ||
            item.buyPrice ||
            0
          )}

        </div>

        {(item.rent_price_per_day ||
          item.rentPrice) && (
          <div
            className={styles.rentPrice}
          >
            Rent:
            ₹
            {item.rent_price_per_day ||
              item.rentPrice}
            /day
          </div>
        )}

      </div>

    </div>
  );
};