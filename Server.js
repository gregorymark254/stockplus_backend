const express = require('express');
const app = express();
const cors = require('cors');
const corsOption = require('./Db/corsOptions');
require('dotenv').config();
const { sqlconnect } = require('./Db/dbConfig');
const swaggerJsDoc = require('swagger-jsdoc')
const swaggerUI = require('swagger-ui-express')
const users = require('./Routes/users')
const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";
// const options = require('./Swagger')

// connection to mysqldatabase
// sqlconnect();

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
const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Library API",
        version: "1.0.0",
        description: "A simple Express Library API",
        termsOfService: "http://example.com/terms/",
        contact: {
          name: "API Support",
          url: "http://www.exmaple.com/support",
          email: "support@example.com",
        },
      },
      servers: [
        {
          url: "https://nodejs-swagger-api.vercel.app/",
          description: "My API Documentation",
        },
      ],
    },
    // This is to call all the file
    apis: ["src/**/*.js"],
  };
  
  const specs = swaggerJsDoc(options);
  // app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));
  
  app.use(
    "/api-docs",
    swaggerUI.serve,
    swaggerUI.setup(specs, { customCssUrl: CSS_URL })
  );

// Connetion to the server
const PORT = process.env.PORT2;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));