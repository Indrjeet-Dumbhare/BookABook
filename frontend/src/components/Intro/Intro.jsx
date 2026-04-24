import styles from "./Intro.module.css";

export const Intro = () => {
  return (
    <section className={styles.section}>
      <div className={styles.intro}>
        <div className={styles.inner}>
          <div className={styles.content}>
            <h1 className={styles.heading}>
              Your Study Partner for <br />
              <em>Affordable Books</em>
            </h1>
            <p className={styles.subtext}>
              Rent textbooks, sell old ones, or grab second-hand deals—smart
              learning starts here.
            </p>
          </div>
          <div className={styles.actions}>
            <button className={styles.secondaryBtn}>List a Book</button>
            <button className={styles.primaryBtn}>Browse Collection</button>
          </div>
        </div>
      </div>
    </section>
  );
};
