const router = require("express").Router()
const swaggerJSDoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')

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
                url: 'http://localhost:4500'
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
                bearerAuth: {
                    type: 'http',
                    scheme: 'Bearer',
                    description: 'Copy "Bearer: {token}" in the Authorization header use the docs.'
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: ['./Routes/*', './Server.js']
};

const swaggerSpec = swaggerJSDoc(options)
router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

module.exports = router