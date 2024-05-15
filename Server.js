const express = require('express');
const app = express();
const cors = require('cors');
const corsOption = require('./Db/corsOptions');
require('dotenv').config();
const { sqlconnect } = require('./Db/dbConfig');
const swagger = require('./Swagger')
const users = require('./Routes/users')

// connection to mysqldatabase
sqlconnect();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOption));

// routes
app.get('/', (req, res) => {
    res.json({ Message: 'Stock Plus Backend Server.' });
});
app.use("/api", swagger); //api documentation
app.use("/api/v1", users); // users

// Connetion to the server
const PORT = process.env.PORT2;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));