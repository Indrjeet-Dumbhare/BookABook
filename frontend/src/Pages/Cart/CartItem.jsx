import styles from "../Cart/Cart.module.css";
import { RiDeleteBin6Line } from "react-icons/ri";

export const CartItem = ({ item, onDelete, onIncrease, onDecrease }) => {
  return (
    <div className={styles.item}>
      <img src={item.image} alt="book" />

      <div className={styles.details}>
        <h3>{item.name}</h3>

        <div className={styles.qty}>
          <button
            onClick={() => {
              if (item.quantity > 1) onDecrease(item.id);
            }}
          >
            -
          </button>

          <span>{item.quantity}</span>

          <button onClick={() => onIncrease(item.id)}>+</button>
        </div>
      </div>

      <div className={styles.priceSection}>
        <RiDeleteBin6Line
          className={styles.delete}
          onClick={() => onDelete(item.id)}
        />

        <div className={styles.price}>
          ₹{item.price} <span className={styles.old}>₹{item.oldPrice}</span>
        </div>

        <div className={styles.offer}>
          ₹{item.oldPrice - item.price} OFF
        </div>
      </div>
    </div>
  );
};