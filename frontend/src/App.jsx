import { BookGrid } from '../../rental-book-v1/src/components/BookGrid'
import './App.css'
import { Footer } from './components/Footer'
import { Intro } from './components/Intro'
import { Navbar } from './components/Navbar'

function App() {
  return (
    <>
      <Navbar />
      <Intro />
      <BookGrid />
      <Footer />
    </>
  )
}

export default App
