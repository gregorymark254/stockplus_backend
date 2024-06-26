const express = require('express');
const app = express();
const cors = require('cors');
const corsOption = require('./Db/corsOptions');
require('dotenv').config();
const { logger } = require('./Middleware/logEvents');
const errorHandler = require('./Middleware/errorHandler');
const { sqlconnect } = require('./Db/dbConfig');
const swagger = require('./Swagger')
const users = require('./Routes/users')
const product = require('./Routes/product')
const orders = require('./Routes/orders')
const payment = require('./Routes/payments')
const mpesa = require('./Routes/mpesa')

// connection to mysqldatabase
sqlconnect();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOption));
app.use(logger);

// routes
app.get('/', (req, res) => {
    res.json({ Message: 'Stock Plus Backend Server.' });
});
app.use("/api", swagger) // swagger docs
app.use("/api", users); // users
app.use("/api", product); // products
app.use("/api", orders); // orders
app.use("/api", payment); // payments
app.use("/api", mpesa); // mpesa

// Error handler
app.use(errorHandler);

// Connetion to the server
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));