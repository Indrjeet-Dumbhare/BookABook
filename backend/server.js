import 'dotenv/config';

import express from 'express'
import cors from "cors"
import cookieParser from "cookie-parser";



import usersRouters from './routes/usersRoutes.js'
import booksRouters from './routes/booksRoutes.js'
import copiesRouters from './routes/copiesRouters.js'
import imagesRouters from './routes/imagesRoutes.js'
import transactionsRouters from './routes/transactionsRoutes.js'
import authRoutes from './routes/authRoutes.js'



const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use("/auth/user", authRoutes);
app.use("/users", usersRouters);
app.use("/books", booksRouters);
app.use("/copies", copiesRouters);
app.use("/copies", imagesRouters);
app.use("/transactions",transactionsRouters);

app.listen(3000, () =>{
    console.log('Server running on http://localhost:3000')
}  )