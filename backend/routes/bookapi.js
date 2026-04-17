import express from 'express'
import pool from "../utils/db.js"

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// ── root 
router.get('/', (req, res) => {

  res.json({ message: 'Welcome to Book Rent API' })
})

// ── users 


// ── books 


// ── book copies ────────────────────────────────────────────────────────────────

  

// ── transactions ───────────────────────────────────────────────────────────────

router.get('/transactions', async (req, res) => {
  
})

router.get('/transactions/:id', async (req, res) => {
  
})

router.post('/transactions/buy', async (req, res) => {

})

router.post('/transactions/rent', async (req, res) => {
  
})

router.patch('/transactions/:id/return', async (req, res) => {
  
})

router.patch('/transactions/:id/cancel', async (req, res) => {
  
})

// ── reviews ────────────────────────────────────────────────────────────────────

router.get('/books/:id/reviews', async (req, res) => {
  
})

router.post('/books/:id/reviews', async (req, res) => {
  
})

router.delete('/reviews/:id', async (req, res) => {
  
})

// ── start ──────────────────────────────────────────────────────────────────────
export default router;