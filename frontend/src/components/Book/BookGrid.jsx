import { useState, useEffect } from "react";
import styles from "./BookGrid.module.css";
import { Post } from "./Post";

export const BookGrid = () => {
  const [copies, setCopies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const FILTERS = [
    "All",
    "Fiction",
    "Non-Fiction",
    "Classics",
    "Sci-Fi",
    "Mystery",
    "Self-Help",
  ];

  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    const fetchCopies = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("http://localhost:3000/copies");
        if (!res.ok) throw new Error("Failed to fetch books");
        const data = await res.json();
        setCopies(data.copies.filter((copy) => copy.status === "available"));
  
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCopies();
  }, []);

  // Filter copies by genre based on active filter
  const filteredCopies =
    activeFilter === "All"
      ? copies
      : copies.filter((copy) =>
          copy.genre?.toLowerCase().includes(activeFilter.toLowerCase())
        );

  // For trending: sort by most recently added (assuming id is sequential)
  const trendingCopies = [...copies].sort((a, b) => b.id - a.id).slice(0, 6);

  if (loading) {
    return (
      <section className={styles.section}>
        <p className={styles.status}>Loading books...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.section}>
        <p className={styles.status}>Error: {error}</p>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      {/* Featured Books */}
      <div className={styles.heading}>
        <h3>Featured Books</h3>
      </div>

      <div className={styles.filters}>
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`${styles.filterBtn} ${activeFilter === f ? styles.active : ""}`}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {filteredCopies.length > 0 ? (
          filteredCopies.map((copy) => (
            <Post
              key={copy.id}
              title={copy.title}
              bookCopyId={copy.id}  
              author={copy.author}
              genre={copy.genre}
              cover={copy.images?.[0] ?? "https://placehold.co/200x300?text=No+Cover"}
              coverColor="#ffffff"
              forRent={copy.for_rent}
              forSale={copy.for_sale}
              rentPrice={copy.rent_price_per_day}
              buyPrice={copy.buy_price}
              condition={copy.condition}
              city={copy.location_city}
            />
          ))
        ) : (
          <p className={styles.status}>No books found for this filter.</p>
        )}
      </div>

      {/* Trending Books */}
      <div className={styles.heading}>
        <h3>Trending Books</h3>
      </div>

      <div className={styles.grid}>
        {trendingCopies.map((copy) => (
          <Post
            key={`trending-${copy.id}`}
            title={copy.title}
            bookCopyId={copy.id} 
            author={copy.author}
            genre={copy.genre}
            cover={copy.images?.[0] ?? "https://placehold.co/200x300?text=No+Cover"}
            coverColor="#ffffff"
            forRent={copy.for_rent}
            forSale={copy.for_sale}
            rentPrice={copy.rent_price_per_day}
            buyPrice={copy.buy_price}
            condition={copy.condition}
            city={copy.location_city}
          />
        ))}
      </div>
    </section>
  );
};
