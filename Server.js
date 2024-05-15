const express = require('express');
const app = express();
const cors = require('cors');
const corsOption = require('./Db/corsOptions');
require('dotenv').config();
const bodyParser = require('body-parser')
const morgan = require('morgan')
const { sqlconnect } = require('./Db/dbConfig');
const swaggerJsDoc = require('swagger-jsdoc')
const swaggerUI = require('swagger-ui-express')
const users = require('./Routes/users')

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Stock Plus Api',
            version: '1.0.0',
            description: 'Stock Plus Backend server'
        },
        servers: [
            {
                url: 'https://stockplus-backend.vercel.app'
            }
        ],
        components: {
            schemas: {
                EmailAndPassword: {
                    type: 'object',
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email'
                        },
                        password: {
                            type: 'string',
                            format: 'password'
                        }
                    },
                    required: ['email', 'password']
                }
            },
            securitySchemes: {
                OAuth2PasswordBearer: {
                    type: 'oauth2',
                    flows: {
                        password: {
                            tokenUrl: '/api/v1/login',
                            scopes: {}
                        }
                    }
                }
            }
        },
        security: [
            {
                OAuth2PasswordBearer: []
            }
        ]
    },
    apis:  ["src/**/*.js"]
};

// connection to mysqldatabase
// sqlconnect();

// middlewares
app.use(bodyParser.json());
app.use(morgan("dev"));
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
const swaggerSpec = swaggerJsDoc(options)
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec))
app.use("/api", users); // users

// Connetion to the server
const PORT = process.env.PORT2;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));