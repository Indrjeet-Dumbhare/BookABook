import styles from "./BookGrid.module.css";
import { Post } from "./Post";
import book1 from "../../assets/The God of Small Things.jpg"
import book2 from "../../assets/Midnight's Children.png"
import book3 from "../../assets/The White Tiger.jpg"
import book4 from "../../assets/A Fine Balance.jpeg"
import book5 from "../../assets/The Inheritance of Loss.jpg"
import book6 from "../../assets/The Space Between Us.jpg"

export const BookGrid = () => {
  
  const BOOKS = [
    {
      title: "The God of Small Things",
      author: "Arundhati Roy",
      genre: "Literary Fiction",
      coverColor: "#ffffff",
      cover: book1,
    },
    {
      title: "Midnight's Children",
      author: "Salman Rushdie",
      genre: "Magical Realism",
      coverColor: "#ffffff",
      cover: book2,
    },
    {
      title: "The White Tiger",
      author: "Aravind Adiga",
      genre: "Dark Comedy",
      coverColor: "#ffffff",
      cover: book3,
    },
    {
      title: "A Fine Balance",
      author: "Rohinton Mistry",
      genre: "Historical Fiction",
      coverColor: "#ffffff",
      cover: book4,
    },
    {
      title: "The Inheritance of Loss",
      author: "Kiran Desai",
      genre: "Contemporary",
      coverColor: "#ffffff",
      cover: book5,
    },
    {
      title: "The Space Between Us",
      author: "Thrity Umrigar",
      genre: "Drama",
      coverColor: "#ffffff",
      cover: book6,
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
