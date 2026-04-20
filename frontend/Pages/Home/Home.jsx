import { Navbar } from "../../components/Navbar/Navbar";
import { Intro } from "../../components/Intro/Intro"; 
import { Footer } from "../../components/Footer/Footer";
import { BookGrid } from "../../components/Book/BookGrid";
export const Home = () => {
  return (
    <>
      <Navbar />
      <Intro />
      <BookGrid />
      <Footer />
    </>
  );
};
