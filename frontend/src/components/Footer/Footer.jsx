import styles from "./Footer.module.css"
export const Footer = ()=>{
  return(
    
      <div className={styles.footer}>
        <div className={styles.footerContent}>
        <a href="#" className={styles.logo}>
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
        </a>

        <div></div>

        </div>
      </div>

  )
}