import express from 'express'
import usersRoutes from './routes/usersRoutes.js'
import booksRouters from './routes/booksRoutes.js'

const app = express();
app.use(express.json());

app.use("/users", usersRoutes);
app.use("/books", booksRouters);

app.listen(3000, () => console.log('Server running on http://localhost:3000'))