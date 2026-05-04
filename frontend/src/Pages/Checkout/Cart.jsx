import styles from "./Cart.module.css";
import { RxCross2 } from "react-icons/rx";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useNavigate } from "react-router-dom";


export const Cart = () => {
  const navigate = useNavigate();
  

  return (
    <div className={styles.cart}>

      {/* Header */}
      <div className={styles.header}>
        <h2>My Cart <span className={styles.count}>2</span></h2>
        <RxCross2 className={styles.close} onClick={()=>{
            navigate("/")
          }} />
      </div>

      {/* Item */}
      <div className={styles.item}>
        <img src="https://via.placeholder.com/80" alt="book" />

        <div className={styles.details}>
          <h3>A Little Life</h3>

          <div className={styles.qty}>
            <button>-</button>
            <span>1</span>
            <button>+</button>
          </div>
        </div>

        <div className={styles.priceSection}>
          <RiDeleteBin6Line className={styles.delete}  />

          <div className={styles.price}>
            ₹564 <span className={styles.old}>₹699</span>
          </div>

          <div className={styles.offer}>₹135 OFF</div>
        </div>
      </div>

      {/* Divider */}
      <hr />

      {/* Another Item (copy same block) */}


    </div>
  );
};