import styles from "./Post.module.css";

export const Post = ({
  title = "The God of Small Things",
  author = "Arundhati Roy",
  genre = "Literary Fiction",
  rentPrice = "49",
  buyPrice = "249",
  coverColor = "#2D4A3E",
  onRent,
  onBuy,
}) => {
  return (
    <section className={styles.card}>
      <div className={styles.cover} style={{ background: coverColor }}>
        <div className={styles.coverTitle}>{title}</div>
        <div className={styles.coverAuthor}>{author}</div>
        <div className={styles.coverShine} />
      </div>

      <div className={styles.body}>
        <span className={styles.genre}>{genre}</span>

        <h3 className={styles.title}>{title}</h3>
        <p className={styles.author}>by {author}</p>

        <div className={styles.pricing}>
          <div className={styles.priceOption}>
            <span className={styles.priceLabel}>Rent </span>
            <span className={styles.priceValue}>₹{rentPrice}<small>/week</small></span>
          </div>
          <div className={styles.priceSep} />
          <div className={styles.priceOption}>
            <span className={styles.priceLabel}>Buy</span>
            <span className={styles.priceValue}>₹{buyPrice}</span>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.rentBtn} onClick={onRent}>
            Rent now
          </button>
          <button className={styles.buyBtn} onClick={onBuy}>
            Buy
          </button>
        </div>
      </div>
    </section>
  );
};
