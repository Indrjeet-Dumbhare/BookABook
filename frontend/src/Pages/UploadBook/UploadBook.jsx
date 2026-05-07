import { useState } from "react";
import axios from "axios";
import { Navbar } from "../../components/Navbar/Navbar";
import { Footer } from "../../components/Footer/Footer";
import styles from "./UploadBook.module.css";

export const UploadBook = () => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [genre, setGenre] = useState("");
  const [language, setLanguage] = useState("");
  const [published_year, setPublished_year] = useState("");
  const [publisher, setPublisher] = useState("");

  const [condition, setCondition] = useState("");
  const [buy_price, setBuy_price] = useState("");
  const [rent_price_per_day, setRent_price_per_day] = useState("");
  const [max_rent_days, setMax_rent_days] = useState("");
  const [location_city, setLocation_city] = useState("");

  const [for_rent, setFor_rent] = useState(false);
  const [for_sale, setFor_sale] = useState(false);

  const [images, setImages] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // STEP 1 → CREATE COPY
      const copyRes = await axios.post(
        "http://localhost:3000/copies/copies",
        {
          title,
          author,
          isbn,
          genre,
          language,
          published_year,
          publisher,
          condition,
          buy_price,
          rent_price_per_day,
          max_rent_days,
          location_city,
          for_rent,
          for_sale,
        },
        {
          withCredentials: true,
        },
      );

      const copyId = copyRes.data.copy.id;

      // STEP 2 → UPLOAD IMAGES
      if (Object.keys(images).length > 0) {
        const formData = new FormData();

        Object.values(images).forEach((image) => {
          if (image) {
            formData.append("images", image);
          }
        });

        await axios.post(
          `http://localhost:3000/copies/${copyId}/images`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
          },
        );
      }

      alert("Book uploaded successfully ✅");
    } catch (error) {
      console.error(error);
      alert("Failed to upload book");
    }
  };

  return (
    <>
      <Navbar />

      <div className={styles.container}>
        <div className={styles.inner}>
          <h1 className={styles.heading}>List Your Book</h1>

          <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <input
                type="text"
                placeholder="Book Title"
                className={styles.input}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <input
                type="text"
                placeholder="Author"
                className={styles.input}
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />

              <input
                type="text"
                placeholder="ISBN"
                className={styles.input}
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
              />

              <input
                type="text"
                placeholder="Genre"
                className={styles.input}
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              />

              <input
                type="text"
                placeholder="Language"
                className={styles.input}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              />

              <input
                type="number"
                placeholder="Published Year"
                className={styles.input}
                value={published_year}
                onChange={(e) => setPublished_year(e.target.value)}
              />

              <input
                type="text"
                placeholder="Publisher"
                className={styles.input}
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
              />

              <input
                type="text"
                placeholder="Condition"
                className={styles.input}
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              />

              <input
                type="number"
                placeholder="Buy Price"
                className={styles.input}
                value={buy_price}
                onChange={(e) => setBuy_price(e.target.value)}
              />

              <input
                type="number"
                placeholder="Rent Price Per Day"
                className={styles.input}
                value={rent_price_per_day}
                onChange={(e) => setRent_price_per_day(e.target.value)}
              />

              <input
                type="number"
                placeholder="Max Rent Days"
                className={styles.input}
                value={max_rent_days}
                onChange={(e) => setMax_rent_days(e.target.value)}
              />

              <input
                type="text"
                placeholder="City"
                className={styles.input}
                value={location_city}
                onChange={(e) => setLocation_city(e.target.value)}
              />
            </div>

            <div className={styles.checkboxContainer}>
              <label>
                <input
                  type="checkbox"
                  checked={for_rent}
                  onChange={() => setFor_rent(!for_rent)}
                />
                For Rent
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={for_sale}
                  onChange={() => setFor_sale(!for_sale)}
                />
                For Sale
              </label>
            </div>

            <div className={styles.uploadSection}>
              <h3 className={styles.uploadHeading}>Upload Book Images</h3>

              <p className={styles.uploadText}>
                Please upload clear images of:
              </p>

              <div className={styles.imageFields}>
                <div className={styles.imageRow}>
                  <span className={styles.imageLabel}>Front Cover</span>
                  <label className={styles.uploadBtn}>
                    Add Photo
                    <input
                      type="file"
                      hidden
                      onChange={(e) =>
                        setImages((prev) => ({
                          ...prev,
                          front: e.target.files[0],
                        }))
                      }
                    />
                  </label>
                </div>

                <div className={styles.imageRow}>
                  <span className={styles.imageLabel}>Back Cover</span>
                  <label className={styles.uploadBtn}>
                    Add Photo
                    <input
                      type="file"
                      hidden
                      onChange={(e) =>
                        setImages((prev) => ({
                          ...prev,
                          back: e.target.files[0],
                        }))
                      }
                    />
                  </label>
                </div>

                <div className={styles.imageRow}>
                  <span className={styles.imageLabel}>Title Page</span>
                  <label className={styles.uploadBtn}>
                    Add Photo
                    <input
                      type="file"
                      hidden
                      onChange={(e) =>
                        setImages((prev) => ({
                          ...prev,
                          title: e.target.files[0],
                        }))
                      }
                    />
                  </label>
                </div>

                <div className={styles.imageRow}>
                  <span className={styles.imageLabel}>Inside Pages</span>
                  <label className={styles.uploadBtn}>
                    Add Photo
                    <input
                      type="file"
                      hidden
                      onChange={(e) =>
                        setImages((prev) => ({
                          ...prev,
                          inside: e.target.files[0],
                        }))
                      }
                    />
                  </label>
                </div>

                <div className={styles.imageRow}>
                  <span className={styles.imageLabel}>
                    Damaged Areas (if any)
                  </span>
                  <label className={styles.uploadBtn}>
                    Add Photo
                    <input
                      type="file"
                      hidden
                      onChange={(e) =>
                        setImages((prev) => ({
                          ...prev,
                          damaged: e.target.files[0],
                        }))
                      }
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className={styles.btncontainer} >
              <button className={styles.button} type="submit">
              Upload Book
            </button>
            </div>
            
          </form>
        </div>
      </div>

      <Footer />
    </>
  );
};
