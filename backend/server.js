import 'dotenv/config'

import express from 'express'

import usersRouters from './routes/usersRoutes.js'
import booksRouters from './routes/booksRoutes.js'
import copiesRouters from './routes/copiesRouters.js'
import imagesRouters from './routes/imagesRoutes.js'


const app = express();
app.use(express.json());

app.use("/users", usersRouters);
app.use("/books", booksRouters);
app.use("/copies", copiesRouters);
app.use("/copies", imagesRouters);

app.listen(3000, () =>{
    console.log('Server running on http://localhost:3000')
    console.log("ACTUAL CONFIG:", {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    });
} )