import styles from "./BookGrid.module.css";
import { Post } from "./Post";
export const BookGrid = () => {
  const BOOKS = [
    {
      title: "The God of Small Things",
      author: "Arundhati Roy",
      genre: "Literary Fiction",
      coverColor: "#2D4A3E",
    },
    {
      title: "Midnight's Children",
      author: "Salman Rushdie",
      genre: "Magical Realism",
      coverColor: "#4A2D2D",
    },
    {
      title: "The White Tiger",
      author: "Aravind Adiga",
      genre: "Dark Comedy",
      coverColor: "#1E3148",
    },
    {
      title: "A Fine Balance",
      author: "Rohinton Mistry",
      genre: "Historical Fiction",
      coverColor: "#3D3014",
    },
    {
      title: "The Inheritance of Loss",
      author: "Kiran Desai",
      genre: "Contemporary",
      coverColor: "#1E3B2E",
    },
    {
      title: "The Space Between Us",
      author: "Thrity Umrigar",
      genre: "Drama",
      coverColor: "#3B1E3A",
    },
  ];
  const FILTERS = [
    "All",
    "Fiction",
    "Non-Fiction",
    "Classics",
    "Sci-Fi",
    "Mystery",
    "Self-Help",
  ];
  return (
    <>
      <section className={styles.section}>
        <div className={styles.heading}>
          <h3>Featured Books</h3>
        </div>
        <div className={styles.filters}>
          {FILTERS.map((f, i) => (
            <button
              key={f}
              className={`${styles.filterBtn} ${i === 0 ? styles.active : ""}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className={styles.grid}>
          {BOOKS.map((book) => (
            <Post key={book.title} {...book} />
          ))}
          
        </div>
       
        <div className={styles.heading}>
          {" "}
          <h3>Trending Books</h3>
        </div>
        <div className={styles.grid}>
          {BOOKS.map((book) => (
            <Post key={book.title} {...book} />
          ))}
        </div>
      </section>
    </>
  );
};
