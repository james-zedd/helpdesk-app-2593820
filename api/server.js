const express = require('express');
const dotenv = require('dotenv').config();
const PORT = process.env.PORT || 5000;
const { errorHandler } = require('./middleware/errorMiddleware');
const colors = require('colors');
const connectDB = require('./config/db');

const app = express();

// database connect
connectDB();

// middleware - parse json and url encoded
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// routes -- userRoutes
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome to the helpdesk app' });
});
app.use('/api/users', require('./routes/userRoutes'));

// error handler
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server started on port ${PORT} ...`));
