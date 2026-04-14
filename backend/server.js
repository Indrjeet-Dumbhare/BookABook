import express from 'express'
import apiRouter from './routes/bookapi.js'

const app = express();
app.use(express.json());

app.use('/api', apiRouter);

app.listen(3000, () => console.log('Server running on http://localhost:3000'))