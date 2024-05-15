const express = require('express');
const app = express();
const cors = require('cors');
const corsOption = require('./Db/corsOptions');
require('dotenv').config();
const { sqlconnect } = require('./Db/dbConfig');
const options = require('./Swagger')
const swaggerJSDoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
const users = require('./Routes/users')

// connection to mysqldatabase
sqlconnect();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOption));

// routes
/**
 * @swagger
 * /:
 *   get:
 *     summary: Get homepage message
 *     description: Retrieve the message displayed on the homepage of the Stock Plus Backend Server.
 *     responses:
 *       200:
 *         description: A JSON object containing the homepage message.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Message:
 *                   type: string
 *                   description: The message displayed on the homepage.
 *                   example: Stock Plus Backend Server.
 */
app.get('/', (req, res) => {
    res.json({ Message: 'Stock Plus Backend Server.' });
});
const swaggerSpec = swaggerJSDoc(options)
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use("/api", users); // users

// Connetion to the server
const PORT = process.env.PORT2;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));